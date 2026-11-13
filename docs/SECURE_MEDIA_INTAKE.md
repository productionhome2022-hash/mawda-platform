# Secure media intake — phase 2 engineering record

## Security boundary

- Firebase Storage client rules remain deny-all. Firestore client access to `mediaAssets` and `mediaAccessAudit` remains denied. No member-facing media download path is enabled.
- Each authenticated upload intent creates a random object path under `quarantine/{uid}/{mediaId}`, with a five-minute V4 signed PUT URL. Its V4 signature binds the exact `Content-Type`, an `x-goog-content-length-range` header equal to `declaredBytes,declaredBytes`, and the `ifGenerationMatch=0` query precondition. Cloud Storage rejects a size mismatch and rejects a second successful create over an existing live generation. The URL remains a bearer credential until expiry and is not universally single-use.
- Finalization verifies owner UID, exact declared-vs-actual byte count, allowlisted content type, server metadata, generation and leading-byte signature. Mismatches are rejected, deleted and audited. Signature validation is not malware detection.
- Accepted files remain `pending_security_scan`. A file becomes `security_approved` only after the signed scanner callback validates the provider, HMAC, timestamp, media ID, exact Storage generation and full-object SHA-256.
- Scanner callback HMAC uses constant-time comparison. Callback payloads are size-limited and freshness-checked. Malicious verdicts are rejected and the exact scanned generation is deleted. Missing, invalid, stale or mismatched verdicts never approve a file.
- The repository now contains a scanner dispatcher trigger and an isolated Cloud Run ClamAV gateway container. The dispatcher sends only the exact validated quarantine generation to the IAM-protected gateway; the gateway scans the complete payload and returns a signed verdict. This is deployable source code, **not proof that the Cloud Run service has been provisioned or run in a non-production project**. Until the real service and callback are verified, files remain quarantined. Never manually mark a file approved.
- Owner-only metadata listing and short-lived attachment inspection URL callables require the sole platform-owner claim and recent MFA. Their requests/results are audited. The Flutter console currently lists metadata; a safe in-app preview is not yet delivered. Do not expose signed URLs in UI text, logs, analytics, notifications, navigation state or member documents.
- Storage inspection URLs are bearer credentials. The 60-second expiry limits exposure but does not prevent reuse during that window.

## Upload size limits and quota accounting

Per-file limits:
- JPEG, PNG, WebP: 10 MiB.
- MP4: 100 MiB.
- MPEG/MP4/OGG/WAV audio: 25 MiB.
- PDF: 20 MiB.

Per authenticated UID defaults:
- At most 5 concurrent upload intents.
- At most 150 MiB of concurrently reserved bytes.
- At most 100 upload intents and 500 MiB of declared upload budget per UTC day.

Reservations and asset creation are atomic in Firestore. Finalization releases active count/bytes in the same transaction as the asset state transition. The daily count and byte budgets are consumed at intent issuance, including abandoned intents, and reset at the UTC day boundary without erasing active reservations.

**Transport qualification:** the signed V4 PUT binds `x-goog-content-length-range` to the exact declared size and Cloud Storage rejects out-of-range PUT bodies with HTTP 400. The generation-match precondition rejects a replay after the first successful create with HTTP 412. Finalization independently checks actual server-reported bytes. This is a storage-side object-size gate; it is not a guarantee that an oversized request consumes zero ingress bandwidth before rejection. If ingress-bandwidth abuse must also be bounded, use a streaming upload gateway with an early byte counter.

## Abandoned upload cleanup

A scheduled janitor runs every 15 minutes. It claims only `upload_authorized` records whose signed URL expiry plus a 30-minute grace period has passed, verifies the object path exactly matches `quarantine/{ownerUid}/{mediaId}`, transitions the record transactionally to a cleanup-in-progress state, and deletes only the observed Storage generation using a generation precondition. It then releases active quota and writes an audit event in the same Firestore transaction. Failed deletion remains retryable; it does not sweep arbitrary prefixes.

## Signed URL HTTP verification

