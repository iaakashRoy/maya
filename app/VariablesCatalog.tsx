"use client";

import { useMemo, useState } from "react";
import { orMethods, type ORMethod } from "./or-methodology";
import { taxonomyCatalog, taxonomyCounts, type TaxonomyEntry, type TaxonomyLevel } from "./taxonomy-catalog.generated";

type CatalogKind = TaxonomyLevel | "METHOD";
type CatalogItem =
  | { kind: TaxonomyLevel; id: string; domain: string; name: string; search: string; variable: TaxonomyEntry }
  | { kind: "METHOD"; id: string; domain: string; name: string; search: string; method: ORMethod };

const levelCopy: Record<TaxonomyLevel, { label: string; detail: string }> = {
  L0: { label: "Atomic variable", detail: "A directly observed, declared, or calculated field with one governed meaning." },
  L1: { label: "Operational grouping", detail: "A reusable operating capability assembled from related L0 variables." },
  L2: { label: "Composite force", detail: "A cross-functional condition built from L1 groupings for decisions and scenarios." },
};

const variableItems: CatalogItem[] = taxonomyCatalog.map((variable) => ({
  kind: variable.level,
  id: variable.id,
  domain: variable.domain,
  name: variable.name,
  search: `${variable.id} ${variable.level} ${variable.domain} ${variable.name} ${variable.meaning} ${variable.components ?? ""} ${variable.examples} ${variable.relationships}`.toLowerCase(),
  variable,
}));
const methodItems: CatalogItem[] = orMethods.map((method) => ({
  kind: "METHOD",
  id: method.code,
  domain: method.family,
  name: method.name,
  search: `${method.code} ${method.family} ${method.name} ${method.purpose} ${method.formulation} ${method.techniques.join(" ")} ${method.outputs.join(" ")} ${method.validation.join(" ")} ${method.decisionShapes.join(" ")}`.toLowerCase(),
  method,
}));
const allItems = [...variableItems, ...methodItems];

const referencedCodes = (value: string) => [...new Set(value.match(/L[012]-\d{3}/g) ?? [])].slice(0, 18);

export default function VariablesCatalog() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"ALL" | CatalogKind>("ALL");
  const [domain, setDomain] = useState("all");
  const [selectedId, setSelectedId] = useState("L0-001");
  const [limit, setLimit] = useState(120);
  const domains = useMemo(() => [...new Set(allItems.filter((item) => kind === "ALL" || item.kind === kind).map((item) => item.domain))].sort(), [kind]);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => allItems.filter((item) =>
    (kind === "ALL" || item.kind === kind) &&
    (domain === "all" || item.domain === domain) &&
    (!normalizedQuery || item.search.includes(normalizedQuery))), [domain, kind, normalizedQuery]);
  const selected = allItems.find((item) => item.id === selectedId) ?? filtered[0] ?? allItems[0];
  const shown = filtered.slice(0, limit);
  const selectItem = (id: string) => { setSelectedId(id); document.querySelector<HTMLElement>(".variables-detail")?.focus(); };
  const selectReference = (id: string) => {
    if (!allItems.some((item) => item.id === id)) return;
    setKind(id.startsWith("L0") ? "L0" : id.startsWith("L1") ? "L1" : "L2");
    setDomain("all");
    setQuery(id);
    setSelectedId(id);
  };

  return <section className="variables-workspace" aria-label="Variables and methods workspace">
    <header className="variables-header" tabIndex={-1} data-page-heading>
      <div><p>GOVERNED TAXONOMY</p><h1>Variables &amp; Methods</h1><span>Search the canonical supply-chain language behind every table, graph, agent trace, and decision model.</span></div>
      <div>{[
        [taxonomyCounts.L0, "L0 atomic"], [taxonomyCounts.L1, "L1 groupings"], [taxonomyCounts.L2, "L2 forces"], [orMethods.length, "methods"],
      ].map(([value, label]) => <span key={label}><b>{value}</b>{label}</span>)}</div>
    </header>

    <div className="variables-toolbar">
      <label className="variables-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(120); }} placeholder="Search code, variable, meaning, example, relationship, or method" /></label>
      <label>Domain<select value={domain} onChange={(event) => { setDomain(event.target.value); setLimit(120); }}><option value="all">All domains</option>{domains.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>

    <nav className="variables-levels" aria-label="Taxonomy levels">{[
      ["ALL", "All", allItems.length], ["L0", "L0 · Atomic", taxonomyCounts.L0], ["L1", "L1 · Operational", taxonomyCounts.L1], ["L2", "L2 · Composite", taxonomyCounts.L2], ["METHOD", "Methods", orMethods.length],
    ].map(([id, label, count]) => <button type="button" key={id} className={kind === id ? "active" : ""} aria-pressed={kind === id} onClick={() => { setKind(id as typeof kind); setDomain("all"); setLimit(120); }}><b>{label}</b><small>{count}</small></button>)}</nav>

    <div className="variables-layout">
      <section className="variables-results" aria-label={`${filtered.length} matching definitions`}>
        <header><b>{filtered.length.toLocaleString()} definitions</b><span>Canonical code · meaning · domain</span></header>
        <div>{shown.map((item) => <button type="button" key={item.id} className={selected?.id === item.id ? "active" : ""} aria-current={selected?.id === item.id ? "true" : undefined} onClick={() => selectItem(item.id)}><code>{item.id}</code><span><b>{item.name}</b><small>{item.domain}</small></span><em>{item.kind === "METHOD" ? "M" : item.kind}</em></button>)}</div>
        {!shown.length ? <p className="variables-empty"><b>No matching definition</b><span>Try a code such as L0-001, a method such as M-16, or a business term such as lead time.</span></p> : null}
        {shown.length < filtered.length ? <button className="variables-more" type="button" onClick={() => setLimit((value) => value + 120)}>Show 120 more · {filtered.length - shown.length} remaining</button> : null}
      </section>

      <aside className="variables-detail" tabIndex={-1} aria-live="polite">{selected ? selected.kind === "METHOD" ? <MethodDetail method={selected.method} /> : <VariableDetail variable={selected.variable} onReference={selectReference} /> : <p>No definition selected.</p>}</aside>
    </div>
  </section>;
}

