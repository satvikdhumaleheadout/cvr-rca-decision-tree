# CVR-RCA Evaluation — CE 189 Vatican Museums
Run: 2026-03-05 to 2026-05-03 (pre) / 2026-04-04 to 2026-05-03 (post)
Evaluated: 2026-05-04

---

## 1. Overall Verdict

This RCA correctly identified the dual-driver mechanism (S2C capacity pressure + C2O device-specific failures), ran a thorough investigation with appropriate custom queries, and produced a well-structured report with no boilerplate sections. The root cause is specific and actionable. The main failure is execution fidelity to the output spec: the transcript contained confirmed numbers (exact experience user counts, per-bucket user counts for lead-time, pre/post C2A/A2O rates per device, exact prices) that either didn't enter the report or entered as approximations. The report also declared a fixed segment (Google Ads) but ran all L2 queries at the Paid level — an inconsistency that was not resolved or called out. Theme 5 (Evidence Strength) is the primary failure, driven by multiple tables that violated the mandatory user-count requirement of report_structure.md.

---

## 2. Theme Scores

### Theme 1: Narrative Coherence — Score: 4

**Justification:** The report tells a clean story: mix ruled out at three levels → supply constraint confirmed CE-wide → C2O decomposes into two device-specific failure modes → calendar distortion explains LY comparison. Every section earns its place and the ruled-out block correctly collects the null findings. The callout "What broke?" is specific and quantified ("S2C fell from 28.5% to 25.8% (−2.63pp, 64% of ΔCVR Shapley) across all three main Vatican experiences").

**Gap:** The callout "What broke?" sentence names both S2C and C2O in the same answer, blurring the primary/secondary distinction. The spec says "If multiple root causes confirmed: callout names the primary driver. Secondary findings get action cards." C2O's presence in the root cause callout — and in an equally developed "Why did it break?" explanation — makes it harder to read at a glance which driver is the P1 story.

**Why:** [AMBIGUOUS_INSTRUCTION] — report_structure.md section "1c. Root cause callout": "If multiple root causes confirmed: callout names the primary driver. Secondary findings get action cards in Section 2." The instruction does not explicitly prohibit mentioning the secondary driver in the callout body text — only that the *naming* should emphasise the primary. Fix: add "do not name the secondary driver in the callout body — mention its Shapley weight only as a parenthetical in the 'What broke?' answer, then delegate all secondary detail to the action card."

---

### Theme 2: Hypothesis Specificity & Quality — Score: 4

**Justification:** The root cause names specific products (6732, 9379), a specific mechanism (fixed timed-entry capacity vs demand growth), specific magnitudes (−5.1 available dates/month, −6.0pp same-day CVR), and a specific device-level split (iOS C2A vs Android A2O). The investigation correctly distinguished the supply-side S2C hypothesis from the UX hypothesis by confirming CE-wide proportional drops across all devices and languages.

**Gap:** The iOS C2A mechanism presents two hypotheses — "price shock" and "iOS checkout friction" — without committing to either, even though the investigation confirmed the price increase ($79.88→$85.76 for exp 7998, +7.4%) that directly supports the price shock hypothesis. The transcript (L2b) has this data. The report action card says "audit whether the Apr price increase on Experience 7998 is surfacing" as a task for the DRI, when the investigation already verified the price change occurred. The callout says "key products saw price increases" without citing the confirmed number.

**Why:** [EXEC_ERROR] — SKILL.md Step 2b: "Any recommendation you plan to make → did you actually verify the claim that justifies it, or are you passing an unverified hypothesis to the DRI?" The investigation *did* verify the price increase (transcript L2b, availability proxy query). The confirmed number ($79.88→$85.76, +$5.88, +7.4%) should have entered the report as confirmed evidence and sharpened the hypothesis to "consistent with the confirmed +7.4% price increase on Experience 7998" rather than leaving both mechanisms open. Fix: write the iOS C2A hypothesis as "consistent with the confirmed price increase on exp 7998 ($85.76 vs $79.88)" in both the callout and the action card.

