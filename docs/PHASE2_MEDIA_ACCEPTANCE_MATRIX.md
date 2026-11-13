# Phase 2 media acceptance matrix

Status snapshot: 2026-11-13. This document is a release gate, not a claim that every gate has passed.

## Implemented in the development branch

- Server-issued, short-lived, object-scoped upload intents; create-only Storage generation precondition and exact declared-size binding.
- Server-side finalization checks ownership, MIME allowlist, byte count, object generation and leading-byte signature.
- Authenticated uploader classification: Firebase anonymous provider is guest; other authenticated providers are member. Client-supplied classification is ignored.
- Owner media listing is paginated and filtered by status/uploader type. Owner access requires the sole-owner claim and recent MFA.
- Safe owner image preview uses a server-verified, re-encoded WebP derivative and returns bounded bytes; original quarantine bytes are not rendered in the Flutter UI.
- Scanner callback validates HMAC, provider, freshness, object generation and full-object hash. Files fail closed while scanning or when evidence is missing/mismatched.
- Scanner dispatch and isolated ClamAV gateway source exist; malicious verdicts delete only the exact scanned generation.
- Abandoned upload cleanup is scoped to exact quarantine paths and observed Storage generations, with grace periods and transactional quota handling.
- Media access events are written to the server-only media audit collection. Privileged owner-review audit uses a separate hash-linked chain.

## Automated validation evidence

