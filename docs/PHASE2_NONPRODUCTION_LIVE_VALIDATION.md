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

It requires object versioning to be enabled so the test can prove that two writes create two distinct retained generations. It also verifies uniform bucket-level access and public access prevention, rejects soft-delete or bucket-retention policies that would prevent the expected permanent deletion, deletes each exact generation with a generation precondition, and confirms that no versions remain. The project and bucket names must each contain one of: `test`, `staging`, `dev`, `demo`, `nonprod`, or `sandbox` (and must not contain `prod`/`production`).

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


## GitHub Actions live validation (manual, non-production only)

A manually gated workflow is available at `.github/workflows/live-nonproduction-validation.yml`. It runs the two live scripts against an already provisioned environment; it does **not** deploy Firebase Functions or Cloud Run and does not create cloud infrastructure.

Before dispatching it:

1. Create/protect the GitHub Environment named `mawda-nonproduction`; require an authorized reviewer if the repository plan/settings support environment approvals.
2. Add these non-secret environment variables to that environment:
   - `MAWDA_NONPROD_WIF_PROVIDER`: full Workload Identity Provider resource name.
   - `MAWDA_NONPROD_SERVICE_ACCOUNT`: dedicated test operator service-account email.
3. Configure Workload Identity Federation to trust only this repository and the intended workflow/ref. Do not use a downloadable service-account key.
4. Grant the operator identity only the permissions needed for this test: Firestore fixture read/write/delete in the non-production project and object metadata/read/write/delete on the dedicated test bucket. Do not grant project Owner or Editor.
5. Provision the private Cloud Run scanner and deploy the Firebase Functions from the exact commit being validated. Confirm Cloud Run IAM grants invocation only to the Functions runtime identity, not `allUsers`.
6. Bind the scanner and Functions secrets from Secret Manager / Firebase secret parameters. Confirm the values are matching per environment without printing or copying their values. The scanner token and HMAC secret must be independently generated, at least 32 characters, and never stored in GitHub variables.
7. Confirm the test bucket contains no member data and is intentionally configured for this test: object versioning enabled, uniform bucket-level access enabled, public access prevention enforced, and no soft-delete or bucket-retention policy that blocks permanent deletion of test objects.

Then use Actions → **Live non-production media and retention validation** → Run workflow. Supply the exact project and bucket names and type `RUN-NONPRODUCTION-LIVE-VALIDATION`. The workflow rejects unmarked or production-like names, uses GitHub OIDC / Workload Identity Federation, compiles Functions, runs the scanner E2E first, and then performs the destructive exact-generation GCS proof. A successful workflow proves the live test path for that commit and those supplied non-production resources; it does not prove production readiness.

## Backup, point-in-time recovery, IAM and audit evidence

These checks are deliberately read-only and must be completed separately from the destructive GCS fixture test. Record only configuration state and resource identifiers; never paste secret values, access tokens, signed URLs, or member content into evidence.

- Firestore: verify Point-in-Time Recovery (PITR) is enabled where required, verify a scheduled backup policy exists, record the latest successful backup timestamp and retention period, and confirm a restore has been rehearsed in a separate non-production project. A configured backup schedule alone is not proof that a restore works.
- Cloud Storage: document object versioning, soft-delete policy, retention policy/lock, lifecycle rules, bucket IAM, uniform bucket-level access and public access prevention. Resolve any conflict between backup/retention requirements and the four-hour chat-media deletion policy before production rollout; do not silently disable a legal or compliance retention control.
- Cloud Run: inspect the deployed service identity and IAM policy. The scanner must require authenticated invocation and must not grant `allUsers` or `allAuthenticatedUsers` access. Only the intended Functions runtime identity should invoke `/scan`.
- Functions and secrets: verify the deployed Functions use the expected non-production bucket, scanner URL, callback URL and provider. Verify secret bindings exist for both API token and HMAC secret; inspect secret versions/rotation metadata without exposing secret payloads. Confirm the callback signature is verified and invalid/missing signatures fail closed.
- Audit: verify Cloud Audit Logs configuration includes the required Data Access coverage for Firestore and Cloud Storage, the relevant logs are routed to an access-controlled sink/bucket, retention meets the approved policy, and alerting exists for scanner failures, stale signatures, repeated callback failures, retention retries and denied IAM calls. Avoid logging credentials, signed URLs or private message/media contents.
- Retention and legal holds: verify the four-hour chat-media and seven-day chat-text policies, tombstone/late-upload replay cleanup, legal-hold suspension and release behavior, and operational audit expiry. A legal hold must preserve the protected asset until authorized release without exposing it to members after its normal visibility expiry.
- Recovery: record the owner for backup monitoring, restore approval, incident response and secret rotation. Perform a restore drill only into a separate non-production project; never restore over live member data as part of this phase validation.

Useful read-only inspection commands (run with an authorized operator identity and the correct non-production project; review output before sharing):

```sh
gcloud firestore databases describe --database='(default)' --project="$GOOGLE_CLOUD_PROJECT"
gcloud firestore backups schedules list --database='(default)' --project="$GOOGLE_CLOUD_PROJECT"
gcloud logging sinks list --project="$GOOGLE_CLOUD_PROJECT"
gcloud projects get-iam-policy "$GOOGLE_CLOUD_PROJECT" --format='yaml(auditConfigs)'
gcloud run services get-iam-policy "$SCANNER_SERVICE" --region="$SCANNER_REGION" --project="$GOOGLE_CLOUD_PROJECT"
gcloud run services describe "$SCANNER_SERVICE" --region="$SCANNER_REGION" --project="$GOOGLE_CLOUD_PROJECT" --format='yaml(status.url,spec.template.spec.serviceAccountName)'
```

The evidence template in `docs/PHASE2_LIVE_VALIDATION_EVIDENCE_TEMPLATE.md` is the record of completion. Do not mark a check passed without an observed command/workflow result and timestamp.
