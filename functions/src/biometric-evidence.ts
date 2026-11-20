export const BIOMETRIC_SPOKEN_PHRASE_VERSION = "owner-approved-2026-11-20-v1";
export const BIOMETRIC_SPOKEN_PHRASE =
  "أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.";
export const BIOMETRIC_AUDIO_MAX_BYTES = 5 * 1024 * 1024;
export const BIOMETRIC_AUDIO_MAX_DURATION_MS = 20_000;
export const BIOMETRIC_VIDEO_MAX_BYTES = 25 * 1024 * 1024;
export const BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS = 5 * 60 * 1000;
export const BIOMETRIC_EVIDENCE_REVIEW_TTL_MS = 60 * 1000;
export const BIOMETRIC_REWARD_COINS = 1500;

export function validateBiometricMemberIdentity(value: unknown, expectedUid: string): {
  fullName: string; username: string; gender: string;
} {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("BIOMETRIC_MEMBER_PROFILE_INVALID");
  const member = value as Record<string, unknown>;
  const fullName = typeof member.fullName === "string" ? member.fullName.trim() : "";
  const username = typeof member.username === "string" ? member.username.trim().toLowerCase() : "";
  const gender = typeof member.gender === "string" ? member.gender.trim() : "";
  if (member.uid !== expectedUid || member.profileCompleted !== true ||
      fullName.length < 2 || fullName.length > 80 ||
      !/^[a-z0-9_]{3,20}$/.test(username) || !["male", "female"].includes(gender)) {
    throw new Error("BIOMETRIC_MEMBER_PROFILE_INVALID");
  }
  return { fullName, username, gender };
}

export function biometricRewardLedgerId(requestId: string): string {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)) throw new Error("BIOMETRIC_REWARD_REQUEST_ID_INVALID");
  return "biometric_verification_" + requestId;
}
