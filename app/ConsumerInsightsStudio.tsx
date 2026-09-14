"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { fixtureEvidenceFor, type EvidenceReceipt, type WorkspaceProject } from "./workspace-model";
import { downloadJson } from "./SimulationStudio";
import { useAnalysisStorage, writeAnalysisStorage } from "./useAnalysisStorage";
import {
  SNAPSHOT, eligibleVariables, handoffPackage, makeAnalysis, observationsFor,
  pct, productFor, products, reportFor, restoreWorkspace, sources, storageKey, summarize,
  summaryInsights, topics, topicSummaries, trendFor, updateVariable, validateConfig, variablesCsv,
  type Analysis, type AnalysisConfig, type ConsumerWorkspace, type Metrics, type Observation,
  type ProductId, type Sentiment, type SourceId, type SuggestedVariable,
} from "./consumer-insights-model";
import "./analysis-workbench.css";
import "./consumer-insights.css";

type Props = { project: WorkspaceProject; onEvidence: (receipt: EvidenceReceipt) => void; onOutcome: (title: string, detail: string, artifact?: string) => void; onOpenOptimizer: () => void };
const tabs = [["overview", "Overview"], ["dashboard", "Sentiment"], ["topics", "Topic explorer"], ["benchmark", "Competitors"], ["variables", "Variables"], ["report", "Summary"]] as const;
type Tab = typeof tabs[number][0] | "setup";
const count = (value: number) => value.toLocaleString("en-IN");
const percent = (value: number) => `${value.toFixed(1)}%`;
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const sentimentNames: Sentiment[] = ["positive", "neutral", "negative"];

function Panel({ title, detail, children, className = "" }: { title: string; detail?: string; children: ReactNode; className?: string }) {
  return <section className={`os-panel ci-panel ${className}`}><header><div><h2>{title}</h2>{detail && <p className="os-help">{detail}</p>}</div></header>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) { return <div className="ci-empty">{children}</div>; }
