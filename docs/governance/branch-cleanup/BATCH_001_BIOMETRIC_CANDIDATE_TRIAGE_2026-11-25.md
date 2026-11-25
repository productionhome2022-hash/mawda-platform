# Batch 001 — Biometric Candidate Semantic Triage — 2026-11-25

## Scope

This is the first inspected batch from the 1,665 unique SHA values classified as UNMATCHED in the recovered CSV. The batch contains the first eight unique commits in CSV order, all from `codex/biometric-server-lifecycle-2026-11-20`.

Pinned refs used:
- Full Platform branch tip at the initial inventory snapshot: `f9a686ddbb260a998825d046695a4fa817a99835`
- Recovery branch tip at the initial inventory snapshot: `49b502638718e4dbb29a9429f392b3a70c8d6d95`
- Source branch tip at the branch pinning snapshot: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`

The two latest versions fetched for `functions/src/biometric-lifecycle.ts` from Full Platform and Recovery had identical blob SHA:
`9b78166147187ef6fa7357538a64703d88ac116d`.

## Commit-by-commit evidence

| Candidate SHA | Change | Actual target-tree evidence | Classification |
|---|---|---|---|
| f79f146e96b9a4ae1210a1fcc37a861ebebcd294 | Fresh owner playback grant required before acceptance | Current shared biometric lifecycle file contains playback grant creation, reviewer/hash binding, expiry validation and consumed grant handling; file blob identical in Full Platform and Recovery | Present already |
| 15e53a0bc092355818ccd19070b31c5092957e61 | Permit rejection/cleanup after member deletion | Current shared file contains conditional member-existence guard: acceptance requires member existence; rejection is not blocked solely by deleted member; closed-state update is guarded by member existence | Present already |
| d1e41e5edead6c4f001b383ac8ffab01053c367a | Permit rejection of stale identity submissions | Current shared file contains `identityMatches` logic and applies identity-match rejection only to acceptance; rejection remains possible | Present already |
| 31cdb7f5b4d5d4471a768e56fdb0bc5425f7539b | Add member/owner biometric media service calls | Current Full Platform and Recovery service file blob is identical: `a50dd700c7de3a202beee70fa9146071ee6e4358`; required methods `startBiometricVerificationRequest` and `getOwnerBiometricEvidencePlayback` are present, as are upload and decision methods | Present already for inspected behavior |
| 362bfd34705e2889cac7f21f13c75d16e2e9706b | Fix emulator host regex escaping | Current Full Platform/Recovery biometric lifecycle file is identical and has normalized emulator host handling | Present already |
| 7d756be26e129f8616ae38442c681247025b51e0 | Normalize emulator host for playback URLs | Same shared file evidence as above; no separate port needed | Present already |
| a1556702eecc331db332bb658b892971c8c2796e | Normalize safe-object generation regex | Current shared biometric lifecycle file contains numeric-generation validation for safe audio/video generations | Present already |
| 3ce3165d17cbb56d3451080fcce7affb255aebb6 | Require ClamAV provenance for owner playback | Current shared biometric lifecycle file contains ClamAV engine, clean verdict, scanner timestamp, generation and hash checks | Present already |

## Batch outcome

- Candidates inspected: 8 / 1,665 unique SHA.
- Present already: 8.
- Duplicate: 0 assigned in this batch.
- Unique missing: 0 certified.
- Conflicting/unprovable: 0 assigned in this batch.
- Code transferred: none.
- Tests run: none; no code change was made.
- Recovery cross-check: the inspected biometric lifecycle file and member media upload service file have identical blob SHAs between Full Platform and Recovery at the fetched refs.

## Important limits

This is a file-and-behavior review for the eight listed commits, not proof that every commit in the full biometric branch or all commits in the CSV is reconciled. The source branch tip for the member media service file differed from the Full Platform blob, although the required behavior introduced by the listed commit was present in the shared Full Platform/Recovery file. Later source-branch changes to that file remain outside this batch and must be reviewed separately.

No source branch was merged, no ref was moved, and no production/Firebase resource was changed.
