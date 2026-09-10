import type { OsCaseEvidence } from "./os-case-evidence";

/** Transparent browser engine. Planning experiments, never a production solver. */
export const SIMULATION_VERSION = "supply-flow-monte-carlo@1.1.0";
export type Regime = { name: string; leadDays: number; capacityFactor: number; transition: number[] };
export type SimulationInput = {
  projectId: string; unit: string; horizonWeeks: number; demandPerWeek: number;
  capacityPerWeek: number; qualifiedAlternatePerWeek: number; inventoryUnits: number;
  baseLeadDays: number; capacityLossPct: number; demandSurgePct: number; qualityYieldPct: number;
  expeditePremiumPerUnit: number; unitMargin: number; regimes: Regime[];
  paths: number; seed: number; demandVariationPct: number; alternateAllocationPct: number;
  expedite: boolean; serviceTargetPct: number; qualificationWeek: number; budget: number; openingPipelineUnits: number;
  /** Omitted means no authorized expedited capacity, never unlimited capacity. */
  expediteCapacityPerWeek?: number;
};
export type PathWeek = { week: number; state: string; demand: number; dispatched: number; expedited: number; arrived: number; served: number; inventory: number; lostDemand: number; inTransit: number };
export type PathResult = { index: number; service: number; loss: number; interventionCost: number; lostUnits: number; weeks: PathWeek[] };
export type Distribution = { mean: number; p05: number; p50: number; p95: number; worst: number };
export type PolicyResult = { service: Distribution; loss: Distribution; cvar95: number; targetProbability: number; meanCost: number; paths: PathResult[]; histogram: { from: number; to: number; count: number }[] };
export type SimulationRun = { id: string; parentRunId: string | null; version: string; fingerprint: string; projectId: string; createdAt: string; input: SimulationInput; baseline: PolicyResult; response: PolicyResult; protectedLoss: number; targetPassed: boolean; budgetPassed: boolean; disclosure: string };
export const simulationStorageKey = (projectId: string) => `tanjnx.simulation.v1.${projectId}`;

/** Shared by the UI and reproducible documentation; no inferred physical limits. */
export function simulationInputForCase(evidence: OsCaseEvidence): SimulationInput {
  const s = evidence.scenario;
  return { projectId: evidence.projectId, unit: s.unit, horizonWeeks: s.horizonWeeks, demandPerWeek: s.demandPerWeek, capacityPerWeek: s.capacityPerWeek, qualifiedAlternatePerWeek: s.qualifiedAlternatePerWeek, inventoryUnits: s.inventoryUnits, baseLeadDays: s.baseLeadDays, capacityLossPct: s.capacityLossPct, demandSurgePct: s.demandSurgePct, qualityYieldPct: s.qualityYieldPct, expeditePremiumPerUnit: s.expeditePremiumPerUnit, unitMargin: s.unitMargin, regimes: structuredClone(s.regimes), paths: 512, seed: 20260909, demandVariationPct: 18, alternateAllocationPct: 100, expedite: false, serviceTargetPct: s.serviceFloorPct, qualificationWeek: s.qualificationWeek, budget: s.budget, openingPipelineUnits: s.demandPerWeek * Math.max(1, Math.ceil(s.baseLeadDays / 7)), expediteCapacityPerWeek: s.expediteCapacityPerWeek ?? 0 };
}

