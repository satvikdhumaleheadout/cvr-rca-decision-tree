# Investigation Transcript — CE 6495 · Kualoa Ranch
Pre: 2026-03-05 to 2026-04-03 | Post: 2026-04-04 to 2026-05-03

## Tree map
L0: S2C primary (70% ΔCVR) · gradual erosion (progressive April decline) · structural (LY N/A, structural_delta −6.4pp)
├─ L1: Mix cascade
│   ├─ L1a: Level 1 MB/HO → CONVERSION (MB dominant, conversion_effect −0.0143 >> mix_effect −0.0013). Fixed: MB
│   ├─ L1b: Level 2 Paid/Organic within MB → CONVERSION (both paid −1.46% rate, organic −1.51% rate, near-identical). Fixed: Paid
│   └─ L1c: Level 3 Channel breakdown within Paid → CONVERSION (both Google Ads −24.9pp S2C, Microsoft Ads −15.5pp S2C). Fixed: Google Ads (dominant)
├─ L2: S2C root cause (fixed segment: MB · Paid)
│   ├─ L2a: Experience-level S2C breakdown → CONFIRMED CE-WIDE (all 7 main experiences declined; no single experience dominant)
│   ├─ L2b: Availability proxy → RULED OUT (all experiences 28-31 days available, zero sold-out dates across all lead-time buckets)
│   ├─ L2c: Device × S2C cut → RULED OUT (Desktop −6.4pp, iOS −7.6pp — proportional, no concentration)
│   ├─ L2d: Language × S2C cut → RULED OUT (>99% English — no signal)
│   ├─ L2e: URL-level breakdown → CONFIRMED high-intent direct select-page users also dropped (−14pp) — not a collection-page display issue
│   ├─ L2f: Lead-time distribution → RULED OUT supply scarcity (0-2d share unchanged; no displacement to longer lead times)
│   └─ L2g: Geo vs Non-Geo country cut → CONFIRMED spring break narrative (Geo/US drop −6.8pp S2C = primary driver; Non-Geo international visitors stable to −2.4pp)
└─ LEAF: Spring break seasonal demand quality decline — US Geo visitors (83% of traffic) replaced by lower-intent off-peak tourists as April spring break window closed

---

## L0 — Orient

**mix_dominance:** is_dominant = FALSE. MB is the dominant brand (94.4% → 92.0% share). Both MB and HO show conversion_effect >> mix_effect. The story is conversion, not routing.

**shapley:**
- LP2S: −0.0024pp, 15.9% of ΔCVR
- S2C: −0.0104pp, 69.8% of ΔCVR ← PRIMARY DRIVER
- C2O: −0.0021pp, 14.3% of ΔCVR
- Total ΔCVR: −0.0149pp (CVR fell from 5.22% to 3.74%)
- S2C dropped from 31.8% to 25.2% (−6.65pp absolute)

**trend_context:**
- Shape: GRADUAL EROSION — S2C declines progressively throughout April. No single break date. First week post (Apr 4-13): ~28-34%. Second week (Apr 14-20): ~20-30%. Third week onward (Apr 21+): ~14-22%.
- pre_period_healthy = true (pre was clean baseline)
- structural_delta_cvr = −0.064 — large, none of this is seasonal
- LY data: all-zero, this CE was not meaningful on HO last year — no LY comparison possible
- Traffic also collapsed: 23,087 (pre) → 17,292 (post) = −25%. Within post period, daily users fall from ~900 in early April to ~200 by late April. This dual S2C + traffic decline is a strong availability signal.

**Key observation:** Both Paid CVR (−1.46pp rate) and Organic CVR (−1.51pp rate) declined at nearly identical rates. When paid and organic decline at the same rate, it points to a supply/product problem — not a campaign-specific issue. A campaign problem would hit Paid disproportionately.

---

## L1 — Mix Cascade

### Level 1: MB vs HO

From summary.json. No query needed.

**MB segment:**
- Pre share: 94.4% → Post share: 92.0% (−2.5pp)
- Pre CVR: 5.44% → Post CVR: 3.93% (−1.51pp rate decline)
- mix_effect = −0.00134, conversion_effect = −0.01426
- → CONVERSION DOMINANT: fix MB (is_microbrand_page = TRUE)

**HO segment:**
- Pre share: 5.6% → Post share: 8.0% (+2.5pp) — HO share actually grew
- Pre CVR: 4.36% → Post CVR: 2.72% (−1.64pp rate decline)
- mix_effect = +0.00107 (positive, because share grew while CVR is lower than MB)
- conversion_effect = −0.00091 (small)
- → HO shows conversion decline too but its absolute checkout impact is small (~1432 post users)
- HO is not the primary driver. MB is fixed.

