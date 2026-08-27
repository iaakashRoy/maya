/**
 * Synthetic domain model and fixtures for the Resilience OS product prototype.
 *
 * Nothing in this file represents a real organization, person, commercial
 * commitment, operational event, or model output. Fixed timestamps make the
 * prototype deterministic and safe to use in screenshots and demonstrations.
 */

export const SYNTHETIC_DATA_NOTICE =
  "Illustrative prototype data only. No real company, person, event, or recommendation is represented.";

export type Screen =
  | "command"
  | "radar"
  | "cases"
  | "twin"
  | "optimize"
  | "product"
  | "flow"
  | "trust"
  | "data"
  | "services";

export type NavigationItem = {
  id: Screen;
  label: string;
  shortLabel: string;
  description: string;
  number: string;
  badge?: string;
};

export type NavigationGroup = {
  id: "operate" | "model" | "govern";
  label: string;
  items: readonly NavigationItem[];
};

export const navigationGroups: readonly NavigationGroup[] = [
  {
    id: "operate",
    label: "Operate",
    items: [
      { id: "command", label: "Command center", shortLabel: "Command", description: "Executive exposure, actions, and value", number: "01" },
      { id: "radar", label: "Intelligence radar", shortLabel: "Radar", description: "Evidence-backed market and network signals", number: "02", badge: "23" },
      { id: "cases", label: "Decision cases", shortLabel: "Cases", description: "Owned decisions with SLA and value tracking", number: "03", badge: "5" },
    ],
  },
  {
    id: "model",
    label: "Model and decide",
    items: [
      { id: "twin", label: "Decision twin", shortLabel: "Twin", description: "Private operational graph and impact paths", number: "04" },
      { id: "optimize", label: "Optimizer studio", shortLabel: "Optimize", description: "Constrained scenarios and response plans", number: "05" },
      { id: "product", label: "Product DNA", shortLabel: "Product", description: "Structure, cost, design, and compliance", number: "06" },
      { id: "flow", label: "Flow graph", shortLabel: "Flow", description: "Inventory, orders, working capital, and cash", number: "07" },
    ],
  },
  {
    id: "govern",
    label: "Connect and govern",
    items: [
      { id: "trust", label: "Trust network", shortLabel: "Trust", description: "Permissioned evidence and credentials", number: "08" },
      { id: "data", label: "Data operations", shortLabel: "Data", description: "Connector health, mapping, and lineage", number: "09", badge: "2" },
      { id: "services", label: "Services", shortLabel: "Services", description: "Diagnostics, pilots, and managed operations", number: "10" },
    ],
  },
];

export const navigationItems: readonly NavigationItem[] = navigationGroups.flatMap(
  (group) => group.items,
);

export type SignalSeverity = "critical" | "high" | "watch" | "opportunity" | "policy";
export type FreshnessStatus = "live" | "fresh" | "aging" | "stale";

export type SignalEvidence = {
  id: string;
  kind: "official" | "filing" | "market" | "logistics" | "news" | "customer-private";
  label: string;
  publisher: string;
  capturedAt: string;
  confidence: number;
  synthetic: true;
};

export type Signal = {
  id: string;
  title: string;
  summary: string;
  severity: SignalSeverity;
  industry: string;
  geography: string;
  affectedPath: readonly string[];
  impactLabel: string;
  impactValueUsd: number;
  confidence: number;
  horizon: string;
  provenance: {
    method: "observed" | "corroborated" | "customer-matched";
    sourceGroups: number;
    sourceCount: number;
    licenseClass: "public" | "licensed" | "mixed" | "private";
    traceId: string;
    synthetic: true;
  };
  freshness: {
    status: FreshnessStatus;
    lastObservedAt: string;
    ageMinutes: number;
    expectedRefreshMinutes: number;
    validUntil: string;
    synthetic: true;
  };
  evidence: readonly SignalEvidence[];
  synthetic: true;
};

