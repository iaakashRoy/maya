import type { ProjectAppId, WorkspaceProject } from "./workspace-model";

export const simulationDisclaimer =
  "Public-information-inspired simulation. All operational records, suppliers, prices, volumes, forecasts, events, and optimization results are synthetic. This is not an actual client engagement.";

export type CaseStudyDataset = {
  name: string;
  source: string;
  grain: string;
  rows: string;
  freshness: string;
  quality: number;
  variables: readonly string[];
};

export type SupplyChainStage = {
  id: string;
  sequence: number;
  label: string;
  description: string;
};

export type SupplyChainNode = {
  id: string;
  stageId: string;
  label: string;
  assetType: string;
  geography: string;
  country: string;
  tier: "Primary" | "Alternate" | "Contingency";
  role: string;
  capacity: string;
  throughput: string;
  annualValue: string;
  utilization: number;
  leadTime: number;
  concentration: number;
  riskScore: number;
  confidence: number;
  freshness: string;
  sourceClass: string;
  evidenceRef: string;
  status: "stable" | "watch" | "constrained";
};

export type SupplyChainEdge = {
  id: string;
  from: string;
  to: string;
  relationship: string;
  volume: string;
  value: string;
  share: number;
  leadTime: number;
  mode: string;
  riskScore: number;
  evidenceRef: string;
};

export type SupplyChainCheckpoint = {
  id: string;
  stageId: string;
  title: string;
  category: "Capacity" | "Concentration";
  severity: "critical" | "high" | "moderate" | "low";
  status: "breached" | "near limit" | "within guardrail";
  observed: number;
  target: number;
  unit: string;
  trend: string;
  owner: string;
  cadence: string;
  lastObserved: string;
  trigger: string;
  downstreamImpact: string;
  response: string;
  evidenceRef: string;
};

export type SupplyChainSignal = {
  id: string;
  stageId: string;
  label: string;
  value: string;
  delta: string;
  status: "stable" | "watch" | "critical";
  observedAt: string;
  evidenceRef: string;
};

export type SupplyChainNetwork = {
  unit: string;
  stages: readonly SupplyChainStage[];
  nodes: readonly SupplyChainNode[];
  edges: readonly SupplyChainEdge[];
  checkpoints: readonly SupplyChainCheckpoint[];
  signals: readonly SupplyChainSignal[];
};

export type CaseStudyProfile = {
  projectId: string;
  company: string;
  project: string;
  product: string;
  publicContext: string;
  publicSource: { label: string; url: string; asOf: string };
  shock: string;
  trigger: string;
  decision: string;
  response: string;
  baseline: string;
  resilient: string;
  confidence: number;
  p50: string;
  p90: string;
  p95: string;
  worstCase: string;
  cvar: string;
  hardConstraints: readonly string[];
  methods: readonly string[];
  apps: readonly ProjectAppId[];
  datasets: readonly CaseStudyDataset[];
  supplyChain: SupplyChainNetwork;
  timeline: readonly {
    time: string;
    actor: string;
    event: string;
    state: "signal" | "analysis" | "decision" | "review";
  }[];
};

type ProjectSeed = Omit<WorkspaceProject, "origin" | "simulation"> & {
  publicContext: string;
  publicSource: CaseStudyProfile["publicSource"];
  product: string;
  shock: string;
  trigger: string;
  decision: string;
  response: string;
  resilience: {
    baseline: string;
    resilient: string;
    confidence: number;
    p50: string;
    p90: string;
    p95: string;
    worstCase: string;
    cvar: string;
  };
  hardConstraints: readonly string[];
  datasets: readonly CaseStudyDataset[];
};

const evidenceMetrics = (
  code: string,
  values: readonly [
    string,
    string,
    string,
    "healthy" | "watch" | "critical" | "opportunity",
  ][],
) =>
  values.map(([label, value, detail, tone], index) => ({
    label,
    value,
    detail,
    tone,
    evidenceRef: `EV-${code.slice(2)}-${String(index + 1).padStart(2, "0")}`,
  }));

const dataset = (
  name: string,
  source: string,
  grain: string,
  rows: string,
  freshness: string,
  quality: number,
  variables: readonly string[],
): CaseStudyDataset => ({
  name,
  source,
  grain,
  rows,
  freshness,
  quality,
  variables,
});

