import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const asModuleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function loadWorkspaceModel() {
  return import(asModuleUrl(transpile(await read("../app/workspace-model.ts"))));
}

const clientDraft = {
  name: "Apex Mobility",
  sector: "Industrial Automation",
  classification: "Client confidential",
  dataResidency: "EU policy intent",
  clientLead: "Client Lead Fixture",
  kearneyLead: "Kearney Lead Fixture",
};

const projectDraft = (clientId, name = "Anode Shield") => ({
  clientId,
  name,
  problem: "Frame a new project decision without inheriting operational data.",
  outcome: "Create a governed zero-state workspace shell.",
  owner: "Client Lead Fixture",
  currency: "USD",
  regions: "EU · India",
});

test("session client and project factories are collision-safe and preserve canonical ancestry", async () => {
  const model = await loadWorkspaceModel();
  const firstClient = model.createSessionClient(clientDraft);
  const secondClient = model.createSessionClient(clientDraft, [...model.workspaceClients, firstClient]);

  assert.equal(firstClient.id, "apex-mobility-2");
  assert.equal(secondClient.id, "apex-mobility-3");
  assert.equal(firstClient.sectorId, "industrial-automation");
  assert.equal(firstClient.origin, "Browser-session draft");

  const firstProject = model.createSessionProject(projectDraft(firstClient.id), [...model.workspaceClients, firstClient]);
  const secondProject = model.createSessionProject(projectDraft(firstClient.id), [...model.workspaceClients, firstClient], [...model.workspaceProjects, firstProject]);

  assert.equal(firstProject.id, "anode-shield-2");
  assert.equal(secondProject.id, "anode-shield-3");
  assert.equal(firstProject.code, "P-011");
  assert.equal(secondProject.code, "P-012");
  assert.equal(firstProject.clientId, firstClient.id);
  assert.equal(firstProject.client, firstClient.name);
  assert.equal(firstProject.sectorId, firstClient.sectorId);
  assert.equal(firstProject.origin, "Browser-session draft");

  const collaborators = model.createSessionCollaborators(firstClient);
  const memberships = model.createSessionProjectMemberships(firstProject, collaborators[0], collaborators[1]);
  assert.deepEqual(collaborators.map((item) => item.affiliation), ["Client", "Kearney"]);
  assert.deepEqual(collaborators.map((item) => item.clientId), [firstClient.id, undefined]);
  assert.ok(collaborators.every((item) => item.profileOrigin === "Browser-session draft"));
  assert.equal(memberships.length, 2);
  assert.ok(memberships.every((item) => item.projectId === firstProject.id && item.origin === "Browser-session draft"));
  assert.equal(model.hasProjectAccess(firstProject.id, collaborators[0].id, "decisions.approve", memberships), true);
  assert.equal(model.hasProjectAccess(firstProject.id, collaborators[1].id, "decisions.approve", memberships), false);
});

test("a browser-created project starts with zero resources and two collaborator membership drafts", async () => {
  const model = await loadWorkspaceModel();
  const client = model.createSessionClient({ ...clientDraft, name: "Northstar Components" });
  const project = model.createSessionProject(projectDraft(client.id, "Zero State Network"), [...model.workspaceClients, client]);
  const collaborators = model.createSessionCollaborators(client);
  const memberships = model.createSessionProjectMemberships(project, collaborators[0], collaborators[1]);

  assert.deepEqual(project.counts, { entities: "0", relationships: "0", observations: "0", documents: "0", events: "0", claims: "0", decisions: 0, runs: 0, apps: 0, agents: 0, experts: 2 });
  assert.deepEqual(project.mountedAppIds, []);
  assert.deepEqual(project.methodCodes, []);
  assert.deepEqual(project.variablePack, { l2: [], l1: [], l0: [] });
  assert.deepEqual(model.datasetsFor(project), []);
  assert.deepEqual(model.decisionsFor(project), []);
  assert.deepEqual(model.graphNodesFor(project), []);
  assert.deepEqual(model.agentsFor(project), []);
  assert.ok(project.metrics.every((metric) => /Draft|0/.test(metric.value)));
  assert.equal(memberships.length, 2);
  assert.deepEqual(memberships.map((membership) => membership.projectRole), ["Client owner", "Kearney engagement lead"]);
  assert.ok(memberships.every((membership) => membership.projectId === project.id));
  assert.ok(memberships.every((membership) => membership.origin === "Browser-session draft"));

  const foreignClient = model.createSessionClient({ ...clientDraft, name: "Foreign Client" }, [...model.workspaceClients, client]);
  const foreignCollaborators = model.createSessionCollaborators(foreignClient, [...model.workspaceCollaborators, ...collaborators]);
  assert.throws(
    () => model.createSessionProjectMemberships(project, foreignCollaborators[0], collaborators[1]),
    /not bound to canonical client/i,
  );
});

