// An executable, browser-only decision rehearsal. Not an enterprise solver or live feed.
export type CaseStudy = {
  id: string; company: string; project: string; sector: string; color: string;
  trigger: string; question: string; unit: string; demand: number; capacity: number;
  alternate: number; inventory: number; lead: number; premium: number; margin: number;
  qualificationWeek: number; source: string; constraint: string;
};

export const caseStudies: readonly CaseStudy[] = [
  { id: "apple", company: "Apple", project: "Launch continuity", sector: "Consumer electronics", color: "#48677e", trigger: "Taiwan Strait disruption and restricted magnet exports", question: "Which qualified capacity protects the next six weeks of priority launch demand?", unit: "devices", demand: 10000, capacity: 11200, alternate: 3500, inventory: 4800, lead: 12, premium: 28, margin: 180, qualificationWeek: 2, source: "Launch allocations and component capacity", constraint: "Only pre-qualified component and assembly capacity may be used." },
  { id: "coca-cola", company: "Coca-Cola", project: "Water-to-shelf availability", sector: "Beverages", color: "#bc303a", trigger: "Drought restricts bottler output while can availability falls", question: "How much essential-market demand can qualified bottler transfers preserve?", unit: "cases", demand: 42000, capacity: 46000, alternate: 12000, inventory: 11000, lead: 5, premium: 1.8, margin: 5, qualificationWeek: 1, source: "Bottler schedules and packaging availability", constraint: "Alternate output must meet recipe, packaging and water-allocation requirements." },
  { id: "gucci", company: "Gucci", project: "Traceable seasonal collection", sector: "Luxury", color: "#257257", trigger: "Origin evidence fails for leather lots during a seasonal launch", question: "Can qualified artisan capacity replace quarantined collection volume?", unit: "pieces", demand: 1800, capacity: 2100, alternate: 480, inventory: 620, lead: 21, premium: 140, margin: 680, qualificationWeek: 3, source: "Collection commitments and traceable lot capacity", constraint: "Quarantined lots cannot be used; traceability is a hard gate." },
  { id: "tata", company: "Tata Motors", project: "Vehicle programme continuity", sector: "Automotive", color: "#206eb5", trigger: "Controller allocation cut and Red Sea route delays", question: "Which qualified controller allocation protects the six-week vehicle schedule?", unit: "vehicles", demand: 3200, capacity: 3700, alternate: 850, inventory: 950, lead: 16, premium: 240, margin: 2200, qualificationWeek: 2, source: "Vehicle schedules and controller qualification", constraint: "Substitutions require configuration-specific qualification; service obligations remain protected." },
  { id: "tesla", company: "Tesla", project: "Battery scale resilience", sector: "Battery systems", color: "#c73d40", trigger: "Graphite restrictions coincide with delayed recycling output", question: "What qualified cell capacity protects pack demand without assuming unproven recycled yield?", unit: "packs", demand: 5400, capacity: 6100, alternate: 1600, inventory: 1700, lead: 18, premium: 310, margin: 1700, qualificationWeek: 2, source: "Cell-pack plans and qualified chemistry capacity", constraint: "Only qualified chemistry and proven recovery output may enter the plan." },
  { id: "byd", company: "BYD", project: "Global launch localization", sector: "Electric vehicles", color: "#bb3e65", trigger: "Tariff scenario and scarce roll-on/roll-off vessel windows", question: "Can local assembly protect committed deliveries during export disruption?", unit: "vehicles", demand: 4100, capacity: 4800, alternate: 1300, inventory: 1400, lead: 25, premium: 380, margin: 1900, qualificationWeek: 3, source: "Country-variant demand and local assembly ramp", constraint: "Local output must meet homologation and the scenario's dated origin assumptions." },
  { id: "hershey", company: "Hershey", project: "Cocoa-to-seasonal shelf", sector: "Confectionery", color: "#704655", trigger: "Cocoa crop loss and traceability gaps before seasonal production", question: "How much seasonal volume can verified ingredients and campaign capacity recover?", unit: "cartons", demand: 26000, capacity: 29000, alternate: 7200, inventory: 7000, lead: 14, premium: 3.2, margin: 11, qualificationWeek: 2, source: "Verified cocoa lots and seasonal campaigns", constraint: "Recipe, allergen and lot-origin eligibility cannot be relaxed to improve service." },
  { id: "tsmc", company: "TSMC", project: "Fab recovery and allocation", sector: "Semiconductors", color: "#7b58a2", trigger: "Earthquake inspection closes tools while water supply is constrained", question: "Which already qualified capacity can protect priority wafer commitments?", unit: "wafers", demand: 1400, capacity: 1680, alternate: 340, inventory: 290, lead: 32, premium: 680, margin: 4200, qualificationWeek: 3, source: "Priority wafer allocation and qualified tools", constraint: "Safety release and tool qualification are mandatory; this model is not a re-entrant fab simulation." },
  { id: "airbus", company: "Airbus", project: "Aircraft ramp continuity", sector: "Aerospace", color: "#256181", trigger: "Engine shortfall and certified titanium-forging delays", question: "How many configuration-complete aircraft sets can qualified recovery capacity protect?", unit: "aircraft sets", demand: 14, capacity: 17, alternate: 4, inventory: 3, lead: 44, premium: 180000, margin: 1900000, qualificationWeek: 3, source: "Configuration-complete sets and certified recovery capacity", constraint: "Certified configuration-complete sets only; incomplete airframes are not delivered output." },
  { id: "pfizer", company: "Pfizer", project: "Critical medicine continuity", sector: "Life sciences", color: "#2971aa", trigger: "API outage and a conflict-related cold-chain route interruption", question: "Which validated capacity protects priority medicine commitments?", unit: "released batches", demand: 85, capacity: 100, alternate: 24, inventory: 23, lead: 20, premium: 14000, margin: 75000, qualificationWeek: 2, source: "Released batches and validated fill-finish slots", constraint: "Quality release, site approval and temperature eligibility remain hard constraints." },
];

