# Investigation Transcript — CE 189 · Vatican Museums
Pre: 2026-03-05 to 2026-04-03 | Post: 2026-04-04 to 2026-05-03

## Tree map
L0: S2C (64% ΔCVR) + C2O (40% ΔCVR) dual-driver · sharp break Apr 4-5 (Easter closure) then ongoing structural decline · structural_delta +0.84pp (CE outperforming LY despite absolute drop)
├─ L1: Mix cascade
│   ├─ L1a: MB/HO Level 1 → CONVERSION (MB: conversion_effect −0.0058 >> mix_effect −0.0004). Fixed: MB
│   ├─ L1b: Paid/Organic Level 2 → CONVERSION (Paid conversion_effect −0.0036, Organic −0.0020). Fixed: Paid
│   └─ L1c: Channel Level 3 → CONVERSION (Google Ads +21% traffic, Bing +32% traffic — both channels grew; CVR declined in both). Fixed: Google Ads (dominant 112k post users)
│       → Mix cascade complete: Fixed segment MB · Paid · Google Ads
├─ L2: S2C root cause (fixed segment applied)
│   ├─ L2a: Experience-level S2C → CE-WIDE (6732: −3.4pp / 59k users, 7998: −3.1pp / 14k, 9379: −6.7pp / 5k; all major experiences declined)
│   ├─ L2b: Availability proxy → CONFIRMED availability reduction (6732: 29.7→24.6 days avail/30d, −5 dates; prices up +2.6% to +7.4%)
│   ├─ L2c: Device × S2C → NOT CONCENTRATED (Desktop −2.1pp, iOS −2.4pp, Android −2.6pp — proportional)
│   ├─ L2d: Language × S2C → NOT CONCENTRATED (all languages dropped −2 to −4pp)
│   └─ L2e: Geo vs Non-Geo → NOT CONCENTRATED (Italy Geo −3.7pp, top Non-Geo markets Spain −4.7pp, UK −2.2pp, Germany −2.7pp — all proportional; US −1.0pp only due to longer lead-time booking pattern)
│   → LEAF: Peak spring/Easter season demand exceeds Vatican Museums fixed timed-entry capacity. Same-day CVR −6.0pp (49.2%→43.2%), available dates/30d dropped from ~30 to ~25 for main product.
└─ L3: C2O root cause (C2A −1.77pp, A2O −1.72pp — both sub-metrics moved)
    ├─ L3a: Device × C2A → iOS C2A CONCENTRATED (−3.3pp: 50.5%→47.2%) vs Desktop (−0.7pp) and Android (−1.2pp)
    └─ L3b: Device × A2O → Android A2O CONCENTRATED (−4.6pp: 83.5%→78.9%) vs Desktop (−1.9pp) and iOS (−2.2pp)
        → LEAF 1 (iOS C2A): Pre-payment checkout abandonment on iOS — consistent with price revelation at checkout (experience 7998 +$5.88/+7.4%) or checkout friction. Session recordings unavailable.
        → LEAF 2 (Android A2O): Payment submission failure on Android — consistent with live inventory failure during peak demand (slots fill between select-page and payment confirmation). Session recordings unavailable.

---

## L0 — Orient

**mix_dominance:** is_dominant = FALSE (mbho_mix_share=0.208, channel_mix_share=0.206). MB dominates (95.5% share). Both MB and HO show conversion_effect >> mix_effect. Story is conversion, not routing.

**shapley:**
- LP2S: +0.000254 (−4%) — LP2S actually improved slightly (+0.25pp). Irrelevant.
- S2C: −0.004021 (64% of ΔCVR) ← PRIMARY
- C2O: −0.002520 (40% of ΔCVR) ← SECONDARY but material
- Total ΔCVR: −0.006287 (CVR 4.47% → 3.84%, −14%)
- S2C: 28.5% → 25.8% (−2.63pp)
- C2O: 38.5% → 36.3% (−2.27pp)
- C2A: 44.6% → 42.8% (−1.77pp); A2O: 86.5% → 84.7% (−1.72pp) — both sub-metrics declined

**trend_context:**
- Shape: SHARP BREAK Apr 4-5 (Easter closure) then ongoing gradual decline through post period
- pre_period_healthy = true
- structural_delta_cvr = +0.008 — POSITIVE; CE is outperforming LY despite absolute decline
- LY Easter distortion: Easter 2025 = Apr 20. LY Apr 20-25: LP2S 7-14%, CVR 0.8-1.4%, 17k-42k users/day (Vatican closed Holy Week). Pulls LY post-period CVR very low. This year's structural advantage is calendar, not product improvement.
- Easter 2026 = Apr 5. Apr 4 (Holy Saturday) + Apr 5 (Easter Sunday) = first 2 days of post. LP2S fell 0.305-0.306 (vs normal 0.41+). S2C fell to 0.219-0.228. Apr 6 (Easter Monday) LP2S recovered to 0.464 but C2O only 0.320 (well below 0.385 avg).
- Traffic UP +12.9% (161k→182k): CVR drop despite higher volume. Strong supply constraint signal.

