const test = require("node:test");
const assert = require("node:assert/strict");
const { expectedSafeDerivativeContract } = require("../lib/media-derivative-contract");

test("trusted media callback expects the purpose-aware audio pipeline contract", () => {
  assert.deepEqual(expectedSafeDerivativeContract("audio"), {
    filename: "audio.mp3",
    contentType: "audio/mpeg",
    pipeline: "ffmpeg-audio-purpose-limit-v2",
    maxBytes: 25 * 1024 * 1024,
  });
});

test("trusted media callback keeps the established non-audio derivative contracts", () => {
  assert.equal(expectedSafeDerivativeContract("gif").pipeline, "gif-sanitize-preserve-animation-v1");
  assert.equal(expectedSafeDerivativeContract("video").pipeline, "ffmpeg-video-transcode-v1");
  assert.equal(expectedSafeDerivativeContract("document").pipeline, "pdf-raster-flatten-v1");
  assert.equal(expectedSafeDerivativeContract("unknown"), null);
});
