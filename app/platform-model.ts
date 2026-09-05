export type ScopeId = "global" | "region" | "company";
export type AppId = "risk" | "optimizer" | "flow" | "demand" | "suppliers";
export type DataViewId = "agents" | "graph";
export type WorkflowViewId = "decisions" | "case" | "action";
export type ViewId = ScopeId | AppId | DataViewId | WorkflowViewId;
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
  { id: "INT-301", title: "Graphite capacity is being contracted ahead of the open market", detail: "Three synthetic agreement records reserve 23% of illustrative merchant supply through Q2.", impact: "$42M margin exposure", confidence: 91, tone: "critical", horizon: "60–120 days", source: "Synthetic filings + trade-data fixture" },
  { id: "INT-302", title: "Singapore dwell is propagating into two priority corridors", detail: "Nine vessels and 812 open orders are inside the current delay window.", impact: "3.4 days service risk", confidence: 94, tone: "watch", horizon: "5–12 days", source: "Synthetic AIS + terminal fixture" },
  { id: "INT-303", title: "Mexico inventory can protect North American service", detail: "Rebalancing 14% of fixture controller stock protects 428 illustrative high-margin orders.", impact: "$7.8M value protected", confidence: 86, tone: "opportunity", horizon: "This week", source: "Synthetic ERP + WMS-twin fixture" },
  { id: "INT-304", title: "Carbon evidence gaps threaten EU-bound steel programs", detail: "Twelve synthetic supplier records are missing fields in the demonstration reporting cycle.", impact: "$18.7M revenue gated", confidence: 97, tone: "watch", horizon: "Next filing", source: "Synthetic policy + supplier-portal fixture" },
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
    label: "Operations World",
    shortLabel: "Global",
    title: "Global network",
    description: "Market, supplier, order, cargo, asset, cash, and customer signals in one evidence-linked network view.",
    context: "12 regions · 48 countries · 6,420 suppliers",
    currency: "USD",
    updated: "Fixture snapshot · advanced 2 min ago",
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
    label: "Operations World",
    shortLabel: "APAC",
    title: "APAC network",
    description: "Corridor, country, plant, supplier, and customer signals for the Asia-Pacific network.",
    context: "APAC · 11 countries · 1,846 suppliers",
    currency: "USD",
    updated: "Fixture snapshot · advanced 46 sec ago",
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
    label: "Project workspace",
    shortLabel: "Apex Mobility",
    title: "Project overview",
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
  { id: "optimizer", name: "Network Optimizer", shortName: "Optimize", description: "Frame, calculate, and compare sourcing, inventory, production, and logistics responses with explicit constraints.", outcome: "Choose the best-evidenced response", icon: "NO", accent: "#d7ff38" },
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
  { id: "sap", name: "ERP transaction agent", source: "Expected source · SAP S/4HANA", mode: "Target mode · CDC + read-only APIs", status: "running", freshness: "18 sec fixture", records: "18.4M", entities: "Orders · inventory · finance", quality: 98, boundary: "Client VPC target" },
  { id: "plm", name: "Product knowledge agent", source: "Expected source · Teamcenter PLM", mode: "Target mode · events + scheduled crawl", status: "running", freshness: "4 min fixture", records: "4.6M", entities: "BOM · materials · revisions", quality: 96, boundary: "Client VPC target" },
  { id: "tms", name: "Movement agent", source: "Expected sources · TMS + AIS + carrier APIs", mode: "Target mode · event stream", status: "running", freshness: "42 sec fixture", records: "2.8M", entities: "Ships · cargo · lanes · ETA", quality: 94, boundary: "Hybrid target" },
  { id: "supplier", name: "Supplier portal agent", source: "Expected sources · portals + EDI + documents", mode: "Target mode · API + document extraction", status: "attention", freshness: "26 min fixture", records: "742K", entities: "Suppliers · capacity · evidence", quality: 87, boundary: "Client VPC target" },
  { id: "public", name: "Market intelligence swarm", source: "Expected sources · web + filings + news + trade data", mode: "Target mode · bounded evidence collection", status: "running", freshness: "2 min fixture", records: "84.2M", entities: "Events · companies · commodities", quality: 91, boundary: "Platform target" },
  { id: "mail", name: "Unstructured operations agent", source: "Expected sources · approved mailboxes + files", mode: "Target mode · policy-scoped extraction", status: "paused", freshness: "Paused", records: "184K", entities: "Commitments · exceptions · actions", quality: 89, boundary: "Client VPC target" },
  { id: "wms", name: "Warehouse execution agent", source: "Expected sources · WMS + yard + labor systems", mode: "Target mode · events + bounded polling", status: "running", freshness: "36 sec fixture", records: "9.8M", entities: "Receipts · picks · doors · inventory age", quality: 97, boundary: "Client VPC target" },
  { id: "qms", name: "Quality evidence agent", source: "Expected sources · QMS + laboratory + audit packs", mode: "Target mode · events + governed documents", status: "attention", freshness: "19 min fixture", records: "1.1M", entities: "Lots · defects · certificates · CAPA", quality: 92, boundary: "Client VPC target" },
  { id: "crm", name: "Demand signal agent", source: "Expected sources · CRM + order portal + channel inventory", mode: "Target mode · CDC + approved signals", status: "running", freshness: "3 min fixture", records: "6.7M", entities: "Opportunities · orders · programs · overrides", quality: 95, boundary: "Client VPC target" },
  { id: "finance", name: "Financial flow agent", source: "Expected sources · ERP finance + treasury + tariff books", mode: "Target mode · CDC + daily controls", status: "running", freshness: "54 sec fixture", records: "12.6M", entities: "Invoices · payables · receivables · margin", quality: 98, boundary: "Client VPC target" },
  { id: "carbon", name: "Resource and carbon agent", source: "Expected sources · metering + carrier factors + declarations", mode: "Target mode · hourly + evidence event", status: "attention", freshness: "47 min fixture", records: "886K", entities: "Energy · carbon · water · product evidence", quality: 84, boundary: "Hybrid target" },
  { id: "customs", name: "Trade and customs agent", source: "Expected sources · broker milestones + declarations + policy", mode: "Target mode · event stream + policy rules", status: "running", freshness: "6 min fixture", records: "2.3M", entities: "Entries · holds · duties · market access", quality: 93, boundary: "Hybrid target" },
];

