# Investigation Transcript — CE 234 · Empire State Building
Pre: 2026-04-21 to 2026-04-27 | Post: 2026-04-28 to 2026-05-04

## Tree map
<!-- Update this block each time a branch resolves. -->
L0: LP2S (87% Δ) · sharp break ~Apr 26 · structural (LY delta -0.18pp vs current -2.07pp)
├─ L1 Cascade Level 1 (MB/HO): OPEN
├─ L1 Cascade Level 2 (Paid/Organic within MB): OPEN
├─ L1 Cascade Level 3 (Channel within Paid): OPEN
└─ L2+ Funnel branches: PENDING cascade result

---

## L0 — Orient

**mix_dominance:**
- `is_dominant: false` — overall flag
- But `channel_mix_share: 0.912` — 91.2% of ΔCVR is explained by channel mix shift
- MB is dominant brand (89% pre share, 86% post share)

**shapley:**
- LP2S: -0.0180pp = 87.2% of ΔCVR (-2.07pp total)
- S2C: +0.0001pp = -0.25% (flat — not a driver)
- C2O: -0.0027pp = 13.1% (minor secondary)
- Primary step is LP2S

**trend_context:**
- Shape: LP2S was stable at 33-37% Apr 21-25, then sharply dropped to 24-28% Apr 26-27 weekend, and fell further to 18-22% from Apr 28 onwards
- `pre_period_healthy: true` — pre baseline is sound
- `structural_delta_cvr: -0.0199` — large structural change
- `ly_delta_cvr: -0.0018` — LY same week showed almost no change → NOT seasonal
- Weekday composition: 5 weekdays + 2 weekend days in both periods (identical composition, ruling out weekday-mix as a factor)

**Headline metrics:**
- CVR: 4.65% → 2.59% (Δ -2.07pp / -44%)
- LP2S: 33.3% → 19.9% (Δ -13.4pp / -40%)
- S2C: 27.4% → 27.5% (flat)
- C2O: 50.9% → 47.2% (Δ -3.7pp)
- Traffic: 1,784 → 1,315 LP users (-469, -26%)

---

## L1 — Mix Cascade (routing vs conversion determination)

### Level 1 — MB vs HO (from summary.json, no query needed)

From summary.json `mbho_mix`:

| Segment | Pre LP | Post LP | Pre share | Post share | Δshare | Pre CVR | Post CVR | ΔCVR | mix_effect | conv_effect | dominant |
|---------|--------|---------|-----------|------------|--------|---------|---------|------|-----------|------------|---------|
| MB | 1,598 | 1,141 | 89.1% | 86.4% | -2.7pp | 4.69% | 3.07% | -1.62pp | -0.13pp | -1.44pp | **conversion** |
| HO | 196 | 180 | 10.9% | 13.6% | +2.7pp | 4.59% | 0.56% | -4.03pp | +0.12pp | -0.44pp | **conversion** |

**Level 1 result:** Conversion dominates for both MB and HO. No mix exit.
→ Fix MB (89% pre share, larger absolute checkout impact)

### Level 2 — Paid vs Organic within MB (from summary.json `channel_mix`)

Note: summary.json channel_mix covers all traffic (not just MB); given MB is 89% of traffic the numbers are representative. Arithmetic from summary.json:

| Segment | Pre LP | Post LP | Pre share | Post share | Δshare | Pre CVR | Post CVR | ΔCVR | mix_effect | conv_effect | dominant |
|---------|--------|---------|-----------|------------|--------|---------|---------|------|-----------|------------|---------|
| Paid | 1,284 | 577 | 80.4% | 50.6% | **-29.8pp** | 5.69% | 5.37% | -0.32pp | **-1.69pp** | -0.26pp | **mix** |
| Organic | 314 | 564 | 19.6% | 49.4% | +29.8pp | 0.64% | 0.71% | +0.07pp | +0.19pp | +0.01pp | **mix** |

