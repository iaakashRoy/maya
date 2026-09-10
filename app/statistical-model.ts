import { caseStudyProfileFor, type CaseStudyDataset } from "./case-study-model";
import type { WorkspaceProject } from "./workspace-model";

export type StatisticalColumnProfile = {
  id: string;
  name: string;
  type: "number" | "timestamp";
  unit: string;
  mean: number;
  standardDeviation: number;
  p05: number;
  p50: number;
  p95: number;
  missingPercent: number;
  distribution: string;
  fitScore: number;
};

export type StatisticalTableProfile = {
  id: string;
  tableNodeId: string;
  projectId: string;
  projectCode: string;
  client: string;
  project: string;
  name: string;
  source: string;
  grain: string;
  rows: string;
  freshness: string;
  quality: number;
  missingPercent: number;
  driftScore: number;
  stationarity: string;
  bestFit: string;
  columns: readonly StatisticalColumnProfile[];
  sampleRows: readonly Record<string, string | number>[];
};

const distributions = [
  "Normal",
  "Lognormal",
  "Weibull",
  "Gamma",
  "Beta",
  "Poisson",
  "Negative binomial",
  "Student-t",
  "Gaussian mixture",
  "Markov-modulated",
] as const;

function hashOf(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

function compactId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function numericColumn(project: WorkspaceProject, dataset: CaseStudyDataset, variable: string, index: number): StatisticalColumnProfile {
  const hash = hashOf(`${project.id}|${dataset.name}|${variable}|${index}`);
  const mean = Number((18 + (hash % 8400) / 37).toFixed(2));
  const standardDeviation = Number(Math.max(0.35, mean * (0.04 + ((hash >>> 7) % 23) / 100)).toFixed(2));
  const p50 = Number((mean * (0.97 + ((hash >>> 13) % 7) / 100)).toFixed(2));
  return {
    id: variable,
    name: variable,
    type: "number",
    unit: "fixture index",
    mean,
    standardDeviation,
    p05: Number(Math.max(0, p50 - standardDeviation * 1.64).toFixed(2)),
    p50,
    p95: Number((p50 + standardDeviation * 1.64).toFixed(2)),
    missingPercent: Number((((hash >>> 17) % 22) / 10).toFixed(1)),
    distribution: distributions[(hash >>> 3) % distributions.length],
    fitScore: 82 + ((hash >>> 11) % 17),
  };
}

function valueAt(column: StatisticalColumnProfile, rowIndex: number, salt: number) {
  const wave = Math.sin((rowIndex + 1) * (salt % 7 + 2) * 0.61) * column.standardDeviation;
  const pulse = (((rowIndex * (salt % 11 + 3)) % 13) - 6) * column.standardDeviation * 0.11;
  return Number(Math.max(0, column.mean + wave + pulse).toFixed(2));
}

export function statisticalRowsFor(table: StatisticalTableProfile, count = 72) {
  return Array.from({ length: count }, (_, rowIndex) => {
    const row: Record<string, string | number> = {
      record_id: `${table.projectCode}-R-${String(rowIndex + 1).padStart(5, "0")}`,
      event_time: `2026-09-${String(1 + (rowIndex % 7)).padStart(2, "0")}T${String(7 + (rowIndex % 12)).padStart(2, "0")}:${String((rowIndex * 7) % 60).padStart(2, "0")}:00+05:30`,
    };
    table.columns.forEach((column, columnIndex) => {
      row[column.id] = valueAt(column, rowIndex, hashOf(`${table.id}|${column.id}|${columnIndex}`));
    });
    return row;
  });
}

export function statisticalProfilesFor(project: WorkspaceProject): readonly StatisticalTableProfile[] {
  const profile = caseStudyProfileFor(project);
  if (!profile) return [];
  return profile.datasets.map((dataset, datasetIndex) => {
    const id = `${project.code}-TABLE-${String(datasetIndex + 1).padStart(2, "0")}`;
    const variables = [...dataset.variables, `${project.code}-OBS-${String(datasetIndex + 1).padStart(2, "0")}`];
    const columns = variables.map((variable, columnIndex) => numericColumn(project, dataset, variable, columnIndex));
    const seed = hashOf(`${project.id}|${dataset.name}`);
    const table: StatisticalTableProfile = {
      id: compactId(id),
      tableNodeId: id,
      projectId: project.id,
      projectCode: project.code,
      client: project.client,
      project: project.name,
      name: dataset.name,
      source: dataset.source,
      grain: dataset.grain,
      rows: dataset.rows,
      freshness: dataset.freshness,
      quality: dataset.quality,
      missingPercent: Number((((seed >>> 7) % 24) / 10).toFixed(1)),
      driftScore: 7 + ((seed >>> 12) % 67),
      stationarity: (seed >>> 5) % 3 === 0 ? "Difference required" : (seed >>> 5) % 3 === 1 ? "Locally stationary" : "Regime-sensitive",
      bestFit: columns[0].distribution,
      columns,
      sampleRows: [],
    };
    return { ...table, sampleRows: statisticalRowsFor(table, 5) };
  });
}

export function statisticalProfileForNode(project: WorkspaceProject, nodeId: string) {
  return statisticalProfilesFor(project).find((table) => table.tableNodeId === nodeId || table.id === nodeId);
}
