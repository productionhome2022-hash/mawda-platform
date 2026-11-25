# Semantic review batch 019 — room-call join requests and separate billing consent, candidates 229–240
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform source snapshot inspected: 323fd8463f24cce6d4de551c7fc6655cacb28c4a
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 228–239 (candidate numbers 229–240).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 229 | 06498954b50bc58f401f3f2495f10b283402a551 | Allow room members to consent before requesting entry | consentToRoomCallBilling and room join-request APIs are absent in current Full Platform. Not ported. |
| 230 | 8286d5f1f7c22ddb094231c097b33a9211a4f4a8 | Test client room-call discovery and join-request state | getActiveRoomCall, listRoomCallJoinRequests and getRoomCallJoinRequestStatus are absent. Not applicable to current signaling API. |
| 231 | 44b1288288f36d4e89fa3e1ce84a3fd8cdbe1452 | Expose room join-request state to clients | This introduces new room-scoped discovery/status APIs and a separate joinRequests subcollection. Current architecture does not implement them. Defer as a separately approved feature. |
| 232 | c0ac4e3ea16c6dc955287be6cda9e9f98d98e4e2 | Allow pending join requester to consent before creator approval | Depends on absent join-request and billing-consent endpoints. Not ported. |
| 233 | f5c368906772f9700f41b2b8d26b6e6ad4505c7b | Test immutable pricing snapshot and separate billing consent | Current call test snapshot is test-only; no separate financial-consent lifecycle is exposed. Not ported. |
| 234 | f4aced96eaf4df8b1e8b9df62c33eaf552636577 | Snapshot owner pricing and require separate billing consent | Current owner group-call pricing policy is readable by the owner, but startCall does not establish the proposed consent/settlement workflow. Defer the new snapshot/consent behavior. |
| 235 | e605647306de9318bd01a409fccc31c48ea5ea10 | Expose owner group-call pricing policy read | Current getOwnerGroupCallPricingPolicy is present and used by the owner pricing UI. Present. |
| 236 | 64dd9c9714c89f62238b7c15680075f3c2b77a40 | Test creator approval, idempotency and shared expiry | The current call integration test already has callRef and shared-deadline coverage, but not join-request approval/idempotency. Partially present; join-request portions deferred. |
| 237 | 47641309c14f4ec1d3bb895d67dd46ca1baaab13 | Define callRef for video capacity cleanup test | Current video capacity integration test already declares callRef and cleans the created session. Present. |
| 238 | fc4d5793bd5b8aeb4e98adfb4c4848fb7e61b1cd | Revalidate creator room membership transactionally | Current startCall transaction reads the room member document and revalidates room/rental/member eligibility before creating a room call. Present. |
| 239 | 9be831381f971fee6acff5b84ff4a9693661b0a6 | Test creator-approved room join lifecycle and capacity | Current call lifecycle uses whole-room membership/capacity at start; it has no pending/approved join request state. Not applicable. |
| 240 | 816fe8b7fcc17609fb53f5345a6d354fa8e47f54 | Persist rental reference for join approval | The current call document has no join-approval workflow that needs a persisted rentalId; room/rental validity is rechecked at start. Defer with the join-request architecture. |

## Result
- Reviewed: 12 unique candidates (229–240).
- Present/currently equivalent: 3.
- Deferred as a distinct room-call join-request and financial-consent architecture: 9.
- Code transferred: 0.
- Tests executed: 0. Existing source and tests were inspected only.
- No production, Firebase, billing, main-branch or deployment operation was performed.