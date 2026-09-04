"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ApplicationViews from "./ApplicationViews";
import DataOperations from "./DataOperations";
import DecisionWorkspaces from "./DecisionWorkspaces";
import ProjectWorkspace from "./ProjectWorkspace";
import ScopeDashboard from "./ScopeDashboard";
import type { MapSelectionContext } from "./WorldNetworkMap";
import { resolveNavigation, scopeIds, viewLabels } from "./navigation";
import { caseIdForProject, humanExperts, workspaceProjects, type ProjectAppId, type WorkspaceProject, type WorkspaceTabId } from "./workspace-model";
import {
  applications,
  decisionCases,
  scopeSnapshots,
  type AppId,
  type DataViewId,
  type DecisionCase,
  type ScopeId,
  type ScopeSnapshot,
  type ViewId,
  type WorkflowViewId,
} from "./platform-model";

const dataViews = [
  { id: "agents" as const, label: "Data Agent Hub", icon: "DA", detail: "12 agents · 3 attention" },
  { id: "graph" as const, label: "Knowledge Graph", icon: "KG", detail: "8.4M entities" },
];

const workflowViews = [
  { id: "decisions" as const, label: "Decision Inbox", icon: "DI", detail: "Prioritize governed cases" },
  { id: "case" as const, label: "Case Workspace", icon: "CW", detail: "Synthesize five app outputs" },
  { id: "action" as const, label: "Action Room", icon: "AR", detail: "Approve and release work" },
];

type SearchResult = { id: ViewId; label: string; detail: string; group: string; caseId?: string; projectId?: string };

type ActionOutcome = {
  id: string;
  title: string;
  detail: string;
  artifact: string;
  status: "Completed" | "Saved" | "Blocked";
  timestamp: string;
  context: string;
};

type PlatformShellProps = {
  initialView: ViewId;
  initialScope: ScopeId;
  initialCaseId: string;
  initialProjectId: string;
  initialProjectTab: WorkspaceTabId;
  initialProjectApp: ProjectAppId | null;
};

const unboundProject: WorkspaceProject = {
  id: "unbound",
  sectorId: "",
  sector: "No sector selected",
  clientId: "",
  client: "No client selected",
  name: "Choose a project",
  code: "P-000",
  problem: "Select a governed client project from the expert workspace.",
  outcome: "No project context is active.",
  stage: "Unbound",
  health: "healthy",
  currency: "USD",
  regions: "None",
  owner: "Unassigned",
  classification: "No project context",
  dataResidency: "Not applicable",
  counts: { entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 0, agents: 0, experts: 0 },
  metrics: [],
  mountedAppIds: [],
  variablePack: { l2: [], l1: [], l0: [] },
  methodCodes: [],
};

const interactionStatus = (message: string): ActionOutcome["status"] => /\b(unavailable|blocked|not connected|cannot|disabled|no access)\b/i.test(message) ? "Blocked" : "Saved";

