# Consumer Insights

Open a project with its Data setup complete, choose **Apps** (or **Overview → Apps → Manage**), find **Consumer Insights**, click **Mount**, then **Open Consumer Insights**. The app joins the mounted-app bar. Its route uses the existing `projectTab=apps&projectApp=consumer-insights` convention and requires a valid, mounted project context. As with other dynamically mounted apps, a fresh browser session may require mounting it again.

The module includes Overview, New Analysis, Sentiment, Topic Explorer, Competitors, Variables, and Summary. It shares project navigation, identity, light/dark tokens, analysis panels, tables, evidence drawers, and local download patterns. The app catalog layout accommodates the additional app without overlapping graph nodes.

## Demonstration data

The initial analysis compares Zydus Wellness Complan with Horlicks, Ensure, and PediaSure in India, across 90 days ending 14 September 2026. The products serve differing audiences; this is a demonstration of comparing perceptions, not nutritional equivalence or a factual product ranking.

The Complan baseline has 18,420 mentions and 7,850 product reviews within those mentions, with approximately 54% positive, 28% neutral, and 18% negative sentiment. The score is `100 × (positive + 0.5 × neutral) / mentions`. Six sources cover Instagram, YouTube, Reddit, LinkedIn, e-commerce reviews, and product review sites. Ten themes cover taste, price, packaging, availability, quality, nutrition, brand trust, delivery, claims, and service.

All data is synthetic. Deterministic grouped observations underlie every metric, chart, topic share, source comparison, and report. Reviews are a subset of mentions. The 1–5 histogram is an explicitly labeled sentiment-intensity proxy, not observed star ratings. Example phrases, recommendation text, freshness, and confidence are illustrative. No source is connected; no scraper, database, model API, or AI agent runs.

## Interactions and local state

- Create up to 20 analyses per existing project. Choose a primary product, optional competitors, sources, India/Metro India/Tier 2 India, and 30/60/90 days.
- Use the demo library, or simulate collection. Collection progresses through four stages and adds a deterministic fresh batch within the selected scope. Cancellation or leaving the app clears the pending timer and creates no analysis.
- Select recent analyses; filter the sentiment and competitor views by source; explore topics by product, sentiment, classification, and phrase search.
- Review topic evidence in the existing project evidence drawer.
- Edit variable names, values and types, accept/reject, and mark accepted variables usable for optimization. Saving edits invalidates acceptance and any prepared handoff.
- Prepare/download a JSON handoff containing only accepted, usable variables; open or mount Network Optimizer through existing navigation. The visual handoff does not modify optimizer inputs or the canonical variable taxonomy.
- Download all suggested variables as CSV, or the executive report and scope as JSON. CSV text is quoted and formula-like names are neutralized.

State uses a versioned, project-specific localStorage key. Invalid, obsolete, or foreign-project records reset to the initial demo. Stored evidence and synthetic confidence are regenerated from the analysis scope when restored. If browser storage is unavailable, changes remain in the open app session and the UI reports that boundary. State is not shared between devices, users, or databases.

## Later integration

`app/consumer-insights-model.ts` owns typed observations, scope selection, summaries, suggestions, exports, validation, and local record restoration. Replace `demoObservations()` with a data adapter for an internal review database or permitted collection service. Keep stable source/evidence IDs and product/project identity. Replace the timer with collection-job status and `suggestVariables()`/`summaryInsights()` with validated analysis results. Add a persistence adapter for project analysis records and an explicit reviewed input contract for downstream agents or optimization services. Keep the UI components separate from these adapters.

Focused checks in `tests/consumer-insights.test.mjs` cover conservation, filter partitions, collection scope, setup validation, variable transitions, export eligibility, storage isolation, report parity, and existing route gates. Full project tests, lint, type checking, and the production build remain the integration checks. Browser visual/interaction testing is a separate validation step.
