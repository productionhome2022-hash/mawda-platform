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
} = require("../../lib/index");
const { getFirestore } = require("firebase-admin/firestore");
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
  await chatRef.set({
    participantUids: [alice, bob],
    lastMessagePreview: longText.substring(0, 120),
  });
  await messageRef.set({
    messageId, chatId, senderUid: alice, recipientUid: bob,
    text: longText, type: "text",
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
