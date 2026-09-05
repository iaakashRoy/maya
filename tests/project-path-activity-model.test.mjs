import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const asModuleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function loadModels() {
  const [workspaceSource, pathSource, activitySource] = await Promise.all([
    read("../app/workspace-model.ts"),
    read("../app/project-path-model.ts"),
    read("../app/project-activity-model.ts"),
  ]);
  const workspaceUrl = asModuleUrl(transpile(workspaceSource));
  const linkedPathSource = pathSource.replace('"./workspace-model"', JSON.stringify(workspaceUrl));
  const linkedActivitySource = activitySource.replace('"./workspace-model"', JSON.stringify(workspaceUrl));
  return {
    workspace: await import(workspaceUrl),
    path: await import(asModuleUrl(transpile(linkedPathSource))),
    activity: await import(asModuleUrl(transpile(linkedActivitySource))),
  };
}

const projectFixture = (base, patch) => ({
  ...base,
  metrics: base.metrics.map((metric) => ({ ...metric })),
  mountedAppIds: [...base.mountedAppIds],
  variablePack: {
    l2: [...base.variablePack.l2],
    l1: [...base.variablePack.l1],
    l0: [...base.variablePack.l0],
  },
  methodCodes: [...base.methodCodes],
  ...patch,
});

test("project path grouping supports one client across towers without duplicate or misplaced leaves", async () => {
  const { workspace, path } = await loadModels();
  const base = workspace.workspaceProjects[0];
  const projects = [
    projectFixture(base, { id: "shared-packaging-a", code: "P-901", clientId: "shared-client", client: "Shared Client", sectorId: "packaging", sector: "Packaging", name: "Packaging Alpha" }),
    projectFixture(base, { id: "shared-packaging-b", code: "P-902", clientId: "shared-client", client: "Shared Client", sectorId: "packaging", sector: "Packaging", name: "Packaging Beta" }),
    projectFixture(base, { id: "shared-mobility", code: "P-903", clientId: "shared-client", client: "Shared Client", sectorId: "mobility", sector: "Mobility", name: "Mobility Launch" }),
    projectFixture(base, { id: "other-packaging", code: "P-904", clientId: "other-client", client: "Other Client", sectorId: "packaging", sector: "Packaging", name: "Packaging Gamma" }),
  ];

  for (const mode of ["tower", "client"]) {
    const groups = path.groupProjectsByPath(projects, mode);
    const leaves = groups.flatMap((group) => group.branches.flatMap((branch) => branch.projects));
    assert.deepEqual(leaves.map((project) => project.id).sort(), projects.map((project) => project.id).sort());
    assert.equal(new Set(leaves.map((project) => project.id)).size, projects.length);

    for (const group of groups) {
      for (const branch of group.branches) {
        assert.equal(new Set(branch.projects.map((project) => project.id)).size, branch.projects.length);
        for (const project of branch.projects) {
          if (mode === "tower") {
            assert.equal(project.sectorId, group.id, `${project.id} leaked into the wrong tower root`);
            assert.equal(project.clientId, branch.id, `${project.id} leaked into the wrong client branch`);
          } else {
            assert.equal(project.clientId, group.id, `${project.id} leaked into the wrong client root`);
            assert.equal(project.sectorId, branch.id, `${project.id} leaked into the wrong tower branch`);
          }
        }
      }
    }
  }

  const towerTree = path.groupProjectsByPath(projects, "tower");
  const packaging = towerTree.find((group) => group.id === "packaging");
  const packagingShared = packaging.branches.find((branch) => branch.id === "shared-client");
  assert.deepEqual(packagingShared.projects.map((project) => project.id), ["shared-packaging-a", "shared-packaging-b"]);

  const clientTree = path.groupProjectsByPath(projects, "client");
  const shared = clientTree.find((group) => group.id === "shared-client");
  assert.deepEqual(shared.branches.map((branch) => branch.id), ["mobility", "packaging"]);
  assert.deepEqual(
    shared.branches.flatMap((branch) => branch.projects.map((project) => project.id)).sort(),
    ["shared-mobility", "shared-packaging-a", "shared-packaging-b"],
  );

  const selected = projects[2];
  assert.deepEqual(path.projectPathSegments(selected, "tower").map((segment) => segment.kind), ["tower", "client", "project"]);
  assert.deepEqual(path.projectPathSegments(selected, "client").map((segment) => segment.kind), ["client", "tower", "project"]);
  assert.notEqual(path.projectPathKeys(projects[0], "tower").branch, path.projectPathKeys(projects[2], "tower").branch);
});

