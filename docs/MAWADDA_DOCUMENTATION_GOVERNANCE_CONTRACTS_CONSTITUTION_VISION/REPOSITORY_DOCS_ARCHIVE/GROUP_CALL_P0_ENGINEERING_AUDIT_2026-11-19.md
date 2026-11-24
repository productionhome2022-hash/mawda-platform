# Group-call P0 engineering audit — 2026-11-19

## Scope and safety

This audit applies only to development branch `codex/economic-phase-completion-2026-11-18`. It does not authorize merge to `main`, deployment, production Firebase changes, paid infrastructure, billing activation, or any production data mutation.

## CI evidence

Previously completed successfully on SHA `04dc9a7c1c2e6acbf3cdf7dfb2c0f20a847d1435`:
- Flutter CI run 44401094206: Analyze, Flutter tests, and Web Release build passed.
- Economic verification run 44401094263: Functions build, 352 unit tests, and 12 Firestore Emulator integration tests passed.

New fail-closed settlement guard and regression tests were committed on SHA `c09a108056604e8c5bd4c85fa0e12ebf78cabd2b`. At audit time, its Economic verification run 44402028158 and Flutter CI run 44402028194 were still in progress. Do not treat the earlier SHA's green CI as validation of this newer commit.

## Implemented in this branch

- Group room calls start with the creator only; joiners request entry and the creator approves/rejects.
- Video admission is transactionally limited to four total participants; audio admission follows rented-room capacity.
- Owner-controlled pricing policy is versioned and snapshotted into the call session; no default commercial price is introduced.
- Financial consent is recorded independently from join approval and is checked before creator approval.
- Group-call shared duration constants are 5 minutes for audio and 3 minutes for video; late joiners do not reset the shared deadline.
- Equal-share integer allocation is deterministic by UID and independent of join time.
- Per-member wallet debit, ledger entry, and settlement receipt are idempotent and committed in one Firestore transaction.
- Insufficient balance does not create a negative wallet balance; that member's settlement remains unresolved.
- Settlement now fails closed if a connected participant lacks a matching financial consent or trusted provider-side media evidence. Client-reported WebRTC state alone cannot authorize a coin debit.
- Regression tests cover equal shares, late joins, retry behavior, concurrent video admission, large-room lock cleanup, missing consent, and unverified media.

## Blocking gaps — do not close Issue #23

1. **Trusted media evidence is not integrated.** `markCallConnected` records a client-reported WebRTC connection state. It is not proof that media actually flowed. The new settlement guard therefore blocks all group-call charges unless a trusted provider-side verification timestamp exists. No SFU/provider webhook or trusted media event verifier is currently implemented.
2. **Media topology is incomplete.** The current Flutter negotiation establishes creator-to-member peer connections. Joiners do not establish peer connections to every other accepted participant, so the requirement that every participant see/hear every other participant is not met.
3. **Audio scale cannot be guaranteed with the current peer-to-peer design.** The product requirement allows audio participant count to follow room capacity without an artificial fixed cap. Full mesh scales quadratically and is not a safe implementation for large room capacity. An SFU architecture and its provider/security/cost review are required. No paid resource may be activated without owner approval.
4. **Call entitlement checks are not proven end-to-end.** The monetized voice/video entitlement catalog rows are not yet implemented as an enforced, server-authoritative entitlement gate for every participant, including the creator. The existing room rental/member checks do not replace call-product entitlement checks.
5. **Participant-specific media lifecycle is incomplete.** There is no trusted server-side record of each participant's media start, stop, reconnect, and billable intervals. A single `mediaConnectedAt` timestamp cannot prove continuous or actual media participation.
6. **Insufficient-balance semantics need a safe complete design.** Current settlement is atomic per member, not a single all-participant reservation/settlement. One member can remain pending while others have settled. Reservation/hold semantics and wallet available-balance integration are not yet implemented or owner-approved.
7. **Video UI acceptance is incomplete.** Current rendering is a generic remote-renderer grid with local picture-in-picture. It does not yet prove the required 2/3/4 participant layouts or multi-party media delivery.
8. **Owner pricing UI and end-to-end acceptance need verification.** Backend versioned pricing exists, but the Super Owner owner workflow must be reviewed for editing, activation, audit history, MFA, and the full member consent/price display path.
9. **No 5,000-persona group-call load run has been completed.** Unit/emulator tests and CI are not a substitute for the separate simulation lab or real-device acceptance.

## Required next engineering sequence

1. Complete CI on the current SHA and fix any failures before further edits.
2. Review and implement server-authoritative call entitlement validation for creator and each requester/approved participant, using the canonical store entitlement schema.
3. Choose and document a secure media topology that meets audio room capacity and video four-person requirements. Do not create or activate paid provider resources.
4. Implement provider-authenticated media event verification and per-participant media lifecycle. Keep billing fail-closed until this exists.
5. Design reservation/insufficient-funds handling against the existing wallet architecture; do not invent owner financial policy.
6. Complete participant-to-participant negotiation and the required video layouts, then add Flutter widget/integration tests.
7. Expand emulator race, replay, reconnect, leave/rejoin, expiry, consent revocation/version mismatch, and settlement tests.
8. Run the separate 5,000-persona simulation and device acceptance in their designated later stages.
9. Close Issue #23 only after every acceptance criterion is evidenced on one identified SHA.

## Current decision

**P0 remains BLOCKING.** The code and CI have materially advanced, but group calls are not ready for paid activation or phase transition. Keep PR #31 draft and Issue #23 open. No production changes.


## Addendum — selective port to the canonical development branch (19 November 2026)

The pure, owner-configured policy and deterministic settlement calculation modules `functions/src/call-usage-policy.ts` and `functions/src/group-call-economy.ts`, together with their unit tests, were selectively ported to `codex/mawda-full-platform-implementation`. They are not wired to a callable, wallet debit, reservation, or production billing path.

The P0 blockers above remain in force. No group-call charge may be activated until trusted provider-side media evidence, participant-specific lifecycle accounting, per-participant entitlement validation, secure SFU topology, atomic reservation/settlement semantics, complete UI acceptance, and the separate load/device acceptance gates are implemented and tested. All rates remain owner-configured; no commercial rate was introduced by this port.
