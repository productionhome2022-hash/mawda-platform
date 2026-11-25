# Semantic review batch 017 — group-call billing dependencies and economic UI fixes, candidates 205–216
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform source snapshot inspected: 1a7884841a07d04ae543154f4fe72cf3b8317535
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 204–215 (candidate numbers 205–216).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 205 | 2b24766357b84a6bd625e320724c255067612b40 | Mark never-connected group calls as not billable | No group-call settlement processor exists in current Full Platform. No billing decision is executed, so the historical settlement-state branch is not applicable. |
| 206 | 576c989ece83bb5dfbe40ee1900197581b4d0e64 | Mark failed group-call settlement attempts for scheduled retry | No settlement processor exists to retry; do not introduce a pending-billing state without the owner-approved settlement workflow. |
| 207 | c89c47cec562419ea6aafb76f02207ce29c559ee | Test equal-share settlement and insufficient-balance retry | Depends on the absent settlement processor and wallet debit path. Not ported. |
| 208 | 91dfac3b915a545597f73c8d79c8e9e2d77b4166 | Retry pending group-call wallet settlements safely | No group-call billing settlement is connected to the scheduled call cleanup. Not ported. |
| 209 | 5a1c5c5582262efd2ec14f7375783b651336bce6 | Trigger equal-share wallet settlement when a group call ends | Not ported: endCall currently ends calls and clears locks; it does not initiate financial settlement. Current group-call billing remains explicitly disabled pending trusted media/consent/settlement acceptance. |
| 210 | 752f281cc63b1de66a26875548a3b68f37379720 | Settle group-call wallet shares on shared timer expiry | Not ported: no billing processor exists; adding timer-triggered charges would violate the current fail-closed billing state. |
| 211 | e1c2da95855221c575648b1806a426c30055252a | Add idempotent per-member group-call wallet settlement | Not ported: would create live wallet debit behavior without the missing provider evidence and explicit per-member billing-consent chain. |
| 212 | 563ee97f3216ede98dc38cdce26bf6a3a89ae57f | Cap final billing duration without rejecting late end requests | Current pure calculateGroupCallFinalSettlement already caps billable minutes to the configured maximum without rejecting a late end request. Present. |
| 213 | 671a888bf09e653f8b3d1ee6c7ee6ad7eba4c116 | Test reservation bounds and equal shares for late joiners | Current group-call economy tests already cover maximum reservation and final equal-share settlement for late joiners, with exact totals. Present. The historical zero-value-share relaxation was not adopted; current calculation intentionally fails closed if total amount cannot give every participant a positive share. |
| 214 | d6dbb7e963c41ed3fedf2e0d36dcac50dfa32e7d | Add safe reservation and final equal-share calculations | Current group-call-economy.ts already exports calculateGroupCallMaximumReservation and calculateGroupCallFinalSettlement, and tests cover both. Present. |
| 215 | dbdad7a832f7c6db38d2ef9cd79461654b59886e | Replace deprecated DropdownButtonFormField value with initialValue | Current economy_pricing_screen.dart already uses initialValue for the billing model field. Present. |
| 216 | 1f436f5380cd8284a85fec0c0931ba67d3ef1aeb | Correct room rental pricing Wrap layout | Current room_rental_pricing_screen.dart no longer contains the invalid Wrap mainAxisSize argument. Present/refactored. |

## Result
- Reviewed: 12 unique candidates (205–216).
- Present or already implemented in the current pure economic policy/UI layer: 5.
- Group-call financial settlement commits deferred: 7, because the active architecture deliberately keeps billing disabled until trusted media evidence, participant consent, atomic settlement and acceptance tests are complete.
- Code transferred in this batch: 0.
- Tests executed: 0. Existing source/tests were inspected only.
- No production, Firebase, billing, main-branch or deployment operation was performed.