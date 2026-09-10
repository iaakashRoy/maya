# Existing workflow improvements
Updated 10 September 2026.

## One workspace, no parallel workflow
The duplicate Mission control page and Decision journey have been removed from navigation and their
duplicate UI and unused models deleted. Existing project Data, Decisions, Controls,
specialist tools, and Playground are the product surface. Older journey URLs
redirect to the corresponding project page; unrecognized clients return to Workspace.
The original Playground component and terminal layout are unchanged.

The existing project navigator is now labeled **Mission Control**; its client/tower
grouping and project selection are unchanged. **Variables** sits beside Search in
the top-right header and opens the same variables and methods registry.

Case studies are no longer an integrated page or workflow link. Share
[the standalone HTML presentation](tanjnx-case-studies.html) separately: all ten
cases, styles, slide controls, and Print/PDF are embedded in the file. The project
data used by the workspace is retained.

## Using the improved tools
1. Select a client and project. Open Data and a table's full view.
   Text, column, minimum and maximum filters operate on 96 deterministic sample
   rows. The summary and each variable profile recalculate from the filtered rows.
   Export filtered CSV downloads exactly those rows; no registry-wide query is implied.
2. Open the existing Statistics tool. Choose a dataset, variable and method.
   Descriptive statistics use sample SD (n minus 1) and empirical quantiles.
   State transitions count event-time-ordered samples in low, typical and high
   states based on mean plus/minus SD. No observations means unavailable, not zero.
   Process performance requires explicit specification limits and computes Pp/Ppk.
   These are not within-subgroup Cp/Cpk or a product-release authorization.
3. Open the existing Simulation tool. Adjust demand, inventory, capacity cuts,
   qualification timing, service floor, budget or state probabilities, then run.
   Paired baseline and response policies use the same random draws. Inspect
   service distributions, CVaR95, costs and the weekly material-flow ledger.
   A changed input marks the previous result stale. Fork and rerun to recalculate.
   Retained history holds up to eight runs; compare input changes and outcomes,
   inspect an exact run by link, or export its complete receipt.
4. Attach the current calculated run to an existing project decision.
   Open Decisions to inspect it beside the scenario's existing lineage.
   Scenario values remain illustrative; calculated results are explicitly separate.
   A reviewer with the existing project review capability must check all domain
   constraints and provide a rationale before marking the result reviewed locally.
   Failed service/budget checks or stale inputs block a positive review.
   A revision request remains possible when checks fail.
5. Reviews record reviewer, rationale, checked constraints, exact run and expiry.
   They expire after 24 hours. Editing assumptions or creating a newer run makes
   attached older evidence stale. Decision snapshots and branch comparisons
   download JSON including attached calculated evidence.

## Boundaries
- The Apple audit adds a weekly expedite ceiling shared by all projects. Apple
  defaults to 1,800 devices/week; other cases without a declared allowance start
  at zero. The numerical model is now 1.1.0. Earlier-model results cannot be reused
  for review; export the earlier-model archive in Simulation before rerunning.
- The graph table inspector now calculates its sample summary from the same 96
  generated rows as the full table. No distribution fit, stationarity or drift
  test is claimed. Generated sample values are fixture indices, not reviewed
  physical measurements or categorical encodings.
- See [the standalone Apple field guide](apple-project-guide.html),
  [its Markdown report](APPLE_PROJECT_GUIDE.md), and
  [its reproducible evidence pack](apple-project-evidence.json). These are not
  application routes or workflow navigation items.
- No new LLM, solver, collector, IoT connection, cloud store or external write-back
  was added. Browser-local permissions are UX controls, not server authorization.
- Statistics describes a materialized generated sample, not the registry's larger
  row count or independently observed production data.
- Simulation probabilities are editable elicited assumptions. Statistical sample
  transitions are not automatically relabeled as calibrated disruption states.
- Human domain checks do not prove regulatory, clinical, quality or operational
  compliance. Numerical checks are not optimality or feasibility certificates.
- Local storage is project-scoped. Clearing browser data removes local results
  and reviews. Export artifacts before doing so.
- Existing public case evidence and company-specific simulation parameters remain.
  Older architecture audits and decks are retained but their removed navigation
  is superseded by this guide.
