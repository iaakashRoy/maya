# Samsung launch continuity — presenter guide

Generated from the demo model and exact supported prompts.

## What this demonstration does

You create Samsung as a new client, create an empty project, connect four simulated customer databases, activate a customer-side demo worker, and ask the agents to resolve a launch crisis. Specialist apps appear only when an agent task uses them. Nothing is preloaded into the new project's app bar except Playground.

Fictional Samsung scenario. All sources, workers, agent activity, approvals and execution are simulated locally; no Samsung systems are contacted.

Allow 15–20 minutes for the presentation. Keep the guide open in another tab. The portal and Samsung run are in memory: navigating within the app preserves them, but refreshing, closing the tab or opening the project URL in another tab loses the new client, project and run. Export the demo record before closing. The export is a review artifact, not an importable session backup.

This is a guided chat demonstration, with deterministic agent tasks and calculations. It has no LLM, live SQL connection, deployed worker, enterprise solver or operational write-back. Supported prompts and explanation questions behave consistently; unrelated requests get an explicit response rather than invented results.

## Start the application

Use the published workspace, or run these PowerShell commands locally and open http://localhost:3000. The app lives in real_maya\maya. The real\_maya folder from the earlier npm error is not the package root.

If dependencies have not yet been installed in this checkout, run npm install from this same folder before npm run dev. You need a supported Node version as declared in package.json. No Samsung credentials or API keys are needed.

```text
cd "C:\Users\aroy06\OneDrive - Kearney\Desktop\SupplyChainProposal\real_maya\maya"
npm run dev
```

## The fictional business situation

Protect a fictional Galaxy launch across India, Europe and Korea after a memory shortage, a battery quality hold, a shipping delay and an India demand spike. The fixed snapshot is 15 September 2026; the delivery deadline is 25 September 2026. These dates are scenario dates, not a live clock.

Serve at least 95% of 132,000 launch orders within a USD 900,000 incremental budget, without using quarantined batteries or unqualified suppliers.

Memory supply is initially limited to 98,000 units. Released batteries total 100,000, while 18,000 additional batteries are quarantined and never usable. Base assembly capacity is 126,000. Standard transport can deliver only 106,000 before the deadline. India demand has risen from 60,000 to 72,000, making total demand 132,000.

Presenter framing: 'Can the system move from a business question to an evidence-backed response, recognize when that response becomes invalid, and get human review before acting?'

## 1. Add the Samsung client manually

Open Clients & projects using the workspace navigation, click Onboard client, and complete each wizard step with Continue. Enter the following values, then click Save client draft on Review. Do not select a pre-existing Apple or other seeded project.

The Samsung demo is selected for browser-created projects whose client name contains the word Samsung. Use Samsung Electronics exactly for this walkthrough. Saving the client creates the catalog entry only; it does not create the project or any source connection.

| Wizard step / field | Value |
| --- | --- |
| Identity / Client name | Samsung Electronics |
| Identity / Sector | Semiconductors |
| Identity / Optional sector key | semiconductors |
| Boundary / Classification | Client confidential — demo data |
| Boundary / Data-residency intent | Korea / India / EU — simulated policy partitions |
| Collaboration / Client lead | Samsung demo supply chain lead |
| Collaboration / tanjnx lead | Asha Rao |

## 2. Create an empty project

Click Create project from Clients & projects. In Parent, select Samsung Electronics and the Semiconductors tower. Complete Decision brief and Governance using the values below. Leave optional classification and residency overrides blank to inherit the client labels. Click Save project draft on Review.

Open Apps immediately after creation. The Apps list and app bar show Playground only: no Risk Radar, Network Optimizer or other specialist app. Data, Decisions and Overview are workspace sections, not pre-used specialist apps. Counts start at zero.

| Field | Value |
| --- | --- |
| Client | Samsung Electronics |
| Tower | Semiconductors |
| Project name | Galaxy Launch Continuity |
| Problem statement | Protect a fictional Galaxy launch across India, Europe and Korea after a memory shortage, a battery quality hold, a shipping delay and an India demand spike. |
| Outcome statement | Serve at least 95% of 132,000 launch orders within a USD 900,000 incremental budget, without using quarantined batteries or unqualified suppliers. |
| Project owner | Samsung demo supply chain lead |
| Currency | USD |
| Region intent | India · Europe · Korea |

## 3. Connect the customer data and activate agents

Open Data or click Connect demo data. Keep the supplied samsung-demo-worker.invalid worker name. Click Select four demo sources, tick Allow only read-only demo queries, then click Validate connections (demo). Four fixture checks complete over approximately four seconds.

Inspect each sample and its variable reference. Observe the battery quarantine exception. Tick I reviewed units, fields, source scope and the quarantine exclusion, then click Activate demo agents. Activation is blocked until validation and mapping acknowledgement are complete.

