const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getStickerCatalog,
  getStickerAssetUrl,
  sendStickerMessage,
  saveStickerPack,
} = require("../../lib/index");

const ownerUid = "sticker_lifecycle_owner_test";
const memberUid = "sticker_lifecycle_member_test";
const ownerRequest = (data = {}) => ({
  data,
  auth: { uid: ownerUid, token: {
    platformOwner: true,
    platformOwnerUid: ownerUid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});
const memberRequest = (data = {}) => ({
  data,
  auth: { uid: memberUid, token: { firebase: { sign_in_provider: "password" } } },
});

test("sticker publication, catalog delivery and sending remain fail-closed until lifecycle gates are complete", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");

  const catalog = await getStickerCatalog.run(memberRequest());
  assert.deepEqual(catalog.packs, []);
  assert.equal(catalog.enabled, false);
  assert.equal(catalog.publicationEnabled, false);
  assert.equal(catalog.sendEnabled, false);

  await assert.rejects(
    () => saveStickerPack.run(ownerRequest({
      packId: "starter_test",
      title: "Starter test",
      status: "published",
      stickers: [{
        stickerId: "hello",
        assetId: "00000000-0000-4000-8000-000000000001",
        kind: "static",
        contentType: "image/webp",
        width: 128,
        height: 128,
        sizeBytes: 1200,
      }],
    })),
    (error) => error && error.code === "failed-precondition",
  );

  await assert.rejects(
    () => getStickerAssetUrl.run(memberRequest({
      scope: "room", targetId: "room_test", packId: "starter_test", stickerId: "hello",
    })),
    (error) => error && error.code === "failed-precondition",
  );
  await assert.rejects(
    () => sendStickerMessage.run(memberRequest({
      scope: "room", targetId: "room_test", packId: "starter_test",
      stickerId: "hello", clientMessageId: "sticker_msg_test_01",
    })),
    (error) => error && error.code === "failed-precondition",
  );
});
