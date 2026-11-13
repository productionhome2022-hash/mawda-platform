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

- **Latest full green validation on the current PR #2 development head:** commit `45b707eee0f765af9ccf260753622fada47a753f`, workflow run [43379943559](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379943559), completed successfully on 2026-11-13.
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
| Retention | Purpose-specific schedule, legal hold, deletion authority, backup/cache treatment and appeal/export process approved and tested | Not approved; finalized-media deletion remains disabled |
| Infrastructure | Cloud Run IAM, least-privilege bucket access, Secret Manager rotation, callback URL, CORS, monitoring and retry/dead-letter handling | Source exists; non-production provisioning/verification pending |
| Storage/Firestore release | Rules tests pass; production rules remain deny-all for client media access | Emulator tests exist; no production mutation authorized |

## Owner-approved retention policy (recorded 2026-11-13; implementation and tests still required)

1. **Stories:** delete the story media immediately when the story expires. No post-expiry retention window or ordinary grace period is allowed. Any legally binding preservation order must be isolated as a documented legal hold, not treated as routine retention.
2. **Public chats and rented private rooms:** run a scheduled purge every 7 days that deletes all messages in those spaces. Their media is governed by the universal 4-hour chat-media destruction rule below; do not wait for the weekly message purge to delete media.
3. **Direct one-to-one conversations:** excluded from the weekly public/room message purge. Run a separate scheduled purge every 30 days that deletes all direct-message messages. Their media is governed by the universal 4-hour chat-media destruction rule, not the 30-day message schedule.
4. **Universal chat-media self-destruction (all chat types):** every image, animated image, video, audio/voice recording, document, file and other attachment sent in direct one-to-one conversations, public chats or rented private rooms must be destroyed no later than 4 hours after sending/upload. This is independent of message retention and applies equally to all chat types. No chat media may be retained as a cloud archive or kept beyond that 4-hour lifecycle. Delete the original object and every platform-controlled derivative/copy (thumbnail, preview, transcoded/sanitized version, temporary processing object and cached copy), revoke access capabilities, and remove or tombstone database references. Run frequent scheduled deletion plus event-driven cleanup, with retries and exact-generation checks; a 7-day or 30-day message purge must never extend media lifetime. Do not claim control over copies a recipient independently downloaded, screen-recorded or captured outside the platform.
5. **Profile gallery media:** every 7 days, purge member-uploaded gallery media so uploaded photos and other media do not remain in the profile gallery. A valid deletion request must be processed sooner where technically possible; do not retain gallery originals as a long-term archive.
6. **Avatar and cover:** retain only the currently selected avatar/cover asset. A superseded asset must be deleted within 30 days. A selected avatar/cover is valid for at most 30 days from its selection/upload; at expiry the member must replace it, otherwise the platform must switch the profile to the built-in Mawda default avatar/cover and delete the expired custom object. Confirm product behavior for separate avatar and cover defaults during implementation.
7. **Operational media logs:** retain for 3 months (90 days), then expire them through a controlled scheduled process.
8. **Owner-review and sensitive security audit evidence:** retain for 24 months. Preserve integrity verification, exportability and legal-hold support; never silently shorten this period.
9. **Unfinished upload intents:** clean only after the signed upload capability expires plus the configured grace period, with a missing-object recheck and exact-generation safety.
10. **Legal holds and exceptions:** a documented, authorized legal hold may suspend deletion only for the specifically scoped objects/records and duration required. Record who authorized it, legal basis/reference, scope, start/review/end dates and every access. On release, deletion resumes immediately according to the underlying policy.
11. **Deletion controls:** all scheduled purges must use dry-run previews, exact object generations, idempotent batches, retry/dead-letter handling, audit evidence and recovery checks. Never sweep an entire bucket prefix. Backups/caches must have an aligned, documented expiry and must not silently reintroduce deleted content.
12. **Direct-message retention:** the owner-approved schedule is to delete all direct one-to-one messages and associated media every 30 days, separately from the 7-day public/rented-room purge.

A successful malware verdict does not by itself authorize member delivery. Only types with a completed safe-processing pipeline may become eligible for delivery. Images use sanitized WebP derivatives; video, audio and PDF remain unavailable until type-specific processing is implemented.

## Merge and deployment boundary

PR #2 and PR #3 are separate draft proposals. PR #3's head is based on an older snapshot of the development branch and the refs currently diverge; do not merge either PR until the phase-2 changes are reconciled onto one current branch and the exact final commit has a green full CI run. No production Firebase mutation, production deployment, public Storage access or merge to `main` is authorized by this engineering record.
