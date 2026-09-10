export type SampleRow = Record<string, string | number>;

export function empiricalQuantile(values: number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * p, lo = Math.floor(position);
  return sorted[lo] + (sorted[Math.ceil(position)] - sorted[lo]) * (position - lo);
}

/** Describes the materialized sample, never an unqueried registry row count. */
export function describeColumn(rows: readonly SampleRow[], column: string) {
  const values = rows.map((row) => row[column]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const n = values.length, mean = n ? values.reduce((a, b) => a + b, 0) / n : null;
  const sd = n > 1 ? Math.sqrt(values.reduce((a, b) => a + (b - mean!) ** 2, 0) / (n - 1)) : null;
  const min = n ? Math.min(...values) : null, max = n ? Math.max(...values) : null;
  const bins = n ? Array.from({ length: min === max ? 1 : 8 }, (_, i) => {
    const width = (max! - min!) / 8;
    return { from: min! + width * i, to: min === max ? max! : min! + width * (i + 1), count: values.filter((v) => min === max || (v >= min! + width * i && (i === 7 ? v <= max! : v < min! + width * (i + 1)))).length };
  }) : [];
  return { n, missing: rows.length - n, mean, sd, min, max, p05: empiricalQuantile(values, .05), p50: empiricalQuantile(values, .5), p95: empiricalQuantile(values, .95), bins };
}

/** Transition counts use observed event-time order, not a preset matrix. */
export function empiricalTransitions(rows: readonly SampleRow[], column: string) {
  const summary = describeColumn(rows, column);
  const ordered = rows.filter((r) => Number.isFinite(Date.parse(String(r.event_time))) && typeof r[column] === "number" && Number.isFinite(r[column])).toSorted((a, b) => Date.parse(String(a.event_time)) - Date.parse(String(b.event_time)));
  const counts = [[0,0,0],[0,0,0],[0,0,0]];
  const state = (value: number) => value < summary.mean! - (summary.sd ?? 0) ? 0 : value > summary.mean! + (summary.sd ?? 0) ? 2 : 1;
  for (let i = 1; i < ordered.length; i++) counts[state(Number(ordered[i - 1][column]))][state(Number(ordered[i][column]))]++;
  return { counts, transitions: Math.max(0, ordered.length - 1), probabilities: counts.map((row) => { const total = row.reduce((a, b) => a + b, 0); return row.map((count) => total ? count / total : null); }), lower: summary.mean === null ? null : summary.mean - (summary.sd ?? 0), upper: summary.mean === null ? null : summary.mean + (summary.sd ?? 0) };
}

export function processCapability(rows: readonly SampleRow[], column: string, lower: number, upper: number) {
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower >= upper) throw new Error("Enter finite lower and upper specification limits, with lower < upper.");
  const s = describeColumn(rows, column);
  if (s.n < 2 || !s.sd) throw new Error("At least two distinct numeric observations are required.");
  return { pp: (upper - lower) / (6 * s.sd), ppk: Math.min(upper - s.mean!, s.mean! - lower) / (3 * s.sd), outside: rows.filter((row) => typeof row[column] === "number" && Number.isFinite(row[column]) && (Number(row[column]) < lower || Number(row[column]) > upper)).length };
}

export function rowsToCsv(rows: readonly SampleRow[], columns: readonly string[]) {
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [columns.map(escape).join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
}
