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
  };
}
