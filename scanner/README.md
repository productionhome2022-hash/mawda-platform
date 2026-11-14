# Mawadda private media scanner gateway

This service is the isolated scanning worker called by the Firebase Functions dispatcher. It is not deployed automatically by the Flutter/Firebase Hosting workflow.

## Security model

- Cloud Run must be deployed with IAM authentication enabled (no unauthenticated invoker). Firebase Functions obtains a Google-signed identity token for the Cloud Run service audience; Cloud Run IAM validates it before the request reaches this container. The container also requires a separate high-entropy `x-mawadda-scanner-token` (minimum 32 bytes).
- Request validation binds a UUID media ID, exact quarantine object path, generation, provider and a Google Cloud Storage HTTPS signed-read URL. Redirects and non-GCS hosts are rejected.
- Downloads are bounded to 100 MiB and streamed to a private temporary file. The signed URL, token and file contents are never written to logs.
- ClamAV runs with explicit archive recursion, file-count, scan-size and file-size limits. Any timeout, parser limit, incomplete scan or scanner error is a failure, never a clean verdict.
- A clean raster image is decoded and re-encoded by Sharp into a bounded WebP derivative under `processed/{uid}/{mediaId}/preview.webp`. Original media remains quarantined.
- The service returns a signed HMAC-SHA256 callback bound to the original SHA-256 and exact Storage generation. Firebase Functions independently rereads and hashes the original and verifies the derivative before marking the raster preview eligible.
- Clean non-image media remains `scanner_clean_pending_processing`; it is not member-accessible and does not become previewable. A separate type-aware processing pipeline is required for video, audio and PDF.

## Required runtime configuration

Set these as Cloud Run secrets/environment values; never commit them:

- `SCANNER_API_TOKEN`: same value as Firebase secret `MAWDA_MEDIA_SCANNER_API_TOKEN`, at least 32 random bytes.
- `SCANNER_HMAC_SECRET`: same value as Firebase secret `MAWDA_MEDIA_SCANNER_HMAC_SECRET`, at least 32 random bytes.
- `SCANNER_CALLBACK_URL`: HTTPS URL of the deployed `receiveMediaScanVerdict` function.
- `SCANNER_PROVIDER`: same as Firebase parameter `MAWDA_MEDIA_SCANNER_PROVIDER` (default `clamav-mawadda-gateway`).
- `GCS_BUCKET`: exact quarantine bucket name.

The Cloud Run runtime service account needs object-create permission for the `processed/` prefix (or a custom role scoped to the bucket). It does not need bucket-wide admin or permission to change bucket IAM. Firebase Functions needs to read the scanner URL/API token configuration and sign generation-pinned read URLs.

## Deployment sequence (non-production only)

1. Create a dedicated non-production Firebase/GCS project and bucket with uniform bucket-level access and public access prevention. Do not enable soft-delete retention, bucket retention policies/locks, object holds, replication or backup copies for chat-media payloads. Object versioning may be enabled for the test only if the exact-generation purge test proves every noncurrent generation can be permanently deleted.
2. Configure the Firebase Functions secrets and string parameters:
   - `MAWDA_MEDIA_SCANNER_API_TOKEN`
   - `MAWDA_MEDIA_SCANNER_HMAC_SECRET`
   - `MAWDA_MEDIA_SCANNER_URL`
   - `MAWDA_MEDIA_SCANNER_CALLBACK_URL`
   - `MAWDA_MEDIA_SCANNER_PROVIDER`
3. Build and deploy this container to Cloud Run in the same approved region. Set `SCANNER_API_TOKEN`, `SCANNER_HMAC_SECRET`, `SCANNER_CALLBACK_URL`, `SCANNER_PROVIDER`, and `GCS_BUCKET` from Secret Manager/config. Use a dedicated service account, grant `roles/run.invoker` to the Firebase Functions runtime service account, grant only storage object-create and object-get permissions scoped to the `processed/` derivative prefix, use no service-account keys, expose no shell/debug endpoints, and restrict egress where practical.
4. Configure Firebase Functions scanner URL and secrets to match the deployed service.
5. Test clean EICAR-free sample images, the standard EICAR test string in a supported container (must be rejected), malformed images, oversized objects, expired signed URLs, generation mismatch, bad HMAC, stale callback, duplicate callback, scanner timeout and Cloud Run restart/retry in non-production.
6. Run `functions/scripts/test-retention-storage.cjs` with `MAWDA_RETENTION_GCS_TEST=1` against the dedicated non-production bucket. It refuses buckets with soft-delete retention or a retention policy and verifies deletion of every visible generation. This test is separate from `functions/scripts/test-signed-urls-http.cjs`.
7. Do not enable member delivery for non-image media until its separate safe processing pipeline is implemented and validated.

The service has not been deployed or connected in any Firebase environment merely by adding these source files. A green scanner image build/EICAR CI job is not proof of a live Cloud Run service or a configured bucket. Firestore PITR and scheduled backups/exports must also be disabled or proven to expire chat text within the seven-day limit. A successful CI build is not evidence that the malware signatures are current or that a live scanner is running.
