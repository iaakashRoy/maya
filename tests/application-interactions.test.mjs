import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const attribute = (node, file, name) => node.attributes.properties
  .filter(ts.isJsxAttribute)
  .find((item) => item.name.getText(file) === name);

function assertInteractiveControlsHaveHandlers(path, source) {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const missing = [];
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
      if (tag === "button") {
        const isSubmit = attribute(node, file, "type")?.initializer?.getText(file).includes("submit");
        if (!attribute(node, file, "onClick") && !isSubmit) missing.push(`button:${line}`);
      }
      if (tag === "select" && !attribute(node, file, "onChange")) missing.push(`select:${line}`);
      if (attribute(node, file, "role")?.initializer?.getText(file).includes("button")) {
        if (!attribute(node, file, "onClick") || !attribute(node, file, "onKeyDown")) missing.push(`role-button:${line}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.deepEqual(missing, [], `${path} exposes interactive controls without a declared terminal handler: ${missing.join(", ")}`);
}

test("application, data, decision, and map controls declare terminal handlers", async () => {
  const paths = [
    "../app/ApplicationViews.tsx",
    "../app/DataOperations.tsx",
    "../app/DecisionWorkspaces.tsx",
    "../app/OptimizationWorkbench.tsx",
    "../app/ScopeDashboard.tsx",
    "../app/WorldNetworkMap.tsx",
  ];
  for (const path of paths) assertInteractiveControlsHaveHandlers(path, await read(path));

  const shell = await read("../app/PlatformShell.tsx");
  assert.match(shell, /const completeAction = \(title:[\s\S]*?setOutcome\(receipt\);[\s\S]*?setOutcomeLedgers/);
  assert.match(shell, /<ApplicationViews[\s\S]*?onToast=\{\(message\) => completeAction/);
  assert.match(shell, /<DataOperations[\s\S]*?onToast=\{\(message\) => completeAction/);
  assert.match(shell, /<ScopeDashboard[\s\S]*?onTrace=\{\(title, detail, artifact, context\) => completeAction/);
});

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

test("workflow routing enforces lifecycle gates and opens the project evidence graph", async () => {
  const [workspace, shell, projectWorkspace] = await Promise.all([
    read("../app/DecisionWorkspaces.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/ProjectWorkspace.tsx"),
  ]);

  assert.match(workspace, /onOpenApp\("graph"\)/);
  assert.match(workspace, /activeCase\.stage === "Approve"/);
  assert.match(workspace, /if \(!canRelease\)/);
  assert.match(workspace, /disabled=\{!canRelease\}/);
  assert.match(workspace, /Release gate blocked/);
  assert.match(workspace, /no operational write-back occurred/i);

  assert.match(shell, /next === "decisions" \|\| next === "agents" \|\| next === "graph"/);
  assert.match(shell, /openProjectTab\(next === "decisions" \? "decisions" : next\)/);
  assert.match(shell, /<DecisionWorkspaces[^>]*onOpenApp=\{\(app\) => go\(app\)\}/);
  assert.match(projectWorkspace, /tab === "graph" && <GraphPanel/);
  assert.match(projectWorkspace, /graph\.evidence\.\$\{selected\.id\}[\s\S]*?onEvidence\(selectedReceipt\)/);
  assert.match(projectWorkspace, /\{evidence && <EvidenceDrawer receipt=\{evidence\}/);
});

test("map selections retain entity, frame, and scenario and seed project intake", async () => {
  const [views, map, dashboard, shell, optimizer] = await Promise.all([
    read("../app/ApplicationViews.tsx"),
    read("../app/WorldNetworkMap.tsx"),
    read("../app/ScopeDashboard.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/OptimizationWorkbench.tsx"),
  ]);

  assert.match(map, /export type MapSelectionContext/);
  assert.match(map, /frame: NetworkFrameId/);
  assert.match(map, /scenario: NetworkScenarioId/);
  assert.match(map, /return \{ \.\.\.selection, label:[^\n]*frame, scenario \}/);
  assert.match(map, /onOpenRisk\(selectionContext\)/);
  assert.match(map, /onOpenOptimizer\(selectionContext\)/);
  assert.match(map, /onOpenFlow\(selectionContext\)/);
  assert.match(dashboard, /openDependencyIntake[^\n]*intake: "dependency"/);
  assert.match(dashboard, /openRouteIntake[^\n]*intake: "route"/);
  assert.match(dashboard, /openValueIntake[^\n]*intake: "value"/);
  assert.match(dashboard, /onOpenRisk=\{openDependencyIntake\}/);
  assert.match(dashboard, /onOpenOptimizer=\{openRouteIntake\}/);
  assert.match(dashboard, /onOpenFlow=\{openValueIntake\}/);
  assert.match(shell, /onAddToProject=\{\(selection\) => \{[\s\S]*?startOnboarding\("project"\);[\s\S]*?if \(!selection\) return;/);
  assert.match(shell, /const intent = selection\.intake \?\? "dependency"/);
  assert.match(shell, /operationsWorldIntake: \{[\s\S]*?selectedKind: selection\.kind,[\s\S]*?selectedId: selection\.id,[\s\S]*?frame: selection\.frame,[\s\S]*?scenario: selection\.scenario/);
  assert.match(views, /SHARED NETWORK DATA CONTRACT/);
  assert.match(views, /getNetworkView\(\{ scope: snapshot\.id, frame: selection\.frame, scenario: selection\.scenario/);
  assert.match(optimizer, /networkSelection\.kind[^\n]*networkSelection\.id[^\n]*networkSelection\.frame[^\n]*networkSelection\.scenario/);
});

test("regional selection filters both dashboard rows and the network map", async () => {
  const [dashboard, map, model] = await Promise.all([
    read("../app/ScopeDashboard.tsx"),
    read("../app/WorldNetworkMap.tsx"),
    read("../app/network-operations-model.ts"),
  ]);

  assert.match(dashboard, /region: selectedRegion/);
  assert.match(dashboard, /regionalOperationsProfiles: Record<NetworkRegion/);
  for (const region of ["APAC", "Europe", "Americas", "MEA"]) assert.match(dashboard, new RegExp(`\\n  ${region}: \\{`));
  assert.match(dashboard, /activeSnapshot = worldScope === "region" \? \{ \.\.\.snapshot, \.\.\.regionalOperationsProfiles\[selectedRegion\] \} : snapshot/);
  assert.match(dashboard, /activeSnapshot\.metrics\.map/);
  assert.match(dashboard, /activeSnapshot\.intel\.map/);
  assert.match(dashboard, /activeSnapshot\.money\.map/);
  assert.match(dashboard, /activeSnapshot\.suppliers\.map/);
  assert.match(dashboard, /traceScopeId = worldScope === "region"/);
  assert.match(dashboard, /traceContext = `Operations World \/ \$\{activeSnapshot\.shortLabel\}`/);
  assert.match(dashboard, /emitTrace\(title, detail, artifact, traceContext\)/);
  assert.match(dashboard, /onRefresh\(traceContext\)/);
  assert.match(dashboard, /getNetworkView\(\{ scope: worldScope, region: selectedRegion/);
  assert.match(dashboard, /\[category, dashboardFrame, movementMode, selectedRegion, worldScope\]/);
  assert.match(dashboard, /value=\{selectedRegion\} onChange=\{\(event\) => onRegionChange/);
  assert.match(dashboard, /key=\{`\$\{snapshot\.id\}-\$\{selectedRegion\}-\$\{horizon\}`\}/);
  assert.match(dashboard, /region=\{selectedRegion\}/);
  assert.match(map, /resetCamera = \(\) => setCamera\(initialCamera\(scope, region\)\)/);
  assert.match(map, /getNetworkView\(\{ scope, region, frame, scenario/);
  assert.match(model, /from\?\.region === \(filters\.region \?\? "APAC"\) \|\| to\?\.region === \(filters\.region \?\? "APAC"\)/);

  const shell = await read("../app/PlatformShell.tsx");
  assert.match(shell, /useState<NetworkRegion>\("APAC"\)/);
  assert.match(shell, /region=\{operationsRegion\}/);
  assert.match(shell, /onRegionChange=\{setOperationsRegion\}/);
  assert.match(shell, /regionalOperationsProfiles\[operationsRegion\]\.context/);
  assert.match(shell, /onTrace=\{\(title, detail, artifact, context\) => completeAction\(title, detail, artifact, "Saved", context\)\}/);
  assert.match(shell, /contextOverride \?\? \(scope === "company"/);
});

test("rendered application surfaces stay concise and exclude the presentation operating-model section", async () => {
  const [views, data, optimizer, shell] = await Promise.all([
    read("../app/ApplicationViews.tsx"),
    read("../app/DataOperations.tsx"),
    read("../app/OptimizationWorkbench.tsx"),
    read("../app/PlatformShell.tsx"),
  ]);
  const renderedSurfaces = [views, data, optimizer, shell].join("\n");

  assert.match(views, /outcome="Dependencies and exposure" body="Review current risk signals/);
  assert.match(views, /outcome="Material and cash flow" body="Inspect inventory/);
  assert.match(views, /outcome="Demand range and drivers" body="Compare order/);
  assert.match(views, /outcome="Supplier dependency and options" body="Inspect ownership/);
  assert.match(data, />Knowledge graph<\/h1><p>Inspect entities, relationships, evidence lineage, and decision impact\.<\/p>/);
  assert.match(optimizer, /Define the decision model, compare scenarios, and prepare a response for expert review\./);
  assert.match(optimizer, /OBJECTIVE MODEL/);
  assert.doesNotMatch(optimizer, /CONCEPT FORM/);

  assert.doesNotMatch(renderedSurfaces, /ApplicationOperatingModel|<ApplicationOperatingModel|application-blueprint/);
  assert.doesNotMatch(renderedSurfaces, /APPLICATION OPERATING MODEL|How .* turns evidence into action/);
  assert.doesNotMatch(renderedSurfaces, /Know what can stop production—and where to intervene first|Frame, formulate, calculate, stress, compare, validate, and govern/);
});
