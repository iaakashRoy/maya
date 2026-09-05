"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  constraintFamilies,
  decisionPatterns,
  getMethod,
  orMethods,
  probabilityModelControls,
  solutionEvidenceBlocks,
  uncertaintyScenarios,
  validationGates,
  type ORMethod,
  type ORMethodFamily,
} from "./or-methodology";
import { solveNetworkPlan, type DecisionCase, type OptimizationContext, type OptimizationInput, type OptimizationResult, type ScopeId, type ScopeSnapshot, type StatusTone } from "./platform-model";
import type { MapSelectionContext } from "./WorldNetworkMap";
import { AppGlyph } from "./VisualIdentity";

type WorkbenchStage = "frame" | "formulate" | "methods" | "stress" | "release";
const stages: readonly { id: WorkbenchStage; label: string; detail: string }[] = [
  { id: "frame", label: "Frame", detail: "Decision contract" },
  { id: "formulate", label: "Formulate", detail: "Variables + constraints" },
  { id: "methods", label: "Techniques", detail: "M-01 through M-30" },
  { id: "stress", label: "Stress + compare", detail: "Uncertainty + Pareto" },
  { id: "release", label: "Validate + release", detail: "Evidence + controls" },
];

const initialInput: OptimizationInput = { supplyLossPercent: 32, disruptionWeeks: 14, serviceTarget: 96, budgetMillions: 2.5, carbonLimitPercent: 4, strategy: "Balanced" };
const horizonOptions = ["Strategic · 1–10 years", "Tactical · 4–104 weeks", "Operational · hours–13 weeks", "Real-time · seconds–hours"] as const;
const casePattern: Readonly<Record<string, string>> = {
  "CASE-1042": "sourcing",
  "CASE-1041": "transport",
  "CASE-1038": "sourcing",
  "CASE-1035": "sourcing",
  "CASE-1032": "inventory",
  "CASE-1029": "transport",
  "CASE-1026": "inventory",
  "CASE-1024": "network",
  "CASE-1019": "portfolio",
  "CASE-001-01": "sourcing",
  "CASE-002-01": "allocation",
  "CASE-003-01": "maintenance",
  "CASE-004-01": "inventory",
  "CASE-005-01": "sourcing",
  "CASE-006-01": "portfolio",
  "CASE-007-01": "sourcing",
  "CASE-008-01": "transport",
  "CASE-009-01": "maintenance",
  "CASE-010-01": "warehouse",
};

function buildReplayContext(scope: ScopeId, activeCase: DecisionCase, patternId: string, horizon: string, networkSelection: MapSelectionContext | null): OptimizationContext {
  const pattern = decisionPatterns.find((item) => item.id === patternId) ?? decisionPatterns[0];
  return {
    scope,
    caseId: activeCase.id,
    decisionTitle: activeCase.title,
    primaryEntity: activeCase.primaryEntity,
    entityContext: networkSelection ? `${networkSelection.kind}:${networkSelection.id}@${networkSelection.frame}/${networkSelection.scenario}` : "network:unscoped",
    patternId: pattern.id,
    horizon,
    methodStack: Array.from(new Set([...pattern.primary, ...pattern.supporting, pattern.fallback, ...activeCase.methodCodes])),
    scenarioSetId: "JOINT-S12-V1",
  };
}

function Dot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

function ReplayMetric({ label, value, detail, tone = "info", onTrace }: { label: string; value: string; detail: string; tone?: StatusTone; onTrace: (message: string) => void }) {
  return <button type="button" className={`replay-metric replay-metric-${tone}`} onClick={() => onTrace(`${label} result receipt opened: ${value}; ${detail}. Value belongs to the completed deterministic response calculator fixture and is not a solver or optimality certificate.`)}><div><span>{label}</span><Dot tone={tone} /></div><b>{value}</b><small>{detail} · ◇ trace</small></button>;
}

function buildParetoPlans(result: OptimizationResult, input: OptimizationInput) {
  return Array.from({ length: 16 }, (_, index) => {
    const riskPosture = index / 15;
    const cost = Number(Math.max(.7, result.totalCost * (.66 + riskPosture * .68)).toFixed(2));
    const service = Number(Math.min(99.6, result.projectedService - 2.4 + riskPosture * 4.6).toFixed(1));
    const resilience = Math.round(Math.min(98, 56 + riskPosture * 39 - input.supplyLossPercent * .08));
    const carbon = Number((result.carbonDelta + 3.5 - riskPosture * 5.6).toFixed(1));
    const feasible = service >= input.serviceTarget && cost <= input.budgetMillions && carbon <= input.carbonLimitPercent;
    return { id: `P-${String(index + 1).padStart(2, "0")}`, name: ["Lean response", "Balanced recourse", "Service shield", "Low-carbon bridge"][index % 4], cost, service, resilience, carbon, feasible, selected: index === 9 };
  });
}

function methodRole(method: ORMethod, pattern: (typeof decisionPatterns)[number]) {
  if (pattern.primary.includes(method.code)) return "Primary";
  if (pattern.supporting.includes(method.code)) return "Supporting";
  if (pattern.fallback === method.code) return "Fallback";
  if (method.code === "M-27") return "Experimental";
  return "Catalog";
}

