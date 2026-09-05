"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent } from "react";
import ProjectAppStudio from "./ProjectAppStudios";
import {
  appDependencyEdges,
  agentsFor,
  connectorReceiptFor,
  connectorReceiptWording,
  connectorTemplates,
  createConnectorDraft,
  datasetsFor,
  decisionsFor,
  evaluateProjectAccess,
  evidenceFor,
  fixtureEvidenceFor,
  graphNodesFor,
  humanExperts,
  membershipsForProject,
  methodFamilies,
  projectApps,
  projectMemberships,
  projectGraphEdges,
  queueConnectorPolicyReview,
  replayConnectorFixture,
  signedInCollaboratorId,
  workspaceCollaborators,
  workspaceProjects,
  workspaceTabs,
  type EvidenceReceipt,
  type ExpertAgent,
  type ProjectAppId,
  type ProjectConnectorDraft,
  type ProjectCapability,
  type ProjectMembership,
  type WorkspaceCollaborator,
  type WorkspaceProject,
  type WorkspaceTabId,
} from "./workspace-model";
import {
  activitiesForSession,
  appRunsFor,
  messagesForSession,
  planAppRerun,
  sessionsForProject,
  type ProjectActivityAction,
  type ProjectActivityState,
  type ProjectAppRun,
  type ProjectWorkSession,
  type SessionActivity,
  type SessionMessage,
} from "./project-activity-model";
import { groupProjectsByPath, projectPathKeys, type ProjectPathMode } from "./project-path-model";

type ExistingAppId = "risk" | "optimizer" | "flow" | "demand" | "suppliers";
type OutcomeHandler = (title: string, detail: string, artifact?: string, status?: "Completed" | "Saved" | "Blocked") => void;
type AgentDraft = { specialty: string; skills: readonly string[]; connections: readonly string[]; skillFile: string };
type ChatMessage = { role: "user" | "agent" | "system"; text: string };
type ProjectMemberView = { membership: ProjectMembership; collaborator: WorkspaceCollaborator };
type UploadStage = "Select" | "Staged" | "Schema preview" | "Mapping draft" | "Review demo" | "Session receipt";
type ProjectSessionState = {
  selectedDecision: string;
  selectedGraphNode: string;
  traceIndex: number;
  runState: "Ready" | "Running" | "Completed" | "Cancelled";
  selectedAgentId: string;
  chatText: string;
  activePrompt: string;
  steeringInstructions: readonly string[];
  chatMessages: readonly ChatMessage[];
  uploadStage: UploadStage;
  uploadName: string;
  sessionDatasets: readonly { id: string; name: string; rows: string; state: string }[];
  mountedApps: readonly ProjectAppId[];
  draftAgentName: string;
  createdAgents: readonly ExpertAgent[];
  selectedExpertId: string;
  assignedExperts: readonly string[];
  connectorDrafts: readonly ProjectConnectorDraft[];
  projectTreeOpen: boolean;
  agentSessionsOpen: boolean;
  agentInspectorOpen: boolean;
};

type ProjectWorkspaceProps = {
  onOpenApp: (app: ExistingAppId) => void;
  onOpenCase: () => void;
  onOutcome?: OutcomeHandler;
  initialProjectId?: string;
  initialTab?: WorkspaceTabId;
  initialApp?: ProjectAppId | null;
  onProjectChange?: (project: WorkspaceProject) => void;
  onTabChange?: (tab: WorkspaceTabId) => void;
  onStudioChange?: (app: ProjectAppId | null) => void;
  projects?: readonly WorkspaceProject[];
  collaborators?: readonly WorkspaceCollaborator[];
  memberships?: readonly ProjectMembership[];
  activeCollaboratorId?: string;
  pathMode: ProjectPathMode;
  onPathModeChange: (mode: ProjectPathMode) => void;
  activityState: ProjectActivityState;
  dispatchActivity: Dispatch<ProjectActivityAction>;
  onMountedAppsChange?: (projectId: string, appIds: readonly ProjectAppId[]) => void;
};

const isExistingApp = (id: ProjectAppId): id is ExistingAppId => ["risk", "optimizer", "flow", "demand", "suppliers"].includes(id);
const capabilityForTab = (tab: WorkspaceTabId): ProjectCapability => {
  if (tab === "decisions") return "decisions.view";
  if (tab === "apps") return "apps.view";
  if (tab === "data" || tab === "graph") return "data.view";
  if (tab === "agents") return "agents.run";
  return "project.view";
};
type TraceStep = { state: string; agent: string; title: string; detail: string; nodes: readonly string[] };
const promptFor = (project: WorkspaceProject) => `Analyze ${project.problem.toLowerCase()} using only this project snapshot, then stop at the human approval gate.`;
const initialChatMessagesFor = (project: WorkspaceProject): readonly ChatMessage[] => [
  { role: "agent", text: `I am scoped to ${project.client} / ${project.name}. I can frame a decision, expose every evidence read, and stop before any external tool or release action.` },
];
const defaultSessionFor = (project: WorkspaceProject): ProjectSessionState => ({
  selectedDecision: "D0",
  selectedGraphNode: "supplier",
  traceIndex: -1,
  runState: "Ready",
  selectedAgentId: agentsFor(project)[0]?.id ?? "",
  chatText: promptFor(project),
  activePrompt: promptFor(project),
  steeringInstructions: [],
  chatMessages: initialChatMessagesFor(project),
  uploadStage: "Select",
  uploadName: "",
  sessionDatasets: [],
  mountedApps: project.mountedAppIds,
  draftAgentName: "Resilience Portfolio Challenger",
  createdAgents: [],
  selectedExpertId: humanExperts[0].id,
  assignedExperts: project.origin === "Seed fixture" ? humanExperts.map((item) => item.id) : [],
  connectorDrafts: [],
  projectTreeOpen: true,
  agentSessionsOpen: true,
  agentInspectorOpen: false,
});
const projectSessionCache: Record<string, ProjectSessionState> = {};
const requireWorkspaceProject = (id: string | undefined, projects: readonly WorkspaceProject[]) => {
  const project = id ? projects.find((item) => item.id === id) : projects[0];
  if (!project) throw new Error(`Unknown project workspace: ${id ?? "default"}`);
  return project;
};
const traceStepsFor = (project: WorkspaceProject, prompt: string, steering: readonly string[]): readonly TraceStep[] => [
  { state: "Planning", agent: "Project Orchestrator", title: "Bind the submitted brief", detail: `Prompt: ${prompt}`, nodes: ["decision"] },
  { state: "Reading", agent: "Evidence Auditor", title: "Read project-scoped evidence", detail: `${datasetsFor(project).length} dataset views · ${project.counts.claims} claim metadata · no cross-client traversal`, nodes: ["src", "supplier"] },
  { state: "Traversing", agent: "Domain Cartographer", title: "Trace the outcome path", detail: project.variablePack.l0.length ? `${project.client} source → ${project.variablePack.l0[0]} → operating node → ${project.metrics[1]?.label ?? "outcome"}` : "No project graph or variable pack exists yet; traversal stops at the zero-state boundary.", nodes: ["supplier", "material", "plant", "order"] },
  { state: "Formulating", agent: "OR Formulator", title: "Build the decision-model draft", detail: project.methodCodes.length ? `${project.methodCodes.slice(0, 4).join(" + ")} · project variables · 12 canonical constraint families${steering.length ? ` · steering: ${steering.join("; ")}` : " · no steering overrides"}` : "No variables or methods are mounted; formulation remains an empty draft.", nodes: ["supplier", "material", "calc"] },
  { state: "Calculating", agent: "Solver Operator", title: "Replay deterministic response fixture", detail: "Illustrative calculation only · no live solver · no optimality claim", nodes: ["calc"] },
  { state: "Verifying", agent: "Evidence Auditor", title: "Check units, hard constraints, and claim language", detail: "Candidate is reviewable; actual solver status remains unavailable", nodes: ["calc", "decision"] },
  { state: "Awaiting approval", agent: "Project Orchestrator", title: "Route to human experts", detail: `${project.counts.experts} project experts · named human owner ${project.owner}`, nodes: ["decision"] },
];

