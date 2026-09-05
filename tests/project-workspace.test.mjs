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
  assert.match(workspace, /const availableAgents = \[\.\.\.agentsFor\(project\), \.\.\.createdAgents\]/);
  assert.match(workspace, /agents: availableAgents\.length/);
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

test("unresolvable explicit hierarchy fails closed to the Workspace root", async () => {
  const { resolveNavigation } = await loadNavigation();
  const invalidInputs = [
    { view: "company", sector: "unknown-sector" },
    { view: "company", client: "unknown-client" },
    { view: "company", sector: "mobility-ev", client: "helixora" },
    { view: "company", sector: "mobility-ev", project: "unknown-project" },
  ];

  for (const input of invalidInputs) {
    const result = resolveNavigation(input);
    assert.equal(result.view, "company");
    assert.equal(result.scope, "company");
    assert.equal(result.projectId, "");
    assert.equal(result.sectorId, null);
    assert.equal(result.clientId, null);
    assert.equal(result.projectApp, null);
  }
});

test("Operations World scope is authoritative even when project parameters are stale", async () => {
  const { resolveNavigation } = await loadNavigation();

  for (const view of ["global", "region"]) {
    const result = resolveNavigation({
      view,
      scope: "company",
      sector: "mobility-ev",
      client: "apex-mobility",
      project: "anode-shield",
      projectTab: "data",
      projectApp: "minerals",
      case: "CASE-1042",
    });

    assert.equal(result.view, view);
    assert.equal(result.scope, view);
    assert.equal(result.projectId, "");
    assert.equal(result.sectorId, null);
    assert.equal(result.clientId, null);
    assert.equal(result.projectTab, "overview");
    assert.equal(result.projectApp, null);
  }
});

test("project-only capabilities require a resolvable project and canonicalize valid ancestry", async () => {
  const { resolveNavigation } = await loadNavigation();
  const projectOnlyViews = ["risk", "optimizer", "flow", "demand", "suppliers", "decisions", "case", "action", "agents", "graph"];

  for (const view of projectOnlyViews) {
    const result = resolveNavigation({ view, scope: "company" });
    assert.equal(result.view, "company", `${view} must fail closed to Workspace`);
    assert.equal(result.scope, "company", `${view} must remain in Workspace scope`);
    assert.equal(result.projectId, "", `${view} must not inherit a project`);
    assert.equal(result.sectorId, null);
    assert.equal(result.clientId, null);
    assert.equal(result.projectTab, "overview");
    assert.equal(result.projectApp, null);
  }

  const decision = resolveNavigation({ view: "case", project: "cold-chain-promise" });
  assert.equal(decision.view, "case");
  assert.equal(decision.scope, "company");
  assert.equal(decision.projectId, "cold-chain-promise");
  assert.equal(decision.sectorId, "life-sciences");
  assert.equal(decision.clientId, "helixora");
  assert.equal(decision.caseId, "CASE-002-01");

  const graph = resolveNavigation({ view: "graph", project: "cold-chain-promise" });
  assert.equal(graph.view, "company");
  assert.equal(graph.projectTab, "graph");
  assert.equal(graph.projectId, "cold-chain-promise");
});