export type DecisionStage = "Detect" | "Validate" | "Simulate" | "Approve" | "Execute" | "Measure";
export type DecisionStatus = "New" | "In analysis" | "Awaiting approval" | "Approved" | "Executing" | "Monitoring" | "Closed";
export type DecisionSeverity = "Critical" | "High" | "Medium" | "Opportunity";

export type AppContribution = {
  app: AppId;
  headline: string;
  value: string;
  detail: string;
  method: string;
  freshness: string;
  tone: StatusTone;
  state: "Ready" | "Review" | "Running";
};

export type DecisionScenario = {
  id: string;
  name: string;
  posture: string;
  cost: string;
  service: string;
  protectedValue: string;
  cashImpact: string;
  residualRisk: number;
  carbonDelta: string;
  recommended: boolean;
  methodStack: string;
  feasibility: "Inside hard envelope" | "Conditional" | "Fails hard constraint";
  change: string;
};

export type CaseEvidence = {
  id: string;
  source: string;
  fact: string;
  confidence: number;
  observed: string;
  kind: "Observed" | "Corroborated" | "Inferred";
};

export type ExecutionTask = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: "Ready" | "In progress" | "Blocked" | "Complete";
};

export type DecisionCase = {
  id: string;
  scope: ScopeId;
  title: string;
  summary: string;
  severity: DecisionSeverity;
  status: DecisionStatus;
  stage: DecisionStage;
  owner: string;
  ownerInitials: string;
  due: string;
  updated: string;
  value: string;
  serviceExposure: string;
  confidence: number;
  primaryEntity: string;
  affectedEntities: readonly string[];
  variableIds: readonly string[];
  methodCodes: readonly string[];
  recommendation: string;
  contributions: readonly AppContribution[];
  scenarios: readonly DecisionScenario[];
  evidence: readonly CaseEvidence[];
  tasks: readonly ExecutionTask[];
  outcome: {
    baseline: string;
    target: string;
    realized: string;
    measurementWindow: string;
  };
};

function buildContributions(values: {
  exposure: string;
  dependency: string;
  demand: string;
  plan: string;
  financial: string;
  riskTone?: StatusTone;
}): readonly AppContribution[] {
  return [
    { app: "risk", headline: "Exposure path quantified", value: values.exposure, detail: "Probability, recoverability, propagation path, and business interruption range are linked to the case.", method: "M-16 · M-22 · M-23", freshness: "2 min ago", tone: values.riskTone ?? "critical", state: "Ready" },
    { app: "suppliers", headline: "Dependency and optionality resolved", value: values.dependency, detail: "Ownership, capability, qualification, site, tier, and alternative-source evidence are connected.", method: "M-04 · M-25 · M-29", freshness: "7 min ago", tone: "watch", state: "Ready" },
    { app: "demand", headline: "Demand to protect", value: values.demand, detail: "Consensus, downside, upside, and constrained-supply scenarios are reconciled at the case grain.", method: "M-02 · M-03 · M-20", freshness: "11 min ago", tone: "info", state: "Review" },
    { app: "optimizer", headline: "Illustrative response portfolio", value: values.plan, detail: "Hard checks, objective posture, evidence kind, warnings, and fallback actions are retained; concept calculations make no solver or optimality claim.", method: "M-06 · M-12 · M-20 · M-24", freshness: "18 min ago", tone: "opportunity", state: "Ready" },
    { app: "flow", headline: "Financial consequence", value: values.financial, detail: "Inventory, premium freight, revenue, margin, receivables, and working-capital effects are reconciled.", method: "M-01 · M-16 · M-24", freshness: "21 min ago", tone: "healthy", state: "Ready" },
  ];
}

