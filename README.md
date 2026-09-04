# Resilience OS product clickflow

An interactive, front-end-only concept application for explaining the proposed
supply-chain intelligence platform and its services. All organizations, people,
events, assets, cargo, telemetry, prices, metrics, model results, and
recommendations shown in the experience are deterministic synthetic data. The
prototype has no business-data backend, live solver, operational connector, or
write-back authority.

## Platform structure

The operating picture is organized at three user-controlled levels:

- **Global platform** — worldwide intelligence, supplier exposure, corridors,
  vessels, cargo, open orders, money flow, and customer commitments.
- **Regional platform** — a regional control tower for country, port, plant,
  supplier, inventory, cash, and service decisions.
- **Company platform** — a private company twin connecting products, materials,
  suppliers, plants, orders, margins, and governed actions.

Five task-focused applications inherit the selected scope:

- **RiskRadar** — n-tier risk propagation and procurement criticality.
- **Network Optimizer** — a handbook-grounded OR workbench for framing,
  formulation, method selection, uncertainty, Pareto comparison, validation,
  and release. It uses a deterministic synthetic response calculator with a
  generated candidate-space index and makes no solver or optimality claim.
- **FlowLens** — physical movement connected to cash, working capital, margin,
  invoicing, and collections.
- **DemandSense** — explainable demand scenarios combining orders and external
  drivers.
- **SupplierGraph** — supplier dependency, performance, capability, evidence,
  and alternative discovery.

The **Data Agent Hub** shows policy-controlled ingestion agents operating
across client systems and approved external sources. The **Operational
Knowledge Graph** exposes resolved entities, relationships, evidence lineage,
mapping exceptions, and the context consumed by each application.

Each of the seven application and data surfaces includes a common five-part
operating model that keeps implementation depth available without crowding the
working dashboard:

- **Operating model** documents the decision question, users, cadence,
  authority, workflow gates, and exit criteria.
- **Methods** explains four application-specific analytical or
  operations-research methods, their formulation, and their validation gate.
- **Data & controls** defines governed data contracts and the controls that
  prevent unsafe automation.
- **Measure & hand off** connects value and model-health KPIs to downstream
  execution artifacts and explicit interpretation limits.
- **Change & learning** provides six app-specific before-current-forecast
  events with cause, evidence, confidence, trigger, owner, downstream handoff,
  drift logic, and champion/challenger governance.

## World Network Radar

The scope dashboards now use a real geographic land layer and one normalized
synthetic operations model:

- 43 locations across the Americas, Europe, MEA, and APAC.
- 42 multimodal corridors covering ocean, air, road, rail, and transfers.
- 96 tracked assets, 240 linked cargo lots, 72 transfer events, and 72 causal
  change records.
- Nine fixed time frames from T−24h through +90d and three scenarios: current
  trajectory, no-action disruption, and recommended response. Corridor state,
  asset progress, cargo, transfers, delay, reliability, cost, and causal-change
  evidence change deterministically with the selected time and scenario.
- Region presets, deliberate map engagement, drag pan, wheel and keyboard zoom,
  semantic detail levels, eight layer controls (including high-zoom cargo),
  hover/focus summaries, pinned entity inspection, and five-entity accessible
  list views.
- A pinned corridor, asset, cargo lot, location, or transfer can be carried into
  RiskRadar, Network Optimizer, or FlowLens as shared application context. The
  selected entity, time frame, and scenario are visible in the command bar and
  participate in the optimizer result fingerprint.

The bundled world land geometry is Natural Earth 1:110m public-domain data; see
[`public/maps/NATURAL_EARTH_NOTICE.md`](public/maps/NATURAL_EARTH_NOTICE.md).
Road and rail polylines are operationally representative and are not suitable
for navigation.

## Operations-research workbench

Network Optimizer incorporates the full methodology catalog from the supplied
handbook without implying that every technique runs simultaneously:

- 30 methods, M-01 through M-30, with formulations, named techniques, outputs,
  validation evidence, runtime class, use cases, and limitations.
- 12 reusable decision patterns with explicit primary, supporting, fallback,
  and experimental method roles plus handbook table and taxonomy references.
- Six probability-behavior classes cover nonnegative amounts, interval counts,
  bounded rates, governed binary states, time-to-event behavior, and correlated
  vectors, with candidate distributions and explicit assumption controls.
- Four planning horizons, a four-level lexicographic objective hierarchy, all
  12 canonical constraint families, 57 illustrative definitions, and a
  visible residual/evidence check for every family. Eleven hard families gate
  review; MOQ/batch/setup is the governed advisory family.
- 12 probability-reconciled joint uncertainty scenarios, 16 illustrative
  Pareto alternatives, four validation gates, a seven-block solution report,
  one four-action response package, and 20 generated history fixtures.
- Pending-input diffs and a hard release gate. A failed service, carbon, budget,
  authorization, or other hard constraint—or any stale decision-contract
  change—blocks the human-review action.

## Governed decision clickflow

The concept experience now connects every level and application through a
shared decision-case contract:

- **Decision Inbox** prioritizes work by severity, lifecycle stage, owner,
  value, and the applications contributing evidence.
- **Case Workspace** combines RiskRadar, Network Optimizer, FlowLens,
  DemandSense, and SupplierGraph outputs with six response alternatives, L0 variables,
  operations-research method codes, affected entities, and evidence lineage.
- **Action Room** provides a synthetic approval matrix, released work packages,
  scenario trade-offs, and an outcome-measurement contract.

Nine richly populated synthetic cases span Global, APAC, and Apex Mobility;
each includes six evidence records, six work packages, and six method-tagged
response alternatives. Twelve synthetic data agents cover ERP, PLM, WMS, TMS,
QMS, CRM, finance, trade, carbon, supplier, unstructured, and market sources.
Deep links preserve the active case and scope, for example
`/?view=case&scope=company&case=CASE-1042`, so dashboards and applications share
the same working context.

The complete operator walkthrough is available in
[`docs/Maya_Navigation_Guide.docx`](docs/Maya_Navigation_Guide.docx).

The repository retains its existing Sites project binding in
`.openai/hosting.json`. Local implementation and validation do not update the
hosted experience until an explicit publish/deployment step is performed.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validate

```bash
npm test
npm run lint
npm run typecheck
```