test("seeded and browser-created work IDs remain deterministic, ordered, and project scoped", async () => {
  const { workspace, activity } = await loadModels();
  const projects = workspace.workspaceProjects.slice(0, 2);
  const first = activity.seedProjectActivity(projects);
  const second = activity.seedProjectActivity(projects);

  for (const collection of ["sessions", "messages", "activities", "appRuns"]) {
    const firstIds = first[collection].map((item) => item.id);
    const secondIds = second[collection].map((item) => item.id);
    assert.deepEqual(firstIds, secondIds, `${collection} IDs changed across identical seeds`);
    assert.equal(new Set(firstIds).size, firstIds.length, `${collection} IDs are not unique`);
  }

  for (const project of projects) {
    const token = project.code.replaceAll("-", "");
    const sessions = activity.sessionsForProject(first, project.id);
    assert.ok(sessions.length > 0);
    assert.ok(sessions.every((session) => session.id.startsWith(`SES-${token}-`)));
    for (const session of sessions) {
      const messages = activity.messagesForSession(first, project.id, session.id);
      assert.deepEqual(messages.map((message) => message.sequence), messages.map((_, index) => index + 1));
      assert.ok(messages.every((message) => message.projectId === project.id && message.sessionId === session.id));
    }
    assert.ok(activity.appRunsFor(first, project.id).every((run) => run.id.startsWith(`APP-${token}-`)));
    for (const session of sessions) {
      const sessionMessages = activity.messagesForSession(first, project.id, session.id);
      const sessionActivities = activity.activitiesForSession(first, project.id, session.id);
      const sessionRuns = activity.appRunsFor(first, project.id).filter((run) => run.sessionId === session.id);
      assert.ok(sessionMessages.length > 0, `${session.id} has no message history`);
      assert.ok(sessionActivities.length > 0, `${session.id} has no activity history`);
      assert.deepEqual([...session.appIds].sort(), sessionRuns.map((run) => run.appId).sort(), `${session.id} app IDs do not match linked runs`);
      const linkedRunIds = new Set(sessionRuns.map((run) => run.id));
      for (const message of sessionMessages) assert.ok(message.appRunRefs.every((runId) => linkedRunIds.has(runId)), `${message.id} links outside ${session.id}`);
      for (const item of sessionActivities) assert.ok(!item.appRunId || linkedRunIds.has(item.appRunId), `${item.id} links outside ${session.id}`);
    }
  }

  const project = projects[0];
  const createdOnce = activity.projectActivityReducer(first, {
    type: "create-session",
    project,
    prompt: "Re-evaluate the service floor and preserve every trace.",
    agentId: "orchestrator",
    agentName: "Project Orchestrator",
  });
  const firstBrowserSession = activity.sessionsForProject(createdOnce, project.id).find((session) => session.origin === "Browser session");
  assert.equal(firstBrowserSession.id, `SES-${project.code.replaceAll("-", "")}-S001`);
  assert.deepEqual(
    activity.messagesForSession(createdOnce, project.id, firstBrowserSession.id).map((message) => message.id),
    [`MSG-${project.code.replaceAll("-", "")}-S001-001`, `MSG-${project.code.replaceAll("-", "")}-S001-002`],
  );

  const createdTwice = activity.projectActivityReducer(createdOnce, {
    type: "create-session",
    project,
    prompt: "Create a second independent review session.",
    agentId: "evidence",
    agentName: "Evidence Auditor",
  });
  const browserSessionIds = activity.sessionsForProject(createdTwice, project.id)
    .filter((session) => session.origin === "Browser session")
    .map((session) => session.id);
  assert.deepEqual(browserSessionIds, [
    `SES-${project.code.replaceAll("-", "")}-S002`,
    `SES-${project.code.replaceAll("-", "")}-S001`,
  ]);
});

