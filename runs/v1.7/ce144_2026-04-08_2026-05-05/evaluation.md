# CVR-RCA Evaluation
CE 144 · Alcatraz Tours | Pre: 2026-04-08–2026-04-21 vs Post: 2026-04-22–2026-05-05 | Run: run1 (2026-05-06)

---

## Overall verdict

This is a strong, focused RCA for a positive CVR story. The root cause — product assortment change (exp 36426 launched April 15 at $47.95, displacing a $87.30 dominant product) — is specific, well-evidenced, and supported by converging data from five independent queries: experience-level S2C breakdown, product_rankings_features first_seen date, Geo/Non-Geo cut, C2O sub-decomposition, and inventory confirmation. The investigation reached a clean leaf with no unresolved open items. The main residual gap is that session recordings were not pulled despite an experience-level locus being confirmed (exp 36426), violating the SKILL.md non-optional rule. A secondary gap is the daily S2C chart being CE-level rather than fixed-segment, and one action card lacks a specific named check.

---

## Theme scores

### 1. Narrative Coherence — 5/5

**Justification:** The executive summary opens with a specific, quantified finding: "S2C improved from 22.9% to 29.9% (+7.0pp, 50% of ΔCVR), driven by the April 15 launch of exp 36426 'Alcatraz Tickets with Ferry Ride & Audio Guide' at $47.95." This names the step, magnitude, experience, date, and price. The report flows logically: metric cards → 90-day trend → positive callout (green border) → actions → cascade → fixed segment → Shapley → daily S2C → experience breakdown → geo → C2O sub → inventory ruled-out → ruled-out dimensions. Every analysis block opens with a verdict line. The ruled-out block closes language, device, and session recordings with explicit justifications. The callout correctly uses the green border and "CVR Improved — What's Driving It & What's Holding It Back" heading per spec.

No gaps.

---

### 2. Hypothesis Specificity & Quality — 5/5

**Justification:** The root cause is specific and falsifiable: "exp 36426 ($47.95 Audio Guide) first appeared in product_rankings_features on April 15, 2026 — one week before the post period — and drove S2C improvement through price-shock reduction at the variant selection step." The mechanism names the experience ID, the exact launch date, the price ($47.95 vs $87.30), and the funnel step (S2C via price friction, C2A via checkout abandonment). Counter-evidence is explicitly engaged: US domestic S2C held flat (−0.35pp, 562→279 users) while international markets improved, which would be implausible if the root cause were a generic UX change. Supply was tested with two independent lines (TID inventory + lead-time distribution) and ruled out.

No gaps.

---

### 3. Investigation Effort & Adaptivity — 4/5

**Justification:** All required branches were opened and resolved in the correct order. Mix cascade ran all three levels from summary.json and BQ. S2C first-pass cuts covered language, device, experience, and Geo/Non-Geo. Inventory ran Path B (pre_start within 30-day window) for both exp 31709 and exp 36426. Lead-time distribution corroborated the demand-side story. The investigation stopped at the leaf without unnecessary continuation.

**Gap:** Session recordings were not pulled despite exp 36426 being confirmed as an experience-level locus. SKILL.md Step 2 states: "Once a specific locus is confirmed (URL, experience, device, page type, or any concentrated cross-cut), pull session recordings... They are not optional once a locus exists." The report's justification ("No device-concentrated locus was identified — improvement is broad") does not satisfy the skip conditions, which are limited to "volume too low or no concentrated locus found." An experience-level locus (exp 36426, 255 post select users) was confirmed.

**Why:** `[EXEC_ERROR]` — SKILL.md Step 2 "Session recordings — required once a locus is confirmed": instruction is clear and unambiguous. The transcript notes "No device-concentrated locus" as the skip reason but the instruction requires recordings for any confirmed locus type (experience, URL, device, or page type). The fix: pull recordings filtered to exp 36426 select-page users to observe what users see when selecting the $47.95 Audio Guide vs the $87.30 Tour App product — this would confirm whether the price display or product description are actually driving the S2C improvement, or if there are UX elements (images, reviews) also contributing.

---

### 4. Branch Decision Quality — 5/5

**Justification:** Every cascade level decision is explicitly reasoned with numbers. Level 1: MB conv_effect (+2.13pp) >> mix_effect (+0.006pp) — fix MB, stated in transcript. Level 2: Paid conv_effect (+2.65pp) >> Paid mix_effect (−0.19pp) — fix Paid, stated with arithmetic. Level 3: Google Ads fixed on largest post-period volume (1,037 users) with explicit note that Microsoft Ads impact was nearly equivalent (27.6 vs 25.8 checkout units), demonstrating the decision rule was applied consciously rather than automatically. The experience-level breakdown immediately identified exp 36426 as the locus after seeing the volume shift (7→255 users) — not a fishing exercise. C2O sub-decomposition (C2A/A2O) followed naturally from C2O carrying 33.1% of Shapley. Branches not taken (A2O follow-up) correctly noted as not warranting investigation at current volumes.

No gaps.

---

### 5. Evidence Strength — 5/5

