/** Builds standalone, offline HTML + Markdown from inspected source and real local calculations. */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadLinkedWorkspaceModel, linkedCaseStudyUrl, readSource, transpileSource, asModuleUrl } from "../tests/source-model-loader.mjs";
import { osCaseEvidence } from "../app/os-case-evidence.ts";
import { runSimulation, compactRun, simulationInputForCase, SIMULATION_VERSION } from "../app/simulation-model.ts";
import { describeColumn } from "../app/statistical-analysis.ts";

const root = new URL("../", import.meta.url);
const workspace = await loadLinkedWorkspaceModel();
const caseUrl = await linkedCaseStudyUrl();
const cases = await import(caseUrl);
const taxonomy = await import(asModuleUrl(transpileSource(await readSource("../app/taxonomy-catalog.generated.ts"))));
const methods = await import(asModuleUrl(transpileSource(await readSource("../app/or-methodology.ts"))));
const stats = await import(asModuleUrl(transpileSource((await readSource("../app/statistical-model.ts")).replace('"./case-study-model"', JSON.stringify(caseUrl)))));
const project = workspace.workspaceProjects.find(p => p.id === "apple-launch-continuity");
const evidence = osCaseEvidence.find(p => p.projectId === project.id);
const profile = cases.caseStudyProfileFor(project);
const input = simulationInputForCase(evidence);
const calculatedAt = "2026-09-10T12:00:00.000Z";
const experiments = [
  { key: "no-response", label: "A · No intervention", change: "Alternate used = 0%; expedite off", patch: { alternateAllocationPct: 0 } },
  { key: "default", label: "B · Current default response", change: "100% alternate from week 2; expedite off", patch: {} },
  { key: "expedite", label: "C · Capped expediting", change: "B + expedite on; 1,800 devices/week ceiling", patch: { expedite: true } },
  { key: "qualification", label: "D · Qualification delay", change: "B, but alternate released in week 4", patch: { qualificationWeek: 4 } },
  { key: "buffer", label: "E · Conditional buffer sensitivity", change: "B, but opening available inventory = 30,000; unverified +25,200 devices", patch: { inventoryUnits: 30000 } },
  { key: "budget", label: "F · No spending authority", change: "B, but intervention budget = $0", patch: { budget: 0 } },
].map(e => ({ ...e, run: runSimulation({ ...input, ...e.patch }, calculatedAt) }));
const tables = stats.statisticalProfilesFor(project);
const rows = stats.statisticalRowsFor(tables[0], 96);
const column = tables[0].columns[0];
const summary = describeColumn(rows, column.id);
const threshold = Math.ceil(summary.mean);
const filtered = rows.filter(row => row[column.id] >= threshold);
const filteredSummary = describeColumn(filtered, column.id);
const sourceFiles = ["app/PlatformShell.tsx", "app/ProjectWorkspace.tsx", "app/workspace-model.ts", "app/case-study-model.ts", "app/os-case-evidence.ts", "app/ProjectSupplyChainExplorer.tsx", "app/GlobalKnowledgeGraph.tsx", "app/statistical-model.ts", "app/statistical-analysis.ts", "app/StatisticalStudio.tsx", "app/table/TableExplorerClient.tsx", "app/simulation-model.ts", "app/SimulationStudio.tsx", "app/decision-evidence-model.ts", "app/DecisionToolEvidence.tsx", "app/OptimizationWorkbench.tsx", "app/ProjectAppStudios.tsx", "app/project-activity-model.ts", "worker/index.ts"];
const hashes = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [file, createHash("sha256").update(await readFile(new URL(file, root))).digest("hex")])));
const gitBase = execFileSync("git", ["rev-parse", "HEAD"], { cwd: fileURLToPath(root), encoding: "utf8" }).trim();
const pack = {
  schema: "tanjnx.apple-guide@1", auditDate: "2026-09-10", gitBase, sourceSha256: hashes,
  boundary: "Educational Apple scenario; no customer relationship, observed private data, production approval, or realized savings. Runs are local calculations, not portfolio fixture KPIs.",
  methodVersion: SIMULATION_VERSION, projectId: project.id, defaultInput: input,
  declaredCounts: project.counts, instantiatedNetwork: { nodes: profile.supplyChain.nodes.length, edges: profile.supplyChain.edges.length, checkpoints: profile.supplyChain.checkpoints.length },
  datasets: workspace.datasetsFor(project), publicSources: evidence.sources,
  statistics: { tableId: tables[0].id, columnId: column.id, unit: column.unit, rows, summary, filter: { minimum: threshold }, filteredSummary },
  experiments: experiments.map(({ key, label, change, run }) => ({ key, label, change, run: compactRun(run) })),
};
const n = (value, places = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: places }).format(value);
const usd = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
const table = (head, rows) => `| ${head.join(" | ")} |\n| ${head.map(() => "---").join(" | ")} |\n${rows.map(row => `| ${row.map(v => String(v).replaceAll("|", "/").replaceAll("\n", " ")).join(" | ")} |`).join("\n")}`;
const selectedMethods = methods.orMethods.filter(m => new Set([...project.methodCodes, ...workspace.projectApps.filter(a => ["simulation", "statistics"].includes(a.id)).flatMap(a => a.methodCodes)]).has(m.code));
const bindings = new Set([...Object.values(project.variablePack).flat(), ...profile.datasets.flatMap(d => d.variables)]);
const baseline = experiments.find(e => e.key === "default").run;
const cap = experiments.find(e => e.key === "expedite").run;
const buffer = experiments.find(e => e.key === "buffer").run;
const replacements = {
  AUDIT_DATE: "10 September 2026", GIT_BASE: gitBase, MODEL_VERSION: SIMULATION_VERSION,
  DEFAULT_ID: baseline.id, CAP_ID: cap.id, BUFFER_ID: buffer.id,
  DEFAULT_P05: n(baseline.response.service.p05), DEFAULT_BASE_P05: n(baseline.baseline.service.p05), DEFAULT_NET: usd(baseline.protectedLoss), DEFAULT_COST: usd(baseline.response.meanCost), DEFAULT_CVAR: usd(baseline.response.cvar95), DEFAULT_MEAN: n(baseline.response.service.mean), DEFAULT_PROB: n(baseline.response.targetProbability),
  CAP_P05: n(cap.response.service.p05), CAP_COST: usd(Math.max(...cap.response.paths.map(p => p.interventionCost))),
  BUFFER_P05: n(buffer.response.service.p05), BUFFER_NET: usd(buffer.protectedLoss), BUFFER_BASE_P05: n(buffer.baseline.service.p05),
  GRAPH_NODES: profile.supplyChain.nodes.length, GRAPH_EDGES: profile.supplyChain.edges.length, GRAPH_CHECKPOINTS: profile.supplyChain.checkpoints.length,
  STAGES: table(["Stage", "What it represents in the Apple case"], profile.supplyChain.stages.map(s => [`${s.sequence}. ${s.label}`, s.description])),
  DATASETS: table(["ID / dataset", "Intended grain", "Declared fixture size / age", "Canonical bindings"], workspace.datasetsFor(project).map(d => [`${d.id} · ${d.name}`, d.grain, `${d.rows} / ${d.freshness} (modeled)`, d.variables.join(", ")])),
  VARIABLES: table(["Code", "Canonical meaning", "Interpretation / examples (not populated production units)"], taxonomy.taxonomyCatalog.filter(t => bindings.has(t.id)).map(t => [t.id, t.name, `${t.meaning} Examples: ${t.examples}.`])),
  METHODS: table(["Code / method", "Purpose", "Evidence that production use requires"], selectedMethods.map(m => [`${m.code} · ${m.name}`, m.purpose, `${m.validation.join("; ")}. Limit: ${m.limitations}`])),
  AGENTS: table(["Agent", "Declared role", "Authority boundary"], workspace.agentsFor(project).map(a => [a.name, a.role, a.authority])),
  DECISIONS: table(["ID / parent", "Role", "Current seeded state", "Interpretation"], workspace.decisionsFor(project).map(d => [`${d.id} / ${d.parent ?? "root"}`, d.level, d.state, `${d.title} (seeded narrative, not calculated approval)`])),
  INPUTS: table(["Input", "Value", "Meaning"], [
    ["Project / scope", project.id, evidence.scenario.scope], ["Demand", `${n(input.demandPerWeek)} devices/week`, "Before +12% surge and triangular variation"], ["Primary capacity", `${n(input.capacityPerWeek)} devices/week`, "Before cut, state factor and yield"], ["Alternate capacity", `${n(input.qualifiedAlternatePerWeek)} devices/week`, "Available only after qualification; separate yield adjustment"], ["Opening available inventory", `${n(input.inventoryUnits)} devices`, "Already eligible finished-equivalent stock; not magnet component sets"], ["Opening pipeline", `${n(input.openingPipelineUnits)} devices`, "Modeled existing dispatches, evenly received over two weeks"], ["Additional capacity cut", `${input.capacityLossPct}%`, "Compounds with operating-state capacity loss"], ["Demand surge / variation", `${input.demandSurgePct}% / ±${input.demandVariationPct}%`, "Elicited stress, not fitted history"], ["Yield", `${input.qualityYieldPct}%`, "Fixed per-unit yield on primary and alternate"], ["Alternate available", `Week ${input.qualificationWeek}`, "Default allocation = 100%; no pre-release supply"], ["Base lead", `${input.baseLeadDays} days`, "Opening-pipeline schedule; future supply uses state-specific total lead"], ["Expedite ceiling", `${n(input.expediteCapacityPerWeek)} devices/week`, "Optional one-week shortening, primary first; off by default"], ["Expedite unit premium", usd(input.expeditePremiumPerUnit), "Charged to expedited units; alternate has an additional 60% sourcing premium"], ["Unit margin", usd(input.unitMargin), "Proxy lost contribution; not selling price or audited profit"], ["Service floor / budget", `${input.serviceTargetPct}% / ${usd(input.budget)}`, "P05 service; maximum sampled intervention cost"], ["Experiment", `${input.horizonWeeks} weeks / ${input.paths} paths / seed ${input.seed}`, "Paired random paths; same disturbances for both policies"],
  ]),
  DOMAIN_INPUTS: table(["Contextual input", "Assumed value", "What it does / does not mean"], evidence.scenario.operationalInputs.map(v => [v.label, `${n(v.value)} ${v.unit}`, v.meaning])),
  REGIMES: table(["Current state", "Total lead days", "Capacity factor", "Next Normal", "Next Constrained", "Next Disrupted"], input.regimes.map(r => [r.name, r.leadDays, r.capacityFactor, ...r.transition])),
  RUNS: table(["Experiment", "Response P05", "Mean service", "Mean net loss avoided", "CVaR95 loss", "Peak intervention cost", "Service / budget"], experiments.map(e => [e.label, `${n(e.run.response.service.p05)}%`, `${n(e.run.response.service.mean)}%`, usd(e.run.protectedLoss), usd(e.run.response.cvar95), usd(Math.max(...e.run.response.paths.map(p => p.interventionCost))), `${e.run.targetPassed ? "PASS" : "FAIL"} / ${e.run.budgetPassed ? "PASS" : "FAIL"}`])),
  RUN_IDS: table(["Experiment / receipt", "Change from current UI defaults"], experiments.map(e => [`${e.label} / ${e.run.id}`, e.change])),
  FIRST_PATH: table(["Week", "State", "Demand", "Dispatch", "Arrivals", "Served", "Stock", "In transit", "Lost"], baseline.response.paths[0].weeks.map(w => [w.week, w.state, ...[w.demand, w.dispatched, w.arrived, w.served, w.inventory, w.inTransit, w.lostDemand].map(v => n(v))])),
  STATS: table(["Measure", "Full 96-row sample", `Filtered: ${column.id} ≥ ${threshold}`], [["Numeric values", summary.n, filteredSummary.n], ["Mean", n(summary.mean), n(filteredSummary.mean)], ["Sample SD", n(summary.sd), n(filteredSummary.sd)], ["P05", n(summary.p05), n(filteredSummary.p05)], ["Median", n(summary.p50), n(filteredSummary.p50)], ["P95", n(summary.p95), n(filteredSummary.p95)], ["Missing/nonnumeric", summary.missing, filteredSummary.missing]]),
  FILTER_MIN: threshold, FIRST_TABLE: tables[0].id,
  SAMPLE_HEAD: table(["Record", "Event time", `${column.id} · fixture index`], rows.slice(0, 6).map(row => [row.record_id, row.event_time, row[column.id]])),
  SOURCE_FILES: table(["Source file", "Audit responsibility"], sourceFiles.map(file => [file, ({"app/simulation-model.ts":"Executable Monte Carlo, flow balance, caps, versioning and restoration", "app/ProjectWorkspace.tsx":"Data, Playground, policy drafts and project decision lineage", "app/decision-evidence-model.ts":"Local evidence attachment, stale checks, review conditions and expiry", "app/statistical-model.ts":"Generated sample identities and nonphysical fixture indices", "worker/index.ts":"Web-serving adapter, not an agent/backend runtime"})[file] ?? "Inspected for current behavior; SHA-256 is retained in the companion evidence pack"])),
};
let markdown = await readFile(new URL("apple-guide.template.md", import.meta.url), "utf8");
for (const [key, value] of Object.entries(replacements)) markdown = markdown.replaceAll(`{{${key}}}`, String(value));
if (/\{\{[A-Z_]+\}\}/.test(markdown)) throw new Error("Unresolved report placeholder");

