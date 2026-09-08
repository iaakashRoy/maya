"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  analyzeDataset, approvalCurrent, basisId, calculatePlans, caseStudies, createJourney,
  currentPlan, datasetId, findCase, fingerprint, initialAssumptions, proposeRevision,
  publishDataset, releaseCurrent, releaseDecision, reviewDecision, runAlternatives,
  runCurrent, sampleRows, storageKey, summarize, toCsv, validateCsv,
  type JourneyState, type Observation,
} from "./journey-model";
import "./journey.css";

const steps = [
  { name: "Data", detail: "Validate & publish", icon: "▦", owner: "Data steward" },
  { name: "Meaning", detail: "Inspect relationships", icon: "◇", owner: "Domain owner" },
  { name: "Statistics", detail: "Establish uncertainty", icon: "∿", owner: "Analyst" },
  { name: "Alternatives", detail: "Compare & stress", icon: "⑂", owner: "Network planner" },
  { name: "Review", detail: "Explain & decide", icon: "✓", owner: "Reviewer" },
  { name: "Release", detail: "Prepare & acknowledge", icon: "↗", owner: "Operator" },
  { name: "Outcomes", detail: "Measure & learn", icon: "◉", owner: "Finance / operations" },
];
const tasks = ["Reserve qualified capacity", "Confirm priority allocation", "Confirm receiving and quality plan"];
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: Math.abs(value) >= 1e6 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
const number = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 1 });
const now = () => new Date().toISOString();

function download(name: string, data: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ObservationTable({ rows }: { rows: Observation[] }) {
  return <div className="journey-table-scroll"><table className="journey-table"><thead><tr>{["Week", "Demand", "Base capacity", "Qualified alternate", "Lead time (days)", "Unit"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.week}><td>{row.week}</td><td>{number(row.demand)}</td><td>{number(row.capacity)}</td><td>{number(row.alternate)}</td><td>{row.leadDays}</td><td>{row.unit}</td></tr>)}</tbody></table></div>;
}

