const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  getStickerCatalog, sendStickerMessage, saveStickerPack,
} = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const ownerUid = "sticker_lifecycle_owner_test";
const ownerRequest = (data = {}) => ({
  data,
  auth: { uid: ownerUid, token: {
    platformOwner: true, platformOwnerUid: ownerUid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});
const memberRequest = (uid, data = {}) => ({
  data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});

test("published sticker lifecycle supports catalog, direct send, idempotent replay and expiry denial", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `sticker_sender_${tag}`;
  const recipientUid = `sticker_recipient_${tag}`;
  const packId = `sticker_pack_${tag}`;
  const stickerId = `sticker_${tag}`;
  const assetId = `00000000-0000-4000-8000-${tag.replace(/[^0-9]/g, "").padEnd(12, "1").slice(0, 12)}`;
  const assetRef = db.collection("mediaAssets").doc(assetId);
  const packRef = db.collection("stickerPacks").doc(packId);
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const now = Date.now();
  const metadata = {
    kind: "static", contentType: "image/webp", width: 128, height: 128, sizeBytes: 1200,
  };
  await Promise.all([
    senderRef.set({ profileCompleted: true, accountStatus: "active", age: 24, blockedUids: [] }),
    recipientRef.set({ profileCompleted: true, accountStatus: "active", age: 24, blockedUids: [] }),
    assetRef.set({
      ownerUid, uploaderRole: "platform_owner", mediaPurpose: "sticker",
      status: "security_approved", scannerVerdict: "clean",
      stickerMetadata: metadata, retentionExpiresAt: Timestamp.fromMillis(now + 60 * 60 * 1000),
      storageGeneration: "1", scannerProvider: "test-scanner",
      processingStatus: "safe_raster_derivative_ready",
      safePreviewPath: `processed/${ownerUid}/${assetId}/preview.webp`,
      safePreviewGeneration: "1", safePreviewSha256: "test-hash",
    }),
  ]);
  try {
    const published = await saveStickerPack.run(ownerRequest({
      packId, title: "Lifecycle test", status: "published", sortOrder: 1,
      stickers: [{ stickerId, assetId, ...metadata }],
    }));
    assert.equal(published.status, "published");
    assert.equal((await packRef.get()).data().approved, true);

    const catalog = await getStickerCatalog.run(memberRequest(senderUid));
    const visiblePack = catalog.packs.find((item) => item.packId === packId);
    assert.ok(visiblePack);
    assert.equal(visiblePack.stickers[0].stickerId, stickerId);
    assert.equal(catalog.sendEnabled, true);

    const sendInput = {
      scope: "direct", targetId: recipientUid, packId, stickerId,
      clientMessageId: `sticker_msg_${tag}`,
    };
    const first = await sendStickerMessage.run(memberRequest(senderUid, sendInput));
    assert.equal(first.replayed, false);
    const replay = await sendStickerMessage.run(memberRequest(senderUid, sendInput));
    assert.equal(replay.replayed, true);
    const chatId = first.chatId;
    const message = await db.collection("directChats").doc(chatId)
      .collection("messages").doc(first.messageId).get();
    assert.equal(message.data().type, "sticker");
    assert.equal(message.data().mediaId, assetId);

    await assetRef.update({ retentionExpiresAt: Timestamp.fromMillis(Date.now() - 1) });
    const afterExpiry = await getStickerCatalog.run(memberRequest(senderUid));
    assert.equal(afterExpiry.packs.some((item) => item.packId === packId), false);
    await assert.rejects(
      () => sendStickerMessage.run(memberRequest(senderUid, {
        ...sendInput, clientMessageId: `sticker_msg_expired_${tag}`,
      })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      assetRef.delete().catch(() => undefined),
      packRef.delete().catch(() => undefined),
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
    ]);
    const chats = await db.collection("directChats").where("participantUids", "array-contains", senderUid).get();
    await Promise.all(chats.docs.map(async (chat) => {
      const messages = await chat.ref.collection("messages").get();
      await Promise.all(messages.docs.map((doc) => doc.ref.delete()));
      await chat.ref.delete();
    }));
  }
});
