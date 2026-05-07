# CVR-RCA Evaluation
CE 6495 · Kualoa Ranch | Pre: 2026-03-05–2026-04-03 vs Post: 2026-04-04–2026-05-03 | Run: run3-rev (2026-05-06)

> **Revised evaluation (2026-05-06):** Inventory section re-run per context.md changelog c015–c018. The prior run3 evaluation (31/35) incorrectly graded T3 as 5/5 despite using a Step 2 snapshot to rule out supply for TGID 37530 — a methodology violation under c018. The revised run corrects this: Step 1 (lost_checkouts_delta, Case B), Step 2 (scoping for all three candidate TGIDs), and Step 3 (historical time-series for all three TGIDs) are now fully executed. A formal tree map has also been added to the transcript. Score revised to 33/35.

---

## Overall verdict

This is a strong, fully-executed RCA for a seasonal demand story. The root cause — spring break wind-down, confirmed by US domestic (−6.73pp) and Canadian (−10.56pp) S2C declines while non-spring-break international markets held flat — is specific, well-evidenced, and supported by multiple independent lines. The revised inventory analysis follows c018 correctly: lost_checkouts_delta computed for all TGIDs (Case B determination), Step 2 run for all three candidate TGIDs for scoping, and Step 3 run for all three with full four-bucket daily time-series. The synchronised zero pattern across unrelated TGIDs is correctly identified as a pipeline artifact rather than real supply depletion. The investigation reached a clean leaf with two action cards and no unresolved open items.

The main residual gaps are: the spring break mechanism is not confirmed via a controlled comparison (within-period Geo S2C comparison before vs. after the school return window), and the daily S2C trend chart uses CE-level proxy data without a fixed-segment disclosure.

---

## Theme scores

### 1. Narrative Coherence — 5/5

**Justification:** The executive summary opens with a specific, quantified finding: "S2C fell −6.5pp (31.6% → 25.1%), concentrated in US domestic visitors (−6.73pp on 15,711 pre select-page users) and Canadian visitors (−10.56pp on 1,053 pre users)." This names the step, magnitude, affected markets, and user counts. The report flows logically: metric cards → 90-day trend → callout → actions → cascade → Shapley → daily S2C trend → Geo/Non-Geo → experience → inventory → lead-time → ruled-out. Every analysis block opens with a verdict line. The tree map at the top of the transcript tracks all branches with OPEN/CONFIRMED/RULED OUT/LEAF state. The inventory section correctly presents Step 1 (locus determination), Step 2 (scoping, with explicit note that it cannot gate the supply verdict), and Step 3 (primary verdict), matching the c018 structure.

No gaps.

---

### 2. Hypothesis Specificity & Quality — 5/5

**Justification:** The root cause statement is specific and falsifiable: "US domestic (−6.73pp) and Canadian (−10.56pp) S2C decline starting April 4 — the first day of post-period — as North American spring break season ended." The mechanism names the affected markets, the magnitude, the onset date, and the proposed cause. Counter-evidence is correctly engaged: South Korea and Mexico (non-spring-break markets) held flat or improved — implausible if the root cause were a product failure. Supply is tested with three Case B TGIDs via Step 3 and falsified: all three show healthy inventory throughout the post period, and the synchronised zero-day pattern across unrelated TGIDs is correctly identified as a pipeline artifact. The claim is appropriately framed as "consistent with" spring break rather than asserting direct measurement.

No gaps.

---

### 3. Investigation Effort & Adaptivity — 5/5

