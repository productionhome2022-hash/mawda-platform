const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getOwnerCapacityMediaManagement,
  setOwnerCapacityMediaManagement,
  recordMemberActivity,
} = require("../../lib/index");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

const ownerUid = "capacity_media_owner_test";
const ownerRequest = (data = {}) => ({
  data,
  auth: {
    uid: ownerUid,
    token: {
      platformOwner: true,
      platformOwnerUid: ownerUid,
      auth_time: Math.floor(Date.now() / 1000),
      firebase: { sign_in_second_factor: "phone" },
    },
  },
});

test("owner capacity management is observe-only, versioned and fail-closed", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const initial = await getOwnerCapacityMediaManagement.run(ownerRequest());
  assert.equal(initial.enforcement.status, "observe_only");
  assert.equal(initial.enforcement.productionBillingConnected, false);
  assert.equal(initial.policy.monthlyMediaQuotas.uploadBytesPerMember, null);
  assert.equal(initial.measurement.status, "not_started");
  assert.equal(initial.measurement.monthlyUploadBytes, null);

  const quotas = {
    uploadBytesPerMember: null,
    downloadBytesPerMember: null,
    storageBytesPerMember: null,
    processingMinutesPerMember: null,
  };
  const saved = await setOwnerCapacityMediaManagement.run(ownerRequest({
    expectedVersion: 0,
    monthlyMediaQuotas: quotas,
  }));
  assert.equal(saved.saved, true);
  assert.equal(saved.version, 1);
  assert.equal(saved.enforcementStatus, "observe_only");

  const after = await getOwnerCapacityMediaManagement.run(ownerRequest());
  assert.equal(after.policy.version, 1);
  assert.deepEqual(after.policy.monthlyMediaQuotas, quotas);
  assert.equal(after.enforcement.status, "observe_only");
  assert.equal(after.enforcement.coreServicesExemptFromQuota, true);

  await assert.rejects(
    setOwnerCapacityMediaManagement.run(ownerRequest({
      expectedVersion: 0,
      monthlyMediaQuotas: quotas,
    })),
    (error) => error && error.code === "aborted",
  );
});


test("owner capacity endpoint reads finalized upload counters and keeps unconnected dimensions unknown", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const monthUtc = new Date().toISOString().slice(0, 7);
  const meterRef = db.collection("platformCapacityMeters").doc(monthUtc);
  await meterRef.set({
    monthUtc,
    monthlyUploadBytes: 4096,
    finalizedUploadCount: 3,
  });
  try {
    const result = await getOwnerCapacityMediaManagement.run(ownerRequest());
    assert.equal(result.measurement.monthlyUploadBytes, 4096);
    assert.equal(result.measurement.finalizedUploadCount, 3);
    assert.equal(result.measurement.concurrentActiveMembers, null);
    assert.equal(result.measurement.monthlyDownloadBytes, null);
    assert.equal(result.measurement.retainedStorageBytes, null);
    assert.equal(result.measurement.processingMinutes, null);
    assert.equal(result.enforcement.status, "observe_only");
    assert.equal(result.enforcement.productionBillingConnected, false);
  } finally {
    await meterRef.delete();
  }
});

test("authenticated foreground heartbeats feed the owner active-member measurement with server timestamps and replay throttling", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `capacity_active_member_${Date.now()}`;
  const userRef = db.collection("users").doc(uid);
  await userRef.set({
    profileCompleted: true,
    accountStatus: "active",
    status: "active",
    age: 24,
  });
  try {
    const first = await recordMemberActivity.run({
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.equal(first.recorded, true);
    const saved = await userRef.get();
    assert.ok(Number.isSafeInteger(saved.data().lastActivityAtMs));
    assert.equal(saved.data().lastActivitySource, "authenticated_app_heartbeat");

    const replay = await recordMemberActivity.run({
      auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.equal(replay.recorded, false);
    assert.equal(replay.lastActivityAtMs, first.lastActivityAtMs);

    const ownerView = await getOwnerCapacityMediaManagement.run(ownerRequest());
    assert.ok(ownerView.measurement.concurrentActiveMembers >= 1);
    assert.ok(ownerView.measurement.capacityTierCount >= 1);
    assert.equal(ownerView.enforcement.status, "observe_only");
    assert.equal(ownerView.enforcement.productionBillingConnected, false);
  } finally {
    await userRef.delete();
  }
});

test("anonymous users cannot inflate the active-member capacity meter", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  await assert.rejects(
    () => recordMemberActivity.run({
      auth: { uid: `guest_${Date.now()}`, token: { firebase: { sign_in_provider: "anonymous" } } },
    }),
    (error) => error && error.code === "permission-denied",
  );
});
