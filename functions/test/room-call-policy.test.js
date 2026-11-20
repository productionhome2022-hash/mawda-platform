const test = require("node:test");
const assert = require("node:assert/strict");
const { isActiveRentedPrivateRoom, areRoomCallParticipantsMembers, areDirectCallParticipantsEligible, roomCallParticipantLimit } = require("../lib/room-call-policy");

function stamp(ms) { return { toMillis: () => ms }; }

const room = {
  roomId: "room-1", ownerUid: "owner-1", kind: "private",
  isRented: true, rentalId: "rental-1", status: "active", expiresAt: stamp(20_000),
};
const rental = {
  rentalId: "rental-1", roomId: "room-1", ownerUid: "owner-1",
  status: "active", expiresAt: stamp(20_000),
};

test("active private rented room with matching live rental is eligible", () => {
  assert.equal(isActiveRentedPrivateRoom(room, rental, 10_000), true);
});

test("public, non-rented, or inactive rooms are rejected", () => {
  assert.equal(isActiveRentedPrivateRoom({ ...room, kind: "public" }, rental, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom({ ...room, isRented: false }, rental, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom({ ...room, status: "closed" }, rental, 10_000), false);
});

test("missing, mismatched, or inactive rental records are rejected", () => {
  assert.equal(isActiveRentedPrivateRoom(room, null, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom(room, { ...rental, roomId: "other" }, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom(room, { ...rental, ownerUid: "other" }, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom(room, { ...rental, rentalId: "other" }, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom(room, { ...rental, status: "grace_period" }, 10_000), false);
});

test("room or rental expiry at or before server time is rejected", () => {
  assert.equal(isActiveRentedPrivateRoom({ ...room, expiresAt: stamp(10_000) }, rental, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom(room, { ...rental, expiresAt: stamp(10_000) }, 10_000), false);
  assert.equal(isActiveRentedPrivateRoom({ ...room, expiresAt: null }, rental, 1), false);
});

test("malformed timestamps and invalid clocks fail closed", () => {
  assert.equal(isActiveRentedPrivateRoom({ ...room, expiresAt: { toMillis: () => { throw new Error("bad"); } } }, rental, 1), false);
  assert.equal(isActiveRentedPrivateRoom(room, rental, -1), false);
});


test("room-call membership snapshots fail closed unless every selected participant remains a member", () => {
  assert.equal(areRoomCallParticipantsMembers([{ exists: true }, { exists: true }]), true);
  assert.equal(areRoomCallParticipantsMembers([{ exists: true }, { exists: false }]), false);
  assert.equal(areRoomCallParticipantsMembers([{ exists: true }]), false);
  assert.equal(areRoomCallParticipantsMembers([]), false);
  assert.equal(areRoomCallParticipantsMembers(null), false);
  assert.equal(areRoomCallParticipantsMembers([{ exists: true }, null]), false);
});

 
test("direct-call relationship revalidation requires the exact current two-member chat", () => {
  const caller = { age: 30, blockedUids: [] };
  const peer = { age: 29, blockedUids: [] };
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "peer"], caller, peer), true);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "other"], caller, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller"], caller, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "caller", ["caller", "peer"], caller, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "peer", "other"], caller, peer), false);
});

test("direct-call relationship revalidation rejects cross-age-class and mutual blocks", () => {
  assert.equal(areDirectCallParticipantsEligible(
    "caller", "peer", ["caller", "peer"], { age: 17 }, { age: 18 },
  ), false);
  assert.equal(areDirectCallParticipantsEligible(
    "caller", "peer", ["caller", "peer"], { age: 17 }, { age: 16 },
  ), true);
  assert.equal(areDirectCallParticipantsEligible(
    "caller", "peer", ["caller", "peer"], { age: 30, blockedUids: ["peer"] }, { age: 29 },
  ), false);
  assert.equal(areDirectCallParticipantsEligible(
    "caller", "peer", ["caller", "peer"], { age: 30 }, { age: 29, blockedUids: ["caller"] },
  ), false);
  assert.equal(areDirectCallParticipantsEligible(
    "caller", "peer", ["caller", "peer"], { age: "30" }, { age: 29 },
  ), false);
});

 
test("direct-call relationship revalidation fails closed on missing snapshots and malformed identity", () => {
  const caller = { age: 30 };
  const peer = { age: 29 };
  assert.equal(areDirectCallParticipantsEligible("", "peer", ["", "peer"], caller, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", "caller,peer", caller, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "peer"], null, peer), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "peer"], caller, null), false);
  assert.equal(areDirectCallParticipantsEligible("caller", "peer", ["caller", "peer"], [], peer), false);
});


test("group audio follows the configured room capacity while group video is capped at four", () => {
  assert.equal(roomCallParticipantLimit("audio", 7), 7);
  assert.equal(roomCallParticipantLimit("audio", 1000), 1000);
  assert.equal(roomCallParticipantLimit("video", 5), 4);
  assert.equal(roomCallParticipantLimit("video", 1000), 4);
  assert.equal(roomCallParticipantLimit("video", 4), null);
  assert.equal(roomCallParticipantLimit("audio", 1001), null);
  assert.equal(roomCallParticipantLimit("unknown", 5), null);
});
