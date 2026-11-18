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
