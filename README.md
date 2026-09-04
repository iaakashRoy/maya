# Maya supply-chain decision platform concept

Maya is an interactive, front-end-only concept for operating a connected supply
chain through client projects, specialist applications, expert agents,
operations-research methods, a knowledge graph, and evidence receipts.

All organizations, people, values, events, maps, agent activity, calculations,
and outcomes are deterministic synthetic fixtures. The concept has no live
business-data backend, model API, mathematical solver, operational connector,
credential, learning loop, or write-back authority.

## Product structure

The main delivery hierarchy is:

```text
Global intelligence
  Sector tower
    Client tenant
      Project workspace
        Project-owned data and knowledge graph
        Mounted specialist applications
        Decision cases and decision operations
        Expert agents and human specialists
        Evidence receipts and governance
```

The former company platform is now the **Expert workspace**. It contains ten
synthetic clients and projects across mobility, life sciences, semiconductors,
food and agriculture, aerospace, energy, critical minerals, ports, industrial
automation, and retail. The URL preserves the selected sector, client, project,
project tab, app studio, case, scope, and retained network entity.

Each project exposes eight working surfaces:

- **Project home** - outcomes, KPIs, mounted apps, decision preview, knowledge
  footprint, and direct handoffs.
- **Decisions** - a D0-D3 choice tree connected to L2, L1, and L0 taxonomy
  variables, OR methods, and evidence.
- **Mounted apps** - an app dependency graph and per-project mount manifest.
- **Project data** - a session-only staged-data walkthrough with metadata,
  schema, mapping, review, and receipt states.
- **Knowledge graph** - selectable nodes, visible agent trace, evidence links,
  playback, and visual steering instructions.
- **Agent society** - a minimal code-style prompt workspace, trace controls,
  experience profiles, Skills/MCP/tool manifest builder, and human gate.
- **Expert team** - OR scientists, procurement leaders, logisticians, planners,
  data stewards, and other accountable human roles.
- **Governance** - explicit concept controls, production gaps, evidence state,
  and project boundaries.

Browser-session state is isolated by project for mounted apps, uploaded-file
metadata, agent conversations, traces, steering, draft agents, expert
assignments, and action receipts. This is demonstrative state, not backend
persistence or security enforcement.

## Ten distinct specialist applications

The applications share project and evidence contracts but deliberately use
different visual grammars and working rhythms:

- **RiskRadar** - coral causal propagation and criticality control room.
- **Network Optimizer** - lime formulation editor, scenario lab, Pareto view,
  constraint validation, and release gate.
- **FlowLens** - cyan material-to-cash waterfall and action queue.
- **DemandSense** - violet forecast fan, driver notebook, and demand contract.
- **SupplierGraph** - green n-tier dependency graph and qualification funnel.
- **MineralAtlas** - copper-toned country, reserve, refinery, route, and product
  sourcing atlas.
- **WorkforceStudio** - indigo skills matrix and constrained shift builder.
- **ManufacturingTwin** - steel-blue plant flow, bottleneck, and schedule studio.
- **LogisticsRadar** - teal route, cargo, transfer, customs, and last-mile radar.
- **QualityGenealogy** - amber lot genealogy and release/containment gate.

Each app also explains its decision question, users, cadence, authority,
workflow, method references, data contracts, controls, KPIs, handoffs, change
ledger, validation rules, and interpretation limits. The operating-model facts
create evidence or action receipts rather than pretending a service executed.

## Evidence and terminal interaction contract

Primary controls finish in a visible state: a real destination, changed
browser-session state, detailed inspector, evidence/action receipt, or a named
blocked gate. Future integrations open an explicit contract or unavailable
state. The session receipt ledger retains the latest 24 outcomes.

Evidence receipts describe the selected project, claim, displayed value,
evidence state, source kind and locator, time validity, version/fingerprint,
formula, inputs, canonical variable identifier and grain, quality/confidence,
agent, reviewer, and access boundary. Unknown or cross-project references fail
closed.

## Operations research

Network Optimizer incorporates the complete supplied methodology catalog as a
reference and formulation workbench:

- 30 methods (M-01 through M-30) across forecasting, mathematical programming,
  routing, inventory, scheduling, simulation, probability, risk, robust and
  stochastic optimization, decomposition, heuristics, reinforcement learning,
  causal validation, digital twins, and human factors.
- 12 reusable decision patterns with primary, supporting, fallback, and
  experimental method roles.
- Canonical variables, planning horizons, objective hierarchy, constraints,
  probability behavior, joint scenarios, candidate comparison, validation,
  reproducibility, and human release controls.

The current interface runs a deterministic response calculator only. It does
not execute a solver and never labels a generated candidate as optimal.

## World Network Radar

The scrollable world map uses a bundled Natural Earth basemap and synthetic
locations, corridors, assets, cargo, transfers, and causal change records. It
supports region presets, pan, wheel/keyboard zoom, time and scenario playback,
layer controls, hover/focus detail, pinned inspection, and app handoff.

The concept does not call Google 3D Tiles, Cesium, OpenSky, ADS-B Exchange,
AIS, CCTV, traffic, satellite, seismic, or weather services. Production use
requires provider-specific attribution, licensing, privacy, retention,
security, and resilience review. Road and rail polylines are illustrative and
not suitable for navigation. See
[`public/maps/NATURAL_EARTH_NOTICE.md`](public/maps/NATURAL_EARTH_NOTICE.md).

## Navigation guide

The complete demonstration route, project matrix, click-terminal-state guide,
app operating models, evidence contract, agent workflow, data-ingestion path,
world-radar controls, OR workbench, deep links, production boundaries, and
technical references are in
[`docs/Maya_Navigation_Guide.docx`](docs/Maya_Navigation_Guide.docx).

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

The repository retains its Sites project binding in `.openai/hosting.json`.
Local changes do not update the hosted experience until a version is saved and
deployed.
