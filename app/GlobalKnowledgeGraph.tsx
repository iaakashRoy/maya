"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { caseStudyProfileFor, type SupplyChainNode } from "./case-study-model";
import { ClientMark } from "./VisualIdentity";
import type { WorkspaceProject } from "./workspace-model";

type GlobalNode = {
  id: string;
  project: WorkspaceProject;
  node: SupplyChainNode;
  x: number;
  y: number;
  clientIndex: number;
};

type GlobalEdge = {
  id: string;
  from: string;
  to: string;
  crossClient?: boolean;
  label?: string;
  relationship: string;
  volume: string;
  value: string;
  share: number;
  leadTime: number;
  mode: string;
  riskScore: number;
  evidenceRef: string;
  projectId: string;
};

type HoverState = { kind: "node" | "edge"; id: string; x: number; y: number } | null;
type GraphMode = "graph" | "chokepoints";
type ColorMode = "entity" | "client" | "risk";
type SizeMode = "influence" | "risk";

const entityColors: Record<string, string> = {
  Company: "#179db5", Material: "#ef3d36", Supplier: "#7c45e8", Equipment: "#e18716",
  Facility: "#2f6fe4", Logistics: "#13a9bc", Workforce: "#a956d2", Utility: "#23a46e",
  Policy: "#e4ae27", Quality: "#91a32c", Inventory: "#82919b", Contract: "#a96b31",
  Demand: "#4586d7", Evidence: "#697b73", Table: "#ec5fa3", Variable: "#c56bd8",
};

const clientColors = ["#159db6", "#ef3d36", "#7c45e8", "#e18716", "#2f6fe4", "#23a46e", "#e35f95", "#8ca12e", "#a96b31", "#677b85"];
const initialViewport = { width: 1180, height: 760 };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const hashUnit = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return ((hash >>> 0) % 10000) / 10000;
};

const riskColor = (risk: number) => risk >= 80 ? "#ed3f36" : risk >= 64 ? "#e69722" : risk >= 44 ? "#d5bc31" : "#35a976";

