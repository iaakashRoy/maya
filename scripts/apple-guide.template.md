# Apple Launch Continuity: how tanjnx works, what it proves, and what must improve

**CEO / CTO / operator field guide · {{AUDIT_DATE}} · P-001 · apple-launch-continuity**

> This is an educational case using Apple as a public-company example, not an Apple engagement. The disruption, private operating data, named project owner, supplier network and financial opportunity are modeled. tanjnx is an interactive analytical prototype, not a connected production supply-chain operating system. No purchase order, allocation, carrier booking or production instruction was executed.

## 1. The executive conclusion

tanjnx has a coherent operating concept: put a decision inside a project boundary, inspect the supporting data and relationships, use specialist analytical tools, challenge assumptions, and preserve a reviewable result. The most defensible demonstration today is the chain from a generated data sample to an actual statistical calculation, and from explicit operational assumptions to a reproducible simulation and a local decision review.

The Apple example asks how to protect an eight-week regional device launch when qualified materials, assembly capacity and transport are constrained at the same time. The current default experiment improves downside service from **{{DEFAULT_BASE_P05}}% to {{DEFAULT_P05}}%**, but still fails its **95%** service floor. A tool that exposes this failure is more useful than a reassuring dashboard that implies every crisis has been solved.

The default response computes **{{DEFAULT_NET}} of mean net loss avoided**, at **{{DEFAULT_COST}} of intervention premiums**. These are conditional model outputs, not achieved Apple savings. They do not validate the much larger **$612M** seeded portfolio narrative. The two numbers have different scopes and different evidence.

A second experiment turns on freight expediting within a 1,800-device weekly ceiling. Downside service rises to **{{CAP_P05}}%**, but peak intervention cost reaches **{{CAP_COST}}**, above the $700,000 budget. It must be returned for revision, not presented as an approved response.

A third experiment asks what would happen if 30,000 eligible devices were already in opening inventory. It reaches **{{BUFFER_P05}}%** downside service and passes the numerical budget check without expediting. That extra 25,200 devices is **not known to exist**, and its procurement, holding and opportunity cost is not modeled. This is a conditional design requirement to investigate, not a recommended transfer or a proven feasible plan.

### What to tell the CEO

- The product demonstrates a traceable way to expose trade-offs and reject insufficient responses, rather than promising immunity to disruption.
- The present asset is the workflow, taxonomy, inspectable method contracts and working local analytical kernels. Claims of proprietary model superiority need independent validation; a catalog entry is not a research moat by itself.
- Fund a bounded, recommendation-only pilot on one product cohort with an accountable planner, actual historical data and agreed evaluation criteria. Do not fund an unrestricted autonomous rollout based on the clickflow.
- Evaluate service improvement, decision turnaround, planner workload and realized net economics separately. Dashboard exposure is not a benefit ledger.

### What to tell the CTO

- The browser contains meaningful calculations, project-scoped local state and defensive review behavior. It does not contain a deployed collector, durable tenant knowledge base, autonomous agent runtime, authenticated approval service or ERP write-back.
- The critical build order is trusted data and authorization first, versioned tool execution second, governed operational actions third, and learning only after outcomes can be measured.
- The knowledge graph, statistical sample, deterministic optimizer and Monte Carlo model are not one automatically synchronized computation. Their bridges need explicit dataset versions, units, scopes and provenance.
- This guide describes the existing workflow; it does not introduce a second Mission Control page or decision journey.

## 2. How to use this document

Read sections 1–5 for the business case and evidence boundaries. Use sections 6–15 beside the application for a detailed operator walkthrough. Read sections 16–20 for architecture, readiness and an improvement backlog. The appendices identify variables, methods, source files and reproducibility details.

The HTML version is self-contained: open it locally, use its contents links, switch light/dark theme, print to PDF, or export the embedded evidence pack. It does not load the application, query a server, send telemetry or fetch external assets. External source links open only when clicked. The Markdown version contains the same narrative and numerical tables for editing and management circulation.

Use this vocabulary throughout:

| Label | What it means | What it does not mean |
| --- | --- | --- |
| Public context | A dated company publication checked for this review | Current private inventory, site capacity or an approved supplier lot |
| Seeded fixture | A hand-authored or deterministically generated demonstration value | A measurement, statistical estimate or solver result |
| Calculated sample | Arithmetic performed on the materialized generated rows | Analysis of the millions of rows named in a registry |
| Calculated scenario | A run of the local numerical engine with frozen inputs | Calibrated crisis probabilities or a production-feasible plan |
| Reviewed locally | A browser-local check of an exact result and domain attestations | Enterprise authorization, a digital signature or operational release |
| Target production capability | A proposed engineering contract | Functionality that has already been implemented |

The guide audits the local source and executes numerical models. It is not a live deployment audit, penetration test, performance certification or browser interaction test.

## 3. The Apple problem and the real-world context

The project's broader story is a hypothetical compound shock: Taiwan-route disruption, rare-earth export-clearance delays, constrained launch-market airfreight and a component lot with unacceptable origin evidence. A semiconductor delay can strand otherwise finished kits; a qualified assembly line cannot compensate for a missing approved magnet; ample stock in one country may not satisfy a specific market's launch configuration.

The task is therefore not simply “buy more supply.” It is to protect eligible, configuration-complete deliveries within time, transport, funding and policy limits, while making the remaining exposure visible to the decision owner.

### Dated public facts, not private operational claims

