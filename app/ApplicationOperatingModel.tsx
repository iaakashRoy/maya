"use client";

import { useState } from "react";
import { applicationBlueprints, type ApplicationDetailId } from "./application-catalog";

type SectionId = "operating" | "methods" | "data" | "measure";

const sections: readonly { id: SectionId; label: string; detail: string }[] = [
  { id: "operating", label: "Operating model", detail: "Decision and workflow" },
  { id: "methods", label: "Methods", detail: "Logic and validation" },
  { id: "data", label: "Data & controls", detail: "Contracts and governance" },
  { id: "measure", label: "Measure & hand off", detail: "KPIs and execution" },
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

export default function ApplicationOperatingModel({ id }: { id: ApplicationDetailId }) {
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
          <span><b>{blueprint.workflow.length}</b> workflow gates</span>
          <span><b>{blueprint.methods.length}</b> methods</span>
          <span><b>{blueprint.dataContracts.length}</b> data contracts</span>
          <span><b>{blueprint.controls.length}</b> controls</span>
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
                <footer><b>Validation</b><p>{method.validation}</p></footer>
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
                  <thead><tr><th>Data product</th><th>Decision grain</th><th>Authoritative sources</th><th>Freshness</th><th>Fitness checks</th></tr></thead>
                  <tbody>{blueprint.dataContracts.map((contract) => <tr key={contract.name}><td><b>{contract.name}</b></td><td>{contract.grain}</td><td>{contract.sources}</td><td>{contract.freshness}</td><td>{contract.quality}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
            <aside className="control-register">
              <div className="blueprint-subhead"><span>CONTROL REGISTER</span><h3>What prevents unsafe automation</h3></div>
              {blueprint.controls.map((control) => (
                <article key={control.name}>
                  <i className={`tone-dot tone-${control.tone}`} />
                  <div><b>{control.name}</b><p>{control.rule}</p><small>{control.owner} · {control.evidence}</small></div>
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
                  <p>{kpi.definition}</p><small>Accountable · {kpi.owner}</small>
                </article>
              ))}</div>
            </section>
            <section className="handoff-register">
              <div className="blueprint-subhead"><span>CONTROLLED HANDOFFS</span><h3>Where the output goes next</h3></div>
              {blueprint.handoffs.map((handoff, index) => (
                <article key={handoff.destination}>
                  <span>0{index + 1}</span>
                  <div><b>{handoff.destination}</b><p>{handoff.trigger}</p><small>Artifact · {handoff.artifact}</small></div>
                </article>
              ))}
              <aside><b>Interpretation limits</b><ul>{blueprint.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></aside>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
