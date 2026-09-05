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

async function loadActivityModel() {
  const [activitySource, workspaceSource] = await Promise.all([
    read("../app/project-activity-model.ts"),
    read("../app/workspace-model.ts"),
  ]);
  const workspaceUrl = asModuleUrl(transpile(workspaceSource));
  return import(asModuleUrl(transpile(activitySource.replace('"./workspace-model"', JSON.stringify(workspaceUrl)))));
}

test("ten clients and their cross-tower projects are isolated, evidence-aware, and mounted to distinct app contracts", async () => {
  const model = await loadWorkspaceModel();
  const { workspaceProjects, projectApps, evidenceFor, decisionsFor, graphNodesFor, datasetsFor } = model;

  assert.equal(workspaceProjects.length, 11);
  assert.equal(new Set(workspaceProjects.map((project) => project.sectorId)).size, 10);
  assert.equal(new Set(workspaceProjects.map((project) => project.clientId)).size, 10);
  assert.equal(workspaceProjects.filter((project) => project.clientId === "apex-mobility").length, 2);
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
  assert.match(workspace, /projectSessionCache\[project\.id\] =/);
  assert.match(workspace, /datasetsFor\(project\)\.length \+ sessionDatasets\.length/);
  assert.match(workspace, /const availableAgents = \[\.\.\.agentsFor\(project\), \.\.\.createdAgents\]/);
  assert.match(workspace, /agents: availableAgents\.length/);
  assert.match(workspace, /assignedExperts\.length/);
});

test("agent app-run links and run artifacts terminate on exact, concrete project records", async () => {
  const workspace = await read("../app/ProjectWorkspace.tsx");
  assert.match(workspace, /const openAppRun = \(runId: string\)/);
  assert.match(workspace, /onRunChange\(linkedRun\.sessionId, linkedRun\.id\)/);
  assert.match(workspace, /onClick=\{\(\) => onOpenRun\(ref\)\}/);
  assert.match(workspace, /const \[selectedRunId, setSelectedRunId\] = useState\(fallback\?\.id \?\? ""\)/);
  assert.match(workspace, /setArtifactReceipt\(reportReceipt\)/);
  assert.match(workspace, /setArtifactReceipt\(traceReceipt\)/);
  assert.match(workspace, /planAppRerun\(activityState, project\.id, selected\.id, selected\.sessionId\)/);
  assert.match(workspace, /plan\.runId} was created in \$\{plan\.sessionId\}/);
  assert.doesNotMatch(workspace, /Application report opened/);
  assert.doesNotMatch(workspace, /\$\{selected\.id\}-REPLAY/);
});

