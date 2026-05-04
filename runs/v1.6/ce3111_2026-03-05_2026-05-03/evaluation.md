# CVR-RCA Evaluation
CE 3111 · Kennedy Space Center | Pre: 2026-03-05 to 2026-04-03 vs Post: 2026-04-04 to 2026-05-03 | Evaluated: 2026-05-04

---

## 1. Overall Verdict

This RCA correctly identified a Level 2 mix exit (Paid traffic volume decline, not a conversion problem), quantified the Easter calendar distortion, and confirmed the finding with the US Geo cut showing flat domestic CVR. The root cause is specific, the evidence table is strong, and the action cards are actionable. The main failure is output fidelity to the report_structure.md spec: three components marked "Always" are missing — the Fixed Segment banner, the Shapley decomposition block, and the daily funnel step trend chart. Additionally, session recordings were not pulled and no explanation was given in the report, which the spec requires. A sharp analyst reading the report would find the conclusion solid but notice the structural support components were abbreviated.

---

## 2. Theme Scores

### 1. Narrative Coherence — 4/5

**Justification:** The report tells a clean routing story end-to-end: cascade exits at Level 2 (Paid share fell, Paid CVR flat) → Google Ads accounts for 95% of the Paid volume loss → Easter explains the bulk of the apparent decline → US domestic CVR flat confirms no conversion breakdown. The ruled-out dimensions block correctly collects null findings without cluttering the main narrative. The "What broke?" callout answer is specific and quantified ("Google Ads traffic fell 30% (92k→64k users) while Google Ads CVR held completely flat at 4.58%→4.59%").

**Gap:** The "When did it break?" callout answer conflates two different timelines: the routing story timing (Easter calendar distortion + gradual volume trend) and the structural LY gap ("current CVR ~3.4–4.5% vs LY ~4.5–6.0%, a separate long-running concern"). The "When did it break?" slot should answer the timing of the current-window driver only. Introducing the structural LY concern here creates ambiguity about what broke now vs what has been broken since H2 2025.

**Why:** [AMBIGUOUS_INSTRUCTION] — report_structure.md, Section 1c, "When did it break?": "Exact date (sudden) or window (gradual)." The instruction defines the timing slot as describing the current-window event only. It does not explicitly forbid introducing separate structural context in this slot, which made the dual-timeline phrasing seem natural. Fix: add a note to the "When did it break?" spec: "answer for the current-window driver only; structural LY divergence belongs in the callout 'Why did it break?' body or the P2 action card, not in the timing line."

---

### 2. Hypothesis Specificity & Quality — 4/5

**Justification:** The root cause names a specific mechanism (Level 2 Paid mix exit), specific channel (Google Ads, 88% of Paid), specific volumes (92k→64k, −30%), and a specific calendar explanation (Easter buildup landing in the final 6 days of pre, quantified at ~26k extra users via daily trend arithmetic). The US Geo cut (4.35%→4.43%) is a genuine hypothesis test — falsifiable in the sense that if US CVR had also dropped, it would rule out the routing explanation. The investigation correctly stopped when the leaf was reached and did not continue running analyses against the routing confirmation.

**Gap:** The structural Paid volume decline (~17% ex-Easter) is cited as "probable cause: seasonal shoulder" but no comparative baseline was checked — no week-over-week or MoM volume comparison for prior years at the same April window. The action card asks Performance Marketing to "confirm whether seasonal or addressable," which is appropriate given no campaign-level BQ data is available, but the narrative presents the seasonal hypothesis with more certainty than the evidence supports. The transcript labels it "structural" without confirming it against historical seasonal norms.

**Why:** [DATA_LIMIT] — campaign-level Google Ads data (impression share, budget, bid strategy) is not available in BQ (transcript L2b notes "No campaign-level data in BQ"). Without this data, distinguishing seasonal from campaign-driven decline is not possible analytically. The action card correctly delegates this to Performance Marketing. The report language ("probable cause: seasonal shoulder") uses an appropriate qualifier given the limitation. No fix needed — the handling is correct for the data that exists.

---

### 3. Investigation Effort & Adaptivity — 3/5

**Justification:** The investigation adapted well to the routing story: rather than running standard funnel-step queries, it correctly drilled into WHY Paid volume fell (Easter calendar decomposition via daily trend arithmetic, structural residual via normalization), used the Geo/Non-Geo cut as confirmation evidence for the routing mechanism, and cleanly closed device/language/price/availability as non-drivers. The calendar calibration is creative use of existing summary.json trend data without requiring a new BQ query.