function Split({ metric }: { metric: Metrics }) {
  return <div className="ci-split" role="img" aria-label={`Positive ${percent(metric.positivePct)}, neutral ${percent(metric.neutralPct)}, negative ${percent(metric.negativePct)}`}>
    {sentimentNames.map(s => <span key={s} className={`ci-${s}`} style={{ width: `${pct(metric[s], metric.mentions)}%` }} title={`${s}: ${count(metric[s])}`} />)}
  </div>;
}
function KPIs({ metric }: { metric: Metrics }) {
  return <div className="os-metrics ci-kpis">{[["Total mentions", count(metric.mentions), "All selected sources"], ["Reviews analyzed", count(metric.reviews), "Product feedback within mentions"], ["Positive sentiment", percent(metric.positivePct), `${percent(metric.negativePct)} negative`], ["Sentiment score", `${metric.score.toFixed(1)} / 100`, "Positive + half of neutral share"]].map(([label, value, detail]) => <div key={label}><small>{label}</small><strong>{value}</strong><span>{detail}</span></div>)}</div>;
}
function TrendChart({ rows }: { rows: Observation[] }) {
  const trend = trendFor(rows);
  const x = (index: number) => 38 + index * (550 / Math.max(1, trend.length - 1));
  const y = (value: number) => 188 - value * 1.55;
  return <Panel title="Sentiment over time" detail="Weekly score · 0–100 · fixed demo snapshot">
    <svg className="ci-trend" viewBox="0 0 620 228" role="img" aria-label="Weekly sentiment scores. Exact values are available in the table below.">
      {[0, 25, 50, 75, 100].map(tick => <g key={tick}><line x1="38" x2="595" y1={y(tick)} y2={y(tick)} className="ci-gridline" /><text x="27" y={y(tick) + 4} textAnchor="end">{tick}</text></g>)}
      <polygon points={`38,188 ${trend.map((t, i) => `${x(i)},${y(t.score)}`).join(" ")} ${x(trend.length - 1)},188`} className="ci-trend-area" />
      <polyline points={trend.map((t, i) => `${x(i)},${y(t.score)}`).join(" ")} className="ci-trend-line" />
      {trend.map((t, i) => <g key={t.week}><circle cx={x(i)} cy={y(t.score)} r="4"><title>{t.label}: {t.score.toFixed(1)} · {count(t.mentions)} mentions</title></circle>{(i % Math.max(1, Math.ceil(trend.length / 6)) === 0 || i === trend.length - 1) && <text x={x(i)} y="216" textAnchor="middle">{t.label}</text>}</g>)}
    </svg>
    <details><summary>View weekly values</summary><div className="os-table-scroll"><table className="os-table"><thead><tr><th>Week starting</th><th>Mentions</th><th>Score</th></tr></thead><tbody>{trend.map(t => <tr key={t.week}><th>{t.label}</th><td>{count(t.mentions)}</td><td>{t.score.toFixed(1)}</td></tr>)}</tbody></table></div></details>
  </Panel>;
}
function Donut({ metric }: { metric: Metrics }) {
  return <Panel title="Consumer sentiment" detail="Share of selected mentions"><div className="ci-donut-wrap"><svg viewBox="0 0 180 180" className="ci-donut" role="img" aria-label={`Positive ${percent(metric.positivePct)}, neutral ${percent(metric.neutralPct)}, negative ${percent(metric.negativePct)}`}>
    {sentimentNames.map((s, index) => { const share = pct(metric[s], metric.mentions); const start = sentimentNames.slice(0, index).reduce((sum, previous) => sum + pct(metric[previous], metric.mentions), 0); return <circle key={s} cx="90" cy="90" r="67" fill="none" strokeWidth="20" pathLength="100" strokeDasharray={`${share} ${100 - share}`} strokeDashoffset={-start} className={`ci-stroke-${s}`} transform="rotate(-90 90 90)" />; })}
    <text x="90" y="88" textAnchor="middle" className="ci-donut-value">{metric.score.toFixed(1)}</text><text x="90" y="110" textAnchor="middle">sentiment score</text>
  </svg><dl className="ci-legend">{sentimentNames.map(s => <div key={s}><dt><i className={`ci-${s}`} />{s}</dt><dd>{percent(pct(metric[s], metric.mentions))}</dd></div>)}</dl></div></Panel>;
}
function RatingChart({ metric }: { metric: Metrics }) {
  const max = Math.max(1, ...metric.ratings);
  return <Panel title="Sentiment intensity" detail="Synthetic 1–5 proxy, assigned from sentiment; not observed star ratings"><div className="os-histogram ci-histogram" role="img" aria-label={metric.ratings.map((n, i) => `${i + 1} out of 5: ${n} mentions`).join(", ")}>
    {metric.ratings.map((n, i) => <div key={i}><b>{count(n)}</b><i style={{ height: `${n / max * 120}px` }} /><small>{i + 1} / 5</small></div>)}
  </div></Panel>;
}
function SourceCards({ analysis }: { analysis: Analysis }) {
  return <div className="ci-source-grid">{sources.map(source => {
    const selected = analysis.config.sourceIds.includes(source.id);
    const metric = summarize(observationsFor(analysis, analysis.config.productId, source.id));
    return <article className="os-panel ci-source" key={source.id}><header><span className="ci-source-icon">{source.short}</span><div><h3>{source.name}</h3><small>{selected ? analysis.collected ? "Collected · demo" : source.status : "Not selected"}</small></div></header>
      <strong>{count(metric.mentions)} <small>mentions</small></strong><p>{count(metric.reviews)} reviews analyzed</p><Split metric={metric} /><p className="os-help">{percent(metric.positivePct)} positive · {percent(metric.negativePct)} negative</p>
      <footer>Updated {dateLabel(SNAPSHOT)}<br />{selected ? `Snapshot freshness: ${analysis.collected ? "just refreshed (simulated)" : source.freshness}` : "Include in a new analysis to explore"}</footer>
    </article>;
  })}</div>;
}

