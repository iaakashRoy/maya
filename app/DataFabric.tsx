"use client";

import type { ConnectorDetail, ConnectorState } from "./product-model";

export type DataFabricProps = {
  connectors: readonly ConnectorDetail[];
  onConnect: () => void;
  onToast: (message: string) => void;
};

const freshnessBands = [
  { label: "<15m", value: 68, detail: "Real time" },
  { label: "15–60m", value: 19, detail: "Current" },
  { label: "1–6h", value: 8, detail: "Monitor" },
  { label: "6–24h", value: 3, detail: "Delayed" },
  { label: ">24h", value: 2, detail: "Stale" },
];

const coverageDimensions = [
  { label: "Supplier identity", value: 98, note: "1,284 of 1,310 resolved" },
  { label: "Material-to-product", value: 94, note: "4,682 active mappings" },
  { label: "Order-to-customer", value: 97, note: "18,402 open orders" },
  { label: "Cost and margin", value: 86, note: "3 product families partial" },
  { label: "Carbon evidence", value: 76, note: "12 suppliers incomplete" },
];

const mappingExceptions = [
  {
    id: "MAP-214",
    entity: "Graphite G-142",
    issue: "Supplier material ID conflicts with PLM grade",
    scope: "28 orders · 3 products",
    confidence: 62,
    owner: "Data steward",
    priority: "Critical",
  },
  {
    id: "MAP-209",
    entity: "Nova Precision Ltd.",
    issue: "Duplicate supplier record across two legal entities",
    scope: "$4.8M annual spend",
    confidence: 81,
    owner: "Procurement",
    priority: "Review",
  },
  {
    id: "MAP-197",
    entity: "AX-4 housing",
    issue: "Unit-of-measure conversion is missing",
    scope: "6 BOM positions",
    confidence: 74,
    owner: "Engineering",
    priority: "Review",
  },
  {
    id: "MAP-188",
    entity: "Chennai route 04",
    issue: "Carrier lane has no current emissions factor",
    scope: "11 priority orders",
    confidence: 93,
    owner: "Logistics",
    priority: "Monitor",
  },
];

const governanceModels = [
  {
    name: "Signal ranker",
    version: "v4.8.2",
    purpose: "Prioritizes market events against customer exposure.",
    state: "Approved",
    metric: "Precision 91.4%",
    drift: "0.8% · stable",
    evaluated: "27 Aug · 08:42 UTC",
  },
  {
    name: "Impact linker",
    version: "v2.6.0",
    purpose: "Proposes external-to-private graph relationships.",
    state: "Human review",
    metric: "Recall 88.7%",
    drift: "2.1% · watch",
    evaluated: "27 Aug · 08:18 UTC",
  },
  {
    name: "Scenario policy",
    version: "v1.9.3",
    purpose: "Ranks feasible actions after hard constraints are applied.",
    state: "Approved",
    metric: "Regret 3.2%",
    drift: "0.4% · stable",
    evaluated: "26 Aug · 21:04 UTC",
  },
];

const privacyControls = [
  { label: "Cross-tenant training", value: "Off", detail: "Customer records never enter shared training." },
  { label: "Raw-data boundary", value: "Private", detail: "Source records remain inside the customer tenant." },
  { label: "Operational write-back", value: "Approval only", detail: "Every external action requires an authorized operator." },
  { label: "Retention policy", value: "365 days", detail: "Evidence and decisions follow customer policy." },
];

const auditEvents = [
  { time: "09:42", actor: "Maya Rao", action: "Approved mapping", object: "MAP-204 · Material G-118" },
  { time: "09:17", actor: "System", action: "Completed quality check", object: "SAP S/4HANA · 18,402 records" },
  { time: "08:56", actor: "Jon Bell", action: "Changed source policy", object: "Supplier portal · Read-only" },
  { time: "08:42", actor: "Model governance", action: "Promoted model", object: "Signal ranker · v4.8.2" },
];

type DisplayStatus = "Healthy" | "Delayed" | "Attention" | "Disconnected";

const connectorOwners: Record<ConnectorDetail["category"], string> = {
  ERP: "Finance systems",
  PLM: "Engineering data",
  TMS: "Logistics operations",
  MES: "Plant operations",
  Quality: "Quality systems",
  Documents: "Knowledge operations",
  Supplier: "Supplier operations",
  "External intelligence": "Intelligence operations",
};

