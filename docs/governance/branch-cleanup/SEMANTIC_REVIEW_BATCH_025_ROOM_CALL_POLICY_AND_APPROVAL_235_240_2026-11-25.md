# Semantic review batch 025 — owner pricing read and creator-approved room calls
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 235–240 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| e605647306de9318bd01a409fccc31c48ea5ea10 | Expose owner group-call pricing policy read | Current getOwnerGroupCallPricingPolicy is owner-only and returns the configured policy without inventing defaults; billingEnabled remains false/test-only. | Already implemented |
| 64dd9c9714c89f62238b7c15680075f3c2b77a40 | Test creator approval, idempotency and shared expiry | Current Full Platform has no requestRoomCallJoin/respondToRoomCallJoinRequest callables, so these join-approval tests cannot run against the current source. | Missing dependent admission flow |
| 47641309c14f4ec1d3bb895d67dd46ca1baaab13 | Define video call reference for cleanup test | Current video-capacity integration fixture already defines and cleans its call reference. | Already implemented |
| fc4d5793bd5b8aeb4e98adfb4c4848fb7e61b1cd | Revalidate creator room membership transactionally | Current startCall reads room membership within the transaction and rejects if the creator/member set changed. | Already implemented, expanded |
| 9be831381f971fee6acff5b84ff4a9693661b0a6 | Test creator-approved room join lifecycle and capacity | Current source still starts room calls with the room's current member set and has no creator-approval request flow. The test expects creator-only participant initialization and join requests. | Missing dependent admission flow |
| 816fe8b7fcc17609fb53f5345a6d354fa8e47f54 | Persist room rental reference for join approval | Current call document does not persist the rentalId needed by the source join-approval callables; this is a dependency of the absent admission flow. | Missing dependent data contract; hold with join flow |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 3.
- Missing but dependency-blocked: 3.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## Safety decision
The current owner pricing read and transactional room membership check remain. Do not partially switch room calls to creator-only admission without the join-request callables, rental reference, approval idempotency, participant locks, Flutter lobby and matching tests. The current call integration test/source mismatch remains a P0 blocker.