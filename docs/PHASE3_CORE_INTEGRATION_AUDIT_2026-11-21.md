# Phase 3 Core Integration Audit — 2026-11-21

## Scope and safety
This record audits the current development branch for the phase-3 integration of economy, calls, advertising, entitlements, wallet ledger, and their tests. It is an integration assessment, not a claim of phase acceptance.

- Repository: `productionhome2022-hash/mawda-platform`
- Branch: `codex/mawda-full-platform-implementation`
- Audited HEAD before this record: `40d129264479185b00e33fd9a4d55ef7e346f19c`
- No production resources, Firebase configuration, billing, payment provider, deployment, or `main` branch were changed.
- No price, quota, call tariff, or payment method was invented or enabled.

## Existing integrated behavior confirmed in the branch

1. **Coin purchase payment policy**
   - `functions/src/economy-payment-policy.ts` is imported and used by `functions/src/index.ts`.
   - Coin purchase reads and request creation enforce the per-service manual-payment policy.
   - Automated checkout remains disabled.
   - Unsupported manual-payment services are rejected by the policy validator.

2. **Featured-ad financial lifecycle**
   - `featured-ad-finance.ts` is imported by the central Functions entry point.
   - Manual payment receipt checks the featured-ad policy and records a policy snapshot with the financial event.
   - Replay validation and audit evidence are handled in the existing transaction flow.

3. **Wallet ledger reconciliation**
   - `wallet-reconciliation.ts` is called by the owner-facing read-only reconciliation endpoint.
   - The endpoint bounds inspection to 1,000 entries and reports truncation or incomplete chronology rather than claiming a full historical reconciliation.
   - Reconciliation does not automatically change wallet balances.

4. **Store gifting**
   - The target branch already contains a server-side `giftStoreItem` flow and imports `store-gifting.ts`.
   - This branch's implementation is not identical to the implementation proposed in PR #22. It must be preserved and reconciled against the source behavior rather than overwritten.
   - The target entry point does not currently export `getMyStoreGiftHistory`; the PR #22 implementation contains such a history projection, but it must be adapted to the target branch's actual stored schema and authorization rules.

5. **Call signaling and room eligibility**
   - The target branch has transactional call creation, participant locks, room-rental checks, acceptance, connection confirmation, signaling, and maximum-duration termination.
   - These are call admission/signaling controls, not metered economic settlement.

## Phase-3 integration gaps that prevent safe acceptance

1. **Call economy is not wired into call lifecycle**
   - `functions/src/group-call-economy.ts` exists and has unit tests for owner-configured rates, integer allocation, reservation estimates, and settlement calculations.
   - The central `functions/src/index.ts` does not import or call `calculateGroupCallBillingSlice`, `calculateGroupCallMaximumReservation`, or `calculateGroupCallFinalSettlement`.
   - The target branch has no `functions/src/call-entitlements.ts`.
   - The current call lifecycle does not implement bilateral explicit billing consent, authoritative metering, per-member quota reservation/consumption, atomic wallet debits and ledger credits, replay-safe finalization, refunds/reversals, or crash recovery.
   - Existing signaling tests therefore cannot be treated as call-economy acceptance evidence.

2. **Owner-controlled call prices and consent semantics**
   - No approved live call tariff or call-billing activation decision was found in the audited target branch.
   - Do not seed a price, turn on collection, or infer bilateral consent from joining/accepting a call.
   - Until these decisions and the complete server-side workflow exist, paid call collection must remain disabled/fail-closed.

3. **Store-gift history integration**
   - The target branch has the gifting transaction but lacks the corresponding member-facing history callable present in PR #22.
   - The PR #22 source uses a different implementation shape from the target branch. Its history behavior must be adapted and tested against the target branch's existing gift and coin-package gift collections; do not transplant its full `index.ts`.

4. **Economic workflow closure**
   - Public-ad, influencer/creator, and cash-paid store-entitlement payment paths remain disabled until request, owner-attestation, fulfilment, audit, and reversal workflows are complete.
   - No payment provider or automated checkout is configured or enabled.
   - Wallet reconciliation remains bounded and read-only; it is not a platform-wide historical reconciliation.

## Source comparisons performed
- PR #22: reviewed changed-file inventory and targeted patches for `index.ts`, `call-signaling.ts`, `store-gifting.ts`, and `group-call-economy.ts`.
- PR #28: reviewed changed-file inventory and targeted patches for `economy-payment-policy.ts`, `wallet-reconciliation.ts`, `coin-purchase-requests.ts`, and `room-rental.ts`.
- PR #24 and #25 remain draft integration sources with overlapping core files; neither was merged wholesale.
- The source PRs target other development/test branches and are not safe substitutes for a minimal semantic integration into the official development branch.

## Validation status
- GitHub source reads and exact branch comparison completed.
- Branch HEAD was confirmed as `40d129264479185b00e33fd9a4d55ef7e346f19c` before this audit record.
- No TypeScript build, Node tests, Firestore Emulator tests, Flutter analysis/tests, or CI run was executed during this audit.
- Therefore no test or build pass is claimed.

## Phase-3 status
**NOT COMPLETE — integration and acceptance gates remain open.**

