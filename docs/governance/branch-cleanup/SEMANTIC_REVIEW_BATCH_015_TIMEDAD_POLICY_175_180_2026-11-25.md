# Semantic review batch 015 — timed-ad quota governance and owner amendments
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 175–180 (6 commits).
Current governing Full Platform decision: commit e0a0c7b8ce2db213828dc900b0ae910e38e17dea (`revert(economy): remove unapproved global timed-ad quotas`).

## Candidate dispositions

| Candidate | SHA | Change | Current Full Platform evidence | Disposition |
|---:|---|---|---|---|
| 175 | af9b8a8c38036baaa3e13c7a2b144837c965357f | Persist global per-member UTC-day timed-ad counter | Current completeTimedAdvertisement does not read/write timedAdMemberDailyCounters. The later explicit revert removed this global counter because the 10/20 global standard timed-ad quotas were not approved. | Held; do not restore without explicit owner approval |
| 176 | ed4b455036fee32d1a0f44bb294b306d78f60edb | Enforce global daily claim and coin limits in timed-ad settlement | Current standard timed-ad settlement does not apply global 10/20 quotas. The approved AD-001 daily cap belongs to the separate Featured Ads flow, not standard timed ads. | Held; separate policy domains |
| 177 | 07520643d65874a897a147195e5cc59dc703b4ac | Add experimental timed-ad reward caps | Retained only the standard-campaign maximum of 3 claims per member per campaign. Full Platform now exports TIMED_AD_MAX_CLAIMS_PER_CAMPAIGN_MEMBER, validates standard campaign inputs against it, and clamps the limit again in completeTimedAdvertisement. Global 10/20 daily constants were not retained. | Partial transfer: approved per-campaign ceiling only |
| 178 | c51431a6f42322292f440bd2505091923527fc0c | Test Hide Coins as purchasable through fulfillment contract | Current store-catalog policy deliberately keeps hide_coins_30d non-purchasable because it adds no distinct privacy effect; current tests fail closed. The historical positive-purchase test conflicts with that decision. | Do not port; superseded by fail-closed privacy decision |
| 179 | b627102ee04ab13eb5aa401b96713ed54db6aa4a | Record approved Beta Coins and economic phase amendments | Current MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md includes ECON-006 centrally configurable development values, owner-controlled privacy, and AD-002 60/40 player/context layout; current naming authority is NOM-001. | Present in current decision register |
| 180 | 492f86ab8e13af8bae721697604c614744b90546 | Record Beta Coins and 60/40 owner amendments | Current IMPLEMENTATION_TRACEABILITY.md records Beta Coins / بيتا كوينز, the 60/40 player/context layout and centrally configurable development values. | Present |

## Implemented portion and exact commits
- `TIMED_AD_MAX_CLAIMS_PER_CAMPAIGN_MEMBER = 3` added to engagement-rewards.ts and standard campaign validation updated: commit 8f3d2cb270c2471a172fa6d1b0d6875cdf0d935c.
- completeTimedAdvertisement now clamps existing standard campaign records to the same maximum inside the settlement transaction: commit 482ad7e8104c6f74a533af5ef206791b2c546c22.
- Unit regression covers the 3-claim standard campaign ceiling and preserves the separate featured campaign default: commit 756e024c0f7dae5325a063e0f941ec5b3240c267.
- Restored the existing heartbeat-gap constant referenced by eligibleHeartbeatDelta after CI exposed its absence: commit ab0f727a0c320ee967cd002cc1f02f5ebb27fdbb.
- The 10-claim/20-BetaCoins global daily counter/helper/integration test were removed/not retained in accordance with the explicit quota revert. The audit document was corrected to label the historical proposal and distinguish AD-001 Featured Ads.

## Validation status
- Source and test definitions inspected; no local tests executed.
- A GitHub Actions run on intermediate SHA ffe158f83f4bba3f0ba607fabb8b0366f099c229 failed with TypeScript errors caused by misplaced campaign-limit code and missing heartbeat constant. These issues were corrected in later commits.
- A subsequent run on SHA 482ad7e8104c6f74a533af5ef206791b2c546c22 compiled Functions, but failed one terminology-doc test and the store-gifting integration test because the Auth emulator was not started and recipient Auth fixtures were absent. Both test-environment issues have been addressed: canonical doc wording normalized, and store-gifting integration now starts Auth emulator and creates/deletes recipient Auth fixtures.
- The latest validation run is associated with the later branch HEAD; its result is still pending at this report checkpoint. Do not claim passing CI until the run completes.

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Present: 2.
- Partial approved transfer: 1.
- Held pending explicit owner approval: 2.
- Superseded/conflicting historical test: 1.
- Global daily standard timed-ad quotas transferred: 0.
- Production, billing, Firebase production resources and main branch were not changed.