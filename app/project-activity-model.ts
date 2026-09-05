import { expertAgents, projectApps, projectHasDataContract as hasProjectDataContract, type ProjectAppId, type WorkspaceProject } from "./workspace-model";

/** Backward-compatible export for activity and UI consumers; the contract rule lives in the workspace model. */
export const projectHasDataContract = hasProjectDataContract;

export type WorkSessionStatus = "Active" | "Awaiting review" | "Completed" | "Cancelled";
export type SessionMessageKind = "Prompt" | "Response" | "Steering" | "Activity" | "Result";
export type SessionActivityType = "evidence-read" | "graph-traverse" | "app-call" | "tool-call" | "steering" | "validation" | "human-gate";
export type AgentTrace = { stepIndex: number; prompt: string; steeringInstructions: readonly string[] };
export type AgentTraceView = { state: "Ready" | "Running" | "Completed" | "Cancelled"; stepIndex: number; prompt: string; steeringInstructions: readonly string[] };

export type ProjectWorkResult = {
  headline: string;
  recommendation: string;
  metrics: readonly { label: string; value: string }[];
  evidenceRefs: readonly string[];
  reviewGate: string;
  claimBoundary: string;
};

export type ProjectWorkSession = {
  id: string;
  projectId: string;
  parentSessionId?: string;
  entryPoint: "Agent" | "Application";
  title: string;
  objective: string;
  status: WorkSessionStatus;
  startedAt: string;
  updatedAt: string;
  leadAgentId: string;
  participantAgentIds: readonly string[];
  appIds: readonly ProjectAppId[];
  agentTrace?: AgentTrace;
  finalResult?: ProjectWorkResult;
  origin: "Synthetic fixture" | "Browser session";
};

export type SessionMessage = {
  id: string;
  projectId: string;
  sessionId: string;
  sequence: number;
  time: string;
  role: "user" | "agent" | "system";
  author: string;
  kind: SessionMessageKind;
  body: string;
  replyTo?: string;
  evidenceRefs: readonly string[];
  appRunRefs: readonly string[];
};

export type SessionActivity = {
  id: string;
  projectId: string;
  sessionId: string;
  sequence: number;
  type: SessionActivityType;
  actor: string;
  title: string;
  detail: string;
  state: "Complete" | "Review" | "Stopped";
  evidenceRefs: readonly string[];
  appRunId?: string;
};

export type AppRunInput = {
  key: string;
  label: string;
  value: string;
  unit: string;
  editable: boolean;
  evidenceRef?: string;
  kind?: "number" | "choice" | "text";
  min?: number;
  max?: number;
  step?: number;
  options?: readonly string[];
};

export type ProjectAppRun = {
  id: string;
  projectId: string;
  appId: ProjectAppId;
  sessionId: string;
  parentRunId?: string;
  title: string;
  status: "Fixture complete" | "Replay complete" | "Awaiting review";
  executedAt: string;
  reportId: string;
  traceId: string;
  inputVersion: string;
  inputFingerprint: string;
  inputs: readonly AppRunInput[];
  changeSet: readonly { key: string; before: string; after: string }[];
  methods: readonly string[];
  outputs: readonly { label: string; value: string; evidenceRef: string }[];
  summary: string;
  claimBoundary: string;
  origin: "Synthetic fixture" | "Browser session";
};

export type ActivityEvidenceTarget = {
  kind: "run" | "report" | "trace" | "output";
  run: ProjectAppRun;
  output?: ProjectAppRun["outputs"][number];
  outputIndex?: number;
};

export type ProjectActivityState = {
  sessions: readonly ProjectWorkSession[];
  messages: readonly SessionMessage[];
  activities: readonly SessionActivity[];
  appRuns: readonly ProjectAppRun[];
  selectedSessionByProject: Readonly<Record<string, string>>;
  selectedRunByProjectApp: Readonly<Record<string, string>>;
  runDrafts: Readonly<Record<string, Readonly<Record<string, string>>>>;
};

export type ProjectActivityAction =
  | { type: "select-session"; projectId: string; sessionId: string }
  | { type: "fork-session"; projectId: string; sessionId: string }
  | { type: "create-session"; project: WorkspaceProject; prompt: string; agentId: string; agentName: string }
  | { type: "start-agent-trace"; projectId: string; sessionId: string; prompt: string }
  | { type: "advance-agent-trace"; projectId: string; sessionId: string; maxStepIndex: number }
  | { type: "append-message"; projectId: string; sessionId: string; role: SessionMessage["role"]; author: string; kind: SessionMessageKind; body: string; evidenceRefs?: readonly string[]; appRunRefs?: readonly string[] }
  | { type: "steer-session"; projectId: string; sessionId: string; instruction: string }
  | { type: "complete-session"; projectId: string; sessionId: string; result: ProjectWorkResult }
  | { type: "cancel-session"; projectId: string; sessionId: string }
  | { type: "select-app-run"; projectId: string; appId: ProjectAppId; runId: string }
  | { type: "start-app-run"; project: WorkspaceProject; appId: ProjectAppId; sessionId?: string }
  | { type: "edit-app-input"; projectId: string; runId: string; key: string; value: string }
  | { type: "rerun-app"; projectId: string; runId: string; sessionId?: string }
  | { type: "ensure-project"; project: WorkspaceProject };

export type AppRerunPlan = {
  sourceRunId: string;
  sourceSessionId: string;
  runId: string;
  sessionId: string;
  reportId: string;
  traceId: string;
  sessionForked: boolean;
  fixtureSessionForked: boolean;
};

export type SessionMutationPlan = {
  sourceSessionId: string;
  sessionId: string;
  sessionForked: boolean;
};

export type AppStartPlan = {
  appId: ProjectAppId;
  runId: string;
  sessionId: string;
  reportId: string;
  traceId: string;
  sourceSessionId?: string;
  sessionCreated: boolean;
  sessionForked: boolean;
};

const appCodes: Record<ProjectAppId, string> = {
  risk: "RR", optimizer: "NO", flow: "FL", demand: "DS", suppliers: "SG",
  minerals: "MA", workforce: "WS", manufacturing: "MT", logistics: "LR", quality: "QG",
};

const projectToken = (project: WorkspaceProject) => project.code.replaceAll("-", "");
const activityKey = (projectId: string, appId: ProjectAppId) => `${projectId}:${appId}`;

