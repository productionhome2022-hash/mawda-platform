const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  submitSafetyReport,
  submitSafetyAppeal,
  getMySafetyCases,
  listSafetyCases,
  reviewSafetyCase,
  listSafetyAppeals,
  reviewSafetyAppeal,
} = require("../../lib/index");

const db = getFirestore();
const tag = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const memberRequest = (uid, data = {}) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const ownerRequest = (data = {}) => ({
  data,
  auth: {
    uid: "platform_owner_safety_test",
    token: {
      platformOwner: true,
      auth_time: Math.floor(Date.now() / 1000),
      firebase: { sign_in_provider: "custom", sign_in_second_factor: "phone" },
    },
  },
});

test("safety report, owner decision, member appeal and owner appeal resolution are private and idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = tag();
  const reporterUid = `reporter_${suffix}`;
  const subjectUid = `subject_${suffix}`;
  const requestId = `report_${suffix}`;
  const caseId = createHash("sha256").update(`${reporterUid}:${requestId}`).digest("hex");
  const appealId = `${caseId}_${subjectUid}`;
  const reporterRef = db.collection("users").doc(reporterUid);
  const subjectRef = db.collection("users").doc(subjectUid);
  const caseRef = db.collection("safetyCases").doc(caseId);
  const appealRef = db.collection("safetyAppeals").doc(appealId);

  await Promise.all([
    reporterRef.set({ profileCompleted: true, accountStatus: "active" }),
    subjectRef.set({ profileCompleted: true, accountStatus: "active" }),
  ]);
  try {
    const reportPayload = {
      targetUid: subjectUid,
      category: "harassment",
      contextType: "member",
      contextId: null,
      description: "Repeated unwanted and threatening contact.",
      requestId,
    };
    const first = await submitSafetyReport.run(memberRequest(reporterUid, reportPayload));
    const replay = await submitSafetyReport.run(memberRequest(reporterUid, reportPayload));
    assert.equal(first.duplicate, false);
    assert.equal(replay.duplicate, true);
    assert.equal((await caseRef.get()).data().status, "open");

    const ownerQueue = await listSafetyCases.run(ownerRequest({ status: "open", limit: 50 }));
    assert.ok(ownerQueue.cases.some((item) => item.caseId === caseId));

    await reviewSafetyCase.run(ownerRequest({
      caseId, decision: "action_taken", reason: "The evidence supports an enforcement action.",
    }));
    const memberView = await getMySafetyCases.run(memberRequest(subjectUid));
    assert.ok(memberView.decisions.some((item) => item.caseId === caseId));

    const appealPayload = {
      caseId,
      reason: "I dispute the decision and request a fresh review of the evidence.",
      requestId: `appeal_${suffix()}`,
    };
    const appeal = await submitSafetyAppeal.run(memberRequest(subjectUid, appealPayload));
    const appealReplay = await submitSafetyAppeal.run(memberRequest(subjectUid, appealPayload));
    assert.equal(appeal.duplicate, false);
    assert.equal(appealReplay.duplicate, true);
    assert.equal((await appealRef.get()).data().status, "pending");

    const appealQueue = await listSafetyAppeals.run(ownerRequest());
    assert.ok(appealQueue.appeals.some((item) => item.appealId === appealId));

    await reviewSafetyAppeal.run(ownerRequest({
      appealId, decision: "accepted", reason: "The original evidence did not meet the policy threshold.",
    }));
    assert.equal((await appealRef.get()).data().status, "accepted");
    assert.equal((await caseRef.get()).data().status, "dismissed");

    await assert.rejects(
      () => listSafetyCases.run(memberRequest(reporterUid)),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([
      reporterRef.delete().catch(() => undefined),
      subjectRef.delete().catch(() => undefined),
      caseRef.delete().catch(() => undefined),
      appealRef.delete().catch(() => undefined),
    ]);
  }
});
