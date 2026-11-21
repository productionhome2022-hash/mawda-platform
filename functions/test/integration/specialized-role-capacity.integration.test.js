const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { getFirestore } = require("firebase-admin/firestore");
const {
  setOwnerAdvertisingRoleGrant,
  getOwnerAdvertisingRoleGrants,
  getOwnerSpecializedRoleCapacity,
  setOwnerSpecializedRoleCapacity,
} = require("../../lib/index");

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
const permissionForRole = {
  ad_general_supervisor: "advertising.requests.view_assigned",
  production_supervisor: "production.tasks.manage_assigned",
  production_general_supervisor: "production.tasks.manage_assigned",
  production_quality_reviewer: "production.reviews.write",
  legal_administrative_supervisor: "contracts.archive.read",
};
const grant = (uid, role) => ({
  uid,
  role,
  permissions: [permissionForRole[role]],
  resourceScopes: ["resource:capacity-test"],
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

test("all fixed specialist teams enforce their independent seat limits", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const roles = [
    { role: "ad_general_supervisor", limit: 5 },
    { role: "production_general_supervisor", limit: 5 },
    { role: "production_quality_reviewer", limit: 5 },
    { role: "legal_administrative_supervisor", limit: 4 },
  ];
  const seeded = [];
  const attempted = [];
  try {
    for (const { role, limit } of roles) {
      for (let i = 1; i <= limit; i += 1) {
        seeded.push(await seed("member_" + role + "_" + tag + "_" + i, role));
      }
      const uid = "member_" + role + "_" + tag + "_over_limit";
      await assert.rejects(
        () => assign(uid, role),
        (error) => error && error.code === "resource-exhausted",
      );
      attempted.push(grantId(uid, role));
      assert.equal((await db.collection("specializedRoleGrants")
        .where("role", "==", role).where("status", "==", "active").get()).size, limit);
    }
  } finally {
    await Promise.all([
      ...[...seeded, ...attempted].map((id) =>
        db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)),
      ...roles.map(({ role }) =>
        db.collection("specializedRoleSeatCounters").doc(role).delete().catch(() => undefined)),
    ]);
  }
});

test("Owner can raise General Production Supervisor capacity without oversubscription", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "production_general_supervisor";
  const settingsRef = db.doc("platformSettings/specializedRoleCapacity");
  const counterRef = db.collection("specializedRoleSeatCounters").doc(role);
  const previousSettings = await settingsRef.get();
  const previousCounter = await counterRef.get();
  const previousVersion = previousSettings.exists ? previousSettings.data().version : 0;
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const seeded = [];
  const attempted = [];
  try {
    const before = await getOwnerSpecializedRoleCapacity.run(ownerRequest({}));
    assert.equal(before.capacities.production_general_supervisor, 5);
    const updated = await setOwnerSpecializedRoleCapacity.run(ownerRequest({
      expectedVersion: previousVersion,
      capacity: 6,
    }));
    assert.equal(updated.capacity, 6);
    assert.equal(updated.activeCount, 0);
    const after = await getOwnerSpecializedRoleCapacity.run(ownerRequest({}));
    assert.equal(after.capacities.production_general_supervisor, 6);
    assert.equal(after.version, previousVersion + 1);

    for (let i = 1; i <= 5; i += 1) {
      seeded.push(await seed("member_general_prod_" + tag + "_" + i, role));
    }
    const sixthUid = "member_general_prod_" + tag + "_sixth";
    const sixth = await assign(sixthUid, role);
    assert.equal(sixth.status, "active");
    attempted.push(grantId(sixthUid, role));

    const seventhUid = "member_general_prod_" + tag + "_seventh";
    await assert.rejects(
      () => assign(seventhUid, role),
      (error) => error && error.code === "resource-exhausted",
    );
    attempted.push(grantId(seventhUid, role));
    assert.equal((await db.collection("specializedRoleGrants")
      .where("role", "==", role).where("status", "==", "active").get()).size, 6);
  } finally {
    await Promise.all([
      ...[...seeded, ...attempted].map((id) =>
        db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)),
      counterRef.delete().catch(() => undefined),
    ]);
    if (previousSettings.exists) await settingsRef.set(previousSettings.data());
    else await settingsRef.delete().catch(() => undefined);
    if (previousCounter.exists) await counterRef.set(previousCounter.data());
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


test("specialized role grant version refuses increment beyond the safe integer boundary", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "production_supervisor";
  const uid = "member_version_boundary_" + Date.now().toString(36);
  const id = grantId(uid, role);
  const ref = db.collection("specializedRoleGrants").doc(id);
  await ref.set({ ...grant(uid, role), version: Number.MAX_SAFE_INTEGER });
  try {
    await assert.rejects(
      () => setOwnerAdvertisingRoleGrant.run(ownerRequest({
        expectedVersion: Number.MAX_SAFE_INTEGER,
        grant: { ...grant(uid, role), version: undefined },
      })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await ref.get()).data().version, Number.MAX_SAFE_INTEGER);
  } finally {
    await ref.delete();
  }
});

