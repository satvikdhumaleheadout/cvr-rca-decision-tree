# Evaluation v2 — CE 6495 · Kualoa Ranch
Re-scored after post-evaluation report revisions (May 7, 2026)
Previous scores in brackets for comparison.

Changes applied before this re-score:
- LY absence → amber ⚠️ badge (was: grey subtext)
- Color reference corrected (UTV Raptor red, not blue)
- TGID 37536 split into two TID traces: 80074 (drive, dark red) and 80075 (ride-along, light red)
- Inventory snapshot table updated with 80075 row and TGID column
- 8-13d chart removed, replaced with one-line note
- P2 action card: explicit close/escalate conditions added with threshold + date
- Artifact explanation rewritten in plain English
- Chart grain (TID level) explained in reader-friendly terms

---

## 1. Overall Verdict

The revised report is materially stronger on output discipline and actionability. The two biggest improvements are: (1) removing the 8-13d chart and replacing it with a single sentence — the inventory section now matches the story it needs to tell, nothing more; and (2) splitting TGID 37536 into its two TIDs on the chart, which turned a misleading single-line claim into a genuinely informative two-variant comparison that actually strengthens the supply hypothesis. The LY badge and P2 close condition are smaller but real improvements in readability and DRI usability. The two remaining gaps — investigation sequencing before supply severity is called, and Mixpanel taxonomy check — are process issues that live in the skill files, not in this report.

---

## 2. Theme Scores

### T1 — Narrative Coherence · Score: 5 [was 4, +1]

The LY absence is now communicated via an amber ⚠️ badge immediately below the chart, impossible to miss. The color reference in the inventory callout is corrected (UTV Raptor red, not blue). Both gaps from v1 are resolved. The report's sequencing — hero callout → actions → evidence with explicit ruled-out block — remains clean. No new coherence issues introduced.

---

### T2 — Hypothesis Specificity & Quality · Score: 4 [unchanged]

The supply hypothesis is now more precise than v1: it names the specific constrained variant (80074, drive-yourself) and explicitly distinguishes it from the available substitute (80075, ride-along), then notes that users did not substitute — which positively supports the committed-buyer interpretation. The overall hypothesis is stronger as a result of the 80075 investigation. However, the underlying process gap (hypothesis formed from a partial 0-2d query before the full time-series was in hand) remains a skill-sequencing issue that this report cannot retroactively fix.

**Remaining gap:** Investigation process — the initial severity assessment was revised mid-run because the 3-7d time-series was queried after the hypothesis was formed, not before.

**Why:** `[EXEC_ERROR]` — SKILL.md L2d instructs "query inventory availability for the post period" before concluding. Full time-series should be queried in one pass before any severity label is applied. Target: R2 in skill_recommendations.md.

---

### T3 — Investigation Effort & Adaptivity · Score: 4 [unchanged]

Schema discovery for `inventory_availability` (INFORMATION_SCHEMA query) was adaptive. The 80075 discovery — finding a second TID under TGID 37536 that the original investigation missed — represents genuine adaptivity, even if it was user-prompted rather than self-initiated. The Mixpanel schema mismatch gap remains unresolved in this report; it is a tooling process issue.

**Remaining gap:** Mixpanel funnel query used BQ property names without checking the event taxonomy via `Get-Events` first.

**Why:** `[EXEC_ERROR]` — context.md lists Mixpanel steps; the transcript shows the query was built without first verifying Mixpanel's own event names. Target: R3 in skill_recommendations.md.

---

### T4 — Branch Decision Quality · Score: 5 [unchanged]

No changes needed and none made. Mix cascade, segment selection, dimension prioritisation, and branch closure logic remain rigorous. The addition of 80075 to the inventory investigation represents correct depth — a branch was re-opened when evidence showed an incomplete picture.

---

### T5 — Evidence Strength · Score: 4 [unchanged]

The supply-constraint evidence is now stronger than v1: the 80075 trace on the inventory charts provides direct visual confirmation that a substitute product was available throughout the post period but users did not convert — this positively supports the committed-buyer interpretation for TGID 37536. The seasonal-shift hypothesis (Movie Sites, Jungle Expedition) still rests on elimination rather than positive confirmation; no session recording data was obtainable.

**Remaining gap:** Seasonal shift for TGIDs 37530 and 37532 is inferred from timing and supply elimination, not confirmed from user-level data.

**Why:** `[DATA_LIMIT]` — Mixpanel session recordings unavailable due to API schema mismatch. Correctly hedged as "consistent with" in the report. No fix possible in this run.

---

### T6 — Output Appropriateness · Score: 4 [was 3, +1]

The 8-13d chart is gone. In its place: a single sentence confirming healthy supply across all TIDs in that window, with the explicit note "omitted to keep focus on the near-term finding." This is the correct treatment: include the information, exclude the visual noise. The remaining charts — 0-2d and 3-7d — now each carry a clear, distinct message (near-term void vs progressive mid-term depletion). The four-trace design (80074, 80075, Movie Sites, Jungle Expedition) makes the variant-level story legible at a glance.

**Minor gap:** The chart height was increased and legend positioned below to accommodate four traces. On narrower displays the legend may overlap the x-axis. No content error, just a layout consideration.

**Why:** `[MISSING_INSTRUCTION]` — report_structure.md has no guidance on legend placement when four or more traces are present. Minor.

---

### T7 — DRI & Actionability · Score: 5 [was 4, +1]

P2 now contains the explicit close/escalate structure the original lacked: monitored TGIDs named (37530, 37532), threshold stated (≥28% S2C), duration required (two consecutive weeks), and hard date set (Jun 30, 2026), with a defined escalation path (re-run RCA with summer post period) if the threshold is not met. All three action cards are now forwardable without additional interpretation.

---

## 3. What Improved and What Remains

**Improved (score changed):**
- T1: +1 — LY badge and color fix eliminate both coherence gaps
- T6: +1 — 8-13d chart removal tightens the evidence section to match the story
- T7: +1 — P2 close/escalate conditions make the action card completable

**Substantively improved but score unchanged:**
- T5: Supply evidence strengthened by 80075 trace, though seasonal-shift gap is DATA_LIMIT and unchanged

**Unchanged and requires skill-file fix:**
- T2: Investigation sequencing before supply severity — SKILL.md L2d
- T3: Mixpanel taxonomy check before funnel queries — context.md

---

## 4. Failure Mode Summary — Remaining Gaps

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| Supply hypothesis formed before full time-series queried | T2 | `[EXEC_ERROR]` | SKILL.md L2d (R2 in skill_recommendations.md) |
| Mixpanel query used BQ property names without taxonomy check | T3 | `[EXEC_ERROR]` | context.md Mixpanel section (R3 in skill_recommendations.md) |
| Seasonal shift not positively confirmed | T5 | `[DATA_LIMIT]` | n/a — correct to note; no fix possible |
| Four-trace legend placement on narrow displays | T6 | `[MISSING_INSTRUCTION]` | report_structure.md — minor, add legend guidance for 4+ traces |

---

**Total: 31/35** [was 28/35, +3]
Δ from v1: T1 +1, T6 +1, T7 +1
Strongest: Branch Decision Quality (T4 · 5/5) + Narrative Coherence (T1 · 5/5) + DRI & Actionability (T7 · 5/5)
Watch: Hypothesis Specificity (T2 · 4/5) — investigation sequencing gap, skill-file fix pending
