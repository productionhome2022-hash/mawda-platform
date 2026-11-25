# Semantic review batch 007 — room-call security and integer allocation candidates 85–96
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform source snapshot inspected: 0c044e465bcbd0b76581596603c7cf7fe78f3458
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 84–95 (candidate numbers 85–96).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence | Result |
|---:|---|---|---|---|
| 85 | 3a459cf3847b3335ba58a35ca78a28ce3ae05df9 | Update economic closeout register with room-call security progress | Current ECONOMIC_PHASE_REMAINING_WORK_REGISTER contains room-call security implementation progress and explicitly retains CALL-ECO-01/02/03 as incomplete | Present in current register |
| 86 | 91c5e16e009c1d99b63046b73760d0770ff53648 | Record rented-private room-call security gate and remaining gaps | Current economic complete audit records the active rented-private gate, four-person video limit, and remaining entitlement/consent/metering/settlement gaps | Present |
| 87 | 860d3b4a5e537ef25fc1f97c470d67f76422cd01 | Reject room calls outside active rented private rooms | Current index.ts imports isActiveRentedPrivateRoom and revalidates room/rental state inside the call-creation transaction; current room-call-policy contains the validator | Present |
| 88 | 2381f4df090e6163b31cca49c01e7470057b4904 | Test fail-closed rented-private room eligibility | Current room-call-policy.test.js covers active matching rental, public/non-rented/inactive rooms, mismatches, expiry and malformed timestamps | Present and expanded |
| 89 | d615d32cd6b0ac31d2081182b66c3eb648621282 | Add fail-closed eligibility guard for rented-private room calls | Current room-call-policy.ts exports isActiveRentedPrivateRoom and validates room/rental identity, owner, status and expiries | Present and expanded |
| 90 | 000029b59f84d9898f9366381f987b1c9e725aed | Document prioritized economic phase closeout register | Current economic remaining-work register exists and records P0 call entitlement, consent, metering, settlement and room-call requirements as open | Present |
| 91 | 11d1488ca5f9dcb056153345eb7227441936f2bd | Document owner-approved integer group-call remainder policy | Current economic complete audit records integer-only balances, floor shares for non-initiators and the full remainder charged to initiator | Present |
| 92 | 4a12dbdf3b21c41f2957246557c3f852b722a9c3 | Record owner-approved integer group-call remainder policy in traceability | Current approved decisions and traceability contains the owner-approved integer allocation examples and requirement | Present |
| 93 | 10dedd9b1e088412e24f2777309ab16a36f8fb7a | Test initiator-paid group-call rounding remainder | Current group-call economy tests assert initiator absorbs all remainder for seven and nine participants and exact totals for four-person audio/video | Present and evolved |
| 94 | d327e382be456de92abd79bb5fcb3326fdfad89a | Charge group-call fractional remainder to initiator | Current group-call economy helper uses floor share for non-initiators and assigns the exact remainder to initiator; current signature requires initiatorUid | Present; later policy-conforming implementation |
| 95 | 0b41b5ef1763030869a7b24703b684b2c3aae73d | Test deterministic group-call allocation | Current tests cover integer allocation, deterministic ordering, invalid totals/participants and initiator remainder; older hash-ranked allocation behavior is superseded by owner-approved initiator remainder | Present; historical algorithm superseded |
| 96 | ca5aa45c243eaebb8fa872cb0de23311af2ca94f | Add exact integer allocation for group-call splits | Initial hash-ranked remainder allocation was replaced by the owner-approved initiator remainder rule in current group-call-economy.ts; current helper preserves exact total and integer balances | Superseded by later owner-approved allocation |

## Cross-layer status
Current room-call signaling has an active rented-private room gate and capacity helper: audio follows configured room capacity, video is capped at four total participants. This does not mean group-call economy is complete. The current economic work register explicitly keeps per-participant entitlement, explicit financial consent, connected-interval metering, atomic wallet settlement and ledger integration open; no call billing is enabled by this review.

## Result
- Reviewed: 12 unique candidates (85–96).
- Present/evolved: 11.
- Superseded by later owner-approved allocation rule: 1.
- Confirmed unique missing changes: 0.
- Code transferred in this batch: 0.
- Tests executed during this review: 0. Test files and source were inspected only; no runtime success is claimed.
- No production, Firebase, billing or main-branch operation was performed.