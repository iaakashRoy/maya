"use client";
import { useEffect, useMemo, useState } from "react";
import { decisionEvidenceKey, decisionRunReadiness, restoreDecisionArtifacts, reviewDecisionRun, simulationDraftKey, type DecisionToolArtifact } from "./decision-evidence-model";
import { compactRun, restoreSimulation, simulationStorageKey } from "./simulation-model";
import { getOsCaseEvidence } from "./os-case-evidence";
import { downloadJson, moneyLabel, numberLabel } from "./SimulationStudio";
import { useAnalysisStorage, writeAnalysisStorage } from "./useAnalysisStorage";
import "./analysis-workbench.css";

export default function DecisionToolEvidence({ projectId, decisionId, canReview, reviewer }: { projectId: string; decisionId: string; canReview: boolean; reviewer: string }) {
  const raw = useAnalysisStorage(decisionEvidenceKey(projectId));
  const latestRaw = useAnalysisStorage(simulationStorageKey(projectId));
  const draftRaw = useAnalysisStorage(simulationDraftKey(projectId));
  const records = useMemo(() => restoreDecisionArtifacts(raw, projectId), [raw, projectId]);
  const latest = useMemo(() => restoreSimulation(latestRaw, projectId), [latestRaw, projectId]);
  const attached = records.filter((record) => record.decisionId === decisionId);
  const constraints = getOsCaseEvidence(projectId)?.hardConstraints ?? [];
  return <section id="decision-calculated-evidence" tabIndex={-1} className="analysis-workbench decision-tool-evidence" aria-label={`Calculated evidence for ${decisionId}`}>
    <header><h3>Calculated tool evidence</h3><small>{attached.length} attached</small></header>
    {!attached.length && <p className="os-help">No calculated result is attached to this decision. Run Simulation and attach its exact result here; scenario values above remain illustrative.</p>}
    <a href={`/?view=company&project=${projectId}&projectTab=apps&projectApp=simulation`}>Open Simulation ↗</a>
    {attached.map((record) => <ReviewArtifact key={`${record.id}-${record.reviews.length}`} record={record} records={records} latest={latest} draftRaw={draftRaw} required={constraints} canReview={canReview} reviewer={reviewer} />)}
  </section>;
}
function ReviewArtifact({ record, records, latest, draftRaw, required, canReview, reviewer }: { record: DecisionToolArtifact; records: DecisionToolArtifact[]; latest: ReturnType<typeof restoreSimulation>; draftRaw: string | null; required: readonly string[]; canReview: boolean; reviewer: string }) {
  const [note, setNote] = useState(""); const [checked, setChecked] = useState<string[]>([]); const [error, setError] = useState("");
  const readiness = decisionRunReadiness(record, latest, draftRaw);
  const last = record.reviews.at(-1);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const interval = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(interval); }, []);
  const reviewed = last?.disposition === "reviewed" && readiness.numericReady && required.length > 0 && required.every((constraint) => last.checkedConstraints.includes(constraint)) && Date.parse(last.expiresAt) > now;
  const submit = (disposition: "reviewed" | "revise") => {
    try {
      const updated = reviewDecisionRun(record, latest, draftRaw, disposition, note, reviewer, canReview, checked, required);
      writeAnalysisStorage(decisionEvidenceKey(record.projectId), records.map((item) => item.id === record.id ? { ...updated, run: compactRun(updated.run) } : { ...item, run: compactRun(item.run) })); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Review could not be saved."); }
  };
  return <article>
    <b>{record.run.id}</b><p className="os-help">{readiness.current ? reviewed ? "Reviewed locally · expires in 24h" : "Current calculated result" : "Stale result"} · {record.run.input.paths} paths · seed {record.run.input.seed}</p>
    <dl><dt>P05 service</dt><dd>{numberLabel(record.run.response.service.p05)}% / {record.run.input.serviceTargetPct}% floor</dd><dt>Net loss avoided</dt><dd>{moneyLabel(record.run.protectedLoss)}</dd><dt>Tail loss · CVaR95</dt><dd>{moneyLabel(record.run.response.cvar95)}</dd><dt>Budget gate</dt><dd>{record.run.budgetPassed ? "Pass" : "Fail"}</dd></dl>
    {readiness.reasons.length > 0 && <p className="os-notice warning">{readiness.reasons.join(" ")}</p>}
    <div className="review-actions"><a href={`/?view=company&project=${record.projectId}&projectTab=apps&projectApp=simulation&simulationRun=${record.run.id}`}>Inspect inputs / rerun ↗</a><button onClick={() => downloadJson({ ...record, boundary: "Local decision review only. No operational approval or release." }, `${record.id}.json`)}>Export evidence</button></div>
    <details><summary>Review this result</summary><p className="os-help">Review is bound to this exact input and run. It does not authorize operational release.</p>{required.map((constraint) => <label className="review-constraint" key={constraint}><input type="checkbox" checked={checked.includes(constraint)} onChange={(e) => setChecked((items) => e.target.checked ? [...items, constraint] : items.filter((item) => item !== constraint))} />{constraint}</label>)}<label>Review rationale<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Evidence checked, unresolved risks and required changes" /></label>{!canReview && <p className="os-help">Your project role cannot review decisions.</p>}{error && <p role="alert" className="os-notice warning">{error}</p>}<div className="review-actions"><button disabled={!canReview || note.trim().length < 12} onClick={() => submit("revise")}>Request revision</button><button disabled={!canReview || !readiness.numericReady || note.trim().length < 12 || !required.length || required.some((c) => !checked.includes(c))} onClick={() => submit("reviewed")}>Mark reviewed locally</button></div></details>
    {last && <details><summary>{record.reviews.length} review records · {last.disposition}</summary>{record.reviews.map((review, i) => <p className="os-help" key={i}><b>{review.reviewer} · {review.disposition}</b><br />{review.note}<br />{review.reviewedAt} · expires {review.expiresAt}</p>)}</details>}
  </article>;
}
