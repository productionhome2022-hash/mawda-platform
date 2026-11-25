# Semantic review batch 008 — group-call economy documentation and fixtures
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 73–84 (12 commits). This range is documented after the already-existing batch 007 report for candidates 85–96; candidate numbering is retained to avoid overwriting that report.
Inspected Full Platform files: docs/CALLS_EXECUTION_AUDIT_AND_REMEDIATION_2026-11-18.md blob 7c6f2486ad0b56694b577e929e97466e378d5c0e; docs/ECONOMIC_PHASE_REMAINING_WORK_REGISTER_2026-11-18.md blob 03a82d04d8101508bfff47627547020b11ff35dc; functions/test/integration/call-signaling.integration.test.js blob 2e35bd8b7b027e1a39d4e056dd7a8b834b7a5ca9; lib/screens/profile_screen.dart blob 94adac45754d7027c9f288497348d90069b76c44; functions/src/room-call-policy.ts blob 7941f63dca354599f8a4d88f0f2092d1d674e795; functions/src/group-call-economy.ts blob 55d2df84872fc1f295aed802a094c9eb234b42b4.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 9b768aeaf4db6373140a2b015b8dae445f09ade0 | Preserve approved five-person group-audio cap | Older audit text records 2–5, but the later owner clarification in the current work register says audio follows rented-room capacity. Current roomCallParticipantLimit implements that later rule: audio returns configured room capacity (validated 5–1000); video is capped at four total. | Earlier cap note superseded by later owner clarification and current implementation |
| 98a9d7cfe802110abbf13282d593999f490c658b | Record verified invitation and settlement gaps | Current call audit contains missing explicit invitee selection, consent/admission boundary, trustworthy participant metering and atomic settlement findings. | Present |
| 519894e20ded3c91f7e31456768498ba08fd9ef5 | Refresh call economy audit from current branch sources | Current call audit contains the source review of startCall/respondToCall/markCallConnected, catalog/entitlement and wallet-settlement gaps, and Media Saver gap. | Present |
| ba31587c49e6420600ba3031d64959d3cc4be01b | Record owner execution order and local-test constraints | Current economic work register documents P0 order, local-only test constraints, missing local toolchain and no-production/no-billing boundaries. | Present |
| 24fb901684d851108d47c476b7030695cd01194c | Correct BetaCoins label typo in profile | Current profile source no longer contains `BetaCoinsز`; visible balance and transfer amounts use the current localized coin wording. | Already corrected/superseded |
| 43111a8f84d2859647c6c7263fea492135fd166c | Update economic work register with source audit | Current register contains room-call audit, rented-room fixture correction, invitee/consent/billing blockers and test limitations. | Present |
| 21ee564ca99cdc060878eacfdf48067a31abc38c | Record implementation audit and critical remediation plan | Current call audit contains the P0 blockers and ordered remediation; call charging remains explicitly disabled pending completion. | Present |
| b0ddd12c4b7675e34fe7b69faa18bc533ac69e6d | Align room signaling fixture with rented private-room policy | Current integration test creates a private rented room with matching active rental and future expiry, then removes room/rental fixtures during cleanup. The test title is generic, but its behavior is aligned. | Present in behavior |
| e75c15e913aec676930c279fbcbedf4f53016513 | Define interaction tile for three-way video | Current work register specifies three equal video tiles plus interactive tools in the fourth cell, moving tools to a separate panel for four participants. | Present |
| 1c36876678d2be389c48c2078aa6379338cf4416 | Specify balanced group video layouts | Current register documents balanced two-, three- and four-person layouts, 2×2 grid, dynamic rearrangement and multi-device acceptance criteria. | Present |
| c0678aa82be1dc8e905d13053e4f91673b708d56 | Clarify group audio admission and video cap | Current register contains the later owner clarification: audio follows rented-room capacity; video is capped at four total; each invitee needs an independent request, sender approval, entitlement and separate financial consent. Current roomCallParticipantLimit implements the capacity rule. | Present and implemented at the capacity-policy layer |
| 6bbd5b477c981cf5d28b4370648d88b1883bf53f | Reconcile call execution audit against current HEAD | Current work register contains the follow-up HEAD review and keeps explicit invitee requests, entitlement/consent, trusted metering and atomic settlement open. | Present |

## Cross-layer result
The older 2–5 audio-cap statement remains in historical audit prose, but the later owner clarification is explicitly marked as newer and is reflected in current roomCallParticipantLimit: audio follows configured room capacity; video is limited to four total. Do not treat this capacity-policy helper as completion of the call economy. The current audit still identifies missing explicit join-request/approval flow, per-participant entitlement and financial consent, trusted connected-time measurement, and atomic/idempotent wallet settlement.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present, corrected or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.
- No call billing, production resources, deployment or main-branch merge was enabled.

## Safety decision
Do not enable call billing. The rented-private room gate and capacity policy do not complete the financial admission, consent, trusted metering or settlement lifecycle. Continue with candidate 97 onward.