**Gap:** Session recordings were not pulled and no explanation appears in the report. SKILL.md states: "If recordings are skipped, the report must explicitly state why (volume too low or no concentrated locus found)." The locus is confirmed (Google Ads / kennedyspacecenter-tickets.com), meeting the trigger condition. For a routing story, recordings would show users converting at the normal rate — reinforcing the finding — but the report gives no reason for skipping them.

**Why:** [AMBIGUOUS_INSTRUCTION] — SKILL.md, "Session recordings — required once a locus is confirmed": "Any single confirmed dimension is sufficient — you do not need all dimensions locked simultaneously." The confirmed locus is the Google Ads channel on the kennedyspacecenter-tickets.com microsite, which meets the trigger. However, the spec does not distinguish routing exits (where recordings show healthy funnel behavior rather than a broken step) from conversion exits. For a routing story, recordings at the page level would confirm that arriving users behave normally — corroborating evidence, not a primary diagnostic. The spec should state: "for routing exits, recordings confirm that arriving users convert normally; if the CVR within the fixed segment is already confirmed flat by BQ data, recordings add no incremental signal and may be explicitly skipped with a one-line note." Fix: add a routing exit exception to the session recordings section of SKILL.md.

---

### 4. Branch Decision Quality — 4/5

**Justification:** The cascade was explicit and quantified at every level: Level 1 cited conversion_effect −0.002378 >> mix_effect −0.000116; Level 2 cited mix_effect −0.002117 with Paid CVR exactly flat (4.32%=4.32%); Level 3 ran a custom BQ query to confirm Google Ads vs Microsoft Ads split. The MIX EXIT at Level 2 was correctly declared before opening any LP2S/S2C/C2O branches. Post-exit, the routing investigation followed appropriate sub-branches: Easter calendar decomposition, structural residual, US Geo confirmation, secondary international declines. Branches were closed cleanly (price, availability, device, language all ruled out with one-line reasons).

**Gap:** The investigation opened L2c (US Geo) before completing the full routing exit investigation — the transcript shows Geo (L2c) and International declines (L2d) before Price/Availability (L2e), suggesting branches were opened somewhat in parallel rather than sequentially from the routing exit path. hypothesis.md's routing exit first-pass branches specify: timing → sub-segment cut → URL impact → declare. The investigation covered timing (Easter) and sub-segment cut (Geo) but skipped the URL impact check entirely — no query was run to confirm whether the traffic decline was concentrated on specific KSC page URLs (e.g., one package type vs another).

**Why:** [MISSING_INSTRUCTION] — Searched SKILL.md, hypothesis.md, context.md, report_structure.md. The routing exit investigation path in hypothesis.md lists "timing → sub-segment cut → URL impact → declare" but does not define what "URL impact check" means for a Level 2 Paid mix exit where the traffic volume decline already confirms the routing story via volume numbers at the channel level. The URL impact check is designed to find the locus for session recordings — but for a volume story, there is no URL-level locus to confirm. Fix: add a note to hypothesis.md "Mix — first-pass branches" section: "for a Level 2 Paid mix exit, URL impact check is superseded by the channel-level volume confirmation (Google Ads users pre vs post); skip URL query and proceed to sub-segment cut (Geo) as the confirmation step."

---

### 5. Evidence Strength — 4/5

**Justification:** All major claims are grounded: CVR delta from summary.json headline, Paid CVR flat from channel_mix, Google Ads volumes (92,038→64,492) from a confirmed BQ Level 3 query, US Geo CVR (4.35%→4.43%) from a confirmed BQ Geo query, structural S2C gap (30–32% vs LY 39–44%) from trend_context series. Confidence qualifiers are appropriate — "consistent with" used for UK C2O mechanism (unconfirmable without session recordings), "~26k extra users" framed as a derived estimate from daily trend arithmetic. User counts are present in all tables.

**Gap:** The Calendar Calibration table uses approximate aggregated values ("~111,800", "~45,100") rather than exact BQ query results. These are manually summed from the daily trend data in summary.json, which introduces rounding. The daily trend data in summary.json gives user counts per day — summing them would yield exact values (e.g., exactly 45,912 Easter-window users, not ~45,100). The transcript L2a/L2b shows the daily breakdown but states the totals as round estimates. SKILL.md Step 2b says "every count or computed metric cited anywhere in findings.md must have a named Source in the Evidence inventory." The calendar calibration row cites "Calculated from trend data" which is a legitimate source, but the approximation could have been exact given the data was available.