function VariableDetail({ variable, onReference }: { variable: TaxonomyEntry; onReference: (id: string) => void }) {
  const references = referencedCodes(`${variable.components ?? ""} ${variable.relationships}`);
  return <>
    <header><div><small>{levelCopy[variable.level].label.toUpperCase()} · {variable.domain}</small><h2>{variable.name}</h2><p>{variable.id}</p></div><strong>{variable.level}</strong></header>
    <section><h3>Meaning</h3><p>{variable.meaning}</p><aside>{levelCopy[variable.level].detail}</aside></section>
    {variable.components ? <section><h3>{variable.level === "L1" ? "Atomic variables" : "Contributors"}</h3><p>{variable.components}</p></section> : null}
    <section><h3>Examples</h3><p>{variable.examples}</p></section>
    <section><h3>Relationships</h3><p>{variable.relationships}</p>{references.length ? <div className="variable-references">{references.map((id) => <button type="button" key={id} onClick={() => onReference(id)}>{id}</button>)}</div> : null}</section>
    <footer><b>How to use it</b><span>Use this exact code in data mappings, graph entities, agent prompts, model inputs, controls, and evidence receipts. Project values remain scoped to their client boundary.</span></footer>
  </>;
}

function MethodDetail({ method }: { method: ORMethod }) {
  return <>
    <header><div><small>ANALYTICAL METHOD · {method.family}</small><h2>{method.name}</h2><p>{method.code}</p></div><strong>M</strong></header>
    <section><h3>Purpose</h3><p>{method.purpose}</p></section>
    <section><h3>Formulation</h3><p>{method.formulation}</p></section>
    <section><h3>Techniques</h3><div className="variable-tags">{method.techniques.map((item) => <span key={item}>{item}</span>)}</div></section>
    <section><h3>Governed outputs</h3><div className="variable-tags">{method.outputs.map((item) => <span key={item}>{item}</span>)}</div></section>
    <section><h3>Validation</h3><ul>{method.validation.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section><h3>Runtime / limits</h3><p><b>{method.runtime}.</b> {method.limitations}</p></section>
    <footer><b>Decision shapes</b><span>{method.decisionShapes.join(" · ")}</span></footer>
  </>;
}
