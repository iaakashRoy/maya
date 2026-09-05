export type WorkspaceTabId = "overview" | "decisions" | "apps" | "data" | "graph" | "agents" | "team" | "governance";
export type ProjectHealth = "healthy" | "watch" | "critical";
export type EvidenceState = "Observed" | "Corroborated" | "Inferred" | "Simulated" | "Proposed";
export type ProjectAppId = "risk" | "optimizer" | "flow" | "demand" | "suppliers" | "minerals" | "workforce" | "manufacturing" | "logistics" | "quality";
export type WorkspaceOrigin = "Seed fixture" | "Browser-session draft";
export type CollaboratorAffiliation = "Client" | "tanjx";
export type ProjectCapability = "project.view" | "data.view" | "data.stage" | "connectors.request" | "apps.view" | "apps.mount" | "decisions.view" | "decisions.draft" | "decisions.approve" | "agents.run" | "agents.create" | "team.manage";

export type WorkspaceClient = {
  id: string;
  sectorId: string;
  sector: string;
  name: string;
  classification: string;
  dataResidency: string;
  clientLead: string;
  providerLead: string;
  origin: WorkspaceOrigin;
};

export type WorkspaceCollaborator = {
  id: string;
  /** Canonical client binding for client identities; omitted for tanjx identities. */
  clientId?: string;
  name: string;
  initials: string;
  role: string;
  affiliation: CollaboratorAffiliation;
  organization: string;
  profileOrigin: WorkspaceOrigin;
};

export type ProjectMembership = {
  id: string;
  projectId: string;
  collaboratorId: string;
  projectRole: "Client owner" | "tanjx engagement lead" | "tanjx OR scientist" | "tanjx data steward" | "Contributor" | "Viewer";
  capabilities: readonly ProjectCapability[];
  origin: WorkspaceOrigin;
};

export type ProjectAccessDecision = {
  allowed: boolean;
  projectId: string;
  collaboratorId: string;
  capability: ProjectCapability;
  policyRef: string;
  reason: string;
};

export type ConnectorTemplate = {
  id: string;
  name: string;
  sourceClass: "Industrial IoT" | "Mobile handoff" | "Enterprise system" | "Licensed telemetry";
  protocol: string;
  targetData: readonly string[];
  targetBoundary: string;
  targetDirection: "Target read-only observation" | "Target inbound event ingestion";
  catalogState: "Catalog only";
  limitations: string;
};

export type ProjectConnectorDraft = {
  id: string;
  projectId: string;
  templateId: string;
  name: string;
  protocol: string;
  state: "Draft request";
  policyReviewState: "Not requested" | "Policy review queued";
  endpointState: "Not supplied";
  credentialState: "Not provided";
  networkState: "Not tested";
  sampleState: "Not run" | "Fixed payload replayed";
  requestedBy: string;
  evidenceRef: string;
  origin: "Browser-session draft";
};

export type SessionClientDraft = {
  name: string;
  sector: string;
  sectorId?: string;
  classification: string;
  dataResidency: string;
  clientLead: string;
  providerLead: string;
};

export type SessionProjectDraft = {
  clientId: string;
  /** Project-owned tower binding. Falls back to the client's primary setup tower for older drafts. */
  sectorId?: string;
  sector?: string;
  name: string;
  problem: string;
  outcome: string;
  owner: string;
  currency: string;
  regions: string;
  classification?: string;
  dataResidency?: string;
  operationsWorldIntake?: OperationsWorldIntakeDraft;
};

export type OperationsWorldIntakeIntent = "dependency" | "route" | "value";

export type OperationsWorldIntakeDraft = {
  intent: OperationsWorldIntakeIntent;
  selectedKind: string;
  selectedId: string;
  selectedLabel: string;
  frame: string;
  scenario: string;
  evidenceRef?: string;
};

export type OperationsWorldIntake = Omit<OperationsWorldIntakeDraft, "evidenceRef"> & {
  evidenceRef: string;
};

export type WorkspaceMetric = {
  label: string;
  value: string;
  detail: string;
  evidenceRef: string;
  tone: ProjectHealth | "opportunity";
};

export type WorkspaceProject = {
  id: string;
  origin: WorkspaceOrigin;
  sectorId: string;
  sector: string;
  clientId: string;
  client: string;
  name: string;
  code: string;
  problem: string;
  outcome: string;
  stage: string;
  health: ProjectHealth;
  currency: string;
  regions: string;
  owner: string;
  classification: string;
  dataResidency: string;
  counts: { entities: string; relationships: string; observations: string; documents: string; events: string; claims: string; decisions: number; runs: number; apps: number; agents: number; experts: number };
  metrics: readonly WorkspaceMetric[];
  mountedAppIds: readonly ProjectAppId[];
  variablePack: { l2: readonly string[]; l1: readonly string[]; l0: readonly string[] };
  methodCodes: readonly string[];
  operationsWorldIntake?: OperationsWorldIntake;
};

/** App execution is available only after the project owns a canonical L0 variable contract. */
export const projectHasDataContract = (project: WorkspaceProject) => project.variablePack.l0.length > 0;

export type EvidenceReceipt = {
  id: string;
  projectId: string;
  claim: string;
  displayedValue: string;
  state: EvidenceState;
  sourceKind: "Upload" | "SQL" | "API" | "Web" | "Calculation" | "Synthetic fixture";
  source: string;
  locator: string;
  asOf: string;
  validFor: string;
  version: string;
  contentHash: string;
  formula: string;
  inputs: readonly string[];
  variableId: string;
  grain: string;
  confidence: number;
  quality: readonly string[];
  traceId: string;
  agent: string;
  reviewer: string;
  access: string;
};

export type FixtureEvidenceInput = {
  id: string;
  claim: string;
  displayedValue: string;
  source: string;
  formula: string;
  variableId?: string;
  grain?: string;
  inputs?: readonly string[];
  confidence?: number;
};

export type ProjectAppDefinition = {
  id: ProjectAppId;
  name: string;
  icon: string;
  accent: string;
  archetype: string;
  outcome: string;
  artifact: string;
  methodCodes: readonly string[];
  variableIds: readonly string[];
  status: "Concept ready" | "Review" | "Future adapter";
};

export type ExpertAgent = {
  id: string;
  name: string;
  role: string;
  level: "Apprentice" | "Practitioner" | "Specialist" | "Principal";
  years: number;
  evaluatedRuns: number;
  approvedRuns: number;
  calibration: number;
  overrideRate: number;
  failureRate: number;
  skills: readonly string[];
  mcps: readonly string[];
  tools: readonly string[];
  authority: string;
  state: "Active" | "Shadow" | "Paused" | "Draft";
};

export type HumanExpert = {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialties: readonly string[];
  years: number;
  decisionRight: string;
  availability: string;
  activeWork: number;
};

export const workspaceTabs: readonly { id: WorkspaceTabId; label: string; count?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "decisions", label: "Decisions" },
  { id: "data", label: "Data & graph" },
  { id: "governance", label: "Controls" },
];

/** Routeable project surfaces. Apps and Playground remain routeable from the mounted-work strip. */
export const workspaceSurfaceIds: readonly WorkspaceTabId[] = ["overview", "decisions", "apps", "data", "graph", "agents", "governance"];

const metricSet = (code: string, values: readonly [string, string, string, WorkspaceMetric["tone"]][]): readonly WorkspaceMetric[] =>
  values.map(([label, value, detail, tone], index) => ({ label, value, detail, tone, evidenceRef: `EV-${code.slice(2)}-${String(index + 1).padStart(2, "0")}` }));

