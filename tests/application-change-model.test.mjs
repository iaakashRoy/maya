import assert from "node:assert/strict";
import test from "node:test";

import { getApplicationChanges, learningContracts } from "../app/application-change-model.ts";

test("all seven platform surfaces expose causal before-now-forecast change records", () => {
  const ids = ["risk", "optimizer", "flow", "demand", "suppliers", "agents", "graph"];
  for (const id of ids) {
    const changes = getApplicationChanges(id);
    assert.equal(changes.length, 6, `${id} should have six change records`);
    assert.equal(new Set(changes.map((change) => change.id)).size, changes.length);
    for (const change of changes) {
      for (const field of ["asOf", "title", "entity", "metric", "previous", "current", "forecast", "delta", "cause", "evidence", "decisionTrigger", "owner", "downstream"]) assert.ok(change[field], `${change.id} lacks ${field}`);
      assert.ok(change.confidence >= 0 && change.confidence <= 100);
    }
    assert.ok(learningContracts[id].champion);
    assert.ok(learningContracts[id].challenger);
    assert.ok(learningContracts[id].driftTrigger);
  }
});
