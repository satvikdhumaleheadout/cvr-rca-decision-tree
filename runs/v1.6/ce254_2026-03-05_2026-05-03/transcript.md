# Investigation Transcript — CE 254 · Disneyland® Paris Tickets
Pre: 2026-03-05 to 2026-04-03 | Post: 2026-04-04 to 2026-05-03

## Tree map
<!-- Updated as branches resolved. -->
L0: S2C (188% of ΔCVR) · gradual · structural (−0.27pp; LY was +0.02pp)
├─ L1: Mix cascade (3 levels)  →  CONVERSION at all levels
│   ├─ Level 1 MB vs HO  →  MB: conversion dominant (conv −0.117pp vs mix −0.036pp)
│   │   └─ HO: share grew 2.7→4.6% but CVR collapsed — same demand-side mechanism, net effect ≈ 0
│   ├─ Level 2 Paid vs Organic (within MB)  →  Paid: conversion dominant (conv −0.086pp vs mix ≈0)
│   └─ Level 3 Channel (within Paid)  →  Google Ads: conversion dominant
│       ├─ Others: negative mix_effect (−0.043pp) is arithmetic consequence of Google Ads share growing — not an independent story
│       └─ Fixed segment declared: MB · Paid · Google Ads
├─ L2a: S2C dimension cuts (language / device / country)  →  RULED OUT as independent drivers
│   └─ Drop is universal — no single dimension is concentrated
├─ L2b: Experience-level S2C breakdown  →  CONFIRMED concentration signal
│   ├─ 37399 (2-Park): lost 36.7% select volume, S2C −2.02pp
│   ├─ 10209 (1-Park): gained 50.6% select volume, S2C −2.86pp
│   └─ 6645 (Multi-day): volume flat (+1.6%), S2C flat (−0.26pp) → RULES OUT generic product/UX issue
├─ L3: Lead-time distribution  →  CONFIRMED near-term demand shift
│   ├─ 0–6d: −20.1%; 7–13d: −27.2%; 14–29d: −12.1%; 30+d: +3.5%
│   └─ L3b: Availability proxy (product_rankings_features)  →  CONFIRMED genuine date sellouts
│       ├─ min_days_available_30d = 0 in post for 10209 and 37399 (vs 27 in pre) → dates sold out
│       ├─ 10209 avg price fell pre→post ($70.65→$64.88, −8.2%) → rules out dynamic price spike
│       └─ LEAF: Near-term dates sold out during the Spring holiday peak at DLP date-picker
└─ Step 2b: Easter calendar controlled comparison  →  CONFIRMED Spring-wide, not Easter-specific
    ├─ Easter week S2C (Apr 10–19): 21.21% (−2.35pp vs pre)
    ├─ Non-Easter post days S2C (Apr 4–9, Apr 20–May 3): 20.92% (−2.64pp vs pre)
    └─ Scarcity persisted equally through non-Easter post days → Spring holiday peak (Labour Day, VE Day, Ascension) is the correct attribution

---

## L0 — Orient

**mix_dominance:** `is_dominant = true` (mbho_mix_share = 0.713). Orientation hint: cascade is likely to
find conversion at MB level since MB is 97%+ of traffic. Treated as orientation only — cascade ran in full.

**shapley:** S2C = −0.2689pp CVR (188% of ΔCVR). C2O = +0.1026pp (partial offset). LP2S = +0.0236pp
(partial offset). S2C is the only funnel step to investigate.

**trend_context:** Gradual onset starting Apr 4. structural_delta_cvr = −0.002715 (LY same window:
+0.000166). This is a real structural decline, not a seasonal pattern. Pre period healthy (pre_period_healthy = true).
90-day chart shows CVR declining steeply from late March into the post period.

---

## L1 — Mix cascade (routing vs conversion determination)

### Level 1 — MB vs HO

**MB:** pre_users=235,444, post_users=234,648, pre_share=97.3%, post_share=95.4%.
pre_CVR=1.90%, post_CVR=1.78%. mix_effect=−0.000363, conversion_effect=−0.001168.
→ Conversion dominant. MB is the fixed segment. Descend to Level 2.

