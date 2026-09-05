import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const source = await read("../app/WorkspaceHome.tsx");
const asModuleUrl = (moduleSource) => `data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`;
const transpile = (moduleSource) => ts.transpileModule(moduleSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function loadPortfolioFixture() {
  const [portfolioSource, workspaceSource] = await Promise.all([
    read("../app/workspace-portfolio-model.ts"),
    read("../app/workspace-model.ts"),
  ]);
  const [portfolio, workspace] = await Promise.all([
    import(asModuleUrl(transpile(portfolioSource))),
    import(asModuleUrl(transpile(workspaceSource))),
  ]);
  return { portfolio, workspace };
}

test("workspace home exposes the root portfolio integration contract", () => {
  for (const prop of [
    "projects",
    "clients",
    "collaborators",
    "onOpenProject",
    "onOnboardClient",
    "onCreateProject",
    "onOpenOperationsWorld",
  ]) {
    assert.match(source, new RegExp(`\\b${prop}\\b`), `missing ${prop}`);
  }

  assert.match(source, /<h1>Workspace<\/h1>/);
  assert.match(source, /<h2 id="portfolio-heading">Clients and projects<\/h2>/);
  assert.match(source, /<h2 id="collaboration-heading">Review queue<\/h2>/);
  assert.doesNotMatch(source, /Every engagement, in one governed place\.|Delivery portfolio|Collaboration queue/);
  assert.match(source, /Project tools, data, and decisions open within a selected project\./);
  assert.match(source, /this surface sends no messages or invitations/i);
});

test("workspace home keeps project capabilities behind the project callback", () => {
  assert.doesNotMatch(source, /onOpen(?:App|Data|Decision|Agent|Graph)/);
  assert.doesNotMatch(source, /from "\.\/(?:ApplicationViews|DataOperations|DecisionWorkspaces|ProjectAppStudios)"/);
  assert.match(source, /onClick=\{\(\) => onOpenProject\(project\)\}/);
  assert.match(source, /data-action-id=\{`workspace\.home\.open-project\.\$\{project\.id\}`\}/);
});

test("workspace home transpiles as an isolated client component", () => {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
    fileName: "WorkspaceHome.tsx",
    reportDiagnostics: true,
  });

  const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors, []);
  assert.match(result.outputText, /workspace-home/);
});

test("workspace portfolio derives tower clients from projects without duplicate or misplaced leaves", async () => {
  const { portfolio, workspace } = await loadPortfolioFixture();
  const towers = portfolio.buildWorkspacePortfolio(workspace.workspaceProjects, workspace.workspaceClients);
  const leaves = towers.flatMap((tower) => tower.clients.flatMap((client) => client.projects));

  assert.equal(leaves.length, workspace.workspaceProjects.length);
  assert.equal(new Set(leaves.map((project) => project.id)).size, workspace.workspaceProjects.length);

  for (const project of workspace.workspaceProjects) {
    const placements = towers.flatMap((tower) => tower.clients.flatMap((client) =>
      client.projects.filter((candidate) => candidate.id === project.id).map(() => ({ tower, client })),
    ));
    assert.equal(placements.length, 1, `${project.code} must have exactly one portfolio leaf`);
    assert.equal(placements[0].tower.id, project.sectorId, `${project.code} appeared under the wrong tower`);
    assert.equal(placements[0].client.id, project.clientId, `${project.code} appeared under the wrong client`);
  }

  const criticalMinerals = towers.find((tower) => tower.id === "critical-minerals");
  const mobility = towers.find((tower) => tower.id === "mobility-ev");
  assert.ok(criticalMinerals);
  assert.ok(mobility);
  const criticalApex = criticalMinerals.clients.find((client) => client.id === "apex-mobility");
  const mobilityApex = mobility.clients.find((client) => client.id === "apex-mobility");
  assert.ok(criticalApex);
  assert.ok(mobilityApex);
  assert.deepEqual(criticalApex.projects.map((project) => project.code), ["P-011"]);
  assert.deepEqual(mobilityApex.projects.map((project) => project.code), ["P-001"]);
  assert.equal(new Set(towers.flatMap((tower) => tower.clients.map((client) => client.id))).size, 10);
});
