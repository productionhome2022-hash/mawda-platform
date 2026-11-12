# Secure media intake — phase 1

## Security posture

- Firebase Storage client rules remain deny-all. No object is public and no member can read another member's media through the Firebase client SDK.
- Authenticated uploads receive a five-minute V4 signed PUT URL scoped to one random object path under `quarantine/{uid}/`.
- Supported formats are explicitly allowlisted: JPEG, PNG, WebP, MP4, MPEG/MP4/OGG/WAV audio, and PDF. Per-category byte limits are enforced again against server-reported object size after upload.
- Finalization verifies ownership, object existence, server content type, generation, size and leading-byte signature. Mismatches are deleted and recorded as rejected.
- A valid upload is marked `pending_security_scan`. Signature checks are format validation only; they are not antivirus or deep-content inspection. Until a trusted malware scanner is integrated and returns a clean verdict, the asset remains quarantined and is not available to members.
- The sole platform owner can list metadata and request a 60-second attachment URL for explicit inspection. Every upload-intent, validation, listing and owner URL action is audited. Owner endpoints require the platform-owner custom claim and a recent MFA session.
- Signed URLs are bearer credentials. They are short-lived, must not be logged by clients, and must not be copied into member-visible documents or notifications.

## Cloud scanner integration still required

This repository does not yet contain a malware scanning provider, isolated media transcoder, image decoder/re-encoder, archive-bomb protection, or content-disarm pipeline. Do not mark assets `security_approved`, generate member-facing download URLs, or open Storage rules until a trusted scanner/processor is deployed and its authenticated verdict, retry/dead-letter behavior, size limits, and emulator/integration tests are implemented.

## Callable contract

- `createMediaUploadIntent({ originalName, contentType, sizeBytes })`
- `finalizeMediaUpload({ mediaId })`
- `listOwnerMediaAssets({ status?, limit?, pageToken? })`
- `getOwnerMediaInspectionUrl({ mediaId })`

All Firestore asset records are server-written. Client SDK access remains denied by the existing Firestore/Storage rules.
