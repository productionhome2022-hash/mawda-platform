const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");

// Functions are invoked directly against the Firestore Emulator. No production
// project or credentials are used by this suite.
const {
  deleteDirectMessageForMe,
  deleteDirectMessageForEveryone,
  deleteRoomMessage,
  deleteRoomMessageForMe,
  getDirectMessages,
} = require("../../lib/index");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { deleteMediaAssetForMessage } = require("../../lib/media");
const db = getFirestore();

const id = (value) => createHash("sha256").update(value).digest("hex");
const memberRequest = (uid, data) => ({
  data,
  auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});

test("direct delete-for-me hides only for the caller and preserves peer copy", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const [alice, bob] = [`alice-${suffix}`, `bob-${suffix}`];
  const chatId = id(`chat-${suffix}`);
  const messageId = id(`message-${suffix}`);
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);

  await chatRef.set({ participantUids: [alice, bob] });
  await messageRef.set({
    messageId, chatId, senderUid: alice, recipientUid: bob,
    text: "private text", type: "text",
  });

  try {
    const result = await deleteDirectMessageForMe.run(memberRequest(alice, { chatId, messageId }));
    assert.equal(result.hiddenForRequester, true);
    const stored = await messageRef.get();
    assert.deepEqual(stored.data().deletedForUids, [alice]);
    assert.equal(stored.data().text, "private text");
    await assert.rejects(
      () => deleteDirectMessageForMe.run(memberRequest(id("outsider"), { chatId, messageId })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await Promise.all([chatRef.delete().catch(() => undefined), messageRef.delete().catch(() => undefined)]);
    await db.collection("directMessageDeletionAudit")
      .where("chatId", "==", chatId).get()
      .then((snapshot) => Promise.all(snapshot.docs.map((doc) => doc.ref.delete())));
  }
});

test("direct delete-for-everyone removes text and notifications, redacts preview, and is idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const [alice, bob] = [`alice-${suffix}`, `bob-${suffix}`];
  const chatId = id(`chat-everyone-${suffix}`);
  const messageId = id(`message-everyone-${suffix}`);
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const notifications = [alice, bob].map((uid) =>
    db.collection("users").doc(uid).collection("notifications").doc(messageId),
  );
  const longText = "x".repeat(150);
  const sentAt = Timestamp.now();
  await chatRef.set({
    participantUids: [alice, bob],
    lastMessagePreview: longText.substring(0, 120),
    lastMessageSenderUid: alice,
    lastMessageAt: sentAt,
  });
  await messageRef.set({
    messageId, chatId, senderUid: alice, recipientUid: bob,
    text: longText, type: "text", createdAt: sentAt,
  });
  await notifications[1].set({ type: "direct_message", messageId });

  try {
    const request = memberRequest(alice, { chatId, messageId });
    const first = await deleteDirectMessageForEveryone.run(request);
    assert.equal(first.deleted, true);
    assert.equal(first.idempotentReplay, false);
    assert.equal((await messageRef.get()).exists, false);
    assert.equal((await notifications[1].get()).exists, false);
    assert.equal((await chatRef.get()).data().lastMessagePreview, "تم حذف الرسالة");

    const replay = await deleteDirectMessageForEveryone.run(request);
    assert.equal(replay.deleted, true);
    assert.equal(replay.idempotentReplay, true);
  } finally {
    await Promise.all([
      chatRef.delete().catch(() => undefined),
      messageRef.delete().catch(() => undefined),
      ...notifications.map((ref) => ref.delete().catch(() => undefined)),
      ...[alice, bob].map((uid) => db.collection("users").doc(uid).delete().catch(() => undefined)),
    ]);
    await db.collection("directMessageDeletionAudit")
      .where("chatId", "==", chatId).get()
      .then((snapshot) => Promise.all(snapshot.docs.map((doc) => doc.ref.delete())));
  }
});