11 named demo agent identities are now available, but no specialist app has been used. Open Apps to verify that Playground is still the only entry, then Open Playground.

In a production system, this step would test network access and approved read-only service identities on a worker deployed inside the customer's environment. Here the checks validate local fixture contracts. The .invalid worker name is never contacted, and no credentials are collected.

| Source | Database / tables | Demo rows | Evidence purpose |
| --- | --- | --- | --- |
| ERP / launch order book | samsung_demo_erp / launch_orders, inventory | 3 | India demand increased from 60,000 to 72,000 units; all 132,000 units enter the service denominator. |
| MES / quality management | samsung_demo_mes / battery_lots, line_capacity | 3 | 18,000 batteries are on hold and excluded from usable supply. No plan may consume them. |
| Supplier qualification and supply | samsung_demo_srm / qualified_sources, component_supply | 5 | One qualified alternative can provide 24,000 memory modules. A separate 10,000-unit buffer is customs-sensitive. |
| TMS / carrier milestones | samsung_demo_tms / lane_capacity, carrier_milestones | 3 | Standard lanes deliver only 106,000 units before the launch cutoff. Expedited capacity is finite. |

## 4. Establish the decision scope

Click Use this prompt, or copy the text below into Message the project agents and press Enter. Shift+Enter inserts a line break. Wait for the run to finish before continuing. The source-audit tasks do not open specialist apps.

Expected result: Four source contracts checked; 132,000 units, 95% service, $900,000 budget. Only Playground remains in the app bar.

Apps used in this step: none. Existing used apps remain visible.

```text
Confirm the Samsung Galaxy launch scope, validate the connected data and summarize the hard constraints. Do not run specialist apps yet.
```

## 5. Diagnose the launch risk

Watch Agent activity on the right. Each completed specialist task adds its app to the app bar. Click any source evidence link to inspect the local rows, then close the evidence panel. Click a newly used app to inspect its Samsung-specific work and use Back to Playground to return. The transcript and stage are retained.

Expected result: Risk Radar, Quality Genealogy, Demand Sense, Supplier Graph and Logistics Radar appear as agents use them. Baseline is 98,000 units, or 74.24% service.

Apps used in this step: Risk Radar, Quality Genealogy, Demand Sense, Supplier Graph, Logistics Radar. Existing used apps remain visible.

```text
Diagnose the Samsung launch risk. Trace the memory shortage, battery quality hold, India demand spike and transport bottleneck. Show the baseline and cite source evidence.
```

## 6. Compare feasible responses

Inspect Network Optimizer for the candidate comparison, Manufacturing Twin for capacities, and Flow Lens for the seven cost lines. The chosen response is the feasible declared candidate, not a claim of a globally optimal solution. No action has been approved or released.

Expected result: Three calculated options. Diversified response ships 128,000 units at $838,000 incremental cost; 96.97% service. This is a candidate, not an approval.

Apps used in this step: Network Optimizer, Manufacturing Twin, Flow Lens. Existing used apps remain visible.

```text
Compare no action, an air-led response and a diversified response. Respect qualified sources and quarantine, keep spending below $900,000 and achieve at least 95% service. Show the trade-offs and recommend a candidate.
```

## 7. Introduce a new disruption

This prompt represents a new customer event arriving during planning. Both the customs-sensitive memory buffer and the expedited shipping lane lose 8,000 units before cutoff. The old recommendation is recalculated and cannot be presented as still meeting the service goal.

Expected result: The previous candidate drops to 120,000 units, or 90.91% service. Previous review state is invalidated.

Apps used in this step: Risk Radar, Logistics Radar. Existing used apps remain visible.

```text
Inject a new disruption: customs delays 8,000 buffer memory modules and the expedited lane loses 8,000 launch-window slots. Invalidate the previous candidate and explain the impact before acting.
```

## 8. Replan and stress-test

Open Simulation from the app bar. Read all five cases: four agreed single-factor checks pass, while the combined case fails. This is an explicit residual-risk disclosure. A human must accept the scoped envelope and escalation condition; the model does not claim to eliminate every risk.

Expected result: Revised response restores 128,000 units for $898,000. All four single-factor stress cases pass; a combined stress case fails and is disclosed.

Apps used in this step: Network Optimizer, Manufacturing Twin, Simulation, Flow Lens. Existing used apps remain visible.

```text
Replan using the qualified regional memory buffer and backup route. Reduce overtime if capacity allows, stay within the original budget, and stress-test demand, memory, battery and lane availability. Explain the remaining exposure.
```

## 9. Prepare human review

