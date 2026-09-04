import assert from "node:assert/strict";
import test from "node:test";

import { constraintFamilies, decisionPatterns, orMethods, probabilityModelControls, solutionEvidenceBlocks, uncertaintyScenarios, validationGates } from "../app/or-methodology.ts";

test("the OR workbench contains the complete, sequential M-01 through M-30 handbook catalog", () => {
  const handbookNames = [
    "Exploratory diagnostics and statistical process control",
    "Time-series, causal, and hierarchical forecasting",
    "Intermittent-demand forecasting",
    "Bayesian inference and state estimation",
    "Linear programming and minimum-cost network flow",
    "Mixed-integer linear programming",
    "Dynamic programming and lot sizing",
    "Constraint programming and CP-SAT",
    "Greedy graph and dispatch algorithms",
    "Vehicle-routing heuristics and local search",
    "Metaheuristics and adaptive large-neighborhood search",
    "Decomposition, column generation, and Lagrangian relaxation",
    "Single- and multi-echelon inventory optimization",
    "Queueing and flow analysis",
    "Reliability, survival, and maintenance optimization",
    "Monte Carlo simulation",
    "Discrete-event simulation",
    "System-dynamics simulation",
    "Agent-based and network-contagion simulation",
    "Two-stage and multistage stochastic programming",
    "Chance-constrained optimization",
    "Robust and distributionally robust optimization",
    "CVaR and risk-averse optimization",
    "Multiobjective and Pareto optimization",
    "Multi-criteria decision analysis and data envelopment analysis",
    "Simulation-optimization, rolling horizon, and digital twins",
    "Approximate dynamic programming and reinforcement learning",
    "Design of experiments, sensitivity, and causal analysis",
    "Game theory, auctions, and contract mechanism design",
    "Statistical quality and acceptance sampling",
  ];

  assert.equal(orMethods.length, 30);
  assert.deepEqual(orMethods.map((method) => method.code), Array.from({ length: 30 }, (_, index) => `M-${String(index + 1).padStart(2, "0")}`));
  assert.deepEqual(orMethods.map((method) => method.name), handbookNames);
  assert.equal(new Set(orMethods.map((method) => method.code)).size, 30);
  for (const method of orMethods) {
    assert.ok(method.purpose.length > 40, `${method.code} needs a substantive purpose`);
    assert.ok(method.formulation.length > 40, `${method.code} needs a formulation`);
    assert.ok(method.techniques.length >= 4, `${method.code} needs named techniques`);
    assert.ok(method.outputs.length >= 4, `${method.code} needs decision outputs`);
    assert.ok(method.validation.length >= 3, `${method.code} needs validation evidence`);
    assert.ok(method.limitations.length > 35, `${method.code} needs a guardrail`);
    assert.ok(method.runtime.length > 0, `${method.code} needs a runtime class`);
    assert.ok(method.decisionShapes.length >= 3, `${method.code} needs decision-shape coverage`);
  }
});

test("the method catalog retains the handbook-named greedy, matheuristic, and inventory-service techniques", () => {
  const method = (code) => orMethods.find((item) => item.code === code);
  const requiredTechniques = {
    "M-09": ["Shortest path", "Cheapest feasible arc", "Largest-demand-first", "Highest-criticality-first", "Marginal value per capacity", "Greedy set cover"],
    "M-11": ["Tabu search", "Simulated annealing", "Genetic algorithms", "Memetic algorithms", "ALNS", "Ruin-and-recreate", "Fix-and-reoptimize", "Relax-and-fix", "Exact neighborhood reoptimization", "Route/pattern-pool reoptimization"],
    "M-13": ["Newsvendor", "EOQ", "Reorder point", "Cycle-service probability", "Fill rate from expected shortage"],
  };

  for (const [code, techniques] of Object.entries(requiredTechniques)) {
    assert.ok(method(code), `Missing ${code}`);
    for (const technique of techniques) assert.ok(method(code).techniques.includes(technique), `${code} lacks ${technique}`);
  }
  assert.match(method("M-13").limitations, /cycle service and fill rate are not interchangeable/i);
  assert.ok(method("M-13").validation.some((item) => /cycle service and fill rate separately/i.test(item)));
});

