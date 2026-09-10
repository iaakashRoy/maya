"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { statisticalRowsFor, type StatisticalTableProfile } from "../statistical-model";
import type { WorkspaceProject } from "../workspace-model";
import { describeColumn, rowsToCsv } from "../statistical-analysis";

const tableThemeEvent = "tanjnx:table-theme";
const subscribeToTheme = (notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener(tableThemeEvent, notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener(tableThemeEvent, notify); }; };
const getTheme = (): "light" | "dark" => window.localStorage.getItem("tanjnx.workspaceTheme") === "dark" ? "dark" : "light";

export default function TableExplorerClient({ project, table }: { project: WorkspaceProject; table: StatisticalTableProfile }) {
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState("all");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light" as const);
  const rows = useMemo(() => statisticalRowsFor(table, 96), [table]);
  const columns = ["record_id", "event_time", ...table.columns.map((item) => item.id)];
  const visibleRows = rows.filter((row) => {
    const values = column === "all" ? Object.values(row) : [row[column]];
    const matchesQuery = !query || values.some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
    const matchesMinimum = !minimum || column === "all" || typeof row[column] !== "number" || Number(row[column]) >= Number(minimum);
    const matchesMaximum = !maximum || column === "all" || typeof row[column] !== "number" || Number(row[column]) <= Number(maximum);
    return matchesQuery && matchesMinimum && matchesMaximum;
  });

  const numericColumn = table.columns.find((item) => item.id === column) ?? table.columns[0];
  const summary = describeColumn(visibleRows, numericColumn.id);
  const fmt = (n: number | null) => n === null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
  const exportCsv = () => { const url = URL.createObjectURL(new Blob([rowsToCsv(visibleRows, columns)], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = `${table.id}-filtered.csv`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); };
  return <main className={`table-explorer-page theme-${theme}`}>
    <header className="table-explorer-header">
      <div><a href={`/?view=company&project=${encodeURIComponent(project.id)}&projectTab=data`}>&larr; Data</a><span>{project.client} / {project.name}</span></div>
      <strong>tanjnx <small>Supply chain workspace</small></strong>
    </header>
    <section className="table-explorer-title">
      <div><p>GOVERNED PROJECT TABLE · {table.tableNodeId}</p><h1>{table.name}</h1><span>{table.source} · {table.grain} · refreshed {table.freshness}</span></div>
      <div className="table-explorer-actions"><button type="button" onClick={() => { const next = theme === "light" ? "dark" : "light"; window.localStorage.setItem("tanjnx.workspaceTheme", next); window.dispatchEvent(new Event(tableThemeEvent)); }}>{theme === "light" ? "Dark mode" : "Light mode"}</button><button type="button" onClick={exportCsv}>Export filtered CSV</button><button type="button" onClick={() => window.print()}>Print</button><button type="button" onClick={() => window.close()}>Close tab</button></div>
    </section>
    <section className="table-profile-cards" aria-label="Table statistical summary">
      <article><span>Displayed sample</span><b>{visibleRows.length} / {rows.length}</b><small>{table.rows} registry rows are not loaded</small></article>
      <article><span>Sample mean · {numericColumn.id}</span><b>{fmt(summary.mean)}</b><small>{summary.n} numeric values · {numericColumn.unit}</small></article>
      <article><span>Sample standard deviation</span><b>{fmt(summary.sd)}</b><small>n − 1 denominator · recalculated after filters</small></article>
      <article><span>P05–P95 empirical range</span><b>{fmt(summary.p05)}–{fmt(summary.p95)}</b><small>Central 90% · not a predictive interval</small></article>
    </section>
    <section className="table-column-profile">
      <header><div><p>VARIABLE PROFILE</p><h2>Distribution and engineering statistics</h2></div><span>{table.columns.length} modeled variables</span></header>
      <div>{table.columns.map((item) => { const profile = describeColumn(visibleRows, item.id); return <article key={item.id}><b>{item.name}</b><span>{profile.n} sampled values · {item.unit}</span><dl><div><dt>Mean</dt><dd>{fmt(profile.mean)}</dd></div><div><dt>Std dev</dt><dd>{fmt(profile.sd)}</dd></div><div><dt>P05 / P50 / P95</dt><dd>{fmt(profile.p05)} / {fmt(profile.p50)} / {fmt(profile.p95)}</dd></div><div><dt>Missing / nonnumeric</dt><dd>{profile.missing}</dd></div></dl></article>; })}</div>
    </section>
    <section className="table-query-panel">
      <header><div><p>QUERY TABLE</p><h2>{visibleRows.length} sample records</h2></div><small>Browser-only filter · source table is unchanged</small></header>
      <div className="table-query-controls"><label>Column<select value={column} onChange={(event) => { setColumn(event.target.value); setMinimum(""); setMaximum(""); }}><option value="all">All columns</option>{columns.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>Find<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter values" /></label><label>Minimum<input value={minimum} disabled={!table.columns.some((item) => item.id === column)} type="number" onChange={(event) => setMinimum(event.target.value)} placeholder="Numeric threshold" /></label><label>Maximum<input value={maximum} disabled={!table.columns.some((item) => item.id === column)} type="number" onChange={(event) => setMaximum(event.target.value)} placeholder="Upper threshold" /></label><button type="button" onClick={() => { setQuery(""); setColumn("all"); setMinimum(""); setMaximum(""); }}>Reset</button></div>
      <div className="table-data-scroll"><table><thead><tr>{columns.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{visibleRows.map((row) => <tr key={String(row.record_id)}>{columns.map((item) => <td key={item}>{row[item]}</td>)}</tr>)}</tbody></table></div>
    </section>
    <footer className="table-explorer-disclaimer">Public-information-inspired simulation. Values are deterministic synthetic fixtures; no client system was queried.</footer>
  </main>;
}
