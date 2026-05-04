# CVR-RCA Evaluation (v2 — post-improvement)
CE 254 · Disneyland® Paris Tickets | 2026-03-05–2026-04-03 vs 2026-04-04–2026-05-03 | 2026-05-04

---

## Overall verdict

This RCA correctly identified the root cause, resolved the mechanism to genuine date sellouts (confirmed by
the availability proxy), and refined the calendar attribution through a controlled comparison (Spring holiday
peak broadly, not Easter specifically). Four converging signals support the finding: availability proxy
(min_days_available=0), price evidence (1-Park price fell 8.2%, ruling out dynamic pricing), lead-time
distribution (near-term checkouts down 20–27%), and the multi-day ticket control (6645 flat). All gaps from
v1 are closed: the sold-out vs pricing ambiguity is resolved, the calendar attribution is controlled and
confirmed, secondary segment explanations are present in the cascade, and the P1 action card is now
single-branch and immediately actionable. The only residual limitation is session recording unavailability,
which is a data constraint rather than an investigation failure.

---

## Theme scores

### 1. Narrative Coherence — 5/5

The report opens with metric cards, a 90-day trend for seasonal context, then a callout that now names the
mechanism precisely: "near-term dates sold out," with the availability proxy cited and dynamic pricing
explicitly ruled out by price evidence. Each Section 3 block earns its place and builds a coherent argument
in sequence: mix cascade → fixed segment → Shapley → experience table → lead-time table → availability
proxy → Easter calendar comparison. The callout "Why" answer is now definitive — the v1 hedge ("either sold
out or subject to peak dynamic pricing") has been replaced with a specific, evidenced claim.

### 2. Hypothesis Specificity & Quality — 5/5

The root cause names specific experiences (10209, 37399), specific date buckets (0–29 days), a specific
mechanism (genuine date sellout confirmed by availability proxy), and a specific calendar context (Spring
holiday peak, refined from "Easter" to the full April–June holiday window by the controlled comparison).
The multi-day ticket (6645) was used as an explicit within-CE control ruling out UX, checkout flow, and
campaign changes. The hypothesis distinguishes date-specific single-day ticket mechanics from multi-day
ticket mechanics correctly. The ambiguity present in v1 ("sold out or peak-priced") is fully resolved:
prices fell, inventory hit zero — the mechanism is unambiguous.

### 3. Investigation Effort & Adaptivity — 4/5

Positive: wrote custom queries at each level (dimension cuts, experience breakdown, lead-time distribution,
channel Level 3). Queried the availability proxy table (`product_rankings_features`) with the correct
columns (`count_days_available_30d`, `days_to_first_available_date`, `min_days_available_30d`,
`final_price_usd`), which resolved the sold-out vs pricing distinction. Ran the Easter controlled
comparison (Step 2b), computing Easter-week vs non-Easter post-period S2C and finding the scarcity was
equally present across both windows. Stopped correctly when evidence was conclusive — didn't run LP2S or
C2O sub-analyses since Shapley showed they weren't the story.

**Residual gap:** Session recordings sampled only 3 users from a single date (Apr 12), and all three
returned "No replays available." This is a data availability constraint rather than a skill gap — the
correct actions were taken (sampling multiple users, documenting the gap, noting quantitative evidence is
sufficient). Not deducted further.

**Why:** `[DATA_LIMIT]` — SKILL.md "Session recordings — required once a locus is confirmed" instructs
using Mixpanel `Get-User-Replays-Data`. All 3 sampled users returned "No replays available for the user
in the given date range." Correct action taken; data limit acknowledged in report.

### 4. Branch Decision Quality — 5/5

Mix cascade ran at all three levels with explicit mix_effect vs conversion_effect arithmetic for each
segment. Fixed segment was declared before any L2+ funnel query. The decision not to investigate LP2S or
C2O beyond Shapley context was correct and stated explicitly. The choice to use multi-day ticket as a
within-CE control was the right call. The HO secondary segment now has an explicit one-sentence explanation:
CVR collapsed for the same demand-side reason (sold-out near-term dates); growing share masked it in the
net effect. A reader can now follow why HO was dismissed without wondering if it had an independent story.

### 5. Evidence Strength — 5/5

Every claim in the report traces to a named source. The mechanism claim ("dates sold out") is now supported
by supply-side evidence — not just demand-side inference. The price evidence (`final_price_usd` pre→post)
explicitly rules out dynamic pricing. The Easter calendar controlled comparison was run: Easter week
(21.21%) vs non-Easter post days (20.92%) shows the scarcity extended across the full Spring holiday
period. The finding was consequently refined — the correct attribution is "Spring holiday peak" rather than
"Easter" — which strengthens the P2 action card (the same sellout pattern applies to Ascension Day,
Whit Monday, and summer-onset). Confidence qualifiers are used correctly: "confirmed" for all four
converging signals; "data gap" for session recordings.

### 6. Output Appropriateness — 5/5

Report length is appropriate. The availability proxy and Easter comparison blocks are added cleanly after
the lead-time table, each with a verdict line, data table, and subtext paragraph. The cascade subtext now
explains both secondary-segment patterns: (a) HO's CVR collapse is attributed to the same demand-side
mechanism, dismissing it explicitly; (b) Others' negative mix_effect is labelled as the arithmetic mirror
of Google Ads share growing — preventing misreading it as a routing change. The session recording gap
remains a single-paragraph note. No unnecessary content was added.

### 7. DRI & Actionability — 5/5

The P1 action card is now single-branch and immediately executable: "near-term dates were genuinely sold
out — confirmed by availability proxy — engage Disney SP / BDM to review allotment levels for Apr 5 –
Jun 30." No "if sold out / if cut-off" fork remains. The action is specific: negotiate proactive allotment
blocks for Ascension Day (May 21), Whit Monday (June 9), and summer onset (late June). The P2 monitoring
dates are directly supported by the Easter comparison finding (scarcity repeats at each Spring holiday
peak). A GM can forward the P1 card to the supply team immediately without an additional investigation step.

---

## Improvement summary vs v1

| Gap (v1) | Theme | v1 Score | Fix applied | v2 Score |
|---|---|---|---|---|
| Availability proxy not queried | T2, T3, T7 | T3: 3/5 | Queried `product_rankings_features`; min_days_avail=0 confirms sellout; price data rules out dynamic pricing | T3: 4/5 |
| Mechanism unresolved (sold-out vs pricing) | T1, T2, T7 | T2: 4/5, T7: 4/5 | Mechanism resolved: sellout confirmed, dynamic pricing ruled out by price drop | T2: 5/5, T7: 5/5 |
| Callout "Why" hedged | T1 | T1: 4/5 | Callout updated to definitive claim with evidence | T1: 5/5 |
| Easter attribution not controlled | T5 | T5: 4/5 | Easter comparison run; attribution refined to Spring holiday peak broadly | T5: 5/5 |
| HO secondary segment unexplained | T4 | T4: 4/5 | One-sentence explanation added to cascade table row | T4: 5/5 |
| Others mix shrinkage unexplained | T6 | T6: 4/5 | Annotation added: arithmetic mirror of Google Ads share growing | T6: 5/5 |
| Session recordings: low sample | T3 | `[DATA_LIMIT]` | No fix needed — data limit correctly handled | unchanged |

## Score summary

| Theme | v1 | v2 |
|---|---|---|
| 1. Narrative Coherence | 4/5 | 5/5 |
| 2. Hypothesis Specificity & Quality | 4/5 | 5/5 |
| 3. Investigation Effort & Adaptivity | 3/5 | 4/5 |
| 4. Branch Decision Quality | 4/5 | 5/5 |
| 5. Evidence Strength | 4/5 | 5/5 |
| 6. Output Appropriateness | 4/5 | 5/5 |
| 7. DRI & Actionability | 4/5 | 5/5 |
| **Total** | **27/35** | **34/35** |
