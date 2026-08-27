# Resilience OS product clickflow

An interactive, front-end-only concept application for explaining the proposed
supply-chain intelligence platform and its services. All organizations, events,
metrics, and recommendations shown in the experience are illustrative sample
data. The prototype has no business-data backend and performs no real actions.

## Explore the concept

- **Command** — exposure, decisions, and value in one executive view.
- **Radar** — evidence-backed signals and private exposure matching.
- **Decision Cases** — governed ownership, approvals, execution, and value tracking.
- **Decision Twin** — customer-controlled operational graph and impact paths.
- **Optimizer** — deterministic disruption scenarios and constrained response options.
- **Product DNA** — BOM, materials, should-cost, design, and compliance views.
- **Flow Graph** — inventory, order-to-cash, and working-capital impact.
- **Trust** — permissioned product, finance, insurance, and credential evidence.
- **Data Fabric** — connector health, lineage, mappings, quality, and model governance.
- **Services** — commercial modules, diagnostic offer, and adoption journey.

Use the left navigation, global search, role switcher, guided tour, decision
cases, signal cards, source-connect flow, and scenario controls to click through
the complete signal-to-measured-value story.

The repository intentionally excludes the original deployment binding. It can
be developed, tested, and connected to a new deployment independently.

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
```