---

### Theme 3: Investigation Effort & Adaptivity — Score: 4

**Justification:** Custom queries were written for availability proxy (product_rankings_features), lead-time CVR distribution (inventory_availability + funnel join with user counts per bucket), device × C2A/A2O breakdown, and experience-level S2C for 7 experiences. Session recordings were attempted and the absence correctly noted. The investigation stopped when evidence was conclusive — no unnecessary analyses were run.

**Gap:** Experience 9379 (Papal Apartments) showed the sharpest S2C drop in the CE (−6.7pp), but availability was only checked for experience 6732. Given the magnitude of 9379's drop, a separate availability query for its tour IDs would have confirmed whether it has an independent capacity constraint. Acknowledged as OI-4 in findings.md but not resolved.

**Why:** [MISSING_INSTRUCTION] — Searched SKILL.md, hypothesis.md, context.md, report_structure.md — no instruction found specifying that the experience with the largest S2C rate drop should receive a dedicated availability check even when a CE-wide mechanism is already confirmed. The investigation correctly identified 6732 as the dominant-volume product and stopped there. Fix: add guidance to hypothesis.md "S2C First-Pass Branches" section: "if one experience shows >2× the average S2C drop by rate, run a separate availability check for that experience even when the CE-wide mechanism is confirmed — it may have an independent constraint layered on top."

---

### Theme 4: Branch Decision Quality — Score: 3

**Justification:** Mix-vs-conversion was explicit and cited actual data (is_dominant=FALSE, conversion_effect >> mix_effect at MB/HO, Paid/Organic, and channel levels). Primary segment MB called out with reason. The dimension cuts chosen (experience, availability, lead-time, device) were the right sequence for a supply-constraint hypothesis.

**Gap:** The mix cascade concluded with a fixed segment of MB · Paid · Google Ads (transcript L1c). The report's fixed segment banner reads "MB · Paid (Google Ads dominant channel within Paid)" and all L2 funnel analysis tables were computed at the MB · Paid level, not filtered further to Google Ads. The report does not explain that Google Ads = 93% of Paid (112k/120k post users) — a claim that would justify treating Paid-level tables as effectively equivalent to Google Ads-level tables.

**Why:** [EXEC_ERROR] — hypothesis.md "Mix Cascade" section and SKILL.md L1 section both state that the fixed segment from the cascade "is applied to all subsequent funnel analysis." The transcript shows L2 queries were run at "MB · Paid" scope despite the cascade concluding "Fixed: Google Ads." No justification was written for treating Paid-level as a proxy. Fix: either re-run L2 queries filtered to Google Ads (or note explicitly in the fixed segment banner that Google Ads = 93% of Paid, so Paid-level tables are equivalent within rounding).

---

### Theme 5: Evidence Strength — Score: 2

**Justification:** CVR, LP2S, S2C, C2O, Shapley numbers are all cited correctly from summary.json. Availability proxy (29.7→24.6 days for exp 6732) is confirmed. "Consistent with" language is appropriately applied to unconfirmed mechanisms. The calendar Easter distortion claim is well-evidenced by the LY overlay data.

**Gap 1 (Lead-time table missing user counts):** The lead-time table in the report shows only Pre/Post CVR rates per bucket with no user counts. The transcript (L2d) shows confirmed user counts: same-day 2,775/2,466, 1-2d 1,287/1,785, 3-6d 1,663/1,903, 7-13d 2,154/2,504, 14-29d 3,451/4,049, 30d+ 3,855/3,779. These were available and not used.

**Why (Gap 1):** [EXEC_ERROR] — report_structure.md, "Table with highlight rows": "Raw user counts are mandatory in every table. Any table that shows rates, shares, or percentages must also show the raw user count." The instruction was present. The data was available in the transcript. It was not included. Fix: pass through confirmed user counts from BQ query into the lead-time table.

