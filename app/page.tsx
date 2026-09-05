import PlatformShell from "./PlatformShell";
import { resolveNavigation, type NavigationSearchParams } from "./navigation";
import { seedProjectActivity } from "./project-activity-model";
import { workspaceProjects } from "./workspace-model";

type HomeProps = {
  searchParams?: Promise<NavigationSearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const navigation = resolveNavigation(await searchParams, workspaceProjects, seedProjectActivity(workspaceProjects));

  return <PlatformShell initialView={navigation.view} initialScope={navigation.scope} initialCaseId={navigation.caseId} initialProjectId={navigation.projectId} initialProjectTab={navigation.projectTab} initialProjectApp={navigation.projectApp} initialSessionId={navigation.sessionId} initialRunId={navigation.runId} />;
}
