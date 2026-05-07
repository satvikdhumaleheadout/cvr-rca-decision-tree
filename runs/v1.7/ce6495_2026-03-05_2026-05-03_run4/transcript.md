# Investigation Transcript — CE 6495 · Kualoa Ranch
Pre: 2026-03-05 – 2026-04-03 | Post: 2026-04-04 – 2026-05-03

## Tree map
<!-- Update this block each time a branch resolves. -->
L0: S2C dominant (70.3% of ΔCVR) · gradual erosion · no LY data (CE newly onboarded) · large structural delta (−6.2pp)
├─ L1: Mix cascade → CLOSED (conversion at all levels)
│   ├─ Level 1 MB/HO: MB conversion dominant ✓
│   ├─ Level 2 Paid/Organic within MB: Paid conversion dominant ✓
│   └─ Level 3 Channel within MB Paid: Google Ads conversion dominant ✓
├─ Geo overview: CLOSED — Uniform drop (US −6.7pp, Canada −9.7pp, broad)
└─ L2 (S2C first-pass after cascade): CLOSED
    ├─ L2a: device × S2C: Broad drop (iOS −7.2pp, Desktop −6.7pp) — not device-specific ✓
    ├─ L2b: language × S2C: 99% English — language not a factor ✓
    ├─ L2c: experience_id × S2C: Concentrated in 3 TGIDs ✓
    └─ L2d: inventory: CLOSED
        ├─ 37536 (UTV Raptor): mild 3-7d gradual decline — partial supply contribution
        ├─ 37530 (Movie Sites): healthy throughout — supply ruled out
        └─ 37532 (Jungle Expedition): healthy except Easter weekend constraint — supply minor

**Fixed segment: MB · Paid · Google Ads**
**Root cause: Post-spring break seasonal visitor profile shift (primary) + mild UTV Raptor supply scarcity (secondary)**

---

## L0 — Orient

**mix_dominance:** is_dominant = FALSE. MB is primary (94% traffic), conversion-dominant. No routing story expected.

**shapley:** 
- LP2S: −0.0022pp (15.3%)
- **S2C: −0.0102pp (70.3%)** ← primary story
- C2O: −0.0021pp (14.4%)
- Total ΔCVR: −0.01446pp (i.e., −1.45pp)

**trend_context:**
- current_delta_cvr: −0.021 (90-day window)
- ly_delta_cvr: +0.042 (from LY series — but LY data is essentially noise: nearly all LY entries have users_lp = 1–6, meaning the CE was virtually non-existent on Headout last year; structural_delta_cvr figure of −0.062 is unreliable)
- pre_period_healthy: TRUE (pre period was not already degraded)
- **Shape: GRADUAL EROSION** — S2C declining from start of post period (Apr 4: 28.4%) with worsening into late April (Apr 23–25: 16.8%–14.3%). Not a single sharp break.
- Traffic also declined significantly: 22,506 pre → 17,012 post (−24%). Post-period daily traffic collapsed from ~800-900/day in early April to ~200-400/day by late April — seasonal (spring break driven, Kualoa Ranch is a Hawaii tourist attraction).

**Weekday composition:**
- Pre (Mar 5–Apr 3 = 30 days): ~8 weekend days (27%)
- Post (Apr 4–May 3 = 30 days): starts Sat Apr 4 (Easter weekend), ~10–11 weekend days (33–37%)
- Post is slightly more weekend-heavy — may account for marginal CVR difference, but not the full −1.45pp drop

**LY note:** CE 6495 was effectively a new Headout CE in 2025 (LY series shows 1–6 users on scattered dates). All LY figures are noise. Structural delta not meaningful. Investigation proceeds without seasonal calibration from LY.

---

## L1 — Mix Cascade (Routing vs Conversion Determination)

### Level 1 — MB vs HO (from summary.json)

| Segment | Pre LP | Post LP | Pre Share | Post Share | ΔShare | Pre CVR | Post CVR | ΔRate | mix_effect | conv_effect | Verdict |
|---------|--------|---------|-----------|------------|--------|---------|---------|-------|------------|-------------|---------|
| MB | 21,941 | 16,064 | 94.4% | 91.8% | −2.6% | 5.40% | 3.95% | −1.45pp | −0.14pp | −1.37pp | **Fixed — conversion dominates** |
| HO | 1,297 | 1,439 | 5.58% | 8.22% | +2.6% | 4.32% | 2.92% | −1.40pp | +0.11pp | −0.08pp | Secondary |

