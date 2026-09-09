import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { osCaseEvidence } from "../app/os-case-evidence.ts";
import { compactRun, fingerprint, restoreSimulation, runSimulation, validateSimulation } from "../app/simulation-model.ts";

const osSource = await readFile(new URL("../app/agent-os-model.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(osSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"./simulation-model"', JSON.stringify(new URL("../app/simulation-model.ts", import.meta.url).href));
const { collectorManifest, createSourceDraft, ingestSample, scheduleWorkers, recordFeedback, evaluateSkill, restoreOsProject, serializeOsProject } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const now = "2026-09-09T12:00:00.000Z";
function inputFor(evidence = osCaseEvidence[0]) {
  const s = evidence.scenario;
  return { ...s, projectId: evidence.projectId, paths: 128, seed: 1234, demandVariationPct: 18, alternateAllocationPct: 100, expedite: false, serviceTargetPct: s.serviceFloorPct, openingPipelineUnits: s.demandPerWeek * Math.max(1, Math.ceil(s.baseLeadDays / 7)) };
}
test("all ten cases have distinct validated scenarios and resolvable public sources", () => {
  assert.equal(osCaseEvidence.length, 10);
  assert.equal(new Set(osCaseEvidence.map((item) => item.projectId)).size, 10);
  assert.equal(new Set(osCaseEvidence.map((item) => fingerprint(item.scenario))).size, 10);
  for (const evidence of osCaseEvidence) {
    assert.deepEqual(validateSimulation(inputFor(evidence)), [], evidence.company);
    assert.ok(evidence.scenario.operationalInputs.length >= 6);
    for (const fact of evidence.publicContext) assert.ok(evidence.sources.some((source) => source.id === fact.sourceId));
    for (const source of evidence.sources) { assert.match(source.url, /^https:\/\//); assert.ok(source.asOf <= source.fetchedOn); }
  }
});
test("paired simulation is repeatable and freezes inputs", () => {
  const input = inputFor();
  const a = runSimulation(input, now), b = runSimulation(input, now);
  assert.deepEqual(a, b);
  input.regimes[0].capacityFactor = .1;
  assert.notEqual(a.input.regimes[0].capacityFactor, .1);
  input.regimes[0].capacityFactor = 1;
});
test("changed assumptions create a different artifact and numerical results", () => {
  const input = inputFor();
  const a = runSimulation(input, now), b = runSimulation({ ...input, capacityLossPct: 95 }, now);
  assert.notEqual(a.id, b.id);
  assert.ok(b.response.service.mean < a.response.service.mean);
  assert.notEqual(a.response.loss.mean, b.response.loss.mean);
});
test("every weekly path conserves inventory and pipeline flow", () => {
  for (const evidence of osCaseEvidence) {
    const input = inputFor(evidence); const result = runSimulation(input, now);
    for (const policy of [result.baseline, result.response]) for (const path of policy.paths) {
      let stock = input.inventoryUnits, pipeline = input.openingPipelineUnits;
      for (const week of path.weeks) {
        const tolerance = Math.max(1e-7, input.capacityPerWeek * 1e-8);
        assert.ok(Math.abs(stock + week.arrived - week.served - week.inventory) < tolerance);
        assert.ok(Math.abs(pipeline + week.dispatched - week.arrived - week.inTransit) < tolerance);
        assert.ok(week.served <= week.demand + tolerance);
        assert.ok(week.inventory >= 0 && week.lostDemand >= 0 && week.inTransit >= 0);
        stock = week.inventory; pipeline = week.inTransit;
      }
      assert.ok(path.service >= 0 && path.service <= 100);
    }
    assert.equal(result.response.histogram.reduce((sum, bin) => sum + bin.count, 0), input.paths);
    assert.ok(result.response.loss.p95 <= result.response.cvar95 + 1e-7);
  }
});
test("no response lever produces an identical baseline and response", () => {
  const result = runSimulation({ ...inputFor(), alternateAllocationPct: 0, expedite: false }, now);
  assert.deepEqual(result.baseline, result.response);
  assert.equal(result.protectedLoss, 0);
});
test("alternate cannot be dispatched before qualification", () => {
  const result = runSimulation({ ...inputFor(), qualificationWeek: 4 }, now);
  for (let i = 0; i < 3; i++) assert.equal(result.baseline.paths[0].weeks[i].dispatched, result.response.paths[0].weeks[i].dispatched);
  assert.ok(result.response.paths[0].weeks[3].dispatched > result.baseline.paths[0].weeks[3].dispatched);
});
test("invalid distributions, numerical ranges and excessive workload fail closed", () => {
  for (const patch of [{ paths: 1e8 }, { seed: NaN }, { demandPerWeek: 0 }, { qualityYieldPct: 101 }, { budget: -1 }, { horizonWeeks: 2.5 }, { openingPipelineUnits: Infinity }]) assert.throws(() => runSimulation({ ...inputFor(), ...patch }), /must be/);
  const input = structuredClone(inputFor()); input.regimes[0].transition = [.8,.8,.8];
  assert.throws(() => runSimulation(input), /sum to 1/);
});
test("zero funding fails the budget gate if interventions are selected", () => {
  const result = runSimulation({ ...inputFor(), budget: 0, expedite: true }, now);
  assert.equal(result.budgetPassed, false);
});
test("restoring a compact receipt recomputes values and rejects cross-project input", () => {
  const run = runSimulation(inputFor(), now); const saved = compactRun(run); saved.response.service.mean = -999;
  assert.deepEqual(restoreSimulation(JSON.stringify(saved), run.projectId), run);
  assert.equal(restoreSimulation(JSON.stringify(saved), "another-project"), null);
  assert.equal(restoreSimulation("invalid", run.projectId), null);
  const forged = { ...compactRun(run), projectId: "pfizer-medicine-continuity" };
  assert.equal(restoreSimulation(JSON.stringify(forged), "pfizer-medicine-continuity"), null);
  saved.input.capacityLossPct = 99;
  assert.equal(restoreSimulation(JSON.stringify(saved), run.projectId), null);
});
test("CVaR uses exactly five percent of empirical probability mass", () => {
  const run = runSimulation(inputFor(), now);
  const sorted = run.response.paths.map((path) => path.loss).sort((a, b) => b - a);
  const mass = sorted.length * .05, count = Math.floor(mass);
  const exact = (sorted.slice(0, count).reduce((sum, value) => sum + value, 0) + sorted[count] * (mass - count)) / mass;
  assert.ok(Math.abs(exact - run.response.cvar95) < 1e-7);
});
test("run lineage is explicit without creating a self-parent", () => {
  const first = runSimulation(inputFor(), now);
  const next = runSimulation({ ...inputFor(), demandSurgePct: 22 }, now, first.id);
  assert.equal(next.parentRunId, first.id);
  assert.equal(runSimulation(inputFor(), now, first.id).parentRunId, null);
});
test("damaged local OS storage is normalized before rendering", () => {
  const restored = restoreOsProject(serializeOsProject({ sources: [null, {}], events: [{}], feedback: [{}], activity: [{}, "valid entry"], champion: {}, workerLimit: 900 }, "apple-launch-continuity"), "apple-launch-continuity");
  assert.deepEqual(restored.sources, []); assert.deepEqual(restored.events, []); assert.deepEqual(restored.feedback, []);
  assert.deepEqual(restored.activity, ["valid entry"]); assert.equal(restored.champion, "continuity-review@1.0"); assert.equal(restored.workerLimit, 6);
});
const sourceInput = { projectId: "apple-launch-continuity", kind: "IoT device", name: "Cold room sample", allowlist: "site-a/temperature", approved: true, deviceId: "D1", min: 2, max: 8 };
const device = () => ({ ...createSourceDraft(sourceInput, now), enabled: true });
const payload = (patch = {}) => JSON.stringify({ id: "E1", deviceId: "D1", sequence: 1, value: 5, unit: "°C", observedAt: now, ...patch });
test("collection profiles require scoped consent and never contain source credentials", () => {
  assert.throws(() => createSourceDraft({ ...sourceInput, approved: false }), /approval/);
  assert.throws(() => createSourceDraft({ ...sourceInput, allowlist: "*" }), /specific/);
  const draft = createSourceDraft(sourceInput, now); assert.equal(draft.enabled, false);
  const manifest = collectorManifest(draft);
  assert.equal(manifest.permissions.write, false); assert.equal(manifest.transport.endpoint, null); assert.equal(manifest.device.credentialEnrolled, false);
});
test("sample ingestion enforces registration, identity, freshness, sequence, units and range", () => {
  const source = device();
  assert.throws(() => ingestSample({ ...source, enabled: false }, [], payload(), now), /Enable/);
  assert.throws(() => ingestSample(source, [], payload({ deviceId: "D2" }), now), /matching/);
  assert.throws(() => ingestSample(source, [], payload({ unit: "F" }), now), /°C/);
  const event = ingestSample(source, [], payload(), now); assert.equal(event.disposition, "accepted");
  assert.throws(() => ingestSample(source, [event], payload(), now), /Duplicate/);
  for (const patch of [{ value: 13 }, { observedAt: "2026-09-08T10:00:00Z" }, { observedAt: "2026-10-01T12:00:00Z" }]) assert.equal(ingestSample(source, [], payload(patch), now).disposition, "quarantined");
  assert.equal(ingestSample(source, [{ ...event, sequence: 9, id: "later" }], payload(), now).disposition, "quarantined");
});
test("quarantined high sequences cannot poison accepted device ordering", () => {
  const source = device();
  const rejected = ingestSample(source, [], payload({ id: "future", sequence: 9999, observedAt: "2026-10-01T12:00:00Z" }), now);
  assert.equal(rejected.disposition, "quarantined");
  const valid = ingestSample(source, [rejected], payload({ id: "fresh", sequence: 2 }), now);
  assert.equal(valid.disposition, "accepted");
  assert.throws(() => ingestSample(source, [rejected], payload({ id: "future", sequence: 9999 }), now), /Duplicate/);
});
test("project state envelopes reject copied activity and champion settings", () => {
  const saved = serializeOsProject({ sources: [], events: [], feedback: [], activity: ["client-private note"], workerLimit: 6, champion: "continuity-review@1.1-shadow" }, "apple-launch-continuity");
  const wrong = restoreOsProject(saved, "pfizer-medicine-continuity");
  assert.deepEqual(wrong.activity, []); assert.equal(wrong.workerLimit, 3); assert.equal(wrong.champion, "continuity-review@1.0");
  assert.deepEqual(restoreOsProject(saved, "apple-launch-continuity").activity, ["client-private note"]);
});

test("worker plan respects concurrency limits and relinquishes simulated leases", () => {
  assert.equal(scheduleWorkers(2, true).filter((worker) => worker.state === "running").length, 2);
  assert.equal(scheduleWorkers(500, true).filter((worker) => worker.state === "running").length, 6);
  assert.ok(scheduleWorkers(2, false).every((worker) => worker.state === "expired"));
});
test("feedback gate cannot promote production or count duplicate runs as new evidence", () => {
  const result = runSimulation(inputFor(), now);
  assert.throws(() => recordFeedback(result, 101, "measurement window checked"), /0–100/);
  const feedback = recordFeedback(result, result.response.service.mean, "measurement window checked", now);
  assert.equal(evaluateSkill([feedback, feedback, feedback]).examples, 1);
  const evaluation = evaluateSkill([feedback, { ...feedback, runId: "r2" }, { ...feedback, runId: "r3" }]);
  assert.equal(evaluation.shadowEligible, true); assert.equal(evaluation.productionEligible, false);
});
