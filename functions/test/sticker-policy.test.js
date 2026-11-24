const test = require("node:test");
const assert = require("node:assert/strict");
const {
  STICKER_LIMITS,
  validateStickerMediaMetadata,
  validateStickerPackSize,
  validateStickerPackManifest,
  validateStickerSendRequest,
} = require("../lib/sticker-policy.js");
const { projectPublishedStickerPack } = require("../lib/sticker-catalog.js");

test("owner-approved static sticker ceiling is exactly 256 KiB", () => {
  assert.equal(STICKER_LIMITS.staticMaxBytes, 256 * 1024);
  assert.equal(validateStickerMediaMetadata({
    kind: "static", contentType: "image/webp", width: 512, height: 512,
    sizeBytes: 256 * 1024,
  }).sizeBytes, 256 * 1024);
  assert.throws(() => validateStickerMediaMetadata({
    kind: "static", contentType: "image/png", width: 512, height: 512,
    sizeBytes: 256 * 1024 + 1,
  }), /INVALID_STICKER_SIZE/);
});

test("owner-approved animated sticker ceiling is exactly 512 KiB", () => {
  assert.equal(STICKER_LIMITS.animatedMaxBytes, 512 * 1024);
  assert.equal(validateStickerMediaMetadata({
    kind: "animated", contentType: "image/gif", width: 512, height: 512,
    sizeBytes: 512 * 1024, durationMs: 5000, frameCount: 50,
  }).sizeBytes, 512 * 1024);
  assert.throws(() => validateStickerMediaMetadata({
    kind: "animated", contentType: "image/gif", width: 512, height: 512,
    sizeBytes: 512 * 1024 + 1, durationMs: 5000, frameCount: 50,
  }), /INVALID_STICKER_SIZE/);
});

test("sticker metadata rejects invalid formats, dimensions, duration and frames", () => {
  const base = {
    kind: "animated", contentType: "image/gif", width: 512, height: 512,
    sizeBytes: 1024, durationMs: 1000, frameCount: 10,
  };
  for (const patch of [
    { width: 513 }, { durationMs: 5001 }, { frameCount: 51 },
    { contentType: "image/png" }, { width: 0 },
  ]) assert.throws(() => validateStickerMediaMetadata({ ...base, ...patch }));
});

test("sticker pack manifest rejects duplicate identifiers and strips untrusted fields", () => {
  const entry = {
    stickerId: "hello", kind: "static", contentType: "image/png",
    width: 128, height: 128, sizeBytes: 1024,
    downloadUrl: "https://attacker.invalid", storagePath: "private/path",
  };
  const pack = validateStickerPackManifest({
    packId: "starter", title: "Starter", stickers: [entry],
  });
  assert.equal(pack.stickers.length, 1);
  assert.equal("downloadUrl" in pack.stickers[0], false);
  assert.equal("storagePath" in pack.stickers[0], false);
  assert.throws(() => validateStickerPackManifest({
    packId: "starter", title: "Starter", stickers: [entry, entry],
  }), /INVALID_STICKER_ID/);
});

test("sticker send request accepts bounded identifiers and rejects client URLs", () => {
  assert.equal(validateStickerSendRequest({
    scope: "room", targetId: "room-1", packId: "starter",
    stickerId: "hello", clientMessageId: "sticker_msg_123",
  }).scope, "room");
  assert.throws(() => validateStickerSendRequest({
    scope: "direct", targetId: "chat", packId: "starter",
    stickerId: "hello", clientMessageId: "message_123",
    downloadUrl: "https://attacker.invalid",
  }), /UNSUPPORTED_STICKER_SEND_FIELDS/);
});

test("catalog exposes only published approved clean assets", () => {
  const result = projectPublishedStickerPack("starter", {
    status: "published", approved: true, title: "Starter", sortOrder: 1,
    storagePath: "private/pack",
    stickers: [{
      stickerId: "hello", assetId: "asset_hello", scanStatus: "clean",
      kind: "static", contentType: "image/webp", width: 128, height: 128,
      sizeBytes: 1200, storagePath: "private/asset", downloadUrl: "https://private.invalid",
    }],
  });
  assert.equal(result?.stickers[0].assetId, "asset_hello");
  assert.equal("storagePath" in (result ?? {}), false);
  assert.equal("downloadUrl" in (result?.stickers[0] ?? {}), false);
  assert.equal(projectPublishedStickerPack("starter", {
    status: "draft", approved: true, title: "Starter", stickers: [],
  }), null);
});


