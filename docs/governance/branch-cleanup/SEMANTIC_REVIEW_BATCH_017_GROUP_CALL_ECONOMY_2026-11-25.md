# Semantic review batch 017 — group-call settlement lifecycle candidates 205–216
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: 2f6f1224af0216da28e74cfee266b86d6f95cd83
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 205–216 from codex/economic-phase-completion-2026-11-18.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence | Result |
|---|---|---|---|
| 2b24766357b84a6bd625e320724c255067612b40 | Mark never-connected group calls not billable | Full Platform has no group-call wallet settlement engine; no billing is initiated from endCall or duration expiry. The source branch settlement status transition cannot be ported independently | Held with settlement-engine dependency |
| 576c989ece83bb5dfbe40ee1900197581b4d0e64 | Retry failed group-call settlements on schedule | No settlement engine or pending settlement state exists in target; scheduled retry without a safe engine would be inert or unsafe | Held with settlement-engine dependency |
| c89c47cec562419ea6aafb76f02207ce29c559ee | Test equal-share settlement and insufficient-balance retry | Current target has no wallet settlement path, receipt records or retry callable/scheduler to exercise | Held with settlement-engine dependency |
| 91dfac3b915a545597f73c8d79c8e9e2d77b4166 | Retry pending group-call wallet settlements safely | Current target has no processGroupCallBillingSettlement function; no scheduler retry path to port | Held with settlement-engine dependency |
| 5a1c5c5582262efd2ec14f7375783b651336bce6 | Trigger equal-share wallet settlement when group call ends | Current endCall only updates call state and clears locks; it does not debit wallets. Billing remains disabled and no settlement engine exists | Held: do not introduce wallet debit path in isolation |
| 752f281cc63b1de66a26875548a3b68f37379720 | Settle group-call wallet shares on shared timer expiry | Current duration expiry path ends calls and clears locks but does not invoke wallet settlement | Held with settlement-engine dependency |
| e1c2da95855221c575648b1806a426c30055252a | Add idempotent per-member group-call wallet settlement engine | Source engine performs per-member atomic debit/ledger/receipt but can partially settle participants and initially trusts client mediaConnectedAt. Later source patches add consent/media guards, but Full Platform has no integrated trusted media event source. Do not port the engine or enable billing without complete owner-approved safeguards | Held: unsafe/incomplete financial engine |
| 563ee97f3216ede98dc38cdce26bf6a3a89ae57f | Cap final billing duration without rejecting late end requests | Current group-call-economy.ts already includes calculateGroupCallFinalSettlement with max-duration cap and late end tolerance; no duplicate helper needed | Present |
| 671a888bf09e653f8b3d1ee6c7ee6ad7eba4c116 | Test reservation bounds and equal shares for late joiners | Current group-call-economy.ts and group-call-economy.test.js already include maximum reservation and final settlement late-join tests | Present |
| d6dbb7e963c41ed3fedf2e0d36dcac50dfa32e7d | Add safe group-call reservation and final equal-share calculations | Current group-call-economy.ts already exposes calculateGroupCallMaximumReservation and calculateGroupCallFinalSettlement, with tests | Present |
| dbdad7a832f7c6db38d2ef9cd79461654b59886e | Replace deprecated dropdown value with initialValue | Current economy_pricing_screen.dart uses initialValue: billingModel; no port needed | Present |
| 1f436f5380cd8284a85fec0c0931ba67d3ef1aeb | Correct room rental pricing Wrap layout | Current room_rental_pricing_screen.dart has been redesigned around a ListView of cards/ListTiles and no longer contains the historical Row layout being patched | Superseded by current screen layout |

## Result
- Reviewed: 12/1,665 unique candidates (205–216).
- Present or superseded: 5.
- Held pending coherent group-call settlement and trusted-media/consent design: 7.
- Code transferred: 0.
- Tests executed: 0. Source and existing test definitions inspected only.
- No CI success is claimed.

## Safety decision
Do not port the source branch's partial per-member wallet settlement engine. It lacks a trusted provider-side media evidence producer in Full Platform and can create partial multi-member settlement; billing is intentionally not activated. The pure reservation/final-share math already exists in target, but actual wallet debit remains blocked until owner-approved reservation, consent, media evidence, retry and atomic completion semantics are integrated.

## Next
Continue from candidate 217.