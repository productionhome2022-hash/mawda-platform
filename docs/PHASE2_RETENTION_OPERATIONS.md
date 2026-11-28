# Mawda chat retention — implementation and infrastructure gate

Status: mode-aware code and emulator coverage exist on the development branch; **no production worker is deployed or enabled**. This document is subordinate to the binding constitution, especially sections 19.1–19.3.

## Approved product policy (do not flatten into one universal text lifetime)

- **Temporary direct chat:** delete the entire conversation (text and media) after four hours of server-recorded inactivity. New trusted server activity resets the inactivity deadline. App closure or network disconnection alone is not inactivity evidence. Both participants must be told the mode and rule.
- **Normal chat:** media expires four hours after each media item is sent; text expires seven days after each text message is sent.
- **Important chat:** media expires four hours after each media item is sent; text expires thirty days after each text message is sent.
- The owner-approved 2026-11-28 clarification closes the bilateral-consent question: no second-participant approval, veto or consent workflow is required to apply the retention policy. This does not assign a new mode-selector actor. Both participants must receive notice of the applicable mode and rule. See `docs/governance/MAWDDA_16H_PHASE_TRANSITION_GOVERNING_RECORD_2026-11-28.md`, §3.
- Media expiry is independent of text expiry. The four-hour media deadline applies to all chat/room media, with originals and platform-controlled derivatives/references handled under the approved exact-object deletion process.

## Current development implementation and limitations

- Chat media assets with purpose `chat` or `room` receive a four-hour retention deadline after server validation/finalization of the uploaded object (not when an unused upload intent is created). The sweep targets exact original object paths/generations and deterministic sanitized WebP derivative paths, then leaves a content-free tombstone.
- Tombstones remain as non-content metadata. A separate five-minute reconciliation clock checks deterministic derivative paths for late scanner output without allowing tombstones to occupy the active-expiry query.
- The chat text worker reads the persisted direct-chat `retentionMode`: legacy/missing mode resolves to normal (7 days), important mode uses 30 days, and temporary mode is excluded from the per-message 7/30-day worker. Room text follows the normal seven-day path.
- **Temporary full-conversation inactivity deletion is not complete/activated.** Remaining technical gates are trusted immutable mode assignment, server-recorded activity updates, participant notices, and complete deletion of text/media/derivatives. Bilateral participant consent is not a gate and must not be reintroduced. The text worker deliberately does not individually purge temporary-chat messages.
- Operational media access audit events are stamped with a 90-day expiry and removed by a scheduled cleanup job.
- Jobs are disabled by default through `MAWDA_RETENTION_JOBS_ENABLED=false`. Enabling is additionally refused unless the active Google Cloud project ID is explicitly named as test/staging/dev/demo/nonprod/sandbox and is not the production project `mawda-app-2026`.
- The chat/room worker now uses cursor-based pagination for due assets and tombstone reconciliation, with no fixed page-count ceiling. Failed assets remain eligible for a later hourly retry, while the cursor allows the current invocation to continue to later records. This source change still requires exact-head CI execution and emulator proof. No bucket-wide prefix sweep is permitted.
- `enforceChatMediaRetention` is scheduled hourly UTC and explicitly calls only purposes `chat` and `room`. `enforceIndependentMediaRetention` preserves the existing five-minute schedule for `profile_album`, `story`, and `avatar_cover`; stickers retain their separate hourly worker. The late-object trigger applies each purpose's own expiry fallback and does not substitute the four-hour chat deadline for independent purposes.

## Required non-production configuration before enabling

1. Use a dedicated non-production Firebase project and dedicated GCS bucket. Never use production credentials or data for the first run.
2. GCS must permit permanent deletion: inspect soft-delete retention, bucket retention policies/locks and object holds for the disposable test objects. If object versioning is enabled, verify that all noncurrent generations can be listed and deleted. A locked retention policy or soft-delete window can prevent physical erasure even after an API delete.
3. Do not configure bucket replication, scheduled object exports, backup copies or CDN caches for chat-media payloads unless an enforced purge/invalidation path proves the universal four-hour limit.
4. Verify Firestore backup/PITR/export behavior against each approved mode. Normal text must meet seven days, important text thirty days, and temporary conversation content the four-hour server-inactivity rule after its separate workflow is approved and implemented. Do not certify one seven-day backup rule as satisfying all three modes.
5. Verify IAM for the Functions runtime: least-privilege Firestore read/delete/update and GCS object list/get/delete permissions scoped to the dedicated bucket. Do not grant public access.
6. Run emulator tests and the real-bucket deletion/versioning test on unique test objects. Preserve only non-content test evidence and clean up test objects.
7. Keep production and non-production destructive workers disabled until the relevant dry-run, object-generation verification, scanner-race test, backup/soft-delete inspection, legal-hold test, retry test, and required owner policy approval have passed.

## Important limitations and remaining work

