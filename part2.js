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
    condition: 'Always fires — entry point.\nDefaults to last 30 days vs prior 30 days if no dates given.',
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

  // ══ PHASE 5: L0 ORIENT ══
  {
    id: 'mix-decision', type: 'decision', icon: '⚖️',
    label: 'L0 — Orient', sublabel: 'All 3 signals read simultaneously from summary.json',
    x: 780, y: 1495, phase: 'Decision',
    badge: null,
    inputs: ['mix_dominance.is_dominant', 'shapley{LP2S/S2C/C2O}', 'trend_context{shape/structural_delta/pre_period_healthy}'],
    outputs: ['orientation signals → feed L1 cascade'],
    condition: 'Always fires after aggregate.py.\nAll three signals read simultaneously — orientation only.\nNone of these signals routes by itself; L1 cascade determines the actual path.',
    description: 'Three orientation signals read at once: (1) mix_dominance.is_dominant — hint whether cascade will find a routing exit early or confirm conversion at all levels. (2) shapley — which funnel step carries the majority of ΔCVR; used to direct L2+ branches AFTER the cascade declares the fixed segment. (3) trend_context — shape (sharp break / gradual / recovery), structural_delta_cvr vs LY, weekday composition check, and pre_period_healthy flag. No routing decision is made here — these are priors that set expectations for what the cascade and L2+ branches will find.',
  },

  // ══ L1: MIX CASCADE (always first) ══
  {
    id: 'mix-cascade', type: 'analysis', icon: '🔢',
    label: 'L1 — Mix Cascade', sublabel: 'Routing vs Conversion Determination (c021)',
    x: 780, y: 1790, phase: 'Investigation',
    badge: null,
    inputs: ['summary.json (mb_share, ho_share, mix_effect, conversion_effect)', 'ce_id', 'pre/post dates'],
    outputs: ['ROUTING EXIT at Level 1/2/3 (mix change story) OR fixed_segment + filter strings (conversion path)'],
    condition: 'ALWAYS fires immediately after L0 — the FIRST substantive L1 step.\nRuns before any LP2S / S2C / C2O analysis.\nCan exit at Level 1, 2, or 3 with a routing story.',
    description: 'Three-level cascade. At EACH level compare mix_effect vs conversion_effect. If mix_effect dominates → ROUTING EXIT at that level (traffic routing story, not a funnel problem). If conversion_effect dominates → fix the segment, descend to the next level. Level 1 (MB vs HO): summary.json — no query. Mix exit → why did HO traffic fall or MB grow? Level 2 (Paid vs Organic within fixed brand): BQ query. Mix exit → campaign paused, budget cut? Level 3 (Channel within Paid): BQ query. Mix exit → channel shift story (e.g. Google Ads vs Bing Ads vs Meta). Conversion through all three → declare Fixed segment: "[MB/HO] · [Paid/Org] · [channel]". Every L2+ funnel query carries those filters. Log the cascade as its own L1 section in the transcript tree map.',
  },

  // ══ ROUTING EXIT PATH (cascade → mix investigation) ══
  {
    id: 'q6-urls', type: 'ref', icon: '🗄️',
    label: 'Q6 — URL Traffic', sublabel: 'BQ Reference · Routing exit path',
    x: 200, y: 2090, phase: 'Data Collection',
    badge: null,
    inputs: ['ce_id', 'pre/post dates', 'primary_mbho'],
    outputs: ['page_url', 'page_type', 'users_lp pre/post', 'lp2s_rate pre/post', 'Δ_rate', 'anomaly_flag'],
    condition: 'ONLY IF cascade routing exit at any level\nOR locus is URL-concentrated (any path).',
    description: 'Top 20 URLs by pre-period LP traffic, min 50 users. Computes delta_abs and delta_rel per step per URL. Flags anomalies where rate dropped ≥15% relative AND ≥3pp absolute. Reveals which specific pages lost/gained volume — identifies LP routing error, campaign landing page change, or specific experience collapse.',
  },
  {
    id: 'mix-root', type: 'analysis', icon: '🔍',
    label: 'Mix Root Cause', sublabel: 'Routing exit investigation — 3 tiers per level',
    x: 80, y: 2390, phase: 'Analysis',
    badge: null,
    inputs: ['mbho_mix[]', 'channel_mix[]', 'cascade exit level (1/2/3)', 'Q6 URL results'],
    outputs: ['shift week · sub-segment · affected URLs · declaration', 'DRI: Marketing / Performance Marketing'],
    condition: 'ONLY IF cascade routing exit at any level.',
    description: 'Investigation path differs by exit level — same 3-tier structure: (1) Time the shift (weekly volumes → anchor week), (2) Sub-segment cut (within the exiting dimension), (3) URL impact (page_url volumes for the losing segment). Level 1 exit (HO vs MB): sub-segment = language or market within HO; URL = which collection pages lost HO traffic. Level 2 exit (Paid vs Organic): sub-segment = which paid channel declined; URL = which LPs that channel stopped serving. Level 3 exit (Channel): sub-segment = which channel gained vs which lost (e.g. Google Search → PMAX shift); URL = LPs of losing channel. Declaration: "[Segment] dropped [X%] starting [week]. Affected pages: [URLs]. Marketing owns — conversion rates within [segment] were flat." DRI is always Marketing or Performance Marketing.',
  },

  // ══ CONVERSION PATH (cascade → which funnel step?) ══
  {
    id: 'step-decision', type: 'decision', icon: '📊',
    label: 'Which Step Primary?', sublabel: 'LP2S · S2C · C2O — Shapley ≥ 30%',
    x: 1100, y: 2090, phase: 'Decision',
    badge: null,
    inputs: ['shapley.shapley{LP2S/S2C/C2O}', 'shapley.pct_contribution', 'shapley.significant_steps'],
    outputs: ['primary_driver', 'significant_steps[]'],
    condition: 'ONLY IF cascade confirms conversion path (fixed segment declared).\nUses Shapley from L0 orientation to direct L2+ branches.',
    description: 'A step is significant if |contribution / ΔCVR| ≥ 0.30. Multiple steps can be significant simultaneously — if LP2S and S2C both exceed the threshold, both driver branches fire in parallel. primary_driver = step with largest |Shapley value|. Steps below threshold are noted as "not the story" in the ruled-out section of the report. All downstream queries carry the fixed segment filters declared by the cascade.',
  },
  {
    id: 'lp2s-driver', type: 'analysis', icon: '🔬',
    label: 'LP2S Driver Analysis', sublabel: 'Listing Page → Select',
    x: 415, y: 2390, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.LP2S contribution', 'headline.delta.lp2s', 'trend shape', 'dimension cuts', 'fixed segment filters'],
    outputs: ['mechanism (pricing/UX/supply/competition)', 'onset: sudden or gradual', 'DRI hypothesis'],
    condition: 'ONLY IF "LP2S" in significant_steps.',
    description: 'Three-tier triage (work in order, do not skip ahead). All queries filtered to fixed segment. Tier 1 — dimension cuts in parallel: device × LP2S, language × LP2S, page_type × LP2S, experience × LP2S, browsing_country (Geo/Non-Geo) × LP2S. For the Geo/Non-Geo cut use the dedicated query from context.md (requires CE country pre-step + top-5 CTE logic). If any dimension concentrates, drill to the intersection (e.g. French × mobile), then to page_url — the specific URL is the target output. Geo drop → cross-cut with local language; Non-Geo country drop → cross-cut with experience_id. Tier 2 — if no dimension concentrates: pricing analysis (final_price_usd pre/post for top experiences from product_rankings_features). A CE-wide price uplift depresses LP2S broadly with no dimension concentration. Tier 3 — if pricing is also flat: session recordings on the LP are the primary tool; note "no quantitative locus found" in the transcript. DRI: Product, BDM, Performance Marketing, or Content depending on mechanism.',
  },
  {
    id: 's2c-driver', type: 'analysis', icon: '🔬',
    label: 'S2C Driver Analysis', sublabel: 'Select → Checkout',
    x: 795, y: 2390, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.S2C contribution', 'headline.delta.s2c', 'trend shape', 'dimension cuts', 'fixed segment filters'],
    outputs: ['mechanism (availability/UX/pricing/vendor)', 'onset: sudden or gradual', 'DRI hypothesis'],
    condition: 'ONLY IF "S2C" in significant_steps.',
    description: 'Two-tier triage (see hypothesis.md). All queries filtered to fixed segment. Tier 1 — dimension cuts in parallel: language × S2C, device × S2C, experience × S2C + count_days_available_30d, browsing_country (Geo/Non-Geo) × S2C. For Geo/Non-Geo use the dedicated context.md query. Language/device concentrating → localised or UX issue; drill to intersection then page_url. Experience concentrating + availability drop → run inventory_availability lead-time bucket query. Geo drop → cross-cut with local language + experience_id; Non-Geo drop → check experience_id for international inventory gaps and language variants. Tier 2: if no concentration (CE-wide drop), check for platform-wide availability config change or checkout flow change. DRI: Supply/Inventory, Product, Ops, BDM.',
  },
  {
    id: 'c2o-driver', type: 'analysis', icon: '🔬',
    label: 'C2O Driver Analysis', sublabel: 'Checkout → Order',
    x: 1175, y: 2390, phase: 'Analysis',
    badge: null,
    inputs: ['shapley.C2O contribution', 'c2o_sub.delta_c2a', 'c2o_sub.delta_a2o', 'trend shape', 'fixed segment filters'],
    outputs: ['c2a or a2o sub-metric dominant', 'DRI hypothesis', 'feeds C2A vs A2O decision'],
    condition: 'ONLY IF "C2O" in significant_steps.',
    description: 'Always decompose C2O into C2A × A2O before forming hypotheses. All queries filtered to fixed segment. C2A drop (abandon before payment): 4 hypotheses — (1) pax availability at checkout (no pack style for selected pax combo, DRI: Ops/BDM), (2) price display friction (fees visible at checkout vs listing), (3) checkout UX change (form, CTA, coupon breakage), (4) session recordings once device/language locus found. A2O drop (payment submitted but failed): 3 hypotheses — (1) gateway failure, (2) fraud rule tightening, (3) live inventory sync failure. DRI: Payments / Engineering for A2O.',
  },
  {
    id: 'c2a-a2o', type: 'decision', icon: '💳',
    label: 'C2A vs A2O Drop?', sublabel: 'Abandonment vs payment failure',
    x: 1175, y: 2685, phase: 'Decision',
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
    x: 795, y: 2685, phase: 'Decision',
    badge: null,
    inputs: ['trend.pre/post daily series (Q3)', 'trend_context.series (Q7)', 'trend_context.structural_delta_cvr', 'trend_context.pre_period_healthy'],
    outputs: ['pattern: sudden | gradual | seasonal', 'onset_date (if sudden)', 'structural_delta_cvr', 'pre_period_healthy', 'weekday composition check'],
    condition: 'Fires after conversion-path cascade.\n3 sub-steps: 3a shape, 3b LY overlay, 3c weekday composition.',
    description: 'Q3 has three sub-steps. 3a: 90-day trend shape — sharp break (something changed that day), gradual erosion (structural issue compounding), or recovery in progress (prior incident). 3b: Compare current_delta_cvr to ly_delta_cvr; compute structural_delta_cvr = current minus LY — calibrates how much is seasonal vs new. 3c: Check weekday composition — a post period with more weekends can produce an apparent drop with no real change. pre_period_healthy = FALSE → pre was already degraded, Shapley understates true change.',
  },

  // ══ RECONVERGE: HYPOTHESIS ══
  {
    id: 'hypothesis', type: 'analysis', icon: '💡',
    label: 'Hypothesis Formation', sublabel: 'Self-extending branches from hypothesis.md',
    x: 795, y: 2990, phase: 'Hypothesis',
    badge: null,
    inputs: ['Q2 primary driver', 'Q3 pattern (sudden/gradual)', 'fixed segment (from mix cascade)', 'mix root cause (if mix path)', 'c2a/a2o DRI', 'hypothesis.md first-pass branch sets'],
    outputs: ['L2 branch set (mechanism + segment + expected pattern)', 'query plan — one batch per level'],
    condition: 'Always fires after mix cascade + L0 signals.\nBoth mix and funnel paths converge here.',
    description: 'Open the first L2 branch set using hypothesis.md "first-pass branch sets" for the primary funnel step — these are the default starting set, not an exhaustive list. Run all branches in the first batch in parallel, then read results together. Each result is one of: Confirms (open a child branch testing the mechanism more specifically), Rules out (close and state why in one line), Concentrates (anchor next branches on that segment — ask why it concentrated), or Surprises (an unexpected result opens a new branch even if not in the default set). Branches grow level-by-level from what the data shows. Investigation ends at a leaf — a specific mechanism × segment/experience/URL × date — not when the default list is exhausted. All queries carry the fixed segment filters from the mix cascade.',
  },

  // ══ CUSTOM QUERIES ══
  {
    id: 'custom-select', type: 'decision', icon: '🔎',
    label: 'Custom Query Plan', sublabel: 'Write from scratch · context.md schemas',
    x: 795, y: 3290, phase: 'Investigation',
    badge: null,
    inputs: ['hypothesis_1…4', 'primary driver type', 'onset pattern'],
    outputs: ['query plan: which of Q2/Q4/Q5/Q6/custom to run'],
    condition: 'Always fires after hypothesis formation.',
    description: 'No pre-built templates. Every query is written from scratch using context.md schemas to test a specific hypothesis. Context.md provides dimension guidance (browsing_country, channel_name, lead_time_days, page_sub_type, previous_page_url, cross-cuts, experience-level with availability proxy) and common investigation patterns per funnel step. Majority-contributor principle + rate×volume rule apply to every result.',
  },
  {
    id: 'custom-results', type: 'ref', icon: '🗄️',
    label: 'Custom Query Results', sublabel: 'BQ Reference — hypothesis-driven',
    x: 795, y: 3590, phase: 'Investigation',
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
    x: 795, y: 3890, phase: 'Investigation',
    badge: null,
    inputs: ['custom query results', 'dimension cuts', 'URL anomalies'],
    outputs: ['locus: URL | device | experience | language | CE-wide', 'recording_trigger: bool'],
    condition: 'Always fires after custom queries.\nYES (concentrated in a dimension) → session recordings.\nNO (diffuse / CE-wide) → skip recordings, conclude from quantitative evidence.',
    description: 'If the drop is concentrated in a specific URL, device type, experience ID, or language — the locus is identified and Mixpanel session recordings are pulled for direct visual evidence. If the drop is diffuse across all dimensions (CE-wide), recordings are skipped and the investigation concludes from quantitative data alone.',
  },

  // ══ SESSION RECORDINGS ══
  {
    id: 'recordings', type: 'tool', icon: '🎬',
    label: 'Mixpanel Session Recordings', sublabel: 'Get-User-Replays-Data tool call',
    x: 310, y: 4180, phase: 'Evidence',
    badge: null,
    inputs: ['locus (URL / device / experience / language)', 'post_start', 'post_end', 'distinct_id or replay_ids'],
    outputs: ['Recording | Steps observed | Inference (structured table)'],
    condition: 'REQUIRED once any concentrated dimension is confirmed.\nSkipping must be explicitly justified in the report.',
    description: 'Required once a locus is confirmed — any concentrated dimension cut (URL, experience, device, language, page type) is sufficient. Any concentrated signal triggers recordings; all dimensions do not need to be confirmed simultaneously. Skipping without explanation is not acceptable once a locus has been confirmed. Moves finding from "consistent with" to "directly observed". Results presented as structured table: Recording | Steps Observed | Inference (one sentence each on what was proved or ruled out).',
  },

  // ══ OUTPUTS ══
  {
    id: 'transcript', type: 'output', icon: '📝',
    label: 'Investigation Transcript', sublabel: 'Tree map + detail sections',
    x: 795, y: 4460, phase: 'Output',
    badge: null,
    inputs: ['all branch decisions + rationale', 'queries run + results', 'hypotheses confirmed/ruled out'],
    outputs: ['<run_dir>/transcript.md'],
    condition: 'Always fires after locus decision (both paths).',
    description: 'Structured markdown file with two layers: (1) Tree map at top — full branch structure at a glance, updated as each branch resolves with CONFIRMED / RULED OUT / LEAF status. (2) Detail sections below — L0 orientation, L1 cascade results, L2+ parallel query batches with results, Root cause confirmed paragraph. Every number that enters findings.md must trace to a named query result in the detail sections.',
  },
  {
    id: 'findings', type: 'output', icon: '🔍',
    label: 'Step 2b — Findings Synthesis', sublabel: 'findings.md · gate before HTML',
    x: 795, y: 4620, phase: 'Output',
    badge: null,
    inputs: ['<run_dir>/transcript.md', 'all confirmed query results'],
    outputs: ['<run_dir>/findings.md — Root cause · Mechanism · Timing · Evidence inventory (with Source) · Open items'],
    condition: 'Always fires after transcript. Must be written and open items resolved before html-report.',
    description: 'Mandatory synthesis gate added in c010. Before writing any HTML, write findings.md with four sections: (1) Root cause — one sentence: what broke, in which segment, by how much. (2) Mechanism — the causal chain. (3) Timing — sudden/gradual/seasonal and the key evidence. (4) Evidence inventory — table with Claim / Supporting data / Source / Confidence. Every count or metric must have a named Source: a specific summary.json field, a named BQ query result, or a specific report table row. A number with no named source must be derived explicitly or removed. Then re-read critically: each "Consistent with" or "Unverified" row is an open item. Resolve with a query, arithmetic, or explicitly accept and reflect in report language. Only once all open items are resolved does Step 3 (HTML) begin. This gate is the main defence against impressions and approximations entering the report.',
  },
  {
    id: 'html-report', type: 'output', icon: '🌐',
    label: 'HTML Report', sublabel: 'Section 1: Summary → Section 2: Actions → Section 3: Analysis',
    x: 795, y: 4830, phase: 'Output',
    badge: null,
    inputs: ['findings.md (source of truth)', 'summary.json', 'session recording table', 'actions.md templates', 'report_structure.md spec'],
    outputs: ['<run_dir>/report.html'],
    condition: 'Always fires after findings.md is written and open items resolved.',
    description: 'Self-contained HTML written from findings.md as source of truth — not directly from raw query outputs. Section 1: (1a) 5 metric cards — CVR/LP2S/S2C/C2O/Traffic with pp + % deltas; (1b) 90-day CVR trend chart with LY overlay — always in Section 1, post window shaded green (improvement) or red (decline); (1c) root cause callout — red border for drops, green border for improvements, answers What/Why/When with no hedging. Positive CVR variant has heading "CVR Improved — What\'s Driving It & What\'s Holding It Back". Fixed segment banner after mix cascade output, before Shapley block. Section 2: ≤3 action cards P1–P3, specific DRI + task. Section 3: evidence only — Shapley bar, mix table, dimension cuts that showed signal; all tables must include Pre Users + Post Users columns alongside rates.',
  },
  {
    id: 'evaluation', type: 'eval', icon: '⭐',
    label: 'Evaluation', sublabel: '7-theme rubric · score 1–5 · failure mode tags',
    x: 795, y: 5090, phase: 'Evaluation',
    badge: null,
    inputs: ['4 skill reference files (read first)', 'html-report', 'investigation transcript', 'summary.json', 'evaluator.md rubric'],
    outputs: ['<run_dir>/evaluation.md', 'score per theme (1–5)', 'Gap + Why per gap', 'Failure Mode Summary table'],
    condition: 'Always fires last — terminal node.',
    description: 'Read skill files FIRST (SKILL.md, hypothesis.md, context.md, report_structure.md), then re-read report + transcript + summary.json. Grade 7 themes 1–5. Every gap (score ≤ 4) requires a Gap description and a Why line with one of four failure mode tags: [MISSING_INSTRUCTION] / [AMBIGUOUS_INSTRUCTION] / [EXEC_ERROR] / [DATA_LIMIT] — each tag must be grounded with a citation proving the file was checked. Output includes an Overall verdict, Theme scores with Gap/Why blocks, Top 2–3 improvements, and a Section 4 Failure Mode Summary table mapping every gap to a named file + fix. Written to <run_dir>/evaluation.md.',
  },

  // ══ REFERENCE FILE NODES ══
  {
    id: 'file-skill', type: 'file', icon: '📄',
    label: 'SKILL.md', sublabel: 'Master decision protocol',
    x: 1670, y: 70, phase: 'Reference File',
    usedBy: ['user-input'],
    fileKey: 'skill',
    chips: ['lean process orchestrator', 'Step 2b — findings.md synthesis', 'Source column on every evidence claim', '3-sub-step Q3', 'data pull errors — log and continue', 'recordings required once locus confirmed'],
  },
  {
    id: 'file-context', type: 'file', icon: '📄',
    label: 'context.md', sublabel: 'Business vocab, schemas, query rules — v1.4',
    x: 1670, y: 360, phase: 'Reference File',
    usedBy: ['mix-decision', 'step-decision'],
    fileKey: 'context',
    chips: ['Query Principles', 'Q3 Trend Interpretation', 'Mix Cascade queries', 'mix/conv effect arithmetic', 'Geo vs Non-Geo query (c013)', 'canonical L2+ template', 'inventory_availability schema', 'PERF_MAX filter (c012)'],
  },
  {
    id: 'file-hypothesis', type: 'file', icon: '📄',
    label: 'hypothesis.md', sublabel: 'Central branch reference — two-level (v1.4)',
    x: 1670, y: 2990, phase: 'Reference File',
    usedBy: ['hypothesis'],
    fileKey: 'hypothesis',
    chips: ['L0 routing map', 'Mix routing exit — 3 levels × 3 tiers', 'LP2S 3-tier + Geo/Non-Geo', 'S2C 2-tier + Geo/Non-Geo', 'C2O 4+3 + Geo/Non-Geo optional', 'URL concentration', '10 historical patterns'],
  },
  {
    id: 'file-actions', type: 'file', icon: '📄',
    label: 'actions.md', sublabel: '10 root causes → action templates',
    x: 1670, y: 4750, phase: 'Reference File',
    usedBy: ['html-report'],
    fileKey: 'actions',
    chips: ['P1/P2/P3 actions', 'DRI per root cause', '10 RCs', 'historical refs'],
  },
  {
    id: 'file-report-struct', type: 'file', icon: '📄',
    label: 'report_structure.md', sublabel: '3-section spec + HTML/CSS patterns — v1.4',
    x: 1670, y: 5000, phase: 'Reference File',
    usedBy: ['html-report'],
    fileKey: 'reportStruct',
    chips: ['90d chart in S1 (always)', 'positive CVR green variant', 'mix cascade analysis block (3 tables)', 'fixed segment banner', 'raw user counts mandatory', 'weekly x-axis ticks'],
  },
  {
    id: 'file-evaluator', type: 'file', icon: '📄',
    label: 'evaluator.md', sublabel: '7-theme rubric · failure mode tags · v1.5',
    x: 1670, y: 5250, phase: 'Reference File',
    usedBy: ['evaluation'],
    fileKey: 'evaluator',
    chips: ['7 themes', 'score 1–5', 'read skill files first', 'Gap + Why per gap', 'failure mode tags (4)', 'Section 4 Failure Mode Summary', 'self-honesty check'],
  },
  {
    id: 'file-worked-example', type: 'file', icon: '📄',
    label: 'worked_example.md', sublabel: 'Two end-to-end investigation walkthroughs',
    x: 1670, y: 3190, phase: 'Reference File',
    usedBy: ['hypothesis'],
    fileKey: 'workedExample',
    chips: ['Mix-dominant walkthrough', 'Conversion + locus walkthrough', 'French × iOS cross-cut', 'session recordings'],
  },
  {
    id: 'file-events', type: 'file', icon: '📄',
    label: 'events.md', sublabel: 'GTM/Mixpanel funnel event reference',
    x: 1670, y: 4150, phase: 'Reference File',
    usedBy: ['recordings'],
    fileKey: 'events',
    chips: ['LP events — 15 structured + 4 unstructured', 'S2C events — 14 structured + 3 unstructured', 'C2O events — 15 structured + 8 unstructured', 'session join key (h-sid / HSID)', 'excluded noise events'],
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

  // L0 → L1 cascade (always)
  { id:'e8',  from:'mix-decision',  to:'mix-cascade',    type:'always',      label:'L0 signals read'           },

  // Mix cascade → routing exit path
  { id:'e9',  from:'mix-cascade',   to:'q6-urls',        type:'conditional', label:'routing exit L1/L2/L3'     },
  { id:'e10', from:'q6-urls',       to:'mix-root',       type:'conditional', label:'URL traffic results'       },

  // Mix cascade → conversion path (fixed segment declared)
  { id:'e11', from:'mix-cascade',   to:'step-decision',  type:'conditional', label:'conversion path — fixed segment' },
  { id:'e12', from:'step-decision', to:'lp2s-driver',    type:'conditional', label:'"LP2S" ∈ sig_steps'        },
  { id:'e13', from:'step-decision', to:'s2c-driver',     type:'conditional', label:'"S2C" ∈ sig_steps'         },
  { id:'e14', from:'step-decision', to:'c2o-driver',     type:'conditional', label:'"C2O" ∈ sig_steps'         },
  { id:'e15', from:'c2o-driver',    to:'c2a-a2o',        type:'conditional', label:'delta_c2a + delta_a2o'     },

  // Trend pattern (Q3) — runs alongside driver analysis
  { id:'e16', from:'step-decision', to:'trend-pattern',  type:'always',      label:'reads Q3 + Q7 series'      },

  // All paths converge at hypothesis
  { id:'e17', from:'mix-root',      to:'hypothesis',     type:'conditional', label:'mix mechanism'             },
  { id:'e18', from:'lp2s-driver',   to:'hypothesis',     type:'conditional', label:'LP2S mechanism'            },
  { id:'e19', from:'s2c-driver',    to:'hypothesis',     type:'conditional', label:'S2C mechanism'             },
  { id:'e20', from:'c2a-a2o',       to:'hypothesis',     type:'conditional', label:'C2O sub-driver'            },
  { id:'e21', from:'trend-pattern', to:'hypothesis',     type:'always',      label:'onset pattern'             },

  // Custom queries
  { id:'e22', from:'hypothesis',    to:'custom-select',  type:'always',      label:'L2 branch set'             },
  { id:'e23', from:'custom-select', to:'custom-results', type:'conditional', label:'selected queries'          },
  { id:'e24', from:'custom-results',to:'locus',          type:'always',      label:'query results'             },
  { id:'e25', from:'custom-select', to:'locus',          type:'conditional', label:'if no queries needed'      },

  // Locus → recordings → outputs
  { id:'e26', from:'locus',         to:'recordings',     type:'conditional', label:'YES: locus confirmed'      },
  { id:'e27', from:'recordings',    to:'transcript',     type:'conditional', label:'recording observations'    },
  { id:'e28', from:'locus',         to:'transcript',     type:'always',      label:'investigation complete'    },
  { id:'e29', from:'transcript',    to:'findings',       type:'always',      label:'root cause confirmed'      },
  { id:'e29b', from:'findings',     to:'html-report',    type:'always',      label:'verified findings.md'      },
  { id:'e30', from:'html-report',   to:'evaluation',     type:'always',      label:'completed report'          },

  // Consults (file → node, dotted)
  { id:'c1',  from:'file-skill',       to:'user-input',    type:'consults', label:'master protocol'           },
  { id:'c2',  from:'file-context',     to:'mix-cascade',   type:'consults', label:'Mix Cascade queries + domain vocab' },
  { id:'c3',  from:'file-hypothesis',  to:'hypothesis',    type:'consults', label:'L0 map + first-pass branches' },
  { id:'c4',  from:'file-actions',     to:'html-report',   type:'consults', label:'action templates'          },
  { id:'c5',  from:'file-report-struct',to:'findings',     type:'consults', label:'output spec — read before synthesis' },
  { id:'c5b', from:'file-report-struct',to:'html-report',  type:'consults', label:'HTML/CSS spec'             },
  { id:'c6',  from:'file-evaluator',   to:'evaluation',    type:'consults', label:'7-theme rubric'            },
  { id:'c7',  from:'file-worked-example', to:'hypothesis',  type:'consults', label:'worked examples'           },
  { id:'c8',  from:'file-events',         to:'recordings',  type:'consults', label:'event map — what to look for' },
];

