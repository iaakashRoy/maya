import type { Metadata } from "next";
import DecisionJourney from "./DecisionJourney";
import { caseStudies } from "./journey-model";

export const metadata: Metadata = {
  title: "Decision Journey · tanjnx",
  description: "A connected, browser-only supply-chain decision rehearsal from governed data to measured outcomes.",
};

type DecisionJourneyPageProps = {
  searchParams?: Promise<{ client?: string | string[] }>;
};

export default async function DecisionJourneyPage({ searchParams }: DecisionJourneyPageProps) {
  const requested = (await searchParams)?.client;
  const client = Array.isArray(requested) ? requested[0] : requested;
  const initialCaseId = caseStudies.some((item) => item.id === client) ? client : "apple";

  return <DecisionJourney initialCaseId={initialCaseId} />;
}
