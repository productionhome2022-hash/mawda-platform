# Phase 2 — Live validation evidence record

> Use only for a dedicated non-production environment. Do not record secret values, tokens, signed URLs, member content, or personal data. A blank item is not a pass.

## Run identity

- Development branch:
- Validated commit SHA:
- GitHub Actions live workflow run URL:
- Operator / reviewer:
- Execution start (UTC):
- Execution end (UTC):
- Non-production project ID:
- Dedicated test bucket:
- Cloud Run scanner service / region:
- Firebase Functions region and deployed commit:

## Live scanner end-to-end

| Check | Result (PASS/FAIL/BLOCKED) | Evidence reference / sanitized note |
|---|---|---|
| Clean image uploaded and approved | | |
| EICAR-bearing image rejected | | |
| ClamAV signature database fresh | | |
| Scanner Cloud Run requires authentication | | |
| Only Functions runtime identity can invoke scanner | | |
| Callback HMAC valid signature accepted | | |
| Invalid/missing callback signature rejected | | |
| Derivative is WebP and provenance matches source generation/hash | | |
| Quarantined original remains private | | |
| Rejected object exact generation removed | | |
| Four-hour chat-media deletion path verified | | |
| Replayed create-only signed PUT URL cleaned after tombstone | | |
| Late replay cleanup audit record written | | |
| No secrets, signed URLs or member content in logs | | |

## GCS object generation and retention proof

| Check | Result (PASS/FAIL/BLOCKED) | Observed value / evidence |
|---|---|---|
| Object versioning enabled | | |
| Uniform bucket-level access enabled | | |
| Public access prevention enforced | | |
| Soft-delete policy compatible with required deletion | | |
| Bucket retention policy compatible with required deletion | | |
| Two distinct generations observed for exact fixture object | | |
| Each generation deleted with generation precondition | | |
| No generations remain for exact fixture object | | |
| Cleanup completed even after test failure | | |

## IAM, secrets, audit and recovery

| Review | Result (PASS/FAIL/BLOCKED) | Evidence reference / owner |
|---|---|---|
| Functions runtime identity least privilege | | |
| Cloud Run invoker restricted to Functions identity | | |
| No public scanner invocation | | |
| Secret Manager bindings present; values not disclosed | | |
| Secret rotation owner and process documented | | |
| Firestore PITR status recorded | | |
| Scheduled Firestore backup and latest success recorded | | |
| Restore rehearsal completed in isolated project | | |
| Cloud Audit Logs Data Access coverage verified | | |
| Log sink access and retention verified | | |
| Alerts for stale signatures, scanner failures and retention retries | | |
| Legal hold and release tests passed | | |
| Chat text seven-day and media four-hour retention verified | | |
| Incident response and backup owners assigned | | |

## Final disposition

- [ ] All required CI checks passed for the same commit.
- [ ] Live scanner E2E passed in the named non-production environment.
- [ ] Live GCS generation/retention proof passed in the named non-production bucket.
- [ ] IAM, secrets, audit, backup/PITR and restore evidence reviewed.
- [ ] Any failure or blocked item has an owner and remediation issue.
- [ ] No production deployment or production data mutation occurred.

**Decision:** OPEN / READY FOR FINAL REVIEW / NOT READY

**Reviewer notes:**

**Approval for production rollout:** separate explicit approval required; this record alone is not authorization.