export const workspaceProjects: readonly WorkspaceProject[] = [
  {
    id: "anode-shield", origin: "Seed fixture", sectorId: "mobility-ev", sector: "Mobility & EV", clientId: "apex-mobility", client: "Apex Mobility", name: "Anode Shield", code: "P-001", health: "watch", stage: "Validate response", currency: "USD", regions: "North America · APAC · Europe", owner: "Asha Rao", classification: "Client confidential", dataResidency: "India + EU policy partitions",
    problem: "Protect the 800V drive-unit launch from graphite concentration, port delay, and qualification constraints.", outcome: "Preserve launch service while establishing a qualified, lower-risk anode supply portfolio.",
    counts: { entities: "9,480", relationships: "31,260", observations: "428K", documents: "1,240", events: "72.6K", claims: "12.8K", decisions: 18, runs: 96, apps: 9, agents: 12, experts: 14 },
    metrics: metricSet("P-001", [["Value at risk", "$42.0M", "P90 contribution exposure", "critical"], ["Launch service", "95.1%", "Against a governed 98.0% floor", "watch"], ["Graphite dependency", "92%", "One qualified refining path", "critical"], ["Decision clock", "3h 42m", "Before capacity option expires", "watch"]]),
    mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "manufacturing", "logistics", "quality"],
    variablePack: { l2: ["L2-002", "L2-003", "L2-008", "L2-009", "L2-013", "L2-027", "L2-034"], l1: ["L1-006", "L1-007", "L1-008", "L1-010", "L1-019", "L1-032", "L1-041", "L1-054", "L1-056"], l0: ["L0-029", "L0-030", "L0-035", "L0-044", "L0-047", "L0-057", "L0-061", "L0-064", "L0-071", "L0-155", "L0-217", "L0-299", "L0-445"] }, methodCodes: ["M-02", "M-05", "M-06", "M-13", "M-20", "M-22", "M-23", "M-24"],
  },
  {
    id: "cathode-origin-assurance", origin: "Seed fixture", sectorId: "critical-minerals", sector: "Mining & Critical Minerals", clientId: "apex-mobility", client: "Apex Mobility", name: "Cathode Origin Assurance", code: "P-011", health: "watch", stage: "Compare origin paths", currency: "USD", regions: "North America · Australia · Indonesia · EU", owner: "Asha Rao", classification: "Client confidential", dataResidency: "US + EU policy partitions",
    problem: "Qualify a traceable nickel and lithium portfolio across origin, processing, price, rights, carbon, and launch constraints.", outcome: "Select an auditable cathode-material pathway that protects launch volume without crossing origin or sustainability gates.",
    counts: { entities: "11,860", relationships: "38,420", observations: "812K", documents: "2,340", events: "118K", claims: "19.6K", decisions: 16, runs: 88, apps: 9, agents: 11, experts: 15 },
    metrics: metricSet("P-011", [["Qualified volume", "18.4K t", "2027 cathode-active-material coverage", "watch"], ["Origin evidence", "91.8%", "Mine-to-active-material claim coverage", "watch"], ["Refining concentration", "68%", "Highest-country share", "critical"], ["Portfolio premium", "$14.6M", "Versus current sourcing baseline", "opportunity"]]),
    mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "manufacturing", "logistics", "quality"],
    variablePack: { l2: ["L2-002", "L2-008", "L2-013", "L2-019", "L2-031", "L2-034"], l1: ["L1-006", "L1-008", "L1-009", "L1-041", "L1-051", "L1-053", "L1-054"], l0: ["L0-030", "L0-035", "L0-044", "L0-051", "L0-061", "L0-064", "L0-371", "L0-394", "L0-399", "L0-410"] }, methodCodes: ["M-04", "M-05", "M-06", "M-16", "M-18", "M-20", "M-22", "M-23", "M-24", "M-25", "M-29"],
  },
  {
    id: "cold-chain-promise", origin: "Seed fixture", sectorId: "life-sciences", sector: "Life Sciences", clientId: "helixora", client: "Helixora Therapeutics", name: "Cold Chain Promise", code: "P-002", health: "critical", stage: "Simulate release", currency: "USD", regions: "US · EU · India", owner: "Dr. Nia Campbell", classification: "Restricted clinical supply", dataResidency: "US + EU",
    problem: "Protect an oncology launch across batch release, refrigerated storage, scarce packaging, and patient-service constraints.", outcome: "Release every compliant dose inside the stability window without compromising patient safety.", counts: { entities: "7,320", relationships: "22,840", observations: "615K", documents: "2,180", events: "184K", claims: "16.3K", decisions: 15, runs: 82, apps: 8, agents: 11, experts: 13 },
    metrics: metricSet("P-002", [["Doses at risk", "18,420", "P90 launch shortfall", "critical"], ["Cold-chain conformance", "99.76%", "Validated excursion window", "healthy"], ["Release queue", "14 lots", "Four require QP review", "watch"], ["Patient priority", "100%", "Hard allocation constraint", "healthy"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "manufacturing", "logistics", "quality"],
    variablePack: { l2: ["L2-003", "L2-006", "L2-007", "L2-022"], l1: ["L1-018", "L1-030", "L1-037"], l0: ["L0-026", "L0-131", "L0-145", "L0-178", "L0-275"] }, methodCodes: ["M-02", "M-13", "M-17", "M-20", "M-21", "M-23", "M-26", "M-30"],
  },
  {
    id: "fab-recovery-x9", origin: "Seed fixture", sectorId: "semiconductors", sector: "Semiconductors", clientId: "orion-silicon", client: "OrionSilicon Foundry", name: "Fab Recovery X9", code: "P-003", health: "critical", stage: "Execute recovery", currency: "USD", regions: "Taiwan · Japan · US", owner: "Kenji Ito", classification: "Export-controlled", dataResidency: "Taiwan + US",
    problem: "Recover from tool failure while allocating constrained chemicals, utilities, WIP, and customer commitments.", outcome: "Restore qualified output and protect the highest-consequence customer allocation.", counts: { entities: "12,600", relationships: "48,900", observations: "3.24M", documents: "980", events: "520K", claims: "24.6K", decisions: 20, runs: 140, apps: 9, agents: 13, experts: 15 },
    metrics: metricSet("P-003", [["WIP exposed", "$186M", "Across 42 critical lots", "critical"], ["Constraint tool uptime", "61%", "ETCH-X9 recovery curve", "critical"], ["Qualified output", "78%", "Versus weekly commit", "watch"], ["Recovery horizon", "11 days", "P80 simulated duration", "watch"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "workforce", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-003", "L2-005", "L2-027"], l1: ["L1-010", "L1-011", "L1-012", "L1-050"], l0: ["L0-071", "L0-079", "L0-088", "L0-090", "L0-121", "L0-363", "L0-365"] }, methodCodes: ["M-02", "M-06", "M-08", "M-14", "M-15", "M-17", "M-20", "M-26", "M-27"],
  },
  {
    id: "harvest-to-shelf", origin: "Seed fixture", sectorId: "food-agriculture", sector: "Food & Agriculture", clientId: "verdant-foods", client: "Verdant Foods Cooperative", name: "Harvest-to-Shelf", code: "P-004", health: "watch", stage: "Plan peak", currency: "EUR", regions: "Europe · North Africa", owner: "Sofia Mendes", classification: "Client confidential", dataResidency: "EU",
    problem: "Balance seasonal harvest, perishability, labor, cold-chain capacity, and food waste.", outcome: "Maximize fresh availability while reducing spoilage and grower rejection.", counts: { entities: "8,900", relationships: "27,400", observations: "1.18M", documents: "620", events: "265K", claims: "14.7K", decisions: 17, runs: 104, apps: 8, agents: 10, experts: 12 },
    metrics: metricSet("P-004", [["Harvest committed", "46.8K t", "Six-week inbound plan", "healthy"], ["Spoilage risk", "4.8%", "P90 modeled loss", "watch"], ["Cold slots", "87%", "Peak utilization", "watch"], ["Waste avoided", "€3.6M", "Candidate plan value", "opportunity"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "workforce", "manufacturing", "logistics"], variablePack: { l2: ["L2-001", "L2-003", "L2-007", "L2-019", "L2-021"], l1: ["L1-001", "L1-014", "L1-030", "L1-052"], l0: ["L0-003", "L0-033", "L0-101", "L0-165", "L0-234"] }, methodCodes: ["M-02", "M-03", "M-07", "M-10", "M-13", "M-16", "M-17", "M-20", "M-21", "M-26"],
  },
  {
    id: "forging-continuity", origin: "Seed fixture", sectorId: "aerospace", sector: "Aerospace", clientId: "stratos-aero", client: "Stratos Aero Systems", name: "Forging Continuity", code: "P-005", health: "critical", stage: "Qualify source", currency: "USD", regions: "US · UK · France", owner: "Elliot Price", classification: "Controlled technical data", dataResidency: "US + UK",
    problem: "Protect long-lead certified titanium forgings across opaque sub-tier dependencies.", outcome: "Create a certifiable second-source path before the current buffer is consumed.", counts: { entities: "11,240", relationships: "39,700", observations: "782K", documents: "4,300", events: "94K", claims: "21.8K", decisions: 14, runs: 76, apps: 9, agents: 12, experts: 16 },
    metrics: metricSet("P-005", [["Program exposure", "$312M", "Three certified programs", "critical"], ["Source coverage", "1.2×", "Against 2.0× policy", "critical"], ["Qualification", "17 weeks", "Critical path duration", "watch"], ["Evidence completeness", "93%", "176 certificates mapped", "healthy"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-002", "L2-007", "L2-013", "L2-027"], l1: ["L1-004", "L1-006", "L1-007", "L1-050", "L1-054"], l0: ["L0-025", "L0-031", "L0-055", "L0-057", "L0-154"] }, methodCodes: ["M-04", "M-06", "M-15", "M-20", "M-22", "M-23", "M-25", "M-29", "M-30"],
  },
  {
    id: "copper-rare-earth", origin: "Seed fixture", sectorId: "energy-grid", sector: "Energy & Grid", clientId: "solara-grid", client: "Solara Gridworks", name: "Copper & Rare-Earth Portfolio", code: "P-006", health: "watch", stage: "Compare portfolios", currency: "USD", regions: "Global · EU · India", owner: "Anika Shah", classification: "Client confidential", dataResidency: "EU + India",
    problem: "Secure transformer and wind-turbine materials under price, capacity, carbon, and cash limits.", outcome: "Fund a resilient mineral portfolio that meets grid expansion and carbon commitments.", counts: { entities: "10,820", relationships: "36,600", observations: "944K", documents: "1,760", events: "126K", claims: "19.4K", decisions: 19, runs: 128, apps: 9, agents: 12, experts: 14 },
    metrics: metricSet("P-006", [["Materials spend", "$1.18B", "Copper + rare earths", "watch"], ["Capacity covered", "84%", "2027 program demand", "watch"], ["Carbon envelope", "−18%", "Versus baseline plan", "healthy"], ["Portfolio NPV", "$74M", "Risk-adjusted candidate", "opportunity"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-002", "L2-008", "L2-012", "L2-014", "L2-019", "L2-034"], l1: ["L1-006", "L1-008", "L1-009", "L1-041", "L1-051", "L1-054"], l0: ["L0-030", "L0-044", "L0-061", "L0-064", "L0-371", "L0-376", "L0-410"] }, methodCodes: ["M-02", "M-05", "M-06", "M-16", "M-20", "M-22", "M-23", "M-24", "M-25"],
  },
  {
    id: "lithium-cell-provenance", origin: "Seed fixture", sectorId: "critical-minerals", sector: "Mining & Critical Minerals", clientId: "terrametals", client: "TerraMetals Alliance", name: "Lithium-to-Cell Provenance", code: "P-007", health: "critical", stage: "Verify origin", currency: "USD", regions: "South America · Africa · China · EU", owner: "Mateo Álvarez", classification: "Restricted commercial", dataResidency: "Regional partitions",
    problem: "Balance mine, refinery, offtake, water, permit, rights, and origin constraints for battery supply.", outcome: "Build an auditable mineral-to-cell portfolio that remains feasible under policy and climate stress.", counts: { entities: "13,500", relationships: "52,000", observations: "1.46M", documents: "3,140", events: "171K", claims: "31.2K", decisions: 22, runs: 152, apps: 10, agents: 14, experts: 18 },
    metrics: metricSet("P-007", [["Contained LCE", "228K t", "2027 controlled supply", "healthy"], ["Refining concentration", "71%", "One jurisdiction", "critical"], ["Water-stress exposure", "38%", "Of controlled reserves", "watch"], ["Traceable volume", "82%", "Mine-to-cell evidence", "watch"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "workforce", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-002", "L2-013", "L2-019", "L2-031", "L2-034"], l1: ["L1-006", "L1-009", "L1-051", "L1-053", "L1-054", "L1-060"], l0: ["L0-030", "L0-035", "L0-051", "L0-121", "L0-371", "L0-394", "L0-399", "L0-476"] }, methodCodes: ["M-04", "M-05", "M-06", "M-16", "M-18", "M-19", "M-20", "M-22", "M-23", "M-24", "M-25", "M-28", "M-29"],
  },
  {
    id: "berth-to-door", origin: "Seed fixture", sectorId: "ports-maritime", sector: "Ports & Maritime", clientId: "blueharbor", client: "BlueHarbor Ports & Cargo", name: "Global Berth-to-Door", code: "P-008", health: "watch", stage: "Validate twin fixture", currency: "USD", regions: "Global ports", owner: "Leila Haddad", classification: "Port operational restricted", dataResidency: "Port-country partitions",
    problem: "Coordinate berths, vessels, containers, labor, customs, theft risk, and inland transfers.", outcome: "Move every priority cargo through a secure, explainable berth-to-door chain.", counts: { entities: "16,800", relationships: "44,200", observations: "4.85M", documents: "1,120", events: "1.92M", claims: "28.6K", decisions: 24, runs: 184, apps: 10, agents: 15, experts: 17 },
    metrics: metricSet("P-008", [["Cargo in motion", "$2.8B", "2,840 tracked lots", "healthy"], ["Port dwell", "31.4h", "Weighted across 18 hubs", "watch"], ["Secure handoffs", "98.7%", "Signed scan events", "healthy"], ["Late commitments", "146", "P80 arrival risk", "critical"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "workforce", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-003", "L2-004", "L2-013", "L2-016", "L2-026"], l1: ["L1-028", "L1-032", "L1-033", "L1-035", "L1-048"], l0: ["L0-202", "L0-209", "L0-217", "L0-229", "L0-235", "L0-241", "L0-260"] }, methodCodes: ["M-05", "M-09", "M-10", "M-11", "M-12", "M-14", "M-17", "M-20", "M-22", "M-26"],
  },
  {
    id: "factory-service-continuity", origin: "Seed fixture", sectorId: "industrial-automation", sector: "Industrial Automation", clientId: "titanworks", client: "TitanWorks Robotics", name: "Factory & Service Continuity", code: "P-009", health: "watch", stage: "Balance capacity", currency: "EUR", regions: "Germany · Mexico · India", owner: "Jonas Weber", classification: "Client confidential", dataResidency: "EU + Mexico + India",
    problem: "Balance machine reliability, scarce skills, production schedules, and service-spares positioning.", outcome: "Protect production and installed-base uptime with one capacity and reliability plan.", counts: { entities: "9,760", relationships: "34,100", observations: "2.31M", documents: "2,460", events: "640K", claims: "18.9K", decisions: 16, runs: 116, apps: 9, agents: 12, experts: 15 },
    metrics: metricSet("P-009", [["Service exposure", "€28.4M", "Installed-base revenue", "critical"], ["OEE", "76.8%", "Constraint-cell weighted", "watch"], ["Skill coverage", "89%", "Next 21 shifts", "watch"], ["Spares fill", "96.2%", "Priority machines", "healthy"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "workforce", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-003", "L2-005", "L2-021"], l1: ["L1-010", "L1-012", "L1-014"], l0: ["L0-071", "L0-088", "L0-098", "L0-101", "L0-102"] }, methodCodes: ["M-06", "M-07", "M-08", "M-14", "M-15", "M-17", "M-20", "M-26", "M-27", "M-30"],
  },
  {
    id: "omnichannel-peak", origin: "Seed fixture", sectorId: "retail-commerce", sector: "Retail & E-commerce", clientId: "meridian-commerce", client: "Meridian Commerce Group", name: "Omnichannel Peak", code: "P-010", health: "healthy", stage: "Commit peak plan", currency: "USD", regions: "North America · Europe", owner: "Avery Chen", classification: "Client confidential", dataResidency: "US + EU",
    problem: "Align promotion demand, ATP, picking labor, fleet capacity, last-mile promises, and margin.", outcome: "Deliver the peak promise at the lowest risk-adjusted cost without hiding service trade-offs.", counts: { entities: "18,400", relationships: "55,900", observations: "5.28M", documents: "780", events: "2.45M", claims: "35.4K", decisions: 28, runs: 196, apps: 9, agents: 13, experts: 16 },
    metrics: metricSet("P-010", [["Peak orders", "3.82M", "Six-week demand contract", "healthy"], ["Promise risk", "4.6%", "P90 late probability", "watch"], ["Labor coverage", "93%", "Peak roster demand", "watch"], ["Margin protected", "$21.6M", "Candidate fulfillment plan", "opportunity"]]), mountedAppIds: ["risk", "optimizer", "flow", "demand", "suppliers", "workforce", "manufacturing", "logistics", "quality"], variablePack: { l2: ["L2-001", "L2-003", "L2-006", "L2-021"], l1: ["L1-001", "L1-002", "L1-014", "L1-019", "L1-037", "L1-038"], l0: ["L0-001", "L0-012", "L0-101", "L0-102", "L0-155", "L0-187", "L0-225", "L0-275"] }, methodCodes: ["M-02", "M-03", "M-05", "M-08", "M-09", "M-10", "M-13", "M-14", "M-16", "M-17", "M-20", "M-24", "M-26", "M-27"],
  },
];

export const apexWorkspaceProject = workspaceProjects[0];

const initialsFor = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "NA";

export const workspaceClients: readonly WorkspaceClient[] = Array.from(workspaceProjects.reduce((clients, project) => {
  if (!clients.has(project.clientId)) clients.set(project.clientId, {
    id: project.clientId,
    sectorId: project.sectorId,
    sector: project.sector,
    name: project.client,
    classification: project.classification,
    dataResidency: project.dataResidency,
    clientLead: project.owner,
    providerLead: "Asha Rao",
    origin: "Seed fixture",
  });
  return clients;
}, new Map<string, WorkspaceClient>()).values());

export const workspaceCollaborators: readonly WorkspaceCollaborator[] = [
  ...workspaceProjects.map((project) => ({
    id: `${project.id}-client-owner`,
    clientId: project.clientId,
    name: project.owner,
    initials: initialsFor(project.owner),
    role: "Project owner",
    affiliation: "Client" as const,
    organization: project.client,
    profileOrigin: "Seed fixture" as const,
  })),
  { id: "tanjx-engagement", name: "Aakash Roy", initials: "AR", role: "Super Admin", affiliation: "tanjx", organization: "Supply Chain Workspace", profileOrigin: "Seed fixture" },
  { id: "tanjx-or-scientist", name: "tanjx OR Scientist", initials: "OR", role: "Formulation and validation", affiliation: "tanjx", organization: "Supply Chain Workspace", profileOrigin: "Seed fixture" },
  { id: "tanjx-data-steward", name: "tanjx Data Steward", initials: "DS", role: "Data contracts and lineage", affiliation: "tanjx", organization: "Supply Chain Workspace", profileOrigin: "Seed fixture" },
];

/** Explicit browser-session identity represented by the shell's Aakash Roy profile. */
export const signedInCollaboratorId = "tanjx-engagement";

const clientOwnerCapabilities: readonly ProjectCapability[] = ["project.view", "data.view", "data.stage", "connectors.request", "apps.view", "apps.mount", "decisions.view", "decisions.draft", "decisions.approve", "agents.run", "team.manage"];
const tanjxLeadCapabilities: readonly ProjectCapability[] = ["project.view", "data.view", "connectors.request", "apps.view", "apps.mount", "decisions.view", "decisions.draft", "agents.run", "agents.create", "team.manage"];
const tanjxOrCapabilities: readonly ProjectCapability[] = ["project.view", "data.view", "apps.view", "decisions.view", "decisions.draft", "agents.run", "agents.create"];
const tanjxDataCapabilities: readonly ProjectCapability[] = ["project.view", "data.view", "data.stage", "connectors.request", "apps.view", "decisions.view"];

export const projectMemberships: readonly ProjectMembership[] = workspaceProjects.flatMap((project) => [
  { id: `${project.id}:client-owner`, projectId: project.id, collaboratorId: `${project.id}-client-owner`, projectRole: "Client owner", capabilities: clientOwnerCapabilities, origin: "Seed fixture" },
  { id: `${project.id}:tanjx-engagement`, projectId: project.id, collaboratorId: "tanjx-engagement", projectRole: "tanjx engagement lead", capabilities: tanjxLeadCapabilities, origin: "Seed fixture" },
  { id: `${project.id}:tanjx-or-scientist`, projectId: project.id, collaboratorId: "tanjx-or-scientist", projectRole: "tanjx OR scientist", capabilities: tanjxOrCapabilities, origin: "Seed fixture" },
  { id: `${project.id}:tanjx-data-steward`, projectId: project.id, collaboratorId: "tanjx-data-steward", projectRole: "tanjx data steward", capabilities: tanjxDataCapabilities, origin: "Seed fixture" },
]);

export const connectorTemplates: readonly ConnectorTemplate[] = [
  { id: "opc-ua-edge", name: "Machine and robot edge", sourceClass: "Industrial IoT", protocol: "OPC UA through a customer-managed edge gateway", targetData: ["Equipment state", "Cycle completion", "Alarm and quality events"], targetBoundary: "Customer edge to project ingestion boundary", targetDirection: "Target read-only observation", catalogState: "Catalog only", limitations: "No device, PLC, gateway, endpoint, certificate, credential, or network route is connected or tested." },
  { id: "mqtt-sensor", name: "Sensor telemetry gateway", sourceClass: "Industrial IoT", protocol: "MQTT 5 over TLS through a customer-managed broker", targetData: ["Temperature", "Humidity", "Vibration", "Location and seal state"], targetBoundary: "Customer broker to project ingestion boundary", targetDirection: "Target inbound event ingestion", catalogState: "Catalog only", limitations: "No broker, topic, device identity, certificate, credential, or telemetry feed is connected or read." },
  { id: "gs1-qr-handoff", name: "Port, cargo, and warehouse handoff", sourceClass: "Mobile handoff", protocol: "GS1 Digital Link-style QR payload over HTTPS", targetData: ["Asset identity", "Custody handoff", "Quantity", "Location and event time"], targetBoundary: "Approved mobile client to project event boundary", targetDirection: "Target inbound event ingestion", catalogState: "Catalog only", limitations: "No QR signature, device identity, mobile session, endpoint, or external event is verified or transmitted." },
  { id: "readonly-cdc-api", name: "Enterprise source observer", sourceClass: "Enterprise system", protocol: "Read-only CDC or approved source API", targetData: ["Master data", "Transactions", "Status events", "Reference evidence"], targetBoundary: "Client-controlled source boundary", targetDirection: "Target read-only observation", catalogState: "Catalog only", limitations: "No source, database, API, credential, allow-list, or change stream is connected or inspected." },
  { id: "licensed-movement-api", name: "Licensed movement telemetry", sourceClass: "Licensed telemetry", protocol: "Contracted AIS, ADS-B, or carrier-provider API", targetData: ["Position", "ETA", "Asset identity", "Cargo milestone"], targetBoundary: "Licensed provider to project ingestion boundary", targetDirection: "Target inbound event ingestion", catalogState: "Catalog only", limitations: "No provider account, license right, API, asset feed, or movement record is connected or available in this concept." },
];

export const projectApps: readonly ProjectAppDefinition[] = [
  { id: "risk", name: "Risk Radar", icon: "RR", accent: "#ff715b", archetype: "Signal room + causal propagation", outcome: "Know what can stop the project", artifact: "Risk control brief", methodCodes: ["M-04", "M-16", "M-20", "M-23"], variableIds: ["L2-027", "L0-025", "L0-054"], status: "Concept ready" },
  { id: "optimizer", name: "Network Optimizer", icon: "NO", accent: "#d7ff38", archetype: "Formulation editor + run console", outcome: "Choose a feasible response", artifact: "Versioned solution package", methodCodes: ["M-05", "M-06", "M-20", "M-22", "M-24"], variableIds: ["L0-001", "L0-071", "L0-299"], status: "Concept ready" },
  { id: "flow", name: "Flow Lens", icon: "FL", accent: "#6ed0ff", archetype: "Material-to-cash Sankey", outcome: "Release cash without harming service", artifact: "Cash action package", methodCodes: ["M-05", "M-06", "M-24"], variableIds: ["L0-155", "L0-290", "L0-312"], status: "Concept ready" },
  { id: "demand", name: "Demand Sense", icon: "DS", accent: "#b8a4ff", archetype: "Forecast fan + causal notebook", outcome: "Commit an explainable demand range", artifact: "Demand contract", methodCodes: ["M-02", "M-03", "M-04", "M-20"], variableIds: ["L0-001", "L0-016", "L2-011"], status: "Concept ready" },
  { id: "suppliers", name: "Supplier Graph", icon: "SG", accent: "#77d59c", archetype: "N-tier graph + qualification funnel", outcome: "Find dependency and optionality", artifact: "Qualified shortlist", methodCodes: ["M-22", "M-25", "M-29"], variableIds: ["L0-057", "L0-044", "L0-056"], status: "Concept ready" },
  { id: "minerals", name: "Mineral Atlas", icon: "MA", accent: "#d89b5b", archetype: "Reserve-to-refinery atlas", outcome: "Trace critical minerals country to product", artifact: "Mineral sourcing scenario", methodCodes: ["M-05", "M-16", "M-20", "M-22", "M-23", "M-24"], variableIds: ["L0-030", "L0-035", "L0-371", "L0-394", "L0-410"], status: "Concept ready" },
  { id: "workforce", name: "Workforce Studio", icon: "WS", accent: "#8f9cff", archetype: "Skill matrix + shift builder", outcome: "Cover capacity with qualified people", artifact: "Workforce capacity plan", methodCodes: ["M-08", "M-14", "M-17", "M-21", "M-24"], variableIds: ["L0-101", "L0-102", "L0-105", "L0-110"], status: "Concept ready" },
  { id: "manufacturing", name: "Manufacturing Twin", icon: "MT", accent: "#7da2b8", archetype: "Plant flow + constraint Gantt", outcome: "Schedule the constraint, not averages", artifact: "Production plan", methodCodes: ["M-06", "M-07", "M-08", "M-15", "M-17", "M-27"], variableIds: ["L0-071", "L0-074", "L0-079", "L0-088", "L0-097"], status: "Concept ready" },
  { id: "logistics", name: "Logistics Radar", icon: "LR", accent: "#4ee2df", archetype: "Map radar + transfer playback", outcome: "Control every cargo handoff", artifact: "Route and handoff plan", methodCodes: ["M-05", "M-09", "M-10", "M-11", "M-12", "M-17"], variableIds: ["L0-202", "L0-209", "L0-217", "L0-229", "L0-241"], status: "Concept ready" },
  { id: "quality", name: "Quality Genealogy", icon: "QG", accent: "#ffcf70", archetype: "Batch genealogy + release gates", outcome: "Trace every quality consequence", artifact: "Release or containment plan", methodCodes: ["M-15", "M-21", "M-26", "M-30"], variableIds: ["L0-131", "L0-141", "L0-145", "L0-151"], status: "Concept ready" },
];

export const evidenceReceipts: readonly EvidenceReceipt[] = [
  { id: "EV-001-01", projectId: "anode-shield", claim: "P90 contribution value exposed", displayedValue: "$42.0M", state: "Simulated", sourceKind: "Synthetic fixture", source: "Risk exposure deterministic fixture", locator: "fixture://risk-exposure/v3.4/run/RUN-018/output/p90", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: "risk-exposure-fixture@3.4.1", contentHash: "fixture-fingerprint:EV-001-01", formula: "Illustrative CVaR90 over 12 synthetic disruption scenarios", inputs: ["EV-001-05 demand fixture", "EV-001-06 margin fixture", "EV-001-07 inventory fixture", "EV-001-08 duration fixture"], variableId: "L0-312 + L0-445", grain: "Project × synthetic scenario × customer program", confidence: 75, quality: ["DEMO DATA label required", "No live model executed", "No finance system contacted"], traceId: "TRACE-018-FIXTURE", agent: "Risk Sentinel · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-02", projectId: "anode-shield", claim: "Projected launch service", displayedValue: "95.1%", state: "Simulated", sourceKind: "Synthetic fixture", source: "Service-allocation deterministic fixture", locator: "fixture://allocation/v2.8/run/RUN-018/otif", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept weeks 36–48, 2026", version: "allocation-fixture@2.8", contentHash: "fixture-fingerprint:EV-001-02", formula: "Illustrative protected fixture orders / governed fixture launch orders", inputs: ["EV-001-09 allocation fixture", "EV-001-10 ETA fixture", "EV-001-11 priority fixture"], variableId: "L0-227 + L0-008", grain: "Synthetic order line × promise date", confidence: 75, quality: ["DEMO DATA label required", "No real solver invoked", "No order system contacted"], traceId: "TRACE-018-FIXTURE", agent: "OR Formulator · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-03", projectId: "anode-shield", claim: "Graphite refining-path dependency", displayedValue: "92%", state: "Simulated", sourceKind: "Synthetic fixture", source: "Supplier dependency deterministic fixture", locator: "fixture://supplier-graph/anode-shield/graphite/dependency", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: "supplier-graph-fixture@1.4", contentHash: "fixture-fingerprint:EV-001-03", formula: "Illustrative qualified demand volume on the primary refining path / total qualified demand volume", inputs: ["FIXTURE-SUPPLIER-NEOGRAPH", "FIXTURE-MATERIAL-G142", "L0-030"], variableId: "L0-030 + L0-057", grain: "Synthetic material × qualified refining path", confidence: 75, quality: ["DEMO DATA label required", "No supplier master contacted", "Qualification state is illustrative"], traceId: "TRACE-DEPENDENCY-FIXTURE", agent: "Supplier Cartographer · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-04", projectId: "anode-shield", claim: "Remaining reservation decision window", displayedValue: "3h 42m", state: "Simulated", sourceKind: "Synthetic fixture", source: "Supplier-option deterministic fixture", locator: "fixture://supplier-options/OPT-G142-44/expiresAt", asOf: "04 Sep 2026 · 14:18 IST", validFor: "Concept demonstration only", version: "supplier-option-fixture@1", contentHash: "fixture-fingerprint:EV-001-04", formula: "Fixture option expiry − fixed fixture clock", inputs: ["OPT-G142-44 fixture", "FIXED-CLOCK-2026-09-04T14:18+05:30"], variableId: "L0-067", grain: "Synthetic supplier option", confidence: 75, quality: ["DEMO DATA label required", "No supplier API contacted", "Fixed demonstration clock"], traceId: "TRACE-021-FIXTURE", agent: "Procurement Strategist · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-D2A", projectId: "anode-shield", claim: "Qualified alternate capacity candidate", displayedValue: "480 t", state: "Proposed", sourceKind: "Synthetic fixture", source: "Alternate-capacity deterministic fixture", locator: "fixture://supplier-options/anode-shield/qualified-capacity", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: "capacity-option-fixture@1.0", contentHash: "fixture-fingerprint:EV-001-D2A", formula: "Illustrative qualified capacity after fixture yield and reservation limits", inputs: ["EV-001-03", "L0-061", "L0-064"], variableId: "L0-061 + L0-064", grain: "Synthetic supplier-site × material × option window", confidence: 75, quality: ["DEMO DATA label required", "No capacity reservation exists", "Human qualification required"], traceId: "TRACE-D2A-FIXTURE", agent: "OR Formulator · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-D2B", projectId: "anode-shield", claim: "Regional inventory rebalance candidate", displayedValue: "64 t", state: "Proposed", sourceKind: "Synthetic fixture", source: "Inventory-transfer deterministic fixture", locator: "fixture://inventory/anode-shield/rebalance-candidate", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: "inventory-transfer-fixture@1.0", contentHash: "fixture-fingerprint:EV-001-D2B", formula: "Illustrative transferable inventory after reserve and service-floor deductions", inputs: ["EV-001-02", "L0-155", "L0-217"], variableId: "L0-155 + L0-217", grain: "Synthetic material × site × transfer window", confidence: 75, quality: ["DEMO DATA label required", "No inventory system contacted", "No transfer was created"], traceId: "TRACE-D2B-FIXTURE", agent: "Logistics Controller · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-001-D3A", projectId: "anode-shield", claim: "Required human approvals", displayedValue: "3 approvals", state: "Proposed", sourceKind: "Synthetic fixture", source: "Decision-authority policy fixture", locator: "fixture://governance/anode-shield/release-authority", asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: "decision-policy-fixture@1.0", contentHash: "fixture-fingerprint:EV-001-D3A", formula: "Count of named fixture authority roles required by the demonstration policy", inputs: ["Supply chain owner", "Finance controller", "Executive delegate"], variableId: "L0-057", grain: "Synthetic decision package × authority role", confidence: 75, quality: ["DEMO DATA label required", "No approval has been granted", "Production policy is not connected"], traceId: "TRACE-D3A-FIXTURE", agent: "Project Orchestrator · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-GRAPH-01", projectId: "anode-shield", claim: "NeoGraph supplies Graphite G-142", displayedValue: "Synthetic relationship", state: "Simulated", sourceKind: "Synthetic fixture", source: "Supplier-allocation graph fixture", locator: "fixture://graph/anode-shield/relationships/EV-GRAPH-01", asOf: "04 Sep 2026 · 13:58 IST", validFor: "Concept demonstration snapshot", version: "graph-fixture@1", contentHash: "fixture-fingerprint:EV-GRAPH-01", formula: "Static project-fixture relationship; no workbook was read", inputs: ["FIXTURE-SUPPLIER-NEOGRAPH", "L0-030", "L0-052"], variableId: "L0-052", grain: "Synthetic supplier-site × material × month", confidence: 75, quality: ["DEMO DATA label required", "No file uploaded or scanned", "No human approval recorded"], traceId: "TRACE-012-FIXTURE", agent: "Evidence Auditor · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
  { id: "EV-MIN-01", projectId: "anode-shield", claim: "Synthetic country graphite reserve context", displayedValue: "73.4 Mt", state: "Simulated", sourceKind: "Synthetic fixture", source: "USGS-structured demonstration fixture", locator: "fixture://mineral-atlas/graphite/country-balance/v1", asOf: "04 Sep 2026 · 12:00 IST", validFor: "Demonstration only", version: "mineral-fixture@1.2", contentHash: "fixture-fingerprint:EV-MIN-01", formula: "Sum of illustrative country reserve values", inputs: ["FIX-CHN", "FIX-MOZ", "FIX-MDG", "FIX-BRA"], variableId: "L0-030", grain: "Mineral × country × year", confidence: 75, quality: ["DEMO DATA label required", "No live USGS connector", "Country totals intentionally illustrative"], traceId: "TRACE-MIN-04-FIXTURE", agent: "Mineral Scout · synthetic playback", reviewer: "Unreviewed fixture", access: "Apex Mobility / Anode Shield only" },
];

export const expertAgents: readonly ExpertAgent[] = [
  { id: "orchestrator", name: "Project Orchestrator", role: "Coordinates the governed expert society", level: "Principal", years: 12, evaluatedRuns: 286, approvedRuns: 241, calibration: 96, overrideRate: 8, failureRate: 1.4, skills: ["project-orchestration/SKILL.md", "decision-governance/SKILL.md"], mcps: ["project-graph", "evidence-ledger"], tools: ["task graph", "approval router"], authority: "Coordinate only; no release authority", state: "Active" },
  { id: "evidence", name: "Evidence Auditor", role: "Challenges sources, transformations, and claims", level: "Principal", years: 11, evaluatedRuns: 418, approvedRuns: 376, calibration: 98, overrideRate: 4, failureRate: .6, skills: ["provenance-audit/SKILL.md"], mcps: ["evidence-ledger", "project-vault"], tools: ["lineage tracer", "unit validator"], authority: "May block untraceable claims", state: "Active" },
  { id: "minerals", name: "Mineral Scout", role: "Maps mine, refinery, policy, and offtake constraints", level: "Specialist", years: 9, evaluatedRuns: 144, approvedRuns: 119, calibration: 91, overrideRate: 12, failureRate: 2.1, skills: ["critical-minerals/SKILL.md"], mcps: ["mineral-fixture"], tools: ["country balance", "origin trace"], authority: "Draft scenarios; human approves sources", state: "Active" },
  { id: "geo", name: "Geopolitical Sentinel", role: "Builds policy and disruption scenarios", level: "Specialist", years: 8, evaluatedRuns: 188, approvedRuns: 142, calibration: 88, overrideRate: 18, failureRate: 3.4, skills: ["geopolitical-scenarios/SKILL.md"], mcps: ["licensed-news-adapter · disconnected"], tools: ["Bayesian update", "scenario generator"], authority: "No autonomous escalation", state: "Shadow" },
  { id: "demand", name: "Demand Anthropologist", role: "Combines behavioral, commercial, and order signals", level: "Specialist", years: 10, evaluatedRuns: 212, approvedRuns: 181, calibration: 93, overrideRate: 11, failureRate: 1.9, skills: ["demand-sensing/SKILL.md"], mcps: ["order-fixture", "consumer-signal-fixture"], tools: ["forecast", "causal decomposition"], authority: "May draft demand contracts", state: "Active" },
  { id: "procurement", name: "Procurement Strategist", role: "Frames supplier, contract, and award decisions", level: "Specialist", years: 14, evaluatedRuns: 254, approvedRuns: 218, calibration: 94, overrideRate: 9, failureRate: 1.2, skills: ["strategic-sourcing/SKILL.md", "should-cost/SKILL.md"], mcps: ["supplier-fixture", "contract-fixture"], tools: ["bid optimizer", "should-cost model"], authority: "Draft awards; executive releases", state: "Active" },
  { id: "cartographer", name: "Supplier Cartographer", role: "Resolves n-tier identity and dependency", level: "Specialist", years: 7, evaluatedRuns: 306, approvedRuns: 277, calibration: 97, overrideRate: 5, failureRate: .8, skills: ["supplier-graph/SKILL.md"], mcps: ["project-graph", "supplier-fixture"], tools: ["entity resolution", "graph traversal"], authority: "Read and propose graph mappings", state: "Active" },
  { id: "manufacturing", name: "Manufacturing Planner", role: "Models capacity, yield, schedule, and reliability", level: "Specialist", years: 13, evaluatedRuns: 198, approvedRuns: 162, calibration: 92, overrideRate: 14, failureRate: 2.5, skills: ["factory-planning/SKILL.md"], mcps: ["plant-twin-fixture"], tools: ["schedule builder", "DES simulator"], authority: "Draft plan; plant manager approves", state: "Active" },
  { id: "workforce", name: "Workforce Capacity Analyst", role: "Models skills, rosters, fatigue, and safety", level: "Practitioner", years: 6, evaluatedRuns: 96, approvedRuns: 72, calibration: 87, overrideRate: 19, failureRate: 3.8, skills: ["workforce-capacity/SKILL.md"], mcps: ["workforce-fixture"], tools: ["roster model", "fatigue gate"], authority: "Advisory only", state: "Shadow" },
  { id: "logistics", name: "Logistics Controller", role: "Plans routes, handoffs, ports, and cargo", level: "Specialist", years: 12, evaluatedRuns: 342, approvedRuns: 288, calibration: 95, overrideRate: 7, failureRate: 1.1, skills: ["multimodal-logistics/SKILL.md"], mcps: ["network-fixture", "licensed-AIS · disconnected"], tools: ["route optimizer", "ETA simulation"], authority: "Draft movement plans", state: "Active" },
  { id: "formulator", name: "OR Formulator", role: "Translates decisions into auditable mathematical models", level: "Principal", years: 16, evaluatedRuns: 392, approvedRuns: 331, calibration: 97, overrideRate: 6, failureRate: .9, skills: ["or-formulation/SKILL.md", "method-handbook/SKILL.md"], mcps: ["project-graph", "solver-registry"], tools: ["MILP modeler", "robust modeler", "constraint validator"], authority: "Formulate; cannot self-approve", state: "Active" },
  { id: "solver", name: "Solver Operator", role: "Runs governed solver adapters and records status", level: "Specialist", years: 9, evaluatedRuns: 487, approvedRuns: 409, calibration: 99, overrideRate: 2, failureRate: .4, skills: ["solver-operations/SKILL.md"], mcps: ["solver-registry · disconnected"], tools: ["OR-Tools adapter", "Gurobi adapter · future"], authority: "Execute approved models only", state: "Shadow" },
];

export const humanExperts: readonly HumanExpert[] = [
  { id: "maya", name: "Asha Rao", initials: "AR", role: "Client project owner", specialties: ["Decision rights", "Customer service"], years: 17, decisionRight: "Accept or return recommendations", availability: "Available now", activeWork: 4 },
  { id: "arun", name: "Dr. Arun Mehta", initials: "AM", role: "OR scientist", specialties: ["MILP", "Robust optimization", "Simulation"], years: 15, decisionRight: "Validate formulation and claims", availability: "In project · 60%", activeWork: 3 },
  { id: "elena", name: "Elena Torres", initials: "ET", role: "Procurement executive", specialties: ["Critical minerals", "Contracts", "Supplier qualification"], years: 19, decisionRight: "Approve sourcing package", availability: "Available in 24 min", activeWork: 5 },
  { id: "priya", name: "Priya Menon", initials: "PM", role: "Finance controller", specialties: ["Margin", "Cash", "Benefit validation"], years: 12, decisionRight: "Validate value and funding", availability: "Available now", activeWork: 2 },
  { id: "amina", name: "Amina Okafor", initials: "AO", role: "Critical-minerals specialist", specialties: ["Mine/refinery", "Origin", "Rights and water"], years: 14, decisionRight: "Approve mineral evidence fitness", availability: "In review", activeWork: 3 },
  { id: "noah", name: "Noah Williams", initials: "NW", role: "Data steward", specialties: ["Ontology", "Lineage", "Data quality"], years: 10, decisionRight: "Approve graph merges", availability: "Available now", activeWork: 6 },
  { id: "lin", name: "Lin Chen", initials: "LC", role: "Manufacturing engineer", specialties: ["Capacity", "OEE", "Maintenance"], years: 13, decisionRight: "Validate plant feasibility", availability: "Plant review", activeWork: 4 },
  { id: "leila", name: "Leila Haddad", initials: "LH", role: "Logistics & port controller", specialties: ["Ocean", "Ports", "Customs"], years: 16, decisionRight: "Release movement package", availability: "Available in 12 min", activeWork: 5 },
];

export const projectDatasets = [
  { id: "DS-001", name: "Graphite allocation", source: "SAP S/4HANA fixture", grain: "Material × supplier-site × month", rows: "18,420", freshness: "Modeled age · 18 sec", quality: 98, variables: ["L0-030", "L0-052", "L0-064"], state: "Fixture snapshot" },
  { id: "DS-002", name: "800V product structure", source: "Teamcenter PLM fixture", grain: "Parent part × child part × revision", rows: "426,118", freshness: "Modeled age · 4 min", quality: 96, variables: ["L0-028", "L0-029", "L0-031"], state: "Fixture snapshot" },
  { id: "DS-003", name: "Supplier qualification", source: "QMS workbook upload", grain: "Supplier-site × part × approval", rows: "4,812", freshness: "Modeled age · 2 hr", quality: 93, variables: ["L0-049", "L0-057", "L0-058"], state: "Fixture snapshot" },
  { id: "DS-004", name: "Orders and customer priority", source: "Order fixture", grain: "Order line × requested date", rows: "82,640", freshness: "Modeled age · 42 sec", quality: 99, variables: ["L0-001", "L0-008", "L0-275"], state: "Fixture snapshot" },
  { id: "DS-005", name: "Movement and cargo events", source: "TMS/AIS demonstration fixture", grain: "Cargo × event time", rows: "1,284,440", freshness: "Modeled age · 1 min", quality: 94, variables: ["L0-202", "L0-217", "L0-229"], state: "Review fixture" },
  { id: "DS-006", name: "Country mineral context", source: "USGS-aligned synthetic fixture", grain: "Mineral × country × year", rows: "2,480", freshness: "Demo snapshot", quality: 82, variables: ["L0-030", "L0-035", "L0-387"], state: "Demo only" },
] as const;

export const decisionTree = [
  { id: "D0", parent: null, level: "Outcome", title: "Protect the 800V drive-unit launch", owner: "Asha Rao", state: "At risk", value: "$42.0M", evidenceRef: "EV-001-01" },
  { id: "D1", parent: "D0", level: "Strategic", title: "Reshape the graphite sourcing portfolio", owner: "Elena Torres", state: "In review", value: "92% dependency", evidenceRef: "EV-001-03" },
  { id: "D2-A", parent: "D1", level: "Tactical", title: "Reserve qualified alternate capacity", owner: "Dr. Arun Mehta", state: "Candidate", value: "480 t", evidenceRef: "EV-001-D2A" },
  { id: "D2-B", parent: "D1", level: "Tactical", title: "Rebalance regional inventory", owner: "Leila Haddad", state: "Feasible fixture", value: "64 t", evidenceRef: "EV-001-D2B" },
  { id: "D3-A", parent: "D2-A", level: "Operational", title: "Issue qualification and reservation package", owner: "Noah Williams", state: "Human gate", value: "3 approvals", evidenceRef: "EV-001-D3A" },
] as const;

export const projectGraphNodes = [
  { id: "src", kind: "Source", label: "Allocation fixture", detail: "Static project snapshot", evidenceRef: "EV-GRAPH-01", x: 8, y: 18 },
  { id: "supplier", kind: "Supplier", label: "NeoGraph Materials", detail: "Primary refiner", evidenceRef: "EV-001-03", x: 27, y: 32 },
  { id: "material", kind: "Material", label: "Graphite G-142", detail: "Battery grade", evidenceRef: "EV-001-03", x: 46, y: 19 },
  { id: "plant", kind: "Plant", label: "Pune Plant 02", detail: "800V line", evidenceRef: "EV-001-02", x: 58, y: 50 },
  { id: "order", kind: "Demand", label: "28 launch orders", detail: "$64M value", evidenceRef: "EV-001-01", x: 79, y: 26 },
  { id: "calc", kind: "Activity", label: "Risk exposure v3.4", detail: "RUN-018", evidenceRef: "EV-001-01", x: 42, y: 74 },
  { id: "decision", kind: "Decision", label: "Reserve alternate", detail: "D2-A", evidenceRef: "EV-001-04", x: 72, y: 72 },
] as const;

export const projectGraphEdges = [["src", "supplier", "asserts"], ["supplier", "material", "supplies"], ["material", "plant", "required by"], ["plant", "order", "fulfills"], ["supplier", "calc", "used by"], ["order", "calc", "used by"], ["calc", "decision", "generated"]] as const;
export const appDependencyEdges = [["demand", "optimizer", "demand contract"], ["risk", "optimizer", "scenario envelope"], ["suppliers", "optimizer", "qualified capacity"], ["minerals", "suppliers", "origin + reserve"], ["workforce", "manufacturing", "skill capacity"], ["manufacturing", "optimizer", "plant feasibility"], ["logistics", "optimizer", "lane capacity"], ["optimizer", "flow", "time-phased plan"], ["quality", "optimizer", "hard release gates"]] as const;

export const methodFamilies = [
  { range: "M-01–M-04", name: "Forecasting & state estimation", detail: "Time series, causal models, Bayesian updating" }, { range: "M-05–M-12", name: "Network, allocation & routing", detail: "Shortest path, MILP, flows, vehicle and load planning" }, { range: "M-13–M-15", name: "Inventory, queues & reliability", detail: "Safety stock, queueing, maintenance reliability" }, { range: "M-16–M-19", name: "Simulation", detail: "Monte Carlo, discrete-event, system dynamics, agent-based" }, { range: "M-20–M-24", name: "Uncertainty & multi-objective", detail: "Stochastic, chance, robust, CVaR, Pareto trade-offs" }, { range: "M-25–M-30", name: "Governance & adaptive operations", detail: "MCDA, simulation optimization, heuristics, game and control methods" },
] as const;

export const portfolioTotals = { sectors: 10, clients: 10, projects: 10, entities: "118,820", relationships: "392,900", observations: "21.089M", documents: "18,580", events: "6.443M", claims: "223,700", decisions: 193, runs: "1,274", appMounts: 90, agents: 124, experts: 150 } as const;

const requiredText = (value: string, label: string) => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required for a browser-session draft.`);
  return normalized;
};

const slugify = (value: string, fallback: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || fallback;

const collisionSafeId = (base: string, existingIds: ReadonlySet<string>) => {
  if (!existingIds.has(base)) return base;
  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
};

export function createSessionClient(draft: SessionClientDraft, existingClients: readonly WorkspaceClient[] = workspaceClients): WorkspaceClient {
  const name = requiredText(draft.name, "Client name");
  const sector = requiredText(draft.sector, "Sector");
  const baseId = slugify(name, "client-draft");
  const id = collisionSafeId(baseId, new Set(existingClients.map((client) => client.id)));
  return {
    id,
    sectorId: slugify(draft.sectorId || sector, "sector-draft"),
    sector,
    name,
    classification: requiredText(draft.classification, "Classification"),
    dataResidency: requiredText(draft.dataResidency, "Data-residency intent"),
    clientLead: requiredText(draft.clientLead, "Client lead"),
    providerLead: requiredText(draft.providerLead, "tanjx lead"),
    origin: "Browser-session draft",
  };
}

export function createSessionProject(draft: SessionProjectDraft, clients: readonly WorkspaceClient[] = workspaceClients, existingProjects: readonly WorkspaceProject[] = workspaceProjects): WorkspaceProject {
  const client = clients.find((item) => item.id === draft.clientId);
  if (!client) throw new Error(`Client '${draft.clientId}' is unavailable; the project draft was not created.`);
  const sector = requiredText(draft.sector?.trim() || client.sector, "Project tower");
  const sectorId = slugify(draft.sectorId?.trim() || sector, "sector-draft");
  const name = requiredText(draft.name, "Project name");
  const codeNumber = existingProjects.reduce((highest, project) => {
    const match = /^P-(\d+)$/.exec(project.code);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
  const code = `P-${String(codeNumber).padStart(3, "0")}`;
  const id = collisionSafeId(slugify(name, "project-draft"), new Set(existingProjects.map((project) => project.id)));
  const intake = draft.operationsWorldIntake;
  const operationsWorldIntake: OperationsWorldIntake | undefined = intake ? {
    intent: (["dependency", "route", "value"] as const).includes(intake.intent)
      ? intake.intent
      : (() => { throw new Error("Operations World intake intent must be dependency, route, or value."); })(),
    selectedKind: requiredText(intake.selectedKind, "Operations World selection kind"),
    selectedId: requiredText(intake.selectedId, "Operations World selection id"),
    selectedLabel: requiredText(intake.selectedLabel, "Operations World selection label"),
    frame: requiredText(intake.frame, "Operations World frame"),
    scenario: requiredText(intake.scenario, "Operations World scenario"),
    evidenceRef: intake.evidenceRef?.trim() || `${code}-OWI-${slugify(intake.selectedId, "selection").toUpperCase()}`,
  } : undefined;
  const metrics: readonly WorkspaceMetric[] = [
    { label: "Setup state", value: "Draft", detail: "Browser-session project shell", evidenceRef: `EV-${code.slice(2)}-SETUP-01`, tone: "watch" },
    { label: "Project data", value: "0", detail: "No dataset or source contract", evidenceRef: `EV-${code.slice(2)}-SETUP-02`, tone: "watch" },
    { label: "Mounted apps", value: "0", detail: "No app contract mounted", evidenceRef: `EV-${code.slice(2)}-SETUP-03`, tone: "watch" },
    { label: "Decision briefs", value: "0", detail: "No decision case created", evidenceRef: `EV-${code.slice(2)}-SETUP-04`, tone: "watch" },
  ];
  return {
    id,
    origin: "Browser-session draft",
    sectorId,
    sector,
    clientId: client.id,
    client: client.name,
    name,
    code,
    problem: requiredText(draft.problem, "Problem statement"),
    outcome: requiredText(draft.outcome, "Outcome statement"),
    stage: "Draft setup",
    health: "watch",
    currency: requiredText(draft.currency, "Currency"),
    regions: requiredText(draft.regions, "Region intent"),
    owner: requiredText(draft.owner || client.clientLead, "Project owner"),
    classification: draft.classification?.trim() || client.classification,
    dataResidency: draft.dataResidency?.trim() || client.dataResidency,
    counts: { entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 0, agents: 0, experts: 2 },
    metrics,
    mountedAppIds: [],
    variablePack: { l2: [], l1: [], l0: [] },
    methodCodes: [],
    ...(operationsWorldIntake ? { operationsWorldIntake } : {}),
  };
}

export function createSessionCollaborators(client: WorkspaceClient, existingCollaborators: readonly WorkspaceCollaborator[] = workspaceCollaborators): readonly [WorkspaceCollaborator, WorkspaceCollaborator] {
  const existingIds = new Set(existingCollaborators.map((collaborator) => collaborator.id));
  const clientId = collisionSafeId(`${client.id}-client-lead`, existingIds);
  existingIds.add(clientId);
  const tanjxId = collisionSafeId(`${client.id}-tanjx-lead`, existingIds);
  const existingTanjxLead = existingCollaborators.find((collaborator) => collaborator.affiliation === "tanjx"
    && collaborator.clientId === undefined
    && collaborator.name.trim().toLowerCase() === client.providerLead.trim().toLowerCase());
  return [
    { id: clientId, clientId: client.id, name: client.clientLead, initials: initialsFor(client.clientLead), role: "Client relationship lead", affiliation: "Client", organization: client.name, profileOrigin: "Browser-session draft" },
    existingTanjxLead ?? { id: tanjxId, name: client.providerLead, initials: initialsFor(client.providerLead), role: "tanjx engagement lead", affiliation: "tanjx", organization: "Supply Chain Workspace", profileOrigin: "Browser-session draft" },
  ];
}

export function createSessionProjectMemberships(project: WorkspaceProject, clientCollaborator: WorkspaceCollaborator, tanjxCollaborator: WorkspaceCollaborator): readonly ProjectMembership[] {
  if (clientCollaborator.affiliation !== "Client" || clientCollaborator.clientId !== project.clientId) {
    throw new Error(`Client collaborator '${clientCollaborator.id}' is not bound to canonical client '${project.clientId}'; no project membership was created.`);
  }
  if (tanjxCollaborator.affiliation !== "tanjx" || tanjxCollaborator.clientId !== undefined) {
    throw new Error(`tanjx collaborator '${tanjxCollaborator.id}' has an invalid client binding; no project membership was created.`);
  }
  const clientId = requiredText(clientCollaborator.id, "Client collaborator");
  const tanjxId = requiredText(tanjxCollaborator.id, "tanjx collaborator");
  return [
    { id: `${project.id}:${clientId}`, projectId: project.id, collaboratorId: clientId, projectRole: "Client owner", capabilities: clientOwnerCapabilities, origin: "Browser-session draft" },
    { id: `${project.id}:${tanjxId}`, projectId: project.id, collaboratorId: tanjxId, projectRole: "tanjx engagement lead", capabilities: tanjxLeadCapabilities, origin: "Browser-session draft" },
  ];
}

export function membershipsForProject(projectId: string, memberships: readonly ProjectMembership[] = projectMemberships) {
  return memberships.filter((membership) => membership.projectId === projectId);
}

export function evaluateProjectAccess(projectId: string, collaboratorId: string, capability: ProjectCapability, memberships: readonly ProjectMembership[] = projectMemberships): ProjectAccessDecision {
  const membership = memberships.find((item) => item.projectId === projectId && item.collaboratorId === collaboratorId);
  const allowed = Boolean(membership?.capabilities.includes(capability));
  return {
    allowed,
    projectId,
    collaboratorId,
    capability,
    policyRef: `FIXTURE-POLICY-${slugify(projectId, "unbound").toUpperCase()}-V1`,
    reason: allowed
      ? `The project-scoped synthetic membership includes '${capability}'. This browser-only result is not production authorization.`
      : `No matching project-scoped synthetic grant includes '${capability}'. Access fails closed and no project resource is opened or changed.`,
  };
}

export function hasProjectAccess(projectId: string, collaboratorId: string, capability: ProjectCapability, memberships: readonly ProjectMembership[] = projectMemberships) {
  return evaluateProjectAccess(projectId, collaboratorId, capability, memberships).allowed;
}

export function createConnectorDraft(project: WorkspaceProject, templateId: string, requestedBy: string, existingDrafts: readonly ProjectConnectorDraft[] = []): ProjectConnectorDraft {
  const template = connectorTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error(`Connector template '${templateId}' is unavailable; no request was drafted.`);
  const requester = requiredText(requestedBy, "Connector requester");
  const baseId = `${project.code}-CON-${template.id.toUpperCase()}`;
  const id = collisionSafeId(baseId, new Set(existingDrafts.filter((item) => item.projectId === project.id).map((item) => item.id)));
  return {
    id,
    projectId: project.id,
    templateId: template.id,
    name: template.name,
    protocol: template.protocol,
    state: "Draft request",
    policyReviewState: "Not requested",
    endpointState: "Not supplied",
    credentialState: "Not provided",
    networkState: "Not tested",
    sampleState: "Not run",
    requestedBy: requester,
    evidenceRef: `${id}-EV`,
    origin: "Browser-session draft",
  };
}

export function connectorReceiptWording(project: WorkspaceProject, connector: ProjectConnectorDraft) {
  if (connector.projectId !== project.id) return `Connector receipt blocked: ${connector.id} does not belong to ${project.client} / ${project.name}. No foreign connector detail was substituted.`;
  return `${connector.protocol} catalog template saved as a project-scoped browser-session request for ${project.client} / ${project.name}. No device, PLC, broker, endpoint, credential, certificate, network route, source record, or telemetry feed was connected or read.`;
}

export function queueConnectorPolicyReview(connector: ProjectConnectorDraft): ProjectConnectorDraft {
  return { ...connector, policyReviewState: "Policy review queued" };
}

export function replayConnectorFixture(connector: ProjectConnectorDraft): ProjectConnectorDraft {
  return { ...connector, sampleState: "Fixed payload replayed" };
}

export function connectorReceiptFor(project: WorkspaceProject, connector: ProjectConnectorDraft): EvidenceReceipt {
  if (connector.projectId !== project.id) return evidenceFor(project, `FOREIGN-CONNECTOR-${connector.id}`);
  return fixtureEvidenceFor(project, {
    id: connector.evidenceRef,
    claim: `${connector.name} connector request`,
    displayedValue: `${connector.state} · ${connector.policyReviewState} · ${connector.sampleState}`,
    source: "Browser-session connector-contract fixture",
    formula: connectorReceiptWording(project, connector),
    inputs: [connector.templateId, connector.endpointState, connector.credentialState, connector.networkState, connector.policyReviewState, connector.sampleState],
    variableId: "Project connector metadata",
    grain: "Project × connector request",
    confidence: 75,
  });
}

export function agentsFor(project: WorkspaceProject) {
  return project.origin === "Browser-session draft" ? [] : expertAgents.map((agent) => ({ ...agent }));
}

export function caseIdForProject(project: WorkspaceProject) {
  return project.id === "anode-shield" ? "CASE-1042" : `CASE-${project.code.slice(2)}-01`;
}

export function decisionsFor(project: WorkspaceProject) {
  if (project.origin === "Browser-session draft" && project.counts.decisions === 0) return [];
  if (project.id === "anode-shield") return decisionTree.map((item) => ({ ...item }));
  const values = project.metrics.map((item) => item.value);
  const refs = project.metrics.map((item) => item.evidenceRef);
  return [
    { id: "D0", parent: null, level: "Outcome", title: project.outcome, owner: project.owner, state: project.health === "critical" ? "At risk" : "In review", value: values[0], evidenceRef: refs[0] },
    { id: "D1", parent: "D0", level: "Strategic", title: `Shape the ${project.sector.toLowerCase()} response portfolio`, owner: "Engagement lead", state: "In review", value: values[1], evidenceRef: refs[1] },
    { id: "D2-A", parent: "D1", level: "Tactical", title: `Commit the first ${project.name} intervention`, owner: "OR scientist", state: "Candidate", value: values[2], evidenceRef: refs[2] },
    { id: "D2-B", parent: "D1", level: "Tactical", title: "Balance capacity, service, cash, and risk", owner: "Domain executive", state: "Feasible fixture", value: values[3], evidenceRef: refs[3] },
    { id: "D3-A", parent: "D2-A", level: "Operational", title: "Issue the governed execution package", owner: "Project data steward", state: "Human gate", value: `${project.counts.experts} experts`, evidenceRef: `${project.code}-EV-EXPERTS` },
  ];
}

export function graphNodesFor(project: WorkspaceProject) {
  if (project.origin === "Browser-session draft" && project.counts.observations === "0") return [];
  if (project.id === "anode-shield") return projectGraphNodes.map((item) => ({ ...item }));
  const region = project.regions.split("·")[0]?.trim() ?? "Project region";
  return [
    { id: "src", kind: "Source", label: `${project.client} project snapshot`, detail: `${project.counts.documents} governed documents`, evidenceRef: project.metrics[0].evidenceRef, x: 8, y: 18 },
    { id: "supplier", kind: "Network", label: `${project.sector} partner network`, detail: `${project.counts.entities} entities`, evidenceRef: project.metrics[2].evidenceRef, x: 27, y: 32 },
    { id: "material", kind: "Variable", label: project.variablePack.l0[0] ?? "L0 mapping", detail: project.variablePack.l1[0] ?? "L1 owner", evidenceRef: project.metrics[2].evidenceRef, x: 46, y: 19 },
    { id: "plant", kind: "Operation", label: `${region} operating node`, detail: project.variablePack.l1[1] ?? "Operating constraint", evidenceRef: project.metrics[1].evidenceRef, x: 58, y: 50 },
    { id: "order", kind: "Demand", label: project.metrics[1].label, detail: project.metrics[1].value, evidenceRef: project.metrics[1].evidenceRef, x: 79, y: 26 },
    { id: "calc", kind: "Activity", label: `${project.methodCodes[0]} formulation fixture`, detail: `${project.counts.runs} run summaries`, evidenceRef: project.metrics[0].evidenceRef, x: 42, y: 74 },
    { id: "decision", kind: "Decision", label: project.name, detail: "D2-A · human review", evidenceRef: project.metrics[3].evidenceRef, x: 72, y: 72 },
  ];
}

export function datasetsFor(project: WorkspaceProject) {
  if (project.origin === "Browser-session draft") return [];
  const names = ["Commercial demand and priorities", "Product and material structure", "Supply and qualification", "Capacity and workforce", "Movement and event history", "External context register"];
  const sources = ["Planning fixture", "PLM / master-data fixture", "Procurement fixture", "Operations fixture", "Logistics fixture", "Approved public-data fixture"];
  return projectDatasets.map((dataset, index) => ({
    ...dataset,
    id: `${project.code}-DS-${String(index + 1).padStart(2, "0")}`,
    name: project.id === "anode-shield" ? dataset.name : names[index],
    source: project.id === "anode-shield" ? dataset.source : sources[index],
    rows: index === 0 ? project.counts.observations : dataset.rows,
    variables: project.variablePack.l0.slice(index % Math.max(project.variablePack.l0.length - 2, 1), index % Math.max(project.variablePack.l0.length - 2, 1) + 3),
  }));
}

export function evidenceFor(project: WorkspaceProject, evidenceRef: string): EvidenceReceipt {
  const exact = evidenceReceipts.find((item) => item.projectId === project.id && item.id === evidenceRef);
  if (exact) return exact;
  const metric = project.metrics.find((item) => item.evidenceRef === evidenceRef);
  if (metric) return { id: evidenceRef, projectId: project.id, claim: metric.label, displayedValue: metric.value, state: "Simulated", sourceKind: "Synthetic fixture", source: `${project.name} deterministic project fixture`, locator: `fixture://workspace/${project.id}/metrics/${evidenceRef}`, asOf: "04 Sep 2026 · 14:32 IST", validFor: "Concept demonstration snapshot", version: `${project.code}-fixture@1.0`, contentHash: `fixture-fingerprint:${evidenceRef}`, formula: "Project-specific illustrative calculation; inspect the production contract before operational use.", inputs: project.variablePack.l0.slice(0, 3), variableId: project.variablePack.l0[0] ?? "L0 mapping pending", grain: "Project × governed snapshot", confidence: 75, quality: ["DEMO DATA label required", "Project boundary retained", "No operational source contacted"], traceId: `TRACE-${project.code}`, agent: "Evidence Auditor · synthetic playback", reviewer: "Unreviewed fixture", access: `${project.client} / ${project.name} only` };
  if (evidenceRef === `${project.code}-EV-EXPERTS`) return fixtureEvidenceFor(project, {
    id: evidenceRef,
    claim: "Assigned expert coverage",
    displayedValue: `${project.counts.experts} experts`,
    source: "Project team-count deterministic fixture",
    formula: "Fixture count of governed expert-role assignments declared for the project",
    inputs: [project.code, project.owner, "Synthetic expert-role registry"],
    variableId: "Governance metadata",
    grain: "Project × expert-role fixture",
  });
  return { id: `MISSING-${project.code}-${evidenceRef}`, projectId: project.id, claim: "Evidence reference unavailable in this project", displayedValue: "Not found", state: "Proposed", sourceKind: "Synthetic fixture", source: `${project.code} project evidence boundary`, locator: `missing://workspace/${project.id}/evidence/${evidenceRef}`, asOf: "04 Sep 2026 · 14:32 IST", validFor: "Until a project-scoped receipt is supplied", version: `${project.code}-boundary@1.0`, contentHash: "not-available", formula: "Lookup rejected; no foreign or fallback claim was substituted.", inputs: [evidenceRef], variableId: "Mapping unavailable", grain: "Evidence reference", confidence: 0, quality: ["Cross-project fallback blocked", "No value substituted", "Project boundary retained"], traceId: `TRACE-${project.code}-MISSING`, agent: "Evidence Auditor · boundary guard", reviewer: "Required", access: `${project.client} / ${project.name} only` };
}

export function fixtureEvidenceFor(project: WorkspaceProject, input: FixtureEvidenceInput): EvidenceReceipt {
  const normalizedId = input.id.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const scopedId = normalizedId.startsWith(`${project.code}-`) ? normalizedId : `${project.code}-${normalizedId}`;
  return {
    id: scopedId,
    projectId: project.id,
    claim: input.claim,
    displayedValue: input.displayedValue,
    state: "Simulated",
    sourceKind: "Synthetic fixture",
    source: input.source,
    locator: `fixture://workspace/${project.id}/claims/${scopedId.toLowerCase()}`,
    asOf: "04 Sep 2026 · 14:32 IST",
    validFor: "Concept demonstration snapshot",
    version: `${project.code}-fixture@1.0`,
    contentHash: `fixture-fingerprint:${scopedId}`,
    formula: input.formula,
    inputs: input.inputs ?? project.variablePack.l0.slice(0, 3),
    variableId: input.variableId ?? project.variablePack.l0[0] ?? "L0 mapping pending",
    grain: input.grain ?? "Project × synthetic scenario",
    confidence: input.confidence ?? 75,
    quality: ["Exact displayed value bound to this receipt", "DEMO DATA label required", "Project boundary retained", "No operational source contacted"],
    traceId: `TRACE-${project.code}-${scopedId.slice(-4)}`,
    agent: "Evidence Auditor · synthetic playback",
    reviewer: "Unreviewed fixture",
    access: `${project.client} / ${project.name} only`,
  };
}
