import test from "node:test";
import assert from "node:assert/strict";
import {
  STICKER_LIMITS,
  validateStickerMediaMetadata,
  validateStickerPackSize,
} from "../src/sticker-policy.ts";

test("static sticker standard is square-capable 512px and capped at 256 KiB", () => {
  const sticker = validateStickerMediaMetadata({
    kind: "static", contentType: "image/webp", width: 512, height: 512,
    sizeBytes: STICKER_LIMITS.staticMaxBytes,
  });
  assert.equal(sticker.kind, "static");
});

test("animated sticker is capped at 512 KiB, five seconds and 50 frames", () => {
  const sticker = validateStickerMediaMetadata({
    kind: "animated", contentType: "image/gif", width: 512, height: 512,
    sizeBytes: STICKER_LIMITS.animatedMaxBytes, durationMs: 5_000, frameCount: 50,
  });
  assert.equal(sticker.kind, "animated");
});

test("sticker policy rejects oversized dimensions, bytes, duration and frame counts", () => {
  const base = {
    kind: "animated", contentType: "image/gif", width: 512, height: 512,
    sizeBytes: 1000, durationMs: 1000, frameCount: 10,
  };
  for (const patch of [
    { width: 513 }, { sizeBytes: 512 * 1024 + 1 }, { durationMs: 5001 },
    { frameCount: 51 }, { contentType: "image/png" }, { width: 0 },
  ]) {
    assert.throws(() => validateStickerMediaMetadata({ ...base, ...patch }));
  }
});

test("sticker packs have a bounded item count", () => {
  assert.equal(validateStickerPackSize(120), true);
  assert.equal(validateStickerPackSize(121), false);
  assert.equal(validateStickerPackSize(0), false);
});


import {
  validateStickerPackManifest,
  validateStickerSendRequest,
} from "../src/sticker-policy.ts";

test("sticker pack manifest validates unique bounded entries and strips untrusted asset fields", () => {
  const pack = validateStickerPackManifest({
    packId: "welcome_pack",
    title: "Welcome",
    description: "A small starter pack",
    stickers: [{
      stickerId: "hello",
      kind: "static",
      contentType: "image/png",
      width: 256,
      height: 256,
      sizeBytes: 1024,
      downloadUrl: "https://attacker.invalid/file",
      storagePath: "users/attacker/private",
    }],
  });
  assert.equal(pack.stickers.length, 1);
  assert.equal("downloadUrl" in pack.stickers[0], false);
  assert.equal("storagePath" in pack.stickers[0], false);
});

test("sticker pack manifest rejects duplicate identifiers and malformed metadata", () => {
  const entry = {
    stickerId: "same",
    kind: "static",
    contentType: "image/png",
    width: 128,
    height: 128,
    sizeBytes: 1024,
  };
  assert.throws(() => validateStickerPackManifest({
    packId: "pack",
    title: "Pack",
    stickers: [entry, entry],
  }), /INVALID_STICKER_ID/);
  assert.throws(() => validateStickerPackManifest({
    packId: "../private",
    title: "Pack",
    stickers: [entry],
  }), /INVALID_STICKER_PACK_ID/);
  assert.throws(() => validateStickerPackManifest({
    packId: "pack",
    title: "Pack",
    stickers: [{ ...entry, width: 0 }],
  }), /INVALID_STICKER_DIMENSIONS/);
});

test("sticker send request accepts only bounded identifiers and explicit scope", () => {
  assert.deepEqual(validateStickerSendRequest({
    scope: "room",
    targetId: "public-room-1",
    packId: "welcome_pack",
    stickerId: "hello",
    clientMessageId: "sticker_msg_123",
  }), {
    scope: "room",
    targetId: "public-room-1",
    packId: "welcome_pack",
    stickerId: "hello",
    clientMessageId: "sticker_msg_123",
  });
  assert.throws(() => validateStickerSendRequest({
    scope: "room",
    targetId: "room",
    packId: "pack",
    stickerId: "hello",
    clientMessageId: "short",
  }), /INVALID_STICKER_MESSAGE_ID/);
  assert.throws(() => validateStickerSendRequest({
    scope: "direct",
    targetId: "chat",
    packId: "pack",
    stickerId: "hello",
    clientMessageId: "message_123",
    downloadUrl: "https://attacker.invalid",
  }), /UNSUPPORTED_STICKER_SEND_FIELDS/);
});
