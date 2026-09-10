import { redirect } from "next/navigation";
import { workspaceProjects } from "../workspace-model";
export default async function RetiredJourney({ searchParams }: { searchParams?: Promise<{ client?: string; project?: string }> }) {
  const params = await searchParams;
  const clientId = params?.client === "tata" ? "tata-motors" : params?.client;
  const project = params?.project ? workspaceProjects.find((p) => p.id === params.project) : clientId ? workspaceProjects.find((p) => p.clientId === clientId) : undefined;
  redirect(project ? `/?view=company&project=${encodeURIComponent(project.id)}&projectTab=decisions` : "/?view=company");
}
