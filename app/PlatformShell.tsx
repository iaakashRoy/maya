"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ApplicationViews from "./ApplicationViews";
import DataOperations from "./DataOperations";
import DecisionWorkspaces from "./DecisionWorkspaces";
import ScopeDashboard from "./ScopeDashboard";
import { resolveNavigation, scopeIds, viewLabels } from "./navigation";
import {
  applications,
  decisionCases,
  scopeSnapshots,
  type AppId,
  type DataViewId,
  type DecisionCase,
  type ScopeId,
  type ViewId,
  type WorkflowViewId,
} from "./platform-model";

const dataViews = [
  { id: "agents" as const, label: "Data Agent Hub", icon: "DA", detail: "6 agents · 1 attention" },
  { id: "graph" as const, label: "Knowledge Graph", icon: "KG", detail: "8.4M entities" },
];

const workflowViews = [
  { id: "decisions" as const, label: "Decision Inbox", icon: "DI", detail: "Prioritize governed cases" },
  { id: "case" as const, label: "Case Workspace", icon: "CW", detail: "Synthesize five app outputs" },
  { id: "action" as const, label: "Action Room", icon: "AR", detail: "Approve and release work" },
];

type SearchResult = { id: ViewId; label: string; detail: string; group: string; caseId?: string };

type PlatformShellProps = {
  initialView: ViewId;
  initialScope: ScopeId;
  initialCaseId: string;
};

