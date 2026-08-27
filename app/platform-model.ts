export type ScopeId = "global" | "region" | "company";
export type AppId = "risk" | "optimizer" | "flow" | "demand" | "suppliers";
export type DataViewId = "agents" | "graph";
export type ViewId = ScopeId | AppId | DataViewId;
export type StatusTone = "healthy" | "watch" | "critical" | "opportunity" | "info";

export type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
  trend: string;
};

export type NetworkNode = {
  id: string;
  name: string;
  kind: "port" | "plant" | "supplier" | "market" | "warehouse";
  x: number;
  y: number;
  tone: StatusTone;
  orders: string;
  value: string;
  detail: string;
};

export type NetworkRoute = {
  id: string;
  from: string;
  to: string;
  mode: "Ocean" | "Air" | "Road" | "Rail";
  volume: string;
  value: string;
  status: StatusTone;
  asset: string;
  eta: string;
};

export type Intel = {
  id: string;
  title: string;
  detail: string;
  impact: string;
  confidence: number;
  tone: StatusTone;
  horizon: string;
  source: string;
};

export type MoneyFlow = {
  label: string;
  value: string;
  detail: string;
  percent: number;
  tone: StatusTone;
};

export type SupplierExposure = {
  name: string;
  category: string;
  tier: string;
  spend: string;
  dependency: number;
  risk: StatusTone;
  region: string;
};

export type ScopeSnapshot = {
  id: ScopeId;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  context: string;
  currency: string;
  updated: string;
  metrics: readonly Metric[];
  nodes: readonly NetworkNode[];
  routes: readonly NetworkRoute[];
  intel: readonly Intel[];
  money: readonly MoneyFlow[];
  suppliers: readonly SupplierExposure[];
};

const globalNodes: readonly NetworkNode[] = [
  { id: "ningbo", name: "Ningbo", kind: "port", x: 78, y: 42, tone: "watch", orders: "1,920 orders", value: "$184M", detail: "Electronics and precision components origin" },
  { id: "singapore", name: "Singapore", kind: "port", x: 73, y: 64, tone: "critical", orders: "812 orders", value: "$96M", detail: "Transshipment dwell is 31% above baseline" },
  { id: "chennai", name: "Chennai", kind: "plant", x: 64, y: 58, tone: "healthy", orders: "2,460 orders", value: "$142M", detail: "Regional assembly and export hub" },
  { id: "rotterdam", name: "Rotterdam", kind: "port", x: 48, y: 31, tone: "healthy", orders: "1,284 orders", value: "$118M", detail: "EU inbound gateway and customs node" },
  { id: "pune", name: "Pune Plant 02", kind: "plant", x: 61, y: 55, tone: "watch", orders: "486 priority orders", value: "$72M", detail: "Graphite and controller exposure" },
  { id: "detroit", name: "Detroit", kind: "market", x: 23, y: 37, tone: "healthy", orders: "3,104 orders", value: "$268M", detail: "North American customer demand center" },
  { id: "monterrey", name: "Monterrey", kind: "warehouse", x: 18, y: 53, tone: "opportunity", orders: "924 orders", value: "$64M", detail: "Available inventory for network rebalancing" },
  { id: "santos", name: "Santos", kind: "port", x: 34, y: 73, tone: "watch", orders: "348 orders", value: "$29M", detail: "Weather-driven schedule volatility" },
];

const globalRoutes: readonly NetworkRoute[] = [
  { id: "G-01", from: "ningbo", to: "singapore", mode: "Ocean", volume: "12.8K TEU", value: "$218M", status: "watch", asset: "MV Eastern Arc", eta: "ETA 04 Sep" },
  { id: "G-02", from: "singapore", to: "chennai", mode: "Ocean", volume: "6.1K TEU", value: "$96M", status: "critical", asset: "MV Meridian Star", eta: "ETA +3.4 days" },
  { id: "G-03", from: "chennai", to: "rotterdam", mode: "Ocean", volume: "8.4K TEU", value: "$184M", status: "healthy", asset: "MV Baltic Nova", eta: "ETA 18 Sep" },
  { id: "G-04", from: "rotterdam", to: "detroit", mode: "Ocean", volume: "4.6K TEU", value: "$142M", status: "healthy", asset: "Atlantic Bridge 7", eta: "ETA 21 Sep" },
  { id: "G-05", from: "monterrey", to: "detroit", mode: "Road", volume: "428 loads", value: "$44M", status: "opportunity", asset: "Dedicated fleet", eta: "2.1 day transit" },
  { id: "G-06", from: "santos", to: "rotterdam", mode: "Ocean", volume: "2.2K TEU", value: "$31M", status: "watch", asset: "MV Southern Cross", eta: "ETA +1.2 days" },
];