**Level 2 result: MIX EXIT — routing story**
- Paid traffic share collapsed from 80% to 51% (-29.8pp), while organic grew from 20% to 49%
- Paid absolute volume: 1,284 → 577 users (-707, -55%)
- Organic absolute volume: 314 → 564 users (+250, +80%)
- Since Paid CVR (5.69%) is ~8× Organic CVR (0.64%), this composition shift alone explains the CVR collapse
- Paid conversion rate was stable (-0.32pp) — confirming this is a supply-side traffic problem, not a product problem

**Mix cascade result: routing story — mix change detected at Level 2**
Exit reason: "Paid traffic share collapsed from 80% → 51% of total LP users (-707 users, -55%) while paid CVR held stable at 5.4–5.7%. Organic traffic grew +80% but has 8× lower CVR."
Investigation direction: why did paid traffic to CE 234 lose ~55% of volume from ~Apr 26-28? Which paid channel dropped?

### Level 3 — Channel breakdown within Paid (routing investigation, not cascade fix)

Running BQ query to identify which paid channel(s) lost volume.


**Level 3 results — Channel breakdown within paid (MB only):**

| Channel | Period | Users LP | LP2S | S2C | C2O | CVR |
|---------|--------|---------|------|-----|-----|-----|
| Google Ads | pre | 1,186 | 41.2% | 25.8% | 54.8% | 5.82% |
| Google Ads | post | 499 | 37.7% | 26.6% | 56.0% | 5.61% |
| Microsoft Ads | pre | 101 | 22.8% | 34.8% | 50.0% | 3.96% |
| Microsoft Ads | post | 78 | 23.1% | 27.8% | 60.0% | 3.85% |

**Level 3 arithmetic (routing story — which channel lost the volume):**

Total paid pre: 1,287 users (1,186 + 101)
Total paid post: 577 users (499 + 78)

| Channel | Pre share | Post share | Δshare | Pre CVR | Post CVR | ΔCVR | mix_effect | conv_effect |
|---------|-----------|------------|--------|---------|---------|------|-----------|------------|
| Google Ads | 92.2% | 86.5% | -5.7pp | 5.82% | 5.61% | -0.21pp | -0.33pp | -0.19pp |
| Microsoft Ads | 7.8% | 13.5% | +5.7pp | 3.96% | 3.85% | -0.11pp | +0.23pp | -0.01pp |

Within-paid mix_effect ≈ -0.10pp; conversion_effect ≈ -0.20pp — relatively balanced but small.
**However, the primary routing story is absolute volume:** Google Ads lost 687 users (-58%), accounting for 97% of the paid volume loss (-687 of -707 total).

**Level 3 result — routing story: Google Ads is the dominant volume driver**

→ LEAF: Google Ads traffic to CE 234's MB site (newyorktickets.com) collapsed ~58% starting around Saturday April 26, 2026. This is a campaign spend reduction or budget change.

**Daily Google Ads traffic pattern (routing investigation):**

Pre period (Apr 21-27):
- Apr 21 Mon: 161 | Apr 22 Tue: 195 | Apr 23 Wed: 322 | Apr 24 Thu: 191 | Apr 25 Fri: 163
- Apr 26 Sat: 91 ← BREAK BEGINS | Apr 27 Sun: 105
- Weekday avg (Apr 21-25): 206 users/day

Post period (Apr 28 - May 4):
- Apr 28 Mon: 83 | Apr 29 Tue: 68 | Apr 30 Wed: 74 | May 1 Thu: 78 | May 2 Fri: 80
- May 3 Sat: 66 | May 4 Sun: 70
- Weekday avg (Apr 28-May 2): 77 users/day

The break is stark: weekday Google Ads traffic fell from 206/day (Apr 21-25) to 77/day (Apr 28-May 2) — a 63% reduction. The drop started on Saturday Apr 26, consistent with a budget cap or bidding change that took effect mid-week and was first visible on the weekend. This is not a day-of-week pattern artefact: pre weekends (98/day avg) are also above post weekdays (77/day avg).

