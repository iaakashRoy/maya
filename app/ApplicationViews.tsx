"use client";

import { useState } from "react";
import ApplicationOperatingModel from "./ApplicationOperatingModel";
import OptimizationWorkbench from "./OptimizationWorkbench";
import type { MapSelectionContext } from "./WorldNetworkMap";
import { getNetworkView, type MapLayer } from "./network-operations-model";
import { type AppId, type DecisionCase, type ScopeSnapshot, type StatusTone } from "./platform-model";

type ApplicationViewsProps = {
  app: AppId;
  snapshot: ScopeSnapshot;
  activeCase: DecisionCase;
  networkSelection: MapSelectionContext | null;
  onClearNetworkSelection: () => void;
  onOpenCase: () => void;
  onOpenAction: () => void;
  onOpenAgents: () => void;
  onOpenGraph: () => void;
  onToast: (message: string) => void;
};

function Dot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

function AppIntro({ code, title, body, scope, outcome, actions }: { code: string; title: string; body: string; scope: string; outcome: string; actions?: React.ReactNode }) {
  return (
    <section className="app-intro">
      <div className="app-code">{code}</div>
      <div><p className="kicker">DECISION APPLICATION · {scope.toUpperCase()}</p><h1 tabIndex={-1} data-page-heading>{title}</h1><p>{body}</p></div>
      <aside><span>USER OUTCOME</span><b>{outcome}</b>{actions}</aside>
    </section>
  );
}

function AppMetric({ label, value, detail, tone = "info" }: { label: string; value: string; detail: string; tone?: StatusTone }) {
  return <article className={`app-metric app-metric-${tone}`}><div><span>{label}</span><Dot tone={tone} /></div><strong>{value}</strong><p>{detail}</p></article>;
}

