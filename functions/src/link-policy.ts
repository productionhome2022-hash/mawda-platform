const APPROVED_HOSTS = new Set([
  "youtube.com", "youtu.be", "youtube-nocookie.com",
  "instagram.com", "facebook.com", "fb.watch",
]);
const DOMAIN_PATTERN = /(?:https?:\/\/|www\.)[^\s<>()]+|(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|de|uk|fr|es|me|tv|app|dev|info|biz|xyz|online|site|live)(?:\/[^\s<>()]*)?/giu;
const OBFUSCATION_PATTERN = /(?:youtube|instagram|facebook)\s*(?:\[.\]|\(\.\)|\{.\}|\s+dot\s+)\s*(?:com|org|net)/giu;

function cleanCandidate(value: string): string {
  return value.replace(/[.,!?;:]+$/g, "").replace(/[)\]}]+$/g, "");
}

function isApprovedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return [...APPROVED_HOSTS].some((root) => host === root || host.endsWith("." + root));
}

/**
 * Reject all links when allowApprovedPlatforms is false. When true, accept only
 * direct destinations on the explicitly approved social/video platform domains.
 * This intentionally does not fetch arbitrary URLs or follow redirects server-side.
 */
export function assertMessageLinksAllowed(text: string, allowApprovedPlatforms: boolean): void {
  OBFUSCATION_PATTERN.lastIndex = 0;
  if (OBFUSCATION_PATTERN.test(text)) throw new Error("MESSAGE_LINK_NOT_ALLOWED");
  const matches = text.match(DOMAIN_PATTERN) ?? [];
  for (const raw of matches) {
    if (!allowApprovedPlatforms) throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    const candidate = cleanCandidate(raw);
    let parsed: URL;
    try {
      parsed = new URL(candidate.startsWith("www.") ? "https://" + candidate :
        /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) ? candidate : "https://" + candidate);
    } catch {
      throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
        !isApprovedHost(parsed.hostname)) {
      throw new Error("MESSAGE_LINK_NOT_ALLOWED");
    }
  }
}
