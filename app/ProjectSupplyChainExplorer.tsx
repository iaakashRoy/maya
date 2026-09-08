"use client";

import { useRef, useState, type CSSProperties } from "react";
import { caseStudyProfileFor, type SupplyChainCheckpoint, type SupplyChainNetwork, type SupplyChainNode } from "./case-study-model";
import { fixtureEvidenceFor, type EvidenceReceipt, type WorkspaceProject } from "./workspace-model";

type ExplorerProps = {
  project: WorkspaceProject;
  query?: string;
  onEvidence: (target: string | EvidenceReceipt) => void;
};

type NetworkView = "graph" | "checkpoints";
type TraceDirection = "both" | "upstream" | "downstream";

const riskLabel = (score: number) => score >= 82 ? "Critical" : score >= 68 ? "High" : score >= 52 ? "Moderate" : "Low";

type DenseGraphProps = {
  network: SupplyChainNetwork;
  nodes: readonly SupplyChainNode[];
  tracedNodeIds: ReadonlySet<string>;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;
};

const assetKey = (assetType: string) => assetType.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function DenseSupplyNetworkGraph({ network, nodes, tracedNodeIds, selectedNodeId, onSelect }: DenseGraphProps) {
  const [zoom, setZoom] = useState(.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [focusMode, setFocusMode] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const stageIndexById = new Map(network.stages.map((stage, index) => [stage.id, index]));
  const satellitesByStage = new Map<string, number>();
  const points = new Map<string, { x: number; y: number; size: number }>();

  for (const node of nodes) {
    if (node.tier === "Hub") {
      points.set(node.id, { x: 500, y: 360, size: 58 });
      continue;
    }
    const stageIndex = stageIndexById.get(node.stageId) ?? 0;
    const baseAngle = -Math.PI / 2 + (stageIndex / network.stages.length) * Math.PI * 2;
    let radius = node.tier === "Primary" ? 108 : node.tier === "Alternate" ? 170 : node.tier === "Contingency" ? 228 : 286;
    let angle = baseAngle;
    const size = node.tier === "Primary" ? 28 : node.tier === "Alternate" ? 23 : node.tier === "Contingency" ? 20 : 9 + Math.round(node.riskScore / 28);
    if (node.tier === "Sub-tier") {
      const satelliteIndex = satellitesByStage.get(node.stageId) ?? 0;
      satellitesByStage.set(node.stageId, satelliteIndex + 1);
      angle += (satelliteIndex - 8.5) * .027;
      radius += ((satelliteIndex % 5) - 2) * 13;
    }
    points.set(node.id, { x: 500 + Math.cos(angle) * radius, y: 360 + Math.sin(angle) * radius, size });
  }

  const visibleIds = new Set(nodes.map((node) => node.id));
  const edges = network.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to));
  const resetView = () => { setZoom(.9); setPan({ x: 0, y: 0 }); };

  return <div className="dense-network-shell">
    <div className="dense-network-toolbar" aria-label="Graph navigation controls">
      <span><b>{nodes.length}</b> entities <i /> <b>{edges.length}</b> visible links</span>
      <button data-action-id="supply-network.focus" className={focusMode ? "active" : ""} type="button" aria-pressed={focusMode} onClick={() => setFocusMode((current) => !current)}>&#9673; Isolate path</button>
      <button data-action-id="supply-network.labels" className={showLabels ? "active" : ""} type="button" aria-pressed={showLabels} onClick={() => setShowLabels((current) => !current)}>Aa Labels</button>
      <button data-action-id="supply-network.zoom.out" type="button" aria-label="Zoom out" onClick={() => setZoom((current) => Math.max(.55, current - .1))}>&minus;</button>
      <output aria-label="Graph zoom">{Math.round(zoom * 100)}%</output>
      <button data-action-id="supply-network.zoom.in" type="button" aria-label="Zoom in" onClick={() => setZoom((current) => Math.min(1.5, current + .1))}>+</button>
      <button data-action-id="supply-network.zoom.fit" type="button" onClick={resetView}>Fit</button>
    </div>
    <div
      className="dense-network-viewport"
      aria-label="Interactive supply network. Drag to pan and use the controls to zoom."
      onWheel={(event) => { event.preventDefault(); setZoom((current) => Math.min(1.5, Math.max(.55, current + (event.deltaY < 0 ? .08 : -.08)))); }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        setPan({ x: drag.current.panX + event.clientX - drag.current.x, y: drag.current.panY + event.clientY - drag.current.y });
      }}
      onPointerUp={(event) => { drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}
    >
      <div className="dense-network-canvas" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        {network.stages.map((stage, index) => {
          const angle = -Math.PI / 2 + (index / network.stages.length) * Math.PI * 2;
          return <span className="dense-network-stage-label" key={stage.id} style={{ left: 500 + Math.cos(angle) * 334, top: 360 + Math.sin(angle) * 334 }}><b>{String(stage.sequence).padStart(2, "0")}</b>{stage.label}</span>;
        })}
        <div className="dense-network-edges" aria-hidden="true">{edges.map((edge) => {
          const from = points.get(edge.from)!;
          const to = points.get(edge.to)!;
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          const active = tracedNodeIds.has(edge.from) && tracedNodeIds.has(edge.to);
          return <span className={`${active ? "active" : ""} ${focusMode && !active ? "muted" : ""}`} data-risk={riskLabel(edge.riskScore).toLowerCase()} key={edge.id} style={{ left: from.x, top: from.y, width: length, transform: `rotate(${angle}rad)` }} />;
        })}</div>
        {nodes.map((node) => {
          const point = points.get(node.id)!;
          const selected = node.id === selectedNodeId;
          const traced = tracedNodeIds.has(node.id);
          const labeled = showLabels || selected || node.tier === "Hub" || node.tier === "Primary";
          return <button data-action-id={`supply-network.node.${node.id}`} data-asset={assetKey(node.assetType)} data-tier={node.tier.toLowerCase()} data-status={node.status} className={`dense-network-node ${selected ? "selected" : ""} ${traced ? "traced" : ""} ${focusMode && !traced ? "muted" : ""}`} type="button" key={node.id} style={{ left: point.x, top: point.y, width: point.size, height: point.size }} title={`${node.label} | ${node.assetType} | ${node.country} | risk ${node.riskScore}`} aria-label={`Select ${node.label}, ${node.assetType}, risk ${node.riskScore}`} onClick={() => onSelect(node.id)}><span aria-hidden="true">{node.tier === "Hub" ? node.label.slice(0, 2).toUpperCase() : node.tier === "Sub-tier" ? "" : node.tier.slice(0, 1)}</span>{labeled && <em>{node.label}</em>}</button>;
        })}
      </div>
    </div>
    <div className="dense-network-legend" aria-label="Entity categories">{[...new Set(nodes.map((node) => node.assetType))].map((category) => <span data-asset={assetKey(category)} key={category}><i />{category}<b>{nodes.filter((node) => node.assetType === category).length}</b></span>)}</div>
  </div>;
}

