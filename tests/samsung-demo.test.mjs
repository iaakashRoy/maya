import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { asModuleUrl, readSource, transpileSource, loadLinkedWorkspaceModel } from "./source-model-loader.mjs";

const model = await import(asModuleUrl(transpileSource(await readSource("../app/samsung-demo-model.ts"))));
const workspace = await loadLinkedWorkspaceModel();
const { initialSamsungState, requestSamsungConnections, activateSamsung, submitSamsungPrompt, advanceSamsung, samsungPrompts, samsungPlans, calculateSamsungPlan, samsungStress, approveSamsung, samsungApprovalRoles, changeSamsungRules } = model;
const ready = (id = "samsung-test") => {
  let state = requestSamsungConnections({ ...initialSamsungState(id), selectedSources: model.samsungSources.map(s => s.id), readOnly: true });
  for (let i = 0; i < 4; i++) state = advanceSamsung(state);
  return activateSamsung({ ...state, mapped: true });
};
const run = (state, index) => {
  state = submitSamsungPrompt(state, samsungPrompts[index].prompt);
  let remaining = 20;
  while (state.running && remaining-- > 0) state = advanceSamsung(state);
  assert.equal(state.running, null, "Task graph must terminate");
  return state;
};
const review = () => { let state = ready(); for (let i = 0; i < 6; i++) state = run(state, i); return state; };

test("Samsung starts through real onboarding with zero apps, agents and data", () => {
  const client = workspace.createSessionClient({ name: "Samsung Electronics", sector: "Semiconductors", classification: "Demo", dataResidency: "Korea", clientLead: "Samsung lead", providerLead: "Asha Rao" });
  const project = workspace.createSessionProject({ clientId: client.id, name: "Galaxy Launch Continuity", problem: model.samsungBrief.problem, outcome: model.samsungBrief.outcome, owner: client.clientLead, currency: "USD", regions: model.samsungBrief.regions }, [...workspace.workspaceClients, client]);
  assert.equal(model.isSamsungDemo(project), true);
  assert.deepEqual(project.mountedAppIds, []);
  assert.equal(project.counts.agents, 0);
  assert.equal(project.variablePack.l0.length, 0);
  assert.equal(model.isSamsungDemo({ ...project, origin: "Seed fixture" }), false);
  assert.equal(model.isSamsungDemo({ ...project, client: "Apple" }), false);
  const members = workspace.createSessionProjectMemberships(project, workspace.createSessionCollaborators(client)[0], workspace.workspaceCollaborators.find(person => person.id === workspace.signedInCollaboratorId));
  assert.equal(workspace.hasProjectAccess(project.id, workspace.signedInCollaboratorId, "decisions.draft", members), true);
  assert.equal(workspace.hasProjectAccess(project.id, workspace.signedInCollaboratorId, "decisions.approve", members), false, "Demo role-play must not grant enterprise approval rights");
  const patch = model.samsungProjectPatch(project, ready(project.id));
  assert.deepEqual(patch.mountedAppIds, []);
  assert.equal(patch.counts.agents, model.samsungAgents.length);
  assert.equal(patch.variablePack.l0.length, 4);
});

test("data activation requires all sources, read-only acknowledgement and reviewed mappings", () => {
  assert.throws(() => requestSamsungConnections(initialSamsungState("test")), /Select all four/);
  const configured = { ...initialSamsungState("test"), selectedSources: model.samsungSources.map(s => s.id), readOnly: true };
  assert.throws(() => requestSamsungConnections({ ...configured, worker: " " }), /name the demo worker/);
  let state = requestSamsungConnections(configured);
  assert.throws(() => activateSamsung({ ...state, mapped: true }), /Validate sources/);
  for (let i = 0; i < 4; i++) state = advanceSamsung(state);
  assert.equal(state.connection, "validated");
  assert.throws(() => activateSamsung(state), /confirm field mappings/);
  state = activateSamsung({ ...state, mapped: true });
  assert.equal(state.connection, "active");
  assert.equal(state.usedApps.length, 0);
  for (const source of model.samsungSources) assert.equal(source.rows, source.sample.length);
});

