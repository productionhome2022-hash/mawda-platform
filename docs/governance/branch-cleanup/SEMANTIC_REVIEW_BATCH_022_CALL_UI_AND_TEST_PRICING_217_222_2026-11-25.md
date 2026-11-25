# Semantic review batch 022 — call UI and test-only pricing behavior
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 217–222 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 1aa3071c75b6a3777618479435623489f0a6ecc5 | Use valid Wrap layout arguments in economy pricing screen | Current economy_pricing_screen.dart uses valid Wrap(children:) arguments for package/ad actions. | Already implemented |
| 869ed7e2b882a288cf9aaabe62cfbb9021ee6a7f | Remove duplicated trailing owner purchase screen fragment | Current owner_coin_purchase_screen.dart has no duplicated trailing fragment; file ends at the class boundary. | Already implemented |
| 2d358eff323b444256711618c61cfe7fc15002b5 | Close creator lobby when shared call deadline expires | Current MawddaCallScreen checks getActiveCall and finishes locally when the call is no longer active. The room join-request lobby itself is not present in current Full Platform. | Deadline check already present; remaining lobby flow is a separate missing feature |
| 21d3f15fefc4475a8f6af6828c4d8d7c3490d559 | Test rejection of group-call mode without owner price | Current Full Platform marks group-call rates as test-only and hard-disables billing collection; it does not treat the test snapshot as an active charge policy. | Not applicable to current test-only, billing-disabled contract |
| 16400d51db64ed4f29062f12cb893c27957509cc | Block group-call modes without active owner price | Current Full Platform stores a testPricingSnapshot through projectGroupCallTestPricingSnapshot; the owner policy endpoint reports billingEnabled=false. The source branch's active-billing guard is not portable without the corresponding billing/consent lifecycle. | Superseded by current test-only/billing-disabled design; do not enable charges |
| e2d99fb44d38e14f3d247a38b05f99a0ca753c61 | Add Flutter CI push and PR triggers for room-call changes | Current flutter-ci.yml remains workflow_dispatch-only. The historical trigger targets the economic-completion branch and its PR target; changing trigger scope would create automated runs and should be handled as a separate CI policy decision. | Not ported; separate CI governance decision |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 3.
- Not applicable/superseded or held for CI policy: 3.
- Code transferred: 0.
- Tests executed: 0.
- No workflow was triggered or modified.

## Safety decision
Do not convert test-only call pricing into live billing. Keep the hard-disabled billing collection gate. CI trigger changes are deferred until the owner approves the intended branch/PR trigger policy.