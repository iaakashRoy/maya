# tanjnx agentic supply-chain OS: implemented clickflow and production contract

> Historical audit. Superseded on 2026-09-10: Mission control and the separate Decision journey were removed. Use existing project Data, Decisions, Statistics and Simulation. See [current workflow improvements](EXISTING_WORKFLOW_IMPROVEMENTS.md). The old PowerPoint is retained as a historical artifact, not the current navigation guide.

Audit date: 9 September 2026. Source baseline: `fa66e78`, with this update layered on the existing project, graph, tool and Playground surfaces.

## Conclusion

The portal is an interactive operating-system prototype, not yet an installed agent service or a production decision platform. This update makes its operating model explicit and introduces a calculated Simulation tool. No client machine, enterprise database, IoT broker, hosted knowledge store, LLM runtime, or production execution connector is connected.

The user should start with **Mission control**, choose a client/project, read its situation, run a mission, inspect the artifact, change assumptions, and record review. Existing project Data, Decisions, Controls, Playground and specialist tools remain available. A tool is an inspectable analytical capability, not a separate source of operational truth.

## Capability coverage

| Requested capability | Previously present | This update | Still required for production |
|---|---|---|---|
| Local companion and background collection | Connector catalog and browser agent-manifest drafts | Scoped desktop/API profile, owner-consent acknowledgement, exportable read-only policy, combined collector/chat target contract | Signed installer, device enrollment, service lifecycle, sandbox, secure credential store, source adapters, offline sync |
| Registered IoT devices | MQTT/QR connector descriptions and fixture telemetry | Device profile and executable sample validation: identity match, schema, sequence, deduplication, age, acceptable range, quarantine ledger | Device certificates, broker/topic ACLs, durable ingestion, fleet management, calibrated sensors and product-specific thresholds |
| Cloud client knowledge base | Project data, graph nodes/edges, table exploration and evidence receipts | Explicit private-modeled/public-sourced boundaries and source register | Server-side tenancy, durable tables/documents, versioned assertions, entity resolution, authorized retrieval |
| Public world intelligence | World network and scenario playback | Dated primary-source register, monitored-signal needs and freshness warnings for ten cases | Licensed feeds, refresh jobs, effective-time policy registry, source independence checks, legal review |
| Agents using sophisticated tools | Project work sessions, mentions, traces and run lineage | Mission trace, shared Simulation run artifact, version/seed/input inspection, contextual links into existing tools | LLM orchestrator, typed tool API, durable jobs/events, actual validated optimization engines |
| Human intervention | Local fork/rerun contracts and decision-journey review gates | Editable simulation assumptions, stale-result notice, regenerated results, review note bound to exact run | Authenticated authority, signed approvals, expiry, two-person controls, execution acknowledgements |
| Dynamic workers | Named-agent drafts | Bounded slot/queue/lease scheduling preview | Isolated processes, capability grants, queue scheduler, compute budgets, cancellation propagation, lease recovery |
| Learning and evolving skills | Reference blueprints and controls | Per-run feedback, computed service error, local shadow gate, rollback | Verified outcomes, reward attribution, coverage diagnostics, independent evaluation, signed skill registry and governed promotion |
| Simulation | Reference descriptions and static manufacturing fixtures | Executable weekly Monte Carlo / Markov flow model with common random draws, shipment ledger, P05 service, P95 loss, CVaR95, budget/service checks | Domain validation, calibrated joint distributions, multi-product constraints, appropriate DES and optimization engines |
| Local terminal | Interactive browser Playground | Same terminal remains accessible; local companion policy includes intended chat boundary | CLI package, authenticated streaming chat, explicit local tool approval, encrypted session synchronization |

## Navigation and evidence design

1. **Missions** answers “what changed, what matters, what did the workflow calculate, and who reviews?” The mission follows the selected project; changing client must never reuse another tenant's run.
2. **Connections** answers “what is allowed to read which data?” No install-looking button should silently imply an enrolled runtime. Exported profiles explicitly contain a null endpoint and no credentials.
3. **Intelligence** separates published facts, hypothetical stress, client operating assumptions and sample events. Public annual figures cannot establish site-level available capacity or supplier qualification.
4. **Tools** contains the existing catalog plus Simulation. A researcher-owned method needs an input schema, applicability limits, version, tests, validation evidence and output receipt before production use.
5. **Learning** records outcome evidence and challenges forecasts. It cannot silently rewrite prompts, tools or production policies.

