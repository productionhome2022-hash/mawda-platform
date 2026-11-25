# Semantic review batch 013 — store-gifting and timed-ad reward safety candidates 157–168
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned target HEAD before report: 6dfdad298933cfef468d306c1b8b7543898765fa
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
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
| 166 | e373dd59cbdc697b174eb46f1d5776934e5f76d1 | Document transactional daily reward cap guard | Current economic audit specifies 10 claims/day and 20 BetaCoins/day with transactional enforcement and exact-boundary tests | Present; implementation restored in this batch |
| 167 | 486d8243a81e61e771dab3d1fb3704c7de739b02 | Add exact-boundary tests for daily reward caps | Added decideTimedAdDailyCap unit coverage for 9/10 claims, 20/21 coin boundary, exact-limit acceptance, malformed negative/zero/unsafe values | Implemented in this batch |
| 168 | 49261c8fc6dfe290e09ac5cef22663aebeedbe06 | Remove superseded daily-cap constant imports | Current index imports the pure decision helper rather than the superseded direct constants; daily cap is now enforced through the helper and a shared daily counter | Present after integration |

## Gap found and transferred
The current Full Platform version did not contain decideTimedAdDailyCap in engagement-rewards.ts, its boundary tests, or the completeTimedAdvertisement transaction. The Recovery/economic source branch contained the helper and daily-counter design, while current Full Platform only enforced per-campaign limits. This left the documented member-wide daily cap of 10 timed-ad claims and 20 reward BetaCoins unenforced across campaigns.

Transferred the missing behavior with minimal target-aware adaptation:
- Added TIMED_AD_DAILY_MAX_CLAIMS_PER_MEMBER=10, TIMED_AD_DAILY_MAX_REWARD_COINS_PER_MEMBER=20 and decideTimedAdDailyCap to functions/src/engagement-rewards.ts.
- Added exact-boundary and malformed-input unit tests to functions/test/engagement-rewards.test.js.
- Integrated a shared UTC-day document under timedAdMemberDailyCounters into completeTimedAdvertisement. The transaction reads the daily counter with the claim/user/campaign/campaign-counter records, validates UID/period identity, applies the pure cap guard before any credit, and atomically increments claimCount/rewardCoins with the wallet credit, claim, campaign settlement and session completion.
- A cap rejection cancels the session, releases the reserved campaign reward and returns resource-exhausted without crediting the wallet.

## Changed source references
- Helper update commit: 22884b74d3e614ac85ada55bf48e7fcfc94a92ce.
- Unit test update commit: 6870fde48c4f14a24038e1070da83ec9376d140b.
- Transaction integration commit: 8496f441719e55f0db07f48c519383655dcde35e.
- Current functions/src/engagement-rewards.ts blob at review: 2e5d3dd11c0e1138414b582d287544949f96fa3b.
- Current functions/test/engagement-rewards.test.js blob at review: 84d58e43a46a2b8548f304daff254c5f5ed7bbd3.
- Current functions/src/index.ts blob at review: 036d5590d029b591de9a174d070fab24698cc4fd.

## Result
- Reviewed: 12/1,665 unique candidates (157–168).
- Present or superseded: 9.
- Unique missing behavior transferred: 1 daily reward cap guard, including unit tests and atomic transaction integration.
- Tests executed: 0. Test code was added and inspected, but no Node/Functions runtime or Firestore emulator was available in this workflow.
- CI status for the change commit: no combined statuses recorded; no CI success is claimed.

## Safety and remaining validation
No live Firebase resources, wallet balances, campaign budgets, production billing, prices or main branch were changed. Before acceptance, run the Functions unit suite and Firestore Emulator integration tests against this exact branch SHA, including concurrent completion attempts across different campaigns for the same member to prove the shared daily counter cannot be exceeded.