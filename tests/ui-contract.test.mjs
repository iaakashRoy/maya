import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("critical production modules retain their CSS contracts", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /--font-ui:\s*"Geist",\s*"Segoe UI Variable"/);
  assert.match(css, /\.platform-shell\s*\{\s*font-family:\s*var\(--font-ui\)/);
  assert.doesNotMatch(css, /font-family:\s*var\(--font-geist-sans\)/);

  for (const className of [
    "side-rail",
    "scope-nav",
    "network-map",
    "network-radar",
    "radar-cargo",
    "metric-grid",
    "decision-brief",
    "decision-register",
    "case-stage-rail",
    "contribution-grid",
    "scenario-grid",
    "case-context-strip",
    "application-commandbar",
    "network-context-bridge",
    "application-blueprint",
    "blueprint-tabs",
    "workflow-gates",
    "method-grid",
    "data-contracts",
    "control-register",
    "kpi-cards",
    "handoff-register",
    "app-workspace",
    "risk-matrix",
    "optimizer-layout",
    "or-stage-nav",
    "change-register",
    "learning-loop",
    "waterfall-chart",
    "forecast-chart",
    "supplier-network",
    "pipeline-stages",
    "knowledge-canvas",
    "search-dialog",
  ]) {
    assert.match(css, new RegExp(`\\.${className}(?:[\\s,{.:])`), `Missing CSS contract for .${className}`);
  }
});

test("the project-bound social preview is a landscape PNG", async () => {
  const image = await readFile(new URL("../public/og.png", import.meta.url));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  assert.ok(width > height);
  assert.ok(width >= 1200);
  assert.ok(height >= 630);
});