// ── Canvas section labels ─────────────────────────────────────────────────────
const SECTION_LABELS = [
  { text: '① Input',                    x: 30, y: 42  },
  { text: '② CE Metadata',              x: 30, y: 327 },
  { text: '③ Base Funnel',              x: 30, y: 607 },
  { text: '④ Parallel BQ Queries',      x: 30, y: 887 },
  { text: '⑤ Aggregation',              x: 30, y: 1167 },
  { text: '⑥ L0 — Orient',             x: 30, y: 1467},
  { text: '⑦ L1 — Mix Cascade',         x: 30, y: 1762},
  { text: '⑧ Routing Exit / Step Selection', x: 30, y: 2062},
  { text: '⑨ Driver Analysis',          x: 30, y: 2362},
  { text: '⑩ Q3 + C2O Sub-decisions',   x: 30, y: 2657},
  { text: '⑪ Hypothesis',               x: 30, y: 2962},
  { text: '⑫ Custom Queries',           x: 30, y: 3262},
  { text: '⑬ Query Results',            x: 30, y: 3562},
  { text: '⑭ Locus + Recordings',       x: 30, y: 3862},
  { text: '⑮ Transcript',               x: 30, y: 4432},
  { text: '⑯ Step 2b — Findings',      x: 30, y: 4592},
  { text: '⑰ HTML Report',              x: 30, y: 4802},
  { text: '⑱ Evaluation',              x: 30, y: 5062},
];

