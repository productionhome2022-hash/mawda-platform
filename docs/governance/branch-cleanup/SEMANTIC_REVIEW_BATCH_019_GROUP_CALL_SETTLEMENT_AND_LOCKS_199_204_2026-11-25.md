# Semantic review batch 019 — group-call settlement batching and lock cleanup
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 199–204 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 408ec77dad7e513c9c46477d112da3fa4798560f | Prioritize newest room calls during active-room discovery | Full Platform does not export getActiveRoomCall or use the matching targetId/createdAt query. The index/query pair is a dependent room-lobby feature, not a standalone safe index addition. | Missing dependent feature; hold with room-call lobby work |
| 1aede3a578aea38e01556be997fb158418576280 | Settle group-call member shares in bounded parallel batches | Full Platform has no processGroupCallBillingSettlement or per-member wallet settlement lifecycle. | Missing dependent feature; do not port batching without settlement and verified evidence |
| 56c872ce10d891589389d2d712baf4f3f517205e | Clear locks for expired ringing calls safely | Current cleanupExpiredCallSignals marks expired ringing calls missed and calls clearCallMemberLocks after the transaction. | Already implemented |
| 949fe48547d50762ced584b4212247f87fee870e | Use member lock snapshot for room participant leave | Current endCall reads the leaving member's lock inside the transaction and deletes it only when the lock belongs to the same call. | Already implemented |
| a02b32ef79366e819fc1c87e7ae71ca7b3ee687c | Avoid oversized lock reads when ending calls | Current endCall no longer reads every participant lock in one transaction; it reads only the leaving member lock and uses post-transaction cleanup for terminal calls. | Already implemented |
| 645c699e175177729b82cd035d5e88afb5a4cdcd | Clear group-call locks in bounded transactions | Current clearCallMemberLocks deduplicates valid UIDs and clears in 100-member transaction batches; current integration test covers 501 participant locks. | Already implemented, tested in source |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 4.
- Missing but dependency-blocked: 2.
- Code transferred: 0.
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.

## Safety decision
Keep the existing bounded lock cleanup. Do not add a room-discovery index without its query, and do not add parallel wallet settlement until the full trusted-media, consent, reservation, idempotency and retry lifecycle is implemented.