function buildScenarios(id: string, protectedValues: readonly [string, string, string], services: readonly [string, string, string]): readonly DecisionScenario[] {
  const serviceValues = services.map((value) => Number.parseFloat(value));
  const serviceFirst = `${Math.min(99.9, Math.max(...serviceValues, serviceValues[1] + .8)).toFixed(1)}%`;
  return [
    { id: `${id}-A`, name: "Hold current plan", posture: "Lowest immediate spend", cost: "$0.4M", service: services[0], protectedValue: protectedValues[0], cashImpact: "+$0.2M", residualRisk: 72, carbonDelta: "0.0%", recommended: false, methodStack: "M-01 baseline · M-16 stress", feasibility: "Fails hard constraint", change: "No network action; exposes the avoidable-loss baseline." },
    { id: `${id}-B`, name: "Balanced response", posture: "Margin, service, and stability", cost: "$1.8M", service: services[1], protectedValue: protectedValues[1], cashImpact: "−$0.8M", residualRisk: 18, carbonDelta: "+0.6%", recommended: true, methodStack: "M-06 · M-20 · M-23 · M-24", feasibility: "Inside hard envelope", change: "Balances alternate capacity, inventory, transport, and order priority." },
    { id: `${id}-C`, name: "Service-first response", posture: "Maximum customer protection", cost: "$3.1M", service: serviceFirst, protectedValue: protectedValues[2], cashImpact: "−$2.3M", residualRisk: 9, carbonDelta: "+2.4%", recommended: false, methodStack: "M-06 · M-21 · M-23", feasibility: "Conditional", change: "Adds expedite and protected stock; requires higher cash and carbon authority." },
    { id: `${id}-D`, name: "Robust reserve", posture: "Worst-case feasibility", cost: "$2.4M", service: services[1], protectedValue: protectedValues[1], cashImpact: "−$1.4M", residualRisk: 12, carbonDelta: "+0.4%", recommended: false, methodStack: "M-22 · M-23 · M-24", feasibility: "Inside hard envelope", change: "Reserves capacity against joint lead-time and supply deviations." },
    { id: `${id}-E`, name: "Low-carbon recovery", posture: "Carbon-first within service floor", cost: "$2.1M", service: services[1], protectedValue: protectedValues[1], cashImpact: "−$1.0M", residualRisk: 24, carbonDelta: "−1.8%", recommended: false, methodStack: "M-05 · M-10 · M-24", feasibility: "Conditional", change: "Shifts emergency air to rail/ocean and moves the recovery date." },
    { id: `${id}-F`, name: "Adaptive staged response", posture: "Commit now; preserve later options", cost: "$1.5M", service: services[1], protectedValue: protectedValues[1], cashImpact: "−$0.6M", residualRisk: 21, carbonDelta: "+0.2%", recommended: false, methodStack: "M-20 · M-26 · M-09 fallback", feasibility: "Inside hard envelope", change: "Stages commitments and replays after the next evidence threshold." },
  ];
}

const commonEvidence = (prefix: string): readonly CaseEvidence[] => [
  { id: `${prefix}-EV-01`, source: "ERP + order promise", fact: "Open demand, inventory, allocation, customer value, and committed service dates reconciled.", confidence: 99, observed: "18 sec ago", kind: "Observed" },
  { id: `${prefix}-EV-02`, source: "Supplier + contract evidence", fact: "Capacity, qualification, lead-time, commercial terms, and recovery commitments validated.", confidence: 94, observed: "7 min ago", kind: "Corroborated" },
  { id: `${prefix}-EV-03`, source: "Operational Knowledge Graph", fact: "Material-to-product-to-order exposure path resolved with retained source lineage.", confidence: 92, observed: "2 min ago", kind: "Inferred" },
  { id: `${prefix}-EV-04`, source: "External intelligence", fact: "Market, logistics, policy, weather, and company signals deduplicated across approved sources.", confidence: 89, observed: "12 min ago", kind: "Corroborated" },
  { id: `${prefix}-EV-05`, source: "Synthetic OR calculation manifest", fact: `Case ${prefix} retains the decision grain, objective hierarchy, 12-family check state, scenario probabilities, candidate-space index, and input fingerprint without claiming a solver run or mathematical optimality.`, confidence: 100, observed: "18 min ago", kind: "Observed" },
  { id: `${prefix}-EV-06`, source: "Outcome and override ledger", fact: "Expected service, value, cash, carbon, owner changes, overrides, and the measurement window are versioned for later realized-outcome comparison.", confidence: 97, observed: "24 min ago", kind: "Corroborated" },
];

const commonTasks = (prefix: string, primaryOwner: string): readonly ExecutionTask[] => [
  { id: `${prefix}-T1`, title: "Release approved commercial reservation", owner: primaryOwner, due: "Today · 14:00", status: "Ready" },
  { id: `${prefix}-T2`, title: "Update allocation and customer promise", owner: "Network planning", due: "Today · 16:00", status: "Ready" },
  { id: `${prefix}-T3`, title: "Publish execution package to operators", owner: "Control tower", due: "Tomorrow · 09:00", status: "Blocked" },
  { id: `${prefix}-T4`, title: "Measure service, margin, cash, and overrides", owner: "Finance control", due: "Month end", status: "In progress" },
  { id: `${prefix}-T5`, title: "Reconcile actual outcome against scenario forecast", owner: "Decision analytics", due: "Measurement window", status: "Ready" },
  { id: `${prefix}-T6`, title: "Review model drift and retire expired assumptions", owner: "Model risk", due: "Next governance cycle", status: "Ready" },
];

