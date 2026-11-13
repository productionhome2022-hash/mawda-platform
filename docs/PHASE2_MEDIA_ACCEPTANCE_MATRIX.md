# Phase 2 media acceptance matrix

Status snapshot: 2026-11-13. This document is a release gate, not a claim that every gate has passed.

## Implemented in the development branch

- Server-issued, short-lived, object-scoped upload intents; create-only Storage generation precondition and exact declared-size binding.
- Server-side finalization checks ownership, MIME allowlist, byte count, object generation and leading-byte signature.
- Authenticated uploader classification: Firebase anonymous provider is guest; other authenticated providers are member. Client-supplied classification is ignored.
- Owner media listing is paginated and filtered by status/uploader type. Owner access requires the sole-owner claim and recent MFA.
- Safe owner image preview uses a server-verified, re-encoded WebP derivative and returns bounded bytes; original quarantine bytes are not rendered in the Flutter UI.
- Scanner callback validates HMAC, provider, freshness, object generation and full-object hash. Files fail closed while scanning or when evidence is missing/mismatched.
- Scanner dispatch and isolated ClamAV gateway source exist; malicious verdicts delete only the exact scanned generation.
- Abandoned upload cleanup is scoped to exact quarantine paths and observed Storage generations, with grace periods and transactional quota handling.
- Media access events are written to the server-only media audit collection. Privileged owner-review audit uses a separate hash-linked chain.

## Automated validation evidence

- The development branch has previously passed Flutter analysis, Flutter tests, Web release build, Functions compilation/unit tests, media callable integration tests, and Firestore/Storage emulator rules tests. See PR #3 workflow run 43378886210 for successful Flutter and Functions/emulator job steps; its scanner job was cancelled before completion.
- PR #2 latest validation at snapshot time is running on commit `cf6dddd57e76f1bec8da38a3cada6f486dbab4b8` (workflow run 43379041384). Do not treat an in-progress job as a pass.
- PR #3 latest validation at snapshot time is running on commit `34665027dfc7f1bec8da38a3cada6f486dbab4b8` (workflow run 43379061147). Do not treat an in-progress job as a pass.
- The opt-in real-GCS signed HTTP test has not been run because no dedicated non-production bucket credentials/configuration are available in this workflow context.

## Required release gates

| Gate | Required proof | Status |
|---|---|---|
| Owner authorization | Owner succeeds only with sole-owner claim and fresh MFA; stale MFA, non-owner and revoked sessions denied and audited | Emulator coverage exists; latest run must pass |
| Member/guest isolation | Member and anonymous guest cannot list, inspect, preview or read another uploader's media | Emulator coverage exists; latest run must pass |
| Upload integrity | Exact content type, byte count, signature and create-only generation; mismatch rejected and audited | Code and emulator coverage exist; real bucket HTTP run pending |
| Replay/expiry | First signed upload succeeds; replay rejected by generation precondition; expired URL rejected | Emulator coverage exists; real bucket HTTP run pending |
| Malware scan | Clean, EICAR/malicious, malformed, timeout, unavailable, stale, duplicate, tampered HMAC/hash/generation cases | Scanner unit/CI work in progress; non-production end-to-end run pending |
| Safe preview | Only sanitized derivative, bounded response, generation/hash/provenance rechecked | Code and Flutter owner UI exist; full image corpus/device validation pending |
| Cleanup | Grace period, exact path/generation deletion, missing-object recheck, retry and quota release | Code and unit/emulator coverage exist; latest run must pass |
| Audit | Upload, validation, listing, preview, denial and scan outcomes are server-written; no raw file bytes or signed URLs | Core event writes exist; export/retention controls remain pending |
| Retention | Purpose-specific schedule, legal hold, deletion authority, backup/cache treatment and appeal/export process approved and tested | Not approved; finalized-media deletion remains disabled |
| Infrastructure | Cloud Run IAM, least-privilege bucket access, Secret Manager rotation, callback URL, CORS, monitoring and retry/dead-letter handling | Source exists; non-production provisioning/verification pending |
| Storage/Firestore release | Rules tests pass; production rules remain deny-all for client media access | Emulator tests exist; no production mutation authorized |

## Retention safety policy

1. Unfinished upload intents are eligible for narrowly scoped cleanup only after the signed upload capability expires and the configured grace period elapses. Missing-object reservations receive a second check before release.
2. Finalized media is not automatically deleted until the owner approves purpose-specific retention periods and the applicable legal/privacy review is complete.
3. Audit records are append-only from client perspective and server-written. Do not set a TTL or delete audit evidence until an approved audit-retention schedule, export format, legal-hold behavior and recovery process exist.
4. Any future deletion job must support dry-run previews, exact object generations, idempotent batches, legal-hold exclusions, audit records and recoverability checks. It must never sweep an entire bucket prefix.
5. A successful malware verdict does not by itself authorize member delivery. Only types with a completed safe-processing pipeline may become eligible for delivery. Images use sanitized WebP derivatives; video, audio and PDF remain unavailable until type-specific processing is implemented.

## Merge and deployment boundary

PR #2 and PR #3 are separate draft proposals. PR #3's head is based on an older snapshot of the development branch and the refs currently diverge; do not merge either PR until the phase-2 changes are reconciled onto one current branch and the exact final commit has a green full CI run. No production Firebase mutation, production deployment, public Storage access or merge to `main` is authorized by this engineering record.
