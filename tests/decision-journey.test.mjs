import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeDataset, approvalCurrent, basisId, calculatePlans, caseStudies, createJourney,
  currentPlan, datasetId, findCase, proposeRevision, publishDataset, releaseCurrent,
  releaseDecision, reviewDecision, runAlternatives, runCurrent, sampleRows,
  summarize, toCsv, validateCsv,
} from "../app/decision-journey/journey-model.ts";

const time = "2026-09-08T12:00:00.000Z";
const run = () => runAlternatives(analyzeDataset(publishDataset(createJourney())));
const proposal = () => proposeRevision(run(), "Qualified capacity meets budget and both service gates.", time);
const approved = () => reviewDecision(proposal(), "Reviewer", "approved", "Reviewed base and compound stress with residual risk noted.", time);

test("all ten client cases have distinct valid data and scoped constraints", () => {
  assert.equal(caseStudies.length, 10);
  assert.equal(new Set(caseStudies.map(c => c.project)).size, 10);
  assert.equal(new Set(caseStudies.map(c => toCsv(sampleRows(c)))).size, 10);
  for (const c of caseStudies) {
    const s = createJourney(c.id);
    const result = validateCsv(s.csv, c);
    assert.equal(result.rows.length, 12);
    assert.equal(result.issues.length, 0, c.company);
    assert.equal(result.total, 12);
    assert.ok(c.constraint.length > 30);
    assert.equal(result.rows[0].unit, c.unit);
  }
});
test("unknown projects fail closed rather than use another client", () => {
  assert.equal(findCase("not-a-client"), undefined);
  assert.throws(() => createJourney("not-a-client"), /Unknown project/);
});
test("round-trip CSV exactly preserves the displayed observations", () => {
  const c = findCase("apple");
  assert.deepEqual(validateCsv(toCsv(sampleRows(c)), c).rows, sampleRows(c));
});
test("invalid unit row is quarantined and prevents publishing", () => {
  const s = createJourney();
  s.csv += "\n13,100,80,20,12,wrong-unit";
  const result = validateCsv(s.csv, findCase("apple"));
  assert.equal(result.total, 13);
  assert.equal(result.rows.length, 12);
  assert.match(result.issues[0].reason, /Unit mismatch/);
  assert.equal(publishDataset(s).published, null);
});
test("schema, blank values, duplicate weeks, discontinuity and infinity are rejected", () => {
  const c = findCase("apple");
  const csv = toCsv(sampleRows(c));
  for (const invalid of ["wrong\n1,2", csv.replace("9200", "Infinity"), csv.replace("1,9200", "1,"), csv.replace("2,10200", "1,10200"), csv.replace("2,10200", "20,10200")]) {
    assert.ok(validateCsv(invalid, c).issues.length > 0, invalid);
  }
});
test("insufficient rows cannot become a published decision basis", () => {
  const s = createJourney();
  s.csv = s.csv.split("\n").slice(0, 4).join("\n");
  assert.equal(publishDataset(s).published, null);
});
test("statistics use actual records and sample SD; P05–P95 is central 90 percent", () => {
  const rows = [1, 2, 3, 4, 5].map(leadDays => ({ leadDays }));
  const stats = summarize(rows);
  assert.equal(stats.mean, 3);
  assert.equal(stats.sd, Math.sqrt(2.5));
  assert.equal(stats.p05, 1.2);
  assert.equal(stats.p95, 4.8);
  const s = analyzeDataset(publishDataset(createJourney()));
  assert.equal(s.artifact.dataset, datasetId(s));
  assert.match(s.artifact.limitations, /Central 90%/);
  assert.equal(s.artifact.n, 12);
});
test("data publishing and statistics are required before alternatives run", () => {
  const s = createJourney();
  assert.equal(analyzeDataset(s).artifact, null);
  assert.equal(runAlternatives(s).runBasis, null);
  assert.equal(runAlternatives(publishDataset(s)).runBasis, null);
  assert.ok(runCurrent(run()));
});
test("statistical lead-time results actually affect downstream allocation", () => {
  const c = findCase("apple");
  const rows = sampleRows(c);
  const a = createJourney().assumptions;
  const early = calculatePlans(c, rows.map(r => ({ ...r, leadDays: 7 })), a)[2];
  const late = calculatePlans(c, rows.map(r => ({ ...r, leadDays: 40 })), a)[2];
  assert.ok(early.service > late.service);
  assert.ok(early.cost > late.cost);
  assert.equal(late.weekly[0].alternate, 0);
});
test("weekly material balance and protected value reconcile", () => {
  for (const c of caseStudies) {
    const s = createJourney(c.id);
    const plans = calculatePlans(c, sampleRows(c), s.assumptions);
    for (const plan of plans) {
      let stock = c.inventory;
      for (const row of plan.weekly) {
        assert.equal(stock + row.base + row.alternate - row.delivered, row.endingInventory);
        assert.equal(row.demand - row.delivered, row.missed);
        assert.ok(row.endingInventory >= 0);
        stock = row.endingInventory;
      }
      assert.equal(plan.protectedValue, (plans[0].missed - plan.missed) * c.margin);
      assert.ok(plan.stressService <= plan.service);
    }
  }
});
test("Apple pilot has a feasible baseline and crisis escalation can be infeasible", () => {
  const s = run();
  assert.equal(currentPlan(s).feasible, true);
  const crisis = { ...s, assumptions: { ...s.assumptions, shock: 90, budget: 0 } };
  const options = calculatePlans(findCase("apple"), sampleRows(findCase("apple")), crisis.assumptions);
  assert.ok(options.every(plan => !plan.feasible));
  assert.ok(options[2].failures.length >= 2);
});
test("runs are deterministic for identical data and assumptions", () => {
  assert.deepEqual(run(), run());
  assert.equal(basisId(run()), basisId(run()));
});
test("new revision retains parent, data and immutable input snapshot", () => {
  const first = proposal();
  const second = proposeRevision(first, "Documented alternative selection.", time);
  assert.equal(second.revisions[1].parent, "D-1");
  second.assumptions.shock = 90;
  assert.equal(second.revisions[0].snapshot.assumptions.shock, 22);
  assert.equal(second.revisions[0].snapshot.csv, first.csv);
});
test("role rehearsal blocks analyst approval and operator approval", () => {
  const s = proposal();
  for (const role of ["Analyst", "Operator"]) assert.equal(reviewDecision(s, role, "approved", "Test", time).approval, null);
  assert.equal(reviewDecision(s, "Reviewer", "approved", "", time).approval, null);
});
test("data and assumption changes stale the run and approval", () => {
  const s = approved();
  assert.ok(approvalCurrent(s, time));
  const changed = { ...s, assumptions: { ...s.assumptions, shock: 60 } };
  assert.equal(runCurrent(changed), false);
  assert.ok(!approvalCurrent(changed, time));
  const changedData = { ...s, csv: s.csv.replace("9200", "9300") };
  assert.notEqual(datasetId(changedData), s.published);
  assert.ok(!approvalCurrent(changedData, time));
});
test("selection and new revision invalidate an existing approval", () => {
  const s = approved();
  assert.ok(!approvalCurrent({ ...s, selectedPlan: "baseline" }, time));
  assert.ok(!approvalCurrent(proposeRevision(s, "New risk rationale.", time), time));
});
test("rejection, expiry and infeasibility block release", () => {
  const s = approved();
  const rejected = reviewDecision(s, "Reviewer", "rejected", "Request stronger evidence.", time);
  assert.ok(!approvalCurrent(rejected, time));
  assert.ok(!approvalCurrent(s, "2026-09-09T12:00:01Z"));
  assert.equal(releaseDecision(rejected, "Operator", time).releasedBasis, null);
  const crisis = runAlternatives({ ...s, assumptions: { ...s.assumptions, shock: 100 } });
  const proposed = proposeRevision(crisis, "Unsafe request", time);
  assert.notEqual(reviewDecision(proposed, "Reviewer", "approved", "Should fail", time).approval?.revisionId, proposed.revisions.at(-1).id);
});
test("approved release is operator-only and idempotent", () => {
  const s = approved();
  assert.equal(releaseDecision(s, "Reviewer", time).releasedBasis, null);
  const released = releaseDecision(s, "Operator", time);
  assert.ok(releaseCurrent(released, time));
  assert.deepEqual(releaseDecision(released, "Operator", time), released);
  assert.ok(!releaseCurrent({ ...released, assumptions: { ...released.assumptions, budget: 1 } }, time));
});
