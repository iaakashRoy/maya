import assert from "node:assert/strict";
import test from "node:test";

import { applications, scopeSnapshots, solveNetworkPlan } from "../app/platform-model.ts";

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
  assert.match(first.runId, /^OR-BALANCED-/);
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
  assert.ok(result.projectedService <= 99.5);
  assert.ok(result.residualRisk >= 3);
  assert.ok(result.warnings.length > 0);
});

test("strategy choices produce meaningfully different modeled trade-offs", () => {
  const serviceFirst = solveNetworkPlan({ ...baseline, strategy: "Service first" });
  const cashFirst = solveNetworkPlan({ ...baseline, strategy: "Cash first" });

  assert.notEqual(serviceFirst.runId, cashFirst.runId);
  assert.ok(serviceFirst.projectedService >= cashFirst.projectedService);
  assert.ok(cashFirst.totalCost <= serviceFirst.totalCost);
});

test("the product model defines exactly three scopes and five task apps", () => {
  assert.deepEqual(Object.keys(scopeSnapshots), ["global", "region", "company"]);
  assert.equal(applications.length, 5);
  assert.deepEqual(applications.map((app) => app.id), ["risk", "optimizer", "flow", "demand", "suppliers"]);
});
