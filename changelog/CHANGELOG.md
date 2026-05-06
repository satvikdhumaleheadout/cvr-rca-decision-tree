# CVR-RCA Skill — Changelog

This file tracks every meaningful change pushed to this repository. Each entry corresponds to a GitHub push and is written for stakeholder consumption — what changed, why it matters, and what improved.

---

## [v1.0] — 2026-04-27 — Initial release

**Summary:** First versioned release of the CVR-RCA skill. Establishes the full investigation framework, reference files, SQL pipeline, rendering helpers, and evaluation rubric.

### What's included

**Core skill (`SKILL.md`)**
- Full 4-step investigation framework: baseline pipeline → investigation → report → self-evaluation
- Three mandatory pre-investigation questions: routing vs conversion (Q1), primary Shapley driver (Q2), sudden vs gradual onset (Q3)
- Worked example showing both a mix-dominant path and a funnel-conversion path
- Investigation transcript requirement (`transcript.md`) — every decision fork logged with hypothesis, data, decision, and ruled-out paths
- Custom query patterns for all available dimensions (`browsing_country`, `channel_name`, `lead_time_days`, `page_sub_type`, `previous_page_url`, cross-dimensional cuts)
- Mixpanel session recording integration for URL-level qualitative confirmation

**Reference files (`references/`)**
- `context.md` — full business domain vocabulary, table schemas (`mixpanel_user_page_funnel_progression`, `product_rankings_features`, `dim_combined_entities`, `dim_experiences`), column-level notes, counting rules, and analytical definitions
- `hypothesis.md` — 10 historical patterns drawn from 21 Headout MMPs, ranked by frequency across LP2S/S2C/C2O/mix scenarios; framed as priors to orient (not constrain) hypothesis generation
- `actions.md` — 10 root-cause-to-action mappings with DRI, priority, and historical references from real Headout RCAs
- `report_structure.md` — fixed three-section layout (Executive Summary → Actions → Supporting Analysis) with hard constraints, anti-pattern list, and length calibration table

**SQL pipeline (`references/`)**
- `q0_meta.sql` — CE name and top page URL
- `q1_base.sql` — base funnel by MB/HO × Channel × Period with CE-level ALL row
- `q2_dimensions.sql` — device, language, page_type cuts
- `q3_trend.sql` — daily CVR trend for pre and post periods
- `q4_experience.sql` — experience-level S2C and CVR breakdown
- `q5_price.sql` — price analysis (final vs original price, median, pre/post comparison)
- `q6_urls.sql` — top 20 page URLs by LP traffic volume with per-URL funnel rates

**Scripts (`scripts/`)**
- `run_analysis.sh` — orchestrates Q0–Q6, runs Q2–Q6 in parallel, produces `summary.json`
- `aggregate.py` — computes Shapley decomposition, mix vs conversion effects, C2O sub-decomposition, rolls up all stage JSON into structured `summary.json`
- `render.py` — HTML component helpers: metric cards, trend charts, experience tables
- `helpers.py` — shared utilities

**Report template (`templates/`)**
- `report.html` — base HTML template for rendered reports

**Evaluation rubric (`evals/`)**
- `evaluator.md` — 7-theme rubric (Narrative Coherence, Hypothesis Specificity, Investigation Effort, Branch Decision Quality, Evidence Strength, Output Appropriateness, DRI Actionability) scored 1–5 with evaluation file format
- `evals/runs/` — persistent record of past evaluations (accumulates across runs)

### Internal changelogs at time of initial release

The following changelog entries were already tracked inside individual reference files before the repo was created:

**SKILL.md**
| # | Date | Change |
|---|------|--------|
| c001 | 2026-04-24 | Initial version — investigation framework, 3 mandatory questions, Shapley, mix decomp, custom query patterns, render.py integration, Step 4 evaluator |
| c002 | 2026-04-24 | Added `report_structure.md` to "Before you begin" reads; updated file role descriptions; clarified `hypothesis.md` as historical priors not a constraint; replaced Step 3 guidance with pointer to `report_structure.md`; updated Backlogs for A2O query columns |

