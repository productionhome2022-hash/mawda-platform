const test = require("node:test");
const assert = require("node:assert/strict");
const { initializeApp, deleteApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-profile-media";
const rawStorageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";
process.env.STORAGE_EMULATOR_HOST = `http://${rawStorageEmulatorHost.replace("https://", "").replace("http://", "")}`;
const app = initializeApp({ projectId, storageBucket: `${projectId}.appspot.com` });
const db = getFirestore();
const bucket = getStorage().bucket();
const { setMemberProfileMedia } = require("../../lib/index");
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

test.after(async () => {
  await deleteApp(app);
});
