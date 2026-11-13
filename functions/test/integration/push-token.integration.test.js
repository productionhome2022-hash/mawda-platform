const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const { registerPushToken, unregisterPushToken } = require("../../lib/index");

const db = getFirestore();
const memberRequest = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});

test("member FCM tokens are scoped, hashed, replaceable and deactivatable", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `push_member_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const token = `test_fcm_token_${"x".repeat(180)}`;
  const tokenId = createHash("sha256").update(token).digest("hex");
  const userRef = db.collection("users").doc(uid);
  const tokenRef = userRef.collection("pushTokens").doc(tokenId);
  await userRef.set({ profileCompleted: true, accountStatus: "active" });
  try {
    const registered = await registerPushToken.run(memberRequest(uid, { token, platform: "web" }));
    assert.equal(registered.registered, true);
    assert.equal(registered.tokenId, tokenId);
    const saved = await tokenRef.get();
    assert.equal(saved.data().token, token);
    assert.equal(saved.data().active, true);
    assert.equal(saved.data().platform, "web");

    const removed = await unregisterPushToken.run(memberRequest(uid, { token }));
    assert.equal(removed.registered, false);
    assert.equal((await tokenRef.get()).data().active, false);

    await assert.rejects(
      () => registerPushToken.run(memberRequest(uid, { token: "short", platform: "web" })),
      (error) => error && error.code === "invalid-argument",
    );
  } finally {
    await userRef.delete().catch(() => undefined);
  }
});

test("incomplete member profiles cannot register push tokens", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `push_incomplete_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const token = `test_fcm_token_${"y".repeat(180)}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ profileCompleted: false, accountStatus: "active" });
  try {
    await assert.rejects(
      () => registerPushToken.run(memberRequest(uid, { token, platform: "android" })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await userRef.delete().catch(() => undefined);
  }
});
