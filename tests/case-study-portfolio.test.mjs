import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { linkedCaseStudyUrl, loadLinkedWorkspaceModel } from "./source-model-loader.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("the canonical portfolio contains ten complete public-context simulations", async () => {
  const model = await import(await linkedCaseStudyUrl());
  const companies = ["Apple", "Coca-Cola", "Gucci", "Tata Motors", "Tesla", "BYD", "Hershey", "TSMC", "Airbus", "Pfizer"];

  assert.equal(model.caseStudyProfiles.length, 10);
  assert.equal(model.caseStudyProjects.length, 10);
  assert.deepEqual(model.caseStudyProfiles.map((profile) => profile.company), companies);

  for (const profile of model.caseStudyProfiles) {
    assert.equal(profile.datasets.length, 6, `${profile.company} data products`);
    assert.ok(profile.apps.length >= 8, `${profile.company} mounted applications`);
    assert.ok(profile.methods.length >= 5, `${profile.company} method stack`);
    assert.ok(profile.hardConstraints.length >= 4, `${profile.company} hard constraints`);
    assert.ok(profile.timeline.length >= 5, `${profile.company} activity trail`);
    assert.equal(profile.supplyChain.stages.length, 8, `${profile.company} multilevel chain`);
    assert.equal(profile.supplyChain.nodes.length, 199, `${profile.company} operating, ecosystem, table, and variable entities`);
    assert.equal(profile.supplyChain.edges.length, 349, `${profile.company} typed operational and analytical dependencies`);
    assert.equal(profile.supplyChain.checkpoints.length, 16, `${profile.company} checkpoint register`);
    assert.equal(profile.supplyChain.signals.length, 16, `${profile.company} realtime-style signals`);
    assert.equal(profile.supplyChain.nodes.filter((node) => node.assetType === "Table").length, 6, `${profile.company} governed tables in graph`);
    assert.equal(profile.supplyChain.nodes.filter((node) => node.assetType === "Variable").length, 24, `${profile.company} statistical variables in graph`);
    const nodeIds = new Set(profile.supplyChain.nodes.map((node) => node.id));
    const stageIds = new Set(profile.supplyChain.stages.map((stage) => stage.id));
    for (const node of profile.supplyChain.nodes) {
      assert.ok(node.tier === "Hub" || stageIds.has(node.stageId), `${profile.company} node stage reference`);
      assert.match(node.evidenceRef, /^P-\d{3}-EV-(?:NET|X|TABLE|VAR)-/);
    }
    for (const edge of profile.supplyChain.edges) {
      assert.ok(nodeIds.has(edge.from), `${profile.company} edge source reference`);
      assert.ok(nodeIds.has(edge.to), `${profile.company} edge target reference`);
    }
    assert.match(profile.publicSource.url, /^https:\/\//);
    assert.notEqual(profile.baseline, profile.resilient);
  }
  const fingerprints = model.caseStudyProfiles.map((profile) => JSON.stringify({ datasets: profile.datasets, stages: profile.supplyChain.stages, core: profile.supplyChain.nodes.filter((node) => node.tier !== "Sub-tier").map((node) => [node.label, node.country, node.capacity, node.riskScore]) }));
  assert.equal(new Set(fingerprints).size, 10, "every client and project has a distinct data and network fingerprint");
});

test("global and project relationships, statistical analysis, and full-table query surfaces are wired", async () => {
  const [scope, globalGraph, projectGraph, studios, statistics, tablePage] = await Promise.all([
    read("../app/ScopeDashboard.tsx"),
    read("../app/GlobalKnowledgeGraph.tsx"),
    read("../app/ProjectSupplyChainExplorer.tsx"),
    read("../app/ProjectAppStudios.tsx"),
    read("../app/statistical-model.ts"),
    read("../app/table/TableExplorerClient.tsx"),
  ]);
  assert.match(scope, /GlobalKnowledgeGraph/);
  assert.match(scope, /Global knowledge graph/);
  assert.match(globalGraph, /GLOBAL NETWORK OPTIMIZER/);
  assert.match(globalGraph, /crossClient/);
  assert.match(globalGraph, /global-graph-modes/);
  assert.match(globalGraph, /Graph mode/);
  assert.match(globalGraph, /Chokepoints/);
  assert.match(globalGraph, /colorMode/);
  assert.match(globalGraph, /sizeMode/);
  assert.match(globalGraph, /onPointerMove/);
  assert.match(globalGraph, /onDoubleClick/);
  assert.match(globalGraph, /const edgeAt/);
  assert.match(globalGraph, /selectedEdgeId/);
  assert.match(globalGraph, /RELATIONSHIP/);
  assert.match(globalGraph, /Volume \/ value/);
  assert.match(globalGraph, /Dependency share/);
  assert.match(globalGraph, /global-graph-tooltip/);
  assert.match(globalGraph, /ResizeObserver/);
  assert.match(globalGraph, /sectorSpan/);
  assert.doesNotMatch(globalGraph, /clusterCenters/);
  assert.match(projectGraph, /selectedEdgeId/);
  assert.match(projectGraph, /supply-network\.edge\.\$\{edge\.id\}/);
  assert.match(projectGraph, /SELECTED RELATIONSHIP/);
  assert.match(projectGraph, /Trace relationship/);
  assert.match(projectGraph, /edgeReceipt/);
  assert.match(studios, /StatisticalStudio/);
  const studio = await read("../app/StatisticalStudio.tsx");
  assert.match(studio, /State transitions/);
  assert.match(studio, /empiricalTransitions\(rows, column.id\)/);
  assert.match(statistics, /statisticalProfilesFor/);
  assert.match(tablePage, /QUERY TABLE/);
  assert.match(tablePage, /target table is unchanged|source table is unchanged/i);
});