export const signals: readonly Signal[] = [
  {
    id: "sig-graphite-capacity",
    title: "Graphite capacity is tightening across East Asia",
    summary: "Two illustrative offtake agreements could constrain merchant supply during the next planning cycle.",
    severity: "critical",
    industry: "Critical materials",
    geography: "East Asia",
    affectedPath: ["Graphite G-142", "Cell supplier", "AX-4 drive unit", "Priority programs"],
    impactLabel: "$4.2M contribution margin at risk",
    impactValueUsd: 4_200_000,
    confidence: 87,
    horizon: "60-120 days",
    provenance: { method: "customer-matched", sourceGroups: 3, sourceCount: 7, licenseClass: "mixed", traceId: "SYN-PROV-001", synthetic: true },
    freshness: { status: "live", lastObservedAt: "2026-08-27T10:18:00Z", ageMinutes: 12, expectedRefreshMinutes: 30, validUntil: "2026-08-27T11:18:00Z", synthetic: true },
    evidence: [
      { id: "ev-001-a", kind: "filing", label: "Illustrative capacity agreement filing", publisher: "Synthetic Exchange Registry", capturedAt: "2026-08-27T10:08:00Z", confidence: 94, synthetic: true },
      { id: "ev-001-b", kind: "market", label: "Illustrative graphite price index +7.8% over 30 days", publisher: "Synthetic Materials Index", capturedAt: "2026-08-27T09:54:00Z", confidence: 89, synthetic: true },
      { id: "ev-001-c", kind: "customer-private", label: "Illustrative product-to-material exposure match", publisher: "Private prototype twin", capturedAt: "2026-08-27T10:18:00Z", confidence: 87, synthetic: true },
    ],
    synthetic: true,
  },
  {
    id: "sig-singapore-dwell",
    title: "Port dwell time is rising across Singapore",
    summary: "Illustrative median terminal dwell is 31% above its synthetic 30-day baseline.",
    severity: "high",
    industry: "Ocean logistics",
    geography: "Singapore",
    affectedPath: ["Singapore terminals", "Chennai lane", "Pune Plant 02", "11 priority orders"],
    impactLabel: "11 priority orders exposed",
    impactValueUsd: 1_850_000,
    confidence: 93,
    horizon: "5-12 days",
    provenance: { method: "corroborated", sourceGroups: 3, sourceCount: 11, licenseClass: "licensed", traceId: "SYN-PROV-002", synthetic: true },
    freshness: { status: "live", lastObservedAt: "2026-08-27T09:47:00Z", ageMinutes: 43, expectedRefreshMinutes: 60, validUntil: "2026-08-27T11:47:00Z", synthetic: true },
    evidence: [
      { id: "ev-002-a", kind: "logistics", label: "Illustrative terminal dwell observations", publisher: "Synthetic Port Telemetry", capturedAt: "2026-08-27T09:47:00Z", confidence: 96, synthetic: true },
      { id: "ev-002-b", kind: "logistics", label: "Illustrative carrier schedule revisions", publisher: "Synthetic Carrier Feed", capturedAt: "2026-08-27T09:22:00Z", confidence: 91, synthetic: true },
      { id: "ev-002-c", kind: "official", label: "Illustrative weather disruption bulletin", publisher: "Synthetic Maritime Authority", capturedAt: "2026-08-27T08:50:00Z", confidence: 98, synthetic: true },
    ],
    synthetic: true,
  },
  {
    id: "sig-casting-capacity",
    title: "New precision-casting capacity is coming online",
    summary: "An illustrative regional supplier line appears compatible with three constrained part families.",
    severity: "opportunity",
    industry: "Industrial manufacturing",
    geography: "India",
    affectedPath: ["Regional casting line", "Housing family", "Three product platforms"],
    impactLabel: "$620K annual savings potential",
    impactValueUsd: 620_000,
    confidence: 84,
    horizon: "3-6 months",
    provenance: { method: "corroborated", sourceGroups: 3, sourceCount: 6, licenseClass: "public", traceId: "SYN-PROV-003", synthetic: true },
    freshness: { status: "fresh", lastObservedAt: "2026-08-27T08:30:00Z", ageMinutes: 120, expectedRefreshMinutes: 240, validUntil: "2026-08-28T08:30:00Z", synthetic: true },
    evidence: [
      { id: "ev-003-a", kind: "official", label: "Illustrative operating permit approval", publisher: "Synthetic Industry Authority", capturedAt: "2026-08-27T07:45:00Z", confidence: 97, synthetic: true },
      { id: "ev-003-b", kind: "news", label: "Illustrative technical hiring activity", publisher: "Synthetic Labor Monitor", capturedAt: "2026-08-27T06:40:00Z", confidence: 78, synthetic: true },
      { id: "ev-003-c", kind: "official", label: "Illustrative quality certificate verification", publisher: "Synthetic Certification Register", capturedAt: "2026-08-27T08:30:00Z", confidence: 92, synthetic: true },
    ],
    synthetic: true,
  },
  {
    id: "sig-carbon-evidence",
    title: "Carbon evidence requirements changed for steel imports",
    summary: "An illustrative reporting change creates new supplier-data requirements for two EU-bound product families.",
    severity: "policy",
    industry: "Trade compliance",
    geography: "European Union",
    affectedPath: ["Steel 42CrMo4", "18 parts", "Two EU programs", "Next filing"],
    impactLabel: "$18.7M revenue requires evidence",
    impactValueUsd: 18_700_000,
    confidence: 96,
    horizon: "By next filing",
    provenance: { method: "observed", sourceGroups: 2, sourceCount: 4, licenseClass: "public", traceId: "SYN-PROV-004", synthetic: true },
    freshness: { status: "fresh", lastObservedAt: "2026-08-27T06:30:00Z", ageMinutes: 240, expectedRefreshMinutes: 720, validUntil: "2026-08-30T06:30:00Z", synthetic: true },
    evidence: [
      { id: "ev-004-a", kind: "official", label: "Illustrative policy publication", publisher: "Synthetic Trade Commission", capturedAt: "2026-08-27T06:30:00Z", confidence: 99, synthetic: true },
      { id: "ev-004-b", kind: "customer-private", label: "Illustrative mapping to 12 suppliers", publisher: "Private prototype twin", capturedAt: "2026-08-27T06:36:00Z", confidence: 96, synthetic: true },
      { id: "ev-004-c", kind: "customer-private", label: "Illustrative evidence gap across 48 fields", publisher: "Private prototype twin", capturedAt: "2026-08-27T06:38:00Z", confidence: 95, synthetic: true },
    ],
    synthetic: true,
  },
  {
    id: "sig-semiconductor-leadtime",
    title: "Industrial controller lead times are diverging",
    summary: "Illustrative distributor and contract-manufacturer signals indicate a six-week spread for two controller families.",
    severity: "watch",
    industry: "Electronics",
    geography: "Global",
    affectedPath: ["MCU family X7", "Controller board", "AX-2 and AX-4", "Service inventory"],
    impactLabel: "$2.1M service revenue exposed",
    impactValueUsd: 2_100_000,
    confidence: 79,
    horizon: "8-16 weeks",
    provenance: { method: "corroborated", sourceGroups: 4, sourceCount: 13, licenseClass: "mixed", traceId: "SYN-PROV-005", synthetic: true },
    freshness: { status: "aging", lastObservedAt: "2026-08-26T18:30:00Z", ageMinutes: 960, expectedRefreshMinutes: 720, validUntil: "2026-08-28T18:30:00Z", synthetic: true },
    evidence: [
      { id: "ev-005-a", kind: "market", label: "Illustrative authorized-distributor lead-time index", publisher: "Synthetic Electronics Index", capturedAt: "2026-08-26T18:30:00Z", confidence: 82, synthetic: true },
      { id: "ev-005-b", kind: "news", label: "Illustrative contract-manufacturer capacity note", publisher: "Synthetic Manufacturing Wire", capturedAt: "2026-08-26T16:10:00Z", confidence: 73, synthetic: true },
      { id: "ev-005-c", kind: "customer-private", label: "Illustrative service-parts demand match", publisher: "Private prototype twin", capturedAt: "2026-08-26T18:35:00Z", confidence: 79, synthetic: true },
    ],
    synthetic: true,
  },
  {
    id: "sig-supplier-liquidity",
    title: "A tier-two supplier shows early liquidity stress",
    summary: "Illustrative payment, hiring, and shipment patterns crossed a synthetic monitoring threshold.",
    severity: "high",
    industry: "Supplier resilience",
    geography: "Central Europe",
    affectedPath: ["Tier-two bearing supplier", "Rotor assembly", "Two plants", "Six customer programs"],
    impactLabel: "$3.4M continuity exposure",
    impactValueUsd: 3_400_000,
    confidence: 81,
    horizon: "30-90 days",
    provenance: { method: "customer-matched", sourceGroups: 4, sourceCount: 9, licenseClass: "private", traceId: "SYN-PROV-006", synthetic: true },
    freshness: { status: "fresh", lastObservedAt: "2026-08-27T09:10:00Z", ageMinutes: 80, expectedRefreshMinutes: 180, validUntil: "2026-08-27T15:10:00Z", synthetic: true },
    evidence: [
      { id: "ev-006-a", kind: "customer-private", label: "Illustrative invoice-aging change", publisher: "Private prototype twin", capturedAt: "2026-08-27T09:10:00Z", confidence: 85, synthetic: true },
      { id: "ev-006-b", kind: "news", label: "Illustrative reduction in open technical roles", publisher: "Synthetic Labor Monitor", capturedAt: "2026-08-27T07:00:00Z", confidence: 71, synthetic: true },
      { id: "ev-006-c", kind: "logistics", label: "Illustrative shipment-frequency decline", publisher: "Synthetic Logistics Feed", capturedAt: "2026-08-27T08:42:00Z", confidence: 86, synthetic: true },
    ],
    synthetic: true,
  },
];

