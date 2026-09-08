# tanjnx: capabilities, gaps, and improvement roadmap

Reviewed: 8 September 2026
Application source: `maya`, commit `9cb0ae5a5d3da7f6c93f3e8a6fade3d799a33dd8`
Purpose: explain what the application already does, assess how convincingly it supports real work, and define how to make it substantially better.

## 1. Overall assessment

**tanjnx already has a substantial, connected supply-chain decision-workspace prototype. Its strongest asset is the relationship between project context, specialist applications, variables, evidence, agent activity, and human review. Its largest unfinished part is the execution layer underneath that experience.**

A user can navigate ten company scenarios, inspect detailed project and portfolio networks, explore methods and variables, compare decision branches, change calculator inputs, filter sample tables, send Playground messages, and inspect attributed activity. These are implemented interactions, not just presentation slides.

However, the interface currently runs mostly on browser state, predefined records, and illustrative calculations. It does not yet ingest operational datasets, fit statistical models to those datasets, execute optimization solvers, run autonomous agents, authenticate individual enterprise users, enforce durable project policies, or close the loop with operational systems.

The next large improvement should be **one trustworthy, complete decision cycle**: receive data, establish its meaning, diagnose an issue, calculate alternatives, explain uncertainty, obtain an attributable approval, and measure the outcome. More cards, bubbles, agent identities, or nominal observations will have less value until that cycle works.

### How to interpret this review

- **Implemented interaction:** the user can perform an action and see a real local state change or navigation result.
- **Deterministic calculation:** executable code transforms inputs into outputs, but it is not necessarily a validated business or statistical model.
- **Fixture / walkthrough:** predefined data, generated examples, timed playback, or a receipt illustrating a future workflow.
- **Production capability absent:** the required persistent service, integration, model execution, or enforcement is not present in the reviewed application source.

These descriptions can apply to different parts of the same screen. An interactive chart can still display fixture results.

The review covers source code, model behavior, configuration, rendered-route tests, and the existing automated suite. It is not an exhaustive manual browser click-through, an external security assessment, or a verification of the currently hosted version. The prior publication remained pending; this document describes the local commit above. No application functionality was changed for this review.

## 2. What is actually present

### Application structure

```text
Workspace
├── Clients & projects
│   └── Client / sector / project
│       ├── Overview
│       ├── Decisions → case detail → review
│       ├── Data → sources / project knowledge graph
│       ├── Controls
│       ├── Playground application
│       ├── Mounted specialist applications
│       └── Selected agent / team member accountability
├── Operations World
│   ├── Global / regional network operations and map
│   └── Global knowledge graph / chokepoints / scenario draft
├── Variables & Methods
└── Case studies
    ├── Embedded walkthroughs
    └── Standalone HTML presentation

Additional route: /table → project table profile and sample filtering
```

The visible project tabs are **Overview, Decisions, Data, Controls**. Playground is an application entry. The application catalog contains eleven specialist definitions; adding Playground gives twelve application experiences. These are not twelve independently deployed services.

### Verified inventory

Counts below were calculated from the current exported models. They describe records materialized by the demo, not connected enterprise data volumes.

| Area | Actual current inventory | Interpretation |
|---|---:|---|
| Company scenarios | 10 clients and 10 projects | One seeded project for each real-company-inspired case |
| Specialist catalog | 11 app definitions | Playground is separately represented in navigation |
| Project app mounts | 109 | Sum of mounted specialist IDs across projects |
| Agent definitions | 12 | Reused across projects with project-specific activity |
| Collaborator profiles / memberships | 13 / 40 | Four membership records per seeded project |
| Seeded work sessions | 30 | Three per project |
| Seeded messages / activity records / app runs | 190 / 450 / 149 | Demonstration history, not executed production work |
| Project datasets | 60 | Six dataset definitions per project |
| Project network nodes / edges | 1,990 / 3,490 | 199 nodes and 349 edges in every project |
| Operating stages / checkpoints | 8 / 16 per project | 160 checkpoint records in total |
| Taxonomy | 481 L0 + 60 L1 + 35 L2 | 576 searchable definitions |
| Analytical method catalog | 30 methods | M-01 through M-30; catalog coverage is not runtime coverage |
| Decision patterns / constraint families | 12 / 12 | Reusable formulation guidance |
| Probability behavior classes | 6 | Reference framework for uncertainty modeling |
| World map | 43 locations, 42 corridors | Bundled geography and modeled routes |
| Transport model | 96 assets, 240 cargo lots | Actual fixture arrays behind map/list views |
| Transfer / network-change records | 72 / 72 | Deterministic event records |
| Map time frames / trajectories | 9 / 3 | Past and future frames; current, no-action, recommended response |
| Standalone table explorer | 96 generated sample rows per opened table | The displayed registered row count can be much larger |

**Important distinction:** a displayed value such as “684K registered rows,” “21.089M observations,” or “118,820 entities” is currently a declared fixture quantity. It should not be confused with the number of queryable records or rendered graph objects.

Sources: [workspace model](app/workspace-model.ts), [case-study model](app/case-study-model.ts), [activity model](app/project-activity-model.ts), [statistics](app/statistical-model.ts), [network operations](app/network-operations-model.ts), [taxonomy](app/taxonomy-catalog.generated.ts), [methods](app/or-methodology.ts).

## 3. How the product feels from a user's perspective

| User and question | Current experience | What would make it useful in daily work |
|---|---|---|
| Portfolio leader: “Which client commitments need attention?” | Browse projects, health, cases, global map, and connected networks. | Rank actual exceptions by value, urgency, owner, and decision deadline; show changes since the last visit. |
| Supply planner: “What breaks if this site is unavailable?” | Inspect a node, its paths, risk, lead time, and associated project. | Trace affected orders through dated inventory, qualified alternates, capacities, and commitments; calculate when shortages begin. |
| Analyst: “What distribution should represent this lead time?” | Open Statistical Studio, see a named distribution, profile, histogram, and Markov matrix. | Fit candidate models to an identifiable dataset version and explain diagnostics, uncertainty, and operational consequences. |
| Data steward: “Can I trust this file?” | Walk through filename staging, schema/mapping previews, and a session receipt. | Read real content, validate keys and units, quarantine bad rows, review mappings, and publish a versioned dataset. |
| Procurement owner: “Which alternate can I actually use?” | Inspect a synthetic shortlist and qualification/performance profiles. | Separate technically qualified, commercially available, contractually reserved, and deliverable capacity. |
| Executive approver: “What am I approving?” | View a recommendation, alternatives, evidence, and a release gate. | Approve a fixed decision version with named inputs, constraints, financial exposure, expiry, and a durable signature. |
| Agent user: “Investigate this shortage for me.” | Send a brief, mention agents, attach filenames, watch timed work steps, inspect results. | Run authorized tools, see their actual progress and artifacts, stop/resume the work, and retain the result after refresh. |

The user experience should be built around these questions. The app catalog is a useful toolbox; the decision being made should remain the main organizing concept.

## 4. Shared capabilities already implemented

### 4.1 Workspace, navigation, and identity

**Present:** searchable client/project hierarchy; By client and By tower grouping; collapsible rail; selected ancestry; project-scoped app navigation; URL state for project, case, app, session, and run; browser history handling; search dialog; notifications; light/dark preference; Aakash Roy / Super Admin profile; semantic app icons; client marks; sector and agent colors.

