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
const { runChatTextRetentionSweep, runChatMediaRetentionSweep, runIndependentMediaRetentionSweep, runStickerMediaRetentionSweep } = require("../../lib/retention");

test("mode-aware sweep deletes normal text at seven days, important text at thirty days, and preserves temporary messages pending full-chat expiry", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const veryOld = Timestamp.fromMillis(Date.now() - 31 * 24 * 60 * 60 * 1000);
  const chatRef = db.collection("directChats").doc("retention-chat-test");
  const directMessageRef = chatRef.collection("messages").doc("direct-message-test");
  const roomMessageRef = db.collection("rooms").doc("retention-room-test")
    .collection("messages").doc("room-message-test");
  const importantChatRef = db.collection("directChats").doc("retention-important-chat-test");
  const importantRecentMessageRef = importantChatRef.collection("messages").doc("important-recent-message-test");
  const importantExpiredMessageRef = importantChatRef.collection("messages").doc("important-expired-message-test");
  const temporaryChatRef = db.collection("directChats").doc("retention-temporary-chat-test");
  const temporaryMessageRef = temporaryChatRef.collection("messages").doc("temporary-message-test");
  const corruptChatRef = db.collection("directChats").doc("retention-corrupt-chat-test");
  const corruptMessageRef = corruptChatRef.collection("messages").doc("corrupt-mode-message-test");
  const notificationRef = db.collection("users").doc("retention-recipient-test")
    .collection("notifications").doc("direct-message-test");
  const unrelatedRef = db.collection("users").doc("retention-recipient-test")
    .collection("messages").doc("unrelated-message-test");

  await Promise.all([
    chatRef.set({
    participantUids: ["retention-sender-test", "retention-recipient-test"],
    lastMessageAt: old,
    lastMessagePreview: "expired private text preview",
    lastMessageSenderUid: "retention-sender-test",
    retentionMode: "normal",
  }),
    importantChatRef.set({ retentionMode: "important", lastMessageAt: old, lastMessagePreview: "important preview" }),
    temporaryChatRef.set({ retentionMode: "temporary", lastMessageAt: veryOld, lastMessagePreview: "temporary preview" }),
    corruptChatRef.set({ retentionMode: "unknown" }),
  ]);
  await directMessageRef.set({
    messageId: directMessageRef.id,
    senderUid: "retention-sender-test",
    recipientUid: "retention-recipient-test",
    text: "expired direct message body",
    type: "text",
    createdAt: old,
  });
  await Promise.all([
    importantRecentMessageRef.set({ messageId: importantRecentMessageRef.id, text: "keep until thirty days", type: "text", createdAt: old }),
    importantExpiredMessageRef.set({ messageId: importantExpiredMessageRef.id, text: "delete after thirty days", type: "text", createdAt: veryOld }),
    temporaryMessageRef.set({ messageId: temporaryMessageRef.id, text: "retain until full temporary chat expiry", type: "text", createdAt: veryOld }),
    corruptMessageRef.set({ messageId: corruptMessageRef.id, text: "fail closed on corrupt mode", type: "text", createdAt: veryOld }),
  ]);
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
    assert.equal(result.failures, 1);
    assert.equal(result.messages, 3);
    assert.equal((await directMessageRef.get()).exists, false);
    assert.equal((await roomMessageRef.get()).exists, false);
    assert.equal((await importantRecentMessageRef.get()).exists, true);
    assert.equal((await importantExpiredMessageRef.get()).exists, false);
    assert.equal((await temporaryMessageRef.get()).exists, true);
    assert.equal((await corruptMessageRef.get()).exists, true);
    assert.equal((await notificationRef.get()).exists, false);
    assert.equal((await unrelatedRef.get()).exists, true);

    const chat = await chatRef.get();
    assert.equal(chat.data().lastMessagePreview, undefined);
    assert.equal(chat.data().lastMessageAt, undefined);
    assert.equal(chat.data().lastMessageSenderUid, undefined);
    assert.equal(chat.data().messageDeletionRevision, 1);
    assert.equal((await importantChatRef.get()).data().messageDeletionRevision, 1);
  } finally {
    await Promise.all([
      chatRef.delete().catch(() => undefined),
      importantChatRef.delete().catch(() => undefined),
      temporaryChatRef.delete().catch(() => undefined),
      corruptChatRef.delete().catch(() => undefined),
      notificationRef.delete().catch(() => undefined),
      unrelatedRef.delete().catch(() => undefined),
      db.collection("rooms").doc("retention-room-test").delete().catch(() => undefined),
      db.collection("users").doc("retention-recipient-test").delete().catch(() => undefined),
    ]);
  }
});


