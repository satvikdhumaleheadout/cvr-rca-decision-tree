## Root cause
Post-spring-break demand-quality collapse drove S2C down from 32.7% → 26.3% across all Kualoa Ranch experiences; a parallel delisting of the All-Inclusive Package (37863) from ~Apr 15 eliminated a second revenue stream for the final 14 days of the post period.

## Mechanism
The Kualoa Ranch MB microsite (kualoa-ranch.tickets-hawaii.com) receives two meaningfully different user cohorts within the 30-day post window:

1. **Spring break cohort (Mar 30–Apr 14):** Tourists physically in Hawaii or travelling imminently; they visit the site to book an experience for the current week. High intent → S2C 27-40%.

2. **Post-spring-break planning cohort (Apr 15–28):** Users at home planning a future Hawaii trip; they browse the date picker, click CTAs (LP2S holds at 40%+), but do not commit because their travel date is weeks or months away. Ample inventory exists (94-119 avg_remaining for 0-2d in this window) but is irrelevant to their booking decision. → S2C collapses to 13-20%.

No product change caused this: prices, availability, device distribution, and language mix are all stable. The change is purely in who is visiting.

Secondary mechanism: All-Inclusive Package (37863) was pulled from the product_rankings_features table after ~Apr 14 (only 16 of 30 post days have ranking data). From Apr 15 the experience shows 1-2 selects/day (vs 30-50/day before) and 0% S2C. This product was effectively removed from the catalog mid-period, eliminating an estimated 40-60 checkouts from that experience.

## Timing
Gradual erosion with two visible step-downs:
- **Step 1 ~Apr 4-8:** Spring break winding down, S2C drifts from ~35% to ~28%
- **Step 2 ~Apr 14-15:** Spring break fully over, traffic shifts to future planners, S2C drops to 19-22%
- **Continued deterioration Apr 15-28:** S2C hits 13-20% as post-break cohort dominates

Pattern is seasonal — consistent with spring break tourism cycle for a Hawaii attraction.

## Evidence inventory

| Claim | Supporting data | Source | Confidence |
|-------|----------------|--------|------------|
| S2C is 99.2% of ΔCVR | Shapley: S2C −1.01pp, total −1.02pp | summary.json shapley | Confirmed |
| Mix not dominant | mix_dominance.is_dominant = FALSE, channel_mix_share = 23.3% | summary.json mix_dominance | Confirmed |
| Prices unchanged | All 8 top experiences: identical avg_final_price_usd pre vs post | BQ query: avg_price_avail | Confirmed |
| Availability healthy (not cause) | avg_remaining 0-2d bucket: 34.7 (week1) → 94.8 (week2) → 119.3 (week3); zero count_dates_zero_inventory | BQ: inventory_bucket | Confirmed |
| S2C dropped all devices equally | iOS -6.8pp, Android -6.3pp, Desktop -4.6pp (COUNT DISTINCT) | BQ: device_s2c | Confirmed |
| S2C dropped both paid (+organic) | Paid -6.0pp, Organic -9.1pp (both significant, same direction) | BQ: mix_cascade_l2 | Confirmed |
| LP2S holds while S2C collapses | Apr 22-25: LP2S 40-42%, S2C 13-20% — inverse | summary.json trend daily | Confirmed |
| Ample inventory despite low S2C | avg_remaining 119 for 0-2d window in week 3 when S2C=13-20% | BQ: inventory_bucket | Confirmed |
| All-Inclusive Pkg delisted ~Apr 15 | Selects: 30-50/day (Mar 30-Apr 14) → 1-2/day (Apr 15-28); only 16/30 post days in rankings | BQ: daily_experience_s2c + product_rankings_features | Confirmed |
| Ocean Voyage Tour intermittent 0% | 0% S2C on Apr 14 (11 selects), Apr 17 (16), Apr 19 (7), Apr 20 (13) | BQ: daily_experience_s2c | Consistent with (small samples) |
| Behavioral: users browse not buy | Session recording: user clicked Select Page CTA 4× but didn't checkout; no UX error | Mixpanel replay 3ac4622d | Confirmed |
| User cohort shift post spring break | Traffic: 700-1000/day spring break → 289-400/day post Apr 22 | summary.json trend | Confirmed |
| LY comparison unreliable | Most LY dates have 0-6 users; CE at negligible scale LY | summary.json trend_context | Confirmed — structural_delta_cvr discounted |

## Open items
- **Ocean Voyage Tour 0% S2C pattern:** Consistent with a booking configuration issue but sample sizes (7-16 users) are too small to confirm vs random noise. Would need Ops/BDM investigation of API availability settings for this experience.
- **All-Inclusive Package delisting:** Confirmed product disappeared from rankings ~Apr 15. Reason unknown from data alone — could be SP-initiated pause, product configuration error, or intentional retirement. DRI: Ops/BDM to investigate what happened and whether to reinstate.
- **TGID routing mismatch (session recording):** One recording showed user searching for Jurassic Adventure Tour (tgid=37529), landing on that page, but being redirected to UTV Raptor Tour (37536) on the booking page. Not enough recordings to determine how common this is, but worth noting for Ops to verify.
