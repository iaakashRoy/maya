"use client";

import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent } from "react";
import ProjectAppStudio from "./ProjectAppStudios";
import { useDialogLifecycle } from "./useDialogLifecycle";
import { AppGlyph } from "./VisualIdentity";
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
  agentTraceView,
  appRunsFor,
  messagesForSession,
  planAppStart,
  planAppRerun,
  planNewSession,
  planSessionFork,
  planSessionMutation,
  projectHasDataContract,
  resolveActivityEvidence,
  sessionsForProject,
  validateAppInputValue,
  type ActivityEvidenceTarget,
  type ProjectActivityAction,
  type ProjectActivityState,
  type ProjectAppRun,
  type ProjectWorkSession,
  type SessionActivity,
  type SessionMessage,
} from "./project-activity-model";

type ExistingAppId = "risk" | "optimizer" | "flow" | "demand" | "suppliers";
type OutcomeHandler = (title: string, detail: string, artifact?: string, status?: "Completed" | "Saved" | "Blocked") => void;
type AgentDraft = { specialty: string; skills: readonly string[]; connections: readonly string[]; skillFile: string };
type ProjectMemberView = { membership: ProjectMembership; collaborator: WorkspaceCollaborator };
type UploadStage = "Select" | "Staged" | "Schema preview" | "Mapping draft" | "Review demo" | "Session receipt";
type ProjectDocumentFixture = { id: string; name: string; kind: "Excel workbook" | "PDF" | "CSV" | "SQL table" | "JSON"; locator: string; detail: string; records: string; state: string; variableId: string };

const projectDocumentsFor = (project: WorkspaceProject): readonly ProjectDocumentFixture[] => {
  if (project.origin === "Browser-session draft") return [];
  const token = project.code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const variable = (index: number) => project.variablePack.l0[index] ?? project.variablePack.l0[0] ?? "L0 mapping pending";
  return [
    { id: `${project.code}-DOC-01`, name: `${token}_supply_plan.xlsx`, kind: "Excel workbook", locator: `fixture://project-vault/${project.id}/supply-plan.xlsx`, detail: "Monthly supply, demand, inventory, and constrained-capacity planning workbook", records: "24 sheets · 18.4K cells", state: "Fixture snapshot", variableId: variable(0) },
    { id: `${project.code}-DOC-02`, name: `${token}_supplier_certificates.pdf`, kind: "PDF", locator: `fixture://project-vault/${project.id}/supplier-certificates.pdf`, detail: "Qualification, origin, quality, and compliance evidence package", records: "186 pages · OCR fixture", state: "Review fixture", variableId: variable(1) },
    { id: `${project.code}-DOC-03`, name: `${token}_movement_events.csv`, kind: "CSV", locator: `fixture://project-vault/${project.id}/movement-events.csv`, detail: "Timestamped cargo, custody, location, and transfer event extract", records: project.counts.events, state: "Fixture snapshot", variableId: variable(2) },
    { id: `${project.code}-DOC-04`, name: `project_${token}.supply_snapshot`, kind: "SQL table", locator: `fixture://warehouse/${project.id}/supply_snapshot`, detail: "Read-only project snapshot with entity, variable, valid-time, and evidence keys", records: project.counts.observations, state: "Read-only fixture", variableId: variable(3) },
    { id: `${project.code}-DOC-05`, name: `${token}_decision_assumptions.json`, kind: "JSON", locator: `fixture://project-vault/${project.id}/decision-assumptions.json`, detail: "Versioned scenario assumptions, hard constraints, owners, and review gates", records: `${project.methodCodes.length} method bindings`, state: "Fixture snapshot", variableId: variable(4) },
  ];
};

