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



## Audit correction — exact development-head and validation evidence (15 November 2026)

This section supersedes any conflicting statement above about the latest tested application-code head or the scope of changes after it.

- Current development branch head verified during the audit: `8891b45215e0c94cc622dcd823caf2363fe549db`.
- The previous statement that changes after `d341ff04374f678cc4d06ea1b1459a27b0319619` were only workflow/documentation changes is incorrect. GitHub commit comparison shows the current branch is 192 commits ahead of `d341ff0`, and the intervening diff includes application code, Cloud Functions, Flutter UI, media/scanner logic, retention, economy, room flows and tests.
- PR #2's description cites `f85888c549e77cdf904c14028f17c07e0b2b8e33` as a validated head. The current development branch is 219 commits ahead of that SHA. The successful runs `43705157128` (Validate Mawda) and `43705157163` (native Debug/unsigned iOS validation) therefore do not establish validation of the current branch head.
- The older run `43713242606` validated `d341ff0`, not the current head. No PR-triggered workflow runs or combined commit statuses were returned for current head `8891b45` at the time of this audit.
- Accordingly, the current development head is **not yet demonstrated green**. Run the complete validation workflow on the exact current SHA and record all job conclusions before changing this status.
- The development branch remains 2,205 commits ahead of `main` and 7 commits behind it. Do not merge or rebase as part of this correction.
- The separate 5,000-persona simulation remains unaccepted. Lab PR #2 proposes bounded transient retries and lower room-worker concurrency after the prior run stopped at 2,679/5,000; the fix must be reviewed and the full simulation rerun against an immutable current platform SHA.

This correction is documentation-only. It does not claim new tests passed, does not change application behavior, and does not authorize merge, deployment, Firebase mutation, paid resources or destructive operations.


## Audit follow-up — exact-head CI result and 5,000-persona lab review (15 November 2026)

### Primary development branch validation

The application-code baseline `040c8c383e58b7a41b3a3d88d9cfb88231881aae` was verified as the development branch head immediately after the audit-correction commit. GitHub Actions then completed the following runs on that exact SHA:

- `43753092460` — **Validate Mawda**, conclusion `success`. All three jobs succeeded:
  - Flutter analysis, Flutter tests, PWA asset validation and Web release build.
  - Cloud Functions compilation/unit tests and the configured emulator integration suites, including retention, wallet/store, room rental/events, backup/restore, push-token, safety/privacy, seeded persona interaction, legal hold, premium profile, and Firestore/Storage rules.
  - Isolated ClamAV scanner source/security tests, Docker image build, media sanitization tests and EICAR detection.
- `43753092482` — **Mawdda domain regression**, conclusion `success`.
- `43753093715` — CodeQL run associated with this SHA, conclusion `success`.

These results establish successful CI for the exact SHA above. They do not establish physical-device acceptance, live Firebase readiness, release approval, or a successful 5,000-persona simulation.

### Separate 5,000-persona lab

Lab PR #2 remains open and Draft, with head `2ce169e06733fc535b05699a9c757537965756da`. Its lab validation run `43728976974` completed successfully. The successful checks include JavaScript/shell syntax, the bounded Firestore retry unit tests, workflow YAML parsing, and a guard against production deployment commands.

Code review of the proposed room-join mitigation confirms:

- Room cohorts contain 50 personas; joins within each room are sequential.
- At most two room-group workers run concurrently, reducing contention on the emulator's shared Firestore process.
- Only transient transaction/transport failures are retried, with a maximum of eight attempts and exponential delay capped at 5 seconds.
- Permanent permission and validation errors are not retried.
- `joinRoom` is idempotent for an already-created membership: its transaction checks the membership document and returns before incrementing `memberCount`. This makes retry after an ambiguous transient failure safe against duplicate membership/count increments.
- Progress is logged every 250 room joins.

No further code change was justified by this review. The mitigation is **reviewed and unit-tested**, not yet proven by a full end-to-end 5,000-persona run. The lab's `Run 5,000-persona simulation` workflow is manual-dispatch only and requires the private read-only `MAWDDA_PLATFORM_READ_TOKEN` secret. The available GitHub connection can read workflow runs but does not expose a workflow-dispatch action, so this audit did not start the full simulation.

