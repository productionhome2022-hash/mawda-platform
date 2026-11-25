# Semantic review batch 008 — profile-scoped member gifting
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 121–132 (12 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 442cc5e0e0b7f24c159f3de3fe939cb20522bdc8 | Test recipient-bound package gift request validation | Current coin-purchase-requests tests cover valid package recipient binding, reject custom gifts and reject malformed recipient UIDs. | Already implemented, expanded |
| 05d6344af82fe99403196b4fff7b2684e13ac0c9 | Use Firestore document identity for gift recipient | Current createCoinPurchaseRequest validates the recipient document, member status/profile completion and guest exclusion without requiring a duplicated uid/memberId field inside the document. | Already implemented |
| 8d23f14ff1ff63cffd291958f28c73d4d5f390ab | Offer package gift or wallet-balance gift from recipient profile | Current profile UI now offers both methods: package purchase request bound to widget.profileUserId, or wallet-balance transfer through the existing quote/commission/transfer flow. | Missing profile UX implemented |
| dc3a609c5dca89271e9fc043d1303b933033522a | Credit verified package gifts to recipient atomically | Current approval flow credits the profile-bound recipient, not purchaser, and writes recipient wallet ledger, gift receipt/history, notification and owner audit atomically. | Already implemented |
| 8837c51e6510f6f2d7ef5abde55200f9c875ce86 | Bind package gift requests to eligible recipient | Current createCoinPurchaseRequest binds giftRecipientUid, rejects self-gifting, checks recipient member/guest/Auth eligibility and preserves recipient identity in replay compatibility. | Already implemented |
| 7c0eeb43d2535f1acad8d24b06aa78b62770d725 | Validate recipient-bound package requests | Current validator supports giftRecipientUid only for package requests, validates UID format and rejects custom-amount gifts. | Already implemented, hardened |
| 630431051e09c80d9276065ee372396cd5bde82f | Document profile-scoped feature gifting and remove shop gifting | Current economic audit records profile-scoped feature gifting; implementation now moves the entry point to profile and removes shop-originated gifting. | Already documented and implemented |
| 05f26e299b5c788bb7137a4383323e9c78f04e67 | Record profile-scoped gifting decision | Current audit/decision records and the profile UI follow the recipient-profile-only workflow. | Already documented/implemented |
| 92a4d5d653a5a4d3de90cea15eba96a558567bf6 | Remove obsolete username gift lookup endpoint | Current functions/src/index.ts no longer exports lookupStoreGiftRecipient. | Already removed |
| 0a25e3a0dc9c60c26f9550cef685fd3f2eed5e53 | Remove shop-originated gifting entry point | Removed the shop screen's username-based _gift method and its button; shop remains a browse/self-purchase surface. | Missing UI restriction implemented |
| 67951103a9a376a15c12637dd8cb60c221a75566 | Use catalog fulfillment contract and recipient display name | Profile gift selection now requires purchaseEnabled and fulfillmentReady, reads catalog version, displays the actual recipient name, and sends expectedCatalogVersion to the callable. | Missing catalog gate implemented |
| 061a330be675aafd6655782d4f993abf667ea00f | Move feature gifting entry point to recipient profile | Added profile-only feature-gift control and flow. Receipt validation also checks giftId, recipientUid and itemId before showing success. | Missing profile flow implemented and hardened |

## Files changed
- lib/screens/profile_screen.dart — added the two-method coin gifting choice, package gift request bound to the viewed profile UID, and profile-only feature gifting with fulfillment/version gates and receipt identity checks.
- lib/screens/shop_screen.dart — removed username-based gift method and gift button; self-purchase remains.

## Verification
- Reviewed: 12/1,665 unique candidates in this batch.
- Already present/documented: 8.
- Missing profile-scoped UI behaviors implemented: 4 related changes across 2 files.
- Confirmed missing backend settlement changes: 0.
- Current tests include functions/test/integration/coin-package-gifts.integration.test.js and store-gifting tests; source read-back confirms backend recipient checks and atomic settlement are present.
- Tests executed during this review: 0. Flutter Analyze/Tests and Functions/Firestore Emulator tests have not been run.
- No prices, package values, commissions, wallet arithmetic, Firebase production resources or payment settings changed.

## Residual verification item
The callable giftStoreItem still contains a legacy recipientUsername compatibility path in addition to recipientUid. The active UI no longer uses username lookup and now sends the profile UID, while the separate lookupStoreGiftRecipient callable is absent. Whether to remove the callable's legacy username compatibility path requires a separate call-site/test audit before changing its API contract.

## Safety decision
Only the approved profile-scoped UI flow was restored. Server-side member eligibility, catalog version, exact price, atomic wallet debit, entitlement grant and replay protections remain authoritative. No old branch was merged wholesale.