function displayStatus(state: ConnectorState): DisplayStatus {
  if (state === "healthy" || state === "syncing") return "Healthy";
  if (state === "degraded") return "Delayed";
  if (state === "attention") return "Attention";
  return "Disconnected";
}

function statusTone(status: DisplayStatus) {
  if (status === "Healthy") return "live";
  if (status === "Delayed" || status === "Attention") return "watch";
  return "critical";
}

function statusDetail(state: ConnectorState) {
  if (state === "healthy") return "Within SLA";
  if (state === "syncing") return "Sync in progress";
  if (state === "degraded") return "Freshness breach";
  if (state === "attention") return "Mapping review";
  return "Connection lost";
}

function displayMode(mode: ConnectorDetail["mode"]) {
  if (mode === "read-only") return "Read-only";
  if (mode === "read-write") return "Bi-directional";
  return "Event stream";
}

function displaySyncTime(timestamp: string | null) {
  if (!timestamp) return "Never";
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(timestamp))} UTC`;
}

function displayRecordCount(records: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(records);
}

function affectedIssueRecords(connector: ConnectorDetail) {
  return connector.issues.reduce((total, issue) => total + issue.affectedRecords, 0);
}

function connectorInitials(name: string) {
  return name
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DataFabric({ connectors, onConnect, onToast }: DataFabricProps) {
  const healthy = connectors.filter((connector) => displayStatus(connector.sync.state) === "Healthy").length;
  const connected = connectors.filter((connector) => connector.sync.state !== "not-connected").length;
  const issueCount = connectors.reduce((total, connector) => total + affectedIssueRecords(connector), 0);
  const averageCoverage = connectors.length
    ? Math.round(connectors.reduce((total, connector) => total + connector.coverage.overallPercent, 0) / connectors.length)
    : 0;

  return (
    <section className="data-screen" aria-labelledby="data-page-title">
      <header className="data-header">
        <div className="data-header-copy">
          <p className="eyebrow">DATA FABRIC · PRIVATE OPERATING CONTEXT</p>
          <div className="data-title-row">
            <h1 id="data-page-title">Trusted data, ready for every decision.</h1>
            <span className="pill pill-live">Monitoring live</span>
          </div>
          <p>
            Connect operational systems, resolve business meaning, and govern the knowledge and models that power every signal, simulation, and recommendation.
          </p>
        </div>
        <div className="data-header-actions">
          <button className="secondary" type="button" onClick={() => onToast("Data quality checks refreshed.")}>
            Run quality checks
          </button>
          <button className="primary" type="button" onClick={onConnect}>
            Connect source <span aria-hidden="true">+</span>
          </button>
        </div>
      </header>

      <section className="data-kpis" aria-label="Data fabric summary">
        <article className="panel data-kpi data-kpi-dark">
          <div className="data-kpi-label"><span>Connector health</span><i aria-hidden="true" /></div>
          <strong>{healthy}/{connectors.length || 0}</strong>
          <p>{connected} sources connected · {connectors.length - healthy} need attention</p>
        </article>
        <article className="panel data-kpi">
          <div className="data-kpi-label"><span>Graph coverage</span><small>Target 95%</small></div>
          <strong>{averageCoverage}%</strong>
          <div className="data-kpi-meter" role="progressbar" aria-label="Average graph coverage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={averageCoverage}>
            <i style={{ width: `${averageCoverage}%` }} />
          </div>
          <p>Across connected source domains</p>
        </article>
        <article className="panel data-kpi">
          <div className="data-kpi-label"><span>Freshness SLA</span><small>15 minutes</small></div>
          <strong>97.2%</strong>
          <p>68% of operational records updated in real time</p>
        </article>
        <article className="panel data-kpi data-kpi-alert">
          <div className="data-kpi-label"><span>Open exceptions</span><small>12 critical</small></div>
          <strong>{issueCount || 214}</strong>
          <p>Identity, hierarchy, unit, and evidence conflicts</p>
        </article>
      </section>

      <section className="panel data-connectors" aria-labelledby="data-connectors-title">
        <div className="data-panel-head">
          <div>
            <p className="eyebrow">INTEGRATIONS</p>
            <h2 id="data-connectors-title">Connector health</h2>
            <p>Readiness, coverage, and operating ownership for every approved source.</p>
          </div>
          <div className="data-head-meta">
            <span><i className="data-status-dot data-status-live" aria-hidden="true" />{healthy} healthy</span>
            <span><i className="data-status-dot data-status-watch" aria-hidden="true" />{connectors.length - healthy} attention</span>
          </div>
        </div>

        {connectors.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <caption className="data-sr-only">Connected enterprise data sources and their current health</caption>
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Health</th>
                  <th scope="col">Last sync</th>
                  <th scope="col">Graph coverage</th>
                  <th scope="col">Records</th>
                  <th scope="col">Owner</th>
                  <th scope="col"><span className="data-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((connector) => (
                  <tr key={connector.id}>
                    <th scope="row">
                      <span className="data-source">
                        <span className="data-source-mark" aria-hidden="true">{connectorInitials(connector.name)}</span>
                        <span><b>{connector.name}</b><small>{connector.category}</small></span>
                      </span>
                    </th>
                    <td><span className="data-mode">{displayMode(connector.mode)}</span></td>
                    <td>
                      <span className={`pill pill-${statusTone(displayStatus(connector.sync.state))}`}>{displayStatus(connector.sync.state)}</span>
                      <small className="data-cell-note">{statusDetail(connector.sync.state)}</small>
                    </td>
                    <td>
                      <b className="data-cell-value">
                        {connector.sync.lastSuccessfulAt ? <time dateTime={connector.sync.lastSuccessfulAt}>{displaySyncTime(connector.sync.lastSuccessfulAt)}</time> : "Never"}
                      </b>
                      <small className="data-cell-note">{connector.sync.cadence}</small>
                    </td>
                    <td>
                      <span className="data-coverage-value">{connector.coverage.overallPercent}%</span>
                      <span className="data-row-meter" role="progressbar" aria-label={`${connector.name} graph coverage`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={connector.coverage.overallPercent}>
                        <i style={{ width: `${connector.coverage.overallPercent}%` }} />
                      </span>
                    </td>
                    <td><b className="data-cell-value">{displayRecordCount(connector.records.total)}</b><small className="data-cell-note">{affectedIssueRecords(connector)} exceptions</small></td>
                    <td><span className="data-owner">{connectorOwners[connector.category]}</span></td>
                    <td>
                      <button className="data-row-action" type="button" aria-label={`Inspect ${connector.name}`} onClick={() => onToast(`${connector.name} connector details opened.`)}>
                        Inspect <span aria-hidden="true">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="data-empty" role="status">
            <span aria-hidden="true">01</span>
            <div><h3>No sources connected</h3><p>Start with one approved operational source and a read-only policy.</p></div>
            <button className="primary" type="button" onClick={onConnect}>Connect first source</button>
          </div>
        )}
      </section>

      <div className="data-observability-grid">
        <section className="panel data-freshness" aria-labelledby="data-freshness-title">
          <div className="data-panel-head">
            <div><p className="eyebrow">FRESHNESS</p><h2 id="data-freshness-title">Operational data age</h2><p>Share of decision-relevant records by last successful update.</p></div>
            <span className="pill pill-live">97.2% in SLA</span>
          </div>
          <div className="data-bar-chart" role="img" aria-label="Data freshness: 68 percent under 15 minutes, 19 percent from 15 to 60 minutes, 8 percent from 1 to 6 hours, 3 percent from 6 to 24 hours, and 2 percent over 24 hours">
            <div className="data-chart-grid" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>
            <div className="data-bars">
              {freshnessBands.map((band, index) => (
                <div className="data-bar-column" key={band.label}>
                  <strong>{band.value}%</strong>
                  <div className="data-bar-track" aria-hidden="true"><i className={index > 2 ? "data-bar-risk" : ""} style={{ height: `${band.value}%` }} /></div>
                  <b>{band.label}</b>
                  <small>{band.detail}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="data-chart-note"><i className="data-status-dot data-status-watch" aria-hidden="true" /><span><b>2 delayed feeds</b> account for 5% of decision-relevant records. No active recommendation depends exclusively on them.</span></div>
        </section>

        <section className="panel data-coverage" aria-labelledby="data-coverage-title">
          <div className="data-panel-head">
            <div><p className="eyebrow">KNOWLEDGE READINESS</p><h2 id="data-coverage-title">Coverage by relationship</h2><p>Verified links available to the private decision graph.</p></div>
          </div>
          <div className="data-coverage-list">
            {coverageDimensions.map((item) => (
              <div className="data-coverage-row" key={item.label}>
                <div><b>{item.label}</b><span>{item.note}</span></div>
                <strong>{item.value}%</strong>
                <div className="data-coverage-track" role="progressbar" aria-label={`${item.label} coverage`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.value}>
                  <i className={item.value < 85 ? "data-coverage-risk" : ""} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="data-inline-action" type="button" onClick={() => onToast("Coverage improvement plan opened.")}>Open coverage plan <span aria-hidden="true">→</span></button>
        </section>
      </div>

      <section className="panel data-graph" aria-labelledby="data-graph-title">
        <div className="data-panel-head">
          <div><p className="eyebrow">KNOWLEDGE GRAPH</p><h2 id="data-graph-title">Business meaning resolved across systems</h2><p>Every recommendation retains the source records, mappings, evidence, and calculation path that produced it.</p></div>
          <div className="data-graph-stats" aria-label="Knowledge graph statistics"><span><b>8.4M</b> entities</span><span><b>27.6M</b> relationships</span><span><b>96.8%</b> verified</span></div>
        </div>
        <div className="data-lineage" aria-label="Example data lineage from external event to business impact">
          <article><small>EXTERNAL EVIDENCE</small><b>Capacity agreement</b><span>Public filing · observed</span><em className="pill pill-live">Verified</em></article>
          <i className="data-lineage-link" aria-hidden="true" />
          <article><small>IDENTITY</small><b>NeoGraph Materials</b><span>Supplier master · private</span><em className="pill pill-live">98% match</em></article>
          <i className="data-lineage-link" aria-hidden="true" />
          <article><small>MATERIAL</small><b>Graphite G-142</b><span>PLM + BOM · private</span><em className="pill pill-watch">1 exception</em></article>
          <i className="data-lineage-link" aria-hidden="true" />
          <article><small>BUSINESS IMPACT</small><b>AX-4 customer orders</b><span>ERP + margin model</span><em className="pill pill-critical">$4.2M risk</em></article>
        </div>
        <div className="data-lineage-footer">
          <span><i className="data-status-dot data-status-live" aria-hidden="true" /><b>Observed</b> source-backed fact</span>
          <span><i className="data-status-dot data-status-info" aria-hidden="true" /><b>Resolved</b> confirmed relationship</span>
          <span><i className="data-status-dot data-status-watch" aria-hidden="true" /><b>Inferred</b> requires confidence or review</span>
          <button className="data-inline-action" type="button" onClick={() => onToast("Full lineage opened for the graphite case.")}>Inspect full lineage →</button>
        </div>
      </section>

      <section className="panel data-exceptions" aria-labelledby="data-exceptions-title">
        <div className="data-panel-head">
          <div><p className="eyebrow">MAPPING WORKBENCH</p><h2 id="data-exceptions-title">Exceptions requiring business review</h2><p>AI proposes relationships; accountable domain owners approve material mappings.</p></div>
          <button className="secondary" type="button" onClick={() => onToast("Exception queue filtered to your assignments.")}>My assignments · 7</button>
        </div>
        <div className="data-exception-list">
          {mappingExceptions.map((exception) => (
            <article className="data-exception-row" key={exception.id}>
              <span className="data-exception-id">{exception.id}</span>
              <div className="data-exception-copy"><b>{exception.entity}</b><p>{exception.issue}</p><small>{exception.scope}</small></div>
              <div className="data-confidence"><span>Match confidence</span><b>{exception.confidence}%</b><i><em style={{ width: `${exception.confidence}%` }} /></i></div>
              <div className="data-exception-owner"><span>Owner</span><b>{exception.owner}</b></div>
              <span className={`pill ${exception.priority === "Critical" ? "pill-critical" : exception.priority === "Review" ? "pill-watch" : "pill-neutral"}`}>{exception.priority}</span>
              <button className="data-row-action" type="button" onClick={() => onToast(`${exception.id} mapping review opened.`)}>Review <span aria-hidden="true">→</span></button>
            </article>
          ))}
        </div>
        <div className="data-pagination" aria-label="Exception pagination"><span>Showing 4 of 214 exceptions</span><div><button type="button" disabled aria-label="Previous exception page">←</button><button type="button" aria-label="Next exception page" onClick={() => onToast("Next exception page loaded in concept mode.")}>→</button></div></div>
      </section>

      <section className="data-governance" aria-labelledby="data-governance-title">
        <div className="data-section-heading">
          <div><p className="eyebrow">MODEL GOVERNANCE</p><h2 id="data-governance-title">Learning is continuous. Authority is controlled.</h2><p>Models can observe outcomes and propose candidates in real time; production promotion and operational action remain gated.</p></div>
          <span className="data-guardrail"><b>Autonomous write-back</b><em>Off</em></span>
        </div>
        <div className="data-model-grid">
          {governanceModels.map((model) => (
            <article className="panel data-model-card" key={model.name}>
              <div className="data-model-top"><span className="data-model-version">{model.version}</span><span className={`pill ${model.state === "Approved" ? "pill-live" : "pill-watch"}`}>{model.state}</span></div>
              <h3>{model.name}</h3>
              <p>{model.purpose}</p>
              <dl>
                <div><dt>Primary evaluation</dt><dd>{model.metric}</dd></div>
                <div><dt>Feature drift</dt><dd>{model.drift}</dd></div>
                <div><dt>Last evaluated</dt><dd>{model.evaluated}</dd></div>
              </dl>
              <button className="data-inline-action" type="button" onClick={() => onToast(`${model.name} evaluation report opened.`)}>View evaluation <span aria-hidden="true">→</span></button>
            </article>
          ))}
        </div>
        <div className="panel data-learning-policy">
          <span className="data-policy-number">04</span>
          <div><b>Real-time learning policy</b><p>Outcome feedback enters a shadow learner. Promotion requires drift checks, replay evaluation, bias review, named approval, and reversible deployment.</p></div>
          <div className="data-policy-stages" aria-label="Model promotion stages"><span className="data-stage-complete">Observe</span><i aria-hidden="true" /><span className="data-stage-complete">Replay</span><i aria-hidden="true" /><span className="data-stage-current">Review</span><i aria-hidden="true" /><span>Promote</span></div>
          <button className="secondary" type="button" onClick={() => onToast("Model promotion policy opened.")}>Open policy</button>
        </div>
      </section>

      <div className="data-control-grid">
        <section className="panel data-privacy" aria-labelledby="data-privacy-title">
          <div className="data-panel-head"><div><p className="eyebrow">PRIVACY & CONTROL</p><h2 id="data-privacy-title">Tenant safeguards</h2><p>Enforced boundaries for data, models, and actions.</p></div><span className="pill pill-live">Policy active</span></div>
          <div className="data-control-list">
            {privacyControls.map((control) => (
              <article key={control.label}><span className="data-control-check" aria-hidden="true">✓</span><div><b>{control.label}</b><p>{control.detail}</p></div><strong>{control.value}</strong></article>
            ))}
          </div>
          <button className="data-inline-action" type="button" onClick={() => onToast("Tenant data policy opened.")}>Review tenant policy →</button>
        </section>

        <section className="panel data-audit" aria-labelledby="data-audit-title">
          <div className="data-panel-head"><div><p className="eyebrow">AUDIT TRAIL</p><h2 id="data-audit-title">Recent governed activity</h2><p>Immutable record of source, mapping, model, and decision changes.</p></div><span className="data-audit-seal">SIGNED</span></div>
          <ol className="data-audit-list">
            {auditEvents.map((event) => (
              <li key={`${event.time}-${event.object}`}>
                <time dateTime={`2026-08-27T${event.time}:00+05:30`}>{event.time}</time>
                <i aria-hidden="true" />
                <div><b>{event.action}</b><span>{event.object}</span><small>{event.actor}</small></div>
              </li>
            ))}
          </ol>
          <div className="data-audit-actions"><button className="data-inline-action" type="button" onClick={() => onToast("Audit explorer opened.")}>Open audit explorer →</button><button className="secondary" type="button" onClick={() => onToast("Signed audit export prepared.")}>Export signed log</button></div>
        </section>
      </div>
    </section>
  );
}