export const decisionCases: readonly DecisionCase[] = [
  {
    id: "CASE-1042", scope: "company", title: "Secure alternate graphite volume", summary: "Protect four priority mobility programs from tightening merchant graphite capacity without violating qualification, cash, or carbon limits.", severity: "Critical", status: "Awaiting approval", stage: "Approve", owner: "Maya Rao", ownerInitials: "MR", due: "2h remaining", updated: "8 min ago", value: "$4.2M margin exposed", serviceExposure: "428 priority orders", confidence: 92, primaryEntity: "Graphite G-142",
    affectedEntities: ["NeoGraph Materials", "Graphite G-142", "AX-4 drive unit", "Pune Plant 02", "428 customer orders"], variableIds: ["L0-044", "L0-046", "L0-047", "L0-155", "L0-269", "L0-287", "L0-428"], methodCodes: ["M-06", "M-16", "M-20", "M-22", "M-23", "M-24"], recommendation: "Reserve 18% alternate capacity, rebalance Monterrey inventory, and protect high-margin orders through the approved allocation rule.",
    contributions: buildContributions({ exposure: "$4.2M · 428 orders", dependency: "92% · 3 options", demand: "6,840 t P90", plan: "3 feasible plans", financial: "$3.6M protected" }), scenarios: buildScenarios("1042", ["$0.8M", "$3.6M", "$4.0M"], ["89.4%", "96.2%", "98.1%"]), evidence: commonEvidence("1042"), tasks: commonTasks("1042", "Category management"), outcome: { baseline: "$4.2M margin exposure", target: "$3.6M protected", realized: "Measurement pending", measurementWindow: "12 weeks" },
  },
  {
    id: "CASE-1041", scope: "company", title: "Reroute priority ocean orders", summary: "Select the least-disruptive route and inventory response for orders affected by rising Singapore terminal dwell.", severity: "High", status: "In analysis", stage: "Simulate", owner: "Jon Bell", ownerInitials: "JB", due: "7h remaining", updated: "32 min ago", value: "$1.85M revenue exposed", serviceExposure: "11 priority orders", confidence: 94, primaryEntity: "Singapore → Chennai corridor",
    affectedEntities: ["MV Meridian Star", "Singapore terminal", "Chennai port", "Pune Plant 02", "11 priority orders"], variableIds: ["L0-203", "L0-214", "L0-217", "L0-227", "L0-265", "L0-269"], methodCodes: ["M-05", "M-10", "M-11", "M-16", "M-17", "M-20"], recommendation: "Transfer protected stock from Monterrey and reroute only two residual lots through air, keeping premium freight below 2%.",
    contributions: buildContributions({ exposure: "$1.85M · 11 orders", dependency: "2 routes · 4 nodes", demand: "11 orders · 3 dates", plan: "4 route plans", financial: "$1.62M protected", riskTone: "watch" }), scenarios: buildScenarios("1041", ["$0.5M", "$1.62M", "$1.78M"], ["86.0%", "96.7%", "98.9%"]), evidence: commonEvidence("1041"), tasks: commonTasks("1041", "Logistics control"), outcome: { baseline: "3.4 days late", target: "All 11 orders protected", realized: "Simulation in progress", measurementWindow: "21 days" },
  },
  {
    id: "CASE-1038", scope: "company", title: "Qualify regional casting capacity", summary: "Validate engineering, quality, capacity, cost, and continuity fit for a new regional casting source.", severity: "Opportunity", status: "In analysis", stage: "Validate", owner: "Anika Shah", ownerInitials: "AS", due: "6d remaining", updated: "2 hr ago", value: "$620K annual savings", serviceExposure: "3 product families", confidence: 84, primaryEntity: "Apex Castings expansion line",
    affectedEntities: ["Apex Castings", "AX-4 housing", "Chennai supplier cluster", "3 product platforms"], variableIds: ["L0-043", "L0-052", "L0-053", "L0-057", "L0-061", "L0-136"], methodCodes: ["M-04", "M-06", "M-24", "M-25", "M-30"], recommendation: "Advance two part families to process audit while retaining the current source until capability evidence reaches the release threshold.",
    contributions: buildContributions({ exposure: "$1.1M dependency", dependency: "64% · 2 candidates", demand: "420K units/year", plan: "2 qualification waves", financial: "$620K savings", riskTone: "opportunity" }), scenarios: buildScenarios("1038", ["$0.1M", "$0.62M", "$0.71M"], ["94.1%", "96.4%", "97.0%"]), evidence: commonEvidence("1038"), tasks: commonTasks("1038", "Supplier quality"), outcome: { baseline: "Single regional source", target: "Two released sources", realized: "Audit evidence pending", measurementWindow: "2 quarters" },
  },
  {
    id: "CASE-1035", scope: "company", title: "Close EU carbon evidence gaps", summary: "Collect and validate missing supplier declarations before two EU-bound product families reach their next filing gate.", severity: "High", status: "Executing", stage: "Execute", owner: "Elena Ward", ownerInitials: "EW", due: "2d remaining", updated: "24 min ago", value: "$18.7M revenue dependent", serviceExposure: "12 suppliers · 48 fields", confidence: 97, primaryEntity: "EU-bound steel programs",
    affectedEntities: ["42CrMo4 steel", "12 suppliers", "18 parts", "2 EU programs"], variableIds: ["L0-135", "L0-142", "L0-374", "L0-398", "L0-402", "L0-419"], methodCodes: ["M-04", "M-21", "M-25", "M-28", "M-30"], recommendation: "Issue evidence requests by critical-path order, validate supplier claims, and quarantine incomplete lots before the filing cut-off.",
    contributions: buildContributions({ exposure: "$18.7M gated", dependency: "12 suppliers · 18 parts", demand: "2 filing cohorts", plan: "4 evidence waves", financial: "$18.7M enabled", riskTone: "watch" }), scenarios: buildScenarios("1035", ["$4.1M", "$18.1M", "$18.7M"], ["76.0%", "97.2%", "99.0%"]), evidence: commonEvidence("1035"), tasks: commonTasks("1035", "Trade compliance"), outcome: { baseline: "12 incomplete packs", target: "100% filing readiness", realized: "7 of 12 complete", measurementWindow: "30 days" },
  },
  {
    id: "CASE-1032", scope: "region", title: "Protect APAC controller service stock", summary: "Rebalance controller inventory before lead-time divergence reaches committed service demand across APAC.", severity: "Medium", status: "Monitoring", stage: "Measure", owner: "Noah Chen", ownerInitials: "NC", due: "22h remaining", updated: "3 hr ago", value: "$1.24M inventory rebalanced", serviceExposure: "842 service orders", confidence: 88, primaryEntity: "MCU family X7",
    affectedEntities: ["MCU family X7", "APAC service network", "5 warehouses", "842 service orders"], variableIds: ["L0-005", "L0-016", "L0-155", "L0-161", "L0-163", "L0-269"], methodCodes: ["M-02", "M-07", "M-13", "M-20", "M-22"], recommendation: "Maintain the approved regional transfer and measure fill rate, aged stock, expedites, and customer recovery over six weeks.",
    contributions: buildContributions({ exposure: "$2.1M service revenue", dependency: "5 nodes · 2 sources", demand: "842 orders P90", plan: "1 approved allocation", financial: "$1.24M rebalanced", riskTone: "info" }), scenarios: buildScenarios("1032", ["$0.4M", "$1.24M", "$1.48M"], ["91.0%", "97.1%", "98.4%"]), evidence: commonEvidence("1032"), tasks: commonTasks("1032", "Service planning"), outcome: { baseline: "91.0% fill rate", target: "97.0% fill rate", realized: "96.8% after 3 weeks", measurementWindow: "6 weeks" },
  },
  {
    id: "CASE-1029", scope: "region", title: "Shift APAC port capacity", summary: "Reallocate bookings across three APAC gateways as congestion and weather reduce effective weekly capacity.", severity: "High", status: "Approved", stage: "Execute", owner: "Priya Menon", ownerInitials: "PM", due: "Today · 17:00", updated: "41 min ago", value: "$8.6M shipment value protected", serviceExposure: "146 containers", confidence: 90, primaryEntity: "APAC gateway portfolio",
    affectedEntities: ["Singapore", "Port Klang", "Chennai", "146 containers", "38 customer orders"], variableIds: ["L0-217", "L0-218", "L0-221", "L0-227", "L0-243", "L0-253"], methodCodes: ["M-05", "M-10", "M-11", "M-17", "M-20", "M-22"], recommendation: "Shift 23% of new bookings, protect regulated cargo in Singapore, and freeze executed vessel legs.",
    contributions: buildContributions({ exposure: "$8.6M · 38 orders", dependency: "3 gateways · 6 sailings", demand: "146 containers", plan: "5 booking portfolios", financial: "$7.9M protected", riskTone: "watch" }), scenarios: buildScenarios("1029", ["$2.8M", "$7.9M", "$8.4M"], ["88.2%", "95.8%", "97.6%"]), evidence: commonEvidence("1029"), tasks: commonTasks("1029", "Regional logistics"), outcome: { baseline: "17 containers late", target: "≤3 late containers", realized: "Execution active", measurementWindow: "4 weeks" },
  },
  {
    id: "CASE-1026", scope: "region", title: "Release APAC inventory cash", summary: "Reduce slow-moving inventory without weakening protected service levels or increasing obsolescence risk.", severity: "Opportunity", status: "Monitoring", stage: "Measure", owner: "Diego Santos", ownerInitials: "DS", due: "Quarter end", updated: "5 hr ago", value: "$18.6M cash opportunity", serviceExposure: "5 inventory pools", confidence: 86, primaryEntity: "APAC working-capital portfolio",
    affectedEntities: ["5 inventory pools", "1,842 SKUs", "APAC warehouses", "Customer service policy"], variableIds: ["L0-155", "L0-163", "L0-166", "L0-167", "L0-288", "L0-291"], methodCodes: ["M-01", "M-07", "M-13", "M-20", "M-24"], recommendation: "Transfer excess controller and casting stock, reduce three replenishment parameters, and protect A-class service constraints.",
    contributions: buildContributions({ exposure: "$18.6M trapped cash", dependency: "1,842 SKUs · 5 pools", demand: "13-week distribution", plan: "6 inventory policies", financial: "$14.2M realizable", riskTone: "opportunity" }), scenarios: buildScenarios("1026", ["$3.2M", "$14.2M", "$16.4M"], ["96.0%", "95.8%", "94.1%"]), evidence: commonEvidence("1026"), tasks: commonTasks("1026", "Inventory excellence"), outcome: { baseline: "42 days on hand", target: "35 days on hand", realized: "37.4 days after 8 weeks", measurementWindow: "1 quarter" },
  },
  {
    id: "CASE-1024", scope: "global", title: "Protect Red Sea customer commitments", summary: "Evaluate corridor, inventory, production, and customer-allocation responses to a compound maritime disruption.", severity: "Critical", status: "In analysis", stage: "Detect", owner: "Olivia Hart", ownerInitials: "OH", due: "4h remaining", updated: "6 min ago", value: "$34M customer value exposed", serviceExposure: "312 orders · 19 lanes", confidence: 91, primaryEntity: "Red Sea corridor",
    affectedEntities: ["Red Sea corridor", "19 lanes", "8 plants", "312 customer orders", "4 product families"], variableIds: ["L0-214", "L0-217", "L0-227", "L0-252", "L0-265", "L0-359"], methodCodes: ["M-05", "M-10", "M-16", "M-20", "M-22", "M-23"], recommendation: "Open a global case, validate affected customer paths, and compare Cape rerouting, air bridge, and regional inventory options.",
    contributions: buildContributions({ exposure: "$34M · 312 orders", dependency: "19 lanes · 8 plants", demand: "4 product families P95", plan: "Response study queued", financial: "$28M protectable" }), scenarios: buildScenarios("1024", ["$8M", "$28M", "$32M"], ["82.0%", "94.6%", "97.8%"]), evidence: commonEvidence("1024"), tasks: commonTasks("1024", "Global control tower"), outcome: { baseline: "$34M value exposed", target: "≥$28M protected", realized: "Decision pending", measurementWindow: "10 weeks" },
  },
  {
    id: "CASE-1019", scope: "global", title: "Absorb copper and energy price volatility", summary: "Coordinate sourcing, production, pricing, and cash responses under correlated copper, electricity, and freight scenarios.", severity: "Medium", status: "In analysis", stage: "Validate", owner: "Marcus Lee", ownerInitials: "ML", due: "3d remaining", updated: "1 hr ago", value: "$12.4M margin range", serviceExposure: "7 product portfolios", confidence: 82, primaryEntity: "Copper and energy cost basket",
    affectedEntities: ["Copper cathode", "Electricity contracts", "7 product portfolios", "Global sourcing"], variableIds: ["L0-061", "L0-121", "L0-287", "L0-293", "L0-300", "L0-463"], methodCodes: ["M-02", "M-04", "M-20", "M-22", "M-23", "M-24"], recommendation: "Validate the joint price scenario, then optimize contract coverage, production allocation, and approved price pass-through.",
    contributions: buildContributions({ exposure: "$12.4M margin range", dependency: "14 contracts · 7 portfolios", demand: "3 macro regimes", plan: "Scenario set incomplete", financial: "$8.7M protectable", riskTone: "info" }), scenarios: buildScenarios("1019", ["$2.1M", "$8.7M", "$10.2M"], ["93.0%", "95.4%", "96.2%"]), evidence: commonEvidence("1019"), tasks: commonTasks("1019", "Global sourcing"), outcome: { baseline: "$12.4M downside", target: "≤$3.7M residual", realized: "Validation active", measurementWindow: "2 quarters" },
  },
];

