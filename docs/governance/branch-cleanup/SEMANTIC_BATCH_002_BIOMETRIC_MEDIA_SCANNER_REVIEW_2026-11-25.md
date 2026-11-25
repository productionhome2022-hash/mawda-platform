# Semantic Review — Candidate Batch 002 (Biometric Media and Scanner)

## Scope and evidence

- Source branch: `codex/biometric-server-lifecycle-2026-11-20`
- Source branch tip pinned: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`
- Candidates: distinct UNMATCHED rows 21–40 in CSV order.
- CSV blob: `296134e6de35b04304413a090469e79c3fb13388`
- Full Platform ref at start: `aa3ef0bece6cb4c3220166d5b8292ce6afa1f275`
- Recovery tip: `49b502638718e4dbb29a9429f392b3a70c8d6d95`

Fetched all 20 candidate commits and their diffs. Fetched the affected source/test files from both Full Platform and Recovery. The following paths are byte-identical across both refs:
- `functions/src/media-security.ts`: `92fb52d9a99279d3dcd83a9382932d6b13ac3107`
- `functions/test/integration/media-callables.integration.test.js`: `4e7be2b963cfd83d06b416f3c2e9a76f3424f112`
- `scanner/processors.js`: `8017e6a100abc611524a0d449ea96c1e031aca9b`
- `scanner/test/processors.test.js`: `a973734140d41fab1d36d8ce61d47766e330fb28`

Other inspected files also contain the candidate behaviors but have differing branch blob IDs in some cases:
- `functions/src/media.ts`: Full Platform `c2f6891afece8200e550e3eaa89ccf73452558c5`; Recovery `67f8cd8d64212647afff8b162847ecb8018d8b2f`.
- `functions/test/media-scanner.test.js`: Full Platform `d999fc00d4dcb9640b272b9acc74c2238516ef71`; Recovery `d2225d942a2eab1274f13dba4472ca0bf12de0e0`.
- `scanner/test/security.test.js`: Full Platform `f0650d6d4912fbf0b8c10afefaffc4522a59dec7`; Recovery `eb7062f3bb1da74128c8d33c9aa166201709d6b4`.

## Candidate classification

| Candidate SHA (short) | Change | Classification | Evidence / reason |
|---|---|---|---|
| a494dcce | ClamAV-approved biometric derivative scanner test | Present already | Current `functions/test/media-scanner.test.js` includes ClamAV-clean biometric derivative coverage. |
| cb6b33d8 | block retry until evidence deletion completes | Present already | Current biometric lifecycle contains the prior evidence-deletion completion guard. |
| 7f859e47 | fail closed on malformed wallet balance | Present already | Current lifecycle's acceptance path validates wallet balance as a safe nonnegative integer before reward credit. |
| 1fe85b67 | include biometric request ID in normalized media type | Present already | Current `media-security.ts` includes `biometricRequestId` in the normalized request contract. |
| 64db462f | configure Admin Storage emulator before import | Unverified / not approved | This is test harness initialization. Need inspect exact test module initialization order and CI environment before changing it; no evidence of a runtime product gap. |
| 11af0f12 | permit retry after expired biometric upload intent | Present already | Current media upload-intent logic treats expired prior assets as retryable. |
| df2c4378 | isolate biometric evidence from generic owner inspection routes | Present already | Current media routes explicitly deny biometric-purpose assets and audit denied preview/stream attempts. |
| 7c5352bd | refresh biometric implementation-gap document | Conflicting / documentation-only | Candidate rewrites a historical status note. Do not port documentation without reconciling it against current owner-approved policy and current implementation evidence. |
| 7c025aa2 | isolate biometric upload-intent fixtures | Present already / test hygiene | Current media integration test uses isolated request/member fixture identifiers and cleans up its own assets. |
| 7012b36b | test request-bound biometric upload intents | Present already | Current media integration test verifies audio/video media IDs bind to the request and rejects duplicate same-kind intent. |
| 2b6bb3f6 | test 3–5 second biometric video boundaries | Present already | Current scanner processor enforces the inclusive 3–5 second biometric video range; scanner test suite exists in both refs. |
| d8b0091b | centralize purpose-specific video duration policy | Present already | Current scanner processor uses a purpose-aware video duration predicate. |
| 211cc73d | test biometric purpose allows only audio/video | Present / likely equivalent | Current scanner validation and media scanner tests enforce biometric purpose and allowed media classes; exact test assertion requires focused test diff if this specific assertion is needed. |
| 5f2c6af4 | include biometric voice in 60-second audio limit | Present already | Current scanner processor's purpose-specific audio limit includes biometric voice. |
| 0b4c4544 | enforce 3–5 second biometric video before transcoding | Present already | Current scanner processor applies the 3–5 second rule before derivative processing. |
| 9c07e1b3 | correct generation regex escaping | Present already | Current lifecycle validates numeric safe derivative generations. |
| 3a80f0f4 | verify scanner source hashes and derivative provenance | Present already | Current lifecycle validates safe derivative provenance and compares source hashes against scanner hashes. |
| 9d56db5c | full owner review lifecycle integration tests | Present already / equivalent test suite | Current biometric integration test covers the owner review lifecycle and scanner-approved asset fixtures; exact coverage breadth should be maintained in future test audit. |
| 9baed24a | defer evidence cleanup to media quarantine lifecycle | Present already / superseded | Current lifecycle delegates evidence upload/expiry handling to the media pipeline and no longer performs the old direct-path cleanup. |
| e898e22b | restrict owner playback to ClamAV-safe derivatives | Present already | Current lifecycle verifies biometric request binding, media purpose, scanner approval, safe derivative paths and metadata before playback. |

## Batch 002 decision

- No candidate was certified as a unique missing product change.
- The reviewed runtime behavior is present in Full Platform and Recovery; several key files are byte-identical between the two branches.
- The emulator-test initialization candidate remains unverified and is not approved for transfer.
- The historical implementation-gap document is not copied because its contents need policy reconciliation.
- No code or documentation from this batch was transferred.
- No tests were run because no missing change was approved for a transfer batch.
- No branch ref, PR, production service, or Firebase resource was changed.

## Continuation

Proceed to candidates 41–60 in CSV order. Continue to inspect commit diffs, changed paths, Full Platform and Recovery content, later/superseding commits, and relevant tests. Do not transfer a candidate simply because its CSV classification is UNMATCHED.
