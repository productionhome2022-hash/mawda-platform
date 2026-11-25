# Semantic review batch 006 — call economy documentation and fixture candidates 73–84
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD before this report: 65f6de5cf79686e44861910149de73259b46af5a
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 73–84, continuing sequentially.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 9b768aeaf4db6373140a2b015b8dae445f09ade0 | Preserve approved five-person group audio cap | An older calls audit section records 2–5 audio participants, but the later owner clarification in ECONOMIC_PHASE_REMAINING_WORK_REGISTER says there is no fixed independent audio cap; room capacity governs audio and each invitee must request/obtain approval. room-call-policy.ts now returns room capacity for audio and min(room capacity, 4) for video | Conflicting/outdated policy text; do not port or reinstate five-person admission cap |
| 98a9d7cfe802110abbf13282d593999f490c658b | Record verified invitation and settlement gaps | Current CALLS_EXECUTION audit records absent explicit invitee selection, admission/consent boundary, trusted per-participant metering and atomic settlement gaps | Present |
| 519894e20ded3c91f7e31456768498ba08fd9ef5 | Refresh call economy audit from current branch sources | Current call audit contains source re-audit and findings for call admission, connection measurement, store entitlement readiness and missing wallet settlement | Present |
| ba31587c49e6420600ba3031d64959d3cc4be01b | Record owner execution and local-test constraints | Current economic work register records no cloud CI/Emulator or production Firebase tests in this phase, local environment constraints, and the required P0 ordering | Present |
| 24fb901684d851108d47c476b7030695cd01194c | Correct BetaCoins label typo in profile | Current profile source no longer contains the erroneous `BetaCoinsز` spelling; no additional edit required | Present |
| 43111a8f84d2859647c6c7263fea492135fd166c | Update economic work register with source audit | Current economic work register includes source audit of startCall/respondToCall/markCallConnected, missing entitlement/consent/measurement/settlement, and the test fixture constraint | Present |
| 21ee564ca99cdc060878eacfdf48067a31abc38c | Record implementation audit and critical remediation plan | Current CALLS_EXECUTION audit exists with the same audit scope, P0 gaps, fixture remediation and non-completion status | Present |
| b0ddd12c4b7675e34fe7b69faa18bc533ac69e6d | Align room signaling fixture with rented private-room policy | Current call-signaling integration fixture includes private rented room, active rental record and future expiry for the room-call scenario | Present |
| e75c15e913aec676930c279fbcbedf4f53016513 | Define interaction tile for three-way video | Current economic work register specifies three equal video tiles plus fourth interactive tile for three participants, and separate tools panel for four participants | Present |
| 1c36876678d2be389c48c2078aa6379338cf4416 | Specify balanced group video layouts | Current economic work register specifies symmetric 2/3/4-participant layouts, responsive behavior, reflow and acceptance criteria | Present |
| c0678aa82be1dc8e905d13053e4f91673b708d56 | Clarify group audio admission and video cap | Current economic work register contains the later owner clarification: audio follows actual room capacity and explicit per-member requests; video is capped at four total; admission requires sender approval, eligibility and financial consent. This supersedes the older five-person audio statement in the separate call audit | Present; later clarification is controlling |
| 6bbd5b477c981cf5d28b4370648d88b1883bf53f | Reconcile call execution audit against current HEAD | Current economic work register contains the follow-up source review and identifies unimplemented call billing, per-participant measurement, and missing settlement; it does not mark call economy complete | Present |

## Result
- Reviewed: 12/1,665 unique candidates (candidates 73–84).
- Present or superseded by later owner clarification: 11.
- Conflicting/outdated five-person audio-cap statement: 1; no policy edit made.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0; source/document read-back only.

## Important policy reconciliation
The repository currently contains an older 2–5 audio participant statement in CALLS_EXECUTION_AUDIT and a later owner clarification in ECONOMIC_PHASE_REMAINING_WORK_REGISTER that audio has no fixed independent cap and is governed by rented-room capacity. The latter is the later dated owner clarification and is reflected by roomCallParticipantLimit(mode, roomCapacity). Do not copy the older five-person cap as an admission rule. The separate five-participant arithmetic test added in batch 005 is explicitly labelled as arithmetic coverage only, not an admission cap.

## Next
Continue from candidate 85. No production, billing, deployment, main-branch or Firebase resource action was taken.