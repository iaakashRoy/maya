/**
 * Public context researched on 2026-09-09, with deliberately separate scenario inputs.
 * Company names identify educational case studies, not tanjnx customers.
 * No number in `scenario` is an observed company operating value. Regime probabilities
 * are editable expert assumptions, not statistically fitted forecasts.
 */
export type OsPublicSource = {
  id: string;
  title: string;
  url: string;
  publishedOn: string | null;
  asOf: string;
  fetchedOn: string;
  freshnessNote: string;
};

export type OsRegime = {
  name: "Normal" | "Constrained" | "Disrupted";
  leadDays: number;
  capacityFactor: number;
  /** One weekly transition; column order Normal, Constrained, Disrupted. */
  transition: [number, number, number];
};

export type OsCaseEvidence = {
  clientId: string;
  projectId: string;
  company: string;
  product: string;
  publicContext: { fact: string; sourceId: string; asOf: string }[];
  sources: OsPublicSource[];
  scenario: {
    label: string;
    kind: "hypothetical-stress-test";
    scope: string;
    horizonWeeks: number;
    demandPerWeek: number;
    capacityPerWeek: number;
    qualifiedAlternatePerWeek: number;
    inventoryUnits: number;
    unit: string;
    currency: "USD";
    baseLeadDays: number;
    capacityLossPct: number;
    demandSurgePct: number;
    qualityYieldPct: number;
    expeditePremiumPerUnit: number;
    unitMargin: number;
    qualificationWeek: number;
    serviceFloorPct: number;
    budget: number;
    regimes: [OsRegime, OsRegime, OsRegime];
    operationalInputs: { label: string; value: number; unit: string; meaning: string }[];
  };
  scenarioNarrative: string;
  decisionQuestion: string;
  hardConstraints: string[];
  monitoredSignals: string[];
  toolSequence: string[];
  outcomeInterpretation: string;
};

export const osEvidenceFetchedOn = "2026-09-09";

const source = (id: string, title: string, url: string, publishedOn: string | null, asOf: string, freshnessNote: string): OsPublicSource => ({
  id, title, url, publishedOn, asOf, fetchedOn: osEvidenceFetchedOn, freshnessNote,
});

