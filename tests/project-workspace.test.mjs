import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const asModuleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function loadWorkspaceModel() {
  const source = await read("../app/workspace-model.ts");
  return import(asModuleUrl(transpile(source)));
}

async function loadNavigation() {
  const [navigationSource, platformSource, workspaceSource] = await Promise.all([
    read("../app/navigation.ts"),
    read("../app/platform-model.ts"),
    read("../app/workspace-model.ts"),
  ]);
  const linkedSource = navigationSource
    .replace('"./platform-model"', JSON.stringify(asModuleUrl(transpile(platformSource))))
    .replace('"./workspace-model"', JSON.stringify(asModuleUrl(transpile(workspaceSource))));
  return import(asModuleUrl(transpile(linkedSource)));
}

test("ten client projects are isolated, evidence-aware, and mounted to distinct app contracts", async () => {
  const model = await loadWorkspaceModel();
  const { workspaceProjects, projectApps, evidenceFor, decisionsFor, graphNodesFor, datasetsFor } = model;

  assert.equal(workspaceProjects.length, 10);
  assert.equal(new Set(workspaceProjects.map((project) => project.sectorId)).size, 10);
  assert.equal(new Set(workspaceProjects.map((project) => project.clientId)).size, 10);
  assert.equal(projectApps.length, 10);
  assert.equal(new Set(projectApps.map((app) => app.accent)).size, 10);
  assert.equal(new Set(projectApps.map((app) => app.archetype)).size, 10);

  for (const project of workspaceProjects) {
    assert.equal(project.counts.apps, project.mountedAppIds.length, `${project.code} app count`);
    assert.ok(project.mountedAppIds.every((id) => projectApps.some((app) => app.id === id)));
    for (const metric of project.metrics) {
      const receipt = evidenceFor(project, metric.evidenceRef);
      assert.equal(receipt.projectId, project.id);
      assert.match(receipt.access, new RegExp(project.client.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    const decisions = JSON.stringify(decisionsFor(project));
    for (const decision of decisionsFor(project)) {
      const receipt = evidenceFor(project, decision.evidenceRef);
      assert.equal(receipt.projectId, project.id);
      assert.notEqual(receipt.displayedValue, "Not found", `${project.code} ${decision.id} evidence resolves`);
    }
    if (project.id === "anode-shield") {
      assert.match(decisions, /800V drive-unit launch/);
    } else {
      assert.match(decisions, new RegExp(project.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    assert.ok(graphNodesFor(project).every((node) => evidenceFor(project, node.evidenceRef).projectId === project.id));
    assert.ok(datasetsFor(project).every((dataset) => dataset.id.startsWith(project.code)));
  }

  const helix = workspaceProjects.find((project) => project.id === "cold-chain-promise");
  const crossProjectLookup = evidenceFor(helix, "EV-001-01");
  assert.equal(crossProjectLookup.projectId, helix.id);
  assert.equal(crossProjectLookup.displayedValue, "Not found");
  assert.equal(crossProjectLookup.confidence, 0);
  assert.match(crossProjectLookup.formula, /no foreign or fallback claim was substituted/i);
  assert.match(crossProjectLookup.access, /Helixora Therapeutics/);
  assert.doesNotMatch(crossProjectLookup.access, /Apex Mobility/);

  const generated = model.fixtureEvidenceFor(helix, { id: "EV-TEST", claim: "Fixture review state", displayedValue: "1", source: "Test fixture", formula: "Static test" });
  assert.equal(generated.reviewer, "Unreviewed fixture");
});

test("every project taxonomy reference resolves to the source taxonomy and stores only canonical IDs", async () => {
  const [model, taxonomy] = await Promise.all([loadWorkspaceModel(), read("../../SUPPLY_CHAIN_VARIABLE_TAXONOMY.md")]);
  const knownIds = new Set([...taxonomy.matchAll(/^\| (L[012]-\d{3}) \|/gm)].map((match) => match[1]));

  for (const project of model.workspaceProjects) {
    for (const level of ["l2", "l1", "l0"]) {
      for (const variableId of project.variablePack[level]) {
        assert.match(variableId, /^L[012]-\d{3}$/);
        assert.ok(knownIds.has(variableId), `${project.code} references unknown ${variableId}`);
      }
    }
  }

  for (const app of model.projectApps) {
    for (const variableId of app.variableIds) {
      assert.match(variableId, /^L[012]-\d{3}$/);
      assert.ok(knownIds.has(variableId), `${app.id} references unknown ${variableId}`);
    }
  }
});

test("each project variable pack follows a valid taxonomy L2 to L1 to L0 ancestry", async () => {
  const [model, taxonomy] = await Promise.all([loadWorkspaceModel(), read("../../SUPPLY_CHAIN_VARIABLE_TAXONOMY.md")]);
  const expand = (text, prefix) => {
    const ids = new Set();
    const expression = new RegExp(`${prefix}-(\\d{3})(?:[–-]${prefix}-(\\d{3}))?`, "g");
    for (const match of text.matchAll(expression)) {
      const start = Number(match[1]);
      const end = Number(match[2] ?? match[1]);
      for (let value = start; value <= end; value += 1) ids.add(`${prefix}-${String(value).padStart(3, "0")}`);
    }
    return ids;
  };
  const constituentColumn = (level) => new Map(taxonomy.split(/\r?\n/).filter((line) => line.startsWith(`| ${level}-`)).map((line) => {
    const cells = line.split("|").map((cell) => cell.trim());
    return [cells[1], cells[5]];
  }));
  const l1Rows = constituentColumn("L1");
  const l2Rows = constituentColumn("L2");

  for (const project of model.workspaceProjects) {
    const coveredL0 = new Set(project.variablePack.l1.flatMap((id) => [...expand(l1Rows.get(id) ?? "", "L0")]));
    const coveredL1 = new Set(project.variablePack.l2.flatMap((id) => [...expand(l2Rows.get(id) ?? "", "L1")]));
    for (const id of project.variablePack.l0) assert.ok(coveredL0.has(id), `${project.code} ${id} has no selected L1 parent`);
    for (const id of project.variablePack.l1) assert.ok(coveredL1.has(id), `${project.code} ${id} has no selected L2 parent`);
  }
});

test("project workspace buttons are action-identified and shell actions end in receipts", async () => {
  const [workspace, studios, shell] = await Promise.all([
    read("../app/ProjectWorkspace.tsx"),
    read("../app/ProjectAppStudios.tsx"),
    read("../app/PlatformShell.tsx"),
  ]);
  for (const [name, source] of [["workspace", workspace], ["studios", studios]]) {
    const buttons = source.match(/<button\b/g) ?? [];
    const actions = source.match(/data-action-id=/g) ?? [];
    assert.ok(actions.length >= buttons.length, `${name} has a clickable button without an action ID`);
  }
  assert.match(shell, /className="user-button"[^>]*onClick=/);
  assert.match(shell, /onOutcome=\{completeAction\}/);
  assert.match(shell, /className="action-outcome"/);
  assert.match(shell, /projectCasePatches\[projectCaseKey\]/);
  assert.match(shell, /const key = projectCaseKey/);
  assert.match(shell, /setProjectCasePatches/);
  assert.match(shell, /setOutcomeLedger/);
  assert.match(shell, /Record<string, readonly ActionOutcome\[\]>/);
  assert.match(shell, /project:\$\{activeProject\.id\}/);
  assert.match(shell, /SESSION RECEIPT LEDGER/);
  assert.match(shell, /project: url\.searchParams\.get\("project"\)/);
  assert.match(shell, /result\.projectId \? openProject\(result\.projectId\)/);
  assert.match(shell, /onToast=\{\(message\) => completeAction/);
  assert.match(workspace, /const projectSessionCache: Record<string, ProjectSessionState>/);
  assert.match(workspace, /projectSessionCache\[projectId\] =/);
  assert.match(workspace, /datasetsFor\(project\)\.length \+ sessionDatasets\.length/);
  assert.match(workspace, /expertAgents\.length \+ createdAgents\.length/);
  assert.match(workspace, /assignedExperts\.length/);
});

test("project route wiring preserves project, tab, and mounted-studio parameters", async () => {
  const [navigation, page, workspace] = await Promise.all([
    read("../app/navigation.ts"),
    read("../app/page.tsx"),
    read("../app/ProjectWorkspace.tsx"),
  ]);
  assert.match(navigation, /projectTab\?: SearchValue/);
  assert.match(navigation, /projectApp\?: SearchValue/);
  assert.match(navigation, /project\.mountedAppIds\.includes/);
  assert.match(page, /initialProjectId=\{navigation\.projectId\}/);
  assert.match(page, /initialProjectApp=\{navigation\.projectApp\}/);
  assert.match(workspace, /url\.searchParams\.set\("projectApp", id\)/);
  assert.match(workspace, /window\.addEventListener\("popstate", restore\)/);
  assert.match(navigation, /workspaceStudioIds\.includes/);
});

test("navigation resolves sector and client paths without crossing hierarchy boundaries", async () => {
  const { resolveNavigation } = await loadNavigation();

  const sectorOnly = resolveNavigation({ view: "company", sector: "semiconductors" });
  assert.equal(sectorOnly.projectId, "fab-recovery-x9");
  assert.equal(sectorOnly.sectorId, "semiconductors");
  assert.equal(sectorOnly.clientId, "orion-silicon");

  const clientOnly = resolveNavigation({ view: "company", client: "blueharbor" });
  assert.equal(clientOnly.projectId, "berth-to-door");
  assert.equal(clientOnly.sectorId, "ports-maritime");
  assert.equal(clientOnly.clientId, "blueharbor");

  const matchedPair = resolveNavigation({ view: "company", sector: "life-sciences", client: "helixora" });
  assert.equal(matchedPair.projectId, "cold-chain-promise");
});

test("a valid explicit project is authoritative and returns canonical ancestry", async () => {
  const { resolveNavigation } = await loadNavigation();
  const result = resolveNavigation({
    view: "company",
    sector: "wrong-sector",
    client: "wrong-client",
    project: "lithium-cell-provenance",
  });

  assert.equal(result.view, "company");
  assert.equal(result.scope, "company");
  assert.equal(result.projectId, "lithium-cell-provenance");
  assert.equal(result.sectorId, "critical-minerals");
  assert.equal(result.clientId, "terrametals");
  assert.equal(result.caseId, "CASE-007-01");
});

test("unresolvable explicit hierarchy fails closed instead of selecting Apex", async () => {
  const { resolveNavigation } = await loadNavigation();
  const invalidInputs = [
    { view: "company", sector: "unknown-sector" },
    { view: "company", client: "unknown-client" },
    { view: "company", sector: "mobility-ev", client: "helixora" },
    { view: "company", sector: "mobility-ev", project: "unknown-project" },
  ];

  for (const input of invalidInputs) {
    const result = resolveNavigation(input);
    assert.equal(result.view, "global");
    assert.equal(result.scope, "global");
    assert.equal(result.projectId, "");
    assert.equal(result.sectorId, null);
    assert.equal(result.clientId, null);
    assert.equal(result.projectApp, null);
  }
});

test("project cases are canonical, including generated deep links and the Anode exception", async () => {
  const { resolveNavigation } = await loadNavigation();

  const generated = resolveNavigation({ view: "case", case: "CASE-006-01" });
  assert.equal(generated.scope, "company");
  assert.equal(generated.projectId, "copper-rare-earth");
  assert.equal(generated.caseId, "CASE-006-01");

  const canonicalized = resolveNavigation({ view: "company", project: "omnichannel-peak", case: "CASE-1042" });
  assert.equal(canonicalized.caseId, "CASE-010-01");

  const anode = resolveNavigation({ view: "company", project: "anode-shield", case: "CASE-001-01" });
  assert.equal(anode.caseId, "CASE-1042");
});

test("projectApp requires the company apps tab and a mounted specialist studio", async () => {
  const { resolveNavigation } = await loadNavigation();
  const mounted = { view: "company", project: "lithium-cell-provenance", projectTab: "apps", projectApp: "minerals" };

  assert.equal(resolveNavigation(mounted).projectApp, "minerals");
  assert.equal(resolveNavigation({ ...mounted, view: "risk", scope: "company" }).projectApp, null);
  assert.equal(resolveNavigation({ ...mounted, projectTab: "overview" }).projectApp, null);
  assert.equal(resolveNavigation({ ...mounted, projectApp: "risk" }).projectApp, null);
  assert.equal(resolveNavigation({ ...mounted, project: "cold-chain-promise" }).projectApp, null);
});

test("all primary clickflow buttons have a terminal handler or submit a handled form", async () => {
  const paths = ["../app/ProjectWorkspace.tsx", "../app/ProjectAppStudios.tsx", "../app/PlatformShell.tsx", "../app/ApplicationViews.tsx", "../app/DecisionWorkspaces.tsx"];
  for (const path of paths) {
    const source = await read(path);
    const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const missing = [];
    const visit = (node) => {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(file) === "button") {
        const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
        const hasClick = attrs.some((attr) => attr.name.getText(file) === "onClick");
        const isSubmit = attrs.some((attr) => attr.name.getText(file) === "type" && attr.initializer?.getText(file).includes("submit"));
        if (!hasClick && !isSubmit) missing.push(file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    assert.deepEqual(missing, [], `${path} buttons without onClick or handled submit at lines ${missing.join(", ")}`);
  }
});
