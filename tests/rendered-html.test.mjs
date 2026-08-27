import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
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
  assert.match(html, /Data Agent Hub/);
  assert.match(html, /Global.*Region.*Company.*Decision applications/i);
  assert.match(html, /No operational backend/i);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships three platform levels, five apps, and two data workspaces", async () => {
  const [page, applications, dataOperations, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ApplicationViews.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DataOperations.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const moduleName of [
    "Global platform",
    "Regional platform",
    "Company platform",
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
