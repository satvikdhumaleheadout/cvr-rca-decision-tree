# RCA Evaluation — CE 6495 · Kualoa Ranch
Pre: 2026-03-05 – 2026-04-03 | Post: 2026-04-04 – 2026-05-03

---

## 1. Overall Verdict

The investigation correctly identified seasonal spring break wind-down as the root cause and did not miss a supply, pricing, or UX driver — the ruling-out process was systematic and well-evidenced. Where the analysis fell short is in the center: the root cause itself is an inference from timing and CE identity, not a measurement of visitor intent. The claim "high-intent spring break tourists replaced by lower-intent off-peak visitors" cannot be confirmed from the data available; it's the most parsimonious explanation, but it's still a hypothesis. Several action items and the report structure show template drift — the same components were rendered regardless of whether each one was truly informative.

---

## 2. Theme Scores

---

### Theme 1: Narrative Coherence — 4/5

**Justification:** The hero section opens with a specific, falsifiable statement: "S2C fell from 31.8% to 25.2% (−6.65pp, 70% of ΔCVR) because the post period captured the wind-down of Hawaii's spring break season." This is not a description of what declined but an assertion of why. The two-phase structure (Phase 1: Apr 6-19, Phase 2: Apr 20+) gives the reader a clear temporal skeleton. Mix dominance is explicitly discarded ("MB is the dominant brand; conversion dominant — not mix") before drilling S2C. The report flows: headline → actions → fixed segment → Shapley → mix cascade → S2C drill → conclusion. Minor gap: the direct select-page URL drop anomaly (−14pp for 37536, −15pp for 37530) is mentioned but not resolved cleanly — it is filed as "consistent with demand quality" without explaining why high-intent returning users would show a steeper drop than the overall rate. A reader could reasonably ask "isn't that the opposite of what a demand-quality story predicts?"

**Improvement (minor):** Add one sentence in the anomaly discussion explaining the mechanism: retargeted users who bookmarked select-page URLs during spring break planning would show up as high-intent post-period sessions with narrow remaining travel windows, producing LP2S=100% but low S2C. This closes the narrative loop instead of leaving the anomaly as an accepted gap.

---

### Theme 2: Hypothesis Specificity & Quality — 3/5

**Justification:** The root cause is "seasonal spring break wind-down" — specific to the CE (Hawaii outdoor ranch, quintessential spring break activity), the calendar (March peak → April off-peak), and the timing pattern (two-phase gradual erosion). However, the core mechanism — "lower-intent tourists replaced higher-intent spring break visitors" — is entirely inferred from timing and CE identity. No intent signal was actually observed: no demographic data, no booking lead-time collapse (that was checked and ruled out as a scarcity signal, not as an intent proxy), no comparison of visitors who converted vs. abandoned showing different behavioral profiles. The hypothesis is plausible and well-motivated, but "consistent with spring break seasonality" is not the same as confirmed spring break seasonality, especially with LY data all-zero. The investigation noted this uncertainty but the report underplays it.

**Improvement:** The lead-time distribution was checked and showed 0-2d bucket share fell slightly (37.1% → 35.0%). This is actually a mild intent signal: if spring break planners book further in advance, their departure from the mix would reduce long-lead bookings, not near-term ones. The finding went the wrong direction or was neutral — this tension should have been explicitly addressed rather than filed under "ruled out as supply scarcity." Engaging with it would have sharpened the hypothesis or forced a more nuanced mechanism statement.

---

### Theme 3: Investigation Effort & Adaptivity — 4/5

**Justification:** Three custom queries went beyond the standard template: (1) the weekly trend query that revealed the two-phase structure (Apr 6-19 vs Apr 20+) and was the single most decisive piece of evidence; (2) the inventory lead-time bucket query that definitively ruled out supply scarcity with zero sold-out dates across all windows; (3) the URL-level breakdown that found the select-page anomaly. Session recordings were attempted systematically (multiple user IDs sampled across Apr 18-25) and the failure was logged as a data gap rather than silently skipped. The investigation stopped after the root cause was confirmed — no unnecessary dimensions were run after device and language were cleared. The one gap: when the select-page URL users showed −14pp, no follow-up query was run to check whether those specific page URLs had a technical change (e.g., a JS error on the select page, a pricing/slot configuration change specific to those booking URLs). The anomaly was accepted rather than probed.

---

### Theme 4: Branch Decision Quality — 4/5

**Justification:** The mix cascade decision chain was explicit at each fork: Shapley cited to justify prioritising S2C (70%); mix_dominance data cited to fix MB ("conversion_effect −0.0143 >> mix_effect −0.0013"); near-identical Paid and Organic rate declines (−1.46pp vs −1.51pp) used to elevate the supply/demand-quality hypothesis over campaign-specific causes; L3 channel breakdown (both Google Ads and Microsoft Ads declined) used to rule out single-channel campaign failure. The experience-level breakdown was the correct first S2C drill for a multi-experience CE — it looked for concentration before assuming CE-wide cause. Device and language were checked as lower-priority confirmatory cuts, not exploratory fishing. Minor weakness: once language was noted as 99%+ English (< 10 non-English users), it should have been a one-line dismissal, not a full analysis section. The investigation knew this was noise immediately but still ran it as a named step.

---

### Theme 5: Evidence Strength — 3/5

