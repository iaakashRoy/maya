import { applications, decisionCases, type ScopeId, type ViewId } from "./platform-model";
import { caseIdForProject, projectApps, projectHasDataContract, workspaceProjects, workspaceSurfaceIds, type ProjectAppId, type WorkspaceProject, type WorkspaceTabId } from "./workspace-model";
import type { ProjectActivityState } from "./project-activity-model";

/** Internal compatibility scopes. The UI exposes Workspace and Operations World. */
export const scopeIds: ScopeId[] = ["global", "region", "company"];
const operationsScopeIds: readonly ScopeId[] = ["global", "region"];
const workspaceStudioIds: readonly ProjectAppId[] = ["minerals", "workforce", "manufacturing", "logistics", "quality"];

export const viewLabels: Record<ViewId, string> = {
  global: "Operations World",
  region: "Operations World",
  company: "Workspace",
  risk: "Risk Radar",
  optimizer: "Network Optimizer",
  flow: "Flow Lens",
  demand: "Demand Sense",
  suppliers: "Supplier Graph",
  decisions: "Decisions",
  case: "Decision",
  action: "Review",
  agents: "Playground",
  graph: "Data & graph",
};

type SearchValue = string | string[] | undefined;

export type NavigationSearchParams = {
  view?: SearchValue;
  scope?: SearchValue;
  case?: SearchValue;
  sector?: SearchValue;
  client?: SearchValue;
  project?: SearchValue;
  projectTab?: SearchValue;
  projectApp?: SearchValue;
  session?: SearchValue;
  run?: SearchValue;
};

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function isViewId(value: string | undefined): value is ViewId {
  return Boolean(value && Object.prototype.hasOwnProperty.call(viewLabels, value));
}

export function resolveNavigation(searchParams: NavigationSearchParams = {}, projectCatalog: readonly WorkspaceProject[] = workspaceProjects, activityState?: ProjectActivityState) {
  const requestedView = first(searchParams.view);
  const requestedCase = first(searchParams.case);
  const requestedProject = first(searchParams.project);
  const requestedProjectTab = first(searchParams.projectTab);
  const requestedProjectApp = first(searchParams.projectApp);
  const requestedSession = first(searchParams.session);
  const requestedRun = first(searchParams.run);
  const view: ViewId = isViewId(requestedView) ? requestedView : "company";
  const selectedCase = decisionCases.find((item) => item.id === requestedCase);

  // Operations World is authoritative. Stale project parameters must never
  // turn a Global or Regional URL into a project workspace.
  if (operationsScopeIds.includes(view as ScopeId)) {
    const operationsScope = view as "global" | "region";
    const operationsCaseId = selectedCase?.scope === operationsScope
      ? selectedCase.id
      : decisionCases.find((item) => item.scope === operationsScope)?.id ?? decisionCases[0].id;
    return {
      view: operationsScope,
      scope: operationsScope,
      caseId: operationsCaseId,
      projectId: "",
      sectorId: null,
      clientId: null,
      projectTab: "overview" as const,
      projectApp: null,
      sessionId: null,
      runId: null,
    };
  }

  const projectFromGeneratedCase = requestedCase
    ? projectCatalog.find((item) => caseIdForProject(item) === requestedCase)
    : undefined;
  const hasExplicitProject = searchParams.project !== undefined;
  const hasExplicitSector = searchParams.sector !== undefined;
  const hasExplicitClient = searchParams.client !== undefined;
  const explicitProject = hasExplicitProject ? projectCatalog.find((item) => item.id === requestedProject) : undefined;
  const project = hasExplicitProject
    ? explicitProject
    : hasExplicitSector || hasExplicitClient
      ? undefined
      : projectFromGeneratedCase;

  if (!project) {
    const workspaceCaseId = decisionCases.find((item) => item.scope === "company")?.id ?? decisionCases[0].id;
    return {
      view: "company" as const,
      scope: "company" as const,
      caseId: workspaceCaseId,
      projectId: "",
      sectorId: null,
      clientId: null,
      projectTab: "overview" as const,
      projectApp: null,
      sessionId: null,
      runId: null,
    };
  }

  const requestedLegacyApp = applications.some((item) => item.id === view) ? view as ProjectAppId : null;
  // A copied or restored URL must obey the same data-readiness gate as an
  // in-product app launch. Keep the project context, but send app/run intents
  // to Data & graph until a canonical L0 contract exists.
  if (!projectHasDataContract(project) && (requestedLegacyApp || requestedProjectApp || requestedRun)) {
    return {
      view: "company" as const,
      scope: "company" as const,
      caseId: caseIdForProject(project),
      projectId: project.id,
      sectorId: project.sectorId,
      clientId: project.clientId,
      projectTab: "data" as const,
      projectApp: null,
      sessionId: null,
      runId: null,
    };
  }
  const legacyAppAllowed = !requestedLegacyApp || project.mountedAppIds.includes(requestedLegacyApp);
  const projectView: ViewId = legacyAppAllowed ? view : "company";
  const scope: ScopeId = "company";
  const caseId = caseIdForProject(project);
  const migratedProjectTab = requestedProjectTab === "team" ? "overview" : requestedProjectTab;
  const requestedWorkspaceTab: WorkspaceTabId = workspaceSurfaceIds.includes(migratedProjectTab as WorkspaceTabId)
    ? migratedProjectTab as WorkspaceTabId
    : "overview";
  const nestedProjectTab: WorkspaceTabId | null = projectView === "decisions" || projectView === "agents" || projectView === "graph"
    ? projectView === "decisions" ? "decisions" : projectView
    : null;
  let projectTab = legacyAppAllowed ? nestedProjectTab ?? requestedWorkspaceTab : "apps";
  const projectApp: ProjectAppId | null = projectView === "company" && projectTab === "apps" && workspaceStudioIds.includes(requestedProjectApp as ProjectAppId) && projectApps.some((item) => item.id === requestedProjectApp) && project.mountedAppIds.includes(requestedProjectApp as ProjectAppId)
    ? requestedProjectApp as ProjectAppId
    : null;

  const session = activityState?.sessions.find((item) => item.id === requestedSession && item.projectId === project.id);
  const run = activityState?.appRuns.find((item) => item.id === requestedRun && item.projectId === project.id);
  const runMatchesSession = !session || !run || run.sessionId === session.id;
  const visibleAppId = projectApp ?? (requestedLegacyApp && legacyAppAllowed ? requestedLegacyApp : null);
  const normalizedView: ViewId = nestedProjectTab ? "company" : projectView;
  const runMatchesSurface = !run || !visibleAppId || run.appId === visibleAppId;
  const runId = run && runMatchesSession && runMatchesSurface ? run.id : null;
  let sessionId = runId ? run!.sessionId : requestedRun ? null : session?.id ?? null;
  if (runId) projectTab = "apps";
  else if (sessionId && normalizedView === "company" && !projectApp) projectTab = "agents";
  else if (sessionId && (normalizedView !== "company" || projectApp)) sessionId = null;

  return { view: normalizedView, scope, caseId, projectId: project.id, sectorId: project.sectorId, clientId: project.clientId, projectTab, projectApp, sessionId, runId };
}
