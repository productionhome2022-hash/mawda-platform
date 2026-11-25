import { projectMemberSocialLinks } from "./member-social-links";

export type PublicMemberProfile = {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  profession: string;
  country: string;
  region: string;
  gender: string;
  maritalStatus: string;
  interests: string[];
  goals: string[];
  socialLinks: Partial<Record<string, string>>;
};

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Projects a strict, non-sensitive profile allowlist.
 * Visibility is opt-in: missing/unknown visibility is private.
 */
export function projectPublicMemberProfile(
  uid: string,
  data: Record<string, unknown>,
): PublicMemberProfile | null {
  if (data.profileVisibility !== "public") return null;

  const interests = Array.isArray(data.interests)
    ? data.interests.filter((value): value is string => typeof value === "string").slice(0, 20)
    : [];
  const goals = Array.isArray(data.goals)
    ? data.goals.filter((value): value is string => typeof value === "string").slice(0, 10)
    : [];

  return {
    uid,
    displayName: safeText(data.displayName) || safeText(data.fullName) || "Mawda Member",
    username: safeText(data.username),
    bio: safeText(data.bio).slice(0, 500),
    profession: safeText(data.profession),
    country: safeText(data.country),
    region: safeText(data.region),
    gender: safeText(data.gender),
    maritalStatus: safeText(data.maritalStatus),
    interests,
    goals,
    // Revalidate at the projection boundary as defense in depth. Callers must
    // still enforce biometric entitlement before supplying the stored links.
    socialLinks: projectMemberSocialLinks(data.approvedSocialLinks),
  };
}

/** Owners always see their own profile; other viewers require explicit public opt-in. */
export function canViewMemberProfile(
  viewerUid: string,
  targetUid: string,
  visibility: unknown,
): boolean {
  return viewerUid === targetUid || visibility === "public";
}

export type CoinVisibilityProjection = {
  visible: boolean;
  hiddenByPrivacy: boolean;
  balance?: number;
};

/**
 * Coins are never part of the public profile projection. The caller must
 * explicitly prove self-view or the sole Owner/Super Admin role before a
 * balance can be returned. Moderators and ordinary members are never eligible.
 */
export function projectCoinVisibility(args: {
  viewerUid: string;
  targetUid: string;
  targetCoins: unknown;
  hideCoinsActive: boolean;
  viewerIsSoleOwner: boolean;
}): CoinVisibilityProjection {
  const privileged = args.viewerUid === args.targetUid || args.viewerIsSoleOwner;
  if (privileged) {
    if (typeof args.targetCoins !== "number" || !Number.isSafeInteger(args.targetCoins) || args.targetCoins < 0) {
      throw new Error("INVALID_COIN_BALANCE");
    }
    return { visible: true, hiddenByPrivacy: false, balance: args.targetCoins };
  }
  return { visible: false, hiddenByPrivacy: args.hideCoinsActive };
}