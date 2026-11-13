const test = require("node:test");
const assert = require("node:assert/strict");
const { initializeApp, deleteApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-retention";
const app = initializeApp({ projectId }, "retention-integration");
const db = getFirestore(app);
const { runChatTextRetentionSweep } = require("../../lib/retention");

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