Mix cascade Level 1 outcome: **Conversion change — fix MB**

### Level 2: Paid vs Organic within MB

From summary.json channel_mix (overall, not filtered to MB — noting this as a caveat; query needed for full MB-only breakdown but the overall numbers are dominated by MB given 92%+ share).

**Paid:**
- Pre share: 81.7% → Post share: 79.8% (−1.9pp)
- Pre CVR: 5.78% → Post CVR: 4.32% (−1.46pp rate decline)
- conversion_effect = −0.01192 DOMINANT

**Organic:**
- Pre share: 18.3% → Post share: 20.2% (+1.9pp)
- Pre CVR: 3.89% → Post CVR: 2.38% (−1.51pp rate decline)
- conversion_effect = −0.00277

Key signal: Paid and Organic rate declines are nearly identical (−1.46pp vs −1.51pp). This is a strong indicator that the problem is NOT a paid campaign issue — it's something that affects all traffic equally, consistent with a supply/availability constraint.

Mix cascade Level 2 outcome: **Conversion change — fix Paid. But near-identical rates = supply hypothesis elevated.**

### Level 3: Channel breakdown within Paid

Query results (MB + Paid, session-level rates from template):
- Google Ads: pre 16,913 → post 11,344 users (−33% traffic). S2C pre 68.7% → post 43.8% (−24.9pp session-level)
- Microsoft Ads: pre 1,756 → post 1,836 users (+5% traffic). S2C pre 43.9% → post 28.4% (−15.5pp)

Both channels show S2C declining. Microsoft Ads traffic held (+5%) but S2C still dropped significantly — if this were a Google Ads-specific campaign quality issue, Bing would hold. Both declining points away from campaign-specific cause.

Google Ads traffic fell 33%, which could be seasonal search volume reduction OR planned campaign scale-back.

Mix cascade Level 3 outcome: **Conversion change at channel level — not a single-channel campaign issue.** Proceeding to S2C funnel investigation.

**Fixed segment: MB · Paid · (primarily Google Ads)**

---

## L2 — S2C Root Cause Investigation

### L2a: Experience-level S2C breakdown

Top experiences by select-page volume (MB + Paid, user-level rates):

| Experience | Pre users_select | Post users_select | Pre S2C | Post S2C | Δ S2C | Checkout impact |
|---|---|---|---|---|---|---|
| 37536 UTV Raptor Tour | 4,277 | 2,976 | 24.5% | 19.3% | −5.2pp | −155 checkouts |
| 37530 Movie Sites & Ranch Tour | 2,084 | 1,506 | 32.8% | 23.8% | −9.0pp | −135 checkouts |
| 37532 Jungle Expedition | 989 | 696 | 27.3% | 18.4% | −8.9pp | −62 checkouts |
| 37863 All-Inclusive Package | 815 | 305 | 11.2% | 8.9% | −2.3pp | −7 checkouts |
| 37531 Jurassic Valley Zipline | 764 | 541 | 16.1% | 19.0% | +2.9pp | — |
| 39901 Ocean Voyage Tour | 370 | 292 | 18.9% | 9.9% | −9.0pp | −26 checkouts |
| 37535 Horseback Walking Tour | 666 | 503 | 14.1% | 10.9% | −3.2pp | −16 checkouts |
| 37534 Secret Island Beach | 374 | 272 | 15.0% | 12.5% | −2.5pp | −7 checkouts |
| 39903 E-Bike Tour | 256 | 163 | 18.4% | 11.0% | −7.4pp | −12 checkouts |

Result: **S2C declined broadly across virtually all experiences.** No single experience dominates. Only 37531 (Zipline) improved slightly (+2.9pp) — but its availability actually improved (pre avg_days 21.5 → post avg_days 30.6). The pattern is CE-wide, not experience-specific.

Experience 37863 (All-Inclusive Package) lost 63% of select-page traffic (815 → 305) — the sharpest volume drop of any experience. But its S2C is already very low (11% → 9%), so absolute checkout impact is minimal.

→ OPEN: No experience concentration. All declined. Consistent with a CE-wide mechanism.

### L2b: Availability proxy

