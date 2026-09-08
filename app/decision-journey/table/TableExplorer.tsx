"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { findCase, fingerprint, summarize, toCsv, validateCsv, type Observation } from "../journey-model";
import { ObservationTable } from "../DecisionJourney";
import "../journey.css";

type Snapshot = { id: string; caseId: string; name: string; rows: Observation[] };
export default function TableExplorer() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [minWeek, setMinWeek] = useState(1);
  const [maxWeek, setMaxWeek] = useState(520);
  const [page, setPage] = useState(0);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const c = findCase(params.get("project") ?? "");
        const dataset = params.get("dataset") ?? "";
        if (!c || !dataset.startsWith(`DS-${c.id}-`)) throw new Error("Unknown project or dataset. No fallback to another client's table.");
        const stored = localStorage.getItem(dataset);
        if (!stored) throw new Error("This version is not available in this browser. Publish the dataset from the decision journey first.");
        const parsed = JSON.parse(stored) as Snapshot;
        if (parsed.id !== dataset || parsed.caseId !== c.id || !Array.isArray(parsed.rows) || validateCsv(toCsv(parsed.rows), c).issues.length) throw new Error("The stored table does not match this project's validated schema.");
        setSnapshot(parsed);
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load local table."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const rows = snapshot?.rows.filter(row => row.week >= minWeek && row.week <= maxWeek && Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())) ?? [];
  const stats = summarize(rows);
  const pages = Math.max(1, Math.ceil(rows.length / 50));
  const currentPage = Math.min(page, pages - 1);
  return <main className="journey-table-page" data-theme={dark ? "dark" : "light"}>
    <header><div><p>tanjnx · Local table explorer</p><h1>{snapshot ? `${findCase(snapshot.caseId)!.company} / ${snapshot.name}` : "Versioned table"}</h1><small>{snapshot?.id ?? "Project-scoped lookup"} · No live database connection</small></div><div className="journey-actions"><button onClick={() => setDark(value => !value)}>{dark ? "Light mode" : "Dark mode"}</button><Link href="/decision-journey">Return to journey</Link></div></header>
    {error ? <div className="journey-warning" role="alert"><strong>Table unavailable</strong><p>{error}</p></div> : !snapshot ? <p role="status">Loading the local published version…</p> : <>
      <div className="journey-input-grid"><label>Find in any column<input value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Value or unit…" /></label><label>From week<input type="number" min="1" max="520" value={minWeek} onChange={event => { setMinWeek(Number(event.target.value)); setPage(0); }} /></label><label>Through week<input type="number" min="1" max="520" value={maxWeek} onChange={event => { setMaxWeek(Number(event.target.value)); setPage(0); }} /></label><button onClick={() => { setQuery(""); setMinWeek(1); setMaxWeek(520); setPage(0); }}>Clear filters</button></div>
      <div className="journey-metrics"><article><small>Queryable version</small><strong>{snapshot.rows.length}</strong><span>Actual stored rows</span></article><article><small>Filtered rows</small><strong>{rows.length}</strong><span>All statistics use this selection</span></article><article><small>Mean lead time</small><strong>{rows.length ? stats.mean.toFixed(2) : "—"}</strong><span>Days · sample SD {rows.length > 1 ? stats.sd.toFixed(2) : "—"}</span></article><article><small>P05–P95</small><strong>{rows.length ? `${stats.p05.toFixed(1)}–${stats.p95.toFixed(1)}` : "—"}</strong><span>Days · central 90% empirical range</span></article></div>
      <p>Query {fingerprint([snapshot.id, query, minWeek, maxWeek])} · week ≥ {minWeek} AND week ≤ {maxWeek}{query ? ` AND any column contains “${query}”` : ""}. No SQL or server-side execution is implied.</p>
      <ObservationTable rows={rows.slice(currentPage * 50, (currentPage + 1) * 50)} />
      {!rows.length && <p role="status">No rows match these filters. Clear filters to restore the published table.</p>}
      <div className="journey-actions"><span>Page {currentPage + 1} of {pages} · up to 50 rows per page</span><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Next</button><button onClick={() => { const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = `${snapshot.caseId}-filtered.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Export filtered CSV</button></div>
    </>}
  </main>;
}
