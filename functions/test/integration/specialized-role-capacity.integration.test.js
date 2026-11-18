const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const { setOwnerAdvertisingRoleGrant } = require("../../lib/index");

const db = getFirestore();
const ownerUid = "role_capacity_owner_0001";
const now = Date.now();
const ownerRequest = (data) => ({
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
const grantId = (uid, role) => createHash("sha256")
  .update("specialized-role-v1|" + uid + "|" + role).digest("hex");
const grant = (uid, role) => ({
  uid,
  role,
  permissions: role === "production_supervisor" || role === "production_general_supervisor"
    ? ["production.tasks.manage_assigned"]
    : ["advertising.requests.review"],
  resourceScopes: ["campaign:capacity-test"],
  status: "active",
  startsAtMs: now - 1000,
  endsAtMs: null,
  version: 1,
});
const seed = async (uid, role) => {
  const id = grantId(uid, role);
  await db.collection("specializedRoleGrants").doc(id).set(grant(uid, role));
  return id;
};
const assign = (uid, role) => setOwnerAdvertisingRoleGrant.run(ownerRequest({
  expectedVersion: 0,
  grant: { ...grant(uid, role), version: undefined },
}));

test("Admin Media and general production supervisor assignments enforce five seats independently", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const roles = ["ad_general_supervisor", "production_general_supervisor"];
  const seeded = [];
  const attempted = [];
  try {
    for (const role of roles) {
      for (let i = 1; i <= 5; i += 1) {
        seeded.push(await seed("member_" + role + "_" + tag + "_" + i, role));
      }
      const uid = "member_" + role + "_" + tag + "_sixth";
      await assert.rejects(
        () => assign(uid, role),
        (error) => error && error.code === "resource-exhausted",
      );
      attempted.push(grantId(uid, role));
      assert.equal((await db.collection("specializedRoleGrants")
        .where("role", "==", role).where("status", "==", "active").get()).size, 5);
    }
  } finally {
    await Promise.all([
      ...[...seeded, ...attempted].map((id) =>
        db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)),
      ...roles.map((role) =>
        db.collection("specializedRoleSeatCounters").doc(role).delete().catch(() => undefined)),
    ]);
  }
});

test("concurrent owner assignments cannot oversubscribe the fifth Admin Media seat", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "ad_general_supervisor";
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const seeded = [];
  const candidates = ["candidate_a_" + tag, "candidate_b_" + tag];
  const candidateIds = candidates.map((uid) => grantId(uid, role));
  try {
    for (let i = 1; i <= 4; i += 1) {
      seeded.push(await seed("member_four_" + tag + "_" + i, role));
    }
    const outcomes = await Promise.allSettled(candidates.map((uid) => assign(uid, role)));
    assert.equal(outcomes.filter((item) => item.status === "fulfilled").length, 1);
    assert.equal(outcomes.filter((item) =>
      item.status === "rejected" && item.reason?.code === "resource-exhausted").length, 1);
    assert.equal((await db.collection("specializedRoleGrants")
      .where("role", "==", role).where("status", "==", "active").get()).size, 5);
  } finally {
    await Promise.all([
      ...[...seeded, ...candidateIds].map((id) =>
        db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)),
      db.collection("specializedRoleSeatCounters").doc(role).delete().catch(() => undefined),
    ]);
  }
});

test("Team Production Supervisor remains open-ended", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "production_supervisor";
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const ids = [];
  try {
    for (let i = 1; i <= 7; i += 1) {
      const uid = "team_producer_" + tag + "_" + i;
      const result = await assign(uid, role);
      assert.equal(result.status, "active");
      ids.push(grantId(uid, role));
    }
    assert.equal((await db.collection("specializedRoleGrants")
      .where("role", "==", role).where("status", "==", "active").get()).size, 7);
  } finally {
    await Promise.all(ids.map((id) =>
      db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)));
  }
});