test("probability foundations retain every handbook distribution family and its assumption controls", () => {
  assert.equal(probabilityModelControls.length, 6);
  assert.equal(new Set(probabilityModelControls.map((item) => item.behavior)).size, 6);

  const candidates = new Set(probabilityModelControls.flatMap((item) => item.candidates));
  for (const candidate of [
    "Gamma", "Lognormal", "Weibull", "Empirical / quantile", "Poisson", "Negative binomial",
    "Zero-inflated count model", "Beta", "Empirical bounded distribution", "Bernoulli", "Logistic",
    "Markov state", "Exponential", "Survival model", "Empirical scenarios", "Copula", "Factor model", "Regime model",
  ]) assert.ok(candidates.has(candidate), `Missing probability candidate ${candidate}`);

  const controls = probabilityModelControls.flatMap((item) => item.assumptionControls).join(" | ");
  for (const required of ["Tail fit", "Censoring", "Overdispersion", "Changing exposure", "denominator", "State persistence", "Common-cause dependence", "Hazard shape", "Joint-tail preservation", "Regime stability"]) {
    assert.match(controls, new RegExp(required, "i"), `Missing assumption control ${required}`);
  }
  for (const model of probabilityModelControls) {
    assert.ok(model.candidates.length >= 2, `${model.behavior} needs candidate models`);
    assert.ok(model.typicalUses.length >= 4, `${model.behavior} needs supply-chain uses`);
    assert.ok(model.assumptionControls.length >= 3, `${model.behavior} needs assumption controls`);
  }
});

test("all decision-pattern method stacks resolve and retain explicit primary, supporting, and fallback roles", () => {
  const codes = new Set(orMethods.map((method) => method.code));
  const expectedStacks = {
    allocation: { primary: ["M-05", "M-06"], supporting: ["M-08", "M-13", "M-17", "M-20"] },
    network: { primary: ["M-06"], supporting: ["M-05", "M-20", "M-22", "M-24"] },
    sourcing: { primary: ["M-06"], supporting: ["M-20", "M-22", "M-24", "M-25", "M-29"] },
    production: { primary: ["M-06"], supporting: ["M-07", "M-08", "M-20"] },
    scheduling: { primary: ["M-08"], supporting: ["M-06", "M-11", "M-17"] },
    inventory: { primary: ["M-13"], supporting: ["M-07", "M-20", "M-22"] },
    transport: { primary: ["M-05", "M-10"], supporting: ["M-11", "M-17", "M-20", "M-22", "M-26"] },
    warehouse: { primary: ["M-08"], supporting: ["M-10", "M-14", "M-17"] },
    workforce: { primary: ["M-08"], supporting: ["M-06", "M-16", "M-24"] },
    maintenance: { primary: ["M-15"], supporting: ["M-06", "M-07", "M-17"] },
    reverse: { primary: ["M-05", "M-06"], supporting: ["M-08", "M-10", "M-17", "M-24"] },
    portfolio: { primary: ["M-06", "M-24"], supporting: ["M-05", "M-16", "M-20", "M-21", "M-22", "M-23", "M-26"] },
  };

  assert.equal(decisionPatterns.length, 12);
  for (const pattern of decisionPatterns) {
    assert.ok(pattern.primary.length > 0);
    assert.ok(pattern.supporting.length > 0);
    assert.ok(codes.has(pattern.fallback));
    for (const code of [...pattern.primary, ...pattern.supporting]) assert.ok(codes.has(code), `${pattern.id} references missing ${code}`);
    assert.deepEqual(pattern.primary, expectedStacks[pattern.id].primary, `${pattern.id} primary stack drifted from the handbook crosswalk`);
    assert.deepEqual(pattern.supporting, expectedStacks[pattern.id].supporting, `${pattern.id} supporting stack drifted from the handbook crosswalk`);
    assert.equal(pattern.fallback, "M-09", `${pattern.id} needs the transparent greedy fallback`);
    assert.ok(pattern.handbookRefs.length >= 2, `${pattern.id} needs handbook traceability`);
    assert.ok(pattern.handbookRefs.every((reference) => /Table 3|Appendix A/.test(reference)), `${pattern.id} has an invalid handbook reference`);
  }
});

test("the formulation and evidence contracts match the handbook structure", () => {
  assert.equal(constraintFamilies.length, 12);
  assert.equal(constraintFamilies.reduce((sum, constraint) => sum + constraint.count, 0), 57);
  assert.deepEqual(constraintFamilies.map((constraint) => constraint.id), Array.from({ length: 12 }, (_, index) => `C-${String(index + 1).padStart(2, "0")}`));
  assert.equal(uncertaintyScenarios.length, 12);
  assert.ok(Math.abs(uncertaintyScenarios.reduce((sum, scenario) => sum + scenario[2], 0) - 1) < 1e-9);
  assert.ok(uncertaintyScenarios.every((scenario) => scenario[2] > 0 && scenario[2] < 1));
  assert.equal(new Set(uncertaintyScenarios.map((scenario) => scenario[0])).size, 12);
  assert.equal(validationGates.length, 4);
  assert.deepEqual(validationGates.map((gate) => gate.id), ["semantic", "mathematical", "empirical", "operational"]);
  assert.equal(solutionEvidenceBlocks.length, 7);
  assert.deepEqual(solutionEvidenceBlocks.map((block) => block[0]), ["Feasibility", "Solution quality", "Risk", "Stability", "Performance", "Reproducibility", "Explainability"]);
});
