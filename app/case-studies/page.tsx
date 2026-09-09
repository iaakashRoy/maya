import type { Metadata } from "next";
import Link from "next/link";
import { caseStudyProfiles, simulationDisclaimer } from "../case-study-model";
import { projectApps, workspaceProjects } from "../workspace-model";
import { getOsCaseEvidence, osEvidenceFetchedOn } from "../os-case-evidence";
import "../agent-os.css";

export const metadata: Metadata = {
  title: "tanjnx Case Studies — Resilient Supply-Chain Decisions",
  description: "Ten interactive, public-information-inspired supply-chain simulations showing how tanjnx turns evidence and disruption signals into governed decisions.",
};

const appName = (id: string) => projectApps.find((app) => app.id === id)?.name ?? id;
const portfolioDepth = caseStudyProfiles.reduce((total, profile) => ({
  nodes: total.nodes + profile.supplyChain.nodes.length,
  dependencies: total.dependencies + profile.supplyChain.edges.length,
  checkpoints: total.checkpoints + profile.supplyChain.checkpoints.length,
  signals: total.signals + profile.supplyChain.signals.length,
}), { nodes: 0, dependencies: 0, checkpoints: 0, signals: 0 });

export default function CaseStudiesPage() {
  return <main className="case-study-deck">
    <header className="case-study-deck__topbar">
      <Link className="case-study-deck__brand" href="/"><span>tanjnx</span><small>Supply chain workspace</small></Link>
      <nav aria-label="Case study navigation"><a href="#how-it-works">How it works</a><a href="#portfolio">10 cases</a><a href="#interpretation">Interpretation</a><a href="/tanjnx-case-studies.html" target="_blank" rel="noreferrer">Presentation ↗</a><Link className="case-study-deck__workspace" href="/">Open workspace</Link></nav>
    </header>

    <section className="case-study-hero">
      <p>CASE STUDY LIBRARY · 10 CLIENT SIMULATIONS</p>
      <h1>See a disruption become<br />a defensible decision.</h1>
      <div><p>Each case starts with a product promise, injects a compound crisis, traces its impact through project data, and produces a human-governed resilient response.</p><dl><div><dt>10</dt><dd>companies</dd></div><div><dt>{portfolioDepth.nodes}</dt><dd>operating nodes</dd></div><div><dt>{portfolioDepth.dependencies}</dt><dd>dependencies</dd></div><div><dt>{portfolioDepth.checkpoints + portfolioDepth.signals}</dt><dd>checks + signals</dd></div></dl></div>
      <aside><b>Simulation boundary</b><span>{simulationDisclaimer}</span></aside>
    </section>

    <section id="how-it-works" className="case-study-method">
      <header><p>HOW TANJNX WORKS</p><h2>One governed path from signal to action</h2></header>
      <ol>
        <li><span>01</span><b>Observe</b><p>Project data, IoT-shaped events, public context, and human inputs enter separate evidence classes.</p></li>
        <li><span>02</span><b>Connect</b><p>The knowledge graph resolves product, supplier, material, facility, route, customer, policy, and claim dependencies.</p></li>
        <li><span>03</span><b>Formulate</b><p>Agents translate the business decision into variables, objectives, hard constraints, scenarios, and methods.</p></li>
        <li><span>04</span><b>Stress</b><p>Seeded simulation compares baseline, P50, P90, P95, worst case, CVaR, and minimum-regret alternatives.</p></li>
        <li><span>05</span><b>Govern</b><p>Evidence Auditor and named human owners review the result before any operational release or write-back.</p></li>
      </ol>
    </section>

    <section id="portfolio" className="case-study-portfolio">
      <header><p>THE PORTFOLIO</p><h2>Ten products. Ten failure modes. Ten different decisions.</h2><span>Select a case to understand the operating problem, model, response, and evidence trail.</span></header>
      <nav aria-label="Jump to a company">{caseStudyProfiles.map((profile, index) => <a key={profile.projectId} href={`#${profile.projectId}`}><span>{String(index + 1).padStart(2, "0")}</span>{profile.company}</a>)}</nav>
    </section>

    {caseStudyProfiles.map((profile, index) => {
      const project = workspaceProjects.find((item) => item.id === profile.projectId)!;
      const currentEvidence = getOsCaseEvidence(profile.projectId);
      return <article className="case-study" id={profile.projectId} key={profile.projectId}>
        <header className="case-study__header">
          <div><span>{String(index + 1).padStart(2, "0")}</span><p>{project.sector} · {project.code}</p><h2>{profile.company}</h2><h3>{profile.project}</h3></div>
          <div className="case-study__header-actions"><a href={`/?view=company&project=${profile.projectId}&projectTab=overview`}>Open project →</a><a href={`/decision-journey?client=${project.clientId === "tata-motors" ? "tata" : project.clientId}`}>Rehearse decision →</a><a href={`/?view=company&project=${profile.projectId}&projectTab=agents`}>Run in Playground →</a></div>
        </header>

        <section className="case-study__brief">
          <div><small>PRODUCT PROMISE</small><b>{profile.product}</b><p>{project.problem}</p></div>
          <div className="case-study__shock"><small>COMPOUND CRISIS</small><b>{profile.shock}</b><p>{profile.trigger}</p></div>
          <div><small>DECISION TO MAKE</small><b>{profile.decision}</b><p>{project.outcome}</p></div>
        </section>

        {currentEvidence && <section className="case-os-update"><h3>Evidence-backed operating mission</h3><p>{currentEvidence.scenarioNarrative}</p><a href={`/?view=os&osProject=${profile.projectId}`}>Open this mission and calculate a response ↗</a><p>Public sources checked {osEvidenceFetchedOn}. Operational inputs below are modeled programme slices, not company disclosures.</p><ul>{currentEvidence.publicContext.map((fact) => <li key={fact.sourceId}>{fact.fact} <a href={currentEvidence.sources.find((source) => source.id === fact.sourceId)?.url} target="_blank" rel="noreferrer">Source ({fact.asOf}) ↗</a></li>)}</ul><details><summary>Six additional domain assumptions</summary><ul>{currentEvidence.scenario.operationalInputs.map((item) => <li key={item.label}><b>{item.label}: {item.value} {item.unit}.</b> {item.meaning}</li>)}</ul></details><p><b>How to interpret:</b> {currentEvidence.outcomeInterpretation}</p></section>}
        <section className="case-study__result">
          <div className="case-study__recommendation"><small>ILLUSTRATIVE RESPONSE BRIEF</small><h3>{profile.response}</h3><p>Legacy authored scenario figures below are not calculated outcomes. Use Mission control to compute the current model and examine failed gates. Human review owner: {project.owner}.</p></div>
          <dl><div><dt>Baseline</dt><dd>{profile.baseline}</dd></div><div><dt>P50</dt><dd>{profile.p50}</dd></div><div><dt>P90</dt><dd>{profile.p90}</dd></div><div><dt>P95</dt><dd>{profile.p95}</dd></div><div><dt>Worst tested</dt><dd>{profile.worstCase}</dd></div><div><dt>Tail-risk value</dt><dd>{profile.cvar}</dd></div></dl>
        </section>

        <section className="case-study__workspace-map">
          <div><small>MOUNTED APPS</small><ul>{profile.apps.map((app) => <li key={app}><span>{projectApps.find((item) => item.id === app)?.icon}</span>{appName(app)}</li>)}</ul></div>
          <div><small>HARD CONSTRAINTS</small><ol>{profile.hardConstraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ol></div>
          <div><small>METHOD STACK</small><p>{profile.methods.join(" · ")}</p><a href={`/?view=company&project=${profile.projectId}&projectTab=decisions`}>Inspect decision graph →</a></div>
        </section>

        <section className="case-study__data">
          <header><div><small>PROJECT DATA</small><h3>Six governed data products</h3></div><a href={`/?view=company&project=${profile.projectId}&projectTab=data`}>Inspect data and graph →</a></header>
          <div>{profile.datasets.map((item, dataIndex) => <article key={item.name}><span>{String(dataIndex + 1).padStart(2, "0")}</span><b>{item.name}</b><p>{item.source}</p><small>{item.grain}</small><footer><em>{item.rows} rows</em><em>{item.freshness}</em><strong>{item.quality}% quality</strong></footer></article>)}</div>
        </section>

        <section className="case-study__network">
          <header><div><small>MULTILEVEL SUPPLY NETWORK</small><h3>{profile.supplyChain.stages.length} levels from origin to outcome</h3></div><dl><div><dt>{profile.supplyChain.nodes.length}</dt><dd>nodes</dd></div><div><dt>{profile.supplyChain.edges.length}</dt><dd>dependencies</dd></div><div><dt>{profile.supplyChain.checkpoints.length}</dt><dd>chokepoints</dd></div><div><dt>{profile.supplyChain.signals.length}</dt><dd>signals</dd></div></dl><a href={`/?view=company&project=${profile.projectId}&projectTab=data`}>Open Graph + Chokepoints &#8594;</a></header>
          <div className="case-study__stage-path">{profile.supplyChain.stages.map((stage) => <article key={stage.id}><span>{String(stage.sequence).padStart(2, "0")}</span><b>{stage.label}</b><small>{stage.description}</small><em>{profile.supplyChain.nodes.filter((node) => node.stageId === stage.id).length} paths</em></article>)}</div>
          <div className="case-study__checkpoint-summary"><small>HIGHEST-RISK CHECKPOINTS</small>{[...profile.supplyChain.checkpoints].sort((left, right) => right.observed - left.observed).slice(0, 4).map((checkpoint) => <article data-severity={checkpoint.severity} key={checkpoint.id}><span>{checkpoint.severity}</span><b>{checkpoint.title}</b><p>{checkpoint.observed} / {checkpoint.target} {checkpoint.unit} · {checkpoint.trend}</p><small>{checkpoint.downstreamImpact}</small></article>)}</div>
        </section>

        <section className="case-study__timeline">
          <header><small>AGENT + HUMAN TRACE</small><h3>Forty-two simulated seconds from signal to review</h3></header>
          <ol>{profile.timeline.map((event) => <li data-state={event.state} key={`${event.time}-${event.actor}`}><time>{event.time}</time><span><b>{event.actor}</b><p>{event.event}</p></span></li>)}</ol>
        </section>

        <footer className="case-study__evidence">
          <div><small>PUBLIC CONTEXT</small><p>{profile.publicContext}</p><a href={profile.publicSource.url} target="_blank" rel="noreferrer">{profile.publicSource.label} ↗</a><span>{profile.publicSource.asOf}</span></div>
          <div><small>INTERPRETATION BOUNDARY</small><p>{simulationDisclaimer}</p><span>No live feed, source system, solver, supplier commitment, or write-back was used.</span></div>
        </footer>
      </article>;
    })}

    <section id="interpretation" className="case-study-interpretation">
      <header><p>INTERPRETATION GUIDE</p><h2>How to read a tanjnx result</h2></header>
      <div><article><b>Baseline</b><p>What the current plan produces when the selected disruption is applied.</p></article><article><b>P50</b><p>The median modeled outcome across the deterministic scenario set.</p></article><article><b>P90 / P95</b><p>Conservative service or outcome levels reached in 90% or 95% of modeled draws.</p></article><article><b>Worst tested</b><p>The lowest result among the explicitly modeled scenarios—not every possible future.</p></article><article><b>CVaR</b><p>The average consequence inside the modeled tail beyond the selected risk threshold.</p></article><article><b>Confidence</b><p>Evidence and model confidence, not a guarantee that the future will occur as modeled.</p></article></div>
      <Link href="/">Start in the workspace →</Link>
    </section>
  </main>;
}
