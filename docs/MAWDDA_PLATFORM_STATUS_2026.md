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
- 90-day Firebase email re-verification cycle with one 500-coin reward per eligible cycle. The 30-day biometric verification/reward is disabled fail-closed until challenge-bound cryptographic proof is verified by the server; local OS prompt success alone is not sufficient.

Biometric assurance boundary: Android BiometricPrompt / Apple LocalAuthentication perform only a local user-presence match. A client-reported result is not accepted as server proof; the backend fails closed and does not issue the 1,500-coin reward or biometric-gated entitlements. This implementation does not claim hardware attestation, civil identity verification, or independent liveness proof.

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
- The owner-review chain has a dedicated chain-verifying exporter. A second worker archives `adminAuditLogs`, `verificationAuditLogs`, `profileFeatureAuditLogs`, `mediaAccessAudit`, `memberPrivacyAudit`, `memberProfileAudit`, `directMessageDeletionAudit`, `roomAuditLogs`, and `privacyAcknowledgements`, each with a separate cursor and GCS-backed checkpoint.

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

## Engineering hardening update — 15 November 2026

### Exact-head automated evidence

- Application-code head: `d341ff04374f678cc4d06ea1b1459a27b0319619`.
- GitHub Actions: [run 43713242606](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43713242606) — `completed / success`.
- All three jobs passed: Flutter analysis/tests/Web release build; Cloud Functions compile/unit/integration and Firestore/Storage emulator rules suites; isolated ClamAV scanner source, container and sanitization/EICAR tests.
- The guest lifecycle integration suite passed after adding regression coverage for discovery beyond 200 ineligible rooms and cleanup across more than 200 memberships. The test verifies that a session is finalized only after membership cleanup completes.
- Scanner-purpose binding passed the scanner and backend CI suites: the signed scan request and verdict carry the media purpose, the callback checks it against the stored asset, and the scanner rejects media types incompatible with the declared purpose.

### Changes after that tested code head

The following later commits are workflow, test-matrix, ignore-file and documentation changes; they do not alter the application code tested at `d341ff0`:

- Added a manual emulator-only Mawdda Test Center workflow and `npm run test:all` aggregator.
- Added explicit ignore rules for local emulator test credentials and emulator data.
- Added Test Center operator documentation and updated guest regression-coverage metadata.
- Added branch-scoped validation concurrency to avoid duplicate push/PR workloads, and transient Maven Central retry handling for Android CI.

The latest repository head must still pass its own exact-head CI before its status is called green. The manual Test Center workflow has been created but has not yet been dispatched.

### Remaining release blockers

- The separate 5,000-persona lab has not yet been accepted against this exact platform revision.
- Live non-production GCS signed URLs, Cloud Run scanner dispatch/callback, IAM/WIF/Secret Manager, retention and real restore behavior remain unproven.
- Android/iOS physical-device acceptance, real camera/microphone/push behavior, App Check and cross-installation guest abuse resistance remain open.
- Owner MFA provisioning/recovery, independent security/penetration review, accessibility/performance, privacy/legal review and operational incident drills remain open.
- PR #2 remains Draft/open/unmerged. No production Firebase mutation, deployment, paid-resource activation or irreversible operation has been performed.