**`hypothesis.md`**
| # | Date | Change |
|---|------|--------|
| c001 | 2026-04-24 | Initial version — 10 patterns from 21 historical Headout MMPs |
| c002 | 2026-04-24 | Added "How to use this file" preamble; clarified patterns are priors not a constraint; Claude generates its own hypotheses from data |

**`actions.md`**
| # | Date | Change |
|---|------|--------|
| c001 | 2026-04-24 | Initial version — 10 root causes from 21 Headout MMPs and CVR Cause-to-Action Playbook |
| c002 | 2026-04-24 | RC1: competitive intel skill pointer added. RC2: inventory skill pointer added. RC8: pax setup skill pointer added. RC9: `order_attempted_events_v2` column detail added. RC10: content audit sub-skill pointer added |

**`report_structure.md`**
| # | Date | Change |
|---|------|--------|
| c001 | 2026-04-24 | Initial version — three-section report structure extracted from SKILL.md Step 3 and formalized |

---

## [v1.1] — 2026-04-27 — Process/domain separation

**Summary:** The skill was refactored to enforce a clean separation between *process* (what steps to follow and when to pivot) and *domain knowledge* (how to interpret data, what patterns to look for, how to write queries). `SKILL.md` is now a lean process orchestrator. `context.md` is the domain knowledge hub. A new `worked_example.md` file houses the two end-to-end investigation walkthroughs.

This makes the skill easier to maintain: process changes update `SKILL.md`, analytical guidance updates `context.md`, and neither bleeds into the other.

### Changes by file

**`SKILL.md`** (c003 → c007)
- **c003:** Added majority-contributor principle (focus on entities with meaningful CE traffic share, not long-tail noise) and rate × volume rule (impact = rate delta × user volume, not rate delta alone). Strengthened session recordings from optional to required once a locus is confirmed; skipping must be explicitly justified in the report.
- **c004:** Fixed session recordings trigger from conjunctive (URL *and* experience *and* segment) to disjunctive (any concentrated dimension cut is sufficient). Added "Data pull errors — log and continue" section: query failures are logged in the transcript and noted in the report as data gaps; the investigation does not halt.
- **c005:** Updated report visual standard; added P1/P2/P3 priority badges to action cards.
- **c006:** Removed references to Q2/Q4/Q5/Q6 as pre-built templates to run; fixed stale `summary.json` field references in investigation patterns. All custom querying is now framed as write-from-scratch using `context.md` schemas.
- **c007:** Stripped `SKILL.md` to pure process orchestration. All domain content moved out:
  - Query rules, dimension guidance, investigation patterns per funnel step → `context.md`
  - Both worked examples → `references/worked_example.md`
  - Q3 (onset type) expanded from two branches to three (sudden / gradual / seasonal); full interpretation guide lives in `context.md`

**`references/context.md`** (c002)
- Added **Query Principles** section: majority-contributor principle and rate × volume rule (moved from SKILL.md, formalized as domain rules)
- Added **Q3 Trend Interpretation** guide: how to read each 90-day trend shape (sharp break / gradual erosion / recovery in progress), how to use the LY overlay and `structural_delta_cvr` to calibrate investigation depth, and weekday composition check
- Added **Dimensions to Query and When**: `browsing_country`, `browsing_city`, `channel_name`, `lead_time_days`, `page_sub_type`, `previous_page_url`, cross-dimensional cuts, experience-level with availability proxy — each with the hypothesis context that makes it worth querying
- Added **Common Investigation Patterns**: per-funnel-step query angles for mix, LP2S, S2C, and C2O drivers (moved from SKILL.md, expanded)
- Added **Session Recordings** guidance: structured table format (Recording | Steps observed | Inference) rather than prose; inference column must state what each recording proves or rules out

**`references/worked_example.md`** (new file)
- Two complete end-to-end investigation walkthroughs extracted from `SKILL.md`:
  - **Example 1:** Mix-dominant story — MB traffic share shift explains the CVR drop; no funnel step broke; report covers mix table and URL traffic comparison only
  - **Example 2:** Conversion-dominant, concentrated locus — S2C drop, sharp Apr 8 onset, French × iOS Mweb cross-cut, session recordings confirming empty date picker; shows how the investigation narrows from CE-wide to one experience on one locale

