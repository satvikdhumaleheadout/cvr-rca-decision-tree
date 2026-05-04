# Investigation Transcript — CE 229 · Warner Bros. Studio Tour London Tickets
Pre: 2026-03-05 – 2026-04-03 | Post: 2026-04-04 – 2026-05-03

## Tree map
<!-- Update this block each time a branch resolves. -->
L0: CVR IMPROVED (+0.31pp). C2O drives (+133.7% of ΔCVR). S2C is headwind (−37.6%). pre_period_healthy=FALSE. Gradual trend.
├─ L1 Cascade: MB/HO → CONVERSION at all levels (no routing story)
│   ├─ Level 1 (MB/HO): MB conversion_effect +0.256pp >> mix_effect −0.016pp → Fixed: MB
│   ├─ Level 2 (Paid/Organic within MB): OPEN
│   └─ Level 3 (Channel within MB×Paid): OPEN
├─ L2a: C2O improvement — what drove C2A +4.45pp?  →  OPEN
└─ L2b: S2C decline — why did S2C drop −1.13pp (late-April collapse to 17-20%)?  →  OPEN
    └─ L3a: Availability scarcity (near-term slots sold out around Easter/May BH)?  →  OPEN
    └─ L3b: Experience-specific S2C decline?  →  OPEN

---

## L0 — Orient

**mix_dominance:** is_dominant=FALSE. MB dominates at 91% traffic share. Both brands show conversion-dominant effects.

**shapley:** LP2S +0.012pp (3.9%) · S2C −0.116pp (−37.6%) · C2O +0.411pp (133.7%) — C2O is the primary improvement driver. S2C is a net headwind.

**trend_context:**
- Shape: gradual / recovery. pre_period_healthy=FALSE — pre window was already below the preceding 60-day trend (Feb CVR was ~2.8-3.0%+, pre period ~2.2%)
- Structural delta vs LY: +0.82pp — genuine improvement vs last year
- S2C vs LY gap is persistent: LY S2C was ~35-40%, current year ~22-24%. This worsened sharply in late April (17-20% vs LY 34-37%)
- C2O vs LY: current year significantly higher (28.2% vs LY ~22-24%)
- LY delta at same position: −0.45pp — current year is a +0.82pp structural improvement vs LY

**Key observation:** The post period average masks a late-period S2C crisis. Apr 25–May 3 S2C = 17–20%, compared to LY ~34–37% at the same calendar position. High LP traffic on Apr 25 (2,219 users) suggests Easter/May bank holiday browsing with near-term availability likely exhausted.

**Weekday composition:** Both pre and post are 30-day periods covering full weeks — comparable weekday/weekend composition. No material weekday-composition artifact.

---

## L1 — Mix Cascade

### Level 1 — MB vs HO (from summary.json)

| Segment | Pre users | Post users | Pre share | Post share | Pre CVR | Post CVR | Mix effect | Conv. effect | Verdict |
|---------|-----------|-----------|-----------|-----------|---------|---------|-----------|------------|---------|
| MB | 39,898 | 39,296 | 91.25% | 90.53% | 2.28% | 2.56% | −0.016pp | +0.256pp | Fixed — conversion dominates |
| HO | 3,827 | 4,109 | 8.75% | 9.47% | 2.17% | 3.14% | +0.016pp | +0.085pp | — |

Both MB and HO show conversion dominance. MB has the larger absolute impact (+0.256pp vs +0.085pp for HO) and 91% of traffic.
→ **FIX: MB (is_microbrand_page = TRUE)**

### Level 2 — Paid vs Organic within MB
*[Query running — see results below]*

### Level 3 — Channel within MB × Paid
*[Query running — see results below]*

---

## L2 — Investigation
*(To be populated after cascade completes and fixed segment is declared)*

