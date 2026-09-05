"use client";

import { useState } from "react";
import { dataAgents, type AgentStatus, type DataViewId, type ScopeSnapshot, type StatusTone } from "./platform-model";

type DataOperationsProps = {
  view: DataViewId;
  snapshot: ScopeSnapshot;
  onOpenApp: (app: "risk" | "optimizer" | "flow" | "demand" | "suppliers") => void;
  onToast: (message: string) => void;
};

function Dot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

function TraceMetric({ label, value, detail, tone = "info", onTrace }: { label: string; value: string; detail: string; tone?: StatusTone; onTrace: (message: string) => void }) {
  return <button data-action-id={`data.metric.${label.toLowerCase().replaceAll(" ", "-")}`} type="button" className={`app-metric app-metric-${tone}`} onClick={() => onTrace(`${label} fixture receipt opened: ${value}; ${detail}. This value belongs to the deterministic concept dataset and was not read from a connected source.`)}><div><span>{label}</span><Dot tone={tone} /></div><strong>{value}</strong><p>{detail} · Trace ◇</p></button>;
}

function AgentHub({ snapshot, onToast }: Pick<DataOperationsProps, "snapshot" | "onToast">) {
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>(() => Object.fromEntries(dataAgents.map((agent) => [agent.id, agent.status])));
  const [filter, setFilter] = useState("All agents");
  const [selectedAgent, setSelectedAgent] = useState(dataAgents[0]);
  const [detailMode, setDetailMode] = useState<"overview" | "policy" | "runs">("overview");
  const [lastTestAgentId, setLastTestAgentId] = useState<string | null>(null);
  const filteredAgents = dataAgents.filter((agent) => filter === "All agents" || statuses[agent.id] === filter.toLowerCase());
  const running = Object.values(statuses).filter((status) => status === "running").length;
  const selectedStatus = statuses[selectedAgent.id];
  const canRunTest = selectedStatus === "running";
  const toggleAgent = (id: string) => {
    const next = statuses[id] === "paused" ? "running" : "paused";
    setStatuses((current) => ({ ...current, [id]: next }));
    onToast(`${dataAgents.find((agent) => agent.id === id)?.name} ${next === "running" ? "resumed" : "paused"} in this synthetic session; no source system changed.`);
  };
  const runTest = () => {
    if (!canRunTest) {
      onToast(`${selectedAgent.name} must be running before a synthetic dry run can start.`);
      return;
    }
    setLastTestAgentId(selectedAgent.id);
    setDetailMode("runs");
    onToast(`${selectedAgent.name} synthetic dry run completed; no source was read or written.`);
  };

  return (
    <div className="data-workspace agent-workspace">
      <section className="data-intro"><div className="app-code">DA</div><div><p className="kicker">{snapshot.shortLabel.toUpperCase()} · PROJECT DATA</p><h1 tabIndex={-1} data-page-heading>Data agents</h1><p>Manage approved source adapters, quality checks, and knowledge-graph inputs for this project.</p></div><aside><span>ACCESS</span><b>Read-only synthetic profiles</b><button type="button" onClick={() => onToast("Synthetic deployment preview opened; no agent or credential was created.")}>Review setup →</button></aside></section>
      <div className="app-metrics"><TraceMetric label="Profiles active" value={`${running}/${dataAgents.length}`} detail="Browser-session adapter profiles" tone="healthy" onTrace={onToast} /><TraceMetric label="Record fixtures" value="180M" detail="Illustrative structured and unstructured scale" onTrace={onToast} /><TraceMetric label="Entity fixtures" value="8.4M" detail="27.6M illustrative relationships" tone="opportunity" onTrace={onToast} /><TraceMetric label="Exception fixtures" value="214" detail="12 modeled for business review" tone="watch" onTrace={onToast} /></div>

      <section className="ingestion-pipeline panel" aria-labelledby="pipeline-title"><header className="panel-header"><div><p className="kicker">INGESTION + KNOWLEDGE PIPELINE · SYNTHETIC</p><h2 id="pipeline-title">From source evidence to controlled application context</h2><span>Every modeled stage is policy-scoped and attributable; this concept does not contact source systems.</span></div><span className="live-chip"><Dot tone="healthy" />18 sec fixture latency</span></header><div className="pipeline-stages">{[
        ["01","Observe","ERP · PLM · WMS · TMS · QMS · CRM · finance · files · web","180M records","healthy"], ["02","Extract","Tables · documents · events · messages","99.1% parsed","healthy"], ["03","Resolve","Identity · unit · hierarchy · time","214 exceptions","watch"], ["04","Connect","Entities + evidence + relationships","27.6M links","opportunity"], ["05","Reason","Signals · impacts · scenarios · controls","5 decision apps","info"], ["06","Act","Approval · concept handoff · measurement","Human gated · no live write-back","healthy"],
      ].map((stage, index) => <article key={stage[0]}><span>{stage[0]}</span><Dot tone={stage[4] as StatusTone} /><b>{stage[1]}</b><p>{stage[2]}</p><strong>{stage[3]}</strong>{index < 5 && <i>→</i>}</article>)}</div><footer><span><b>PRIVATE RAW ZONE</b> Source records remain inside the client boundary</span><span><b>SHARED SIGNAL ZONE</b> Only governed, anonymized signals can cross tenants</span></footer></section>

      <section className="panel agent-register"><header className="panel-header"><div><p className="kicker">AGENT ADAPTER PROFILES · SYNTHETIC</p><h2>Model approved-source adapters without replacing source systems</h2></div><div className="segmented-control compact">{["All agents","Running","Attention","Paused"].map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></header><div className="agent-list">{filteredAgents.map((agent) => { const status = statuses[agent.id]; const tone: StatusTone = status === "running" ? "healthy" : status === "attention" ? "watch" : "info"; return <article className={selectedAgent.id === agent.id ? "selected" : ""} key={agent.id}><button className="agent-main" type="button" onClick={() => { setSelectedAgent(agent); setDetailMode("overview"); }}><span className={`agent-icon agent-icon-${status}`}>{agent.name.split(" ").map((word) => word[0]).join("").slice(0,2)}</span><div><b>{agent.name}</b><small>{agent.source}</small></div><span className={`state-chip state-${tone}`}><Dot tone={tone} />{status} fixture</span></button><div className="agent-stat"><small>FIXTURE AGE</small><b>{status === "paused" ? "Paused" : agent.freshness}</b></div><div className="agent-stat"><small>MODELED RECORDS</small><b>{agent.records}</b></div><div className="agent-stat"><small>FIXTURE QUALITY</small><b>{agent.quality}%</b></div><div className="agent-stat"><small>TARGET BOUNDARY</small><b>{agent.boundary}</b></div><button className="agent-control" type="button" onClick={() => toggleAgent(agent.id)}>{status === "paused" ? "Resume fixture" : "Pause fixture"}</button></article>})}</div></section>

      <div className="data-grid">
        <section className="panel agent-detail">
          <header className="panel-header"><div><p className="kicker">SELECTED ADAPTER PROFILE</p><h2>{selectedAgent.name}</h2></div><span className="model-status">TARGET POLICY · {selectedStatus.toUpperCase()} FIXTURE</span></header>
          <div className="agent-detail-hero"><span>{selectedAgent.source}</span><b>{selectedAgent.mode}</b><p>{selectedAgent.entities} · runtime {selectedStatus}</p></div>
          <dl><div><dt>Session status</dt><dd>{selectedStatus} fixture</dd></div><div><dt>Fixture age</dt><dd>{selectedStatus === "paused" ? "Paused" : selectedAgent.freshness}</dd></div><div><dt>Target boundary</dt><dd>{selectedAgent.boundary}</dd></div><div><dt>Credential target</dt><dd>Customer-managed identity</dd></div><div><dt>Write access</dt><dd>Not connected</dd></div><div><dt>Raw retention</dt><dd>Production policy required</dd></div><div><dt>Cross-tenant training</dt><dd>Target state disabled</dd></div><div><dt>Evidence lineage</dt><dd>Fixture references only</dd></div></dl>
          <div className="agent-actions"><button className={detailMode === "policy" ? "active" : ""} aria-pressed={detailMode === "policy"} type="button" onClick={() => setDetailMode("policy")}>Inspect policy</button><button className={detailMode === "runs" ? "active" : ""} aria-pressed={detailMode === "runs"} type="button" onClick={() => setDetailMode("runs")}>View recent runs</button><button className="primary-action" type="button" onClick={runTest} disabled={!canRunTest}>{canRunTest ? "Run synthetic test →" : "Resume to test"}</button></div>
          <div className="decision-box" aria-live="polite">
            {detailMode === "policy" ? <><span>TARGET POLICY VIEW · SYNTHETIC</span><b>Proposed read-only observation inside {selectedAgent.boundary}</b><p>Customer-managed identity, source write access disabled, retained lineage, and no cross-tenant training are target controls that require production implementation and verification.</p></>
              : detailMode === "runs" ? <><span>RECENT RUNS · SYNTHETIC FIXTURE</span><b>{lastTestAgentId === selectedAgent.id ? "Dry run completed just now" : `Last modeled run ${selectedAgent.freshness}`}</b><p>{selectedStatus === "running" ? `${selectedAgent.records} modeled records · ${selectedAgent.quality}% quality · no source read or write.` : `Runtime ${selectedStatus}; no new dry run is permitted until the agent is running.`}</p></>
                : <><span>SESSION VIEW · SYNTHETIC</span><b>{selectedStatus === "running" ? "Adapter profile active" : selectedStatus === "paused" ? "Adapter profile paused" : "Business review modeled"}</b><p>Status changes affect this concept session only; no agent, credential, source record, or operational schedule is changed.</p></>}
          </div>
        </section>
        <section className="panel ingestion-events"><header className="panel-header"><div><p className="kicker">SYNTHETIC INGESTION EVENTS</p><h2>What the fixed concept stream is illustrating</h2></div><span className="live-chip"><Dot tone="healthy" />Fixture sequence</span></header><ol>{[
          ["11:42:18","ERP transaction agent","1,284 order changes merged","healthy"], ["11:42:04","Movement agent","MV Meridian Star ETA revised +3.4d","watch"], ["11:41:52","Market intelligence swarm","Capacity agreement evidence corroborated","critical"], ["11:41:31","Product knowledge agent","42 BOM revisions connected to AX-4","healthy"], ["11:41:08","Supplier portal agent","12 carbon evidence fields unresolved","watch"], ["11:40:44","Identity resolution","NeoGraph parent entity confirmed","opportunity"],
        ].map((event) => <li key={`${event[0]}-${event[2]}`}><time>{event[0]}</time><Dot tone={event[3] as StatusTone} /><div><b>{event[2]}</b><small>{event[1]}</small></div></li>)}</ol></section>
      </div>
    </div>
  );
}

function KnowledgeGraph({ snapshot, onOpenApp, onToast }: Omit<DataOperationsProps, "view">) {
  const graphNodes = [
    { id: "event", label: "Capacity agreement", kind: "External event", tone: "critical" as const, confidence: 91, x: 8, y: 24, facts: "3 filings · 91% confidence" },
    { id: "company", label: "NeoGraph Materials", kind: "Company", tone: "watch" as const, confidence: 97, x: 29, y: 18, facts: "Resolved identity · Tier 2" },
    { id: "material", label: "Graphite G-142", kind: "Material", tone: "critical" as const, confidence: 96, x: 47, y: 42, facts: "92% dependency · $18.4M spend" },
    { id: "part", label: "Cell module C8", kind: "Component", tone: "watch" as const, confidence: 88, x: 66, y: 18, facts: "4 BOM positions · 2 programs" },
    { id: "plant", label: "Pune Plant 02", kind: "Plant", tone: "healthy" as const, confidence: 99, x: 65, y: 66, facts: "486 orders · 14 days cover" },
    { id: "product", label: "AX-4 drive unit", kind: "Product", tone: "watch" as const, confidence: 93, x: 84, y: 44, facts: "$42M customer value" },
    { id: "order", label: "28 priority orders", kind: "Customer demand", tone: "critical" as const, confidence: 89, x: 88, y: 75, facts: "$4.2M margin exposure" },
    { id: "supplier", label: "VietCarbon", kind: "Alternative", tone: "opportunity" as const, confidence: 87, x: 29, y: 72, facts: "92% capability match" },
  ];
  const edges = [["event","company"],["company","material"],["supplier","material"],["material","part"],["material","plant"],["part","product"],["plant","product"],["product","order"]];
  const [selectedId, setSelectedId] = useState(graphNodes[2].id);
  const [layer, setLayer] = useState("Business impact");
  const [entityType, setEntityType] = useState("All entities");
  const [confidenceFilter, setConfidenceFilter] = useState("All confidence");
  const graphIndex = new Map(graphNodes.map((node) => [node.id,node]));
  const layerNodes: Record<string, readonly string[]> = {
    "Business impact": ["event", "company", "material", "part", "plant", "product", "order", "supplier"],
    "Supply network": ["company", "supplier", "material", "part", "plant", "product"],
    "Money flow": ["material", "plant", "product", "order"],
    "Evidence lineage": ["event", "company", "material", "product", "order"],
  };
  const matchesEntityType = (kind: string) => entityType === "All entities"
    || (entityType === "Supplier" && (kind === "Company" || kind === "Alternative"))
    || (entityType === "Material" && kind === "Material")
    || (entityType === "Product" && (kind === "Product" || kind === "Component"))
    || (entityType === "Order" && kind === "Customer demand");
  const visibleNodes = graphNodes.filter((node) => layerNodes[layer].includes(node.id)
    && matchesEntityType(node.kind)
    && (confidenceFilter === "All confidence" || (confidenceFilter === "Above 90%" ? node.confidence > 90 : node.confidence <= 90)));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = edges.filter(([fromId, toId]) => visibleNodeIds.has(fromId) && visibleNodeIds.has(toId));
  const selected = visibleNodes.find((node) => node.id === selectedId) ?? visibleNodes[0];
  const resetGraph = () => {
    setLayer("Business impact");
    setEntityType("All entities");
    setConfidenceFilter("All confidence");
    setSelectedId("material");
    onToast("Synthetic graph view reset; no data or source system changed.");
  };
  const layerTitle: Record<string, string> = {
    "Business impact": "Graphite capacity → customer and margin exposure",
    "Supply network": "Supplier → material → plant → product dependency",
    "Money flow": "Material spend → inventory → product value → order margin",
    "Evidence lineage": "Observed event → resolved entity → governed decision fact",
  };

  return (
    <div className="data-workspace graph-workspace">
      <section className="data-intro"><div className="app-code">KG</div><div><p className="kicker">{snapshot.shortLabel.toUpperCase()} · PROJECT GRAPH</p><h1 tabIndex={-1} data-page-heading>Knowledge graph</h1><p>Inspect entities, relationships, evidence lineage, and decision impact.</p></div><aside><span>FIXTURE SCALE</span><b>8.4M entities · 27.6M relationships</b><button type="button" onClick={() => onToast("Synthetic governed subgraph preview prepared; no file or source data was exported.")}>Review subgraph →</button></aside></section>
      <div className="app-metrics"><TraceMetric label="Entity fixtures" value="8.4M" detail="98.2% illustrative identity resolution" onTrace={onToast} /><TraceMetric label="Relationship fixtures" value="27.6M" detail="96.8% illustrative reference coverage" tone="opportunity" onTrace={onToast} /><TraceMetric label="Shown reference coverage" value="100%" detail="All facts in the displayed subgraph have fixture references" tone="healthy" onTrace={onToast} /><TraceMetric label="Mapping exceptions" value="214" detail="12 synthetic business-critical examples" tone="watch" onTrace={onToast} /></div>
      <section className="panel graph-toolbar"><div className="segmented-control wide">{["Business impact","Supply network","Money flow","Evidence lineage"].map((item) => <button className={layer === item ? "active" : ""} type="button" key={item} onClick={() => setLayer(item)}>{item}</button>)}</div><label>Entity type<select value={entityType} onChange={(event) => setEntityType(event.target.value)}><option>All entities</option><option>Supplier</option><option>Material</option><option>Product</option><option>Order</option></select></label><label>Confidence<select value={confidenceFilter} onChange={(event) => setConfidenceFilter(event.target.value)}><option>All confidence</option><option>Above 90%</option><option>Review required</option></select></label><button type="button" onClick={resetGraph}>Reset graph ⛶</button></section>
      <section className="panel knowledge-canvas-panel">
        <header className="panel-header"><div><p className="kicker">{layer.toUpperCase()} LAYER · SYNTHETIC VIEW</p><h2>{layerTitle[layer]}</h2><span>{visibleNodes.length} entities and {visibleEdges.length} relationships match the current deterministic filters.</span></div><div className="map-legend"><span><Dot tone="critical" />Critical</span><span><Dot tone="healthy" />Verified</span><span><Dot tone="opportunity" />Alternative</span></div></header>
        <div className="knowledge-layout">
          <div className="knowledge-canvas">
            {visibleEdges.map(([fromId,toId],index) => { const from = graphIndex.get(fromId)!; const to=graphIndex.get(toId)!; const dx=to.x-from.x,dy=to.y-from.y,length=Math.sqrt(dx*dx+dy*dy),angle=Math.atan2(dy,dx)*180/Math.PI; return <i className="kg-edge" key={`${fromId}-${toId}`} style={{left:`${from.x}%`,top:`${from.y}%`,width:`${length}%`,transform:`rotate(${angle}deg)`}}><span>{index % 2 ? "SUPPLIES" : "LINKED TO"}</span></i>; })}
            {visibleNodes.map((node) => <button className={`kg-node kg-node-${node.tone} ${selected?.id === node.id ? "selected" : ""}`} type="button" key={node.id} style={{left:`${node.x}%`,top:`${node.y}%`}} onClick={() => setSelectedId(node.id)}><small>{node.kind} · {node.confidence}%</small><b>{node.label}</b><span>{node.facts}</span></button>)}
            {!visibleNodes.length && <div className="empty-state"><b>No entities match these filters.</b><span>Reset the graph or broaden entity confidence.</span></div>}
            <div className="graph-provenance"><span><Dot tone="healthy" />Observed fact</span><span><Dot tone="info" />Resolved relationship</span><span><Dot tone="watch" />Inferred · reviewable</span></div>
          </div>
          <aside className="entity-inspector">
            {selected ? <>
              <div className="entity-title"><span>{selected.kind.split(" ").map((word)=>word[0]).join("").slice(0,2)}</span><div><p className="kicker">SELECTED ENTITY</p><h3>{selected.label}</h3></div><Dot tone={selected.tone} /></div>
              <p>{selected.facts}. This entity is connected to the selected {layer.toLowerCase()} path and retains all contributing synthetic evidence.</p>
              <dl><div><dt>Entity type</dt><dd>{selected.kind}</dd></div><div><dt>Confidence</dt><dd>{selected.confidence}%</dd></div><div><dt>Last changed</dt><dd>18 sec ago · fixture</dd></div><div><dt>Visible degree</dt><dd>{visibleEdges.filter(([fromId, toId]) => fromId === selected.id || toId === selected.id).length} links</dd></div></dl>
              <div className="source-proof"><p className="kicker">EXPECTED SOURCES · SYNTHETIC REFERENCES</p>{[["SAP S/4HANA","Fixture reference","healthy"],["Teamcenter PLM","Fixture reference","healthy"],["Public filing","Illustrative corroboration","info"],["Analyst mapping","Illustrative approval","opportunity"]].map((source) => <button type="button" key={source[0]} onClick={() => onToast(`${source[0]} synthetic evidence reference opened; no source system was contacted.`)}><Dot tone={source[2] as StatusTone} /><span><b>{source[0]}</b><small>{source[1]} · reference ID retained</small></span><em>→</em></button>)}</div>
              <p className="kicker app-use-kicker">USED BY APPLICATIONS</p><div className="entity-apps">{[["RiskRadar","risk"],["Optimizer","optimizer"],["FlowLens","flow"],["DemandSense","demand"],["SupplierGraph","suppliers"]].map((app) => <button type="button" key={app[0]} onClick={() => onOpenApp(app[1] as "risk" | "optimizer" | "flow" | "demand" | "suppliers")}><span>{app[0].slice(0,2).toUpperCase()}</span><b>{app[0]}</b><em>→</em></button>)}</div>
            </> : <div className="empty-state"><b>No entity selected.</b><span>Reset the graph to restore the deterministic synthetic path.</span></div>}
          </aside>
        </div>
      </section>
      <div className="data-grid graph-bottom-grid"><section className="panel schema-coverage"><header className="panel-header"><div><p className="kicker">BUSINESS ONTOLOGY COVERAGE</p><h2>What the graph understands</h2></div></header>{[["Supplier + ownership",98,"6,420 entities"],["Material + component",94,"88,214 entities"],["Product + BOM",97,"4.6M relationships"],["Order + customer",99,"18,402 open orders"],["Movement + cargo",93,"2,164 active movements"],["Cost + margin",86,"3 families partial"],["Carbon + evidence",76,"12 suppliers incomplete"]].map((item) => <article key={item[0]}><div><b>{item[0]}</b><small>{item[2]}</small></div><div className="progress-track"><i className={Number(item[1]) < 85 ? "fill-watch" : "fill-healthy"} style={{width:`${item[1]}%`}} /></div><strong>{item[1]}%</strong></article>)}</section><section className="panel mapping-queue"><header className="panel-header"><div><p className="kicker">HUMAN REVIEW QUEUE · SYNTHETIC</p><h2>Mappings that need business judgment</h2></div><span className="state-chip state-watch">12 critical</span></header>{[["MAP-214","Graphite G-142","Material ID conflicts with PLM grade","62%"],["MAP-209","NeoGraph Materials","Duplicate legal entity","81%"],["MAP-197","AX-4 housing","Unit conversion missing","74%"],["MAP-188","Chennai route 04","No current emissions factor","93%"]].map((item) => <button type="button" key={item[0]} onClick={() => onToast(`${item[0]} synthetic review preview opened; no mapping record changed.`)}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div><strong>{item[3]}</strong><em>Preview →</em></button>)}</section></div>
    </div>
  );
}

export default function DataOperations({ view, snapshot, onOpenApp, onToast }: DataOperationsProps) {
  return (
    <div className="data-operation-stack">
      {view === "agents" ? <AgentHub snapshot={snapshot} onToast={onToast} /> : <KnowledgeGraph snapshot={snapshot} onOpenApp={onOpenApp} onToast={onToast} />}
    </div>
  );
}
