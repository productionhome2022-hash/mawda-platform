# Semantic review batch 024 — room-call discovery and financial consent
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 229–234 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 06498954b50bc58f401f3f2495f10b283402a551 | Allow room members to consent before requesting entry | Current Full Platform has no consentToRoomCallBilling callable or room join-request state. | Missing dependent admission/consent feature |
| 8286d5f1f7c22ddb094231c097b33a9211a4f4a8 | Test room-call discovery and join-request state | Current source does not export getActiveRoomCall, listRoomCallJoinRequests or getRoomCallJoinRequestStatus. | Dependent tests cannot be ported alone |
| 44b1288288f36d4e89fa3e1ce84a3fd8cdbe1452 | Expose room join-request state to clients | Current Full Platform lacks the room-discovery and join-request callables and their transaction model. | Missing dependent API feature |
| c0ac4e3ea16c6dc955287be6cda9e9f98d98e4e2 | Allow pending join requester to consent before creator approval | Current Full Platform has no separate financial consent callable or pending join-request document state. | Missing dependent consent/admission feature |
| f5c368906772f9700f41b2b8d26b6e6ad4505c7b | Test immutable pricing snapshot and separate billing consent | Current Full Platform stores only a testPricingSnapshot and reports billingEnabled=false; it has no consent map or billing consent callable. | Test depends on a non-existent live-billing contract; do not port alone |
| f4aced96eaf4df8b1e8b9df62c33eaf552636577 | Snapshot owner pricing and require separate billing consent | Current Full Platform deliberately keeps group-call pricing test-only and hard-disables billing collection. The source branch's active billing snapshot/consent contract is not compatible without a separately approved billing activation design. | Not ported; billing contract requires owner decision and full lifecycle |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Missing but dependency-blocked or incompatible with current billing-disabled design: 6.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## Safety decision
Do not silently convert test-only pricing into a live charge policy. The owner-controlled price display and test snapshot remain separate from financial consent and settlement. Room join admission must be designed and tested before adding client calls to these absent endpoints.