function FrameStage({ patternId, onPatternChange, horizon, onHorizonChange }: { patternId: string; onPatternChange: (value: string) => void; horizon: string; onHorizonChange: (value: string) => void }) {
  const pattern = decisionPatterns.find((item) => item.id === patternId) ?? decisionPatterns[0];
  return (
    <div className="or-stage-grid frame-stage">
      <section className="or-stage-main">
        <header className="or-section-head"><div><p className="kicker">12 REUSABLE DECISION PATTERNS</p><h2>Choose the decision shape before choosing an algorithm</h2><span>Method selection follows the decision—not the other way around.</span></div><b>01 / FRAME</b></header>
        <div className="decision-pattern-grid">{decisionPatterns.map((item, index) => <button className={patternId === item.id ? "active" : ""} type="button" key={item.id} onClick={() => onPatternChange(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{item.name}</b><small>{item.horizons.join(" · ")}</small></div></button>)}</div>
      </section>
      <aside className="decision-contract">
        <p className="kicker">SELECTED DECISION CONTRACT</p><h3>{pattern.name}</h3><blockquote>{pattern.question}</blockquote>
        <div className="handbook-trace"><span>HANDBOOK TRACE</span>{pattern.handbookRefs.map((reference) => <b key={reference}>{reference}</b>)}</div>
        <div className="horizon-control"><span>PLANNING HORIZON</span>{horizonOptions.map((item) => <button className={horizon === item ? "active" : ""} type="button" key={item} onClick={() => onHorizonChange(item)}>{item}</button>)}</div>
        <dl><div><dt>Decision owner</dt><dd>Global continuity council</dd></div><div><dt>Cadence</dt><dd>Event-triggered · daily review</dd></div><div><dt>Freeze window</dt><dd>48 hours for confirmed transport</dd></div><div><dt>Baseline</dt><dd>Approved plan BP-2026.09.04-A</dd></div><div><dt>Material grain</dt><dd>SKU × site × lane × week × scenario</dd></div><div><dt>Authority</dt><dd>≤ $2.5M response · dual approval</dd></div></dl>
        <div className="decision-nonnegotiables"><span>NON-NEGOTIABLES</span><ul><li>No unqualified supplier-part-site combination.</li><li>Critical customer service floor is a hard constraint.</li><li>Legal, safety, market access, and frozen moves precede economics.</li><li>No future information may leak into first-stage decisions.</li></ul></div>
      </aside>
    </div>
  );
}

function FormulateStage({ input, preview, decisionTitle, updateNumber, setStrategy }: { input: OptimizationInput; preview: OptimizationResult; decisionTitle: string; updateNumber: (key: keyof OptimizationInput, value: number) => void; setStrategy: (value: OptimizationInput["strategy"]) => void }) {
  const variables = [
    ["xᵢⱼₖₜₛ", "Flow", "Units moved from node i to j for product k, period t, scenario s", "Controllable"],
    ["pₙₖₜₛ", "Production", "Qualified production at node n", "Controllable"],
    ["Iₙₖₜₛ / Bₙₖₜₛ", "Inventory / backlog", "End-of-period stock and unmet demand", "State"],
    ["yₙ / zᵢⱼ", "Activation", "Facility, supplier, lane, or setup decision", "Binary"],
    ["oₙₜₛ", "Flexible capacity", "Overtime, expedite, or reserved capacity", "Recourse"],
    ["D / Cap / c", "Parameters", "Demand, capacity, and delivered economics", "Observed / uncertain"],
  ];
  return (
    <div className="formulate-stage">
      <div className="formulation-top">
        <section className="assumption-studio"><header className="or-section-head"><div><p className="kicker">CONTROLLED ASSUMPTIONS</p><h2>{decisionTitle}</h2><span>Every change produces a pending diff; completed results update only after recalculation.</span></div><b>02 / FORMULATE</b></header><div className="or-range-grid">{[
          ["supplyLossPercent", "Supply unavailable", "%", 0, 100, 1], ["disruptionWeeks", "Disruption duration", "weeks", 1, 26, 1], ["serviceTarget", "Critical service floor", "%", 80, 100, .5], ["budgetMillions", "Response authority", "$M", 0, 8, .1], ["carbonLimitPercent", "Carbon envelope", "%", -5, 12, .5],
        ].map(([key, label, unit, min, max, step]) => <label htmlFor={`or-${key}`} key={key as string}><span><b>{label as string}</b><em>{String(key) === "budgetMillions" ? `$${input[key as keyof OptimizationInput]}` : input[key as keyof OptimizationInput]} {unit as string}</em></span><input aria-label={label as string} id={`or-${key}`} type="range" min={min as number} max={max as number} step={step as number} value={input[key as keyof OptimizationInput] as number} onChange={(event) => updateNumber(key as keyof OptimizationInput, Number(event.target.value))} /></label>)}</div><div className="or-strategy-control"><span>OBJECTIVE POSTURE</span>{(["Balanced", "Service first", "Cash first", "Lowest carbon"] as const).map((item) => <button className={input.strategy === item ? "active" : ""} type="button" key={item} onClick={() => setStrategy(item)}><b>{item}</b><small>{item === "Balanced" ? "Lexicographic floors + balanced economics" : item === "Service first" ? "Protect priority OTIF before cost" : item === "Cash first" ? "Constrain response cash and stock" : "Tighten carbon before marginal cost"}</small></button>)}</div></section>
        <section className="objective-hierarchy"><header><p className="kicker">OBJECTIVE HIERARCHY</p><h3>Lexicographic priorities</h3><span>Weighted sums require approved units and sensitivity.</span></header>{[
          ["P0", "Legal + physical feasibility", "Safety, authorization, rights, qualified combinations, conservation", "HARD"],
          ["P1", "Critical outcome", `Customer service ≥ ${input.serviceTarget}% and continuity recovery`, "HARD"],
          ["P2", "Economics", `Incremental cash ≤ $${input.budgetMillions}M; protect margin`, "OPTIMIZE"],
          ["P3", "Stability + usability", "Limit churn, frozen changes, exceptions, and execution burden", "PREFERENCE"],
        ].map((item) => <article key={item[0]}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div><em>{item[3]}</em></article>)}<div className="objective-equation"><span>OBJECTIVE MODEL</span><code>min fixed + purchase + production + transport + inventory + shortage + overtime + duty + carbon + quality + risk</code></div></section>
      </div>
      <section className="variable-registry"><header className="or-section-head"><div><p className="kicker">CANONICAL VARIABLE REGISTRY</p><h2>Grain, units, time, uncertainty, lineage, and decision role</h2></div><b>6 model groups</b></header><div className="table-scroll"><table><thead><tr><th>Symbol</th><th>Model role</th><th>Definition</th><th>Decision role</th><th>Contract</th></tr></thead><tbody>{variables.map((item) => <tr key={item[0]}><td><code>{item[0]}</code></td><td><b>{item[1]}</b></td><td>{item[2]}</td><td>{item[3]}</td><td>Unit + currency + valid time + provenance + owner</td></tr>)}</tbody></table></div></section>
      <section className="constraint-studio"><header className="or-section-head"><div><p className="kicker">12 CANONICAL CONSTRAINT FAMILIES · 57 SYNTHETIC ROW DEFINITIONS</p><h2>Feasibility before economics</h2><span>Each family has an explicit deterministic check; these are concept residuals, not solver proof.</span></div><b>{preview.hardViolations.length} / 11 hard checks failed</b></header><div className="constraint-family-grid">{constraintFamilies.map((constraint) => {
        const evaluation = preview.constraintChecks.find((check) => check.id === constraint.id);
        const state = evaluation?.state ?? "Violated";
        return <article className={`constraint-family constraint-family-${state.toLowerCase()}`} key={constraint.id}><header><span>{constraint.id}</span><b>{constraint.name}</b><em>{state}</em></header><p>{constraint.example}</p><small>{evaluation?.residual ?? "Check unavailable"} · {evaluation?.evidence ?? "Missing evaluation blocks review."}</small><footer><span>{constraint.count} definitions · {constraint.hard ? "Hard" : "Soft / governed"}</span><b>{constraint.owner}</b></footer></article>;
      })}</div></section>
    </div>
  );
}

function MethodsStage({ pattern, selectedCode, onSelect }: { pattern: (typeof decisionPatterns)[number]; selectedCode: ORMethod["code"]; onSelect: (value: ORMethod["code"]) => void }) {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState<"All" | ORMethodFamily>("All");
  const selected = getMethod(selectedCode) ?? orMethods[0];
  const filtered = orMethods.filter((method) => (family === "All" || method.family === family) && `${method.code} ${method.name} ${method.techniques.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const families = Array.from(new Set(orMethods.map((method) => method.family)));
  const stack = [...pattern.primary, ...pattern.supporting, pattern.fallback].map((code) => getMethod(code)).filter(Boolean) as ORMethod[];
  return (
    <div className="methods-stage">
      <section className="recommended-stack"><header className="or-section-head"><div><p className="kicker">RECOMMENDED METHOD STACK</p><h2>{pattern.name}</h2><span>Primary and supporting labels are handbook references for formulation, stress testing, explanation, and governance; fallback identifies a latency-safe reference path.</span></div><b>{stack.length} selected</b></header><div className="stack-flow">{stack.map((method) => <button type="button" key={method.code} className={`stack-card stack-${methodRole(method, pattern).toLowerCase()}`} onClick={() => onSelect(method.code)}><span>{method.code}</span><div><b>{method.name}</b><small>{methodRole(method, pattern)} · {method.runtime}</small></div><em>Inspect →</em></button>)}</div></section>
      <div className="method-library-layout">
        <section className="method-library"><header className="or-section-head"><div><p className="kicker">HANDBOOK METHOD LIBRARY</p><h2>All 30 operations-research methodologies</h2></div><b>03 / TECHNIQUES</b></header><div className="method-filters"><label><span>Search code, method, or technique</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Benders, CVaR, queueing" /></label><label><span>Family</span><select value={family} onChange={(event) => setFamily(event.target.value as "All" | ORMethodFamily)}><option>All</option>{families.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="method-index">{filtered.map((method) => <button className={selected.code === method.code ? "active" : ""} type="button" key={method.code} onClick={() => onSelect(method.code)}><span>{method.code}</span><div><b>{method.name}</b><small>{method.family} · {method.techniques.length} named techniques</small></div><em className={`role-${methodRole(method, pattern).toLowerCase()}`}>{methodRole(method, pattern)}</em></button>)}</div></section>
        <aside className="method-detail"><header><span>{selected.code}</span><div><p className="kicker">{selected.family.toUpperCase()}</p><h3>{selected.name}</h3></div><em>{methodRole(selected, pattern)}</em></header><p className="method-purpose">{selected.purpose}</p><div className="method-formulation"><span>FORMULATION</span><p>{selected.formulation}</p></div><section><span>NAMED TECHNIQUES</span><div className="technique-tags">{selected.techniques.map((item) => <i key={item}>{item}</i>)}</div></section><section><span>EXPECTED OUTPUTS</span><ul>{selected.outputs.map((item) => <li key={item}>{item}</li>)}</ul></section><section><span>VALIDATION EVIDENCE</span><ul>{selected.validation.map((item) => <li key={item}>{item}</li>)}</ul></section><dl><div><dt>Runtime class</dt><dd>{selected.runtime}</dd></div><div><dt>Decision shapes</dt><dd>{selected.decisionShapes.join(" · ")}</dd></div></dl><aside><b>LIMITATION / GUARDRAIL</b><p>{selected.limitations}</p></aside></aside>
      </div>
      <section className="probability-foundations"><header className="or-section-head"><div><p className="kicker">PROBABILITY-THEORY CONTROL PLANE</p><h2>Choose a distribution from observed behavior, then govern its assumptions</h2><span>Six behavior classes connect uncertainty inputs to forecasting, simulation, reliability, stochastic programming, and service-level decisions.</span></div><b>{probabilityModelControls.length} governed classes</b></header><div className="probability-model-grid">{probabilityModelControls.map((model, index) => <article key={model.behavior}><header><span>P-{String(index + 1).padStart(2, "0")}</span><b>{model.behavior}</b></header><div><span>CANDIDATE MODELS</span><p>{model.candidates.join(" · ")}</p></div><div><span>TYPICAL SUPPLY-CHAIN USE</span><p>{model.typicalUses.join(" · ")}</p></div><div><span>ASSUMPTION CONTROLS</span><ul>{model.assumptionControls.map((control) => <li key={control}>{control}</li>)}</ul></div></article>)}</div><footer><b>Governance rule</b><span>Fit, calibration, dependence, censoring, tail behavior, and regime stability must be evidenced before any probability-driven recommendation is operationally trusted.</span></footer></section>
    </div>
  );
}

function StressStage({ result, input, onTrace }: { result: OptimizationResult; input: OptimizationInput; onTrace: (message: string) => void }) {
  const [selectedPlanId, setSelectedPlanId] = useState("P-10");
  const pareto = useMemo(() => buildParetoPlans(result, input), [result, input]);
  const selectedPlan = pareto.find((item) => item.id === selectedPlanId) ?? pareto[9];
  const scenarioSeverity: Record<string, number> = { "S-01": .12, "S-02": .76, "S-03": .94, "S-04": .67, "S-05": .42, "S-06": .31, "S-07": .72, "S-08": .48, "S-09": .63, "S-10": .41, "S-11": .58, "S-12": -.32 };
  return (
    <div className="stress-stage">
      <section className="scenario-lab"><header className="or-section-head"><div><p className="kicker">JOINT UNCERTAINTY LIBRARY</p><h2>12 decision scenarios · probability sums to 100%</h2><span>Named severity—not array order—drives cost, service, raw loss, and probability-weighted loss.</span></div><b>04 / STRESS</b></header><div className="table-scroll"><table><thead><tr><th>Scenario</th><th>Probability</th><th>Joint shock / time path</th><th>Illustrative recourse</th><th>Cost</th><th>OTIF</th><th>Loss / weighted</th></tr></thead><tbody>{uncertaintyScenarios.map((scenario) => {
          const severity = scenarioSeverity[scenario[0]] ?? .5; const cost = result.totalCost * (1 + severity * .28); const service = Math.max(71, Math.min(99.8, result.projectedService - severity * 3.8)); const loss = result.protectedMargin * Math.max(.035, .07 + severity * .23); const weightedLoss = loss * scenario[2];
          return <tr key={scenario[0]}><td><b>{scenario[0]} · {scenario[1]}</b></td><td>{Math.round(scenario[2] * 100)}%</td><td>{scenario[3]}</td><td>{scenario[4]}</td><td>${cost.toFixed(2)}M</td><td>{service.toFixed(1)}%</td><td>${loss.toFixed(2)}M / ${weightedLoss.toFixed(2)}M</td></tr>;
        })}</tbody></table></div></section>
      <div className="pareto-layout">
        <section className="pareto-panel"><header className="or-section-head"><div><p className="kicker">M-24 PARETO EXPLORER</p><h2>Cost, service, resilience, and carbon trade-offs</h2><span>Select any alternative to inspect why it is or is not releasable.</span></div><b>{pareto.filter((item) => item.feasible).length} feasible</b></header><div className="pareto-chart" role="img" aria-label="Synthetic Pareto alternatives plotted by response cost and service"><div className="pareto-y">SERVICE →</div><div className="pareto-x">RESPONSE COST →</div>{pareto.map((plan) => <button aria-label={`${plan.id}, cost ${plan.cost} million, service ${plan.service} percent, ${plan.feasible ? "feasible" : "not feasible"}`} className={`${plan.feasible ? "feasible" : "infeasible"} ${selectedPlan.id === plan.id ? "active" : ""}`} style={{ left: `${8 + (plan.cost / Math.max(1, input.budgetMillions * 1.35)) * 80}%`, bottom: `${8 + Math.max(0, plan.service - 90) * 8}%` }} type="button" key={plan.id} onClick={() => setSelectedPlanId(plan.id)}><span>{plan.id}</span></button>)}</div><footer><span><i className="pareto-feasible" />Within hard envelope</span><span><i className="pareto-infeasible" />Fails ≥1 hard constraint</span><b>Illustrative candidate set · no optimality claim</b></footer></section>
        <aside className="pareto-inspector"><p className="kicker">SELECTED ALTERNATIVE</p><h3>{selectedPlan.id} · {selectedPlan.name}</h3><span className={`release-state ${selectedPlan.feasible ? "release-ready" : "release-blocked"}`}>{selectedPlan.feasible ? "Inside hard envelope" : "Not releasable"}</span><dl><div><dt>Incremental cost</dt><dd>${selectedPlan.cost}M</dd></div><div><dt>Projected OTIF</dt><dd>{selectedPlan.service}%</dd></div><div><dt>Resilience score</dt><dd>{selectedPlan.resilience}/100</dd></div><div><dt>Carbon delta</dt><dd>{selectedPlan.carbon > 0 ? "+" : ""}{selectedPlan.carbon}%</dd></div></dl><button type="button" onClick={() => onTrace(`${selectedPlan.id} Pareto alternative receipt opened: $${selectedPlan.cost}M incremental cost; ${selectedPlan.service}% projected OTIF; ${selectedPlan.resilience}/100 resilience fixture score; ${selectedPlan.carbon}% carbon delta; ${selectedPlan.feasible ? "inside" : "outside"} the synthetic hard envelope. No solver bound or optimality claim.`)}>Trace selected alternative ◇</button><section><span>WHY THIS CHANGES</span><p>Higher protected-capacity and inventory decisions raise near-term cost but improve service and recovery. Mode shifts lower carbon at the expense of speed. Frozen transport decisions cap the feasible frontier.</p></section><section><span>TAIL-RISK EVIDENCE</span><ul><li>P50 loss: ${(result.protectedMargin * .06).toFixed(2)}M</li><li>P90 loss: ${(result.protectedMargin * .22).toFixed(2)}M</li><li>P95 CVaR: ${(result.protectedMargin * .31).toFixed(2)}M</li><li>Worst named stress: Red Sea closure + supplier capacity loss</li></ul></section></aside>
      </div>
    </div>
  );
}

function ReleaseStage({ result, dirty, onToast }: { result: OptimizationResult; dirty: boolean; onToast: (message: string) => void }) {
  const reviewAllowed = result.releasable && !dirty;
  const syntheticRuns = Array.from({ length: 20 }, (_, index) => ({ id: `ESTIMATE-H${String(20 - index).padStart(2, "0")}`, time: `${String(4 - Math.floor(index / 5)).padStart(2, "0")} Sep · ${String(14 - index % 5).padStart(2, "0")}:30`, status: index % 7 === 0 ? "Blocked" : index % 5 === 0 ? "Fallback" : "Reviewable", candidateIndex: 690 + index * 47, version: `OR-CONT-2.${4 - index % 3}`, delta: index % 2 ? "+0.4 OTIF" : "−$0.12M" }));
  const evidencePayloads = [
    { state: "Recorded", value: `${result.constraintChecks.filter((check) => check.hard && check.state !== "Violated").length}/11 hard checks clear · ${result.hardViolations.length} failed` },
    { state: "Illustrative", value: "16 plotted response alternatives · no legitimate bound, gap, or optimality certificate" },
    { state: "Illustrative", value: `12 named stresses · residual risk ${result.residualRisk}% · probability-weighted losses shown in Stress` },
    { state: "Illustrative", value: "Freeze-window and change-burden assumptions are described; no execution telemetry is connected" },
    { state: "Demo fixture", value: `Candidate-space index ${result.candidateSpaceIndex.toLocaleString()} · deterministic calculation, not solver nodes` },
    { state: "Recorded", value: `${result.inputFingerprint} · ${result.context.scope} · ${result.context.caseId} · ${result.context.scenarioSetId}` },
    { state: "Illustrative", value: `${result.objectiveBreakdown.length} objective components · ${result.constraintChecks.length} residual explanations · no shadow prices` },
  ];
  return (
    <div className="release-stage">
      <section className="release-gate-panel"><header className="or-section-head"><div><p className="kicker">GOVERNED RELEASE GATE</p><h2>{dirty ? "Recalculate the changed decision contract" : result.releasable ? "Synthetic estimate is eligible for human review" : "Review is blocked by hard constraint checks"}</h2><span>A concept estimate may be reviewed; it never writes back to operational systems and is not a solver certificate.</span></div><b>05 / RELEASE</b></header><div className={`release-banner ${reviewAllowed ? "ready" : "blocked"}`}><span>{dirty ? "STALE RESULT" : reviewAllowed ? "REVIEW-READY" : "BLOCKED"}</span><div><b>{result.status}</b><small>{dirty ? "Pattern, horizon, scope, case, or assumptions differ from this result fingerprint." : result.releasable ? "All 11 synthetic hard-family checks are clear · empirical and operational review still required" : result.hardViolations.join(" ")}</small></div><em>{result.runId}</em></div><div className="validation-gates">{validationGates.map((gate) => {
        const state = gate.id === "semantic" ? "Recorded" : gate.id === "mathematical" ? dirty ? "Stale" : result.releasable ? "Synthetic pass" : "Blocked" : "Review";
        return <article key={gate.id}><header><span>{gate.name.slice(0, 2).toUpperCase()}</span><div><b>{gate.name} validation</b><small>{gate.question}</small></div><em className={`gate-${state.toLowerCase().replaceAll(" ", "-")}`}>{state}</em></header><p>{gate.evidence}</p></article>;
      })}</div><div className="release-actions"><button type="button" onClick={() => onToast(`Evidence-summary receipt opened for ${result.runId}: ${result.constraintChecks.length} checks, ${result.objectiveBreakdown.length} objective components, fingerprint ${result.inputFingerprint}. No file was exported.`)}>Open evidence-summary receipt</button><button type="button" onClick={() => onToast(`Fallback-drill receipt recorded for ${result.runId}; the fallback method was reviewed as a concept path, but no drill or operational action ran.`)}>Record fallback-drill receipt</button><button className="primary-action" type="button" disabled={!reviewAllowed} onClick={() => onToast("Synthetic estimate routed to human review. No operational write-back occurred.")}>{dirty ? "Recalculate changed contract first" : result.releasable ? "Route to human review →" : "Resolve hard violations first"}</button></div></section>
      <section className="solution-package"><header className="or-section-head"><div><p className="kicker">SELECTED RESPONSE PACKAGE · SYNTHETIC</p><h2>Actions, ownership, timing, economics, and warnings</h2><span>The deterministic calculator emits one explainable fixture; it does not prove this package is optimal.</span></div><b>{result.allocations.length} proposed actions</b></header><div className="solution-package-grid"><div className="table-scroll"><table><thead><tr><th>Action</th><th>Volume</th><th>Timing</th><th>Owner</th><th>Cost</th><th>Trace</th></tr></thead><tbody>{result.allocations.map((allocation, index) => <tr key={allocation.action}><td><b>{allocation.action}</b></td><td>{allocation.volume}</td><td>{allocation.timing}</td><td>{allocation.owner}</td><td>{allocation.cost}</td><td><button type="button" onClick={() => onToast(`Proposed-action receipt ${index + 1} opened for ${result.runId}: ${allocation.action}; ${allocation.volume}; ${allocation.timing}; ${allocation.owner}; ${allocation.cost}. This is a deterministic proposal and was not released.`)}>Receipt ◇</button></td></tr>)}</tbody></table></div><aside><p className="kicker">OBJECTIVE DECOMPOSITION</p>{result.objectiveBreakdown.map((item) => <button type="button" key={item.label} onClick={() => onToast(`${item.label} objective-component receipt opened for ${result.runId}: ${item.value} ${item.unit}. Deterministic calculation fixture; no shadow price or solver certificate.`)}><span>{item.label}</span><b>{item.unit === "$M" ? `$${item.value}M` : `${item.value} ${item.unit}`}</b></button>)}<div className="solution-warnings"><span>MODEL WARNINGS</span>{result.warnings.length ? result.warnings.map((warning) => <p key={warning}>{warning}</p>) : <p>No generated warning; evidence review is still required.</p>}</div></aside></div></section>
      <div className="release-evidence-layout">
        <section className="solution-report"><header className="or-section-head"><div><p className="kicker">SEVEN-BLOCK EVIDENCE REQUIREMENTS</p><h2>What is recorded, illustrative, or still missing</h2></div><b>2 recorded · 5 illustrative/demo</b></header>{solutionEvidenceBlocks.map((block, index) => <article key={block[0]}><span>0{index + 1}</span><div><b>{block[0]}</b><p>{block[1]}</p><small>{evidencePayloads[index].value}</small></div><em>{evidencePayloads[index].state}</em></article>)}</section>
        <aside className="reproducibility-card"><p className="kicker">REPRODUCIBILITY MANIFEST</p><h3>{result.runId}</h3><dl><div><dt>Evidence kind</dt><dd>Deterministic synthetic response calculator</dd></div><div><dt>Input fingerprint</dt><dd>{result.inputFingerprint}</dd></div><div><dt>Scope / case</dt><dd>{result.context.scope} · {result.context.caseId}</dd></div><div><dt>Decision</dt><dd>{result.context.decisionTitle}</dd></div><div><dt>Primary entity</dt><dd>{result.context.primaryEntity}</dd></div><div><dt>Selected map context</dt><dd>{result.context.entityContext}</dd></div><div><dt>Pattern / horizon</dt><dd>{result.context.patternId} · {result.context.horizon}</dd></div><div><dt>Method stack</dt><dd>{result.context.methodStack.join(" · ")}</dd></div><div><dt>Scenario set</dt><dd>{result.context.scenarioSetId}</dd></div><div><dt>Model / data</dt><dd>OR-CONTINUITY-2.5 · SYN-2026-09-04T09:30Z</dd></div><div><dt>Candidate-space index</dt><dd>{result.candidateSpaceIndex.toLocaleString()} · generated complexity indicator</dd></div><div><dt>Claim boundary</dt><dd>No solver execution, bound, gap, shadow price, or mathematical optimality certificate</dd></div></dl><aside><b>NO LIVE WRITE-BACK</b><p>Approval controls demonstrate product behavior only. ERP, TMS, WMS, planning, carrier, and payment systems are not connected.</p></aside></aside>
      </div>
      <section className="run-history"><header className="or-section-head"><div><p className="kicker">20 GENERATED HISTORY FIXTURES</p><h2>Estimate, fallback, rejection, and model-version examples</h2></div><b>Demo records · not persisted</b></header><div className="table-scroll"><table><thead><tr><th>Estimate</th><th>As of</th><th>Status</th><th>Space index</th><th>Model</th><th>Change vs prior</th><th>Evidence</th></tr></thead><tbody>{syntheticRuns.map((run) => <tr key={run.id}><td><b>{run.id}</b></td><td>{run.time} UTC</td><td><span className={`run-state run-${run.status.toLowerCase()}`}>{run.status}</span></td><td>{run.candidateIndex.toLocaleString()}</td><td>{run.version}</td><td>{run.delta}</td><td><button type="button" onClick={() => onToast(`${run.id} generated evidence fixture opened.`)}>Open</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

export default function OptimizationWorkbench({ snapshot, activeCase, networkSelection, onToast }: { snapshot: ScopeSnapshot; activeCase: DecisionCase; networkSelection: MapSelectionContext | null; onToast: (message: string) => void }) {
  const [stage, setStage] = useState<WorkbenchStage>("frame");
  const [patternId, setPatternId] = useState(() => casePattern[activeCase.id] ?? "sourcing");
  const [horizon, setHorizon] = useState<string>(horizonOptions[1]);
  const [input, setInput] = useState<OptimizationInput>(initialInput);
  const [lastRunInput, setLastRunInput] = useState<OptimizationInput>(initialInput);
  const [lastRunContext, setLastRunContext] = useState<OptimizationContext>(() => buildReplayContext(snapshot.id, activeCase, casePattern[activeCase.id] ?? "sourcing", horizonOptions[1], networkSelection));
  const [result, setResult] = useState(() => solveNetworkPlan(initialInput, buildReplayContext(snapshot.id, activeCase, casePattern[activeCase.id] ?? "sourcing", horizonOptions[1], networkSelection)));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [inspectedMethod, setInspectedMethod] = useState<ORMethod["code"]>("M-06");
  const timer = useRef<number | null>(null);
  const progressTimer = useRef<number | null>(null);
  const pattern = decisionPatterns.find((item) => item.id === patternId) ?? decisionPatterns[0];
  const currentContext = useMemo(() => buildReplayContext(snapshot.id, activeCase, patternId, horizon, networkSelection), [snapshot.id, activeCase, patternId, horizon, networkSelection]);
  const preview = useMemo(() => solveNetworkPlan(input, currentContext), [input, currentContext]);
  const inputChanges = (Object.keys(input) as (keyof OptimizationInput)[]).filter((key) => input[key] !== lastRunInput[key]).map((key) => ({ key: String(key), label: String(key).replace(/([A-Z])/g, " $1"), before: String(lastRunInput[key]), after: String(input[key]) }));
  const contextChanges = [
    ["scope", "Scope", lastRunContext.scope, currentContext.scope],
    ["caseId", "Decision case", lastRunContext.caseId, currentContext.caseId],
    ["decisionTitle", "Decision title", lastRunContext.decisionTitle, currentContext.decisionTitle],
    ["primaryEntity", "Primary entity", lastRunContext.primaryEntity, currentContext.primaryEntity],
    ["entityContext", "Selected network entity", lastRunContext.entityContext, currentContext.entityContext],
    ["patternId", "Decision pattern", lastRunContext.patternId, currentContext.patternId],
    ["horizon", "Planning horizon", lastRunContext.horizon, currentContext.horizon],
    ["methodStack", "Method stack", lastRunContext.methodStack.join(" · "), currentContext.methodStack.join(" · ")],
    ["scenarioSetId", "Scenario set", lastRunContext.scenarioSetId, currentContext.scenarioSetId],
  ].filter((item) => item[2] !== item[3]).map((item) => ({ key: item[0], label: item[1], before: item[2], after: item[3] }));
  const pendingChanges = [...contextChanges, ...inputChanges];

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);
  }, []);

  const runReplay = () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    setRunning(true); setProgress(8);
    progressTimer.current = window.setInterval(() => setProgress((current) => Math.min(92, current + 13)), 160);
    timer.current = window.setTimeout(() => {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      const next = solveNetworkPlan(input, currentContext);
      setResult(next); setLastRunInput({ ...input }); setLastRunContext(currentContext); setProgress(100); setRunning(false); setStage("release");
      onToast(`${next.status}. ${next.releasable ? "Ready for human validation." : "Hard constraints must be resolved."}`);
    }, 1150);
  };
  const updateNumber = (key: keyof OptimizationInput, value: number) => setInput((current) => ({ ...current, [key]: value }));

  return (
    <div className="app-workspace optimizer-workbench">
      <header className="studio-header app-intro app-canonical-header optimizer-hero">
        <div><AppGlyph appId="optimizer" className="app-code optimizer-hero-code" /><p>PROJECT APP · {snapshot.shortLabel.toUpperCase()}</p><h1 tabIndex={-1} data-page-heading>Network Optimizer</h1><small>Define the decision model, compare scenarios, and prepare a response for expert review.</small></div>
        <aside><b>ACTIVE CONTRACT · {activeCase.id}</b><span>{pattern.name}</span><small>{activeCase.title} · {horizon}</small>{networkSelection && <small>Map focus · {networkSelection.kind} · {networkSelection.label}</small>}<button type="button" onClick={runReplay} disabled={running}>{running ? `Calculating fixture · ${progress}%` : pendingChanges.length ? `Recalculate ${pendingChanges.length} pending changes →` : "Recalculate current response →"}</button></aside>
      </header>
      <div className={`replay-strip ${result.releasable && !pendingChanges.length ? "replay-ready" : "replay-blocked"}`}><span><Dot tone={running || pendingChanges.length ? "watch" : result.releasable ? "healthy" : "critical"} />{running ? "Deterministic response calculation in progress" : pendingChanges.length ? "Completed result is stale · decision contract changed" : result.status}</span><b>{result.runId}</b><em>NO SOLVER / OPTIMALITY CLAIM · SPACE INDEX {result.candidateSpaceIndex.toLocaleString()} · {result.context.caseId} · 12 SCENARIOS</em>{running && <i style={{ width: `${progress}%` }} />}</div>
      <div className="or-metrics"><ReplayMetric label="Margin protected" value={`$${result.protectedMargin}M`} detail="Compared with synthetic no-action baseline" tone="opportunity" onTrace={onToast} /><ReplayMetric label="Response cost" value={`$${result.totalCost}M`} detail={`Run authority $${lastRunInput.budgetMillions}M`} onTrace={onToast} /><ReplayMetric label="Projected OTIF" value={`${result.projectedService}%`} detail={`Run hard floor ${lastRunInput.serviceTarget}%`} tone={result.projectedService >= lastRunInput.serviceTarget ? "healthy" : "critical"} onTrace={onToast} /><ReplayMetric label="Residual risk" value={`${result.residualRisk}%`} detail="Post-action synthetic score" tone="watch" onTrace={onToast} /><ReplayMetric label="Carbon delta" value={`${result.carbonDelta > 0 ? "+" : ""}${result.carbonDelta}%`} detail={`Run envelope ${lastRunInput.carbonLimitPercent}%`} tone={result.carbonDelta <= lastRunInput.carbonLimitPercent ? "healthy" : "critical"} onTrace={onToast} /><ReplayMetric label="Review gate" value={pendingChanges.length ? "Stale" : result.releasable ? "Review-ready" : "Blocked"} detail={pendingChanges.length ? `${pendingChanges.length} changes need recalculation` : `${result.hardViolations.length} hard checks failed`} tone={pendingChanges.length ? "watch" : result.releasable ? "opportunity" : "critical"} onTrace={onToast} /></div>
      <nav className="or-stage-nav" aria-label="Optimization workbench stages">{stages.map((item, index) => <button className={stage === item.id ? "active" : ""} type="button" key={item.id} onClick={() => setStage(item.id)}><span>0{index + 1}</span><div><b>{item.label}</b><small>{item.detail}</small></div>{item.id === "release" && <em className={result.releasable ? "gate-ready" : "gate-blocked"}>{result.releasable ? "Ready" : "Blocked"}</em>}</button>)}</nav>
      {pendingChanges.length > 0 && <section className="pending-change-strip"><div><span>PENDING DECISION-CONTRACT CHANGES</span><b>{pendingChanges.length} fields differ from {result.runId}</b></div>{pendingChanges.map((change) => <article key={change.key}><span>{change.label}</span><b>{change.before} → {change.after}</b></article>)}<button type="button" onClick={runReplay} disabled={running}>Recalculate changes</button></section>}
      {stage === "frame" && <FrameStage patternId={patternId} onPatternChange={setPatternId} horizon={horizon} onHorizonChange={setHorizon} />}
      {stage === "formulate" && <FormulateStage input={input} preview={preview} decisionTitle={activeCase.title} updateNumber={updateNumber} setStrategy={(strategy) => setInput((current) => ({ ...current, strategy }))} />}
      {stage === "methods" && <MethodsStage pattern={pattern} selectedCode={inspectedMethod} onSelect={setInspectedMethod} />}
      {stage === "stress" && <StressStage result={result} input={lastRunInput} onTrace={onToast} />}
      {stage === "release" && <ReleaseStage result={result} dirty={pendingChanges.length > 0} onToast={onToast} />}
    </div>
  );
}
