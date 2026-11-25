# Semantic review batch 018 — group-call billing gates and discovery index
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 193–198 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| c09a108056604e8c5bd4c85fa0e12ebf78cabd2b | Test no group-call charge without verified media and per-member consent | Current Full Platform has no processGroupCallBillingSettlement function and no consentToRoomCallBilling callable; the source settlement path and its dependencies are absent. | Test cannot be ported in isolation; retain as a P0 acceptance requirement |
| 4d2937430fffbb0a68dfc74b1e16614172b408eb | Block group-call charges without verified media and matching consent | The source candidate adds a settlement function, but Full Platform has no settlement entry point, trusted provider event pipeline, per-member consent flow or settlement retry/receipt lifecycle. | Missing dependent feature; do not port this guard alone or enable billing |
| 04dc9a7c1c2e6acbf3cdf7dfb2c0f20a847d1435 | Test bounded lock cleanup for large audio rooms | Current clearCallMemberLocks already processes participant locks in batches of 100, and the current integration test already contains the 501-participant cleanup scenario. | Already implemented |
| f6108e42973edf738b05811375d53846acdef264 | Test concurrent video approvals and duplicate settlement retries | Current Full Platform has no creator-approved join-request flow or settlement retry lifecycle. Current room-call admission is based on room membership/capacity at startCall. | Dependent test cannot be ported until admission/settlement flows exist |
| a17de95feb3c9ea293dd4732075084745a41b00c | Verify wallet ledger exists for settled call receipts | No active group-call settlement receipt or per-member wallet debit flow exists in Full Platform. | Dependent guard cannot be ported until settlement lifecycle exists |
| eafd928c0c7937c6434c7ce2975c97dd558e782e | Add index for latest room-call discovery by room and creation time | Current firestore.indexes.json has a callSessions cleanup index on signalsCleanedAt/createdAt but not targetId/createdAt. The matching latest-room-call discovery query is also absent. | Missing dependent index; hold until query is ported with its test |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 1.
- Missing but dependency-blocked: 5.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## P0 decision
Do not enable group-call billing from these commits alone. Before any debit, Full Platform needs a coherent end-to-end set: creator-approved join requests, separate version-bound financial consent, trusted provider-side media evidence, per-member verified intervals, atomic/idempotent wallet settlement, receipt-to-ledger reconciliation, safe retry and end/timer triggers. The current source/test mismatch is also recorded in docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-25.md.