function snapshotForProject(project: WorkspaceProject): ScopeSnapshot {
  const base = scopeSnapshots.company;
  if (project.id === "anode-shield") return base;
  const entityNames = [`${project.client} source network`, `${project.sector} partner cluster`, `${project.name} operating node`, `${project.regions.split("·")[0]?.trim()} demand hub`, `${project.variablePack.l0[0]} constraint`, `${project.client} inventory buffer`];
  return {
    ...base,
    label: `${project.client} workspace`, shortLabel: project.client, title: project.outcome, description: project.problem,
    context: `${project.client} · ${project.name} · ${project.classification}`, currency: project.currency,
    updated: `${project.code} synthetic snapshot · project isolated`,
    metrics: [...project.metrics.map((metric) => ({ label: metric.label, value: metric.value, detail: metric.detail, tone: metric.tone, trend: `Trace ${metric.evidenceRef}` })), { label: "Knowledge entities", value: project.counts.entities, detail: "Hydrated fixture manifest", tone: "info" as const, trend: project.code }, { label: "Expert coverage", value: String(project.counts.experts), detail: "Human expert assignments", tone: "healthy" as const, trend: `${project.counts.agents} agents` }],
    nodes: base.nodes.map((node, index) => ({ ...node, name: entityNames[index] ?? `${project.code} node ${index + 1}`, detail: `${project.name} · ${project.variablePack.l0[index % project.variablePack.l0.length]}` })),
    routes: base.routes.map((route, index) => ({ ...route, id: `${project.code}-R${index + 1}`, volume: project.metrics[index % project.metrics.length].value, value: project.metrics[0].value, asset: `${project.code} synthetic movement ${index + 1}` })),
    intel: base.intel.map((item, index) => ({ ...item, id: `${project.code}-INT-${index + 1}`, title: `${project.metrics[index % project.metrics.length].label}: ${project.metrics[index % project.metrics.length].detail}`, detail: `${project.problem} This is a deterministic project fixture.`, impact: project.metrics[index % project.metrics.length].value, source: `${project.code} evidence ledger` })),
    money: base.money.map((item, index) => ({ ...item, label: project.metrics[index % project.metrics.length].label, value: project.metrics[index % project.metrics.length].value, detail: project.metrics[index % project.metrics.length].detail })),
    suppliers: base.suppliers.map((supplier, index) => ({ ...supplier, name: `${project.sector} partner ${String(index + 1).padStart(2, "0")}`, category: project.variablePack.l1[index % project.variablePack.l1.length], spend: project.metrics[0].value, region: project.regions.split("·")[index % project.regions.split("·").length]?.trim() ?? "Project region" })),
  };
}

function caseForProject(project: WorkspaceProject, base: DecisionCase): DecisionCase {
  if (project.id === "anode-shield") return base;
  const projectNumber = Number(project.code.replace("P-", ""));
  const lifecycle = [
    { stage: "Detect", status: "In analysis" },
    { stage: "Validate", status: "In analysis" },
    { stage: "Simulate", status: "In analysis" },
    { stage: "Approve", status: "Awaiting approval" },
    { stage: "Execute", status: "Executing" },
    { stage: "Measure", status: "Monitoring" },
  ] as const;
  const current = lifecycle[(projectNumber - 1) % lifecycle.length];
  return {
    ...base,
    id: caseIdForProject(project),
    title: project.outcome, summary: project.problem,
    stage: current.stage, status: current.status,
    severity: project.health === "critical" ? "Critical" : project.health === "watch" ? "High" : "Opportunity",
    owner: project.owner, due: `Project week ${String(37 + projectNumber).padStart(2, "0")} review`, confidence: 74 + (projectNumber % 5) * 3,
    value: project.metrics[0].value, serviceExposure: `${project.metrics[1].label} · ${project.metrics[1].value}`,
    primaryEntity: `${project.client} / ${project.name}`,
    affectedEntities: [project.sector, project.client, project.name, ...project.variablePack.l0.slice(0, 3)],
    variableIds: project.variablePack.l0, methodCodes: project.methodCodes,
    recommendation: `Review a governed ${project.name} response using mounted project apps, current L0 evidence, and named human experts.`,
    contributions: base.contributions.map((item, index) => ({ ...item, value: project.metrics[index % project.metrics.length].value, headline: `${project.metrics[index % project.metrics.length].label} challenge`, detail: `${project.code} project-bound ${item.app} contribution with evidence receipt ${project.metrics[index % project.metrics.length].evidenceRef}.` })),
    evidence: base.evidence.map((item, index) => ({ ...item, id: `${project.code}-EV-${index + 1}`, source: `${project.code} project evidence ledger`, fact: `${project.metrics[index % project.metrics.length].label}: ${project.metrics[index % project.metrics.length].detail}` })),
    scenarios: base.scenarios.map((item, index) => ({ ...item, id: `${project.code}-S-${index + 1}`, name: `${project.name} · ${["protect service", "balance value", "limit exposure"][index % 3]}`, protectedValue: project.metrics[index % project.metrics.length].value, service: project.metrics[1].value, change: `${project.code} deterministic comparison fixture; no solver was invoked.` })),
    tasks: base.tasks.map((item, index) => ({ ...item, id: `${project.code}-TASK-${index + 1}`, title: `${project.name}: ${item.title.toLowerCase()}`, owner: index === 0 ? project.owner : humanExperts[(projectNumber + index) % humanExperts.length].name })),
    outcome: { ...base.outcome, baseline: project.metrics[1].value, target: project.outcome, realized: "Awaiting governed execution" },
  };
}