export type DecisionCaseDetailStatus = "needs-decision" | "in-review" | "approved" | "monitoring" | "blocked";
export type DecisionCaseDetailStage = "triage" | "impact" | "simulate" | "approve" | "execute" | "measure";

export type DecisionCaseDetail = {
  id: string;
  title: string;
  summary: string;
  owner: { name: string; initials: string; role: string; synthetic: true };
  status: DecisionCaseDetailStatus;
  stage: DecisionCaseDetailStage;
  priority: "P0" | "P1" | "P2";
  sla: { dueAt: string; dueLabel: string; remainingMinutes: number; breachRisk: "low" | "medium" | "high"; synthetic: true };
  value: { amountUsd: number; display: string; type: "margin-protected" | "cash-released" | "revenue-at-risk" | "cost-avoided"; synthetic: true };
  linkedSignalIds: readonly string[];
  nextAction: string;
  updatedAt: string;
  synthetic: true;
};

export const decisionCaseDetails: readonly DecisionCaseDetail[] = [
  {
    id: "case-1042",
    title: "Secure alternate graphite volume",
    summary: "Compare three illustrative qualified suppliers against cost, lead time, and contract exposure.",
    owner: { name: "Maya Rao", initials: "MR", role: "VP Supply Chain", synthetic: true },
    status: "needs-decision",
    stage: "approve",
    priority: "P0",
    sla: { dueAt: "2026-08-27T12:30:00Z", dueLabel: "Due in 2 hours", remainingMinutes: 120, breachRisk: "high", synthetic: true },
    value: { amountUsd: 3_600_000, display: "$3.6M margin protected", type: "margin-protected", synthetic: true },
    linkedSignalIds: ["sig-graphite-capacity"],
    nextAction: "Approve the balanced recovery plan",
    updatedAt: "2026-08-27T10:22:00Z",
    synthetic: true,
  },
  {
    id: "case-1041",
    title: "Reroute priority ocean orders",
    summary: "Select a route plan that protects synthetic customer promises with less than 2% cost impact.",
    owner: { name: "Jon Bell", initials: "JB", role: "Global Logistics Lead", synthetic: true },
    status: "in-review",
    stage: "simulate",
    priority: "P1",
    sla: { dueAt: "2026-08-27T18:00:00Z", dueLabel: "Due today", remainingMinutes: 450, breachRisk: "medium", synthetic: true },
    value: { amountUsd: 1_850_000, display: "$1.85M revenue protected", type: "revenue-at-risk", synthetic: true },
    linkedSignalIds: ["sig-singapore-dwell"],
    nextAction: "Compare the Chennai and Colombo route scenarios",
    updatedAt: "2026-08-27T09:58:00Z",
    synthetic: true,
  },
  {
    id: "case-1038",
    title: "Qualify regional casting capacity",
    summary: "Validate the illustrative technical and commercial fit for a regional source.",
    owner: { name: "Anika Shah", initials: "AS", role: "Category Director", synthetic: true },
    status: "monitoring",
    stage: "impact",
    priority: "P2",
    sla: { dueAt: "2026-09-02T12:00:00Z", dueLabel: "Due in 6 days", remainingMinutes: 8_640, breachRisk: "low", synthetic: true },
    value: { amountUsd: 620_000, display: "$620K annual savings", type: "cost-avoided", synthetic: true },
    linkedSignalIds: ["sig-casting-capacity"],
    nextAction: "Complete engineering capability review",
    updatedAt: "2026-08-27T08:35:00Z",
    synthetic: true,
  },
  {
    id: "case-1035",
    title: "Close EU carbon evidence gaps",
    summary: "Collect illustrative supplier declarations for 12 open evidence packages.",
    owner: { name: "Elena Ward", initials: "EW", role: "Trade Compliance Lead", synthetic: true },
    status: "blocked",
    stage: "execute",
    priority: "P1",
    sla: { dueAt: "2026-08-29T16:00:00Z", dueLabel: "Due in 2 days", remainingMinutes: 3_240, breachRisk: "high", synthetic: true },
    value: { amountUsd: 18_700_000, display: "$18.7M revenue dependent", type: "revenue-at-risk", synthetic: true },
    linkedSignalIds: ["sig-carbon-evidence"],
    nextAction: "Escalate four overdue supplier declarations",
    updatedAt: "2026-08-27T10:02:00Z",
    synthetic: true,
  },
  {
    id: "case-1032",
    title: "Protect industrial controller service stock",
    summary: "Rebalance illustrative regional inventory before lead-time divergence reaches service demand.",
    owner: { name: "Noah Chen", initials: "NC", role: "Service Operations Director", synthetic: true },
    status: "approved",
    stage: "execute",
    priority: "P1",
    sla: { dueAt: "2026-08-28T09:00:00Z", dueLabel: "Execute tomorrow", remainingMinutes: 1_350, breachRisk: "medium", synthetic: true },
    value: { amountUsd: 1_240_000, display: "$1.24M inventory rebalanced", type: "cash-released", synthetic: true },
    linkedSignalIds: ["sig-semiconductor-leadtime"],
    nextAction: "Release approved inter-site transfers",
    updatedAt: "2026-08-27T07:44:00Z",
    synthetic: true,
  },
];