export type Observation = { week: number; demand: number; capacity: number; alternate: number; leadDays: number; unit: string };
export const csvHeader = "week,demand,base_capacity,qualified_alternate,lead_time_days,unit";
export const modelVersion = "qualified-allocation-v1";
export const storageKey = "tanjnx-decision-rehearsal-v1";
export function findCase(id: string) { return caseStudies.find(item => item.id === id); }
export function sampleRows(c: CaseStudy): Observation[] {
  const pattern = [.92, 1.02, .98, 1.08, 1.04, .96, 1.1, 1.03, .97, 1.07, .99, 1.05];
  return pattern.map((p, i) => ({ week: i + 1, demand: Math.round(c.demand * p), capacity: Math.round(c.capacity * (1 - (i % 3) * .025)), alternate: Math.round(c.alternate * (1 - (i % 2) * .05)), leadDays: c.lead + [0, 2, -1, 4, 1, 3, -2, 2, 5, 0, 1, 3][i], unit: c.unit }));
}
export function toCsv(rows: Observation[]) { return [csvHeader, ...rows.map(r => [r.week, r.demand, r.capacity, r.alternate, r.leadDays, r.unit].join(","))].join("\n"); }
export type Validation = { rows: Observation[]; issues: { line: number; reason: string }[]; total: number };
export function validateCsv(text: string, c: CaseStudy): Validation {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const issues: Validation["issues"] = [];
  const rows: Observation[] = [];
  if (lines[0]?.trim() !== csvHeader) return { rows, issues: [{ line: 1, reason: `Expected exact columns: ${csvHeader}` }], total: Math.max(0, lines.length - 1) };
  if (lines.length > 5001) return { rows, issues: [{ line: 1, reason: "The local rehearsal accepts at most 5,000 rows." }], total: lines.length - 1 };
  const weeks = new Set<number>();
  lines.slice(1).forEach((line, index) => {
    const cells = line.split(",").map(s => s.trim());
    const numbers = cells.slice(0, 5).map(s => s === "" ? NaN : Number(s));
    const [week, demand, capacity, alternate, leadDays] = numbers;
    let reason = "";
    if (cells.length !== 6 || numbers.some(n => !Number.isFinite(n))) reason = "Six columns and finite numeric values are required (plain CSV, no quoted fields).";
    else if (!Number.isInteger(week) || week < 1 || week > 520 || weeks.has(week)) reason = "Week must be a unique integer from 1 to 520.";
    else if (demand <= 0 || capacity < 0 || alternate < 0 || leadDays < 1 || leadDays > 365 || numbers.some(n => n > 1e9)) reason = "Demand must be positive; capacities nonnegative; lead time 1–365 days; values at most 1 billion.";
    else if (cells[5] !== c.unit) reason = `Unit mismatch: this project requires ${c.unit}.`;
    if (reason) issues.push({ line: index + 2, reason });
    else { weeks.add(week); rows.push({ week, demand, capacity, alternate, leadDays, unit: cells[5] }); }
  });
  rows.sort((a, b) => a.week - b.week);
  if (rows.length < 6) issues.push({ line: 0, reason: "At least six valid weekly observations are required." });
  if (rows.some((r, i) => i > 0 && r.week !== rows[i - 1].week + 1)) issues.push({ line: 0, reason: "Weeks must be consecutive for temporal allocation." });
  return { rows, issues, total: lines.length - 1 };
}

