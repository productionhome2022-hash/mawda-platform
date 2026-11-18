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
- Finance event replay identity is the stable campaign/action/external-reference tuple. A client retry may use a different attempt idempotency key after a timeout without creating a duplicate or being rejected as a different business event; the financial payload and owner actor must still match.
- Replay requires the original immutable finance audit row to match the actor, campaign, event, action, reference, amount and currency. A missing audit row fails closed. The separate audit outbox can recover a pending marker after the hash-chain append, verifies the deterministic chain record before marking completion, and fails closed if an already-appended chain record later disappears.
- A confirmed manual receipt enables the campaign's server-side `paymentConfirmed` flag. A refund clears that flag; an approved or published campaign is moved to `paused` so a refunded campaign cannot continue serving. This is deliberately manual-owner-only; no provider, webhook, checkout, or production payment configuration was added.
- Added an emulator integration case to `functions/test/integration/wallet-store.integration.test.js` covering manual receipt, exact replay, partial refund, campaign version, and immutable event count.
- GitHub writes completed on branch `codex/economy-recovery-2026-11-18`. The integration test and TypeScript build have **not** been executed in this session because the GitHub connector provides repository operations but no checked-out Node/Firebase Emulator runtime.
- Remaining: run `npm run build && npm run test:wallet-store-integration` and inspect the emulator report; verify the pending-to-appended audit-chain retry path under a simulated failure; continue the independent wallet historical reconciliation / entitlement expiry-renewal audit. The integration test now includes concurrent exact replay and stale-version rejection assertions, but those assertions have not been executed. Do not mark the economic phase complete until those gates pass.

## Current internal implementation additions — 2026-11-18

### Owner manual payment modes and snapshots

- `platformSettings/economyPricing` now carries separate owner switches for manual coin top-ups and manual featured-ad payments. The automatic checkout flag remains server-forced false; there is no selected or configured payment provider, webhook verifier, or automatic settlement.
- Owner pricing settings can be saved with empty coin/ad price arrays. This represents an intentionally unconfigured catalog and allows the owner to configure the featured-ad manual mode without inventing coin package or ad prices.
- Newly created coin purchase requests snapshot the manual channel and economy policy version. Existing pending requests retain their original manual channel; legacy requests without a snapshot are migrated to an explicit legacy-manual snapshot when owner instructions are first issued.
- Coin purchase manual instructions now require `expectedInstructionsVersion`. Concurrent/stale first issuance is version-guarded; once issued, negotiated instructions and price are immutable and the owner must close/recreate a request to correct them. Manual coin requests are no longer disabled merely because a future automated mode flag is independently enabled.
- Members can now report that they initiated an external payment. This moves the request to `awaiting_payment_verification` and records a claim-only audit event; it never verifies receipt or credits coins. Once reported, member withdrawal is locked once payment instructions are issued, and payment instructions are locked after the member reports payment, to avoid changing/cancelling a possibly paid request. Owner verification remains the only credit authority.
- New featured-ad campaigns snapshot whether manual payment was enabled at creation. New manual financial events fail closed if that snapshot disallows manual payment; legacy campaigns without a snapshot retain their legacy manual path. A later policy toggle does not rewrite an existing campaign's payment snapshot.
- `OwnerFeaturedAdsDashboardScreen` is now reachable from Super Admin and exposes the manual receipt, refund, settlement reconciliation and financial review actions. The owner must enter the external reference and verification note; receipt/refund require an evidence reference. The server remains the sole authority for campaign payment state.

### Wallet ledger integrity

