# CVR-RCA Evaluation
CE 229 · Warner Bros. Studio Tour London Tickets | Pre: 2026-03-05–2026-04-03 vs Post: 2026-04-04–2026-05-03 | Re-evaluated: 2026-05-05

> **Re-evaluation note:** Original evaluation (2026-05-04, 26/35) had one inaccurate gap citation and one spec violation. T1 (4/5) cited "Language dimension is absent from the ruled-out block" — but line 714 of report.html explicitly contains a language ruled-out entry with justification ("Not queried as a separate dimension given that 91% of CE traffic is MB English-language (london-tickets.co.uk) and mix dominance was ruled out — mobile device breakdown captured the concentrated signal"). This is a factual error in the evaluation; the gap does not exist. T1 corrected to 5/5. T3 Gap 1 also cited language as a skipped first-pass cut; removed language from that gap description since the report explains it was de-prioritised with justification — Geo/Non-Geo and lead-time bucket remain as the two valid T3 gaps. T6 gap description corrected: language is present in the ruled-out block; only Geo/Non-Geo is absent. Additionally, the 90-day CVR chart was wrapped in an `analysis-block` div with a `block-title` header rather than a standalone `chart-container` div — this spec violation has been fixed in report.html. New total: 27/35.

---

## Overall verdict
The report tells a coherent, specific story: CVR improved overall but an acute S2C headwind in late April — caused by near-term weekend slots selling out 2–3 days in advance — is the structural risk. The mechanism is grounded in named numbers and a confirmed availability signal. The main failure mode was incomplete first-pass branch execution: the Geo/Non-Geo cut (listed first in hypothesis.md's S2C first-pass branch set) was never run, and the lead-time bucket query was replaced by a shallower availability proxy. A senior analyst reading the report would accept the supply-crunch conclusion but would ask "did you check whether the drop was UK domestic users or international visitors, and what the lead-time window actually looked like?"

---

## Theme scores

### 1. Narrative Coherence — 5/5
**Justification:** The hero callout opens with a specific, non-generic sentence ("CVR improved +0.31pp, driven entirely by C2O +4.50pp with S2C acting as a −1.13pp headwind"). Sections follow a logical sequence: metric cards → seasonal context → finding → actions → evidence. The report explicitly rules out mix dominance before entering funnel analysis (Fixed Segment banner + Shapley block). The ruled-out dimensions block addresses language explicitly: "Not queried as a separate dimension given that 91% of CE traffic is MB English-language (london-tickets.co.uk) and mix dominance was ruled out — mobile device breakdown captured the concentrated signal." Every major section has a verdict line.

No gaps.

---

### 2. Hypothesis Specificity & Quality — 4/5
**Justification:** The S2C hypothesis is specific and falsifiable: "Near-term weekend dates are selling out 2–3 days in advance; on Apr 25 (2,219 LP users, S2C 17.75%) the first available date for exp 3370 was 3 days away." This names a mechanism, a specific experience, a specific date, and a specific user count. The C2O hypothesis ("Easter + spring season elevated intent; price drop $134→$71–105 for exp 3370 reduced sticker shock") names two mechanisms with numbers. One gap: the Easter seasonality component was not controlled — no comparison of Easter-date CVR vs. non-Easter post-period dates was computed, leaving it as a plausible label rather than a confirmed factor.

**Gap:** "Easter and spring season" is cited as a C2O driver without a controlled comparison. The price data is directly evidenced; the seasonality claim is not.
**Why:** `[MISSING_INSTRUCTION]` — Searched SKILL.md Step 2b (specific checks), hypothesis.md (historical patterns), and context.md — no instruction found requiring a controlled date comparison when a calendar event is cited. SKILL.md Step 2b does say "Any calendar event cited as a cause → is there a controlled comparison showing the metric with vs. without those dates?" but this check appears only in the findings review, and could be stronger as an explicit query step in hypothesis.md. Fix: add to SKILL.md Step 2b: "controlled comparison query required before committing a seasonal event as a cause."

---

### 3. Investigation Effort & Adaptivity — 3/5
**Justification:** The investigation ran the full 3-level mix cascade, device × S2C, experience × S2C, and availability proxy for exp 3370. Session recordings were pulled once the mobile locus was confirmed (three Android Mweb user IDs) and the absence was correctly logged. However, the Geo/Non-Geo first-pass S2C cut was skipped entirely, and the lead-time bucket query (which would have shown *which booking window* was empty, not just whether near-term dates were available) was replaced by the shallower `product_rankings_features` availability proxy.

**Gap 1:** Geo/Non-Geo × S2C cut was not run. It appears in hypothesis.md's S2C first-pass branches as a required starting cut before drilling device or experience.
**Why:** `[EXEC_ERROR]` — hypothesis.md, "S2C — first-pass branches": "browsing_country (Geo/Non-Geo) × S2C rate pre/post" listed as a first-pass cut. The transcript shows device was run and concentrated (Android −3.55pp), after which the investigation descended without closing the Geo branch. Fix: run all first-pass cuts in parallel before descending.

**Gap 2:** `inventory_availability` lead-time bucket query was not run. hypothesis.md says "Run the `inventory_availability` lead-time bucket query to identify *which window* went empty" once experience concentrates.
**Why:** `[EXEC_ERROR]` — hypothesis.md, "S2C — first-pass branches → If experience concentrates": "Run the `inventory_availability` lead-time bucket query to identify which window went empty." The transcript shows `product_rankings_features` was queried instead, which provides `count_days_available_30d` and `days_to_first` but not the bucket-level breakdown. Fix: after experience concentrates, run the lead-time bucket query as the mandatory next step; note `product_rankings_features` as supplementary only.

---

### 4. Branch Decision Quality — 3/5
**Justification:** The mix/conversion decision was explicit (Level 1 table, mix_effect vs conversion_effect calculated with numbers), the MB segment was justified (largest absolute impact, 91% traffic), and the investigation correctly identified C2O as 133.7% of ΔCVR before opening S2C and C2O branches. However, the investigation transcript's tree map was never updated after initial population — Level 2 (Paid/Organic) and Level 3 (Channel) remain marked `OPEN`, and all L2 branches (L2a, L2b, L3a, L3b) remain `OPEN` throughout the saved transcript. The decisions that were made are correct; the failure is that they were not recorded in the tree map as they resolved.

**Gap:** Transcript tree map was never updated to reflect cascade Level 2 and Level 3 completion, nor were L2 branches marked CONFIRMED/RULED OUT. The tree map cannot be read to understand the investigation shape — all branches read as perpetually OPEN.
**Why:** `[EXEC_ERROR]` — SKILL.md, "Step 2 — Investigation transcript" section: "Update this block to CONFIRMED or RULED OUT as results come in... When the leaf is reached, mark it LEAF and stop." The transcript shows the initial map was written, then the investigation proceeded in a detail section, but the map was never synced. Fix: enforce tree map update as the first line of each new investigation section before writing query results.

---

### 5. Evidence Strength — 4/5
**Justification:** The evidence inventory in findings.md contains 17 claims, each with a named source (summary.json field name or BQ query result label) and a confidence level. Key numbers are specific: CVR pre 2.21% → post 2.52% (summary.json headline), days_to_first = 3 on Apr 25 (BQ availability proxy), exp 39917 present in pre (1,013 users, 17.1% S2C) and absent from post (BQ experience-level query). Session recording absence is correctly logged as a data gap. The one weakness is the Easter seasonality claim: it carries "Confirmed" confidence in the evidence inventory but no controlled comparison was run.

**Gap:** "Easter and spring season brought higher-intent planners" is listed as Confirmed in the evidence inventory with no named BQ source — the mechanism for C2O × Easter is inferred from the timing of C2O improvement, not measured.
**Why:** `[EXEC_ERROR]` — SKILL.md Step 2b: "Every count or computed metric cited anywhere in findings.md must have a named Source... If you cannot name the source, either derive the number explicitly with written arithmetic, or remove it." The claim has no BQ query source; it should have been marked "Consistent with" rather than "Confirmed" per the confidence scale.

---

### 6. Output Appropriateness — 4/5
**Justification:** Visual components are well-chosen: the 90-day CVR trend with LY overlay communicates the structural improvement; the daily S2C trend chart is essential for showing the late-April collapse (which the post-period average masked); the device × S2C table and experience × S2C table each earn their place by concentrating the drop. The positive/green callout variant was correctly applied. The Fixed Segment banner is included. The 90-day CVR chart is now correctly rendered as a standalone `chart-container` div. One gap: the ruled-out dimensions block does not mention Geo/Non-Geo, leaving a reader unable to confirm whether the UK domestic vs. international split was considered.

**Gap:** Geo/Non-Geo is absent from the ruled-out block, so the report does not close that branch for the reader.
**Why:** `[EXEC_ERROR]` — report_structure.md, "What belongs in Section 3": "Dimension cut (device / language / page_type) — Only if it produced a concentrated signal OR is being explicitly ruled out." Geo/Non-Geo was neither run nor explicitly ruled out. Fix: add a one-line note in the ruled-out block ("Geo/Non-Geo cut not run; device and experience captured the concentrated signal").

---

### 7. DRI & Actionability — 4/5
**Justification:** P1 Supply/BDM action is specific: names Exp 3370 weekend allotments and asks for investigation of Exp 39917's disappearance — a DRI can act on this directly. P1 Ops/Content action names Exp 32872 and the mechanism (no-transport abandonment), giving the content team a specific page and intervention. P2 Performance Marketing is correctly scoped as a volume check, not a crisis, with the specific metric (−39% Microsoft Ads volume vs. pre) named. The one weakness: the P1 Supply action says "investigate why Exp 39917 disappeared" but does not name a specific query or person responsible for the investigation — it remains an open question rather than a task.

**Gap:** The Exp 39917 disappearance action lacks a scoped task: it is "investigate" without stating what check would resolve it (e.g., query `dim_experiences` to see if the TGID is still active, or check with ops whether it was delisted).
**Why:** `[MISSING_INSTRUCTION]` — Searched actions.md, SKILL.md, context.md, hypothesis.md — no instruction found for how to handle "experience disappeared from assortment" as a specific action type. The cause-to-action mapping in actions.md does not have an entry for assortment composition changes. Fix: add an entry to actions.md for "assortment change" with a concrete check template (query dim_experiences for TGID status; escalate to Ops if inactive).

---

## Top improvements for next run

1. **Run Geo/Non-Geo × S2C in the first parallel batch.** This is hypothesis.md's first-pass S2C cut and was skipped. Even if device concentrates and dominates, closing Geo explicitly prevents a senior analyst from asking the obvious question. The cost is one parallel query; the benefit is a complete story.

2. **Run the `inventory_availability` lead-time bucket query once an experience concentrates.** The availability proxy (`product_rankings_features`) confirmed near-term scarcity but could not show which booking-horizon bucket collapsed — 0–3 days, 3–7 days, or 7–14 days. That bucket is what the supply team needs to right-size allotments. The proxy is useful; it is not a replacement.

3. **Update the transcript tree map in real time.** The map was seeded with all branches as OPEN and never updated. A manager reading the transcript cannot tell what was confirmed vs. ruled out without reading every detail section. Updating one line per resolved branch takes seconds and makes the transcript an actual navigation aid.

---

## Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|---|---|---|---|
| Geo/Non-Geo × S2C not run | T3, T6 | [EXEC_ERROR] | hypothesis.md — add Geo/Non-Geo to S2C first-pass batch; reference context.md Geo vs Non-Geo query |
| inventory_availability lead-time bucket not run | T3 | [EXEC_ERROR] | hypothesis.md — mark lead-time bucket query as mandatory next step after experience concentration; product_rankings_features is supplementary |
| Transcript tree map never updated | T4 | [EXEC_ERROR] | SKILL.md — add explicit instruction: update tree map entry before writing query results in each new section |
| Easter seasonality cited as Confirmed without controlled comparison | T2, T5 | [EXEC_ERROR] | SKILL.md Step 2b — add: "calendar event cited as cause → must run date-bucket comparison or downgrade to Consistent with" |
| Exp 39917 action lacks a scoped check | T7 | [MISSING_INSTRUCTION] | actions.md — add "assortment change" entry with query template (dim_experiences TGID status check) |
