"use client";

import { useState, type CSSProperties } from "react";
import { caseStudyProfileFor, type SupplyChainCheckpoint, type SupplyChainNode } from "./case-study-model";
import { fixtureEvidenceFor, type EvidenceReceipt, type WorkspaceProject } from "./workspace-model";

type ExplorerProps = {
  project: WorkspaceProject;
  query?: string;
  onEvidence: (target: string | EvidenceReceipt) => void;
};

type NetworkView = "graph" | "checkpoints";
type TraceDirection = "both" | "upstream" | "downstream";

const riskLabel = (score: number) => score >= 82 ? "Critical" : score >= 68 ? "High" : score >= 52 ? "Moderate" : "Low";

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

  const selectedNode = network?.nodes.find((node) => node.id === selectedNodeId) ?? network?.nodes[0];
  const selectedCheckpoint = network?.checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? network?.checkpoints[0];
  const normalizedQuery = query.trim().toLowerCase();
  const regions = [...new Set(network?.nodes.map((node) => node.geography) ?? [])];

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
        <label>Trace<select value={traceDirection} onChange={(event) => setTraceDirection(event.target.value as TraceDirection)}><option value="both">Upstream + downstream</option><option value="upstream">Upstream only</option><option value="downstream">Downstream only</option></select></label>
      </> : <label>Severity<select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option></select></label>}
      <button data-action-id="supply-network.filters.reset" type="button" onClick={() => { setStageFilter("all"); setRegionFilter("all"); setSeverityFilter("all"); setTraceDirection("both"); }}>Reset filters</button>
      <p><span />Operationally realistic synthetic data · no live company feed</p>
    </div>

    {view === "graph" ? <div className="supply-network-graph-view">
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
        <header><div><small>SELECTED OPERATING NODE</small><h3>{selectedNode.label}</h3><p>{selectedNode.role} · {selectedNode.country}</p></div><strong data-risk={riskLabel(selectedNode.riskScore).toLowerCase()}>{selectedNode.riskScore}<small>{riskLabel(selectedNode.riskScore)}</small></strong></header>
        <dl><div><dt>Tier</dt><dd>{selectedNode.tier}</dd></div><div><dt>Capacity</dt><dd>{selectedNode.capacity}</dd></div><div><dt>Throughput</dt><dd>{selectedNode.throughput}</dd></div><div><dt>Annual value</dt><dd>{selectedNode.annualValue}</dd></div><div><dt>Utilization</dt><dd>{selectedNode.utilization}%</dd></div><div><dt>Lead time</dt><dd>{selectedNode.leadTime} days</dd></div><div><dt>Path concentration</dt><dd>{selectedNode.concentration}%</dd></div><div><dt>Confidence</dt><dd>{selectedNode.confidence}%</dd></div></dl>
        <section><small>WHAT THIS NODE DEPENDS ON</small>{network.edges.filter((edge) => edge.to === selectedNode.id).map((edge) => <button data-action-id={`supply-network.edge.upstream.${edge.id}`} type="button" key={edge.id} onClick={() => setSelectedNodeId(edge.from)}><b>{network.nodes.find((node) => node.id === edge.from)?.label}</b><span>{edge.relationship} · {edge.share}% · {edge.leadTime}d</span></button>) || <p>Origin of modeled chain.</p>}</section>
        <section><small>WHAT COULD BE DISRUPTED</small>{network.edges.filter((edge) => edge.from === selectedNode.id).map((edge) => <button data-action-id={`supply-network.edge.downstream.${edge.id}`} type="button" key={edge.id} onClick={() => setSelectedNodeId(edge.to)}><b>{network.nodes.find((node) => node.id === edge.to)?.label}</b><span>{edge.mode} · {edge.volume} · {edge.value}</span></button>)}</section>
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