test("every seeded project attributes distinct recent work to every agent and project member", async () => {
  const { workspace, activity } = await loadModels();
  const seeded = activity.seedProjectActivity(workspace.workspaceProjects);

  for (const project of workspace.workspaceProjects) {
    const primary = activity.sessionsForProject(seeded, project.id).find((session) => session.id.endsWith("-024"));
    assert.ok(primary, `${project.code} is missing its primary project session`);
    const events = activity.activitiesForSession(seeded, project.id, primary.id);
    assert.deepEqual([...primary.participantAgentIds].sort(), workspace.expertAgents.map((agent) => agent.id).sort());

    for (const agent of workspace.expertAgents) {
      const attributed = events.filter((event) => event.actor === agent.name);
      assert.ok(attributed.length >= 2, `${project.code} has insufficient activity for ${agent.name}`);
      assert.ok(attributed.some((event) => event.detail.includes(project.code) || event.detail.includes(project.name) || event.detail.includes(project.client) || event.detail.includes(project.regions) || event.detail.includes(project.sector)), `${project.code} agent activity is not project-specific for ${agent.name}`);
    }

    const memberNames = workspace.membershipsForProject(project.id).map((membership) => workspace.workspaceCollaborators.find((collaborator) => collaborator.id === membership.collaboratorId)?.name).filter(Boolean);
    for (const name of memberNames) {
      assert.ok(events.filter((event) => event.actor === name).length >= 2, `${project.code} has insufficient member activity for ${name}`);
    }
  }
});

test("fixture sessions auto-fork before steering and preserve result activity on the browser session", async () => {
  const { workspace, activity } = await loadModels();
  const project = workspace.workspaceProjects[0];
  const seeded = activity.seedProjectActivity([project]);
  const source = activity.sessionsForProject(seeded, project.id)[0];
  const sourceSnapshot = structuredClone(source);

  const steered = activity.projectActivityReducer(seeded, {
    type: "steer-session",
    projectId: project.id,
    sessionId: source.id,
    instruction: "Raise the service floor to 97% and retain qualified sources only.",
  });
  assert.deepEqual(steered.sessions.find((session) => session.id === source.id), sourceSnapshot);
  const forkId = steered.selectedSessionByProject[project.id];
  const fork = steered.sessions.find((session) => session.id === forkId);
  assert.equal(fork.origin, "Browser session");
  assert.equal(fork.parentSessionId, source.id);
  assert.deepEqual(fork.appIds, []);
  assert.equal(activity.sessionsForProject(steered, project.id)[0].id, forkId);
  assert.equal(activity.messagesForSession(steered, project.id, forkId).at(-1).kind, "Steering");
  assert.equal(activity.activitiesForSession(steered, project.id, forkId).at(-1).type, "steering");

  const result = {
    headline: "Candidate recalculated",
    recommendation: "Submit the 97% candidate for review.",
    metrics: [{ label: "Projected service", value: "97.1%" }],
    evidenceRefs: [project.metrics[0].evidenceRef],
    reviewGate: "Supply planning approval required",
    claimBoundary: "Synthetic browser replay only.",
  };
  const completed = activity.projectActivityReducer(steered, {
    type: "complete-session",
    projectId: project.id,
    sessionId: forkId,
    result,
  });
  const completedFork = completed.sessions.find((session) => session.id === forkId);
  assert.equal(completedFork.status, "Awaiting review");
  assert.deepEqual(completedFork.finalResult, result);
  assert.equal(activity.messagesForSession(completed, project.id, forkId).at(-1).kind, "Result");
  assert.equal(activity.activitiesForSession(completed, project.id, forkId).at(-1).state, "Review");
  assert.deepEqual(completed.sessions.find((session) => session.id === source.id), sourceSnapshot);
});