function NetworkContextBridge({ app, snapshot, selection, onClear }: { app: AppId; snapshot: ScopeSnapshot; selection: MapSelectionContext; onClear: () => void }) {
  const layers = new Set<MapLayer>(["Ocean", "Air", "Road", "Rail", "Transfer", "Assets", "Cargo", "Locations"]);
  const view = getNetworkView({ scope: snapshot.id, frame: selection.frame, scenario: selection.scenario, category: "All categories", movement: "All movements", layers });
  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
  const facts: readonly [string, string][] = (() => {
    if (selection.kind === "corridor") {
      const item = view.corridors.find((candidate) => candidate.id === selection.id);
      return item ? [["Committed", `${item.committedUnits.toLocaleString()} ${item.capacityUom}`], ["Weight / container", `${item.tonnes.toLocaleString()} t · ${item.teu.toLocaleString()} TEU`], ["Goods / freight", `${money(item.goodsValueUsd)} · ${money(item.freightUsd)}`], ["ETA / reliability", `${item.etaVarianceHours >= 0 ? "+" : ""}${item.etaVarianceHours}h · ${item.reliabilityPercent}%`]] : [];
    }
    if (selection.kind === "asset") {
      const item = view.assets.find((candidate) => candidate.id === selection.id);
      const cargo = view.cargo.filter((lot) => lot.assetId === selection.id);
      return item ? [["Progress", `${item.progressPercent}% · ${item.telemetryState}`], ["Motion", `${item.speed} ${item.speedUnit} · heading ${item.headingDegrees}°`], ["Cargo sample", `${cargo.length} lots · ${money(cargo.reduce((sum, lot) => sum + lot.goodsValueUsd, 0))}`], ["ETA", new Date(item.etaIso).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC"]] : [];
    }
    if (selection.kind === "cargo") {
      const item = view.cargo.find((candidate) => candidate.id === selection.id);
      return item ? [["Quantity", `${item.quantity.toLocaleString()} ${item.uom}`], ["Weight / cube", `${(item.weightKg / 1_000).toFixed(1)} t · ${item.cubeM3.toFixed(1)} m³`], ["Goods / freight", `${money(item.goodsValueUsd)} · ${money(item.freightUsd)}`], ["Margin / orders", `${money(item.marginExposureUsd)} · ${item.orderCount} orders`]] : [];
    }
    if (selection.kind === "location") {
      const item = view.locations.find((candidate) => candidate.id === selection.id);
      return item ? [["Facility", `${item.kind} · ${item.country}`], ["Capacity / use", `${item.capacityPerDay.toLocaleString()}/day · ${item.utilizationPercent}%`], ["Dwell / orders", `${item.dwellHours}h · ${item.openOrders.toLocaleString()}`], ["Connected value", money(item.connectedValueUsd)]] : [];
    }
    const item = view.transfers.find((candidate) => candidate.id === selection.id);
    return item ? [["Quantity", `${item.quantityUnits.toLocaleString()} ${item.quantityUom}`], ["Goods value", money(item.goodsValueUsd)], ["Dwell", `${item.dwellHours}h`], ["Custody", `${item.inboundAssetId} → ${item.outboundAssetId}`]] : [];
  })();
  const lens: Record<AppId, string> = {
    risk: "Trace dependency, delay, reliability, and downstream exposure from this exact network record.",
    optimizer: "Bind this entity, frame, and scenario into the deterministic decision contract and result fingerprint.",
    flow: "Connect physical progress, freight, goods value, working capital, margin, and order-to-cash timing.",
    demand: "Relate the selected network constraint to affected product-market demand and service scenarios.",
    suppliers: "Trace the selected movement or hub to qualified suppliers, dependencies, evidence, and alternatives.",
  };
  return <section className="network-context-bridge" aria-label="Shared network selection"><header><div><p className="kicker">SHARED NETWORK DATA CONTRACT · {selection.kind.toUpperCase()}</p><h2>{selection.label}</h2><span>{selection.id} · {selection.frame.toUpperCase()} · {selection.scenario.replace("-", " ")}</span></div><button type="button" onClick={onClear}>Clear map focus ×</button></header><p>{lens[app]}</p>{facts.length > 0 ? <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <aside>Selected record is outside this scope/filter fixture. Clear the focus or return to the scope radar.</aside>}<footer><span>Canonical entity key retained across applications</span><b>Deterministic synthetic data · no live tracking or write-back</b></footer></section>;
}

function RiskRadar({ snapshot, onOpenGraph, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onOpenGraph" | "onToast">) {
  const [riskMode, setRiskMode] = useState("Procurement criticality");
  const [category, setCategory] = useState("All categories");
  const [horizon, setHorizon] = useState("90 days");
  const [selectedDependencyName, setSelectedDependencyName] = useState("Graphite G-142");
  const [evidenceRevision, setEvidenceRevision] = useState(18);
  const dependencies = [
    { name: "Graphite G-142", family: "Critical material", category: "Critical materials", criticality: 96, probability: 82, exposureM: 4.2, source: "NeoGraph Materials", recovery: "14–22 wk", signal: "Merchant capacity reservation", caseReady: true, tone: "critical" as const },
    { name: "IGBT controller A7", family: "Power electronics", category: "Electronics", criticality: 88, probability: 61, exposureM: 7.8, source: "Hanwa Microdevices", recovery: "10–16 wk", signal: "Fab allocation tightening", caseReady: true, tone: "watch" as const },
    { name: "AX-4 housing", family: "Precision casting", category: "Castings", criticality: 72, probability: 34, exposureM: 2.1, source: "Apex Castings", recovery: "8–12 wk", signal: "Expansion audit pending", caseReady: true, tone: "opportunity" as const },
    { name: "42CrMo4 steel", family: "Specialty steel", category: "Critical materials", criticality: 64, probability: 46, exposureM: 6.4, source: "NordSteel AB", recovery: "6–10 wk", signal: "Carbon evidence incomplete", caseReady: false, tone: "watch" as const },
    { name: "Seal compound V9", family: "Elastomers", category: "Critical materials", criticality: 58, probability: 27, exposureM: 1.2, source: "PolyCore", recovery: "4–8 wk", signal: "Qualification remains current", caseReady: false, tone: "healthy" as const },
  ];
  const horizonMultiplier = horizon === "30 days" ? .72 : horizon === "12 months" ? 1.16 : 1;
  const scoredDependencies = dependencies.map((item) => ({ ...item, probability: Math.min(98, Math.round(item.probability * horizonMultiplier)) }));
  const visibleDependencies = scoredDependencies
    .filter((item) => (category === "All categories" || item.category === category) && (riskMode !== "Continuity cases" || item.caseReady))
    .sort((left, right) => riskMode === "Event radar" ? right.probability - left.probability : riskMode === "Continuity cases" ? right.exposureM - left.exposureM : right.criticality - left.criticality);
  const selectedDependency = visibleDependencies.find((item) => item.name === selectedDependencyName) ?? visibleDependencies[0] ?? scoredDependencies[0];
  const dependencyIndex = dependencies.findIndex((item) => item.name === selectedDependency.name);
  const selectedSupplier = snapshot.suppliers.find((candidate) => candidate.name === selectedDependency.source) ?? snapshot.suppliers[Math.max(0, dependencyIndex) % snapshot.suppliers.length];
  const visibleExposure = visibleDependencies.reduce((sum, item) => sum + item.exposureM, 0);
  const modeTitle = riskMode === "Event radar" ? "Event likelihood × business criticality" : riskMode === "Continuity cases" ? "Governed cases by exposed value" : "Probability × business criticality";

  return (
    <div className="app-workspace risk-workspace">
      <AppIntro code="RR" title="RiskRadar" scope={snapshot.shortLabel} outcome="Know what can stop production—and where to intervene first." body="Trace external events through n-tier suppliers, materials, routes, products, orders, and financial exposure. Criticality combines dependency, recoverability, probability, and business value." actions={<button type="button" onClick={onOpenGraph}>Open evidence graph →</button>} />
      <div className="app-metrics"><AppMetric label="Visible exposure" value={`$${visibleExposure.toFixed(1)}M`} detail={`${visibleDependencies.length} modeled dependencies · ${horizon}`} /><AppMetric label="Critical dependencies" value={String(visibleDependencies.filter((item) => item.criticality >= 80).length)} detail={`${visibleDependencies.filter((item) => item.caseReady).length} continuity cases`} tone="critical" /><AppMetric label="N-tier visibility" value="78%" detail="Synthetic snapshot · no live refresh" tone="healthy" /><AppMetric label="Risk velocity" value={horizon === "30 days" ? "+9%" : horizon === "12 months" ? "+27%" : "+18%"} detail={`${riskMode} view`} tone="watch" /></div>

      <section className="panel app-controlbar"><div className="segmented-control wide">{["Procurement criticality", "Event radar", "Continuity cases"].map((mode) => <button className={riskMode === mode ? "active" : ""} type="button" key={mode} onClick={() => setRiskMode(mode)}>{mode}</button>)}</div><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option><option>Critical materials</option><option>Electronics</option><option>Castings</option></select></label><label>Horizon<select value={horizon} onChange={(event) => setHorizon(event.target.value)}><option>30 days</option><option>90 days</option><option>12 months</option></select></label><button type="button" onClick={() => { setEvidenceRevision((current) => current + 1); onToast("Deterministic synthetic evidence snapshot advanced; no source system was contacted."); }}>Advance synthetic snapshot ↻</button></section>

      <div className="app-grid risk-grid">
        <section className="panel risk-matrix-panel">
          <header className="panel-header"><div><p className="kicker">{riskMode.toUpperCase()} · DETERMINISTIC SYNTHETIC DATA</p><h2>{modeTitle}</h2><span>Bubble size represents modeled value exposure; filters recompute the visible register.</span></div><span className="live-chip"><Dot tone="healthy" />Fixture revision {evidenceRevision}</span></header>
          <div className="risk-matrix" role="img" aria-label={`${riskMode} risk matrix for ${category} over ${horizon}`}>
            <span className="axis-y">BUSINESS CRITICALITY →</span><span className="axis-x">DISRUPTION PROBABILITY →</span>
            <div className="risk-zone risk-zone-monitor">MONITOR</div><div className="risk-zone risk-zone-prepare">PREPARE</div><div className="risk-zone risk-zone-watch">WATCH</div><div className="risk-zone risk-zone-act">ACT NOW</div>
            {visibleDependencies.map((item) => <button className={`risk-bubble risk-bubble-${item.tone}`} style={{ left: `${item.probability}%`, bottom: `${item.criticality - 9}%`, width: `${34 + item.exposureM * 2}px`, height: `${34 + item.exposureM * 2}px` }} type="button" key={item.name} onClick={() => setSelectedDependencyName(item.name)}><span>{item.name}</span></button>)}
          </div>
          <footer className="matrix-footer"><span><Dot tone="critical" />Act now</span><span><Dot tone="watch" />Prepare</span><span><Dot tone="healthy" />Monitor</span><b>Scored with private + external evidence</b></footer>
        </section>

        <section className="panel dependency-panel">
          <header className="panel-header"><div><p className="kicker">SELECTED DEPENDENCY</p><h2>{selectedDependency.name}</h2></div><span className={`risk-score risk-score-${selectedSupplier.risk}`}>{selectedDependency.criticality}</span></header>
          <div className="dependency-summary"><p>{selectedSupplier.name} · {selectedSupplier.tier} · {selectedSupplier.region}</p><div><span><small>VALUE EXPOSED</small><b>${selectedDependency.exposureM.toFixed(1)}M</b></span><span><small>PROBABILITY</small><b>{selectedDependency.probability}%</b></span><span><small>RECOVERY</small><b>{selectedDependency.recovery}</b></span></div></div>
          <div className="dependency-chain"><p className="kicker">EXPOSURE PATH</p>{[
            ["External event", selectedDependency.signal, "Synthetic signal"], ["Supplier", selectedSupplier.name, "Private match"], ["Material", selectedDependency.name, `${selectedSupplier.dependency}% dependency`], ["Plant", "Pune Plant 02", "28 modeled orders"], ["Customer", "AX-4 programs", `$${selectedDependency.exposureM.toFixed(1)}M exposed`],
          ].map((item, index) => <div key={item[0]}><span>0{index + 1}</span><div><small>{item[0]}</small><b>{item[1]}</b></div><em>{item[2]}</em></div>)}</div>
          <div className="decision-box"><span>{selectedDependency.caseReady ? "CASE CANDIDATE · HUMAN GATE REQUIRED" : "MONITORING SIGNAL"}</span><b>{selectedDependency.caseReady ? "Preview a governed continuity handoff?" : "Continue evidence monitoring"}</b><p>RiskRadar provides synthetic decision support only; it does not create a case or change source data.</p><button type="button" onClick={() => onToast(`${selectedDependency.name} synthetic handoff previewed; no case or operational record was created.`)}>Preview governed handoff →</button></div>
        </section>
      </div>

      <section className="panel criticality-table"><header className="panel-header"><div><p className="kicker">CRITICAL PROCUREMENT REGISTER</p><h2>{visibleDependencies.length} dependencies ranked for {horizon.toLowerCase()}</h2></div><button type="button" onClick={() => onToast("Synthetic evidence-pack preview prepared; no file was exported.")}>Preview evidence pack</button></header><div className="table-scroll"><table><thead><tr><th>Material / component</th><th>Primary source</th><th>Criticality</th><th>Probability</th><th>Value exposed</th><th>Recovery</th><th>Control</th></tr></thead><tbody>{visibleDependencies.map((item) => <tr key={item.name}><td><span className="asset-cell"><Dot tone={item.tone} /><span><b>{item.name}</b><small>{item.family}</small></span></span></td><td>{item.source}</td><td><b>{item.criticality}/100</b></td><td>{item.probability}%</td><td>${item.exposureM.toFixed(1)}M</td><td>{item.recovery}</td><td><button type="button" onClick={() => { setSelectedDependencyName(item.name); onToast(`${item.name} synthetic continuity control opened; no source record changed.`); }}>Inspect</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

function FlowLens({ snapshot, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onToast">) {
  const [mode, setMode] = useState("Working capital");
  const [businessUnit, setBusinessUnit] = useState("All business units");
  const [period, setPeriod] = useState("Next 90 days");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const bridges: Record<string, readonly (readonly [string, number, "base" | "negative" | "positive"])[]> = {
    "Working capital": [["Opening cash", 186, "base"], ["Inventory", -24, "negative"], ["In transit", -18, "negative"], ["Payables", 12, "positive"], ["Receivables", -16, "negative"], ["Actions", 19, "positive"], ["Projected cash", 159, "base"]],
    "Order-to-cash": [["Open receivables", 214, "base"], ["Delivery holds", -12, "negative"], ["Billing lag", -16, "negative"], ["Disputes", -9, "negative"], ["Collections", 24, "positive"], ["Actions", 18, "positive"], ["Projected receivables", 219, "base"]],
    "Margin flow": [["Opening margin", 64, "base"], ["Premium freight", -8, "negative"], ["Input inflation", -12, "negative"], ["Price recovery", 9, "positive"], ["Mix", -4, "negative"], ["Actions", 11, "positive"], ["Projected margin", 60, "base"]],
  };
  const unitFactor = businessUnit === "Mobility" ? .62 : businessUnit === "Industrial" ? .38 : 1;
  const periodFactor = period === "This quarter" ? .9 : period === "FY 2026" ? 2.4 : 1;
  const scale = unitFactor * periodFactor;
  const waterfall = bridges[mode].map(([label, value, tone]) => {
    const scaled = Math.round(value * scale * 10) / 10;
    const prefix = tone === "positive" ? "+" : tone === "negative" ? "−" : "";
    return [label, scaled, `${prefix}$${Math.abs(scaled).toFixed(scaled % 1 ? 1 : 0)}M`, tone] as const;
  });
  const cashActions = [
    ["Rebalance controller inventory", 8.4, "14 days", "opportunity"], ["Renegotiate graphite payment milestone", 6.8, "30 days", "watch"], ["Resolve Singapore documentation holds", 4.2, "5 days", "critical"], ["Consolidate low-volume lanes", 3.1, "21 days", "healthy"], ["Accelerate EU customer invoicing", 2.6, "7 days", "opportunity"],
  ];
  const visibleActions = (exceptionsOnly ? cashActions.filter((item) => item[3] === "critical" || item[3] === "watch") : cashActions);
  const actionValue = visibleActions.reduce((sum, item) => sum + Number(item[1]) * scale, 0);
  return (
    <div className="app-workspace flow-workspace">
      <AppIntro code="FL" title="FlowLens" scope={snapshot.shortLabel} outcome="Connect every physical movement to cash, margin, and customer value." body="See working capital in the same flow as materials, cargo, orders, invoices, receivables, and supplier payments—then target the operational actions that release cash." actions={<button type="button" onClick={() => onToast("Synthetic cash-action preview opened; no finance or source record was written.")}>Preview cash action →</button>} />
      <div className="app-metrics"><AppMetric label="Cash in inventory" value={`$${Math.round(486 * scale)}M`} detail={`${businessUnit} · ${period}`} tone="watch" /><AppMetric label="Value in transit" value={`$${(1.28 * scale).toFixed(2)}B`} detail={`${Math.round(2164 * scale).toLocaleString()} modeled movements`} /><AppMetric label="Receivables exposed" value={`$${Math.round(214 * scale)}M`} detail={`${mode} lens`} tone="critical" /><AppMetric label="Visible action value" value={`$${actionValue.toFixed(1)}M`} detail={`${visibleActions.length} deterministic actions`} tone="opportunity" /></div>
      <section className="panel app-controlbar"><div className="segmented-control wide">{["Working capital", "Order-to-cash", "Margin flow"].map((item) => <button className={mode === item ? "active" : ""} type="button" key={item} onClick={() => setMode(item)}>{item}</button>)}</div><label>Business unit<select value={businessUnit} onChange={(event) => setBusinessUnit(event.target.value)}><option>All business units</option><option>Mobility</option><option>Industrial</option></select></label><label>Period<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Next 90 days</option><option>This quarter</option><option>FY 2026</option></select></label><button type="button" onClick={() => onToast(`${mode} synthetic bridge preview prepared for ${businessUnit}, ${period}; no file was downloaded.`)}>Preview cash bridge</button></section>
      <div className="app-grid flow-grid">
        <section className="panel waterfall-panel"><header className="panel-header"><div><p className="kicker">{mode.toUpperCase()} BRIDGE · SYNTHETIC</p><h2>{mode} for {businessUnit.toLowerCase()}</h2><span>{period} projection with deterministic scaling and no ledger write-back.</span></div><span className="live-chip"><Dot tone="opportunity" />${actionValue.toFixed(1)}M visible action value</span></header><div className="waterfall-chart">{waterfall.map((item, index) => <article key={item[0]}><strong>{item[2]}</strong><div><i className={`waterfall-${item[3]}`} style={{ height: `${Math.max(24, Math.min(96, Math.abs(item[1] as number) * .55))}%` }} /></div><b>{item[0]}</b>{index < waterfall.length - 1 && <em aria-hidden="true" />}</article>)}</div><footer><span>Model fixture CASH-18.7</span><b>{waterfall[0][2]} opening → {waterfall[waterfall.length - 1][2]} projected</b></footer></section>
        <section className="panel cash-actions"><header className="panel-header"><div><p className="kicker">CASH RELEASE QUEUE · SYNTHETIC</p><h2>{exceptionsOnly ? "Material exceptions" : "Actions ranked by value and effort"}</h2></div></header>{visibleActions.map((item, index) => <button type="button" key={item[0]} onClick={() => onToast(`${item[0]} synthetic action detail opened; no operational task was created.`)}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><div><b>{item[0]}</b><small>Realization {item[2]}</small></div><strong>${(Number(item[1]) * scale).toFixed(1)}M</strong><em>→</em></button>)}</section>
      </div>
      <section className="panel order-cash-flow"><header className="panel-header"><div><p className="kicker">ORDER-TO-CASH FLOW · SYNTHETIC</p><h2>18,402 open orders connected end to end</h2></div><button type="button" aria-pressed={exceptionsOnly} onClick={() => setExceptionsOnly((current) => !current)}>{exceptionsOnly ? "Show all actions" : "Inspect exceptions"} →</button></header><div className="flow-stages">{[
        ["Demand", "18.4K orders", "100%", "healthy"], ["Confirmed", "17.9K", "97.1%", "healthy"], ["Produced", "12.8K", "69.6%", "healthy"], ["In transit", "8.2K", "$1.28B", "watch"], ["Delivered", "6.4K", "93.8% OTIF", "watch"], ["Invoiced", "$924M", "72%", "healthy"], ["Collected", "$710M", "29 days", "opportunity"],
      ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><b>{item[0]}</b><strong>{item[1]}</strong><small>{item[2]}</small>{index < 6 && <i>→</i>}</article>)}</div></section>
    </div>
  );
}

function DemandSense({ snapshot, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onToast">) {
  const [scenario, setScenario] = useState("Consensus");
  const [granularity, setGranularity] = useState("Monthly");
  const [productFamily, setProductFamily] = useState("All products");
  const [compareVersions, setCompareVersions] = useState(false);
  const uplift = scenario === "High growth" ? 1.14 : scenario === "Downside" ? .86 : scenario === "Promotion" ? 1.08 : 1;
  const productFactor = productFamily === "AX-4 drive unit" ? .42 : productFamily === "Controller family" ? .28 : 1;
  const seriesByGranularity: Record<string, { values: readonly number[]; labels: readonly string[]; horizon: string }> = {
    Weekly: { values: [16, 18, 17, 19, 21, 20, 23, 22, 24, 25, 24, 27], labels: ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"], horizon: "next 12 weeks" },
    Monthly: { values: [72, 76, 81, 79, 88, 94, 91, 98, 104, 101, 112, 118], labels: ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"], horizon: "next 12 months" },
    Quarterly: { values: [229, 261, 293, 331], labels: ["Q4 26","Q1 27","Q2 27","Q3 27"], horizon: "next 4 quarters" },
  };
  const series = seriesByGranularity[granularity];
  const forecast = series.values.map((value) => Math.round(value * uplift * productFactor));
  const maxForecast = Math.max(...forecast, 1);
  const demandTotal = forecast.reduce((sum, value) => sum + value, 0);
  const accuracy = scenario === "Consensus" ? 86.4 : scenario === "High growth" ? 81.8 : scenario === "Downside" ? 83.2 : 84.6;
  const demandGaps = [
    { family: "AX-4 drive unit", row: ["AX-4 · North America", "184K", "168K", "−16K", "$12.8M", "Graphite G-142"] },
    { family: "Controller family", row: ["Controller A7 · Europe", "96K", "88K", "−8K", "$6.4M", "IGBT capacity"] },
    { family: "AX-4 drive unit", row: ["Housing H2 · APAC", "142K", "136K", "−6K", "$3.1M", "Casting throughput"] },
    { family: "Controller family", row: ["Drive unit D9 · India", "118K", "121K", "+3K", "$1.2M upside", "No constraint"] },
  ];
  const visibleGaps = demandGaps.filter((item) => productFamily === "All products" || item.family === productFamily);
  return (
    <div className="app-workspace demand-workspace">
      <AppIntro code="DS" title="DemandSense" scope={snapshot.shortLabel} outcome="See demand change early enough to reshape supply." body="Blend customer orders, consumption, promotions, market events, macro signals, product transitions, and commercial judgment into explainable demand scenarios." actions={<button type="button" onClick={() => onToast(`${scenario} synthetic demand scenario staged for human review; no operational plan changed.`)}>Stage scenario review →</button>} />
      <div className="app-metrics"><AppMetric label="Forecast accuracy" value={`${accuracy.toFixed(1)}%`} detail={`${scenario} holdout fixture`} tone="healthy" /><AppMetric label={`Demand · ${granularity.toLowerCase()}`} value={`${demandTotal.toLocaleString()}K`} detail={`${productFamily} · ${series.horizon}`} /><AppMetric label="Visible supply gaps" value={String(visibleGaps.filter((item) => item.row[3].startsWith("−")).length)} detail={`${visibleGaps.length} modeled product-market rows`} tone="critical" /><AppMetric label="Scenario factor" value={`${Math.round(uplift * 100)}%`} detail="Relative to consensus" tone="opportunity" /></div>
      <section className="panel app-controlbar"><div className="segmented-control wide">{["Consensus", "High growth", "Downside", "Promotion"].map((item) => <button className={scenario === item ? "active" : ""} type="button" key={item} onClick={() => setScenario(item)}>{item}</button>)}</div><label>Granularity<select value={granularity} onChange={(event) => setGranularity(event.target.value)}><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></label><label>Product family<select value={productFamily} onChange={(event) => setProductFamily(event.target.value)}><option>All products</option><option>AX-4 drive unit</option><option>Controller family</option></select></label><button type="button" aria-pressed={compareVersions} onClick={() => setCompareVersions((current) => !current)}>{compareVersions ? "Hide prior version" : "Compare prior version"}</button></section>
      <div className="app-grid demand-grid">
        <section className="panel forecast-panel"><header className="panel-header"><div><p className="kicker">EXPLAINABLE FORECAST · SYNTHETIC</p><h2>{scenario} · {productFamily} · {series.horizon}</h2><span>Orders, consumption, market signals, and planner judgment.</span></div><span className="live-chip"><Dot tone="healthy" />{accuracy.toFixed(1)}% holdout accuracy</span></header><div className="forecast-chart" role="img" aria-label={`${scenario} ${granularity.toLowerCase()} demand forecast for ${productFamily}`}><div className="forecast-grid"><span>{maxForecast}K</span><span>{Math.round(maxForecast * .67)}K</span><span>{Math.round(maxForecast * .33)}K</span><span>0</span></div><div className="forecast-bars">{forecast.map((value, index) => <article key={`${series.labels[index]}-${index}`}><strong>{value}K</strong><div><i style={{ height: `${Math.max(6, value / maxForecast * 88)}%` }} />{compareVersions && <em style={{ height: `${Math.max(6, value / uplift * .82 / maxForecast * 88)}%` }} />}</div><b>{series.labels[index]}</b></article>)}</div></div><footer className="forecast-legend"><span><i className="forecast-consensus" />Selected scenario</span>{compareVersions && <span><i className="forecast-orders" />Prior fixture version</span>}<b>Confidence band ±{scenario === "Consensus" ? "8.6" : "12.4"}%</b></footer></section>
        <section className="panel demand-drivers"><header className="panel-header"><div><p className="kicker">DEMAND DRIVERS</p><h2>Why the forecast changed</h2></div></header>{[
          ["Confirmed customer orders", "+8.2%", "42% influence", "healthy"], ["EV incentive extension", "+3.1%", "18% influence", "opportunity"], ["Customer launch delay", "−2.4%", "14% influence", "critical"], ["Channel inventory", "−1.8%", "11% influence", "watch"], ["Planner judgment", "+1.2%", "9% influence", "info"], ["Macro indicators", "+0.6%", "6% influence", "healthy"],
        ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><div><b>{item[0]}</b><small>{item[2]}</small></div><strong>{item[1]}</strong></article>)}</section>
      </div>
      <section className="panel demand-table"><header className="panel-header"><div><p className="kicker">DEMAND-TO-SUPPLY GAPS · SYNTHETIC</p><h2>{visibleGaps.length} product-market rows for {productFamily.toLowerCase()}</h2></div><button type="button" onClick={() => onToast(`${scenario} demand contract preview prepared for Network Optimizer; no case or plan was changed.`)}>Preview optimizer handoff →</button></header><div className="table-scroll"><table><thead><tr><th>Product / market</th><th>Forecast</th><th>Confirmed supply</th><th>Gap</th><th>Revenue at stake</th><th>Primary constraint</th><th /></tr></thead><tbody>{visibleGaps.map(({ row }) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${index}-${cell}`}>{index === 0 ? <b>{cell}</b> : cell}</td>)}<td><button type="button" onClick={() => onToast(`${row[0]} synthetic gap detail opened; no supply plan was changed.`)}>Inspect</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

function SupplierGraph({ snapshot, onOpenGraph, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onOpenGraph" | "onToast">) {
  const [selectedName, setSelectedName] = useState(snapshot.suppliers[0].name);
  const [requirementIndex, setRequirementIndex] = useState(0);
  const [shortlisted, setShortlisted] = useState<readonly string[]>([]);
  const selected = snapshot.suppliers.find((supplier) => supplier.name === selectedName) ?? snapshot.suppliers[0];
  const selectedIndex = Math.max(0, snapshot.suppliers.findIndex((supplier) => supplier.name === selected.name));
  const performanceProfiles = [
    { ppm: 248, otif: 91.8, capacity: 87, trend: "Stable", evidence: [98, 92, 81, 76] },
    { ppm: 116, otif: 96.4, capacity: 74, trend: "Improving", evidence: [99, 95, 88, 84] },
    { ppm: 382, otif: 88.6, capacity: 93, trend: "Watch", evidence: [94, 86, 79, 71] },
    { ppm: 204, otif: 93.1, capacity: 82, trend: "Stable", evidence: [97, 91, 85, 89] },
    { ppm: 88, otif: 98.2, capacity: 69, trend: "Improving", evidence: [99, 97, 92, 86] },
  ];
  const performance = performanceProfiles[selectedIndex % performanceProfiles.length];
  const requirementSets = [
    { name: "Battery-grade graphite", detail: "Purity ≥99.95% · ISO 9001 · available capacity ≥1,200 t/year", alternatives: [["VietCarbon Advanced", "Vietnam", "92% match", "8–12 weeks", "$14.8/kg", "opportunity"], ["Kansai Graphite", "Japan", "87% match", "12–16 weeks", "$15.6/kg", "healthy"], ["IndoMat Energy", "India", "82% match", "6–10 weeks", "$14.2/kg", "watch"]] },
    { name: "Regional casting capacity", detail: "IATF 16949 · 4,000 t presses · PPAP ≤12 weeks", alternatives: [["Chennai Precision Cast", "India", "94% match", "10–12 weeks", "$8.7/unit", "opportunity"], ["Siam Alloy Works", "Thailand", "89% match", "12–18 weeks", "$8.4/unit", "healthy"], ["VietForge Mobility", "Vietnam", "84% match", "14–20 weeks", "$8.1/unit", "watch"]] },
    { name: "Low-carbon specialty steel", detail: "EPD verified · recycled content ≥70% · EU reporting ready", alternatives: [["NordSteel GreenLine", "Sweden", "96% match", "6–9 weeks", "$1,240/t", "opportunity"], ["Iberia Circular Metals", "Spain", "91% match", "8–11 weeks", "$1,180/t", "healthy"], ["Kobe ReSteel", "Japan", "86% match", "9–13 weeks", "$1,210/t", "watch"]] },
  ];
  const requirement = requirementSets[requirementIndex];
  const evidenceLabels = ["Identity + ownership", "Capability", "Capacity", "ESG + compliance"];
  return (
    <div className="app-workspace supplier-workspace">
      <AppIntro code="SG" title="SupplierGraph" scope={snapshot.shortLabel} outcome="Know every dependency—and every credible alternative." body="Build a continuously resolved n-tier supplier network across ownership, sites, materials, parts, capabilities, capacity, performance, evidence, and financial health." actions={<button type="button" onClick={onOpenGraph}>Open full knowledge graph →</button>} />
      <div className="app-metrics"><AppMetric label="Suppliers resolved" value="6,420" detail={`${snapshot.suppliers.length} shown in ${snapshot.shortLabel}`} /><AppMetric label="Selected OTIF" value={`${performance.otif.toFixed(1)}%`} detail={`${selected.name} · ${performance.trend}`} tone="healthy" /><AppMetric label="Selected dependency" value={`${selected.dependency}%`} detail={`${selected.category} · ${selected.spend}`} tone="critical" /><AppMetric label="Shortlisted now" value={String(shortlisted.length)} detail={`${requirement.name} · synthetic session`} tone="opportunity" /></div>
      <div className="app-grid supplier-graph-grid">
        <section className="panel supplier-network-panel"><header className="panel-header"><div><p className="kicker">N-TIER SUPPLY NETWORK · SYNTHETIC</p><h2>{selected.category} dependency</h2><span>{selected.name} · {selected.tier} · {selected.region} · {selected.dependency}% modeled dependency.</span></div><span className="live-chip"><Dot tone="healthy" />Selection-linked graph</span></header><div className="supplier-network"><i className="sg-edge e1" /><i className="sg-edge e2" /><i className="sg-edge e3" /><i className="sg-edge e4" /><i className="sg-edge e5" /><i className="sg-edge e6" />{[
          ["event","Evidence signal",performance.trend === "Watch" ? "Performance review" : "Capacity evidence",performance.trend === "Watch" ? "critical" : "healthy"], ["tier2",selected.name,`${selected.tier} · ${selected.region}`,selected.risk], ["tier1","Qualified integration path","Tier 1 · synthetic","watch"], ["material",selected.category,"Selected category",selected.risk], ["plant","Pune Plant 02",`${performance.capacity}% capacity used`,performance.capacity > 90 ? "watch" : "healthy"], ["product","AX-4 drive unit","4 modeled programs","watch"], ["customer","28 priority orders",`${selected.spend} linked spend`,"opportunity"],
        ].map((node) => <button type="button" className={`sg-node sg-node-${node[0]} sg-node-${node[3]}`} key={node[0]} onClick={() => onToast(`${node[1]} synthetic evidence preview selected; no graph record changed.`)}><small>{node[2]}</small><b>{node[1]}</b><span>{node[3]}</span></button>)}</div></section>
        <section className="panel supplier-profile"><header className="panel-header"><div><p className="kicker">SUPPLIER PROFILE · DETERMINISTIC FIXTURE</p><h2>{selected.name}</h2></div><span className={`risk-score risk-score-${selected.risk}`}>{selected.dependency}</span></header><div className="profile-hero"><span>{selected.name.split(" ").map((word) => word[0]).join("").slice(0,2)}</span><div><b>{selected.category}</b><p>{selected.tier} · {selected.region}</p></div></div><dl><div><dt>Annual spend</dt><dd>{selected.spend}</dd></div><div><dt>Dependency</dt><dd>{selected.dependency}%</dd></div><div><dt>Quality PPM</dt><dd>{performance.ppm}</dd></div><div><dt>OTIF</dt><dd>{performance.otif.toFixed(1)}%</dd></div><div><dt>Capacity used</dt><dd>{performance.capacity}%</dd></div><div><dt>Financial trend</dt><dd>{performance.trend}</dd></div></dl><div className="profile-evidence"><p className="kicker">EVIDENCE COVERAGE</p>{evidenceLabels.map((label, index) => <div key={label}><span>{label}</span><div className="progress-track"><i style={{width:`${performance.evidence[index]}%`}} /></div><b>{performance.evidence[index]}%</b></div>)}</div><button className="primary-action" type="button" onClick={() => onToast(`${selected.name} synthetic development-plan preview opened; no supplier record changed.`)}>Preview supplier plan →</button></section>
      </div>
      <section className="panel alternatives-panel"><header className="panel-header"><div><p className="kicker">ALTERNATIVE DISCOVERY · SYNTHETIC</p><h2>{requirement.name}</h2><span>{requirement.detail}</span></div><button type="button" onClick={() => setRequirementIndex((current) => (current + 1) % requirementSets.length)}>Next requirement set →</button></header><div className="alternative-list">{requirement.alternatives.map((item, index) => { const isShortlisted = shortlisted.includes(item[0]); return <article key={item[0]}><span>0{index + 1}</span><div><b>{item[0]}</b><small>{item[1]} · {requirement.name}</small></div><strong>{item[2]}</strong><span><small>QUALIFICATION</small><b>{item[3]}</b></span><span><small>SHOULD-COST</small><b>{item[4]}</b></span><Dot tone={item[5] as StatusTone} /><button type="button" disabled={isShortlisted} onClick={() => { setShortlisted((current) => current.includes(item[0]) ? current : [...current, item[0]]); onToast(`${item[0]} added to the synthetic shortlist; no supplier master was changed.`); }}>{isShortlisted ? "Shortlisted" : "Shortlist"}</button></article>; })}</div></section>
      <section className="panel supplier-register"><header className="panel-header"><div><p className="kicker">SUPPLIER PORTFOLIO</p><h2>Criticality, spend, and dependency</h2></div></header><div className="table-scroll"><table><thead><tr><th>Supplier</th><th>Category</th><th>Tier</th><th>Region</th><th>Spend</th><th>Dependency</th><th>Risk</th><th /></tr></thead><tbody>{snapshot.suppliers.map((supplier) => <tr key={supplier.name}><td><span className="asset-cell"><Dot tone={supplier.risk} /><span><b>{supplier.name}</b><small>Evidence 92%</small></span></span></td><td>{supplier.category}</td><td>{supplier.tier}</td><td>{supplier.region}</td><td><b>{supplier.spend}</b></td><td>{supplier.dependency}%</td><td><span className={`state-chip state-${supplier.risk}`}>{supplier.risk}</span></td><td><button type="button" onClick={() => setSelectedName(supplier.name)}>Open</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export default function ApplicationViews({ app, snapshot, activeCase, networkSelection, onClearNetworkSelection, onOpenCase, onOpenAction, onOpenAgents, onOpenGraph, onToast }: ApplicationViewsProps) {
  const workspace = app === "risk" ? <RiskRadar snapshot={snapshot} onOpenGraph={onOpenGraph} onToast={onToast} />
    : app === "optimizer" ? <OptimizationWorkbench key={`${snapshot.id}-${activeCase.id}-${networkSelection?.id ?? "network"}`} snapshot={snapshot} activeCase={activeCase} networkSelection={networkSelection} onToast={onToast} />
    : app === "flow" ? <FlowLens snapshot={snapshot} onToast={onToast} />
    : app === "demand" ? <DemandSense snapshot={snapshot} onToast={onToast} />
    : <SupplierGraph snapshot={snapshot} onOpenGraph={onOpenGraph} onToast={onToast} />;

  const contribution = activeCase.contributions.find((item) => item.app === app);

  return (
    <div className="application-container">
      <section className="case-context-strip application-commandbar">
        <div className="commandbar-case"><span className={`severity-${activeCase.severity.toLowerCase()}`} /><p><small>ACTIVE DECISION · {activeCase.id}</small><b>{activeCase.title}</b></p></div>
        <div className="commandbar-facts">
          <div><small>Application contribution</small><b>{contribution?.value ?? "Connected"} · {contribution?.method ?? "Shared case"}</b></div>
          <div><small>Decision lifecycle</small><b>{activeCase.stage} · {activeCase.status}</b></div>
          {networkSelection && <button className="commandbar-network-context" type="button" onClick={onClearNetworkSelection}><Dot tone="opportunity" /><span><small>Map selection retained · {networkSelection.kind}</small><b>{networkSelection.label}</b></span><em>Clear ×</em></button>}
          <button className="commandbar-data" type="button" onClick={onOpenAgents}><Dot tone="healthy" /><span><small>Governed data context</small><b>12 agents · graph merged 18 sec ago</b></span><em>Inspect →</em></button>
        </div>
        <div><button type="button" onClick={onOpenCase}>Open case</button><button className="primary-action" type="button" onClick={onOpenAction}>Action Room →</button></div>
      </section>
      {networkSelection && <NetworkContextBridge app={app} snapshot={snapshot} selection={networkSelection} onClear={onClearNetworkSelection} />}
      {workspace}
      <ApplicationOperatingModel id={app} />
    </div>
  );
}
