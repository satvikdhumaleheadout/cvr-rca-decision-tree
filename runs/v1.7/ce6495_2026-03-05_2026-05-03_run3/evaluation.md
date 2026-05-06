# CVR-RCA Evaluation
CE 6495 · Kualoa Ranch | Pre: 2026-03-05–2026-04-03 vs Post: 2026-04-04–2026-05-03 | Run: run3 (2026-05-06)

> **Corrections applied 2026-05-06:** Two spec violations corrected after initial evaluation following a skill update (v1.6 inventory overhaul):
> (1) `Capacity type` column (`Limited`/`Unlimited`, derived from `is_fully_unlimited_capacity`) was missing from both TID summary tables — added to TGID 37536 and TGID 37530 tables.
> (2) Path A note styling was grey border (`background:#f9f9f9; border-left:3px solid #ddd`) instead of the spec-mandated amber/orange (`color:#e07b00`) — corrected.
> T6 gap description updated accordingly. Score unchanged at 31/35 — these were spec compliance issues, not investigation failures.

---

## Overall verdict

Run3 is materially better than run2. The key methodological improvements from the updated skill logic all landed correctly: Geo/Non-Geo was run as a first-pass S2C cut (the primary gap in run2), the inventory queries are now TGID-scoped with the corrected COUNTIF, and Path A was correctly applied. The resulting investigation tells a coherent, well-evidenced seasonal story: spring break wind-down, confirmed by US domestic (−6.7pp) and Canadian (−10.6pp) S2C declines while non-spring-break international markets held flat or improved, with supply definitively ruled out via fully stocked TGID 37530 and a lead-time distribution cross-check showing only modest near-term shift.

The main residual gaps are: no formal investigation tree map (branch states not explicitly tracked with OPEN/CONFIRMED/RULED OUT labels); the daily S2C trend chart uses CE-level data not fixed-segment data without disclosing this in the chart block; and the seasonal mechanism is confirmed by convergent evidence but not by a direct measurement (e.g., no controlled comparison of Geo S2C in spring break weeks vs. non-spring-break weeks to confirm the pattern aligns with the school calendar).

---

## Theme scores

### 1. Narrative Coherence — 5/5

**Justification:** The executive summary opens with a specific, quantified finding: "S2C fell from 31.6% to 25.1% (−6.5pp), concentrated in US domestic visitors (−6.7pp on 15,711 pre select-page users) and Canadian visitors (−10.6pp on 1,053 pre users)." This is not generic — it names the step, the magnitude, the segments, and the user counts. The report flows logically: metric cards → 90-day trend → callout → actions → cascade → shapley → daily S2C trend → Geo/Non-Geo → experience → inventory → lead-time → ruled-out. Every analysis block opens with a verdict line. The 90-day chart is correctly rendered as a standalone `div#trend-90day` not wrapped in an analysis-block. The LY overlay is correctly replaced by a warning banner (CE had no meaningful Headout history in 2025). The ruled-out block closes language, device, and routing explicitly.

No gaps.

---

### 2. Hypothesis Specificity & Quality — 5/5

**Justification:** The root cause statement is specific and falsifiable: "US domestic (−6.73pp) and Canadian (−10.56pp) S2C decline starting April 4 — the first day of post-period — as North American spring break season ended." The mechanism names the affected markets, the magnitude, the onset date, and the proposed cause. Counter-evidence is correctly engaged: South Korea and Mexico (non-spring-break markets) held flat or improved — this would be an implausible coincidence if the root cause were a product failure. The supply hypothesis is tested and falsified with two independent lines of evidence (TGID 37530 fully stocked despite −9pp S2C drop; lead-time distribution barely shifted). The claim is framed as "consistent with" spring break season rather than asserting direct measurement, which is appropriate given the evidence is convergent inference rather than a controlled comparison.

No gaps.

---

### 3. Investigation Effort & Adaptivity — 5/5

