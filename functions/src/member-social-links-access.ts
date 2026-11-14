import { hasActiveBiometricVerification } from "./biometric-verification";
import { MemberSocialLinks, canUpdateMemberSocialLinks } from "./member-social-links";

/** A member may edit only their own links and only after completing their profile.
 * Clearing links is always allowed; publishing non-empty links needs an active
 * server-owned biometric verification lease. */
export function canEditMemberSocialLinks(
  actorUid: string,
  memberUid: string,
  profileCompleted: boolean,
  links: MemberSocialLinks,
  biometricVerification: unknown,
  nowMs = Date.now(),
): boolean {
  return actorUid.length > 0 &&
    actorUid === memberUid &&
    profileCompleted &&
    canUpdateMemberSocialLinks(links, biometricVerification, nowMs);
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
