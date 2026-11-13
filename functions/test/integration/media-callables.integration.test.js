const test = require("node:test");
const assert = require("node:assert/strict");

// Import the callable module before initializeApp(). This intentionally guards
// against eager Admin SDK access during the Functions entry-point import phase.
const {
  listOwnerMediaAssets,
} = require("../lib/media");

const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (getApps().length === 0) {
  initializeApp({ projectId: "demo-mawda-media" });
}
const db = getFirestore();

function ownerRequest(uid, data = {}) {
  return {
    data,
    auth: {
      uid,
      token: {
        platformOwner: true,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: "password", sign_in_second_factor: "phone" },
      },
    },
  };
}

function memberRequest(uid, provider = "password") {
  return {
    data: { status: "pending_security_scan", uploaderType: "all" },
    auth: {
      uid,
      token: {
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: provider },
      },
    },
  };
}

async function auditEvents(uid) {
  const snapshot = await db.collection("mediaAccessAudit")
    .where("actorUid", "==", uid)
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

test("owner media listing succeeds and writes a success audit event", async () => {
  const uid = `owner-${Date.now()}-${Math.random()}`;
  const result = await listOwnerMediaAssets.run(ownerRequest(uid));
  assert.deepEqual(result.assets, []);
  assert.equal(result.hasMore, false);
  const events = await auditEvents(uid);
  assert.ok(events.some((event) =>
    event.action === "owner_media_asset_listed" && event.outcome === "success"));
});

for (const [label, request] of [
  ["ordinary member", (uid) => memberRequest(uid)],
  ["anonymous guest", (uid) => memberRequest(uid, "anonymous")],
  ["owner with stale MFA", (uid) => ({
    ...ownerRequest(uid),
    auth: {
      ...ownerRequest(uid).auth,
      token: {
        ...ownerRequest(uid).auth.token,
        auth_time: Math.floor(Date.now() / 1000) - 16 * 60,
      },
    },
  })],
]) {
  test(`${label} is denied and the denial is audited`, async () => {
    const uid = `${label.replace(/[^a-z]/gi, "-")}-${Date.now()}-${Math.random()}`;
    await assert.rejects(
      () => listOwnerMediaAssets.run(request(uid)),
      (error) => error && error.code === "permission-denied",
    );
    const events = await auditEvents(uid);
    assert.ok(events.some((event) =>
      event.action === "owner_media_asset_list_attempt" &&
      event.outcome === "denied" &&
      event.failureCode === "permission-denied"));
  });
}

test("owner invalid filters are rejected and audited", async () => {
  const uid = `owner-invalid-filter-${Date.now()}-${Math.random()}`;
  await assert.rejects(
    () => listOwnerMediaAssets.run(ownerRequest(uid, { uploaderType: "guest;member" })),
    (error) => error && error.code === "invalid-argument",
  );
  const events = await auditEvents(uid);
  assert.ok(events.some((event) =>
    event.action === "owner_media_asset_list_attempt" &&
    event.outcome === "denied" &&
    event.failureCode === "invalid-uploader-type"));
});
