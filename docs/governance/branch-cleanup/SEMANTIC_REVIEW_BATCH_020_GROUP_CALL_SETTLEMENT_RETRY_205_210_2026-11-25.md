# Semantic review batch 020 — group-call settlement lifecycle and retry
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 205–210 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 2b24766357b84a6bd625e320724c255067612b40 | Mark never-connected group calls as not billable | Full Platform has no processGroupCallBillingSettlement function or groupCallBillingState lifecycle. | Missing dependent settlement feature; do not port alone |
| 576c989ece83bb5dfbe40ee1900197581b4d0e64 | Mark failed settlement attempts pending for scheduled retry | Current endCall/expiry paths clear locks but do not run wallet settlement or persist settlement retry state. | Missing dependent settlement feature; hold |
| c89c47cec562419ea6aafb76f02207ce29c559ee | Test equal-share settlement and insufficient-balance retry | Current call integration tests have no active wallet settlement flow; the settlement test depends on missing billing/consent/media functions. | Dependent test cannot be ported in isolation |
| 91dfac3b915a545597f73c8d79c8e9e2d77b4166 | Retry pending group-call wallet settlements safely | Current cleanup scheduler does not query groupCallBillingState=pending and no settlement worker exists. | Missing dependent worker; hold |
| 5a1c5c5582262efd2ec14f7375783b651336bce6 | Trigger wallet settlement when group call ends | Current endCall terminates the call and clears locks; it does not debit or settle wallets. | Missing dependent settlement trigger; do not enable |
| 752f281cc63b1de66a26875548a3b68f37379720 | Trigger wallet settlement on shared timer expiry | Current duration-expiry helper marks calls ended and clears locks but does not settle wallets. | Missing dependent settlement trigger; do not enable |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Missing but dependency-blocked: 6.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## Safety decision
All six commits depend on the absent group-call settlement engine and its prerequisites. Do not add a debit path or scheduled retry without trusted provider media evidence, explicit per-member version-bound consent, frozen connection intervals, atomic ledger/receipt reconciliation and idempotent recovery.