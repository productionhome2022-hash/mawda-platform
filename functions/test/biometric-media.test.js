const test = require("node:test");
const assert = require("node:assert/strict");
const {
  readMp4DurationMs,
  isBiometricVideoDurationAllowed,
  assertBiometricVideoDurationAllowed,
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

function movie(header) {
  return atom("moov", Buffer.concat([header]));
}

test("reads MP4 version-zero and version-one movie duration from the uploaded bytes", () => {
  assert.equal(readMp4DurationMs(movie(movieHeaderV0(1000, 3000))), 3000);
  assert.equal(readMp4DurationMs(movie(movieHeaderV0(1000, 5000))), 5000);
  assert.equal(readMp4DurationMs(movie(movieHeaderV1(600, 2400))), 4000);
});

test("video duration must be within the agreed three-to-five-second interval", () => {
  for (const duration of [3000, 3500, 5000]) {
    assert.equal(isBiometricVideoDurationAllowed(duration), true);
    assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
  }
  for (const duration of [0, 2999, 5001, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(isBiometricVideoDurationAllowed(duration), false);
    assert.throws(() => assertBiometricVideoDurationAllowed(duration), /DURATION_OUT_OF_RANGE/);
  }
});

test("corrupt, unsupported, or incomplete MP4 headers fail closed", () => {
  assert.throws(() => readMp4DurationMs(Buffer.alloc(8)), /CONTAINER_INVALID/);
  assert.throws(() => readMp4DurationMs(atom("moov", Buffer.alloc(12))), /DURATION_MISSING/);
  const unsupported = Buffer.alloc(20);
  unsupported.writeUInt8(2, 0);
  assert.throws(() => readMp4DurationMs(movie(atom("mvhd", unsupported))), /VERSION_UNSUPPORTED/);
  const zeroTimescale = Buffer.alloc(20);
  assert.throws(() => readMp4DurationMs(movie(atom("mvhd", zeroTimescale))), /DURATION_INVALID/);
});