test("expired active assignments do not consume seats and reactivation is counted atomically", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "ad_general_supervisor";
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const activeIds = [];
  const expiredUid = "member_expired_reactivate_" + tag;
  const expiredId = grantId(expiredUid, role);
  const candidateUid = "member_after_reactivate_" + tag;
  const candidateId = grantId(candidateUid, role);
  try {
    for (let i = 1; i <= 4; i += 1) {
      activeIds.push(await seed("member_active_reactivate_" + tag + "_" + i, role));
    }
    await db.collection("specializedRoleGrants").doc(expiredId).set({
      ...grant(expiredUid, role),
      endsAtMs: now - 10_000,
    });

    const reactivated = await setOwnerAdvertisingRoleGrant.run(ownerRequest({
      expectedVersion: 1,
      grant: grant(expiredUid, role),
    }));
    assert.equal(reactivated.status, "active");
    assert.equal(reactivated.version, 2);

    await assert.rejects(
      () => assign(candidateUid, role),
      (error) => error && error.code === "resource-exhausted",
    );
    assert.equal((await db.collection("specializedRoleGrants")
      .where("role", "==", role).where("status", "==", "active").get()).size, 5);
  } finally {
    await Promise.all([...activeIds, expiredId, candidateId].map((id) =>
      db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)));
    await db.collection("specializedRoleSeatCounters").doc(role).delete().catch(() => undefined);
  }
});

test("suspended and revoked specialist grants do not consume active seats", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const role = "ad_general_supervisor";
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const ids = [];
  try {
    for (const status of ["suspended", "revoked"]) {
      const uid = "member_" + status + "_seat_" + tag;
      const id = grantId(uid, role);
      ids.push(id);
      await db.collection("specializedRoleGrants").doc(id).set({
        ...grant(uid, role),
        status,
      });
    }
    for (let i = 1; i <= 5; i += 1) {
      const uid = "member_live_after_inactive_" + tag + "_" + i;
      const result = await assign(uid, role);
      assert.equal(result.status, "active");
      ids.push(grantId(uid, role));
    }
    const extraUid = "member_over_limit_after_inactive_" + tag;
    await assert.rejects(
      () => assign(extraUid, role),
      (error) => error && error.code === "resource-exhausted",
    );
    ids.push(grantId(extraUid, role));
    assert.equal((await db.collection("specializedRoleGrants")
      .where("role", "==", role).where("status", "==", "active").get()).size, 5);
  } finally {
    await Promise.all(ids.map((id) =>
      db.collection("specializedRoleGrants").doc(id).delete().catch(() => undefined)));
    await db.collection("specializedRoleSeatCounters").doc(role).delete().catch(() => undefined);
  }
});


test("active specialist grants never authorize sovereign role administration callables", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = "delegated_admin_denied_" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
  const role = "ad_general_supervisor";
  const id = grantId(uid, role);
  const grantRef = db.collection("specializedRoleGrants").doc(id);
  await grantRef.set(grant(uid, role));
  const delegatedRequest = {
    data: { expectedVersion: 0, capacity: 6 },
    auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
  };
  try {
    await assert.rejects(
      () => getOwnerAdvertisingRoleGrants.run(delegatedRequest),
      (error) => error && error.code === "permission-denied",
      "a valid advertising permission grant cannot list or administer grants",
    );
    await assert.rejects(
      () => getOwnerSpecializedRoleCapacity.run(delegatedRequest),
      (error) => error && error.code === "permission-denied",
      "a valid advertising permission grant cannot inspect sovereign role capacity",
    );
    await assert.rejects(
      () => setOwnerSpecializedRoleCapacity.run(delegatedRequest),
      (error) => error && error.code === "permission-denied",
      "a valid advertising permission grant cannot change sovereign role capacity",
    );
    await assert.rejects(
      () => setOwnerAdvertisingRoleGrant.run({
        ...delegatedRequest,
        data: { expectedVersion: 0, grant: { ...grant(uid, role), version: undefined } },
      }),
      (error) => error && error.code === "permission-denied",
      "a specialist cannot create or modify another specialist grant",
    );
  } finally {
    await grantRef.delete().catch(() => undefined);
  }
});