const publicSources = {
  appleMagnets: source("APPLE-MAGNETS-2025", "Apple: $500 million MP Materials commitment", "https://www.apple.com/newsroom/2025/07/apple-expands-us-supply-chain-with-500-million-usd-commitment/", "2025-07-15", "2025-07-15", "Dated investment announcement; does not prove currently qualified available capacity."),
  appleMaterials: source("APPLE-MATERIALS-2026", "Apple: 2026 environmental progress update", "https://www.apple.com/ie/newsroom/2026/04/apple-accelerates-progress-with-highest-ever-recycled-material-in-its-products/", "2026-04-16", "2025-12-31", "Reports 2025 material outcomes; shipment and component exceptions remain those in the source."),
  cokeWater: source("COKE-WATER-2025", "Coca-Cola: environmental indicators for 2025", "https://www.coca-colacompany.com/about-us/environment", null, "2025-12-31", "Publication date not stated on page. Annual group indicators are not a local water permit or reservoir reading."),
  cokeVolume: source("COKE-10K-2025", "Coca-Cola: 2025 Form 10-K", "https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0001628280-26-010047/ko-20251231.htm", "2026-02-20", "2025-12-31", "Annual system totals; selected bottler demand must come from a separate operational feed."),
  keringImpact: source("KERING-IMPACT-2026", "Kering: 2016–2025 impact report release", "https://www.kering.com/en/news/kering-publishes-10-year-impact-report-charting-a-decade-of-action/", "2026-06-04", "2025-12-31", "Group-level sourcing result; not evidence that an individual Gucci lot has passed traceability checks."),
  keringResults: source("GUCCI-RESULTS-2025", "Kering: 2025 results, Gucci section", "https://www.kering.com/en/news/2025-results-sequential-improvement-unlocking-the-next-phase-of-sustainable-and-profitable-growth/", "2026-02-10", "2025-12-31", "Annual brand demand context; not a 2026 collection forecast."),
  tataResults: source("TATA-RESULTS-FY25", "Tata Motors: consolidated Q4 FY25 results", "https://www.tatamotors.com/press-releases/tata-motors-consolidated-q4-fy25-results/", "2025-05-13", "2025-03-31", "Historical pre-demerger reporting perimeter; not a statement of today's corporate structure or vehicle allocation."),
  redSea: source("UNCTAD-REDSEA-2024", "UNCTAD: shipping disruptions and global trade", "https://unctad.org/news/unprecedented-shipping-disruptions-raise-risk-global-trade-unctad-warns", "2024-02-22", "2024-02-22", "Historical disruption benchmark. The scenario does not assert that these transit declines continue today."),
  teslaDeliveries: source("TESLA-DEPLOYMENTS-2025", "Tesla: 2025 production, deliveries and deployments", "https://ir.tesla.com/press-release/tesla-fourth-quarter-2025-production-deliveries-deployments", "2026-01-02", "2025-12-31", "Reported annual deliveries and energy deployments; no pack BOM, site yield or cell allocation disclosed here."),
  ieaMinerals: source("IEA-MINERALS-2025", "IEA: Global Critical Minerals Outlook 2025, executive summary", "https://www.iea.org/reports/global-critical-minerals-outlook-2025/executive-summary", "2025-05-21", "2024-12-31", "Historical refining concentration context; no inference that a named company buys from a particular supplier."),
  bydThailand: source("BYD-THAILAND-2024", "BYD: Thailand plant inauguration", "https://www.byd.com/sc/news-list/BYD-roll-off-of-lts-8-millionth-new-energy-vehicle", "2024-07-04", "2024-07-04", "Announced annual nameplate capacity, not current throughput or origin eligibility."),
  euBev: source("EC-BEV-DUTIES-2024", "European Commission: definitive BEV countervailing duties", "https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_24_5589/IP_24_5589_EN.pdf", "2024-10-29", "2024-10-29", "Historical legal-policy snapshot. Refresh tariff classification, origin and any undertakings before an actual decision."),
  euUndertakings: source("EC-BEV-GUIDANCE-2026", "European Commission: BEV price undertaking guidance", "https://policy.trade.ec.europa.eu/news/commission-issues-guidance-document-submission-price-undertaking-offers-battery-electric-vehicles-2026-01-12_en", "2026-01-12", "2026-01-12", "Guidance is not an approved company undertaking or a current applicable duty calculation."),
  hersheyCocoa: source("HERSHEY-COCOA-2025", "Hershey: cocoa market volatility and sourcing", "https://www.thehersheycompany.com/en_us/home/newsroom/blog/cocoa-market-turmoil-how-hershey-is-innovating-through-unprecedented-challenges.html", "2025-04-30", "2025-04-30", "Historical company commentary; not a current cocoa price feed."),
  hersheyTrace: source("HERSHEY-TRACE-2024", "Hershey: progress on cocoa and sourcing priorities", "https://www.thehersheycompany.com/en_us/home/sustainability/progress-on-priorities.html", null, "2024-12-31", "Page gives 2024 progress and mass-balance definitions; publication date is not stated."),
  hersheyResilience: source("HERSHEY-RESILIENCE-2026", "Hershey: Source, Make, Delight", "https://www.thehersheycompany.com/en_us/home/newsroom/blog/source-make-delight-how-hershey-is-building-a-more-resilient-business.html", "2026-06-10", "2025-12-31", "2025 strategy and program progress; does not measure the simulated seasonal programme."),
  tsmcCapacity: source("TSMC-ANNUAL-2025", "TSMC: 2025 annual report", "https://investor.tsmc.com/static/annualReports/2025/english/index.html", null, "2025-12-31", "Exact publication date not stated on landing page. Aggregate capacity cannot be exchanged freely across process nodes."),
  tsmcEarthquake: source("TSMC-EARTHQUAKE-2025", "TSMC: January 2025 revenue and earthquake statement", "https://pr.tsmc.com/english/news/3204", "2025-02-10", "2025-02-10", "Historical preliminary loss estimate, not an active outage or present recovery forecast."),
  airbusDeliveries: source("AIRBUS-DELIVERIES-2025", "Airbus: 793 commercial deliveries in 2025", "https://www.airbus.com/en/newsroom/press-releases/2026-01-airbus-reports-793-commercial-aircraft-deliveries-in-2025", "2026-01-12", "2025-12-31", "Annual delivered aircraft and backlog; not current configuration-level availability."),
  airbusEngines: source("AIRBUS-RESULTS-2025", "Airbus: FY2025 results and production constraints", "https://www.airbus.com/en/newsroom/press-releases/2026-02-airbus-reports-full-year-fy-2025-results", "2026-02-19", "2026-02-19", "Dated management statement about engine shortages; ramp targets are forward-looking, not observed output."),
  pfizerRestart: source("PFIZER-RESTART-2023", "Pfizer: Rocky Mount production restart", "https://www.pfizer.com/news/articles/pfizers_rocky_mount_facility_restarts_production_amid_first_phase_post_tornado", "2023-09-25", "2023-09-25", "Historical recovery example. Do not present the 2023 tornado as an ongoing facility outage."),
  pfizerRecovered: source("HEALTHCANADA-PFIZER-2024", "Health Canada: Pfizer facility supply notice, updated", "https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/drug-shortages/information-consumers/supply-notices/pfizer-facility-tornado-damage.html", "2023-08-03", "2024-05-28", "Update states production resumed and immediate impacts were remediated; retained as closed historical evidence."),
  pfizerReview: source("PFIZER-REVIEW-2025", "Pfizer: 2025 annual review", "https://annualreview.pfizer.com/", null, "2025-12-31", "Annual access-program context; no current patient allocation, drug substitution, or temperature specification supplied."),
};

const regimes = (normal: number, constrained: number, disrupted: number, capacity: [number, number, number], rows: [[number, number, number], [number, number, number], [number, number, number]]): [OsRegime, OsRegime, OsRegime] => [
  { name: "Normal", leadDays: normal, capacityFactor: capacity[0], transition: rows[0] },
  { name: "Constrained", leadDays: constrained, capacityFactor: capacity[1], transition: rows[1] },
  { name: "Disrupted", leadDays: disrupted, capacityFactor: capacity[2], transition: rows[2] },
];
const input = (label: string, value: number, unit: string, meaning: string) => ({ label, value, unit, meaning });

