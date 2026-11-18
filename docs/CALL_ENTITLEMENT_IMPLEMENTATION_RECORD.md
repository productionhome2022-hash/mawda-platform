# Call entitlement implementation record

Branch: `codex/featured-ads-secure-lifecycle-20261118`

## Implemented on the development branch

- Added a server-side entitlement policy for audio and video calls.
- Recognized owner-configured entitlement periods: 24 hours, 7 days and 30 days.
- `startCall` reads entitlement records inside the same Firestore transaction that reserves participants and creates the call.
- Every participant in a direct or room call must hold an active entitlement matching the requested call mode. An audio entitlement cannot authorize video and vice versa.
- Expired, revoked, malformed, missing-expiry and mismatched entitlement records fail closed.
- Added voice/video plans to the store fulfillment map so the Owner can grant free entitlements through the existing audited single/bulk grant flow.
- Paid call-plan purchase remains explicitly blocked in `store-catalog.ts` until the complete cancellation/refund and paid lifecycle is implemented and accepted. The Owner can grant free entitlements; the catalog cannot be switched into paid purchase for these call items yet.
- Preserved the existing five-minute per-call server ceiling. No new session duration, price, charge rate or refund policy was invented.

## Verification

GitHub Actions run [44219823324](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44219823324) passed for SHA `824585a43866cfcecf6014570f326508d39e5354`:
- TypeScript compilation and backend unit tests, including call-entitlement and store-catalog tests.
- Auth/Firestore/Storage media lifecycle emulator tests.
- Chat retention, room reservation/cancellation, owner entitlement grant/replay, voice/video call lifecycle, and timed-ad reward ledger emulator tests.
- Private scanner security and sticker media processor tests.
- Flutter analysis and widget/unit tests.

The call lifecycle emulator suite verifies missing entitlement denial, mode-specific access, direct and room calls, signaling, connection-state timer, concurrent-call locks, rolling attempt limits and termination.

## Remaining release blockers

1. Paid call-plan purchase is blocked until cancellation/refund and the full paid entitlement lifecycle are implemented and tested.
2. Real TURN credentials/relay connectivity and physical-device WebRTC acceptance are not established by the emulator tests. The current CI call test confirms the STUN fallback and server signaling, not real-world media relay quality.
3. The five-minute session ceiling is a technical guardrail, not an owner-configurable commercial duration. A change requires an explicit owner-approved duration policy.
4. Call interruption, network handoff, background/foreground transitions, reconnect UX, and device interoperability need real Android/Web/iOS acceptance.
5. The separate 5,000-persona simulation has not been run against this SHA.

No production deployment, Firebase production mutation, billing activation, `main` merge, or real payment operation was performed.