---

## [v1.2] — 2026-04-27 — Default analysis window changed to 30 days

**Summary:** The skill previously required explicit date arguments every time it was invoked. Dates are now optional — when omitted, the script automatically uses the last 30 days as the post period and the 30 days before that as the pre period. This removes the most common friction point when starting a quick investigation.

### Changes by file

**`SKILL.md`** (c009)
- Invocation syntax updated from required `<pre_start> <pre_end> <post_start> <post_end>` to optional `[<pre_start> <pre_end> <post_start> <post_end>]`
- Added one-line note explaining the default: last 30 days = post, prior 30 days = pre

**`scripts/run_analysis.sh`** (c002)
- Date arguments are now optional. When not supplied, the script computes: `POST_END` = yesterday, `POST_START` = 30 days ago, `PRE_END` = 31 days ago, `PRE_START` = 61 days ago
- Added cross-platform `_date_offset()` helper that works on both BSD `date` (macOS) and GNU `date` (Linux)
- Script now prints the resolved date windows at the end of every run so it is always visible which periods were used
- Cleaned up header comments: removed stale Q2/Q4/Q5/Q6 "demoted" note that no longer applies

---

## [v1.3] — 2026-04-28 — Investigation tree model + unified run folder

**Summary:** Two significant upgrades in this release. First, the investigation model was rewritten from a sequential three-question gate into a parallel investigation tree (L0 → L1 → leaf), making the analytical reasoning faster and more structured. Second, all run outputs (report, transcript, evaluation, findings, raw data) are now consolidated into a single persistent folder per run, with date-range naming and auto-increment to prevent overwrites.

### Changes by file

**`SKILL.md`** (c012 → c016)
- **c012 — Investigation tree model:** Replaces the sequential Q1/Q2/Q3 gate model with a tree structure. L0 reads all three orientation signals simultaneously (`mix_dominance`, `shapley`, `trend_context`). L1 opens a parallel hypothesis batch based on L0 signals. Each result either confirms (open L2), rules out (close branch), or concentrates (anchor all downstream queries). Investigation terminates at a leaf: a specific mechanism × segment/experience/URL × date. Transcript format mirrors the tree with `## L0`, `## L1`, `## L2`, and `## Root cause confirmed` sections.
- **c013 — Tree map in transcript:** Transcript now has two layers — a tree map block at the top showing the full branch structure (`CONFIRMED / RULED OUT / OPEN / LEAF` per branch) and detail sections below with query results. Tree map is written after L0 with all L1 branches marked `OPEN` and updated as results arrive. Anyone reading the transcript sees the investigation shape immediately without scrolling.
- **c014 — Date range in output directory name:** Output folder renamed from `/tmp/cvr_rca_<ce_id>/` to include the date range (e.g. `ce167_2026-03-01_2026-04-29/`). Running the same CE twice with different windows no longer silently overwrites results.
- **c015 — Consolidated run folder:** All outputs for a run now live in one persistent folder: `~/Documents/RCA skill/Test Runs/ce<ce_id>_<pre_start>_<post_end>/`. Previously, outputs were scattered across `/tmp/`, `~/Documents/RCA skill/transcripts/`, and `~/Documents/RCA skill/evals/`. Report, transcript, evaluation, findings, and raw pipeline data are all co-located.
- **c016 — Auto-increment on folder collision:** If the named run folder already exists (same CE + same dates run twice), the script auto-increments the suffix: `_run2/`, `_run3/`, etc. The chosen folder name is printed at the start of the run. SKILL.md now uses `<run_dir>` shorthand throughout so the naming logic is explained once in Step 1 and not repeated.

**`references/context.md`**
- Added **"Investigation tree — L0 to L1 branch map"** section: a lookup table mapping each combination of L0 signals (mix dominant / LP2S primary / S2C primary / C2O primary / gradual / sudden) to the default set of L1 branches that should open. Removes the need to derive the branch set from first principles on every run.

**`references/worked_example.md`**
- Both examples (mix-dominant and conversion-dominant) rewritten with tree-format transcripts: parallel query batches made explicit, session recordings anchored to L2 leaf, tree map blocks included showing branch resolution.

