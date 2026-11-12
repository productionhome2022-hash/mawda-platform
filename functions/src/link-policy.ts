const APPROVED_HOSTS = new Set([
  "youtube.com", "youtu.be", "youtube-nocookie.com",
  "instagram.com", "facebook.com", "fb.watch",
]);
// Biometric verification grants only the three explicitly approved social networks.
// YouTube remains a room-owner/moderator permission, not a biometric-member entitlement.
export const BIOMETRIC_APPROVED_HOSTS = new Set([
  "instagram.com", "facebook.com", "fb.watch",
  "x.com", "twitter.com",
]);
const DOMAIN_PATTERN = /(?:https?:\/\/|www\.)[^\s<>()]+|(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|de|uk|fr|es|me|tv|app|dev|info|biz|xyz|online|site|live)(?:\/[^\s<>()]*)?/giu;
const OBFUSCATION_PATTERN = /(?:youtube|instagram|facebook|twitter|x)\s*(?:\[.\]|\(\.\)|\{.\}|\s+dot\s+)\s*(?:com|org|net)/giu;
const UNSAFE_SCHEME_PATTERN = /\b(?:javascript|data|vbscript|file|blob|intent|filesystem|chrome|about):/giu;

function cleanCandidate(value: string): string {
  return value.replace(/[.,!?;:]+$/g, "").replace(/[)\]}]+$/g, "");
}

function isApprovedHost(hostname: string, allowedHosts: ReadonlySet<string>): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return [...allowedHosts].some((root) => host === root || host.endsWith("." + root));
}

/**
 * Reject all links when allowApprovedPlatforms is false. When true, accept only
 * direct destinations on the explicitly approved social/video platform domains.
 * This intentionally does not fetch arbitrary URLs or follow redirects server-side.
 */
export function canSendApprovedPlatformLinks(permissions: {
  isBiometricallyVerified?: boolean;
  isRoomOwner?: boolean;
  isAuthorizedModerator?: boolean;
  isPlatformOwner?: boolean;
}): boolean {
  return permissions.isBiometricallyVerified === true ||
    permissions.isRoomOwner === true ||
    permissions.isAuthorizedModerator === true ||
    permissions.isPlatformOwner === true;
}

export function assertMessageLinksAllowed(
  text: string,
  allowApprovedPlatforms: boolean,
  allowAnyDomain = false,
  allowedHosts: ReadonlySet<string> = APPROVED_HOSTS,
): void {
  OBFUSCATION_PATTERN.lastIndex = 0;
  UNSAFE_SCHEME_PATTERN.lastIndex = 0;
  if (OBFUSCATION_PATTERN.test(text) || UNSAFE_SCHEME_PATTERN.test(text)) {
    throw new Error("MESSAGE_LINK_NOT_ALLOWED");
  }
  const matches = text.match(DOMAIN_PATTERN) ?? [];
  for (const raw of matches) {
    if (!allowApprovedPlatforms && !allowAnyDomain) throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    const candidate = cleanCandidate(raw);
    let parsed: URL;
    try {
      parsed = new URL(candidate.startsWith("www.") ? "https://" + candidate :
        /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) ? candidate : "https://" + candidate);
    } catch {
      throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    }
    if ((allowAnyDomain ? !["https:", "http:"].includes(parsed.protocol) : parsed.protocol !== "https:") ||
        parsed.username || parsed.password || (!allowAnyDomain && !isApprovedHost(parsed.hostname, allowedHosts))) {
      throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    }
  }
}
