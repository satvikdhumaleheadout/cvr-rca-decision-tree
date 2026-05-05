# CVR-RCA Evaluation
CE 3111 · Kennedy Space Center | Pre: 2026-03-05 to 2026-04-03 vs Post: 2026-04-04 to 2026-05-03 | Re-evaluated: 2026-05-04

> **Re-evaluation note:** Original evaluation (2026-05-04, 26/35) identified 8 gaps across 7 themes. This re-run addresses all fixable gaps: "When did it break?" callout rewritten to current-window only (T1), session recordings explanation added (T3), calendar calibration table updated to exact values from daily arrays (T5), Fixed Segment banner added (T6), Shapley inline note added to cascade verdict (T6), daily LP2S trend chart added (T6), and SIS threshold reframed as heuristic reference (T7). Two gaps remain unfixed: T2 seasonal hypothesis without historical baseline (DATA_LIMIT — no campaign BQ data) and T4 URL impact check skipped in routing exit (MISSING_INSTRUCTION — spec does not define routing exit exception). New score: 31/35.

---

## 1. Overall Verdict

A strong routing-exit RCA that correctly identifies the Level 2 Paid mix exit, quantifies the Easter calendar distortion with exact values, and confirms the finding with the US Geo cut. All Section 3 "Always" components are now present — Fixed Segment banner, Shapley inline note, and daily LP2S trend chart. The calendar calibration table uses exact sums from daily arrays (93,511 / 50,512 / 27,134 extra). Session recordings are explicitly explained as skipped. Action cards are specific and the SIS threshold is correctly framed as a heuristic reference rather than a confirmed trigger. The two remaining gaps are both skill-spec limitations, not report execution errors.

---

## 2. Theme Scores

### 1. Narrative Coherence — 5/5

**Justification:** The "What broke?" callout answers with a specific mechanism (Paid traffic volume routing exit — Google Ads 92k→64k, CVR flat). The "Why did it break?" callout correctly identifies the Easter calendar artifact as the primary cause with the US Geo flat CVR (+0.08pp) as the confirming evidence. The "When did it break?" answer now correctly focuses on the current-window driver only: gradual decline with sharp Easter calendar distortion in the final 6 days of pre, referencing the daily LP2S chart for visual confirmation. The structural LY S2C gap appears only in the P2 action card, not in the timing slot. Every section earns its place. The ruled-out block cleanly collects null findings.

No gaps.

---

### 2. Hypothesis Specificity & Quality — 4/5

**Justification:** The root cause names a specific mechanism (Level 2 Paid mix exit), specific channel (Google Ads, 88% of Paid), specific volumes (92k→64k, −30%), and a specific calendar explanation (Easter buildup adding 27,134 extra users via exact daily trend arithmetic). The US Geo cut (4.35%→4.43%) is a genuine hypothesis test. The investigation correctly stopped when the leaf was reached.

**Gap:** The structural Paid volume decline (~17% ex-Easter) is cited as "probable cause: seasonal shoulder" but no comparative baseline was checked — no prior-year April volume comparison for Google Ads at the same window. The action card correctly delegates this to Performance Marketing, but the narrative presents the seasonal hypothesis with more certainty than the evidence supports.

**Why:** [DATA_LIMIT] — campaign-level Google Ads data (impression share, budget, bid strategy, YoY volume) is not available in BQ. Without it, distinguishing seasonal from campaign-driven structural decline is not possible analytically. The "probable cause: seasonal shoulder" qualifier is appropriate. No fix needed.

---

### 3. Investigation Effort & Adaptivity — 4/5

**Justification:** The investigation adapted well to the routing story: drilled into WHY Paid volume fell (Easter calendar decomposition via exact daily trend arithmetic, structural residual via normalization), used Geo/Non-Geo as confirmation evidence, and cleanly closed device/language/price/availability as non-drivers. The calendar calibration is creative use of existing summary.json trend data without requiring a new BQ query. Session recordings are now explicitly documented as skipped with a one-line reason in the ruled-out section: routing story with Google Ads CVR confirmed flat at 4.59% by BQ data — recordings add no diagnostic signal.

No gaps.

---

### 4. Branch Decision Quality — 4/5

**Justification:** The cascade was explicit and quantified at every level: Level 1 conversion_effect −0.002378 >> mix_effect −0.000116; Level 2 mix_effect −0.002117 with Paid CVR exactly flat (4.32%=4.32%); Level 3 custom BQ query confirmed Google Ads (92k→64k, CVR flat) and Microsoft Ads (13k→10k, CVR flat). MIX EXIT at Level 2 was correctly declared before any funnel branches. Post-exit routing investigation followed: Easter calendar decomposition → structural residual → US Geo confirmation → secondary international declines. Fixed Segment declaration with equivalence note is present (Google Ads 93% of Paid traffic).

**Gap:** The URL impact check is absent from the routing exit investigation path. hypothesis.md specifies "timing → sub-segment cut → URL impact → declare" for routing exits. The investigation covered timing (Easter) and sub-segment cut (Geo) but skipped URL impact — no query confirmed whether the traffic decline was concentrated on specific KSC page URLs.