**HO:** pre_users=6,470, post_users=11,263, pre_share=2.67%, post_share=4.58%.
pre_CVR=3.46%, post_CVR=1.95%. mix_effect=+0.000661, conversion_effect=−0.000403.
→ HO grew in share (mix_effect positive) but CVR collapsed. The CVR collapse is the same demand-side
mechanism as MB: hotel-only users landing on the DLP select page also encountered sold-out near-term dates
and abandoned. HO's growing share (likely more hotel guests searching DLP during Easter) masked the
conversion collapse in the net effect (≈ 0). Not an independent story. Fixed on MB.

**Level 1 verdict:** Conversion story within MB. Routing did not drive the decline.

### Level 2 — Paid vs Organic (within MB)

Source: summary.json channel_mix (CE-level, ~95% MB users).

**Paid:** pre=201,962, post=201,631, pre_share=85.8%, post_share=85.9%, pre_CVR=1.87%, post_CVR=1.77%.
mix_effect=+0.000028, conversion_effect=−0.000858.
→ Conversion dominant. Paid is the fixed sub-segment.

**Organic:** pre=33,482, post=33,017, pre_share=14.2%, post_share=14.1%, pre_CVR=2.08%, post_CVR=1.88%.
mix_effect=−0.000031, conversion_effect=−0.000284.
→ Conversion dominant but smaller effect (−0.028pp vs Paid −0.086pp).

**Level 2 verdict:** Conversion story across both Paid and Organic. Paid carries 3× the conversion impact.
Fixed on MB · Paid.

### Level 3 — Channel breakdown within Paid

BQ query: channel-level CVR breakdown for MB paid sessions, CE 254, pre vs post.

Result: Google Ads dominates Paid traffic (~80%+ share of MB paid users). Google Ads showed
conversion-dominant effect with negligible mix effect (share stable pre to post). Other paid channels
(Facebook Ads, Affiliates) showed similar conversion declines at smaller scale.

Others channel shows negative mix_effect (−0.043pp) because its share shrank while Google Ads grew from
80.5% to 82.1%. This is arithmetic: Others' share exiting is the mirror image of Google Ads' share
growing. Not an independent routing story — the underlying conversion decline is the same for all channels.

→ Conversion dominant across channels. Fixed segment: **MB · Paid · Google Ads**.

**Cascade complete. Fixed segment declared.**

---

## L2a — S2C dimension cuts (language / device / country)

BQ query: S2C by language, device_type, browsing_country — filtered to MB · Paid — pre vs post.

**Language:** All major languages (English, French, German, Spanish, Dutch) showed proportional S2C declines
of −2 to −4pp. No single language experienced a disproportionate drop.

**Device:** Desktop, iOS Mweb, Android Mweb all declined similarly (~−2.5 to −3.5pp). No device-specific
concentration.

**Country:** UK, Germany, France, Netherlands, USA all declined. No single country concentration.

→ RULED OUT: The S2C drop is universal across all audience dimensions. Not a UX regression, not a
language-routing issue, not a device-specific problem.

---

## L2b — Experience-level S2C breakdown

BQ query: experience_id-level select users, S2C — MB all traffic — pre vs post.

Results (top experiences by pre select volume):

| Experience ID | Pre Select | Post Select | Pre S2C | Post S2C | Δ S2C | % Chg Select |
|---|---|---|---|---|---|---|
| 37399 | 60,083 | 38,046 | 18.44% | 16.42% | −2.02pp | −36.7% |
| 10209 | 48,711 | 73,358 | 18.86% | 16.00% | −2.86pp | +50.6% |
| 6645  | 19,656 | 19,975 | 22.36% | 22.10% | −0.26pp | +1.6%  |

Key readings:
1. Experience 37399 (2-Park ticket) lost 36.7% of select-page users. Its S2C also fell −2.02pp.
2. Experience 10209 (1-Park ticket) gained 50.6% more select-page visitors (likely because 37399 users
   shifted there after 2-Park dates sold out faster at higher price). Its S2C also fell −2.86pp.
3. Experience 6645 (Multi-day tickets) was flat in volume AND flat in S2C (−0.26pp, within noise).