- Coin purchase idempotent replay now requires the matching immutable approval audit record in addition to the wallet ledger. The replay validates owner attribution, purchaser/recipient/reference, amount, price, currency, credit target, and ledger balance arithmetic; deleting or altering audit evidence fails closed without changing the balance.
- New coin transfers persist sender/recipient balance-before and balance-after snapshots in both transaction and wallet ledger records. Replay recomputes the commission/net breakdown and validates all ledger legs, identities and any present balance snapshots. Legacy rows without snapshots remain readable; partially populated or inconsistent snapshots fail closed.
- New store purchases persist balance snapshots in the purchase receipt and immutable debit ledger. Replay validates the arithmetic and receipt/ledger relationship; legacy rows without snapshots remain compatible.
- Store entitlement gifts now persist balance snapshots and verify the sender debit, recipient identity, gift receipt, history and notification on replay.
- Owner free-grant replay now validates the immutable grant, grant ledger and audit evidence independently of the current entitlement document. An entitlement may have expired or been superseded by a later paid purchase; replay remains idempotent and never overwrites that newer entitlement.

### Internal tests added or expanded (not executed)

- Owner payment instruction validator tests require a nonnegative expected version.
- Wallet/store integration coverage includes stale instruction rejection, payment-policy snapshot preservation, missing approval-audit rejection, and transfer/store/gift balance snapshot assertions.
- Manual coin payment integration coverage includes member payment-report idempotency, the claim-only status transition, and rejection of member withdrawal after payment instructions are issued and rejection of instruction edits/member withdrawal after the member reports payment.
- Featured-ad finance integration coverage includes concurrent exact replay, stale-version rejection, partial refund, immutable event/audit persistence, and rejection when the campaign's immutable payment snapshot disables manual payments.
- Economy pricing tests allow empty owner price catalogs as an unconfigured state; integration coverage exercises featured-ad manual mode independently from coin/ad price lists.
- Owner-grant integration coverage now exercises replay after expiry and a subsequent paid purchase, and checks that missing immutable audit evidence still fails closed.

### Still unimplemented / intentionally fail-closed

- No automatic payment provider integration or webhook is present. Automatic checkout cannot be enabled from the owner UI or client.
- General advertising intake, creator/production applications, subscriptions and other future paid services do not yet have complete per-service order/contract/payment/ledger fulfilment workflows; they must not be exposed as payable or enabled by a generic toggle until those service-specific flows exist.
- The store and room rental purchases currently use BetaCoins; they are not cash checkout integrations.
- No final build, emulator, Flutter, or external validation was run in this pass, in accordance with the owner's sequencing instruction.

## Room-rental financial replay hardening — 2026-11-18

- The economic recovery branch now validates room-rental creation replays against the original room, owner membership, immutable rental receipt and debit-ledger entry. Missing or inconsistent financial evidence fails closed instead of returning a successful replay.
- Room-rental renewal replays now require the matching debit-ledger entry and reconcile the amount, rental/room/plan identity, balance-before/balance-after snapshot and receipt balance. Missing or inconsistent evidence fails closed.
- New room-rental creation and renewal writes persist balance-before/balance-after snapshots in both the rental receipt and wallet ledger.
- Added emulator integration assertions for creation/renewal snapshots, idempotent replay and fail-closed behavior when either debit ledger is missing; test source has been committed but has **not** been executed.
- Commits: implementation `02dd33bd050ba0bd6fc4295a4d45a80e92477952`; initial regression tests `4dfc39d86bebbf7cdc800f004fc325e9d3c6fc48`; test isolation correction `47712ea84ffcc7fea2d3e6d46d7030c5cac86c72`.
- Final TypeScript build, Functions unit suite and room-rental emulator integration remain deferred until the internal economic implementation pass is complete. No live Firebase operation, billing, deployment, merge to `main`, or 5,000-persona lab action occurred.


## Owner clarification — call-economy prices are experimental, never final — 2026-11-18