export type ConnectorState = "healthy" | "syncing" | "degraded" | "attention" | "not-connected";

export type ConnectorIssue = {
  id: string;
  severity: "info" | "warning" | "error";
  label: string;
  affectedRecords: number;
  suggestedAction: string;
  synthetic: true;
};

export type ConnectorDetail = {
  id: string;
  name: string;
  category: "ERP" | "PLM" | "TMS" | "MES" | "Quality" | "Documents" | "Supplier" | "External intelligence";
  mode: "read-only" | "read-write" | "stream";
  sync: {
    state: ConnectorState;
    cadence: string;
    lastSuccessfulAt: string | null;
    nextScheduledAt: string | null;
    latencyMinutes: number | null;
    synthetic: true;
  };
  coverage: {
    overallPercent: number;
    mappedEntities: number;
    totalEntities: number;
    criticalFieldPercent: number;
    synthetic: true;
  };
  records: {
    total: number;
    addedLastSync: number;
    updatedLastSync: number;
    rejectedLastSync: number;
    synthetic: true;
  };
  issues: readonly ConnectorIssue[];
  synthetic: true;
};

export const connectorDetails: readonly ConnectorDetail[] = [
  {
    id: "conn-sap",
    name: "SAP S/4HANA",
    category: "ERP",
    mode: "read-only",
    sync: { state: "healthy", cadence: "Every 15 minutes", lastSuccessfulAt: "2026-08-27T10:15:00Z", nextScheduledAt: "2026-08-27T10:30:00Z", latencyMinutes: 4, synthetic: true },
    coverage: { overallPercent: 96, mappedEntities: 42, totalEntities: 44, criticalFieldPercent: 99, synthetic: true },
    records: { total: 1_842_604, addedLastSync: 1_482, updatedLastSync: 6_211, rejectedLastSync: 18, synthetic: true },
    issues: [{ id: "iss-sap-01", severity: "info", label: "18 illustrative records await cost-center mapping", affectedRecords: 18, suggestedAction: "Review proposed mappings", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-teamcenter",
    name: "Teamcenter PLM",
    category: "PLM",
    mode: "read-only",
    sync: { state: "healthy", cadence: "Hourly", lastSuccessfulAt: "2026-08-27T10:00:00Z", nextScheduledAt: "2026-08-27T11:00:00Z", latencyMinutes: 17, synthetic: true },
    coverage: { overallPercent: 91, mappedEntities: 31, totalEntities: 34, criticalFieldPercent: 94, synthetic: true },
    records: { total: 286_440, addedLastSync: 244, updatedLastSync: 982, rejectedLastSync: 7, synthetic: true },
    issues: [{ id: "iss-plm-01", severity: "warning", label: "Illustrative material-grade aliases require approval", affectedRecords: 64, suggestedAction: "Approve material normalization", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-blueyonder",
    name: "Blue Yonder TMS",
    category: "TMS",
    mode: "stream",
    sync: { state: "syncing", cadence: "Near real time", lastSuccessfulAt: "2026-08-27T10:24:00Z", nextScheduledAt: "2026-08-27T10:29:00Z", latencyMinutes: 2, synthetic: true },
    coverage: { overallPercent: 98, mappedEntities: 18, totalEntities: 18, criticalFieldPercent: 97, synthetic: true },
    records: { total: 442_910, addedLastSync: 482, updatedLastSync: 1_822, rejectedLastSync: 3, synthetic: true },
    issues: [],
    synthetic: true,
  },
  {
    id: "conn-mes",
    name: "Plant MES",
    category: "MES",
    mode: "stream",
    sync: { state: "degraded", cadence: "Every 5 minutes", lastSuccessfulAt: "2026-08-27T09:42:00Z", nextScheduledAt: "2026-08-27T10:32:00Z", latencyMinutes: 48, synthetic: true },
    coverage: { overallPercent: 84, mappedEntities: 21, totalEntities: 25, criticalFieldPercent: 88, synthetic: true },
    records: { total: 3_128_405, addedLastSync: 0, updatedLastSync: 0, rejectedLastSync: 1_204, synthetic: true },
    issues: [{ id: "iss-mes-01", severity: "error", label: "Illustrative Pune Plant 02 endpoint is delayed", affectedRecords: 1_204, suggestedAction: "Retry checkpoint from 09:42 UTC", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-quality",
    name: "Quality data lake",
    category: "Quality",
    mode: "read-only",
    sync: { state: "healthy", cadence: "Every 4 hours", lastSuccessfulAt: "2026-08-27T08:00:00Z", nextScheduledAt: "2026-08-27T12:00:00Z", latencyMinutes: 10, synthetic: true },
    coverage: { overallPercent: 89, mappedEntities: 16, totalEntities: 18, criticalFieldPercent: 92, synthetic: true },
    records: { total: 118_604, addedLastSync: 86, updatedLastSync: 241, rejectedLastSync: 12, synthetic: true },
    issues: [{ id: "iss-qual-01", severity: "warning", label: "Illustrative supplier certificate IDs are incomplete", affectedRecords: 12, suggestedAction: "Request certificate identifiers", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-documents",
    name: "Controlled documents",
    category: "Documents",
    mode: "read-only",
    sync: { state: "attention", cadence: "Daily", lastSuccessfulAt: "2026-08-26T22:00:00Z", nextScheduledAt: "2026-08-27T22:00:00Z", latencyMinutes: 750, synthetic: true },
    coverage: { overallPercent: 72, mappedEntities: 13, totalEntities: 18, criticalFieldPercent: 76, synthetic: true },
    records: { total: 48_220, addedLastSync: 112, updatedLastSync: 306, rejectedLastSync: 94, synthetic: true },
    issues: [{ id: "iss-doc-01", severity: "warning", label: "Illustrative OCR confidence is below threshold", affectedRecords: 94, suggestedAction: "Review low-confidence extractions", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-supplier",
    name: "Supplier collaboration portal",
    category: "Supplier",
    mode: "read-write",
    sync: { state: "healthy", cadence: "Every 30 minutes", lastSuccessfulAt: "2026-08-27T10:00:00Z", nextScheduledAt: "2026-08-27T10:30:00Z", latencyMinutes: 8, synthetic: true },
    coverage: { overallPercent: 86, mappedEntities: 24, totalEntities: 28, criticalFieldPercent: 90, synthetic: true },
    records: { total: 72_184, addedLastSync: 54, updatedLastSync: 318, rejectedLastSync: 6, synthetic: true },
    issues: [{ id: "iss-sup-01", severity: "info", label: "Illustrative declarations expire within 30 days", affectedRecords: 28, suggestedAction: "Launch supplier renewal workflow", synthetic: true }],
    synthetic: true,
  },
  {
    id: "conn-intelligence",
    name: "Global signal exchange",
    category: "External intelligence",
    mode: "stream",
    sync: { state: "healthy", cadence: "Continuous", lastSuccessfulAt: "2026-08-27T10:28:00Z", nextScheduledAt: "2026-08-27T10:29:00Z", latencyMinutes: 1, synthetic: true },
    coverage: { overallPercent: 94, mappedEntities: 66, totalEntities: 70, criticalFieldPercent: 97, synthetic: true },
    records: { total: 12_804_221, addedLastSync: 1_804, updatedLastSync: 4_922, rejectedLastSync: 21, synthetic: true },
    issues: [],
    synthetic: true,
  },
];

/** Flat view models used by the production-style case workspace. */
export type DecisionCaseSeverity = "Critical" | "High" | "Medium" | "Opportunity";
export type DecisionCaseStatus = "Open" | "In review" | "Approved" | "Executing" | "Measuring";
export type DecisionCaseStage = "Triage" | "Validate" | "Simulate" | "Approve" | "Execute" | "Measure";

export type DecisionCase = {
  id: string;
  title: string;
  trigger: string;
  severity: DecisionCaseSeverity;
  owner: string;
  ownerInitials: string;
  status: DecisionCaseStatus;
  stage: DecisionCaseStage;
  sla: string;
  value: string;
  updated: string;
  due: string;
  site: string;
  description: string;
  synthetic: true;
};

export const decisionCases: readonly DecisionCase[] = [
  {
    id: "CASE-1042",
    title: "Secure alternate graphite volume",
    trigger: "Graphite capacity tightening",
    severity: "Critical",
    owner: "Maya Rao",
    ownerInitials: "MR",
    status: "In review",
    stage: "Approve",
    sla: "2h remaining",
    value: "$3.6M margin protected",
    updated: "8 min ago",
    due: "Today, 12:30",
    site: "Global battery-material network",
    description: "Compare three illustrative qualified sources against cost, lead time, allocation, and contract exposure.",
    synthetic: true,
  },
  {
    id: "CASE-1041",
    title: "Reroute priority ocean orders",
    trigger: "Singapore dwell-time increase",
    severity: "High",
    owner: "Jon Bell",
    ownerInitials: "JB",
    status: "Open",
    stage: "Simulate",
    sla: "7h remaining",
    value: "$1.85M revenue protected",
    updated: "32 min ago",
    due: "Today, 18:00",
    site: "Pune Plant 02",
    description: "Select an illustrative route plan that protects customer promises while keeping premium freight below 2%.",
    synthetic: true,
  },
  {
    id: "CASE-1038",
    title: "Qualify regional casting capacity",
    trigger: "New precision-casting line",
    severity: "Opportunity",
    owner: "Anika Shah",
    ownerInitials: "AS",
    status: "Open",
    stage: "Validate",
    sla: "6d remaining",
    value: "$620K annual savings",
    updated: "2 hr ago",
    due: "02 Sep, 12:00",
    site: "Chennai supplier cluster",
    description: "Validate the illustrative engineering, quality, capacity, and commercial fit for a regional source.",
    synthetic: true,
  },
  {
    id: "CASE-1035",
    title: "Close EU carbon evidence gaps",
    trigger: "Steel-import evidence update",
    severity: "High",
    owner: "Elena Ward",
    ownerInitials: "EW",
    status: "Executing",
    stage: "Execute",
    sla: "2d remaining",
    value: "$18.7M revenue dependent",
    updated: "24 min ago",
    due: "29 Aug, 16:00",
    site: "EU-bound programs",
    description: "Collect illustrative supplier declarations and resolve the 12 evidence packages still missing required fields.",
    synthetic: true,
  },
  {
    id: "CASE-1032",
    title: "Protect controller service stock",
    trigger: "Controller lead-time divergence",
    severity: "Medium",
    owner: "Noah Chen",
    ownerInitials: "NC",
    status: "Approved",
    stage: "Execute",
    sla: "22h remaining",
    value: "$1.24M inventory rebalanced",
    updated: "3 hr ago",
    due: "Tomorrow, 09:00",
    site: "APAC service network",
    description: "Rebalance illustrative regional inventory before lead-time divergence reaches committed service demand.",
    synthetic: true,
  },
];

/** Flat view models used by data operations and connector cards. */
export type ConnectorStatus = "Healthy" | "Delayed" | "Attention" | "Disconnected";
export type ConnectorMode = "Read-only" | "Bi-directional" | "File ingest";

export type Connector = {
  id: string;
  name: string;
  category: string;
  status: ConnectorStatus;
  lastSync: string;
  coverage: number;
  records: number;
  issues: number;
  mode: ConnectorMode;
  owner: string;
  synthetic: true;
};

export const connectors: readonly Connector[] = [
  { id: "CONN-ERP-01", name: "SAP S/4HANA", category: "ERP", status: "Healthy", lastSync: "4 min ago", coverage: 96, records: 1_842_604, issues: 1, mode: "Read-only", owner: "Enterprise systems", synthetic: true },
  { id: "CONN-PLM-01", name: "Teamcenter PLM", category: "PLM", status: "Healthy", lastSync: "17 min ago", coverage: 91, records: 286_440, issues: 1, mode: "Read-only", owner: "Product engineering", synthetic: true },
  { id: "CONN-TMS-01", name: "Blue Yonder TMS", category: "Transportation", status: "Healthy", lastSync: "2 min ago", coverage: 98, records: 442_910, issues: 0, mode: "Bi-directional", owner: "Global logistics", synthetic: true },
  { id: "CONN-MES-01", name: "Plant MES", category: "Manufacturing", status: "Delayed", lastSync: "48 min ago", coverage: 84, records: 3_128_405, issues: 1, mode: "Read-only", owner: "Plant operations", synthetic: true },
  { id: "CONN-QLT-01", name: "Quality data lake", category: "Quality", status: "Healthy", lastSync: "2 hr ago", coverage: 89, records: 118_604, issues: 1, mode: "Read-only", owner: "Supplier quality", synthetic: true },
  { id: "CONN-DOC-01", name: "Controlled documents", category: "Documents", status: "Attention", lastSync: "12 hr ago", coverage: 72, records: 48_220, issues: 94, mode: "File ingest", owner: "Data stewardship", synthetic: true },
  { id: "CONN-SUP-01", name: "Supplier collaboration portal", category: "Supplier", status: "Healthy", lastSync: "8 min ago", coverage: 86, records: 72_184, issues: 28, mode: "Bi-directional", owner: "Supplier collaboration", synthetic: true },
  { id: "CONN-EXT-01", name: "Global signal exchange", category: "External intelligence", status: "Healthy", lastSync: "1 min ago", coverage: 94, records: 12_804_221, issues: 0, mode: "Read-only", owner: "Intelligence operations", synthetic: true },
];

export type Notification = {
  id: string;
  kind: "signal" | "case" | "data" | "approval" | "system";
  severity: "info" | "success" | "warning" | "critical";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionLabel: string;
  destination: Screen;
  entityId?: string;
  synthetic: true;
};

export const notifications: readonly Notification[] = [
  { id: "note-001", kind: "approval", severity: "critical", title: "Graphite decision due in two hours", body: "The illustrative balanced recovery case is ready for approval.", createdAt: "2026-08-27T10:22:00Z", read: false, actionLabel: "Review case", destination: "cases", entityId: "case-1042", synthetic: true },
  { id: "note-002", kind: "data", severity: "warning", title: "Plant MES sync is delayed", body: "Illustrative production telemetry is 48 minutes behind its target cadence.", createdAt: "2026-08-27T10:18:00Z", read: false, actionLabel: "Open data operations", destination: "data", entityId: "conn-mes", synthetic: true },
  { id: "note-003", kind: "signal", severity: "info", title: "New casting opportunity matched", body: "Three illustrative product families meet the preliminary capability profile.", createdAt: "2026-08-27T08:35:00Z", read: true, actionLabel: "Open signal", destination: "radar", entityId: "sig-casting-capacity", synthetic: true },
  { id: "note-004", kind: "case", severity: "success", title: "Controller inventory plan approved", body: "The illustrative plan is ready for execution tracking.", createdAt: "2026-08-27T07:44:00Z", read: true, actionLabel: "Track execution", destination: "cases", entityId: "case-1032", synthetic: true },
  { id: "note-005", kind: "system", severity: "info", title: "Evidence index refreshed", body: "All illustrative signal provenance and correction records were re-indexed.", createdAt: "2026-08-27T06:15:00Z", read: true, actionLabel: "View trust network", destination: "trust", synthetic: true },
];

export type Permission =
  | "signals:view"
  | "cases:manage"
  | "scenarios:run"
  | "decisions:approve"
  | "data:manage"
  | "evidence:share"
  | "audit:view";

export type RoleProfile = {
  id: "executive" | "planner" | "data-steward" | "risk-compliance";
  name: string;
  jobTitle: string;
  initials: string;
  landingScreen: Screen;
  focus: string;
  permissions: readonly Permission[];
  synthetic: true;
};

export const roleProfiles: readonly RoleProfile[] = [
  { id: "executive", name: "Maya Rao", jobTitle: "VP Supply Chain", initials: "MR", landingScreen: "command", focus: "Value at risk, decisions due, and realized outcomes", permissions: ["signals:view", "cases:manage", "scenarios:run", "decisions:approve", "evidence:share", "audit:view"], synthetic: true },
  { id: "planner", name: "Jon Bell", jobTitle: "Network Planning Lead", initials: "JB", landingScreen: "cases", focus: "Service, feasible recovery plans, and execution", permissions: ["signals:view", "cases:manage", "scenarios:run", "audit:view"], synthetic: true },
  { id: "data-steward", name: "Priya Menon", jobTitle: "Supply Data Steward", initials: "PM", landingScreen: "data", focus: "Connector health, mappings, lineage, and data quality", permissions: ["signals:view", "data:manage", "audit:view"], synthetic: true },
  { id: "risk-compliance", name: "Elena Ward", jobTitle: "Risk and Compliance Lead", initials: "EW", landingScreen: "trust", focus: "Evidence readiness, permissions, and policy exposure", permissions: ["signals:view", "cases:manage", "evidence:share", "audit:view"], synthetic: true },
];

export type ScenarioStrategy =
  | "Balanced recovery"
  | "Fastest recovery"
  | "Lowest cash impact"
  | "Service first";

export type ScenarioInput = {
  /** Percent of baseline supply unavailable, from 0 to 100. */
  supplyReduction: number;
  /** Length of the illustrative disruption, in weeks. */
  disruptionWeeks: number;
  /** Maximum response spend, expressed in USD millions. */
  responseBudget: number;
  /** Target on-time/in-full service percentage. */
  serviceTarget: number;
  strategy: ScenarioStrategy;
};

export type ScenarioAction = {
  id: string;
  label: string;
  timing: string;
  owner: string;
  spendUsdMillions: number;
  synthetic: true;
};

export type ScenarioResult = {
  simulationId: string;
  normalizedInput: ScenarioInput;
  grossExposureUsdMillions: number;
  marginProtectedUsdMillions: number;
  incrementalCostUsdMillions: number;
  cashImpactUsdMillions: number;
  serviceWithoutActionPercent: number;
  projectedOtifPercent: number;
  residualRiskPercent: number;
  riskReductionPercent: number;
  carbonDeltaPercent: number;
  resilienceScore: number;
  budgetUtilizationPercent: number;
  recommendedActions: readonly ScenarioAction[];
  warnings: readonly string[];
  explanation: readonly string[];
  synthetic: true;
};

type StrategyProfile = {
  slug: string;
  effectiveness: number;
  spendIntensity: number;
  serviceBias: number;
  carbonBias: number;
};

const STRATEGY_PROFILES: Record<ScenarioStrategy, StrategyProfile> = {
  "Balanced recovery": { slug: "balanced", effectiveness: 0.82, spendIntensity: 0.23, serviceBias: 1, carbonBias: 0.7 },
  "Fastest recovery": { slug: "fastest", effectiveness: 0.91, spendIntensity: 0.36, serviceBias: 1.12, carbonBias: 1.45 },
  "Lowest cash impact": { slug: "low-cash", effectiveness: 0.67, spendIntensity: 0.13, serviceBias: 0.86, carbonBias: 0.45 },
  "Service first": { slug: "service", effectiveness: 0.88, spendIntensity: 0.31, serviceBias: 1.2, carbonBias: 1.1 },
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));

const round = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Calculates deterministic, illustrative scenario outputs for the front-end
 * prototype. It performs no I/O, reads no ambient state, uses no randomness,
 * and is not an operational recommendation engine.
 */
export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const normalizedInput: ScenarioInput = {
    supplyReduction: round(clamp(input.supplyReduction, 0, 100), 1),
    disruptionWeeks: round(clamp(input.disruptionWeeks, 1, 52), 1),
    responseBudget: round(clamp(input.responseBudget, 0, 25), 2),
    serviceTarget: round(clamp(input.serviceTarget, 70, 100), 1),
    strategy: STRATEGY_PROFILES[input.strategy] ? input.strategy : "Balanced recovery",
  };

  const profile = STRATEGY_PROFILES[normalizedInput.strategy];
  const reductionRatio = normalizedInput.supplyReduction / 100;
  const durationRatio = normalizedInput.disruptionWeeks / 14;
  const stressIndex = reductionRatio * Math.min(durationRatio, 2.5);
  const targetPressure = Math.max(0, normalizedInput.serviceTarget - 90) * 0.08;
  const grossExposure = Math.max(0.25, 1.4 + stressIndex * 8.6 + targetPressure);
  const estimatedBudgetNeed = Math.max(0.35, grossExposure * profile.spendIntensity);
  const effectiveSpend = Math.min(normalizedInput.responseBudget, estimatedBudgetNeed);
  const fundingRatio = clamp(effectiveSpend / estimatedBudgetNeed, 0, 1);
  const durationPenalty = clamp((normalizedInput.disruptionWeeks - 16) * 0.012, 0, 0.2);
  const mitigationEffectiveness = clamp(
    profile.effectiveness * (0.58 + fundingRatio * 0.42) - durationPenalty,
    0.12,
    0.97,
  );

  const marginProtected = grossExposure * mitigationEffectiveness;
  const serviceLoss = Math.min(28, normalizedInput.supplyReduction * durationRatio * 0.22);
  const serviceWithoutAction = clamp(normalizedInput.serviceTarget - serviceLoss, 55, 99.5);
  const serviceRecovered = serviceLoss * mitigationEffectiveness * profile.serviceBias;
  const projectedOtif = clamp(serviceWithoutAction + serviceRecovered, 55, 99.5);
  const residualRisk = clamp((1 - mitigationEffectiveness) * 100, 3, 88);
  const riskReduction = 100 - residualRisk;
  const inventoryCash = effectiveSpend * (profile.slug === "low-cash" ? 0.18 : 0.34);
  const cashImpact = -(effectiveSpend + inventoryCash);
  const carbonDelta =
    (normalizedInput.strategy === "Lowest cash impact" ? -0.7 : 0.8) +
    normalizedInput.supplyReduction * 0.05 * profile.carbonBias;
  const resilienceScore = clamp(
    58 + riskReduction * 0.31 + Math.max(0, projectedOtif - 90) * 1.3 - Math.max(0, carbonDelta) * 0.5,
    0,
    100,
  );
  const budgetUtilization = normalizedInput.responseBudget === 0
    ? 0
    : (effectiveSpend / normalizedInput.responseBudget) * 100;

  const alternateShare = round(clamp(normalizedInput.supplyReduction * mitigationEffectiveness * 0.58, 4, 34), 1);
  const inventoryTransfer = round(clamp(normalizedInput.supplyReduction * durationRatio * 0.32, 2, 28), 1);
  const priorityOrders = Math.round(clamp(normalizedInput.serviceTarget - 70, 4, 30));
  const actionSpend = [0.54, 0.27, 0.19].map((share) => round(effectiveSpend * share, 2));

  const recommendedActions: readonly ScenarioAction[] = [
    {
      id: "action-alternate-volume",
      label: `Reserve ${alternateShare}% illustrative alternate volume`,
      timing: normalizedInput.strategy === "Fastest recovery" ? "Within 48 hours" : "Week 1",
      owner: "Category management",
      spendUsdMillions: actionSpend[0],
      synthetic: true,
    },
    {
      id: "action-inventory-transfer",
      label: `Reallocate ${inventoryTransfer}t illustrative inventory`,
      timing: "Week 1",
      owner: "Network planning",
      spendUsdMillions: actionSpend[1],
      synthetic: true,
    },
    {
      id: "action-demand-priority",
      label: `Prioritize ${priorityOrders} illustrative customer orders`,
      timing: `Weeks 2-${Math.max(3, Math.ceil(normalizedInput.disruptionWeeks / 2))}`,
      owner: "Customer operations",
      spendUsdMillions: actionSpend[2],
      synthetic: true,
    },
  ];

  const warnings: string[] = [];
  if (normalizedInput.responseBudget < estimatedBudgetNeed * 0.75) {
    warnings.push("Illustrative response budget funds less than 75% of the estimated mitigation need.");
  }
  if (projectedOtif < normalizedInput.serviceTarget) {
    warnings.push(`Illustrative projected OTIF remains ${round(normalizedInput.serviceTarget - projectedOtif, 1)} points below target.`);
  }
  if (normalizedInput.disruptionWeeks > 20) {
    warnings.push("Illustrative disruption duration exceeds the validated prototype planning horizon.");
  }
  if (carbonDelta > 4) {
    warnings.push("Illustrative expedited actions increase modeled transport emissions by more than 4%.");
  }

  return {
    simulationId: `SYN-${profile.slug}-${normalizedInput.supplyReduction}-${normalizedInput.disruptionWeeks}-${normalizedInput.responseBudget}-${normalizedInput.serviceTarget}`,
    normalizedInput,
    grossExposureUsdMillions: round(grossExposure),
    marginProtectedUsdMillions: round(marginProtected),
    incrementalCostUsdMillions: round(effectiveSpend),
    cashImpactUsdMillions: round(cashImpact),
    serviceWithoutActionPercent: round(serviceWithoutAction, 1),
    projectedOtifPercent: round(projectedOtif, 1),
    residualRiskPercent: round(residualRisk, 1),
    riskReductionPercent: round(riskReduction, 1),
    carbonDeltaPercent: round(carbonDelta, 1),
    resilienceScore: Math.round(resilienceScore),
    budgetUtilizationPercent: round(budgetUtilization, 1),
    recommendedActions,
    warnings,
    explanation: [
      `Synthetic exposure is driven by a ${normalizedInput.supplyReduction}% reduction over ${normalizedInput.disruptionWeeks} weeks.`,
      `${normalizedInput.strategy} weights mitigation effectiveness, spend, service, and carbon differently.`,
      `The illustrative plan uses ${round(effectiveSpend, 2)}M USD of a ${normalizedInput.responseBudget}M USD response budget.`,
    ],
    synthetic: true,
  };
}