test("app reruns append immutable lineage and never rewrite the selected source run", async () => {
  const { workspace, activity } = await loadModels();
  const project = workspace.workspaceProjects[0];
  const seeded = activity.seedProjectActivity([project]);
  const parent = activity.appRunsFor(seeded, project.id, "optimizer")[0];
  assert.ok(parent);
  const parentSnapshot = structuredClone(parent);
  const primarySession = activity.sessionsForProject(seeded, project.id)[0];
  assert.deepEqual(
    [...primarySession.appIds].sort(),
    seeded.appRuns.filter((run) => run.sessionId === primarySession.id).map((run) => run.appId).sort(),
  );

  const continued = activity.projectActivityReducer(seeded, {
    type: "fork-session",
    projectId: project.id,
    sessionId: primarySession.id,
  });
  const activeSessionId = continued.selectedSessionByProject[project.id];

  const edited = activity.projectActivityReducer(continued, {
    type: "edit-app-input",
    projectId: project.id,
    runId: parent.id,
    key: "service_floor",
    value: "97",
  });
  assert.deepEqual(edited.appRuns.find((run) => run.id === parent.id), parentSnapshot);

  const planned = activity.planAppRerun(edited, project.id, parent.id, activeSessionId);
  assert.equal(planned.runId, `${parent.id}-R01`);
  assert.equal(planned.sessionId, activeSessionId);
  assert.equal(planned.fixtureSessionForked, false);

  const rerun = activity.projectActivityReducer(edited, {
    type: "rerun-app",
    projectId: project.id,
    runId: parent.id,
    sessionId: activeSessionId,
  });
  const child = rerun.appRuns.at(-1);
  assert.equal(rerun.appRuns.length, seeded.appRuns.length + 1);
  assert.deepEqual(rerun.appRuns.find((run) => run.id === parent.id), parentSnapshot);
  assert.equal(child.id, `${parent.id}-R01`);
  assert.equal(child.parentRunId, parent.id);
  assert.equal(child.reportId, `${parent.reportId}-R01`);
  assert.equal(child.traceId, `${parent.traceId}-R01`);
  assert.equal(child.origin, "Browser session");
  assert.equal(child.sessionId, activeSessionId);
  assert.equal(child.inputs.find((input) => input.key === "service_floor").value, "97");
  assert.equal(parent.inputs.find((input) => input.key === "service_floor").value, "95");
  assert.deepEqual(child.changeSet, [{ key: "service_floor", before: "95", after: "97" }]);
  assert.notEqual(child.inputFingerprint, parent.inputFingerprint);
  assert.notDeepEqual(child.outputs, parent.outputs);
  assert.match(child.summary, /service floor 95% -> 97%/);
  assert.equal(rerun.selectedRunByProjectApp[`${project.id}:optimizer`], child.id);
  assert.equal(activity.appRunsFor(rerun, project.id, "optimizer")[0].id, child.id);
  assert.ok(rerun.sessions.find((session) => session.id === activeSessionId).appIds.includes("optimizer"));
  assert.ok(activity.messagesForSession(rerun, project.id, activeSessionId).some((message) => message.appRunRefs.includes(child.id)));
  assert.ok(activity.activitiesForSession(rerun, project.id, activeSessionId).some((item) => item.appRunId === child.id));

  const fixturePlan = activity.planAppRerun(seeded, project.id, parent.id, primarySession.id);
  assert.equal(fixturePlan.sessionId, `SES-${project.code.replaceAll("-", "")}-S001`);
  assert.equal(fixturePlan.runId, `${parent.id}-R01`);
  assert.equal(fixturePlan.fixtureSessionForked, true);

  const childSnapshot = structuredClone(child);
  const editedChild = activity.projectActivityReducer(rerun, {
    type: "edit-app-input",
    projectId: project.id,
    runId: child.id,
    key: "planning_horizon",
    value: "16",
  });
  const rerunChild = activity.projectActivityReducer(editedChild, {
    type: "rerun-app",
    projectId: project.id,
    runId: child.id,
    sessionId: activeSessionId,
  });
  const grandchild = rerunChild.appRuns.at(-1);
  assert.deepEqual(rerunChild.appRuns.find((run) => run.id === parent.id), parentSnapshot);
  assert.deepEqual(rerunChild.appRuns.find((run) => run.id === child.id), childSnapshot);
  assert.equal(grandchild.id, `${child.id}-R02`);
  assert.equal(grandchild.parentRunId, child.id);
  assert.equal(grandchild.inputs.find((input) => input.key === "service_floor").value, "97");
  assert.equal(grandchild.inputs.find((input) => input.key === "planning_horizon").value, "16");
  assert.deepEqual(grandchild.changeSet, [{ key: "planning_horizon", before: "12", after: "16" }]);
});