function fingerprintFor(projectId: string, appId: ProjectAppId, inputs: readonly AppRunInput[]): string {
  const canonical = [
    projectId,
    appId,
    ...inputs
      .map((input) => `${input.key}=${input.value}${input.unit}`)
      .sort((left, right) => left.localeCompare(right)),
  ].join("|");
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `FP-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}

const resultFor = (project: WorkspaceProject): ProjectWorkResult => ({
  headline: project.id === "anode-shield" ? "Service-protection candidate ready for human review" : `${project.outcome} - candidate ready for review`,
  recommendation: project.id === "anode-shield"
    ? "Reserve 480 t of qualified alternate capacity and rebalance 64 t of regional inventory while holding projected launch service at 95.1%."
    : `Use the mounted project apps to review ${project.metrics[0]?.label.toLowerCase() ?? "the primary exposure"} before any operational release.`,
  metrics: project.id === "anode-shield"
    ? [{ label: "Alternate capacity", value: "480 t" }, { label: "Inventory rebalance", value: "64 t" }, { label: "Projected service", value: "95.1%" }]
    : project.metrics.slice(0, 3).map((metric) => ({ label: metric.label, value: metric.value })),
  evidenceRefs: project.id === "anode-shield"
    ? ["EV-001-D2A", "EV-001-D2B", "EV-001-02", "EV-001-D3A"]
    : project.metrics.slice(0, 4).map((metric) => metric.evidenceRef),
  reviewGate: project.id === "anode-shield" ? "3 named human approvals required" : `Approval required from ${project.owner}`,
  claimBoundary: "Deterministic synthetic replay only; no LLM, external source, solver, write-back, or reinforcement-learning update ran.",
});

function runInputsFor(project: WorkspaceProject, appId: ProjectAppId): readonly AppRunInput[] {
  const serviceValue = project.id === "anode-shield" ? "95" : "93";
  return [
    { key: "service_floor", label: "Service floor", value: serviceValue, unit: "%", editable: true, kind: "number", min: 0, max: 100, step: 0.1 },
    { key: "planning_horizon", label: "Planning horizon", value: "12", unit: "weeks", editable: true, kind: "number", min: 1, max: 104, step: 1 },
    { key: "scenario", label: "Scenario", value: appId === "risk" ? "P90 disruption" : "Balanced response", unit: "", editable: true, kind: "choice", options: ["Balanced response", "P90 disruption", "Protect service", "Protect cash"] },
    { key: "project_snapshot", label: "Evidence snapshot", value: `${project.code}-SNAPSHOT-01`, unit: "", editable: false, evidenceRef: project.metrics[0]?.evidenceRef },
  ];
}

function runFor(project: WorkspaceProject, appId: ProjectAppId, sessionId: string, ordinal = 19): ProjectAppRun {
  const app = projectApps.find((item) => item.id === appId)!;
  const token = projectToken(project);
  const runCode = appCodes[appId];
  const inputs = runInputsFor(project, appId);
  return {
    id: `APP-${token}-${runCode}-${String(ordinal).padStart(3, "0")}`,
    projectId: project.id,
    appId,
    sessionId,
    title: `${app.name}: ${project.name} review`,
    status: appId === "optimizer" ? "Awaiting review" : "Fixture complete",
    executedAt: "04 Sep 2026 - 14:32 IST",
    reportId: `RPT-${token}-${runCode}-${String(ordinal).padStart(3, "0")}`,
    traceId: `TRACE-${token}-${runCode}-${String(ordinal).padStart(3, "0")}`,
    inputVersion: `${project.code}-inputs@1.3`,
    inputFingerprint: fingerprintFor(project.id, appId, inputs),
    inputs,
    changeSet: [],
    methods: app.methodCodes,
    outputs: project.metrics.slice(0, 3).map((metric) => ({ label: metric.label, value: metric.value, evidenceRef: metric.evidenceRef })),
    summary: `${app.artifact} prepared from the project fixture and stopped at the human review boundary.`,
    claimBoundary: "Synthetic fixture replay; no live application service, model, source system, or solver was called.",
    origin: "Synthetic fixture",
  };
}

function detailedMessages(project: WorkspaceProject, session: ProjectWorkSession, optimizerRunId: string, riskRunId?: string, supplierRunId?: string): readonly SessionMessage[] {
  const token = projectToken(project);
  const messages = project.id === "anode-shield" ? [
    { role: "user", author: "Maya Rao", kind: "Prompt", body: "Protect the 800V launch. Show the evidence, test qualified alternatives, and stop before any supplier or inventory commitment.", evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "Project Orchestrator", kind: "Response", body: "Scope locked to Apex Mobility / Anode Shield. I will coordinate evidence, supplier, risk, and OR specialists and stop at the human gate.", evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "Evidence Auditor", kind: "Activity", body: "Read the graphite allocation, product structure, qualification, order, and movement fixtures. The primary refining-path dependency is 92%.", evidenceRefs: ["EV-001-03"], appRunRefs: [] },
    { role: "agent", author: "Supplier Cartographer", kind: "Activity", body: "SupplierGraph found 480 t of qualified alternate capacity after fixture yield and reservation limits.", evidenceRefs: ["EV-001-D2A"], appRunRefs: supplierRunId ? [supplierRunId] : [] },
    { role: "agent", author: "Risk Sentinel", kind: "Activity", body: "RiskRadar replayed the P90 disruption envelope and retained $42.0M of exposed launch value as a synthetic scenario input.", evidenceRefs: ["EV-001-01"], appRunRefs: riskRunId ? [riskRunId] : [] },
    { role: "user", author: "Maya Rao", kind: "Steering", body: "Keep projected service at or above 95% and forbid unqualified sources.", evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "OR Formulator", kind: "Activity", body: "Added the 95% service floor and qualification as hard constraints; selected M-06, M-20, and M-23 for the auditable model draft.", evidenceRefs: ["EV-001-02", "EV-001-D2A"], appRunRefs: [] },
    { role: "agent", author: "Solver Operator", kind: "Activity", body: "Network Optimizer replayed the deterministic candidate: reserve 480 t and rebalance 64 t. No solver ran and no optimality claim is made.", evidenceRefs: ["EV-001-D2A", "EV-001-D2B"], appRunRefs: [optimizerRunId] },
    { role: "agent", author: "Evidence Auditor", kind: "Result", body: "Candidate verified against the visible fixture: projected service 95.1%; three named approvals remain. The package is ready for human review, not release.", evidenceRefs: ["EV-001-02", "EV-001-D3A"], appRunRefs: [optimizerRunId] },
  ] as const : [
    { role: "user", author: project.owner, kind: "Prompt", body: `Review ${project.problem.toLowerCase()} and prepare a traceable response.`, evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "Project Orchestrator", kind: "Response", body: `Project boundary locked to ${project.client} / ${project.name}.`, evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "Evidence Auditor", kind: "Activity", body: `Read ${project.counts.observations} synthetic observations and checked the declared project evidence.`, evidenceRefs: project.metrics.slice(0, 2).map((metric) => metric.evidenceRef), appRunRefs: [] },
    { role: "agent", author: "OR Formulator", kind: "Activity", body: `Prepared a deterministic formulation draft using ${project.methodCodes.slice(0, 4).join(", ")}.`, evidenceRefs: [], appRunRefs: [optimizerRunId] },
    { role: "agent", author: "Project Orchestrator", kind: "Result", body: `${project.outcome}. Candidate stopped at the named human review gate.`, evidenceRefs: project.metrics.slice(0, 3).map((metric) => metric.evidenceRef), appRunRefs: [optimizerRunId] },
  ] as const;
  return messages.map((message, index) => ({
    ...message,
    id: `MSG-${token}-024-${String(index + 1).padStart(3, "0")}`,
    projectId: project.id,
    sessionId: session.id,
    sequence: index + 1,
    time: `${String(14 + Math.floor(index / 4)).padStart(2, "0")}:${String(8 + (index * 5) % 50).padStart(2, "0")}`,
    replyTo: index > 0 ? `MSG-${token}-024-${String(index).padStart(3, "0")}` : undefined,
  }));
}

function activitiesFor(project: WorkspaceProject, sessionId: string, runs: readonly ProjectAppRun[]): readonly SessionActivity[] {
  const token = projectToken(project);
  const specs: readonly Omit<SessionActivity, "id" | "projectId" | "sessionId" | "sequence">[] = [
    { type: "evidence-read", actor: "Evidence Auditor", title: "Read project evidence", detail: `${project.counts.observations} project fixture observations; no cross-client traversal`, state: "Complete", evidenceRefs: project.metrics.slice(0, 2).map((item) => item.evidenceRef) },
    { type: "graph-traverse", actor: "Supplier Cartographer", title: "Trace dependency path", detail: `${project.client} source to ${project.name} outcome`, state: "Complete", evidenceRefs: project.metrics.slice(1, 3).map((item) => item.evidenceRef) },
    ...runs.slice(0, 3).map((run) => ({ type: "app-call" as const, actor: projectApps.find((app) => app.id === run.appId)?.name ?? run.appId, title: `Replay ${run.title}`, detail: run.summary, state: "Complete" as const, evidenceRefs: run.outputs.map((output) => output.evidenceRef), appRunId: run.id })),
    { type: "validation", actor: "Evidence Auditor", title: "Validate candidate claim", detail: "Units and declared hard constraints checked against the synthetic receipt manifest", state: "Complete", evidenceRefs: project.metrics.slice(0, 3).map((item) => item.evidenceRef) },
    { type: "human-gate", actor: project.owner, title: "Await human decision", detail: resultFor(project).reviewGate, state: "Review", evidenceRefs: resultFor(project).evidenceRefs },
  ];
  return specs.map((activity, index) => ({ ...activity, id: `ACT-${token}-024-${String(index + 1).padStart(3, "0")}`, projectId: project.id, sessionId, sequence: index + 1 }));
}

function historicalMessagesFor(project: WorkspaceProject, session: ProjectWorkSession, runs: readonly ProjectAppRun[]): readonly SessionMessage[] {
  const token = projectToken(project);
  const sessionOrdinal = session.id.split("-").at(-1) ?? "HISTORY";
  const evidenceRefs = project.metrics.slice(0, 3).map((metric) => metric.evidenceRef);
  const specs: readonly Omit<SessionMessage, "id" | "projectId" | "sessionId" | "sequence" | "time" | "replyTo">[] = [
    { role: "user", author: project.owner, kind: "Prompt", body: session.objective, evidenceRefs: [], appRunRefs: [] },
    { role: "agent", author: "Project Orchestrator", kind: "Response", body: `Historical scope locked to ${project.client} / ${project.name}; this immutable fixture records the declared app replays and evidence boundary.`, evidenceRefs: [], appRunRefs: [] },
    ...runs.map((run) => ({ role: "agent" as const, author: projectApps.find((app) => app.id === run.appId)?.name ?? run.appId, kind: "Activity" as const, body: run.summary, evidenceRefs: run.outputs.map((output) => output.evidenceRef), appRunRefs: [run.id] })),
    { role: "agent", author: "Evidence Auditor", kind: "Result", body: `${session.finalResult?.headline ?? session.title}. ${session.finalResult?.recommendation ?? "Historical candidate retained for review."}`, evidenceRefs, appRunRefs: runs.map((run) => run.id) },
  ];
  return specs.map((message, index) => ({
    ...message,
    id: `MSG-${token}-${sessionOrdinal}-${String(index + 1).padStart(3, "0")}`,
    projectId: project.id,
    sessionId: session.id,
    sequence: index + 1,
    time: `${String(10 + index).padStart(2, "0")}:${String(12 + index * 7).padStart(2, "0")}`,
    replyTo: index > 0 ? `MSG-${token}-${sessionOrdinal}-${String(index).padStart(3, "0")}` : undefined,
  }));
}

function historicalActivitiesFor(project: WorkspaceProject, session: ProjectWorkSession, runs: readonly ProjectAppRun[]): readonly SessionActivity[] {
  const token = projectToken(project);
  const sessionOrdinal = session.id.split("-").at(-1) ?? "HISTORY";
  const specs: readonly Omit<SessionActivity, "id" | "projectId" | "sessionId" | "sequence">[] = [
    { type: "evidence-read", actor: "Evidence Auditor", title: "Read historical project evidence", detail: `${project.counts.observations} declared fixture observations within ${project.client} / ${project.name}`, state: "Complete", evidenceRefs: project.metrics.slice(0, 2).map((metric) => metric.evidenceRef) },
    ...runs.map((run) => ({ type: "app-call" as const, actor: projectApps.find((app) => app.id === run.appId)?.name ?? run.appId, title: `Replay ${run.title}`, detail: run.summary, state: "Complete" as const, evidenceRefs: run.outputs.map((output) => output.evidenceRef), appRunId: run.id })),
    { type: "validation", actor: "Evidence Auditor", title: "Validate historical result package", detail: session.finalResult?.claimBoundary ?? "Synthetic fixture validation only", state: "Complete", evidenceRefs: session.finalResult?.evidenceRefs ?? [] },
    { type: "human-gate", actor: project.owner, title: "Historical review recorded", detail: session.finalResult?.reviewGate ?? "Human review fixture", state: "Complete", evidenceRefs: session.finalResult?.evidenceRefs ?? [] },
  ];
  return specs.map((activity, index) => ({
    ...activity,
    id: `ACT-${token}-${sessionOrdinal}-${String(index + 1).padStart(3, "0")}`,
    projectId: project.id,
    sessionId: session.id,
    sequence: index + 1,
  }));
}

function fixtureForProject(project: WorkspaceProject) {
  if (project.origin !== "Seed fixture") return { sessions: [], messages: [], activities: [], appRuns: [] };
  const token = projectToken(project);
  const primaryId = `SES-${token}-024`;
  const primary: ProjectWorkSession = {
    id: primaryId, projectId: project.id, entryPoint: "Agent", title: project.id === "anode-shield" ? "Protect the 800V launch" : `${project.name} response`, objective: project.problem,
    status: "Awaiting review", startedAt: "04 Sep 2026 - 14:08 IST", updatedAt: "04 Sep 2026 - 15:02 IST", leadAgentId: "orchestrator", participantAgentIds: ["evidence", "cartographer", "formulator", "solver"], appIds: [...project.mountedAppIds], finalResult: resultFor(project), origin: "Synthetic fixture",
  };
  const previous: readonly ProjectWorkSession[] = [
    { ...primary, id: `SES-${token}-023`, entryPoint: "Application", title: `Validate ${project.metrics[1]?.label.toLowerCase() ?? "service exposure"}`, objective: `Validate ${project.metrics[1]?.label.toLowerCase() ?? "service exposure"} with the linked application fixtures and retain the evidence trail.`, status: "Completed", startedAt: "03 Sep 2026 - 10:20 IST", updatedAt: "03 Sep 2026 - 11:06 IST", appIds: project.mountedAppIds.slice(0, 2), finalResult: { ...resultFor(project), headline: `${project.metrics[1]?.label ?? project.name} validation fixture completed`, recommendation: `Retain the declared ${project.metrics[1]?.value ?? "project"} result as a historical synthetic review; no operational release occurred.` } },
    { ...primary, id: `SES-${token}-022`, title: "Challenge the current assumptions", objective: "Challenge the current project assumptions with the mounted risk and planning application fixtures.", status: "Completed", startedAt: "02 Sep 2026 - 16:05 IST", updatedAt: "02 Sep 2026 - 16:41 IST", appIds: project.mountedAppIds.slice(1, 3), finalResult: { ...resultFor(project), headline: `${project.name} assumption challenge fixture completed`, recommendation: "Retain the challenged assumptions and their deterministic replay lineage as historical context only." } },
  ];
  const primaryRuns = project.mountedAppIds.map((appId) => runFor(project, appId, primaryId));
  const historicalRuns = previous.flatMap((session, index) => session.appIds.map((appId) => ({
    ...runFor(project, appId, session.id, 18 - index),
    status: "Fixture complete" as const,
    executedAt: session.updatedAt,
    summary: `${projectApps.find((app) => app.id === appId)?.artifact ?? "Application artifact"} retained in immutable historical session ${session.id}; no live application or solver ran.`,
  })));
  const appRuns = [...primaryRuns, ...historicalRuns];
  const optimizer = primaryRuns.find((run) => run.appId === "optimizer") ?? primaryRuns[0];
  const risk = primaryRuns.find((run) => run.appId === "risk");
  const supplier = primaryRuns.find((run) => run.appId === "suppliers");
  const messages = detailedMessages(project, primary, optimizer?.id ?? `APP-${token}-NO-019`, risk?.id, supplier?.id);
  return {
    sessions: [primary, ...previous],
    messages: [...messages, ...previous.flatMap((session) => historicalMessagesFor(project, session, historicalRuns.filter((run) => run.sessionId === session.id)))],
    activities: [...activitiesFor(project, primaryId, primaryRuns), ...previous.flatMap((session) => historicalActivitiesFor(project, session, historicalRuns.filter((run) => run.sessionId === session.id)))],
    appRuns,
  };
}

export function seedProjectActivity(projects: readonly WorkspaceProject[]): ProjectActivityState {
  const fixtures = projects.map(fixtureForProject);
  const sessions = fixtures.flatMap((fixture) => fixture.sessions);
  const appRuns = fixtures.flatMap((fixture) => fixture.appRuns);
  return {
    sessions,
    messages: fixtures.flatMap((fixture) => fixture.messages),
    activities: fixtures.flatMap((fixture) => fixture.activities),
    appRuns,
    selectedSessionByProject: Object.fromEntries(projects.map((project) => [project.id, sessions.find((session) => session.projectId === project.id)?.id ?? ""])),
    selectedRunByProjectApp: Object.fromEntries(projects.flatMap((project) => project.mountedAppIds.flatMap((appId) => {
      const run = appRuns.find((candidate) => candidate.projectId === project.id && candidate.appId === appId);
      return run ? [[activityKey(project.id, appId), run.id]] : [];
    }))),
    runDrafts: {},
  };
}

const trailingOrdinal = (id: string) => Number(id.match(/(?:-S|-)(\d+)$/)?.[1] ?? 0);

export const sessionsForProject = (state: ProjectActivityState, projectId: string) => state.sessions
  .filter((session) => session.projectId === projectId)
  .sort((left, right) => {
    if (left.origin !== right.origin) return left.origin === "Browser session" ? -1 : 1;
    return trailingOrdinal(right.id) - trailingOrdinal(left.id);
  });
export const messagesForSession = (state: ProjectActivityState, projectId: string, sessionId: string) => state.messages.filter((message) => message.projectId === projectId && message.sessionId === sessionId).sort((left, right) => left.sequence - right.sequence);
export const activitiesForSession = (state: ProjectActivityState, projectId: string, sessionId: string) => state.activities.filter((activity) => activity.projectId === projectId && activity.sessionId === sessionId).sort((left, right) => left.sequence - right.sequence);
export const appRunsFor = (state: ProjectActivityState, projectId: string, appId?: ProjectAppId) => state.appRuns
  .map((run, index) => ({ run, index }))
  .filter(({ run }) => run.projectId === projectId && (!appId || run.appId === appId))
  .sort((left, right) => {
    if (left.run.origin !== right.run.origin) return left.run.origin === "Browser session" ? -1 : 1;
    return left.run.origin === "Browser session" ? right.index - left.index : left.index - right.index;
  })
  .map(({ run }) => run);

export function agentTraceView(session: ProjectWorkSession | null | undefined): AgentTraceView {
  if (!session) return { state: "Ready", stepIndex: -1, prompt: "", steeringInstructions: [] };
  if (session.status === "Cancelled") return { state: "Cancelled", stepIndex: session.agentTrace?.stepIndex ?? -1, prompt: session.agentTrace?.prompt ?? session.objective, steeringInstructions: session.agentTrace?.steeringInstructions ?? [] };
  if (session.status === "Awaiting review" || session.status === "Completed") return { state: "Completed", stepIndex: session.agentTrace?.stepIndex ?? -1, prompt: session.agentTrace?.prompt ?? session.objective, steeringInstructions: session.agentTrace?.steeringInstructions ?? [] };
  if (session.agentTrace) return { state: "Running", stepIndex: session.agentTrace.stepIndex, prompt: session.agentTrace.prompt, steeringInstructions: session.agentTrace.steeringInstructions };
  return { state: "Ready", stepIndex: -1, prompt: session.objective, steeringInstructions: [] };
}

export function resolveActivityEvidence(state: ProjectActivityState, projectId: string, reference: string): ActivityEvidenceTarget | undefined {
  for (const run of state.appRuns) {
    if (run.projectId !== projectId) continue;
    if (reference === run.id) return { kind: "run", run };
    if (reference === run.reportId) return { kind: "report", run };
    if (reference === run.traceId) return { kind: "trace", run };
    const outputIndex = reference.startsWith(`${run.traceId}-OUT-`)
      ? run.outputs.findIndex((output) => output.evidenceRef === reference)
      : -1;
    if (outputIndex >= 0) return { kind: "output", run, output: run.outputs[outputIndex], outputIndex };
  }
  return undefined;
}

const nextSessionId = (state: ProjectActivityState, projectId: string, projectCode: string) => `SES-${projectCode.replaceAll("-", "")}-S${String(state.sessions.filter((session) => session.projectId === projectId && session.origin === "Browser session").length + 1).padStart(3, "0")}`;

export function planNewSession(state: ProjectActivityState, project: WorkspaceProject): string {
  return nextSessionId(state, project.id, project.code);
}

export function planSessionMutation(state: ProjectActivityState, projectId: string, sessionId: string): SessionMutationPlan | undefined {
  const session = state.sessions.find((item) => item.id === sessionId && item.projectId === projectId);
  if (!session) return undefined;
  const sessionForked = session.origin !== "Browser session" || session.status !== "Active";
  return {
    sourceSessionId: session.id,
    sessionId: sessionForked ? nextSessionId(state, projectId, session.id.replace("SES-", "").split("-")[0]) : session.id,
    sessionForked,
  };
}

export function planSessionFork(state: ProjectActivityState, projectId: string, sessionId: string): SessionMutationPlan | undefined {
  const session = state.sessions.find((item) => item.id === sessionId && item.projectId === projectId);
  if (!session) return undefined;
  return {
    sourceSessionId: session.id,
    sessionId: nextSessionId(state, projectId, session.id.replace("SES-", "").split("-")[0]),
    sessionForked: true,
  };
}

export function planAppStart(state: ProjectActivityState, project: WorkspaceProject, appId: ProjectAppId, requestedSessionId?: string): AppStartPlan | undefined {
  if (!projectHasDataContract(project) || !projectApps.some((app) => app.id === appId) || !project.mountedAppIds.includes(appId)) return undefined;
  const selectedSessionId = requestedSessionId || state.selectedSessionByProject[project.id] || undefined;
  const sessionPlan = selectedSessionId ? planSessionMutation(state, project.id, selectedSessionId) : undefined;
  if (selectedSessionId && !sessionPlan) return undefined;
  const ordinal = state.appRuns.filter((run) => run.projectId === project.id && run.appId === appId && run.origin === "Browser session").length + 1;
  const suffix = `S${String(ordinal).padStart(3, "0")}`;
  const token = projectToken(project);
  const code = appCodes[appId];
  return {
    appId,
    runId: `APP-${token}-${code}-${suffix}`,
    sessionId: sessionPlan?.sessionId ?? nextSessionId(state, project.id, project.code),
    reportId: `RPT-${token}-${code}-${suffix}`,
    traceId: `TRACE-${token}-${code}-${suffix}`,
    sourceSessionId: sessionPlan?.sourceSessionId,
    sessionCreated: !sessionPlan,
    sessionForked: sessionPlan?.sessionForked ?? false,
  };
}

const nextMessage = (state: ProjectActivityState, session: ProjectWorkSession, input: Omit<SessionMessage, "id" | "projectId" | "sessionId" | "sequence" | "time">): SessionMessage => {
  const sequence = state.messages.filter((message) => message.sessionId === session.id).length + 1;
  return { ...input, id: `MSG-${session.id.replace("SES-", "")}-${String(sequence).padStart(3, "0")}`, projectId: session.projectId, sessionId: session.id, sequence, time: "Now" };
};

const nextActivity = (state: ProjectActivityState, session: ProjectWorkSession, input: Omit<SessionActivity, "id" | "projectId" | "sessionId" | "sequence">): SessionActivity => {
  const sequence = state.activities.filter((activity) => activity.projectId === session.projectId && activity.sessionId === session.id).length + 1;
  return { ...input, id: `ACT-${session.id.replace("SES-", "")}-${String(sequence).padStart(3, "0")}`, projectId: session.projectId, sessionId: session.id, sequence };
};

function forkSessionState(state: ProjectActivityState, source: ProjectWorkSession): { state: ProjectActivityState; session: ProjectWorkSession } {
  const projectCode = source.id.replace("SES-", "").split("-")[0];
  const id = nextSessionId(state, source.projectId, projectCode);
  const fork: ProjectWorkSession = {
    ...source,
    id,
    parentSessionId: source.id,
    status: "Active",
    startedAt: "Now - browser session",
    updatedAt: "Now - browser session",
    appIds: [],
    agentTrace: undefined,
    finalResult: undefined,
    origin: "Browser session",
  };
  const message = nextMessage(state, fork, {
    role: "system",
    author: "Maya",
    kind: "Activity",
    body: `Continued from ${source.id}. The closed source session remains immutable; new steering and replays will be recorded under ${id}.`,
    evidenceRefs: [],
    appRunRefs: [],
  });
  return {
    session: fork,
    state: {
      ...state,
      sessions: [...state.sessions, fork],
      messages: [...state.messages, message],
      selectedSessionByProject: { ...state.selectedSessionByProject, [source.projectId]: id },
    },
  };
}

function mutableSessionState(state: ProjectActivityState, projectId: string, sessionId: string): { state: ProjectActivityState; session: ProjectWorkSession } | undefined {
  const session = state.sessions.find((item) => item.id === sessionId && item.projectId === projectId);
  if (!session) return undefined;
  return session.origin === "Browser session" && session.status === "Active" ? { state, session } : forkSessionState(state, session);
}

function recalculateOutputs(parent: ProjectAppRun, changeSet: readonly { key: string; before: string; after: string }[]): readonly ProjectAppRun["outputs"][number][] {
  const serviceChange = changeSet.find((change) => change.key === "service_floor");
  const outputs = parent.outputs.map((output) => ({ ...output }));
  if (!serviceChange) return outputs;
  const before = Number(serviceChange.before);
  const after = Number(serviceChange.after);
  if (!Number.isFinite(before) || !Number.isFinite(after)) return outputs;
  const index = outputs.findIndex((output) => /^\s*-?\d+(?:\.\d+)?%\s*$/.test(output.value));
  if (index < 0) return outputs;
  const baseline = Number(outputs[index].value.replace("%", ""));
  if (!Number.isFinite(baseline)) return outputs;
  const decimals = outputs[index].value.split(".")[1]?.replace("%", "").length ?? 0;
  const recalculated = Math.min(100, Math.max(0, baseline + (after - before)));
  outputs[index] = {
    ...outputs[index],
    value: `${recalculated.toFixed(decimals)}%`,
  };
  return outputs;
}

export function validateAppInputValue(input: AppRunInput, value: string): string | null {
  if (input.kind === "choice") return input.options?.includes(value) ? null : "Choose one of the declared options.";
  if (input.kind !== "number") return value.trim().length > 0 ? null : "Enter a value.";
  if (!value.trim()) return "Enter a number.";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "Enter a valid number.";
  if (input.min !== undefined && numeric < input.min) return `Minimum ${input.min}${input.unit}.`;
  if (input.max !== undefined && numeric > input.max) return `Maximum ${input.max}${input.unit}.`;
  if (input.step !== undefined && input.step > 0) {
    const base = input.min ?? 0;
    const steps = (numeric - base) / input.step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) return `Use increments of ${input.step}${input.unit}.`;
  }
  return null;
}

export function planAppRerun(state: ProjectActivityState, projectId: string, runId: string, sessionId?: string): AppRerunPlan | undefined {
  const parent = state.appRuns.find((run) => run.id === runId && run.projectId === projectId);
  if (!parent) return undefined;
  const draft = state.runDrafts[parent.id] ?? {};
  if (parent.inputs.some((input) => draft[input.key] !== undefined && validateAppInputValue(input, draft[input.key]) !== null)) return undefined;
  const sourceSessionId = sessionId || state.selectedSessionByProject[projectId] || parent.sessionId;
  const sourceSession = state.sessions.find((session) => session.id === sourceSessionId && session.projectId === projectId);
  if (!sourceSession) return undefined;
  const sessionPlan = planSessionMutation(state, projectId, sourceSession.id);
  if (!sessionPlan) return undefined;
  const ordinal = state.appRuns.filter((run) => run.projectId === parent.projectId && run.appId === parent.appId && run.origin === "Browser session").length + 1;
  const suffix = `R${String(ordinal).padStart(2, "0")}`;
  return {
    sourceRunId: parent.id,
    sourceSessionId: sourceSession.id,
    runId: `${parent.id}-${suffix}`,
    sessionId: sessionPlan.sessionId,
    reportId: `${parent.reportId}-${suffix}`,
    traceId: `${parent.traceId}-${suffix}`,
    sessionForked: sessionPlan.sessionForked,
    fixtureSessionForked: sourceSession.origin === "Synthetic fixture",
  };
}

export function projectActivityReducer(state: ProjectActivityState, action: ProjectActivityAction): ProjectActivityState {
  if (action.type === "select-session") {
    const session = state.sessions.find((item) => item.id === action.sessionId && item.projectId === action.projectId);
    return session ? { ...state, selectedSessionByProject: { ...state.selectedSessionByProject, [action.projectId]: session.id } } : state;
  }
  if (action.type === "select-app-run") {
    const run = state.appRuns.find((item) => item.id === action.runId && item.projectId === action.projectId && item.appId === action.appId);
    return run ? { ...state, selectedRunByProjectApp: { ...state.selectedRunByProjectApp, [activityKey(action.projectId, action.appId)]: run.id } } : state;
  }
  if (action.type === "ensure-project") {
    if (state.selectedSessionByProject[action.project.id] !== undefined) return state;
    return { ...state, selectedSessionByProject: { ...state.selectedSessionByProject, [action.project.id]: "" } };
  }
  if (action.type === "create-session") {
    const id = nextSessionId(state, action.project.id, action.project.code);
    const session: ProjectWorkSession = { id, projectId: action.project.id, entryPoint: "Agent", title: action.prompt.slice(0, 70), objective: action.prompt, status: "Active", startedAt: "Now - browser session", updatedAt: "Now - browser session", leadAgentId: action.agentId, participantAgentIds: [action.agentId], appIds: [], agentTrace: { stepIndex: 0, prompt: action.prompt, steeringInstructions: [] }, origin: "Browser session" };
    const userMessage = nextMessage(state, session, { role: "user", author: action.project.owner, kind: "Prompt", body: action.prompt, evidenceRefs: [], appRunRefs: [] });
    const nextState = { ...state, sessions: [...state.sessions, session], selectedSessionByProject: { ...state.selectedSessionByProject, [action.project.id]: id } };
    const agentMessage = nextMessage({ ...nextState, messages: [...state.messages, userMessage] }, session, { role: "agent", author: action.agentName, kind: "Response", body: `Session ${id} is scoped to ${action.project.client} / ${action.project.name}. This visible replay uses deterministic fixtures and stops at human review.`, evidenceRefs: [], appRunRefs: [] });
    return { ...nextState, messages: [...state.messages, userMessage, agentMessage] };
  }
  if (action.type === "start-agent-trace") {
    const session = state.sessions.find((item) => item.id === action.sessionId && item.projectId === action.projectId);
    if (!session || session.origin !== "Browser session" || session.status !== "Active") return state;
    return { ...state, sessions: state.sessions.map((item) => item.id === session.id ? { ...item, agentTrace: { stepIndex: 0, prompt: action.prompt, steeringInstructions: item.agentTrace?.steeringInstructions ?? [] }, updatedAt: "Now - browser session" } : item) };
  }
  if (action.type === "advance-agent-trace") {
    const session = state.sessions.find((item) => item.id === action.sessionId && item.projectId === action.projectId);
    if (!session || session.origin !== "Browser session" || session.status !== "Active" || !session.agentTrace) return state;
    const stepIndex = Math.min(Math.max(0, action.maxStepIndex), session.agentTrace.stepIndex + 1);
    return { ...state, sessions: state.sessions.map((item) => item.id === session.id ? { ...item, agentTrace: { ...session.agentTrace!, stepIndex }, updatedAt: "Now - browser session" } : item) };
  }
  if (action.type === "fork-session") {
    const source = state.sessions.find((session) => session.id === action.sessionId && session.projectId === action.projectId);
    if (!source) return state;
    return forkSessionState(state, source).state;
  }
  if (action.type === "append-message" || action.type === "steer-session") {
    const writable = mutableSessionState(state, action.projectId, action.sessionId);
    if (!writable) return state;
    const { state: nextState, session } = writable;
    const message = action.type === "steer-session"
      ? nextMessage(nextState, session, { role: "user", author: "Maya Rao", kind: "Steering", body: action.instruction, evidenceRefs: [], appRunRefs: [] })
      : nextMessage(nextState, session, { role: action.role, author: action.author, kind: action.kind, body: action.body, evidenceRefs: action.evidenceRefs ?? [], appRunRefs: action.appRunRefs ?? [] });
    const steeringActivity = action.type === "steer-session"
      ? nextActivity(nextState, session, {
          type: "steering",
          actor: "Maya Rao",
          title: "Apply human steering",
          detail: action.instruction,
          state: "Complete",
          evidenceRefs: [],
        })
      : undefined;
    return {
      ...nextState,
      messages: [...nextState.messages, message],
      activities: steeringActivity ? [...nextState.activities, steeringActivity] : nextState.activities,
      sessions: nextState.sessions.map((item) => item.id === session.id ? { ...item, status: "Active", updatedAt: "Now - browser session", agentTrace: action.type === "steer-session" ? { stepIndex: 0, prompt: item.agentTrace?.prompt ?? item.objective, steeringInstructions: [...(item.agentTrace?.steeringInstructions ?? []), action.instruction] } : item.agentTrace } : item),
    };
  }
  if (action.type === "complete-session") {
    const writable = mutableSessionState(state, action.projectId, action.sessionId);
    if (!writable) return state;
    const { state: nextState, session } = writable;
    const resultMessage = nextMessage(nextState, session, {
      role: "agent",
      author: "Project Orchestrator",
      kind: "Result",
      body: `${action.result.headline}. ${action.result.recommendation} Review gate: ${action.result.reviewGate}.`,
      evidenceRefs: action.result.evidenceRefs,
      appRunRefs: [],
    });
    const reviewActivity = nextActivity(nextState, session, {
      type: "human-gate",
      actor: expertAgents.find((agent) => agent.id === session.leadAgentId)?.name ?? session.leadAgentId,
      title: "Candidate ready for human review",
      detail: action.result.reviewGate,
      state: "Review",
      evidenceRefs: action.result.evidenceRefs,
    });
    return {
      ...nextState,
      messages: [...nextState.messages, resultMessage],
      activities: [...nextState.activities, reviewActivity],
      sessions: nextState.sessions.map((item) => item.id === session.id ? { ...item, status: "Awaiting review", finalResult: action.result, updatedAt: "Now - browser session" } : item),
    };
  }
  if (action.type === "cancel-session") {
    const writable = mutableSessionState(state, action.projectId, action.sessionId);
    if (!writable) return state;
    const { state: nextState, session } = writable;
    const message = nextMessage(nextState, session, { role: "system", author: "Maya", kind: "Activity", body: "Session stopped by a human collaborator. No operational release or write-back occurred.", evidenceRefs: [], appRunRefs: [] });
    const activity = nextActivity(nextState, session, { type: "human-gate", actor: "Maya Rao", title: "Session cancelled", detail: "Stopped before operational release", state: "Stopped", evidenceRefs: [] });
    return {
      ...nextState,
      messages: [...nextState.messages, message],
      activities: [...nextState.activities, activity],
      sessions: nextState.sessions.map((item) => item.id === session.id ? { ...item, status: "Cancelled", updatedAt: "Now - browser session" } : item),
    };
  }
  if (action.type === "start-app-run") {
    const plan = planAppStart(state, action.project, action.appId, action.sessionId);
    if (!plan) return state;
    let nextState = state;
    let session: ProjectWorkSession;
    if (plan.sourceSessionId) {
      const writable = mutableSessionState(state, action.project.id, plan.sourceSessionId);
      if (!writable) return state;
      nextState = writable.state;
      session = writable.session;
    } else {
      session = {
        id: plan.sessionId,
        projectId: action.project.id,
        entryPoint: "Application",
        title: `Use ${projectApps.find((app) => app.id === action.appId)?.name ?? action.appId}`,
        objective: `Create the first traceable ${action.appId} application run for ${action.project.name}.`,
        status: "Active",
        startedAt: "Now - browser session",
        updatedAt: "Now - browser session",
        leadAgentId: "project-orchestrator",
        participantAgentIds: ["project-orchestrator"],
        appIds: [],
        origin: "Browser session",
      };
      const opening = nextMessage(state, session, {
        role: "system",
        author: "Maya",
        kind: "Activity",
        body: `Application session ${session.id} created inside ${action.project.client} / ${action.project.name}.`,
        evidenceRefs: [],
        appRunRefs: [],
      });
      nextState = {
        ...state,
        sessions: [...state.sessions, session],
        messages: [...state.messages, opening],
        selectedSessionByProject: { ...state.selectedSessionByProject, [action.project.id]: session.id },
      };
    }
    const app = projectApps.find((item) => item.id === action.appId)!;
    const inputs = runInputsFor(action.project, action.appId);
    const outputs = action.project.metrics.length
      ? action.project.metrics.slice(0, 3).map((metric) => ({ label: metric.label, value: metric.value, evidenceRef: metric.evidenceRef }))
      : [{ label: "Setup state", value: "Configuration draft", evidenceRef: `${plan.traceId}-OUT-01` }];
    const run: ProjectAppRun = {
      id: plan.runId,
      projectId: action.project.id,
      appId: action.appId,
      sessionId: session.id,
      title: `${app.name}: ${action.project.name} session run`,
      status: "Replay complete",
      executedAt: "Now - browser session",
      reportId: plan.reportId,
      traceId: plan.traceId,
      inputVersion: `${action.project.code}-inputs@session-1`,
      inputFingerprint: fingerprintFor(action.project.id, action.appId, inputs),
      inputs,
      changeSet: [],
      methods: app.methodCodes,
      outputs,
      summary: `${app.artifact} demonstration record created from the current project session and stopped at human review.`,
      claimBoundary: "Browser-session fixture only; no live application, model, source system, solver, or write-back was called.",
      origin: "Browser session",
    };
    const runMessage = nextMessage(nextState, session, {
      role: "agent",
      author: app.name,
      kind: "Activity",
      body: `${run.summary} Fingerprint ${run.inputFingerprint}.`,
      evidenceRefs: outputs.map((output) => output.evidenceRef),
      appRunRefs: [run.id],
    });
    const runActivity = nextActivity(nextState, session, {
      type: "app-call",
      actor: app.name,
      title: `Create ${run.title}`,
      detail: run.summary,
      state: "Complete",
      evidenceRefs: outputs.map((output) => output.evidenceRef),
      appRunId: run.id,
    });
    return {
      ...nextState,
      sessions: nextState.sessions.map((item) => item.id === session.id ? { ...item, status: "Active", updatedAt: "Now - browser session", appIds: item.appIds.includes(action.appId) ? item.appIds : [...item.appIds, action.appId] } : item),
      messages: [...nextState.messages, runMessage],
      activities: [...nextState.activities, runActivity],
      appRuns: [...nextState.appRuns, run],
      selectedSessionByProject: { ...nextState.selectedSessionByProject, [action.project.id]: session.id },
      selectedRunByProjectApp: { ...nextState.selectedRunByProjectApp, [activityKey(action.project.id, action.appId)]: run.id },
    };
  }
  if (action.type === "edit-app-input") {
    const run = state.appRuns.find((item) => item.id === action.runId && item.projectId === action.projectId);
    const input = run?.inputs.find((item) => item.key === action.key && item.editable);
    if (!run || !input) return state;
    return { ...state, runDrafts: { ...state.runDrafts, [run.id]: { ...(state.runDrafts[run.id] ?? {}), [action.key]: action.value } } };
  }
  if (action.type === "rerun-app") {
    const plan = planAppRerun(state, action.projectId, action.runId, action.sessionId);
    if (!plan) return state;
    const parent = state.appRuns.find((item) => item.id === action.runId && item.projectId === action.projectId);
    if (!parent) return state;
    const writable = mutableSessionState(state, action.projectId, plan.sourceSessionId);
    if (!writable) return state;
    const { state: nextState, session } = writable;
    const draft = nextState.runDrafts[parent.id] ?? {};
    const inputs = parent.inputs.map((input) => ({ ...input, value: draft[input.key] ?? input.value }));
    const changeSet = parent.inputs.flatMap((input) => draft[input.key] !== undefined && draft[input.key] !== input.value ? [{ key: input.key, before: input.value, after: draft[input.key] }] : []);
    const id = plan.runId;
    const outputs = recalculateOutputs(parent, changeSet).map((output, index) => changeSet.length
      ? { ...output, evidenceRef: `${plan.traceId}-OUT-${String(index + 1).padStart(2, "0")}` }
      : output);
    const inputFingerprint = fingerprintFor(parent.projectId, parent.appId, inputs);
    const serviceChange = changeSet.find((change) => change.key === "service_floor");
    const serviceOutputIndex = serviceChange ? outputs.findIndex((output, index) => output.value !== parent.outputs[index]?.value) : -1;
    const baseSummary = parent.summary.split(" Replay inputs:")[0];
    const changeSummary = changeSet.length
      ? `${changeSet.length} editable assumption${changeSet.length === 1 ? "" : "s"} changed${serviceChange ? `; service floor ${serviceChange.before}% -> ${serviceChange.after}%${serviceOutputIndex >= 0 ? ` recalculated ${outputs[serviceOutputIndex].label} to ${outputs[serviceOutputIndex].value}` : ""}` : ""}.`
      : "Inputs replayed without changes.";
    const run: ProjectAppRun = {
      ...parent,
      id,
      sessionId: session.id,
      parentRunId: parent.id,
      status: "Replay complete",
      executedAt: "Now - browser session",
      reportId: plan.reportId,
      traceId: plan.traceId,
      inputVersion: `${parent.inputVersion.split("+")[0]}+${inputFingerprint}`,
      inputFingerprint,
      inputs,
      changeSet,
      outputs,
      summary: `${baseSummary} Replay inputs: ${changeSummary}`,
      origin: "Browser session",
    };
    const appName = projectApps.find((app) => app.id === parent.appId)?.name ?? parent.appId;
    const runMessage = nextMessage(nextState, session, {
      role: "agent",
      author: appName,
      kind: "Activity",
      body: `${run.summary} Fingerprint ${inputFingerprint}.`,
      evidenceRefs: outputs.map((output) => output.evidenceRef),
      appRunRefs: [id],
    });
    const runActivity = nextActivity(nextState, session, {
      type: "app-call",
      actor: appName,
      title: `Replay ${run.title}`,
      detail: run.summary,
      state: "Complete",
      evidenceRefs: outputs.map((output) => output.evidenceRef),
      appRunId: id,
    });
    return {
      ...nextState,
      sessions: nextState.sessions.map((item) => item.id === session.id ? { ...item, status: "Active", updatedAt: "Now - browser session", appIds: item.appIds.includes(parent.appId) ? item.appIds : [...item.appIds, parent.appId] } : item),
      messages: [...nextState.messages, runMessage],
      activities: [...nextState.activities, runActivity],
      appRuns: [...nextState.appRuns, run],
      selectedRunByProjectApp: { ...nextState.selectedRunByProjectApp, [activityKey(parent.projectId, parent.appId)]: id },
      runDrafts: { ...nextState.runDrafts, [parent.id]: {} },
    };
  }
  return state;
}