- Emulator integration tests verify the exact V4 PUT signing options (signed byte-range header, create-only generation precondition, bounded expiry), attachment-only owner read, owner/MFA authorization, stale-generation denial and finalization rejection. The emulator cannot mint real Google V4 signatures without signing credentials, so these tests deliberately stub only the signer.
- `functions/scripts/test-signed-urls-http.cjs` is an opt-in real-bucket test for a dedicated non-production bucket. It checks successful signed PUT, over/under-size rejection (HTTP 400), create-only replay rejection (expected HTTP 412), signed GET byte equality and expiry. It refuses the known production project and production-named buckets. It has **not** been run against a real non-production Firebase project yet.
- Cloud Storage V4 signed URLs are not inherently one-time. The generation precondition is the replay barrier after the first successful object creation.

## Scanner gateway contract

The callback endpoint accepts POST JSON authenticated with `X-Mawadda-Scanner-Signature`, an HMAC-SHA256 over the exact raw request body. The payload binds:
- `mediaId`
- configured `provider`
- verdict: `clean`, `malicious` or `error`
- exact `objectGeneration`
- full-file `sha256`
- fresh `scannedAtMs`

The endpoint independently reads the stored object and recomputes SHA-256 before accepting the verdict. The gateway must use HTTPS, authenticate to the quarantine bucket with least privilege, isolate file parsing, enforce decompression/archive limits, and record engine/signature-database versions in its own durable scan record. Provider secret provisioning and the real scanner service remain non-production setup gates.

## Retention, export and deletion

Only expired, unfinished upload intents are automatically cleaned up. Retention of finalized media, owner exports, member deletion requests, legal holds, backup expiry and audit retention are not automated. Their durations and authorization rules require an explicit owner-approved policy; no broad or irreversible deletion is enabled.

## Remaining phase-2 release gates

1. Build and deploy the ClamAV gateway to a dedicated non-production Cloud Run service with IAM-only invocation, shared Secret Manager secrets, a working signature database and a verified callback URL; test clean, EICAR/malicious, timeout, unavailable, stale, duplicate and tampered-callback cases.
2. Run the exact-size signed PUT against a dedicated non-production bucket; decide whether a separate streaming proxy is required to limit ingress bandwidth as well as committed object size.
3. Deliver a safe owner preview pipeline that serves sanitized/re-encoded derivatives only; do not decode untrusted originals directly in the owner UI.
4. Run the opt-in signed URL HTTP test against a dedicated non-production Firebase bucket and retain dated evidence.
5. Approve retention/export/deletion/legal-hold policy and test it in a non-production environment.
6. Verify bucket CORS for the exact approved web origins, `PUT`, and the signed `Content-Type` plus `x-goog-content-length-range` headers; verify Cloud Run invoker IAM, Secret Manager provisioning/rotation, MFA lifecycle, scanner retries/dead-letter handling, monitoring and device/platform behavior.
7. Re-run all Flutter, Functions, emulator and integration suites on the exact final phase-2 commit. No merge or production deployment is authorized by this document.

## Callable and scheduled contracts

- `createMediaUploadIntent({ originalName, contentType, sizeBytes })` — returns a five-minute signed PUT URL, signed `uploadHeaders`, `uploadMethod: PUT`, exact `maxBytes` and expiry.
- `finalizeMediaUpload({ mediaId })`
- `listOwnerMediaAssets({ status?, uploaderType?, limit?, pageToken? })`
- `getOwnerMediaInspectionUrl({ mediaId })`
- `dispatchMediaSecurityScan` — retryable Firestore transition trigger that sends quarantined bytes to the IAM-protected scanner gateway.
- `receiveMediaScanVerdict` — authenticated HMAC callback from the configured scanner gateway.
- `cleanupExpiredMediaUploadIntents` — scheduled cleanup of expired unfinished intents only.

The Flutter client upload flow must send a raw HTTP `PUT` using the returned URL and both exact `uploadHeaders`; it must keep the URL and headers in memory only and never log or persist them. The client-side uploader integration and browser CORS verification remain release gates. All asset metadata is server-written. Client SDK access remains denied by the existing Firestore and Storage rules.
