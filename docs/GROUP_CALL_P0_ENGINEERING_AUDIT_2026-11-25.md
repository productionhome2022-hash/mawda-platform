# Group-call P0 engineering audit — Full Platform
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Branch: codex/mawda-full-platform-implementation
Audited branch HEAD: 1a7884841a07d04ae543154f4fe72cf3b8317535

## Scope and evidence

Inspected current Full Platform source and tests:
- functions/src/index.ts — current callables, room-call transaction, owner pricing policy and call lifecycle.
- functions/src/group-call-economy.ts — owner policy validation, rates, reservation and pure share/final-settlement calculations.
- functions/src/call-signaling.ts — call state transitions and member reservation helper.
- functions/test/integration/call-signaling.integration.test.js — integration expectations, capacity, entitlement and lock cleanup.
- lib/screens/call_usage_policy_screen.dart — owner group-call pricing controls.
- firestore.indexes.json — room-call discovery index.

## Implemented in Full Platform

1. Room calls are restricted to active private rented rooms and the rental is transactionally revalidated at call creation.
2. Room capacity is checked and revalidated; video is capped at four participants including the creator.
3. Owner-configured group-call pricing is versioned, can independently disable audio/video, and a pricing snapshot is stored with the call.
4. Per-participant call entitlements are checked at call creation and acceptance.
5. Group-call pure economy helpers validate rates, calculate maximum reservations, final billable minutes and deterministic integer shares; the initiator receives the approved remainder.
6. Call-member locks are cleared in batches of 100; the integration test contains a 501-lock cleanup case.
7. Firestore has the room-call discovery index by room and creation time.

## P0 blockers before any group-call debit

1. **Per-member join admission is incomplete.** Current startCall builds the participant list from all room members. The current integration test imports and invokes requestRoomCallJoin and respondToRoomCallJoinRequest, but those callables are not exported from functions/src/index.ts. This is a source/test contract mismatch; no test run is claimed.
2. **Separate financial consent is missing.** Current source has no consentToRoomCallBilling callable and does not bind each participant's explicit consent to the immutable policy ID/version.
3. **Trusted media evidence is missing.** Current markCallConnected is a callable signal, not a verified provider-side media-connected event. Client claims alone cannot authorize billing.
4. **Actual settlement is missing.** functions/src/index.ts does not define processGroupCallBillingSettlement or an equivalent atomic wallet-debit/refund/receipt workflow. Pure calculation helpers do not charge members.
5. **Per-member trusted connected intervals are not established.** Current participant state/connected markers do not provide provider-verified, auditable intervals suitable for billing.
6. **Settlement retry/idempotency is not implemented in the active call lifecycle.** No per-member settlement receipt plus ledger cross-check prevents a second debit after partial failure.
7. **No end-call or timer-expiry settlement trigger exists.** Ending/expiring a call clears locks but does not settle wallet shares.

## Required implementation order

1. Reconcile the missing join-request callables with the already-committed integration tests; add explicit creator approval and per-member state without changing the existing capacity/rental gate.
2. Add separate, version-bound financial consent for creator and each joining participant. No consent means no charge.
3. Integrate a trusted media-provider event source and verify participant identity, room/call identity, timestamps and replay protection. Do not use client `markCallConnected` as billing proof.
4. Track per-member verified connection intervals and freeze an immutable call settlement snapshot.
5. Implement idempotent per-member wallet reservation/debit/refund with ledger and receipt reconciliation, safe batching, insufficient-balance handling and retry.
6. Trigger settlement exactly once from end and shared duration-expiry paths, with no debit for calls that never had verified media.
7. Add Firestore Emulator tests for concurrent approvals, consent mismatch, unverified media, late joiners, duplicate settlement retries, insufficient balances and 500+ participant cleanup.
8. Run Functions build/tests and emulator suites on the resulting exact SHA before considering the billing lifecycle ready.

## Governance and safety

- Existing owner-configured rates remain the only source of call prices; this audit adds no rate or fee.
- Do not enable wallet debit, reserve or settlement until all P0 blockers above are closed and tested.
- Do not change production Firebase, billing, deployment or live member balances as part of this development work.
- The current branch has not been tested by this audit. Source inspection and test-definition inspection are not test execution.

## Conclusion

Full Platform has owner pricing controls, entitlement gates, room/rental/capacity controls and pure share calculations. It does **not** yet have a complete, trusted, consent-based, idempotent group-call billing lifecycle. The missing join-call exports in the current source/test pair also require immediate reconciliation.