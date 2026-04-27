// ── Canvas ────────────────────────────────────────────────────────────────────
const CANVAS_W   = 2100;
const CANVAS_H   = 5400;
const NODE_W     = 248;
const NODE_H_EST = 172; // for edge anchor computation only

// ── Type → display meta ───────────────────────────────────────────────────────
const TYPE_META = {
  input:    { label: 'Input',             color: '#1d4ed8', cssVar: 'input'  },
  data:     { label: 'BQ Query — Auto',   color: '#0f766e', cssVar: 'data'   },
  ref:      { label: 'BQ Query — Ref',    color: '#0369a1', cssVar: 'ref'    },
  script:   { label: 'Script / Process',  color: '#6d28d9', cssVar: 'script' },
  decision: { label: 'Decision',          color: '#b45309', cssVar: 'dec'    },
  analysis: { label: 'Analysis',          color: '#c2410c', cssVar: 'ana'    },
  tool:     { label: 'Tool Call',         color: '#be123c', cssVar: 'tool'   },
  output:   { label: 'Output / File',     color: '#15803d', cssVar: 'out'    },
  file:     { label: 'Reference File',    color: '#0c4a6e', cssVar: 'file'   },
  eval:     { label: 'Evaluation',        color: '#4338ca', cssVar: 'eval'   },
};

