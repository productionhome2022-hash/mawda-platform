# Semantic review batch 020 — room-call signaling authorization and late media connections, candidates 241–252
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform source snapshot inspected: 055bfca79bb1b9e2fde90f345d15df1b691e280e
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 240–251 (candidate numbers 241–252).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 241 | c194267754766e06fe92ff1437a45f725be3ffe6 | Require creator approval for room-call joins | This changes the whole-room start model to a new per-member join-request/lobby architecture. Current Full Platform has no requestRoomCallJoin/respondToRoomCallJoinRequest APIs; defer as a separate approved feature. |
| 242 | 9dc4cd84dba4a9e9749f46a3289756e25b10a16e | Test equal group-call shares independent of initiator | Conflicts with current owner-approved policy: the initiator absorbs the entire integer remainder. Do not port. |
| 243 | 2a6957914a11c115e3c81ed6ae8c25b9c16078b9 | Split group-call cost evenly without initiator bias | Conflicts with the approved initiator-remainder allocation rule and current implementation/tests. Do not port. |
| 244 | 3d4bcaece743c834fcbb285254483988c71a5a4c | Align room signaling tests with accepted-member authorization | Current signaling tests cover accepted-member exchange; the new fail-closed pre-acceptance test added below strengthens this. Present/evolved. |
| 245 | f5f6f95c2ae9e651559c0192d0cf334e578c9fc8 | Test denial of room signaling and ICE before acceptance | Added integration test proving pending room participants cannot obtain ICE credentials, read signaling inboxes, or exchange offers until accepted. Commit 755b1d07da245159ef79e55bea113a0402222614. |
| 246 | ebf1de8e71aeafd47d1410ccad7747c9246bdf29 | Block room signaling and ICE before participant acceptance | Added acceptedUids checks to sendCallSignal, getCallSignals and getCallIceConfiguration for room calls. A room invitation/participant list alone no longer grants signaling or ICE access. Commit bdd1789dc6db30c8d0caff381e65e081f1dd1a5b. |
| 247 | 6df24ff6f94273c407c09593d44caf7e9a43f146 | Record late room media connections without resetting timer | markCallConnected now stores connectedUids and per-member mediaConnectedAt. Late accepted members are recorded without changing the immutable shared connectedAt/maxDurationEndsAt timer. Commit 91041a912fab920b9b4afb22a412740d4a15d590. |
| 248 | 662b850d549314384e772842bcb387517efa340f | Test late room participant shared timer | Added integration coverage for creator-first report, first peer establishing the shared five-minute timer, late member connection, idempotent replay, and deadline expiry. Commit 2f6f1224af0216da28e74cfee266b86d6f95cd83. |
| 249 | d13709b3513e4ebea5dcf5a4bb3d1763b7122586 | Assert nullable catalog version projection | Current store-catalog tests include version:null in the public projection. Present. |
| 250 | 8e3676f41726bdcf25251f1bc95644ec978b3351 | Align catalog fixtures with versioned purchases | Current store-catalog fixtures carry version fields and tests cover versioned purchase validation. Present. |
| 251 | 93d0117e4f1003408be25fd25cf028b65ff3a906 | Preserve precise catalog validation errors | Current validateStoreCatalogItemInput projects with purchaseEnabled:false before owner validation, preserving specific missing-price/fulfillment errors. Present. |
| 252 | b307c02f7cffb8b3034ea93f581a48c5a5bde116 | Narrow purchasable catalog price type | Current isStoreItemPurchasable is a type guard requiring version:number and priceCoins:number, both positive safe integers. Present. |

## Changes made
- Added server-side accepted-member authorization to all three room signaling/ICE access paths.
- Added a regression integration test for denial before acceptance and success after acceptance.
- Extended markCallConnected to retain per-member media connection timestamps while preserving the original shared call timer.
- Added an integration test for late room participant media connection, idempotent replay and shared deadline expiry.
- No wallet billing, consent flow or room join-request API was added.

## Result and verification
- Reviewed: 12 unique candidates (241–252).
- Present/evolved or restored: 9.
- Deferred/conflicting with current approved policy: 3.
- Tests added: 2 integration tests. Tests executed: 0; Firestore Emulator was not run.
- No CI success is claimed. No production, Firebase, billing, main-branch or deployment operation was performed.