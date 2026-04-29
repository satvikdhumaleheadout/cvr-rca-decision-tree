# CVR-RCA Evaluation
CE 6495 · Kualoa Ranch | 2026-02-28–2026-03-29 vs 2026-03-30–2026-04-28 | 2026-04-29

## Overall verdict
The investigation correctly identified the primary driver (S2C, 101% of Shapley) and reached a defensible root cause: progressive near-term inventory depletion through April spring break/Easter season. The evidence trail — gradual daily S2C decay from 38% to 13%, next_available_date = May 2 across all experiences, 0-2d checkout bucket −32% — is coherent and well-documented. The main failure mode was not being able to confirm the supply-side mechanism through the inventory_availability table (tour_id join mismatch), and not finding a sharper explanation for the 0-2d demand signal vs the 30d+ signal both declining. The report is readable but slightly over-hedged in places and missed the opportunity to make the product discontinuation story sharper.

---

## Theme scores

### 1. Narrative Coherence — 4/5
The report follows a clean chain: Shapley → S2C is the story → daily trend shows progressive collapse → broad across all experiences → supply-side depletion. The mix ruled-out block is correctly placed. The callout is specific ("next available date = May 2 for every active experience"). Weakness: the lead-time table subtext paragraph equivocates ("may reflect that…"), weakening confidence that should be higher given the aligned evidence. The data-gap note for inventory_availability is good to include but slightly disrupts flow placed mid-Section 3 rather than at the end.

### 2. Hypothesis Specificity & Quality — 3/5
The root cause was formed at a good level ("near-term April inventory depletion due to spring/Easter demand") but the hypotheses tested were broad (availability, device, MB/HO, experience-level) rather than narrowed early by the trend shape. The gradual-erosion pattern in the daily data pointed almost immediately to a supply/calendar issue — the device and MB/HO branches were mechanically run when the L0 signals already concentrated the story. A sharper hypothesis after reading the daily trend would have been: "April near-term dates progressively sold out — does the select page show empty calendars for Apr 15-28 dates?" That would have led directly to the inventory query and session recording attempt, skipping the device/HO analysis that confirmed nothing new.
**Improvement:** After reading the daily trend collapse, form a specific "rolling sell-out" hypothesis before opening the parallel L1 batch. The device and MB/HO queries were not worth running at the scale of evidence already in the trend.

### 3. Investigation Effort & Adaptivity — 3/5
The investigation tried the right things — experience-level availability proxy, lead-time distribution, inventory_availability — but hit a wall on the supply-side confirmation (tour_id schema mismatch) and accepted a data gap rather than finding a workaround. One workaround existed: query `analytics_intermediate.inventory_changes` using the experience's tour_id looked up from a different route, or simply look at the raw inventory_availability table for all tour_ids associated with CE 6495 via a different join path. Session recordings failed (no replays) but no attempt was made to try users from earlier in the post period (Apr 5-10) where near-term availability may have still been partially available and recordings more likely to exist.
**Improvement:** On the inventory join failure, try `analytics_intermediate.inventory_changes` directly filtering by `experience_date` range, since that table doesn't require the tour_id→experience_id mapping.

### 4. Branch Decision Quality — 4/5
The three mandatory orientation signals were read simultaneously and correctly: mix ruled out (is_dominant = false), S2C dominant (101% Shapley), gradual erosion trend (LY context). The decision to not pursue a sharp-break investigation was correct given the daily data. The experience-level branch was the right first L1 after trend — it correctly ruled out a single-experience story and pointed to CE-wide supply. The device and MB/HO branches were lower-value given the L0 signals, but they were executed quickly and correctly ruled out. Explicitly stated the C2O non-starter ("C2O moved slightly positive — not the story"), which is good.

### 5. Evidence Strength — 3/5
All numeric claims in the report trace to named sources (summary.json, BQ queries). The main weakness: the primary root cause claim — "near-term April dates selling out" — is "consistent with" but not directly confirmed from supply data. The next_available_date = May 2 is a live snapshot (today), not a historical reconstructed signal of what was available on Apr 22. It's strong circumstantial evidence but not proof. The report uses "consistent with" appropriately in the transcript but the action cards are written as if the mechanism is confirmed. The lead-time table shows all buckets declining equally, which is actually ambiguous evidence — if near-term depletion were the story, you'd expect 0-2d to decline more than 30d+, but 30d+ declined the most (-46%). This anomaly was not addressed.
**Improvement:** Explicitly address the lead-time distribution anomaly: if near-term depletion is the cause, why did the 30d+ bucket decline the most (-46%)? One explanation is that the pre period captured advance bookers buying April dates (showing as 30d+ in the pre period); the post period has no equivalent forward demand for May (those users would appear in future periods). This should be stated in the subtext rather than left as an open question.

### 6. Output Appropriateness — 4/5
The report is appropriately shaped: two Plotly charts (90-day trend and daily S2C), no unnecessary language/page_type tables, the experience breakdown earns its place. The ruled-out block at the end is clean. The Shapley bar is correct for this case. The data-gap inline note is a good addition. Minor issue: the All-Inclusive Package (37863) row in the experience table draws a distracting ⚠️ discontinued flag and −1.8pp delta, but it's actually not driving the S2C story (it had 11.8% S2C throughout — this is a traffic story, not an S2C story). The table row placement suggests it's a major contributor when it isn't.

### 7. DRI & Actionability — 4/5
P1 action card for Ops/BDM names the specific TGIDs to check (37536, 37530, 37532, 37531, 37534, 37535, 39901) and names the specific mechanism (API cut-off period settings, release window for May-August). P1 action for BDM/Growth correctly identifies the Jurassic Adventure Tour (37529) discontinuation by name. P2 action on summer inventory monitoring is concrete. One gap: the first action card doesn't name a contact or deadline, which means it may sit in an email rather than getting actioned before summer season. Also, the first P1 says "review API cut-off period settings" but the evidence doesn't confirm this is the cause — the actual cause might be genuine sold-through demand, in which case there are no settings to fix. The action should be "confirm whether April depletion was demand-driven (genuine sell-through) or supply-constrained (cut-off settings, release window)" before prescribing a fix.

---

## Top improvements for next run

1. **Address the lead-time distribution anomaly explicitly.** The 30d+ bucket declining -46% (more than the 0-2d bucket's -32%) is counter-intuitive for a near-term depletion story and should be explained rather than left as ambiguous evidence. The explanation (pre-period advance bookers for April ≠ post-period advance bookers for May) is available from the data but wasn't stated.

2. **Try `inventory_changes` as the fallback when `inventory_availability` fails.** The schema mismatch on `tour_id` was a known blocker but the `analytics_intermediate.inventory_changes` table was listed in context.md as an alternative for historical periods. Running it would have provided supply-side confirmation rather than relying on `next_available_date` (a live snapshot) as a proxy.

3. **Separate the "capacity constraint" from "genuine sell-through" diagnosis in the action cards.** The P1 Ops action prescribes "review API cut-off period settings" but the near-term depletion could equally be genuine demand exceeding capacity — in which case the fix is pre-purchased inventory blocks and multivendor sourcing, not cut-off period changes. The action card should ask the DRI to first confirm which scenario it is before prescribing the remedy.
