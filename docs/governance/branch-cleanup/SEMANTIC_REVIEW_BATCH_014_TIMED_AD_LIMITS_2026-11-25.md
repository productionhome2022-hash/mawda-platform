# Semantic review batch 014 — timed-ad reward limits and economic owner amendments, candidates 169–180
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Current Full Platform HEAD read back: d8e3e38d35ee550194a07e6cbd56fb1352d6defc
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 169–180 (12 commits).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 169 | 46e41f28e3bbb97ad0f50ab064a3f374e92d462c | Use shared tested guard for transactional timed-ad daily caps | Current completeTimedAdvertisement does not call decideTimedAdDailyCap and has no global per-member daily counter. Held; this fixed standard timed-ad quota is not approved in the current decision set. |
| 170 | 6073c81fdc47844aa67196c215701a1e294f56b3 | Extract timed-ad daily cap decision for testable enforcement | Current engagement-rewards.ts does not export decideTimedAdDailyCap or fixed 10/20 constants. Held pending owner-approved configurable policy. |
| 171 | c9fd052b1572e401bc1e747cfa3007f26cf68199 | Document call billing and Media Saver source gaps | Current economic audit preserves the distinction between WebRTC signaling/attempt quotas and missing economic metering/consent/settlement, and records Media Saver client/local-save gaps. Present. |
| 172 | 6eca9a36edd861b75881d5a1a04649111b39397b | Import timed-ad reward safety limits | Current index.ts imports neither raw cap constants nor the daily decision helper. No change required while the standard timed-ad global cap is held. |
| 173 | a1138c6985c31fde3c48a7d52d17e567d09702c7 | Record server-enforced ad reward caps | The economic audit contains a historical statement for 10/20/3 standard timed-ad limits. This is an implementation snapshot, not owner approval for the standard timed-ad policy. Clarification is required to distinguish it from AD-001 featured-ad limits. | Historical record; not current authorization |
| 174 | 9ee5debaf5fd718b0209558314a2b2952a3088d8 | Test timed-ad reward caps | Current engagement-rewards.test.js has no fixed 10/20/3 cap tests. Do not port tests for an unapproved standard timed-ad quota. | Held pending owner approval |
| 175 | af9b8a8c38036baaa3e13c7a2b144837c965357f | Persist daily timed-ad reward counter | Current completeTimedAdvertisement has no timedAdMemberDailyCounters read/write. Held with the unapproved standard timed-ad global quota. | Held pending owner approval |
| 176 | ed4b455036fee32d1a0f44bb294b306d78f60edb | Enforce daily timed-ad reward limits | Current standard timed-ad completion enforces campaign-level limits but no global per-member daily 10/20 cap. Do not import without owner approval and central configuration. | Held pending owner approval |
| 177 | 07520643d65874a897a147195e5cc59dc703b4ac | Enforce experimental timed-ad reward caps | Current standard campaign validator allows the existing configured maxClaimsPerMember range and does not hard-code a 3-claim maximum. The 3-per-campaign cap is not in the approved decision register. | Held pending owner approval |
| 178 | c51431a6f42322292f440bd2505091923527fc0c | Test purchasable Hide Coins fulfillment | Superseded by the later owner-approved fail-closed correction: current catalog allowlist excludes hide_coins_30d and tests assert purchase validation rejects it because baseline privacy already hides balances. Do not restore the old positive test. | Superseded |
| 179 | b627102ee04ab13eb5aa401b96713ed54db6aa4a | Record approved BetaCoins and economic phase amendments | Current approved-decision traceability records the owner-approved BetaCoins naming, sole Owner/Super Admin authority, coin-balance privacy, AD-002 layout and centrally controlled development commercial values. Present. | Present |
| 180 | 492f86ab8e13af8bae721697604c614744b90546 | Record BetaCoins and 60/40 owner amendments in implementation traceability | Current implementation traceability records the owner-approved economic naming, sole Owner/Super Admin authority, balance privacy, 60/40 layout and development-only commercial-value invariants. Present. | Present |

## Important distinction: standard timed ads vs Featured Ads
The approved AD-001 decision specifies 2 BetaCoins per eligible view, at most 10 views / 20 BetaCoins per UTC day, and one reward per campaign per rolling 24 hours for the distinct Featured Ads reward flow. That is an approved requirement, but the decision explicitly marks the serving/integration implementation as still open. Current featured-ad-rewards.ts contains a pure decision helper and unit tests, but the approved-decision document says it is not yet wired to Firestore/Cloud Functions, owner controls or a member serving UI.
The source-branch candidates 169–177 instead apply fixed 10/20 global caps and a 3-claim campaign maximum to the standard timed-ad reward-center transaction. AD-001 does not authorize copying those limits into the standard timed-ad path. The 3-per-campaign value is also absent from the current approved decision register. Do not conflate the two systems.

## Current Full Platform evidence
- functions/src/engagement-rewards.ts blob: 031cac086458ec5b8ebbf1206a041d719c36f7f6 — no decideTimedAdDailyCap, no 10/20 constants, no fixed 3-per-campaign constant; standard maxClaimsPerMember remains capped by existing validator range.
- functions/src/index.ts blob: 88bc96f2b1516f2796403457d94626f3ffe79ad4 — no timedAdMemberDailyCounters read/write and no daily-cap helper call.
- functions/test/engagement-rewards.test.js blob: 261844b2680b0c006665ffc74b399de0736ebc3b — no fixed standard timed-ad daily-cap tests.
- functions/src/featured-ad-rewards.ts blob: 585ce4b66b28aa5e9171ee5fd86f3234ec275019 — separate featured-ad pure reward decision helper.
- functions/test/featured-ad-rewards.test.js blob: 6c6951b48b79807c2bbf12b6809e955f67cf3deb — featured-ad daily view/coin cap tests.
- docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md blob: 9681e95d3b5263cbcf1878a5b6e927bc2641b35c — AD-001 distinguishes the featured-ad approved requirement and states implementation remains open.

## Result
- Reviewed: 12 unique candidates (169–180).
- Present documentation or no-op/superseded: 5.
- Held pending owner approval for standard timed-ad quotas: 6 implementation/test candidates (169, 170, 174, 175, 176, 177).
- Historical quota statement requiring careful interpretation: 1 (173).
- Code transferred: 0.
- Tests executed: 0. Source and test definitions were inspected only; no Functions runner or Firestore Emulator was run.
- No CI success is claimed.

## Safety decision
Do not apply fixed global 10/20 or 3-per-campaign limits to standard timed ads without explicit owner approval and central configuration. The separate Featured Ads AD-001 requirement remains approved but not yet integrated. Hide Coins remains fail-closed. No production, Firebase, billing, main-branch or deployment operation was performed.