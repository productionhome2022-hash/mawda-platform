# Semantic review batch 014 — store gifting domain, Hide Coins and timed-ad cap prerequisites
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 157–162 (6 commits). Candidates 163–174 are covered by the separate Hide Coins/timed-ad cap review.
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


## Follow-up
The following range 163–174 is separately documented in SEMANTIC_REVIEW_BATCH_014_HIDECOINS_TIMEDAD_CAPS_163_174_2026-11-25.md. The later Full Platform decision explicitly rejects unapproved global 10/20 standard timed-ad quotas; only the approved per-campaign ceiling remains active.

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Present: 6.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0.
- No CI success is claimed.

## Safety decision
Keep Hide Coins fail-closed. Do not restore global per-member daily timed-ad quotas without explicit owner approval and centrally configurable policy. The standard per-campaign ceiling of 3 remains distinct from the unapproved global 10/20 proposal. Continue with candidate 175 onward.