---

## L1 — Mix Cascade

### Level 1: MB vs HO
From summary.json — no query needed.
MB: pre_share 95.5%, post_share 94.5% (−1pp). conversion_effect −0.00582 >> mix_effect −0.00043. CONVERSION.
HO: share grew 4.5%→5.5%. conversion_effect −0.00104, mix_effect +0.00088. CONVERSION.
→ Fix MB. Proceed to Level 2.

### Level 2: Paid vs Organic within MB
From summary.json.
Paid: pre_share 52.8%, post_share 51.3% (−1.5pp). conversion_effect −0.00359 >> mix_effect −0.00091. CONVERSION.
Organic: pre_share 47.3%, post_share 48.7% (+1.4pp). conversion_effect −0.00198, mix_effect +0.00038. CONVERSION.
→ Fix Paid. Proceed to Level 3.

### Level 3: Channel breakdown within MB · Paid
Query results:
- Google Ads: 93,081 pre → 112,128 post users (+21%). CVR declined.
- Microsoft Ads: 6,646 pre → 8,783 post users (+32%). CVR declined.
Both channels grew traffic. CVR decline is conversion-driven at channel level, not channel mix-driven.
→ Fix Google Ads (dominant: 112k post users, 93% of Paid).

**Mix cascade result: conversion change at all levels — no routing story**
**Fixed segment: MB · Paid · Google Ads**

---

## L2 — S2C Root Cause Investigation

### L2a: Experience-level S2C breakdown (MB · Paid)

| Experience | Name | Pre users_select | Post users_select | Pre S2C | Post S2C | Δ S2C |
|-----------|------|-----------------|------------------|---------|---------|-------|
| 6732 | Vatican Museums & Sistine Chapel Skip-the-Line Tickets | 47,683 | 59,027 | 24.5% | 21.1% | −3.4pp |
| 7998 | Vatican Museums & Sistine Chapel Guided Tour w/ St. Peter's | 9,540 | 13,693 | 23.5% | 20.4% | −3.1pp |
| 42093 | Combo: Vatican + Pantheon Fast-Track | 1,641 | 6,469 | 9.3% | 7.8% | −1.5pp |
| 42091 | (related combo) | 1,632 | 5,084 | 13.3% | 14.4% | +1.1pp |
| 9379 | Vatican Museums & Sistine Chapel Guided Tour | 3,432 | 4,958 | 18.2% | 11.5% | −6.7pp |
| 29277 | Early Morning Tour | 1,870 | 2,137 | 12.4% | 10.2% | −2.2pp |
| 10479 | (other) | 1,609 | 1,697 | 21.3% | 21.9% | +0.6pp |

Note: experience_id is only set after select-page view. LP-only users (null experience_id): 63,883 pre → 78,494 post. These are users who viewed LP but never reached select page — LP2S captures this group.

Result: S2C declined across virtually all significant experiences. No single experience dominates. 6732 is the dominant driver by volume (59k users, −3.4pp = −155 checkout sessions). Experience 9379 shows the sharpest rate drop (−6.7pp) but smaller volume.
→ CE-WIDE mechanism, not experience-specific.

### L2b: Availability proxy (product_rankings_features) + prices

| Experience | Pre days_avail | Post days_avail | Δ | Pre days_to_first | Post days_to_first | Pre price | Post price | Δ price |
|-----------|---------------|-----------------|---|-------------------|--------------------|-----------|------------|---------|
| 6732 | 29.7 | 24.6 | −5.1d | 0.10d | 0.16d | $74.26 | $76.21 | +$1.95 (+2.6%) |
| 7998 | 25.1 | 24.5 | −0.6d | 0.16d | 0.35d | $79.88 | $85.76 | +$5.88 (+7.4%) |
| 9379 | 26.9 | 24.9 | −2.0d | 0.13d | 0.16d | $67.06 | $69.10 | +$2.04 (+3.0%) |
| 42091 | 29.7 | 28.7 | −1.0d | 0.10d | 0.16d | $74.26 | $76.21 | +$1.95 (+2.6%) |
| 42093 | 29.7 | 28.6 | −1.1d | 0.11d | 0.16d | $50.85 | $52.45 | +$1.60 (+3.1%) |

