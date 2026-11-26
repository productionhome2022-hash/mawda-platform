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

test("allows social and dating goals from 16 while restricting marriage to adults", () => {
  const sixteen = validateMemberProfile({ ...valid, age: 16, goals: ["friendship", "social_connection", "romantic_dating"] }, 16);
  assert.equal(sixteen.age, 16);
  assert.deepEqual(sixteen.goals, ["friendship", "social_connection", "romantic_dating"]);

  const seventeen = validateMemberProfile({ ...valid, age: 17, goals: ["romantic_dating"] }, 16);
  assert.equal(seventeen.age, 17);

  const eighteen = validateMemberProfile({ ...valid, age: 18, goals: ["romantic_dating", "marriage"] }, 16);
  assert.equal(eighteen.age, 18);
  assert.deepEqual(eighteen.goals, ["romantic_dating", "marriage"]);
  assert.throws(() => validateMemberProfile({ ...valid, age: 17, goals: ["marriage"] }, 16), /MARRIAGE_GOAL_REQUIRES_ADULT/);
});

test("validates profile fields and age policy", () => {
  const profile = validateMemberProfile(valid, 16);
  assert.equal(profile.username, "mawda_2026");
  assert.equal(profile.age, 25);
  assert.deepEqual(profile.interests, ["Reading", "Travel"]);
  assert.deepEqual(profile.goals, ["friendship"]);
  assert.throws(() => validateMemberProfile({ ...valid, age: 15 }, 16), /AGE_POLICY_NOT_MET/);
  assert.throws(() => validateMemberProfile({ ...valid, age: 17, goals: ["marriage"] }, 16), /ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT/);
  assert.doesNotThrow(() => validateMemberProfile({ ...valid, age: 17, goals: ["romantic_dating"] }, 16));
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

test("requires at least one interest and one purpose", () => {
  assert.throws(
    () => validateMemberProfile({ ...valid, interests: [] }, 16),
    /INTERESTS_REQUIRED/,
  );
  assert.throws(
    () => validateMemberProfile({ ...valid, goals: [] }, 16),
    /GOALS_REQUIRED/,
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
