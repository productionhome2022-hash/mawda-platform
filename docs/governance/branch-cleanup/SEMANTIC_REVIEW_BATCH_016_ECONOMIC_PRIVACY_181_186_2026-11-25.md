# Semantic review batch 016 — economic closeout, BetaCoins labels and profile balance privacy
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 181–186 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 8d8526f9a40223719497d806096a7623f42eb44c | Define comprehensive economic phase closeout gates | Current ECONOMIC_PHASE_COMPLETE_AUDIT covers the full central economy scope, governance limits and explicit unfinished call/Media Saver gates. | Already documented, expanded |
| cd581fb0d03c63f9c0e2337134163a6a52d53644 | Standardize featured-ad rewards as BetaCoins | Current FeaturedAdRewardsScreen deliberately avoids hardcoded reward prices/amounts and states that campaign reward values are controlled by the Super Owner. The current screen does not contain the historical static currency copy. | Superseded by current configuration-driven UI |
| ac170450967001f3c44cb46696f0762e319703ee | Normalize BetaCoins labels in profile | Current ProfileScreen already uses the canonical BetaCoins product name and has no historical duplicated/malformed label. | Already implemented |
| a322bb5975253a28686b8d5a8ca9b8ebea6b133f | Show server-authorized BetaCoins balance privacy | Current getMemberProfile omitted coin balance for all viewers. Added projectCoinVisibility to the strict server projection: profile owner and sole Super Owner may receive a validated non-negative balance; ordinary members/moderators do not receive it. | Missing privacy projection implemented |
| f904920fc2c1999373af60851db067d0b448d620 | Enforce coin visibility at profile projection | Added economicProfile fields to getMemberProfile and applied them to both self and other-profile responses; the balance is included only when the server projection authorizes it. | Missing callable integration implemented |
| 4ac9b409bc58ece92609dfc4d1eeacd502901269 | Test coin privacy matrix | Added unit coverage for self-view, ordinary member, moderator, sole Owner and malformed/negative balance rejection. | Missing tests added; not executed |

## Files changed
- functions/src/member-profile-view.ts — added projectCoinVisibility.
- functions/src/index.ts — added server-authorized economicProfile to getMemberProfile.
- functions/test/member-profile-view.test.js — added role/identity/balance boundary tests.

## Verification
- Reviewed: 6/1,665 unique candidates in this batch.
- Already present or superseded: 3.
- Missing balance-privacy implementation and tests added: 3 related changes.
- Tests executed: 0. Unit test definitions were added but not run.
- No CI success is claimed.
- The Hide Coins SKU remains disabled; this change restores only the approved visibility rule and does not make the SKU purchasable.

## Safety decision
Balance data is not added to the public profile allowlist. It is returned as a separate server-authorized projection only for self-view or the sole Owner session. Moderators and ordinary members remain denied. Malformed/negative balances fail closed.