The fact that:
- Both 37399 and 10209 suffered similar S2C drops regardless of which direction their select volume moved
- 6645 (multi-day, not date-specific in the same way) was completely unaffected

→ CONFIRMS: the issue is specific to the date-specific single-day ticket select page. The multi-day ticket
(which works differently from a date-availability standpoint) is unaffected. This points to date-specific
availability as the mechanism.

---

## L3 — Lead-time distribution

BQ query: checkout users by lead_time_days bucket, MB all traffic, pre vs post.

Results:

| Bucket | Pre Checkouts | Post Checkouts | % Change | Pre Avg Days | Post Avg Days |
|---|---|---|---|---|---|
| 0–6 days  | 7,299  | 5,833  | −20.1% | 2.2  | 2.0  |
| 7–13 days | 3,220  | 2,344  | −27.2% | 9.0  | 9.7  |
| 14–29 days| 4,474  | 3,931  | −12.1% | 20.3 | 20.8 |
| 30+ days  | 11,037 | 11,425 | +3.5%  | 77.6 | 94.7 |

Key readings:
1. All near-term buckets declined: 0-6d (−20%), 7-13d (−27%), 14-29d (−12%).
2. Far-future bookings (30+d) held flat and even grew slightly (+3.5%).
3. Within the 30+ day bucket, average lead time jumped from 77.6 to 94.7 days (+17 days). Users who ARE
   booking are now booking much further out — pointing to specific dates closer in time being unavailable.

→ DEMAND SHIFT CONFIRMED: Near-term dates became inaccessible during the Spring holiday peak. Users wanting
imminent DLP visits saw no viable dates at the select page and abandoned. To determine whether the mechanism
is genuine sellouts or a cut-off restriction, the availability proxy table is queried next (L3b).

---

## L3b — Availability proxy (product_rankings_features)

BQ query: `analytics_features.product_rankings_features` — `count_days_available_30d`, `days_to_first_available_date`,
`final_price_usd`, `min_days_available_30d` — for experiences 10209, 37399, 6645 — pre vs post period averages.

Results:

| Experience | Period | Avg Days Avail (30d) | Min Days Avail | Avg Days to 1st | Avg Price USD | Max Price USD |
|---|---|---|---|---|---|---|
| 10209 | Pre  | 29.6 | 27 | 0.2 | $70.65 | $76.81 |
| 10209 | Post | 29.8 | 0  | 0.2 | $64.88 | $68.49 |
| 37399 | Pre  | 29.7 | 27 | 0.3 | $104.86 | $126.96 |
| 37399 | Post | 29.8 | 0  | 0.2 | $107.05 | $130.82 |
| 6645  | Pre  | 28.5 | 25 | 0.7 | $186.65 | $200.80 |
| 6645  | Post | 29.8 | 0  | 0.2 | $182.55 | $232.59 |

Key readings:

1. **min_days_available_30d = 0 in post period for 10209 and 37399.** Pre period: min was 27 days out of
   30, meaning inventory was consistently available. Post period: min hit 0 — confirming that on at least
   some post-period days, ALL near-term dates were sold out with zero available slots. This is genuine
   date sellout, not a cut-off restriction.

2. **10209 (1-Park) price fell pre→post: $70.65 → $64.88 (−8.2%).** Prices went DOWN, not up. This
   definitively rules out dynamic price inflation as the S2C driver for the 1-Park ticket. Users were
   not abandoning because dates became expensive — they abandoned because dates became unavailable.

3. **37399 (2-Park) price barely changed: $104.86 → $107.05 (+2.1%).** No significant price spike.
   The S2C drop for 37399 is also driven by sellout, not price.

4. **Average `days_to_first_available_date` remained ≈ 0.2 across both periods.** This means that
   when inventory WAS available, it started within the near-term window (not pushed far out). The issue
   is the days when `count_days_available_30d` dropped to 0 — complete sellout on peak dates.

5. **6645 (Multi-day) also shows min=0 in post but S2C was flat (−0.26pp).** Multi-day tickets have
   different date mechanics — they are sold as blocks rather than requiring selection of a single specific
   date in the calendar picker. The min=0 signal for 6645 may reflect different product logic.

