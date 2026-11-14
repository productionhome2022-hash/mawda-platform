# Mawdda Platform 2026 — Phase 1/2 Closure Matrix

This document separates implementation work, emulator/CI verification, and launch-only acceptance. A green compile or emulator run is not evidence of production deployment or real-device acceptance.

## Baseline
- Work branch: `codex/mawdda-phase1-phase2-hardening`
- Parent development head: `874e31f1e6b30a0256f017332b23073b64973842`
- PR #2 remains the integration candidate; do not merge to `main` until the gates below are reviewed.
- PR #3 was closed without merging its divergent history.

## Immediate CI blockers
- [ ] Fix and rerun the wallet/store integration test: the purchase test is rejected with `failed-precondition` ("fulfillment not ready").
- [ ] Fix and rerun the owner catalog test: actual catalog state disagrees with the expected inactive/purchase-disabled state for at least one seeded item.
- [ ] Re-run the complete Functions integration suite after the fixes; do not treat skipped tests as passing.

## Phase 1 — implementation and emulator/CI closure
- [ ] Auth: registration, sign-in/out, email verification, reset, account state transitions and unauthorized access.
- [ ] Owner: canonical owner UID, MFA/session freshness, denial audit, owner-only mutations and recovery path.
- [ ] Privacy and guest lifecycle: consent version/hash, guest expiry, upgrade, deletion/erasure and access boundaries.
- [ ] Wallet: atomic transfer, commission, both member ledgers, platform ledger, idempotency and insufficient-balance rollback.
- [ ] Store/economy: catalog publication, purchase idempotency, receipt, ledger, entitlement fulfillment, owner controls and manual coin purchase verification.
- [ ] Rules: Firestore and Storage emulator authorization tests.

## Membership cycles and safety
- [ ] Guest lifecycle integration tests and privacy acknowledgement.
- [ ] Biometric local-auth cycle: 30-day server eligibility, single 1,500-coin reward, replay/concurrency tests. This verifies local OS authentication only; it is not civil identity proof or liveness verification.
- [ ] Email renewal: 90-day cycle, Firebase verified-email confirmation, one 500-coin reward per cycle and replay tests.
- [ ] FCM token registration, rotation, stale-token deactivation and delivery tests.
- [ ] Block/report/moderation/appeal lifecycle tests and UI integration.
- [ ] Age safety policy and enforcement. Self-declared age must not be represented as independently verified age.

## Rooms and product features
- [ ] Room rental pricing, atomic charge, renewal, expiry, transfer and lifecycle integration tests.
- [ ] Audio/video signaling, permissions, participant lifecycle, reconnect/end events and actual media transport.
- [ ] Room event delivery and authorization.
- [ ] Premium feature store, badges store and titles store: catalog, owner publication, purchase, wallet ledger, receipt, entitlement, UI consumer, expiry and renewal for every approved feature.
- [ ] Do not enable purchases for a feature until its end-to-end entitlement consumer is implemented and tested.

## Phase 2 — media and audit
- [ ] Secure upload intent, signed URL expiry/replay/size/type validation, quarantine and scan verdict.
- [ ] ClamAV scanner deployment in isolated non-production infrastructure and signed callback validation.
- [ ] GCS real upload/download/delete and generation-match deletion tests.
- [ ] Retention scheduling, legal holds, deletion retries and restoration tests.
- [ ] 24-month tamper-resistant audit archive: retention-locked/WORM storage, restricted IAM, integrity verification, export pagination/redaction and restore drill.

## Explicitly deferred to controlled pilot / launch acceptance
These are not waived; they are documented as launch gates:
- [ ] Physical Android and iOS device acceptance (biometrics, camera, microphone, FCM, media upload/playback, auth).
- [ ] Non-production cloud integration tests against actual Cloud Run, GCS, Secret Manager and deployed Functions.
- [ ] Backup/PITR restore drill and 24-month retention-lock verification.
- [ ] Production privacy/legal review, age assurance decision and operational moderation readiness.
- [ ] Production credentials, App Store/Play signing, release builds and staged rollout checks.

## Completion rule
A work item is complete only when its code path, automated tests, security rules, UI integration (where applicable), and evidence are linked. Items explicitly deferred above remain open until their pilot/launch acceptance evidence is recorded.
