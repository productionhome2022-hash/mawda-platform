# Semantic review batch 013 — store-gifting and timed-ad reward candidates 157–168
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Source branch: codex/economic-phase1-closeout-2026-11-18
Scope: unique UNMATCHED candidates 157–168 (12 commits).

## Candidate-by-candidate classification

| # | Candidate SHA | Change | Current Full Platform evidence | Result |
|---:|---|---|---|---|
| 157 | 90041f905669ebc86436cf842bb1b93c68145ad1 | Add store-gifting domain regression tests | Current store-gifting.test.js covers replay binding, member/guest eligibility, timed expiry stacking, permanent entitlement preservation, invalid durations and malformed expiry; Auth eligibility tests also cover disabled and anonymous providers | Present |
| 158 | 1d2f1ca363ab0b96657e4102e5906a602de3a211 | Implement atomic member-to-member store gifting | Current giftStoreItem callable revalidates catalog version/price, sender/recipient eligibility, exact recipient, sender balance, ledger, gift receipt, recipient entitlement/history and notification transactionally | Present |
| 159 | a5d53f40713c824308b92d5cf8c37facf02c30ac | Add store-gifting guards and expiry stacking | Current store-gifting.ts contains replay compatibility, member eligibility, Auth eligibility and fail-closed expiry stacking | Present |
| 160 | a078e6c14906caa3956fd6342bc01432dcbabe50 | Document approved renewal and gifting lifecycle | Current economic audit records exact-duration entitlement, expired-item repurchase, recipient eligibility, atomic gifting and stacking rules | Present |
| 161 | 53576b77318953d4c14fffb174a9109e9924f3cc | Record store renewal and gifting rules | Current approved decisions document records ECON-007, including sender/recipient validation, atomic settlement, idempotency and owner-grant separation | Present |
| 162 | b1d4c72e58a6a4cc67f49cb3f14d95033899a91e | Record no-op Hide Coins SKU constraint | Current approved decisions document states that Hide Coins has no distinct value while balances are already hidden from all non-owners and must remain fail-closed | Present |
| 163 | ee08abd87a68a7a38748658788e9a65537d07549 | Document fail-closed Hide Coins correction | Current economic audit states that hide_coins_30d is removed from fulfillment-ready allowlist and must not be sold until distinct owner-approved behavior exists | Present |
| 164 | 83a86742a1212d93f3b328d2467a6843ccd86771 | Prevent charging for redundant Hide Coins | Current store-catalog.test.js asserts that active/purchasable Hide Coins input fails with STORE_FULFILLMENT_NOT_READY and that disabled catalog form is not purchasable | Present |
| 165 | 3fd0af8c29b3165a77c3adf2dd77f3f2fc293266 | Keep Hide Coins SKU fail-closed | Current store-catalog.ts fulfillment allowlist does not include hide_coins_30d; purchase validation fails closed | Present |
| 166 | e373dd59cbdc697b174eb46f1d5776934e5f76d1 | Document transactional daily reward cap guard | Historical audit says 10 claims/day and 20 BetaCoins/day were implemented in a prior source state. The current approved decision register does not authorize these fixed global quotas; audit text alone is not policy approval | Historical record; not current authorization |
| 167 | 486d8243a81e61e771dab3d1fb3704c7de739b02 | Add exact-boundary tests for daily reward caps | The tests depend on fixed 10/20 quotas that are not present in the current approved decision set. They were not ported | Held pending owner approval |
| 168 | 49261c8fc6dfe290e09ac5cef22663aebeedbe06 | Remove superseded daily-cap constant imports | Current index.ts has no direct imports of the old cap constants; no change is required | Already reflected / no-op |

## Policy authority finding
The economic audit contains a historical implementation statement for fixed daily limits of 10 timed-ad claims and 20 BetaCoins per member per UTC day. The current MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md and IMPLEMENTATION_TRACEABILITY.md do not record owner approval for those hard-coded global quotas. The project constitution requires owner-controlled quotas and centrally configurable development values. Therefore the helper, global daily counter, fixed 10/20 limits and associated tests are not authorized for transfer at this time.

A temporary implementation attempt was made during this review, then fully reverted before acceptance. The current target contains no decideTimedAdDailyCap helper, no timedAdMemberDailyCounters collection writes, no fixed 10/20 constants and no daily_cap cancellation branch. The prior helper/test/index commits are not part of the accepted branch state.

## Result
- Reviewed: 12/1,665 unique candidates (157–168).
- Present: 9.
- Historical quota documentation: 1.
- Held pending owner approval: 1 test candidate dependent on the unapproved quotas.
- Already reflected/no-op: 1.
- Confirmed unique code changes transferred: 0.
- Tests executed: 0. No Node/Functions runtime or Firestore emulator was invoked.
- No CI success is claimed.

## Safety and remaining validation
The current Full Platform retains its existing campaign-specific limits and featured-ad configured checks. It does not claim a fixed global 10/20 timed-ad quota. The historical audit statement must not be treated as proof of current enforcement. If the owner approves global limits, implement them through centrally configurable policy, with transaction-level atomic counters and exact-boundary/concurrency tests. No live Firebase resources, wallet balances, campaign budgets, production billing, prices or main branch were changed.