import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { describeColumn, empiricalTransitions, processCapability, rowsToCsv } from "../app/statistical-analysis.ts";
import { runSimulation, compactRun, fingerprint } from "../app/simulation-model.ts";
import { osCaseEvidence } from "../app/os-case-evidence.ts";
const source = await readFile(new URL("../app/decision-evidence-model.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"./simulation-model"', JSON.stringify(new URL("../app/simulation-model.ts", import.meta.url).href));
const { attachDecisionRun, decisionRunReadiness, restoreDecisionArtifacts, reviewDecisionRun } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const sample = [1,2,3,4].map((value, i) => ({ value, event_time: `2026-09-0${i + 1}T12:00:00Z` }));
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-9, `${a} != ${b}`);
const s = osCaseEvidence[0].scenario;
const input = { ...s, projectId: osCaseEvidence[0].projectId, paths: 32, seed: 1234, demandVariationPct: 18, alternateAllocationPct: 0, expedite: false, serviceTargetPct: 95, openingPipelineUnits: 0, inventoryUnits: 1e10 };
const run = runSimulation(input, "2026-09-10T12:00:00Z");
const record = () => attachDecisionRun([], input.projectId, "D2-A", ["D2-A", "D2-B"], run)[0];
const draft = (runInput = input, valid = true) => JSON.stringify({ projectId: runInput.projectId, input: runInput, fingerprint: fingerprint(runInput), valid });
const review = (artifact = record(), overrides = {}) => {
 const p = { latest: run, draft: draft(), disposition: "reviewed", note: "Domain evidence and constraints were checked.", reviewer: "reviewer-1", canReview: true, checked: ["Lot eligible", "Origin verified"], required: ["Lot eligible", "Origin verified"], ...overrides };
 return reviewDecisionRun(artifact, p.latest, p.draft, p.disposition, p.note, p.reviewer, p.canReview, p.checked, p.required, "2026-09-10T12:00:00Z");
};
test("statistics calculate sample SD and central 90 percent from actual rows", () => {
 const r = describeColumn(sample, "value");
 assert.equal(r.n,4); assert.equal(r.mean,2.5); close(r.sd, Math.sqrt(5/3));
 close(r.p05,1.15); close(r.p95,3.85); assert.equal(r.bins.reduce((n,b)=>n+b.count,0),4);
 assert.equal(describeColumn(sample.filter(r => r.value >= 3), "value").mean,3.5);
});
test("empty, constant and nonnumeric samples do not invent metrics", () => {
 assert.equal(describeColumn([], "value").mean,null); assert.equal(describeColumn([{value:1}], "value").sd,null);
 const r=describeColumn([{value:3},{value:3},{value:NaN},{value:"unknown"}],"value");
 assert.equal(r.n,2); assert.equal(r.missing,2); assert.equal(r.sd,0); assert.equal(r.bins.length,1); assert.equal(r.bins[0].count,2);
});
test("transitions use event order and empty rows remain unavailable", () => {
 const r=empiricalTransitions([...sample].reverse(),"value");
 assert.deepEqual(r.counts,[[0,1,0],[0,1,1],[0,0,0]]);
 assert.deepEqual(r.probabilities[2],[null,null,null]); assert.equal(r.transitions,3);
 assert.equal(empiricalTransitions([],"value").transitions,0);
 for (const row of r.probabilities.filter(row => row[0] !== null)) close(row.reduce((a,b)=>a+b,0),1);
});
test("Pp/Ppk use overall sample SD and explicit valid limits", () => {
 const r=processCapability(sample,"value",0,5);
 close(r.pp,5/(6*Math.sqrt(5/3))); close(r.ppk,2.5/(3*Math.sqrt(5/3))); assert.equal(r.outside,0);
 assert.throws(()=>processCapability(sample,"value",4,2),/lower/);
 assert.throws(()=>processCapability([{value:1},{value:1}],"value",0,5),/distinct/);
 assert.equal(processCapability(sample,"value",2,3).outside,2);
});
test("CSV contains exactly filtered sample rows with escaped text", () => {
 const csv=rowsToCsv([{value:3,note:'a,"quoted"'}],["value","note"]);
 assert.equal(csv, '"value","note"\r\n"3","a,""quoted"""');
});
test("tool attachment is project-scoped, immutable and idempotent", () => {
 const a=record(); assert.equal(a.projectId,input.projectId); assert.equal(a.run.id,run.id);
 assert.equal(attachDecisionRun([a], input.projectId,"D2-A",["D2-A"],run).length,1);
 assert.throws(()=>attachDecisionRun([], "other","D2-A",["D2-A"],run),/project/);
 assert.throws(()=>attachDecisionRun([], input.projectId,"unknown",["D2-A"],run),/project/);
 a.run.input.inventoryUnits=0; assert.equal(run.input.inventoryUnits,1e10);
});
test("changed inputs, invalid drafts and newer runs stale attached evidence", () => {
 const a=record(); assert.equal(decisionRunReadiness(a,run,draft()).numericReady,true);
 assert.equal(decisionRunReadiness(a,run,draft({...input, demandSurgePct:21})).current,false);
 assert.equal(decisionRunReadiness(a,run,draft(input,false)).current,false);
 assert.equal(decisionRunReadiness(a,run,"{broken").current,false);
 const newer=runSimulation({...input,seed:2345},"2026-09-10T13:00:00Z");
 assert.equal(decisionRunReadiness(a,newer,draft()).current,false);
 assert.equal(decisionRunReadiness(a,null,null).current,false);
});
test("reviews require role, current numerical gates and every domain constraint", () => {
 assert.equal(run.targetPassed,true); assert.equal(run.budgetPassed,true);
 assert.throws(()=>review(record(),{canReview:false}),/role/);
 assert.throws(()=>review(record(),{checked:["Lot eligible"]}),/every domain/);
 assert.throws(()=>review(record(),{required:[]}),/every domain/);
 assert.throws(()=>review(record(),{note:"ok"}),/rationale/);
 assert.throws(()=>review(record(),{draft:draft({...input,seed:42})}),/Inputs changed/);
 const failed={...record(),run:{...run,targetPassed:false}};
 assert.throws(()=>review(failed),/service/);
 assert.throws(()=>review({...record(),run:{...run,budgetPassed:false}}),/budget/);
 const revised=review(failed,{disposition:"revise"}); assert.equal(revised.reviews[0].disposition,"revise");
});
test("review audit is retained, expires in 24h and remains bound to exact run", () => {
 const first=review(); const second=review(first,{disposition:"revise",note:"Check the qualification window again."});
 assert.equal(first.reviews.length,1); assert.equal(second.reviews.length,2);
 assert.equal(first.reviews[0].expiresAt,"2026-09-11T12:00:00.000Z"); assert.equal(first.reviews[0].runId,run.id);
});
test("restored evidence rejects cross-project data and recomputes tampered values", () => {
 const a=review(); const saved={...a,run:{...compactRun(run),protectedLoss:9e99,targetPassed:false}};
 const restored=restoreDecisionArtifacts(JSON.stringify([saved]),input.projectId);
 assert.equal(restored.length,1); assert.equal(restored[0].run.protectedLoss,run.protectedLoss); assert.equal(restored[0].run.targetPassed,run.targetPassed);
 assert.equal(restored[0].reviews.length,1);
 assert.deepEqual(restoreDecisionArtifacts(JSON.stringify([saved]),"other-project"),[]);
 assert.deepEqual(restoreDecisionArtifacts("{bad",input.projectId),[]);
});
