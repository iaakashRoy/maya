"use client";

import { useMemo, useState } from "react";
import {
  applications,
  decisionStageOrder,
  type AppId,
  type DecisionCase,
  type WorkflowViewId,
} from "./platform-model";

type DecisionWorkspacesProps = {
  view: WorkflowViewId;
  cases: readonly DecisionCase[];
  activeCase: DecisionCase;
  scopeLabel: string;
  financeReviewer: string;
  executiveReviewer: string;
  onOpenCase: (caseId: string, destination?: "case" | "action") => void;
  onOpenApp: (destination: AppId | "graph") => void;
  onUpdateCase: (caseId: string, patch: Partial<DecisionCase>, message: string) => void;
  onToast: (message: string) => void;
};

const appById = Object.fromEntries(applications.map((app) => [app.id, app])) as Record<AppId, (typeof applications)[number]>;

export default function DecisionWorkspaces(props: DecisionWorkspacesProps) {
  if (props.view === "decisions") return <DecisionInbox {...props} />;
  if (props.view === "action") return <ActionRoom {...props} />;
  return <CaseWorkspace {...props} />;
}

function DecisionInbox({ cases, activeCase, scopeLabel, onOpenCase, onToast }: DecisionWorkspacesProps) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visibleCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesFilter = filter === "All"
        || (filter === "Critical" && item.severity === "Critical")
        || (filter === "Approval" && item.stage === "Approve")
        || (filter === "Execution" && item.stage === "Execute")
        || (filter === "Measure" && item.stage === "Measure");
      const searchable = `${item.id} ${item.title} ${item.owner} ${item.primaryEntity} ${item.affectedEntities.join(" ")}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [cases, filter, query]);

  const approvalCount = cases.filter((item) => item.stage === "Approve").length;
  const executionCount = cases.filter((item) => item.stage === "Execute").length;
  const measuredCount = cases.filter((item) => item.stage === "Measure").length;

  return (
    <section className="decision-workspace" aria-labelledby="decision-inbox-heading">
      <header className="workflow-intro">
        <div><p className="kicker">GOVERNED DECISION OPERATIONS</p><h1 id="decision-inbox-heading" data-page-heading tabIndex={-1}>Decision Inbox</h1><p>One prioritized queue for signals, simulations, approvals, execution, and measured outcomes across every connected application.</p></div>
        <div className="workflow-intro-context"><span>ACTIVE SCOPE</span><b>{scopeLabel}</b><small>{cases.length} governed cases</small></div>
      </header>

      <div className="workflow-metrics" aria-label="Decision queue summary">
        <Metric label="Open value" value={sumDisplayedValue(cases)} detail="protected or recoverable" tone="opportunity" onTrace={onToast} />
        <Metric label="Awaiting approval" value={String(approvalCount)} detail="executive decisions" tone={approvalCount ? "critical" : "healthy"} onTrace={onToast} />
        <Metric label="In execution" value={String(executionCount)} detail="actions released" tone="info" onTrace={onToast} />
        <Metric label="Measuring" value={String(measuredCount)} detail="outcomes tracked" tone="healthy" onTrace={onToast} />
      </div>

      <section className="decision-register panel">
        <header className="panel-heading decision-register-heading"><div><p className="kicker">PRIORITIZED WORK</p><h2>Cases requiring coordinated action</h2></div><label className="decision-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Case, supplier, product..." /></label></header>
        <div className="decision-controls" role="group" aria-label="Filter decision cases">
          {["All", "Critical", "Approval", "Execution", "Measure"].map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}
          <span>{visibleCases.length} shown</span>
        </div>
        <div className="decision-table" role="table" aria-label="Decision cases">
          <div className="decision-table-head" role="row"><span>Case / decision</span><span>Stage</span><span>Owner / due</span><span>Value</span><span>Connected apps</span><span /></div>
          {visibleCases.map((item) => <button className={`decision-row ${item.id === activeCase.id ? "selected" : ""}`} type="button" role="row" key={item.id} onClick={() => onOpenCase(item.id)}>
            <span className="decision-title"><i className={`severity-${item.severity.toLowerCase()}`} /><span><small>{item.id} · {item.status}</small><b>{item.title}</b><em>{item.primaryEntity} · {item.serviceExposure}</em></span></span>
            <span className="decision-stage"><small>STEP {decisionStageOrder.indexOf(item.stage) + 1}/6</small><b>{item.stage}</b><i><em style={{ width: `${((decisionStageOrder.indexOf(item.stage) + 1) / decisionStageOrder.length) * 100}%` }} /></i></span>
            <span><b>{item.owner}</b><small>{item.due}</small></span>
            <span><b>{item.value}</b><small>{item.confidence}% confidence</small></span>
            <span className="app-token-row">{item.contributions.map((contribution) => <i key={contribution.app} title={appById[contribution.app].name}>{appById[contribution.app].icon}</i>)}</span>
            <span className="row-arrow">-&gt;</span>
          </button>)}
          {!visibleCases.length && <div className="empty-state"><b>No cases match this view.</b><span>Clear the search or choose another stage.</span></div>}
        </div>
      </section>
    </section>
  );
}

function CaseWorkspace({ activeCase, onOpenCase, onOpenApp, onToast }: DecisionWorkspacesProps) {
  return (
    <section className="decision-workspace" aria-labelledby="case-workspace-heading">
      <CaseHero item={activeCase} eyebrow="CASE WORKSPACE" titleId="case-workspace-heading" actions={<><button className="secondary-action" type="button" onClick={() => onOpenApp("graph")}>Open evidence graph</button><button className="primary-action" type="button" onClick={() => onOpenCase(activeCase.id, "action")}>Open Action Room</button></>} />
      <StageRail item={activeCase} />

      <section className="panel case-section">
        <header className="panel-heading"><div><p className="kicker">FIVE-APP SYNTHESIS</p><h2>What each application contributes</h2><p>Every output is attached to the same case, entities, variables, and evidence ledger.</p></div><span className="case-confidence">{activeCase.confidence}%<small>case confidence</small></span></header>
        <div className="contribution-grid">
          {activeCase.contributions.map((contribution) => {
            const app = appById[contribution.app];
            return <button className="contribution-card" type="button" key={contribution.app} onClick={() => onOpenApp(contribution.app)} style={{ "--app-accent": app.accent } as React.CSSProperties}><header><span>{app.icon}</span><div><b>{app.name}</b><small>{contribution.state} · {contribution.freshness}</small></div><i>-&gt;</i></header><strong>{contribution.value}</strong><h3>{contribution.headline}</h3><p>{contribution.detail}</p><footer><span>{contribution.method}</span><b>Open app</b></footer></button>;
          })}
        </div>
      </section>

      <ScenarioComparison item={activeCase} onTrace={onToast} />

      <div className="case-detail-grid">
        <section className="panel case-section"><header className="panel-heading"><div><p className="kicker">TRACEABILITY</p><h2>Variables and affected network</h2></div></header><h3 className="detail-label">Affected entities</h3><div className="entity-chip-row">{activeCase.affectedEntities.map((entity) => <span key={entity}>{entity}</span>)}</div><h3 className="detail-label">L0 decision variables</h3><div className="code-chip-row">{activeCase.variableIds.map((id) => <code key={id}>{id}</code>)}</div><h3 className="detail-label">Handbook method references</h3><div className="code-chip-row method-chips">{activeCase.methodCodes.map((code) => <code key={code}>{code}</code>)}</div></section>
        <section className="panel case-section"><header className="panel-heading"><div><p className="kicker">EVIDENCE LEDGER</p><h2>Facts behind the recommendation</h2></div><span>{activeCase.evidence.length} records</span></header><div className="evidence-list">{activeCase.evidence.map((evidence) => <button data-action-id={`case.evidence.${evidence.id}`} type="button" key={evidence.id} onClick={() => onToast(`${evidence.id} reference receipt opened: ${evidence.fact} Source ${evidence.source}; ${evidence.confidence}% synthetic case confidence; observed ${evidence.observed}. No source system was contacted.`)}><i className={`evidence-${evidence.kind.toLowerCase()}`} /><div><header><b>{evidence.source}</b><span>{evidence.kind} · {evidence.confidence}%</span></header><p>{evidence.fact}</p><small>{evidence.id} · {evidence.observed} · Open receipt →</small></div></button>)}</div></section>
      </div>

      <section className="panel outcome-strip"><div><p className="kicker">OUTCOME CONTRACT</p><h2>{activeCase.outcome.target}</h2><span>{activeCase.outcome.measurementWindow}</span><button data-action-id="case.outcome-receipt" type="button" onClick={() => onToast(`${activeCase.id} outcome receipt opened: baseline ${activeCase.outcome.baseline}; target ${activeCase.outcome.target}; realized ${activeCase.outcome.realized}; window ${activeCase.outcome.measurementWindow}. Values are synthetic case fixtures.`)}>Trace outcome receipt ◇</button></div><dl><div><dt>Baseline</dt><dd>{activeCase.outcome.baseline}</dd></div><div><dt>Realized</dt><dd>{activeCase.outcome.realized}</dd></div></dl></section>
    </section>
  );
}

function ActionRoom({ activeCase, financeReviewer, executiveReviewer, onOpenCase, onUpdateCase, onToast }: DecisionWorkspacesProps) {
  const approvalsComplete = activeCase.status === "Approved" || activeCase.status === "Executing" || activeCase.status === "Monitoring" || activeCase.status === "Closed";
  const recommended = activeCase.scenarios.find((scenario) => scenario.recommended) ?? activeCase.scenarios[0];
  const evidenceReady = activeCase.evidence.length > 0 && activeCase.confidence >= 80;
  const recommendationReady = recommended.feasibility === "Inside hard envelope";
  const approvalStatusReady = activeCase.status === "Awaiting approval";
  const approvalStageReached = decisionStageOrder.indexOf(activeCase.stage) >= decisionStageOrder.indexOf("Approve");
  const canRelease = activeCase.stage === "Approve" && approvalStatusReady && !approvalsComplete && evidenceReady && recommendationReady;
  const releaseGate = approvalsComplete
    ? "This synthetic case has already passed approval."
    : activeCase.stage !== "Approve"
      ? `Blocked until the case completes ${activeCase.stage} and enters Approve.`
      : !approvalStatusReady
        ? `Blocked while case status is ${activeCase.status}; Awaiting approval is required.`
      : !recommendationReady
        ? "Blocked until the recommended scenario is inside the hard decision envelope."
        : !evidenceReady
          ? "Blocked until governed evidence confidence reaches the review threshold."
          : "Ready for the named human approver; approval updates this concept session only.";

  const release = () => {
    if (!canRelease) {
      onToast(`${activeCase.id} cannot be released: ${releaseGate}`);
      return;
    }
    onUpdateCase(activeCase.id, { stage: "Execute", status: "Executing", updated: "Just now" }, `${activeCase.id} approved in this synthetic session; no operational write-back occurred.`);
  };
  const requestChanges = () => {
    if (activeCase.stage !== "Approve" || approvalsComplete) {
      onToast(`${activeCase.id} remains in ${activeCase.stage}; no lifecycle stage was changed.`);
      return;
    }
    onUpdateCase(activeCase.id, { stage: "Simulate", status: "In analysis", updated: "Just now" }, `${activeCase.id} returned to simulation in this synthetic session; no operational write-back occurred.`);
  };

  return (
    <section className="decision-workspace" aria-labelledby="action-room-heading">
      <CaseHero item={activeCase} eyebrow="CONTROLLED EXECUTION" titleId="action-room-heading" actions={<><button className="secondary-action" type="button" onClick={() => onOpenCase(activeCase.id)}>Back to case</button><button className="primary-action" type="button" onClick={release} disabled={!canRelease}>{approvalsComplete ? "Released to execution" : canRelease ? "Approve and release" : "Release gate blocked"}</button></>} />
      <StageRail item={activeCase} />

      <section className="action-summary panel"><div><p className="kicker">RECOMMENDED RESPONSE</p><h2>{recommended.name}</h2><p>{activeCase.recommendation}</p><p><b>Release gate:</b> {releaseGate}</p><button data-action-id="action.recommendation-receipt" type="button" onClick={() => onToast(`${activeCase.id} recommendation receipt opened: ${recommended.name}; protected value ${recommended.protectedValue}; service ${recommended.service}; cost ${recommended.cost}; residual risk ${recommended.residualRisk}%. This is a synthetic scenario record.`)}>Trace recommendation receipt ◇</button></div><dl><div><dt>Protected value</dt><dd>{recommended.protectedValue}</dd></div><div><dt>Service</dt><dd>{recommended.service}</dd></div><div><dt>Cost</dt><dd>{recommended.cost}</dd></div><div><dt>Residual risk</dt><dd>{recommended.residualRisk}%</dd></div></dl></section>

      <div className="action-grid">
        <section className="panel case-section"><header className="panel-heading"><div><p className="kicker">APPROVAL MATRIX</p><h2>Decision authority</h2></div><span className={approvalsComplete || canRelease ? "approval-ready" : "approval-pending"}>{approvalsComplete ? "Released" : canRelease ? "1 pending" : "Gate blocked"}</span></header><div className="approval-list"><Approval authorityRole="Supply chain owner" person={activeCase.owner} state={approvalStageReached ? "Signed" : "Not ready"} /><Approval authorityRole="Finance controller" person={financeReviewer} state={approvalStageReached ? "Verified" : "Not ready"} /><Approval authorityRole="Executive delegate" person={executiveReviewer} state={approvalsComplete ? "Approved" : canRelease ? "Pending" : "Blocked"} /></div><div className="approval-actions"><button type="button" onClick={requestChanges} disabled={activeCase.stage !== "Approve" || approvalsComplete}>Request changes</button><button type="button" className="primary-action" onClick={release} disabled={!canRelease}>{approvalsComplete ? "Execution active" : canRelease ? "Approve recommendation" : "Approval unavailable"}</button></div></section>
        <section className="panel case-section"><header className="panel-heading"><div><p className="kicker">EXECUTION PLAN · SYNTHETIC</p><h2>Browser-session work-package drafts</h2></div><button className="text-action" type="button" onClick={() => onToast("Synthetic task-plan receipt opened inside this concept session; no clipboard or operations queue was changed.")}>Open plan receipt</button></header><div className="task-list">{activeCase.tasks.map((task) => <article key={task.id}><i className={`task-${task.status.toLowerCase().replace(" ", "-")}`} /><div><b>{task.title}</b><span>{task.owner} · {task.due}</span></div><em>{task.status} fixture</em></article>)}</div></section>
      </div>

      <ScenarioComparison item={activeCase} compact onTrace={onToast} />
    </section>
  );
}

function CaseHero({ item, eyebrow, titleId, actions }: { item: DecisionCase; eyebrow: string; titleId: string; actions: React.ReactNode }) {
  return <header className="case-hero"><div><p className="kicker">{eyebrow} · {item.id}</p><div className="case-hero-title"><i className={`severity-${item.severity.toLowerCase()}`} /><div><h1 id={titleId} data-page-heading tabIndex={-1}>{item.title}</h1><p>{item.summary}</p></div></div></div><div className="case-hero-actions">{actions}</div><dl className="case-facts"><div><dt>Stage</dt><dd>{item.stage}</dd></div><div><dt>Owner</dt><dd>{item.owner}</dd></div><div><dt>Decision due</dt><dd>{item.due}</dd></div><div><dt>Value at stake</dt><dd>{item.value}</dd></div><div><dt>Service exposure</dt><dd>{item.serviceExposure}</dd></div><div><dt>Updated</dt><dd>{item.updated}</dd></div></dl></header>;
}

function StageRail({ item }: { item: DecisionCase }) {
  const activeIndex = decisionStageOrder.indexOf(item.stage);
  return <ol className="case-stage-rail" aria-label="Decision lifecycle">{decisionStageOrder.map((stage, index) => <li className={index < activeIndex ? "complete" : index === activeIndex ? "active" : ""} key={stage}><span>{index < activeIndex ? "OK" : `0${index + 1}`}</span><div><b>{stage}</b><small>{index < activeIndex ? "Complete" : index === activeIndex ? item.status : "Queued"}</small></div></li>)}</ol>;
}

function ScenarioComparison({ item, compact = false, onTrace }: { item: DecisionCase; compact?: boolean; onTrace: (message: string) => void }) {
  return <section className={`panel case-section scenario-section ${compact ? "compact" : ""}`}><header className="panel-heading"><div><p className="kicker">OR SCENARIO LAB · SYNTHETIC COMPARISON</p><h2>Response alternatives across the hard decision envelope</h2><p>Each alternative retains method stack, feasibility state, service, cost, cash, risk, carbon, and the action delta.</p></div><span>{item.scenarios.length} alternatives · {item.scenarios.filter((scenario) => scenario.feasibility === "Inside hard envelope").length} inside envelope</span></header><div className="scenario-grid">{item.scenarios.map((scenario) => <article className={`scenario-card ${scenario.recommended ? "scenario-recommended" : ""}`} key={scenario.id}><header><div><small>{scenario.posture}</small><h3>{scenario.name}</h3></div>{scenario.recommended && <b>RECOMMENDED</b>}</header><div className={`scenario-feasibility scenario-${scenario.feasibility.toLowerCase().replaceAll(" ", "-")}`}>{scenario.feasibility}</div><dl><div><dt>Protected value</dt><dd>{scenario.protectedValue}</dd></div><div><dt>Service</dt><dd>{scenario.service}</dd></div><div><dt>Incremental cost</dt><dd>{scenario.cost}</dd></div><div><dt>Cash impact</dt><dd>{scenario.cashImpact}</dd></div><div><dt>Residual risk</dt><dd>{scenario.residualRisk}%</dd></div><div><dt>Carbon delta</dt><dd>{scenario.carbonDelta}</dd></div></dl><footer><span>{scenario.methodStack}</span><p>{scenario.change}</p><button data-action-id={`scenario.receipt.${scenario.id}`} type="button" onClick={() => onTrace(`${scenario.id} scenario receipt opened: ${scenario.name}; ${scenario.feasibility}; protected value ${scenario.protectedValue}; service ${scenario.service}; cost ${scenario.cost}; cash impact ${scenario.cashImpact}; residual risk ${scenario.residualRisk}%; carbon ${scenario.carbonDelta}; methods ${scenario.methodStack}. Values are synthetic.`)}>Open scenario receipt ◇</button></footer></article>)}</div></section>;
}

function Metric({ label, value, detail, tone, onTrace }: { label: string; value: string; detail: string; tone: string; onTrace: (message: string) => void }) {
  return <button data-action-id={`decision.metric.${label.toLowerCase().replaceAll(" ", "-")}`} type="button" className={`workflow-metric workflow-metric-${tone}`} onClick={() => onTrace(`${label} receipt opened: ${value} ${detail}. The aggregate is calculated from the visible synthetic decision-case fixture.`)}><span>{label}</span><strong>{value}</strong><small>{detail} · Trace ◇</small></button>;
}

function Approval({ authorityRole, person, state }: { authorityRole: string; person: string; state: string }) {
  return <article><span>{person.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><b>{authorityRole}</b><small>{person}</small></div><em className={`approval-${state.toLowerCase().replaceAll(" ", "-")}`}>{state}</em></article>;
}

function sumDisplayedValue(cases: readonly DecisionCase[]) {
  const total = cases.reduce((sum, item) => {
    const match = item.value.match(/\$([\d.]+)M/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);
  return `$${total.toFixed(1)}M`;
}
