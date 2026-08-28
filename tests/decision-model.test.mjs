import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("synthetic decision model spans scopes, applications, variables, methods, and lifecycle", async () => {
  const model = await readFile(new URL("../app/platform-model.ts", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../app/DecisionWorkspaces.tsx", import.meta.url), "utf8");

  const caseIds = [...model.matchAll(/id: "CASE-\d{4}"/g)];
  assert.equal(caseIds.length, 9);

  for (const scope of ["global", "region", "company"]) assert.match(model, new RegExp(`scope: "${scope}"`));
  for (const app of ["risk", "optimizer", "flow", "demand", "suppliers"]) assert.match(model, new RegExp(`app: "${app}"`));
  for (const stage of ["Detect", "Validate", "Simulate", "Approve", "Execute", "Measure"]) assert.match(model, new RegExp(`"${stage}"`));

  assert.match(model, /"L0-[A-Z0-9-]+"/);
  assert.match(model, /"M-\d{2}"/);
  assert.match(workspace, /OR SCENARIO LAB/);
  assert.match(workspace, /EVIDENCE LEDGER/);
  assert.match(workspace, /APPROVAL MATRIX/);
  assert.match(workspace, /OUTCOME CONTRACT/);
});
