# Phase 2 — Non-production live validation runbook

## Purpose and current CI boundary

The required CI lane validates Flutter analysis/tests/Web compilation, Cloud Functions compilation/unit tests, Firebase Emulator integration and rules tests, and the ClamAV container's EICAR detection. The CI job also syntax-checks the live scanner E2E script; **it does not deploy Cloud Run or call a live Firebase/Cloud Storage project**.

A green CI run is therefore necessary but is not proof that the deployed Functions → private Cloud Run scanner → signed callback → Cloud Storage lifecycle works end to end.

## Hard safety boundary

Run the live checks only against a dedicated non-production Firebase project and a dedicated non-production bucket.

Both scripts refuse production-like or unmarked project/bucket names. Do not weaken or bypass these checks. The live scanner E2E creates temporary Firestore documents and Storage objects, deliberately replays a still-valid signed upload URL to test tombstone cleanup, and removes its own fixtures. The GCS retention test creates multiple object generations and permanently deletes those test generations.

Never point either script at `mawda-app-2026`, a production bucket, or any bucket containing member data. Never use a bucket with retention lock, soft-delete retention, or other policy that prevents the intended test cleanup.

## Live scanner E2E prerequisites

Configure a dedicated non-production environment with:

- Firebase Functions deployed from the validated development commit.
- A private Cloud Run scanner service built from `scanner/`, with authenticated invocation required (no unauthenticated access).
- The Functions runtime service identity permitted to invoke that Cloud Run service and to access the dedicated test bucket and required Firestore collections.
- Scanner runtime configuration: `SCANNER_API_TOKEN`, `SCANNER_HMAC_SECRET`, `GCS_BUCKET`, `SCANNER_CALLBACK_URL`, and `SCANNER_PROVIDER`.
- Functions configuration: `MAWDA_MEDIA_SCANNER_API_TOKEN`, `MAWDA_MEDIA_SCANNER_HMAC_SECRET`, `MAWDA_MEDIA_BUCKET_NAME`, `MAWDA_MEDIA_SCANNER_URL`, `MAWDA_MEDIA_SCANNER_CALLBACK_URL`, and the same provider identifier.
- A recent ClamAV signature database. The service must fail closed when signatures are stale.
- An operator identity with Application Default Credentials that can create/read/delete the test fixture documents and create/read/delete exact object generations in the dedicated test bucket.

Keep API tokens and HMAC secrets in Secret Manager / Firebase secret parameters. Do not place secret values in source, command history, logs, issue comments, or this document. Use a strong independent random secret for each environment.

## Execute the live scanner check

From the repository root, after selecting the non-production project and authenticating with Application Default Credentials:

```sh
cd functions
MAWDA_MEDIA_LIVE_SCANNER_E2E=1 \
GOOGLE_CLOUD_PROJECT=<non-production-project-id> \
MAWDA_MEDIA_TEST_BUCKET=<non-production-bucket-name> \
npm run test:media-scanner-live-e2e
```

The script exercises a clean PNG and an EICAR-bearing PNG, waits for the corresponding approved/rejected state, checks derivative provenance and generation, verifies rejected-object cleanup, verifies message-media deletion, replays the original create-only signed upload capability against the tombstone, and checks the late-replay cleanup audit.

A pass must end with:
`Live Firebase Functions → private Cloud Run ClamAV → signed callback E2E passed.`

If it times out or fails, preserve the sanitized error and relevant Cloud Run / Functions logs. Do not manually change production configuration to make the test pass.

## Execute the non-production GCS retention check

This test is intentionally destructive to its uniquely named temporary object and all generations of that exact object. Run it only on the dedicated test bucket:

```sh
cd functions
MAWDA_RETENTION_GCS_TEST=1 \
GOOGLE_CLOUD_PROJECT=<non-production-project-id> \
MAWDA_MEDIA_TEST_BUCKET=<non-production-bucket-name> \
npm run test:retention-gcs
```

It verifies uniform bucket-level access and public access prevention, rejects soft-delete or bucket-retention policies that would prevent the expected permanent deletion, creates and enumerates object generations, deletes each exact generation with a generation precondition, and confirms that no versions remain.

## Phase 2 evidence required before closure

Record the commit SHA, non-production project and bucket identifiers (never credentials), run URLs, timestamps, and outcomes for:

- [ ] CI: Flutter analyze, Flutter tests, Flutter Web release build.
- [ ] CI: Functions compile/unit tests and every Emulator integration suite.
- [ ] CI: Firestore and Storage rules tests.
- [ ] CI: scanner source/security tests, container build, and EICAR detection.
- [ ] Live non-production scanner E2E: clean approval, malicious rejection, derivative provenance, callback authentication, exact-generation deletion, late signed-URL replay cleanup, and audit record.
- [ ] Live non-production GCS retention check: bucket access controls and exact-generation permanent deletion.
- [ ] Operational review: Cloud Run IAM, secret bindings, signature freshness/alerting, retry behavior, logs, monitoring, backup/PITR implications, and legal-hold behavior.
- [ ] Security review of client access paths: only approved derivatives are readable; quarantine originals remain private; signed read capabilities are short-lived.

A green emulator suite does not replace the live non-production checks. A green live check does not authorize production deployment. Production rollout requires a separate explicit approval and a reviewed deployment plan.
