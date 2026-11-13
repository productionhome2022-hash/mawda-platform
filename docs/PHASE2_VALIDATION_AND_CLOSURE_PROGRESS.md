# Phase 2 media security — validation and closure progress

Snapshot: 2026-11-13  
Status: **NOT CLOSED — non-production end-to-end and governance gates remain**

## Verified green CI

The current development line passed the complete validation workflow on code commit `45b707eee0f765af9ccf260753622fada47a753f`:

- Workflow run: [43379943559](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379943559)
- Flutter job: `flutter analyze`, `flutter test`, and `flutter build web --release` all succeeded; validated web artifact uploaded.
- Functions job: TypeScript build/compilation and unit tests succeeded; media callable authorization/audit integration tests succeeded; Firestore and Storage rules emulator tests succeeded.
- Scanner job: scanner source/security tests succeeded; isolated ClamAV image built; EICAR test signature was detected successfully.

The preceding run [43379722894](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379722894) failed on a test that sent a V4 signed HTTP PUT directly to the Storage Emulator. The emulator returned HTTP 501 because it does not implement that signed HTTP endpoint. The integration test was corrected to use the supported Admin Storage API for emulator object creation with a create-only generation precondition, then exercise callable finalization. The test no longer represents emulator traffic as real signed HTTP verification.

## Implemented and verified foundations

- Authenticated, short-lived, object-scoped upload intents with exact content type/size binding and create-only generation precondition.
- Server finalization validates uploader ownership, object metadata, byte count, generation, allowlisted MIME and file signature.
- Server-side member/anonymous-guest classification; client-supplied uploader labels are not trusted.
- Sole-owner + recent-MFA checks for owner media listing/inspection, bounded pagination, audit of successful and denied privileged operations.
- Safe image preview is limited to a server-verified WebP derivative; UI does not render original quarantine bytes.
- Scanner callback checks HMAC, provider, freshness, source generation and full-object hash; fail-closed states remain quarantined.
- Cleanup is limited to expired unfinished upload intents, grace period, exact object generation and transactional quota handling.
- Media client access remains deny-all in Firestore/Storage rules.
- Owner console has paginated media listing/filtering, safe-preview action and owner-review audit-chain verification control.

## Owner-approved retention policy — core chat implementation added; infrastructure and remaining media types pending

The owner approved the following rules on 2026-11-13. These are binding product requirements for implementation; they are not yet proof that scheduled deletion jobs exist or have been exercised.

- Stories: delete media immediately when the story expires; no ordinary post-expiry retention.
- All chat text messages (direct one-to-one, public chats and rented private rooms): permanently delete each text message no later than 7 days after sending. Delete message bodies and platform-controlled text archives, backups, search/index copies, content caches and recoverable copies; after expiry, no original message text may remain recoverable in platform-controlled systems. Retain only minimal non-content audit metadata where required.
- Chat media is a separate universal rule: all attachments in all three chat types are destroyed within 4 hours, never waiting for the 7-day text purge.
- All chat media: self-destruct every image, animated image, video, audio/voice recording, document, file and attachment in direct, public and rented-private chats no later than 4 hours after send/upload. This is a separate, universal rule; no chat media is kept as a cloud archive or until the message purge. No platform-controlled backup, versioned generation, soft-delete/recovery copy, snapshot, replica, archive-tier object, CDN/cache payload or disaster-recovery copy may retain the media beyond the four-hour deadline; storage configuration must prevent recoverability of the payload after expiry. Delete originals and all platform-controlled derivatives, previews, thumbnails, transcodes, temporary objects and caches; revoke access and remove references, with exact-generation-safe retries. Copies independently downloaded or captured outside Mawda cannot be remotely erased.
- Profile gallery: run a 7-day purge of member-uploaded gallery media so it does not remain in the gallery; process valid deletion requests sooner where feasible.
- Avatar/cover: only the currently selected asset is retained; delete superseded assets within 30 days. Each custom selected avatar/cover expires 30 days after selection/upload; if the member does not replace it, switch to the built-in Mawda default and delete the expired custom object.
- Operational media logs: 3 months / 90 days.
- Owner-review and sensitive security audit evidence: 24 months.
- Legal holds: only documented, authorized and narrowly scoped holds may suspend deletion; record authority, basis/reference, scope, dates, reviews and access. Resume deletion immediately on release.
- Deletion jobs must be idempotent, exact-generation-safe, auditable, retryable, dry-run capable and backup/cache aware. No bucket-wide prefix sweeps.

The implementation must distinguish media objects, metadata, operational logs, and tamper-evident security/owner audit records. The four-hour chat-media and seven-day all-chat text workers have now been added behind a disabled-by-default, non-production-only gate and have passed emulator integration tests. Do not enable even in non-production until dry-run evidence, real-bucket deletion, legal-hold handling and backup expiry are verified. Legal review may identify mandatory preservation exceptions; this must not become routine extra retention.

## Outstanding release gates