test("app visibility follows completed first use, not activation or prompt submission", () => {
  let state = run(ready(), 0);
  assert.deepEqual(state.usedApps, []);
  state = submitSamsungPrompt(state, samsungPrompts[1].prompt);
  assert.deepEqual(state.usedApps, []);
  const expected = [];
  while (state.running) {
    const app = state.running.tasks[state.running.index].app;
    if (app && !expected.includes(app)) expected.push(app);
    state = advanceSamsung(state);
    assert.deepEqual(state.usedApps, expected);
  }
  for (let i = 2; i < 6; i++) state = run(state, i);
  assert.equal(state.usedApps.length, 9);
  assert.deepEqual(state.usedApps, [...new Set(samsungPrompts.slice(0, 6).flatMap(p => p.apps))]);
  assert.ok(!state.usedApps.includes("consumer-insights"));
  assert.ok(!state.usedApps.includes("statistics"));
  const names = new Set(model.samsungAgents.map(a => a.name));
  assert.ok(state.trace.every(t => names.has(t.agent)), "Every task must use an activated identity");
});

test("capacity, cost, quarantine and market allocation reconcile across the crisis", () => {
  const expected = [[0, false, 98000, 0], [1, false, 120000, 760000], [2, false, 128000, 838000], [2, true, 120000, 838000], [3, true, 128000, 898000]];
  for (const [index, shock, shipped, cost] of expected) {
    const result = calculateSamsungPlan(samsungPlans[index], shock);
    assert.equal(result.shipped, shipped);
    assert.equal(result.cost, cost);
    assert.equal(result.costs.reduce((sum, c) => sum + c.total, 0), cost);
    assert.equal(result.allocations.reduce((sum, a) => sum + a.delivered, 0), shipped);
    assert.equal(result.allocations.reduce((sum, a) => sum + a.requested, 0), result.demand);
    assert.ok(result.allocations.every(a => a.delivered <= a.requested));
    assert.equal(result.quarantinedUsed, 0);
    assert.equal(result.shipped, Math.min(result.demand, ...Object.values(result.capacity)));
  }
  const revised = calculateSamsungPlan(samsungPlans[3], true);
  assert.equal(revised.netContributionProtected, 5402000);
  assert.equal(revised.shortfall, 4000);
  assert.equal(calculateSamsungPlan({ ...samsungPlans[3], memoryAlt: 24001 }, true).qualifiedPass, false);
  assert.equal(calculateSamsungPlan({ ...samsungPlans[3], batteries: -1 }, true).feasible, false);
});

test("single-factor stress gates pass while combined stress remains explicitly failed", () => {
  const cases = samsungStress({ budget: 900000, serviceFloor: 95 });
  assert.equal(cases.filter(c => c.envelope).length, 4);
  assert.ok(cases.filter(c => c.envelope).every(c => c.feasible));
  assert.equal(cases.find(c => !c.envelope).feasible, false);
  assert.equal(cases.find(c => !c.envelope).shipped, 126000);
  for (const result of cases) assert.equal(result.allocations.reduce((sum, a) => sum + a.delivered, 0), result.shipped);
});

test("inactive, unknown, repeated and out-of-order chat does not start unintended apps", () => {
  let state = submitSamsungPrompt(initialSamsungState("test"), samsungPrompts[1].prompt);
  assert.equal(state.running, null);
  assert.match(state.messages.at(-1).text, /not active/);
  state = submitSamsungPrompt(ready(), samsungPrompts[4].prompt);
  assert.equal(state.stage, 0);
  assert.equal(state.running, null);
  assert.match(state.messages.at(-1).text, /Complete/);
  state = submitSamsungPrompt(state, "Send a purchase order to a real supplier");
  assert.equal(state.running, null);
  assert.match(state.messages.at(-1).text, /local demo/);
  state = run(state, 0);
  const traceCount = state.trace.length;
  state = run(state, 0);
  assert.equal(state.stage, 1);
  assert.equal(state.trace.length, traceCount);
  assert.deepEqual(state.usedApps, []);
  assert.equal(model.recognizeSamsungIntent("Prepare the decision brief; do not release anything"), "review");
});

