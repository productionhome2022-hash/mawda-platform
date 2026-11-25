# Semantic review supplement — biometric candidates 25–36
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned target HEAD before report: 65f6de5cf79686e44861910149de73259b46af5a
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Source branch: codex/biometric-server-lifecycle-2026-11-20
Scope: unique UNMATCHED candidates 25–36. These 12 candidates were missing from the numbered coverage of the earlier batch reports and are recorded here to close that gap.

## Candidate-by-candidate classification

| # | Candidate SHA | Change | Current Full Platform evidence | Result |
|---:|---|---|---|---|
| 25 | 64db462f4993dd2a402acb8f35b3164041c174bd | Force Admin Storage SDK onto emulator before import | functions/test/integration/biometric-verification.integration.test.js normalizes FIREBASE_STORAGE_EMULATOR_HOST and sets STORAGE_EMULATOR_HOST before importing Firebase Admin Storage | Present |
| 26 | 11af0f1289dc65cfe77d328606b2a6e7ec351228 | Permit retry after expired biometric upload intents | functions/src/media.ts allows replacement only when the prior same-kind asset is rejected, manually_deleted or expired; all active/in-flight states remain blocked | Present |
| 27 | df2c4378f607b04a18bcb74bb80dc4251d9faae7 | Isolate biometric evidence from generic owner inspection routes | Current media service denies generic preview/inspection/stream access for mediaPurpose=biometric and audits the denial with biometric-evidence-use-dedicated-review; dedicated biometric playback remains separate | Present |
| 28 | 7c5352bdcbfaacbfb35a00e798f0654d53f5fb08 | Refresh biometric implementation-gap document after scanner integration | Current BIOMETRIC_SUPER_OWNER_IMPLEMENTATION_GAPS_2026-11-20.md contains the owner-supplied exact phrase/version, the development implementation candidate reference, integrated media/scanner/review/reward details and outstanding validation requirements | Present |
| 29 | 7c025aa2ab68f2d4273c9b139add08f84f582869 | Isolate biometric upload-intent test fixtures | Current media-callables integration test uses randomUUID for both member UID and request ID and cleans its media assets, request and quota fixture | Present |
| 30 | 7012b36b1a3b5178b424232335c14f1415252f2d | Test request-bound biometric upload intents | Current media-callables integration test creates audio/video intents for an open member request, asserts both mediaAssets carry biometricRequestId, rejects a duplicate same-kind intent, and rejects finalization after request closure | Present |
| 31 | 2b6bb3f63251b626f426c51cbd31b8ef5cb2c2b4 | Test exact biometric video duration boundaries | scanner/test/processors.test.js checks 3s and 5s inclusive acceptance, and rejects 2.999s and 5.001s | Present |
| 32 | d8b0091b590755ca4b0da85389da0bf25d3e62ef | Centralize purpose-specific video duration policy | scanner/processors.js exports videoDurationAllowedForPurpose; biometric is 3–5 seconds and other supported video purposes use the shared 90-second cap | Present |
| 33 | 211cc73d559b9721dcde7846e2c9b742f1180195 | Verify scanner purpose permits only biometric audio/video | scanner security test accepts audio/mp4 and video/mp4 for biometric purpose and rejects image/png | Present |
| 34 | 5f2c6af4ef44184166d8616f218ddce0205e7722 | Include biometric voice in 60-second scanner audio limit | scanner/processors.js and scanner tests currently allow up to 60 seconds for biometric audio processing; authoritative biometric server validation and owner-approved policy remain stricter at 20 seconds | Present in scanner; cross-layer mismatch retained as separate finding |
| 35 | 0b4c45445bb726f7faffc2bd4d1780585e1f15e7 | Enforce 3–5 second biometric video duration before transcoding | Current scanner processor rejects biometric video outside 3–5 seconds before transcoding, using the centralized duration helper | Present |
| 36 | 9c07e1b3494594e0b43d74f1c686b35264d6e272 | Correct generation regex escaping | Current biometric lifecycle validates numeric safe derivative generations with /^\\d+$/ in the executable source representation (digit-only regex) | Present; corrected |

## Result
- Reviewed: 12/1,665 unique candidates (25–36).
- Already implemented or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0. Test definitions and implementation were inspected; no runner or emulator was invoked.
- No CI success is claimed.

## Cross-layer policy note
The scanner currently permits/transcodes biometric audio up to 60 seconds, while the authoritative biometric policy and server-side byte validation enforce 20 seconds. The scanner allowance does not permit server submission beyond 20 seconds, but it causes avoidable processing and a policy-layer mismatch. Do not import the historical 60-second allowance as the evidence policy. Aligning scanner processing to 20 seconds should be a separate minimal change after confirming the governing policy and validating scanner test coverage.

## Safety decision
No historical patch is transferred because all behaviors are present in the current target or superseded by its stricter server-side policy. No policy, production data, Firebase resources, main branch or deployment was changed.