const globalIntel: readonly Intel[] = [
  { id: "INT-301", title: "Graphite capacity is being contracted ahead of the open market", detail: "Three public agreements now reserve 23% of forecast merchant supply through Q2.", impact: "$42M margin exposure", confidence: 91, tone: "critical", horizon: "60–120 days", source: "Filings + trade data" },
  { id: "INT-302", title: "Singapore dwell is propagating into two priority corridors", detail: "Nine vessels and 812 open orders are inside the current delay window.", impact: "3.4 days service risk", confidence: 94, tone: "watch", horizon: "5–12 days", source: "AIS + terminal feeds" },
  { id: "INT-303", title: "Mexico inventory can protect North American service", detail: "Rebalancing 14% of controller stock protects 428 high-margin orders.", impact: "$7.8M value protected", confidence: 86, tone: "opportunity", horizon: "This week", source: "ERP + WMS twin" },
  { id: "INT-304", title: "Carbon evidence gaps threaten EU-bound steel programs", detail: "Twelve suppliers are missing fields required for the next reporting cycle.", impact: "$18.7M revenue gated", confidence: 97, tone: "watch", horizon: "Next filing", source: "Policy + supplier portal" },
];

const globalMoney: readonly MoneyFlow[] = [
  { label: "Goods in motion", value: "$1.28B", detail: "Across 2,164 active movements", percent: 82, tone: "healthy" },
  { label: "Receivables exposed", value: "$214M", detail: "Linked to delayed customer orders", percent: 41, tone: "watch" },
  { label: "Inventory cash", value: "$486M", detail: "37 days on hand across the network", percent: 63, tone: "info" },
  { label: "Margin at risk", value: "$42M", detail: "14 active disruption cases", percent: 27, tone: "critical" },
];

const globalSuppliers: readonly SupplierExposure[] = [
  { name: "NeoGraph Materials", category: "Battery graphite", tier: "Tier 2", spend: "$84M", dependency: 92, risk: "critical", region: "East Asia" },
  { name: "Hanwa Microdevices", category: "Power semiconductors", tier: "Tier 2", spend: "$112M", dependency: 81, risk: "watch", region: "Japan" },
  { name: "Apex Castings", category: "Precision housings", tier: "Tier 1", spend: "$48M", dependency: 64, risk: "opportunity", region: "India" },
  { name: "NordSteel AB", category: "Specialty steel", tier: "Tier 1", spend: "$76M", dependency: 58, risk: "healthy", region: "Europe" },
];

function metrics(values: readonly [string, string, string, StatusTone, string][]): readonly Metric[] {
  return values.map(([label, value, detail, tone, trend]) => ({ label, value, detail, tone, trend }));
}

