# Investigation Transcript — CE 189 · Vatican Museums
Pre: 2026-02-26 – 2026-03-27 | Post: 2026-03-28 – 2026-04-26

## Tree map
<!-- Update this block each time a branch resolves. -->
L0: S2C (78% Δ) + C2O (62% Δ) · gradual + Easter calendar event · structural near-zero (+0.47pp vs LY)
├─ L1a: Easter closure days (Apr 3-5) drive aggregate S2C drop → OPEN
├─ L1b: Progressive availability sellout (Apr 23-26 declining S2C) → OPEN
├─ L1c: Post-Easter demand influx causes C2O collapse (Apr 6-9) → OPEN
└─ L1d: Structural deterioration → RULED OUT (structural_delta_cvr = +0.0047 — CE is better than LY)

---

## L0 — Orient

**mix_dominance:** is_dominant = FALSE. MB = 95% share (flat). HO = 5% (tiny increase). Both segments show conversion_effect dominant. Traffic routing is not the story.

**shapley:** LP2S +0.0024pp (IMPROVED +2.3pp — LP2S helped offset the drop). S2C −0.0047pp (78% of ΔCVR, primary). C2O −0.0037pp (62% of ΔCVR, secondary). Total ΔCVR = −0.006pp.

**trend_context:** 
- pre_period_healthy: TRUE
- current_delta_cvr: −0.0057 | ly_delta_cvr: −0.0104 | structural_delta_cvr: +0.0047
- LY had a BIGGER drop (Easter 2025 = Apr 20 fell late in LY window, flooding with near-zero-CVR traffic). Current year is structurally BETTER than LY.
- Trend shape: Not a single sharp break. Two embedded patterns:
  (1) Easter dip Apr 3-5 (Vatican closed Good Friday + Easter Sunday)
  (2) Progressive S2C decline Apr 23-26: 0.239 → 0.242 → 0.217 → 0.212
- C2O sharp depression on Apr 6-9 (Easter Monday + post-Easter surge): C2O 0.320, 0.305, 0.305, 0.318 vs pre avg 0.396

**Calendar context:**
- Easter 2026 = April 5 (Vatican closed Good Friday Apr 3, Easter Sunday Apr 5)
- Easter 2025 = April 20 (fell late in LY comparison window → explains LY's larger CVR drop)
- Post period = Mar 28 – Apr 26 = peak Vatican tourist season

**L1d RULED OUT:** structural_delta_cvr = +0.0047 → CE performing better than LY on structural basis. CVR drop is primarily calendar-driven.

## L1 — Easter impact + Availability sellout + C2O decomposition

### Hypothesis L1a — Easter closure days drag S2C aggregate

Back-of-envelope from daily trend data:
- Easter days (Apr 3-5): estimated users_select ≈ 7,625; users_checkout ≈ 1,723; S2C ≈ 22.6%
- Post excl Easter: S2C ≈ 26.4% vs pre 29.1% = −2.7pp
- Easter contribution to post S2C drag: ~0.3pp of the 3.05pp total drop
→ Easter explains ~10% of S2C drop. Non-Easter mechanism is the main story.
→ PARTIALLY CONFIRMED but not dominant. Proceeds to L1b.

### Hypothesis L1b — Progressive availability sellout
Query: experience-level S2C + count_days_available_30d + lead time distribution
[AWAITING QUERY RESULTS]

### Hypothesis L1c — Post-Easter C2O collapse
Query: C2A vs A2O breakdown daily (esp. Apr 6-9) + device × C2O
[AWAITING QUERY RESULTS]