export default function DecisionJourney({ initialCaseId = "apple" }: { initialCaseId?: string }) {
  const initialCase = findCase(initialCaseId)?.id ?? "apple";
  const initialCaseRef = useRef(initialCase);
  const [state, setState] = useState<JourneyState>(() => createJourney(initialCase));
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const [role, setRole] = useState("Analyst");
  const [rationale, setRationale] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [graphScope, setGraphScope] = useState("project");
  const [edge, setEdge] = useState(0);
  const [dictionaryQuery, setDictionaryQuery] = useState("");
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [command, setCommand] = useState("");
  const [clock, setClock] = useState(now);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const candidate = findCase(parsed.caseId);
          if (candidate && candidate.id === initialCaseRef.current && typeof parsed.csv === "string" && parsed.csv.length <= 1000000 && Array.isArray(parsed.events) && Array.isArray(parsed.revisions) && Array.isArray(parsed.acknowledgements) && ["baseline", "selective", "qualified"].includes(parsed.selectedPlan) && parsed.assumptions && ["shock", "budget", "serviceFloor", "alternateFraction"].every(key => Number.isFinite(parsed.assumptions[key])) && parsed.assumptions.shock >= 0 && parsed.assumptions.shock <= 100 && parsed.assumptions.budget >= 0 && parsed.assumptions.serviceFloor >= 0 && parsed.assumptions.serviceFloor <= 100 && parsed.assumptions.alternateFraction >= 0 && parsed.assumptions.alternateFraction <= 100) {
            // Resume inputs only. Reconfirm calculations and role decisions after a browser reload.
            setState({ ...createJourney(candidate.id), csv: parsed.csv, sourceName: String(parsed.sourceName), assumptions: parsed.assumptions, events: ["Resumed local inputs. Republish, recompute and reapprove before release."] });
            setNotice("Local inputs restored. Approval is not carried across browser reloads.");
          } else setNotice("Saved inputs were invalid. A clean Apple sample is shown; no data was published.");
        }
      } catch { setStorageAvailable(false); }
      setReady(true);
    }, 0);
    const tick = window.setInterval(() => setClock(now()), 30000);
    return () => { window.clearTimeout(timer); window.clearInterval(tick); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { window.setTimeout(() => setStorageAvailable(false), 0); }
  }, [state, ready]);

  const c = findCase(state.caseId)!;
  const validation = validateCsv(state.csv, c);
  const rows = validation.rows;
  const dataReady = state.published === datasetId(state);
  const statsReady = dataReady && state.artifact?.dataset === datasetId(state);
  const calculated = runCurrent(state);
  const plans = calculatePlans(c, rows, state.assumptions);
  const plan = currentPlan(state);
  const approved = approvalCurrent(state, clock);
  const released = releaseCurrent(state, clock);
  const statistics = summarize(rows);
  const completed = [dataReady, dataReady, Boolean(statsReady), calculated, approved, released && state.acknowledgements.length === tasks.length, state.observedDelivered !== null && released];
  const activeRevision = state.revisions.at(-1);
  const revisionCurrent = calculated && activeRevision?.basis === basisId(state) && activeRevision?.planId === state.selectedPlan;
  const totalDemand = plan.weekly.reduce((sum, row) => sum + row.demand, 0);
  const predictedDelivered = plan.weekly.reduce((sum, row) => sum + row.delivered, 0);
  const update = (next: JourneyState, message: string) => { setState(next); setNotice(message); };
  const editData = (csv: string, sourceName: string) => setState(current => ({ ...current, csv, sourceName }));
  const chooseCase = (id: string) => {
    setState(createJourney(id)); setStep(0); setRationale(""); setReviewNote(""); setEdge(0);
    setNotice("Project changed. Data, assumptions and decision authority are isolated to this rehearsal.");
  };
  const publish = () => {
    const next = publishDataset(state);
    if (!next.published) return;
    try { localStorage.setItem(next.published, JSON.stringify({ id: next.published, caseId: c.id, name: state.sourceName, rows })); }
    catch { setStorageAvailable(false); }
    update(next, `${rows.length} rows published locally. Statistics can now use this exact version.`);
  };
  const events = state.events;
  const relations = [
    { from: state.sourceName, type: "materializes", to: "Weekly capacity table", status: dataReady ? "Validated locally" : "Awaiting validation", detail: `${validation.total} submitted rows; ${rows.length} accepted. Original CSV retained for this browser rehearsal.`, scope: "Project private (concept)", lineage: datasetId(state) },
    { from: "Weekly capacity table", type: "maps demand to", to: "L0-001 · Demand volume", status: "Declared mapping", detail: `demand → L0-001; grain: project/week; quantity in ${c.unit}. This is an explicit mapping, not automatic entity resolution.`, scope: "Project private (concept)", lineage: "Column: demand; taxonomy L0-001" },
    { from: "Qualified alternate", type: "constrained by", to: "Eligibility + arrival gate", status: "Scenario assumption", detail: `${c.constraint} Arrival is the later of qualification week ${c.qualificationWeek} and ceil(empirical P95 lead days / 7).`, scope: "Project private (concept)", lineage: state.artifact?.id ?? "Statistical artifact not yet calculated" },
    { from: "Statistical artifact", type: "parameterizes", to: "Six-week allocation", status: statsReady ? "Calculated locally" : "Not ready", detail: "The empirical lead-time P95 actually sets alternate-arrival timing. No fitted probability distribution or solver is claimed.", scope: "Project private (concept)", lineage: state.artifact?.id ?? "Uncomputed" },
    { from: "Alternative + evidence", type: "supports", to: "Decision revision", status: calculated ? "Calculated locally" : "Not ready", detail: "Dataset version, assumptions, statistical artifact and method version form the decision basis. Changing them makes a prior run and approval stale.", scope: "Project private (concept)", lineage: state.runBasis ?? "Run not calculated" },
  ];
  const dictionary = [
    { code: "L0-001", label: "Demand volume", meaning: "Quantity requested by a market or customer in a defined period.", use: `Mapped: demand; ${c.unit}/week` },
    { code: "L0-002", label: "Demand variability", meaning: "Dispersion of demand around its expected value over a defined horizon.", use: `Descriptive sample SD: ${number(summarize(rows, "demand").sd)} ${c.unit}` },
    { code: "M-01", label: "Exploratory diagnostics and statistical process control", meaning: "Find drift, bias, outliers, unstable processes, and unusable model inputs before optimization.", use: "Partial demonstration: schema validation and empirical profiling only; no SPC qualification." },
  ].filter(item => `${item.code} ${item.label} ${item.meaning}`.toLowerCase().includes(dictionaryQuery.toLowerCase()));

  function runCommand(event: React.FormEvent) {
    event.preventDefault();
    const text = command.trim();
    if (!text) return;
    const target: Record<string, number> = { "/data": 0, "/graph": 1, "/statistics": 2, "/options": 3, "/review": 4, "/release": 5, "/outcomes": 6 };
    if (text in target) setStep(target[text]);
    setState(current => ({ ...current, events: [...current.events, `You: ${text}`, text in target ? `Navigation tool: opened ${steps[target[text]].name}.` : `Local assistant: ${dataReady ? `${rows.length} validated rows` : "Publish and validate data first"}; ${calculated ? `${plans.filter(p => p.feasible).length} feasible alternatives in the current run` : "no current alternatives run"}. Supported commands: /data, /graph, /statistics, /options, /review, /release, /outcomes. No model provider was called.`] }));
    setCommand("");
  }

  return <section className="decision-journey" data-theme={dark ? "dark" : "light"} aria-label="Connected decision journey">
    <header className="journey-heading">
      <div><p className="journey-eyebrow">TANJNX · SUPPLY CHAIN WORKSPACE</p><h1 data-page-heading tabIndex={-1}>From disruption to a defensible decision.</h1><p>One connected rehearsal. Real local calculations, explicit assumptions, no operational write-back.</p></div>
      <label className="journey-case-picker">Client scenario<select value={c.id} onChange={event => chooseCase(event.target.value)}>{caseStudies.map(item => <option key={item.id} value={item.id}>{item.company} · {item.project}</option>)}</select></label>
    </header>
    <div className="journey-context" style={{ borderLeftColor: c.color }}>
      <span className="journey-company" style={{ background: c.color }} aria-hidden="true">{c.company.slice(0, 2).toUpperCase()}</span><div><strong>{c.company} / {c.project}</strong><span>{c.trigger}</span></div><span className="journey-tag">Company-inspired simulation</span><Link className="journey-workspace-link" href="/">← Workspace</Link><button onClick={() => setDark(value => !value)} aria-label={dark ? "Use light journey theme" : "Use dark journey theme"}>{dark ? "☀ Light" : "◐ Dark"}</button><button onClick={() => setConsoleOpen(value => !value)} aria-expanded={consoleOpen}>⌘ Work log <span>{events.length}</span></button>
    </div>
    <nav className="journey-steps" aria-label="Decision journey stages">{steps.map((item, index) => <button key={item.name} className={step === index ? "is-current" : completed[index] ? "is-complete" : ""} onClick={() => { setStep(index); setNotice(""); }} aria-current={step === index ? "step" : undefined}><span aria-hidden="true">{completed[index] ? "✓" : item.icon}</span><b>{item.name}<small>{item.detail}</small></b></button>)}</nav>
    <div className="journey-status"><span><i className={dataReady ? "good" : "warn"} />{dataReady ? `${rows.length} published rows` : "Unpublished data"}</span><span>{calculated ? "Run current" : state.runBasis ? "Run stale · recalculate" : "No calculated run"}</span><span>{approved ? "Rehearsal approval current" : state.approval ? "Approval stale / rejected" : "Human review required"}</span><small>{storageAvailable ? "Inputs saved only in this browser" : "Storage unavailable · keep this tab open / export"}</small></div>
    {notice && <p className="journey-notice" role="status">{notice}</p>}
    <div className="journey-work-area">
      <div className="journey-primary">
        <div className="journey-stage-heading"><span className="journey-eyebrow">{String(step + 1).padStart(2, "0")} / {steps[step].owner}</span><h2>{["Make the inputs trustworthy", "Establish what the data means", "Measure uncertainty before choosing", "Compare feasible responses", "Review the exact decision basis", "Hand off with accountability", "Close the loop with measured outcomes"][step]}</h2></div>
        {step === 0 && <>
          <div className="journey-upload"><div><strong>{state.sourceName}</strong><small>Plain CSV · project / week · {c.unit} · maximum 1 MB / 5,000 rows</small></div><input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={async event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 1000000) { setNotice("Choose a CSV no larger than 1 MB."); return; } try { editData(await file.text(), file.name); setNotice("File read locally. Check validation before publishing."); } catch { setNotice("File could not be read. Choose it again."); } event.target.value = ""; }} /><button onClick={() => fileRef.current?.click()}>＋ Choose CSV</button><button onClick={() => editData(toCsv(sampleRows(c)), `${c.id}-weekly-sample.csv`)}>Use sample</button><button onClick={() => download(`${c.id}-template.csv`, toCsv(sampleRows(c)), "text/csv")}>↓ Template</button></div>
          <div className="journey-metrics"><article><small>Submitted</small><strong>{validation.total}</strong><span>Actual CSV rows</span></article><article><small>Accepted</small><strong>{rows.length}</strong><span>Schema and unit checks</span></article><article><small>Validation issues</small><strong>{validation.issues.length}</strong><span>{validation.issues.length ? "Publish blocked" : "Ready for steward review"}</span></article></div>
          <details className="journey-details"><summary>Edit source / test a validation failure</summary><label>Source CSV<textarea rows={8} value={state.csv} onChange={event => editData(event.target.value, "edited-weekly-inputs.csv")} spellCheck={false} /></label><button onClick={() => editData(`${state.csv}\n13,100,80,20,12,wrong-unit`, "validation-example.csv")}>Append an invalid unit row</button></details>
          {validation.issues.length > 0 && <div className="journey-warning" role="alert"><strong>Quarantine before publishing</strong><ul>{validation.issues.slice(0, 5).map((issue, i) => <li key={`${issue.line}-${i}`}>{issue.line ? `Line ${issue.line}: ` : ""}{issue.reason}</li>)}</ul><p>Correct the source or reload the sample. Invalid rows are never silently published.</p></div>}
          <ObservationTable rows={rows.slice(0, 6)} />
          <div className="journey-actions"><span>Head: {Math.min(6, rows.length)} of {rows.length} accepted rows. The run replays the first six weeks.</span><button disabled={!dataReady || !storageAvailable} onClick={() => window.open(`/decision-journey/table?project=${encodeURIComponent(c.id)}&dataset=${encodeURIComponent(datasetId(state))}`, "_blank", "noopener,noreferrer")}>Full table + filters ↗</button><button className="journey-primary-button" disabled={validation.issues.length > 0 || !ready} onClick={publish}>{dataReady ? "Republish local version" : "Publish local dataset"} →</button></div>
          <p className="journey-footnote">No ERP connection is implied. The uploaded file remains in this browser; use sample or non-sensitive data. Dates are week indices, not live observations.</p>
        </>}
        {step === 1 && <>
          <div className="journey-tabs" aria-label="Relationship scope"><button aria-pressed={graphScope === "project"} onClick={() => setGraphScope("project")}>Project lineage</button><button aria-pressed={graphScope === "global"} onClick={() => setGraphScope("global")}>Global exposure view</button><button aria-pressed={graphScope === "variables"} onClick={() => setGraphScope("variables")}>Variables & methods</button></div>
          {graphScope === "project" && <div className="journey-lineage"><div className="journey-edge-list" aria-label="Inspectable relationships">{relations.map((relation, index) => <button key={relation.type} aria-pressed={edge === index} onClick={() => setEdge(index)}><span>{relation.from}</span><b>{relation.type} →</b><span>{relation.to}</span></button>)}</div><aside className="journey-edge-inspector"><p className="journey-eyebrow">SELECTED RELATIONSHIP</p><h3>{relations[edge].type}</h3><p>{relations[edge].detail}</p><dl><dt>Evidence status</dt><dd>{relations[edge].status}</dd><dt>Visibility</dt><dd>{relations[edge].scope}</dd><dt>Lineage reference</dt><dd><code>{relations[edge].lineage}</code></dd></dl></aside></div>}
          {graphScope === "global" && <><p className="journey-explainer">A shared risk is not a shared supplier. This portfolio projection shares only declared scenario themes, not client prices, contracts or order data.</p><div className="journey-exposure-grid">{[{ risk: "Trade / transport interruption", companies: ["apple", "tata", "byd", "pfizer"] }, { risk: "Water / climate pressure", companies: ["coca-cola", "hershey", "tsmc"] }, { risk: "Qualified material / origin evidence", companies: ["gucci", "tesla", "airbus"] }].map(group => <article key={group.risk}><span className="journey-tag">Scenario exposure · not a supply link</span><h3>{group.risk}</h3>{group.companies.map(id => <button key={id} onClick={() => chooseCase(id)}>{findCase(id)!.company} <span>shares_exposure_to →</span></button>)}</article>)}</div><p className="journey-footnote">Global optimization is not executable here: entity-resolved shared capacity, access controls and cross-project allocation policies are required first.</p></>}
          {graphScope === "variables" && <><label className="journey-search">Search verified taxonomy excerpt<input value={dictionaryQuery} onChange={event => setDictionaryQuery(event.target.value)} placeholder="Code, name or meaning…" /></label><div className="journey-dictionary">{dictionary.map(item => <article key={item.code}><code>{item.code}</code><div><h3>{item.label}</h3><p>{item.meaning}</p><small>{item.use}</small></div></article>)}{!dictionary.length && <p>No matching entry in this three-entry pilot excerpt. The main platform holds the complete L0/L1/L2 taxonomy.</p>}</div></>}
        </>}
        {step === 2 && <>
          {!dataReady && <div className="journey-warning">Publish a valid dataset before producing the statistical artifact. <button onClick={() => setStep(0)}>Return to Data →</button></div>}
          <p className="journey-explainer">Question: how much lead-time variation should the alternate-arrival plan allow? These summaries are calculated from the accepted CSV rows, not prewritten metrics.</p>
          <div className="journey-metrics"><article><small>Sample size</small><strong>{statistics.n}</strong><span>Weekly observations</span></article><article><small>Mean lead time</small><strong>{number(statistics.mean)} <em>days</em></strong><span>Arithmetic mean</span></article><article><small>Sample SD</small><strong>{number(statistics.sd)} <em>days</em></strong><span>n − 1 denominator</span></article><article><small>P05–P95</small><strong>{number(statistics.p05)}–{number(statistics.p95)}</strong><span>Central 90% empirical range</span></article></div>
          <div className="journey-histogram" aria-label="Lead time observations in days">{rows.slice(0, 24).map(row => <div key={row.week}><small>W{row.week}</small><span style={{ width: `${Math.max(2, row.leadDays / Math.max(1, statistics.max) * 82)}%` }} /><b>{row.leadDays}d</b></div>)}</div>
          <div className="journey-warning"><strong>Diagnostics before interpretation</strong><p>{rows.length < 30 ? "Small sample: fewer than 30 observations. " : ""}No normality, causal identification, process stability, Markov memorylessness or out-of-sample calibration has been established. The P05–P95 range is not a 95% confidence interval.</p></div>
          <div className="journey-actions"><span>Optimizer consumes ceil(P95 / 7) as alternate lead weeks.</span><button className="journey-primary-button" disabled={!dataReady} onClick={() => update(analyzeDataset(state), "Statistical artifact calculated from this exact dataset version.")}>Calculate & save artifact →</button></div>
          {statsReady && <details className="journey-details"><summary>{state.artifact!.id} · inspect artifact contract</summary><pre>{JSON.stringify(state.artifact, null, 2)}</pre></details>}
          <details className="journey-details"><summary>Next analytical capabilities from the review</summary><p>Distribution fitting with holdout diagnostics; observed transition counts and time-scale-aware Markov / semi-Markov models; stable-process capability with specifications; Bayesian updates; correlated scenario generation. Each needs validated data and an explicit model contract. None is represented as running here.</p></details>
        </>}
        {step === 3 && <>
          <p className="journey-explainer">{c.question} Three enumerated policies share one six-week baseline, inventory, arrival gates and compound stress. No solver optimality or war probability is claimed.</p>
          <div className="journey-input-grid">{([{ key: "shock", label: "Capacity loss (%)", max: 100 }, { key: "budget", label: "Response budget (USD)", max: 1e10 }, { key: "serviceFloor", label: "Service floor (%)", max: 100 }, { key: "alternateFraction", label: "Alternate capacity available (%)", max: 100 }] as const).map(input => <label key={input.key}>{input.label}<input type="number" min="0" max={input.max} value={state.assumptions[input.key]} onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value)) setState(current => ({ ...current, assumptions: { ...current.assumptions, [input.key]: Math.min(input.max, Math.max(0, value)) } })); }} /></label>)}</div>
          <div className="journey-actions"><span>Stress: +10 percentage points capacity loss, +1 week arrival delay.</span><button disabled={!statsReady} className="journey-primary-button" onClick={() => update(runAlternatives(state), "Alternatives calculated. Every candidate uses the same data and stress assumptions.")}>Calculate alternatives →</button></div>
          {!statsReady && <div className="journey-warning">A current statistical artifact is required. <button onClick={() => setStep(2)}>Open Statistics →</button></div>}
          {state.runBasis && !calculated && <div className="journey-warning">Inputs changed. Results and approval are stale; recalculate before continuing.</div>}
          {calculated && <><div className="journey-plan-grid">{plans.map(option => <button key={option.id} className={`journey-plan ${state.selectedPlan === option.id ? "is-selected" : ""}`} aria-pressed={state.selectedPlan === option.id} onClick={() => setState(current => ({ ...current, selectedPlan: option.id }))}><span className={`journey-tag ${option.feasible ? "good" : "warn"}`}>{option.feasible ? "Passes both scenarios" : "Infeasible against gates"}</span><h3>{option.name}</h3><dl><dt>On-time unit service</dt><dd>{number(option.service)}%</dd><dt>Stress service</dt><dd>{number(option.stressService)}%</dd><dt>Response spend</dt><dd>{money(option.cost)}</dd><dt>Gross value protected</dt><dd>{money(option.protectedValue)}</dd><dt>Stress lost contribution</dt><dd>{money(option.tailLoss)}</dd></dl><small>{option.failures.join(" ") || "Budget and service gates pass in base and stress replay."}</small></button>)}</div>
          {!plans.some(option => option.feasible) && <div className="journey-warning"><strong>No feasible response is a valid result.</strong><p>Do not approve an infeasible plan. Reduce disruption or add justified qualified capacity / budget. Service obligations should change only with an explicit rationale and renewed review.</p></div>}
          <details className="journey-details"><summary>{plan.name} · inspect weekly material balance</summary><div className="journey-table-scroll"><table className="journey-table"><thead><tr>{["Week", "Demand", "Base receipt", "Alternate receipt", "On-time units", "Missed units", "Ending stock"].map(item => <th key={item}>{item}</th>)}</tr></thead><tbody>{plan.weekly.map(row => <tr key={row.week}>{[row.week, row.demand, row.base, row.alternate, row.delivered, row.missed, row.endingInventory].map((value, i) => <td key={i}>{number(value)}</td>)}</tr>)}</tbody></table></div><p>Opening stock {number(c.inventory)} {c.unit}; receipts add to stock, deliveries reduce stock. Unmet due-week demand is counted as missed, not silently delivered later. Alternate premium {money(c.premium)}/{c.unit}. Lost contribution {money(c.margin)}/{c.unit}. All rates are illustrative. Gross protected value excludes response spend; net = gross − spend.</p></details></>}
          <button onClick={() => setState(current => ({ ...current, assumptions: initialAssumptions(c) }))}>Restore scenario assumptions</button>
        </>}
        {step === 4 && <>
          <p className="journey-explainer">Decide on a version, not a screenshot. A revision retains its parent, run reference and rationale. Approvals below rehearse roles; they are not authenticated signatures.</p>
          <div className="journey-review-grid"><div><label className="journey-label">Decision rationale<textarea rows={3} value={rationale} onChange={event => setRationale(event.target.value)} placeholder="Why this option? What alternatives and residual risks were considered?" /></label><button disabled={!calculated || !rationale.trim()} onClick={() => update(proposeRevision(state, rationale, now()), "Created a new decision revision; earlier revisions remain in the history.")}>＋ Create revision for {plan.name}</button><ol className="journey-revisions">{state.revisions.map(revision => <li key={revision.id}><i /><div><strong>{revision.id} ← {revision.parent ?? "baseline"}</strong><p>{revision.rationale}</p><code>{revision.basis} · {revision.planId}</code><small>{state.approval?.revisionId === revision.id ? state.approval.decision : "Revision retained"}</small></div></li>)}</ol></div><aside className="journey-review-panel"><label>Rehearse role<select value={role} onChange={event => setRole(event.target.value)}><option>Analyst</option><option>Reviewer</option><option>Operator</option></select></label><p>{revisionCurrent ? `${activeRevision!.id} references the current run and selection.` : "Create a revision against the current calculated run before reviewing."}</p><label>Review note<textarea rows={3} value={reviewNote} onChange={event => setReviewNote(event.target.value)} placeholder="Record approval rationale or requested changes…" /></label><div className="journey-actions"><button disabled={role !== "Reviewer" || !revisionCurrent || !reviewNote.trim()} onClick={() => update(reviewDecision(state, role, "rejected", reviewNote, now()), "Changes requested. Release is blocked.")}>Request changes</button><button className="journey-primary-button" disabled={role !== "Reviewer" || !revisionCurrent || !plan.feasible || !reviewNote.trim()} onClick={() => update(reviewDecision(state, role, "approved", reviewNote, now()), "Rehearsal approved for this revision and basis, with 24-hour expiry.")}>Approve rehearsal</button></div><small>{role !== "Reviewer" ? "Switch to Reviewer to rehearse this gate." : !plan.feasible ? "Approval blocked: this plan fails service or budget gates." : "Approval expires after 24 hours; changing the basis requires a new review."}</small></aside></div>
          {state.approval && <div className="journey-receipt"><strong>{state.approval.decision} · {state.approval.revisionId}</strong><span>{state.approval.actor} · expires {new Date(state.approval.expiresAt).toLocaleString()}</span><p>{state.approval.note}</p><code>{state.approval.basis}</code></div>}
        </>}
        {step === 5 && <>
          <p className="journey-explainer">This is the boundary between a recommendation and operational authority. A local package is not an ERP acknowledgement or a supplier commitment.</p>
          <div className="journey-release-controls"><label>Rehearse role<select value={role} onChange={event => setRole(event.target.value)}><option>Analyst</option><option>Reviewer</option><option>Operator</option></select></label><button className="journey-primary-button" disabled={role !== "Operator" || !approved} onClick={() => update(releaseDecision(state, role, now()), "Prepared an idempotent local execution package. Nothing sent externally.")}>{released ? "Package prepared" : "Prepare execution package"} →</button></div>
          {!approved && <div className="journey-warning">Release blocked: a current, feasible, unexpired approved revision is required. <button onClick={() => setStep(4)}>Return to review →</button></div>}
          {tasks.map((task, index) => <label className="journey-task" key={task}><input type="checkbox" disabled={!released || role !== "Operator"} checked={state.acknowledgements.includes(task)} onChange={event => setState(current => ({ ...current, acknowledgements: event.target.checked ? [...current.acknowledgements, task] : current.acknowledgements.filter(item => item !== task), events: [...current.events, `${event.target.checked ? "Acknowledged" : "Reopened"} local task: ${task}`] }))} /><span><strong>{task}</strong><small>{["Procurement · qualified counterparties only", "Planning · approved demand and allocation", "Operations · receiving and release evidence"][index]}</small></span><span className="journey-tag">Local acknowledgement</span></label>)}
          <p className="journey-footnote">A production adapter must validate authority server-side, send an idempotency key, capture the external acknowledgement, retry safely and reconcile failures. None of those external services is connected in this clickflow.</p>
        </>}
        {step === 6 && <>
          <p className="journey-explainer">Compare like-for-like outcomes: six-week on-time quantity, same demand denominator and same unit. Do not call a projection “realized value.”</p>
          <label className="journey-label">Observed on-time deliveries ({c.unit})<input type="number" min="0" max={totalDemand} disabled={!released || state.acknowledgements.length !== tasks.length} value={state.observedDelivered ?? ""} placeholder="Enter a measured quantity for this rehearsal" onChange={event => { const value = event.target.value === "" ? null : Number(event.target.value); if (value === null || (Number.isFinite(value) && value >= 0 && value <= totalDemand)) setState(current => ({ ...current, observedDelivered: value })); }} /></label>
          {(!released || state.acknowledgements.length !== tasks.length) && <div className="journey-warning">Complete the current release and its three local acknowledgements before recording outcomes.</div>}
          <div className="journey-metrics"><article><small>Predicted service</small><strong>{calculated ? `${number(plan.service)}%` : "—"}</strong><span>{number(predictedDelivered)} / {number(totalDemand)} {c.unit}</span></article><article><small>Observed service</small><strong>{released && state.observedDelivered !== null ? `${number(state.observedDelivered / totalDemand * 100)}%` : "—"}</strong><span>User-entered rehearsal observation</span></article><article><small>Forecast error</small><strong>{released && state.observedDelivered !== null ? `${number((state.observedDelivered - predictedDelivered) / totalDemand * 100)}pp` : "—"}</strong><span>Observed minus predicted service</span></article></div>
          {released && state.observedDelivered !== null && state.observedDelivered < predictedDelivered && <div className="journey-warning">Outcome below prediction. Investigate actual receipt timing, yield and demand changes; recalibrate assumptions before the next decision. Financial benefit still requires transaction reconciliation.</div>}
          <button disabled={state.observedDelivered === null || !released} onClick={() => { setState(current => ({ ...current, approval: null, releasedBasis: null, runBasis: null, acknowledgements: [], observedDelivered: null, events: [...current.events, `Opened follow-up from ${current.approval?.revisionId}. Recorded outcome: ${current.observedDelivered} ${c.unit}. Prior authority invalidated.`] })); setStep(3); setNotice("Follow-up opened. Revise assumptions, recalculate and request a new approval."); }}>Open a follow-up decision →</button>
        </>}
      </div>
      <aside className="journey-basis"><p className="journey-eyebrow">DECISION BASIS</p><h3>{c.project}</h3><p>{c.constraint}</p><dl><dt>Data version</dt><dd><code>{dataReady ? state.published : "Not published"}</code></dd><dt>Statistical artifact</dt><dd><code>{statsReady ? state.artifact!.id : "Not calculated / stale"}</code></dd><dt>Current run</dt><dd><code>{calculated ? state.runBasis : "Not calculated / stale"}</code></dd><dt>Selected response</dt><dd>{plan.name}</dd><dt>Authority</dt><dd>{approved ? "Local rehearsal approval" : "Not approved for current basis"}</dd></dl><button onClick={() => download(`tanjnx-${c.id}-decision-pack.json`, JSON.stringify({ mode: "browser-only-simulation", exportedAt: now(), dataset: { id: datasetId(state), acceptedRows: rows, issues: validation.issues }, artifact: state.artifact, currentBasis: basisId(state), resultsCurrent: calculated, results: calculated ? plans : null, approvalValidAtExport: approved, state, limitations: "Illustrative company scenario, no client engagement. Fingerprints are not cryptographic seals. No authenticated signatures, external execution, calibrated probabilities or enterprise solver." }, null, 2))}>↓ Export decision pack</button><p className="journey-footnote">Contains local source data. Handle accordingly. Fingerprints identify replay inputs; they are not cryptographic seals.</p><details><summary>What is running?</summary><ul><li>Actual CSV parsing and row validation</li><li>Empirical statistics from those rows</li><li>Deterministic allocation + stress replay</li><li>Local revision, review and release gates</li></ul><p>Not running: LLM agents, enterprise integrations, identity enforcement, durable audit, optimization solver, calibrated stochastic model.</p></details></aside>
    </div>
    {consoleOpen && <section className="journey-console"><div><strong>⌘ Local work log</strong><span>Executed UI actions, not simulated thinking or private reasoning</span><button onClick={() => setConsoleOpen(false)} aria-label="Close work log">×</button></div><ol aria-live="polite">{events.map((event, index) => <li key={`${index}-${fingerprint(event)}`}><small>{String(index + 1).padStart(2, "0")}</small><span>{event}</span></li>)}</ol><form onSubmit={runCommand}><span aria-hidden="true">›</span><input value={command} onChange={event => setCommand(event.target.value)} placeholder="/data /graph /statistics /options /review /release /outcomes" aria-label="Local navigation command" /><button type="submit" aria-label="Run local command">↑</button></form></section>}
    <footer className="journey-footer"><span>Based on the tanjnx capabilities & improvement review · no actual client engagement implied</span><button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button><button onClick={() => setStep(Math.min(6, step + 1))} disabled={step === 6}>Next: {steps[Math.min(6, step + 1)].name} →</button></footer>
  </section>;
}
