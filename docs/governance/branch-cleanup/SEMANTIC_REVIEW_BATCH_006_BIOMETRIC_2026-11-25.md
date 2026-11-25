# Semantic review batch 006 — biometric media purpose, audit and lifecycle
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned Full Platform HEAD before this report: 3bc690a72fc5f71884b04394e532ec0c09b3146a
Scope: unique UNMATCHED candidates 49–60 (12 commits).
Relevant inspected Full Platform blobs: media-security.ts 92fb52d9a99279d3dcd83a9382932d6b13ac3107; biometric-lifecycle.ts 9b78166147187ef6fa7357538a64703d88ac116d; biometric integration test 20f19857a11713f9bc935cc9aa7f0c706a99758b.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 1379648ccff1ba0281cc64622477a09532cd2247 | Add request-bound biometric media purpose | media-security.ts recognizes biometric purpose, restricts it to member audio/video, requires a UUID biometricRequestId and rejects that field for other purposes. | Present |
| 111aeccdccc17e0c67a0f33acf92861eafe49b59 | Retry failed expired-upload deletion before closing request | Current deleteEvidence catches failures, leaves evidenceDeletionStatus pending with retry time/error, and scheduled cleanup retries both pending and retry_required. | Present in updated media-pipeline lifecycle |
| 67a231e62b634b05f6179400a1daebdf25673b5e | Export scheduled cleanup of expired biometric uploads | The historical direct-Storage cleanup export is not active in the current index. Expiry of empty intents is handled transactionally on member retry; media-backed upload TTL and quarantine cleanup belong to the unified media pipeline. | Superseded; do not restore legacy scheduler export |
| 31ac3ebe52c0dd71fadbeb62b7bfb4705e749058 | Add scheduled expiry of abandoned direct-upload intents | The current lifecycle supersedes direct biometric Storage paths with request-bound media upload intents and transactional empty-intent expiry. The historical scheduled sweep must not be restored. | Superseded |
| 623b50c42d708346095490653cf8b358fca29a0e | Read audit-chain head before transactional writes | Current biometric decision transaction reads auditHeadSnapshot alongside request/member/ledger/playback records and passes that snapshot to appendAuditInTransaction before writes. | Present |
| 98291571dbf55f0ff455a48e673795bd49eaa4e6 | Preserve append-only audit records in emulator cleanup | Current biometric integration cleanup deletes only transient member/request/media fixtures and does not delete verificationAuditLogs or adminAuditLogs. | Present |
| 8544f2584e7f3904ccd74552c348be3b4ff9372a | Test playback, concurrent decisions and three-rejection closure | Current integration tests cover member playback denial, owner playback, emulator-only URLs, exactly one winner for concurrent decisions, calendar-month retry eligibility, and permanent closure after third rejection. | Present |
| 15de12a98e7605bd525afbe8608755c16fb48d9d | Align phrase configuration rule with owner approval | The source branch tip contains this final policy amendment. Full Platform previously retained the contradictory separate-configuration clause despite the owner-approved phrase/version already being implemented. Replaced only that clause with the source branch's final owner-approved wording in the policy document. | Unique documentation change transferred |
| 256e8a59b71d1cf2cff9ab4a032256c357fe6a86 | Isolate Storage emulator from production URL signing | Current signedUrl returns the emulator-only URL when FIREBASE_STORAGE_EMULATOR_HOST is set and uses signed V4 URLs otherwise; integration tests assert the emulator-only marker. | Present |
| 7f06b2911782f11d1663de474e07563c68d4d0fa | Keep failed evidence deletions eligible for retry | Current deletion failure sets pending and retry timestamp; scheduler queries both pending and retry_required. | Present |
| e481e9b45f55ab53f5561d5636007f8890b499e9 | Exercise private upload validation and owner reward flow | Current integration suite covers consent, evidence validation, owner-only review, exactly-once 1,500 reward, invalid-duration rejection, retries and cleanup. | Present in evolved test suite |
| d151651f994d55f6754969c86aaef036affdbff8 | Add private evidence submission and owner review lifecycle | Current biometric-lifecycle.ts implements member request, request-bound media assets, scanner validation, owner authorization/playback, transactional decisions, audit chain, reward ledger and deletion retry. Current implementation is materially evolved from the initial commit. | Present, extensively evolved |

## Transfer record
- Transferred exactly one documentation-only delta: the owner-approved phrase policy clause from source branch commit 15de12a98e7605bd525afbe8608755c16fb48d9d.
- Full Platform policy file now records the exact owner-supplied phrase as version `owner-approved-2026-11-20-v1`, and requires a new owner-approved version for any future wording change.
- Target commit: 2d5309ea139160daa08265264446e6c22b2cca99.
- Read-back confirmed the updated policy blob SHA: 5059f415afe25f00901c735b5fcf6c4116808215.
- No code, production resources, Firebase configuration, or retention behavior was changed.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present or superseded: 11.
- Unique documentation change transferred: 1.
- Unique missing code changes confirmed: 0.
- Tests executed during this review: 0; this batch included a documentation-only transfer and source/test inspection.
- No CI success is claimed.

## Safety decision
Do not restore the historical direct-Storage expiry scheduler; the unified media pipeline owns media-backed upload lifecycle and the current server transaction expires empty intents. Continue with candidates 73–84.