1. **Real Cloud Storage HTTP:** run `functions/scripts/test-signed-urls-http.cjs` against a dedicated disposable non-production bucket. Verify initial signed PUT, create-only replay rejection, exact size rejection, signed GET and expired upload/read URLs. The emulator is not proof of these HTTP semantics.
2. **Actual Firebase + Cloud Run scanner lifecycle:** deploy the scanner only to a dedicated non-production project with Cloud Run IAM authentication, Secret Manager, least-privilege service accounts and bucket permissions. Exercise clean and EICAR files plus malformed/oversized files, timeout, unavailable/stale signatures, stale generation, bad HMAC, duplicate callback, retry/restart, derivative generation and Firebase verdict handling. CI image build/EICAR proves container behavior, not a deployed end-to-end scan.
3. **Audit export and retention:** implement and test owner/MFA-protected, bounded/paginated export for media audit and owner-review chain evidence; include integrity verification, export audit event, secure handling, backup/restore and tamper-evidence. Implement the approved 90-day operational log retention and 24-month sensitive audit retention with legal-hold support.
4. **Scheduled deletion workflows:** implement story expiry immediate deletion, 7-day text-message purge across direct, public and rented-private chats (media self-destructs within 4 hours), weekly profile-gallery purge, and 30-day avatar/cover replacement/default fallback. Implement the same 7-day text-message purge for direct messages; DMs are no longer on a separate 30-day message schedule.
5. **PR reconciliation:** PR #3 is divergent from the current development line. Do not merge it wholesale. Cherry-pick/reimplement only reviewed unique changes, then run all checks on one exact candidate commit.
6. **Final closure:** update this record with real infrastructure evidence, scheduled-deletion dry-run and integration test evidence, audit export verification, legal-hold/backup tests, and green CI on the exact final candidate. Only then mark Phase 2 closed.

## Retention safety defaults currently enforced

- Unfinished upload intents may be cleaned only after signed capability expiry plus grace period and the missing-object recheck.
- Destructive schedules for finalized media are not yet enabled; implementation must follow the owner-approved purpose schedule above.
- No automatic deletion or TTL should be activated until its dry-run, exact-generation, legal-hold, audit and recovery tests pass.
- No production bucket, production rules, production Firebase data, merge to `main`, or production deployment was changed by this work.

## Owner decision / infrastructure tracking

See [issue #4](https://github.com/productionhome2022-hash/mawda-platform/issues/4) for the non-production provisioning checklist, real-GCS execution gate, audit export requirements and proposed purpose-based retention schedule awaiting owner/legal review.

## Current PR boundary

- PR #2 remains a draft against `main`; its latest code-validation head above is green, but the non-production and governance gates are not complete.
- PR #3 remains a draft targeting the development branch and is divergent; it must not be merged wholesale.


## Latest verification and follow-up audit — 13 November 2026

- Rechecked the development-branch validation head `4ecf44d9aab2789a70955189e9cdf6933493d5c6`: workflow run [43383596399](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43383596399) completed successfully. Its three jobs all report success: Cloud Functions compile/unit tests; isolated ClamAV gateway tests and image build; Flutter analysis/tests/Web release build.
- This CI result is source/build/emulator evidence only. It does not prove that Cloud Run or Firebase was deployed, that real GCS HTTP and generation deletion tests ran, or that retention workers were enabled.
- Follow-up source audit found a concrete remaining gap: `avatar_cover` uploads receive a 30-day `retentionExpiresAt` during finalization, but the scheduled retention sweep currently iterates only `chat`, `room`, `profile_album`, and `story`. The avatar/cover lifecycle therefore is not yet enforced. The profile model stores URL fields but the current media intake path does not bind a selected avatar/cover slot or media ID to the profile, so deletion cannot safely switch a still-selected image to the built-in default. Implement the selection binding, superseded-asset marking, atomic default fallback and deletion tests before enabling this policy.
- The retention unit-test description was also corrected to say the four-hour clock begins at validated upload finalization, matching the implementation and approved policy.

## Chat retention code and exact CI evidence — 13 November 2026

- Added `functions/src/retention.ts` with separate server-side jobs for four-hour chat-media self-destruction, seven-day text-message deletion across direct/public/rented-private chats, and 90-day operational media audit cleanup.
- The four-hour clock starts after the server validates/finalizes the uploaded object. Expiry removes every listed GCS generation for the exact original object and deterministic safe WebP derivative; a content-free tombstone is retained and its derivative path is reconciled every five minutes to catch late scanner output.
- The seven-day job deletes direct-chat and room message documents, direct-message notification documents, and expired direct-chat `lastMessagePreview` copies. It does not delete unrelated `users/*/messages/*` documents.
- Retention jobs are disabled by default (`MAWDA_RETENTION_JOBS_ENABLED=false`) and have a second non-production project-name guard. No production project or live data was changed.
- Added exact-boundary unit tests and a Firestore-emulator integration test. Added an opt-in real-GCS retention script that checks soft-delete/retention policy, bucket access protections, and deletion of every visible object generation.
- Full validation run [43383055516](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43383055516) passed on code/index commit `4f9d317291c3ecdab049256b32c8450f776aaaf5`: Functions build/unit tests; media callable authorization/audit integration; seven-day retention integration; Firestore/Storage rules; Flutter analyze/tests/Web release; ClamAV image build and EICAR detection.
- This is not phase closure. Still required: real non-production GCS retention and signed-URL HTTP runs, actual Firebase/Cloud Run scanner lifecycle, backup/PITR and soft-delete configuration proof, legal-hold behavior, 24-month audit export/checkpoint design, story/gallery/avatar/cover retention jobs, and final review on one candidate commit.