test("a release requires a current brief and all three distinct simulated sign-offs", () => {
  assert.throws(() => approveSamsung(ready(), samsungApprovalRoles[0]), /Approval blocked/);
  let state = review();
  assert.equal(state.decision, "review");
  assert.equal(state.stage, 6);
  state = run(state, 6);
  assert.match(state.messages.at(-1).text, /Release blocked/);
  assert.equal(state.executionDay, -1);
  state = approveSamsung(state, samsungApprovalRoles[0]);
  state = approveSamsung(state, samsungApprovalRoles[0]);
  assert.equal(state.approvals.length, 1);
  state = approveSamsung(state, samsungApprovalRoles[1]);
  assert.equal(run(state, 6).decision, "review");
  assert.throws(() => approveSamsung(state, "Unrecognized reviewer"), /Approval blocked/);
  state = approveSamsung(state, samsungApprovalRoles[2]);
  assert.equal(state.decision, "approved");
  state = run(state, 6);
  assert.equal(state.decision, "executed");
  assert.equal(state.stage, 7);
  assert.equal(state.executionDay, 0);
});

test("changed constraints invalidate prior approvals and release, and block infeasible reapproval", () => {
  let state = samsungApprovalRoles.reduce(approveSamsung, review());
  state = run(state, 6);
  state = changeSamsungRules(state, { budget: 850000, serviceFloor: 95 });
  assert.equal(state.stage, 5);
  assert.equal(state.executionDay, -1);
  assert.equal(state.decision, "none");
  assert.deepEqual(state.approvals, []);
  state = run(state, 5);
  assert.throws(() => approveSamsung(state, samsungApprovalRoles[0]), /Approval blocked/);
  state = run(changeSamsungRules(state, { budget: 900000, serviceFloor: 98 }), 5);
  assert.throws(() => approveSamsung(state, samsungApprovalRoles[0]), /Approval blocked/);
  state = run(changeSamsungRules(state, { budget: 900000, serviceFloor: 95 }), 5);
  state = samsungApprovalRoles.reduce(approveSamsung, state);
  assert.equal(run(state, 6).decision, "executed");
  assert.throws(() => changeSamsungRules(state, { budget: NaN, serviceFloor: 95 }), /nonnegative budget/);
  assert.throws(() => changeSamsungRules(state, { budget: 900000, serviceFloor: 101 }), /service floor/);
});

test("the documented workflow completes with a reconciling export and isolated projects", () => {
  let state = review();
  state = samsungApprovalRoles.reduce(approveSamsung, state);
  state = run(state, 6);
  const deliveries = Array.from({ length: 11 }, (_, day) => model.samsungDelivery(day));
  assert.equal(deliveries.at(-1), 128000);
  assert.ok(deliveries.every((value, i) => i === 0 || value >= deliveries[i - 1]));
  const record = model.samsungExport({ ...state, executionDay: 10 });
  assert.equal(record.delivered, record.candidate.shipped);
  assert.equal(record.approvals.length, 3);
  assert.equal(record.stress.length, 5);
  assert.equal(record.candidate.cost, 898000);
  assert.match(record.boundary, /no Samsung systems/);
  const separate = initialSamsungState("another-project");
  assert.deepEqual(separate.usedApps, []);
  assert.deepEqual(separate.messages, []);
  assert.equal(separate.connection, "empty");
});

test("the standalone and in-app guides contain every exact executable prompt and calculated result", async () => {
  const read = path => readFile(new URL(path, import.meta.url), "utf8");
  const [markdown, html, publicHtml, shell] = await Promise.all([read("../docs/SAMSUNG_DEMO_GUIDE.md"), read("../docs/samsung-demo-guide.html"), read("../public/samsung-demo-guide.html"), read("../app/PlatformShell.tsx")]);
  assert.equal(html, publicHtml);
  for (const step of samsungPrompts) { assert.ok(markdown.includes(step.prompt)); assert.ok(html.includes(step.prompt)); }
  for (const term of ["128,000", "$898,000", "4,000", "Playground", "Onboard client", "Create project"]) assert.ok(markdown.includes(term), term);
  assert.match(markdown, /refreshing, closing the tab/);
  assert.match(markdown, /no LLM/);
  assert.match(shell, /resolvedProject && scope === "company" && isSamsungDemo\(activeProject\)/);
  assert.match(shell, /canReview=\{evaluateProjectAccess\(activeProject.id, signedInCollaboratorId, "decisions.draft"/);
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)="https?:/);
});