test("direct delete-for-everyone denies peer and refuses media records without deleting them", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const [alice, bob] = [`alice-${suffix}`, `bob-${suffix}`];
  const chatId = id(`chat-media-${suffix}`);
  const messageId = id(`message-media-${suffix}`);
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  await chatRef.set({ participantUids: [alice, bob] });
  await messageRef.set({
    messageId, chatId, senderUid: alice, recipientUid: bob,
    text: "image", type: "image", storagePath: "chat-media/example",
  });

  try {
    await assert.rejects(
      () => deleteDirectMessageForEveryone.run(memberRequest(bob, { chatId, messageId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => deleteDirectMessageForEveryone.run(memberRequest(alice, { chatId, messageId })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await messageRef.get()).exists, true);
    assert.equal((await messageRef.get()).data().storagePath, "chat-media/example");
  } finally {
    await Promise.all([chatRef.delete().catch(() => undefined), messageRef.delete().catch(() => undefined)]);
  }
});

test("room delete-for-me is member-scoped and room delete-for-everyone erases text idempotently", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const [alice, bob] = [`room-alice-${suffix}`, `room-bob-${suffix}`];
  const roomId = `room-${suffix}`;
  const messageId = id(`room-message-${suffix}`);
  const roomRef = db.collection("rooms").doc(roomId);
  const messageRef = roomRef.collection("messages").doc(messageId);
  await roomRef.set({ ownerUid: alice, status: "active" });
  await Promise.all([alice, bob].map((uid) =>
    roomRef.collection("members").doc(uid).set({ uid, role: "member" }),
  ));
  await messageRef.set({
    messageId, senderUid: alice, content: "room text", type: "text", isDeleted: false,
  });

  try {
    const hidden = await deleteRoomMessageForMe.run(memberRequest(bob, { roomId, messageId }));
    assert.equal(hidden.hiddenForRequester, true);
    assert.deepEqual((await messageRef.get()).data().deletedForUids, [bob]);

    const removed = await deleteRoomMessage.run(memberRequest(alice, { roomId, messageId }));
    assert.equal(removed.deleted, true);
    assert.equal((await messageRef.get()).exists, false);
    const replay = await deleteRoomMessage.run(memberRequest(alice, { roomId, messageId }));
    assert.equal(replay.idempotentReplay, true);
  } finally {
    await Promise.all([
      roomRef.delete().catch(() => undefined),
      messageRef.delete().catch(() => undefined),
      roomRef.collection("members").doc(alice).delete().catch(() => undefined),
      roomRef.collection("members").doc(bob).delete().catch(() => undefined),
    ]);
    await db.collection("roomAuditLogs")
      .where("roomId", "==", roomId).get()
      .then((snapshot) => Promise.all(snapshot.docs.map((doc) => doc.ref.delete())));
  }
});

test("room delete-for-everyone refuses media records rather than orphaning Storage objects", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const suffix = Date.now().toString();
  const alice = `room-media-owner-${suffix}`;
  const roomId = `room-media-${suffix}`;
  const messageId = id(`room-media-message-${suffix}`);
  const roomRef = db.collection("rooms").doc(roomId);
  const messageRef = roomRef.collection("messages").doc(messageId);
  await roomRef.set({ ownerUid: alice, status: "active" });
  await roomRef.collection("members").doc(alice).set({ uid: alice, role: "owner" });
  await messageRef.set({
    messageId, senderUid: alice, content: "media", type: "image",
    storagePath: "room-media/example",
  });
  try {
    await assert.rejects(
      () => deleteRoomMessage.run(memberRequest(alice, { roomId, messageId })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await messageRef.get()).exists, true);
  } finally {
    await Promise.all([
      roomRef.delete().catch(() => undefined),
      messageRef.delete().catch(() => undefined),
      roomRef.collection("members").doc(alice).delete().catch(() => undefined),
    ]);
  }
});


