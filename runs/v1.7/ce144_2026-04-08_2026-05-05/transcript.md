# CVR-RCA Investigation Transcript
CE 144 · Alcatraz Tours · Pre: 2026-04-08–2026-04-21 | Post: 2026-04-22–2026-05-05

---

## Investigation tree map

| Branch | Status |
|--------|--------|
| L0: Orient from summary.json | CONFIRMED |
| L1: Mix cascade — Level 1 MB vs HO | CONFIRMED — MB conversion dominant |
| L1: Mix cascade — Level 2 Paid vs Organic within MB | CONFIRMED — Paid conversion dominant |
| L1: Mix cascade — Level 3 Channel breakdown within Paid | CONFIRMED — both channels improved; Google Ads fixed (largest volume) |
| L2a: Language cut (S2C) | RULED OUT — 99.9% English |
| L2b: Device cut (S2C) | RULED OUT — broad improvement across all devices |
| L2c: Experience breakdown (S2C by TGID) | CONFIRMED — exp 36426 emerged Apr 15; exp 31709 volume collapsed |
| L2c-i: New product launch mechanism | CONFIRMED — exp 36426 first_seen 2026-04-15 in product_rankings_features |
| L2d: Geo/Non-Geo cut (S2C) | CONFIRMED — US domestic flat; international improved strongly |
| L3a: C2O sub-decomposition (C2A / A2O) | CONFIRMED — C2A +9.89pp dominant; A2O −2.24pp minor headwind |
| Supply check: exp 31709 TIDs 66558, 74814 | RULED OUT — fully stocked across all buckets |
| Supply check: exp 36426 TID 77352 | ADEQUATE — fully stocked across all buckets |
| Lead-time distribution | RULED OUT as supply signal — near-term surge consistent with price-sensitive demand |
| ROOT CAUSE | **LEAF** — product assortment change (exp 36426 launch Apr 15) |

---

## L0 — Orientation

**CE:** Alcatraz Tours (CE 144) — collection, United States / North America.
**Channel:** MB dominant (90.7% of LP users pre, 90.9% post).
**CVR direction:** Improvement — CVR 2.99% → 5.06% (+2.07pp, +69%).

**Headline:**
- LP2S: 33.24% → 36.28% (+3.04pp, +9.1%)
- S2C: 22.91% → 29.87% (+6.96pp, +30.4%)
- C2O: 39.25% → 46.72% (+7.47pp, +19.0%)
- LP Users: 2,443 → 2,252 (−191, −7.8%)

**Shapley attribution (from summary.json):**
- LP2S: +0.35pp (16.7% of ΔCVR) — non-trivial but not primary
- S2C: +1.04pp (50.2% of ΔCVR) ← primary step
- C2O: +0.69pp (33.1% of ΔCVR) ← secondary step
→ Primary funnel steps to investigate: **S2C and C2O**

**Trend context:**
- structural_delta_cvr = +3.78pp (current year materially outperforms same period LY)
- ly_delta_cvr = −1.81pp (LY same period was weaker — improvement is against a soft LY baseline but still genuine)
- pre_period_healthy = true — pre period is a valid baseline
- Shape: post-period CVR clearly elevated across the full 14-day window

**Mix dominance:** is_dominant = false (mbho_mix_share 0.005, channel_mix_share 0.17) → cascade is expected to confirm conversion story.

**C2O sub-decomposition (from summary.json):**
- C2A: 44.62% → 54.51% (+9.89pp) ← checkout completion improved
- A2O: 87.95% → 85.71% (−2.24pp) ← payment success slightly declined

---

## L1 — Mix cascade

### Level 1 — MB vs HO (from summary.json)

| Segment | Pre LP | Post LP | Pre share | Post share | Pre CVR | Post CVR | Mix effect | Conv. effect | Decision |
|---------|--------|---------|-----------|------------|---------|---------|------------|-------------|---------|
| MB | 2,260 | 2,095 | 90.73% | 90.93% | 3.14% | 5.49% | +0.006pp | +2.13pp | **Fixed — conversion dominates** |
| HO | 231 | 209 | 9.27% | 9.07% | 2.60% | 2.39% | −0.005pp | −0.20pp | — |

Conv. effect (+2.13pp) >> Mix effect (+0.006pp) → **Fix MB. Descend to Level 2.**

### Level 2 — Paid vs Organic within MB (from summary.json channel_mix)

Note: summary.json channel_mix is CE-level. MB is 90.7% of CE, so CE-level effects ≈ MB-level effects within ~10%.