**`scripts/run_analysis.sh`**
- Output directory updated to `~/Documents/RCA skill/Test Runs/ce<ce_id>_<pre_start>_<post_end>/`
- Auto-increment logic added for folder collisions
- Prints resolved run folder name at start of execution

**`scripts/aggregate.py`**
- Docstring example updated to reflect new output directory pattern

**Removed**
- `assets/headout-logo.svg` — unused since `render.py` was removed in a prior release
- `templates/report copy.html` — stale duplicate, superseded by `templates/report.html`

---

## [v1.4] — 2026-04-29 — Mix cascade, self-extending branches, hypothesis.md restructure

**Summary:** Three interlocking upgrades that make the investigation more rigorous and faster to execute. First, the mix cascade is now a mandatory L1 step that runs before any funnel hypothesis — it fixes the primary segment (MB/HO → Paid/Organic → Channel) so all downstream funnel analysis describes a homogeneous cohort. Second, hypothesis generation is now explicitly self-extending: branches grow level-by-level from what the data shows, not from a pre-written list, and a new "Surprises" result type forces investigation of unexpected findings. Third, `hypothesis.md` is restructured as the central branch reference for the entire investigation — it now owns both the L0 routing map and the first-pass branch sets (moved from `context.md`), keeping `context.md` focused on business vocabulary, schemas, and query rules only.

### Changes by file

**`SKILL.md`** (c017 → c020)
- **c017 — Mix cascade as mandatory L1:** Before forming any funnel hypothesis, run a three-level mix cascade (Level 1: MB vs HO from `summary.json`; Level 2: Paid vs Organic custom BQ query; Level 3: Channel breakdown within Paid). Fixed segment declared once in the transcript; all L2+ queries carry that segment's filters. L1 and L2+ step names updated accordingly.
- **c018 — Self-extending hypothesis loop:** L2+ branches grow from what the data shows, not from a fixed upfront list. Four result types formalised: Confirms, Rules out, Concentrates, and Surprises. "Surprises" is new — an unexpected result generates a new branch even if it wasn't in the default set. Investigation ends at the leaf, not at list exhaustion.
- **c019 — Remove stale artifact:** Removed "write 2–4 specific, falsifiable hypotheses" from L2+ — a leftover from the old Q1/Q2/Q3 model that contradicted the tree structure.
- **c020 — File role descriptions updated:** `context.md` role narrowed to business vocabulary, schemas, and query rules. `hypothesis.md` described as the two-level central branch reference (L0 routing + first-pass branch sets + historical patterns). L2+ pointer updated from `context.md` → `hypothesis.md`.

**`references/context.md`** (c004 → c009)
- **c004/c005 — Inventory table schemas:** Added `analytics_reporting.inventory_availability` and `analytics_intermediate.inventory_changes` with full column-level notes, join path (the two-hop `dim_experiences → dim_tours → inventory_availability` bridge), and lead-time bucket query. Bucket boundaries carry inline guidance to adapt to each CE's booking horizon. Results interpretation covers both window-specific and uniform-decline patterns.
- **c006 — Mix Cascade section:** Full three-level cascade added with BQ query templates for Level 2 (Paid/Organic) and Level 3 (Channel breakdown within Paid), decision rule for when to fix a level (>15% post share + dominant checkout impact), and fixed segment declaration template with filter strings.
- **c007 — Investigation patterns expanded:** LP2S gains three-tier triage (dimension cuts → pricing if no concentration → sessions as fallback). S2C gains language × S2C and device × S2C as first-pass cuts before experience-level; inventory lead-time bucket query integrated into S2C path. C2O expanded with four C2A hypotheses (pax availability, price friction, UX change, sessions) and three A2O hypotheses (gateway failure, fraud tightening, live inventory sync failure) with named DRIs.
- **c008 — Common Investigation Patterns header rewritten:** "Not rails" disclaimer replaced with explicit loop logic — patterns are the default starting set, results generate the next hypothesis, investigation ends at the leaf not at list exhaustion. Three reasons a list runs out before a leaf is reached added.
- **c009 — Moved investigation logic to hypothesis.md:** "Investigation tree — L0 to L1 branch map" and "Common Investigation Patterns" sections removed from `context.md` and moved to `hypothesis.md`.

