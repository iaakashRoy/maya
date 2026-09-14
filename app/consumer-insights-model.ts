/** Synthetic, grouped observations. Replace this data boundary with an API adapter later. */
export const CONSUMER_VERSION = 1;
export const SNAPSHOT = "2026-09-14";
export const products = [
  { id: "complan", name: "Complan", fullName: "Complan Nutrition Drink Powder", company: "Zydus Wellness", color: "#217c88", mentions: 18420, reviews: 7850, positive: .54, neutral: .28 },
  { id: "horlicks", name: "Horlicks", fullName: "Horlicks Nutrition Drink", company: "Hindustan Unilever", color: "#8761c1", mentions: 24680, reviews: 11240, positive: .62, neutral: .24 },
  { id: "ensure", name: "Ensure", fullName: "Ensure Nutrition Powder", company: "Abbott", color: "#b17428", mentions: 12640, reviews: 6230, positive: .58, neutral: .26 },
  { id: "pediasure", name: "PediaSure", fullName: "PediaSure Nutrition Powder", company: "Abbott", color: "#4774c4", mentions: 15820, reviews: 7120, positive: .60, neutral: .23 },
] as const;
export type ProductId = typeof products[number]["id"];
export const sources = [
  { id: "instagram", name: "Instagram", short: "IG", weight: 4300, freshness: "2 hours", status: "Available" },
  { id: "youtube", name: "YouTube", short: "YT", weight: 3780, freshness: "6 hours", status: "Available" },
  { id: "reddit", name: "Reddit", short: "RD", weight: 2300, freshness: "4 hours", status: "Available" },
  { id: "linkedin", name: "LinkedIn", short: "IN", weight: 780, freshness: "1 day", status: "Available" },
  { id: "ecommerce", name: "E-commerce reviews", short: "EC", weight: 5100, freshness: "3 hours", status: "Available" },
  { id: "reviews", name: "Product review sites", short: "RV", weight: 2160, freshness: "3 days", status: "Refresh suggested" },
] as const;
export type SourceId = typeof sources[number]["id"];
export const topics = [
  { id: "taste", name: "Taste", positive: "The chocolate flavour mixes smoothly and tastes good.", negative: "The sweetness is too strong for my preference.", neutral: "Tried the chocolate flavour with warm milk.", affinity: 1.5 },
  { id: "price", name: "Price", positive: "The larger pack offers better value on promotion.", negative: "The price per serving makes repeat purchase difficult.", neutral: "Comparing cost per serving across brands.", affinity: .45 },
  { id: "packaging", name: "Packaging", positive: "The scoop and resealable lid are convenient.", negative: "The seal was loose and powder spilled in transit.", neutral: "The refill pack has a different closure.", affinity: .60 },
  { id: "availability", name: "Availability", positive: "Easy to find at my local store.", negative: "My preferred variant is frequently out of stock.", neutral: "Checking availability in the neighbourhood.", affinity: 1.05 },
  { id: "quality", name: "Quality", positive: "The texture has been consistent across packs.", negative: "This batch clumped more than the previous one.", neutral: "Comparing the texture of two variants.", affinity: 1.20 },
  { id: "nutrition", name: "Nutrition", positive: "The nutrition label makes comparisons easy.", negative: "I want a clearer breakdown of added sugar.", neutral: "Reading the nutrition panel before choosing.", affinity: 1.12 },
  { id: "trust", name: "Brand trust", positive: "It is a familiar brand our household trusts.", negative: "I need more evidence behind the advertised claims.", neutral: "Looking at the brand's product information.", affinity: .95 },
  { id: "delivery", name: "Delivery experience", positive: "The order arrived on time and well protected.", negative: "Delivery was delayed and the carton was dented.", neutral: "Ordered online for delivery this week.", affinity: .82 },
  { id: "claims", name: "Product claims", positive: "The ingredient information is easy to understand.", negative: "The promotional claims need clearer qualification.", neutral: "Comparing the wording on the two labels.", affinity: .80 },
  { id: "service", name: "Customer service", positive: "Support resolved the damaged-pack query quickly.", negative: "The replacement request took several follow-ups.", neutral: "Contacted support about a pack query.", affinity: .90 },
] as const;
export type TopicId = typeof topics[number]["id"];
export type Sentiment = "positive" | "neutral" | "negative";
export type Market = "India" | "Metro India" | "Tier 2 India";
export type AnalysisConfig = { productId: ProductId; competitorIds: ProductId[]; sourceIds: SourceId[]; market: Market; days: 30 | 60 | 90; mode: "library" | "collect" };
export type Observation = { id: string; productId: ProductId; sourceId: SourceId; topicId: TopicId; market: Exclude<Market, "India">; day: number; date: string; mentions: number; reviews: number; positive: number; neutral: number; negative: number; ratings: number[]; batch: number };
export type Metrics = { mentions: number; reviews: number; positive: number; neutral: number; negative: number; ratings: number[]; score: number; positivePct: number; neutralPct: number; negativePct: number };
export type SuggestedVariable = { id: string; name: string; type: "Variable" | "Constant Variable"; value: number; impact: string; confidence: number; topicId: TopicId; insight: string; evidenceIds: string[]; status: "Suggested" | "Accepted" | "Rejected"; usable: boolean };
export type Analysis = { id: string; projectId: string; title: string; createdAt: string; config: AnalysisConfig; collected: boolean; variables: SuggestedVariable[]; handoff: string | null };
export type ConsumerWorkspace = { version: 1; projectId: string; activeId: string; analyses: Analysis[] };
export const defaultConfig: AnalysisConfig = { productId: "complan", competitorIds: ["horlicks", "ensure", "pediasure"], sourceIds: sources.map(s => s.id), market: "India", days: 90, mode: "library" };
export const storageKey = (projectId: string) => `tanjnx.consumer-insights.v${CONSUMER_VERSION}.${projectId}`;
export const productFor = (id: ProductId) => products.find(p => p.id === id)!;
export const pct = (part: number, total: number) => total ? part / total * 100 : 0;