// ── File contents (curated markdown rendered in the side panel) ───────────────
const FILE_CONTENTS = {

skill: `# SKILL.md — Master Decision Protocol (v1.4, c011)

## Purpose
Pure process orchestrator. \`context.md\` owns business vocab, schemas, and query rules. \`hypothesis.md\` is the central branch reference — L0 routing map + first-pass branch sets + historical patterns.

---

## Before You Begin (always)
\`\`\`bash
cat context.md           # domain vocab, schemas, query rules — read before writing any query
cat hypothesis.md        # two-level branch reference — read before forming any branch
cat actions.md           # root cause → action mappings
cat report_structure.md  # output spec (3-section layout)
\`\`\`

---

## Step 1 — Baseline queries
Run \`run_analysis.sh\`. Produces \`summary.json\` in \`<run_dir>\` under \`~/Documents/RCA skill/Test Runs/\`. Folder: \`ce<ce_id>_<pre_start>_<post_end>/\`. Auto-increments on re-run (_run2, _run3…).

---

## Step 2 — Investigate (L0 → L1 cascade → L2+ branches)

Open \`<run_dir>/transcript.md\` before reading data. Two layers: **tree map** at top (branch structure at a glance) + **detail sections** below. Update tree map each time a branch resolves.

**L0 — Orient from summary.json (all three signals simultaneously)**
1. **mix_dominance** — orientation hint only; the L1 cascade determines routing vs conversion
2. **shapley** — which funnel step carries the majority of ΔCVR (directs L2+ after cascade)
3. **trend_context** — shape (sharp/gradual/recovery) + seasonal calibration (structural_delta_cvr) + weekday composition

**L1 — Mix cascade (routing vs conversion determination)**
Three levels, each with a mix exit and a conversion path:
- Level 1: MB vs HO (summary.json — no query). Mix exit → routing story. Conversion → fix brand, run L2.
- Level 2: Paid vs Organic within fixed brand (BQ query). Mix exit → campaign/budget story. Conversion → fix type, run L3.
- Level 3: Channel within Paid (BQ query). Mix exit → channel shift story. Conversion → fixed segment.

Declare in transcript before any funnel branches: \`Fixed segment: [MB/HO] · [Paid/Organic] · [channel]\` + filter strings. Every L2+ query carries these filters.

**L2+ — Branch and descend (all queries filtered to fixed segment)**
Open first branches from \`hypothesis.md\` first-pass sets for the primary Shapley step. Run level in parallel, read together. Each result: **Confirms** (child branch), **Rules out** (state why), **Concentrates** (anchor + ask why), **Surprises** (open new branch). Investigation ends at the **leaf** — not when the default list is exhausted.

**Session recordings** — required once any concentrated dimension (URL, device, experience, language) is confirmed. Skipping without explicit justification is not acceptable.

---

## Step 2b — Synthesise findings (before writing HTML)

Write \`<run_dir>/findings.md\`:

\`\`\`markdown
## Root cause
[One sentence: what broke, in which segment, by how much]

## Mechanism
[The causal chain — what actually happened]

## Timing
[Sudden / gradual / seasonal — and the key evidence]

## Evidence inventory
| Claim | Supporting data | Source | Confidence |
|-------|----------------|--------|------------|
| [claim] | [specific numbers] | [summary.json field / BQ query result / report table row] | Confirmed / Consistent with / Unverified |

## Open items
[Each Consistent with / Unverified row that a query could close]
\`\`\`

**Every count or metric must have a named Source.** If you cannot name the source, derive it explicitly with arithmetic or remove it — a number with no source must not enter the report. Re-read critically: resolve open items with a query or arithmetic, or explicitly accept "Consistent with" and reflect that in report language.

---

## Step 3 — Write the report
Follow \`report_structure.md\` exactly. Write from \`findings.md\` as source of truth. Output: \`<run_dir>/report.html\`

---

## Step 4 — Evaluate
Read \`evaluator.md\` rubric first. Re-read report, transcript, summary.json. Score 7 themes 1–5. Write to \`<run_dir>/evaluation.md\`.

---

## Changelog (selected)
| # | Date | Change |
|---|------|--------|
| c009 | 2026-04-27 | Default window changed to last 30 days vs prior 30 days |
| c010 | 2026-04-27 | Step 2b added — structured findings.md before HTML; open items resolved before proceeding |
| c011 | 2026-04-27 | Evidence inventory gains Source column — every claim must name its data origin |
| c012 | 2026-04-27 | Investigation tree model (L0 → L1 → leaf) replaces sequential gates |
| c017 | 2026-04-29 | Mix cascade as mandatory L1; fixed segment for all L2+ queries |
| c018 | 2026-04-29 | Self-extending hypothesis loop; four result types incl. Surprises |
| c021 | 2026-04-29 | Mix cascade repositioned as routing vs conversion determination; L0 signal 1 is orientation only |
`,

context: `# context.md — Domain Knowledge Hub (v1.1, updated c009)

Read before touching any data, writing callouts, or forming hypotheses. This file owns all business vocabulary, table schemas, analytical concepts, and query rules. Investigation patterns and hypothesis logic live in \`hypothesis.md\`.

---

## Combined Entity (CE)
Headout's core unit of business reporting. A curated grouping of experiences within a specific geography × experience type (e.g., "Skip-the-Line Colosseum in Rome" = CE 167). \`combined_entity_id\` is STRING — always filter with \`= '<ce_id>'\`, no CAST.

---

## MB vs HO — The Two Distribution Channels

| Code | Full name | What it is | Base CVR |
|------|-----------|------------|----------|
| **MB** | Microbrand | White-label city microsites (ticketslondon.com etc). SEO, affiliates, partner referrals. | Lower — discovery-oriented |
| **HO** | Headout | headout.com. High-intent paid search (Google/Bing), direct, email. | Higher — intent-driven |

A shift in traffic share toward MB depresses overall CVR even if per-segment rates hold. Always distinguish MB rate drop vs HO rate drop vs traffic mix shift.

---

## Funnel Steps — CVR = LP2S × S2C × C2O

| Step | From → To | Drop usually means |
|------|----------|--------------------|
| **LP2S** | Landing page → Select/Date-picker | Price too high, UX change, low availability shown, ad mismatch |
| **S2C** | Select page → Checkout Started | No bookable dates, price shock at variant, UX friction, variant confusion |
| **C2O** | Checkout Started → Order confirmed | Decompose into C2A and A2O (see below) |

- **C2A drop** = users abandon before submitting payment → UX/pricing friction. DRI: Product/UX
- **A2O drop** = payment submitted but order failed → gateway, fraud, FX, live inventory failure. DRI: Payments/Engineering

---

## Mix Cascade — Routing vs Conversion Determination (c006/c010/c012)

Run as the first L1 step. Three levels — at each level compare mix_effect vs conversion_effect from the query output:

**mix_effect = Δshare × pre_rate** · **conversion_effect = pre_share × Δrate**

Compute explicitly in the transcript (sum across segments). The dominant term is the story. Mix dominates → routing exit at that level. Conversion dominates → fix segment, descend.

**Level 1 — MB vs HO:** summary.json — no query. Fix \`is_microbrand_page = TRUE/FALSE\`.
**Level 2 — Paid vs Organic (within fixed brand):** BQ query. Must include PERFORMANCE_MAX filter AND use \`COUNT(DISTINCT CASE WHEN has_X THEN user_id END)\` (not COUNTIF) — funnel table fans out on multi-experience sessions; COUNTIF numerators can exceed denominators.
**Level 3 — Channel within Paid:** BQ query, same fix pattern. Channels: Google Ads, Microsoft Ads, Facebook Ads (Meta), Affiliates.

**Declare in transcript before any funnel branches:**
- Conversion path: \`Fixed segment: [MB/HO] · [Paid/Org] · [channel]\` + filter strings
- Routing exit: \`Mix change at Level [X] — [reason]\` → follow routing exit investigation in hypothesis.md

**Decision rule:** Fix a level when one segment has >15% post users AND its checkout impact dominates. Routing exit when mix_effect dominates conversion_effect at that level.

---

## DRI Quick Reference

| Finding | Most common DRI | Other possible DRIs |
|---------|-----------------|---------------------|
| LP2S drop, mobile, sudden | Product (front-end) | Engineering (performance) |
| LP2S drop, gradual | Supply / Inventory | Performance Marketing; BDM; Content |
| LP2S drop, specific language | Localisation / Marketing | BDM; Performance Marketing |
| S2C drop | Supply / Inventory or Product (UX) | Ops/BDM |
| C2O: C2A drop | Product / UX | Ops (custom fields, pax setup) |
| C2O: A2O drop | Payments team | Engineering/Ops (live inventory sync) |
| MB/HO mix shift | Marketing (traffic allocation) | Performance Marketing |
| Channel mix shift | Performance Marketing | — |

---

## Key Analytical Concepts

**Shapley:** LP2S × S2C × C2O contributions averaged across all 6 orderings. Always sum exactly to ΔCVR — no residual.

**Mix vs Conversion Effect:** \`mix_effect = Δshare × pre_rate\` (routing); \`conversion_effect = pre_share × Δrate\` (funnel); \`interaction = Δshare × Δrate\` (cross-term).

**Traffic Non-Additivity:** Users across dimension cuts (language, page_type, device) are NOT additive. Each dimension needs its own \`COUNT(DISTINCT user_id)\` subquery. Never sum across cuts.

**C2O = C2A × A2O.** Already computed in Stage 1 using \`users_order_attempted\` — no extra BQ query needed.

---

## Primary Table — \`mixpanel_user_page_funnel_progression\`

**Standard filter pattern (all queries):**
\`\`\`sql
WHERE combined_entity_id = '<ce_id>'
  AND event_date BETWEEN '<start>' AND '<end>'
  AND (advertising_channel_type IS NULL
       OR advertising_channel_type != 'PERFORMANCE_MAX')
\`\`\`

**Critical rules:**
- \`combined_entity_id\` is STRING — no CAST
- \`event_date\` is partition key — always filter on it
- \`is_microbrand_page = TRUE\` → MB; \`FALSE\` → HO
- \`has_order_completed\` uses Order Confirmation Page as proxy (reliable)
- **Do not use** \`flow_type\` (doesn't exist), \`session_date\` (doesn't exist), \`experience_name\` (not in this table)
- \`advertising_channel_type\` = 'PERFORMANCE_MAX' inflates counts — always exclude
- \`experience_id\` is NULL until the user reaches the select page

---

## inventory_availability Table (NEW in c004)

\`analytics_reporting.inventory_availability\` — daily inventory snapshots. **30-day rolling window** (both \`experience_date\` and \`extracted_date\` within 30 days). For older periods use \`analytics_intermediate.inventory_changes\`.

**Key columns:** \`tour_id\`, \`experience_date\`, \`extracted_date\`, \`total_remaining\`, \`count_time_slots\`

**Bridge path:** \`dim_experiences\` has no \`tour_id\`; \`inventory_availability\` has no \`experience_id\`. Use \`dim_tours\` as two-hop bridge: \`dim_experiences → dim_tours → inventory_availability\`.

Lead-time bucket query: bucket \`DATE_DIFF(experience_date, extracted_date, DAY)\` into 0-2d / 3-6d / 7-13d / 14-29d / 30d+. Compare \`count_dates_zero_inventory\` and \`avg_remaining\` per bucket across pre vs post.

---

## Query Principles

**Majority-contributor:** Before citing any entity as a driver, ask: does it represent a meaningful share of CE traffic? Long-tail entities (high-variance rate on tiny volume) are noise, not evidence.

**Rate × volume:** Always compute absolute checkout/order loss (rate change × volume) before declaring a primary driver. A large rate drop on a small segment and a small rate drop on a large segment can point in opposite directions.

---

## Q3 Trend Interpretation (3 sub-steps)

- **3a — 90-day shape:** Sharp break → something changed that day (find it). Gradual erosion → compounding structural trend. Recovery in progress → understand prior incident.
- **3b — LY overlay:** Compare \`current_delta_cvr\` to \`ly_delta_cvr\`. Use \`structural_delta_cvr\` (current minus LY) as the true investigation magnitude.
- **3c — Weekday composition:** More weekends in post = apparent drop with no real change for many CE types. Count the mix before attributing magnitude to product/supply causes.

---

## Geo vs Non-Geo dimension (c013)

Use when the CE is in a high-domestic-demand market and you suspect different dynamics between local and international visitors.

**Pre-step:** Look up CE home country: \`SELECT DISTINCT country FROM dim_experiences WHERE combined_entity_id = '<ce_id>'\`. Use \`dim_experiences.country\` — \`dim_combined_entities.country\` can be NULL for sheet-only CEs.

Query returns top 5 countries by combined pre+post volume, home country always included. Each row tagged with \`geo_segment\`: Geo (home country) / Non-Geo / Unknown. Apply fixed segment filters from cascade.

**Interpreting results:**
- Geo drop only → local supply, pricing, or campaign issue. Cross-cut with local language.
- Non-Geo country drop → international traffic quality, language/UX gap, international supply. Cross-cut with experience_id.
- Use for LP2S, S2C, and (optionally) C2A when the drop is broad with no device/experience concentration.

---

## Canonical L2+ query template (c012)

All L2+ queries use this pattern — swap \`<dimension>\` in SELECT/GROUP BY. Fixed segment filters (last two WHERE lines) never change within a single investigation:

\`\`\`sql
SELECT <dimension>, period,
  COUNT(DISTINCT user_id) AS users_lp,
  SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN has_select_page_viewed THEN user_id END), COUNT(DISTINCT user_id)) AS lp2s,
  SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN has_checkout_started THEN user_id END),
              COUNT(DISTINCT CASE WHEN has_select_page_viewed THEN user_id END)) AS s2c,
  ...
FROM mixpanel_user_page_funnel_progression
WHERE combined_entity_id = '<CE_ID>'
  AND event_date BETWEEN '<PRE_START>' AND '<POST_END>'
  AND (advertising_channel_type IS NULL OR advertising_channel_type != 'PERFORMANCE_MAX')
  AND is_microbrand_page = <TRUE|FALSE>  -- fixed from cascade Level 1
  AND channel_name = '<channel>'         -- fixed from cascade Level 3
GROUP BY 1, 2
\`\`\`

Use \`COUNT(DISTINCT CASE WHEN ... END)\` not COUNTIF — the funnel table fans out rows for multi-experience sessions; COUNTIF numerators can exceed COUNT(DISTINCT user_id) denominators and produce rates > 1.0.

---

## Changelog (selected)
| # | Date | Change |
|---|------|--------|
| c002 | 2026-04-27 | Query Principles, Q3 Trend, Dimensions to Query, Session Recordings guidance added |
| c004 | 2026-04-28 | inventory_availability + inventory_changes schemas; lead-time bucket query |
| c006 | 2026-04-29 | Mix Cascade section added (3-level cascade, decision rule, fixed-segment declaration) |
| c009 | 2026-04-29 | Investigation patterns moved to hypothesis.md |
| c012 | 2026-05-04 | Fixed COUNTIF → COUNT(DISTINCT CASE WHEN) in cascade Level 2/3 and L2+ queries; added PERFORMANCE_MAX filter to Level 2/3 cascade queries; added mix_effect/conversion_effect arithmetic guide with worked example |
| c013 | 2026-05-04 | Added Geo vs Non-Geo dimension: CE country pre-step, country-level query with top-5 CTE + home country always included, interpretation guide for Geo/Non-Geo signals |
`,

hypothesis: `# hypothesis.md — Central Branch Reference (v1.4, two-level)

## How to use this file

Two levels of guidance:

**Level 1 — L0 routing map + first-pass branch sets** (sections immediately below): tells you *which branches to open* at L1 and L2. Read before forming any hypothesis.

**Level 2 — Historical patterns** (Pattern 1–10 below that): provides *specific mechanism hypotheses* once a first-pass branch confirms a direction. Use to decide *why* something may have happened in a confirmed dimension.

These patterns are **starting points, not a menu.** Follow what the data actually shows — if \`summary.json\` points to a mechanism not listed, follow it.

---

## L0 signal → first branches to open

| L0 signal | Value / pattern | L1 branches to open |
|-----------|----------------|---------------------|
| \`mix_dominance.is_dominant = true\` | Routing story | (a) Which MB/HO segment or channel drove the shift? (b) Which URLs or channels gained/lost volume? |
| Shapley: LP2S dominates | LP2S is funnel story | (a) Device × LP2S — mobile? (b) Page type × LP2S — Collection vs Experience? (c) Price change for top experiences? (d) URL-level traffic loss? |
| Shapley: S2C dominates | S2C is funnel story | (a) Language × S2C? (b) Device × S2C — mobile select-page? (c) Experience-level S2C + availability proxy? (d) Lead time distribution shift? (e) MB vs HO S2C split? |
| Shapley: C2O dominates | C2O is funnel story | (a) C2A vs A2O sub-decomposition? (b) Channel × C2O? (c) Device × C2O — mobile checkout? |
| Trend: sharp break on date X | Event on date X | (a) Which dimension shows largest rate change anchored to that date? (b) Paid campaign change? Deploy? Supply config? |
| Trend: gradual erosion | Compounding trend | (a) Supply trend (availability proxy over time)? (b) Pricing trend? (c) Traffic quality trend? |
| Trend: seasonal (\`structural_delta_cvr\` small) | Calibrate depth | Still investigate — use \`structural_delta_cvr\` as magnitude, not \`current_delta_cvr\` |

Multiple L0 signals combine. If S2C dominates AND sharp break: "experience-level S2C anchored to break date" + "availability proxy change on that date". If mix dominant AND gradual: "which channel or URL has been losing traffic over past N weeks".

---

## First-pass branch sets by primary driver

The investigation ends at a **leaf** (specific mechanism + segment + URL/date), NOT when this list is exhausted. Common reasons the list runs out before a leaf: cross-cut not tested, finer grain not drilled, cause is in a different table.

### Mix — routing exit investigation (3 levels × 3 tiers)

A routing exit means traffic composition shifted. Same 3-tier structure for all levels: (1) Time the shift → weekly volumes, find anchor week. (2) Sub-segment cut → narrow within the exiting dimension. (3) URL impact → page_url volumes for losing segment.

**Level 1 exit (HO vs MB shift):** Sub-segment = language or market within HO. Declaration: "HO traffic dropped [X%] starting [week]. Concentrated in [lang/market]. Affected pages: [URLs]. Conversion rates within HO were flat — Marketing owns."

**Level 2 exit (Paid vs Organic shift):** Sub-segment = which paid channel declined. Declaration: "Paid traffic dropped [X%] starting [date]. Channel: [X]. Affected pages: [URLs]. Marketing owns."

**Level 3 exit (Channel shift within Paid):** Sub-segment = which channel gained/lost (e.g. Google Search → PMAX). Declaration: "[Channel A] lost [X%] impression share to [Channel B] starting [week]. Affected pages: [URLs]. Conversion rates within [Channel A] were flat — spend/allocation story."

Finding complete when you can name: shift week · sub-segment · affected page URLs.

### LP2S — three-tier (work in order)

**Tier 1 — Dimension cuts in parallel:**
- \`device_type\` × LP2S — mobile drop → UI/performance change
- \`language\` × LP2S — single language drop → geo-specific pricing/UX
- \`page_type\` × LP2S — Collection drop → browse-level friction
- \`experience_id\` × LP2S — few experiences → listing quality/price/availability
- \`browsing_country\` (Geo/Non-Geo) × LP2S — use dedicated query from \`context.md → "Geo vs Non-Geo"\`. Geo drop → local pricing/supply/campaign; Non-Geo drop → international traffic quality or UX gap.

If a dimension concentrates: run intersection (e.g., French × mobile), drill to \`page_url\`. **The page URL is the target output.** Geo drop → cross-cut with local language; Non-Geo drop → cross-cut with experience_id.

**Tier 2 — If no dimension concentrates:** Price analysis — \`final_price_usd\` from \`product_rankings_features\` pre vs post. CE-wide price uplift depresses LP2S broadly.

**Tier 3 — If pricing flat:** Session recordings — look for UX pattern affecting all users. Note "no quantitative locus found".

### S2C — two-tier (work in order)

**Tier 1 — Dimension cuts in parallel:**
- \`language\` × S2C — single language → localised select-page issue
- \`device_type\` × S2C — mobile → select-page UX/rendering
- \`experience_id\` × S2C — specific experiences → supply/pricing. Confirm with \`count_days_available_30d\`; run \`inventory_availability\` lead-time bucket query.
- \`browsing_country\` (Geo/Non-Geo) × S2C — use dedicated context.md query. Geo S2C drop → local supply scarcity or pricing shock at variant selection; Non-Geo drop → language/UX friction or international inventory gaps.

If language/device concentrates: drill to intersection, then \`page_url\`. If Geo concentrates: cross-cut with local language + experience_id. If Non-Geo concentrates: cross-cut with experience_id and language.

If experience concentrates: demand-side (\`lead_time_days\`) + supply-side (\`inventory_availability\` bucket) — both shifting = supply-caused.

**Tier 2 — If no concentration:** Did checkout flow or variant selection UI change? Did availability drop uniformly (platform-wide config)?

### C2O — decompose first, always

Check \`c2o_sub\` from \`summary.json\` before any queries. C2A and A2O point to completely different causes.

**If C2A dropped (pre-payment abandonment) — 4 hypotheses in parallel:**
1. Pax availability at checkout — certain pax combinations unavailable → DRI: Ops/BDM
2. Price display friction — checkout price differs from listing price
3. Checkout UX change — form field, CTA, coupon, or trust signal change (mobile most sensitive)
4. Session recordings on checkout page

**Optional — if C2A drop is broad with no device/experience concentration:** Run Geo/Non-Geo cut. A checkout abandonment rate that spikes in specific countries can point to currency display friction or payment method unavailability in that market.

**If A2O dropped (payment submitted but failed) — 3 hypotheses in parallel:**
1. Payment gateway failure — elevated decline rate for specific gateway/card network
2. Fraud rule tightening — new fraud model blocking legitimate transactions
3. Live inventory failure — slot sold out between checkout start and payment confirmation

---

## URL concentration — cross-cutting check

Before step-specific patterns: check URL breakdown in \`summary.json\` for the affected metric.

- Drop concentrated in 2–3 high-traffic URLs → something specific about those pages (template change, specific experience, audience)
- Drop spread uniformly across all high-traffic URLs → CE-wide mechanism (availability, pricing, platform change)

Volume filter applies: long-tail URLs (small CE traffic share) produce high-variance estimates — directional only.

---

## Historical patterns — mechanism detail

### Pattern 1: LP2S — Sudden Onset
1. Pricing increase on listing page (SP rate change, discount removed, fees now in display price)
2. LP/MB format deploy added extra decision step (Vienna concerts: LP2S halved overnight)
3. Campaign routing error — paid to wrong LP (NY Helicopter: language campaigns → old SF LP)
4. Product ranking change — new top product with lower inherent CVR
5. Competitor flash promotion — sudden price advantage on GYG/Viator

### Pattern 2: LP2S — Gradual Decline
1. Supply thinning — \`days_to_first_available_date\` increasing
2. SIS cap — marginal paid clicks lower-intent
3. Competitive pressure — GYG/Viator strengthened listing quality
4. Content degradation — images, descriptions, review count stagnating
5. Assortment drift — lower-CVR products added to CE

### Pattern 3: S2C — Sudden Onset
1. Availability config tightened — API cut-off shortened, release window changed
2. Select page UX regression — date-picker broken, mobile-concentrated
3. Price shock at variant level — LP shows base price, select shows full price
4. Specific experience availability collapse — vendor closed inventory
5. TGID misconfiguration — wrong variants linked

### Pattern 4: S2C — Gradual Decline
1. Inventory thinning — SP progressively reducing slots or shortening booking window
2. Variant complexity / decision paralysis (Vienna concerts: venue × composer × price combinations)
3. Vendor throttling — SP quietly reduces slots; \`count_days_available_30d\` and \`days_to_first_available_date\` both worsen
4. Seasonal availability pattern — compare to prior-year

### Pattern 5: C2O — C2A Drop
1. Hidden fees revealed at checkout (helipad fees, booking fees, taxes)
2. Checkout UX friction (new required field, autofill broke, payment option removed)
3. Booking fee / mandatory add-on surprise
4. Coupon breakage — active promo code stopped working
5. Trust signals missing

### Pattern 6: C2O — A2O Drop
1. Payment gateway degradation — timeout, error rate spike
2. Fraud rule tightening — increased decline rate for certain card types/geographies
3. Currency/FX display error at payment step
4. New payment method regression

### Pattern 7: MB/HO Mix Shift
1. Paid campaign paused / budget reallocated — HO traffic drops, MB organic share rises (NY Helicopter: 75% drop in English campaign clicks → CVR collapse via mix)
2. LP routing error — campaigns send traffic to MB page instead of headout.com
3. Seasonal organic MB spike without corresponding paid HO increase
4. Budget reallocated to another CE

### Patterns 8–10: Concentrated Drops
**Device:** Mobile UI deploy regression (iOS Safari most sensitive), performance degradation, mobile feature breakage

**Language:** Geo-specific campaign change, localisation issue (translations, RTL layout), geo-specific pricing/availability change

**Experience-level (S2C):** Availability collapse (check \`count_days_available_30d\`), vendor-specific operational issue, experience-specific pricing change, TGID misconfiguration

---

## Changelog
| # | Date | Change |
|---|------|--------|
| c002 | 2026-04-24 | "How to use this file" preamble — historical priors, not a constraint |
| c003 | 2026-04-24 | URL concentration section added as cross-cutting first check |
| c004 | 2026-04-29 | Restructured as two-level reference: Level 1 (L0 routing map + first-pass branch sets) moved from context.md; Level 2 (historical patterns) retained |
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

---

## Mix cascade analysis block (Section 3)

Render one \`.analysis-block\` with three sub-tables (one per cascade level). Each table shows mix_effect vs conversion_effect explicitly so the reader can verify the routing-vs-conversion decision.

**Verdict line states the overall outcome:**
- Conversion path: "Conversion change at all levels — no routing story. Fixed segment: [MB/HO] · [Paid/Organic] · [Channel]."
- Routing exit: "Routing story — mix change detected at Level [1/2/3]. [One-line reason.]"

**Each sub-table** has columns: Segment · Pre users · Post users · Pre share · Post share · Pre CVR · Post CVR · Mix effect · Conv. effect · Verdict. Highlight the fixed segment row with \`.highlight-row\`.

**If cascade exited at a mix level:** render only levels up to and including the exit level. Exit level verdict cell: "Mix exit — routing story". Do not render levels that were not run.
`,

evaluator: `# evaluator.md — Quality Evaluator (v1.5, e001)

Step back after completing the RCA and grade your own work honestly. This is not a formality.

> Be harder on yourself than a colleague would be.

---

## What to review (in this order)
1. **The four skill reference files first** — so you know what instructions existed before reading the output:
   - \`SKILL.md\` — investigation process (L0 → L1 cascade → L2+ branches)
   - \`hypothesis.md\` — branch sets, L0 routing table, historical patterns
   - \`context.md\` — table schemas, mix cascade mechanics, dimension definitions
   - \`report_structure.md\` — HTML output spec, chart requirements, section order
2. **The HTML report** — read as if seeing this CE for the first time
3. **The investigation transcript** — what you looked at, why, what you decided at each fork
4. **The summary.json** — check that report claims are grounded in actual numbers

Reading the skill files first is what makes the Failure Mode Classification (Section 4) possible. You cannot say "the instruction was missing" unless you have actually looked.

---

## Scoring Scale
| Score | Meaning |
|-------|---------|
| 5 | Exemplary — hard to do better given the data available |
| 4 | Good — clear execution, one or two minor gaps |
| 3 | Adequate — meets minimum bar, nothing exceptional |
| 2 | Weak — significant gaps or errors |
| 1 | Poor — fundamental failure of this dimension |

For each theme: **Score + Justification** (2–3 sentences citing specific content). If score ≤ 4, also write a **Gap** (what was missing/wrong) and a **Why** (failure mode tag + citation).

---

## Failure Mode Classification

Every gap gets a **Why** line with exactly one of these tags:

| Tag | Meaning |
|-----|---------|
| \`[MISSING_INSTRUCTION]\` | Skill files contain no instruction for this behaviour. Claude had no way to know it was expected. |
| \`[AMBIGUOUS_INSTRUCTION]\` | Instruction exists but is vague, incomplete, or conflicting enough that Claude reasonably interpreted it differently. |
| \`[EXEC_ERROR]\` | Instruction was clear and present. Claude attempted to follow it but reasoned incorrectly. |
| \`[DATA_LIMIT]\` | Data needed was unavailable. Skipping or noting the absence was the right call — not a skill flaw. |

**Grounding requirement — never assign a tag without a citation:**

- \`[MISSING_INSTRUCTION]\` → "Searched SKILL.md, hypothesis.md, context.md, report_structure.md — no instruction found for [behaviour]."
- \`[AMBIGUOUS_INSTRUCTION]\` → quote the instruction that exists, state what constraint it was missing
- \`[EXEC_ERROR]\` → name file + section giving the instruction, confirm an attempt in the transcript, state what went wrong
- \`[DATA_LIMIT]\` → name the instruction that required the data, explain why data was unavailable

---

## Themes 1–7

**Theme 1: Narrative Coherence** — Does the report tell a story, or show tables?
Score high: specific root cause in one sentence, logical flow, rules things out explicitly, appropriately short.
Score low: "CVR declined due to multiple factors", tables with no context, all analyses regardless of findings.

**Theme 2: Hypothesis Specificity & Quality** — Real hypotheses, or observations?
Score high: falsifiable hypotheses naming mechanism + segment + date, distinguishes what happened from what could have.
Score low: "LP2S dropped, possibly due to UX or pricing", multiple root causes without ranking.

**Theme 3: Investigation Effort & Adaptivity** — Deep enough, and stopped when done?
Score high: custom query when standard queries insufficient, URL-level drill when concentration found, recordings once locus confirmed, stopped when conclusive.
Score low: standard queries sufficient despite unconfirmed hypothesis, no follow-up on concentrated URL signal.

**Theme 4: Branch Decision Quality** — Right path at every fork?
Score high: mix-vs-conversion decision explicit with data cite, primary segment choice explained, highest-signal dimension chosen, untaken branches state why.
Score low: mix not checked before funnel conclusion, dimension cuts in fixed order regardless of signal.

**Theme 5: Evidence Strength** — Callouts backed by real evidence?
Score high: every claim tied to a specific data point, recordings produced a specific observation, confidence qualifiers appropriate for sample size.
Score low: claims without numbers, session recordings with no specific finding, inferences presented as facts.

**Theme 6: Output Appropriateness** — Report shaped by the story, not a template?
Score high: visual choices match insight type, tables only where informative, length proportional to finding richness.
Score low: all analyses appear in report, same components regardless of scenario, charts for single-date events.

**Theme 7: DRI & Actionability** — Reader knows what to do?
Score high: DRI names specific team + reason + experience/URL/date, action items scoped and testable, GM could forward directly.
Score low: "Product team" with no specifics, "investigate further", same action card for any CE.

---

## Output Format

**1. Overall verdict** (3–4 sentences) — what did the RCA get right? What was the main failure mode?

**2. Theme scores** — score + justification + Gap/Why per gap:
\`\`\`
**Gap:** [what was missing or wrong — specific, not vague]
**Why:** [TAG] — [citation proving you checked] — [one sentence on what the fix would be]
\`\`\`

**3. Top 2–3 improvements** — concrete and actionable for the next run

**4. Failure Mode Summary** — aggregate every gap:
| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| [gap name] | T[N] | [TAG] | [file + what to change] |

---

## Self-Honesty Check
- Scores reflect what I would give a colleague's work, not inflated self-scores?
- Every justification cites specific content from the report, not vague impressions?
- At least one real weakness identified, even if overall quality is high?
- Every \`[MISSING_INSTRUCTION]\` tag: did I actually check all four skill files?
- Every \`[AMBIGUOUS_INSTRUCTION]\` tag: did I quote the actual instruction?
- Every \`[EXEC_ERROR]\` tag: did I confirm an attempt in the transcript?
- Every row in the Section 4 table maps to a concrete edit in a named file?

> An evaluation where every theme scores 4 or 5 with no improvements is almost certainly not honest.
`,

events: `# events.md — GTM/Mixpanel Funnel Event Reference

Running document mapping GTM/Mixpanel events to funnel steps. Use when a locus is fixed (language, device, TGID, page URL) — query these events filtered to that locus and compare \`pct_of_sessions\` pre vs post.

**Session join key:** \`h-sid\` on LP (microbrand domain). \`HSID\` on select/checkout pages (book.* domain). Same value, different casing — align when joining across domains.

---

## LP Events (15 structured + 4 unstructured)

**Sequential (in order of execution):**

| # | Event | Key properties | Purpose |
|---|---|---|---|
| 1 | \`Microsite Page Viewed\` | h-sid, Language, Platform Name, Collection ID, Is Landing Page, Currency | Page load — LP2S denominator |
| 2 | \`Page Load Time\` | h-sid, LoadTime (ms) | Observed: 2,300–3,600ms. Spike = performance regression |
| 3 | \`Experience Card Visible\` | h-sid, Tour Group ID, Position | Cards in viewport — user reached product list |
| 5 | \`gtm.scrollDepth\` | h-sid, gtm.scrollThreshold (10/25/40/50/75%) | Scroll depth (5 thresholds on LP) |
| 7 | \`More Details Clicked\` | h-sid, Tour Group ID, Action (Open/Close) | Drawer opened — strong engagement signal |
| 13 | \`Image Gallery Opened\` | h-sid, Tour Group ID, Position | Gallery opened — strong purchase consideration |

**Unstructured:** Locale Selector Clicked, Locale Popup Viewed, Locale Option Selected (currency/language mismatch signal), MB Currency Changed.

**Excluded noise:** Free Cancellation Tooltip, Header Dropdown, MB Banner Visible, gtm.timer/dom/load/js, Web Vitals Captured, raw gtm.click.

---

## S2C Events (14 structured + 3 unstructured)

Select page lives on \`book.<domain>/book/<tgid>/select/\`. DataLayer resets on navigation from LP.

**Key structured events:**

| # | Event | Key properties | Purpose |
|---|---|---|---|
| 1 | \`Select Page Viewed\` | HSID, Tour Group ID, Language, Currency, Flow Type | S2C denominator |
| 3 | \`Calendar Opened\` | HSID, Calendar Type | Drop = users not engaging with date step |
| 4 | \`Calendar Date Selected\` | HSID, Selected Date, Table Type | Intentional date selection (cleaner than Experience Date Selected) |
| 7 | \`Error Viewed\` | HSID, Error Message | e.g. 'Please select a date to continue' |
| 8 | \`Tour Card Visible\` | HSID, Variant ID, Ranking, Inventory Type, Is BNPL, Is Cancellable | Each fire = one variant shown. Changes in Is BNPL across periods = product attribute change |
| 9 | \`Variant Card Clicked\` | HSID, Tour ID, Variant ID, Is Scarce, Tour Entry Time | Tour Entry Time Single→Fixed = extra step added, drives abandonment |
| 13 | \`Select Page CTA Clicked\` (label: Next) | HSID, Is Scarce, Is XTL, from | **S2C numerator**. \`from\`: Tour Selection Bar vs Booking Itinerary Card |

**Excluded:** Experiment Viewed, Javascript Error (cross-origin, harmless), SDK Loaded (payment readiness — C2O not S2C), Experience Pax Updated (auto-fire).

---

## C2O Events (15 structured + 8 unstructured)

Checkout page: \`book.<domain>/book/<tgid>/checkout/\`. Decomposes into C2A × A2O.

**Key structured events:**

| # | Event | Key properties | Purpose |
|---|---|---|---|
| 1 | \`Checkout Page Viewed\` | HSID, Lead Time Days, Flow Type | C2O denominator. Lead Time Days: BNPL requires ≥4 days |
| 3 | \`BNPL Status Toggled\` | HSID, Status, Is Lead Time Condition Met | Status=Unavailable + eligible variant = lead time too short. Fires 2–3× per load (GTM race) — use last fire after Checkout Started |
| 9 | \`Itinerary Card Edit Button Clicked\` | HSID, Type | Pencil icon — edit before back. Always precedes Back Button Clicked when pencil used |
| 10 | \`Back Button Clicked On Checkout Page\` | HSID | Fires for BOTH browser back AND pencil edits. Isolate abandonment: filter sessions without prior Itinerary Card Edit |
| 14 | \`Confirm & Pay Clicked\` | HSID, Details Valid, User Subscribed | \`Details Valid: true\` = **C2A numerator** — valid attempt to gateway |
| 15 | \`Order Completed\` | HSID, Order ID, Order Value | **C2O numerator** — confirmation page |

**Key unstructured:** BNPL Option Selected (explicit user toggle vs availability signal), Payment Option Selected (gateway confirmed active — changes signal infrastructure event), Listing Price Mismatch Found (spike = pricing bug), Coupon Failed (Error Code: CAL-0408 = not signed in).

**Excluded:** SDK Loaded (Riskified/payment infra), gtm.historyChange, Page Transition Complete.

---

## Notes

- All events match GTM dataLayer names, forwarded 1:1 to Mixpanel → \`mixpanel_events_partitioned\` in BQ.
- CE 189 = Vatican Museums (thevaticantickets.com). Events captured via F12 dataLayer inspection 2026-05-03.
- TG ID = Tour Group ID = Experience ID at collection level (interchangeable in LP queries).
- BNPL as a feature (appearing/disappearing) has no reliable event — track as a product change query.
`,

};
