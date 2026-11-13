# Phase 2 media security — validation and closure progress

Snapshot: 2026-11-13  
Status: **NOT CLOSED — non-production end-to-end and governance gates remain**

## Verified green CI

The current development line passed the complete validation workflow on code commit `45b707eee0f765af9ccf260753622fada47a753f`:

- Workflow run: [43379943559](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379943559)
- Flutter job: `flutter analyze`, `flutter test`, and `flutter build web --release` all succeeded; validated web artifact uploaded.
- Functions job: TypeScript build/compilation and unit tests succeeded; media callable authorization/audit integration tests succeeded; Firestore and Storage rules emulator tests succeeded.
- Scanner job: scanner source/security tests succeeded; isolated ClamAV image built; EICAR test signature was detected successfully.

The preceding run [43379722894](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43379722894) failed on a test that sent a V4 signed HTTP PUT directly to the Storage Emulator. The emulator returned HTTP 501 because it does not implement that signed HTTP endpoint. The integration test was corrected to use the supported Admin Storage API for emulator object creation with a create-only generation precondition, then exercise callable finalization. The test no longer represents emulator traffic as real signed HTTP verification.

## Implemented and verified foundations

- Authenticated, short-lived, object-scoped upload intents with exact content type/size binding and create-only generation precondition.
- Server finalization validates uploader ownership, object metadata, byte count, generation, allowlisted MIME and file signature.
- Server-side member/anonymous-guest classification; client-supplied uploader labels are not trusted.
- Sole-owner + recent-MFA checks for owner media listing/inspection, bounded pagination, audit of successful and denied privileged operations.
- Safe image preview is limited to a server-verified WebP derivative; UI does not render original quarantine bytes.
- Scanner callback checks HMAC, provider, freshness, source generation and full-object hash; fail-closed states remain quarantined.
- Cleanup is limited to expired unfinished upload intents, grace period, exact object generation and transactional quota handling.
- Media client access remains deny-all in Firestore/Storage rules.
- Owner console has paginated media listing/filtering, safe-preview action and owner-review audit-chain verification control.

## Outstanding release gates

1. **Real Cloud Storage HTTP:** run `functions/scripts/test-signed-urls-http.cjs` against a dedicated disposable non-production bucket. Verify initial signed PUT, create-only replay rejection, exact size rejection, signed GET and expired upload/read URLs. The emulator is not proof of these HTTP semantics.
2. **Actual Firebase + Cloud Run scanner lifecycle:** deploy the scanner only to a dedicated non-production project with Cloud Run IAM authentication, Secret Manager, least-privilege service accounts and bucket permissions. Exercise clean and EICAR files plus malformed/oversized files, timeout, unavailable/stale signatures, stale generation, bad HMAC, duplicate callback, retry/restart, derivative generation and Firebase verdict handling. CI image build/EICAR proves container behavior, not a deployed end-to-end scan.
3. **Audit export and retention:** implement and test owner/MFA-protected, bounded/paginated export for media audit and owner-review chain evidence; include integrity verification, export audit event, secure handling, backup/restore and tamper-evidence. Define separate retention and legal-hold controls for media, metadata, operational logs and audit evidence.
4. **Purpose-based media retention:** exact periods, deletion request workflow, exceptions, legal holds, backup/cache treatment and authority need owner approval and jurisdiction-specific legal review. Finalized media deletion remains disabled; audit TTL/deletion remains disabled.
5. **PR reconciliation:** PR #3 is divergent from the current development line. Do not merge it wholesale. Cherry-pick/reimplement only reviewed unique changes, then run all checks on one exact candidate commit.
6. **Final closure:** update this record with real infrastructure evidence, owner-approved retention schedule, export verification, and green CI on the exact final candidate. Only then mark Phase 2 closed.

## Retention safety defaults currently enforced

- Unfinished upload intents may be cleaned only after signed capability expiry plus grace period and the missing-object recheck.
- Finalized media retains `retentionPolicyStatus: owner_approval_required` and `retentionExpiresAt: null`.
- No automatic deletion of finalized media and no TTL deletion of audit evidence.
- No production bucket, production rules, production Firebase data, merge to `main`, or production deployment was changed by this work.

## Owner decision / infrastructure tracking

See [issue #4](https://github.com/productionhome2022-hash/mawda-platform/issues/4) for the non-production provisioning checklist, real-GCS execution gate, audit export requirements and proposed purpose-based retention schedule awaiting owner/legal review.

## Current PR boundary

- PR #2 remains a draft against `main`; its latest code-validation head above is green, but the non-production and governance gates are not complete.
- PR #3 remains a draft targeting the development branch and is divergent; it must not be merged wholesale.