The main navigation resolver rejects invalid project ancestry instead of silently selecting a different project. Project tabs disappear on application routes. These are valuable behavior contracts to preserve.

**Improve:** save user workspaces and views, support favorites and recent decisions, add a useful exception inbox, and make long names discoverable without further reducing text size. Resolve the inconsistent table-route fallback described later. Keep a small set of semantic size and spacing tokens instead of adding more CSS overrides.

Sources: [PlatformShell](app/PlatformShell.tsx), [navigation](app/navigation.ts), [project path](app/project-path-model.ts), [VisualIdentity](app/VisualIdentity.tsx), [WorkspaceHome](app/WorkspaceHome.tsx).

### 4.2 Client and project onboarding

**Present:** controlled new-client and new-project forms; required context and governance fields; deterministic ID generation; collaborator/membership drafts; empty projects; explicit data readiness before app execution; retained map context when an issue seeds a project.

**Limit:** created records are held in application memory. The walkthrough does not establish an enterprise tenancy, send invitations, provision data access, or persist the project. Completing the data walkthrough creates an illustrative variable pack rather than interpreting the user's dataset.

**Improve:** durable drafts, a project template appropriate to the sector, identity-backed invitations, one real data-import path, and explicit checks before each application becomes usable. New projects should work in Data, Statistics, and the graph without requiring a hard-coded case-study profile.

Sources: [WorkspaceOnboarding](app/WorkspaceOnboarding.tsx), `createSessionClient`, `createSessionProject`, and `evaluateProjectAccess` in [workspace-model](app/workspace-model.ts).

### 4.3 Project overview

**Present:** evidence-linked KPIs, decision preview, mounted app relationships, project footprint, and links to deeper work. The repeated project-name hero has been removed from the visible project flow.

**Improve:** an “attention now” overview with three questions: what changed, what is affected, and what decision is due? Replace static footprint emphasis with unresolved evidence, stale models, blocked approvals, and the next accountable action. Derive totals from the same records the user can inspect.

Source: `OverviewPanel` in [ProjectWorkspace](app/ProjectWorkspace.tsx).

### 4.4 Decisions and review

**Present:** D0/D1/D2/D3 decision levels; Git-style branch visualization; alternative selection and comparison; owners; evidence references; a case workspace; lifecycle stages; simulated approval/rework gates; a task-plan view; session snapshot receipts.

**Limit:** this is not yet an editable, persisted decision version graph. Branch names and merge presentation are assigned from fixed node IDs. For example, the displayed two-parent merge at D3-A is a rendering convention rather than a stored merge operation. Some approval labels are inferred from lifecycle stage.

**Improve:** immutable decision revisions with actual parent IDs, input diffs, rationale, assumptions, dissent, rejected alternatives, signatures, and expiry. Any changed source, constraint, or recommendation should invalidate the relevant prior approval. Keep decision history separate from evidence relationships while linking them by stable IDs.

Sources: `DecisionPanel` in [ProjectWorkspace](app/ProjectWorkspace.tsx), [DecisionWorkspaces](app/DecisionWorkspaces.tsx), `decisionsFor` in [workspace-model](app/workspace-model.ts).

### 4.5 Data, knowledge graph, and table exploration

**Present:** a unified Data entry; source/graph modes; search; dataset and document metadata; a six-stage ingestion walkthrough; source connector drafts; multilevel supply-chain nodes and directed edges; node and edge inspectors; checkpoints; evidence links; table nodes with statistical profiles and sample heads; a separate table route with column/text/minimum filters.

**Limit:** upload handling reads the filename, not file contents. The standalone table page generates 96 rows. Its export action opens the print dialog. There is no full-table query engine, SQL execution, row-level ingestion, document extraction, or persisted graph store.

**Improve:** a versioned data product with schema, grain, units, source time, lineage, quality checks, and an actual queryable dataset. In the graph, represent the table and its columns, keys, transformations, and derived models. Keep large fact tables in tabular storage and retrieve relevant slices; representing every fact row as a bubble would make both analysis and navigation worse.

Sources: `setUploadFile`, `nextUploadStage`, and `ProjectDataWorkspace` in [ProjectWorkspace](app/ProjectWorkspace.tsx); [ProjectSupplyChainExplorer](app/ProjectSupplyChainExplorer.tsx); [TableExplorerClient](app/table/TableExplorerClient.tsx).

### 4.6 Operations World

**Present:** global and regional scope; APAC, Europe, Americas, and MEA operating views; map layers; locations, routes, assets, cargo, and transfers; time/scenario selection; inspection and project intake; a combined client graph; graph/chokepoint modes; color/size/filter controls; path inspection; a global scenario form.

**Limit:** map playback advances modeled states, not live feeds. The combined graph unions project networks and adds company-to-company links when their node countries overlap. It does not resolve the same physical supplier across projects. The global scenario result cards are constants.

**Improve:** a shared entity registry, explicit relationship semantics, materialized views based on the user's access, deduplicated common dependencies, and a portfolio scenario engine. Separate shared exposure to a country from actual supplier, capacity, or contract relationships.

Sources: [ScopeDashboard](app/ScopeDashboard.tsx), [WorldNetworkMap](app/WorldNetworkMap.tsx), [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx).

### 4.7 Variables & Methods

**Present:** a searchable registry of all 576 taxonomy definitions and 30 methods; L0/L1/L2/method filters; domain filtering; meanings, examples, related codes, formulation, techniques, outputs, validation guidance, and limitations.

**Improve:** attach data type, allowed units, valid ranges, observation grain, aggregation rules, owner, version, aliases, and examples of actual project use. Show which datasets populate each variable and which models consume it. Treat taxonomy IDs as references; do not substitute an ID for a unit or business definition. Add direct links to a selected definition and report orphaned or ambiguous mappings.

Sources: [VariablesCatalog](app/VariablesCatalog.tsx), [taxonomy catalog](app/taxonomy-catalog.generated.ts), [taxonomy source document](SUPPLY_CHAIN_VARIABLE_TAXONOMY.md), [or-methodology](app/or-methodology.ts).

### 4.8 Agents, team accountability, and Playground

**Present:** compact terminal-style transcript; one-line composer; agent mentions; command/attachment controls; auto-scrolling; fullscreen; collapsible session/context panels; cancel/replay/advance; steering actions; project-specific conversations; run links; agent-builder manifests; immutable local rerun/fork behavior; selected-person accountability.

The accountability panel distinguishes exactly attributed activity from participation in a session. That distinction is useful and should remain when real agents are introduced.

**Limit:** visible work follows a predefined seven-step sequence advanced by a timer. Attachment selection retains filenames. Skill/MCP/tool names are manifest text, not connected execution. Agent experience, calibration, and approved-run figures are fixtures. No model service performs the apparent thinking or searching.

**Improve:** real tool events and retained artifacts; durable conversations; actual upload references; run cost and time budgets; per-tool permissions; pause/resume/cancel semantics; bounded retries; failure explanations; evals for citations, arithmetic, and tool choice. Show concise work summaries and tool results rather than attempting to expose private model reasoning.

Sources: `traceStepsFor`, `AgentPanel`, and builder controls in [ProjectWorkspace](app/ProjectWorkspace.tsx); [activity reducer](app/project-activity-model.ts); [WorkIdentityInspector](app/WorkIdentityInspector.tsx).

