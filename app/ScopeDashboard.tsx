"use client";

import { useMemo, useState } from "react";
import { applications, type DecisionCase, type NetworkNode, type ScopeSnapshot, type StatusTone } from "./platform-model";

type ScopeDashboardProps = {
  snapshot: ScopeSnapshot;
  cases: readonly DecisionCase[];
  horizon: string;
  category: string;
  onHorizonChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOpenRisk: () => void;
  onOpenOptimizer: () => void;
  onOpenCase: (caseId: string) => void;
  onOpenDecisions: () => void;
};

function ToneDot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

function MapNodeButton({ node, selected, onSelect }: { node: NetworkNode; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`map-node map-node-${node.kind} map-node-${node.tone} ${selected ? "selected" : ""}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <i aria-hidden="true" />
      <span><b>{node.name}</b><small>{node.kind}</small></span>
    </button>
  );
}

export default function ScopeDashboard({ snapshot, cases, horizon, category, onHorizonChange, onCategoryChange, onOpenRisk, onOpenOptimizer, onOpenCase, onOpenDecisions }: ScopeDashboardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState(snapshot.nodes[0]?.id ?? "");
  const [movementMode, setMovementMode] = useState("All movements");
  const [moneyMode, setMoneyMode] = useState("Cash position");

  const selectedNode = snapshot.nodes.find((node) => node.id === selectedNodeId) ?? snapshot.nodes[0];
  const nodeIndex = useMemo(() => new Map(snapshot.nodes.map((node) => [node.id, node])), [snapshot.nodes]);

  return (
    <div className="scope-dashboard">
      <section className="view-intro">
        <div>
          <p className="kicker">{snapshot.label.toUpperCase()} · LIVE OPERATING PICTURE</p>
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
          {["Live", "7 days", "30 days", "90 days"].map((item) => <button className={horizon === item ? "active" : ""} type="button" key={item} onClick={() => onHorizonChange(item)}>{item}</button>)}
        </div>
        <label>Category<select value={category} onChange={(event) => onCategoryChange(event.target.value)}><option>All categories</option><option>Critical materials</option><option>Electronics</option><option>Logistics</option><option>Direct materials</option></select></label>
        <label>Currency<select defaultValue={snapshot.currency}><option>USD</option><option>EUR</option><option>INR</option><option>Local currency</option></select></label>
        <button className="control-refresh" type="button">Refresh intelligence ↻</button>
      </section>

      <section className="metric-grid" aria-label={`${snapshot.label} summary metrics`}>
        {snapshot.metrics.map((metric) => (
          <article className={`metric-card metric-${metric.tone}`} key={metric.label}>
            <div><span>{metric.label}</span><ToneDot tone={metric.tone} /></div>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
            <small>{metric.trend}</small>
          </article>
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

      <section className="map-card panel" aria-labelledby="network-map-title">
        <header className="panel-header map-header">
          <div><p className="kicker">NETWORK MAP</p><h2 id="network-map-title">Value, material, and commitments in motion</h2><span>Click a node to inspect orders, cargo, suppliers, and exposure.</span></div>
          <div className="map-legend"><span><ToneDot tone="healthy" />On plan</span><span><ToneDot tone="watch" />Watch</span><span><ToneDot tone="critical" />Critical</span><span><ToneDot tone="opportunity" />Opportunity</span></div>
        </header>
        <div className="map-layout">
          <div className={`network-map network-map-${snapshot.id}`}>
            <span className="map-region map-region-americas">AMERICAS</span>
            <span className="map-region map-region-europe">EUROPE</span>
            <span className="map-region map-region-asia">ASIA PACIFIC</span>
            <span className="map-region map-region-africa">MEA</span>
            {snapshot.routes.map((route) => {
              const from = nodeIndex.get(route.from);
              const to = nodeIndex.get(route.to);
              if (!from || !to) return null;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              return <i key={route.id} className={`route-line route-${route.status}`} style={{ left: `${from.x}%`, top: `${from.y}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }} aria-hidden="true"><em /></i>;
            })}
            {snapshot.nodes.map((node) => <MapNodeButton node={node} selected={node.id === selectedNode?.id} onSelect={() => setSelectedNodeId(node.id)} key={node.id} />)}
            <div className="map-scale"><span>LIVE NETWORK TWIN</span><b>{snapshot.routes.length} active corridors shown</b></div>
          </div>
          {selectedNode && (
            <aside className="node-inspector" aria-live="polite">
              <div className="node-inspector-title"><span className={`node-kind node-kind-${selectedNode.kind}`}>{selectedNode.kind.slice(0, 2).toUpperCase()}</span><div><p className="kicker">SELECTED NODE</p><h3>{selectedNode.name}</h3></div><ToneDot tone={selectedNode.tone} /></div>
              <p>{selectedNode.detail}</p>
              <dl><div><dt>Open demand</dt><dd>{selectedNode.orders}</dd></div><div><dt>Value connected</dt><dd>{selectedNode.value}</dd></div><div><dt>Current state</dt><dd>{selectedNode.tone}</dd></div></dl>
              <div className="inspector-routes"><p className="kicker">CONNECTED MOVEMENTS</p>{snapshot.routes.filter((route) => route.from === selectedNode.id || route.to === selectedNode.id).slice(0, 3).map((route) => <button type="button" key={route.id}><ToneDot tone={route.status} /><span><b>{route.asset}</b><small>{route.mode} · {route.volume} · {route.eta}</small></span><em>→</em></button>)}</div>
              <button className="primary-action" type="button" onClick={onOpenRisk}>Trace dependencies in RiskRadar →</button>
            </aside>
          )}
        </div>
      </section>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel intel-panel" aria-labelledby="intel-title">
          <header className="panel-header"><div><p className="kicker">MOST IMPORTANT INTELLIGENCE</p><h2 id="intel-title">What changed—and why it matters here</h2></div><button type="button" onClick={onOpenRisk}>Open RiskRadar →</button></header>
          <div className="intel-list">{snapshot.intel.map((intel, index) => <article key={intel.id}><span className={`intel-rank intel-rank-${intel.tone}`}>0{index + 1}</span><div><div className="intel-meta"><span>{intel.source}</span><b>{intel.confidence}% confidence</b><em>{intel.horizon}</em></div><h3>{intel.title}</h3><p>{intel.detail}</p></div><strong>{intel.impact}</strong><button type="button" aria-label={`Open ${intel.title}`}>→</button></article>)}</div>
        </section>

        <section className="panel money-panel" aria-labelledby="money-title">
          <header className="panel-header"><div><p className="kicker">MONEY FLOW</p><h2 id="money-title">Cash connected to operations</h2></div></header>
          <div className="segmented-control">{["Cash position", "Working capital", "Margin"].map((item) => <button className={moneyMode === item ? "active" : ""} type="button" key={item} onClick={() => setMoneyMode(item)}>{item}</button>)}</div>
          <div className="money-list">{snapshot.money.map((item) => <article key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><div className="progress-track"><i className={`fill-${item.tone}`} style={{ width: `${item.percent}%` }} /></div><small>{item.detail}</small></article>)}</div>
          <button className="text-action" type="button">Open FlowLens →</button>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <section className="panel movement-panel" aria-labelledby="movement-title">
          <header className="panel-header"><div><p className="kicker">MOVEMENTS + CARGO</p><h2 id="movement-title">Ships, lanes, cargo, and committed orders</h2></div><div className="segmented-control compact">{["All movements", "At risk", "Arriving"].map((item) => <button className={movementMode === item ? "active" : ""} type="button" key={item} onClick={() => setMovementMode(item)}>{item}</button>)}</div></header>
          <div className="table-scroll"><table><thead><tr><th>Asset / lane</th><th>Mode</th><th>Cargo volume</th><th>Order value</th><th>ETA / state</th><th /></tr></thead><tbody>{snapshot.routes.slice(0, 6).map((route) => <tr key={route.id}><td><span className="asset-cell"><ToneDot tone={route.status} /><span><b>{route.asset}</b><small>{nodeIndex.get(route.from)?.name} → {nodeIndex.get(route.to)?.name}</small></span></span></td><td>{route.mode}</td><td>{route.volume}</td><td>{route.value}</td><td><b>{route.eta}</b></td><td><button type="button" aria-label={`Inspect ${route.asset}`}>Inspect</button></td></tr>)}</tbody></table></div>
        </section>

        <section className="panel supplier-panel" aria-labelledby="supplier-title">
          <header className="panel-header"><div><p className="kicker">SUPPLIER CRITICALITY</p><h2 id="supplier-title">Dependencies requiring attention</h2></div><button type="button">SupplierGraph →</button></header>
          <div className="supplier-list">{snapshot.suppliers.map((supplier) => <article key={supplier.name}><div className="supplier-head"><ToneDot tone={supplier.risk} /><span><b>{supplier.name}</b><small>{supplier.category} · {supplier.region}</small></span><em>{supplier.tier}</em></div><div><span>Dependency <b>{supplier.dependency}%</b></span><div className="progress-track"><i className={`fill-${supplier.risk}`} style={{ width: `${supplier.dependency}%` }} /></div><strong>{supplier.spend}</strong></div></article>)}</div>
          <button className="secondary-action" type="button" onClick={onOpenOptimizer}>Optimize sourcing response</button>
        </section>
      </div>
    </div>
  );
}
