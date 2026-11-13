# Mawadda isolated malware scanner gateway

This Cloud Run container runs ClamAV behind Cloud Run IAM. It does not read or write Cloud Storage. The trusted Functions dispatcher reads one exact quarantined object generation and streams its bytes to this service. The gateway scans the complete payload with ClamAV INSTREAM, computes SHA-256, and posts a signed verdict to the Functions callback.

## Security properties

- Cloud Run must be deployed with `--no-allow-unauthenticated`; only the Functions service account receives `roles/run.invoker`.
- Requests additionally require a 32+ character `MAWDA_MEDIA_SCANNER_BEARER_TOKEN` in `X-Mawadda-Scanner-Token`.
- Callback requests are HMAC-SHA256 signed over the exact JSON bytes using `MAWDA_MEDIA_SCANNER_HMAC_SECRET`.
- The callback URL is pinned in the Cloud Run environment and must use HTTPS. The caller-supplied URL must exactly match it.
- The service enforces a 100 MiB maximum request size by default and ClamAV independently enforces stream/file/scan/recursion/time limits.
- ClamAV signature updates run every two hours. The container refuses to start if the initial signature database update fails.
- Engine and signature database versions are attached to every verdict.
- Any daemon error, timeout, invalid response, callback failure or hash mismatch fails closed. The Functions trigger retries; the asset remains quarantined.
- The service binds ClamAV to loopback only. No scanner TCP port is exposed outside the container.

## Required configuration

Provision these Secret Manager secrets in the Firebase/GCP project:
- `MAWDA_MEDIA_SCANNER_BEARER_TOKEN` — random high-entropy secret, at least 32 characters.
- `MAWDA_MEDIA_SCANNER_HMAC_SECRET` — separate random high-entropy secret, at least 32 characters.

Create the Firebase Functions secrets interactively in the non-production project with `firebase functions:secrets:set MAWDA_MEDIA_SCANNER_BEARER_TOKEN --project NONPROD_PROJECT_ID` and `firebase functions:secrets:set MAWDA_MEDIA_SCANNER_HMAC_SECRET --project NONPROD_PROJECT_ID`. Enter the same secret values into the Cloud Run Secret Manager versions; do not place them in shell history or commit them.

Bind the same secret values to both the Cloud Run service and Firebase Functions. Never commit secret values or put them in source-controlled environment files.

Set Functions parameters (for the intended non-production project first):
- `MAWDA_MEDIA_SCANNER_URL` — Cloud Run HTTPS URL ending in `/scan`.
- `MAWDA_MEDIA_SCANNER_CALLBACK_URL` — HTTPS URL of the deployed `receiveMediaScanVerdict` function.
- `MAWDA_MEDIA_SCANNER_PROVIDER` — defaults to `mawadda-malware-gateway`.

Cloud Run environment:
- `MAWDA_MEDIA_SCANNER_CALLBACK_URL` — exactly the same callback URL.
- `MAWDA_MEDIA_SCANNER_PROVIDER` — same provider string as Functions.
- `MAWDA_MEDIA_SCANNER_MAX_BYTES` — 104857600 (100 MiB).

## Build and deploy to a non-production project

Run only after a dedicated non-production Firebase/GCP project and bucket are confirmed:

```sh
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/mawadda/media-scanner:phase2 --file scanner/Dockerfile .
gcloud run deploy mawadda-media-scanner \
  --image REGION-docker.pkg.dev/PROJECT_ID/mawadda/media-scanner:phase2 \
  --region REGION \
  --no-allow-unauthenticated \
  --memory 2Gi --cpu 2 --timeout 600 --concurrency 1 --max-instances 2 \
  --set-env-vars MAWDA_MEDIA_SCANNER_CALLBACK_URL=HTTPS_CALLBACK_URL,MAWDA_MEDIA_SCANNER_PROVIDER=mawadda-malware-gateway,MAWDA_MEDIA_SCANNER_MAX_BYTES=104857600 \
  --set-secrets MAWDA_MEDIA_SCANNER_BEARER_TOKEN=MAWDA_MEDIA_SCANNER_BEARER_TOKEN:latest,MAWDA_MEDIA_SCANNER_HMAC_SECRET=MAWDA_MEDIA_SCANNER_HMAC_SECRET:latest
```

Grant `roles/run.invoker` on this Cloud Run service to the exact service account used by `dispatchMediaSecurityScan`, for example with `gcloud run services add-iam-policy-binding mawadda-media-scanner --region REGION --member=serviceAccount:FUNCTIONS_SERVICE_ACCOUNT --role=roles/run.invoker`. Configure the two Firebase Functions secrets and the three Functions parameters above. Confirm the deployed callback URL and Cloud Run URL before enabling uploads in that environment.

## Verification still required

- Build the Docker image in CI and run the gateway unit/protocol tests.
- In non-production, verify Cloud Run IAM denial for unauthenticated callers and successful invocation from the Functions service account.
- Submit the standard EICAR test string (not live malware) and confirm a malicious verdict, quarantine deletion, audit event and no approval.
- Submit clean fixtures for each allowed media type and verify exact generation/hash binding.
- Test signature-update outage, ClamAV unavailable, timeout, oversized upload, callback outage, duplicate callback, and container restart.
- Verify ClamAV engine/database versions in audit records and establish an owner-reviewed signature-update/incident alert process.

The source code and image build do not mean the Cloud Run service has been deployed. Until the non-production integration tests pass, no uploaded file may be treated as security-approved.