- Any example call rates previously discussed (including 120/400 coins per minute and 60/200 coins per minute) are **temporary test placeholders only**. They are not approved, final, contractual, published, or immutable prices. They must never be embedded as production constants, silently seeded as owner-approved values, or treated as a release baseline.
- The canonical platform owner/Super Admin must be able to raise, lower, replace, disable or leave unset each voice/video tariff from the owner console. Pricing must be read from validated, versioned server-side policy and snapshotted into each billable call/session so a later price edit cannot rewrite an already-started session.
- This applies separately to voice and video, including ordinary mutual billing and the exceptional caller-only billing case when the caller has exhausted their quota but the recipient still has eligible included quota. The actual rates and any rounding/commission values remain owner decisions; do not infer or finalize them from historical examples.
- No per-minute collection may run until server-authoritative billable duration, exact participant eligibility, quota reservation/consumption, caller/receiver charge allocation, rounding, wallet sufficiency, atomic ledger posting, idempotent finalization, interruption recovery, refunds/reversals and owner-configurable tariff controls are implemented and tested.
- Source review found a major implementation gap: current `startCall`/call lifecycle enforces hard-coded attempt-count and five-minute ceiling constants and requires active paid call entitlements for admission; the inspected call lifecycle does not provide the agreed included daily quota path or per-minute wallet settlement. This is recorded as an open economic blocker, not as a completed call-economy implementation. Do not enable or collect call charges in this state.

## Economic-only execution boundary reaffirmed — 2026-11-18

Continue implementation, repair, audit and tests only for the platform-wide economic domain: wallet/coin ledger, coin purchase and transfer, store and timed entitlements, room rental/renewal, voice/video call quotas and settlement, advertising/rewards/financial reconciliation, payment-mode controls, owner pricing controls, economy audit trail, and economic cost/usage metering. Do not expand this pass into unrelated product, UI, infrastructure or release tasks. All runtime validation remains a final gate after internal economic implementation is complete.

## Owner clarification — one total bilateral call tariff, automatically split 50/50 — 2026-11-18

- The owner configures **one total per-minute price for the bilateral call** (voice or video), not two independent participant prices. The configured amount represents the combined charge for both participants together.
- For ordinary bilateral billing, the server automatically allocates exactly half of that configured total to the caller and half to the recipient. Examples only: a total voice tariff of 500 coins/minute means 250 coins/minute per participant; a total voice tariff of 1,000 means 500 each. A total video tariff of 1,000 means 500 each; a total video tariff of 2,000 means 1,000 each. These amounts are illustrations of the split rule, not approved tariffs.
- This 50/50 allocation is deterministic server-side policy. The owner changes only the total tariff; the platform calculates both participant shares. Do not require the owner to enter two halves or allow client-supplied participant amounts.
- The earlier caller-only exception remains a separately defined eligibility case: if the caller has exhausted their included quota while the recipient still has eligible included quota, charge only the caller at the configured total bilateral rate (the full combined tariff), and do not charge the recipient. This exception must be explicit in the session's immutable billing-policy snapshot and ledger allocation.
- The total tariff and 50/50 allocation rule must be snapshotted at the billable session start. Later owner price changes apply only to new sessions. Currency/coin precision, odd-number split remainder handling, minute rounding and insufficient-balance behavior must be explicitly validated and tested before collection is enabled; never silently lose or create coins.
- All numeric examples remain experimental illustrations only. No final tariff amount is approved by this clarification.

## Platform-wide economic authority — experimental values are test fixtures only — 2026-11-18

### Non-negotiable owner authority

This policy applies to **every economic surface and every present or future paid, rewarded, timed, metered, promotional or entitlement-bearing feature throughout Mawdda Platform**, not merely calls or the store. This includes (without limitation): BetaCoins and wallet operations; coin packages/top-ups/gifts/transfers/commissions/rewards; all store products, features, badges, titles and gifts; subscriptions and renewals; room rentals and extensions; voice/video calls and quotas; Media Saver and all media-related paid entitlements; advertising, featured campaigns, creator/production monetization, referral/attendance/engagement rewards, service fees, discounts, taxes/fees if applicable, limits and usage-based charges.

The platform owner (Super Admin) must have complete, granular, auditable control over each applicable economic parameter through the owner console, including:

