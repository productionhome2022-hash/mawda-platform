# Semantic review batch 021 — group-call settlement math and economy UI
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 211–216 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| e1c2da95855221c575648b1806a426c30055252a | Add idempotent per-member group-call wallet settlement | Full Platform has no active group-call settlement function, per-member debit ledger or settlement receipt. | Missing but blocked by trusted media/consent/settlement prerequisites |
| 563ee97f3216ede98dc38cdce26bf6a3a89ae57f | Cap final billing duration without rejecting late end requests | Current calculateGroupCallFinalSettlement caps billable minutes to the configured maximum without rejecting a later end timestamp. | Already implemented |
| 671a888bf09e653f8b3d1ee6c7ee6ad7eba4c116 | Test reservation bounds and equal shares for late joiners | Current tests cover max reservation and equal shares, but intentionally reject totals that would create zero-value participant shares. The candidate's new test expects zero-value shares and conflicts with the current minimum-share guard. | Partially present; conflicting zero-share test not ported |
| d6dbb7e963c41ed3fedf2e0d36dcac50dfa32e7d | Add safe group-call reservation and final equal-share calculations | Current group-call-economy.ts already contains maximum reservation and final settlement calculations. It retains a guard against zero-value participant shares; that guard was not removed. | Already implemented with stricter minimum-share rule |
| dbdad7a832f7c6db38d2ef9cd79461654b59886e | Replace deprecated DropdownButtonFormField value with initialValue | Current economy_pricing_screen.dart already uses initialValue. | Already implemented |
| 1f436f5380cd8284a85fec0c0931ba67d3ef1aeb | Correct room rental pricing Wrap layout | Current room_rental_pricing_screen.dart no longer passes the unsupported mainAxisSize argument to Wrap. | Already implemented |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 4.
- Partially present with a conflicting zero-share proposal: 1.
- Missing settlement implementation, blocked by prerequisites: 1.
- Code transferred: 0.
- Tests executed: 0. Source and test-definition inspection only.
- No CI success is claimed.

## Safety decision
Do not permit zero-value participant shares without an owner-approved rule. Do not add per-member debits before the missing consent, trusted media evidence, immutable interval and receipt/retry lifecycle is complete.