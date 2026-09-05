import type { WorkspaceProject } from "./workspace-model";

export type ProjectPathMode = "tower" | "client";
export type ProjectPathKind = ProjectPathMode;

export type ProjectPathBranch = {
  id: string;
  key: string;
  kind: ProjectPathKind;
  label: string;
  projects: readonly WorkspaceProject[];
};

export type ProjectPathGroup = {
  id: string;
  key: string;
  kind: ProjectPathKind;
  label: string;
  branches: readonly ProjectPathBranch[];
  projects: readonly WorkspaceProject[];
};

const unique = <T,>(items: readonly T[]) => Array.from(new Set(items));
const byLabel = <T extends { label: string }>(left: T, right: T) => left.label.localeCompare(right.label);
const byProjectName = (left: WorkspaceProject, right: WorkspaceProject) => left.name.localeCompare(right.name);

export function groupProjectsByPath(projects: readonly WorkspaceProject[], mode: ProjectPathMode): readonly ProjectPathGroup[] {
  const rootKind: ProjectPathKind = mode;
  const branchKind: ProjectPathKind = mode === "tower" ? "client" : "tower";
  const rootIds = unique(projects.map((project) => mode === "tower" ? project.sectorId : project.clientId));

  return rootIds.map((rootId) => {
    const rootProjects = projects.filter((project) => (mode === "tower" ? project.sectorId : project.clientId) === rootId);
    const branchIds = unique(rootProjects.map((project) => mode === "tower" ? project.clientId : project.sectorId));
    const branches = branchIds.map((branchId) => {
      const branchProjects = rootProjects
        .filter((project) => mode === "tower"
          ? project.sectorId === rootId && project.clientId === branchId
          : project.clientId === rootId && project.sectorId === branchId)
        .sort(byProjectName);
      const sample = branchProjects[0];
      return {
        id: branchId,
        key: `${rootKind}:${rootId}::${branchKind}:${branchId}`,
        kind: branchKind,
        label: mode === "tower" ? sample?.client ?? branchId : sample?.sector ?? branchId,
        projects: branchProjects,
      } satisfies ProjectPathBranch;
    }).sort(byLabel);
    const sample = rootProjects[0];
    return {
      id: rootId,
      key: `${rootKind}:${rootId}`,
      kind: rootKind,
      label: mode === "tower" ? sample?.sector ?? rootId : sample?.client ?? rootId,
      branches,
      projects: rootProjects.sort(byProjectName),
    } satisfies ProjectPathGroup;
  }).sort(byLabel);
}

export function projectPathKeys(project: WorkspaceProject, mode: ProjectPathMode) {
  const rootId = mode === "tower" ? project.sectorId : project.clientId;
  const branchId = mode === "tower" ? project.clientId : project.sectorId;
  const rootKind: ProjectPathKind = mode;
  const branchKind: ProjectPathKind = mode === "tower" ? "client" : "tower";
  return {
    root: `${rootKind}:${rootId}`,
    branch: `${rootKind}:${rootId}::${branchKind}:${branchId}`,
  } as const;
}

export function projectPathSegments(project: WorkspaceProject, mode: ProjectPathMode) {
  return mode === "tower"
    ? [
      { kind: "tower" as const, id: project.sectorId, label: project.sector },
      { kind: "client" as const, id: project.clientId, label: project.client },
      { kind: "project" as const, id: project.id, label: project.name },
    ]
    : [
      { kind: "client" as const, id: project.clientId, label: project.client },
      { kind: "tower" as const, id: project.sectorId, label: project.sector },
      { kind: "project" as const, id: project.id, label: project.name },
    ];
}
