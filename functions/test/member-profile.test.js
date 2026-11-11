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
  goals: ["friendship"],
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
  const profile = validateMemberProfile(valid, 16);
  assert.equal(profile.username, "mawda_2026");
  assert.equal(profile.age, 25);
  assert.deepEqual(profile.interests, ["Reading", "Travel"]);
  assert.deepEqual(profile.goals, ["friendship"]);
  assert.throws(() => validateMemberProfile({ ...valid, age: 15 }, 16), /AGE_POLICY_NOT_MET/);
  assert.throws(() => validateMemberProfile({ ...valid, age: 17, goals: ["marriage"] }, 16), /MARRIAGE_GOAL_REQUIRES_ADULT/);
  assert.throws(() => validateMemberProfile({ ...valid, bio: "x".repeat(501) }, 18));
});


test("rejects unsupported gender and marital-status values", () => {
  assert.throws(
    () => validateMemberProfile({ ...valid, gender: "unknown" }, 18),
    /gender: القيمة المختارة غير مدعومة/,
  );
  assert.throws(
    () => validateMemberProfile({ ...valid, maritalStatus: "complicated" }, 18),
    /maritalStatus: القيمة المختارة غير مدعومة/,
  );
});

test("rejects malformed interest and goal collections", () => {
  assert.throws(
    () => validateMemberProfile({ ...valid, interests: "travel" }, 18),
  );
  assert.throws(
    () => validateMemberProfile({ ...valid, goals: ["friendship", "friendship"] }, 18),
  );
});


test("rejects unrecognized free-text goals instead of allowing age-policy bypass", () => {
  assert.throws(
    () => validateMemberProfile({ ...valid, goals: ["I want marriage"] }, 16),
    /goals: اختر هدفاً معتمداً/,
  );
});
