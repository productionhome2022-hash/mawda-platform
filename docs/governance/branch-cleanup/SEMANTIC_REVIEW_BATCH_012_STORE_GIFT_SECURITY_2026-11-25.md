# Semantic review batch 012 — store-gift eligibility, history and profile flow, candidates 145–156
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform HEAD inspected after source updates: 6a536ef723a71b59f8c92bf66595f20b648caab7
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 144–155 (candidate numbers 145–156).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 145 | 9728cd2128b8acdd06f687caa0ae64f0117535f5 | Bind gift recipient lookup to canonical member identity | Username lookup endpoint has been removed under the later owner-approved profile-scoped flow; this historical lookup hardening is obsolete. The active profile flow passes the profile UID directly and the callable revalidates recipient eligibility. |
| 146 | 3fa9124532e809e1e23f23724b5fabac7e529fcd | Preserve purchasedAt contract for gifted entitlements | Current giftStoreItem writes purchasedAt together with giftedAt-compatible entitlement metadata. Present. |
| 147 | 314e3789a36e91310a4569821f0cd9f1fa40877d | Update gifting UI integration status | Current approved-decision traceability no longer states that store UI integration is still pending; profile-scoped gift flow is documented. Present. |
| 148 | 46a90d841437ddc0a0c7411e0fa8d6dec9225622 | Reject disabled accounts in obsolete gift recipient lookup | Lookup endpoint is removed. Disabled-account validation is required on the active giftStoreItem recipient path and was absent. Superseded for lookup; active path addressed by candidate 149 implementation below. |
| 149 | 7fc27c09ca1fe17baf8e3457dc44dc1587c77e11 | Harden gift recipient Auth checks and typing | Current giftStoreItem lacked Firebase Auth provider validation despite member-record checks. Added a server-side Auth preflight for new gifts, rejecting missing, disabled, anonymous or malformed provider identities. Exact replay bypasses the preflight only when the deterministic gift receipt already exists; the transaction still verifies receipt/ledger/audit consistency. Commits: 6b8d61bcd4d2ec56339a0d437cba02476f61f8c1, dcf7e0cb3a539f0bb2961ea39554aa465e71441a, 99e5f4e3b1dfd86aeb845c31a1c3d6896e8b54af, and 6a536ef723a71b59f8c92bf66595f20b648caab7. |
| 150 | 958c4b882a2b3b443b02417f38ad50e0acc5185e | Show received store gifts alongside owner grants | Current member entitlement history loads both getMyEntitlementGrantHistory and getMyStoreGiftHistory and displays received/sent gifts separately from free grants. Present. |
| 151 | 4c4cce6aa92b3152c3035ae837c2173efe578409 | Add recipient-owned store gift history endpoint | Current getMyStoreGiftHistory returns only the authenticated member's sent/received store gifts and coin-package gift history. Present and expanded. |
| 152 | 8be0879e4c722f9b467c43abdecbbd4a6b5bd8f2 | Connect store gifting to username lookup and shop callable | Superseded by owner-approved recipient-profile-only gifting; the old username lookup/shop entry point has been removed. |
| 153 | ab77650bfc32835c9dcbd7c774a3d651e2cc865b | Add privacy-safe eligible gift recipient lookup | Superseded by the profile UID flow; lookupStoreGiftRecipient is absent from current Functions exports/source. |
| 154 | 27490b4c6953a0a7078b3c22c8b83ea18e8e63e4 | Document atomic store gifting backend and remaining gates | Current economic audit documents the atomic debit, ledger, gift receipt, recipient entitlement/history, notification, replay and remaining test gates. Present. |
| 155 | 61a524a43a50ca3667e5a79402a98ccdfbef5216 | Record store gifting implementation status | Current approved-decision traceability documents the profile-scoped UI and does not retain the obsolete statement that UI integration is still pending. Present. |
| 156 | 0458747da9cee015c6e614fb822dde6e068ffc2c | Remove unused gift settlement variable | Current giftStoreItem expiry calculation uses recipient entitlement and recipient boost expiry; the obsolete sender-side boostExpiry variable is absent. Present. |

## Change made
- Added `isEligibleStoreGiftAuthUser` to functions/src/store-gifting.ts. It fails closed for disabled users, missing/empty provider lists, malformed provider entries, and identities whose providers are all anonymous.
- Added unit cases for registered, disabled, providerless, anonymous-only and malformed Auth provider records in functions/test/store-gifting.test.js.
- Added an Auth preflight before the giftStoreItem Firestore transaction for new gifts. Exact replay skips the new Auth lookup only when the deterministic gift receipt already exists; the transaction still checks the gift, ledger and audit projections before returning replay success.
- This closes a recipient-account eligibility gap without changing prices, wallet arithmetic, catalog fulfillment, or gift entitlements.

## Result and verification
- Reviewed: 12 unique candidates (145–156).
- Present or superseded by later profile-scoped architecture: 11.
- Missing active-path security behavior restored: 1.
- Tests added: 1 focused unit test covering Auth provider eligibility. Tests executed: 0; Functions/Firestore Emulator was not run.
- No CI success is claimed. No production, Firebase, billing, or main-branch operation was performed.