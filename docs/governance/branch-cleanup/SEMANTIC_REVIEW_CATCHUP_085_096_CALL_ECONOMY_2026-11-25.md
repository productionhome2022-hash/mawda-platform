# Catch-up semantic review — candidates 85–96 — room-call security and group-call economy
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 85–96. This skipped range is now explicitly reviewed.

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 3a459cf3847b3335ba58a35ca78a28ce3ae05df9 | Update economic closeout register with room-call security progress | Current ECONOMIC_PHASE_REMAINING_WORK_REGISTER and economic audit contain the rented-private room gate, implemented checks and still-open billing blockers. | Already documented, later updated |
| 91c5e16e009c1d99b63046b73760d0770ff53648 | Record rented-private room-call security gate and remaining gaps | Current economic audit records private/rented room validation and transaction revalidation while retaining the unfinished entitlement/consent/metering/settlement work. | Already documented |
| 860d3b4a5e537ef25fc1f97c470d67f76422cd01 | Reject room calls outside active rented private rooms | Current startCall imports isActiveRentedPrivateRoom and revalidates room/rental state within the Firestore transaction. | Already implemented |
| 2381f4df090e6163b31cca49c01e7470057b4904 | Test fail-closed rented-private room-call eligibility | Current room-call-policy.test.js covers active matching rentals and rejects public, non-rented, inactive, mismatched, expired and malformed cases. | Already implemented, expanded |
| d615d32cd6b0ac31d2081182b66c3eb648621282 | Add fail-closed rented-private room eligibility helper | Current room-call-policy.ts exports isActiveRentedPrivateRoom and is used by startCall. | Already implemented |
| 000029b59f84d9898f9366381f987b1c9e725aed | Document prioritized economic closeout register | Current economic remaining-work register contains the P0/P1/P2 call-economy and store closeout tasks and acceptance criteria. | Already documented |
| 11d1488ca5f9dcb056153345eb7227441936f2bd | Document owner-approved integer group-call remainder policy | Current economic audit records whole-coin floor shares and the initiator-paid remainder, with 7/9-member examples. | Already documented |
| 4a12dbdf3b21c41f2957246557c3f852b722a9c3 | Record integer remainder rule in approved decisions | Current approved-decision traceability contains the owner clarification and examples. | Already documented |
| 10dedd9b1e088412e24f2777309ab16a36f8fb7a | Test initiator-paid group-call rounding remainder | Current group-call-economy.test.js asserts initiator absorbs the full remainder for 7/9 participants and exact equal shares for 4. | Already implemented |
| d327e382be456de92abd79bb5fcb3326fdfad89a | Charge group-call fractional remainder to initiator | Current group-call-economy.ts uses integer floor shares for non-initiators and assigns the exact remainder to the initiator. | Already implemented |
| 0b41b5ef1763030869a7b24703b684b2c3aae73d | Test exact deterministic group-call allocation | Current tests cover integer exact-sum allocation; historical hash-distributed remainder assertions were superseded by owner-approved initiator remainder. | Superseded by approved policy |
| ca5aa45c243eaebb8fa872cb0de23311af2ca94f | Add exact integer group-call allocation | Current helper uses the later initiator-remainder rule rather than hash-ranked distribution. | Superseded by approved policy |

## Result
- Reviewed: 12/1,665 unique candidates in this catch-up range.
- Already implemented/documented or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed: 0. Source/test-definition inspection only.
- No CI success is claimed.

## Important distinction
The rented-private room-call gate and integer coin-share calculation exist. This does not mean call billing is complete: participant-specific entitlement and financial consent, trusted connected-interval metering, atomic/idempotent settlement, and emulator verification remain explicit blockers. No call billing or pricing was enabled or changed.