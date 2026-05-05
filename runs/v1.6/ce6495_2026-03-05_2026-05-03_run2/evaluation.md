# RCA Evaluation — CE 6495 · Kualoa Ranch
Pre: 2026-03-05 – 2026-04-03 | Post: 2026-04-04 – 2026-05-03 | Re-evaluated: 2026-05-05

> **Re-evaluation note:** Original evaluation (2026-05-04, 24/35) had inaccurate gap citations in three themes. T5 (3/5) cited two gaps that are not in the report — `structural_delta_cvr` appears only in findings.md, and the "returning users with narrowed travel windows" mechanism appears only in the transcript; neither is in report.html. T6 (3/5) cited "availability proxy table and inventory lead-time block as separate sections" — they are in one analysis-block; and claimed the ruled-out block lists availability/pricing separately — it does not. T7 (3/5) claimed the P1 campaign card "doesn't specify what to check" — the card explicitly says "Confirm whether campaign spend was intentionally cut, auto-reduced by smart bidding, or paused," covering all three cases. T6 also missed the real gap: the 90-day CVR chart was wrapped in an `.analysis-block` with a title header (spec requires a standalone `chart-container` div) — this has been fixed. Corrected scores: T5 4/5, T6 4/5, T7 4/5. New total: 27/35.

---

## 1. Overall Verdict

A strong seasonal demand-quality RCA that correctly identifies the spring break wind-down as the root cause and rules out supply, pricing, and UX mechanisms systematically. The fixed segment banner and Shapley block are present; the mix cascade is explicit at three levels; the weekly funnel breakdown and experience-level table provide strong supporting evidence. The two genuine remaining gaps are: (1) the root cause mechanism (visitor intent shift) is an inference that cannot be directly confirmed due to missing LY data, which is acknowledged in findings.md but not explicitly surfaced in the callout; and (2) the URL anomaly (direct select-page users also dropped −14pp) was found in the investigation but not probed further and is not mentioned in the report.

---

## 2. Theme Scores

---

### Theme 1: Narrative Coherence — 4/5

**Justification:** The hero section opens with a specific, falsifiable statement: "S2C fell from 31.8% to 25.2% (−6.65pp, 70% of ΔCVR) because the post period captured the wind-down of Hawaii's spring break season." The two-phase structure (Phase 1: Apr 6–19, Phase 2: Apr 20+) gives the reader a clear temporal skeleton. Mix dominance is explicitly discarded before drilling S2C. The report flows: headline → actions → fixed segment → Shapley → mix cascade → S2C drill → conclusion. Every major section has a verdict line.

**Gap:** The "Why did it break?" callout states "Kualoa Ranch's visitor profile shifted away from high-intent spring break tourists... toward lower-intent off-peak visitors" as a factual claim, while the same paragraph uses "consistent with" one sentence later. The mechanism is an inference from timing and CE profile, not a measurement. A single qualifying sentence — "visitor intent shift is inferred from the timing pattern and CE profile; no direct intent measurement is available for this CE" — would make the confidence level explicit without undermining the conclusion.

**Why:** [DATA_LIMIT] — Kualoa Ranch had near-zero Headout history in 2025 (1–6 users/day); LY comparison is unavailable. Without LY data, the seasonal pattern cannot be confirmed against prior-year behavior. The "consistent with" qualifier appears in the callout but only after the mechanism is asserted as fact.

---

### Theme 2: Hypothesis Specificity & Quality — 3/5

**Justification:** The root cause is "seasonal spring break wind-down" — specific to the CE (Hawaii outdoor ranch, quintessential spring break activity), the calendar (March peak → April off-peak), and the timing pattern (two-phase gradual erosion). The Geo/Non-Geo cut provides genuine support: US domestic (−6.8pp S2C) and Canada (−10.5pp, spring break overlap) declined while South Korea and Mexico held flat — directly confirming that the spring-break cohort, not a universal product issue, drove the decline.

**Gap:** The core mechanism — "lower-intent tourists replaced higher-intent spring break visitors" — is inferred from timing and CE identity. No intent signal was actually observed. The lead-time distribution check (0-2d share fell −2pp, 30d+ share fell −2.9pp) shows a proportional decline across all booking horizons — not the long-lead reduction that would be expected if spring break planners (who book weeks in advance) selectively exited the mix. This tension — the data doesn't produce a distinctive lead-time signature — was filed as "ruled out as supply scarcity" rather than explicitly addressed as a challenge to the intent hypothesis.

