"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { solveNetworkPlan, type AppId, type DecisionCase, type OptimizationInput, type ScopeSnapshot, type StatusTone } from "./platform-model";

type ApplicationViewsProps = {
  app: AppId;
  snapshot: ScopeSnapshot;
  activeCase: DecisionCase;
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

function RiskRadar({ snapshot, onOpenGraph, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onOpenGraph" | "onToast">) {
  const [riskMode, setRiskMode] = useState("Procurement criticality");
  const [selectedRisk, setSelectedRisk] = useState(snapshot.suppliers[0]);
  const dependencies = [
    { name: "Graphite G-142", family: "Critical material", criticality: 96, probability: 82, exposure: "$4.2M", source: "NeoGraph Materials", tone: "critical" as const },
    { name: "IGBT controller A7", family: "Power electronics", criticality: 88, probability: 61, exposure: "$7.8M", source: "Hanwa Microdevices", tone: "watch" as const },
    { name: "AX-4 housing", family: "Precision casting", criticality: 72, probability: 34, exposure: "$2.1M", source: "Apex Castings", tone: "opportunity" as const },
    { name: "42CrMo4 steel", family: "Specialty steel", criticality: 64, probability: 46, exposure: "$6.4M", source: "NordSteel AB", tone: "watch" as const },
    { name: "Seal compound V9", family: "Elastomers", criticality: 58, probability: 27, exposure: "$1.2M", source: "PolyCore", tone: "healthy" as const },
  ];

  return (
    <div className="app-workspace risk-workspace">
      <AppIntro code="RR" title="RiskRadar" scope={snapshot.shortLabel} outcome="Know what can stop production—and where to intervene first." body="Trace external events through n-tier suppliers, materials, routes, products, orders, and financial exposure. Criticality combines dependency, recoverability, probability, and business value." actions={<button type="button" onClick={onOpenGraph}>Open evidence graph →</button>} />
      <div className="app-metrics"><AppMetric label="Exposure monitored" value="$1.86B" detail="Across 18,402 open orders" /><AppMetric label="Critical dependencies" value="27" detail="9 decisions due" tone="critical" /><AppMetric label="N-tier visibility" value="78%" detail="Up from 64% last quarter" tone="healthy" /><AppMetric label="Risk velocity" value="+18%" detail="Graphite + logistics driving" tone="watch" /></div>

      <section className="panel app-controlbar"><div className="segmented-control wide">{["Procurement criticality", "Event radar", "Continuity cases"].map((mode) => <button className={riskMode === mode ? "active" : ""} type="button" key={mode} onClick={() => setRiskMode(mode)}>{mode}</button>)}</div><label>Category<select defaultValue="All categories"><option>All categories</option><option>Critical materials</option><option>Electronics</option><option>Castings</option></select></label><label>Horizon<select defaultValue="90 days"><option>30 days</option><option>90 days</option><option>12 months</option></select></label><button type="button" onClick={() => onToast("Risk evidence refreshed from the synthetic knowledge graph.")}>Refresh evidence ↻</button></section>

      <div className="app-grid risk-grid">
        <section className="panel risk-matrix-panel">
          <header className="panel-header"><div><p className="kicker">PROCUREMENT CRITICALITY MATRIX</p><h2>Probability × business criticality</h2><span>Bubble size represents modeled value exposure.</span></div><span className="live-chip"><Dot tone="healthy" />Live scoring</span></header>
          <div className="risk-matrix" role="img" aria-label="Procurement risk probability and criticality matrix">
            <span className="axis-y">BUSINESS CRITICALITY →</span><span className="axis-x">DISRUPTION PROBABILITY →</span>
            <div className="risk-zone risk-zone-monitor">MONITOR</div><div className="risk-zone risk-zone-prepare">PREPARE</div><div className="risk-zone risk-zone-watch">WATCH</div><div className="risk-zone risk-zone-act">ACT NOW</div>
            {dependencies.map((item, index) => <button className={`risk-bubble risk-bubble-${item.tone}`} style={{ left: `${item.probability}%`, bottom: `${item.criticality - 9}%`, width: `${34 + Number(item.exposure.replace(/\D/g, "")) * .12}px`, height: `${34 + Number(item.exposure.replace(/\D/g, "")) * .12}px` }} type="button" key={item.name} onClick={() => { const supplier = snapshot.suppliers.find((candidate) => candidate.name === item.source) ?? snapshot.suppliers[index % snapshot.suppliers.length]; setSelectedRisk(supplier); }}><span>{item.name}</span></button>)}
          </div>
          <footer className="matrix-footer"><span><Dot tone="critical" />Act now</span><span><Dot tone="watch" />Prepare</span><span><Dot tone="healthy" />Monitor</span><b>Scored with private + external evidence</b></footer>
        </section>

        <section className="panel dependency-panel">
          <header className="panel-header"><div><p className="kicker">SELECTED DEPENDENCY</p><h2>{selectedRisk.name}</h2></div><span className={`risk-score risk-score-${selectedRisk.risk}`}>{selectedRisk.dependency}</span></header>
          <div className="dependency-summary"><p>{selectedRisk.category} · {selectedRisk.tier} · {selectedRisk.region}</p><div><span><small>ANNUAL SPEND</small><b>{selectedRisk.spend}</b></span><span><small>DEPENDENCY</small><b>{selectedRisk.dependency}%</b></span><span><small>RECOVERY</small><b>14–22 wk</b></span></div></div>
          <div className="dependency-chain"><p className="kicker">EXPOSURE PATH</p>{[
            ["External event", "Capacity reserved", "Observed"], ["Tier-2 supplier", selectedRisk.name, "Private match"], ["Material", selectedRisk.category, "92% dependency"], ["Plant", "Pune Plant 02", "28 orders"], ["Customer", "AX-4 programs", "$4.2M margin"],
          ].map((item, index) => <div key={item[0]}><span>0{index + 1}</span><div><small>{item[0]}</small><b>{item[1]}</b></div><em>{item[2]}</em></div>)}</div>
          <div className="decision-box"><span>DECISION DUE · 2 HOURS</span><b>Approve alternate-volume reservation?</b><p>RiskRadar recommends a constrained optimization before release.</p><button type="button" onClick={() => onToast("Risk case created and routed to Network Optimizer.")}>Create governed case →</button></div>
        </section>
      </div>

      <section className="panel criticality-table"><header className="panel-header"><div><p className="kicker">CRITICAL PROCUREMENT REGISTER</p><h2>Ranked by business interruption potential</h2></div><button type="button">Export evidence pack</button></header><div className="table-scroll"><table><thead><tr><th>Material / component</th><th>Primary source</th><th>Criticality</th><th>Probability</th><th>Value exposed</th><th>Recovery</th><th>Control</th></tr></thead><tbody>{dependencies.map((item) => <tr key={item.name}><td><span className="asset-cell"><Dot tone={item.tone} /><span><b>{item.name}</b><small>{item.family}</small></span></span></td><td>{item.source}</td><td><b>{item.criticality}/100</b></td><td>{item.probability}%</td><td>{item.exposure}</td><td>{item.name === "Graphite G-142" ? "14–22 wk" : "4–12 wk"}</td><td><button type="button" onClick={() => onToast(`${item.name} continuity control opened.`)}>Control</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

function Optimizer({ snapshot, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onToast">) {
  const [input, setInput] = useState<OptimizationInput>({ supplyLossPercent: 32, disruptionWeeks: 14, serviceTarget: 96, budgetMillions: 2.5, carbonLimitPercent: 4, strategy: "Balanced" });
  const [result, setResult] = useState(() => solveNetworkPlan(input));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const timer = useRef<number | null>(null);
  const preview = useMemo(() => solveNetworkPlan(input), [input]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const run = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setRunning(true); setProgress(18);
    const steps = [42, 68, 87, 100];
    const advance = (index: number) => {
      timer.current = window.setTimeout(() => {
        setProgress(steps[index]);
        if (index < steps.length - 1) advance(index + 1);
        else { setResult(solveNetworkPlan(input)); setRunning(false); onToast("Optimal feasible network plan generated in concept mode."); }
      }, 280);
    };
    advance(0);
  };
  const updateNumber = (key: keyof OptimizationInput, value: number) => setInput((current) => ({ ...current, [key]: value }));

  return (
    <div className="app-workspace optimizer-workspace">
      <AppIntro code="NO" title="Network Optimizer" scope={snapshot.shortLabel} outcome="Choose the best feasible action—not merely the most obvious one." body="Formulate sourcing, production, inventory, logistics, service, cash, and carbon decisions as an operations-research model with explicit objectives and hard constraints." actions={<button type="button" onClick={run} disabled={running}>{running ? `Solving ${progress}%` : "Run optimization →"}</button>} />
      <div className="solver-strip"><span><Dot tone={running ? "watch" : "healthy"} />{running ? "MILP solver evaluating feasible allocations" : "Optimal solution available"}</span><b>{result.runId}</b><em>GAP 0.4% · 18,442 variables · 26,118 constraints</em>{running && <i style={{ width: `${progress}%` }} />}</div>
      <div className="optimizer-layout">
        <section className="panel model-controls"><header className="panel-header"><div><p className="kicker">CONTROLLED ASSUMPTIONS</p><h2>Graphite continuity scenario</h2><span>Adjust the business envelope; the model only returns feasible decisions.</span></div></header>
          <div className="range-controls">{[
            ["supplyLossPercent", "Supply unavailable", "%", 0, 100, 1], ["disruptionWeeks", "Disruption duration", "weeks", 1, 26, 1], ["serviceTarget", "Minimum customer service", "%", 80, 100, .5], ["budgetMillions", "Maximum response budget", "$M", 0, 8, .1], ["carbonLimitPercent", "Maximum carbon increase", "%", -5, 12, .5],
          ].map(([key, label, unit, min, max, step]) => <label htmlFor={`optimizer-${key}`} key={key as string}><span><b>{label as string}</b><em>{String(key) === "budgetMillions" ? `$${input[key as keyof OptimizationInput]}` : input[key as keyof OptimizationInput]} {unit as string}</em></span><input id={`optimizer-${key}`} aria-label={label as string} type="range" min={min as number} max={max as number} step={step as number} value={input[key as keyof OptimizationInput] as number} onChange={(event) => updateNumber(key as keyof OptimizationInput, Number(event.target.value))} /></label>)}</div>
          <div className="strategy-control"><p className="kicker">OBJECTIVE POSTURE</p>{(["Balanced", "Service first", "Cash first", "Lowest carbon"] as OptimizationInput["strategy"][]).map((strategy) => <button className={input.strategy === strategy ? "active" : ""} type="button" key={strategy} onClick={() => setInput((current) => ({ ...current, strategy }))}><b>{strategy}</b><small>{strategy === "Balanced" ? "Weighted value" : strategy === "Service first" ? "Maximize OTIF" : strategy === "Cash first" ? "Minimize cash" : "Minimize CO₂"}</small></button>)}</div>
          <button className="solver-button" type="button" onClick={run} disabled={running}>{running ? `Solving feasible network · ${progress}%` : "Solve network plan →"}</button>
        </section>

        <section className="panel formulation-panel"><header className="panel-header"><div><p className="kicker">OPERATIONS RESEARCH MODEL</p><h2>Objective and constraints</h2></div><span className="model-status">VALIDATED v2.4</span></header><div className="objective-box"><small>MINIMIZE TOTAL NETWORK REGRET</small><code>min Σ transport + shortage + inventory + qualification + carbon − protected margin</code></div><div className="constraint-list">{[
          ["Supply balance", "Allocated volume ≤ qualified capacity", "Binding"], ["Material flow", "Opening + receipts − demand = closing stock", "Satisfied"], ["Customer service", `OTIF ≥ ${input.serviceTarget}% by priority class`, preview.projectedService < input.serviceTarget ? "Binding" : "Satisfied"], ["Response budget", `Incremental cost ≤ $${input.budgetMillions}M`, preview.totalCost >= input.budgetMillions ? "Binding" : "Slack"], ["Carbon envelope", `Network CO₂ delta ≤ ${input.carbonLimitPercent}%`, preview.carbonDelta > input.carbonLimitPercent ? "Violated" : "Satisfied"], ["Qualification", "Only approved supplier-part-lane combinations", "Hard"],
        ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><div><b>{item[0]}</b><code>{item[1]}</code></div><em className={`constraint-${String(item[2]).toLowerCase()}`}>{item[2]}</em></article>)}</div></section>
      </div>

      <section className="result-zone"><div className="result-summary"><p className="kicker">OPTIMAL FEASIBLE PLAN</p><h2>{input.strategy} response</h2><span>{result.runId}</span></div><div className="result-metrics"><AppMetric label="Margin protected" value={`$${result.protectedMargin}M`} detail="Compared with no action" tone="opportunity" /><AppMetric label="Incremental cost" value={`$${result.totalCost}M`} detail={`Within $${input.budgetMillions}M budget`} /><AppMetric label="Projected OTIF" value={`${result.projectedService}%`} detail={`Target ${input.serviceTarget}%`} tone={result.projectedService >= input.serviceTarget ? "healthy" : "watch"} /><AppMetric label="Residual risk" value={`${result.residualRisk}%`} detail="After modeled actions" tone="watch" /><AppMetric label="Carbon delta" value={`${result.carbonDelta > 0 ? "+" : ""}${result.carbonDelta}%`} detail={`Limit ${input.carbonLimitPercent}%`} tone={result.carbonDelta <= input.carbonLimitPercent ? "healthy" : "critical"} /></div>{result.warnings.length > 0 && <div className="solver-warnings"><b>MODEL FLAGS</b>{result.warnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}
        <div className="table-scroll allocation-table"><table><thead><tr><th>Recommended allocation</th><th>Volume</th><th>Timing</th><th>Accountable owner</th><th>Cost</th><th /></tr></thead><tbody>{result.allocations.map((item, index) => <tr key={item.action}><td><span className="allocation-action"><i>{index + 1}</i><b>{item.action}</b></span></td><td>{item.volume}</td><td>{item.timing}</td><td>{item.owner}</td><td><b>{item.cost}</b></td><td><button type="button" onClick={() => onToast(`${item.action} added to the execution package.`)}>Add</button></td></tr>)}</tbody></table></div><div className="result-actions"><button type="button">Compare scenarios</button><button type="button">Review model explanation</button><button className="primary-action" type="button" onClick={() => onToast("Execution package routed for approval.")}>Route for approval →</button></div>
      </section>
    </div>
  );
}

function FlowLens({ snapshot, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onToast">) {
  const [mode, setMode] = useState("Working capital");
  const waterfall = [
    ["Opening cash", 86, "$186M", "base"], ["Inventory", -24, "−$24M", "negative"], ["In transit", -18, "−$18M", "negative"], ["Payables", 12, "+$12M", "positive"], ["Receivables", -16, "−$16M", "negative"], ["Actions", 19, "+$19M", "positive"], ["Projected cash", 59, "$159M", "base"],
  ];
  return (
    <div className="app-workspace flow-workspace">
      <AppIntro code="FL" title="FlowLens" scope={snapshot.shortLabel} outcome="Connect every physical movement to cash, margin, and customer value." body="See working capital in the same flow as materials, cargo, orders, invoices, receivables, and supplier payments—then target the operational actions that release cash." actions={<button type="button" onClick={() => onToast("FlowLens cash-release case created.")}>Create cash action →</button>} />
      <div className="app-metrics"><AppMetric label="Cash in inventory" value="$486M" detail="37 days on hand" tone="watch" /><AppMetric label="Value in transit" value="$1.28B" detail="2,164 movements" /><AppMetric label="Receivables exposed" value="$214M" detail="Delayed order linkage" tone="critical" /><AppMetric label="Cash release potential" value="$38.6M" detail="11 feasible actions" tone="opportunity" /></div>
      <section className="panel app-controlbar"><div className="segmented-control wide">{["Working capital", "Order-to-cash", "Margin flow"].map((item) => <button className={mode === item ? "active" : ""} type="button" key={item} onClick={() => setMode(item)}>{item}</button>)}</div><label>Business unit<select><option>All business units</option><option>Mobility</option><option>Industrial</option></select></label><label>Period<select><option>Next 90 days</option><option>This quarter</option><option>FY 2026</option></select></label><button type="button">Download cash bridge</button></section>
      <div className="app-grid flow-grid">
        <section className="panel waterfall-panel"><header className="panel-header"><div><p className="kicker">CASH BRIDGE</p><h2>How operations move working capital</h2><span>Projected 90-day change with approved actions.</span></div><span className="live-chip"><Dot tone="opportunity" />+$19M action value</span></header><div className="waterfall-chart">{waterfall.map((item, index) => <article key={item[0]}><strong>{item[2]}</strong><div><i className={`waterfall-${item[3]}`} style={{ height: `${Math.max(24, Math.abs(item[1] as number))}%` }} /></div><b>{item[0]}</b>{index < waterfall.length - 1 && <em aria-hidden="true" />}</article>)}</div><footer><span>Model version CASH-18.7</span><b>Opening $186M → projected $159M after operating cycle</b></footer></section>
        <section className="panel cash-actions"><header className="panel-header"><div><p className="kicker">CASH RELEASE QUEUE</p><h2>Actions ranked by value and effort</h2></div></header>{[
          ["Rebalance controller inventory", "$8.4M", "14 days", "opportunity"], ["Renegotiate graphite payment milestone", "$6.8M", "30 days", "watch"], ["Resolve Singapore documentation holds", "$4.2M", "5 days", "critical"], ["Consolidate low-volume lanes", "$3.1M", "21 days", "healthy"], ["Accelerate EU customer invoicing", "$2.6M", "7 days", "opportunity"],
        ].map((item, index) => <button type="button" key={item[0]} onClick={() => onToast(`${item[0]} opened.`)}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><div><b>{item[0]}</b><small>Realization {item[2]}</small></div><strong>{item[1]}</strong><em>→</em></button>)}</section>
      </div>
      <section className="panel order-cash-flow"><header className="panel-header"><div><p className="kicker">ORDER-TO-CASH FLOW</p><h2>18,402 open orders connected end to end</h2></div><button type="button">Inspect exceptions →</button></header><div className="flow-stages">{[
        ["Demand", "18.4K orders", "100%", "healthy"], ["Confirmed", "17.9K", "97.1%", "healthy"], ["Produced", "12.8K", "69.6%", "healthy"], ["In transit", "8.2K", "$1.28B", "watch"], ["Delivered", "6.4K", "93.8% OTIF", "watch"], ["Invoiced", "$924M", "72%", "healthy"], ["Collected", "$710M", "29 days", "opportunity"],
      ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><b>{item[0]}</b><strong>{item[1]}</strong><small>{item[2]}</small>{index < 6 && <i>→</i>}</article>)}</div></section>
    </div>
  );
}

function DemandSense({ snapshot, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onToast">) {
  const [scenario, setScenario] = useState("Consensus");
  const [granularity, setGranularity] = useState("Monthly");
  const forecast = [72, 76, 81, 79, 88, 94, 91, 98, 104, 101, 112, 118];
  const uplift = scenario === "High growth" ? 1.14 : scenario === "Downside" ? .86 : scenario === "Promotion" ? 1.08 : 1;
  return (
    <div className="app-workspace demand-workspace">
      <AppIntro code="DS" title="DemandSense" scope={snapshot.shortLabel} outcome="See demand change early enough to reshape supply." body="Blend customer orders, consumption, promotions, market events, macro signals, product transitions, and commercial judgment into explainable demand scenarios." actions={<button type="button" onClick={() => onToast(`${scenario} demand scenario published for review.`)}>Publish scenario →</button>} />
      <div className="app-metrics"><AppMetric label="Forecast accuracy" value="86.4%" detail="+4.8 pts vs baseline" tone="healthy" /><AppMetric label="Demand next 90d" value="1.24M" detail="Units · +7.2%" /><AppMetric label="Orders at risk" value="812" detail="$96M customer value" tone="critical" /><AppMetric label="Upside not supplied" value="$18.4M" detail="Capacity-constrained demand" tone="opportunity" /></div>
      <section className="panel app-controlbar"><div className="segmented-control wide">{["Consensus", "High growth", "Downside", "Promotion"].map((item) => <button className={scenario === item ? "active" : ""} type="button" key={item} onClick={() => setScenario(item)}>{item}</button>)}</div><label>Granularity<select value={granularity} onChange={(event) => setGranularity(event.target.value)}><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></label><label>Product family<select><option>All products</option><option>AX-4 drive unit</option><option>Controller family</option></select></label><button type="button">Compare versions</button></section>
      <div className="app-grid demand-grid">
        <section className="panel forecast-panel"><header className="panel-header"><div><p className="kicker">EXPLAINABLE FORECAST</p><h2>{scenario} demand · next 12 months</h2><span>Orders, consumption, market signals, and planner judgment.</span></div><span className="live-chip"><Dot tone="healthy" />86.4% accuracy</span></header><div className="forecast-chart" role="img" aria-label={`${scenario} monthly demand forecast`}><div className="forecast-grid"><span>120K</span><span>80K</span><span>40K</span><span>0</span></div><div className="forecast-bars">{forecast.map((value, index) => <article key={index}><strong>{Math.round(value * uplift)}K</strong><div><i style={{ height: `${value * uplift / 1.25}%` }} /><em style={{ height: `${Math.max(12, value * .82)}%` }} /></div><b>{["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"][index]}</b></article>)}</div></div><footer className="forecast-legend"><span><i className="forecast-consensus" />Selected scenario</span><span><i className="forecast-orders" />Confirmed orders</span><b>Confidence band ±8.6%</b></footer></section>
        <section className="panel demand-drivers"><header className="panel-header"><div><p className="kicker">DEMAND DRIVERS</p><h2>Why the forecast changed</h2></div></header>{[
          ["Confirmed customer orders", "+8.2%", "42% influence", "healthy"], ["EV incentive extension", "+3.1%", "18% influence", "opportunity"], ["Customer launch delay", "−2.4%", "14% influence", "critical"], ["Channel inventory", "−1.8%", "11% influence", "watch"], ["Planner judgment", "+1.2%", "9% influence", "info"], ["Macro indicators", "+0.6%", "6% influence", "healthy"],
        ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><Dot tone={item[3] as StatusTone} /><div><b>{item[0]}</b><small>{item[2]}</small></div><strong>{item[1]}</strong></article>)}</section>
      </div>
      <section className="panel demand-table"><header className="panel-header"><div><p className="kicker">DEMAND-TO-SUPPLY GAPS</p><h2>Where commercial demand exceeds the feasible network</h2></div><button type="button">Open in Optimizer →</button></header><div className="table-scroll"><table><thead><tr><th>Product / market</th><th>Forecast</th><th>Confirmed supply</th><th>Gap</th><th>Revenue at stake</th><th>Primary constraint</th><th /></tr></thead><tbody>{[
        ["AX-4 · North America", "184K", "168K", "−16K", "$12.8M", "Graphite G-142"], ["Controller A7 · Europe", "96K", "88K", "−8K", "$6.4M", "IGBT capacity"], ["Housing H2 · APAC", "142K", "136K", "−6K", "$3.1M", "Casting throughput"], ["Drive unit D9 · India", "118K", "121K", "+3K", "$1.2M upside", "No constraint"],
      ].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <b>{cell}</b> : cell}</td>)}<td><button type="button" onClick={() => onToast(`${row[0]} demand gap opened.`)}>Resolve</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

function SupplierGraph({ snapshot, onOpenGraph, onToast }: Pick<ApplicationViewsProps, "snapshot" | "onOpenGraph" | "onToast">) {
  const [selectedName, setSelectedName] = useState(snapshot.suppliers[0].name);
  const selected = snapshot.suppliers.find((supplier) => supplier.name === selectedName) ?? snapshot.suppliers[0];
  return (
    <div className="app-workspace supplier-workspace">
      <AppIntro code="SG" title="SupplierGraph" scope={snapshot.shortLabel} outcome="Know every dependency—and every credible alternative." body="Build a continuously resolved n-tier supplier network across ownership, sites, materials, parts, capabilities, capacity, performance, evidence, and financial health." actions={<button type="button" onClick={onOpenGraph}>Open full knowledge graph →</button>} />
      <div className="app-metrics"><AppMetric label="Suppliers resolved" value="6,420" detail="Across 48 countries" /><AppMetric label="Tier 2+ visible" value="78%" detail="+14 pts in 90 days" tone="healthy" /><AppMetric label="Single-source paths" value="41" detail="$218M spend" tone="critical" /><AppMetric label="Alternatives ready" value="86" detail="27 pre-qualified" tone="opportunity" /></div>
      <div className="app-grid supplier-graph-grid">
        <section className="panel supplier-network-panel"><header className="panel-header"><div><p className="kicker">N-TIER SUPPLY NETWORK</p><h2>Graphite G-142 dependency</h2><span>Ownership, site, material, part, plant, product, and customer links.</span></div><span className="live-chip"><Dot tone="healthy" />Graph current</span></header><div className="supplier-network"><i className="sg-edge e1" /><i className="sg-edge e2" /><i className="sg-edge e3" /><i className="sg-edge e4" /><i className="sg-edge e5" /><i className="sg-edge e6" />{[
          ["event","External event","Capacity agreements","critical"], ["tier2","NeoGraph Materials","Tier 2 · graphite","critical"], ["tier1","CellCore Industries","Tier 1 · cells","watch"], ["material","Graphite G-142","Critical material","critical"], ["plant","Pune Plant 02","Assembly plant","healthy"], ["product","AX-4 drive unit","4 programs","watch"], ["customer","28 customer orders","$42M value","opportunity"],
        ].map((node) => <button type="button" className={`sg-node sg-node-${node[0]} sg-node-${node[3]}`} key={node[0]} onClick={() => onToast(`${node[1]} graph evidence opened.`)}><small>{node[2]}</small><b>{node[1]}</b><span>{node[3]}</span></button>)}</div></section>
        <section className="panel supplier-profile"><header className="panel-header"><div><p className="kicker">SUPPLIER PROFILE</p><h2>{selected.name}</h2></div><span className={`risk-score risk-score-${selected.risk}`}>{selected.dependency}</span></header><div className="profile-hero"><span>{selected.name.split(" ").map((word) => word[0]).join("").slice(0,2)}</span><div><b>{selected.category}</b><p>{selected.tier} · {selected.region}</p></div></div><dl><div><dt>Annual spend</dt><dd>{selected.spend}</dd></div><div><dt>Dependency</dt><dd>{selected.dependency}%</dd></div><div><dt>Quality PPM</dt><dd>248</dd></div><div><dt>OTIF</dt><dd>91.8%</dd></div><div><dt>Capacity used</dt><dd>87%</dd></div><div><dt>Financial trend</dt><dd>Stable</dd></div></dl><div className="profile-evidence"><p className="kicker">EVIDENCE COVERAGE</p>{[["Identity + ownership",98],["Capability",92],["Capacity",81],["ESG + compliance",76]].map((item) => <div key={item[0]}><span>{item[0]}</span><div className="progress-track"><i style={{width:`${item[1]}%`}} /></div><b>{item[1]}%</b></div>)}</div><button className="primary-action" type="button" onClick={() => onToast(`${selected.name} development plan opened.`)}>Open supplier plan →</button></section>
      </div>
      <section className="panel alternatives-panel"><header className="panel-header"><div><p className="kicker">ALTERNATIVE DISCOVERY</p><h2>Credible options for constrained supply</h2><span>Matched by material, process, equipment, certification, geography, capacity, and should-cost.</span></div><button type="button">Change requirements</button></header><div className="alternative-list">{[
        ["VietCarbon Advanced", "Vietnam", "92% match", "8–12 weeks", "$14.8/kg", "opportunity"], ["Kansai Graphite", "Japan", "87% match", "12–16 weeks", "$15.6/kg", "healthy"], ["IndoMat Energy", "India", "82% match", "6–10 weeks", "$14.2/kg", "watch"],
      ].map((item, index) => <article key={item[0]}><span>0{index + 1}</span><div><b>{item[0]}</b><small>{item[1]} · ISO 9001 · battery-grade graphite</small></div><strong>{item[2]}</strong><span><small>QUALIFICATION</small><b>{item[3]}</b></span><span><small>SHOULD-COST</small><b>{item[4]}</b></span><Dot tone={item[5] as StatusTone} /><button type="button" onClick={() => onToast(`${item[0]} added to qualification shortlist.`)}>Shortlist</button></article>)}</div></section>
      <section className="panel supplier-register"><header className="panel-header"><div><p className="kicker">SUPPLIER PORTFOLIO</p><h2>Criticality, spend, and dependency</h2></div></header><div className="table-scroll"><table><thead><tr><th>Supplier</th><th>Category</th><th>Tier</th><th>Region</th><th>Spend</th><th>Dependency</th><th>Risk</th><th /></tr></thead><tbody>{snapshot.suppliers.map((supplier) => <tr key={supplier.name}><td><span className="asset-cell"><Dot tone={supplier.risk} /><span><b>{supplier.name}</b><small>Evidence 92%</small></span></span></td><td>{supplier.category}</td><td>{supplier.tier}</td><td>{supplier.region}</td><td><b>{supplier.spend}</b></td><td>{supplier.dependency}%</td><td><span className={`state-chip state-${supplier.risk}`}>{supplier.risk}</span></td><td><button type="button" onClick={() => setSelectedName(supplier.name)}>Open</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export default function ApplicationViews({ app, snapshot, activeCase, onOpenCase, onOpenAction, onOpenAgents, onOpenGraph, onToast }: ApplicationViewsProps) {
  const workspace = app === "risk" ? <RiskRadar snapshot={snapshot} onOpenGraph={onOpenGraph} onToast={onToast} />
    : app === "optimizer" ? <Optimizer snapshot={snapshot} onToast={onToast} />
    : app === "flow" ? <FlowLens snapshot={snapshot} onToast={onToast} />
    : app === "demand" ? <DemandSense snapshot={snapshot} onToast={onToast} />
    : <SupplierGraph snapshot={snapshot} onOpenGraph={onOpenGraph} onToast={onToast} />;

  const contribution = activeCase.contributions.find((item) => item.app === app);

  return <div className="application-container"><section className="case-context-strip"><div><span className={`severity-${activeCase.severity.toLowerCase()}`} /><p><small>ACTIVE DECISION CONTEXT · {activeCase.id}</small><b>{activeCase.title}</b></p></div><dl><div><dt>This app contributes</dt><dd>{contribution?.value ?? "Connected"} · {contribution?.method ?? "Shared case"}</dd></div><div><dt>Lifecycle</dt><dd>{activeCase.stage} · {activeCase.status}</dd></div></dl><div><button type="button" onClick={onOpenCase}>Open case</button><button className="primary-action" type="button" onClick={onOpenAction}>Action Room →</button></div></section><button className="app-data-context" type="button" onClick={onOpenAgents}><Dot tone="healthy" /><span><b>Connected data context</b><small>5 agents running · private graph refreshed 18 sec ago</small></span><em>Inspect Agent Hub →</em></button>{workspace}</div>;
}