**Justification:** All quantitative claims are grounded in specific numbers from summary.json and query results: S2C 31.8% → 25.2%, traffic 4,250 → 2,635 → 1,211 users/week, zero sold-out dates, prices unchanged. The evidence inventory table in findings.md correctly marks LY comparison as "Consistent with (LY unusable)" rather than "Confirmed." However, three confidence gaps remain underweighted in the report itself: (1) the structural_delta_cvr = −0.064 is cited as "structural" in the report without prominently noting that this metric is unreliable given LY near-zero traffic — a reader could take this as evidence of structural decline when it actually means nothing; (2) the weekly traffic collapse (−71%) is described as "likely driven by spring break search volume drying up" but the alternative explanation (campaign scale-back) was left unresolved and was flagged only as an action item, not as an acknowledged confidence gap in the conclusion; (3) the select-page URL drop anomaly (−14pp vs −6.65pp overall) is accepted as consistent with the demand-quality story but this requires the "returning users with narrowed travel windows" mechanism, which was stated in the report without a data basis.

**Improvement:** The report should have a single sentence distinguishing the confirmed claims (availability, pricing, device, language — all with direct data) from the inferred claims (visitor intent shift — inferred from timing). Currently the root cause callout presents all elements at the same confidence level.

---

### Theme 6: Output Appropriateness — 3/5

**Justification:** Both charts (90-day CVR trend, daily S2C with pre/post annotation) are appropriate for a gradual erosion finding — they're the right visual for a drift, not a point-in-time drop. The experience-level table is informative because the breadth of the decline across all experiences is a key piece of evidence. However, the report shows signs of template-driven assembly: the availability proxy table AND the inventory lead-time confirmation block appear as separate sections when the finding is a single sentence ("supply is not the cause"); the device breakdown appears as a full section when both devices declined proportionally and the finding was "not concentrated" — a single callout would have served. The ruled-out dimensions block lists availability, inventory, pricing, device, language, lead-time distribution as separate items, each with a tick mark, which reads as a checklist rather than a story. A reader encountering this block doesn't get new information; they get the same conclusion repeated six times.

**Improvement:** Collapse the ruled-out dimensions into a single paragraph or a two-column table listing what was checked and the one-line verdict. Reserve section-level detail for the things that were informative (experience-level breakdown, weekly trend). The report should be shorter because several sections could have been a sentence.

---

### Theme 7: DRI & Actionability — 3/5

**Justification:** The three action cards are specific to the CE and the finding: "verify campaign scale-back" is tied to the week of Apr 20 traffic collapse, assigned to Performance Marketing with a specific question to answer; "front-load spring break marketing Feb-Mar" names the specific planning window and the mechanism (Hawaii spring break peaks March); "summer assortment review" identifies the transition risk. However, the campaign verification action doesn't specify what to check: was the daily budget hit, was a campaign paused, did auto-bid reduce due to lower impression share? A Performance Marketing DRI receiving the card would still need to know where to look. "Summer assortment review" is not testable — it doesn't name a specific risk, a specific experience, or a specific date. The actions are better than generic ("investigate LP2S") but fall short of the "forward directly to DRI without interpretation" bar.

**Improvement:** For the campaign verification card: specify the signal to look for — "Check Google Ads impression share and cost-per-click for [CE 6495 campaigns] in the week of Apr 20 vs Apr 13. If impression share held but traffic fell, the drop is organic search; if impression share dropped, a budget or bid change contributed." That is forwardable. "Verify campaign scale-back" is not.

---

## 3. Top 2–3 things that would have made this RCA materially better

**1. Engage with the lead-time distribution as an intent proxy, not just a scarcity proxy.**
The lead-time distribution was checked to rule out near-term supply scarcity — and correctly filed as "not the cause." But the same data has a second use: if spring break planners are characterized by longer booking horizons (planning trips weeks in advance), their exit from the mix would reduce the 14-30d and 30d+ buckets relative to same-day/near-term. The data shows the 30d+ share fell −2.9pp and 0-2d fell −2.1pp — both fell proportionally. This is actually consistent with a general visitor intent decline across all booking horizons (not a specific spring break planner exit). That tension — the intent hypothesis doesn't produce a distinctive lead-time signature — should have been addressed and would have either strengthened or complicated the seasonal narrative.

**2. The select-page URL drop anomaly deserved a query, not an acceptance.**
Users landing directly on `book.tickets-hawaii.com/book/37536/select/` showed −14pp S2C vs −6.65pp overall. This is a strong signal from a high-intent cohort. Before accepting "consistent with demand quality," a query checking whether these URLs appear in paid retargeting campaigns (i.e., are these returning users from spring break bookmark sessions, or new users who landed via a different ad format?) would have either confirmed the interpretation or revealed a retargeting campaign issue. The anomaly was the one data point that could have falsified the seasonal explanation, and it wasn't probed.

**3. The confidence gradient between confirmed and inferred findings should have been explicit in the callout.**
The root cause callout states the spring break mechanism as fact. But the claim rests on: timing pattern (confirmed), CE identity as spring break activity (confirmed), LY comparison (unavailable), visitor intent shift (inferred, not measured). A single qualifying sentence — "Visitor intent is inferred from the timing and CE profile; no direct intent measure is available for this CE" — would have made the callout honest without undermining the conclusion. As written, a stakeholder reading the callout would not know that the central mechanism is an inference.

---

## Scores summary

| Theme | Score |
|-------|-------|
| 1. Narrative Coherence | 4 |
| 2. Hypothesis Specificity | 3 |
| 3. Investigation Effort | 4 |
| 4. Branch Decision Quality | 4 |
| 5. Evidence Strength | 3 |
| 6. Output Appropriateness | 3 |
| 7. DRI & Actionability | 3 |
| **Total** | **24/35** |