**`references/hypothesis.md`** (c004)
- **c004 — Restructured as two-level branch reference:** Level 1 (L0 routing map + first-pass branch sets by funnel step) added at the top, moved from `context.md`. Level 2 (historical patterns 1–10) retained and explicitly labelled as "mechanism detail by scenario" — used once a first-pass branch confirms a direction. "How to use this file" updated to reflect full role as the central branch reference for all investigation levels.

**`references/report_structure.md`** (c006 → c010)
- **c006/c007 — Positive CVR framing:** New green-border callout variant for CVR-improvement investigations: heading "CVR Improved — What's Driving It & What's Holding It Back" with three questions (What drove the improvement? What's holding it back? When did the headwind emerge?).
- **c008 — 90-day chart to Section 1:** Chart moves from Section 3 (conditional) to Section 1 (always), appearing after metric cards and before the root cause callout. Post-window shade is green for improvements, red for declines.
- **c009 — Fixed Segment banner:** New HTML component after mix cascade output, before Shapley block. Declares `MB/HO · Paid/Organic · Channel` scope for all downstream funnel analysis.
- **c010 — Raw user counts mandatory:** All tables showing rates or shares must include Pre Users and Post Users columns. "Table shows rates/shares with no user counts" added to anti-patterns list.

---

## [v1.5] — 2026-05-04 — Findings synthesis gate + Evaluator failure mode classification

**Summary:** Two interconnected upgrades. (1) `SKILL.md` gains Step 2b: before writing any HTML, Claude writes `findings.md` with a mandatory Evidence inventory table where every claim must name its data source — closing the main hallucination vector where approximate values replaced confirmed BQ query outputs. (2) `evaluator.md` is redesigned to diagnose *why* each gap occurred, not just *what* was missing: every gap now gets a failure mode tag backed by a grounded citation, and a new Section 4 table maps all gaps directly to actionable skill file edits.

### Changes by file

**`SKILL.md`** — c010 / c011

- **Step 2b — Structured findings synthesis (c010):** Claude now writes `findings.md` before writing any HTML, with four required sections: Root cause (one sentence), Mechanism (causal chain), Timing (classification + evidence), Evidence inventory (Claim / Supporting data / Source / Confidence). Open items force explicit resolution — query, arithmetic, or explicit acceptance — before Step 3 begins. Step 3 writes from `findings.md` as source of truth, not from raw query outputs.
- **Evidence inventory Source column (c011):** Every claim must name its data origin: a specific `summary.json` field, a named BQ query result, or a specific report table row. A number with no named source must be derived explicitly or removed — it must not enter the report.
- **Output paths:** All paths use `<run_dir>` shorthand (`transcript.md`, `findings.md`, `report.html`, `evaluation.md`) consistent with the auto-increment run folder naming from c016.

**`evals/evaluator.md`** — e001

- **What to review** — Added all four skill reference files (SKILL.md, hypothesis.md, context.md, report_structure.md) as the first pre-read step, before the report and transcript. Required so the evaluator can verify whether an instruction existed before classifying a gap.
- **Scoring** — Added two new required fields per theme: `Gap` (if score ≤ 4) describing specifically what was missing or wrong; `Why` — a failure mode tag with a grounding citation.
- **Failure Mode Classification** (new section) — Defines four tags with meanings and grounding requirements: `[MISSING_INSTRUCTION]`, `[AMBIGUOUS_INSTRUCTION]`, `[EXEC_ERROR]`, `[DATA_LIMIT]`. Tag assignment without a citation is explicitly prohibited.
- **Output format** — Section 2 updated with inline `Gap` / `Why` blocks. Section 4 added: Failure Mode Summary table mapping every gap to a specific file + fix description.
- **Self-honesty check** — Four grounding checks added (one per tag type): did you actually look in the skill files, quote the instruction, confirm an attempt in the transcript, verify data unavailability?

### Test runs

Two new runs added (`v1.5`):
- **ce189_2026-03-05_2026-05-03** (Vatican Museums) — 25/35. Dual-driver: S2C supply capacity pressure (spring demand exceeded fixed Vatican slot supply, confirmed via availability proxy and lead-time bucket query) + C2O iOS/Android device split (price shock + live inventory). First run evaluated against the evaluator v1.5 rubric.
- **ce6495_2026-03-05_2026-05-03** (Kualoa Ranch) — 24/35. S2C demand quality decline: spring break wind-down replaced high-intent vacationers with low-intent off-peak tourists. First run to conclusively establish seasonal demand quality as a mechanism (no supply, pricing, or UX change confirmed).

---

## [v1.6] — 2026-05-04 — Query fix, Geo/Non-Geo dimension, routing exit investigation, events reference

**Summary:** Four interconnected additions that sharpen the investigation's analytical depth. (1) A critical query correctness fix: cascade and L2+ queries now use `COUNT(DISTINCT CASE WHEN ...)` instead of `COUNTIF`, preventing rates > 1.0 on multi-experience sessions. (2) A new Geo vs Non-Geo dimension cut lets investigators distinguish domestic vs international traffic dynamics in high-local-demand markets. (3) The mix routing exit investigation is fully specified for all three cascade levels with a 3-tier path (time the shift → sub-segment → URL impact) and declaration templates. (4) A new `events.md` reference maps all GTM/Mixpanel events across LP, S2C, and C2O with properties, purpose, and exclusion notes.

### Changes by file

**`references/context.md`** — c012 / c013

- **c012 — Query fix:** `COUNTIF` replaced with `COUNT(DISTINCT CASE WHEN has_X THEN user_id END)` in cascade Level 2/3 queries and the canonical L2+ template. The funnel table fans out rows when a user views multiple experiences in one session, causing `COUNTIF` numerators to exceed `COUNT(DISTINCT user_id)` denominators and produce rates > 1.0. Also added missing `PERFORMANCE_MAX` exclusion filter to Level 2 and Level 3 cascade queries.
- **c012 — mix_effect / conversion_effect arithmetic guide:** Step-by-step formula (share_pre/post → Δshare/Δrate → mix_effect = Δshare × pre_rate, conversion_effect = pre_share × Δrate) plus a worked Level 3 example showing the full arithmetic and the fix declaration that follows.
- **c012 — Canonical L2+ query template:** Annotated reference query showing the fixed segment lines (`is_microbrand_page` and `channel_name` filters) that carry through all L2+ queries.
- **c013 — Geo vs Non-Geo dimension:** Pre-step to look up CE home country via `dim_experiences.country` (not `dim_combined_entities.country`, which can be NULL for sheet-only CEs). Country-level query with top-5 CTE + home country always included regardless of rank. Each row tagged `geo_segment` (Geo / Non-Geo / Unknown). Interpretation guide: Geo drop → local supply/pricing/campaign + cross-cut with local language; Non-Geo drop → international traffic quality/UX gap + cross-cut with experience_id.

**`references/hypothesis.md`**

- **Mix routing exit — fully specified (3 levels × 3 tiers):** Each of the three cascade exit levels now has a complete 3-tier investigation: Tier 1 time the shift (weekly volume query, anchor week), Tier 2 sub-segment cut (language/market within HO; channel within Paid; channel gain/loss within Paid), Tier 3 URL impact (page_url volumes for losing segment). Each level has a declaration template naming the shift week, sub-segment, affected URLs, and DRI.
- **LP2S first-pass branches:** Added `browsing_country` (Geo/Non-Geo) as a Tier 1 parallel cut. Geo concentration → cross-cut with local language. Non-Geo concentration → cross-cut with `experience_id`. Points to dedicated `context.md → "Geo vs Non-Geo"` query.
- **S2C first-pass branches:** Added `browsing_country` (Geo/Non-Geo) as a Tier 1 parallel cut. Geo S2C drop → local supply scarcity or pricing shock at variant selection. Non-Geo drop → language/UX friction or international inventory gaps.
- **C2O (C2A) — optional Geo/Non-Geo:** Added as an optional cut when C2A drop is broad with no device/experience concentration — spikes in specific countries can indicate currency display friction or payment method unavailability.

**`references/report_structure.md`**

- **Mix cascade analysis block:** New `analysis-block` spec for Section 3 — three sub-tables (one per cascade level), each showing Segment · Pre/Post users · Pre/Post share · Pre/Post CVR · Mix effect · Conv. effect · Verdict. Verdict line states overall outcome (conversion path or routing exit). `highlight-row` on the fixed segment row. If cascade exited at a mix level, render only levels up to and including the exit.

**`references/events.md`** (new file)

Running reference mapping GTM/Mixpanel events to funnel steps. LP: 15 structured events (Microsite Page Viewed through More Details Swipesheet Closed) + 4 unstructured. S2C: 14 structured (Select Page Viewed through gtm.scrollDepth) + 3 unstructured. C2O: 15 structured (Checkout Page Viewed through Order Completed) + 8 unstructured. Each event lists key properties to pull and analytical purpose. Includes session join key notes (`h-sid` on LP vs `HSID` on select/checkout), deduplication guidance for GTM multi-trigger events, and excluded noise event lists per funnel step.

---

## [v1.7] — 2026-05-06 — Inventory analysis overhaul (TID-level queries, Path A/B, supply gate)

**Summary:** The S2C inventory analysis methodology was comprehensively rewritten. The old `count_days_available_30d` proxy from `product_rankings_features` is removed entirely; all inventory investigation now uses direct TID-level queries against `inventory_availability`. Two query bugs were fixed first (CE-wide scope; sold-out overcounting). The rewrite introduces a structured 3-step path: locus identification via `lost_checkouts_delta`, a TID snapshot table (Step 2), and a daily time-series (Step 3). A Path A / Path B determination gate handles the 30-day rolling window limitation. A supply gate prevents unnecessary deep-dives when inventory is not depleted.

### Changes by file

**`references/context.md`** — c014 / c015

- **c014 — Inventory query bug fixes:** Fixed two bugs in the existing lead-time bucket query. (1) CE-wide scope bug: the query fetched all `tour_id`s for the CE instead of filtering to the confirmed TGID (`experience_id = '<tgid>'`). (2) Sold-out overcounting: `COUNTIF(total_remaining = 0)` operated at TID × date grain — a date where one TID was sold out but others held capacity was incorrectly counted as zero-inventory. Fixed by adding a `tgid_daily_inventory` CTE that sums remaining across all TIDs per date before bucketing; a date is only zero-inventory when the sum across all TIDs is zero.
- **c015 — Inventory analysis complete rewrite:** Removed `count_days_available_30d` as the inventory signal across the entire inventory section. Restructured as a **3-step path**:
  - **Step 1 — Locus identification:** Compute `lost_checkouts_delta = users_select_post × (s2c_rate_pre − s2c_rate_post)` per TGID from Q4 results. Three cases: Case A (top TGID ≥60% of total delta → single locus), Case B (2–3 TGIDs each ≥10% → multiple loci, run Step 2 for each), Case C (no TGID ≥10% → uniform drop, broad-drop path: Step 2 for top 3 TGIDs by `users_select`).
  - **Step 2 — TID snapshot:** Run against latest `extracted_date`. One row per TID. Ticket counts (sum of `total_remaining`) in four buckets: 0–2d, 3–7d, 8–13d, 14–30d. `is_fully_unlimited_capacity` flag identifies TIDs where `total_remaining = 1` is a system constant — these must be excluded from scarcity analysis.
  - **Step 3 — Daily time-series:** `extracted_date` trend per bucket. Path B: pre+post overlaid. Path A: post only. Scope to single TID if one TID is the locus, or whole TGID if all TIDs depleted equally.
  - **Path A vs Path B:** Determined by `pre_start >= CURRENT_DATE - 30`. Path B = full pre/post comparison available. Path A = pre-period outside 30-day window; post-only snapshot with explicit data-limitation note.
  - **Supply gate:** If Step 2 shows no depletion across limited-capacity TIDs, do not run Step 3 — pivot to pricing or UX investigation instead.
  - **Broad-drop path (Case C):** Run Step 2 for top 3 TGIDs by `users_select`. Same bucket depleted across all three → CE-wide supply constraint. All full → supply is not the mechanism.

**`references/hypothesis.md`** — c016

- All references to `count_days_available_30d` as the availability signal replaced with `inventory_availability` TID summary table (Step 2 results).
- **Gradual S2C decline (Pattern 4):** `days_to_first_available_date` added as a fast directional check before running inventory queries — increasing trend confirms supply scarcity direction.
- **CE-wide S2C drop (no concentration):** Updated to point to the broad-drop inventory path (top 3 TGIDs by volume, Step 2 for each).
- **Vendor throttling pattern:** Signal updated from `count_days_available_30d` to `days_to_first_available_date` increasing + 0–2d bucket near zero in TID snapshot.
- **S2C Tier 1 (experience concentrates):** Updated to reference `lost_checkouts_delta` locus computation → Case A/B/C → 3-step inventory path.

**`references/actions.md`** — c017

- RC2 (Inventory/availability constraint): removed `count_days_available_30d` reference; replaced with `inventory_availability` TID summary table (near-zero ticket counts in one or more lead-time buckets) as primary signal.

**`references/report_structure.md`** — c018

- Inventory section format renamed (from "Inventory lead-time bucket table format").
- "What belongs in Section 3" table rows updated: "Availability proxy table" and "Inventory lead-time bucket table" replaced with "Inventory TID summary table" (Step 2) and "Inventory daily time-series charts" (Step 3).
- **Supply gate outcome:** if Step 2 finds no depleted limited-capacity TIDs, write a ruled-out callout and skip the table/charts entirely.
- **Path B spec:** one row per TID, Pre/Post column pairs per bucket, `Capacity type` column, `highlight-row` on TID rows where affected bucket pair shows material drop; unlimited-capacity TIDs excluded with subtext note.
- **Path A spec:** post-only columns, amber note stating pre-period unavailability.
- **Daily time-series spec:** four charts (one per bucket); Path B overlays pre/post; Path A post only.
- HTML pattern replaced: old format (rows per bucket, aggregate columns) replaced with separate Path A and Path B patterns.

**`references/q1_base.sql`** — c019

- Removed `MAX(CASE WHEN page_type IN (...) THEN 1 ELSE 0 END) AS visited_lp` from SELECT (condition already in WHERE clause). Fixed `GROUP BY 1, 2, 3, 9` → `GROUP BY 1, 2, 3, 8` to reflect the column count change.

**`references/worked_example.md`** — c020

- Removed `count_days_available_30d` from the S2C locus identification section (Example 2). Added TID summary table query result showing `tickets_8_13d` and `tickets_14_30d` → 0 for all TIDs of TGID 8821, confirming the 8+ day window as the affected bucket.

### Test runs

Three new runs added (`v1.7`):
- **ce6495_2026-03-05_2026-05-03_run3** (Kualoa Ranch) — 31/35. Third run on the same CE/window; methodological improvements over run2: Geo/Non-Geo first-pass S2C cut correctly executed, TGID-scoped TID snapshot with corrected COUNTIF, Path A correctly applied. Confirms spring break demand quality decline with supply definitively ruled out (TGID 37530 fully stocked across all buckets).
- **ce234_2026-04-21_2026-05-04** (Empire State Building) — 27/35. Routing story: Google Ads traffic collapsed 58%, shifting paid/organic mix from 80/20 to 51/49. Product funnel intact (Google Ads CVR stable at 5.8%). Gaps: organic LP2S drop (26%→10%) not investigated, URL traffic comparison omitted, Level 2 cascade used all-traffic summary.json data instead of MB-filtered query.
- **ce144_2026-04-08_2026-05-05** (Alcatraz Tours) — 32/35. CVR improvement case: +3.78pp above prior year driven by April 15 launch of exp 36426 ($47.95 ferry+audio) displacing $87.30 self-guided tour. S2C +7.0pp, C2A +9.9pp. International markets benefited most. Only residual gap: A2O −2.24pp from increased international visitor share.

---

*Each future entry in this changelog corresponds to one GitHub push. Format: `[vX.Y] — YYYY-MM-DD — Short title` followed by a summary of what changed and why.*
