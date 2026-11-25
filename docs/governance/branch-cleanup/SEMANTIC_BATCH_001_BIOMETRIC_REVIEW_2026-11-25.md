# Semantic Review — Candidate Batch 001 (Biometric Branch)

## Scope and pinned inputs

- Candidate source branch: `codex/biometric-server-lifecycle-2026-11-20`
- Candidate tip SHA: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`
- Candidate set: first 20 distinct UNMATCHED SHAs in the recovered CSV's deterministic row order.
- CSV blob: `296134e6de35b04304413a090469e79c3fb13388`
- Full Platform branch: `codex/mawda-full-platform-implementation`, latest documented ref at start of this review `aa3ef0bece6cb4c3220166d5b8292ce6afa1f275`.
- Recovery branch: `codex/mawda-recovery-integration-2026-11-21`, pinned tip `49b502638718e4dbb29a9429f392b3a70c8d6d95`.

The 20 candidate commits were fetched with their actual GitHub diffs. Six relevant current files were fetched from both Full Platform and Recovery. The following blob IDs were identical on both refs:
- `functions/src/biometric-lifecycle.ts`: `9b78166147187ef6fa7357538a64703d88ac116d`
- `lib/services/member_media_upload_service.dart`: `a50dd700c7de3a202beee70fa9146071ee6e4358`
- `functions/src/biometric-evidence.ts`: `06a8191e70a5fbba71504d9bbe4958629c218721`
- `functions/test/integration/biometric-verification.integration.test.js`: `20f19857a11713f9bc935cc9aa7f0c706a99758b`
- `functions/test/biometric-evidence.test.js`: `2b5bd2cc49b86665b5600a20976d023042c7ff03`

`functions/src/index.ts` differs between Recovery and Full Platform (Full Platform blob `1af0f781ab1cf776b8db5c10d2ce0674b29f3233`; Recovery blob `f43ae308076bc4ca9fd6b640029dd012a205161e`). This path was not treated as identical.

## Candidate classification

| Candidate SHA (short) | Change | Classification | Evidence / reason |
|---|---|---|---|
| f79f146e | fresh owner playback grant before acceptance | Present already / exact wording differs | Current lifecycle file contains playback grants, reviewer binding, hashes, expiry and consumption guard. The candidate's exact Arabic error literal was not found; behavior needs test-level confirmation, but no blind port. |
| 15e53a0b | permit rejection after member deletion | Present already | Current lifecycle contains the conditional member-existence guard for acceptance and guards member updates on close. |
| d1e41e5e | allow rejection of stale identity | Present already | Current lifecycle contains decision-sensitive identity validation; rejection is not blocked solely by stale identity. |
| 31cdb7f5 | member/Super Owner biometric media service calls | Present already | Current Dart service contains start, upload audio/video, submit, and owner inbox/playback service methods. |
| 362bfd34 | emulator host regex escaping | Present already | Current lifecycle source contains the normalized emulator-host handling; no separate port justified. |
| 7d756be2 | normalize emulator host in playback URL | Present already | Same current lifecycle implementation; candidate is an earlier/superseded form of the normalization. |
| a1556702 | normalize playback generation regex | Present already | Current lifecycle source contains safe generation validation. |
| 3ce3165d | require ClamAV provenance for playback | Present already | Current lifecycle source contains ClamAV engine/verdict and scanner timestamp checks. |
| 2c304c0d | test empty upload-intent expiry | Present already | Current integration test includes empty upload-intent expiry and attempt-count behavior. |
| d26931fb | audit expired empty upload | Present already | Current lifecycle source contains the expired-intent audit action. |
| deeab0f6 | update biometric evidence unit test for media pipeline | Present already / test refactor | Current unit test asserts the request-bound reward-ledger identity and no longer tests the removed raw-path helper. |
| 8930d903 | remove obsolete direct Storage path helper | Present already / refactor | Current biometric evidence module no longer exports the raw Storage path helper. |
| fc7eb19e | audit successful owner inbox reads | Present already | Current lifecycle source contains successful inbox-read audit logging. |
| 6351e3b0 | remove expired-upload sweep export | Present already / superseded | Current lifecycle/index path does not expose the old sweep function. The current transactional expiration path supersedes the scheduled sweep. |
| a6dfa7df | replace scheduled sweep with transactional expiry | Present already | Current lifecycle contains the transactional expiry behavior; old scheduled sweep is absent. |
| 3fe4894d | expire empty intent on member retry | Present already | Current lifecycle includes transactional expiry of an abandoned empty upload intent before retry. |
| 300d2175 | verify safe derivatives before submission | Present already | Current lifecycle contains safe derivative metadata/generation/content-type checks. |
| dc5be1ad | verify derivative generation before owner playback | Present already | Current lifecycle contains generation, content type, and size validation for safe derivatives. |
| 62b9e67f | reject finalization after request closes | Unverified at test-assertion level | Relevant current integration file is byte-identical between Full Platform and Recovery; exact candidate assertion was not located by the initial literal scan. Requires focused surrounding-test inspection before final classification. |
| a919dda1 | audit request creation and rejected evidence | Present already | Current lifecycle source contains request-created and rejected-evidence audit actions. |

## Batch 001 decision

- No candidate in this first 20-commit batch has been certified as a unique missing product change.
- Most behaviors are present in both Full Platform and Recovery because the relevant files are byte-identical across those refs.
- One test assertion (62b9e67f) remains unverified and is not approved for transfer.
- No code was transferred.
- No tests were run, because no unique missing change was approved for a code batch.
- No branch ref was moved, no PR was merged, and no production/Firebase resource was changed.

## Required continuation

Continue in deterministic CSV order, fetching each commit diff, resolving its changed paths, comparing current Full Platform and Recovery blobs/content, and checking later/superseding commits on the source branch. Classify only with evidence. A candidate may be transferred only after its behavior and dependencies are proven absent from both target and complete Recovery history. The first actual transfer batch must be isolated, tested on its exact resulting SHA, and documented before the next batch.
