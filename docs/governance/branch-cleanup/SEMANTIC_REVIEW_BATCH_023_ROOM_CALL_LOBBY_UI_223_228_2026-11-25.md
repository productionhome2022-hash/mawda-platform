# Semantic review batch 023 — room-call lobby and join-consent UI
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 223–228 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| f67c797901ddb8ffbc2371e133586aa9ec2408ca | Retry creator join-request processing after transient errors | Current MawddaCallScreen has no room join-request lobby or pending-request processor. | Dependent UI fix cannot be ported before lobby/backend flow |
| 42c9b74ba831da921d8508d50afa4da7d68b75e1 | Resume approved room-call joins without duplicate requests | Current ChatRoomScreen does not read approved join-request state or resume a creator-approved participant session. | Missing dependent join-request flow |
| effbb5d89f514c9200a300668529f6360ead55c6 | Retain creator billing consent across room join approvals | Current Full Platform has no consentToRoomCallBilling callable or creator join-approval UI. | Missing dependent consent/lobby flow |
| 69d583bc0964c72b0c6f77ff27a8d3592a812c8c | Add creator room-call lobby and approval flow | Current Full Platform does not export listRoomCallJoinRequests/getActiveRoomCall and does not have creator lobby state. | Missing dependent backend/API flow |
| 4b7773f193a71c7f808810ba44ce272a8225a93c | Wire room join requests and separate financial consent in Flutter | Current ChatRoomScreen uses getActiveCall for room calls; the required room-discovery, join-request and consent callables are absent. | Missing dependent backend/API flow |
| fd29355a68c194c50445dd8959f684faf0305ef2 | Test financial consent before join request | Current Full Platform has no separate consent callable or join-request workflow. | Dependent test cannot be ported in isolation |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Missing but dependency-blocked: 6.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## Safety decision
Do not add UI calls to non-existent backend functions. The creator lobby, per-member join approval, and independent financial consent must be implemented and tested as one coherent lifecycle before the Flutter screens are wired.