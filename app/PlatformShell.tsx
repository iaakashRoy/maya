"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import ApplicationViews from "./ApplicationViews";
import DataOperations from "./DataOperations";
import DecisionWorkspaces from "./DecisionWorkspaces";
import ProjectWorkspace, { AppRunHistory } from "./ProjectWorkspace";
import ScopeDashboard, { regionalOperationsProfiles } from "./ScopeDashboard";
import WorkspaceHome from "./WorkspaceHome";
import WorkspaceOnboarding from "./WorkspaceOnboarding";
import WorkIdentityInspector, { type WorkIdentitySelection } from "./WorkIdentityInspector";
import { AppGlyph, BrandMark, IdentityAvatar } from "./VisualIdentity";
import { useDialogLifecycle } from "./useDialogLifecycle";
import type { MapSelectionContext } from "./WorldNetworkMap";
import type { NetworkRegion } from "./network-operations-model";
import { resolveNavigation, scopeIds, viewLabels } from "./navigation";
import {
  caseIdForProject,
  createSessionCollaborators,
  createSessionClient,
  createSessionProject,
  createSessionProjectMemberships,
  agentsFor,
  evaluateProjectAccess,
  humanExperts,
  membershipsForProject,
  projectApps,
  projectMemberships,
  signedInCollaboratorId,
  workspaceClients,
  workspaceCollaborators,
  workspaceProjects,
  workspaceTabs,
  type ProjectAppId,
  type ProjectAccessDecision,
  type ProjectCapability,
  type ProjectMembership,
  type SessionClientDraft,
  type SessionProjectDraft,
  type WorkspaceClient,
  type WorkspaceCollaborator,
  type ExpertAgent,
  type WorkspaceProject,
  type WorkspaceTabId,
} from "./workspace-model";
import { appRunsFor, projectActivityReducer, projectHasDataContract, seedProjectActivity, sessionsForProject } from "./project-activity-model";
import { groupProjectsByPath, projectPathKeys, projectPathSegments, type ProjectPathMode } from "./project-path-model";
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
  { id: "agents" as const, label: "Playground", icon: "PG", detail: "Project sessions and expert agents" },
  { id: "graph" as const, label: "Data & graph", icon: "DG", detail: "Sources, files, tables, and knowledge graph" },
];

const workflowViews = [
  { id: "decisions" as const, label: "Decisions", icon: "DI", detail: "Prioritize governed cases" },
  { id: "case" as const, label: "Decision", icon: "CW", detail: "Review app evidence" },
  { id: "action" as const, label: "Review", icon: "AR", detail: "Approve and release work" },
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
  initialSessionId: string | null;
  initialRunId: string | null;
};

const capabilityForProjectTab = (tab: WorkspaceTabId): ProjectCapability => {
  if (tab === "decisions") return "decisions.view";
  if (tab === "apps") return "apps.view";
  if (tab === "data" || tab === "graph") return "data.view";
  if (tab === "agents") return "agents.run";
  return "project.view";
};

const capabilityForProjectView = (target: ViewId): ProjectCapability | null => {
  if (workflowViews.some((item) => item.id === target)) return "decisions.view";
  if (applications.some((item) => item.id === target)) return "apps.view";
  if (target === "graph") return "data.view";
  if (target === "agents") return "agents.run";
  return null;
};

const routeParameterKeys = ["case", "sector", "client", "project", "projectTab", "projectApp", "session", "run"] as const;

type TanjxHistoryState = { tanjxReturn?: { surface: "project"; projectId: string; tab: WorkspaceTabId } };

function commitNavigationUrl(url: URL, replace = false, state: TanjxHistoryState = {}) {
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return false;
  window.history[replace ? "replaceState" : "pushState"](state, "", url);
  return true;
}

function canonicalNavigationUrl(current: string, navigation: ReturnType<typeof resolveNavigation>) {
  const url = new URL(current);
  url.searchParams.set("view", navigation.view);
  url.searchParams.set("scope", navigation.scope);
  routeParameterKeys.forEach((key) => url.searchParams.delete(key));
  if (navigation.scope === "global" || navigation.scope === "region") {
    url.searchParams.set("case", navigation.caseId);
  } else if (navigation.projectId && navigation.sectorId && navigation.clientId) {
    url.searchParams.set("case", navigation.caseId);
    url.searchParams.set("sector", navigation.sectorId);
    url.searchParams.set("client", navigation.clientId);
    url.searchParams.set("project", navigation.projectId);
    url.searchParams.set("projectTab", navigation.projectTab);
    if (navigation.projectApp) url.searchParams.set("projectApp", navigation.projectApp);
    if (navigation.sessionId) url.searchParams.set("session", navigation.sessionId);
    if (navigation.runId) url.searchParams.set("run", navigation.runId);
  }
  return url;
}

const preferenceEvent = "tanjx:workspace-preference";
const subscribeToPreferences = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener(preferenceEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(preferenceEvent, notify);
  };
};
const getPathModePreference = (): ProjectPathMode => {
  try { return window.sessionStorage.getItem("tanjx.projectPathMode") === "tower" ? "tower" : "client"; }
  catch { return "client"; }
};
const getRailPreference = () => {
  try { return window.sessionStorage.getItem("tanjx.railCollapsed") === "true"; }
  catch { return false; }
};
const getThemePreference = (): "light" | "dark" => {
  try { return window.localStorage.getItem("tanjx.workspaceTheme") === "dark" ? "dark" : "light"; }
  catch { return "light"; }
};
const setPreference = (key: string, value: string) => {
  try { window.sessionStorage.setItem(key, value); }
  catch { /* Keep the current rendered preference when storage is unavailable. */ }
  window.dispatchEvent(new Event(preferenceEvent));
};
const setPersistentPreference = (key: string, value: string) => {
  try { window.localStorage.setItem(key, value); }
  catch { /* Keep the current rendered preference when storage is unavailable. */ }
  window.dispatchEvent(new Event(preferenceEvent));
};

function useProjectPathModePreference() {
  const value = useSyncExternalStore(subscribeToPreferences, getPathModePreference, () => "client" as const);
  const update = useCallback((next: ProjectPathMode) => setPreference("tanjx.projectPathMode", next), []);
  return [value, update] as const;
}

function useRailCollapsedPreference() {
  const value = useSyncExternalStore(subscribeToPreferences, getRailPreference, () => false);
  const update = useCallback((next: boolean) => setPreference("tanjx.railCollapsed", String(next)), []);
  return [value, update] as const;
}

function useWorkspaceThemePreference() {
  const value = useSyncExternalStore(subscribeToPreferences, getThemePreference, () => "light" as const);
  const update = useCallback((next: "light" | "dark") => setPersistentPreference("tanjx.workspaceTheme", next), []);
  return [value, update] as const;
}

function ProjectAccessBoundary({ decision, onWorkspace, onReceipt }: { decision: ProjectAccessDecision; onWorkspace: () => void; onReceipt: () => void }) {
  return <section className="project-access-boundary" data-page-heading tabIndex={-1}><span>PROJECT ACCESS</span><h1>Project access required</h1><p>The signed-in collaborator has no project-scoped grant for this workspace. No project data, app, decision, agent, or team surface was opened.</p><small>{decision.policyRef}</small><div><button data-action-id="access.return-workspace" type="button" onClick={onWorkspace}>Return to workspace</button><button data-action-id="access.view-receipt" type="button" onClick={onReceipt}>View access receipt</button></div></section>;
}

const unboundProject: WorkspaceProject = {
  id: "unbound",
  sectorId: "",
  sector: "No sector selected",
  clientId: "",
  client: "No client selected",
  name: "Choose a project",
  code: "P-000",
  problem: "Select a governed client project from Workspace.",
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
  origin: "Browser-session draft",
};

const interactionStatus = (message: string): ActionOutcome["status"] => /\b(unavailable|blocked|not connected|cannot|disabled|no access)\b/i.test(message) ? "Blocked" : "Saved";

