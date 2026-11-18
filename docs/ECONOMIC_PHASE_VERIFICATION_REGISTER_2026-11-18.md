# Economic phase verification register — 2026-11-18

Target branch: `codex/economy-recovery-2026-11-18` (PR #28; base `codex/mawdda-unified-test-2026-11-18`).

This is a source-level review register, not a claim that local tests or Firebase emulators were executed. The connected GitHub session can inspect and commit repository files, but it does not provide a checked-out working tree, Node/TypeScript/Flutter runtimes, Firebase emulators, or the scanner container runtime. No production Firebase operation, billing activation, deployment, merge to `main`, or 5,000-persona lab change was performed.

## Verified implementation present on the branch

### Member gifts and wallet

- `lib/screens/gift_coins_screen.dart` exposes two distinct paths: an owner-configured package gift request and a custom-amount transfer from the sender's existing wallet balance.
- `createCoinPurchaseRequest` validates the requester, recipient, active package and manual-purchase policy; creates a pending owner-contact request and does not credit coins at request time.
- `approveCoinPurchaseRequest` / `rejectCoinPurchaseRequest` provide the owner review path.
- `transferCoins` performs sender debit, recipient net credit, both wallet-ledger entries, platform commission ledger, recipient gift history and notification in one Firestore transaction. It uses the configured commission basis points, expected-commission confirmation and request idempotency.
- Store entitlement gifts are implemented in `giftStoreEntitlement`; the supporting policy tests cover recipient eligibility, exact replay identity, timed expiry stacking and permanent entitlements.

### Call entitlements and call lifecycle

- `startCall` and `markCallConnected` require active voice/video entitlements; expired/missing entitlement fails closed.
- Private group calls revalidate room rental, room membership and participant eligibility.
- Audio group capacity remains **five participants total**, unchanged. The separate video group limit remains four.
- The server establishes a non-resettable five-minute maximum only after caller and at least one accepted recipient both report connected.
- Existing emulator integration tests cover direct and room call lifecycles, expired rentals, entitlements, retries and attempt quotas.

**Explicit financial boundary:** the inspected call lifecycle verifies purchased entitlements; it does not implement per-minute wallet debits or post-call settlement. No new call collection/debit was enabled. A metered charge must remain blocked until the owner approves the tariff, billable start/stop semantics, participant split, rounding, failure/refund rules and settlement/idempotency contract. The existing entitlement model must not be silently mixed with pay-per-use billing.

### Featured ads and media

- Featured-ad sessions require a published, owner-approved, payment-confirmed campaign and approved creative.
- The reward decision is fail-closed: the session currently records client heartbeat as untrusted telemetry and initializes server-validated visibility/playback evidence to false. Thus reward payout remains unavailable until a trusted attestation/evidence source is connected.
- Campaign reward is constrained by owner policy and the campaign's remaining reward budget.
- `featured-ad-finance.ts` is now wired to the owner-only `recordOwnerFeaturedAdFinancialEvent` callable. The callable records manual off-platform owner attestations only; it atomically persists the campaign financial snapshot/version, immutable financial event, and audit row, and uses a stable external-reference identity for replay protection. Payment receipt sets the server-side payment-confirmed flag; any refund clears it and pauses an approved/published campaign. This is a code-level implementation, **not yet emulator-verified**. No payment provider or automated checkout is connected.
- The scanner path is connected through `receiveMediaScanVerdict` and `dispatchMediaSecurityScan`. The scanner requires a current ClamAV signature database and rejects configuration above the fixed 36-hour freshness ceiling. Scanner tests cover HMAC, exact source binding, derivative provenance and signature freshness.
- The capacity policy remains observe-only; only finalized upload bytes/count are partially metered. It is not network-egress, retained-storage, processing-time, active-member or cost metering. Quotas remain unset and are not enforced.

## Local verification status

Not run in this implementation pass by design. Per owner instruction, local builds, test suites, emulators, Flutter analysis and any validation requiring external/local runtime control are deferred until all internal economic code and final modifications are complete. GitHub source inspection/commits do not constitute runtime verification.

No GitHub Actions run was returned for this branch at review time. This is not evidence of a passing build.

## Deferred final validation gates — execute only after internal implementation is complete

1. Run Functions TypeScript build and unit suite locally.
2. Run the dedicated wallet/store gift, call signaling, featured-ad reward/finance and media scanner test suites.
3. Run Firebase Emulator integration suites for wallet/store, call signaling and media upload/scanner callback; verify wallet/ledger balances and idempotent replay.
4. Run Flutter analyze and relevant widget/unit tests for the gift and owner screens.
5. Connect and test trusted ad-view evidence before enabling any viewer reward.
6. At the final validation stage, execute the owner-only featured-ad finance integration test on the Firebase Emulator, including duplicate/concurrent replay, stale-version, refund and audit-chain retry cases.
7. Obtain explicit owner approval of call tariff and settlement rules before implementing any metered call debit.
8. Keep production billing, deployment, `main` merge and the separate 5,000-persona repository untouched until their independent gates and approvals.

## Safety decision

The economic implementation remains on the unified test branch. Missing local execution evidence and the explicit call-settlement/ad-finance integration gates prevent declaring the full economic phase complete. Collection and reward payout remain fail-closed where their prerequisites are not proven.

## Follow-up source recheck — 2026-11-18 15:53 (+03:00)

This paragraph records a historical source recheck of an earlier branch and is superseded by the current PR #28 implementation notes below.

The earlier source recheck found wallet and store flows, but did not yet include the subsequent featured-ad finance wiring described below. Its statement that the finance module was unconnected is historical and no longer describes the current branch.
- Viewing-session creation initializes server-validated visibility and playback evidence to false; client heartbeat remains telemetry. No attestation integration is present in the inspected entry point, so rewards must remain blocked.
- Call start/connect/end callables exist, but the source review still found no metered wallet-debit or post-call settlement path. Do not infer a tariff or enable collection.

No source code was changed during this recheck. No local command, test suite, emulator, Flutter analysis, scanner runtime or build was executed. The execution limitation and required gates above remain in force.


## Follow-up implementation — 2026-11-18

- Added `recordOwnerFeaturedAdFinancialEvent` to `functions/src/index.ts` and imported the existing `featured-ad-finance.ts` state machine.
- The callable requires a recent MFA-backed platform-owner session and a caller-supplied expected campaign version. It rejects withdrawn campaigns, malformed/corrupt financial state, stale versions, and conflicting reuse of an external payment reference.
- Each accepted event writes the updated campaign financial snapshot/version, a deterministic immutable event under `featuredAdCampaigns/{campaignId}/financialEvents`, a separate pending audit outbox row, and a corresponding `adminAuditLogs` record in one Firestore transaction. The outbox status is advanced only after the deterministic owner hash-chain append; the financial event itself is never mutated.
- A confirmed manual receipt enables the campaign's server-side `paymentConfirmed` flag. A refund clears that flag; an approved or published campaign is moved to `paused` so a refunded campaign cannot continue serving. This is deliberately manual-owner-only; no provider, webhook, checkout, or production payment configuration was added.
- Added an emulator integration case to `functions/test/integration/wallet-store.integration.test.js` covering manual receipt, exact replay, partial refund, campaign version, and immutable event count.
- GitHub writes completed on branch `codex/economy-recovery-2026-11-18`. The integration test and TypeScript build have **not** been executed in this session because the GitHub connector provides repository operations but no checked-out Node/Firebase Emulator runtime.
- Remaining: run `npm run build && npm run test:wallet-store-integration` and inspect the emulator report; verify the pending-to-appended audit-chain retry path under a simulated failure; continue the independent wallet historical reconciliation / entitlement expiry-renewal audit. The integration test now includes concurrent exact replay and stale-version rejection assertions, but those assertions have not been executed. Do not mark the economic phase complete until those gates pass.

## Current internal implementation additions — 2026-11-18

### Owner manual payment modes and snapshots

- `platformSettings/economyPricing` now carries separate owner switches for manual coin top-ups and manual featured-ad payments. The automatic checkout flag remains server-forced false; there is no selected or configured payment provider, webhook verifier, or automatic settlement.
- Owner pricing settings can be saved with empty coin/ad price arrays. This represents an intentionally unconfigured catalog and allows the owner to configure the featured-ad manual mode without inventing coin package or ad prices.
- Newly created coin purchase requests snapshot the manual channel and economy policy version. Existing pending requests retain their original manual channel; legacy requests without a snapshot are migrated to an explicit legacy-manual snapshot when owner instructions are first issued.
- Coin purchase manual instructions now require `expectedInstructionsVersion`. Stale owner edits are rejected, and the owner UI submits the version returned by the request. Manual coin requests are no longer disabled merely because a future automated mode flag is independently enabled.
- New featured-ad campaigns snapshot whether manual payment was enabled at creation. New manual financial events fail closed if that snapshot disallows manual payment; legacy campaigns without a snapshot retain their legacy manual path. A later policy toggle does not rewrite an existing campaign's payment snapshot.
- `OwnerFeaturedAdsDashboardScreen` is now reachable from Super Admin and exposes the manual receipt, refund, settlement reconciliation and financial review actions. The owner must enter the external reference and verification note; receipt/refund require an evidence reference. The server remains the sole authority for campaign payment state.

### Wallet ledger integrity

- Coin purchase idempotent replay now requires the matching immutable approval audit record in addition to the wallet ledger. The replay validates purchaser/recipient/reference/amount linkage and checks ledger balance arithmetic; deleting the audit evidence fails closed without changing the balance.
- New coin transfers persist sender/recipient balance-before and balance-after snapshots in both transaction and wallet ledger records. Replay recomputes the commission/net breakdown and validates all ledger legs, identities and any present balance snapshots. Legacy rows without snapshots remain readable; partially populated or inconsistent snapshots fail closed.
- New store purchases persist balance snapshots in the purchase receipt and immutable debit ledger. Replay validates the arithmetic and receipt/ledger relationship; legacy rows without snapshots remain compatible.
- Store entitlement gifts now persist balance snapshots and verify the sender debit, recipient identity, gift receipt, history and notification on replay.

### Internal tests added or expanded (not executed)

- Owner payment instruction validator tests require a nonnegative expected version.
- Wallet/store integration coverage includes stale instruction rejection, payment-policy snapshot preservation, missing approval-audit rejection, and transfer/store/gift balance snapshot assertions.
- Featured-ad finance integration coverage includes concurrent exact replay, stale-version rejection, partial refund, immutable event/audit persistence, and rejection when the campaign's immutable payment snapshot disables manual payments.
- Economy pricing tests allow empty owner price catalogs as an unconfigured state; integration coverage exercises featured-ad manual mode independently from coin/ad price lists.

### Still unimplemented / intentionally fail-closed

- No automatic payment provider integration or webhook is present. Automatic checkout cannot be enabled from the owner UI or client.
- General advertising intake, creator/production applications, subscriptions and other future paid services do not yet have complete per-service order/contract/payment/ledger fulfilment workflows; they must not be exposed as payable or enabled by a generic toggle until those service-specific flows exist.
- The store and room rental purchases currently use BetaCoins; they are not cash checkout integrations.
- No final build, emulator, Flutter, or external validation was run in this pass, in accordance with the owner's sequencing instruction.