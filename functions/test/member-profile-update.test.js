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

test("allows dating from 16 and restricts marriage to adults during profile edits", () => {
  assert.deepEqual(
    validateMemberProfileUpdate({ goals: ["romantic_dating"] }, 17),
    { goals: ["romantic_dating"] },
  );
  assert.throws(
    () => validateMemberProfileUpdate({ goals: ["marriage"] }, 17),
    /MARRIAGE_GOAL_REQUIRES_ADULT/,
  );
  assert.deepEqual(
    validateMemberProfileUpdate({ goals: ["friendship"] }, 17),
    { goals: ["friendship"] },
  );
});

test("profile edits cannot clear required interests or goals", () => {
  assert.throws(
    () => validateMemberProfileUpdate({ interests: [] }, 25),
    /INTERESTS_REQUIRED/,
  );
  assert.throws(
    () => validateMemberProfileUpdate({ goals: [] }, 25),
    /GOALS_REQUIRED/,
  );
});

test("rejects invalid and oversized profile values", () => {
  assert.throws(() => validateMemberProfileUpdate({ bio: "x".repeat(501) }, 25));
  assert.throws(() => validateMemberProfileUpdate({ gender: "unknown" }, 25));
  assert.throws(() => validateMemberProfileUpdate({ interests: ["same", "same"] }, 25));
  assert.throws(() => validateMemberProfileUpdate({}, 25));
});

test("accepts the approved gender and marital-status profile fields", () => {
  assert.deepEqual(
    validateMemberProfileUpdate({
      gender: "female",
      maritalStatus: "married",
    }, 32),
    {
      gender: "female",
      maritalStatus: "married",
    },
  );
  assert.throws(
    () => validateMemberProfileUpdate({ maritalStatus: "unknown" }, 32),
    /INVALID_MARITAL_STATUS/,
  );
});
