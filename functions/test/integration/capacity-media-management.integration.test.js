const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  getOwnerCapacityMediaManagement,
  setOwnerCapacityMediaManagement,
} = require("../../lib/index");

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
  const initial = await getOwnerCapacityMediaManagement(ownerRequest());
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
  const saved = await setOwnerCapacityMediaManagement(ownerRequest({
    expectedVersion: 0,
    monthlyMediaQuotas: quotas,
  }));
  assert.equal(saved.saved, true);
  assert.equal(saved.version, 1);
  assert.equal(saved.enforcementStatus, "observe_only");

  const after = await getOwnerCapacityMediaManagement(ownerRequest());
  assert.equal(after.policy.version, 1);
  assert.deepEqual(after.policy.monthlyMediaQuotas, quotas);
  assert.equal(after.enforcement.status, "observe_only");
  assert.equal(after.enforcement.coreServicesExemptFromQuota, true);

  await assert.rejects(
    setOwnerCapacityMediaManagement(ownerRequest({
      expectedVersion: 0,
      monthlyMediaQuotas: quotas,
    })),
    (error) => error && error.code === "aborted",
  );
});