// A deterministic display fingerprint, explicitly not a cryptographic integrity proof.
export function fingerprint(value: unknown) {
  let hash = 2166136261;
  for (const character of JSON.stringify(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}
export function quantile(values: number[], probability: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * (position - lower);
}
export function summarize(rows: Observation[], field: "leadDays" | "demand" = "leadDays") {
  const values = rows.map(r => r[field]);
  const n = values.length;
  const mean = n ? values.reduce((a, b) => a + b, 0) / n : 0;
  const sd = n > 1 ? Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1)) : 0;
  return { n, mean, sd, p05: quantile(values, .05), p50: quantile(values, .5), p95: quantile(values, .95), min: n ? Math.min(...values) : 0, max: n ? Math.max(...values) : 0 };
}
export type Assumptions = { shock: number; budget: number; serviceFloor: number; alternateFraction: number };
export function initialAssumptions(c: CaseStudy): Assumptions { return { shock: 22, budget: Math.round(c.alternate * c.premium * 6 * .85), serviceFloor: 95, alternateFraction: 100 }; }
export type WeeklyResult = { week: number; demand: number; base: number; alternate: number; delivered: number; missed: number; endingInventory: number };
export type Plan = { id: string; name: string; cost: number; service: number; protectedValue: number; missed: number; feasible: boolean; failures: string[]; weekly: WeeklyResult[]; stressService: number; tailLoss: number };
function allocation(c: CaseStudy, rows: Observation[], shock: number, fraction: number, startWeek: number) {
  let inventory = c.inventory;
  let cost = 0;
  const weekly = rows.slice(0, 6).map((row, index) => {
    const base = Math.floor(row.capacity * (1 - shock / 100));
    const alternate = index + 1 >= startWeek ? Math.floor(row.alternate * fraction) : 0;
    const available = inventory + base + alternate;
    const delivered = Math.min(row.demand, available);
    inventory = available - delivered;
    cost += alternate * c.premium;
    return { week: row.week, demand: row.demand, base, alternate, delivered, missed: row.demand - delivered, endingInventory: inventory };
  });
  const demand = weekly.reduce((s, r) => s + r.demand, 0);
  const missed = weekly.reduce((s, r) => s + r.missed, 0);
  return { weekly, cost, missed, service: demand ? 100 * (demand - missed) / demand : 0 };
}
export function calculatePlans(c: CaseStudy, rows: Observation[], a: Assumptions): Plan[] {
  const statistics = summarize(rows);
  // Actual consumption of the statistical artifact: empirical lead-time governs alternate arrival.
  const startWeek = Math.max(c.qualificationWeek, Math.ceil(statistics.p95 / 7));
  const baseline = allocation(c, rows, a.shock, 0, startWeek);
  return [{ id: "baseline", name: "No action", fraction: 0 }, { id: "selective", name: "Selective alternate", fraction: a.alternateFraction / 200 }, { id: "qualified", name: "Full qualified alternate", fraction: a.alternateFraction / 100 }].map(option => {
    const result = allocation(c, rows, a.shock, option.fraction, startWeek);
    const stress = allocation(c, rows, Math.min(100, a.shock + 10), option.fraction, startWeek + 1);
    const failures = [result.cost > a.budget ? `Response cost exceeds the $${a.budget.toLocaleString()} budget.` : "", result.service + 1e-9 < a.serviceFloor ? `On-time unit service is below ${a.serviceFloor}%.` : "", stress.service + 1e-9 < a.serviceFloor ? `Stress service is below ${a.serviceFloor}% with +10pp capacity loss and +1 week arrival delay.` : ""].filter(Boolean);
    return { ...result, id: option.id, name: option.name, protectedValue: (baseline.missed - result.missed) * c.margin, feasible: failures.length === 0, failures, stressService: stress.service, tailLoss: stress.missed * c.margin };
  });
}

