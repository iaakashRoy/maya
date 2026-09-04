import assert from "node:assert/strict";
import test from "node:test";

import { applications, decisionCases, scopeSnapshots, solveNetworkPlan } from "../app/platform-model.ts";

const baseline = {
  supplyLossPercent: 38,
  disruptionWeeks: 12,
  budgetMillions: 2.5,
  serviceTarget: 96,
  carbonLimitPercent: 4,
  strategy: "Balanced",
};

test("network optimization is deterministic and returns controlled allocations", () => {
  const first = solveNetworkPlan(baseline);
  const second = solveNetworkPlan(baseline);

  assert.deepEqual(first, second);
  assert.match(first.runId, /^ESTIMATE-[A-F0-9]{8}$/);
  assert.equal(first.inputFingerprint, first.runId.replace("ESTIMATE-", ""));
  assert.equal(typeof first.releasable, "boolean");
  assert.ok(first.candidateSpaceIndex > 0);
  assert.equal(first.constraintChecks.length, 12);
  assert.equal(first.constraintChecks.filter((check) => check.hard).length, 11);
  assert.ok(first.protectedMargin > 0);
  assert.equal(first.allocations.length, 4);
});

test("network optimization clamps unsafe or impossible inputs", () => {
  const result = solveNetworkPlan({
    ...baseline,
    supplyLossPercent: 160,
    disruptionWeeks: 0,
    budgetMillions: -4,
    serviceTarget: 120,
    carbonLimitPercent: 40,
  });

  assert.equal(result.totalCost, 0);
  assert.equal(result.releasable, false);
  assert.ok(result.hardViolations.length > 0);
  assert.equal(result.constraintChecks.filter((check) => check.hard && check.state === "Violated").length, result.hardViolations.length);
  assert.ok(result.projectedService <= 99.5);
  assert.ok(result.residualRisk >= 3);
  assert.ok(result.warnings.length > 0);
});

test("scope, case, selected entity, decision pattern, horizon, method stack, and scenario version are fingerprinted", () => {
  const context = { scope: "company", caseId: "CASE-1042", entityContext: "corridor:cor-001", patternId: "sourcing", horizon: "Tactical · 4–104 weeks", methodStack: ["M-06", "M-20", "M-24"], scenarioSetId: "JOINT-S12-V1" };
  const base = solveNetworkPlan(baseline, context);
  const variants = [
    { ...context, scope: "global" },
    { ...context, caseId: "CASE-1024" },
    { ...context, entityContext: "cargo:cargo-001" },
    { ...context, patternId: "transport" },
    { ...context, horizon: "Operational · hours–13 weeks" },
    { ...context, methodStack: ["M-05", "M-10", "M-20", "M-26"] },
    { ...context, scenarioSetId: "JOINT-S12-V2" },
  ];
  for (const variant of variants) assert.notEqual(solveNetworkPlan(baseline, variant).inputFingerprint, base.inputFingerprint);
  const outcomes = variants.map((variant) => solveNetworkPlan(baseline, variant)).map((result) => `${result.totalCost}|${result.projectedService}|${result.residualRisk}|${result.candidateSpaceIndex}`);
  assert.ok(new Set(outcomes).size > 1, "run context should affect more than the fingerprint");
});

test("all hard families participate and physical stress can block multiple families", () => {
  const stressed = solveNetworkPlan({ ...baseline, supplyLossPercent: 100, disruptionWeeks: 26, budgetMillions: 8, serviceTarget: 80, carbonLimitPercent: 20 });
  const violated = new Set(stressed.constraintChecks.filter((check) => check.hard && check.state === "Violated").map((check) => check.id));
  assert.ok(violated.has("C-04"));
  assert.ok(violated.has("C-05"));
  assert.ok(violated.has("C-08"));
  assert.equal(stressed.releasable, false);
});

test("strategy choices produce meaningfully different modeled trade-offs", () => {
  const serviceFirst = solveNetworkPlan({ ...baseline, strategy: "Service first" });
  const cashFirst = solveNetworkPlan({ ...baseline, strategy: "Cash first" });

  assert.notEqual(serviceFirst.runId, cashFirst.runId);
  assert.ok(serviceFirst.projectedService >= cashFirst.projectedService);
  assert.ok(cashFirst.totalCost <= serviceFirst.totalCost);
});

test("service-first case alternatives never report lower service than hold or balanced", () => {
  for (const decisionCase of decisionCases) {
    const serviceFirst = decisionCase.scenarios.find((scenario) => scenario.name === "Service-first response");
    const comparison = decisionCase.scenarios.filter((scenario) => scenario.name === "Hold current plan" || scenario.name === "Balanced response");
    assert.ok(serviceFirst);
    assert.ok(comparison.every((scenario) => Number.parseFloat(serviceFirst.service) >= Number.parseFloat(scenario.service)), decisionCase.id);
  }
});

test("the product model defines exactly three scopes and five task apps", () => {
  assert.deepEqual(Object.keys(scopeSnapshots), ["global", "region", "company"]);
  assert.equal(applications.length, 5);
  assert.deepEqual(applications.map((app) => app.id), ["risk", "optimizer", "flow", "demand", "suppliers"]);
});
