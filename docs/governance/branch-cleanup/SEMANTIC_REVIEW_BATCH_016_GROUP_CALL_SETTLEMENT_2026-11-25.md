# Semantic review batch 016 — group-call settlement and bounded lock lifecycle candidates 193–204
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: 9cdf99cdc392d93ca026319b2497a5be63abb660
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 193–204 from codex/economic-phase-completion-2026-11-18.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence | Result |
|---|---|---|---|
| c09a108056604e8c5bd4c85fa0e12ebf78cabd2b | Test group-call settlement rejection without trusted media/consent | Full Platform has no group-call wallet settlement function or billingSettlements records, so this test has no target transaction path to exercise. Source branch adds a settlement engine and then a fail-closed media/consent guard; do not port the test alone | Held with settlement-engine dependency |
| 4d2937430fffbb0a68dfc74b1e16614172b408eb | Block group-call charges without provider-verified media and matching consent | The patch modifies processGroupCallBillingSettlement, which is absent from Full Platform. The source engine is an ancestor dependency (`e1c2da95855221c575648b1806a426c30055252a`) and is not present in target. Porting only this guard is impossible; porting the engine without the guard would be unsafe | Held: requires coherent engine plus provider-authenticated evidence/consent path and permanent billing-off gate |
| 04dc9a7c1c2e6acbf3cdf7dfb2c0f20a847d1435 | Test bounded lock cleanup for 501-member audio rooms | Current call-signaling.integration.test.js already includes the 501-member bounded lock cleanup test; current clearCallMemberLocks processes batches of 100 | Present |
| f6108e42973edf738b05811375d53846acdef264 | Test concurrent video join approvals and duplicate settlement retries | Current Full Platform has no requestRoomCallJoin/respondToRoomCallJoinRequest/listRoomCallJoinRequests callables. Existing video capacity test is sequential and starts the room call with the room participant set. Source branch's concurrency test depends on the missing join-request lifecycle | Held with room-join workflow dependency |
| a17de95feb3c9ea293dd4732075084745a41b00c | Verify wallet ledger exists for settled group-call receipts | Target has no group-call settlement receipt/ledger path to validate. Do not add an isolated receipt guard without the settlement engine | Held with settlement-engine dependency |
| eafd928c0c7937c6434c7ce2975c97dd558e782e | Add compound index for latest room-call discovery | Current Full Platform has no getActiveRoomCall query endpoint using targetId + createdAt. Existing getActiveCall resolves through atomic member lock; adding an unused index is not justified | No port; query dependency absent |
| 408ec77dad7e513c9c46477d112da3fa4798560f | Order active room-call discovery by newest creation time | Current Full Platform has no getActiveRoomCall endpoint; no matching query exists to reorder | No port; endpoint dependency absent |
| 1aede3a578aea38e01556be997fb158418576280 | Settle group-call member shares in bounded parallel batches | Current Full Platform has no processGroupCallBillingSettlement function or per-member settlement loop. This is an optimization of the missing engine, not a standalone patch | Held with settlement-engine dependency |
| 56c872ce10d891589389d2d712baf4f3f517205e | Clear locks for expired ringing calls safely | Current cleanupExpiredCallSignals marks expired ringing calls missed, then invokes clearCallMemberLocks with bounded cleanup and error logging | Present |
| 949fe48547d50762ced584b4212247f87fee870e | Use member lock snapshot when a room participant leaves | Current endCall transaction reads the caller's memberLockRef and deletes only if the lock belongs to this call | Present |
| a02b32ef79366e819fc1c87e7ae71ca7b3ee687c | Clear locks after ending calls without oversized transactions | Current endCall performs call-state transaction first, then clears locks outside that transaction for ended/cancelled/rejected states | Present |
| 645c699e175177729b82cd035d5e88afb5a4cdcd | Clear group-call member locks in bounded transactions | Current clearCallMemberLocks reads/deletes lock documents in batches of 100 and checks callId before deletion | Present |

## Important dependency finding
The source branch contains a larger room-call admission workflow not present in Full Platform: requestRoomCallJoin, respondToRoomCallJoinRequest, listRoomCallJoinRequests and getRoomCallJoinRequestStatus, plus room membership/rental revalidation, separate billing consent and owner pricing snapshots. Those changes are in the candidate pool later in the CSV (including candidate numbers 1016–1034). The current Full Platform does not contain these callables, so candidate 196's concurrent approval test cannot be ported in isolation.

The source branch also contains a per-member group-call settlement engine beginning at commit e1c2da95855221c575648b1806a426c30055252a. That engine initially trusts client-reported mediaConnectedAt and has no consent gate; a later source commit 4d293743... adds mediaEvidenceVerifiedAt and billingConsents checks. Full Platform has no settlement engine today. Do not port the unsafe engine, the guard alone, or settlement optimizations independently. A coherent port requires trusted provider-side media events, server-only consent records, atomic/idempotent ledger settlement, insufficient-balance semantics, and an immutable hard billing-off gate until owner authorization.

## Result
- Reviewed: 12/1,665 unique candidates (193–204).
- Present in target: 5 (bounded lock cleanup, expired-call lock cleanup, member lock snapshot, post-transaction lock clearing, bounded cleanup helper).
- Held or no-port due missing target dependencies/policy gate: 7.
- Code transferred: 0.
- Tests executed: 0; source and test definitions inspected only.
- No CI success is claimed.

## Safety decision
Do not introduce group-call wallet debits from this batch. Do not add unused Firestore indexes. Continue reviewing later source-branch candidates for the missing room-join workflow and its prerequisites, but keep billing disabled until all trust, consent and settlement requirements are met.

## Next
Continue from candidate 205.