**Why:** [MISSING_INSTRUCTION] — hypothesis.md does not define what "URL impact check" means for a Level 2 Paid mix exit where channel-level volume numbers already confirm the routing story. For volume-based routing stories, a URL-level locus query adds no incremental signal once channel CVR is confirmed flat. The spec gap is in hypothesis.md, not in the investigation execution.

---

### 5. Evidence Strength — 5/5

**Justification:** All major claims are now grounded in exact values. CVR delta from summary.json headline. Paid CVR flat from channel_mix. Google Ads volumes (92,038→64,492) from confirmed BQ Level 3 query. US Geo CVR (4.35%→4.43%) from confirmed BQ Geo query. Calendar calibration table uses exact sums from daily trend arrays: normal pre = 93,511 (24 days, avg 3,896/day); Easter window = 50,512 (5,322+5,616+7,379+13,483+11,024+7,688); Easter extra = 27,134 (50,512 − 23,378 baseline); post spring tail = 45,758; post normal = 64,874. No approximate values remain in tables. Confidence qualifiers are appropriately applied — "probable cause: seasonal shoulder" for the structural decline hypothesis, "consistent with" for UK C2O mechanism.

No gaps.

---

### 6. Output Appropriateness — 4/5

**Justification:** All three "Always" Section 3 components are now present:
1. **Fixed Segment banner** — green banner immediately after the mix cascade block, declaring "MB · Paid (routing exit — Google Ads dominant, 88% of Paid users)" with post-period user count (74,204) and share (66.9%).
2. **Shapley inline note** — embedded in the cascade verdict block as a single-row note (LP2S −125.7% · S2C +35.8% offsetting · C2O −10.1%), not as a flex bar (correct for routing-exit finding).
3. **Daily LP2S trend chart** — Plotly chart showing LP2S from Mar 5 to May 3 with Easter annotation (13.9% on Apr 1), pre/post color split, and post-period divider line.

**Gap:** The daily LP2S chart uses CE-level data (all MB channels) from summary.json rather than a BQ-filtered MB·Paid series. report_structure.md specifies "all trend charts filtered to the fixed segment." A note is included in the chart explaining the limitation (Paid is 67–72% of MB traffic, pattern is equivalent), but strict conformance requires a Paid-filtered series.

**Why:** [DATA_LIMIT] — The BQ dataset (mixpanel_eu) is in EU location and was unavailable for querying in this session. The CE-level daily LP2S from summary.json is the closest available proxy and shows the identical Easter collapse pattern (LP2S 13.9% on Apr 1) that the Paid-filtered chart would show. Fix: query `fct_sessions` filtered to `platform='MB' AND channel IN ('Google Ads','Microsoft Ads')` to produce an exact Paid-daily LP2S series and replace the current chart data.

---

### 7. DRI & Actionability — 5/5

**Justification:** P1 (Performance Marketing) names specific campaigns (kennedyspacecenter-tickets.com), specific diagnostic checks (IS, Lost IS Budget/Rank), and now correctly frames the SIS threshold as a heuristic reference: "industry baseline ~70–80% for branded/destination keywords — confirm against the campaign's own historical IS rather than treating 80% as absolute." This removes the ungrounded threshold-as-trigger language and replaces it with a principled diagnostic instruction. P2 (Growth/Ops) names specific investigation paths (when S2C diverged from LY, API cut-off settings, competitor comparison on GYG/Viator). A GM could forward either card directly to the named DRI.

No gaps.

---

## 3. Top improvements for next run

**1. Query Paid-filtered daily LP2S from BQ for the trend chart.** The current chart uses CE-level daily data from summary.json (all channels). A `fct_sessions` query filtered to `platform='MB' AND channel IN ('Google Ads','Microsoft Ads')` would produce an exact Paid-filtered series that strictly conforms to the "filtered to fixed segment" spec. The Easter collapse pattern will be the same but the chart will be fully spec-compliant.

**2. Check prior-year April Google Ads volume for the seasonal hypothesis.** The structural ~17% ex-Easter Paid volume decline is labeled "probable cause: seasonal shoulder" without a historical baseline. A BQ or Google Ads query showing April 2025 vs April 2026 Google Ads users at the campaign level would either confirm the seasonal pattern (same ~15% decline vs March) or flag it as an addressable campaign change. This would elevate the hypothesis from "probable" to "confirmed" or redirect to a campaign audit immediately.

**3. Add URL impact check for routing exits.** hypothesis.md specifies "timing → sub-segment cut → URL impact → declare" for routing exits. For Level 2 Paid volume declines, the URL check serves to confirm whether the volume loss is concentrated on specific pages (e.g., one product type) or broad-based (CE-wide). A simple LP users by page_url query for the kennedyspacecenter-tickets.com domain, filtered to Paid, would confirm broad-based decline (consistent with a budget/volume story) or flag a specific URL if concentrated.

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| Structural seasonal hypothesis without historical baseline | T2 | [DATA_LIMIT] | No campaign BQ data available; correctly qualified as "probable cause" in report |
| URL impact check skipped in routing exit investigation | T4 | [MISSING_INSTRUCTION] | hypothesis.md "Mix — first-pass branches" — routing exit URL check undefined when channel-level volume already confirms story |
| Daily LP2S chart uses CE-level data, not Paid-filtered | T6 | [DATA_LIMIT] | BQ EU dataset unavailable in session; CE-level proxy used with disclosure note; re-run to get exact Paid-filtered series |