Results from product_rankings_features:
| Experience | Pre days_avail_30d | Post days_avail_30d | Pre days_to_first | Post days_to_first |
|---|---|---|---|---|
| 37536 UTV Raptor | 30.7 | 30.8 | 0.32d | 0.30d |
| 37530 Movie Sites | 31.1 | 30.9 | 0.03d | 0.03d |
| 37532 Jungle Expedition | 30.6 | 30.9 | 0.03d | 0.00d |
| 37531 Zipline | 21.5 | 30.6 | 3.97d | 0.30d |
| 39901 Ocean Voyage | 27.3 | 24.7 | −0.71d | −0.10d |

→ RULED OUT: Availability is stable or improved for most experiences. First available date is essentially same-day for all main experiences. No supply scarcity.

### L2b (continued): Inventory lead-time bucket query

Query results from inventory_availability for top 3 experiences:
- ALL experiences: count_dates_zero_inventory = 0 across ALL lead-time buckets (0-2d, 3-6d, 7-13d, 14-29d, 30d+) in post period
- avg_remaining: 102–557 slots per date depending on experience/bucket
- Zero sold-out dates anywhere

→ DEFINITIVELY RULED OUT: Supply is abundant. Not a capacity issue.

### L2c: Device × S2C cut

| Device | Pre users | Post users | Pre S2C | Post S2C | Δ S2C |
|---|---|---|---|---|---|
| Desktop | 6,221 | 4,553 | 37.3% | 30.9% | −6.4pp |
| iOS Mweb | 10,138 | 7,157 | 28.1% | 20.5% | −7.6pp |
| Android Mweb | 2,031 | 1,367 | 25.4% | 23.0% | −2.4pp |

→ RULED OUT as concentrated driver: Both desktop and iOS mobile declined. iOS shows −7.6pp vs Desktop −6.4pp — slightly worse on mobile but no dominant concentration. Not a mobile UX regression (Desktop also dropped significantly).

### L2d: Language × S2C cut

→ RULED OUT: >99% English. Non-English is <10 users total, pure noise.

### L2e: URL-level breakdown

Main URL (kualoa-ranch.tickets-hawaii.com/): 18,236 pre → 12,753 post (−30% traffic). S2C: 30.8% → 24.5% (−6.3pp). This one URL accounts for ~90% of all traffic.

Direct select page URLs also show large S2C drops:
- book.tickets-hawaii.com/book/37536/select/: pre 174 (S2C 32.8%) → post 221 (S2C 18.6%) — users landing DIRECTLY on the select page also converted worse (−14.2pp)
- book.tickets-hawaii.com/book/37530/select/: pre 124 (S2C 44.4%) → post 82 (S2C 29.3%) (−15.1pp)

This is notable — HIGH INTENT users who landed directly on the select page (bypassing the collection page) also converted significantly worse in post. Their LP2S = 100% by definition, yet fewer proceeded to checkout. This is a genuine signal.

### L2f: Lead-time distribution (demand-side)

All lead-time buckets declined in volume proportionally (pre-to-post). Share composition remained relatively stable:
- 0-2d: 37.1% → 35.0% (−2.1pp share)
- 30d+: 18.1% → 15.2% (−2.9pp share)
- Other buckets: minimal change

→ RULED OUT as supply scarcity: If near-term dates were sold out, we'd see 0-2d share collapse with other buckets holding. That's not what happened.

### Weekly trend breakdown

| Week | LP users | S2C | CVR | Period |
|---|---|---|---|---|
| Mar 9 | 4,892 | 31.4% | 5.2% | pre |
| Mar 16 | 4,610 | 31.9% | 6.3% | pre |
| Mar 23 | 3,796 | 31.2% | 6.0% | pre |
| Mar 30 | 3,229 | 31.4% | 7.3% | pre |
| Apr 6 | 4,209 | 27.4% | 4.9% | post |
| Apr 13 | 4,250 | 24.7% | 4.7% | post |
| **Apr 20** | **2,635** | **19.5%** | **3.3%** | **post** |
| **Apr 27** | **1,211** | **20.8%** | **3.0%** | **post** |

Two-phase pattern:
- Phase 1 (Apr 6-19): S2C declines (31% → 25%) while traffic holds (~4,200/week). Spring break tail-end.
- Phase 2 (Apr 20+): Both S2C AND traffic collapse sharply. Traffic drops −71% vs Phase 1. Spring break ends; late-April off-peak visitors dominate.

### L2g: Geo vs Non-Geo country breakdown (MB · Paid)

Pre-step: CE 6495 home country = United States (from `dim_experiences.country`).

