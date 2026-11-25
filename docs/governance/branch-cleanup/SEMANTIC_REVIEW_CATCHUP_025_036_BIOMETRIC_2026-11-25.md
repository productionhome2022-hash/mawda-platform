# Catch-up semantic review — candidates 25–36 — biometric and scanner
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 25–36. This range was skipped in the earlier sequential batches and is now explicitly reviewed.

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 64db462f4993dd2a402acb8f35b3164041c174bd | Configure Admin Storage SDK for emulator before import | Current biometric integration test sets STORAGE_EMULATOR_HOST from FIREBASE_STORAGE_EMULATOR_HOST before importing Firebase Admin Storage. | Already implemented |
| 11af0f1289dc65cfe77d328606b2a6e7ec351228 | Permit retry after expired biometric upload intent | Current functions/src/media.ts permits replacing same-kind media assets in rejected, manually_deleted or expired states; media cleanup owns expiry. | Already implemented |
| df2c4378f607b04a18bcb74bb80dc4251d9faae7 | Isolate biometric evidence from generic owner inspection routes | Current media preview/inspection handlers deny biometric-purpose assets, emit access audit outcomes and direct reviewers to the dedicated biometric review flow. | Already implemented, expanded |
| 7c5352bdcbfaacbfb35a00e798f0654d53f5fb08 | Refresh biometric implementation-gap documentation after scanner integration | Current implementation-gap document is substantially newer and records current implementation, known CI gates and cross-platform status; no stale historical patch was copied. | Superseded by current status document |
| 7c025aa2ab68f2d4273c9b139add08f84f582869 | Isolate biometric upload integration fixtures | Current media-callables integration fixtures use randomUUID-based unique IDs and isolated request/media records. | Already implemented |
| 7012b36b1a3b5178b424232335c14f1415252f2d | Verify biometric upload intents are request-bound | Current media-callables integration test binds one audio and one video asset to an open request and verifies the media asset request IDs. | Already implemented |
| 2b6bb3f63251b626f426c51cbd31b8ef5cb2c2b4 | Test exact biometric video duration boundaries | Current scanner unit tests cover inclusive 3s and 5s biometric video limits and reject 2.999s/5.001s. | Already implemented |
| d8b0091b590755ca4b0da85389da0bf25d3e62ef | Centralize purpose-specific video duration policy | Current scanner processors export and use videoDurationAllowedForPurpose; the helper enforces biometric 3–5s and general video ceiling. | Already implemented |
| 211cc73d559b9721dcde7846e2c9b742f1180195 | Test scanner biometric audio/video purpose allowlist | Current scanner security tests accept biometric audio/video and reject image media under biometric purpose. | Already implemented |
| 5f2c6af4ef44184166d8616f218ddce0205e7722 | Include biometric voice in the 60-second audio limit | The historical 60s scanner allowance conflicts with the final owner-approved 20s biometric evidence limit. Current server validation was already 20s; scanner and its unit assertion have now been tightened to 20s. | Historical allowance superseded; cross-layer mismatch corrected |
| 0b4c45445bb726f7faffc2bd4d1780585e1f15e7 | Enforce 3–5 second biometric video before transcoding | Current scanner processor calls the centralized purpose-specific video duration helper before transcoding. | Already implemented |
| 9c07e1b3494594e0b43d74f1c686b35264d6e272 | Correct biometric generation regex escaping | Current biometric lifecycle validates digit-only object generations with the corrected /^\\d+$/ pattern. | Already implemented |

## Changes made
- scanner/processors.js: biometric audio purpose maximum changed from 60 to 20 seconds; chat and room remain 60 seconds.
- scanner/test/processors.test.js: updated the biometric purpose assertion to 20 seconds. The 60-second live/chat/room policy remains unchanged.

## Verification
- Reviewed: 12/1,665 unique candidates in this catch-up range.
- Already implemented or superseded: 11.
- Policy alignment fix: 1 scanner implementation plus its unit assertion.
- Tests executed: 0. Scanner unit tests were updated but not run in this environment.
- No CI success is claimed.

## Safety decision
The 60-second biometric scanner allowance was not preserved because the authoritative owner policy limits biometric evidence audio to 20 seconds. This change does not alter the 60-second live audio recording limit for chat/rooms.