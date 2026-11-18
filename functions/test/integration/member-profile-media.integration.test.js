const test = require("node:test");
const assert = require("node:assert/strict");
const { getApps, deleteApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-profile-media";
const rawStorageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";
process.env.STORAGE_EMULATOR_HOST = `http://${rawStorageEmulatorHost.replace("https://", "").replace("http://", "")}`;
process.env.GCLOUD_PROJECT = projectId;
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId, storageBucket: `${projectId}.appspot.com`,
});
const { setMemberProfileMedia, resetMemberProfileMedia, setMemberGhostMode, discoverMembers, getMemberProfile } = require("../../lib/index");
const { getMemberProfileMediaUrl } = require("../../lib/media");
const { listMemberProfileGallery } = require("../../lib/media");
const db = getFirestore();
const bucket = getStorage().bucket();
const { runChatMediaRetentionSweep } = require("../../lib/retention");

function memberRequest(uid, data) {
  return { data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } } };
}

test("member selects a clean custom avatar; old asset receives a bounded superseded deadline", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const uid = `profile-media-member-${suffix}`;
  const oldId = `11111111-aaaa-bbbb-cccc-${suffix.padStart(12, "0").slice(-12)}`;
  const newId = `22222222-bbbb-cccc-dddd-${suffix.padStart(12, "0").slice(-12)}`;
  const userRef = db.collection("users").doc(uid);
  const oldRef = db.collection("mediaAssets").doc(oldId);
  const newRef = db.collection("mediaAssets").doc(newId);
  const oldExpiry = Timestamp.fromMillis(Date.now() + 15 * 24 * 60 * 60 * 1000);
  await Promise.all([
    userRef.set({ profileCompleted: true, avatarMediaId: oldId, avatarUsesDefault: false }),
    oldRef.set({
      mediaId: oldId, ownerUid: uid, mediaPurpose: "avatar_cover", profileMediaSlot: "avatar",
      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
      retentionExpiresAt: oldExpiry,
    }),
    newRef.set({
      mediaId: newId, ownerUid: uid, mediaPurpose: "avatar_cover",
      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000),
    }),
  ]);

  try {
    const result = await setMemberProfileMedia.run(memberRequest(uid, { mediaId: newId, slot: "avatar" }));
    assert.equal(result.selected, true);
    assert.equal(result.previousMediaId, oldId);
    const user = (await userRef.get()).data();
    assert.equal(user.avatarMediaId, newId);
    assert.equal(user.avatarUsesDefault, false);
    const oldAsset = (await oldRef.get()).data();
    assert.equal(oldAsset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
    assert.ok(oldAsset.supersededAt instanceof Timestamp);
    assert.equal(oldAsset.retentionExpiresAt.toMillis(), oldExpiry.toMillis());
    const newAsset = (await newRef.get()).data();
    assert.equal(newAsset.profileMediaSlot, "avatar");
    assert.ok(newAsset.retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);

    await assert.rejects(
      () => setMemberProfileMedia.run(memberRequest(uid, { mediaId: newId, slot: "cover" })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    const audits = await db.collection("mediaAccessAudit").where("actorUid", "==", uid).get();
    await Promise.all([
      userRef.delete(), oldRef.delete(), newRef.delete(),
      ...audits.docs.map((doc) => doc.ref.delete()),
    ]);
  }
});

test("expired current avatar falls back to Mawda default before exact media deletion", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const suffix = Date.now().toString();
  const uid = `expired-avatar-member-${suffix}`;
  const mediaId = `33333333-cccc-dddd-eeee-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const previewPath = `processed/${uid}/${mediaId}/preview.webp`;
  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  const expired = Timestamp.fromMillis(Date.now() - 1000);
  await Promise.all([
    original.save(Buffer.from("custom avatar"), { resumable: false }),
    preview.save(Buffer.from("custom avatar preview"), { resumable: false }),
    userRef.set({ profileCompleted: true, avatarMediaId: mediaId, avatarUsesDefault: false }),
    assetRef.set({
      mediaId, ownerUid: uid, uploaderType: "member", mediaPurpose: "avatar_cover",
      profileMediaSlot: "avatar", objectPath, safePreviewPath: previewPath,
      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
      retentionExpiresAt: expired, createdAt: expired,
    }),
  ]);

  try {
    const result = await runChatMediaRetentionSweep();
    assert.equal(result.failures, 0);
    const user = (await userRef.get()).data();
    assert.equal(user.avatarMediaId, undefined);
    assert.equal(user.avatarUsesDefault, true);
    assert.ok(user.avatarDefaultAppliedAt instanceof Timestamp);
    assert.equal((await assetRef.get()).data().status, "self_destructed");
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
  } finally {
    const audits = await db.collection("mediaAccessAudit").where("mediaId", "==", mediaId).get();
    await Promise.all([
      userRef.delete().catch(() => undefined),
      assetRef.delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
      ...audits.docs.map((doc) => doc.ref.delete()),
    ]);
  }
});



test("member can reset a selected avatar to the default while superseding the old asset safely", async () => {
  const suffix = Date.now().toString();
  const uid = `reset-profile-member-${suffix}`;
  const mediaId = `55555555-eeee-ffff-aaaa-${suffix.padStart(12, "0").slice(-12)}`;
  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const existingExpiry = Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000);
  await Promise.all([
    userRef.set({ profileCompleted: true, avatarMediaId: mediaId, avatarUsesDefault: false }),
    assetRef.set({
      mediaId, ownerUid: uid, mediaPurpose: "avatar_cover", profileMediaSlot: "avatar",
      status: "security_approved", retentionExpiresAt: existingExpiry,
      retentionPolicyStatus: "thirty_day_avatar_cover",
    }),
  ]);
  try {
    const result = await resetMemberProfileMedia.run(memberRequest(uid, { slot: "avatar" }));
    assert.equal(result.usesDefault, true);
    const user = (await userRef.get()).data();
    assert.equal(user.avatarMediaId, undefined);
    assert.equal(user.avatarUsesDefault, true);
    const asset = (await assetRef.get()).data();
    assert.equal(asset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
    assert.ok(asset.supersededAt instanceof Timestamp);
    assert.equal(asset.retentionExpiresAt.toMillis(), existingExpiry.toMillis());
  } finally {
    const audits = await db.collection("mediaAccessAudit").where("actorUid", "==", uid).get();
    await Promise.all([
      userRef.delete().catch(() => undefined),
      assetRef.delete().catch(() => undefined),
      ...audits.docs.map((doc) => doc.ref.delete()),
    ]);
  }
});

test("profile media URL callable returns default for an unset slot and denies private profiles to others", async () => {
  const suffix = Date.now().toString();
  const ownerUid = `profile-url-owner-${suffix}`;
  const viewerUid = `profile-url-viewer-${suffix}`;
  const ownerRef = db.collection("users").doc(ownerUid);
  await ownerRef.set({ profileCompleted: true, profileVisibility: "private", avatarUsesDefault: true });
  try {
    const own = await getMemberProfileMediaUrl.run(memberRequest(ownerUid, {
      userId: ownerUid, slot: "avatar",
    }));
    assert.equal(own.url, null);
    assert.equal(own.usesDefault, true);
    await assert.rejects(
      () => getMemberProfileMediaUrl.run(memberRequest(viewerUid, {
        userId: ownerUid, slot: "avatar",
      })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await ownerRef.delete().catch(() => undefined);
  }
});

test("profile gallery lists only through the authenticated visibility gate", async () => {
  const suffix = Date.now().toString();
  const ownerUid = `gallery-owner-${suffix}`;
  const viewerUid = `gallery-viewer-${suffix}`;
  const ownerRef = db.collection("users").doc(ownerUid);
  await ownerRef.set({ profileCompleted: true, profileVisibility: "private" });
  try {
    const own = await listMemberProfileGallery.run(memberRequest(ownerUid, {
      userId: ownerUid,
    }));
    assert.deepEqual(own.items, []);
    await assert.rejects(
      () => listMemberProfileGallery.run(memberRequest(viewerUid, {
        userId: ownerUid,
      })),
      (error) => error && error.code === "permission-denied",
    );
    await ownerRef.update({ profileVisibility: "public" });
    const publicView = await listMemberProfileGallery.run(memberRequest(viewerUid, {
      userId: ownerUid,
    }));
    assert.deepEqual(publicView.items, []);
  } finally {
    await ownerRef.delete().catch(() => undefined);
  }
});

test.after(async () => {
  await Promise.all(getApps().map((app) => deleteApp(app)));
});


test("avatar expiry applies Mawda default during a legal hold but delays object erasure until release", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const suffix = Date.now().toString();
  const uid = `held-avatar-member-${suffix}`;
  const mediaId = `44444444-dddd-eeee-ffff-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${uid}/${mediaId}`;
  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const original = bucket.file(objectPath);
  const expired = Timestamp.fromMillis(Date.now() - 1000);
  await Promise.all([
    original.save(Buffer.from("held expired avatar"), { resumable: false }),
    userRef.set({ profileCompleted: true, avatarMediaId: mediaId, avatarUsesDefault: false }),
    assetRef.set({
      mediaId, ownerUid: uid, uploaderType: "member", mediaPurpose: "avatar_cover",
      profileMediaSlot: "avatar", objectPath,
      status: "security_approved", legalHoldStatus: "active",
      activeLegalHoldId: "test-avatar-hold",
      retentionPolicyStatus: "legal_hold", resumeRetentionPolicyStatus: "thirty_day_avatar_cover",
      retentionExpiresAt: expired, createdAt: expired,
    }),
  ]);

  try {
    await runChatMediaRetentionSweep();
    const user = (await userRef.get()).data();
    assert.equal(user.avatarMediaId, undefined);
    assert.equal(user.avatarUsesDefault, true);
    assert.equal((await assetRef.get()).data().status, "security_approved");
    assert.equal((await original.exists())[0], true);

    const { FieldValue } = require("firebase-admin/firestore");
    await assetRef.update({
      legalHoldStatus: "released",
      activeLegalHoldId: FieldValue.delete(),
      retentionPolicyStatus: "thirty_day_avatar_cover",
      resumeRetentionPolicyStatus: FieldValue.delete(),
    });
    await runChatMediaRetentionSweep();
    assert.equal((await assetRef.get()).data().status, "self_destructed");
    assert.equal((await original.exists())[0], false);
  } finally {
    await Promise.all([
      userRef.delete().catch(() => undefined),
      assetRef.delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});


test("Hide Coins hides only the profile projection from ordinary members while owner, self, and platform owner retain balance visibility", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const memberUid = "hide-coins-member-" + suffix;
  const viewerUid = "hide-coins-viewer-" + suffix;
  const ownerUid = "hide-coins-owner-" + suffix;
  const memberRef = db.collection("users").doc(memberUid);
  const viewerRef = db.collection("users").doc(viewerUid);
  const ownerRef = db.collection("users").doc(ownerUid);
  const entitlementRef = memberRef.collection("entitlements").doc("hide_coins_30d");
  const base = {
    profileCompleted: true, accountStatus: "active", age: 29,
    profileVisibility: "public", displayName: "Coin Member",
    username: "coin_" + suffix, fullName: "Coin Member",
    profession: "Creator", country: "syria", region: "damascus",
    gender: "male", maritalStatus: "single", bio: "", interests: [], goals: [],
    coins: 4321,
  };
  await Promise.all([
    memberRef.set(base),
    viewerRef.set({ ...base, username: "viewer_" + suffix, displayName: "Viewer", coins: 50 }),
    ownerRef.set({ ...base, username: "owner_" + suffix, displayName: "Owner", coins: 999999 }),
    entitlementRef.set({
      itemId: "hide_coins_30d", itemName: "إخفاء رصيد الكوينز",
      category: "privacy", status: "active",
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
      purchasedAt: Timestamp.now(),
    }),
  ]);
  const ownerRequest = (data) => ({
    data,
    auth: {
      uid: ownerUid,
      token: {
        platformOwner: true,
        platformOwnerUid: ownerUid,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_second_factor: "totp", sign_in_provider: "password" },
      },
    },
  });
  try {
    const ordinary = await getMemberProfile.run(memberRequest(viewerUid, { userId: memberUid }));
    assert.equal(ordinary.coinBalanceLocked, true);
    assert.equal(Object.prototype.hasOwnProperty.call(ordinary, "coins"), false);

    const self = await getMemberProfile.run(memberRequest(memberUid, { userId: memberUid }));
    assert.equal(self.coinBalanceLocked, false);
    assert.equal(self.coins, 4321);

    const owner = await getMemberProfile.run(ownerRequest({ userId: memberUid }));
    assert.equal(owner.coinBalanceLocked, false);
    assert.equal(owner.coins, 4321);
  } finally {
    await Promise.all([
      memberRef.delete().catch(() => undefined),
      viewerRef.delete().catch(() => undefined),
      ownerRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
    ]);
  }
});

test("purchased ghost mode hides a member from discovery and can be disabled without altering public profile visibility", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = Date.now().toString();
  const memberUid = "ghost_member_" + tag;
  const viewerUid = "ghost_viewer_" + tag;
  const userRef = db.collection("users").doc(memberUid);
  const viewerRef = db.collection("users").doc(viewerUid);
  const entitlementRef = userRef.collection("entitlements").doc("ghost_mode_7d");
  await Promise.all([
    userRef.set({
      profileCompleted: true, accountStatus: "active", age: 29,
      profileVisibility: "public", displayName: "Ghost Member", username: "ghost_" + tag,
      fullName: "Ghost Member", profession: "Creator", country: "syria", region: "damascus",
      gender: "male", maritalStatus: "single", bio: "public profile", interests: [], goals: [],
    }),
    viewerRef.set({
      profileCompleted: true, accountStatus: "active", age: 31,
      profileVisibility: "public", displayName: "Viewer", username: "viewer_" + tag,
      fullName: "Viewer", profession: "Member", country: "syria", region: "damascus",
      gender: "female", maritalStatus: "single", bio: "", interests: [], goals: [],
    }),
    entitlementRef.set({
      itemId: "ghost_mode_7d", itemName: "وضع التخفي", category: "privacy",
      status: "active", expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  ]);
  try {
    const enabled = await setMemberGhostMode.run(memberRequest(memberUid, { enabled: true }));
    assert.equal(enabled.enabled, true);
    const hidden = await discoverMembers.run(memberRequest(viewerUid));
    assert.equal(hidden.members.some((member) => member.uid === memberUid), false);
    const ownProfile = await getMemberProfile.run(memberRequest(memberUid, { userId: memberUid }));
    assert.equal(ownProfile.ghostModeActive, true);
    await setMemberGhostMode.run(memberRequest(memberUid, { enabled: false }));
    const visible = await discoverMembers.run(memberRequest(viewerUid));
    assert.equal(visible.members.some((member) => member.uid === memberUid), true);
    assert.equal((await userRef.get()).data().profileVisibility, "public");
  } finally {
    const audits = await db.collection("profileFeatureAuditLogs").where("actorUid", "==", memberUid).get();
    await Promise.all([
      userRef.delete().catch(() => undefined),
      viewerRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      ...audits.docs.map((doc) => doc.ref.delete()),
    ]);
  }
});
