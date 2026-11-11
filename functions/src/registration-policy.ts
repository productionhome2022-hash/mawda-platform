export type RegistrationPolicy = {
  enabled: boolean;
  minimumAge: number;
};

/**
 * Validate owner-supplied registration settings without assuming a default.
 * The callable performs authorization; this pure function validates values.
 */
export function validateRegistrationPolicy(
  enabled: unknown,
  minimumAge: unknown,
): RegistrationPolicy {
  if (typeof enabled !== "boolean") {
    throw new Error("REGISTRATION_ENABLED_INVALID");
  }
  if (
    typeof minimumAge !== "number" ||
    !Number.isSafeInteger(minimumAge) ||
    minimumAge < 1 ||
    minimumAge > 120
  ) {
    throw new Error("REGISTRATION_MINIMUM_AGE_INVALID");
  }
  return { enabled, minimumAge };
}