test("hourly chat-room media scope never touches independent media purposes", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const ownerUid = "retention-scope-owner-" + suffix;
  const ids = {
    chat: "10000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
    room: "20000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
    profile_album: "30000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
    story: "40000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
    avatar_cover: "50000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
    sticker: "60000000-0000-4000-8000-" + suffix.padStart(12, "0").slice(-12),
  };
  const refs = Object.entries(ids).map(([purpose, mediaId]) => ({
    purpose, mediaId, ref: db.collection("mediaAssets").doc(mediaId),
  }));
  const expired = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
  await Promise.all(refs.map(({ purpose, mediaId, ref }) => ref.set({
    mediaId, ownerUid, uploaderType: "member", mediaPurpose: purpose,
    status: "security_approved", retentionExpiresAt: expired, createdAt: expired,
  })));
  try {
    const result = await runChatMediaRetentionSweep(["chat", "room"]);
    assert.equal(result.failures, 0);
    for (const entry of refs) {
      const snapshot = await entry.ref.get();
      if (entry.purpose === "chat" || entry.purpose === "room") {
        assert.equal(snapshot.data().status, "self_destructed", entry.purpose);
      } else {
        assert.equal(snapshot.data().status, "security_approved", entry.purpose);
      }
    }
  } finally {
    await Promise.all(refs.map(({ ref }) => ref.delete().catch(() => undefined)));
  }
});

test.after(async () => {
  await deleteApp(app);
});


test("legacy chat media without an expiry uses server send time rather than old upload creation time", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const mediaId = "71000000-0000-4000-8000-" + Date.now().toString().padStart(12, "0").slice(-12);
  const ownerUid = "legacy-retention-owner";
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const oldUpload = Timestamp.fromMillis(Date.now() - 8 * 60 * 60 * 1000);
  const recentSend = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
  await assetRef.set({
    mediaId, ownerUid, mediaPurpose: "chat", status: "security_approved",
    createdAt: oldUpload, mediaSentAt: recentSend, retentionExpiresAt: null,
    linkedMessageId: "a".repeat(64), linkedConversationId: "legacy-chat",
  });
  try {
    const result = await runChatMediaRetentionSweep(["chat", "room"]);
    assert.equal(result.failures, 0);
    assert.equal((await assetRef.get()).data().status, "security_approved");
  } finally {
    await assetRef.delete().catch(() => undefined);
  }
});

test("seven-day profile gallery retention removes original and preview objects but honors a legal hold", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const ownerUid = `gallery-owner-${suffix}`;
  const mediaId = `aaaaaaaa-bbbb-cccc-dddd-${suffix.padStart(12, "0").slice(-12)}`;
  const heldMediaId = `bbbbbbbb-cccc-dddd-eeee-${suffix.padStart(12, "0").slice(-12)}`;
  const storyMediaId = `cccccccc-dddd-eeee-ffff-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${ownerUid}/${mediaId}`;
  const previewPath = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const heldObjectPath = `quarantine/${ownerUid}/${heldMediaId}`;
  const storyObjectPath = `quarantine/${ownerUid}/${storyMediaId}`;
  const storyPreviewPath = `processed/${ownerUid}/${storyMediaId}/preview.webp`;
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const heldAssetRef = db.collection("mediaAssets").doc(heldMediaId);
  const storyAssetRef = db.collection("mediaAssets").doc(storyMediaId);
  const storyRef = db.collection("stories").doc(`expired-story-${suffix}`);
  const additionalExpiredStoryRefs = Array.from({ length: 151 }, (_, index) =>
    db.collection("stories").doc("expired-story-" + suffix + "-page-" + index));
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  const heldOriginal = bucket.file(heldObjectPath);
  const storyOriginal = bucket.file(storyObjectPath);
  const storyPreview = bucket.file(storyPreviewPath);
  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);

  await Promise.all([
    original.save(Buffer.from("gallery original"), { resumable: false }),
    preview.save(Buffer.from("gallery preview"), { resumable: false }),
    heldOriginal.save(Buffer.from("held gallery original"), { resumable: false }),
    storyOriginal.save(Buffer.from("expired story original"), { resumable: false }),
    storyPreview.save(Buffer.from("expired story preview"), { resumable: false }),
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
    storyAssetRef.set({
      mediaId: storyMediaId, ownerUid, uploaderType: "member", mediaPurpose: "story",
      objectPath: storyObjectPath, safePreviewPath: storyPreviewPath,
      status: "security_approved", retentionPolicyStatus: "delete_at_story_expiry",
      storyExpiresAt: old, retentionExpiresAt: old, storyDocumentId: storyRef.id, createdAt: old,
    }),
    storyRef.set({
      ownerUid, mediaId: storyMediaId, status: "active", createdAt: old, expiresAt: old,
    }),
    ...additionalExpiredStoryRefs.map((ref) => ref.set({
      ownerUid, mediaId: "expired-story-media-" + ref.id, status: "active", createdAt: old, expiresAt: old,
    })),
  ]);

  try {
    const result = await runIndependentMediaRetentionSweep();
    assert.equal(result.failures, 0);
    const deletedAsset = (await assetRef.get()).data();
    assert.equal(deletedAsset.status, "self_destructed");
    assert.equal(deletedAsset.retentionPolicyStatus, "seven_day_profile_album_deleted");
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
    assert.equal((await heldAssetRef.get()).data().status, "security_approved");
    assert.equal((await heldOriginal.exists())[0], true);
    const expiredStory = (await storyAssetRef.get()).data();
    assert.equal(expiredStory.status, "self_destructed");
    assert.equal(expiredStory.retentionPolicyStatus, "story_expired_deleted");
    assert.equal((await storyOriginal.exists())[0], false);
    assert.equal((await storyPreview.exists())[0], false);
    assert.equal((await storyRef.get()).exists, false);
    const remainingExpiredStories = await Promise.all(
      additionalExpiredStoryRefs.map(async (ref) => (await ref.get()).exists));
    assert.equal(remainingExpiredStories.some(Boolean), false);

    // A signed upload or processor that was already in flight may recreate an
    // exact object after the first sweep. The tombstone reconciliation must
    // remove both the original and its preview again.
    await Promise.all([
      original.save(Buffer.from("late original replay"), { resumable: false }),
      preview.save(Buffer.from("late preview replay"), { resumable: false }),
    ]);
    await assetRef.update({ retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000) });
    const reconciled = await runIndependentMediaRetentionSweep();
    assert.equal(reconciled.failures, 0);
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      heldAssetRef.delete().catch(() => undefined),
      storyAssetRef.delete().catch(() => undefined),
      storyRef.delete().catch(() => undefined),
      storyOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
      storyPreview.delete({ ignoreNotFound: true }).catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
      heldOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});


