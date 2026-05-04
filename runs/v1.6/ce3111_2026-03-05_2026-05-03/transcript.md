# Investigation Transcript — CE 3111 · Kennedy Space Center
Pre: 2026-03-05 to 2026-04-03 | Post: 2026-04-04 to 2026-05-03

## Tree map
<!-- Updated as branches resolved. -->
L0: LP2S (126% Shapley) · S2C improved (+0.91pp) · gradual + Easter spike · structural_delta_cvr −0.0091
├─ L1 Cascade
│   ├─ L1a: MB vs HO  →  CONVERSION at MB (conversion_effect −0.002378 >> mix_effect −0.000116)
│   ├─ L1b: Paid vs Organic within MB  →  MIX EXIT (Paid share −4.9pp, Paid CVR FLAT 4.32%=4.32%, mix_effect −0.002117 dominant)
│   │   └─ LEAF: Routing story — Paid traffic volume fell, shifting composition toward lower-CVR Organic
├─ L2a: WHY did Paid traffic fall — Easter calendar effect  →  CONFIRMED (pre had ~25k extra Easter users Mar 29–Apr 3; without Easter, Paid traffic ~flat)
├─ L2b: WHY did Paid traffic fall — structural campaign / volume decline  →  CONFIRMED partial (post-Easter traffic 2,500–3,500/day vs pre-Easter 3,800–4,400/day, ~15% structural)
├─ L2c: US domestic (Geo) CVR  →  CONFIRMED flat (+0.08pp, 4.35%→4.43%) — confirms routing story; conversion for core audience unchanged
├─ L2d: International conversion declines  →  CONFIRMED secondary (UK −0.75pp, Spain −0.62pp, Germany −0.27pp — smaller markets)
├─ L2e: Price / availability  →  RULED OUT (prices flat/down; most experiences ~30/30 available days; no supply constraint)
├─ L2f: Device breakdown  →  RULED OUT as independent driver (LP2S declined proportionally across iOS −3.23pp, Android −2.16pp, Desktop −1.89pp; no device is an outlier)
├─ L2g: Language breakdown  →  RULED OUT as independent driver (English −2.76pp LP2S matching CE-wide pattern; French/Portuguese improved; no single language disproportionate)
├─ L2h: Geo vs Non-Geo  →  CONFIRMED SUPPORTING (US Geo CVR flat, US share fell from 62%→54% — corroborates routing mechanism)
└─ L2i: Structural S2C gap vs LY  →  OPEN FLAG (current S2C 30–32% vs LY S2C 39–44%; structural gap predates this window; separate investigation needed)

---

## L0 — Orient

**mix_dominance:** is_dominant=false (mbho_mix_share=0.088 — MB is conversion-dominant at L1). channel_mix_share=1.196 — channel mix (Paid/Organic) explains 120% of ΔCVR at L2. The cascade will likely exit at Level 2 with a routing story.

**shapley:** LP2S = 125.7% of ΔCVR (−0.003617pp) · S2C = −35.8% (positive, OFFSETTING) · C2O = 10.1% (−0.000291pp). LP2S is the only problem step. S2C actually improved (+0.91pp), which matters: there is no date-picker or availability problem. If LP2S is the issue and it is a mix story, it is because Paid (high LP2S ~32%) shrank and Organic (low LP2S ~15%) grew in share.

**trend_context:** Pre period healthy (pre_period_healthy=true). current_delta_cvr = −0.006254 (90-day view). ly_delta_cvr = +0.002818 (LY improved at same position). structural_delta_cvr = −0.009072 — large negative, meaning ~−0.91pp genuine structural underperformance vs LY. The pre/post ΔCVR of −0.29pp understates the full structural gap.

Trend shape: gradual erosion, with a sharp Easter spike in the last 3 days of pre (Apr 1: 13,483 users LP2S 13.9%; Apr 2: 11,024 LP2S 17.9%; Apr 3: 7,688 LP2S 20.8%). Post period Apr 4-11 still elevated (5,209–6,574/day), then drops to 2,241–3,261/day from mid-April. Normal pre was ~3,800–4,400/day.

---

## L1 — Mix Cascade

### Level 1 — MB vs HO

From summary.json (no query needed):
- MB: 99.1%→98.8% share, CVR 3.86%→3.62% (Δ−0.24pp), mix_effect=−0.000116, conversion_effect=−0.002378
- HO: 0.91%→1.21% share (tiny, irrelevant)

**conversion_effect (−0.002378) >> mix_effect (−0.000116) → CONVERSION at Level 1**
Fix: MB (`is_microbrand_page = TRUE`). Proceed to Level 2.