| Segment | Pre LP | Post LP | Pre share | Post share | Pre CVR | Post CVR | Mix effect | Conv. effect | Decision |
|---------|--------|---------|-----------|------------|---------|---------|------------|-------------|---------|
| Paid | 1,886 | 1,623 | 83.45% | 77.47% | 3.23% | 6.41% | −0.19pp | +2.65pp | **Fixed — conversion dominates** |
| Organic | 374 | 472 | 16.55% | 22.53% | 2.67% | 2.33% | +0.16pp | −0.06pp | Mix dominant (grew share, lower CVR) |

Conv. effect for Paid (+2.65pp) >> Mix effect for Paid (−0.19pp) → **Fix Paid. Descend to Level 3.**

Note: Organic grew share (+5.98pp) but has lower CVR (2.33% post vs 3.23%+ for Paid). This is a minor mix headwind, not the story.

### Level 3 — Channel breakdown within MB·Paid (BQ query result)

Pre total Paid users: 1,393 + 498 = 1,891 (≈1,886 from summary.json ✓)
Post total Paid users: 1,037 + 587 = 1,624 (≈1,623 from summary.json ✓)

| Channel | Pre Users | Post Users | Pre share | Post share | Pre CVR | Post CVR | Mix effect | Conv. effect | Decision |
|---------|-----------|-----------|-----------|------------|---------|---------|------------|-------------|---------|
| Google Ads | 1,395 | 1,037 | 73.7% | 63.9% | 3.51% | 6.17% | −0.34pp | +1.96pp | **Fixed — largest post volume** |
| Microsoft Ads | 498 | 587 | 26.3% | 36.1% | 2.41% | 6.81% | +0.24pp | +1.16pp | — |

Both channels show strong conversion improvement. Checkout impact approximately equal: Google Ads 1,037 × 2.66% = 27.6 units; Microsoft Ads 587 × 4.40% = 25.8 units. Neither channel dominates the other by the ">all others combined" rule (27.6 < 25.8? No — 27.6 > 25.8 but only marginally). However Google Ads has the largest post-period volume (1,037 users, 63.9% of Paid). **Fixed segment: MB · Paid · Google Ads (1,037 post users, ~46% of CE post LP traffic).**

---

## L2 — S2C branch (primary step, 50.2% of ΔCVR)

All queries filtered to MB · Paid · Google Ads.

### L2a — Language cut

Query result: 99.9% of select-page users in both periods are English-language.
**RULED OUT** — no language concentration. Language cannot explain S2C improvement.

### L2b — Device cut

| Device | Pre select users | Post select users | Pre S2C | Post S2C | Δ S2C |
|--------|-----------------|------------------|---------|---------|-------|
| iOS Mweb | 591 | 441 | 15.35% | 25.00% | +9.65pp |
| Desktop | 584 | 422 | 29.70% | 35.00% | +5.30pp |
| Android | 210 | 165 | 25.61% | 25.68% | +0.07pp |

S2C improved on iOS Mweb and Desktop; Android flat. No single device accounts for the improvement — it is broad-based across all devices except Android. Android is a smaller segment and flat, not declining. **RULED OUT as independent driver** — no device-specific regression; the improvement pattern is consistent with a product-level change affecting users across devices.

### L2c — Experience-level breakdown (S2C by TGID, MB·Paid·Google Ads)

| Experience | Pre select users | Post select users | Pre S2C | Post S2C | Δ S2C | Note |
|------------|-----------------|------------------|---------|---------|-------|------|
| 36426 "Alcatraz Tickets w/ Ferry & Audio Guide" $47.95 | 7 | 255 | — | 29.02% | Emerged | First listed Apr 15 |
| 31709 "Alcatraz Island Tickets w/ Ferry & Tour App" $87.30 | 440 | 137 | 19.55% | 18.98% | −0.57pp | Volume collapsed −69% |
| 37030 "Combo: Alcatraz + Golden Gate Bay Cruise" $86.95 | 93 | 46 | 18.28% | 17.39% | −0.89pp | Volume fell |
| 43313 "Alcatraz Night Tour" $59.65 | 14 | 44 | — | 31.82% | Emerged | First listed Apr 17 |

The key observation: exp 36426 ($47.95) emerged from 7 pre-period select users to 255 post-period select users. It has the highest S2C (29.02%) of any experience in the CE. Meanwhile exp 31709 ($87.30) — the pre-period dominant product — lost 303 select users (−69% volume) despite holding S2C flat.

**Product_rankings_features check:** exp 36426 first_seen = **2026-04-15** (7 days before post period start). Exp 43313 first_seen = 2026-04-17. Both are newly launched products. Exp 31709 first_seen = 2026-03-01 (stable catalog item).

Prices: exp 36426 = $47.95; exp 31709 = $87.30. The $40 price difference is the key mechanism — lower price reduces friction at the variant selection step.

**CONFIRMED** — Product assortment change: exp 36426 launched April 15, became dominant by the post period, and has materially better S2C. This is the leaf.

### L2d — Geo/Non-Geo cut (S2C, MB·Paid·Google Ads)