export default function ProjectWorkspace({ onOpenApp, onOpenCase, onOutcome = () => undefined, initialProjectId, initialTab = "overview", initialApp = null, onProjectChange, onTabChange, onStudioChange, projects = workspaceProjects, collaborators = workspaceCollaborators, memberships = projectMemberships, activeCollaboratorId = signedInCollaboratorId, pathMode, onPathModeChange, activityState, dispatchActivity, onMountedAppsChange }: ProjectWorkspaceProps) {
  const firstProject = requireWorkspaceProject(initialProjectId, projects);
  const initialSession = projectSessionCache[firstProject.id] ?? defaultSessionFor(firstProject);
  const [projectId, setProjectId] = useState(firstProject.id);
  const projectIdRef = useRef(firstProject.id);
  const selectProjectRef = useRef<(project: WorkspaceProject, push?: boolean) => void>(() => undefined);
  const tabChangeRef = useRef(onTabChange);
  const [tab, setTab] = useState<WorkspaceTabId>(initialTab);
  const [portfolioQuery, setPortfolioQuery] = useState("");
  const [evidence, setEvidence] = useState<EvidenceReceipt | null>(null);
  const [focusedAppRunId, setFocusedAppRunId] = useState<string | null>(null);
  const [studioApp, setStudioApp] = useState<ProjectAppId | null>(initialApp && !isExistingApp(initialApp) && initialSession.mountedApps.includes(initialApp) ? initialApp : null);
  const [selectedDecision, setSelectedDecision] = useState<string>(initialSession.selectedDecision);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>(initialSession.selectedGraphNode);
  const [traceIndex, setTraceIndex] = useState(initialSession.traceIndex);
  const [runState, setRunState] = useState<"Ready" | "Running" | "Completed" | "Cancelled">(initialSession.runState);
  const [selectedAgentId, setSelectedAgentId] = useState(initialSession.selectedAgentId);
  const [chatText, setChatText] = useState(initialSession.chatText);
  const [activePrompt, setActivePrompt] = useState(initialSession.activePrompt);
  const [steeringInstructions, setSteeringInstructions] = useState<readonly string[]>(initialSession.steeringInstructions);
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>(initialSession.chatMessages);
  const [uploadStage, setUploadStage] = useState<UploadStage>(initialSession.uploadStage);
  const [uploadName, setUploadName] = useState(initialSession.uploadName);
  const [sessionDatasets, setSessionDatasets] = useState<readonly { id: string; name: string; rows: string; state: string }[]>(initialSession.sessionDatasets);
  const [mountedApps, setMountedApps] = useState<readonly ProjectAppId[]>(initialSession.mountedApps);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [draftAgentName, setDraftAgentName] = useState(initialSession.draftAgentName);
  const [createdAgents, setCreatedAgents] = useState<readonly ExpertAgent[]>(initialSession.createdAgents);
  const [selectedExpertId, setSelectedExpertId] = useState(initialSession.selectedExpertId);
  const [assignedExperts, setAssignedExperts] = useState<readonly string[]>(initialSession.assignedExperts);
  const [connectorDrafts, setConnectorDrafts] = useState<readonly ProjectConnectorDraft[]>(initialSession.connectorDrafts);
  const [projectTreeOpen, setProjectTreeOpen] = useState(initialSession.projectTreeOpen);
  const [agentSessionsOpen, setAgentSessionsOpen] = useState(initialSession.agentSessionsOpen);
  const [agentInspectorOpen, setAgentInspectorOpen] = useState(initialSession.agentInspectorOpen);
  const projectSessionsRef = useRef<Record<string, ProjectSessionState>>(projectSessionCache);
  const project = requireWorkspaceProject(projectId, projects);
  const workSessions = sessionsForProject(activityState, project.id);
  const selectedWorkSessionId = activityState.selectedSessionByProject[project.id] ?? workSessions[0]?.id ?? "";
  const selectedWorkSession = workSessions.find((session) => session.id === selectedWorkSessionId) ?? workSessions[0] ?? null;
  const sessionMessages = selectedWorkSession ? messagesForSession(activityState, project.id, selectedWorkSession.id) : [];
  const sessionActivities = selectedWorkSession ? activitiesForSession(activityState, project.id, selectedWorkSession.id) : [];
  const projectAppRuns = appRunsFor(activityState, project.id);
  const projectMemberRecords = membershipsForProject(project.id, memberships);
  const activeCollaborator = collaborators.find((item) => item.id === activeCollaboratorId);
  const projectViewAccess = evaluateProjectAccess(project.id, activeCollaboratorId, "project.view", memberships);
  const activeTabAccess = evaluateProjectAccess(project.id, activeCollaboratorId, capabilityForTab(tab), memberships);
  const authorize = (capability: ProjectCapability) => {
    const decision = evaluateProjectAccess(project.id, activeCollaboratorId, capability, memberships);
    if (!decision.allowed) onOutcome("Access blocked", `${activeCollaborator?.name ?? "The signed-in collaborator"} · ${decision.reason}`, decision.policyRef, "Blocked");
    return decision.allowed;
  };
  const projectMembers = projectMemberRecords.flatMap((membership) => {
    const collaborator = collaborators.find((item) => item.id === membership.collaboratorId);
    return collaborator ? [{ membership, collaborator }] : [];
  });
  const graphNodes = graphNodesFor(project);
  const traceSteps = traceStepsFor(project, activePrompt, steeringInstructions);
  const availableAgents = [...agentsFor(project), ...createdAgents];
  const selectedAgent = availableAgents.find((item) => item.id === selectedAgentId) ?? availableAgents[0] ?? null;
  const selectedExpert = humanExperts.find((item) => item.id === selectedExpertId) ?? humanExperts[0];
  const selectedNode = graphNodes.find((item) => item.id === selectedGraphNode) ?? graphNodes[0];
  const visibleProjects = useMemo(() => projects.filter((candidate) => evaluateProjectAccess(candidate.id, activeCollaboratorId, "project.view", memberships).allowed), [activeCollaboratorId, memberships, projects]);
  const filteredProjects = useMemo(() => {
    const q = portfolioQuery.trim().toLowerCase();
    return q ? visibleProjects.filter((item) => `${item.sector} ${item.client} ${item.name} ${item.problem}`.toLowerCase().includes(q)) : visibleProjects;
  }, [portfolioQuery, visibleProjects]);

  const updateUrl = useCallback((nextProject: WorkspaceProject, nextTab: WorkspaceTabId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "company");
    url.searchParams.set("scope", "company");
    url.searchParams.set("sector", nextProject.sectorId);
    url.searchParams.set("client", nextProject.clientId);
    url.searchParams.set("project", nextProject.id);
    url.searchParams.set("projectTab", nextTab);
    url.searchParams.delete("projectApp");
    window.history.pushState({}, "", url);
  }, []);

  const selectProject = useCallback((next: WorkspaceProject, push = true) => {
    const access = evaluateProjectAccess(next.id, activeCollaboratorId, "project.view", memberships);
    if (!access.allowed) {
      onOutcome("Project access blocked", access.reason, access.policyRef, "Blocked");
      return;
    }
    projectSessionsRef.current[projectIdRef.current] = {
      selectedDecision, selectedGraphNode, traceIndex, runState, selectedAgentId, chatText, activePrompt,
      steeringInstructions, chatMessages, uploadStage, uploadName, sessionDatasets, mountedApps,
      draftAgentName, createdAgents, selectedExpertId, assignedExperts, connectorDrafts,
      projectTreeOpen, agentSessionsOpen, agentInspectorOpen,
    };
    const restored = projectSessionsRef.current[next.id];
    projectIdRef.current = next.id;
    setProjectId(next.id);
    setTab("overview");
    setStudioApp(null);
    setFocusedAppRunId(null);
    onStudioChange?.(null);
    setEvidence(null);
    setMountedApps(restored?.mountedApps ?? next.mountedAppIds);
    setSelectedDecision(restored?.selectedDecision ?? "D0");
    setSelectedGraphNode(restored?.selectedGraphNode ?? "supplier");
    setTraceIndex(restored?.traceIndex ?? -1);
    setRunState(restored?.runState ?? "Ready");
    setSelectedAgentId(restored?.selectedAgentId ?? agentsFor(next)[0]?.id ?? "");
    setSelectedExpertId(restored?.selectedExpertId ?? humanExperts[0].id);
    const nextPrompt = promptFor(next);
    setChatText(restored?.chatText ?? nextPrompt);
    setActivePrompt(restored?.activePrompt ?? nextPrompt);
    setSteeringInstructions(restored?.steeringInstructions ?? []);
    setChatMessages(restored?.chatMessages ?? initialChatMessagesFor(next));
    setUploadStage(restored?.uploadStage ?? "Select");
    setUploadName(restored?.uploadName ?? "");
    setSessionDatasets(restored?.sessionDatasets ?? []);
    setBuilderOpen(false);
    setBuilderStep(0);
    setDraftAgentName(restored?.draftAgentName ?? "Resilience Portfolio Challenger");
    setCreatedAgents(restored?.createdAgents ?? []);
    setAssignedExperts(restored?.assignedExperts ?? (next.origin === "Seed fixture" ? humanExperts.map((item) => item.id) : []));
    setConnectorDrafts(restored?.connectorDrafts ?? []);
    setProjectTreeOpen(restored?.projectTreeOpen ?? true);
    setAgentSessionsOpen(restored?.agentSessionsOpen ?? true);
    setAgentInspectorOpen(restored?.agentInspectorOpen ?? false);
    onProjectChange?.(next);
    onTabChange?.("overview");
    if (push) updateUrl(next, "overview");
  }, [activeCollaboratorId, activePrompt, agentInspectorOpen, agentSessionsOpen, assignedExperts, chatMessages, chatText, connectorDrafts, createdAgents, draftAgentName, memberships, mountedApps, onOutcome, onProjectChange, onStudioChange, onTabChange, projectTreeOpen, runState, selectedAgentId, selectedDecision, selectedExpertId, selectedGraphNode, sessionDatasets, steeringInstructions, traceIndex, updateUrl, uploadName, uploadStage]);

  const changeTab = (next: WorkspaceTabId) => {
    if (!authorize(capabilityForTab(next))) return;
    setTab(next);
    if (next !== "apps") setFocusedAppRunId(null);
    setStudioApp(null);
    onStudioChange?.(null);
    onTabChange?.(next);
    updateUrl(project, next);
  };
  useEffect(() => {
    selectProjectRef.current = selectProject;
    tabChangeRef.current = onTabChange;
  }, [selectProject, onTabChange]);

  useEffect(() => {
    projectSessionCache[projectId] = {
      selectedDecision, selectedGraphNode, traceIndex, runState, selectedAgentId, chatText, activePrompt,
      steeringInstructions, chatMessages, uploadStage, uploadName, sessionDatasets, mountedApps,
      draftAgentName, createdAgents, selectedExpertId, assignedExperts, connectorDrafts,
      projectTreeOpen, agentSessionsOpen, agentInspectorOpen,
    };
  }, [activePrompt, agentInspectorOpen, agentSessionsOpen, assignedExperts, chatMessages, chatText, connectorDrafts, createdAgents, draftAgentName, mountedApps, projectId, projectTreeOpen, runState, selectedAgentId, selectedDecision, selectedExpertId, selectedGraphNode, sessionDatasets, steeringInstructions, traceIndex, uploadName, uploadStage]);

  useEffect(() => {
    onMountedAppsChange?.(project.id, mountedApps);
  }, [mountedApps, onMountedAppsChange, project.id]);

  useEffect(() => {
    const restore = () => {
      const url = new URL(window.location.href);
      const restoredProject = projects.find((item) => item.id === url.searchParams.get("project"));
      const restoredTab = workspaceTabs.find((item) => item.id === url.searchParams.get("projectTab"))?.id;
       const targetProject = restoredProject ?? requireWorkspaceProject(projectIdRef.current, projects);
       const mountedForTarget = projectSessionsRef.current[targetProject.id]?.mountedApps ?? targetProject.mountedAppIds;
       const requestedApp = projectApps.find((item) => item.id === url.searchParams.get("projectApp"))?.id ?? null;
       const restoredApp = restoredTab === "apps" && requestedApp && !isExistingApp(requestedApp) && mountedForTarget.includes(requestedApp) ? requestedApp : null;
      if (restoredProject && restoredProject.id !== projectIdRef.current) selectProjectRef.current(restoredProject, false);
      if (restoredTab) {
        setTab(restoredTab);
        tabChangeRef.current?.(restoredTab);
      }
       setStudioApp(restoredApp);
       if (url.searchParams.has("projectApp") && !restoredApp) {
         url.searchParams.delete("projectApp");
         window.history.replaceState({}, "", url);
       }
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [projects]);

  const openAppRun = (runId: string) => {
    const linkedRun = projectAppRuns.find((run) => run.id === runId);
    if (!linkedRun || !authorize("apps.view")) return;
    dispatchActivity({ type: "select-app-run", projectId: project.id, appId: linkedRun.appId, runId: linkedRun.id });
    setFocusedAppRunId(linkedRun.id);
    setStudioApp(null);
    setTab("apps");
    onStudioChange?.(null);
    onTabChange?.("apps");
    updateUrl(project, "apps");
  };

  const openEvidence = (target: string | EvidenceReceipt) => {
    const linkedRun = projectAppRuns.find((run) => typeof target === "string" ? target === run.id : target.id.endsWith(`EV-${run.id}`));
    if (linkedRun) {
      openAppRun(linkedRun.id);
      return;
    }
    setEvidence(typeof target === "string" ? evidenceFor(project, target) : target.projectId === project.id ? target : evidenceFor(project, target.id));
  };
  const openApp = (id: ProjectAppId) => {
    if (!authorize(mountedApps.includes(id) ? "apps.view" : "apps.mount")) return;
    if (!mountedApps.includes(id)) {
      setMountedApps((current) => [...current, id]);
      onOutcome("App mounted", `${projectApps.find((item) => item.id === id)?.name} is now mounted to ${project.name} with project-scoped bindings.`, `MOUNT-${project.code}-${id.toUpperCase()}`);
      return;
    }
    if (project.origin === "Browser-session draft" && project.variablePack.l0.length === 0) {
      onOutcome("App open blocked", `${projectApps.find((item) => item.id === id)?.name} is mounted, but this new project has no governed variable mapping or data contract yet. Configure Data before opening the app.`, `APP-${project.code}-${id.toUpperCase()}-BOUNDARY`, "Blocked");
      return;
    }
    if (isExistingApp(id)) {
      onStudioChange?.(null);
      onOpenApp(id);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "company");
      url.searchParams.set("scope", "company");
      url.searchParams.set("projectTab", "apps");
      url.searchParams.set("projectApp", id);
      window.history.pushState({}, "", url);
      setStudioApp(id);
      onStudioChange?.(id);
    }
  };

  const closeStudio = () => {
    setStudioApp(null);
    onStudioChange?.(null);
    updateUrl(project, "apps");
  };

  const submitChat = (event: FormEvent) => {
    event.preventDefault();
    if (!authorize("agents.run")) return;
    const prompt = chatText.trim();
    if (!prompt) return;
    setActivePrompt(prompt);
    if (selectedWorkSession?.origin === "Browser session") {
      dispatchActivity({ type: "append-message", projectId: project.id, sessionId: selectedWorkSession.id, role: "user", author: activeCollaborator?.name ?? project.owner, kind: "Prompt", body: prompt });
      dispatchActivity({ type: "append-message", projectId: project.id, sessionId: selectedWorkSession.id, role: "agent", author: selectedAgent?.name ?? "Project Orchestrator", kind: "Response", body: `Prompt appended to ${selectedWorkSession.id}. The visible deterministic trace will restart and stop at human review.` });
    } else {
      dispatchActivity({ type: "create-session", project, prompt, agentId: selectedAgent?.id ?? "orchestrator", agentName: selectedAgent?.name ?? "Project Orchestrator" });
    }
    setSteeringInstructions([]);
    setChatMessages((current) => [...current, { role: "user", text: prompt }, { role: "agent", text: "Your exact prompt is now bound to the visible deterministic trace fixture. I will expose each step and stop at the human approval gate; no language model or external tool is running." }]);
    setTraceIndex(0);
    setRunState("Running");
    setChatText("");
  };

  const advanceRun = () => {
    if (!authorize("agents.run")) return;
    if (runState === "Completed" || runState === "Cancelled") {
      setTraceIndex(0);
      setRunState("Running");
      return;
    }
    if (traceIndex < 0) {
      setTraceIndex(0);
      setRunState("Running");
      return;
    }
    if (traceIndex < traceSteps.length - 1) {
      setTraceIndex((current) => current + 1);
      return;
    }
    setRunState("Completed");
    setChatMessages((current) => [...current, { role: "agent", text: "Synthetic run complete. A feasible-looking candidate fixture is ready for expert review; no live solver ran and no action was released." }]);
    if (selectedWorkSession) dispatchActivity({
      type: "complete-session",
      projectId: project.id,
      sessionId: selectedWorkSession.id,
      result: {
        headline: `${project.name} candidate ready for review`,
        recommendation: project.outcome,
        metrics: project.metrics.slice(0, 3).map((metric) => ({ label: metric.label, value: metric.value })),
        evidenceRefs: project.metrics.slice(0, 4).map((metric) => metric.evidenceRef),
        reviewGate: `Human review required from ${project.owner}`,
        claimBoundary: "Synthetic trace only; no LLM, live solver, source system, write-back, or reinforcement-learning update ran.",
      },
    });
    onOutcome("Agent run completed", `${project.code} reached the human review gate with a complete synthetic trace and evidence manifest.`, `RUN-${project.code}-018`);
  };

  const steerRun = (label: string) => {
    if (!authorize("agents.run")) return;
    setSteeringInstructions((current) => [...current, label]);
    if (selectedWorkSession) dispatchActivity({ type: "steer-session", projectId: project.id, sessionId: selectedWorkSession.id, instruction: label });
    setChatMessages((current) => [...current, { role: "system", text: `${label} was added to the deterministic trace context. The visible replay restarted at Planning; no model, calculation, or source record changed.` }]);
    setTraceIndex(0);
    setRunState("Running");
    onOutcome("Steering instruction applied", `${label} restarted the ${project.code} synthetic trace at Planning. No source record or production policy changed.`, `STEER-${project.code}-${label.toUpperCase().replaceAll(" ", "-")}`);
  };

  const selectWorkSession = (sessionId: string) => {
    const session = workSessions.find((item) => item.id === sessionId);
    if (!session) return;
    dispatchActivity({ type: "select-session", projectId: project.id, sessionId });
    setActivePrompt(session.objective);
    setSteeringInstructions([]);
    setTraceIndex(-1);
    setRunState(session.status === "Cancelled" ? "Cancelled" : session.status === "Active" ? "Running" : "Completed");
  };

  const continueWorkSession = (sessionId: string) => {
    if (!authorize("agents.run")) return;
    dispatchActivity({ type: "fork-session", projectId: project.id, sessionId });
    setSteeringInstructions([]);
    setTraceIndex(-1);
    setRunState("Ready");
  };

  const openWorkSession = (sessionId: string) => {
    if (!authorize("agents.run")) return;
    selectWorkSession(sessionId);
    changeTab("agents");
  };

  const setUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (!authorize("data.stage")) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadName(file.name);
    setUploadStage("Staged");
  };

  const nextUploadStage = () => {
    if (!authorize("data.stage")) return;
    const order = ["Select", "Staged", "Schema preview", "Mapping draft", "Review demo", "Session receipt"] as const;
    const index = order.indexOf(uploadStage);
    const next = order[Math.min(index + 1, order.length - 1)];
    setUploadStage(next);
    if (next === "Session receipt") {
      const datasetId = `${project.code}-DS-SESSION-01`;
      const sampleName = uploadName || `${project.code}_Project_Sample.csv`;
      setSessionDatasets((current) => current.some((item) => item.id === datasetId) ? current : [...current, { id: datasetId, name: sampleName, rows: "240 fixture rows", state: "Session-only preview" }]);
      onOutcome("Ingestion concept completed", `${sampleName} completed a metadata-only contract walkthrough inside ${project.client} / ${project.name}; file contents were not read and nothing was merged or stored.`, `INGESTION-${project.code}-UB-01`);
    }
  };

  const requestConnector = (templateId: string) => {
    if (!authorize("connectors.request")) return;
    const draft = createConnectorDraft(project, templateId, project.owner, connectorDrafts);
    setConnectorDrafts((current) => [...current, draft]);
    onOutcome("Data source request saved", connectorReceiptWording(project, draft), draft.evidenceRef);
  };

  const testConnectorFixture = (connectorId: string) => {
    if (!authorize("connectors.request")) return;
    const current = connectorDrafts.find((item) => item.id === connectorId);
    if (!current) return;
    const tested = replayConnectorFixture(current);
    setConnectorDrafts((items) => items.map((item) => item.id === connectorId ? tested : item));
    openEvidence(connectorReceiptFor(project, tested));
    onOutcome("Sample payload tested", "Fixed sample payload replayed locally; no device discovery or network request occurred.", tested.evidenceRef);
  };

  const reviewConnector = (connectorId: string) => {
    if (!authorize("connectors.request")) return;
    const current = connectorDrafts.find((item) => item.id === connectorId);
    if (!current) return;
    const reviewed = queueConnectorPolicyReview(current);
    setConnectorDrafts((items) => items.map((item) => item.id === connectorId ? reviewed : item));
    onOutcome("Policy review queued", `${reviewed.name} is marked for a browser-session policy review. No reviewer, ticket, identity, credential, endpoint, or network route was created.`, reviewed.evidenceRef, "Saved");
  };

  const tabCounts: Partial<Record<WorkspaceTabId, number>> = {
    decisions: decisionsFor(project).length,
    apps: mountedApps.length,
    data: datasetsFor(project).length + sessionDatasets.length + connectorDrafts.length,
    agents: availableAgents.length,
    team: projectMembers.length + assignedExperts.length,
  };

  const deniedAccess = !projectViewAccess.allowed ? projectViewAccess : !activeTabAccess.allowed ? activeTabAccess : null;
  if (deniedAccess) return <section className="project-access-boundary" data-page-heading tabIndex={-1}><span>PROJECT ACCESS</span><h1>Project access required</h1><p>The signed-in collaborator has no project-scoped grant for this workspace section. No project data, app, decision, agent, or team surface was opened.</p><small>{deniedAccess.policyRef}</small><button data-action-id="project.access.view-receipt" type="button" onClick={() => onOutcome("Project access blocked", deniedAccess.reason, deniedAccess.policyRef, "Blocked")}>View access receipt</button></section>;

  if (studioApp) return <div className={`project-os studio-mode${projectTreeOpen ? "" : " tree-collapsed"}`} data-page-heading tabIndex={-1}><ProjectTree selected={project} projects={filteredProjects} query={portfolioQuery} onQuery={setPortfolioQuery} onSelect={selectProject} pathMode={pathMode} onPathModeChange={onPathModeChange} /><section className="project-stage"><div className="project-panel-controls"><button data-action-id="workspace.toggle-project-tree" type="button" aria-expanded={projectTreeOpen} onClick={() => setProjectTreeOpen((current) => !current)}>{projectTreeOpen ? "Hide project switcher" : "Show project switcher"}</button></div><MobileProjectSwitcher project={project} projects={visibleProjects} onSelect={selectProject} pathMode={pathMode} /><ProjectAppStudio appId={studioApp} project={project} onBack={closeStudio} onEvidence={openEvidence} onOutcome={onOutcome} /><AppRunHistory project={project} runs={projectAppRuns.filter((run) => run.appId === studioApp)} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={openApp} onOpenSession={openWorkSession} onEvidence={openEvidence} onOutcome={onOutcome} canRun={evaluateProjectAccess(project.id, activeCollaboratorId, "agents.run", memberships).allowed} activeSessionId={selectedWorkSession?.id} focusedRunId={focusedAppRunId} /></section>{evidence && <EvidenceDrawer receipt={evidence} onClose={() => setEvidence(null)} onOutcome={onOutcome} />}</div>;

  return (
    <div className={`project-os${projectTreeOpen ? "" : " tree-collapsed"}`} data-page-heading tabIndex={-1}>
      <ProjectTree selected={project} projects={filteredProjects} query={portfolioQuery} onQuery={setPortfolioQuery} onSelect={selectProject} pathMode={pathMode} onPathModeChange={onPathModeChange} />
      <section className="project-stage">
        <div className="project-panel-controls"><button data-action-id="workspace.toggle-project-tree" type="button" aria-expanded={projectTreeOpen} onClick={() => setProjectTreeOpen((current) => !current)}>{projectTreeOpen ? "Hide project switcher" : "Show project switcher"}</button></div>
        <MobileProjectSwitcher project={project} projects={visibleProjects} onSelect={selectProject} pathMode={pathMode} />
        <header className="project-commandbar"><div><p>{project.sector} / {project.client} / {project.code}</p><h1>{project.name}</h1><span>{project.problem}</span></div><aside><small>PROJECT STATE</small><b><i className={`project-tone-${project.health}`} />{project.stage}</b><span>{project.classification} · {project.dataResidency}</span></aside></header>
        <nav className="project-tabs" aria-label="Project workspace sections">{workspaceTabs.map((item) => <button data-action-id={`workspace.tab.${item.id}`} type="button" className={tab === item.id ? "active" : ""} key={item.id} onClick={() => changeTab(item.id)}><span>{item.label}</span>{tabCounts[item.id] !== undefined && <em>{tabCounts[item.id]}</em>}</button>)}</nav>
         {tab === "overview" && <><OverviewPanel project={project} mounted={mountedApps} onTab={changeTab} onOpenCase={onOpenCase} onEvidence={openEvidence} onOpenApp={openApp} /><RecentWorkPanel sessions={workSessions} onOpen={openWorkSession} onContinue={(sessionId) => { continueWorkSession(sessionId); changeTab("agents"); }} />{project.operationsWorldIntake && <ProjectIntakeSummary project={project} onEvidence={openEvidence} />}</>}
        {tab === "decisions" && <DecisionPanel project={project} selected={selectedDecision} onSelect={setSelectedDecision} onEvidence={openEvidence} onOpenCase={onOpenCase} onOutcome={onOutcome} />}
         {tab === "apps" && <AppsPanel project={project} mounted={mountedApps} runs={projectAppRuns} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={openApp} onOpenSession={openWorkSession} onEvidence={openEvidence} onOutcome={onOutcome} canRun={evaluateProjectAccess(project.id, activeCollaboratorId, "agents.run", memberships).allowed} activeSessionId={selectedWorkSession?.id} focusedRunId={focusedAppRunId} />}
        {tab === "data" && <DataPanel project={project} uploadStage={uploadStage} uploadName={uploadName} sessionDatasets={sessionDatasets} connectorDrafts={connectorDrafts} onRequestConnector={requestConnector} onReviewConnector={reviewConnector} onTestConnector={testConnectorFixture} onFile={setUploadFile} onUseSample={() => { if (!authorize("data.stage")) return; setUploadName(`${project.code}_Project_Sample.csv`); setUploadStage("Staged"); }} onAdvance={nextUploadStage} onEvidence={openEvidence} onOutcome={onOutcome} />}
        {tab === "graph" && <GraphPanel project={project} nodes={graphNodes} traceSteps={traceSteps} selectedNode={selectedGraphNode} onSelect={setSelectedGraphNode} selected={selectedNode} traceIndex={traceIndex} onEvidence={openEvidence} onSteer={steerRun} />}
         {tab === "agents" && <AgentPanel project={project} traceSteps={traceSteps} selectedAgent={selectedAgent} selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} sessions={workSessions} selectedSession={selectedWorkSession} messages={sessionMessages} activities={sessionActivities} appRuns={projectAppRuns} sessionsOpen={agentSessionsOpen} inspectorOpen={agentInspectorOpen} onToggleSessions={() => setAgentSessionsOpen((current) => !current)} onToggleInspector={() => setAgentInspectorOpen((current) => !current)} onSelectSession={selectWorkSession} onContinueSession={continueWorkSession} onOpenRun={openAppRun} chatText={chatText} onChatText={setChatText} onSubmit={submitChat} traceIndex={traceIndex} runState={runState} onAdvance={advanceRun} onCancel={() => { if (!authorize("agents.run")) return; setRunState("Cancelled"); if (selectedWorkSession) dispatchActivity({ type: "cancel-session", projectId: project.id, sessionId: selectedWorkSession.id }); onOutcome("Agent run cancelled", `${project.code} agent run stopped safely; no external tools or records were changed.`, `RUN-${project.code}-018`); }} onSteer={steerRun} onEvidence={openEvidence} onOpenBuilder={() => { if (!authorize("agents.create")) return; setBuilderOpen(true); setBuilderStep(0); }} agents={availableAgents} />}
        {tab === "team" && <><ProjectMembershipsPanel project={project} members={projectMembers} onEvidence={openEvidence} /><TeamPanel project={project} selected={selectedExpert} selectedId={selectedExpertId} assigned={assignedExperts} onSelect={setSelectedExpertId} onEvidence={openEvidence} onAssign={(id) => { if (!authorize("team.manage")) return; setAssignedExperts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); onOutcome("Team assignment updated", `${humanExperts.find((item) => item.id === id)?.name} assignment was updated in this synthetic project session.`, `${project.code}-TEAM-${id.toUpperCase()}`); }} /></>}
        {tab === "governance" && <GovernancePanel project={project} onOutcome={onOutcome} onEvidence={openEvidence} />}
      </section>
      {evidence && <EvidenceDrawer receipt={evidence} onClose={() => setEvidence(null)} onOutcome={onOutcome} />}
      {builderOpen && <AgentBuilder project={project} step={builderStep} name={draftAgentName} onName={setDraftAgentName} onStep={setBuilderStep} onClose={() => setBuilderOpen(false)} onPublish={(draft) => { if (!authorize("agents.create")) return; const sequence = createdAgents.length + 1; const id = `draft-${project.code.toLowerCase()}-${String(sequence).padStart(2, "0")}`; setCreatedAgents((current) => [...current, { id, name: draftAgentName, role: draft.specialty, level: "Apprentice", years: 0, evaluatedRuns: 0, approvedRuns: 0, calibration: 0, overrideRate: 0, failureRate: 0, skills: draft.skillFile ? [...draft.skills, `selected-file:${draft.skillFile}`] : draft.skills, mcps: draft.connections.filter((item) => !item.includes("tool")).map((item) => `${item} · requested`), tools: draft.connections.filter((item) => item.includes("tool")).map((item) => `${item} · draft only`), authority: `Draft manifest inside ${project.client} / ${project.name}; no skill parsing, MCP connection, solver execution, or release`, state: "Draft" }]); setSelectedAgentId(id); setBuilderOpen(false); onOutcome("Agent draft saved", `${draftAgentName} was added as browser-session manifest ${sequence} for ${project.client} / ${project.name}; no Skills.md content was read, MCP connected, evaluation executed, tool created, or agent deployed.`, `AGENT-${project.code}-DRAFT-${String(sequence).padStart(2, "0")}`); }} />}
    </div>
  );
}

