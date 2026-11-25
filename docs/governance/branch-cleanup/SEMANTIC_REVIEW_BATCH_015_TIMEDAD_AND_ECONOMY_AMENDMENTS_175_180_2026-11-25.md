# Semantic review batch 015 — timed-ad caps and economic amendments
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 175–180 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| af9b8a8c38036baaa3e13c7a2b144837c965357f | Persist daily timed-ad reward counter | Current completeTimedAdvertisement reads/writes the per-member UTC daily counter in the same transaction as claim, campaign budget and wallet credit. | Already implemented |
| ed4b455036fee32d1a0f44bb294b306d78f60edb | Enforce daily timed-ad reward limits | Current transaction invokes decideTimedAdDailyCap and cancels ineligible sessions before granting a reward. | Already implemented, centralized |
| 07520643d65874a897a147195e5cc59dc703b4ac | Enforce experimental timed-ad reward caps | Current engagement-rewards.ts defines 10 claims/day, 20 BetaCoins/day and 3 claims/campaign; campaign validation enforces the per-campaign maximum. | Already implemented |
| c51431a6f42322292f440bd2505091923527fc0c | Test Hide Coins fulfillment | This historical test makes Hide Coins purchasable, but the later owner-approved privacy correction removed the SKU from the fulfillment-ready allowlist. Current test asserts it remains non-purchasable. | Superseded by later owner-approved fail-closed decision; do not restore |
| b627102ee04ab13eb5aa401b96713ed54db6aa4a | Record approved Beta Coins and economic amendments | Current approved-decision traceability includes ECON-004 naming, ECON-005 privacy authority and ECON-006 development-only commercial values, with later GIFT/ECON amendments. | Already documented, expanded |
| 492f86ab8e13af8bae721697604c614744b90546 | Record Beta Coins and 60/40 owner amendments | Current implementation traceability records BetaCoins naming and the approved economic UI corrections; current decision docs preserve the 60/40 amendment. | Already documented |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented/documented: 5.
- Superseded by later owner-approved fail-closed policy: 1.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0. Source/test-definition inspection only.
- No CI success is claimed.

## Safety decision
Do not restore the older purchasable Hide Coins behavior. The baseline privacy rule already hides balances from non-owners. Daily timed-ad reward caps remain transactional and bounded; no production pricing or reward settings were changed.