Project pages remain the detailed working context. Project tabs do not appear on app surfaces. The existing dense Playground layout is preserved.

## What is genuinely calculated here

`simulation-model.ts` runs the same random demand and disruption draws for baseline and response. Each path simulates weekly operating states, dispatched supply, delayed arrivals, inventory, served demand, lost demand, in-transit stock and intervention cost. Every run freezes input, method version, seed and project. The identifier is a reproducibility fingerprint, not a cryptographic signature.

- Demand is a symmetric triangular perturbation around the scenario mean. Its bounded variation is an expert assumption, not a fitted distribution.
- Weekly Markov transitions are explicit, editable and validated to sum to one. State affects both capacity and transit; it does not re-time shipments already dispatched.
- Regime lead days are total lead time. Baseline lead time controls the opening pipeline's arrival schedule.
- An additional capacity cut multiplies the state's capacity factor. These represent a joint shock and must not duplicate the same real-world loss.
- The opening pipeline is a modeled input and arrives evenly over baseline lead time. Opening available inventory is separate.
- Qualified alternate supply becomes available no earlier than its qualification week. Expedite shortens lead by one week and incurs a premium.
- Loss equals permanently unserved units times modeled unit margin, plus intervention premiums. It excludes full procurement economics, tax, holding costs, expiry, salvage and causal profit attribution. A negative avoided-loss result means the intervention costs more under this model.
- P05 service is the downside service quantile. P95 loss is the upper loss quantile. CVaR95 is the mean loss of the worst 5% of sampled paths. Scenario probability is conditional on the entered assumptions, not a calibrated real-world crisis probability.
- Numerical service and budget checks do not evaluate lot eligibility, medical safety, emissions, water rights, product configuration or origin rules. Those remain visible human review gates.
- Browser storage retains compact receipts and reconstructs results by recomputing validated input. Exported artifacts are portable JSON. No production decision is released.

## Ten case studies: realism without fabricated private data

The additional evidence layer contains 23 dated primary-source records, 23 sourced facts and 60 company-specific operational assumptions. Distinct demand scales, units, lead times, yields, qualified alternates, budgets, service thresholds and transition matrices define each model. Names identify educational examples, not claimed customer relationships.

| Company | Compound planning problem | Domain checks that must accompany the aggregate result |
|---|---|---|
| Apple | Launch allocation, advanced components and magnet-source transition | SKU compatibility, qualified ramp and customer launch commitments |
| Coca-Cola | Water restriction, weather-related demand and can supply | Watershed withdrawal, recipe/pack approval, expiry and returnable loops |
| Gucci | Traceability quarantine and diverging collection demand | Lot-origin evidence, artisan hours, rework and seasonal obsolescence |
| Tata Motors | Controller allocation cut and inbound diversion | Configuration/software eligibility, service reserves and testing capacity |
| Tesla | Cell allocation, refining concentration and energy programme demand | Chemistry eligibility, battery certification and warranty effects |
| BYD | Export-market policy scenario and regional production transition | Origin, applicable duty, local qualifications and market homologation |
| Hershey | Cocoa cost/supply stress and seasonal shipment deadline | Ingredient traceability, recipes, food safety and seasonal demand |
| TSMC | Fab interruption and advanced-packaging constraints | Node/tool qualification, contamination, yield and customer commitments |
| Airbus | Engine shortage and configuration-complete aircraft sequence | Airworthiness, serial/configuration genealogy and certified capacity |
| Pfizer | Manufacturing recovery and medicine availability | Product-specific release, temperature validation, expiry and clinical allocation authority |

Annual public data are context. Historical crises remain dated; for example, the Pfizer tornado recovery notice is a closed historical event, not an active outage. Public duty announcements are historical policy evidence, not a current legal determination. The app links back to the source and shows the relevant date.

## Production architecture

Use six explicit trust boundaries rather than one all-powerful background agent:

1. **Client edge:** signed companion, approved read-only adapters, encrypted queue, local redaction, customer-controlled pause/revoke. Access should be granted to specific folders/tables/topics rather than broad background scraping.
2. **Ingestion:** authenticated tenant/device identity, schema registry, event and receipt time, deduplication, quality quarantine, durable checkpoint and reprocessing.
3. **Knowledge:** relational metadata, object evidence, queryable columnar tables, temporal graph assertions and permission-filtered retrieval. Keep a restricted tenant layer separate from public intelligence. Cross-client relationships require a permitted aggregate or public fact, not disclosure of private commercial records.
4. **Orchestration:** durable mission/task queues, scoped short-lived workers, typed tools, retries/cancellation, resource ceilings and streaming events. Retrieved web/document text is data, never authority to call a tool.
5. **Analytical execution:** researcher-owned numerical packages with frozen environments, dataset/model versions, deterministic seeds, status and diagnostics. Use specialized optimization, statistical and discrete-event engines when the problem requires them. Surface infeasibility, time limits, bounds and validation limits rather than a universal “optimal” label.
6. **Decision and learning:** immutable proposal, authorized reviewer, expiry, separate execution connector, idempotent write-back, acknowledgement and outcome measurement. Offline evaluation and shadow mode precede any learning-policy pilot.

The existing worker is a web serving adapter; its database type declaration does not create a backend. Long simulations and OR solves should run in bounded analytical workers rather than the interactive web request.

## Suggested implementation sequence

### Pilot 1: trusted data and one bounded decision

- Select one client, one product family, one decision owner and one measurable outcome.
- Implement server authorization, source permissions, read-only ingestion and durable artifacts.
- Import actual historical data, reconcile units, inspect head/full table and freeze an evidence snapshot.
- Validate the first model against held-out history with an expert-agreed error tolerance.
- Run recommendation-only and compare with the planner's baseline. Do not infer production readiness from a polished clickflow.

### Pilot 2: agent execution and governed actions

- Add streaming missions, signed tool manifests, artifact retrieval and worker leases.
- Test prompt injection, unauthorized retrieval, duplicate events, cancellation, stale input, revoked source access and budget overrun.
- Require approval of an exact revision, then execute one reversible connector action with acknowledgement and reconciliation.

### Pilot 3: skills and learning

- Record decision context, action, behavior policy/propensity, reward window, realized outcome and confounders.
- Use time-separated evaluation, coverage checks, safe baseline fallback and shadow comparison.
- Promote a signed challenger only with independent authorization, a bounded pilot and rollback. Autonomous exploration of live supply-chain actions is inappropriate by default.

## Acceptance criteria for a real deployment

- A device/source can be revoked and its writes stop; buffered events remain attributable and replay-safe.
- Two tenants cannot retrieve each other's documents, graph relationships, tool inputs or outputs, including by guessed identifiers.
- A numeric output links to exact input, unit, formula/tool version, seed, time and validation scope.
- Changed source evidence invalidates affected runs and approval, without rewriting history.
- A cancelled worker cannot continue spending or commit an action.
- No proposed action executes without current scoped authority; retries are idempotent and acknowledgements reconcile.
- Model performance, data freshness, drift, resource cost and outcome error are observable over time.
- Each tool has a responsible researcher/owner, independent validation and declared fallback.

## Engineering references

- [NISTIR 8259A: device cybersecurity baseline](https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8259A.pdf): device identity, interface access, protected data and secure updates.
- [OASIS MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html): protocol delivery and security considerations; transport QoS does not replace application idempotency.
- [OWASP excessive agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/): narrow tool authority and downstream authorization.
- [Sargent, simulation verification and validation](https://www.informs-sim.org/wsc11papers/016.pdf): validity depends on intended use and experimental conditions, separately from software correctness.
- [Glasserman and Yao, common random numbers](https://pubsonline.informs.org/doi/10.1287/mnsc.38.6.884): paired comparison can reduce variance under appropriate conditions.
- [Thomas and Brunskill, off-policy evaluation](https://proceedings.mlr.press/v48/thomasa16.html): historical policy evaluation has estimator and coverage assumptions.
- [Laroche et al., safe policy improvement](https://proceedings.mlr.press/v97/laroche19a.html): baseline fallback in uncertain regions; the rollout sequence above is an engineering recommendation, not a universal safety guarantee.

## User guide

The editable PowerPoint is available in the portal as **How to use**. It explains the navigation, connection boundary, evidence interpretation, mission trace, Simulation controls, review and learning workflow, and each of the ten cases.
