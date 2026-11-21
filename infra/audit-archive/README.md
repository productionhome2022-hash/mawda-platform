# Mawdda immutable owner-audit archive

This Terraform module creates a dedicated, private Cloud Storage bucket for the
hash-chained owner-review audit export. It deliberately requires an explicit
GCP project, bucket name, runtime service account, and data-residency location;
there is no guessed region.

## Apply and irreversibly lock retention

1. Review the data-residency location, legal basis, access roles, and bucket name.
2. Apply this module with `retention_seconds = 64281600` or a longer period.
3. Verify the bucket metadata and retention period.
4. **Only after approval**, irreversibly lock the retention policy:

   ```bash
   gcloud storage buckets update gs://YOUR_BUCKET_NAME --lock-retention-period
   ```

5. Verify the lock:

   ```bash
   gcloud storage buckets describe gs://YOUR_BUCKET_NAME \
     --format="value(retentionPolicy.isLocked,retentionPolicy.retentionPeriod,iamConfiguration.publicAccessPrevention)"
   ```

The scheduled Cloud Function refuses to write unless the bucket reports
`retentionPolicy.isLocked=true`, at least 63,115,200 seconds of retention,
uniform bucket-level access, and public access prevention set to `enforced`.

## Function configuration

Set the Functions parameter values only after the bucket is locked:

- `MAWDA_AUDIT_ARCHIVE_ENABLED=true`
- `MAWDA_AUDIT_ARCHIVE_BUCKET=YOUR_BUCKET_NAME`

The runtime identity receives only object create/read and bucket metadata
permissions. It does not receive object delete, bucket update, or retention
policy mutation permissions.

## Archive behavior and limits

- Runs every 15 minutes and archives only owner-review chain events at least
  five minutes old.
- Verifies contiguous sequence numbers, previous hashes, and each event hash
  against the last archived sequence/hash before writing.
- Writes redacted JSONL with a SHA-256 manifest using a create-only generation
  precondition. Existing objects are accepted only when their archive hash
  matches exactly.
- Keeps Firestore source events intact; no source deletion or retention cleanup
  is performed by this worker.
- The owner-review hash chain has a dedicated chain-verifying exporter. A second
  worker archives `adminAuditLogs`, `verificationAuditLogs`,
  `profileFeatureAuditLogs`, `mediaAccessAudit`, `memberPrivacyAudit`,
  `memberProfileAudit`, `directMessageDeletionAudit`, `roomAuditLogs`, and
  `privacyAcknowledgements`. Each collection uses a separate cursor, lease,
  SHA-256 manifest and GCS-backed checkpoint.
- Terraform creates the retention policy but does not lock it automatically.
  Locking is irreversible and requires the explicit operator step above.

This repository change does not deploy the bucket, lock retention, set
production parameters, or prove a live GCS write/read/restore. Those remain
separate release-acceptance tasks.
