export const PRIVACY_POLICY_VERSION = "2026-11-13.1";
export const PRIVACY_POLICY_SHA256 =
  "b1823498f7a716b311c341fc66d87d79e84f30b4d31c314cb6731f9bae76167d";
export const PRIVACY_POLICY_HASH = PRIVACY_POLICY_SHA256;

export type PrivacyAcknowledgement = {
  policyVersion: string;
  policyHash: string;
  locale: "ar" | "en" | "fr" | "es";
  actorType: "member" | "guest";
  appVersion: string;
};

/** Fail closed unless the client acknowledges the exact published policy revision. */
export function validatePrivacyAcknowledgement(
  input: Record<string, unknown>,
): PrivacyAcknowledgement {
  if (input.policyVersion !== PRIVACY_POLICY_VERSION) {
    throw new Error("PRIVACY_POLICY_VERSION_MISMATCH");
  }
  if (input.policyHash !== PRIVACY_POLICY_SHA256) {
    throw new Error("PRIVACY_POLICY_HASH_MISMATCH");
  }
  const locale = input.locale;
  if (locale !== "ar" && locale !== "en" && locale !== "fr" && locale !== "es") {
    throw new Error("PRIVACY_POLICY_LOCALE_INVALID");
  }
  if (input.actorType !== "member" && input.actorType !== "guest") {
    throw new Error("PRIVACY_POLICY_ACTOR_INVALID");
  }
  const appVersion = input.appVersion;
  if (typeof appVersion !== "string" || appVersion.trim().length < 1 ||
      appVersion.trim().length > 32 || !/^[A-Za-z0-9.+_-]+$/.test(appVersion)) {
    throw new Error("PRIVACY_POLICY_APP_VERSION_INVALID");
  }
  return {
    policyVersion: PRIVACY_POLICY_VERSION,
    policyHash: PRIVACY_POLICY_SHA256,
    locale,
    actorType: input.actorType as "member" | "guest",
    appVersion: appVersion.trim(),
  };
}
