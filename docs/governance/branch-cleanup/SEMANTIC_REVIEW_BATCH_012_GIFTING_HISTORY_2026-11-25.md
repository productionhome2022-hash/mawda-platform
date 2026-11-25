# Semantic review batch 012 — store-gift recipient eligibility and history candidates 145–156
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned target HEAD before report: 1af1fa5f57b83d03d820fe4a2b3be7fecfffe1ef
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Source branch: codex/economic-phase1-closeout-2026-11-18
Scope: unique UNMATCHED candidates 145–156 (12 commits).

## Candidate-by-candidate classification

| # | Candidate SHA | Change | Current Full Platform evidence | Result |
|---:|---|---|---|---|
| 145 | 9728cd2128b8acdd06f687caa0ae64f0117535f5 | Bind username lookup to canonical member identity | The historical lookup callable has been removed. Current profile flow sends the recipient profile UID directly; giftStoreItem resolves the users/{recipientUid} document and validates member/guest eligibility. A legacy optional recipientUsername compatibility input remains and is noted below | Superseded by profile-bound UID flow; compatibility input remains |
| 146 | 3fa9124532e809e1e23f23724b5fabac7e529fcd | Preserve purchasedAt for gifted entitlements | Current giftStoreItem writes purchasedAt on the recipient entitlement; gift timestamps and history are persisted through the existing transactional path | Present |
| 147 | 314e3789a36e91310a4569821f0cd9f1fa40877d | Update ECON-007 UI integration status | Current approved decisions document records the profile-scoped package/feature gift routes and separates UI integration from runtime test/acceptance claims | Present, later clarified |
| 148 | 46a90d841437ddc0a0c7411e0fa8d6dec9225622 | Reject disabled accounts in recipient lookup | The old username lookup endpoint is absent. The current giftStoreItem path validates recipient Auth through isEligibleStoreGiftAuthUser, which rejects disabled, provider-less and anonymous accounts | Superseded by stronger current Auth gate |
| 149 | 7fc27c09ca1fe17baf8e3457dc44dc1587c77e11 | Harden gift recipient Auth checks and typing | Current giftStoreItem uses typed UserRecord and isEligibleStoreGiftAuthUser; the pure helper and tests cover disabled, missing-provider, anonymous and malformed provider data | Present, centralized |
| 150 | 958c4b882a2b3b443b02417f38ad50e0acc5185e | Show received store gifts alongside owner grants | Current member entitlement history loads both grant history and getMyStoreGiftHistory, renders sent/received store gifts, and separately displays coin-package gifts | Present, evolved |
| 151 | 4c4cce6aa92b3152c3035ae837c2173efe578409 | Add recipient-owned store gift history endpoint | Current getMyStoreGiftHistory is recipient-authenticated, reads storeGifts and coinPackageGiftHistory, projects both types, sorts by creation time and limits the result set | Present, evolved |
| 152 | 8be0879e4c722f9b467c43abdecbbd4a6b5bd8f2 | Connect store gifting to username lookup in shop | The old shop-originated username flow was later removed under the owner-approved recipient-profile-only decision; profile-scoped feature gifting now sends recipientUid | Superseded; do not restore |
| 153 | ab77650bfc32835c9dcbd7c774a3d651e2cc865b | Add privacy-safe eligible username lookup | The lookupStoreGiftRecipient callable is absent from current index.ts; profile UID is the current UI identity source | Superseded; do not restore |
| 154 | 27490b4c6953a0a7078b3c22c8b83ea18e8e63e4 | Document atomic store gifting backend and remaining gates | Current economic audit records server-side recipient eligibility, catalog/price validation, atomic sender debit, ledger, gift receipt, recipient entitlement/history and notification, with runtime acceptance still open | Present |
| 155 | 61a524a43a50ca3667e5a79402a98ccdfbef5216 | Record store gifting implementation status | Current approved decisions document records the backend and recipient-profile UI route while preserving the unexecuted-test and cross-platform acceptance caveats | Present, updated |
| 156 | 0458747da9cee015c6e614fb822dde6e068ffc2c | Remove unused gift settlement variable | Current giftStoreItem implementation no longer declares the unused sender boost-expiry variable; boost expiry is calculated from recipient state | Present |

## Current source evidence
- functions/src/index.ts blob: 35b161a004a9c8b84c7b6b4f9c8b85bda917fbeb.
- functions/src/store-gifting.ts blob: 5bab25a923048dc861c891137a14342af1c394db.
- functions/test/store-gifting.test.js blob: 74dab5aa6c9553e27f753b9d8df2d70b436e4b39.
- lib/screens/member_entitlement_history_screen.dart current source has the coin-package branch and store-gift display path.

## Result
- Reviewed: 12/1,665 unique candidates (145–156).
- Present, evolved or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred in this batch: 0.
- Tests executed: 0. The unit test definitions and implementation were inspected; no Functions runtime or Flutter tests were run.
- No CI success is claimed.

## Compatibility note
The old lookupStoreGiftRecipient callable and shop username UI are removed. The giftStoreItem callable still accepts an optional recipientUsername input as a compatibility path, but the current profile UI sends recipientUid. This review does not remove that input because all external/legacy clients have not been proven migrated. A separate contract-tightening change should first confirm client coverage and add a negative test for username-only requests.

## Safety decision
Gift settlement remains server-authoritative and transactional. Auth eligibility rejects disabled/anonymous recipients. No payment, production wallet mutation, billing, Firebase production resource, deployment or main-branch action was performed.