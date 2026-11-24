const test = require("node:test");
const assert = require("node:assert/strict");
const { expectedSafeDerivativeContract } = require("../lib/media-derivative-contract");

test("trusted media callback expects the purpose-aware audio pipeline contract", () => {
  assert.deepEqual(expectedSafeDerivativeContract("audio"), {
    filename: "audio.mp3",
    contentType: "audio/mpeg",
    pipeline: "ffmpeg-audio-purpose-limit-v2",
    maxBytes: 5 * 1024 * 1024,
  });
});

test("trusted media callback keeps the established non-audio derivative contracts", () => {
  assert.equal(expectedSafeDerivativeContract("gif").pipeline, "gif-sanitize-preserve-animation-v1");
  assert.equal(expectedSafeDerivativeContract("video").pipeline, "ffmpeg-video-transcode-v1");
  assert.equal(expectedSafeDerivativeContract("document").pipeline, "pdf-raster-flatten-v1");
  assert.equal(expectedSafeDerivativeContract("unknown"), null);
});

test("safe derivative categories accept only purposes allowed by the media upload policy", () => {
  const { safeDerivativePurposeAllowed } = require("../lib/media-derivative-contract");
  for (const purpose of ["chat", "room", "profile_album", "avatar_cover", "story"]) {
    assert.equal(safeDerivativePurposeAllowed("gif", purpose, "member"), true, purpose);
  }
  assert.equal(safeDerivativePurposeAllowed("gif", "advertisement", "platform_owner"), true);
  assert.equal(safeDerivativePurposeAllowed("gif", "advertisement", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("audio", "chat", "member"), true);
  assert.equal(safeDerivativePurposeAllowed("audio", "room", "member"), true);
  assert.equal(safeDerivativePurposeAllowed("audio", "biometric", "member"), true);
  assert.equal(safeDerivativePurposeAllowed("audio", "profile_album", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("video", "advertisement", "platform_owner"), true);
  assert.equal(safeDerivativePurposeAllowed("video", "advertisement", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("video", "story", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("video", "biometric", "member"), true);
  assert.equal(safeDerivativePurposeAllowed("document", "chat", "platform_owner"), true);
  assert.equal(safeDerivativePurposeAllowed("document", "room", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("document", "profile_album", "platform_owner"), false);
});

test("sticker animation derivatives are restricted to owner sticker assets", () => {
  const { safeDerivativePurposeAllowed } = require("../lib/media-derivative-contract");
  assert.equal(safeDerivativePurposeAllowed("gif", "sticker", "platform_owner"), true);
  assert.equal(safeDerivativePurposeAllowed("gif", "sticker", "member"), false);
  assert.equal(safeDerivativePurposeAllowed("audio", "sticker", "platform_owner"), false);
  assert.equal(safeDerivativePurposeAllowed("video", "sticker", "platform_owner"), false);
});