test("direct and room delete-for-everyone erase original and sanitized media generations", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const alice = `media-owner-${suffix}`;
  const bob = `media-peer-${suffix}`;
  const directChatId = id(`media-direct-chat-${suffix}`);
  const directMessageId = id(`media-direct-message-${suffix}`);
  const directMediaId = `12345678-1234-1234-1234-${suffix.padStart(12, "0").slice(-12)}`;
  const directObjectPath = `quarantine/${alice}/${directMediaId}`;
  const directPreviewPath = `processed/${alice}/${directMediaId}/preview.webp`;
  const directAssetRef = db.collection("mediaAssets").doc(directMediaId);
  const directChatRef = db.collection("directChats").doc(directChatId);
  const directMessageRef = directChatRef.collection("messages").doc(directMessageId);
  const directOriginal = bucket.file(directObjectPath);
  const directPreview = bucket.file(directPreviewPath);

  const roomId = `media-room-${suffix}`;
  const roomMessageId = id(`media-room-message-${suffix}`);
  const roomMediaId = `87654321-4321-4321-4321-${suffix.padStart(12, "0").slice(-12)}`;
  const roomObjectPath = `quarantine/${alice}/${roomMediaId}`;
  const roomPreviewPath = `processed/${alice}/${roomMediaId}/preview.webp`;
  const roomAssetRef = db.collection("mediaAssets").doc(roomMediaId);
  const roomRef = db.collection("rooms").doc(roomId);
  const roomMessageRef = roomRef.collection("messages").doc(roomMessageId);
  const roomOriginal = bucket.file(roomObjectPath);
  const roomPreview = bucket.file(roomPreviewPath);

  await directChatRef.set({ participantUids: [alice, bob] });
  await Promise.all([
    directOriginal.save(Buffer.from("original image bytes"), { resumable: false, metadata: { contentType: "image/jpeg" } }),
    directPreview.save(Buffer.from("sanitized webp bytes"), { resumable: false, metadata: { contentType: "image/webp" } }),
    roomOriginal.save(Buffer.from("original room image bytes"), { resumable: false, metadata: { contentType: "image/jpeg" } }),
    roomPreview.save(Buffer.from("sanitized room webp bytes"), { resumable: false, metadata: { contentType: "image/webp" } }),
  ]);
  const [[directOriginalMeta], [directPreviewMeta], [roomOriginalMeta], [roomPreviewMeta]] = await Promise.all([
    directOriginal.getMetadata(), directPreview.getMetadata(),
    roomOriginal.getMetadata(), roomPreview.getMetadata(),
  ]);
  const now = Timestamp.now();
  await Promise.all([
    directAssetRef.set({
      mediaId: directMediaId, ownerUid: alice, uploaderType: "member",
      mediaPurpose: "chat", objectPath: directObjectPath, storageGeneration: String(directOriginalMeta.generation),
      safePreviewPath: directPreviewPath, safePreviewGeneration: String(directPreviewMeta.generation),
      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
    }),
    roomAssetRef.set({
      mediaId: roomMediaId, ownerUid: alice, uploaderType: "member",
      mediaPurpose: "room", objectPath: roomObjectPath, storageGeneration: String(roomOriginalMeta.generation),
      safePreviewPath: roomPreviewPath, safePreviewGeneration: String(roomPreviewMeta.generation),
      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
    }),
    directMessageRef.set({
      messageId: directMessageId, chatId: directChatId, senderUid: alice, recipientUid: bob,
      type: "image", mediaId: directMediaId, mediaContentType: "image/webp", createdAt: now,
    }),
    roomRef.set({ ownerUid: alice, status: "active" }),
  ]);
  await roomRef.collection("members").doc(alice).set({ uid: alice, role: "owner" });
  await roomMessageRef.set({
    messageId: roomMessageId, senderUid: alice, type: "image",
    mediaId: roomMediaId, mediaContentType: "image/webp", createdAt: now,
  });

  try {
    const directResult = await deleteDirectMessageForEveryone.run(
      memberRequest(alice, { chatId: directChatId, messageId: directMessageId }),
    );
    assert.equal(directResult.deleted, true);
    assert.equal((await directMessageRef.get()).exists, false);
    const directTombstone = (await directAssetRef.get()).data();
    assert.equal(directTombstone.status, "manually_deleted");
    assert.ok(directTombstone.deletedObjectPaths.includes(directObjectPath));
    assert.ok(directTombstone.deletedObjectPaths.includes(directPreviewPath));
    assert.equal((await directOriginal.exists())[0], false);
    assert.equal((await directPreview.exists())[0], false);

    // Simulate a still-live signed PUT capability replay after message deletion.
    await directOriginal.save(Buffer.from("late signed upload replay"), { resumable: false });
    await deleteMediaAssetForMessage(directMediaId, alice, "chat");
    assert.equal((await directOriginal.exists())[0], false);

    const roomResult = await deleteRoomMessage.run(
      memberRequest(alice, { roomId, messageId: roomMessageId }),
    );
    assert.equal(roomResult.deleted, true);
    assert.equal((await roomMessageRef.get()).exists, false);
    assert.equal((await roomAssetRef.get()).data().status, "manually_deleted");
    assert.equal((await roomOriginal.exists())[0], false);
    assert.equal((await roomPreview.exists())[0], false);
  } finally {
    await Promise.all([
      directAssetRef.delete().catch(() => undefined),
      roomAssetRef.delete().catch(() => undefined),
      directChatRef.delete().catch(() => undefined),
      roomRef.delete().catch(() => undefined),
      roomRef.collection("members").doc(alice).delete().catch(() => undefined),
      directOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
      directPreview.delete({ ignoreNotFound: true }).catch(() => undefined),
      roomOriginal.delete({ ignoreNotFound: true }).catch(() => undefined),
      roomPreview.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});

test("a legal hold hides the message while preventing media erasure; retry after release completes deletion", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const [alice, bob] = [`held-media-owner-${suffix}`, `held-media-peer-${suffix}`];
  const chatId = id(`held-media-chat-${suffix}`);
  const messageId = id(`held-media-message-${suffix}`);
  const mediaId = `abcdefab-cdef-abcd-efab-${suffix.padStart(12, "0").slice(-12)}`;
  const objectPath = `quarantine/${alice}/${mediaId}`;
  const previewPath = `processed/${alice}/${mediaId}/preview.webp`;
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const original = bucket.file(objectPath);
  const preview = bucket.file(previewPath);
  await Promise.all([
    original.save(Buffer.from("held original"), { resumable: false }),
    preview.save(Buffer.from("held derivative"), { resumable: false }),
  ]);
  const [originalMeta] = await original.getMetadata();
  const [previewMeta] = await preview.getMetadata();
  await chatRef.set({ participantUids: [alice, bob] });
  await Promise.all([alice, bob].map((uid) =>
    db.collection("users").doc(uid).set({ profileCompleted: true, accountStatus: "active" }),
  ));
  await assetRef.set({
    mediaId, ownerUid: alice, mediaPurpose: "chat", objectPath,
    storageGeneration: String(originalMeta.generation),
    safePreviewPath: previewPath, safePreviewGeneration: String(previewMeta.generation),
    status: "security_approved", legalHoldStatus: "active", activeLegalHoldId: "test-hold",
    retentionPolicyStatus: "legal_hold", createdAt: Timestamp.now(),
  });
  await messageRef.set({
    messageId, senderUid: alice, recipientUid: bob, type: "image", mediaId,
    createdAt: Timestamp.now(),
  });
  try {
    await assert.rejects(
      () => deleteDirectMessageForEveryone.run(memberRequest(alice, { chatId, messageId })),
      (error) => error && error.code === "unavailable",
    );
    const pending = await messageRef.get();
    assert.equal(pending.data().deletionPending, true);
    assert.equal((await original.exists())[0], true);
    assert.equal((await preview.exists())[0], true);

    const visible = await getDirectMessages.run(memberRequest(alice, { chatId }));
    assert.equal(visible.messages.some((message) => message.messageId === messageId), false);

    await assetRef.update({
      legalHoldStatus: "released",
      activeLegalHoldId: require("firebase-admin/firestore").FieldValue.delete(),
      retentionPolicyStatus: "four_hour_self_destruct",
    });
    const retry = await deleteDirectMessageForEveryone.run(memberRequest(alice, { chatId, messageId }));
    assert.equal(retry.deleted, true);
    assert.equal((await messageRef.get()).exists, false);
    assert.equal((await assetRef.get()).data().status, "manually_deleted");
    assert.equal((await original.exists())[0], false);
    assert.equal((await preview.exists())[0], false);
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      chatRef.delete().catch(() => undefined),
      db.collection("users").doc(alice).delete().catch(() => undefined),
      db.collection("users").doc(bob).delete().catch(() => undefined),
      original.delete({ ignoreNotFound: true }).catch(() => undefined),
      preview.delete({ ignoreNotFound: true }).catch(() => undefined),
    ]);
  }
});


