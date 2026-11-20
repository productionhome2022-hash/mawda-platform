# Biometric verification gate — Super Owner manual-review contract

## Authority and current status

The authoritative policy is `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md`, recorded by merged PR #82. The PR #77 manual-review amendment is historical and superseded where it differs. The final contract requires a pre-established spoken phrase, a 3–5 second video, canonical registered-gender matching, exactly three attempts with one full calendar month between rejected attempts, permanent closure on the third rejection, and immediate exactly-once 1,500 BetaCoins on acceptance.

**Play Integrity, App Attest, device-key attestation and automated biometric classifiers are not prerequisites for the Super Owner's accept/reject decision.** They cannot replace the human review of the submitted voice sample and video.

The privilege gate remains **fail-closed**. The pure predicate below only recognizes a server-owned accepted-review record; it does not create that record, authorize a reviewer, or complete the review workflow. No callable currently writes this contract, so this change does not activate biometric verification or privileges.

## Server-owned accepted-review record

A trusted review service may write a `biometricVerification` lease only after:
- validating the authenticated Super Owner platform-owner claim and fresh MFA server-side;
- loading the canonical UID and immutable review request from Firestore;
- confirming that the request is pending and version-current;
- recording an explicit manual accept decision and append-only audit event;
- applying the independent one-calendar-month biometric renewal due date.

The resulting server-owned record must contain:
- `status = verified`;
- `verificationMethod = super_owner_manual_review`;
- `trustModel = server_authoritative_owner_decision`;
- `reviewerRole = super_owner`;
- `reviewerMfaVerified = true` and server timestamp `reviewerMfaAt`;
- `decision = accepted`;
- `reviewerUid` distinct from the member UID;
- stable `reviewRequestId`;
- server timestamps `acceptedAt` and future `expiresAt`;
- no `revokedAt`.

These fields are an internal trusted-writer contract, not proof that the callable or reviewer authorization already exists. Client writes must never set them. The helper checks record shape and lease timing only; the callable must enforce owner claim + MFA and persist the record transactionally.

## Still required before enabling privileges

1. Member submission with canonical identity snapshot and private audio/video evidence.
2. Super Owner-only inbox and private playback, with owner claim + fresh MFA on every review action.
3. Server-owned pending/accepted/rejected/closed state, three attempts, one-calendar-month waits after the first two rejections, and final closure after the third.
4. Version checks, transaction serialization, one-active-request enforcement, idempotency and append-only decision/access audit.
5. Exactly-once 1,500 BetaCoins credit in the central wallet ledger in the same atomic acceptance flow.
6. Independent monthly biometric renewal; email renewal remains independently every three calendar months.
7. Short-lived request-bound evidence access, revocation after decision, retryable deletion, and no media/biometric data in logs or analytics.
8. Emulator and security-rules tests for authorization, replay, concurrency, retry boundaries, renewal, reward exactly-once, access revocation and deletion.
9. Flutter UI and exact-head Functions/Firestore/Storage rules CI.

## Explicit boundaries

- The client OS prompt is not proof and cannot grant verification or rewards.
- Provider/device attestation is not required for the manual review decision and is not a substitute for it.
- Do not open privileges, grant rewards, deploy, mutate production Firebase, enable billing or run the 5,000-persona simulation under this change.
- Keep all biometric privileges disabled until every server-side acceptance gate above passes on the exact candidate SHA and the Owner separately authorizes release.
