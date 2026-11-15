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

## Typed media pipeline and chat UI implementation candidate — 13 November 2026

- Added isolated GIF, audio, video and PDF derivative processors in scanner/processors.js. GIF output is animation-preserving; audio/video are FFmpeg-transcoded; PDF is raster-flattened to an image-only PDF. Each processor enforces bounded input complexity, duration/page count and output size, writes create-only objects, and binds output metadata to the source generation/hash and exact pipeline version.
- Scanner callback schema now accepts one typed derivative contract and rejects incomplete, mismatched, stale-version, unsafe-path, non-clean or mixed preview/derivative payloads. Firebase independently reads and hashes the generated object before persisting a type-specific safe state.
- Chat media authorization and delivery now resolve type-specific derivatives. PDF remains sole-owner-originated only; member-originated documents and unsupported document formats remain denied. Direct/room message projections include media category/content type.
- Flutter direct and room chat screens now offer a file picker for supported image/GIF/audio/video/PDF formats. The client waits for a server-confirmed safe derivative before linking the message. Images/GIF render inline; audio/video/PDF open through a short-lived signed URL with an explicit external open/download action.
- Manual erasure, scheduled retention, and late-object reconciliation now enumerate the canonical derivative object names for image, GIF, audio, video and PDF, with strict per-owner/per-media path checks. Added integration coverage for erasing all derivative classes and a late GIF replay.
- Added scanner-container integration tests that generate real GIF, audio, video and PDF fixtures and exercise the installed processing binaries. The tests assert multi-frame GIF output and PDF text-layer flattening. The scanner CI job now runs these tests inside the built container, not on the host runner without the required binaries.
- Added policy and scanner callback tests for exact pipeline versions, derivative paths, generation/hash and owner-only document rules.

**Verification state:** implementation has been committed to the development branch but the new exact branch head has not yet completed CI. Do not enable or announce non-image member delivery until the scanner container integration tests, backend compile/unit/callable/retention/rules suites, Flutter analysis/tests/Web build all pass on one exact commit. Live Cloud Run/GCS signed URL, version deletion, backup/PITR/cache and legal-hold behavior remain separate non-production infrastructure gates. No live deployment or destructive retention schedule has been run.


## Typed media pipeline CI result and remaining acceptance gates — 13 November 2026

- Full CI run 43445820387 passed on commit 2754b74560d5a49996c3582187b45bc8ab63c7e0. All three jobs completed successfully.
- Scanner job: isolated container build, real GIF/audio/video/PDF processor integration tests, and ClamAV EICAR detection passed.
- Cloud Functions job: compile/unit, typed media callable integration, retention and late-object reconciliation, direct-message deletion, owner audit export, media legal hold/release, profile media lifecycle, message legal hold and Firestore/Storage rules all passed.
- Flutter job: dependency install, analyze, tests and release Web build passed.
- Additional typed-derivative legal-hold test is now present on the current branch head. It checks that an active hold protects original + image/GIF/audio/video/PDF derivatives, release resumes expiry deletion, and a late PDF replay is reconciled. This new test's exact-head CI is pending and must be checked separately.
- Current Flutter UI supports selecting existing audio files, not microphone voice-note recording. Audio/video/PDF are opened externally from short-lived signed URLs; in-app playback is still a gap. PDF is the only supported owner document format; office formats remain blocked.
- Real device, live Cloud Run/GCS, signed URL expiry/replay, bucket generation/version deletion, backup/PITR, CDN/cache and restore tests remain open. Retention schedules remain disabled. No production deployment or destructive operation has been performed.

**Phase 2 remains open pending exact-head CI for the expanded legal-hold test and the external non-production/device acceptance gates.**


## Exact-head full phase-one/phase-two validation reconciliation — 13 November 2026

The latest branch head has now been checked directly; this replaces the earlier “pending exact-head CI” status in historical entries above.

