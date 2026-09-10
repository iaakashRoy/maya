import { compactRun, fingerprint, restoreSimulation, type SimulationRun } from "./simulation-model";

export const decisionEvidenceKey = (projectId: string) => `tanjnx.decision-evidence.v1.${projectId}`;
export const simulationDraftKey = (projectId: string) => `tanjnx.simulation.draft.v1.${projectId}`;
export type DecisionReview = { disposition: "reviewed" | "revise"; note: string; reviewer: string; reviewedAt: string; expiresAt: string; runId: string; checkedConstraints: string[] };
export type DecisionToolArtifact = { id: string; projectId: string; decisionId: string; attachedAt: string; run: SimulationRun; reviews: DecisionReview[] };
export function attachDecisionRun(records: DecisionToolArtifact[], projectId: string, decisionId: string, allowedDecisionIds: readonly string[], run: SimulationRun) {
  if (run.projectId !== projectId || !allowedDecisionIds.includes(decisionId)) throw new Error("The run and decision must belong to the selected project.");
  const id = `LINK-${fingerprint({ projectId, decisionId, runId: run.id })}`;
  if (records.some((record) => record.id === id)) return records;
  return [{ id, projectId, decisionId, attachedAt: new Date().toISOString(), run: compactRun(run), reviews: [] }, ...records].slice(0, 50);
}
export function restoreDecisionArtifacts(raw: string | null, projectId: string): DecisionToolArtifact[] {
  try {
    const records = JSON.parse(raw ?? "[]");
    if (!Array.isArray(records)) return [];
    return records.slice(0, 50).flatMap((record) => {
      if (!record || record.projectId !== projectId || typeof record.id !== "string" || typeof record.decisionId !== "string" || typeof record.attachedAt !== "string") return [];
      const run = restoreSimulation(JSON.stringify(record.run), projectId);
      if (!run) return [];
      const reviews = Array.isArray(record.reviews) ? record.reviews.filter((r: DecisionReview) => r && ["reviewed", "revise"].includes(r.disposition) && r.runId === run.id && typeof r.note === "string" && typeof r.reviewer === "string" && Number.isFinite(Date.parse(r.reviewedAt)) && Number.isFinite(Date.parse(r.expiresAt)) && Array.isArray(r.checkedConstraints) && r.checkedConstraints.every((c) => typeof c === "string")) : [];
      return [{ ...record, run, reviews }];
    });
  } catch { return []; }
}
export function decisionRunReadiness(record: DecisionToolArtifact, latest: SimulationRun | null, draftRaw: string | null) {
  let draftChanged = false;
  if (draftRaw) { try { const draft = JSON.parse(draftRaw); draftChanged = draft.projectId !== record.projectId || draft.valid !== true || draft.fingerprint !== fingerprint(record.run.input); } catch { draftChanged = true; } }
  const current = !!latest && latest.projectId === record.projectId && latest.id === record.run.id && !draftChanged;
  const reasons = [!current ? "Inputs changed or a newer run exists; rerun and attach the current result." : "", !record.run.targetPassed ? "P05 service is below the required floor." : "", !record.run.budgetPassed ? "The intervention budget is exceeded." : ""].filter(Boolean);
  return { current, reasons, numericReady: !reasons.length };
}
export function reviewDecisionRun(record: DecisionToolArtifact, latest: SimulationRun | null, draftRaw: string | null, disposition: DecisionReview["disposition"], note: string, reviewer: string, canReview: boolean, checkedConstraints: string[], requiredConstraints: readonly string[], now = new Date().toISOString()) {
  if (!canReview) throw new Error("Your project role cannot review decisions.");
  if (note.trim().length < 12 || !reviewer.trim()) throw new Error("Add a review rationale of at least 12 characters.");
  if (disposition === "reviewed") {
    const readiness = decisionRunReadiness(record, latest, draftRaw);
    if (!readiness.numericReady) throw new Error(readiness.reasons.join(" "));
    if (!requiredConstraints.length || requiredConstraints.some((constraint) => !checkedConstraints.includes(constraint))) throw new Error("Verify every domain constraint before marking the result reviewed.");
  }
  const review: DecisionReview = { disposition, note: note.trim(), reviewer, reviewedAt: now, expiresAt: new Date(Date.parse(now) + 86400000).toISOString(), runId: record.run.id, checkedConstraints: [...checkedConstraints] };
  return { ...record, reviews: [...record.reviews, review] };
}
