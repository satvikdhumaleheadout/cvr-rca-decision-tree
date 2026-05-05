# CVR-RCA Evaluation
CE 189 · Vatican Museums | Pre: 2026-03-05 to 2026-04-03 vs Post: 2026-04-04 to 2026-05-03 | Re-evaluated: 2026-05-05

> **Re-evaluation note:** The original evaluation (2026-05-04, 25/35) was inaccurate on Themes 4 and 5. It cited three T5 gaps (missing user counts in lead-time and device C2O tables; approximate experience user counts) and a T4 gap (fixed segment declared Google Ads but queries ran at Paid level without justification) — all of which were already resolved in this run2 report. The original evaluator appears to have read run1 characteristics into the run2 folder without verifying the actual HTML. This re-evaluation is grounded in a direct read of report.html, transcript.md, and the current v1.6 skill files.

---

## 1. Overall Verdict

This is a strong dual-driver RCA that correctly identifies two distinct mechanisms (S2C supply exhaustion + device-specific C2O failure), confirms the primary mechanism with specific availability data (exp 6732: 5.1 fewer available dates, 0 remaining slots Apr 6–24), and produces highly actionable DRI cards with confirmed price figures. The fixed segment is properly declared with an equivalence note, user counts are present in all major tables, and the iOS C2A hypothesis is committed to the confirmed price data ($79.88→$85.76, +7.4%). The main remaining gaps are: the callout body mentions C2O secondary where the spec expects primary-only, the C2O sub-decomp table omits user counts, Level 3 of the cascade is not rendered as a table, and Experience 9379 availability was not independently confirmed despite its −6.7pp S2C drop.

---

## 2. Theme Scores

### 1. Narrative Coherence — 4/5

**Justification:** The report tells a clean dual-driver story: mix ruled out at three levels → S2C supply constraint confirmed CE-wide (experience, device, language, country all proportional) → C2O decomposes into two device-specific modes (iOS C2A vs Android A2O). Every section earns its place. Verdict lines open every analysis block with a finding, not a description. The ruled-out block correctly collects null findings (language, device at S2C level, Geo/Non-Geo, LP2S, session recordings).

**Gap:** The "What broke?" callout answer mentions C2O secondary alongside S2C primary: "S2C fell from 28.5% to 25.8% (−2.63pp) across all three main Vatican experiences. A secondary C2O failure (40% Shapley) is addressed in the action cards below." report_structure.md Section 1c states "If multiple root causes confirmed: callout names the primary driver. Secondary findings get action cards in Section 2." Even a brief parenthetical mention in the callout body pre-empts the clean primary-only framing.

**Why:** [AMBIGUOUS_INSTRUCTION] — report_structure.md Section 1c: "If multiple root causes confirmed: callout names the primary driver. Secondary findings get action cards in Section 2." The instruction does not explicitly prohibit a single-sentence redirect in the callout body ("addressed in action cards below"), only that the secondary should not be the named root cause. The boundary between "naming" and "redirecting" is unspecified. Fix: clarify in report_structure.md that the callout body should contain only the primary driver mechanism; the secondary driver should not appear until Section 2 — not even as a redirect pointer.

---

### 2. Hypothesis Specificity & Quality — 4/5

**Justification:** The root cause names specific products (6732, 7998, 9379), a specific mechanism (fixed Vatican timed-entry capacity vs +13% spring demand surge), specific magnitudes (−5.1 available dates/month, −6.0pp same-day CVR, 0 remaining slots Apr 6–24), and a specific device-level split. The iOS C2A hypothesis is now committed to the confirmed price data: the callout says "consistent with the confirmed price increase on Experience 7998 ($79.88→$85.76, +7.4%) surfacing at variant selection," and the action card cites the exact figures as the trigger for the DRI audit.

**Gap:** The Android A2O hypothesis (live inventory race condition) is presented at the same narrative level as the iOS price-shock hypothesis, despite having a different evidence tier. iOS C2A has a confirmed cause (price increase from confirmed BQ query); Android A2O has only an inferred mechanism. The callout and action card treat them as parallel findings when one is confirmed-data-supported and one is "consistent with" an unconfirmed race condition mechanism.

**Why:** [DATA_LIMIT] — SKILL.md "Session recordings": recordings unavailable for thevaticantickets.com in Mixpanel project 2657627; payment gateway error logs not in BQ. Without these, the live inventory race condition vs gateway failure cannot be distinguished. The "consistent with" qualifier is correctly used in the transcript and action card text. The callout's parallel phrasing is the only framing issue — the evidence tier is clearly distinguishable in the body text. No skill file fix needed; this is an inherent data limitation.

---

### 3. Investigation Effort & Adaptivity — 4/5