const projectDocumentReceipt = (project: WorkspaceProject, document: ProjectDocumentFixture) => fixtureEvidenceFor(project, {
  id: `EV-${document.id}`,
  claim: `${document.name} catalog record`,
  displayedValue: `${document.kind} · ${document.records}`,
  source: `${document.kind} deterministic project-vault fixture`,
  formula: `Catalog metadata only; locator ${document.locator}; no source file or SQL system was opened`,
  inputs: [document.id, document.locator, document.state],
  variableId: document.variableId,
  grain: "Project × source artifact",
});
type ProjectSessionState = {
  selectedDecision: string;
  selectedGraphNode: string;
  selectedAgentId: string;
  chatText: string;
  uploadStage: UploadStage;
  uploadName: string;
  sessionDatasets: readonly { id: string; name: string; rows: string; state: string }[];
  decisionDraftReady: boolean;
  mountedApps: readonly ProjectAppId[];
  draftAgentName: string;
  createdAgents: readonly ExpertAgent[];
  selectedExpertId: string;
  assignedExperts: readonly string[];
  connectorDrafts: readonly ProjectConnectorDraft[];
  dataQuery: string;
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
  initialSessionId?: string | null;
  initialRunId?: string | null;
  onTabChange?: (tab: WorkspaceTabId) => void;
  onStudioChange?: (app: ProjectAppId) => void;
  onSessionChange?: (sessionId: string) => void;
  onRunChange?: (sessionId: string, runId: string) => void;
  projects?: readonly WorkspaceProject[];
  collaborators?: readonly WorkspaceCollaborator[];
  memberships?: readonly ProjectMembership[];
  activeCollaboratorId?: string;
  activityState: ProjectActivityState;
  dispatchActivity: Dispatch<ProjectActivityAction>;
  onMountedAppsChange?: (projectId: string, appIds: readonly ProjectAppId[]) => void;
  onAgentRosterChange?: (projectId: string, agents: readonly ExpertAgent[]) => void;
  onProjectSetupChange?: (projectId: string, patch: Partial<WorkspaceProject>) => void;
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
const defaultSessionFor = (project: WorkspaceProject): ProjectSessionState => ({
  selectedDecision: "D0",
  selectedGraphNode: "supplier",
  selectedAgentId: agentsFor(project)[0]?.id ?? "",
  chatText: "",
  uploadStage: "Select",
  uploadName: "",
  sessionDatasets: [],
  decisionDraftReady: project.counts.decisions > 0,
  mountedApps: project.mountedAppIds,
  draftAgentName: "Resilience Portfolio Challenger",
  createdAgents: [],
  selectedExpertId: humanExperts[0].id,
  assignedExperts: project.origin === "Seed fixture" ? humanExperts.map((item) => item.id) : [],
  connectorDrafts: [],
  dataQuery: "",
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
  { state: "Thinking", agent: "Project Orchestrator", title: "Bind the submitted brief", detail: `Prompt: ${prompt}`, nodes: ["decision"] },
  { state: "Searching", agent: "Evidence Auditor", title: "Search project-scoped evidence", detail: `${datasetsFor(project).length} dataset views · ${project.counts.claims} claim metadata · no cross-client traversal`, nodes: ["src", "supplier"] },
  { state: "Traversing", agent: "Domain Cartographer", title: "Trace the outcome path", detail: project.variablePack.l0.length ? `${project.client} source → ${project.variablePack.l0[0]} → operating node → ${project.metrics[1]?.label ?? "outcome"}` : "No project graph or variable pack exists yet; traversal stops at the zero-state boundary.", nodes: ["supplier", "material", "plant", "order"] },
  { state: "Formulating", agent: "OR Formulator", title: "Build the decision-model draft", detail: project.methodCodes.length ? `${project.methodCodes.slice(0, 4).join(" + ")} · project variables · 12 canonical constraint families${steering.length ? ` · steering: ${steering.join("; ")}` : " · no steering overrides"}` : "No variables or methods are mounted; formulation remains an empty draft.", nodes: ["supplier", "material", "calc"] },
  { state: "Calculating", agent: "Solver Operator", title: "Replay deterministic response fixture", detail: "Illustrative calculation only · no live solver · no optimality claim", nodes: ["calc"] },
  { state: "Verifying", agent: "Evidence Auditor", title: "Check units, hard constraints, and claim language", detail: "Candidate is reviewable; actual solver status remains unavailable", nodes: ["calc", "decision"] },
  { state: "Awaiting approval", agent: "Project Orchestrator", title: "Route to human experts", detail: `${project.counts.experts} project experts · named human owner ${project.owner}`, nodes: ["decision"] },
];

const activityEvidenceReceiptFor = (project: WorkspaceProject, target: ActivityEvidenceTarget): EvidenceReceipt => {
  const { run } = target;
  const app = projectApps.find((item) => item.id === run.appId)!;
  const inputs = run.inputs.map((input) => `${input.key}=${input.value}${input.unit}`);
  const changes = run.changeSet.length ? run.changeSet.map((change) => `${change.key}:${change.before}->${change.after}`) : ["No changed assumptions"];
  const outputs = run.outputs.map((output) => `${output.label}=${output.value} [${output.evidenceRef}]`);
  if (target.kind === "output" && target.output) {
    return {
      ...fixtureEvidenceFor(project, { id: target.output.evidenceRef, claim: `${app.name} output: ${target.output.label}`, displayedValue: target.output.value, source: `Deterministic output in application run ${run.id}`, formula: `${run.summary} ${run.claimBoundary}`, inputs: [`run=${run.id}`, `session=${run.sessionId}`, `trace=${run.traceId}`, `fingerprint=${run.inputFingerprint}`, ...inputs, ...changes], variableId: app.variableIds[target.outputIndex ?? 0] ?? app.variableIds[0], grain: "Project × session × application output" }),
      id: target.output.evidenceRef,
      locator: `fixture://workspace/${project.id}/runs/${run.id}/outputs/${(target.outputIndex ?? 0) + 1}/${target.output.evidenceRef}`,
      traceId: run.traceId,
      version: run.inputVersion,
      contentHash: run.inputFingerprint,
    };
  }
  const report = target.kind === "report";
  return {
    ...fixtureEvidenceFor(project, { id: report ? run.reportId : run.traceId, claim: report ? `${app.name} application report` : `${app.name} run trace`, displayedValue: report ? run.summary : `${run.status} · ${run.inputFingerprint}`, source: report ? `Immutable ${run.origin.toLowerCase()} application-run record ${run.id}` : `Project activity ledger for ${run.id}`, formula: report ? `${run.methods.join(" + ")} · ${run.claimBoundary}` : `Parent ${run.parentRunId ?? "fixture root"} -> run ${run.id} -> report ${run.reportId}; ${run.claimBoundary}`, inputs: [`run=${run.id}`, `session=${run.sessionId}`, `trace=${run.traceId}`, `fingerprint=${run.inputFingerprint}`, ...inputs, ...changes, ...outputs], variableId: app.variableIds[0], grain: report ? "Project × session × application report" : "Project × session × application trace step" }),
    id: report ? run.reportId : run.traceId,
    locator: report ? `fixture://workspace/${project.id}/runs/${run.id}/report/${run.reportId}` : `fixture://workspace/${project.id}/runs/${run.id}/trace/${run.traceId}`,
    version: run.inputVersion,
    contentHash: run.inputFingerprint,
    traceId: run.traceId,
  };
};

export default function ProjectWorkspace({ onOpenApp, onOpenCase, onOutcome = () => undefined, initialProjectId, initialTab = "overview", initialApp = null, initialSessionId = null, initialRunId = null, onTabChange, onStudioChange, onSessionChange, onRunChange, projects = workspaceProjects, collaborators = workspaceCollaborators, memberships = projectMemberships, activeCollaboratorId = signedInCollaboratorId, activityState, dispatchActivity, onMountedAppsChange, onAgentRosterChange, onProjectSetupChange }: ProjectWorkspaceProps) {
  const project = requireWorkspaceProject(initialProjectId, projects);
  const initialSession = projectSessionCache[project.id] ?? defaultSessionFor(project);
  const tab = initialTab;
  const [evidence, setEvidence] = useState<EvidenceReceipt | null>(null);
  const focusedAppRunId = initialRunId;
  const studioApp = initialApp && !isExistingApp(initialApp) && initialSession.mountedApps.includes(initialApp) ? initialApp : null;
  const [selectedDecision, setSelectedDecision] = useState<string>(initialSession.selectedDecision);
  const [selectedGraphNode, setSelectedGraphNode] = useState<string>(initialSession.selectedGraphNode);
  const [selectedAgentId, setSelectedAgentId] = useState(initialSession.selectedAgentId);
  const [chatText, setChatText] = useState(initialSession.chatText);
  const [uploadStage, setUploadStage] = useState<UploadStage>(initialSession.uploadStage);
  const [uploadName, setUploadName] = useState(initialSession.uploadName);
  const [sessionDatasets, setSessionDatasets] = useState<readonly { id: string; name: string; rows: string; state: string }[]>(initialSession.sessionDatasets);
  const [decisionDraftReady, setDecisionDraftReady] = useState(initialSession.decisionDraftReady);
  const [mountedApps, setMountedApps] = useState<readonly ProjectAppId[]>(initialSession.mountedApps);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [draftAgentName, setDraftAgentName] = useState(initialSession.draftAgentName);
  const [createdAgents, setCreatedAgents] = useState<readonly ExpertAgent[]>(initialSession.createdAgents);
  const [selectedExpertId, setSelectedExpertId] = useState(initialSession.selectedExpertId);
  const [assignedExperts, setAssignedExperts] = useState<readonly string[]>(initialSession.assignedExperts);
  const [connectorDrafts, setConnectorDrafts] = useState<readonly ProjectConnectorDraft[]>(initialSession.connectorDrafts);
  const [dataQuery, setDataQuery] = useState(initialSession.dataQuery ?? "");
  const [agentSessionsOpen, setAgentSessionsOpen] = useState(initialSession.agentSessionsOpen);
  const [agentInspectorOpen, setAgentInspectorOpen] = useState(initialSession.agentInspectorOpen);
  const [playgroundFullscreen, setPlaygroundFullscreen] = useState(false);
  const workSessions = sessionsForProject(activityState, project.id);
  const selectedWorkSessionId = initialSessionId && workSessions.some((session) => session.id === initialSessionId)
    ? initialSessionId
    : activityState.selectedSessionByProject[project.id] ?? workSessions[0]?.id ?? "";
  const selectedWorkSession = workSessions.find((session) => session.id === selectedWorkSessionId) ?? workSessions[0] ?? null;
  const traceView = agentTraceView(selectedWorkSession);
  const traceIndex = traceView.stepIndex;
  const runState = traceView.state;
  const activePrompt = traceView.prompt || promptFor(project);
  const steeringInstructions = traceView.steeringInstructions;
  const dataContractReady = projectHasDataContract(project);
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
  const changeTab = (next: WorkspaceTabId) => {
    if (!authorize(capabilityForTab(next))) return;
    if (next === tab && !studioApp) return;
    onTabChange?.(next);
  };

  useEffect(() => {
    if (!playgroundFullscreen) return;
    const exitOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlaygroundFullscreen(false);
    };
    window.addEventListener("keydown", exitOnEscape);
    return () => window.removeEventListener("keydown", exitOnEscape);
  }, [playgroundFullscreen]);

  useEffect(() => {
    projectSessionCache[project.id] = {
      selectedDecision, selectedGraphNode, selectedAgentId, chatText,
      uploadStage, uploadName, sessionDatasets, decisionDraftReady, mountedApps,
      draftAgentName, createdAgents, selectedExpertId, assignedExperts, connectorDrafts,
      dataQuery, agentSessionsOpen, agentInspectorOpen,
    };
  }, [agentInspectorOpen, agentSessionsOpen, assignedExperts, chatText, connectorDrafts, createdAgents, dataQuery, decisionDraftReady, draftAgentName, mountedApps, project.id, selectedAgentId, selectedDecision, selectedExpertId, selectedGraphNode, sessionDatasets, uploadName, uploadStage]);

  useEffect(() => {
    onMountedAppsChange?.(project.id, mountedApps);
  }, [mountedApps, onMountedAppsChange, project.id]);

  useEffect(() => {
    onAgentRosterChange?.(project.id, [...agentsFor(project), ...createdAgents]);
  }, [createdAgents, onAgentRosterChange, project]);

  const openAppRun = (runId: string) => {
    const linkedRun = projectAppRuns.find((run) => run.id === runId);
    if (!linkedRun || !authorize("apps.view")) return;
    dispatchActivity({ type: "select-app-run", projectId: project.id, appId: linkedRun.appId, runId: linkedRun.id });
    if (onRunChange) onRunChange(linkedRun.sessionId, linkedRun.id);
    else onTabChange?.("apps");
  };

  const openEvidence = (target: string | EvidenceReceipt) => {
    if (typeof target === "string") {
      const activityTarget = resolveActivityEvidence(activityState, project.id, target);
      if (activityTarget?.kind === "run") {
        openAppRun(activityTarget.run.id);
        return;
      }
      if (activityTarget) {
        setEvidence(activityEvidenceReceiptFor(project, activityTarget));
        return;
      }
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
    if (!dataContractReady) {
      onOutcome("App open blocked", `${projectApps.find((item) => item.id === id)?.name} is mounted, but this new project has no governed variable mapping or data contract yet. Configure Data before opening the app.`, `APP-${project.code}-${id.toUpperCase()}-BOUNDARY`, "Blocked");
      return;
    }
    if (isExistingApp(id)) {
      onOpenApp(id);
    } else {
      onStudioChange?.(id);
    }
  };

  const submitChat = (event: FormEvent) => {
    event.preventDefault();
    if (!authorize("agents.run")) return;
    const prompt = chatText.trim();
    if (!prompt) return;
    let targetSessionId = "";
    if (selectedWorkSession) {
      const plan = planSessionMutation(activityState, project.id, selectedWorkSession.id);
      if (!plan) return;
      targetSessionId = plan.sessionId;
      dispatchActivity({ type: "append-message", projectId: project.id, sessionId: selectedWorkSession.id, role: "user", author: activeCollaborator?.name ?? project.owner, kind: "Prompt", body: prompt });
      dispatchActivity({ type: "append-message", projectId: project.id, sessionId: plan.sessionId, role: "agent", author: selectedAgent?.name ?? "Project Orchestrator", kind: "Response", body: `Prompt appended to ${plan.sessionId}. The visible deterministic trace will restart and stop at human review.` });
      dispatchActivity({ type: "start-agent-trace", projectId: project.id, sessionId: plan.sessionId, prompt });
    } else {
      targetSessionId = planNewSession(activityState, project);
      dispatchActivity({ type: "create-session", project, prompt, agentId: selectedAgent?.id ?? "orchestrator", agentName: selectedAgent?.name ?? "Project Orchestrator" });
    }
    if (targetSessionId) onSessionChange?.(targetSessionId);
    setChatText("");
  };

  const advanceRun = () => {
    if (!authorize("agents.run")) return;
    if (!dataContractReady) {
      onOutcome("Agent trace blocked", "Complete Data & graph mapping before advancing a trace. No candidate result was created.", `RUN-${project.code}-DATA-REQUIRED`, "Blocked");
      return;
    }
    if (!selectedWorkSession) {
      onOutcome("Agent trace blocked", "Send a project brief to create a traceable work session before starting execution.", `RUN-${project.code}-SESSION-REQUIRED`, "Blocked");
      return;
    }
    if (runState === "Completed" || runState === "Cancelled") {
      const plan = planSessionFork(activityState, project.id, selectedWorkSession.id);
      if (!plan) return;
      const replayPrompt = selectedWorkSession.agentTrace?.prompt ?? selectedWorkSession.objective;
      dispatchActivity({ type: "fork-session", projectId: project.id, sessionId: selectedWorkSession.id });
      dispatchActivity({ type: "start-agent-trace", projectId: project.id, sessionId: plan.sessionId, prompt: replayPrompt });
      onSessionChange?.(plan.sessionId);
      return;
    }
    if (runState === "Ready") {
      const plan = planSessionMutation(activityState, project.id, selectedWorkSession.id);
      if (!plan) return;
      const replayPrompt = selectedWorkSession.agentTrace?.prompt ?? selectedWorkSession.objective;
      if (plan.sessionForked) dispatchActivity({ type: "fork-session", projectId: project.id, sessionId: selectedWorkSession.id });
      dispatchActivity({ type: "start-agent-trace", projectId: project.id, sessionId: plan.sessionId, prompt: replayPrompt });
      onSessionChange?.(plan.sessionId);
      return;
    }
    if (traceIndex < traceSteps.length - 1) {
      dispatchActivity({ type: "advance-agent-trace", projectId: project.id, sessionId: selectedWorkSession.id, maxStepIndex: traceSteps.length - 1 });
      return;
    }
    dispatchActivity({
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
    if (!dataContractReady) {
      onOutcome("Steering blocked", "Complete Data & graph mapping before steering a trace. No session or data record changed.", `STEER-${project.code}-DATA-REQUIRED`, "Blocked");
      return;
    }
    if (!selectedWorkSession) {
      onOutcome("Steering blocked", "Create or select a work session before adding a steering instruction.", `STEER-${project.code}-SESSION-REQUIRED`, "Blocked");
      return;
    }
    const plan = planSessionMutation(activityState, project.id, selectedWorkSession.id);
    if (!plan) return;
    dispatchActivity({ type: "steer-session", projectId: project.id, sessionId: selectedWorkSession.id, instruction: label });
    onSessionChange?.(plan.sessionId);
    onOutcome("Steering instruction applied", `${label} restarted the ${project.code} synthetic trace at Thinking. No source record or production policy changed.`, `STEER-${project.code}-${label.toUpperCase().replaceAll(" ", "-")}`);
  };

  const selectWorkSession = (sessionId: string) => {
    const session = workSessions.find((item) => item.id === sessionId);
    if (!session) return;
    dispatchActivity({ type: "select-session", projectId: project.id, sessionId });
    if (onSessionChange) onSessionChange(sessionId);
    else onTabChange?.("agents");
  };

  const continueWorkSession = (sessionId: string) => {
    if (!authorize("agents.run")) return;
    const plan = planSessionFork(activityState, project.id, sessionId);
    if (!plan) return;
    dispatchActivity({ type: "fork-session", projectId: project.id, sessionId });
    onSessionChange?.(plan.sessionId);
  };

  const openWorkSession = (sessionId: string) => {
    if (!authorize("agents.run")) return;
    selectWorkSession(sessionId);
  };

  const cancelRun = () => {
    if (!authorize("agents.run")) return;
    if (!selectedWorkSession || runState !== "Running") {
      onOutcome("Agent cancellation blocked", "Only a running, traceable work session can be cancelled.", `RUN-${project.code}-CANCEL-BOUNDARY`, "Blocked");
      return;
    }
    dispatchActivity({ type: "cancel-session", projectId: project.id, sessionId: selectedWorkSession.id });
    onOutcome("Agent run cancelled", `${project.code} agent run stopped safely; no external tools or records were changed.`, `RUN-${project.code}-${selectedWorkSession.id}`);
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
      const datasetId = `${project.code}-DS-SESSION-${String(sessionDatasets.length + 1).padStart(2, "0")}`;
      const sampleName = uploadName || `${project.code}_Project_Sample.csv`;
      setSessionDatasets((current) => current.some((item) => item.id === datasetId) ? current : [...current, { id: datasetId, name: sampleName, rows: "240 fixture rows", state: "Session-only preview" }]);
      if (!dataContractReady) {
        const setupMetrics: WorkspaceProject["metrics"] = [
          { label: "Mapped records", value: "240", detail: "Synthetic preview rows in this browser session", tone: "opportunity", evidenceRef: `EV-${project.code}-DATA-01` },
          { label: "Mapping coverage", value: "85.7%", detail: "12 of 14 illustrative fields mapped", tone: "healthy", evidenceRef: `EV-${project.code}-MAP-01` },
          { label: "Review exceptions", value: "2", detail: "Illustrative fields awaiting a steward", tone: "watch", evidenceRef: `EV-${project.code}-MAP-02` },
          { label: "External writes", value: "0", detail: "No file content, source system, or cloud record changed", tone: "healthy", evidenceRef: `EV-${project.code}-BOUNDARY-01` },
        ];
        onProjectSetupChange?.(project.id, {
          counts: { ...project.counts, entities: "48", relationships: "72", observations: "240", documents: "1", claims: "6" },
          metrics: setupMetrics,
          variablePack: { l2: ["L2-001", "L2-002", "L2-003", "L2-006", "L2-008"], l1: ["L1-001", "L1-002", "L1-006", "L1-008", "L1-010", "L1-019", "L1-032", "L1-041"], l0: ["L0-001", "L0-008", "L0-029", "L0-030", "L0-044", "L0-046", "L0-061", "L0-071", "L0-155", "L0-218", "L0-227", "L0-299"] },
          methodCodes: ["M-01", "M-06", "M-20", "M-23"],
        });
      }
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

  if (studioApp) return <div className="project-os studio-mode" data-page-heading tabIndex={-1}><section className="project-stage"><ProjectAppStudio appId={studioApp} project={project} onEvidence={openEvidence} onOutcome={onOutcome} /><AppRunHistory key={focusedAppRunId ?? `studio-${studioApp}`} project={project} runs={projectAppRuns.filter((run) => run.appId === studioApp)} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={openApp} onOpenSession={openWorkSession} onEvidence={openEvidence} onOutcome={onOutcome} canRun={evaluateProjectAccess(project.id, activeCollaboratorId, "agents.run", memberships).allowed && dataContractReady} runBlockedReason={!dataContractReady ? "Complete Data & graph setup before starting an application run." : undefined} focusedRunId={focusedAppRunId} initialAppId={studioApp} onRunChange={onRunChange} /></section>{evidence && <EvidenceDrawer receipt={evidence} onClose={() => setEvidence(null)} onOutcome={onOutcome} />}</div>;

  return (
    <div className={`project-os ${tab === "agents" ? `playground-app-mode ${playgroundFullscreen ? "playground-fullscreen" : ""}` : ""}`.trim()} data-project-tab={tab} data-page-heading tabIndex={-1}>
      <section className="project-stage">
        {tab !== "agents" && <><header className="project-commandbar"><div><p>{project.code} · Project workspace</p><h1>{project.name}</h1><span>{project.problem}</span></div><aside><small>PROJECT STATE</small><b><i className={`project-tone-${project.health}`} />{project.stage}</b><span>{project.classification} · {project.dataResidency}</span></aside></header>
        <nav className="project-tabs" aria-label="Project workspace sections">{workspaceTabs.map((item) => { const active = tab === item.id || (item.id === "data" && tab === "graph"); return <button data-action-id={`workspace.tab.${item.id}`} type="button" aria-current={active ? "page" : undefined} className={active ? "active" : ""} key={item.id} onClick={() => changeTab(item.id)}><span>{item.label}</span>{tabCounts[item.id] !== undefined && <em>{tabCounts[item.id]}</em>}</button>; })}</nav></>}
         {tab === "overview" && <><OverviewPanel project={project} mounted={mountedApps} onTab={changeTab} onEvidence={openEvidence} onOpenApp={openApp} /><RecentWorkPanel sessions={workSessions} onOpen={openWorkSession} onContinue={continueWorkSession} />{project.operationsWorldIntake && <ProjectIntakeSummary project={project} onEvidence={openEvidence} />}</>}
        {tab === "decisions" && <DecisionPanel project={project} selected={selectedDecision} onSelect={setSelectedDecision} onEvidence={openEvidence} onOpenCase={onOpenCase} onOutcome={onOutcome} onCreateDraft={() => { if (!dataContractReady) { onOutcome("Decision draft blocked", "Complete the Data mapping review before creating a decision brief. No empty decision or case was created.", `DECISION-${project.code}-DATA-REQUIRED`, "Blocked"); return; } setDecisionDraftReady(true); setSelectedDecision("D0"); onProjectSetupChange?.(project.id, { counts: { ...project.counts, decisions: 1 } }); onOutcome("Decision brief draft created", `A browser-session decision brief was created for ${project.name} with a human review boundary; no approval or operational release occurred.`, `DECISION-${project.code}-DRAFT-01`, "Saved"); }} draftReady={decisionDraftReady} />}
         {tab === "apps" && <AppsPanel project={project} mounted={mountedApps} runs={projectAppRuns} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={openApp} onOpenPlayground={() => changeTab("agents")} onOpenSession={openWorkSession} onEvidence={openEvidence} onOutcome={onOutcome} canRun={evaluateProjectAccess(project.id, activeCollaboratorId, "agents.run", memberships).allowed && dataContractReady} runBlockedReason={!dataContractReady ? "Complete the Data mapping review before starting an application run." : undefined} focusedRunId={focusedAppRunId} onRunChange={onRunChange} />}
        {(tab === "data" || tab === "graph") && <ProjectDataWorkspace mode={tab === "graph" ? "graph" : "sources"} onMode={(mode) => changeTab(mode === "graph" ? "graph" : "data")} query={dataQuery} onQuery={setDataQuery} project={project} uploadStage={uploadStage} uploadName={uploadName} sessionDatasets={sessionDatasets} connectorDrafts={connectorDrafts} onRequestConnector={requestConnector} onReviewConnector={reviewConnector} onTestConnector={testConnectorFixture} onFile={setUploadFile} onUseSample={() => { if (!authorize("data.stage")) return; setUploadName(`${project.code}_Project_Sample.csv`); setUploadStage("Staged"); }} onAdvance={nextUploadStage} onEvidence={openEvidence} onOutcome={onOutcome} nodes={graphNodes} traceSteps={traceSteps} selectedNode={selectedGraphNode} onSelectNode={setSelectedGraphNode} selected={selectedNode} traceIndex={traceIndex} onSteer={steerRun} canSteer={Boolean(selectedWorkSession) && dataContractReady} />}
         {tab === "agents" && <AgentPanel project={project} dataReady={dataContractReady} traceSteps={traceSteps} selectedAgent={selectedAgent} selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} sessions={workSessions} selectedSession={selectedWorkSession} messages={sessionMessages} activities={sessionActivities} appRuns={projectAppRuns} sessionsOpen={agentSessionsOpen} inspectorOpen={agentInspectorOpen} playgroundFullscreen={playgroundFullscreen} onToggleSessions={() => setAgentSessionsOpen((current) => !current)} onToggleInspector={() => setAgentInspectorOpen((current) => !current)} onToggleFullscreen={() => setPlaygroundFullscreen((current) => !current)} onSelectSession={selectWorkSession} onContinueSession={continueWorkSession} onOpenRun={openAppRun} chatText={chatText} onChatText={setChatText} onSubmit={submitChat} traceIndex={traceIndex} runState={runState} onAdvance={advanceRun} onCancel={cancelRun} onSteer={steerRun} onEvidence={openEvidence} onOpenBuilder={() => { if (!authorize("agents.create")) return; setBuilderOpen(true); setBuilderStep(0); }} agents={availableAgents} />}
        {tab === "team" && <><ProjectMembershipsPanel project={project} members={projectMembers} onEvidence={openEvidence} /><TeamPanel project={project} selected={selectedExpert} selectedId={selectedExpertId} assigned={assignedExperts} onSelect={setSelectedExpertId} onEvidence={openEvidence} onAssign={(id) => { if (!authorize("team.manage")) return; setAssignedExperts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); onOutcome("Team assignment updated", `${humanExperts.find((item) => item.id === id)?.name} assignment was updated in this synthetic project session.`, `${project.code}-TEAM-${id.toUpperCase()}`); }} /></>}
        {tab === "governance" && <GovernancePanel project={project} onOutcome={onOutcome} onEvidence={openEvidence} />}
      </section>
      {evidence && <EvidenceDrawer receipt={evidence} onClose={() => setEvidence(null)} onOutcome={onOutcome} />}
      {builderOpen && <AgentBuilder project={project} step={builderStep} name={draftAgentName} onName={setDraftAgentName} onStep={setBuilderStep} onClose={() => setBuilderOpen(false)} onPublish={(draft) => { if (!authorize("agents.create")) return; const sequence = createdAgents.length + 1; const id = `draft-${project.code.toLowerCase()}-${String(sequence).padStart(2, "0")}`; setCreatedAgents((current) => [...current, { id, name: draftAgentName, role: draft.specialty, level: "Apprentice", years: 0, evaluatedRuns: 0, approvedRuns: 0, calibration: 0, overrideRate: 0, failureRate: 0, skills: draft.skillFile ? [...draft.skills, `selected-file:${draft.skillFile}`] : draft.skills, mcps: draft.connections.filter((item) => !item.includes("tool")).map((item) => `${item} · requested`), tools: draft.connections.filter((item) => item.includes("tool")).map((item) => `${item} · draft only`), authority: `Draft manifest inside ${project.client} / ${project.name}; no skill parsing, MCP connection, solver execution, or release`, state: "Draft" }]); setSelectedAgentId(id); setBuilderOpen(false); onOutcome("Agent draft saved", `${draftAgentName} was added as browser-session manifest ${sequence} for ${project.client} / ${project.name}; no Skills.md content was read, MCP connected, evaluation executed, tool created, or agent deployed.`, `AGENT-${project.code}-DRAFT-${String(sequence).padStart(2, "0")}`); }} />}
    </div>
  );
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

function OverviewPanel({ project, mounted, onTab, onEvidence, onOpenApp }: { project: WorkspaceProject; mounted: readonly ProjectAppId[]; onTab: (tab: WorkspaceTabId) => void; onEvidence: (ref: string | EvidenceReceipt) => void; onOpenApp: (id: ProjectAppId) => void }) {
  const projectDecisions = decisionsFor(project);
  return <div className="project-overview"><div className="project-metric-grid">{project.metrics.map((metric) => <button data-action-id={`evidence.open.${metric.evidenceRef}`} className={`metric-${metric.tone}`} type="button" key={metric.label} onClick={() => onEvidence(metric.evidenceRef)}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small><em>Trace {metric.evidenceRef}</em></button>)}</div><div className="project-home-grid"><section><header><p>DECISIONS</p><button data-action-id="workspace.open-decisions" type="button" onClick={() => onTab("decisions")}>{projectDecisions.length ? "View all" : "Set up"}</button></header><ol>{projectDecisions.slice(0,4).map((item) => <li key={item.id}><span>{item.id}</span><div><b>{item.title}</b><small>{item.level} · {item.owner} · {item.value}</small></div></li>)}</ol>{!projectDecisions.length && <p className="inline-empty">No decision briefs in this session.</p>}</section><section><header><p>APPS</p><button data-action-id="workspace.configure-apps" type="button" onClick={() => onTab("apps")}>Manage</button></header><div className="mini-app-graph">{mounted.slice(0,5).map((id, index) => { const app = projectApps.find((item) => item.id === id)!; return <span className="mini-app-entry" key={id}>{index > 0 && <i>{index % 2 ? "feeds" : "challenges"}</i>}<button data-action-id={`workspace.open-app.${id}`} type="button" onClick={() => onOpenApp(id)} style={{color:app.accent}}>{app.name}</button></span>; })}{!mounted.length && <p className="inline-empty">No apps mounted. Use Apps in the mounted-work bar to add one.</p>}</div></section></div><section className="portfolio-footprint"><header><div><p>PROJECT DATA</p><h2>Knowledge footprint</h2></div><button data-action-id="workspace.open-project-data" type="button" onClick={() => onTab("data")}>Open Data &amp; graph</button></header><div>{[[project.counts.entities,"entities"],[project.counts.relationships,"relationships"],[project.counts.observations,"L0 observations"],[project.counts.documents,"documents"],[project.counts.events,"events"],[project.counts.claims,"evidence claims"]].map((item) => { const receipt = fixtureEvidenceFor(project, { id: `EV-FOOTPRINT-${item[1]}`, claim: `Project knowledge footprint: ${item[1]}`, displayedValue: item[0], source: "Project knowledge-footprint deterministic fixture", formula: `Declared fixture count of ${item[1]} inside the selected project boundary`, inputs: [project.code, project.client, item[1]], variableId: "Project registry metadata", grain: `Project × ${item[1]}` }); return <button data-action-id={`workspace.trace-footprint.${item[1]}`} type="button" key={item[1]} onClick={() => onEvidence(receipt)}><b>{item[0]}</b><span>{item[1]}</span><em>◇</em></button>; })}</div><footer><span>Variable taxonomy · 481 L0 · 60 L1 · 35 L2</span><b>Method catalog · M-01 to M-30</b></footer></section></div>;
}

function RecentWorkPanel({ sessions, onOpen, onContinue }: { sessions: readonly ProjectWorkSession[]; onOpen: (sessionId: string) => void; onContinue: (sessionId: string) => void }) {
  return <section className="recent-work-panel">
    <header><div><p>RECENT WORK</p><h2>Agent sessions</h2><span>Resume the conversation, inspect exact app runs, or continue from an immutable fixture.</span></div><b>{sessions.length} SESSIONS</b></header>
    {sessions.length ? <div className="recent-work-list">{sessions.map((session) => <article key={session.id}>
      <button data-action-id={`workspace.session.open.${session.id}`} className="recent-work-main" type="button" onClick={() => onOpen(session.id)}>
        <span className={`session-status status-${session.status.toLowerCase().replaceAll(" ", "-")}`} />
        <div><small>{session.id} · {session.updatedAt}</small><h3>{session.title}</h3><p>{session.finalResult?.headline ?? session.objective}</p></div>
        <em>{session.status}</em>
      </button>
      <dl><div><dt>Lead</dt><dd>{session.leadAgentId}</dd></div><div><dt>Apps</dt><dd>{session.appIds.length}</dd></div><div><dt>Entry</dt><dd>{session.entryPoint}</dd></div></dl>
      <button data-action-id={`workspace.session.continue.${session.id}`} className="recent-work-continue" type="button" onClick={() => onContinue(session.id)}>Continue as new session</button>
    </article>)}</div> : <div className="recent-work-empty"><b>No work sessions yet</b><p>Open Playground and send the first project brief.</p></div>}
  </section>;
}

function DecisionPanel({ project, selected, onSelect, onEvidence, onOpenCase, onOutcome, draftReady, onCreateDraft }: { project: WorkspaceProject; selected: string; onSelect: (id: string) => void; onEvidence: (ref: string) => void; onOpenCase: () => void; onOutcome: OutcomeHandler; draftReady: boolean; onCreateDraft: () => void }) {
  const projectDecisions = decisionsFor(project);
  const item = projectDecisions.find((candidate) => candidate.id === selected) ?? projectDecisions[0];
  const [lineageView, setLineageView] = useState<"history" | "compare">("history");
  const [compareIds, setCompareIds] = useState<readonly string[]>(["D2-A", "D2-B"]);
  if (!item) return <section className="project-empty-state"><span>DECISIONS</span><h2>{draftReady ? "Decision draft is being prepared" : "No decision briefs yet"}</h2><p>{draftReady ? "The session draft is being bound to the current variable contract." : "Define the first decision, then bind variables, methods, evidence, owners, and approval rights."}</p><button data-action-id="decisions.create-first" type="button" disabled={draftReady} onClick={onCreateDraft}>{draftReady ? "Preparing draft…" : "Create decision brief draft"}</button></section>;
  const laneFor = (id: string) => id === "D0" || id === "D1" ? 0 : id === "D2-A" || id === "D3-A" ? 1 : 2;
  const branchFor = (id: string) => id === "D0" ? "main / outcome" : id === "D1" ? "portfolio / strategy" : id === "D2-A" ? "option-a / intervention" : id === "D2-B" ? "option-b / balance" : "review / release";
  const compareCandidates = projectDecisions.filter((node) => node.id.startsWith("D2"));
  const compared = compareCandidates.filter((node) => compareIds.includes(node.id));
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((candidate) => candidate !== id) : current.length >= 2 ? [current[1], id] : [...current, id]);
  return <div className="decision-os">
    <section className="decision-tree-panel decision-lineage-panel">
      <header><div><p>DECISION LINEAGE</p><h2>Branch, challenge, and merge</h2><span>A Git-style history of decision versions and approvals. Evidence lineage remains in Data &amp; graph.</span></div><button data-action-id="decisions.open-case" type="button" onClick={onOpenCase}>Open decision</button></header>
      <div className="decision-lineage-toolbar" role="group" aria-label="Decision lineage view">
        <button data-action-id="decisions.view.history" className={lineageView === "history" ? "active" : ""} type="button" aria-pressed={lineageView === "history"} onClick={() => setLineageView("history")}><span>⑂</span>History</button>
        <button data-action-id="decisions.view.compare" className={lineageView === "compare" ? "active" : ""} type="button" aria-pressed={lineageView === "compare"} onClick={() => setLineageView("compare")}><span>⇄</span>Compare branches <small>{compareIds.length}</small></button>
        <button data-action-id="decisions.record-snapshot" type="button" onClick={() => onOutcome("Decision-lineage snapshot recorded", `${project.code} branch tips, merge parents, owners, states, and evidence references were recorded in the browser-session ledger. No repository or production decision store was changed.`, `LINEAGE-${project.code}`)}><span>◇</span>Record snapshot</button>
      </div>
      {lineageView === "history" ? <div className="decision-commit-list" aria-label="Decision branch history">
        {projectDecisions.map((node, index) => {
          const lane = laneFor(node.id);
          const isMerge = node.id === "D3-A";
          const parentLabel = isMerge ? "D2-A + D2-B" : node.parent ?? "project brief";
          return <button data-action-id={`decisions.select.${node.id}`} data-lane={lane} className={`decision-commit-row ${selected === node.id ? "active" : ""} ${isMerge ? "merge" : ""}`} type="button" key={node.id} onClick={() => onSelect(node.id)}>
            <span className="decision-git-lanes" aria-hidden="true"><i /><i /><i /><b>{isMerge ? "◆" : index === 0 ? "●" : "○"}</b></span>
            <span className="decision-commit-copy"><small><code>{node.id}</code><em>{branchFor(node.id)}</em><i>{node.state}</i></small><strong>{node.title}</strong><span>{node.owner} · parent {parentLabel} · evidence {node.evidenceRef}</span></span>
            <span className="decision-commit-value"><small>{node.level}</small><b>{node.value}</b><em>Open</em></span>
          </button>;
        })}
        <div className="decision-merge-gate"><span>✓</span><div><small>MERGE GATE · NOT RELEASED</small><b>{project.outcome}</b><p>{project.counts.experts} named expert roles · {project.methodCodes.length} method references · human approval required</p></div><button data-action-id="decisions.merge-review" type="button" onClick={() => onOutcome("Merge review queued", `${project.code} option branches were queued for a synthetic human merge review. No decision was approved or released.`, `MERGE-${project.code}`)}>Queue review</button></div>
      </div> : <div className="decision-branch-compare">
        <header><div><small>BRANCH COMPARISON</small><h3>Select two tactical choices</h3></div><span>{compared.length}/2 selected</span></header>
        <div className="decision-compare-picker">{compareCandidates.map((node) => <button data-action-id={`decisions.compare.toggle.${node.id}`} className={compareIds.includes(node.id) ? "active" : ""} type="button" aria-pressed={compareIds.includes(node.id)} key={node.id} onClick={() => toggleCompare(node.id)}><span>{compareIds.includes(node.id) ? "✓" : "+"}</span><b>{node.id}</b><small>{branchFor(node.id)}</small></button>)}</div>
        <div className="decision-compare-grid">{compared.map((node, index) => <article key={node.id} data-compare-lane={index}><header><span>{node.id}</span><em>{node.state}</em></header><h3>{node.title}</h3><dl><div><dt>Owner</dt><dd>{node.owner}</dd></div><div><dt>Signal</dt><dd>{node.value}</dd></div><div><dt>Parent</dt><dd>{node.parent}</dd></div><div><dt>Evidence</dt><dd>{node.evidenceRef}</dd></div></dl><button data-action-id={`decisions.compare.evidence.${node.id}`} type="button" onClick={() => onEvidence(node.evidenceRef)}>Open evidence receipt</button></article>)}</div>
        <section className="decision-compare-result"><span>MERGE READINESS</span><b>{compared.length === 2 ? "Both branches are ready for expert challenge" : "Select two branches to compare"}</b><p>Comparison preserves different objectives and constraints; it does not imply that either fixture is feasible or optimal.</p><button data-action-id="decisions.compare.record" type="button" disabled={compared.length !== 2} onClick={() => onOutcome("Branch comparison recorded", `${compared.map((node) => node.id).join(" versus ")} was recorded for ${project.name}; no option was selected or released.`, `COMPARE-${project.code}`)}>Record comparison</button></section>
      </div>}
    </section>
    <aside className="decision-inspector"><p>SELECTED DECISION · {item.id}</p><h2>{item.title}</h2><span>{item.level} · {item.state} · owned by {item.owner}</span><button data-action-id={`decisions.evidence.${item.id}`} className="decision-evidence" type="button" onClick={() => onEvidence(item.evidenceRef)}><small>PRIMARY EVIDENCE</small><b>{item.evidenceRef} · {item.value}</b><em>Open receipt →</em></button><section><p>VARIABLE CONTRACT</p><div className="taxonomy-stack"><article><span>L2</span>{project.variablePack.l2.map((value) => <b key={value}>{value}</b>)}</article><article><span>L1</span>{project.variablePack.l1.map((value) => <b key={value}>{value}</b>)}</article><article><span>L0</span>{project.variablePack.l0.slice(0,8).map((value) => <b key={value}>{value}</b>)}</article></div></section><section><p>METHOD REFERENCES</p><div className="method-chips">{project.methodCodes.map((code) => <button data-action-id={`decisions.method.${code}`} type="button" key={code} onClick={() => onOutcome("Method reference opened", `${code} is referenced by ${project.name}; a production formulation, validation result, solver adapter, and fallback are not connected in this concept.`, `METHOD-${code}`)}>{code}</button>)}</div></section><button data-action-id="decisions.create-review" className="primary-dark-action" type="button" onClick={() => onOutcome("Decision review draft created", `${item.id} was packaged in this browser session with variables, method references, evidence, owners, and the project fixture; nothing was released.`, `REVIEW-${project.code}-${item.id}`)}>Create expert review draft</button></aside>
    <section className="method-library"><header><div><p>OR METHOD CATALOG</p><h2>30 governed techniques</h2></div><span>{project.methodCodes.length} referenced here</span></header><div>{methodFamilies.map((family) => <article key={family.range}><span>{family.range}</span><b>{family.name}</b><p>{family.detail}</p></article>)}</div><footer>Reference catalog only · no live solver execution · status, gap, incumbent, bounds, and optimality require a connected solver receipt</footer></section>
  </div>;
}

function AppsPanel({ project, mounted, runs, activityState, dispatchActivity, onOpen, onOpenPlayground, onOpenSession, onEvidence, onOutcome, canRun, runBlockedReason, focusedRunId, onRunChange }: { project: WorkspaceProject; mounted: readonly ProjectAppId[]; runs: readonly ProjectAppRun[]; activityState: ProjectActivityState; dispatchActivity: Dispatch<ProjectActivityAction>; onOpen: (id: ProjectAppId) => void; onOpenPlayground: () => void; onOpenSession: (sessionId: string) => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler; canRun: boolean; runBlockedReason?: string; focusedRunId?: string | null; onRunChange?: (sessionId: string, runId: string) => void }) {
  const mountReceipt = fixtureEvidenceFor(project, { id: "EV-APP-MOUNT-MANIFEST", claim: "Project app mount manifest", displayedValue: `${mounted.length + 1} mounted of ${projectApps.length + 1} available`, source: "Browser-session project app manifest", formula: "Count of app contracts mounted to the selected project fixture, including the always-available Playground", inputs: ["playground", ...mounted], grain: "Project × app contract" });
  return <div className="apps-os">
    <header className="section-hero"><div><p>APPS</p><h2>Project applications</h2><span>Mount specialist tools against this project&apos;s data, variables, methods, agents, and evidence.</span></div><button data-action-id="apps.trace-mount-manifest" type="button" onClick={() => onEvidence(mountReceipt)}>Trace app manifest</button></header>
    <section className="app-graph-canvas"><div className="app-graph-core"><span>PROJECT GRAPH</span><b>{project.code}</b><small>{project.counts.relationships} synthetic relationships</small></div>{projectApps.map((app,index) => <button data-action-id={`apps.graph.${app.id}`} className={`app-graph-node n${index+1} ${mounted.includes(app.id) ? "mounted" : "available"}`} style={{"--node-accent":app.accent} as React.CSSProperties} type="button" key={app.id} onClick={() => onOpen(app.id)}><AppGlyph appId={app.id} /><b>{app.name}</b><small>{mounted.includes(app.id) ? "Mounted" : "Mount"}</small></button>)}<div className="app-edge-ledger">{appDependencyEdges.slice(0,6).map((edge) => <span key={`${edge[0]}-${edge[1]}`}><b>{edge[0]}</b> → {edge[1]} <em>{edge[2]}</em></span>)}</div></section>
    <section className="app-catalog-grid"><article className="playground-catalog-card" data-app-theme="playground" style={{"--app-accent":"#7d5cf4"} as React.CSSProperties}><header><AppGlyph appId="playground" /><div><small>Agent workbench</small><h3>Playground</h3></div><em>MOUNTED</em></header><p>Run project-scoped expert agents in a live terminal, attach files, steer traces, and inspect evidence-linked results.</p><dl><div><dt>Terminal artifact</dt><dd>Session transcript + review package</dd></div><div><dt>Methods</dt><dd>{project.methodCodes.slice(0, 4).join(" · ")}</dd></div><div><dt>Agents</dt><dd>{project.counts.agents} project specialists</dd></div></dl><button data-action-id="apps.open.playground" type="button" onClick={onOpenPlayground}>Open Playground →</button></article>{projectApps.map((app) => <article data-app-theme={app.id} key={app.id} style={{"--app-accent":app.accent} as React.CSSProperties}><header><AppGlyph appId={app.id} /><div><small>{app.archetype}</small><h3>{app.name}</h3></div><em>{mounted.includes(app.id) ? "MOUNTED" : app.status.toUpperCase()}</em></header><p>{app.outcome}</p><dl><div><dt>Terminal artifact</dt><dd>{app.artifact}</dd></div><div><dt>Methods</dt><dd>{app.methodCodes.join(" · ")}</dd></div><div><dt>Variables</dt><dd>{app.variableIds.join(" · ")}</dd></div></dl><button data-action-id={`apps.open.${app.id}`} type="button" onClick={() => onOpen(app.id)}>{mounted.includes(app.id) ? `Open ${app.name}` : `Mount ${app.name}`} →</button></article>)}</section>
    <AppRunHistory key={focusedRunId ?? "project-app-runs"} project={project} runs={runs} activityState={activityState} dispatchActivity={dispatchActivity} onOpen={onOpen} onOpenSession={onOpenSession} onEvidence={onEvidence} onOutcome={onOutcome} canRun={canRun} runBlockedReason={runBlockedReason} focusedRunId={focusedRunId} initialAppId={mounted[0]} onRunChange={onRunChange} />
  </div>;
}

export function AppRunHistory({ project, runs, activityState, dispatchActivity, onOpen, onOpenSession, onOutcome, canRun = true, runBlockedReason, focusedRunId, initialAppId, onRunChange }: { project: WorkspaceProject; runs: readonly ProjectAppRun[]; activityState: ProjectActivityState; dispatchActivity: Dispatch<ProjectActivityAction>; onOpen: (id: ProjectAppId) => void; onOpenSession: (sessionId: string) => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler; canRun?: boolean; runBlockedReason?: string; focusedRunId?: string | null; initialAppId?: ProjectAppId; onRunChange?: (sessionId: string, runId: string) => void }) {
  const focused = focusedRunId ? runs.find((run) => run.id === focusedRunId) : undefined;
  const preferredAppId = initialAppId ?? runs[0]?.appId;
  const storedRunId = preferredAppId ? activityState.selectedRunByProjectApp[`${project.id}:${preferredAppId}`] : undefined;
  const stored = storedRunId ? runs.find((run) => run.id === storedRunId) : undefined;
  const fallback = focused ?? stored ?? runs[0] ?? null;
  const [selectedRunId, setSelectedRunId] = useState(fallback?.id ?? "");
  const [inputPanelOpen, setInputPanelOpen] = useState(true);
  const [artifactReceipt, setArtifactReceipt] = useState<EvidenceReceipt | null>(null);
  const selected = runs.find((run) => run.id === selectedRunId) ?? fallback;
  if (!selected) {
    const startFirstRun = () => {
      if (!initialAppId || !canRun) return;
      const plan = planAppStart(activityState, project, initialAppId);
      if (!plan) {
        onOutcome("Application run blocked", "No valid project session or application contract was available; no run was created.", `APP-${project.code}-START`, "Blocked");
        return;
      }
      dispatchActivity({ type: "start-app-run", project, appId: initialAppId });
      onRunChange?.(plan.sessionId, plan.runId);
      onOutcome("First application run recorded", `${plan.runId} was created in ${plan.sessionId} as a deterministic browser-session fixture and stopped at human review. No live application, source, solver, or write-back ran.`, plan.runId);
    };
    return <section className="app-run-workspace"><header><div><p>RUN HISTORY</p><h2>No application runs yet</h2></div></header><p className="inline-empty">{runBlockedReason ?? (initialAppId ? "Create the first traceable browser-session run for this mounted app." : "Mount an app before creating the first project run.")}</p>{initialAppId && <button data-action-id={`apps.run.start.${initialAppId}`} className="primary-dark-action" type="button" disabled={!canRun} onClick={startFirstRun}>Create first run</button>}</section>;
  }
  const app = projectApps.find((item) => item.id === selected.appId)!;
  const draft = activityState.runDrafts[selected.id] ?? {};
  const appHistory = runs.filter((run) => run.appId === selected.appId);
  const changedCount = selected.inputs.filter((input) => draft[input.key] !== undefined && draft[input.key] !== input.value).length;
  const inputErrors = Object.fromEntries(selected.inputs.flatMap((input) => {
    const error = validateAppInputValue(input, draft[input.key] ?? input.value);
    return error ? [[input.key, error]] : [];
  })) as Record<string, string>;
  const invalidInputCount = Object.keys(inputErrors).length;
  const reportReceipt = activityEvidenceReceiptFor(project, { kind: "report", run: selected });
  const traceReceipt = activityEvidenceReceiptFor(project, { kind: "trace", run: selected });
  const outputReceipt = (output: ProjectAppRun["outputs"][number], index: number) => activityEvidenceReceiptFor(project, { kind: "output", run: selected, output, outputIndex: index });
  const referencedInputReceipt = (reference: string) => {
    const target = resolveActivityEvidence(activityState, project.id, reference);
    return target ? activityEvidenceReceiptFor(project, target) : evidenceFor(project, reference);
  };
  const replay = () => {
    if (invalidInputCount) {
      onOutcome("Application replay blocked", `Correct ${invalidInputCount} invalid input${invalidInputCount === 1 ? "" : "s"} before creating a replay. The draft values remain visible and no run was created.`, selected.id, "Blocked");
      return;
    }
    const plan = planAppRerun(activityState, project.id, selected.id, selected.sessionId);
    if (!plan) {
      onOutcome("Application replay blocked", `No valid project session was available for ${selected.id}; no run was created.`, selected.id, "Blocked");
      return;
    }
    setSelectedRunId(plan.runId);
    setArtifactReceipt(null);
    dispatchActivity({ type: "rerun-app", projectId: project.id, runId: selected.id, sessionId: selected.sessionId });
    onRunChange?.(plan.sessionId, plan.runId);
    onOutcome(
      "Application replay recorded",
      `${plan.runId} was created in ${plan.sessionId}${plan.sessionForked ? ` by continuing immutable session ${plan.sourceSessionId}` : ""} with ${changedCount} changed assumption${changedCount === 1 ? "" : "s"}; parent ${selected.id} remains immutable and no live service or solver ran.`,
      plan.runId,
    );
  };
  return <>
    <section className="app-run-workspace">
      <header><div><p>APPLICATION WORK</p><h2>Runs, reports, and reruns</h2><span>Each app preserves its inputs, trace, report, parent session, and evidence references.</span></div><b>{runs.length} RUNS</b></header>
      <div className="app-run-layout">
        <aside className="app-run-list">
          <header><b>{app.name}</b><span>{appHistory.length} runs</span></header>
          {runs.map((run) => {
            const runApp = projectApps.find((item) => item.id === run.appId)!;
            return <button data-action-id={`apps.run.select.${run.id}`} className={selected.id === run.id ? "active" : ""} type="button" key={run.id} onClick={() => {
              setSelectedRunId(run.id);
              setArtifactReceipt(null);
              dispatchActivity({ type: "select-app-run", projectId: project.id, appId: run.appId, runId: run.id });
              onRunChange?.(run.sessionId, run.id);
            }}><AppGlyph appId={runApp.id} /><span><small>{run.id}</small><b>{run.title}</b><em>{run.status} · {run.executedAt}</em></span></button>;
          })}
        </aside>
        <article className="app-run-detail">
          <header>
            <div><span>{selected.status} · {selected.origin}</span><h3>{selected.title}</h3><p>{selected.id} · from <button data-action-id={`apps.run.session.${selected.sessionId}`} type="button" onClick={() => onOpenSession(selected.sessionId)}>{selected.sessionId}</button></p></div>
            <button data-action-id={`apps.run.open-app.${selected.id}`} type="button" title="Open the application home; this run remains in history" onClick={() => onOpen(selected.appId)}>Open {app.name} home</button>
          </header>
          <div className="app-run-receipts">
            <button data-action-id={`apps.run.report.${selected.id}`} type="button" onClick={() => setArtifactReceipt(reportReceipt)}><small>REPORT</small><b>{selected.reportId}</b></button>
            <button data-action-id={`apps.run.trace.${selected.id}`} type="button" onClick={() => setArtifactReceipt(traceReceipt)}><small>TRACE</small><b>{selected.traceId}</b></button>
            <button data-action-id={`apps.run.parent.${selected.id}`} type="button" disabled={!selected.parentRunId} onClick={() => {
              const parentRun = selected.parentRunId ? runs.find((run) => run.id === selected.parentRunId) : undefined;
              if (!parentRun) return;
              setSelectedRunId(parentRun.id);
              setArtifactReceipt(null);
              dispatchActivity({ type: "select-app-run", projectId: project.id, appId: parentRun.appId, runId: parentRun.id });
              onRunChange?.(parentRun.sessionId, parentRun.id);
            }}><small>PARENT RUN</small><b>{selected.parentRunId ?? "Fixture root"}</b></button>
          </div>
          <button data-action-id={`apps.run.toggle-inputs.${selected.id}`} className="app-input-toggle" type="button" aria-expanded={inputPanelOpen} onClick={() => setInputPanelOpen((current) => !current)}>
            {inputPanelOpen ? "Hide inputs" : "Show inputs"}<span>{changedCount ? `${changedCount} pending changes` : `${selected.inputVersion} · ${selected.inputFingerprint}`}</span>
          </button>
          {inputPanelOpen && <div className="app-run-inputs">{selected.inputs.map((input) => <label key={input.key}>
            <span>{input.label}{input.evidenceRef ? <button data-action-id={`apps.run.input-evidence.${selected.id}.${input.key}`} className="app-input-evidence" type="button" onClick={(event) => { event.preventDefault(); setArtifactReceipt(referencedInputReceipt(input.evidenceRef!)); }}>Evidence {input.evidenceRef}</button> : <small>{input.editable ? "Editable assumption" : "Locked input"}</small>}</span>
            <span>{input.kind === "choice"
              ? <select aria-invalid={Boolean(inputErrors[input.key])} value={draft[input.key] ?? input.value} disabled={!input.editable || !canRun} onChange={(event) => dispatchActivity({ type: "edit-app-input", projectId: project.id, runId: selected.id, key: input.key, value: event.target.value })}>{input.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>
              : <input aria-invalid={Boolean(inputErrors[input.key])} type={input.kind === "number" ? "number" : "text"} min={input.min} max={input.max} step={input.step} value={draft[input.key] ?? input.value} disabled={!input.editable || !canRun} onChange={(event) => dispatchActivity({ type: "edit-app-input", projectId: project.id, runId: selected.id, key: input.key, value: event.target.value })} />}
              <em>{input.unit}</em>
            </span>
            {inputErrors[input.key] && <small className="app-input-error" role="alert">{inputErrors[input.key]}</small>}
          </label>)}</div>}
          <section className="app-run-output">
            <p>RESULT</p><h3>{selected.summary}</h3>
            <div>{selected.outputs.map((output, index) => <button data-action-id={`apps.run.output.${selected.id}.${output.label}`} type="button" key={output.label} onClick={() => setArtifactReceipt(outputReceipt(output, index))}><span>{output.label}</span><b>{output.value}</b><small>{output.evidenceRef}</small></button>)}</div>
            {selected.changeSet.length > 0 && <dl>{selected.changeSet.map((change) => <div key={change.key}><dt>{change.key}</dt><dd>{change.before} → {change.after}</dd></div>)}</dl>}
            <small>{selected.claimBoundary}</small>
          </section>
          <footer><button data-action-id={`apps.run.replay.${selected.id}`} type="button" disabled={!canRun || invalidInputCount > 0} onClick={replay}>{changedCount ? "Rerun with changes" : "Replay fixture"}</button><span>{invalidInputCount ? `${invalidInputCount} input ${invalidInputCount === 1 ? "error" : "errors"} to fix` : canRun ? "No source write-back · no optimality claim" : runBlockedReason ?? "Run permission required"}</span></footer>
        </article>
      </div>
    </section>
    {artifactReceipt && <EvidenceDrawer receipt={artifactReceipt} onClose={() => setArtifactReceipt(null)} onOutcome={onOutcome} />}
  </>;
}

type ProjectDataWorkspaceProps = {
  mode: "sources" | "graph";
  onMode: (mode: "sources" | "graph") => void;
  query: string;
  onQuery: (query: string) => void;
  project: WorkspaceProject;
  uploadStage: string;
  uploadName: string;
  sessionDatasets: readonly { id: string; name: string; rows: string; state: string }[];
  connectorDrafts: readonly ProjectConnectorDraft[];
  onRequestConnector: (templateId: string) => void;
  onReviewConnector: (connectorId: string) => void;
  onTestConnector: (connectorId: string) => void;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onUseSample: () => void;
  onAdvance: () => void;
  onEvidence: (target: string | EvidenceReceipt) => void;
  onOutcome: OutcomeHandler;
  nodes: ReturnType<typeof graphNodesFor>;
  traceSteps: readonly TraceStep[];
  selectedNode: string;
  onSelectNode: (id: string) => void;
  selected: ReturnType<typeof graphNodesFor>[number] | undefined;
  traceIndex: number;
  onSteer: (label: string) => void;
  canSteer: boolean;
};

function ProjectDataWorkspace({ mode, onMode, query, onQuery, project, uploadStage, uploadName, sessionDatasets, connectorDrafts, onRequestConnector, onReviewConnector, onTestConnector, onFile, onUseSample, onAdvance, onEvidence, onOutcome, nodes, traceSteps, selectedNode, onSelectNode, selected, traceIndex, onSteer, canSteer }: ProjectDataWorkspaceProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = (...values: readonly (string | number | undefined)[]) => !normalizedQuery || values.some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
  const datasetHits = datasetsFor(project).filter((dataset) => matches(dataset.id, dataset.name, dataset.source, dataset.grain, dataset.variables.join(" ")));
  const previewHits = sessionDatasets.filter((dataset) => matches(dataset.id, dataset.name, dataset.rows, dataset.state));
  const documentHits = projectDocumentsFor(project).filter((document) => matches(document.id, document.name, document.kind, document.locator, document.detail, document.state, document.variableId));
  const connectorTemplateHits = connectorTemplates.filter((template) => matches(template.id, template.name, template.sourceClass, template.protocol, template.targetData.join(" "), template.targetBoundary));
  const connectorHits = connectorDrafts.filter((connector) => matches(connector.id, connector.name, connector.protocol, connector.state, connector.policyReviewState));
  const graphHits = nodes.filter((node) => matches(node.id, node.label, node.kind, node.detail, node.evidenceRef));
  const metricHits = project.metrics.filter((metric) => matches(metric.label, metric.value, metric.detail, metric.evidenceRef));
  const variableHits = [...project.variablePack.l2, ...project.variablePack.l1, ...project.variablePack.l0].filter((variable) => matches(variable)).slice(0, 12);
  const hitCount = datasetHits.length + previewHits.length + documentHits.length + connectorTemplateHits.length + connectorHits.length + graphHits.length + metricHits.length + variableHits.length;

  return <div className="project-data-workspace">
    <header className="data-graph-commandbar">
      <div><p>PROJECT KNOWLEDGE</p><h2>Data &amp; graph</h2><span>Upload, inspect, query, and trace every governed project source from one workspace.</span></div>
      <nav aria-label="Data and graph views">
        <button data-action-id="data-graph.mode.sources" className={mode === "sources" ? "active" : ""} type="button" aria-pressed={mode === "sources"} onClick={() => onMode("sources")}>Sources <span>{datasetsFor(project).length + sessionDatasets.length}</span></button>
        <button data-action-id="data-graph.mode.graph" className={mode === "graph" ? "active" : ""} type="button" aria-pressed={mode === "graph"} onClick={() => onMode("graph")}>Knowledge graph <span>{nodes.length}</span></button>
      </nav>
    </header>
    <label className="data-graph-search">
      <span aria-hidden="true">⌕</span>
      <span className="sr-only">Query project data and knowledge graph</span>
      <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search files, tables, PDFs, variables, evidence, connectors, and graph entities" />
      <small aria-live="polite">{normalizedQuery ? `${hitCount} matches` : `${project.counts.documents} documents · ${project.counts.entities} entities · ${project.counts.claims} claims`}</small>
      {query && <button data-action-id="data-graph.search.clear" type="button" aria-label="Clear data query" onClick={() => onQuery("")}>×</button>}
    </label>
    {normalizedQuery && <section className="data-query-results" aria-label="Project data query results">
      <header><b>Query results</b><span>{hitCount} project-scoped matches</span></header>
      <div>
        {datasetHits.map((dataset) => <button data-action-id={`data-query.dataset.${dataset.id}`} type="button" key={`dataset-${dataset.id}`} onClick={() => onEvidence(fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} registry metadata`, displayedValue: `${dataset.rows} rows · ${dataset.quality}% quality`, source: `${dataset.source} deterministic registry fixture`, formula: `Static fixture metadata; freshness ${dataset.freshness}; state ${dataset.state}`, variableId: dataset.variables[0], grain: dataset.grain, inputs: dataset.variables }))}><i>TABLE</i><span><b>{dataset.name}</b><small>{dataset.id} · {dataset.source}</small></span><em>Trace</em></button>)}
        {previewHits.map((dataset) => <button data-action-id={`data-query.preview.${dataset.id}`} type="button" key={`preview-${dataset.id}`} onClick={() => onEvidence(fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} session-preview metadata`, displayedValue: `${dataset.rows} · no persisted dataset`, source: "Browser-session filename and synthetic ingestion fixture", formula: "No file-content read; demonstration metadata only", variableId: project.variablePack.l0[0], grain: "Browser session" }))}><i>FILE</i><span><b>{dataset.name}</b><small>{dataset.id} · {dataset.state}</small></span><em>Trace</em></button>)}
        {documentHits.map((document) => <button data-action-id={`data-query.document.${document.id}`} type="button" key={`document-${document.id}`} onClick={() => onEvidence(projectDocumentReceipt(project, document))}><i>{document.kind === "Excel workbook" ? "XLSX" : document.kind === "SQL table" ? "SQL" : document.kind.toUpperCase()}</i><span><b>{document.name}</b><small>{document.kind} · {document.detail}</small></span><em>Trace</em></button>)}
        {connectorTemplateHits.map((template) => <button data-action-id={`data-query.connector-template.${template.id}`} type="button" key={`connector-template-${template.id}`} onClick={() => onEvidence(fixtureEvidenceFor(project, { id: `EV-CONNECTOR-TEMPLATE-${template.id}`, claim: `${template.name} source contract`, displayedValue: `${template.sourceClass} · ${template.catalogState}`, source: "Project connector-catalog deterministic fixture", formula: template.limitations, inputs: [template.protocol, template.targetBoundary, template.targetDirection, ...template.targetData], variableId: "Project connector metadata", grain: "Project × connector template" }))}><i>SOURCE</i><span><b>{template.name}</b><small>{template.protocol} · {template.targetData.join(" · ")}</small></span><em>Inspect</em></button>)}
        {connectorHits.map((connector) => <button data-action-id={`data-query.connector.${connector.id}`} type="button" key={`connector-${connector.id}`} onClick={() => onEvidence(connectorReceiptFor(project, connector))}><i>IOT</i><span><b>{connector.name}</b><small>{connector.protocol} · {connector.policyReviewState}</small></span><em>Trace</em></button>)}
        {graphHits.map((node) => <button data-action-id={`data-query.graph.${node.id}`} type="button" key={`graph-${node.id}`} onClick={() => { onSelectNode(node.id); onMode("graph"); }}><i>NODE</i><span><b>{node.label}</b><small>{node.kind} · {node.detail}</small></span><em>Open</em></button>)}
        {metricHits.map((metric) => <button data-action-id={`data-query.metric.${metric.evidenceRef}`} type="button" key={`metric-${metric.evidenceRef}`} onClick={() => onEvidence(metric.evidenceRef)}><i>CLAIM</i><span><b>{metric.label}: {metric.value}</b><small>{metric.evidenceRef} · {metric.detail}</small></span><em>Trace</em></button>)}
        {variableHits.map((variable) => <button data-action-id={`data-query.variable.${variable}`} type="button" key={`variable-${variable}`} onClick={() => onEvidence(fixtureEvidenceFor(project, { id: `EV-VARIABLE-${variable}`, claim: `${variable} project variable binding`, displayedValue: "Bound to selected project fixture", source: "Project variable-contract fixture", formula: "Variable identifier is declared in the selected project's taxonomy pack", variableId: variable, grain: "Project × variable", inputs: [project.code, variable] }))}><i>VAR</i><span><b>{variable}</b><small>Project taxonomy binding</small></span><em>Trace</em></button>)}
        {!hitCount && <p>No project file, table, source contract, claim, variable, or graph entity matches this query.</p>}
      </div>
    </section>}
    {mode === "sources" ? <DataPanel embedded query={query} project={project} uploadStage={uploadStage} uploadName={uploadName} sessionDatasets={sessionDatasets} connectorDrafts={connectorDrafts} onRequestConnector={onRequestConnector} onReviewConnector={onReviewConnector} onTestConnector={onTestConnector} onFile={onFile} onUseSample={onUseSample} onAdvance={onAdvance} onEvidence={onEvidence} onOutcome={onOutcome} /> : <GraphPanel embedded query={query} project={project} nodes={nodes} traceSteps={traceSteps} selectedNode={selectedNode} onSelect={onSelectNode} selected={selected} traceIndex={traceIndex} onEvidence={onEvidence} onSteer={onSteer} canSteer={canSteer} onOpenData={() => onMode("sources")} />}
  </div>;
}

function DataPanel({ project, uploadStage, uploadName, sessionDatasets, connectorDrafts, onRequestConnector, onReviewConnector, onTestConnector, onFile, onUseSample, onAdvance, onEvidence, onOutcome, query = "", embedded = false }: { project: WorkspaceProject; uploadStage: string; uploadName: string; sessionDatasets: readonly { id: string; name: string; rows: string; state: string }[]; connectorDrafts: readonly ProjectConnectorDraft[]; onRequestConnector: (templateId: string) => void; onReviewConnector: (connectorId: string) => void; onTestConnector: (connectorId: string) => void; onFile: (event: ChangeEvent<HTMLInputElement>) => void; onUseSample: () => void; onAdvance: () => void; onEvidence: (target: string | EvidenceReceipt) => void; onOutcome: OutcomeHandler; query?: string; embedded?: boolean }) {
  const stages = ["Select", "Staged", "Schema preview", "Mapping draft", "Review demo", "Session receipt"];
  const stageDetails = ["Choose file", "Filename only", "Illustrative schema", "Proposed source → L0", "Demonstration gate", "No durable merge"];
  const current = stages.indexOf(uploadStage);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = (...values: readonly (string | number | undefined)[]) => !normalizedQuery || values.some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
  const allProjectDatasetViews = datasetsFor(project);
  const projectDatasetViews = allProjectDatasetViews.filter((dataset) => matches(dataset.id, dataset.name, dataset.source, dataset.grain, dataset.variables.join(" ")));
  const visibleSessionDatasets = sessionDatasets.filter((dataset) => matches(dataset.id, dataset.name, dataset.rows, dataset.state));
  const allProjectDocuments = projectDocumentsFor(project);
  const visibleProjectDocuments = allProjectDocuments.filter((document) => matches(document.id, document.name, document.kind, document.locator, document.detail, document.state, document.variableId));
  const visibleTemplates = connectorTemplates.filter((template) => matches(template.id, template.name, template.sourceClass, template.protocol, template.targetData.join(" ")));
  const visibleConnectorDrafts = connectorDrafts.filter((connector) => matches(connector.id, connector.name, connector.protocol, connector.state, connector.policyReviewState));
  const batchRows = [
    ["Project boundary", `${project.client} / ${project.name}`],
    ["File handling", "Filename captured; contents not read"],
    ["Illustrative grain", "Entity × variable × valid time"],
    ["Fixture rows / columns", "240 / 14"],
    ["Proposed L0 mappings", "12 / 14"],
    ["Persistence", "Browser session only; no merge"],
  ];

  return <div className="data-vault">
    {!embedded && <header className="section-hero"><div><p>DATA</p><h2>Project data and sources</h2><span>Stage files, define source contracts, and request IoT integrations inside this project boundary.</span></div><span className="truth-chip">SESSION-ONLY</span></header>}
    <section className="ingestion-workbench">
      <div className="ingestion-steps">{stages.map((stage,index) => <article className={index < current ? "done" : index === current ? "active" : ""} key={stage}><span>{index < current ? "✓" : String(index+1).padStart(2,"0")}</span><b>{stage}</b><small>{stageDetails[index]}</small></article>)}</div>
      <div className="upload-drop"><div><span>⇧</span><h3>{uploadName || "Bring project evidence into tanjx"}</h3><p>CSV, XLSX, JSON, PDF, Parquet · filename metadata only</p></div><label data-action-id="data.choose-file">Choose local file<input type="file" accept=".csv,.xlsx,.json,.pdf,.parquet" onChange={onFile} /></label><button data-action-id="data.use-sample" type="button" onClick={onUseSample}>Use synthetic sample</button></div>
      {uploadStage !== "Select" && <div className="upload-contract"><header><div><p>CURRENT DEMONSTRATION BATCH</p><h3>{uploadName}</h3></div><span>{uploadStage}</span></header><div>{batchRows.map((row) => <dl key={row[0]}><dt>{row[0]}</dt><dd>{row[1]}</dd></dl>)}</div><button data-action-id={`data.advance.${uploadStage}`} type="button" onClick={uploadStage === "Session receipt" ? () => onOutcome("Session receipt reopened", `${uploadName} has one metadata-only browser-session receipt; no dataset was created or merged.`, `INGESTION-${project.code}-UB-01`) : onAdvance}>{uploadStage === "Review demo" ? "Create session receipt" : uploadStage === "Session receipt" ? "View session receipt" : `Continue to ${stages[current+1]}`} →</button></div>}
    </section>
    <section className="dataset-register"><header><div><p>DATA PRODUCTS</p><h2>{normalizedQuery ? `${projectDatasetViews.length + visibleSessionDatasets.length} matching views` : `${allProjectDatasetViews.length + sessionDatasets.length} dataset views`}</h2></div><button data-action-id="data.connection-request" type="button" onClick={() => onRequestConnector("readonly-cdc-api")}>Request enterprise source</button></header><div className="dataset-card-grid">
      {projectDatasetViews.map((dataset) => { const receipt = fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} registry metadata`, displayedValue: `${dataset.rows} rows · ${dataset.quality}% quality`, source: `${dataset.source} deterministic registry fixture`, formula: `Static fixture metadata; freshness ${dataset.freshness}; state ${dataset.state}`, variableId: dataset.variables[0], grain: dataset.grain, inputs: dataset.variables }); return <article className="dataset-card" key={dataset.id}><header><div><small>{dataset.id}</small><h3>{dataset.name}</h3></div><span>{dataset.state}</span></header><p>{dataset.source}</p><small>{dataset.grain}</small><dl><div><dt>Records</dt><dd>{dataset.rows}</dd></div><div><dt>Freshness</dt><dd>{dataset.freshness}</dd></div><div><dt>Quality</dt><dd>{dataset.quality}%</dd></div></dl><div className="dataset-bindings"><span>Taxonomy bindings</span>{dataset.variables.map((variable) => <b key={variable}>{variable}</b>)}</div><button data-action-id={`data.trace.${dataset.id}`} type="button" onClick={() => onEvidence(receipt)}>Trace dataset ◇</button></article>; })}
      {visibleSessionDatasets.map((dataset) => { const receipt = fixtureEvidenceFor(project, { id: `EV-DATA-${dataset.id}`, claim: `${dataset.name} session-preview metadata`, displayedValue: `${dataset.rows} · no persisted dataset`, source: "Browser-session filename and synthetic ingestion fixture", formula: "No file-content read; demonstration metadata only", variableId: project.variablePack.l0[0], grain: "Browser session" }); return <article className="dataset-card session-dataset" key={dataset.id}><header><div><small>{dataset.id}</small><h3>{dataset.name}</h3></div><span>{dataset.state}</span></header><p>Local session</p><small>Filename + synthetic preview only</small><dl><div><dt>Records</dt><dd>{dataset.rows}</dd></div><div><dt>Freshness</dt><dd>Now</dd></div><div><dt>Quality</dt><dd>Not measured</dd></div></dl><div className="dataset-bindings"><span>Proposed bindings</span>{project.variablePack.l0.slice(0,3).map((variable) => <b key={variable}>{variable}</b>)}</div><button data-action-id={`data.trace.${dataset.id}`} type="button" onClick={() => onEvidence(receipt)}>Trace preview ◇</button></article>; })}
      {normalizedQuery && !projectDatasetViews.length && !visibleSessionDatasets.length && <p className="inline-empty">No dataset view matches this query. Graph, metric, variable, and connector matches remain available above.</p>}
    </div></section>
    <section className="source-file-register"><header><div><p>FILES AND RECORDS</p><h2>{normalizedQuery ? `${visibleProjectDocuments.length} matching artifacts` : `${allProjectDocuments.length} source artifacts`}</h2><span>Inspectable Excel, PDF, CSV, JSON, and SQL catalog fixtures. tanjx does not open an external file or database.</span></div><span>{project.counts.documents} DECLARED DOCUMENTS</span></header><div>{visibleProjectDocuments.map((document) => <button data-action-id={`data.document.${document.id}`} type="button" key={document.id} onClick={() => onEvidence(projectDocumentReceipt(project, document))}><i>{document.kind === "Excel workbook" ? "XLSX" : document.kind === "SQL table" ? "SQL" : document.kind.toUpperCase()}</i><span><b>{document.name}</b><small>{document.detail}</small></span><em><b>{document.records}</b><small>{document.state}</small></em></button>)}{normalizedQuery && !visibleProjectDocuments.length && <p className="inline-empty">No file or record artifact matches this query.</p>}{!normalizedQuery && !allProjectDocuments.length && <p className="inline-empty">No source artifact exists yet. Stage a file name or request a governed source above.</p>}</div></section>
    <section className="iot-sources"><header><div><p>IOT AND EDGE SOURCES</p><h2>Source integration requests</h2><span>Choose a project-scoped template. Requests never connect a device, endpoint, credential, broker, or external feed.</span></div><span>{connectorDrafts.length} session drafts</span></header><div className="iot-template-grid">{visibleTemplates.map((template) => <article key={template.id}><div><span>{template.sourceClass}</span><em>{template.catalogState}</em></div><h3>{template.name}</h3><p>{template.protocol}</p><small>{template.targetData.join(" · ")}</small><dl><div><dt>Boundary</dt><dd>{template.targetBoundary}</dd></div><div><dt>Direction</dt><dd>{template.targetDirection}</dd></div><div><dt>Current limit</dt><dd>{template.limitations}</dd></div></dl><button data-action-id={`data.connector.request.${template.id}`} type="button" onClick={() => onRequestConnector(template.id)}>Request source setup</button></article>)}</div>{visibleConnectorDrafts.length > 0 && <div className="iot-draft-list"><header><b>SESSION REQUESTS</b><span>Project {project.code}</span></header>{visibleConnectorDrafts.map((connector) => <article key={connector.id}><div><span>{connector.state}</span><b>{connector.name}</b><small>{connector.protocol}</small></div><dl><div><dt>Policy</dt><dd>{connector.policyReviewState}</dd></div><div><dt>Fixture sample</dt><dd>{connector.sampleState}</dd></div><div><dt>Endpoint</dt><dd>{connector.endpointState}</dd></div><div><dt>Credentials</dt><dd>{connector.credentialState}</dd></div><div><dt>Network</dt><dd>{connector.networkState}</dd></div></dl><button data-action-id={`data.connector.trace.${connector.id}`} type="button" onClick={() => onEvidence(connectorReceiptFor(project, connector))}>Trace request</button><button data-action-id={`data.connector.review.${connector.id}`} type="button" onClick={() => onReviewConnector(connector.id)}>{connector.policyReviewState === "Policy review queued" ? "Policy review queued" : "Send to policy review"}</button><button data-action-id={`data.connector.test.${connector.id}`} type="button" onClick={() => onTestConnector(connector.id)}>{connector.sampleState === "Fixed payload replayed" ? "Replay fixed sample" : "Test fixed sample"}</button></article>)}</div>}</section>
  </div>;
}

function GraphPanel({ project, nodes, traceSteps, selectedNode, onSelect, selected, traceIndex, onEvidence, onSteer, canSteer, onOpenData, query = "", embedded = false }: { project: WorkspaceProject; nodes: ReturnType<typeof graphNodesFor>; traceSteps: readonly TraceStep[]; selectedNode: string; onSelect: (id: string) => void; selected: ReturnType<typeof graphNodesFor>[number] | undefined; traceIndex: number; onEvidence: (target: string | EvidenceReceipt) => void; onSteer: (label: string) => void; canSteer: boolean; onOpenData: () => void; query?: string; embedded?: boolean }) {
  const activeNodes: readonly string[] = traceIndex >= 0 ? traceSteps[traceIndex]?.nodes ?? [] : [];
  const normalizedQuery = query.trim().toLowerCase();
  if (!selected) return <section className="project-empty-state"><span>KNOWLEDGE GRAPH</span><h2>No project graph yet</h2><p>Add a governed dataset or source contract before agents can traverse project entities and relationships.</p><button data-action-id="graph.open-data" type="button" onClick={onOpenData}>Open Sources</button></section>;
  const selectedReceipt = fixtureEvidenceFor(project, { id: `EV-GRAPH-${selected.id}`, claim: `${selected.kind} graph node`, displayedValue: `${selected.label} · ${selected.detail}`, source: "Project knowledge-graph deterministic fixture", formula: "Selected project-scoped node and its fixture relationship context", inputs: [selected.evidenceRef, selected.id], grain: "Graph node" });
  return <div className="graph-os">{!embedded && <header className="section-hero"><div><p>GRAPH</p><h2>Project knowledge graph</h2><span>Inspect evidence-linked entities and steer the visible synthetic traversal.</span></div><span className="truth-chip">{nodes.length} NODES · {project.counts.entities} ENTITIES</span></header>}<div className="graph-layout"><section className="project-knowledge-canvas"><div className="graph-grid-lines" />{projectGraphEdges.map((edge,index) => <span className={`graph-edge ge${index+1}`} key={`${edge[0]}-${edge[1]}`}><i />{edge[2]}</span>)}{nodes.map((node) => { const queryMatch = normalizedQuery && `${node.id} ${node.label} ${node.kind} ${node.detail} ${node.evidenceRef}`.toLowerCase().includes(normalizedQuery); return <button data-action-id={`graph.select.${node.id}`} style={{left:`${node.x}%`,top:`${node.y}%`}} className={`project-graph-node kind-${node.kind.toLowerCase()} ${selectedNode === node.id ? "selected" : ""} ${activeNodes.includes(node.id) ? "tracing" : ""} ${queryMatch ? "query-match" : ""}`} type="button" key={node.id} onClick={() => onSelect(node.id)}><small>{node.kind}</small><b>{node.label}</b><span>{node.detail}</span></button>; })}</section><aside className="graph-sidecar"><p>SELECTED NODE</p><h2>{selected.label}</h2><span>{selected.kind} · {selected.detail}</span><button data-action-id={`graph.evidence.${selected.id}`} type="button" onClick={() => onEvidence(selectedReceipt)}><small>EVIDENCE RECEIPT</small><b>{selectedReceipt.id}</b><em>Open fixture manifest</em></button><section><p>STEER TRACE</p>{["Pin as assumption", "Exclude this source", "Make a hard constraint", "Assign specialist", "Request alternative path"].map((action) => <button data-action-id={`graph.steer.${action}`} type="button" disabled={!canSteer} key={action} onClick={() => onSteer(action)}>{action}<span>+</span></button>)}</section></aside></div><section className="trace-playback"><header><p>AGENT TRAVERSAL</p><span>{traceIndex >= 0 ? `Step ${traceIndex+1} of ${traceSteps.length}` : "Start a run from Playground"}</span></header>{traceSteps.map((step,index) => <article className={index < traceIndex ? "done" : index === traceIndex ? "active" : ""} key={step.title}><span>{String(index+1).padStart(2,"0")}</span><div><small>{step.state} · {step.agent}</small><b>{step.title}</b></div></article>)}</section></div>;
}

type AgentPanelProps = {
  project: WorkspaceProject;
  dataReady: boolean;
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
  playgroundFullscreen: boolean;
  onToggleSessions: () => void;
  onToggleInspector: () => void;
  onToggleFullscreen: () => void;
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

function AgentPanel({ project, dataReady, traceSteps, selectedAgent, selectedAgentId, onSelectAgent, sessions, selectedSession, messages, activities, appRuns, sessionsOpen, inspectorOpen, playgroundFullscreen, onToggleSessions, onToggleInspector, onToggleFullscreen, onSelectSession, onContinueSession, onOpenRun, chatText, onChatText, onSubmit, traceIndex, runState, onAdvance, onCancel, onSteer, onEvidence, onOpenBuilder, agents }: AgentPanelProps) {
  const [inspectorTab, setInspectorTab] = useState<"run" | "result" | "trace" | "apps">("run");
  const [attachedFiles, setAttachedFiles] = useState<readonly string[]>([]);
  const [mentionsOpen, setMentionsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    const frame = window.requestAnimationFrame(() => transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" }));
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length, runState, selectedSession?.id, traceIndex]);

  useEffect(() => {
    if (runState !== "Running" || !dataReady) return;
    const timer = window.setTimeout(onAdvance, 1250);
    return () => window.clearTimeout(timer);
  }, [dataReady, onAdvance, runState, traceIndex]);

  if (!selectedAgent) return <section className="project-empty-state"><span>AGENTS</span><h2>No agents in this project</h2><p>Create a project-scoped agent manifest before a trace or formulation can run.</p><button data-action-id="agents.open-builder.empty" type="button" onClick={onOpenBuilder}>New agent</button></section>;

  const linkedRuns = selectedSession ? appRuns.filter((run) => run.sessionId === selectedSession.id) : [];
  const result = selectedSession?.finalResult;
  const steeringActions = [
    { label: "Pause + pin assumption", icon: "Ⅱ" },
    { label: "Add service constraint", icon: "⊕" },
    { label: "Reject source", icon: "⊘" },
    { label: "Compare robust model", icon: "≋" },
  ] as const;
  const activeTraceIndex = runState === "Completed" ? traceSteps.length - 1 : traceIndex;
  const activityLabel = runState === "Running" && !dataReady ? "Waiting for data setup" : runState === "Running" ? `Running · step ${Math.max(1, traceIndex + 1)} of ${traceSteps.length}` : runState === "Completed" ? "Awaiting human review" : runState === "Cancelled" ? "Stopped" : "Ready for instruction";
  const focusPrompt = () => window.requestAnimationFrame(() => promptRef.current?.focus());
  const insertMention = (agent: ExpertAgent) => {
    const mention = `@${agent.name.replaceAll(" ", "-")}`;
    onChatText(`${chatText}${chatText && !chatText.endsWith(" ") ? " " : ""}${mention} `);
    setMentionsOpen(false);
    focusPrompt();
  };
  const insertCommand = () => {
    onChatText(`${chatText}${chatText && !chatText.endsWith(" ") ? " " : ""}/`);
    focusPrompt();
  };
  const attachFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name).slice(0, 6);
    if (!names.length) return;
    const unique = Array.from(new Set([...attachedFiles, ...names])).slice(0, 6);
    setAttachedFiles(unique);
    const references = names.map((name) => `[file:${name}]`).join(" ");
    onChatText(`${chatText}${chatText && !chatText.endsWith("\n") ? "\n" : ""}${references} `);
    event.target.value = "";
    focusPrompt();
  };
  const submitPrompt = (event: FormEvent) => {
    if (!chatText.trim()) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
    setAttachedFiles([]);
    setMentionsOpen(false);
  };

  return <div className={`agent-os ${sessionsOpen ? "" : "sessions-collapsed"} ${inspectorOpen ? "" : "inspector-collapsed"}`}>
    <aside id="agent-session-list" className="agent-session-rail">
      <header><div><p>SESSIONS</p><h2>{sessions.length} work threads</h2></div><button data-action-id="agents.toggle-sessions" type="button" aria-controls="agent-session-list" aria-expanded={sessionsOpen} title={sessionsOpen ? "Collapse sessions" : "Expand sessions"} onClick={onToggleSessions}>{sessionsOpen ? "‹" : "›"}</button></header>
      {sessionsOpen && <><div className="agent-session-list">{sessions.map((session) => <button data-action-id={`agents.session.select.${session.id}`} className={selectedSession?.id === session.id ? "active" : ""} type="button" key={session.id} onClick={() => onSelectSession(session.id)}><span className={`session-status status-${session.status.toLowerCase().replaceAll(" ", "-")}`} /><div><small>{session.id}</small><b>{session.title}</b><em>{session.updatedAt}</em></div><strong>{session.status}</strong></button>)}</div>{selectedSession && <button data-action-id={`agents.session.continue.${selectedSession.id}`} className="agent-new-session" type="button" onClick={() => onContinueSession(selectedSession.id)}>Continue as new session</button>}</>}
    </aside>

    <section className="agent-session" aria-label={`${project.name} agent terminal`}>
      <div ref={transcriptRef} className="agent-messages" role="log" aria-live="polite" aria-label="Scrollable agent transcript and activity">
        {messages.length ? messages.map((message) => <article className={`message-${message.role}`} key={message.id}>
          <span className="agent-message-mark" aria-hidden="true">{message.role === "user" ? "›" : message.role === "agent" ? "✦" : "·"}</span>
          <div className="agent-message-copy"><header><span>{message.role === "user" ? "YOU" : message.role === "agent" ? message.author : "SYSTEM"}</span><code>{message.id}</code><time>{message.time}</time></header><p>{message.body}</p>{(message.evidenceRefs.length > 0 || message.appRunRefs.length > 0) && <footer>{message.evidenceRefs.map((ref) => <button data-action-id={`agents.message.evidence.${message.id}.${ref}`} type="button" key={ref} onClick={() => onEvidence(ref)}>◇ {ref}</button>)}{message.appRunRefs.map((ref) => <button data-action-id={`agents.message.app-run.${message.id}.${ref}`} type="button" key={ref} onClick={() => onOpenRun(ref)}>▣ {ref}</button>)}</footer>}</div>
        </article>) : <div className="agent-session-zero"><b>Start the first project session</b><p>Send a brief below. tanjx will create a stable session ID and visible scope receipt. Conversation stays available even while project data is being configured.</p></div>}

        <section className={`agent-runtime-feed runtime-${runState.toLowerCase()}`} aria-label="Agent thinking and tool activity" aria-live="polite">
          <button className="agent-runtime-summary" data-action-id="agents.activity.toggle" type="button" aria-expanded={activityOpen} onClick={() => setActivityOpen((current) => !current)}><span aria-hidden="true">✦</span><b>Agent activity</b><small>{activityLabel}</small><code>{selectedSession?.id ?? "no-session"}</code><em aria-hidden="true">{activityOpen ? "⌃" : "⌄"}</em></button>
          {activityOpen && (runState === "Ready" ? <div className="agent-runtime-idle"><span aria-hidden="true">✦</span><code>$</code><span>Waiting for an instruction. Use <b>@agent</b>, <b>/commands</b>, or attach a project file.</span><i /></div> : <div className="agent-runtime-steps">{traceSteps.map((step, index) => {
            const state = runState === "Cancelled" && index === activeTraceIndex ? "stopped" : runState === "Completed" && index === traceSteps.length - 1 ? "review" : index < activeTraceIndex || runState === "Completed" ? "done" : index === activeTraceIndex ? "active" : "queued";
            const receipt = fixtureEvidenceFor(project, { id: `EV-AGENT-TRACE-${index + 1}`, claim: step.title, displayedValue: `${step.state} · ${step.agent}`, source: "Visible agent-trace deterministic fixture", formula: step.detail, inputs: step.nodes, grain: "Agent run × trace step" });
            return <button data-action-id={`agents.trace.${index + 1}`} className={`runtime-step state-${state}`} type="button" key={step.title} onClick={() => onEvidence(receipt)}><span className="runtime-agent-mark" aria-hidden="true">✦</span><div><small>{step.state} · {step.agent}</small><b>{step.title}</b><p>{step.detail}</p></div><em>{state === "done" ? "Done" : state === "active" ? "Working" : state === "review" ? "Review" : state === "stopped" ? "Stopped" : "Queued"}</em></button>;
          })}</div>)}
        </section>

        {result && <section className="agent-final-result"><span className="agent-result-mark" aria-hidden="true">✓</span><div className="agent-final-copy"><span>FINAL RESULT · HUMAN REVIEW REQUIRED</span><h3>{result.headline}</h3><p>{result.recommendation}</p><div>{result.metrics.map((metric) => <dl key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></dl>)}</div><footer>{result.evidenceRefs.map((ref) => <button data-action-id={`agents.result.evidence.${ref}`} type="button" key={ref} onClick={() => onEvidence(ref)}>{ref}</button>)}</footer><small>{result.reviewGate} · {result.claimBoundary}</small></div></section>}
      </div>

      <form className="agent-prompt" onSubmit={submitPrompt}>
        {mentionsOpen && <div id="agent-mention-menu" className="agent-mention-menu" role="listbox" aria-label="Mention a project agent">{agents.map((agent) => <button data-action-id={`agents.mention.${agent.id}`} type="button" role="option" aria-selected={selectedAgentId === agent.id} key={agent.id} onClick={() => insertMention(agent)}><span>{agent.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><div><b>{agent.name}</b><small>{agent.role}</small></div></button>)}</div>}
        {attachedFiles.length > 0 && <div className="agent-attachments" aria-label="Files referenced in the next message">{attachedFiles.map((name) => <span key={name}><b>{name}</b><button data-action-id={`agents.attachment.remove.${name}`} type="button" aria-label={`Remove ${name}`} onClick={() => { setAttachedFiles((current) => current.filter((item) => item !== name)); onChatText(chatText.replace(`[file:${name}]`, "").replace(/\s{2,}/g, " ").trimStart()); }}>×</button></span>)}<small>Filename references only in this concept</small></div>}
        <div className="agent-prompt-row">
          <span className="agent-prompt-mark" aria-hidden="true">›</span>
          <label className="sr-only" htmlFor="project-agent-prompt">Ask project agents</label>
          <textarea rows={1} ref={promptRef} id="project-agent-prompt" value={chatText} onChange={(event) => { onChatText(event.target.value); if (event.target.value.endsWith("@")) setMentionsOpen(true); }} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "u") { event.preventDefault(); attachmentRef.current?.click(); return; } if (event.key === "Escape") { setMentionsOpen(false); return; } if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={`Message ${selectedAgent.name}…`} />
          <div className="agent-composer-toolbar" aria-label="Terminal tools and steering">
            <button className="agent-tool-button" data-action-id="agents.attach-file" data-tooltip="Attach files" title="Attach files (Ctrl U)" type="button" aria-label="Attach files" aria-keyshortcuts="Control+U Meta+U" onClick={() => attachmentRef.current?.click()}><span aria-hidden="true">＋</span></button>
            <button className={`agent-tool-button ${mentionsOpen ? "active" : ""}`} data-action-id="agents.open-mentions" data-tooltip="Mention agents" title="Mention agents" type="button" aria-label="Mention agents" aria-expanded={mentionsOpen} aria-controls="agent-mention-menu" onClick={() => setMentionsOpen((current) => !current)}><span aria-hidden="true">@</span></button>
            <button className="agent-tool-button" data-action-id="agents.insert-command" data-tooltip="Commands" title="Commands" type="button" aria-label="Insert command" onClick={insertCommand}><span aria-hidden="true">/</span></button>
            {steeringActions.map((action) => <button className="agent-tool-button" data-action-id={`agents.steer.${action.label}`} data-tooltip={action.label} title={action.label} type="button" aria-label={action.label} disabled={!selectedSession || !dataReady} key={action.label} onClick={() => onSteer(action.label)}><span aria-hidden="true">{action.icon}</span></button>)}
            <input ref={attachmentRef} className="agent-file-input" type="file" multiple accept=".csv,.xlsx,.json,.pdf,.parquet,.docx,.md,.txt" onChange={attachFiles} />
            <button className="agent-send-button" data-action-id="agents.send-prompt" data-tooltip="Send message" title="Send message" type="submit" aria-label="Send message" disabled={!chatText.trim()}><span aria-hidden="true">↑</span></button>
          </div>
        </div>
      </form>
    </section>

    <aside id="agent-session-context" className="agent-trace-panel">
      <header className="agent-inspector-heading"><div><p>SESSION CONTEXT</p><h2>{selectedSession?.id ?? "No session"}</h2></div><button data-action-id="agents.toggle-inspector" type="button" aria-controls="agent-session-context" aria-expanded={inspectorOpen} title={inspectorOpen ? "Collapse context" : "Expand context"} onClick={onToggleInspector}>{inspectorOpen ? "›" : "‹"}</button></header>
      {inspectorOpen && <><nav className="agent-inspector-tabs" aria-label="Agent session context">{(["run", "result", "trace", "apps"] as const).map((item) => <button data-action-id={`agents.inspector.${item}`} className={inspectorTab === item ? "active" : ""} type="button" key={item} onClick={() => setInspectorTab(item)}>{item}</button>)}</nav><div className="agent-inspector-body">
        {inspectorTab === "run" && <section className="agent-run-inspector"><p>RUN SESSION</p><div className="agent-run-presence"><i /><span><b>Ready to chat</b><small>{activityLabel} · {dataReady ? "Project tools and evidence are available" : "Data setup needed for tools"}</small></span></div><dl><div><dt>Work thread</dt><dd>{selectedSession?.title ?? `${project.name} work session`}</dd></div><div><dt>Entry</dt><dd>{selectedSession ? `${selectedSession.id} · ${selectedSession.entryPoint}` : "New session"}</dd></div><div><dt>Status</dt><dd>{runState === "Running" ? "Trace running" : selectedSession?.status ?? runState}</dd></div></dl><label><span>Run as</span><select aria-label="Select Playground agent" value={selectedAgentId} onChange={(event) => onSelectAgent(event.target.value)}>{agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.name}</option>)}</select></label><div className="agent-run-actions"><button data-action-id="agents.toggle-fullscreen" type="button" aria-pressed={playgroundFullscreen} onClick={onToggleFullscreen}><span aria-hidden="true">{playgroundFullscreen ? "↙" : "↗"}</span>{playgroundFullscreen ? "Exit full screen" : "Full screen"}</button>{runState === "Running" ? <button data-action-id="agents.stop-run" className="agent-stop-run" type="button" onClick={onCancel}>Stop</button> : <button data-action-id="agents.open-builder" type="button" onClick={onOpenBuilder}>New agent</button>}</div></section>}
        {inspectorTab === "result" && <section><p>REVIEW PACKAGE</p>{result ? <><h3>{result.headline}</h3><dl className="agent-result-metrics">{result.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl><small>{result.reviewGate}</small></> : <p>No final result has been recorded for this session.</p>}</section>}
        {inspectorTab === "trace" && <section><p>WORK TRACE</p><div className="session-activity-list">{activities.map((activity) => <button data-action-id={`agents.activity.${activity.id}`} type="button" key={activity.id} onClick={() => activity.appRunId ? onOpenRun(activity.appRunId) : activity.evidenceRefs[0] ? onEvidence(activity.evidenceRefs[0]) : onEvidence(fixtureEvidenceFor(project, { id: `EV-${activity.id}`, claim: activity.title, displayedValue: activity.state, source: "Project activity fixture", formula: activity.detail, inputs: [activity.actor, activity.type], grain: "Session activity" }))}><span>{String(activity.sequence).padStart(2, "0")}</span><div><small>{activity.id} · {activity.actor}</small><b>{activity.title}</b><p>{activity.detail}</p></div><em>{activity.state}</em></button>)}</div></section>}
        {inspectorTab === "apps" && <section><p>APPS USED</p><div className="session-app-runs">{linkedRuns.map((run) => <button data-action-id={`agents.app-run.${run.id}`} type="button" key={run.id} onClick={() => onOpenRun(run.id)}><b>{projectApps.find((app) => app.id === run.appId)?.name}</b><small>{run.id}</small><span>{run.status}</span></button>)}{!linkedRuns.length && <p>No application run is linked yet.</p>}</div></section>}
      </div><div className="run-controls"><button data-action-id="agents.advance-run" type="button" disabled={!selectedSession} onClick={onAdvance}>{!selectedSession ? "Send a brief to start" : runState === "Ready" ? "Start new trace" : runState === "Completed" || runState === "Cancelled" ? "Replay trace" : traceIndex === traceSteps.length - 1 ? "Complete at human gate" : "Next trace step"}</button><button data-action-id="agents.cancel-run" type="button" disabled={runState !== "Running"} onClick={onCancel}>Cancel</button></div></>}
    </aside>
  </div>;
}

function ProjectMembershipsPanel({ project, members, onEvidence }: { project: WorkspaceProject; members: readonly ProjectMemberView[]; onEvidence: (target: string | EvidenceReceipt) => void }) {
  return <section className="project-memberships">
    <header><div><p>PROJECT MEMBERS</p><h2>Client and tanjx access</h2><span>Memberships are scoped to {project.client} / {project.name}.</span></div><span>{members.length} MEMBERS</span></header>
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
  return <div className="team-os"><header className="section-hero"><div><p>SPECIALIST DIRECTORY</p><h2>Available experts</h2><span>Assign additional project specialists and inspect their synthetic profiles.</span></div><span className="truth-chip">{assigned.length} SESSION ASSIGNMENTS · {humanExperts.length} PROFILES</span></header><div className="collaboration-parties"><span><b>Project</b>{project.client}</span><span><b>Provider</b>Supply Chain Workspace</span></div><div className="team-layout"><section className="expert-grid">{humanExperts.map((expert) => <button data-action-id={`team.select.${expert.id}`} className={selectedId === expert.id ? "active" : ""} type="button" key={expert.id} onClick={() => onSelect(expert.id)}><span>{expert.initials}</span><div><small>{expert.id === "maya" ? "Client role template" : "tanjx"} · {expert.role}</small><h3>{expert.name}</h3><p>{expert.specialties.join(" · ")}</p></div><em>{expert.years}y fixture</em></button>)}</section><aside className="expert-inspector"><span>{selected.initials}</span><p>{selected.id === "maya" ? "Client role template" : "tanjx"} · {selected.role}</p><h2>{selected.name}</h2><small>{selected.availability} · fixture state</small><dl><div><dt>Domain-profile experience</dt><dd>{selected.years} years</dd></div><div><dt>Fixture workload</dt><dd>{selected.activeWork} items</dd></div><div><dt>Proposed decision right</dt><dd>{selected.decisionRight}</dd></div></dl><section><p>SPECIALTIES</p>{selected.specialties.map((item) => <b key={item}>{item}</b>)}</section><button className="expert-trace-action" data-action-id={`team.trace.${selected.id}`} type="button" onClick={() => onEvidence(profileReceipt)}>Trace profile</button><button data-action-id={`team.assign.${selected.id}`} type="button" onClick={() => onAssign(selected.id)}>{assigned.includes(selected.id) ? "Remove session assignment" : "Add session assignment"}</button></aside></div></div>;
}

function GovernancePanel({ project, onOutcome, onEvidence }: { project: WorkspaceProject; onOutcome: OutcomeHandler; onEvidence: (target: string | EvidenceReceipt) => void }) {
  const controls = [
    { id: "boundary", icon: "▣", tone: "scope", name: "Project boundary lock", detail: `Restrict the policy draft to ${project.client} / ${project.name}.`, defaultOn: true, critical: true },
    { id: "human-gate", icon: "◎", tone: "approval", name: "Human release approval", detail: "Require a named client or tanjx decision right before release.", defaultOn: true, critical: true },
    { id: "evidence", icon: "◇", tone: "evidence", name: "Evidence required for claims", detail: "Block unsupported values from a review package and expose receipt references.", defaultOn: true, critical: true },
    { id: "solver", icon: "∑", tone: "solver", name: "Solver-claim guard", detail: "Forbid feasible, bounded, or optimal language without solver status and bound metadata.", defaultOn: true, critical: true },
    { id: "learning", icon: "↻", tone: "learning", name: "Learning-capture draft", detail: "Record expert rating and counterfactual metadata; no weights or policy are updated.", defaultOn: false, critical: false },
    { id: "external", icon: "⌁", tone: "external", name: "External-provider access", detail: "Permit only approved licensed connectors; every provider remains disconnected here.", defaultOn: false, critical: true },
  ] as const;
  const defaultStates = Object.fromEntries(controls.map((control) => [control.id, control.defaultOn])) as Record<(typeof controls)[number]["id"], boolean>;
  const [controlStates, setControlStates] = useState(defaultStates);
  const [operatingMode, setOperatingMode] = useState<"Enforce" | "Audit" | "Shadow">("Enforce");
  const [approvalQuorum, setApprovalQuorum] = useState(3);
  const [retention, setRetention] = useState("90 days");
  const [testResult, setTestResult] = useState<{ label: string; detail: string } | null>(null);
  const [auditEntries, setAuditEntries] = useState<readonly string[]>([`Policy draft opened for ${project.code}`]);
  const coverageReceipt = fixtureEvidenceFor(project, { id: "EV-GOV-EVIDENCE-INSTRUMENTATION", claim: "Project evidence instrumentation state", displayedValue: "Partial concept coverage", source: "Front-end interaction inventory", formula: "Manual concept classification: project metric and studio receipt surfaces implemented; production-wide recursive lineage not evaluated", inputs: ["Project metrics", "Studio metrics", "Dataset register", "Agent trace fixtures"], grain: "Project concept surface" });
  const appendAudit = (entry: string) => setAuditEntries((current) => [entry, ...current].slice(0, 8));
  const toggleControl = (control: (typeof controls)[number]) => {
    const next = !controlStates[control.id];
    setControlStates((current) => ({ ...current, [control.id]: next }));
    setTestResult(null);
    appendAudit(`${control.name} set to ${next ? "on" : "off"}`);
  };
  const runTest = () => {
    const required = controls.filter((control) => control.critical && control.id !== "external");
    const passing = required.filter((control) => controlStates[control.id]).length;
    const label = passing === required.length ? `${passing}/${required.length} required checks passed` : `${passing}/${required.length} required checks passed`;
    const detail = passing === required.length ? "Browser policy draft is internally consistent; no backend enforcement was tested." : "One or more required browser controls are disabled; release simulation should remain blocked.";
    setTestResult({ label, detail });
    appendAudit(`Policy test completed: ${label}`);
  };
  const resetControls = () => {
    setControlStates(defaultStates);
    setOperatingMode("Enforce");
    setApprovalQuorum(3);
    setRetention("90 days");
    setTestResult(null);
    appendAudit("Policy draft reset to project defaults");
  };
  const activeCount = controls.filter((control) => controlStates[control.id]).length;
  return <div className="governance-os">
    <header className="section-hero"><div><p>CONTROLS</p><h2>Project policy</h2><span>{project.classification} · {project.dataResidency} · owner {project.owner}</span></div><div className="governance-header-actions"><button data-action-id="governance.test" type="button" onClick={runTest}>Run policy test</button><button data-action-id="governance.export-manifest" type="button" onClick={() => onOutcome("Policy-draft receipt recorded", `${activeCount} of ${controls.length} browser controls, ${operatingMode} mode, quorum ${approvalQuorum}, and ${retention} retention were recorded. No backend policy, manifest file, or external system was changed.`, `GOV-MANIFEST-${project.code}`)}>Record configuration</button></div></header>
    <section className="governance-console" aria-label="Interactive project policy draft">
      <aside className="governance-settings">
        <header><span>POLICY DRAFT</span><b>{activeCount}/{controls.length} controls on</b></header>
        <fieldset><legend>Operating mode</legend><div className="control-segmented">{(["Enforce", "Audit", "Shadow"] as const).map((mode) => <button data-action-id={`governance.mode.${mode.toLowerCase()}`} className={operatingMode === mode ? "active" : ""} type="button" aria-pressed={operatingMode === mode} key={mode} onClick={() => { setOperatingMode(mode); setTestResult(null); appendAudit(`Operating mode changed to ${mode}`); }}>{mode}</button>)}</div></fieldset>
        <fieldset><legend>Approval quorum</legend><div className="control-stepper"><button data-action-id="governance.quorum.decrease" type="button" aria-label="Decrease approval quorum" disabled={approvalQuorum <= 1} onClick={() => { setApprovalQuorum((current) => Math.max(1, current - 1)); setTestResult(null); appendAudit("Approval quorum decreased"); }}>−</button><b>{approvalQuorum}</b><button data-action-id="governance.quorum.increase" type="button" aria-label="Increase approval quorum" disabled={approvalQuorum >= 5} onClick={() => { setApprovalQuorum((current) => Math.min(5, current + 1)); setTestResult(null); appendAudit("Approval quorum increased"); }}>+</button></div><small>Named approvals required before release</small></fieldset>
        <label>Receipt retention<select data-action-id="governance.retention" value={retention} onChange={(event) => { setRetention(event.target.value); setTestResult(null); appendAudit(`Receipt retention changed to ${event.target.value}`); }}><option>30 days</option><option>90 days</option><option>1 year</option><option>Project lifetime</option></select></label>
        <button data-action-id="governance.reset" className="control-reset" type="button" onClick={resetControls}>Reset defaults</button>
      </aside>
      <section className="governance-control-list">{controls.map((control) => <article data-control-tone={control.tone} className={controlStates[control.id] ? "enabled" : "disabled"} key={control.id}><span className="governance-control-icon" aria-hidden="true">{control.icon}</span><div><small>{control.critical ? "REQUIRED CONTROL" : "OPTIONAL CONTROL"}</small><b>{control.name}</b><p>{control.detail}</p></div><button data-action-id={`governance.control.${control.id}`} className="governance-switch" type="button" role="switch" aria-checked={controlStates[control.id]} aria-label={`${controlStates[control.id] ? "Disable" : "Enable"} ${control.name}`} onClick={() => toggleControl(control)}><i /><span>{controlStates[control.id] ? "On" : "Off"}</span></button>{control.id === "evidence" && <button data-action-id="governance.control.evidence.receipt" className="governance-inspect" type="button" onClick={() => onEvidence(coverageReceipt)}>Trace</button>}</article>)}</section>
      <aside className="governance-audit"><header><span>SESSION AUDIT</span><b>{auditEntries.length} events</b></header>{testResult && <section className="governance-test-result" role="status"><span>{testResult.label.startsWith("4/") ? "✓" : "!"}</span><div><b>{testResult.label}</b><p>{testResult.detail}</p></div></section>}<div>{auditEntries.map((entry, index) => <button data-action-id={`governance.audit.${index}`} type="button" key={`${entry}-${index}`} onClick={() => onOutcome("Policy audit event opened", `${entry}. This event exists only in the current browser-session control draft.`, `POLICY-${project.code}-${String(index + 1).padStart(2, "0")}`)}><i>{String(index + 1).padStart(2, "0")}</i><span><b>{entry}</b><small>Browser session · {operatingMode} mode</small></span><em>Open</em></button>)}</div><small>No backend authorization, external provider, solver, learning process, or durable policy engine is connected.</small></aside>
    </section>
  </div>;
}

function EvidenceDrawer({ receipt, onClose, onOutcome }: { receipt: EvidenceReceipt; onClose: () => void; onOutcome: OutcomeHandler }) {
  const dialogRef = useDialogLifecycle<HTMLElement>(true, onClose);
  return <div className="evidence-overlay" data-modal-root><button data-action-id="evidence.dismiss" className="evidence-scrim" type="button" aria-label="Close evidence" onClick={onClose} /><aside ref={dialogRef} className="evidence-drawer" role="dialog" aria-modal="true" aria-label={`Evidence receipt ${receipt.id}`} tabIndex={-1}><header><div><p>EVIDENCE RECEIPT · {receipt.id}</p><h2>{receipt.claim}</h2><span>{receipt.state} · {receipt.sourceKind}</span></div><button data-action-id="evidence.close" type="button" onClick={onClose}>×</button></header><div className="evidence-value"><small>DISPLAYED VALUE</small><strong>{receipt.displayedValue}</strong><span>{receipt.confidence}% confidence · {receipt.variableId}</span></div><section><p>SOURCE IDENTITY</p><dl><div><dt>Source</dt><dd>{receipt.source}</dd></div><div><dt>Exact locator</dt><dd><code>{receipt.locator}</code></dd></div><div><dt>As of</dt><dd>{receipt.asOf}</dd></div><div><dt>Valid for</dt><dd>{receipt.validFor}</dd></div><div><dt>Version</dt><dd>{receipt.version}</dd></div><div><dt>Evidence fingerprint</dt><dd><code>{receipt.contentHash}</code><small>Fixture fingerprints identify this demo record; they are not content hashes.</small></dd></div></dl></section><section><p>TRACE MANIFEST</p><div className="evidence-lineage"><article><span>DECLARED INPUTS</span><b>{receipt.inputs.join(" · ")}</b></article><i>used by ↓</i><article><span>DECLARED ACTIVITY</span><b>{receipt.formula}</b></article><i>generated ↓</i><article className="active"><span>CLAIM</span><b>{receipt.displayedValue} · {receipt.claim}</b></article><i>attributed to ↓</i><article><span>AGENT / REVIEWER</span><b>{receipt.agent} · {receipt.reviewer}</b></article></div><small className="trace-boundary">This is one bounded receipt. Recursive upstream lineage requires connected source records in production.</small></section><section><p>FITNESS + ACCESS</p><dl><div><dt>Decision grain</dt><dd>{receipt.grain}</dd></div><div><dt>Project policy</dt><dd>{receipt.access}</dd></div><div><dt>Trace</dt><dd>{receipt.traceId}</dd></div></dl>{receipt.quality.map((item) => <span className="quality-check" key={item}>✓ {item}</span>)}</section><footer><button data-action-id="evidence.copy-reference" type="button" onClick={() => { onClose(); onOutcome("Evidence-reference receipt recorded", `${receipt.id} was recorded in the browser-session action ledger; no transcript, source system, or durable evidence store was changed.`, receipt.id); }}>Record reference receipt</button><button data-action-id="evidence.done" type="button" onClick={onClose}>Done</button></footer></aside></div>;
}

function AgentBuilder({ project, step, name, onName, onStep, onClose, onPublish }: { project: WorkspaceProject; step: number; name: string; onName: (name: string) => void; onStep: (step: number) => void; onClose: () => void; onPublish: (draft: AgentDraft) => void }) {
  const dialogRef = useDialogLifecycle<HTMLElement>(true, onClose);
  const steps = ["Identity", "Skills manifest", "Connection requests", "Evaluation plan", "Review"];
  const skillOptions = ["or-formulation/SKILL.md", "provenance-audit/SKILL.md", "critical-minerals/SKILL.md"];
  const connectionOptions = [["project-graph", "Read project subgraph"], ["evidence-ledger", "Read and append trace"], ["solver-registry", "Request approved run · disconnected"], ["tool-forge", "Create quarantined draft only"]] as const;
  const [specialty, setSpecialty] = useState("Resilience portfolio");
  const [skills, setSkills] = useState<readonly string[]>(skillOptions.slice(0, 2));
  const [connections, setConnections] = useState<readonly string[]>(["project-graph", "evidence-ledger", "tool-forge"]);
  const [skillFile, setSkillFile] = useState("");
  const toggle = (current: readonly string[], value: string) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const draft = { specialty, skills, connections, skillFile };

  return <div className="builder-overlay" data-modal-root>
    <button data-action-id="agent-builder.dismiss" className="evidence-scrim" type="button" aria-label="Close agent builder" onClick={onClose} />
    <section ref={dialogRef} className="agent-builder" role="dialog" aria-modal="true" aria-label="Create a project agent draft" tabIndex={-1}>
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
