import assert from "node:assert/strict";
import test from "node:test";
import { asModuleUrl, transpileSource, readSource, linkedWorkspaceUrl, loadLinkedWorkspaceModel } from "./source-model-loader.mjs";

const model = await import(asModuleUrl(transpileSource(await readSource("../app/consumer-insights-model.ts"))));
const base = model.makeAnalysis("project-a", model.defaultConfig, "analysis-a", "2026-09-14T06:30:00Z");

test("consumer fixtures conserve mentions, sentiment, review subsets, and intensity totals", () => {
  for (const product of model.products) {
    const metric = model.summarize(model.observationsFor(base, product.id));
    assert.equal(metric.mentions, product.mentions);
    assert.equal(metric.reviews, product.reviews);
    assert.equal(metric.positive, Math.round(product.mentions * product.positive));
    assert.equal(metric.neutral, Math.round(product.mentions * product.neutral));
    assert.equal(metric.positive + metric.neutral + metric.negative, metric.mentions);
    assert.equal(metric.ratings.reduce((a, b) => a + b, 0), metric.mentions);
  }
  assert.equal(model.summarize(model.observationsFor(base)).score.toFixed(1), "68.0");
  for (const row of model.demoObservations()) {
    assert.ok(row.mentions >= row.reviews && row.reviews >= 0);
    assert.equal(row.mentions, row.positive + row.neutral + row.negative);
    assert.ok(row.ratings.every(value => Number.isInteger(value) && value >= 0));
    assert.ok(row.date >= "2026-06-17" && row.date <= model.SNAPSHOT);
  }
});

test("source, market and period filters partition the same dataset used by charts", () => {
  const all = model.observationsFor(base);
  assert.equal(model.sources.reduce((sum, s) => sum + model.summarize(model.observationsFor(base, "complan", s.id)).mentions, 0), 18420);
  const metros = model.observationsFor({ ...base, config: { ...base.config, market: "Metro India" } });
  const tierTwo = model.observationsFor({ ...base, config: { ...base.config, market: "Tier 2 India" } });
  assert.equal(model.summarize(metros).mentions + model.summarize(tierTwo).mentions, 18420);
  for (const source of model.sources) {
    assert.ok(metros.some(row => row.sourceId === source.id));
    assert.ok(tierTwo.some(row => row.sourceId === source.id));
  }
  const month = model.observationsFor({ ...base, config: { ...base.config, days: 30 } });
  assert.ok(month.length < all.length && month.every(row => row.day >= 60));
  assert.equal(model.trendFor(month).reduce((sum, week) => sum + week.mentions, 0), model.summarize(month).mentions);
  assert.equal(model.topicSummaries(month).reduce((sum, topic) => sum + topic.mentions, 0), model.summarize(month).mentions);
  assert.ok(Math.abs(model.topicSummaries(month).reduce((sum, topic) => sum + topic.importance, 0) - 100) < 1e-8);
});

test("simulated collection adds only the selected product, source and market batches", () => {
  const collected = model.makeAnalysis("project-a", { ...model.defaultConfig, mode: "collect", sourceIds: ["reddit"], market: "Tier 2 India", days: 30 }, "new", "2026-09-14T12:00:00Z");
  const rows = model.observationsFor(collected);
  assert.ok(rows.some(row => row.batch === 1));
  assert.ok(rows.every(row => row.productId === "complan" && row.sourceId === "reddit" && row.market === "Tier 2 India" && row.day >= 60));
  assert.ok(model.summarize(rows).mentions > model.summarize(model.observationsFor({ ...collected, collected: false })).mentions);
  assert.ok(model.observationsFor(collected, "ensure").every(row => row.productId === "ensure"));
  assert.equal(model.observationsFor(collected, "complan", "youtube").length, 0);
});

test("analysis setup rejects empty sources, self comparison, duplicates and unsupported scopes", () => {
  for (const patch of [{ sourceIds: [] }, { sourceIds: ["reddit", "reddit"] }, { competitorIds: ["complan"] }, { competitorIds: ["ensure", "ensure"] }, { days: 365 }, { market: "Global" }, { mode: "scrape" }]) {
    assert.ok(model.validateConfig({ ...model.defaultConfig, ...patch }));
    assert.throws(() => model.makeAnalysis("p", { ...model.defaultConfig, ...patch }, "a", "2026-09-14"));
  }
  assert.equal(model.validateConfig({ ...model.defaultConfig, competitorIds: [] }), null);
});

test("new analyses own their configuration arrays and suggested variables", () => {
  const config = { ...model.defaultConfig, sourceIds: ["reddit"], competitorIds: ["ensure"] };
  const created = model.makeAnalysis("p", config, "a", "2026-09-14");
  config.sourceIds.push("youtube"); config.competitorIds.push("horlicks");
  assert.deepEqual(created.config.sourceIds, ["reddit"]);
  assert.deepEqual(created.config.competitorIds, ["ensure"]);
  const expected = model.topicSummaries(model.observationsFor(created)).find(t => t.id === "packaging");
  assert.equal(created.variables.find(v => v.id === "CI-packaging").value, Number((expected.negativePct / 100).toFixed(3)));
});

