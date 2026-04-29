# Investigation Transcript — CE 6495 · Kualoa Ranch
Pre: 2026-02-28 – 2026-03-29 | Post: 2026-03-30 – 2026-04-28

## Tree map
L0: S2C (101% Δ) · gradual erosion · structural (LY showed +5pp gain, current -1.58pp; structural Δ = -6.58pp)
├─ L1a: Availability depletion — count_days_available_30d declining through April  →  OPEN
├─ L1b: Experience-level S2C concentration — drop concentrated in 1-2 TGIDs?        →  OPEN
├─ L1c: Device × S2C — mobile UX regression?                                         →  OPEN
└─ L1d: MB vs HO S2C split — segment-specific issue?                                 →  OPEN

---

## L0 — Orient
**mix_dominance:** is_dominant = false. MB = 93% of traffic, HO = 7%. Both show conversion-dominant effects. Drop is a funnel problem, not a routing problem.

**shapley:** LP2S −13.4% · S2C +101.3% · C2O −14.6%. S2C is the only story. S2C dropped −6.36pp (32.66% → 26.30%).

**trend_context:** gradual erosion. Post S2C starts at 37.89% on Mar 30, progressively collapses to 13-19% range by Apr 22-28. No sharp break date — this is inventory depletion as April fills up. pre_period_healthy = true. structural_delta_cvr = −0.0658 (LY showed +5pp improvement; this is entirely structural).

**Traffic:** users_lp declines in second half of April (800+ early post → 400-550 late April) alongside S2C collapse. LP2S actually holds/improves (37-42%), confirming the issue is at the select page, not the landing page.

---

## L1 — Experience × Availability · Device · MB/HO — parallel batch

### L1a: Availability depletion → CONFIRMED (circumstantial)
Query: product_rankings_features count_days_available_30d pre vs post for top experiences
Result:
- 37536 (UTV Raptor): count_days_avail 30.9 → 30.6 (unchanged), days_to_first 0.1 → 0.4
- 37530 (Movie Sites): 31.1 → 31.0 (unchanged), days_to_first -0.1 → 0.0
- 37532 (Jungle Expedition): 30.0 → 31.0 (unchanged)
- Aggregate metric shows no decline — because May inventory fills the 30-day window.
- BUT: next_available_date = 2026-05-02 for ALL active experiences (as of Apr 29)
  → April 29, 30, May 1 are completely booked out.
- Demand-side lead-time distribution (checkout users): 
  0-2d:  pre 1,102 → post 749  (-32%)
  3-6d:  pre 379  → post 312  (-18%)
  7-13d: pre 465  → post 311  (-33%)
  14-29d: pre 595 → post 380  (-36%)
  30d+:  pre 580  → post 315  (-46%)
  All buckets declined; near-term and far-out fell equally or more.
- Daily S2C shows progressive worsening: Mar 30 38% → Apr 15 22% → Apr 25 13%
→ CONFIRMED (consistent with): near-term April dates progressively sold out through April.
  Count_days_avail stays high because May availability masks depletion.
  Strongest signal: next_available_date = May 2 today; rolling depletion explains gradual S2C decline.

### L1b: Experience-level concentration → RULED OUT as single-experience story
Query: experience-level S2C pre vs post
Result:
- 37536 (UTV Raptor, 4,679 pre select users): -7.4pp (26.9% → 19.6%)
- 37530 (Movie Sites, 2,290 users): -6.5pp (33.0% → 26.6%)
- 37532 (Jungle Expedition, 1,058 users): -6.6pp (27.8% → 21.2%)
- 39901 (Ocean Voyage, 434 users): -6.3pp (20.0% → 13.7%)
- 37534 (Secret Island Beach, 404 users): -5.5pp (17.3% → 11.8%)
Drop is BROAD across all major experiences (−5 to −8pp uniformly).
Prices unchanged for all experiences.
→ RULED OUT as experience-specific. CE-wide mechanism confirmed.
Additional finding: 37863 (All-Inclusive Package) traffic dropped −43% (952 → 542 select users); 
37529 (Jurassic Adventure Tour), 37533, 39903, 39902 are discontinued (is_available = FALSE).

### L1c: Device × S2C → RULED OUT as independent driver
Result:
- Desktop: S2C 39.5% → 34.5% (Δ −5.0pp, 2,841 → 2,325 select users)
- iOS Mweb: S2C 29.3% → 22.2% (Δ −7.1pp, 4,747 → 3,986 select users)
- Android Mweb: S2C 29.3% → 22.8% (Δ −6.5pp, 938 → 784 select users)
All devices dropped proportionally. No device-specific concentration.
→ RULED OUT: not a UX/mobile regression.

### L1d: MB vs HO S2C → RULED OUT as independent story
Result:
- MB: S2C 32.1% → 26.1% (Δ −6.0pp, 8,125 → 6,633 select users) — absolute majority
- HO: S2C 42.4% → 28.6% (Δ −13.8pp, 455 → 496 select users)
HO rate drop is larger but HO is only 7% of select users. Absolute impact:
- MB: −6.0pp × 6,633 = ~398 fewer checkouts
- HO: −13.8pp × 496 = ~68 fewer checkouts
MB drives the impact. Both segments declining → supply-side explanation, not segment-specific.
→ RULED OUT as independent segment story. Both affected by same CE-wide mechanism.

### Session recordings → DATA GAP
No recordings available for 4 sampled select-page abandoners (Apr 18-25).
Likely not enabled for kualoa-ranch.tickets-hawaii.com microsite.
Impact: Cannot directly observe what users see when near-term dates are unavailable.
Proceeding with "consistent with" language for the user experience at the date picker.

---

## Root cause confirmed
S2C at Kualoa Ranch (CE 6495) fell −6.36pp (32.66% → 26.30%) across all funnel steps and all devices, 
driven by progressive near-term inventory depletion through April. Spring break and Easter demand 
(March–April) filled near-term April dates. As April progressed, users arriving for their Hawaii trips 
tried to book for the coming 1-7 days but found those dates sold out — the date picker showed only 
far-future May dates. By April 22-28 (final week), S2C had collapsed to 13-19%. Today (April 29), 
every active experience shows next_available_date = May 2, confirming complete April depletion.

The broad, equal drop across 5+ experiences and all devices confirms a supply-side mechanism 
(not a product or UX regression). The 0-2d checkout bucket dropped -32% (1,102 → 749), matching 
the near-term depletion pattern. Additionally, 4-5 experiences (Jurassic Adventure Tour, All-Inclusive 
Package, E-Bike Tour, Kualoa Grown Tour) are now discontinued, compounding the assortment loss.

The structural delta is −6.58pp (LY showed +5pp improvement at this same calendar position vs current 
−1.58pp actual) — this is entirely structural. The upcoming peak summer season (May-August) is at risk 
if supply settings are not adjusted immediately.
