# CVR-RCA Evaluation — CE 1549 (Keukenhof Tickets)

**Period:** Post 2026-03-28 to 2026-04-26 vs Pre 2026-02-26 to 2026-03-27  
**Evaluated:** 2026-04-27

---

## 1. Overall Verdict

This RCA correctly identified a specific, quantified mechanism — progressive peak-date sellout on TGID 10118 (Keukenhof Entry Tickets) — and confirmed it with three converging signals: availability proxy (count_days_available_30d declining 31→15), lead-time distribution collapse (30d+ bookings: 751 pre → 77 post, −90%), and experience-level S2C (25.8% → 21.1%, −1,536 checkouts). The "CVR is up, not down" framing is handled well; the report explains why LP2S seasonal uplift and paid mix growth outweigh the S2C headwind rather than treating a positive overall CVR as an absence of a problem. The main failure mode is a device interpretation that is slightly overconfident given the evidence — the report attributes mobile S2C decline directly to availability constraints without verifying this at the TGID 10118 × device level, leaving open whether the mobile gap is availability-driven in the post period or a pre-existing profile difference. A secondary gap is that TGID 41053 (−9.7pp S2C, −259 checkouts) was flagged but not confirmed with even a quick availability query.

**Total: 28/35**

---

## 2. Theme Scores

### Theme 1: Narrative Coherence — 4/5

The report tells a specific story, not a table dump. The hero callout names TGID 10118, quantifies the mechanism (31→15 available days), quantifies the impact (−1,536 checkouts), and explains why overall CVR still improved (LP2S +7.5pp + paid mix effect). Sections follow logically: mix check → seasonal calibration → experience concentration → availability mechanism → device pattern. The "Dimensions Checked — ruled out" block correctly compresses C2O sub-decomposition, pricing, and session recordings into a compact list rather than giving each its own section.

**Minor gap:** The channel mix dominance test (channel_mix_share=1.197, is_dominant=true) is the gate that directs investigation toward funnel quality rather than composition, but the report doesn't make this gating logic explicit. A reader unfamiliar with the methodology would benefit from one sentence: "channel mix contributed +0.0053pp ΔCVR — exceeding the headline +0.0052pp — confirming mix is the structural driver; the funnel headwind is a real conversion regression that mix is masking." Without this, the "CVR improved despite S2C declining" story is less rigorous.

---

### Theme 2: Hypothesis Specificity & Quality — 4/5

The root cause is falsifiable and specific: TGID 10118, progressive April/May date sellout, driven by Google Ads traffic doubling into peak season. The report distinguishes this TGID from TGID 41053 (parking capacity — separate hypothesis, not independently confirmed), TGID 16429 (transfer inventory, possibly cascade from entry ticket constraint), and TGID 27249 (improved S2C, different supply chain). The mechanism was named before evidence was assembled, then confirmed quantitatively — correct scientific form.

**Minor gap:** The S2C device section verdict-line states "S2C decline concentrated in mobile — iOS Mweb −1.7pp, Android Mweb −2.4pp. Desktop S2C held flat" as if this is a new finding, but desktop was already 8.7pp above mobile in the pre period (32.8% vs 24.1–24.4%). The hypothesis that "mobile users are advance bookers encountering sold-out dates" is plausible but wasn't confirmed by a TGID 10118 × device breakdown. The verdict-line should have noted this as an inference rather than a confirmed observation.

---

### Theme 3: Investigation Effort & Adaptivity — 4/5

Custom queries beyond the standard pipeline: (1) experience-level S2C breakdown to identify TGID 10118 concentration, (2) availability proxy (count_days_available_30d, days_to_first_available_date) from product_rankings_features for TGID 10118, (3) lead-time distribution at checkout for TGID 10118. These are the right depth for confirming an availability scarcity hypothesis and each added non-redundant signal. Session recordings were attempted correctly against a specific TGID and date range, not as a fishing exercise, and the absence was logged appropriately rather than fabricated. Unnecessary branches (language breakdown, HO funnel detail, LP2S deep-dive beyond seasonal confirmation) were not run.

**Gap:** TGID 41053 (Combo + Parking) posted −9.7pp S2C on 2,674 select users (−259 checkouts) — the second-largest impact experience. A two-line query to check count_days_available_30d for this TGID in the post period would have either confirmed a separate parking constraint (upgrading the open item to a confirmed finding) or cleared it (redirecting the hypothesis). At the checkout impact scale, this was worth confirming rather than leaving as an open item.

---

### Theme 4: Branch Decision Quality — 4/5

The branch logic was sound and explicit:
- **Mix first:** channel_mix_share=1.197 (dominant) was checked before drilling funnel. The report explicitly notes paid share grew 72.7%→81.2%.
- **Primary segment:** MB correctly identified as dominant (93%+ share); investigation stayed within MB; HO noted but not drilled.
- **S2C as the story:** Shapley S2C = −62.5% of ΔCVR made this the clear focus. C2O at −7% was dismissed correctly ("within expected range"). LP2S confirmed seasonal and parked.
- **Experience concentration before device:** Running the experience-level S2C table before the device breakdown was the right sequence — it identified where the problem lived before asking how it manifested by device.

**Minor gap:** When the investigation moved from experience concentration to device breakdown, the branch rationale wasn't made explicit. Running device breakdown after confirming TGID 10118 as the locus implicitly assumes device dimension would add independent signal — but given that availability constraints are uniform across devices, the more informative next query would have been TGID 10118 × device. Instead the device breakdown ran at the CE level, which mixed signal from the constrained TGIDs with the unconstrained ones.

---

### Theme 5: Evidence Strength — 4/5