### 4.9 Controls and evidence

**Present:** six interactive policy-draft toggles; Enforce/Audit/Shadow selection; approval quorum; retention selection; configuration receipt; a local policy test; evidence inspection; project access checks in client logic; model/input fingerprints; exact-run evidence references.

**Limit:** changing these controls does not configure an enforcement service. The local policy test counts enabled required controls. Its quorum and retention settings are not connected to actual signed approvals or storage. The small receipt ledger is not an immutable audit system.

**Improve:** a shared policy service consulted by reads, runs, exports, and approvals; immutable evidence artifacts; authenticated approval records; source validity and staleness propagation; content hashes computed from actual inputs; durable event history. Site-level access and project-level authorization need separate verification.

Sources: `GovernancePanel` in [ProjectWorkspace](app/ProjectWorkspace.tsx), [workspace access/evidence contracts](app/workspace-model.ts), [PlatformShell receipt ledgers](app/PlatformShell.tsx).

### 4.10 Case studies and explanations

**Present:** ten public-information-inspired company scenarios, distinct products and disruptions, response narratives, constraints, method stacks, dataset descriptions, timelines, and embedded/standalone walkthroughs.

**Improve:** let users replay each case against generated underlying records, inspect a failed alternative, change a material assumption, and see why the recommendation changes. Keep actual public sources separate from simulated operational assertions. Label advertised outcome improvements as simulated until measured from a reproducible run.

Sources: [case-study library](app/case-studies/page.tsx), [HTML presentation](public/tanjnx-case-studies.html), [case-study-model](app/case-study-model.ts).

## 5. Review of every application

| Application | What works today | Principal limitation | Highest-value next implementation |
|---|---|---|---|
| **Playground** | Messaging, mentions, filenames, run playback, steering, session fork, trace/result/run inspectors, fullscreen. | Scripted agent work; no model or tool execution; conversations are not durable. | Execute an evidence-retrieval and statistical-analysis workflow through authorized tools, with persisted events and artifacts. |
| **Risk Radar** | Criticality/probability bubbles, category and horizon filters, dependency selection, sorted cases, evidence/review links. | Five generic dependency rows and shared scores/exposures are relabeled for projects; horizon uses a multiplier. | Derive exposures from orders, BOM paths, inventory, lead-time distributions, and disruption duration; show time to impact and confidence. |
| **Network Optimizer** | Five workbench stages, twelve decision patterns, thirty method descriptions, editable inputs, deterministic response calculation, constraint checks, stale-run detection, fingerprint and release view. | Scalar response formula rather than a network solver; no solved allocation model, bound, gap, or scenario draw archive. | A time-indexed sourcing/allocation model with capacities, inventories, demand, substitution, cash, service, and reproducible solver status. |
| **Statistical Studio** | Dataset/method selection, profiles, histogram illustration, Markov matrix inspection, evidence receipts, table link, optimizer-contract draft. | Hash-assigned statistics/distributions; fixed histogram and transition matrix; selected method does not execute a different algorithm. | Compute descriptive statistics and fit diagnostics from actual selected rows, then pass a versioned uncertainty artifact to the optimizer. |
| **Flow Lens** | Working-capital, order-to-cash, and margin bridges; unit/period controls; exception/action selection. | Shared bridge values scaled by fixed factors; no transaction reconciliation or currency/time basis. | Reconcile inventory, receivables, payables, freight, and commitments to source transactions; connect actions to service and cash consequences. |
| **Demand Sense** | Weekly/monthly/quarterly views, scenario and family filters, forecast scaling, prior-version comparison, visible supply gaps. | Shared base series and fixed accuracy figures; no trained forecast, hierarchy reconciliation, or backtest. | Forecast by SKU/location/channel; reconcile aggregation levels; evaluate bias and uncertainty with rolling holdouts. |
| **Supplier Graph** | Supplier profiles, dependency context, requirement selection, alternate candidates, local shortlist, quality/OTIF evidence views. | Generic performance profiles and alternate scores; no verified identity or usable-capacity calculation. | Resolve supplier/site identity; model grade qualification, expiry, capacity reservations, ownership concentration, and common sub-tier exposure. |
| **Mineral Atlas** | Four minerals, country selection, scenario selection, reserve/refining/cost cards, dossier and gate receipts. | Shared country and mineral constants; scenario action records a receipt rather than recalculating flows. | Distinguish resource, reserve, mine output, refining throughput, grade, yield, and qualified supply; model route and origin eligibility. |
| **Workforce Studio** | Skill/shift coverage table, 42-cell shift view, roster choices, fatigue illustration, selected-capability detail. | Repeated staffing counts and costs; no employee calendar or schedule solver. | Skill/certification-based assignment with shifts, labor rules, fatigue, travel, training lead time, and cost. |
| **Manufacturing Twin** | Five process cells, utilization views, plan selection, Gantt illustration, bottleneck inspector, replay/work-package receipts. | Fixed capacity/WIP/output figures; no discrete-event execution or finite-capacity scheduling. | Calibrated routings, calendars, yields, queues, failures, changeovers, and executable production sequencing. |
| **Logistics Radar** | Four transport-mode assets, time selector, route/hub selection, cargo inspector, route-draft and QR receipts. | No carrier feed; several KPI values are copied by project-metric position and can have incompatible units. | Shipment-leg and custody-event model, valid units, time-varying ETA distributions, alternate routes, and attributable handoffs. |
| **Quality Genealogy** | Four batch stages, selection, deviation/release illustration, certificate/trace detail, evidence receipts. | No actual test results, signed certificate validation, split/merge quantity balance, or release enforcement. | Lot-level transformation graph with quantities, samples, specifications, certificates, containment, recalls, and authorized release. |

Sources: [ApplicationViews](app/ApplicationViews.tsx), [OptimizationWorkbench](app/OptimizationWorkbench.tsx), `solveNetworkPlan` in [platform-model](app/platform-model.ts), [ProjectAppStudios](app/ProjectAppStudios.tsx), [ProjectWorkspace](app/ProjectWorkspace.tsx).

**Catalog integration needs attention.** `projectApps`, the five legacy `applications`, and `applicationBlueprints` represent different slices of the product. The blueprint/change catalog covers seven older surfaces. One shared application registry should define name, routes, applicability, inputs, outputs, tool capability, methods, permission requirements, and actual readiness for all applications.

## 6. Are the ten company projects sufficiently different?

The narratives, stages, labels, selected variables, shocks, and response proposals differ. That is a useful starting point. **The underlying network structure is much more uniform than the stories suggest:** every case currently has eight stages, 199 nodes, 349 edges, sixteen checkpoints, and six dataset definitions. Several specialist screens reuse the same numeric templates across all clients.

The next dataset expansion should emphasize different operational structures and reconciled transactions, not a larger count attached to the same template.

All scenarios below remain simulations. These are suggested data/model improvements, not assertions about actual company operations or engagements.