test("closed browser sessions fork once and remain immutable across continued work", async () => {
  const { workspace, activity } = await loadModels();
  const project = workspace.workspaceProjects[0];
  const seeded = activity.seedProjectActivity([project]);
  const created = activity.projectActivityReducer(seeded, {
    type: "create-session",
    project,
    prompt: "Create an editable browser session and retain its lineage.",
    agentId: "orchestrator",
    agentName: "Project Orchestrator",
  });
  const sourceId = `SES-${project.code.replaceAll("-", "")}-S001`;
  const closed = activity.projectActivityReducer(created, {
    type: "complete-session",
    projectId: project.id,
    sessionId: sourceId,
    result: {
      headline: "Review package ready",
      recommendation: "Keep the package at human review.",
      metrics: [{ label: "Candidate", value: "1" }],
      evidenceRefs: [project.metrics[0].evidenceRef],
      reviewGate: "Named owner approval",
      claimBoundary: "Synthetic browser session only.",
    },
  });
  const sourceSnapshot = structuredClone(closed.sessions.find((session) => session.id === sourceId));
  const planned = activity.planSessionMutation(closed, project.id, sourceId);
  assert.deepEqual(planned, { sourceSessionId: sourceId, sessionId: `SES-${project.code.replaceAll("-", "")}-S002`, sessionForked: true });

  const firstReply = activity.projectActivityReducer(closed, {
    type: "append-message",
    projectId: project.id,
    sessionId: sourceId,
    role: "user",
    author: "Asha Rao",
    kind: "Prompt",
    body: "Continue from the reviewed package.",
  });
  const childId = planned.sessionId;
  const secondReply = activity.projectActivityReducer(firstReply, {
    type: "append-message",
    projectId: project.id,
    sessionId: childId,
    role: "agent",
    author: "Project Orchestrator",
    kind: "Response",
    body: "Continuation recorded in the same editable child.",
  });

  assert.deepEqual(secondReply.sessions.find((session) => session.id === sourceId), sourceSnapshot);
  const child = secondReply.sessions.find((session) => session.id === childId);
  assert.equal(child.parentSessionId, sourceId);
  assert.equal(child.status, "Active");
  assert.equal(child.finalResult, undefined);
  assert.deepEqual(
    activity.messagesForSession(secondReply, project.id, childId).slice(-2).map((message) => message.body),
    ["Continue from the reviewed package.", "Continuation recorded in the same editable child."],
  );

  const parentRun = activity.appRunsFor(secondReply, project.id, "optimizer")[0];
  const rerunPlan = activity.planAppRerun(secondReply, project.id, parentRun.id, sourceId);
  assert.equal(rerunPlan.sessionId, `SES-${project.code.replaceAll("-", "")}-S003`);
  assert.equal(rerunPlan.sessionForked, true);
  const rerun = activity.projectActivityReducer(secondReply, {
    type: "rerun-app",
    projectId: project.id,
    runId: parentRun.id,
    sessionId: sourceId,
  });
  assert.equal(rerun.appRuns.at(-1).sessionId, rerunPlan.sessionId);
  assert.deepEqual(rerun.sessions.find((session) => session.id === sourceId), sourceSnapshot);
});

test("a zero-history project can create its first concrete application run", async () => {
  const { workspace, activity } = await loadModels();
  const draft = projectFixture(workspace.workspaceProjects[0], {
    id: "browser-created-optimizer-project",
    code: "P-901",
    origin: "Browser-session draft",
    name: "Browser-created optimizer project",
    mountedAppIds: ["optimizer"],
    counts: { entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 1, agents: 0, experts: 2 },
  });
  const seeded = activity.seedProjectActivity([draft]);
  assert.equal(activity.sessionsForProject(seeded, draft.id).length, 0);
  assert.equal(activity.appRunsFor(seeded, draft.id).length, 0);
  assert.equal(activity.planAppStart(seeded, draft, "risk"), undefined);

  const plan = activity.planAppStart(seeded, draft, "optimizer");
  assert.deepEqual(plan, {
    appId: "optimizer",
    runId: "APP-P901-NO-S001",
    sessionId: "SES-P901-S001",
    reportId: "RPT-P901-NO-S001",
    traceId: "TRACE-P901-NO-S001",
    sourceSessionId: undefined,
    sessionCreated: true,
    sessionForked: false,
  });

  const started = activity.projectActivityReducer(seeded, { type: "start-app-run", project: draft, appId: "optimizer" });
  const session = activity.sessionsForProject(started, draft.id)[0];
  const run = activity.appRunsFor(started, draft.id, "optimizer")[0];
  assert.equal(session.id, plan.sessionId);
  assert.equal(session.entryPoint, "Application");
  assert.deepEqual(session.appIds, ["optimizer"]);
  assert.equal(run.id, plan.runId);
  assert.equal(run.sessionId, session.id);
  assert.equal(run.reportId, plan.reportId);
  assert.equal(run.traceId, plan.traceId);
  assert.equal(started.selectedSessionByProject[draft.id], session.id);
  assert.equal(started.selectedRunByProjectApp[`${draft.id}:optimizer`], run.id);
  assert.ok(activity.messagesForSession(started, draft.id, session.id).some((message) => message.appRunRefs.includes(run.id)));
  assert.ok(activity.activitiesForSession(started, draft.id, session.id).some((item) => item.appRunId === run.id));
});

