import { hasActiveBiometricVerification } from "./biometric-verification";

/** A member may edit only their own links, after completing their profile and
 * while a server-owned biometric verification lease is active. */
export function canEditMemberSocialLinks(
  actorUid: string,
  memberUid: string,
  profileCompleted: boolean,
  biometricVerification: unknown,
  nowMs = Date.now(),
): boolean {
  return actorUid.length > 0 &&
    actorUid === memberUid &&
    profileCompleted &&
    hasActiveBiometricVerification(biometricVerification, nowMs);
}

/** Link visibility is re-evaluated for every read; expiry/revocation hides them. */
export function canExposeMemberSocialLinks(
  profileCompleted: boolean,
  biometricVerification: unknown,
  nowMs = Date.now(),
): boolean {
  return profileCompleted &&
    hasActiveBiometricVerification(biometricVerification, nowMs);
}
