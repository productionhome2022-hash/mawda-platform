# Secure media intake — phase 2 engineering status

## Security boundary

- Storage client rules remain deny-all. Quarantine objects are private and no member-facing media delivery path is enabled.
- Upload intents use five-minute V4 signed PUT capabilities scoped to random `quarantine/{uid}/{mediaId}` object names. `ifGenerationMatch=0` makes the write create-only: a replay after the first successful write must fail with HTTP 412. This is not a one-time URL; the bearer capability remains usable until expiry for any operation allowed by its signature.
- Finalization validates owner, state, server object metadata, generation, byte count, allowlisted MIME type and leading-byte signature. Signature checks are format checks, not malware detection.
- Quota reservation is atomic with asset creation: 5 concurrent intents, 150 MiB active reserved bytes, 500 MiB per UTC day per UID. These are conservative engineering defaults, not yet owner-approved production limits. The daily reservation is not refunded for abandoned attempts.
- The scheduled cleanup runs every 15 minutes, claims only expired upload intents, releases active reservations transactionally and audits success/retry. The current cleanup implementation still requires generation-precondition hardening and failure/recovery tests before release approval.
- Owner metadata listing is bounded and paginated. Owner image preview now checks a revoked-aware Firebase ID token and recent second-factor owner session on every request, streams only JPEG/PNG/WebP, returns no signed URL, sets no-store/nosniff/CSP headers, checks object generation and audits access. The legacy signed-URL callable is disabled.
- Firestore media metadata/audit and Firebase Storage client rules remain deny-all. Do not weaken these rules for client convenience.

## Scanner gateway contract

- `receiveMediaScanVerdict` accepts only POST requests with a body no larger than 16 KiB, a configured provider name, and an HMAC-SHA256 signature in `x-mawadda-scanner-signature`. The secret must be at least 32 characters and supplied through a managed secret/environment configuration, never committed.
- The callback binds the verdict to media ID, configured provider, exact Storage generation, SHA-256 of the server-read object bytes, verdict and a scan timestamp no older than ten minutes. Asset approval and its audit event are committed atomically.
- A clean verdict changes the record to `security_approved`; malicious changes it to `rejected` and the exact generation is deleted; scanner error leaves the record quarantined.
- **Important:** the gateway receiver and its cryptographic verification are implemented, but no external malware-scanning provider/service has been provisioned or connected to invoke it. Therefore no actual malware scan has been completed and no file may be treated as security-approved until a trusted scanner is deployed, configured, and tested end-to-end. A scanner gateway should use an isolated workload, current malware signatures, bounded decompression, archive-bomb protections, type-aware parsers, and safe re-encoding/CDR where appropriate.

## Real HTTP signed URL test

Run only against a dedicated, disposable non-production bucket with application-default credentials:

```sh
cd functions
MAWDA_MEDIA_SIGNED_URL_HTTP_TEST=1 \
GOOGLE_CLOUD_PROJECT=your-nonproduction-project \
MAWDA_MEDIA_TEST_BUCKET=your-nonproduction-bucket \
npm run test:media-signed-urls-http
```

The test performs a real HTTP signed PUT, verifies replay/create-only rejection (412), downloads and compares bytes through a signed GET, waits for expiry and verifies the expired GET is denied, then deletes its uniquely named test object. It refuses the known production project ID and bucket names containing `prod`. This opt-in test has not yet been run because no non-production bucket credentials/configuration have been supplied in this environment.

## Remaining release gates

- Connect and verify a real trusted scanner and safe processing pipeline; include clean, malicious, timeout, invalid-HMAC, stale-verdict, generation-race and retry/dead-letter tests.
- Enforce maximum transfer size at the HTTP transport boundary, not only after upload. Validate CORS against the actual non-production bucket.
- Harden cleanup with exact-generation deletion, retry/reconciliation tests and orphan detection.
- Define owner-approved retention, export, legal-hold, deletion and backup-expiry policy before enabling destructive retention jobs.
- Test owner preview authorization, revoked tokens, stale MFA, content-type rejection, no-store headers, streaming failures and audit failure behavior.
- Run the real HTTP signed URL test, emulator suites, Flutter regression tests and device/browser tests against the exact candidate commit.

No production Firebase data, rules, bucket configuration, or deployment has been changed. No merge or production release is authorized by this implementation work.
