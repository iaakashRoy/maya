import { decisionCases, type ScopeId, type ViewId } from "./platform-model";

export const scopeIds: ScopeId[] = ["global", "region", "company"];

export const viewLabels: Record<ViewId, string> = {
  global: "Global platform",
  region: "Regional platform",
  company: "Company platform",
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
  const view: ViewId = isViewId(requestedView) ? requestedView : "global";
  const selectedCase = decisionCases.find((item) => item.id === requestedCase);
  const isCaseAwareView = view === "case" || view === "action" || view === "decisions" || view === "risk" || view === "optimizer" || view === "flow" || view === "demand" || view === "suppliers";
  const scope: ScopeId = isScopeId(view)
    ? view
    : selectedCase && isCaseAwareView
      ? selectedCase.scope
      : isScopeId(requestedScope)
        ? requestedScope
        : "global";
  const caseId = selectedCase?.scope === scope ? selectedCase.id : decisionCases.find((item) => item.scope === scope)?.id ?? decisionCases[0].id;

  return { view, scope, caseId };
}