export const decisionStageOrder: readonly DecisionStage[] = ["Detect", "Validate", "Simulate", "Approve", "Execute", "Measure"];

export function getCasesForScope(scope: ScopeId): readonly DecisionCase[] {
  return decisionCases.filter((item) => item.scope === scope);
}

export type OptimizationInput = {
  supplyLossPercent: number;
  disruptionWeeks: number;
  serviceTarget: number;
  budgetMillions: number;
  carbonLimitPercent: number;
  strategy: "Balanced" | "Service first" | "Cash first" | "Lowest carbon";
};

export type OptimizationContext = {
  scope: ScopeId;
  caseId: string;
  decisionTitle: string;
  primaryEntity: string;
  entityContext: string;
  patternId: string;
  horizon: string;
  methodStack: readonly string[];
  scenarioSetId: string;
};

export type ConstraintCheck = {
  id: `C-${string}`;
  name: string;
  hard: boolean;
  state: "Satisfied" | "Binding" | "Violated" | "Advisory";
  residual: string;
  evidence: string;
};

export type OptimizationResult = {
  runId: string;
  status: "Reviewable synthetic estimate" | "Blocked synthetic estimate";
  releasable: boolean;
  hardViolations: readonly string[];
  inputFingerprint: string;
  candidateSpaceIndex: number;
  context: OptimizationContext;
  constraintChecks: readonly ConstraintCheck[];
  protectedMargin: number;
  totalCost: number;
  projectedService: number;
  residualRisk: number;
  carbonDelta: number;
  objectiveBreakdown: readonly { label: string; value: number; unit: "$M" | "points" }[];
  allocations: readonly { action: string; volume: string; timing: string; owner: string; cost: string }[];
  warnings: readonly string[];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const fingerprint = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
};

