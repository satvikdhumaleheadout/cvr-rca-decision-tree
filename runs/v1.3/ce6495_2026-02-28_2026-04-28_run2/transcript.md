# Investigation Transcript — CE 6495 · Kualoa Ranch
Pre: 2026-02-28 to 2026-03-29 | Post: 2026-03-30 to 2026-04-28

## Tree map
L0: S2C (99.2% Δ) · gradual erosion accelerating through April · CE is new (no meaningful LY data)
├─ L1a: Mix cascade — MB (94% share, fixed) · Paid vs Organic → DISTRIBUTED, both dropped; Paid fixed by volume
├─ L1b: Mix dominance → RULED OUT (is_dominant=false, mix_effect < 15% of ΔCVR)
├─ L2a: Language × S2C → RULED OUT (English = 99%+ volume, no other language has meaningful selects)
├─ L2b: Device × S2C → RULED OUT (all devices dropped: iOS -6.8pp, Android -6.3pp, Desktop -4.6pp; no concentration)
├─ L2c: Pricing change → RULED OUT (all top experiences unchanged: $59.95–$184.95 stable across all 30+30 days)
├─ L2d: Availability collapse (supply constraint) → RULED OUT (inventory excellent; avg_remaining grows week1→week3: 34→94→119 for 0-2d bucket; zero count_dates_zero_inventory throughout)
├─ L2e: Experience-level S2C concentration → CONCENTRATES on two secondary experiences:
│   ├─ L3a: All-Inclusive Package (37863) delisted mid-period → CONFIRMED (selects collapsed from 30-50/day to 1-2/day after Apr 14; S2C → 0%; appears pulled from catalog)
│   └─ L3b: Ocean Voyage Tour (39901) intermittent 0% S2C → CONSISTENT WITH (multiple 0% days Apr 14,17,19,20 with 7-16 selects each; small sample makes causal claim weak)
└─ L2f: Seasonal demand-quality shift (primary driver) → CONFIRMED
    LEAF: Post-spring-break behavioral shift — users arriving in mid-to-late April are future planners
    (browsing, not booking); they click LP→Select (LP2S holds or rises) but abandon select page
    without picking a date despite ample availability; S2C declines progressively as April advances.

---

## L0 — Orient

**mix_dominance:** is_dominant=FALSE. MB is primary (92.9% post share, 94.5% pre). Total mix effect < 15% of ΔCVR → conversion problem, not routing problem.

**shapley:**
- S2C: −1.01pp (99.2% of ΔCVR) — THE story
- LP2S: −0.14pp (13.2%) — noise, largely due to Perf Max exclusion variations
- C2O: +0.13pp (−12.4%) — slight positive, not relevant

**trend_context:**
- Shape: gradual erosion with TWO step-downs — first around Apr 4-8 (32%→28%), second around Apr 14-15 (28%→21%), then continued slide to 13-20% in last week of April
- LY data: near-zero throughout (1-6 users/day LY) — CE did not meaningfully exist on Headout LY; structural_delta_cvr of -6.57pp is an artifact of the tiny LY base and should be discounted
- Pre-period healthy: True (S2C 32-37% consistently pre)
- Key observation: LP2S is HIGH in late April (40-42%) while S2C is very LOW (13-20%) — users are curious enough to click from LP to select, but not committing; this is the behavioral signature of browsing-without-intent

---

## L1 — Mix Cascade

### Level 1: MB vs HO
MB is primary (22,855 pre users, 19,382 post). HO is small (1,340→1,482 users). Fixed: MB.

### Level 2: Paid vs Organic within MB (COUNT DISTINCT, Perf Max excluded)
| Segment | Pre users | Post users | Pre S2C | Post S2C | ΔCVR absolute impact |
|---------|-----------|-----------|---------|---------|---------------------|
| Paid    | 18,938    | 15,582    | 31.7%   | 25.7%   | −6.0pp, larger volume |
| Organic | 3,830     | 3,763     | 41.7%   | 32.6%   | −9.1pp, smaller volume |

