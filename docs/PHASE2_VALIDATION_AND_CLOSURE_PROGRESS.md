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


## Member profile media and story UI implementation — 13 November 2026
- Added a member-authenticated callable that returns a 60-second signed read URL only for the selected avatar/cover's exact, scanner-approved WebP derivative. It checks profile visibility, owner, slot, media status, expiry, derivative generation and scanner metadata, and records an access audit event. No original quarantine URL is returned.
- Added an uploader-scoped media-status callable. The Flutter upload client waits for a verified clean scan and safe WebP derivative before allowing profile selection; rejected, expired or timed-out assets are not displayed.
- Added a cross-platform Flutter image upload client using image_picker and signed V4 Storage PUT with the exact required headers, followed by server finalization. Added avatar/cover selection controls and explicit reset-to-default actions.
- Added resetMemberProfileMedia: transactionally clears the selected media ID, sets the built-in Mawda default flag, bounds the superseded asset's expiry, preserves active legal holds, and writes an operational audit record.
- Added story publish/feed callables. A story can be published only from the authenticated member's own story asset after security_approved, and its document expiry is copied from the server-validated upload intent. The feed excludes expired stories and private-profile stories for other viewers.
- Added short-lived story safe-preview URLs that validate the story lifetime, profile visibility, approved status, exact preview generation and scanner metadata. Added a member-facing Stories screen with user-selected expiration date/time; no fixed story duration was assumed.
- The retention sweep now removes expired story documents from the feed while media object erasure continues through the exact-generation, retryable asset cleanup path. Added the stories(status, expiresAt) index.
- Added emulator integration coverage for profile reset, safe-profile URL default/private authorization, story publication only after scanner approval, story feed expiry, and expired story document cleanup.
- These changes are on the draft development PR. The validation run for the current candidate is pending; do not treat the code as CI-verified until all jobs finish green.

## Media send/receive path audit — current limitation

- Direct-chat and room Flutter screens currently send text only. The corresponding sendDirectMessage and sendRoomMessage callables validate and write type=text messages; no member-facing image/video/audio/document attachment send path is implemented in these screens.
- Read projections contain optional media ID fields for compatibility, but they do not constitute an attachment delivery path. Firestore/Storage member rules remain restrictive, and the new profile/story flows expose only signed safe WebP derivatives after trusted scan approval.
- This means I found no active chat UI route that bypasses scanning; however, the full chat attachment feature for image/GIF/video/audio/PDF is still missing. The scanner currently produces a safe raster derivative only for supported images; non-image clean verdicts remain in a pending-processing state and must not be exposed until a safe processing/delivery design is implemented and tested.

## Backup, audit and legal-hold governance — still blocking destructive activation

- Media legal holds are asset-scoped and integrated with retention workers. Profile expiry still applies the built-in default while a held object is preserved; deletion resumes after hold release/expiry.
- The current legal-hold model does not yet prove preservation/release behavior for audit exports, immutable checkpoints, Firestore exports/PITR, object soft-delete, replicas or disaster-recovery copies.
- Owner-review audit export and hash-chain verification callables exist, but there is no demonstrated immutable 24-month archive/checkpoint/restore exercise in the non-production environment. Operational media logs have a 90-day cleanup path; this must remain distinct from the 24-month sensitive owner/security evidence.
- Real GCS generation/soft-delete verification and live Cloud Run scanner execution remain blocked on dedicated non-production GCP resources, WIF and Secret Manager configuration. The manual deployment workflows are staged on this development branch; they cannot be dispatched until the owner explicitly authorizes the required default-branch workflow availability and provisions the non-production identities/secrets.
- No retention schedule was enabled, no GCS/Cloud Run deployment was performed, and no production resources or data were changed.


## Reconciliation against development head 6c3cb518 — 13 November 2026

The earlier avatar/cover gap recorded above has since been addressed in the current development source and is covered by the green validation run [43434464095](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43434464095):

- The retention sweep now includes the `avatar_cover` purpose, applies the built-in Mawda default when the selected custom avatar/cover expires, and deletes the exact original and safe-preview object generations.
- Selection/reset flows bind the chosen media ID and slot to the member profile, bound superseded assets, preserve an active asset-scoped legal hold, and resume deletion after release.
- The avatar/cover lifecycle emulator integration job passed, including expiry-to-default and legal-hold/release behavior.

This closes the previously noted code/test gap for the avatar/cover lifecycle in emulator scope; it does **not** prove real-bucket generation deletion, backup/soft-delete expiry, or live scheduled execution. The retention jobs remain disabled by default and guarded to explicit non-production projects.

The same current workflow also passed the seven-day chat text retention, four-hour media retention, media authorization/audit, message deletion, legal-hold, Firestore/Storage rules, Flutter analysis/tests/Web build, and ClamAV image/EICAR checks. The member-facing chat attachment send/receive path for images, GIFs, video, audio and documents remains unimplemented; current chat UI sends text only. Phase 2 therefore remains open pending secure attachment delivery, real non-production GCS/Cloud Run validation, backup and legal-hold governance evidence, and final candidate review.


## Follow-up implementation — secure chat image attachment slice

- Added a dedicated backend callable to link a previously approved raster-safe image to a direct chat or room message.
- Added a recipient callable that issues a two-minute, generation-pinned Storage URL only after verifying conversation membership, message-to-media linkage, approval state, expiry and processing metadata; successful issuance is audited.
- Added emulator integration coverage for direct-message linking/delivery, room linking/delivery, outsider denial, duplicate attachment attempts and forged owner-role/document attempts.
- The message-linking slice currently enables only JPEG/PNG/WebP raster derivatives. GIF, audio, video and documents remain fail-closed pending their own real processing pipelines. No UI or production deployment is implied.
- CI validation for the latest candidate is pending; this change is not closed until backend integration, Firestore/Storage rules and Flutter Web jobs pass on the exact branch head.

## Follow-up implementation — chat image attachments and retryable erasure (13 November 2026)

- Added the direct-chat and room UI path for selecting, uploading, sending and receiving scanner-approved raster images. The UI uses the existing trusted media upload service and backend message-link/delivery callables; original quarantine objects are never displayed.
- Signed image URLs are refreshed before expiry, and the backend binds each delivery request to the exact linked conversation and message, validates the safe derivative's generation/hash/scanner metadata, and rejects messages hidden for the requesting member.
- The chat image UI fails fast for GIF until the animation-preserving sanitizer is implemented. Audio, video and documents remain intentionally unavailable for member delivery.
- Closed a retention retry gap: manual_deletion_pending media is now picked up by the gated non-production retention sweep; successful retries retain a content-free manually_deleted tombstone and schedule late-object reconciliation. Added a Storage/Firestore emulator integration test for retry and late replay.
- Latest PR head is awaiting exact-commit CI validation. Do not describe phase 2 as closed until the full workflow passes and remaining non-emulator infrastructure/governance checks are resolved.