test("application inputs enforce their declared domain and changed outputs receive new evidence", async () => {
  const { workspace, activity } = await loadModels();
  const project = workspace.workspaceProjects[0];
  const seeded = activity.seedProjectActivity([project]);
  const parent = activity.appRunsFor(seeded, project.id, "optimizer")[0];

  const aboveMaximum = activity.projectActivityReducer(seeded, { type: "edit-app-input", projectId: project.id, runId: parent.id, key: "service_floor", value: "150" });
  const invalidChoice = activity.projectActivityReducer(seeded, { type: "edit-app-input", projectId: project.id, runId: parent.id, key: "scenario", value: "Magic answer" });
  assert.equal(aboveMaximum.runDrafts[parent.id].service_floor, "150");
  assert.equal(invalidChoice.runDrafts[parent.id].scenario, "Magic answer");
  assert.match(activity.validateAppInputValue(parent.inputs.find((input) => input.key === "service_floor"), "150"), /Maximum/);
  assert.match(activity.validateAppInputValue(parent.inputs.find((input) => input.key === "scenario"), "Magic answer"), /declared options/);
  assert.equal(activity.planAppRerun(aboveMaximum, project.id, parent.id, parent.sessionId), undefined);
  assert.equal(activity.planAppRerun(invalidChoice, project.id, parent.id, parent.sessionId), undefined);
  assert.strictEqual(activity.projectActivityReducer(aboveMaximum, { type: "rerun-app", projectId: project.id, runId: parent.id, sessionId: parent.sessionId }), aboveMaximum);

  const valid = activity.projectActivityReducer(seeded, { type: "edit-app-input", projectId: project.id, runId: parent.id, key: "service_floor", value: "97" });
  assert.equal(valid.runDrafts[parent.id].service_floor, "97");
  const rerun = activity.projectActivityReducer(valid, {
    type: "rerun-app",
    projectId: project.id,
    runId: parent.id,
    sessionId: parent.sessionId,
  });
  const child = rerun.appRuns.at(-1);
  assert.equal(child.inputs.find((input) => input.key === "service_floor").value, "97");
  assert.ok(child.outputs.every((output, index) => output.evidenceRef !== parent.outputs[index].evidenceRef));
  assert.ok(child.outputs.every((output) => output.evidenceRef.startsWith(`${child.traceId}-OUT-`)));
});

test("derived application evidence resolves to one exact project run while baseline metric references stay generic", async () => {
  const { workspace, activity } = await loadModels();
  const [project, otherProject] = workspace.workspaceProjects.slice(0, 2);
  const seeded = activity.seedProjectActivity([project, otherProject]);
  const parent = activity.appRunsFor(seeded, project.id, "optimizer")[0];
  const edited = activity.projectActivityReducer(seeded, { type: "edit-app-input", projectId: project.id, runId: parent.id, key: "service_floor", value: "97" });
  const rerun = activity.projectActivityReducer(edited, { type: "rerun-app", projectId: project.id, runId: parent.id, sessionId: parent.sessionId });
  const child = activity.appRunsFor(rerun, project.id, "optimizer")[0];

  assert.equal(activity.resolveActivityEvidence(rerun, project.id, child.id)?.run.id, child.id);
  assert.equal(activity.resolveActivityEvidence(rerun, project.id, child.reportId)?.kind, "report");
  assert.equal(activity.resolveActivityEvidence(rerun, project.id, child.traceId)?.kind, "trace");
  for (const output of child.outputs) {
    const target = activity.resolveActivityEvidence(rerun, project.id, output.evidenceRef);
    assert.equal(target?.kind, "output");
    assert.equal(target?.run.id, child.id);
    assert.equal(target?.output.evidenceRef, output.evidenceRef);
    assert.equal(activity.resolveActivityEvidence(rerun, otherProject.id, output.evidenceRef), undefined);
  }
  assert.equal(activity.resolveActivityEvidence(seeded, project.id, parent.outputs[0].evidenceRef), undefined, "baseline project metrics must not be misattributed to an app run");
});

