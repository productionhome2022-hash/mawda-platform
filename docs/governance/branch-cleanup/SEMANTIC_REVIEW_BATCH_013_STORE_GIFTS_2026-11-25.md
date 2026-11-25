# Semantic review batch 013 — store gifting identity, entitlement and history
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 145–156 (12 commits).
Inspected Full Platform evidence: functions/src/index.ts blob 94e60843b5c6cedbc49aa4aa86735eeed2c62396; coin-purchase-requests.ts 422e392ce0657c8ff31af9790701d25e5de99a19; member_entitlement_history_screen.dart e0096748339978302486002f9dbd7a3a8a6adff7; profile_screen.dart 2e054da912c753c9d53e3e41f0cee84533cb2303; shop_screen.dart 5389c93569c8957c2e8ebb9ae51cbf4d0fb6bff9.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 9728cd2128b8acdd06f687caa0ae64f0117535f5 | Bind username lookup to canonical member identity | The username lookup endpoint was subsequently removed as part of the owner-approved profile-scoped flow. The current direct recipient UID is sourced from the profile route and validated against the Firestore users document; no username lookup is used. | Superseded by profile-scoped recipient identity |
| 3fa9124532e809e1e23f23724b5fabac7e529fcd | Preserve purchasedAt contract for gifted entitlements | Current giftStoreItem writes `purchasedAt` on the recipient entitlement, alongside giftId/giftedByUid and catalog version binding. The historical extra `giftedAt` field is not required by the current entitlement contract. | Present in evolved form |
| 314e3789a36e91310a4569821f0cd9f1fa40877d | Update ECON-007 UI integration status | Current economic audit documents the recipient-profile gifting UI, package and balance flows, and outstanding test/acceptance gates. | Present in current audit |
| 46a90d841437ddc0a0c7411e0fa8d6dec9225622 | Reject disabled accounts in gift recipient lookup | The lookup endpoint was removed. Current giftStoreItem obtains recipient Auth record and rejects disabled, providerless or anonymous recipient accounts before the transactional gift operation. | Present in replacement flow |
| 7fc27c09ca1fe17baf8e3457dc44dc1587c77e11 | Harden gift recipient Auth checks and typing | Current giftStoreItem uses typed UserRecord and checks disabled/providerData/anonymous status; profile and guest records are also revalidated in the transaction. | Present |
| 958c4b882a2b3b443b02417f38ad50e0acc5185e | Show received store gifts alongside owner grants | Current entitlement history loads the member's grant history and gift history separately and renders store gifts alongside grants; coin package gifts are distinguished by giftKind. | Present and expanded |
| 4c4cce6aa92b3152c3035ae837c2173efe578409 | Add recipient-owned store gift history endpoint | Current getMyStoreGiftHistory returns gifts sent/received by the authenticated member and coin package gifts from that member's own history subcollection, with a bounded merged result. | Present and expanded |
| 8be0879e4c722f9b467c43abdecbbd4a6b5bd8f2 | Connect store item gifting to username lookup and callable | This historical shop-originated username flow was superseded by recipient-profile-scoped gifting. Current ShopScreen has neither a gift method nor lookupStoreGiftRecipient call. | Superseded; do not restore shop lookup |
| ab77650bfc32835c9dcbd7c774a3d651e2cc865b | Add privacy-safe eligible gift recipient lookup | The lookup endpoint was later removed. The current profile route supplies the UID directly and server-side giftStoreItem validates the recipient and catalog terms. | Superseded by profile-scoped flow |
| 27490b4c6953a0a7078b3c22c8b83ea18e8e63e4 | Document atomic store gifting backend and remaining gates | Current economic audit documents server-side recipient eligibility, catalog/price revalidation, atomic debit/ledger/receipt/entitlement/history/notification and replay binding, while retaining unexecuted tests and acceptance gates. | Present |
| 61a524a43a50ca3667e5a79402a98ccdfbef5216 | Record store gifting implementation status | Current economic audit records the implemented callable backend and profile UI while explicitly not claiming full shipment or acceptance before runtime tests. | Present in current audit; traceability file has newer organization |
| 0458747da9cee015c6e614fb822dde6e068ffc2c | Remove unused gift settlement variable | Current giftStoreItem does not retain the unused sender boost-expiry variable; it uses the recipient's current entitlement/boost expiry. | Present |

## Cross-layer observations
- Recipient identity is anchored to the viewed profile UID; the username lookup callable and shop-originated gift flow are absent.
- Gifted feature entitlements preserve the `purchasedAt` contract and record gift identity/catalog version.
- The member history endpoint is recipient-scoped and returns a bounded merged history; the UI displays store-feature and coin-package gifts with owner grants.
- Current implementation remains subject to the previously documented requirement for exact-SHA Functions/Firestore Emulator and Flutter test execution; source presence is not test success.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present, evolved or superseded by the approved profile-scoped flow: 12.
- Confirmed unique missing code changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and UI/test-file inspection only.
- No CI success is claimed.

## Safety decision
No changes were transferred. Do not restore the removed username lookup or shop gift entry point. Keep the recipient profile as the authoritative gift destination and preserve server-side eligibility, catalog validation, idempotency, wallet ledger and recipient history. Continue with candidate 157 onward.