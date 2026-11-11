const test = require("node:test");
const assert = require("node:assert/strict");
const { validateMemberProfileUpdate } = require("../lib/member-profile-update");

test("accepts bounded partial edits and trims text", () => {
  assert.deepEqual(validateMemberProfileUpdate({
    fullName: "  Member Name ",
    bio: "  Hello  ",
    interests: ["reading", "travel"],
  }, 25), {
    fullName: "Member Name",
    bio: "Hello",
    interests: ["reading", "travel"],
  });
});

test("rejects attempts to edit protected fields such as coins, age or username", () => {
  for (const payload of [
    { coins: 999999 }, { age: 30 }, { username: "new_name" },
    { role: "platformOwner" }, { emailVerified: true },
  ]) {
    assert.throws(() => validateMemberProfileUpdate(payload, 25), /PROFILE_UPDATE_FIELD_NOT_ALLOWED/);
  }
});

test("rejects romantic and marriage goals for members under 18", () => {
  assert.throws(
    () => validateMemberProfileUpdate({ goals: ["romantic_dating"] }, 17),
    /ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT/,
  );
  assert.deepEqual(
    validateMemberProfileUpdate({ goals: ["friendship"] }, 17),
    { goals: ["friendship"] },
  );
});

test("rejects invalid and oversized profile values", () => {
  assert.throws(() => validateMemberProfileUpdate({ bio: "x".repeat(501) }, 25));
  assert.throws(() => validateMemberProfileUpdate({ gender: "unknown" }, 25));
  assert.throws(() => validateMemberProfileUpdate({ interests: ["same", "same"] }, 25));
  assert.throws(() => validateMemberProfileUpdate({}, 25));
});
