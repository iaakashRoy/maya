import { statisticalProfilesFor } from "../statistical-model";
import { workspaceProjects } from "../workspace-model";
import TableExplorerClient from "./TableExplorerClient";

type TablePageProps = {
  searchParams?: Promise<{ project?: string; table?: string }>;
};

export default async function TablePage({ searchParams }: TablePageProps) {
  const params = await searchParams;
  const project = workspaceProjects.find((item) => item.id === params?.project) ?? workspaceProjects[0];
  const profiles = statisticalProfilesFor(project);
  const table = profiles.find((item) => item.id === params?.table || item.tableNodeId === params?.table) ?? profiles[0];
  return <TableExplorerClient project={project} table={table} />;
}