test("expired story documents are removed from the feed while active stories remain", async () => {
  const expiredRef = db.collection("stories").doc(`expired-story-${Date.now()}`);
  const activeRef = db.collection("stories").doc(`active-story-${Date.now()}`);
  await Promise.all([
    expiredRef.set({
      ownerUid: "story-owner", mediaId: "expired-media",
      status: "active", expiresAt: Timestamp.fromMillis(Date.now() - 1000),
    }),
    activeRef.set({
      ownerUid: "story-owner", mediaId: "active-media",
      status: "active", expiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000),
    }),
  ]);
  try {
    await runIndependentMediaRetentionSweep();
    assert.equal((await expiredRef.get()).exists, false);
    assert.equal((await activeRef.get()).exists, true);
  } finally {
    await Promise.all([
      expiredRef.delete().catch(() => undefined),
      activeRef.delete().catch(() => undefined),
    ]);
  }
});


test("manual message-media deletion pending state is retried and reconciled", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const ownerUid = `manual-delete-owner-${suffix}`;
  const mediaId = `dddddddd-eeee-ffff-aaaa-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${ownerUid}/${mediaId}`;
  const previewPath = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const derivativePaths = [
    `processed/${ownerUid}/${mediaId}/animation.gif`,
    `processed/${ownerUid}/${mediaId}/audio.mp3`,
    `processed/${ownerUid}/${mediaId}/video.mp4`,
    `processed/${ownerUid}/${mediaId}/document.pdf`,
  ];
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  const derivatives = derivativePaths.map((path) => bucket.file(path));
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  await Promise.all([
    original.save(Buffer.from("pending manual delete original"), { resumable: false }),
    preview.save(Buffer.from("pending manual delete preview"), { resumable: false }),
    ...derivatives.map((file) => file.save(Buffer.from("pending typed derivative"), { resumable: false })),
    assetRef.set({
      mediaId, ownerUid, uploaderType: "member", mediaPurpose: "chat",
      objectPath, safePreviewPath: previewPath,
      safeAnimationPath: derivativePaths[0], safeAudioPath: derivativePaths[1],
      safeVideoPath: derivativePaths[2], safeDocumentPath: derivativePaths[3],
      status: "manual_deletion_pending",
      retentionExpiresAt: Timestamp.fromMillis(Date.now() - 1000),
      createdAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
      legalHoldStatus: "none",
    }),
  ]);
  try {
    const result = await runChatMediaRetentionSweep();
    assert.equal(result.failures, 0);
    const tombstone = (await assetRef.get()).data();
    assert.equal(tombstone.status, "manually_deleted");
    assert.equal(tombstone.retentionPolicyStatus, "manual_delete_for_everyone_completed");
    assert.ok(tombstone.retentionReconcileAt instanceof Timestamp);
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
    for (const file of derivatives) assert.equal((await file.exists())[0], false);

    await Promise.all([
      original.save(Buffer.from("late replay original"), { resumable: false }),
      preview.save(Buffer.from("late replay preview"), { resumable: false }),
      derivatives[0].save(Buffer.from("late replay animation"), { resumable: false }),
    ]);
    await assetRef.update({ retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000) });
    const reconciled = await runChatMediaRetentionSweep();
    assert.equal(reconciled.failures, 0);
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
    assert.equal((await derivatives[0].exists())[0], false);
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
      ...derivatives.map((file) => file.delete({ ignoreNotFound: true }).catch(() => undefined)),
    ]);
  }
});

