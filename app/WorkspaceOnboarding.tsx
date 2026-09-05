"use client";

import type { FormEvent } from "react";
import type { SessionClientDraft, SessionProjectDraft, WorkspaceClient } from "./workspace-model";

export type WorkspaceOnboardingMode = "client" | "project";

export type WorkspaceOnboardingProps = {
  open: boolean;
  mode: WorkspaceOnboardingMode;
  step: number;
  clients: readonly WorkspaceClient[];
  clientDraft: SessionClientDraft;
  projectDraft: SessionProjectDraft;
  onModeChange: (mode: WorkspaceOnboardingMode) => void;
  onStepChange: (step: number) => void;
  onClientDraftChange: (draft: SessionClientDraft) => void;
  onProjectDraftChange: (draft: SessionProjectDraft) => void;
  onClose: () => void;
  onSubmitClient: (draft: SessionClientDraft) => void;
  onSubmitProject: (draft: SessionProjectDraft) => void;
};

const clientSteps = ["Identity", "Boundary", "Collaboration", "Review"] as const;
const projectSteps = ["Parent", "Decision brief", "Governance", "Review"] as const;
const hasText = (value: string | undefined) => Boolean(value?.trim());

export default function WorkspaceOnboarding({
  open,
  mode,
  step,
  clients,
  clientDraft,
  projectDraft,
  onModeChange,
  onStepChange,
  onClientDraftChange,
  onProjectDraftChange,
  onClose,
  onSubmitClient,
  onSubmitProject,
}: WorkspaceOnboardingProps) {
  if (!open) return null;

  const steps = mode === "client" ? clientSteps : projectSteps;
  const safeStep = Math.max(0, Math.min(step, steps.length - 1));
  const selectedClient = clients.find((client) => client.id === projectDraft.clientId);
  const clientComplete = [clientDraft.name, clientDraft.sector, clientDraft.classification, clientDraft.dataResidency, clientDraft.clientLead, clientDraft.kearneyLead].every(hasText);
  const projectComplete = Boolean(selectedClient) && [projectDraft.name, projectDraft.problem, projectDraft.outcome, projectDraft.owner, projectDraft.currency, projectDraft.regions].every(hasText);
  const stepComplete = mode === "client"
    ? safeStep === 0 ? [clientDraft.name, clientDraft.sector].every(hasText)
      : safeStep === 1 ? [clientDraft.classification, clientDraft.dataResidency].every(hasText)
        : safeStep === 2 ? [clientDraft.clientLead, clientDraft.kearneyLead].every(hasText) : clientComplete
    : safeStep === 0 ? Boolean(selectedClient && hasText(projectDraft.name))
      : safeStep === 1 ? [projectDraft.problem, projectDraft.outcome].every(hasText)
        : safeStep === 2 ? [projectDraft.owner, projectDraft.currency, projectDraft.regions].every(hasText) : projectComplete;

  const updateClient = (patch: Partial<SessionClientDraft>) => onClientDraftChange({ ...clientDraft, ...patch });
  const updateProject = (patch: Partial<SessionProjectDraft>) => onProjectDraftChange({ ...projectDraft, ...patch });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (safeStep < steps.length - 1) {
      if (stepComplete) onStepChange(safeStep + 1);
      return;
    }
    if (mode === "client" && clientComplete) onSubmitClient(clientDraft);
    if (mode === "project" && projectComplete) onSubmitProject(projectDraft);
  };

  return (
    <div className="builder-overlay workspace-onboarding">
      <button data-action-id="workspace-onboarding.dismiss" className="evidence-scrim" type="button" aria-label="Close workspace onboarding" onClick={onClose} />
      <form className="agent-builder" role="dialog" aria-modal="true" aria-label={mode === "client" ? "Onboard a client draft" : "Create a project draft"} onSubmit={submit}>
        <header>
          <div><p>WORKSPACE / SETUP</p><h2>{mode === "client" ? "New client" : "New project"}</h2></div>
          <span className="truth-chip">SESSION DRAFT</span>
          <button data-action-id="workspace-onboarding.close" type="button" aria-label="Close workspace onboarding" onClick={onClose}>×</button>
        </header>

        <div className="segmented-control">
          <button data-action-id="workspace-onboarding.mode.client" className={mode === "client" ? "active" : ""} type="button" aria-pressed={mode === "client"} onClick={() => onModeChange("client")}>Client</button>
          <button data-action-id="workspace-onboarding.mode.project" className={mode === "project" ? "active" : ""} type="button" aria-pressed={mode === "project"} onClick={() => onModeChange("project")}>Project</button>
        </div>

        <nav aria-label={`${mode} onboarding steps`}>
          {steps.map((item, index) => <button data-action-id={`workspace-onboarding.step.${mode}.${index + 1}`} disabled={index > safeStep} className={index === safeStep ? "active" : index < safeStep ? "done" : ""} type="button" key={item} onClick={() => onStepChange(index)}><span>{index < safeStep ? "✓" : index + 1}</span><b>{item}</b></button>)}
        </nav>

        <div className="builder-panel">
          {mode === "client" && safeStep === 0 && <>
            <p className="kicker">01 · CLIENT IDENTITY</p>
            <h3>Place the client inside one sector tower</h3>
            <label>Client name<input required value={clientDraft.name} onChange={(event) => updateClient({ name: event.target.value })} placeholder="Example organization" /></label>
            <label>Sector<input required value={clientDraft.sector} onChange={(event) => updateClient({ sector: event.target.value })} placeholder="Industrial Automation" /></label>
            <label>Optional sector key<input value={clientDraft.sectorId ?? ""} onChange={(event) => updateClient({ sectorId: event.target.value })} placeholder="Generated from sector when blank" /></label>
            <p>The saved object is an in-memory catalog draft. It does not establish a legal relationship or provision a tenant.</p>
          </>}

          {mode === "client" && safeStep === 1 && <>
            <p className="kicker">02 · DATA BOUNDARY INTENT</p>
            <h3>Record proposed handling labels before any source discussion</h3>
            <label>Classification<input required value={clientDraft.classification} onChange={(event) => updateClient({ classification: event.target.value })} placeholder="Client confidential" /></label>
            <label>Data-residency intent<input required value={clientDraft.dataResidency} onChange={(event) => updateClient({ dataResidency: event.target.value })} placeholder="EU policy partition" /></label>
            <p>These are proposed labels only. No storage boundary, encryption policy, row policy, identity group, or retention control is created.</p>
          </>}

          {mode === "client" && safeStep === 2 && <>
            <p className="kicker">03 · COLLABORATION INTENT</p>
            <h3>Name one client lead and one Kearney lead</h3>
            <label>Client lead<input required value={clientDraft.clientLead} onChange={(event) => updateClient({ clientLead: event.target.value })} placeholder="Client project owner" /></label>
            <label>Kearney lead<input required value={clientDraft.kearneyLead} onChange={(event) => updateClient({ kearneyLead: event.target.value })} placeholder="Kearney engagement lead" /></label>
            <p>Names become synthetic collaborator metadata. No account, invitation, directory membership, calendar status, or production access is created.</p>
          </>}

          {mode === "client" && safeStep === 3 && <>
            <p className="kicker">04 · REVIEW SESSION DRAFT</p>
            <h3>{clientDraft.name}</h3>
            <dl className="builder-review"><div><dt>Sector</dt><dd>{clientDraft.sector}</dd></div><div><dt>Classification</dt><dd>{clientDraft.classification}</dd></div><div><dt>Residency intent</dt><dd>{clientDraft.dataResidency}</dd></div><div><dt>Client lead</dt><dd>{clientDraft.clientLead}</dd></div><div><dt>Kearney lead</dt><dd>{clientDraft.kearneyLead}</dd></div><div><dt>Persistence</dt><dd>Current browser session only</dd></div></dl>
            <aside><b>NO PROVISIONING</b><p>Saving adds a client draft to browser memory. No tenant, directory group, invitation, storage boundary, project, or source connection is created.</p></aside>
          </>}

          {mode === "project" && safeStep === 0 && <>
            <p className="kicker">01 · CLIENT PARENT</p>
            <h3>Bind the project to exactly one client</h3>
            {projectDraft.operationsWorldIntake && <aside><b>OPERATIONS WORLD · {projectDraft.operationsWorldIntake.intent.toUpperCase()} INTAKE</b><p>{projectDraft.operationsWorldIntake.selectedLabel} · {projectDraft.operationsWorldIntake.selectedKind} {projectDraft.operationsWorldIntake.selectedId} · {projectDraft.operationsWorldIntake.frame} · {projectDraft.operationsWorldIntake.scenario}</p></aside>}
            <label>Client<select required value={projectDraft.clientId} onChange={(event) => { const client = clients.find((item) => item.id === event.target.value); updateProject({ clientId: event.target.value, owner: client?.clientLead ?? "" }); }}><option value="">Select client</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.name} · {client.sector}</option>)}</select></label>
            <label>Project name<input required value={projectDraft.name} onChange={(event) => updateProject({ name: event.target.value })} placeholder="Project name" /></label>
            <p>The selected client becomes the only parent. The model does not infer or substitute another client when the identifier is unavailable.</p>
          </>}

          {mode === "project" && safeStep === 1 && <>
            <p className="kicker">02 · DECISION BRIEF</p>
            <h3>Describe the problem and intended outcome</h3>
            <label>Problem statement<textarea required value={projectDraft.problem} onChange={(event) => updateProject({ problem: event.target.value })} placeholder="What connected supply-chain decision must the team address?" /></label>
            <label>Outcome statement<textarea required value={projectDraft.outcome} onChange={(event) => updateProject({ outcome: event.target.value })} placeholder="What governed outcome should the project pursue?" /></label>
            <p>This records narrative intent only. It does not formulate an optimization model or create a decision case.</p>
          </>}

          {mode === "project" && safeStep === 2 && <>
            <p className="kicker">03 · GOVERNANCE INTENT</p>
            <h3>Record ownership and proposed operating boundaries</h3>
            <label>Project owner<input required value={projectDraft.owner} onChange={(event) => updateProject({ owner: event.target.value })} placeholder={selectedClient?.clientLead || "Client project owner"} /></label>
            <label>Currency<input required value={projectDraft.currency} onChange={(event) => updateProject({ currency: event.target.value.toUpperCase() })} maxLength={3} placeholder="USD" /></label>
            <label>Region intent<input required value={projectDraft.regions} onChange={(event) => updateProject({ regions: event.target.value })} placeholder="EU · India" /></label>
            <label>Classification override<input value={projectDraft.classification ?? ""} onChange={(event) => updateProject({ classification: event.target.value })} placeholder={selectedClient?.classification || "Inherited from client draft"} /></label>
            <label>Residency override<input value={projectDraft.dataResidency ?? ""} onChange={(event) => updateProject({ dataResidency: event.target.value })} placeholder={selectedClient?.dataResidency || "Inherited from client draft"} /></label>
            <p>Overrides remain labels in the session model. They do not implement storage, residency, access, or retention controls.</p>
          </>}

          {mode === "project" && safeStep === 3 && <>
            <p className="kicker">04 · REVIEW ZERO-STATE PROJECT</p>
            <h3>{projectDraft.name}</h3>
            <dl className="builder-review"><div><dt>Client</dt><dd>{selectedClient?.name}</dd></div><div><dt>Problem</dt><dd>{projectDraft.problem}</dd></div><div><dt>Outcome</dt><dd>{projectDraft.outcome}</dd></div><div><dt>Owner</dt><dd>{projectDraft.owner}</dd></div><div><dt>Boundary intent</dt><dd>{projectDraft.classification?.trim() || selectedClient?.classification} · {projectDraft.dataResidency?.trim() || selectedClient?.dataResidency}</dd></div><div><dt>Initial footprint</dt><dd>0 data products · 0 mounted apps · 0 agents · 0 runs</dd></div>{projectDraft.operationsWorldIntake && <><div><dt>Intake</dt><dd>{projectDraft.operationsWorldIntake.intent} · {projectDraft.operationsWorldIntake.selectedLabel}</dd></div><div><dt>Network context</dt><dd>{projectDraft.operationsWorldIntake.frame} · {projectDraft.operationsWorldIntake.scenario}</dd></div></>}</dl>
            <aside><b>SESSION PROJECT SHELL ONLY</b><p>Saving adds a project setup draft under {selectedClient?.name}. No database, dataset, decision case, access grant, app deployment, connector, agent, or solver run is provisioned.</p></aside>
          </>}
        </div>

        <footer>
          <button data-action-id="workspace-onboarding.cancel" type="button" onClick={onClose}>Cancel</button>
          {safeStep > 0 && <button data-action-id="workspace-onboarding.back" type="button" onClick={() => onStepChange(safeStep - 1)}>Back</button>}
          <button data-action-id="workspace-onboarding.continue" type="submit" disabled={!stepComplete}>{safeStep === steps.length - 1 ? mode === "client" ? "Save client draft" : "Save project draft" : `Continue to ${steps[safeStep + 1]}`} →</button>
        </footer>
      </form>
    </div>
  );
}
