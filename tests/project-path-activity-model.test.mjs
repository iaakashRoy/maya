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