**Why:** [DATA_LIMIT] — LY comparison is unavailable (CE had <10 users/day in 2025). Without LY behavioral data, visitor intent profiles cannot be compared across seasons. The action card correctly delegates seasonal confirmation to the marketing team.

---

### Theme 3: Investigation Effort & Adaptivity — 4/5

**Justification:** Three custom queries went beyond the standard template: (1) the weekly trend query that revealed the two-phase structure (Apr 6–19 vs Apr 20+) and was the single most decisive piece of evidence; (2) the inventory lead-time bucket query that definitively ruled out supply scarcity with zero sold-out dates across all windows and all lead-time buckets; (3) the URL-level breakdown that found the select-page anomaly (direct select-page users also dropped −14pp for 37536, −15pp for 37530). Session recordings were attempted systematically (multiple user IDs sampled across Apr 18–25) and the failure was logged as a data gap with explanation. The investigation stopped after the root cause was confirmed.

**Gap:** The select-page URL anomaly (direct landing on `book.tickets-hawaii.com/book/37536/select/`: S2C 32.8%→18.6%, −14.2pp) is a stronger drop than the overall experience rate (−5.2pp for 37536). Before accepting "consistent with demand quality," a query checking whether these URLs appear in paid retargeting campaigns would have either confirmed the interpretation (returning spring-break browsers with narrowed windows) or revealed a retargeting-specific issue. The anomaly was accepted rather than probed.

**Why:** [MISSING_INSTRUCTION] — SKILL.md does not specify that sub-anomalies within an already-confirmed root cause require a dedicated follow-up query when the finding is "consistent with" the primary mechanism. The open item in findings.md correctly flags this as "accepted as consistent with demand quality — confirmed vs pre by availability/price data."

---

### Theme 4: Branch Decision Quality — 4/5

**Justification:** The mix cascade decision chain was explicit at each fork: Shapley cited to justify prioritising S2C (70%); mix_dominance data cited to fix MB (conversion_effect −0.0143 >> mix_effect −0.0013); near-identical Paid and Organic rate declines (−1.46pp vs −1.51pp) used to elevate the supply/demand-quality hypothesis over campaign-specific causes; L3 channel breakdown (both Google Ads and Microsoft Ads declined) used to rule out single-channel campaign failure. The experience-level breakdown was the correct first S2C drill for a multi-experience CE. Device and language were checked as confirmatory cuts.

**Minor gap:** Once language was established as 99%+ English (<10 non-English users), it should have been a one-line dismissal rather than a named ruled-out entry. The investigation knew this was noise immediately but treated it as a peer dimension alongside device and Geo.

---

### Theme 5: Evidence Strength — 4/5

**Justification:** All quantitative claims are grounded in specific numbers from summary.json and BQ query results: S2C 31.8%→25.2%, traffic 4,250→2,635→1,211 users/week (weekly query), zero sold-out dates across all lead-time buckets (inventory_availability query), prices unchanged ($59.95, $154.95 confirmed via product_rankings_features), device breakdown (Desktop −6.4pp, iOS Mweb −7.6pp, Android −2.4pp), Geo cut (US 15,711→11,043 pre/post, S2C −6.8pp). The LY comparison is correctly characterised as unreliable (CE had near-zero traffic in 2025) and tagged "Consistent with (LY unusable)" in findings.md.

**Gap:** The root cause callout presents the visitor intent mechanism ("visitor profile shifted away from high-intent spring break tourists") without explicitly distinguishing it from the confirmed evidence items (availability, pricing, device, language). A reader of the callout sees confirmed and inferred findings at the same confidence level. A single parenthetical — "(inferred from seasonal timing; no direct intent measure available)" — would make the distinction explicit.

**Why:** [DATA_LIMIT] — LY baseline unavailable; visitor intent profiles cannot be compared across seasons. The "consistent with" qualifier appears in the same callout sentence but after the mechanism is asserted as fact.

---

### Theme 6: Output Appropriateness — 4/5