function MobileProjectSwitcher({ project, projects, onSelect, pathMode }: { project: WorkspaceProject; projects: readonly WorkspaceProject[]; onSelect: (project: WorkspaceProject) => void; pathMode: ProjectPathMode }) {
  const groups = groupProjectsByPath(projects, pathMode);
  const keys = projectPathKeys(project, pathMode);
  const group = groups.find((item) => item.key === keys.root) ?? groups[0];
  const branch = group?.branches.find((item) => item.key === keys.branch) ?? group?.branches[0];
  const rootValue = pathMode === "tower" ? project.sectorId : project.clientId;
  const branchValue = pathMode === "tower" ? project.clientId : project.sectorId;
  return <fieldset className="mobile-project-switcher"><legend>PROJECT PATH · {pathMode === "tower" ? "TOWER FIRST" : "CLIENT FIRST"}</legend><label><span>{pathMode === "tower" ? "Tower" : "Client"}</span><select value={rootValue} onChange={(event) => onSelect(groups.find((item) => item.id === event.target.value)?.projects[0] ?? project)}>{groups.map((item) => <option value={item.id} key={item.key}>{item.label}</option>)}</select></label><label><span>{pathMode === "tower" ? "Client" : "Tower"}</span><select value={branchValue} onChange={(event) => onSelect(group?.branches.find((item) => item.id === event.target.value)?.projects[0] ?? project)}>{group?.branches.map((item) => <option value={item.id} key={item.key}>{item.label}</option>)}</select></label><label><span>Project</span><select value={project.id} onChange={(event) => onSelect(projects.find((item) => item.id === event.target.value) ?? project)}>{branch?.projects.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.code}</option>)}</select></label></fieldset>;
}

