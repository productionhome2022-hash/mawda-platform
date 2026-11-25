# Semantic review batch 014 — Hide Coins fail-closed and timed-ad cap candidates 163–174
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 163–174 (12 commits).

## Classification

| Candidate | SHA | Change | Current Full Platform evidence | Disposition |
|---:|---|---|---|---|
| 163 | ee08abd87a68a7a38748658788e9a65537d07549 | Document fail-closed correction for redundant Hide Coins SKU | Current economic audit states non-owner balances are already hidden and the SKU must remain non-purchasable until a distinct owner-approved benefit exists | Already documented |
| 164 | 83a86742a1212d93f3b328d2467a6843ccd86771 | Test Hide Coins remains non-purchasable | Current store-catalog tests reject an active/purchasable Hide Coins SKU with STORE_FULFILLMENT_NOT_READY and verify the disabled item is not purchasable | Already implemented |
| 165 | 3fd0af8c29b3165a77c3adf2dd77f3f2fc293266 | Remove Hide Coins from fulfillment-ready allowlist | Current store-catalog fulfillment allowlist does not include hide_coins_30d | Already implemented |
| 166 | e373dd59cbdc697b174eb46f1d5776934e5f76d1 | Document testable transactional daily reward cap guard | Current economic audit contains a historical standard timed-ad implementation statement; it is not owner approval for applying a global 10/20 cap to the standard timed-ad path | Historical record; not authorization |
| 167 | 486d8243a81e61e771dab3d1fb3704c7de739b02 | Add exact-boundary tests for timed-ad daily caps | Current engagement-rewards.test.js contains no fixed 10/20 standard timed-ad cap tests. The delta is held because the standard timed-ad quotas lack owner approval | Held |
| 168 | 49261c8fc6dfe290e09ac5cef22663aebeedbe06 | Remove superseded timed-ad cap constant imports | Current index.ts has no direct imports of the old constants or shared helper; no change is required while the standard cap feature is held | No-op / already absent |
| 169 | 46e41f28e3bbb97ad0f50ab064a3f374e92d462c | Use shared tested guard for transactional daily caps | Current completeTimedAdvertisement has no decideTimedAdDailyCap call and no global daily counter | Held pending owner approval |
| 170 | 6073c81fdc47844aa67196c215701a1e294f56b3 | Extract timed-ad daily cap decision | Current engagement-rewards.ts does not export decideTimedAdDailyCap or fixed 10/20 constants | Held pending owner approval |
| 171 | c9fd052b1572e401bc1e747cfa3007f26cf68199 | Document call billing and Media Saver source gaps | Current economic audit preserves the distinction between WebRTC signaling/attempt quotas and missing economic metering/consent/settlement, and records Media Saver client/local-save gaps | Already documented |
| 172 | 6eca9a36edd861b75881d5a1a04649111b39397b | Import timed-ad reward safety limits | Current index.ts imports neither raw cap constants nor the daily decision helper | Superseded / no-op |
| 173 | a1138c6985c31fde3c48a7d52d17e567d09702c7 | Document server-enforced ad reward caps | Historical audit says standard timed-ad limits were enforced. AD-001 separately approves 10 views/20 BetaCoins per UTC day only for the distinct Featured Ads reward flow and marks that integration open; it does not authorize the same cap on standard timed ads | Historical record; policy distinction required |
| 174 | 9ee5debaf5fd718b0209558314a2b2952a3088d8 | Test timed-ad reward caps | Current engagement-rewards tests contain no fixed standard timed-ad cap tests. Do not port tests for quotas not approved for this path | Held |

## Result
- Reviewed: 12/1,665 unique candidates (163–174).
- Already present/documented or no-op: 5.
- Historical quota documentation: 2.
- Held pending owner approval: 3 implementation/test deltas.
- Confirmed unique code changes transferred: 0.
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.

## Safety decision
Hide Coins remains fail-closed; no privacy baseline was weakened. The approved 10-view/20-BetaCoins daily limit belongs to the separate Featured Ads requirement, whose integration remains open. It does not authorize hard-coded global quotas in the standard timed-ad reward-center flow. No ad budget, reward amount, production setting or billing state was changed.