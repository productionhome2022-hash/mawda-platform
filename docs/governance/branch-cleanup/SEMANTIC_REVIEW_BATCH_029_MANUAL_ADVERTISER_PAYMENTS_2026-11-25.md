# Semantic review batch 029 — manual advertiser payment policy and receipt lifecycle 259–264
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: 0c2f7156928803cb29568322cdd1aa4976ffde4a
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 259–264 from codex/economic-phase-completion-2026-11-18.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence | Result |
|---|---|---|---|
| 6b8ce30c2546f15aa341388bd7e4d1d4a7f841e4 | Return only explicitly configured manual payment modes | Full Platform has no getSupportedPaymentModes endpoint or owner-managed manual advertiser payment mode configuration. | Missing dependent payment-mode subsystem |
| 564eddafc2704f2ed0c6f6b05482dadc018f4f4c | Ignore legacy payment switches unless owner publishes a new policy | Target has no manual advertiser payment-mode endpoint/configuration to reconcile legacy switches against. | Missing dependent payment-mode subsystem |
| e4a24ba10ea2a6647dad81d7c47d47ab99e7eb6f | Test manual advertiser receipts only in isolated fixture | Current featured-ad finance integration tests do not expose recordAdvertiserManualPaymentReceipt or a manual advertiser receipt lifecycle. | Dependent test cannot be ported alone |
| b15cb8114550873717107045fc75e78bc65ee7d4 | Expose supported manual payment mode controls to Super Admin | Current economy pricing screen contains explanatory text but no supported-mode read/write contract; backend endpoint is absent. | Missing dependent owner-control UI/API |
| d2a21fda7f8d362c467a5ccb2eb2be3546d7eb41 | Preserve idempotent advertiser receipt replay after policy changes | Target has no advertiser manual receipt record or replay path to validate. | Missing dependent receipt lifecycle |
| c86892e49b3b7fe968c29f0d5b7cd18633df5568 | Require owner-enabled manual advertising payments before recording receipts | No receipt callable or owner-enabled payment-mode policy exists in target. Adding only the guard would be dead code; adding the whole flow would introduce a new payment operation requiring owner policy approval and complete audit/idempotency tests. | Held for explicit owner decision and complete subsystem design |

## Result
- Reviewed: 6/1,665 unique candidates (259–264).
- Present: 0.
- Missing but dependency-blocked or requiring a new owner-approved payment subsystem: 6.
- Code transferred: 0.
- Tests executed: 0.
- No CI success is claimed.

## Safety decision
Do not create or accept advertiser payment receipts, and do not add payment-mode controls, until the owner explicitly approves the supported manual payment methods, receipt evidence requirements, state machine, idempotency, refund/reversal rules, and audit retention. No money, receipt or production payment state was changed.

## Next
Continue from candidate 265.

## Subsequent HEAD reconciliation — 2026-11-25
The initial table above reflects an earlier Full Platform snapshot (HEAD `0c2f7156928803cb29568322cdd1aa4976ffde4a`). Rechecked against the later current Full Platform tree (HEAD observed after commit d36fba9962b64e6a7af9eed6c658b7ec8c703b11):
- `recordFeaturedAdFinancialEvent` is present in `functions/src/index.ts` and requires the versioned `featured_ads.manualEnabled=true` and `automatedEnabled=false` policy before a new `payment_received` event.
- A verified prior event is replayed idempotently before rechecking current manual-payment enablement, preserving valid historical receipt replay after policy changes.
- `setOwnerEconomyPricing` accepts the explicit paymentPolicy; `projectEconomicPaymentPolicy` ignores legacy booleans when no explicit policy exists.
- `economy_pricing_screen.dart` exposes the owner-controlled manual Featured Ads toggle separately from coin purchases.
- The Featured Ads finance integration fixture enables the mode only inside the test fixture and restores prior platform settings.

Accordingly, current Full Platform evidence now supports **implemented/present: 6** for candidates 259–264. The earlier “missing subsystem” conclusion is superseded by the later code/UI/test integration. This does not activate automated checkout or authorize production payment processing.
