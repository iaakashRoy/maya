"use client";

import { useMemo, useState } from "react";
import WorldNetworkMap, { type MapSelectionContext } from "./WorldNetworkMap";
import { getNetworkView, networkLocations, type MapLayer, type NetworkFrameId, type NetworkRegion } from "./network-operations-model";
import { type ScopeSnapshot, type StatusTone } from "./platform-model";
import type { WorkspaceProject } from "./workspace-model";

type ScopeDashboardProps = {
  snapshot: ScopeSnapshot;
  projects: readonly WorkspaceProject[];
  worldScope: "global" | "region";
  region: NetworkRegion;
  horizon: string;
  category: string;
  onHorizonChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onScopeChange: (scope: "global" | "region") => void;
  onRegionChange: (region: NetworkRegion) => void;
  onOpenProject: (projectId: string) => void;
  onAddToProject: (selection?: MapSelectionContext & { intake?: "dependency" | "route" | "value" }) => void;
  onTrace: (title: string, detail: string, artifact?: string, context?: string) => void;
  onRefresh: (context?: string) => void;
};

type RegionalOperationsProfile = Pick<ScopeSnapshot, "shortLabel" | "title" | "description" | "context" | "updated" | "metrics" | "intel" | "money" | "suppliers">;

export const regionalOperationsProfiles: Record<NetworkRegion, RegionalOperationsProfile> = {
  APAC: {
    shortLabel: "APAC",
    title: "APAC network",
    description: "Monitor ports, supplier clusters, plants, and customer commitments across Asia-Pacific.",
    context: "11 countries · 1,846 suppliers · 642 active shipments",
    updated: "Fixture snapshot · advanced 46 sec ago",
    metrics: [
      { label: "Regional spend", value: "$3.1B", detail: "46% electronics + materials", tone: "info", trend: "+5.1% YoY" },
      { label: "Cargo in motion", value: "$486M", detail: "642 shipments · 18 vessels", tone: "watch", trend: "11 delayed" },
      { label: "Open orders", value: "4,812", detail: "$742M customer value", tone: "healthy", trend: "94.9% confirmed" },
      { label: "Critical suppliers", value: "11", detail: "4 single-source dependencies", tone: "critical", trend: "+2 this month" },
      { label: "Regional OTIF", value: "92.4%", detail: "Target 95.0%", tone: "watch", trend: "−1.8 pts" },
      { label: "Cash opportunity", value: "$18.6M", detail: "Inventory + payment actions", tone: "opportunity", trend: "30-day window" },
    ],
    intel: [
      { id: "INT-AP-01", title: "Singapore dwell is propagating into priority lanes", detail: "Nine vessels and 812 open orders are inside the current delay window.", impact: "3.4 days service risk", confidence: 94, tone: "watch", horizon: "5–12 days", source: "Synthetic AIS + terminal fixture" },
      { id: "INT-AP-02", title: "Graphite capacity is being contracted ahead of market", detail: "Three agreement records reserve 23% of illustrative merchant supply through Q2.", impact: "$42M margin exposure", confidence: 91, tone: "critical", horizon: "60–120 days", source: "Synthetic filings + trade-data fixture" },
      { id: "INT-AP-03", title: "Vietnam capacity matches two constrained families", detail: "Qualified casting lines have 18% illustrative headroom after current commitments.", impact: "$4.6M savings potential", confidence: 86, tone: "opportunity", horizon: "This quarter", source: "Synthetic supplier-capacity fixture" },
      { id: "INT-AP-04", title: "India air capacity can protect launch orders", detail: "Two Mumbai–Frankfurt allocations cover 42 priority lots without displacing contracted freight.", impact: "$6.2M value protected", confidence: 89, tone: "healthy", horizon: "7 days", source: "Synthetic TMS + order fixture" },
    ],
    money: [
      { label: "APAC goods in motion", value: "$486M", detail: "642 active shipments", percent: 74, tone: "watch" },
      { label: "Supplier payables", value: "$312M", detail: "21 days weighted term", percent: 56, tone: "info" },
      { label: "Inventory cash", value: "$164M", detail: "42 days on hand", percent: 68, tone: "watch" },
      { label: "Margin at risk", value: "$42M", detail: "Graphite + service exposure", percent: 27, tone: "critical" },
    ],
    suppliers: [
      { name: "NeoGraph Materials", category: "Battery graphite", tier: "Tier 2", spend: "$84M", dependency: 92, risk: "critical", region: "East Asia" },
      { name: "Hanwa Microdevices", category: "Power semiconductors", tier: "Tier 2", spend: "$112M", dependency: 81, risk: "watch", region: "Japan" },
      { name: "Apex Castings", category: "Precision housings", tier: "Tier 1", spend: "$48M", dependency: 64, risk: "opportunity", region: "India" },
      { name: "VietCore Components", category: "Machined castings", tier: "Tier 2", spend: "$36M", dependency: 53, risk: "healthy", region: "Vietnam" },
    ],
  },
  Europe: {
    shortLabel: "Europe",
    title: "Europe network",
    description: "Monitor port, rail, plant, supplier, and compliance signals across the European network.",
    context: "17 countries · 1,392 suppliers · 418 active shipments",
    updated: "Fixture snapshot · advanced 1 min ago",
    metrics: [
      { label: "Regional spend", value: "$2.2B", detail: "38% metals + components", tone: "info", trend: "+2.6% YoY" },
      { label: "Cargo in motion", value: "$312M", detail: "418 shipments · 9 rail paths", tone: "healthy", trend: "91% on plan" },
      { label: "Open orders", value: "3,906", detail: "$618M customer value", tone: "healthy", trend: "96.2% confirmed" },
      { label: "Critical suppliers", value: "8", detail: "3 recovery plans active", tone: "watch", trend: "−1 this month" },
      { label: "Regional OTIF", value: "95.2%", detail: "Target 96.0%", tone: "watch", trend: "−0.4 pts" },
      { label: "Cash opportunity", value: "$12.4M", detail: "Dwell + inventory actions", tone: "opportunity", trend: "21-day window" },
    ],
    intel: [
      { id: "INT-EU-01", title: "Rhine rail capacity is tightening around priority steel", detail: "Three scheduled paths overlap maintenance windows serving Katowice and Rotterdam.", impact: "186 orders monitored", confidence: 92, tone: "watch", horizon: "7–14 days", source: "Synthetic rail + production fixture" },
      { id: "INT-EU-02", title: "Carbon evidence gaps remain on EU-bound programs", detail: "Twelve supplier records are missing fields for the next demonstration reporting cycle.", impact: "$18.7M revenue gated", confidence: 97, tone: "critical", horizon: "Next filing", source: "Synthetic policy + supplier-portal fixture" },
      { id: "INT-EU-03", title: "Rotterdam inventory can absorb the current port variance", detail: "Available stock covers six days of demand for two constrained component families.", impact: "$5.1M value protected", confidence: 88, tone: "opportunity", horizon: "This week", source: "Synthetic WMS + demand fixture" },
      { id: "INT-EU-04", title: "Poland line recovery is ahead of the committed plan", detail: "Fixture output has held above the recovery curve for three consecutive shifts.", impact: "2.1 days recovered", confidence: 90, tone: "healthy", horizon: "72 hours", source: "Synthetic MES + schedule fixture" },
    ],
    money: [
      { label: "Europe goods in motion", value: "$312M", detail: "418 active shipments", percent: 69, tone: "healthy" },
      { label: "Receivables exposed", value: "$74M", detail: "Linked to 186 monitored orders", percent: 38, tone: "watch" },
      { label: "Inventory cash", value: "$138M", detail: "34 days on hand", percent: 57, tone: "info" },
      { label: "Margin at risk", value: "$18.7M", detail: "Compliance + service exposure", percent: 22, tone: "watch" },
    ],
    suppliers: [
      { name: "NordSteel AB", category: "Specialty steel", tier: "Tier 1", spend: "$76M", dependency: 78, risk: "watch", region: "Nordics" },
      { name: "Baltic Cell Systems", category: "Battery modules", tier: "Tier 1", spend: "$94M", dependency: 72, risk: "critical", region: "Poland" },
      { name: "Rhein Micro Controls", category: "Control electronics", tier: "Tier 2", spend: "$51M", dependency: 61, risk: "healthy", region: "Germany" },
      { name: "Iberia Forgings", category: "Precision forgings", tier: "Tier 2", spend: "$39M", dependency: 46, risk: "opportunity", region: "Spain" },
    ],
  },
  Americas: {
    shortLabel: "Americas",
    title: "Americas network",
    description: "Monitor ports, cross-border flows, plants, suppliers, and customer commitments across the Americas.",
    context: "9 countries · 1,574 suppliers · 506 active shipments",
    updated: "Fixture snapshot · advanced 38 sec ago",
    metrics: [
      { label: "Regional spend", value: "$2.4B", detail: "41% mobility + chemicals", tone: "info", trend: "+3.2% YoY" },
      { label: "Cargo in motion", value: "$328M", detail: "506 shipments · 128 road loads", tone: "healthy", trend: "94% on plan" },
      { label: "Open orders", value: "5,124", detail: "$826M customer value", tone: "healthy", trend: "97.0% confirmed" },
      { label: "Critical suppliers", value: "7", detail: "2 single-source dependencies", tone: "watch", trend: "Stable this month" },
      { label: "Regional OTIF", value: "96.1%", detail: "Target 96.5%", tone: "healthy", trend: "+0.3 pts" },
      { label: "Cash opportunity", value: "$22.8M", detail: "Inventory + lane actions", tone: "opportunity", trend: "30-day window" },
    ],
    intel: [
      { id: "INT-AM-01", title: "Mexico inventory can protect North American service", detail: "Rebalancing 14% of controller stock covers 428 illustrative high-margin orders.", impact: "$7.8M value protected", confidence: 86, tone: "opportunity", horizon: "This week", source: "Synthetic ERP + WMS-twin fixture" },
      { id: "INT-AM-02", title: "Panama transfers are approaching the planning threshold", detail: "Two services carry 31% more committed volume than the current weekly baseline.", impact: "1.6 days service risk", confidence: 90, tone: "watch", horizon: "5–10 days", source: "Synthetic AIS + terminal fixture" },
      { id: "INT-AM-03", title: "US Gulf resin allocation affects three product families", detail: "Supplier allocations leave a 420-tonne illustrative gap against confirmed demand.", impact: "$9.3M margin exposure", confidence: 93, tone: "critical", horizon: "30–60 days", source: "Synthetic allocation + demand fixture" },
      { id: "INT-AM-04", title: "Chicago rail handoff is recovering faster than plan", detail: "Intermodal dwell has returned within four hours of the fixture service target.", impact: "96 orders released", confidence: 88, tone: "healthy", horizon: "48 hours", source: "Synthetic rail + TMS fixture" },
    ],
    money: [
      { label: "Americas goods in motion", value: "$328M", detail: "506 active shipments", percent: 76, tone: "healthy" },
      { label: "Receivables exposed", value: "$62M", detail: "Linked to 204 delayed orders", percent: 31, tone: "watch" },
      { label: "Inventory cash", value: "$146M", detail: "31 days on hand", percent: 52, tone: "info" },
      { label: "Margin at risk", value: "$9.3M", detail: "Resin + transfer exposure", percent: 18, tone: "watch" },
    ],
    suppliers: [
      { name: "Monterrey Controls", category: "Electronic controllers", tier: "Tier 1", spend: "$88M", dependency: 83, risk: "watch", region: "Mexico" },
      { name: "Great Lakes Power", category: "Power modules", tier: "Tier 2", spend: "$64M", dependency: 69, risk: "healthy", region: "United States" },
      { name: "Andean Copper Works", category: "Refined copper", tier: "Tier 2", spend: "$106M", dependency: 76, risk: "critical", region: "Chile" },
      { name: "GulfChem Resins", category: "Engineering polymers", tier: "Tier 1", spend: "$42M", dependency: 58, risk: "opportunity", region: "United States" },
    ],
  },
  MEA: {
    shortLabel: "Middle East & Africa",
    title: "Middle East & Africa network",
    description: "Monitor maritime corridors, transfer hubs, suppliers, and customer commitments across the Middle East and Africa.",
    context: "14 countries · 708 suppliers · 236 active shipments",
    updated: "Fixture snapshot · advanced 52 sec ago",
    metrics: [
      { label: "Regional spend", value: "$0.7B", detail: "44% minerals + logistics", tone: "info", trend: "+6.4% YoY" },
      { label: "Cargo in motion", value: "$154M", detail: "236 shipments · 12 vessels", tone: "critical", trend: "19 delayed" },
      { label: "Open orders", value: "1,760", detail: "$294M customer value", tone: "watch", trend: "91.8% confirmed" },
      { label: "Critical suppliers", value: "6", detail: "3 corridor-dependent", tone: "critical", trend: "+1 this month" },
      { label: "Regional OTIF", value: "90.8%", detail: "Target 94.0%", tone: "critical", trend: "−2.4 pts" },
      { label: "Cash opportunity", value: "$9.4M", detail: "Routing + term actions", tone: "opportunity", trend: "21-day window" },
    ],
    intel: [
      { id: "INT-ME-01", title: "Red Sea variance is moving volume toward Cape routes", detail: "Four illustrative services have activated longer routings against the current schedule.", impact: "8.6 days service risk", confidence: 96, tone: "critical", horizon: "Now–21 days", source: "Synthetic AIS + schedule fixture" },
      { id: "INT-ME-02", title: "Jebel Ali dwell is affecting two transfer waves", detail: "Inbound bunching places 164 priority containers inside the current connection window.", impact: "$21M goods monitored", confidence: 92, tone: "watch", horizon: "3–7 days", source: "Synthetic terminal + TMS fixture" },
      { id: "INT-ME-03", title: "Durban capacity can absorb selected Cape diversions", detail: "Two weekly slots remain feasible after contracted and priority freight is protected.", impact: "$3.8M loss avoided", confidence: 84, tone: "opportunity", horizon: "14 days", source: "Synthetic carrier + port fixture" },
      { id: "INT-ME-04", title: "Morocco harness output is holding above schedule", detail: "Tanger supplier output remains six percent above the illustrative committed plan.", impact: "72 orders secured", confidence: 89, tone: "healthy", horizon: "This week", source: "Synthetic supplier + MES fixture" },
    ],
    money: [
      { label: "MEA goods in motion", value: "$154M", detail: "236 active shipments", percent: 58, tone: "critical" },
      { label: "Receivables exposed", value: "$48M", detail: "Linked to 312 delayed orders", percent: 47, tone: "watch" },
      { label: "Inventory cash", value: "$72M", detail: "45 days on hand", percent: 66, tone: "info" },
      { label: "Margin at risk", value: "$21M", detail: "Corridor + delay exposure", percent: 34, tone: "critical" },
    ],
    suppliers: [
      { name: "Maghreb Harness Systems", category: "Wiring harnesses", tier: "Tier 1", spend: "$34M", dependency: 74, risk: "watch", region: "Morocco" },
      { name: "Gulf Alloy Industries", category: "Aluminum alloy", tier: "Tier 2", spend: "$58M", dependency: 82, risk: "critical", region: "United Arab Emirates" },
      { name: "East Africa Minerals", category: "Critical minerals", tier: "Tier 3", spend: "$46M", dependency: 68, risk: "critical", region: "East Africa" },
      { name: "Cape Polymer Works", category: "Engineering polymers", tier: "Tier 2", spend: "$27M", dependency: 49, risk: "opportunity", region: "South Africa" },
    ],
  },
};

