# Semantic review batch 015 — standard timed-ad quota candidates and economic amendments 175–180
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 175–180 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| af9b8a8c38036baaa3e13c7a2b144837c965357f | Persist daily timed-ad reward counter | Current completeTimedAdvertisement has no global timedAdMemberDailyCounters read/write. The candidate counter is tied to the unapproved standard timed-ad 10/20 quota | Held pending owner approval |
| ed4b455036fee32d1a0f44bb294b306d78f60edb | Enforce daily timed-ad reward limits | Current standard timed-ad transaction does not call decideTimedAdDailyCap; no such helper exists in current engagement-rewards.ts | Held pending owner approval |
| 07520643d65874a897a147195e5cc59dc703b4ac | Enforce experimental timed-ad reward caps | Current standard campaign validator does not hard-code a 3-claim maximum; this quota is absent from approved decisions | Held pending owner approval |
| c51431a6f42322292f440bd2505091923527fc0c | Test Hide Coins fulfillment | This historical test makes Hide Coins purchasable, but the later owner-approved privacy correction removed the SKU from the fulfillment-ready allowlist. Current test asserts it remains non-purchasable | Superseded by later owner-approved fail-closed decision; do not restore |
| b627102ee04ab13eb5aa401b96713ed54db6aa4a | Record approved BetaCoins and economic amendments | Current approved-decision traceability includes ECON-004 naming, ECON-005 privacy authority and ECON-006 development-only commercial values, with later GIFT/ECON amendments | Already documented, expanded |
| 492f86ab8e13af8bae721697604c614744b90546 | Record BetaCoins and 60/40 owner amendments | Current implementation traceability records BetaCoins naming and the approved economic UI corrections; current decision docs preserve the 60/40 amendment | Already documented |

## Policy distinction
AD-001 separately approves Featured Ads rewards at 2 BetaCoins per eligible view, at most 10 views / 20 BetaCoins per UTC day, and one reward per campaign per rolling 24 hours. This is not the same as the source-branch 10/20 global cap for the standard timed-ad reward-center flow. AD-001 remains an approved requirement with implementation open; it does not authorize importing the standard timed-ad global counter or the 3-per-campaign standard cap.

## Result
- Reviewed: 6/1,665 unique candidates (175–180).
- Already documented: 2.
- Superseded by later owner-approved fail-closed policy: 1.
- Held pending owner approval: 3 standard timed-ad implementation candidates.
- Confirmed unique code changes transferred: 0.
- Tests executed: 0. Source/test-definition inspection only.
- No CI success is claimed.

## Safety decision
Do not restore the older purchasable Hide Coins behavior. Do not apply fixed 10/20/3 quotas to standard timed ads without owner approval and central configuration. Featured Ads AD-001 remains a separate unintegrated requirement. No production pricing or reward settings were changed.