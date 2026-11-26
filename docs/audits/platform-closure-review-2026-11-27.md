# Mawdda Platform closure review — 2026-11-27

Repository: `productionhome2022-hash/mawda-platform`
Branch: `codex/mawda-full-platform-implementation`
Audited HEAD: `dc335e3386fc2241cc16a4c36eeea55f4c6ed6d4`
Scope: six owner-requested closure tracks. Read-only source, test, workflow and historical-artifact inspection; no production access or writes.

## Executive status

This review does not certify the six tracks as complete. The latest internal GitHub Test Center run passed, but source and test inspection confirms that several features are intentionally disabled or lack end-to-end coverage.

| Track | Current evidence | Closure status |
|---|---|---|
| Capacity/usage meter and owner dashboard | Owner dashboard reads `platformCapacityMeters`; meter defaults say `activeMemberBasis: not_connected`; integration tests assert unconnected dimensions remain null and enforcement stays observe-only. | Open — event instrumentation and actual active-member measurement are absent/unproven. |
| Sticker lifecycle | Member catalog callable returns an empty disabled catalog; the integration test explicitly asserts publication, catalog and send remain disabled. | Open — do not enable until upload/scanner/publication/asset delivery/send/render/retention path is complete and tested. |
| Group-call billing | Versioned owner pricing, per-member version-bound consent and join approval code exist. Billing is explicitly reported disabled/test-only. `calculateGroupCallFinalSettlement` is imported but is not called in `index.ts`; no connected atomic debit/receipt/ledger settlement path was found in the active call lifecycle. | Open P0 — consent is not settlement; keep collection disabled. |
| Featured ads and rewards | Separate featured campaign, finance, viewing-session and reward callables exist; financial events and reward claims use deterministic identities and Firestore transactions. Existing integration coverage tests finance/policy, not the complete member viewing-to-credit lifecycle. Timed ads are a separate product and must not be treated as proof of featured-ad completion. | Partial — add end-to-end emulator coverage and reconcile counters/ledger/replay invariants before closure. |
| Documentation | Historical records contain stale status statements. The 2026-11-25 group-call audit predates current consent/join code; the 2026-11-18 featured-ad record predates the newer lifecycle callables; the sticker record is policy/scope evidence, not proof of a complete current implementation. | Open — this review is the current evidence snapshot; historical documents remain preserved and should be cross-linked, not silently rewritten. |
| 5,000-persona failure | Run `45885668322` failed only in the lifecycle stage after build, provisioning and 500/1,000/2,500/5,000 transfer/message scenarios succeeded. | Root cause identified as harness/API contract mismatch; no rerun performed. Not an acceptance test. |

## Internal GitHub verification already available

On exact platform HEAD `dc335e3386fc2241cc16a4c36eeea55f4c6ed6d4`:
- Test Center run `45885607608`: completed successfully. Backend/emulator Test Center job and Flutter analysis/tests/web build job both passed.
- Economic phase verification run `45885607684`: completed successfully; Functions build/unit tests and call-signaling emulator job passed.
- The capacity integration test in the Test Center log passed while asserting observe-only mode and unknown values for unconnected measurement dimensions. This is a successful test of the current guardrail, not proof that metering is connected.
- Sticker lifecycle gate test asserts the member catalog is disabled and upload/publication/asset/send operations fail closed. This is a successful safety-gate test, not proof of a complete sticker feature.
- Group-call integration test covers owner pricing configuration and explicitly asserts `billingEnabled === false`; it does not test wallet settlement.

These CI results are historical evidence for the exact SHA above. They do not certify subsequent commits or production behavior.

## Detailed findings and required closure

### 1. Capacity meter and owner dashboard
Source: `functions/src/capacity-media-management.ts`, `functions/src/index.ts`, `functions/test/integration/capacity-media-management.integration.test.js`.

- Dashboard reads monthly upload bytes, finalized upload count, active members, downloads, retained storage and processing minutes.
- The policy projection hardcodes `activeMemberBasis: not_connected` and `enforcementMode: observe_only`.
- The integration test seeds upload counters directly, then asserts active members/downloads/storage/processing remain null.
- No write/increment path for the capacity meter was found in the inspected `index.ts` callables.

Required: instrument server-authoritative upload finalization, download delivery, retained-object inventory and processing jobs; derive concurrent active members from a defined server-side activity/session source; use atomic/batched counter updates and UTC month boundaries; expose unknown as unknown; keep quota enforcement and billing disconnected until separately approved. Add emulator tests that prove counters change from actual callable/service operations, not by manually seeding the meter document.

### 2. Sticker lifecycle
Source: `functions/src/sticker-policy.ts`, `functions/src/sticker-catalog.ts`, `functions/src/index.ts`, `functions/test/integration/sticker-lifecycle-gates.integration.test.js`.

- Media/manifest validation and safe catalog projection exist.
- `getStickerCatalog` currently returns `packs: []`, `enabled: false`, `publicationEnabled: false`, `sendEnabled: false`.
- Existing integration test explicitly expects the disabled state and rejection of publication, asset URL retrieval and sending.
- Exported callable names alone do not establish that the end-to-end lifecycle is operational.

