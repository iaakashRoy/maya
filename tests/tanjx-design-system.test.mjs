import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("tanjx branding replaces the former product and provider labels", async () => {
  const [layout, shell, workspace, activity] = await Promise.all([
    read("../app/layout.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/workspace-model.ts"),
    read("../app/project-activity-model.ts"),
  ]);
  const productSurface = `${layout}\n${shell}\n${workspace}\n${activity}`;

  assert.match(layout, /tanjx — Tangent \+ Exchange/);
  assert.match(shell, /<BrandMark \/>/);
  assert.match(shell, /<b>tanjx<\/b><small>Tangent \+ Exchange<\/small>/);
  assert.doesNotMatch(shell, /environment-badge/);
  assert.doesNotMatch(productSurface, /Maya Workspace|Maya Rao|Kearney/);
});

test("every project app has a semantic icon and agents have stable differentiated colors", async () => {
  const [identity, shell, workspace, decisions, studios, applications, optimizer] = await Promise.all([
    read("../app/VisualIdentity.tsx"),
    read("../app/PlatformShell.tsx"),
    read("../app/ProjectWorkspace.tsx"),
    read("../app/DecisionWorkspaces.tsx"),
    read("../app/ProjectAppStudios.tsx"),
    read("../app/ApplicationViews.tsx"),
    read("../app/OptimizationWorkbench.tsx"),
  ]);

  for (const appId of ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "workforce", "manufacturing", "logistics", "quality"]) {
    assert.match(identity, new RegExp(`\\b${appId}: \\"[^A-Z]{1,2}\\"`), appId);
  }
  assert.match(shell, /<AppGlyph appId=\{appId\}/);
  assert.match(shell, /<IdentityAvatar id=\{agent\.id\}/);
  assert.match(workspace, /<AppGlyph appId=\{app\.id\}/);
  assert.match(decisions, /<AppGlyph appId=\{contribution\.app\}/);
  assert.match(studios, /<AppGlyph appId=\{appId\} className="app-code"/);
  assert.match(applications, /<AppGlyph appId=\{appId\} className="app-code"/);
  assert.match(optimizer, /<AppGlyph appId="optimizer" className="app-code optimizer-hero-code"/);
  assert.match(identity, /identityPalette = \[/);
  assert.match(identity, /data-identity-color=\{identityColorFor\(id\)\}/);
});

test("the workspace uses one type scale, one gutter contract, and neutral dark surfaces", async () => {
  const css = await read("../app/globals.css");
  const contract = css.slice(css.lastIndexOf("tanjx visual system"));

  assert.match(contract, /--workspace-gutter:\s*clamp\(18px, 2vw, 28px\)/);
  assert.match(contract, /\.workspace-home,[\s\S]*?\.scope-dashboard,[\s\S]*?\.application-session-surface,[\s\S]*?\.project-stage\s*\{\s*padding:\s*var\(--workspace-gutter\)\s*!important/);
  assert.match(contract, /--type-xs:\s*11px/);
  assert.match(contract, /--type-base:\s*14px/);
  assert.match(contract, /--type-page:\s*26px/);
  assert.match(contract, /--dark-canvas:\s*#0d0f11/);
  assert.match(contract, /--dark-surface:\s*#171a1d/);
  assert.match(contract, /\.theme-dark :is\(\.workspace-primary-nav, \.sidebar-projects, \.sidebar-path-tree, \.sidebar-path-branches\)/);
  assert.match(contract, /Lime is a focus\/action accent, not a surface color/);
});