export function fingerprint(value: unknown) {
  let h = 2166136261;
  for (const char of JSON.stringify(value)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}
function random(seed: number) {
  let state = seed >>> 0;
  return () => { state += 0x6d2b79f5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function quantile(values: readonly number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = Math.max(0, Math.min(1, p)) * (sorted.length - 1);
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * (position - lower);
}
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
function distribution(values: number[], worst: "min" | "max"): Distribution {
  return { mean: mean(values), p05: quantile(values, .05), p50: quantile(values, .5), p95: quantile(values, .95), worst: worst === "min" ? Math.min(...values) : Math.max(...values) };
}
export function validateSimulation(input: SimulationInput): string[] {
  const errors: string[] = [];
  const bounded = (key: keyof SimulationInput, low: number, high: number, integer = false) => {
    const value = input[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < low || value > high || (integer && !Number.isInteger(value))) errors.push(`${key} must be ${integer ? "an integer " : ""}between ${low} and ${high}.`);
  };
  bounded("horizonWeeks", 2, 26, true); bounded("paths", 32, 4096, true); bounded("seed", 1, 2147483647, true);
  for (const key of ["demandPerWeek", "capacityPerWeek"] as const) bounded(key, 1, 1e10);
  for (const key of ["qualifiedAlternatePerWeek", "inventoryUnits", "expeditePremiumPerUnit", "unitMargin"] as const) bounded(key, 0, 1e10);
  bounded("baseLeadDays", 0, 365); bounded("capacityLossPct", 0, 100); bounded("demandSurgePct", -75, 200);
  bounded("qualityYieldPct", 0, 100); bounded("demandVariationPct", 0, 75); bounded("alternateAllocationPct", 0, 100); bounded("serviceTargetPct", 1, 100);
  bounded("qualificationWeek", 1, 26, true); bounded("budget", 0, 1e12); bounded("openingPipelineUnits", 0, 1e12);
  if (input.expediteCapacityPerWeek !== undefined) bounded("expediteCapacityPerWeek", 0, 1e10);
  if (typeof input.expedite !== "boolean") errors.push("expedite must be a boolean.");
  if (!input.projectId || !input.unit) errors.push("Project and unit are required.");
  if (!Array.isArray(input.regimes) || input.regimes.length < 1 || input.regimes.length > 6) errors.push("Use one to six operating regimes.");
  else for (const regime of input.regimes) {
    if (!Number.isFinite(regime.capacityFactor) || regime.capacityFactor < 0 || regime.capacityFactor > 2 || !Number.isFinite(regime.leadDays) || regime.leadDays < 0 || regime.leadDays > 365) errors.push(`${regime.name}: invalid capacity or lead time.`);
    if (regime.transition.length !== input.regimes.length || regime.transition.some((p) => !Number.isFinite(p) || p < 0 || p > 1) || Math.abs(regime.transition.reduce((s, p) => s + p, 0) - 1) > .000001) errors.push(`${regime.name}: transition probabilities must sum to 1.`);
  }
  return errors;
}
function simulatePath(input: SimulationInput, index: number, response: boolean): PathResult {
  // Common random numbers ensure the policy comparison faces the same shocks.
  const rng = random(input.seed + index * 7919);
  let regimeIndex = 0, inventory = input.inventoryUnits, totalDemand = 0, totalServed = 0, interventionCost = 0;
  const openingWeeks = Math.max(1, Math.ceil(input.baseLeadDays / 7));
  const pipeline: { due: number; units: number }[] = Array.from({ length: openingWeeks }, (_, i) => ({ due: i + 1, units: input.openingPipelineUnits / openingWeeks }));
  const weeks: PathWeek[] = [];
  for (let week = 1; week <= input.horizonWeeks; week++) {
    const transition = rng(); let cumulative = 0;
    const previous = input.regimes[regimeIndex];
    for (let state = 0; state < previous.transition.length; state++) { cumulative += previous.transition[state]; if (transition <= cumulative) { regimeIndex = state; break; } }
    const regime = input.regimes[regimeIndex];
    // Symmetric triangular demand; regime affects capacity AND transit (dependent shocks).
    const variation = (rng() + rng() - 1) * input.demandVariationPct / 100;
    const demand = Math.max(0, input.demandPerWeek * (1 + input.demandSurgePct / 100) * (1 + variation));
    const primary = input.capacityPerWeek * (1 - input.capacityLossPct / 100) * regime.capacityFactor * input.qualityYieldPct / 100;
    const alternate = response && week >= input.qualificationWeek ? input.qualifiedAlternatePerWeek * input.alternateAllocationPct / 100 * input.qualityYieldPct / 100 : 0;
    // Regime leadDays is TOTAL transit, not an increment to baseLeadDays.
    const leadWeeks = Math.max(0, Math.ceil(regime.leadDays / 7));
    const expediteLimit = response && input.expedite ? input.expediteCapacityPerWeek ?? 0 : 0;
    // Explicit primary-first policy, not an optimization. Only dispatches whose
    // lead time can shorten consume capacity. Existing pipeline is not retimed.
    const primaryFast = leadWeeks > 0 ? Math.min(primary, expediteLimit) : 0;
    const alternateFast = Math.min(alternate, Math.max(0, expediteLimit - primaryFast));
    const expedited = primaryFast + alternateFast;
    pipeline.push({ due: week + leadWeeks, units: primary - primaryFast });
    if (primaryFast) pipeline.push({ due: week + leadWeeks - 1, units: primaryFast });
    if (alternate > alternateFast) pipeline.push({ due: week + 1, units: alternate - alternateFast });
    if (alternateFast) pipeline.push({ due: week, units: alternateFast });
    interventionCost += alternate * input.expeditePremiumPerUnit * .6 + expedited * input.expeditePremiumPerUnit;
    const arrived = pipeline.filter((shipment) => shipment.due <= week).reduce((sum, shipment) => sum + shipment.units, 0);
    for (let i = pipeline.length - 1; i >= 0; i--) if (pipeline[i].due <= week) pipeline.splice(i, 1);
    inventory += arrived;
    const served = Math.min(inventory, demand);
    inventory -= served; totalDemand += demand; totalServed += served;
    weeks.push({ week, state: regime.name, demand, dispatched: primary + alternate, expedited, arrived, served, inventory, lostDemand: demand - served, inTransit: pipeline.reduce((sum, item) => sum + item.units, 0) });
  }
  const lostUnits = totalDemand - totalServed;
  return { index, service: totalDemand ? totalServed / totalDemand * 100 : 100, loss: lostUnits * input.unitMargin + interventionCost, lostUnits, interventionCost, weeks };
}
function summarize(paths: PathResult[], target: number): PolicyResult {
  const losses = paths.map((path) => path.loss).sort((a, b) => b - a);
  const tailMass = paths.length * .05, whole = Math.floor(tailMass), fraction = tailMass - whole;
  const cvar95 = (losses.slice(0, whole).reduce((sum, value) => sum + value, 0) + (losses[whole] ?? 0) * fraction) / tailMass;
  const histogram = Array.from({ length: 10 }, (_, index) => ({ from: index * 10, to: (index + 1) * 10, count: paths.filter((path) => path.service >= index * 10 && (index === 9 ? path.service <= 100 : path.service < (index + 1) * 10)).length }));
  return { service: distribution(paths.map((path) => path.service), "min"), loss: distribution(losses, "max"), cvar95, targetProbability: paths.filter((path) => path.service >= target).length / paths.length * 100, meanCost: mean(paths.map((path) => path.interventionCost)), paths, histogram };
}
export function runSimulation(input: SimulationInput, createdAt = new Date().toISOString(), parentRunId: string | null = null): SimulationRun {
  const errors = validateSimulation(input);
  if (errors.length) throw new Error(errors.join(" "));
  const snapshot = structuredClone(input);
  const baseline = summarize(Array.from({ length: input.paths }, (_, index) => simulatePath(snapshot, index, false)), input.serviceTargetPct);
  const response = summarize(Array.from({ length: input.paths }, (_, index) => simulatePath(snapshot, index, true)), input.serviceTargetPct);
  const hash = fingerprint({ version: SIMULATION_VERSION, input: snapshot });
  return { id: `SIM-${hash}`, parentRunId: parentRunId === `SIM-${hash}` ? null : parentRunId, version: SIMULATION_VERSION, fingerprint: hash, projectId: input.projectId, createdAt, input: snapshot, baseline, response, protectedLoss: baseline.loss.mean - response.loss.mean, targetPassed: response.service.p05 >= input.serviceTargetPct, budgetPassed: Math.max(...response.paths.map((path) => path.interventionCost)) <= input.budget, disclosure: "Computed browser experiment on modeled operational inputs. No live feeds, external solver, commercial optimum, calibrated probabilities, or production execution. Unserved demand is lost each week. Opening pipeline arrives evenly over the baseline lead time. Capacity cut compounds with state-dependent capacity loss. Economics include unmet-demand margin and intervention premiums only, in modeled USD. Flows are aggregate programme equivalents and can be fractional, not integer builds or released lots. Domain-specific safety and eligibility constraints require separate human verification." };
}
export function compactRun(run: SimulationRun) {
  return structuredClone({ ...run, baseline: { ...run.baseline, paths: run.baseline.paths.slice(0, 3) }, response: { ...run.response, paths: run.response.paths.slice(0, 3) } });
}
export function restoreSimulation(raw: string | null, projectId: string): SimulationRun | null {
  try {
    const saved = JSON.parse(raw ?? "null") as SimulationRun | null;
    if (!saved || saved.projectId !== projectId || saved.version !== SIMULATION_VERSION || typeof saved.createdAt !== "string" || !Number.isFinite(Date.parse(saved.createdAt)) || !saved.input || saved.input.projectId !== projectId || validateSimulation(saved.input).length || saved.fingerprint !== fingerprint({ version: SIMULATION_VERSION, input: saved.input })) return null;
    // Recompute instead of trusting browser-persisted result fields.
    return runSimulation(saved.input, saved.createdAt, saved.parentRunId ?? null);
  } catch { return null; }
}