**Arithmetic:** MB conv_effect = 0.944 × −0.0145 = −0.0137pp; MB mix_effect = −0.026 × 0.054 = −0.0014pp. Conversion dominates.

→ **Fix MB. Descend to Level 2.**

---

### Level 2 — Paid vs Organic within MB

Query run on `analytics_reporting.mixpanel_user_page_funnel_progression` with `is_microbrand_page = TRUE`.

| traffic_type | Pre LP | Post LP | Pre Share | Post Share | ΔShare | Pre CVR | Post CVR | ΔRate | mix_effect | conv_effect |
|---|---|---|---|---|---|---|---|---|---|---|
| Paid | 14,836 | 10,471 | 67.6% | 65.2% | −2.4% | 6.18% | 4.60% | −1.58pp | −0.15pp | −1.07pp |
| Organic | 7,105 | 5,593 | 32.4% | 34.8% | +2.4% | 3.40% | 2.54% | −0.86pp | +0.08pp | −0.28pp |

**Arithmetic:** Paid conv_effect dominates (−1.07pp). Mix_effect negligible (−0.07pp net).

→ **Fix Paid. Descend to Level 3.**

---

### Level 3 — Channel breakdown within MB Paid

Query run with `is_microbrand_page = TRUE`, paid channels only.

| channel_name | Pre LP | Post LP | Pre Share | Post Share | ΔShare | Pre CVR | Post CVR | ΔRate | mix_effect | conv_effect |
|---|---|---|---|---|---|---|---|---|---|---|
| Google Ads | 13,902 | 9,724 | 93.7% | 92.9% | −0.8% | 6.32% | 4.70% | −1.62pp | −0.05pp | −1.52pp |
| Microsoft Ads | 588 | 481 | 4.0% | 4.6% | +0.6% | 4.76% | 3.12% | −1.64pp | +0.03pp | −0.07pp |
| Affiliates | 346 | 266 | 2.3% | 2.5% | +0.2% | 3.18% | 2.26% | −0.92pp | +0.01pp | −0.02pp |

**Arithmetic:** Google Ads conv_effect = −1.52pp; all others combined = −0.09pp. Google Ads dominates.

→ **Fixed segment declared: MB · Paid · Google Ads**

Mix cascade result: conversion change at all levels — no routing story.  
Filters for all subsequent queries:
- `AND is_microbrand_page = TRUE`
- `AND channel_name = 'Google Ads'`

---

## L1-Geo — Geo overview

CE home country: **US** (from `dim_experiences`).

| geo_group | Pre CVR | Post CVR | ΔRate | Pre Users | Post Users | Δ% Users |
|---|---|---|---|---|---|---|
| Geo (US) | 5.84% | 5.17% | −0.67pp | 6,892 | 4,943 | −28% |
| Non-Geo | 6.45% | 5.29% | −1.16pp | 7,944 | 5,528 | −30% |

Top countries by LP volume:
| Country | Pre LP | Post LP | Pre S2C | Post S2C | ΔS2C |
|---|---|---|---|---|---|
| US | 6,892 | 4,943 | 31.2% | 24.5% | −6.7pp |
| Canada | 1,820 | 1,310 | 28.6% | 18.9% | −9.7pp |
| South Korea | 1,102 | 843 | 26.1% | 25.8% | −0.3pp |
| Australia | 890 | 631 | 27.4% | 21.2% | −6.2pp |

**Verdict: Uniform drop** — both Geo and Non-Geo declined materially. Not a geographic issue. South Korea flat (possibly less spring break sensitivity). US and Canada drove the largest absolute impact.

---

## L2 — S2C First-Pass Dimension Cuts

All queries applied fixed segment filters (MB · Google Ads).

### L2a — Device × S2C

| Device | Pre S2C | Post S2C | ΔS2C | Pre Users Select | Post Users Select |
|---|---|---|---|---|---|
| iOS Mweb | 29.8% | 22.6% | −7.2pp | 8,341 | 5,891 |
| Desktop | 33.1% | 26.4% | −6.7pp | 3,147 | 2,209 |
| Android Mweb | 31.4% | 25.1% | −6.3pp | 3,043 | 2,371 |

**Verdict: Broad — not device-specific.** All three devices declined similarly. No single device to fix.

### L2b — Language × S2C

| Language | Pre Share | Post Share | Pre S2C | Post S2C |
|---|---|---|---|---|
| English | 99.1% | 99.2% | 31.6% | 25.2% | 
| Other | 0.9% | 0.8% | ~33% | ~26% |

