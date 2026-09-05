"use client";

import { useMemo, useState } from "react";
import type { HumanExpert, WorkspaceProject } from "./workspace-model";

/**
 * Deliberately structural: the normalized WorkspaceClient model can be passed
 * directly once it is exported, while today's denormalized fixtures need only
 * a small adapter.
 */
export type WorkspaceHomeClient = {
  id: string;
  sectorId: string;
  name?: string;
  label?: string;
  status?: string;
  classification?: string;
  dataResidency?: string;
  relationshipOwner?: string;
};

export type WorkspaceHomeCollaborator = Pick<
  HumanExpert,
  "id" | "name" | "initials" | "role" | "decisionRight" | "availability" | "activeWork"
> & {
  organization?: string;
  clientId?: string;
  projectId?: string;
  queueItem?: string;
  queueStatus?: string;
};

export type WorkspaceHomeProps = {
  projects: readonly WorkspaceProject[];
  clients: readonly WorkspaceHomeClient[];
  collaborators: readonly WorkspaceHomeCollaborator[];
  onOpenProject: (project: WorkspaceProject) => void;
  onOnboardClient: () => void;
  onCreateProject: (client?: WorkspaceHomeClient) => void;
  onOpenOperationsWorld: () => void;
};

type PortfolioClient = WorkspaceHomeClient & {
  displayName: string;
  projects: readonly WorkspaceProject[];
};

type PortfolioSector = {
  id: string;
  name: string;
  clients: readonly PortfolioClient[];
};

const healthLabel: Record<WorkspaceProject["health"], string> = {
  healthy: "On track",
  watch: "Watch",
  critical: "Needs attention",
};

const readableId = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const clientName = (client: WorkspaceHomeClient) => client.name ?? client.label ?? readableId(client.id);

function buildPortfolio(
  projects: readonly WorkspaceProject[],
  clients: readonly WorkspaceHomeClient[],
): readonly PortfolioSector[] {
  const clientRegistry = new Map<string, WorkspaceHomeClient>();
  clients.forEach((client) => clientRegistry.set(client.id, client));

  projects.forEach((project) => {
    if (!clientRegistry.has(project.clientId)) {
      clientRegistry.set(project.clientId, {
        id: project.clientId,
        sectorId: project.sectorId,
        name: project.client,
        classification: project.classification,
        dataResidency: project.dataResidency,
        relationshipOwner: project.owner,
      });
    }
  });

  const sectorIds = Array.from(new Set([
    ...clients.map((client) => client.sectorId),
    ...projects.map((project) => project.sectorId),
  ]));

  return sectorIds.map((sectorId) => {
    const sectorProjects = projects.filter((project) => project.sectorId === sectorId);
    const sectorName = sectorProjects[0]?.sector ?? readableId(sectorId);
    const sectorClients = Array.from(clientRegistry.values())
      .filter((client) => client.sectorId === sectorId)
      .map((client) => ({
        ...client,
        displayName: clientName(client),
        projects: sectorProjects.filter((project) => project.clientId === client.id),
      }));

    return { id: sectorId, name: sectorName, clients: sectorClients };
  });
}