### Level 2 — Paid vs Organic within MB

From summary.json channel_mix:
- Paid: pre 104,125 users / 71.78% share / CVR 4.32% → post 74,204 users / 66.88% share / CVR 4.32%
  - Δshare = −4.9pp · Δrate = 0.0%
  - mix_effect = −4.9pp × 4.32% = −0.002117 · conversion_effect = 71.78% × 0.0% = 0.000
  - **mix_effect DOMINANT → MIX EXIT at Level 2**
- Organic: pre 40,928 users / 28.22% share / CVR 2.69% → post 36,747 users / 33.12% share / CVR 2.20%
  - Δshare = +4.9pp · Δrate = −0.49pp
  - mix_effect = +4.9pp × 2.69% = +0.001318 · conversion_effect = 28.22% × −0.49pp = −0.001383
  - conversion_effect slightly dominant within Organic (also declining)

**CASCADE RESULT: MIX EXIT at Level 2**
Paid traffic share fell (71.78%→66.88%) while Paid CVR is completely flat. The CE-wide CVR dropped because higher-CVR Paid users became a smaller share of total traffic, replaced proportionally by lower-CVR Organic users.

Routing story: Paid traffic volume fell. Investigate why Paid volume declined.

Note: Organic CVR also fell (2.69%→2.20%, −0.49pp) but Organic total_effect = −0.000305 (small, partially offset by its growing share). Secondary but real.

### Level 3 — Channel breakdown within Paid

Query: channel_name IN ('Google Ads', 'Microsoft Ads') within MB, pre/post.

Results:
| channel | period | users_lp | LP2S | S2C | C2O | CVR |
|---------|--------|----------|------|-----|-----|-----|
| Google Ads | pre | 92,038 | 32.6% | 30.4% | 46.3% | 4.58% |
| Google Ads | post | 64,492 | 31.6% | 31.5% | 46.0% | 4.59% |
| Microsoft Ads | pre | 12,838 | 20.4% | 34.6% | 35.5% | 2.50% |
| Microsoft Ads | post | 9,968 | 20.1% | 32.7% | 38.5% | 2.53% |

Google Ads: 92,038→64,492 (−27,546 users, −30%). CVR 4.58%→4.59% (FLAT).
Microsoft Ads: 12,838→9,968 (−2,870 users, −22%). CVR 2.50%→2.53% (FLAT).

Both paid channels lost volume with completely flat CVRs. Google Ads is the dominant channel (88% of Paid) and accounts for ~95% of the Paid volume loss.

**Routing exit confirmed at Level 2. Fix: Paid volume decline, concentrated in Google Ads.**

---

## L2a / L2b — WHY did Paid traffic fall?

**Calendar decomposition:**

Pre period Easter spike (vs ~4,100/day baseline):
- Mar 29: 5,322 (+1,222 extra)
- Mar 30: 5,616 (+1,516 extra)
- Mar 31: 7,379 (+3,279 extra)
- Apr 1: 13,483 (+9,383 extra)
- Apr 2: 11,024 (+6,924 extra)
- Apr 3: 7,688 (+3,588 extra)
Total Easter extra in pre period: ~25,912 users (mostly US domestic Paid/Google Ads)

Post period Apr 4–11 still Easter/spring-break elevated: ~5,000–6,500/day.
Post period Apr 12+: drops to 2,241–3,500/day.
Pre period normal (Mar 5–28): ~3,162–4,414/day, avg ~3,900.

Without Easter spike:
- Adj. pre traffic: 133,052 − 25,912 = ~107,140 users over 27 days = ~3,968/day
- Post traffic: 102,094 over 30 days = ~3,403/day
- Calendar-adjusted traffic decline: ~−14% structural

For Paid specifically: Google Ads pre 92,038 − ~22k Easter users = ~70,000 over 27 days = ~2,593/day. Post Google Ads: 64,492 over 30 days = ~2,150/day. ~−17% structural decline in Google Ads volume.

**Conclusion: Easter calendar effect accounts for roughly 40–50% of the apparent Paid traffic decline. The remaining 50–60% represents a genuine structural decline in Google Ads traffic volume to the KSC microsite (~17% structural).**

---

## L2c — Geo vs Non-Geo

Query: Geo/Non-Geo cut, MB, all channels.

