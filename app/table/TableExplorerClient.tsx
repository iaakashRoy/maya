"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { statisticalRowsFor, type StatisticalTableProfile } from "../statistical-model";
import type { WorkspaceProject } from "../workspace-model";

const tableThemeEvent = "tanjnx:table-theme";
const subscribeToTheme = (notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener(tableThemeEvent, notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener(tableThemeEvent, notify); }; };
const getTheme = (): "light" | "dark" => window.localStorage.getItem("tanjnx.workspaceTheme") === "dark" ? "dark" : "light";

export default function TableExplorerClient({ project, table }: { project: WorkspaceProject; table: StatisticalTableProfile }) {
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState("all");
  const [minimum, setMinimum] = useState("");
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light" as const);
  const rows = useMemo(() => statisticalRowsFor(table, 96), [table]);
  const columns = ["record_id", "event_time", ...table.columns.map((item) => item.id)];
  const visibleRows = rows.filter((row) => {
    const values = column === "all" ? Object.values(row) : [row[column]];
    const matchesQuery = !query || values.some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
    const matchesMinimum = !minimum || column === "all" || typeof row[column] !== "number" || Number(row[column]) >= Number(minimum);
    return matchesQuery && matchesMinimum;
  });

  return <main className={`table-explorer-page theme-${theme}`}>
    <header className="table-explorer-header">
      <div><a href={`/?view=company&project=${encodeURIComponent(project.id)}&projectTab=data`}>&larr; Data</a><span>{project.client} / {project.name}</span></div>
      <strong>tanjnx <small>Supply chain workspace</small></strong>
    </header>
    <section className="table-explorer-title">
      <div><p>GOVERNED PROJECT TABLE · {table.tableNodeId}</p><h1>{table.name}</h1><span>{table.source} · {table.grain} · refreshed {table.freshness}</span></div>
      <div className="table-explorer-actions"><button type="button" onClick={() => { const next = theme === "light" ? "dark" : "light"; window.localStorage.setItem("tanjnx.workspaceTheme", next); window.dispatchEvent(new Event(tableThemeEvent)); }}>{theme === "light" ? "Dark mode" : "Light mode"}</button><button type="button" onClick={() => window.print()}>Export view</button><button type="button" onClick={() => window.close()}>Close tab</button></div>
    </section>
    <section className="table-profile-cards" aria-label="Table statistical summary">
      <article><span>Registered rows</span><b>{table.rows}</b><small>Project-isolated synthetic records</small></article>
      <article><span>Data quality</span><b>{table.quality}%</b><small>{table.missingPercent}% missing across modeled fields</small></article>
      <article><span>Best-fit family</span><b>{table.bestFit}</b><small>{table.stationarity}</small></article>
      <article><span>Distribution drift</span><b>{table.driftScore}</b><small>{table.driftScore > 50 ? "Review before reuse" : "Inside monitoring band"}</small></article>
    </section>
    <section className="table-column-profile">
      <header><div><p>VARIABLE PROFILE</p><h2>Distribution and engineering statistics</h2></div><span>{table.columns.length} modeled variables</span></header>
      <div>{table.columns.map((item) => <article key={item.id}><b>{item.name}</b><span>{item.distribution} · fit {item.fitScore}%</span><dl><div><dt>Mean</dt><dd>{item.mean}</dd></div><div><dt>Std dev</dt><dd>{item.standardDeviation}</dd></div><div><dt>P05 / P50 / P95</dt><dd>{item.p05} / {item.p50} / {item.p95}</dd></div><div><dt>Missing</dt><dd>{item.missingPercent}%</dd></div></dl></article>)}</div>
    </section>
    <section className="table-query-panel">
      <header><div><p>QUERY TABLE</p><h2>{visibleRows.length} sample records</h2></div><small>Browser-only filter · source table is unchanged</small></header>
      <div className="table-query-controls"><label>Column<select value={column} onChange={(event) => { setColumn(event.target.value); setMinimum(""); }}><option value="all">All columns</option>{columns.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>Find<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter values" /></label><label>Minimum<input value={minimum} disabled={column === "all"} type="number" onChange={(event) => setMinimum(event.target.value)} placeholder="Numeric threshold" /></label><button type="button" onClick={() => { setQuery(""); setColumn("all"); setMinimum(""); }}>Reset</button></div>
      <div className="table-data-scroll"><table><thead><tr>{columns.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{visibleRows.map((row) => <tr key={String(row.record_id)}>{columns.map((item) => <td key={item}>{row[item]}</td>)}</tr>)}</tbody></table></div>
    </section>
    <footer className="table-explorer-disclaimer">Public-information-inspired simulation. Values are deterministic synthetic fixtures; no client system was queried.</footer>
  </main>;
}