- The hourly scheduler is a periodic cleanup mechanism, not a hard real-time SLA. Immediate access denial at expiry must be enforced by the server delivery/authorization paths. Production-grade guarantees also require monitoring, alerting, retry/dead-letter handling and proof that scheduler outages/backlogs cannot leave data accessible beyond the approved deadline. The current workers remain disabled by default and are not deployed in production.
- The code deletes GCS object generations but cannot override bucket soft-delete, retention lock, legal hold, replication or an independent backup. Infrastructure settings must be verified, not assumed.
- The text worker removes supported Firestore message documents, associated direct-message notifications and known direct-chat text previews. Repository-wide review of any additional text-bearing caches, exports, search indexes or analytics payloads remains a release gate.
- The 24-month owner-review hash-chain retention requires checkpoint/anchor design before old chain entries can be pruned without destroying verifiability.
- Story expiry, weekly profile-gallery cleanup, 30-day avatar/cover fallback and non-production live ClamAV/GCS end-to-end deployment remain separate acceptance items.
- No production project, live member data, production Storage bucket, production Firestore backup, or production deployment was modified.

## Validation evidence

- Current development-head CI run [43759278023](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43759278023) passed on SHA `46f1021c98701a42fb85a02757f35166edf7c866`; its backend job includes mode-aware chat-retention integration and Firestore/Storage emulator rules. The documentation-only successor SHA is being revalidated separately.
- Domain regression run [43759278052](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43759278052) passed on the same application HEAD and includes retention/room reservation emulator regression.
- These are emulator/CI results, not proof of real GCS generation/soft-delete behavior, backup/PITR semantics, deployed schedulers or production deletion.
- Exact candidate CI, non-production live GCS tests, legal-hold/recovery tests and explicit owner policy approval remain required before any closure or activation.


---

## Owner-approved scope clarification — 2026-11-28

The owner-approved scope for the hourly chat/room media cleanup worker is now explicitly limited to user-to-user media and attachments exchanged inside conversations and rooms. The authoritative scope, exclusions, safeguards, and acceptance criteria are recorded in:

- `docs/policies/CHAT_ROOM_USER_SHARED_MEDIA_RETENTION_POLICY_2026-11-28.md`

This clarification includes images, video, GIF/animated images, audio files and voice recordings, PDF, Word documents, and other user-shared conversation/room attachments when server-classified for those purposes. The four-hour deadline is measured from server-validated send/finalization. Access must be denied at expiry; the cleanup worker runs hourly UTC, exhausts all due pages/batches, deletes exact originals/derivatives/generations under platform control, and retries failures while keeping the item inaccessible.

**Strict exclusions:** stickers, profile albums, avatars, covers, stories, account/profile assets, message text, wallets, transactions, audit records, operational/system data, and every other separately governed or unknown purpose remain outside this worker. Their independent policies and retention schedules are unchanged. File extension or shared bucket location is never sufficient to include an object.

**Implementation status warning:** the source branch now contains an hourly chat/room scheduler, explicit purpose isolation, cursor-based media/tombstone pagination, and a dedicated integration test for independent-purpose exclusion. These changes are not yet verified by an executed build or emulator/CI run. Real-bucket versioning/soft-delete, backup/PITR, replication/CDN behavior, monitoring/alerting, timeout/backlog recovery and physical cloud erasure remain unverified. Do not claim final closure or complete cloud erasure from source edits alone.

No production deployment, Firebase/Storage configuration change, destructive production run, or 5,000-persona simulation is authorized by this clarification. Production actions require separate explicit owner approval. The same policy document must be kept byte-for-byte consistent in the primary repository and the 5,000-persona lab repository; the latter copy is documentation only.

 
## Owner decision propagation — RET-006 (2026-11-28)

No bilateral participant consent, second-participant approval or veto is required to apply the retention policy. Both participants must be notified of the applicable mode and rule. The decision does not assign a new mode-selector actor. Historical RET-004 consent wording is superseded; it must not appear as an open consent blocker. The remaining temporary-chat work is technical: trusted immutable mode assignment, server-recorded activity, notices, complete full-conversation deletion and retry-safe media/derivative cleanup. See the binding governing record §3 and the chat/room media policy.


## Current development implementation delta — pending CI acceptance

- Main-branch source change: chat/room media cleanup is explicitly scheduled every hour UTC and calls only `chat` and `room`.
- Independent gallery/story/avatar/cover cleanup is on a separate five-minute schedule and retains its own purpose-specific deadlines. Sticker cleanup remains on its independent one-hour schedule.
- The media asset and tombstone sweeps now use cursors to continue beyond the former fixed 10-page ceiling; individual failures do not stop traversal of later candidates and remain eligible for the next retry cycle.
- The late-object finalization guard now applies four-hour fallback only to `chat`/`room`, seven-day fallback only to `profile_album`, one-hour fallback to stickers, and the explicit story expiry to stories. It does not infer a four-hour deadline for avatar/cover assets.
- Integration tests were redirected to the independent-purpose sweep where they test profile/story lifecycle; chat-room tests use the chat-only sweep. A new regression asserts that chat/room processing leaves profile albums, stories, avatars/covers and stickers untouched.
- The stale bilateral-consent condition was removed from the chat-text worker comment. RET-006 is a closed owner-policy question; temporary-chat full-conversation deletion remains a separate technical gap.
- **Validation:** no exact-head build, emulator test or GitHub Actions result has yet been recorded for these commits. Treat all code changes above as implemented but not yet test-verified.