After this prompt finishes, click Complete human review or open Decisions. Review candidate costs and allocations, all stress cases and the three role responsibilities. Click Simulate Quality owner sign-off, Simulate Finance controller sign-off, then Simulate Supply chain owner sign-off. Each button records a separate local attestation. In this demo the presenter plays all three roles; no enterprise approval permission is granted or bypassed.

Optional demonstration: send the final release prompt before completing all three sign-offs. Release is blocked and the stage remains on step 7. Finish the remaining sign-offs and resend the same prompt.

Expected result: Decision package awaits three explicit simulated human approvals in Decisions. Chat text cannot self-approve.

Apps used in this step: none. Existing used apps remain visible.

```text
Prepare the final decision brief with the revised allocations, cost breakdown, evidence, stress results and action owners. Request separate Quality, Finance and Supply Chain approvals. Do not release anything yet.
```

## 10. Simulate execution and monitoring

The release prompt opens the simulated execution ledger only after all three sign-offs. Click Advance one demo day ten times to reach Day 10. Nothing advances automatically in this monitoring ledger. Inspect owner actions and the delivered-unit total at each step. Export demo record when finished.

Expected result: Runs only after all three approvals. Simulated execution finishes at 128,000 delivered units, $898,000 cost and no quarantined stock used.

Apps used in this step: Logistics Radar, Flow Lens. Existing used apps remain visible.

```text
Release the approved plan in the simulation and show day-by-day monitoring, owner actions, delivered units and the final executive summary.
```

## What the final recommendation contains

Reserve 24,000 qualified alternative memory modules and the original 10,000-unit buffer; accept that 8,000 buffer units miss cutoff. Add 8,000 qualified regional modules. Reserve 30,000 qualified batteries while leaving the 18,000-unit hold untouched. Keep 22,000 booked expedited slots, accept 8,000 lost slots, and add 8,000 backup-route slots. Reduce overtime capacity to 4,000.

The paid buffer and booked expedited premiums remain charged after the shock; this model assumes no refund for late/cancelled capacity. Backup and regional supply are incremental costs. The model assumes one memory module and one released battery per finished device, all declared capacities usable within the horizon, no additional yield loss, and additive shipping capacity. It is a small launch-window capacity model, not a detailed scheduling or multi-echelon optimizer.

Delivered units = min(demand, memory, released batteries, assembly, transport). Service = delivered / all requested units. Costs = sum(intervention units × incremental rate). Market allocation is proportional to demand, with integer rounding reconciled to total shipments. It is a declared allocation policy, not a customer-priority optimizer.

Revised capacities: Memory 132,000; Batteries 130,000; Assembly 130,000; Transport 128,000. Transport binds at 128,000. Service is 96.97%, with 4,000 orders explicitly unserved. Cost is $898,000, leaving $2,000 budget headroom.

Illustrative net contribution protected is $5,402,000 = (128,000 − 98,000) × $210 assumed contribution per unit − $898,000. This is scenario arithmetic, not observed Samsung profit or realized savings.

| Cost item | Units | USD / unit | Incremental USD |
| --- | --- | --- | --- |
| Qualified alternative memory | 24,000 | 8 | $192,000 |
| Customs-sensitive memory buffer | 10,000 | 4 | $40,000 |
| Qualified regional memory | 8,000 | 6 | $48,000 |
| Qualified battery reserve | 30,000 | 5 | $150,000 |
| Expedited launch-window slots | 22,000 | 18 | $396,000 |
| Backup route premium | 8,000 | 4 | $32,000 |
| Overtime capacity | 4,000 | 10 | $40,000 |

## Calculated comparison and market allocation



| Scenario | Deliveries | Service | Cost | Budget + service |
| --- | --- | --- | --- | --- |
| No action | 98,000 | 74.24% | $0 | Fail |
| Air-led response | 120,000 | 90.91% | $760,000 | Fail |
| Diversified response | 128,000 | 96.97% | $838,000 | Pass |
| Diversified response after shock | 120,000 | 90.91% | $838,000 | Fail |
| Revised response after shock | 128,000 | 96.97% | $898,000 | Pass |

## Final allocation



| Market | Requested | Delivered by cutoff | Unserved |
| --- | --- | --- | --- |
| India | 72,000 | 69,819 | 2,181 |
| Europe | 40,000 | 38,788 | 1,212 |
| Korea | 20,000 | 19,393 | 607 |

## Stress results and escalation

The release gate requires all four agreed single-factor cases to pass. The combined case is outside that approved envelope and remains visible even though it fails. If demand rises 2% at the same time as another 2,000 transport slots disappear, escalate to the program owner for a new plan rather than continue under the old approval. These are enumerated deterministic scenarios, not probabilities or Monte Carlo confidence intervals.

