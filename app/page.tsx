"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateScenario,
  connectorDetails,
  decisionCases,
  notifications,
  roleProfiles,
  type DecisionCase,
  type RoleProfile,
  type ScenarioInput,
  type ScenarioStrategy,
} from "./product-model";
import DataFabric from "./DataFabric";
import DecisionCases from "./DecisionCases";

type Screen = "command" | "radar" | "cases" | "twin" | "optimize" | "product" | "flow" | "trust" | "data" | "services";
type Overlay = "signal" | "case" | "connect" | "create-case" | "search" | "notifications" | "profile" | "activity" | null;
type Signal = {
  id: string;
  level: "Critical" | "Watch" | "Opportunity" | "Policy";
  time: string;
  title: string;
  body: string;
  path: string;
  impact: string;
  confidence: number;
  horizon: string;
  industry: string;
  evidence: string[];
};

const navItems: Array<{ id: Screen; label: string; kicker: string; icon: string; badge?: string }> = [
  { id: "command", label: "Command center", kicker: "OV", icon: "⌂" },
  { id: "radar", label: "Signal radar", kicker: "IN", icon: "◉", badge: "3" },
  { id: "cases", label: "Decision cases", kicker: "OP", icon: "◇", badge: "5" },
  { id: "twin", label: "Decision twin", kicker: "IN", icon: "⌘" },
  { id: "optimize", label: "Scenario studio", kicker: "OP", icon: "∆" },
  { id: "product", label: "Product DNA", kicker: "PD", icon: "◎" },
  { id: "flow", label: "Value flow", kicker: "OP", icon: "↝" },
  { id: "trust", label: "Trust network", kicker: "GV", icon: "◆" },
  { id: "data", label: "Data fabric", kicker: "PL", icon: "▦", badge: "2" },
  { id: "services", label: "Solutions & services", kicker: "SV", icon: "＋" },
];

const navGroups: Array<{ label: string; ids: Screen[] }> = [
  { label: "Overview", ids: ["command"] },
  { label: "Intelligence", ids: ["radar", "twin", "product"] },
  { label: "Operations", ids: ["cases", "optimize", "flow"] },
  { label: "Trust & platform", ids: ["trust", "data"] },
  { label: "Commercial", ids: ["services"] },
];

const signals: Signal[] = [
  {
    id: "graphite",
    level: "Critical",
    time: "12 min ago",
    title: "Graphite capacity tightening in East Asia",
    body: "Two public capacity agreements now cover 18% of forecast merchant supply through Q2.",
    path: "Graphite → Cell supplier → AX-4 drive unit",
    impact: "$4.2M margin at risk",
    confidence: 87,
    horizon: "60–120 days",
    industry: "Critical materials",
    evidence: ["2 public offtake agreements", "1 new export filing", "Pricing index +7.8% / 30d"],
  },
  {
    id: "singapore",
    level: "Watch",
    time: "43 min ago",
    title: "Port dwell time rising across Singapore",
    body: "Median dwell is 31% above the 30-day baseline across two terminals.",
    path: "Singapore → Chennai → Pune Plant 02",
    impact: "11 priority orders exposed",
    confidence: 93,
    horizon: "5–12 days",
    industry: "Ocean logistics",
    evidence: ["Terminal dwell observations", "Carrier schedule revisions", "Weather disruption bulletin"],
  },
  {
    id: "casting",
    level: "Opportunity",
    time: "2 hr ago",
    title: "New precision-casting capacity comes online",
    body: "A qualified regional supplier opened a line matching three constrained part families.",
    path: "Casting → Housing family → 3 products",
    impact: "$620K savings potential",
    confidence: 84,
    horizon: "3–6 months",
    industry: "Industrial manufacturing",
    evidence: ["Operating permit approved", "9 technical roles filled", "ISO certificate verified"],
  },
  {
    id: "cbam",
    level: "Policy",
    time: "4 hr ago",
    title: "Carbon evidence requirement changes for steel imports",
    body: "A reporting update creates a new supplier-data requirement for two EU-bound product families.",
    path: "Steel grade 42CrMo4 → 18 parts → EU programs",
    impact: "$18.7M revenue requires evidence",
    confidence: 96,
    horizon: "By next filing",
    industry: "Trade compliance",
    evidence: ["Official policy publication", "12 affected suppliers", "48 evidence fields incomplete"],
  },
];

const tourSteps: Array<{ screen: Screen; title: string; body: string }> = [
  { screen: "command", title: "One operational command center", body: "Start with exposure, decisions, and measurable value—not another generic dashboard." },
  { screen: "radar", title: "Detect market motion early", body: "Radar turns public and licensed evidence into confidence-scored industry signals." },
  { screen: "twin", title: "Match signals privately", body: "The customer’s graph stays private while external events are matched to actual products and orders." },
  { screen: "optimize", title: "Simulate before acting", body: "Compare response options across margin, cash, service, risk, and carbon." },
  { screen: "product", title: "Understand Product DNA", body: "Connect materials, BOM, assembly, suppliers, should-cost, and design alternatives." },
  { screen: "trust", title: "Share evidence, not secrets", body: "Permissioned credentials support product passports, finance, and insurance partners." },
];

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function SectionIntro({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="section-intro">
      <div><p className="eyebrow">{eyebrow}</p><h1 tabIndex={-1} data-page-heading>{title}</h1><p className="section-copy">{body}</p></div>
      {action ? <div className="intro-action">{action}</div> : null}
    </section>
  );
}

