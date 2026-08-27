"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ApplicationViews from "./ApplicationViews";
import DataOperations from "./DataOperations";
import ScopeDashboard from "./ScopeDashboard";
import { applications, scopeSnapshots, type AppId, type DataViewId, type ScopeId, type ViewId } from "./platform-model";

const scopeIds: ScopeId[] = ["global", "region", "company"];
const dataViews = [
  { id: "agents" as const, label: "Data Agent Hub", icon: "DA", detail: "6 agents · 1 attention" },
  { id: "graph" as const, label: "Knowledge Graph", icon: "KG", detail: "8.4M entities" },
];

const viewLabels: Record<ViewId, string> = {
  global: "Global platform",
  region: "Regional platform",
  company: "Company platform",
  risk: "RiskRadar",
  optimizer: "Network Optimizer",
  flow: "FlowLens",
  demand: "DemandSense",
  suppliers: "SupplierGraph",
  agents: "Data Agent Hub",
  graph: "Knowledge Graph",
};

function isViewId(value: string | null): value is ViewId {
  return Boolean(value && Object.prototype.hasOwnProperty.call(viewLabels, value));
}

export default function Home() {
  const [view, setView] = useState<ViewId>(() => {
    if (typeof window === "undefined") return "global";
    const requested = new URLSearchParams(window.location.search).get("view");
    return isViewId(requested) ? requested : "global";
  });
  const [scope, setScope] = useState<ScopeId>(() => {
    if (typeof window === "undefined") return "global";
    const requested = new URLSearchParams(window.location.search).get("scope");
    return scopeIds.includes(requested as ScopeId) ? requested as ScopeId : "global";
  });
  const [horizon, setHorizon] = useState("Live");
  const [category, setCategory] = useState("All categories");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const snapshot = scopeSnapshots[scope];
  const searchResults = useMemo(() => {
    const catalog = [
      ...scopeIds.map((id) => ({ id: id as ViewId, label: scopeSnapshots[id].label, detail: scopeSnapshots[id].context, group: "Platform scope" })),
      ...applications.map((item) => ({ id: item.id as ViewId, label: item.name, detail: item.description, group: "Application" })),
      ...dataViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: item.detail, group: "Data platform" })),
    ];
    const query = searchQuery.trim().toLowerCase();
    return query ? catalog.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)) : catalog;
  }, [searchQuery]);

  const go = (next: ViewId) => {
    if (scopeIds.includes(next as ScopeId)) setScope(next as ScopeId);
    setView(next);
    setMobileOpen(false);
    setSearchOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    url.searchParams.set("scope", scopeIds.includes(next as ScopeId) ? next : scope);
    window.history.pushState({}, "", url);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const changeScope = (next: ScopeId) => {
    const nextView = scopeIds.includes(view as ScopeId) ? next : view;
    setScope(next);
    setView(nextView);
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    url.searchParams.set("scope", next);
    window.history.pushState({}, "", url);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 20);
  }, [searchOpen]);

  useEffect(() => {
    document.title = `${viewLabels[view]} · Resilience OS`;
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="platform-shell">
      {mobileOpen && <button className="mobile-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`side-rail ${mobileOpen ? "open" : ""}`}>
        <header className="brand-block"><button className="brand" type="button" onClick={() => go("global")} aria-label="Open global platform"><span>R</span><div><b>RESILIENCE OS</b><small>CONNECTED SUPPLY NETWORK</small></div></button><button className="rail-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">×</button></header>

        <nav aria-label="Main navigation">
          <section className="nav-section">
            <p>PLATFORM LEVEL</p>
            {scopeIds.map((id, index) => {
              const item = scopeSnapshots[id];
              return <button className={`scope-nav ${view === id ? "active" : ""}`} type="button" key={id} onClick={() => go(id)}><span>0{index + 1}</span><div><b>{item.label}</b><small>{id === "global" ? "World network" : id === "region" ? "APAC operations" : "Apex private twin"}</small></div><i>→</i></button>;
            })}
          </section>
          <section className="nav-section app-nav-section">
            <p>DECISION APPS</p>
            {applications.map((app) => <button className={`app-nav ${view === app.id ? "active" : ""}`} type="button" key={app.id} onClick={() => go(app.id)} style={{ "--app-accent": app.accent } as React.CSSProperties}><span>{app.icon}</span><div><b>{app.name}</b><small>{app.outcome}</small></div>{app.id === "risk" && <em>3</em>}</button>)}
          </section>
          <section className="nav-section">
            <p>DATA PLATFORM</p>
            {dataViews.map((item) => <button className={`data-nav ${view === item.id ? "active" : ""}`} type="button" key={item.id} onClick={() => go(item.id)}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.detail}</small></div></button>)}
          </section>
        </nav>

        <footer className="rail-footer">
          <button type="button" onClick={() => go("agents")}><i className="status-live" /><span><b>Data plane live</b><small>5/6 agents running</small></span><em>→</em></button>
          <p>CONCEPT WORKSPACE · SYNTHETIC DATA</p>
        </footer>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="breadcrumb"><span>Resilience OS</span><i>/</i><b>{viewLabels[view]}</b></div>
          <div className="scope-context"><span>ACTIVE CONTEXT</span><select value={scope} onChange={(event) => changeScope(event.target.value as ScopeId)}><option value="global">Global network</option><option value="region">APAC region</option><option value="company">Apex Mobility</option></select></div>
          <div className="topbar-actions">
            <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)}><span>⌕</span><b>Search anything</b><kbd>⌘ K</kbd></button>
            <button className="topbar-icon" type="button" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}>◌<em>3</em></button>
            <button className="user-button" type="button"><span>MR</span><div><b>Maya Rao</b><small>VP Supply Chain</small></div></button>
          </div>
          {notificationsOpen && <aside className="notification-panel"><header><div><p className="kicker">ATTENTION REQUIRED</p><h2>Three decisions need you</h2></div><button type="button" onClick={() => setNotificationsOpen(false)}>×</button></header>{[
            ["critical", "Graphite response is ready for approval", "$4.2M margin · due in 2 hours", "risk"],
            ["watch", "Singapore delay now affects 11 priority orders", "Inventory transfer is feasible", "optimizer"],
            ["opportunity", "Mexico stock can protect Detroit service", "$1.8M value · no premium freight", "flow"],
          ].map((item) => <button type="button" key={item[1]} onClick={() => go(item[3] as ViewId)}><i className={`tone-${item[0]}`} /><span><b>{item[1]}</b><small>{item[2]}</small></span><em>→</em></button>)}</aside>}
        </header>

        <div className="statusbar"><span><i className="status-live" />Intelligence live</span><span>84.2M evidence records</span><span>18,402 open orders</span><span>2,164 active movements</span><span>Last knowledge merge <b>18 sec ago</b></span><small>DEMO DATA</small></div>

        <main className="main-content">
          {scopeIds.includes(view as ScopeId) ? (
            <ScopeDashboard snapshot={snapshot} horizon={horizon} category={category} onHorizonChange={setHorizon} onCategoryChange={setCategory} onOpenRisk={() => go("risk")} onOpenOptimizer={() => go("optimizer")} />
          ) : applications.some((item) => item.id === view) ? (
            <ApplicationViews app={view as AppId} snapshot={snapshot} onOpenAgents={() => go("agents")} onOpenGraph={() => go("graph")} onToast={setToast} />
          ) : (
            <DataOperations view={view as DataViewId} snapshot={snapshot} onOpenApp={(app) => go(app)} onToast={setToast} />
          )}
        </main>

        <footer className="app-footer"><span>Resilience OS · Global → Region → Company → Decision applications</span><span>Front-end concept · Synthetic data · No operational backend</span></footer>
      </div>

      {searchOpen && <div className="overlay" role="presentation"><button className="overlay-dismiss" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Resilience OS"><div className="search-input"><span>⌕</span><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search platform levels, applications, suppliers, orders…" /><kbd>ESC</kbd></div><div className="search-context"><span>{searchResults.length} results</span><b>Current context: {snapshot.shortLabel}</b></div><div className="search-results">{searchResults.map((result) => <button type="button" key={result.id} onClick={() => go(result.id)}><span>{result.group}</span><div><b>{result.label}</b><small>{result.detail}</small></div><i>→</i></button>)}</div></section></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><DotIcon /><span>{toast}</span></div>}
    </div>
  );
}

function DotIcon() {
  return <i className="status-live" aria-hidden="true" />;
}