test("sticker media stays outside the five-minute sweep and is deleted by the isolated hourly lifecycle", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const ownerUid = `sticker-owner-${suffix}`;
  const mediaId = `eeeeeeee-ffff-aaaa-bbbb-${suffix.padStart(12, "0").slice(-12)}`;
  const heldMediaId = `ffffffff-aaaa-bbbb-cccc-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${ownerUid}/${mediaId}`;
  const previewPath = `processed/${ownerUid}/${mediaId}/preview.webp`;
  const heldObjectPath = `quarantine/${ownerUid}/${heldMediaId}`;
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  const heldOriginal = bucket.file(heldObjectPath);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const heldAssetRef = db.collection("mediaAssets").doc(heldMediaId);
  const storyRef = db.collection("stories").doc(`sticker-sweep-story-${suffix}`);
  const expiredAt = Timestamp.fromMillis(Date.now() - 2 * 60 * 60 * 1000);
  const expiredStory = {
    ownerUid, mediaId: "sticker-sweep-story-media", status: "active",
    createdAt: expiredAt, expiresAt: expiredAt,
  };

  await Promise.all([
    original.save(Buffer.from("expired sticker asset"), { resumable: false }),
    preview.save(Buffer.from("expired sticker preview"), { resumable: false }),
    heldOriginal.save(Buffer.from("held sticker asset"), { resumable: false }),
    storyRef.set(expiredStory),
    assetRef.set({
      mediaId, ownerUid, uploaderType: "owner", mediaPurpose: "sticker",
      objectPath, safePreviewPath: previewPath, status: "security_approved",
      retentionPolicyStatus: "one_hour_sticker_asset",
      retentionExpiresAt: expiredAt, createdAt: expiredAt,
      legalHoldStatus: "none",
    }),
    heldAssetRef.set({
      mediaId: heldMediaId, ownerUid, uploaderType: "owner", mediaPurpose: "sticker",
      objectPath: heldObjectPath, status: "security_approved",
      retentionPolicyStatus: "one_hour_sticker_asset",
      retentionExpiresAt: expiredAt, createdAt: expiredAt,
      legalHoldStatus: "active", activeLegalHoldId: "test-sticker-hold",
    }),
  ]);

  try {
    const generalSweep = await runChatMediaRetentionSweep();
    assert.equal(generalSweep.failures, 0);
    assert.equal((await assetRef.get()).data().status, "security_approved");
    assert.equal((await heldAssetRef.get()).data().status, "security_approved");
    assert.equal((await original.exists())[0], true);
    assert.equal((await preview.exists())[0], true);
    assert.equal((await heldOriginal.exists())[0], true);

    // A purpose-scoped sticker sweep must not remove expired story documents.
    await storyRef.set(expiredStory);
    const stickerSweep = await runStickerMediaRetentionSweep();
    assert.equal(stickerSweep.failures, 0);
    assert.equal((await assetRef.get()).data().status, "self_destructed");
    assert.equal((await assetRef.get()).data().retentionPolicyStatus, "one_hour_sticker_asset_deleted");
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
    assert.equal((await heldAssetRef.get()).data().status, "security_approved");
    assert.equal((await heldOriginal.exists())[0], true);
    assert.equal((await storyRef.get()).exists, true);

    const audit = await db.collection("mediaAccessAudit").where("mediaId", "==", mediaId).get();
    assert.ok(audit.docs.some((doc) =>
      doc.data().action === "sticker_asset_expired_deleted" && doc.data().outcome === "success"));

    // Releasing a legal hold allows the next hourly sweep to complete deletion.
    await heldAssetRef.update({ legalHoldStatus: "released" });
    const afterHoldRelease = await runStickerMediaRetentionSweep();
    assert.equal(afterHoldRelease.failures, 0);
    assert.equal((await heldAssetRef.get()).data().status, "self_destructed");
    assert.equal((await heldOriginal.exists())[0], false);

    // A late scanner/upload replay must be removed by tombstone reconciliation.
    await Promise.all([
      original.save(Buffer.from("late sticker replay"), { resumable: false }),
      preview.save(Buffer.from("late sticker preview replay"), { resumable: false }),
    ]);
    await assetRef.update({ retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000) });
    const reconciled = await runStickerMediaRetentionSweep();
    assert.equal(reconciled.failures, 0);
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      heldAssetRef.delete().catch(() => undefined),
      storyRef.delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
      heldOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});