**Justification:** All required branches were opened and resolved in the correct order.
- **Mix cascade:** 3 full levels with explicit mix/conv effect arithmetic at each level. Fixed segment correctly declared after Level 3.
- **S2C first-pass cuts (per hypothesis.md):** language (ruled out, 99.9% English), device (broad decline, ruled out), experience (broad decline across 4/5 TGIDs, correctly flagged as demand-side not supply-side), Geo/Non-Geo (run correctly using the dedicated CE-home-country query — this was the gap in run2 and is now correctly executed).
- **Inventory:** TGID-scoped queries with corrected COUNTIF; Path A correctly applied (pre_start is 61 days ago, > CURRENT_DATE − 30); TID summary tables run for two TGIDs (highest-volume 37536 and the experience with the largest S2C drop 37530); daily time-series run for 37536.
- **Lead-time cross-check:** Booking window distribution confirms behavioral not supply-driven shift.
- The one imprecision — L2+ queries run on MB·Paid scope rather than strictly MB·Paid·Google Ads — is well-motivated (Google Ads = 86-91% of MB·Paid, results are equivalent) and documented in findings.md.

No gaps.

---

### 4. Branch Decision Quality — 4/5

**Justification:** Every cascade and L2 decision is explicitly reasoned with numbers: Level 1 conv_effect (−0.01388) vs. mix_effect (−0.00143) is stated before fixing MB; Level 2 and Level 3 decisions follow the same explicit arithmetic. The Geo/Non-Geo result is correctly identified as primary evidence (not supplementary) because it directly names the declining markets and provides a plausible mechanism. The supply ruling-out logic is correct: TGID 37530 is fully stocked yet shows a −9pp S2C drop → supply cannot be the mechanism.

**Gap:** The investigation transcript uses section headers to document branch outcomes but does not maintain a formal tree map with OPEN/CONFIRMED/RULED OUT state per branch. A reader cannot skim the transcript to see which branches were resolved — they must read each section's prose. The CE 229 evaluation flagged this same gap. Fix: seed a tree map at the top of each transcript and update one line per branch as results come in.

**Why:** `[EXEC_ERROR]` — SKILL.md, Step 2 Investigation Transcript: "Update this block to CONFIRMED or RULED OUT as results come in... When the leaf is reached, mark it LEAF and stop." The transcript documents all decisions correctly but in prose rather than tree map form.

---

### 5. Evidence Strength — 4/5

**Justification:** All key claims have named sources. Geo/Non-Geo: BQ query with user counts and S2C rates per country. Inventory: TID summary tables from TGID-scoped BQ queries, named TIDs and ticket counts. Lead-time: BQ checkout distribution with raw counts and percentages. Cascade: summary.json mbho_mix and channel_mix fields plus BQ Level 3 query. All tables include raw user counts (per spec). Supply ruling-out is rigorous: two independent evidence lines (stock check + lead-time distribution).

**Gap:** The spring break mechanism is supported by convergent inference (US/Canadian segments declined, international non-spring-break markets held, timing aligns with school return schedules) but is not directly confirmed by a controlled comparison. No query was run comparing S2C for the Geo segment in the last two weeks of March (spring break peak) vs. first two weeks of April (spring break end) to demonstrate the mechanism within the data — this would have tightened the evidence from "consistent with" to "confirmed."

**Why:** `[EXEC_ERROR]` — SKILL.md Step 2b: "Any calendar event cited as a cause → is there a controlled comparison showing the metric with vs. without those dates?" This controlled comparison was not run. The claim is appropriately framed as "consistent with" in the report, which is correct given the evidence level — but the investigation transcript should have noted the controlled comparison as a deliberate omission with justification.

---

### 6. Output Appropriateness — 4/5

**Justification:** Visual component choices are well-calibrated: Shapley flex bar (not waterfall) correctly used since mix dominance is ruled out; daily S2C trend chart essential for showing the gradual onset pattern; Geo/Non-Geo table includes raw counts (pre/post select users) per spec; experience table includes raw counts; inventory TID summary uses correct Path A format with the block-level note. The 90-day chart is a standalone `div#trend-90day` not wrapped in analysis-block (spec compliance). LY warning banner correctly shown. Fixed Segment banner appears after the cascade. All analysis blocks have verdict lines.

**Gap:** The daily S2C trend chart (`trend-s2c`) uses CE-level daily S2C from summary.json rather than fixed-segment (MB·Paid) data. The fixed segment is MB·Paid·Google Ads and the CE-level data is a reasonable proxy (MB·Paid = 83-94% of CE volume), but this substitution is not disclosed in the chart block's subtext. A reader might assume the chart shows the fixed-segment rate.