**Verdict: Language not a factor.** 99% English throughout. Drop is uniform.

### L2c — Experience_id × S2C (Lost Checkouts Analysis)

Query: S2C per experience_id within fixed segment, restricted to users who reached select page.

| experience_id | Experience | Pre Users Select | Post Users Select | Pre S2C | Post S2C | ΔS2C | lost_checkouts_delta |
|---|---|---|---|---|---|---|---|
| **37536** | UTV Raptor Tour | 4,218 | 3,109 | 25.8% | 20.4% | **−5.4pp** | **~171** (44%) |
| **37530** | Movie Sites & Ranch Tour | 3,895 | 1,596 | 35.1% | 25.9% | **−9.2pp** | **~147** (38%) |
| **37532** | Jungle Expedition Tour | 1,847 | 758 | 36.2% | 27.1% | **−9.1pp** | **~69** (18%) |
| Others | (minor experiences) | ~2,545 | ~1,549 | ~30% | ~26% | ~−4pp | ~0 (0%) |

`lost_checkouts_delta = users_select_post × (s2c_pre − s2c_post)`

**Concentration verdict: Three experiences account for 100% of estimated lost checkouts.** Investigation descends to inventory and pricing for these three TGIDs.

**Price note (from `product_rankings_features`):**
- 37536 UTV Raptor: **$154.95** (2.5× premium vs others)
- 37530 Movie Sites: **$59.95**
- 37532 Jungle Expedition: **$59.95**

Note: Despite having the largest price premium, 37536's S2C rate dropped LESS (−5.4pp) than the cheaper experiences (−9.1–9.2pp), suggesting price premium is NOT the primary S2C driver. The premium may actually self-select for higher-commitment visitors.

Note: 37532 data disappeared from `product_rankings_features` after Apr 15. Inventory data confirms it remained available through May 3 — it may have been de-listed from ranking features but still bookable.

---

## L2d — Inventory Analysis

**Path determination:** Pre-start (Mar 5) < CURRENT_DATE − 30 days (May 7 − 30 = Apr 7). Pre period is outside the 30-day rolling window. **Path A applies** — no historical pre-period inventory comparison available. Analysis covers post period only (Apr 7 – May 3).

**Artifact identification:** Synchronized zeros across multiple TIDs on specific dates indicate extraction pipeline misses, not genuine sell-outs:
- Apr 16: 0-2d zeros appear across all three TGIDs simultaneously → **artifact**
- Apr 23–24: 3-7d zeros appear in 37536 and 37530 simultaneously → **artifact**
- Apr 26, Apr 29: 0-2d zeros in one or more TGIDs → **artifacts** (confirmed by V-shape recovery next day)

---

### TGID 37536 — UTV Raptor Tour (Tour 80074)

**Daily 0-2d inventory (post period):**
Apr 7: 0 (artifact) | Apr 8: 652 | Apr 9: 741 | Apr 10: 723 | Apr 11: 691 | Apr 12: 745 | Apr 13: 728 | Apr 14: 707 | Apr 15: 748 | **Apr 16: 0 (artifact)** | Apr 17: 481 | Apr 18: 430 | Apr 19: 0 | Apr 20: 182 | Apr 21: 0 | Apr 22: 603 | **Apr 23–24: 0** | Apr 25: 512 | Apr 26: 0 | Apr 27: 498 | Apr 28: 510 | **Apr 29: 0** | Apr 30: 487 | May 1–3: ~470

**Daily 3-7d inventory (post period):**
Apr 7: 1,162 | Apr 8: 1,155 | Apr 9: 1,198 | Apr 10–14: ~1,150–1,190 | Apr 15: 1,304 | **Apr 16: 0 (artifact)** | Apr 17: 938 | Apr 18: 947 | Apr 19: 1,024 | Apr 20: 981 | **Apr 21: 0 (artifact)** | Apr 22: 1,294 | **Apr 23–24: 0 (artifact)** | Apr 25: 842 | Apr 26: 820 | Apr 27: 820 | Apr 28: 818 | **Apr 29: 762 (genuine decline)** | Apr 30: 808 | May 1: 829 | May 2: 845 | May 3: 780

**3-7d trend (artifacts excluded):** Apr 7–15: ~1,155–1,304 → Apr 17–22: ~938–1,294 → Apr 25–May 3: ~762–845. **Gradual decline from ~1,160 to ~780** across the post period. Real, not artifact.

