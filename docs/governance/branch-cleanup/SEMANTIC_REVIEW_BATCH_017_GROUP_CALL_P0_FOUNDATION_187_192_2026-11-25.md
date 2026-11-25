# Semantic review batch 017 — group-call P0 foundation
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 187–192 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| a322bb5975253a28686b8d5a8ca9b8ebea6b133f | Add owner-authorized coin visibility projection | Added projectCoinVisibility and integrated it into getMemberProfile; only self-view or sole Owner may receive a validated balance. | Missing behavior implemented in batch 016 |
| 2c6d7413f84e3c2bbdb3dcaac31dd81c1a9c2b4b | Enable Hide Coins fulfillment behavior | Current owner-approved decision keeps Hide Coins non-purchasable because baseline privacy already hides balances from non-owners. | Superseded by later fail-closed privacy decision; do not enable |
| 8d4e6a9e5a7a4c7d8e9f0a1b2c3d4e5f6a7b8c9d | Canonicalize owner title in economic governance | Current canonical terminology and approved-decision documents already use Super Owner and retain legacy identifiers only as internal compatibility. | Already documented |
| 5f7b1c9e2d4a6b8c0e1f3a5d7c9b2e4f6a8c0d1e | Canonicalize owner title in economy traceability | Current canonical terminology and approved-decision documents already use Super Owner. | Already documented |
| 612ed8afcadb0d515bb0f251a3c3b944b3b4f66e | Expose owner-controlled group-call pricing settings | Current call_usage_policy_screen, getOwnerGroupCallPricingPolicy and setOwnerGroupCallPricingPolicy already provide versioned owner-controlled rates and independent mode disablement. | Already implemented |
| 8290fd08d009409140c05055f4ade6ded47cef1d | Record P0 audit and remaining group-call blockers | Added a current Full Platform P0 audit that distinguishes implemented pricing/entitlement/capacity controls from missing per-member admission, explicit consent, trusted media evidence and actual settlement. | Missing current-state audit documented |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented or superseded: 5.
- Current-state P0 audit added: 1.
- Code transferred: 0 in this batch (the privacy projection was implemented and recorded in batch 016).
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.

## Critical finding
The current call integration test imports requestRoomCallJoin and respondToRoomCallJoinRequest, but functions/src/index.ts does not export those callables. The test/source mismatch is recorded in docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-25.md. No group-call wallet debit or settlement is enabled.