function ToneDot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

export default function ScopeDashboard({ snapshot, projects, worldScope, region: selectedRegion, horizon, category, onHorizonChange, onCategoryChange, onScopeChange, onRegionChange, onOpenProject, onAddToProject, onTrace: emitTrace, onRefresh }: ScopeDashboardProps) {
  const [movementMode, setMovementMode] = useState<"All movements" | "At risk" | "Arriving">("All movements");
  const [moneyMode, setMoneyMode] = useState<"Cash position" | "Working capital" | "Margin">("Cash position");
  const [currency, setCurrency] = useState(snapshot.currency);
  const [reconciled, setReconciled] = useState(false);
  const activeSnapshot = worldScope === "region" ? { ...snapshot, ...regionalOperationsProfiles[selectedRegion] } : snapshot;
  const traceScopeId = worldScope === "region" ? `region-${selectedRegion.toLowerCase().replaceAll(" ", "-")}` : snapshot.id;
  const traceContext = `Operations World / ${activeSnapshot.shortLabel}`;
  const onTrace = (title: string, detail: string, artifact?: string) => emitTrace(title, detail, artifact, traceContext);

  const nodeIndex = useMemo(() => new Map(networkLocations.map((node) => [node.id, node])), []);
  const dashboardFrame: NetworkFrameId = horizon === "7 days" ? "t+7d" : horizon === "30 days" ? "t+30d" : horizon === "90 days" ? "t+90d" : "live";
  const movementRows = useMemo(() => {
    const layers = new Set<MapLayer>(["Ocean", "Air", "Road", "Rail", "Transfer", "Assets", "Cargo", "Locations"]);
    const view = getNetworkView({ scope: worldScope, region: selectedRegion, frame: dashboardFrame, scenario: "trajectory", category, movement: movementMode, layers });
    return view.corridors.map((corridor) => ({ corridor, asset: view.assets.find((candidate) => candidate.corridorId === corridor.id) }));
  }, [category, dashboardFrame, movementMode, selectedRegion, worldScope]);
  const currencyRate = currency === "EUR" ? .92 : currency === "INR" ? 83.8 : 1;
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value * currencyRate);
  const moneyFocus = {
    "Cash position": { record: activeSnapshot.money[0], lens: "Capital physically committed to the active network", change: "Reconciles movement value, payment timing, and release exposure." },
    "Working capital": { record: activeSnapshot.money[2] ?? activeSnapshot.money[1], lens: "Inventory and timing pressure across the current scope", change: "Surfaces dwell, days-on-hand, receivables, and feasible cash release." },
    Margin: { record: activeSnapshot.money[3] ?? activeSnapshot.money[0], lens: "Contribution margin connected to disruption decisions", change: "Connects service protection, premium freight, duty, and avoidable loss." },
  }[moneyMode];
  const openDependencyIntake = (selection: MapSelectionContext) => onAddToProject({ ...selection, intake: "dependency" });
  const openRouteIntake = (selection: MapSelectionContext) => onAddToProject({ ...selection, intake: "route" });
  const openValueIntake = (selection: MapSelectionContext) => onAddToProject({ ...selection, intake: "value" });

  return (
    <div className="scope-dashboard">
      <section className="view-intro operations-header">
        <div>
          <p className="kicker">{worldScope === "region" ? `${selectedRegion.toUpperCase()} NETWORK` : "NETWORK INTELLIGENCE"}</p>
          <h1 tabIndex={-1} data-page-heading>Operations World</h1>
          <p>{activeSnapshot.description}</p>
          <span className="operations-context">{activeSnapshot.context}</span>
        </div>
        <div className="operations-scope" role="group" aria-label="Operations World scope">
          <button data-action-id="operations.scope.global" type="button" className={worldScope === "global" ? "active" : ""} onClick={() => onScopeChange("global")}>Global</button>
          <button data-action-id="operations.scope.region" type="button" className={worldScope === "region" ? "active" : ""} onClick={() => onScopeChange("region")}>Regional</button>
          {worldScope === "region" && <select aria-label="Region" value={selectedRegion} onChange={(event) => onRegionChange(event.target.value as NetworkRegion)}><option>APAC</option><option>Europe</option><option value="Americas">Americas</option><option value="MEA">Middle East &amp; Africa</option></select>}
          <small><ToneDot tone="healthy" />{activeSnapshot.updated}</small>
        </div>
      </section>

      <section className="control-strip" aria-label="Operations filters">
        <div className="filter-group">
          <span>Time horizon</span>
          {["Now", "7 days", "30 days", "90 days"].map((item) => <button className={horizon === item ? "active" : ""} type="button" key={item} onClick={() => { setReconciled(false); onHorizonChange(item); }}>{item}</button>)}
        </div>
        <label>Category<select value={category} onChange={(event) => { setReconciled(false); onCategoryChange(event.target.value); }}><option>All categories</option><option>Critical materials</option><option>Electronics</option><option>Logistics</option><option>Direct materials</option></select></label>
        <label>Map currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option>USD</option><option>EUR</option><option>INR</option></select></label>
        <button className="control-refresh" type="button" onClick={() => { setReconciled(true); onRefresh(traceContext); }}>{reconciled ? "Snapshot reconciled ✓" : "Reconcile fixed snapshot ↻"}</button>
      </section>

      <section className="metric-grid" aria-label={`${activeSnapshot.title} summary metrics`}>
        {activeSnapshot.metrics.map((metric) => (
          <button data-action-id={`dashboard.trace.metric.${metric.label}`} type="button" className={`metric-card metric-${metric.tone}`} key={metric.label} onClick={() => onTrace(`${metric.label} evidence opened`, `${metric.value} · ${metric.detail} · trend ${metric.trend}. Source: deterministic ${activeSnapshot.title} fixture; filters: ${horizon}, ${category}; no operational system contacted.`, `EVIDENCE-${traceScopeId.toUpperCase()}-${metric.label.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>
            <div><span>{metric.label}</span><ToneDot tone={metric.tone} /></div>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
            <small>{metric.trend} · ◇ trace</small>
          </button>
        ))}
      </section>

      <section className="decision-brief panel" aria-labelledby="project-activity-title">
        <header className="panel-header"><div><p className="kicker">PROJECT ACTIVITY</p><h2 id="project-activity-title">Work using these signals</h2><span>Decision tools, applications, project data, agents, and reviews open only after a governed project is selected.</span></div><button type="button" onClick={() => onAddToProject()}>Start project intake</button></header>
        <div className="decision-brief-grid">
          {projects.slice(0, 3).map((item) => <button className="decision-brief-card" type="button" key={item.id} onClick={() => onOpenProject(item.id)}>
            <header><span><i className={`severity-${item.health === "critical" ? "critical" : "high"}`} />{item.code}</span><em>{item.stage}</em></header>
            <h3>{item.name}</h3><p>{item.problem}</p>
            <div className="decision-brief-meta"><span><small>CLIENT</small><b>{item.client}</b></span><span><small>OWNER</small><b>{item.owner}</b></span></div>
            <footer><span>{item.sector}</span><b>Open project</b></footer>
          </button>)}
        </div>
      </section>

      <section className="map-card panel" aria-label="Interactive global logistics radar">
        <WorldNetworkMap
          category={category}
          currency={currency}
          horizon={horizon}
          key={`${snapshot.id}-${selectedRegion}-${horizon}`}
          movement={movementMode}
          onMovementChange={setMovementMode}
          onOpenOptimizer={openRouteIntake}
          onOpenFlow={openValueIntake}
          onOpenRisk={openDependencyIntake}
          onTrace={onTrace}
          region={selectedRegion}
          scope={worldScope}
        />
      </section>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel intel-panel" aria-labelledby="intel-title">
          <header className="panel-header"><div><p className="kicker">PRIORITY SIGNALS</p><h2 id="intel-title">What changed</h2></div><button type="button" onClick={() => onAddToProject()}>Start project intake</button></header>
          <div className="intel-list">{activeSnapshot.intel.map((intel, index) => <article key={intel.id}><span className={`intel-rank intel-rank-${intel.tone}`}>0{index + 1}</span><div><div className="intel-meta"><span>{intel.source}</span><b>{intel.confidence}% confidence</b><em>{intel.horizon}</em></div><h3>{intel.title}</h3><p>{intel.detail}</p></div><button className="inline-evidence" type="button" onClick={() => onTrace(`${intel.id} intelligence evidence opened`, `${activeSnapshot.title} · ${intel.impact} · ${intel.confidence}% fixture confidence · ${intel.horizon}. ${intel.detail} Source label: ${intel.source}.`, `${traceScopeId.toUpperCase()}-${intel.id}`)}>{intel.impact}<small>Trace</small></button><button type="button" aria-label={`Add ${intel.title} to a project intake`} onClick={() => onAddToProject()}>+</button></article>)}</div>
        </section>

        <section className="panel money-panel" aria-labelledby="money-title">
          <header className="panel-header"><div><p className="kicker">MONEY FLOW</p><h2 id="money-title">Cash connected to operations</h2></div></header>
          <div className="segmented-control">{(["Cash position", "Working capital", "Margin"] as const).map((item) => <button className={moneyMode === item ? "active" : ""} type="button" key={item} onClick={() => setMoneyMode(item)}>{item}</button>)}</div>
          {moneyFocus && <article className="money-mode-focus"><div><span>{moneyMode.toUpperCase()} LENS</span><b>{moneyFocus.record.value}</b></div><strong>{moneyFocus.lens}</strong><small>{moneyFocus.record.detail} · {moneyFocus.change}</small><button type="button" onClick={() => onTrace(`${moneyMode} evidence opened`, `${activeSnapshot.title} · ${moneyFocus.record.value} · ${moneyFocus.record.detail}. Deterministic money-flow fixture; currency display ${currency}.`, `EVIDENCE-${traceScopeId.toUpperCase()}-MONEY-${moneyMode.toUpperCase().replaceAll(" ", "-")}`)}>Trace lens fixture ◇</button></article>}
          <div className="money-list">{activeSnapshot.money.map((item) => <article key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><div className="progress-track"><i className={`fill-${item.tone}`} style={{ width: `${item.percent}%` }} /></div><small>{item.detail}</small><button type="button" onClick={() => onTrace(`${item.label} evidence opened`, `${activeSnapshot.title} · ${item.value} · ${item.percent}% display index · ${item.detail}. Deterministic money-flow fixture.`, `EVIDENCE-${traceScopeId.toUpperCase()}-MONEY-${item.label.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>Trace ◇</button></article>)}</div>
          <button className="text-action" type="button" onClick={() => onAddToProject()}>Start project intake</button>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <section className="panel movement-panel" aria-labelledby="movement-title">
          <header className="panel-header"><div><p className="kicker">MOVEMENTS + CARGO · SHARED RADAR MODEL</p><h2 id="movement-title">Ships, lanes, cargo, and committed orders</h2><span>{activeSnapshot.title} · {dashboardFrame.toUpperCase()} · current trajectory · same filtered corridor records as the map</span></div><div className="segmented-control compact">{(["All movements", "At risk", "Arriving"] as const).map((item) => <button className={movementMode === item ? "active" : ""} type="button" key={item} onClick={() => setMovementMode(item)}>{item}</button>)}</div></header>
          <div className="table-scroll"><table><thead><tr><th>Asset / corridor</th><th>Mode</th><th>Committed volume</th><th>Goods value</th><th>ETA / reliability</th><th /></tr></thead><tbody>{movementRows.slice(0, 6).map(({ corridor, asset }) => <tr key={corridor.id}><td><span className="asset-cell"><ToneDot tone={corridor.status} /><span><b>{asset?.demoIdentifier ?? corridor.service}</b><small>{nodeIndex.get(corridor.from)?.name} → {nodeIndex.get(corridor.to)?.name}</small></span></span></td><td>{corridor.mode}</td><td>{corridor.committedUnits.toLocaleString()} {corridor.capacityUom}</td><td>{formatMoney(corridor.goodsValueUsd)}</td><td><b>{corridor.etaVarianceHours > 0 ? `+${corridor.etaVarianceHours}h` : `${corridor.etaVarianceHours}h`} · {corridor.reliabilityPercent}%</b></td><td><button type="button" aria-label={`Trace ${corridor.service}`} onClick={() => onTrace(`${corridor.service} corridor evidence opened`, `${activeSnapshot.title} · ${corridor.committedUnits.toLocaleString()} ${corridor.capacityUom} committed · ${formatMoney(corridor.goodsValueUsd)} goods value · ${corridor.etaVarianceHours}h ETA variance · ${corridor.reliabilityPercent}% fixture reliability. Frame ${dashboardFrame}; deterministic network fixture.`, `${traceScopeId.toUpperCase()}-${corridor.id}`)}>Trace ◇</button></td></tr>)}</tbody></table>{movementRows.length === 0 && <div className="empty-table-state">No corridors match the current scope, horizon, category, and movement filters.</div>}</div>
        </section>

        <section className="panel supplier-panel" aria-labelledby="supplier-title">
          <header className="panel-header"><div><p className="kicker">SUPPLIER CRITICALITY</p><h2 id="supplier-title">Dependencies requiring attention</h2></div><button type="button" onClick={() => onAddToProject()}>Start project intake</button></header>
          <div className="supplier-list">{activeSnapshot.suppliers.map((supplier) => <article key={supplier.name}><div className="supplier-head"><ToneDot tone={supplier.risk} /><span><b>{supplier.name}</b><small>{supplier.category} · {supplier.region}</small></span><em>{supplier.tier}</em></div><div><span>Dependency <b>{supplier.dependency}%</b></span><div className="progress-track"><i className={`fill-${supplier.risk}`} style={{ width: `${supplier.dependency}%` }} /></div><strong>{supplier.spend}</strong><button type="button" onClick={() => onTrace(`${supplier.name} dependency evidence opened`, `${activeSnapshot.title} · ${supplier.dependency}% fixture dependency · ${supplier.spend} illustrative spend · ${supplier.category} · ${supplier.region}. Deterministic supplier fixture.`, `EVIDENCE-${traceScopeId.toUpperCase()}-SUPPLIER-${supplier.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>Trace ◇</button></div></article>)}</div>
          <button className="secondary-action" type="button" onClick={() => onAddToProject()}>Start sourcing project intake</button>
        </section>
      </div>
    </div>
  );
}
