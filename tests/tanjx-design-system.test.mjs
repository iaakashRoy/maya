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

  assert.match(layout, /tanjx — Supply Chain Workspace/);
  assert.match(shell, /<BrandMark \/>/);
  assert.match(shell, /<b>tanjx<\/b><small>Supply chain workspace<\/small>/);
  assert.match(shell, /Aakash Roy/);
  assert.match(workspace, /role: "Super Admin"/);
  assert.doesNotMatch(shell, /environment-badge/);
  assert.doesNotMatch(shell, /document\.title\s*=/, "route chrome must not race the server-rendered title during hydration");
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

  for (const appId of ["risk", "optimizer", "flow", "demand", "suppliers", "minerals", "workforce", "manufacturing", "logistics", "quality", "playground"]) {
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
  assert.match(identity, /const sectorVisuals:/);
  assert.match(identity, /const clientVisuals:/);
  assert.match(shell, /<SectorMark sectorId=\{group\.id\}/);
  assert.match(shell, /<ClientMark clientId=\{group\.id\}/);
  for (const icon of ["client-add", "project-add", "workspace", "world"]) {
    assert.match(shell, new RegExp(`NavigationIcon name="${icon}"`));
  }
});

test("light mode gives maps and knowledge graphs a light spatial canvas", async () => {
  const css = await read("../app/globals.css");
  const contract = css.slice(css.lastIndexOf("Light spatial workspaces"));

  assert.match(contract, /\.theme-light \.network-radar \.radar-map\.network-map[\s\S]*?background:\s*#dfeef2\s*!important/);
  assert.match(contract, /\.theme-light \.network-radar \.radar-ocean\s*\{\s*fill:\s*#dfeef2/);
  assert.match(contract, /\.theme-light :is\(\.knowledge-canvas, \.project-knowledge-canvas\)[\s\S]*?background-color:\s*#f7faf7\s*!important/);
  assert.match(contract, /\.theme-light \.project-graph-node,[\s\S]*?\.theme-light \.kg-node[\s\S]*?background:\s*#fff/);
});

test("the workspace uses one type scale, one gutter contract, and neutral dark surfaces", async () => {
  const css = await read("../app/globals.css");
  const contract = css.slice(css.lastIndexOf("tanjx visual system"));

  assert.match(contract, /--workspace-gutter:\s*clamp\(16px, 1\.6vw, 24px\)/);
  assert.match(contract, /\.workspace-home,[\s\S]*?\.scope-dashboard,[\s\S]*?\.application-session-surface,[\s\S]*?\.project-stage\s*\{\s*padding:\s*var\(--workspace-gutter\)\s*!important/);
  assert.match(contract, /--type-xs:\s*11px/);
  assert.match(contract, /--type-base:\s*14px/);
  assert.match(contract, /--type-page:\s*26px/);
  assert.match(contract, /--dark-canvas:\s*#0d0f11/);
  assert.match(contract, /--dark-surface:\s*#171a1d/);
  assert.match(contract, /\.theme-dark :is\(\.workspace-primary-nav, \.sidebar-projects, \.sidebar-path-tree, \.sidebar-path-branches\)/);
  assert.match(contract, /Lime is a focus\/action accent, not a surface color/);
  assert.match(contract, /\.agent-os\s*\{[\s\S]*?background:\s*#f4f6f3\s*!important/);
  assert.match(contract, /\.theme-dark \.agent-os\s*\{[\s\S]*?background:\s*#101214\s*!important/);
});

test("the workspace uses a compact chrome and content density contract", async () => {
  const css = await read("../app/globals.css");
  const density = css.slice(css.lastIndexOf("Compact workspace density"));

  assert.match(css, /--topbar-height:\s*56px/);
  assert.match(css, /--project-app-row-height:\s*48px/);
  assert.match(css, /--project-people-row-height:\s*38px/);
  assert.match(css, /--statusbar-height:\s*24px/);
  assert.match(density, /\.context-mounted-apps\s*\{\s*height:\s*40px/);
  assert.match(density, /\.context-identity-tools\s*\{\s*height:\s*34px/);
  assert.match(density, /\.project-tabs button\s*\{\s*min-height:\s*34px/);
  assert.match(density, /\.application-container \.app-canonical-header,[\s\S]*?min-height:\s*68px/);
  assert.match(density, /\.sidebar-project-leaves \.sidebar-project\s*\{\s*min-height:\s*56px/);
  assert.match(density, /@media \(max-width:\s*1180px\) and \(min-width:\s*761px\)[\s\S]*?--project-people-row-height:\s*66px/);
});
