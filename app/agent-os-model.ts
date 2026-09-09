import { fingerprint, type SimulationRun } from "./simulation-model";

export type SourceDraft = { id: string; projectId: string; kind: "Desktop agent" | "Enterprise API" | "IoT device"; name: string; allowlist: string; approved: boolean; enabled: boolean; createdAt: string; deviceId?: string; min?: number; max?: number };
export type TelemetryEvent = { id: string; projectId: string; deviceId: string; sequence: number; observedAt: string; receivedAt: string; value: number; unit: string; disposition: "accepted" | "quarantined"; reason: string };
export type SkillFeedback = { id: string; runId: string; projectId: string; predictedService: number; observedService: number; note: string; createdAt: string; evidenceKind: "user-entered rehearsal" };
export type Worker = { id: string; role: string; state: "running" | "queued" | "expired"; leaseMinutes: number; permissions: string[] };
export type OsProjectState = { sources: SourceDraft[]; events: TelemetryEvent[]; feedback: SkillFeedback[]; workerLimit: number; champion: string; activity: string[] };
export const osStorageKey = (id: string) => `tanjnx.agent-os.v1.${id}`;
export const emptyOsProject = (): OsProjectState => ({ sources: [], events: [], feedback: [], workerLimit: 3, champion: "continuity-review@1.0", activity: [] });

export const serializeOsProject = (state: OsProjectState, projectId: string) => JSON.stringify({ schemaVersion: 1, projectId, state });

/** Browser storage is untrusted and may contain old or damaged records. */
export function restoreOsProject(raw: string | null, projectId: string): OsProjectState {
  const clean = emptyOsProject();
  try {
    const envelope = JSON.parse(raw ?? "null");
    if (!envelope || envelope.schemaVersion !== 1 || envelope.projectId !== projectId) return clean;
    const value = envelope.state as OsProjectState | null;
    if (!value || typeof value !== "object") return clean;
    const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
    clean.sources = Array.isArray(value.sources) ? value.sources.filter((s) => s && s.projectId === projectId && typeof s.id === "string" && typeof s.name === "string" && typeof s.allowlist === "string" && typeof s.createdAt === "string" && ["Desktop agent", "Enterprise API", "IoT device"].includes(s.kind) && s.approved === true && typeof s.enabled === "boolean" && (s.kind !== "IoT device" || (typeof s.deviceId === "string" && finite(s.min) && finite(s.max) && s.min! < s.max!))) : [];
    clean.events = Array.isArray(value.events) ? value.events.filter((e) => e && e.projectId === projectId && typeof e.id === "string" && typeof e.deviceId === "string" && typeof e.reason === "string" && typeof e.observedAt === "string" && typeof e.receivedAt === "string" && e.unit === "°C" && Number.isInteger(e.sequence) && finite(e.value) && ["accepted", "quarantined"].includes(e.disposition)) : [];
    clean.feedback = Array.isArray(value.feedback) ? value.feedback.filter((f) => f && f.projectId === projectId && typeof f.id === "string" && typeof f.runId === "string" && typeof f.note === "string" && typeof f.createdAt === "string" && finite(f.predictedService) && finite(f.observedService) && f.observedService >= 0 && f.observedService <= 100 && f.evidenceKind === "user-entered rehearsal") : [];
    clean.activity = Array.isArray(value.activity) ? value.activity.filter((item) => typeof item === "string").slice(0, 30) : [];
    clean.workerLimit = finite(value.workerLimit) ? Math.max(1, Math.min(6, Math.floor(value.workerLimit))) : 3;
    clean.champion = value.champion === "continuity-review@1.1-shadow" ? value.champion : clean.champion;
    return clean;
  } catch { return clean; }
}

