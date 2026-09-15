/** Generate the presenter guide from the same prompts and calculations as the demo. */
import { mkdir, writeFile } from "node:fs/promises";
import { asModuleUrl, readSource, transpileSource, loadLinkedWorkspaceModel } from "../tests/source-model-loader.mjs";

const demo = await import(asModuleUrl(transpileSource(await readSource("../app/samsung-demo-model.ts"))));
const workspace = await loadLinkedWorkspaceModel();
const { samsungBrief: brief, samsungPrompts: prompts, samsungPlans: plans, calculateSamsungPlan: calculate, samsungSources: sources } = demo;
const n = value => value.toLocaleString("en-US");
const money = value => `$${n(value)}`;
const rules = { budget: 900000, serviceFloor: 95 };
const revised = calculate(plans[3], true, rules);
const sections = [];
const add = (title, paragraphs = [], table, code) => sections.push({ title, paragraphs, table, code });

add("What this demonstration does", [
  "You create Samsung as a new client, create an empty project, connect four simulated customer databases, activate a customer-side demo worker, and ask the agents to resolve a launch crisis. Specialist apps appear only when an agent task uses them. Nothing is preloaded into the new project's app bar except Playground.",
  brief.boundary,
  "Allow 15–20 minutes for the presentation. Keep the guide open in another tab. The portal and Samsung run are in memory: navigating within the app preserves them, but refreshing, closing the tab or opening the project URL in another tab loses the new client, project and run. Export the demo record before closing. The export is a review artifact, not an importable session backup.",
  "This is a guided chat demonstration, with deterministic agent tasks and calculations. It has no LLM, live SQL connection, deployed worker, enterprise solver or operational write-back. Supported prompts and explanation questions behave consistently; unrelated requests get an explicit response rather than invented results.",
]);
add("Start the application", [
  "Use the published workspace, or run these PowerShell commands locally and open http://localhost:3000. The app lives in real_maya\\maya. The real\\_maya folder from the earlier npm error is not the package root.",
  "If dependencies have not yet been installed in this checkout, run npm install from this same folder before npm run dev. You need a supported Node version as declared in package.json. No Samsung credentials or API keys are needed.",
], undefined, 'cd "C:\\Users\\aroy06\\OneDrive - Kearney\\Desktop\\SupplyChainProposal\\real_maya\\maya"\nnpm run dev');
add("The fictional business situation", [
  `${brief.problem} The fixed snapshot is ${brief.snapshot}; the delivery deadline is ${brief.deadline}. These dates are scenario dates, not a live clock.`,
  brief.outcome,
  "Memory supply is initially limited to 98,000 units. Released batteries total 100,000, while 18,000 additional batteries are quarantined and never usable. Base assembly capacity is 126,000. Standard transport can deliver only 106,000 before the deadline. India demand has risen from 60,000 to 72,000, making total demand 132,000.",
  "Presenter framing: 'Can the system move from a business question to an evidence-backed response, recognize when that response becomes invalid, and get human review before acting?'",
]);
add("1. Add the Samsung client manually", [
  "Open Clients & projects using the workspace navigation, click Onboard client, and complete each wizard step with Continue. Enter the following values, then click Save client draft on Review. Do not select a pre-existing Apple or other seeded project.",
  "The Samsung demo is selected for browser-created projects whose client name contains the word Samsung. Use Samsung Electronics exactly for this walkthrough. Saving the client creates the catalog entry only; it does not create the project or any source connection.",
], { head: ["Wizard step / field", "Value"], rows: [
  ["Identity / Client name", brief.client], ["Identity / Sector", brief.tower], ["Identity / Optional sector key", "semiconductors"],
  ["Boundary / Classification", "Client confidential — demo data"], ["Boundary / Data-residency intent", "Korea / India / EU — simulated policy partitions"],
  ["Collaboration / Client lead", brief.owner], ["Collaboration / tanjnx lead", "Asha Rao"],
] });
add("2. Create an empty project", [
  "Click Create project from Clients & projects. In Parent, select Samsung Electronics and the Semiconductors tower. Complete Decision brief and Governance using the values below. Leave optional classification and residency overrides blank to inherit the client labels. Click Save project draft on Review.",
  "Open Apps immediately after creation. The Apps list and app bar show Playground only: no Risk Radar, Network Optimizer or other specialist app. Data, Decisions and Overview are workspace sections, not pre-used specialist apps. Counts start at zero.",
], { head: ["Field", "Value"], rows: [["Client", brief.client], ["Tower", brief.tower], ["Project name", brief.project], ["Problem statement", brief.problem], ["Outcome statement", brief.outcome], ["Project owner", brief.owner], ["Currency", "USD"], ["Region intent", brief.regions]] });
add("3. Connect the customer data and activate agents", [
  "Open Data or click Connect demo data. Keep the supplied samsung-demo-worker.invalid worker name. Click Select four demo sources, tick Allow only read-only demo queries, then click Validate connections (demo). Four fixture checks complete over approximately four seconds.",
  "Inspect each sample and its variable reference. Observe the battery quarantine exception. Tick I reviewed units, fields, source scope and the quarantine exclusion, then click Activate demo agents. Activation is blocked until validation and mapping acknowledgement are complete.",
  `${demo.samsungAgents.length} named demo agent identities are now available, but no specialist app has been used. Open Apps to verify that Playground is still the only entry, then Open Playground.`,
  "In a production system, this step would test network access and approved read-only service identities on a worker deployed inside the customer's environment. Here the checks validate local fixture contracts. The .invalid worker name is never contacted, and no credentials are collected.",
], { head: ["Source", "Database / tables", "Demo rows", "Evidence purpose"], rows: sources.map(s => [s.name, `${s.database} / ${s.tables}`, s.sample.length, s.issue]) });
for (const [index, step] of prompts.entries()) {
  const extras = {
    scope: ["Click Use this prompt, or copy the text below into Message the project agents and press Enter. Shift+Enter inserts a line break. Wait for the run to finish before continuing. The source-audit tasks do not open specialist apps."],
    diagnose: ["Watch Agent activity on the right. Each completed specialist task adds its app to the app bar. Click any source evidence link to inspect the local rows, then close the evidence panel. Click a newly used app to inspect its Samsung-specific work and use Back to Playground to return. The transcript and stage are retained."],
    compare: ["Inspect Network Optimizer for the candidate comparison, Manufacturing Twin for capacities, and Flow Lens for the seven cost lines. The chosen response is the feasible declared candidate, not a claim of a globally optimal solution. No action has been approved or released."],
    shock: ["This prompt represents a new customer event arriving during planning. Both the customs-sensitive memory buffer and the expedited shipping lane lose 8,000 units before cutoff. The old recommendation is recalculated and cannot be presented as still meeting the service goal."],
    replan: ["Open Simulation from the app bar. Read all five cases: four agreed single-factor checks pass, while the combined case fails. This is an explicit residual-risk disclosure. A human must accept the scoped envelope and escalation condition; the model does not claim to eliminate every risk."],
    review: ["After this prompt finishes, click Complete human review or open Decisions. Review candidate costs and allocations, all stress cases and the three role responsibilities. Click Simulate Quality owner sign-off, Simulate Finance controller sign-off, then Simulate Supply chain owner sign-off. Each button records a separate local attestation. In this demo the presenter plays all three roles; no enterprise approval permission is granted or bypassed.", "Optional demonstration: send the final release prompt before completing all three sign-offs. Release is blocked and the stage remains on step 7. Finish the remaining sign-offs and resend the same prompt."],
    monitor: ["The release prompt opens the simulated execution ledger only after all three sign-offs. Click Advance one demo day ten times to reach Day 10. Nothing advances automatically in this monitoring ledger. Inspect owner actions and the delivered-unit total at each step. Export demo record when finished."],
  }[step.intent];
  add(`${index + 4}. ${step.title.replace(/^\d+\. /, "")}`, [...extras, `Expected result: ${step.expected}`, `Apps used in this step: ${step.apps.length ? step.apps.map(id => workspace.projectApps.find(a => a.id === id).name).join(", ") : "none"}. Existing used apps remain visible.`], undefined, step.prompt);
}
add("What the final recommendation contains", [
  "Reserve 24,000 qualified alternative memory modules and the original 10,000-unit buffer; accept that 8,000 buffer units miss cutoff. Add 8,000 qualified regional modules. Reserve 30,000 qualified batteries while leaving the 18,000-unit hold untouched. Keep 22,000 booked expedited slots, accept 8,000 lost slots, and add 8,000 backup-route slots. Reduce overtime capacity to 4,000.",
  "The paid buffer and booked expedited premiums remain charged after the shock; this model assumes no refund for late/cancelled capacity. Backup and regional supply are incremental costs. The model assumes one memory module and one released battery per finished device, all declared capacities usable within the horizon, no additional yield loss, and additive shipping capacity. It is a small launch-window capacity model, not a detailed scheduling or multi-echelon optimizer.",
  "Delivered units = min(demand, memory, released batteries, assembly, transport). Service = delivered / all requested units. Costs = sum(intervention units × incremental rate). Market allocation is proportional to demand, with integer rounding reconciled to total shipments. It is a declared allocation policy, not a customer-priority optimizer.",
  `Revised capacities: ${Object.entries(revised.capacity).map(([key, value]) => `${key} ${n(value)}`).join("; ")}. Transport binds at ${n(revised.shipped)}. Service is ${revised.service.toFixed(2)}%, with ${n(revised.shortfall)} orders explicitly unserved. Cost is ${money(revised.cost)}, leaving ${money(rules.budget - revised.cost)} budget headroom.`,
  `Illustrative net contribution protected is ${money(revised.netContributionProtected)} = (${n(revised.shipped)} − 98,000) × $210 assumed contribution per unit − ${money(revised.cost)}. This is scenario arithmetic, not observed Samsung profit or realized savings.`,
], { head: ["Cost item", "Units", "USD / unit", "Incremental USD"], rows: revised.costs.map(c => [c.label, n(c.units), c.rate, money(c.total)]) });
add("Calculated comparison and market allocation", [], { head: ["Scenario", "Deliveries", "Service", "Cost", "Budget + service"], rows: [[plans[0], false], [plans[1], false], [plans[2], false], [plans[2], true], [plans[3], true]].map(([p, shock]) => { const r = calculate(p, shock); return [`${p.label}${shock ? " after shock" : ""}`, n(r.shipped), `${r.service.toFixed(2)}%`, money(r.cost), r.feasible ? "Pass" : "Fail"]; }) });
add("Final allocation", [], { head: ["Market", "Requested", "Delivered by cutoff", "Unserved"], rows: revised.allocations.map(a => [a.market, n(a.requested), n(a.delivered), n(a.requested - a.delivered)]) });
add("Stress results and escalation", [
  "The release gate requires all four agreed single-factor cases to pass. The combined case is outside that approved envelope and remains visible even though it fails. If demand rises 2% at the same time as another 2,000 transport slots disappear, escalate to the program owner for a new plan rather than continue under the old approval. These are enumerated deterministic scenarios, not probabilities or Monte Carlo confidence intervals.",
], { head: ["Case", "Delivered", "Service", "Result", "Scope"], rows: demo.samsungStress(rules).map(s => [s.label, n(s.shipped), `${s.service.toFixed(2)}%`, s.feasible ? "Pass" : "Fail", s.envelope ? "Agreed single-factor gate" : "Outside envelope; escalate"]) });
add("Ten-day execution replay", ["Owner actions are fictional instructions shown for review. No purchase order, supplier email, carrier booking, factory change or database write is sent. Day 0 is the approved release; each click advances the fixed replay by one day."], { head: ["Demo day", "Cumulative delivered units"], rows: Array.from({ length: 11 }, (_, day) => [day, n(demo.samsungDelivery(day))]) });
add("Action owners", [], { head: ["Window", "Owner", "Action"], rows: demo.samsungOwners.map(o => [o.day, o.owner, o.action]) });
add("Optional challenge: change the budget", [
  "Do this after the revised plan and review brief have been prepared. In Decisions set Incremental budget to 850000, leave Minimum service at 95, and click Apply constraints and invalidate review. Existing sign-offs and any simulated release state are cleared.",
  "Return to Playground and repeat the Prepare human review prompt. The $898,000 candidate now fails the budget gate, and approval buttons remain unavailable. The model does not fabricate a cheaper response.",
  "Restore the budget to 900000 in Decisions, apply it, and prepare the review brief again. Record all three sign-offs and use the release prompt. This demonstrates that changed constraints require a fresh review. You can also raise service to 98 to demonstrate an infeasible service gate.",
]);
add("Recovery, presenter tips and questions", [
  "Ask 'Why is transport the binding constraint, and what are the assumptions?' to obtain the supported model explanation. Explanation questions do not run more apps or advance the workflow. Supported intent paraphrases work, but the exact supplied prompts are the dependable presentation path.",
  "If an out-of-order prompt is sent, the assistant names the missing step. Use the next suggested prompt. Repeating an already completed step keeps its recorded evidence and does not duplicate apps or runs. If a task is paused, click Resume agent run. Timed tasks pause when leaving the Samsung workspace and resume when returning; navigating between its tabs retains the run.",
  "If activation is blocked, select all four sources, tick read-only access, validate, and confirm the mappings. If release is blocked, prepare the current brief, check budget/service/stress gates and record all three sign-offs. A chat message saying 'approved' does not grant approval.",
  "To repeat from the start without refreshing, create a second project under Samsung Electronics with a different project name. Each project has its own empty app list, source configuration and transcript. To completely clear drafts, refresh and manually add the client/project again. Export before doing this.",
  "Do not refresh or use the address bar to switch project screens during the presentation; use the in-app navigation. A guide tab can be refreshed independently. Export demo record downloads JSON containing the brief, inputs, source fixtures, used apps, agent trace, conversation, computed candidate, stress cases, sign-offs and execution position.",
]);
add("How these screens map to a production platform", [], { head: ["Demo behavior", "Production implementation represented"], rows: [
  ["New client and project drafts", "Durable tenant/project records, real identities and enforced project access"],
  ["Read-only source checks and .invalid worker", "Customer-hosted worker, network/credential validation, approved SQL scopes and secret management"],
  ["Mapping acknowledgement and local evidence", "Schema/unit validation, versioned datasets, lineage, freshness and data-quality rules"],
  ["Deterministic chat intents and timed agent tasks", "LLM planning, tool calls, retries, cancellation, observable execution and model evaluations"],
  ["Apps added at completed first use", "Project-level application usage records created by actual tool execution"],
  ["Four candidate plans and stress arithmetic", "Domain-specific optimization/simulation services with validated operational constraints"],
  ["Three role-play attestations", "Authenticated reviewers, separation of duties, version-bound approvals and auditable policy enforcement"],
  ["Manual execution clock", "Approved command dispatch, idempotent integrations, acknowledgements and real event monitoring"],
  ["Browser-memory session and JSON export", "Durable project history, recoverable jobs, secured retention and versioned audit storage"],
] });