**Justification:** All required branches were opened and resolved in the correct order under c018.
- **Mix cascade:** 3 full levels with explicit mix/conv effect arithmetic at each level. Fixed segment declared after Level 3.
- **S2C first-pass cuts:** Language (ruled out, 99.9% English), device (broad decline, ruled out), experience (broad decline across 4/5 TGIDs, correctly identified as demand-side), Geo/Non-Geo (primary evidence, US/Canada most affected).
- **Inventory — Step 1 (c016):** lost_checkouts_delta computed for all TGIDs. Case B correctly identified (37536 at 40.8%, 37530 at 36.0%, 37532 at 16.2% — all ≥10%).
- **Inventory — Step 2 (c018 scoping only):** Run for all three Case B TGIDs. Explicit note that Step 2 is today's snapshot and cannot gate the historical supply verdict.
- **Inventory — Step 3 (c018 — always run):** Daily time-series with all four buckets run for all three candidate TGIDs across the full post period (Apr 7–May 3). Timing interpretation applied correctly: no sustained multi-day gaps; synchronised zero days across unrelated TGIDs identified as a pipeline artifact.
- **Lead-time cross-check:** Confirms behavioral shift, not supply-driven displacement.

No gaps.

---

### 4. Branch Decision Quality — 5/5

**Justification:** Every cascade and L2 decision is explicitly reasoned with numbers. Level 1: conv_effect MB (−0.01388) >> mix_effect (−0.00143) — stated before fixing MB. Level 2 and Level 3 follow the same explicit arithmetic. The Geo/Non-Geo result is correctly elevated as primary evidence because it directly names the declining markets with a plausible seasonal mechanism. The inventory Case B determination is documented with a full lost_checkouts_delta table, threshold applied explicitly (≥10% cutoff), and the decision to run Step 3 for all three TGIDs (not just the highest-volume one) is stated with the c018 rule as justification. The supply ruling-out is based on Step 3 historical evidence, not Step 2 snapshot. The tree map at the top of the transcript allows a reader to scan branch outcomes without reading all prose sections.

No gaps.

---

### 5. Evidence Strength — 4/5

**Justification:** All key claims have named sources. Geo/Non-Geo: BQ query with user counts and S2C rates per country. Inventory: Step 2 TID summary tables (BQ, named TIDs, ticket counts, capacity flag) plus Step 3 daily time-series (BQ, all four buckets, all three TGIDs, Apr 7–May 3). Cascade: summary.json mbho_mix and channel_mix fields plus BQ Level 3 query. Lead-time: BQ checkout distribution with raw counts and percentages. All tables include raw user counts per spec. Supply ruling-out is rigorous: Step 3 shows no sustained depletion; synchronised zero pattern across unrelated TGIDs confirms artifact rather than real event.

**Gap:** The spring break mechanism is supported by convergent inference (US/Canadian segments declined, international non-spring-break markets held, timing aligns with school return schedules) but not confirmed via a controlled comparison. No query was run comparing Geo (US) S2C within the pre period (spring break peak) vs. the first two weeks of the post period (school return window) to confirm the mechanism directly rather than inferentially.

**Why:** `[EXEC_ERROR]` — SKILL.md Step 2b: "Any calendar event cited as a cause → is there a controlled comparison showing the metric with vs. without those dates?" This controlled comparison was not run. The claim is appropriately framed as "consistent with" in the report, which is correct given the evidence level — but the transcript does not note the deliberate omission with justification.

---

### 6. Output Appropriateness — 4/5

**Justification:** Visual component choices are well-calibrated: Shapley flex bar (not waterfall) correctly used since mix dominance is ruled out; Geo/Non-Geo table includes raw counts (pre/post select users) per spec; experience table includes raw counts; inventory section correctly presents Step 1 (lost_checkouts_delta table), Step 2 (three TID summary tables with capacity column), and Step 3 (three full daily time-series tables). Path A note is present with the correct amber/orange border styling. The 90-day chart is a standalone `div#trend-90day` per spec. LY warning banner correctly shown (CE had no meaningful Headout history in 2025). Fixed segment banner appears after the cascade. All analysis blocks have verdict lines.

**Gap:** The daily S2C trend chart (`trend-s2c`) uses CE-level daily S2C from summary.json rather than fixed-segment (MB·Paid) data. No disclosure note is present in the chart block's subtext.