// ── Node definitions ──────────────────────────────────────────────────────────
const NODES = [

  // ══ PHASE 1: INPUT ══
  {
    id: 'user-input', type: 'input', icon: '⌨️',
    label: 'User Input', sublabel: 'Skill trigger — /cvr-rca',
    x: 780, y: 70, phase: 'Input',
    badge: null,
    inputs: [],
    outputs: ['ce_id', 'pre_start', 'pre_end', 'post_start', 'post_end'],
    condition: 'Always fires — entry point.\nDefaults to prior full week vs current week if no dates given.',
    description: 'User invokes /cvr-rca. Immediately reads context.md, hypothesis.md, actions.md, and report_structure.md (the "Before you begin" block). Opens the investigation transcript. Validates CE ID + date inputs, sets default date windows if omitted, then kicks off the baseline pipeline.',
  },

  // ══ PHASE 2: BQ AUTO — SERIAL ══
  {
    id: 'q0-meta', type: 'data', icon: '🗄️',
    label: 'Q0 — CE Metadata', sublabel: 'BQ Auto · Serial · First',
    x: 780, y: 355, phase: 'Data Collection',
    badge: 'serial',
    inputs: ['ce_id', 'post_start', 'post_end'],
    outputs: ['combined_entity_name', 'combined_entity_type', 'market', 'country', 'top_page_url'],
    condition: 'Always fires first — serial, no dependencies.',
    description: 'Fetches CE name, type, market, country from dim_combined_entities. Also finds the most-visited page URL in the post period (used as the clickable header link in the report). Runs before Q1 to populate the report header.',
  },
  {
    id: 'q1-base', type: 'data', icon: '🗄️',
    label: 'Q1 — Base Funnel', sublabel: 'BQ Auto · Serial · After Q0',
    x: 780, y: 635, phase: 'Data Collection',
    badge: 'serial',
    inputs: ['ce_id', 'pre/post date ranges'],
    outputs: ['users_lp', 'users_select', 'users_checkout', 'users_order_attempted', 'users_order_completed', 'mb_ho', 'channel', 'period'],
    condition: 'Always fires after Q0 completes.\nDetermines primary_mbho for Q3 and Q7.',
    description: 'Source: mixpanel_user_page_funnel_progression. Groups by MB/HO × Paid/Organic × period. Always COUNT(DISTINCT user_id). Excludes PERFORMANCE_MAX channel. The primary_mbho (segment with highest post-period LP traffic) is derived here and passed to Q3 and Q7.',
  },

  // ══ PHASE 3: BQ AUTO — PARALLEL ══
  {
    id: 'q3-trend', type: 'data', icon: '📈',
    label: 'Q3 — Daily Trend', sublabel: 'BQ Auto · Parallel with Q7',
    x: 510, y: 915, phase: 'Data Collection',
    badge: 'parallel',
    inputs: ['ce_id', 'pre/post dates', 'primary_mbho'],
    outputs: ['event_date', 'period', 'lp2s_rate/day', 's2c_rate/day', 'c2o_rate/day', 'users_lp/day'],
    condition: 'Always fires in parallel with Q7, after Q1.\nFiltered to primary_mbho only.',
    description: 'Filtered to primary MB/HO segment. Returns daily funnel rates for the pre and post windows. Rates are pre-computed as SAFE_DIVIDE in BigQuery. Powers the daily trend chart and is the primary input for Q3 (sudden vs gradual vs seasonal) pattern recognition.',
  },
  {
    id: 'q7-ly', type: 'data', icon: '📅',
    label: 'Q7 — 90-day + Last Year', sublabel: 'BQ Auto · Parallel with Q3',
    x: 1070, y: 915, phase: 'Data Collection',
    badge: 'parallel',
    inputs: ['ce_id', 'post_end', 'CE-level (no MB/HO filter)'],
    outputs: ['90-day current series', 'LY series (shifted +364d)', 'structural_delta_cvr', 'pre_period_healthy'],
    condition: 'Always fires in parallel with Q3, after Q1.\nCE-level — no MB/HO filter.',
    description: 'Two series in one query: current (90 days ending at post_end) and LY (same window −364 days, then shifted +364 so x-axis aligns). Computes structural_delta_cvr = current_delta − ly_delta. Also flags pre_period_healthy: TRUE if pre avg CVR ≥ lookback_60d avg × 0.95.',
  },

  // ══ PHASE 4: SCRIPT ══
  {
    id: 'aggregate', type: 'script', icon: '⚙️',
    label: 'aggregate.py → summary.json', sublabel: 'Shapley · Mix · Trend · LY context',
    x: 780, y: 1195, phase: 'Processing',
    badge: null,
    inputs: ['stage0.json', 'stage1.json', 'stage3.json', 'stage7.json'],
    outputs: ['headline rates + deltas', 'shapley{LP2S/S2C/C2O}', 'pct_contribution', 'significant_steps', 'mbho_mix[]', 'channel_mix[]', 'mix_dominance', 'c2o_sub{c2a/a2o}', 'trend_context{series/structural_delta/pre_period_healthy}'],
    condition: 'Always fires after both Q3 and Q7 complete.',
    description: 'Runs helpers.py shapley() over 6 permutations of (LP2S, S2C, C2O) — contributions sum exactly to ΔCVR. Runs helpers.py mix() for MB/HO and Paid/Organic: mix_effect = Δshare × pre_rate, conversion_effect = pre_share × Δrate. Flags mix_dominance.is_dominant if either exceeds 50% of |ΔCVR|. Writes single summary.json Claude reads for all downstream decisions.',
  },

  // ══ PHASE 5: THREE MANDATORY QUESTIONS ══
  {
    id: 'mix-decision', type: 'decision', icon: '⚖️',
    label: 'Q1: Is Mix Dominant?', sublabel: 'Routing problem vs funnel problem',
    x: 780, y: 1495, phase: 'Decision',
    badge: null,
    inputs: ['mix_dominance.mbho_mix_share', 'mix_dominance.channel_mix_share', 'mix_dominance.is_dominant'],
    outputs: ['is_dominant: bool → branch'],
    condition: 'Always fires after aggregate.py.\nThreshold: either mix share > 50% of |ΔCVR|.',
    description: 'First mandatory question. If MB/HO traffic share shifted OR Paid/Organic shifted enough to explain >50% of ΔCVR, the story is routing (marketing), not funnel (product). Both branches are mutually exclusive. Mix-dominant → short-circuit to Q6 + Mix Root Cause. Not dominant → proceed to Q2 and Q3.',
  },

  // ══ BRANCH A: MIX DOMINANT ══
  {
    id: 'q6-urls', type: 'ref', icon: '🗄️',
    label: 'Q6 — URL Traffic', sublabel: 'BQ Reference · Mix path',
    x: 200, y: 1790, phase: 'Data Collection',
    badge: null,
    inputs: ['ce_id', 'pre/post dates', 'primary_mbho'],
    outputs: ['page_url', 'page_type', 'users_lp pre/post', 'lp2s_rate pre/post', 'Δ_rate', 'anomaly_flag'],
    condition: 'ONLY IF mix_dominance.is_dominant = true\nOR locus is URL-concentrated (any path).',
    description: 'Top 20 URLs by pre-period LP traffic, min 50 users. Computes delta_abs and delta_rel per step per URL. Flags anomalies where rate dropped ≥15% relative AND ≥3pp absolute. Reveals which specific pages lost/gained volume — identifies LP routing error, campaign landing page change, or specific experience collapse.',
  },
  {
    id: 'mix-root', type: 'analysis', icon: '🔍',
    label: 'Mix Root Cause', sublabel: 'Campaign / routing / budget analysis',
    x: 80, y: 2090, phase: 'Analysis',
    badge: null,
    inputs: ['mbho_mix[]', 'channel_mix[]', 'mix_dominance', 'Q6 URL results'],
    outputs: ['root cause narrative', 'DRI: Marketing / Performance Marketing', 'action items'],
    condition: 'ONLY IF mix_dominance.is_dominant = true.',
    description: 'Identifies why traffic routing shifted: paid campaign paused/budget reallocated (HO share drops), LP routing error in campaigns (language/geo campaigns pointing to wrong page), or seasonal organic MB spike. DRI is always Marketing or Performance Marketing. Feeds directly into Section 1 callout and Section 2 action card.',
  },

  // ══ BRANCH B: FUNNEL — Q2 ══
  {
    id: 'step-decision', type: 'decision', icon: '📊',
    label: 'Q2: Which Step Primary?', sublabel: 'LP2S · S2C · C2O — Shapley ≥ 30%',
    x: 1100, y: 1790, phase: 'Decision',
    badge: null,
    inputs: ['shapley.shapley{LP2S/S2C/C2O}', 'shapley.pct_contribution', 'shapley.significant_steps'],
    outputs: ['primary_driver', 'significant_steps[]'],
    condition: 'ONLY IF mix_dominance.is_dominant = false.',
    description: 'Second mandatory question. A step is significant if |contribution / ΔCVR| ≥ 0.30. Multiple steps can be significant simultaneously. primary_driver = step with largest |Shapley value|. Steps below threshold are noted as "not the story" in the ruled-out section of the report.',
  },
  {
    id: 'lp2s-driver', type: 'analysis', icon: '🔬',
    label: 'LP2S Driver Analysis', sublabel: 'Listing Page → Select',
    x: 415, y: 2090, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.LP2S contribution', 'headline.delta.lp2s', 'trend shape', 'dimension cuts'],
    outputs: ['mechanism (pricing/UX/supply/competition)', 'onset: sudden or gradual', 'DRI hypothesis'],
    condition: 'ONLY IF "LP2S" in significant_steps.',
    description: 'Sudden onset: pricing increase, LP format deploy, campaign routing error, ranking change. Gradual drift: supply thinning, SIS cap, competitive pressure, content decay, assortment drift. Typical DRI: Product, BDM, Performance Marketing, or Content depending on mechanism.',
  },
  {
    id: 's2c-driver', type: 'analysis', icon: '🔬',
    label: 'S2C Driver Analysis', sublabel: 'Select → Checkout',
    x: 795, y: 2090, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.S2C contribution', 'headline.delta.s2c', 'trend shape', 'dimension cuts'],
    outputs: ['mechanism (availability/UX/pricing/vendor)', 'onset: sudden or gradual', 'DRI hypothesis'],
    condition: 'ONLY IF "S2C" in significant_steps.',
    description: 'Sudden: availability config tightened (API cut-off), select-page UX regression (mobile-concentrated), price shock at variant level, specific experience collapse, TGID misconfiguration. Gradual: inventory thinning, variant complexity, vendor throttling, seasonal availability pattern. DRI: Supply/Inventory, Product, Ops, BDM.',
  },
  {
    id: 'c2o-driver', type: 'analysis', icon: '🔬',
    label: 'C2O Driver Analysis', sublabel: 'Checkout → Order',
    x: 1175, y: 2090, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.C2O contribution', 'c2o_sub.delta_c2a', 'c2o_sub.delta_a2o', 'trend shape'],
    outputs: ['c2a or a2o sub-metric dominant', 'DRI hypothesis', 'feeds C2A vs A2O decision'],
    condition: 'ONLY IF "C2O" in significant_steps.',
    description: 'C2O is further decomposed into C2A (checkout → attempt) and A2O (attempt → order). C2A drop = users abandon before payment — checkout UX friction, hidden fees, form issues. A2O drop = payment submitted but failed — gateway error, fraud rules, currency issue. Each has a different DRI and action set.',
  },
  {
    id: 'c2a-a2o', type: 'decision', icon: '💳',
    label: 'C2A vs A2O Drop?', sublabel: 'Abandonment vs payment failure',
    x: 1175, y: 2385, phase: 'Decision',
    badge: null,
    inputs: ['c2o_sub.delta_c2a', 'c2o_sub.delta_a2o'],
    outputs: ['DRI: Product/UX (C2A↓)', 'DRI: Payments/Eng (A2O↓)', 'DRI: Both'],
    condition: 'ONLY IF "C2O" in significant_steps.',
    description: 'delta_c2a < 0 → users reached checkout but did not submit payment. Cause: hidden fees revealed, form friction, coupon breakage, trust signals missing. DRI: Product/UX. delta_a2o < 0 → payment submitted but order failed. Cause: gateway degradation, fraud rule tightening, FX error, live inventory failure at fulfilment. DRI: Payments / Engineering.',
  },

  // ══ Q3: TREND PATTERN ══
  {
    id: 'trend-pattern', type: 'decision', icon: '📉',
    label: 'Q3: Sudden / Gradual / Seasonal?', sublabel: 'Trend shape + LY delta + pre_period_healthy',
    x: 795, y: 2385, phase: 'Decision',
    badge: null,
    inputs: ['trend.pre/post daily series (Q3)', 'trend_context.series (Q7)', 'trend_context.structural_delta_cvr', 'trend_context.pre_period_healthy'],
    outputs: ['pattern: sudden | gradual | seasonal', 'onset_date (if sudden)', 'structural_delta_cvr', 'pre_period_healthy', 'weekday composition check'],
    condition: 'ONLY IF mix_dominance.is_dominant = false.\n3 sub-steps: 3a shape, 3b LY overlay, 3c weekday composition.',
    description: 'Q3 has three sub-steps. 3a: 90-day trend shape — sharp break (something changed that day), gradual erosion (structural issue compounding), or recovery in progress (prior incident). 3b: Compare current_delta_cvr to ly_delta_cvr; compute structural_delta_cvr = current minus LY — calibrates how much is seasonal vs new. 3c: Check weekday composition — a post period with more weekends can produce an apparent drop with no real change. pre_period_healthy = FALSE → pre was already degraded, Shapley understates true change.',
  },

  // ══ RECONVERGE: HYPOTHESIS ══
  {
    id: 'hypothesis', type: 'analysis', icon: '💡',
    label: 'Hypothesis Formation', sublabel: '2–4 falsifiable hypotheses',
    x: 795, y: 2690, phase: 'Hypothesis',
    badge: null,
    inputs: ['Q2 primary driver', 'Q3 pattern (sudden/gradual)', 'mix root cause (if mix path)', 'c2a/a2o DRI', 'hypothesis.md patterns'],
    outputs: ['hypothesis_1…4 (mechanism + segment + date pattern)', 'query plan to test each'],
    condition: 'Always fires after Q1/Q2/Q3 answered.\nBoth mix and funnel paths converge here.',
    description: 'Claude forms 2–4 specific, falsifiable hypotheses. Each names a mechanism (not an observation), the segment it would affect, and the date pattern expected if true. Consults hypothesis.md for historical MMP patterns as orientation — not as a constraint. Custom queries in the next step are chosen to confirm or rule out each hypothesis.',
  },

  // ══ CUSTOM QUERIES ══
  {
    id: 'custom-select', type: 'decision', icon: '🔎',
    label: 'Custom Query Plan', sublabel: 'Write from scratch · context.md schemas',
    x: 795, y: 2990, phase: 'Investigation',
    badge: null,
    inputs: ['hypothesis_1…4', 'primary driver type', 'onset pattern'],
    outputs: ['query plan: which of Q2/Q4/Q5/Q6/custom to run'],
    condition: 'Always fires after hypothesis formation.',
    description: 'No pre-built templates. Every query is written from scratch using context.md schemas to test a specific hypothesis. Context.md provides dimension guidance (browsing_country, channel_name, lead_time_days, page_sub_type, previous_page_url, cross-cuts, experience-level with availability proxy) and common investigation patterns per funnel step. Majority-contributor principle + rate×volume rule apply to every result.',
  },
  {
    id: 'custom-results', type: 'ref', icon: '🗄️',
    label: 'Custom Query Results', sublabel: 'BQ Reference — hypothesis-driven',
    x: 795, y: 3290, phase: 'Investigation',
    badge: null,
    inputs: ['selected queries from Q2/Q4/Q5/Q6/custom'],
    outputs: ['dimension cut tables', 'experience-level rates', 'price deltas', 'URL-level anomalies'],
    condition: 'Fires for each selected query.\nMin 50 users per entity. Majority-contributor principle applied.',
    description: 'Each query is written from scratch and run via bq query CLI. Results compared to hypotheses — confirming, ruling out, or refining. Only majority-contributor entities qualify as evidence (long-tail entities are noise). Always compute absolute impact (rate Δ × user volume) before declaring a driver. Failed queries are logged in the transcript and noted as data gaps in the report — the investigation does not halt.',
  },

  // ══ LOCUS DECISION ══
  {
    id: 'locus', type: 'decision', icon: '📍',
    label: 'Locus Confirmed?', sublabel: 'Drop concentrated enough to pull recordings',
    x: 795, y: 3590, phase: 'Investigation',
    badge: null,
    inputs: ['custom query results', 'dimension cuts', 'URL anomalies'],
    outputs: ['locus: URL | device | experience | language | CE-wide', 'recording_trigger: bool'],
    condition: 'Always fires after custom queries.\nYES → session recordings. NO → conclude from available evidence.',
    description: 'If the drop is concentrated in a specific URL, device type, experience ID, or language — the locus is identified and Mixpanel session recordings are pulled for direct visual evidence. If the drop is diffuse across all dimensions (CE-wide), recordings are skipped and the investigation concludes from quantitative data alone.',
  },

  // ══ SESSION RECORDINGS ══
  {
    id: 'recordings', type: 'tool', icon: '🎬',
    label: 'Mixpanel Session Recordings', sublabel: 'Get-User-Replays-Data tool call',
    x: 310, y: 3880, phase: 'Evidence',
    badge: null,
    inputs: ['locus (URL / device / experience / language)', 'post_start', 'post_end', 'distinct_id or replay_ids'],
    outputs: ['Recording | Steps observed | Inference (structured table)'],
    condition: 'REQUIRED once any concentrated dimension is confirmed.\nSkipping must be explicitly justified in the report.',
    description: 'Required once a locus is confirmed — any concentrated dimension cut (URL, experience, device, language, page type) is sufficient. Any concentrated signal triggers recordings; all dimensions do not need to be confirmed simultaneously. Skipping without explanation is not acceptable once a locus has been confirmed. Moves finding from "consistent with" to "directly observed". Results presented as structured table: Recording | Steps Observed | Inference (one sentence each on what was proved or ruled out).',
  },

  // ══ OUTPUTS ══
  {
    id: 'transcript', type: 'output', icon: '📝',
    label: 'Investigation Transcript', sublabel: 'ce<id>_<post_start>.md',
    x: 795, y: 4160, phase: 'Output',
    badge: null,
    inputs: ['all decision points + rationale', 'queries run', 'hypotheses tested', 'ruled-out findings'],
    outputs: ['~/Documents/RCA skill/transcripts/ce<id>_<date>.md'],
    condition: 'Always fires after locus decision (both paths).',
    description: 'Structured markdown file with one entry per decision point: Hypothesis (what was tested), Data (fields/values examined), Decision (which path taken), Ruled out (what was dismissed and why). Required entries: Q1, Q2, Q3, all custom queries run, verdict synthesis. This is the investigation audit trail.',
  },
  {
    id: 'html-report', type: 'output', icon: '🌐',
    label: 'HTML Report', sublabel: 'Section 1: Summary → Section 2: Actions → Section 3: Analysis',
    x: 795, y: 4450, phase: 'Output',
    badge: null,
    inputs: ['summary.json', 'investigation findings', 'session recording table', 'actions.md templates', 'report_structure.md spec'],
    outputs: ['/tmp/cvr_rca_<ce_id>/report.html'],
    condition: 'Always fires after transcript is written.',
    description: 'Self-contained HTML. Section 1: 5 metric cards + root cause callout (What/Why/When — no hedging). Section 2: ≤3 action cards ranked P1–P3, each with specific DRI task. Section 3: evidence supporting Sections 1–2 only — Shapley bar, mix table, trend chart, and only the dimension cuts that showed signal. Ruled-out dimensions collected in a single block at the end.',
  },
  {
    id: 'evaluation', type: 'eval', icon: '⭐',
    label: 'Evaluation', sublabel: '7-theme rubric · score 1–5 per theme',
    x: 795, y: 4740, phase: 'Evaluation',
    badge: null,
    inputs: ['html-report', 'investigation transcript', 'summary.json', 'evaluator.md rubric'],
    outputs: ['~/Documents/RCA skill/evals/ce<id>_<date>.md', 'score per theme (1–5)', 'top 2–3 improvement items'],
    condition: 'Always fires last — terminal node.',
    description: 'Claude re-reads its own report as if seeing this CE for the first time, then grades each of 7 themes: Narrative Coherence, Hypothesis Specificity, Investigation Effort, Branch Decision Quality, Evidence Strength, Output Appropriateness, DRI & Actionability. Scores reflect honest self-critique — an evaluation where every theme is 4+ with no improvements is almost certainly not honest.',
  },

  // ══ REFERENCE FILE NODES ══
  {
    id: 'file-skill', type: 'file', icon: '📄',
    label: 'SKILL.md', sublabel: 'Master decision protocol',
    x: 1670, y: 70, phase: 'Reference File',
    usedBy: ['user-input'],
    fileKey: 'skill',
    chips: ['lean process orchestrator', '3-sub-step Q3', 'data pull errors', 'recordings required', 'write-from-scratch queries'],
  },
  {
    id: 'file-context', type: 'file', icon: '📄',
    label: 'context.md', sublabel: 'Domain knowledge hub — v1.1 expanded',
    x: 1670, y: 360, phase: 'Reference File',
    usedBy: ['mix-decision', 'step-decision'],
    fileKey: 'context',
    chips: ['Query Principles', 'Q3 Trend Interpretation', 'Dimensions guide', 'Investigation Patterns', 'Session Recordings', 'table schemas'],
  },
  {
    id: 'file-hypothesis', type: 'file', icon: '📄',
    label: 'hypothesis.md', sublabel: '10 patterns · 21 historical MMPs',
    x: 1670, y: 2690, phase: 'Reference File',
    usedBy: ['hypothesis'],
    fileKey: 'hypothesis',
    chips: ['LP2S sudden/gradual', 'S2C sudden/gradual', 'C2A drop', 'A2O drop', 'Mix shift', 'Device/Language/Experience'],
  },
  {
    id: 'file-actions', type: 'file', icon: '📄',
    label: 'actions.md', sublabel: '10 root causes → action templates',
    x: 1670, y: 4450, phase: 'Reference File',
    usedBy: ['html-report'],
    fileKey: 'actions',
    chips: ['P1/P2/P3 actions', 'DRI per root cause', '10 RCs', 'historical refs'],
  },
  {
    id: 'file-report-struct', type: 'file', icon: '📄',
    label: 'report_structure.md', sublabel: '3-section spec + HTML/CSS patterns',
    x: 1670, y: 4700, phase: 'Reference File',
    usedBy: ['html-report'],
    fileKey: 'reportStruct',
    chips: ['Section 1/2/3 rules', 'metric card HTML', 'Plotly spec', 'anti-patterns'],
  },
  {
    id: 'file-evaluator', type: 'file', icon: '📄',
    label: 'evaluator.md', sublabel: '7-theme rubric + scoring guide',
    x: 1670, y: 4950, phase: 'Reference File',
    usedBy: ['evaluation'],
    fileKey: 'evaluator',
    chips: ['7 themes', 'score 1–5', 'high vs low criteria', 'self-honesty check'],
  },
];

  {
    id: 'file-worked-example', type: 'file', icon: '📄',
    label: 'worked_example.md', sublabel: 'Two end-to-end investigation walkthroughs',
    x: 1670, y: 2890, phase: 'Reference File',
    usedBy: ['hypothesis'],
    fileKey: 'workedExample',
    chips: ['Mix-dominant walkthrough', 'Conversion + locus walkthrough', 'French × iOS cross-cut', 'session recordings'],
  },
];