| Company / current project | Existing scenario | Data that would make it materially more realistic | Decision and success measure |
|---|---|---|---|
| **Apple / Launch Continuity** | Taiwan tension, rare-earth controls, scarce airfreight; assembly and component alternatives. | Multi-level BOM by launch configuration; component-to-fab/package dependencies; qualified assembly lines; yields; magnet grade; market launch dates; dated air-capacity options. | Allocate scarce components to configurations and markets while preserving launch priorities; measure on-time units, constrained demand, and cost of delay. |
| **Coca-Cola / Water-to-Shelf Availability** | Drought, aluminum cost shock, fuel blockade; packaging/bottler changes. | Watershed/site water limits; beverage recipes; bottler capacities; returnable-bottle cycles; package compatibility; concentrate transfers; route inventory; shelf-life constraints. | Maintain priority SKU fill rate within water, packaging, production, and transport limits; measure liters/units served and water per unit. |
| **Gucci / Traceable Seasonal Collection** | Origin evidence failure, artisan loss, Red Sea delay; lot quarantine and launch resequencing. | Material provenance; lot certificates; artisan skill hours; SKU/collection launch windows; approved material substitutes; regional assortment commitments; repair/reuse flows. | Maximize evidence-complete release before collection deadlines; measure valid traceability, late SKUs, margin impact, and rework. |
| **Tata Motors / Vehicle Programme Continuity** | Semiconductor cut, route congestion, tier-two insolvency; alternate controllers and build rebalancing. | Vehicle option/BOM compatibility; part qualification and approval lead time; line calendars; plant capacity; service-part obligations; supplier cash exposure; dealer demand. | Produce configuration-complete vehicles while protecting service supply; measure lost builds, service fill rate, inventory, and working capital. |
| **Tesla / Closed-Loop Battery Scale** | Graphite restrictions, lithium volatility, recycling ramp delay. | Chemistry-specific recipes; grade/yield constraints; cell and pack routings; recycled-feedstock recovery rates; qualification status; scrap/rework; service-pack demand. | Select feasible feedstock and capacity allocations; measure qualified cell output, service coverage, cost tail, and recovered-material share. |
| **BYD / Global Launch & Localization** | Tariffs, content rules, vessel scarcity, demand shifts. | Country/variant BOMs; declared origin; dated rule assumptions; local assembly ramp curves; battery/trim capacities; homologation milestones; vessel windows; market demand. | Choose localization and export allocations; measure launch attainment, landed cost, rule eligibility, and stranded inventory. |
| **Hershey / Cocoa-to-Seasonal-Shelf** | Crop loss, cocoa price shock, traceability exception. | Origin/harvest/lot data; bean quality; recipe and allergen constraints; production campaigns; seasonal demand peaks; source verification; hedge assumptions; shelf-life. | Allocate eligible cocoa and plant capacity to seasonal commitments; measure shelf availability, unsupported lots, spoilage, and contribution margin. |
| **TSMC / Fab Recovery & Allocation** | Earthquake, water restriction, specialty-chemical delay. | Re-entrant wafer routes; tool qualifications; work-in-process by operation; utility constraints; lot priority; cycle-time histories; yield; chemical batch suitability; recovery states. | Sequence recovery and eligible lots under tool/utility constraints; measure customer commit, cycle time, qualified output, and recovery duration. |
| **Airbus / Aircraft Ramp Continuity** | Engine/forging/aerostructure shortfalls; build sequence and supplier recovery. | Aircraft serial/configuration records; component effectivity; certified alternates; long-lead engine/forging positions; incomplete-aircraft inventory; line slots; change/rework cost. | Prioritize configuration-complete aircraft; measure executable deliveries, incomplete inventory, schedule disruption, and recovery cost. |
| **Pfizer / Critical Medicine Continuity** | API disruption, excursion, route closure; validated capacity and patient-priority allocation. | Approved site/product registrations; API and batch genealogy; stability limits; temperature histories; release tests; expiry; cold-chain capacity; governed service priorities. | Allocate only eligible released supply through valid cold-chain paths; measure service by priority, excursion losses, expiry, and validation coverage. |

Each sector also needs its own topology: re-entrant semiconductor flows, reverse battery flows, seasonal luxury collections, beverage return loops, aircraft configuration effectivity, and regulated medicine batch release should not all be represented as the same eight-stage network.

## 7. Concrete findings to address first

Priority definitions: **P0** = resolve before presenting the output as trustworthy operational analysis; **P1** = required for a useful persistent pilot; **P2** = expansion and refinement. These priorities are an assessment, not production incident severities.

### F01 — Statistical output is not calculated from the displayed data · P0

`numericColumn` derives means, standard deviations, distribution families, missingness, and fit scores from a hash of identifiers. `statisticalRowsFor` separately produces a sine/pulse sequence. The resulting records do not establish the claimed distribution or diagnostics.

A direct probe of Apple's **Launch demand contract / L0-001** found:

| Measure | Profile shown | Actual 96 generated rows |
|---|---:|---:|
| Mean | 56.05 | Approximately 56.17448 |
| Standard deviation | 11.21 | Approximately 9.38020, sample SD |
| Missingness | 2% | 0 missing values |
| Distribution | Negative binomial | Decimal-valued sine/pulse-generated values; no fitting step |
| Registered rows | 684K | 96 materialized samples in the explorer |

The problem is not that a sample mean must exactly equal a population parameter. The problem is that the profile, generator, distribution label, and diagnostics are not derived from a coherent statistical process.

**Completion criterion:** every displayed statistic can be reproduced from the named input snapshot or documented generative model; model fitting records its method and diagnostics; missingness and sample/full-data scope are explicit.

Source: [statistical-model](app/statistical-model.ts), `StatisticalStudio` in [ProjectAppStudios](app/ProjectAppStudios.tsx).

### F02 — Interval label is mathematically inconsistent · P0

The statistics inspector labels `P05–P95` a “95% predictive interval.” Those quantiles span the central **90%**, when they are genuine distribution quantiles. A central 95% interval would use P2.5 and P97.5. Moreover, these current quantiles are generated values, not validated predictive coverage.

**Completion criterion:** store interval coverage and quantile bounds together; display the correct coverage; evaluate observed coverage on held-out outcomes; distinguish prediction intervals, parameter confidence intervals, and service probabilities.

Source: `StatisticalStudio` in [ProjectAppStudios](app/ProjectAppStudios.tsx).

### F03 — Global scenario controls do not calculate the result cards · P0

The global scenario action changes a status string and emits a receipt. The displayed **96.1% P95 service, $2.84B protected value, 17 shared chokepoints, and 8.4% tail-loss reduction** are hard-coded. Objective, shock, horizon, and graph filters do not produce those numbers.

**Completion criterion:** a run consumes a fixed network/data snapshot and scenario configuration, calculates outputs, records its scope, and marks old outputs stale when inputs change. Until then, label the whole result panel as an example rather than a run outcome.

Source: `global-optimizer` in [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx).

### F04 — Project optimization and resilience stories overstate computational depth · P0

The project calculator genuinely responds to several inputs and checks constraints, which is stronger than the global panel. Nevertheless, `solveNetworkPlan` applies heuristic factors, including hash-derived adjustments for case/method/context IDs. It does not solve the selected network's material-flow model.

Separately, case-study P50/P90/P95/CVaR outcomes are copied from seed values. The timeline says “Replayed 2,000 seeded scenarios,” but the reviewed case-study construction does not materialize or evaluate those 2,000 draws. Selecting an M-code does not execute that method.

**Completion criterion:** store the scenario draws, objective, constraints, feasible alternatives, losses, and calculated quantiles; report reproducible solver status only when a solver actually runs. An unchanged mathematical problem must not change its answer because its display ID was renamed.