| Country | Pre select users | Post select users | Pre S2C | Post S2C | Δ S2C |
|---------|-----------------|------------------|---------|---------|-------|
| United States | 562 | 279 | 23.74% | 23.39% | −0.35pp (flat) |
| Canada | 86 | 76 | 13.89% | 38.89% | +25.00pp |
| United Kingdom | 84 | 59 | 19.35% | 27.27% | +7.92pp |
| Australia | 78 | 65 | 27.78% | 50.00% | +22.22pp |
| Poland | 51 | 35 | 35.00% | 11.11% | −23.89pp (small sample) |

US domestic S2C is **flat** (−0.35pp). All international markets improved substantially. This is the corroborating mechanism: US domestic visitors seek specific tour types (self-guided app, guided experience) and continued to select exp 31709 at similar rates. International visitors, who are more price-sensitive and may have less tour-type preference, responded strongly to the new lower-priced option.

Poland is a small-sample anomaly (51→35 users; pre S2C 35% on a small base); not meaningful.

**CONFIRMED** — Geo/Non-Geo corroborates the price-sensitivity mechanism. International markets improved; US domestic was unaffected.

---

## L3 — C2O branch (secondary step, 33.1% of ΔCVR)

### L3a — C2O sub-decomposition (from summary.json)

- **C2A (checkout-to-attempt):** 44.62% → 54.51% (+9.89pp) ← dominant driver
- **A2O (attempt-to-order / payment success):** 87.95% → 85.71% (−2.24pp) ← minor headwind

C2A improved substantially. The mechanism is consistent with the exp 36426 finding: at $47.95 vs $87.30, fewer users abandon at the checkout screen after seeing the price. Users who reach checkout at the lower price point are more committed → C2A improves.

A2O declined slightly (−2.24pp). This is a minor headwind. Possible explanation: shift in customer mix from predominantly US domestic (familiar with US payment systems) to more international visitors (some payment friction). Not worth a separate investigation at these volumes (83→133 order-attempted users, small absolute change).

---

## Supply check — inventory

**Path B applies** (pre_start 2026-04-08 >= CURRENT_DATE 2026-05-06 − 30 = 2026-04-06 ✓)

### Exp 31709 TID summary (BQ inventory_availability query, latest extracted_date)

| TID | TID Name | Tickets 0–2d | Tickets 3–7d | Tickets 8–13d | Tickets 14–30d | Capacity type |
|-----|----------|-------------|-------------|-------------|--------------|--------------|
| 66558 | Ferry, App Guided Tour and Alcatraz Tickets | 41,958 | 69,930 | 83,916 | 237,762 | Limited |
| 74814 | Night Tour + Alcatraz Ticket | 2,997 | 2,997 | 3,996 | 12,987 | Limited |

Both TIDs abundantly stocked across all lead-time buckets.

### Exp 36426 TID summary

| TID | TID Name | Tickets 0–2d | Tickets 3–7d | Tickets 8–13d | Tickets 14–30d | Capacity type |
|-----|----------|-------------|-------------|-------------|--------------|--------------|
| 77352 | Alcatraz Daytime Ticket with Ferry | 9,669 | 17,214 | 21,865 | 62,461 | Limited |

Fully stocked. Supply gate passed. **RULED OUT** — supply is definitively not the mechanism for either the decline in exp 31709 volume or the increase in exp 36426 volume. The shift is demand-side.

---

## Lead-time distribution (MB·Paid·Google Ads checkouts)

| Bucket | Pre checkouts | Post checkouts | Δ |
|--------|--------------|--------------|---|
| 0–2d | 11 | 23 | +109% |
| 3–7d | 9 | 15 | +67% |
| 8–13d | 16 | 14 | −2 (flat) |
| 14–30d | 13 | 14 | +1 (flat) |
| 30d+ | 55 | 61 | +6 |

Near-term (0–2d) bookings surged +109%. This is the **opposite** of a supply scarcity pattern (supply scarcity would suppress near-term bookings and inflate lead-time). Consistent with the lower-priced product attracting more impulse/short-horizon buyers at $47.95 vs the planned-trip buyers at $87.30. **RULED OUT** as supply signal.

---

## Summary

**Root cause (LEAF reached):** The April 15, 2026 launch of exp 36426 "Alcatraz Tickets with Ferry Ride & Audio Guide" ($47.95) displaced exp 31709 "Alcatraz Island Tickets with Ferry Ride and Self-Guided Tour App" ($87.30) as the dominant Alcatraz CE product. The $40 lower price drove S2C from 22.9% to 29.9% and C2A from 44.6% to 54.5%. International visitors (Canada, UK, Australia) saw the largest S2C improvements; US domestic S2C held flat. Supply confirmed adequate for both products. Improvement is structural (+3.78pp above LY same period).
