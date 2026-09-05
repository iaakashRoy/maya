import type { WorkspaceProject } from "./workspace-model";

export type WorkspacePortfolioClientInput = {
  id: string;
  sectorId: string;
  name?: string;
  label?: string;
  status?: string;
  classification?: string;
  dataResidency?: string;
  relationshipOwner?: string;
};

export type WorkspacePortfolioClient = WorkspacePortfolioClientInput & {
  displayName: string;
  projects: readonly WorkspaceProject[];
};

export type WorkspacePortfolioTower = {
  id: string;
  name: string;
  clients: readonly WorkspacePortfolioClient[];
};

const readableId = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const clientName = (client: WorkspacePortfolioClientInput) => client.name ?? client.label ?? readableId(client.id);

/**
 * Builds the tower view from project ownership, not a client's preferred
 * tower. A client can therefore appear in every tower where it has work while
 * every project leaf remains in exactly one client/tower branch.
 */
export function buildWorkspacePortfolio(
  projects: readonly WorkspaceProject[],
  clients: readonly WorkspacePortfolioClientInput[],
): readonly WorkspacePortfolioTower[] {
  const clientRegistry = new Map<string, WorkspacePortfolioClientInput>();
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

  const towerIds = Array.from(new Set([
    ...clients.map((client) => client.sectorId),
    ...projects.map((project) => project.sectorId),
  ]));

  return towerIds.map((towerId) => {
    const towerProjects = projects.filter((project) => project.sectorId === towerId);
    const towerClientIds = Array.from(new Set([
      ...clients.filter((client) => client.sectorId === towerId).map((client) => client.id),
      ...towerProjects.map((project) => project.clientId),
    ]));
    const towerClients = towerClientIds.flatMap((clientId) => {
      const client = clientRegistry.get(clientId);
      if (!client) return [];
      return [{
        ...client,
        displayName: clientName(client),
        projects: towerProjects.filter((project) => project.clientId === clientId),
      }];
    });

    return {
      id: towerId,
      name: towerProjects[0]?.sector ?? readableId(towerId),
      clients: towerClients,
    };
  });
}
