import { decisionCases, type ScopeId, type ViewId } from "./platform-model";
import { caseIdForProject, projectApps, workspaceProjects, workspaceTabs, type ProjectAppId, type WorkspaceTabId } from "./workspace-model";

export const scopeIds: ScopeId[] = ["global", "region", "company"];
const workspaceStudioIds: readonly ProjectAppId[] = ["minerals", "workforce", "manufacturing", "logistics", "quality"];

export const viewLabels: Record<ViewId, string> = {
  global: "Global platform",
  region: "Regional platform",
  company: "Expert workspace",
  risk: "RiskRadar",
  optimizer: "Network Optimizer",
  flow: "FlowLens",
  demand: "DemandSense",
  suppliers: "SupplierGraph",
  decisions: "Decision Inbox",
  case: "Case Workspace",
  action: "Action Room",
  agents: "Data Agent Hub",
  graph: "Knowledge Graph",
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

function isScopeId(value: string | undefined): value is ScopeId {
  return scopeIds.includes(value as ScopeId);
}

export function resolveNavigation(searchParams: NavigationSearchParams = {}) {
  const requestedView = first(searchParams.view);
  const requestedScope = first(searchParams.scope);
  const requestedCase = first(searchParams.case);
  const requestedSector = first(searchParams.sector);
  const requestedClient = first(searchParams.client);
  const requestedProject = first(searchParams.project);
  const requestedProjectTab = first(searchParams.projectTab);
  const requestedProjectApp = first(searchParams.projectApp);
  const view: ViewId = isViewId(requestedView) ? requestedView : "global";
  const selectedCase = decisionCases.find((item) => item.id === requestedCase);
  const projectFromGeneratedCase = requestedCase
    ? workspaceProjects.find((item) => caseIdForProject(item) === requestedCase)
    : undefined;
  const hasExplicitProject = searchParams.project !== undefined;
  const hasExplicitSector = searchParams.sector !== undefined;
  const hasExplicitClient = searchParams.client !== undefined;
  const project = hasExplicitProject
    ? workspaceProjects.find((item) => item.id === requestedProject)
    : hasExplicitSector || hasExplicitClient
      ? workspaceProjects.find((item) => (!hasExplicitSector || item.sectorId === requestedSector) && (!hasExplicitClient || item.clientId === requestedClient))
      : projectFromGeneratedCase ?? workspaceProjects[0];

  if (!project) {
    const globalCaseId = selectedCase?.scope === "global"
      ? selectedCase.id
      : decisionCases.find((item) => item.scope === "global")?.id ?? decisionCases[0].id;
    return {
      view: "global" as const,
      scope: "global" as const,
      caseId: globalCaseId,
      projectId: "",
      sectorId: null,
      clientId: null,
      projectTab: "overview" as const,
      projectApp: null,
    };
  }

  const isCaseAwareView = view === "case" || view === "action" || view === "decisions" || view === "risk" || view === "optimizer" || view === "flow" || view === "demand" || view === "suppliers";
  const scope: ScopeId = isScopeId(view)
    ? view
    : selectedCase && isCaseAwareView
      ? selectedCase.scope
      : isScopeId(requestedScope)
        ? requestedScope
        : projectFromGeneratedCase && isCaseAwareView
          ? "company"
          : "global";
  const caseId = scope === "company"
    ? caseIdForProject(project)
    : selectedCase?.scope === scope
      ? selectedCase.id
      : decisionCases.find((item) => item.scope === scope)?.id ?? decisionCases[0].id;
  const requestedWorkspaceTab: WorkspaceTabId = workspaceTabs.some((item) => item.id === requestedProjectTab)
    ? requestedProjectTab as WorkspaceTabId
    : "overview";
  const nestedProjectTab: WorkspaceTabId | null = scope === "company" && (view === "decisions" || view === "agents" || view === "graph")
    ? view === "decisions" ? "decisions" : view
    : null;
  const projectTab = nestedProjectTab ?? requestedWorkspaceTab;
  const projectApp: ProjectAppId | null = view === "company" && projectTab === "apps" && workspaceStudioIds.includes(requestedProjectApp as ProjectAppId) && projectApps.some((item) => item.id === requestedProjectApp) && project.mountedAppIds.includes(requestedProjectApp as ProjectAppId)
    ? requestedProjectApp as ProjectAppId
    : null;

  return { view: nestedProjectTab ? "company" as const : view, scope, caseId, projectId: project.id, sectorId: project.sectorId, clientId: project.clientId, projectTab, projectApp };
}