| Case | Delivered | Service | Result | Scope |
| --- | --- | --- | --- | --- |
| Demand +2% | 128,000 | 95.07% | Pass | Agreed single-factor gate |
| Memory arrivals −4,000 | 128,000 | 96.97% | Pass | Agreed single-factor gate |
| Battery reserve −2,000 | 128,000 | 96.97% | Pass | Agreed single-factor gate |
| Transport slots −2,000 | 126,000 | 95.45% | Pass | Agreed single-factor gate |
| Combined: demand +2% and slots −2,000 | 126,000 | 93.58% | Fail | Outside envelope; escalate |

## Ten-day execution replay

Owner actions are fictional instructions shown for review. No purchase order, supplier email, carrier booking, factory change or database write is sent. Day 0 is the approved release; each click advances the fixed replay by one day.

| Demo day | Cumulative delivered units |
| --- | --- |
| 0 | 0 |
| 1 | 0 |
| 2 | 0 |
| 3 | 8,000 |
| 4 | 22,000 |
| 5 | 42,000 |
| 6 | 65,000 |
| 7 | 86,000 |
| 8 | 106,000 |
| 9 | 120,000 |
| 10 | 128,000 |

## Action owners



| Window | Owner | Action |
| --- | --- | --- |
| D1–D2 | Supplier lead | Confirm qualified memory allocations and battery reserve. |
| D2–D3 | Quality owner | Verify certificates and preserve the 18,000-unit quarantine. |
| D3–D6 | Plant planner | Schedule 4,000 incremental assembly slots; protect line capacity. |
| D3–D9 | Logistics lead | Use expedited and backup routes; reconcile cutoff arrivals. |
| D10 | Finance + program owner | Reconcile 128,000 deliveries, $898,000 cost and 4,000 unserved orders. |

## Optional challenge: change the budget

Do this after the revised plan and review brief have been prepared. In Decisions set Incremental budget to 850000, leave Minimum service at 95, and click Apply constraints and invalidate review. Existing sign-offs and any simulated release state are cleared.

Return to Playground and repeat the Prepare human review prompt. The $898,000 candidate now fails the budget gate, and approval buttons remain unavailable. The model does not fabricate a cheaper response.

Restore the budget to 900000 in Decisions, apply it, and prepare the review brief again. Record all three sign-offs and use the release prompt. This demonstrates that changed constraints require a fresh review. You can also raise service to 98 to demonstrate an infeasible service gate.

## Recovery, presenter tips and questions

Ask 'Why is transport the binding constraint, and what are the assumptions?' to obtain the supported model explanation. Explanation questions do not run more apps or advance the workflow. Supported intent paraphrases work, but the exact supplied prompts are the dependable presentation path.

If an out-of-order prompt is sent, the assistant names the missing step. Use the next suggested prompt. Repeating an already completed step keeps its recorded evidence and does not duplicate apps or runs. If a task is paused, click Resume agent run. Timed tasks pause when leaving the Samsung workspace and resume when returning; navigating between its tabs retains the run.

If activation is blocked, select all four sources, tick read-only access, validate, and confirm the mappings. If release is blocked, prepare the current brief, check budget/service/stress gates and record all three sign-offs. A chat message saying 'approved' does not grant approval.

To repeat from the start without refreshing, create a second project under Samsung Electronics with a different project name. Each project has its own empty app list, source configuration and transcript. To completely clear drafts, refresh and manually add the client/project again. Export before doing this.

Do not refresh or use the address bar to switch project screens during the presentation; use the in-app navigation. A guide tab can be refreshed independently. Export demo record downloads JSON containing the brief, inputs, source fixtures, used apps, agent trace, conversation, computed candidate, stress cases, sign-offs and execution position.

## How these screens map to a production platform



| Demo behavior | Production implementation represented |
| --- | --- |
| New client and project drafts | Durable tenant/project records, real identities and enforced project access |
| Read-only source checks and .invalid worker | Customer-hosted worker, network/credential validation, approved SQL scopes and secret management |
| Mapping acknowledgement and local evidence | Schema/unit validation, versioned datasets, lineage, freshness and data-quality rules |
| Deterministic chat intents and timed agent tasks | LLM planning, tool calls, retries, cancellation, observable execution and model evaluations |
| Apps added at completed first use | Project-level application usage records created by actual tool execution |
| Four candidate plans and stress arithmetic | Domain-specific optimization/simulation services with validated operational constraints |
| Three role-play attestations | Authenticated reviewers, separation of duties, version-bound approvals and auditable policy enforcement |
| Manual execution clock | Approved command dispatch, idempotent integrations, acknowledgements and real event monitoring |
| Browser-memory session and JSON export | Durable project history, recoverable jobs, secured retention and versioned audit storage |