test("client and Kearney collaborators receive explicit project memberships that fail closed", async () => {
  const model = await loadWorkspaceModel();
  const project = model.workspaceProjects[1];
  const memberships = model.membershipsForProject(project.id);
  const projectCollaborators = memberships.map((membership) => model.workspaceCollaborators.find((collaborator) => collaborator.id === membership.collaboratorId));

  assert.ok(projectCollaborators.some((collaborator) => collaborator?.affiliation === "Client" && collaborator.organization === project.client));
  assert.ok(projectCollaborators.some((collaborator) => collaborator?.affiliation === "Kearney" && collaborator.organization === "Kearney"));

  const clientOwner = memberships.find((membership) => membership.projectRole === "Client owner");
  const orScientist = memberships.find((membership) => membership.projectRole === "Kearney OR scientist");
  assert.equal(model.hasProjectAccess(project.id, clientOwner.collaboratorId, "decisions.approve"), true);
  assert.equal(model.hasProjectAccess(project.id, orScientist.collaboratorId, "decisions.draft"), true);
  assert.equal(model.hasProjectAccess(project.id, orScientist.collaboratorId, "decisions.approve"), false);
  assert.equal(model.hasProjectAccess(model.workspaceProjects[2].id, clientOwner.collaboratorId, "project.view"), false);

  const denial = model.evaluateProjectAccess(project.id, "unknown-collaborator", "data.view");
  assert.equal(denial.allowed, false);
  assert.match(denial.reason, /fails closed/i);
  assert.match(denial.reason, /no project resource is opened or changed/i);
});

test("IoT connector templates and project drafts remain catalog-only, project-scoped, and non-operational", async () => {
  const model = await loadWorkspaceModel();
  const project = model.workspaceProjects[8];
  const otherProject = model.workspaceProjects[7];

  assert.ok(model.connectorTemplates.some((template) => template.protocol.includes("OPC UA")));
  assert.ok(model.connectorTemplates.some((template) => template.protocol.includes("MQTT 5 over TLS")));
  assert.ok(model.connectorTemplates.every((template) => template.catalogState === "Catalog only"));
  assert.ok(model.connectorTemplates.every((template) => !Object.hasOwn(template, "status")));

  const first = model.createConnectorDraft(project, "opc-ua-edge", "Kearney Data Steward");
  const second = model.createConnectorDraft(project, "opc-ua-edge", "Kearney Data Steward", [first]);
  assert.equal(first.state, "Draft request");
  assert.equal(first.policyReviewState, "Not requested");
  assert.equal(first.endpointState, "Not supplied");
  assert.equal(first.credentialState, "Not provided");
  assert.equal(first.networkState, "Not tested");
  assert.equal(first.sampleState, "Not run");
  assert.notEqual(first.id, second.id);

  const reviewed = model.queueConnectorPolicyReview(first);
  const testedAfterReview = model.replayConnectorFixture(reviewed);
  assert.equal(testedAfterReview.policyReviewState, "Policy review queued");
  assert.equal(testedAfterReview.sampleState, "Fixed payload replayed");
  const reviewedAfterTest = model.queueConnectorPolicyReview(model.replayConnectorFixture(first));
  assert.equal(reviewedAfterTest.policyReviewState, "Policy review queued");
  assert.equal(reviewedAfterTest.sampleState, "Fixed payload replayed");

  const wording = model.connectorReceiptWording(project, first);
  assert.match(wording, /project-scoped browser-session request/i);
  assert.match(wording, /No device, PLC, broker, endpoint, credential, certificate, network route, source record, or telemetry feed was connected or read\./);
  const receipt = model.connectorReceiptFor(project, first);
  assert.equal(receipt.projectId, project.id);
  assert.equal(receipt.sourceKind, "Synthetic fixture");

  const blocked = model.connectorReceiptFor(otherProject, first);
  assert.equal(blocked.projectId, otherProject.id);
  assert.equal(blocked.displayedValue, "Not found");
  assert.match(blocked.formula, /no foreign or fallback claim was substituted/i);
});

