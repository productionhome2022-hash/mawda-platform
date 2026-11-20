# Super Owner biometric implementation status — 2026-11-20

> **Authority:** The final owner-approved policy is in [BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md](./BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md). It requires the exact spoken phrase, a 3–5 second video, canonical registration-gender matching, exclusive Super Owner manual review, three attempts with calendar-month waits, permanent closure after rejection three, and an immediate exactly-once 1,500 BetaCoins reward only on acceptance.

## Owner-supplied phrase
The exact phrase is: «أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.» It is versioned as `owner-approved-2026-11-20-v1`.

## Development implementation candidate
PR #85, branch `codex/biometric-server-lifecycle-2026-11-20`, is the development-only implementation candidate. It is intentionally Draft and has not been merged into the unified integration branch or deployed.

Implemented in the candidate:
- Member phrase retrieval and request creation; identity (full name, username, gender) is read from the canonical member record and rechecked before decision.
- The existing media upload pipeline is extended with a request-bound `biometric` purpose. Upload intents are linked to the open request and constrained to member audio/video only.
- Uploads remain in quarantine, pass through ClamAV, and require server-verified safe audio/video derivatives before the request can be submitted or played to the owner.
- Server-side checks bind object generation, scanner verdict/hash, original byte count and content signature; audio is capped at 5 MiB/60 seconds and video at 25 MiB/3–5 seconds.
- Super Owner-only inbox and one-minute safe-derivative playback URLs; playback attempts are appended to the owner audit chain.
- Super Owner decision uses a Firestore transaction for state transition, request status, owner audit-chain append, and exactly-once 1,500 BetaCoins credit through the member wallet ledger. Rejections award zero.
- First and second rejection use one-calendar-month retry gates; the third closes permanently. Accepted verification expires after one calendar month and can then be renewed as a new cycle.
- Evidence originals and safe derivatives are deleted after a final decision, with retryable cleanup and legal-hold protection. Abandoned requests without upload intents expire after the upload URL TTL.

## Remaining acceptance gates
- Exact-head Validate Mawda and Mawdda Domain Regression must both pass after the latest candidate changes; emulator tests must prove the full scanner-approved lifecycle, rejection calendar, third-attempt closure, concurrent decision idempotency, reward and deletion.
- Member Flutter upload/status/submission UI and Super Owner review/playback/decision UI are not yet connected to these callables.
- The 5,000-persona simulation has not yet been accepted against the final merged candidate SHA.
- Review Firestore/Storage rules and the final UI-to-callable contract before the PR can be marked Ready.
- No production deployment, live Storage change, Firebase resource change, or billing activation is authorized by this candidate.

Keep the live biometric privilege gate fail-closed until all acceptance gates are complete. This document records development progress; it is not production activation evidence.