function ProjectTree({ selected, projects, query, onQuery, onSelect, pathMode, onPathModeChange }: { selected: WorkspaceProject; projects: readonly WorkspaceProject[]; query: string; onQuery: (value: string) => void; onSelect: (project: WorkspaceProject) => void; pathMode: ProjectPathMode; onPathModeChange: (mode: ProjectPathMode) => void }) {
  const selectedKeys = projectPathKeys(selected, pathMode);
  const [expandedRoots, setExpandedRoots] = useState<readonly string[]>([selectedKeys.root]);
  const [expandedBranches, setExpandedBranches] = useState<readonly string[]>([selectedKeys.branch]);
  const groups = groupProjectsByPath(projects, pathMode);
  const toggle = (items: readonly string[], id: string) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
  const queryActive = Boolean(query.trim());
  const clientCount = new Set(projects.map((item) => item.clientId)).size;
  const towerCount = new Set(projects.map((item) => item.sectorId)).size;
  return <aside className="project-tree" aria-label="Tower, client, and project navigation"><header><span>PROJECT PATH</span><b>{pathMode === "tower" ? "Tower first" : "Client first"}</b><small>{towerCount} towers · {clientCount} clients · {projects.length} projects</small><div className="project-path-toggle" role="group" aria-label="Project hierarchy order"><button data-action-id="workspace.path.client" className={pathMode === "client" ? "active" : ""} type="button" aria-pressed={pathMode === "client"} onClick={() => onPathModeChange("client")}>By client</button><button data-action-id="workspace.path.tower" className={pathMode === "tower" ? "active" : ""} type="button" aria-pressed={pathMode === "tower"} onClick={() => onPathModeChange("tower")}>By tower</button></div></header><label className="tree-search"><span>⌕</span><span className="sr-only">Find tower, client, or project</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Find tower, client, project" /></label>{queryActive && <button data-action-id="workspace.path.clear-search" className="tree-clear-search" type="button" onClick={() => onQuery("")}>Clear search</button>}<div className="workspace-tree-list">{groups.map((group, groupIndex) => { const rootOpen = queryActive || expandedRoots.includes(group.key) || group.projects.some((project) => project.id === selected.id); return <section className="sector-tree-node" key={group.key}><button data-action-id={`workspace.path.root.${group.key}`} className={group.projects.some((project) => project.id === selected.id) ? "active-context" : ""} type="button" aria-expanded={rootOpen} disabled={queryActive} onClick={() => setExpandedRoots((current) => toggle(current, group.key))}><i>{String(groupIndex+1).padStart(2,"0")}</i><span><small>{group.kind === "tower" ? "TOWER" : "CLIENT"}</small><b>{group.label}</b></span><strong>{rootOpen ? "−" : "+"}</strong></button>{rootOpen && <div className="client-tree-list">{group.branches.map((branch) => { const branchOpen = queryActive || expandedBranches.includes(branch.key) || branch.projects.some((project) => project.id === selected.id); return <div className="client-tree-node" key={branch.key}><button data-action-id={`workspace.path.branch.${branch.key}`} className={branch.projects.some((project) => project.id === selected.id) ? "active-context" : ""} type="button" aria-expanded={branchOpen} disabled={queryActive} onClick={() => setExpandedBranches((current) => toggle(current, branch.key))}><span>⌞</span><div><small>{branch.kind === "tower" ? "TOWER" : "CLIENT"}</small><b>{branch.label}</b></div><i>{branchOpen ? "−" : "+"}</i></button>{branchOpen && <div className="project-tree-list">{branch.projects.map((project) => <div className={`tree-branch ${selected.id === project.id ? "open" : ""}`} key={project.id}><button data-action-id={`workspace.select.${project.id}`} type="button" className={selected.id === project.id ? "active" : ""} aria-current={selected.id === project.id ? "page" : undefined} onClick={() => onSelect(project)}><i>└</i><span><small>{project.code}</small><b>{project.name}</b><em>{project.problem}</em></span><strong className={`project-health health-${project.health}`} /></button>{selected.id === project.id && <div className="tree-active-children"><span>Decisions · {project.counts.decisions}</span><span>Data · {project.counts.observations}</span><span>Apps · {project.counts.apps}</span><span>Agents · {project.counts.agents}</span></div>}</div>)}</div>}</div>; })}</div>}</section>; })}</div><div className="tree-portfolio-note"><b>PROJECT BOUNDARY</b><span>Grouping changes the path only. Every leaf remains bound to one canonical client, tower, and project.</span></div></aside>;
}

function ProjectIntakeSummary({ project, onEvidence }: { project: WorkspaceProject; onEvidence: (target: string | EvidenceReceipt) => void }) {
  const intake = project.operationsWorldIntake;
  if (!intake) return null;
  const receipt = fixtureEvidenceFor(project, {
    id: intake.evidenceRef,
    claim: "Operations World project intake",
    displayedValue: `${intake.intent} · ${intake.selectedLabel}`,
    source: "Operations World browser-session selection",
    formula: `Selection ${intake.selectedId} retained from frame ${intake.frame} under scenario ${intake.scenario}; no dataset or decision was fabricated.`,
    inputs: [intake.selectedKind, intake.selectedId, intake.frame, intake.scenario],
    variableId: "Project intake metadata",
    grain: "Project × Operations World selection",
  });
  return <section className="project-intake-summary"><header><div><p>OPERATIONS WORLD INTAKE</p><h2>{intake.selectedLabel}</h2></div><button data-action-id="workspace.trace-operations-intake" type="button" onClick={() => onEvidence(receipt)}>Trace intake</button></header><dl><div><dt>Intent</dt><dd>{intake.intent}</dd></div><div><dt>Selection</dt><dd>{intake.selectedKind} · {intake.selectedId}</dd></div><div><dt>Frame</dt><dd>{intake.frame}</dd></div><div><dt>Scenario</dt><dd>{intake.scenario}</dd></div></dl></section>;
}

function OverviewPanel({ project, mounted, onTab, onOpenCase, onEvidence, onOpenApp }: { project: WorkspaceProject; mounted: readonly ProjectAppId[]; onTab: (tab: WorkspaceTabId) => void; onOpenCase: () => void; onEvidence: (ref: string | EvidenceReceipt) => void; onOpenApp: (id: ProjectAppId) => void }) {
  const projectDecisions = decisionsFor(project);
  return <div className="project-overview"><section className="project-thesis"><p>OUTCOME</p><h2>{project.outcome}</h2><div><button data-action-id="workspace.open-governed-decision" type="button" onClick={projectDecisions.length ? onOpenCase : () => onTab("decisions")}>{projectDecisions.length ? "Open current decision" : "Set up first decision"}</button><button data-action-id="workspace.ask-expert-society" type="button" onClick={() => onTab("agents")}>Open agent workspace</button></div></section><div className="project-metric-grid">{project.metrics.map((metric) => <button data-action-id={`evidence.open.${metric.evidenceRef}`} className={`metric-${metric.tone}`} type="button" key={metric.label} onClick={() => onEvidence(metric.evidenceRef)}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small><em>Trace {metric.evidenceRef}</em></button>)}</div><div className="project-home-grid"><section><header><p>DECISIONS</p><button data-action-id="workspace.open-decisions" type="button" onClick={() => onTab("decisions")}>{projectDecisions.length ? "View all" : "Set up"}</button></header><ol>{projectDecisions.slice(0,4).map((item) => <li key={item.id}><span>{item.id}</span><div><b>{item.title}</b><small>{item.level} · {item.owner} · {item.value}</small></div></li>)}</ol>{!projectDecisions.length && <p className="inline-empty">No decision briefs in this session.</p>}</section><section><header><p>APPS</p><button data-action-id="workspace.configure-apps" type="button" onClick={() => onTab("apps")}>Manage</button></header><div className="mini-app-graph">{mounted.slice(0,5).map((id, index) => { const app = projectApps.find((item) => item.id === id)!; return <span className="mini-app-entry" key={id}>{index > 0 && <i>{index % 2 ? "feeds" : "challenges"}</i>}<button data-action-id={`workspace.open-app.${id}`} type="button" onClick={() => onOpenApp(id)} style={{color:app.accent}}>{app.name}</button></span>; })}{!mounted.length && <p className="inline-empty">No apps mounted. Open Apps to add one.</p>}</div></section></div><section className="portfolio-footprint"><header><div><p>PROJECT DATA</p><h2>Knowledge footprint</h2></div><button data-action-id="workspace.open-project-data" type="button" onClick={() => onTab("data")}>Open data</button></header><div>{[[project.counts.entities,"entities"],[project.counts.relationships,"relationships"],[project.counts.observations,"L0 observations"],[project.counts.documents,"documents"],[project.counts.events,"events"],[project.counts.claims,"evidence claims"]].map((item) => { const receipt = fixtureEvidenceFor(project, { id: `EV-FOOTPRINT-${item[1]}`, claim: `Project knowledge footprint: ${item[1]}`, displayedValue: item[0], source: "Project knowledge-footprint deterministic fixture", formula: `Declared fixture count of ${item[1]} inside the selected project boundary`, inputs: [project.code, project.client, item[1]], variableId: "Project registry metadata", grain: `Project × ${item[1]}` }); return <button data-action-id={`workspace.trace-footprint.${item[1]}`} type="button" key={item[1]} onClick={() => onEvidence(receipt)}><b>{item[0]}</b><span>{item[1]}</span><em>◇</em></button>; })}</div><footer><span>Variable taxonomy · 481 L0 · 60 L1 · 35 L2</span><b>Method catalog · M-01 to M-30</b></footer></section></div>;
}

function RecentWorkPanel({ sessions, onOpen, onContinue }: { sessions: readonly ProjectWorkSession[]; onOpen: (sessionId: string) => void; onContinue: (sessionId: string) => void }) {
  return <section className="recent-work-panel"><header><div><p>RECENT WORK</p><h2>Agent sessions</h2><span>Resume the conversation, inspect exact app runs, or continue from an immutable fixture.</span></div><b>{sessions.length} SESSIONS</b></header>{sessions.length ? <div className="recent-work-list">{sessions.map((session) => <article key={session.id}><button data-action-id={`workspace.session.open.${session.id}`} className="recent-work-main" type="button" onClick={() => onOpen(session.id)}><span className={`session-status status-${session.status.toLowerCase().replaceAll(" ", "-")}`} /> <div><small>{session.id} · {session.updatedAt}</small><h3>{session.title}</h3><p>{session.finalResult?.headline ?? session.objective}</p></div><em>{session.status}</em></button><dl><div><dt>Lead</dt><dd>{session.leadAgentId}</dd></div><div><dt>Apps</dt><dd>{session.appIds.length}</dd></div><div><dt>Entry</dt><dd>{session.entryPoint}</dd></div></dl><button data-action-id={`workspace.session.continue.${session.id}`} className="recent-work-continue" type="button" onClick={() => onContinue(session.id)}>{session.origin === "Synthetic fixture" ? "Continue as new session" : "Continue session"}</button></article>)}</div> : <div className="recent-work-empty"><b>No work sessions yet</b><p>Open Agent workspace and send the first project brief.</p></div>}</section>;
}

function DecisionPanel({ project, selected, onSelect, onEvidence, onOpenCase, onOutcome }: { project: WorkspaceProject; selected: string; onSelect: (id: string) => void; onEvidence: (ref: string) => void; onOpenCase: () => void; onOutcome: OutcomeHandler }) {
  const projectDecisions = decisionsFor(project);
  const item = projectDecisions.find((candidate) => candidate.id === selected) ?? projectDecisions[0];
  if (!item) return <section className="project-empty-state"><span>DECISIONS</span><h2>No decision briefs yet</h2><p>Define the first decision, then bind variables, methods, evidence, owners, and approval rights.</p><button data-action-id="decisions.create-first" type="button" onClick={() => onOutcome("Decision brief draft opened", `A zero-state decision brief was staged for ${project.name}; no case, model, approval, or execution artifact was created.`, `DECISION-${project.code}-DRAFT-01`)}>Create decision brief draft</button></section>;
  return <div className="decision-os"><section className="decision-tree-panel"><header><div><p>HIGH-LEVEL → LOW-LEVEL DECISIONS</p><h2>Decision decomposition</h2><span>D0–D3 decision levels remain separate from the L2/L1/L0 variable taxonomy.</span></div><button data-action-id="decisions.open-case" type="button" onClick={onOpenCase}>Open decision →</button></header><div className="decision-node-list">{projectDecisions.map((node) => <button data-action-id={`decisions.select.${node.id}`} style={{marginLeft:`${node.id === "D0" ? 0 : node.id === "D1" ? 22 : node.id.startsWith("D2") ? 44 : 66}px`}} className={selected === node.id ? "active" : ""} type="button" key={node.id} onClick={() => onSelect(node.id)}><span>{node.id}</span><div><small>{node.level} · {node.state}</small><b>{node.title}</b><em>{node.owner}</em></div><strong>{node.value}</strong></button>)}</div></section><aside className="decision-inspector"><p>SELECTED DECISION · {item.id}</p><h2>{item.title}</h2><span>{item.level} · {item.state} · owned by {item.owner}</span><button data-action-id={`decisions.evidence.${item.id}`} className="decision-evidence" type="button" onClick={() => onEvidence(item.evidenceRef)}><small>PRIMARY EVIDENCE</small><b>{item.evidenceRef} · {item.value}</b><em>Open receipt →</em></button><section><p>VARIABLE CONTRACT</p><div className="taxonomy-stack"><article><span>L2</span>{project.variablePack.l2.map((value) => <b key={value}>{value}</b>)}</article><article><span>L1</span>{project.variablePack.l1.map((value) => <b key={value}>{value}</b>)}</article><article><span>L0</span>{project.variablePack.l0.slice(0,8).map((value) => <b key={value}>{value}</b>)}</article></div></section><section><p>METHOD REFERENCES</p><div className="method-chips">{project.methodCodes.map((code) => <button data-action-id={`decisions.method.${code}`} type="button" key={code} onClick={() => onOutcome("Method reference opened", `${code} is referenced by ${project.name}; a production formulation, validation result, solver adapter, and fallback are not connected in this concept.`, `METHOD-${code}`)}>{code}</button>)}</div></section><button data-action-id="decisions.create-review" className="primary-dark-action" type="button" onClick={() => onOutcome("Decision review draft created", `${item.id} was packaged in this browser session with variables, method references, evidence, owners, and the project fixture; nothing was released.`, `REVIEW-${project.code}-${item.id}`)}>Create expert review draft</button></aside><section className="method-library"><header><div><p>OR METHODOLOGY CATALOG</p><h2>All 30 handbook techniques are catalogued</h2></div><span>Project references {project.methodCodes.length} methods</span></header><div>{methodFamilies.map((family) => <article key={family.range}><span>{family.range}</span><b>{family.name}</b><p>{family.detail}</p></article>)}</div><footer>Reference catalog only · no live solver execution · exact status, gaps, incumbent, bounds, and optimality must come from a connected solver receipt</footer></section></div>;
}