function snapshotForProject(project: WorkspaceProject): ScopeSnapshot {
  const base = scopeSnapshots.company;
  if (project.id === "anode-shield") return base;
  const metrics: WorkspaceProject["metrics"] = project.metrics.length ? project.metrics : [
    { label: "Data contract", value: "Not configured", detail: "Complete the project Data workflow", tone: "watch", evidenceRef: `EV-${project.code}-SETUP-01` },
    { label: "Mapped observations", value: "0", detail: "No project observations are available", tone: "opportunity", evidenceRef: `EV-${project.code}-SETUP-02` },
    { label: "Decision briefs", value: "0", detail: "No project decision has been drafted", tone: "opportunity", evidenceRef: `EV-${project.code}-SETUP-03` },
    { label: "External writes", value: "0", detail: "Browser-session setup boundary", tone: "healthy", evidenceRef: `EV-${project.code}-SETUP-04` },
  ];
  const entityNames = [`${project.client} source network`, `${project.sector} partner cluster`, `${project.name} operating node`, `${project.regions.split("·")[0]?.trim()} demand hub`, `${project.variablePack.l0[0] ?? "Unmapped variable"} constraint`, `${project.client} inventory buffer`];
  return {
    ...base,
    label: `${project.client} workspace`, shortLabel: project.client, title: project.outcome, description: project.problem,
    context: `${project.client} · ${project.name} · ${project.classification}`, currency: project.currency,
    updated: `${project.code} synthetic snapshot · project isolated`,
    metrics: [...metrics.map((metric) => ({ label: metric.label, value: metric.value, detail: metric.detail, tone: metric.tone, trend: `Trace ${metric.evidenceRef}` })), { label: "Knowledge entities", value: project.counts.entities, detail: "Hydrated fixture manifest", tone: "info" as const, trend: project.code }, { label: "Expert coverage", value: String(project.counts.experts), detail: "Human expert assignments", tone: "healthy" as const, trend: `${project.counts.agents} agents` }],
    nodes: base.nodes.map((node, index) => ({ ...node, name: entityNames[index] ?? `${project.code} node ${index + 1}`, detail: `${project.name} · ${project.variablePack.l0.length ? project.variablePack.l0[index % project.variablePack.l0.length] : "Mapping pending"}` })),
    routes: base.routes.map((route, index) => ({ ...route, id: `${project.code}-R${index + 1}`, volume: metrics[index % metrics.length].value, value: metrics[0].value, asset: `${project.code} synthetic movement ${index + 1}` })),
    intel: base.intel.map((item, index) => ({ ...item, id: `${project.code}-INT-${index + 1}`, title: `${metrics[index % metrics.length].label}: ${metrics[index % metrics.length].detail}`, detail: `${project.problem} This is a deterministic project fixture.`, impact: metrics[index % metrics.length].value, source: `${project.code} evidence ledger` })),
    money: base.money.map((item, index) => ({ ...item, label: metrics[index % metrics.length].label, value: metrics[index % metrics.length].value, detail: metrics[index % metrics.length].detail })),
    suppliers: base.suppliers.map((supplier, index) => ({ ...supplier, name: `${project.sector} partner ${String(index + 1).padStart(2, "0")}`, category: project.variablePack.l1.length ? project.variablePack.l1[index % project.variablePack.l1.length] : "Mapping pending", spend: metrics[0].value, region: project.regions.split("·")[index % project.regions.split("·").length]?.trim() ?? "Project region" })),
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

export default function PlatformShell({ initialView, initialScope, initialCaseId, initialProjectId, initialProjectTab, initialProjectApp, initialSessionId, initialRunId }: PlatformShellProps) {
  const [view, setView] = useState<ViewId>(initialView);
  const [scope, setScope] = useState<ScopeId>(initialScope);
  const [cases, setCases] = useState<DecisionCase[]>(() => decisionCases.map((item) => ({ ...item })));
  const [projectCatalog, setProjectCatalog] = useState<WorkspaceProject[]>(() => [...workspaceProjects]);
  const [clientCatalog, setClientCatalog] = useState<WorkspaceClient[]>(() => [...workspaceClients]);
  const [collaboratorCatalog, setCollaboratorCatalog] = useState<WorkspaceCollaborator[]>(() => [...workspaceCollaborators]);
  const [membershipCatalog, setMembershipCatalog] = useState<ProjectMembership[]>(() => [...projectMemberships]);
  const [onboardingMode, setOnboardingMode] = useState<"client" | "project" | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [clientDraft, setClientDraft] = useState<SessionClientDraft>({
    name: "",
    sector: "Mobility & EV",
    classification: "Client confidential",
    dataResidency: "Policy review required",
    clientLead: "Client project owner",
    providerLead: "Asha Rao",
  });
  const [projectDraft, setProjectDraft] = useState<SessionProjectDraft>({
    clientId: workspaceClients[0]?.id ?? "",
    sectorId: workspaceClients[0]?.sectorId ?? "",
    sector: workspaceClients[0]?.sector ?? "",
    name: "",
    problem: "",
    outcome: "",
    owner: "Asha Rao",
    currency: "USD",
    regions: "Global",
    classification: "Client confidential",
    dataResidency: "Policy review required",
  });
  const [projectCasePatches, setProjectCasePatches] = useState<Record<string, Partial<DecisionCase>>>({});
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const [activeProjectId, setActiveProjectId] = useState(initialProjectId);
  const [activeProjectTab, setActiveProjectTab] = useState<WorkspaceTabId>(initialProjectTab);
  const [activeProjectApp, setActiveProjectApp] = useState<ProjectAppId | null>(initialProjectApp);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId);
  const [activeRunId, setActiveRunId] = useState<string | null>(initialRunId);
  const [projectPathMode, setProjectPathMode] = useProjectPathModePreference();
  const [expandedSidebarRoots, setExpandedSidebarRoots] = useState<readonly string[]>([]);
  const [expandedSidebarBranches, setExpandedSidebarBranches] = useState<readonly string[]>([]);
  const [collapsedSidebarRoots, setCollapsedSidebarRoots] = useState<readonly string[]>([]);
  const [collapsedSidebarBranches, setCollapsedSidebarBranches] = useState<readonly string[]>([]);
  const [projectNavQuery, setProjectNavQuery] = useState("");
  const [railCollapsed, setRailCollapsed] = useRailCollapsedPreference();
  const [workspaceTheme, setWorkspaceTheme] = useWorkspaceThemePreference();
  const [activityState, dispatchActivity] = useReducer(projectActivityReducer, workspaceProjects, (projects) => {
    const seeded = seedProjectActivity(projects);
    const session = initialSessionId ? seeded.sessions.find((item) => item.id === initialSessionId && item.projectId === initialProjectId) : undefined;
    const run = initialRunId ? seeded.appRuns.find((item) => item.id === initialRunId && item.projectId === initialProjectId) : undefined;
    return {
      ...seeded,
      selectedSessionByProject: session || run ? { ...seeded.selectedSessionByProject, [initialProjectId]: run?.sessionId ?? session!.id } : seeded.selectedSessionByProject,
      selectedRunByProjectApp: run ? { ...seeded.selectedRunByProjectApp, [`${run.projectId}:${run.appId}`]: run.id } : seeded.selectedRunByProjectApp,
    };
  });
  const handleMountedAppsChange = useCallback((projectId: string, appIds: readonly ProjectAppId[]) => {
    setProjectCatalog((current) => {
      const project = current.find((item) => item.id === projectId);
      if (!project) return current;
      const unchanged = project.mountedAppIds.length === appIds.length
        && project.mountedAppIds.every((id, index) => id === appIds[index])
        && project.counts.apps === appIds.length;
      if (unchanged) return current;
      return current.map((item) => item.id === projectId
        ? { ...item, mountedAppIds: [...appIds], counts: { ...item.counts, apps: appIds.length } }
        : item);
    });
  }, []);
  const handleProjectSetupChange = useCallback((projectId: string, patch: Partial<WorkspaceProject>) => {
    setProjectCatalog((current) => current.map((project) => project.id === projectId ? { ...project, ...patch } : project));
  }, []);
  const [projectAgentRosters, setProjectAgentRosters] = useState<Record<string, readonly ExpertAgent[]>>({});
  const handleAgentRosterChange = useCallback((projectId: string, agents: readonly ExpertAgent[]) => {
    setProjectAgentRosters((current) => {
      const existing = current[projectId];
      if (existing?.length === agents.length && existing.every((agent, index) => agent.id === agents[index]?.id)) return current;
      return { ...current, [projectId]: [...agents] };
    });
  }, []);
  const [horizon, setHorizon] = useState("Now");
  const [category, setCategory] = useState("All categories");
  const [operationsRegion, setOperationsRegion] = useState<NetworkRegion>("APAC");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(false);
  const [compactContext, setCompactContext] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [networkSelection, setNetworkSelection] = useState<MapSelectionContext | null>(null);
  const [toast, setToast] = useState("");
  const [outcome, setOutcome] = useState<ActionOutcome | null>(null);
  const [outcomeLedgers, setOutcomeLedgers] = useState<Record<string, readonly ActionOutcome[]>>({});
  const [identitySelection, setIdentitySelection] = useState<WorkIdentitySelection>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profilePanelRef = useRef<HTMLElement>(null);
  const searchDialogRef = useDialogLifecycle<HTMLElement>(searchOpen, () => setSearchOpen(false));
  const outcomeDialogRef = useDialogLifecycle<HTMLElement>(Boolean(outcome), () => setOutcome(null));
  const mobileRailRef = useDialogLifecycle<HTMLElement>(drawerMode && mobileOpen, () => setMobileOpen(false));

  const resolvedProject = projectCatalog.find((item) => item.id === activeProjectId);
  const activeProject = resolvedProject ?? unboundProject;
  const ledgerKey = scope === "company" && resolvedProject ? `project:${activeProject.id}` : scope === "company" ? "workspace" : `operations:${scope}`;
  const outcomeLedger = outcomeLedgers[ledgerKey] ?? [];
  const snapshot = scope === "company" && resolvedProject ? snapshotForProject(activeProject) : scopeSnapshots[scope === "company" ? "global" : scope];
  const scopeCases = useMemo(() => cases.filter((item) => item.scope === scope), [cases, scope]);
  const storedCase = scope === "company" && resolvedProject
    ? cases.find((item) => item.scope === "company") ?? cases[0]
    : cases.find((item) => item.id === selectedCaseId) ?? scopeCases[0] ?? cases[0];
  const projectCaseKey = `${activeProject.id}:${storedCase.id}`;
  const hasProjectDecision = Boolean(resolvedProject && activeProject.counts.decisions > 0);
  const projectCase = scope === "company" && resolvedProject && hasProjectDecision
    ? caseForProject(activeProject, { ...storedCase, ...projectCasePatches[projectCaseKey] })
    : null;
  const activeCase = projectCase ?? storedCase;
  const visibleCases = scope === "company" && resolvedProject ? (projectCase ? [projectCase] : []) : scopeCases;
  const activeProjectViewAccess = resolvedProject
    ? evaluateProjectAccess(resolvedProject.id, signedInCollaboratorId, "project.view", membershipCatalog)
    : null;
  const activeRouteCapability = capabilityForProjectView(view);
  const activeRouteAccess = resolvedProject && activeRouteCapability
    ? evaluateProjectAccess(resolvedProject.id, signedInCollaboratorId, activeRouteCapability, membershipCatalog)
    : null;
  const deniedProjectAccess = activeProjectViewAccess && !activeProjectViewAccess.allowed
    ? activeProjectViewAccess
    : activeRouteAccess && !activeRouteAccess.allowed ? activeRouteAccess : null;
  const canViewActiveProject = Boolean(resolvedProject && activeProjectViewAccess?.allowed);
  const accessibleProjects = useMemo(() => projectCatalog.filter((project) => evaluateProjectAccess(project.id, signedInCollaboratorId, "project.view", membershipCatalog).allowed), [membershipCatalog, projectCatalog]);
  const accessibleClients = useMemo(() => clientCatalog.filter((client) => client.origin === "Browser-session draft" || accessibleProjects.some((project) => project.clientId === client.id)), [accessibleProjects, clientCatalog]);
  const effectiveMountedApps = resolvedProject?.mountedAppIds ?? [];
  const sidebarPathGroups = useMemo(() => {
    const query = projectNavQuery.trim().toLowerCase();
    const matchingClientIds = new Set(accessibleClients
      .filter((client) => `${client.name} ${client.sector} ${client.id}`.toLowerCase().includes(query))
      .map((client) => client.id));
    const pathProjects = query
      ? accessibleProjects.filter((project) => matchingClientIds.has(project.clientId) || `${project.sector} ${project.client} ${project.name} ${project.code} ${project.problem}`.toLowerCase().includes(query))
      : accessibleProjects;
    const pathClients = query
      ? accessibleClients.filter((client) => matchingClientIds.has(client.id) || pathProjects.some((project) => project.clientId === client.id))
      : accessibleClients;
    const grouped = groupProjectsByPath(pathProjects, projectPathMode).map((group) => ({ ...group, branches: [...group.branches] }));
    if (projectPathMode === "client") {
      for (const client of pathClients) {
        if (!grouped.some((group) => group.id === client.id)) grouped.push({ id: client.id, key: `client:${client.id}`, kind: "client", label: client.name, branches: [], projects: [] });
      }
    } else {
      for (const client of pathClients) {
        if (pathProjects.some((project) => project.clientId === client.id)) continue;
        let tower = grouped.find((group) => group.id === client.sectorId);
        if (!tower) {
          tower = { id: client.sectorId, key: `tower:${client.sectorId}`, kind: "tower", label: client.sector, branches: [], projects: [] };
          grouped.push(tower);
        }
        tower.branches.push({ id: client.id, key: `tower:${client.sectorId}::client:${client.id}`, kind: "client", label: client.name, projects: [] });
      }
    }
    return grouped
      .map((group) => ({ ...group, branches: [...group.branches].sort((left, right) => left.label.localeCompare(right.label)) }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [accessibleClients, accessibleProjects, projectNavQuery, projectPathMode]);
  const projectNavQueryActive = Boolean(projectNavQuery.trim());
  const projectPath = resolvedProject ? projectPathSegments(resolvedProject, projectPathMode) : [];
  const activeWorkSessions = resolvedProject ? sessionsForProject(activityState, resolvedProject.id) : [];
  const activeProjectAgents = resolvedProject ? projectAgentRosters[resolvedProject.id] ?? agentsFor(resolvedProject) : [];
  const activeProjectMembers = resolvedProject ? membershipsForProject(resolvedProject.id, membershipCatalog).flatMap((membership) => {
    const collaborator = collaboratorCatalog.find((item) => item.id === membership.collaboratorId);
    return collaborator ? [{ membership, collaborator }] : [];
  }) : [];
  const activeProjectActivities = resolvedProject ? activityState.activities.filter((item) => item.projectId === resolvedProject.id) : [];
  const activeProjectRuns = resolvedProject ? appRunsFor(activityState, resolvedProject.id) : [];
  const workspaceCollaboratorViews = useMemo(() => collaboratorCatalog.filter((collaborator) => {
    if (collaborator.id === signedInCollaboratorId) return true;
    if (collaborator.clientId && accessibleClients.some((client) => client.id === collaborator.clientId)) return true;
    return membershipCatalog.some((membership) => membership.collaboratorId === collaborator.id && accessibleProjects.some((project) => project.id === membership.projectId));
  }).map((collaborator) => {
    const memberships = membershipCatalog.filter((membership) => membership.collaboratorId === collaborator.id && accessibleProjects.some((project) => project.id === membership.projectId));
    const membership = memberships[0];
    const project = membership ? projectCatalog.find((item) => item.id === membership.projectId) : undefined;
    return {
      ...collaborator,
      decisionRight: membership?.capabilities.includes("decisions.approve") ? "Approve project decisions" : membership ? "Contribute within assigned rights" : "Awaiting project assignment",
      availability: collaborator.profileOrigin === "Browser-session draft" ? "Session profile" : "Fixture profile",
      activeWork: memberships.length,
      projectId: project?.id,
      queueItem: project ? `${membership.projectRole} · ${project.name}` : "Client relationship setup",
      queueStatus: project ? project.stage : "Not assigned",
    };
  }), [accessibleClients, accessibleProjects, collaboratorCatalog, membershipCatalog, projectCatalog]);
  const signedInCollaborator = collaboratorCatalog.find((collaborator) => collaborator.id === signedInCollaboratorId);
  const signedInProjectMembership = resolvedProject
    ? membershipCatalog.find((membership) => membership.projectId === resolvedProject.id && membership.collaboratorId === signedInCollaboratorId)
    : undefined;
  const notificationItems = scope === "company" && resolvedProject && activeProjectViewAccess?.allowed
    ? hasProjectDecision ? [
      { tone: "critical", title: `${activeProject.name} expert review is ready`, detail: `${activeProject.metrics[0].value} · owned by ${activeProject.owner}`, caseId: activeCase.id },
      { tone: "watch", title: `${activeProject.metrics[1].label} requires a decision`, detail: `${activeProject.metrics[1].value} · trace ${activeProject.metrics[1].evidenceRef}`, caseId: activeCase.id },
      { tone: "opportunity", title: `${effectiveMountedApps.length} mounted apps can challenge the plan`, detail: `${activeProject.methodCodes.length} handbook method references · synthetic project fixture`, caseId: activeCase.id },
    ] : [
      { tone: "watch", title: `${activeProject.name} needs its first data contract`, detail: "No datasets, apps, agents, or decisions have been added", projectId: activeProject.id, caseId: "setup" },
      { tone: "opportunity", title: "Project access is ready for setup", detail: `${membershipCatalog.filter((item) => item.projectId === activeProject.id).length} project memberships · start in Data`, projectId: activeProject.id, caseId: "access" },
    ]
    : accessibleProjects.slice(0, 3).map((project) => ({
    tone: project.health === "critical" ? "critical" : project.health === "watch" ? "watch" : "opportunity",
    title: `${project.client} · ${project.name}`,
    detail: `${project.stage} · ${project.owner}`,
    caseId: caseIdForProject(project),
    projectId: project.id,
  }));
  const searchResults = (() => {
    const catalog: SearchResult[] = [
      { id: "company", label: "Workspace", detail: "Sectors, clients, projects, and collaboration", group: "Navigation" },
      { id: "global", label: "Operations World · Global", detail: scopeSnapshots.global.context, group: "Navigation" },
      { id: "region", label: "Operations World · Regional", detail: regionalOperationsProfiles[operationsRegion].context, group: "Navigation" },
      ...accessibleProjects.map((item) => ({ id: "company" as ViewId, projectId: item.id, label: `${item.client} · ${item.name}`, detail: `${item.sector} · ${item.problem}`, group: "Project" })),
      ...(scope === "company" && resolvedProject && activeProjectViewAccess?.allowed ? [
        ...workflowViews.filter((item) => hasProjectDecision || item.id === "decisions").map((item) => ({ id: item.id as ViewId, label: item.label, detail: `${activeProject.name} · ${hasProjectDecision ? item.detail : "Create the first decision brief"}`, group: "Project capability" })),
        ...applications.filter((item) => effectiveMountedApps.includes(item.id)).map((item) => ({ id: item.id as ViewId, label: item.name, detail: `${activeProject.name} · ${item.description}`, group: "Project app" })),
        ...dataViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: activeProject.name, group: "Project capability" })),
        ...(projectCase ? [{ id: "case" as ViewId, caseId: projectCase.id, label: `${projectCase.id} · ${projectCase.title}`, detail: `${projectCase.stage} · ${projectCase.owner}`, group: "Project decision" }] : []),
      ] : []),
    ];
    const query = searchQuery.trim().toLowerCase();
    return query ? catalog.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)) : catalog;
  })();

  const completeAction = (title: string, detail = title, artifact = "SESSION-ACTIVITY", status: ActionOutcome["status"] = "Completed", contextOverride?: string, ledgerKeyOverride?: string) => {
    const now = new Date();
    const receipt: ActionOutcome = {
      id: `AUD-${now.getTime().toString(36).toUpperCase()}`,
      title,
      detail,
      artifact,
      status,
      timestamp: now.toISOString(),
      context: contextOverride ?? (scope === "company" && resolvedProject && activeProjectViewAccess?.allowed ? `${activeProject.client} / ${activeProject.name}` : scope === "company" ? "Workspace portfolio" : `Operations World / ${scope === "region" ? operationsRegion : snapshot.shortLabel}`),
    };
    setOutcome(receipt);
    const receiptLedgerKey = ledgerKeyOverride ?? ledgerKey;
    setOutcomeLedgers((current) => ({ ...current, [receiptLedgerKey]: [receipt, ...(current[receiptLedgerKey] ?? [])].slice(0, 24) }));
    setToast(title);
  };

  const requireActiveProjectCapability = (capability: ProjectCapability) => {
    if (!resolvedProject) {
      completeAction("Project access blocked", "Select a governed project before opening this capability.", "PROJECT-CONTEXT", "Blocked");
      return false;
    }
    const decision = evaluateProjectAccess(resolvedProject.id, signedInCollaboratorId, capability, membershipCatalog);
    if (!decision.allowed) completeAction("Project access blocked", decision.reason, decision.policyRef, "Blocked", "Workspace access control");
    return decision.allowed;
  };

  const projectSurfaceTransition = () => {
    const current = window.history.state as TanjxHistoryState | null;
    const currentReturn = current?.tanjxReturn?.surface === "project" && current.tanjxReturn.projectId === activeProject.id ? current : null;
    const alreadyOnProjectSurface = scope === "company" && Boolean(resolvedProject) && (view !== "company" || activeProjectApp !== null);
    return {
      historyState: currentReturn ?? (alreadyOnProjectSurface ? {} : { tanjxReturn: { surface: "project" as const, projectId: activeProject.id, tab: activeProjectTab } }),
      replace: alreadyOnProjectSurface,
    };
  };

  const pushNavigation = (nextView: ViewId, nextScope: ScopeId, nextCaseId: string, historyState: TanjxHistoryState = {}, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    url.searchParams.set("scope", nextScope);
    url.searchParams.set("case", nextCaseId);
    if (nextScope === "company" && resolvedProject) {
      url.searchParams.set("sector", activeProject.sectorId);
      url.searchParams.set("client", activeProject.clientId);
      url.searchParams.set("project", activeProject.id);
      if (nextView !== "company") {
        url.searchParams.delete("projectApp");
        url.searchParams.delete("session");
        url.searchParams.delete("run");
      }
    } else {
      ["sector", "client", "project", "projectTab", "projectApp", "session", "run"].forEach((key) => url.searchParams.delete(key));
    }
    commitNavigationUrl(url, replace, historyState);
  };

  const openWorkspaceHome = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    routeParameterKeys.forEach((key) => url.searchParams.delete(key));
    commitNavigationUrl(url);
    setView("company");
    setScope("company");
    setActiveProjectId("");
    setActiveProjectTab("overview");
    setActiveProjectApp(null);
    setActiveSessionId(null);
    setActiveRunId(null);
    setNetworkSelection(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    setIdentitySelection(null);
  };

  const openProjectTab = (nextTab: WorkspaceTabId, replace = false) => {
    if (!resolvedProject) {
      completeAction("Project workspace unavailable", "Select a valid client project before opening a project tab.", "PROJECT-CONTEXT", "Blocked");
      return;
    }
    if (!requireActiveProjectCapability(capabilityForProjectTab(nextTab))) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", caseIdForProject(activeProject));
    url.searchParams.set("sector", activeProject.sectorId);
    url.searchParams.set("client", activeProject.clientId);
    url.searchParams.set("project", activeProject.id);
    url.searchParams.set("projectTab", nextTab);
    url.searchParams.delete("projectApp");
    url.searchParams.delete("run");
    if (nextTab === "agents" && activeSessionId) url.searchParams.set("session", activeSessionId);
    else url.searchParams.delete("session");
    commitNavigationUrl(url, replace);
    setScope("company");
    setView("company");
    setSelectedCaseId(caseIdForProject(activeProject));
    setActiveProjectTab(nextTab);
    setActiveProjectApp(null);
    setActiveSessionId(nextTab === "agents" ? activeSessionId : null);
    setActiveRunId(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
  };

  const returnFromProjectApp = () => {
    const historyState = window.history.state as TanjxHistoryState | null;
    if (historyState?.tanjxReturn?.surface === "project" && historyState.tanjxReturn.projectId === activeProject.id && window.history.length > 1) {
      window.history.back();
      return;
    }
    openProjectTab(historyState?.tanjxReturn?.tab ?? activeProjectTab, true);
  };

  const openProjectSession = (sessionId: string) => {
    if (!resolvedProject) return;
    setIdentitySelection(null);
    dispatchActivity({ type: "select-session", projectId: activeProject.id, sessionId });
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", caseIdForProject(activeProject));
    url.searchParams.set("sector", activeProject.sectorId);
    url.searchParams.set("client", activeProject.clientId);
    url.searchParams.set("project", activeProject.id);
    url.searchParams.set("projectTab", "agents");
    url.searchParams.set("session", sessionId);
    url.searchParams.delete("projectApp");
    url.searchParams.delete("run");
    commitNavigationUrl(url);
    setView("company");
    setScope("company");
    setActiveProjectTab("agents");
    setActiveProjectApp(null);
    setActiveSessionId(sessionId);
    setActiveRunId(null);
    setOutcome(null);
  };

  const openProjectRun = (sessionId: string, runId: string) => {
    if (!resolvedProject) return;
    setIdentitySelection(null);
    const run = appRunsFor(activityState, activeProject.id).find((item) => item.id === runId && item.sessionId === sessionId);
    if (run) {
      dispatchActivity({ type: "select-session", projectId: activeProject.id, sessionId });
      dispatchActivity({ type: "select-app-run", projectId: activeProject.id, appId: run.appId, runId });
    }
    const visibleLegacyApp = applications.some((item) => item.id === view) ? view as ProjectAppId : null;
    const destinationApp = run?.appId ?? activeProjectApp ?? visibleLegacyApp;
    const preserveLegacyApp = Boolean(visibleLegacyApp && destinationApp === visibleLegacyApp);
    const preserveStudio = Boolean(activeProjectApp && destinationApp === activeProjectApp);
    const url = new URL(window.location.href);
    url.searchParams.set("view", preserveLegacyApp ? view : "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", caseIdForProject(activeProject));
    url.searchParams.set("sector", activeProject.sectorId);
    url.searchParams.set("client", activeProject.clientId);
    url.searchParams.set("project", activeProject.id);
    url.searchParams.set("projectTab", "apps");
    url.searchParams.set("session", sessionId);
    url.searchParams.set("run", runId);
    if (preserveStudio && destinationApp) url.searchParams.set("projectApp", destinationApp);
    else url.searchParams.delete("projectApp");
    const transition = preserveLegacyApp || preserveStudio ? projectSurfaceTransition() : null;
    commitNavigationUrl(url, transition?.replace ?? false, transition?.historyState ?? {});
    setView(preserveLegacyApp ? view : "company");
    setScope("company");
    setActiveProjectTab("apps");
    setActiveProjectApp(preserveStudio ? destinationApp : null);
    setActiveSessionId(sessionId);
    setActiveRunId(runId);
    setOutcome(null);
  };

  const go = (next: ViewId, navigationOptions: { historyState?: TanjxHistoryState; replace?: boolean } = {}) => {
    if (next === "company") {
      if (!resolvedProject) openWorkspaceHome();
      else {
        setView("company");
        openProjectTab(activeProjectTab);
      }
      return;
    }
    const isProjectCapability = workflowViews.some((item) => item.id === next)
      || applications.some((item) => item.id === next)
      || dataViews.some((item) => item.id === next);
    if (isProjectCapability && (scope !== "company" || !resolvedProject)) {
      completeAction("Select a project", `${viewLabels[next]} is available only inside a client project. No project or capability was opened.`, "PROJECT-CONTEXT", "Blocked");
      return;
    }
    const requiredCapability = capabilityForProjectView(next);
    if (requiredCapability && !requireActiveProjectCapability(requiredCapability)) return;
    if (resolvedProject && (next === "case" || next === "action") && !hasProjectDecision) {
      completeAction("Decision workspace unavailable", "Create the first project decision brief before opening analysis or review. No case was synthesized or opened.", "DECISION-ZERO-STATE", "Blocked");
      return;
    }
    if (resolvedProject && applications.some((item) => item.id === next) && !effectiveMountedApps.includes(next as ProjectAppId)) {
      completeAction("Application unavailable", `${viewLabels[next]} is not mounted to ${activeProject.name}. No specialist workspace was opened.`, "APP-NOT-MOUNTED", "Blocked");
      return;
    }
    if (resolvedProject && (next === "decisions" || next === "agents" || next === "graph")) {
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
    setActiveProjectApp(null);
    setActiveSessionId(null);
    setActiveRunId(null);
    if (nextScope !== "company") {
      setActiveProjectId("");
      setActiveProjectTab("overview");
      setActiveProjectApp(null);
    }
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    if (nextScope !== scope) setOutcome(null);
    if (nextScope !== "company") setIdentitySelection(null);
    pushNavigation(next, nextScope, nextCaseId, navigationOptions.historyState ?? {}, navigationOptions.replace ?? false);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const openCase = (caseId: string, destination: "case" | "action" = "case") => {
    if (!resolvedProject) {
      completeAction("Select a project", "Decisions and reviews are available only inside a client project. No case was opened.", "PROJECT-CONTEXT", "Blocked");
      return;
    }
    if (!requireActiveProjectCapability("decisions.view")) return;
    if (!hasProjectDecision || !projectCase) {
      completeAction("Decision workspace unavailable", "This project has no decision brief yet. Start from the Decisions tab; no synthetic case was substituted.", "DECISION-ZERO-STATE", "Blocked");
      return;
    }
    const item = caseId === projectCase.id ? projectCase : cases.find((candidate) => candidate.id === caseId) ?? projectCase;
    if (item.scope !== scope) setNetworkSelection(null);
    setSelectedCaseId(item.scope === "company" ? activeCase.id : item.id);
    setScope(item.scope);
    setView(destination);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    const transition = projectSurfaceTransition();
    pushNavigation(destination, item.scope, item.scope === "company" ? activeCase.id : item.id, transition.historyState, transition.replace);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const updateCase = (caseId: string, patch: Partial<DecisionCase>, message: string) => {
    if (scope === "company") {
      const requiredCapability: ProjectCapability = patch.stage === "Execute" ? "decisions.approve" : "decisions.draft";
      if (!requireActiveProjectCapability(requiredCapability)) return;
      const key = projectCaseKey;
      setProjectCasePatches((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    } else {
      setCases((current) => current.map((item) => item.id === caseId ? { ...item, ...patch } : item));
    }
    completeAction("Case updated", message, scope === "company" ? `${activeProject.code}:${caseId}` : caseId, "Saved");
  };

  const openProject = (projectId: string, catalog: readonly WorkspaceProject[] = projectCatalog, memberships: readonly ProjectMembership[] = membershipCatalog) => {
    const project = catalog.find((item) => item.id === projectId);
    if (!project) {
      completeAction("Project open blocked", `No governed project matched '${projectId}'. No client fallback was substituted.`, "PROJECT-NOT-FOUND", "Blocked");
      return;
    }
    const access = evaluateProjectAccess(project.id, signedInCollaboratorId, "project.view", memberships);
    if (!access.allowed) {
      completeAction("Project access blocked", access.reason, access.policyRef, "Blocked", "Workspace access control");
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
    url.searchParams.delete("projectApp");
    url.searchParams.delete("session");
    url.searchParams.delete("run");
    commitNavigationUrl(url);
    setScope("company");
    setView("company");
    setSelectedCaseId(nextCaseId);
    setActiveProjectId(project.id);
    setActiveProjectTab("overview");
    setActiveProjectApp(null);
    setActiveSessionId(null);
    setActiveRunId(null);
    setNetworkSelection(null);
    const pathKeys = projectPathKeys(project, projectPathMode);
    setCollapsedSidebarRoots((current) => current.filter((key) => key !== pathKeys.root));
    setCollapsedSidebarBranches((current) => current.filter((key) => key !== pathKeys.branch));
    setExpandedSidebarRoots((current) => current.includes(pathKeys.root) ? current : [...current, pathKeys.root]);
    setExpandedSidebarBranches((current) => current.includes(pathKeys.branch) ? current : [...current, pathKeys.branch]);
    setProjectNavQuery("");
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
    setIdentitySelection(null);
  };

  const toggleRailDensity = () => {
    if (drawerMode) {
      setMobileOpen(false);
      return;
    }
    setRailCollapsed(!railCollapsed);
  };

  const openMountedProjectApp = (appId: ProjectAppId) => {
    if (!resolvedProject || !effectiveMountedApps.includes(appId)) {
      completeAction("Application unavailable", "Select a mounted application inside an accessible project.", "APP-NOT-MOUNTED", "Blocked");
      return;
    }
    if (!projectHasDataContract(activeProject)) {
      completeAction("Application open blocked", `${projectApps.find((item) => item.id === appId)?.name ?? "This application"} is mounted, but ${activeProject.name} has no governed variable mapping or data contract yet. Complete Data setup first.`, `APP-${activeProject.code}-${appId.toUpperCase()}-DATA-REQUIRED`, "Blocked");
      return;
    }
    const transition = projectSurfaceTransition();
    if (applications.some((item) => item.id === appId)) {
      go(appId as AppId, transition);
      return;
    }
    if (!requireActiveProjectCapability("apps.view")) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("case", caseIdForProject(activeProject));
    url.searchParams.set("sector", activeProject.sectorId);
    url.searchParams.set("client", activeProject.clientId);
    url.searchParams.set("project", activeProject.id);
    url.searchParams.set("projectTab", "apps");
    url.searchParams.set("projectApp", appId);
    url.searchParams.delete("session");
    url.searchParams.delete("run");
    commitNavigationUrl(url, transition.replace, transition.historyState);
    setView("company");
    setScope("company");
    setActiveProjectTab("apps");
    setActiveProjectApp(appId);
    setActiveSessionId(null);
    setActiveRunId(null);
    setOutcome(null);
  };

  const startOnboarding = (mode: "client" | "project", clientId?: string) => {
    setOnboardingMode(mode);
    setOnboardingStep(0);
    if (mode === "client") {
      setClientDraft({ name: "", sector: "Mobility & EV", classification: "Client confidential", dataResidency: "Policy review required", clientLead: "Client project owner", providerLead: "Asha Rao" });
    } else {
      const selectedClient = accessibleClients.find((client) => client.id === (clientId ?? accessibleClients[0]?.id));
      setProjectDraft({ clientId: selectedClient?.id ?? "", sectorId: selectedClient?.sectorId ?? "", sector: selectedClient?.sector ?? "", name: "", problem: "", outcome: "", owner: selectedClient?.clientLead ?? "Client project owner", currency: "USD", regions: "Global", classification: "", dataResidency: "" });
    }
    setMobileOpen(false);
  };

  const saveClientDraft = (draft: SessionClientDraft) => {
    try {
      const client = createSessionClient(draft, clientCatalog);
      const collaborators = createSessionCollaborators(client, collaboratorCatalog);
      setClientCatalog((current) => [...current, client]);
      setCollaboratorCatalog((current) => [...current, ...collaborators.filter((collaborator) => !current.some((existing) => existing.id === collaborator.id))]);
      setProjectDraft((current) => ({ ...current, clientId: client.id, sectorId: client.sectorId, sector: client.sector, owner: client.clientLead }));
      setOnboardingMode(null);
      completeAction("Client draft saved", `Client onboarding draft saved in this browser session for ${client.name}. No tenant, directory group, invitation, storage boundary, project, or source connection was created.`, `CLIENT-${client.id.toUpperCase()}`, "Saved");
    } catch (error) {
      completeAction("Client draft blocked", error instanceof Error ? error.message : "The client draft is incomplete.", "CLIENT-DRAFT", "Blocked");
    }
  };

  const saveProjectDraft = (draft: SessionProjectDraft) => {
    try {
      const project = createSessionProject(draft, clientCatalog, projectCatalog);
      const client = clientCatalog.find((item) => item.id === project.clientId);
      const clientCollaborator = collaboratorCatalog.find((item) => item.affiliation === "Client" && item.clientId === project.clientId && item.name === client?.clientLead);
      const tanjxCollaborator = collaboratorCatalog.find((item) => item.id === signedInCollaboratorId && item.affiliation === "tanjx")
        ?? collaboratorCatalog.find((item) => item.affiliation === "tanjx" && item.name === client?.providerLead)
        ?? collaboratorCatalog.find((item) => item.affiliation === "tanjx");
      if (!clientCollaborator || !tanjxCollaborator) throw new Error("Client and tanjx collaborator profiles are required before a project can be created.");
      const memberships = createSessionProjectMemberships(project, clientCollaborator, tanjxCollaborator);
      const nextCatalog = [...projectCatalog, project];
      const nextMemberships = [...membershipCatalog, ...memberships];
      setProjectCatalog(nextCatalog);
      setMembershipCatalog(nextMemberships);
      dispatchActivity({ type: "ensure-project", project });
      setOnboardingMode(null);
      openProject(project.id, nextCatalog, nextMemberships);
      completeAction("Project draft saved", `Project setup and two browser-session membership drafts were saved under ${project.client}. No database, identity grant, invitation, dataset, app deployment, connector, agent, or solver run was provisioned.`, `PROJECT-${project.code}`, "Saved", `${project.client} / ${project.name}`, `project:${project.id}`);
    } catch (error) {
      completeAction("Project draft blocked", error instanceof Error ? error.message : "The project draft is incomplete.", "PROJECT-DRAFT", "Blocked");
    }
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
        session: url.searchParams.get("session") ?? undefined,
        run: url.searchParams.get("run") ?? undefined,
      }, projectCatalog, activityState);
      setView(navigation.view);
      setScope(navigation.scope);
      setSelectedCaseId(navigation.caseId);
      setActiveProjectId(navigation.projectId);
      setActiveProjectTab(navigation.projectTab);
      setActiveProjectApp(navigation.projectApp);
      setActiveSessionId(navigation.sessionId);
      setActiveRunId(navigation.runId);
      const restoredProject = projectCatalog.find((project) => project.id === navigation.projectId);
      if (restoredProject) {
        const pathKeys = projectPathKeys(restoredProject, projectPathMode);
        setCollapsedSidebarRoots((current) => current.filter((key) => key !== pathKeys.root));
        setCollapsedSidebarBranches((current) => current.filter((key) => key !== pathKeys.branch));
        setExpandedSidebarRoots((current) => current.includes(pathKeys.root) ? current : [...current, pathKeys.root]);
        setExpandedSidebarBranches((current) => current.includes(pathKeys.branch) ? current : [...current, pathKeys.branch]);
      }
      setProjectNavQuery("");
      setNetworkSelection(null);
      setMobileOpen(false);
      setSearchOpen(false);
      setNotificationsOpen(false);
      setProfileOpen(false);
      setOutcome(null);
      setOnboardingMode(null);
      setIdentitySelection(null);
      commitNavigationUrl(canonicalNavigationUrl(window.location.href, navigation), true);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [activityState, projectCatalog, projectPathMode]);

  useEffect(() => {
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
      session: url.searchParams.get("session") ?? undefined,
      run: url.searchParams.get("run") ?? undefined,
    }, projectCatalog, activityState);
    commitNavigationUrl(canonicalNavigationUrl(window.location.href, navigation), true);
  }, [activityState, projectCatalog]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1040px)");
    const updateDrawerMode = () => setDrawerMode(media.matches);
    updateDrawerMode();
    media.addEventListener("change", updateDrawerMode);
    return () => media.removeEventListener("change", updateDrawerMode);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1180px)");
    const updateContextDensity = () => setCompactContext(media.matches);
    updateContextDensity();
    media.addEventListener("change", updateContextDensity);
    return () => media.removeEventListener("change", updateContextDensity);
  }, []);

  useEffect(() => {
    if (!activeProjectId || (drawerMode && !mobileOpen)) return;
    const timer = window.setTimeout(() => {
      mobileRailRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
    }, 30);
    return () => window.clearTimeout(timer);
  }, [activeProjectId, drawerMode, mobileOpen, mobileRailRef, projectPathMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('[aria-modal="true"]')) return;
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']") ?? false;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (!isTyping && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (drawerMode) setMobileOpen((current) => !current);
        else setRailCollapsed(!railCollapsed);
      }
      if (event.key === "Escape") {
        const restoreProfileFocus = profileOpen;
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
        setOutcome(null);
        setOnboardingMode(null);
        setIdentitySelection(null);
        if (restoreProfileFocus) window.setTimeout(() => profileButtonRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerMode, profileOpen, railCollapsed, setRailCollapsed]);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 20);
  }, [searchOpen]);

  useEffect(() => {
    if (profileOpen) window.setTimeout(() => profilePanelRef.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus(), 20);
  }, [profileOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentProjectSurface = (() => {
    if (view === "company") {
      if (activeProjectApp) return projectApps.find((app) => app.id === activeProjectApp)?.name ?? "Application";
      return workspaceTabs.find((item) => item.id === activeProjectTab)?.label
        ?? (activeProjectTab === "apps" ? "Apps" : activeProjectTab === "graph" ? "Data & graph" : activeProjectTab === "agents" ? "Playground" : "Overview");
    }
    return applications.find((app) => app.id === view)?.name
      ?? workflowViews.find((item) => item.id === view)?.label
      ?? dataViews.find((item) => item.id === view)?.label
      ?? viewLabels[view];
  })();
  const activeMountedAppId = activeProjectApp
    ?? (applications.some((app) => app.id === view) ? view as ProjectAppId : null);
  const projectApplicationOpen = view !== "company" || Boolean(activeProjectApp);
  const mountedAppPreviewLimit = compactContext ? 4 : effectiveMountedApps.length;
  const defaultVisibleMountedApps = effectiveMountedApps.slice(0, mountedAppPreviewLimit);
  const visibleMountedApps = activeMountedAppId && effectiveMountedApps.includes(activeMountedAppId) && !defaultVisibleMountedApps.includes(activeMountedAppId)
    ? [...defaultVisibleMountedApps.slice(0, Math.max(0, mountedAppPreviewLimit - 1)), activeMountedAppId]
    : defaultVisibleMountedApps;
  const hiddenMountedAppCount = Math.max(0, effectiveMountedApps.length - visibleMountedApps.length);
  return (
    <div className={`platform-shell theme-${workspaceTheme} ${railCollapsed ? "rail-collapsed" : ""}`} data-theme={workspaceTheme}>
      {mobileOpen && <button className="mobile-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside ref={mobileRailRef} className={`side-rail ${mobileOpen ? "open" : ""}`} inert={drawerMode && !mobileOpen ? true : undefined} aria-hidden={drawerMode && !mobileOpen ? true : undefined} role={drawerMode ? "dialog" : undefined} aria-modal={drawerMode && mobileOpen ? true : undefined} aria-label={drawerMode ? "Project navigation" : undefined} tabIndex={drawerMode ? -1 : undefined}>
        <header className="brand-block"><button data-action-id="nav.brand" className="brand" type="button" onClick={openWorkspaceHome} aria-label="Open tanjx workspace"><BrandMark /><div><b>tanjx</b><small>Tangent + Exchange</small></div></button><button className="rail-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button></header>
        <div className="rail-quick-actions" aria-label="Workspace setup and navigation controls">
          <button data-action-id="nav.onboard-client" type="button" aria-label="Onboard a new client" title="Onboard a new client" onClick={() => startOnboarding("client")}><span>＋</span><b>New client</b></button>
          <button data-action-id="nav.new-project" type="button" aria-label="Create a new project" title="Create a new project" onClick={() => startOnboarding("project")}><span>＋</span><b>New project</b></button>
          <button data-action-id="nav.collapse" type="button" aria-expanded={drawerMode ? mobileOpen : !railCollapsed} aria-controls="tanjx-primary-navigation" onClick={toggleRailDensity} title={drawerMode ? "Close navigation" : railCollapsed ? "Expand navigation" : "Collapse navigation"} aria-label={drawerMode ? "Close project navigation" : railCollapsed ? "Expand project navigation" : "Collapse project navigation"}><span>{drawerMode ? "×" : railCollapsed ? "›" : "‹"}</span><b>{drawerMode ? "Close" : railCollapsed ? "Expand" : "Collapse"}</b></button>
        </div>

        <nav id="tanjx-primary-navigation" aria-label="Main navigation">
          <section className="nav-section workspace-primary-nav">
            <p>Workspace</p>
            <button data-action-id="nav.workspace" className={`scope-nav ${scope === "company" && !resolvedProject ? "active" : ""}`} type="button" aria-label="Open clients and projects" title="Clients and projects" onClick={openWorkspaceHome}><span>⌂</span><div><b>Clients &amp; projects</b><small>Client workspaces and towers</small></div><i>›</i></button>
            <button data-action-id="nav.operations-world" className={`scope-nav ${scope === "global" || scope === "region" ? "active" : ""}`} type="button" aria-label="Open Operations World" title="Operations World" onClick={() => go("global")}><span>◎</span><div><b>Operations World</b><small>Global and regional network</small></div><i>›</i></button>
          </section>
          <section className="nav-section sidebar-projects">
            <div className="sidebar-section-heading"><p>Project path</p><span>{sidebarPathGroups.reduce((count, group) => count + group.projects.length, 0)} shown</span></div>
            <div className="project-path-toggle sidebar-path-toggle" role="group" aria-label="Project hierarchy order">
              <button data-action-id="nav.path.client" className={projectPathMode === "client" ? "active" : ""} type="button" aria-pressed={projectPathMode === "client"} onClick={() => setProjectPathMode("client")}>By client</button>
              <button data-action-id="nav.path.tower" className={projectPathMode === "tower" ? "active" : ""} type="button" aria-pressed={projectPathMode === "tower"} onClick={() => setProjectPathMode("tower")}>By tower</button>
            </div>
            <label className="sidebar-path-search"><span aria-hidden="true">⌕</span><span className="sr-only">Find a client, tower, or project</span><input value={projectNavQuery} onChange={(event) => setProjectNavQuery(event.target.value)} placeholder="Find client, tower, project" />{projectNavQueryActive && <button data-action-id="nav.path.clear-search" type="button" aria-label="Clear project search" onClick={() => setProjectNavQuery("")}>×</button>}</label>
            <div className="sidebar-path-tree">
              {sidebarPathGroups.map((group) => {
                const rootContainsActive = group.projects.some((project) => project.id === resolvedProject?.id)
                  || group.branches.some((branch) => branch.projects.some((project) => project.id === resolvedProject?.id));
                const rootOpen = projectNavQueryActive || (!collapsedSidebarRoots.includes(group.key) && (expandedSidebarRoots.includes(group.key) || rootContainsActive));
                const rootPanelId = `nav-${group.key.replaceAll(":", "-")}`;
                return <section key={group.key} className={`sidebar-path-root path-root-${group.kind} ${rootOpen ? "open" : ""}`}>
                  <button data-action-id={`nav.path.root.${group.key}`} className={rootContainsActive ? "active-context" : ""} type="button" aria-expanded={rootOpen} aria-controls={rootPanelId} disabled={projectNavQueryActive} onClick={() => { if (rootOpen) { setCollapsedSidebarRoots((current) => current.includes(group.key) ? current : [...current, group.key]); setExpandedSidebarRoots((current) => current.filter((item) => item !== group.key)); } else { setCollapsedSidebarRoots((current) => current.filter((item) => item !== group.key)); setExpandedSidebarRoots((current) => current.includes(group.key) ? current : [...current, group.key]); } }}><span>{group.kind === "client" ? "C" : "T"}</span><b>{group.label}</b><em>{group.projects.length}</em><i>{rootOpen ? "−" : "+"}</i></button>
                  {rootOpen && <div className="sidebar-path-branches" id={rootPanelId}>
                    {group.branches.map((branch) => {
                      const branchContainsActive = branch.projects.some((project) => project.id === resolvedProject?.id);
                      const branchOpen = projectNavQueryActive || (!collapsedSidebarBranches.includes(branch.key) && (expandedSidebarBranches.includes(branch.key) || branchContainsActive));
                      const branchPanelId = `nav-${branch.key.replaceAll(":", "-")}`;
                      return <section key={branch.key} className={`sidebar-path-branch path-branch-${branch.kind} ${branchOpen ? "open" : ""}`}>
                        <button data-action-id={`nav.path.branch.${branch.key}`} className={branchContainsActive ? "active-context" : ""} type="button" aria-expanded={branchOpen} aria-controls={branchPanelId} disabled={projectNavQueryActive} onClick={() => { if (branchOpen) { setCollapsedSidebarBranches((current) => current.includes(branch.key) ? current : [...current, branch.key]); setExpandedSidebarBranches((current) => current.filter((item) => item !== branch.key)); } else { setCollapsedSidebarBranches((current) => current.filter((item) => item !== branch.key)); setExpandedSidebarBranches((current) => current.includes(branch.key) ? current : [...current, branch.key]); } }}><span>{branch.kind === "client" ? "Client" : "Tower"}</span><b>{branch.label}</b><i>{branchOpen ? "−" : "+"}</i></button>
                        {branchOpen && <div className="sidebar-project-leaves" id={branchPanelId}>{branch.projects.map((project) => <button data-action-id={`nav.project.${project.id}`} className={`sidebar-project ${resolvedProject?.id === project.id ? "active" : ""}`} type="button" aria-current={resolvedProject?.id === project.id ? "page" : undefined} key={project.id} onClick={() => openProject(project.id)}><span className={`project-health health-${project.health}`} /><div><b>{project.name}</b><small>{project.code}</small></div><em>›</em></button>)}{!branch.projects.length && <button data-action-id={`nav.path.empty.${branch.id}`} className="sidebar-empty-project" type="button" onClick={() => startOnboarding("project", branch.id)}>Create first project</button>}</div>}
                      </section>;
                    })}
                    {!group.branches.length && <button data-action-id={`nav.path.empty.${group.id}`} className="sidebar-empty-project" type="button" onClick={() => startOnboarding("project", group.id)}>Create first project</button>}
                  </div>}
                </section>;
              })}
              {!sidebarPathGroups.length && <div className="sidebar-path-empty"><b>No matches</b><span>Try a client, tower, project code, or problem.</span><button data-action-id="nav.path.reset-search" type="button" onClick={() => setProjectNavQuery("")}>Clear search</button></div>}
            </div>
          </section>
        </nav>
      </aside>

      <div className="main-shell">
        <div className="shell-chrome">
          <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="tanjx-primary-navigation" onClick={() => setMobileOpen(true)}>☰</button>
          <nav className="breadcrumb" aria-label="Breadcrumb" title={resolvedProject ? `Workspace / ${projectPath.map((segment) => segment.label).join(" / ")}` : undefined}><button data-action-id="breadcrumb.workspace" type="button" onClick={openWorkspaceHome}>Workspace</button>{resolvedProject && activeProjectViewAccess?.allowed && projectPath.map((segment, index) => <span className="breadcrumb-segment" key={`${segment.kind}:${segment.id}`}><i>/</i>{index === projectPath.length - 1 ? <b aria-current="page">{segment.label}</b> : <span className="breadcrumb-label">{segment.label}</span>}</span>)}{resolvedProject && !activeProjectViewAccess?.allowed && <><i>/</i><b>Access required</b></>}{!resolvedProject && scope !== "company" && <><i>/</i><b>Operations World</b></>}</nav>
          <div className="topbar-actions">
            <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)}><span>⌕</span><b>Search workspace</b><kbd>⌘ K</kbd></button>
            <button data-action-id="theme.toggle" className="topbar-icon theme-toggle" type="button" aria-label={`Switch to ${workspaceTheme === "light" ? "dark" : "light"} mode`} title={`Switch to ${workspaceTheme === "light" ? "dark" : "light"} mode`} aria-pressed={workspaceTheme === "dark"} onClick={() => setWorkspaceTheme(workspaceTheme === "light" ? "dark" : "light")}><span aria-hidden="true">{workspaceTheme === "light" ? "◐" : "☀"}</span></button>
            <button className="topbar-icon" type="button" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}>◌<em>{notificationItems.length}</em></button>
            <button ref={profileButtonRef} data-action-id="profile.toggle" className="user-button" type="button" aria-label={`Open account menu for ${signedInCollaborator?.name ?? "Asha Rao"}`} title={`Account · ${signedInCollaborator?.name ?? "Asha Rao"}`} aria-expanded={profileOpen} aria-controls="tanjx-profile-panel" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}><span>{signedInCollaborator?.initials ?? "AR"}</span><div><b>{signedInCollaborator?.name ?? "Asha Rao"}</b><small>{signedInCollaborator?.organization ?? "Tangent + Exchange"}</small></div></button>
          </div>
          {notificationsOpen && <aside className="notification-panel"><header><div><p className="kicker">ACTIVITY</p><h2>Recent project work</h2></div><button data-action-id="notifications.close" type="button" onClick={() => setNotificationsOpen(false)}>×</button></header>{notificationItems.map((item) => <button data-action-id={`notifications.open.${item.caseId}.${item.tone}`} type="button" key={`${item.caseId}-${item.tone}`} onClick={() => "projectId" in item && item.projectId ? openProject(item.projectId) : openCase(item.caseId)}><i className={`tone-${item.tone}`} /><span><b>{item.title}</b><small>{item.detail}</small></span><em>›</em></button>)}</aside>}
          {profileOpen && <aside ref={profilePanelRef} id="tanjx-profile-panel" className="profile-panel" aria-label="User menu"><header><span>{signedInCollaborator?.initials ?? "AR"}</span><div><b>{signedInCollaborator?.name ?? "Asha Rao"}</b><small>{signedInCollaborator ? `${signedInCollaborator.role} · ${signedInCollaborator.organization}` : "Identity unavailable"}</small></div></header><button data-action-id="profile.open-workspace" type="button" onClick={() => { setProfileOpen(false); if (canViewActiveProject) openProject(activeProject.id); else openWorkspaceHome(); }}><b>{canViewActiveProject ? "Open active project" : "Open workspace"}</b><small>{canViewActiveProject ? `${activeProject.client} · ${activeProject.name}` : `${accessibleProjects.length} accessible projects`}</small><i>›</i></button><button data-action-id="profile.open-receipts" type="button" disabled={!outcomeLedger.length} onClick={() => { setProfileOpen(false); setOutcome(outcomeLedger[0] ?? null); }}><b>Session receipts</b><small>{outcomeLedger.length ? `${outcomeLedger.length} browser-session receipts` : "No receipts recorded yet"}</small><i>›</i></button><button data-action-id="profile.decision-rights" type="button" onClick={() => { setProfileOpen(false); completeAction("Project rights opened", signedInProjectMembership && canViewActiveProject ? `${signedInCollaborator?.name ?? "Signed-in collaborator"} is ${signedInProjectMembership.projectRole} in ${activeProject.name} with ${signedInProjectMembership.capabilities.length} declared session capabilities.` : "Select an accessible project to inspect the signed-in collaborator's project-scoped rights.", canViewActiveProject ? signedInProjectMembership?.id ?? "RIGHTS-NO-PROJECT" : "RIGHTS-NO-PROJECT", "Saved"); }}><b>Project rights</b><small>{canViewActiveProject ? signedInProjectMembership?.projectRole ?? "No project membership" : "Select an accessible project"}</small><i>›</i></button><button data-action-id="profile.signout" type="button" onClick={() => { setProfileOpen(false); completeAction("Sign out unavailable", "Authentication is not configured for this workspace. No session was ended.", "AUTH-FUTURE", "Blocked"); }}><b>Sign out</b><small>Not configured</small><i>!</i></button></aside>}
          </header>

          {canViewActiveProject && <section className="project-context-stack" aria-label="Current project work context">
            <div className="project-context-bar" aria-label="Mounted project applications">
              <div className="mobile-project-path" aria-label={`Current project path: ${projectPath.map((segment) => segment.label).join(" / ")}`} title={projectPath.map((segment) => segment.label).join(" / ")}><span>{projectPath.slice(0, -1).map((segment) => segment.label).join(" / ")}</span><b>{projectPath[projectPath.length - 1]?.label ?? activeProject.name}</b></div>
              <div className={`context-current ${projectApplicationOpen ? "application-context" : ""}`} aria-current="page"><span>{projectApplicationOpen ? "APPLICATION" : "YOU ARE HERE"}</span><b>{currentProjectSurface}</b><small>{activeProject.code}</small></div>
              <div className="context-mounted-apps" aria-label="Mounted project applications">
                {projectApplicationOpen && <button data-action-id="context.back-to-project" className="context-back-button" type="button" onClick={returnFromProjectApp}><span aria-hidden="true">←</span><b>Back to project</b></button>}
                <button data-action-id="context.open-apps" className={`context-group-home ${view === "company" && activeProjectTab === "apps" && !activeProjectApp ? "active" : ""}`} type="button" aria-current={view === "company" && activeProjectTab === "apps" && !activeProjectApp ? "page" : undefined} onClick={() => openProjectTab("apps")}><b>Apps</b><small>{effectiveMountedApps.length}</small></button>
                {visibleMountedApps.map((appId) => { const app = projectApps.find((item) => item.id === appId)!; const active = activeProjectApp === appId || view === appId; return <button data-action-id={`context.open-app.${appId}`} className={active ? "active" : ""} style={{ "--context-app-accent": app.accent } as React.CSSProperties} type="button" title={`Open ${app.name}`} aria-label={`Open mounted application ${app.name}`} key={appId} onClick={() => openMountedProjectApp(appId)}><AppGlyph appId={appId} /><b>{app.name}</b></button>; })}
                {hiddenMountedAppCount > 0 && <button data-action-id="context.open-apps.more" className="context-more" type="button" aria-label={`Open Apps to view ${hiddenMountedAppCount} more mounted applications`} title={`${hiddenMountedAppCount} more mounted apps`} onClick={() => openProjectTab("apps")}>+{hiddenMountedAppCount}</button>}
              </div>
            </div>
            <div className="project-people-bar" aria-label="Project agents and team">
              <div className="context-identity-tools context-agent-tools" aria-label="Project agents">
                <button data-action-id="context.agents" className="context-identity-home" type="button" disabled={!activeProjectAgents.length} title={activeProjectAgents.map((agent) => agent.name).join(", ")} onClick={() => activeProjectAgents[0] && setIdentitySelection({ kind: "agent", id: activeProjectAgents[0].id })}><b>Agents</b><small>{activeProjectAgents.length}</small></button>
                {activeProjectAgents.map((agent) => <button data-action-id={`context.agent.${agent.id}`} className={identitySelection?.kind === "agent" && identitySelection.id === agent.id ? "active" : ""} type="button" title={`${agent.name} · ${agent.role}`} aria-label={`Open accountability record for agent ${agent.name}`} key={agent.id} onClick={() => setIdentitySelection({ kind: "agent", id: agent.id })}><IdentityAvatar id={agent.id} name={agent.name} /><b>{agent.name.replace("Project ", "").replace("Supplier ", "").split(" ")[0]}</b></button>)}
              </div>
              <div className="context-identity-tools context-team-tools" aria-label="Project team">
                <button data-action-id="context.team" className="context-identity-home" type="button" disabled={!activeProjectMembers.length} title={activeProjectMembers.map((item) => item.collaborator.name).join(", ")} onClick={() => activeProjectMembers[0] && setIdentitySelection({ kind: "member", id: activeProjectMembers[0].collaborator.id })}><b>Team</b><small>{activeProjectMembers.length}</small></button>
                {activeProjectMembers.map(({ collaborator }) => <button data-action-id={`context.member.${collaborator.id}`} className={identitySelection?.kind === "member" && identitySelection.id === collaborator.id ? "active" : ""} type="button" title={`${collaborator.name} · ${collaborator.role}`} aria-label={`Open accountability record for team member ${collaborator.name}`} key={collaborator.id} onClick={() => setIdentitySelection({ kind: "member", id: collaborator.id })}><IdentityAvatar id={collaborator.id} name={collaborator.name} initials={collaborator.initials} /><b>{collaborator.name.split(" ").at(-1)}</b></button>)}
              </div>
            </div>
          </section>}
          <div className="statusbar">{canViewActiveProject ? <><span><i className="status-fixture" />{activeProject.stage}</span><span>{activeProject.client}</span><span>{activeProject.counts.observations} fixture observations</span><span>{membershipCatalog.filter((item) => item.projectId === activeProject.id).length} collaborators · project context</span></> : resolvedProject && scope === "company" ? <><span><i className="status-fixture" />Access required</span><span>Project boundary enforced</span></> : scope === "company" ? <><span><i className="status-fixture" />Workspace</span><span>{accessibleClients.length} clients</span><span>{accessibleProjects.length} projects</span><span>{workspaceCollaboratorViews.length} collaborator profiles</span></> : <><span><i className="status-fixture" />Operations World</span><span>{scope === "global" ? "Global" : operationsRegion}</span><span>2,164 synthetic movements</span><span>Evidence-linked fixture</span></>}</div>
        </div>

        <main className="main-content">
          {resolvedProject && scope === "company" && deniedProjectAccess ? (
            <ProjectAccessBoundary decision={deniedProjectAccess} onWorkspace={openWorkspaceHome} onReceipt={() => completeAction("Project access blocked", deniedProjectAccess.reason, deniedProjectAccess.policyRef, "Blocked", "Workspace access control")} />
          ) : view === "company" && resolvedProject ? (
            <ProjectWorkspace key={activeProject.id} projects={projectCatalog} collaborators={collaboratorCatalog} memberships={membershipCatalog} activeCollaboratorId={signedInCollaboratorId} initialProjectId={activeProject.id} initialTab={activeProjectTab} initialApp={activeProjectApp} initialSessionId={activeSessionId} initialRunId={activeRunId} activityState={activityState} dispatchActivity={dispatchActivity} onMountedAppsChange={handleMountedAppsChange} onAgentRosterChange={handleAgentRosterChange} onProjectSetupChange={handleProjectSetupChange} onTabChange={(tab) => openProjectTab(tab)} onStudioChange={openMountedProjectApp} onSessionChange={openProjectSession} onRunChange={openProjectRun} onOpenApp={openMountedProjectApp} onOpenCase={() => openCase(activeCase.id)} onOutcome={completeAction} />
          ) : view === "company" ? (
            <WorkspaceHome projects={accessibleProjects} clients={accessibleClients} collaborators={workspaceCollaboratorViews} onOpenProject={(project) => openProject(project.id)} onOnboardClient={() => startOnboarding("client")} onCreateProject={(client) => startOnboarding("project", client?.id)} onOpenOperationsWorld={() => go("global")} />
          ) : view === "global" || view === "region" ? (
            <ScopeDashboard key={snapshot.id} snapshot={snapshot} projects={accessibleProjects} worldScope={view} region={operationsRegion} horizon={horizon} category={category} onHorizonChange={setHorizon} onCategoryChange={setCategory} onScopeChange={(next) => go(next)} onRegionChange={setOperationsRegion} onOpenProject={openProject} onAddToProject={(selection) => {
              startOnboarding("project");
              if (!selection) return;
              const intent = selection.intake ?? "dependency";
              const intentCopy = intent === "route"
                ? { problem: `Replan ${selection.label} for frame ${selection.frame} under the ${selection.scenario} scenario.`, outcome: `Prepare a governed route response for ${selection.label}.` }
                : intent === "value"
                  ? { problem: `Trace value exposure connected to ${selection.kind} ${selection.label} under the ${selection.scenario} scenario.`, outcome: `Prepare a governed value-protection response for ${selection.label}.` }
                  : { problem: `Assess dependency risk around ${selection.kind} ${selection.label} under the ${selection.scenario} scenario.`, outcome: `Prepare a governed dependency response for ${selection.label}.` };
              setProjectDraft((current) => ({
                ...current,
                ...intentCopy,
                operationsWorldIntake: {
                  intent,
                  selectedKind: selection.kind,
                  selectedId: selection.id,
                  selectedLabel: selection.label,
                  frame: selection.frame,
                  scenario: selection.scenario,
                },
              }));
            }} onTrace={(title, detail, artifact, context) => completeAction(title, detail, artifact, "Saved", context)} onRefresh={(context) => completeAction("Snapshot reconciled", "The fixed synthetic snapshot was reconciled; no source systems were contacted.", "SNAPSHOT-DEMO-01", "Completed", context)} />
          ) : resolvedProject && workflowViews.some((item) => item.id === view) ? (
            <DecisionWorkspaces key={`workflow:${activeProject.id}:${view}`} view={view as WorkflowViewId} cases={visibleCases} activeCase={activeCase} scopeLabel={`${activeProject.client} / ${activeProject.name}`} financeReviewer={humanExperts[(projectCatalog.indexOf(activeProject) + 2) % humanExperts.length].name} executiveReviewer={humanExperts[(projectCatalog.indexOf(activeProject) + 3) % humanExperts.length].name} onOpenCase={openCase} onOpenApp={(app) => app === "graph" ? go("graph") : openMountedProjectApp(app)} onUpdateCase={updateCase} onToast={(message) => completeAction("Decision interaction recorded", message, "DECISION-INTERACTION", interactionStatus(message))} />
          ) : resolvedProject && applications.some((item) => item.id === view) ? (
            <div className="application-session-surface"><ApplicationViews key={`application:${activeProject.id}:${view}`} app={view as AppId} project={activeProject} snapshot={snapshot} activeCase={activeCase} networkSelection={networkSelection} onClearNetworkSelection={() => setNetworkSelection(null)} onOpenCase={() => openCase(activeCase.id)} onOpenAction={() => openCase(activeCase.id, "action")} onOpenAgents={() => go("agents")} onOpenGraph={() => go("graph")} onToast={(message) => completeAction("Application interaction recorded", message, "APPLICATION-INTERACTION", interactionStatus(message))} /><AppRunHistory key={activeRunId ?? `application-${view}`} project={activeProject} runs={appRunsFor(activityState, activeProject.id, view as ProjectAppId)} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={openMountedProjectApp} onOpenSession={openProjectSession} onEvidence={(target) => { const ref = typeof target === "string" ? target : target.id; completeAction("Application evidence opened", `${ref} was opened from the selected application run.`, ref, "Saved", `${activeProject.client} / ${activeProject.name}`); }} onOutcome={completeAction} canRun={evaluateProjectAccess(activeProject.id, signedInCollaboratorId, "agents.run", membershipCatalog).allowed && projectHasDataContract(activeProject)} runBlockedReason={!projectHasDataContract(activeProject) ? "Complete Data & graph setup before starting an application run." : undefined} focusedRunId={activeRunId} initialAppId={view as ProjectAppId} onRunChange={openProjectRun} /></div>
          ) : resolvedProject ? (
            <DataOperations key={`data:${activeProject.id}:${view}`} view={view as DataViewId} snapshot={snapshot} onOpenApp={openMountedProjectApp} onToast={(message) => completeAction("Data interaction recorded", message, "DATA-INTERACTION", interactionStatus(message))} />
          ) : <WorkspaceHome projects={accessibleProjects} clients={accessibleClients} collaborators={workspaceCollaboratorViews} onOpenProject={(project) => openProject(project.id)} onOnboardClient={() => startOnboarding("client")} onCreateProject={(client) => startOnboarding("project", client?.id)} onOpenOperationsWorld={() => go("global")} />}
        </main>

        <footer className="app-footer"><span>tanjx · Tangent + Exchange</span><span>{canViewActiveProject ? `${activeProject.client} / ${activeProject.name}` : resolvedProject && scope === "company" ? "Project access required" : scope === "company" ? `${accessibleProjects.length} projects` : `Operations World / ${scope === "global" ? "Global" : operationsRegion}`}</span></footer>
      </div>

      {canViewActiveProject && <WorkIdentityInspector
        project={activeProject}
        selection={identitySelection}
        agents={activeProjectAgents}
        members={activeProjectMembers}
        sessions={activeWorkSessions}
        activities={activeProjectActivities}
        appRuns={activeProjectRuns}
        onClose={() => setIdentitySelection(null)}
        onOpenSession={openProjectSession}
        onOpenRun={openProjectRun}
        onReceipt={(title, detail, artifact) => completeAction(title, detail, artifact, "Saved", `${activeProject.client} / ${activeProject.name}`)}
      />}

      {searchOpen && <div className="overlay" role="presentation" data-modal-root><button className="overlay-dismiss" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section ref={searchDialogRef} className="search-dialog" role="dialog" aria-modal="true" aria-label="Search tanjx workspace" tabIndex={-1}><div className="search-input"><span>⌕</span><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects, clients, and project capabilities…" /><kbd>ESC</kbd></div><div className="search-context"><span>{searchResults.length} results</span><b>{canViewActiveProject ? `${activeProject.client} / ${activeProject.name}` : scope === "company" ? "Workspace" : `Operations World / ${scope === "region" ? operationsRegion : snapshot.shortLabel}`}</b></div><div className="search-results">{searchResults.map((result, index) => <button data-action-id={`search.open.${result.id}.${result.projectId ?? result.caseId ?? index}`} type="button" key={`${result.id}-${result.caseId ?? result.projectId ?? index}`} onClick={() => result.projectId ? openProject(result.projectId) : result.caseId ? openCase(result.caseId) : result.id === "company" ? openWorkspaceHome() : applications.some((app) => app.id === result.id) ? openMountedProjectApp(result.id as ProjectAppId) : go(result.id)}><span>{result.group}</span><div><b>{result.label}</b><small>{result.detail}</small></div><i>›</i></button>)}</div></section></div>}
      <WorkspaceOnboarding open={onboardingMode !== null} mode={onboardingMode ?? "client"} step={onboardingStep} clients={accessibleClients} clientDraft={clientDraft} projectDraft={projectDraft} onModeChange={(mode) => startOnboarding(mode)} onStepChange={setOnboardingStep} onClientDraftChange={setClientDraft} onProjectDraftChange={setProjectDraft} onClose={() => setOnboardingMode(null)} onSubmitClient={saveClientDraft} onSubmitProject={saveProjectDraft} />
      {outcome && <div className="action-outcome-overlay" role="presentation" data-modal-root><button data-action-id="outcome.dismiss" className="action-outcome-scrim" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)} /><aside ref={outcomeDialogRef} className="action-outcome" role="dialog" aria-modal="true" aria-label="Action receipt" tabIndex={-1}><header><span className={`outcome-state state-${outcome.status.toLowerCase()}`}>{outcome.status}</span><button data-action-id="outcome.close" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)}>×</button></header><p>ACTION RECEIPT · {outcome.id}</p><h2>{outcome.title}</h2><span>{outcome.detail}</span><dl><div><dt>Artifact</dt><dd>{outcome.artifact}</dd></div><div><dt>Recorded context</dt><dd>{outcome.context}</dd></div><div><dt>Recorded</dt><dd>{outcome.timestamp}</dd></div><div><dt>Execution boundary</dt><dd>Browser-session concept</dd></div></dl><section className="session-receipt-ledger"><header><b>SESSION RECEIPT LEDGER</b><span>{outcomeLedger.length} retained · browser memory only</span></header>{outcomeLedger.slice(0, 5).map((entry) => <button data-action-id={`outcome.open.${entry.id}`} type="button" key={entry.id} onClick={() => setOutcome(entry)} className={entry.id === outcome.id ? "active" : ""}><span>{entry.status}</span><b>{entry.title}</b><small>{entry.artifact}</small></button>)}</section><button data-action-id="outcome.done" className="primary-dark-action" type="button" onClick={() => setOutcome(null)}>Done</button></aside></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><DotIcon /><span>{toast}</span></div>}
    </div>
  );
}

function DotIcon() {
  return <i className="status-live" aria-hidden="true" />;
}