test("delete-for-everyone erases video, audio and document assets in one message", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_STORAGE_EMULATOR_HOST, "Storage emulator is required");
  const bucket = getStorage().bucket();
  const suffix = Date.now().toString();
  const [alice, bob] = [`multi-media-owner-${suffix}`, `multi-media-peer-${suffix}`];
  const chatId = id(`multi-media-chat-${suffix}`);
  const messageId = id(`multi-media-message-${suffix}`);
  const media = [
    { id: `11111111-1111-1111-1111-${suffix.padStart(12, "0").slice(-12)}`, type: "video", contentType: "video/mp4", bytes: "video-bytes" },
    { id: `22222222-2222-2222-2222-${suffix.padStart(12, "0").slice(-12)}`, type: "audio", contentType: "audio/mpeg", bytes: "audio-bytes" },
    { id: `33333333-3333-3333-3333-${suffix.padStart(12, "0").slice(-12)}`, type: "document", contentType: "application/pdf", bytes: "pdf-bytes" },
  ].map((item) => ({
    ...item,
    path: `quarantine/${alice}/${item.id}`,
    ref: db.collection("mediaAssets").doc(item.id),
  }));
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  await chatRef.set({ participantUids: [alice, bob] });

  try {
    for (const item of media) {
      const object = bucket.file(item.path);
      await object.save(Buffer.from(item.bytes), {
        resumable: false, metadata: { contentType: item.contentType },
      });
      const [metadata] = await object.getMetadata();
      await item.ref.set({
        mediaId: item.id,
        ownerUid: alice,
        uploaderType: "member",
        mediaPurpose: "chat",
        objectPath: item.path,
        storageGeneration: String(metadata.generation),
        detectedContentType: item.contentType,
        status: "scanner_clean_pending_processing",
        retentionPolicyStatus: "four_hour_self_destruct",
        retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
        createdAt: Timestamp.now(),
      });
    }
    await messageRef.set({
      messageId, senderUid: alice, recipientUid: bob, type: "attachment",
      mediaIds: media.map((item) => item.id),
      createdAt: Timestamp.now(),
    });

    const result = await deleteDirectMessageForEveryone.run(
      memberRequest(alice, { chatId, messageId }),
    );
    assert.equal(result.deleted, true);
    assert.equal((await messageRef.get()).exists, false);
    for (const item of media) {
      assert.equal((await item.ref.get()).data().status, "manually_deleted");
      assert.equal((await bucket.file(item.path).exists())[0], false);
    }
  } finally {
    await Promise.all([
      chatRef.delete().catch(() => undefined),
      ...media.map((item) => item.ref.delete().catch(() => undefined)),
      ...media.map((item) => bucket.file(item.path).delete({ ignoreNotFound: true }).catch(() => undefined)),
    ]);
  }
});
