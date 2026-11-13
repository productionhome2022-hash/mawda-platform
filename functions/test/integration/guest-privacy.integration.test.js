const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  recordPrivacyAcknowledgement,
  getPrivacyAcknowledgementStatus,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const data = (actorType) => ({
  policyVersion: "2026-11-12.1",
  policyHash: "196df486af97258e3caa12edb1f2a125f5a0e7634549811d32286932ceccfd8c",
  locale: "ar",
  actorType,
  appVersion: "1.0.0+1",
});
const request = (uid, provider, payload = {}) => ({
  data: payload,
  auth: { uid, token: { firebase: { sign_in_provider: provider } } },
});

test("anonymous guests must acknowledge as guests and cannot use member acknowledgement", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `guest_${suffix()}`;
  const ref = db.collection("privacyAcknowledgements").doc(`${uid}_2026-11-12.1`);
  try {
    const accepted = await recordPrivacyAcknowledgement.run(request(uid, "anonymous", data("guest")));
    assert.equal(accepted.acknowledged, true);
    const status = await getPrivacyAcknowledgementStatus.run(request(uid, "anonymous"));
    assert.equal(status.acknowledged, true);
    await assert.rejects(
      () => recordPrivacyAcknowledgement.run(request(uid, "anonymous", data("member"))),
      (error) => error && error.code === "permission-denied",
    );
    const memberStatus = await getPrivacyAcknowledgementStatus.run(request(uid, "password"));
    assert.equal(memberStatus.acknowledged, false);
    assert.equal((await ref.get()).data().actorType, "guest");
  } finally {
    await ref.delete().catch(() => undefined);
  }
});

test("password-authenticated members must acknowledge as members", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `member_${suffix()}`;
  const ref = db.collection("privacyAcknowledgements").doc(`${uid}_2026-11-12.1`);
  try {
    const accepted = await recordPrivacyAcknowledgement.run(request(uid, "password", data("member")));
    assert.equal(accepted.acknowledged, true);
    const status = await getPrivacyAcknowledgementStatus.run(request(uid, "password"));
    assert.equal(status.acknowledged, true);
    await assert.rejects(
      () => recordPrivacyAcknowledgement.run(request(uid, "password", data("guest"))),
      (error) => error && error.code === "permission-denied",
    );
    assert.equal((await ref.get()).data().actorType, "member");
  } finally {
    await ref.delete().catch(() => undefined);
  }
});