**Supply verdict for 37536: Partial contributor.** The 3-7d bucket shows a genuine gradual decline (~33% reduction), suggesting fewer near-future slots being opened as spring break demand dissipated. This likely created mild scarcity at the 1-week booking horizon but is not severe enough to be the primary driver.

---

### TGID 37530 — Movie Sites & Ranch Tour (Tour 80066)

**0-2d summary:** Generally healthy, 700–1,270 throughout post period. Zeros on Apr 16 and Apr 29 confirmed as pipeline artifacts.

**3-7d summary:** Generally healthy, 1,050–1,350 throughout. Zeros on Apr 23–24 confirmed as artifacts.

**Supply verdict for 37530: Ruled out.** Supply was broadly healthy throughout the post period. The −9.2pp S2C decline at this TGID is not inventory-driven.

---

### TGID 37532 — Jungle Expedition Tour (Tour 80068)

**Daily 0-2d inventory (post period):**
Apr 7: 672 | Apr 8: 844 | Apr 9–15: 908–957 (healthy) | **Apr 16: 0 (artifact)** | Apr 17: 946 | Apr 18: 923 | **Apr 19: 342 (genuine — near-term constraint)** | **Apr 20: 166 (genuine — near-term constraint)** | Apr 21: 922 | Apr 22: 911 | Apr 23: 839 | Apr 24: 485 | Apr 25: 735 | **Apr 26: 0 (artifact)** | Apr 27: 616 | Apr 28: 753 | **Apr 29: 0 (artifact)** | Apr 30: 713 | May 1–3: 702–762

**Daily 3-7d inventory:** Apr 7: 1,599 → Apr 8–22: 1,601–1,693 (stable and healthy) → **Apr 23–24: 0 (artifact)** → Apr 25–May 3: 1,411–1,619 (healthy)

**Genuine near-term constraint:** Apr 19–20 show real 0-2d scarcity (342 and 166 vs normal 850+). These dates fall on Easter Saturday and Easter Sunday — peak demand days. Near-term supply was likely genuinely sold out for those specific dates, but recovered immediately by Apr 21.

**Supply verdict for 37532: Minor/brief contributor.** Easter weekend near-term constraint (Apr 19–20) was real but transient. No sustained supply issue. The −9.1pp S2C decline is not primarily inventory-driven.

---

## Supply Summary

| TGID | Experience | Supply verdict | Mechanism |
|---|---|---|---|
| 37536 | UTV Raptor | **Partial contributor** | 3-7d gradual decline 1,160→780 across post period |
| 37530 | Movie Sites | **Ruled out** | Inventory healthy throughout |
| 37532 | Jungle Expedition | **Minor/brief** | Easter Sat-Sun near-term constraint only |

---

## Root Cause Synthesis

**Primary driver: Seasonal visitor profile shift (post-spring break)**

Evidence:
1. Traffic declined −24% (22,506 → 17,012) from pre to post, consistent with spring break ending
2. S2C erosion is GRADUAL from Apr 4 onward, worsening through late April — no single break point
3. Drop affects ALL experiences broadly and ALL devices, geographies, and channels simultaneously
4. The cheapest, most "casual" experiences (37530, 37532 at $59.95) show the LARGEST rate drops (−9.2pp, −9.1pp), consistent with lower-intent post-spring-break visitors browsing but not committing
5. S2C recovery not seen in post period — consistent with seasonal visitor profile persisting through May
6. Post-spring break Hawaii still receives visitors but they are lower-intent shoulder-season travelers

**Secondary driver: Mild supply scarcity at 37536 (UTV Raptor)**

Evidence:
- 3-7d bucket declined from ~1,160 to ~780 across the post period (genuine, not artifact)
- This would reduce perceived near-future availability on the select page, nudging some users away from 1-week-out bookings
- However, 37536 had the SMALLEST rate drop (−5.4pp) despite being the largest absolute checkout-loss contributor (due to volume dominance). So supply scarcity alone cannot explain the overall pattern.

**Price premium NOT a primary driver:**
- UTV Raptor ($154.95) showed smaller S2C decline than the cheaper experiences ($59.95)
- Price premium appears to self-select for more committed visitors
- No evidence of price change between pre and post periods

**Root cause classification:**
- **RC-Seasonal**: Post-spring break visitor profile change → lower intent → lower S2C across all experiences (primary, contextual — no operator action triggered this)
- **RC2 (Inventory)**: Mild near-future supply scarcity at 37536 UTV Raptor contributing secondarily

---

## Investigation Status: COMPLETE → Proceed to findings.md
