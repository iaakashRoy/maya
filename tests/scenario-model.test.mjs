import assert from "node:assert/strict";
import test from "node:test";

import { calculateScenario } from "../app/product-model.ts";

const baseline = {
  supplyReduction: 38,
  disruptionWeeks: 12,
  responseBudget: 2.5,
  serviceTarget: 96,
  strategy: "Balanced recovery",
};

test("scenario calculation is deterministic and fully synthetic", () => {
  const first = calculateScenario(baseline);
  const second = calculateScenario(baseline);

  assert.deepEqual(first, second);
  assert.equal(first.synthetic, true);
  assert.match(first.simulationId, /^SYN-balanced-/);
  assert.ok(first.marginProtectedUsdMillions > 0);
  assert.equal(first.recommendedActions.length, 3);
});

test("scenario calculation clamps unsafe or impossible inputs", () => {
  const result = calculateScenario({
    ...baseline,
    supplyReduction: 160,
    disruptionWeeks: 0,
    responseBudget: -4,
    serviceTarget: 120,
  });

  assert.deepEqual(result.normalizedInput, {
    ...baseline,
    supplyReduction: 100,
    disruptionWeeks: 1,
    responseBudget: 0,
    serviceTarget: 100,
  });
  assert.equal(result.budgetUtilizationPercent, 0);
  assert.ok(result.warnings.length > 0);
});

test("strategy choices produce meaningfully different modeled trade-offs", () => {
  const fastest = calculateScenario({ ...baseline, strategy: "Fastest recovery" });
  const lowestCash = calculateScenario({ ...baseline, strategy: "Lowest cash impact" });

  assert.notEqual(fastest.simulationId, lowestCash.simulationId);
  assert.ok(fastest.projectedOtifPercent >= lowestCash.projectedOtifPercent);
  assert.ok(Math.abs(lowestCash.cashImpactUsdMillions) <= Math.abs(fastest.cashImpactUsdMillions));
});