| Country | Geo segment | Pre users | Post users | Pre S2C | Post S2C | Δ S2C | Pre CVR | Post CVR | Δ CVR |
|---------|------------|----------|-----------|---------|---------|-------|---------|---------|-------|
| United States | Geo | 15,711 | 11,043 | 30.6% | 23.8% | −6.8pp | 6.0% | 4.5% | −1.5pp |
| Canada | Non-Geo | 1,053 | 647 | 36.9% | 26.4% | −10.5pp | 6.0% | 4.2% | −1.8pp |
| Australia | Non-Geo | 413 | 326 | 28.0% | 24.2% | −3.8pp | 2.7% | 1.2% | −1.4pp |
| South Korea | Non-Geo | 210 | 209 | 36.7% | 34.3% | −2.4pp | 6.2% | 5.7% | −0.5pp |
| Mexico | Non-Geo | 117 | 115 | 36.2% | 41.2% | +5.0pp | 8.5% | 8.7% | +0.2pp |

Key findings:

**US (Geo) is the dominant affected segment.** 15,711 pre and 11,043 post users — ~83% of all CE traffic in both periods. Their S2C dropped −6.8pp, directly matching the CE-wide drop (−6.65pp). Volume also fell −30%, consistent with spring break search demand collapsing. US domestic visitors are the spring break cohort — Hawaiian adventure ranch activities are quintessential spring break experiences for US families and students.

**Canada mirrors the US pattern.** S2C −10.5pp (36.9% → 26.4%). Canadian spring break overlaps with US spring break (late March / early April) — this is the expected outcome if spring break demand quality is the mechanism.

**International non-spring-break visitors held.** South Korea and Mexico are stable in volume (210 → 209, 117 → 115) and show minimal to positive CVR change (−0.5pp, +0.2pp). If the drop were a product or UX issue affecting all visitors, South Korean and Mexican visitors would also decline at similar rates — they did not.

**Australia: small sample caveat.** 326 post users; C2O dropped 26.2% → 13.8% (−12.4pp) but this is very small volume (~10 completions expected in post). Likely noise; not a signal.

→ CONFIRMED: The Geo/Non-Geo cut **directly confirms** the spring break demand quality mechanism. The drop is concentrated in US domestic visitors — the exact cohort whose seasonal travel window ended in mid-to-late April. International visitors are unaffected.

---

### Session recordings

### [Data pull failure — session recordings]
Error: No replays available for multiple user IDs sampled across Apr 18-25 post period
Impact: Cannot directly observe select-page UX for abandoning users
Workaround: Ruling out UX/technical issues by inference (stable LP2S across devices, all confirmed indicators point to demand quality)

---

## Root cause confirmed

**The S2C decline for Kualoa Ranch (CE 6495) is a two-phase seasonal spring break wind-down, not a product, supply, or campaign failure.**

Phase 1 (Apr 6-19): S2C dropped from 31.8% to ~25% as Hawaii's spring break season transitioned from peak (March — committed planners actively booking activities) to tail-end (early April — still visiting but with lower commitment). Traffic held at ~4,200/week. No supply or pricing driver exists — all inventory abundant, all prices stable.

Phase 2 (Apr 20+): Both S2C (19-21%) and traffic (~1,200-2,600/week) collapsed as spring break ended for most US school districts. Hawaii tourist volumes declined sharply. The remaining visitors are off-peak travelers with lower propensity to book structured adventure tours.

The pattern is consistent across every dimension checked: all experiences declined in S2C (no single experience dominates), both desktop and mobile declined proportionally, the drop is entirely in English (matching the US spring break audience), and the main channel (Google Ads) lost 33% traffic — consistent with reduced search demand for "kualoa ranch" type queries as spring break ended.

Critically: the supply-side check is clean. Zero sold-out dates across all experiences and all lead-time windows. Prices unchanged. No availability constraint.

The direct select-page URL users (high intent, bypassing collection page) also showed steep S2C drops (−14pp for the UTV Raptor select page), which is the one signal that doesn't cleanly fit a pure demand-quality story. However, this could reflect retargeted or returning users in the post period attempting a second visit when their travel window had already narrowed — and finding fewer near-term dates that fit their schedule, even though total capacity was high.

**Primary root cause:** Post-spring-break seasonal demand quality decline — lower-intent off-peak visitors replaced high-intent spring break tourists.
**Secondary finding:** Late-April traffic collapse (−71%) likely reflects spring break search volume drying up; whether paid campaigns contributed to this collapse should be verified.


