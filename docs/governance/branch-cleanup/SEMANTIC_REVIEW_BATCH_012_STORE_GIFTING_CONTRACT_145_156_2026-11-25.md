# Semantic review batch 012 — store gifting contract and history
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 145–156 (12 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 9728cd2128b8acdd06f687caa0ae64f0117535f5 | Bind username lookup to canonical member identity | The lookup callable has been removed under the approved profile-only workflow; the active gift flow uses profile UID and server-side recipient checks. | Superseded by removal of username lookup |
| 3fa9124532e809e1e23f23724b5fabac7e529fcd | Preserve purchasedAt contract for gifted entitlements | Current giftStoreItem writes purchasedAt alongside gift metadata and expiry on the recipient entitlement. | Already implemented |
| 314e3789a36e91310a4569821f0cd9f1fa40877d | Update ECON-007 UI integration status | Current approved-decision traceability has GIFT-001/GIFT-002 rows reflecting the recipient-profile workflow, backend contract and test gates. | Superseded by current traceability entries |
| 46a90d841437ddc0a0c7411e0fa8d6dec9225622 | Reject disabled accounts in gift recipient lookup | Lookup callable is removed; the active giftStoreItem flow uses isEligibleStoreGiftAuthUser, which rejects disabled, missing-provider and anonymous identities. | Already enforced on active path |
| 7fc27c09ca1fe17baf8e3457dc44dc1587c77e11 | Harden gift recipient Auth checks and typing | Current store-gifting.ts centralizes Auth eligibility and checks disabled/providerData/anonymous state before the transaction. | Already implemented |
| 958c4b882a2b3b443b02417f38ad50e0acc5185e | Show received store gifts alongside owner grants | Current MemberEntitlementHistoryScreen loads getMyStoreGiftHistory alongside owner grant history and renders received/sent store gifts. A separate MemberGiftHistoryScreen also renders received package gifts. | Already implemented, expanded |
| 4c4cce6aa92b3152c3035ae837c2173efe578409 | Add recipient-owned store gift history endpoint | Current getMyStoreGiftHistory is authenticated, member-gated and returns whitelisted entries for store gifts and received coin-package gifts. | Already implemented, expanded |
| 8be0879e4c722f9b467c43abdecbbd4a6b5bd8f2 | Connect store gifting to member lookup and callable | The old shop-originated username workflow was removed; active profile gifting sends the profile UID to giftStoreItem. | Superseded by profile-only workflow |
| ab77650bfc32835c9dcbd7c774a3d651e2cc865b | Add privacy-safe eligible recipient lookup | The standalone lookup endpoint was later removed under the approved no-username-lookup decision. | Superseded; do not restore |
| 27490b4c6953a0a7078b3c22c8b83ea18e8e63e4 | Document atomic store gifting backend and remaining gates | Current economic audit contains the member-to-member gifting implementation, recipient eligibility, atomic settlement, replay and remaining verification gates. | Already documented, later expanded |
| 61a524a43a50ca3667e5a79402a98ccdfbef5216 | Record store gifting implementation status | Current decision traceability records implementation and explicitly retains the emulator/Flutter acceptance gates. | Already documented, later updated |
| 0458747da9cee015c6e614fb822dde6e068ffc2c | Remove unused gift settlement variable | Current giftStoreItem implementation does not contain the obsolete sender-side boostExpiry variable; it uses recipient entitlement/boost expiry state. | Already removed or superseded |

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Already implemented, documented or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.

## Safety decision
Do not restore the username lookup endpoint or shop-originated gift path. The current profile-scoped UID workflow, server Auth eligibility, catalog version checks, atomic settlement and member history are the active contracts.