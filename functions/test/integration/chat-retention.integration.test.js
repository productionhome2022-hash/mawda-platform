const test = require("node:test");
const assert = require("node:assert/strict");
const { initializeApp, deleteApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-retention";
const rawStorageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";
process.env.STORAGE_EMULATOR_HOST = `http://${rawStorageEmulatorHost.replace("https://", "").replace("http://", "")}`;
const app = initializeApp({
  projectId,
  storageBucket: `${projectId}.appspot.com`,
});
const db = getFirestore();
const { runChatTextRetentionSweep, runChatMediaRetentionSweep } = require("../../lib/retention");

test("seven-day sweep deletes direct and room text, notifications and expired previews only", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const chatRef = db.collection("directChats").doc("retention-chat-test");
  const directMessageRef = chatRef.collection("messages").doc("direct-message-test");
  const roomMessageRef = db.collection("rooms").doc("retention-room-test")
    .collection("messages").doc("room-message-test");
  const notificationRef = db.collection("users").doc("retention-recipient-test")
    .collection("notifications").doc("direct-message-test");
  const unrelatedRef = db.collection("users").doc("retention-recipient-test")
    .collection("messages").doc("unrelated-message-test");

  await chatRef.set({
    participantUids: ["retention-sender-test", "retention-recipient-test"],
    lastMessageAt: old,
    lastMessagePreview: "expired private text preview",
    lastMessageSenderUid: "retention-sender-test",
  });
  await directMessageRef.set({
    messageId: directMessageRef.id,
    senderUid: "retention-sender-test",
    recipientUid: "retention-recipient-test",
    text: "expired direct message body",
    type: "text",
    createdAt: old,
  });
  await roomMessageRef.set({
    messageId: roomMessageRef.id,
    senderUid: "retention-sender-test",
    content: "expired room message body",
    type: "text",
    createdAt: old,
  });
  await notificationRef.set({
    notificationId: directMessageRef.id,
    type: "direct_message",
    body: "generic notification",
    createdAt: old,
  });
  await unrelatedRef.set({ text: "not a chat message", createdAt: old });

  try {
    const result = await runChatTextRetentionSweep();
    assert.equal(result.failures, 0);
    assert.equal(result.messages, 2);
    assert.equal((await directMessageRef.get()).exists, false);
    assert.equal((await roomMessageRef.get()).exists, false);
    assert.equal((await notificationRef.get()).exists, false);
    assert.equal((await unrelatedRef.get()).exists, true);

    const chat = await chatRef.get();
    assert.equal(chat.data().lastMessagePreview, undefined);
    assert.equal(chat.data().lastMessageAt, undefined);
    assert.equal(chat.data().lastMessageSenderUid, undefined);
  } finally {
    await Promise.all([
      chatRef.delete().catch(() => undefined),
      notificationRef.delete().catch(() => undefined),
      unrelatedRef.delete().catch(() => undefined),
      db.collection("rooms").doc("retention-room-test").delete().catch(() => undefined),
      db.collection("users").doc("retention-recipient-test").delete().catch(() => undefined),
    ]);
  }
});

test.after(async () => {
  await deleteApp(app);
});


test("seven-day profile gallery retention removes original and preview objects but honors a legal hold", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const ownerUid = `gallery-owner-${suffix}`;
  const mediaId = `aaaaaaaa-bbbb-cccc-dddd-${suffix.padStart(12, "0").slice(-12)}`;
  const heldMediaId = `bbbbbbbb-cccc-dddd-eeee-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${ownerUid}/${mediaId}`;
  const previewPath = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const heldObjectPath = `quarantine/${ownerUid}/${heldMediaId}`;
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const heldAssetRef = db.collection("mediaAssets").doc(heldMediaId);
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  const heldOriginal = bucket.file(heldObjectPath);
  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);

  await Promise.all([
    original.save(Buffer.from("gallery original"), { resumable: false }),
    preview.save(Buffer.from("gallery preview"), { resumable: false }),
    heldOriginal.save(Buffer.from("held gallery original"), { resumable: false }),
  ]);
  await Promise.all([
    assetRef.set({
      mediaId, ownerUid, uploaderType: "member", mediaPurpose: "profile_album",
      objectPath, safePreviewPath: previewPath, status: "security_approved",
      retentionPolicyStatus: "seven_day_profile_album",
      retentionExpiresAt: old, createdAt: old,
    }),
    heldAssetRef.set({
      mediaId: heldMediaId, ownerUid, uploaderType: "member", mediaPurpose: "profile_album",
      objectPath: heldObjectPath, status: "security_approved",
      retentionPolicyStatus: "seven_day_profile_album",
      retentionExpiresAt: old, createdAt: old,
      legalHoldStatus: "active", activeLegalHoldId: "test-gallery-hold",
    }),
  ]);

  try {
    const result = await runChatMediaRetentionSweep();
    assert.equal(result.failures, 0);
    const deletedAsset = (await assetRef.get()).data();
    assert.equal(deletedAsset.status, "self_destructed");
    assert.equal(deletedAsset.retentionPolicyStatus, "seven_day_profile_album_deleted");
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
    assert.equal((await heldAssetRef.get()).data().status, "security_approved");
    assert.equal((await heldOriginal.exists())[0], true);

    // A signed upload or processor that was already in flight may recreate an
    // exact object after the first sweep. The tombstone reconciliation must
    // remove both the original and its preview again.
    await Promise.all([
      original.save(Buffer.from("late original replay"), { resumable: false }),
      preview.save(Buffer.from("late preview replay"), { resumable: false }),
    ]);
    await assetRef.update({ retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000) });
    const reconciled = await runChatMediaRetentionSweep();
    assert.equal(reconciled.failures, 0);
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      heldAssetRef.delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
      heldOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});