- Branch: `codex/mawda-full-platform-implementation`.
- Tested commit: `5d89d4a3fb7deb607535afab41eae5c1f510fdfe`.
- Run: [43446631493](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43446631493) — `completed / success`; all three jobs succeeded.
- Scanner: source/security checks, container build, real GIF/audio/video/PDF processor tests in the built image, and EICAR detection passed.
- Backend: compile/unit tests plus media authorization/audit, seven-day chat retention, message deletion, owner audit export, expanded media legal hold/release (including all derivative classes and late replay), profile media lifecycle, message legal hold/resumed retention, and Firestore/Storage rules emulator tests passed.
- Flutter: strict lockfile dependency install, analysis, test suite, and Web release build passed.
- Artifacts were generated for the Web build, Functions build and Flutter lockfile. Their existence is not a deployment or a live-service test.

### What is now complete in automated CI

The exact-head run verifies the current code snapshot across the scanner, backend and Flutter build layers. The expanded legal-hold test that was pending in the previous update is included and passed. The typed derivative processors and the chat UI/service path for supported images, GIF, existing audio files, video and owner-originated PDF are included in this green snapshot.

### What still prevents phase closure

- Real GCS signed HTTP URL behavior, replay/expiry, exact-generation permanent deletion and bucket version/soft-delete controls require a dedicated disposable non-production GCP bucket and configured Workload Identity Federation. The manual workflow is present but has not been run; no live GCS result is claimed.
- Live Cloud Run scanner deployment/E2E, IAM, Secret Manager, callback and operational monitoring/retry verification are not proven by the isolated Docker tests.
- Backup/PITR, exports, replicas, caches/CDN and restore/deletion evidence are not proven. This is particularly material to the approved four-hour chat-media and seven-day message-text deletion policy.
- Android/iOS physical-device acceptance has not been run. Flutter Web build success is not native-device acceptance.
- Voice-note recording and in-app audio/video/PDF players remain incomplete. Existing audio files can be selected; audio/video/PDF open externally. Only PDF is currently supported for owner-originated documents; Office formats remain denied.
- The broader Phase 1 foundation still has explicit incomplete product/legal items in PR #2: final localized privacy/legal policy and jurisdictional review; guest lifecycle; push and full abuse/block/report/appeal/age-safety flows; room rental billing and room lifecycle/voice-video/events; remaining special-store entitlements and real-money payment/refund operations; biometric capture/provider and recurring verification; immutable 24-month owner/security audit archive/checkpoint/restore; production Firebase options and owner MFA recovery; monitoring, penetration, accessibility, performance and device verification.

### Operational safety and decision

The automated CI gate was green on the exact previously validated snapshot recorded above; phase 1/2 as a whole is **not yet accepted/closed** while the above non-production and product gates remain open. The GCS manual workflow requires owner-provisioned non-production WIF configuration and a disposable bucket. No production deployment, merge, live Firebase mutation, retention-worker activation or destructive purge has been performed. Keep PR #2 draft/open and development isolated until those gates have evidence and the owner approves the next release action.

## Exact validation and room-audio hardening — 15 November 2026

### Verified exact-head CI before the latest room-audio change

- Development commit: `b0554aaaab89b796176e5e1270fa3de299263673`.
- Full validation run [43714367272](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43714367272) completed **success**. All three jobs passed:
  - Flutter analysis, tests and Web release build.
  - Isolated ClamAV scanner source/security checks, container build, GIF/audio/video/PDF processor integration tests and EICAR detection.
  - Cloud Functions compile/unit tests and all configured emulator integration/rules suites.
- Cloud Functions job log reports 216 unit tests passed / 0 failed in its main test invocation. The guest-session integration invocation then passed 2 / 0, including `ending a guest session removes memberships across multiple query pages`. The other logged integration invocations also reported zero failures.
- The preceding native-platform run [43714367271](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43714367271) was cancelled while the Android debug APK build was running; iOS was also cancelled. This is **not** an Android or iOS pass, and no native artifact is claimed.
- The guest cleanup chunk-size change on `b0554aaa` is a defensive test-cleanup bound (20 values); the green run proves the test passes on that commit, not that this specific bound was the historical root cause of the earlier failure.

