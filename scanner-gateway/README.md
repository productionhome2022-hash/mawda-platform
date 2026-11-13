# Mawadda ClamAV scanner gateway

This is an isolated Cloud Run workload for scanning quarantined Mawadda uploads. It uses ClamAV with freshclam signature updates. It is a scanner only: a clean antivirus verdict moves an asset to `scanner_clean_pending_processing`, **not** to member-visible or `security_approved` media. A separate safe-processing/CDR stage is still required.

## Runtime controls

- Runs as the unprivileged `clamav` user.
- Downloads only HTTPS objects from `storage.googleapis.com` and only accepts a generation-bound quarantine path.
- Enforces a 100 MiB streamed download cap and 64 KiB dispatch payload cap.
- Uses ClamAV daemon scan-size, file-count, recursion, scan-time and thread limits.
- Requires a high-entropy bearer API token for dispatch and signs callbacks with HMAC-SHA256.
- Does not log request bodies, signed URLs, file paths, secrets or scanner output.
- Removes the temporary file after each scan. Any indeterminate scanner result returns a retryable 503; the source remains quarantined.
- Fails readiness until freshclam has updated signatures and clamd is responding.

## Build and local verification

```sh
docker build -t mawadda-clamav-gateway scanner-gateway
python3 -m unittest discover -s scanner-gateway -p 'test_*.py'
```

The image needs outbound HTTPS for signature updates, Storage downloads and the verdict callback. Do not expose port 8080 publicly without a strong API token and network-level rate controls. Prefer Cloud Run IAM authentication in addition to the application token.

## Non-production deployment

Use a dedicated non-production Google Cloud project and bucket. Create two independent secrets (at least 32 random bytes each):
- `MAWDA_SCANNER_API_TOKEN`: accepted by the gateway's `Authorization: Bearer` check and supplied to the Functions dispatch secret `MAWDA_MEDIA_SCANNER_API_TOKEN`.
- `MAWDA_MEDIA_SCANNER_HMAC_SECRET`: signs scanner verdict callbacks and is also supplied to the Functions secret with the same name.

Set `MAWDA_SCANNER_PROVIDER=clamav-mawadda-gateway`. Configure Functions parameters:
- `MAWDA_MEDIA_SCANNER_URL`: gateway HTTPS `/scan` URL.
- `MAWDA_MEDIA_SCANNER_CALLBACK_URL`: deployed Functions `receiveMediaScanVerdict` HTTPS URL.
- `MAWDA_MEDIA_SCANNER_PROVIDER`: the same provider identifier.

Recommended initial Cloud Run sizing is 2 vCPU, 4 GiB memory, concurrency 2, request timeout 300 seconds, and a small maximum instance count. Validate actual scan memory/latency with representative non-production samples before adjusting. Keep the gateway private with Cloud Run IAM; the Functions dispatch must obtain an OIDC identity token for the service audience as well as send the application API token. Do not enable public invocation as a workaround.

No Cloud Run service, secrets, IAM binding, or Firebase configuration is provisioned by this repository commit. Deployment and end-to-end scanner verification remain release gates.