test("agent trace state belongs to its session and survives selection without leaking across sessions", async () => {
  const { workspace, activity } = await loadModels();
  const project = workspace.workspaceProjects[0];
  const seeded = activity.seedProjectActivity([project]);
  const fixture = activity.sessionsForProject(seeded, project.id)[0];
  assert.equal(activity.agentTraceView(fixture).state, "Completed");

  const created = activity.projectActivityReducer(seeded, {
    type: "create-session",
    project,
    prompt: "Trace qualified sources and stop at human review.",
    agentId: "orchestrator",
    agentName: "Project Orchestrator",
  });
  const activeId = created.selectedSessionByProject[project.id];
  const active = created.sessions.find((session) => session.id === activeId);
  assert.deepEqual(activity.agentTraceView(active), { state: "Running", stepIndex: 0, prompt: "Trace qualified sources and stop at human review.", steeringInstructions: [] });

  const advanced = activity.projectActivityReducer(created, { type: "advance-agent-trace", projectId: project.id, sessionId: activeId, maxStepIndex: 6 });
  assert.equal(activity.agentTraceView(advanced.sessions.find((session) => session.id === activeId)).stepIndex, 1);
  const switched = activity.projectActivityReducer(advanced, { type: "select-session", projectId: project.id, sessionId: fixture.id });
  assert.equal(activity.agentTraceView(switched.sessions.find((session) => session.id === fixture.id)).state, "Completed");
  assert.equal(activity.agentTraceView(switched.sessions.find((session) => session.id === activeId)).stepIndex, 1);

  const activeSnapshot = structuredClone(switched.sessions.find((session) => session.id === activeId));
  const forked = activity.projectActivityReducer(switched, { type: "fork-session", projectId: project.id, sessionId: fixture.id });
  const forkId = forked.selectedSessionByProject[project.id];
  const readyFork = forked.sessions.find((session) => session.id === forkId);
  assert.deepEqual(activity.agentTraceView(readyFork), { state: "Ready", stepIndex: -1, prompt: fixture.objective, steeringInstructions: [] });
  const started = activity.projectActivityReducer(forked, { type: "start-agent-trace", projectId: project.id, sessionId: forkId, prompt: fixture.objective });
  assert.equal(activity.agentTraceView(started.sessions.find((session) => session.id === forkId)).state, "Running");
  assert.deepEqual(started.sessions.find((session) => session.id === activeId), activeSnapshot);
});

test("application starts fail closed until a mounted project has a canonical data contract", async () => {
  const { workspace, activity } = await loadModels();
  const base = workspace.workspaceProjects[0];
  const empty = projectFixture(base, {
    id: "empty-contract",
    code: "P-998",
    origin: "Browser-session draft",
    mountedAppIds: ["optimizer"],
    variablePack: { l2: [], l1: [], l0: [] },
  });
  const seeded = activity.seedProjectActivity([empty]);
  assert.equal(activity.projectHasDataContract(empty), false);
  assert.equal(activity.planAppStart(seeded, empty, "optimizer"), undefined);
  assert.strictEqual(activity.projectActivityReducer(seeded, { type: "start-app-run", project: empty, appId: "optimizer" }), seeded);

  const mapped = projectFixture(empty, { variablePack: { l2: ["L2-001"], l1: ["L1-001"], l0: ["L0-001"] } });
  assert.equal(activity.projectHasDataContract(mapped), true);
  assert.ok(activity.planAppStart(seeded, mapped, "optimizer"));
});
