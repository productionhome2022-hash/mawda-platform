const test = require("node:test");
const assert = require("node:assert/strict");
const { LIMITS, audioDurationLimitForPurpose, videoDurationAllowedForPurpose, safeOutputPath } = require("../processors");

test("media processors enforce bounded complexity, duration, page and output budgets", () => {
  assert.equal(LIMITS.gif.maxFrames, 50);
  assert.equal(LIMITS.gif.maxDurationSeconds, 20);
  assert.equal(LIMITS.gif.maxPixels, 40_000_000);
  assert.equal(LIMITS.gif.maxBytes, 3 * 1024 * 1024);
  assert.equal(LIMITS.audio.maxDurationSeconds, 60);
  assert.equal(LIMITS.audio.maxBytes, 5 * 1024 * 1024);
  assert.equal(LIMITS.audio.roomMaxDurationSeconds, 60);
  assert.equal(audioDurationLimitForPurpose("chat"), 60);
  assert.equal(audioDurationLimitForPurpose("room"), 60);
  assert.equal(audioDurationLimitForPurpose("biometric"), 60);
  assert.equal(LIMITS.video.maxBytes, 15 * 1024 * 1024);
  assert.equal(LIMITS.video.maxDurationSeconds, 90);
  assert.equal(LIMITS.pdf.maxBytes, 20 * 1024 * 1024);
  assert.throws(() => audioDurationLimitForPurpose("profile_album"), /AUDIO_PURPOSE_INVALID/);
  assert.throws(() => audioDurationLimitForPurpose(undefined), /AUDIO_PURPOSE_INVALID/);
  assert.equal(LIMITS.video.maxDurationSeconds, 90);
  assert.equal(LIMITS.pdf.maxPages, 30);

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

test("biometric video duration is inclusive from three to five seconds", () => {
  assert.equal(videoDurationAllowedForPurpose("biometric", 3), true);
  assert.equal(videoDurationAllowedForPurpose("biometric", 5), true);
  assert.equal(videoDurationAllowedForPurpose("biometric", 2.999), false);
  assert.equal(videoDurationAllowedForPurpose("biometric", 5.001), false);
  assert.equal(videoDurationAllowedForPurpose("chat", 90), true);
  assert.equal(videoDurationAllowedForPurpose("chat", 90.001), false);
});
