# Semantic review batch 012 — store gifting backend and recipient history candidates 145–156
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: d303f2169c5e376c38e7017af71f1a81460e3b7d
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 145–156, continuing sequentially.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence | Result |
|---|---|---|---|
| 9728cd2128b8acdd06f687caa0ae64f0117535f5 | Bind gift recipient lookup to canonical member identity | The historical username lookup endpoint has been removed entirely; current profile-route UID is the recipient authority and is revalidated by giftStoreItem | Superseded; no lookup endpoint to harden |
| 3fa9124532e809e1e23f23724b5fabac7e529fcd | Preserve purchasedAt contract for gifted entitlements | Current giftStoreItem writes purchasedAt on the recipient entitlement; downstream entitlement history/query uses purchasedAt. The current model no longer requires the historical extra giftedAt field | Present, evolved |
| 314e3789a36e91310a4569821f0cd9f1fa40877d | Update ECON-007 UI integration status | Current central decisions now have GIFT-001/GIFT-002 with the profile/package/custom transfer distinctions and explicit test/acceptance gates; economic audit documents the implementation and remaining gaps | Present and updated by later records |
| 46a90d841437ddc0a0c7411e0fa8d6dec9225622 | Reject disabled accounts in gift recipient lookup | Username lookup endpoint is absent; current giftStoreItem checks recipient Auth disabled/provider state before settlement | Superseded at lookup layer; equivalent eligibility guard remains in active gifting callable |
| 7fc27c09ca1fe17baf8e3457dc44dc1587c77e11 | Harden gift recipient Auth checks and typing | Current giftStoreItem uses typed UserRecord, rejects disabled recipients and anonymous/no-provider Auth identities | Present |
| 958c4b882a2b3b443b02417f38ad50e0acc5185e | Show received store gifts alongside owner grants | Current member entitlement history loads grant history and getMyStoreGiftHistory together; store gifts and coin-package gifts are rendered separately from owner grants | Present, evolved |
| 4c4cce6aa92b3152c3035ae837c2173efe578409 | Add recipient-owned store gift history endpoint | Current getMyStoreGiftHistory validates the member and merges sent/received store gifts with coinPackageGiftHistory, sorts by creation time and returns a bounded/truncated result | Present, expanded |
| 8be0879e4c722f9b467c43abdecbbd4a6b5bd8f2 | Connect store gifting to username lookup and callable | This historical store-originated username lookup flow was intentionally removed by later owner decision; current profile-scoped giftStoreItem uses the opened profile UID instead | Superseded; do not reintroduce username search |
| ab77650bfc32835c9dcbd7c774a3d651e2cc865b | Add privacy-safe eligible gift recipient lookup | lookupStoreGiftRecipient is absent from current index.ts; recipient selection is profile-route based, not username lookup | Superseded; no port |
| 27490b4c6953a0a7078b3c22c8b83ea18e8e63e4 | Document atomic store gifting backend and remaining gates | Current economic audit records giftStoreItem, server-side eligibility, catalog/price validation, atomic sender debit/ledger/receipt/recipient entitlement/history/notification, replay binding and test gaps | Present |
| 61a524a43a50ca3667e5a79402a98ccdfbef5216 | Record store gifting implementation status | Current GIFT-002 records recipient-profile-only feature gifting, and GIFT-001 records coin-package/custom balance gifting; both state server-side validation and remaining acceptance gates | Present, consolidated |
| 0458747da9cee015c6e614fb822dde6e068ffc2c | Remove unused gift settlement variable | Current giftStoreItem contains no obsolete sender boost-expiry variable; recipient expiry is the authoritative source | Present |

## Result
- Reviewed: 12/1,665 unique candidates (candidates 145–156).
- Present or superseded by later owner-approved design: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0. Source/test-definition inspection only; no Functions or Flutter runner was invoked.
- No CI success is claimed.

## Safety note
Do not reintroduce the username lookup endpoint or shop-originated gift flow. The active flow uses the recipient profile UID, server-side membership/Auth validation and transactional settlement. No payment or production wallet mutation occurred.

## Next
Continue from candidate 157.