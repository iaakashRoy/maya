import type { AppId, DataViewId, StatusTone } from "./platform-model";

export type ApplicationDetailId = AppId | DataViewId;

export type ApplicationBlueprint = {
  id: ApplicationDetailId;
  name: string;
  purpose: string;
  decisionQuestion: string;
  primaryUsers: string;
  cadence: string;
  horizon: string;
  authority: string;
  workflow: readonly {
    phase: string;
    activity: string;
    accountable: string;
    exitCriteria: string;
  }[];
  methods: readonly {
    name: string;
    family: string;
    purpose: string;
    formulation: string;
    validation: string;
  }[];
  dataContracts: readonly {
    name: string;
    grain: string;
    sources: string;
    freshness: string;
    quality: string;
  }[];
  controls: readonly {
    name: string;
    rule: string;
    owner: string;
    evidence: string;
    tone: StatusTone;
  }[];
  kpis: readonly {
    name: string;
    definition: string;
    target: string;
    owner: string;
    tone: StatusTone;
  }[];
  handoffs: readonly {
    destination: string;
    trigger: string;
    artifact: string;
  }[];
  limitations: readonly string[];
};

export const applicationBlueprints: Record<ApplicationDetailId, ApplicationBlueprint> = {
  risk: {
    id: "risk",
    name: "Risk Radar",
    purpose: "Continuously rank external and internal threats by the business interruption they can cause, not by news volume alone.",
    decisionQuestion: "Which emerging dependency can stop customer commitments, when will impact occur, and which control should be activated first?",
    primaryUsers: "Chief supply chain officer · control tower · category leaders · business continuity",
    cadence: "Continuous signals · daily triage · weekly continuity review",
    horizon: "Now to 18 months",
    authority: "Risk owner proposes · category or operations leader accepts · finance validates value at risk",
    workflow: [
      { phase: "Detect", activity: "Ingest events, supplier changes, logistics signals, quality escapes, policy changes, and internal exceptions.", accountable: "Intelligence lead", exitCriteria: "Signal has source, timestamp, confidence, and affected entity." },
      { phase: "Propagate", activity: "Trace the signal through ownership, tier, material, BOM, site, route, inventory, order, customer, and margin relationships.", accountable: "Risk analyst", exitCriteria: "At least one evidenced impact path or a documented no-impact disposition." },
      { phase: "Quantify", activity: "Estimate likelihood, time to impact, duration, recovery, service loss, and value-at-risk distributions.", accountable: "Continuity planner", exitCriteria: "P50/P90 exposure and uncertainty drivers are reviewable." },
      { phase: "Control", activity: "Compare avoidance, mitigation, transfer, acceptance, and monitoring controls and open a governed decision case.", accountable: "Named risk owner", exitCriteria: "Control, trigger, owner, funding, and measurement window are approved." },
    ],
    methods: [
      { name: "Bayesian event updating", family: "Probability theory", purpose: "Updates disruption likelihood as corroborating or conflicting evidence arrives.", formulation: "Posterior odds = prior odds × evidence likelihood ratio; confidence is preserved by source.", validation: "Back-test calibration by event class; review overconfidence and correlated-source bias." },
      { name: "Survival and hazard modeling", family: "Reliability analytics", purpose: "Estimates time to failure, recovery, and the changing hazard of supplier or lane interruption.", formulation: "h(t|x) models conditional failure intensity; recovery uses time-to-event distributions.", validation: "Compare predicted and realized duration by supplier tier, event type, and region." },
      { name: "Monte Carlo exposure simulation", family: "Stochastic simulation", purpose: "Converts uncertain timing, duration, inventory cover, and demand into a loss distribution.", formulation: "Simulate event × network response paths; report P50, P90, expected loss, and tail loss.", validation: "Stress sample size, parameter ranges, dependence assumptions, and convergence." },
      { name: "Graph criticality and CVaR", family: "Network risk", purpose: "Combines structural dependency with severe-tail financial exposure for prioritization.", formulation: "Priority = graph dependency × time criticality × CVaRα, adjusted for control strength.", validation: "Challenge centrality against known single points of failure and false-positive pathways." },
    ],
    dataContracts: [
      { name: "Supplier dependency", grain: "Supplier-site × material/part", sources: "ERP · PLM · sourcing · supplier declarations", freshness: "Daily + change event", quality: "Identity, tier, allocation, and approved-source completeness" },
      { name: "Inventory time cover", grain: "Part × site × day", sources: "ERP · WMS · in-transit inventory", freshness: "15 minutes", quality: "Unit normalization and available-to-promise reconciliation" },
      { name: "External event evidence", grain: "Event × entity × source", sources: "Filings · news · weather · trade · sanctions", freshness: "Streaming", quality: "Source independence, timestamp, confidence, and policy scope" },
      { name: "Business impact path", grain: "Event → order/customer path", sources: "Knowledge graph · BOM · orders · margin", freshness: "On graph merge", quality: "Every inferred link retains explainable provenance" },
    ],
    controls: [
      { name: "Corroboration gate", rule: "No critical escalation from a single unverified external source.", owner: "Market intelligence", evidence: "Source set + confidence history", tone: "healthy" },
      { name: "Human risk acceptance", rule: "Residual exposure above tolerance requires a named executive acceptance.", owner: "Business continuity", evidence: "Approval + expiry date", tone: "watch" },
      { name: "Materiality threshold", rule: "Open a decision case when P90 loss, service, or safety thresholds are crossed.", owner: "Enterprise risk", evidence: "Threshold version + scoring run", tone: "critical" },
      { name: "Model drift review", rule: "Recalibrate event-class priors after material forecast error or quarterly.", owner: "Model risk", evidence: "Calibration report", tone: "info" },
    ],
    kpis: [
      { name: "Preventable exposure", definition: "Value at risk with a feasible control available but not yet activated.", target: "Down 30% QoQ", owner: "Control tower", tone: "critical" },
      { name: "Signal-to-decision time", definition: "Median duration from corroborated signal to accountable decision.", target: "< 4 hours critical", owner: "Risk operations", tone: "watch" },
      { name: "P90 calibration", definition: "Share of realized outcomes that remain inside predicted P90 bands.", target: "88–92%", owner: "Model risk", tone: "healthy" },
      { name: "Control effectiveness", definition: "Avoided loss divided by modeled avoidable loss after cost.", target: "> 75%", owner: "Continuity COE", tone: "opportunity" },
    ],
    handoffs: [
      { destination: "Network Optimizer", trigger: "A risk has two or more feasible response levers.", artifact: "Scenario envelope, affected network, probability distribution, and hard limits" },
      { destination: "Case Workspace", trigger: "Materiality threshold is crossed or authority is required.", artifact: "Evidence-backed risk brief with owner, clock, and recommended control" },
      { destination: "Action Room", trigger: "A response is selected and requires funding or operational release.", artifact: "Approved control package, triggers, tasks, and outcome measures" },
    ],
    limitations: ["External evidence can be delayed, duplicated, or strategically misleading.", "Graph completeness determines whether n-tier propagation is visible.", "Modeled exposure supports a decision; it does not replace accountable risk acceptance."],
  },
  optimizer: {
    id: "optimizer",
    name: "Network Optimizer",
    purpose: "Translate a disruption or opportunity into a mathematically feasible, economically explicit network plan.",
    decisionQuestion: "What combination of sourcing, production, inventory, logistics, and customer allocation best protects value inside real constraints?",
    primaryUsers: "Network planning · manufacturing · logistics · procurement · finance",
    cadence: "On demand for cases · nightly tactical solve · monthly design cycle",
    horizon: "Hours to 36 months",
    authority: "Planner configures · deterministic synthetic calculator demonstrates · functional owners validate · delegated authority approves",
    workflow: [
      { phase: "Frame", activity: "Select decision variables, horizon, scenarios, baseline, objective weights, and non-negotiable business constraints.", accountable: "Decision modeler", exitCriteria: "Signed model scope and baseline version." },
      { phase: "Calculate", activity: "Generate one deterministic synthetic response fixture across suppliers, plants, inventory pools, lanes, products, and customers.", accountable: "Network planner", exitCriteria: "Evidence kind, candidate-space index, all 12 family checks, runtime class, and decision-contract fingerprint recorded." },
      { phase: "Challenge", activity: "Inspect illustrative binding checks, scenario regret, sensitivities, and excluded alternatives without claiming solver execution or mathematical optimality.", accountable: "Cross-functional review", exitCriteria: "Assumptions accepted or recalculation requests captured." },
      { phase: "Release", activity: "Convert the selected solution into reservations, transfers, production changes, bookings, and customer actions.", accountable: "Decision authority", exitCriteria: "Approved execution package with system-of-record write-back owners." },
    ],
    methods: [
      { name: "Mixed-integer linear programming", family: "Exact optimization", purpose: "Selects discrete sources, lanes, shifts, and qualification choices while allocating continuous volume; the current concept teaches the formulation but does not execute a MILP solver.", formulation: "min cᵀx + penalties, subject to Ax ≤ b, flow balance, service, capacity, and binary activation.", validation: "A production solver must report legitimate incumbent, bound, gap, residuals, runtime, and deterministic replay hash." },
      { name: "Multi-stage stochastic programming", family: "Optimization under uncertainty", purpose: "Chooses actions that remain valuable across demand, lead-time, price, and disruption scenarios.", formulation: "Minimize expected cost plus risk penalty with non-anticipativity across scenario stages.", validation: "Test scenario reduction, probability calibration, and value of stochastic solution." },
      { name: "Robust optimization", family: "Uncertainty sets", purpose: "Builds plans that remain feasible when critical parameters deviate inside governed ranges.", formulation: "Optimize worst-case or budgeted uncertainty over capacity, transit, yield, and demand sets.", validation: "Publish price of robustness and compare against historical extreme conditions." },
      { name: "Greedy repair heuristic", family: "Rapid response", purpose: "Produces a transparent near-feasible plan when exact solve time is incompatible with an urgent decision clock.", formulation: "Rank moves by protected contribution per constrained resource, then repair violated constraints.", validation: "Benchmark objective loss and constraint violations against solved historical instances." },
    ],
    dataContracts: [
      { name: "Network capacities", grain: "Resource × site/lane × time bucket", sources: "ERP · APS · TMS · supplier commitments", freshness: "Hourly or event", quality: "Calendar, unit, yield, reservation, and effective-date checks" },
      { name: "Demand priorities", grain: "Order/forecast × product × location × date", sources: "Order management · DemandSense · CRM", freshness: "15 minutes", quality: "Priority class, requested date, margin, and substitution rules" },
      { name: "Cost and value", grain: "Action × unit × period", sources: "Finance · procurement · logistics tariffs", freshness: "Daily + quote event", quality: "Currency, incoterm, escalation, and sunk-cost treatment" },
      { name: "Qualification matrix", grain: "Supplier-site × part × process", sources: "QMS · PLM · sourcing", freshness: "On approval", quality: "Effective dates, conditional approvals, tooling, and certification" },
    ],
    controls: [
      { name: "Hard-constraint protection", rule: "Safety, regulatory, qualification, and contractual prohibitions cannot be traded for objective value.", owner: "Model governance", evidence: "Constraint catalog + release", tone: "critical" },
      { name: "Feasibility and claim integrity", rule: "No plan can be labeled solved or optimal unless real solver status, bounds, gaps, and residuals are retained; the concept exposes only deterministic synthetic checks.", owner: "Network planning", evidence: "Evidence-kind manifest + decision-contract fingerprint", tone: "healthy" },
      { name: "Manual override disclosure", rule: "Every planner override records value impact, rationale, approver, and expiry.", owner: "Planning leader", evidence: "Override ledger", tone: "watch" },
      { name: "Scenario approval", rule: "Material probability and uncertainty-set changes require dual review.", owner: "Finance + operations", evidence: "Scenario version history", tone: "info" },
    ],
    kpis: [
      { name: "Protected contribution", definition: "Incremental customer contribution retained versus the no-action baseline.", target: "Maximize within policy", owner: "Finance", tone: "opportunity" },
      { name: "Plan feasibility", definition: "Released recommendations with zero hard-constraint violation.", target: "100%", owner: "Planning COE", tone: "healthy" },
      { name: "Scenario regret", definition: "Difference from the best hindsight plan across realized conditions.", target: "< 5% of value", owner: "Model risk", tone: "watch" },
      { name: "Decision latency", definition: "Frame-to-approved-plan elapsed time for disruption cases.", target: "< 2 hours", owner: "Control tower", tone: "info" },
    ],
    handoffs: [
      { destination: "Procurement and SupplierGraph", trigger: "The plan activates new or incremental supplier volume.", artifact: "Volume reservation, qualification assumptions, price ceiling, and due date" },
      { destination: "Execution systems", trigger: "A plan passes approval and release controls.", artifact: "Purchase, transfer, production, transport, and allocation instructions" },
      { destination: "FlowLens", trigger: "A released plan changes inventory, working capital, freight, margin, or payment timing.", artifact: "Time-phased physical plan with cost and cash consequences" },
    ],
    limitations: ["Optimization quality is bounded by the accuracy and granularity of constraints.", "A low objective value is not evidence that omitted strategic considerations are immaterial.", "Concept-mode outputs are synthetic and are not executable system-of-record instructions."],
  },
  flow: {
    id: "flow",
    name: "Flow Lens",
    purpose: "Make the financial consequence of every material, order, and logistics movement visible to operations.",
    decisionQuestion: "Where is cash or margin trapped in the physical network, and which operational action releases it without harming service?",
    primaryUsers: "Working capital · supply chain finance · logistics · inventory · order management",
    cadence: "Intraday exceptions · weekly cash action review · monthly close reconciliation",
    horizon: "Today to 13 weeks",
    authority: "Process owner proposes · operational owner confirms feasibility · finance controls accounting treatment",
    workflow: [
      { phase: "Reconcile", activity: "Join orders, materials, shipments, receipts, invoices, payables, receivables, and margin at transaction level.", accountable: "Supply chain finance", exitCriteria: "Physical and financial records balance or exceptions are assigned." },
      { phase: "Diagnose", activity: "Decompose cash conversion cycle and margin leakage by product, customer, supplier, site, lane, and root cause.", accountable: "Value analyst", exitCriteria: "Driver is evidenced and controllable versus structural." },
      { phase: "Prioritize", activity: "Rank inventory, logistics, billing, terms, and allocation actions by cash release, cost, risk, and service impact.", accountable: "Working-capital lead", exitCriteria: "Feasible action, owner, timing, and confidence are agreed." },
      { phase: "Realize", activity: "Track execution to bank, ledger, inventory, service, and margin outcomes; reverse double-counted benefits.", accountable: "Finance controller", exitCriteria: "Realized value is reconciled and signed off." },
    ],
    methods: [
      { name: "Cash conversion decomposition", family: "Financial operations", purpose: "Separates days inventory, receivable, and payable movements into operational drivers.", formulation: "CCC = DIO + DSO − DPO, decomposed by mix, volume, price, timing, and policy.", validation: "Reconcile to ledger totals and isolate FX, acquisitions, and accounting reclassifications." },
      { name: "Cost-to-serve allocation", family: "Activity-based costing", purpose: "Attributes handling, expedites, storage, duties, returns, and service complexity to flows.", formulation: "Fully loaded contribution = revenue − product cost − activity drivers − risk-adjusted leakage.", validation: "Tie activity pools to finance and test allocation-driver stability." },
      { name: "Min-cost flow", family: "Network optimization", purpose: "Identifies transfers or fulfillment changes that free inventory cash while preserving service.", formulation: "Minimize movement and holding cost subject to node balance, capacity, cover, and service constraints.", validation: "Back-test realized transfer cost, obsolescence avoided, and customer fill rate." },
      { name: "Causal benefit measurement", family: "Decision analytics", purpose: "Distinguishes realized intervention value from seasonality, demand change, and accounting timing.", formulation: "Difference-in-differences or matched baseline with benefit confidence interval.", validation: "Pre-trend check, stable control cohort, and finance sign-off on attribution." },
    ],
    dataContracts: [
      { name: "Physical movement ledger", grain: "Material/order × handling event", sources: "ERP · WMS · TMS · carrier events", freshness: "15 minutes", quality: "Quantity, unit, status, ownership, and event sequence" },
      { name: "Financial document chain", grain: "Order line × invoice/payment", sources: "ERP finance · treasury · billing", freshness: "Hourly", quality: "Document linkage, currency, tax, due date, and clearing status" },
      { name: "Inventory valuation", grain: "SKU × location × lot × day", sources: "ERP · costing · quality hold", freshness: "Daily + event", quality: "Standard/actual cost, reserves, ownership, and blocked stock" },
      { name: "Customer economics", grain: "Customer × product × order", sources: "CRM · pricing · rebate · service policy", freshness: "Daily", quality: "Net price, rebates, penalties, returns, and strategic class" },
    ],
    controls: [
      { name: "Ledger reconciliation", rule: "Dashboard totals must reconcile to controlled finance views within an agreed tolerance.", owner: "Finance control", evidence: "Daily reconciliation report", tone: "healthy" },
      { name: "No double counting", rule: "A value action has one benefit owner and mutually exclusive benefit category.", owner: "Value office", evidence: "Benefit register", tone: "critical" },
      { name: "Service protection", rule: "Cash actions cannot cross customer or safety-stock floors without delegated approval.", owner: "Operations", evidence: "Constraint check + approval", tone: "watch" },
      { name: "Realization expiry", rule: "Unrealized forecasts expire or are re-baselined after their measurement window.", owner: "FP&A", evidence: "Baseline change log", tone: "info" },
    ],
    kpis: [
      { name: "Cash released", definition: "Bank- or ledger-validated reduction in working capital attributable to executed actions.", target: "> 85% of approved", owner: "Treasury", tone: "opportunity" },
      { name: "Inventory days", definition: "Average inventory value divided by annualized cost of goods sold × 365.", target: "35 days", owner: "Inventory leader", tone: "watch" },
      { name: "Margin leakage", definition: "Avoidable expedite, penalty, obsolescence, and service cost as share of revenue.", target: "< 1.5%", owner: "Supply chain finance", tone: "critical" },
      { name: "Benefit confidence", definition: "Share of reported benefit supported by reconciled source documents and approved attribution.", target: "> 95%", owner: "Finance control", tone: "healthy" },
    ],
    handoffs: [
      { destination: "Network Optimizer", trigger: "Cash release requires inventory or fulfillment rebalancing.", artifact: "Valuation, service floor, holding cost, expiry, and movement constraints" },
      { destination: "Action Room", trigger: "A cross-functional cash action is feasible and material.", artifact: "Owner, documents, baseline, forecast benefit, control checks, and measurement dates" },
      { destination: "Finance systems", trigger: "Execution and benefit evidence reach the defined recognition gate.", artifact: "Reconciled realization entry with source-document lineage" },
    ],
    limitations: ["Accounting timing can make operational progress appear earlier or later than cash realization.", "Allocated cost-to-serve is decision support and may not equal statutory product cost.", "Benefits remain forecast until reconciled through the measurement window."],
  },
  demand: {
    id: "demand",
    name: "Demand Sense",
    purpose: "Create a probabilistic, explainable demand view that directs planners to exceptions requiring business judgment.",
    decisionQuestion: "What is the credible demand range, why has it changed, and which supply or commercial decision should respond?",
    primaryUsers: "Demand planning · sales · S&OP/IBP · supply planning · finance",
    cadence: "Streaming demand signals · weekly exception cycle · monthly consensus",
    horizon: "1 week to 24 months",
    authority: "Statistical baseline is system-generated · commercial override is named · consensus is cross-functional",
    workflow: [
      { phase: "Sense", activity: "Assemble orders, shipments, consumption, channel, market, price, promotion, event, and macro signals.", accountable: "Demand data steward", exitCriteria: "Signal coverage and timeliness meet product-family policy." },
      { phase: "Forecast", activity: "Generate hierarchical probabilistic forecasts and reconcile them across product, customer, geography, and time.", accountable: "Demand scientist", exitCriteria: "P10/P50/P90 distribution and baseline drivers published." },
      { phase: "Explain", activity: "Identify statistically and economically material changes, causal drivers, bias, and forecastability.", accountable: "Demand planner", exitCriteria: "Exception has driver evidence and planner disposition." },
      { phase: "Commit", activity: "Agree constrained and unconstrained consensus, document overrides, and hand the range to supply and finance.", accountable: "S&OP owner", exitCriteria: "One approved version with assumptions, risk, and decision actions." },
    ],
    methods: [
      { name: "Hierarchical time-series ensemble", family: "Forecasting", purpose: "Combines local patterns while keeping SKU, family, region, and total forecasts coherent.", formulation: "Weighted ensemble of statistical and machine-learning models with MinT reconciliation.", validation: "Rolling-origin back-test by horizon, segment, intermittency, and lifecycle." },
      { name: "Causal regression", family: "Econometrics", purpose: "Estimates the effect of price, promotion, macro conditions, weather, events, and distribution changes.", formulation: "Demand = baseline + β drivers + interactions + time effects, with regularization.", validation: "Out-of-sample lift, sign plausibility, leakage tests, and stability across regimes." },
      { name: "Bayesian demand distribution", family: "Probability theory", purpose: "Represents forecast uncertainty and updates it with sparse or volatile evidence.", formulation: "Posterior predictive distribution combines prior demand behavior and current observations.", validation: "Prediction interval coverage, proper scoring rules, and calibration by horizon." },
      { name: "Newsvendor and service segmentation", family: "Inventory decision", purpose: "Translates demand uncertainty, margin, lead time, and service class into stocking implications.", formulation: "Critical fractile = underage cost / (underage + overage cost), subject to service policy.", validation: "Compare shortage, obsolescence, service, and working-capital outcomes by segment." },
    ],
    dataContracts: [
      { name: "Demand history", grain: "SKU × customer/channel × location × day", sources: "Orders · shipments · consumption · returns", freshness: "Hourly", quality: "Cancellations, lost sales, stock-outs, substitutions, and one-offs" },
      { name: "Commercial drivers", grain: "Driver × product/market × period", sources: "CRM · pricing · promotion · pipeline", freshness: "Daily", quality: "Effective dates, probability, duplication, and realized conversion" },
      { name: "External drivers", grain: "Indicator × market × period", sources: "Macro · weather · mobility · search · events", freshness: "Source dependent", quality: "Revision history, geographic fit, lag, and permissible use" },
      { name: "Product hierarchy", grain: "SKU × effective hierarchy", sources: "MDM · PLM · lifecycle", freshness: "On change", quality: "Launch, end-of-life, supersession, and aggregation consistency" },
    ],
    controls: [
      { name: "Override accountability", rule: "Every material override needs reason, owner, duration, and measured incremental accuracy.", owner: "Demand planning", evidence: "Override ledger", tone: "watch" },
      { name: "Leakage prevention", rule: "Forecast training cannot use information unavailable at the forecast origin.", owner: "Model risk", evidence: "Feature cutoff tests", tone: "critical" },
      { name: "Hierarchy coherence", rule: "Released forecasts reconcile across governed product and geographic totals.", owner: "Data stewardship", evidence: "Reconciliation report", tone: "healthy" },
      { name: "Model segmentation", rule: "Intermittent, launch, end-of-life, and promoted demand use approved model classes.", owner: "Forecast COE", evidence: "Model assignment registry", tone: "info" },
    ],
    kpis: [
      { name: "Weighted forecast error", definition: "Absolute error weighted by volume or value at the decision horizon.", target: "< 18% WAPE", owner: "Demand planning", tone: "healthy" },
      { name: "Forecast bias", definition: "Signed error as a share of actual demand over the rolling review window.", target: "−5% to +5%", owner: "Commercial planning", tone: "watch" },
      { name: "P90 coverage", definition: "Share of actual outcomes at or below the released P90 forecast.", target: "88–92%", owner: "Model risk", tone: "info" },
      { name: "Decision value add", definition: "Economic improvement from accepted planner overrides versus the statistical baseline.", target: "> 0 by segment", owner: "S&OP owner", tone: "opportunity" },
    ],
    handoffs: [
      { destination: "Network Optimizer", trigger: "Demand range changes capacity, allocation, sourcing, or inventory feasibility.", artifact: "P10/P50/P90 demand by decision grain with scenario drivers" },
      { destination: "RiskRadar", trigger: "Demand or market movement creates a material downside or upside exposure.", artifact: "Signal confidence, affected products, time-to-impact, and value range" },
      { destination: "S&OP / finance", trigger: "Consensus version is released.", artifact: "Baseline, overrides, unconstrained/constrained range, risks, and revenue bridge" },
    ],
    limitations: ["Forecast accuracy degrades during structural breaks and unprecedented launches.", "External correlation is not automatically causal evidence.", "Consensus overrides can improve context but must be measured for bias and value add."],
  },
  suppliers: {
    id: "suppliers",
    name: "Supplier Graph",
    purpose: "Understand n-tier supplier dependency, discover qualified alternatives, and manage supplier resilience as a portfolio.",
    decisionQuestion: "Which supplier capability, ownership, site, or sub-tier dependency matters—and what credible alternative or development action exists?",
    primaryUsers: "Procurement · supplier quality · engineering · risk · sustainability",
    cadence: "Continuous graph updates · event-driven qualification · quarterly portfolio review",
    horizon: "Current performance to 5-year category strategy",
    authority: "Category leads commercial choice · quality and engineering control qualification · risk controls dependency tolerance",
    workflow: [
      { phase: "Resolve", activity: "Connect legal entities, parents, sites, capabilities, processes, certifications, materials, parts, contracts, and sub-tiers.", accountable: "Supplier data steward", exitCriteria: "Identity and ownership confidence meet governed threshold." },
      { phase: "Assess", activity: "Score performance, capacity, financial, compliance, cyber, ESG, geographic, and dependency evidence.", accountable: "Category + risk", exitCriteria: "Dimension scores retain evidence freshness and exceptions." },
      { phase: "Discover", activity: "Match alternative suppliers by capability, process, equipment, certification, capacity, geography, and should-cost.", accountable: "Strategic sourcing", exitCriteria: "Shortlist documents mandatory gaps and verification needs." },
      { phase: "Qualify", activity: "Run NDA, technical review, audit, samples, PPAP, contracting, and controlled volume release.", accountable: "Supplier quality", exitCriteria: "Approved source status and released capacity are effective-dated." },
    ],
    methods: [
      { name: "Graph centrality and community detection", family: "Network science", purpose: "Finds hidden concentration, common ownership, and structurally critical sub-tier nodes.", formulation: "Weighted betweenness, eigenvector influence, articulation points, and supplier communities.", validation: "Challenge against known disruptions, ownership changes, and manually mapped tiers." },
      { name: "Multi-criteria decision analysis", family: "Portfolio decision", purpose: "Ranks suppliers without collapsing strategic, technical, cost, resilience, and ESG trade-offs invisibly.", formulation: "Governed normalized criteria × approved weights, with veto thresholds and sensitivity.", validation: "Publish rank stability and identify criteria that change the shortlist." },
      { name: "Capability similarity matching", family: "Entity and semantic matching", purpose: "Discovers candidates from process, equipment, material, certification, product, and evidence profiles.", formulation: "Hybrid exact rules, graph proximity, and embedding similarity with mandatory gates.", validation: "Precision/recall on historic qualifications and expert review of novel candidates." },
      { name: "Should-cost and negotiation range", family: "Cost modeling", purpose: "Estimates credible economics before capacity reservation or supplier negotiation.", formulation: "Material + conversion + yield + tooling + overhead + logistics + risk-adjusted margin.", validation: "Calibrate to awarded quotes and explain regional, scale, and specification deltas." },
    ],
    dataContracts: [
      { name: "Supplier identity", grain: "Legal entity × site × effective date", sources: "Vendor master · external registry · declarations", freshness: "On event + monthly", quality: "Parent, alias, address, identifier, ownership, and sanctions match" },
      { name: "Capability evidence", grain: "Site × process/material/certification", sources: "Audits · QMS · supplier portal · documents", freshness: "On evidence change", quality: "Scope, issuer, expiry, equipment, tolerances, and proven volume" },
      { name: "Performance history", grain: "Supplier-site × part × period", sources: "ERP · QMS · TMS · claims", freshness: "Daily", quality: "OTIF, PPM, lead time, responsiveness, and dispute status" },
      { name: "Commercial exposure", grain: "Supplier × category × contract/time", sources: "Sourcing · contracts · spend · forecasts", freshness: "Daily", quality: "Currency, allocation, minimums, indexation, and termination terms" },
    ],
    controls: [
      { name: "Mandatory qualification gates", rule: "Similarity cannot bypass safety, certification, engineering, quality, or regulatory approval.", owner: "Supplier quality", evidence: "Gate checklist + sign-offs", tone: "critical" },
      { name: "Conflict and ownership review", rule: "Material parent-company or beneficial-ownership changes trigger re-screening.", owner: "Compliance", evidence: "Identity change event", tone: "watch" },
      { name: "Evidence expiry", rule: "Expired or out-of-scope certifications reduce readiness and block release where mandatory.", owner: "Data stewardship", evidence: "Certificate lineage", tone: "healthy" },
      { name: "Score transparency", rule: "Every portfolio score exposes criteria, weights, evidence, missingness, and sensitivity.", owner: "Procurement excellence", evidence: "Scorecard version", tone: "info" },
    ],
    kpis: [
      { name: "Single-source exposure", definition: "Spend or margin dependent on one qualified supplier-site for the decision horizon.", target: "< 15% critical spend", owner: "Category management", tone: "critical" },
      { name: "Qualification lead time", definition: "Median days from approved search brief to released production source.", target: "< 90 days standard", owner: "Supplier quality", tone: "watch" },
      { name: "Evidence freshness", definition: "Critical supplier dimensions backed by current, in-scope evidence.", target: "> 95%", owner: "Supplier data", tone: "healthy" },
      { name: "Resilience-adjusted savings", definition: "Commercial savings after expected disruption, qualification, logistics, and switching cost.", target: "Positive NPV", owner: "Procurement finance", tone: "opportunity" },
    ],
    handoffs: [
      { destination: "RiskRadar", trigger: "A dependency, ownership, compliance, or capacity change crosses tolerance.", artifact: "Affected entities, evidence confidence, exposure links, and current controls" },
      { destination: "Network Optimizer", trigger: "Alternative capacity is technically feasible and volume allocation must be chosen.", artifact: "Approved combinations, capacity curve, cost range, lead time, and ramp constraints" },
      { destination: "Action Room", trigger: "A qualification or supplier-development decision requires cross-functional release.", artifact: "Gate plan, owners, samples, investment, capacity reservation, and release criteria" },
    ],
    limitations: ["Public capability claims are discovery evidence, not qualification.", "N-tier visibility remains incomplete where suppliers do not disclose sub-tier relationships.", "Supplier scores are decision aids and must not obscure mandatory technical gates."],
  },
  agents: {
    id: "agents",
    name: "Data Agent Hub",
    purpose: "Operate governed ingestion and resolution agents close to approved source systems while preserving security and lineage.",
    decisionQuestion: "Is the evidence feeding each decision app current, complete, permitted, and trustworthy enough for its intended use?",
    primaryUsers: "Data product owners · platform operations · security · source-system stewards",
    cadence: "Continuous operations · daily exception review · release-based policy approval",
    horizon: "Real time to retained lineage history",
    authority: "Source owner grants scope · security approves boundary · data owner accepts quality · app owner defines fitness",
    workflow: [
      { phase: "Authorize", activity: "Define source scope, identity, fields, purpose, retention, residency, and prohibited operations.", accountable: "Source owner", exitCriteria: "Machine-readable policy and credential boundary are signed." },
      { phase: "Observe", activity: "Read approved records, events, documents, and metadata without changing source-system truth.", accountable: "Agent operator", exitCriteria: "Checkpointed ingestion with completeness and freshness telemetry." },
      { phase: "Resolve", activity: "Parse, normalize, deduplicate, match identities, align units and time, and quarantine uncertainty.", accountable: "Data product owner", exitCriteria: "Quality rules pass or exceptions have accountable disposition." },
      { phase: "Publish", activity: "Expose versioned entities, relationships, facts, and lineage to authorized applications.", accountable: "Platform governance", exitCriteria: "Contract tests, policy checks, observability, and rollback are ready." },
    ],
    methods: [
      { name: "Change data capture", family: "Data engineering", purpose: "Moves only created or changed source state while preserving event order and replayability.", formulation: "Log- or timestamp-based incremental capture with idempotent checkpoints and watermarks.", validation: "Gap detection, duplicate replay, late-event handling, and source-count reconciliation." },
      { name: "Probabilistic entity resolution", family: "Record linkage", purpose: "Matches inconsistent supplier, site, material, order, and asset identities across sources.", formulation: "Blocking + pairwise match probability + clustering with human-review thresholds.", validation: "Precision/recall by entity class and monitored false merges/splits." },
      { name: "Schema and semantic conformance", family: "Data quality", purpose: "Maps source fields, units, hierarchies, and business meaning into governed contracts.", formulation: "Typed constraints, reference data, unit conversion, temporal validity, and ontology rules.", validation: "Contract tests, referential integrity, drift detection, and consumer fitness tests." },
      { name: "Policy enforcement", family: "Data governance", purpose: "Restricts collection, processing, retention, sharing, and write-back to approved purposes.", formulation: "Attribute- and purpose-based rules evaluated at ingestion, storage, query, and export.", validation: "Negative authorization tests, audit replay, retention verification, and policy versioning." },
    ],
    dataContracts: [
      { name: "Agent manifest", grain: "Agent × source × policy version", sources: "Platform registry · identity · secret metadata", freshness: "On deployment", quality: "Owner, purpose, scope, permissions, residency, retention, and rollback" },
      { name: "Ingestion run", grain: "Agent × run/checkpoint", sources: "Agent runtime · source telemetry", freshness: "Streaming", quality: "Counts, watermark, duration, errors, retries, and replay identity" },
      { name: "Quality exception", grain: "Rule × entity/record", sources: "Conformance and resolution pipeline", freshness: "Streaming", quality: "Severity, evidence, assignee, SLA, disposition, and recurrence" },
      { name: "Published change set", grain: "Contract version × entity/fact delta", sources: "Resolved knowledge pipeline", freshness: "On successful merge", quality: "Lineage, policy tags, consumer compatibility, and rollback pointer" },
    ],
    controls: [
      { name: "Least privilege", rule: "Agents receive only the identities, fields, operations, and duration required by the contract.", owner: "Security", evidence: "Policy evaluation + access review", tone: "critical" },
      { name: "No autonomous write-back", rule: "Source changes require a separate approved execution connector and human-gated action.", owner: "Platform governance", evidence: "Write permission report", tone: "healthy" },
      { name: "Quarantine on drift", rule: "Breaking schema, volume, identity, or semantic drift blocks affected publication.", owner: "Data operations", evidence: "Drift alert + quarantine set", tone: "watch" },
      { name: "Replay and rollback", rule: "Every publication is idempotent, versioned, and reversible to a known checkpoint.", owner: "Reliability engineering", evidence: "Replay test + recovery point", tone: "info" },
    ],
    kpis: [
      { name: "Freshness SLO", definition: "Share of successful source updates available within each contract’s latency target.", target: "> 99.5%", owner: "Platform operations", tone: "healthy" },
      { name: "Critical quality debt", definition: "Open high-severity exceptions beyond decision-fitness SLA.", target: "0 overdue", owner: "Data product owners", tone: "critical" },
      { name: "Automated resolution precision", definition: "Accepted entity matches divided by all automated matches.", target: "> 99.7% critical", owner: "Knowledge engineering", tone: "watch" },
      { name: "Lineage coverage", definition: "Published facts traceable to source, transformation, policy, and version.", target: "100%", owner: "Data governance", tone: "opportunity" },
    ],
    handoffs: [
      { destination: "Knowledge Graph", trigger: "A governed change set passes conformance and policy checks.", artifact: "Versioned entities, facts, relationships, provenance, and confidence" },
      { destination: "Application owner", trigger: "Freshness, quality, or schema breaches decision-fitness tolerance.", artifact: "Impact assessment, affected features/cases, workaround, and recovery estimate" },
      { destination: "Security operations", trigger: "An access, policy, residency, or integrity anomaly is detected.", artifact: "Audit event, identity, scope, evidence, containment, and owner" },
    ],
    limitations: ["A green pipeline does not prove the underlying business fact is correct.", "Source-system permissions and data quality remain client responsibilities.", "The concept shows policy and telemetry patterns; it is not connected to operational sources."],
  },
  graph: {
    id: "graph",
    name: "Operational Knowledge Graph",
    purpose: "Maintain a time-aware, evidence-backed representation of the supply network shared by all decision applications.",
    decisionQuestion: "What entities and relationships explain this operational condition, and how confidently can each fact be traced to source?",
    primaryUsers: "Decision applications · knowledge engineers · analysts · data stewards",
    cadence: "Continuous merge · event-driven invalidation · daily exception stewardship",
    horizon: "Historical, current, and scenario state",
    authority: "Domain stewards own definitions · source owners own facts · app owners define fitness for use",
    workflow: [
      { phase: "Model", activity: "Define governed entities, relationships, temporal rules, identifiers, units, and decision-oriented semantics.", accountable: "Domain ontology owner", exitCriteria: "Versioned ontology and compatibility contract approved." },
      { phase: "Resolve", activity: "Merge identities and facts while retaining source assertions, disagreement, confidence, and effective time.", accountable: "Knowledge engineering", exitCriteria: "Merge is explainable and reversible; conflicts are surfaced." },
      { phase: "Reason", activity: "Derive dependency paths, transitive impacts, classifications, aggregations, and scenario overlays.", accountable: "App/domain owner", exitCriteria: "Rule or model version and contributing evidence are attached." },
      { phase: "Serve", activity: "Provide policy-filtered subgraphs, queries, features, and evidence packs to users and applications.", accountable: "Graph product owner", exitCriteria: "Latency, authorization, lineage, and consumer contracts pass." },
    ],
    methods: [
      { name: "Temporal property graph", family: "Knowledge representation", purpose: "Represents entities and relationships whose truth changes over time and by source.", formulation: "Nodes and typed edges carry valid time, transaction time, source assertion, and policy attributes.", validation: "Temporal consistency, orphan checks, cardinality rules, and historical replay." },
      { name: "Probabilistic fact fusion", family: "Evidence reasoning", purpose: "Preserves disagreement and estimates confidence when multiple sources assert the same fact.", formulation: "Reliability-weighted evidence combination with source dependence and recency decay.", validation: "Calibration against steward decisions and protected gold sets." },
      { name: "Path and dependency reasoning", family: "Graph algorithms", purpose: "Traces material, ownership, capacity, logistics, product, order, cash, and customer impact paths.", formulation: "Typed constrained traversal, shortest path, reachability, centrality, and rule-derived edges.", validation: "Expert-labeled path precision, cycle controls, and maximum-hop explainability." },
      { name: "Graph feature engineering", family: "Decision analytics", purpose: "Provides reusable concentration, dependency, proximity, community, and evidence features to apps.", formulation: "Versioned feature definitions computed over policy-scoped graph snapshots.", validation: "Feature drift, leakage, freshness, and downstream outcome performance." },
    ],
    dataContracts: [
      { name: "Entity", grain: "Canonical entity × effective period", sources: "Resolved master and evidence sources", freshness: "On merge", quality: "Stable ID, type, labels, validity, confidence, and policy tags" },
      { name: "Relationship", grain: "Subject × predicate × object × period", sources: "Observed or derived assertions", freshness: "On merge", quality: "Direction, cardinality, provenance, confidence, and derivation rule" },
      { name: "Evidence assertion", grain: "Source record × fact", sources: "Approved source systems and documents", freshness: "On ingestion", quality: "Immutable source pointer, extraction, timestamp, and processing version" },
      { name: "Scenario overlay", grain: "Scenario × entity/relationship change", sources: "Risk and optimization models", freshness: "On model run", quality: "Baseline snapshot, probability, owner, expiry, and isolation from observed truth" },
    ],
    controls: [
      { name: "Observed versus inferred", rule: "Derived facts are visibly distinguishable and link to the rule or model that produced them.", owner: "Graph governance", evidence: "Assertion type + derivation lineage", tone: "healthy" },
      { name: "Policy-filtered traversal", rule: "Queries cannot infer restricted relationships through unauthorized paths.", owner: "Security", evidence: "Path authorization tests", tone: "critical" },
      { name: "Stewarded conflict", rule: "Material source disagreement remains visible until governed resolution; it is not silently overwritten.", owner: "Domain steward", evidence: "Conflict case + disposition", tone: "watch" },
      { name: "Contract compatibility", rule: "Ontology releases include impact analysis, migration, and consumer compatibility tests.", owner: "Graph product", evidence: "Release report", tone: "info" },
    ],
    kpis: [
      { name: "Decision-path coverage", definition: "Priority use cases with complete, current, evidence-backed paths at required grain.", target: "> 95%", owner: "Graph product", tone: "opportunity" },
      { name: "Critical identity precision", definition: "Correct canonical merges among decision-critical entities.", target: "> 99.8%", owner: "Knowledge engineering", tone: "healthy" },
      { name: "Conflict aging", definition: "Median time unresolved material source conflicts remain open.", target: "< 2 business days", owner: "Data stewardship", tone: "watch" },
      { name: "Unauthorized inference", definition: "Policy test cases that expose a restricted fact or path.", target: "0", owner: "Security", tone: "critical" },
    ],
    handoffs: [
      { destination: "Decision applications", trigger: "A governed graph snapshot or change event meets consumer fitness rules.", artifact: "Policy-scoped subgraph, features, evidence lineage, confidence, and version" },
      { destination: "Data Agent Hub", trigger: "Missing, stale, conflicting, or low-confidence evidence needs source remediation.", artifact: "Affected assertion, source lineage, quality rule, priority, and steward" },
      { destination: "Case Workspace", trigger: "A decision needs a frozen and auditable explanation of current state.", artifact: "Case-specific evidence subgraph with observed, inferred, and scenario facts separated" },
    ],
    limitations: ["Graph connectivity can create persuasive but spurious paths; typed constraints and evidence remain essential.", "Confidence scores express modeled belief, not guaranteed truth.", "The displayed graph is a synthetic concept and does not contain client operational records."],
  },
};
