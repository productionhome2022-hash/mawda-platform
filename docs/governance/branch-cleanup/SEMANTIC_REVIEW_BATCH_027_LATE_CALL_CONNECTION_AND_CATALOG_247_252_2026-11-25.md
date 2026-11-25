# Semantic review batch 027 — late room-call connections and catalog contracts
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 247–252 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 6df24ff6f94273c407c09593d44caf7e9a43f146 | Record late room media connections without resetting shared timer | Current markCallConnected records connectedUids and mediaConnectedAt per participant; late participants do not reset connectedAt/maxDurationEndsAt. | Already implemented |
| 662b850d549314384e772842bcb387517efa340f | Test late room participant shared timer | Current call-signaling integration suite contains the late-participant shared-deadline test and asserts the deadline remains unchanged. | Already implemented |
| d13709b3513e4ebea5dcf5a4bb3d1763b7122586 | Assert nullable catalog version projection | Current store-catalog tests include version:null in projected catalog fixtures. | Already implemented |
| 8e3676f41726bdcf25251f1bc95644ec978b3351 | Align catalog fixtures with versioned purchases | Current store-catalog tests use version:null for disabled/non-purchasable fixtures and version:1 for a purchasable item. | Already implemented |
| 93d0117e4f1003408be25fd25cf028b65ff3a906 | Preserve precise catalog validation errors | Current store-catalog validator projects with purchaseEnabled:false before returning precise missing-price/fulfillment errors. | Already implemented |
| b307c02f7cffb8b3034ea93f581a48c5a5bde116 | Narrow purchasable catalog price type | Current isStoreItemPurchasable is a type guard requiring a numeric version and priceCoins. | Already implemented |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 6.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.