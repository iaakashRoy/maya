"use client";

import { useEffect, useMemo, useState } from "react";
import { getOsCaseEvidence } from "./os-case-evidence";
import { compactRun, fingerprint, restoreSimulation, runSimulation, simulationStorageKey, validateSimulation, type SimulationInput, type SimulationRun } from "./simulation-model";
import "./agent-os.css";

export function simulationDefaults(projectId: string): SimulationInput | null {
  const evidence = getOsCaseEvidence(projectId);
  if (!evidence) return null;
  const s = evidence.scenario;
  return { projectId, unit: s.unit, horizonWeeks: s.horizonWeeks, demandPerWeek: s.demandPerWeek, capacityPerWeek: s.capacityPerWeek, qualifiedAlternatePerWeek: s.qualifiedAlternatePerWeek, inventoryUnits: s.inventoryUnits, baseLeadDays: s.baseLeadDays, capacityLossPct: s.capacityLossPct, demandSurgePct: s.demandSurgePct, qualityYieldPct: s.qualityYieldPct, expeditePremiumPerUnit: s.expeditePremiumPerUnit, unitMargin: s.unitMargin, regimes: structuredClone(s.regimes), paths: 512, seed: 20260909, demandVariationPct: 18, alternateAllocationPct: 100, expedite: false, serviceTargetPct: s.serviceFloorPct, qualificationWeek: s.qualificationWeek, budget: s.budget, openingPipelineUnits: s.demandPerWeek * Math.max(1, Math.ceil(s.baseLeadDays / 7)) };
}
export const simulationHistoryKey = (projectId: string) => `tanjnx.simulation.history.v1.${projectId}`;
export function persistSimulationRun(run: SimulationRun) {
  let previous: SimulationRun[] = [];
  try { const raw = JSON.parse(localStorage.getItem(simulationHistoryKey(run.projectId)) ?? "[]"); if (Array.isArray(raw)) previous = raw.filter((item) => item && item.projectId === run.projectId && item.id !== run.id).slice(0, 7); } catch { /* Start a clean archive when damaged. */ }
  localStorage.setItem(simulationHistoryKey(run.projectId), JSON.stringify([compactRun(run), ...previous]));
  localStorage.setItem(simulationStorageKey(run.projectId), JSON.stringify(compactRun(run)));
}
function simulationHistory(projectId: string): SimulationRun[] {
  try { const raw = JSON.parse(localStorage.getItem(simulationHistoryKey(projectId)) ?? "[]"); return Array.isArray(raw) ? raw.slice(0, 8).map((item) => restoreSimulation(JSON.stringify(item), projectId)).filter((item): item is SimulationRun => item !== null) : []; } catch { return []; }
}
export const numberLabel = (value: number, decimals = 1) => new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value);
export const moneyLabel = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(value);
export function downloadJson(value: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function SimulationResults({ run }: { run: SimulationRun }) {
  const [path, setPath] = useState(0);
  const [details, setDetails] = useState(false);
  const maximum = Math.max(...run.response.histogram.map((bin) => bin.count), 1);
  return <>
    <div className="os-metrics">
      <div><small>Downside service · P05</small><strong>{numberLabel(run.response.service.p05)}%</strong><span>Baseline {numberLabel(run.baseline.service.p05)}%</span></div>
      <div><small>Mean loss avoided · net of premiums</small><strong>{moneyLabel(run.protectedLoss)}</strong><span>Negative means the response costs more</span></div>
      <div><small>Severe-tail loss · CVaR95</small><strong>{moneyLabel(run.response.cvar95)}</strong><span>Average of worst 5% of modeled paths</span></div>
      <div><small>Paths meeting service floor</small><strong>{numberLabel(run.response.targetProbability)}%</strong><span>Conditional on your assumptions</span></div>
    </div>
    <div className={`os-notice ${run.targetPassed && run.budgetPassed ? "positive" : "warning"}`}><b>{run.targetPassed && run.budgetPassed ? "Numerical checks pass; domain review remains required" : "Response requires revision"}</b><span>Service floor {run.input.serviceTargetPct}%: {run.targetPassed ? "pass" : "fail"}. Budget {moneyLabel(run.input.budget)}: {run.budgetPassed ? "pass" : "fail"}. No automatic release.</span></div>
    <div className="os-results-grid">
      <section className="os-panel"><header><h3>Service distribution</h3><small>{run.input.paths} paired paths</small></header><div className="os-histogram" role="img" aria-label={`Service distribution from ${run.input.paths} computed paths; mean ${numberLabel(run.response.service.mean)} percent`}>{run.response.histogram.map((bin) => <div key={bin.from}><i style={{ height: `${Math.max(1, bin.count / maximum * 100)}%` }} title={`${bin.from}–${bin.to}% service: ${bin.count} paths`} /><small>{bin.to}%</small></div>)}</div><p className="os-help">P05 is the lower service tail. P95 loss is the upper loss tail. More samples improve numerical stability, not model validity.</p></section>
      <section className="os-panel"><header><h3>Policy comparison</h3><small>Same random draws</small></header><table className="os-table"><thead><tr><th>Computed measure</th><th>Baseline</th><th>Response</th></tr></thead><tbody>{[["Mean service", `${numberLabel(run.baseline.service.mean)}%`, `${numberLabel(run.response.service.mean)}%`], ["P95 modeled loss", moneyLabel(run.baseline.loss.p95), moneyLabel(run.response.loss.p95)], ["Mean intervention cost", moneyLabel(run.baseline.meanCost), moneyLabel(run.response.meanCost)], ["Worst service tested", `${numberLabel(run.baseline.service.worst)}%`, `${numberLabel(run.response.service.worst)}%`]].map((row) => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody></table><button type="button" onClick={() => setDetails(!details)} aria-expanded={details}>{details ? "Hide" : "Inspect"} weekly flow ledger</button></section>
    </div>
    {details && <section className="os-panel"><header><h3>Weekly event ledger</h3><label>Path<select value={path} onChange={(event) => setPath(Number(event.target.value))}>{run.response.paths.slice(0, 25).map((item) => <option value={item.index} key={item.index}>Path {item.index + 1}</option>)}</select></label></header><div className="os-table-scroll"><table className="os-table"><thead><tr>{["Week", "Operating state", "Demand", "Dispatched", "Arrived", "Served", "Closing stock", "In transit", "Lost demand"].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{(run.response.paths[path] ?? run.response.paths[0]).weeks.map((week) => <tr key={week.week}><td>{week.week}</td><td>{week.state}</td>{[week.demand, week.dispatched, week.arrived, week.served, week.inventory, week.inTransit, week.lostDemand].map((value, i) => <td key={i}>{numberLabel(value, 1)}</td>)}</tr>)}</tbody></table></div><p className="os-help">All quantities in {run.input.unit}, modeled as aggregate equivalents (fractional flows permitted). Arrivals include opening pipeline. Receipts serve this week’s demand; unmet demand is lost. Remaining pipeline stays visible at the horizon.</p></section>}
  </>;
}

const controls: { key: keyof SimulationInput; label: string; min: number; max: number; step?: number }[] = [
  { key: "demandSurgePct", label: "Demand change (%)", min: -75, max: 200 }, { key: "capacityLossPct", label: "Additional capacity cut (%)", min: 0, max: 100 },
  { key: "demandVariationPct", label: "Demand variation (±%)", min: 0, max: 75 }, { key: "alternateAllocationPct", label: "Qualified alternate used (%)", min: 0, max: 100 },
  { key: "inventoryUnits", label: "Opening available inventory", min: 0, max: 1e10 }, { key: "openingPipelineUnits", label: "Opening in-transit inventory", min: 0, max: 1e12 },
  { key: "qualificationWeek", label: "Alternate available from week", min: 1, max: 26 }, { key: "qualityYieldPct", label: "Qualified yield (%)", min: 0, max: 100, step: .1 },
  { key: "serviceTargetPct", label: "P05 service floor (%)", min: 1, max: 100 }, { key: "budget", label: "Intervention ceiling (USD)", min: 0, max: 1e12 },
  { key: "horizonWeeks", label: "Horizon (weeks)", min: 2, max: 26 }, { key: "seed", label: "Repeatable random seed", min: 1, max: 2147483647 },
];
export default function SimulationStudio({ projectId, onRun }: { projectId: string; onRun?: (run: SimulationRun) => void }) {
  const defaults = useMemo(() => simulationDefaults(projectId), [projectId]);
  const [input, setInput] = useState(defaults);
  const [run, setRun] = useState<SimulationRun | null>(null);
  const [history, setHistory] = useState<SimulationRun[]>([]);
  const [error, setError] = useState("");
  const [showInputs, setShowInputs] = useState(true);
  const evidence = getOsCaseEvidence(projectId);
  useEffect(() => { const hydration = window.setTimeout(() => { setInput(defaults); setRun(null); setHistory([]); setError(""); try { const saved = restoreSimulation(localStorage.getItem(simulationStorageKey(projectId)), projectId); if (saved) { setRun(saved); setInput(saved.input); } setHistory(simulationHistory(projectId)); } catch { setError("Browser storage is unavailable. Runs still work in this session."); } }, 0); return () => window.clearTimeout(hydration); }, [projectId, defaults]);
  if (!input || !evidence) return <section className="os-panel"><h2>Simulation needs a project model</h2><p>Create a reviewed demand, capacity, transit and uncertainty contract for this project before running.</p></section>;
  const stale = !!run && fingerprint(input) !== fingerprint(run.input);
  const execute = () => {
    const errors = validateSimulation(input);
    if (errors.length) { setError(errors.join(" ")); return; }
    const result = runSimulation(input, new Date().toISOString(), run?.id ?? null); setRun(result); setError("");
    try { persistSimulationRun(result); setHistory(simulationHistory(projectId)); } catch { setError("Result calculated. Browser persistence is unavailable; export the run to retain it."); }
    onRun?.(result);
  };
  return <div className="agent-os os-simulation">
    <div className="os-command"><div><b>Simulation</b><span>{evidence.scenario.label}</span></div><button type="button" aria-expanded={showInputs} onClick={() => setShowInputs(!showInputs)}>{showInputs ? "Hide" : "Edit"} assumptions</button><button className="os-primary" type="button" onClick={execute}>{run ? "Fork & rerun" : "Run comparison"}</button>{run && <button type="button" onClick={() => downloadJson(run, `${run.id}.json`)}>Export run</button>}</div>
    <p className="os-help">Modeled {evidence.scenario.scope.toLowerCase()}. Weekly Monte Carlo with Markov disruption states. Public company facts are context, not private operational measurements.</p>
    {history.length > 0 && <label>Local run history<select aria-label="Local simulation run history" value={run?.id ?? ""} onChange={(event) => { const item = history.find((saved) => saved.id === event.target.value); if (item) { setRun(item); setInput(structuredClone(item.input)); } }}>{history.map((item) => <option key={item.id} value={item.id}>{item.id} · {new Date(item.createdAt).toLocaleString()} {item.parentRunId ? `(from ${item.parentRunId})` : ""}</option>)}</select></label>}
    {error && <p className="os-notice warning" role="alert">{error}</p>}
    {stale && <p className="os-notice warning" role="status">Inputs changed. The result below belongs to {run?.id}; rerun before using it.</p>}
    {showInputs && <section className="os-panel"><div className="os-form-grid">{controls.map((field) => <label key={field.key}>{field.label}<input type="number" min={field.min} max={field.max} step={field.step ?? 1} value={Number.isFinite(Number(input[field.key])) ? Number(input[field.key]) : ""} onChange={(event) => setInput({ ...input, [field.key]: event.target.value === "" ? NaN : Number(event.target.value) })} /></label>)}<label>Replications<select value={input.paths} onChange={(event) => setInput({ ...input, paths: (event.target.value === "" ? NaN : Number(event.target.value)) })}>{[128,512,1024,2048].map((n) => <option key={n}>{n}</option>)}</select></label><label className="os-checkbox"><input type="checkbox" checked={input.expedite} onChange={(event) => setInput({ ...input, expedite: event.target.checked })} />Expedite by one week (premium applies)</label></div><details><summary>Operating-state assumptions and model limits</summary><table className="os-table"><thead><tr><th>State</th><th>Total lead days</th><th>Capacity factor</th><th>Next normal</th><th>Next constrained</th><th>Next disrupted</th></tr></thead><tbody>{input.regimes.map((regime, row) => <tr key={regime.name}><th>{regime.name}</th><td><input aria-label={`${regime.name} lead days`} type="number" min="0" max="365" value={Number.isFinite(regime.leadDays) ? regime.leadDays : ""} onChange={(event) => setInput({ ...input, regimes: input.regimes.map((item, i) => i === row ? { ...item, leadDays: (event.target.value === "" ? NaN : Number(event.target.value)) } : item) })} /></td><td>{regime.capacityFactor}</td>{regime.transition.map((value, column) => <td key={column}><input aria-label={`${regime.name} transition to ${input.regimes[column].name}`} type="number" min="0" max="1" step="0.01" value={Number.isFinite(value) ? value : ""} onChange={(event) => setInput({ ...input, regimes: input.regimes.map((item, i) => i === row ? { ...item, transition: item.transition.map((p, j) => j === column ? (event.target.value === "" ? NaN : Number(event.target.value)) : p) } : item) })} /></td>)}</tr>)}</tbody></table><p className="os-help">Transition rows must sum to 1. Probabilities are elicited assumptions, not fitted history. Weekly states govern both capacity and transit. The additional capacity cut compounds with the state’s capacity factor. No emissions, expiry, lot genealogy, regulation, or multi-product optimization is computed in this engine.</p></details></section>}
    {run ? <><SimulationResults run={run} /><p className="os-help"><code>{run.id}</code> · {run.version} · {run.createdAt}<br />{run.disclosure}</p></> : <div className="os-empty"><b>Compare the same disruption under two policies</b><p>Baseline uses existing qualified capacity. Response adds the approved alternate after its qualification week, with optional expediting. Run the comparison to compute the outcome.</p></div>}
  </div>;
}