export function createSourceDraft(input: Omit<SourceDraft, "id" | "enabled" | "createdAt">, now = new Date().toISOString()): SourceDraft {
  if (!input.projectId || !input.name.trim() || !input.allowlist.trim() || !input.approved) throw new Error("Name, exact allowed scope, and source-owner approval are required.");
  if (/^(\*|\/|[a-z]:\\?)$/i.test(input.allowlist.trim())) throw new Error("Choose specific folders, tables, or topics, not an entire drive or wildcard.");
  if (input.kind === "IoT device" && (!input.deviceId?.trim() || !Number.isFinite(input.min) || !Number.isFinite(input.max) || input.min! >= input.max!)) throw new Error("Device identity and an ordered acceptable measurement range are required.");
  return { ...input, name: input.name.trim(), id: `DRAFT-${fingerprint({ ...input, now })}`, enabled: false, createdAt: now };
}
export function collectorManifest(source: SourceDraft) {
  return { schemaVersion: 1, mode: "configuration-draft-only", client: "tanjnx", projectId: source.projectId, installation: "Installer and enrollment service are not connected", source: { kind: source.kind, name: source.name, allowlist: source.allowlist }, permissions: { read: true, write: false, delete: false, shellExecution: false }, consent: { ownerApprovalAcknowledged: source.approved, serverVerified: false }, transport: { direction: "outbound-only", endpoint: null, mutualTLS: "required in production" }, handling: { redactBeforeUpload: true, retentionDays: 30, exclude: ["credentials", "personal folders", "private keys"], checkpointedReplay: true }, chat: { cloudProviderConfigured: false, toolApproval: "required", localSessionSync: "planned" }, device: source.deviceId ? { id: source.deviceId, expectedUnit: "°C", range: [source.min, source.max], credentialEnrolled: false } : undefined };
}
export function ingestSample(source: SourceDraft, prior: TelemetryEvent[], raw: string, now = new Date().toISOString()): TelemetryEvent {
  if (source.kind !== "IoT device" || !source.enabled) throw new Error("Enable sample ingestion for a registered device draft first.");
  const payload = JSON.parse(raw) as Record<string, unknown>;
  if (!payload || typeof payload !== "object" || typeof payload.id !== "string" || !payload.id.trim() || payload.id.length > 120 || payload.deviceId !== source.deviceId || !Number.isInteger(payload.sequence) || Number(payload.sequence) < 0 || typeof payload.value !== "number" || !Number.isFinite(payload.value) || payload.unit !== "°C" || typeof payload.observedAt !== "string" || !Number.isFinite(Date.parse(payload.observedAt))) throw new Error("Expected matching deviceId, unique id, nonnegative integer sequence, ISO observedAt, finite value, and unit °C.");
  const scoped = prior.filter((event) => event.projectId === source.projectId && event.deviceId === source.deviceId);
  if (scoped.some((event) => event.id === payload.id || event.sequence === payload.sequence)) throw new Error("Duplicate event or sequence ignored. Existing evidence was not overwritten.");
  const age = Date.parse(now) - Date.parse(payload.observedAt as string);
  const outOfOrder = scoped.some((event) => event.disposition === "accepted" && event.sequence > Number(payload.sequence));
  const excursion = payload.value < source.min! || payload.value > source.max!;
  const reason = age < -60000 ? "Future timestamp" : age > 15 * 60000 ? "Stale by more than 15 minutes" : outOfOrder ? "Out-of-order sequence" : excursion ? "Measurement outside approved range; human review required" : "Schema, identity, freshness, ordering and range checks passed";
  return { id: payload.id, projectId: source.projectId, deviceId: source.deviceId!, sequence: Number(payload.sequence), observedAt: payload.observedAt as string, receivedAt: now, value: payload.value, unit: payload.unit, disposition: reason.endsWith("passed") ? "accepted" : "quarantined", reason };
}
export function scheduleWorkers(limit: number, active: boolean): Worker[] {
  const slots = Math.max(1, Math.min(6, Number.isFinite(limit) ? Math.floor(limit) : 1));
  return ["Evidence quality", "Distribution analysis", "Disruption simulation", "Constraint review", "Cost comparison", "Decision package"].map((role, index) => ({ id: `task-${index + 1}`, role, state: !active ? "expired" : index < slots ? "running" : "queued", leaseMinutes: 15, permissions: ["read:project-snapshot", "write:run-artifacts"] }));
}
export function recordFeedback(run: SimulationRun, service: number, note: string, now = new Date().toISOString()): SkillFeedback {
  if (!Number.isFinite(service) || service < 0 || service > 100 || note.trim().length < 12) throw new Error("Provide actual service from 0–100 and an outcome note of at least 12 characters.");
  return { id: `FB-${fingerprint({ run: run.id, now })}`, runId: run.id, projectId: run.projectId, predictedService: run.response.service.mean, observedService: service, note: note.trim(), createdAt: now, evidenceKind: "user-entered rehearsal" };
}
export function evaluateSkill(feedback: SkillFeedback[]) {
  const unique = [...new Map(feedback.map((item) => [item.runId, item])).values()];
  const mae = unique.length ? unique.reduce((sum, item) => sum + Math.abs(item.predictedService - item.observedService), 0) / unique.length : null;
  return { examples: unique.length, mae, shadowEligible: unique.length >= 3 && mae !== null && mae <= 5, productionEligible: false, reason: unique.length < 3 ? "Needs outcomes from at least three distinct runs" : mae! > 5 ? "Mean service error exceeds the 5-point demonstration gate" : "Eligible for a local shadow draft only. Independent validation and authorization remain required." };
}