| country | geo_segment | period | users_lp | LP2S | S2C | C2O | CVR |
|---------|------------|--------|----------|------|-----|-----|-----|
| United States | Geo | pre | 82,624 | 29.8% | 30.0% | 48.7% | 4.35% |
| United States | Geo | post | 55,084 | 27.3% | 31.5% | 51.4% | 4.43% |
| United Kingdom | Non-Geo | pre | 5,707 | 25.4% | 29.9% | 35.6% | 2.70% |
| United Kingdom | Non-Geo | post | 5,389 | 24.6% | 29.2% | 27.2% | 1.95% |
| Canada | Non-Geo | pre | 4,632 | 27.3% | 31.6% | 40.1% | 3.45% |
| Canada | Non-Geo | post | 3,119 | 26.4% | 33.8% | 36.3% | 3.24% |
| Brazil | Non-Geo | pre | 3,348 | 24.6% | 32.2% | 27.9% | 2.21% |
| Brazil | Non-Geo | post | 4,340 | 24.3% | 29.6% | 30.4% | 2.19% |
| Germany | Non-Geo | pre | 4,394 | 20.6% | 29.3% | 49.8% | 3.00% |
| Germany | Non-Geo | post | 3,108 | 18.1% | 28.9% | 52.5% | 2.73% |

**KEY FINDING: US (Geo) CVR 4.35%→4.43% (+0.08pp — essentially flat).**
US LP2S fell (29.8%→27.3%, −2.5pp) but S2C (+1.52pp) and C2O (+2.73pp) improved, netting to flat CVR. The core US audience is converting at the same rate pre vs post. This confirms the routing story — the CE-wide CVR drop is primarily a traffic mix effect, not a universal conversion breakdown.

US traffic fell 82,624→55,084 (−33%), primarily the Easter spike unwinding. US share: 62.1%→53.9% (−8.2pp). Since US CVR (4.35%) > non-US CVR, the mix shift away from US users depresses CE-wide weighted average CVR.

International CVR declines: UK −0.75pp (C2O collapse 35.6%→27.2%), Canada −0.21pp, Germany −0.27pp. These are real secondary declines but smaller segments.

Brazil: traffic grew (+29%), CVR flat (2.21%→2.19%). No issue.

→ GEO CUT: RULED OUT as independent driver of primary decline. CONFIRMED as corroborating evidence for routing story. US domestic CVR is flat — the CE-wide drop is a mix story, not a US-specific problem.

---

## L2d — International conversion declines (secondary)

UK (5,707→5,389 users, CVR −0.75pp): most notable non-US decline. C2O dropped from 35.6% to 27.2% (−8.4pp). This is concentrated in the checkout-to-order step, possibly UK-specific payment friction or a price/currency change. With session recordings unavailable, mechanism is unconfirmed.

Spain (Spanish language: 13,063→11,675 users, CVR −0.62pp): Latin American visitor decline, both volume and conversion. Consistent with seasonal pattern (LatAm visitors to US attractions peak around US school holidays).

Germany (4,394→3,108 users, CVR −0.27pp): modest.

These are real secondary drivers. Not investigated further (volume impact is small: UK ~5% of traffic, Spain-language ~10%).

---

## L2e — Price / Availability

Query: product_rankings_features, CE 3111, key experiences.

Experience price/availability pre→post:
- 14660: $164→$164 (flat), availability 30.5→29.6 days (flat/full)
- 14661: $89 flat, availability 30.2→29.7 (flat/full)
- 14663: $205 flat, availability 30.6→29.6 (flat/full)
- 14664: $225 flat, availability 8.2→9.6 days (improved!)
- 14667: $106.6→$104.7 (slight decrease), availability 25.7→29.5 (improved)
- 14668: $239 flat, availability 22.4→14.3 days (DECLINED — only exception)
- 1647: $74.1→$71.7 (slight decrease), availability ~31→31 (flat)
- 24144: $127.6→$126.0 (slight decrease), availability ~30→31 (flat)
- Others: all flat prices, near-full availability

No price shock. No supply constraint. Most prices slightly decreased. Only exp 14668 ($239, premium KSC experience) shows meaningful availability decline (22→14 days). But since S2C improved (+0.91pp), availability is clearly not the driver.

→ RULED OUT: price and availability not contributing to the CVR decline.

---

## L2f — Device breakdown

Query: device_type × LP2S/CVR, MB.

| device | period | users_lp | LP2S | CVR |
|--------|--------|----------|------|-----|
| Android Mweb | pre | 24,593 | 25.8% | 3.24% |
| Android Mweb | post | 19,817 | 23.6% | 3.03% |
| Desktop | pre | 42,841 | 24.6% | 3.98% |
| Desktop | post | 30,867 | 22.7% | 3.54% |
| iOS Mweb | pre | 62,904 | 28.2% | 3.59% |
| iOS Mweb | post | 49,174 | 25.0% | 3.40% |

