# Secure media intake — phase 1

## Security posture

- Firebase Storage client rules remain deny-all. No object is public and no member can read another member's media through the Firebase client SDK.
- Authenticated uploads receive a five-minute V4 signed PUT URL scoped to one random object path under `quarantine/{uid}/`.
- Upload authorization reserves quota in a Firestore transaction before the capability is returned. Initial operational defaults: at most 5 concurrent intents, 150 MiB of concurrently reserved bytes, and 500 MiB reserved per UTC day per authenticated UID. The daily budget is consumed when an intent is issued (including abandoned attempts); active capacity is released only after successful or rejected finalization. These are conservative launch defaults and must be load-tested and owner-reviewed before production use.\n- Supported formats are explicitly allowlisted: JPEG, PNG, WebP, MP4, MPEG/MP4/OGG/WAV audio, and PDF. Per-category byte limits are enforced again against server-reported object size after upload.
- Finalization verifies ownership, object existence, server content type, generation, size and leading-byte signature. Mismatches are deleted and recorded as rejected.
- A valid upload is marked `pending_security_scan`. Signature checks are format validation only; they are not antivirus or deep-content inspection. Until a trusted malware scanner is integrated and returns a clean verdict, the asset remains quarantined and is not available to members.
- The sole platform owner can list metadata and request a 60-second attachment URL for explicit inspection. Every upload-intent, validation, listing and owner URL action is audited. Owner endpoints require the platform-owner custom claim and a recent MFA session.
- Signed URLs are bearer credentials. They are short-lived, must not be logged by clients, and must not be copied into member-visible documents or notifications.

## Quotas, lifecycle and cleanup\n\n- `mediaUploadQuotas/{uid}` is a server-only accounting document. Reservation and asset creation are committed in one Firestore transaction, so parallel requests cannot independently exceed the active-count/byte limits. Finalization releases active capacity in the same transaction as the terminal asset transition.\n- The daily window is UTC and resets without erasing active reservations. A failed or abandoned intent continues to consume daily budget until the UTC window rolls over.\n- Expired-intent cleanup is not enabled yet. A future scheduled janitor must verify age, owner/path/generation and current asset state, delete only the exact quarantined generation, release reservations transactionally, and write an immutable audit event. No broad prefix deletion is permitted.\n- Retention periods, export, legal hold, deletion authorization and backup expiry still require an owner-approved policy before destructive automation is enabled.\n\n## Cloud scanner integration still required

This repository does not yet contain a malware scanning provider, isolated media transcoder, image decoder/re-encoder, archive-bomb protection, or content-disarm pipeline. Do not mark assets `security_approved`, generate member-facing download URLs, or open Storage rules until a trusted scanner/processor is deployed and its authenticated verdict, retry/dead-letter behavior, size limits, and emulator/integration tests are implemented.

## Callable contract

- `createMediaUploadIntent({ originalName, contentType, sizeBytes })`
- `finalizeMediaUpload({ mediaId })`
- `listOwnerMediaAssets({ status?, limit?, pageToken? })`
- `getOwnerMediaInspectionUrl({ mediaId })`

All Firestore asset records are server-written. Client SDK access remains denied by the existing Firestore/Storage rules.