const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const mdTable = t => `| ${t.head.join(" | ")} |\n| ${t.head.map(() => "---").join(" | ")} |\n${t.rows.map(row => `| ${row.join(" | ")} |`).join("\n")}`;
const markdown = `# Samsung launch continuity — presenter guide\n\nGenerated from the demo model and exact supported prompts.\n\n${sections.map(s => `## ${s.title}\n\n${s.paragraphs.join("\n\n")}${s.table ? `\n\n${mdTable(s.table)}` : ""}${s.code ? `\n\n\`\`\`text\n${s.code}\n\`\`\`` : ""}`).join("\n\n")}\n`;
const tableHtml = t => `<div class="table-scroll"><table><thead><tr>${t.head.map(v => `<th>${esc(v)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(row => `<tr>${row.map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Samsung launch continuity | Demo guide</title><style>
:root{font-family:Arial,Helvetica,sans-serif;color:#17243a;background:#f3f6fb;line-height:1.65}*{box-sizing:border-box}body{margin:0}main{max-width:1050px;margin:auto;padding:48px 28px 80px}header{padding:30px;background:#0d284f;color:white;border-radius:16px}h1{line-height:1.16;font-size:38px;margin:10px 0}header p{color:#d1e3ff}h2{font-size:23px;line-height:1.3;color:#163b68}section{background:white;border:1px solid #dce4ef;border-radius:12px;padding:26px;margin:24px 0;scroll-margin-top:20px}p{margin:12px 0}nav{columns:2;margin:24px 0}nav a{display:block;color:#205db7;padding:5px 0}button{font:inherit;padding:8px 15px;border-radius:7px;border:1px solid #bdd0e8;background:#edf4ff;color:#173e74;cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:20px;background:#112b4b;color:#eef5ff;border-radius:8px;font:15px/1.6 Consolas,monospace}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #dce4ef;padding:12px;vertical-align:top}th{background:#edf4ff}.table-scroll{overflow:auto}footer{font-size:13px;color:#465d77}@media(max-width:650px){main{padding:18px 12px}header,section{padding:20px}h1{font-size:30px}nav{columns:1}table{min-width:550px}}@media print{body{background:white}main{padding:0}header{color:#17243a;background:white}header p{color:inherit}nav,button{display:none}section{break-inside:avoid;border:0}pre{color:#17243a;background:#f4f4f4}.table-scroll{overflow:visible}}
</style></head><body><main><header><small>TANJNX / SAMSUNG DEMO PLAYBOOK</small><h1>From an empty project to a reviewed launch response</h1><p>Presenter instructions, exact prompts, expected results and calculation notes.</p><p>Fictional data · simulated agents · no Samsung systems contacted</p></header><nav aria-label="Guide contents">${sections.map((s, i) => `<a href="#step-${i}">${esc(s.title)}</a>`).join("")}</nav>${sections.map((s, i) => `<section id="step-${i}"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}${s.table ? tableHtml(s.table) : ""}${s.code ? `<button type="button" data-copy="prompt-${i}">Copy text</button><pre id="prompt-${i}">${esc(s.code)}</pre>` : ""}</section>`).join("")}<footer>Generated by scripts/build-samsung-guide.mjs from app/samsung-demo-model.ts. The guide can be read offline. Use your browser's Print command to save a PDF.</footer></main><script>
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const text=document.getElementById(button.dataset.copy).textContent;try{await navigator.clipboard.writeText(text);button.textContent='Copied';setTimeout(()=>button.textContent='Copy text',1600)}catch{const range=document.createRange();range.selectNodeContents(document.getElementById(button.dataset.copy));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Text selected — press Ctrl+C'}}));
</script></body></html>`;
for (const directory of ["docs", "public"]) await mkdir(new URL(`../${directory}/`, import.meta.url), { recursive: true });
await Promise.all([
  writeFile(new URL("../docs/SAMSUNG_DEMO_GUIDE.md", import.meta.url), markdown),
  writeFile(new URL("../docs/samsung-demo-guide.html", import.meta.url), html),
  writeFile(new URL("../public/samsung-demo-guide.html", import.meta.url), html),
]);
console.log(`Samsung guide: ${sections.length} sections, ${prompts.length} exact prompts, ${n(revised.shipped)} final deliveries.`);