**Justification:** Custom queries were written for: experience-level S2C (7 experiences), availability proxy (all 5 main experiences), lead-time CVR distribution (6 buckets with user counts), device × C2A/A2O breakdown, language × S2C, and Geo/Non-Geo country cut (5 countries with geo_segment labels). Session recordings were attempted and the absence correctly logged per SKILL.md data-pull failure format ("No replays available for multiple sampled user IDs"). The investigation stopped when evidence was conclusive.

**Gap:** Experience 9379 (Papal Apartments) showed the largest S2C rate drop in the CE (−6.7pp) but availability was confirmed in `inventory_availability` only for exp 6732. The availability proxy (product_rankings_features) shows 9379 lost 2.0 available days (26.9→24.9), and the transcript notes it "may have a separate capacity ceiling layered on top of CE-wide tightening." A dedicated `inventory_availability` lead-time bucket query for 9379's tour IDs would confirm or rule out this separate constraint — the investigation accepted the CE-wide 6732 confirmation without this check.

**Why:** [MISSING_INSTRUCTION] — Searched SKILL.md, hypothesis.md, context.md, report_structure.md — no instruction found specifying that the experience with the largest S2C rate drop should receive a dedicated availability confirmation even when the CE-wide mechanism is already confirmed. Fix: add to hypothesis.md "S2C First-Pass Branches" section: "if one experience shows >2× the average CE S2C drop by rate, run a dedicated availability check for that experience even when the CE-wide mechanism is confirmed — it may have an independent constraint layered on top."

---

### 4. Branch Decision Quality — 4/5

**Justification:** Mix-vs-conversion was explicit and quantified at all three levels: Level 1 conversion_effect −0.00582 >> mix_effect −0.00043; Level 2 conversion_effect −0.00359 >> mix_effect −0.00091; Level 3 confirmed both Google Ads (+21% traffic) and Microsoft Ads (+32% traffic) grew while CVR declined — conversion story at channel level. Fixed segment declared as MB · Paid · Google Ads with an explicit equivalence note: "Google Ads accounts for 93% of Paid traffic (112,128/120,911 post LP users) — Paid-level analysis below is equivalent to Google Ads within rounding." All L2 queries are filtered to MB · Paid as required. Geo/Non-Geo was run (L2e) and correctly ruled out with the US booking-lead-time explanation noted.