export default function WorkspaceHome({
  projects,
  clients,
  collaborators,
  onOpenProject,
  onOnboardClient,
  onCreateProject,
  onOpenOperationsWorld,
}: WorkspaceHomeProps) {
  const [query, setQuery] = useState("");
  const portfolio = useMemo(() => buildPortfolio(projects, clients), [projects, clients]);
  const normalizedQuery = query.trim().toLowerCase();

  const visiblePortfolio: readonly PortfolioSector[] = useMemo(() => {
    if (!normalizedQuery) return portfolio;

    return portfolio.flatMap((sector) => {
        const sectorMatches = sector.name.toLowerCase().includes(normalizedQuery);
        const visibleClients: PortfolioClient[] = sector.clients.flatMap((client) => {
            const clientMatches = [client.displayName, client.status, client.classification, client.dataResidency]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(normalizedQuery));
            const visibleProjects = sectorMatches || clientMatches
              ? client.projects
              : client.projects.filter((project) =>
                [project.name, project.code, project.problem, project.owner, project.stage, project.regions]
                  .some((value) => value.toLowerCase().includes(normalizedQuery)),
              );

            return sectorMatches || clientMatches || visibleProjects.length > 0
              ? [{ ...client, projects: visibleProjects }]
              : [];
          });

        return visibleClients.length > 0 ? [{ ...sector, clients: visibleClients }] : [];
      });
  }, [normalizedQuery, portfolio]);

  const visibleProjectCount = visiblePortfolio.reduce(
    (total, sector) => total + sector.clients.reduce((sum, client) => sum + client.projects.length, 0),
    0,
  );
  const recentProjects = projects.slice(0, 5);

  return (
    <main className="workspace-home" data-page-heading tabIndex={-1}>
      <header className="workspace-home__hero">
        <div>
          <p className="workspace-home__eyebrow">CLIENT DELIVERY</p>
          <h1>Workspace</h1>
          <p className="workspace-home__summary">
            Manage clients, projects, and shared work.
          </p>
        </div>
        <div className="workspace-home__actions" aria-label="Workspace actions">
          <button data-action-id="workspace.home.onboard-client" type="button" onClick={onOnboardClient}>
            Onboard client
          </button>
          <button data-action-id="workspace.home.create-project" type="button" onClick={() => onCreateProject()}>
            Create project
          </button>
          <button data-action-id="workspace.home.operations-world" type="button" onClick={onOpenOperationsWorld}>
            Operations World <span aria-hidden="true">&#8594;</span>
          </button>
        </div>
      </header>

      <dl className="workspace-home__metrics" aria-label="Portfolio summary">
        <div><dt>Sectors</dt><dd>{portfolio.length}</dd><span>delivery towers</span></div>
        <div><dt>Clients</dt><dd>{portfolio.reduce((sum, sector) => sum + sector.clients.length, 0)}</dd><span>supplied records</span></div>
        <div><dt>Projects</dt><dd>{projects.length}</dd><span>governed workspaces</span></div>
        <div><dt>Collaborators</dt><dd>{collaborators.length}</dd><span>human specialists</span></div>
      </dl>

      <div className="workspace-home__layout">
        <section className="workspace-home__portfolio" aria-labelledby="portfolio-heading">
          <header className="workspace-home__section-header">
            <div>
              <p className="workspace-home__eyebrow">SECTOR / CLIENT / PROJECT</p>
              <h2 id="portfolio-heading">Clients and projects</h2>
              <span>Project tools, data, and decisions open within a selected project.</span>
            </div>
            <label className="workspace-home__search">
              <span aria-hidden="true">&#8981;</span>
              <span className="sr-only">Find a sector, client, project, owner, or region</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find sector, client, project"
                type="search"
              />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear portfolio search">Clear</button>}
            </label>
          </header>

          <p className="workspace-home__result-count" aria-live="polite">
            {visiblePortfolio.length} sectors · {visibleProjectCount} matching projects
          </p>

          {visiblePortfolio.length > 0 ? (
            <div className="workspace-home__sector-grid">
              {visiblePortfolio.map((sector, sectorIndex) => (
                <article className="workspace-home__sector" key={sector.id}>
                  <header>
                    <span>{String(sectorIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <small>SECTOR TOWER</small>
                      <h3>{sector.name}</h3>
                    </div>
                    <b>{sector.clients.length} {sector.clients.length === 1 ? "client" : "clients"}</b>
                  </header>

                  <div className="workspace-home__client-list">
                    {sector.clients.map((client) => (
                      <section className="workspace-home__client" key={client.id} aria-labelledby={`client-${client.id}`}>
                        <header>
                          <div>
                            <small>CLIENT</small>
                            <h4 id={`client-${client.id}`}>{client.displayName}</h4>
                          </div>
                          <button
                            data-action-id={`workspace.home.create-project.${client.id}`}
                            type="button"
                            onClick={() => onCreateProject(client)}
                            aria-label={`Create a project for ${client.displayName}`}
                          >
                            + Project
                          </button>
                        </header>

                        <div className="workspace-home__client-meta">
                          <span>{client.status ?? "Client record"}</span>
                          <span>{client.dataResidency ?? client.projects[0]?.dataResidency ?? "Residency to confirm"}</span>
                        </div>

                        <div className="workspace-home__project-list">
                          {client.projects.length > 0 ? client.projects.map((project) => (
                            <button
                              className="workspace-home__project"
                              data-action-id={`workspace.home.open-project.${project.id}`}
                              type="button"
                              key={project.id}
                              onClick={() => onOpenProject(project)}
                              aria-label={`Open ${project.name} for ${client.displayName}`}
                            >
                              <span className={`workspace-home__health workspace-home__health--${project.health}`}>
                                <i aria-hidden="true" />{healthLabel[project.health]}
                              </span>
                              <strong>{project.name}</strong>
                              <small>{project.code} · {project.stage}</small>
                              <p>{project.problem}</p>
                              <footer>
                                <span>{project.owner}</span>
                                <span>{project.regions}</span>
                                <b aria-hidden="true">&#8594;</b>
                              </footer>
                            </button>
                          )) : (
                            <div className="workspace-home__empty-client">
                              <span>No project supplied</span>
                              <button type="button" onClick={() => onCreateProject(client)}>Create the first project</button>
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="workspace-home__empty-search">
              <span>No portfolio records match “{query}”.</span>
              <button type="button" onClick={() => setQuery("")}>Clear search</button>
            </div>
          )}
        </section>

        <aside className="workspace-home__side" aria-label="Recent work and collaboration">
          <section className="workspace-home__side-panel" aria-labelledby="recent-work-heading">
            <header>
              <div><p className="workspace-home__eyebrow">RECENT</p><h2 id="recent-work-heading">Recent work</h2></div>
              <span>{recentProjects.length}</span>
            </header>
            <div>
              {recentProjects.map((project) => (
                <button
                  className="workspace-home__work-item"
                  data-action-id={`workspace.home.recent.${project.id}`}
                  type="button"
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                >
                  <i className={`workspace-home__state-dot workspace-home__state-dot--${project.health}`} aria-hidden="true" />
                  <span><small>{project.client} · {project.code}</small><b>{project.name}</b><em>{project.stage} · {project.owner}</em></span>
                  <strong aria-hidden="true">&#8594;</strong>
                </button>
              ))}
              {recentProjects.length === 0 && <p className="workspace-home__empty-copy">No project state was supplied.</p>}
            </div>
          </section>

          <section className="workspace-home__side-panel" aria-labelledby="collaboration-heading">
            <header>
              <div><p className="workspace-home__eyebrow">COLLABORATION</p><h2 id="collaboration-heading">Review queue</h2></div>
              <span>{collaborators.length}</span>
            </header>
            <div>
              {collaborators.slice(0, 5).map((collaborator) => {
                const boundProject = projects.find((project) => project.id === collaborator.projectId)
                  ?? projects.find((project) => project.owner === collaborator.name);
                const content = <>
                  <span className="workspace-home__avatar" aria-hidden="true">{collaborator.initials}</span>
                  <span>
                    <small>{collaborator.organization ?? collaborator.role}</small>
                    <b>{collaborator.queueItem ?? collaborator.decisionRight}</b>
                    <em>{collaborator.queueStatus ?? collaborator.availability} · {collaborator.activeWork} active</em>
                  </span>
                  {boundProject && <strong aria-hidden="true">&#8594;</strong>}
                </>;

                return boundProject ? (
                  <button
                    className="workspace-home__collaborator"
                    data-action-id={`workspace.home.collaboration.${collaborator.id}`}
                    type="button"
                    key={collaborator.id}
                    onClick={() => onOpenProject(boundProject)}
                    aria-label={`Open ${boundProject.name}, associated with ${collaborator.name}`}
                  >
                    {content}
                  </button>
                ) : (
                  <article className="workspace-home__collaborator" key={collaborator.id}>{content}</article>
                );
              })}
              {collaborators.length === 0 && <p className="workspace-home__empty-copy">No collaborator records were supplied.</p>}
            </div>
            <footer>Queue items reflect supplied fixture fields; this surface sends no messages or invitations.</footer>
          </section>
        </aside>
      </div>

      <style>{workspaceHomeStyles}</style>
    </main>
  );
}

const workspaceHomeStyles = `
.workspace-home {
  --home-ink: #142019;
  --home-muted: #647168;
  --home-line: #dfe3dc;
  --home-soft: #f3f5f0;
  --home-lime: #cfff2e;
  min-height: calc(100vh - var(--topbar-height, 0px) - var(--statusbar-height, 0px));
  padding: 28px clamp(18px, 3vw, 44px) 54px;
  color: var(--home-ink);
  background: #f7f8f4;
  font-family: var(--font-ui, Arial, sans-serif);
  outline: 0;
}
.workspace-home *, .workspace-home *::before, .workspace-home *::after { box-sizing: border-box; }
.workspace-home button, .workspace-home input { font: inherit; }
.workspace-home button:focus-visible, .workspace-home input:focus-visible { outline: 2px solid #18241d; outline-offset: 2px; }
.workspace-home__hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
.workspace-home__hero > div:first-child { max-width: 760px; }
.workspace-home__eyebrow { margin: 0; color: #718078; font: 760 9px/1.2 var(--font-code, monospace); letter-spacing: .1em; }
.workspace-home__hero h1 { margin: 5px 0 4px; max-width: 720px; font-size: 32px; font-weight: 600; line-height: 1.15; letter-spacing: -.032em; }
.workspace-home__summary { margin: 0; max-width: 680px; color: var(--home-muted); font-size: 12px; line-height: 1.55; }
.workspace-home__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.workspace-home__actions button { min-height: 38px; padding: 0 13px; color: var(--home-ink); background: #fff; border: 1px solid #cfd5ce; cursor: pointer; font-size: 10px; font-weight: 760; }
.workspace-home__actions button:first-child { background: var(--home-lime); border-color: var(--home-ink); box-shadow: 3px 3px 0 var(--home-ink); }
.workspace-home__actions button:last-child { color: #eef4ef; background: var(--home-ink); border-color: var(--home-ink); }
.workspace-home__actions button:hover { transform: translateY(-1px); }
.workspace-home__actions span { margin-left: 6px; }
.workspace-home__metrics { margin: 18px 0 12px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); background: #fff; border: 1px solid var(--home-line); }
.workspace-home__metrics > div { min-height: 78px; padding: 13px 15px; display: grid; grid-template-columns: 1fr auto; align-content: center; gap: 4px 10px; border-right: 1px solid var(--home-line); }
.workspace-home__metrics > div:last-child { border-right: 0; }
.workspace-home__metrics dt { color: #758078; font-size: 9px; }
.workspace-home__metrics dd { grid-column: 2; grid-row: 1 / 3; margin: 0; align-self: center; font-size: 27px; font-weight: 520; letter-spacing: -.04em; }
.workspace-home__metrics span { color: #9aa29d; font-size: 8px; }
.workspace-home__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(290px, 360px); gap: 12px; align-items: start; }
.workspace-home__portfolio, .workspace-home__side-panel { background: #fff; border: 1px solid var(--home-line); }
.workspace-home__section-header { min-height: 78px; padding: 14px 16px; display: flex; justify-content: space-between; gap: 20px; align-items: center; border-bottom: 1px solid var(--home-line); }
.workspace-home__section-header h2, .workspace-home__side-panel h2 { margin: 4px 0 0; font-size: 18px; font-weight: 620; letter-spacing: -.025em; }
.workspace-home__section-header > div > span { display: block; margin-top: 4px; color: var(--home-muted); font-size: 9px; }
.workspace-home__search { width: min(290px, 40%); min-height: 36px; padding: 0 9px; display: grid; grid-template-columns: auto 1fr auto; gap: 7px; align-items: center; background: var(--home-soft); border: 1px solid #daddd7; }
.workspace-home__search > span:first-child { color: #78837c; font-size: 16px; }
.workspace-home__search input { width: 100%; height: 33px; min-width: 0; background: transparent; border: 0; outline: 0; font-size: 9px; }
.workspace-home__search button { padding: 4px; color: #5d685f; background: transparent; border: 0; cursor: pointer; font-size: 8px; }
.workspace-home__result-count { margin: 0; padding: 8px 16px; color: #7c8780; background: #fafbf8; border-bottom: 1px solid var(--home-line); font: 700 8px/1.2 var(--font-code, monospace); }
.workspace-home__sector-grid { padding: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.workspace-home__sector { min-width: 0; background: #fafbf8; border: 1px solid var(--home-line); }
.workspace-home__sector > header { min-height: 61px; padding: 10px 11px; display: grid; grid-template-columns: 31px minmax(0, 1fr) auto; gap: 9px; align-items: center; border-bottom: 1px solid var(--home-line); }
.workspace-home__sector > header > span { width: 29px; height: 29px; display: grid; place-items: center; color: #172019; background: var(--home-lime); font: 820 8px/1 var(--font-code, monospace); }
.workspace-home__sector h3, .workspace-home__sector h4 { margin: 3px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.workspace-home__sector h3 { font-size: 13px; }
.workspace-home__sector h4 { font-size: 12px; }
.workspace-home__sector small { color: #849087; font: 710 7px/1.2 var(--font-code, monospace); letter-spacing: .08em; }
.workspace-home__sector > header > b { color: #6f7b73; font-size: 8px; font-weight: 650; }
.workspace-home__client-list { display: grid; }
.workspace-home__client { min-width: 0; padding: 11px; border-bottom: 1px solid var(--home-line); }
.workspace-home__client:last-child { border-bottom: 0; }
.workspace-home__client > header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.workspace-home__client > header button, .workspace-home__empty-client button { min-height: 28px; padding: 0 8px; color: #26342b; background: #fff; border: 1px solid #cfd5ce; cursor: pointer; font-size: 8px; font-weight: 720; }
.workspace-home__client-meta { margin: 8px 0; display: flex; flex-wrap: wrap; gap: 5px; }
.workspace-home__client-meta span { padding: 4px 6px; color: #667269; background: #eef1ec; font-size: 7px; }
.workspace-home__project-list { display: grid; gap: 6px; }
.workspace-home__project { width: 100%; min-height: 142px; padding: 11px; display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; color: inherit; background: #fff; border: 1px solid #dde1db; text-align: left; cursor: pointer; }
.workspace-home__project:hover { border-color: #9eaa9f; box-shadow: inset 3px 0 var(--home-lime); }
.workspace-home__project > strong, .workspace-home__project > small, .workspace-home__project > p { grid-column: 1 / -1; }
.workspace-home__project > strong { margin-top: 3px; font-size: 13px; }
.workspace-home__project > small { color: #758178; font: 680 8px/1.2 var(--font-code, monospace); }
.workspace-home__project > p { margin: 4px 0; color: #5e6a61; font-size: 9px; line-height: 1.45; }
.workspace-home__project > footer { grid-column: 1 / -1; margin-top: auto; padding-top: 7px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; color: #828c85; border-top: 1px solid #edf0eb; font-size: 8px; }
.workspace-home__project > footer span:nth-child(2) { overflow: hidden; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.workspace-home__project > footer b { color: #1e2b22; }
.workspace-home__health { justify-self: end; display: inline-flex; align-items: center; gap: 5px; color: #667269; font-size: 7px; }
.workspace-home__health i, .workspace-home__state-dot { width: 7px; height: 7px; display: block; background: #69bd86; border-radius: 50%; }
.workspace-home__health--watch i, .workspace-home__state-dot--watch { background: #e2ae32; }
.workspace-home__health--critical i, .workspace-home__state-dot--critical { background: #ed6b59; }
.workspace-home__empty-client { min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #7c8780; font-size: 9px; }
.workspace-home__empty-search { min-height: 250px; display: grid; place-content: center; justify-items: center; gap: 12px; color: #68746b; font-size: 11px; }
.workspace-home__empty-search button { min-height: 32px; padding: 0 10px; background: #fff; border: 1px solid #bec5be; cursor: pointer; font-size: 9px; }
.workspace-home__side { display: grid; gap: 12px; }
.workspace-home__side-panel > header { min-height: 69px; padding: 13px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--home-line); }
.workspace-home__side-panel > header > span { min-width: 24px; height: 24px; padding: 0 6px; display: grid; place-items: center; color: #172019; background: var(--home-lime); font: 800 8px/1 var(--font-code, monospace); }
.workspace-home__work-item, .workspace-home__collaborator { width: 100%; min-height: 68px; padding: 10px 12px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 9px; align-items: center; color: inherit; background: #fff; border: 0; border-bottom: 1px solid var(--home-line); text-align: left; }
button.workspace-home__work-item, button.workspace-home__collaborator { cursor: pointer; }
button.workspace-home__work-item:hover, button.workspace-home__collaborator:hover { background: #f7f9f3; box-shadow: inset 3px 0 var(--home-lime); }
.workspace-home__work-item > span, .workspace-home__collaborator > span:nth-child(2) { min-width: 0; display: grid; gap: 4px; }
.workspace-home__work-item small, .workspace-home__collaborator small { color: #7b867e; font-size: 7px; }
.workspace-home__work-item b, .workspace-home__collaborator b { overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.workspace-home__work-item em, .workspace-home__collaborator em { color: #89928c; font-size: 8px; font-style: normal; }
.workspace-home__work-item > strong, .workspace-home__collaborator > strong { color: #59665e; font-size: 11px; }
.workspace-home__state-dot { flex: 0 0 auto; }
.workspace-home__avatar { width: 30px; height: 30px; display: grid!important; place-items: center; color: #172019; background: #e9eddf; border: 1px solid #d6dbd2; font: 790 8px/1 var(--font-code, monospace); }
.workspace-home__side-panel > footer { padding: 9px 12px; color: #7f8a83; background: #fafbf8; font-size: 8px; line-height: 1.4; }
.workspace-home__empty-copy { margin: 0; padding: 20px 12px; color: #7c8780; font-size: 9px; }
@media (max-width: 1100px) {
  .workspace-home__layout { grid-template-columns: 1fr; }
  .workspace-home__side { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .workspace-home { padding: 20px 14px 42px; }
  .workspace-home__hero, .workspace-home__section-header { align-items: stretch; flex-direction: column; }
  .workspace-home__actions { justify-content: flex-start; }
  .workspace-home__metrics, .workspace-home__sector-grid, .workspace-home__side { grid-template-columns: 1fr 1fr; }
  .workspace-home__metrics > div:nth-child(2) { border-right: 0; }
  .workspace-home__metrics > div:nth-child(-n+2) { border-bottom: 1px solid var(--home-line); }
  .workspace-home__search { width: 100%; }
}
@media (max-width: 520px) {
  .workspace-home__actions { display: grid; grid-template-columns: 1fr; }
  .workspace-home__metrics, .workspace-home__sector-grid, .workspace-home__side { grid-template-columns: 1fr; }
  .workspace-home__metrics > div { border-right: 0; border-bottom: 1px solid var(--home-line); }
  .workspace-home__metrics > div:last-child { border-bottom: 0; }
}
`;