### Room voice duration hardening — implementation committed, exact-head CI pending

A source review of the trusted scanner path found a concrete policy gap: the scanner request already carried the server-recorded `purpose`, but audio transcoding applied the same 600-second ceiling to room media and direct-chat media. The room microphone UI also allowed 120 seconds in one path and 120 seconds for guest room recording. The stale PR #17 proposal was not merged; its earlier patch also risked reducing direct-chat audio to 120 seconds.

The development branch now contains the following narrowly scoped corrections:

- `scanner/processors.js`: direct-chat audio remains capped at 600 seconds (10 minutes); `purpose === "room"` is capped at 60 seconds. The FFmpeg output duration uses the same purpose-specific cap after the input-duration check.
- The audio derivative contract is versioned as `ffmpeg-audio-purpose-limit-v2`; `functions/src/media-scanner.ts` and its contract tests validate that exact version.
- Scanner unit tests assert 600 seconds for direct chat, 60 seconds for rooms, and retain the general 600-second ceiling for non-room media.
- Member room microphone UI and guest room recording timers now both stop at 60 seconds.

Commits for this slice:
- `1dc66ccc5887d7896c0ea1ea5fa57a1b99d641f8` — purpose-aware scanner limit.
- `f0b0813056b5b26290b3cec4de6d647b756a8da7` — scanner duration-limit tests.
- `0c0031f9217cfdcbdaa40ef9639cb51f4998ff37` — callback derivative contract version.
- `e54af62980c17a6546c0e267e6636c8c2fa1650a` — callback contract tests.
- `e314141c9df8139d6d7000114fa8ff9cbf011648` — FFmpeg output bound and exported policy helper.
- `4f580aded4dc9cf7a8270127eb46972fafd4e4c7` — member room UI timer.
- `4ccad6c8ad9f29b7b22d3943312a9f1e583911eb` — guest room UI timer.

**Verification status:** these room-audio commits were made after the green `b0554aaa` run. No CI result is yet attached to the resulting branch head; do not describe this new slice as tested or validated until scanner, Functions, Flutter and native workflows finish on the exact final commit. No change was made to `main`, production Firebase, Cloud Run, paid infrastructure or deployment settings. Phase 2 remains open.

### Additional callback-contract correction — 15 November 2026

A second review of the purpose-aware room-audio change found that the scanner and its first callback validator had been updated to `ffmpeg-audio-purpose-limit-v2`, but the trusted Storage derivative callback in `functions/src/media.ts` still expected `ffmpeg-audio-transcode-v1`. This mismatch would reject the new safe audio derivative after the scanner completed processing.

Corrected on the development branch:
- `functions/src/media.ts` now uses a shared, pure derivative-contract resolver instead of a duplicated inline contract table.
- Added `functions/src/media-derivative-contract.ts` with the single canonical GIF/audio/video/PDF contract map. Audio now expects `ffmpeg-audio-purpose-limit-v2`.
- Added `functions/test/media-derivative-contract.test.js` to verify the audio v2 contract, unchanged GIF/video/PDF contracts, and fail-closed handling of unknown categories.

Commits:
- `24f92c35a0b19df6d99c9984222c427ed3454b9a` — align the trusted media callback with the new audio pipeline version.
- `b91ab9723425a10aaf1f090e7d699ad0e77c354b` — centralize derivative contracts.
- `6e43c79e69f59f1150078479c176b3edabe37941` — add callback contract unit tests.