// ── Edge definitions ───────────────────────────────────────────────────────────
// type: 'always' | 'conditional' | 'consults'
const EDGES = [
  // Pipeline
  { id:'e1',  from:'user-input',    to:'q0-meta',        type:'always',      label:'CE ID + dates'             },
  { id:'e2',  from:'q0-meta',       to:'q1-base',        type:'always',      label:'stage0.json'               },
  { id:'e3',  from:'q1-base',       to:'q3-trend',       type:'always',      label:'primary_mbho + dates'      },
  { id:'e4',  from:'q1-base',       to:'q7-ly',          type:'always',      label:'CE-level + dates'          },
  { id:'e5',  from:'q3-trend',      to:'aggregate',      type:'always',      label:'stage3.json'               },
  { id:'e6',  from:'q7-ly',         to:'aggregate',      type:'always',      label:'stage7.json'               },
  { id:'e7',  from:'aggregate',     to:'mix-decision',   type:'always',      label:'summary.json'              },

  // Mix branch
  { id:'e8',  from:'mix-decision',  to:'q6-urls',        type:'conditional', label:'YES: mix > 50% of ΔCVR'   },
  { id:'e9',  from:'mix-decision',  to:'mix-root',       type:'conditional', label:'YES: routing story'        },
  { id:'e10', from:'q6-urls',       to:'mix-root',       type:'conditional', label:'URL traffic results'       },

  // Funnel branch
  { id:'e11', from:'mix-decision',  to:'step-decision',  type:'conditional', label:'NO: funnel path'           },
  { id:'e12', from:'step-decision', to:'lp2s-driver',    type:'conditional', label:'"LP2S" ∈ sig_steps'        },
  { id:'e13', from:'step-decision', to:'s2c-driver',     type:'conditional', label:'"S2C" ∈ sig_steps'         },
  { id:'e14', from:'step-decision', to:'c2o-driver',     type:'conditional', label:'"C2O" ∈ sig_steps'         },
  { id:'e15', from:'c2o-driver',    to:'c2a-a2o',        type:'conditional', label:'delta_c2a + delta_a2o'     },

  // Trend pattern (Q3)
  { id:'e16', from:'step-decision', to:'trend-pattern',  type:'conditional', label:'reads Q3 + Q7 series'      },

  // Reconverge → hypothesis
  { id:'e17', from:'mix-root',      to:'hypothesis',     type:'conditional', label:'mix mechanism'             },
  { id:'e18', from:'lp2s-driver',   to:'hypothesis',     type:'conditional', label:'LP2S mechanism'            },
  { id:'e19', from:'s2c-driver',    to:'hypothesis',     type:'conditional', label:'S2C mechanism'             },
  { id:'e20', from:'c2a-a2o',       to:'hypothesis',     type:'conditional', label:'C2O DRI assignment'        },
  { id:'e21', from:'trend-pattern', to:'hypothesis',     type:'always',      label:'onset pattern'             },

  // Custom queries
  { id:'e22', from:'hypothesis',    to:'custom-select',  type:'always',      label:'2–4 hypotheses'            },
  { id:'e23', from:'custom-select', to:'custom-results', type:'conditional', label:'selected queries'          },
  { id:'e24', from:'custom-results',to:'locus',          type:'always',      label:'query results'             },
  { id:'e25', from:'custom-select', to:'locus',          type:'conditional', label:'if no queries needed'      },

  // Locus → recordings → outputs
  { id:'e26', from:'locus',         to:'recordings',     type:'conditional', label:'YES: locus confirmed'      },
  { id:'e27', from:'recordings',    to:'transcript',     type:'conditional', label:'recording observations'    },
  { id:'e28', from:'locus',         to:'transcript',     type:'always',      label:'investigation complete'    },
  { id:'e29', from:'transcript',    to:'html-report',    type:'always',      label:'findings + rationale'      },
  { id:'e30', from:'html-report',   to:'evaluation',     type:'always',      label:'completed report'          },

  // Consults (file → node, dotted)
  { id:'c1',  from:'file-skill',       to:'user-input',    type:'consults', label:'master protocol'           },
  { id:'c2',  from:'file-context',     to:'mix-decision',  type:'consults', label:'domain definitions + DRI'  },
  { id:'c3',  from:'file-hypothesis',  to:'hypothesis',    type:'consults', label:'10 historical patterns'    },
  { id:'c4',  from:'file-actions',     to:'html-report',   type:'consults', label:'action templates'          },
  { id:'c5',  from:'file-report-struct',to:'html-report',  type:'consults', label:'HTML/CSS spec'             },
  { id:'c6',  from:'file-evaluator',   to:'evaluation',    type:'consults', label:'7-theme rubric'            },
  { id:'c7',  from:'file-worked-example', to:'hypothesis',  type:'consults', label:'worked examples'           },
];

