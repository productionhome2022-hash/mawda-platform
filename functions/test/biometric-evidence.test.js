const test = require("node:test");
const assert = require("node:assert/strict");
const {
  BIOMETRIC_SPOKEN_PHRASE, BIOMETRIC_SPOKEN_PHRASE_VERSION,
  BIOMETRIC_AUDIO_MAX_BYTES, BIOMETRIC_VIDEO_MAX_BYTES,
  validateBiometricMemberIdentity, biometricEvidenceObjectPaths, biometricRewardLedgerId,
} = require("../lib/biometric-evidence");

test("uses the exact owner-approved phrase and a stable version", () => {
  assert.equal(BIOMETRIC_SPOKEN_PHRASE, "أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.");
  assert.equal(BIOMETRIC_SPOKEN_PHRASE_VERSION, "owner-approved-2026-11-20-v1");
});
test("enforces the approved evidence byte ceilings", () => {
  assert.equal(BIOMETRIC_AUDIO_MAX_BYTES, 5 * 1024 * 1024);
  assert.equal(BIOMETRIC_VIDEO_MAX_BYTES, 25 * 1024 * 1024);
});
test("uses canonical member identity and refuses client overrides", () => {
  const member = { uid: "member_uid_00001", profileCompleted: true, fullName: "Member One", username: "member_one", gender: "female" };
  assert.deepEqual(validateBiometricMemberIdentity(member, member.uid), { fullName: "Member One", username: "member_one", gender: "female" });
  assert.throws(() => validateBiometricMemberIdentity({ ...member, gender: "other" }, member.uid), /INVALID/);
  assert.throws(() => validateBiometricMemberIdentity({ ...member, username: "bad/name" }, member.uid), /INVALID/);
});
test("derives request-bound private paths and exactly-once ledger identity", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  const paths = biometricEvidenceObjectPaths("member_uid_00001", id);
  assert.equal(paths.audioPath, "biometric-evidence/member_uid_00001/" + id + "/voice.m4a");
  assert.equal(paths.videoPath, "biometric-evidence/member_uid_00001/" + id + "/video.mp4");
  assert.equal(biometricRewardLedgerId(id), "biometric_verification_" + id);
  assert.throws(() => biometricEvidenceObjectPaths("../escape", id));
});