export default function PlatformShell({ initialView, initialScope, initialCaseId }: PlatformShellProps) {
  const [view, setView] = useState<ViewId>(initialView);
  const [scope, setScope] = useState<ScopeId>(initialScope);
  const [cases, setCases] = useState<DecisionCase[]>(() => decisionCases.map((item) => ({ ...item })));
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const [horizon, setHorizon] = useState("Live");
  const [category, setCategory] = useState("All categories");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const snapshot = scopeSnapshots[scope];
  const scopeCases = useMemo(() => cases.filter((item) => item.scope === scope), [cases, scope]);
  const activeCase = cases.find((item) => item.id === selectedCaseId) ?? scopeCases[0] ?? cases[0];
  const searchResults = useMemo(() => {
    const catalog: SearchResult[] = [
      ...scopeIds.map((id) => ({ id: id as ViewId, label: scopeSnapshots[id].label, detail: scopeSnapshots[id].context, group: "Platform scope" })),
      ...workflowViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: item.detail, group: "Decision operations" })),
      ...applications.map((item) => ({ id: item.id as ViewId, label: item.name, detail: item.description, group: "Application" })),
      ...dataViews.map((item) => ({ id: item.id as ViewId, label: item.label, detail: item.detail, group: "Data platform" })),
      ...cases.map((item) => ({ id: "case" as ViewId, caseId: item.id, label: `${item.id} · ${item.title}`, detail: `${item.stage} · ${item.owner} · ${item.primaryEntity}`, group: "Decision case" })),
    ];
    const query = searchQuery.trim().toLowerCase();
    return query ? catalog.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)) : catalog;
  }, [cases, searchQuery]);

  const pushNavigation = (nextView: ViewId, nextScope: ScopeId, nextCaseId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    url.searchParams.set("scope", nextScope);
    url.searchParams.set("case", nextCaseId);
    window.history.pushState({}, "", url);
  };

  const go = (next: ViewId) => {
    const nextScope = scopeIds.includes(next as ScopeId) ? next as ScopeId : scope;
    const nextCaseId = scopeIds.includes(next as ScopeId) ? cases.find((item) => item.scope === nextScope)?.id ?? selectedCaseId : selectedCaseId;
    setScope(nextScope);
    setSelectedCaseId(nextCaseId);
    setView(next);
    setMobileOpen(false);
    setSearchOpen(false);
    pushNavigation(next, nextScope, nextCaseId);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const openCase = (caseId: string, destination: "case" | "action" = "case") => {
    const item = cases.find((candidate) => candidate.id === caseId) ?? activeCase;
    setSelectedCaseId(item.id);
    setScope(item.scope);
    setView(destination);
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    pushNavigation(destination, item.scope, item.id);
    window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus(), 30);
  };

  const updateCase = (caseId: string, patch: Partial<DecisionCase>, message: string) => {
    setCases((current) => current.map((item) => item.id === caseId ? { ...item, ...patch } : item));
    setToast(message);
  };

  const changeScope = (next: ScopeId) => {
    const nextView = scopeIds.includes(view as ScopeId) ? next : view;
    const nextCaseId = cases.find((item) => item.scope === next)?.id ?? selectedCaseId;
    setScope(next);
    setView(nextView);
    setSelectedCaseId(nextCaseId);
    pushNavigation(nextView, next, nextCaseId);
  };

  useEffect(() => {
    const onPopState = () => {
      const url = new URL(window.location.href);
      const navigation = resolveNavigation({
        view: url.searchParams.get("view") ?? undefined,
        scope: url.searchParams.get("scope") ?? undefined,
        case: url.searchParams.get("case") ?? undefined,
      });
      setView(navigation.view);
      setScope(navigation.scope);
      setSelectedCaseId(navigation.caseId);
      setMobileOpen(false);
      setSearchOpen(false);
      setNotificationsOpen(false);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
          <section className="nav-section workflow-nav-section">
            <p>DECISION OPERATIONS</p>
            {workflowViews.map((item) => <button className={`data-nav workflow-nav ${view === item.id ? "active" : ""}`} type="button" key={item.id} onClick={() => go(item.id)}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.detail}</small></div>{item.id === "decisions" && <em>{scopeCases.length}</em>}</button>)}
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
            ["critical", "Graphite response is ready for approval", "$4.2M margin · due in 2 hours", "CASE-1042"],
            ["watch", "Singapore delay now affects 11 priority orders", "Inventory transfer is feasible", "CASE-1041"],
            ["opportunity", "Mexico stock can protect Detroit service", "$1.8M value · no premium freight", "CASE-1038"],
          ].map((item) => <button type="button" key={item[1]} onClick={() => openCase(item[3])}><i className={`tone-${item[0]}`} /><span><b>{item[1]}</b><small>{item[2]}</small></span><em>→</em></button>)}</aside>}
        </header>

        <div className="statusbar"><span><i className="status-live" />Intelligence live</span><span>84.2M evidence records</span><span>18,402 open orders</span><span>2,164 active movements</span><span>Last knowledge merge <b>18 sec ago</b></span><small>DEMO DATA</small></div>

        <main className="main-content">
          {scopeIds.includes(view as ScopeId) ? (
            <ScopeDashboard snapshot={snapshot} cases={scopeCases} horizon={horizon} category={category} onHorizonChange={setHorizon} onCategoryChange={setCategory} onOpenRisk={() => go("risk")} onOpenOptimizer={() => go("optimizer")} onOpenCase={openCase} onOpenDecisions={() => go("decisions")} />
          ) : workflowViews.some((item) => item.id === view) ? (
            <DecisionWorkspaces view={view as WorkflowViewId} cases={scopeCases} activeCase={activeCase} onOpenCase={openCase} onOpenApp={(app) => go(app)} onUpdateCase={updateCase} onToast={setToast} />
          ) : applications.some((item) => item.id === view) ? (
            <ApplicationViews app={view as AppId} snapshot={snapshot} activeCase={activeCase} onOpenCase={() => openCase(activeCase.id)} onOpenAction={() => openCase(activeCase.id, "action")} onOpenAgents={() => go("agents")} onOpenGraph={() => go("graph")} onToast={setToast} />
          ) : (
            <DataOperations view={view as DataViewId} snapshot={snapshot} onOpenApp={(app) => go(app)} onToast={setToast} />
          )}
        </main>

        <footer className="app-footer"><span>Resilience OS · Scope dashboards → Decision Inbox → Case Workspace → Action Room</span><span>Front-end concept · Synthetic data · No operational backend</span></footer>
      </div>

      {searchOpen && <div className="overlay" role="presentation"><button className="overlay-dismiss" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Resilience OS"><div className="search-input"><span>⌕</span><input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search platform levels, applications, suppliers, orders…" /><kbd>ESC</kbd></div><div className="search-context"><span>{searchResults.length} results</span><b>Current context: {snapshot.shortLabel}</b></div><div className="search-results">{searchResults.map((result, index) => <button type="button" key={`${result.id}-${result.caseId ?? index}`} onClick={() => result.caseId ? openCase(result.caseId) : go(result.id)}><span>{result.group}</span><div><b>{result.label}</b><small>{result.detail}</small></div><i>→</i></button>)}</div></section></div>}
      {toast && <div className="toast" role="status" aria-live="polite"><DotIcon /><span>{toast}</span></div>}
    </div>
  );
}

function DotIcon() {
  return <i className="status-live" aria-hidden="true" />;
}
