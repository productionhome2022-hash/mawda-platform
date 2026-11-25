# Semantic review batch 016 — coin privacy, featured-ad labels and owner pricing UI
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 181–192 (12 commits).
Inspected Full Platform files: featured_ads_screen.dart b3b275731a4612f01445997584d926e936021a5b; profile_screen.dart a647e438f88d484a068ec0b4612996225766bda3; member-profile-view.ts f9ffa45c49cd522eca62edb959cf54918a3d7628; member-profile-view.test.js 07319d09b57686ae5a1a08431e3fb9d87371f35e; index.ts dbde24813a58106b50369e607889a372ecbca46e; call_usage_policy_screen.dart 1bbbf8939dcbfab6c7d7f877cf18764d64fb7050; GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-19.md 80b3502f6e96d6968405d98831b65e0d7532d38d; ECONOMIC_PHASE_GITHUB_INTEGRATION_AUDIT_2026-11-18.md eb773483cff742c293afe46951e13f4aa43b4dd0.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 8d8526f9a40223719497d806096a7623f42eb44c | Define comprehensive economic phase closeout gates | Current ECONOMIC_PHASE_COMPLETE_AUDIT covers the full economic scope, sovereign boundaries, BetaCoins, privacy, 60/40 player layout, call lifecycle and explicit acceptance blockers. | Present in evolved audit |
| cd581fb0d03c63f9c0e2337134163a6a52d53644 | Standardize Featured Ads reward labels as BetaCoins | Current featured_ads_screen.dart uses BetaCoins in the reward explanation and explicitly states AD-001 limits are not evidence of activation before server integration/acceptance. | Present |
| ac170450967001f3c44cb46696f0762e319703ee | Normalize BetaCoins labels in profile | Current profile_screen.dart uses BetaCoins in verification notices, gift dialog, balance, transfer and package messages; the malformed legacy strings are absent. | Present |
| a322bb5975253a28686b8d5a8ca9b8ebea6b133f | Show server-authorized coin balance privacy | Current getMemberProfile uses projectCoinVisibility and includes balance only for self or sole platform owner; ordinary members/moderators do not receive the balance. | Present |
| f904920fc2c1999373af60851db067d0b448d620 | Enforce coin visibility at profile projection | Current member-profile-view.ts exports projectCoinVisibility; getMemberProfile applies the projection to both self and other-member response paths. | Present |
| 4ac9b409bc58ece92609dfc4d1eeacd502901269 | Test coin privacy matrix | Current member-profile-view.test.js covers self, ordinary member, moderator, sole owner, and malformed/invalid balance behavior. | Present |
| 9bb6c47dec80a9d05f17fb81cc09c5554b68606b | Add server coin-visibility projection | Current pure projection omits balances for non-privileged viewers and fails closed on malformed privileged balances. | Present |
| 68c538f971ac73c8cb043581389afce323481487 | Enable Hide Coins fulfillment | Current store-catalog.ts deliberately excludes hide_coins_30d from the fulfillment-ready allowlist; purchase validation and tests fail closed because baseline privacy already hides balances from all non-owner viewers. | Do not port; conflicts with later owner-approved no-op SKU decision |
| 93c8ab1597305aeddc6eb27357321783a1fe4ec8 | Use canonical Super Owner title in group-call P0 audit | Current GROUP_CALL_P0_ENGINEERING_AUDIT uses Super Owner terminology. | Present |
| 70004765c42e651b5e92e75cdde0e2f5f789a510 | Use canonical Super Owner title in economic integration audit | Current ECONOMIC_PHASE_GITHUB_INTEGRATION_AUDIT uses Super Owner terminology. | Present |
| 612ed8afcadb0d515bb0f251a3c3b944b3b4f66e | Expose owner-controlled group-call pricing settings | Current call_usage_policy_screen loads and saves versioned group audio/video prices through getOwnerGroupCallPricingPolicy and owner update callable. The UI labels the values as test-only and explicitly says billing is disabled. | Present |
| 8290fd08d009409140c05055f4ade6ded47cef1d | Record group-call P0 audit and remaining blockers | Current GROUP_CALL_P0_ENGINEERING_AUDIT exists, records the exact branch scope, earlier CI evidence, current gaps and no-billing boundary. | Present |

## Important policy distinction
AD-001 Featured Ads has an owner-approved 2 BetaCoins/view, 10 views/20 BetaCoins per UTC day and one reward per campaign per rolling 24 hours. This is a separate feature policy and remains not fully integrated/accepted. It does not authorize the separate historical 10/20 global quota proposal for standard timed-ad reward-center sessions, which was explicitly reverted as unapproved. Keep the two pipelines distinct.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present: 11.
- Conflicting historical Hide Coins fulfillment change: 1, not ported.
- Confirmed unique missing code changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
Keep Hide Coins non-purchasable until a distinct owner-approved behavior exists. Preserve server-side coin projection and owner-controlled group-call pricing settings, but do not enable group-call billing until the P0 admission, consent, metering and settlement gates pass. Continue with candidate 193 onward.