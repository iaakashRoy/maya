import { redirect } from "next/navigation";
import { workspaceProjects } from "../../workspace-model";
export default async function RetiredTable({ searchParams }: { searchParams?: Promise<{ project?: string }> }) {
  const params = await searchParams;
  const requested = params?.project === "tata" ? "tata-motors" : params?.project;
  const project = requested ? workspaceProjects.find((p) => p.id === requested || p.clientId === requested) : undefined;
  redirect(project ? `/?view=company&project=${encodeURIComponent(project.id)}&projectTab=data` : "/?view=company");
}
