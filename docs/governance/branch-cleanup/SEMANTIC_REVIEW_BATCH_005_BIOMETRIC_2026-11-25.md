# Semantic review batch 005 — biometric media/scanner controls
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 25–36 (12 commits), previously left pending while batches 003 and 004 were reviewed.
Full Platform biometric lifecycle SHA inspected: 9b78166147187ef6fa7357538a64703d88ac116d
Full Platform media service SHA inspected: c2f6891afece8200e550e3eaa89ccf73452558c5
Full Platform scanner processor SHA inspected: 8017e6a100abc611524a0d449ea96c1e031aca9b
Recovery biometric lifecycle and scanner processor matched the inspected Full Platform blobs; Recovery media service has a different blob and was separately inspected for the relevant logic.

## Candidate dispositions

| Candidate SHA | Change | Current evidence | Disposition |
|---|---|---|---|
| 64db462f4993dd2a402acb8f35b3164041c174bd | Configure Admin Storage SDK emulator before import | Current biometric and media integration test files set STORAGE_EMULATOR_HOST from FIREBASE_STORAGE_EMULATOR_HOST before importing the Admin Storage SDK. | Present |
| 11af0f1289dc65cfe77d328606b2a6e7ec351228 | Permit retry after expired biometric upload intents | Current media upload intent transaction allows previous asset states rejected, manually_deleted and expired; the biometric lifecycle also treats expired as replaceable. | Present |
| df2c4378f607b04a18bcb74bb80dc4251d9faae7 | Isolate biometric evidence from generic owner inspection routes | Current functions/src/media.ts denies biometric assets from generic safe-preview, owner stream and preview endpoints, writes denied-access audit events, and requires the dedicated biometric review path. | Present |
| 7c5352bdcbfaacbfb35a00e798f0654d53f5fb08 | Refresh biometric implementation-gap document with exact phrase and scanner integration | The current gap document has evolved to a later implementation checkpoint; the exact phrase is present in the implementation constant and unit tests, while the final policy specifies separate owner-controlled phrase configuration and does not embed the literal phrase. Reapplying the historical text would overwrite current status and risk duplicating the phrase/configuration conflict. | Historical documentation superseded; do not port as-is |
| 7c025aa2ab68f2d4273c9b139add08f84f582869 | Isolate biometric upload intent test fixtures | Current media integration test uses randomUUID-based unique request/member IDs and cleans created media records/objects. | Present in updated form |
| 7012b36b1a3b5178b424232335c14f1415252f2d | Verify biometric upload intents are request-bound | Current media integration test verifies one audio and one video asset are bound to the open member request, their media records carry biometricRequestId, and a duplicate same-kind upload is rejected. | Present |
| 2b6bb3f63251b626f426c51cbd31b8ef5cb2c2b4 | Test exact biometric video duration boundaries | Current scanner processor tests verify 3s and 5s accepted and 2.999s/5.001s rejected, plus chat's separate 90s limit. | Present |
| d8b0091b590755ca4b0da85389da0bf25d3e62ef | Centralize purpose-specific video duration policy | Current scanner processor exports videoDurationAllowedForPurpose and uses it during processing; biometric duration is 3–5 seconds inclusive. | Present |
| 211cc73d559b9721dcde7846e2c9b742f1180195 | Verify biometric purpose permits only audio and video | Current scanner security test accepts biometric audio/mp4 and video/mp4 and rejects image/png under biometric purpose. | Present |
| 5f2c6af4ef44184166d8616f218ddce0205e7722 | Test biometric voice in 60-second audio limit | Current scanner test and processor still allow 60 seconds for biometric audio processing. This conflicts with the final owner-approved biometric evidence policy's 20-second server-side maximum, although the authoritative biometric lifecycle rejects evidence over 20 seconds. | Present but policy-misaligned; do not treat as approved evidence allowance |
| 0b4c45445bb726f7faffc2bd4d1780585e1f15e7 | Enforce 3–5 second biometric video duration before transcoding | Current scanner enforces the biometric 3–5 second range through the shared duration policy helper. | Present |
| 9c07e1b3494594e0b43d74f1c686b35264d6e272 | Correct generation regex escaping | Current biometric lifecycle validates numeric storage generations with the corrected digit-only regex for safe derivatives. | Present |

## Cross-layer findings
1. The scanner still processes biometric audio up to 60 seconds, while the final owner-approved policy and authoritative biometric server validator cap evidence at 20 seconds. Server submission remains fail-closed at 20 seconds, but scanner work is unnecessarily allowed up to 60 seconds. This is a real policy-alignment issue; do not import the historical 60-second allowance as a policy decision. A controlled scanner tightening change and tests should be prepared separately against the approved 20-second policy.
2. The exact approved phrase exists in source constants and unit tests, but the final policy document describes owner-controlled configuration. This source-of-truth/configuration discrepancy remains open and must not be silently resolved by editing policy text during candidate triage.
3. Recovery media.ts differs at blob level from Full Platform media.ts; the relevant biometric safeguards were checked in both current trees, but a full-file equivalence claim is not made.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present or superseded by current implementation: 10.
- Historical documentation not safely portable: 1.
- Present but inconsistent with the stricter approved evidence limit: 1.
- Confirmed unique missing change safe to transfer: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
No historical code was transferred. Keep the 20-second biometric server limit authoritative. Track scanner duration alignment and phrase configuration as separate controlled issues. Continue with candidates 49–60.