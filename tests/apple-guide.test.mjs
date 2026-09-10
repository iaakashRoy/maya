import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { compactRun, restoreSimulation, SIMULATION_VERSION } from "../app/simulation-model.ts";
import { describeColumn } from "../app/statistical-analysis.ts";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
test("the Apple guide is standalone and contains the complete case rather than a new workflow", async () => {
  const [html, md, shell] = await Promise.all([read("../docs/apple-project-guide.html"), read("../docs/APPLE_PROJECT_GUIDE.md"), read("../app/PlatformShell.tsx")]);
  assert.doesNotMatch(md, /\{\{[A-Z_]+\}\}/);
  assert.equal((md.match(/^## /gm) ?? []).length, 23);
  assert.doesNotMatch(shell, /apple-project-guide|APPLE_PROJECT_GUIDE/);
  assert.doesNotMatch(html, /<(?:script|img|iframe)\b[^>]*\bsrc=/i);
  assert.doesNotMatch(html, /<link\b[^>]*\brel=["']stylesheet/i);
  for (const name of ["Risk Radar", "Network Optimizer", "Flow Lens", "Demand Sense", "Supplier Graph", "Mineral Atlas", "Workforce Studio", "Manufacturing Twin", "Logistics Radar", "Quality Genealogy", "Statistical Studio", "Simulation", "Playground", "Operations World", "Controls", "Variables", "CEO", "CTO"]) assert.ok(md.includes(name), name);
  assert.match(md, /not an Apple engagement/);
  assert.match(md, /extra 25,200 devices is \*\*not known to exist\*\*/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, "Document identifiers are unique");
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
  for (const [, attributes, code] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) if (!attributes.includes("application/json")) assert.doesNotThrow(() => new vm.Script(code));
});

test("Apple report evidence reproduces all six calculations and the filtered sample", async () => {
  const pack = JSON.parse(await read("../docs/apple-project-evidence.json"));
  assert.equal(pack.methodVersion, SIMULATION_VERSION);
  assert.equal(pack.experiments.length, 6);
  for (const item of pack.experiments) {
    const restored = restoreSimulation(JSON.stringify(item.run), pack.projectId);
    assert.ok(restored, item.key);
    assert.deepEqual(compactRun(restored), item.run);
  }
  const { rows, columnId, summary, filter, filteredSummary } = pack.statistics;
  assert.deepEqual(describeColumn(rows, columnId), summary);
  assert.deepEqual(describeColumn(rows.filter(r => r[columnId] >= filter.minimum), columnId), filteredSummary);
  assert.equal(pack.experiments.find(e => e.key === "default").run.targetPassed, false);
  assert.equal(pack.experiments.find(e => e.key === "expedite").run.budgetPassed, false);
  assert.equal(pack.experiments.find(e => e.key === "buffer").run.targetPassed, true);
  assert.ok(Object.values(pack.sourceSha256).every(hash => /^[a-f0-9]{64}$/.test(hash)));
  const html = await read("../docs/apple-project-guide.html");
  const embedded = JSON.parse(html.match(/<script type="application\/json" id="evidence-pack">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(embedded, pack);
});

test("shared graph diagnostics and scenario labels never turn preset metadata into fitted results", async () => {
  const [graph, stats, project] = await Promise.all([read("../app/ProjectSupplyChainExplorer.tsx"), read("../app/statistical-model.ts"), read("../app/ProjectWorkspace.tsx")]);
  assert.match(graph, /statisticalRowsFor\(selectedTable, 96\)/);
  assert.match(graph, /describeColumn\(tableRows/);
  assert.doesNotMatch(graph, /selectedTable\.(bestFit|stationarity|driftScore|missingPercent)/);
  assert.match(graph, /No distribution fit, stationarity test or drift test has run/);
  assert.match(stats, /unit: "fixture index"/);
  assert.match(project, /SCENARIO FIXTURE/);
  assert.doesNotMatch(project, /LIVE SIMULATION/);
});