const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const inline = value => escape(value).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\((https:\/\/[^ )]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const toc = [];
const lines = markdown.split(/\r?\n/); const body = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.startsWith("```")) { const code = []; while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]); body.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`); continue; }
  const heading = /^(#{1,4}) (.*)$/.exec(line);
  if (heading) { const level = heading[1].length, id = slug(heading[2]); if (level === 2) toc.push({ id, title: heading[2] }); body.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`); continue; }
  if (line.startsWith("|")) { const rows = []; while (i < lines.length && lines[i].startsWith("|")) { const cells = lines[i].split("|").slice(1,-1).map(v => v.trim()); if (!cells.every(c => /^[-: ]+$/.test(c))) rows.push(cells); i++; } i--; body.push(`<div class="table-wrap" tabindex="0" role="region" aria-label="${escape(rows[0].join(', '))}"><table><thead><tr>${rows[0].map(c => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); continue; }
  if (/^[-*] /.test(line) || /^\d+\. /.test(line)) { const ordered = /^\d+\. /.test(line), tag = ordered ? "ol" : "ul", items = []; const re = ordered ? /^\d+\. / : /^[-*] /; while (i < lines.length && re.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(re, ""))}</li>`); i++; } i--; body.push(`<${tag}>${items.join("")}</${tag}>`); continue; }
  if (line.startsWith("> ")) { body.push(`<aside class="callout">${inline(line.slice(2))}</aside>`); continue; }
  const para = [line]; while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|\||>|```|[-*] |\d+\. )/.test(lines[i + 1])) para.push(lines[++i]); body.push(`<p>${inline(para.join(" "))}</p>`);
}
const theme = await readFile(new URL("apple-guide.style.css", import.meta.url), "utf8");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Apple Launch Continuity: an evidence-backed tanjnx operator guide and CEO/CTO readiness review. Educational simulation, not an Apple engagement."><title>Apple Launch Continuity | tanjnx field guide</title><style>${theme}</style></head><body><a class="skip" href="#guide">Skip to guide</a><header class="toolbar"><a class="brand" href="#guide">tanjnx <span>Apple field guide</span></a><nav aria-label="Document actions"><button id="theme" type="button" aria-label="Switch color theme">Dark mode</button><button id="export" type="button">Export evidence pack</button><button id="print" type="button">Print / PDF</button></nav></header><div class="layout"><aside class="contents"><p class="eyebrow">CEO / CTO / OPERATOR</p><b>Read the case. Challenge the system.</b><nav aria-label="Guide contents">${toc.map(t => `<a href="#${t.id}">${escape(t.title)}</a>`).join("")}</nav><small>Standalone document · no login or application connection · 10 Sep 2026</small></aside><main id="guide">${body.join("\n")}</main></div><script type="application/json" id="evidence-pack">${JSON.stringify(pack).replaceAll("<", "\\u003c")}</script><script>document.getElementById('print').addEventListener('click',()=>window.print());document.getElementById('theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';document.getElementById('theme').textContent=dark?'Light mode':'Dark mode';});document.getElementById('export').addEventListener('click',()=>{const blob=new Blob([document.getElementById('evidence-pack').textContent],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='apple-project-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});</script></body></html>`;
await writeFile(new URL("docs/APPLE_PROJECT_GUIDE.md", root), markdown);
await writeFile(new URL("docs/apple-project-guide.html", root), html);
await writeFile(new URL("docs/apple-project-evidence.json", root), JSON.stringify(pack, null, 2));
console.log(`Generated standalone Apple HTML, Markdown and evidence pack: ${toc.length} sections, ${experiments.length} executable comparisons, ${profile.supplyChain.nodes.length} graph nodes. No application route was added.`);