export const scopeSnapshots: Record<ScopeId, ScopeSnapshot> = {
  global: {
    id: "global",
    label: "Global platform",
    shortLabel: "Global",
    title: "See the whole network. Act where value is moving.",
    description: "One global operating picture across market intelligence, suppliers, orders, cargo, vessels, cash, and customer commitments.",
    context: "12 regions · 48 countries · 6,420 suppliers",
    currency: "USD",
    updated: "Live · refreshed 2 min ago",
    metrics: metrics([
      ["Network spend", "$8.4B", "Direct + indirect annualized", "info", "+3.8% YoY"],
      ["Goods in motion", "$1.28B", "2,164 active movements", "healthy", "82% on plan"],
      ["Open orders", "18,402", "$2.6B customer value", "healthy", "+6.2% vs plan"],
      ["Critical suppliers", "27", "9 require a decision", "critical", "+4 this week"],
      ["Global OTIF", "93.8%", "Target 96.0%", "watch", "−1.1 pts"],
      ["Active disruptions", "14", "$42M margin exposure", "critical", "3 escalating"],
    ]),
    nodes: globalNodes,
    routes: globalRoutes,
    intel: globalIntel,
    money: globalMoney,
    suppliers: globalSuppliers,
  },
  region: {
    id: "region",
    label: "Regional platform",
    shortLabel: "APAC",
    title: "Run APAC as one connected operating region.",
    description: "Translate global signals into corridor, country, plant, supplier, and customer actions for the Asia-Pacific network.",
    context: "APAC · 11 countries · 1,846 suppliers",
    currency: "USD",
    updated: "Live · refreshed 46 sec ago",
    metrics: metrics([
      ["Regional spend", "$3.1B", "46% electronics + materials", "info", "+5.1% YoY"],
      ["Cargo in motion", "$486M", "642 shipments · 18 vessels", "watch", "11 delayed"],
      ["Open orders", "4,812", "$742M customer value", "healthy", "94.9% confirmed"],
      ["Critical suppliers", "11", "4 single-source dependencies", "critical", "+2 this month"],
      ["Regional OTIF", "92.4%", "Target 95.0%", "watch", "−1.8 pts"],
      ["Cash opportunity", "$18.6M", "Inventory + payment actions", "opportunity", "30-day window"],
    ]),
    nodes: globalNodes.filter((node) => ["ningbo", "singapore", "chennai", "pune", "rotterdam"].includes(node.id)).map((node, index) => ({ ...node, x: [77, 68, 50, 45, 18][index], y: [24, 56, 64, 52, 30][index] })),
    routes: globalRoutes.filter((route) => ["G-01", "G-02", "G-03"].includes(route.id)),
    intel: [globalIntel[1], globalIntel[0], { ...globalIntel[2], id: "INT-AP-03", title: "Vietnam casting capacity matches two constrained families", impact: "$4.6M savings potential" }, globalIntel[3]],
    money: [
      { label: "APAC goods in motion", value: "$486M", detail: "642 active shipments", percent: 74, tone: "watch" },
      { label: "Supplier payables", value: "$312M", detail: "21 days weighted term", percent: 56, tone: "info" },
      { label: "Inventory cash", value: "$164M", detail: "42 days on hand", percent: 68, tone: "watch" },
      { label: "Cash release", value: "$18.6M", detail: "Five feasible actions", percent: 32, tone: "opportunity" },
    ],
    suppliers: globalSuppliers.filter((supplier) => ["East Asia", "Japan", "India"].includes(supplier.region)),
  },
  company: {
    id: "company",
    label: "Company platform",
    shortLabel: "Apex Mobility",
    title: "Turn outside change into company-specific decisions.",
    description: "A private decision twin connecting Apex Mobility’s products, suppliers, materials, plants, orders, margins, and execution workflows.",
    context: "Apex Mobility · Private tenant · 14 plants",
    currency: "USD",
    updated: "Private graph · refreshed 18 sec ago",
    metrics: metrics([
      ["Addressable spend", "$780M", "84% mapped to products", "info", "+2.4% YoY"],
      ["Goods in motion", "$96.4M", "214 active movements", "healthy", "91% on plan"],
      ["Open orders", "1,284", "$226M customer value", "healthy", "97.1% confirmed"],
      ["Critical suppliers", "9", "3 decisions due today", "critical", "2 single-source"],
      ["Company OTIF", "95.1%", "Target 96.5%", "watch", "−0.6 pts"],
      ["Value protected", "$12.8M", "Across 7 governed cases", "opportunity", "+$3.1M MTD"],
    ]),
    nodes: [
      { ...globalNodes[0], id: "neo", name: "NeoGraph Materials", kind: "supplier", x: 77, y: 27, detail: "Tier-2 graphite source · 92% dependency" },
      { ...globalNodes[1], x: 64, y: 48 },
      { ...globalNodes[2], x: 48, y: 61 },
      { ...globalNodes[4], x: 38, y: 49 },
      { ...globalNodes[5], x: 16, y: 33 },
      { ...globalNodes[6], x: 19, y: 63 },
    ],
    routes: [
      { id: "C-01", from: "neo", to: "singapore", mode: "Ocean", volume: "1.4K t", value: "$18.2M", status: "critical", asset: "MV Meridian Star", eta: "ETA +3.4 days" },
      { id: "C-02", from: "singapore", to: "chennai", mode: "Ocean", volume: "812 TEU", value: "$24.6M", status: "watch", asset: "MV Eastern Arc", eta: "ETA 04 Sep" },
      { id: "C-03", from: "chennai", to: "pune", mode: "Road", volume: "186 loads", value: "$9.4M", status: "healthy", asset: "Dedicated fleet", eta: "18 hour transit" },
      { id: "C-04", from: "pune", to: "detroit", mode: "Air", volume: "42 priority lots", value: "$31.8M", status: "watch", asset: "CX 071", eta: "ETA 30 Aug" },
      { id: "C-05", from: "monterrey", to: "detroit", mode: "Road", volume: "128 loads", value: "$12.4M", status: "opportunity", asset: "Dedicated fleet", eta: "2.1 day transit" },
    ],
    intel: [
      { ...globalIntel[0], id: "INT-CO-01", impact: "$4.2M Apex margin exposure", detail: "The private graph links the capacity event to 28 orders, four programs, and Graphite G-142." },
      { ...globalIntel[1], id: "INT-CO-02", impact: "11 priority orders exposed", detail: "Two Apex containers are on delayed vessels; one inventory transfer is feasible." },
      { ...globalIntel[2], id: "INT-CO-03", impact: "$1.8M company value protected", detail: "Monterrey stock can protect the Detroit launch without premium freight." },
      { ...globalIntel[3], id: "INT-CO-04", impact: "$6.4M revenue needs evidence", detail: "Three Apex suppliers remain incomplete for the next EU reporting cycle." },
    ],
    money: [
      { label: "Customer value in motion", value: "$96.4M", detail: "214 active movements", percent: 78, tone: "healthy" },
      { label: "Receivables exposed", value: "$18.2M", detail: "Linked to 11 priority orders", percent: 35, tone: "watch" },
      { label: "Inventory cash", value: "$42.8M", detail: "39 days on hand", percent: 61, tone: "info" },
      { label: "Value protected MTD", value: "$12.8M", detail: "7 measured decisions", percent: 72, tone: "opportunity" },
    ],
    suppliers: [
      { ...globalSuppliers[0], spend: "$18.4M", dependency: 92 },
      { ...globalSuppliers[1], spend: "$26.8M", dependency: 81 },
      { ...globalSuppliers[2], spend: "$12.1M", dependency: 64 },
      { ...globalSuppliers[3], spend: "$16.6M", dependency: 58 },
    ],
  },
};