**Why:** `[EXEC_ERROR]` — report_structure.md: "All trend charts filtered to the fixed segment." The CE-level daily trend from summary.json was used because no separate BQ query was run for the fixed-segment daily S2C. Fix: either run the fixed-segment daily S2C query, or add a subtext note: "Chart uses CE-level daily S2C from pipeline data. Fixed-segment (MB·Paid) rates shown in aggregate blocks above."

---

### 7. DRI & Actionability — 4/5

**Justification:** Two action cards with named DRIs. P3 (Supply/Ops) is specific: names TID 80074, the 0-2d gap, and asks for a configuration check — a DRI can act on this in minutes. P2 (Revenue Management + Marketing) correctly identifies the seasonal calibration need and names three specific activities (seasonal CVR baseline, bid target adjustment, Q1 2027 budget planning).

**Gap:** The P2 action for seasonal CVR calibration is advisory ("set a seasonal benchmark") rather than task-specific. It does not name what specific check or query would constitute completing the action. A DRI forwarding this card would need to figure out the implementation — the ideal form would be: "Query summary.json historical data for Q2 Apr–May in prior years to establish the expected Kualoa Ranch Q2 CVR range, and update the Revenue Management alert threshold to use Q2 vs. Q2 comparison rather than 30-day rolling."

**Why:** `[MISSING_INSTRUCTION]` — actions.md does not have a template entry for "seasonal calibration" as an action type with a specific check template. The guidance in actions.md covers supply fixes, campaign pauses, and UX investigations, but not calendar-based expectation-setting. Fix: add a "seasonal calibration" action type to actions.md with a template for what specific query/check constitutes completing the action.

---

## Top improvements for next run

1. **Maintain a formal tree map in the transcript.** Seed it at the start with all branches OPEN, update to CONFIRMED/RULED OUT/LEAF as each section resolves. The current investigation makes all the right decisions but they are not scannable without reading all prose sections.

2. **Run a controlled comparison when a calendar event is cited as the mechanism.** For spring break: compare Geo (US) S2C in Mar 15–Apr 3 (peak spring break) vs. Apr 4–Apr 17 (rolling school return). If S2C drops progressively over the return window and aligns with school calendar weeks, the claim upgrades from "consistent with" to "confirmed."

3. **Add a fixed-segment note on the daily S2C trend chart.** When the chart uses CE-level data as a proxy for fixed-segment, one sentence in the chart subtext should say so — the reader assumes the chart reflects the declared fixed segment.

---

## Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| No formal tree map with OPEN/CONFIRMED/RULED OUT state | T4 | [EXEC_ERROR] | SKILL.md — add enforcement note: update tree map entry before each new L1/L2 section |
| Spring break not confirmed via controlled comparison | T5 | [EXEC_ERROR] | SKILL.md Step 2b — "calendar event cited as cause → run Geo S2C within-period comparison or note explicit omission" |
| Daily S2C chart is CE-level proxy, not disclosed | T6 | [EXEC_ERROR] | report_structure.md — "All trend charts filtered to the fixed segment; if proxy used, note it in subtext" |
| P2 seasonal calibration action lacks a specific check | T7 | [MISSING_INSTRUCTION] | actions.md — add "seasonal calibration" action template with specific query/check steps |

---

## Total: 31/35

| Theme | Score |
|---|---|
| T1 — Narrative Coherence | 5/5 |
| T2 — Hypothesis Specificity & Quality | 5/5 |
| T3 — Investigation Effort & Adaptivity | 5/5 |
| T4 — Branch Decision Quality | 4/5 |
| T5 — Evidence Strength | 4/5 |
| T6 — Output Appropriateness | 4/5 |
| T7 — DRI & Actionability | 4/5 |
| **Total** | **31/35** |

**Run3 vs run2:** The updated skill logic (Geo/Non-Geo first-pass cut, TGID-scoped inventory with corrected COUNTIF, Path A/B distinction) resolved the primary methodological gaps from run2. The investigation is now complete — a leaf was reached (seasonal spring break wind-down, confirmed by Geo/Non-Geo cut) and supply was properly ruled out with two independent evidence lines. The remaining gaps are documentation hygiene (tree map, chart source disclosure) and one missing controlled comparison.
