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

## Integrated Full Platform follow-up — 2026-11-27

Reviewed and updated against development-branch source at `b0f7c4af1ad739295e3778925c68134a0c7977bb`.

### Implemented since the original audit
- The room-call join-request lifecycle is now present in `functions/src/index.ts`: `requestRoomCallJoin`, `respondToRoomCallJoinRequest`, `getRoomCallJoinRequestStatus`, and `consentToRoomCallBilling`. The member client invokes the request/status/decision flow from `lib/screens/mawdda_call_screen.dart`.
- Financial consent is stored against the immutable call pricing policy ID and version. When an owner-configured test policy is active, creator and requester consent are independently required before approval.
- Late-join approval now re-reads the creator's and requester's active audio/video entitlements inside the same Firestore transaction. If either entitlement is absent or expired, the participant list and member lock are not changed.
- Added an emulator regression that proves approval fails before entitlements are granted, leaves the requester unlocked, and succeeds after both participants have valid entitlements.
- The existing room/rental gate and room-capacity checks remain in place; video remains capped at four participants including the creator. No production price or collection setting was enabled.

### Validation evidence
- Commit containing the entitlement fix: `67dcc35c01ceeb3c5092920ac4b975cf5ac11345`.
- Accumulated source/test head: `b0f7c4af1ad739295e3778925c68134a0c7977bb`.
- GitHub Actions `Economic phase verification` run `45961078664`: **success**, including call-signaling emulator tests.
- GitHub Actions `Mawdda economy regression` run `45961078669`: **success**, including wallet, entitlement, featured-ad and store regressions.
- At documentation time, `Validate Mawda` run `45961078701` had its Functions compile/unit and server evidence/authorization/biometric integration jobs successful; its Flutter job was still running. `Mawdda Test Center` run `45961078680` had its Flutter analysis/tests/web build job successful; its complete backend emulator journey was still running.

### Remaining P0 blockers — not marked complete
1. `startCall` still derives the initial room-call participant set from room membership; explicit per-invitee initial selection is not yet established as the sole admission path.
2. `markCallConnected` remains client-reported telemetry, not provider-verified media evidence. It cannot authorize billing.
3. Provider-verified per-participant connected intervals and replay-protected media events are not integrated.
4. Atomic call wallet reservation/debit/refund, per-member settlement receipts, ledger reconciliation, and exactly-once end/expiry settlement are not implemented.
5. The actual group media transport remains incomplete: the current signaling/ICE path is not an SFU. `mawdda-media-plane.ts` validates a future Mawdda-owned SFU/TURN contract but is not backed by a configured deployment and fresh health evidence. No paid infrastructure was provisioned.
6. Group-call collection remains disabled/test-only. No live member balances, production Firebase resources, billing, or deployment were changed.

This follow-up supersedes only the earlier statements that the join-request and financial-consent callables were absent. It does not certify the group-call feature as complete or billable.