- Price/amount/rate, currency or coin denomination, price tiers and per-period pricing.
- Duration, validity, expiry, renewal, grace period, cooldown, retention window where it is an economic entitlement, and any other time interval.
- Quantity, quota, usage caps, per-user/per-period limits, capacity, minimum/maximum purchase, stacking and concurrency policy.
- Active/inactive/paused/hidden state; availability by account/region/feature as supported by policy; manual versus automated payment mode for each independently supported flow.
- Reward, commission, split/allocation, discount and fee rules, including the bilateral call tariff split and exception policy.

Every setting must be independently configurable where the business rule requires it, validated server-side, versioned, auditable, and enforced by server-authoritative logic. The owner console must expose the full supported control surface; it must not show editable controls that the backend ignores. A missing, invalid, expired or unconfigured policy must fail closed for paid collection/entitlement grants rather than silently fall back to a hard-coded commercial value.

### Experimental/test data policy

1. All numeric prices, durations, quotas, quantities, commissions, rates and limits introduced by engineering for development, automated tests, emulator fixtures, demos or internal verification are **experimental test values only**.
2. Such values must be clearly marked as test/fixture/sample values in source, seed data, documentation and test reports. They must never be represented as approved production defaults, final prices, or launch-ready commercial policy.
3. No test fixture or development fallback may silently seed or overwrite production owner settings. No production migration may promote experimental values into active production configuration.
4. At real-user trial/release preparation, all economic settings must remain unconfigured/disabled or be explicitly reviewed and approved by the owner through the production owner console. Engineering examples are not owner approval.
5. Tests should use named fixture factories and isolated emulator/test namespaces, with assertions proving that fixture settings cannot leak into production configuration. Avoid hard-coded commercial constants in runtime code; technical safety ceilings may exist only when they are clearly identified as security/resource-protection limits rather than owner-set commercial prices or durations, and must be documented separately.
6. If a parameter must have a technical invariant (for example, a safety maximum imposed for abuse or infrastructure protection), distinguish it from the commercial policy: the owner can configure values within the safe envelope, while the invariant is not mislabeled as a product price or commercial duration.

### Configuration model and lifecycle requirements

