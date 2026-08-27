"use client";

import { useMemo, useState } from "react";

import type { DecisionCase } from "./product-model";

type DecisionCasesProps = {
  cases: readonly DecisionCase[];
  onOpenCase: (decisionCase: DecisionCase) => void;
  onCreateCase: () => void;
  onRunScenario: (decisionCase: DecisionCase) => void;
  onToast: (message: string) => void;
};

const stages: DecisionCase["stage"][] = [
  "Triage",
  "Validate",
  "Simulate",
  "Approve",
  "Execute",
  "Measure",
];

const severityRank: Record<DecisionCase["severity"], number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Opportunity: 3,
};

const severityTone: Record<DecisionCase["severity"], string> = {
  Critical: "critical",
  High: "watch",
  Medium: "neutral",
  Opportunity: "opportunity",
};

const statusTone: Record<DecisionCase["status"], string> = {
  Open: "open",
  "In review": "review",
  Approved: "approved",
  Executing: "executing",
  Measuring: "measuring",
};

function parseValue(value: string) {
  const match = value.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return 0;

  const multiplier = match[2]?.toUpperCase() === "B"
    ? 1_000_000_000
    : match[2]?.toUpperCase() === "M"
      ? 1_000_000
      : match[2]?.toUpperCase() === "K"
        ? 1_000
        : 1;

  return Number(match[1]) * multiplier;
}

