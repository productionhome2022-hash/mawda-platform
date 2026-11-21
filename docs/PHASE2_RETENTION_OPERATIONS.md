# Mawda chat retention — implementation and infrastructure gate

Status: mode-aware code and emulator coverage exist on the development branch; **no production worker is deployed or enabled**. This document is subordinate to the binding constitution, especially sections 19.1–19.3.

## Approved product policy (do not flatten into one universal text lifetime)

- **Temporary direct chat:** delete the entire conversation (text and media) after four hours of server-recorded inactivity. New trusted server activity resets the inactivity deadline. App closure or network disconnection alone is not inactivity evidence. Both participants must be told the mode and rule.
- **Normal chat:** media expires four hours after each media item is sent; text expires seven days after each text message is sent.
- **Important chat:** media expires four hours after each media item is sent; text expires thirty days after each text message is sent.
- The three retention durations are approved. **Who selects a direct-chat mode and whether both participants must consent remain unresolved** under constitution section 19.3. Do not infer consent from silence, presence, connectivity or client-only state. Do not activate destructive production deletion that depends on this unresolved policy.
- Media expiry is independent of text expiry. The four-hour media deadline applies to all chat/room media, with originals and platform-controlled derivatives/references handled under the approved exact-object deletion process.

## Current development implementation and limitations

- Chat media assets with purpose `chat` or `room` receive a four-hour retention deadline after server validation/finalization of the uploaded object (not when an unused upload intent is created). The sweep targets exact original object paths/generations and deterministic sanitized WebP derivative paths, then leaves a content-free tombstone.
- Tombstones remain as non-content metadata. A separate five-minute reconciliation clock checks deterministic derivative paths for late scanner output without allowing tombstones to occupy the active-expiry query.
- The chat text worker reads the persisted direct-chat `retentionMode`: legacy/missing mode resolves to normal (7 days), important mode uses 30 days, and temporary mode is excluded from the per-message 7/30-day worker. Room text follows the normal seven-day path.
- **Temporary full-conversation inactivity deletion is not complete/activated.** It requires a trusted immutable mode assignment, approved selection/consent semantics, server-recorded activity updates, participant notices, and complete deletion of text/media/derivatives. The text worker deliberately does not individually purge temporary-chat messages.
- Operational media access audit events are stamped with a 90-day expiry and removed by a scheduled cleanup job.
- Jobs are disabled by default through `MAWDA_RETENTION_JOBS_ENABLED=false`. Enabling is additionally refused unless the active Google Cloud project ID is explicitly named as test/staging/dev/demo/nonprod/sandbox and is not the production project `mawda-app-2026`.
- Each invocation is bounded to 10 batches of 150 records per collection/purpose. Failed object deletion leaves the tombstone for retry; failed text batches remain for retry. No bucket-wide prefix sweep is performed.

## Required non-production configuration before enabling

1. Use a dedicated non-production Firebase project and dedicated GCS bucket. Never use production credentials or data for the first run.
2. GCS must permit permanent deletion: inspect soft-delete retention, bucket retention policies/locks and object holds for the disposable test objects. If object versioning is enabled, verify that all noncurrent generations can be listed and deleted. A locked retention policy or soft-delete window can prevent physical erasure even after an API delete.
3. Do not configure bucket replication, scheduled object exports, backup copies or CDN caches for chat-media payloads unless an enforced purge/invalidation path proves the universal four-hour limit.
4. Verify Firestore backup/PITR/export behavior against each approved mode. Normal text must meet seven days, important text thirty days, and temporary conversation content the four-hour server-inactivity rule after its separate workflow is approved and implemented. Do not certify one seven-day backup rule as satisfying all three modes.
5. Verify IAM for the Functions runtime: least-privilege Firestore read/delete/update and GCS object list/get/delete permissions scoped to the dedicated bucket. Do not grant public access.
6. Run emulator tests and the real-bucket deletion/versioning test on unique test objects. Preserve only non-content test evidence and clean up test objects.
7. Keep production and non-production destructive workers disabled until the relevant dry-run, object-generation verification, scanner-race test, backup/soft-delete inspection, legal-hold test, retry test, and required owner policy approval have passed.

## Important limitations and remaining work

- A once-per-minute scheduler is a reconciliation mechanism, not a hard real-time SLA. Production-grade guarantees require monitoring, alerting, retry/dead-letter handling and proof that scheduler outages/backlogs cannot push deletion past the approved deadline. The current workers are not enabled.
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