**Exact-head CI status at the time of this note:** PR #2 head `6e43c79e69f59f1150078479c176b3edabe37941` started Validate Mawda run [43715453222](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43715453222) and native validation run [43715453402](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43715453402). The Validate run's Flutter and Cloud Functions jobs were cancelled before substantive tests; the scanner job was still building its image when last inspected. The native Android job was cancelled before Flutter setup and iOS was cancelled. These are **not passes**. A fresh exact-head run is required after this documentation update.

The current development branch implements the guest public-room path in `guest-sessions.ts`, `index.ts`, `room-policy.ts`, `media.ts`, and `guest_room_chat_screen.dart`; the guest-session integration test covers public-room discovery, joining, text exchange, guest restrictions, and guest audio attachment authorization. The older PR #16 description that says the branch does not implement guest room runtime is stale relative to this development head; do not use that old description as the current implementation status. Its remaining Test Center changes still require a separate diff/rebase review.

No merge, deployment, live Firebase mutation, paid-resource activation, or production change was performed. Phase 2 remains open pending fresh CI, native build completion, live non-production GCS/Cloud Run validation, device acceptance, and the remaining product/legal gates.

### CI trigger and concurrency correction — 15 November 2026

The workflow files `.github/workflows/validate.yml` and `.github/workflows/bootstrap-native-platforms.yml` are newly introduced on the development branch and are not yet present on repository `main`. A `pull_request` event for PR #2 cannot reliably load these new workflow definitions from the base branch. Therefore the correct automatic trigger before merge is a push to the isolated development branch, not pull_request.

An earlier attempt to use only `pull_request` resulted in no fresh workflow run on the new PR head. The final configuration now:
- Triggers Validate Mawda on each push to `codex/mawda-full-platform-implementation`.
- Triggers native Android/iOS validation on development-branch pushes only when native-related paths change.
- Retains `workflow_dispatch` for manual use when available.
- Uses one concurrency group per development branch so a later commit supersedes an earlier in-progress run without creating duplicate push/PR event races.

Commits:
- `22788ce82c707a6cb58b8ca3c4a0ec456be6b520` — initial removal of duplicate push/PR trigger (superseded by the correct trigger below).
- `8d691880c1570b76da0a5432f85811aeaa906df5` — restore push-based automatic validation for the development branch.
- `f52863646c5ef22db01e0026e8248dd1be5c14b5` — enable native builds on relevant development-branch pushes.

**Verification:** the latest workflow trigger changes themselves still require the next GitHub Actions run to validate YAML and complete Flutter, Functions, scanner, Android and iOS jobs. No test pass is claimed for the newest head.

### Fail-closed guard for unknown derivative categories

A follow-up static review caught a null-safety ordering defect in the new resolver integration: the callback initially built the expected object path before checking whether the resolver returned a supported contract. The callback now rejects an unsupported category before reading any contract fields, then validates purpose, exact path, MIME type, pipeline version and owner-only PDF role.

- Commit `e575d0f6bb18d1fa3a5cb14cee6c2bee36cd6a72` — fail closed on unknown derivative categories.
- The unit test already asserts that an unknown category returns `null`; the callback now handles that result explicitly.
- This is source-reviewed but still awaits the next successful Cloud Functions CI run.

### Direct-chat microphone duration alignment

The shared Flutter microphone composer still defaulted to 120 seconds when used by direct chat, even though the server policy allows 600 seconds and the approved direct-chat rule is 10 minutes. Room chat already passed 60 seconds explicitly. The shared widget now requires every caller to specify its duration, and the direct-chat screen explicitly supplies 600 seconds while room chat supplies 60 seconds.

- `f3082c9865c97d719bf594143279868e3c9c7383` — remove the ambiguous shared 120-second default; require explicit duration.
- `7ec79ca21d7879c7565a7fb8257c2c3e9b25058e` — set direct-chat voice recording to 600 seconds.
- The scanner enforces the corresponding trusted limits: 600 seconds for direct chat, 60 seconds for rooms.
- Verification remains pending on the exact new PR head; Flutter analysis/tests and scanner/Functions tests must all pass.

### Ten-minute voice-note transport capacity