const defaultOptimizationContext: OptimizationContext = {
  scope: "company",
  caseId: "CASE-1042",
  decisionTitle: "Network continuity response",
  primaryEntity: "Selected project network",
  entityContext: "network:unscoped",
  patternId: "sourcing",
  horizon: "Tactical · 3–24 months",
  methodStack: ["M-06", "M-20", "M-22", "M-23", "M-24", "M-09"],
  scenarioSetId: "JOINT-S12-V1",
};

const checkState = (headroom: number, bindingThreshold = 2): ConstraintCheck["state"] => headroom < 0 ? "Violated" : headroom <= bindingThreshold ? "Binding" : "Satisfied";

export function solveNetworkPlan(input: OptimizationInput, context: OptimizationContext = defaultOptimizationContext): OptimizationResult {
  const normalized = {
    supplyLossPercent: clamp(input.supplyLossPercent, 0, 100),
    disruptionWeeks: clamp(input.disruptionWeeks, 1, 52),
    serviceTarget: clamp(input.serviceTarget, 70, 100),
    budgetMillions: clamp(input.budgetMillions, 0, 25),
    carbonLimitPercent: clamp(input.carbonLimitPercent, -20, 20),
    strategy: input.strategy,
  };
  const normalizedContext: OptimizationContext = {
    scope: ["global", "region", "company"].includes(context.scope) ? context.scope : "company",
    caseId: context.caseId || defaultOptimizationContext.caseId,
    decisionTitle: context.decisionTitle || defaultOptimizationContext.decisionTitle,
    primaryEntity: context.primaryEntity || defaultOptimizationContext.primaryEntity,
    entityContext: context.entityContext || defaultOptimizationContext.entityContext,
    patternId: context.patternId || defaultOptimizationContext.patternId,
    horizon: context.horizon || defaultOptimizationContext.horizon,
    methodStack: context.methodStack.length ? [...context.methodStack] : [...defaultOptimizationContext.methodStack],
    scenarioSetId: context.scenarioSetId || defaultOptimizationContext.scenarioSetId,
  };
  const strategyFactor = { Balanced: 0.84, "Service first": 0.94, "Cash first": 0.72, "Lowest carbon": 0.78 }[normalized.strategy];
  const spendFactor = clamp(normalized.budgetMillions / 4, 0, 1);
  const scopeComplexity = { global: 1.08, region: 1.03, company: 1 }[normalizedContext.scope];
  const horizonComplexity = normalizedContext.horizon.startsWith("Strategic") ? 1.09 : normalizedContext.horizon.startsWith("Tactical") ? 1.04 : normalizedContext.horizon.startsWith("Operational") ? 1 : .96;
  const patternAdjustment = .98 + (Number.parseInt(fingerprint(normalizedContext.patternId).slice(-2), 16) % 7) / 100;
  const caseAdjustment = .99 + (Number.parseInt(fingerprint(normalizedContext.caseId).slice(-2), 16) % 5) / 100;
  const entityAdjustment = .99 + (Number.parseInt(fingerprint(normalizedContext.entityContext).slice(-2), 16) % 5) / 100;
  const scenarioAdjustment = .99 + (Number.parseInt(fingerprint(normalizedContext.scenarioSetId).slice(-2), 16) % 4) / 100;
  const methodIdentityAdjustment = .99 + (Number.parseInt(fingerprint(normalizedContext.methodStack.join("|")).slice(-2), 16) % 4) / 100;
  const methodBreadth = clamp(normalizedContext.methodStack.length, 1, 10);
  const stress = normalized.supplyLossPercent * (normalized.disruptionWeeks / 12) * scopeComplexity * caseAdjustment * entityAdjustment * scenarioAdjustment;
  const mitigation = clamp(strategyFactor * (0.62 + spendFactor * 0.38) * (1 + (methodBreadth - 4) * .006) * methodIdentityAdjustment, 0.2, 0.97);
  const totalCost = Math.min(normalized.budgetMillions, (0.6 + stress * 0.065 * (normalized.strategy === "Cash first" ? 0.72 : 1)) * horizonComplexity * patternAdjustment * caseAdjustment);
  const projectedService = clamp(92 + mitigation * 8 - stress * 0.04 * horizonComplexity, 68, 99.5);
  const residualRisk = clamp(100 - mitigation * 100, 3, 78);
  const carbonDelta = normalized.strategy === "Lowest carbon" ? -2.8 : round(normalized.supplyLossPercent * 0.055 + (normalized.strategy === "Service first" ? 1.2 : 0));
  const protectedMargin = (1.8 + stress * 0.21) * mitigation;
  const alternateShare = round(clamp(normalized.supplyLossPercent * mitigation * 0.58, 4, 34));
  const transferTons = Math.round(clamp(stress * 0.9, 8, 74));
  const materialHeadroom = 100 - normalized.supplyLossPercent * (1 - mitigation) - 70;
  const supplierHeadroom = 34 - alternateShare;
  const laneHeadroom = 70 - transferTons;
  const handlingHeadroom = 64 - transferTons;
  const serviceHeadroom = projectedService - normalized.serviceTarget;
  const ageHeadroom = 21 - normalized.disruptionWeeks;
  const carbonHeadroom = normalized.carbonLimitPercent - carbonDelta;
  const budgetHeadroom = normalized.budgetMillions >= .75 ? normalized.budgetMillions - totalCost : normalized.budgetMillions - .75;
  const constraintChecks: readonly ConstraintCheck[] = [
    { id: "C-01", name: "Inventory flow balance", hard: true, state: "Satisfied", residual: "0.0 modeled-unit residual", evidence: "The constructed response preserves opening + receipts − demand − shipments = closing state." },
    { id: "C-02", name: "Production & material balance", hard: true, state: checkState(materialHeadroom), residual: `${round(materialHeadroom)} points effective-supply headroom`, evidence: "Synthetic yield-adjusted supply is tested against the governed 70-point conversion floor." },
    { id: "C-03", name: "Supplier & allocation capacity", hard: true, state: checkState(supplierHeadroom), residual: `${round(supplierHeadroom)} points qualified-allocation headroom`, evidence: "Alternate awards are restricted to the qualified 34% candidate capacity band." },
    { id: "C-04", name: "Lane & asset capacity", hard: true, state: checkState(laneHeadroom, 4), residual: `${round(laneHeadroom)} t bridge-capacity headroom`, evidence: "Transfer demand is checked against the 70 t protected multimodal bridge." },
    { id: "C-05", name: "Storage & handling", hard: true, state: checkState(handlingHeadroom, 4), residual: `${round(handlingHeadroom)} t handling headroom`, evidence: "Illustrative receiving, staging, and labor capacity is capped at 64 t in the decision window." },
    { id: "C-06", name: "Customer service", hard: true, state: checkState(serviceHeadroom, .5), residual: `${round(serviceHeadroom)} OTIF points above floor`, evidence: `Projected ${round(projectedService)}% is tested against the ${normalized.serviceTarget}% governed floor.` },
    { id: "C-07", name: "MOQ, batch & setup", hard: false, state: alternateShare % 2 === 0 ? "Satisfied" : "Advisory", residual: `${alternateShare}% award before lot-size repair`, evidence: "A deterministic repair rounds released awards to approved supplier batch multiples." },
    { id: "C-08", name: "Shelf life & age", hard: true, state: checkState(ageHeadroom, 2), residual: `${round(ageHeadroom)} weeks before governed age limit`, evidence: "The concept checks disruption duration against a 21-week representative usable-life boundary." },
    { id: "C-09", name: "Authorization & market access", hard: true, state: "Satisfied", residual: "0 unauthorized combinations represented", evidence: "The response fixture is allow-list constrained to synthetic qualified part–supplier–site–market paths." },
    { id: "C-10", name: "Carbon & resource", hard: true, state: checkState(carbonHeadroom, .5), residual: `${round(carbonHeadroom)} carbon points below envelope`, evidence: `Projected ${round(carbonDelta)}% is tested against the ${normalized.carbonLimitPercent}% change envelope.` },
    { id: "C-11", name: "Cash & budget", hard: true, state: checkState(budgetHeadroom, .15), residual: `$${round(budgetHeadroom, 2)}M authority headroom`, evidence: "Response cost plus the minimum executable qualification package is checked against delegated authority." },
    { id: "C-12", name: "Non-anticipativity", hard: true, state: "Satisfied", residual: "0 scenario-specific first-stage fields", evidence: `One fixed response is evaluated across ${normalizedContext.scenarioSetId}; future scenario labels do not alter first-stage fields.` },
  ];
  const warnings: string[] = [];
  if (totalCost >= normalized.budgetMillions && normalized.budgetMillions < 3) warnings.push("Budget is binding; the deterministic response estimate may leave service below the requested target.");
  if (projectedService < normalized.serviceTarget) warnings.push(`Projected service is ${round(normalized.serviceTarget - projectedService)} points below target.`);
  if (carbonDelta > normalized.carbonLimitPercent) warnings.push("The fastest feasible route exceeds the selected carbon envelope.");
  const hardViolations = constraintChecks.filter((check) => check.hard && check.state === "Violated").map((check) => `${check.id} ${check.name}: ${check.residual}.`);
  const inputFingerprint = fingerprint(JSON.stringify({ input: normalized, context: normalizedContext }));
  const releasable = hardViolations.length === 0;

  return {
    runId: `ESTIMATE-${inputFingerprint}`,
    status: releasable ? "Reviewable synthetic estimate" : "Blocked synthetic estimate",
    releasable,
    hardViolations,
    inputFingerprint,
    candidateSpaceIndex: Math.round((384 + normalized.supplyLossPercent * 11 + normalized.disruptionWeeks * 17 + normalized.budgetMillions * 23) * scopeComplexity * horizonComplexity * (1 + methodBreadth * .018)),
    context: normalizedContext,
    constraintChecks,
    protectedMargin: round(protectedMargin, 2),
    totalCost: round(totalCost, 2),
    projectedService: round(projectedService),
    residualRisk: round(residualRisk),
    carbonDelta: round(carbonDelta),
    objectiveBreakdown: [
      { label: "Transport + expedite", value: round(totalCost * .38, 2), unit: "$M" },
      { label: "Qualification + capacity", value: round(totalCost * .42, 2), unit: "$M" },
      { label: "Inventory + handling", value: round(totalCost * .2, 2), unit: "$M" },
      { label: "Residual service penalty", value: round(Math.max(0, normalized.serviceTarget - projectedService) * 1.7, 1), unit: "points" },
    ],
    allocations: [
      { action: `Reserve qualified response capacity for ${normalizedContext.primaryEntity}`, volume: `${alternateShare}% of modeled demand`, timing: "Week 1", owner: "Project decision owner", cost: `$${round(totalCost * .48, 2)}M` },
      { action: `Rebalance project inventory for ${normalizedContext.decisionTitle}`, volume: `${transferTons} modeled transfer units`, timing: "48 hours", owner: "Project network lead", cost: `$${round(totalCost * .22, 2)}M` },
      { action: `Protect priority commitments for ${normalizedContext.primaryEntity}`, volume: `${round(normalized.serviceTarget)}% governed service floor`, timing: "Weeks 1–4", owner: "Project service owner", cost: `$${round(totalCost * .12, 2)}M` },
      { action: `Qualify alternate project-bound capacity for ${normalizedContext.decisionTitle}`, volume: "2 modeled option families", timing: "6 weeks", owner: "Project assurance lead", cost: `$${round(totalCost * .18, 2)}M` },
    ],
    warnings,
  };
}