**Justification:** Both charts (90-day CVR trend, daily S2C with pre/post annotation) are appropriate for a gradual erosion finding. The 90-day CVR chart is now correctly rendered as a standalone `chart-container` div (not wrapped in an analysis-block). The weekly funnel breakdown table is the right level of granularity for a two-phase story — aggregate experience-level doesn't show the phase structure. The experience-level table is informative because the breadth of decline across all experiences is a key piece of evidence. Fixed Segment banner is present and scoped correctly. Shapley is rendered as a flex-bar visual (appropriate here — this is a conversion story, not a routing exit).

**Minor gap:** The session recordings section is rendered as a full `analysis-block` (with verdict line and paragraph) when the finding is a data gap note. A single italicised sentence in the ruled-out dimensions block — as done for other null findings — would serve equally and reduce report length.

**Why:** [EXEC_ERROR] — report_structure.md does not explicitly specify whether session recording data gaps require a full analysis block or a note. The full block is not wrong, but it creates visual parity with substantive analysis sections for a null finding.

---

### Theme 7: DRI & Actionability — 4/5

**Justification:** P1 (Performance Marketing — campaign verification) names the specific CE, the specific date range (April 18–25), the specific platform (Google Ads), and enumerates all three diagnostic scenarios to check: intentional budget cut, auto-reduced by smart bidding, or paused. It also gives a forward-looking instruction for 2027 campaign planning and covers Bing as a secondary channel. P1 (Performance Marketing — spring break front-load) names the specific planning window (Feb ramp-up through Apr 10) and the specific experiences by ID (37536, 37530, 37532) that need availability loaded in advance. P2 (BDM/Ops) scopes the summer assortment review with three specific checks.

**Minor gap:** P2 ("summer assortment review") names experience types to assess (shorter tours, solo/couple options) but doesn't name a specific monitoring date or threshold for the CVR baseline ("Set a CVR monitoring baseline for June–August" is a task description, not a forwarded instruction). A DRI receiving P2 would need to set the monitoring threshold themselves rather than receiving a ready-to-execute check.

---

## 3. Top improvements for next run

**1. Explicitly qualify the visitor intent mechanism in the callout.**
The spring break demand-quality hypothesis is the most parsimonious explanation, but it's an inference from timing and CE profile. The Geo/Non-Geo finding (Canada −10.5pp, South Korea flat) is the strongest corroborating signal. Adding one sentence — "Visitor intent shift is inferred from the seasonal timing and the Geo pattern; no direct behavioral measure is available" — would make the confidence boundary explicit without undermining the conclusion.

**2. Probe the select-page URL anomaly before accepting it as consistent.**
Users landing directly on `book.tickets-hawaii.com/book/37536/select/` showed −14.2pp S2C (vs −5.2pp for the experience overall). A single BQ query checking whether these direct URLs appear in retargeting campaigns would either confirm the "returning spring-break planners with narrowed windows" interpretation or surface a retargeting campaign issue. The anomaly is the one data point that could falsify the seasonal story; it deserves a 5-minute query before acceptance.

**3. The lead-time distribution check should have addressed the intent hypothesis directly.**
The 0-2d share fell −2.1pp and 30d+ share fell −2.9pp — both proportional. If spring break planners book weeks in advance, their exit would reduce the 14-30d and 30d+ buckets relative to 0-2d. The near-equal proportional decline is actually not what the intent hypothesis predicts — this tension should be named and explained (e.g., "proportional decline across all lead-times is consistent with a uniform reduction in visitor intent, not a selective spring-break-planner exit, which corroborates the broader CE-wide quality story rather than contradicting it").

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| Intent mechanism asserted as fact in callout without qualifier | T1/T5 | [DATA_LIMIT] | Add one-sentence qualifier distinguishing confirmed vs inferred in "Why did it break?" |
| Lead-time distribution tension with intent hypothesis not named | T2 | [MISSING_INSTRUCTION] | hypothesis.md — when checking lead-time for scarcity, also note whether distribution shift aligns or contradicts the demand-quality hypothesis |
| Select-page URL anomaly accepted without follow-up query | T3 | [MISSING_INSTRUCTION] | SKILL.md — sub-anomalies within confirmed root cause: run one follow-up query to confirm or rule out independent mechanism before accepting |
| Session recordings as full analysis-block instead of note | T6 | [EXEC_ERROR] | report_structure.md — data gap notes for session recordings do not require a full analysis-block when the finding is null |
| P2 summer assortment action lacks a specific monitoring threshold | T7 | [EXEC_ERROR] | Action card: specify CVR threshold or date for summer monitoring baseline check |
