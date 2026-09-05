import { decisionCases, type ScopeId, type ViewId } from "./platform-model";
import { caseIdForProject, projectApps, workspaceProjects, workspaceTabs, type ProjectAppId, type WorkspaceProject, type WorkspaceTabId } from "./workspace-model";

/** Internal compatibility scopes. The UI exposes Workspace and Operations World. */
export const scopeIds: ScopeId[] = ["global", "region", "company"];
const operationsScopeIds: readonly ScopeId[] = ["global", "region"];
const workspaceStudioIds: readonly ProjectAppId[] = ["minerals", "workforce", "manufacturing", "logistics", "quality"];

export const viewLabels: Record<ViewId, string> = {
  global: "Operations World",
  region: "Operations World",
  company: "Workspace",
  risk: "RiskRadar",
  optimizer: "Network Optimizer",
  flow: "FlowLens",
  demand: "DemandSense",
  suppliers: "SupplierGraph",
  decisions: "Decisions",
  case: "Decision",
  action: "Review",
  agents: "Agents",
  graph: "Knowledge graph",
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
};

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function isViewId(value: string | undefined): value is ViewId {
  return Boolean(value && Object.prototype.hasOwnProperty.call(viewLabels, value));
}

export function resolveNavigation(searchParams: NavigationSearchParams = {}, projectCatalog: readonly WorkspaceProject[] = workspaceProjects) {
  const requestedView = first(searchParams.view);
  const requestedCase = first(searchParams.case);
  const requestedSector = first(searchParams.sector);
  const requestedClient = first(searchParams.client);
  const requestedProject = first(searchParams.project);
  const requestedProjectTab = first(searchParams.projectTab);
  const requestedProjectApp = first(searchParams.projectApp);
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
      ? projectCatalog.find((item) => (!hasExplicitSector || item.sectorId === requestedSector) && (!hasExplicitClient || item.clientId === requestedClient))
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
    };
  }

  const projectView: ViewId = view;
  const scope: ScopeId = "company";
  const caseId = caseIdForProject(project);
  const requestedWorkspaceTab: WorkspaceTabId = workspaceTabs.some((item) => item.id === requestedProjectTab)
    ? requestedProjectTab as WorkspaceTabId
    : "overview";
  const nestedProjectTab: WorkspaceTabId | null = projectView === "decisions" || projectView === "agents" || projectView === "graph"
    ? projectView === "decisions" ? "decisions" : projectView
    : null;
  const projectTab = nestedProjectTab ?? requestedWorkspaceTab;
  const projectApp: ProjectAppId | null = projectView === "company" && projectTab === "apps" && workspaceStudioIds.includes(requestedProjectApp as ProjectAppId) && projectApps.some((item) => item.id === requestedProjectApp) && project.mountedAppIds.includes(requestedProjectApp as ProjectAppId)
    ? requestedProjectApp as ProjectAppId
    : null;

  return { view: nestedProjectTab ? "company" as const : projectView, scope, caseId, projectId: project.id, sectorId: project.sectorId, clientId: project.clientId, projectTab, projectApp };
}