test("every case variable follows a selected taxonomy ancestry", async () => {
  const [workspace, taxonomy] = await Promise.all([
    loadLinkedWorkspaceModel(),
    read("../SUPPLY_CHAIN_VARIABLE_TAXONOMY.md"),
  ]);
  const expand = (text, prefix) => {
    const ids = new Set();
    const expression = new RegExp(`${prefix}-(\\d{3})(?:[–-]${prefix}-(\\d{3}))?`, "g");
    for (const match of text.matchAll(expression)) {
      for (let value = Number(match[1]); value <= Number(match[2] ?? match[1]); value += 1) {
        ids.add(`${prefix}-${String(value).padStart(3, "0")}`);
      }
    }
    return ids;
  };
  const rows = (level) => new Map(taxonomy.split(/\r?\n/).filter((line) => line.startsWith(`| ${level}-`)).map((line) => {
    const cells = line.split("|").map((cell) => cell.trim());
    return [cells[1], cells[5]];
  }));
  const l1Rows = rows("L1");
  const l2Rows = rows("L2");
  const invalid = [];

  for (const project of workspace.workspaceProjects) {
    const coveredL0 = new Set(project.variablePack.l1.flatMap((id) => [...expand(l1Rows.get(id) ?? "", "L0")]));
    const coveredL1 = new Set(project.variablePack.l2.flatMap((id) => [...expand(l2Rows.get(id) ?? "", "L1")]));
    for (const id of project.variablePack.l0) if (!coveredL0.has(id)) invalid.push(`${project.code}:${id}:L0`);
    for (const id of project.variablePack.l1) if (!coveredL1.has(id)) invalid.push(`${project.code}:${id}:L1`);
  }

  assert.deepEqual(invalid, []);
});

test("standalone case-study guide is shareable without the application", async () => {
  const deck = await read("../docs/tanjnx-case-studies.html");
  assert.doesNotMatch(deck, /(?:href|src)=["']\/|fetch\(|<script[^>]*\bsrc=|<link[^>]*\brel=["']stylesheet/);
  assert.match(deck, /These are not actual client engagements/);
  assert.match(deck, /not live measurements or verified client outcomes/);
  assert.match(deck, /<style>/);
  const script = deck.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, "slide navigation must be embedded in the shared file");
  const { Script } = await import("node:vm");
  assert.doesNotThrow(() => new Script(script));
  const makeSlide = () => ({ className: "", innerHTML: "", classList: { toggle() {} } });
  const generatedSlides = [];
  const controls = Object.fromEntries(["counter", "progress", "prev", "next", "print"].map((id) => [id, { style: {} }]));
  controls["case-slides"] = { appendChild: (slide) => generatedSlides.push(slide) };
  let keydown;
  let printed = false;
  new Script(script).runInNewContext({
    document: {
      getElementById: (id) => controls[id],
      createElement: makeSlide,
      querySelectorAll: () => [makeSlide(), makeSlide(), makeSlide(), ...generatedSlides, makeSlide()],
    },
    scrollTo() {},
    window: { print: () => { printed = true; } },
    addEventListener: (name, callback) => { if (name === "keydown") keydown = callback; },
  });
  assert.equal(generatedSlides.length, 10);
  assert.equal(controls.counter.textContent, "01 / 14");
  controls.next.onclick();
  assert.equal(controls.counter.textContent, "02 / 14");
  controls.prev.onclick();
  assert.equal(controls.counter.textContent, "01 / 14");
  keydown({ key: "End", preventDefault() {} });
  assert.equal(controls.counter.textContent, "14 / 14");
  keydown({ key: "Home", preventDefault() {} });
  assert.equal(controls.counter.textContent, "01 / 14");
  controls.print.onclick();
  assert.equal(printed, true);
  assert.match(deck, /ArrowRight/);
  assert.match(deck, /window\.print/);
  assert.match(deck, /GRAPH \+ CHOKEPOINTS/);
  assert.match(deck, /5,800<\/b> portfolio network records/);
  for (const company of ["Apple", "Coca-Cola", "Gucci", "Tata Motors", "Tesla", "BYD", "Hershey", "TSMC", "Airbus", "Pfizer"]) {
    assert.match(deck, new RegExp(`company:\\s*["']${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
  }
});