A deeper review found that the direct-chat 600-second timer alone was insufficient: the shared PCM capture buffer was capped at 8 MiB while recording 24 kHz mono PCM16, so it would stop after roughly 175 seconds, well before the approved 10-minute limit. A full 10-minute 24 kHz WAV would also exceed the 25 MiB server audio upload limit.

Corrected by recording the shared member composer at 16 kHz mono PCM16 and raising its bounded in-memory capture limit to 20 MiB. Ten minutes at 16 kHz mono PCM16 is 19,200,000 bytes plus a 44-byte WAV header, below the existing 25 MiB audio upload ceiling. The WAV encoder is explicitly told the same 16 kHz rate. The 60-second room composer also uses this speech-appropriate format; the separate guest recorder remains at 24 kHz for its one-minute cap.

- `227312fa1c5a99e338e1b8cdcd45cd72455d5961` — 16 kHz capture and 20 MiB bounded buffer.
- `9e83d7a755491d815403252536cc400c36cdce82` — unit test for 16 kHz WAV header/sample-rate consistency.
- The test and Flutter analysis remain pending on the latest exact branch head.

### Purpose-aware safe derivative authorization — 15 November 2026

A follow-up policy review found that the trusted callback's generic `chat`/`room` purpose check would reject legitimate GIF derivatives for profile albums, avatar covers, stories and owner advertisements, as well as owner-uploaded advertisement video. This contradicted the upload policy already enforced by `mediaUploadAllowedForRole`.

The callback now uses `safeDerivativePurposeAllowed` from `functions/src/media-derivative-contract.ts`, with an explicit category/purpose/role matrix:
- GIF: chat, room, profile album, avatar cover and story; advertisement only for `platform_owner`.
- Audio: chat and room only.
- Video: chat and room; advertisement only for `platform_owner`.
- PDF/document: chat and room only for `platform_owner`.

Unknown derivative categories still fail closed before any contract property is read. Unit tests cover allowed and denied category/purpose/role combinations.

Commits:
- `2173460a252883ed728f999c13fe318fd3dcdd4d` — encode purpose-aware derivative authorization rules.
- `ad3cc7f2bd90858cd721af2f801b3ca50e25f70c` — apply the purpose/role matrix in the trusted callback.
- `6bcec4517a21f9859959b78ff51eb8c67cf69306` — add positive and negative authorization-matrix tests.

**Verification status:** source and tests are present on the development branch, but these commits have not yet been verified by a completed exact-head CI run. Phase 2 remains open.

## Engineering verification update — 15 November 2026

### Exact-head validation

- Development code/test head: `c18c4eb2d19c896ce322627fd50a2ce8db5af40e`.
- GitHub Actions [run 43719444337](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43719444337): `completed / success` on that exact head.
- All three jobs passed:
  - Flutter analysis, Flutter tests and Web release build.
  - Cloud Functions compilation, unit tests, Firebase Emulator integration journeys, and Firestore/Storage rules tests.
  - Isolated ClamAV scanner tests and container image build.
- The guest-session integration suite now additionally tests a previously pending cleanup record being picked up by the scheduled cleanup sweep, all guest memberships being removed, and only then finalizing the session. The 205-membership pagination and eligible-room discovery regression tests also pass.
- The exact-head run is CI evidence for the tested source and emulator scenarios only; it does not constitute live cloud or device acceptance.

### Native runner evidence

- [Run 43715811490](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43715811490) passed Android debug APK generation and unsigned iOS build on `227312fa1c5a99e338e1b8cdcd45cd72455d5961`.
- The changes between that native-build revision and the later guest-retry test head contain no Flutter application source changes under `lib/`; later differences are backend, tests and documentation.
- These are CI build artifacts, not signed store-ready releases or physical-device acceptance.

### 5,000-persona lab — failure analysis and corrective PR