export const applications: readonly { id: AppId; name: string; shortName: string; description: string; outcome: string; icon: string; accent: string }[] = [
  { id: "risk", name: "RiskRadar", shortName: "Risk", description: "Trace disruptions through the n-tier supply network and rank procurement criticality.", outcome: "Know what can stop production", icon: "RR", accent: "#ff715b" },
  { id: "optimizer", name: "Network Optimizer", shortName: "Optimize", description: "Solve sourcing, inventory, production, and logistics decisions with explicit constraints.", outcome: "Choose the best feasible response", icon: "NO", accent: "#d7ff38" },
  { id: "flow", name: "FlowLens", shortName: "Flow", description: "Connect material movement to cash, working capital, revenue, and margin.", outcome: "See where money is trapped", icon: "FL", accent: "#6ed0ff" },
  { id: "demand", name: "DemandSense", shortName: "Demand", description: "Combine orders, market signals, consumption, and customer behavior into demand scenarios.", outcome: "Plan demand before it surprises you", icon: "DS", accent: "#b8a4ff" },
  { id: "suppliers", name: "SupplierGraph", shortName: "Suppliers", description: "Understand n-tier suppliers, alternatives, performance, capabilities, and evidence.", outcome: "Find dependency and optionality", icon: "SG", accent: "#77d59c" },
];

export type AgentStatus = "running" | "attention" | "paused";
export type DataAgent = {
  id: string;
  name: string;
  source: string;
  mode: string;
  status: AgentStatus;
  freshness: string;
  records: string;
  entities: string;
  quality: number;
  boundary: string;
};

export const dataAgents: readonly DataAgent[] = [
  { id: "sap", name: "ERP transaction agent", source: "SAP S/4HANA", mode: "CDC + read-only APIs", status: "running", freshness: "18 sec", records: "18.4M", entities: "Orders · inventory · finance", quality: 98, boundary: "Client VPC" },
  { id: "plm", name: "Product knowledge agent", source: "Teamcenter PLM", mode: "Events + scheduled crawl", status: "running", freshness: "4 min", records: "4.6M", entities: "BOM · materials · revisions", quality: 96, boundary: "Client VPC" },
  { id: "tms", name: "Movement agent", source: "TMS + AIS + carrier APIs", mode: "Event stream", status: "running", freshness: "42 sec", records: "2.8M", entities: "Ships · cargo · lanes · ETA", quality: 94, boundary: "Hybrid" },
  { id: "supplier", name: "Supplier portal agent", source: "Portals + EDI + documents", mode: "API + document extraction", status: "attention", freshness: "26 min", records: "742K", entities: "Suppliers · capacity · evidence", quality: 87, boundary: "Client VPC" },
  { id: "public", name: "Market intelligence swarm", source: "Web · filings · news · trade data", mode: "Continuous evidence crawl", status: "running", freshness: "2 min", records: "84.2M", entities: "Events · companies · commodities", quality: 91, boundary: "Platform" },
  { id: "mail", name: "Unstructured operations agent", source: "Approved mailboxes + files", mode: "Policy-scoped extraction", status: "paused", freshness: "Paused", records: "184K", entities: "Commitments · exceptions · actions", quality: 89, boundary: "Client VPC" },
];