/** Largest-remainder allocation with capacity limits, preserving integer totals. */
function allocate(total: number, weights: number[], capacities = weights.map(() => total)): number[] {
  const result = weights.map(() => 0);
  let remaining = total;
  while (remaining > 0) {
    const eligible = weights.map((weight, index) => ({ weight, index })).filter(x => result[x.index] < capacities[x.index]);
    const weightSum = eligible.reduce((sum, x) => sum + x.weight, 0);
    if (!eligible.length || !weightSum) throw new Error("Invalid fixture allocation");
    const shares = eligible.map(x => ({ ...x, share: remaining * x.weight / weightSum }));
    let added = 0;
    for (const x of shares) { const value = Math.min(capacities[x.index] - result[x.index], Math.floor(x.share)); result[x.index] += value; added += value; }
    remaining -= added;
    if (remaining > 0) for (const x of shares.sort((a, b) => (b.share % 1) - (a.share % 1))) {
      if (result[x.index] < capacities[x.index]) { result[x.index]++; remaining--; }
      if (!remaining) break;
    }
  }
  return result;
}

let cachedObservations: Observation[] | undefined;
export function demoObservations(): Observation[] {
  if (cachedObservations) return cachedObservations;
  cachedObservations = products.flatMap((product, pi) => [0, 1].flatMap(batch => {
    const cells = Array.from({ length: batch ? 42 : 540 }, (_, i) => {
      const day = batch ? 83 + Math.floor(i / 6) : Math.floor(i / 6);
      const source = sources[i % 6];
      const topic = topics[(day * 7 + i % 6 * 3 + pi) % topics.length];
      return { day, source, topic, weight: source.weight * (1 + day / 180) * (1 + ((i * 17 + pi * 7) % 11) / 20) };
    });
    const total = batch ? Math.round(product.mentions * .08) : product.mentions;
    const counts = allocate(total, cells.map(c => c.weight));
    const positives = allocate(Math.round(total * (product.positive + (batch ? .025 : 0))), cells.map((c, i) => counts[i] * c.topic.affinity * (c.topic.id === "trust" && product.id === "horlicks" ? 1.8 : 1) * (c.topic.id === "taste" && product.id === "complan" ? 1.3 : 1)), counts);
    const neutrals = allocate(Math.round(total * product.neutral), counts.map((n, i) => n - positives[i]), counts.map((n, i) => n - positives[i]));
    const reviewCounts = allocate(batch ? Math.round(product.reviews * .08) : product.reviews, cells.map((c, i) => counts[i] * (["reviews", "ecommerce"].includes(c.source.id) ? 5 : 1)), counts);
    return cells.map((c, i) => {
      const negative = counts[i] - positives[i] - neutrals[i];
      const one = Math.round(negative * .38), four = Math.round(positives[i] * .44);
      return { id: `CI-${product.id}-${batch}-${i}`, productId: product.id, sourceId: c.source.id, topicId: c.topic.id, market: ((Math.floor(i / 6) + i % 6) % 3 === 0 ? "Tier 2 India" : "Metro India") as Observation["market"], day: c.day, date: new Date(Date.UTC(2026, 5, 17 + c.day)).toISOString().slice(0, 10), mentions: counts[i], reviews: reviewCounts[i], positive: positives[i], neutral: neutrals[i], negative, ratings: [one, negative - one, neutrals[i], four, positives[i] - four], batch };
    });
  }));
  return cachedObservations;
}

