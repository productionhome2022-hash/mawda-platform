# Economic phase verification register — 2026-11-18

Target branch: `codex/mawdda-unified-test-2026-11-18`

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
- `featured-ad-finance.ts` contains a tested pure financial state machine for payment/refund/reconciliation/review. The inspected `index.ts` does not expose owner financial-event callables that persist this state machine as an audited Firestore ledger. Therefore this is **not** a completed live campaign-payment/refund/settlement workflow.
- The scanner path is connected through `receiveMediaScanVerdict` and `dispatchMediaSecurityScan`. The scanner requires a current ClamAV signature database and rejects configuration above the fixed 36-hour freshness ceiling. Scanner tests cover HMAC, exact source binding, derivative provenance and signature freshness.
- The capacity policy remains observe-only; only finalized upload bytes/count are partially metered. It is not network-egress, retained-storage, processing-time, active-member or cost metering. Quotas remain unset and are not enforced.

## Local verification status

Not run in this session. GitHub source access is not a local runtime. The branch's `functions/package.json` defines the Node test/build and Firebase Emulator integration scripts; scanner has a separate `npm test`. Flutter analysis/tests and emulator suites require the project checkout and installed dependencies in Termux or another local environment.

No GitHub Actions run was returned for this branch at review time. This is not evidence of a passing build.

## Required gates before calling the economic phase complete

1. Run Functions TypeScript build and unit suite locally.
2. Run the dedicated wallet/store gift, call signaling, featured-ad reward/finance and media scanner test suites.
3. Run Firebase Emulator integration suites for wallet/store, call signaling and media upload/scanner callback; verify wallet/ledger balances and idempotent replay.
4. Run Flutter analyze and relevant widget/unit tests for the gift and owner screens.
5. Connect and test trusted ad-view evidence before enabling any viewer reward.
6. Implement and test persisted owner-only ad financial event callables before treating the finance state machine as live.
7. Obtain explicit owner approval of call tariff and settlement rules before implementing any metered call debit.
8. Keep production billing, deployment, `main` merge and the separate 5,000-persona repository untouched until their independent gates and approvals.

## Safety decision

The economic implementation remains on the unified test branch. Missing local execution evidence and the explicit call-settlement/ad-finance integration gates prevent declaring the full economic phase complete. Collection and reward payout remain fail-closed where their prerequisites are not proven.

## Follow-up source recheck — 2026-11-18 15:53 (+03:00)

The unified test branch head was re-read as `71cff419c917455cc2e1dbdec20770fc8f2e7cc6`; this register is present on that branch. The open PR #27 remains a draft from `codex/mawdda-unified-final` and is not part of this branch's head.

The current `functions/src/index.ts` export inventory confirms:
- Wallet transfer and store entitlement gifting callables exist.
- Featured-ad campaign, creative review, viewing-session and reward callables exist.
- The featured-ad finance state machine module is not imported or referenced by the Functions entry point, and no persisted owner financial-event callable is exported there. It remains a pure, unconnected module rather than a live audited payment/refund/reconciliation workflow.
- Viewing-session creation initializes server-validated visibility and playback evidence to false; client heartbeat remains telemetry. No attestation integration is present in the inspected entry point, so rewards must remain blocked.
- Call start/connect/end callables exist, but the source review still found no metered wallet-debit or post-call settlement path. Do not infer a tariff or enable collection.

No source code was changed during this recheck. No local command, test suite, emulator, Flutter analysis, scanner runtime or build was executed. The execution limitation and required gates above remain in force.