**Why:** [EXEC_ERROR] — SKILL.md Step 2b: "every count or computed metric cited anywhere in findings.md must have a named Source in the Evidence inventory (a summary.json field, a logged BQ query result, or a specific table row that will appear in the report)." The daily LP users per day are in summary.json trend arrays. Summing the array over the Easter window (Mar 29–Apr 3: 6 specific values) produces an exact total rather than an estimate. The transcript used ~26k for the Easter increment — the exact sum of daily extras above baseline was not computed. Fix: when deriving period aggregates from daily trend arrays, compute the exact sum rather than estimating. A one-line calculation (sum of [5,322+5,616+7,379+13,483+11,024+7,688] = 50,512 total Easter window users vs baseline of ~4,100×6 = 24,600, so extra ≈ 25,912) would have given an exact figure.

---

### 6. Output Appropriateness — 3/5

**Justification:** The report correctly omits a Shapley flex bar visualization (anti-pattern for mix-dominant findings) and correctly collects ruled-out dimensions into a single block. The 90-day CVR trend with LY overlay and Easter annotation is the right chart for this story. The calendar calibration block is a good editorial addition that earns its place by quantifying the Easter baseline inflation — something the average GM needs to understand to interpret the pre/post gap correctly.

**Gap 1 (Missing Fixed Segment banner):** The spec (report_structure.md, "Fixed Segment banner" section) states the banner should appear "after the mix cascade concludes… before the Shapley block" and declares the scope for all subsequent funnel analysis. The report has no Fixed Segment banner — the cascade tables go straight into the Paid Channel Breakdown table with no explicit scope declaration.

**Why (Gap 1):** [EXEC_ERROR] — report_structure.md, "Fixed Segment banner": "After the mix cascade concludes, declare the fixed segment once at the top of the analysis section — before the Shapley block." The spec is explicit and includes a full HTML pattern. The banner was not rendered despite a clear instruction. Fix: add the green Fixed Segment banner (`background:#e8f5e9, border-left:4px solid #2e7d32`) immediately after the mix cascade analysis block, declaring "MB · Paid (routing exit — Google Ads dominant channel)" with post-period user count and share of CE traffic.

**Gap 2 (Shapley decomposition block missing):** The spec says "Shapley decomposition — Always" in "What belongs in Section 3." While the anti-pattern list correctly identifies "Shapley visualization in a mix-dominant finding" as problematic (because it implies funnel steps broke), the data itself — LP2S 125.7% of ΔCVR, S2C −35.8% (positive/offsetting), C2O 10.1% — should appear in a simple text or table format. The anti-pattern is the flex bar visual, not the Shapley data. The report omits the data entirely.

**Why (Gap 2):** [AMBIGUOUS_INSTRUCTION] — report_structure.md "What belongs in Section 3": "Shapley decomposition — Always — use the proportional flex bar." And anti-patterns: "Shapley visualization in a mix-dominant finding (the steps didn't break)." These two instructions contradict each other for routing stories: "Always" implies the flex bar should appear, but the anti-pattern says the flex bar should NOT appear for mix-dominant findings. The implied resolution — show Shapley data in a simple text block (not the flex bar) for routing exits — is not stated. Fix: update report_structure.md to add: "For routing exit findings, the Shapley data should appear as a single-row inline note (LP2S: X% | S2C: X% | C2O: X%) embedded in the cascade verdict block, not as the full proportional flex bar visualization."

**Gap 3 (Missing daily funnel step trend chart):** The spec says "Daily S2C/LP2S/C2O trend chart — Always — establishes sudden vs gradual onset." The report has only the 90-day CVR trend, not the daily funnel step trend filtered to the fixed segment.

**Why (Gap 3):** [EXEC_ERROR] — report_structure.md "What belongs in Section 3": "Daily S2C/LP2S/C2O trend chart — Always — establishes sudden vs gradual onset. All trend charts filtered to the fixed segment." The instruction is explicit. For CE 3111, a daily LP2S trend filtered to Paid would show the Easter spike in LP2S depression and the subsequent normalization — directly supporting the calendar calibration argument. The 90-day CVR chart is at CE level, not Paid-level, and does not substitute for the daily step trend. Fix: add a Plotly scatter chart showing daily LP2S (and optionally S2C/C2O) for the MB · Paid segment across the pre and post periods.

---

### 7. DRI & Actionability — 4/5