**Gap:** Level 3 of the mix cascade is not rendered as a table in the report. The Level 3 results (Google Ads 93,081→112,128 users; Microsoft Ads 6,646→8,783 users; both channels' CVR declined) appear only as a footnote in the Fixed Segment banner. The spec requires "Mix cascade (three levels) — Always" and the transcript has the Level 3 data from a confirmed BQ query.

**Why:** [EXEC_ERROR] — report_structure.md "What belongs in Section 3": "Mix cascade (three levels) — Always — MB/HO → paid/organic → channel breakdown." Level 3 data was confirmed in transcript L1c. It was not rendered as a table despite the explicit "Always" instruction and available data. Fix: add a Level 3 analysis block between Level 2 and the Fixed Segment banner showing Google Ads vs Microsoft Ads pre/post users, CVR, and conversion_effect verdict, with a neutral verdict line confirming conversion at both channels.

---

### 5. Evidence Strength — 4/5

**Justification:** All major claims are grounded in exact BQ query results: experience user counts are exact (47,683 pre / 59,027 post for exp 6732), lead-time table has confirmed Pre Users and Post Users (2,775/2,466 same-day, 1,287/1,785 for 1–2d, etc.), device C2O table has Pre Checkout and Post Checkout user counts alongside all pre/post rates. Availability proxy shows all 5 main experiences with exact prices. Confidence qualifiers are appropriately applied — "consistent with" for both C2O device mechanisms.

**Gap:** The standalone C2O sub-decomposition table (showing C2A and A2O rates only — Pre C2A 44.6%, Post 42.8%, Pre A2O 86.5%, Post A2O 84.7%) has no Pre Users or Post Users columns. report_structure.md c010 states: "Raw user counts are mandatory in every table. Any table that shows rates, shares, or percentages must also show the raw user count." Pre checkout users (4,832 + 6,875 + 3,166 = 14,873 pre; 5,676 + 7,657 + 3,375 = 16,708 post) are directly derivable from the device table already in the report.

**Why:** [EXEC_ERROR] — report_structure.md c010 (2026-04-28): "Raw user counts are mandatory in every table. Any table that shows rates, shares, or percentages must also show the raw user count." The instruction was present. The data was available from the device breakdown query already run. Fix: add Pre Checkout Users and Post Checkout Users columns to the C2O sub-decomp table, summed from the device table rows.

---

### 6. Output Appropriateness — 4/5

**Justification:** Visual choices are well-matched to the story. The 90-day CVR trend with LY overlay makes the Easter 2025 distortion (Apr 20-26 LY near-zero CVR) directly visible. Daily S2C and C2O trend charts show gradual onset beginning in late March — consistent with the "seasonal / gradual" timing classification. The Shapley flex bar is appropriate for a conversion story (not a routing exit anti-pattern). The availability proxy covers all 5 main experiences, not just the dominant one. Report length (11 Section 3 blocks) is proportional to the dual-driver complexity.

**Gap:** The 90-day CVR chart is wrapped in an `.analysis-block` div with a title header ("90-Day CVR Trend — Vatican Museums CE 189"). The spec (report_structure.md Section 1b) describes the chart as a standalone element placed "immediately after the metric cards, before the callout." Section 1's hard constraint is "only the metric cards, the 90-day chart, and the callout." Wrapping the chart in an analysis-block card gives it a Section 3 visual treatment — bordered white card with a bold title — when it should be a lightweight contextual baseline.

**Why:** [EXEC_ERROR] — report_structure.md Section 1b: "Place this immediately after the metric cards, before the callout." The spec HTML examples for Section 1 do not wrap the chart in an analysis-block. The analysis-block style (border, background, block-title) is specified only for Section 3 components. Fix: remove the `.analysis-block` wrapper from the 90-day chart; render only a `<div id="trend-90day" class="chart-container">` in the section flow.

---

### 7. DRI & Actionability — 5/5

**Justification:** P1 (Supply/BDM + Ops) names Experience 6732 specifically, cites confirmed dates (Apr 6–24, 0 remaining slots), sets a monitoring threshold (count_days_available_30d < 20 days), addresses Experience 9379 independently, and cites the confirmed same-day delta (−6.0pp, 49.2%→43.2%). P2 (Product/Engineering + BDM) separates iOS and Android into distinct action items with distinct diagnostics. The iOS action cites the confirmed price change ($79.88→$85.76, +$5.88, +7.4%) and specifies the exact diagnostic step (audit price surfacing at variant selection in iOS Mweb checkout). The Android action specifies pulling payment gateway error logs and adding a real-time availability check before payment submission. The BDM item asks for a price renegotiation assessment with the exact confirmed figures. A GM could forward either card directly to the named DRI without re-interpretation.

No gaps.

---

## 3. Top improvements for next run

**1. Add Level 3 cascade table.** The transcript has the Level 3 data (Google Ads 93k→112k +21%, CVR declined; Microsoft Ads 7k→9k +32%, CVR declined) confirming conversion at channel level. This should appear as a Level 3 analysis block before the Fixed Segment banner, not only as a footnote in the banner. Level 3 is the final decision step of the cascade and its data supports the conversion conclusion independently — it earns a table.

**2. Add user counts to the C2O sub-decomposition table.** The standalone C2A/A2O table shows rates without user counts. The pre/post checkout user totals are already computed in the device breakdown table (sum: 14,873 pre / 16,708 post checkout users). Adding these to the sub-decomp table satisfies the mandatory spec and lets the reader judge scale without cross-referencing another table.

**3. Run an independent availability check for Experience 9379.** Its −6.7pp S2C rate drop (the largest in the CE) and −2.0d availability decline suggest a separate capacity constraint layered on top of the CE-wide tightening. An `inventory_availability` lead-time bucket query for 9379's tour IDs would either confirm a separate constraint (supply team should audit 9379 independently of 6732) or show the same pattern (CE-wide story holds with higher confidence). Currently flagged in the P1 action card as a hypothesis without a confirmed data point.

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| Callout body mentions secondary driver (C2O) | T1 | [AMBIGUOUS_INSTRUCTION] | report_structure.md Section 1c — clarify that no secondary driver should appear in callout body, even as a redirect pointer |
| Exp 9379 availability not independently confirmed | T3 | [MISSING_INSTRUCTION] | hypothesis.md "S2C First-Pass Branches" — add: check availability separately for any experience with >2× average CE S2C rate drop |
| Level 3 cascade missing from report tables | T4 | [EXEC_ERROR] | report_structure.md "Mix cascade (three levels) — Always"; Level 3 data available in transcript L1c, not rendered as table |
| C2O sub-decomp table missing user counts | T5 | [EXEC_ERROR] | report_structure.md c010 mandatory user count rule; pre/post checkout user totals derivable from device table |
| 90-day chart wrapped in analysis-block instead of bare chart-container | T6 | [EXEC_ERROR] | report_structure.md Section 1b — chart is a standalone div, not an analysis-block card with title header |
