"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { caseStudyProfileFor, type SupplyChainNode } from "./case-study-model";
import { ClientMark } from "./VisualIdentity";
import type { WorkspaceProject } from "./workspace-model";

type GlobalNode = {
  id: string;
  project: WorkspaceProject;
  node: SupplyChainNode;
  x: number;
  y: number;
};

type GlobalEdge = { from: string; to: string; crossClient?: boolean; label?: string };

const graphColors: Record<string, string> = {
  Company: "#d7ff38", Material: "#df912f", Supplier: "#ef5b56", Equipment: "#7a63df",
  Facility: "#2e6fdb", Logistics: "#14a6b8", Workforce: "#a45ada", Utility: "#418d5d",
  Policy: "#e1b12f", Quality: "#8b9e28", Inventory: "#46a89a", Contract: "#a56c31",
  Demand: "#4586d7", Evidence: "#697b73", Table: "#ec5fa3", Variable: "#c56bd8",
};

const graphSize = { width: 1600, height: 900 };

export default function GlobalKnowledgeGraph({ projects, onOpenProject, onTrace }: { projects: readonly WorkspaceProject[]; onOpenProject: (projectId: string) => void; onTrace: (title: string, detail: string, artifact?: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(.84);
  const [pan, setPan] = useState({ x: 118, y: 55 });
  const [showCrossLinks, setShowCrossLinks] = useState(true);
  const [objective, setObjective] = useState("Service resilience");
  const [shock, setShock] = useState("Trade controls + conflict corridor");
  const [horizon, setHorizon] = useState("90 days");
  const [optimizerState, setOptimizerState] = useState("Ready to model");

  const graph = useMemo(() => {
    const nodes: GlobalNode[] = [];
    const edges: GlobalEdge[] = [];
    const projectProfiles = projects.map((project) => ({ project, profile: caseStudyProfileFor(project) })).filter((item) => item.profile);
    projectProfiles.forEach(({ project, profile }, projectIndex) => {
      if (!profile) return;
      const column = projectIndex % 5;
      const row = Math.floor(projectIndex / 5);
      const center = { x: 170 + column * 315, y: 230 + row * 420 };
      const stageIndex = new Map(profile.supplyChain.stages.map((stage, index) => [stage.id, index]));
      const satellites = new Map<string, number>();
      profile.supplyChain.nodes.forEach((node) => {
        let x = center.x;
        let y = center.y;
        if (node.tier !== "Hub") {
          const stage = stageIndex.get(node.stageId) ?? 0;
          const baseAngle = -Math.PI / 2 + (stage / profile.supplyChain.stages.length) * Math.PI * 2;
          const satellite = satellites.get(node.stageId) ?? 0;
          if (node.tier === "Sub-tier") satellites.set(node.stageId, satellite + 1);
          const radius = node.tier === "Primary" ? 42 : node.tier === "Alternate" ? 67 : node.tier === "Contingency" ? 88 : 112 + ((satellite % 4) - 2) * 5;
          const angle = node.tier === "Sub-tier" ? baseAngle + (satellite - 10.5) * .035 : baseAngle;
          x += Math.cos(angle) * radius;
          y += Math.sin(angle) * radius;
        }
        nodes.push({ id: `${project.id}:${node.id}`, project, node, x, y });
      });
      profile.supplyChain.edges.forEach((edge) => edges.push({ from: `${project.id}:${edge.from}`, to: `${project.id}:${edge.to}` }));
    });
    const hubs = nodes.filter((item) => item.node.tier === "Hub");
    for (let leftIndex = 0; leftIndex < hubs.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < hubs.length; rightIndex += 1) {
        const left = hubs[leftIndex];
        const right = hubs[rightIndex];
        const leftCountries = new Set(nodes.filter((item) => item.project.id === left.project.id && item.node.country !== "Global").map((item) => item.node.country));
        const shared = [...new Set(nodes.filter((item) => item.project.id === right.project.id && leftCountries.has(item.node.country)).map((item) => item.node.country))];
        if (shared.length) edges.push({ from: left.id, to: right.id, crossClient: true, label: shared.slice(0, 2).join(" + ") });
      }
    }
    return { nodes, edges };
  }, [projects]);

  const categories = [...new Set(graph.nodes.map((item) => item.node.assetType))];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleNodes = graph.nodes.filter((item) => (projectFilter === "all" || item.project.id === projectFilter) && (categoryFilter === "all" || item.node.assetType === categoryFilter) && (!normalizedQuery || `${item.node.label} ${item.node.country} ${item.project.client} ${item.project.name} ${item.node.assetType}`.toLowerCase().includes(normalizedQuery)));
  const visibleIds = new Set(visibleNodes.map((item) => item.id));
  const visibleEdges = graph.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to) && (showCrossLinks || !edge.crossClient));
  const selected = visibleNodes.find((item) => item.id === selectedId) ?? visibleNodes.find((item) => item.node.tier === "Hub") ?? visibleNodes[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, graphSize.width, graphSize.height);
    context.save();
    context.translate(pan.x, pan.y);
    context.scale(zoom, zoom);
    context.fillStyle = getComputedStyle(canvas).getPropertyValue("--global-graph-bg").trim() || "#f7f8f4";
    context.fillRect(-pan.x / zoom, -pan.y / zoom, graphSize.width / zoom, graphSize.height / zoom);
    const index = new Map(visibleNodes.map((item) => [item.id, item]));
    visibleEdges.forEach((edge) => {
      const from = index.get(edge.from);
      const to = index.get(edge.to);
      if (!from || !to) return;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = edge.crossClient ? "rgba(217, 145, 47, .44)" : "rgba(85, 105, 95, .13)";
      context.lineWidth = edge.crossClient ? 1.25 : .55;
      context.setLineDash(edge.crossClient ? [5, 5] : []);
      context.stroke();
    });
    context.setLineDash([]);
    visibleNodes.forEach((item) => {
      const active = item.id === selected?.id;
      const radius = item.node.tier === "Hub" ? 12 : item.node.tier === "Primary" ? 5.5 : item.node.assetType === "Table" ? 4.7 : 2.6 + item.node.riskScore / 55;
      context.beginPath();
      context.arc(item.x, item.y, radius + (active ? 3 : 0), 0, Math.PI * 2);
      context.fillStyle = graphColors[item.node.assetType] ?? "#809088";
      context.globalAlpha = item.node.tier === "Sub-tier" ? .72 : 1;
      context.fill();
      if (active) { context.strokeStyle = "#17231b"; context.lineWidth = 2; context.stroke(); }
      context.globalAlpha = 1;
      if (item.node.tier === "Hub" || active) {
        context.font = item.node.tier === "Hub" ? "700 12px sans-serif" : "600 10px sans-serif";
        context.fillStyle = getComputedStyle(canvas).getPropertyValue("--global-graph-text").trim() || "#17231b";
        context.fillText(item.node.tier === "Hub" ? item.project.client : item.node.label, item.x + radius + 5, item.y - radius - 1);
      }
    });
    context.restore();
  }, [pan, selected?.id, showCrossLinks, visibleEdges, visibleNodes, zoom]);

  const selectAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = (clientX - rect.left) * graphSize.width / rect.width;
    const screenY = (clientY - rect.top) * graphSize.height / rect.height;
    const worldX = (screenX - pan.x) / zoom;
    const worldY = (screenY - pan.y) / zoom;
    let nearest: GlobalNode | undefined;
    let distance = 18 / zoom;
    visibleNodes.forEach((item) => { const next = Math.hypot(item.x - worldX, item.y - worldY); if (next < distance) { nearest = item; distance = next; } });
    if (nearest) setSelectedId(nearest.id);
  };

  const connectedClients = selected ? [...new Set(graph.edges.filter((edge) => edge.crossClient && (edge.from === selected.id || edge.to === selected.id)).map((edge) => graph.nodes.find((item) => item.id === (edge.from === selected.id ? edge.to : edge.from))?.project.client).filter(Boolean))] : [];
  const totals = { nodes: graph.nodes.length, edges: graph.edges.filter((edge) => !edge.crossClient).length, cross: graph.edges.filter((edge) => edge.crossClient).length, tables: graph.nodes.filter((item) => item.node.assetType === "Table").length };

  return <section className="global-knowledge-graph" aria-label="Operations World global knowledge graph">
    <header className="global-graph-summary"><div><p>FEDERATED KNOWLEDGE GRAPH</p><h2>All client and project networks</h2><span>Project boundaries remain governed; Operations World resolves shared geographies, suppliers, materials, routes, tables, and risks.</span></div><div>{[[totals.nodes,"entities"],[totals.edges,"project links"],[totals.cross,"cross-company"],[totals.tables,"tables"]].map(([value,label]) => <span key={label}><b>{value.toLocaleString()}</b>{label}</span>)}</div></header>
    <div className="global-graph-controls"><label>Client<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All clients</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.client} · {project.name}</option>)}</select></label><label>Entity<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All entity types</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="global-graph-search">Find<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, table, material, country" /></label><button className={showCrossLinks ? "active" : ""} type="button" aria-pressed={showCrossLinks} onClick={() => setShowCrossLinks((current) => !current)}>Cross-company links</button><button type="button" onClick={() => { setZoom(.84); setPan({ x: 118, y: 55 }); }}>Fit</button><button type="button" onClick={() => setZoom((value) => Math.max(.45, value - .1))} aria-label="Zoom out">−</button><output>{Math.round(zoom * 100)}%</output><button type="button" onClick={() => setZoom((value) => Math.min(1.7, value + .1))} aria-label="Zoom in">+</button></div>
    <div className="global-graph-workbench">
      <div className="global-canvas-shell"><canvas ref={canvasRef} width={graphSize.width} height={graphSize.height} onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(.45, Math.min(1.7, value + (event.deltaY < 0 ? .08 : -.08)))); }} onPointerDown={(event) => { dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!dragRef.current || !(event.buttons & 1)) return; const rect = event.currentTarget.getBoundingClientRect(); const scale = graphSize.width / rect.width; setPan({ x: dragRef.current.panX + (event.clientX - dragRef.current.x) * scale, y: dragRef.current.panY + (event.clientY - dragRef.current.y) * scale }); }} onPointerUp={(event) => { const moved = dragRef.current ? Math.hypot(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y) : 0; dragRef.current = null; event.currentTarget.releasePointerCapture(event.pointerId); if (moved < 5) selectAt(event.clientX, event.clientY); }} aria-label="Combined global client and project knowledge graph. Drag to pan; scroll to zoom; click a node to inspect." /></div>
      <aside className="global-node-inspector">{selected ? <><header><ClientMark clientId={selected.project.clientId} label={selected.project.client} /><div><small>{selected.node.assetType.toUpperCase()} · {selected.project.code}</small><h3>{selected.node.label}</h3><p>{selected.project.client} / {selected.project.name}</p></div><strong data-status={selected.node.status}>{selected.node.riskScore}</strong></header><dl><div><dt>Project boundary</dt><dd>{selected.project.client} · {selected.project.name}</dd></div><div><dt>Role</dt><dd>{selected.node.role}</dd></div><div><dt>Country</dt><dd>{selected.node.country}</dd></div><div><dt>Tier</dt><dd>{selected.node.tier}</dd></div><div><dt>Capacity / records</dt><dd>{selected.node.capacity}</dd></div><div><dt>Lead time</dt><dd>{selected.node.leadTime} days</dd></div><div><dt>Confidence</dt><dd>{selected.node.confidence}%</dd></div><div><dt>Cross-company links</dt><dd>{connectedClients.length ? connectedClients.join(", ") : "None on selected entity"}</dd></div></dl><div className="global-inspector-actions"><button type="button" onClick={() => onOpenProject(selected.project.id)}>Open project</button><button type="button" onClick={() => onTrace("Global graph evidence opened", `${selected.node.label} · ${selected.node.assetType} · ${selected.project.client} / ${selected.project.name} · risk ${selected.node.riskScore} · ${selected.node.evidenceRef}. Project access boundaries remain enforced.`, selected.node.evidenceRef)}>Trace evidence</button></div></> : <p>No entity matches the active filters.</p>}</aside>
    </div>
    <section className="global-optimizer"><header><div><p>GLOBAL NETWORK OPTIMIZER</p><h2>Model a cross-company resilience response</h2><span>Uses shared dependencies without merging private project records or decision authority.</span></div><b>{optimizerState}</b></header><div><label>Objective<select value={objective} onChange={(event) => setObjective(event.target.value)}><option>Service resilience</option><option>Value protected</option><option>Carbon-constrained continuity</option><option>Balanced portfolio</option></select></label><label>Shock<select value={shock} onChange={(event) => setShock(event.target.value)}><option>Trade controls + conflict corridor</option><option>Port closure + capacity loss</option><option>Energy curtailment + heat event</option><option>Demand surge + quality hold</option></select></label><label>Horizon<select value={horizon} onChange={(event) => setHorizon(event.target.value)}><option>30 days</option><option>90 days</option><option>180 days</option><option>1 year</option></select></label><button type="button" onClick={() => { setOptimizerState("Scenario modeled · human review"); onTrace("Global resilience scenario modeled", `${objective} under ${shock} over ${horizon}. The deterministic fixture evaluated ${totals.nodes.toLocaleString()} entities, ${totals.edges.toLocaleString()} project links, and ${totals.cross} cross-company dependency links; no allocation or client record changed.`, `GLOBAL-NETWORK-RUN-${String(totals.cross).padStart(3, "0")}`); }}>Run global scenario &#8594;</button></div><footer><span><b>96.1%</b>P95 service</span><span><b>$2.84B</b>value protected</span><span><b>17</b>shared chokepoints</span><span><b>8.4%</b>tail loss reduced</span><p>Illustrative result: reserve qualified alternates, pool corridor capacity, sequence constrained inputs, and retain every client-specific approval gate.</p></footer></section>
  </section>;
}
