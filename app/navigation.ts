import type { ScopeId, ViewId } from "./platform-model";

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
  agents: "Data Agent Hub",
  graph: "Knowledge Graph",
};

type SearchValue = string | string[] | undefined;

export type NavigationSearchParams = {
  view?: SearchValue;
  scope?: SearchValue;
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
  const view: ViewId = isViewId(requestedView) ? requestedView : "global";
  const scope: ScopeId = isScopeId(view) ? view : isScopeId(requestedScope) ? requestedScope : "global";

  return { view, scope };
}
