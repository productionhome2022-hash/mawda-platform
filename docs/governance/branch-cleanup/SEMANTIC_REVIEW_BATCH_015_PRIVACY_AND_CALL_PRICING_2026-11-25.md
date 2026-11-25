# Semantic review batch 015 — economic audit, balance privacy and group-call pricing, candidates 181–192
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform HEAD inspected: 9490ebefe49bdaa43ed98108a2c3627954be181a
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 181–192.

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 181 | 8d8526f9a40223719497d806096a7623f42eb44c | Define comprehensive economic phase closeout gates | Current ECONOMIC_PHASE_COMPLETE_AUDIT records sovereignty, coin privacy, call billing gaps, Media Saver gaps, gifting and acceptance limitations; a quota clarification now distinguishes standard timed ads from Featured Ads AD-001. Present. |
| 182 | cd581fb0d03c63f9c0e2337134163a6a52d53644 | Standardize featured-ad reward labels | Updated Featured Ads screen to use canonical BetaCoins wording and state AD-001: 2 BetaCoins/eligible view, 10 views/20 BetaCoins per UTC day, one reward per campaign per rolling 24h. It explicitly says rewards are not active until server integration and acceptance tests complete. Implemented as accurate UI copy only. |
| 183 | ac170450967001f3c44cb46696f0762e319703ee | Normalize profile currency labels | Current profile UI uses canonical BetaCoins spelling for package gifts, balance transfers and feature gifting. Present. |
| 184 | a322bb5975253a28686b8d5a8ca9b8ebea6b133f | Add server-authorized coin visibility to profile | Added profile balance card driven only by server-returned coinBalanceVisible/coinBalance. The card displays a balance only when the server projection authorizes self-view or sole-owner view; other viewers receive a privacy message. Implemented. |
| 185 | f904920fc2c1999373af60851db067d0b448d620 | Enforce coin visibility in profile projection | getMemberProfile computes projectCoinVisibility and returns coinBalanceVisible/coinBalanceHiddenByPrivacy plus coinBalance only for authorized viewers; strict public profile allowlist remains intact. Present. |
| 186 | 4ac9b409bc58ece92609dfc4d1eeacd502901269 | Test coin privacy matrix | member-profile-view.test.js covers self, sole owner, ordinary member, moderator and invalid balance cases; public projection tests ensure sensitive fields are omitted. Present. |
| 187 | 9bb6c47dec80a9d05f17fb81cc09c5554b68606b | Add server coin-visibility projection helper | projectCoinVisibility is used by getMemberProfile; only self or sole Owner/Super Admin receives a balance. Present. |
| 188 | 68c538f971ac73c8cb043581389afce323481487 | Enable Hide Coins catalog fulfillment | Superseded by later owner-approved fail-closed correction. hide_coins_30d remains absent from fulfillment allowlist and tests reject purchase until distinct fulfillment exists. Do not restore. |
| 189 | 93c8ab1597305aeddc6eb27357321783a1fe4ec8 | Use canonical Super Owner title in group-call audit | Current GROUP_CALL_P0_ENGINEERING_AUDIT uses canonical Super Owner wording. Present. |
| 190 | 70004765c42e651b5e92e75cdde0e2f5f789a510 | Use canonical Super Owner title in economic integration audit | Current ECONOMIC_PHASE_GITHUB_INTEGRATION_AUDIT uses canonical Super Owner wording. Present. |
| 191 | 612ed8afcadb0d515bb0f251a3c3b944b3b4f66e | Expose owner-controlled group-call pricing settings | Current call_usage_policy_screen loads getOwnerGroupCallPricingPolicy and now saves through the actual backend callable setOwnerGroupCallPricingPolicy. It reads the returned version from policy.version and clearly states this is test-only with billing disabled. Implemented/fixed integration mismatch. |
| 192 | 8290fd08d009409140c05055f4ade6ded47cef1d | Record group-call P0 audit and remaining blockers | Current GROUP_CALL_P0_ENGINEERING_AUDIT remains P0 BLOCKING for trusted media evidence, consent, participant settlement, insufficient balance, video UI and 5,000-persona acceptance. Present. |

## Current source evidence
- lib/screens/profile_screen.dart: a647e438f88d484a068ec0b4612996225766bda3.
- lib/screens/featured_ads_screen.dart: b3b275731a4612f01445997584d926e936021a5b.
- lib/screens/call_usage_policy_screen.dart: 1bbbf8939dcbfab6c7d7f877cf18764d64fb7050.
- functions/src/index.ts: dbde24813a58106b50369e607889a372ecbca46e.
- functions/src/member-profile-view.ts: f9ffa45c49cd522eca62edb959cf54918a3d7628.
- functions/test/member-profile-view.test.js: 07319d09b57686ae5a1a08431e3fb9d87371f35e.
- docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md: 7a8a2a4a489470c7ef2f6df6b122cbcdc94a5119.
- docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-19.md: 80b3502f6e96d6968405d98831b65e0d7532d38d.

## Result
- Reviewed: 12 unique candidates (181–192).
- Present or implemented: 11.
- Superseded by owner-approved fail-closed policy: 1 (Hide Coins).
- Code changed during this review: profile balance-visibility card; Featured Ads AD-001 copy clarification; group-call owner pricing endpoint/version integration and test-only disclosure.
- Tests executed: 0. Existing unit tests and source were inspected; Flutter Analyze/Tests and Functions runtime tests were not run.
- No CI success is claimed.

## Safety decision
Featured Ads AD-001 remains an approved requirement, not an activated reward flow. The owner pricing screen writes only the existing test-only policy; backend billingEnabled remains false and no wallet debit path was activated. Group calls remain P0 blocking. Hide Coins remains non-purchasable. No production Firebase, live pricing, billing, deployment or main-branch operation occurred.