function AnalysisSetup({ initial, busy, progress, error, onStart, onCancel }: { initial: AnalysisConfig; busy: boolean; progress: number; error: string; onStart: (config: AnalysisConfig) => void; onCancel: () => void }) {
  const [config, setConfig] = useState<AnalysisConfig>({ ...initial, competitorIds: [...initial.competitorIds], sourceIds: [...initial.sourceIds] });
  const stages = ["Preparing the selected demo scope", "Collecting synthetic source batches", "Classifying sentiment and themes", "Generating insight and variable suggestions"];
  const product = productFor(config.productId);
  const submit = (event: FormEvent) => { event.preventDefault(); onStart(config); };
  return <Panel title="Start a consumer analysis" detail="Choose a product, a comparison set, and the evidence to include."><form onSubmit={submit} className="ci-setup">
    <fieldset disabled={busy}><legend>Product and market</legend><div className="ci-form-grid"><label>Product<select value={config.productId} onChange={e => { const id = e.target.value as ProductId; setConfig({ ...config, productId: id, competitorIds: products.filter(p => p.id !== id).map(p => p.id) }); }}>{products.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label><label>Company<input value={product.company} readOnly /></label><label>Category<input value="Nutrition drinks" readOnly /></label><label>Market<select value={config.market} onChange={e => setConfig({ ...config, market: e.target.value as AnalysisConfig["market"] })}>{["India", "Metro India", "Tier 2 India"].map(m => <option key={m}>{m}</option>)}</select></label><label>Time period<select value={config.days} onChange={e => setConfig({ ...config, days: Number(e.target.value) as AnalysisConfig["days"] })}>{[30, 60, 90].map(d => <option key={d} value={d}>Last {d} days to {SNAPSHOT}</option>)}</select></label></div></fieldset>
    <fieldset disabled={busy}><legend>Competitor products</legend><p className="os-help">Compare consumer perceptions across nutrition products; audiences and intended uses differ.</p><div className="ci-choice-grid">{products.filter(p => p.id !== config.productId).map(p => <label className="ci-choice" key={p.id} aria-label={p.name}><input type="checkbox" checked={config.competitorIds.includes(p.id)} onChange={e => setConfig({ ...config, competitorIds: e.target.checked ? [...config.competitorIds, p.id] : config.competitorIds.filter(id => id !== p.id) })} /><span><b>{p.name}</b><small>{p.company}</small></span></label>)}</div></fieldset>
    <fieldset disabled={busy}><legend>Source platforms</legend><div className="ci-choice-grid">{sources.map(s => <label className="ci-choice" key={s.id} aria-label={s.name}><input type="checkbox" checked={config.sourceIds.includes(s.id)} onChange={e => setConfig({ ...config, sourceIds: e.target.checked ? [...config.sourceIds, s.id] : config.sourceIds.filter(id => id !== s.id) })} /><span><b>{s.name}</b><small>Available in demo library</small></span></label>)}</div></fieldset>
    <fieldset disabled={busy}><legend>Collection method</legend><div className="ci-choice-grid">{[["library", "Use existing data", "Analyze the internal demo library"], ["collect", "Simulate new collection", "Add a fresh synthetic batch to the library"]].map(([id, label, help]) => <label className="ci-choice" key={id} aria-label={label}><input name="collection-mode" type="radio" checked={config.mode === id} onChange={() => setConfig({ ...config, mode: id as AnalysisConfig["mode"] })} /><span><b>{label}</b><small>{help}</small></span></label>)}</div></fieldset>
    {error && <p role="alert" className="os-notice warning">{error}</p>}
    {busy && <div className="ci-progress" role="status" aria-live="polite"><b>{stages[Math.min(3, Math.floor(progress / 25))]}</b><progress max={100} value={progress}>{progress}%</progress><span>{progress}% · {config.sourceIds.length} sources · {product.name}</span></div>}
    <div className="ci-actions"><button className="os-primary" type="submit" disabled={busy}>{busy ? "Analysis in progress…" : config.mode === "collect" ? "Start simulated collection" : "Start analysis"}</button><button type="button" onClick={onCancel}>{busy ? "Cancel collection" : "Back to overview"}</button></div>
  </form></Panel>;
}

function TopicExplorer({ analysis, sourceId, onEvidence }: { analysis: Analysis; sourceId: SourceId | "all"; onEvidence: (variable: SuggestedVariable | null, topicId?: string) => void }) {
  const [query, setQuery] = useState(""); const [productId, setProductId] = useState<ProductId>(analysis.config.productId);
  const [sentiment, setSentiment] = useState<Sentiment | "all">("all"); const [classification, setClassification] = useState("all");
  const rows = observationsFor(analysis, productId, sourceId);
  const themes = topicSummaries(rows).filter(t => (classification === "all" || t.classification === classification) && `${t.name} ${sentimentNames.map(s => topics.find(topic => topic.id === t.id)![s]).join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (sentiment === "all" ? t.mentions : t[sentiment]) > 0);
  return <Panel title="What matters to consumers" detail="Importance is a topic’s share of scoped mentions. Phrases below are illustrative synthetic evidence."><div className="os-command ci-filters"><label>Search topics or phrases<input type="search" placeholder="Search taste, packaging…" value={query} onChange={e => setQuery(e.target.value)} /></label><label>Product<select value={productId} onChange={e => setProductId(e.target.value as ProductId)}>{[analysis.config.productId, ...analysis.config.competitorIds].map(id => <option key={id} value={id}>{productFor(id).name}</option>)}</select></label><label>Evidence sentiment<select value={sentiment} onChange={e => setSentiment(e.target.value as Sentiment | "all")}><option value="all">All sentiment</option>{sentimentNames.map(s => <option key={s}>{s}</option>)}</select></label><label>Classification<select value={classification} onChange={e => setClassification(e.target.value)}><option value="all">All classifications</option>{["Strength", "Weakness", "Opportunity", "Risk"].map(c => <option key={c}>{c}</option>)}</select></label></div>
    {!themes.length ? <Empty>No themes match these filters. Broaden your search or sentiment selection.</Empty> : <div className="os-table-scroll"><table className="os-table ci-topic-table"><thead><tr><th>Topic</th><th>Importance</th><th>{sentiment === "all" ? "Mentions" : `${sentiment} mentions`}</th><th>Sentiment</th><th>Signal</th><th>Consumer phrase</th></tr></thead><tbody>{themes.map(t => { const phrase = topics.find(topic => topic.id === t.id)!; const tone = sentiment === "all" ? t.positivePct >= 65 ? "positive" : "negative" : sentiment; return <tr key={t.id}><th><button type="button" className="ci-text-button" onClick={() => onEvidence(null, `${productId}:${t.id}`)}>{t.name} ↗</button></th><td><b>{percent(t.importance)}</b><div className="ci-importance"><i style={{ width: `${Math.min(100, t.importance * 5)}%` }} /></div></td><td>{count(sentiment === "all" ? t.mentions : t[sentiment])}</td><td><Split metric={t} /><small>{percent(t.positivePct)} positive</small></td><td><span className={`ci-badge ci-signal-${t.classification.toLowerCase()}`}>{t.classification}</span></td><td><q>{phrase[tone]}</q><small className="ci-phrase-label">Illustrative {tone} phrase</small></td></tr>; })}</tbody></table></div>}
  </Panel>;
}

function Benchmark({ analysis, sourceId }: { analysis: Analysis; sourceId: SourceId | "all" }) {
  const ids = [analysis.config.productId, ...analysis.config.competitorIds];
  const benchmarks = ids.map(id => ({ product: productFor(id), ...summarize(observationsFor(analysis, id, sourceId)), themes: topicSummaries(observationsFor(analysis, id, sourceId)) }));
  const leader = [...benchmarks].sort((a, b) => b.score - a.score)[0];
  if (!analysis.config.competitorIds.length) return <Empty>No competitors selected. Start a new analysis and choose one or more competitors.</Empty>;
  return <><Panel title="Competitive landscape" detail="Same selected sources, market, and date window for every product. Different consumer audiences may affect comparability."><div className="ci-benchmark-bars">{benchmarks.map(b => <div key={b.product.id} className={b.product.id === analysis.config.productId ? "ci-selected-product" : ""}><div><b style={{ color: b.product.color }}>{b.product.name}</b><small>{count(b.mentions)} mentions · {count(b.reviews)} reviews</small></div><Split metric={b} /><strong>{b.score.toFixed(1)}<small> / 100</small></strong></div>)}</div><p className="os-help">Positive / neutral / negative shares · score = positive share + ½ neutral share. {leader.product.name} leads on the overall score in this scope.</p></Panel>
    <Panel title="Topic advantage matrix" detail="Positive sentiment by topic. The gap compares your product with the strongest selected competitor."><div className="os-table-scroll"><table className="os-table ci-matrix"><thead><tr><th>Topic</th>{benchmarks.map(b => <th key={b.product.id}>{b.product.name}</th>)}<th>Gap to best rival</th></tr></thead><tbody>{topics.map(topic => { const values = benchmarks.map(b => b.themes.find(t => t.id === topic.id)!); const gap = values[0].positivePct - Math.max(...values.slice(1).map(v => v.positivePct)); return <tr key={topic.id}><th>{topic.name}</th>{values.map((v, i) => <td key={ids[i]}><span className={v.positivePct >= 65 ? "ci-cell-high" : v.positivePct < 45 ? "ci-cell-low" : "ci-cell-mid"}>{percent(v.positivePct)}</span></td>)}<td className={gap >= 0 ? "ci-good-text" : "ci-risk-text"}>{gap > 0 ? "+" : ""}{gap.toFixed(1)} pp</td></tr>; })}</tbody></table></div></Panel>
    <div className="ci-comparison-grid">{benchmarks.map(b => { const sorted = [...b.themes].sort((a, c) => c.positivePct - a.positivePct); const pain = [...b.themes].sort((a, c) => c.negativePct - a.negativePct)[0]; return <Panel key={b.product.id} title={b.product.name}><dl className="ci-findings"><div><dt>Consumer-loved feature</dt><dd>{sorted[0].name} · {percent(sorted[0].positivePct)} positive</dd></div><div><dt>Consumer pain point</dt><dd>{pain.name} · {percent(pain.negativePct)} negative</dd></div><div><dt>Opportunity gap</dt><dd>Investigate {pain.name.toLowerCase()} friction before changing the proposition.</dd></div></dl></Panel>; })}</div>
  </>;
}

function VariableCard({ variable, onChange, onEvidence }: { variable: SuggestedVariable; onChange: (patch: Parameters<typeof updateVariable>[1]) => void; onEvidence: () => void }) {
  const [name, setName] = useState(variable.name); const [value, setValue] = useState(String(variable.value));
  const [editing, setEditing] = useState(false); const [error, setError] = useState(""); const [typeDraft, setTypeDraft] = useState(variable.type);
  const save = () => { if (!name.trim() || !value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1) { setError("Enter a name and a value from 0 to 1."); return; } onChange({ name: name.trim(), value: Number(value), type: typeDraft }); setEditing(false); setError(""); };
  return <article className="os-panel ci-variable"><header><span className="ci-badge">{variable.status}</span><small>{variable.confidence >= 85 ? "High" : "Medium"} confidence · {variable.confidence}%*</small></header><h3>{variable.name}</h3><p>{variable.insight}</p>
    <div className="ci-variable-value"><strong>{variable.value.toFixed(3)}</strong><span>{variable.type}<small>{variable.impact}</small></span></div>
    {editing && <div className="ci-variable-edit"><label>Variable name<input maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label><label>Value · 0 to 1<input type="number" min="0" max="1" step="0.001" value={value} onChange={e => setValue(e.target.value)} /></label><label>Type<select value={typeDraft} onChange={e => setTypeDraft(e.target.value as SuggestedVariable["type"])}><option>Variable</option><option>Constant Variable</option></select></label>{error && <p role="alert">{error}</p>}<div className="ci-actions"><button type="button" onClick={save}>Save changes</button><button type="button" onClick={() => { setName(variable.name); setValue(String(variable.value)); setTypeDraft(variable.type); setEditing(false); setError(""); }}>Cancel edit</button></div></div>}
    <div className="ci-actions"><button type="button" className="os-primary" disabled={editing || variable.status === "Accepted"} onClick={() => onChange({ status: "Accepted" })}>Accept</button><button type="button" disabled={editing || variable.status === "Rejected"} onClick={() => onChange({ status: "Rejected" })}>Reject</button><button type="button" onClick={() => { setName(variable.name); setValue(String(variable.value)); setTypeDraft(variable.type); setError(""); setEditing(!editing); }}>{editing ? "Close editor" : "Edit"}</button><button type="button" onClick={onEvidence}>Source evidence ↗</button></div>
    <label className="os-checkbox ci-usable"><input type="checkbox" checked={variable.usable} disabled={editing || variable.status !== "Accepted"} onChange={e => onChange({ usable: e.target.checked })} />Usable for optimization</label>
  </article>;
}

export default function ConsumerInsightsStudio({ project, onEvidence, onOutcome, onOpenOptimizer }: Props) {
  const raw = useAnalysisStorage(storageKey(project.id));
  const stored = useMemo(() => restoreWorkspace(raw, project.id), [raw, project.id]);
  const [memoryState, setMemoryState] = useState<ConsumerWorkspace | null>(null);
  const workspace = memoryState ?? stored;
  const analysis = workspace.analyses.find(a => a.id === workspace.activeId) ?? workspace.analyses[0];
  const [tab, setTab] = useState<Tab>("overview"); const [sourceId, setSourceId] = useState<SourceId | "all">("all");
  const [pending, setPending] = useState<AnalysisConfig | null>(null); const [progress, setProgress] = useState(0);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const rows = useMemo(() => observationsFor(analysis, analysis.config.productId, sourceId), [analysis, sourceId]);
  const metric = useMemo(() => summarize(rows), [rows]);
  const save = (next: ConsumerWorkspace) => {
    try { writeAnalysisStorage(storageKey(project.id), next); setMemoryState(null); }
    catch { setMemoryState(next); setNotice("Browser storage is unavailable. Your changes are kept for this open app session."); }
  };
  const replaceAnalysis = (next: Analysis) => save({ ...workspace, analyses: workspace.analyses.map(a => a.id === next.id ? next : a) });
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      const nextProgress = Math.min(100, progress + 25);
      setProgress(nextProgress);
      if (nextProgress < 100) return;
      const created = makeAnalysis(project.id, pending, `CI-${crypto.randomUUID()}`, new Date().toISOString());
      const next = { ...workspace, activeId: created.id, analyses: [created, ...workspace.analyses] };
      let savedLocally = true;
      try { writeAnalysisStorage(storageKey(project.id), next); setMemoryState(null); }
      catch { setMemoryState(next); savedLocally = false; }
      setPending(null); setSourceId("all"); setTab("dashboard");
      setNotice(`${pending.mode === "collect" ? "Simulated collection complete. New" : "New"} insights generated for ${productFor(pending.productId).name}.${savedLocally ? "" : " Browser storage is unavailable; kept for this open app session."}`);
      onOutcome("Consumer insights generated", `${created.title}. ${count(summarize(observationsFor(created)).mentions)} synthetic mentions analyzed in this browser.`, created.id);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [pending, progress, project.id, workspace, onOutcome]);
  const start = (config: AnalysisConfig) => {
    const invalid = validateConfig(config); if (invalid) { setError(invalid); return; }
    if (workspace.analyses.length >= 20) { setError("This project has 20 saved analyses. Use an existing analysis for this demo."); return; }
    setError(""); setNotice(""); setProgress(0); setPending({ ...config });
  };
  const selectAnalysis = (id: string) => { save({ ...workspace, activeId: id }); setSourceId("all"); setNotice(""); };
  const evidence = (variable: SuggestedVariable | null, topicKey?: string) => {
    const [productId, topicId] = topicKey?.split(":") ?? [analysis.config.productId, variable?.topicId];
    const scoped = observationsFor(analysis, productId as ProductId, variable ? "all" : sourceId).filter(r => r.topicId === topicId);
    const theme = topics.find(t => t.id === topicId)!;
    const metrics = summarize(scoped);
    onEvidence(fixtureEvidenceFor(project, { id: `EV-CI-${analysis.id}-${productId}-${topicId}`, claim: `${productFor(productId as ProductId).name}: ${variable?.name ?? theme.name}`, displayedValue: `${count(metrics.mentions)} mentions · ${percent(metrics.positivePct)} positive · ${percent(metrics.negativePct)} negative`, source: "Consumer Insights grouped synthetic observations; illustrative phrases, not real consumer quotations", formula: `${theme.positive} / ${theme.negative}. ${variable ? "Suggested indicator = topic sentiment share. Edited values are user assumptions." : "Topic importance = topic mentions / all scoped mentions."}`, inputs: [analysis.id, analysis.config.market, `${analysis.config.days} days to ${SNAPSHOT}`, ...(variable?.evidenceIds ?? scoped.slice(0, 5).map(r => r.id))], grain: "Project × product × market × source × date × topic" }));
  };
  const exportCsv = () => { const url = URL.createObjectURL(new Blob(["\uFEFF", variablesCsv(analysis)], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `${analysis.id}-variables.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Variables exported as a local CSV file."); };
  const reviewable = eligibleVariables(analysis);
  const scopedTabs = ["dashboard", "topics", "benchmark"].includes(tab);
  const product = productFor(analysis.config.productId);
  return <div className="analysis-workbench consumer-insights">
    <div className="ci-context"><div><span className="ci-eyebrow">CONSUMER INTELLIGENCE</span><h2>{product.fullName}</h2><p>{product.company} · {analysis.config.market} · {analysis.config.days} days to {SNAPSHOT}</p></div><span className="ci-badge">Synthetic demo</span></div>
    <div className="os-command ci-analysis-bar"><label>Analysis in {project.name}<select disabled={!!pending} value={analysis.id} onChange={e => selectAnalysis(e.target.value)}>{workspace.analyses.map(a => <option key={a.id} value={a.id}>{a.title} · {a.id === "CI-DEMO-01" ? "Demo library" : dateLabel(a.createdAt)}</option>)}</select></label><button type="button" className="os-primary" disabled={!!pending} onClick={() => { setError(""); setTab("setup"); }}>+ New analysis</button></div>
    <nav className="ci-tabs" aria-label="Consumer Insights sections">{tabs.map(([id, label]) => <button type="button" key={id} disabled={!!pending} aria-current={tab === id ? "page" : undefined} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}{id === "variables" && <span>{reviewable.length}</span>}</button>)}</nav>
    <p className="ci-boundary">Demo data and simulated AI insights · evidence snapshot {dateLabel(SNAPSHOT)} · saved only in this browser</p>
    {notice && <div className="os-notice ci-notice" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    {scopedTabs && <div className="ci-scope"><label>Source filter<select value={sourceId} onChange={e => setSourceId(e.target.value as SourceId | "all")}><option value="all">All selected sources</option>{sources.filter(s => analysis.config.sourceIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><span>{analysis.config.market} · {analysis.config.days} days · {product.name}</span>{sourceId !== "all" && <button type="button" onClick={() => setSourceId("all")}>Clear filter</button>}</div>}
    {tab === "setup" ? <AnalysisSetup initial={analysis.config} busy={!!pending} progress={progress} error={error} onStart={start} onCancel={() => { setPending(null); setProgress(0); setTab("overview"); setNotice(pending ? "Collection cancelled. No new analysis was created." : ""); }} /> : null}
    {tab === "overview" && <><KPIs metric={summarize(observationsFor(analysis))} /><div className="ci-overview-grid"><Panel title="Your consumer pulse" detail="From evidence to a decision-ready hypothesis"><p className="ci-lead">Understand what consumers value, where competing products lead, and which signals deserve action.</p><div className="ci-actions"><button type="button" className="os-primary" onClick={() => { setSourceId("all"); setTab("dashboard"); }}>Explore sentiment →</button><button type="button" onClick={() => setTab("variables")}>Review suggested variables</button></div><p className="os-help">{analysis.collected ? "Includes a simulated fresh batch in addition to the internal demo library." : "Using the existing internal demo library. Start an analysis to simulate collecting fresh data."}</p></Panel><Panel title="Recent analyses" detail={`Isolated to ${project.name}`}><div className="ci-recent">{workspace.analyses.slice(0, 4).map(a => <button type="button" key={a.id} onClick={() => { selectAnalysis(a.id); setTab("dashboard"); }}><span><b>{a.title}</b><small>{dateLabel(a.createdAt)} · {a.config.sourceIds.length} sources</small></span><span>↗</span></button>)}</div></Panel></div><div className="ci-section-title"><h2>Data source overview</h2><span>Availability is simulated</span></div><SourceCards analysis={analysis} /></>}
    {tab === "dashboard" && <><KPIs metric={metric} />{metric.mentions ? <><div className="ci-dashboard-grid"><TrendChart rows={rows} /><Donut metric={metric} /></div><div className="ci-dashboard-grid"><Panel title="Platform-wise sentiment" detail="Share of mentions on each selected platform"><div className="ci-platforms">{sources.filter(s => analysis.config.sourceIds.includes(s.id) && (sourceId === "all" || sourceId === s.id)).map(s => { const m = summarize(rows.filter(r => r.sourceId === s.id)); return <div key={s.id}><b>{s.name}</b><Split metric={m} /><span>{m.score.toFixed(1)}</span><small>{count(m.mentions)} mentions</small></div>; })}</div><p className="os-help">Score shown at right · positive / neutral / negative shares</p></Panel><RatingChart metric={metric} /></div><div className="ci-dashboard-grid"><Panel title="Topics to watch"><div className="ci-theme-preview">{topicSummaries(rows).sort((a, b) => b.negativePct - a.negativePct).slice(0, 4).map(t => <button type="button" key={t.id} onClick={() => setTab("topics")}><span><b>{t.name}</b><small>{count(t.mentions)} mentions</small></span><span className="ci-risk-text">{percent(t.negativePct)} negative</span></button>)}</div></Panel><Panel title="Product sentiment comparison"><div className="ci-score-bars">{[analysis.config.productId, ...analysis.config.competitorIds].map(id => { const p = productFor(id); const m = summarize(observationsFor(analysis, id, sourceId)); return <div key={id}><b>{p.name}</b><span><i style={{ width: `${m.score}%`, background: p.color }} /></span><strong>{m.score.toFixed(1)}</strong></div>; })}</div><button type="button" onClick={() => setTab("benchmark")}>Explore competitor gaps →</button></Panel></div></> : <Empty>No mentions match this scope. Clear the source filter or start a broader analysis.</Empty>}</>}
    {tab === "topics" && <TopicExplorer key={analysis.id} analysis={analysis} sourceId={sourceId} onEvidence={evidence} />}
    {tab === "benchmark" && <Benchmark analysis={analysis} sourceId={sourceId} />}
    {tab === "variables" && <><div className="ci-section-title"><div><h2>Turn insights into structured inputs</h2><p>Accept a suggestion, review its value, then mark it usable for optimization.</p></div><button type="button" onClick={exportCsv}>Export variables CSV</button></div><p className="os-help">Variables use this analysis’s full scope. Editing a name, type, or value resets acceptance. *Confidence is a synthetic demonstration score.</p><div className="ci-variable-grid">{analysis.variables.map(v => <VariableCard key={`${analysis.id}-${v.id}`} variable={v} onEvidence={() => evidence(v)} onChange={patch => { replaceAnalysis({ ...analysis, variables: analysis.variables.map(item => item.id === v.id ? updateVariable(item, patch) : item), handoff: null }); }} />)}</div><Panel title="Optimization handoff" detail={`${reviewable.length} accepted and usable input${reviewable.length === 1 ? "" : "s"}`}><ol className="ci-handoff"><li className="done">Consumer evidence</li><li className={reviewable.length ? "done" : ""}>Reviewed variables</li><li className={analysis.handoff ? "done" : ""}>Prepared package</li><li>Network Optimizer</li></ol><p>Prepare a local package for downstream review. Opening Network Optimizer keeps your project context; its inputs are not changed by this demo.</p><div className="ci-actions"><button type="button" className="os-primary" disabled={!reviewable.length} onClick={() => { const pack = handoffPackage(analysis); replaceAnalysis({ ...analysis, handoff: `${analysis.id}-HANDOFF` }); setNotice(`Prepared ${pack.variables.length} variables for local review.`); onOutcome("Consumer variable handoff prepared", `${pack.variables.length} synthetic inputs prepared for ${project.name}; no optimizer or agent inputs changed.`, `${analysis.id}-HANDOFF`); }}>Prepare handoff</button><button type="button" disabled={!analysis.handoff || !reviewable.length} onClick={() => downloadJson(handoffPackage(analysis), `${analysis.id}-handoff.json`)}>Download handoff JSON</button><button type="button" onClick={onOpenOptimizer}>{project.mountedAppIds.includes("optimizer") ? "Open Network Optimizer ↗" : "Mount Network Optimizer"}</button></div>{analysis.handoff && <p role="status" className="ci-ready">Package ready · {analysis.handoff}</p>}</Panel></>}
    {tab === "report" && <><Panel title="Executive insight summary" detail={`${product.name} · ${analysis.config.market} · ${analysis.config.days} days · full analysis scope`}><div className="ci-actions"><button type="button" className="os-primary" onClick={() => { downloadJson(reportFor(analysis), `${analysis.id}-report.json`); setNotice("Executive report downloaded as JSON, including metrics, themes, evidence references, and variable decisions."); }}>Download report JSON</button><button type="button" onClick={exportCsv}>Export variables CSV</button></div><KPIs metric={summarize(observationsFor(analysis))} /><div className="ci-summary-grid">{summaryInsights(analysis).map((insight, i) => <article key={insight.label}><span className="ci-summary-number">0{i + 1}</span><div><h3>{insight.label}</h3><p>{insight.text}</p></div></article>)}</div></Panel><Panel title="Analysis basis and next steps"><dl className="ci-findings"><div><dt>Company / product</dt><dd>{product.company} / {product.fullName}</dd></div><div><dt>Project workspace</dt><dd>{project.client} / {project.name}</dd></div><div><dt>Evidence</dt><dd>{analysis.config.sourceIds.map(id => sources.find(s => s.id === id)!.name).join(", ")} · {dateLabel(SNAPSHOT)}</dd></div><div><dt>Variables reviewed</dt><dd>{analysis.variables.filter(v => v.status === "Accepted").length} accepted · {reviewable.length} usable for optimization</dd></div></dl><p className="os-help">This is a synthetic analytical demonstration. Consumer phrases, sentiment labels, and confidence scores are illustrative. Validate real source coverage and product comparability before acting on the recommendations.</p></Panel></>}
  </div>;
}
