/**
 * Server-owned biometric verification eligibility.
 *
 * REWARD-002 requires challenge-bound cryptographic key proof/attestation,
 * nonce validation, replay protection and revocation. The current manual
 * audio/video review prototype does not satisfy that proof contract. Keep all
 * biometric privileges fail-closed until the cryptographic verifier writes
 * and validates a dedicated server-owned proof record.
 */
export function hasActiveBiometricVerification(
  _value: unknown,
  _nowMs = Date.now(),
): boolean {
  return false;
}