Sources: `solveNetworkPlan` in [platform-model](app/platform-model.ts); `timelineFor`, `caseStudyProfiles` in [case-study-model](app/case-study-model.ts).

### F05 — Some app metrics have the wrong semantic type · P0

Logistics Radar uses `project.metrics[3].value` as **Transfer dwell**. A project's fourth metric can be money or value protected rather than time. **Delayed cargo** similarly reuses `project.metrics[1]`, whatever that metric means. Shared generic categories, costs, units, and percentages also appear in other apps.

**Completion criterion:** bind metrics by typed semantic keys, never array position. A dwell metric must have a duration unit; a quantity must include its product/UOM; a ratio must have a defined numerator and denominator. Reject incompatible mappings visibly.

Source: `LogisticsRadar` in [ProjectAppStudios](app/ProjectAppStudios.tsx), [ApplicationViews](app/ApplicationViews.tsx).

### F06 — Shared geography is not an actual cross-company supply relationship · P0

The global graph adds a link when two project networks contain nodes in common countries. It assigns that contextual link a fixed risk score of 72. This shows possible common exposure, not evidence that one company supplies another or that the two share a specific supplier. Rendering such a link in “Supplies” can imply unsupported directionality.

**Completion criterion:** distinguish `shares_exposure_to`, `supplies`, `owns`, `located_in`, and `competes_for_capacity` relationships. Represent a common facility/corridor explicitly, with identity resolution and provenance. Do not treat an inferred country overlap as a verified supplier edge.

Source: hub-pair construction in [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx).

### F07 — User work is not durable · P1

Projects, client drafts, session messages, app runs, approvals, and receipts mainly live in React state. Theme is kept in local storage; navigation preferences use session storage. Retaining state during component navigation does not mean work survives a page reload, a new browser, or a server restart.

**Completion criterion:** a user can refresh, sign in elsewhere, and resume the same saved project/run with consistent version history. Recovery behavior must be tested.

Source: state initialization in [PlatformShell](app/PlatformShell.tsx), [project-activity-model](app/project-activity-model.ts).

### F08 — Table routing violates the main navigation convention · P0

`/table` falls back to the first project when the supplied project ID is missing/invalid, and to that project's first table when the table ID is invalid. Main application navigation instead rejects invalid explicit project context. Silent fallback can cause the user to believe the wrong table is the requested one.

**Completion criterion:** resolve both project and table explicitly; return a useful not-found/access state for invalid or unauthorized combinations; apply the same project policy used by other routes.

Source: [table/page.tsx](app/table/page.tsx).

### F09 — Project access is a client-side model, not enterprise security · P0 before real data

The app defines meaningful memberships and capability checks, and tests many invalid routes. However, the signed-in identity is seeded, data is bundled, and there is no application-owned authenticated backend authorization boundary. Hosting access, if configured, does not establish permission for every project's records.

