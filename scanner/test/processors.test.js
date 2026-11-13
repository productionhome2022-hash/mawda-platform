const test = require("node:test");
const assert = require("node:assert/strict");
const { LIMITS, safeOutputPath } = require("../processors");

test("media processors enforce bounded complexity, duration, page and output budgets", () => {
  assert.equal(LIMITS.gif.maxFrames, 100);
  assert.equal(LIMITS.gif.maxPixels, 40_000_000);
  assert.equal(LIMITS.audio.maxDurationSeconds, 600);
  assert.equal(LIMITS.video.maxDurationSeconds, 90);
  assert.equal(LIMITS.pdf.maxPages, 30);
  assert.equal(LIMITS.gif.maxBytes, 5 * 1024 * 1024);
  assert.equal(LIMITS.audio.maxBytes, 25 * 1024 * 1024);
  assert.equal(LIMITS.video.maxBytes, 50 * 1024 * 1024);
  assert.equal(LIMITS.pdf.maxBytes, 20 * 1024 * 1024);
});

test("derivative object paths are canonical and cannot escape the owner's media namespace", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(safeOutputPath("member_1", id, "audio.mp3"),
    `processed/member_1/${id}/audio.mp3`);
  for (const args of [
    ["../other", id, "audio.mp3"],
    ["member", id, "../outside"],
    ["member", "not-a-uuid", "video.mp4"],
    ["member", id, "/outside.pdf"],
  ]) {
    assert.throws(() => safeOutputPath(...args), /INVALID_DERIVATIVE_PATH/);
  }
});
