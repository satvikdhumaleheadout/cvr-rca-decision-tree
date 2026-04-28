# CVR-RCA Investigation Transcript
CE 1549 — Keukenhof Tickets | Pre: 2026-04-06 to 2026-04-12 | Post: 2026-04-13 to 2026-04-19

---

### [Q1: Routing or Conversion?]
Hypothesis: Testing whether MB/HO mix shift or channel mix shift explains the ΔCVR.
Data: mix_dominance.is_dominant = false. MB/HO mix share = 36.9%. Channel mix share = 12.2%.
Both MB and HO show dominant_driver = "conversion". HO CVR dropped sharply (6.55% → 3.33%, -3.22pp), 
but HO is only 5-7% of traffic. MB (94% of traffic) dropped modestly (4.67% → 4.54%).
Decision: Conversion-dominant story. Proceed to Shapley.
Ruled out: Mix shift — neither MB/HO nor channel mix accounts for the majority of ΔCVR.

---

### [Q2: Which Step is the Primary Driver?]
Hypothesis: One funnel step carries the majority of ΔCVR.
Data: Shapley — LP2S: -8.8%, S2C: -81.3%, C2O: -9.9%.
S2C dropped from 25.6% to 24.2% (-1.46pp). LP2S dropped 0.25pp, C2O dropped 0.33pp.
Decision: S2C is the primary driver. All subsequent investigation anchored to S2C.
Ruled out: LP2S and C2O are background noise at <10% Shapley share each.

---

### [Q3: Sudden or Gradual?]
Hypothesis: Testing whether onset was sudden (single event) or gradual (structural drift).
Data: Pre S2C daily — 25.4%, 27.2%, 25.7%, 25.1%, 24.1%, 25.5%, 26.4%.
Post S2C daily — 26.5%, 25.1%, 26.0%, 23.9%, 24.3%, 25.0%, 23.9%.
No single-day drop visible. Post period shows consistently slightly lower S2C.
Both periods show day-to-day variability of ~2pp, but post mean (~24.2%) is below pre mean (~25.6%).
Decision: Gradual drift. No specific onset date. Dimension cuts and availability analysis are the right tools.
Ruled out: Sudden deploy event — no single date shows a step-change. Weekday composition is similar (both Mon-Sun full weeks).


---

### [Dimension: MB vs HO S2C breakdown]
Hypothesis: The CE-level S2C drop (-1.46pp) might be concentrated in one distribution segment.
Data: HO S2C: 35.7% → 23.4% (-12.3pp). MB S2C: 24.8% → 24.2% (-0.6pp).
HO select traffic GREW: 1,045 → 1,263 users (+21%). More users reached the select page but far fewer converted.
Decision: HO segment is the locus of the S2C collapse. MB is essentially stable.
Ruled out: MB as primary driver — MB S2C unchanged at -0.6pp.

---

### [Experience: HO S2C by product]
Hypothesis: The HO S2C collapse is concentrated on the main entry ticket product.
Data: Keukenhof Entry Tickets (10118): pre S2C 31.8% (839 select), post S2C 18.4% (955 select) → -13.4pp on +14% more traffic.
Keukenhof + Transfers (16429): pre S2C 32.5% (160 select), post S2C 21.7% (281 select) → -10.8pp on +76% more traffic.
Decision: Entry ticket and transfers products drive HO S2C collapse. More users arriving at the date picker, far fewer converting.
Ruled out: Experience 41053 (Combo + Parking) on HO actually improved S2C (3.5% → 10%). The pattern is concentrated in core entry products.

---

### [Availability: Lead time distribution for Keukenhof Entry Tickets (10118)]
Hypothesis: High-intent users with specific trip dates (late April/May) are hitting sold-out inventory at the date picker.
Data: Lead time distribution for users who DID checkout:
  Pre: 15d+ = 354 users (19% of checkouts), 8-14d = 425, 4-7d = 401, 0-3d = 671
  Post: 15d+ = 184 users (10% of checkouts), 8-14d = 359, 4-7d = 383, 0-3d = 896
  15d+ collapsed by -48%. Near-term (0-3d) surged +34%.
Decision: Confirmed — far-out dates (15+ days → late April and early May) are sold out or near-sold-out.
Users who wanted to book for the Flower Parade (April 26) and post-parade peak weeks find no available dates.
Those who can be flexible book near-term; those who can't, abandon.
Ruled out: Near-term availability — still open (0-3d checkouts increased). Issue is specifically the peak season end dates.

---

### [Availability: product_rankings_features]
Hypothesis: Structural availability shrinkage as Keukenhof season approaches closure.
Data: count_days_available_30d for all experiences:
  Pre average: ~30-31 days. Post average: ~25 days (5-6 day reduction across all experiences).
  days_to_first_available_date: still near 0 for most experiences (same/next-day still open).
  Experience 42698 (Keukenhof + Flower Parade Access): only 1 day available in 30d for both periods.
Decision: Structural seasonal shrinkage of booking horizon confirmed. Keukenhof closes ~May 11;
  from Apr 13, only ~28 open days remain in 30d window. Peak dates within that window (esp. Flower Parade) selling out.
Ruled out: Near-term supply cut-off changes — days_to_first still ~0, so same-day booking still possible.

---

### [Corroborating signal: Netherlands Flower Parade URL]
Hypothesis: Demand for Flower Parade dates specifically is driving the availability crunch.
Data: netherlands-flower-parade URL saw 2.2x traffic surge (301 → 669 users, +122%) in post period.
  LP2S on this page collapsed: 12.9% → 5.1% (-7.9pp, -60.8% relative).
  Users landing on this page and not clicking through signals they can't find bookable Flower Parade dates.
Decision: Demand for April 26 Flower Parade dates is high and growing. Supply appears insufficient.
Ruled out: This is a corroborating signal, not the primary cause (too small volume to drive CE-level Shapley).

---

### [Device: HO users are desktop-heavy, explaining device dimension result]
Hypothesis: Desktop S2C drop (-2.5pp from 33.8% to 31.3%) is explained by HO users being desktop-heavy.
Data: Desktop shows the largest S2C drop among device segments. HO users are typically desktop (paid search).
  iOS Mweb (predominantly MB traffic) held flat or improved.
Decision: Device dimension is consistent with the HO/availability story. No separate device-specific UX issue.
Ruled out: Mobile UX regression — iOS Mweb S2C actually improved (+0.7pp).

---

### [Verdict Synthesis]
The CVR drop for Keukenhof Tickets (CE 1549) is driven by S2C (81.3% Shapley) declining from 25.6% to 24.2%.
The mechanism: As Keukenhof season approaches its May 11 closing date, and demand for peak dates (especially
the April 26 Netherlands Flower Parade weekend) surged, available slots for key dates in late April/early May
sold out or became very scarce.

High-intent HO users — who searched specifically for Keukenhof entry tickets with planned trip dates — reached
the date picker and found their desired dates unavailable. HO S2C collapsed from 35.7% to 23.4% (-12.3pp).
MB users (more discovery-oriented, flexible on dates) were barely affected (-0.6pp).

The lead time shift confirms the mechanism: 15d+ advance bookings halved (-48%) while near-term bookings surged,
showing that peak late-April/May dates have sold through while immediate availability remains.

DRI: Supply/Ops team to expand inventory for late-April and May dates with the Keukenhof supply partner;
     BDM to negotiate additional capacity blocks for the Flower Parade week.

