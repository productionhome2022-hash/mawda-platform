# Secure media intake — phase 2 engineering status

## Security boundary

- Firebase Storage client rules remain deny-all. Quarantine objects are private and no member-facing media delivery path is enabled.
- Upload intents use five-minute V4 signed PUT capabilities scoped to random `quarantine/{uid}/{mediaId}` object names. `ifGenerationMatch=0` makes the write create-only: a replay after the first successful write must fail with HTTP 412. This is not a one-time URL; the bearer capability remains usable until expiry for any operation allowed by its signature.
- Finalization validates owner, state, server object metadata, exact byte count versus the quota reservation, generation, allowlisted MIME type and leading-byte signature. Signature checks are format checks, not malware detection.
- Quota reservation is atomic with asset creation: 5 concurrent intents, 150 MiB active reserved bytes, 500 MiB per UTC day per UID. These are conservative engineering defaults, not owner-approved production limits. The daily reservation is not refunded for abandoned attempts.
- A scheduled sweep runs every 15 minutes but only claims an intent after its five-minute signed URL expiry plus a 30-minute grace period. It deletes only the exact object generation, releases active reservations transactionally and writes a success audit event in the same transaction. Failed deletion retains its claim for retry. If the object is initially missing, the reservation is retained for six hours and the object is checked again before quota is released, reducing the risk of orphaning a late-completing upload.
- Owner metadata listing is bounded and paginated. The former signed-URL inspection callable is disabled. The owner console offers a preview action only when a verified safe WebP derivative exists. A callable checks the sole-owner claim and recent MFA, rechecks derivative generation, provenance metadata and SHA-256, then returns bounded image bytes—not a Storage URL. The UI renders only that derivative, never the original quarantine bytes.
- A separate authenticated attachment-stream endpoint exists for owner investigation; it requires a revocation-aware Firebase ID token, App Check, sole-owner claim and recent MFA, and forces octet-stream/attachment. It is not yet wired to a UI action.
- Firestore media metadata/audit and Firebase Storage client rules remain deny-all. Do not weaken these rules for client convenience.

## Upload quotas and transport-size boundary

- Current per-UID limits are 5 active intents, 150 MiB active reserved bytes and 500 MiB reserved bytes per UTC day.
- Per-file maxima: raster images (JPEG/PNG/WebP/GIF) 5 MiB, MP4 video 100 MiB, audio 25 MiB, PDF 20 MiB.
- The upload intent reserves the declared size and signs the exact `x-goog-content-length-range: min,max` header with `min=max=declaredSizeBytes`; Cloud Storage rejects a body outside that exact range before creating the object. The signed request also binds the content type and `ifGenerationMatch=0`. Clients must send the exact `requiredHeaders` returned by the callable.
- Finalization independently rechecks exact object byte count, MIME type, signature and generation. This is defense in depth; transport rejection does not replace finalization validation.
- Storage Emulator integration tests verify the signed intent's exact required headers and create-only precondition, then use the Admin SDK to seed an object and exercise finalization; the emulator returns HTTP 501 for signed PUT endpoints and is not treated as evidence of the signed-URL wire protocol. The separate opt-in real-GCS HTTP script tests actual signed PUT/GET, exact-size rejection, expiry and replay against a disposable non-production bucket; it has not yet been run because no non-production bucket credentials/configuration are available here.

## Trusted malware scanner and safe image processing

Source code now includes an isolated Cloud Run scanner service under `scanner/`:
- Private Cloud Run IAM authentication (the Functions dispatcher obtains a Google identity token) plus a separate high-entropy scanner API token.
- HTTPS-only source URL validation bound to the exact bucket object path and generation; no redirects or arbitrary hosts.
- 100 MiB bounded download, ClamAV scan with explicit archive recursion/file-count/scan-size limits, and fail-closed behavior for timeouts, parser limits and incomplete scans. The scanner also refuses scans and reports degraded health if the daily signature database is missing or older than 36 hours.
- HMAC-SHA256 callback binding media ID, provider, source generation, source SHA-256 and scan timestamp.
- Clean raster images (including bounded animated GIFs) are decoded and re-encoded by Sharp to a bounded WebP derivative; GIF frame count is capped at 100 to reduce animation-bomb risk. Firebase independently verifies the source hash and derivative generation, metadata and hash before setting `security_approved`.
- Malicious verdicts reject and delete only the matching source generation. Duplicate verdict callbacks are idempotent.
- Clean video, audio and PDF assets remain `scanner_clean_pending_processing`; they are not member-accessible and cannot be previewed until type-aware safe processing is built.

