"use client";

import { useMemo, useState } from "react";
import WorldNetworkMap, { type MapSelectionContext } from "./WorldNetworkMap";
import { getNetworkView, networkLocations, type MapLayer, type NetworkFrameId } from "./network-operations-model";
import { applications, type DecisionCase, type ScopeSnapshot, type StatusTone } from "./platform-model";

type ScopeDashboardProps = {
  snapshot: ScopeSnapshot;
  cases: readonly DecisionCase[];
  horizon: string;
  category: string;
  onHorizonChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOpenRisk: (selection?: MapSelectionContext) => void;
  onOpenOptimizer: (selection?: MapSelectionContext) => void;
  onOpenFlow: (selection?: MapSelectionContext) => void;
  onOpenSupplier: () => void;
  onOpenCase: (caseId: string) => void;
  onOpenDecisions: () => void;
  onTrace: (title: string, detail: string, artifact?: string) => void;
  onRefresh: () => void;
};

function ToneDot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

export default function ScopeDashboard({ snapshot, cases, horizon, category, onHorizonChange, onCategoryChange, onOpenRisk, onOpenOptimizer, onOpenFlow, onOpenSupplier, onOpenCase, onOpenDecisions, onTrace, onRefresh }: ScopeDashboardProps) {
  const [movementMode, setMovementMode] = useState<"All movements" | "At risk" | "Arriving">("All movements");
  const [moneyMode, setMoneyMode] = useState<"Cash position" | "Working capital" | "Margin">("Cash position");
  const [currency, setCurrency] = useState(snapshot.currency);
  const [reconciled, setReconciled] = useState(false);

  const nodeIndex = useMemo(() => new Map(networkLocations.map((node) => [node.id, node])), []);
  const dashboardFrame: NetworkFrameId = horizon === "7 days" ? "t+7d" : horizon === "30 days" ? "t+30d" : horizon === "90 days" ? "t+90d" : "live";
  const movementRows = useMemo(() => {
    const layers = new Set<MapLayer>(["Ocean", "Air", "Road", "Rail", "Transfer", "Assets", "Cargo", "Locations"]);
    const view = getNetworkView({ scope: snapshot.id, frame: dashboardFrame, scenario: "trajectory", category, movement: movementMode, layers });
    return view.corridors.map((corridor) => ({ corridor, asset: view.assets.find((candidate) => candidate.corridorId === corridor.id) }));
  }, [category, dashboardFrame, movementMode, snapshot.id]);
  const currencyRate = currency === "EUR" ? .92 : currency === "INR" ? 83.8 : 1;
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value * currencyRate);
  const moneyFocus = {
    "Cash position": { record: snapshot.money[0], lens: "Capital physically committed to the active network", change: "Reconciles movement value, payment timing, and release exposure." },
    "Working capital": { record: snapshot.money[2] ?? snapshot.money[1], lens: "Inventory and timing pressure across the current scope", change: "Surfaces dwell, days-on-hand, receivables, and feasible cash release." },
    Margin: { record: snapshot.money[3] ?? snapshot.money[0], lens: "Contribution margin connected to disruption decisions", change: "Connects service protection, premium freight, duty, and avoidable loss." },
  }[moneyMode];

  return (
    <div className="scope-dashboard">
      <section className="view-intro">
        <div>
          <p className="kicker">{snapshot.label.toUpperCase()} · SYNTHETIC OPERATING PICTURE</p>
          <h1 tabIndex={-1} data-page-heading>{snapshot.title}</h1>
          <p>{snapshot.description}</p>
        </div>
        <div className="intro-meta">
          <span><ToneDot tone="healthy" />{snapshot.updated}</span>
          <b>{snapshot.context}</b>
          <small>Illustrative workspace · No operational write-back</small>
        </div>
      </section>

      <section className="control-strip" aria-label="Dashboard filters">
        <div className="filter-group">
          <span>Time horizon</span>
          {["Now", "7 days", "30 days", "90 days"].map((item) => <button className={horizon === item ? "active" : ""} type="button" key={item} onClick={() => { setReconciled(false); onHorizonChange(item); }}>{item}</button>)}
        </div>
        <label>Category<select value={category} onChange={(event) => { setReconciled(false); onCategoryChange(event.target.value); }}><option>All categories</option><option>Critical materials</option><option>Electronics</option><option>Logistics</option><option>Direct materials</option></select></label>
        <label>Map currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option>USD</option><option>EUR</option><option>INR</option></select></label>
        <button className="control-refresh" type="button" onClick={() => { setReconciled(true); onRefresh(); }}>{reconciled ? "Snapshot reconciled ✓" : "Reconcile fixed snapshot ↻"}</button>
      </section>

      <section className="metric-grid" aria-label={`${snapshot.label} summary metrics`}>
        {snapshot.metrics.map((metric) => (
          <button data-action-id={`dashboard.trace.metric.${metric.label}`} type="button" className={`metric-card metric-${metric.tone}`} key={metric.label} onClick={() => onTrace(`${metric.label} evidence opened`, `${metric.value} · ${metric.detail} · trend ${metric.trend}. Source: ${snapshot.id} deterministic scope fixture; filters: ${horizon}, ${category}; no operational system contacted.`, `EVIDENCE-${snapshot.id.toUpperCase()}-${metric.label.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>
            <div><span>{metric.label}</span><ToneDot tone={metric.tone} /></div>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
            <small>{metric.trend} · ◇ trace</small>
          </button>
        ))}
      </section>

      <section className="decision-brief panel" aria-labelledby="decisions-in-motion-title">
        <header className="panel-header"><div><p className="kicker">DECISIONS IN MOTION</p><h2 id="decisions-in-motion-title">From signal to measured outcome</h2><span>Cases combine the five decision apps, shared variables, OR methods, evidence, and execution ownership.</span></div><button type="button" onClick={onOpenDecisions}>Open Decision Inbox →</button></header>
        <div className="decision-brief-grid">
          {cases.slice(0, 3).map((item) => <button className="decision-brief-card" type="button" key={item.id} onClick={() => onOpenCase(item.id)}>
            <header><span><i className={`severity-${item.severity.toLowerCase()}`} />{item.id}</span><em>{item.stage} · {item.status}</em></header>
            <h3>{item.title}</h3><p>{item.summary}</p>
            <div className="decision-brief-meta"><span><small>VALUE</small><b>{item.value}</b></span><span><small>OWNER / DUE</small><b>{item.owner} · {item.due}</b></span></div>
            <footer><span>{item.contributions.map((contribution) => applications.find((app) => app.id === contribution.app)?.icon).join(" · ")}</span><b>Open case →</b></footer>
          </button>)}
        </div>
      </section>

      <section className="map-card panel" aria-label="Interactive global logistics radar">
        <WorldNetworkMap
          category={category}
          currency={currency}
          horizon={horizon}
          key={`${snapshot.id}-${horizon}`}
          movement={movementMode}
          onMovementChange={setMovementMode}
          onOpenOptimizer={onOpenOptimizer}
          onOpenFlow={onOpenFlow}
          onOpenRisk={onOpenRisk}
          onTrace={onTrace}
          scope={snapshot.id}
        />
      </section>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel intel-panel" aria-labelledby="intel-title">
          <header className="panel-header"><div><p className="kicker">MOST IMPORTANT INTELLIGENCE</p><h2 id="intel-title">What changed—and why it matters here</h2></div><button type="button" onClick={() => onOpenRisk()}>Open RiskRadar →</button></header>
          <div className="intel-list">{snapshot.intel.map((intel, index) => <article key={intel.id}><span className={`intel-rank intel-rank-${intel.tone}`}>0{index + 1}</span><div><div className="intel-meta"><span>{intel.source}</span><b>{intel.confidence}% confidence</b><em>{intel.horizon}</em></div><h3>{intel.title}</h3><p>{intel.detail}</p></div><button className="inline-evidence" type="button" onClick={() => onTrace(`${intel.id} intelligence evidence opened`, `${intel.impact} · ${intel.confidence}% fixture confidence · ${intel.horizon}. ${intel.detail} Source label: ${intel.source}.`, intel.id)}>{intel.impact}<small>◇ trace</small></button><button type="button" aria-label={`Open ${intel.title}`} onClick={() => onOpenRisk()}>→</button></article>)}</div>
        </section>

        <section className="panel money-panel" aria-labelledby="money-title">
          <header className="panel-header"><div><p className="kicker">MONEY FLOW</p><h2 id="money-title">Cash connected to operations</h2></div></header>
          <div className="segmented-control">{(["Cash position", "Working capital", "Margin"] as const).map((item) => <button className={moneyMode === item ? "active" : ""} type="button" key={item} onClick={() => setMoneyMode(item)}>{item}</button>)}</div>
          {moneyFocus && <article className="money-mode-focus"><div><span>{moneyMode.toUpperCase()} LENS</span><b>{moneyFocus.record.value}</b></div><strong>{moneyFocus.lens}</strong><small>{moneyFocus.record.detail} · {moneyFocus.change}</small><button type="button" onClick={() => onTrace(`${moneyMode} evidence opened`, `${moneyFocus.record.value} · ${moneyFocus.record.detail}. Deterministic ${snapshot.id} money-flow fixture; currency display ${currency}.`, `EVIDENCE-${snapshot.id.toUpperCase()}-MONEY-${moneyMode.toUpperCase().replaceAll(" ", "-")}`)}>Trace lens fixture ◇</button></article>}
          <div className="money-list">{snapshot.money.map((item) => <article key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><div className="progress-track"><i className={`fill-${item.tone}`} style={{ width: `${item.percent}%` }} /></div><small>{item.detail}</small><button type="button" onClick={() => onTrace(`${item.label} evidence opened`, `${item.value} · ${item.percent}% display index · ${item.detail}. Deterministic ${snapshot.id} money-flow fixture.`, `EVIDENCE-${snapshot.id.toUpperCase()}-MONEY-${item.label.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>Trace ◇</button></article>)}</div>
          <button className="text-action" type="button" onClick={() => onOpenFlow()}>Open FlowLens →</button>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <section className="panel movement-panel" aria-labelledby="movement-title">
          <header className="panel-header"><div><p className="kicker">MOVEMENTS + CARGO · SHARED RADAR MODEL</p><h2 id="movement-title">Ships, lanes, cargo, and committed orders</h2><span>{dashboardFrame.toUpperCase()} · current trajectory · same filtered corridor records as the map</span></div><div className="segmented-control compact">{(["All movements", "At risk", "Arriving"] as const).map((item) => <button className={movementMode === item ? "active" : ""} type="button" key={item} onClick={() => setMovementMode(item)}>{item}</button>)}</div></header>
          <div className="table-scroll"><table><thead><tr><th>Asset / corridor</th><th>Mode</th><th>Committed volume</th><th>Goods value</th><th>ETA / reliability</th><th /></tr></thead><tbody>{movementRows.slice(0, 6).map(({ corridor, asset }) => <tr key={corridor.id}><td><span className="asset-cell"><ToneDot tone={corridor.status} /><span><b>{asset?.demoIdentifier ?? corridor.service}</b><small>{nodeIndex.get(corridor.from)?.name} → {nodeIndex.get(corridor.to)?.name}</small></span></span></td><td>{corridor.mode}</td><td>{corridor.committedUnits.toLocaleString()} {corridor.capacityUom}</td><td>{formatMoney(corridor.goodsValueUsd)}</td><td><b>{corridor.etaVarianceHours > 0 ? `+${corridor.etaVarianceHours}h` : `${corridor.etaVarianceHours}h`} · {corridor.reliabilityPercent}%</b></td><td><button type="button" aria-label={`Trace ${corridor.service}`} onClick={() => onTrace(`${corridor.service} corridor evidence opened`, `${corridor.committedUnits.toLocaleString()} ${corridor.capacityUom} committed · ${formatMoney(corridor.goodsValueUsd)} goods value · ${corridor.etaVarianceHours}h ETA variance · ${corridor.reliabilityPercent}% fixture reliability. Frame ${dashboardFrame}; deterministic network fixture.`, corridor.id)}>Trace ◇</button></td></tr>)}</tbody></table>{movementRows.length === 0 && <div className="empty-table-state">No corridors match the current scope, horizon, category, and movement filters.</div>}</div>
        </section>

        <section className="panel supplier-panel" aria-labelledby="supplier-title">
          <header className="panel-header"><div><p className="kicker">SUPPLIER CRITICALITY</p><h2 id="supplier-title">Dependencies requiring attention</h2></div><button type="button" onClick={onOpenSupplier}>SupplierGraph →</button></header>
          <div className="supplier-list">{snapshot.suppliers.map((supplier) => <article key={supplier.name}><div className="supplier-head"><ToneDot tone={supplier.risk} /><span><b>{supplier.name}</b><small>{supplier.category} · {supplier.region}</small></span><em>{supplier.tier}</em></div><div><span>Dependency <b>{supplier.dependency}%</b></span><div className="progress-track"><i className={`fill-${supplier.risk}`} style={{ width: `${supplier.dependency}%` }} /></div><strong>{supplier.spend}</strong><button type="button" onClick={() => onTrace(`${supplier.name} dependency evidence opened`, `${supplier.dependency}% fixture dependency · ${supplier.spend} illustrative spend · ${supplier.category} · ${supplier.region}. Deterministic ${snapshot.id} supplier fixture.`, `EVIDENCE-${snapshot.id.toUpperCase()}-SUPPLIER-${supplier.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`)}>Trace ◇</button></div></article>)}</div>
          <button className="secondary-action" type="button" onClick={() => onOpenOptimizer()}>Optimize sourcing response</button>
        </section>
      </div>
    </div>
  );
}