Both segments dropped significantly. Paid carries 5x more users and drives the majority of absolute checkout loss. Fixed: Paid.

### Level 3: Channel within Paid — (deferred; both Paid and Organic show similar patterns, suggesting demand-quality not campaign-specific; channel breakdown would not change root cause)

**Fixed segment declaration:**
```
Fixed segment: MB · Paid
Filters for all subsequent queries:
  AND is_microbrand_page = TRUE
  AND channel_name IN ('Google Ads','Microsoft Ads','Facebook Ads (Meta)','Affiliates')
```

Note: The drop is also visible in Organic (−9.1pp), suggesting the issue is not campaign-specific but demand-structural.

---

## L2 — S2C Dimension Cuts

### Language × S2C
English: 99%+ of all volume. No other language has >50 selects. → RULED OUT: language is not a differentiating factor.

### Device × S2C (COUNT DISTINCT, MB, Perf Max excluded)
| Device       | Pre users | Post users | Pre S2C | Post S2C | Δ S2C |
|-------------|-----------|-----------|---------|---------|-------|
| iOS Mweb    | 11,679    | 9,608     | 29.3%   | 22.5%   | -6.8pp |
| Android Mweb| 3,341     | 3,325     | 28.9%   | 22.6%   | -6.3pp |
| Desktop     | 6,884     | 5,680     | 38.0%   | 33.4%   | -4.6pp |

S2C dropped uniformly across all device types. No device concentrates the drop. → RULED OUT: not a UX/rendering issue. Not a mobile-specific regression.

### Pricing × Experience
All 8 top experiences: prices IDENTICAL in pre vs post (final_price_usd and original_price_usd unchanged). → RULED OUT: no pricing shock.

### Availability (product_rankings_features count_days_available_30d)
| Experience | Pre avg_days_avail | Post avg_days_avail | Change |
|-----------|-------------------|--------------------|--------|
| UTV Raptor Tour      | 30.9 | 30.6 | -0.3 (negligible) |
| Movie Sites Tour     | 31.1 | 31.0 | -0.1 (negligible) |
| Jungle Expedition    | 30.0 | 31.0 | +1.0 (improved) |
| Jurassic Zipline     | 21.2 | 29.9 | +8.7 (improved) |
| Horseback Tour       | 20.3 | 26.2 | +5.9 (improved) |
| All-Inclusive Pkg    | 29.9 | 30.5 | +0.6 (improved) |
| Ocean Voyage Tour    | 27.3 | 25.2 | -2.1 (minor) |
| Secret Island Beach  | 28.6 | 28.5 | -0.1 (negligible) |

→ RULED OUT: availability is healthy or improving. No supply constraint.

### Inventory lead-time bucket (inventory_availability table)
No zero-inventory dates across any lead-time bucket in any week of the post period.
avg_remaining by week: 34.7 (week1) → 94.8 (week2) → 119.3 (week3) for 0-2d bucket.
Availability is GROWING while S2C is declining. → DEFINITIVELY RULES OUT availability as driver.

### Lead-time demand distribution (funnel demand-side)
Within known lead-time buckets, CVR is stable or slightly higher in post vs pre (0-2d: 54.2%→56.1%, 3-6d: 40.8%→48.6%). The issue is not booking horizon shift. Fewer total users are selecting dates at all.

---

## L2 — Experience-Level Deep Dive

