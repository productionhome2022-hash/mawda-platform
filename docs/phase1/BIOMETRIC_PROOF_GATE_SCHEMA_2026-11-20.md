# Biometric proof gate — 2026-11-20

## Status

**Hardening gate only; the cryptographic verification pipeline is not complete and no reward/privilege is enabled.**

Branch: `codex/mawdda-biometric-proof-gate-2026-11-20`  
Base: `codex/mawdda-phase1-unified-2026-11-19`  
Related issue: #72

## Changes in this branch

- `hasActiveBiometricVerification` now requires the expected canonical member UID and a server-proof record.
- Legacy `status: verified` records, local OS prompt claims, client-claim trust models, cross-account proof, missing/invalid challenge metadata, unverified signature/attestation markers, unconsumed nonces, expired/revoked records and invalid timestamps fail closed.
- The gate is applied to profile social-link publication/visibility, direct-message link privileges and room-message link privileges.
- Clearing/removing links and hiding existing links remain available without an active biometric lease.
- Firestore rules currently deny all client create/update/delete operations on `users/{uid}`, so the proof record is not client-writable through the Firestore client.

## Required persisted verifier result contract

The gate expects the trusted server to persist a `biometricVerification` record with:

- `status = verified`
- `verificationMethod = server_verified_device_attestation`
- `trustModel = challenge_bound_device_key`
- future `expiresAt`, with no `revokedAt`
- `serverProof.status = verified`
- provider `android_play_integrity` or `ios_app_attest`
- `serverProof.accountUid` exactly matching the user document UID
- non-empty server-registered `deviceKeyId` and one-time `challengeId`
- SHA-256 `proofDigest`
- server verification markers `signatureVerified`, `attestationVerified`, and `nonceConsumed`
- server timestamps `verifiedAt` and `nonceConsumedAt`, in valid order and not in the future

These fields are an internal verifier-result contract, **not proof that the verifier exists**. A trusted writer must set them only after actual provider verification and atomic challenge consumption. A client-supplied boolean or client-created record must never set them.

## Still required before full cryptographic acceptance

1. Android verifier: validate Google Play Integrity tokens server-side, validate package/app identity, request binding, freshness and the expected integrity verdict; document supported platform/API constraints.
2. iOS verifier: validate Apple App Attest attestation/assertion server-side, certificate chain, app identity, key registration and assertion counter/replay semantics.
3. Issue a short-lived single-use challenge bound to UID, registered device key, request ID and evidence generation.
4. Verify the signature/attestation, consume the nonce atomically, and bind the result to the exact request/evidence hash.
5. Implement key rotation/revocation, expiry, retries, lockout and evidence deletion; ensure concurrent replay cannot verify twice.
6. Keep Super Owner acceptance as a separate required decision after valid cryptographic proof.
7. Grant the 1,500-coin reward only after proof plus Owner acceptance, through the central atomic wallet ledger with idempotent audit.
8. Add Emulator integration tests for forged/malformed, expired, replayed, revoked, cross-account/device/challenge/evidence, concurrent and valid Android/iOS fixtures.

## Explicit boundaries

- This branch does not implement Android or Apple attestation verification, device-key enrollment, challenge issuance/consumption, or the biometric review workflow.
- It does not grant biometric verification, badges, privileges or 1,500 coins.
- `completeBiometricVerificationCycle` remains fail-closed.
- No production Firebase, billing, deployment, `main`, retention policy or 5,000-persona simulation is touched.