**Gap 2 (Device C2O table missing pre/post rates and user counts):** The report's device C2O table shows only Δ rate and a text interpretation column — no Pre Rate, Post Rate, Pre Users, or Post Users. The transcript (L3) has complete data: iOS Mweb pre checkout 4,832/post 5,676, pre C2A 50.5%/post 47.2%, pre A2O 87.1%/post 84.9%, etc.

**Why (Gap 2):** [EXEC_ERROR] — Same report_structure.md instruction: "Raw user counts are mandatory in every table." and "The minimum columns for a rate table are: Segment · Pre Users · Post Users · Pre Rate · Post Rate · Δ Rate." The instruction was present and the data was in the transcript. Fix: rebuild the C2O device table using full pre/post users and rates from the transcript L3 query results.

**Gap 3 (Experience S2C table used approximations when exact numbers were available):** The experience table shows "~52,000" pre users and "~59,000" post for exp 6732. The transcript (L2a) shows exact figures: 47,683 pre / 59,027 post. Similarly, exp 7998 shows "~6,000" in the report but the transcript has 9,540 pre / 13,693 post; exp 9379 shows "~2,500" but transcript has 3,432 pre / 4,958 post.

**Why (Gap 3):** [EXEC_ERROR] — SKILL.md Step 2b: "Every count or computed metric cited anywhere in findings.md — it must have a named Source in the Evidence inventory." The transcript contained confirmed numbers from BQ queries. Choosing to approximate rather than use confirmed figures introduced preventable inaccuracy. Fix: copy exact figures from the transcript L2a table into the report — do not approximate when exact values are available.

---

### Theme 6: Output Appropriateness — Score: 4

**Justification:** Visual choices are well-matched to the story: 90-day CVR trend with LY overlay makes the Easter 2025 distortion immediately visible; daily S2C/C2O trends illustrate the gradual onset; Shapley flex bar is appropriate (not a Plotly waterfall); mix cascade and dimension breakdowns use tables. The report is long (11 Section 3 blocks) but all blocks are earned.

**Gap:** The availability proxy table shows only exp 6732. The investigation confirmed availability data for all 5 main experiences (6732, 7998, 9379, 42091, 42093 — see transcript L2b). Showing all experiences would have: (a) provided CE-wide supply evidence in a single block rather than relying on the verbal "CE-wide" assertion, and (b) surfaced the 9379 availability data (26.9→24.9 days, −2.0d) that the investigation didn't follow up on.

**Why:** [EXEC_ERROR] — report_structure.md, "Availability proxy table" entry in "What belongs in Section 3": "count_days_available_30d and days_to_first_available_date per experience." The instruction says "per experience" (plural). Showing only the dominant experience is a narrowing choice that was not justified. Fix: show all experiences for which availability was queried in the availability proxy table.

---

### Theme 7: DRI & Actionability — Score: 4

**Justification:** P1 action card (Supply/BDM) names specific experiences (6732, 9379), specific configuration checks (API cut-off period, release windows), a specific metric threshold (inventory alert at <20 days), and a specific concern about near-term slot exhaustion confirmed by the data. P2 (Product/Engineering + BDM) names distinct diagnostic paths for iOS and Android with specific data pulls to request.

**Gap:** The iOS C2A action item says "audit whether the Apr price increase on Experience 7998 is surfacing" without citing the confirmed price change ($79.88→$85.76). Since the investigation verified this, the DRI card should cite the confirmed number — "Experience 7998 price increased from $79.88 to $85.76 (+$5.88/+7.4%) in the post period — audit whether this price level is surfacing at variant selection in the iOS checkout flow." Without the number, the DRI needs to re-look up what the DRI could have been told directly.