Required: complete owner upload intent and finalization through quarantine/scanner result binding; persist approved manifest and immutable publication version; issue short-lived authorized asset URLs; send direct/room sticker messages with membership, retention and replay checks; render on clients; verify cleanup and retention. Add Auth/Firestore/Storage emulator tests for every transition and denial path. Keep the gate closed until those tests pass.

### 3. Group-call consent and settlement
Source: `functions/src/group-call-economy.ts`, `functions/src/index.ts`, `functions/test/integration/call-economy-gifts.integration.test.js`, historical `docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-25.md`.

- Current source includes consent records bound to policy ID/version and checks creator/requester consent before approving a join request when pricing is active.
- Owner pricing APIs and tests remain test-only; the test asserts billing stays disabled.
- Pure final-settlement calculation is not invoked by the active call lifecycle in `index.ts`.
- No active atomic per-member reservation/debit/refund/receipt/ledger settlement workflow or end/expiry settlement trigger was verified.

Required: freeze trusted media-connected intervals; require explicit consent for each billed participant against the immutable price snapshot; reserve funds safely; settle/refund each participant atomically with deterministic receipt and ledger IDs; make retries reconcile prior outcomes without a second debit; trigger settlement once on end/expiry; handle insufficient balances and partial membership changes. Add emulator tests for concurrent end calls, duplicate settlement, stale consent, unverified media, late joiners, refund and ledger mismatch. Keep billing disabled until complete.

### 4. Featured advertising, rewards and duplicate collection
Source: `functions/src/featured-advertising.ts`, `functions/src/featured-ad-rewards.ts`, `functions/src/featured-ad-finance.ts`, `functions/src/index.ts`, integration tests under `functions/test/integration/`.

- Featured campaign governance/finance and viewing-session/reward callables are present in the current source.
- Financial event identity and reward ledger identity are deterministic; reward completion is transaction-based.
- Existing emulator tests cover financial-event and reward-policy configuration, but the inspected integration inventory has no complete featured-ad viewing/session/heartbeat/completion/ledger test.
- Timed-ad campaign and attendance rewards are separate workflows and must retain separate policy and idempotency domains.

Required: add emulator integration coverage for campaign-version changes, unpaid/refunded/withdrawn campaigns, concurrent session starts, heartbeat replay/order/gap/background handling, simultaneous completion, budget exhaustion, daily/campaign caps, ledger replay, wallet mismatch and reconciliation. Verify counters and claim records are committed atomically with wallet credit. Preserve owner-configured values; do not invent prices or caps.

### 5. Documentation reconciliation
- Preserve historical audits as historical records.
- Mark stale status sections as superseded by a dated current audit rather than rewriting past evidence.
- Link each implementation claim to source paths, test paths, exact SHA and workflow run.
- Distinguish: implemented in source, covered by tests, passed in CI, and accepted for production. These are four different states.

### 6. 5,000-persona run failure — exact evidence
Lab repository: `productionhome2022-hash/mawdda-5000-simulation-lab`
Failed run: `45885668322`
Job: `140135635235`
Platform revision checked out by the lab: `dc335e3386fc2241cc16a4c36eeea55f4c6ed6d4`

- Checkout, locked dependency installation and Functions compilation passed.
- The 500, 1,000, 2,500 and 5,000 persona transfer/message tiers passed. At 5,000, the report recorded 2,500 transfers, 2,500 idempotent replays, 5,000 direct messages, 5,000 received messages, zero transfer/message errors and complete coverage for that scenario.
- The subsequent lifecycle stage provisioned premium entitlements for 5,000 personas, then failed on the first store purchase call.
- The harness calls `setStoreCatalogItem` to publish `vip_monthly`, but discards the returned catalog version. It then calls `purchaseStoreItem` with `itemId`, `requestId` and `expectedPriceCoins` only.
- Current `purchaseStoreItem` requires `expectedCatalogVersion` as a positive safe integer and throws `invalid-argument` when absent. The logged error is `بيانات شراء العنصر أو إصدار الكتالوج غير صالحة.`
- The machine-readable report shows `premiumEntitlementsProvisioned: 5000`, while all later lifecycle stages remain zero.

Classification: stale simulation-harness request shape versus the current versioned store-purchase contract. The platform compile and earlier wallet/message scenarios did not fail. The lifecycle did not proceed far enough to validate subsequent stages. Correct the harness by capturing the version returned by `setStoreCatalogItem` and passing that exact version as `expectedCatalogVersion`; do not weaken the platform's version check. No additional 5,000-persona simulation was run or authorized by this review.

## Execution boundaries

- No production Firebase/Firestore/Storage resource was read or changed.
- No deployment, merge to `main`, billing activation, production data mutation, deletion or retention-policy activation occurred.
- No new 5,000-persona simulation or external test was run.
- This review records verified gaps and closure requirements; it does not claim that the code fixes described as required have already been implemented.
