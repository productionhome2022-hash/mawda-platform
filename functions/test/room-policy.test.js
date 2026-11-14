const test = require("node:test");
const assert = require("node:assert/strict");
const {
  audienceForAge, canJoinRoom, normalizeModeratorPermissions,
} = require("../lib/room-policy");

test("room audience is derived from age with a 16-year minimum", () => {
  assert.equal(audienceForAge(16), "minor");
  assert.equal(audienceForAge(17), "minor");
  assert.equal(audienceForAge(18), "adult");
  assert.throws(() => audienceForAge(15), /INVALID_MEMBER_AGE/);
});

test("members cannot cross adult/minor room audiences", () => {
  assert.equal(canJoinRoom({ memberAge: 17, roomAudience: "minor", roomKind: "public", invited: false }), true);
  assert.equal(canJoinRoom({ memberAge: 18, roomAudience: "minor", roomKind: "public", invited: false }), false);
  assert.equal(canJoinRoom({ memberAge: 17, roomAudience: "adult", roomKind: "public", invited: false }), false);
});

test("private rooms require an invitation and a matching audience", () => {
  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: false }), false);
  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: true }), true);
  assert.equal(canJoinRoom({ memberAge: 17, roomAudience: "adult", roomKind: "private", invited: true }), false);
});

test("moderator permissions are scoped and cannot grant platform privileges", () => {
  assert.deepEqual(normalizeModeratorPermissions({
    manageMessages: true, muteMembers: true, removeMembers: false,
  }), { manageMessages: true, muteMembers: true, removeMembers: false });
  assert.throws(() => normalizeModeratorPermissions({
    manageMessages: true, platformOwner: true,
  }), /ROOM_MODERATOR_PERMISSION_NOT_ALLOWED/);
  assert.throws(() => normalizeModeratorPermissions({
    manageMessages: false, muteMembers: false, removeMembers: false,
  }), /ROOM_MODERATOR_PERMISSION_REQUIRED/);
});


test("all-ages public rooms accept members from either member audience", () => {
  assert.equal(canJoinRoom({ memberAge: 17, roomAudience: "all_ages", roomKind: "public", invited: false }), true);
  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "all_ages", roomKind: "public", invited: false }), true);
});

test("guest audience is unknown and can join only active all-ages public rooms", () => {
  const { canJoinGuestRoom } = require("../lib/room-policy");
  assert.equal(canJoinGuestRoom({ roomAudience: "all_ages", roomKind: "public", roomStatus: "active" }), true);
  assert.equal(canJoinGuestRoom({ roomAudience: "adult", roomKind: "public", roomStatus: "active" }), false);
  assert.equal(canJoinGuestRoom({ roomAudience: "minor", roomKind: "public", roomStatus: "active" }), false);
  assert.equal(canJoinGuestRoom({ roomAudience: "all_ages", roomKind: "private", roomStatus: "active" }), false);
  assert.equal(canJoinGuestRoom({ roomAudience: "all_ages", roomKind: "public", roomStatus: "closed" }), false);
});