test("the shell owns project, tab, session, run, and mounted-studio navigation", async () => {
  const [navigation, page, workspace, shell] = await Promise.all([
    read("../app/navigation.ts"),
    read("../app/page.tsx"),
    read("../app/ProjectWorkspace.tsx"),
    read("../app/PlatformShell.tsx"),
  ]);
  assert.match(navigation, /projectTab\?: SearchValue/);
  assert.match(navigation, /projectApp\?: SearchValue/);
  assert.match(navigation, /project\.mountedAppIds\.includes/);
  assert.match(page, /initialProjectId=\{navigation\.projectId\}/);
  assert.match(page, /initialProjectApp=\{navigation\.projectApp\}/);
  assert.match(shell, /url\.searchParams\.set\("projectApp", appId\)/);
  assert.match(shell, /window\.addEventListener\("popstate", onPopState\)/);
  assert.doesNotMatch(workspace, /window\.history|window\.addEventListener\("popstate"/);
  assert.match(navigation, /workspaceStudioIds\.includes/);
});

test("navigation requires an explicit project and never guesses a leaf from a client or tower path", async () => {
  const { resolveNavigation } = await loadNavigation();

  const sectorOnly = resolveNavigation({ view: "company", sector: "semiconductors" });
  assert.equal(sectorOnly.projectId, "");
  assert.equal(sectorOnly.sectorId, null);
  assert.equal(sectorOnly.clientId, null);

  const clientOnly = resolveNavigation({ view: "company", client: "blueharbor" });
  assert.equal(clientOnly.projectId, "");
  assert.equal(clientOnly.sectorId, null);
  assert.equal(clientOnly.clientId, null);

  const matchedPair = resolveNavigation({ view: "company", sector: "life-sciences", client: "helixora" });
  assert.equal(matchedPair.projectId, "");
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

  const legacyTeam = resolveNavigation({ view: "company", project: "cold-chain-promise", projectTab: "team" });
  assert.equal(legacyTeam.view, "company");
  assert.equal(legacyTeam.projectTab, "overview");
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

test("restored application routes fail closed to Data & graph until the project has an L0 contract", async () => {
  const [navigation, model] = await Promise.all([loadNavigation(), loadWorkspaceModel()]);
  const seed = model.workspaceProjects[0];
  const empty = {
    ...seed,
    id: "empty-app-route-fixture",
    code: "P-S099",
    mountedAppIds: ["risk", "minerals"],
    variablePack: { ...seed.variablePack, l0: [] },
  };

  const restoredRoutes = [
    { view: "risk", project: empty.id, run: "APP-P-S099-RR-001" },
    { view: "company", project: empty.id, projectTab: "apps", projectApp: "minerals", run: "APP-P-S099-MA-001" },
  ];

  for (const route of restoredRoutes) {
    const result = navigation.resolveNavigation(route, [empty]);
    assert.equal(result.view, "company");
    assert.equal(result.scope, "company");
    assert.equal(result.projectId, empty.id);
    assert.equal(result.sectorId, empty.sectorId);
    assert.equal(result.clientId, empty.clientId);
    assert.equal(result.projectTab, "data");
    assert.equal(result.projectApp, null);
    assert.equal(result.sessionId, null);
    assert.equal(result.runId, null);
  }

  const catalog = navigation.resolveNavigation({ view: "company", project: empty.id, projectTab: "apps" }, [empty]);
  assert.equal(catalog.projectTab, "apps", "the app catalog remains reachable for project setup");
  assert.equal(catalog.projectApp, null);
});

test("session and app-run deep links are project scoped and canonical for their visible surface", async () => {
  const [navigation, activity, workspace] = await Promise.all([loadNavigation(), loadActivityModel(), loadWorkspaceModel()]);
  const state = activity.seedProjectActivity(workspace.workspaceProjects);
  const base = { project: "anode-shield" };

  const agentRoutes = [
    navigation.resolveNavigation({ ...base, view: "company", projectTab: "agents", session: "SES-P001-023" }, workspace.workspaceProjects, state),
    navigation.resolveNavigation({ ...base, view: "agents", session: "SES-P001-023" }, workspace.workspaceProjects, state),
  ];
  for (const result of agentRoutes) {
    assert.equal(result.view, "company");
    assert.equal(result.projectTab, "agents");
    assert.equal(result.sessionId, "SES-P001-023");
    assert.equal(result.runId, null);
  }

  const genericRun = navigation.resolveNavigation({ ...base, view: "company", projectTab: "overview", run: "APP-P001-NO-019" }, workspace.workspaceProjects, state);
  assert.equal(genericRun.projectTab, "apps");
  assert.equal(genericRun.sessionId, "SES-P001-024");
  assert.equal(genericRun.runId, "APP-P001-NO-019");

  const riskRun = navigation.resolveNavigation({ ...base, view: "risk", run: "APP-P001-RR-019" }, workspace.workspaceProjects, state);
  assert.equal(riskRun.view, "risk");
  assert.equal(riskRun.runId, "APP-P001-RR-019");

  const wrongRiskRun = navigation.resolveNavigation({ ...base, view: "risk", run: "APP-P001-NO-019" }, workspace.workspaceProjects, state);
  assert.equal(wrongRiskRun.view, "risk");
  assert.equal(wrongRiskRun.sessionId, null);
  assert.equal(wrongRiskRun.runId, null);

  const mineralRun = navigation.resolveNavigation({ ...base, view: "company", projectTab: "apps", projectApp: "minerals", run: "APP-P001-MA-019" }, workspace.workspaceProjects, state);
  assert.equal(mineralRun.projectApp, "minerals");
  assert.equal(mineralRun.runId, "APP-P001-MA-019");

  const wrongStudioRun = navigation.resolveNavigation({ ...base, view: "company", projectTab: "apps", projectApp: "minerals", run: "APP-P001-NO-019" }, workspace.workspaceProjects, state);
  assert.equal(wrongStudioRun.projectApp, "minerals");
  assert.equal(wrongStudioRun.sessionId, null);
  assert.equal(wrongStudioRun.runId, null);

  const mismatchedPair = navigation.resolveNavigation({ ...base, view: "company", projectTab: "apps", session: "SES-P001-023", run: "APP-P001-NO-019" }, workspace.workspaceProjects, state);
  assert.equal(mismatchedPair.sessionId, null);
  assert.equal(mismatchedPair.runId, null);

  const foreignPair = navigation.resolveNavigation({ ...base, view: "company", projectTab: "apps", session: "SES-P002-024", run: "APP-P002-NO-019" }, workspace.workspaceProjects, state);
  assert.equal(foreignPair.sessionId, null);
  assert.equal(foreignPair.runId, null);
});

test("browser-session specialist mounts become canonical and survive route restoration", async () => {
  const [{ resolveNavigation }, model, shell] = await Promise.all([
    loadNavigation(),
    loadWorkspaceModel(),
    read("../app/PlatformShell.tsx"),
  ]);
  const seed = model.workspaceProjects[0];
  const draft = {
    ...seed,
    id: "browser-route-fixture",
    code: "P-S001",
    origin: "Browser-session draft",
    mountedAppIds: [],
    counts: { ...seed.counts, apps: 0 },
  };
  const route = {
    view: "company",
    scope: "company",
    project: draft.id,
    projectTab: "apps",
    projectApp: "minerals",
  };

  assert.equal(resolveNavigation(route, [draft]).projectApp, null);

  const mountedDraft = {
    ...draft,
    mountedAppIds: ["minerals"],
    counts: { ...draft.counts, apps: 1 },
  };
  assert.equal(resolveNavigation(route, [mountedDraft]).projectApp, "minerals");
  assert.equal(resolveNavigation({ ...route, projectTab: "overview" }, [mountedDraft]).projectApp, null);
  assert.equal(resolveNavigation(route, [mountedDraft]).projectApp, "minerals");

  assert.match(shell, /const handleMountedAppsChange = useCallback[\s\S]*?setProjectCatalog[\s\S]*?mountedAppIds: \[\.\.\.appIds\][\s\S]*?counts: \{ \.\.\.item\.counts, apps: appIds\.length \}/);
  assert.match(shell, /const effectiveMountedApps = resolvedProject\?\.mountedAppIds \?\? \[\]/);
  assert.doesNotMatch(shell, /mountedAppsByProject/);
});

test("project rendering accepts only shell-validated mounted studios", async () => {
  const [source, navigation] = await Promise.all([read("../app/ProjectWorkspace.tsx"), read("../app/navigation.ts")]);
  assert.match(source, /initialSession\.mountedApps\.includes\(initialApp\)/);
  assert.match(navigation, /project\.mountedAppIds\.includes\(requestedProjectApp as ProjectAppId\)/);
  assert.doesNotMatch(source, /searchParams|popstate|window\.history/);
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
  assert.match(shell, /evaluateProjectAccess\(project\.id, signedInCollaboratorId, "project\.view", memberships\)/);
  assert.match(source, /if \(!authorize\("agents\.run"\)\) return/);
  assert.match(source, /if \(!authorize\("agents\.create"\)\) return/);
  assert.match(source, /if \(!authorize\("team\.manage"\)\) return/);
  assert.match(shell, /evaluateProjectAccess\(project\.id, signedInCollaboratorId, "project\.view", memberships\)/);
  assert.match(shell, /activeRouteAccess = resolvedProject && activeRouteCapability/);
  assert.match(shell, /accessibleProjects = useMemo\(\(\) => projectCatalog\.filter/);
  assert.match(shell, /accessibleClients = useMemo\(\(\) => clientCatalog\.filter/);
  assert.match(shell, /groupProjectsByPath\(pathProjects, projectPathMode\)/);
  assert.match(shell, /sidebarPathGroups/);
  assert.match(shell, /projectPathSegments\(resolvedProject, projectPathMode\)/);
  assert.match(shell, /className="project-context-stack"/);
  assert.match(shell, /className="project-context-bar"/);
  assert.doesNotMatch(shell, />Recent projects</);
  assert.match(shell, /\.\.\.accessibleProjects\.map/);
  assert.match(shell, /<WorkspaceHome projects=\{accessibleProjects\} clients=\{accessibleClients\}/);
  assert.match(shell, /patch\.stage === "Execute" \? "decisions\.approve" : "decisions\.draft"/);
  assert.match(shell, /<ProjectAccessBoundary decision=\{deniedProjectAccess\}/);
  assert.match(model, /signedInCollaboratorId = "kearney-engagement"/);
  assert.doesNotMatch(source, /projectRole === "Client owner"/);
  assert.doesNotMatch(source, /AGENT FOUNDRY · FRONT-END CONCEPT/);
});

test("all primary clickflow buttons have a terminal handler or submit a handled form", async () => {
  const paths = ["../app/ProjectWorkspace.tsx", "../app/ProjectAppStudios.tsx", "../app/PlatformShell.tsx", "../app/ApplicationViews.tsx", "../app/DecisionWorkspaces.tsx", "../app/WorkIdentityInspector.tsx"];
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

test("project chrome has one hierarchy, mounted context, and three accessible collapse controls", async () => {
  const [workspace, shell, css] = await Promise.all([
    read("../app/ProjectWorkspace.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/globals.css"),
  ]);
  assert.match(shell, />By client</);
  assert.match(shell, />By tower</);
  assert.match(shell, /projectPathSegments\(resolvedProject, projectPathMode\)/);
  assert.match(shell, /className="project-context-bar"/);
  assert.match(shell, /className="rail-quick-actions"/);
  assert.match(shell, /data-action-id="nav\.onboard-client"/);
  assert.match(shell, /data-action-id="nav\.new-project"/);
  assert.match(shell, /className="project-people-bar"/);
  assert.match(shell, /className="context-identity-tools context-agent-tools"/);
  assert.match(shell, /className="context-identity-tools context-team-tools"/);
  assert.match(shell, /data-action-id="context\.open-apps"/);
  assert.match(shell, /data-action-id="context\.agents"/);
  assert.match(shell, /data-action-id="context\.team"/);
  assert.match(shell, /className="mobile-project-path"/);
  assert.match(shell, /aria-label="Open clients and projects"/);
  assert.match(shell, /data-action-id="nav\.collapse"[^>]*aria-expanded=/);
  assert.match(workspace, /data-action-id="agents\.toggle-sessions"[^>]*aria-expanded=/);
  assert.match(workspace, /data-action-id="agents\.toggle-inspector"[^>]*aria-expanded=/);
  assert.doesNotMatch(workspace, /ProjectTree|MobileProjectSwitcher|workspace\.toggle-project-tree|className="project-tree"/);
  assert.doesNotMatch(css, /\.project-tree|\.mobile-project-switcher|\.project-panel-controls/);
  assert.match(css, /@container project-stage \(max-width: 960px\)/);
  assert.match(css, /\.dataset-card-grid \{ grid-template-columns: repeat\(2/);
  assert.match(css, /\.breadcrumb-segment \{[^}]*display: inline-flex/s);
  assert.match(css, /\.mobile-project-path \{[^}]*display: grid/s);
  assert.doesNotMatch(shell, /context\.open-sessions|className="context-session"/);
  assert.doesNotMatch(css, /\.context-session/);
  assert.match(css, /\.project-people-bar \{[\s\S]*?grid-template-columns: minmax\(0, 1\.25fr\) minmax\(0, \.75fr\)/);
  assert.match(css, /\.side-rail \.rail-footer \{ display: none; \}/);
  assert.match(css, /--rail-width: 304px/);
  assert.match(css, /\.work-identity-inspector \{[\s\S]*?position: fixed/);
  assert.match(css, /\.project-tabs \{[\s\S]*?grid-template-columns: repeat\(5/);
  assert.doesNotMatch(css, /\.project-tabs[^}]*overflow-x:\s*(?:auto|scroll)/s);
});

test("visible project navigation is app-first and keeps data, graph, and identity work connected", async () => {
  const [workspace, model, shell, inspector] = await Promise.all([
    read("../app/ProjectWorkspace.tsx"),
    read("../app/workspace-model.ts"),
    read("../app/PlatformShell.tsx"),
    read("../app/WorkIdentityInspector.tsx"),
  ]);
  const visibleTabs = model.slice(model.indexOf("export const workspaceTabs"), model.indexOf("export const workspaceSurfaceIds"));
  assert.match(visibleTabs, /label: "Data & graph"/);
  assert.match(visibleTabs, /label: "Playground"/);
  assert.doesNotMatch(visibleTabs, /id: "apps"|id: "graph"|id: "team"/);
  assert.match(workspace, /function ProjectDataWorkspace/);
  assert.match(workspace, /Search files, tables, PDFs, variables, evidence, connectors, and graph entities/);
  assert.match(workspace, /data-action-id="data-graph\.mode\.sources"/);
  assert.match(workspace, /data-action-id="data-graph\.mode\.graph"/);
  assert.match(workspace, /data-action-id=\{`data-query\.graph\.\$\{node\.id\}`\}/);
  assert.match(workspace, /const connectorTemplateHits = connectorTemplates\.filter/);
  assert.match(workspace, /hitCount = datasetHits\.length \+ previewHits\.length \+ documentHits\.length \+ connectorTemplateHits\.length/);
  assert.match(workspace, /kind: "Excel workbook" \| "PDF" \| "CSV" \| "SQL table" \| "JSON"/);
  assert.match(workspace, /data-action-id=\{`data-query\.document\.\$\{document\.id\}`\}/);
  assert.match(workspace, /data-action-id=\{`data-query\.connector-template\.\$\{template\.id\}`\}/);
  assert.match(shell, /visibleMountedApps/);
  assert.match(shell, /hiddenMountedAppCount/);
  assert.match(shell, /selection=\{identitySelection\}/);
  assert.match(inspector, /export type WorkIdentitySelection = \{ kind: "agent" \| "member"/);
  assert.match(inspector, /directlyAttributedActivities/);
  assert.match(inspector, /Exactly attributed events/);
  assert.match(inspector, /session context, not ownership/);
  assert.match(inspector, /Only named actor events are attributed/);
  assert.doesNotMatch(inspector, /identity-kind-tabs|identity-directory|identity\.select|onSelect:/);
  assert.match(inspector, /const personName = agent\?\.name \?\? member!\.collaborator\.name/);
  assert.match(shell, /\{activeProjectAgents\.map\(\(agent\) => <button/);
  assert.doesNotMatch(shell, /context\.agents\.more|context\.team\.more/);
  assert.match(workspace, /className="playground-runner-bar"/);
  assert.match(workspace, /aria-label="Select Playground agent"/);
  assert.doesNotMatch(inspector, /session\.id === sessions\[0\]\?\.id/);
});

test("project navigation keeps route context, closes transient chrome, and reveals selected ancestry", async () => {
  const [shell, workspace, studios] = await Promise.all([
    read("../app/PlatformShell.tsx"),
    read("../app/ProjectWorkspace.tsx"),
    read("../app/ProjectAppStudios.tsx"),
  ]);
  const openProject = shell.slice(shell.indexOf("const openProject ="), shell.indexOf("const openMountedProjectApp ="));
  const startOnboarding = shell.slice(shell.indexOf("const startOnboarding ="), shell.indexOf("const saveClientDraft ="));
  const popState = shell.slice(shell.indexOf("const onPopState ="), shell.indexOf("window.addEventListener(\"popstate\""));

  assert.match(openProject, /projectPathKeys\(project, projectPathMode\)/);
  assert.match(openProject, /setCollapsedSidebarRoots/);
  assert.match(openProject, /setCollapsedSidebarBranches/);
  assert.match(openProject, /setExpandedSidebarRoots/);
  assert.match(openProject, /setExpandedSidebarBranches/);
  assert.match(openProject, /setProjectNavQuery\(""\)/);
  assert.match(openProject, /setMobileOpen\(false\)/);
  assert.match(openProject, /setNotificationsOpen\(false\)/);
  assert.doesNotMatch(startOnboarding, /openWorkspaceHome/);
  assert.match(popState, /setOnboardingMode\(null\)/);
  assert.match(popState, /projectCatalog\.find\(\(project\) => project\.id === navigation\.projectId\)/);
  assert.match(popState, /projectPathKeys\(restoredProject, projectPathMode\)/);
  assert.match(popState, /setProjectNavQuery\(""\)/);
  assert.match(shell, /type MayaHistoryState = \{ mayaReturn\?: \{ surface: "project"; projectId: string; tab: WorkspaceTabId \} \}/);
  assert.match(shell, /const projectSurfaceTransition = \(\) =>/);
  assert.match(shell, /replace: alreadyOnProjectSurface/);
  assert.match(shell, /const returnFromProjectApp = \(\) =>/);
  assert.match(shell, /window\.history\.back\(\)/);
  assert.match(shell, /openProjectTab\(historyState\?\.mayaReturn\?\.tab \?\? activeProjectTab, true\)/);
  assert.doesNotMatch(shell, /onCloseStudio=/);
  assert.match(shell, /data-action-id="context\.back-to-project" className="context-back-button"[^>]*onClick=\{returnFromProjectApp\}/);
  assert.doesNotMatch(studios, /studio\.back-to-apps|studio\.unsupported\.back|onBack/);
  assert.doesNotMatch(workspace, /workspace\.open-governed-decision|workspace\.ask-expert-society|className="project-thesis"/);
});

test("session continuation and application assumptions expose truthful controls", async () => {
  const source = await read("../app/ProjectWorkspace.tsx");
  assert.match(source, />Continue as new session</);
  assert.match(source, /runState === "Running" \? "Trace running"/);
  assert.match(source, /input\.kind === "choice"[\s\S]*?<select[\s\S]*?input\.options\?\.map/);
  assert.match(source, /<input aria-invalid=\{Boolean\(inputErrors\[input\.key\]\)\} type=\{input\.kind === "number" \? "number" : "text"\} min=\{input\.min\} max=\{input\.max\} step=\{input\.step\}/);
  assert.match(source, /event\.key === "Enter" && !event\.shiftKey && !event\.nativeEvent\.isComposing/);
  assert.match(source, /disabled=\{!selectedSession\}[^>]*onClick=\{onAdvance\}/);
  assert.match(source, /Playground run blocked[\s\S]*?Complete Data & graph mapping/);
  assert.match(source, /const replayPrompt = selectedWorkSession\.agentTrace\?\.prompt \?\? selectedWorkSession\.objective/);
  assert.match(source, /storedRunId = preferredAppId \? activityState\.selectedRunByProjectApp/);
  assert.match(source, /setArtifactReceipt\(referencedInputReceipt\(input\.evidenceRef!\)\)/);
  assert.doesNotMatch(source, /setRunState|setTraceIndex|setActivePrompt|setSteeringInstructions|setChatMessages/);
});

test("dialogs trap focus, close with Escape, restore focus, and isolate their background", async () => {
  const [lifecycle, onboarding, workspace, shell] = await Promise.all([
    read("../app/useDialogLifecycle.ts"),
    read("../app/WorkspaceOnboarding.tsx"),
    read("../app/ProjectWorkspace.tsx"),
    read("../app/PlatformShell.tsx"),
  ]);
  assert.match(lifecycle, /event\.key === "Escape"/);
  assert.match(lifecycle, /event\.key !== "Tab"/);
  assert.match(lifecycle, /element\.inert = true/);
  assert.match(lifecycle, /previousFocus\?\.isConnected/);
  assert.match(onboarding, /useDialogLifecycle<HTMLFormElement>\(open, onClose\)/);
  assert.match(workspace, /useDialogLifecycle<HTMLElement>\(true, onClose\)/);
  assert.match(shell, /useDialogLifecycle<HTMLElement>\(searchOpen/);
  assert.match(shell, /useDialogLifecycle<HTMLElement>\(Boolean\(outcome\)/);
  for (const source of [onboarding, workspace, shell]) assert.match(source, /data-modal-root/);
});