export type OptimizationInput = {
  supplyLossPercent: number;
  disruptionWeeks: number;
  serviceTarget: number;
  budgetMillions: number;
  carbonLimitPercent: number;
  strategy: "Balanced" | "Service first" | "Cash first" | "Lowest carbon";
};

export type OptimizationResult = {
  runId: string;
  protectedMargin: number;
  totalCost: number;
  projectedService: number;
  residualRisk: number;
  carbonDelta: number;
  allocations: readonly { action: string; volume: string; timing: string; owner: string; cost: string }[];
  warnings: readonly string[];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 1) => Number(value.toFixed(digits));

export function solveNetworkPlan(input: OptimizationInput): OptimizationResult {
  const normalized = {
    supplyLossPercent: clamp(input.supplyLossPercent, 0, 100),
    disruptionWeeks: clamp(input.disruptionWeeks, 1, 52),
    serviceTarget: clamp(input.serviceTarget, 70, 100),
    budgetMillions: clamp(input.budgetMillions, 0, 25),
    carbonLimitPercent: clamp(input.carbonLimitPercent, -20, 20),
    strategy: input.strategy,
  };
  const strategyFactor = { Balanced: 0.84, "Service first": 0.94, "Cash first": 0.72, "Lowest carbon": 0.78 }[normalized.strategy];
  const spendFactor = clamp(normalized.budgetMillions / 4, 0, 1);
  const stress = normalized.supplyLossPercent * (normalized.disruptionWeeks / 12);
  const mitigation = clamp(strategyFactor * (0.62 + spendFactor * 0.38), 0.2, 0.97);
  const totalCost = Math.min(normalized.budgetMillions, 0.6 + stress * 0.065 * (normalized.strategy === "Cash first" ? 0.72 : 1));
  const projectedService = clamp(normalized.serviceTarget - stress * 0.18 * (1 - mitigation), 68, 99.5);
  const residualRisk = clamp(100 - mitigation * 100, 3, 78);
  const carbonDelta = normalized.strategy === "Lowest carbon" ? -2.8 : round(normalized.supplyLossPercent * 0.055 + (normalized.strategy === "Service first" ? 1.2 : 0));
  const protectedMargin = (1.8 + stress * 0.21) * mitigation;
  const alternateShare = round(clamp(normalized.supplyLossPercent * mitigation * 0.58, 4, 34));
  const transferTons = Math.round(clamp(stress * 0.9, 8, 74));
  const warnings: string[] = [];
  if (totalCost >= normalized.budgetMillions && normalized.budgetMillions < 3) warnings.push("Budget is binding; the solver leaves service below the requested target.");
  if (projectedService < normalized.serviceTarget) warnings.push(`Projected service is ${round(normalized.serviceTarget - projectedService)} points below target.`);
  if (carbonDelta > normalized.carbonLimitPercent) warnings.push("The fastest feasible route exceeds the selected carbon envelope.");

  return {
    runId: `OR-${normalized.strategy.replace(/\s/g, "").toUpperCase()}-${normalized.supplyLossPercent}-${normalized.disruptionWeeks}-${normalized.budgetMillions}`,
    protectedMargin: round(protectedMargin, 2),
    totalCost: round(totalCost, 2),
    projectedService: round(projectedService),
    residualRisk: round(residualRisk),
    carbonDelta: round(carbonDelta),
    allocations: [
      { action: `Reserve ${alternateShare}% alternate graphite capacity`, volume: `${Math.round(alternateShare * 18)} t`, timing: "Week 1", owner: "Category lead", cost: `$${round(totalCost * .48, 2)}M` },
      { action: "Reallocate Monterrey safety stock", volume: `${transferTons} t`, timing: "48 hours", owner: "Network planning", cost: `$${round(totalCost * .22, 2)}M` },
      { action: "Prioritize high-margin customer orders", volume: "428 orders", timing: "Weeks 1–4", owner: "Customer operations", cost: `$${round(totalCost * .12, 2)}M` },
      { action: "Qualify Vietnam casting capacity", volume: "2 part families", timing: "6 weeks", owner: "Supplier quality", cost: `$${round(totalCost * .18, 2)}M` },
    ],
    warnings,
  };
}