export type Artifact = { id: string; dataset: string; method: string; n: number; mean: number; sd: number; p05: number; p95: number; unit: string; limitations: string };
export type Revision = { id: string; parent: string | null; basis: string; planId: string; rationale: string; createdAt: string; snapshot: { csv: string; assumptions: Assumptions; artifact: Artifact; plan: Plan } };
export type Approval = { revisionId: string; basis: string; actor: string; expiresAt: string; decision: "approved" | "rejected"; note: string };
export type JourneyState = { caseId: string; csv: string; sourceName: string; published: string | null; artifact: Artifact | null; assumptions: Assumptions; runBasis: string | null; selectedPlan: string; revisions: Revision[]; approval: Approval | null; releasedBasis: string | null; acknowledgements: string[]; observedDelivered: number | null; events: string[] };
export function createJourney(caseId = "apple"): JourneyState {
  const c = findCase(caseId);
  if (!c) throw new Error("Unknown project; no fallback to another client's data.");
  return { caseId, csv: toCsv(sampleRows(c)), sourceName: `${caseId}-weekly-sample.csv`, published: null, artifact: null, assumptions: initialAssumptions(c), runBasis: null, selectedPlan: "qualified", revisions: [], approval: null, releasedBasis: null, acknowledgements: [], observedDelivered: null, events: ["Opened local decision rehearsal. No external system connected."] };
}
export function datasetId(s: JourneyState) { return `DS-${s.caseId}-${fingerprint(s.csv)}`; }
export function basisId(s: JourneyState) { return `RUN-${fingerprint([modelVersion, datasetId(s), s.artifact?.id ?? null, s.assumptions])}`; }
export function publishDataset(s: JourneyState): JourneyState {
  const c = findCase(s.caseId)!;
  if (validateCsv(s.csv, c).issues.length) return s;
  return { ...s, published: datasetId(s), events: [...s.events, `Published local dataset ${datasetId(s)} after schema, unit and continuity checks.`] };
}
export function analyzeDataset(s: JourneyState): JourneyState {
  if (s.published !== datasetId(s)) return s;
  const rows = validateCsv(s.csv, findCase(s.caseId)!).rows;
  const stats = summarize(rows);
  const artifact: Artifact = { id: `STAT-${fingerprint([s.published, stats])}`, dataset: s.published, method: "Empirical sample summary v1; linear-interpolated quantiles", n: stats.n, mean: stats.mean, sd: stats.sd, p05: stats.p05, p95: stats.p95, unit: "days", limitations: "Central 90% empirical range, not a confidence interval or calibrated future distribution. Small synthetic sample; no causal claim or fitted Markov model." };
  return { ...s, artifact, events: [...s.events, `Computed ${artifact.id} from ${stats.n} actual local rows.`] };
}
export function runAlternatives(s: JourneyState): JourneyState {
  if (!s.artifact || s.artifact.dataset !== datasetId(s) || s.published !== datasetId(s)) return s;
  return { ...s, runBasis: basisId(s), events: [...s.events, `Calculated three alternatives and a compound stress for ${basisId(s)}. Enumeration, not a solver optimality claim.`] };
}
export function currentPlan(s: JourneyState) { return calculatePlans(findCase(s.caseId)!, validateCsv(s.csv, findCase(s.caseId)!).rows, s.assumptions).find(p => p.id === s.selectedPlan)!; }
export function runCurrent(s: JourneyState) { return s.published === datasetId(s) && s.artifact?.dataset === datasetId(s) && s.runBasis === basisId(s); }
export function proposeRevision(s: JourneyState, rationale: string, now: string): JourneyState {
  if (!runCurrent(s) || !rationale.trim()) return s;
  const parent = s.revisions.at(-1)?.id ?? null;
  const revision: Revision = { id: `D-${s.revisions.length + 1}`, parent, basis: basisId(s), planId: s.selectedPlan, rationale: rationale.trim(), createdAt: now, snapshot: { csv: s.csv, assumptions: { ...s.assumptions }, artifact: { ...s.artifact! }, plan: currentPlan(s) } };
  return { ...s, revisions: [...s.revisions, revision], events: [...s.events, `${revision.id} proposed from ${parent ?? "baseline"}; ${rationale.trim()}`] };
}
export function reviewDecision(s: JourneyState, role: string, decision: "approved" | "rejected", note: string, now: string): JourneyState {
  const revision = s.revisions.at(-1);
  if (role !== "Reviewer" || !note.trim() || !revision || revision.basis !== basisId(s) || revision.planId !== s.selectedPlan || !runCurrent(s) || (decision === "approved" && !currentPlan(s).feasible)) return s;
  const approval: Approval = { revisionId: revision.id, basis: revision.basis, actor: "Aakash Roy · simulated reviewer", decision, note: note.trim(), expiresAt: new Date(Date.parse(now) + 86400000).toISOString() };
  return { ...s, approval, events: [...s.events, `${revision.id} ${decision} in role rehearsal. ${note.trim()}`] };
}
export function approvalCurrent(s: JourneyState, now: string) {
  const revision = s.revisions.at(-1);
  return runCurrent(s) && s.approval?.decision === "approved" && s.approval.basis === basisId(s) && s.approval.revisionId === revision?.id && revision?.planId === s.selectedPlan && Date.parse(s.approval.expiresAt) > Date.parse(now) && currentPlan(s).feasible;
}
export function releaseDecision(s: JourneyState, role: string, now: string): JourneyState {
  if (role !== "Operator" || !approvalCurrent(s, now)) return s;
  const releaseKey = `${basisId(s)}-${s.approval!.revisionId}`;
  if (s.releasedBasis === releaseKey) return s;
  return { ...s, releasedBasis: releaseKey, acknowledgements: [], observedDelivered: null, events: [...s.events, `Prepared local execution package ${releaseKey}. Not transmitted to ERP or suppliers.`] };
}
export function releaseCurrent(s: JourneyState, now: string) { return approvalCurrent(s, now) && s.releasedBasis === `${basisId(s)}-${s.approval!.revisionId}`; }
