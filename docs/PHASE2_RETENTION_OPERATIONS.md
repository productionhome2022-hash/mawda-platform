# Mawda chat retention — implementation and infrastructure gate

Status: code added to the development branch; **not deployed and not enabled**.

## Enforced application rules

- Chat media assets with purpose `chat` or `room` receive a four-hour retention deadline when the server validates/finalizes the uploaded object (not when an unused upload intent is created). The minute-level server sweep removes every live and noncurrent GCS generation for the exact original object path and deterministic sanitized WebP derivative path. It removes the scan-job record and converts the media asset to a content-free tombstone.
- Tombstones are deliberately retained as non-content metadata. A separate five-minute reconciliation clock checks the deterministic derivative path for a late scanner derivative without allowing tombstones to occupy the active-expiry query or starve newer expired assets.
- Chat text documents under `directChats/{chatId}/messages/{messageId}` and `rooms/{roomId}/messages/{messageId}` are deleted once their server `createdAt` is at least seven days old. Direct-message notification documents are removed with the message. The direct-chat `lastMessagePreview` text copy is cleared when its timestamp is expired or missing.
- Operational media access audit events are stamped with a 90-day expiry and removed by a scheduled cleanup job.
- Jobs are disabled by default through `MAWDA_RETENTION_JOBS_ENABLED=false`. Enabling is additionally refused unless the active Google Cloud project ID is explicitly named as test/staging/dev/demo/nonprod/sandbox and is not the production project `mawda-app-2026`.
- Each invocation is bounded to 10 batches of 150 records per collection/purpose. Failed object deletion leaves the tombstone for retry; failed text batches remain for retry. No bucket-wide prefix sweep is performed.

## Required non-production configuration before enabling

1. Use a dedicated non-production Firebase project and a dedicated GCS bucket. Never use production credentials or data for the first run.
2. GCS must permit permanent deletion: disable soft-delete retention, bucket retention policies/retention locks and object holds for these test objects. If object versioning is enabled, verify that all noncurrent generations can be listed and deleted. A locked retention policy or soft-delete window can prevent physical erasure even after an API delete and is a release blocker.
3. Do not configure bucket replication, scheduled object exports, backup copies or CDN caches for chat-media payloads. If any platform-controlled cache exists, it must have an enforced purge/invalidation path and a maximum lifetime within the four-hour limit.
4. Disable Firestore point-in-time recovery and scheduled backups/exports that could preserve chat-message documents beyond seven days. If a backup feature is required, its retention and deletion semantics must be demonstrated to meet the same seven-day limit; otherwise chat text retention cannot be certified.
5. Verify IAM for the Functions runtime: least-privilege Firestore read/delete/update and GCS object list/get/delete permissions scoped to the dedicated bucket. Do not grant public access.
6. Run emulator tests and the real-bucket deletion/versioning test on unique test objects. Preserve only non-content test evidence and clean up test objects.
7. Only after a dry run, object-generation verification, scanner-race test, backup/soft-delete inspection and retry test pass may the owner set `MAWDA_RETENTION_JOBS_ENABLED=true` in the non-production project.

## Important limitations and remaining work

- A once-per-minute scheduler is a reconciliation mechanism, not a hard real-time SLA. Production-grade guarantees require monitoring, alerting, retry/dead-letter handling and proof that scheduler outages/backlogs cannot push deletion past the contractual deadline. The current workers are not enabled.
- The code deletes GCS object generations but cannot override a bucket soft-delete policy, retention lock, legal hold, replication or an independent backup. Infrastructure settings must be verified, not assumed.
- The text worker removes the Firestore message documents, associated direct-message notifications and known direct-chat text preview. A repository-wide search for any additional text-bearing caches, exports, search indexes or analytics payloads remains a release gate.
- The 24-month owner-review hash-chain retention requires checkpoint/anchor design before old chain entries can be pruned without destroying verifiability. It is not implemented by this change.
- Story expiry, weekly profile-gallery cleanup, 30-day avatar/cover fallback and non-production live ClamAV/GCS end-to-end deployment remain outstanding.
- No production project, live member data, production Storage bucket, production Firestore backups, or production deployment was modified.

## Validation added

- `functions/test/retention.test.js` verifies the exact four-hour and seven-day boundaries and limits text deletion to the two chat message paths.
- Full CI run [43383055516](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43383055516) passed on code/index head `4f9d317291c3ecdab049256b32c8450f776aaaf5`: TypeScript build/unit tests, direct/room seven-day Firestore-emulator deletion integration test, media callable integration, Firestore/Storage rules, ClamAV EICAR container test, Flutter analysis/tests and Web release build.
- Full TypeScript build, backend test suite, Firestore/Storage emulator tests and real non-production GCS generation/soft-delete tests must pass on the exact candidate commit before closure.