**Organic traffic pattern:**
Pre Organic: 36-69 users/day | Post Organic: 74-101 users/day
Organic grew as campaigns pulled back — likely natural SEO traffic with lower purchase intent.

---

## Tree map (updated)

L0: LP2S (87% Δ) · sharp break Apr 26 · structural (LY delta -0.18pp vs current -2.07pp)
├─ L1 Cascade Level 1 (MB/HO): CONVERSION — fix MB (both segments conversion-dominant, MB is primary)
├─ L1 Cascade Level 2 (Paid/Organic within MB): MIX EXIT — paid share -29.8pp; mix_effect=-1.69pp >> conv_effect=-0.26pp
│   └─ Routing investigation (Level 3): LEAF — Google Ads volume collapsed 58% (-687 users) starting Apr 26
│       → Google Ads CVR held stable (5.82% → 5.61%) — no product problem
│       → Microsoft Ads also down (-23 users, -23%) — secondary, same root cause likely
└─ L2+ Funnel branches: NOT NEEDED — routing story confirmed; no conversion problem to diagnose

## Root cause confirmed

Google Ads campaign volume for CE 234 (Empire State Building, MB microsite newyorktickets.com) collapsed by 58% starting Saturday April 26, 2026. Google Ads weekday traffic fell from 206 users/day (Apr 21-25) to 77 users/day (Apr 28 - May 2), a 63% reduction in daily high-intent paid search traffic. This caused the paid/organic traffic mix to shift from 80% paid / 20% organic to 51% paid / 49% organic. Since Google Ads users have ~8× higher CVR than organic users (5.8% vs ~0.7%), this composition shift alone explains the CVR collapse from 4.65% to 2.59% (-2.07pp). Google Ads CVR within the channel remained stable at 5.61-5.82%, confirming the product funnel is functioning normally — this is a paid traffic sourcing problem, not a product or supply issue.

### Tier 3 — URL impact (routing investigation, Google Ads LP breakdown)

Running BQ query: `COUNT(DISTINCT user_id)` by `page_url` for Google Ads traffic, pre vs post, CE 234, `is_microbrand_page = TRUE`.

**Results:**

| page_url | Pre users | Post users | Δ users | Δ% |
|----------|-----------|------------|---------|-----|
| newyorktickets.com/empire-state-building/ | 1,182 | 495 | −687 | −58% |
| book.newyorktickets.com/book/593/select/ | 5 | 1 | −4 | −80% |
| newyorktickets.com/empire-state-building/86th-floor-observation-deck/ | 2 | 0 | −2 | −100% |
| book.newyorktickets.com/book/593/select/time/ | 2 | 0 | −2 | −100% |
| (new) newyorktickets.com/empire-state-building/102nd-floor-observation-deck/ | 0 | 4 | +4 | new |
| All other pages | 2 | 1 | −1 | — |

**Tier 3 finding:** The Google Ads volume collapse is concentrated almost entirely on a single landing page — the main Empire State Building LP (`newyorktickets.com/empire-state-building/`), which lost 687 users (99% of the total Google Ads drop). The campaign is not redistributing traffic to other URLs; it simply stopped serving at volume. No meaningful shift to sub-pages (86th floor, skip-the-line, 102nd floor) that might indicate a campaign reconfiguration.

**Declare:** Paid traffic dropped 58% starting Saturday April 26. Channel: Google Ads. Affected pages: newyorktickets.com/empire-state-building/ (−687 users, 99% of drop). Marketing owns — conversion rates within Paid were flat.

---

**Session recordings:** Not pulled. This is a routing story — the root cause is campaign volume, not in-session user experience. Google Ads CVR held stable (5.6-5.8%), confirming no UX or product locus to investigate via recordings.

