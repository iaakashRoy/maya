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

test("server-renders the Resilience OS clickflow", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Resilience OS/);
  assert.match(html, /Good morning, Maya/);
  assert.match(html, /DEMO WORKSPACE/);
  assert.match(html, /Graphite continuity response/);
  assert.match(html, /Signals that matter now/);
  assert.match(html, /No operational backend/i);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the complete concept navigation and no starter preview", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const moduleName of [
    "Command",
    "Radar",
    "Decision Cases",
    "Decision Twin",
    "Optimizer",
    "Product DNA",
    "Flow Graph",
    "Trust",
    "Data Fabric",
    "Services",
  ]) {
    assert.match(page, new RegExp(moduleName, "i"));
  }
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /site-creator-vinext-starter|react-loading-skeleton/);
});