export default function ProjectSupplyChainExplorer({ project, query = "", onEvidence }: ExplorerProps) {
  const profile = caseStudyProfileFor(project);
  const network = profile?.supplyChain;
  const [view, setView] = useState<NetworkView>("graph");
  const [selectedNodeId, setSelectedNodeId] = useState(network?.nodes[0]?.id ?? "");
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(network?.checkpoints[0]?.id ?? "");
  const [stageFilter, setStageFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [traceDirection, setTraceDirection] = useState<TraceDirection>("both");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const selectedNode = network?.nodes.find((node) => node.id === selectedNodeId) ?? network?.nodes[0];
  const selectedCheckpoint = network?.checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? network?.checkpoints[0];
  const normalizedQuery = query.trim().toLowerCase();
  const regions = [...new Set(network?.nodes.map((node) => node.geography) ?? [])];
  const categories = [...new Set(network?.nodes.map((node) => node.assetType) ?? [])];

  const tracedNodeIds = (() => {
    const traced = new Set<string>();
    if (!network || !selectedNodeId) return traced;
    traced.add(selectedNodeId);
    const walk = (direction: "upstream" | "downstream") => {
      const queue = [selectedNodeId];
      while (queue.length) {
        const current = queue.shift()!;
        for (const edge of network.edges) {
          const candidate = direction === "upstream" && edge.to === current ? edge.from : direction === "downstream" && edge.from === current ? edge.to : null;
          if (candidate && !traced.has(candidate)) {
            traced.add(candidate);
            queue.push(candidate);
          }
        }
      }
    };
    if (traceDirection !== "downstream") walk("upstream");
    if (traceDirection !== "upstream") walk("downstream");
    return traced;
  })();

  if (!profile || !network) return null;

  const visibleStages = network.stages.filter((stage) => stageFilter === "all" || stage.id === stageFilter);
  const visibleNodes = network.nodes.filter((node) => {
    const searchable = `${node.id} ${node.label} ${node.assetType} ${node.country} ${node.role} ${node.status}`.toLowerCase();
    return (stageFilter === "all" || node.stageId === stageFilter)
      && (regionFilter === "all" || node.geography === regionFilter)
      && (categoryFilter === "all" || node.assetType === categoryFilter)
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const visibleCheckpoints = network.checkpoints.filter((checkpoint) => {
    const stage = network.stages.find((item) => item.id === checkpoint.stageId);
    const searchable = `${checkpoint.id} ${checkpoint.title} ${checkpoint.category} ${checkpoint.status} ${checkpoint.owner} ${checkpoint.downstreamImpact}`.toLowerCase();
    return (stageFilter === "all" || checkpoint.stageId === stageFilter)
      && (severityFilter === "all" || checkpoint.severity === severityFilter)
      && (!normalizedQuery || `${searchable} ${stage?.label ?? ""}`.includes(normalizedQuery));
  });
  const criticalCount = network.checkpoints.filter((checkpoint) => checkpoint.severity === "critical").length;
  const highCount = network.checkpoints.filter((checkpoint) => checkpoint.severity === "high").length;

  const nodeReceipt = (node: SupplyChainNode) => fixtureEvidenceFor(project, {
    id: node.evidenceRef,
    claim: `${node.label} operating-node snapshot`,
    displayedValue: `${node.throughput} at ${node.utilization}% modeled utilization`,
    source: node.sourceClass,
    formula: "Deterministic synthetic node record. Capacity, throughput, lead time, concentration, risk, and value are scenario fixtures; no company source system was queried.",
    inputs: [node.id, node.stageId, profile.shock, ...project.variablePack.l0.slice(0, 3)],
    variableId: project.variablePack.l0[0] ?? "Project network node",
    grain: "Project x stage x operating node x simulation tick",
    confidence: node.confidence,
  });
  const checkpointReceipt = (checkpoint: SupplyChainCheckpoint) => fixtureEvidenceFor(project, {
    id: checkpoint.evidenceRef,
    claim: checkpoint.title,
    displayedValue: `${checkpoint.observed}${checkpoint.unit.startsWith("%") ? "%" : ""} against ${checkpoint.target}${checkpoint.unit.startsWith("%") ? "%" : ""} guardrail`,
    source: `${profile.project} synthetic checkpoint register`,
    formula: `${checkpoint.category} checkpoint evaluated on every deterministic simulation tick. ${checkpoint.trigger}`,
    inputs: [checkpoint.id, checkpoint.stageId, profile.shock, checkpoint.downstreamImpact],
    variableId: checkpoint.category === "Capacity" ? "L0-071" : "L0-057",
    grain: "Project x stage x checkpoint x simulation tick",
    confidence: profile.confidence,
  });

  return <section className="supply-network-explorer" aria-label={`${project.client} multilevel supply chain`}>
    <header className="supply-network-commandbar">
      <nav aria-label="Supply chain network views">
        <button data-action-id="supply-network.view.graph" className={view === "graph" ? "active" : ""} type="button" aria-pressed={view === "graph"} onClick={() => setView("graph")}><span aria-hidden="true">&#9678;</span>Graph <em>{network.nodes.length}</em></button>
        <button data-action-id="supply-network.view.checkpoints" className={view === "checkpoints" ? "active" : ""} type="button" aria-pressed={view === "checkpoints"} onClick={() => setView("checkpoints")}><span aria-hidden="true">&#9873;</span>Chokepoints <em>{network.checkpoints.length}</em></button>
      </nav>
      <div className="supply-network-facts" aria-label="Network summary">
        <span><b>{network.stages.length}</b> levels</span>
        <span><b>{network.edges.length}</b> dependencies</span>
        <span className="critical"><b>{criticalCount}</b> critical</span>
        <span className="high"><b>{highCount}</b> high</span>
        <small>SIMULATION TICK 14:02:44 IST</small>
      </div>
    </header>

    <div className="supply-network-filters">
      <label>Level<select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="all">All {network.stages.length} levels</option>{network.stages.map((stage) => <option value={stage.id} key={stage.id}>{stage.sequence}. {stage.label}</option>)}</select></label>
      {view === "graph" ? <>
        <label>Geography<select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="all">All geographies</option>{regions.map((region) => <option value={region} key={region}>{region}</option>)}</select></label>
        <label>Entity<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All entity types</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
        <label>Trace<select value={traceDirection} onChange={(event) => setTraceDirection(event.target.value as TraceDirection)}><option value="both">Upstream + downstream</option><option value="upstream">Upstream only</option><option value="downstream">Downstream only</option></select></label>
      </> : <label>Severity<select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option></select></label>}
      <button data-action-id="supply-network.filters.reset" type="button" onClick={() => { setStageFilter("all"); setRegionFilter("all"); setSeverityFilter("all"); setTraceDirection("both"); setCategoryFilter("all"); }}>Reset filters</button>
      <p><span />Operationally realistic synthetic data · no live company feed</p>
    </div>

    {view === "graph" ? <div className="supply-network-graph-view">
      <DenseSupplyNetworkGraph network={network} nodes={visibleNodes} tracedNodeIds={tracedNodeIds} selectedNodeId={selectedNode?.id ?? ""} onSelect={setSelectedNodeId} />
      <div className="supply-stage-scroll" aria-label="Scrollable supply chain levels">
        <div className="supply-stage-grid" style={{ "--stage-count": visibleStages.length } as CSSProperties}>
          {visibleStages.map((stage) => {
            const stageNodes = visibleNodes.filter((node) => node.stageId === stage.id);
            return <article className="supply-stage-column" key={stage.id}>
              <header><span>{String(stage.sequence).padStart(2, "0")}</span><div><b>{stage.label}</b><small>{stage.description}</small></div></header>
              <div>{stageNodes.map((node) => {
                const outgoing = network.edges.find((edge) => edge.from === node.id);
                const selected = node.id === selectedNode?.id;
                return <button data-action-id={`supply-network.node.${node.id}`} className={`${selected ? "selected" : ""} ${tracedNodeIds.has(node.id) ? "traced" : ""}`} data-status={node.status} type="button" key={node.id} title={`Select ${node.label}; ${node.throughput}; ${node.annualValue}; risk ${node.riskScore}`} onClick={() => setSelectedNodeId(node.id)}>
                  <span className="supply-node-heading"><i>{node.tier === "Primary" ? "P" : node.tier === "Alternate" ? "A" : "C"}</i><span><b>{node.label}</b><small>{node.country} · {node.role}</small></span><em>{node.riskScore}</em></span>
                  <dl><div><dt>Flow</dt><dd>{node.throughput}</dd></div><div><dt>Util.</dt><dd>{node.utilization}%</dd></div><div><dt>Lead</dt><dd>{node.leadTime}d</dd></div><div><dt>Value</dt><dd>{node.annualValue}</dd></div></dl>
                  {outgoing && <small className="supply-edge-preview">{outgoing.mode} · {outgoing.share}% path share &#8594;</small>}
                </button>;
              })}{!stageNodes.length && <p>No nodes match the active filters.</p>}</div>
            </article>;
          })}
        </div>
      </div>
      {selectedNode && <aside className="supply-node-inspector">
        <header><div><small>SELECTED NETWORK ENTITY</small><h3>{selectedNode.label}</h3><p>{selectedNode.role} · {selectedNode.country}</p></div><strong data-risk={riskLabel(selectedNode.riskScore).toLowerCase()}>{selectedNode.riskScore}<small>{riskLabel(selectedNode.riskScore)}</small></strong></header>
        <dl><div><dt>Tier</dt><dd>{selectedNode.tier}</dd></div><div><dt>Capacity</dt><dd>{selectedNode.capacity}</dd></div><div><dt>Throughput</dt><dd>{selectedNode.throughput}</dd></div><div><dt>Annual value</dt><dd>{selectedNode.annualValue}</dd></div><div><dt>Utilization</dt><dd>{selectedNode.utilization}%</dd></div><div><dt>Lead time</dt><dd>{selectedNode.leadTime} days</dd></div><div><dt>Path concentration</dt><dd>{selectedNode.concentration}%</dd></div><div><dt>Confidence</dt><dd>{selectedNode.confidence}%</dd></div></dl>
        <section><small>SUPPLIED BY ({network.edges.filter((edge) => edge.to === selectedNode.id).length})</small>{network.edges.filter((edge) => edge.to === selectedNode.id).map((edge) => <button data-action-id={`supply-network.edge.upstream.${edge.id}`} type="button" key={edge.id} onClick={() => setSelectedNodeId(edge.from)}><b>{network.nodes.find((node) => node.id === edge.from)?.label}</b><span>{edge.relationship} · {edge.share}% · {edge.leadTime}d</span></button>)}</section>
        <section><small>SUPPLIES ({network.edges.filter((edge) => edge.from === selectedNode.id).length})</small>{network.edges.filter((edge) => edge.from === selectedNode.id).map((edge) => <button data-action-id={`supply-network.edge.downstream.${edge.id}`} type="button" key={edge.id} onClick={() => setSelectedNodeId(edge.to)}><b>{network.nodes.find((node) => node.id === edge.to)?.label}</b><span>{edge.mode} · {edge.volume} · {edge.value}</span></button>)}</section>
        <footer><span>{selectedNode.freshness}</span><button data-action-id={`supply-network.evidence.${selectedNode.id}`} type="button" onClick={() => onEvidence(nodeReceipt(selectedNode))}>Trace evidence &#8599;</button></footer>
      </aside>}
    </div> : <div className="supply-checkpoint-view">
      <div className="supply-checkpoint-register">
        <header><span>Rank</span><span>Chokepoint</span><span>Observed / guardrail</span><span>Trend</span><span>Owner</span><span>Status</span></header>
        {visibleCheckpoints.sort((left, right) => {
          const severity = { critical: 4, high: 3, moderate: 2, low: 1 };
          return severity[right.severity] - severity[left.severity];
        }).map((checkpoint, index) => {
          const stage = network.stages.find((item) => item.id === checkpoint.stageId);
          return <button data-action-id={`supply-network.checkpoint.${checkpoint.id}`} className={selectedCheckpoint?.id === checkpoint.id ? "selected" : ""} data-severity={checkpoint.severity} type="button" key={checkpoint.id} onClick={() => setSelectedCheckpointId(checkpoint.id)}>
            <b>{String(index + 1).padStart(2, "0")}</b><span><strong>{checkpoint.title}</strong><small>{stage?.sequence}. {stage?.label} · {checkpoint.category}</small></span><span><strong>{checkpoint.observed} / {checkpoint.target}</strong><small>{checkpoint.unit}</small></span><span><strong>{checkpoint.trend}</strong><small>{checkpoint.cadence}</small></span><span><strong>{checkpoint.owner}</strong><small>{checkpoint.lastObserved}</small></span><em>{checkpoint.severity}</em>
          </button>;
        })}
        {!visibleCheckpoints.length && <p>No chokepoints match the active filters.</p>}
      </div>
      {selectedCheckpoint && <aside className="supply-checkpoint-inspector">
        <header><small>CHECKPOINT {selectedCheckpoint.id}</small><h3>{selectedCheckpoint.title}</h3><span data-severity={selectedCheckpoint.severity}>{selectedCheckpoint.severity} · {selectedCheckpoint.status}</span></header>
        <div className="checkpoint-gauge"><span style={{ width: `${Math.min(100, selectedCheckpoint.observed)}%` }} /><i style={{ left: `${selectedCheckpoint.target}%` }} /><b>{selectedCheckpoint.observed}</b><small>Guardrail {selectedCheckpoint.target} · {selectedCheckpoint.unit}</small></div>
        <dl><div><dt>Trigger</dt><dd>{selectedCheckpoint.trigger}</dd></div><div><dt>Downstream consequence</dt><dd>{selectedCheckpoint.downstreamImpact}</dd></div><div><dt>Resilient response</dt><dd>{selectedCheckpoint.response}</dd></div><div><dt>Accountable owner</dt><dd>{selectedCheckpoint.owner}</dd></div></dl>
        <button data-action-id={`supply-network.checkpoint.evidence.${selectedCheckpoint.id}`} type="button" onClick={() => onEvidence(checkpointReceipt(selectedCheckpoint))}>Open checkpoint evidence &#8599;</button>
      </aside>}
    </div>}

    <footer className="supply-signal-strip" aria-label="Recent project signals">
      <b>RECENT SIGNALS</b>{network.signals.filter((signal) => stageFilter === "all" || signal.stageId === stageFilter).slice(0, 8).map((signal) => <button data-action-id={`supply-network.signal.${signal.id}`} data-status={signal.status} title={`Trace ${signal.label}`} type="button" key={signal.id} onClick={() => onEvidence(fixtureEvidenceFor(project, { id: signal.evidenceRef, claim: signal.label, displayedValue: `${signal.value} · ${signal.delta}`, source: `${profile.project} deterministic signal stream`, formula: "Fixed-tick synthetic signal used for interface and decision-workflow demonstration only.", inputs: [signal.id, signal.stageId, profile.shock], variableId: project.variablePack.l0[0] ?? "Project signal", grain: "Project x stage x signal tick", confidence: profile.confidence }))}><span /> <b>{signal.label}</b><em>{signal.value}</em><small>{signal.observedAt}</small></button>)}
    </footer>
  </section>;
}
