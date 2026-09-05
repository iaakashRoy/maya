import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/WorkspaceHome.tsx", import.meta.url), "utf8");

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