export function validateConfig(config: AnalysisConfig): string | null {
  if (!products.some(p => p.id === config.productId)) return "Choose a product.";
  if (!config.sourceIds.length || config.sourceIds.some(id => !sources.some(s => s.id === id)) || new Set(config.sourceIds).size !== config.sourceIds.length) return "Choose at least one valid source.";
  if (config.competitorIds.some(id => id === config.productId || !products.some(p => p.id === id)) || new Set(config.competitorIds).size !== config.competitorIds.length) return "Choose distinct competitor products.";
  if (![30, 60, 90].includes(config.days) || !["India", "Metro India", "Tier 2 India"].includes(config.market) || !["library", "collect"].includes(config.mode)) return "Choose a valid analysis scope.";
  return null;
}
export function observationsFor(analysis: Pick<Analysis, "config" | "collected">, productId = analysis.config.productId, sourceId: SourceId | "all" = "all"): Observation[] {
  return demoObservations().filter(row => row.productId === productId && analysis.config.sourceIds.includes(row.sourceId) && (sourceId === "all" || row.sourceId === sourceId) && row.day >= 90 - analysis.config.days && (analysis.config.market === "India" || row.market === analysis.config.market) && (!row.batch || analysis.collected));
}
export function summarize(rows: readonly Observation[]): Metrics {
  const result: Metrics = { mentions: 0, reviews: 0, positive: 0, neutral: 0, negative: 0, ratings: [0, 0, 0, 0, 0], score: 0, positivePct: 0, neutralPct: 0, negativePct: 0 };
  for (const row of rows) {
    result.mentions += row.mentions; result.reviews += row.reviews;
    result.positive += row.positive; result.neutral += row.neutral; result.negative += row.negative;
    row.ratings.forEach((n, i) => { result.ratings[i] += n; });
  }
  result.positivePct = pct(result.positive, result.mentions); result.neutralPct = pct(result.neutral, result.mentions); result.negativePct = pct(result.negative, result.mentions);
  result.score = pct(result.positive + result.neutral * .5, result.mentions);
  return result;
}
export function topicSummaries(rows: readonly Observation[]) {
  const total = summarize(rows).mentions;
  return topics.map(topic => {
    const evidence = rows.filter(r => r.topicId === topic.id);
    const metric = summarize(evidence);
    const classification = metric.positivePct >= 68 ? "Strength" : metric.negativePct >= 35 ? "Weakness" : topic.id === "packaging" || topic.id === "availability" ? "Opportunity" : metric.negativePct >= 25 ? "Risk" : "Opportunity";
    return { ...topic, ...metric, importance: pct(metric.mentions, total), classification, evidenceIds: evidence.filter(r => r.mentions).slice(0, 5).map(r => r.id) };
  }).sort((a, b) => b.mentions - a.mentions);
}
export function trendFor(rows: readonly Observation[]) {
  return Array.from({ length: 13 }, (_, week) => ({ week, label: new Date(Date.UTC(2026, 5, 17 + week * 7)).toISOString().slice(5), ...summarize(rows.filter(r => Math.floor(r.day / 7) === week)) })).filter(w => w.mentions > 0);
}
export function suggestVariables(analysis: Pick<Analysis, "config" | "collected">): SuggestedVariable[] {
  const themes = topicSummaries(observationsFor(analysis));
  return ([
    ["packaging", "Packaging Leakage Risk Score", "Variable", "Packaging optimization", "negative"],
    ["taste", "Taste Preference Index", "Constant Variable", "Product positioning", "positive"],
    ["price", "Price Friction Index", "Variable", "Pricing strategy", "negative"],
    ["trust", "Brand Trust Index", "Constant Variable", "Brand positioning", "positive"],
  ] as const).map(([topicId, name, type, impact, sentiment]) => {
    const theme = themes.find(t => t.id === topicId)!;
    return { id: `CI-${topicId}`, name, type, impact, topicId, value: Number((theme[`${sentiment}Pct`] / 100).toFixed(3)), confidence: Math.min(94, 65 + Math.round(Math.sqrt(theme.mentions) / 2)), insight: `${theme[`${sentiment}Pct`].toFixed(1)}% of ${theme.mentions.toLocaleString("en-IN")} ${theme.name.toLowerCase()} mentions are ${sentiment}.`, evidenceIds: theme.evidenceIds, status: "Suggested", usable: false };
  });
}
export function makeAnalysis(projectId: string, config: AnalysisConfig, id: string, createdAt: string): Analysis {
  const invalid = validateConfig(config); if (invalid) throw new Error(invalid);
  const base = { id, projectId, title: `${productFor(config.productId).name} · ${config.market} · ${config.days} days`, createdAt, config: { ...config, competitorIds: [...config.competitorIds], sourceIds: [...config.sourceIds] }, collected: config.mode === "collect", handoff: null };
  return { ...base, variables: suggestVariables(base) };
}
export function initialWorkspace(projectId: string): ConsumerWorkspace {
  const analysis = makeAnalysis(projectId, defaultConfig, "CI-DEMO-01", "2026-09-14T06:30:00.000Z");
  return { version: 1, projectId, activeId: analysis.id, analyses: [analysis] };
}
export function restoreWorkspace(raw: string | null, projectId: string): ConsumerWorkspace {
  if (!raw) return initialWorkspace(projectId);
  try {
    const parsed = JSON.parse(raw) as ConsumerWorkspace;
    if (parsed.version !== 1 || parsed.projectId !== projectId || !Array.isArray(parsed.analyses) || !parsed.analyses.length || parsed.analyses.length > 20 || new Set(parsed.analyses.map(a => a.id)).size !== parsed.analyses.length) throw new Error("Invalid workspace");
    for (const a of parsed.analyses) {
      if (a.projectId !== projectId || typeof a.id !== "string" || typeof a.title !== "string" || !Number.isFinite(Date.parse(a.createdAt)) || typeof a.collected !== "boolean" || !(a.handoff === null || typeof a.handoff === "string") || validateConfig(a.config) || !Array.isArray(a.variables) || a.variables.length !== 4 || new Set(a.variables.map(v => v.id)).size !== 4) throw new Error("Invalid analysis");
      const suggestions = suggestVariables(a);
      for (const v of a.variables) {
        const expected = suggestions.find(s => s.id === v.id);
        if (!expected || v.topicId !== expected.topicId || typeof v.name !== "string" || !v.name.trim() || v.name.length > 100 || !Number.isFinite(v.value) || v.value < 0 || v.value > 1 || !["Variable", "Constant Variable"].includes(v.type) || !["Suggested", "Accepted", "Rejected"].includes(v.status) || typeof v.usable !== "boolean" || (v.usable && v.status !== "Accepted")) throw new Error("Invalid variable");
        Object.assign(v, { confidence: expected.confidence, insight: expected.insight, evidenceIds: expected.evidenceIds, impact: expected.impact });
      }
    }
    if (!parsed.analyses.some(a => a.id === parsed.activeId)) parsed.activeId = parsed.analyses[0].id;
    return parsed;
  } catch { return initialWorkspace(projectId); }
}
export function updateVariable(variable: SuggestedVariable, patch: Partial<Pick<SuggestedVariable, "name" | "value" | "type" | "status" | "usable">>): SuggestedVariable {
  const next = { ...variable, ...patch };
  if (!next.name.trim() || next.name.length > 100 || !Number.isFinite(next.value) || next.value < 0 || next.value > 1) throw new Error("Use a name and a value between 0 and 1.");
  if (patch.name !== undefined || patch.value !== undefined || patch.type !== undefined) { next.status = "Suggested"; next.usable = false; }
  if (next.status !== "Accepted") next.usable = false;
  return next;
}
export const eligibleVariables = (analysis: Analysis) => analysis.variables.filter(v => v.status === "Accepted" && v.usable);
export function handoffPackage(analysis: Analysis) {
  const variables = eligibleVariables(analysis); if (!variables.length) throw new Error("Accept a variable and mark it usable first.");
  return { schemaVersion: 1, projectId: analysis.projectId, analysisId: analysis.id, config: analysis.config, snapshot: SNAPSHOT, target: "Network Optimizer", variables, boundary: "Synthetic consumer indicators prepared locally for human review. No solver input, agent, or canonical taxonomy was modified." };
}
export function summaryInsights(analysis: Analysis) {
  const themes = topicSummaries(observationsFor(analysis));
  const strongest = [...themes].sort((a, b) => b.positivePct - a.positivePct)[0];
  const weakest = [...themes].sort((a, b) => b.negativePct - a.negativePct)[0];
  const rivals = analysis.config.competitorIds.map(id => ({ name: productFor(id).name, ...summarize(observationsFor(analysis, id)) })).sort((a, b) => b.score - a.score);
  const packaging = themes.find(t => t.id === "packaging")!;
  return [
    { label: "What consumers like", text: `${strongest.name} leads with ${strongest.positivePct.toFixed(1)}% positive sentiment. Preserve this attribute in positioning and product changes.` },
    { label: "What consumers dislike", text: `${weakest.name} has ${weakest.negativePct.toFixed(1)}% negative sentiment. Review the underlying phrases before prioritising a response.` },
    { label: "Key risk", text: `Packaging has ${packaging.negativePct.toFixed(1)}% negative sentiment. Review sealing and transit protection as possible contributors in this synthetic evidence set.` },
    { label: "Opportunity", text: "Evaluate pack sealing, refill convenience, and price per serving as separate improvement hypotheses." },
    { label: "Competitor threat", text: rivals.length ? `${rivals[0].name} has the highest selected competitor score (${rivals[0].score.toFixed(1)}/100). Review topic gaps; product audiences differ.` : "No competitors selected. Add a comparison in a new analysis." },
    { label: "Recommended next actions", text: "Validate the top themes with fresh research, review suggested variables, and prepare selected inputs for an optimization discussion." },
  ];
}
export function reportFor(analysis: Analysis) {
  return { schemaVersion: 1, projectId: analysis.projectId, analysisId: analysis.id, product: productFor(analysis.config.productId), config: analysis.config, snapshot: SNAPSHOT, collected: analysis.collected, metrics: summarize(observationsFor(analysis)), topics: topicSummaries(observationsFor(analysis)), competitors: analysis.config.competitorIds.map(id => ({ product: productFor(id).name, ...summarize(observationsFor(analysis, id)) })), insights: summaryInsights(analysis), variables: analysis.variables, boundary: "All mentions, review phrases, sentiment labels, confidence values and recommendations are synthetic. Ratings are a sentiment-intensity proxy, not real star reviews. No scraping, database or AI model ran." };
}
export function variablesCsv(analysis: Analysis): string {
  const escape = (value: unknown) => { const str = String(value); return `"${(/^[=+\-@\t\r\n]/.test(str) ? "'" + str : str).replaceAll('"', '""')}"`; };
  const rows = [["Project", "Analysis", "Variable", "Type", "Value", "Impact area", "Confidence (synthetic %)", "Status", "Usable for optimization", "Evidence IDs"], ...analysis.variables.map(v => [analysis.projectId, analysis.id, v.name, v.type, v.value, v.impact, v.confidence, v.status, v.usable, v.evidenceIds.join("; ")])];
  return rows.map(row => row.map(escape).join(",")).join("\r\n");
}