function AppsPanel({ project, mounted, runs, activityState, dispatchActivity, onOpen, onOpenSession, onEvidence, onOutcome, canRun, activeSessionId, focusedRunId }: { project: WorkspaceProject; mounted: readonly ProjectAppId[]; runs: readonly ProjectAppRun[]; activityState: ProjectActivityState; dispatchActivity: Dispatch<ProjectActivityAction>; onOpen: (id: ProjectAppId) => void; onOpenSession: (sessionId: string) => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler; canRun: boolean; activeSessionId?: string; focusedRunId?: string | null }) {
  const mountReceipt = fixtureEvidenceFor(project, { id: "EV-APP-MOUNT-MANIFEST", claim: "Project app mount manifest", displayedValue: `${mounted.length} mounted of ${projectApps.length} available`, source: "Browser-session project app manifest", formula: "Count of app contracts mounted to the selected project fixture", inputs: mounted, grain: "Project × app contract" });
  return <div className="apps-os">
    <header className="section-hero"><div><p>APPS</p><h2>Project applications</h2><span>Mount specialist tools against this project&apos;s data, variables, methods, agents, and evidence.</span></div><button data-action-id="apps.trace-mount-manifest" type="button" onClick={() => onEvidence(mountReceipt)}>Trace app manifest</button></header>
    <section className="app-graph-canvas"><div className="app-graph-core"><span>PROJECT GRAPH</span><b>{project.code}</b><small>{project.counts.relationships} synthetic relationships</small></div>{projectApps.map((app,index) => <button data-action-id={`apps.graph.${app.id}`} className={`app-graph-node n${index+1} ${mounted.includes(app.id) ? "mounted" : "available"}`} style={{"--node-accent":app.accent} as React.CSSProperties} type="button" key={app.id} onClick={() => onOpen(app.id)}><span>{app.icon}</span><b>{app.name}</b><small>{mounted.includes(app.id) ? "Mounted" : "Mount"}</small></button>)}<div className="app-edge-ledger">{appDependencyEdges.slice(0,6).map((edge) => <span key={`${edge[0]}-${edge[1]}`}><b>{edge[0]}</b> → {edge[1]} <em>{edge[2]}</em></span>)}</div></section>
    <section className="app-catalog-grid">{projectApps.map((app) => <article data-app-theme={app.id} key={app.id} style={{"--app-accent":app.accent} as React.CSSProperties}><header><span>{app.icon}</span><div><small>{app.archetype}</small><h3>{app.name}</h3></div><em>{mounted.includes(app.id) ? "MOUNTED" : app.status.toUpperCase()}</em></header><p>{app.outcome}</p><dl><div><dt>Terminal artifact</dt><dd>{app.artifact}</dd></div><div><dt>Methods</dt><dd>{app.methodCodes.join(" · ")}</dd></div><div><dt>Variables</dt><dd>{app.variableIds.join(" · ")}</dd></div></dl><button data-action-id={`apps.open.${app.id}`} type="button" onClick={() => onOpen(app.id)}>{mounted.includes(app.id) ? `Open ${app.name}` : `Mount ${app.name}`} →</button></article>)}</section>
    <AppRunHistory project={project} runs={runs} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={onOpen} onOpenSession={onOpenSession} onEvidence={onEvidence} onOutcome={onOutcome} canRun={canRun} activeSessionId={activeSessionId} focusedRunId={focusedRunId} />
  </div>;
}

export function AppRunHistory({ project, runs, activityState, dispatchActivity, onOpen, onOpenSession, onOutcome, canRun = true, activeSessionId, focusedRunId }: { project: WorkspaceProject; runs: readonly ProjectAppRun[]; activityState: ProjectActivityState; dispatchActivity: Dispatch<ProjectActivityAction>; onOpen: (id: ProjectAppId) => void; onOpenSession: (sessionId: string) => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler; canRun?: boolean; activeSessionId?: string; focusedRunId?: string | null }) {
  const focused = focusedRunId ? runs.find((run) => run.id === focusedRunId) : undefined;
  const fallback = focused ?? runs[0] ?? null;
  const [selectedRunId, setSelectedRunId] = useState(fallback?.id ?? "");
  const [inputPanelOpen, setInputPanelOpen] = useState(true);
  const [artifactReceipt, setArtifactReceipt] = useState<EvidenceReceipt | null>(null);
  const selected = runs.find((run) => run.id === selectedRunId) ?? fallback;
  if (!selected) return <section className="app-run-workspace"><header><div><p>RUN HISTORY</p><h2>No application runs yet</h2></div></header><p className="inline-empty">Mount an app and create a project session before replaying a fixture.</p></section>;
  const app = projectApps.find((item) => item.id === selected.appId)!;
  const draft = activityState.runDrafts[selected.id] ?? {};
  const appHistory = runs.filter((run) => run.appId === selected.appId);
  const changedCount = selected.inputs.filter((input) => draft[input.key] !== undefined && draft[input.key] !== input.value).length;
  const changedInputs = selected.changeSet.length ? selected.changeSet.map((change) => `${change.key}:${change.before}->${change.after}`) : ["No changed assumptions"];
  const runInputs = selected.inputs.map((input) => `${input.key}=${input.value}${input.unit}`);
  const reportReceipt: EvidenceReceipt = {
    ...fixtureEvidenceFor(project, {
      id: selected.reportId,
      claim: `${app.name} application report`,
      displayedValue: selected.summary,
      source: `Immutable ${selected.origin.toLowerCase()} application-run record ${selected.id}`,
      formula: `${selected.methods.join(" + ")} · ${selected.claimBoundary}`,
      inputs: [`run=${selected.id}`, `session=${selected.sessionId}`, `trace=${selected.traceId}`, `fingerprint=${selected.inputFingerprint}`, ...runInputs, ...changedInputs, ...selected.outputs.map((output) => `${output.label}=${output.value} [${output.evidenceRef}]`)],
      variableId: app.variableIds[0],
      grain: "Project × session × application report",
    }),
    id: selected.reportId,
    locator: `fixture://workspace/${project.id}/runs/${selected.id}/report/${selected.reportId}`,
    version: selected.inputVersion,
    contentHash: selected.inputFingerprint,
    traceId: selected.traceId,
  };
  const traceReceipt: EvidenceReceipt = {
    ...fixtureEvidenceFor(project, {
      id: selected.traceId,
      claim: `${app.name} run trace`,
      displayedValue: `${selected.status} · ${selected.inputFingerprint}`,
      source: `Project activity ledger for ${selected.id}`,
      formula: `Parent ${selected.parentRunId ?? "fixture root"} -> run ${selected.id} -> report ${selected.reportId}; ${selected.claimBoundary}`,
      inputs: [`session=${selected.sessionId}`, `origin=${selected.origin}`, `executed=${selected.executedAt}`, ...runInputs, ...changedInputs, ...selected.outputs.map((output) => `output:${output.label}=${output.value}; evidence=${output.evidenceRef}`)],
      variableId: app.variableIds[0],
      grain: "Project × session × application trace step",
    }),
    id: selected.traceId,
    locator: `fixture://workspace/${project.id}/runs/${selected.id}/trace/${selected.traceId}`,
    version: selected.inputVersion,
    contentHash: selected.inputFingerprint,
    traceId: selected.traceId,
  };
  const outputReceipt = (output: ProjectAppRun["outputs"][number], index: number): EvidenceReceipt => ({
    ...fixtureEvidenceFor(project, {
      id: `${selected.id}-OUTPUT-${index + 1}`,
      claim: `${app.name} output: ${output.label}`,
      displayedValue: output.value,
      source: `Deterministic output in application run ${selected.id}; baseline evidence ${output.evidenceRef}`,
      formula: `${selected.summary} ${selected.claimBoundary}`,
      inputs: [`run=${selected.id}`, `session=${selected.sessionId}`, `source-evidence=${output.evidenceRef}`, `fingerprint=${selected.inputFingerprint}`, ...runInputs, ...changedInputs],
      variableId: app.variableIds[index] ?? app.variableIds[0],
      grain: "Project × session × application output",
    }),
    traceId: selected.traceId,
    version: selected.inputVersion,
    contentHash: selected.inputFingerprint,
  });
  const replay = () => {
    const plan = planAppRerun(activityState, project.id, selected.id, activeSessionId);
    if (!plan) {
      onOutcome("Application replay blocked", `No valid project session was available for ${selected.id}; no run was created.`, selected.id, "Blocked");
      return;
    }
    setSelectedRunId(plan.runId);
    setArtifactReceipt(null);
    dispatchActivity({ type: "rerun-app", projectId: project.id, runId: selected.id, sessionId: activeSessionId });
    onOutcome(
      "Application replay recorded",
      `${plan.runId} was created in ${plan.sessionId}${plan.fixtureSessionForked ? ` by continuing immutable fixture ${plan.sourceSessionId}` : ""} with ${changedCount} changed assumption${changedCount === 1 ? "" : "s"}; parent ${selected.id} remains immutable and no live service or solver ran.`,
      plan.runId,
    );
  };
  return <>
    <section className="app-run-workspace"><header><div><p>APPLICATION WORK</p><h2>Runs, reports, and reruns</h2><span>Each app preserves its inputs, trace, report, parent session, and evidence references.</span></div><b>{runs.length} RUNS</b></header><div className="app-run-layout"><aside className="app-run-list"><header><b>{app.name}</b><span>{appHistory.length} runs</span></header>{runs.map((run) => { const runApp = projectApps.find((item) => item.id === run.appId)!; return <button data-action-id={`apps.run.select.${run.id}`} className={selected.id === run.id ? "active" : ""} type="button" key={run.id} onClick={() => { setSelectedRunId(run.id); setArtifactReceipt(null); dispatchActivity({ type: "select-app-run", projectId: project.id, appId: run.appId, runId: run.id }); }}><i style={{background:runApp.accent}}>{runApp.icon}</i><span><small>{run.id}</small><b>{run.title}</b><em>{run.status} · {run.executedAt}</em></span></button>; })}</aside><article className="app-run-detail"><header><div><span>{selected.status} · {selected.origin}</span><h3>{selected.title}</h3><p>{selected.id} · from <button data-action-id={`apps.run.session.${selected.sessionId}`} type="button" onClick={() => onOpenSession(selected.sessionId)}>{selected.sessionId}</button></p></div><button data-action-id={`apps.run.open-app.${selected.id}`} type="button" onClick={() => onOpen(selected.appId)}>Open {app.name}</button></header><div className="app-run-receipts"><button data-action-id={`apps.run.report.${selected.id}`} type="button" onClick={() => setArtifactReceipt(reportReceipt)}><small>REPORT</small><b>{selected.reportId}</b></button><button data-action-id={`apps.run.trace.${selected.id}`} type="button" onClick={() => setArtifactReceipt(traceReceipt)}><small>TRACE</small><b>{selected.traceId}</b></button><button data-action-id={`apps.run.parent.${selected.id}`} type="button" disabled={!selected.parentRunId} onClick={() => { if (!selected.parentRunId) return; setSelectedRunId(selected.parentRunId); setArtifactReceipt(null); dispatchActivity({ type: "select-app-run", projectId: project.id, appId: selected.appId, runId: selected.parentRunId }); }}><small>PARENT RUN</small><b>{selected.parentRunId ?? "Fixture root"}</b></button></div><button data-action-id={`apps.run.toggle-inputs.${selected.id}`} className="app-input-toggle" type="button" aria-expanded={inputPanelOpen} onClick={() => setInputPanelOpen((current) => !current)}>{inputPanelOpen ? "Hide inputs" : "Show inputs"}<span>{changedCount ? `${changedCount} pending changes` : `${selected.inputVersion} · ${selected.inputFingerprint}`}</span></button>{inputPanelOpen && <div className="app-run-inputs">{selected.inputs.map((input) => <label key={input.key}><span>{input.label}<small>{input.evidenceRef ? `Evidence ${input.evidenceRef}` : input.editable ? "Editable assumption" : "Locked input"}</small></span><span><input value={draft[input.key] ?? input.value} disabled={!input.editable || !canRun} onChange={(event) => dispatchActivity({ type: "edit-app-input", projectId: project.id, runId: selected.id, key: input.key, value: event.target.value })} /><em>{input.unit}</em></span></label>)}</div>}<section className="app-run-output"><p>RESULT</p><h3>{selected.summary}</h3><div>{selected.outputs.map((output, index) => <button data-action-id={`apps.run.output.${selected.id}.${output.label}`} type="button" key={output.label} onClick={() => setArtifactReceipt(outputReceipt(output, index))}><span>{output.label}</span><b>{output.value}</b><small>{output.evidenceRef}</small></button>)}</div>{selected.changeSet.length > 0 && <dl>{selected.changeSet.map((change) => <div key={change.key}><dt>{change.key}</dt><dd>{change.before} → {change.after}</dd></div>)}</dl>}<small>{selected.claimBoundary}</small></section><footer><button data-action-id={`apps.run.replay.${selected.id}`} type="button" disabled={!canRun} onClick={replay}>{changedCount ? "Rerun with changes" : "Replay fixture"}</button><span>{canRun ? "No source write-back · no optimality claim" : "Run permission required"}</span></footer></article></div></section>
    {artifactReceipt && <EvidenceDrawer receipt={artifactReceipt} onClose={() => setArtifactReceipt(null)} onOutcome={onOutcome} />}
  </>;
}