On 15 July 2025, Apple announced a multiyear **$500 million** commitment with MP Materials for US-made rare-earth magnets and a planned recycling line. An investment announcement does not establish available qualified stock in the modeled launch week. [Apple's magnet-supply announcement](https://www.apple.com/newsroom/2025/07/apple-expands-us-supply-chain-with-500-million-usd-commitment/).

Apple's 16 April 2026 environmental update reports **30% recycled material** across products shipped in 2025 and recycled rare-earth use in magnets, subject to the publication's inventory exceptions. These are material-sourcing context, not a lot-release record. [Apple's environmental update](https://www.apple.com/ie/newsroom/2026/04/apple-accelerates-progress-with-highest-ever-recycled-material-in-its-products/).

Apple describes a product lifecycle spanning sourcing, manufacturing, shipping, use and recovery. tanjnx's illustrative network follows that kind of connected lifecycle; it is not a verified map of Apple's commercial relationships. [Apple's supply-chain overview](https://www.apple.com/supply-chain/).

These three pages were checked on 10 September 2026. No current war, sanctions event, factory outage or export restriction is asserted in this case. A production policy decision needs an authoritative, current, jurisdiction-specific check.

### The eight stages represented in the project

{{STAGES}}

A downstream shortage should be traced back through product revision, required component, qualified supplier-site, eligible inventory, process capacity, export gateway and transport lane. Recovery and recycling are important wider lifecycle concerns, but this eight-stage launch graph is not a complete circular-materials model.

## 4. The three scopes that must not be confused

| Scope | What is present | Correct interpretation |
| --- | --- | --- |
| Portfolio narrative | $1.84B exposed, $612M protected, 91.6% baseline and 97.4% response service; 97% narrative floor | Seeded Apple launch-portfolio story. “P95 service” here is a legacy narrative label, not the calculated P05 statistic below. Do not claim a probability certificate. |
| Inspectable graph and sample | {{GRAPH_NODES}} instantiated network nodes, {{GRAPH_EDGES}} directed edges, {{GRAPH_CHECKPOINTS}} capacity/concentration checkpoints; six table profiles, 96 rows materialized per full table | A bounded generated model. The declared 18,640 entities, 72,910 relationships, 4.82M observations and 3,480 documents are fixture metadata, not loaded or ingested records. |
| Executable Simulation cohort | 10,000 devices/week baseline demand, 8 weeks, 512 paired paths, 95% P05 floor and $700,000 incremental budget | A separate aggregate regional planning experiment. It does not automatically import the graph's per-SKU or lot constraints. |

Even within the interface, similar words can have different meanings. A graph confidence score is seeded; a Simulation path-success frequency is computed but conditional on assumptions; a statistical sample quantile describes generated observations. None is interchangeable with a measured confidence level for an actual supply-chain decision.

**New shared clarification:** the scenario strip now says “SCENARIO FIXTURE” instead of “LIVE SIMULATION” and explicitly distinguishes its figures from the numerical tool. The underlying narrative values are preserved rather than silently rewritten to fit a smaller model.

## 5. The decision contract before any tool runs

| Contract item | Apple interpretation | Required real evidence |
| --- | --- | --- |
| Decision owner | Named client planning owner; the seeded “Maya Chen” profile is illustrative, not identified Apple personnel | Delegated authority, product scope and escalation path |
| Unit of service | Eligible, complete devices delivered for the selected cohort | SKU/market demand and delivery-promise definitions |
| Primary response | Qualified alternate capacity after its release week, with optional capped expediting | Qualification record, usable capacity and confirmed lane slots |
| Objective | Reduce expected lost contribution while examining severe-tail loss and service | Finance-approved unit economics and a counterfactual baseline |
| Hard numerical checks | P05 service ≥95%; every sampled path's intervention premium ≤$700,000 | Agreed risk tolerance; model validation; approved budget |
| Domain constraints | Complete qualified BOM, no quarantined magnet supply, freight ceiling, no pre-qualification capacity | Lot-level documents, releases, compatibility and carrier confirmations |
| Additional portfolio constraints | Carbon uplift and market/policy eligibility | Separate emissions calculation and trade/market review; these are not solved by the aggregate engine |

Do not move the service target downward simply to make a result green. A changed commitment is a new business decision requiring explicit approval. Likewise, “opening inventory” is available stock now, not supply that might be ordered later.

## 6. Navigate the existing OS without duplicate pages

| Component | Where to go / what to do | Why it matters / current boundary |
| --- | --- | --- |
| Clients & projects | Left-side workspace destination; choose Apple and Launch Continuity | Selects the explicit project boundary; never infer a project from a company name alone |
| Mission Control | Existing left-hand project tree, grouped By client or By tower | Find the project and its ancestry. It is the renamed project navigator, not a separate command-center app |
| New client / New project | Creation row below the two workspace destinations | Creates browser-session drafts with explicit setup needs; does not manufacture a connected client |
| Breadcrumb | Top path, including client, sector and project | Confirm the selected project before changing any assumptions |
| Apps bar | Select an icon; the active app expands with its name; use Apps for catalog/history | Twelve specialist tools plus always-available Playground. A mounted tool is not evidence that an external engine is connected |
| Back to project | In an app's bar | Returns to project context. Overview, Decisions, Data and Controls appear only on project pages |
| Agents / Team | Mounted people rows; click a person or agent | Inspect role, project work and review rights; profiles/activity are seeded or local |
| Variables | Top right beside Search | Search canonical L0/L1/L2 meanings and M-series methods; a reference definition is not a populated measurement |
| Search | Top-right workspace search; Data has its own project search | Finds modeled workspace content; not a general enterprise search service |
| Theme / notifications / profile | Top-right controls | UI preferences and local interaction context. Aakash Roy / Super Admin is the configured demonstration identity, not a server-authenticated security guarantee |
| Operations World | Other left-side workspace destination | Network operations and global knowledge graph, with global/regional views; return to the Apple project for a scoped decision |
| Standalone case studies | Outside the workflow, shared as files | This document and the separate ten-case presentation are not additional in-app journeys |

For the operator lab, begin with the existing URL `/?view=company&project=apple-launch-continuity&projectTab=overview` on your own application host. URLs in this guide are relative route examples, not a new hosted deployment.

## 7. Data: from a source description to something analyzable

### The six current data products

{{DATASETS}}

The registry tells a user what data would be needed and at what grain. Counts, freshness and quality percentages are declared fixtures. They are not produced by live S&OP, PLM, QMS, MES, TMS or policy ingestion. Distinguish **dataset ID** `P-001-DS-01` from **table node** `P-001-TABLE-01` and its full-table route key `{{FIRST_TABLE}}`.

### Operator steps

1. Open Data → Sources. Search for “Launch demand contract,” inspect its bindings and click Trace dataset. Read the source kind, locator, grain, formula and limitations, not only the displayed value.
2. Inspect the five file/catalog shapes: workbook, PDF, CSV, SQL table and JSON. These are inspectable metadata records; they do not open a private source file or database.
3. Try Choose local file only with a suitable demonstration file. The current ingestion sequence captures its filename, then shows Staged → Schema preview → Mapping draft → Review demo → Session receipt. It does not parse, upload or merge the file's contents.
4. Use Request enterprise source or a source template to inspect the intended ingestion boundary. The connector request, policy-review and fixture-replay states do not enroll a source.
5. Open the corresponding table from its knowledge-graph node, or through Statistical Studio's Full table + filters link. The full-table page materializes 96 generated rows and recalculates summaries after filtering.

### What a real Apple-cohort input contract would need

| Data | Minimum fields to add in production | Why absence changes the decision |
| --- | --- | --- |
| Launch order | tenant, project, SKU revision, destination, week, quantity, required date, priority, currency, contribution basis | Aggregate demand hides market-specific promises and product mix |
| BOM and lot eligibility | parent revision, child part, quantity per device, lot, origin, status, release evidence, effective interval | Material volume cannot establish a complete, qualified build |
| Supply and production | site, part, period, rated/usable capacity, qualification scope, yield, release date, maintenance/labor limits | Nameplate capacity is not executable output |
| Inventory and pipeline | item, location, eligible quantity, quarantine, reserved quantity, shipment, due date, status, receipt timestamp | Otherwise stock is double-counted or assumed available too early |
| Transport | lane, mode, booking, compatible units, weekly slots, ETA, revision, premium, gateway and clearance evidence | A one-week reduction cannot be applied to unlimited volume |
| Policy assertion | jurisdiction, covered item/party, rule, publication date, valid-from/to, authoritative source, reviewer | Stale context can invalidate a previously acceptable option |
| Provenance | source ID, source version, unit, event time, ingestion time, quality result and permission scope | Without this, a number cannot be independently reproduced or revoked |

These are proposed production schemas, not columns already populated in the generated table. Do not map a categorical supplier qualification status to an arbitrary numeric score without a separately governed encoding.

### Edge collector and IoT

Data offers templates for OPC UA machine/robot observations, MQTT sensor telemetry, QR-style handoffs and read-only enterprise CDC/API sources. The intended design is permissioned collection from approved folders, tables, APIs and topics—not unrestricted background scraping. No installed companion, device certificate, broker subscription or ingestion endpoint exists in the inspected workflow. Device enrollment, edge buffering, redaction, deduplication and revocation remain engineering work.

## 8. Read the project graph and Operations World correctly

### Project knowledge graph

Use Data → Knowledge graph (`projectTab=graph`). The graph combines the supply network with table, variable, source, activity and decision-context entities. Choose a stage, geography or entity category; search; then inspect upstream, downstream or both directions. A graph relationship communicates dependency and traceability, not necessarily a material flow equation.

Click a node to inspect its role, tier, capacity, lead time, risk and evidence. Click an edge—or one of the supplied-by/supplies rows—to inspect the relationship, endpoints, volume/value, concentration share, mode, lead time and evidence reference. These links are project fixtures; they do not establish a real commercial relationship between named companies.

Switch to checkpoints to inspect capacity or concentration against a guardrail, severity, owner, consequence and response. The checkpoint's rank is a fixture-based triage aid. It is not proof that resolving that node gives the greatest marginal resilience benefit.

The graph's Pin as assumption, Exclude this source, Make a hard constraint, Assign specialist and Request alternative path actions steer an existing project trace. They do not themselves change the mathematical constraint matrix or delete a source. Verify the resulting session record before expecting a rerun to incorporate anything.

### Table nodes: a corrected diagnostic

The old inspector displayed a preset “best fit,” stationarity and drift status. It now calculates mean, sample standard deviation and missing-value count from the **same 96 generated rows** used by the full table. It explicitly says that no fit, stationarity or drift test ran. This correction is shared by every project's explorer.

The generic sample generator does not yet carry reviewed physical units per variable. Its values are now labeled **fixture index**, replacing misleading rotating units/percent/hours labels. This stops a display sample being mistaken for usable device quantities, prices or lead times. A future typed data contract must provide units, categorical types, aggregation rules and conversions before these rows can calibrate a production model.

### Global knowledge graph

Operations World combines project networks, allows client/entity/risk color modes, influence/risk sizing, search and filters, clickable nodes and edges, zoom/pan/fit and an inspector. Global/regional network operations provide another operating-context view. Global links based on shared geography or modeled dependencies are possible exposure paths—not verified transactions or permission to reveal private client data.

Global Network Optimizer context is not a multi-tenant optimization service. A production implementation must use a public/shared layer plus permission-filtered private graphs. A common supplier may be publicly known; each client's price, volume, contract and shortage must remain private unless explicit sharing authority exists.

## 9. Statistical Studio: reproduce the sample, not a prediction

Open Statistical Studio → Launch demand contract → L0-001 → Descriptive statistics → Run analysis. The first table uses `{{FIRST_TABLE}}`. Export analysis + input rows produces a JSON record of the selected sample, settings and result.

The following figures are computed from the repository's current sample generator, not manually filled into this guide:

{{STATS}}

To reproduce the second column of results, open Full table + filters, choose L0-001 and set the minimum to **{{FILTER_MIN}}**. The table filters its local 96 rows, updates statistics and exports exactly the filtered CSV. It is not a remote SQL query engine. The Statistics page does not inherit the other tab's filters automatically.

### Sample head

{{SAMPLE_HEAD}}

### What each method means

- **Descriptive statistics:** arithmetic mean, median, extrema, sample SD with an n−1 denominator and empirical quantiles. P05–P95 is the central 90% of the sample, not a confidence interval on the mean or a future-demand prediction interval.
- **State transitions:** sort by event time; categorize numeric values as low/typical/high using the sample mean ± SD; count adjacent transitions. A row with no transitions is unavailable, not a row of invented probabilities.
- **Process performance:** enter reviewed lower and upper specification limits to calculate Pp and Ppk using overall sample SD. Do not describe this as within-subgroup Cp/Cpk, a stable-process finding or product-release authority.

Changing a dataset, variable, method or specification limit marks the result stale and disables exporting it as current. Rerun before interpreting the new selection.

**Important disconnect:** low/typical/high sample states are not Normal/Constrained/Disrupted supply-chain regimes. There is no implemented calibration bridge. A production analyst would define operational states, estimate transitions on appropriately spaced history, test stationarity and out-of-sample behavior, and obtain approval of that model version. Do not copy a generated transition matrix into a crisis model and call it learned intelligence.

## 10. Every specialist tool and its Apple role

The tools are intended to be used by agents and inspected or corrected by humans. In the present prototype, many controls select fixtures or record receipts. The table below separates intended decision use from actual execution. Tool names, not two-letter icons, are the reliable navigation labels.

| Tool | Apple question and input | What to inspect / edit now | Current output and boundary |
| --- | --- | --- | --- |
| Risk Radar | Which component or route can stop the launch? Qualified dependency and event context | Criticality/event/continuity views, category and horizon, selected dependency, trace receipt | Filter-linked synthetic exposure and case summary; no licensed risk-feed or validated causal propagation engine |
| Network Optimizer | How should limited capacity, inventory and lanes be allocated? Decision objective, horizon and hard envelopes | Frame → Formulate → Techniques → Stress + compare → Validate + release; change assumptions, recalculate and inspect violations | A deterministic synthetic response calculator and inspectable method contract. It is not a MILP/robust solver or optimality certificate; its inputs are not automatically fed into Simulation |
| Flow Lens | What cash is tied up or released by the response? Inventory, transit and receivables | Working capital/order-to-cash/margin view, business unit, period and action queue | Synthetic cash bridge and action receipts. Do not add its illustrated benefits to Simulation's avoided-loss figure |
| Demand Sense | Is the problem total demand, mix or launch timing? Orders and market cohorts | Consensus/high-growth/downside/promotion, granularity and product-family selections | Scenario-linked forecast fixture; no live fitted forecast, hierarchical reconciliation or backtest runs here |
| Supplier Graph | Do apparent alternatives share a common constrained sub-tier? Qualification and dependency graph | Select suppliers/dependencies, inspect profile and evidence, shortlist alternatives | Modeled network and local shortlist. Selection does not qualify or reserve a supplier |
| Mineral Atlas | Which magnet/separation dependency matters? Material grade, geography and eligibility | Select Rare earths for this case, country and stress scenario; trace the dossier | Fixed country-balance and sourcing receipts, not a live reserve/price feed. An investment announcement is not usable stock |
| Workforce Studio | Can qualified staff actually operate the recovery line? Skill, shift, fatigue and certification | Recovery roster / surge / fatigue-safe, skill row and shift cell | Fixture coverage and staffing receipts. No worker assignment or capacity reservation is made; generic headcounts require client-specific replacement |
| Manufacturing Twin | Which process constrains configuration-complete devices? BOM, yield, capacity and schedule | Plan, process cell, bottleneck inspector and Gantt row; Replay 40-replication DES fixture | Stored DES-style demonstration summary, not an executed plant DES. Shared stock values and generic WIP units are not Apple's modeled 8-week cohort |
| Logistics Radar | Which eligible shipment/lane protects the promise? Movement events and confirmed capacity | Now/+24h/+7d/+30d, asset, transfer and route-package draft | Modeled movement/handoff data. No AIS/ADS-B/carrier connection or booking; the numerical expedite ceiling is separately entered in Simulation |
| Quality Genealogy | Which lots may be released and what else depends on them? Certificate, origin and batch relationships | Select lot, inspect genealogy and containment/release evidence | Fixture containment/release proposal, not lot-release authority. This UI is labeled Quality Genealogy; “Quality Gate” in older case text describes its intended role |
| Statistical Studio | What variability is actually in the inspected sample? Materialized rows and variable | Dataset, variable, descriptive/transition/performance method, limits and export | Genuine sample calculations on generated fixture indices; no parametric fit or production model calibration |
| Simulation | How do response policies perform under repeated dependent shocks? Explicit aggregate input contract | Edit assumptions, run, inspect distributions/ledger, fork, compare, export and attach to Decisions | Genuine browser Monte Carlo/Markov calculations. No SKU-level eligibility optimizer, live data ingestion or production release |

Do not imply that every tool must run for every issue. An orchestrator should choose the smallest justified chain: demand and data diagnosis, dependencies and constraints, candidate allocation, stress testing and review. Unused tools still need a declared reason; invoking all of them adds cost without necessarily adding evidence.

## 11. Playground, agents and accountable people

### The terminal workflow

Open Playground from the app bar. The terminal occupies the app working area; it is not a project tab. Sessions can be selected or continued as a new session. The right inspector holds run-as identity, readiness/context and agent-builder access; the session and inspector panes collapse independently. Full screen enlarges the terminal without creating a new project.

Send a project-specific brief. The composer supports a one-line entry, file attachment metadata, agent mentions and commands. Enter sends; Shift+Enter adds a line; Ctrl+U opens attachment selection. Use the icon tooltips for pin/pause, service constraint, source rejection and robust comparison. Cancel/stop and continuation preserve the intent to review a separate revision.

For this review, a suitable manual brief is:

```
For Apple Launch Continuity, distinguish the portfolio fixture from the
8-week regional simulation. Examine qualification, magnet-lot eligibility
and the 1,800-device weekly expedite ceiling. Preserve the 95% downside
service floor and $700,000 budget. Show missing evidence, compare the
current policy with a delayed qualification, and stop before release.
```

This is a guide example, not a newly added suggested-message button. The terminal's thinking/searching/calculating trace is simulated application behavior. It is not a streamed LLM reasoning log, a web search or a call to a production solver. Attaching a filename does not ingest the document. Agent mentions and steering remain within the modeled session workflow.

### The twelve declared specialist roles

{{AGENTS}}

Agent years of experience, calibration, evaluated/approved runs and failure-rate badges are seeded persona metadata. They must not be shown to the CEO or a client as actual model-evaluation results. The builder records a name, specialty, skills manifest, connection requests and evaluation plan for a project agent draft; it does not install executable skills or start a temporary worker.

### Team and review rights

Apple has four seeded project memberships: the illustrative client owner, Aakash Roy as the tanjnx engagement lead / demonstration Super Admin, the tanjnx OR Scientist and tanjnx Data Steward. Named expert profiles are a separate reference pool. “16 experts” in the portfolio metadata does not mean sixteen authenticated people collaborated on this result.

In a production review, divide responsibility: the client planner owns promises; procurement verifies qualification and available capacity; the data steward owns lineage; an OR/statistics specialist validates the model; finance validates costs and benefits; logistics confirms lane slots; quality/trade specialists verify eligibility; a separately authorized executive approves any action. The orchestrating agent must not approve its own output.

## 12. Simulation: the model, inputs and limits

Use Simulation → Edit assumptions. This guide calls the same shared default-input function as the application; the defaults are not transcribed into a second numerical model.

{{INPUTS}}

The UI exposes the main stress, inventory, qualification, budget, seed and horizon controls. Some base parameters are seeded in the model rather than editable form controls; inspect Export run for the complete frozen input. A changed input makes the old result stale. The sample of individual paths shown in the ledger is smaller than the full set used in the summary.

### Domain context versus enforced equations

{{DOMAIN_INPUTS}}

Only the new explicit expedite ceiling is wired directly from the stated 1,800-device limit into the transport calculation. The 6,200 magnet sets, 11% quarantine, 68% priority mix, overtime ceiling and configuration freeze remain contextual inputs; the aggregate engine does not perform BOM explosion, lot disposition or SKU prioritization. Domain review is mandatory, not decorative.

### Weekly operating-state assumptions

{{REGIMES}}

Each transition row sums to one. The system starts in the Normal state and draws a transition before simulating week 1. States affect both primary capacity and the total lead time of new primary dispatches. Demand uses an independent symmetric triangular perturbation around the surged mean. Yield is a fixed entered percentage, not a sampled yield distribution. The qualified alternate is modeled as independent of the primary disruption state; that assumption can materially overstate resilience if both sources share a sub-tier or route.

### What the engine actually calculates

```
demand = weekly base × (1 + surge) × (1 + triangular variation)
primary dispatch = rated primary capacity × (1 − additional cut)
                   × current-state capacity factor × qualified yield
alternate dispatch = qualified alternate capacity × selected share × yield
                     only from the qualification week onward
expedited dispatch ≤ entered weekly expedite ceiling
arrivals = shipments whose modeled due week has been reached
served = min(opening stock + arrivals, this week's demand)
closing stock = opening stock + arrivals − served
lost demand = this week's demand − served
closing pipeline = opening pipeline + dispatch − arrivals
loss = permanently unserved units × unit margin + intervention premiums
net loss avoided = mean baseline loss − mean response loss
```

Primary supply receives fast-lane capacity first; any remaining ceiling is used for alternate supply. Only units whose lead time can shorten consume fast-lane capacity. Primary lead days are rounded up to whole weeks; fast units arrive one week sooner. Alternate regular transit is one week, or zero for expedited units. Existing pipeline is not retimed. This is an explicit fixed allocation policy, not a routing optimization.

The alternate sourcing premium is 60% of the expedite unit rate, charged to all alternate dispatches. Expedited units incur the full additional expedite rate. This simplified cost relationship is a model assumption requiring validation, not a statement of market pricing.

P05 service is the lower service tail. P95 loss is the upper loss quantile. CVaR95 is the average loss in the worst 5% of sampled probability mass, including a fractional boundary path when necessary. More replications reduce numerical sampling noise; they do not prove that the assumed crisis distribution is right. “Paths meeting floor” is conditional sample frequency, not the chance of a real war occurring.

### Model boundaries that matter

- Unserved demand is lost each week, not backlogged. Canceled orders, deferred demand and substitution need a different model.
- Production quantities are aggregate device equivalents and may be fractional. No integer build or lot release is implied.
- Primary production is not dynamically controlled by current inventory or demand. Overproduction can remain in stock or the pipeline at the horizon.
- Fixed additional capacity cuts compound with state-dependent loss. Do not represent the same disruption twice unless that is intentional.
- No purchase cost of additional opening inventory, holding cost, salvage, tax, emissions, working-capital financing or full SKU margin mix is calculated.
- No policy, origin, material genealogy, shift scheduling, machine reliability or configuration-specific service constraint is enforced by this engine.
- The budget gate checks the highest intervention cost among sampled paths, not every possible future path. A passing result is not a robust feasibility certificate.

## 13. Six reproducible experiments and their interpretation

Every row uses **{{MODEL_VERSION}}**, **512 paths**, **seed 20260909** and an eight-week horizon. Only the changes listed below differ. The archived timestamps are fixed for reproduction; they are not evidence of live activity at that time.

{{RUNS}}

{{RUN_IDS}}

### A: establish the no-action reference

Set Qualified alternate used to 0 and leave expediting off. Baseline and response are identical. Net avoided loss must be zero. This is a software invariance check and a useful explanation of what an intervention comparison means.

### B: test the current default response

Restore 100% alternate availability from week 2, with 4,800 devices opening inventory and expediting off. Receipt **{{DEFAULT_ID}}** reports mean service **{{DEFAULT_MEAN}}%**, downside service **{{DEFAULT_P05}}%** and **{{DEFAULT_PROB}}%** of paths meeting the 95% floor. The tail loss is **{{DEFAULT_CVAR}}**. The budget passes, but the service floor fails. Do not route it as a positive operational recommendation.

### C: test the transport lever without unlimited capacity

Turn on expediting and keep the ceiling at 1,800 devices/week. Receipt **{{CAP_ID}}** improves timing, not material availability. Eight weeks of 1,800 fast units at $28 add $403,200 of premiums to the alternate cost. The resulting **{{CAP_COST}}** breaks the budget while downside service still misses the floor. This is a visible cost/service trade-off, not an optimizer failure to hide.

### D: make qualification uncertainty visible

Change the alternate release from week 2 to week 4. The model supplies no alternate units before release. Lower service makes the cost of a delayed qualification decision explicit. The next action is to ask for the actual release evidence and identify what testing or approval is still open—not to treat a planned source as approved.

### E: investigate a conditional recovery envelope

Set opening available inventory to 30,000 devices, keep the alternate policy and leave expediting off. Receipt **{{BUFFER_ID}}** has **{{BUFFER_P05}}%** downside service and passes the modeled budget. Its paired baseline also receives 30,000 opening devices, so **{{BUFFER_NET}}** avoided loss measures the alternate policy's benefit **conditional on that stock**. It is not the benefit of acquiring the extra buffer.

The defensible conclusion is: “This aggregate experiment suggests that a materially larger eligible opening buffer could support the target under these assumptions.” The unanswered questions are where 25,200 additional complete devices would come from, whether they are genuinely transferable, which customers lose protection, what they cost, and whether the SKU mix matches. Those questions belong to Data, Supplier Graph, Quality Genealogy, Flow Lens and a validated allocation model. There is no claim that 30,000 is a minimum, optimum or verified stock position.

### F: verify that no authority means no positive review

Set budget to zero with the alternate response still enabled. The computed cost remains positive and the budget check fails. A request for revision remains possible. An affirmative local review must not be enabled by a policy label or optimistic narrative value.

### One path, visible accounting

This is response path 1 from experiment B, rounded for reading. It is not the average path and should not be substituted for the distribution.

{{FIRST_PATH}}

In week 1, opening stock plus arrivals minus served equals closing stock. The opening pipeline plus new dispatch minus arrivals equals closing in-transit quantity. The automated tests check these identities across every generated week and across all ten client models, including expediting.

## 14. Decisions: preserve a result, challenge it, and stop at authority

Open project Decisions. Git-style lineage communicates branching choices and review ancestry; Data's knowledge graph communicates sources and dependencies. They are different relationships and should not be merged into an ambiguous single visual.

### Current Apple narrative nodes

{{DECISIONS}}

The seeded “Validated” or “Rejected by stress test” state is not derived from the six experiments above. Treat the **Calculated tool evidence** panel as the place to read an actually attached run. It explicitly separates its evidence from scenario values. A future single decision schema must bind all branch labels to real artifacts and approvals.

### Reproducible operator sequence

1. Run experiment B in Simulation. Export the run, then select D2-A under Attach to existing decision and click Attach calculated result.
2. Open Decisions and select D2-A. Confirm the exact SIM identifier, P05 floor, budget and stale/current state. The failed service check must block Mark reviewed locally.
3. Enter a rationale such as “Downside launch service remains below the committed floor; verify eligible inventory and alternate qualification.” Use Request revision. This is a recorded review outcome, not a dropped result.
4. Return to Simulation, change the qualification week or inventory and Fork & rerun. A new fingerprint creates a new numerical receipt. Attach that exact result; never overwrite the failed run to make history look successful.
5. For a result with passing numerical checks, the reviewer must still verify every listed domain constraint and provide at least twelve characters of rationale. Do not tick boxes merely to demonstrate a green status.
6. Export evidence, the decision snapshot or the branch comparison. The exported package retains calculated artifacts with the project and decision identifiers. It does not release an order.

Changed inputs, an invalid draft or a newer simulation run makes attached older evidence stale. Local reviews expire after 24 hours and retain reviewer, rationale, constraints checked and run identity. Browser-local review checks are not tamper-resistant enterprise authorization. Controls' quorum draft is not wired into a multi-person signing system.

The Simulation fingerprint is a reproducibility identifier, not a cryptographic signature. Its calculation results are recomputed when restored rather than trusting edited saved output fields. Version 1.1.0 refuses to reapprove results produced by the older unlimited-expedite model; an earlier-model archive export remains available before rerunning.

## 15. Controls, evidence receipts and manual intervention

Controls contains six configurable policy drafts: project boundary lock, human release approval, evidence requirements, solver-claim guard, learning-capture draft and external-provider access. Operating mode offers Enforce/Audit/Shadow; quorum and receipt retention are editable; Run policy test checks the browser draft; Record configuration writes an action receipt; Reset defaults resets the draft.

These controls describe desired policy. They do not apply backend authorization, start learning, change a retention service, connect a provider or grant operational release authority. Their local audit entries are not a durable security log. They should remain clearly separated from the concrete numerical/staleness checks that the decision evidence panel actually enforces.

Evidence receipts expose source identity, locator, as-of time, version, displayed value, variable, grain, formula, declared inputs, attribution, reviewer and quality/access notes. A fixture locator beginning `fixture://` is a demonstration reference, not a retrievable document. Fixture fingerprints are not content hashes. Recording a reference receipt does not recursively traverse a connected enterprise evidence store.

When you suspect a value is wrong, use this order: identify its evidence kind; inspect its scope/unit/time; find the relevant editable model input; change it; rerun; inspect the input diff; reattach the exact result; request a fresh review. Editing a node selection, recording a steering request or switching a fixture scenario is not equivalent to recalculating every downstream tool.

## 16. What was improved during this Apple audit

| Finding | Shared implementation change | Cross-project effect |
| --- | --- | --- |
| Expedite applied to all supply despite Apple's stated cap | Added optional weekly expedite capacity, primary-first split dispatch, cost on actual expedited units and explicit peak-use/budget diagnostics | Same calculation for all ten projects. Apple defaults to 1,800; models without a declared fast-lane allowance default to zero until a user supplies an assumption |
| Documentation could drift from form defaults | Extracted a shared default-input constructor used by Simulation and the guide generator | One canonical default contract, with company-specific scenario inputs retained |
| A prior result might be reused after changed engine semantics | Bumped numerical model to 1.1.0; prior-version results fail restoration for review; exposed earlier-model archive export | Existing stored records are not silently reinterpreted as new-model evidence |
| Graph tables claimed preset fit/drift/stationarity | Replaced those claims with calculated mean, sample SD and missing count from the same 96-row sample | Every project's table inspector matches the materialized sample boundary |
| Generic generated columns rotated through false physical units | Labeled generated values fixture index | No implication that arbitrary numeric encodings are actual device counts, prices, percentages or lead times |
| Seeded portfolio strip resembled a live calculation | Relabeled SCENARIO FIXTURE and clarified portfolio-versus-cohort scope | All seeded projects retain their stories without masquerading as live tool results |

No duplicate navigation, new in-app guide, data connector, new agent service, production action or Playground layout change was introduced. This report is a separate deliverable.

## 17. Architecture: what exists versus the target OS

### Current execution path

```
Browser route + selected project
  → seeded case / graph / local data sample
  → user action or simulated agent trace
  → local statistical or simulation function (where implemented)
  → result with frozen inputs and identifier
  → localStorage / downloadable JSON
  → local decision evidence and review
  → STOP: no external operational execution
```

The app uses React and TypeScript with a Vinext/Vite web build. The inspected Worker serves the web application and image handling. A DB type declaration is not a provisioned database; the hosting manifest declares no D1/R2 backing store. These are local source observations, not verification of a running cloud deployment.

### Target trust boundaries

| Boundary | Production responsibility | Acceptance evidence |
| --- | --- | --- |
| Customer edge | Signed installer, explicit collection scope, read-only adapters, local redaction, encrypted offline queue and stop/revoke | Revocation stops reads; arbitrary filesystem/credential access is unavailable; offline replay is attributable |
| Ingestion | Tenant/device authentication, schema registry, event time and receipt time, deduplication, quarantine, checkpoints | Duplicate/out-of-order/invalid events do not corrupt trusted state |
| Knowledge | Durable tables/documents plus temporal graph assertions, source permissions, units and versioned entity resolution | Every model input resolves to a permitted source version; two tenants cannot retrieve each other's data |
| Orchestration | Durable jobs, tool schemas, capability grants, short-lived specialist workers, cancellation and resource ceilings | A canceled or revoked agent cannot keep spending or commit an action |
| Analytical workers | Validated statistical/OR/simulation packages in frozen environments, explicit status and reproducible artifacts | Known-case verification, holdout validation, infeasibility/timeout reporting and declared uncertainty |
| Decision execution | Immutable proposal, actual reviewer identity, separation of duties, signed approval, expiry, idempotent write-back and acknowledgement | An exact approved revision can execute once; stale/revoked approvals cannot execute |
| Learning | Outcome attribution, evaluation dataset, candidate skill registry, shadow comparison and controlled promotion | No autonomous policy mutation from an unverified reward; rollback and human approval work |

Retrieved web pages and documents are untrusted input. They may contain misleading facts or instructions. In production, they must never grant tool authority; permission checks and executable tool arguments belong to trusted application code. Policy/legal review and scientific model validation are separate from model-generated explanations.

## 18. Prioritized improvement backlog for CEO and CTO

| Priority / owner | Improvement | Why Apple exposes it | Measurable acceptance condition |
| --- | --- | --- | --- |
| P0 · Data platform + security | Durable tenant authorization and audited ingestion | Local project isolation is not a security boundary | Cross-tenant retrieval fails at the service; revoked sources stop; all accepted records carry versioned provenance |
| P0 · Product + data modeling | One typed decision/data contract across tools | Portfolio, graph, sample and regional solver currently use different scales | Reject incompatible unit, grain, time horizon or model scope instead of silently combining them |
| P0 · Operations research + domain owner | Model qualified SKU/BOM/lot allocation with capacity and transport | Aggregate devices can conceal invalid component substitutions | Every candidate build has complete eligible BOM, qualified capacity and lane slots; held lots contribute zero |
| P0 · Finance + planning | Close the business-case economics | Additional inventory can make service pass without paying for the stock | Counterfactual benefit reconciles acquisition, transfer, holding, lost sales and opportunity cost with finance |
| P0 · Product governance | Replace seeded decision validation labels with artifact-backed status | Narrative D3 nodes can say Validated while a calculated result fails | No validated/released label without exact current artifact, permitted reviewer and valid approval |
| P1 · Data science | Calibrate demand, yield, lead times and disruption dependence | Independent alternate supply and fixed yield may overstate resilience | Time-split validation and scenario calibration meet client-agreed tolerances; shared dependencies stress both sources |
| P1 · Agent platform | Typed tool execution and streamed durable tasks | Agent trace currently simulates rather than invokes specialist engines | A displayed tool event resolves to an actual job, input snapshot, output artifact, cancellation and resource receipt |
| P1 · Tool owners | Replace reused domain fixtures with project-specific models | Generic manufacturing WIP and workforce figures are not an Apple configuration plan | Apple and other clients use reviewed unit/grain models; tests detect semantic, not merely identifier, leakage |
| P1 · Knowledge engineering | Evidence-qualified global entity resolution | Shared-geography links do not prove a supplier relationship | Each cross-client assertion records public/shared authority, valid time and resolution evidence |
| P1 · UX + data stewardship | Expose evidence kind consistently at point of use | Confidence, freshness and counts still look stronger than their evidence | A user can distinguish measured, derived and hypothetical values without opening a drawer |
| P2 · Model governance | Researcher-owned tool packages and evaluation gates | Method labels do not implement research algorithms | Every promoted tool has version, owner, independent benchmark, failure modes, fallback and reproducible environment |
| P2 · Learning team | Outcome logging before adaptive policy | A local rating is not reinforcement learning | Verified action/outcome windows, safe offline evaluation, signed promotion and rollback precede any live experiment |

Do not treat “add more synthetic data” as the primary production milestone. Larger fixture networks can improve a demonstration, but they do not fix semantic units, source authority, model validity or execution safety.

## 19. A bounded pilot proposal

The suggested pilot is one regional product-launch cohort, not Apple's global network. Company access is not assumed; apply this structure to a real authorized client when data and sponsorship exist.

### Gate 1: trusted retrospective replay

Agree the cohort, horizon, priorities, promise definition, constraints and economic basis. Import approved historical orders, BOM/qualification, inventory/pipeline, capacity and transport records. Freeze a source snapshot. Reconcile quantity and currency units. Have a planner independently reproduce one constrained historical week.

### Gate 2: recommendation-only comparison

Compare the analyst's existing plan and the model on the same evidence snapshot. Record service, exposure, cost, runtime and explanation quality. Review failures as well as successes. Keep model outputs advisory. Do not infer improvement from the same data used to calibrate the model.

### Gate 3: one controlled action

After authentication, approvals and operational adapters are validated, choose one reversible action such as a draft transfer request. Require explicit human approval of the exact revision, idempotent submission, acknowledgement and reconciliation. Do not start with autonomous purchase orders or safety-critical releases.

### Gate 4: monitored operation and learning

Track prediction error, drift, override reasons, delayed outcomes, control failures and resource cost. Establish a signed model/skill registry and independent promotion authority. Reinforcement learning is a later option, not a prerequisite for delivering valuable decision support.

CEO decisions: sponsor and cohort, accountable business owner, acceptable exposure and data rights, approved budget for the pilot, and what constitutes measured success. CTO decisions: tenancy/identity model, source adapters, storage/graph strategy, job runtime, numerical package governance and deployment/recovery controls. Neither should be asked to approve an enterprise rollout on the basis of this demonstration alone.

## 20. Review exercises and questions to take into the meeting

| Exercise | Expected result today | Question it reveals |
| --- | --- | --- |
| Open Apple, then a different client | Project IDs, graph and case inputs change | Are all domain quantities truly client-specific, or are some shared illustrations? |
| Inspect a seeded value and a calculated SIM result | Different evidence kinds and scales | Can an executive recognize that distinction without coaching? |
| Filter the demand sample | Counts, mean, SD and CSV reflect the filtered rows | Is this sample sufficient for the decision, or only for demonstrating the UI? |
| Delay qualification | No alternate dispatch before its release; service worsens | Is the source release date evidenced or aspirational? |
| Set expedite cap to zero while enabling expedite | No fast-lane benefit or fast-lane premium | What is the approved capacity basis? |
| Turn on 1,800/week expediting | Budget fails for this case | What commitment must change, and who may authorize it? |
| Attach a failed run | Positive review blocked; revision allowed | Are users preserving bad news rather than bypassing a gate? |
| Edit inputs after attachment | Evidence becomes stale | Does every downstream production action invalidate as well? Not implemented yet |
| Export and recompute a receipt | Same inputs/version/seed reproduce results | Are the actual input sources and model versions also retained? |
| Review the 30,000-device sensitivity | Numerical pass, but missing inventory evidence and full economics | What would have to be true before a planner could use it? |

Questions to ask the CEO: which promise matters most; what disruption is tolerable; which constraints are non-negotiable; who can authorize a trade-off; what real-world outcome would justify the investment?

Questions to ask the CTO: where is the source-of-truth contract; how are units and valid time represented; which tool actually ran; how is cross-tenant access enforced; what happens on revoked evidence, repeated events, cancellation or a stale approval; how are model updates validated and rolled back?

## 21. Canonical variables used by Apple

Variables near Search is the glossary, not a numeric database. L0 names a primitive observation or input; L1 groups an operating process; L2 describes a broader composite force. M-series codes describe methods and are not another variable level. The global catalog has 481 L0, 60 L1 and 35 L2 entries; this table contains Apple's project bindings plus its dataset bindings.

{{VARIABLES}}

An important semantic example: L0-061 is **Purchase price**, not “available capacity”; L0-057 is **Supplier qualification status**, not a continuous measurement. A numerically generated sample column with either identifier is only an interface demonstration until a typed real-data contract exists. A valid taxonomy identifier alone does not establish that a model uses it correctly.

## 22. Method references and implementation depth

The following catalog entries cover Apple's selected methods and the Statistical Studio / Simulation contracts. The catalog explains intended scientific use. It does **not** claim these algorithms all execute today. Simulation executes its explicitly described aggregate Monte Carlo/Markov model; Statistics executes the three sample analyses described earlier; Network Optimizer uses a deterministic synthetic response calculator.

{{METHODS}}

For a production candidate, require exact formulation, variable domains and units, assumptions, algorithm/version, solver status, objective and bounds when meaningful, constraint residuals, runtime/termination, seed/environment, data snapshot and an independent validity assessment. Method labels, synthetic confidence or a visually complex graph cannot substitute for those artifacts.

## 23. Reproducibility, source map and delivery boundary

Source baseline commit: `{{GIT_BASE}}`. The guide reflects the locally audited changes on top of that baseline, not a claim that those changes were pushed. The companion evidence JSON retains SHA-256 fingerprints of inspected source files, the complete default input, six compact run records, the full 96-row statistical sample and calculated summaries. These file hashes identify this snapshot; they do not certify scientific validity.

The HTML embeds the same evidence pack so it can be shared alone. Its Export evidence pack button works without the application. Compact numerical records keep three illustrative paths per policy plus the summary; the model regenerates all 512 paths from frozen inputs when restored. Do not interpret three retained paths as the number used in the calculations.

{{SOURCE_FILES}}

### Regenerate the documents from source

Run these from the designated `real_maya/maya` checkout using the repository's supported Node runtime:

```
node scripts/build-apple-guide.mjs
node --test tests/agent-os.test.mjs tests/tool-decision-consolidation.test.mjs
npm.cmd run typecheck
npm.cmd run build
node --test tests/*.test.mjs
```

Generated files: `docs/apple-project-guide.html`, `docs/APPLE_PROJECT_GUIDE.md` and `docs/apple-project-evidence.json`. No route or workflow menu links to the new guide. The Markdown template and renderer live under `scripts/` so the prose can be edited and the numeric tables regenerated without manual transcription.

### Audit completion record

Local validation completed on 10 September 2026: `npm.cmd run typecheck` passed, `npm.cmd run build` passed, and `node --test tests/*.test.mjs` passed all 138 tests. Guide checks verify standalone HTML anchor targets and inline JavaScript syntax, component coverage, embedded/companion evidence parity, all six recomputable simulation experiments, and the filtered statistical sample. The evidence pack records hashes of the inspected source files.

These checks establish local build and numerical regression results, not production certification. Browser interaction/visual QA, live cloud integration, tenant security testing, scientific/domain validation and deployment are not included. The build reports nonblocking large-chunk and static route-classification warnings; they remain follow-up engineering work.

### Final reporting language

**Safe:** “We have an interactive, project-scoped prototype with reproducible local numerical experiments and reviewable evidence. The Apple scenario exposes a service shortfall and tests conditional responses. We have identified the data, scientific-validation and execution controls needed for a real pilot.”

**Not supported:** “Apple is our client”; “we ingested Apple's live network”; “the agents autonomously solved the launch”; “we saved Apple $612 million”; “the plan is globally optimal”; “the crisis probabilities are calibrated”; or “the portal is production-ready.”

The purpose of this guide is to make those boundaries clear enough that you can improve the product deliberately, rather than letting a finished-looking interface conceal unfinished decision machinery.
