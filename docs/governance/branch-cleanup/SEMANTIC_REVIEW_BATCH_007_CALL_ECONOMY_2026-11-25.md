# Semantic review batch 007 — rented-room security and group-call economy candidates 85–96
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: 8e17c80bdad6df155e6cb03c0b4f5f052ef646ce
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 85–96, continuing sequentially.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence / action | Result |
|---|---|---|---|
| 3a459cf3847b3335ba58a35ca78a28ce3ae05df9 | Update economic closeout register with room-call security progress | Current economic remaining-work register records private rented-room gate, video cap, unimplemented invitee/entitlement/consent/metering/settlement requirements and test status | Present |
| 91c5e16e009c1d99b63046b73760d0770ff53648 | Record room-call rented-private security gate and remaining gaps | Current ECONOMIC_PHASE_COMPLETE_AUDIT includes room-call security gate, transaction recheck, public/non-rented/expired rejection and remaining economy gaps | Present |
| 860d3b4a5e537ef25fc1f97c470d67f76422cd01 | Reject room calls outside active rented private rooms | Current index imports isActiveRentedPrivateRoom, checks room/rental preflight, and re-reads room/rental in the call-creation transaction before writing | Present |
| 2381f4df090e6163b31cca49c01e7470057b4904 | Test fail-closed rented private room call eligibility | Current room-call-policy.test.js covers active matching rental, public/non-rented/inactive rooms, mismatched/missing rental, expiry and malformed timestamps | Present |
| d615d32cd6b0ac31d2081182b66c3eb648621282 | Add fail-closed eligibility guard for rented private room calls | Current room-call-policy.ts validates private/rented/active state, matching owner/room/rental IDs and both expiries | Present |
| 000029b59f84d9898f9366381f987b1c9e725aed | Document prioritized economic phase closeout register | Current ECONOMIC_PHASE_REMAINING_WORK register defines P0 call entitlement/consent, metering/settlement, rented-room calls, acceptance criteria and non-completion state | Present |
| 11d1488ca5f9dcb056153345eb7227441936f2bd | Document owner-approved integer group-call remainder policy | Current ECONOMIC_PHASE_COMPLETE_AUDIT contains the approved whole-integer allocation rule, initiator remainder, 7/9 participant examples and atomic-ledger requirement | Present |
| 4a12dbdf3b21c41f2957246557c3f852b722a9c3 | Record integer group-call remainder policy in decision traceability | The policy was present in the economic audit but missing from the central approved-decisions traceability file. Added CALL-004 with the owner-approved floor-share/initiator-remainder rule, examples, atomic ledger requirement and explicit non-completion caveat in commit 488c3a0aacc82c92fbc8faefcd75a9537735a512 | Restored missing governance record |
| 10dedd9b1e088412e24f2777309ab16a36f8fb7a | Test initiator-paid group-call rounding remainder | Current tests lacked explicit seven/nine participant examples and positive-share failure. Added seven/nine cases; replaced the old zero-value-share expectation with a fail-closed assertion | Restored missing test coverage |
| d327e382be456de92abd79bb5fcb3326fdfad89a | Charge group-call fractional remainder to initiator | Current group-call-economy.ts already gives all remainder to initiator, but lacked the source branch's guard against totalAmount smaller than participant count, which could produce zero-value participant shares. Added GROUP_CALL_TOTAL_BELOW_MINIMUM_SHARE rejection in commit 19232a1d432eaffbdc2cfa54a35d45f05560a3c0 | Restored missing fail-closed guard |
| 0b41b5ef1763030869a7b24703b684b2c3aae73d | Test exact deterministic group call coin allocation | This is the earlier hash-ranked remainder model. It is superseded by the later owner-approved initiator-paid remainder algorithm and its current tests | Superseded; no port |
| ca5aa45c243eaebb8fa872cb0de23311af2ca94f | Add exact integer allocation for group call coin splits | This is the earlier hash-ranked allocation algorithm; current code uses the later approved initiator remainder rule | Superseded; no port |

## Changes made
- `19232a1d432eaffbdc2cfa54a35d45f05560a3c0`: reject group-call allocations that would create zero-value participant shares.
- `a8165caeed6fdc3c0e999a1cf4ac4213f70279af`: change the zero-share unit test to assert fail-closed behavior.
- `a4c32be4f5e63f51cf1ab1b0ed0a963355c07764`: add explicit seven- and nine-participant initiator-remainder tests.
- `488c3a0aacc82c92fbc8faefcd75a9537735a512`: record the approved group-call integer allocation decision in the central decision traceability document.
- Read-back verification confirmed the source guard, tests, room-call security helper, and transactional room/rental recheck.

## Result
- Reviewed: 12/1,665 unique candidates (candidates 85–96).
- Present or superseded by later approved implementation: 9.
- Missing code/test/governance elements restored: 3 areas (minimum-share guard, 7/9 participant tests, decision traceability).
- Code and documentation changes made only on Full Platform development branch.
- Tests executed: 0. No Node test runner, Functions build or Emulator was run.
- Combined GitHub statuses queried for the code commit were empty; no CI success is claimed.

## Safety note
Audio admission follows rented-room capacity, not a fixed five-person cap. The five-participant test is arithmetic-only. The zero-share guard follows the approved requirement that settlement shares be positive whole amounts. No call billing was enabled; entitlement, explicit financial consent, trusted per-participant metering and atomic settlement remain open.

## Next
Continue from candidate 97. No merge to main, deployment, production Firebase mutation or paid-service activation occurred.