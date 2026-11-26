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
function headerV0(type, timescale, duration) {
  const payload = Buffer.alloc(20);
  payload.writeUInt8(0, 0);
  payload.writeUInt32BE(timescale, 12);
  payload.writeUInt32BE(duration, 16);
  return atom(type, payload);
}
function headerV1(type, timescale, duration) {
  const payload = Buffer.alloc(32);
  payload.writeUInt8(1, 0);
  payload.writeUInt32BE(timescale, 20);
  payload.writeBigUInt64BE(BigInt(duration), 24);
  return atom(type, payload);
}
function handler(type) {
  const payload = Buffer.alloc(12);
  payload.write(type, 8, 4, "ascii");
  return atom("hdlr", payload);
}
function track(type, durationMs = 4000) {
  const mediaHeader = headerV0("mdhd", 1000, durationMs);
  return atom("trak", atom("mdia", Buffer.concat([mediaHeader, handler(type)])));
}
function movie(movieDurationMs, tracks = [track("vide", movieDurationMs)]) {
  return atom("moov", Buffer.concat([
    headerV0("mvhd", 1000, movieDurationMs),
    ...tracks,
  ]));
}

test("reads MP4 version-zero and version-one movie duration from uploaded bytes", () => {
  assert.equal(readMp4DurationMs(headerV0("mvhd", 1000, 3000)), 3000);
  assert.equal(readMp4DurationMs(headerV0("mvhd", 1000, 5000)), 5000);
  assert.equal(readMp4DurationMs(headerV1("mvhd", 600, 2400)), 4000);
});

test("accepts only the inclusive 3–5 second video duration interval", () => {
  for (const duration of [3000, 3500, 5000]) assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
  for (const duration of [0, 2999, 2999.9, 5000.1, 5001, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => assertBiometricVideoDurationAllowed(duration), /DURATION_OUT_OF_RANGE/);
  }
});

test("requires a video track and rejects audio-only MP4 containers", () => {
  const video = movie(4000, [track("vide", 4000)]);
  const audioOnly = movie(4000, [track("soun", 4000)]);
  assert.equal(hasMp4VideoTrack(video), true);
  assert.equal(hasMp4VideoTrack(audioOnly), false);
  assert.equal(assertBiometricVideoFileAllowed(video), 4000);
  assert.throws(() => assertBiometricVideoFileAllowed(audioOnly), /VIDEO_TRACK_MISSING/);
});

test("rejects a file whose actual video track duration disagrees with a forged movie duration", () => {
  const forgedMovieDuration = movie(4000, [track("vide", 6000)]);
  assert.throws(() => assertBiometricVideoFileAllowed(forgedMovieDuration), /TRACK_DURATION_OUT_OF_RANGE/);
});

test("rejects malformed, missing, unsupported and invalid MP4 movie headers", () => {
  assert.throws(() => readMp4DurationMs(Buffer.alloc(8)), /CONTAINER_INVALID/);
  assert.throws(() => readMp4DurationMs(atom("moov", Buffer.alloc(12))), /DURATION_MISSING/);
  const unsupported = Buffer.alloc(20);
  unsupported.writeUInt8(2, 0);
  assert.throws(() => readMp4DurationMs(atom("mvhd", unsupported)), /VERSION_UNSUPPORTED/);
  assert.throws(() => readMp4DurationMs(headerV0("mvhd", 0, 4000)), /DURATION_INVALID/);
});


test("validates an audio-only MP4 voice recording and rejects missing or overlong audio tracks", () => {
  const audio = movie(20000, [track("soun", 20000)]);
  const overlong = movie(20001, [track("soun", 20001)]);
  const videoOnly = movie(4000, [track("vide", 4000)]);
  const { assertBiometricAudioFileAllowed } = require("../lib/biometric-media");
  assert.equal(assertBiometricAudioFileAllowed(audio), 20000);
  assert.throws(() => assertBiometricAudioFileAllowed(overlong), /AUDIO_DURATION_OUT_OF_RANGE/);
  assert.throws(() => assertBiometricAudioFileAllowed(videoOnly), /AUDIO_TRACK_MISSING/);
});


test("enforces the owner-approved 20-second biometric audio ceiling from movie and track bytes", () => {
  const maxAllowed = movie(20000, [track("soun", 20000)]);
  const overLimitMovie = movie(20001, [track("soun", 20000)]);
  const overLimitTrack = movie(20000, [track("soun", 20001)]);
  const { assertBiometricAudioFileAllowed } = require("../lib/biometric-media");
  assert.equal(assertBiometricAudioFileAllowed(maxAllowed), 20000);
  assert.throws(() => assertBiometricAudioFileAllowed(overLimitMovie), /AUDIO_DURATION_OUT_OF_RANGE/);
  assert.throws(() => assertBiometricAudioFileAllowed(overLimitTrack), /AUDIO_DURATION_OUT_OF_RANGE/);
});