LP2S delta: iOS −3.23pp, Android −2.16pp, Desktop −1.89pp. All devices declined proportionally.
CVR delta: Desktop −0.43pp (largest absolute, highest base rate), iOS −0.19pp, Android −0.21pp.

No single device is dramatically different. Broad-based decline = not a device-specific UX or mobile regression. Consistent with traffic routing story (Paid → Organic mix shift reduces LP2S across all devices equally).

→ RULED OUT as independent driver. Proportional across all devices.

---

## L2g — Language breakdown

English: 101,387→72,994 users (−28%), LP2S 27.3%→24.6% (−2.8pp), CVR 3.82%→3.56% (−0.26pp) — mirrors CE-wide decline exactly.
Spanish: 13,063→11,675, CVR 3.08%→2.46% (−0.62pp) — slightly worse.
German: 5,539→4,228, CVR 5.29%→5.04% (−0.25pp, relative stability).
French: 4,269→4,469 (traffic grew), CVR 3.91%→4.86% (IMPROVED +0.95pp).
Portuguese: 3,437→4,309 (traffic grew), CVR 2.41%→2.69% (IMPROVED +0.28pp).
Italian: 2,370→1,958, LP2S 19.4%→15.3% (big LP2S drop, small volume).

English is dominant (~70% of traffic); its decline mirrors the CE-wide story exactly.
French/Portuguese improved (European and Latin American visitors converting better in post).
Spanish slightly worse (consistent with LatAm travel seasonality).

→ RULED OUT as independent driver. No single language disproportionately concentrated. The drop is English-dominated because English is 70% of traffic.

---

## L2h — Geo vs Non-Geo (supporting evidence, not independent driver)

As noted in L2c: US (Geo) CVR is flat (+0.08pp). US share fell (62.1%→53.9% of traffic). The CE-wide CVR drop is a weighted-average effect of US (high CVR) becoming a smaller share of total traffic.

The Geo cut earns inclusion in the analysis as it provides the clearest single piece of evidence that this is a routing story: the audience that converted at the same rate (US) shrank due to Easter traffic unwinding; the audiences that are structurally lower CVR (international) became a larger share.

---

## L2i — Structural S2C gap vs LY (open flag)

From trend_context 90-day series: LY S2C ~39–44% throughout. Current S2C: 30–32%.
That is a ~8–12pp structural S2C gap vs LY that has been present throughout the 90-day window.
Current S2C improved pre→post (+0.91pp) so it's not getting worse in this window.
But the comparison to LY reveals that something materially changed vs LY (pricing, supply configuration, assortment) at S2C. This predates the current investigation period.

Resolution: Not the driver of the pre/post delta. Flag as structural issue for separate DRI investigation (Growth/Ops — what changed in H2 2025 that reduced KSC select-to-checkout conversion by ~10pp vs LY?).

---

## Root cause confirmed

CVR declined 3.66%→3.38% (−0.29pp) over Apr 4–May 3 vs Mar 5–Apr 3.

**Primary cause (mix story at Level 2):** Google Ads traffic to kennedyspacecenter-tickets.com fell 92k→64k users (−30%), while Google Ads CVR held flat at 4.58%→4.59%. The traffic decline is largely a calendar artifact: Easter 2026 (Apr 5) landed in the first 2 days of the post period, but the full Easter tourism buildup — ~26k extra users, primarily US domestic Paid search — was entirely in the last 6 days of the pre period (Mar 29 - Apr 3). Adjusting for Easter, structural Paid traffic decline is ~17%. With less high-CVR Paid traffic and a higher share of lower-CVR Organic, the weighted CE-wide CVR falls — but not because the product broke.

**Confirmation:** US domestic users (82k→55k, −33%) show CVR essentially flat (4.35%→4.43%, +0.08pp). The core converting audience is unchanged in quality. The apparent CE-wide decline is a mix effect of that audience shrinking as a share of total traffic.

**Secondary:** International markets (UK −0.75pp, Spain −0.62pp) show real but smaller conversion declines, concentrated in the checkout step (C2O) for UK. Mechanism unconfirmed without session recordings.

**Structural flag:** S2C runs ~8–12pp below LY (30–32% vs LY 39–44%) throughout the 90-day window. This is a separate structural issue predating this window.

**DRI for primary cause:** Performance Marketing.
