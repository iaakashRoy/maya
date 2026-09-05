import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Workspace as the project-first root", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Maya Workspace/);
  assert.match(html, /data-action-id="nav\.workspace"[^>]*class="scope-nav active"/);
  assert.match(html, /data-action-id="nav\.operations-world"/);
  assert.match(html, /<h1>Workspace<\/h1>/);
  assert.match(html, /Manage clients, projects, and shared work/);
  assert.match(html, /SECTOR \/ CLIENT \/ PROJECT/);
  assert.match(html, /Clients and projects/);
  assert.match(html, /Onboard client/);
  assert.match(html, /Create project/);
  assert.match(html, /Apex Mobility/);
  assert.match(html, /Anode Shield/);
  assert.match(html, /Helixora Therapeutics/);
  assert.match(html, /Cold Chain Promise/);
  assert.match(html, /class="environment-badge">Synthetic workspace/);
  assert.doesNotMatch(html, /Concept environment/);
  assert.match(html, /og-workspace\.png/);
  assert.match(html, /class="[^"]*__font_geist_/);
  assert.doesNotMatch(html, /project-binding-strip|APPLICATION OPERATING MODEL|Project data and sources|GLOBAL NETWORK RADAR/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("Operations World renders authoritative Global and Regional scopes", async () => {
  const globalResponse = await render("/?view=global&scope=company&sector=mobility-ev&client=apex-mobility&project=anode-shield&projectTab=data");
  assert.equal(globalResponse.status, 200);
  const globalHtml = await globalResponse.text();
  assert.match(globalHtml, /Operations World/);
  assert.match(globalHtml, /<button[^>]*class="active"[^>]*>Global<\/button>/);
  assert.match(globalHtml, /GLOBAL NETWORK RADAR/);
  assert.match(globalHtml, /Natural Earth 1:110m land/);
  assert.match(globalHtml, />Cargo<\/button>/);
  assert.match(globalHtml, /Work using these signals/);
  assert.doesNotMatch(globalHtml, /project-binding-strip|class="workspace-home"/);

  const regionalResponse = await render("/?view=region&scope=global");
  assert.equal(regionalResponse.status, 200);
  const regionalHtml = await regionalResponse.text();
  assert.match(regionalHtml, /Operations World/);
  assert.match(regionalHtml, /<button[^>]*class="active"[^>]*>Regional<\/button>/);
  assert.match(regionalHtml, /REGIONAL NETWORK RADAR/);
  assert.match(regionalHtml, /<select[^>]*aria-label="Region"/);
  assert.match(regionalHtml, />APAC<\/option>/);
  assert.doesNotMatch(regionalHtml, /project-binding-strip|class="workspace-home"/);
});

test("project-only capabilities fail closed to Workspace without a valid project", async () => {
  const routes = [
    "/?view=risk&scope=company",
    "/?view=decisions&scope=company",
    "/?view=agents&scope=company",
    "/?view=graph&scope=company",
    "/?view=action&scope=company",
    "/?view=company&scope=company&projectTab=data",
    "/?view=risk&scope=company&sector=mobility-ev&project=unknown-project",
  ];

  for (const path of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render the fail-closed Workspace`);
    const html = await response.text();
    assert.match(html, /data-action-id="nav\.workspace"[^>]*class="scope-nav active"/);
    assert.match(html, /class="workspace-home"/);
    assert.match(html, /<h1>Workspace<\/h1>/);
    assert.doesNotMatch(html, /project-binding-strip|APPLICATION OPERATING MODEL|Project data and sources/);
    assert.doesNotMatch(html, /typeof window/);
  }
});

test("server-renders the selected sector, client, project, data tab, and specialist studio", async () => {
  const projectResponse = await render("/?view=company&scope=company&sector=life-sciences&client=helixora&project=cold-chain-promise&projectTab=data");
  assert.equal(projectResponse.status, 200);
  const projectHtml = await projectResponse.text();
  assert.match(projectHtml, /class="project-os"/);
  assert.match(projectHtml, /Cold Chain Promise/);
  assert.match(projectHtml, /Helixora Therapeutics/);
  assert.match(projectHtml, /data-action-id="workspace\.tab\.data"[^>]*class="active"/);
  assert.match(projectHtml, /Data &amp; graph/);
  assert.match(projectHtml, /Search files, tables, PDFs, variables, evidence, connectors, and graph entities/);
  assert.match(projectHtml, /filename metadata only/i);
  assert.match(projectHtml, /Source integration requests/);
  assert.match(projectHtml, /Restricted clinical supply/);
  assert.doesNotMatch(projectHtml, /class="workspace-home"/);

  const studioResponse = await render("/?view=company&scope=company&sector=critical-minerals&client=terrametals&project=lithium-cell-provenance&projectTab=apps&projectApp=minerals");
  assert.equal(studioResponse.status, 200);
  const studioHtml = await studioResponse.text();
  assert.match(studioHtml, /class="project-os studio-mode"/);
  assert.match(studioHtml, /Lithium-to-Cell Provenance/);
  assert.match(studioHtml, /TerraMetals Alliance/);
  assert.match(studioHtml, /Mineral Atlas/);
  assert.match(studioHtml, /RESERVE[\s\S]*?REFINERY[\s\S]*?PRODUCT/);
  assert.match(studioHtml, /Runs, reports, and reruns/);
  assert.match(studioHtml, /APP-P007-MA-019/);
});

test("server-renders project-bound Decision and Review deep links", async () => {
  const projectPath = "sector=mobility-ev&client=apex-mobility&project=anode-shield";
  const decisionResponse = await render(`/?view=case&scope=company&case=CASE-1042&${projectPath}`);
  assert.equal(decisionResponse.status, 200);
  const decisionHtml = await decisionResponse.text();
  assert.match(decisionHtml, /class="project-context-bar"/);
  assert.match(decisionHtml, /Apex Mobility(?:<!-- -->)? \/ (?:<!-- -->)?Anode Shield/);
  assert.match(decisionHtml, /DECISION[\s\S]{0,80}CASE-1042/);
  assert.match(decisionHtml, /Secure alternate graphite volume/);
  assert.match(decisionHtml, /What each application contributes/);
  assert.match(decisionHtml, /Balanced response/);
  assert.match(decisionHtml, /Review decision/);
  assert.doesNotMatch(decisionHtml, />Case Workspace<|>Action Room</);

  const reviewResponse = await render(`/?view=action&scope=company&case=CASE-1042&${projectPath}`);
  assert.equal(reviewResponse.status, 200);
  const reviewHtml = await reviewResponse.text();
  assert.match(reviewHtml, /class="project-context-bar"/);
  assert.match(reviewHtml, /Apex Mobility(?:<!-- -->)? \/ (?:<!-- -->)?Anode Shield/);
  assert.match(reviewHtml, /CONTROLLED EXECUTION[\s\S]{0,80}CASE-1042/);
  assert.match(reviewHtml, /Decision authority/);
  assert.match(reviewHtml, /Approve recommendation/);
  assert.doesNotMatch(reviewHtml, />Action Room</);
});

test("Review renders an explicit lifecycle gate before approval", async () => {
  const blockedResponse = await render("/?view=action&scope=company&case=CASE-002-01&sector=life-sciences&client=helixora&project=cold-chain-promise");
  assert.equal(blockedResponse.status, 200);
  const blockedHtml = await blockedResponse.text();
  assert.match(blockedHtml, /Cold Chain Promise/);
  assert.match(blockedHtml, /Release gate blocked/);
  assert.match(blockedHtml, /Blocked until the case completes Validate and enters Approve/);
  assert.match(blockedHtml, /Approval unavailable/);

  const readyResponse = await render("/?view=action&scope=company&case=CASE-1042&sector=mobility-ev&client=apex-mobility&project=anode-shield");
  assert.equal(readyResponse.status, 200);
  const readyHtml = await readyResponse.text();
  assert.match(readyHtml, /Ready for the named human approver/);
  assert.match(readyHtml, /Approve and release/);
  assert.match(readyHtml, /Approve recommendation/);
});

test("each decision app exposes a project-bound, decision-specific operating model", async () => {
  const applicationRoutes = [
    ["risk", "Risk Radar", /Dependencies and exposure/, /CRITICAL PROCUREMENT REGISTER/],
    ["optimizer", "Network Optimizer", /Choose the decision shape before choosing an algorithm/, /HANDBOOK TRACE/],
    ["flow", "Flow Lens", /Material and cash flow/, /ORDER-TO-CASH FLOW/],
    ["demand", "Demand Sense", /Demand range and drivers/, /EXPLAINABLE FORECAST/],
    ["suppliers", "Supplier Graph", /Supplier dependency and options/, /N-TIER SUPPLY NETWORK/],
  ];

  for (const [view, name, decisionFocus, distinctiveSurface] of applicationRoutes) {
    const response = await render(`/?view=${view}&scope=company&case=CASE-1042&sector=mobility-ev&client=apex-mobility&project=anode-shield`);
    assert.equal(response.status, 200, `${name} should render`);
    const html = await response.text();
    assert.match(html, /class="project-context-bar"/);
    assert.match(html, /Apex Mobility(?:<!-- -->)? \/ (?:<!-- -->)?Anode Shield/);
    assert.match(html, new RegExp(`data-app-theme="${view}"`));
    assert.match(html, new RegExp(`<h1[^>]*>${name}<\\/h1>`));
    assert.match(html, /ACTIVE DECISION/);
    assert.match(html, /Open decision/);
    assert.match(html, />Review/);
    assert.match(html, /Runs, reports, and reruns/);
    assert.match(html, /from[\s\S]{0,120}SES-P001-024/);
    assert.match(html, decisionFocus);
    assert.match(html, distinctiveSurface);
    assert.match(html, /SYNTHETIC/i);
    assert.doesNotMatch(html, /class="workspace-home"/);
  }
});

test("Decisions, apps, Data & graph, and Playground resolve inside the selected project", async () => {
  const projectPath = "scope=company&sector=life-sciences&client=helixora&project=cold-chain-promise";
  const routes = [
    [`/?view=decisions&${projectPath}`, "Branch, challenge, and merge"],
    [`/?view=company&projectTab=apps&${projectPath}`, "Project applications"],
    [`/?view=company&projectTab=data&${projectPath}`, "Data &amp; graph"],
    [`/?view=graph&${projectPath}`, "AGENT TRAVERSAL"],
    [`/?view=agents&${projectPath}`, "SESSIONS"],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
    const html = await response.text();
    assert.match(html, /class="project-os"/);
    assert.match(html, /<h1>Cold Chain Promise<\/h1>/);
    assert.match(html, /Helixora Therapeutics/);
    assert.ok(html.includes(expected), `${path} should render ${expected}`);
    if (path.includes("view=agents")) {
      assert.match(html, /SES-P002-024/);
      assert.match(html, /MSG-P002-024-001/);
      assert.match(html, /Continue as new session/);
      assert.match(html, /Ready to chat/);
      assert.match(html, /id="project-agent-prompt"/);
      assert.match(html, /data-action-id="agents\.send-prompt"/);
    }
    if (path.includes("projectTab=data")) {
      assert.match(html, /class="dataset-card"/);
      assert.doesNotMatch(html, /<table/);
    }
    assert.doesNotMatch(html, /class="workspace-home"/);
  }

  const legacyTeamResponse = await render(`/?view=company&projectTab=team&${projectPath}`);
  assert.equal(legacyTeamResponse.status, 200);
  const legacyTeamHtml = await legacyTeamResponse.text();
  assert.match(legacyTeamHtml, /Knowledge footprint/);
  assert.doesNotMatch(legacyTeamHtml, /Client and Kearney access/);
});

test("ships the two-root IA, onboarding, project accountability, ten apps, and wrapped project tabs", async () => {
  const [page, shell, navigation, workspaceHome, onboarding, projectWorkspace, workspaceModel, applications, decisionWorkspaces, workIdentityInspector, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PlatformShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/WorkspaceHome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WorkspaceOnboarding.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ProjectWorkspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/workspace-model.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ApplicationViews.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DecisionWorkspaces.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WorkIdentityInspector.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  const source = [page, shell, navigation, workspaceHome, onboarding, projectWorkspace, workspaceModel, applications, decisionWorkspaces, workIdentityInspector].join("\n");

  for (const moduleName of [
    "Workspace",
    "Operations World",
    "Decisions",
    "Decision",
    "Review",
    "Risk Radar",
    "Network Optimizer",
    "Flow Lens",
    "Demand Sense",
    "Supplier Graph",
    "Mineral Atlas",
    "Workforce Studio",
    "Manufacturing Twin",
    "Logistics Radar",
    "Quality Genealogy",
    "Data & graph",
    "Playground",
    "Agent accountability",
    "Team accountability",
  ]) {
    assert.match(source, new RegExp(moduleName, "i"));
  }

  assert.match(shell, /<WorkspaceHome/);
  assert.match(shell, /<WorkspaceOnboarding/);
  assert.match(shell, /createSessionProjectMemberships/);
  assert.match(shell, /setMembershipCatalog/);
  assert.match(shell, /isProjectCapability && \(scope !== "company" \|\| !resolvedProject\)/);
  assert.match(shell, /hasProjectDecision = Boolean\(resolvedProject && activeProject\.counts\.decisions > 0\)/);
  assert.match(shell, /projectCase = scope === "company" && resolvedProject && hasProjectDecision/);
  assert.match(shell, /if \(!hasProjectDecision \|\| !projectCase\)/);
  assert.match(shell, /No case was synthesized or opened/);
  assert.match(shell, /if \(nextScope !== "company"\) \{[\s\S]*?setActiveProjectId\(""\)/);
  assert.match(navigation, /view: "company" as const,[\s\S]*?scope: "company" as const,[\s\S]*?projectId: ""/);
  assert.match(navigation, /Operations World is authoritative/);
  assert.match(workspaceHome, /Project tools, data, and decisions open within a selected project/);
  assert.match(onboarding, /SESSION DRAFT/);
  assert.match(onboarding, /No database, dataset, decision case, access grant, app deployment, connector, agent, or solver run is provisioned/);
  assert.match(workspaceModel, /origin: "Browser-session draft"/);
  assert.match(workspaceModel, /counts: \{ entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 0, agents: 0, experts: 2 \}/);
  assert.match(workspaceModel, /createSessionProjectMemberships/);
  assert.match(workspaceModel, /Access fails closed and no project resource is opened or changed/);
  assert.match(projectWorkspace, /aria-label="Project workspace sections"/);

  const wrappingRules = css.slice(css.indexOf("Project tabs and every tab-like control wrap"));
  assert.ok(wrappingRules.length < css.length, "the final no-horizontal-tabs override should exist");
  assert.match(wrappingRules, /\.project-tabs\s*\{[\s\S]*?display:\s*grid;[\s\S]*?overflow:\s*visible;/);
  assert.match(wrappingRules, /\.project-tabs button\s*\{[\s\S]*?white-space:\s*normal;/);
  assert.match(wrappingRules, /\.decision-controls,[\s\S]*?\.agent-steering-bar,[\s\S]*?overflow-x:\s*visible\s*!important;/);
  assert.match(wrappingRules, /@media \(max-width: 980px\)[\s\S]*?\.project-tabs \{ grid-template-columns: repeat\(4, minmax\(0, 1fr\)\); \}/);
  assert.match(wrappingRules, /@media \(max-width: 760px\)[\s\S]*?\.project-tabs \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);

  const studioLightRules = css.slice(css.indexOf("Specialist studios use the light workspace shell"));
  assert.ok(studioLightRules.length < css.length, "the specialist light-mode override should exist");
  assert.match(studioLightRules, /\.project-app-studio \{[\s\S]*?color-scheme: light;/);
  assert.match(studioLightRules, /\.studio-header \{[\s\S]*?background: linear-gradient/);
  assert.match(studioLightRules, /\.studio-toolbar > div \{[\s\S]*?flex-wrap: wrap;[\s\S]*?overflow-x: visible;/);

  assert.doesNotMatch(navigation, /Global platform|Regional platform|Company platform|Case Workspace|Action Room/);
  assert.doesNotMatch(source, /SkeletonPreview|react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /site-creator-vinext-starter|react-loading-skeleton/);
});
