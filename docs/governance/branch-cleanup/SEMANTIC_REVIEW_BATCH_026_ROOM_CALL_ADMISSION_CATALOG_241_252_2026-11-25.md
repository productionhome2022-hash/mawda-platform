# Semantic review batch 026 — room admission, signaling, late media and catalog validation
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 241–252 (12 commits).
Inspected Full Platform files: functions/src/index.ts 8ff3b07a0d3a7d1356bccd15e9c97d54aab8b4ec; functions/src/group-call-economy.ts 55d2df84872fc1f295aed802a094c9eb234b42b4; functions/test/group-call-economy.test.js f843774774d5df9064ac8475db02e3b484944c9; functions/test/integration/call-signaling.integration.test.js 1611c3399c331edc6ed22b7b8dc8a7c6f97e8183; functions/src/store-catalog.ts b31aaefa0ad331f3c431a6f2bc27ba951658d2dc; functions/test/store-catalog.test.js c97c16afff5a1ed8017a6982652f288754bcf384.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| c194267754766e06fe92ff1437a45f725be3ffe6 | Require creator approval for room-call joins | Current room start still snapshots existing room members as call participants and uses ordinary respondToCall acceptance; it does not export requestRoomCallJoin/respondToRoomCallJoinRequest or persist a separate creator-approved join-request lifecycle. The candidate changes startCall to creator-only but does not provide the complete request/approval endpoint/UI contract. | Missing dependent admission feature; do not port partial startCall change alone |
| 9dc4cd84dba4a9e9749f46a3289756e25b10a16e | Test equal group-call shares for late joiners | Current approved economic audit explicitly assigns the integer rounding remainder to the initiator; the current unit test asserts that behavior. | Conflicts with current owner-approved remainder rule; hold pending explicit owner decision |
| 2a6957914a11c115e3c81ed6ae8c25b9c16078b9 | Split group-call cost evenly without initiator bias | Current calculateGroupCallCoinShares assigns the complete integer remainder to the initiator, matching the current economic audit examples. | Conflicts with current owner-approved remainder rule; do not port |
| 3d4bcaece743c834fcbb285254483988c71a5a4c | Align room signaling tests with accepted-member authorization | Current integration test accepts both invitees before exchanging peer-targeted offers and verifies signaling access after acceptance. | Present |
| f5f6f95c2ae9e651559c0192d0cf334e578c9fc8 | Deny room signaling before acceptance | Current sendCallSignal, getCallSignals and getCallIceConfiguration all check acceptedUids for non-caller room participants; current integration test verifies pending invitees cannot obtain ICE/signaling access. | Present |
| ebf1de8e71aeafd47d1410ccad7747c9246bdf29 | Block room signaling and ICE before participant acceptance | The same acceptedUids gate is present in all three server endpoints and is covered by the integration test. | Present |
| 6df24ff6f94273c407c09593d44caf7e9a43f146 | Record late room media connections without resetting timer | Current markCallConnected tracks connectedUids and per-member mediaConnectedAt; late participants retain the original call-wide connectedAt/maxDurationEndsAt. | Present |
| 662b850d549314384e772842bcb387517efa340f | Test late room participant shared timer | Current integration test covers creator, first and late participant media timestamps, stable shared deadline, idempotent replay and deadline termination. | Present |
| d13709b3513e4ebea5dcf5a4bb3d1763b7122586 | Assert nullable catalog version projection | Current store-catalog tests expect version:null for legacy/unversioned catalog projections. | Present |
| 8e3676f41726bdcf25251f1bc95644ec978b3351 | Align catalog fixtures with versioned purchases | Current store-catalog fixtures include version:null for legacy records and version:1 for published versioned items. | Present |
| 93d0117e4f1003408be25fd25cf028b65ff3a906 | Preserve precise catalog validation errors | Current validateStoreCatalogItemInput projects with purchaseEnabled:false before validating charging fields, preserving precise missing-price/fulfillment errors. | Present |
| b307c02f7cffb8b3034ea93f581a48c5a5bde116 | Narrow purchasable catalog price type | Current isStoreItemPurchasable is a type guard for a catalog item with numeric version and priceCoins, and the purchase path uses the narrowed result. | Present |

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Already implemented: 9.
- Missing dependent room-admission feature: 1.
- Conflicting economic remainder change: 2.
- Confirmed unique safe-to-transfer changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
Do not change the initiator remainder rule without owner approval. Do not convert room calls to creator-only start until the separate join-request callable, creator decision, UI, authorization tests and room membership lifecycle are ported as one coherent feature. Preserve the acceptedUids signaling/ICE gate, per-member media timestamps, and catalog fail-closed type guard.