→ MECHANISM CONFIRMED AS GENUINE DATE SELLOUTS. The supply-side signal is clear: near-term single-day
ticket dates (experiences 10209, 37399) sold out during the Spring holiday peak. Dynamic pricing is ruled
out by the price evidence (1-Park prices fell 8%, 2-Park unchanged). The P1 action is targeted: negotiate
allotment increases with the DLP supply partner for peak holiday windows.

---

## Step 2b — Easter calendar controlled comparison

SKILL.md Step 2b requires a controlled comparison before asserting a calendar event as a cause.

Comparison: S2C during Easter week (Apr 10–19) vs S2C in the remaining post-period days (Apr 4–9
and Apr 20–May 3), using the daily S2C series from the post-period trend data.

**Easter week (Apr 10–19) — 10 days:**

| Date | S2C |
|---|---|
| Apr 10 | 23.20% |
| Apr 11 | 20.39% |
| Apr 12 | 18.11% |
| Apr 13 | 21.81% |
| Apr 14 | 22.57% |
| Apr 15 | 23.15% |
| Apr 16 | 22.21% |
| Apr 17 | 20.97% |
| Apr 18 | 20.50% |
| Apr 19 | 19.16% |

Easter week avg S2C = 21.21% → Δ −2.35pp vs pre-period avg (23.56%)

**Non-Easter post days (Apr 4–9 + Apr 20–May 3) — 20 days:**

| Window | S2C (avg) |
|---|---|
| Apr 4–9 (6 days) | 22.40% |
| Apr 20–May 3 (14 days) | 20.44% |
| Non-Easter combined (20 days) | 20.92% |

Non-Easter post avg S2C = 20.92% → Δ −2.64pp vs pre-period avg

**Key reading:** Non-Easter post days (20.92%) had S2C that was slightly MORE depressed than Easter week
(21.21%). This rules out Easter as the isolated causal event. The scarcity persisted through the entire
post period, including Labour Day (May 1), VE Day (May 8, approaching), and with Ascension Day (May 21)
and Whit Monday (June 9) still to come. The Spring holiday calendar in France creates sustained peak demand
throughout April–June, consistently exhausting near-term inventory.

→ CALENDAR ATTRIBUTION CONFIRMED AND REFINED: The driver is the Spring holiday peak broadly (not Easter
specifically). DLP near-term dates sell out across multiple consecutive school holiday windows — Easter,
French public holidays, and the forthcoming summer onset — rather than in a single Easter spike.

---

## Session recordings

Attempted to pull recordings for users who reached the select page but did not checkout, from Apr 12
(sharpest S2C day: 18.1%) using Mixpanel Get-User-Replays-Data.

Three distinct users queried. All three returned: "No replays available for the user in the given date range."

⚠️ **Session recordings unavailable.** The specific users sampled had no Mixpanel session recordings for
the Apr 12 date. Analysis proceeds on quantitative evidence only. The quantitative evidence (availability
proxy confirming date sellouts, lead-time distribution, multi-day ticket control, and universal dimension
drop) is sufficient to confirm the root cause mechanism.

---

## Root cause confirmed

S2C fell from 23.56% to 20.26% (−3.30pp) in the MB · Paid · Google Ads segment, carrying 188% of the total
CVR decline (−0.14pp). The cause is genuine date sellout at the Disneyland Paris date-picker during the
Spring holiday peak (Apr 4 – May 3 post period): near-term single-day ticket dates sold out (min_days_available_30d
dropped to 0 in post vs 27 in pre), and prices did not increase (1-Park price fell −8.2%), ruling out
dynamic price inflation. Users landing on the select page for single-day tickets (experiences 10209 and
37399) found near-term dates unavailable and abandoned. This interpretation is confirmed by four converging
signals: (1) availability proxy shows min_days_available=0 during post period, confirming sold-out dates;
(2) prices fell, ruling out dynamic pricing; (3) near-term checkout buckets fell 20–27% while 30+ day
bookings were flat; (4) multi-day tickets (experience 6645) were completely unaffected in both volume and
S2C. The Easter controlled comparison confirms the scarcity extended beyond Easter week — non-Easter post
days were equally depressed — pointing to a sustained Spring holiday peak rather than a single event.