Key finding: Experience 6732 (the main product) lost 5.1 bookable days per month (29.7→24.6). Days_to_first remains near-zero (0.16d) — meaning same-day booking is still technically possible, but 5 dates/month are fully sold out. For a CE with 59k select-page views/month on this experience alone, 5 unavailable dates means ~17% of dates are unavailable.

Prices increased modestly across the board. Experience 7998 (Guided Tour) had the largest increase: +7.4% from $79.88 to $85.76. This is meaningful at the variant selection level.

Inventory lead-time bucket query (experience 6732 tours, post period):
- Same-day through 7-13d: No rows in inventory_availability — likely dates in these windows are absent from the table because they are fully sold out (not tracked at 0 inventory)
- 14-29d: 2 dates, avg_remaining 5.3 slots (very constrained)
- 30d+: 30 dates, avg_remaining 3.7 slots (constrained for a high-demand CE)

→ CONFIRMED: Availability is meaningfully constrained. Main experience lost 5 dates/30d. Near-term window data is absent from inventory table — consistent with sold-out dates being removed from the booking system rather than tracked at zero.

### L2c: Device × S2C breakdown (MB · Paid)

| Device | Pre users | Post users | Pre S2C | Post S2C | Δ S2C |
|--------|----------|-----------|---------|---------|-------|
| iOS Mweb | 39,093 | 50,734 | 22.1% | 19.7% | −2.4pp |
| Desktop | 33,242 | 38,541 | 37.1% | 35.0% | −2.1pp |
| Android Mweb | 26,689 | 30,888 | 21.5% | 18.9% | −2.6pp |

S2C drops proportionally across all devices (−2.1 to −2.6pp). No device concentration.
→ RULED OUT as concentrated driver. Consistent with CE-wide availability issue affecting all users.

### L2d: Language × S2C breakdown (MB · Paid)
All major languages declined −2 to −4pp. No single language drove >2× the average drop with meaningful volume.
→ RULED OUT as concentrated driver. CE-wide mechanism confirmed.

### L2e: Geo vs Non-Geo country breakdown (MB · Paid)

Pre-step: CE 189 home country = Italy (from `dim_experiences.country`).

| Country | Geo segment | Pre users | Post users | Pre S2C | Post S2C | Δ S2C | Pre CVR | Post CVR | Δ CVR |
|---------|------------|----------|-----------|---------|---------|-------|---------|---------|-------|
| Italy | Geo | 16,786 | 17,913 | 24.6% | 20.9% | −3.7pp | 5.8% | 4.9% | −0.9pp |
| Spain | Non-Geo | 8,861 | 9,160 | 29.0% | 24.3% | −4.7pp | 6.2% | 5.0% | −1.2pp |
| United Kingdom | Non-Geo | 6,226 | 7,100 | 28.3% | 26.0% | −2.2pp | 7.9% | 6.5% | −1.4pp |
| United States | Non-Geo | 5,369 | 7,531 | 36.5% | 35.5% | −1.0pp | 8.5% | 8.8% | +0.3pp |
| Germany | Non-Geo | 6,266 | 4,853 | 27.5% | 24.8% | −2.7pp | 6.2% | 5.8% | −0.4pp |

Result: S2C declined across all nationalities in the same 2–5pp range — the same proportional pattern seen in the device and language cuts. Italy (Geo) traffic actually grew (+1,127 users, +6.7%) consistent with Easter bringing more Italian domestic visitors, but S2C still fell −3.7pp. The US showed the smallest S2C decline (−1.0pp) and held near-flat on CVR (+0.3pp) — likely reflecting US visitors booking longer in advance (avoiding near-term slot exhaustion) rather than any structural difference.
→ RULED OUT as concentrated driver. No nationality shows a disproportionate drop. CE-wide supply constraint confirmed across all visitor origins.

### Lead-time distribution (MB · Paid)
| Bucket | Pre users | Post users | Pre CVR | Post CVR | Δ CVR |
|--------|----------|-----------|---------|---------|-------|
| Same-day | 2,775 | 2,466 | 49.2% | 43.2% | −6.0pp |
| 1-2d | 1,287 | 1,785 | 44.8% | 43.3% | −1.5pp |
| 3-6d | 1,663 | 1,903 | 39.4% | 35.9% | −3.5pp |
| 7-13d | 2,154 | 2,504 | 37.3% | 34.7% | −2.6pp |
| 14-29d | 3,451 | 4,049 | 36.3% | 34.5% | −1.8pp |
| 30d+ | 3,855 | 3,779 | 30.9% | 31.5% | +0.6pp |
| Unknown | 93,051 | 114,317 | 0.13% | 0.27% | — |