The next acceptance evidence must be a successful manual lab run pinned to the immutable primary-platform SHA `040c8c383e58b7a41b3a3d88d9cfb88231881aae`, with its run ID, elapsed time, complete 5,000/5,000 lifecycle coverage and uploaded report recorded. Keep lab PR #2 Draft/unmerged until the owner-authorized review/merge process is completed. No merge, deployment, live Firebase mutation, billing activation or production operation is authorized by this audit.


## Executive audit refresh — 16 November 2026 (supersedes earlier head/status statements)

This section records the live GitHub state checked on 16 November 2026. Earlier audit entries remain historical evidence and must not be read as the current branch head.

### Current repository state
- Primary repository: `productionhome2022-hash/mawda-platform`.
- Development branch: `codex/mawda-full-platform-implementation`.
- Development HEAD at audit time: `46f1021c98701a42fb85a02757f35166edf7c866`.
- Main HEAD: `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- GitHub compare reports development `ahead_by=2210`, `behind_by=0`. PR #18 (main-history reconciliation) is closed and merged into the development branch only; it did not merge development into main.
- PR #2 remains open, Draft, unmerged, with base `main` and head SHA `46f1021c98701a42fb85a02757f35166edf7c866`. It remains a release review container, not permission to merge.

### Exact-head CI evidence
- Validate Mawda run `43759278023`: `completed / success` on exact HEAD `46f1021c98701a42fb85a02757f35166edf7c866`. Jobs passed: Flutter analysis/tests/Web release build; Cloud Functions compile/unit and configured emulator integration suites; Firestore/Storage emulator rules; isolated ClamAV scanner/container/media sanitization/EICAR tests.
- Mawdda domain regression run `43759278052`: `completed / success` on the same exact HEAD. Jobs passed: retention/room reservation emulator regression and Flutter UI/widget tests.
- These runs establish the current development HEAD's configured CI gates. They do not establish live Firebase/GCS/Cloud Run behavior, native builds on this exact SHA, physical-device acceptance, production readiness, or deployment.

### Native platform boundary
- Latest observed successful native bootstrap run: `43745115673`, SHA `27b2e2159ff5ca2e5c7db5f488acfcb185e9eb82`, older than current HEAD.
- Therefore Android Debug and unsigned iOS builds are not yet evidenced on current HEAD.
- Owner-key-signed Android Release remains unrun and requires owner-provisioned signing secrets; never request or expose those secrets in chat.
- No physical-device acceptance is recorded.

### 5,000-persona simulation
- Lab repository: `productionhome2022-hash/mawdda-5000-simulation-lab`.
- Lab branches include `fix/room-join-retry-5000` (updated after the follow-up RSVP fix; see commit `f024ebda492add4028f0ffb2a6901953e9ece48b`) and `fix/room-join-contention-5000` at `3a61799757c493c5884da41e33f71bb3f5398d96`.
- Lab PR #2 (bounded Firestore transient retry) and PR #3 (Node 22 / artifact action alignment) are both open, Draft, unmerged, and target lab `main`. Their harness validation runs passed; this does not prove the full simulation.
- Workflow run `43769264292` was still `in_progress` at the latest poll. It was dispatched from lab `main` at SHA `c9a3a330c914e84a8e0a3bbb524028d79264cf30`; its checked-in workflow is the older Node 20 / upload-artifact v5 workflow, not the retry-fix PR workflow. Workflow logs later confirmed the exact checked-out platform SHA was `46f1021c98701a42fb85a02757f35166edf7c866`; the run used the older lab `main` harness (Node `20.20.2`, `actions/upload-artifact@v5`), not the Draft retry-fix PR branch.
- Previous full run `43691324361` failed at room joins after 2,679/5,000 with Firestore Emulator transaction lock timeout.
- The retry PR's unit tests and harness checks passed, but the 5,000/5,000 lifecycle remains unaccepted. Do not merge either lab PR to `main` without separate owner approval.

### Remaining engineering and acceptance gates
1. Obtain native Android/iOS validation on one exact current development SHA; separately verify owner-key signed Android Release and physical-device installation when authorized.
2. Complete in-app WebRTC voice/video signaling and call lifecycle, room event reminder/fanout, and remaining room rental cancellation/refund/expiry acceptance.
3. Complete live non-production GCS signed URL/CORS/generation/replay checks and Cloud Run scanner IAM/HMAC end-to-end tests; emulator CI is not a substitute.
4. Resolve the historical Storage bucket discrepancy between `mawda-app-2026.appspot.com` and `mawda-app-2026.firebasestorage.app` through read-only Console inspection before any media activation.
5. Complete backup/PITR/restore, App Check, owner MFA provisioning/recovery, penetration/accessibility/performance, and privacy/legal acceptance.
6. Keep retention/deletion workers disabled until all dry-run, exact-generation, legal-hold, audit and recovery gates pass.
7. Keep all production mutation, billing activation, paid resource creation, `main` merge and deployment behind separate explicit owner approval.

### Coordination updates
- Existing issue #5 is the section 02 work queue for application/native build and product acceptance.
- Existing issue #4 is the section 03 work queue for Firebase/GCP non-production infrastructure, IAM, scanner, GCS, backup and retention evidence.
- The 16 November execution handoff comments were added to those existing issues; no duplicate planning documents were created.

### Tool and access boundary
- The connected GitHub capability in this session supports repository/file/PR/run reads and selected issue/PR writes, but does not expose a workflow-dispatch action. No new manual workflow was dispatched by this audit.
- No Firebase Console/GCP Billing live-state connection was available. No billing, card, resource, production Firebase or deployment operation was performed.


## Follow-up execution evidence — simulation and retention correction (16 November 2026)

This section supersedes the earlier statement that lab run `43769264292` was still in progress.

### 5,000-persona run result and root cause
- Lab run [43769264292](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43769264292) completed with `failure`; it ran the lab default-branch workflow at lab SHA `c9a3a330c914e84a8e0a3bbb524028d79264cf30`.
- Platform backend checkout and compile succeeded. The isolated emulator lifecycle then failed with Firestore `10 ABORTED: Transaction lock timeout` during event RSVP processing.
- Artifact `14184542178` (`mawdda-5000-simulation-43769264292`) was downloaded and inspected. It records 5,000 provisioned personas, 5,000 lifecycle rows, all pre-event stages including room joins at 5,000/5,000, 950 events listed, 949 RSVP confirmations, and `lifecycleCompletedPersonaCount=949`. This is a failed partial simulation, not a 5,000/5,000 acceptance.
- Root cause in the harness: up to 25 persona flows ran concurrently, while each RSVP transaction increments the same `roomEvents/{eventId}.attendeeCount` document for members of that room. This created a hot-document contention point. Server-side capacity/authorization logic was not weakened.

### Targeted lab fix
- Updated existing Draft lab PR #2 branch `fix/room-join-retry-5000` with commit `f024ebda492add4028f0ffb2a6901953e9ece48b`.
- RSVP processing now groups by room, serializes members within each event, limits independent event groups to two concurrent workers, and applies the existing bounded transient retry helper to RSVP only. Progress is emitted every 250 confirmed RSVPs.
- Lab harness validation [43772590541](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43772590541) passed on that exact commit, including JavaScript/shell syntax, bounded retry unit tests, workflow YAML and no-production-command guard.
- This is harness validation only. No full 5,000-persona rerun has yet been completed against the retry/RSVP fix and a pinned current platform SHA. PR #2 remains Draft/open/unmerged; PR #3 remains Draft/open/unmerged. No lab `main` merge was performed.

### Retention policy documentation correction
- The binding constitution sections 19.1–19.3 control: temporary direct chat = full conversation after four hours of server-recorded inactivity; normal = media 4h/text 7d; important = media 4h/text 30d.
- The owner has not decided who selects the direct-chat mode or whether both participants must consent. This remains unresolved and blocks activation of destructive production deletion.
- Corrected `docs/PHASE2_RETENTION_OPERATIONS.md` to remove its earlier universal seven-day text statement and align operational guidance with the approved three-mode policy and the unresolved selection/consent gate.
- Added an explanatory update to existing issue #4. No retention code or live schedule was activated.

### Current development revision after audit corrections
- The documentation commits for the 16 November status and retention alignment advanced the development branch to `9715485b637998c53bdf0e592e24842255f20fb2`.
- On this exact SHA at the time of this update: Validate Mawda run `43772655185` was pending; domain regression run `43772655227` was in progress; PR check run `43772656212` was queued. The domain regression for the preceding documentation-only SHA `7807cc257dfbaece7373a3a3e54d289c47b91400` was still running. Do not label `9715485` green until its own runs finish.
- The lab retry/RSVP correction and retention documentation correction are recorded in existing GitHub PR/issue threads. No duplicate organizational documents were created.


## Final audit pointer — current development HEAD (16 November 2026)

- The latest documentation-only follow-up commit is `01d7ecd6fdb541457aa4c7d5f26d7e0ffb051373`; it records the failed 5,000-persona run, its exact platform checkout SHA and the retention-policy correction.
- Exact-head validation on `01d7ecd`: Validate Mawda run `43772695602` queued; domain regression run `43772695619` queued at the latest poll. The earlier exact-head checks on `46f1021` remain successful, but must not be substituted for the new SHA.
- Lab PR #2's updated harness commit `f024ebd` passed lab validation run `43772590541`. Full simulation after this change remains unrun; no dispatch action is exposed in the current GitHub connection.
- The artifact from failed run `43769264292` proves the full 5,000-member room-join stage, not full lifecycle acceptance: 949/5,000 completed all event/RSVP stages.

## WebRTC call implementation update — 16 November 2026

This update supersedes the earlier statement that in-app WebRTC call code was not implemented. The development branch now contains the first integrated implementation; it is **not yet release-accepted**.

Implemented in source:
- Authenticated call creation, acceptance/rejection, cancellation/end, active-call lookup, ring expiry and scheduled stale-signal cleanup.
- Server-side membership checks for direct chats and rooms, account standing, age-band compatibility, mutual block checks, and atomic per-member active-call locks to prevent overlapping calls.
- Caller-only SDP offers, recipient-only SDP answers, recipient-scoped ICE signaling, per-peer monotonic sequence numbers, bounded payloads, replay protection and participant leave handling.
- Per-call ICE configuration with public STUN and optional short-lived TURN REST credentials generated from the `MAWDDA_TURN_SHARED_SECRET` secret and `MAWDDA_TURN_URLS` parameter.
- Flutter WebRTC audio/video UI, local media controls, targeted peer connections for room calls, incoming-call notification routing, and Android/iOS camera/microphone permissions.
- Unit and Firestore-emulator integration coverage, including direct calls, room peer isolation, active-member locking, and participant departure. The explicit coverage journey is `CALL-001` in `functions/test/fixtures/feature-coverage-matrix.json`.

Still open before this work can be called complete:
- Exact-head CI for the latest code and emulator call integration suite must finish green.
- TURN relay infrastructure and its secret/URL parameters have **not** been provisioned. The current default is STUN-only; connectivity can fail behind restrictive NATs or some mobile networks.
- No physical Android/iOS device-to-device audio/video acceptance has been performed. Camera/microphone permissions, network switching, Bluetooth/audio routing, background/terminated incoming-call behavior, and long-call ICE recovery remain to be verified.
- Room calls currently use a peer-to-peer star topology with a conservative five-participant engineering ceiling. This is not a product entitlement or owner-approved room capacity; larger group calling requires an SFU/media-server architecture.
- No production deployment, Firebase production mutation, TURN paid-resource activation, merge to main, or release action has occurred.

The call journey remains partial until the exact-head automated evidence, non-production TURN configuration, real-device tests, security review and owner acceptance are complete.