- Use a canonical, typed, versioned economic policy/catalog model rather than scattered constants or per-screen local defaults.
- Support independently configurable duration/price options wherever relevant (including the owner's previously specified 24-hour, one-week and one-month examples); these are option examples, not mandatory fixed durations. The owner may add, remove, reorder, disable or change supported periods and their independent prices, subject to technical constraints.
- Persist a complete immutable policy snapshot with every order, purchase, renewal, rental, call settlement, campaign financial event, reward claim or other economic transaction. The snapshot must identify policy version, selected product/period, applied amounts, allocation rules, actor and timestamps. Later edits apply prospectively and never rewrite historical transactions.
- Enforce optimistic concurrency/version checks on owner edits; reject stale updates. Record before/after values, owner identity, reason and timestamp in an append-only audit trail. Require appropriate recent owner authentication for sensitive changes.
- Ensure UI, callable/API validation, transaction processing, ledger, receipts, reports and tests all use the same canonical policy contract. Never trust a price, duration, quota, split or discount supplied by the client as authoritative.
- Include a safe preview/simulation mode for testing a proposed policy before activation, and separate draft/test values from explicitly owner-approved active values.

### Release gate

No economic parameter is considered final or ready for real users merely because it appears in code, a test, a sample catalog, a demo screen or a documentation example. The owner must explicitly review and activate the production values. Before the economic phase is declared complete, audit all economic domains for hard-coded commercial values, missing owner controls, inconsistent UI/backend contracts, missing policy snapshots, unsafe fallback behavior, and test-to-production configuration leakage. Record each gap and its disposition in the economic verification register.

## Owner rule — bilateral prices must split into whole coins — 2026-11-18

For every economic price that is defined as one combined amount and divided equally between exactly two participants (including bilateral voice/video calls), the owner will enter only a **non-negative whole-number amount divisible by 2**. The owner will not configure an odd amount that produces fractional participant shares. Therefore:

- Validate the configured combined amount as an integer and require `amount % 2 === 0` before saving or activating the bilateral tariff.
- Reject invalid values in the Super Admin UI and independently on the server; do not round, truncate, redistribute a remainder, or silently adjust the entered amount.
- Each participant receives an exact whole-coin half of the configured combined amount under standard 50/50 bilateral billing.
- The caller-only exception continues to charge the caller the full configured combined amount when that exception's eligibility conditions are met; the tariff itself must still satisfy the even-integer validation rule.
- This restriction is specifically for owner-defined combined prices that are split equally between two parties. It does not impose a blanket even-number restriction on unrelated single-recipient products, fees, rewards or prices.
- Add positive and negative validation tests: even whole numbers accepted; odd whole numbers, fractional values, non-finite values and negative values rejected. No fractional coin arithmetic or remainder policy is needed for this bilateral split.


## Owner-controlled economy hardening — implementation follow-up (2026-11-18)

- Added server-side validation and versioned persistence for owner-configured combined voice/video per-minute tariffs. Each tariff is either explicitly unset or a positive safe even integer; the client cannot supply separate participant prices. The owner console now reads and writes both values and rejects odd, fractional, zero, negative or malformed values before submission; the server repeats validation. The saved policy remains a tariff configuration only: call charging is still disabled until included quota accounting, billable duration, exact 50/50/caller-only allocation, atomic ledger settlement, replay recovery and reversal paths are implemented.
- Room rental no longer falls back to active hard-coded default plans when owner settings are absent. An unconfigured room-rental catalog now returns no purchasable plans and room creation/renewal fails closed. The validator accepts an empty catalog so the owner can deliberately disable every plan.
- Store entitlement duration is no longer restricted to a fixed 1/7/30-day list. Owner-configured durations may be any positive whole number of days within the technical safety ceiling (1–3650); this ceiling is a technical bound, not a commercial preset.
- Newly seeded store catalog entries remain hidden and non-purchasable until the owner explicitly reviews and publishes them. Seeded amounts are suggestions/fixtures, not live member offers.
- Added/updated unit-test source for even bilateral tariffs, flexible room/store durations, and empty/unconfigured room rental catalogs. These tests have not been executed; all final runtime verification remains deferred until the owner-designated complete test environment.
- Source commits: ae4e3cb24011537fd99b0644fe9422f630daef9e, b0183b6fa0880fb61c96c5c9cf40ab46be3e0269, a83d03b97000f550ac23411bc33abb7bce74abee, 4da043f44e0cbec13388fbf54f3289f495b67c70, 62b33f7556c993602d3e19f46a7abe30289a4f50, 8af270606111c03ff98ff62dca7c6479070673be, b02d5167f1bed0c79a87d9d7794eb08662f32106, b2f257596ded83bd7969cd6b2f2ed631f7537ff2, 219d4ff1045d157ea78accddbb41f63e7252e195, 6b88e6bbfb35fac666ea14994572db1f4162c18b, a1894bea392fa4b255d9a0016f457ab7f0f0a2a5, bf71d49b4fdd0cf36032255171bd6af29edd5fc8.
- No build, unit test, emulator, Flutter analysis, deployment, production Firebase mutation, billing activation, or merge was performed.


## Follow-up: policy snapshots, owner room controls and audit atomicity (2026-11-18)

- Call creation now reads the current economy pricing policy inside the same Firestore transaction that reserves participants and creates the call. It stores an immutable per-session tariff/policy-version snapshot for direct calls; group-room calls explicitly mark bilateral allocation as not applicable. The snapshot explicitly records collection disabled. This is not a per-minute billing implementation and does not debit wallets.
- Added an integration assertion that a call created without an owner-configured tariff records an unset tariff and `collectionEnabled=false`.
- Added an owner-only room-rental catalog read that returns active and inactive plans, so the owner can re-enable or remove plans without relying on the member-facing active-only list. The owner screen now uses this endpoint, sends the expected version, supports arbitrary positive whole-day durations up to the technical ceiling, and can save an empty catalog to disable rentals.
- Room rental pricing updates now reject stale expected versions. Integration test source covers stale writes, owner visibility of inactive plans, and disabling all plans.
- Attendance reward policy writes now create an immutable before/after owner audit row in the same Firestore transaction as the policy version update; the existing hash-chain review event remains an additional audit layer.
- Removed the obsolete hard-coded active room-rental plan presets from the runtime module. No room-rental commercial value is used when owner policy is absent.
- Commits: d20515b0a78780cdcef4ad713eff70fc104ad1a0, d0240b7359036131ea468d3707544e6d9be7529a, 3ee54c0fc2d785ea58411c8f504871c6ffc20e44, 791eaf26021ba2030a2081bf718bcaad4e980915, 93df014e4e85afe143f64988966e2ce643d5a77b, c8ba0f4ac1b2fb2da47feb1dc1da614643a89079, f90947c90189db2ba4833fe5252023afd22591af, 36ddfcbd48fc8ae6eeeef56f509a6dd2272ff0e2, 9d08d399bcc427072927061262c382acfc9c2a53.
- All test source remains unexecuted pending the complete final test environment. No production billing, payment provider, Firebase deployment, or merge was performed.


## Featured-ad reward policy owner controls (2026-11-18)

- Added an owner/MFA-protected `setOwnerFeaturedAdRewardPolicy` callable with server validation, expected-version concurrency guard, and a before/after immutable audit row in the same Firestore transaction as the policy update. The existing hash-chain audit append remains additional evidence.
- Added owner-console controls for reward enablement, per-view amount, daily view and coin caps, rolling campaign cap/window, video completion threshold, and continuous image visibility threshold. Defaults remain disabled and zero-valued; this does not bypass the trusted-view-evidence gate, so reward payout remains blocked until that server attestation exists.
- Added a dedicated emulator integration test source for owner authorization, update/readback, version conflict, and invalid reward-cap rejection; registered it in the full Functions test script. Not executed yet.
- Commits: 021aac8d548a1816163678767fcf95adf37d6c9e, 91ba40c07638b2945ae7beeb5cc0daa8fdfaa375, 44d5cdccdbd7f8d580ecd6fd31db13c384dd2676, ed58e9197bcf3346dfa113b3f9faf8e37fc4d28b.


## Store catalog concurrency and complete featured-reward administration (2026-11-18)

- Store catalog writes now require the current item version, reject stale edits, increment the item version, and atomically persist before/after commercial values in the owner audit row. The owner catalog read exposes the version; the Super Admin UI/service sends the expected version.
- Added a dedicated store-catalog emulator integration test for create/readback, stale-update rejection, and atomic audit evidence; registered it in `test:all`.
- Added owner-managed featured-ad reward policy writes (MFA, server validation, expected-version guard, versioned policy, before/after audit row, and hash-chain audit append). The owner advertising/rewards screen exposes the full reward amount, quota, campaign-window, and evidence-threshold controls. Reward issuance remains blocked unless trusted server-side viewing evidence is available.
- Added and registered the featured-ad reward policy emulator integration test. Neither new integration suite nor any other test was run in this pass.
- Commits: 021aac8d548a1816163678767fcf95adf37d6c9e, 91ba40c07638b2945ae7beeb5cc0daa8fdfaa375, 44d5cdccdbd7f8d580ecd6fd31db13c384dd2676, ed58e9197bcf3346dfa113b3f9faf8e37fc4d28b, 69c13f87690392e1535f0736f48e5da865f5697d, 784515b5373836158a3ab458d8f37c2b3b95b45b, cdd2bfbeaf0265086974a22cbd758a552cc4166e, b75f0c83f2b5bbfa8e4e25bf758c8717f525146a, 1c39e26729ab83b2676e190a907a058cae6d8e47, 678f6322150d23f4288dbf9d191149378152f8a0.


## Email verification reward moved under owner economic policy (2026-11-18)

- Removed the fixed 500-coin email verification grant from registration and renewal. New member creation now grants zero by default unless the owner explicitly enables an email reward and sets its amount in the versioned economy pricing policy.
- Email verification cycle length is owner-configurable (1–3650 whole days; default 90 days is a security-cycle fixture, not a paid reward entitlement). Each cycle stores an immutable snapshot of the enabled state, reward amount and cycle duration. Later owner edits affect future cycles only.
- Renewal completion credits only the amount captured in that cycle's snapshot; disabled snapshots verify the email without a wallet credit or credit ledger row. Verification/audit history records zero-reward completions as well.
- Added owner controls in the economy pricing screen and unit/emulator regression source for configurable duration, configured reward and disabled/no-credit behavior. Existing email-renewal integration tests now temporarily configure a test policy and restore prior emulator settings. Tests remain unexecuted.
- Commits: 94ffb0f6d3a18cf8e9f5ce6940dfd18ac1849973, 5a4e4fd47891990b7948e8d209173c6709e6d0cc, 44b429c2c806e71e6df0a5abe030bb8d8a5fddc8, 088a92c76b0d0a0fc2008fa7bc575f811418f94b, bde26a27cecddf7fab6539b59243e83aa1225c10, d8436a4da03345f1f1b8f7ec46449aa8176bf759, a715e98ba6d72e424a5ede26c2794a7a53344741, 2687bc5a59b39b141ec1c81b829dae499bc60e3b, 33d6fa3ffd9e858b2c482ae4539970da5c155454, 4d4d296200894053b10fd63b3b8cbe39e24a6359, b02500b0f2e638fde04a14c3b92ed1b217904310, 1071bb654161e5253a10a8722d885cb3f84c74a9, 3a154ae3348210cd447e78aedef114492234a0ff, 9843943e35f22e9fc99ab91b4b16e24698dd135c.


## Coin transfer commission policy concurrency (2026-11-18)

- Owner coin-transfer commission edits now require the current policy version and reject stale updates. The transfer settings transaction increments the version and writes before/after commission and enablement audit data atomically; the Super Admin screen loads and sends the expected version.
- Added emulator integration coverage for readback, version increment, stale-write rejection and audit row persistence. Not executed.
- Commits: da5719c65ea10c832e0f08e2b365964395c4577a, 89db6168459ba5a5eaac9a8f5043417fb75f6377, b706a44a9f24358716ecaa3ce8188947d769345b, e2c0a887a4ee2b0e65464395c8a1226320ff9aa9.


## Wallet ledger reconciliation added (2026-11-18)

- Added a pure read-only reconciliation engine that checks signed ledger amounts, before/after arithmetic, continuity between consecutive snapshots, and the current wallet balance. Legacy rows without balance snapshots are explicitly reported as incomplete; malformed arithmetic/continuity is reported as corrupt; no balance is auto-corrected.
- Added owner/MFA-only `reconcileMemberWallet` callable, a Super Admin action for the selected member, and a result panel. It reads up to 10,000 entries, reports truncation/missing timestamps as incomplete, records the reconciliation audit event, and never mutates wallet balance or ledger entries.
- Added unit and emulator test source for consistent, incomplete, corrupt and read-only outcomes. Tests remain unexecuted. Full historical reconciliation across wallets and any >10,000-entry histories remains a final validation/recovery task; the callable does not claim full platform-wide reconciliation.
- Commits: ee0b94791a2868a68995c9fe6ad22e19e08f3dba, baf59e9bd1a5146123bb1d85cf1be7fe7f31f24d, 1e6cb3e51650d6497b7b9b5d9547dd2bd7d8af47, 5c45d52a740339b6b382b65cf07abb419e091a2d, 10e993a1bb9e057871744d7a78dfa25082bacae1, 103e3b6f832cc75bb0faf2f86045423da42c892d, 020cd936a5fde108963bc05802c11e104d701cd4.
