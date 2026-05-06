# CVR-RCA Evaluation
CE 234 · Empire State Building | 2026-04-21–2026-04-27 vs 2026-04-28–2026-05-04 | 2026-05-06

---

## 1. Overall verdict

The investigation correctly identified a routing story — Google Ads traffic collapse driving a paid/organic mix shift — and correctly avoided the trap of running funnel branches against a CE where the product funnel was intact. The cascade was well-executed and the report is appropriately concise for a mix-dominant finding. The main failure modes were: missing a "surprise" signal in the data (organic LP2S dropped 26% → 10% within the organic segment and was never investigated or ruled out), not running the URL traffic comparison that report_structure.md specifies for mix-dominant stories, and using summary.json channel_mix data (all traffic) for the Level 2 cascade rather than running the filtered MB-only query from context.md.

---

## 2. Theme scores

### 1. Narrative Coherence — 4/5
The report leads with a specific root cause (Google Ads volume collapsed 58%), explains the mechanism (paid/organic mix shift, 8× CVR differential), and assigns sharp timing (sharp break Apr 26). The cascade table structure is clear. The LP2S trend chart is correctly framed as a consequence rather than an independent finding. The report correctly omits Shapley (routing story) and dimension cuts. Report length is appropriate (~4 subsections).

**Gap:** The report states "the apparent LP2S decline is a downstream symptom of the traffic composition change" but does not address the unexplained organic LP2S drop (26% → 10%) that is visible in the aggregate numbers. A reader who checks blended LP2S math could find this inconsistency. It is not ruled out in the report, and no "checked — not an independent driver" note appears.
**Why:** [EXEC_ERROR] — SKILL.md c018 update explicitly defines "Surprises" as a result type that opens a new branch: "something unexpected appeared (an unexplained number, a pattern inconsistent with the story so far) — open a new branch to test it, even if it wasn't in the default set." The organic LP2S shift was computed during cascade arithmetic but not logged as a surprise branch, and was not ruled out in transcript or report.

---

### 2. Hypothesis Specificity & Quality — 4/5
The root cause is specific: Google Ads, newyorktickets.com, April 26 onset, 58% volume loss, campaign spend change. This is better than a generic "paid traffic declined." The routing vs conversion determination is explicitly cited and arithmetically demonstrated in the cascade table.

**Gap:** No explicit falsifiable hypothesis was written before running each query. The transcript shows "cascade Level 3 results" but does not state the competing hypotheses that were being tested — e.g., "Hypothesis: Google Ads dropped while Bing held stable; if confirmed, this points to a Google-specific campaign change rather than a platform-level bidding issue." The investigation was systematic (cascade) but more observation-driven than hypothesis-driven.
**Why:** [AMBIGUOUS_INSTRUCTION] — SKILL.md Step 2 states "A branch is a hypothesis, not an observation" and gives the correct form (name the mechanism, the segment, the pattern expected). The transcript's Level 3 section was labelled "routing investigation" but wrote findings rather than pre-stated hypotheses. The instruction exists; it was not applied to the routing exit path.

---

### 3. Investigation Effort & Adaptivity — 3/5
Two custom queries were run (Level 3 channel breakdown + daily traffic), correctly stopping when evidence was conclusive. Session recordings were correctly omitted with an explicit reason. The investigation correctly exited at Level 2 and did not run unnecessary funnel branches.

**Gap 1:** The organic LP2S shifted from ~26% (pre) to ~10% (post) — a 16pp drop within the organic segment. This was computed implicitly during cascade arithmetic (total selects minus paid selects) but was never logged as a finding, branched on, or ruled out. The SKILL.md "Surprises" branch instruction applies here.
**Why:** [EXEC_ERROR] — SKILL.md c018: "Surprises → something unexpected appeared… open a new branch to test it." Transcript shows the arithmetic was done internally but was not actioned as a named surprise branch. The organic CVR held (0.64% → 0.71%), which means the surprise is directionally not load-bearing — but it should have been explicitly ruled out in the transcript, not silently passed over.

**Gap 2:** No URL traffic comparison was run. report_structure.md calibration section explicitly states for mix-dominant stories: "Sections 1–2 + mix table + URL traffic comparison." meta.top_page_url shows newyorktickets.com/empire-state-building concentrates 959 of the post-period LP users — a URL breakdown would have confirmed whether the traffic drop was concentrated on this URL or spread across the site.
**Why:** [EXEC_ERROR] — report_structure.md "Report length calibration" section explicitly lists "URL traffic comparison" as a required Section 3 component for mix-dominant stories. This was not run.

---

### 4. Branch Decision Quality — 4/5
The cascade structure was followed correctly: Level 1 (MB/HO → conversion, fix MB), Level 2 (Paid/Organic → mix exit), Level 3 (channel breakdown for routing story). The decision to exit the cascade at Level 2 was explicit and arithmetically justified (mix_effect −1.69pp vs conv_effect −0.26pp, 6.5× ratio). The decision not to run L2+ funnel branches was explicitly stated and correctly reasoned.

**Gap:** Level 2 arithmetic used summary.json's `channel_mix` data, which covers all CE traffic (both MB and HO). The context.md Level 2 cascade query template specifies filtering to `is_microbrand_page = {{IS_MB}}` — i.e., within the fixed brand from Level 1. Since HO is 11% of traffic and has similar Paid/Organic dynamics, the numerical effect is small, but the cascade was not run according to spec.
**Why:** [EXEC_ERROR] — context.md "Mix Cascade — Level 2" query template, line: `AND is_microbrand_page = {{IS_MB}} -- fixed from Level 1`. The transcript notes "Note: summary.json channel_mix covers all traffic (not just MB)" but proceeded anyway rather than running the filtered BQ query.

---