test("a session-created project has zero resources and explicit project memberships", async () => {
  const model = await loadWorkspaceModel();
  const client = model.createSessionClient({
    name: "Northstar Components",
    sector: "Industrial Automation",
    classification: "Client confidential",
    dataResidency: "EU policy intent",
    clientLead: "Client Lead Fixture",
    kearneyLead: "Kearney Lead Fixture",
  });
  const project = model.createSessionProject({
    clientId: client.id,
    name: "Zero State Network",
    problem: "Frame a new project decision without inheriting operational data.",
    outcome: "Create a governed zero-state workspace shell.",
    owner: client.clientLead,
    currency: "USD",
    regions: "EU · India",
  }, [...model.workspaceClients, client]);
  const collaborators = model.createSessionCollaborators(client);
  const memberships = model.createSessionProjectMemberships(project, collaborators[0], collaborators[1]);

  assert.equal(client.origin, "Browser-session draft");
  assert.equal(project.origin, "Browser-session draft");
  assert.deepEqual(project.counts, { entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 0, agents: 0, experts: 2 });
  assert.deepEqual(project.mountedAppIds, []);
  assert.deepEqual(project.variablePack, { l2: [], l1: [], l0: [] });
  assert.deepEqual(project.methodCodes, []);
  assert.deepEqual(model.datasetsFor(project), []);
  assert.deepEqual(model.decisionsFor(project), []);
  assert.deepEqual(model.graphNodesFor(project), []);
  assert.deepEqual(model.agentsFor(project), []);
  assert.equal(memberships.length, 2);
  assert.ok(memberships.every((membership) => membership.projectId === project.id && membership.origin === "Browser-session draft"));
  assert.equal(model.hasProjectAccess(project.id, collaborators[0].id, "decisions.approve", memberships), true);
  assert.equal(model.hasProjectAccess(project.id, collaborators[1].id, "decisions.approve", memberships), false);
  assert.equal(model.hasProjectAccess("anode-shield", collaborators[0].id, "project.view", memberships), false);
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

test("workspace hydration independently rejects an unmounted specialist studio", async () => {
  const source = await read("../app/ProjectWorkspace.tsx");
  assert.match(source, /mountedForTarget\.includes\(requestedApp\)/);
  assert.match(source, /initialSession\.mountedApps\.includes\(initialApp\)/);
  assert.match(source, /searchParams\.delete\("projectApp"\)/);
});

test("project authorization evaluates the explicit signed-in collaborator", async () => {
  const [source, shell, model] = await Promise.all([
    read("../app/ProjectWorkspace.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/workspace-model.ts"),
  ]);
  assert.match(source, /activeCollaboratorId = signedInCollaboratorId/);
  assert.match(source, /evaluateProjectAccess\(project\.id, activeCollaboratorId, capability, memberships\)/);
  assert.match(source, /projectViewAccess = evaluateProjectAccess\(project\.id, activeCollaboratorId, "project\.view", memberships\)/);
  assert.match(source, /if \(deniedAccess\) return <section className="project-access-boundary"/);
  assert.match(source, /evaluateProjectAccess\(next\.id, activeCollaboratorId, "project\.view", memberships\)/);
  assert.match(source, /if \(!authorize\("agents\.run"\)\) return/);
  assert.match(source, /if \(!authorize\("agents\.create"\)\) return/);
  assert.match(source, /if \(!authorize\("team\.manage"\)\) return/);
  assert.match(shell, /evaluateProjectAccess\(project\.id, signedInCollaboratorId, "project\.view", memberships\)/);
  assert.match(shell, /activeRouteAccess = resolvedProject && activeRouteCapability/);
  assert.match(shell, /accessibleProjects = useMemo\(\(\) => projectCatalog\.filter/);
  assert.match(shell, /accessibleClients = useMemo\(\(\) => clientCatalog\.filter/);
  assert.match(shell, /accessibleProjects\.slice\(0, 5\)\.map/);
  assert.match(shell, /\.\.\.accessibleProjects\.map/);
  assert.match(shell, /<WorkspaceHome projects=\{accessibleProjects\} clients=\{accessibleClients\}/);
  assert.match(shell, /patch\.stage === "Execute" \? "decisions\.approve" : "decisions\.draft"/);
  assert.match(shell, /<ProjectAccessBoundary decision=\{deniedProjectAccess\}/);
  assert.match(model, /signedInCollaboratorId = "kearney-engagement"/);
  assert.doesNotMatch(source, /projectRole === "Client owner"/);
  assert.doesNotMatch(source, /AGENT FOUNDRY · FRONT-END CONCEPT/);
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