test("Operations World intake is retained as metadata without fabricating project resources", async () => {
  const model = await loadWorkspaceModel();
  const client = model.workspaceClients[0];
  const project = model.createSessionProject({
    ...projectDraft(client.id, "Route Escalation"),
    operationsWorldIntake: {
      intent: "route",
      selectedKind: "movement",
      selectedId: "MV-204",
      selectedLabel: "Singapore to Rotterdam",
      frame: "Regional · APAC",
      scenario: "Red Sea constrained",
    },
  });

  assert.deepEqual(project.operationsWorldIntake, {
    intent: "route",
    selectedKind: "movement",
    selectedId: "MV-204",
    selectedLabel: "Singapore to Rotterdam",
    frame: "Regional · APAC",
    scenario: "Red Sea constrained",
    evidenceRef: `${project.code}-OWI-MV-204`,
  });
  assert.equal(project.counts.observations, "0");
  assert.equal(project.counts.decisions, 0);
  assert.deepEqual(model.datasetsFor(project), []);
  assert.deepEqual(model.decisionsFor(project), []);
});

test("the signed-in portfolio identity has explicit grants for every seeded project", async () => {
  const model = await loadWorkspaceModel();
  const identity = model.workspaceCollaborators.find((item) => item.id === model.signedInCollaboratorId);

  assert.equal(identity?.name, "Maya Rao");
  assert.equal(identity?.affiliation, "Kearney");
  assert.equal(identity?.clientId, undefined);
  for (const project of model.workspaceProjects) {
    assert.equal(model.hasProjectAccess(project.id, model.signedInCollaboratorId, "project.view"), true, project.id);
    assert.equal(model.hasProjectAccess(project.id, model.signedInCollaboratorId, "agents.run"), true, project.id);
    assert.equal(model.hasProjectAccess(project.id, model.signedInCollaboratorId, "team.manage"), true, project.id);
  }
});

test("session factories reject missing parents and required governance fields", async () => {
  const model = await loadWorkspaceModel();
  assert.throws(() => model.createSessionClient({ ...clientDraft, name: " " }), /Client name is required/);
  assert.throws(() => model.createSessionProject(projectDraft("unknown-client")), /project draft was not created/);
  assert.throws(() => model.createConnectorDraft(model.workspaceProjects[0], "unknown-template", "Requester"), /no request was drafted/);
});

test("the onboarding modal is fully controlled and states its session-only boundaries", async () => {
  const source = await read("../app/WorkspaceOnboarding.tsx");
  assert.doesNotMatch(source, /useState|useReducer/);
  for (const prop of ["onModeChange", "onStepChange", "onClientDraftChange", "onProjectDraftChange", "onSubmitClient", "onSubmitProject"]) assert.match(source, new RegExp(prop));
  assert.match(source, /mode === "client" \? "New client" : "New project"/);
  assert.match(source, /SESSION DRAFT/);
  assert.match(source, /Save client draft/);
  assert.match(source, /Save project draft/);
  assert.doesNotMatch(source, /Onboard a client relationship|Create a client project/);
  assert.match(source, /No tenant, directory group, invitation, storage boundary, project, or source connection is created\./);
  assert.match(source, /0 data products · 0 mounted apps · 0 agents · 0 runs/);
  assert.match(source, /No database, dataset, decision case, access grant, app deployment, connector, agent, or solver run is provisioned\./);
  assert.match(source, /projectDraft\.operationsWorldIntake/);
  assert.match(source, /OPERATIONS WORLD · \{projectDraft\.operationsWorldIntake\.intent\.toUpperCase\(\)\} INTAKE/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
});
