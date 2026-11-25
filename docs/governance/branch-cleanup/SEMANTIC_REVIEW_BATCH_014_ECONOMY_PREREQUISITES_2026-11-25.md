# Semantic review batch 014 — store gifting domain, Hide Coins and timed-ad cap prerequisites
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 157–168 (12 commits).
Inspected Full Platform evidence: store-gifting.ts 9bc8e4aaf16701e65a1dd238bc03e5fc241e7904; store-gifting.test.js 4a6b07c8da0ec7e293902acd0d275c07874567ee; store-catalog.ts b31aaefa0ad331f3c431a6f2bc27ba951658d2dc; store-catalog.test.js c97c16afff5a1ed8017a6982652f288754bcf384; engagement-rewards.ts a3d420db0de09bf1841bf70acd70eada639f8c4a; engagement-rewards.test.js 261844b2680b0c006665ffc74b399de0736ebc3b; index.ts 35b161a004a9c8b84c7b6b4f9c8b85bda917fbeb; economic audit 0e58764259e5bc28200e8ddafbe377ee31ba95f8.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 90041f905669ebc86436cf842bb1b93c68145ad1 | Add store gifting domain regression tests | Current store-gifting.test.js covers sender/recipient/item/price-bound replay, eligible member record, expiry stacking, permanent entitlement preservation and malformed inputs. | Present |
| 1d2f1ca363ab0b96657e4102e5906a602de3a211 | Implement atomic member-to-member store gifting | Current giftStoreItem callable revalidates catalog version/price, recipient identity and eligibility, performs sender debit, immutable ledger, gift receipt, recipient entitlement/history and audit transactionally. | Present and evolved |
| a5d53f40713c824308b92d5cf8c37facf02c30ac | Add gifting domain guards and expiry stacking | Current store-gifting.ts exports replay compatibility, member eligibility and expiry stacking; unit tests cover active, expired and permanent entitlements. | Present |
| a078e6c14906caa3956fd6342bc01432dcbabe50 | Document approved renewal and gifting lifecycle | Current economic audit records server-side expiry, repurchase after expiry, gifting eligibility, atomic debit/ledger/receipt/history and timed entitlement stacking, with outstanding tests/acceptance retained. | Present |
| 53576b77318953d4c14fffb174a9109e9924f3cc | Record store renewal and member gifting rules | Current approved decisions record ECON-007 and the owner-approved store renewal/gifting lifecycle. | Present |
| b1d4c72e58a6a4cc67f49cb3f14d95033899a91e | Record no-op Hide Coins SKU constraint | Current economic audit states Hide Coins provides no additional privacy effect under default balance privacy and must remain non-purchasable. | Present |
| ee08abd87a68a7a38748658788e9a65537d07549 | Document fail-closed Hide Coins correction | Current economic audit records removal from fulfillment-ready allowlist and fail-closed purchase validation. | Present |
| 83a86742a1212d93f3b328d2467a6843ccd86771 | Prevent charging for redundant Hide Coins entitlement | Current store-catalog.ts excludes hide_coins_30d from fulfillment-ready items; current tests assert validation fails with STORE_FULFILLMENT_NOT_READY and the inactive item is not purchasable. | Present |
| 3fd0af8c29b3165a77c3adf2dd77f3f2fc293266 | Keep redundant Hide Coins SKU fail-closed | Current fulfillment-ready category map no longer includes hide_coins_30d. | Present |
| e373dd59cbdc697b174eb46f1d5776934e5f76d1 | Document testable transactional daily reward cap guard | The current economic audit contains this statement, but the corresponding decideTimedAdDailyCap helper and daily counter transaction are absent from Full Platform. This document currently overstates the implementation state and is flagged for correction after the dependent code candidate is reviewed. | Documentation present; implementation claim currently unsubstantiated on target |
| 486d8243a81e61e771dab3d1fb3704c7de739b02 | Add exact-boundary tests for timed-ad daily reward caps | Current engagement-rewards.test.js does not import or test decideTimedAdDailyCap. The source branch has the tests, but the helper and transactional daily counter are missing from Full Platform. | Unique missing test delta; dependent on the missing daily-cap implementation |
| 49261c8fc6dfe290e09ac5cef22663aebeedbe06 | Remove superseded timed-ad cap constant imports | Current index.ts does not import the old cap constants; the cleanup is already reflected in the target's different import set. | No-op / already absent |

## Important cross-batch finding
The source branch contains a coherent timed-ad daily-cap feature across separate commits: per-member/per-UTC-day counter persistence, 10 claims/day, 20 BetaCoins/day, a maximum of 3 claims per member per campaign, a pure decision helper and exact-boundary unit tests. Full Platform currently has only per-campaign counters and a separate featured-ad policy helper; it does not persist the global timed-ad daily counter or enforce the 10/20 global caps in completeTimedAdvertisement. The daily-cap feature commits occur in the next candidate range and will be reviewed together before any transfer. Do not treat the audit paragraph alone as proof of enforcement.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present: 9.
- Dependent missing timed-ad daily-cap test delta: 1.
- No-op/already absent: 1.
- Documentation present but currently ahead of code: 1.
- Code transferred: 0.
- Tests executed during this review: 0.
- No CI success is claimed.

## Safety decision
Keep Hide Coins fail-closed. Do not claim timed-ad daily caps are enforced until the global per-member UTC-day counter, transaction writes and exact-boundary tests are restored and reviewed together. Continue with candidate 169 onward.