**Justification:** P1 (Performance Marketing) names specific campaigns (kennedyspacecenter-tickets.com), specific diagnostic checks (Impression Share, Lost IS Budget/Rank), a specific threshold note (SIS <80%), and contextual guidance on seasonal vs addressable volume. P2 (Growth/Ops) names specific investigation paths (when S2C diverged from LY, API cut-off settings, competitor comparison on GYG/Viator). A GM could forward both cards to the named DRI without re-interpretation.

**Gap:** The P1 card cites "if SIS fell below 80% in April, this is an active budget constraint" — the 80% threshold appears as a fact but was not derived from or confirmed by any data in the investigation. No BQ data or external source established 80% as the relevant SIS threshold for KSC. This is an asserted benchmark presented as an actionable trigger.

**Why:** [EXEC_ERROR] — SKILL.md Step 2b: "any recommendation you plan to make — did you actually verify the claim that justifies it?" The 80% SIS threshold was not in any queried data; it is a general digital marketing heuristic. The action card should frame it as a heuristic, not a confirmed threshold: "Industry baseline for competitive keywords is ~80% SIS — Performance Marketing should assess whether April Impression Share fell below the campaign's own historical average, not against a fixed threshold." Fix: reframe the SIS threshold as a reference point ("typically meaningful when SIS falls below historical average or ~70–80% for branded terms") rather than a confirmed action trigger.

---

## 3. Top improvements for next run

**1. Render all three "Always" Section 3 components even for routing exits.** The Fixed Segment banner, Shapley data (as a simple note row rather than the flex bar), and daily LP2S trend chart (filtered to MB · Paid) were all omitted. For the routing story, these components would each add a specific piece: the Fixed Segment banner scopes the analysis; the Shapley note shows LP2S was the step and it improved within Paid (flat, not declined); the daily LP2S trend shows the Easter spike depression directly. None of these require significant effort but all three are required by the spec.

**2. Compute exact sums from daily arrays rather than approximating.** The calendar calibration table derives Easter window user counts from daily trend data in summary.json. Summing the 6 daily values explicitly (5,322 + 5,616 + 7,379 + 13,483 + 11,024 + 7,688 = 50,512 Easter-window users vs ~24,600 baseline-equivalent = ~25,912 extra) takes 30 seconds and removes the "~" qualifier from a table that should show confirmed values.

**3. Add a one-line session recordings note in the report for routing exits.** The spec requires an explanation when recordings are skipped. For routing stories the explanation is simple and true: "Session recordings were not pulled — the finding is a traffic volume story (Google Ads CVR flat at 4.59%), not a UX behavior problem. Recordings at the landing page would show users navigating normally, adding no diagnostic signal beyond what the BQ channel data already confirms." This line takes 10 seconds to write and satisfies the spec.

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| "When did it break?" conflates routing timing with structural LY gap | T1 | [AMBIGUOUS_INSTRUCTION] | report_structure.md — add note: "When did it break?" slot answers current-window driver only; structural LY divergence goes to P2 action card |
| Session recordings not pulled and not explained | T3 | [AMBIGUOUS_INSTRUCTION] | SKILL.md "Session recordings" — add routing exit exception: if CVR within fixed segment is already confirmed flat by BQ, recordings add no signal; skip with a one-line note in report |
| URL impact check skipped in routing exit investigation | T4 | [MISSING_INSTRUCTION] | hypothesis.md "Mix — first-pass branches" — add: for Level 2 Paid mix exit, channel-level volume confirmation supersedes URL impact check; skip URL query, proceed to Geo sub-segment cut |
| Calendar calibration table uses approximate totals when exact values derivable | T5 | [EXEC_ERROR] | SKILL.md Step 2b — when deriving from daily arrays, compute exact sum explicitly; do not round when source data is available |
| Fixed Segment banner missing | T6 | [EXEC_ERROR] | report_structure.md "Fixed Segment banner" — explicit HTML spec present; render after cascade tables before Shapley block |
| Shapley block entirely absent (should appear as simple note, not flex bar) | T6 | [AMBIGUOUS_INSTRUCTION] | report_structure.md — "Always" and anti-pattern ("Shapley visualization in mix-dominant") contradict; add routing-exit resolution: embed Shapley values as inline note in cascade verdict, not as flex bar |
| Daily LP2S/S2C/C2O trend chart missing | T6 | [EXEC_ERROR] | report_structure.md "Daily S2C/LP2S/C2O trend chart — Always"; daily LP2S filtered to MB·Paid would directly illustrate Easter spike depression |
| P1 action cites ungrounded 80% SIS threshold | T7 | [EXEC_ERROR] | SKILL.md Step 2b — verify claims before making recommendations; reframe SIS 80% as heuristic reference, not confirmed threshold |