- **Latest full green validation of the retention implementation:** commit `4f9d317291c3ecdab049256b32c8450f776aaaf5`, workflow run [43383055516](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43383055516), completed successfully on 2026-11-13. Earlier baseline validation also passed on `45b707eee0f765af9ccf260753622fada47a753f` in run `43379943559`.
- The exact run passed all three jobs: Flutter analysis, Flutter tests and Web release build; Cloud Functions TypeScript compilation/unit tests, media callable authorization/audit integration tests, and Firestore/Storage rules emulator tests; isolated ClamAV scanner source/security tests, container build and EICAR signature detection.
- Earlier run [43379722894](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379722894) failed because it attempted a V4 signed HTTP PUT against the Storage Emulator, which returns HTTP 501 for that endpoint. The current emulator integration test now uses the supported Admin Storage API to exercise object creation with the generation precondition and callable finalization. The test explicitly does not claim to validate the signed HTTP wire protocol.
- **Real Cloud Storage signed URL HTTP verification remains pending.** The opt-in script `functions/scripts/test-signed-urls-http.cjs` must be run against a disposable non-production GCS bucket with approved credentials; it covers real PUT/GET, create-only replay, exact byte-range rejection and expiry. Emulator success is not a substitute.
- PR #3 workflow run [43379722396](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379722396) passed its CI jobs, but PR #3 remains based on a divergent development snapshot and its changes must be reconciled selectively, not merged wholesale.
- Track the remaining non-production infrastructure, real-GCS, audit export/retention and owner-approval gates in [issue #4](https://github.com/productionhome2022-hash/mawda-platform/issues/4).

## Required release gates

| Gate | Required proof | Status |
|---|---|---|
| Owner authorization | Owner succeeds only with sole-owner claim and fresh MFA; stale MFA, non-owner and revoked sessions denied and audited | Emulator coverage exists; latest run must pass |
| Member/guest isolation | Member and anonymous guest cannot list, inspect, preview or read another uploader's media | Emulator coverage exists; latest run must pass |
| Upload integrity | Exact content type, byte count, signature and create-only generation; mismatch rejected and audited | Code and emulator coverage exist; real bucket HTTP run pending |
| Replay/expiry | Emulator generation-precondition/finalization checks plus real GCS HTTP PUT/GET, replay and expiry | Emulator checks pass on run 43379943559; real bucket HTTP run pending |
| Malware scan | Clean, EICAR/malicious, malformed, timeout, unavailable, stale, duplicate, tampered HMAC/hash/generation cases | Scanner unit/CI work in progress; non-production end-to-end run pending |
| Safe preview | Only sanitized derivative, bounded response, generation/hash/provenance rechecked | Code and Flutter owner UI exist; full image corpus/device validation pending |
| Cleanup | Grace period, exact path/generation deletion, missing-object recheck, retry and quota release | Code and unit/emulator coverage exist; latest run must pass |
| Audit | Upload, validation, listing, preview, denial and scan outcomes are server-written; no raw file bytes or signed URLs | Core event writes exist; export/retention controls remain pending |
| Retention | Approved 4-hour media / 7-day text policy; exact-generation deletion, tombstone reconciliation, operational log expiry, legal holds and backup/cache behavior validated in non-production | Policy approved; chat deletion code and emulator tests pass; workers disabled and real GCS/backup/legal-hold gates pending |
| Infrastructure | Cloud Run IAM, least-privilege bucket access, Secret Manager rotation, callback URL, CORS, monitoring and retry/dead-letter handling | Source exists; non-production provisioning/verification pending |
| Storage/Firestore release | Rules tests pass; production rules remain deny-all for client media access | Emulator tests exist; no production mutation authorized |

## Owner-approved retention policy (recorded 2026-11-13; implementation and tests still required)

1. **Stories:** delete the story media immediately when the story expires. No post-expiry retention window or ordinary grace period is allowed. Any legally binding preservation order must be isolated as a documented legal hold, not treated as routine retention.
2. **All chat text messages (direct one-to-one, public chats and rented private rooms):** permanently delete every text message no later than 7 days after sending, across all three chat types. This includes message bodies and any platform-controlled text archive, backup, export cache or recoverable copy; after expiry, no original message text may remain recoverable in platform-controlled systems. Delete associated text-search/index copies and message-content caches. Keep only minimal non-content audit metadata where required for security/accountability. Do not wait for a room-level weekly batch if an individual message has already reached its 7-day deadline.
3. **Chat media remains a separate universal rule:** all media in all three chat types is destroyed within 4 hours, not retained until the 7-day text-message purge.
4. **Universal chat-media self-destruction (all chat types):** every image, animated image, video, audio/voice recording, document, file and other attachment sent in direct one-to-one conversations, public chats or rented private rooms must be destroyed no later than 4 hours after sending/upload. This is independent of message retention and applies equally to all chat types. No chat media may be retained as a cloud archive or kept beyond that 4-hour lifecycle. This prohibition includes platform-controlled backup copies, object generations/versions, soft-deleted or recoverable objects, snapshots, replicas, archive tiers, CDN/cache copies and disaster-recovery copies. Storage lifecycle/configuration must prevent those mechanisms from retaining chat-media payloads beyond the four-hour deadline; metadata may retain only non-content audit evidence needed for security/accountability. Delete the original object and every platform-controlled derivative/copy (thumbnail, preview, transcoded/sanitized version, temporary processing object and cached copy), revoke access capabilities, and remove or tombstone database references. Run frequent scheduled deletion plus event-driven cleanup, with retries and exact-generation checks; the 7-day text-message purge must never extend media lifetime. Do not claim control over copies a recipient independently downloaded, screen-recorded or captured outside the platform.
5. **Profile gallery media:** every 7 days, purge member-uploaded gallery media so uploaded photos and other media do not remain in the profile gallery. A valid deletion request must be processed sooner where technically possible; do not retain gallery originals as a long-term archive.
6. **Avatar and cover:** retain only the currently selected avatar/cover asset. A superseded asset must be deleted within 30 days. A selected avatar/cover is valid for at most 30 days from its selection/upload; at expiry the member must replace it, otherwise the platform must switch the profile to the built-in Mawda default avatar/cover and delete the expired custom object. Confirm product behavior for separate avatar and cover defaults during implementation.
7. **Operational media logs:** retain for 3 months (90 days), then expire them through a controlled scheduled process.
8. **Owner-review and sensitive security audit evidence:** retain for 24 months. Preserve integrity verification, exportability and legal-hold support; never silently shorten this period.
9. **Unfinished upload intents:** clean only after the signed upload capability expires plus the configured grace period, with a missing-object recheck and exact-generation safety.
10. **Legal holds and exceptions:** a documented, authorized legal hold may suspend deletion only for the specifically scoped objects/records and duration required. Record who authorized it, legal basis/reference, scope, start/review/end dates and every access. On release, deletion resumes immediately according to the underlying policy.
11. **Deletion controls:** all scheduled purges must use dry-run previews, exact object generations, idempotent batches, retry/dead-letter handling, audit evidence and recovery checks. Never sweep an entire bucket prefix. Backups/caches must have an aligned, documented expiry and must not silently reintroduce deleted content.
12. **Unified chat-text retention:** the owner-approved schedule is to delete all text messages in direct, public and rented-private chats no later than 7 days after sending. Media is separately destroyed within 4 hours.

A successful malware verdict does not by itself authorize member delivery. Only types with a completed safe-processing pipeline may become eligible for delivery. Images use sanitized WebP derivatives; video, audio and PDF remain unavailable until type-specific processing is implemented.

## Per-user media deletion isolation (13 November 2026)

- Firestore/Storage emulator tests now prove that delete-for-me hides a media message only for the requester, leaves it visible to the peer, and preserves the original Storage object and media asset in both direct chats and rooms.
- Full CI passed on `faf5a2e20fc4d6c8874db8cc86ecac3c0d8e7b67` in [run 43391790845](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43391790845), including all backend integration, Flutter, rules and scanner jobs.

## Cross-client refresh and all attachment categories (13 November 2026)

- Direct and room message reads suppress `deletionPending` messages. Both Flutter chat screens refresh from their trusted callable every 8 seconds to converge across active devices; this is eventual polling, not realtime push.
- Integration tests now cover image, video, audio and PDF/document media IDs, including multiple attachments in one direct message. Legal-hold blocking and retry-after-release are tested.
- Full validation on `8da2204f0325d19a172979da33125fb29e03e4db` passed in [run 43390815304](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43390815304), including Flutter analyze/tests/Web release, Functions compile/unit/integration, Firestore/Storage rules, scanner tests, container build and EICAR.
- This does not create a media upload/send/rendering UX. All media categories are supported by the deletion reference contract, but member-facing upload/delivery integration remains a separate open gate.

## Manual message-media deletion update (13 November 2026)

- Direct and room delete-for-everyone now recognize message-linked `mediaId` / `mediaIds`, hide the message while erasure is pending, and delete the exact original object generations, sanitized WebP preview and validated known derived object paths before removing the message and notifications.
- An active legal hold blocks media erasure. The original expiry clock is preserved; after release, the same deletion request can be retried. The media asset becomes a content-free `manually_deleted` tombstone and receives an operational audit event.
- Integration tests run against Firestore and Storage emulators and cover direct and room media erasure, original/preview object removal, pending visibility during a legal hold, and successful retry after release.
- Full CI passed on `602f29a02d9c569c8c252913a3b1bc1dfb671428` in [run 43390455210](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43390455210), including Flutter, Functions, all emulator integration suites, rules, scanner tests, container build and EICAR.
- Still not complete: member-facing media send/delivery is not wired for all media types; deletion of CDN/cache/backup/PITR replicas and real GCS soft-delete/version behavior is not proven. The helper deletes exact known object paths and visible generations only.

## Latest CI result (13 November 2026)

- Commit `8b82bd2d72c1bec461ba9f57fd34f4a7c0eae6c3` passed full workflow [43389618699](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43389618699).
- All Flutter analysis/tests/Web release build, Functions compile/unit tests, media/retention/deletion/audit-export/legal-hold Firestore emulator integration tests, Firestore/Storage rules tests, scanner security tests, Docker build and EICAR detection passed.
- Real non-production GCS signed URL, generation/soft-delete, Cloud Run scanner deployment, backup/PITR, cache/CDN and production infrastructure evidence remain unverified.

## Owner audit export implementation update (13 November 2026)

- Added an MFA/sole-owner protected callable `exportOwnerReviewAuditPage` for bounded, cursor-based export of the owner-review hash chain.
- Export pages are capped at 100 returned records and scan at most 500 chain records per request. The cursor tracks the last scanned sequence so filtered pages do not repeatedly rescan the same range.
- Filters support sequence cursor, event-time range, actor UID and action. Invalid cursors, page sizes, dates and filter values fail closed.
- Exported event payloads are recursively projected to omit credentials, signed/download URLs, raw content/text/body and file bytes. The export operation itself is appended to the same hash-linked audit chain.
- Added unit tests for validation and recursive redaction. GitHub Actions validation for the new callable and tests is pending; this does not yet prove export retrieval against a populated Firestore emulator or production-like data.
- The 24-month retention/deletion control for audit evidence is **still not implemented**. It must not be implemented as a blind TTL on hash-chain events: verified checkpoints/anchoring and legally scoped holds must exist first, or deletion would make historical chain verification impossible.

## Media legal-hold implementation update (13 November 2026)

- Sole-owner/MFA callables now place, list, review and release legal holds for one exact chat-media asset. Every hold records authority, legal basis, reference, scope, start, review and end dates.
- Review updates the review date and note without extending the recorded end date. Release/expiry restores the original retention policy and original expiry timestamp.
- Chat-media expiry workers skip assets with an active legal hold. An hourly expiry function exists but is disabled by default and only runs when explicitly enabled on a named non-production project.
- Unit and Firestore-emulator integration tests cover validation, hold placement, review/list, release, owner-only access and the original expiry clock. Latest CI is pending.
- **Limitations:** this does not yet implement holds for text messages or profile/story media, review reminders, authority-document verification, or production-grade legal workflow approval. A hold must be treated as narrowly scoped technical metadata, not a substitute for legal review.

## Signed upload replay cleanup and latest verification (13 November 2026)

- Manual deletion tombstones retain exact object-name references in `deletedObjectPaths`, allowing the Storage-finalized trigger to remove an original object recreated by a still-live signed PUT URL, as well as known derivatives. The manual delete helper also retries against tombstoned paths.
- The Firestore/Storage emulator integration test simulates a post-delete upload replay and verifies a second exact-generation cleanup.
- Commit `1a6c6ad3686b887c75416e039e553ecb5b95aefc` passed full CI in [run 43391265176](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43391265176), including all backend integration suites, Flutter analysis/tests/Web build, Firestore/Storage rules, ClamAV/container/EICAR.
- This is emulator proof only. The separate manual non-production GCS workflow must still be dispatched successfully to prove real signed URL expiry/replay and real bucket generation/soft-delete behavior.

## Real GCS verification workflow (manual, non-production only)

A manual workflow is now available at `.github/workflows/nonproduction-media-verification.yml`. It runs only on `workflow_dispatch`, refuses the production Firebase project and bucket names, and authenticates with GitHub OIDC (no service-account JSON key).

Before running it, configure these repository variables:
- `MAWDA_WIF_PROVIDER`: Workload Identity Federation provider resource name.
- `MAWDA_NONPROD_TEST_SERVICE_ACCOUNT`: dedicated non-production test service account email.

The selected service account needs permission to read bucket metadata, create objects, list object versions, and delete exact generations in the dedicated test bucket. Dispatch the workflow with a project ID and bucket name containing an explicit marker such as `test`, `staging`, `dev`, `demo`, `nonprod` or `sandbox`. The scripts independently reject production-like targets, bucket soft-delete retention and bucket retention policies, and verify signed PUT replay (412), size rejection (400), GET/PUT expiry, uniform bucket-level access, public access prevention and exact-generation purge.

**Not yet executed:** this workflow is a safe execution path, not proof of a successful live GCS test. No GCP project, WIF provider, service account or bucket credentials are available to this code-edit session. Phase 2 remains open until the workflow is run successfully against a dedicated non-production bucket.

## Delete-for-me notification and explicit bucket configuration (13 November 2026)

- Direct delete-for-me removes the requester's direct-message notification atomically with the per-user hide marker; it does not delete the message or media object for the peer.
- `MAWDA_MEDIA_BUCKET_NAME` is now an explicit Functions parameter. The non-production scanner deployment workflow writes the same bucket into the project-specific Functions environment, preventing the scanner and Firebase Functions from silently targeting different default buckets.
- Full CI passed on `912f48a86a90eee851dc212d84c65c05628cb75b` in [run 43392935983](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43392935983).

## Live non-production ClamAV deployment and Firebase connection workflow

A manual workflow `.github/workflows/deploy-nonproduction-media-scanner.yml` now:
1. Refuses production or unmarked project/bucket names and authenticates through GitHub OIDC.
2. Builds the isolated scanner image and pushes it to Artifact Registry.
3. Grants the scanner runtime service account Secret Manager access and object-create access only to the `processed/` managed folder; grants the Functions runtime service account bucket object-view, Cloud Run invoke and its own signBlob permission.
4. Deploys Cloud Run with IAM authentication only, verifies the authenticated `/healthz` endpoint, and removes the temporary deployer invoker binding.
5. Runs the real GCS signed PUT/GET expiry, replay and size-limit test plus exact-generation purge/bucket-safeguard test before deployment. It writes the non-production bucket/scanner URL/callback/provider parameters into a temporary project-specific Functions env file, deploys Functions only to the selected non-production Firebase project, then runs a live clean-PNG plus EICAR end-to-end scan through Firebase trigger → private Cloud Run → signed callback.

Required repository variables:
- `MAWDA_WIF_PROVIDER`
- `MAWDA_NONPROD_DEPLOY_SERVICE_ACCOUNT`

Required pre-created Secret Manager secrets in the selected project:
- `MAWDA_MEDIA_SCANNER_API_TOKEN`
- `MAWDA_MEDIA_SCANNER_HMAC_SECRET`

The deployer service account needs Artifact Registry, Cloud Run, API enablement, Secret Manager IAM, service-account IAM, Firebase Functions deployment and Eventarc permissions. For the live E2E fixture it also needs Firestore data read/write (for example `roles/datastore.owner` on the dedicated non-production project) and Storage object create/list/delete (for example `roles/storage.objectAdmin` on the dedicated non-production test bucket). These elevated test permissions must not be granted in production. The scanner runtime service account receives only Secret Accessor plus object-create on the `processed/` managed folder. The Functions runtime service account receives object-admin only on the `quarantine/` and `processed/` managed folders (for signed uploads, safe preview reads, exact-generation deletion and retention), plus signBlob permission on itself. The workflow explicitly configures `MAWDA_MEDIA_BUCKET_NAME` so the Functions and scanner runtimes target the same bucket. The Functions runtime service account must be the actual runtime identity configured for that non-production Firebase project.

**Not yet executed:** no GCP/WIF credentials or non-production Firebase project are available in this session. The workflow is now executable after the owner configures the listed identities/secrets and dispatches it; deployment and live EICAR callback remain unverified until it succeeds.

## Merge and deployment boundary

PR #2 and PR #3 are separate draft proposals. PR #3's head is based on an older snapshot of the development branch and the refs currently diverge; do not merge either PR until the phase-2 changes are reconciled onto one current branch and the exact final commit has a green full CI run. No production Firebase mutation, production deployment, public Storage access or merge to `main` is authorized by this engineering record.


## Chat retention implementation added (13 November 2026)

- Chat media retention begins at server-side upload finalization. A four-hour expiry timestamp is stored for every `chat` / `room` media asset.
- A gated, once-per-minute worker deletes the exact original object and every visible GCS generation, the safe WebP derivative and scan-job reference. It then keeps only a content-free tombstone and rechecks the deterministic derivative path every five minutes to catch a scanner already in flight.
- A separate gated worker permanently deletes message documents in `directChats/{chatId}/messages` and `rooms/{roomId}/messages` at seven days, deletes direct-message notification documents, and clears expired direct-chat text previews.
- Media access audit events receive 90-day expiry and a scheduled cleanup path.
- Retention workers default to disabled and refuse to run unless the project is explicitly identified as non-production. No production deletion has run.
- Full CI passed on `4f9d317291c3ecdab049256b32c8450f776aaaf5` in [run 43383055516](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43383055516): backend compile/unit tests, chat-retention Firestore integration, media callable integration, Firestore/Storage rules, ClamAV EICAR container, Flutter analyze/tests and Web release build.
- Still pending: real non-production GCS generation/soft-delete test, real signed-URL HTTP test, live Cloud Run scanner lifecycle, backup/PITR configuration proof, legal-hold behavior, audit export/checkpoint retention, and story/gallery/avatar/cover jobs.
