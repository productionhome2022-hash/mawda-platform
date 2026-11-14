# Mawdda Platform 2026 — Development and Release Readiness

This document distinguishes source-code implementation, automated test evidence, and production acceptance. A passing emulator/CI run is not proof of a deployed production service.

## Unified development line

- Repository: `productionhome2022-hash/mawda-platform`
- Development branch: `codex/mawda-full-platform-implementation`
- Release PR: #2 (Draft, not merged)
- Superseded PR: #3 (closed without importing its divergent history)

## Phase 1 — code-level acceptance foundations

Implemented in the development line:

- Firebase Auth email/password, verification and reset flows, auth-state routing, anonymous guest entry, privacy acknowledgement, guest upgrade, and explicit guest-account termination.
- Server-enforced owner session and recent-MFA checks for privileged actions.
- Profile completion, username reservation, privacy visibility and controlled profile updates.
- Atomic coin transfers, commission calculation, idempotency and linked sender/recipient/platform wallet ledger records.
- Member blocking, confidential reporting, moderation decisions and appeals.
- Cross-age restrictions for direct messaging, room audiences, profile viewing and member discovery.
- FCM device-token registration, refresh/deactivation and notification initialization.
- 30-day local biometric prompt cycle with a server-owned 1,500-coin reward ledger; 90-day Firebase email re-verification cycle with one 500-coin reward per cycle.

Biometric assurance boundary: Android BiometricPrompt / Apple LocalAuthentication perform the local user-presence match. The server receives a client-reported success result. This implementation does not claim hardware attestation, civil identity verification, or independent liveness proof.

## Approved premium store features

Server-gated consumers and profile UI are implemented for animated avatar frames, colored/animated usernames, profile-view analytics, professional layout, pinned sections, discovery boosts, profile themes, visitor greetings, VIP and badges.

- Analytics count one pseudonymous visitor per member per UTC day while the entitlement is active.
- Greeting and pinned-section mutations require active entitlements on the server.
- Discovery boosts affect server-side ordering and do not bypass age or block filters.
- Approved items are visible and fulfillment-ready. Purchase charging remains disabled until the owner confirms catalog prices and enables each item. Hide-coins and ghost-mode privacy items remain disabled.

## Phase 2 — media and storage foundations

Implemented and tested in CI/emulator scope:

- Private upload intents and server finalization checks for owner, object generation, size, MIME/content signature and quarantine state.
- ClamAV scanner image build and harmless EICAR detection; GIF/audio/video/PDF processing tests.
- Cleanup grace-period and daily upload-quota tests.
- Firestore and Storage emulator export/import smoke test for persistence of a document and media object across restore.

Not yet proven: live signed GCS upload/download, production generation-specific deletion, Cloud Run scanner deployment, real bucket retention, backup/PITR, or production restore.

## Rooms, events and media experiences

- Room rental billing and lifecycle foundations are covered by emulator tests.
- Room events support scheduling, RSVP, owner-controlled start/cancel/complete, age-audience checks, and approved external audio/video stream or watch-party URLs.
- Chat supports audio/video media attachments and owner live-stream links.
- In-app WebRTC voice/video calls, call signaling and native device media permissions are not implemented.

## Audit archive

- A scheduled owner-review hash-chain exporter verifies contiguous sequence numbers and event hashes, writes redacted JSONL with SHA-256 manifest, uses create-only GCS writes, and reconciles its cursor against the last immutable object metadata.
- Terraform provisions a private bucket with a 744-day retention floor, versioning, uniform bucket-level access, public access prevention and least-privilege runtime IAM.
- The worker is disabled by default. It refuses to run until the bucket reports a locked retention policy. Locking is irreversible and requires a separately approved operator action.
- Current archive scope is the `owner-review-v1` chain only. Verification and profile-feature audit collections are not yet covered by this exporter.

## Release gates still open

1. Provision and verify non-production GCP/Firebase resources, Cloud Run scanner, runtime IAM and locked archive bucket.
2. Run signed GCS PUT/GET expiry, replay, CORS, size, generation deletion and restore tests against the actual non-production bucket.
3. Complete backup/PITR and restore acceptance.
4. Complete Android and iOS native project/device acceptance, including biometrics, push notifications, permissions and media behavior.
5. Implement in-app WebRTC audio/video, signaling and room-call lifecycle; add room event reminders/notification fanout.
6. Review guest inactivity expiry and data retention with legal/privacy stakeholders before enabling automated deletion.
7. Expand immutable archive coverage to all approved audit collections and add independent external checkpoint anchoring.
8. Complete owner MFA provisioning/recovery, monitoring, penetration testing, accessibility/performance and final privacy/legal review.

## Deployment boundary

PR #2 remains Draft and unmerged. No production deployment, production Firebase mutation, public media access, retention lock, or destructive cleanup is authorized by this development work.