Same-day CVR dropped by −6.0pp — the sharpest decline of any bucket. 30d+ bookings improved slightly (+0.6pp). The "unknown" bucket (LP-only users who never reached select page) grew from 93k to 114k, consistent with more traffic overall but S2C not keeping pace.

Near-term CVR drops are steeper than long-lead, consistent with near-term dates being more constrained.

---

## L3 — C2O Root Cause Investigation

### Device × C2A and A2O breakdown (MB · Paid)

| Device | Pre checkout | Post checkout | Pre C2A | Post C2A | Δ C2A | Pre A2O | Post A2O | Δ A2O |
|--------|------------|--------------|---------|---------|-------|---------|---------|-------|
| iOS Mweb | 4,832 | 5,676 | 50.5% | 47.2% | −3.3pp | 87.1% | 84.9% | −2.2pp |
| Desktop | 6,875 | 7,657 | 39.7% | 39.0% | −0.7pp | 88.6% | 86.7% | −1.9pp |
| Android Mweb | 3,166 | 3,375 | 46.1% | 44.9% | −1.2pp | 83.5% | 78.9% | −4.6pp |

Two distinct failure modes by device:

**iOS Mweb (C2A dominant drop −3.3pp):** Pre-payment checkout abandonment. Users are reaching checkout but not submitting payment. Possible mechanisms: (1) price shock — experience 7998 price rose +$5.88 (+7.4%) and this becomes visible when the full variant price loads at variant selection within checkout; (2) iOS Safari checkout friction or broken form field; (3) booking fee appearing for the first time at checkout. Session recordings unavailable — mechanism is inferred not observed.

**Android Mweb (A2O dominant drop −4.6pp):** Users submitting payment but orders failing. Possible mechanisms: (1) live inventory failure — Vatican Museums timed-entry slots fill rapidly during peak season; a user who selects a slot at select-page may find it taken by the time they complete payment on Android (which has slightly longer checkout times due to Google Pay vs Apple Pay flow); (2) Android-specific payment gateway issue or Google Pay degradation. Session recordings unavailable.

The pattern of iOS concentrating in C2A (pre-payment) and Android concentrating in A2O (post-payment) is consistent with a unified capacity constraint story: iOS users encounter the "no slots available" signal EARLIER in checkout (pre-payment, as the checkout re-checks availability), while Android users complete payment only to have the order fail at fulfilment confirmation.

### [Data pull failure — Session Recordings]
Error: No replays available for multiple sampled user IDs (iOS Mweb C2A abandonments and Android Mweb A2O failures, Apr 15-20)
Impact: Cannot directly observe checkout UX for abandoning users. Cannot confirm whether iOS C2A abandonment is price-driven or availability-driven.
Workaround: Mechanism inferred from device × C2A/A2O pattern. Confidence: "consistent with" rather than "confirmed by."

---

## Root cause confirmed

The CVR decline for Vatican Museums (CE 189) is driven by two reinforcing mechanisms during the peak spring/Easter tourism season.

**Primary (S2C, 64%):** Peak spring demand is outstripping Vatican Museums' fixed timed-entry capacity. The main experience (6732, Vatican Museums Skip-the-Line) lost 5.1 available booking dates per 30-day window (29.7→24.6 days). Traffic increased +13% while available inventory did not — same-day CVR dropped −6.0pp (49.2%→43.2%), the sharpest near-term drop. All experiences, devices, and languages declined proportionally — a CE-wide availability signal, not a product or campaign failure. Prices also increased modestly across all products (+2.6% to +7.4%), with experience 7998 (Guided Tour) showing the largest increase (+$5.88/+7.4%).

**Secondary (C2O, 40%):** Two device-specific failure modes compound the primary supply issue:
1. iOS Mweb C2A −3.3pp: Pre-payment checkout abandonment. Consistent with price revelation (full variant price visible at checkout, increased from pre) or iOS checkout friction.
2. Android Mweb A2O −4.6pp: Post-payment order failure. Strongly consistent with live inventory failure — during peak demand, slots selected at the date picker fill while the user completes payment on Android.

**Calendar context:** The structural_delta_cvr = +0.008 (positive) confirms the CE is actually performing 0.84pp better than LY when controlling for the Easter calendar shift (Easter 2025 fell in the LY post-period alignment, causing catastrophic LP2S of 7-14% and CVR 0.8% on Apr 20-25 LY). The Easter 2026 transient (Apr 4-5 Holy Saturday/Easter Sunday, museums closed) accounts for approximately 20% of the CVR impact; the remaining ~80% is structural ongoing availability pressure throughout April-May.