export default function GlobalKnowledgeGraph({ projects, onOpenProject, onTrace }: {
  projects: readonly WorkspaceProject[];
  onOpenProject: (projectId: string) => void;
  onTrace: (title: string, detail: string, artifact?: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const [hover, setHover] = useState<HoverState>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [graphMode, setGraphMode] = useState<GraphMode>("graph");
  const [colorMode, setColorMode] = useState<ColorMode>("entity");
  const [sizeMode, setSizeMode] = useState<SizeMode>("influence");
  const [zoom, setZoom] = useState(.96);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showCrossLinks, setShowCrossLinks] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [viewport, setViewport] = useState(initialViewport);
  const [themeRevision, setThemeRevision] = useState(0);
  const [objective, setObjective] = useState("Service resilience");
  const [shock, setShock] = useState("Trade controls + conflict corridor");
  const [horizon, setHorizon] = useState("90 days");
  const [optimizerState, setOptimizerState] = useState("Ready to model");

  const graph = useMemo(() => {
    const nodes: GlobalNode[] = [];
    const edges: GlobalEdge[] = [];
    const projectProfiles = projects.map((project) => ({ project, profile: caseStudyProfileFor(project) })).filter((item) => item.profile);

    const center = { x: viewport.width / 2, y: viewport.height / 2 };
    const projectCount = Math.max(1, projectProfiles.length);
    const sectorSpan = Math.PI * 2 / projectCount;
    const horizontalReach = Math.max(220, viewport.width / 2 - 34);
    const verticalReach = Math.max(220, viewport.height / 2 - 34);

    projectProfiles.forEach(({ project, profile }, projectIndex) => {
      if (!profile) return;
      const stageIndex = new Map(profile.supplyChain.stages.map((stage, index) => [stage.id, index]));
      const satellites = new Map<string, number>();
      const clientAngle = -Math.PI / 2 + projectIndex * sectorSpan;

      profile.supplyChain.nodes.forEach((node) => {
        const stage = stageIndex.get(node.stageId) ?? 0;
        const satellite = satellites.get(node.stageId) ?? 0;
        satellites.set(node.stageId, satellite + 1);
        const stageOffset = ((stage - (profile.supplyChain.stages.length - 1) / 2) / profile.supplyChain.stages.length) * sectorSpan * .72;
        const fanOffset = node.tier === "Sub-tier"
          ? ((satellite % 18) - 8.5) * sectorSpan * .026
          : (hashUnit(node.id) - .5) * sectorSpan * .11;
        const ring = node.tier === "Hub" ? .14
          : node.tier === "Primary" ? .32
            : node.tier === "Alternate" ? .49
              : node.tier === "Contingency" ? .67
                : Math.min(.94, .78 + Math.floor(satellite / 18) * .055 + hashUnit(`${node.id}:ring`) * .045);
        const angle = clientAngle + stageOffset + fanOffset;
        const radialJitter = node.tier === "Hub" ? 0 : (hashUnit(`${node.id}:jitter`) - .5) * .045;
        const x = center.x + Math.cos(angle) * horizontalReach * (ring + radialJitter);
        const y = center.y + Math.sin(angle) * verticalReach * (ring + radialJitter);
        nodes.push({ id: `${project.id}:${node.id}`, project, node, x: clamp(x, 24, viewport.width - 24), y: clamp(y, 24, viewport.height - 24), clientIndex: projectIndex });
      });

      profile.supplyChain.edges.forEach((edge) => edges.push({
        id: `${project.id}:${edge.id}`,
        from: `${project.id}:${edge.from}`,
        to: `${project.id}:${edge.to}`,
        relationship: edge.relationship,
        volume: edge.volume,
        value: edge.value,
        share: edge.share,
        leadTime: edge.leadTime,
        mode: edge.mode,
        riskScore: edge.riskScore,
        evidenceRef: edge.evidenceRef,
        projectId: project.id,
      }));
    });

    const hubs = nodes.filter((item) => item.node.tier === "Hub");
    for (let leftIndex = 0; leftIndex < hubs.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < hubs.length; rightIndex += 1) {
        const left = hubs[leftIndex];
        const right = hubs[rightIndex];
        const leftCountries = new Set(nodes.filter((item) => item.project.id === left.project.id && item.node.country !== "Global").map((item) => item.node.country));
        const shared = [...new Set(nodes.filter((item) => item.project.id === right.project.id && leftCountries.has(item.node.country)).map((item) => item.node.country))];
        if (shared.length) edges.push({ id: `cross:${left.id}:${right.id}`, from: left.id, to: right.id, crossClient: true, label: shared.slice(0, 2).join(" + "), relationship: "shared geography", volume: `${shared.length} shared geographies`, value: "Federated context only", share: 0, leadTime: 0, mode: "Cross-company signal", riskScore: 72, evidenceRef: `GLOBAL-LINK-${String(leftIndex + 1).padStart(2, "0")}-${String(rightIndex + 1).padStart(2, "0")}`, projectId: left.project.id });
      }
    }

    const degree = new Map<string, number>();
    const adjacency = new Map<string, Set<string>>();
    edges.forEach((edge) => {
      degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
      degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, new Set());
      adjacency.get(edge.from)?.add(edge.to);
      adjacency.get(edge.to)?.add(edge.from);
    });
    return { nodes, edges, degree, adjacency, nodeIndex: new Map(nodes.map((item) => [item.id, item])), edgeIndex: new Map(edges.map((item) => [item.id, item])) };
  }, [projects, viewport.height, viewport.width]);

  const categories = useMemo(() => [...new Set(graph.nodes.map((item) => item.node.assetType))].sort(), [graph.nodes]);
  const visibleNodes = useMemo(() => graph.nodes.filter((item) =>
    (projectFilter === "all" || item.project.id === projectFilter) &&
    (categoryFilter === "all" || item.node.assetType === categoryFilter)), [categoryFilter, graph.nodes, projectFilter]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map((item) => item.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => graph.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to) && (showCrossLinks || !edge.crossClient)), [graph.edges, showCrossLinks, visibleIds]);
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = useCallback((item: GlobalNode) => !normalizedQuery || `${item.node.label} ${item.node.country} ${item.project.client} ${item.project.name} ${item.node.assetType}`.toLowerCase().includes(normalizedQuery), [normalizedQuery]);
  const selected = visibleNodes.find((item) => item.id === selectedId) ?? visibleNodes.find((item) => item.node.tier === "Hub") ?? visibleNodes[0];
  const selectedEdge = visibleEdges.find((item) => item.id === selectedEdgeId);
  const hoveredNode = hover?.kind === "node" ? graph.nodeIndex.get(hover.id) : undefined;
  const hoveredEdge = hover?.kind === "edge" ? graph.edgeIndex.get(hover.id) : undefined;
  const focusId = hover?.kind === "node" ? hover.id : undefined;
  const focusEdge = hover?.kind === "edge" ? hoveredEdge : selectedEdge;
  const focusNeighborhood = useMemo(() => new Set(focusId ? [focusId, ...(graph.adjacency.get(focusId) ?? [])] : focusEdge ? [focusEdge.from, focusEdge.to] : []), [focusEdge, focusId, graph.adjacency]);

  const radiusFor = useCallback((item: GlobalNode) => {
    if (item.node.tier === "Hub") return 24;
    const influence = 3.3 + Math.sqrt(graph.degree.get(item.id) ?? 1) * 1.8;
    const risk = 3.3 + item.node.riskScore / 11.5;
    const base = sizeMode === "risk" ? risk : influence;
    return item.node.tier === "Primary" ? Math.max(8.2, base) : item.node.assetType === "Table" ? Math.max(6.2, base) : clamp(base, 3.7, 12.5);
  }, [graph.degree, sizeMode]);

  const colorFor = useCallback((item: GlobalNode) => colorMode === "client"
    ? clientColors[item.clientIndex % clientColors.length]
    : colorMode === "risk" ? riskColor(item.node.riskScore) : entityColors[item.node.assetType] ?? "#809088", [colorMode]);

  useEffect(() => {
    const shell = canvasRef.current?.closest(".platform-shell");
    if (!shell) return;
    const observer = new MutationObserver(() => setThemeRevision((value) => value + 1));
    observer.observe(shell, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = canvas?.parentElement;
    if (!canvas || !shell) return;
    const updateViewport = () => {
      const rect = shell.getBoundingClientRect();
      if (rect.width < 240 || rect.height < 320) return;
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setViewport((current) => current.width === next.width && current.height === next.height ? current : next);
    };
    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [inspectorOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const styles = getComputedStyle(canvas);
    const background = styles.getPropertyValue("--global-graph-bg").trim() || "#f4efe4";
    const textColor = styles.getPropertyValue("--global-graph-text").trim() || "#17231b";
    const gridColor = styles.getPropertyValue("--global-graph-grid").trim() || "rgba(80,105,93,.18)";
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = background;
    context.fillRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = gridColor;
    for (let x = 12; x < viewport.width; x += 26) for (let y = 12; y < viewport.height; y += 26) context.fillRect(x, y, 1.2, 1.2);
    context.save();
    context.translate(pan.x, pan.y);
    context.scale(zoom, zoom);

    visibleEdges.forEach((edge) => {
      const from = graph.nodeIndex.get(edge.from);
      const to = graph.nodeIndex.get(edge.to);
      if (!from || !to) return;
      const edgeActive = edge.id === selectedEdge?.id || edge.id === hoveredEdge?.id;
      const focused = !focusId && !focusEdge || edgeActive || edge.from === focusId || edge.to === focusId;
      const queryMatch = matchesQuery(from) || matchesQuery(to);
      const chokepoint = edge.riskScore >= 68 || from.node.riskScore >= 72 || to.node.riskScore >= 72;
      let alpha = edge.crossClient ? .48 : .18;
      if ((focusId || focusEdge) && !focused) alpha *= .12;
      if (normalizedQuery && !queryMatch) alpha *= .12;
      if (graphMode === "chokepoints" && !chokepoint) alpha *= .08;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = edgeActive ? textColor : edge.crossClient ? `rgba(218,139,27,${alpha})` : edge.riskScore >= 72 ? `rgba(226,70,55,${alpha + .08})` : `rgba(57,116,105,${alpha})`;
      context.lineWidth = edgeActive ? 3.4 / zoom : focused ? (edge.crossClient ? 1.7 : .9) : (edge.crossClient ? 1.1 : .55);
      context.setLineDash(edge.crossClient ? [5, 5] : []);
      context.stroke();
      if ((focused && edge.riskScore >= 60) || edge.crossClient) {
        context.setLineDash([]);
        const markerX = from.x + (to.x - from.x) * .78;
        const markerY = from.y + (to.y - from.y) * .78;
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        context.beginPath();
        context.moveTo(markerX + Math.cos(angle) * 4, markerY + Math.sin(angle) * 4);
        context.lineTo(markerX + Math.cos(angle + 2.45) * 3, markerY + Math.sin(angle + 2.45) * 3);
        context.lineTo(markerX + Math.cos(angle - 2.45) * 3, markerY + Math.sin(angle - 2.45) * 3);
        context.closePath();
        context.fillStyle = edge.crossClient ? `rgba(218,139,27,${alpha + .2})` : `rgba(57,116,105,${alpha + .22})`;
        context.fill();
      }
    });
    context.setLineDash([]);

    visibleNodes.forEach((item) => {
      const active = !selectedEdge && item.id === selected?.id;
      const hovered = hover?.kind === "node" && item.id === hover.id;
      const radius = radiusFor(item);
      let alpha = item.node.tier === "Sub-tier" ? .76 : .94;
      if ((focusId || focusEdge) && !focusNeighborhood.has(item.id)) alpha = .1;
      if (normalizedQuery && !matchesQuery(item)) alpha *= .16;
      if (graphMode === "chokepoints" && item.node.riskScore < 62 && item.node.tier !== "Hub") alpha *= .12;
      if (active || hovered) alpha = 1;

      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(item.x, item.y, radius + (active || hovered ? 3 : 0), 0, Math.PI * 2);
      context.fillStyle = colorFor(item);
      context.fill();
      context.strokeStyle = active ? textColor : item.node.riskScore >= 78 ? "#f0443b" : background;
      context.lineWidth = active ? 3 : item.node.riskScore >= 78 ? 1.6 : 1.1;
      context.stroke();
      if (item.node.tier === "Hub") {
        context.beginPath();
        context.arc(item.x, item.y, radius + 6, 0, Math.PI * 2);
        context.strokeStyle = active ? "#d7ff38" : textColor;
        context.lineWidth = active ? 4 : 2.5;
        context.stroke();
      }

      const labelNode = item.node.tier === "Hub" || item.node.tier === "Primary" || item.node.riskScore >= 86 || active || hovered;
      if (labelNode && alpha > .5) {
        const label = item.node.tier === "Hub" ? item.project.client : item.node.label;
        context.font = item.node.tier === "Hub" ? "700 13px sans-serif" : "600 7.5px sans-serif";
        context.lineWidth = 3.5;
        context.strokeStyle = background;
        context.strokeText(label, item.x + radius + 5, item.y + 3);
        context.fillStyle = textColor;
        context.fillText(label, item.x + radius + 5, item.y + 3);
      }
      context.globalAlpha = 1;
    });
    context.restore();
  }, [colorFor, focusEdge, focusId, focusNeighborhood, graph.nodeIndex, graphMode, hover, hoveredEdge?.id, matchesQuery, normalizedQuery, pan, radiusFor, selected?.id, selectedEdge, themeRevision, viewport.height, viewport.width, visibleEdges, visibleNodes, zoom]);

  const pointFromEvent = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const screenX = (clientX - rect.left) * viewport.width / rect.width;
    const screenY = (clientY - rect.top) * viewport.height / rect.height;
    return { rect, screenX, screenY, worldX: (screenX - pan.x) / zoom, worldY: (screenY - pan.y) / zoom };
  };

  const nodeAt = (clientX: number, clientY: number) => {
    const point = pointFromEvent(clientX, clientY);
    if (!point) return undefined;
    let nearest: GlobalNode | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    visibleNodes.forEach((item) => {
      const distance = Math.hypot(item.x - point.worldX, item.y - point.worldY);
      const threshold = Math.max(8, radiusFor(item) + 3) / zoom;
      if (distance <= threshold && distance < nearestDistance) { nearest = item; nearestDistance = distance; }
    });
    return nearest;
  };

  const edgeAt = (clientX: number, clientY: number) => {
    const point = pointFromEvent(clientX, clientY);
    if (!point) return undefined;
    let nearest: GlobalEdge | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    visibleEdges.forEach((edge) => {
      const from = graph.nodeIndex.get(edge.from);
      const to = graph.nodeIndex.get(edge.to);
      if (!from || !to) return;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const lengthSquared = dx * dx + dy * dy;
      const position = lengthSquared ? clamp(((point.worldX - from.x) * dx + (point.worldY - from.y) * dy) / lengthSquared, 0, 1) : 0;
      const closestX = from.x + position * dx;
      const closestY = from.y + position * dy;
      const distance = Math.hypot(point.worldX - closestX, point.worldY - closestY);
      const threshold = (edge.crossClient ? 8 : 5.5) / zoom;
      if (distance <= threshold && distance < nearestDistance) { nearest = edge; nearestDistance = distance; }
    });
    return nearest;
  };

  const targetAt = (clientX: number, clientY: number) => {
    const node = nodeAt(clientX, clientY);
    if (node) return { kind: "node" as const, node };
    const edge = edgeAt(clientX, clientY);
    return edge ? { kind: "edge" as const, edge } : undefined;
  };

  const fitGraph = () => {
    if (!visibleNodes.length) return;
    const minX = Math.min(...visibleNodes.map((item) => item.x));
    const maxX = Math.max(...visibleNodes.map((item) => item.x));
    const minY = Math.min(...visibleNodes.map((item) => item.y));
    const maxY = Math.max(...visibleNodes.map((item) => item.y));
    const nextZoom = clamp(Math.min((viewport.width - 84) / Math.max(1, maxX - minX), (viewport.height - 84) / Math.max(1, maxY - minY)), .38, 1.45);
    setZoom(nextZoom);
    setPan({ x: viewport.width / 2 - ((minX + maxX) / 2) * nextZoom, y: viewport.height / 2 - ((minY + maxY) / 2) * nextZoom });
  };
  const centerNode = (item: GlobalNode) => {
    const nextZoom = 1.28;
    setZoom(nextZoom);
    setPan({ x: viewport.width / 2 - item.x * nextZoom, y: viewport.height / 2 - item.y * nextZoom });
    setSelectedId(item.id);
    setSelectedEdgeId("");
  };

  const centerEdge = (edge: GlobalEdge) => {
    const from = graph.nodeIndex.get(edge.from);
    const to = graph.nodeIndex.get(edge.to);
    if (!from || !to) return;
    const nextZoom = 1.42;
    setZoom(nextZoom);
    setPan({ x: viewport.width / 2 - ((from.x + to.x) / 2) * nextZoom, y: viewport.height / 2 - ((from.y + to.y) / 2) * nextZoom });
    setSelectedEdgeId(edge.id);
  };

  const selectedEdges = selected ? graph.edges.filter((edge) => edge.from === selected.id || edge.to === selected.id) : [];
  const selectedEdgeFrom = selectedEdge ? graph.nodeIndex.get(selectedEdge.from) : undefined;
  const selectedEdgeTo = selectedEdge ? graph.nodeIndex.get(selectedEdge.to) : undefined;
  const selectedEdgeProject = selectedEdgeFrom?.project ?? projects.find((project) => project.id === selectedEdge?.projectId);
  const incoming = selected ? selectedEdges.filter((edge) => edge.to === selected.id).map((edge) => ({ edge, node: graph.nodeIndex.get(edge.from) })).filter((item) => item.node).slice(0, 8) : [];
  const outgoing = selected ? selectedEdges.filter((edge) => edge.from === selected.id).map((edge) => ({ edge, node: graph.nodeIndex.get(edge.to) })).filter((item) => item.node).slice(0, 8) : [];
  const connectedClients = selected ? [...new Set(selectedEdges.filter((edge) => edge.crossClient).map((edge) => graph.nodeIndex.get(edge.from === selected.id ? edge.to : edge.from)?.project.client).filter(Boolean))] : [];
  const totals = {
    nodes: graph.nodes.length,
    edges: graph.edges.filter((edge) => !edge.crossClient).length,
    cross: graph.edges.filter((edge) => edge.crossClient).length,
    chokepoints: graph.nodes.filter((item) => item.node.riskScore >= 72).length,
  };

  return <section className="global-knowledge-graph" aria-label="Operations World global knowledge graph">
    <header className="global-graph-summary">
      <div><p>GLOBAL SUPPLY ECOSYSTEM</p><h2>{projects.length} client networks, one governed operating view</h2><span>Bubble size shows {sizeMode}; color shows {colorMode}; directed lines reveal upstream and downstream dependencies.</span></div>
      <div>{[
        { value: totals.nodes, label: "entities" }, { value: totals.edges, label: "dependencies" }, { value: totals.cross, label: "shared links" }, { value: totals.chokepoints, label: "chokepoints" },
      ].map((item) => <span key={item.label}><b>{item.value.toLocaleString()}</b>{item.label}</span>)}</div>
    </header>

    <div className="global-graph-controls">
      <nav className="global-graph-modes" aria-label="Graph mode"><button type="button" className={graphMode === "graph" ? "active" : ""} onClick={() => setGraphMode("graph")}>Graph</button><button type="button" className={graphMode === "chokepoints" ? "active" : ""} onClick={() => setGraphMode("chokepoints")}>Chokepoints <b>{totals.chokepoints}</b></button></nav>
      <label>Color<select value={colorMode} onChange={(event) => setColorMode(event.target.value as ColorMode)}><option value="entity">Entity type</option><option value="client">Client</option><option value="risk">Risk</option></select></label>
      <label>Size<select value={sizeMode} onChange={(event) => setSizeMode(event.target.value as SizeMode)}><option value="influence">Influence</option><option value="risk">Risk</option></select></label>
      <label>Client<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All clients</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.client} - {project.name}</option>)}</select></label>
      <label>Entity<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All entity types</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="global-graph-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, supplier, material, country" /></label>
      <button className={showCrossLinks ? "active" : ""} type="button" aria-pressed={showCrossLinks} onClick={() => setShowCrossLinks((current) => !current)} title="Toggle cross-company dependency links">Links</button>
      <button type="button" onClick={() => setZoom((value) => Math.max(.38, value - .1))} aria-label="Zoom out">−</button><output>{Math.round(zoom * 100)}%</output><button type="button" onClick={() => setZoom((value) => Math.min(2.1, value + .1))} aria-label="Zoom in">+</button><button type="button" onClick={fitGraph}>Fit</button>
    </div>

    <div className={`global-graph-workbench ${inspectorOpen ? "" : "inspector-closed"}`}>
      <div className="global-canvas-shell">
        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          onWheel={(event) => {
            event.preventDefault();
            const point = pointFromEvent(event.clientX, event.clientY);
            if (!point) return;
            const nextZoom = clamp(zoom + (event.deltaY < 0 ? .1 : -.1), .38, 2.1);
            setPan({ x: point.screenX - point.worldX * nextZoom, y: point.screenY - point.worldY * nextZoom });
            setZoom(nextZoom);
          }}
          onPointerDown={(event) => { dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerMove={(event) => {
            if (dragRef.current && (event.buttons & 1)) {
              const rect = event.currentTarget.getBoundingClientRect();
              setPan({ x: dragRef.current.panX + (event.clientX - dragRef.current.x) * viewport.width / rect.width, y: dragRef.current.panY + (event.clientY - dragRef.current.y) * viewport.height / rect.height });
              setHover(null);
              return;
            }
            const target = targetAt(event.clientX, event.clientY);
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.cursor = target ? "pointer" : "grab";
            setHover(target ? { kind: target.kind, id: target.kind === "node" ? target.node.id : target.edge.id, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
          }}
          onPointerLeave={(event) => { event.currentTarget.style.cursor = "grab"; setHover(null); }}
          onPointerUp={(event) => {
            const moved = dragRef.current ? Math.hypot(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y) : 0;
            dragRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            const target = targetAt(event.clientX, event.clientY);
            if (moved < 5 && target?.kind === "node") { setSelectedId(target.node.id); setSelectedEdgeId(""); setInspectorOpen(true); }
            if (moved < 5 && target?.kind === "edge") { setSelectedEdgeId(target.edge.id); setInspectorOpen(true); }
          }}
          onDoubleClick={(event) => { const target = targetAt(event.clientX, event.clientY); if (target?.kind === "node") centerNode(target.node); else if (target?.kind === "edge") centerEdge(target.edge); }}
          aria-label="Interactive global supply network. Nodes and relationship paths are clickable. Drag to pan, scroll to zoom, hover to isolate, and double-click to center."
        />
        {hoveredNode && hover ? <div className="global-graph-tooltip" style={{ left: hover.x, top: hover.y }}><small>{hoveredNode.node.assetType} · {hoveredNode.project.client}</small><b>{hoveredNode.node.label}</b><span>{hoveredNode.node.country} · risk {hoveredNode.node.riskScore} · {graph.degree.get(hoveredNode.id) ?? 0} links</span></div> : hoveredEdge && hover ? <div className="global-graph-tooltip global-edge-tooltip" style={{ left: hover.x, top: hover.y }}><small>RELATIONSHIP · {hoveredEdge.mode}</small><b>{graph.nodeIndex.get(hoveredEdge.from)?.node.label} → {graph.nodeIndex.get(hoveredEdge.to)?.node.label}</b><span>{hoveredEdge.relationship} · risk {hoveredEdge.riskScore} · {hoveredEdge.leadTime ? `${hoveredEdge.leadTime} days` : "federated"}</span></div> : null}
        <div className="global-graph-hint">Click a bubble or path · drag to pan · wheel to zoom · double-click to center</div>
        <div className="global-graph-scale"><i style={{ width: `${Math.round(44 * zoom)}px` }} /> network scale</div>
        {!inspectorOpen ? <button className="global-inspector-open" type="button" onClick={() => setInspectorOpen(true)}>Open inspector</button> : null}
      </div>

      {inspectorOpen ? <aside className={`global-node-inspector ${selectedEdge ? "edge-selected" : ""}`}>{selectedEdge && selectedEdgeFrom && selectedEdgeTo ? <>
        <header><span className="global-edge-mark" aria-hidden="true">↗</span><div><small>RELATIONSHIP · {selectedEdge.crossClient ? "GLOBAL" : selectedEdgeFrom.project.code}</small><h3>{selectedEdgeFrom.node.label} → {selectedEdgeTo.node.label}</h3><p>{selectedEdge.relationship} · {selectedEdge.mode}</p></div><strong data-status={selectedEdge.riskScore >= 76 ? "constrained" : selectedEdge.riskScore >= 58 ? "watch" : "stable"}>{selectedEdge.riskScore}</strong><button className="global-inspector-close" type="button" onClick={() => setInspectorOpen(false)} aria-label="Close inspector">×</button></header>
        <dl><div><dt>From</dt><dd>{selectedEdgeFrom.node.label} · {selectedEdgeFrom.node.country}</dd></div><div><dt>To</dt><dd>{selectedEdgeTo.node.label} · {selectedEdgeTo.node.country}</dd></div><div><dt>Relationship</dt><dd>{selectedEdge.relationship}</dd></div><div><dt>Mode / lead time</dt><dd>{selectedEdge.mode} · {selectedEdge.leadTime ? `${selectedEdge.leadTime} days` : "Federated signal"}</dd></div><div><dt>Volume / value</dt><dd>{selectedEdge.volume} · {selectedEdge.value}</dd></div><div><dt>Dependency share</dt><dd>{selectedEdge.share ? `${selectedEdge.share}%` : "Cross-client context only"}</dd></div><div><dt>Evidence</dt><dd>{selectedEdge.evidenceRef}</dd></div></dl>
        <section className="global-path-inspection"><h4>PATH BOUNDARY</h4><button type="button" onClick={() => { setSelectedId(selectedEdgeFrom.id); setSelectedEdgeId(""); }}><span>01</span><b>{selectedEdgeFrom.project.client}</b><small>{selectedEdgeFrom.node.label}</small></button><i aria-hidden="true">→</i><button type="button" onClick={() => { setSelectedId(selectedEdgeTo.id); setSelectedEdgeId(""); }}><span>02</span><b>{selectedEdgeTo.project.client}</b><small>{selectedEdgeTo.node.label}</small></button></section>
        <div className="global-inspector-actions"><button type="button" onClick={() => selectedEdgeProject && onOpenProject(selectedEdgeProject.id)}>Open project</button><button type="button" onClick={() => centerEdge(selectedEdge)}>Center path</button><button type="button" onClick={() => onTrace("Global relationship evidence opened", `${selectedEdgeFrom.node.label} to ${selectedEdgeTo.node.label} · ${selectedEdge.relationship} · ${selectedEdge.mode} · risk ${selectedEdge.riskScore} · ${selectedEdge.evidenceRef}. Project access boundaries remain enforced.`, selectedEdge.evidenceRef)}>Trace evidence</button></div>
      </> : selected ? <>
        <header><ClientMark clientId={selected.project.clientId} label={selected.project.client} /><div><small>{selected.node.assetType.toUpperCase()} · {selected.project.code}</small><h3>{selected.node.label}</h3><p>{selected.project.client} / {selected.project.name}</p></div><strong data-status={selected.node.status}>{selected.node.riskScore}</strong><button className="global-inspector-close" type="button" onClick={() => setInspectorOpen(false)} aria-label="Close inspector">×</button></header>
        <dl><div><dt>Role</dt><dd>{selected.node.role}</dd></div><div><dt>Country / tier</dt><dd>{selected.node.country} · {selected.node.tier}</dd></div><div><dt>Capacity / records</dt><dd>{selected.node.capacity}</dd></div><div><dt>Lead time / confidence</dt><dd>{selected.node.leadTime} days · {selected.node.confidence}%</dd></div><div><dt>Shared clients</dt><dd>{connectedClients.length ? connectedClients.join(", ") : "No direct shared link"}</dd></div></dl>
        <section className="global-neighbor-list"><h4>SUPPLIED BY <span>{incoming.length}</span></h4>{incoming.length ? incoming.map(({ edge, node }) => node ? <button type="button" key={edge.id} aria-label={`Inspect relationship from ${node.node.label} to ${selected.node.label}`} onClick={() => setSelectedEdgeId(edge.id)}><span>←</span><b>{node.node.label}</b><small>{edge.relationship} · inspect path</small></button> : null) : <p>No upstream relationship in this view.</p>}<h4>SUPPLIES <span>{outgoing.length}</span></h4>{outgoing.length ? outgoing.map(({ edge, node }) => node ? <button type="button" key={edge.id} aria-label={`Inspect relationship from ${selected.node.label} to ${node.node.label}`} onClick={() => setSelectedEdgeId(edge.id)}><span>→</span><b>{node.node.label}</b><small>{edge.relationship} · inspect path</small></button> : null) : <p>No downstream relationship in this view.</p>}</section>
        <div className="global-inspector-actions"><button type="button" onClick={() => onOpenProject(selected.project.id)}>Open project</button><button type="button" onClick={() => centerNode(selected)}>Center bubble</button><button type="button" onClick={() => onTrace("Global graph evidence opened", `${selected.node.label} · ${selected.node.assetType} · ${selected.project.client} / ${selected.project.name} · risk ${selected.node.riskScore} · ${selected.node.evidenceRef}. Project access boundaries remain enforced.`, selected.node.evidenceRef)}>Trace evidence</button></div>
      </> : <p>No entity matches the active filters.</p>}</aside> : null}
    </div>

    <div className="global-bubble-legend" aria-label="Entity color legend">{(colorMode === "entity" ? categories : colorMode === "client" ? projects.map((project) => project.client) : ["Stable", "Watch", "Elevated", "Critical"]).map((item, index) => <span key={item}><i style={{ background: colorMode === "entity" ? entityColors[item] : colorMode === "client" ? clientColors[index % clientColors.length] : ["#35a976", "#d5bc31", "#e69722", "#ed3f36"][index] }} />{item}</span>)}</div>

    <section className="global-optimizer"><header><div><p>GLOBAL NETWORK OPTIMIZER</p><h2>Model a cross-company resilience response</h2><span>Uses shared dependencies without merging private project records or decision authority.</span></div><b>{optimizerState}</b></header><div><label>Objective<select value={objective} onChange={(event) => setObjective(event.target.value)}><option>Service resilience</option><option>Value protected</option><option>Carbon-constrained continuity</option><option>Balanced portfolio</option></select></label><label>Shock<select value={shock} onChange={(event) => setShock(event.target.value)}><option>Trade controls + conflict corridor</option><option>Port closure + capacity loss</option><option>Energy curtailment + heat event</option><option>Demand surge + quality hold</option></select></label><label>Horizon<select value={horizon} onChange={(event) => setHorizon(event.target.value)}><option>30 days</option><option>90 days</option><option>180 days</option><option>1 year</option></select></label><button type="button" onClick={() => { setOptimizerState("Scenario modeled · human review"); onTrace("Global resilience scenario modeled", `${objective} under ${shock} over ${horizon}. The deterministic fixture evaluated ${totals.nodes.toLocaleString()} entities, ${totals.edges.toLocaleString()} project links, and ${totals.cross} cross-company dependency links; no allocation or client record changed.`, `GLOBAL-NETWORK-RUN-${String(totals.cross).padStart(3, "0")}`); }}>Run global scenario →</button></div><footer><span><b>96.1%</b>P95 service</span><span><b>$2.84B</b>value protected</span><span><b>17</b>shared chokepoints</span><span><b>8.4%</b>tail loss reduced</span><p>Illustrative result: reserve qualified alternates, pool corridor capacity, sequence constrained inputs, and retain every client-specific approval gate.</p></footer></section>
  </section>;
}
