"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ApplicationViews from "./ApplicationViews";
import DataOperations from "./DataOperations";
import DecisionWorkspaces from "./DecisionWorkspaces";
import ProjectWorkspace from "./ProjectWorkspace";
import ScopeDashboard, { regionalOperationsProfiles } from "./ScopeDashboard";
import WorkspaceHome from "./WorkspaceHome";
import WorkspaceOnboarding from "./WorkspaceOnboarding";
import type { MapSelectionContext } from "./WorldNetworkMap";
import type { NetworkRegion } from "./network-operations-model";
import { resolveNavigation, scopeIds, viewLabels } from "./navigation";
import {
  caseIdForProject,
  createSessionCollaborators,
  createSessionClient,
  createSessionProject,
  createSessionProjectMemberships,
  evaluateProjectAccess,
  humanExperts,
  projectMemberships,
  signedInCollaboratorId,
  workspaceClients,
  workspaceCollaborators,
  workspaceProjects,
  type ProjectAppId,
  type ProjectAccessDecision,
  type ProjectCapability,
  type ProjectMembership,
  type SessionClientDraft,
  type SessionProjectDraft,
  type WorkspaceClient,
  type WorkspaceCollaborator,
  type WorkspaceProject,
  type WorkspaceTabId,
} from "./workspace-model";
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
  { id: "agents" as const, label: "Data agents", icon: "DA", detail: "Source adapters and controls" },
  { id: "graph" as const, label: "Knowledge Graph", icon: "KG", detail: "8.4M entities" },
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
  const entityNames = [`${project.client} source network`, `${project.sector} partner cluster`, `${project.name} operating node`, `${project.regions.split("·")[0]?.trim()} demand hub`, `${project.variablePack.l0[0] ?? "Unmapped variable"} constraint`, `${project.client} inventory buffer`];
  return {
    ...base,
    label: `${project.client} workspace`, shortLabel: project.client, title: project.outcome, description: project.problem,
    context: `${project.client} · ${project.name} · ${project.classification}`, currency: project.currency,
    updated: `${project.code} synthetic snapshot · project isolated`,
    metrics: [...project.metrics.map((metric) => ({ label: metric.label, value: metric.value, detail: metric.detail, tone: metric.tone, trend: `Trace ${metric.evidenceRef}` })), { label: "Knowledge entities", value: project.counts.entities, detail: "Hydrated fixture manifest", tone: "info" as const, trend: project.code }, { label: "Expert coverage", value: String(project.counts.experts), detail: "Human expert assignments", tone: "healthy" as const, trend: `${project.counts.agents} agents` }],
    nodes: base.nodes.map((node, index) => ({ ...node, name: entityNames[index] ?? `${project.code} node ${index + 1}`, detail: `${project.name} · ${project.variablePack.l0.length ? project.variablePack.l0[index % project.variablePack.l0.length] : "Mapping pending"}` })),
    routes: base.routes.map((route, index) => ({ ...route, id: `${project.code}-R${index + 1}`, volume: project.metrics[index % project.metrics.length].value, value: project.metrics[0].value, asset: `${project.code} synthetic movement ${index + 1}` })),
    intel: base.intel.map((item, index) => ({ ...item, id: `${project.code}-INT-${index + 1}`, title: `${project.metrics[index % project.metrics.length].label}: ${project.metrics[index % project.metrics.length].detail}`, detail: `${project.problem} This is a deterministic project fixture.`, impact: project.metrics[index % project.metrics.length].value, source: `${project.code} evidence ledger` })),
    money: base.money.map((item, index) => ({ ...item, label: project.metrics[index % project.metrics.length].label, value: project.metrics[index % project.metrics.length].value, detail: project.metrics[index % project.metrics.length].detail })),
    suppliers: base.suppliers.map((supplier, index) => ({ ...supplier, name: `${project.sector} partner ${String(index + 1).padStart(2, "0")}`, category: project.variablePack.l1.length ? project.variablePack.l1[index % project.variablePack.l1.length] : "Mapping pending", spend: project.metrics[0].value, region: project.regions.split("·")[index % project.regions.split("·").length]?.trim() ?? "Project region" })),
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
    kearneyLead: "Maya Rao",
  });
  const [projectDraft, setProjectDraft] = useState<SessionProjectDraft>({
    clientId: workspaceClients[0]?.id ?? "",
    name: "",
    problem: "",
    outcome: "",
    owner: "Maya Rao",
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
  const [horizon, setHorizon] = useState("Now");
  const [category, setCategory] = useState("All categories");
  const [operationsRegion, setOperationsRegion] = useState<NetworkRegion>("APAC");
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
      { tone: "opportunity", title: `${activeProject.mountedAppIds.length} mounted apps can challenge the plan`, detail: `${activeProject.methodCodes.length} handbook method references · synthetic project fixture`, caseId: activeCase.id },
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
        ...applications.filter((item) => activeProject.mountedAppIds.includes(item.id)).map((item) => ({ id: item.id as ViewId, label: item.name, detail: `${activeProject.name} · ${item.description}`, group: "Project app" })),
        ...dataViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: activeProject.name, group: "Project capability" })),
        ...(projectCase ? [{ id: "case" as ViewId, caseId: projectCase.id, label: `${projectCase.id} · ${projectCase.title}`, detail: `${projectCase.stage} · ${projectCase.owner}`, group: "Project decision" }] : []),
      ] : []),
    ];
    const query = searchQuery.trim().toLowerCase();
    return query ? catalog.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)) : catalog;
  })();

  const completeAction = (title: string, detail = title, artifact = "SESSION-ACTIVITY", status: ActionOutcome["status"] = "Completed", contextOverride?: string) => {
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
    setOutcomeLedgers((current) => ({ ...current, [ledgerKey]: [receipt, ...(current[ledgerKey] ?? [])].slice(0, 24) }));
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

  const pushNavigation = (nextView: ViewId, nextScope: ScopeId, nextCaseId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    url.searchParams.set("scope", nextScope);
    url.searchParams.set("case", nextCaseId);
    if (nextScope === "company" && resolvedProject) {
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

  const openWorkspaceHome = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    ["case", "sector", "client", "project", "projectTab", "projectApp"].forEach((key) => url.searchParams.delete(key));
    window.history.pushState({}, "", url);
    setView("company");
    setScope("company");
    setActiveProjectId("");
    setActiveProjectTab("overview");
    setActiveProjectApp(null);
    setNetworkSelection(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setOutcome(null);
  };

  const openProjectTab = (nextTab: WorkspaceTabId) => {
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
    if (resolvedProject && applications.some((item) => item.id === next) && !activeProject.mountedAppIds.includes(next as ProjectAppId)) {
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
    if (nextScope !== "company") {
      setActiveProjectId("");
      setActiveProjectTab("overview");
      setActiveProjectApp(null);
    }
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    if (nextScope !== scope) setOutcome(null);
    pushNavigation(next, nextScope, nextCaseId);
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
    pushNavigation(destination, item.scope, item.scope === "company" ? activeCase.id : item.id);
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
  };

  const startOnboarding = (mode: "client" | "project", clientId?: string) => {
    openWorkspaceHome();
    setOnboardingMode(mode);
    setOnboardingStep(0);
    if (mode === "client") {
      setClientDraft({ name: "", sector: "Mobility & EV", classification: "Client confidential", dataResidency: "Policy review required", clientLead: "Client project owner", kearneyLead: "Maya Rao" });
    } else {
      const selectedClient = accessibleClients.find((client) => client.id === (clientId ?? accessibleClients[0]?.id));
      setProjectDraft({ clientId: selectedClient?.id ?? "", name: "", problem: "", outcome: "", owner: selectedClient?.clientLead ?? "Client project owner", currency: "USD", regions: "Global", classification: "", dataResidency: "" });
    }
    setMobileOpen(false);
  };

  const saveClientDraft = (draft: SessionClientDraft) => {
    try {
      const client = createSessionClient(draft, clientCatalog);
      const collaborators = createSessionCollaborators(client, collaboratorCatalog);
      setClientCatalog((current) => [...current, client]);
      setCollaboratorCatalog((current) => [...current, ...collaborators.filter((collaborator) => !current.some((existing) => existing.id === collaborator.id))]);
      setProjectDraft((current) => ({ ...current, clientId: client.id, owner: client.clientLead }));
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
      const kearneyCollaborator = collaboratorCatalog.find((item) => item.id === signedInCollaboratorId && item.affiliation === "Kearney")
        ?? collaboratorCatalog.find((item) => item.affiliation === "Kearney" && item.name === client?.kearneyLead)
        ?? collaboratorCatalog.find((item) => item.affiliation === "Kearney");
      if (!clientCollaborator || !kearneyCollaborator) throw new Error("Client and Kearney collaborator profiles are required before a project can be created.");
      const memberships = createSessionProjectMemberships(project, clientCollaborator, kearneyCollaborator);
      const nextCatalog = [...projectCatalog, project];
      const nextMemberships = [...membershipCatalog, ...memberships];
      setProjectCatalog(nextCatalog);
      setMembershipCatalog(nextMemberships);
      setOnboardingMode(null);
      completeAction("Project draft saved", `Project setup and two browser-session membership drafts were saved under ${project.client}. No database, identity grant, invitation, dataset, app deployment, connector, agent, or solver run was provisioned.`, `PROJECT-${project.code}`, "Saved");
      window.setTimeout(() => openProject(project.id, nextCatalog, nextMemberships), 0);
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
      }, projectCatalog);
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
  }, [projectCatalog]);

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
    document.title = `${viewLabels[view]} · Maya Workspace`;
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
        <header className="brand-block"><button data-action-id="nav.brand" className="brand" type="button" onClick={openWorkspaceHome} aria-label="Open Maya Workspace"><span>M</span><div><b>Maya</b><small>Supply network workspace</small></div></button><button className="rail-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button></header>

        <nav aria-label="Main navigation">
          <section className="nav-section workspace-primary-nav">
            <p>Workspace</p>
            <button data-action-id="nav.workspace" className={`scope-nav ${scope === "company" && !resolvedProject ? "active" : ""}`} type="button" onClick={openWorkspaceHome}><span>⌂</span><div><b>Projects</b><small>Sectors, clients, and work</small></div><i>›</i></button>
            <button data-action-id="nav.operations-world" className={`scope-nav ${scope === "global" || scope === "region" ? "active" : ""}`} type="button" onClick={() => go("global")}><span>◎</span><div><b>Operations World</b><small>Global and regional network</small></div><i>›</i></button>
          </section>
          <section className="nav-section sidebar-projects">
            <div className="sidebar-section-heading"><p>Recent projects</p><button data-action-id="nav.create-project" type="button" aria-label="Create project" onClick={() => startOnboarding("project")}>+</button></div>
            {accessibleProjects.slice(0, 5).map((project) => <button data-action-id={`nav.project.${project.id}`} className={`sidebar-project ${resolvedProject?.id === project.id ? "active" : ""}`} type="button" key={project.id} onClick={() => openProject(project.id)}><span className={`project-health health-${project.health}`} /><div><b>{project.name}</b><small>{project.client}</small></div><em>{project.code}</em></button>)}
            <button data-action-id="nav.all-projects" className="sidebar-all-projects" type="button" onClick={openWorkspaceHome}>View all projects</button>
          </section>
          <section className="nav-section sidebar-create">
            <p>Set up</p>
            <button data-action-id="nav.onboard-client" type="button" onClick={() => startOnboarding("client")}><span>＋</span><div><b>New client</b><small>Create a session draft</small></div></button>
            <button data-action-id="nav.new-project" type="button" onClick={() => startOnboarding("project")}><span>＋</span><div><b>New project</b><small>Choose a client parent</small></div></button>
          </section>
        </nav>

      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>☰</button>
          <nav className="breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={openWorkspaceHome}>Workspace</button>{resolvedProject && activeProjectViewAccess?.allowed && <><i>/</i><button type="button" onClick={openWorkspaceHome}>{activeProject.client}</button><i>/</i><b>{activeProject.name}</b></>}{resolvedProject && !activeProjectViewAccess?.allowed && <><i>/</i><b>Access required</b></>}{!resolvedProject && scope !== "company" && <><i>/</i><b>Operations World</b></>}</nav>
          <div className="topbar-actions">
            <span className="environment-badge">Synthetic workspace</span>
            <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)}><span>⌕</span><b>Search workspace</b><kbd>⌘ K</kbd></button>
            <button className="topbar-icon" type="button" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}>◌<em>{notificationItems.length}</em></button>
            <button data-action-id="profile.toggle" className="user-button" type="button" aria-expanded={profileOpen} onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}><span>{signedInCollaborator?.initials ?? "MR"}</span><div><b>{signedInCollaborator?.name ?? "Maya Rao"}</b><small>{signedInCollaborator?.organization ?? "Kearney"}</small></div></button>
          </div>
          {notificationsOpen && <aside className="notification-panel"><header><div><p className="kicker">ACTIVITY</p><h2>Recent project work</h2></div><button data-action-id="notifications.close" type="button" onClick={() => setNotificationsOpen(false)}>×</button></header>{notificationItems.map((item) => <button data-action-id={`notifications.open.${item.caseId}.${item.tone}`} type="button" key={`${item.caseId}-${item.tone}`} onClick={() => "projectId" in item && item.projectId ? openProject(item.projectId) : openCase(item.caseId)}><i className={`tone-${item.tone}`} /><span><b>{item.title}</b><small>{item.detail}</small></span><em>›</em></button>)}</aside>}
          {profileOpen && <aside className="profile-panel" aria-label="User menu"><header><span>{signedInCollaborator?.initials ?? "MR"}</span><div><b>{signedInCollaborator?.name ?? "Maya Rao"}</b><small>{signedInCollaborator ? `${signedInCollaborator.role} · ${signedInCollaborator.organization}` : "Identity unavailable"}</small></div></header><button data-action-id="profile.open-workspace" type="button" onClick={() => { setProfileOpen(false); if (canViewActiveProject) openProject(activeProject.id); else openWorkspaceHome(); }}><b>{canViewActiveProject ? "Open active project" : "Open workspace"}</b><small>{canViewActiveProject ? `${activeProject.client} · ${activeProject.name}` : `${accessibleProjects.length} accessible projects`}</small><i>›</i></button><button data-action-id="profile.open-receipts" type="button" disabled={!outcomeLedger.length} onClick={() => { setProfileOpen(false); setOutcome(outcomeLedger[0] ?? null); }}><b>Session receipts</b><small>{outcomeLedger.length ? `${outcomeLedger.length} browser-session receipts` : "No receipts recorded yet"}</small><i>›</i></button><button data-action-id="profile.decision-rights" type="button" onClick={() => { setProfileOpen(false); completeAction("Project rights opened", signedInProjectMembership && canViewActiveProject ? `${signedInCollaborator?.name ?? "Signed-in collaborator"} is ${signedInProjectMembership.projectRole} in ${activeProject.name} with ${signedInProjectMembership.capabilities.length} declared session capabilities.` : "Select an accessible project to inspect the signed-in collaborator's project-scoped rights.", canViewActiveProject ? signedInProjectMembership?.id ?? "RIGHTS-NO-PROJECT" : "RIGHTS-NO-PROJECT", "Saved"); }}><b>Project rights</b><small>{canViewActiveProject ? signedInProjectMembership?.projectRole ?? "No project membership" : "Select an accessible project"}</small><i>›</i></button><button data-action-id="profile.signout" type="button" onClick={() => { setProfileOpen(false); completeAction("Sign out unavailable", "Authentication is not configured for this workspace. No session was ended.", "AUTH-FUTURE", "Blocked"); }}><b>Sign out</b><small>Not configured</small><i>!</i></button></aside>}
        </header>

        <div className="statusbar">{canViewActiveProject ? <><span><i className="status-fixture" />{activeProject.stage}</span><span>{activeProject.client}</span><span>{activeProject.counts.observations} fixture observations</span><span>{membershipCatalog.filter((item) => item.projectId === activeProject.id).length} collaborators · project context</span></> : resolvedProject && scope === "company" ? <><span><i className="status-fixture" />Access required</span><span>Project boundary enforced</span></> : scope === "company" ? <><span><i className="status-fixture" />Workspace</span><span>{accessibleClients.length} clients</span><span>{accessibleProjects.length} projects</span><span>{workspaceCollaboratorViews.length} collaborator profiles</span></> : <><span><i className="status-fixture" />Operations World</span><span>{scope === "global" ? "Global" : operationsRegion}</span><span>2,164 synthetic movements</span><span>Evidence-linked fixture</span></>}</div>

        <main className="main-content">
          {resolvedProject && scope === "company" && activeProjectViewAccess?.allowed && view !== "company" && <section className="project-binding-strip"><div><span>PROJECT</span><b>{activeProject.sector} / {activeProject.client} / {activeProject.name}</b><small>{activeProject.code} · project-scoped session</small></div><button data-action-id="project-binding.return" type="button" onClick={() => go("company")}>Back to project</button></section>}
          {resolvedProject && scope === "company" && deniedProjectAccess ? (
            <ProjectAccessBoundary decision={deniedProjectAccess} onWorkspace={openWorkspaceHome} onReceipt={() => completeAction("Project access blocked", deniedProjectAccess.reason, deniedProjectAccess.policyRef, "Blocked", "Workspace access control")} />
          ) : view === "company" && resolvedProject ? (
            <ProjectWorkspace key={activeProject.id} projects={projectCatalog} collaborators={collaboratorCatalog} memberships={membershipCatalog} activeCollaboratorId={signedInCollaboratorId} initialProjectId={activeProject.id} initialTab={activeProjectTab} initialApp={activeProjectApp} onProjectChange={(project) => { setOutcome(null); setActiveProjectId(project.id); setSelectedCaseId(caseIdForProject(project)); }} onTabChange={setActiveProjectTab} onStudioChange={setActiveProjectApp} onOpenApp={(app) => go(app)} onOpenCase={() => openCase(activeCase.id)} onOutcome={completeAction} />
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
            <DecisionWorkspaces key={`workflow:${activeProject.id}:${view}`} view={view as WorkflowViewId} cases={visibleCases} activeCase={activeCase} scopeLabel={`${activeProject.client} / ${activeProject.name}`} financeReviewer={humanExperts[(projectCatalog.indexOf(activeProject) + 2) % humanExperts.length].name} executiveReviewer={humanExperts[(projectCatalog.indexOf(activeProject) + 3) % humanExperts.length].name} onOpenCase={openCase} onOpenApp={(app) => go(app)} onUpdateCase={updateCase} onToast={(message) => completeAction("Decision interaction recorded", message, "DECISION-INTERACTION", interactionStatus(message))} />
          ) : resolvedProject && applications.some((item) => item.id === view) ? (
            <ApplicationViews key={`application:${activeProject.id}:${view}`} app={view as AppId} project={activeProject} snapshot={snapshot} activeCase={activeCase} networkSelection={networkSelection} onClearNetworkSelection={() => setNetworkSelection(null)} onOpenCase={() => openCase(activeCase.id)} onOpenAction={() => openCase(activeCase.id, "action")} onOpenAgents={() => go("agents")} onOpenGraph={() => go("graph")} onToast={(message) => completeAction("Application interaction recorded", message, "APPLICATION-INTERACTION", interactionStatus(message))} />
          ) : resolvedProject ? (
            <DataOperations key={`data:${activeProject.id}:${view}`} view={view as DataViewId} snapshot={snapshot} onOpenApp={(app) => go(app)} onToast={(message) => completeAction("Data interaction recorded", message, "DATA-INTERACTION", interactionStatus(message))} />
          ) : <WorkspaceHome projects={accessibleProjects} clients={accessibleClients} collaborators={workspaceCollaboratorViews} onOpenProject={(project) => openProject(project.id)} onOnboardClient={() => startOnboarding("client")} onCreateProject={(client) => startOnboarding("project", client?.id)} onOpenOperationsWorld={() => go("global")} />}
        </main>

        <footer className="app-footer"><span>Maya Workspace</span><span>{canViewActiveProject ? `${activeProject.client} / ${activeProject.name}` : resolvedProject && scope === "company" ? "Project access required" : scope === "company" ? `${accessibleProjects.length} projects` : `Operations World / ${scope === "global" ? "Global" : operationsRegion}`}</span></footer>
      </div>

      {searchOpen && <div className="overlay" role="presentation"><button className="overlay-dismiss" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Maya Workspace"><div className="search-input"><span>⌕</span><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects, clients, and project capabilities…" /><kbd>ESC</kbd></div><div className="search-context"><span>{searchResults.length} results</span><b>{canViewActiveProject ? `${activeProject.client} / ${activeProject.name}` : scope === "company" ? "Workspace" : `Operations World / ${scope === "region" ? operationsRegion : snapshot.shortLabel}`}</b></div><div className="search-results">{searchResults.map((result, index) => <button data-action-id={`search.open.${result.id}.${result.projectId ?? result.caseId ?? index}`} type="button" key={`${result.id}-${result.caseId ?? result.projectId ?? index}`} onClick={() => result.projectId ? openProject(result.projectId) : result.caseId ? openCase(result.caseId) : result.id === "company" ? openWorkspaceHome() : go(result.id)}><span>{result.group}</span><div><b>{result.label}</b><small>{result.detail}</small></div><i>›</i></button>)}</div></section></div>}
      <WorkspaceOnboarding open={onboardingMode !== null} mode={onboardingMode ?? "client"} step={onboardingStep} clients={accessibleClients} clientDraft={clientDraft} projectDraft={projectDraft} onModeChange={(mode) => startOnboarding(mode)} onStepChange={setOnboardingStep} onClientDraftChange={setClientDraft} onProjectDraftChange={setProjectDraft} onClose={() => setOnboardingMode(null)} onSubmitClient={saveClientDraft} onSubmitProject={saveProjectDraft} />
      {outcome && <div className="action-outcome-overlay" role="presentation"><button data-action-id="outcome.dismiss" className="action-outcome-scrim" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)} /><aside className="action-outcome" role="dialog" aria-modal="true" aria-label="Action receipt"><header><span className={`outcome-state state-${outcome.status.toLowerCase()}`}>{outcome.status}</span><button data-action-id="outcome.close" type="button" aria-label="Close action receipt" onClick={() => setOutcome(null)}>×</button></header><p>ACTION RECEIPT · {outcome.id}</p><h2>{outcome.title}</h2><span>{outcome.detail}</span><dl><div><dt>Artifact</dt><dd>{outcome.artifact}</dd></div><div><dt>Recorded context</dt><dd>{outcome.context}</dd></div><div><dt>Recorded</dt><dd>{outcome.timestamp}</dd></div><div><dt>Execution boundary</dt><dd>Browser-session concept</dd></div></dl><section className="session-receipt-ledger"><header><b>SESSION RECEIPT LEDGER</b><span>{outcomeLedger.length} retained · browser memory only</span></header>{outcomeLedger.slice(0, 5).map((entry) => <button data-action-id={`outcome.open.${entry.id}`} type="button" key={entry.id} onClick={() => setOutcome(entry)} className={entry.id === outcome.id ? "active" : ""}><span>{entry.status}</span><b>{entry.title}</b><small>{entry.artifact}</small></button>)}</section><button data-action-id="outcome.done" className="primary-dark-action" type="button" onClick={() => setOutcome(null)}>Done</button></aside></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><DotIcon /><span>{toast}</span></div>}
    </div>
  );
}

function DotIcon() {
  return <i className="status-live" aria-hidden="true" />;
}
