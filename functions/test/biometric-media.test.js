const test = require("node:test");
const assert = require("node:assert/strict");
const {
  readMp4DurationMs, hasMp4VideoTrack, assertBiometricVideoDurationAllowed,
  assertBiometricVideoFileAllowed,
} = require("../lib/biometric-media");

function atom(type, payload) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(payload.length + 8, 0);
  header.write(type, 4, 4, "ascii");
  return Buffer.concat([header, payload]);
}
function movieHeaderV0(timescale, duration) {
  const payload = Buffer.alloc(20);
  payload.writeUInt8(0, 0);
  payload.writeUInt32BE(timescale, 12);
  payload.writeUInt32BE(duration, 16);
  return atom("mvhd", payload);
}
function movieHeaderV1(timescale, duration) {
  const payload = Buffer.alloc(32);
  payload.writeUInt8(1, 0);
  payload.writeUInt32BE(timescale, 20);
  payload.writeBigUInt64BE(BigInt(duration), 24);
  return atom("mvhd", payload);
}
function handler(type) {
  const payload = Buffer.alloc(12);
  payload.write(type, 8, 4, "ascii");
  return atom("hdlr", payload);
}
function track(type) {
  return atom("trak", atom("mdia", handler(type)));
}
function movie(header, tracks = [track("vide")]) {
  return atom("moov", Buffer.concat([header, ...tracks]));
}

test("reads MP4 version-zero and version-one movie duration from uploaded bytes", () => {
  assert.equal(readMp4DurationMs(movieHeaderV0(1000, 3000)), 3000);
  assert.equal(readMp4DurationMs(movieHeaderV0(1000, 5000)), 5000);
  assert.equal(readMp4DurationMs(movieHeaderV1(600, 2400)), 4000);
});

test("accepts only the inclusive 3–5 second video duration interval", () => {
  for (const duration of [3000, 3500, 5000]) assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
  for (const duration of [0, 2999, 2999.9, 5000.1, 5001, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => assertBiometricVideoDurationAllowed(duration), /DURATION_OUT_OF_RANGE/);
  }
});

test("requires a video track and rejects audio-only MP4 containers", () => {
  const video = movie(movieHeaderV0(1000, 4000), [track("vide")]);
  const audioOnly = movie(movieHeaderV0(1000, 4000), [track("soun")]);
  assert.equal(hasMp4VideoTrack(video), true);
  assert.equal(hasMp4VideoTrack(audioOnly), false);
  assert.equal(assertBiometricVideoFileAllowed(video), 4000);
  assert.throws(() => assertBiometricVideoFileAllowed(audioOnly), /VIDEO_TRACK_MISSING/);
});

test("rejects malformed, missing, unsupported and invalid MP4 movie headers", () => {
  assert.throws(() => readMp4DurationMs(Buffer.alloc(8)), /CONTAINER_INVALID/);
  assert.throws(() => readMp4DurationMs(atom("moov", Buffer.alloc(12))), /DURATION_MISSING/);
  const unsupported = Buffer.alloc(20);
  unsupported.writeUInt8(2, 0);
  assert.throws(() => readMp4DurationMs(movie(atom("mvhd", unsupported))), /VERSION_UNSUPPORTED/);
  assert.throws(() => readMp4DurationMs(movieHeaderV0(0, 4000)), /DURATION_INVALID/);
});
