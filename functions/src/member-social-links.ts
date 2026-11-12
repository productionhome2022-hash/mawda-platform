const ALLOWED_HOSTS: Record<string, readonly string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  facebook: ["facebook.com", "www.facebook.com"],
  whatsapp: ["wa.me", "www.whatsapp.com", "whatsapp.com"],
};

export type MemberSocialLinks = Partial<Record<keyof typeof ALLOWED_HOSTS, string>>;

import { hasActiveBiometricVerification } from "./biometric-verification";

/**
 * Members may always clear links, including after verification expires or is
 * revoked. Publishing any non-empty link set requires an active server lease.
 */
export function canUpdateMemberSocialLinks(
  links: MemberSocialLinks,
  biometricVerification: unknown,
  nowMs = Date.now(),
): boolean {
  return Object.keys(links).length === 0 ||
    hasActiveBiometricVerification(biometricVerification, nowMs);
}

/** Accept only explicit HTTPS profile/contact URLs on official provider domains. */
export function validateMemberSocialLinks(input: unknown): MemberSocialLinks {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_SOCIAL_LINKS");
  }
  const value = input as Record<string, unknown>;
  const allowedKeys = new Set(Object.keys(ALLOWED_HOSTS));
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
    throw new Error("SOCIAL_LINK_PROVIDER_NOT_ALLOWED");
  }

  const result: MemberSocialLinks = {};
  for (const [provider, raw] of Object.entries(value)) {
    if (raw === null || raw === "") continue;
    if (typeof raw !== "string" || raw.length > 500) {
      throw new Error("INVALID_SOCIAL_LINK");
    }
    let url: URL;
    try {
      url = new URL(raw.trim());
    } catch {
      throw new Error("INVALID_SOCIAL_LINK");
    }
    const hosts = ALLOWED_HOSTS[provider];
    if (
      url.protocol !== "https:" ||
      !hosts ||
      !hosts.includes(url.hostname.toLowerCase()) ||
      url.username ||
      url.password ||
      url.port
    ) {
      throw new Error("SOCIAL_LINK_DOMAIN_NOT_ALLOWED");
    }
    result[provider as keyof typeof ALLOWED_HOSTS] = url.toString();
  }
  return result;
}

/** Revalidate stored data on every read; malformed legacy values are omitted. */
export function projectMemberSocialLinks(value: unknown): MemberSocialLinks {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  const projected: MemberSocialLinks = {};
  for (const [provider, raw] of Object.entries(value as Record<string, unknown>)) {
    try {
      const validated = validateMemberSocialLinks({ [provider]: raw });
      Object.assign(projected, validated);
    } catch {
      // Fail closed: never expose malformed or unapproved stored URLs.
    }
  }
  return projected;
}