const seeds: readonly ProjectSeed[] = [
  {
    id: "apple-launch-continuity",
    sectorId: "consumer-electronics",
    sector: "Consumer Electronics",
    clientId: "apple",
    client: "Apple",
    name: "Launch Continuity",
    code: "P-001",
    health: "critical",
    stage: "Contain launch exposure",
    currency: "USD",
    regions: "East Asia · India · US · Europe",
    owner: "Maya Chen",
    classification: "Simulation · public context only",
    dataResidency: "US + EU + India partitions",
    problem:
      "Protect a new-device launch across advanced chips, rare-earth magnets, cover glass, batteries, final assembly, and constrained transport.",
    outcome:
      "Keep priority launch markets above the governed service floor while reducing single-corridor and single-process dependency.",
    counts: {
      entities: "18,640",
      relationships: "72,910",
      observations: "4.82M",
      documents: "3,480",
      events: "1.26M",
      claims: "41.8K",
      decisions: 24,
      runs: 168,
      apps: 10,
      agents: 12,
      experts: 16,
    },
    metrics: evidenceMetrics("P-001", [
      [
        "Launch value exposed",
        "$1.84B",
        "CVaR95 across 2,000 deterministic scenario draws",
        "critical",
      ],
      [
        "P95 market service",
        "91.6%",
        "Against a 97.0% governed floor",
        "critical",
      ],
      [
        "Critical-path coverage",
        "1.18×",
        "Qualified capacity across chips, magnets, and glass",
        "watch",
      ],
      [
        "Resilient plan value",
        "$612M",
        "Contribution protected after mitigation",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-008",
        "L2-013",
        "L2-027",
        "L2-034",
      ],
      l1: [
        "L1-001",
        "L1-006",
        "L1-008",
        "L1-010",
        "L1-019",
        "L1-041",
        "L1-054",
      ],
      l0: [
        "L0-001",
        "L0-029",
        "L0-030",
        "L0-044",
        "L0-057",
        "L0-061",
        "L0-071",
        "L0-155",
        "L0-202",
        "L0-217",
        "L0-275",
        "L0-299",
        "L0-445",
      ],
    },
    methodCodes: [
      "M-02",
      "M-05",
      "M-06",
      "M-13",
      "M-16",
      "M-20",
      "M-22",
      "M-23",
      "M-24",
    ],
    product: "Flagship smartphone and wearable launch portfolio",
    publicContext:
      "Apple publicly describes a multi-country supply chain spanning materials, components, manufacturing, logistics, use, and recovery.",
    publicSource: {
      label: "Apple Supply Chain",
      url: "https://www.apple.com/supply-chain/",
      asOf: "Public page reviewed Sep 2026",
    },
    shock:
      "Taiwan Strait escalation + rare-earth export controls + trans-Pacific airfreight scarcity",
    trigger:
      "Two semiconductor lots miss release, magnet lead time rises 21 days, and available premium freight falls 38%.",
    decision:
      "Allocate constrained components and assembly capacity by market, product, margin, qualification, carbon, and launch promise.",
    response:
      "Reserve qualified India assembly headroom, split magnet supply, defer two low-priority configurations, and protect launch-market air capacity.",
    resilience: {
      baseline: "91.6% P95 launch service",
      resilient: "97.4% P95 launch service",
      confidence: 88,
      p50: "98.2%",
      p90: "97.7%",
      p95: "97.4%",
      worstCase: "94.1%",
      cvar: "$612M protected",
    },
    hardConstraints: [
      "No unqualified component source",
      "Market service ≥97% for priority launch countries",
      "No export-control violation",
      "Carbon uplift ≤4%",
    ],
    datasets: [
      dataset(
        "Launch demand contract",
        "Synthetic S&OP event stream",
        "SKU × market × week",
        "684K",
        "18 sec",
        98,
        ["L0-001", "L0-008", "L0-016"],
      ),
      dataset(
        "Product and component genealogy",
        "Synthetic PLM snapshot",
        "Parent part × child part × revision",
        "1.46M",
        "3 min",
        97,
        ["L0-028", "L0-029", "L0-031"],
      ),
      dataset(
        "Supplier capacity and qualification",
        "Synthetic procurement + QMS",
        "Part × supplier-site × week",
        "428K",
        "42 sec",
        95,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Assembly and yield telemetry",
        "Synthetic MES/IoT replay",
        "Line × operation × 15 min",
        "1.82M",
        "6 sec",
        96,
        ["L0-071", "L0-079", "L0-088"],
      ),
      dataset(
        "Global movement events",
        "Synthetic TMS + licensed-feed shape",
        "Shipment × event time",
        "412K",
        "12 sec",
        94,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Policy and disruption register",
        "Approved public-context fixture",
        "Country × policy × effective date",
        "18.4K",
        "15 min",
        89,
        ["L0-371", "L0-394", "L0-445"],
      ),
    ],
  },
  {
    id: "cocacola-water-to-shelf",
    sectorId: "beverage-bottling",
    sector: "Beverage & Bottling",
    clientId: "coca-cola",
    client: "Coca-Cola",
    name: "Water-to-Shelf Availability",
    code: "P-002",
    health: "critical",
    stage: "Rebalance bottling network",
    currency: "USD",
    regions: "Mexico · Brazil · US · Europe",
    owner: "Elena Martínez",
    classification: "Simulation · public context only",
    dataResidency: "Regional market partitions",
    problem:
      "Maintain beverage availability across water-constrained plants, bottlers, package formats, ingredients, and route-to-market capacity.",
    outcome:
      "Protect essential volume and customer service while staying inside water, quality, package, and working-capital limits.",
    counts: {
      entities: "22,180",
      relationships: "86,420",
      observations: "6.41M",
      documents: "2,140",
      events: "2.92M",
      claims: "38.6K",
      decisions: 21,
      runs: 142,
      apps: 9,
      agents: 12,
      experts: 15,
    },
    metrics: evidenceMetrics("P-002", [
      [
        "Volume at risk",
        "38.6M cases",
        "P90 twelve-week production shortfall",
        "critical",
      ],
      [
        "Water-constrained output",
        "27%",
        "Share of planned volume inside restricted basins",
        "critical",
      ],
      [
        "Package flexibility",
        "81%",
        "Demand convertible across returnable glass, PET, and cans",
        "watch",
      ],
      [
        "Service recovered",
        "96.8%",
        "P95 customer fill after network rebalance",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-003",
        "L2-006",
        "L2-007",
        "L2-019",
        "L2-021",
        "L2-027",
      ],
      l1: ["L1-001", "L1-010", "L1-014", "L1-019", "L1-030", "L1-037"],
      l0: [
        "L0-001",
        "L0-026",
        "L0-071",
        "L0-101",
        "L0-121",
        "L0-131",
        "L0-155",
        "L0-187",
        "L0-217",
        "L0-275",
      ],
    },
    methodCodes: [
      "M-02",
      "M-03",
      "M-06",
      "M-07",
      "M-13",
      "M-16",
      "M-17",
      "M-20",
      "M-21",
      "M-24",
    ],
    product:
      "Sparkling beverages, water, juice, PET, cans, and returnable glass",
    publicContext:
      "Coca-Cola identifies water, agricultural ingredients, packaging, energy, transport, weather, and political instability as supply risks.",
    publicSource: {
      label: "The Coca-Cola Company 2025 Form 10-K",
      url: "https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0001104659-26-028252/0001104659-26-028252.pdf",
      asOf: "Filed Feb 2026",
    },
    shock:
      "Severe drought restrictions + aluminium premium spike + fuel blockade",
    trigger:
      "Available process water drops 32% at two plants while can supply falls 18% and two distribution corridors close.",
    decision:
      "Select plant, formula, package, inventory, and customer allocation by basin, bottler, margin, availability, and water intensity.",
    response:
      "Shift priority SKUs to returnable glass and PET, transfer concentrate, activate two bottlers, and reserve water for essential high-velocity lines.",
    resilience: {
      baseline: "88.9% P95 fill rate",
      resilient: "96.8% P95 fill rate",
      confidence: 90,
      p50: "98.1%",
      p90: "97.2%",
      p95: "96.8%",
      worstCase: "93.5%",
      cvar: "$184M revenue protected",
    },
    hardConstraints: [
      "Basin withdrawal caps",
      "Food-safety release",
      "Minimum essential-SKU availability",
      "Bottler and market authorization",
    ],
    datasets: [
      dataset(
        "Customer depletion signals",
        "Synthetic retailer + bottler feed",
        "SKU × outlet cluster × day",
        "2.16M",
        "24 sec",
        96,
        ["L0-001", "L0-016", "L0-187"],
      ),
      dataset(
        "Water and utility telemetry",
        "Synthetic SCADA/IoT replay",
        "Plant × meter × 5 min",
        "1.84M",
        "5 sec",
        98,
        ["L0-071", "L0-121", "L0-131"],
      ),
      dataset(
        "Package and ingredient supply",
        "Synthetic ERP/procurement",
        "Material × supplier-site × week",
        "684K",
        "31 sec",
        95,
        ["L0-044", "L0-061", "L0-064"],
      ),
      dataset(
        "Bottling capacity",
        "Synthetic MES plan",
        "Line × SKU × shift",
        "912K",
        "14 sec",
        97,
        ["L0-071", "L0-079", "L0-088"],
      ),
      dataset(
        "Route-to-market events",
        "Synthetic TMS/mobile handoff",
        "Load × stop × event",
        "806K",
        "9 sec",
        94,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Basin and weather context",
        "Approved public-context fixture",
        "Basin × day × scenario",
        "12.8K",
        "30 min",
        87,
        ["L0-371", "L0-410", "L0-445"],
      ),
    ],
  },
  {
    id: "gucci-traceable-collection",
    sectorId: "luxury-fashion",
    sector: "Luxury Fashion",
    clientId: "gucci",
    client: "Gucci",
    name: "Traceable Seasonal Collection",
    code: "P-003",
    health: "watch",
    stage: "Verify origin and launch",
    currency: "EUR",
    regions: "Italy · France · Turkey · Asia · US",
    owner: "Sofia Bianchi",
    classification: "Simulation · public context only",
    dataResidency: "EU primary",
    problem:
      "Deliver a seasonal collection with defensible leather, cotton, gold, and diamond provenance across small suppliers and constrained artisans.",
    outcome:
      "Release every selected SKU with complete origin, quality, and human-rights evidence before the launch gate.",
    counts: {
      entities: "14,920",
      relationships: "63,500",
      observations: "2.38M",
      documents: "8,420",
      events: "486K",
      claims: "62.4K",
      decisions: 18,
      runs: 124,
      apps: 9,
      agents: 12,
      experts: 17,
    },
    metrics: evidenceMetrics("P-003", [
      [
        "Launch value gated",
        "€286M",
        "Wholesale and retail value tied to incomplete evidence",
        "critical",
      ],
      [
        "Material traceability",
        "93.7%",
        "Origin-to-finished-SKU claim coverage",
        "watch",
      ],
      [
        "Artisan capacity",
        "89%",
        "Qualified hours versus peak requirement",
        "watch",
      ],
      [
        "On-time release",
        "97.2%",
        "P90 service after evidence-led resequencing",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: ["L2-002", "L2-003", "L2-007", "L2-013", "L2-021", "L2-031"],
      l1: ["L1-004", "L1-006", "L1-010", "L1-014", "L1-051", "L1-054"],
      l0: [
        "L0-025",
        "L0-030",
        "L0-044",
        "L0-051",
        "L0-057",
        "L0-071",
        "L0-101",
        "L0-131",
        "L0-145",
        "L0-371",
      ],
    },
    methodCodes: [
      "M-04",
      "M-06",
      "M-08",
      "M-15",
      "M-16",
      "M-20",
      "M-21",
      "M-22",
      "M-25",
      "M-29",
    ],
    product: "Leather goods, footwear, jewellery, and seasonal ready-to-wear",
    publicContext:
      "Kering reports ongoing work on material traceability, leather origins, cotton analysis, precious materials, and preparation for evolving due-diligence requirements.",
    publicSource: {
      label: "Kering 2025 Universal Registration Document",
      url: "https://www.kering.com/api/download-file/?path=02_Universal_Registration_Document_2025_EN_216d1c494b.pdf",
      asOf: "Published 2026",
    },
    shock: "Origin-evidence failure + artisan capacity loss + Red Sea delay",
    trigger:
      "A tannery claim is invalidated, a workshop loses 22% capacity, and inbound trims slip 16 days.",
    decision:
      "Choose material lots, workshops, SKU sequence, markets, and transport without weakening provenance or quality gates.",
    response:
      "Quarantine seven lots, switch 18 SKUs to fully evidenced alternatives, reserve qualified artisan capacity, and resequence regional launch drops.",
    resilience: {
      baseline: "82.4% evidence-complete launch",
      resilient: "97.2% on-time governed release",
      confidence: 92,
      p50: "98.0%",
      p90: "97.5%",
      p95: "96.9%",
      worstCase: "94.2%",
      cvar: "€214M release value protected",
    },
    hardConstraints: [
      "Complete origin evidence",
      "No failed human-rights gate",
      "Quality genealogy intact",
      "Brand launch-date commitments",
    ],
    datasets: [
      dataset(
        "Collection demand and launch calendar",
        "Synthetic merchandising plan",
        "SKU × market × launch wave",
        "318K",
        "2 min",
        96,
        ["L0-001", "L0-008", "L0-016"],
      ),
      dataset(
        "Material provenance ledger",
        "Synthetic supplier-document graph",
        "Lot × origin × transformation",
        "742K",
        "12 min",
        94,
        ["L0-030", "L0-051", "L0-371"],
      ),
      dataset(
        "Supplier and workshop capacity",
        "Synthetic SRM/workshop portal",
        "Skill × workshop × week",
        "286K",
        "1 min",
        92,
        ["L0-057", "L0-101", "L0-102"],
      ),
      dataset(
        "Product genealogy",
        "Synthetic PLM/QMS",
        "SKU × material lot × process",
        "624K",
        "6 min",
        98,
        ["L0-028", "L0-131", "L0-145"],
      ),
      dataset(
        "Inbound and store movements",
        "Synthetic TMS handoff feed",
        "Shipment × custody event",
        "392K",
        "16 sec",
        95,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Policy and due-diligence context",
        "Approved public-context fixture",
        "Requirement × material × market",
        "18.1K",
        "1 hr",
        90,
        ["L0-371", "L0-394", "L0-410"],
      ),
    ],
  },
  {
    id: "tata-vehicle-continuity",
    sectorId: "automotive-industrial",
    sector: "Automotive & Industrial",
    clientId: "tata-motors",
    client: "Tata Motors",
    name: "Vehicle Programme Continuity",
    code: "P-004",
    health: "watch",
    stage: "Commit cross-plant response",
    currency: "INR",
    regions: "India · UK · Europe · Middle East",
    owner: "Arjun Desai",
    classification: "Simulation · public context only",
    dataResidency: "India + UK + EU",
    problem:
      "Protect EV and commercial-vehicle output across semiconductors, aluminium, batteries, tier suppliers, ports, and dealer-service commitments.",
    outcome:
      "Meet priority vehicle and service demand using an executable BOM, supplier, plant, and logistics response.",
    counts: {
      entities: "24,760",
      relationships: "104,200",
      observations: "7.18M",
      documents: "4,920",
      events: "2.14M",
      claims: "48.2K",
      decisions: 23,
      runs: 156,
      apps: 10,
      agents: 12,
      experts: 18,
    },
    metrics: evidenceMetrics("P-004", [
      [
        "Programme value exposed",
        "₹4,860Cr",
        "P90 contribution and penalty exposure",
        "critical",
      ],
      [
        "Semiconductor coverage",
        "83%",
        "Governed twelve-week requirement",
        "watch",
      ],
      [
        "Plant plan attainment",
        "94.6%",
        "P90 after BOM and site rebalance",
        "watch",
      ],
      [
        "Dealer service protected",
        "98.1%",
        "Priority vehicle and service-parts fill",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-005",
        "L2-013",
        "L2-021",
        "L2-027",
      ],
      l1: ["L1-001", "L1-006", "L1-010", "L1-012", "L1-014", "L1-032"],
      l0: [
        "L0-001",
        "L0-029",
        "L0-044",
        "L0-057",
        "L0-061",
        "L0-071",
        "L0-079",
        "L0-088",
        "L0-155",
        "L0-217",
        "L0-275",
      ],
    },
    methodCodes: [
      "M-02",
      "M-05",
      "M-06",
      "M-08",
      "M-13",
      "M-17",
      "M-20",
      "M-22",
      "M-24",
      "M-27",
    ],
    product: "Passenger EV, commercial vehicles, and service parts",
    publicContext:
      "Tata Motors describes supplier collaboration, sustainability assessment, resilience, and cross-functional supply-chain programmes in its annual reporting.",
    publicSource: {
      label: "Tata Motors 2024-25 annual-report archive",
      url: "https://cv.tatamotors.com/annual-reports-archive",
      asOf: "FY 2024-25",
    },
    shock:
      "Semiconductor allocation cut + Red Sea congestion + tier-two insolvency",
    trigger:
      "Controller supply falls 24%, transit expands 12 days, and a casting sub-tier enters financial distress.",
    decision:
      "Choose BOM substitutions, supplier awards, plant allocation, service-parts reservation, and expedited lanes.",
    response:
      "Approve two validated controller alternates, rebalance Pune/Sanand production, protect service parts, and use rail-ocean routing for noncritical trims.",
    resilience: {
      baseline: "86.8% P95 programme attainment",
      resilient: "94.6% P95 attainment",
      confidence: 89,
      p50: "96.1%",
      p90: "95.0%",
      p95: "94.6%",
      worstCase: "91.2%",
      cvar: "₹3,420Cr value protected",
    },
    hardConstraints: [
      "Homologated BOM combinations only",
      "Safety-stock floor for service parts",
      "Plant tooling compatibility",
      "Working-capital authority",
    ],
    datasets: [
      dataset(
        "Vehicle and service demand",
        "Synthetic S&OP/dealer feed",
        "Model × market × week",
        "1.28M",
        "28 sec",
        97,
        ["L0-001", "L0-008", "L0-275"],
      ),
      dataset(
        "Vehicle BOM and alternates",
        "Synthetic PLM",
        "Vehicle × part × revision",
        "2.42M",
        "4 min",
        98,
        ["L0-028", "L0-029", "L0-031"],
      ),
      dataset(
        "Supplier award and capacity",
        "Synthetic SRM",
        "Part × supplier-site × week",
        "846K",
        "33 sec",
        94,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Plant schedule and telemetry",
        "Synthetic MES/IoT replay",
        "Line × vehicle × shift",
        "1.74M",
        "8 sec",
        96,
        ["L0-071", "L0-079", "L0-088"],
      ),
      dataset(
        "Inbound and dealer logistics",
        "Synthetic TMS",
        "Part/load × event",
        "874K",
        "14 sec",
        95,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Supplier financial and policy context",
        "Approved public-context fixture",
        "Supplier × event × scenario",
        "22.4K",
        "20 min",
        88,
        ["L0-371", "L0-410", "L0-445"],
      ),
    ],
  },
  {
    id: "tesla-closed-loop-battery",
    sectorId: "ev-energy-storage",
    sector: "EV & Energy Storage",
    clientId: "tesla",
    client: "Tesla",
    name: "Closed-Loop Battery Scale",
    code: "P-005",
    health: "critical",
    stage: "Qualify feedstock portfolio",
    currency: "USD",
    regions: "US · Canada · Australia · China",
    owner: "Jordan Lee",
    classification: "Simulation · public context only",
    dataResidency: "US + regional partitions",
    problem:
      "Balance primary minerals, recycled feedstock, cell quality, factory output, cost, carbon, and vehicle-service needs.",
    outcome:
      "Create a qualified battery-material portfolio that remains feasible under mineral, recycling, quality, and factory disruption.",
    counts: {
      entities: "19,840",
      relationships: "91,360",
      observations: "5.94M",
      documents: "5,120",
      events: "1.46M",
      claims: "52.7K",
      decisions: 22,
      runs: 174,
      apps: 10,
      agents: 12,
      experts: 17,
    },
    metrics: evidenceMetrics("P-005", [
      [
        "Cell output exposed",
        "24.8 GWh",
        "P95 twelve-month production exposure",
        "critical",
      ],
      [
        "Recycled feedstock yield",
        "91.4%",
        "Synthetic recovery and qualification rate",
        "watch",
      ],
      [
        "Qualified material coverage",
        "1.31×",
        "Lithium, nickel, and graphite requirement",
        "watch",
      ],
      [
        "Cost avoided",
        "$438M",
        "CVaR95 versus spot-heavy baseline",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-002",
        "L2-003",
        "L2-008",
        "L2-013",
        "L2-019",
        "L2-031",
        "L2-034",
      ],
      l1: [
        "L1-006",
        "L1-008",
        "L1-009",
        "L1-010",
        "L1-041",
        "L1-051",
        "L1-054",
      ],
      l0: [
        "L0-030",
        "L0-035",
        "L0-044",
        "L0-051",
        "L0-057",
        "L0-061",
        "L0-064",
        "L0-071",
        "L0-131",
        "L0-155",
        "L0-371",
        "L0-394",
      ],
    },
    methodCodes: [
      "M-04",
      "M-05",
      "M-06",
      "M-13",
      "M-16",
      "M-18",
      "M-20",
      "M-22",
      "M-23",
      "M-24",
      "M-29",
    ],
    product: "Battery cells, packs, vehicles, and recovered battery materials",
    publicContext:
      "Tesla publicly discusses responsible mineral sourcing and battery-material recovery, including lithium, nickel, cobalt, and recycling operations.",
    publicSource: {
      label: "Tesla battery material recovery",
      url: "https://www.tesla.com/learn/closing-loop-and-recovering-material-our-batteries",
      asOf: "Public page reviewed Sep 2026",
    },
    shock:
      "Graphite export restriction + lithium volatility + recycling ramp delay",
    trigger:
      "Qualified graphite arrivals fall 30%, spot lithium rises 41%, and recovery yield drops below the commissioning curve.",
    decision:
      "Allocate primary and recycled feedstock, cell chemistry, factory capacity, qualification resources, and service-pack inventory.",
    response:
      "Protect service packs, accelerate two secondary-material qualifications, shift feedstock blend, and reserve cathode capacity under a CVaR cost ceiling.",
    resilience: {
      baseline: "76.2% P95 cell-material coverage",
      resilient: "93.8% P95 coverage",
      confidence: 87,
      p50: "96.0%",
      p90: "94.5%",
      p95: "93.8%",
      worstCase: "89.1%",
      cvar: "$438M cost avoided",
    },
    hardConstraints: [
      "Cell quality and safety release",
      "Responsible-sourcing evidence",
      "Service-pack reserve",
      "Factory chemistry compatibility",
    ],
    datasets: [
      dataset(
        "Vehicle, energy, and service demand",
        "Synthetic demand contract",
        "Product × market × week",
        "928K",
        "19 sec",
        96,
        ["L0-001", "L0-008", "L0-016"],
      ),
      dataset(
        "Cell and pack genealogy",
        "Synthetic PLM/QMS",
        "Cell lot × pack × vehicle",
        "1.68M",
        "2 min",
        99,
        ["L0-028", "L0-131", "L0-145"],
      ),
      dataset(
        "Mineral and recycled feedstock",
        "Synthetic procurement/recovery",
        "Material × source × month",
        "782K",
        "44 sec",
        94,
        ["L0-030", "L0-035", "L0-051"],
      ),
      dataset(
        "Cell factory telemetry",
        "Synthetic MES/IoT replay",
        "Line × process × 5 min",
        "1.94M",
        "5 sec",
        97,
        ["L0-071", "L0-079", "L0-088"],
      ),
      dataset(
        "Material and pack movements",
        "Synthetic TMS",
        "Lot × handoff event",
        "586K",
        "11 sec",
        95,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Mineral policy context",
        "Approved public-context fixture",
        "Country × material × event",
        "24.2K",
        "30 min",
        89,
        ["L0-371", "L0-394", "L0-410"],
      ),
    ],
  },
  {
    id: "byd-global-localization",
    sectorId: "global-nev-manufacturing",
    sector: "Global NEV Manufacturing",
    clientId: "byd",
    client: "BYD",
    name: "Global Launch & Localization",
    code: "P-006",
    health: "watch",
    stage: "Compare localization paths",
    currency: "USD",
    regions: "China · Thailand · Europe · Brazil",
    owner: "Wei Zhang",
    classification: "Simulation · public context only",
    dataResidency: "China + Thailand + EU + Brazil partitions",
    problem:
      "Choose production, localization, vehicle shipping, and market-launch paths under tariffs, local-content rules, capacity, and volatile demand.",
    outcome:
      "Meet market launches with a feasible localized BOM and the lowest regret across tariff, demand, and vessel scenarios.",
    counts: {
      entities: "21,300",
      relationships: "96,740",
      observations: "6.22M",
      documents: "3,780",
      events: "1.84M",
      claims: "44.1K",
      decisions: 25,
      runs: 182,
      apps: 10,
      agents: 12,
      experts: 18,
    },
    metrics: evidenceMetrics("P-006", [
      [
        "Launch volume exposed",
        "182K vehicles",
        "P90 under tariff and vessel stress",
        "critical",
      ],
      [
        "Localized BOM",
        "67%",
        "Qualified value share at ramp markets",
        "watch",
      ],
      [
        "RoRo capacity covered",
        "84%",
        "Governed twelve-week export requirement",
        "watch",
      ],
      [
        "Regret avoided",
        "$326M",
        "Worst-case versus export-only plan",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-005",
        "L2-013",
        "L2-019",
        "L2-027",
      ],
      l1: ["L1-001", "L1-006", "L1-010", "L1-012", "L1-032", "L1-041"],
      l0: [
        "L0-001",
        "L0-029",
        "L0-044",
        "L0-057",
        "L0-061",
        "L0-071",
        "L0-079",
        "L0-101",
        "L0-202",
        "L0-217",
        "L0-275",
        "L0-299",
      ],
    },
    methodCodes: [
      "M-02",
      "M-05",
      "M-06",
      "M-08",
      "M-10",
      "M-16",
      "M-17",
      "M-20",
      "M-22",
      "M-24",
      "M-25",
    ],
    product:
      "New-energy vehicles, battery systems, and localized vehicle programmes",
    publicContext:
      "BYD has publicly described regional supplier development and localized passenger-vehicle production for its European expansion.",
    publicSource: {
      label: "BYD European production localization",
      url: "https://www.byd.com/eu/news-list/BYD_announces_voestalpine_as_major_supplier_to_its_first_European_car_factory.html",
      asOf: "Published Jun 2025",
    },
    shock:
      "Tariff increase + local-content rule + RoRo shortage + demand shift",
    trigger:
      "Import duty rises 15 points, vessel capacity drops 28%, and one launch market forecast moves down 19%.",
    decision:
      "Choose export, CKD, and local production by market while qualifying local parts, people, capacity, and logistics.",
    response:
      "Move three variants to localized assembly, reserve regional battery/trim supply, defer low-confidence exports, and redirect two vessel windows.",
    resilience: {
      baseline: "78.4% P90 launch attainment",
      resilient: "95.2% P90 attainment",
      confidence: 86,
      p50: "97.0%",
      p90: "95.2%",
      p95: "94.4%",
      worstCase: "90.6%",
      cvar: "$326M regret avoided",
    },
    hardConstraints: [
      "Market homologation",
      "Local-content threshold",
      "Battery and vehicle quality release",
      "Plant and vessel capacity",
    ],
    datasets: [
      dataset(
        "Country launch demand",
        "Synthetic commercial planning",
        "Variant × country × month",
        "1.06M",
        "22 sec",
        95,
        ["L0-001", "L0-016", "L0-275"],
      ),
      dataset(
        "Localized vehicle BOM",
        "Synthetic PLM/localization ledger",
        "Variant × part × country",
        "1.92M",
        "3 min",
        97,
        ["L0-028", "L0-029", "L0-031"],
      ),
      dataset(
        "Supplier localization pipeline",
        "Synthetic SRM",
        "Part × supplier × gate",
        "612K",
        "1 min",
        92,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Plant ramp and workforce",
        "Synthetic MES/workforce fixture",
        "Plant × line × skill × shift",
        "1.44M",
        "7 sec",
        96,
        ["L0-071", "L0-101", "L0-102"],
      ),
      dataset(
        "Vehicle shipping and delivery",
        "Synthetic RoRo/TMS feed",
        "Vehicle × vessel × event",
        "1.17M",
        "10 sec",
        94,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Tariff and local-content rules",
        "Approved public-context fixture",
        "Market × rule × date",
        "18.8K",
        "20 min",
        90,
        ["L0-371", "L0-394", "L0-410"],
      ),
    ],
  },
  {
    id: "hershey-cocoa-season",
    sectorId: "food-confectionery",
    sector: "Food & Confectionery",
    clientId: "hershey",
    client: "Hershey",
    name: "Cocoa-to-Seasonal-Shelf",
    code: "P-007",
    health: "critical",
    stage: "Protect seasonal allocation",
    currency: "USD",
    regions: "West Africa · US · Canada · Mexico",
    owner: "Rachel Morgan",
    classification: "Simulation · public context only",
    dataResidency: "US primary + origin partitions",
    problem:
      "Protect seasonal confectionery availability amid cocoa crop loss, price inflation, origin traceability, production, and retailer allocation constraints.",
    outcome:
      "Meet the highest-value seasonal demand while preserving responsible-sourcing, quality, recipe, and retailer-service commitments.",
    counts: {
      entities: "17,480",
      relationships: "78,940",
      observations: "4.36M",
      documents: "6,820",
      events: "1.12M",
      claims: "58.9K",
      decisions: 20,
      runs: 148,
      apps: 9,
      agents: 12,
      experts: 16,
    },
    metrics: evidenceMetrics("P-007", [
      [
        "Seasonal sales exposed",
        "$742M",
        "CVaR95 from crop, price, and supply stress",
        "critical",
      ],
      [
        "Traceable cocoa coverage",
        "95.8%",
        "Farm-group to finished-lot evidence",
        "watch",
      ],
      [
        "Peak line coverage",
        "88%",
        "Constrained weeks across seasonal shapes",
        "watch",
      ],
      [
        "Shelf availability",
        "96.4%",
        "P95 after origin and SKU allocation",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-007",
        "L2-019",
        "L2-021",
        "L2-031",
      ],
      l1: [
        "L1-001",
        "L1-004",
        "L1-006",
        "L1-010",
        "L1-014",
        "L1-030",
        "L1-051",
      ],
      l0: [
        "L0-001",
        "L0-026",
        "L0-030",
        "L0-044",
        "L0-051",
        "L0-057",
        "L0-071",
        "L0-101",
        "L0-131",
        "L0-145",
        "L0-155",
      ],
    },
    methodCodes: [
      "M-02",
      "M-03",
      "M-06",
      "M-07",
      "M-13",
      "M-16",
      "M-20",
      "M-21",
      "M-23",
      "M-24",
      "M-25",
    ],
    product: "Chocolate, confectionery, and seasonal retail assortments",
    publicContext:
      "Hershey reports cocoa sourcing, traceability, polygon mapping, and due-diligence programmes in its responsible-business reporting.",
    publicSource: {
      label: "Hershey 2024 Responsible Business Report",
      url: "https://investors.thehersheycompany.com/content/dam/hershey-corporate/documents/pdf/hershey-2024-responsible-business-report.pdf",
      asOf: "Published 2025",
    },
    shock:
      "West African crop loss + cocoa price spike + traceability exception",
    trigger:
      "Expected arrivals fall 21%, nearby cocoa cost rises 36%, and one origin claim fails the evidence threshold.",
    decision:
      "Choose origin mix, material inventory, recipe-authorized SKU allocation, production sequence, and retailer deployment.",
    response:
      "Quarantine unsupported lots, protect verified origin inventory, prioritize seasonal core SKUs, reserve moulding capacity, and rebalance regional finished goods.",
    resilience: {
      baseline: "84.7% P95 shelf availability",
      resilient: "96.4% P95 availability",
      confidence: 91,
      p50: "97.8%",
      p90: "96.9%",
      p95: "96.4%",
      worstCase: "92.8%",
      cvar: "$518M sales protected",
    },
    hardConstraints: [
      "Responsible-sourcing evidence",
      "Food safety and allergen control",
      "Recipe and label authorization",
      "Retailer minimum allocation",
    ],
    datasets: [
      dataset(
        "Seasonal demand signals",
        "Synthetic retailer/S&OP feed",
        "SKU × retailer × week",
        "1.22M",
        "17 sec",
        97,
        ["L0-001", "L0-016", "L0-187"],
      ),
      dataset(
        "Cocoa origin and due diligence",
        "Synthetic farm-group ledger",
        "Lot × farm group × claim",
        "684K",
        "15 min",
        94,
        ["L0-030", "L0-051", "L0-371"],
      ),
      dataset(
        "Commodity positions and supply",
        "Synthetic procurement fixture",
        "Origin × contract × month",
        "418K",
        "42 sec",
        95,
        ["L0-044", "L0-061", "L0-064"],
      ),
      dataset(
        "Recipe, quality, and production",
        "Synthetic PLM/QMS/MES",
        "SKU × recipe × lot × line",
        "1.46M",
        "8 sec",
        98,
        ["L0-028", "L0-071", "L0-131"],
      ),
      dataset(
        "Distribution and shelf handoff",
        "Synthetic TMS/retailer fixture",
        "Shipment × DC × retailer",
        "562K",
        "13 sec",
        95,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Weather and crop scenarios",
        "Approved public-context fixture",
        "Origin × season × scenario",
        "14.6K",
        "30 min",
        88,
        ["L0-394", "L0-410", "L0-445"],
      ),
    ],
  },
  {
    id: "tsmc-fab-recovery",
    sectorId: "semiconductor-foundry",
    sector: "Semiconductor Foundry",
    clientId: "tsmc",
    client: "TSMC",
    name: "Fab Recovery & Allocation",
    code: "P-008",
    health: "critical",
    stage: "Execute fab recovery",
    currency: "USD",
    regions: "Taiwan · Japan · US · Europe",
    owner: "Lin Yu-Ting",
    classification: "Simulation · public context only",
    dataResidency: "Taiwan + US + Japan partitions",
    problem:
      "Recover qualified wafer output and allocate constrained capacity following a compound utilities, equipment, supplier, and geopolitical disruption.",
    outcome:
      "Restore safe qualified output and protect the most consequential customer commitments through an auditable recovery sequence.",
    counts: {
      entities: "28,600",
      relationships: "132,480",
      observations: "18.4M",
      documents: "5,740",
      events: "6.86M",
      claims: "71.2K",
      decisions: 27,
      runs: 214,
      apps: 10,
      agents: 12,
      experts: 19,
    },
    metrics: evidenceMetrics("P-008", [
      [
        "WIP value exposed",
        "$3.26B",
        "Across 1,842 synthetic wafer lots",
        "critical",
      ],
      [
        "Utility-secure capacity",
        "72%",
        "Power and water constrained qualified output",
        "critical",
      ],
      ["P90 recovery", "9.6 days", "To 95% qualified weekly output", "watch"],
      [
        "Customer value protected",
        "$2.41B",
        "CVaR95 allocation and recovery response",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: ["L2-001", "L2-003", "L2-005", "L2-007", "L2-021", "L2-027"],
      l1: ["L1-001", "L1-010", "L1-011", "L1-012", "L1-014", "L1-050"],
      l0: [
        "L0-001",
        "L0-026",
        "L0-071",
        "L0-074",
        "L0-079",
        "L0-088",
        "L0-090",
        "L0-097",
        "L0-101",
        "L0-121",
        "L0-131",
        "L0-363",
      ],
    },
    methodCodes: [
      "M-02",
      "M-06",
      "M-08",
      "M-14",
      "M-15",
      "M-16",
      "M-17",
      "M-20",
      "M-23",
      "M-26",
      "M-27",
    ],
    product: "Advanced and mature-node wafer production portfolio",
    publicContext:
      "TSMC identifies earthquakes, utility shortages, drought, cyberattack, geopolitical tension, and supply disruption as business-continuity risks.",
    publicSource: {
      label: "TSMC 2024 Annual Report",
      url: "https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page138.html",
      asOf: "FY 2024",
    },
    shock: "Earthquake + water restriction + specialty-chemical delay",
    trigger:
      "Three tool groups trip, available water falls 18%, and one qualified chemical lane slips six days.",
    decision:
      "Sequence tool recovery, wafer starts, recipe routing, customer allocation, maintenance labour, and qualified material usage.",
    response:
      "Prioritize safety checks, recover the bottleneck tool set, protect automotive/medical commits, cross-route eligible lots, and ration specialty chemicals by marginal service value.",
    resilience: {
      baseline: "68.2% P90 customer commit",
      resilient: "94.8% P90 commit",
      confidence: 93,
      p50: "96.2%",
      p90: "94.8%",
      p95: "93.9%",
      worstCase: "89.4%",
      cvar: "$2.41B customer value protected",
    },
    hardConstraints: [
      "Personnel and facility safety",
      "Qualified process recipes only",
      "Lot genealogy and contamination control",
      "Customer/export authorization",
    ],
    datasets: [
      dataset(
        "Customer allocation and wafer demand",
        "Synthetic planning fixture",
        "Customer × product × week",
        "2.48M",
        "21 sec",
        98,
        ["L0-001", "L0-008", "L0-275"],
      ),
      dataset(
        "Wafer lot genealogy",
        "Synthetic MES/QMS",
        "Lot × operation × tool",
        "5.86M",
        "4 sec",
        99,
        ["L0-071", "L0-131", "L0-145"],
      ),
      dataset(
        "Tool and facility telemetry",
        "Synthetic fab IoT replay",
        "Tool/sensor × second",
        "7.42M",
        "1 sec",
        99,
        ["L0-074", "L0-079", "L0-090"],
      ),
      dataset(
        "Chemicals and supplier capacity",
        "Synthetic ERP/SRM",
        "Material × supplier-site × day",
        "1.12M",
        "18 sec",
        96,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Maintenance and skill roster",
        "Synthetic EAM/workforce",
        "Tool × skill × shift",
        "1.48M",
        "9 sec",
        97,
        ["L0-097", "L0-101", "L0-102"],
      ),
      dataset(
        "Seismic, utility, and policy context",
        "Approved public-context fixture",
        "Site × hazard × minute",
        "84.2K",
        "5 sec",
        91,
        ["L0-121", "L0-394", "L0-445"],
      ),
    ],
  },
  {
    id: "airbus-ramp-continuity",
    sectorId: "aerospace-defense",
    sector: "Aerospace",
    clientId: "airbus",
    client: "Airbus",
    name: "Aircraft Ramp Continuity",
    code: "P-009",
    health: "critical",
    stage: "Sequence constrained builds",
    currency: "EUR",
    regions: "Europe · US · UK · Canada · Global",
    owner: "Claire Dubois",
    classification: "Simulation · public context only",
    dataResidency: "EU + UK + US partitions",
    problem:
      "Maintain aircraft delivery commitments amid engine shortages, titanium and forging constraints, supplier integration, tariffs, and long-cycle certification.",
    outcome:
      "Release the best feasible aircraft sequence without violating configuration, certification, quality, or customer commitments.",
    counts: {
      entities: "26,240",
      relationships: "121,600",
      observations: "9.64M",
      documents: "11,280",
      events: "2.74M",
      claims: "86.4K",
      decisions: 26,
      runs: 196,
      apps: 10,
      agents: 12,
      experts: 20,
    },
    metrics: evidenceMetrics("P-009", [
      [
        "Delivery value exposed",
        "€6.42B",
        "P95 engines, structures, and schedule exposure",
        "critical",
      ],
      [
        "Engine-set coverage",
        "79%",
        "Twelve-month governed final-assembly need",
        "critical",
      ],
      [
        "Build sequence confidence",
        "92.6%",
        "P90 configuration-feasible completion",
        "watch",
      ],
      [
        "Penalty avoided",
        "€1.18B",
        "CVaR95 delivery-response value",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-005",
        "L2-007",
        "L2-013",
        "L2-027",
      ],
      l1: [
        "L1-001",
        "L1-004",
        "L1-006",
        "L1-010",
        "L1-012",
        "L1-050",
        "L1-054",
      ],
      l0: [
        "L0-001",
        "L0-025",
        "L0-029",
        "L0-031",
        "L0-044",
        "L0-057",
        "L0-061",
        "L0-071",
        "L0-079",
        "L0-101",
        "L0-131",
        "L0-145",
      ],
    },
    methodCodes: [
      "M-04",
      "M-06",
      "M-08",
      "M-15",
      "M-17",
      "M-20",
      "M-22",
      "M-23",
      "M-25",
      "M-27",
      "M-29",
    ],
    product:
      "Commercial aircraft, engines, aerostructures, and delivery programmes",
    publicContext:
      "Airbus has publicly reported aircraft deliveries, production ramp objectives, engine-supply effects, supplier integration, and tariff uncertainty.",
    publicSource: {
      label: "Airbus FY 2025 results",
      url: "https://www.airbus.com/en/newsroom/press-releases/2026-02-airbus-reports-full-year-fy-2025-results",
      asOf: "Published Feb 2026",
    },
    shock: "Engine shortfall + titanium restriction + aerostructure delay",
    trigger:
      "Available engine sets fall 21%, a forging path is sanctioned, and fuselage-section delivery reliability drops 14 points.",
    decision:
      "Choose aircraft build sequence, engine allocation, supplier recovery, expediting, configuration deferral, and delivery commitments.",
    response:
      "Freeze the four-week executable sequence, prioritize configuration-complete aircraft, reserve certified forgings, fund supplier recovery, and renegotiate two low-readiness slots.",
    resilience: {
      baseline: "74.6% P90 delivery attainment",
      resilient: "92.6% P90 attainment",
      confidence: 90,
      p50: "94.8%",
      p90: "92.6%",
      p95: "91.7%",
      worstCase: "87.0%",
      cvar: "€1.18B penalty avoided",
    },
    hardConstraints: [
      "Airworthiness and configuration conformity",
      "Certified part-source paths",
      "Skilled-labour and station capacity",
      "Customer contractual gates",
    ],
    datasets: [
      dataset(
        "Aircraft order and delivery commitments",
        "Synthetic programme fixture",
        "MSN × customer × milestone",
        "1.42M",
        "32 sec",
        98,
        ["L0-001", "L0-008", "L0-275"],
      ),
      dataset(
        "Aircraft configuration genealogy",
        "Synthetic PLM",
        "MSN × part × revision",
        "3.86M",
        "4 min",
        99,
        ["L0-028", "L0-029", "L0-031"],
      ),
      dataset(
        "Engine and structure supply",
        "Synthetic supplier programme",
        "Part set × supplier-site × week",
        "1.24M",
        "48 sec",
        95,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Final-assembly plan",
        "Synthetic MES/workforce",
        "MSN × station × shift",
        "1.76M",
        "11 sec",
        97,
        ["L0-071", "L0-079", "L0-101"],
      ),
      dataset(
        "Large-part logistics",
        "Synthetic TMS handoff",
        "Asset × movement event",
        "1.18M",
        "19 sec",
        95,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Certification and policy evidence",
        "Approved public-context fixture",
        "Part × certificate × jurisdiction",
        "182K",
        "15 min",
        93,
        ["L0-131", "L0-145", "L0-371"],
      ),
    ],
  },
  {
    id: "pfizer-medicine-continuity",
    sectorId: "pharmaceuticals",
    sector: "Pharmaceuticals",
    clientId: "pfizer",
    client: "Pfizer",
    name: "Critical Medicine Continuity",
    code: "P-010",
    health: "critical",
    stage: "Protect patient allocation",
    currency: "USD",
    regions: "US · EU · India · Middle East",
    owner: "Dr. Nadia Brooks",
    classification: "Simulation · public context only",
    dataResidency: "US + EU regulated partitions",
    problem:
      "Maintain safe medicine supply across API, drug-product production, batch release, cold chain, conflict-zone delivery, sanctions, and counterfeit risk.",
    outcome:
      "Protect eligible patient demand using only qualified, released, authenticated, and policy-compliant supply paths.",
    counts: {
      entities: "23,180",
      relationships: "112,860",
      observations: "8.72M",
      documents: "14,600",
      events: "3.18M",
      claims: "102.4K",
      decisions: 28,
      runs: 224,
      apps: 10,
      agents: 12,
      experts: 21,
    },
    metrics: evidenceMetrics("P-010", [
      [
        "Doses exposed",
        "2.84M",
        "P95 twelve-week patient shortfall",
        "critical",
      ],
      [
        "Cold-chain conformance",
        "99.82%",
        "Authenticated lane and excursion compliance",
        "healthy",
      ],
      [
        "Qualified source coverage",
        "1.26×",
        "Released API and drug-product capacity",
        "watch",
      ],
      [
        "Patient service protected",
        "97.9%",
        "P95 after batch and route allocation",
        "opportunity",
      ],
    ]),
    mountedAppIds: [
      "risk",
      "optimizer",
      "flow",
      "demand",
      "suppliers",
      "minerals",
      "workforce",
      "manufacturing",
      "logistics",
      "quality",
    ],
    variablePack: {
      l2: [
        "L2-001",
        "L2-002",
        "L2-003",
        "L2-006",
        "L2-007",
        "L2-013",
        "L2-022",
        "L2-027",
      ],
      l1: [
        "L1-001",
        "L1-004",
        "L1-006",
        "L1-018",
        "L1-030",
        "L1-037",
        "L1-050",
      ],
      l0: [
        "L0-001",
        "L0-026",
        "L0-044",
        "L0-057",
        "L0-061",
        "L0-071",
        "L0-101",
        "L0-131",
        "L0-141",
        "L0-145",
        "L0-178",
        "L0-202",
        "L0-217",
        "L0-275",
      ],
    },
    methodCodes: [
      "M-02",
      "M-06",
      "M-13",
      "M-15",
      "M-17",
      "M-20",
      "M-21",
      "M-23",
      "M-24",
      "M-26",
      "M-30",
    ],
    product:
      "Critical medicines, API, drug product, and temperature-controlled distribution",
    publicContext:
      "Pfizer publicly discusses internal and external manufacturing networks, supply continuity, geopolitical instability, sanctions, quality, cold-chain, and counterfeit risks.",
    publicSource: {
      label: "Pfizer Annual Reports",
      url: "https://investors.pfizer.com/Investors/Financials/Annual-Reports/default.aspx",
      asOf: "Public reporting reviewed Sep 2026",
    },
    shock:
      "API-site interruption + cold-chain excursion + conflict-zone route closure",
    trigger:
      "One API site loses six weeks, 14 pallets enter quality hold, and the approved direct corridor closes.",
    decision:
      "Choose batch release, alternate qualified source, production slot, dose allocation, and authenticated cold-chain routes.",
    response:
      "Hold excursion lots, activate validated API capacity, resequence fill-finish, prioritize governed patient cohorts, and route via authenticated regional depots.",
    resilience: {
      baseline: "81.3% P95 patient service",
      resilient: "97.9% P95 service",
      confidence: 94,
      p50: "98.6%",
      p90: "98.1%",
      p95: "97.9%",
      worstCase: "95.2%",
      cvar: "2.31M doses protected",
    },
    hardConstraints: [
      "Patient safety and batch release",
      "Qualified source/site only",
      "Cold-chain stability",
      "Sanctions and market authorization",
      "Authenticated custody chain",
    ],
    datasets: [
      dataset(
        "Patient and market demand",
        "Synthetic allocation fixture",
        "Product × market × week",
        "1.64M",
        "23 sec",
        98,
        ["L0-001", "L0-008", "L0-275"],
      ),
      dataset(
        "API and drug-product genealogy",
        "Synthetic quality ledger",
        "Batch × material × site × process",
        "2.86M",
        "7 sec",
        99,
        ["L0-028", "L0-131", "L0-145"],
      ),
      dataset(
        "Qualified source and capacity",
        "Synthetic quality/SRM",
        "Material × site × market",
        "842K",
        "38 sec",
        98,
        ["L0-044", "L0-057", "L0-061"],
      ),
      dataset(
        "Manufacturing and release queue",
        "Synthetic MES/LIMS",
        "Batch × operation × release gate",
        "1.72M",
        "6 sec",
        99,
        ["L0-071", "L0-141", "L0-178"],
      ),
      dataset(
        "Authenticated cold-chain events",
        "Synthetic IoT/TMS replay",
        "Container × sensor × event",
        "1.62M",
        "3 sec",
        98,
        ["L0-202", "L0-217", "L0-229"],
      ),
      dataset(
        "Policy and conflict routing context",
        "Approved public-context fixture",
        "Jurisdiction × policy × route",
        "36.4K",
        "10 min",
        92,
        ["L0-371", "L0-394", "L0-410"],
      ),
    ],
  },
] as const;

type SupplyStageBlueprint = {
  label: string;
  description: string;
  primary: string;
  country: string;
  alternate: string;
  alternateCountry: string;
  role: string;
  mode: string;
};

type SupplyChainBlueprint = {
  unit: string;
  stages: readonly SupplyStageBlueprint[];
};

const supplyChainBlueprints: Readonly<Record<string, SupplyChainBlueprint>> = {
  apple: {
    unit: "K device-equivalents / day",
    stages: [
      { label: "Critical inputs", description: "Battery, magnet, glass, and substrate inputs", primary: "Mineral and specialty-material cluster A", country: "China", alternate: "Qualified material cluster B", alternateCountry: "Australia", role: "Raw and processed inputs", mode: "Rail + ocean" },
      { label: "Advanced wafers", description: "Leading-edge logic and companion silicon", primary: "Advanced wafer node TW-01", country: "Taiwan", alternate: "Qualified wafer node US-02", alternateCountry: "United States", role: "Front-end fabrication", mode: "Secure air" },
      { label: "Components", description: "Displays, cameras, memory, and power modules", primary: "Module ecosystem KR-01", country: "South Korea", alternate: "Module ecosystem JP-02", alternateCountry: "Japan", role: "Tier-1 modules", mode: "Air + ocean" },
      { label: "Final assembly", description: "New-product introduction and ramp", primary: "Assembly campus CN-01", country: "China", alternate: "Assembly campus IN-02", alternateCountry: "India", role: "Final integration", mode: "Truck" },
      { label: "Export gateway", description: "Launch consolidation and customs release", primary: "East Asia gateway 01", country: "China", alternate: "South Asia gateway 02", alternateCountry: "India", role: "Origin consolidation", mode: "Air + ocean" },
      { label: "Regional hubs", description: "Priority-market inventory allocation", primary: "Americas launch hub", country: "United States", alternate: "Europe launch hub", alternateCountry: "Netherlands", role: "Regional allocation", mode: "Air + truck" },
      { label: "Channels", description: "Retail, carrier, and direct fulfillment", primary: "Priority channel pool A", country: "United States", alternate: "Priority channel pool B", alternateCountry: "Germany", role: "Demand fulfillment", mode: "Parcel" },
      { label: "Customer promise", description: "Launch availability and service protection", primary: "Launch cohort 01", country: "Global", alternate: "Deferred cohort 02", alternateCountry: "Global", role: "Service outcome", mode: "Digital allocation" },
    ],
  },
  "coca-cola": {
    unit: "K unit-cases / day",
    stages: [
      { label: "Water and sweetener", description: "Watershed, sugar, and sweetener availability", primary: "Watershed and sweetener basin A", country: "Mexico", alternate: "Watershed and sweetener basin B", alternateCountry: "Brazil", role: "Agricultural and water inputs", mode: "Pipeline + bulk" },
      { label: "Concentrate", description: "Formula-controlled concentrate supply", primary: "Concentrate plant US-01", country: "United States", alternate: "Concentrate plant IE-02", alternateCountry: "Ireland", role: "Concentrate production", mode: "Air + ocean" },
      { label: "Packaging", description: "PET resin, preforms, glass, cans, and closures", primary: "Packaging pool MX-01", country: "Mexico", alternate: "Packaging pool BR-02", alternateCountry: "Brazil", role: "Primary packaging", mode: "Truck + rail" },
      { label: "Bottling", description: "Carbonation, filling, labeling, and packing", primary: "Bottling territory A", country: "Mexico", alternate: "Bottling territory B", alternateCountry: "Colombia", role: "Manufacturing", mode: "Truck" },
      { label: "Warehousing", description: "Finished-goods storage and allocation", primary: "Regional DC LATAM-01", country: "Mexico", alternate: "Regional DC LATAM-02", alternateCountry: "Brazil", role: "Inventory positioning", mode: "Truck" },
      { label: "Route to market", description: "Distributor and direct-store delivery", primary: "Route fleet A", country: "Mexico", alternate: "Distributor pool B", alternateCountry: "Colombia", role: "Last-mile distribution", mode: "Truck" },
      { label: "Retail cold chain", description: "Outlet stock and cooler availability", primary: "Modern-trade outlets", country: "Mexico", alternate: "Traditional-trade outlets", alternateCountry: "Brazil", role: "Point of sale", mode: "Last mile" },
      { label: "Consumer demand", description: "Occasion, pack, price, and promotion demand", primary: "Priority occasion pool", country: "LATAM", alternate: "Substitution occasion pool", alternateCountry: "LATAM", role: "Service outcome", mode: "Demand allocation" },
    ],
  },
  gucci: {
    unit: "K finished pieces / week",
    stages: [
      { label: "Origin materials", description: "Leather, silk, cotton, and precious inputs", primary: "Traceable origin cluster IT-01", country: "Italy", alternate: "Traceable origin cluster ES-02", alternateCountry: "Spain", role: "Raw-material origin", mode: "Road" },
      { label: "Processing", description: "Tanning, dyeing, weaving, and finishing", primary: "Artisan processor pool A", country: "Italy", alternate: "Qualified processor pool B", alternateCountry: "France", role: "Tier-2 processing", mode: "Road" },
      { label: "Trims and hardware", description: "Buckles, zips, soles, and decorative hardware", primary: "Hardware cluster IT-01", country: "Italy", alternate: "Hardware cluster CH-02", alternateCountry: "Switzerland", role: "Tier-1 components", mode: "Road + air" },
      { label: "Artisan production", description: "Cutting, stitching, assembly, and finishing", primary: "Atelier network IT-01", country: "Italy", alternate: "Flexible atelier pool IT-02", alternateCountry: "Italy", role: "Final manufacturing", mode: "Road" },
      { label: "Authenticity gate", description: "Quality, origin, and product-passport checks", primary: "Release center EU-01", country: "Italy", alternate: "Release center EU-02", alternateCountry: "France", role: "Quality and provenance", mode: "Secure road" },
      { label: "Regional distribution", description: "Boutique and e-commerce allocation", primary: "Luxury DC EU-01", country: "Italy", alternate: "Luxury DC APAC-02", alternateCountry: "Singapore", role: "Allocation", mode: "Air + road" },
      { label: "Boutiques", description: "Store replenishment and launch assortment", primary: "Priority boutique cohort", country: "Global", alternate: "Digital fulfillment cohort", alternateCountry: "Global", role: "Channel fulfillment", mode: "Parcel + road" },
      { label: "Client promise", description: "Availability, provenance, and experience", primary: "Signature-line demand", country: "Global", alternate: "Substitution assortment", alternateCountry: "Global", role: "Service outcome", mode: "Demand allocation" },
    ],
  },
  "tata-motors": {
    unit: "vehicles / week",
    stages: [
      { label: "Strategic materials", description: "Steel, aluminum, battery, and electronic materials", primary: "Industrial input cluster IN-01", country: "India", alternate: "Industrial input cluster IN-02", alternateCountry: "India", role: "Raw materials", mode: "Rail + road" },
      { label: "Electronics", description: "Semiconductors, controllers, and displays", primary: "Electronics pool APAC-01", country: "Malaysia", alternate: "Electronics pool APAC-02", alternateCountry: "Thailand", role: "Tier-2 electronics", mode: "Air + ocean" },
      { label: "Tier-1 systems", description: "Powertrain, braking, seating, and thermal systems", primary: "Tier-1 corridor West", country: "India", alternate: "Tier-1 corridor South", alternateCountry: "India", role: "Vehicle systems", mode: "Road" },
      { label: "Vehicle plants", description: "Body, paint, assembly, and end-of-line", primary: "Vehicle plant IN-01", country: "India", alternate: "Vehicle plant IN-02", alternateCountry: "India", role: "Final assembly", mode: "Road + rail" },
      { label: "Outbound yards", description: "Vehicle release and carrier assignment", primary: "Dispatch yard West", country: "India", alternate: "Dispatch yard North", alternateCountry: "India", role: "Finished-vehicle logistics", mode: "Road + rail" },
      { label: "Dealer regions", description: "Regional allocation and dealer replenishment", primary: "Dealer region A", country: "India", alternate: "Dealer region B", alternateCountry: "India", role: "Channel inventory", mode: "Road" },
      { label: "Service network", description: "Parts availability and workshop capacity", primary: "Service-parts hub A", country: "India", alternate: "Service-parts hub B", alternateCountry: "India", role: "Aftermarket service", mode: "Road + parcel" },
      { label: "Mobility demand", description: "Retail, fleet, and service commitments", primary: "Priority demand pool", country: "India", alternate: "Flexible demand pool", alternateCountry: "India", role: "Customer outcome", mode: "Order allocation" },
    ],
  },
  tesla: {
    unit: "vehicles / week",
    stages: [
      { label: "Battery minerals", description: "Lithium, nickel, graphite, and precursor inputs", primary: "Battery-material corridor A", country: "Australia", alternate: "Battery-material corridor B", alternateCountry: "Canada", role: "Critical minerals", mode: "Rail + ocean" },
      { label: "Cells", description: "Cell production, yield, and qualified chemistry", primary: "Cell line US-01", country: "United States", alternate: "Cell line APAC-02", alternateCountry: "Japan", role: "Battery cells", mode: "Rail + ocean" },
      { label: "Power electronics", description: "Inverters, controllers, and compute modules", primary: "Electronics node TW-01", country: "Taiwan", alternate: "Electronics node US-02", alternateCountry: "United States", role: "Tier-1 electronics", mode: "Air" },
      { label: "Gigafactory", description: "Casting, body, battery, paint, and assembly", primary: "Vehicle factory US-01", country: "United States", alternate: "Vehicle factory DE-02", alternateCountry: "Germany", role: "Final manufacturing", mode: "Road + rail" },
      { label: "Outbound logistics", description: "Railhead, port, and carrier dispatch", primary: "Outbound corridor US-01", country: "United States", alternate: "Outbound corridor EU-02", alternateCountry: "Germany", role: "Vehicle logistics", mode: "Rail + road" },
      { label: "Delivery centers", description: "Regional inventory and appointment capacity", primary: "Delivery region Americas", country: "United States", alternate: "Delivery region Europe", alternateCountry: "Netherlands", role: "Regional fulfillment", mode: "Road" },
      { label: "Energy and service", description: "Charging, service parts, and mobile support", primary: "Service coverage pool A", country: "United States", alternate: "Service coverage pool B", alternateCountry: "Germany", role: "Service network", mode: "Road + parcel" },
      { label: "Customer orders", description: "Configuration, promise date, and delivery", primary: "Priority order cohort", country: "Global", alternate: "Flexible order cohort", alternateCountry: "Global", role: "Customer outcome", mode: "Order allocation" },
    ],
  },
  byd: {
    unit: "vehicles and packs / week",
    stages: [
      { label: "Mineral inputs", description: "Lithium, phosphate, graphite, and copper", primary: "Integrated material base CN-01", country: "China", alternate: "Qualified material base CL-02", alternateCountry: "Chile", role: "Critical inputs", mode: "Rail + ocean" },
      { label: "Battery materials", description: "Cathode, anode, electrolyte, and separator", primary: "Battery-material park CN-01", country: "China", alternate: "Battery-material park CN-02", alternateCountry: "China", role: "Processed materials", mode: "Road + rail" },
      { label: "Blade cells", description: "Cell production, formation, and pack integration", primary: "Blade cell campus A", country: "China", alternate: "Blade cell campus B", alternateCountry: "China", role: "Battery systems", mode: "Road + rail" },
      { label: "Vehicle systems", description: "Semiconductors, e-drive, chassis, and body", primary: "Integrated systems cluster A", country: "China", alternate: "Qualified systems cluster B", alternateCountry: "Thailand", role: "Tier-1 systems", mode: "Road + ocean" },
      { label: "Assembly network", description: "Vehicle assembly and regional ramp", primary: "Assembly campus CN-01", country: "China", alternate: "Assembly campus TH-02", alternateCountry: "Thailand", role: "Final manufacturing", mode: "Road" },
      { label: "Export corridors", description: "Ro-ro capacity, ports, and customs", primary: "Export corridor East Asia", country: "China", alternate: "Export corridor Southeast Asia", alternateCountry: "Thailand", role: "International logistics", mode: "Ro-ro ocean" },
      { label: "Market distribution", description: "Country allocation, dealers, and delivery", primary: "Distribution region EU", country: "Germany", alternate: "Distribution region LATAM", alternateCountry: "Brazil", role: "Regional fulfillment", mode: "Road + rail" },
      { label: "Market demand", description: "Model mix, price, and delivery promise", primary: "Priority market cohort", country: "Global", alternate: "Flexible market cohort", alternateCountry: "Global", role: "Customer outcome", mode: "Order allocation" },
    ],
  },
  hershey: {
    unit: "tonnes / week",
    stages: [
      { label: "Cocoa origin", description: "Farm, cooperative, and origin traceability", primary: "Cocoa origin pool CI-01", country: "Cote d'Ivoire", alternate: "Cocoa origin pool EC-02", alternateCountry: "Ecuador", role: "Agricultural origin", mode: "Road" },
      { label: "Origin processing", description: "Fermentation, drying, grading, and aggregation", primary: "Origin processor West Africa", country: "Ghana", alternate: "Origin processor LATAM", alternateCountry: "Ecuador", role: "Primary processing", mode: "Road" },
      { label: "Ocean corridors", description: "Export clearance and cocoa movement", primary: "Atlantic cocoa corridor A", country: "Ghana", alternate: "Pacific cocoa corridor B", alternateCountry: "Ecuador", role: "Inbound logistics", mode: "Ocean" },
      { label: "Ingredients", description: "Grinding, liquor, butter, sugar, and dairy", primary: "Ingredient plant US-01", country: "United States", alternate: "Ingredient plant EU-02", alternateCountry: "Netherlands", role: "Ingredient conversion", mode: "Rail + road" },
      { label: "Confectionery plants", description: "Mixing, molding, cooling, and packing", primary: "Confectionery plant US-01", country: "United States", alternate: "Confectionery plant US-02", alternateCountry: "United States", role: "Final manufacturing", mode: "Road" },
      { label: "Seasonal inventory", description: "Build plan and temperature-controlled storage", primary: "Seasonal DC East", country: "United States", alternate: "Seasonal DC Central", alternateCountry: "United States", role: "Inventory positioning", mode: "Refrigerated truck" },
      { label: "Retail allocation", description: "Customer orders and promotional windows", primary: "Retail cohort A", country: "United States", alternate: "Retail cohort B", alternateCountry: "Canada", role: "Channel fulfillment", mode: "Truck" },
      { label: "Consumer occasions", description: "Seasonal availability and assortment", primary: "Holiday demand pool", country: "North America", alternate: "Everyday demand pool", alternateCountry: "North America", role: "Service outcome", mode: "Demand allocation" },
    ],
  },
  tsmc: {
    unit: "K wafer-equivalents / month",
    stages: [
      { label: "Fab materials", description: "Wafers, chemicals, gases, and photoresist", primary: "Semiconductor material cluster JP-01", country: "Japan", alternate: "Semiconductor material cluster US-02", alternateCountry: "United States", role: "Critical fab inputs", mode: "Secure ocean + air" },
      { label: "Equipment", description: "Lithography, deposition, etch, and metrology", primary: "Equipment service pool EU-01", country: "Netherlands", alternate: "Equipment service pool JP-02", alternateCountry: "Japan", role: "Capital equipment", mode: "Air" },
      { label: "Mask and design", description: "Tape-out, masks, IP, and design enablement", primary: "Design enablement node TW-01", country: "Taiwan", alternate: "Design enablement node US-02", alternateCountry: "United States", role: "Pre-production", mode: "Secure digital" },
      { label: "Wafer fabrication", description: "Leading and specialty node production", primary: "Wafer fab TW-01", country: "Taiwan", alternate: "Wafer fab US-02", alternateCountry: "United States", role: "Front-end manufacturing", mode: "Controlled campus" },
      { label: "Advanced packaging", description: "2.5D/3D integration, substrate, and test", primary: "Packaging node TW-01", country: "Taiwan", alternate: "Packaging node JP-02", alternateCountry: "Japan", role: "Back-end integration", mode: "Secure air" },
      { label: "Qualification", description: "Yield, reliability, and customer release", primary: "Qualification lab TW-01", country: "Taiwan", alternate: "Qualification lab US-02", alternateCountry: "United States", role: "Release gate", mode: "Secure air" },
      { label: "Customer allocation", description: "Capacity reservations and wafer starts", primary: "AI accelerator cohort", country: "Global", alternate: "Automotive and industrial cohort", alternateCountry: "Global", role: "Demand allocation", mode: "Planning contract" },
      { label: "Compute deployment", description: "Accelerator availability and ramp", primary: "Hyperscale deployment pool", country: "Global", alternate: "Enterprise deployment pool", alternateCountry: "Global", role: "Customer outcome", mode: "Secure logistics" },
    ],
  },
  airbus: {
    unit: "shipsets / month",
    stages: [
      { label: "Strategic materials", description: "Titanium, aluminum, composites, and specialty alloys", primary: "Aerospace material cluster US-01", country: "United States", alternate: "Aerospace material cluster EU-02", alternateCountry: "France", role: "Certified materials", mode: "Ocean + air" },
      { label: "Propulsion", description: "Engines, nacelles, and propulsion accessories", primary: "Propulsion program EU-01", country: "France", alternate: "Propulsion program US-02", alternateCountry: "United States", role: "Major systems", mode: "Air + road" },
      { label: "Aerostructures", description: "Wings, fuselage sections, and empennage", primary: "Aerostructure network EU-01", country: "Germany", alternate: "Aerostructure network UK-02", alternateCountry: "United Kingdom", role: "Major structures", mode: "Sea + air" },
      { label: "Systems", description: "Avionics, landing gear, cabins, and actuation", primary: "Aircraft systems pool A", country: "France", alternate: "Aircraft systems pool B", alternateCountry: "Spain", role: "Tier-1 systems", mode: "Road + air" },
      { label: "Final assembly", description: "Station flow, integration, and testing", primary: "Final assembly line EU-01", country: "France", alternate: "Final assembly line US-02", alternateCountry: "United States", role: "Final manufacturing", mode: "Road" },
      { label: "Certification", description: "Conformity, documentation, and release", primary: "Certification gate EU", country: "France", alternate: "Certification gate US", alternateCountry: "United States", role: "Airworthiness release", mode: "Controlled handoff" },
      { label: "Delivery centers", description: "Customer acceptance and ferry readiness", primary: "Delivery center EU", country: "France", alternate: "Delivery center US", alternateCountry: "United States", role: "Aircraft delivery", mode: "Ferry flight" },
      { label: "Airline fleet", description: "Entry into service and spares readiness", primary: "Priority airline cohort", country: "Global", alternate: "Flexible airline cohort", alternateCountry: "Global", role: "Customer outcome", mode: "Fleet allocation" },
    ],
  },
  pfizer: {
    unit: "K treatment-equivalents / week",
    stages: [
      { label: "Starting materials", description: "Regulated chemical and biological inputs", primary: "Qualified input cluster EU-01", country: "Ireland", alternate: "Qualified input cluster US-02", alternateCountry: "United States", role: "Critical raw materials", mode: "Controlled air + ocean" },
      { label: "API and drug substance", description: "Active ingredient and bulk substance production", primary: "Drug-substance site EU-01", country: "Ireland", alternate: "Drug-substance site US-02", alternateCountry: "United States", role: "Primary manufacturing", mode: "Validated cold chain" },
      { label: "Drug product", description: "Formulation, fill-finish, and packaging", primary: "Drug-product site BE-01", country: "Belgium", alternate: "Drug-product site US-02", alternateCountry: "United States", role: "Final manufacturing", mode: "Validated cold chain" },
      { label: "Quality release", description: "Testing, batch disposition, and market release", primary: "Release laboratory EU-01", country: "Belgium", alternate: "Release laboratory US-02", alternateCountry: "United States", role: "Quality gate", mode: "Controlled handoff" },
      { label: "Cold-chain hubs", description: "Temperature-controlled storage and lane release", primary: "Cold-chain hub EU", country: "Belgium", alternate: "Cold-chain hub US", alternateCountry: "United States", role: "Regional logistics", mode: "Validated air + road" },
      { label: "Country allocation", description: "Regulatory, inventory, and demand allocation", primary: "Priority country cohort", country: "Global", alternate: "Contingency country cohort", alternateCountry: "Global", role: "Market allocation", mode: "Planning contract" },
      { label: "Care delivery", description: "Wholesaler, pharmacy, hospital, and clinic supply", primary: "Care network A", country: "Global", alternate: "Care network B", alternateCountry: "Global", role: "Channel fulfillment", mode: "Cold-chain last mile" },
      { label: "Patient access", description: "On-time treatment and continuity", primary: "Priority patient cohort", country: "Global", alternate: "Continuity cohort", alternateCountry: "Global", role: "Patient outcome", mode: "Demand allocation" },
    ],
  },
};

const severityFor = (score: number): SupplyChainCheckpoint["severity"] =>
  score >= 82 ? "critical" : score >= 68 ? "high" : score >= 52 ? "moderate" : "low";

const nodeStatusFor = (score: number): SupplyChainNode["status"] =>
  score >= 76 ? "constrained" : score >= 55 ? "watch" : "stable";

const networkFor = (seed: ProjectSeed, projectIndex: number): SupplyChainNetwork => {
  const blueprint = supplyChainBlueprints[seed.clientId];
  const stages = blueprint.stages.map((stage, stageIndex) => ({
    id: `${seed.code}-ST-${String(stageIndex + 1).padStart(2, "0")}`,
    sequence: stageIndex + 1,
    label: stage.label,
    description: stage.description,
  }));
  const nodes = blueprint.stages.flatMap((stage, stageIndex) => {
    const base = 72 + projectIndex * 9 + stageIndex * 13;
    const primaryRisk = 38 + ((projectIndex * 17 + stageIndex * 11) % 58);
    const alternateRisk = Math.max(22, primaryRisk - 18 + (stageIndex % 3) * 3);
    return ([
      { tier: "Primary", label: stage.primary, country: stage.country, risk: primaryRisk, factor: 1 },
      { tier: "Alternate", label: stage.alternate, country: stage.alternateCountry, risk: alternateRisk, factor: 0.42 },
      { tier: "Contingency", label: `${stage.label} contingency reserve`, country: stage.alternateCountry, risk: Math.max(25, primaryRisk - 9), factor: 0.2 },
    ] as const).map((variant, variantIndex) => ({
      id: `${seed.code}-N-${String(stageIndex + 1).padStart(2, "0")}-${variantIndex + 1}`,
      stageId: stages[stageIndex].id,
      label: variant.label,
      assetType: stage.label,
      geography: variant.country === "Global" ? "Global" : variant.country,
      country: variant.country,
      tier: variant.tier,
      role: stage.role,
      capacity: `${Math.round(base * (variant.factor + 0.28)).toLocaleString("en-US")} ${blueprint.unit}`,
      throughput: `${Math.round(base * variant.factor).toLocaleString("en-US")} ${blueprint.unit}`,
      annualValue: `$${Math.round((base * (projectIndex + 3) * variant.factor) / 3)}M`,
      utilization: Math.min(98, 66 + ((projectIndex * 7 + stageIndex * 5 + variantIndex * 9) % 33)),
      leadTime: 4 + ((projectIndex * 5 + stageIndex * 7 + variantIndex * 11) % 47),
      concentration: Math.min(96, 41 + ((projectIndex * 11 + stageIndex * 9 + variantIndex * 7) % 55)),
      riskScore: variant.risk,
      confidence: 78 + ((projectIndex * 3 + stageIndex * 2 + variantIndex) % 20),
      freshness: `${3 + ((projectIndex + stageIndex + variantIndex) % 47)} sec modeled age`,
      sourceClass: variant.tier === "Primary" ? "Synthetic operational twin" : "Synthetic qualification register",
      evidenceRef: `${seed.code}-EV-NET-${String(stageIndex + 1).padStart(2, "0")}-${variantIndex + 1}`,
      status: nodeStatusFor(variant.risk),
    } satisfies SupplyChainNode));
  });
  const primaryNodes = nodes.filter((node) => node.tier === "Primary");
  const alternateNodes = nodes.filter((node) => node.tier === "Alternate");
  const contingencyNodes = nodes.filter((node) => node.tier === "Contingency");
  const edges: SupplyChainEdge[] = [];
  for (let stageIndex = 0; stageIndex < stages.length - 1; stageIndex += 1) {
    for (const tierNodes of [primaryNodes, alternateNodes, contingencyNodes]) {
      const from = tierNodes[stageIndex];
      const to = tierNodes[stageIndex + 1];
      const share = from.tier === "Primary" ? 58 + ((projectIndex * 5 + stageIndex * 7) % 35) : 12 + ((projectIndex * 3 + stageIndex * 5) % 24);
      edges.push({
        id: `${seed.code}-E-${String(edges.length + 1).padStart(2, "0")}`,
        from: from.id,
        to: to.id,
        relationship: stageIndex === stages.length - 2 ? "fulfills" : "supplies",
        volume: from.throughput,
        value: from.annualValue,
        share,
        leadTime: from.leadTime,
        mode: blueprint.stages[stageIndex].mode,
        riskScore: Math.max(from.riskScore, to.riskScore),
        evidenceRef: `${seed.code}-EV-EDGE-${String(edges.length + 1).padStart(2, "0")}`,
      });
    }
    const alternate = alternateNodes[stageIndex];
    const primaryNext = primaryNodes[stageIndex + 1];
    edges.push({
      id: `${seed.code}-E-${String(edges.length + 1).padStart(2, "0")}`,
      from: alternate.id,
      to: primaryNext.id,
      relationship: "qualified fallback",
      volume: alternate.throughput,
      value: alternate.annualValue,
      share: 8 + ((projectIndex + stageIndex * 3) % 17),
      leadTime: alternate.leadTime + 3,
      mode: blueprint.stages[stageIndex].mode,
      riskScore: Math.max(alternate.riskScore, primaryNext.riskScore),
      evidenceRef: `${seed.code}-EV-EDGE-${String(edges.length + 1).padStart(2, "0")}`,
    });
    const contingency = contingencyNodes[stageIndex];
    const alternateNext = alternateNodes[stageIndex + 1];
    edges.push({
      id: `${seed.code}-E-${String(edges.length + 1).padStart(2, "0")}`,
      from: contingency.id,
      to: alternateNext.id,
      relationship: "emergency substitution",
      volume: contingency.throughput,
      value: contingency.annualValue,
      share: 3 + ((projectIndex + stageIndex * 2) % 11),
      leadTime: contingency.leadTime + 7,
      mode: blueprint.stages[stageIndex].mode,
      riskScore: Math.max(contingency.riskScore, alternateNext.riskScore),
      evidenceRef: `${seed.code}-EV-EDGE-${String(edges.length + 1).padStart(2, "0")}`,
    });
  }
  const checkpoints = stages.flatMap((stage, stageIndex) => {
    const primary = primaryNodes[stageIndex];
    const nextStage = stages[Math.min(stageIndex + 1, stages.length - 1)];
    const capacityScore = Math.min(97, Math.round(primary.utilization * 0.72 + primary.riskScore * 0.28));
    const concentrationScore = primary.concentration;
    return ([
      { category: "Capacity", score: capacityScore, observed: primary.utilization, target: 85, unit: "% utilization", title: `${stage.label} capacity guardrail` },
      { category: "Concentration", score: concentrationScore, observed: primary.concentration, target: 65, unit: "% on primary path", title: `${stage.label} dependency guardrail` },
    ] as const).map((checkpoint, checkpointIndex) => ({
      id: `${seed.code}-CP-${String(stageIndex + 1).padStart(2, "0")}-${checkpointIndex + 1}`,
      stageId: stage.id,
      title: checkpoint.title,
      category: checkpoint.category,
      severity: severityFor(checkpoint.score),
      status: checkpoint.observed > checkpoint.target + 10 ? "breached" : checkpoint.observed > checkpoint.target - 7 ? "near limit" : "within guardrail",
      observed: checkpoint.observed,
      target: checkpoint.target,
      unit: checkpoint.unit,
      trend: checkpointIndex === 0 ? `${stageIndex % 2 ? "+" : "-"}${2 + ((projectIndex + stageIndex) % 9)} pts / 24h` : `${stageIndex % 3 ? "+" : "-"}${1 + ((projectIndex + stageIndex * 2) % 7)} pts / 7d`,
      owner: checkpointIndex === 0 ? "Manufacturing Planner" : "Supplier Cartographer",
      cadence: checkpointIndex === 0 ? "5-second simulation tick" : "15-minute graph refresh",
      lastObserved: `14:${String(2 + stageIndex * 3 + checkpointIndex).padStart(2, "0")}:${String(8 + projectIndex).padStart(2, "0")} IST`,
      trigger: checkpointIndex === 0 ? `Escalate above ${checkpoint.target}% sustained utilization.` : `Escalate above ${checkpoint.target}% single-path dependency.`,
      downstreamImpact: `${nextStage.label}: ${seed.resilience.p95}; ${seed.outcome}`,
      response: checkpoint.observed <= checkpoint.target - 7 ? "Monitor and preserve the qualified fallback." : seed.response,
      evidenceRef: `${seed.code}-EV-CP-${String(stageIndex + 1).padStart(2, "0")}-${checkpointIndex + 1}`,
    } satisfies SupplyChainCheckpoint));
  });
  const signals = stages.flatMap((stage, stageIndex) => {
    const primary = primaryNodes[stageIndex];
    return ([
      { label: `${stage.label} flow`, value: primary.throughput, delta: `${stageIndex % 2 ? "+" : "-"}${1 + ((projectIndex + stageIndex) % 8)}.2% vs plan`, status: primary.utilization > 90 ? "critical" : primary.utilization > 82 ? "watch" : "stable" },
      { label: `${stage.label} lead time`, value: `${primary.leadTime} days`, delta: `P95 ${primary.leadTime + 6 + (stageIndex % 5)} days`, status: primary.leadTime > 35 ? "critical" : primary.leadTime > 22 ? "watch" : "stable" },
    ] as const).map((signal, signalIndex) => ({
      id: `${seed.code}-SIG-${String(stageIndex + 1).padStart(2, "0")}-${signalIndex + 1}`,
      stageId: stage.id,
      label: signal.label,
      value: signal.value,
      delta: signal.delta,
      status: signal.status,
      observedAt: `14:${String(2 + stageIndex * 2).padStart(2, "0")}:${String(12 + signalIndex * 9).padStart(2, "0")} IST`,
      evidenceRef: `${seed.code}-EV-SIG-${String(stageIndex + 1).padStart(2, "0")}-${signalIndex + 1}`,
    } satisfies SupplyChainSignal));
  });
  return { unit: blueprint.unit, stages, nodes, edges, checkpoints, signals };
};

const timelineFor = (seed: ProjectSeed): CaseStudyProfile["timeline"] => [
  {
    time: "14:02:08",
    actor: "Signal Watch",
    event: seed.trigger,
    state: "signal",
  },
  {
    time: "14:02:11",
    actor: "Evidence Auditor",
    event: `Bound the signal to ${seed.datasets.length} project-only data products and challenged missing provenance.`,
    state: "analysis",
  },
  {
    time: "14:02:16",
    actor: "Geopolitical Sentinel",
    event: `Activated scenario: ${seed.shock}.`,
    state: "analysis",
  },
  {
    time: "14:02:27",
    actor: "OR Formulator",
    event: `Formulated ${seed.decision.toLowerCase()} using ${seed.methodCodes.slice(0, 5).join(" + ")}.`,
    state: "analysis",
  },
  {
    time: "14:02:39",
    actor: "Solver Operator",
    event: `Replayed 2,000 seeded scenarios; candidate response: ${seed.response}`,
    state: "decision",
  },
  {
    time: "14:02:44",
    actor: seed.owner,
    event:
      "Opened the evidence, constraints, tail-risk metrics, and rejected alternatives for human review.",
    state: "review",
  },
];

export const caseStudyProfiles: readonly CaseStudyProfile[] = seeds.map(
  (seed, projectIndex) => ({
    projectId: seed.id,
    company: seed.client,
    project: seed.name,
    product: seed.product,
    publicContext: seed.publicContext,
    publicSource: seed.publicSource,
    shock: seed.shock,
    trigger: seed.trigger,
    decision: seed.decision,
    response: seed.response,
    baseline: seed.resilience.baseline,
    resilient: seed.resilience.resilient,
    confidence: seed.resilience.confidence,
    p50: seed.resilience.p50,
    p90: seed.resilience.p90,
    p95: seed.resilience.p95,
    worstCase: seed.resilience.worstCase,
    cvar: seed.resilience.cvar,
    hardConstraints: seed.hardConstraints,
    methods: seed.methodCodes,
    apps: seed.mountedAppIds,
    datasets: seed.datasets,
    supplyChain: networkFor(seed, projectIndex),
    timeline: timelineFor(seed),
  }),
);

const taxonomyParentAdditions: Readonly<
  Record<string, { l2?: readonly string[]; l1?: readonly string[] }>
> = {
  "P-001": { l2: ["L2-006"], l1: ["L1-032"] },
  "P-002": { l1: ["L1-051"] },
  "P-003": { l2: ["L2-027"], l1: ["L1-018", "L1-050"] },
  "P-004": { l2: ["L2-006"], l1: ["L1-008", "L1-019"] },
  "P-005": { l2: ["L2-006"], l1: ["L1-019", "L1-053"] },
  "P-006": { l2: ["L2-008", "L2-021"], l1: ["L1-014"] },
  "P-007": { l2: ["L2-006"], l1: ["L1-018", "L1-019"] },
  "P-008": { l1: ["L1-030"] },
  "P-009": { l2: ["L2-021"], l1: ["L1-008", "L1-014", "L1-017", "L1-030"] },
  "P-010": { l1: ["L1-008", "L1-010", "L1-014", "L1-017", "L1-032"] },
};

const canonicalVariablePack = (
  seed: ProjectSeed,
): WorkspaceProject["variablePack"] => {
  const additions = taxonomyParentAdditions[seed.code] ?? {};
  return {
    l2: [...new Set([...seed.variablePack.l2, ...(additions.l2 ?? [])])],
    l1: [...new Set([...seed.variablePack.l1, ...(additions.l1 ?? [])])],
    l0: seed.variablePack.l0,
  };
};

export const caseStudyProjects: readonly WorkspaceProject[] = seeds.map(
  (seed) => ({
    id: seed.id,
    origin: "Seed fixture",
    sectorId: seed.sectorId,
    sector: seed.sector,
    clientId: seed.clientId,
    client: seed.client,
    name: seed.name,
    code: seed.code,
    problem: seed.problem,
    outcome: seed.outcome,
    stage: seed.stage,
    health: seed.health,
    currency: seed.currency,
    regions: seed.regions,
    owner: seed.owner,
    classification: seed.classification,
    dataResidency: seed.dataResidency,
    counts: { ...seed.counts, apps: seed.mountedAppIds.length },
    metrics: seed.metrics,
    mountedAppIds: seed.mountedAppIds,
    variablePack: canonicalVariablePack(seed),
    methodCodes: seed.methodCodes,
    simulation: {
      disclaimer: simulationDisclaimer,
      clock: "07 Sep 2026 · 14:02:44 IST",
      cadence: "Deterministic event replay · 5-second simulated ticks",
      scenarioId: `SCN-${seed.code.slice(2)}-CRISIS-01`,
      scenario: seed.shock,
      trigger: seed.trigger,
      decision: seed.decision,
      baseline: seed.resilience.baseline,
      resilient: seed.resilience.resilient,
      confidence: seed.resilience.confidence,
      p50: seed.resilience.p50,
      p90: seed.resilience.p90,
      p95: seed.resilience.p95,
      worstCase: seed.resilience.worstCase,
      cvar: seed.resilience.cvar,
    },
  }),
);

export function caseStudyProfileFor(projectOrId: WorkspaceProject | string) {
  const id = typeof projectOrId === "string" ? projectOrId : projectOrId.id;
  return caseStudyProfiles.find((profile) => profile.projectId === id);
}