**Completion criterion:** authenticated identity and server-side authorization on every data read, run, export, graph expansion, and mutation. Client views should receive only authorized records. Follow least privilege and validate permissions for every request, consistent with [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Sources: [workspace-model](app/workspace-model.ts), [PlatformShell](app/PlatformShell.tsx), [hosting binding](.openai/hosting.json).

### F10 — Controls are not coupled to the approval/execution path · P0 before real actions

Governance toggles, quorum, retention, and audit entries are local to `GovernancePanel`. They do not govern the separate `ActionRoom` release handler. “Signed” and “Verified” labels can be inferred from reaching an approval stage rather than recorded approval events.

**Completion criterion:** one versioned policy determines both visible controls and actual enforcement. Every displayed signature must resolve to an authenticated actor and decision version. An expired approval or changed recommendation blocks execution.

Sources: `GovernancePanel` in [ProjectWorkspace](app/ProjectWorkspace.tsx), `ActionRoom` in [DecisionWorkspaces](app/DecisionWorkspaces.tsx).

### F11 — Rerun lineage is stronger than rerun computation · P0

Run forking and immutable IDs are implemented and tested. But `recalculateOutputs` only changes the first percentage output when `service_floor` changes. Other changed fields can yield a new run and new evidence IDs while numeric outputs remain copied.

**Completion criterion:** each supported input is consumed by its app's calculation; unsupported changes are rejected or explicitly marked non-computational. A new run must reference the calculation it executed, not imply computation merely by receiving a new ID.

Source: `recalculateOutputs`, `planAppRerun`, and reducer logic in [project-activity-model](app/project-activity-model.ts).

### F12 — Handoffs frequently end at a receipt, not at a downstream artifact · P1

“Send distribution contract to Network Optimizer,” capacity/route drafts, maintenance packages, QR handoffs, and several approval actions record explanatory text. This is honest in many receipts, but the destination does not receive a typed, versioned object that changes its work.

**Completion criterion:** a handoff creates a resolvable artifact with input/output IDs, status, owner, and version; the destination loads that exact artifact or shows why it cannot.

Sources: [ProjectAppStudios](app/ProjectAppStudios.tsx), [PlatformShell](app/PlatformShell.tsx).

### F13 — New-project data workflows are only partially generalized · P1

The upload walkthrough can unlock a browser-created project by adding a generic variable pack. Statistical profiles, however, come from `caseStudyProfileFor(project)`, which only recognizes the seeded portfolio. Statistical Studio returns an empty view when no table profile exists. The global graph also builds from recognized case profiles.

**Completion criterion:** a newly created project with one published dataset can use the same table, graph, statistics, agent, and optimization contracts as a seeded project; unsupported states must be explicit and actionable.

Sources: `nextUploadStage` in [ProjectWorkspace](app/ProjectWorkspace.tsx), [statistical-model](app/statistical-model.ts), [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx).

### F14 — Graph scale and client diversity are partly cosmetic · P1

The latest graph has responsive sizing, clickable paths, and a continuous bubble field. Its positions are still deterministic angular/radial formulas. It is not a force simulation, and all projects have the same size/topology pattern. Rendering 1,990 nodes does not demonstrate handling hundreds of thousands of operational entities.

**Completion criterion:** relationship-driven layout, semantic zoom, useful aggregation, actual per-sector topologies, and measured pan/filter/render latency on a stated dataset and device. Keep one understandable graph with multiple lenses.

Sources: [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx), [ProjectSupplyChainExplorer](app/ProjectSupplyChainExplorer.tsx), `networkFor` in [case-study-model](app/case-study-model.ts).

### F15 — Evidence metadata does not yet establish reproducibility · P1

Evidence receipts are a strong product feature: claim, source, grain, inputs, version, agent, reviewer, and access are represented. Many locators and content hashes are descriptive fixture strings, however. A generic receipt cannot prove that a displayed value was computed from a particular dataset.

**Completion criterion:** store exact input versions, code/model version, parameters, execution status, output artifact, and hashes of the actual content. Traversing a result should reach the source rows or licensed source artifact used for that result.

Sources: `evidenceFor`, `fixtureEvidenceFor` in [workspace-model](app/workspace-model.ts), activity evidence mapping in [ProjectWorkspace](app/ProjectWorkspace.tsx).

### F16 — Documentation and totals have drifted from the product · P1

The README still describes Maya, an old fictional portfolio, old identity/provider names, “Data & graph,” and Playground as a project tab. `portfolioTotals` contains declared counts such as 90 mounts while the current portfolio mounts 109 specialist apps. Some test names also describe earlier app counts.

**Completion criterion:** generate counts from the canonical catalogs, document the current architecture, retain legacy compatibility only with explicit purpose, and distinguish represented scale from materialized data volume.

Sources: [README](README.md), `portfolioTotals` in [workspace-model](app/workspace-model.ts), [application-catalog](app/application-catalog.ts).

### F17 — CSS and large components make consistency expensive · P1

At the reviewed commit, `globals.css` has about 7,940 lines and 486 `!important` occurrences. PlatformShell and ProjectWorkspace each exceed 1,100 lines. There are separate graph and application implementations with overlapping responsibilities. This does not by itself prove a rendering bug, but it makes the repeated spacing/theme regressions easier to introduce and harder to fix safely.

**Completion criterion:** shared layout, metric, toolbar, inspector, theme, and typography primitives; explicit app boundaries; consolidated graph interaction utilities; removal of obsolete overrides after regression validation. Refactor incrementally around behavior already covered by tests.

Sources: [globals.css](app/globals.css), [PlatformShell](app/PlatformShell.tsx), [ProjectWorkspace](app/ProjectWorkspace.tsx), [DataOperations](app/DataOperations.tsx).

### F18 — Tests verify useful contracts but not operational truth · P1

All 104 existing tests pass. They include real model/reducer checks and server-rendered route checks, but many UI tests check source text, CSS selectors, or handler names. Such tests cannot prove that text is readable, an edge is easy to click, a composer is visible, a chart fits the viewport, or a statistical result is valid.

**Completion criterion:** add targeted user-journey tests, reference calculations, persistence/recovery checks, project-boundary tests, and visual/interaction checks for the graph and terminal. Treat scientific validation as a separate requirement from UI tests passing.

Sources: [tests](tests), especially [rendered HTML tests](tests/rendered-html.test.mjs), [UI contracts](tests/ui-contract.test.mjs), [scenario tests](tests/scenario-model.test.mjs).

## 8. Make the graph a better analytical tool

The supplied [Leonardo Boquillon graph](https://leonardo-boquillon.com/ai-semiconductor-supply-chain) is a useful interaction reference. Its graph/chokepoint views, search, color controls, and fit/zoom controls align with the direction of tanjnx. Visual resemblance alone will not answer supply-chain questions; the data relationships and exploration behavior must be equally strong.

### Recommended graph behavior

1. **Start with a useful overview.** Show company/site/supplier/corridor clusters, summarized exposure, and selected labels. Expand detail on demand. Do not force all labels into the first view.
2. **Use relationship-driven positioning.** Compute a stable layout from actual adjacency, with collision handling, pinned selections, and saved positions. Run expensive layout work outside the main interaction thread. Keep screen coordinates separate from business relationships.
3. **Make both nodes and edges first-class.** Hover previews, persistent selection, enlarged path hit targets, source/target navigation, keyboard alternatives, and a consistent inspector should work in project and global views.
4. **Offer decision lenses.** Supply dependencies, material flow, qualification, cash exposure, geographic shock, capacity competition, and evidence lineage should be filtered views of the same canonical entities.
5. **Show the affected path.** “Why is this customer order exposed?” should reveal the specific supplier → material → operation → inventory → order path, including dates and quantities.
6. **Differentiate relationship certainty.** Verified, inferred, disputed, stale, and scenario-only links need distinct labels and styling. Shared geography should normally connect both companies to the geography, not assert one supplies the other.
7. **Make time meaningful.** Compare before/after a disruption; show newly blocked paths, recovery, and decision effects. Add an as-of date to the network view.
8. **Use the entire work area.** Bound the graph and inspector to the viewport, let the inspector scroll, support fullscreen and resizable panels, and preserve pan/zoom when filters change sensibly.
9. **Provide a non-graph route.** A searchable relationship table, upstream/downstream lists, and ranked chokepoint register must expose the same facts for users who do not work comfortably in a visual network.
10. **Measure utility.** Time how long it takes to find an affected customer, inspect a selected path, identify a qualified alternate, and explain a chokepoint. These are better success measures than bubble count.

### Important global-network boundary

Combining clients requires an explicit shared-data model. A shared physical supplier can be identified globally while its customer-specific prices, demand, contracts, and decisions remain private. A portfolio view should use authorized records or permitted aggregates. Common suppliers and scarce capacity can connect competitors, so a global allocation feature must have a clear collaboration scope and approval policy.

## 9. Make Statistical Studio a real bridge from data to decisions

The correct workflow is:

```text
Operating question
  → relevant dataset version and grain
  → quality and representativeness checks
  → descriptive statistics and candidate models
  → diagnostics / holdout validation / uncertainty
  → versioned distribution or state-transition artifact
  → scenario generation and Network Optimizer
  → outcome monitoring and recalibration
```

### Build in this order

**A. Descriptive analysis.** Compute row count, valid/missing count, mean, median, standard deviation, quantiles, min/max, duplicate keys, and time coverage from actual data. Make every column's unit and grain visible. Allow subgrouping by site, product, supplier, route, and time window.

**B. Distribution fitting.** Match the candidate family to support and business meaning: counts, bounded proportions, positive durations, continuous measures, and intermittent demand need different treatment. Compare candidates against an empirical baseline; report parameters, sample size, diagnostic plots, and validation results. Separate a goodness-of-fit statistic from a confidence probability.

**C. Engineering statistics.** Add control charts, stability checks, measurement-system considerations, and capability analysis with explicit specification limits. Capability indices require appropriate process/data assumptions; they should not be produced simply because a user selected “Engineering capability.” See [NIST's process-capability guidance](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).

**D. Time and regime changes.** Detect seasonality, trend, structural breaks, supplier changes, and crisis regimes. Distinguish historical observations from an assumed future shock. Provide rolling validation and subgroup diagnostics so a global average cannot hide a failing route or site.

**E. Markov/state models.** Define operational states and transition intervals, count observed transitions, estimate probabilities, and represent uncertainty. Store the current state distribution. Compute one- and multi-step predictions from that state, test dwell-time assumptions, and use a semi-Markov or other model when the simple assumptions are unsuitable. The current fixed 3×3 matrix is only an illustration.

**F. Bayesian updates and simulation.** Record prior assumptions, likelihood/data, posterior, and predictive checks. Pass dependence assumptions as well as marginal distributions to scenario generation. A conflict can simultaneously affect capacity, lead time, cost, and demand; independent draws can underestimate compound exposure.

### Distribution artifact contract

At minimum, a result should include:

```text
artifact_id, project_id, dataset_version, filtered_query, observation_window
variable_id, business_name, unit, grain, sample_size, exclusions
method, method_version, parameters, parameter_uncertainty
fit_diagnostics, holdout_metrics, dependence_group, regime_assumptions
quantile_levels, predicted_quantiles, random_seed_if_used
created_by, reviewed_by, valid_until, limitations, content_hash
```

“Send to Network Optimizer” should transfer this artifact and make its usage visible in the optimizer's next run. If the data is stale or the fit fails, the downstream model should request review instead of silently using the old distribution.

## 10. Produce numbers that support resilience decisions

### Give each number a precise meaning

For every KPI, define the population, horizon, numerator/denominator, currency, unit, aggregation, and uncertainty convention. For example, “service at 95% confidence” and “95th percentile service” are not interchangeable. For a service metric where higher is better, the adverse tail may be the lower tail; define that explicitly.

CVaR must identify the loss variable, tail level, scenario weights, and sample basis. “Value protected” needs a fixed baseline and must avoid counting the same avoided loss in multiple apps.

### Improve scenario mechanics

- Represent disruption onset, duration, escalation, recovery, and aftereffects separately.
- Propagate capacity loss through dated orders, inventory, process yields, transit, and qualified substitutions.
- Couple related shocks: a route closure can change transit time, freight cost, inventory cover, cash timing, and product eligibility together.
- Represent option lead times, expiry, reservation fees, qualification work, and reversibility. An alternate that becomes available after the shortage is not an immediate mitigation.
- Use probabilities only where there is an evidential basis. For severe geopolitical uncertainty, compare stress envelopes and regret across plausible futures rather than fabricate precise odds.
- Preserve quality, safety, eligibility, contractual, and service obligations as explicit constraints. Explain infeasibility when no acceptable plan exists.
- Compare no action, current policy, and multiple feasible responses under the same scenario draws and baseline.
- Store rejected alternatives and binding constraints. Users need to understand why a cheaper-looking response was rejected.

### The minimum useful resilience scorecard

| Measure | What it should answer |
|---|---|
| Service by customer/product and horizon | Which commitments can be met, under which assumptions? |
| Time to survive | How long can current inventory and operations sustain the required service? |
| Time to recover | When does sufficient qualified capacity return? |
| Expected and tail loss | How much could the disruption cost, including adverse scenarios? |
| Cost and cash required | Can the organization fund and execute the response in time? |
| Qualified alternate headroom | What additional supply is usable, available, and not double-reserved? |
| Constraint violations | Which response fails a hard operating rule? |
| Regret / robustness | Which choice performs acceptably across several plausible futures? |
| Evidence age and coverage | How much of the recommendation rests on current, verified information? |
| Actual versus predicted result | Did the intervention deliver the promised benefit? |

The system should be comfortable reporting “no feasible response,” “insufficient evidence,” or “requires qualification.” Those answers are useful decision support.

## 11. Recommended architecture evolution

This is a proposed target architecture, not an implementation description.

```text
Client sources / uploaded files / licensed signals
                     ↓
Ingestion + validation + versioned data products
                     ↓
Canonical entities, observations, relationships, and taxonomy mappings
                     ↓
Project-authorized query layer + authorized global projections
          ┌──────────┼─────────────┐
          ↓          ↓             ↓
      Statistics   Scenarios   Evidence retrieval
          └──────────┼─────────────┘
                     ↓
          Optimization / specialist models
                     ↓
Versioned decision + alternatives + evidence + human approvals
                     ↓
       Controlled execution adapter + monitoring

Playground orchestrates permitted tools across this flow.
Every operation emits an attributable event and refers to durable artifacts.
```

### Core implementation boundaries

| Boundary | Responsibility |
|---|---|
| Web workspace | Present context, collect input, visualize results, and restore saved work. |
| Application API | Validate identity, project scope, schema, versions, permissions, and request idempotency. |
| Transactional store | Projects, memberships, run metadata, policies, decisions, approvals, and audit references. |
| Object/tabular storage | Original files, queryable datasets, model artifacts, scenario draws, and result packages. |
| Graph/query layer | Resolve entities and directed relationships; provide scoped subgraphs and lineage. |
| Job execution | Run statistics, optimization, simulation, and document processing with limits and cancellation. |
| Agent runtime | Select authorized tools, pass validated arguments, retrieve evidence, summarize artifacts, and request review. |
| Operational adapters | Read/write approved source systems, retain external IDs, handle retries, and reconcile results. |

Start with a small number of deployable services and typed boundaries. Separate long-running analytical jobs from interactive requests. Choose database and graph technology after query patterns, tenancy, scale, and operational requirements are measured; the graph UI alone does not require a dedicated graph database on day one.

### Data contracts to establish early

- **Observation:** entity, variable, value, unit, grain, valid time, ingestion time, source, quality, project, version.
- **Relationship:** source/target IDs, semantic type, direction, quantity/share, unit, validity window, confidence, provenance, visibility policy.
- **Run:** input artifact versions, model/tool version, parameters, context, status, timestamps, warnings, outputs, cost, parent run.
- **Decision:** alternatives, selected option, objective, constraints, expected outcomes, uncertainty, rationale, parents, owner, approval policy.
- **Approval:** authenticated actor, authority, decision version/hash, timestamp, scope, expiry, revocation.
- **Execution:** approved instruction, idempotency key, external reference, acknowledgement, failure/retry state, actual outcome.

Separate a governed definition from a measured value, a source fact from an inference, a simulation from an observation, and a proposed plan from an executed action.

## 12. Product and design improvements

### Improve professional density without sacrificing readability

Keep the compact headers, full-width work areas, single-line terminal composer, and collapsible inspectors. Introduce compact/default/comfortable density preferences. More information should come from better grouping and progressive disclosure, not continually smaller type or click targets.

Build shared metric, toolbar, table, inspector, empty-state, status, and evidence components. Assign colors by meaning: application identity, entity type, risk, and selection should not compete through unrelated palettes. Official client marks should retain their own colors and adequate contrast; clients without a verified asset should have an intentional fallback rather than an imitation logo.

Audit keyboard focus, selected state, controls, and graph paths in both themes. Non-text UI and graphical contrast need specific validation, consistent with [W3C's non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Do not use color as the only way to communicate risk or status.

### Improve task continuity

Add saved graph filters/layouts, recent projects/runs, resumable analyses, source-change notifications, shared annotations, and a consolidated review queue. Preserve the chosen entity, time window, and scenario during an app handoff. Show a clear breadcrumb from a result back to its input dataset and decision.

### Make evidence useful at the point of decision

Show a compact status such as Observed, Derived, Simulated, or Proposed beside the value, with source age and uncertainty where relevant. Keep technical details in the evidence inspector. If a value is an example, do not give it a live-looking timestamp that implies a recent source refresh.

### Improve the case-study teaching experience

Each case should answer five things in sequence: what happened, what data established it, which options were tested, why the chosen option was better under the constraints, and how the user can inspect/replay the result. Include one assumption change that reverses the recommendation and one case with no feasible solution.

## 13. Prioritized delivery plan

The sequence below prioritizes learning and operational usefulness. It is not a promised calendar; effort depends on available datasets, deployment constraints, and integration owners.

| Stage | Deliverables | Exit criteria |
|---|---|---|
| **A — Make the existing demo internally trustworthy** | Correct intervals/units; make example outputs explicit; fix table fallback; align app catalog, README, and counts; document unsupported handoffs; remove claims of computation where none executes. | Every displayed number has a clear origin; controls either compute, navigate, create a draft, or state their limitation accurately. |
| **B — Complete one persisted project** | Authentication, project storage, file ingestion, schema/unit mapping, dataset versions, queryable tables, basic graph generation, durable sessions/evidence. | A new project can ingest data and survive refresh; users cannot access another project's records by changing IDs. |
| **C — Execute one analytical decision loop** | Real descriptive statistics and a selected distribution model; one sourcing/allocation model; reproducible scenarios; typed statistics-to-optimizer handoff; decision comparison and stored approvals. | Input changes produce attributable calculated changes; infeasible and stale results block approval; results reproduce from stored artifacts. |
| **D — Add real agent assistance** | Model/tool runtime, evidence retrieval, schema validation, event streaming, cancellation, budgets, evaluation, and human checkpoints. | An agent can complete the same validated workflow a human analyst can, with traceable tool calls and no unauthorized actions. |
| **E — Expand to a governed portfolio** | Sector-specific datasets/topologies, shared-entity resolution, global projections, permission-aware common exposures, common-capacity constraints, portfolio scenarios. | Cross-project insights have evidence and explicit sharing rules; shared capacity is not counted twice. |
| **F — Close the operating loop** | One approved external action adapter, acknowledgement/retry handling, outcome capture, forecast/model monitoring, and benefit reconciliation. | Approved intent, external execution, and observed outcome can be reconciled; failures are visible and recoverable. |

### Recommended first pilot

Use **Launch Continuity** as the demo-backed pilot shape, with authorized or fully simulated records for one product family, a few assembly sites, a small supplier set, and dated customer demand.

Build only the decision chain required to answer: **“If a qualified component source loses capacity for six weeks, which alternate sourcing, inventory, and production actions preserve the most priority demand within cost and qualification constraints?”**

The pilot should connect Data → project graph → Statistical Studio → Network Optimizer → decision review → Playground explanation. Then validate a substantially different sector, such as medicines or beverages, to prove the architecture is not tied to an electronics template.

### Pilot acceptance checklist

1. A newly created project accepts a real test file and stores its exact content/version.
2. Schema, units, time zones, grain, keys, and rejected rows are reviewable.
3. Table filters operate on the real dataset; filtered and total row counts reconcile.
4. Node and edge evidence resolves to real source records or declared assumptions.
5. The statistical summary can be independently recomputed from the selected data.
6. A distribution/transition model includes its data window, diagnostics, and validation boundary.
7. The optimizer consumes a referenced data/model artifact, not copied text.
8. A six-week capacity shock changes feasible flows, service, inventory, and cash consistently.
9. Removing a qualified alternate can make a plan infeasible; the result explains the binding constraint.
10. The same inputs/model/seed reproduce the same result within a declared numerical tolerance.
11. A changed input marks dependent outputs and approvals stale.
12. Decision comparison retains assumptions and rejected alternatives.
13. An approval resolves to a named user and immutable decision version.
14. A user cannot read/run/export another project's records using a forged URL or direct request.
15. Reloading or reconnecting retains the user's run and its status.
16. Agent output links to real tool events and evidence; unknown evidence remains unknown.
17. A failed/cancelled job reports its terminal state and preserves completed artifacts.
18. Graph paths, table filters, and the terminal can be used with keyboard and pointer in both themes.
19. An export contains the actual selected data/result with its scope and timestamp.
20. A completed decision is compared with actual or replayed outcomes using the same KPI definitions.

### Track product value

Measure time from source arrival to validated data, time from disruption to reviewable decision, evidence coverage of material claims, unresolved data errors, modeled versus realized service/cost, number of stale approvals prevented, agent task success, and cost per completed analysis. Establish baseline measurements before setting targets. Bubble count, nominal data volume, and number of agent names are not sufficient measures of value.

## 14. Review evidence and validation boundary

### Source areas inspected

| Area | Main evidence |
|---|---|
| App structure, routes, context, and state | [PlatformShell](app/PlatformShell.tsx), [navigation](app/navigation.ts), [WorkspaceHome](app/WorkspaceHome.tsx), [workspace portfolio](app/workspace-portfolio-model.ts), [project path](app/project-path-model.ts) |
| Projects, memberships, evidence, connectors, catalog | [workspace-model](app/workspace-model.ts), [WorkspaceOnboarding](app/WorkspaceOnboarding.tsx), [ProjectWorkspace](app/ProjectWorkspace.tsx) |
| Case data, companies, network generation | [case-study-model](app/case-study-model.ts), [case studies](app/case-studies/page.tsx), [presentation](public/tanjnx-case-studies.html) |
| Global and project graphs | [GlobalKnowledgeGraph](app/GlobalKnowledgeGraph.tsx), [ProjectSupplyChainExplorer](app/ProjectSupplyChainExplorer.tsx) |
| World map and regional data | [ScopeDashboard](app/ScopeDashboard.tsx), [WorldNetworkMap](app/WorldNetworkMap.tsx), [network-operations-model](app/network-operations-model.ts) |
| Specialist applications | [ApplicationViews](app/ApplicationViews.tsx), [ProjectAppStudios](app/ProjectAppStudios.tsx), [ApplicationOperatingModel](app/ApplicationOperatingModel.tsx), [application catalog](app/application-catalog.ts), [change model](app/application-change-model.ts) |
| Optimization and decisions | [OptimizationWorkbench](app/OptimizationWorkbench.tsx), [platform-model](app/platform-model.ts), [DecisionWorkspaces](app/DecisionWorkspaces.tsx), [or-methodology](app/or-methodology.ts) |
| Statistics and tables | [statistical-model](app/statistical-model.ts), [TableExplorerClient](app/table/TableExplorerClient.tsx), [table route](app/table/page.tsx) |
| Agents and accountability | [project-activity-model](app/project-activity-model.ts), [WorkIdentityInspector](app/WorkIdentityInspector.tsx), [ProjectWorkspace](app/ProjectWorkspace.tsx), [DataOperations](app/DataOperations.tsx) |
| Definitions, identity, layout, and accessibility contracts | [VariablesCatalog](app/VariablesCatalog.tsx), [taxonomy](app/taxonomy-catalog.generated.ts), [VisualIdentity](app/VisualIdentity.tsx), [globals.css](app/globals.css), [dialog lifecycle](app/useDialogLifecycle.ts) |
| Runtime/configuration/documentation | [package.json](package.json), [vite configuration](vite.config.ts), [layout metadata](app/layout.tsx), [hosting binding](.openai/hosting.json), [README](README.md) |
| Regression verification | [tests](tests) |

### Checks performed for this review

- Inspected the current local commit and clean starting worktree.
- Read the main route, state, component, calculation, evidence, and fixture-generation paths rather than relying on the old README.
- Loaded the exported TypeScript models through the repository's existing test loader and counted actual materialized records.
- Compared one displayed statistical profile with its generated sample rows and independently computed the sample mean, sample standard deviation, and missing count.
- Verified that all ten project networks currently share the same node/edge/stage/checkpoint counts.
- Reran `node --test tests/*.test.mjs`: **104 passed, 0 failed**. Rendered-route tests used the existing production build from the reviewed implementation.
- Consulted the linked NIST, OWASP, W3C, and graph-reference pages for the specific improvement guidance cited above.

The immediately preceding implementation run at the same source state completed the production build, type-check, and lint successfully. This documentation review did not require another application build. No live connector, real statistical/solver service, enterprise sign-in, database, external write-back, production load test, or exhaustive visual/accessibility test was validated here. These are explicit future acceptance areas, not capabilities inferred from the passing suite.

**Recommended investment:** preserve the connected workspace and its interaction contracts; make data semantics, reproducible calculations, persistent evidence, and attributable decisions the next product milestone.
