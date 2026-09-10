"use client";
import { useMemo, useState } from "react";
import { statisticalProfilesFor, statisticalRowsFor } from "./statistical-model";
import { describeColumn, empiricalTransitions, processCapability } from "./statistical-analysis";
import { fingerprint } from "./simulation-model";
import { downloadJson, numberLabel } from "./SimulationStudio";
import type { EvidenceReceipt, WorkspaceProject } from "./workspace-model";
import "./analysis-workbench.css";

const methods = ["Descriptive statistics", "State transitions", "Process performance"] as const;
type Result = { basis: string; method: string; summary: ReturnType<typeof describeColumn>; transitions: ReturnType<typeof empiricalTransitions>; performance: ReturnType<typeof processCapability> | null; createdAt: string };
export default function StatisticalStudio({ project, onOutcome }: { project: WorkspaceProject; onEvidence: (receipt: EvidenceReceipt) => void; onOutcome: (title: string, detail: string, artifact?: string) => void }) {
  const tables = useMemo(() => statisticalProfilesFor(project), [project]);
  const [tableId, setTableId] = useState(tables[0]?.id ?? "");
  const [columnId, setColumnId] = useState("");
  const [method, setMethod] = useState<string>(methods[0]);
  const [lower, setLower] = useState(""); const [upper, setUpper] = useState("");
  const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState("");
  const table = tables.find((t) => t.id === tableId) ?? tables[0];
  const rows = useMemo(() => table ? statisticalRowsFor(table, 96) : [], [table]);
  const column = table?.columns.find((c) => c.id === columnId) ?? table?.columns[0];
  if (!table || !column) return <div className="inline-empty">This project has no statistical table. Add its data contract in Data first.</div>;
  const basis = fingerprint({ projectId: project.id, tableId: table.id, column: column.id, rows, method, lower, upper });
  const current = result?.basis === basis;
  const run = () => {
    try {
      const summary = describeColumn(rows, column.id);
      const performance = method === "Process performance" ? processCapability(rows, column.id, lower.trim() ? Number(lower) : NaN, upper.trim() ? Number(upper) : NaN) : null;
      setResult({ basis, method, summary, transitions: empiricalTransitions(rows, column.id), performance, createdAt: new Date().toISOString() }); setError("");
      onOutcome("Statistics calculated", `${method} calculated from ${summary.n} materialized sample rows of ${table.name}, ${column.id}. No fitted distribution or live source is claimed.`, `STAT-${basis}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to calculate this sample."); }
  };
  const fmt = (v: number | null) => v === null ? "—" : numberLabel(v, 2);
  return <div className="analysis-workbench statistical-studio">
    <div className="os-command"><label>Dataset<select value={table.id} onChange={(e) => { setTableId(e.target.value); setColumnId(""); }}>{tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Variable<select value={column.id} onChange={(e) => setColumnId(e.target.value)}>{table.columns.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.unit}</option>)}</select></label><label>Method<select value={method} onChange={(e) => setMethod(e.target.value)}>{methods.map((m) => <option key={m}>{m}</option>)}</select></label><button data-action-id="statistics.run" className="os-primary" onClick={run}>Run analysis</button><a href={`/table?project=${project.id}&table=${table.id}`} target="_blank" rel="noreferrer">Full table + filters ↗</a></div>
    <p className="os-help">{rows.length} deterministic sample rows · {column.unit} · {table.rows} registry rows are not loaded. All results below describe the visible sample only.</p>
    {method === "Process performance" && <div className="os-command"><label>Lower specification limit<input type="number" value={lower} onChange={(e) => setLower(e.target.value)} /></label><label>Upper specification limit<input type="number" value={upper} onChange={(e) => setUpper(e.target.value)} /></label><span className="os-help">Pp / Ppk use overall sample SD, not within-subgroup Cp / Cpk.</span></div>}
    {error && <p role="alert" className="os-notice warning">{error}</p>}
    {result && !current && <p role="status" className="os-notice warning">Selection or limits changed. Rerun before using the previous result.</p>}
    {result ? <><div className="os-metrics">{[["Analyzed values", String(result.summary.n)], ["Mean", fmt(result.summary.mean)], ["Sample SD · n − 1", fmt(result.summary.sd)], ["P05–P95 · central 90%", `${fmt(result.summary.p05)}–${fmt(result.summary.p95)}`]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <div className="os-results-grid"><section className="os-panel"><header><h3>Empirical distribution</h3><small>No parametric fit</small></header><div className="os-histogram" role="img" aria-label={`Histogram of ${result.summary.n} sampled values`}>{result.summary.bins.map((bin, i) => <div key={i}><i style={{ height: `${bin.count / Math.max(1, ...result.summary.bins.map((b) => b.count)) * 100}%` }} title={`${fmt(bin.from)}–${fmt(bin.to)}: ${bin.count} values`} /><small>{fmt(bin.from)}</small></div>)}</div><p className="os-help">Missing / nonnumeric: {result.summary.missing}. This is an empirical range, not a predictive interval.</p></section>
      <section className="os-panel"><header><h3>{result.method === "State transitions" ? "Observed transitions" : result.method === "Process performance" ? "Specification performance" : "Sample diagnostics"}</h3></header>{result.method === "State transitions" ? <><table className="os-table"><thead><tr><th>From / to</th>{["Low", "Typical", "High"].map((s) => <th key={s}>{s}</th>)}</tr></thead><tbody>{result.transitions.probabilities.map((row, i) => <tr key={i}><th>{["Low", "Typical", "High"][i]}</th>{row.map((v, j) => <td key={j} title={`${result.transitions.counts[i][j]} observed transitions`}>{v === null ? "No observations" : `${fmt(v * 100)}%`}</td>)}</tr>)}</tbody></table><p className="os-help">{result.transitions.transitions} event-time-ordered transitions. Low &lt; {fmt(result.transitions.lower)}, high &gt; {fmt(result.transitions.upper)} (mean ± SD). These sample-derived states are not calibrated disruption probabilities.</p></> : result.performance ? <><p>Pp: <b>{fmt(result.performance.pp)}</b> · Ppk: <b>{fmt(result.performance.ppk)}</b></p><p>{result.performance.outside} sampled values outside specification.</p><p className="os-help">Requires stable-process and distribution review. This diagnostic is not product release authorization.</p></> : <table className="os-table"><tbody>{[["Minimum", result.summary.min], ["Median", result.summary.p50], ["Maximum", result.summary.max]].map(([label, value]) => <tr key={String(label)}><th>{label}</th><td>{fmt(value as number | null)}</td></tr>)}</tbody></table>}<button disabled={!current} onClick={() => downloadJson({ projectId: project.id, tableId: table.id, variable: column.id, unit: column.unit, lower, upper, rows, ...result, boundary: "Calculated from deterministic sample rows; no live database or distribution-fit engine." }, `STAT-${basis}.json`)}>Export analysis + input rows</button></section></div></> : <p className="os-help">Select a variable and run an analysis. The histogram, statistics and transition counts will be calculated from the same sample shown in the full table.</p>}
    <details className="os-panel"><summary>Sample head · first 6 of {rows.length} rows</summary><div className="os-table-scroll"><table className="os-table"><thead><tr><th>Record</th><th>Event time</th><th>{column.id} · {column.unit}</th></tr></thead><tbody>{rows.slice(0,6).map((row) => <tr key={String(row.record_id)}><td>{row.record_id}</td><td>{row.event_time}</td><td>{row[column.id]}</td></tr>)}</tbody></table></div></details>
  </div>;
}