- The last full simulation [run 43691324361](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43691324361) failed during room membership after 2,679 of 5,000 personas, with Firestore Emulator `ABORTED: Transaction lock timeout`. Wallet, direct messaging, profile/store, discovery, block/unblock and push-token lifecycle stages had completed.
- Corrective draft PR [#2 in the simulation lab](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/pull/2) limits room-group concurrency to two, adds bounded exponential retry for transient transaction/transport contention only, emits room-join progress, and tests that permanent authorization/validation failures are not retried.
- Lab validation [run 43719679728](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43719679728) passed, including the new retry unit tests and workflow safety checks.
- The full 5,000-persona simulation has **not yet been rerun** against the corrected harness and current platform head. PR #2 in the lab remains Draft/open/unmerged. Do not report a 5,000-persona pass until a new manual run completes with 5,000/5,000 lifecycle rows.

### Related implementation PR reconciliation

The separate Draft PRs #13, #15, #16 and #17 remain open and are not merged. Their relevant implementation areas are present on this consolidated development branch: member inbox/two-way block-read protection; premium purchase receipt/ledger/entitlement integration; emulator test personas/Test Center; and purpose-aware scanner audio duration enforcement. They must not be merged as stale duplicate branches without a fresh rebase/diff review.

### Remaining release gates

- Run the corrected 5,000-persona lab against the exact current platform SHA and inspect its complete JSON report.
- Validate live non-production GCS signed URLs, Cloud Run scanner dispatch/callback, IAM/WIF/Secret Manager, retention and restore behavior. These require owner-controlled environment setup and specific approval; no production project is to be used.
- Complete Android/iOS physical-device checks for install, microphone/camera permissions, recording, playback, notifications and biometric behavior.
- Keep biometric rewards disabled until cryptographic device-bound verification is implemented and independently validated. A local OS prompt or client assertion is not accepted as proof.
- Complete App Check/anonymous-account abuse controls, owner MFA recovery drills, independent penetration/security review, privacy/legal review, observability and incident-response exercises.
- PR #2 in the primary platform remains Draft/open/unmerged. No production deployment, production Firebase mutation, paid-resource activation or irreversible operation was performed.

## Exact-head CI repair and validation — 15 November 2026

- Starting from development head `60f03ba97ac9caa87ab439907a1a1e1919bf4581`, CI exposed two deterministic blockers:
  - Flutter analysis rejected an unused import in `lib/widgets/chat_audio_controls.dart`.
  - `functions/test/platform-economic-policy.test.js` imported the TypeScript source path although the Node test runner executes the compiled CommonJS output.
- Corrective commits:
  - `e23603dbdf5f53a3412cba6bdc3b1cd84bff2c60` — remove the unused Dart import.
  - `d66367d360749d5654032ed7c153cc6538a55d14` — make the economic-policy test import the compiled `lib/platform-economic-policy.js` module.
- Exact-head GitHub Actions [run 43728234563](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43728234563) completed **success** on `d66367d360749d5654032ed7c153cc6538a55d14`. All three jobs passed:
  - Flutter analysis, Flutter tests and Web release build.
  - Cloud Functions compilation, unit tests, Firebase Emulator integration journeys and Firestore/Storage rules tests.
  - Isolated ClamAV scanner gateway tests and container image build.
- This is a verified CI repair on the exact development head. It does not clear live non-production cloud validation, physical-device acceptance, security/legal review, or release authorization.
- Native runner workflow [run 43728230648](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43728230648) is running on `e23603dbdf5f53a3412cba6bdc3b1cd84bff2c60`. The only difference between that native-build SHA and the exact CI head is the backend test import correction in `functions/test/platform-economic-policy.test.js`; no Flutter application source changed between them. Do not treat the native run as complete until it reports success.
- The corrected 5,000-persona harness PR #2 remains Draft/open/unmerged; no full 5,000-persona rerun has yet been recorded against this exact platform head.
- No merge to `main`, deployment, live Firebase mutation, billing upgrade, paid-resource activation, or irreversible retention/legal-hold operation was performed.

## Runtime lifecycle and CI action modernization — 15 November 2026

- The repository and scanner had been pinned to Node.js 20. Google Cloud's runtime schedule lists Node.js 20 as decommissioned on 30 October 2026; Node.js 22 remains supported. The development branch now targets Node.js 22:
  - `functions/package.json` and the root metadata in `functions/package-lock.json`: Functions engine `22`.
  - `scanner/package.json`: scanner engine `22`.
  - `scanner/Dockerfile`: `node:22-bookworm-slim`.
  - `validate.yml` and `mawdda-test-center.yml`: pinned Node.js `22.23.4`.
  - The 5,000-persona lab's validation and simulation workflows were also aligned to Node.js `22.23.4` on its isolated Draft PR branch.
- GitHub artifact upload actions were upgraded from `actions/upload-artifact@v5` to `@v7.0.2` in the platform workflows and the simulation lab workflow, removing the observed Node.js 20 action-runtime deprecation warning.
- Exact-head GitHub Actions [run 43728964878](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43728964878) completed **success** on `6e79f360f13c20ebec1f3214f78f822f554a290c` with all three jobs green:
  - Flutter analysis reported no issues, all 15 Flutter tests passed, and the Web release build succeeded.
  - Cloud Functions compile/unit tests and all configured Firebase Emulator integration journeys and Firestore/Storage rules tests passed (all reported test groups had zero failures).
  - Scanner source/security tests passed and the Node.js 22 ClamAV container built; the in-container media sanitization tests and EICAR detection passed.
- Simulation-lab validation [run 43728976974](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43728976974) passed on lab PR branch head `2ce169e06733fc535b05699a9c757537965756da`, including four bounded Firestore retry unit tests and workflow safety checks. This is not the 5,000-persona run.
- Native build [run 43728956968](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43728956968) completed **success** for both Android debug APK and unsigned iOS build; Android APK, unsigned iOS device build and generated native-project artifacts were uploaded. These are CI artifacts, not signed store releases or physical-device acceptance.
- The 5,000-persona full simulation remains unrun against the exact platform head. Lab PR #2 remains Draft/open/unmerged; no merge was performed.
- Node 22 migration is CI-verified for Functions, scanner and the emulator integration suite. This does not authorize or perform a Functions deployment; the production project remains untouched.


## Exact native-build and policy reconciliation — 15 November 2026

- Native workflow [run 43728956968](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43728956968) completed successfully on platform commit `82fedea62e09d5fc2a3c7472d3dd35f4cb40c917`: Android debug APK build and unsigned iOS build both succeeded. The workflow uploaded Android APK, unsigned iOS device build, and generated native-project artifacts. These are unsigned CI artifacts, not signed store releases or physical-device acceptance.
- The native commit is an ancestor of the exact code-validation commit `6e79f360f13c20ebec1f3214f78f822f554a290c`; the two commits after the native build changed only workflow runtime/action configuration, not Flutter application source. Exact-head Flutter/Functions/scanner validation passed on `6e79f36` in run 43728964878.
- The current development-branch scanner source `scanner/processors.js` enforces a 60-second maximum for both `chat` and `room` audio purposes. This aligns with MEDIA-005. Draft PR #17 is based on an older commit and its patch contains a superseded 120-second direct-chat allowance; do not merge that stale patch. Reconcile only if a fresh diff shows changes not already present and preserves the universal 60-second rule.
- The approved three chat-retention modes are **not implemented end-to-end**. Current `functions/src/retention.ts` still exposes a single seven-day text-retention constant and sweep based on `createdAt`; no mode-specific 30-day expiry or four-hour server-inactivity full-conversation deletion is wired into the direct-message lifecycle. RET-003 remains a release blocker.
- Code validation passed on `6e79f360f13c20ebec1f3214f78f822f554a290c`; the later development-branch head `196a24554d601827058b7723290a297291da7c2d` contains documentation-only commits after that tested code SHA. No merge to `main`, deployment, live Firebase mutation, paid-resource activation, or production retention activation occurred.

## Post-reconciliation exact-head and 5,000-persona failure analysis — 15 November 2026

### Primary development branch
- The approved PR #18 history reconciliation was merged into the development branch only. Current exact development SHA: `ffee64e354f59bccd7e721f7f237bfff9216ab71`.
- Exact-head validation [run 43756795118](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43756795118) completed successfully: Flutter analysis/tests/Web release build; Cloud Functions compile/unit and configured Auth/Firestore/Storage emulator integration and rules suites; media, retention, wallet/store, room rental/events, owner grant, audit/legal-hold, safety/appeal, guest/privacy and FCM lifecycle suites; ClamAV scanner source/container, sanitization and EICAR checks.
- Exact-head domain regression [run 43756795129](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43756795129) completed successfully: retention/room-reservation emulator regression and Flutter UI/widget tests.
- The approved owner/super-admin Firestore rules were not changed by PR #18. The `firestore.rules` blob remains `baecf9f87f3c6328e3540ce692015bc2e10e4b8b`. No live Firebase project was modified.
- These runs are CI/emulator evidence, not physical-device acceptance, production capacity certification, or proof that every product requirement is complete.

### Forensic result from the last full 5,000-persona run
- Full run [43691324361](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43691324361) failed on the room-membership stage with Firestore Emulator `10 ABORTED: Transaction lock timeout`.
- The run used lab revision `3bc9fe1e86ef839693cb084dde0338d699de4f02` and checked out platform revision `7b6b4fa0a93ca972213bf012b91b559e801456a6`; it did **not** test the current development SHA.
- The report artifact recorded 5,000 synthetic identities provisioned. The 5,000-persona wallet/direct-message tier passed: 2,500 transfers, 2,500 idempotent replays, 5,000 direct messages, 5,000 received-message checks, zero transfer/message errors, and 5,000/5,000 complete wallet/message coverage. Measured throughput was 191.57 operations/second; p95 transfer, message and receive latencies were 843.07 ms, 760.72 ms and 1,136.24 ms respectively (Firebase Emulator only).
- The separate 5,000-persona lifecycle passed premium entitlement provisioning, store purchase/receipt/ledger reconciliation, premium profile updates and reads, analytics, discovery/boost verification, block/unblock and push-token register/deactivate for all 5,000 identities.
- It failed during room joins: report coverage was 2,680/5,000 (including pre-joined room owners); event listing and RSVP coverage remained 0/5,000. The lifecycle did not pass.

### Corrective lab change and remaining execution
- Lab PR #2 `fix/room-join-retry-5000` contains the corrective harness change: two concurrent room-group workers, sequential joins within each room, bounded exponential retry (eight attempts, maximum 5-second delay) only for transient Firestore/transport errors, and progress logging every 250 joins. Permanent authorization/validation errors are not retried.
- Lab validation [run 43728976974](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43728976974) passed on lab PR head `2ce169e06733fc535b05699a9c757537965756da`, including retry unit tests and the workflow safety guard. This is harness CI only, not a new 5,000-persona simulation.
- The previous failed run log confirms the lab Actions secret `MAWDDA_PLATFORM_READ_TOKEN` was present and the private platform checkout succeeded. Do not expose its value; verify its least-privilege read-only scope before future use.
- Lab PR #2 remains Draft/open/unmerged. The corrected full simulation has **not** been rerun against current platform SHA `ffee64e354f59bccd7e721f7f237bfff9216ab71`. Do not mark 5,000-persona acceptance complete until the new report proves 5,000/5,000 lifecycle coverage, including room joins, event listing and RSVP.
- No production deployment, live Firebase mutation, paid-resource activation, destructive retention activation, merge to primary `main`, or change to owner Firestore rules is authorized or performed by this update.