test("variable acceptance, editing, rejection and eligibility obey the review workflow", () => {
  let variable = base.variables[0];
  assert.equal(model.updateVariable(variable, { usable: true }).usable, false);
  variable = model.updateVariable(variable, { status: "Accepted" });
  assert.equal(variable.usable, false);
  variable = model.updateVariable(variable, { usable: true });
  assert.equal(variable.usable, true);
  for (const patch of [{ name: "Reviewed packaging risk" }, { value: .72 }, { type: "Constant Variable" }]) {
    const edited = model.updateVariable(variable, patch);
    assert.equal(edited.status, "Suggested"); assert.equal(edited.usable, false);
  }
  assert.equal(model.updateVariable(variable, { status: "Rejected" }).usable, false);
  for (const patch of [{ name: " " }, { value: -1 }, { value: 1.01 }, { value: NaN }]) assert.throws(() => model.updateVariable(variable, patch));
});

test("handoff exports only accepted and usable variables with project and analysis identity", () => {
  assert.throws(() => model.handoffPackage(base));
  const reviewed = { ...base, variables: base.variables.map((v, i) => i === 0 ? { ...v, status: "Accepted", usable: true } : { ...v, status: "Accepted", usable: false }) };
  const pack = model.handoffPackage(reviewed);
  assert.equal(pack.variables.length, 1);
  assert.equal(pack.projectId, "project-a"); assert.equal(pack.analysisId, "analysis-a");
  assert.match(pack.boundary, /No solver input/);
});

test("browser storage restores reviewed analyses and rejects cross-project or corrupt state", () => {
  const state = model.initialWorkspace("project-a");
  state.analyses[0].variables[0] = { ...state.analyses[0].variables[0], status: "Accepted", usable: true, value: .72 };
  assert.equal(model.restoreWorkspace(JSON.stringify(state), "project-a").analyses[0].variables[0].value, .72);
  assert.equal(model.restoreWorkspace(JSON.stringify(state), "project-b").projectId, "project-b");
  assert.equal(model.restoreWorkspace(JSON.stringify(state), "project-b").analyses[0].variables[0].status, "Suggested");
  for (const raw of ["{bad", "null", JSON.stringify({ ...state, version: 99 }), JSON.stringify({ ...state, analyses: [] })]) assert.equal(model.restoreWorkspace(raw, "project-a").analyses.length, 1);
  state.analyses[0].variables[0].value = Infinity;
  assert.equal(model.restoreWorkspace(JSON.stringify(state), "project-a").analyses[0].variables[0].status, "Suggested");
  assert.notEqual(model.storageKey("project-a"), model.storageKey("project-b"));
});

test("report and CSV exports match the analysis and retain synthetic evidence boundaries", () => {
  const report = model.reportFor(base);
  assert.deepEqual(report.metrics, model.summarize(model.observationsFor(base)));
  assert.equal(report.competitors.length, 3); assert.equal(report.insights.length, 6);
  assert.match(report.boundary, /synthetic/);
  const edited = { ...base, variables: [{ ...base.variables[0], name: '=SUM(1,2) "test"' }] };
  const csv = model.variablesCsv(edited);
  assert.match(csv, /"'=SUM\(1,2\) ""test"""/);
  assert.match(csv, /project-a/); assert.match(csv, /Evidence IDs/);
  assert.equal(model.summaryInsights({ ...base, config: { ...base.config, competitorIds: [] } })[4].text, "No competitors selected. Add a comparison in a new analysis.");
});

test("consumer app routes honor mounting and the existing project data-readiness gate", async () => {
  const [workspace, workspaceUrl, navigation, platform] = await Promise.all([loadLinkedWorkspaceModel(), linkedWorkspaceUrl(), readSource("../app/navigation.ts"), readSource("../app/platform-model.ts")]);
  const linked = navigation.replace('"./workspace-model"', JSON.stringify(workspaceUrl)).replace('"./platform-model"', JSON.stringify(asModuleUrl(transpileSource(platform))));
  const { resolveNavigation } = await import(asModuleUrl(transpileSource(linked)));
  const project = { ...workspace.workspaceProjects[0], mountedAppIds: [...workspace.workspaceProjects[0].mountedAppIds, "consumer-insights"] };
  const route = { view: "company", project: project.id, projectTab: "apps", projectApp: "consumer-insights" };
  assert.equal(resolveNavigation(route, [project]).projectApp, "consumer-insights");
  assert.equal(resolveNavigation(route, [{ ...project, mountedAppIds: [] }]).projectApp, null);
  const empty = { ...project, origin: "Browser-session draft", variablePack: { l0: [], l1: [], l2: [] } };
  assert.equal(resolveNavigation(route, [empty]).projectTab, "data");
  assert.equal(resolveNavigation(route, [empty]).projectApp, null);
  assert.ok(workspace.projectApps.some(app => app.id === "consumer-insights"));
});