export const osCaseEvidence: OsCaseEvidence[] = [
  {
    clientId: "apple", projectId: "apple-launch-continuity", company: "Apple", product: "Priority smartphone and wearable launch configurations",
    publicContext: [
      { fact: "Apple announced a $500 million multiyear commitment for MP Materials magnets and a planned rare-earth recycling line.", sourceId: publicSources.appleMagnets.id, asOf: "2025-07-15" },
      { fact: "Apple reported 30% recycled material across products shipped in 2025 and 100% recycled rare-earth elements in magnets, subject to stated inventory exceptions.", sourceId: publicSources.appleMaterials.id, asOf: "2025-12-31" },
    ], sources: [publicSources.appleMagnets, publicSources.appleMaterials],
    scenario: {
      label: "Magnet qualification meets a Taiwan-route interruption", kind: "hypothetical-stress-test", scope: "One regional launch cohort; not Apple worldwide production", horizonWeeks: 8, demandPerWeek: 10000, capacityPerWeek: 11200, qualifiedAlternatePerWeek: 3500, inventoryUnits: 4800, unit: "devices", currency: "USD", baseLeadDays: 12, capacityLossPct: 32, demandSurgePct: 12, qualityYieldPct: 98.4, expeditePremiumPerUnit: 28, unitMargin: 180, qualificationWeek: 2, serviceFloorPct: 95, budget: 700000,
      regimes: regimes(12, 21, 35, [1, 0.78, 0.48], [[0.78, 0.18, 0.04], [0.20, 0.58, 0.22], [0.08, 0.32, 0.60]]),
      operationalInputs: [input("Magnet-ready inventory", 6200, "component sets", "Only eligible magnet sets; not interchangeable with finished devices."), input("Priority configuration share", 68, "%", "Contracted launch mix assumption."), input("Airfreight allocation", 1800, "devices/week", "Reserved lane ceiling, not unlimited expedite."), input("Magnet lot quarantine", 11, "%", "Modeled certificate mismatch removes affected component lots."), input("Assembly overtime ceiling", 8, "%", "Maximum added hours on qualified lines."), input("Launch freeze", 14, "days", "Frozen configuration window before release.")],
    },
    scenarioNarrative: "An assumed export-clearance delay interrupts a component route while a second magnet lot lacks accepted origin evidence. A regional launch demand pulse coincides with constrained air capacity. Announced future magnet investment cannot be treated as stock available this week.",
    decisionQuestion: "Which qualified component, assembly and transport allocations protect priority launch service within $700,000 of incremental authority?",
    hardConstraints: ["Every shipped configuration requires a complete qualified BOM.", "Quarantined magnet lots contribute zero usable supply.", "Airfreight cannot exceed 1,800 devices per week.", "New capacity is unavailable before qualification release."],
    monitoredSignals: ["Component certificate status · on change · reject missing origin", "Assembly first-pass yield · every shift · investigate below 98%", "Carrier ETA changes · hourly when connected · replan beyond +3 days", "Launch orders by configuration · daily · check mix before volume"],
    toolSequence: ["Data: reconcile component lots", "Statistics: demand and lead-time regimes", "Supplier Graph: common magnet dependencies", "Network Optimizer: qualified allocation", "Simulation: correlated route and yield stress", "Quality Gate: approve exact revision"],
    outcomeInterpretation: "Compare service on complete devices and the lower-tail result across repeated stress paths. Protected contribution is a modeled opportunity measure; it is not reported Apple revenue or realized savings.",
  },
  {
    clientId: "coca-cola", projectId: "cocacola-water-to-shelf", company: "Coca-Cola", product: "Regional Coca-Cola and Zero Sugar bottle/can mix",
    publicContext: [
      { fact: "The Coca-Cola system sold 33.8 billion unit cases in 2025; Trademark Coca-Cola represented 47% of worldwide volume.", sourceId: publicSources.cokeVolume.id, asOf: "2025-12-31" },
      { fact: "Coca-Cola reports that 34% of high-risk locations individually replenished at least 100% of their water use in 2025.", sourceId: publicSources.cokeWater.id, asOf: "2025-12-31" },
    ], sources: [publicSources.cokeVolume, publicSources.cokeWater],
    scenario: {
      label: "Heatwave, watershed allocation and packaging shortage", kind: "hypothetical-stress-test", scope: "Three modeled bottlers serving one regional retail network", horizonWeeks: 8, demandPerWeek: 42000, capacityPerWeek: 46000, qualifiedAlternatePerWeek: 12000, inventoryUnits: 11000, unit: "unit cases", currency: "USD", baseLeadDays: 5, capacityLossPct: 28, demandSurgePct: 18, qualityYieldPct: 99.2, expeditePremiumPerUnit: 1.8, unitMargin: 5, qualificationWeek: 1, serviceFloorPct: 96, budget: 180000,
      regimes: regimes(5, 9, 16, [1, 0.81, 0.55], [[0.72, 0.24, 0.04], [0.16, 0.66, 0.18], [0.06, 0.24, 0.70]]),
      operationalInputs: [input("Water withdrawal cap", 720000, "litres/week", "Hypothetical permit ceiling across the selected bottler scope."), input("Beverage volume per unit case", 5.678, "litres", "24 eight-US-fluid-ounce servings; a unit case is not a physical shipping carton."), input("Process water ratio", 1.65, "litres/litre beverage", "Modeled facility requirement, distinct from company sustainability totals."), input("Can allocation loss", 22, "%", "Limits only can-pack SKUs."), input("Inter-bottler transfer limit", 9000, "unit cases/week", "Qualified lanes and shelf-life eligible product."), input("Minimum remaining shelf life", 60, "days", "Customer acceptance assumption at receipt.")],
    },
    scenarioNarrative: "Assume a local heatwave increases demand while a water authority reduces withdrawal and a can supplier loses output. Transfer qualified production, change the pack mix where customers allow it, and preserve local water limits. Group replenishment credits do not increase a local withdrawal permit.",
    decisionQuestion: "What bottler and pack allocation meets the modeled 96% service floor without exceeding water, packaging and shelf-life limits?",
    hardConstraints: ["Apply withdrawal limits at each watershed; no cross-basin offset.", "Maintain recipe and packaging approval per SKU.", "Use stock only when remaining shelf life meets the customer gate.", "Returnable packaging loops must balance containers, wash capacity and collection."],
    monitoredSignals: ["Water meters · every 15 minutes when connected · compare with permitted draw", "Retail scan demand · daily · separate weather pulse from baseline", "Can supplier confirmed output · daily · check SKU compatibility", "Warehouse expiry distribution · each receipt · first-expiry allocation"],
    toolSequence: ["Demand Sense: heat-sensitive demand", "Statistics: demand residuals and change points", "Manufacturing Twin: water and changeover capacity", "Network Optimizer: bottler/pack allocation", "Simulation: drought persistence", "Flow Lens: transfer cash and waste"],
    outcomeInterpretation: "Read service together with water usage, expiry loss and pack substitutions. A plan that improves availability by breaking the water cap is infeasible, irrespective of contribution.",
  },
  {
    clientId: "gucci", projectId: "gucci-traceable-collection", company: "Gucci", product: "Traceable leather goods for a seasonal collection",
    publicContext: [
      { fact: "Gucci reported €6 billion 2025 revenue, down 19% on a comparable basis; directly operated retail represented 92% of sales.", sourceId: publicSources.keringResults.id, asOf: "2025-12-31" },
      { fact: "Kering reported 97% traceability and 86% alignment with its standards for key raw materials across the group.", sourceId: publicSources.keringImpact.id, asOf: "2025-12-31" },
    ], sources: [publicSources.keringResults, publicSources.keringImpact],
    scenario: {
      label: "Collection launch with leather quarantine and regional demand divergence", kind: "hypothetical-stress-test", scope: "One modeled collection and artisan network", horizonWeeks: 10, demandPerWeek: 1800, capacityPerWeek: 2100, qualifiedAlternatePerWeek: 480, inventoryUnits: 620, unit: "pieces", currency: "USD", baseLeadDays: 21, capacityLossPct: 24, demandSurgePct: 7, qualityYieldPct: 94.5, expeditePremiumPerUnit: 140, unitMargin: 680, qualificationWeek: 3, serviceFloorPct: 92, budget: 450000,
      regimes: regimes(21, 34, 49, [1, 0.77, 0.51], [[0.83, 0.14, 0.03], [0.23, 0.61, 0.16], [0.10, 0.38, 0.52]]),
      operationalInputs: [input("Quarantined leather lots", 17, "%", "Modeled lot-level origin gap, not a Gucci sourcing allegation."), input("Artisan assembly time", 4.6, "hours/piece", "Product-family routing assumption."), input("Available skilled labor", 9800, "hours/week", "Cannot substitute general labor for certified artisan hours."), input("Rework load", 6, "%", "Consumes the same constrained finishing station."), input("Region A demand change", -12, "%", "Demand scenario may fall while another region grows."), input("Late-season markdown exposure", 18, "% of unit margin", "Illustrative obsolescence penalty, not actual Gucci pricing.")],
    },
    scenarioNarrative: "An assumed origin-document gap quarantines leather while regional collection demand diverges. A high average forecast hides overstock in one market and a launch shortfall in another. The useful response is a smaller eligible mix and staged release, not unrestricted volume recovery.",
    decisionQuestion: "How should eligible leather, artisan hours and store allocations be sequenced to protect collection availability while containing obsolete stock?",
    hardConstraints: ["No lot can inherit traceability solely from the group average.", "Maintain artisan skill and finishing-quality requirements.", "Do not pool region-specific demand or reorder windows blindly.", "Release quarantine only after evidence approval."],
    monitoredSignals: ["Lot origin coverage · on receipt · hold incomplete genealogy", "Store sell-through by collection · daily · compare regions", "Rework hours · each shift · protect finishing capacity", "Supplier certificate expiry · daily · alert before next purchase"],
    toolSequence: ["Supplier Graph: hide and lot genealogy", "Data: origin evidence review", "Statistics: regional demand uncertainty", "Workforce Studio: artisan capacity", "Network Optimizer: eligible mix and allocation", "Simulation: markdown and rework tails"],
    outcomeInterpretation: "Compare sell-through, eligible fill rate and end-of-season stock. Higher throughput alone is not a better result when it increases markdown exposure or consumes uncertified lots.",
  },
  {
    clientId: "tata-motors", projectId: "tata-vehicle-continuity", company: "Tata Motors", product: "Qualified controller sets across a mixed vehicle programme",
    publicContext: [
      { fact: "Tata Motors reported FY25 passenger-vehicle EV penetration of 11% and CNG penetration of 25%, illustrating a mixed-powertrain planning problem.", sourceId: publicSources.tataResults.id, asOf: "2025-03-31" },
      { fact: "UNCTAD reported a 67% fall in weekly container-ship Suez transits during the February 2024 disruption.", sourceId: publicSources.redSea.id, asOf: "2024-02-22" },
    ], sources: [publicSources.tataResults, publicSources.redSea],
    scenario: {
      label: "Controller allocation cut and a Cape-route delay", kind: "hypothetical-stress-test", scope: "One modeled mixed-powertrain vehicle schedule; FY25 context", horizonWeeks: 8, demandPerWeek: 3200, capacityPerWeek: 3700, qualifiedAlternatePerWeek: 850, inventoryUnits: 950, unit: "vehicles", currency: "USD", baseLeadDays: 16, capacityLossPct: 26, demandSurgePct: 9, qualityYieldPct: 97.6, expeditePremiumPerUnit: 240, unitMargin: 2200, qualificationWeek: 2, serviceFloorPct: 94, budget: 1500000,
      regimes: regimes(16, 28, 42, [1, 0.80, 0.57], [[0.80, 0.15, 0.05], [0.18, 0.60, 0.22], [0.07, 0.33, 0.60]]),
      operationalInputs: [input("Shared ECU supply cut", 30, "%", "Selected controller family in the scenario."), input("Service-part reservation", 140, "controller sets/week", "Protected before vehicle assembly allocation."), input("EV-specific test capacity", 900, "vehicles/week", "Powertrain-dependent test bottleneck."), input("Variant changeover", 55, "minutes/change", "Sequence-dependent setup assumption."), input("Cape diversion addition", 12, "days", "Modeled increment, not a current carrier quote."), input("Dealer committed share", 76, "%", "Committed orders prioritized over unconstrained forecasts.")],
    },
    scenarioNarrative: "Assume a controller supplier cuts confirmed allocation and an inbound vessel diverts. Shared ECUs do not make vehicle variants interchangeable: harness, software, test and certification eligibility still differ. Preserve service parts while resequencing the executable vehicle mix.",
    decisionQuestion: "Which configuration-complete builds and controller transfers preserve service commitments within the recovery budget?",
    hardConstraints: ["Controller substitutions require software and configuration approval.", "Reserve service parts before production allocation.", "Respect powertrain-specific testing slots.", "Treat the route diversion as an assumption until a carrier confirms it."],
    monitoredSignals: ["ECU supplier confirmations · daily · compare allocation revision", "Vehicle BOM completeness · per build · gate missing components", "Port and vessel ETA · hourly when connected · track +12-day scenario", "Service fill rate · daily · prevent production crowd-out"],
    toolSequence: ["Risk Radar: controller exposure", "Supplier Graph: common component dependencies", "Statistics: route delay regimes", "Manufacturing Twin: variant sequence", "Network Optimizer: configuration allocation", "Simulation: supplier/route co-disruption"],
    outcomeInterpretation: "Count released, complete vehicles and service fulfillment separately. The scenario is an educational programme slice, not Tata Motors' current sales forecast or post-demerger operating plan.",
  },
  {
    clientId: "tesla", projectId: "tesla-closed-loop-battery", company: "Tesla", product: "Qualified battery packs and competing storage commitments",
    publicContext: [
      { fact: "Tesla reported 1,636,129 vehicle deliveries and 46.7 GWh of energy-storage deployments for 2025.", sourceId: publicSources.teslaDeliveries.id, asOf: "2025-12-31" },
      { fact: "IEA reported that the top three refining nations' average share of key energy minerals rose from roughly 82% in 2020 to 86% in 2024.", sourceId: publicSources.ieaMinerals.id, asOf: "2024-12-31" },
    ], sources: [publicSources.teslaDeliveries, publicSources.ieaMinerals],
    scenario: {
      label: "Graphite delay plus cell yield and recycling uncertainty", kind: "hypothetical-stress-test", scope: "One modeled battery programme; cells are chemistry-specific", horizonWeeks: 8, demandPerWeek: 5400, capacityPerWeek: 6100, qualifiedAlternatePerWeek: 1600, inventoryUnits: 1700, unit: "pack equivalents", currency: "USD", baseLeadDays: 18, capacityLossPct: 29, demandSurgePct: 11, qualityYieldPct: 96.8, expeditePremiumPerUnit: 310, unitMargin: 1700, qualificationWeek: 2, serviceFloorPct: 95, budget: 3000000,
      regimes: regimes(18, 31, 48, [1, 0.75, 0.46], [[0.76, 0.19, 0.05], [0.17, 0.61, 0.22], [0.06, 0.28, 0.66]]),
      operationalInputs: [input("Energy per pack equivalent", 75, "kWh", "Common reporting unit, not a claim that all Tesla packs are 75 kWh."), input("Eligible recycled input", 7, "%", "Only assay-released recovery volume is credited."), input("Recycling recovery uncertainty", 18, "% relative", "Scenario spread around the modeled recovery mean."), input("Formation dwell", 48, "hours", "Constrained process hold before cell release."), input("Minimum safety stock", 700, "pack equivalents", "Protected against correlated material delays."), input("Storage commitment share", 20, "%", "Separate eligible chemistry pool; cannot swap without approval.")],
    },
    scenarioNarrative: "Assume graphite clearance delays and a lower first-pass cell yield occur together. Recycled feedstock is available only after assay and qualification. A second storage commitment competes for eligible cells, requiring chemistry-aware allocation rather than assuming all battery demand is fungible.",
    decisionQuestion: "What cell, recycling and pack plan meets priority energy commitments under uncertain supply without double-counting recovered material?",
    hardConstraints: ["Keep cell chemistry and pack qualification eligibility explicit.", "Credit recycled output once, only after assay release.", "Preserve formation dwell and safety test capacity.", "Do not treat announced mineral capacity as available qualified input."],
    monitoredSignals: ["Cell formation yield · shift-level · investigate below 96%", "Graphite clearance · event-based · separate permit from shipment", "Recovered-material assay · each lot · qualify chemistry", "Pack/storage commitments · daily · allocate energy and configuration"],
    toolSequence: ["Mineral Atlas: graphite concentration", "Statistics: yield and recovery distributions", "Manufacturing Twin: formation bottleneck", "Network Optimizer: chemistry-specific allocation", "Simulation: joint yield and lead-time stress", "Flow Lens: cash and lost contribution"],
    outcomeInterpretation: "Read deliverable qualified energy, lost-service tails and recovery cost together. Companywide annual GWh is context; the simulated pack equivalents and margins are not observed Tesla values.",
  },
  {
    clientId: "byd", projectId: "byd-global-localization", company: "BYD", product: "Country-homologated EV variants and regional assembly",
    publicContext: [
      { fact: "BYD announced annual nameplate capacity of 150,000 vehicles at its Thailand factory opening in July 2024.", sourceId: publicSources.bydThailand.id, asOf: "2024-07-04" },
      { fact: "The Commission's October 2024 decision listed a 17.0% BYD countervailing duty for covered China-origin BEVs; this is a dated policy scenario input.", sourceId: publicSources.euBev.id, asOf: "2024-10-29" },
      { fact: "In January 2026 the Commission published guidance for BEV price-undertaking offers, including minimum import prices and sales channels.", sourceId: publicSources.euUndertakings.id, asOf: "2026-01-12" },
    ], sources: [publicSources.bydThailand, publicSources.euBev, publicSources.euUndertakings],
    scenario: {
      label: "Origin-sensitive localization under shipping congestion", kind: "hypothetical-stress-test", scope: "One modeled regional export and assembly programme", horizonWeeks: 10, demandPerWeek: 4100, capacityPerWeek: 4800, qualifiedAlternatePerWeek: 1300, inventoryUnits: 1400, unit: "vehicles", currency: "USD", baseLeadDays: 25, capacityLossPct: 21, demandSurgePct: 14, qualityYieldPct: 97.2, expeditePremiumPerUnit: 380, unitMargin: 1900, qualificationWeek: 3, serviceFloorPct: 94, budget: 4000000,
      regimes: regimes(25, 39, 58, [1, 0.82, 0.59], [[0.79, 0.17, 0.04], [0.21, 0.61, 0.18], [0.09, 0.35, 0.56]]),
      operationalInputs: [input("RoRo weekly allocation", 2400, "vehicle slots", "Confirmed shipping capacity assumption."), input("Origin evidence completeness", 89, "%", "Only complete country/variant records may enter landed-cost comparison."), input("Local ramp first-pass yield", 93, "%", "Separate from mature network yield."), input("Historical extra duty stress", 17, "%", "Replays the 2024 policy snapshot; not a current duty recommendation."), input("Homologation release lag", 21, "days", "Market-specific eligibility assumption."), input("Port storage capacity", 5600, "vehicles", "Dwell congestion makes early shipping costly.")],
    },
    scenarioNarrative: "Assume vessel slots tighten while a local assembly line ramps. Compare exporting eligible finished vehicles with localized assembly using explicit origin and homologation evidence. A factory's location alone neither proves customs origin nor grants a tariff exemption.",
    decisionQuestion: "Which dated policy and sourcing scenario protects committed country-variant deliveries at the best feasible landed cost?",
    hardConstraints: ["Refresh current origin and tariff treatment before approval.", "No blanket tariff avoidance assumption for local assembly.", "Enforce homologation by model and destination.", "Cap export plans by vessel slots and port storage."],
    monitoredSignals: ["Policy effective dates · on publication · invalidate expired assumptions", "Homologation approvals · on change · block unapproved variants", "RoRo booking confirmations · daily · use committed slots", "Local assembly yield · every shift · verify ramp readiness"],
    toolSequence: ["Data: origin and policy evidence", "Logistics Radar: RoRo capacity", "Statistics: ramp learning curve", "Network Optimizer: localization allocation", "Simulation: port and policy scenarios", "Quality Gate: dated policy review"],
    outcomeInterpretation: "Compare plans only under the same dated policy baseline and currency assumptions. Historical duties are useful stress cases, not a statement of current legal liability or a guaranteed localization benefit.",
  },
  {
    clientId: "hershey", projectId: "hershey-cocoa-season", company: "Hershey", product: "Seasonal chocolate recipes and traceable cocoa campaigns",
    publicContext: [
      { fact: "Hershey described exceptional cocoa-price volatility in April 2025 and the need for sourcing agility.", sourceId: publicSources.hersheyCocoa.id, asOf: "2025-04-30" },
      { fact: "Hershey's 2024 progress page reports 88% sourcing visibility in Côte d'Ivoire and Ghana; downstream flows may use mass-balance traceability.", sourceId: publicSources.hersheyTrace.id, asOf: "2024-12-31" },
      { fact: "Hershey's June 2026 update reports almost 5,500 farmers enrolled in its Income Accelerator Program and continued satellite-supported sourcing work.", sourceId: publicSources.hersheyResilience.id, asOf: "2025-12-31" },
    ], sources: [publicSources.hersheyCocoa, publicSources.hersheyTrace, publicSources.hersheyResilience],
    scenario: {
      label: "Cocoa crop and certificate disruption ahead of seasonal freeze", kind: "hypothetical-stress-test", scope: "One modeled seasonal SKU/recipe and packaging network", horizonWeeks: 10, demandPerWeek: 26000, capacityPerWeek: 29000, qualifiedAlternatePerWeek: 7200, inventoryUnits: 7000, unit: "cartons", currency: "USD", baseLeadDays: 14, capacityLossPct: 27, demandSurgePct: 15, qualityYieldPct: 98.1, expeditePremiumPerUnit: 3.2, unitMargin: 11, qualificationWeek: 2, serviceFloorPct: 96, budget: 420000,
      regimes: regimes(14, 27, 45, [1, 0.79, 0.52], [[0.73, 0.22, 0.05], [0.14, 0.65, 0.21], [0.05, 0.25, 0.70]]),
      operationalInputs: [input("Cocoa price uplift", 38, "%", "Scenario against a fixed procurement baseline, not a live quote."), input("Origin hold volume", 14, "%", "Modeled evidence gap on selected ingredients."), input("Seasonal packaging deadline", 35, "days", "Customer delivery cutoff before seasonal demand decays."), input("Campaign cleaning time", 4, "hours/change", "Allergen-sensitive changeover assumption."), input("Cocoa requirement", 0.72, "kg/carton", "Recipe-specific bill of materials assumption."), input("Post-season demand loss", 60, "%", "Stress markdown/obsolescence sensitivity.")],
    },
    scenarioNarrative: "Assume crop-quality issues and origin holds reduce eligible cocoa while retailers retain a fixed seasonal cutoff. Campaign length, allergen cleaning and packaging availability bind production. Mass-balance certification must not be displayed as physical segregation of every ingredient lot.",
    decisionQuestion: "Which approved recipe mix and campaign sequence delivers seasonal commitments with minimum late inventory and eligible ingredient cost?",
    hardConstraints: ["Maintain recipe and allergen release rules.", "Preserve the actual traceability model; do not upgrade mass balance into segregation.", "Reject origin-held lots until evidence clears.", "Separate on-time seasonal volume from late volume of lower value."],
    monitoredSignals: ["Cocoa price observations · daily if licensed · retain timestamp and contract basis", "Origin and certification coverage · lot-level · identify traceability model", "Campaign yield/cleaning · shift-level · preserve allergen sequence", "Retailer delivery cutoff · order-level · flag late campaign starts"],
    toolSequence: ["Risk Radar: ingredient exposure", "Data: recipe and origin joins", "Statistics: commodity and yield variability", "Manufacturing Twin: campaign schedule", "Network Optimizer: eligible ingredient/recipe mix", "Simulation: cutoff and obsolescence risk"],
    outcomeInterpretation: "Service counts only orders delivered within their seasonal windows. A low-cost plan with late cartons can destroy value. Cocoa-price and origin-loss inputs are modeled rather than claims about Hershey's actual purchases.",
  },
  {
    clientId: "tsmc", projectId: "tsmc-fab-recovery", company: "TSMC", product: "Priority wafer lots on qualified process and packaging routes",
    publicContext: [
      { fact: "TSMC reports 2025 managed manufacturing capacity above 17 million 12-inch-equivalent wafers and Arizona 4nm volume production beginning in Q4 2024.", sourceId: publicSources.tsmcCapacity.id, asOf: "2025-12-31" },
      { fact: "In February 2025 TSMC estimated earthquake losses of approximately NT$5.3 billion net of insurance for recognition in Q1 2025.", sourceId: publicSources.tsmcEarthquake.id, asOf: "2025-02-10" },
    ], sources: [publicSources.tsmcCapacity, publicSources.tsmcEarthquake],
    scenario: {
      label: "Tool safety release, water restriction and packaging congestion", kind: "hypothetical-stress-test", scope: "A modeled priority wafer cohort; not a complete re-entrant fab model", horizonWeeks: 12, demandPerWeek: 1400, capacityPerWeek: 1680, qualifiedAlternatePerWeek: 340, inventoryUnits: 290, unit: "wafer equivalents", currency: "USD", baseLeadDays: 32, capacityLossPct: 23, demandSurgePct: 8, qualityYieldPct: 94.2, expeditePremiumPerUnit: 680, unitMargin: 4200, qualificationWeek: 3, serviceFloorPct: 93, budget: 2700000,
      regimes: regimes(32, 49, 70, [1, 0.71, 0.38], [[0.86, 0.11, 0.03], [0.19, 0.61, 0.20], [0.07, 0.28, 0.65]]),
      operationalInputs: [input("Safety-held tool groups", 3, "groups", "Zero output until documented engineering release."), input("Water availability", 82, "% of baseline", "Constrained utility assumption for this cohort."), input("Packaging throughput", 1300, "wafer equivalents/week", "Backend bottleneck must not be hidden by wafer-start growth."), input("Lot requalification delay", 9, "days", "Recipe and tool-specific recovery gate."), input("Priority customer allocation", 72, "%", "Modeled contractual priority share."), input("Dispatch setup penalty", 90, "minutes/change", "Simplified family switching cost.")],
    },
    scenarioNarrative: "Rehearse a new hypothetical earthquake, separate from the closed 2025 event. Safe tools, qualified recipes, water and packaging slots recover at different speeds. Protect complete routes rather than ranking fabs by aggregate wafer nameplate capacity.",
    decisionQuestion: "Which qualified route and lot priorities preserve customer releases while unsafe tools remain unavailable?",
    hardConstraints: ["Safety-held tools have zero available capacity.", "No arbitrary substitution across process nodes or recipes.", "Match wafer completion to available packaging/test slots.", "Use a detailed validated fab model before adopting a production dispatch schedule."],
    monitoredSignals: ["Tool release status · engineering event · maintain safety gate", "Ultra-pure water availability · minute-level when connected · compare limits", "Lot queue ages · hourly · identify route-specific congestion", "Packaging/test confirmations · daily · prevent stranded WIP"],
    toolSequence: ["Risk Radar: utility/tool exposure", "Supplier Graph: route and package dependencies", "Statistics: recovery regimes", "Manufacturing Twin: simplified route capacity", "Simulation: correlated recovery paths", "Network Optimizer: eligible priority allocation"],
    outcomeInterpretation: "The portal's model demonstrates uncertainty-aware allocation. It does not solve TSMC's full re-entrant dispatch problem or infer actual yields, customer priorities, recipes or fab loading.",
  },
  {
    clientId: "airbus", projectId: "airbus-ramp-continuity", company: "Airbus", product: "Configuration-complete commercial aircraft delivery sets",
    publicContext: [
      { fact: "Airbus delivered 793 commercial aircraft to 91 customers in 2025 and ended the year with 8,754 aircraft in backlog.", sourceId: publicSources.airbusDeliveries.id, asOf: "2025-12-31" },
      { fact: "Airbus's February 2026 results identified significant Pratt & Whitney engine shortages as a constraint on the production ramp.", sourceId: publicSources.airbusEngines.id, asOf: "2026-02-19" },
    ], sources: [publicSources.airbusDeliveries, publicSources.airbusEngines],
    scenario: {
      label: "Engine-set delay, certified forgings and delivery congestion", kind: "hypothetical-stress-test", scope: "One modeled delivery stream, not the whole Airbus portfolio", horizonWeeks: 12, demandPerWeek: 14, capacityPerWeek: 17, qualifiedAlternatePerWeek: 4, inventoryUnits: 3, unit: "aircraft sets", currency: "USD", baseLeadDays: 44, capacityLossPct: 25, demandSurgePct: 5, qualityYieldPct: 98.7, expeditePremiumPerUnit: 180000, unitMargin: 1900000, qualificationWeek: 3, serviceFloorPct: 92, budget: 8000000,
      regimes: regimes(44, 63, 91, [1, 0.73, 0.44], [[0.82, 0.14, 0.04], [0.15, 0.66, 0.19], [0.05, 0.24, 0.71]]),
      operationalInputs: [input("Engine-set confirmations", 11, "complete sets/week", "Modeled binding supply, not public P&W delivery data."), input("Certified forging delay", 18, "days", "Hypothetical qualified part-family delay."), input("Flight-test slots", 15, "aircraft/week", "Delivery requires a matching test slot."), input("Parked-airframe limit", 24, "airframes", "Bounded storage and rework congestion."), input("Buyer configuration lock", 28, "days", "Change-freeze assumption."), input("Quality inspection hold", 5, "% of kits", "Scenario inspection exposure, not an allegation about current aircraft.")],
    },
    scenarioNarrative: "Assume engine-set confirmations and a certified-forging route deteriorate while assembly starts continue. This creates parked airframes rather than deliveries. Re-sequence complete configurations, synchronize engines and tests, and expose which commitments remain infeasible.",
    decisionQuestion: "Which executable aircraft sequence protects accepted deliveries without increasing parked incomplete airframes beyond capacity?",
    hardConstraints: ["A delivered unit requires all certified, configuration-matched components.", "No uncertified forging or engine substitution.", "Match final assembly, flight-test and acceptance slots.", "Do not count incomplete airframes as delivered output."],
    monitoredSignals: ["Engine serial/set confirmations · daily · pair by configuration", "Forging certificate and ETA · lot-level · confirm approved route", "Parked-airframe occupancy · daily · limit congestion", "Flight-test and customer acceptance · daily · complete the delivery chain"],
    toolSequence: ["Supplier Graph: configuration completeness", "Risk Radar: certified sole-source parts", "Manufacturing Twin: executable assembly sequence", "Network Optimizer: kit/test allocation", "Simulation: engine and forging delay correlation", "Flow Lens: working capital in parked airframes"],
    outcomeInterpretation: "Evaluate completed deliveries, remaining shortfall and cash tied in WIP. Modeled contribution is not aircraft sale price; an infeasible service target should remain visible rather than being hidden by optimistic supply.",
  },
  {
    clientId: "pfizer", projectId: "pfizer-medicine-continuity", company: "Pfizer", product: "Validated medicine batches and temperature-qualified distribution",
    publicContext: [
      { fact: "Pfizer restarted most Rocky Mount lines in September 2023 after the July tornado, prioritizing production using patient need and inventory.", sourceId: publicSources.pfizerRestart.id, asOf: "2023-09-25" },
      { fact: "Health Canada's May 2024 update states the immediate tornado impacts were remediated and commercial production of all affected products had resumed.", sourceId: publicSources.pfizerRecovered.id, asOf: "2024-05-28" },
      { fact: "Pfizer's 2025 annual review reports its access program enabled about 70 medicines and vaccines to reach at least one participating country.", sourceId: publicSources.pfizerReview.id, asOf: "2025-12-31" },
    ], sources: [publicSources.pfizerRestart, publicSources.pfizerRecovered, publicSources.pfizerReview],
    scenario: {
      label: "Hypothetical API interruption and validated-lane capacity loss", kind: "hypothetical-stress-test", scope: "One modeled medicine family; no clinical allocation or substitution advice", horizonWeeks: 10, demandPerWeek: 85, capacityPerWeek: 100, qualifiedAlternatePerWeek: 24, inventoryUnits: 23, unit: "released batches", currency: "USD", baseLeadDays: 20, capacityLossPct: 31, demandSurgePct: 16, qualityYieldPct: 97.5, expeditePremiumPerUnit: 14000, unitMargin: 75000, qualificationWeek: 2, serviceFloorPct: 98, budget: 2400000,
      regimes: regimes(20, 36, 56, [1, 0.76, 0.41], [[0.81, 0.15, 0.04], [0.17, 0.65, 0.18], [0.06, 0.26, 0.68]]),
      operationalInputs: [input("QA release capacity", 82, "batches/week", "A physical fill is not a released batch."), input("Sterility testing hold", 14, "days", "Illustrative product-specific hold; actual approved method governs."), input("Validated carrier capacity", 68, "batches/week", "Distribution can bind after manufacturing recovers."), input("Temperature excursion quarantine", 4, "%", "All affected lots held for quality disposition."), input("Priority demand floor", 99, "%", "Illustrative approved allocation policy; not a clinical recommendation."), input("Remaining shelf life gate", 120, "days", "Model customer acceptance condition, product label takes precedence.")],
    },
    scenarioNarrative: "Use the closed Rocky Mount recovery as a learning example, then rehearse a separate hypothetical API outage and route closure. Fill-finish, quality release and validated transport each constrain supply. A carrier ETA improvement cannot release a quarantined medicine lot.",
    decisionQuestion: "Which approved site, release and distribution allocations protect the authorized priority policy when the overall 98% service target may be infeasible?",
    hardConstraints: ["Only approved sites, routes and product specifications are eligible.", "Quarantined or unreleased batches contribute zero distributable supply.", "Temperature disposition requires authorized quality review.", "Patient priority follows an approved policy; agents do not invent clinical allocation rules."],
    monitoredSignals: ["API and batch genealogy · lot-level · verify release status", "Qualified temperature telemetry · continuous when connected · quarantine excursions", "QA release queues · daily · expose true bottleneck", "Approved demand priority · on authorized revision · preserve allocation rationale"],
    toolSequence: ["Data: batch and approved specification reconciliation", "Statistics: release-time and excursion variability", "Manufacturing Twin: QA/fill-finish capacity", "Logistics Radar: validated lanes", "Simulation: outage persistence and expiry", "Network Optimizer: policy-constrained allocation"],
    outcomeInterpretation: "Report released, eligible batches and unmet authorized demand. Economics remain secondary to quality and approved allocation rules. No scenario result is a treatment recommendation or a claim of a current Pfizer shortage.",
  },
];

export function getOsCaseEvidence(clientOrProjectId: string): OsCaseEvidence | undefined {
  const normalized = clientOrProjectId === "tata" ? "tata-motors" : clientOrProjectId;
  return osCaseEvidence.find(item => item.clientId === normalized || item.projectId === normalized);
}

export const osCaseEvidenceBoundary = "Public sources explain the case. All operational inputs, transition probabilities, disruptions and financial outcomes are modeled for the selected project scope. Source retrieval is dated, not a live feed. These companies are illustrative cases, not represented as tanjnx clients.";
