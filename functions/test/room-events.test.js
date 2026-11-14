const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeRoomEventInput,
  nextRoomEventStatus,
} = require("../lib/room-events");

const now = 1_800_000_000_000;

test("normalizes scheduled announcements and stream events", () => {
  const announcement = normalizeRoomEventInput({
    title: "لقاء المجتمع",
    description: "موعد أسبوعي للأعضاء",
    eventType: "announcement",
    startsAtMs: now + 60 * 60 * 1000,
    durationMinutes: 45,
  }, now);
  assert.equal(announcement.streamUrl, null);
  const stream = normalizeRoomEventInput({
    title: "بث مباشر",
    description: "",
    eventType: "video_stream",
    startsAtMs: now + 60 * 60 * 1000,
    streamUrl: "https://youtu.be/abc123",
  }, now);
  assert.equal(stream.streamUrl, "https://youtu.be/abc123");
});

test("rejects unsafe stream URLs, hosts and invalid scheduling windows", () => {
  const base = {
    title: "حدث مودة",
    description: "",
    eventType: "video_stream",
    startsAtMs: now + 60 * 60 * 1000,
    streamUrl: "https://example.com/watch",
  };
  assert.throws(() => normalizeRoomEventInput(base, now), /HOST_NOT_ALLOWED/);
  assert.throws(() => normalizeRoomEventInput({ ...base, streamUrl: "http://youtube.com" }, now), /INVALID_ROOM_EVENT_STREAM_URL/);
  assert.throws(() => normalizeRoomEventInput({ ...base, startsAtMs: now + 1000 }, now), /INVALID_ROOM_EVENT_START/);
  assert.throws(() => normalizeRoomEventInput({ ...base, eventType: "audio_stream", streamUrl: "" }, now), /STREAM_URL_REQUIRED/);
});

test("allows only scheduled to live/cancelled and live to completed transitions", () => {
  assert.equal(nextRoomEventStatus("scheduled", "live"), "live");
  assert.equal(nextRoomEventStatus("scheduled", "cancelled"), "cancelled");
  assert.equal(nextRoomEventStatus("live", "completed"), "completed");
  assert.throws(() => nextRoomEventStatus("completed", "live"), /INVALID_ROOM_EVENT_TRANSITION/);
  assert.throws(() => nextRoomEventStatus("cancelled", "completed"), /INVALID_ROOM_EVENT_TRANSITION/);
});
