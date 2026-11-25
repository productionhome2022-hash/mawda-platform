# Semantic review batch 013 — store gifting regression coverage and timed-ad cap history, candidates 157–168
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform HEAD inspected: 66cf62a282dafeaacb75e19c88535da7c1f18cfc
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 156–167 (candidate numbers 157–168).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 157 | 90041f905669ebc86436cf842bb1b93c68145ad1 | Add store gifting domain regression tests | Current store-gifting.test.js covers replay identity, recipient profile eligibility, timed expiry stacking, permanent entitlement preservation, malformed expiry and the added Firebase Auth eligibility helper. Present and expanded. |
| 158 | 1d2f1ca363ab0b96657e4102e5906a602de3a211 | Implement atomic member-to-member store gifting | Current giftStoreItem validates sender/recipient, catalog snapshot/version, price, replay receipt, wallet ledger, entitlement, audit and notification in the Firestore transaction. Present and expanded. |
| 159 | a5d53f40713c824308b92d5cf8c37facf02c30ac | Add gifting domain guards and expiry stacking | Current store-gifting.ts contains replay binding, member eligibility, fail-closed expiry parsing and timed entitlement stacking. Present and expanded. |
| 160 | a078e6c14906caa3956fd6342bc01432dcbabe50 | Document approved store renewal and gifting lifecycle | Current economic audit contains the renewal/gifting lifecycle and Hide Coins fail-closed rationale. Present. |
| 161 | 53576b77318953d4c14fffb174a9109e9924f3cc | Record store renewal and member gifting rules | Current decision traceability contains ECON-007 and ECON-005 constraints; no new policy needs importing from this older commit. Present. |
| 162 | b1d4c72e58a6a4cc67f49cb3f14d95033899a91e | Record no-op Hide Coins SKU constraint | Current store catalog fulfillment allowlist excludes hide_coins_30d; the current test asserts purchase validation fails closed. Present. |
| 163 | ee08abd87a68a7a38748658788e9a65537d07549 | Document fail-closed Hide Coins correction | Current economic audit records that baseline privacy already hides member balances from non-owners and the SKU must remain non-purchasable until it has distinct approved behavior. Present. |
| 164 | 83a86742a1212d93f3b328d2467a6843ccd86771 | Prevent charging for redundant Hide Coins entitlement | Current store-catalog tests assert hide_coins_30d cannot be enabled for purchase and is not fulfillment-ready. Present. |
| 165 | 3fd0af8c29b3165a77c3adf2dd77f3f2fc293266 | Keep redundant Hide Coins SKU fail-closed | Current store-catalog fulfillment allowlist omits hide_coins_30d. Present. |
| 166 | e373dd59cbdc697b174eb46f1d5776934e5f76d1 | Document testable transactional daily reward cap guard | The current economic audit does not retain the old fixed daily-coin cap implementation. Current campaign logic uses owner-configured maxDailyClaimsPerMember and campaign reward budget. The historical fixed 10-claim/20-coin guard is not imported because its policy authority is not present in the current approved decision set. Superseded/not reintroduced. |
| 167 | 486d8243a81e61e771dab3d1fb3704c7de739b02 | Add exact-boundary tests for timed-ad daily reward caps | The current engagement-rewards module and tests do not contain the historical fixed daily-coin cap helper; current tests cover the active campaign/heartbeat policies. Superseded with the removed helper; do not restore unapproved fixed caps. |
| 168 | 49261c8fc6dfe290e09ac5cef22663aebeedbe06 | Remove superseded timed-ad cap constant imports | Current index.ts has no imports of the removed daily-cap constants, consistent with the later cleanup. Present. |

## Result
- Reviewed: 12 unique candidates (157–168).
- Present in current implementation: 10.
- Historical fixed daily-coin cap work: 2 commits superseded/not reintroduced; no current owner-approved source authorizes restoring fixed 10-claim/20-coin caps.
- Confirmed unique missing changes transferred: 0.
- Tests executed: 0. Existing unit-test source was inspected; no Functions runner or Firestore Emulator was invoked.
- No production, Firebase, billing or main-branch operation was performed.