// ── Canvas section labels ─────────────────────────────────────────────────────
const SECTION_LABELS = [
  { text: '① Input',               x: 30, y: 42  },
  { text: '② CE Metadata',         x: 30, y: 327 },
  { text: '③ Base Funnel',         x: 30, y: 607 },
  { text: '④ Parallel BQ Queries', x: 30, y: 887 },
  { text: '⑤ Aggregation',         x: 30, y: 1167 },
  { text: '⑥ Q1: Mix Decision',    x: 30, y: 1467},
  { text: '⑦ Mix / Step Branches', x: 30, y: 1762},
  { text: '⑧ Driver Analysis',     x: 30, y: 2062},
  { text: '⑨ Q2+Q3 Sub-decisions', x: 30, y: 2357},
  { text: '⑩ Hypothesis',          x: 30, y: 2662},
  { text: '⑪ Custom Queries',      x: 30, y: 3562},
  { text: '⑫ Query Results',       x: 30, y: 3262},
  { text: '⑬ Locus + Recordings',  x: 30, y: 3562},
  { text: '⑭ Transcript',          x: 30, y: 4132},
  { text: '⑮ HTML Report',         x: 30, y: 4422},
  { text: '⑯ Evaluation',          x: 30, y: 4712},
];

// ── File contents (curated markdown rendered in the side panel) ───────────────
const FILE_CONTENTS = {

skill: `# SKILL.md — Master Decision Protocol (v1.1)

## Purpose
Pure process orchestrator. Domain knowledge, query rules, investigation patterns, and worked examples live in \`context.md\` and \`worked_example.md\`. This file tells you what steps to follow and when to pivot.

---

## Before You Begin (always)

\`\`\`bash
cat context.md           # domain vocab, schemas, query rules, investigation patterns
cat hypothesis.md        # historical priors from 21 MMPs
cat actions.md           # root cause → action mappings
cat report_structure.md  # output spec (3-section layout)
\`\`\`

---

## Execution Order

| Step | Action |
|------|--------|
| 1 | Run baseline pipeline → summary.json |
| 2 | Open investigation transcript |
| 3 | Answer 3 mandatory questions |
| 4 | Consult hypothesis.md; form 2–4 falsifiable hypotheses |
| 5 | Write + run custom queries (from scratch, context.md schemas) |
| 6 | Pull session recordings if locus confirmed (REQUIRED) |
| 7 | Write investigation transcript |
| 8 | Write HTML report (report_structure.md) |
| 9 | Evaluate against 7-theme rubric (evaluator.md) |

---

## Q1: Routing or conversion?
- Read \`mix_dominance.is_dominant\`
- TRUE → traffic/routing story. Investigate where traffic shifted. DRI: Marketing.
- FALSE → funnel problem → Q2 and Q3

## Q2: Which step is primary?
- Read \`shapley\`. Steps with < ~10% of delta: skip deep-dive.
- Multiple steps can be significant simultaneously.

## Q3: Sudden, gradual, or seasonal? (3 sub-steps)
- **3a:** 90-day trend shape — sharp break / gradual erosion / recovery in progress
- **3b:** Compare \`current_delta_cvr\` to \`ly_delta_cvr\`. Compute \`structural_delta_cvr\`.
- **3c:** Check weekday composition — more weekends in post = apparent drop, no real change.
- Check \`pre_period_healthy\`: FALSE means Shapley understates true change.

---

## Data Pull Errors — Log and Continue
When any query fails or returns empty:
1. Log in transcript (error, impact, workaround)
2. Add ⚠️ data-gap note in report where missing data would appear
3. Continue using available data
4. Use "consistent with" not "confirmed by" if missing data was material

---

## Session Recordings — Required Once Locus Confirmed
Any concentrated dimension cut is sufficient (URL, experience, device, language, page type). If skipped, report must explicitly state why. Skipping without explanation is not acceptable once a locus is confirmed.

---

## Changelog

| # | Date | Change |
|---|------|--------|
| c001–c002 | 2026-04-24 | Initial framework: 3 questions, Shapley, mix decomp, evaluator |
| c003 | 2026-04-24 | Majority-contributor principle; rate × volume rule; recordings required |
| c004 | 2026-04-24 | Recordings trigger fixed to disjunctive; data pull errors section added |
| c005 | 2026-04-24 | P1/P2/P3 action card priority badges |
| c006 | 2026-04-27 | Removed Q2/Q4/Q5/Q6 template pointers; all querying now write-from-scratch |
| c007 | 2026-04-27 | Stripped to pure process; domain content → context.md + worked_example.md |
| c008 | 2026-04-27 | Removed stale internal references and redundant restatements |
`,

context: `# context.md — Domain Knowledge Hub (v1.1)

Read before touching any data, writing callouts, or forming hypotheses. This file owns all domain knowledge — query rules, interpretation guides, dimension guidance, and investigation patterns.

---

## Combined Entity (CE)
Headout's core unit of business reporting. A curated grouping of experiences within a specific geography × experience type (e.g., "Skip-the-Line Colosseum in Rome" = CE 167).

CVR is measured per CE because demand, supply, and pricing dynamics are CE-specific.

---

## MB vs HO — The Two Distribution Channels

| Code | Full name | Traffic source | Base CVR |
|------|-----------|---------------|----------|
| **MB** | Microbrand | SEO, affiliates, partner referrals (ticketslondon.com, etc.) | Lower — discovery-oriented |
| **HO** | Headout | Paid search (Google/Bing), direct, email | Higher — intent-driven |

> A shift in traffic share toward MB will depress overall CVR even if per-session rates in both brands are unchanged. Always distinguish MB rate drop vs HO rate drop vs traffic mix shift.

---

## Funnel Steps — CVR = LP2S × S2C × C2O

| Step | From | To | Drop usually means |
|------|------|----|--------------------|
| **LP2S** | Landing page | Select / Date-picker | Price too high, UX change, low availability shown, ad mismatch |
| **S2C** | Select page | Checkout Started | No bookable dates, price shock at variant, UX friction, variant confusion |
| **C2O** | Checkout Started | Order confirmed | Decompose into C2A and A2O (see below) |

### C2O Sub-decomposition
- **C2A drop** = users abandon before submitting payment → UX/pricing friction. DRI: Product/UX
- **A2O drop** = payment submitted but order failed → gateway, fraud, FX, live inventory failure. DRI: Payments / Engineering

---

## DRI Quick Reference

| Finding | Primary DRI | Other possible DRIs |
|---------|-------------|---------------------|
| LP2S drop, mobile, sudden | Product (mobile web) | Engineering (performance) |
| LP2S drop, gradual | Supply / Inventory | Performance Marketing; BDM; Content |
| LP2S drop, specific language | Performance Marketing | BDM; Localisation |
| S2C drop | Supply / Inventory | Product; Ops/BDM |
| C2O: C2A drop | Product / UX | Ops (custom fields, pax setup) |
| C2O: A2O drop | Payments | Ops / Engineering |
| MB/HO mix shift | Marketing | Performance Marketing |
| Channel mix shift | Performance Marketing | — |

---

## Key Analytical Concepts

### Shapley Decomposition
CVR = LP2S × S2C × C2O (multiplicative). Shapley averages marginal contributions across all 6 orderings. Values always sum exactly to ΔCVR — no residual. This is why you can say "LP2S explains 68% of the drop" with precision.

### Mix vs Conversion Effect
For each segment (MB/HO, Paid/Organic):
- \`mix_effect = Δshare × pre_rate\` → traffic routing problem
- \`conversion_effect = pre_share × Δrate\` → funnel/product problem
- \`interaction = Δshare × Δrate\` → usually small cross-term

### Traffic Non-Additivity
Users in dimension cuts (language, page_type, device) are NOT additive. The same user appears in multiple cuts. Each dimension has its own \`COUNT(DISTINCT user_id)\` subquery. Never sum across cuts.

---

## Primary Table
\`analytics_reporting.mixpanel_user_page_funnel_progression\`

**Critical rules:**
- \`combined_entity_id\` is STRING — filter with \`= '<ce_id>'\`, no CAST
- \`event_date\` is the partition key — always filter on it
- \`is_microbrand_page\` = TRUE → MB; FALSE → HO
- \`has_order_completed\` uses Order Confirmation Page as proxy (reliable for CVR)
- **Do not use** \`flow_type\` (doesn't exist), \`session_date\` (doesn't exist)

**New in v1.1:** Query Principles (majority-contributor + rate×volume), Q3 Trend Interpretation (3 sub-steps), Dimensions to Query and When, Common Investigation Patterns per funnel step, Session Recordings guidance.
`,

hypothesis: `# hypothesis.md — Historical Patterns Reference

> These patterns are **starting points, not a menu.** Form your own hypotheses from what the data shows. If summary.json points to a mechanism not listed here, follow it — the data is always the authority.

Drawn from 21 historical Headout RCAs across MMPs. Ranked by frequency within each driver type.

---

## URL concentration — valid for any primary driver

Before reading step-specific patterns, check URL breakdown for the affected metric. A drop concentrated in 2–3 high-traffic URLs points to something specific about those pages. A uniform drop across all URLs points to a CE-wide mechanism.

---

## Pattern 1: LP2S — Sudden Onset
Sharp drop began on a specific date. Work backwards from that date.

1. **Pricing increase** — SP rate change, discount removed, fees now included in display price
2. **LP/MB format deploy** — new listing page template added an extra decision step (Vienna concerts: LP2S halved overnight when venue-selection step added before date selection)
3. **Campaign routing error** — paid campaigns pointing to wrong/outdated LP (NY Helicopter: language campaigns routing to old SF LP)
4. **Product ranking change** — new top-ranked product with lower inherent CVR or worse availability
5. **Competitor flash promotion** — sudden price advantage on GYG/Viator

## Pattern 2: LP2S — Gradual Decline
Slow erosion over weeks → structural change.

1. **Supply thinning** — \`days_to_first_available_date\` increasing; users see far-out dates only
2. **SIS cap** — Share of Impression Share ceiling; marginal paid clicks are lower-intent
3. **Competitive pressure** — GYG/Viator strengthened listing quality gradually
4. **Content degradation** — images replaced, descriptions stale, review count stagnating
5. **Assortment drift** — lower-CVR products added to CE, diluting listing quality

## Pattern 3: S2C — Sudden Onset
Sharp S2C drop almost always points to supply config change or select-page deploy.

1. **Availability config tightened** — API cut-off period shortened, release window changed (Blue Mountains: next-day/same-week blocked)
2. **Select page UX regression** — date-picker broken/degraded, likely mobile-concentrated (check iOS Mweb first)
3. **Price shock at variant level** — select page shows higher price than LP anchor (NY Helicopter: helipad fees)
4. **Specific experience availability collapse** — one key experience lost inventory entirely
5. **TGID misconfiguration** — wrong variants linked, wrong date-picker loading

## Pattern 4: S2C — Gradual Decline
1. **Inventory thinning** — SP progressively reducing available slots or shortening booking window
2. **Variant complexity / decision paralysis** — more SKUs without clear differentiation (Vienna concerts: multiple venue × composer × price combinations)
3. **Vendor throttling** — SP quietly reduces slots to avoid over-booking; \`count_days_available_30d\` and \`days_to_first_available_date\` both worsen for affected experiences
4. **Seasonal availability pattern** — compare to prior-year data to distinguish seasonal from structural

## Pattern 5: C2O — C2A Drop (abandonment before payment)
1. **Hidden fees revealed at checkout** — price materially higher than select page (helipad fees, booking fees, taxes)
2. **Checkout UX friction** — new required field, autofill broke, payment option removed
3. **Booking fee / mandatory add-on surprise** — fee not surfaced earlier
4. **Coupon breakage** — active promo code stopped working
5. **Trust signals missing** — review score, cancellation policy, security badge removed

## Pattern 6: C2O — A2O Drop (payment submitted but failed)
1. **Payment gateway degradation** — timeout, error rate increase, outage for specific payment method
2. **Fraud rule tightening** — updated filters increasing decline rate for certain card types/geographies
3. **Currency/FX display error** — wrong conversion rate at payment step
4. **New payment method regression** — new option introduced flow breakage in existing methods

## Pattern 7: MB/HO Mix Shift
1. **Paid campaign paused / budget reallocated** — HO paid traffic drops; MB organic share rises (NY Helicopter: 75% drop in English campaign clicks drove CVR collapse via mix)
2. **LP routing error** — language/geo campaigns send traffic to MB page instead of headout.com
3. **Seasonal organic MB spike** — without corresponding paid HO increase
4. **Budget reallocated to another CE** — paid spend shifted away

## Pattern 8–10: Concentrated Drops

**Device:** Mobile UI deploy regression (iOS Safari most sensitive), page performance degradation, mobile-specific feature breakage

**Language:** Geo-specific campaign change, localisation issue (missing translations, RTL layout), geo-specific pricing/availability change

**Experience-level (S2C):** Experience-specific availability collapse — check \`count_days_available_30d\` for that experience_id; vendor-specific operational issue; experience-specific pricing change; TGID misconfiguration
`,

actions: `# actions.md — Root Cause → Action Templates

Use when writing Section 2 of the report. Match confirmed root cause to category below. Assign specific DRI.

---

## RC1: Pricing misalignment vs competition
**Signal:** HO price above GYG/Viator for comparable product → LP2S or S2C drop.

| Action | DRI | Priority |
|--------|-----|----------|
| Match GYG/Viator pricing on specific competitive SKUs | BDM / Growth | P1 |
| Include all mandatory fees in displayed LP price | Ops / Product | P1 |
| Raise ILFs to improve bidding competitiveness | BDM | P2 |
| Negotiate better net rates with SP | BDM | P2 |
| Set up weekly competitive pricing monitoring | Analytics / Growth | P3 |

---

## RC2: Inventory / availability constraint
**Signal:** \`count_days_available_30d\` dropped or \`days_to_first_available_date\` increased → S2C drop.

| Action | DRI | Priority |
|--------|-----|----------|
| Fix API cut-off period settings with SP | Ops / BDM | P1 |
| Review release window — ensure future inventory visible | Ops | P1 |
| Bucket availability by lead-time (0-2D, 2-4D, 4-7D, >7D) | Ops / BDM | P1 |
| Add additional SPs to reduce single-vendor dependency | BDM / Growth | P2 |
| Set up inventory alerts below threshold | Ops / Analytics | P3 |

---

## RC3: UX / listing page / MB format friction
**Signal:** LP2S or S2C drop coinciding with deploy date, often mobile-concentrated.

| Action | DRI | Priority |
|--------|-----|----------|
| Revert to previous MB/LP format if drop is large and sudden | Product | P1 |
| Reduce decision steps in product selection flow | Product | P1 |
| Audit mobile checkout end-to-end on iOS Safari + Android Chrome | Product / Engineering | P1 |
| Improve product content with key decision-making details | Content | P2 |

---

## RC4: Product ranking / assortment structure
**Signal:** Top-ranked product has materially lower CVR than alternatives.

| Action | DRI | Priority |
|--------|-----|----------|
| Fix ranking model — separate product categories into independent pools | Growth / Analytics | P1 |
| Promote highest-CVR, highest-availability product to top slot | Growth | P1 |
| Remove/demote low-CVR, low-availability products from top 3 | Growth | P2 |

---

## RC5: Vendor / SP operational issue
**Signal:** CR% drop for specific SP, fulfilment failures, or TGID config errors → C2O drop.

| Action | DRI | Priority |
|--------|-----|----------|
| Put underperforming vendor in manual fulfilment mode | Ops | P1 |
| Fix TGID reference errors in customer communications | Ops | P1 |
| Escalate CR% issues directly with vendor | BDM | P1 |
| Switch primary SP designation to highest-CR% alternative | Growth / BDM | P2 |

---

## RC6: Campaign / traffic quality issue
**Signal:** Mix shift dominant, or LP2S drop in specific language aligned with campaign change.

| Action | DRI | Priority |
|--------|-----|----------|
| Audit LP routing — verify all campaigns point to correct LP | Performance Marketing | P1 |
| Investigate campaign scale-down (intentional vs accidental) | Performance Marketing / Growth | P1 |
| Restore paused campaigns for high-ROI segments | Performance Marketing | P1 |
| Run negative keyword audit, restructure by intent cluster | Performance Marketing | P2 |

---

## RC7: Take rate / margin issue
**Signal:** Revenue dropped with stable CVR and orders.

| Action | DRI | Priority |
|--------|-----|----------|
| Negotiate TR improvement with SP | BDM | P1 |
| Shift traffic toward higher-TR products via ranking | Growth | P2 |

---

## RC8: Checkout friction — C2A drop
**Signal:** C2A sub-metric dropped; users abandoned before submitting payment.

| Action | DRI | Priority |
|--------|-----|----------|
| Audit checkout form for new friction (fields added, autofill broken) | Product | P1 |
| Verify all fees transparent before checkout — no price surprises | Product / Ops | P1 |
| Audit custom fields — count required fields; simplify where possible | Product / Ops | P1 |
| Confirm trust signals present: reviews, cancellation policy, security badge | Product | P2 |

---

## RC9: Payment failure — A2O drop
**Signal:** A2O sub-metric dropped; payment submitted but order failed.

| Action | DRI | Priority |
|--------|-----|----------|
| Check payment gateway error logs for affected period | Payments / Engineering | P1 |
| Investigate \`order_attempted_events_v2\` — gateway, fraud_evaluation_result_origin, failure_reason | Payments / Engineering | P1 |
| Review fraud rule changes deployed around onset date | Payments | P1 |
| Investigate live inventory failure (API sync latency) | Ops / Engineering | P1 |

---

## RC10: Content & media quality
**Signal:** LP2S or S2C declining gradually with no pricing or availability change.

| Action | DRI | Priority |
|--------|-----|----------|
| Audit experience names — surface key differentiators in the name itself | Content | P1 |
| Review highlights and inclusions — ensure core selling points explicit | Content | P1 |
| Check image count and quality — minimum 3 images per product | Content / Media | P2 |
| Refresh LFC and shoulder pages for MB microsites | Content / SEO | P2 |
`,

workedExample: `# worked_example.md — Two End-to-End Walkthroughs

These show how the investigation process plays out when evidence is clear. Not templates — demonstrations of reasoning.

---

## Example 1: Mix-dominant story

**Q1:** \`mix_dominance\` shows MB share grew 43% → 52%. MB CVR stable. HO CVR stable. Mix effect explains 58% of ΔCVR.

*Routing story — skip Shapley deep-dive.* Investigate: why did MB share grow?

**Custom query:** \`COUNT(DISTINCT user_id)\` by \`page_url\` for MB sessions, pre vs post. Two collection-page URLs show 40% traffic drop. Everything else held.

**Finding:** Those URLs were receiving paid search traffic in the pre period and stopped. CVR drop is an artefact of a campaign change, not a funnel break.

**Report:** CVR card, mix table, URL traffic comparison for those 2 pages, one action card to Marketing. No Shapley bar — steps didn't break, Shapley would mislead.

---

## Example 2: Conversion-dominant, concentrated locus

**Q1:** \`mix_dominance.is_dominant\` = false → funnel path.

**Q2:** Shapley: S2C carries 68% of ΔCVR. LP2S and C2O are small.

**Q3:** Daily trend: sharp break on Apr 8. LY overlay: no similar drop → structural, not seasonal.

**Dimension cuts:** Device: iOS Mweb −4.1pp. Language: French −6pp. Two concentrated signals.

**Cross-cut query:** S2C by \`page_url\` WHERE \`language = 'French'\` AND \`device_type LIKE '%Mweb%'\`. One experience's select page: S2C 19% → 4%.

**Session recordings:** Pulled for that URL × French × post period. Users consistently see empty date picker — no available dates loading for French locale after Apr 8.

**Report:** CVR verdict, mix ruled out, Shapley bar, S2C trend, device + language cuts, URL finding, session recordings table, Supply + Product action cards. LP2S and C2O sections omitted — they were not the story.
`,

reportStruct: `# report_structure.md — HTML Report Spec

Every report follows a fixed three-section structure. Claude writes self-contained HTML — no render.py, no component library.

---

## The Principle
> By the time the GM finishes reading Section 2, they know exactly what happened and what to do. Section 3 is for anyone who needs to verify the conclusion.

---

## Section 1 — Executive Summary (≤ 60 seconds to read)

### 1a. Metric Cards (always — all five)
Cards in order: **CVR · LP2S · S2C · C2O · Traffic (users_lp)**

Each card: pre value (grey, small), post value (large bold), delta badge.
Format: \`Δ −0.33pp / −7.0%\` — absolute pp + percentage together.

### 1b. Root Cause Callout (always)
Red left border (\`#e53935\`). Answers three questions:

**What broke?** Name the specific thing — not a metric name.
- ❌ "LP2S declined"
- ✅ "S2C fell from 25.6% to 24.2%, concentrated entirely in HO where S2C collapsed from 35.7% to 23.4%"

**Why did it break?** The mechanism — not what the data shows.
- ❌ "Possibly due to UX changes or pricing"
- ✅ "Peak-season dates for late-April sold out. Users arrived at the date-picker and found their desired dates unavailable"

**When did it break?** Exact date (sudden) or window (gradual).
- ❌ "In the post period"
- ✅ "Gradual onset across Apr 13–19 — no single-day step change, consistent with progressive date sellout"

**Hard constraints:**
- No charts, tables, or Shapley visualizations
- No hedging language ("possibly", "may be", "could be")

---

## Section 2 — Actions (≤ 3 action cards, P1 first)

Each card: Priority badge (P1/P2/P3) · Cause (one sentence) · DRI row · Action bullet list

**DRI naming standard:**
- ❌ "Supply team — investigate availability"
- ✅ "Supply team — check availability config for Keukenhof Entry Tickets (TGID 10118) for dates Apr 20–May 11; API cut-off period may be restricting SP inventory"

No card saying "monitor the situation" or "investigate further."

---

## Section 3 — Supporting Analysis (evidence only)

**Opening rule:** Every block starts with a **verdict line** — red for a finding, neutral blue for ruled-out — before any chart or table.

| Analysis | When to include |
|----------|----------------|
| Shapley decomposition | Always (proportional flex bar, not Plotly waterfall) |
| Mix analysis table | Always (even if ruled out — use neutral verdict) |
| Daily trend chart | Always (pre: #6c8ebf blue, post: #c62828 red) |
| 90-day + LY overlay | When seasonal context matters |
| Dimension cuts | Only if concentrated signal OR explicitly ruling out |
| Experience-level breakdown | Only if S2C/C2O concentrated in specific TGIDs |
| URL-level breakdown | Only if drop concentrated on specific pages |
| Session recordings | When recordings were pulled — structured table format |
| Availability proxy | When S2C + inventory hypothesis |
| Price analysis | When LP2S + pricing hypothesis correlates with onset |

**Ruled-out section (always last):** Collect uninformative dimensions into a single block: "Device: no signal. Language: no signal."

---

## Report Length Calibration

| Scenario | Expected sections |
|----------|------------------|
| Mix-dominant | Sec 1–2 + mix table + URL comparison. ~4 blocks. No Shapley. |
| Single-step, confirmed mechanism | Sec 1–2 + Shapley + trend + 1–2 cuts + experience/URL. ~6–8 blocks. |
| Multi-step + recording confirmation | Full treatment. Max ~10 blocks. |

---

## Key Anti-Patterns

| Anti-pattern | Why it fails |
|---|---|
| Root cause callout says "CVR declined due to multiple factors" | Non-committal — GM doesn't know what happened |
| Every analysis run appears in the report | Shows the work, not the conclusion |
| "Investigate further" as an action | Not actionable — the investigation just finished |
| DRI is "Product team" with no specific task | Can't be forwarded |
| Analysis block opens with "The following table shows..." | Describes data, not the finding |
| Shapley visualization in a mix-dominant finding | The steps didn't break — showing it implies they did |
`,

evaluator: `# evaluator.md — Quality Evaluator

Step back after completing the RCA and grade your own work honestly. This is not a formality.

> Be harder on yourself than a colleague would be. If something was vague when it should have been specific, say so.

---

## What to review before scoring
1. The HTML report — read as if seeing this CE for the first time
2. Your investigation reasoning — what you looked at, why, what you decided at each fork
3. The summary.json — check that report claims are grounded in actual numbers

---

## Scoring Scale
| Score | Meaning |
|-------|---------|
| 5 | Exemplary — hard to do better given the data available |
| 4 | Good — clear execution, one or two minor gaps |
| 3 | Adequate — meets minimum bar, nothing exceptional |
| 2 | Weak — significant gaps or errors |
| 1 | Poor — fundamental failure of this dimension |

---

## Theme 1: Narrative Coherence
*Does the report tell a story, or does it show tables?*

**Score high if:** Hero section states root cause in one specific sentence. Sections follow logically. Report explicitly rules things out before drilling deeper. Report is appropriately short.

**Score low if:** Hero says "CVR declined due to multiple factors." Tables appear with no context. All possible analyses appear regardless of findings.

---

## Theme 2: Hypothesis Specificity & Quality
*Did Claude form real hypotheses, or just describe what it saw?*

**Score high if:** Hypotheses are falsifiable and name a specific mechanism, segment, and date. Root cause names something specific — a campaign, a URL, an experience, a date.

**Score low if:** Report presents observations as hypotheses ("LP2S dropped, possibly due to UX or pricing"). Multiple root causes listed without ranking.

---

## Theme 3: Investigation Effort & Adaptivity
*Did Claude go deep enough, and know when to stop?*

**Score high if:** Custom query written when standard queries left hypothesis unconfirmed. Investigation drilled to page-URL level when cut pointed there. Session recordings pulled once locus confirmed. Investigation stopped when evidence was conclusive.

**Score low if:** Standard queries treated as sufficient even when hypothesis unconfirmed. URL concentrated signal found but no follow-up query run. Session recordings not used despite specific URL identified.

---

## Theme 4: Branch Decision Quality
*At each fork, did Claude pick the right path?*

**Score high if:** Mix-vs-conversion decision was explicit and cited actual mix_dominance data. Primary segment choice explained. Dimension chosen was highest-signal. When a branch not taken, reason stated.

**Score low if:** Mix not checked before concluding funnel problem. Dimension cuts shown in fixed order regardless of which was most likely to be informative.

---

## Theme 5: Evidence Strength
*Are callouts backed by real evidence?*

**Score high if:** Every claim tied to a specific data point (number, date, URL, recording). Session recordings produced a specific observation. Confidence qualifiers appropriate for sample size.

**Score low if:** Claims made without citing a number ("LP2S dropped significantly" without stating actual delta). Session recordings referenced but produced no specific finding.

---

## Theme 6: Output Appropriateness
*Is the HTML report shaped by the story, not a template?*

**Score high if:** Visual choice is appropriate to the insight. Tables appear only where they add information. Report length proportional to richness of finding. At least one component chosen deliberately over the default.

**Score low if:** Every analysis run appears in the report. Same set of components appears regardless of scenario. Charts used for single-date events where a callout would communicate better.

---

## Theme 7: DRI & Actionability
*Does the report leave the reader knowing what to do?*

**Score high if:** DRI names a specific team and a clear reason with named experience/URL/date. Action items are scoped and testable. GM could forward the action card directly to DRI without additional interpretation.

**Score low if:** DRI is "Product team" without specifying what to look at. Action items say "investigate further" or "monitor the situation."

---

## Output Format
1. **Overall verdict** (3–4 sentences) — what did the RCA get right? What was the main failure mode?
2. **Theme scores** — each theme with score, justification citing specific content, improvement if score ≤ 3
3. **Top 2–3 things** that would have made this RCA materially better

---

## Self-Honesty Check
- Did I give scores that reflect what I would give a colleague's work?
- Did I cite specific things from the report, not vague justifications?
- Did I identify at least one real weakness, even if overall quality was high?

> An evaluation where every theme scores 4 or 5 with no improvements is almost certainly not honest.
`,

};