**Why:** [EXEC_ERROR] — actions.md, Root Cause 1 (Pricing): "identify exact price gap from price_analysis." The exact price gap was confirmed in L2b (transcript: "$79.88 to $85.76"). It entered findings.md as "Consistent with" rather than "Confirmed" because price query results were labeled as "Consistent with" there (OI-1 in findings.md). But the transcript L2b table clearly shows confirmed pre/post prices from a BQ query. The downgrade to "Consistent with" in findings.md was wrong — these are confirmed query results. Fix: update findings.md OI-1 to "Confirmed" with source "transcript L2b, availability proxy query" and add the exact prices to the P2 action card.

---

## 3. Top 3 things that would have made this RCA materially better

**1. Use confirmed numbers from the transcript in all tables.** The transcript L2a, L2d (lead-time), and L3 tables contain exact pre/post user counts and rates that were computed from BQ queries during the investigation. The report used approximations for experience user counts and omitted user counts entirely from the lead-time and device C2O tables. These numbers were available — they just weren't passed through to the report. This is the single largest gap: it violates the mandatory user-count spec and makes it harder for a stakeholder to judge whether findings are substantial.

**2. Commit to the price shock hypothesis using the confirmed price data.** Experience 7998's price increase ($79.88→$85.76, +7.4%) was confirmed by a BQ query in L2b. This evidence is strong enough to move from "consistent with price shock or checkout friction" to "consistent with the confirmed +7.4% price increase on Experience 7998 — price shock is the leading iOS C2A hypothesis." The action card should cite the specific price change, and the P2 DRI should be asked to check whether the $85.76 price point is causing abandonment at variant selection specifically.

**3. Resolve the fixed segment inconsistency before writing the report.** The mix cascade concluded "Fixed: MB · Paid · Google Ads." The L2 investigation queries ran at "MB · Paid" scope. Before writing the report, either: (a) re-run the L2 tables filtered to Google Ads, or (b) add a sentence to the fixed segment banner explaining "Google Ads accounts for 93% of Paid traffic (112k/120k post LP users) — Paid-level analysis is equivalent to Google Ads within rounding." Without this note, the fixed segment banner makes a claim that the analysis doesn't support.

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| Callout names both primary and secondary driver in "What broke?" | T1 | [AMBIGUOUS_INSTRUCTION] | report_structure.md — clarify that the callout body should contain only primary driver, secondary driver gets action card only |
| iOS C2A mechanism uncommitted despite confirmed price data | T2, T7 | [EXEC_ERROR] | SKILL.md Step 2b — confirmed query results (L2b prices) must enter report; findings.md OI-1 price label was wrongly downgraded to "Consistent with" |
| Experience 9379 availability not checked despite largest rate drop | T3 | [MISSING_INSTRUCTION] | hypothesis.md "S2C First-Pass Branches" — add: check availability separately for any experience with >2× average rate drop |
| Fixed segment declared Google Ads but queries ran at Paid level | T4 | [EXEC_ERROR] | SKILL.md L1/hypothesis.md — fixed segment must be applied to all subsequent queries, or equivalence must be stated explicitly |
| Lead-time table missing user counts | T5 | [EXEC_ERROR] | report_structure.md — mandatory user count spec; confirmed counts were in transcript L2d, not passed through |
| Device C2O table missing pre/post rates and user counts | T5 | [EXEC_ERROR] | report_structure.md — mandatory user count spec; full data was in transcript L3, not passed through |
| Experience S2C table used approximations when exact numbers were available | T5 | [EXEC_ERROR] | SKILL.md Step 2b — use confirmed BQ numbers, not estimates, when exact figures are in the transcript |
| Availability proxy table shows only exp 6732 despite CE-wide data queried | T6 | [EXEC_ERROR] | report_structure.md — "availability proxy per experience"; show all experiences for which data was confirmed |
| iOS C2A action card did not cite confirmed price change | T7 | [EXEC_ERROR] | actions.md Root Cause 1 — "identify exact price gap"; confirmed gap was in transcript L2b and should be in action card |
