# Resilience OS product clickflow

An interactive, front-end-only concept application for explaining the proposed
supply-chain intelligence platform and its services. All organizations, events,
metrics, and recommendations shown in the experience are illustrative sample
data. The prototype has no business-data backend and performs no real actions.

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
- **Network Optimizer** — constrained sourcing, inventory, production, and
  logistics optimization using a deterministic operations-research model.
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
