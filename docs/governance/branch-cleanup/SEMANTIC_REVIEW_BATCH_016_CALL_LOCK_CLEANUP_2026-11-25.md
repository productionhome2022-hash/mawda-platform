# Semantic review batch 016 — group-call settlement blockers and bounded lock cleanup, candidates 193–204
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform HEAD inspected: d8e3e38d35ee550194a07e6cbd56fb1352d6defc
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 192–203 (candidate numbers 193–204).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 193 | c09a108056604e8c5bd4c85fa0e12ebf78cabd2b | Test that group-call charges require trusted media and per-member consent | No group-call settlement function is present in current Full Platform. Billing remains disabled and docs explicitly require trusted provider evidence/consent before charges. Do not add a test for an absent settlement API. |
| 194 | 4d2937430fffbb0a68dfc74b1e16614172b408eb | Block group-call charges without verified media and matching consent | Not ported: the settlement engine is not integrated and provider-verified media evidence is not available. The current policy remains fail-closed/no billing. |
| 195 | 04dc9a7c1c2e6acbf3cdf7dfb2c0f20a847d1435 | Test bounded lock cleanup for large audio rooms | Added integration test creating 501 participant locks and asserting endCall clears them in bounded batches. Commit 4f00b3475ab63632d95f0bf4605c5ebeb297d24b; subsequent test cleanup commit 3e7f6f5857ce1fd7af0d61fbcc0fa72545160be0. |
| 196 | f6108e42973edf738b05811375d53846acdef264 | Test concurrent video approvals and duplicate settlement retries | Current Full Platform has no requestRoomCallJoin/respondToRoomCallJoinRequest API and no group settlement receipt path; the historical test does not match the current signaling architecture. An attempted draft was removed before acceptance. No invalid imports remain. |
| 197 | a17de95feb3c9ea293dd4732075084745a41b00c | Verify wallet ledger exists for settled group-call receipts | No group-call settlement receipts/ledger path exists in current Full Platform. Not applicable until billing is separately approved and implemented. |
| 198 | eafd928c0c7937c6434c7ce2975c97dd558e782e | Add room-call discovery composite index | The historical getActiveRoomCall query is absent; current API is per-member getActiveCall through activeCallMemberLocks. No unused index was added. |
| 199 | 408ec77dad7e513c9c46477d112da3fa4798560f | Order room-call discovery by newest call | The historical room-level discovery endpoint/query is absent in current architecture. No query or index change was needed. |
| 200 | 1aede3a578aea38e01556be997fb158418576280 | Settle group-call shares in bounded parallel batches | Not ported: no group-call billing settlement function exists in current Full Platform; no parallel wallet settlement was introduced. |
| 201 | 56c872ce10d891589389d2d712baf4f3f517205e | Clear locks for expired ringing calls safely | Added post-transaction clearCallMemberLocks invocation after the scheduler marks an expired ringing call missed. Errors are logged and cleanup is retryable on the next sweep. |
| 202 | 949fe48547d50762ced584b4212247f87fee870e | Use member lock snapshot when a room participant leaves | endCall now reads only the leaving member's lock for reject/leave paths rather than reading every participant lock inside one transaction. |
| 203 | a02b32ef79366e819fc1c87e7ae71ca7b3ee687c | Clear member locks after ending calls without oversized transactions | endCall now commits the call-state transition first, then clears matching locks outside the primary transaction in bounded batches. Duration expiry uses the same cleanup helper. |
| 204 | 645c699e175177729b82cd035d5e88afb5a4cdcd | Clear group-call locks in bounded transactions | Added clearCallMemberLocks, deduplicating participant UIDs and deleting only locks still bound to the ended call, in batches of 100. Commit b3600fea5965acba1b1896b92cf49c91b34852e5. |

## Changes made
- Added a bounded 100-member transactional lock-cleanup helper in functions/src/index.ts.
- Moved endCall terminal-state lock cleanup outside the primary transaction; participant reject/leave reads only that participant's lock.
- Added lock cleanup after duration expiry and after the scheduled missed-call transition, with logged retryable failures.
- Added a 501-participant integration test to exercise the former oversized-transaction boundary.
- No group-call charging, financial consent, media-verification or wallet-settlement code was added. Those remain blocked until the trusted provider evidence and owner-approved billing lifecycle are complete.

## Result and verification
- Reviewed: 12 unique candidates (193–204).
- Bounded lock-cleanup changes restored: 4; large-room regression test added: 1.
- Group billing/settlement candidates deferred as not applicable to current architecture or blocked by missing trusted evidence/approval: 7.
- Tests executed: 0. The integration test was added but no Firestore Emulator was run.
- No CI success is claimed. No production, Firebase, billing, main-branch or deployment operation was performed.