function formatValue(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export default function DecisionCases({
  cases,
  onOpenCase,
  onCreateCase,
  onRunScenario,
  onToast,
}: DecisionCasesProps) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<DecisionCase["stage"] | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<DecisionCase["severity"] | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [sort, setSort] = useState<"severity" | "value" | "workflow">("severity");

  const owners = useMemo(
    () => Array.from(new Set(cases.map((decisionCase) => decisionCase.owner))).sort(),
    [cases],
  );

  const visibleCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = cases.filter((decisionCase) => {
      const matchesQuery = !normalizedQuery || [
        decisionCase.id,
        decisionCase.title,
        decisionCase.trigger,
        decisionCase.owner,
        decisionCase.site,
        decisionCase.description,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesQuery
        && (stageFilter === "All" || decisionCase.stage === stageFilter)
        && (severityFilter === "All" || decisionCase.severity === severityFilter)
        && (ownerFilter === "All" || decisionCase.owner === ownerFilter);
    });

    return [...filtered].sort((left, right) => {
      if (sort === "value") return parseValue(right.value) - parseValue(left.value);
      if (sort === "workflow") return stages.indexOf(left.stage) - stages.indexOf(right.stage);
      return severityRank[left.severity] - severityRank[right.severity];
    });
  }, [cases, ownerFilter, query, severityFilter, sort, stageFilter]);

  const totalValue = useMemo(
    () => cases.reduce((sum, decisionCase) => sum + parseValue(decisionCase.value), 0),
    [cases],
  );

  const approvalCount = cases.filter((decisionCase) => decisionCase.stage === "Approve").length;
  const executionCount = cases.filter((decisionCase) => decisionCase.stage === "Execute").length;
  const urgentCount = cases.filter((decisionCase) =>
    decisionCase.severity === "Critical" || decisionCase.severity === "High",
  ).length;

  const resetFilters = () => {
    setQuery("");
    setStageFilter("All");
    setSeverityFilter("All");
    setOwnerFilter("All");
    setSort("severity");
  };

  return (
    <section className="case-workspace" aria-labelledby="decision-cases-title">
      <header className="case-header">
        <div>
          <p className="eyebrow">ACTION ROOM · GOVERNED DECISIONS</p>
          <div className="case-heading-row">
            <h1 id="decision-cases-title">Decision cases</h1>
            <span className="case-live-state"><i aria-hidden="true" /> Live workspace</span>
          </div>
          <p className="case-header-copy">
            Move every signal from triage to measured outcome with ownership, evidence,
            approvals, and a complete audit trail.
          </p>
        </div>
        <div className="case-header-actions">
          <button
            className="secondary"
            type="button"
            onClick={() => onToast("Decision workspace view saved for your team.")}
          >
            Save view
          </button>
          <button className="primary" type="button" onClick={onCreateCase}>
            Create decision case <span aria-hidden="true">+</span>
          </button>
        </div>
      </header>

      <section className="case-kpis" aria-label="Decision case summary">
        <article className="case-kpi case-kpi-dark">
          <span>Value under management</span>
          <strong>{formatValue(totalValue)}</strong>
          <small>Across {cases.length} governed cases</small>
        </article>
        <article className="case-kpi">
          <span>Approval gate</span>
          <strong>{approvalCount}</strong>
          <small>Awaiting accountable sign-off</small>
        </article>
        <article className="case-kpi">
          <span>In execution</span>
          <strong>{executionCount}</strong>
          <small>Actions moving through operations</small>
        </article>
        <article className={`case-kpi ${urgentCount ? "case-kpi-alert" : ""}`}>
          <span>Priority attention</span>
          <strong>{urgentCount}</strong>
          <small>Critical or high-severity cases</small>
        </article>
      </section>

      <section className="panel case-pipeline" aria-labelledby="case-pipeline-title">
        <div className="case-panel-heading">
          <div>
            <p className="eyebrow">EXECUTION PIPELINE</p>
            <h2 id="case-pipeline-title">From signal to verified value</h2>
          </div>
          <button
            className="case-link-button"
            type="button"
            onClick={() => {
              setStageFilter("All");
              onToast("Showing the complete decision pipeline.");
            }}
          >
            View entire pipeline <span aria-hidden="true">→</span>
          </button>
        </div>
        <ol className="case-pipeline-steps">
          {stages.map((stage, index) => {
            const count = cases.filter((decisionCase) => decisionCase.stage === stage).length;
            const selected = stageFilter === stage;

            return (
              <li key={stage} className={selected ? "case-stage-selected" : ""}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setStageFilter(selected ? "All" : stage)}
                >
                  <span className="case-stage-index">0{index + 1}</span>
                  <span className="case-stage-copy">
                    <b>{stage}</b>
                    <small>{count} {count === 1 ? "case" : "cases"}</small>
                  </span>
                  <strong>{count}</strong>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="case-layout">
        <section className="panel case-register" aria-labelledby="case-register-title">
          <div className="case-panel-heading case-register-heading">
            <div>
              <p className="eyebrow">DECISION REGISTER</p>
              <h2 id="case-register-title">Active operational decisions</h2>
            </div>
            <span className="case-result-count" aria-live="polite">
              {visibleCases.length} of {cases.length} cases
            </span>
          </div>

          <div className="case-filters" role="search" aria-label="Filter decision cases">
            <label className="case-search-field">
              <span>Search cases</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ID, issue, trigger, owner, or site"
              />
            </label>
            <label>
              <span>Stage</span>
              <select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as DecisionCase["stage"] | "All")}
              >
                <option value="All">All stages</option>
                {stages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </label>
            <label>
              <span>Severity</span>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value as DecisionCase["severity"] | "All")}
              >
                <option value="All">All severities</option>
                {Object.keys(severityRank).map((severity) => <option key={severity}>{severity}</option>)}
              </select>
            </label>
            <label>
              <span>Owner</span>
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="All">All owners</option>
                {owners.map((owner) => <option key={owner}>{owner}</option>)}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
                <option value="severity">Severity</option>
                <option value="value">Value</option>
                <option value="workflow">Workflow stage</option>
              </select>
            </label>
            <button className="case-reset-button" type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <div className="case-table-scroll">
            <table className="case-table">
              <caption>Decision cases filtered by the controls above</caption>
              <thead>
                <tr>
                  <th scope="col">Case / trigger</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Stage</th>
                  <th scope="col">SLA</th>
                  <th scope="col">Value</th>
                  <th scope="col">Updated</th>
                  <th scope="col"><span className="case-visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleCases.map((decisionCase) => (
                  <tr key={decisionCase.id}>
                    <th scope="row">
                      <button
                        className="case-title-button"
                        type="button"
                        onClick={() => onOpenCase(decisionCase)}
                      >
                        <span className="case-id-line">
                          <b>{decisionCase.id}</b>
                          <span className={`pill pill-${severityTone[decisionCase.severity]}`}>
                            {decisionCase.severity}
                          </span>
                        </span>
                        <strong>{decisionCase.title}</strong>
                        <small>{decisionCase.trigger} · {decisionCase.site}</small>
                      </button>
                    </th>
                    <td>
                      <span className="case-owner">
                        <i aria-hidden="true">{decisionCase.ownerInitials}</i>
                        <span><b>{decisionCase.owner}</b><small>Case owner</small></span>
                      </span>
                    </td>
                    <td>
                      <span className={`case-status case-status-${statusTone[decisionCase.status]}`}>
                        <i aria-hidden="true" />
                        <span><b>{decisionCase.stage}</b><small>{decisionCase.status}</small></span>
                      </span>
                    </td>
                    <td>
                      <span className={`case-sla ${decisionCase.severity === "Critical" ? "case-sla-urgent" : ""}`}>
                        <b>{decisionCase.sla}</b>
                        <small>Due {decisionCase.due}</small>
                      </span>
                    </td>
                    <td><strong className="case-value">{decisionCase.value}</strong></td>
                    <td><span className="case-updated">{decisionCase.updated}</span></td>
                    <td>
                      <div className="case-row-actions">
                        {decisionCase.stage === "Simulate" || decisionCase.stage === "Validate" ? (
                          <button
                            type="button"
                            onClick={() => onRunScenario(decisionCase)}
                            aria-label={`Run scenario for ${decisionCase.id}`}
                          >
                            Simulate
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onOpenCase(decisionCase)}
                          aria-label={`Open ${decisionCase.id}: ${decisionCase.title}`}
                        >
                          Open <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleCases.length === 0 ? (
            <div className="case-empty-state">
              <span aria-hidden="true">0</span>
              <h3>No cases match this view</h3>
              <p>Reset the filters or create a new decision case from a live signal.</p>
              <button className="secondary" type="button" onClick={resetFilters}>Reset filters</button>
            </div>
          ) : null}
        </section>

        <aside className="case-side-column" aria-label="Decision operations and audit">
          <section className="panel case-activity" aria-labelledby="case-activity-title">
            <div className="case-panel-heading">
              <div>
                <p className="eyebrow">ACTIVITY</p>
                <h2 id="case-activity-title">Operational handoffs</h2>
              </div>
              <button
                className="case-link-button"
                type="button"
                onClick={() => onToast("Full decision activity opened in concept mode.")}
              >
                View all
              </button>
            </div>
            <ol className="case-activity-list">
              {cases.slice(0, 4).map((decisionCase, index) => (
                <li key={`${decisionCase.id}-${decisionCase.stage}`}>
                  <span className={`case-activity-mark case-activity-mark-${index + 1}`} aria-hidden="true" />
                  <div>
                    <p><b>{decisionCase.owner}</b> moved <strong>{decisionCase.id}</strong> to {decisionCase.stage}.</p>
                    <span>{decisionCase.updated} · {decisionCase.site}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCase(decisionCase)}
                    aria-label={`Review activity for ${decisionCase.id}`}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel case-audit" aria-labelledby="case-audit-title">
            <div className="case-panel-heading">
              <div>
                <p className="eyebrow">CONTROL PLANE</p>
                <h2 id="case-audit-title">Decision integrity</h2>
              </div>
              <span className="case-control-state">Controls active</span>
            </div>
            <dl className="case-audit-metrics">
              <div>
                <dt>Human approval</dt>
                <dd><b>Required</b><span>Material actions</span></dd>
              </div>
              <div>
                <dt>Write-back</dt>
                <dd><b>Read-only</b><span>Current workspace</span></dd>
              </div>
              <div>
                <dt>Evidence trail</dt>
                <dd><b>Tracked</b><span>Inputs to outcome</span></dd>
              </div>
              <div>
                <dt>Shared training</dt>
                <dd><b>Off</b><span>Tenant policy</span></dd>
              </div>
            </dl>
            <div className="case-audit-note">
              <span aria-hidden="true">AUDIT</span>
              <p>
                Every recommendation retains source evidence, assumptions, model and solver
                versions, approver changes, execution events, and measured outcomes.
              </p>
            </div>
            <button
              className="secondary case-audit-export"
              type="button"
              onClick={() => onToast("Audit package prepared for export in concept mode.")}
            >
              Export audit package <span aria-hidden="true">↗</span>
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
