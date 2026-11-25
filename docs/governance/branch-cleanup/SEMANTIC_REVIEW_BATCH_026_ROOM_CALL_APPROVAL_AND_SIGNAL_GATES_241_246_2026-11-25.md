# Semantic review batch 026 — room-call approval and signaling gates
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 241–246 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| c194267754766e06fe92ff1437a45f725be3ffe6 | Require creator approval for room-call joins | Current startCall still initializes the room participant set from current room members and uses the existing invitation/acceptance model; requestRoomCallJoin/respondToRoomCallJoinRequest are absent. | Missing dependent admission feature |
| 9dc4cd84dba4a9e9749f46a3289756e25b10a16e | Test equal shares for late joiners | Current approved group-call policy assigns the entire integer remainder to the initiator; this candidate changes to initiator-independent distribution. | Conflicts with owner-approved remainder policy; do not port |
| 2a6957914a11c115e3c81ed6ae8c25b9c16078b9 | Split group-call cost evenly without initiator bias | Same conflict: the approved Full Platform rule assigns the remainder to the initiator. | Conflicts with owner-approved remainder policy; do not port |
| 3d4bcaece743c834fcbb285254483988c71a5a4c | Align room signaling test with accepted-member authorization | Current integration tests already require room members to accept before peer-targeted signaling. | Already implemented |
| f5f6f95c2ae9e651559c0192d0cf334e578c9fc8 | Test denial of room signaling and ICE before acceptance | Current call-signaling integration suite contains this test and asserts pending room participants cannot obtain ICE or signaling access. | Already implemented |
| ebf1de8e71aeafd47d1410ccad7747c9246bdf29 | Block room signaling and ICE before participant acceptance | Current sendCallSignal, getCallSignals and getCallIceConfiguration enforce acceptedUids for non-creator room participants. | Already implemented, security gate present |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 3.
- Missing but dependency-blocked: 1.
- Conflicts with approved policy: 2.
- Code transferred: 0.
- Tests executed: 0. Existing test definitions and source guards were inspected only.
- No CI success is claimed.

## Safety decision
Keep the accepted-member signaling/ICE gate and initiator-remainder policy. Do not switch to creator-only admission without the complete join-request, approval, rental binding and Flutter lobby lifecycle.