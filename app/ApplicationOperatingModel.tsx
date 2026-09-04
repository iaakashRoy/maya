"use client";

import { useState } from "react";
import { applicationBlueprints, type ApplicationDetailId } from "./application-catalog";
import { getApplicationChanges, learningContracts } from "./application-change-model";
import type { WorkspaceProject } from "./workspace-model";

type SectionId = "operating" | "methods" | "data" | "measure" | "change";

const sections: readonly { id: SectionId; label: string; detail: string }[] = [
  { id: "operating", label: "Operating model", detail: "Decision and workflow" },
  { id: "methods", label: "Methods", detail: "Logic and validation" },
  { id: "data", label: "Data & controls", detail: "Contracts and governance" },
  { id: "measure", label: "Measure & hand off", detail: "KPIs and execution" },
  { id: "change", label: "Change & learning", detail: "Before, now, forecast" },
];

function BlueprintNav({ active, onChange }: { active: SectionId; onChange: (section: SectionId) => void }) {
  return (
    <div className="blueprint-tabs" role="tablist" aria-label="Application operating model sections">
      {sections.map((section, index) => (
        <button
          aria-controls={`blueprint-panel-${section.id}`}
          aria-selected={active === section.id}
          className={active === section.id ? "active" : ""}
          id={`blueprint-tab-${section.id}`}
          key={section.id}
          onClick={() => onChange(section.id)}
          role="tab"
          type="button"
        >
          <span>0{index + 1}</span>
          <div><b>{section.label}</b><small>{section.detail}</small></div>
        </button>
      ))}
    </div>
  );
}