The next safe implementation sequence is:
1. Add/adapt the member gift-history callable against the current target-branch schema, with unit and emulator coverage.
2. Specify and obtain owner approval for call billing consent, tariff source, quota rules, charge allocation, and stop/refund behavior before implementing collection.
3. Implement call-entitlement reservation, metering, atomic ledger settlement, idempotency, recovery, and failure-closed behavior as a coherent server workflow.
4. Add transaction-level emulator coverage for concurrent calls, insufficient balances, participant changes, retries, interrupted settlement, and refund/reversal.
5. Close remaining economic payment workflow gates without enabling any unsupported payment service.
6. Run the complete Functions build/unit/emulator suite on one exact SHA and document the actual CI evidence.

No merge to `main`, deployment, live Firebase mutation, payment collection, or billing activation is authorized by this phase audit.


## Follow-up implementation — 2026-11-21

The following bounded integration work was subsequently added to the same official development branch:

1. `functions/src/call-entitlements.ts`
   - Validates a versioned owner-configured call test tariff using the canonical `group-call-economy.ts` validator.
   - Marks every such policy `environment: test_only` and `billingEnabled: false`.
   - Exposes a hard-false collection gate: no settings value can turn real call collection on.
   - Produces a sanitized immutable test-price snapshot for a newly created call session.
   - Provides a strict whitelist projection for member-visible gift history.

2. `functions/src/index.ts`
   - Adds MFA/owner-protected `getOwnerGroupCallPricingPolicy` and `setOwnerGroupCallPricingPolicy` callables.
   - Versions every owner change and appends an owner audit event.
   - Reads the configured test tariff transactionally when creating a call and freezes its version/rate in the call session; `getActiveCall` returns that test-only snapshot.
   - Does not debit wallets, reserve coins, settle calls, or enable paid calling.
   - Adds `getMyStoreGiftHistory`, which returns only completed/fulfilled sent and received store gifts for the authenticated member, with private/internal fields excluded.

3. Owner/member Flutter integration
   - Adds `lib/screens/group_call_pricing_screen.dart` and links it from the Super Owner dashboard.
   - The screen lets the owner configure experimental audio/video per-minute values and enable/disable the test policy; it visibly states that collection is disabled.
   - Extends `MemberEntitlementHistoryScreen` to display sent and received store gifts alongside free owner grants.

4. Tests
   - Adds unit coverage for test-only policy validation, immutable non-collecting price snapshots, and private gift-history projection.
   - Adds Firestore Emulator integration coverage for owner tariff versioning, invalid values, collection remaining disabled, member history privacy, and ineligible-account rejection.
   - Registers the integration test in `functions/package.json` and `test:all`.

## Remaining boundary
This follow-up integrates owner-controlled test prices into call-session metadata and gift-history display. It deliberately does **not** implement or activate paid-call settlement. The previously approved call entitlement package rules, both-party entitlement verification/consent, open-call metering, atomic wallet debits, ledger settlement, reversals, and recovery remain separate acceptance gates. The owner-configured test tariff is not a live price and cannot cause a charge.

## Verification
- GitHub reads confirm the new source, test, and Flutter files are present on the official development branch.
- The integration test is registered but has not been executed in this environment.
- No Functions TypeScript build, Node test suite, Firestore Emulator test, Flutter analyze/test, CI run, or device acceptance is claimed.
- No production Firebase resources, real wallet balances, payment settings, `main`, or deployment targets were changed.


5. Gift-history query/index alignment
   - Sent and received gift queries are bounded to the newest 50 records per direction and ordered by server-created time.
   - Added the two matching `storeGifts` composite indexes to `firestore.indexes.json`.
   - The member history projection remains restricted to the authenticated sender or recipient and whitelisted display fields.

## Exact branch verification after follow-up
- Official branch: `codex/mawda-full-platform-implementation`
- Verified HEAD: `831adb42de982df6e489df9746b583e99adfa4f9`
- GitHub compare of branch against this commit: `identical`, ahead 0, behind 0.
- Combined commit status and PR-associated workflow lookup returned no checks/runs for this commit; this is not a test pass.


6. Call package entitlement fulfillment and enforcement
   - The six owner-editable catalog SKUs for voice/video (24h, 7d, 30d) are now marked as server-fulfillable; they remain unpublished/non-purchasable until the Super Owner explicitly publishes and enables each catalog item.
   - Call creation transactionally verifies a matching active, unexpired package for every participant.
   - Call acceptance revalidates the caller, already accepted participants, and the accepting member so an expired/revoked package cannot be used to join.
   - The existing purchase/gift flows grant the matching entitlement document; no new wallet charging path was introduced for per-minute calling.
   - Unit and call-signaling emulator tests were extended for package SKU readiness, both-party checks, expiry, and revalidation at acceptance.

## Updated call-economy boundary
- Store package purchases continue to use the existing atomic store purchase/gift transactions and the owner-managed catalog prices/durations.
- The separate owner test tariff is versioned, snapshotted into new sessions, and strictly non-collecting.
- Open-call per-minute billing, quota-exhaustion billing allocation, explicit paid-call consent, atomic debits/credits, refunds, and crash recovery remain disabled/not implemented. No per-minute call charge can be made.


## Final follow-up verification point
- The final code head before this documentation-only amendment was `de3a7ba6d257635282bb7687a64803d5e34bd041`.
- The official branch compared against that exact commit is identical (0 ahead / 0 behind).
- GitHub returned no commit status checks and no PR-associated workflow runs for the checked commit. Build, unit, emulator, and Flutter test success is therefore **not asserted**.
