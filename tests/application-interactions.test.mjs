import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("application controls drive deterministic visible state and honest concept actions", async () => {
  const source = await read("../app/ApplicationViews.tsx");

  for (const contract of [
    /value=\{category\}[^>]*onChange=\{\(event\) => setCategory/,
    /value=\{horizon\}[^>]*onChange=\{\(event\) => setHorizon/,
    /visibleDependencies/,
    /value=\{businessUnit\}[^>]*onChange=\{\(event\) => setBusinessUnit/,
    /value=\{period\}[^>]*onChange=\{\(event\) => setPeriod/,
    /bridges: Record/,
    /seriesByGranularity/,
    /value=\{productFamily\}[^>]*onChange=\{\(event\) => setProductFamily/,
    /setCompareVersions/,
    /performanceProfiles/,
    /setRequirementIndex/,
    /setShortlisted/,
  ]) assert.match(source, contract);

  assert.match(source, /no source system was contacted/i);
  assert.match(source, /no case or operational record was created/i);
  assert.match(source, /no finance or source record was written/i);
  assert.match(source, /no operational plan changed/i);
  assert.match(source, /no supplier master was changed/i);
});

test("data controls are mutation-aware and filter the graph", async () => {
  const source = await read("../app/DataOperations.tsx");

  for (const contract of [
    /const selectedStatus = statuses\[selectedAgent\.id\]/,
    /disabled=\{!canRunTest\}/,
    /setDetailMode\("policy"\)/,
    /setDetailMode\("runs"\)/,
    /value=\{entityType\}[^>]*onChange=\{\(event\) => setEntityType/,
    /value=\{confidenceFilter\}[^>]*onChange=\{\(event\) => setConfidenceFilter/,
    /const visibleNodes = graphNodes\.filter/,
    /const visibleEdges = edges\.filter/,
    /onClick=\{resetGraph\}/,
  ]) assert.match(source, contract);

  assert.match(source, /no source was read or written/i);
  assert.match(source, /no agent or credential was created/i);
  assert.match(source, /DemandSense","demand"/);
});

test("workflow routing enforces lifecycle gates and opens the real evidence graph", async () => {
  const [workspace, shell] = await Promise.all([
    read("../app/DecisionWorkspaces.tsx"),
    read("../app/PlatformShell.tsx"),
  ]);

  assert.match(workspace, /onOpenApp\("graph"\)/);
  assert.match(workspace, /activeCase\.stage === "Approve"/);
  assert.match(workspace, /if \(!canRelease\)/);
  assert.match(workspace, /disabled=\{!canRelease\}/);
  assert.match(workspace, /Release gate blocked/);
  assert.match(workspace, /no operational write-back occurred/i);

  assert.match(shell, /Regional casting qualification is ready for validation[^\n]*"CASE-1038"/);
  assert.doesNotMatch(shell, /Mexico stock can protect Detroit service/);
});

test("change ledger selection cannot inspect a record outside the active horizon", async () => {
  const source = await read("../app/ApplicationOperatingModel.tsx");

  assert.match(source, /filtered\.find\(\(change\) => change\.id === selectedId\)/);
  assert.match(source, /const nextChanges = changes\.filter/);
  assert.match(source, /nextChanges\.some\(\(change\) => change\.id === current\)/);
  assert.doesNotMatch(source, /changes\.find\(\(change\) => change\.id === selectedId\) \?\? filtered/);
});

test("map selections carry entity, frame, and scenario into shared app and optimizer context", async () => {
  const [views, map, shell, optimizer] = await Promise.all([
    read("../app/ApplicationViews.tsx"),
    read("../app/WorldNetworkMap.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/OptimizationWorkbench.tsx"),
  ]);

  assert.match(map, /export type MapSelectionContext/);
  assert.match(map, /frame: NetworkFrameId/);
  assert.match(map, /scenario: NetworkScenarioId/);
  assert.match(map, /onOpenOptimizer\(selectionContext\)/);
  assert.match(shell, /openFromNetwork\("optimizer", selection\)/);
  assert.match(shell, /if \(item\.scope !== scope\) setNetworkSelection\(null\)/);
  assert.match(views, /SHARED NETWORK DATA CONTRACT/);
  assert.match(views, /getNetworkView\(\{ scope: snapshot\.id, frame: selection\.frame, scenario: selection\.scenario/);
  assert.match(optimizer, /networkSelection\.frame\}\/\$\{networkSelection\.scenario\}/);
});
