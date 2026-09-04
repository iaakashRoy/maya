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

test("server-renders the connected Resilience OS platform", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Resilience OS/);
  assert.match(html, /Global platform/);
  assert.match(html, /See the whole network/);
  assert.match(html, /RiskRadar/);
  assert.match(html, /Decision Inbox/);
  assert.match(html, /Action Room/);
  assert.match(html, /Data Agent Hub/);
  assert.match(html, /Scope dashboards.*Decision Inbox.*Case Workspace.*Action Room/i);
  assert.match(html, /No operational backend/i);
  assert.match(html, /og\.png/);
  assert.match(html, /class="[^"]*__font_geist_/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("server and client receive the same deep-linked navigation state", async () => {
  const response = await render("/?view=risk&scope=company");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<div class="breadcrumb"><span>Resilience OS<\/span><i>\/<\/i><b>RiskRadar<\/b>/);
  assert.match(html, /<option value="company" selected="">Apex Mobility<\/option>/);
  assert.match(html, /class="app-nav active"[^>]*><span>RR<\/span><div><b>RiskRadar<\/b>/);
  assert.doesNotMatch(html, /typeof window/);
});

test("server-renders persistent decision case and action-room deep links", async () => {
  const caseResponse = await render("/?view=case&scope=company&case=CASE-1042");
  assert.equal(caseResponse.status, 200);
  const caseHtml = await caseResponse.text();
  assert.match(caseHtml, /<div class="breadcrumb"><span>Resilience OS<\/span><i>\/<\/i><b>Case Workspace<\/b>/);
  assert.match(caseHtml, /CASE-1042/);
  assert.match(caseHtml, /Secure alternate graphite volume/);
  assert.match(caseHtml, /What each application contributes/);
  assert.match(caseHtml, /Balanced response/);
  assert.match(caseHtml, /<option value="company" selected="">Apex Mobility<\/option>/);

  const actionResponse = await render("/?view=action&scope=global&case=CASE-1042");
  assert.equal(actionResponse.status, 200);
  const actionHtml = await actionResponse.text();
  assert.match(actionHtml, /Action Room/);
  assert.match(actionHtml, /Decision authority/);
  assert.match(actionHtml, /Approve recommendation/);
  assert.match(actionHtml, /<option value="company" selected="">Apex Mobility<\/option>/);
});

test("every application exposes a decision-specific operating model", async () => {
  const applicationRoutes = [
    ["risk", "RiskRadar", /Which emerging dependency can stop customer commitments/],
    ["optimizer", "Network Optimizer", /What combination of sourcing, production, inventory, logistics/],
    ["flow", "FlowLens", /Where is cash or margin trapped in the physical network/],
    ["demand", "DemandSense", /What is the credible demand range/],
    ["suppliers", "SupplierGraph", /Which supplier capability, ownership, site, or sub-tier dependency matters/],
    ["agents", "Data Agent Hub", /Is the evidence feeding each decision app current, complete, permitted/],
    ["graph", "Operational Knowledge Graph", /What entities and relationships explain this operational condition/],
  ];

  for (const [view, name, decisionQuestion] of applicationRoutes) {
    const response = await render(`/?view=${view}&scope=company&case=CASE-1042`);
    assert.equal(response.status, 200, `${name} should render`);
    const html = await response.text();
    assert.match(html, new RegExp(`How[\\s\\S]*?${name}[\\s\\S]*?turns evidence into action`));
    assert.match(html, /APPLICATION OPERATING MODEL/);
    assert.match(html, /THE DECISION THIS APP EXISTS TO IMPROVE/);
    assert.match(html, decisionQuestion);
    assert.match(html, /workflow gates/);
    assert.match(html, /data contracts/);
  }
});

test("ships three platform levels, three workflow surfaces, five apps, and two data workspaces", async () => {
  const [page, applications, dataOperations, packageJson] = await Promise.all([
    Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/PlatformShell.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/navigation.ts", import.meta.url), "utf8"),
    ]).then((files) => files.join("\n")),
    readFile(new URL("../app/ApplicationViews.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DataOperations.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const moduleName of [
    "Global platform",
    "Regional platform",
    "Company platform",
    "Decision Inbox",
    "Case Workspace",
    "Action Room",
    "RiskRadar",
    "Network Optimizer",
    "FlowLens",
    "DemandSense",
    "SupplierGraph",
    "Data Agent Hub",
    "Knowledge Graph",
  ]) {
    assert.match(`${page}\n${applications}\n${dataOperations}`, new RegExp(moduleName, "i"));
  }
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /site-creator-vinext-starter|react-loading-skeleton/);
});