**Deployment status:** the scanner service source and CI security tests exist, but the Cloud Run service has not been deployed or connected to a non-production Firebase project in this environment. No actual file has yet been scanned by this service. Until deployment, secret configuration and end-to-end verification are complete, every upload remains quarantined and must not be treated as security-approved.

## Scanner deployment contract

See `scanner/README.md`. Required managed configuration:
- Firebase secrets: `MAWDA_MEDIA_SCANNER_API_TOKEN`, `MAWDA_MEDIA_SCANNER_HMAC_SECRET`.
- Firebase parameters: `MAWDA_MEDIA_SCANNER_URL` (Cloud Run HTTPS URL ending in `/scan`), `MAWDA_MEDIA_SCANNER_CALLBACK_URL`, `MAWDA_MEDIA_SCANNER_PROVIDER`.
- Cloud Run secrets/env: matching API token and HMAC secret, callback URL, provider and exact `GCS_BUCKET`.
- Cloud Run must reject unauthenticated invocations. Grant `roles/run.invoker` only to the Firebase Functions runtime service account. Grant the scanner runtime only the required object-create/object-get access to the `processed/` prefix; do not grant bucket administration.
- Keep all secrets outside Git and never place signed URLs, tokens or file contents in logs.

## Real Cloud Storage HTTP test

Run only against a disposable non-production bucket with application-default credentials:

```sh
cd functions
MAWDA_MEDIA_SIGNED_URL_HTTP_TEST=1 \
GOOGLE_CLOUD_PROJECT=mawda-media-test \
MAWDA_MEDIA_TEST_BUCKET=mawda-media-test.appspot.com \
npm run test:media-signed-urls-http
```

The guarded runner performs real HTTP signed PUT and GET requests, verifies replay/create-only rejection (412), verifies expiry for both upload and read URLs, and deletes its uniquely named test objects. It refuses the known production project ID and project/bucket names that do not explicitly identify a non-production environment. This test has not yet been run because no non-production bucket credentials/configuration are available here.

## Retention, audit and release gates

- Upload purpose is recorded (`chat`, `room`, `profile_album`, `avatar_cover`, `story`). For `chat` and `room`, the intent initially has a null expiry; successful server-side finalization sets `retentionExpiresAt` to four hours after validation and changes the policy status to `four_hour_self_destruct`. The exported retention worker runs every minute but is disabled by default and refuses all projects not explicitly identified as non-production. It deletes exact object names across visible generations, safe WebP derivatives and scan-job references, then keeps content-free tombstones and rechecks the deterministic derivative path every five minutes. A separate Storage-finalized trigger removes late derivatives after expiry.
- The seven-day text-retention worker and 90-day operational media-audit worker are also exported, disabled by default and non-production gated. No production retention job has been enabled or run.
- `profile_album`, `avatar_cover` and `story` still retain `owner_approval_required` with no implemented purpose-specific expiry/deletion schedule. The approved 7-day gallery, 30-day avatar/cover, and immediate story-expiry jobs remain to be built and tested. Legal holds, audit export/24-month sensitive evidence, backup/PITR expiry, soft-delete/retention-lock configuration and cache/CDN reconciliation remain release blockers.
- Exercise the six-hour missing-object recheck under slow-upload simulation, cleanup retry/dead-letter behavior and orphan reconciliation in non-production. Do not enable retained-media deletion until real-GCS generation/soft-delete behavior, backups, legal holds and recovery controls are verified.
- Verify the signed byte-range header against a real non-production bucket, and validate browser CORS against the actual non-production origins.
- Deploy and exercise the scanner in non-production with clean files, EICAR test signature, malformed images, archive bombs/limit-exceeding files, stale generation, bad HMAC, duplicate callbacks, scanner timeout, signature database refresh/staleness and Cloud Run restart/retry.
- Build safe processing for video, audio and PDF before any of those types can be member-delivered.
- The safe WebP preview action is now wired into the owner console. Add Flutter App Check initialization before wiring the separate attachment-stream action; keep all raw signed URLs out of the client.
- Verify owner MFA enrollment/recovery/revocation, CORS, Android/iOS/web device flows, performance, monitoring, backups and restore in a non-production project.

No production Firebase data, rules, bucket configuration, deployment, merge or destructive retention action has been changed or authorized.