function DataPanel({ project, uploadStage, uploadName, sessionDatasets, connectorDrafts, onRequestConnector, onReviewConnector, onTestConnector, onFile, onUseSample, onAdvance, onEvidence, onOutcome }: { project: WorkspaceProject; uploadStage: string; uploadName: string; sessionDatasets: readonly { id: string; name: string; rows: string; state: string }[]; connectorDrafts: readonly ProjectConnectorDraft[]; onRequestConnector: (templateId: string) => void; onReviewConnector: (connectorId: string) => void; onTestConnector: (connectorId: string) => void; onFile: (event: ChangeEvent<HTMLInputElement>) => void; onUseSample: () => void; onAdvance: () => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler }) {
  const stages = ["Select", "Staged", "Schema preview", "Mapping draft", "Review demo", "Session receipt"];
  const stageDetails = ["Choose file", "Filename only", "Illustrative schema", "Proposed source → L0", "Demonstration gate", "No durable merge"];
  const current = stages.indexOf(uploadStage);
  const projectDatasetViews = datasetsFor(project);
  const batchRows = [
    ["Project boundary", `${project.client} / ${project.name}`],
    ["File handling", "Filename captured; contents not read"],
    ["Illustrative grain", "Entity × variable × valid time"],
    ["Fixture rows / columns", "240 / 14"],
    ["Proposed L0 mappings", "12 / 14"],
    ["Persistence", "Browser session only; no merge"],
  ];

  return <div className="data-vault">
    <header className="section-hero"><div><p>DATA</p><h2>Project data and sources</h2><span>Stage files, define source contracts, and request IoT integrations inside this project boundary.</span></div><span className="truth-chip">SESSION-ONLY</span></header>
    <section className="ingestion-workbench">
      <div className="ingestion-steps">{stages.map((stage,index) => <article className={index < current ? "done" : index === current ? "active" : ""} key={stage}><span>{index < current ? "✓" : String(index+1).padStart(2,"0")}</span><b>{stage}</b><small>{stageDetails[index]}</small></article>)}</div>
      <div className="upload-drop"><div><span>⇧</span><h3>{uploadName || "Bring project evidence into Maya"}</h3><p>CSV, XLSX, JSON, PDF, Parquet · filename metadata only</p></div><label data-action-id="data.choose-file">Choose local file<input type="file" accept=".csv,.xlsx,.json,.pdf,.parquet" onChange={onFile} /></label><button data-action-id="data.use-sample" type="button" onClick={onUseSample}>Use synthetic sample</button></div>
      {uploadStage !== "Select" && <div className="upload-contract"><header><div><p>CURRENT DEMONSTRATION BATCH</p><h3>{uploadName}</h3></div><span>{uploadStage}</span></header><div>{batchRows.map((row) => <dl key={row[0]}><dt>{row[0]}</dt><dd>{row[1]}</dd></dl>)}</div><button data-action-id={`data.advance.${uploadStage}`} type="button" onClick={uploadStage === "Session receipt" ? () => onOutcome("Session receipt reopened", `${uploadName} has one metadata-only browser-session receipt; no dataset was created or merged.`, `INGESTION-${project.code}-UB-01`) : onAdvance}>{uploadStage === "Review demo" ? "Create session receipt" : uploadStage === "Session receipt" ? "View session receipt" : `Continue to ${stages[current+1]}`} →</button></div>}
    </section>
    <section className="dataset-register"><header><div><p>DATA PRODUCTS</p><h2>{projectDatasetViews.length + sessionDatasets.length} dataset views</h2></div><button data-action-id="data.connection-request" type="button" onClick={() => onRequestConnector("readonly-cdc-api")}>Request enterprise source</button></header><div className="dataset-card-grid">
      {projectDatasetViews.map((dataset) => { const receipt = fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} registry metadata`, displayedValue: `${dataset.rows} rows · ${dataset.quality}% quality`, source: `${dataset.source} deterministic registry fixture`, formula: `Static fixture metadata; freshness ${dataset.freshness}; state ${dataset.state}`, variableId: dataset.variables[0], grain: dataset.grain, inputs: dataset.variables }); return <article className="dataset-card" key={dataset.id}><header><div><small>{dataset.id}</small><h3>{dataset.name}</h3></div><span>{dataset.state}</span></header><p>{dataset.source}</p><small>{dataset.grain}</small><dl><div><dt>Records</dt><dd>{dataset.rows}</dd></div><div><dt>Freshness</dt><dd>{dataset.freshness}</dd></div><div><dt>Quality</dt><dd>{dataset.quality}%</dd></div></dl><div className="dataset-bindings"><span>Taxonomy bindings</span>{dataset.variables.map((variable) => <b key={variable}>{variable}</b>)}</div><button data-action-id={`data.trace.${dataset.id}`} type="button" onClick={() => onEvidence(receipt)}>Trace dataset ◇</button></article>; })}
      {sessionDatasets.map((dataset) => { const receipt = fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} session-preview metadata`, displayedValue: `${dataset.rows} · no persisted dataset`, source: "Browser-session filename and synthetic ingestion fixture", formula: "No file-content read; demonstration metadata only", variableId: project.variablePack.l0[0], grain: "Browser session" }); return <article className="dataset-card session-dataset" key={dataset.id}><header><div><small>{dataset.id}</small><h3>{dataset.name}</h3></div><span>{dataset.state}</span></header><p>Local session</p><small>Filename + synthetic preview only</small><dl><div><dt>Records</dt><dd>{dataset.rows}</dd></div><div><dt>Freshness</dt><dd>Now</dd></div><div><dt>Quality</dt><dd>Not measured</dd></div></dl><div className="dataset-bindings"><span>Proposed bindings</span>{project.variablePack.l0.slice(0,3).map((variable) => <b key={variable}>{variable}</b>)}</div><button data-action-id={`data.trace.${dataset.id}`} type="button" onClick={() => onEvidence(receipt)}>Trace preview ◇</button></article>; })}
    </div></section>
    <section className="iot-sources"><header><div><p>IOT AND EDGE SOURCES</p><h2>Source integration requests</h2><span>Choose a project-scoped template. Requests never connect a device, endpoint, credential, broker, or external feed.</span></div><span>{connectorDrafts.length} session drafts</span></header><div className="iot-template-grid">{connectorTemplates.map((template) => <article key={template.id}><div><span>{template.sourceClass}</span><em>{template.catalogState}</em></div><h3>{template.name}</h3><p>{template.protocol}</p><small>{template.targetData.join(" · ")}</small><dl><div><dt>Boundary</dt><dd>{template.targetBoundary}</dd></div><div><dt>Direction</dt><dd>{template.targetDirection}</dd></div><div><dt>Current limit</dt><dd>{template.limitations}</dd></div></dl><button data-action-id={`data.connector.request.${template.id}`} type="button" onClick={() => onRequestConnector(template.id)}>Request source setup</button></article>)}</div>{connectorDrafts.length > 0 && <div className="iot-draft-list"><header><b>SESSION REQUESTS</b><span>Project {project.code}</span></header>{connectorDrafts.map((connector) => <article key={connector.id}><div><span>{connector.state}</span><b>{connector.name}</b><small>{connector.protocol}</small></div><dl><div><dt>Policy</dt><dd>{connector.policyReviewState}</dd></div><div><dt>Fixture sample</dt><dd>{connector.sampleState}</dd></div><div><dt>Endpoint</dt><dd>{connector.endpointState}</dd></div><div><dt>Credentials</dt><dd>{connector.credentialState}</dd></div><div><dt>Network</dt><dd>{connector.networkState}</dd></div></dl><button data-action-id={`data.connector.trace.${connector.id}`} type="button" onClick={() => onEvidence(connectorReceiptFor(project, connector))}>Trace request</button><button data-action-id={`data.connector.review.${connector.id}`} type="button" onClick={() => onReviewConnector(connector.id)}>{connector.policyReviewState === "Policy review queued" ? "Policy review queued" : "Send to policy review"}</button><button data-action-id={`data.connector.test.${connector.id}`} type="button" onClick={() => onTestConnector(connector.id)}>{connector.sampleState === "Fixed payload replayed" ? "Replay fixed sample" : "Test fixed sample"}</button></article>)}</div>}</section>
  </div>;
}

function GraphPanel({ project, nodes, traceSteps, selectedNode, onSelect, selected, traceIndex, onEvidence, onSteer }: { project: WorkspaceProject; nodes: ReturnType<typeof graphNodesFor>; traceSteps: readonly TraceStep[]; selectedNode: string; onSelect: (id: string) => void; selected: ReturnType<typeof graphNodesFor>[number]; traceIndex: number; onEvidence: (target: string | EvidenceReceipt) => void; onSteer: (label: string) => void }) {
  const activeNodes: readonly string[] = traceIndex >= 0 ? traceSteps[traceIndex]?.nodes ?? [] : [];
  if (!selected) return <section className="project-empty-state"><span>KNOWLEDGE GRAPH</span><h2>No project graph yet</h2><p>Add a governed dataset or source contract before agents can traverse project entities and relationships.</p><button data-action-id="graph.open-data" type="button" onClick={() => onSteer("Open Data to add the first governed source")}>Record graph setup intent</button></section>;
  const selectedReceipt = fixtureEvidenceFor(project, { id: `EV-GRAPH-${selected.id}`, claim: `${selected.kind} graph node`, displayedValue: `${selected.label} · ${selected.detail}`, source: "Project knowledge-graph deterministic fixture", formula: "Selected project-scoped node and its fixture relationship context", inputs: [selected.evidenceRef, selected.id], grain: "Graph node" });
  return <div className="graph-os"><header className="section-hero"><div><p>GRAPH</p><h2>Project knowledge graph</h2><span>Inspect evidence-linked entities and steer the visible synthetic traversal.</span></div><span className="truth-chip">7 NODES · {project.counts.entities} ENTITIES</span></header><div className="graph-layout"><section className="project-knowledge-canvas"><div className="graph-grid-lines" />{projectGraphEdges.map((edge,index) => <span className={`graph-edge ge${index+1}`} key={`${edge[0]}-${edge[1]}`}><i />{edge[2]}</span>)}{nodes.map((node) => <button data-action-id={`graph.select.${node.id}`} style={{left:`${node.x}%`,top:`${node.y}%`}} className={`project-graph-node kind-${node.kind.toLowerCase()} ${selectedNode === node.id ? "selected" : ""} ${activeNodes.includes(node.id) ? "tracing" : ""}`} type="button" key={node.id} onClick={() => onSelect(node.id)}><small>{node.kind}</small><b>{node.label}</b><span>{node.detail}</span></button>)}</section><aside className="graph-sidecar"><p>SELECTED NODE</p><h2>{selected.label}</h2><span>{selected.kind} · {selected.detail}</span><button data-action-id={`graph.evidence.${selected.id}`} type="button" onClick={() => onEvidence(selectedReceipt)}><small>EVIDENCE RECEIPT</small><b>{selectedReceipt.id}</b><em>Open fixture manifest</em></button><section><p>STEER TRACE</p>{["Pin as assumption", "Exclude this source", "Make a hard constraint", "Assign specialist", "Request alternative path"].map((action) => <button data-action-id={`graph.steer.${action}`} type="button" key={action} onClick={() => onSteer(action)}>{action}<span>+</span></button>)}</section></aside></div><section className="trace-playback"><header><p>AGENT TRAVERSAL</p><span>{traceIndex >= 0 ? `Step ${traceIndex+1} of ${traceSteps.length}` : "Start a run from Agents"}</span></header>{traceSteps.map((step,index) => <article className={index < traceIndex ? "done" : index === traceIndex ? "active" : ""} key={step.title}><span>{String(index+1).padStart(2,"0")}</span><div><small>{step.state} · {step.agent}</small><b>{step.title}</b></div></article>)}</section></div>;
}

