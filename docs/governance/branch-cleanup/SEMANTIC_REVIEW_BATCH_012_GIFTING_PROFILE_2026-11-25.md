# Semantic review batch 012 — recipient-profile gifting architecture
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 133–144 (12 commits).
Inspected Full Platform evidence: coin-purchase-requests.test.js b8a0ada141d7556f839cfa0ba7f5846968729e8a; coin-purchase-requests.ts 422e392ce0657c8ff31af9790701d25e5de99a19; profile_screen.dart 2e054da912c753c9d53e3e41f0cee84533cb2303; shop_screen.dart 5389c93569c8957c2e8ebb9ae51cbf4d0fb6bff9; functions/src/index.ts 94e60843b5c6cedbc49aa4aa86735eeed2c62396; economic audit 0e58764259e5bc28200e8ddafbe377ee31ba95f8.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 442cc5e0e0b7f24c159f3de3fe939cb20522bdc8 | Test recipient-bound package gift request validation | Current coin-purchase-requests tests accept package giftRecipientUid, reject custom giftRecipientUid, and reject malformed/oversized recipient IDs. | Present and expanded |
| 05d6344af82fe99403196b4fff7b2684e13ac0c9 | Use Firestore document identity for package gift recipient | Current createCoinPurchaseRequest reads users/{giftRecipientUid} and checks existence, active member status, completed profile and absence of guest records; it does not rely on duplicated uid/memberId fields inside the document. | Present |
| 8d23f14ff1ff63cffd291958f28c73d4d5f390ab | Add choice between owner-configured package and sender balance gift | Current profile flow presents separate package and balance options. Package gifts submit giftRecipientUid from the viewed profile; balance gifts reuse the quoted transfer flow. | Present |
| dc3a609c5dca89271e9fc043d1303b933033522a | Credit verified package gifts to recipient atomically | Current approval transaction credits the selected recipient, writes recipient wallet ledger, gift receipt, coinPackageGiftHistory, in-app notification and owner audit in the same transaction; push is best-effort after commit. | Present and strengthened |
| 8837c51e6510f6f2d7ef5abde55200f9c875ce86 | Bind package gift requests to eligible recipient | Current create request binds giftRecipientUid, rejects self-gifts, validates recipient membership/profile, and rejects guest profile/session records. Recipient identity is included in request replay compatibility. | Present |
| 7c0eeb43d2535f1acad8d24b06aa78b62770d725 | Validate recipient-bound coin package gift requests | Current validator permits giftRecipientUid only for package requests, validates its format/length/control characters, and rejects custom gift requests carrying a recipient. | Present and hardened |
| 630431051e09c80d9276065ee372396cd5bde82f | Document profile-scoped gifting and remove shop gifting | Current economic audit states that feature gifting begins from the recipient profile, while shop remains browse/self-purchase. Current ShopScreen has no gift method or username lookup action. | Present |
| 05f26e299b5c788bb7137a4383323e9c78f04e67 | Record recipient-profile-only gifting decision | Current economic audit documents profile-scoped gifting, direct recipient UID binding, non-friend support and removal of username search. The current traceability file has since been reorganized under newer decision IDs. | Semantically present in current economic audit; older traceability patch not required |
| 92a4d5d653a5a4d3de90cea15eba96a558567bf6 | Remove obsolete username gift lookup endpoint | Current functions/src/index.ts has no lookupStoreGiftRecipient callable; recipient identity comes from the profile route and is validated server-side. | Present |
| 0a25e3a0dc9c60c26f9550cef685fd3f2eed5e53 | Remove store-originated gifting entry point | Current ShopScreen contains no `_gift` method and no lookupStoreGiftRecipient call. Gift actions are exposed on the recipient profile. | Present |
| 67951103a9a376a15c12637dd8cb60c221a75566 | Use catalog fulfillment contract and recipient display name | Current profile feature-gift flow filters catalog items by purchaseEnabled and fulfillmentReady, receives the recipient display name and confirms against the viewed profile UID. | Present |
| 061a330be675aafd6655782d4f993abf667ea00f | Move member gifting entry point to recipient profile | Current profile screen exposes both BetaCoins and store-feature gift actions only when viewing another member; the shop itself remains purchase/browse only. | Present |

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present, hardened or superseded by current documentation organization: 12.
- Confirmed unique missing code changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
No changes were transferred. The package route remains a manual owner-contact purchase request, not an instant wallet credit. The custom balance gift remains a separate quoted transfer. The recipient UID must continue to come from the viewed profile route, not a username lookup. Continue with candidate 145 onward.