# Semantic Review Batch 001 — Biometric lifecycle — 2026-11-25

## Scope and pinned source

- Repository: `productionhome2022-hash/mawda-platform`
- Candidate CSV blob: `296134e6de35b04304413a090469e79c3fb13388`
- CSV contains 12,227 appearances and 1,665 distinct SHAs classified `UNMATCHED`.
- First branch-ordered unique candidates reviewed: 12 commits from `codex/biometric-server-lifecycle-2026-11-20`.
- Source branch tip previously pinned: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`.
- Full Platform and Recovery had the same biometric lifecycle source blob at the previous recorded checkpoint: `9b78166147187ef6fa7357538a64703d88ac116d`. This proves identity of this file only.

## Exact current-file comparison

Fetched `functions/src/biometric-lifecycle.ts` from:
- Full Platform: blob `9b78166147187ef6fa7357538a64703d88ac116d`
- Recovery: blob `9b78166147187ef6fa7357538a64703d88ac116d`
- Biometric source branch: blob `6061cde87ef6b2220c39bcecc7d4f07ee21d6856`

The Full Platform and Recovery versions are byte-identical for this path at the fetched refs.

## Candidate classifications — first 12 unique SHAs

| SHA | Subject | Result |
|---|---|---|
| f79f146e96b9a4ae1210a1fcc37a861ebebcd294 | Require fresh owner evidence playback before acceptance | Present/semantically superseded in target; target requires valid playback grant and additionally enforces review acknowledgement and consent conditions. No port. |
| 15e53a0bc092355818ccd19070b31c5092957e61 | Allow rejection and evidence cleanup after member deletion | Present in target: missing member blocks acceptance, not rejection; closed-state update is guarded by member existence. No port. |
| d1e41e5edead6c4f001b383ac8ffab01053c367a | Allow Super Owner to reject stale identity submissions | Present in target: identity mismatch blocks acceptance but does not prevent rejection. No port. |
| 31cdb7f5b4d5d4471a768e56fdb0bc5425f7539b | Add member and Super Owner biometric media service calls | Present in target: member_media_upload_service.dart contains request creation, request-bound audio/video uploads, submit, owner inbox, playback and decision callables. No port. |
| 362bfd34705e2889cac7f21f13c75d16e2e9706b | Correct emulator host regex escaping | Present in target: signedUrl strips http/https scheme from FIREBASE_STORAGE_EMULATOR_HOST using the corrected regex. No port. |
| 7d756be26e129f8616ae38442c681247025b51e0 | Normalize emulator host in test-only playback URLs | Present in target: emulator host is normalized before test-only URL construction; the following candidate fixes the regex escaping. No port. |
| a1556702eecc331db332bb658b892971c8c2796e | Normalize playback generation regex | Present in target: owner playback validates digit-only safe derivative generations using the corrected regex. No port. |
| 3ce3165d17cbb56d3451080fcce7affb255aebb6 | Require ClamAV provenance for owner playback | Present in target: current file validates ClamAV engine, clean verdict, scanner timestamp, safe path, content type, generation and SHA-256. No port. |
| 2c304c0dce625e8d3f9b8c3a02a7274338509173 | Cover empty upload intent expiry without attempt penalty | Present in target: biometric integration test covers empty upload intent expiry after TTL and confirms attemptNumber remains 1. |
| d26931fb6373039a792146229615e506be9e3661 | Audit expired empty upload requests | Present in target: stale empty upload expiry creates biometric_upload_intent_expired audit record inside the Firestore transaction. |
| deeab0f65b19a42b8d4e3ffd8ea75243d6b10109 | Test media-pipeline request binding instead of raw Storage paths | Present in target: direct Storage path helper is removed; biometric evidence is routed through request-bound media upload intents and the test suite now asserts ledger identity rather than obsolete object paths. |
| 8930d9037259d301d946b9753738bc8e3b76ec76 | Remove obsolete direct Storage path helper | Present in target: biometricEvidenceObjectPaths is absent from biometric-evidence.ts; current service and server use media pipeline paths. |

## Important semantic finding

The target implementation is not simply missing the first candidate's playback gate. It requires a reviewer playback grant, checks its expiry and evidence hashes, checks consumption, and requires review acknowledgement and consent conditions. The target applies the grant check to both accepted and rejected decisions, while the source candidate only gates acceptance. Therefore, copying the source patch would weaken or alter target behavior and is explicitly rejected.

## Batch decision

- Confirmed missing code changes in this 12-SHA batch: **0**
- Confirmed already-present/semantically superseded changes: **12**
- Remaining unclassified: **0**
- Code transferred: **none**
- Tests run: **none**
- No branch ref moved; no PR merged; no production or Firebase resources changed.

## Remaining work

This is a checkpoint, not completion of the 1,665-SHA review. Continue by examining the remaining 1,653 unique SHAs in bounded batches, following each candidate's complete source-branch ancestry and later superseding commits, comparing every changed path against both Recovery history and Full Platform, and inspecting associated tests/workflows. Only a fully evidenced unique missing change may enter a transfer batch. Run tests in an actual execution environment or obtain CI evidence for the resulting exact SHA before proceeding.