function Metric({ label, value, detail, tone = "light" }: { label: string; value: string; detail: string; tone?: "light" | "dark" | "mint" }) {
  return <article className={`metric metric-${tone}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === "undefined") return "command";
    const requested = new URLSearchParams(window.location.search).get("view") as Screen | null;
    return requested && navItems.some((item) => item.id === requested) ? requested : "command";
  });
  const [selectedSignal, setSelectedSignal] = useState<Signal>(signals[0]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedCase, setSelectedCase] = useState<DecisionCase>(decisionCases[0]);
  const [cases, setCases] = useState<DecisionCase[]>(() => decisionCases.map((item) => ({ ...item })));
  const [connectStep, setConnectStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState("SAP S/4HANA");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const [tourIndex, setTourIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [scenario, setScenario] = useState<ScenarioStrategy>("Balanced recovery");
  const [scenarioInput, setScenarioInput] = useState<ScenarioInput>({ supplyReduction: 32, disruptionWeeks: 14, responseBudget: 1.5, serviceTarget: 94, strategy: "Balanced recovery" });
  const [productTab, setProductTab] = useState("Structure");
  const [trustTab, setTrustTab] = useState("Product passport");
  const [radarFilter, setRadarFilter] = useState("All signals");
  const [roleProfile, setRoleProfile] = useState<RoleProfile>(() => {
    if (typeof window === "undefined") return roleProfiles[0];
    const saved = window.localStorage.getItem("ros-role");
    return roleProfiles.find((item) => item.id === saved) ?? roleProfiles[0];
  });
  const [horizon, setHorizon] = useState(() => typeof window === "undefined" ? "90 days" : window.localStorage.getItem("ros-horizon") ?? "90 days");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadIds, setUnreadIds] = useState(() => new Set(notifications.filter((item) => !item.read).map((item) => item.id)));
  const [graphZoom, setGraphZoom] = useState(100);
  const [graphFocus, setGraphFocus] = useState("Graphite G-142");
  const simulationTimers = useRef<number[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const signalDrawer = overlay === "signal";
  const connectOpen = overlay === "connect";
  const searchOpen = overlay === "search";
  const setSignalDrawer = (open: boolean) => setOverlay(open ? "signal" : null);
  const setConnectOpen = (open: boolean) => setOverlay(open ? "connect" : null);
  const setSearchOpen = (open: boolean) => setOverlay(open ? "search" : null);
  const simulation = useMemo(() => calculateScenario({ ...scenarioInput, strategy: scenario }), [scenarioInput, scenario]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const catalog = [
      ...navItems.map((item) => ({ id: item.id, kind: "Module", title: item.label, detail: `Open ${item.label}`, destination: item.id as Screen })),
      ...signals.map((item) => ({ id: item.id, kind: "Signal", title: item.title, detail: item.impact, destination: "radar" as Screen })),
      ...cases.map((item) => ({ id: item.id, kind: "Decision case", title: `${item.id} · ${item.title}`, detail: `${item.owner} · ${item.stage} · ${item.value}`, destination: "cases" as Screen })),
    ];
    return (query ? catalog.filter((item) => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(query)) : catalog.slice(0, 10)).slice(0, 12);
  }, [searchQuery, cases]);

  const pageTitle = useMemo(() => navItems.find((item) => item.id === screen)?.label ?? "Command", [screen]);

  useEffect(() => {
    const readView = () => {
      const requested = new URLSearchParams(window.location.search).get("view") as Screen | null;
      if (requested && navItems.some((item) => item.id === requested)) setScreen(requested);
    };
    window.addEventListener("popstate", readView);
    return () => window.removeEventListener("popstate", readView);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ros-role", roleProfile.id);
    window.localStorage.setItem("ros-horizon", horizon);
  }, [roleProfile, horizon]);

  useEffect(() => {
    document.title = `${pageTitle} · Resilience OS`;
    const focusTimer = window.setTimeout(() => document.querySelector<HTMLElement>("[data-page-heading]")?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(focusTimer);
  }, [pageTitle]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchQuery("");
        setOverlay("search");
      }
      if (event.key === "Escape") {
        setOverlay(null);
        setTourIndex(-1);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const shouldLock = overlay && !["notifications", "profile"].includes(overlay);
    document.body.style.overflow = shouldLock ? "hidden" : "";
    if (overlay === "search") window.setTimeout(() => searchInputRef.current?.focus(), 40);
    return () => { document.body.style.overflow = ""; };
  }, [overlay]);

  useEffect(() => () => simulationTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const go = (next: Screen) => {
    setScreen(next);
    setOverlay(null);
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    window.history.pushState({ view: next }, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSignal = (signal: Signal) => {
    setSelectedSignal(signal);
    setOverlay("signal");
  };

  const openCase = (item: DecisionCase) => {
    setSelectedCase(item);
    setOverlay("case");
  };

  const updateCase = (updates: Partial<DecisionCase>, message: string) => {
    const next = { ...selectedCase, ...updates, updated: "Just now" };
    setSelectedCase(next);
    setCases((current) => current.map((item) => item.id === next.id ? next : item));
    setToast(message);
  };

  const createCaseFromSignal = () => {
    const existing = cases.find((item) => item.trigger.toLowerCase().includes(selectedSignal.title.split(" ").slice(0,2).join(" ").toLowerCase()));
    if (existing) {
      openCase(existing);
      setToast(`${existing.id} already links this signal.`);
      return;
    }
    const created: DecisionCase = {
      id: `CASE-${1042 + cases.length}`,
      title: `Assess ${selectedSignal.industry.toLowerCase()} exposure`,
      trigger: selectedSignal.title,
      severity: selectedSignal.level === "Critical" ? "Critical" : selectedSignal.level === "Opportunity" ? "Opportunity" : "High",
      owner: roleProfile.name,
      ownerInitials: roleProfile.initials,
      status: "Open",
      stage: "Triage",
      sla: "24h remaining",
      value: selectedSignal.impact,
      updated: "Just now",
      due: "Tomorrow, 10:30",
      site: "Global operating network",
      description: selectedSignal.body,
      synthetic: true,
    };
    setCases((current) => [created, ...current]);
    setSelectedCase(created);
    setOverlay("case");
    setToast(`${created.id} created from ${selectedSignal.id.toUpperCase()}.`);
  };

  const openConnect = () => {
    setConnectStep(1);
    setSelectedSource("SAP S/4HANA");
    setOverlay("connect");
  };

  const startTour = () => {
    setTourIndex(0);
    go(tourSteps[0].screen);
  };

  const advanceTour = () => {
    if (tourIndex >= tourSteps.length - 1) {
      setTourIndex(-1);
      setToast("Tour complete — explore any module freely.");
      return;
    }
    const next = tourIndex + 1;
    setTourIndex(next);
    go(tourSteps[next].screen);
  };

  const runSimulation = () => {
    simulationTimers.current.forEach((timer) => window.clearTimeout(timer));
    setRunning(true);
    setRunProgress(12);
    simulationTimers.current = [
      window.setTimeout(() => setRunProgress(46), 320),
      window.setTimeout(() => setRunProgress(78), 700),
      window.setTimeout(() => setRunProgress(94), 980),
      window.setTimeout(() => {
      setRunning(false);
        setRunProgress(100);
        setCases((current) => current.map((item) => item.id === "CASE-1042" ? { ...item, stage: "Approve", status: "In review", updated: "Just now" } : item));
        setToast(`${scenario} simulation complete — $${simulation.marginProtectedUsdMillions.toFixed(2)}M margin protected.`);
      }, 1250),
    ];
  };

  return (
    <main className="app-shell">
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`side-rail ${mobileNavOpen ? "mobile-open" : ""}`}>
        <div className="rail-head">
          <button className="brand" onClick={() => go("command")} aria-label="Go to command center">R<span>/</span>OS</button>
          <button className="rail-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">×</button>
        </div>
        <button className="workspace-switch" onClick={() => setOverlay("profile")} aria-expanded={overlay === "profile"}>
          <span className="workspace-mark">AM</span>
          <span><b>Aperture Mobility</b><small>Global operating network</small></span>
          <i aria-hidden="true">⌄</i>
        </button>
        <nav className="rail-nav" aria-label="Product modules">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.ids.map((id) => {
                const item = navItems.find((candidate) => candidate.id === id)!;
                return (
                  <button key={item.id} className={`nav-item ${screen === item.id ? "active" : ""}`} onClick={() => go(item.id)} aria-current={screen === item.id ? "page" : undefined}>
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span><b>{item.label}</b>{item.badge && <small className="nav-badge">{item.badge}</small>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <button className="rail-health" onClick={() => go("data")}>
          <span><i /> Data fabric</span><strong>97.2%</strong><small>6 healthy · 2 attention</small>
        </button>
        <div className="rail-actions">
          <button className="tour-link" onClick={startTour}>Guided product tour <span>↗</span></button>
          <button className="rail-activity" onClick={() => setOverlay("activity")}>Audit activity <span>12</span></button>
        </div>
        <div className="version">PRODUCTION CONCEPT · v0.6<br />SYNTHETIC DATA · NO BACKEND</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}>☰</button>
          <div className="mobile-brand">R<span>/</span>OS</div>
          <div className="tenant-breadcrumb"><span>Aperture Mobility</span><i>/</i><b>{pageTitle}</b></div>
          <span className="environment-chip"><i /> DEMO WORKSPACE</span>
          <div className="topbar-actions">
            <label className="horizon-select"><span>Horizon</span><select aria-label="Planning horizon" value={horizon} onChange={(event) => setHorizon(event.target.value)}><option>30 days</option><option>90 days</option><option>6 months</option><option>12 months</option></select></label>
            <button className="search" onClick={() => { setSearchQuery(""); setSearchOpen(true); }}>Search signals, cases, products <kbd>⌘ K</kbd></button>
            <button className="icon-button" aria-label={`${unreadIds.size} unread notifications`} aria-expanded={overlay === "notifications"} onClick={() => setOverlay(overlay === "notifications" ? null : "notifications")}>◌{unreadIds.size > 0 && <span className="notification-dot">{unreadIds.size}</span>}</button>
            <button className="avatar" aria-label="Open role and profile menu" aria-expanded={overlay === "profile"} onClick={() => setOverlay(overlay === "profile" ? null : "profile")}>{roleProfile.initials}</button>
          </div>
          {overlay === "notifications" && <aside className="topbar-popover notification-popover" aria-label="Notifications"><div className="popover-head"><div><p className="eyebrow">NOTIFICATIONS</p><h2>What needs attention</h2></div><button onClick={() => setUnreadIds(new Set())}>Mark all read</button></div>{notifications.slice(0,4).map((item) => <button className="notification-item" key={item.id} onClick={() => { setUnreadIds((current) => { const next = new Set(current); next.delete(item.id); return next; }); go(item.destination as Screen); }}><i className={`notice-${item.severity}`} /><span><b>{item.title}</b><small>{item.body}</small><em>{item.actionLabel} →</em></span>{unreadIds.has(item.id) && <strong>NEW</strong>}</button>)}</aside>}
          {overlay === "profile" && <aside className="topbar-popover profile-popover" aria-label="Role profile"><div className="profile-summary"><span>{roleProfile.initials}</span><div><b>{roleProfile.name}</b><small>{roleProfile.jobTitle}</small></div></div><p className="eyebrow">VIEW AS ROLE</p>{roleProfiles.map((item) => <button className={roleProfile.id === item.id ? "selected" : ""} key={item.id} onClick={() => { setRoleProfile(item); setOverlay(null); go(item.landingScreen as Screen); }}><span>{item.initials}</span><div><b>{item.jobTitle}</b><small>{item.focus}</small></div><i>{roleProfile.id === item.id ? "✓" : ""}</i></button>)}<div className="profile-boundary"><i /> Synthetic role · No account changes</div></aside>}
        </header>

        <div className="context-bar">
          <span><i className="status-ok" /> Intelligence refreshed <b>38 sec ago</b></span>
          <span><i className="status-ok" /> Private twin <b>v18.4</b></span>
          <span><i className="status-watch" /> Source health <b>6/8 within SLA</b></span>
          <button onClick={() => go("data")}>View data lineage →</button>
          <small>Illustrative data</small>
        </div>

        <div className="mobile-nav" aria-label="Mobile product navigation">
          {navItems.map((item) => <button key={item.id} className={screen === item.id ? "active" : ""} onClick={() => go(item.id)} aria-current={screen === item.id ? "page" : undefined}>{item.label.replace(" center", "").replace("Signal ", "")}</button>)}
        </div>

        <div className="content" key={screen}>
          {screen === "command" && (
            <>
              <SectionIntro eyebrow={`${roleProfile.jobTitle.toUpperCase()} · THURSDAY 27 AUGUST`} title={`Good morning, ${roleProfile.name.split(" ")[0]}.`} body={`${roleProfile.focus}. Three new signals need action; the global network remains within its operating envelope.`} action={<div className="header-actions"><button className="secondary" onClick={() => setOverlay("create-case")}>New decision case</button><button className="primary" onClick={() => openCase(cases[0])}>Review critical case <span>↗</span></button></div>} />
              <section className="active-case panel" aria-label="Active decision workflow">
                <div className="active-case-summary"><span className="case-id">CASE-1042</span><div><p className="eyebrow">ACTIVE DECISION THREAD</p><h2>Graphite continuity response</h2><small>Owner Maya Rao · SLA 2h · $3.6M margin protected</small></div><Pill tone="critical">P0 · Approval due</Pill></div>
                <div className="case-steps" aria-label="Decision case progress">{["Detect", "Validate", "Simulate", "Approve", "Execute", "Measure"].map((step,index) => <button className={index < 3 ? "complete" : index === 3 ? "current" : ""} key={step} onClick={() => { const targets: Screen[] = ["radar","twin","optimize","cases","cases","cases"]; go(targets[index]); }}><i>{index < 3 ? "✓" : String(index+1).padStart(2,"0")}</i><span><b>{step}</b><small>{["Signal verified","Impact mapped","Plan generated","COO review","Tasks pending","Outcome baseline"][index]}</small></span></button>)}</div>
                <button className="case-open" onClick={() => openCase(cases[0])}>Open case workspace →</button>
              </section>
              <section className="metrics metrics-four">
                <Metric label="Margin at risk" value="$6.8M" detail="Across 4 active scenarios" tone="dark" />
                <Metric label="Protected by actions" value="$11.2M" detail="↑ $2.4M this quarter" />
                <Metric label="Open signals" value="23" detail="3 require attention" />
                <Metric label="Resilience score" value="82/100" detail="↑ 4 points this month" tone="mint" />
              </section>

              <section className="command-grid">
                <div className="panel signal-panel">
                  <div className="panel-head"><div><p className="eyebrow">RADAR</p><h2>Signals that matter now</h2></div><button className="text-button" onClick={() => go("radar")}>View all 23 <span>→</span></button></div>
                  <div className="signal-list">
                    {signals.slice(0, 3).map((signal, index) => (
                      <button className="signal-row" key={signal.id} onClick={() => openSignal(signal)}>
                        <span className={`signal-index signal-${signal.level.toLowerCase()}`}>0{index + 1}</span>
                        <span className="signal-copy"><span className="signal-meta"><b>{signal.level}</b><time>{signal.time}</time></span><strong>{signal.title}</strong><em>{signal.body}</em><i>{signal.path}</i></span>
                        <span className="signal-impact"><b>{signal.impact}</b><i>Explore ↗</i></span>
                      </button>
                    ))}
                  </div>
                </div>

                <aside className="panel decision-panel">
                  <div className="panel-head"><div><p className="eyebrow">ACTION ROOM</p><h2>Decision queue</h2></div><span className="badge">3</span></div>
                  <article className="decision-card urgent"><Pill tone="critical">Due in 2h</Pill><h3>Secure alternate graphite volume</h3><p>Compare 3 qualified suppliers against cost, lead time, and contract exposure.</p><button onClick={() => openCase(cases[0])}>Review governed case <span>→</span></button></article>
                  <article className="decision-card"><Pill tone="watch">Due today</Pill><h3>Reroute 11 priority orders</h3><p>Two scenarios protect the customer promise with less than 2% cost impact.</p><button onClick={() => openCase(cases[1])}>Open decision case <span>→</span></button></article>
                  <article className="decision-card quiet"><Pill>Monitor</Pill><h3>Qualify regional casting source</h3><p>Engineering match confidence reached 84%.</p></article>
                </aside>
              </section>

              <section className="operations-grid">
                <div className="panel network-table-panel">
                  <div className="panel-head"><div><p className="eyebrow">NETWORK CONTROL</p><h2>Operating pulse by node</h2></div><button className="text-button" onClick={() => go("flow")}>Open flow graph →</button></div>
                  <div className="responsive-table"><table><thead><tr><th>Node</th><th>Service</th><th>Inventory</th><th>Risk</th><th>Data</th></tr></thead><tbody>{[["Pune Plant 02","91.8%","24 days","High","4m"],["Chennai Plant 01","97.1%","31 days","Low","7m"],["Brno Assembly","95.4%","18 days","Watch","12m"],["APAC service network","98.2%","42 days","Low","8m"]].map((row,index)=><tr key={row[0]}><td><i className={`table-status ${index===0?"critical":index===2?"watch":"live"}`} />{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><Pill tone={index===0?"critical":index===2?"watch":"live"}>{row[3]}</Pill></td><td>{row[4]} ago</td></tr>)}</tbody></table></div>
                </div>
                <aside className="panel value-panel">
                  <div className="panel-head"><div><p className="eyebrow">VALUE CONTROL</p><h2>Verified outcomes</h2></div><Pill tone="live">Finance linked</Pill></div>
                  <div className="value-total"><span>YEAR TO DATE</span><strong>$11.2M</strong><small>margin protected + cash released</small></div>
                  <div className="value-bars">{[["Verified",58,"$6.5M"],["In execution",27,"$3.0M"],["Forecast",15,"$1.7M"]].map((item)=><span key={String(item[0])}><b>{item[0]}</b><i><em style={{width:`${item[1]}%`}} /></i><strong>{item[2]}</strong></span>)}</div>
                  <button className="full-action" onClick={() => setOverlay("activity")}>Open value audit →</button>
                </aside>
              </section>

              <section className="capability-strip">
                <button onClick={() => go("radar")}><small>01 · DETECT</small><strong>Industry Radar</strong><span>Public + licensed intelligence</span></button>
                <button onClick={() => go("twin")}><small>02 · UNDERSTAND</small><strong>Private Decision Twin</strong><span>Customer-owned operational graph</span></button>
                <button onClick={() => go("optimize")}><small>03 · ACT</small><strong>Optimizer Studio</strong><span>Scenarios + constrained decisions</span></button>
                <button onClick={() => go("trust")}><small>04 · SHARE</small><strong>Trust Network</strong><span>Permissioned evidence exchange</span></button>
              </section>
            </>
          )}

          {screen === "radar" && (
            <>
              <SectionIntro eyebrow="RADAR · GLOBAL SIGNAL EXCHANGE" title="Detect the move before it becomes a loss." body="Evidence-backed industry signals, privately matched to the materials, suppliers, products, and routes your business depends on." action={<button className="secondary" onClick={() => setToast("Watchlist builder opened in concept mode.")}>+ Build watchlist</button>} />
              <div className="filter-row">
                {["All signals", "Critical materials", "Logistics", "Supplier stress", "Policy", "Opportunities"].map((filter) => <button className={radarFilter === filter ? "active" : ""} key={filter} onClick={() => setRadarFilter(filter)}>{filter}</button>)}
                <span>Updated 38 sec ago</span>
              </div>
              <section className="radar-grid">
                <div className="panel radar-feed">
                  <div className="panel-head"><div><p className="eyebrow">PRIORITIZED FOR YOU</p><h2>{radarFilter}</h2></div><Pill tone="live">23 live</Pill></div>
                  {signals.filter((signal) => radarFilter === "All signals" || radarFilter === "Policy" && signal.level === "Policy" || radarFilter === "Opportunities" && signal.level === "Opportunity" || radarFilter === "Logistics" && signal.industry.includes("logistics") || radarFilter === "Critical materials" && signal.industry.includes("materials") || radarFilter === "Supplier stress" && signal.level === "Watch").map((signal) => (
                    <button className="radar-card" key={signal.id} onClick={() => openSignal(signal)}>
                      <span className={`level-bar level-${signal.level.toLowerCase()}`} />
                      <span className="radar-card-main"><span className="signal-meta"><b>{signal.level}</b><time>{signal.time}</time><i>{signal.industry}</i></span><strong>{signal.title}</strong><em>{signal.body}</em><span className="evidence-line"><b>{signal.confidence}% confidence</b> · {signal.evidence.length} evidence groups · {signal.horizon}</span></span>
                      <span className="radar-impact"><small>YOUR EXPOSURE</small><b>{signal.impact}</b><i>{signal.path}</i><em>Open signal →</em></span>
                    </button>
                  ))}
                </div>

                <aside className="radar-side">
                  <div className="panel motion-card">
                    <div className="panel-head"><div><p className="eyebrow">INDUSTRY MOTION</p><h2>Capacity control index</h2></div><Pill tone="critical">Rising</Pill></div>
                    <div className="motion-chart" aria-label="Capacity control trend chart"><div className="chart-grid" /><div className="trend-area" /><span className="chart-label l1">68</span><span className="chart-label l2">52</span><span className="chart-label l3">36</span><b>Graphite</b><em>+18.4% / 90d</em></div>
                    <div className="motion-list"><span><i className="dot orange" />Battery materials <b>68</b></span><span><i className="dot yellow" />Precision castings <b>54</b></span><span><i className="dot teal" />Industrial controls <b>41</b></span></div>
                  </div>
                  <div className="panel coverage-card"><p className="eyebrow">SOURCE COVERAGE</p><strong>1.2M</strong><span>daily observations</span><div className="coverage-grid"><b>Official<br /><em>32%</em></b><b>Trade<br /><em>27%</em></b><b>News<br /><em>24%</em></b><b>Geo<br /><em>17%</em></b></div><small>All signals retain source, timestamp, license, and correction history.</small></div>
                </aside>
              </section>
            </>
          )}

          {screen === "cases" && (
            <DecisionCases
              cases={cases}
              onOpenCase={openCase}
              onCreateCase={() => setOverlay("create-case")}
              onRunScenario={(item) => { setSelectedCase(item); setScenario("Balanced recovery"); go("optimize"); setToast(`${item.id} loaded into Scenario Studio.`); }}
              onToast={setToast}
            />
          )}

          {screen === "twin" && (
            <>
              <SectionIntro eyebrow="PRIVATE DECISION TWIN · CASE-1042" title="Your operations, connected without replacement." body="A customer-controlled graph links systems, documents, suppliers, products, orders, cash, and external events into one explainable operating context." action={<div className="header-actions"><button className="secondary" onClick={() => setOverlay("activity")}>View lineage</button><button className="primary" onClick={openConnect}>Connect data source <span>+</span></button></div>} />
              <div className="privacy-banner"><span className="lock-mark">PRIVATE</span><p><strong>Customer data boundary active.</strong> Raw operating data stays in this tenant. External signals are matched here; no subscriber sees another client’s network.</p><button onClick={() => setToast("Data boundary policy opened.")}>View policy ↗</button></div>
              <section className="twin-grid">
                <div className="panel graph-panel">
                  <div className="panel-head"><div><p className="eyebrow">IMPACT PATH · GRAPHITE SIGNAL</p><h2>From external event to customer margin</h2></div><div className="graph-controls"><button aria-label="Zoom out" disabled={graphZoom <= 80} onClick={() => setGraphZoom((value) => Math.max(80,value-10))}>−</button><span>{graphZoom}%</span><button aria-label="Zoom in" disabled={graphZoom >= 120} onClick={() => setGraphZoom((value) => Math.min(120,value+10))}>+</button></div></div>
                  <div className="graph-canvas" style={{ zoom: graphZoom / 100 }}>
                    <div className="graph-line gl1" /><div className="graph-line gl2" /><div className="graph-line gl3" /><div className="graph-line gl4" /><div className="graph-line gl5" />
                    <button className={`graph-node event-node ${graphFocus === "Capacity agreements" ? "selected" : ""}`} onClick={() => setGraphFocus("Capacity agreements")}><small>EXTERNAL EVENT</small><b>Capacity<br />agreements</b><em>87% confidence</em></button>
                    <button className={`graph-node supplier-node ${graphFocus === "NeoGraph Materials" ? "selected" : ""}`} onClick={() => setGraphFocus("NeoGraph Materials")}><small>TIER 2 · SYNTHETIC</small><b>NeoGraph<br />Materials</b><em>32% allocation</em></button>
                    <button className={`graph-node part-node ${graphFocus === "Graphite G-142" ? "selected" : ""}`} onClick={() => setGraphFocus("Graphite G-142")}><small>MATERIAL</small><b>Graphite<br />G-142</b><em>Single source</em></button>
                    <button className={`graph-node product-node ${graphFocus === "AX-4 Drive unit" ? "selected" : ""}`} onClick={() => setGraphFocus("AX-4 Drive unit")}><small>PRODUCT</small><b>AX-4<br />Drive unit</b><em>18% revenue</em></button>
                    <button className={`graph-node customer-node ${graphFocus === "Priority programs" ? "selected" : ""}`} onClick={() => setGraphFocus("Priority programs")}><small>CUSTOMERS</small><b>4 priority<br />programs</b><em>$4.2M at risk</em></button>
                    <div className="graph-legend"><span><i className="dot orange" />External</span><span><i className="dot teal" />Private verified</span><span><i className="dot yellow" />Inferred</span></div>
                  </div>
                  <div className="source-dock"><span>CONNECTED</span>{["SAP S/4", "Teamcenter PLM", "Blue Yonder TMS", "Quality files", "Supplier portal"].map((source, index) => <button key={source} onClick={() => { go("data"); setToast(`${source} lineage opened.`); }}><i className={index < 4 ? "ok" : "warn"} />{source}</button>)}<button className="add-source" onClick={openConnect}>+ Add source</button></div>
                </div>
                <aside className="panel exposure-panel">
                  <div className="panel-head"><div><p className="eyebrow">EXPOSURE EXPLAINED</p><h2>{graphFocus}</h2></div><Pill tone="critical">High</Pill></div>
                  <div className="exposure-score"><span>FINANCIAL RANGE</span><strong>$3.4–4.8M</strong><small>Potential contribution margin impact</small></div>
                  <dl className="facts"><div><dt>Products affected</dt><dd>3</dd></div><div><dt>Open orders</dt><dd>28</dd></div><div><dt>Coverage</dt><dd>41 days</dd></div><div><dt>Alternate lead time</dt><dd>76 days</dd></div></dl>
                  <div className="evidence-stack"><p className="eyebrow">EVIDENCE CHAIN</p><span><b>Observed</b> Public offtake agreement</span><span><b>Verified</b> Internal material mapping</span><span><b>Calculated</b> Order + margin exposure</span></div>
                  <button className="full-action" onClick={() => go("optimize")}>Simulate response options <span>→</span></button>
                </aside>
              </section>
            </>
          )}

          {screen === "optimize" && (
            <>
              <SectionIntro eyebrow={`SCENARIO STUDIO · ${selectedCase.id}`} title="Test the response before committing cash." body="Constrained optimization compares feasible actions across financial impact, service, speed, risk, and emissions. Every output below recalculates from the controlled assumptions." action={<button className="primary" disabled={running} onClick={runSimulation}>{running ? `Solving · ${runProgress}%` : "Run governed simulation"} <span>{running ? "···" : "↗"}</span></button>} />
              <section className="optimizer-grid">
                <div className="panel scenario-builder">
                  <div className="panel-head"><div><p className="eyebrow">CONTROLLED ASSUMPTIONS</p><h2>Graphite supply constraint</h2></div><div className="run-identity"><Pill tone="live">Twin v18.4</Pill><small>{simulation.simulationId}</small></div></div>
                  {running && <div className="simulation-progress" role="status" aria-live="polite"><span style={{width:`${runProgress}%`}} /><b>Solver evaluating feasible network actions · {runProgress}%</b></div>}
                  <div className="assumption-grid"><label>Supply reduction<strong>−{scenarioInput.supplyReduction}%</strong><input aria-label="Supply reduction percent" type="range" min="0" max="60" value={scenarioInput.supplyReduction} onChange={(event) => setScenarioInput((current) => ({...current,supplyReduction:Number(event.target.value)}))} /></label><label>Disruption window<strong>{scenarioInput.disruptionWeeks} weeks</strong><input aria-label="Disruption duration in weeks" type="range" min="2" max="28" value={scenarioInput.disruptionWeeks} onChange={(event) => setScenarioInput((current) => ({...current,disruptionWeeks:Number(event.target.value)}))} /></label><label>Service target<strong>{scenarioInput.serviceTarget}% OTIF</strong><input aria-label="Service target percent" type="range" min="85" max="99" value={scenarioInput.serviceTarget} onChange={(event) => setScenarioInput((current) => ({...current,serviceTarget:Number(event.target.value)}))} /></label><label>Response budget<strong>${scenarioInput.responseBudget.toFixed(1)}M</strong><input aria-label="Response budget in millions" type="range" min="0.2" max="3" step="0.1" value={scenarioInput.responseBudget} onChange={(event) => setScenarioInput((current) => ({...current,responseBudget:Number(event.target.value)}))} /></label></div>
                  <div className="constraints"><p className="eyebrow">HARD CONSTRAINTS</p><span>Safety stock ≥ 21 days</span><span>OTIF ≥ {scenarioInput.serviceTarget}%</span><span>Approved grades only</span><span>Spend ≤ ${scenarioInput.responseBudget.toFixed(1)}M</span><button onClick={() => setToast("Constraint editor opened in prototype mode.")}>+ Add</button></div>
                  <div className="timeline-chart"><div className="timeline-axis"><span>NOW</span><span>WEEK 4</span><span>WEEK 8</span><span>WEEK 12</span><span>WEEK 16</span></div><div className="timeline-row"><b>Projected supply</b><i className="bar supply-bar" style={{width:`${Math.max(20,100-scenarioInput.supplyReduction)}%`}} /></div><div className="timeline-row"><b>Required demand</b><i className="bar demand-bar" style={{width:`${scenarioInput.serviceTarget}%`}} /></div><div className="timeline-row"><b>Protected supply</b><i className="bar protected-bar" style={{width:`${simulation.projectedOtifPercent}%`}} /></div><div className="risk-window" style={{left:`${Math.max(35,70-scenarioInput.supplyReduction/2)}%`,width:`${Math.min(35,scenarioInput.disruptionWeeks)}%`}}>SHORTAGE WINDOW</div></div>
                </div>
                <aside className="panel scenario-results">
                  <div className="panel-head"><div><p className="eyebrow">RECOMMENDED PLAN</p><h2>{scenario}</h2></div><span className="fit-score">{simulation.resilienceScore}<small>/100 resilience</small></span></div>
                  <div className="result-hero"><span>MARGIN PROTECTED</span><strong>${simulation.marginProtectedUsdMillions.toFixed(2)}M</strong><small>for ${simulation.incrementalCostUsdMillions.toFixed(2)}M incremental cost</small></div>
                  <div className="result-bars"><span><b>OTIF</b><i><em style={{ width: `${simulation.projectedOtifPercent}%` }} /></i><strong>{simulation.projectedOtifPercent}%</strong></span><span><b>Cash impact</b><i><em style={{ width: `${Math.min(100,Math.abs(simulation.cashImpactUsdMillions)*55)}%` }} /></i><strong>−${Math.abs(simulation.cashImpactUsdMillions).toFixed(2)}M</strong></span><span><b>Risk reduction</b><i><em style={{ width: `${simulation.riskReductionPercent}%` }} /></i><strong>{simulation.riskReductionPercent}%</strong></span><span><b>CO₂ impact</b><i><em style={{ width: `${Math.min(100,Math.abs(simulation.carbonDeltaPercent)*12)}%` }} /></i><strong>{simulation.carbonDeltaPercent>0?"+":""}{simulation.carbonDeltaPercent}%</strong></span></div>
                  {simulation.warnings.length > 0 && <div className="scenario-warning"><b>MODEL FLAGS</b>{simulation.warnings.map((warning)=><span key={warning}>{warning}</span>)}</div>}
                  <ol className="action-plan">{simulation.recommendedActions.map((action)=><li key={action.id}><b>{action.label}</b><span>{action.owner} · {action.timing} · ${action.spendUsdMillions.toFixed(2)}M</span></li>)}</ol>
                  <button className="full-action" onClick={() => { setCases((current) => current.map((item) => item.id === selectedCase.id ? {...item,stage:"Approve",status:"In review",updated:"Just now"} : item)); setSelectedCase((current) => ({...current,stage:"Approve",status:"In review",updated:"Just now"})); setToast("Versioned decision package routed to the approval matrix."); setOverlay("case"); }}>Route for approval <span>→</span></button>
                </aside>
              </section>
              <section className="panel comparison-panel"><div className="panel-head"><div><p className="eyebrow">COMPARE STRATEGIES</p><h2>Four deterministic response policies</h2></div><small className="table-note">Select a row to recalculate the recommendation</small></div><div className="scenario-table"><div className="scenario-header"><span>Strategy</span><span>Margin protected</span><span>Spend posture</span><span>Service bias</span><span>Carbon posture</span></div>{[["Balanced recovery","Balanced","Moderate","Target","Moderate"],["Fastest recovery","Highest","High","Above target","Higher"],["Lowest cash impact","Lower","Lowest","Below target","Lowest"],["Service first","High","High","Highest","Higher"]].map((row) => <button key={row[0]} aria-pressed={scenario === row[0]} className={scenario === row[0] ? "selected" : ""} onClick={() => setScenario(row[0] as ScenarioStrategy)}>{row.map((cell) => <span key={cell}>{cell}</span>)}</button>)}</div></section>
            </>
          )}

          {screen === "product" && (
            <>
              <SectionIntro eyebrow="PRODUCT DNA · AX-4 ELECTRIC DRIVE" title="Know what it is, how it is made, and what it should cost." body="One product graph connects design, materials, assembly, suppliers, cost, compliance, and better alternatives." action={<button className="secondary" onClick={() => setToast("Product selected: AX-4 Electric Drive.")}>Change product⌄</button>} />
              <div className="tab-row">{["Structure", "Should cost", "Design options", "Compliance"].map((tab) => <button className={productTab === tab ? "active" : ""} key={tab} onClick={() => setProductTab(tab)}>{tab}</button>)}</div>
              {productTab === "Structure" && <section className="product-grid"><div className="panel product-visual"><div className="product-core"><div className="part p1"><span>01</span><b>Controller</b><em>$142</em></div><div className="part p2"><span>02</span><b>Stator</b><em>$218</em></div><div className="part p3"><span>03</span><b>Rotor</b><em>$174</em></div><div className="part p4"><span>04</span><b>Housing</b><em>$96</em></div><div className="part p5"><span>05</span><b>Gear set</b><em>$128</em></div><div className="core-circle"><small>AX-4</small><strong>1,284</strong><span>components</span></div></div><div className="visual-caption"><span><b>18</b> critical parts</span><span><b>42</b> materials</span><span><b>67</b> suppliers</span><span><b>9</b> countries</span></div></div><aside className="panel bom-panel"><div className="panel-head"><div><p className="eyebrow">PRODUCT STRUCTURE</p><h2>Critical hierarchy</h2></div><Pill tone="watch">3 issues</Pill></div>{[["Drive unit AX-4","1","$1,246"],["Power electronics","84","$298"],["Motor assembly","426","$477"],["Gear assembly","338","$264"],["Housing + thermal","218","$136"],["Fasteners + seals","217","$71"]].map((row,index)=><button key={row[0]} className={index===2?"highlight":""}><span>{index ? "↳" : ""} {row[0]}</span><b>{row[1]} parts</b><em>{row[2]}</em></button>)}</aside></section>}
              {productTab === "Should cost" && <section className="cost-grid"><div className="panel cost-waterfall"><div className="panel-head"><div><p className="eyebrow">SHOULD-COST MODEL</p><h2>Cost build-up per unit</h2></div><Pill tone="live">93% evidence</Pill></div><div className="cost-total"><span>MODELLED COST</span><strong>$1,246</strong><small>Supplier quote: $1,338 · Gap: <b>+$92</b></small></div><div className="cost-bars">{[["Materials",46,"$573"],["Conversion",21,"$262"],["Labor",11,"$137"],["Logistics + duty",9,"$112"],["Tooling + quality",7,"$87"],["Overhead + margin",6,"$75"]].map((row)=><span key={String(row[0])}><b>{row[0]}</b><i><em style={{width:`${Number(row[1])*1.8}%`}} /></i><strong>{row[2]}</strong></span>)}</div></div><aside className="panel cost-drivers"><div className="panel-head"><div><p className="eyebrow">NEGOTIATION LEVERS</p><h2>$128 identified</h2></div></div><article><Pill tone="opportunity">$46 / unit</Pill><h3>Graphite index mismatch</h3><p>Quote uses May peak; contracted index reset supports a lower baseline.</p></article><article><Pill tone="opportunity">$38 / unit</Pill><h3>Cycle-time assumption</h3><p>Observed supplier line rate is 11% faster than quoted routing.</p></article><article><Pill tone="watch">$44 / unit</Pill><h3>Regional logistics premium</h3><p>Consolidation scenario removes one partial-load movement.</p></article><button className="full-action" onClick={() => setToast("Negotiation pack generated.")}>Generate negotiation pack →</button></aside></section>}
              {productTab === "Design options" && <section className="design-options">{[["Commonize housing fasteners","Remove 4 unique parts","$184K annual","Low effort","96%"],["Switch to regional casting route","2 qualified suppliers","$620K annual","Medium effort","84%"],["Relax non-functional tolerance","Cycle time −9%","$271K annual","Engineering review","79%"],["Replace graphite grade","Remove single-source risk","Risk reduction","Validation required","68%"]].map((row,index)=><article className="panel" key={row[0]}><span className="option-num">0{index+1}</span><Pill tone={index<2?"opportunity":"watch"}>{row[4]} confidence</Pill><h2>{row[0]}</h2><p>{row[1]}</p><strong>{row[2]}</strong><small>{row[3]}</small><button onClick={() => setToast(`Design study opened: ${row[0]}`)}>Open study →</button></article>)}</section>}
              {productTab === "Compliance" && <section className="compliance-grid"><div className="panel passport-preview"><div className="passport-head"><span>PRODUCT PASSPORT</span><b>AX4-2026-EU</b></div><h2>AX-4 Electric Drive</h2><p>Model · EU configuration · Revision E</p><div className="passport-code" aria-label="Concept product code">AX4<br/>E26</div><dl><div><dt>Material evidence</dt><dd>94%</dd></div><div><dt>Origin evidence</dt><dd>89%</dd></div><div><dt>Carbon evidence</dt><dd>76%</dd></div><div><dt>Restricted substances</dt><dd>2 open</dd></div></dl></div><aside className="panel requirement-list"><div className="panel-head"><div><p className="eyebrow">EVIDENCE READINESS</p><h2>48 fields required</h2></div><Pill tone="watch">12 open</Pill></div>{["Product identity and revision","Material composition","Supplier declarations","Country of origin","Carbon calculation","Repair + end-of-life"].map((item,index)=><span key={item}><i className={index<3?"complete":index===3?"partial":"missing"}/><b>{item}</b><em>{index<3?"Complete":index===3?"Partial":"Evidence needed"}</em></span>)}</aside></section>}
            </>
          )}

          {screen === "flow" && (
            <>
              <SectionIntro eyebrow="FLOW GRAPH · MONEY + INVENTORY" title="See where operations become cash—or consume it." body="Link purchase orders, inventory, shipments, invoices, payment terms, and disruption exposure into one working-capital view." action={<button className="secondary" onClick={() => setToast("Cash scenario exported.")}>Export cash scenario ↗</button>} />
              <section className="metrics metrics-four"><Metric label="Cash conversion cycle" value="73 days" detail="↓ 6 days this quarter" tone="dark"/><Metric label="Inventory cash" value="$28.4M" detail="$4.1M exposed to delay"/><Metric label="Receivables at risk" value="$6.7M" detail="Across 14 delayed orders"/><Metric label="Release opportunity" value="$3.2M" detail="7 recommended actions" tone="mint"/></section>
              <section className="flow-grid"><div className="panel money-map"><div className="panel-head"><div><p className="eyebrow">ORDER-TO-CASH PATH</p><h2>AX-4 customer program</h2></div><Pill tone="critical">12-day risk</Pill></div><div className="money-timeline">{[["PO placed","$2.8M","Complete"],["Material received","$1.1M","Complete"],["Production","$0.6M","In progress"],["Shipment","$0.2M","At risk"],["Invoice","$3.7M","12d delay"],["Collection","$3.7M","Forecast"]].map((item,index)=><div className={index===3||index===4?"risk":""} key={item[0]}><span>{String(index+1).padStart(2,"0")}</span><i/><b>{item[0]}</b><strong>{item[1]}</strong><em>{item[2]}</em></div>)}</div><div className="cash-driver"><span>Graphite shortage</span><b>pushes shipment +12 days</b><span>→</span><strong>$3.7M collection delayed</strong></div></div><aside className="panel release-panel"><div className="panel-head"><div><p className="eyebrow">CASH RELEASE</p><h2>Top opportunities</h2></div></div>{[["Rebalance excess inventory","$1.24M","8 sites"],["Renegotiate graphite terms","$860K","2 suppliers"],["Resolve invoice disputes","$610K","14 invoices"],["Use early-payment option","$490K","11.8% yield"]].map((item,index)=><button key={item[0]} onClick={() => setToast(`${item[0]} workflow opened.`)}><span className="option-num">0{index+1}</span><b>{item[0]}</b><strong>{item[1]}</strong><em>{item[2]}</em><i>→</i></button>)}</aside></section>
            </>
          )}

          {screen === "trust" && (
            <>
              <SectionIntro eyebrow="TRUST NETWORK" title="Share verified evidence, not confidential operations." body="Permissioned credentials connect manufacturers with customers, customs, banks, insurers, and certifiers while the private decision twin stays private." action={<button className="secondary" onClick={() => setToast("Partner invitation flow opened.")}>Invite partner +</button>} />
              <div className="tab-row">{["Product passport", "Finance readiness", "Insurance evidence", "Credential exchange"].map((tab)=><button className={trustTab===tab?"active":""} key={tab} onClick={()=>setTrustTab(tab)}>{tab}</button>)}</div>
              <section className="trust-grid"><div className="panel trust-journey"><div className="panel-head"><div><p className="eyebrow">{trustTab.toUpperCase()}</p><h2>Evidence workflow</h2></div><Pill tone="live">Permissioned</Pill></div><div className="trust-flow"><div><span>01</span><i className="complete"/><b>Collect</b><p>Pull approved evidence from the private twin.</p></div><div><span>02</span><i className="complete"/><b>Verify</b><p>Check source, issuer, validity, and freshness.</p></div><div><span>03</span><i className="partial"/><b>Package</b><p>Create the minimum evidence for this purpose.</p></div><div><span>04</span><i/><b>Share</b><p>Release to an approved partner with expiry.</p></div></div><div className="permission-box"><span className="lock-mark">PRIVATE</span><div><b>Data minimization active</b><p>The recipient sees verified claims and approved fields—not raw ERP, pricing, or supplier records.</p></div></div></div><aside className="panel partner-panel"><div className="panel-head"><div><p className="eyebrow">CONNECTED PARTNERS</p><h2>3 organizations</h2></div></div>{[["Global Trade Bank","Finance verifier","Active"],["Harbor Mutual","Cargo insurer","Active"],["Veritas Labs","Material certifier","Pending"]].map((partner,index)=><article key={partner[0]}><span className="partner-logo">{partner[0].split(" ").map(word=>word[0]).join("")}</span><div><b>{partner[0]}</b><p>{partner[1]}</p></div><Pill tone={index<2?"live":"watch"}>{partner[2]}</Pill></article>)}<button className="full-action" onClick={() => setToast("Evidence package preview opened.")}>Preview evidence package →</button></aside></section>
              <section className="credential-strip"><article><small>PRODUCT</small><strong>Digital product passport</strong><span>Material · origin · carbon · repair</span></article><article><small>FINANCE</small><strong>Trade-finance evidence</strong><span>Order · delivery · invoice · performance</span></article><article><small>INSURANCE</small><strong>Risk evidence pack</strong><span>Exposure · controls · events · recovery</span></article><article><small>TRUST</small><strong>Verifiable credentials</strong><span>Issuer · holder · verifier · expiry</span></article></section>
            </>
          )}

          {screen === "data" && (
            <DataFabric connectors={connectorDetails} onConnect={openConnect} onToast={setToast} />
          )}

          {screen === "services" && (
            <>
              <SectionIntro eyebrow="APPLICATION + SERVICES" title="A platform that lands through measurable services." body="Start with a narrow decision problem, prove the value, then expand the graph, tools, partners, and subscription." action={<button className="primary" onClick={() => setToast("Pilot brief generated.")}>Build pilot brief <span>↗</span></button>} />
              <section className="service-products">{[["Radar","Subscription intelligence","Signals across industry, materials, suppliers, routes, policy, cyber, and opportunity.","Always-on"],["Decision Twin","Private customer graph","Approved operating data mapped into a customer-controlled, explainable context.","6–10 weeks"],["Optimizer Studio","Decision tools","Forecasting, simulation, sourcing, inventory, production, logistics, cost, and cash.","Module-based"],["Trust Network","Partner evidence","Product passports, finance readiness, insurance evidence, and credentials.","Partner-led"]].map((service,index)=><article className="panel" key={service[0]}><span className="service-num">0{index+1}</span><Pill tone={index===0?"critical":index===1?"live":index===2?"opportunity":"watch"}>{service[3]}</Pill><h2>{service[0]}</h2><h3>{service[1]}</h3><p>{service[2]}</p><button onClick={()=>go((["radar","twin","optimize","trust"] as Screen[])[index])}>Explore module →</button></article>)}</section>
              <section className="delivery-grid"><div className="panel delivery-roadmap"><div className="panel-head"><div><p className="eyebrow">CUSTOMER JOURNEY</p><h2>Land, prove, and expand</h2></div></div>{[["01","Diagnose","Define one costly decision and its baseline.","Week 1"],["02","Connect","Build the minimal private graph from approved sources.","Weeks 2–3"],["03","Replay","Test signals and recommendations against historical events.","Weeks 4–5"],["04","Operate","Run the workflow live with human approval.","Weeks 6–8"],["05","Measure","Verify margin, cash, service, and cycle-time impact.","Weeks 9–10"],["06","Expand","Add plants, products, tools, and partner evidence.","Annual"]].map((step)=><article key={step[0]}><span>{step[0]}</span><b>{step[1]}</b><p>{step[2]}</p><em>{step[3]}</em></article>)}</div><aside className="panel offer-panel"><p className="eyebrow">FIRST COMMERCIAL OFFER</p><h2>Margin & Resilience Diagnostic</h2><p>A paid, fixed-scope engagement that creates the first decision twin and converts into annual software.</p><dl><div><dt>Scope</dt><dd>1 plant / product family</dd></div><div><dt>Duration</dt><dd>6–10 weeks</dd></div><div><dt>Inputs</dt><dd>3–5 approved sources</dd></div><div><dt>Output</dt><dd>Signals, graph, scenarios, ROI</dd></div><div><dt>Commercial</dt><dd>$10K–$30K hypothesis</dd></div></dl><button className="full-action" onClick={() => setToast("Diagnostic scope copied to the pilot brief.")}>Add to pilot brief →</button></aside></section>
            </>
          )}
        </div>

        <footer className="app-footer"><span>RESILIENCE OS · PRODUCTION-GRADE CLICKFLOW</span><span>{pageTitle} · Synthetic illustrative data · Front-end only · No operational backend</span></footer>
      </section>

      {signalDrawer && <div className="overlay"><aside className="drawer" role="dialog" aria-modal="true" aria-label="Signal detail"><button className="close" onClick={() => setSignalDrawer(false)}>×</button><p className="eyebrow">SIGNAL DETAIL · {selectedSignal.id.toUpperCase()}</p><div className="drawer-title"><Pill tone={selectedSignal.level.toLowerCase()}>{selectedSignal.level}</Pill><span>{selectedSignal.time}</span></div><h2>{selectedSignal.title}</h2><p className="drawer-lede">{selectedSignal.body}</p><div className="drawer-metrics"><span><small>CONFIDENCE</small><b>{selectedSignal.confidence}%</b></span><span><small>HORIZON</small><b>{selectedSignal.horizon}</b></span><span><small>EXPOSURE</small><b>{selectedSignal.impact}</b></span></div><div className="drawer-section"><p className="eyebrow">AFFECTED PATH</p><div className="path-chain">{selectedSignal.path.split("→").map((part,index)=><span key={part}>{part.trim()}{index<selectedSignal.path.split("→").length-1?<i>→</i>:null}</span>)}</div></div><div className="drawer-section"><p className="eyebrow">EVIDENCE</p>{selectedSignal.evidence.map((item,index)=><div className="evidence-row" key={item}><span>0{index+1}</span><b>{item}</b><Pill tone={index===0?"live":"neutral"}>{index===0?"Verified":"Corroborated"}</Pill></div>)}</div><div className="drawer-section"><p className="eyebrow">RECOMMENDED NEXT STEP</p><div className="recommendation"><span>01</span><div><b>Simulate alternate supply and inventory allocation</b><p>Compare margin protected, cash required, service impact, and qualification time.</p></div></div></div><div className="drawer-actions signal-actions"><button onClick={() => setOverlay("create-case")}>Create / link case</button><button onClick={() => { setSignalDrawer(false); go("twin"); }}>View private impact</button><button className="primary" onClick={() => { setSignalDrawer(false); setSelectedCase(cases[0]); go("optimize"); }}>Simulate response ↗</button></div></aside></div>}

      {connectOpen && <div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-label="Connect data source"><button className="close" onClick={() => setConnectOpen(false)}>×</button><p className="eyebrow">PRIVATE DATA ONBOARDING</p><h2>Connect a source without replacing it.</h2><div className="stepper"><span className={connectStep>=1?"active":""}>1 <b>Select</b></span><i/><span className={connectStep>=2?"active":""}>2 <b>Map</b></span><i/><span className={connectStep>=3?"active":""}>3 <b>Review</b></span></div>{connectStep===1&&<div className="source-picker">{["SAP S/4HANA","Microsoft Dynamics","Oracle NetSuite","PLM / CAD","MES / quality","Files + documents"].map((source)=><button className={selectedSource===source?"selected":""} key={source} onClick={()=>setSelectedSource(source)}><span>{source.split(" ").map(word=>word[0]).join("").slice(0,2)}</span><b>{source}</b><em>{selectedSource===source?"Selected":"Read-only"}</em></button>)}</div>}{connectStep===2&&<div className="mapping-preview"><div className="mapping-ring"><strong>88%</strong><span>mapped</span></div><div><h3>{selectedSource} sample recognized</h3><p>We propose mappings first. Your operator confirms every critical relationship.</p><dl><div><dt>Suppliers</dt><dd>1,284</dd></div><div><dt>Materials</dt><dd>4,682</dd></div><div><dt>Open orders</dt><dd>18,402</dd></div><div><dt>Unresolved IDs</dt><dd>214</dd></div></dl></div></div>}{connectStep===3&&<div className="review-boundary"><span className="lock-mark">PRIVATE</span><h3>Customer-controlled data boundary</h3><p>This concept connection is read-only. Raw records stay inside the private tenant and are not used for another customer’s signal or benchmark.</p><ul><li>Approved source: <b>{selectedSource}</b></li><li>Retention: <b>Customer policy</b></li><li>Shared model training: <b>Off</b></li><li>Write-back actions: <b>Off</b></li><li>Graph export: <b>Available</b></li></ul></div>}<div className="modal-actions"><button disabled={connectStep===1} onClick={()=>setConnectStep(Math.max(1,connectStep-1))}>Back</button>{connectStep<3?<button className="primary" onClick={()=>setConnectStep(connectStep+1)}>Continue →</button>:<button className="primary" onClick={()=>{setConnectOpen(false);setToast(`${selectedSource} added in concept mode.`)}}>Confirm connection ↗</button>}</div></section></div>}

      {searchOpen && <div className="overlay search-overlay"><button className="overlay-dismiss" aria-label="Close search" onClick={() => setSearchOpen(false)} /><section className="command-palette production-palette" role="dialog" aria-modal="true" aria-label="Global product search"><div className="palette-input"><span aria-hidden="true">⌕</span><input ref={searchInputRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search a signal, case, product, supplier, or module…" aria-label="Search the prototype"/><kbd>ESC</kbd></div><div className="palette-context"><span>GLOBAL SEARCH</span><b>{searchResults.length} results</b><em>Synthetic workspace</em></div><div className="search-results">{searchResults.map((item) => <button key={`${item.kind}-${item.id}`} onClick={() => { if (item.kind === "Signal") { const signal = signals.find((candidate) => candidate.id === item.id); if (signal) openSignal(signal); } else if (item.kind === "Decision case") { const decision = cases.find((candidate) => candidate.id === item.id); if (decision) openCase(decision); } else { go(item.destination); } }}><span className="search-kind">{item.kind}</span><span><b>{item.title}</b><small>{item.detail}</small></span><i>→</i></button>)}{searchResults.length === 0 && <div className="search-empty"><strong>No results found</strong><p>Try a material, supplier, case ID, or product module.</p><button onClick={() => setSearchQuery("")}>Clear search</button></div>}</div><footer><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>ESC</kbd> Close</span></footer></section></div>}

      {tourIndex >= 0 && <aside className="tour-card"><div className="tour-progress">{tourSteps.map((_,index)=><i className={index<=tourIndex?"active":""} key={index}/>)}</div><button className="tour-close" onClick={()=>setTourIndex(-1)}>×</button><small>GUIDED TOUR · {tourIndex+1}/{tourSteps.length}</small><h3>{tourSteps[tourIndex].title}</h3><p>{tourSteps[tourIndex].body}</p><button onClick={advanceTour}>{tourIndex===tourSteps.length-1?"Finish tour":"Next concept"} <span>→</span></button></aside>}

      {overlay === "case" && <div className="overlay"><button className="overlay-dismiss" aria-label="Close decision case" onClick={() => setOverlay(null)} /><aside className="drawer case-drawer" role="dialog" aria-modal="true" aria-labelledby="case-drawer-title"><button className="close" aria-label="Close decision case" onClick={() => setOverlay(null)}>×</button><div className="case-drawer-kicker"><span className="case-id">{selectedCase.id}</span><Pill tone={selectedCase.severity === "Critical" ? "critical" : selectedCase.severity === "Opportunity" ? "opportunity" : "watch"}>{selectedCase.severity}</Pill><span>Updated {selectedCase.updated}</span></div><h2 id="case-drawer-title">{selectedCase.title}</h2><p className="drawer-lede">{selectedCase.description}</p><div className="case-owner-bar"><span className="owner-avatar">{selectedCase.ownerInitials}</span><div><small>DECISION OWNER</small><b>{selectedCase.owner}</b></div><div><small>SLA</small><b>{selectedCase.sla}</b></div><div><small>VALUE</small><b>{selectedCase.value}</b></div></div><div className="drawer-section"><p className="eyebrow">GOVERNED WORKFLOW</p><div className="drawer-case-steps">{(["Triage","Validate","Simulate","Approve","Execute","Measure"] as DecisionCase["stage"][]).map((stage,index,array) => { const currentIndex=array.indexOf(selectedCase.stage); return <button key={stage} className={index<currentIndex?"complete":index===currentIndex?"current":""} onClick={() => updateCase({stage,status:stage==="Approve"?"In review":stage==="Execute"?"Executing":stage==="Measure"?"Measuring":"Open"},`${selectedCase.id} moved to ${stage}.`)}><i>{index<currentIndex?"✓":index+1}</i><b>{stage}</b></button>; })}</div></div><div className="drawer-section case-two-column"><div><p className="eyebrow">DECISION BASIS</p><dl className="case-facts"><div><dt>Trigger</dt><dd>{selectedCase.trigger}</dd></div><div><dt>Network scope</dt><dd>{selectedCase.site}</dd></div><div><dt>Due</dt><dd>{selectedCase.due}</dd></div><div><dt>Status</dt><dd>{selectedCase.status}</dd></div></dl></div><div><p className="eyebrow">CONTROL GATES</p><ul className="control-list"><li><i className="complete"/><span><b>Evidence trace</b><small>7 sources · analyst signed</small></span></li><li><i className="complete"/><span><b>Private impact</b><small>28 orders · 4 programs</small></span></li><li><i className="complete"/><span><b>Scenario version</b><small>{simulation.simulationId}</small></span></li><li><i className={selectedCase.stage === "Approve" ? "partial" : "complete"}/><span><b>Authority matrix</b><small>COO + Finance controller</small></span></li></ul></div></div><div className="drawer-section"><div className="drawer-section-head"><p className="eyebrow">APPROVAL MATRIX</p><button onClick={() => setToast("Comment composer opened.")}>+ Comment</button></div><div className="approval-list"><article><span className="owner-avatar">MR</span><div><b>Maya Rao · Sponsor</b><p>Recommended balanced recovery. Margin and service outcomes are inside the approved envelope.</p></div><Pill tone="live">Signed</Pill></article><article><span className="owner-avatar">FC</span><div><b>Finance control</b><p>Incremental spend reconciled to response budget and working-capital limits.</p></div><Pill tone="live">Verified</Pill></article><article><span className="owner-avatar">CO</span><div><b>COO approval</b><p>Final release is required before execution tasks are issued.</p></div><Pill tone={selectedCase.status === "Approved" || selectedCase.status === "Executing" || selectedCase.status === "Measuring" ? "live" : "watch"}>{selectedCase.status === "Approved" || selectedCase.status === "Executing" || selectedCase.status === "Measuring" ? "Approved" : "Pending"}</Pill></article></div></div><div className="drawer-section"><p className="eyebrow">EXECUTION + MEASUREMENT</p><div className="execution-list">{[["Reserve alternate capacity","Category management","Week 1"],["Release inventory transfer","Network planning","Week 1"],["Confirm protected orders","Customer operations","Week 2"],["Reconcile actual margin","Finance control","Month end"]].map((item,index)=><div key={item[0]}><input aria-label={`Mark ${item[0]} complete`} type="checkbox" defaultChecked={selectedCase.stage === "Measure" || index < 2 && selectedCase.stage === "Execute"}/><span><b>{item[0]}</b><small>{item[1]} · {item[2]}</small></span></div>)}</div></div><div className="drawer-actions case-actions"><button onClick={() => { setOverlay(null); go("optimize"); }}>Open scenario</button>{selectedCase.stage === "Approve" && <button onClick={() => updateCase({status:"Open",stage:"Simulate"},"Changes requested; case returned to Scenario Studio.")}>Request changes</button>}<button className="primary" onClick={() => { if(selectedCase.stage === "Approve") updateCase({status:"Approved",stage:"Execute"},"Decision approved; execution package released."); else if(selectedCase.stage === "Execute") updateCase({status:"Measuring",stage:"Measure"},"Execution complete; value measurement started."); else { setOverlay(null); go("twin"); } }}>{selectedCase.stage === "Approve" ? "Approve & release" : selectedCase.stage === "Execute" ? "Start measurement" : "Continue workflow"} ↗</button></div></aside></div>}

      {overlay === "create-case" && <div className="overlay modal-overlay"><button className="overlay-dismiss" aria-label="Close create case" onClick={() => setOverlay(null)} /><form className="modal create-case-modal" role="dialog" aria-modal="true" aria-labelledby="create-case-title" onSubmit={(event) => { event.preventDefault(); createCaseFromSignal(); }}><button className="close" type="button" aria-label="Close create case" onClick={() => setOverlay(null)}>×</button><p className="eyebrow">NEW GOVERNED DECISION</p><h2 id="create-case-title">Create a case from a verified trigger.</h2><div className="form-grid"><label>Case title<input defaultValue={`Assess ${selectedSignal.industry.toLowerCase()} exposure`} /></label><label>Trigger<input defaultValue={selectedSignal.title} /></label><label>Owner<select defaultValue={roleProfile.name}><option>{roleProfile.name}</option><option>Jon Bell</option><option>Anika Shah</option><option>Elena Ward</option></select></label><label>Severity<select defaultValue={selectedSignal.level === "Critical" ? "Critical" : "High"}><option>Critical</option><option>High</option><option>Medium</option><option>Opportunity</option></select></label><label>Decision SLA<select defaultValue="24 hours"><option>2 hours</option><option>8 hours</option><option>24 hours</option><option>5 days</option></select></label><label>Value exposure<input defaultValue={selectedSignal.impact} /></label><label className="form-span">Decision question<textarea defaultValue="What response protects margin and customer service within the approved cash and risk envelope?" /></label></div><div className="case-create-boundary"><span className="lock-mark">PRIVATE</span><p>The case stores approved evidence references and customer-context links. Raw source records stay in the private tenant.</p></div><div className="modal-actions"><button type="button" onClick={() => setOverlay(null)}>Cancel</button><button className="primary" type="submit">Create governed case →</button></div></form></div>}

      {overlay === "activity" && <div className="overlay"><button className="overlay-dismiss" aria-label="Close audit activity" onClick={() => setOverlay(null)} /><aside className="drawer activity-drawer" role="dialog" aria-modal="true" aria-labelledby="activity-title"><button className="close" aria-label="Close audit activity" onClick={() => setOverlay(null)}>×</button><p className="eyebrow">AUDIT + VALUE LEDGER</p><h2 id="activity-title">Every decision stays explainable.</h2><p className="drawer-lede">A synthetic, immutable-style history of evidence, model versions, human decisions, execution, and verified outcomes.</p><div className="audit-controls"><button className="selected">All activity</button><button>Evidence</button><button>Decisions</button><button>Execution</button><button>Value</button></div><ol className="audit-timeline">{[["10:31","Maya Rao","Opened approval review","CASE-1042 · Balanced recovery v6"],["10:22","Scenario Studio","Completed deterministic run",simulation.simulationId],["10:18","Decision Twin","Refreshed private exposure","28 orders · 4 programs · $4.2M"],["10:08","Analyst operations","Signed evidence package","SYN-PROV-001 · 7 sources"],["09:47","Global signal exchange","Published logistics update","Singapore dwell +31%"],["08:42","Model governance","Promoted signal ranker","v4.8.2 · precision 91.4%"],["26 Aug","Finance control","Verified realized value","CASE-1028 · $820K margin"]].map((event,index)=><li key={`${event[0]}-${event[2]}`}><span>{event[0]}</span><i className={index<2?"current":index<6?"complete":"value"}/><div><b>{event[2]}</b><p>{event[1]}</p><small>{event[3]}</small></div></li>)}</ol><div className="audit-proof"><span className="lock-mark">AUDIT READY</span><div><b>Export includes source IDs, calculation version, approvals, and execution evidence.</b><p>No raw confidential data is included unless the authorized user explicitly selects it.</p></div></div><div className="drawer-actions"><button onClick={() => setToast("Audit export prepared in concept mode.")}>Export audit pack</button><button className="primary" onClick={() => { setOverlay(null); go("trust"); }}>Open trust controls →</button></div></aside></div>}

      {toast && <div className="toast" role="status" aria-live="polite"><i />{toast}</div>}
    </main>
  );
}
