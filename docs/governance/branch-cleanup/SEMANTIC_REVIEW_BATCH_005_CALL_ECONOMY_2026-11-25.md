# Semantic review batch 005 — call economy and rented-room policy
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 73–84 (12 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 3a459cf3847b3335ba58a35ca78a28ce3ae05df9 | Record rented-private room-call security progress and remaining gaps | Current docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md records the room-call gate implementation and explicitly preserves remaining economy gaps. | Already documented; superseded by current audit |
| 91c5e16e009c1d99b63046b73760d0770ff53648 | Document rented-private room-call security gate | Current audit documents private/rented room validation, matching active rental record and transactional revalidation; current source/test files implement it. | Already implemented/documented |
| 860d3b4a5e537ef25fc1f97c470d67f76422cd01 | Reject room calls outside active rented private rooms | Current functions/src/room-call-policy.ts and functions/src/index.ts enforce the rented-private gate and transactionally re-read room/rental state. | Already implemented, later expanded |
| 2381f4df090e6163b31cca49c01e7470057b4904 | Test fail-closed rented private room eligibility | Current functions/test/room-call-policy.test.js covers active matching rental and rejects public/non-rented/inactive/mismatched/expired/malformed records. | Already implemented, expanded |
| d615d32cd6b0ac31d2081182b66c3eb648621282 | Add rented-private room eligibility helper | Current room-call-policy.ts exports isActiveRentedPrivateRoom and additional participant eligibility/capacity policies. | Already implemented, expanded |
| 000029b59f84d9898f9366381f987b1c9e725aed | Create prioritized economic closeout register | Current docs/ECONOMIC_PHASE_REMAINING_WORK_REGISTER_2026-11-18.md contains the P0 call-economy work register and later owner clarifications. | Already documented |
| 11d1488ca5f9dcb056153345eb7227441936f2bd | Document integer group-call remainder policy | Current docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md and docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md record integer whole-coin shares and initiator-paid remainder. | Already documented |
| 4a12dbdf3b21c41f2957246557c3f852b722a9c3 | Add integer remainder rule to approved decisions | Current approved decisions and traceability document contains the owner clarification and examples; current implementation matches the initiator-remainder rule. | Already documented |
| 10dedd9b1e088412e24f2777309ab16a36f8fb7a | Test initiator-paid group-call rounding remainder | Current group-call economy tests assert initiator absorbs complete remainder for seven/nine participant arithmetic and approved four-person video maximum. | Already implemented, expanded |
| d327e382be456de92abd79bb5fcb3326fdfad89a | Charge group-call fractional remainder to initiator | Current group-call economy helper assigns the full integer remainder to initiator and has additional validated policy/allocation helpers. | Already implemented, expanded |
| 0b41b5ef1763030869a7b24703b684b2c3aae73d | Test deterministic group-call allocation | Current group-call tests cover deterministic integer allocation and initiator remainder; older distributed-remainder assertions have been superseded by owner-approved policy. | Already implemented, superseded by approved policy |
| ca5aa45c243eaebb8fa872cb0de23311af2ca94f | Add exact integer group-call allocation | Current group-call economy implementation is the later initiator-remainder version; the older hash-ranked allocation is superseded. | Already implemented, superseded by approved policy |

## Result
- Reviewed in this batch: 12/1,665 unique candidates.
- Already implemented, documented, or superseded: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0. Source inspection only.
- No CI or workflow success is claimed.

## Important scope distinction
The current call economy is not complete merely because the room-call security gate and coin-share calculation exist. The current register/audit still identify participant request/approval, entitlement and explicit financial consent, trusted per-participant connection intervals, atomic/idempotent wallet settlement and emulator verification as open blockers. No call billing was enabled or altered.

## Safety decision
No historical code needs porting. The current implementation is newer and more restrictive than these candidates. Continue with the next unique SHA range.