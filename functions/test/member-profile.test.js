const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeUsername, validateMemberProfile } = require("../lib/member-profile");

const valid = {
  fullName: "Member Name",
  username: "Mawda_2026",
  age: 25,
  profession: "Engineer",
  country: "Jordan",
  region: "Amman",
  gender: "male",
  maritalStatus: "single",
  bio: "Hello",
  interests: ["Reading", "Travel"],
  goals: ["Friendship"],
};

test("normalizes usernames consistently", () => {
  assert.equal(normalizeUsername("Mawda_2026"), "mawda_2026");
});

test("rejects usernames outside the safe registry format", () => {
  assert.throws(() => normalizeUsername("bad name"));
  assert.throws(() => normalizeUsername("ab"));
});

test("requires an explicitly configured minimum age", () => {
  assert.throws(
    () => validateMemberProfile(valid, undefined),
    /REGISTRATION_POLICY_NOT_CONFIGURED/,
  );
});

test("validates profile fields and age policy", () => {
  const profile = validateMemberProfile(valid, 18);
  assert.equal(profile.username, "mawda_2026");
  assert.equal(profile.age, 25);
  assert.deepEqual(profile.interests, ["Reading", "Travel"]);
  assert.throws(() => validateMemberProfile({ ...valid, age: 17 }, 18), /AGE_POLICY_NOT_MET/);
  assert.throws(() => validateMemberProfile({ ...valid, bio: "x".repeat(501) }, 18));
});