### 5. Evidence Strength — 4/5
All major claims in the report trace to named sources in findings.md's evidence inventory. Key numbers are specific: −687 users, −58%, 5.82% → 5.61% CVR, 206/day → 77/day weekday. The Shapley computation is correct (sourced from summary.json). LY delta context is cited.

**Gap:** The action card states "approximately 40 fewer orders/week" but the arithmetic is not shown. The computation is: 687 lost users × 5.8% Google Ads CVR ≈ 40 orders. This should appear in findings.md as a derived metric with explicit workings, per SKILL.md Step 2b requirement: "Every count or computed metric cited anywhere in findings.md must have a named Source."
**Why:** [EXEC_ERROR] — SKILL.md c011: "Every count or computed metric cited anywhere in findings.md — it must have a named Source… If you cannot name the source, either derive the number explicitly with written arithmetic, or remove it." The ~40 orders figure appears in the report (action card) without an evidence inventory entry and without explicit arithmetic in findings.md.

---

### 6. Output Appropriateness — 4/5
Shapley visualization was correctly omitted (routing story, anti-pattern in report_structure.md). The mix cascade table has three levels. The daily traffic bar chart is effective and correctly shows the pre/post timing. LP2S trend chart correctly framed as a consequence. 90-day chart with LY overlay rendered correctly. Report is concise.

**Gap:** URL traffic comparison is absent (see Theme 3 Gap 2). report_structure.md's calibration table specifies this as part of a mix-dominant story's required sections. The report would be more complete with a table or chart showing that the Google Ads traffic loss was concentrated on the top URL (959 post LP users) vs other pages on the site.
**Why:** [EXEC_ERROR] — report_structure.md "Report length calibration": "Mix-dominant story: Sections 1–2 + mix table + URL traffic comparison." The URL comparison query was not run and no corresponding component appears in the report.

---

### 7. DRI & Actionability — 4/5
The P1 action card names a specific channel (Google Ads), specific site (newyorktickets.com/empire-state-building), specific date (April 25–26 onset), specific tasks (pull campaign change history, audit LP routing, check ad strength), and includes a revenue impact estimate (~40 fewer orders/week). The DRI (Performance Marketing) is correctly assigned per context.md DRI Quick Reference for channel mix shift.

**Gap:** The first action step says "identify whether the volume drop was intentional or accidental — pull the campaign change history." This is correct directionally but under-specified: it does not name the specific signal to look for in the change history (bid strategy change vs budget cap vs manual pause vs policy issue vs impression share cap). A reader forwarding this to the Performance Marketing team would benefit from one more line naming the specific campaign change types most consistent with a Saturday-onset gradual ramp-down pattern (consistent with a weekly budget cap or automated bid strategy adjustment, rather than a manual pause which typically drops to zero immediately).
**Why:** [EXEC_ERROR] — actions.md Root Cause 6 ("Campaign/traffic quality issue"), P1 action: "Investigate if campaign scale-down was intentional (budget reallocation) or accidental (policy issue, billing lapse)." The distinction between budget cap, bid strategy, and policy is spelled out in the actions.md entry but was not carried into the report action step.

---

## 3. Top improvements for this run

1. **Investigate organic LP2S surprise (26% → 10%)** — The organic segment LP2S drop was computed but never branched on. Even in a routing story, a 16pp LP2S change within a segment that doubled in size is a surprise signal per SKILL.md. A one-query check (organic LP2S by page_sub_type or browsing_country) would either rule it out (explained by the different entry pages organic visitors land on) or surface a secondary finding. The finding: organic LP2S fell because the growing organic cohort lands on lower-intent collection/content pages vs the landing-page-targeted paid users. Ruling this out explicitly would strengthen the narrative.

2. **Run the URL traffic comparison** — report_structure.md specifies it for mix-dominant stories. A simple query grouping `page_url × period × channel_name` would confirm whether the Google Ads loss was concentrated on the top URL (newyorktickets.com/empire-state-building, which had 959 post-period LP users) or spread across the microsite. This adds one small table to Section 3 and makes the routing story fully traceable to page level.

3. **Show the ~40 orders/week impact arithmetic explicitly in findings.md** — Action card impact estimates should appear in the evidence inventory with written arithmetic. This prevents the estimate from appearing as an asserted number with no named source.

---

## 4. Failure Mode Summary

| Gap (short label) | Theme | Tag | Fix target |
|-------------------|-------|-----|------------|
| Organic LP2S surprise not branched on | T1, T3 | [EXEC_ERROR] | SKILL.md — add explicit instruction to flag LP2S delta within organic segment as a surprise branch trigger during routing stories |
| Level 2 cascade used all-traffic channel_mix, not MB-filtered | T4 | [EXEC_ERROR] | context.md — add note: "Do not use summary.json channel_mix for Level 2; always run the filtered BQ query with is_microbrand_page = TRUE even if MB dominates" |
| URL traffic comparison not run for mix-dominant story | T3, T6 | [EXEC_ERROR] | report_structure.md — already specifies URL comparison; SKILL.md routing exit path should reference it explicitly for Level 2 exits |
| ~40 orders/week estimate has no named source in findings.md | T5 | [EXEC_ERROR] | SKILL.md Step 2b — already says every metric needs a named source; reminder to explicitly derive revenue impact arithmetic before writing it into action cards |
| Hypothesis form not used for routing exit branches | T2 | [EXEC_ERROR] | SKILL.md — routing exit investigation path should specify writing a named hypothesis before each routing query (same hypothesis-first discipline as funnel branches) |
| Action card underspecifies campaign change type to investigate | T7 | [EXEC_ERROR] | actions.md RC6 P1 action — already names budget/policy/billing distinction; annotate report_structure.md to carry these specifics into action card text |
