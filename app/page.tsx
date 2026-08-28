import PlatformShell from "./PlatformShell";
import { resolveNavigation, type NavigationSearchParams } from "./navigation";

type HomeProps = {
  searchParams?: Promise<NavigationSearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const navigation = resolveNavigation(await searchParams);

  return <PlatformShell initialView={navigation.view} initialScope={navigation.scope} initialCaseId={navigation.caseId} />;
}
