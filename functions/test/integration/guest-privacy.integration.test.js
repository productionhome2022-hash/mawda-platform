const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  recordPrivacyAcknowledgement,
  getPrivacyAcknowledgementStatus,
} = require("../../lib/index");

const { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_HASH } = require("../../lib/privacy-acknowledgement");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const data = (actorType) => ({
  policyVersion: PRIVACY_POLICY_VERSION,
  policyHash: PRIVACY_POLICY_HASH,
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
  const ref = db.collection("privacyAcknowledgements").doc(`${uid}_${PRIVACY_POLICY_VERSION}`);
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
  const ref = db.collection("privacyAcknowledgements").doc(`${uid}_${PRIVACY_POLICY_VERSION}`);
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