Every numerical claim is grounded in data. Key quantified claims verified against summary.json:
- "LP2S +169.5% of ΔCVR" → pct_contribution.LP2S = 1.695 ✓
- "S2C −62.5% of ΔCVR" → pct_contribution.S2C = −0.6253 ✓
- "structural_delta_cvr = +0.09pp" → trend_context.structural_delta_cvr = 0.000894 ✓
- "paid share grew 72.7%→81.2%" → channel_mix pre_share/post_share ✓
- "count_days_available_30d: 31→15" → from L2 availability query (not in summary.json, from direct BQ query) ✓
- "751 pre → 77 post" 30d+ bookings → from lead-time distribution query ✓

The "consistent with" qualifier is used correctly for the session recording absence and the TGID 41053 parking hypothesis. Confidence qualifiers are appropriate throughout. 

**Minor gap:** The device verdict-line ("S2C decline concentrated in mobile") does not qualify that the mobile/desktop gap existed pre-period. This is the one place where a finding is stated more definitively than the evidence warrants — it should say "S2C declined on mobile (−1.7 to −2.4pp) while desktop held flat, consistent with availability constraints disproportionately affecting mobile intent profiles, though pre-period mobile S2C was already 8–9pp below desktop."

---

### Theme 6: Output Appropriateness — 4/5

Visual choices were deliberate:
- **Dual-axis availability vs S2C (post-period only):** The standout choice — directly illustrates the proposed mechanism by overlaying count_days_available_30d (declining) with S2C rate (declining), making the correlation visually immediate.
- **Daily LP2S and S2C trends with pre/post periods:** Correct choice for a gradual drift. The LP2S trend shows an unambiguous seasonal ramp; the S2C trend shows the post-period inflection point (Apr 2).
- **90-day CVR + LY overlay:** Earns its place — confirms the improvement is seasonal and calibrates the structural delta.
- **Lead-time distribution table:** Correct choice over a chart given the dramatic 30d+ collapse is best communicated as raw numbers (751 → 77).
- **Ruled-out dimensions as compact list:** Correct — avoids inflating the report with uninformative sections.

**Minor gap:** The S2C by device section occupies the same visual footprint as the S2C by experience section but contributes less new information (the mobile/desktop gap is pre-existing, not a post-period emergence). Two callout numbers ("Mobile S2C: 24.2%→22.2%; Desktop: 32.8%→33.6%") embedded in the experience section note would have communicated the same insight with less space. The full table is not wrong, but it's slightly oversized for what it contributes.

---

### Theme 7: DRI & Actionability — 4/5

**P1 (Ops/BDM + Supply):** Names TGID 10118 specifically, names the mechanism (SP held-back capacity / API lead-time settings), adds urgency context ("Keukenhof closes mid-May — each remaining week of sold-out dates is permanent lost revenue. Escalate within 48 hours"). Also names TGID 41053 for separate parking audit. A GM can forward this card directly without interpretation.

**P2 (Product):** Names specific platforms (iOS Safari, Android Chrome), specific interaction ("how sold-out dates are displayed — are greyed-out slots clearly labelled?"), and names TGID 27249 as a specific overflow product with its S2C improvement as justification (+5.3pp, +460 checkouts). Actionable.

**P3 (Growth/Analytics):** Future-dated ("before next Keukenhof season, late March 2027"), includes a specific trigger threshold ("count_days_available_30d drops below 20"), and flags the Things To Do SEO traffic surge with a specific CVR comparison (3.4% vs 4.6% Google Ads) as an actionable signal.

**Minor gap:** P2 sends the Product team to audit the date-picker UX for a problem that is primarily an inventory problem. The sequencing implication ("if the inventory cannot be released, then surface alternative-date suggestions") should be stated more explicitly to avoid Product spending time on UX fixes before the supply escalation has been attempted. The action card is well-written but would benefit from "contingent on P1: if peak dates cannot be released, then audit the sold-out state UX."

---

## 3. Top 3 Things That Would Have Made This Materially Better

**1. Run TGID 10118 × device S2C breakdown.**
The mobile S2C decline is attributed to availability constraints affecting advance-booking mobile users, but this claim rests on a CE-level device table that includes TGIDs 27249 (S2C improved), 16429, and others. A focused query on TGID 10118 checkout users by device would confirm or challenge this — if desktop S2C on TGID 10118 also declined significantly (which the 90-day overlay hints at, showing current year performing below LY in April on S2C), the narrative would shift. If desktop held flat specifically within TGID 10118, that would make the mobile-advance-booker hypothesis stronger.

**2. Run a 2-line availability query for TGID 41053.**
At −9.7pp S2C on 2,674 select users (−259 checkouts), TGID 41053 is proportionally the most severely constrained experience. Checking count_days_available_30d or days_to_first_available_date for this TGID would have taken 60 seconds and either confirmed a separate parking capacity constraint (making P1 more specific: "also audit TGID 41053 parking capacity immediately") or suggested a different mechanism. Leaving it as an open item when the data was accessible is the investigation's most actionable miss.

**3. Make the channel mix gate explicit in the report narrative.**
The investigation correctly ran the mix dominance check before drilling funnel quality, and the finding (channel_mix_share=1.197, paid total_effect=+0.0053pp vs headline ΔCVR=+0.0052pp) is what permits the conclusion that CVR would have been roughly flat without the paid mix shift. But the report presents mix as "a contributing driver" rather than as the gate test whose result directed the investigation toward funnel headwinds. One sentence in the callout — "Channel mix contributes +0.0053pp ΔCVR (slightly exceeding the headline +0.0052pp), meaning the S2C headwind is being masked by mix; on a like-for-like traffic basis, CVR would have been approximately flat" — would sharpen the "why CVR improved despite S2C declining" explanation considerably.
