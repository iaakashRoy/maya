import type { ExpertAgent, ProjectAppId, WorkspaceProject } from "./workspace-model";

export const SAMSUNG_DEMO_VERSION = 1;
export const samsungAgents: ExpertAgent[] = ["Project Orchestrator", "Evidence Auditor", "Risk Analyst", "Quality Auditor", "Demand Analyst", "Supplier Analyst", "Logistics Controller", "OR Formulator", "Manufacturing Planner", "Finance Analyst", "Scenario Analyst"].map(name => ({
  id: `samsung-${name.toLowerCase().replaceAll(" ", "-")}`, name, role: `${name} for the fictional launch workflow`, level: "Specialist", years: 0, evaluatedRuns: 0, approvedRuns: 0, calibration: 0, overrideRate: 0, failureRate: 0, skills: ["Samsung demo workflow"], mcps: ["Local read-only fixtures"], tools: ["Deterministic launch calculations"], authority: "Demo tasks only; no operational or approval authority", state: "Active",
}));
export const isSamsungDemo = (project: Pick<WorkspaceProject, "client" | "origin">) => project.origin === "Browser-session draft" && /\bsamsung\b/i.test(project.client);
export const samsungBrief = {
  client: "Samsung Electronics", project: "Galaxy Launch Continuity", tower: "Semiconductors",
  problem: "Protect a fictional Galaxy launch across India, Europe and Korea after a memory shortage, a battery quality hold, a shipping delay and an India demand spike.",
  outcome: "Serve at least 95% of 132,000 launch orders within a USD 900,000 incremental budget, without using quarantined batteries or unqualified suppliers.",
  owner: "Samsung demo supply chain lead", regions: "India · Europe · Korea", snapshot: "15 September 2026", deadline: "25 September 2026",
  boundary: "Fictional Samsung scenario. All sources, workers, agent activity, approvals and execution are simulated locally; no Samsung systems are contacted.",
};
export const samsungSources = [
  { id: "orders", name: "ERP / launch order book", database: "samsung_demo_erp", tables: "launch_orders, inventory", rows: 3, fields: "market, requested_units, available_units, cutoff_date", variable: "L0-001", sample: [{ market: "India", requested_units: 72000 }, { market: "Europe", requested_units: 40000 }, { market: "Korea", requested_units: 20000 }], issue: "India demand increased from 60,000 to 72,000 units; all 132,000 units enter the service denominator." },
  { id: "quality", name: "MES / quality management", database: "samsung_demo_mes", tables: "battery_lots, line_capacity", rows: 3, fields: "lot_id, qualified, hold_units, capacity_units", variable: "L0-071", sample: [{ lot_id: "BAT-HOLD-18", hold_units: 18000, qualified: false }, { lot_id: "BAT-RELEASED", available_units: 100000, qualified: true }, { line_id: "ASSEMBLY-DEMO", capacity_units: 126000 }], issue: "18,000 batteries are on hold and excluded from usable supply. No plan may consume them." },
  { id: "suppliers", name: "Supplier qualification and supply", database: "samsung_demo_srm", tables: "qualified_sources, component_supply", rows: 5, fields: "part_id, qualified, units, arrival_day, premium_usd", variable: "L0-057", sample: [{ part_id: "MEMORY-BASE", units: 98000, qualified: true }, { part_id: "MEMORY-ALT", units: 24000, qualified: true }, { part_id: "MEMORY-BUFFER", units: 10000, qualified: true }, { part_id: "BAT-RESERVE", units: 30000, qualified: true }, { part_id: "MEMORY-REGIONAL", units: 8000, qualified: true }], issue: "One qualified alternative can provide 24,000 memory modules. A separate 10,000-unit buffer is customs-sensitive." },
  { id: "transport", name: "TMS / carrier milestones", database: "samsung_demo_tms", tables: "lane_capacity, carrier_milestones", rows: 3, fields: "lane_id, units_before_cutoff, arrival_day, premium_usd", variable: "L0-202", sample: [{ lane_id: "STANDARD", units_before_cutoff: 106000 }, { lane_id: "EXPEDITED", units_before_cutoff: 26000 }, { lane_id: "BACKUP", units_before_cutoff: 8000 }], issue: "Standard lanes deliver only 106,000 units before the launch cutoff. Expedited capacity is finite." },
] as const;
export type SamsungSourceId = typeof samsungSources[number]["id"];
export type SamsungIntent = "scope" | "diagnose" | "compare" | "shock" | "replan" | "review" | "monitor";
export const samsungPrompts: readonly { intent: SamsungIntent; title: string; prompt: string; apps: readonly ProjectAppId[]; expected: string }[] = [
  { intent: "scope", title: "1. Establish the decision scope", prompt: "Confirm the Samsung Galaxy launch scope, validate the connected data and summarize the hard constraints. Do not run specialist apps yet.", apps: [], expected: "Four source contracts checked; 132,000 units, 95% service, $900,000 budget. Only Playground remains in the app bar." },
  { intent: "diagnose", title: "2. Diagnose the launch risk", prompt: "Diagnose the Samsung launch risk. Trace the memory shortage, battery quality hold, India demand spike and transport bottleneck. Show the baseline and cite source evidence.", apps: ["risk", "quality", "demand", "suppliers", "logistics"], expected: "Risk Radar, Quality Genealogy, Demand Sense, Supplier Graph and Logistics Radar appear as agents use them. Baseline is 98,000 units, or 74.24% service." },
  { intent: "compare", title: "3. Compare feasible responses", prompt: "Compare no action, an air-led response and a diversified response. Respect qualified sources and quarantine, keep spending below $900,000 and achieve at least 95% service. Show the trade-offs and recommend a candidate.", apps: ["optimizer", "manufacturing", "flow"], expected: "Three calculated options. Diversified response ships 128,000 units at $838,000 incremental cost; 96.97% service. This is a candidate, not an approval." },
  { intent: "shock", title: "4. Introduce a new disruption", prompt: "Inject a new disruption: customs delays 8,000 buffer memory modules and the expedited lane loses 8,000 launch-window slots. Invalidate the previous candidate and explain the impact before acting.", apps: ["risk", "logistics"], expected: "The previous candidate drops to 120,000 units, or 90.91% service. Previous review state is invalidated." },
  { intent: "replan", title: "5. Replan and stress-test", prompt: "Replan using the qualified regional memory buffer and backup route. Reduce overtime if capacity allows, stay within the original budget, and stress-test demand, memory, battery and lane availability. Explain the remaining exposure.", apps: ["optimizer", "manufacturing", "simulation", "flow"], expected: "Revised response restores 128,000 units for $898,000. All four single-factor stress cases pass; a combined stress case fails and is disclosed." },
  { intent: "review", title: "6. Prepare human review", prompt: "Prepare the final decision brief with the revised allocations, cost breakdown, evidence, stress results and action owners. Request separate Quality, Finance and Supply Chain approvals. Do not release anything yet.", apps: [], expected: "Decision package awaits three explicit simulated human approvals in Decisions. Chat text cannot self-approve." },
  { intent: "monitor", title: "7. Simulate execution and monitoring", prompt: "Release the approved plan in the simulation and show day-by-day monitoring, owner actions, delivered units and the final executive summary.", apps: ["logistics", "flow"], expected: "Runs only after all three approvals. Simulated execution finishes at 128,000 delivered units, $898,000 cost and no quarantined stock used." },
];
export type SamsungPlan = { id: "baseline" | "air" | "diversified" | "revised"; label: string; memoryAlt: number; memoryBuffer: number; regionalMemory: number; batteries: number; expedite: number; reroute: number; overtime: number };
export const samsungPlans: SamsungPlan[] = [
  { id: "baseline", label: "No action", memoryAlt: 0, memoryBuffer: 0, regionalMemory: 0, batteries: 0, expedite: 0, reroute: 0, overtime: 0 },
  { id: "air", label: "Air-led response", memoryAlt: 24000, memoryBuffer: 0, regionalMemory: 0, batteries: 20000, expedite: 26000, reroute: 0, overtime: 0 },
  { id: "diversified", label: "Diversified response", memoryAlt: 24000, memoryBuffer: 10000, regionalMemory: 0, batteries: 30000, expedite: 22000, reroute: 0, overtime: 6000 },
  { id: "revised", label: "Revised response", memoryAlt: 24000, memoryBuffer: 10000, regionalMemory: 8000, batteries: 30000, expedite: 22000, reroute: 8000, overtime: 4000 },
];
export type SamsungRules = { budget: number; serviceFloor: number };
export function calculateSamsungPlan(plan: SamsungPlan, shock = false, rules: SamsungRules = { budget: 900000, serviceFloor: 95 }, stress = { demand: 0, memory: 0, batteries: 0, transport: 0 }) {
  const costs = [
    { label: "Qualified alternative memory", units: plan.memoryAlt, rate: 8 }, { label: "Customs-sensitive memory buffer", units: plan.memoryBuffer, rate: 4 },
    { label: "Qualified regional memory", units: plan.regionalMemory, rate: 6 }, { label: "Qualified battery reserve", units: plan.batteries, rate: 5 },
    { label: "Expedited launch-window slots", units: plan.expedite, rate: 18 }, { label: "Backup route premium", units: plan.reroute, rate: 4 }, { label: "Overtime capacity", units: plan.overtime, rate: 10 },
  ].map(c => ({ ...c, total: c.units * c.rate }));
  const cost = costs.reduce((sum, item) => sum + item.total, 0);
  const demand = 132000 + stress.demand;
  const capacity = { Memory: 98000 + plan.memoryAlt + plan.memoryBuffer + plan.regionalMemory - (shock ? Math.min(8000, plan.memoryBuffer) : 0) - stress.memory, Batteries: 100000 + plan.batteries - stress.batteries, Assembly: 126000 + plan.overtime, Transport: 106000 + plan.expedite + plan.reroute - (shock ? Math.min(8000, plan.expedite) : 0) - stress.transport };
  const shipped = Math.max(0, Math.min(demand, ...Object.values(capacity)));
  const service = shipped / demand * 100;
  const marketDemand = [72000 + stress.demand, 40000, 20000];
  const allocations = marketDemand.map((requested, i) => ({ market: ["India", "Europe", "Korea"][i], requested, delivered: Math.floor(shipped * requested / demand) }));
  let remainder = shipped - allocations.reduce((sum, a) => sum + a.delivered, 0);
  for (const a of allocations) if (remainder > 0) { a.delivered++; remainder--; }
  const valid = [plan.memoryAlt, plan.memoryBuffer, plan.regionalMemory, plan.batteries, plan.expedite, plan.reroute, plan.overtime].every(n => Number.isInteger(n) && n >= 0) && plan.memoryAlt <= 24000 && plan.memoryBuffer <= 10000 && plan.regionalMemory <= 8000 && plan.batteries <= 30000 && plan.expedite <= 26000 && plan.reroute <= 8000 && plan.overtime <= 6000;
  return { plan, demand, shipped, shortfall: demand - shipped, service, cost, costs, capacity, allocations, quarantinedUsed: 0, budgetPass: cost <= rules.budget, servicePass: service >= rules.serviceFloor, qualifiedPass: valid, feasible: valid && cost <= rules.budget && service >= rules.serviceFloor, netContributionProtected: (shipped - 98000) * 210 - cost };
}
export function samsungStress(rules: SamsungRules) {
  return [
    { label: "Demand +2%", demand: 2640, memory: 0, batteries: 0, transport: 0, envelope: true },
    { label: "Memory arrivals −4,000", demand: 0, memory: 4000, batteries: 0, transport: 0, envelope: true },
    { label: "Battery reserve −2,000", demand: 0, memory: 0, batteries: 2000, transport: 0, envelope: true },
    { label: "Transport slots −2,000", demand: 0, memory: 0, batteries: 0, transport: 2000, envelope: true },
    { label: "Combined: demand +2% and slots −2,000", demand: 2640, memory: 0, batteries: 0, transport: 2000, envelope: false },
  ].map(s => ({ ...s, ...calculateSamsungPlan(samsungPlans[3], true, rules, s) }));
}
export type SamsungMessage = { id: number; role: "user" | "agent"; author: string; text: string; refs: string[] };
export type SamsungTask = { agent: string; text: string; app?: ProjectAppId; evidence?: string };
export type SamsungState = {
  version: 1; projectId: string; connection: "empty" | "validating" | "validated" | "active"; connectionTick: number;
  selectedSources: SamsungSourceId[]; worker: string; mapped: boolean; readOnly: boolean; stage: number;
  usedApps: ProjectAppId[]; messages: SamsungMessage[]; trace: (SamsungTask & { id: number })[];
  running: { intent: SamsungIntent; index: number; tasks: SamsungTask[] } | null;
  rules: SamsungRules; approvals: string[]; decision: "none" | "review" | "approved" | "executed"; executionDay: number;
};
export const samsungApprovalRoles = ["Quality owner", "Finance controller", "Supply chain owner"];
export function initialSamsungState(projectId: string): SamsungState {
  return { version: 1, projectId, connection: "empty", connectionTick: 0, selectedSources: [], worker: "samsung-demo-worker.invalid", mapped: false, readOnly: false, stage: 0, usedApps: [], messages: [], trace: [], running: null, rules: { budget: 900000, serviceFloor: 95 }, approvals: [], decision: "none", executionDay: -1 };
}
const answer = (state: SamsungState, text: string, refs: string[] = []): SamsungState => ({ ...state, messages: [...state.messages, { id: state.messages.length + 1, role: "agent", author: "Samsung Project Orchestrator · demo", text, refs }] });
export function requestSamsungConnections(state: SamsungState): SamsungState {
  if (state.connection !== "empty" || !state.readOnly || !state.worker.trim() || !samsungSources.every(source => state.selectedSources.includes(source.id))) throw new Error("Select all four demo sources, name the demo worker and acknowledge read-only access.");
  return { ...state, connection: "validating", connectionTick: 0 };
}
export function activateSamsung(state: SamsungState): SamsungState {
  if (state.connection !== "validated" || !state.mapped || !state.readOnly) throw new Error("Validate sources and confirm field mappings before activating the demo agents.");
  return answer({ ...state, connection: "active" }, "Demo worker activated. ERP, MES/QMS, SRM and TMS fixture contracts are available to the project agents. No specialist app has been used. Open Playground and confirm the launch scope.", samsungSources.map(s => s.id));
}
export function recognizeSamsungIntent(prompt: string): SamsungIntent | "explain" | null {
  const text = prompt.toLowerCase();
  const exact = samsungPrompts.find(p => p.prompt.toLowerCase() === text.trim()); if (exact) return exact.intent;
  if (/\b(why|explain|evidence|assumptions)\b/.test(text) && !/\b(diagnose|compare|inject|replan|prepare|release|scope)\b/.test(text)) return "explain";
  if (/\b(prepare|approval|review|brief|sign.off)\b/.test(text) && !/\b(compare|replan|diagnose|scope)\b/.test(text)) return "review";
  if (/\b(release|execute|monitor|day.by.day)\b/.test(text) && !/\b(do not|don't|never)\s+(release|execute)\b/.test(text)) return "monitor";
  if (/\b(replan|stress.test|backup|regional buffer)\b/.test(text)) return "replan";
  if (/\b(inject|new disruption|customs delay|shock)\b/.test(text)) return "shock";
  if (/\b(compare|options|trade.offs|responses)\b/.test(text)) return "compare";
  if (/\b(diagnose|baseline|bottleneck|root cause)\b/.test(text)) return "diagnose";
  if (/\b(scope|validate|hard constraints|connected data)\b/.test(text)) return "scope";
  return null;
}
function tasksFor(intent: SamsungIntent): SamsungTask[] {
  const tasks: Record<SamsungIntent, SamsungTask[]> = {
    scope: [{ agent: "Evidence Auditor", text: "Checking four fixture schemas, source timestamps and units.", evidence: "orders" }, { agent: "Project Orchestrator", text: "Fixing a 10-day horizon, 132,000 orders, service and budget constraints.", evidence: "quality" }],
    diagnose: [{ agent: "Risk Analyst", text: "Connecting component, demand and delivery dependencies.", app: "risk", evidence: "suppliers" }, { agent: "Quality Auditor", text: "Excluding all 18,000 quarantined batteries.", app: "quality", evidence: "quality" }, { agent: "Demand Analyst", text: "Including 12,000 incremental India orders in the denominator.", app: "demand", evidence: "orders" }, { agent: "Supplier Analyst", text: "Checking alternative qualification and 98,000 base memory units.", app: "suppliers", evidence: "suppliers" }, { agent: "Logistics Controller", text: "Reconciling pre-cutoff lane capacity and calculating baseline service.", app: "logistics", evidence: "transport" }],
    compare: [{ agent: "OR Formulator", text: "Enumerating the three declared response candidates.", app: "optimizer", evidence: "suppliers" }, { agent: "Manufacturing Planner", text: "Checking assembly, battery and memory capacity balance.", app: "manufacturing", evidence: "quality" }, { agent: "Finance Analyst", text: "Reconciling seven unit-cost lines and protected contribution.", app: "flow", evidence: "orders" }],
    shock: [{ agent: "Risk Analyst", text: "Applying the 8,000-unit customs delay and invalidating prior review.", app: "risk", evidence: "suppliers" }, { agent: "Logistics Controller", text: "Removing 8,000 expedited slots from the launch window.", app: "logistics", evidence: "transport" }],
    replan: [{ agent: "OR Formulator", text: "Adding 8,000 regional memory units and 8,000 backup-route slots.", app: "optimizer", evidence: "suppliers" }, { agent: "Manufacturing Planner", text: "Reducing overtime to 4,000 units of capacity; checking no lost shipments.", app: "manufacturing", evidence: "quality" }, { agent: "Scenario Analyst", text: "Evaluating four single-factor stress cases and a combined out-of-envelope case.", app: "simulation", evidence: "transport" }, { agent: "Finance Analyst", text: "Reconciling $898,000 cost and $2,000 budget headroom.", app: "flow", evidence: "orders" }],
    review: [{ agent: "Evidence Auditor", text: "Freezing plan, scope, source references and stress results for review.", evidence: "quality" }, { agent: "Project Orchestrator", text: "Requesting separate Quality, Finance and Supply Chain sign-offs.", evidence: "orders" }],
    monitor: [{ agent: "Logistics Controller", text: "Simulating approved transfer and carrier booking requests.", app: "logistics", evidence: "transport" }, { agent: "Finance Analyst", text: "Opening the ten-day execution ledger; keeping the budget ceiling fixed.", app: "flow", evidence: "orders" }],
  };
  return tasks[intent];
}
export function submitSamsungPrompt(state: SamsungState, prompt: string): SamsungState {
  if (!prompt.trim() || state.running) return state;
  let next = { ...state, messages: [...state.messages, { id: state.messages.length + 1, role: "user" as const, author: "You", text: prompt.trim(), refs: [] }] };
  if (state.connection !== "active") return answer(next, "The demo worker is not active. Open Data, select and validate the four sources, confirm mappings, then activate the agents. No app was started.");
  const intent = recognizeSamsungIntent(prompt);
  if (intent === "explain") return answer(next, "The launch plan is constrained by the minimum of qualified memory, released batteries, assembly capacity and transport before the cutoff. Quarantined batteries never enter usable supply. Costs are quantities × incremental rates. Stress results are enumerated scenarios, not probabilities or a solver optimality claim.", samsungSources.map(s => s.id));
  if (!intent) return answer(next, "This local demo recognizes the guided launch workflow and explanation questions. Use the next suggested prompt below; unrelated requests do not start apps or invent results.");
  const index = samsungPrompts.findIndex(p => p.intent === intent);
  if (index > state.stage) return answer(next, `Complete “${samsungPrompts[state.stage]?.title ?? "the current review"}” first so the evidence and constraints are established.`);
  if (index < state.stage) return answer(next, "That step is already recorded in this project transcript. Open its app evidence or ask why; use the next prompt to continue.");
  if (intent === "monitor" && state.decision !== "approved") return answer(next, "Release blocked: Decisions requires Quality, Finance and Supply Chain sign-offs on the current feasible plan. A chat request cannot grant those approvals.");
  if (intent === "shock") next = { ...next, approvals: [], decision: "none" };
  return { ...next, running: { intent, index: 0, tasks: tasksFor(intent) } };
}
export function advanceSamsung(state: SamsungState): SamsungState {
  if (state.connection === "validating") return { ...state, connectionTick: state.connectionTick + 1, connection: state.connectionTick >= 3 ? "validated" : "validating" };
  if (!state.running) return state;
  const task = state.running.tasks[state.running.index];
  const usedApps = task.app && !state.usedApps.includes(task.app) ? [...state.usedApps, task.app] : state.usedApps;
  let next: SamsungState = { ...state, usedApps, trace: [...state.trace, { ...task, id: state.trace.length + 1 }] };
  if (state.running.index + 1 < state.running.tasks.length) return { ...next, running: { ...state.running, index: state.running.index + 1 } };
  const intent = state.running.intent;
  next = { ...next, stage: state.stage + 1, running: null };
  const candidate = calculateSamsungPlan(samsungPlans[intent === "replan" || intent === "review" || intent === "monitor" ? 3 : intent === "compare" || intent === "shock" ? 2 : 0], intent === "shock" || next.stage >= 5, next.rules);
  const result = `${candidate.shipped.toLocaleString("en-US")} of ${candidate.demand.toLocaleString("en-US")} orders (${candidate.service.toFixed(2)}% service), $${candidate.cost.toLocaleString("en-US")} incremental cost; quarantined units used: 0.`;
  const responses: Record<SamsungIntent, string> = {
    scope: "Scope confirmed: India 72,000 + Europe 40,000 + Korea 20,000 = 132,000 units by 25 September. Hard constraints: released batteries only, qualified sources, USD 900,000 ceiling and 95% service. The four data contracts are checked. No specialist app has been used.",
    diagnose: `Baseline: ${result} Memory is the binding constraint at 98,000. The 18,000 battery hold is excluded, not a reserve. Trace each source below.`,
    compare: `Diversified candidate: ${result} The air-led response reaches only 120,000 units. The diversified option adds qualified memory, battery reserve, finite expedited slots and overtime. Current budget and service gates: ${candidate.feasible ? "pass" : "fail"}. No mathematical optimality or approval is claimed.`,
    shock: `The customs and lane disruption invalidates the previous candidate. Revised assessment of that old plan: ${result} Transport is now binding at 120,000. Replan before seeking approval.`,
    replan: `Revised candidate: ${result} Add 8,000 qualified regional memory units and 8,000 backup-route slots. Reduce overtime from 6,000 to 4,000 capacity units to save $20,000, retaining 130,000 assembly capacity. Four single-factor stress cases pass at the default constraints; combined demand +2% and lost transport slots fail. Open Simulation for the actual checks.`,
    review: `Decision brief prepared: ${result} Review the current computed gates in Decisions. Quality must confirm quarantine and qualification, Finance the cost ceiling, and Supply Chain allocations and residual risk.`,
    monitor: `Simulated release accepted against three recorded sign-offs. ${result} Advance the monitoring clock to inspect owner actions and reconcile final deliveries. No purchase order, booking or server write-back is sent.`,
  };
  if (intent === "review") next.decision = "review";
  if (intent === "monitor") { next.decision = "executed"; next.executionDay = 0; }
  return answer(next, responses[intent], samsungSources.map(s => s.id));
}
export function approveSamsung(state: SamsungState, role: string): SamsungState {
  const candidate = calculateSamsungPlan(samsungPlans[3], true, state.rules);
  const envelopePass = samsungStress(state.rules).filter(s => s.envelope).every(s => s.feasible);
  if (state.running || state.stage < 6 || !["review", "approved"].includes(state.decision) || !samsungApprovalRoles.includes(role) || !candidate.feasible || !envelopePass) throw new Error("Approval blocked. Prepare the current brief and satisfy all budget, service, qualification and agreed stress gates.");
  const approvals = [...new Set([...state.approvals, role])];
  return { ...state, approvals, decision: approvals.length === 3 ? "approved" : "review" };
}
export function changeSamsungRules(state: SamsungState, rules: SamsungRules): SamsungState {
  if (state.running || !Number.isFinite(rules.budget) || rules.budget < 0 || !Number.isFinite(rules.serviceFloor) || rules.serviceFloor <= 0 || rules.serviceFloor > 100) throw new Error("Enter a nonnegative budget and a service floor above 0 and at most 100, after the current task finishes.");
  return answer({ ...state, rules, approvals: [], decision: "none", stage: Math.min(state.stage, 5), executionDay: -1 }, "Constraints changed. All previous sign-offs and release state are invalidated. Prepare a new decision brief against these limits; an infeasible plan cannot be approved.");
}
export function samsungProjectPatch(project: WorkspaceProject, state: SamsungState): Partial<WorkspaceProject> {
  const active = state.connection === "active";
  return { stage: state.decision === "executed" ? "Demo monitoring" : active ? "Demo agents active" : "Draft setup", mountedAppIds: state.usedApps,
    variablePack: active ? { ...project.variablePack, l0: ["L0-001", "L0-071", "L0-057", "L0-202"] } : project.variablePack,
    counts: { ...project.counts, apps: state.usedApps.length, agents: active ? samsungAgents.length : 0, observations: active ? `${samsungSources.reduce((sum, source) => sum + source.sample.length, 0)} demo rows` : "0", documents: active ? "4 source contracts" : "0", runs: state.trace.filter(t => t.app).length, decisions: state.stage >= 6 ? 1 : 0 },
  };
}
export function samsungDelivery(day: number) { return [0, 0, 0, 8000, 22000, 42000, 65000, 86000, 106000, 120000, 128000][Math.max(0, Math.min(10, day))]; }
export const samsungOwners = [
  { day: "D1–D2", owner: "Supplier lead", action: "Confirm qualified memory allocations and battery reserve.", evidence: "suppliers" },
  { day: "D2–D3", owner: "Quality owner", action: "Verify certificates and preserve the 18,000-unit quarantine.", evidence: "quality" },
  { day: "D3–D6", owner: "Plant planner", action: "Schedule 4,000 incremental assembly slots; protect line capacity.", evidence: "quality" },
  { day: "D3–D9", owner: "Logistics lead", action: "Use expedited and backup routes; reconcile cutoff arrivals.", evidence: "transport" },
  { day: "D10", owner: "Finance + program owner", action: "Reconcile 128,000 deliveries, $898,000 cost and 4,000 unserved orders.", evidence: "orders" },
];
export function samsungExport(state: SamsungState) {
  return { schemaVersion: 1, projectId: state.projectId, brief: samsungBrief, rules: state.rules, sources: samsungSources, stage: state.stage, usedApps: state.usedApps, candidate: calculateSamsungPlan(samsungPlans[state.stage >= 5 ? 3 : state.stage >= 3 ? 2 : 0], state.stage >= 4, state.rules), stress: state.stage >= 5 ? samsungStress(state.rules) : [], approvals: state.approvals, decision: state.decision, executionDay: state.executionDay, delivered: state.executionDay >= 0 ? samsungDelivery(state.executionDay) : 0, messages: state.messages, trace: state.trace, boundary: samsungBrief.boundary };
}