export default function PlatformShell({ initialView, initialScope, initialCaseId, initialProjectId, initialProjectTab, initialProjectApp }: PlatformShellProps) {
  const [view, setView] = useState<ViewId>(initialView);
  const [scope, setScope] = useState<ScopeId>(initialScope);
  const [cases, setCases] = useState<DecisionCase[]>(() => decisionCases.map((item) => ({ ...item })));
  const [projectCasePatches, setProjectCasePatches] = useState<Record<string, Partial<DecisionCase>>>({});
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const [activeProjectId, setActiveProjectId] = useState(initialProjectId);
  const [activeProjectTab, setActiveProjectTab] = useState<WorkspaceTabId>(initialProjectTab);
  const [activeProjectApp, setActiveProjectApp] = useState<ProjectAppId | null>(initialProjectApp);
  const [horizon, setHorizon] = useState("Now");
  const [category, setCategory] = useState("All categories");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [networkSelection, setNetworkSelection] = useState<MapSelectionContext | null>(null);
  const [toast, setToast] = useState("");
  const [outcome, setOutcome] = useState<ActionOutcome | null>(null);
  const [outcomeLedgers, setOutcomeLedgers] = useState<Record<string, readonly ActionOutcome[]>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  const resolvedProject = workspaceProjects.find((item) => item.id === activeProjectId);
  const activeProject = resolvedProject ?? unboundProject;
  const ledgerKey = scope === "company" ? `project:${activeProject.id}` : `scope:${scope}`;
  const outcomeLedger = outcomeLedgers[ledgerKey] ?? [];
  const snapshot = scope === "company" ? snapshotForProject(activeProject) : scopeSnapshots[scope];
  const scopeCases = useMemo(() => cases.filter((item) => item.scope === scope), [cases, scope]);
  const storedCase = scope === "company"
    ? cases.find((item) => item.scope === "company") ?? cases[0]
    : cases.find((item) => item.id === selectedCaseId) ?? scopeCases[0] ?? cases[0];
  const projectCaseKey = `${activeProject.id}:${storedCase.id}`;
  const activeCase = scope === "company" ? caseForProject(activeProject, { ...storedCase, ...projectCasePatches[projectCaseKey] }) : storedCase;
  const visibleCases = scope === "company" ? [activeCase] : scopeCases;
  const notificationItems = scope === "company" ? [
    { tone: "critical", title: `${activeProject.name} expert review is ready`, detail: `${activeProject.metrics[0].value} · owned by ${activeProject.owner}`, caseId: activeCase.id },
    { tone: "watch", title: `${activeProject.metrics[1].label} requires a decision`, detail: `${activeProject.metrics[1].value} · trace ${activeProject.metrics[1].evidenceRef}`, caseId: activeCase.id },
    { tone: "opportunity", title: `${activeProject.mountedAppIds.length} mounted apps can challenge the plan`, detail: `${activeProject.methodCodes.length} handbook method references · synthetic project fixture`, caseId: activeCase.id },
  ] : [
    { tone: "critical", title: "Graphite response is ready for approval", detail: "$4.2M margin · due in 2 hours", caseId: "CASE-1042" },
    { tone: "watch", title: "Singapore delay now affects 11 priority orders", detail: "Inventory transfer is feasible", caseId: "CASE-1041" },
    { tone: "opportunity", title: "Regional casting qualification is ready for validation", detail: "$620K annual savings · two part families", caseId: "CASE-1038" },
  ];
  const searchResults = (() => {
    const catalog: SearchResult[] = [
      ...scopeIds.map((id) => ({ id: id as ViewId, label: scopeSnapshots[id].label, detail: scopeSnapshots[id].context, group: "Platform scope" })),
      ...workflowViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: item.detail, group: "Decision operations" })),
      ...applications.map((item) => ({ id: item.id as ViewId, label: item.name, detail: item.description, group: "Application" })),
      ...dataViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: item.detail, group: "Data platform" })),
      ...workspaceProjects.map((item) => ({ id: "company" as ViewId, projectId: item.id, label: `${item.client} · ${item.name}`, detail: `${item.sector} · ${item.problem}`, group: "Client project" })),
      ...(scope === "company" ? [activeCase] : cases).map((item) => ({ id: "case" as ViewId, caseId: item.id, label: `${item.id} · ${item.title}`, detail: `${item.stage} · ${item.owner} · ${item.primaryEntity}`, group: "Decision case" })),
    ];
    const query = searchQuery.trim().toLowerCase();
    return query ? catalog.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)) : catalog;
  })();

  const completeAction = (title: string, detail = title, artifact = "SESSION-ACTIVITY", status: ActionOutcome["status"] = "Completed") => {
    const now = new Date();
    const receipt: ActionOutcome = {
      id: `AUD-${now.getTime().toString(36).toUpperCase()}`,
      title,
      detail,
      artifact,
      status,
      timestamp: now.toISOString(),
      context: scope === "company" ? `${activeProject.client} / ${activeProject.name}` : snapshot.shortLabel,
    };
    setOutcome(receipt);
    setOutcomeLedgers((current) => ({ ...current, [ledgerKey]: [receipt, ...(current[ledgerKey] ?? [])].slice(0, 24) }));
    setToast(title);
  };

  const pushNavigation = (nextView: ViewId, nextScope: ScopeId, nextCaseId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    url.searchParams.set("scope", nextScope);
    url.searchParams.set("case", nextCaseId);
    if (nextScope === "company") {
      url.searchParams.set("sector", activeProject.sectorId);
      url.searchParams.set("client", activeProject.clientId);
      url.searchParams.set("project", activeProject.id);
      if (nextView !== "company") url.searchParams.delete("projectApp");
    } else {
      url.searchParams.delete("sector");
      url.searchParams.delete("client");
      url.searchParams.delete("project");
      url.searchParams.delete("projectTab");
      url.searchParams.delete("projectApp");
    }
    window.history.pushState({}, "", url);
  };

  const openProjectTab = (nextTab: WorkspaceTabId) => {
    if (!resolvedProject) {
      completeAction("Project workspace unavailable", "Select a valid client project before opening a project tab.", "PROJECT-CONTEXT", "Blocked");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", caseIdForProject(activeProject));
    url.searchParams.set("sector", activeProject.sectorId);
    url.searchParams.set("client", activeProject.clientId);
    url.searchParams.set("project", activeProject.id);
    url.searchParams.set("projectTab", nextTab);
    url.searchParams.delete("projectApp");
    window.history.pushState({}, "", url);
    setScope("company");
    setView("company");
    setSelectedCaseId(caseIdForProject(activeProject));
    setActiveProjectTab(nextTab);
    setActiveProjectApp(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const go = (next: ViewId) => {
    if (next === "company" && !resolvedProject) {
      const firstProject = workspaceProjects[0];
      if (firstProject) openProject(firstProject.id);
      return;
    }
    if (scope === "company" && (next === "decisions" || next === "agents" || next === "graph")) {
      openProjectTab(next === "decisions" ? "decisions" : next);
      return;
    }
    const nextScope = scopeIds.includes(next as ScopeId) ? next as ScopeId : scope;
    const nextCaseId = scopeIds.includes(next as ScopeId)
      ? nextScope === "company" ? caseIdForProject(activeProject) : cases.find((item) => item.scope === nextScope)?.id ?? selectedCaseId
      : selectedCaseId;
    setScope(nextScope);
    if (scopeIds.includes(next as ScopeId) && nextScope !== scope) setNetworkSelection(null);
    setSelectedCaseId(nextCaseId);
    setView(next);
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    if (nextScope !== scope) setOutcome(null);
    pushNavigation(next, nextScope, nextCaseId);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const openCase = (caseId: string, destination: "case" | "action" = "case") => {
    const item = caseId === activeCase.id ? activeCase : cases.find((candidate) => candidate.id === caseId) ?? activeCase;
    if (item.scope !== scope) setNetworkSelection(null);
    setSelectedCaseId(item.scope === "company" ? activeCase.id : item.id);
    setScope(item.scope);
    setView(destination);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    pushNavigation(destination, item.scope, item.scope === "company" ? activeCase.id : item.id);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const updateCase = (caseId: string, patch: Partial<DecisionCase>, message: string) => {
    if (scope === "company") {
      const key = projectCaseKey;
      setProjectCasePatches((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    } else {
      setCases((current) => current.map((item) => item.id === caseId ? { ...item, ...patch } : item));
    }
    completeAction("Case updated", message, scope === "company" ? `${activeProject.code}:${caseId}` : caseId, "Saved");
  };

  const openProject = (projectId: string) => {
    const project = workspaceProjects.find((item) => item.id === projectId);
    if (!project) {
      completeAction("Project open blocked", `No governed project matched '${projectId}'. No client fallback was substituted.`, "PROJECT-NOT-FOUND", "Blocked");
      return;
    }
    const nextCaseId = caseIdForProject(project);
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", nextCaseId);
    url.searchParams.set("sector", project.sectorId);
    url.searchParams.set("client", project.clientId);
    url.searchParams.set("project", project.id);
    url.searchParams.set("projectTab", "overview");
    window.history.pushState({}, "", url);
    setScope("company");
    setView("company");
    setSelectedCaseId(nextCaseId);
    setActiveProjectId(project.id);
    setActiveProjectTab("overview");
    setActiveProjectApp(null);
    setNetworkSelection(null);
    setSearchOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const changeScope = (next: ScopeId) => {
    if (next === "company" && !resolvedProject) {
      const firstProject = workspaceProjects[0];
      if (firstProject) openProject(firstProject.id);
      return;
    }
    if (next === "company" && (view === "decisions" || view === "agents" || view === "graph")) {
      openProjectTab(view === "decisions" ? "decisions" : view);
      return;
    }
    const nextView = scopeIds.includes(view as ScopeId) ? next : view;
    const nextCaseId = next === "company" ? caseIdForProject(activeProject) : cases.find((item) => item.scope === next)?.id ?? selectedCaseId;
    setScope(next);
    setView(nextView);
    setSelectedCaseId(nextCaseId);
    setNetworkSelection(null);
    setOutcome(null);
    pushNavigation(nextView, next, nextCaseId);
  };

  const openFromNetwork = (next: AppId, selection: MapSelectionContext) => {
    setNetworkSelection(selection);
    completeAction("Network context retained", `${selection.label} is now the shared ${selection.kind} context for ${viewLabels[next]}.`, selection.id, "Saved");
    go(next);
  };

  useEffect(() => {
    const onPopState = () => {
      const url = new URL(window.location.href);
      const navigation = resolveNavigation({
        view: url.searchParams.get("view") ?? undefined,
        scope: url.searchParams.get("scope") ?? undefined,
        case: url.searchParams.get("case") ?? undefined,
        sector: url.searchParams.get("sector") ?? undefined,
        client: url.searchParams.get("client") ?? undefined,
        project: url.searchParams.get("project") ?? undefined,
        projectTab: url.searchParams.get("projectTab") ?? undefined,
        projectApp: url.searchParams.get("projectApp") ?? undefined,
      });
      setView(navigation.view);
      setScope(navigation.scope);
      setSelectedCaseId(navigation.caseId);
      setActiveProjectId(navigation.projectId);
      setActiveProjectTab(navigation.projectTab);
      setActiveProjectApp(navigation.projectApp);
      setNetworkSelection(null);
      setMobileOpen(false);
      setSearchOpen(false);
      setNotificationsOpen(false);
      setProfileOpen(false);
      setOutcome(null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 20);
  }, [searchOpen]);

  useEffect(() => {
    document.title = `${viewLabels[view]} · Resilience OS`;
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="platform-shell">
      {mobileOpen && <button className="mobile-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`side-rail ${mobileOpen ? "open" : ""}`}>
        <header className="brand-block"><button className="brand" type="button" onClick={() => go("global")} aria-label="Open global platform"><span>R</span><div><b>RESILIENCE OS</b><small>CONNECTED SUPPLY NETWORK</small></div></button><button className="rail-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button></header>

        <nav aria-label="Main navigation">
          <section className="nav-section">
            <p>PLATFORM LEVEL</p>
            {scopeIds.map((id, index) => {
              const item = scopeSnapshots[id];
              return <button className={`scope-nav ${view === id ? "active" : ""}`} type="button" key={id} onClick={() => go(id)}><span>0{index + 1}</span><div><b>{id === "company" ? "Expert workspace" : item.label}</b><small>{id === "global" ? "World network" : id === "region" ? "Sector towers" : "Sector · client · project"}</small></div><i>→</i></button>;
            })}
          </section>
          {scope === "company" ? <section className="nav-section workflow-nav-section">
            <p>DECISION OPERATIONS</p>
            {workflowViews.map((item) => <button className={`data-nav workflow-nav ${(item.id === "decisions" && view === "company" && activeProjectTab === "decisions") || view === item.id ? "active" : ""}`} type="button" key={item.id} onClick={() => go(item.id)}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.id === "decisions" ? "Project decision tree and review queue" : item.detail}</small></div>{item.id === "decisions" && <em>{visibleCases.length}</em>}</button>)}
          </section> : <section className="nav-section workspace-entry"><p>CLIENT DELIVERY</p><button data-action-id="nav.open-expert-workspace" type="button" onClick={() => go("company")}><span>WS</span><div><b>Open expert workspace</b><small>Sector · client · project</small></div><i>→</i></button></section>}
          <section className="nav-section app-nav-section">
            <p>{scope === "company" ? "PROJECT APPS" : "INTELLIGENCE APPS"}</p>
            {applications.map((app) => <button className={`app-nav ${view === app.id ? "active" : ""}`} type="button" key={app.id} onClick={() => go(app.id)} style={{ "--app-accent": app.accent } as React.CSSProperties}><span>{app.icon}</span><div><b>{app.name}</b><small>{app.outcome}</small></div>{app.id === "risk" && <em>3</em>}</button>)}
          </section>
          {scope === "company" && <section className="nav-section">
            <p>DATA PLATFORM</p>
            {dataViews.map((item) => <button className={`data-nav ${view === "company" && activeProjectTab === item.id ? "active" : ""}`} type="button" key={item.id} onClick={() => go(item.id)}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.id === "agents" ? `${activeProject.counts.agents} synthetic profiles` : `${activeProject.counts.entities} project entities`}</small></div></button>)}
          </section>}
        </nav>

        <footer className="rail-footer">
          <button type="button" onClick={() => go("agents")}><i className="status-live" /><span><b>{scope === "company" ? "Project fixture ready" : "Agent catalog ready"}</b><small>{scope === "company" ? `${activeProject.counts.agents} synthetic profiles catalogued` : "12 synthetic profiles · no agents running"}</small></span><em>→</em></button>
          <p>CONCEPT WORKSPACE · SYNTHETIC DATA</p>
        </footer>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="breadcrumb"><span>Resilience OS</span><i>/</i><b>{viewLabels[view]}</b></div>
          <div className="scope-context"><span>ACTIVE CONTEXT</span><select value={scope} onChange={(event) => changeScope(event.target.value as ScopeId)}><option value="global">Global network</option><option value="region">APAC region</option><option value="company">{resolvedProject ? `${activeProject.client} / ${activeProject.name}` : "Open a client project"}</option></select></div>
          <div className="topbar-actions">
            <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)}><span>⌕</span><b>Search anything</b><kbd>⌘ K</kbd></button>
            <button className="topbar-icon" type="button" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}>◌<em>3</em></button>
            <button data-action-id="profile.toggle" className="user-button" type="button" aria-expanded={profileOpen} onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}><span>MR</span><div><b>Maya Rao</b><small>VP Supply Chain</small></div></button>
          </div>
          {notificationsOpen && <aside className="notification-panel"><header><div><p className="kicker">ATTENTION REQUIRED</p><h2>Three decisions need you</h2></div><button data-action-id="notifications.close" type="button" onClick={() => setNotificationsOpen(false)}>×</button></header>{notificationItems.map((item) => <button data-action-id={`notifications.open.${item.caseId}.${item.tone}`} type="button" key={`${item.caseId}-${item.tone}`} onClick={() => openCase(item.caseId)}><i className={`tone-${item.tone}`} /><span><b>{item.title}</b><small>{item.detail}</small></span><em>→</em></button>)}</aside>}
          {profileOpen && <aside className="profile-panel" aria-label="User menu"><header><span>MR</span><div><b>Maya Rao</b><small>VP Supply Chain · Client approver</small></div></header><button data-action-id="profile.open-workspace" type="button" onClick={() => go("company")}><b>Open active project workspace</b><small>{activeProject.client} · {activeProject.name}</small><i>→</i></button><button data-action-id="profile.open-receipts" type="button" disabled={!outcomeLedger.length} onClick={() => { setProfileOpen(false); setOutcome(outcomeLedger[0] ?? null); }}><b>Open session receipt ledger</b><small>{outcomeLedger.length ? `${outcomeLedger.length} browser-session receipts` : "No receipts recorded yet"}</small><i>→</i></button><button data-action-id="profile.decision-rights" type="button" onClick={() => { setProfileOpen(false); completeAction("Decision rights opened", "Maya can approve client decisions and execution packages; solver assumptions still require OR scientist review.", "RIGHTS-MR-01"); }}><b>Inspect decision rights</b><small>Approver · project-scoped</small><i>→</i></button><button data-action-id="profile.signout" type="button" onClick={() => { setProfileOpen(false); completeAction("Sign out unavailable", "Authentication is not connected in this front-end concept. No session was ended.", "AUTH-FUTURE", "Blocked"); }}><b>Sign out</b><small>Unavailable in concept mode</small><i>!</i></button></aside>}
        </header>

        <div className="statusbar">{scope === "company" ? <><span><i className="status-live" />Project fixture ready</span><span>{activeProject.counts.observations} observation metadata</span><span>{activeProject.counts.apps} mounted app contracts</span><span>{activeProject.counts.agents} agent profile fixtures</span><span>Evidence claim metadata <b>{activeProject.counts.claims}</b></span></> : <><span><i className="status-live" />Intelligence fixture active</span><span>84.2M synthetic evidence records</span><span>18,402 illustrative open orders</span><span>2,164 simulated movements</span><span>Last fixture merge <b>18 sec ago</b></span></>}<small>DEMO DATA</small></div>

        <main className="main-content">
          {scope === "company" && view !== "company" && <section className="project-binding-strip"><div><span>PROJECT-BOUND SURFACE</span><b>{activeProject.sector} / {activeProject.client} / {activeProject.name}</b><small>{activeProject.code} · shared project memory · synthetic fixture</small></div><button data-action-id="project-binding.return" type="button" onClick={() => go("company")}>Return to workspace →</button></section>}
          {view === "company" ? (
            <ProjectWorkspace initialProjectId={activeProject.id} initialTab={activeProjectTab} initialApp={activeProjectApp} onProjectChange={(project) => { setOutcome(null); setActiveProjectId(project.id); setSelectedCaseId(caseIdForProject(project)); }} onTabChange={setActiveProjectTab} onStudioChange={setActiveProjectApp} onOpenApp={(app) => go(app)} onOpenCase={() => openCase(activeCase.id)} onOutcome={completeAction} />
          ) : scopeIds.includes(view as ScopeId) ? (
            <ScopeDashboard key={snapshot.id} snapshot={snapshot} cases={scopeCases} horizon={horizon} category={category} onHorizonChange={setHorizon} onCategoryChange={setCategory} onOpenRisk={(selection) => selection ? openFromNetwork("risk", selection) : go("risk")} onOpenOptimizer={(selection) => selection ? openFromNetwork("optimizer", selection) : go("optimizer")} onOpenFlow={(selection) => selection ? openFromNetwork("flow", selection) : go("flow")} onOpenSupplier={() => go("suppliers")} onOpenCase={openCase} onOpenDecisions={() => go("decisions")} onTrace={(title, detail, artifact) => completeAction(title, detail, artifact, "Saved")} onRefresh={() => completeAction("Snapshot reconciled", "The fixed synthetic snapshot was reconciled; no source systems were contacted.", "SNAPSHOT-DEMO-01")} />
          ) : workflowViews.some((item) => item.id === view) ? (
            <DecisionWorkspaces key={`workflow:${scope}:${activeProject.id}:${view}`} view={view as WorkflowViewId} cases={visibleCases} activeCase={activeCase} scopeLabel={scope === "company" ? `${activeProject.client} / ${activeProject.name}` : snapshot.shortLabel} financeReviewer={scope === "company" ? humanExperts[(workspaceProjects.indexOf(activeProject) + 2) % humanExperts.length].name : "Elena Voss"} executiveReviewer={scope === "company" ? humanExperts[(workspaceProjects.indexOf(activeProject) + 3) % humanExperts.length].name : "Maya Rao"} onOpenCase={openCase} onOpenApp={(app) => go(app)} onUpdateCase={updateCase} onToast={(message) => completeAction("Decision interaction recorded", message, "DECISION-INTERACTION", interactionStatus(message))} />
          ) : applications.some((item) => item.id === view) ? (
            <ApplicationViews key={`application:${scope}:${activeProject.id}:${view}`} app={view as AppId} project={scope === "company" ? activeProject : undefined} snapshot={snapshot} activeCase={activeCase} networkSelection={networkSelection} onClearNetworkSelection={() => setNetworkSelection(null)} onOpenCase={() => openCase(activeCase.id)} onOpenAction={() => openCase(activeCase.id, "action")} onOpenAgents={() => go("agents")} onOpenGraph={() => go("graph")} onToast={(message) => completeAction("Application interaction recorded", message, "APPLICATION-INTERACTION", interactionStatus(message))} />
          ) : (
            <DataOperations key={`data:${scope}:${activeProject.id}:${view}`} view={view as DataViewId} snapshot={snapshot} onOpenApp={(app) => go(app)} onToast={(message) => completeAction("Data interaction recorded", message, "DATA-INTERACTION", interactionStatus(message))} />
          )}
        </main>

        <footer className="app-footer"><span>Resilience OS · Global intelligence → Sector → Client → Project → Decision → Evidence</span><span>Front-end concept · Synthetic data · No operational backend</span></footer>
      </div>

      {searchOpen && <div className="overlay" role="presentation"><button className="overlay-dismiss" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Resilience OS"><div className="search-input"><span>⌕</span><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects, applications, suppliers, orders…" /><kbd>ESC</kbd></div><div className="search-context"><span>{searchResults.length} results</span><b>Current context: {snapshot.shortLabel}</b></div><div className="search-results">{searchResults.map((result, index) => <button type="button" key={`${result.id}-${result.caseId ?? result.projectId ?? index}`} onClick={() => result.projectId ? openProject(result.projectId) : result.caseId ? openCase(result.caseId) : go(result.id)}><span>{result.group}</span><div><b>{result.label}</b><small>{result.detail}</small></div><i>→</i></button>)}</div></section></div>}
      {outcome && <div className="action-outcome-overlay" role="presentation"><button data-action-id="outcome.dismiss" className="action-outcome-scrim" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)} /><aside className="action-outcome" role="dialog" aria-modal="true" aria-label="Action receipt"><header><span className={`outcome-state state-${outcome.status.toLowerCase()}`}>{outcome.status}</span><button data-action-id="outcome.close" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)}>×</button></header><p>ACTION RECEIPT · {outcome.id}</p><h2>{outcome.title}</h2><span>{outcome.detail}</span><dl><div><dt>Artifact</dt><dd>{outcome.artifact}</dd></div><div><dt>Recorded context</dt><dd>{outcome.context}</dd></div><div><dt>Recorded</dt><dd>{outcome.timestamp}</dd></div><div><dt>Execution boundary</dt><dd>Browser-session concept</dd></div></dl><section className="session-receipt-ledger"><header><b>SESSION RECEIPT LEDGER</b><span>{outcomeLedger.length} retained · browser memory only</span></header>{outcomeLedger.slice(0, 5).map((entry) => <button data-action-id={`outcome.open.${entry.id}`} type="button" key={entry.id} onClick={() => setOutcome(entry)} className={entry.id === outcome.id ? "active" : ""}><span>{entry.status}</span><b>{entry.title}</b><small>{entry.artifact}</small></button>)}</section><button data-action-id="outcome.done" className="primary-dark-action" type="button" onClick={() => setOutcome(null)}>Done</button></aside></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><DotIcon /><span>{toast}</span></div>}
    </div>
  );
}

function DotIcon() {
  return <i className="status-live" aria-hidden="true" />;
}