type AgentPanelProps = {
  project: WorkspaceProject;
  traceSteps: readonly TraceStep[];
  selectedAgent: ExpertAgent | null;
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  sessions: readonly ProjectWorkSession[];
  selectedSession: ProjectWorkSession | null;
  messages: readonly SessionMessage[];
  activities: readonly SessionActivity[];
  appRuns: readonly ProjectAppRun[];
  sessionsOpen: boolean;
  inspectorOpen: boolean;
  onToggleSessions: () => void;
  onToggleInspector: () => void;
  onSelectSession: (id: string) => void;
  onContinueSession: (id: string) => void;
  onOpenRun: (id: string) => void;
  chatText: string;
  onChatText: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  traceIndex: number;
  runState: string;
  onAdvance: () => void;
  onCancel: () => void;
  onSteer: (label: string) => void;
  onEvidence: (target: string | EvidenceReceipt) => void;
  onOpenBuilder: () => void;
  agents: readonly ExpertAgent[];
};

function AgentPanel({ project, traceSteps, selectedAgent, selectedAgentId, onSelectAgent, sessions, selectedSession, messages, activities, appRuns, sessionsOpen, inspectorOpen, onToggleSessions, onToggleInspector, onSelectSession, onContinueSession, onOpenRun, chatText, onChatText, onSubmit, traceIndex, runState, onAdvance, onCancel, onSteer, onEvidence, onOpenBuilder, agents }: AgentPanelProps) {
  const [inspectorTab, setInspectorTab] = useState<"result" | "trace" | "apps" | "agents">("result");
  if (!selectedAgent) return <section className="project-empty-state"><span>AGENTS</span><h2>No agents in this project</h2><p>Create a project-scoped agent manifest before a trace or formulation can run.</p><button data-action-id="agents.open-builder.empty" type="button" onClick={onOpenBuilder}>New agent</button></section>;
  const evaluationReceipt = fixtureEvidenceFor(project, { id: `EV-AGENT-${selectedAgent.id}-PROFILE`, claim: `${selectedAgent.name} synthetic experience and evaluation profile`, displayedValue: `${selectedAgent.evaluatedRuns} evaluated · ${selectedAgent.approvedRuns} approved · ${selectedAgent.calibration}% calibration`, source: "Synthetic agent-profile and evaluation-history fixture", formula: `Illustrative profile only; ${selectedAgent.years} domain-profile years, ${selectedAgent.overrideRate}% override rate, ${selectedAgent.failureRate}% failure rate`, inputs: [...selectedAgent.skills, ...selectedAgent.mcps, ...selectedAgent.tools], grain: "Agent profile × fixture evaluation history" });
  const linkedRuns = selectedSession ? appRuns.filter((run) => run.sessionId === selectedSession.id) : [];
  const result = selectedSession?.finalResult;
  return <div className={`agent-os ${sessionsOpen ? "" : "sessions-collapsed"} ${inspectorOpen ? "" : "inspector-collapsed"}`}>
    <aside className="agent-session-rail"><header><div><p>SESSIONS</p><h2>{sessions.length} work threads</h2></div><button data-action-id="agents.toggle-sessions" type="button" aria-expanded={sessionsOpen} title={sessionsOpen ? "Collapse sessions" : "Expand sessions"} onClick={onToggleSessions}>{sessionsOpen ? "‹" : "›"}</button></header>{sessionsOpen && <><div className="agent-session-list">{sessions.map((session) => <button data-action-id={`agents.session.select.${session.id}`} className={selectedSession?.id === session.id ? "active" : ""} type="button" key={session.id} onClick={() => onSelectSession(session.id)}><span className={`session-status status-${session.status.toLowerCase().replaceAll(" ", "-")}`} /><div><small>{session.id}</small><b>{session.title}</b><em>{session.updatedAt}</em></div><strong>{session.status}</strong></button>)}</div>{selectedSession && <button data-action-id={`agents.session.continue.${selectedSession.id}`} className="agent-new-session" type="button" onClick={() => onContinueSession(selectedSession.id)}>Continue as new session</button>}</>}</aside>
    <section className="agent-session"><header><div><p>{selectedSession ? `${selectedSession.id} · ${selectedSession.entryPoint} entry` : "NEW PROJECT SESSION"}</p><h2>{selectedSession?.title ?? `${project.name} work session`}</h2></div><span className={`run-state run-${runState.toLowerCase()}`}>{selectedSession?.status ?? runState}</span></header><div className="agent-messages">{messages.length ? messages.map((message) => <article className={`message-${message.role}`} key={message.id}><header><span>{message.role === "user" ? "YOU" : message.role === "agent" ? message.author : "SYSTEM"}</span><code>{message.id}</code><time>{message.time}</time></header><p>{message.body}</p>{(message.evidenceRefs.length > 0 || message.appRunRefs.length > 0) && <footer>{message.evidenceRefs.map((ref) => <button data-action-id={`agents.message.evidence.${message.id}.${ref}`} type="button" key={ref} onClick={() => onEvidence(ref)}>◇ {ref}</button>)}{message.appRunRefs.map((ref) => <button data-action-id={`agents.message.app-run.${message.id}.${ref}`} type="button" key={ref} onClick={() => onOpenRun(ref)}>▣ {ref}</button>)}</footer>}</article>) : <div className="agent-session-zero"><b>Start the first project session</b><p>Send a brief below. Maya will create a stable session ID and visible scope receipt.</p></div>}{traceIndex >= 0 && <div className="tool-trace-stream">{traceSteps.slice(0, traceIndex+1).map((step,index) => { const receipt = fixtureEvidenceFor(project, { id: `EV-AGENT-TRACE-${index+1}`, claim: step.title, displayedValue: `${step.state} · ${step.agent}`, source: "Visible agent-trace deterministic fixture", formula: step.detail, inputs: step.nodes, grain: "Agent run × trace step" }); return <button data-action-id={`agents.trace.${index+1}`} type="button" className={index === traceIndex ? "active" : "done"} key={step.title} onClick={() => onEvidence(receipt)}><span>{index < traceIndex ? "✓" : "›"}</span><div><small>{step.state} · {step.agent}</small><b>{step.title}</b><p>{step.detail}</p></div><em>◇</em></button>; })}</div>}{result && <section className="agent-final-result"><span>FINAL RESULT · HUMAN REVIEW REQUIRED</span><h3>{result.headline}</h3><p>{result.recommendation}</p><div>{result.metrics.map((metric) => <dl key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></dl>)}</div><footer>{result.evidenceRefs.map((ref) => <button data-action-id={`agents.result.evidence.${ref}`} type="button" key={ref} onClick={() => onEvidence(ref)}>{ref}</button>)}</footer><small>{result.reviewGate} · {result.claimBoundary}</small></section>}</div><div className="agent-steering-bar">{["Pause + pin assumption", "Add service constraint", "Reject source", "Compare robust model"].map((action) => <button data-action-id={`agents.steer.${action}`} type="button" key={action} onClick={() => onSteer(action)}>{action}</button>)}</div><form className="agent-prompt" onSubmit={onSubmit}><label className="sr-only" htmlFor="project-agent-prompt">Ask project agents</label><textarea id="project-agent-prompt" value={chatText} onChange={(event) => onChatText(event.target.value)} placeholder="Ask the project agents, change an assumption, or request another formulation…" /><footer><span>{project.client} / {project.name} only · fixture tools require approval</span><button data-action-id="agents.send-prompt" type="submit" disabled={!chatText.trim()}>Send ↵</button></footer></form></section>
    <aside className="agent-trace-panel"><header className="agent-inspector-heading"><div><p>SESSION CONTEXT</p><h2>{selectedSession?.id ?? "No session"}</h2></div><button data-action-id="agents.toggle-inspector" type="button" aria-expanded={inspectorOpen} title={inspectorOpen ? "Collapse context" : "Expand context"} onClick={onToggleInspector}>{inspectorOpen ? "›" : "‹"}</button></header>{inspectorOpen && <><nav className="agent-inspector-tabs" aria-label="Agent session context">{(["result","trace","apps","agents"] as const).map((item) => <button data-action-id={`agents.inspector.${item}`} className={inspectorTab === item ? "active" : ""} type="button" key={item} onClick={() => setInspectorTab(item)}>{item}</button>)}</nav><div className="agent-inspector-body">{inspectorTab === "result" && <section><p>REVIEW PACKAGE</p>{result ? <><h3>{result.headline}</h3><dl className="agent-result-metrics">{result.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl><small>{result.reviewGate}</small></> : <p>No final result has been recorded for this session.</p>}</section>}{inspectorTab === "trace" && <section><p>WORK TRACE</p><div className="session-activity-list">{activities.map((activity) => <button data-action-id={`agents.activity.${activity.id}`} type="button" key={activity.id} onClick={() => activity.appRunId ? onOpenRun(activity.appRunId) : activity.evidenceRefs[0] ? onEvidence(activity.evidenceRefs[0]) : onEvidence(fixtureEvidenceFor(project, { id: `EV-${activity.id}`, claim: activity.title, displayedValue: activity.state, source: "Project activity fixture", formula: activity.detail, inputs: [activity.actor, activity.type], grain: "Session activity" }))}><span>{String(activity.sequence).padStart(2,"0")}</span><div><small>{activity.id} · {activity.actor}</small><b>{activity.title}</b><p>{activity.detail}</p></div><em>{activity.state}</em></button>)}</div></section>}{inspectorTab === "apps" && <section><p>APPS USED</p><div className="session-app-runs">{linkedRuns.map((run) => <button data-action-id={`agents.app-run.${run.id}`} type="button" key={run.id} onClick={() => onOpenRun(run.id)}><b>{projectApps.find((app) => app.id === run.appId)?.name}</b><small>{run.id}</small><span>{run.status}</span></button>)}{!linkedRuns.length && <p>No application run is linked yet.</p>}</div></section>}{inspectorTab === "agents" && <section><div className="agent-roster-heading"><p>EXPERT AGENTS</p><button data-action-id="agents.open-builder" type="button" onClick={onOpenBuilder}>New agent</button></div><div className="agent-roster-compact">{agents.map((agent) => <button data-action-id={`agents.select.${agent.id}`} className={selectedAgentId === agent.id ? "active" : ""} type="button" key={agent.id} onClick={() => onSelectAgent(agent.id)}><span>{agent.name.split(" ").map((word) => word[0]).join("").slice(0,2)}</span><div><b>{agent.name}</b><small>{agent.level} · {agent.years}y fixture profile</small></div></button>)}</div><div className="agent-profile-compact"><h3>{selectedAgent.name}</h3><p>{selectedAgent.role}</p><div className="agent-level"><b>{selectedAgent.level}</b><span>{selectedAgent.years} years domain-profile fixture</span></div><dl><div><dt>Evaluated</dt><dd>{selectedAgent.evaluatedRuns}</dd></div><div><dt>Approved</dt><dd>{selectedAgent.approvedRuns}</dd></div><div><dt>Calibration</dt><dd>{selectedAgent.calibration}%</dd></div></dl><button data-action-id="agents.trace-profile" type="button" onClick={() => onEvidence(evaluationReceipt)}>Trace profile</button><small>{selectedAgent.authority}</small></div></section>}</div><div className="run-controls"><button data-action-id="agents.advance-run" type="button" onClick={onAdvance}>{runState === "Ready" ? "Start new trace" : runState === "Completed" || runState === "Cancelled" ? "Replay trace" : traceIndex === traceSteps.length - 1 ? "Complete at human gate" : "Next trace step"}</button><button data-action-id="agents.cancel-run" type="button" disabled={runState !== "Running"} onClick={onCancel}>Cancel</button></div></>}</aside>
  </div>;
}

function ProjectMembershipsPanel({ project, members, onEvidence }: { project: WorkspaceProject; members: readonly ProjectMemberView[]; onEvidence: (target: string | EvidenceReceipt) => void }) {
  return <section className="project-memberships">
    <header><div><p>PROJECT MEMBERS</p><h2>Client and Kearney access</h2><span>Memberships are scoped to {project.client} / {project.name}.</span></div><span>{members.length} MEMBERS</span></header>
    <div>{members.map(({ membership, collaborator }) => {
      const receipt = fixtureEvidenceFor(project, { id: `EV-MEMBER-${collaborator.id}`, claim: `${collaborator.name} project membership`, displayedValue: `${membership.projectRole} · ${membership.capabilities.length} capabilities`, source: "Project membership deterministic fixture", formula: "Joined collaborator profile to the project-scoped membership and declared capability list", inputs: [collaborator.id, membership.id, ...membership.capabilities], variableId: "Project access metadata", grain: "Project × collaborator" });
      return <button data-action-id={`team.membership.${collaborator.id}`} type="button" key={membership.id} onClick={() => onEvidence(receipt)}><span>{collaborator.initials}</span><div><small>{collaborator.affiliation} · {collaborator.organization}</small><b>{collaborator.name}</b><em>{membership.projectRole}</em></div><strong>{membership.capabilities.length} rights</strong><i>Trace</i></button>;
    })}</div>
    {!members.length && <p className="inline-empty">No collaborator membership has been drafted for this project.</p>}
  </section>;
}

function TeamPanel({ project, selected, selectedId, assigned, onSelect, onAssign, onEvidence }: { project: WorkspaceProject; selected: typeof humanExperts[number]; selectedId: string; assigned: readonly string[]; onSelect: (id: string) => void; onAssign: (id: string) => void; onEvidence: (target: string | EvidenceReceipt) => void }) {
  const profileReceipt = fixtureEvidenceFor(project, {
    id: `EV-EXPERT-${selected.id}-PROFILE`,
    claim: `${selected.name} synthetic expert profile`,
    displayedValue: `${selected.years} profile years · ${selected.activeWork} fixture work items`,
    source: "Synthetic human-expert profile registry",
    formula: `Static demonstration profile; availability '${selected.availability}' is not a live calendar or presence signal`,
    inputs: [selected.role, ...selected.specialties, selected.decisionRight],
    variableId: "Project team metadata",
    grain: "Project × synthetic expert profile",
  });
  return <div className="team-os"><header className="section-hero"><div><p>SPECIALIST DIRECTORY</p><h2>Available experts</h2><span>Assign additional project specialists and inspect their synthetic profiles.</span></div><span className="truth-chip">{assigned.length} SESSION ASSIGNMENTS · {humanExperts.length} PROFILES</span></header><div className="collaboration-parties"><span><b>Project</b>{project.client}</span><span><b>Provider</b>Kearney</span></div><div className="team-layout"><section className="expert-grid">{humanExperts.map((expert) => <button data-action-id={`team.select.${expert.id}`} className={selectedId === expert.id ? "active" : ""} type="button" key={expert.id} onClick={() => onSelect(expert.id)}><span>{expert.initials}</span><div><small>{expert.id === "maya" ? "Client role template" : "Kearney"} · {expert.role}</small><h3>{expert.name}</h3><p>{expert.specialties.join(" · ")}</p></div><em>{expert.years}y fixture</em></button>)}</section><aside className="expert-inspector"><span>{selected.initials}</span><p>{selected.id === "maya" ? "Client role template" : "Kearney"} · {selected.role}</p><h2>{selected.name}</h2><small>{selected.availability} · fixture state</small><dl><div><dt>Domain-profile experience</dt><dd>{selected.years} years</dd></div><div><dt>Fixture workload</dt><dd>{selected.activeWork} items</dd></div><div><dt>Proposed decision right</dt><dd>{selected.decisionRight}</dd></div></dl><section><p>SPECIALTIES</p>{selected.specialties.map((item) => <b key={item}>{item}</b>)}</section><button className="expert-trace-action" data-action-id={`team.trace.${selected.id}`} type="button" onClick={() => onEvidence(profileReceipt)}>Trace profile</button><button data-action-id={`team.assign.${selected.id}`} type="button" onClick={() => onAssign(selected.id)}>{assigned.includes(selected.id) ? "Remove session assignment" : "Add session assignment"}</button></aside></div></div>;
}

function GovernancePanel({ project, onOutcome, onEvidence }: { project: WorkspaceProject; onOutcome: OutcomeHandler; onEvidence: (target: string | EvidenceReceipt) => void }) {
  const controls = [["UI project scoping","One selected client project is presented at a time; backend authorization is not implemented","Demonstrated"],["Human release gate","Concept actions stop at an explicit human gate; production enforcement is not implemented","Concept behavior"],["Evidence instrumentation","New project metrics and studio outputs expose receipts; legacy coverage remains a production work item","Partial"],["Solver claim integrity","No live solver is connected and no synthetic result is labeled optimal","Not connected"],["Learning policy","Browser-session receipt ledger only; no model weights or policy are updated","Concept"],["External licensing","3D tiles, AIS, ADS-B and web providers remain disconnected","Disconnected"]] as const;
  const coverageReceipt = fixtureEvidenceFor(project, { id: "EV-GOV-EVIDENCE-INSTRUMENTATION", claim: "Project evidence instrumentation state", displayedValue: "Partial concept coverage", source: "Front-end interaction inventory", formula: "Manual concept classification: project metric and studio receipt surfaces implemented; production-wide recursive lineage not evaluated", inputs: ["Project metrics", "Studio metrics", "Dataset register", "Agent trace fixtures"], grain: "Project concept surface" });
  return <div className="governance-os"><header className="section-hero"><div><p>CONTROLS</p><h2>Project governance</h2><span>{project.classification} · {project.dataResidency} · owner {project.owner}</span></div><button data-action-id="governance.export-manifest" type="button" onClick={() => onOutcome("Governance summary receipt recorded", `The current ${project.code} policy labels and concept boundaries were recorded in the browser-session ledger; no manifest file was generated.`, `GOV-MANIFEST-${project.code}`)}>Record summary</button></header><section className="governance-controls">{controls.map((control,index) => <button data-action-id={`governance.control.${index+1}`} type="button" key={control[0]} onClick={() => index === 2 ? onEvidence(coverageReceipt) : onOutcome("Control description opened", `${control[0]} · ${control[1]} · concept state ${control[2]}.`, `CONTROL-${project.code}-${String(index+1).padStart(2,"0")}`)}><span>{String(index+1).padStart(2,"0")}</span><div><b>{control[0]}</b><p>{control[1]}</p></div><em>{control[2]}</em></button>)}</section><div className="governance-grid"><section><p>AGENT POLICY</p><h3>Identity → Skills.md → MCP/tools → boundaries → evaluation → human review → shadow</h3><ol><li>Self-created tools begin quarantined.</li><li>Permission expansion always requires a human.</li><li>Experience derives from evaluated outcomes—not self-description.</li><li>Promotion requires security and model-risk approval.</li></ol></section><section><p>GEOSPATIAL POLICY</p><h3>Basemap is not agent memory</h3><ol><li>Google 3D Tiles require billing, key security, attribution, and policy compliance.</li><li>OpenSky / ADS-B / AIS feeds require valid commercial rights.</li><li>Licensed imagery and telemetry are never silently cached or learned from.</li><li>Current map and tracks are deterministic demo fixtures.</li></ol></section><section><p>LEARNING LEDGER</p><h3>Project retention controls</h3><ol><li>Record policy version, action, reward definition, outcome, expert rating, and counterfactual.</li><li>Challenge before promotion; preserve rollback.</li><li>Cross-client learning requires consent and approved aggregation.</li><li>No reinforcement-learning claim until a policy is actually updated and evaluated.</li></ol></section></div></div>;
}

function EvidenceDrawer({ receipt, onClose, onOutcome }: { receipt: EvidenceReceipt; onClose: () => void; onOutcome: OutcomeHandler }) {
  return <div className="evidence-overlay"><button data-action-id="evidence.dismiss" className="evidence-scrim" type="button" aria-label="Close evidence" onClick={onClose} /><aside className="evidence-drawer" role="dialog" aria-modal="true" aria-label={`Evidence receipt ${receipt.id}`}><header><div><p>EVIDENCE RECEIPT · {receipt.id}</p><h2>{receipt.claim}</h2><span>{receipt.state} · {receipt.sourceKind}</span></div><button data-action-id="evidence.close" type="button" onClick={onClose}>×</button></header><div className="evidence-value"><small>DISPLAYED VALUE</small><strong>{receipt.displayedValue}</strong><span>{receipt.confidence}% confidence · {receipt.variableId}</span></div><section><p>SOURCE IDENTITY</p><dl><div><dt>Source</dt><dd>{receipt.source}</dd></div><div><dt>Exact locator</dt><dd><code>{receipt.locator}</code></dd></div><div><dt>As of</dt><dd>{receipt.asOf}</dd></div><div><dt>Valid for</dt><dd>{receipt.validFor}</dd></div><div><dt>Version</dt><dd>{receipt.version}</dd></div><div><dt>Evidence fingerprint</dt><dd><code>{receipt.contentHash}</code><small>Fixture fingerprints identify this demo record; they are not content hashes.</small></dd></div></dl></section><section><p>TRACE MANIFEST</p><div className="evidence-lineage"><article><span>DECLARED INPUTS</span><b>{receipt.inputs.join(" · ")}</b></article><i>used by ↓</i><article><span>DECLARED ACTIVITY</span><b>{receipt.formula}</b></article><i>generated ↓</i><article className="active"><span>CLAIM</span><b>{receipt.displayedValue} · {receipt.claim}</b></article><i>attributed to ↓</i><article><span>AGENT / REVIEWER</span><b>{receipt.agent} · {receipt.reviewer}</b></article></div><small className="trace-boundary">This is one bounded receipt. Recursive upstream lineage requires connected source records in production.</small></section><section><p>FITNESS + ACCESS</p><dl><div><dt>Decision grain</dt><dd>{receipt.grain}</dd></div><div><dt>Project policy</dt><dd>{receipt.access}</dd></div><div><dt>Trace</dt><dd>{receipt.traceId}</dd></div></dl>{receipt.quality.map((item) => <span className="quality-check" key={item}>✓ {item}</span>)}</section><footer><button data-action-id="evidence.copy-reference" type="button" onClick={() => { onClose(); onOutcome("Evidence-reference receipt recorded", `${receipt.id} was recorded in the browser-session action ledger; no transcript, source system, or durable evidence store was changed.`, receipt.id); }}>Record reference receipt</button><button data-action-id="evidence.done" type="button" onClick={onClose}>Done</button></footer></aside></div>;
}

function AgentBuilder({ project, step, name, onName, onStep, onClose, onPublish }: { project: WorkspaceProject; step: number; name: string; onName: (name: string) => void; onStep: (step: number) => void; onClose: () => void; onPublish: (draft: AgentDraft) => void }) {
  const steps = ["Identity", "Skills manifest", "Connection requests", "Evaluation plan", "Review"];
  const skillOptions = ["or-formulation/SKILL.md", "provenance-audit/SKILL.md", "critical-minerals/SKILL.md"];
  const connectionOptions = [["project-graph", "Read project subgraph"], ["evidence-ledger", "Read and append trace"], ["solver-registry", "Request approved run · disconnected"], ["tool-forge", "Create quarantined draft only"]] as const;
  const [specialty, setSpecialty] = useState("Resilience portfolio");
  const [skills, setSkills] = useState<readonly string[]>(skillOptions.slice(0, 2));
  const [connections, setConnections] = useState<readonly string[]>(["project-graph", "evidence-ledger", "tool-forge"]);
  const [skillFile, setSkillFile] = useState("");
  const toggle = (current: readonly string[], value: string) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const draft = { specialty, skills, connections, skillFile };

  return <div className="builder-overlay">
    <button data-action-id="agent-builder.dismiss" className="evidence-scrim" type="button" aria-label="Close agent builder" onClick={onClose} />
    <section className="agent-builder" role="dialog" aria-modal="true" aria-label="Create a project agent draft">
      <header><div><p>AGENT BUILDER · PROJECT MANIFEST</p><h2>Draft a governed project specialist</h2></div><button data-action-id="agent-builder.close" type="button" aria-label="Close agent builder" onClick={onClose}>×</button></header>
      <nav>{steps.map((item,index) => <button data-action-id={`agent-builder.step.${index+1}`} disabled={index > step} className={index === step ? "active" : index < step ? "done" : ""} type="button" key={item} onClick={() => onStep(index)}><span>{index < step ? "✓" : index+1}</span><b>{item}</b></button>)}</nav>
      <div className="builder-panel">
        {step === 0 && <><label>Agent name<input value={name} onChange={(event) => onName(event.target.value)} /></label><label>Specialty<select value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option>Resilience portfolio</option><option>Operations research</option><option>Procurement</option><option>Critical minerals</option></select></label><p>The draft begins with zero experience. Production level and experience must be earned from governed, evaluated outcomes.</p></>}
        {step === 1 && <><h3>Requested skill bundles</h3>{skillOptions.map((item) => <label className="builder-check" key={item}><input type="checkbox" checked={skills.includes(item)} onChange={() => setSkills((current) => toggle(current, item))} />{item}</label>)}<label className="skill-upload">Select a local Skills.md filename<input type="file" accept=".md" onChange={(event) => setSkillFile(event.target.files?.[0]?.name ?? "")} />{skillFile && <small>{skillFile} selected · file contents were not read</small>}</label></>}
        {step === 2 && <><h3>Requested connections and permissions</h3><p>Selections describe a future least-privilege request. This UI does not connect an MCP server, grant a permission, or create a tool.</p>{connectionOptions.map((item) => <label className="builder-check" key={item[0]}><input type="checkbox" checked={connections.includes(item[0])} onChange={() => setConnections((current) => toggle(current, item[0]))} />{item[0]}<small>{item[1]}</small></label>)}</>}
        {step === 3 && <><h3>Required evaluation plan · not run</h3>{[["12 evidence-lineage cases","Required before shadow"],["8 model-formulation cases","Required before shadow"],["6 permission-denial cases","Required before shadow"],["Critical unsafe-action suite","Required before shadow"]].map((item) => <div className="eval-row" key={item[0]}><b>{item[0]}</b><span>{item[1]}</span></div>)}<p>No suite runs in this front-end concept. A production control plane must execute, retain, and independently review every result.</p></>}
        {step === 4 && <><h3>{name}</h3><dl className="builder-review"><div><dt>Initial level</dt><dd>Apprentice · unevaluated</dd></div><div><dt>Boundary</dt><dd>{project.client} / {project.name} only</dd></div><div><dt>Specialty</dt><dd>{specialty}</dd></div><div><dt>Skill requests</dt><dd>{skills.length} selected{skillFile ? ` + filename ${skillFile}` : ""}</dd></div><div><dt>Connection requests</dt><dd>{connections.join(" · ") || "None"}</dd></div><div><dt>Authority</dt><dd>None until approved</dd></div><div><dt>Deployment</dt><dd>Browser-session draft only</dd></div></dl></>}
      </div>
      <footer><button data-action-id="agent-builder.cancel" type="button" onClick={onClose}>Cancel</button>{step > 0 && <button data-action-id="agent-builder.back" type="button" onClick={() => onStep(step-1)}>Back</button>}<button data-action-id="agent-builder.next" type="button" disabled={step === 0 && !name.trim()} onClick={() => step === steps.length-1 ? onPublish(draft) : onStep(step+1)}>{step === steps.length-1 ? "Save draft manifest" : "Continue"} →</button></footer>
    </section>
  </div>;
}