function ChangeLearningPanel({ id, project, onTrace }: { id: ApplicationDetailId; project?: WorkspaceProject; onTrace: (message: string) => void }) {
  const changes = getApplicationChanges(id).map((change, index) => project ? {
    ...change,
    id: `${project.code}-${change.id}`,
    title: `${project.metrics[index % project.metrics.length].label} changed inside ${project.name}`,
    entity: `${project.client} · ${project.variablePack.l0[index % project.variablePack.l0.length]}`,
    cause: `${project.problem} This explanation is a deterministic project fixture, not a live causal inference.`,
    evidence: `${project.metrics[index % project.metrics.length].evidenceRef} · synthetic project receipt`,
    decisionTrigger: `Send to the ${project.name} human review gate when its project policy is met.`,
    owner: index % 2 ? "Project OR scientist" : project.owner,
    downstream: `${project.code} decision tree`,
  } : change);
  const learning = learningContracts[id];
  const [horizon, setHorizon] = useState("All horizons");
  const filtered = changes.filter((change) => horizon === "All horizons" || change.horizon === horizon);
  const [selectedId, setSelectedId] = useState(changes[0].id);
  const selected = filtered.find((change) => change.id === selectedId) ?? filtered[0] ?? changes[0];
  const changeHorizon = (nextHorizon: string) => {
    const nextChanges = changes.filter((change) => nextHorizon === "All horizons" || change.horizon === nextHorizon);
    setHorizon(nextHorizon);
    setSelectedId((current) => nextChanges.some((change) => change.id === current) ? current : (nextChanges[0]?.id ?? changes[0].id));
  };

  return (
    <div className="blueprint-change-layout">
      <section className="change-register">
        <div className="blueprint-subhead change-subhead"><div><span>CAUSAL CHANGE LEDGER · DETERMINISTIC SYNTHETIC DATA</span><h3>What changed, why it changed, and which decision moves next</h3><p>Every event retains an as-of time, before/current/forecast values, provenance, confidence, trigger, and accountable owner.</p></div><label>Horizon<select value={horizon} onChange={(event) => changeHorizon(event.target.value)}><option>All horizons</option>{["Now", "24 hours", "7 days", "30 days", "90 days"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className="change-event-list">{filtered.map((change) => <button className={selected.id === change.id ? "active" : ""} type="button" key={change.id} onClick={() => setSelectedId(change.id)}><i className={`tone-dot tone-${change.tone}`} /><span className="change-time"><b>{change.horizon}</b><small>{change.asOf}</small></span><div><b>{change.title}</b><small>{change.entity} · {change.metric}</small></div><strong>{change.delta}</strong><em>{change.confidence}%</em></button>)}</div>
      </section>
      <aside className="change-inspector">
        <header><i className={`tone-dot tone-${selected.tone}`} /><div><p className="kicker">SELECTED CHANGE · {selected.id}</p><h3>{selected.title}</h3><span>{selected.entity} · {selected.asOf}</span></div></header>
        <div className="before-now-forecast"><article><span>BEFORE</span><b>{selected.previous}</b></article><i>→</i><article className="current"><span>CURRENT</span><b>{selected.current}</b></article><i>→</i><article><span>FORECAST</span><b>{selected.forecast}</b></article></div>
        <section><span>WHY IT CHANGED</span><p>{selected.cause}</p></section>
        <section><span>EVIDENCE + CONFIDENCE</span><p>{selected.evidence}</p><div className="change-confidence"><i style={{ width: `${selected.confidence}%` }} /><b>{selected.confidence}%</b></div></section>
        <section><span>DECISION TRIGGER</span><p>{selected.decisionTrigger}</p></section>
        <dl><div><dt>Accountable owner</dt><dd>{selected.owner}</dd></div><div><dt>Downstream handoff</dt><dd>{selected.downstream}</dd></div></dl>
        <button data-action-id={`blueprint.change-receipt.${selected.id}`} type="button" onClick={() => onTrace(`${selected.id} change receipt opened: ${selected.metric} moved from ${selected.previous} to ${selected.current}; forecast ${selected.forecast}; delta ${selected.delta}; confidence ${selected.confidence}%. Evidence ${selected.evidence}. This is a deterministic synthetic change record.`)}>Trace selected change ◇</button>
      </aside>
      <section className="learning-loop">
        <header><div><p className="kicker">CLOSED-LOOP LEARNING TARGET · SYNTHETIC FIXTURE</p><h3>Expected versus realized outcomes would feed the next governed decision</h3></div><span>Target shadow mode · not running</span></header>
        <div className="learning-flow"><article><span>01</span><div><b>Predict</b><small>Champion fixture · {learning.champion}</small></div></article><i>→</i><article><span>02</span><div><b>Decide + record</b><small>Target contract: retain inputs, version, rationale, approval, and fallback.</small></div></article><i>→</i><article><span>03</span><div><b>Observe outcome</b><small>Target window · {learning.outcomeWindow}</small></div></article><i>→</i><article><span>04</span><div><b>Challenge + improve</b><small>Challenger fixture · {learning.challenger}</small></div></article></div>
        <dl><div><dt>Synthetic validation replay</dt><dd>{learning.lastValidation}</dd></div><div><dt>Target review fixture</dt><dd>{learning.nextReview}</dd></div><div><dt>Proposed drift trigger</dt><dd>{learning.driftTrigger}</dd></div><div><dt>Proposed feedback destination</dt><dd>{learning.feedbackDestination}</dd></div></dl>
      </section>
    </div>
  );
}

export default function ApplicationOperatingModel({ id, project, onTrace }: { id: ApplicationDetailId; project?: WorkspaceProject; onTrace: (message: string) => void }) {
  const [active, setActive] = useState<SectionId>("operating");
  const blueprint = applicationBlueprints[id];

  return (
    <section className="panel application-blueprint" aria-labelledby={`${id}-blueprint-title`}>
      <header className="blueprint-header">
        <div>
          <p className="kicker">APPLICATION OPERATING MODEL · SYNTHETIC CONCEPT</p>
          <h2 id={`${id}-blueprint-title`}>How {blueprint.name} turns evidence into action</h2>
          <p>{blueprint.purpose}</p>
        </div>
        <div className="blueprint-coverage" aria-label="Operating model coverage">
          <button data-action-id="blueprint.coverage.workflow" type="button" onClick={() => onTrace(`${blueprint.name} operating-model receipt: ${blueprint.workflow.length} workflow gates are catalogued in this static blueprint.`)}><b>{blueprint.workflow.length}</b> workflow gates</button>
          <button data-action-id="blueprint.coverage.methods" type="button" onClick={() => onTrace(`${blueprint.name} method receipt: ${blueprint.methods.length} application methods are catalogued; this count is not solver execution.`)}><b>{blueprint.methods.length}</b> methods</button>
          <button data-action-id="blueprint.coverage.data" type="button" onClick={() => onTrace(`${blueprint.name} data-contract receipt: ${blueprint.dataContracts.length} expected contracts are catalogued; no source connection is implied.`)}><b>{blueprint.dataContracts.length}</b> data contracts</button>
          <button data-action-id="blueprint.coverage.controls" type="button" onClick={() => onTrace(`${blueprint.name} control receipt: ${blueprint.controls.length} target controls are catalogued; production enforcement is not connected.`)}><b>{blueprint.controls.length}</b> controls</button>
        </div>
      </header>

      <BlueprintNav active={active} onChange={setActive} />

      <div
        aria-labelledby={`blueprint-tab-${active}`}
        className="blueprint-panel"
        id={`blueprint-panel-${active}`}
        role="tabpanel"
      >
        {active === "operating" && (
          <div className="blueprint-operating">
            <div className="decision-question">
              <span>THE DECISION THIS APP EXISTS TO IMPROVE</span>
              <blockquote>{blueprint.decisionQuestion}</blockquote>
            </div>
            <dl className="operating-facts">
              <div><dt>Primary users</dt><dd>{blueprint.primaryUsers}</dd></div>
              <div><dt>Decision cadence</dt><dd>{blueprint.cadence}</dd></div>
              <div><dt>Planning horizon</dt><dd>{blueprint.horizon}</dd></div>
              <div><dt>Decision rights</dt><dd>{blueprint.authority}</dd></div>
            </dl>
            <div className="workflow-gates">
              {blueprint.workflow.map((step, index) => (
                <article key={step.phase}>
                  <header><span>0{index + 1}</span><b>{step.phase}</b></header>
                  <p>{step.activity}</p>
                  <dl><div><dt>Accountable</dt><dd>{step.accountable}</dd></div><div><dt>Exit criteria</dt><dd>{step.exitCriteria}</dd></div></dl>
                </article>
              ))}
            </div>
          </div>
        )}

        {active === "methods" && (
          <div className="method-grid">
            {blueprint.methods.map((method, index) => (
              <article key={method.name}>
                <header><span>0{index + 1}</span><div><small>{method.family}</small><h3>{method.name}</h3></div></header>
                <p>{method.purpose}</p>
                <div><span>FORMULATION</span><code>{method.formulation}</code></div>
                <footer><b>Validation</b><p>{method.validation}</p><button data-action-id={`blueprint.method.${index + 1}`} type="button" onClick={() => onTrace(`${blueprint.name} method reference opened: ${method.name}; family ${method.family}; formulation ${method.formulation}; validation contract ${method.validation}. No solver was invoked.`)}>Open method reference ◇</button></footer>
              </article>
            ))}
          </div>
        )}

        {active === "data" && (
          <div className="blueprint-data-layout">
            <section className="data-contracts">
              <div className="blueprint-subhead"><span>INPUT CONTRACTS</span><h3>Data must be fit for this decision</h3><p>Each contract defines business grain, expected source, latency, and the checks required before model use.</p></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Data product</th><th>Decision grain</th><th>Expected sources</th><th>Target freshness</th><th>Fitness checks</th><th>Trace</th></tr></thead>
                  <tbody>{blueprint.dataContracts.map((contract, index) => <tr key={contract.name}><td><b>{contract.name}</b></td><td>{contract.grain}</td><td>{contract.sources}</td><td>{contract.freshness}</td><td>{contract.quality}</td><td><button data-action-id={`blueprint.data-contract.${index + 1}`} type="button" onClick={() => onTrace(`${blueprint.name} expected data contract opened: ${contract.name}; grain ${contract.grain}; expected sources ${contract.sources}; target freshness ${contract.freshness}; checks ${contract.quality}. No connector health is asserted.`)}>Receipt ◇</button></td></tr>)}</tbody>
                </table>
              </div>
            </section>
            <aside className="control-register">
              <div className="blueprint-subhead"><span>CONTROL REGISTER</span><h3>What prevents unsafe automation</h3></div>
              {blueprint.controls.map((control) => (
                <article key={control.name}>
                  <i className={`tone-dot tone-${control.tone}`} />
                  <div><b>{control.name}</b><p>{control.rule}</p><small>{control.owner} · {control.evidence}</small><button data-action-id={`blueprint.control.${control.name.toLowerCase().replaceAll(" ", "-")}`} type="button" onClick={() => onTrace(`${blueprint.name} control reference opened: ${control.name}; rule ${control.rule}; target owner ${control.owner}; expected evidence ${control.evidence}. This concept does not assert production enforcement.`)}>Trace control ◇</button></div>
                </article>
              ))}
            </aside>
          </div>
        )}

        {active === "measure" && (
          <div className="blueprint-measure-layout">
            <section className="kpi-cards">
              <div className="blueprint-subhead"><span>VALUE + MODEL HEALTH</span><h3>Measures that show whether the app works</h3></div>
              <div>{blueprint.kpis.map((kpi) => (
                <article key={kpi.name}>
                  <header><i className={`tone-dot tone-${kpi.tone}`} /><b>{kpi.name}</b><strong>{kpi.target}</strong></header>
                  <p>{kpi.definition}</p><small>Accountable · {kpi.owner}</small><button data-action-id={`blueprint.kpi.${kpi.name.toLowerCase().replaceAll(" ", "-")}`} type="button" onClick={() => onTrace(`${blueprint.name} KPI contract opened: ${kpi.name}; target ${kpi.target}; definition ${kpi.definition}; accountable owner ${kpi.owner}. This is a target, not a measured live result.`)}>Trace KPI contract ◇</button>
                </article>
              ))}</div>
            </section>
            <section className="handoff-register">
              <div className="blueprint-subhead"><span>CONTROLLED HANDOFFS</span><h3>Where the output goes next</h3></div>
              {blueprint.handoffs.map((handoff, index) => (
                <article key={handoff.destination}>
                  <span>0{index + 1}</span>
                  <div><b>{handoff.destination}</b><p>{handoff.trigger}</p><small>Artifact · {handoff.artifact}</small><button data-action-id={`blueprint.handoff.${index + 1}`} type="button" onClick={() => onTrace(`${blueprint.name} handoff contract opened: destination ${handoff.destination}; trigger ${handoff.trigger}; artifact ${handoff.artifact}. No external system handoff occurred.`)}>Trace handoff ◇</button></div>
                </article>
              ))}
              <aside><b>Interpretation limits</b><ul>{blueprint.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></aside>
            </section>
          </div>
        )}

        {active === "change" && <ChangeLearningPanel id={id} project={project} key={`${id}-${project?.id ?? "platform"}`} onTrace={onTrace} />}
      </div>
    </section>
  );
}