**Justification:** All claims in findings.md have named sources. Product launch date (exp 36426 first_seen = 2026-04-15): confirmed via BQ product_rankings_features query. Experience S2C rates: BQ Q4 experience breakdown query with user counts. Geo/Non-Geo: BQ geo cut with pre/post select users per country. Inventory: BQ inventory_availability TID summary, both experiences, all buckets listed with exact ticket counts. Cascade effects: summary.json mbho_mix and channel_mix fields, with BQ Level 3 query for channels. All tables include raw user counts per spec. Small-sample results (Poland 35→35 users) are flagged as not meaningful. The A2O headwind (−2.24pp) is correctly scoped to 83→133 order-attempted users, making clear it is not statistically significant. No claim is made without a named data source.

No gaps.

---

### 6. Output Appropriateness — 4/5

**Justification:** Visual choices are well-calibrated: positive CVR callout uses green border; 90-day chart shades post period in green; ruled-out block consolidates language, device, and session recordings cleanly. Shapley flex bar is used (not Plotly waterfall) per spec. Experience-level table correctly uses `.highlight-row` on exp 36426 as the key finding row. Inventory section correctly applies the "supply gate passed" verdict without showing the TID table (per spec: "Do not show the TID table or charts; instead move directly to pricing or UX."). The LY guard works correctly — hasLyData evaluates to true and the LY overlay renders.

**Gap:** The daily S2C trend chart (`trend-s2c`) uses CE-level daily S2C data from summary.json `trend.pre` and `trend.post` rather than fixed-segment (MB·Paid·Google Ads) data. A subtext note discloses this ("chart uses CE-level daily S2C from pipeline data; fixed-segment aggregate rates are shown in the analysis blocks above"), but no fixed-segment daily BQ query was run.

**Why:** `[EXEC_ERROR]` — report_structure.md: "All trend charts filtered to the fixed segment." The instruction was present and clear. A fixed-segment daily S2C BQ query could have been written using the funnel table with MB·Paid·Google Ads filters. Using CE-level data with a disclosure note is an acceptable proxy per the prior CE 6495 evaluation precedent, but the root cause is that the fixed-segment daily query was not run.

---

### 7. DRI & Actionability — 4/5

**Justification:** P1 (Revenue Management + Catalog): specific, names exp 36426 and TID 77352, sets a concrete monitoring threshold (S2C below 22%), and flags a named supply bucket threshold for Memorial Day. P2 (Paid Marketing): specific, names both Google Ads and Microsoft Ads, cites the exact CVR delta (+2.07pp), and raises the specific question of Microsoft Ads budget reallocation. Both cards are directly forwardable.

**Gap:** P3 (Catalog/Merchandising) for exp 31709 is advisory rather than task-specific. The action asks the DRI to "determine whether exp 31709 should be retained, repriced, or repositioned" — a strategic decision without a named check or query that constitutes completing the action. A stronger card would specify: "Query product_rankings_features for exp 31709's weekly select-page volume vs exp 36426 since April 15 to measure rate of substitution; if exp 31709 continues to attract < 100 weekly select users by May 20, open a catalog review with the supply team to assess allotment right-sizing."

**Why:** `[MISSING_INSTRUCTION]` — Searched SKILL.md, references/actions.md — no template entry for "product repositioning/retirement" as an action type with a specific check template. The actions.md file covers supply fixes, campaign pauses, and UX investigations, but not catalog-level product lifecycle decisions. Fix: add a "product assortment review" action template to actions.md with a specific query/check step for measuring substitution rate and deciding product retirement criteria.

---

## Top improvements for next run

1. **Pull session recordings when an experience-level locus is confirmed.** Exp 36426 had 255 post-period select users — sufficient volume for Mixpanel recordings. Filter to users who viewed exp 36426 on the select page in the post period and observe whether the product display (images, price prominence, reviews) provides additional evidence for or against the S2C improvement mechanism.

2. **Run the fixed-segment daily S2C query for the trend chart.** Add a daily BQ query filtered to MB·Paid·Google Ads to produce the fixed-segment S2C time series — this eliminates the need for a proxy disclosure and gives the chart direct evidential value.

3. **Add a concrete query/check to the catalog action card (P3).** When recommending a product lifecycle decision, name the specific metric to monitor (weekly select-page volume for exp 31709) and the threshold that triggers action (< 100 users/week by a named date), so the DRI has a testable decision rule rather than an open-ended strategic question.

---

## Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| Session recordings not pulled despite experience locus confirmed | T3 | [EXEC_ERROR] | SKILL.md — enforce: experience-level confirmed locus triggers recording pull, not just device/URL loci |
| Daily S2C chart is CE-level proxy, not fixed-segment | T6 | [EXEC_ERROR] | report_structure.md — add fixed-segment daily S2C query template alongside the trend chart spec |
| P3 catalog action lacks a specific named check/query | T7 | [MISSING_INSTRUCTION] | actions.md — add "product assortment review" action template with substitution-rate query and decision threshold |

---

## Total: 32/35

| Theme | Score |
|---|---|
| T1 — Narrative Coherence | 5/5 |
| T2 — Hypothesis Specificity & Quality | 5/5 |
| T3 — Investigation Effort & Adaptivity | 4/5 |
| T4 — Branch Decision Quality | 5/5 |
| T5 — Evidence Strength | 5/5 |
| T6 — Output Appropriateness | 4/5 |
| T7 — DRI & Actionability | 4/5 |
| **Total** | **32/35** |