**Why:** `[EXEC_ERROR]` — report_structure.md: "All trend charts filtered to the fixed segment." The CE-level daily trend from summary.json was used because no separate BQ query was run for fixed-segment daily S2C. Fix: run the fixed-segment daily BQ query, or add a subtext note: "Chart uses CE-level daily S2C from pipeline data; fixed-segment (MB·Paid) aggregate rates shown in analysis blocks above."

---

### 7. DRI & Actionability — 4/5

**Justification:** Two action cards with named DRIs. P3 (Supply/Ops) is specific: names TID 80074, describes the near-term gap and its Step 3 context (isolated zeros, not sustained), and asks for a configuration check — a DRI can act on this in minutes. P2 (Revenue Management + Marketing) correctly identifies the seasonal calibration need and names three specific activities (seasonal CVR baseline, bid target adjustment, Q1 2027 budget planning).

**Gap:** The P2 action for seasonal CVR calibration is advisory ("set a seasonal benchmark") rather than task-specific. It does not name the specific query or check that would constitute completing the action. A DRI forwarding this card would need to determine the implementation. A stronger card would specify: "Query CE 6495 summary.json historical data (or fct_orders) for Q2 Apr–May in prior years to establish the expected Kualoa Ranch Q2 CVR range; update the Revenue Management alert threshold to use Q2 vs. Q2 comparison rather than 30-day rolling."

**Why:** `[MISSING_INSTRUCTION]` — actions.md does not have a template entry for "seasonal calibration" as an action type with a specific check template. Fix: add a "seasonal calibration" action type to actions.md with a template for what specific query/check constitutes completing the action.

---

## Top improvements for next run

1. **Run a controlled comparison when a calendar event is cited as the mechanism.** For spring break: compare Geo (US) S2C in Mar 15–Apr 3 (peak spring break) vs. Apr 4–Apr 17 (rolling school return). If S2C drops progressively over the return window and aligns with school calendar weeks, the claim upgrades from "consistent with" to "confirmed."

2. **Add a fixed-segment note on the daily S2C trend chart.** When CE-level data is used as a proxy for fixed-segment, one sentence in the chart subtext should say so — the reader assumes the chart reflects the declared fixed segment.

3. **Name a specific check in the seasonal calibration action card.** Specify the exact query or metric that completes the action (e.g., "query historical Q2 CVR for CE 6495 and set a seasonal threshold in the alerting config"), so the DRI has a testable decision rule.

---

## Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| Spring break not confirmed via controlled comparison | T5 | [EXEC_ERROR] | SKILL.md Step 2b — "calendar event cited as cause → run Geo S2C within-period comparison or note explicit omission" |
| Daily S2C chart is CE-level proxy, not disclosed | T6 | [EXEC_ERROR] | report_structure.md — "All trend charts filtered to the fixed segment; if proxy used, note it in subtext" |
| P2 seasonal calibration action lacks a specific check | T7 | [MISSING_INSTRUCTION] | actions.md — add "seasonal calibration" action template with specific query/check steps |

---

## Total: 33/35

| Theme | Score |
|---|---|
| T1 — Narrative Coherence | 5/5 |
| T2 — Hypothesis Specificity & Quality | 5/5 |
| T3 — Investigation Effort & Adaptivity | 5/5 |
| T4 — Branch Decision Quality | 5/5 |
| T5 — Evidence Strength | 4/5 |
| T6 — Output Appropriateness | 4/5 |
| T7 — DRI & Actionability | 4/5 |
| **Total** | **33/35** |

**Run3-rev vs run3:** The c018 inventory overhaul resolved the two key methodology violations from the original run3: (1) Step 2 snapshot was incorrectly used to rule out supply for TGID 37530 without running Step 3; (2) Step 3 was not run for TGIDs 37530 or 37532. The revised run runs Step 3 for all three Case B candidate TGIDs and correctly interprets the synchronised zero-day pattern as a pipeline artifact. The formal tree map (T4 gap from prior evaluation) has been added. Remaining gaps are: no controlled comparison for the spring break mechanism (T5), CE-level daily S2C chart without disclosure (T6), and a non-task-specific seasonal calibration action (T7).