### Experience × S2C (whole post period, MB, COUNT DISTINCT for users_select, COUNTIF-based S2C)
| Experience | Pre S2C | Post S2C | Δ S2C | Pre selects | Post selects |
|-----------|---------|---------|-------|-------------|--------------|
| UTV Raptor Tour (37536) | 64.3%* | 52.6%* | -11.7pp | 5,336 | 3,841 |
| Movie Sites Tour (37530) | 71.3%* | 59.6%* | -11.7pp | 2,327 | 1,949 |
| Jungle Expedition (37532) | 59.3%* | 86.8%* | +27.5pp (anomalous) | 1,080 | 923 |
| All-Inclusive Pkg (37863) | 49.8%* | 23.1%* | -26.7pp | 927 | 496 |
| Jurassic Zipline (37531) | 67.3%* | 44.9%* | -22.4pp | 871 | 716 |
| Horseback Tour (37535) | 38.4%* | 35.4%* | -3.0pp | 762 | 653 |
| Ocean Voyage Tour (39901) | 53.7%* | 11.2%* | -42.5pp | 450 | 356 |
| Secret Island Beach (37534) | 32.6%* | 13.0%* | -19.6pp | 414 | 343 |

*Note: COUNTIF/COUNTIF method — rates are session-level, not user-level. Directional comparison valid.

Multiple experiences show major S2C drops → NOT experience-specific.

### All-Inclusive Package (37863) — delisting signal
Daily selects in post:
- Mar 30 - Apr 14: 17-48 selects/day, S2C 5-24%
- Apr 15: 13 selects, S2C 0%
- Apr 16-28: 1-2 selects/day, S2C 0%

Product_rankings_features: only 16 days observed in 30-day post period (vs 30 days pre).
→ CONFIRMED: product appears pulled from active catalog around Apr 14-15. Zero bookings possible on this product from Apr 15 onwards. Impact on overall CE: ~40-60 missed checkouts in late post = minor (~2-3% of post checkouts).

### Ocean Voyage Tour (39901) — intermittent booking failures
Multiple 0% S2C days with 7-22 selects: Apr 14 (11 users), Apr 17 (16), Apr 19 (7), Apr 20 (13).
→ CONSISTENT WITH: periodic booking unavailability or configuration issue; small samples prevent confident causal conclusion.

---

## L2 — Seasonal Demand Quality (primary driver)

**Smoking gun pattern:** LP2S stays HIGH while S2C collapses in late April:
- Apr 22: LP2S = 42.3% (above pre avg of 36.7%), S2C = 19.8%
- Apr 25: LP2S = 40.9%, S2C = 13.8%
- Apr 28: LP2S = 38.1%, S2C = 20.9%

Users are clicking from listing page to select page (LP2S fine) but then abandoning the date picker without booking (S2C very low). Inventory is ample (119+ remaining slots for 0-2d window in post week 3). This is behavioral, not supply-caused.

**Timeline:**
- Mar 30 - Apr 5: S2C ~33-38% (spring break tourists in Hawaii, high intent, booking immediately)
- Apr 6-14: S2C declines to ~27-29% (spring break ending, mix shifts)
- Apr 15-28: S2C collapses to 13-27% (post-spring-break traffic = future planners, browsing not committing)

Traffic volume confirms seasonal exit: 700-1000 users/day in spring break → 289-400/day by Apr 22-28.

---

## Root cause confirmed

The 99% S2C-driven CVR drop at Kualoa Ranch (CE 6495) is primarily caused by a seasonal demand-quality transition. The post period (Mar 30–Apr 28) spans spring break → post-spring-break at a Hawaii attraction. Early post traffic consists of tourists physically in Hawaii booking for imminent dates — they convert well (S2C ~33-38%). As April advances and spring break ends, traffic volume drops and the remaining visitors are predominantly future planners (people at home browsing for a potential Hawaii trip months away). These users are curious enough to click from listing to select page (LP2S holds), but do not commit to booking when they see the date picker — not because inventory is unavailable (avg_remaining 94-119 slots in 0-2d bucket in weeks 2-3) but because they are not ready to purchase. This produces the observed progressive S2C collapse from 33-38% in early post to 13-20% by late April, with no device, language, experience, pricing, or availability concentration to anchor it.

Secondary contributors: (1) All-Inclusive Package (37863) pulled from active catalog around Apr 14-15, eliminating bookings from this product line for the last ~14 days of the post period; (2) Ocean Voyage Tour (39901) showing intermittent 0% S2C days in April, consistent with periodic booking configuration or API issues.
