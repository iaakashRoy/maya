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
    assert.match(profile.publicSource.url, /^https:\/\//);
    assert.notEqual(profile.baseline, profile.resilient);
  }
});

test("every case variable follows a selected taxonomy ancestry", async () => {
  const [workspace, taxonomy] = await Promise.all([
    loadLinkedWorkspaceModel(),
    read("../../SUPPLY_CHAIN_VARIABLE_TAXONOMY.md"),
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

test("embedded and standalone case-study guides expose project-deep links and simulation boundaries", async () => {
  const [page, deck] = await Promise.all([
    read("../app/case-studies/page.tsx"),
    read("../public/tanjx-case-studies.html"),
  ]);
  assert.match(page, /simulationDisclaimer/);
  assert.match(page, /projectTab=agents/);
  assert.match(page, /projectTab=decisions/);
  assert.match(page, /projectTab=data/);
  assert.match(deck, /ArrowRight/);
  assert.match(deck, /window\.print/);
  for (const company of ["Apple", "Coca-Cola", "Gucci", "Tata Motors", "Tesla", "BYD", "Hershey", "TSMC", "Airbus", "Pfizer"]) {
    assert.match(deck, new RegExp(`company:\\s*["']${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
  }
});
