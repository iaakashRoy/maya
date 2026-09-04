import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the application catalog documents OR methods, controls, measures, and handoffs for all seven surfaces", async () => {
  const catalog = await readFile(new URL("../app/application-catalog.ts", import.meta.url), "utf8");

  for (const id of ["risk", "optimizer", "flow", "demand", "suppliers", "agents", "graph"]) {
    assert.match(catalog, new RegExp(`\\n  ${id}: \\{`), `Missing operating model for ${id}`);
  }

  for (const method of [
    "Bayesian event updating",
    "Mixed-integer linear programming",
    "Cash conversion decomposition",
    "Hierarchical time-series ensemble",
    "Graph centrality and community detection",
    "Probabilistic entity resolution",
    "Temporal property graph",
  ]) {
    assert.match(catalog, new RegExp(method), `Missing application-specific method: ${method}`);
  }

  for (const contract of ["workflow:", "methods:", "dataContracts:", "controls:", "kpis:", "handoffs:", "limitations:"]) {
    assert.equal(catalog.split(contract).length - 1, 8, `${contract} should exist in the type and all seven applications`);
  }
});
