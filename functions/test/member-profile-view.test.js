const test = require("node:test");
const assert = require("node:assert/strict");
const { projectPublicMemberProfile } = require("../lib/member-profile-view");

test("profile visibility is private unless explicitly public", () => {
  assert.equal(projectPublicMemberProfile("member-1", { fullName: "A" }), null);
  assert.equal(projectPublicMemberProfile("member-1", { profileVisibility: "private" }), null);
});

test("public projection returns only the approved profile allowlist", () => {
  const result = projectPublicMemberProfile("member-1", {
    profileVisibility: "public",
    fullName: "Member One",
    username: "member_one",
    bio: "Hello",
    age: 29,
    email: "private@example.test",
    coins: 9000,
    phone: "+000000",
    interests: ["reading"],
    goals: ["friendship"],
  });
  assert.deepEqual(result, {
    uid: "member-1",
    displayName: "Member One",
    username: "member_one",
    bio: "Hello",
    profession: "",
    country: "",
    region: "",
    gender: "",
    maritalStatus: "",
    interests: ["reading"],
    goals: ["friendship"],
  });
  assert.equal(Object.hasOwn(result, "age"), false);
  assert.equal(Object.hasOwn(result, "email"), false);
  assert.equal(Object.hasOwn(result, "coins"), false);
});

test("display name falls back safely and text is bounded", () => {
  const result = projectPublicMemberProfile("member-2", {
    profileVisibility: "public",
    fullName: " ",
    bio: "x".repeat(600),
  });
  assert.equal(result.displayName, "Mawda Member");
  assert.equal(result.bio.length, 500);
});