test("sticker message replay must match sender, media, pack and sticker identity", () => {
  const { stickerMessageReplayMatches } = require("../lib/sticker-policy.js");
  const expected = { senderUid: "sender", mediaId: "media-1", packId: "pack-1", stickerId: "sticker-1" };
  const message = {
    type: "sticker", senderUid: "sender", mediaId: "media-1",
    stickerPackId: "pack-1", stickerId: "sticker-1",
  };
  assert.equal(stickerMessageReplayMatches(message, expected), true);
  assert.equal(stickerMessageReplayMatches({ ...message, stickerId: "other" }, expected), false);
  assert.equal(stickerMessageReplayMatches({ ...message, stickerPackId: "other" }, expected), false);
  assert.equal(stickerMessageReplayMatches({ ...message, senderUid: "other" }, expected), false);
  assert.equal(stickerMessageReplayMatches({ ...message, type: "attachment" }, expected), false);
  assert.equal(stickerMessageReplayMatches(null, expected), false);
});


test("catalog rejects unapproved, unscanned and malformed asset references", () => {
  const base = {
    status: "published",
    approved: true,
    title: "Starter",
    stickers: [{
      stickerId: "hello",
      assetId: "asset_hello",
      scanStatus: "clean",
      kind: "static",
      contentType: "image/png",
      width: 128,
      height: 128,
      sizeBytes: 1000,
    }],
  };
  assert.equal(projectPublishedStickerPack("starter", { ...base, approved: false }), null);
  assert.equal(projectPublishedStickerPack("starter", {
    ...base,
    stickers: [{ ...base.stickers[0], scanStatus: "pending" }],
  }), null);
  assert.equal(projectPublishedStickerPack("starter", {
    ...base,
    stickers: [{ ...base.stickers[0], assetId: "../private" }],
  }), null);
});

test("sticker pack count accepts the configured boundary and rejects empty or oversized packs", () => {
  assert.equal(validateStickerPackSize(STICKER_LIMITS.maxPackStickers), true);
  assert.equal(validateStickerPackSize(STICKER_LIMITS.maxPackStickers + 1), false);
  assert.equal(validateStickerPackSize(0), false);
});

test("sticker pack manifest rejects malformed identifiers and media metadata", () => {
  const entry = {
    stickerId: "hello", kind: "static", contentType: "image/png",
    width: 128, height: 128, sizeBytes: 1024,
  };
  assert.throws(() => validateStickerPackManifest({
    packId: "../private", title: "Starter", stickers: [entry],
  }), /INVALID_STICKER_PACK_ID/);
  assert.throws(() => validateStickerPackManifest({
    packId: "starter", title: "Starter", stickers: [{ ...entry, width: 0 }],
  }), /INVALID_STICKER_DIMENSIONS/);
});

test("published catalog projection excludes private moderation and storage metadata", () => {
  const projected = projectPublishedStickerPack("starter", {
    status: "published", approved: true, title: "Starter",
    internalModerationNote: "private owner note",
    storagePath: "private/sticker-packs/starter",
    stickers: [{
      stickerId: "hello", assetId: "asset_hello", scanStatus: "clean",
      kind: "static", contentType: "image/webp", width: 128, height: 128,
      sizeBytes: 1200, storagePath: "private/asset.webp",
      downloadUrl: "https://private.invalid",
    }],
  });
  assert.equal(projected?.stickers[0].assetId, "asset_hello");
  assert.equal("internalModerationNote" in (projected ?? {}), false);
  assert.equal("storagePath" in (projected ?? {}), false);
  assert.equal("storagePath" in (projected?.stickers[0] ?? {}), false);
  assert.equal("downloadUrl" in (projected?.stickers[0] ?? {}), false);
});
