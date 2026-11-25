# Semantic review batch 008 — group-call policy and BetaCoins terminology candidates 97–108
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD at report creation: 1c92bf46464e420e079269151aa20ff4ce9398ce
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 97–108, continuing sequentially.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence / action | Result |
|---|---|---|---|
| cc3cd71916b02a80e8030e82cde48c6b5c7c3381 | Record group call pricing and capacity gaps in economic audit | Current ECONOMIC_PHASE_COMPLETE_AUDIT contains owner-approved group audio/video rates, rented-private-room scope, audio room-capacity rule, video four-person cap, entitlements/consent, metering and settlement gaps | Present |
| fdaf53e1f5dff682fce212380ca598322fd66a65 | Document owner-approved group call policy amendment | Pricing/rented-room policy existed in the economic audit but was absent from central decision traceability. Added the owner amendment covering rented private rooms, total group rates, room-capacity audio, four-person video, per-member entitlement, consent and server-authoritative metering/settlement requirements in commit 708f9330ca91649a62d1e3810f31332bd9bfd2b2 | Restored missing governance record |
| c392a0f499e699ff09739ea678db4336aae593ce | Reconcile economic audit with completed gifting work and exact BetaCoins spelling | Current economic audit uses the exact BetaCoins brand and records gifting progress as historical/partial with remaining acceptance gates | Present |
| 112aaea91893dd1ce09d5368f2d9721cdabb0c4e | Standardize server messages and notifications to BetaCoins | Most changes were already present; remaining server-facing Arabic labels/comments in functions/src/index.ts still used كوينز. Replaced the remaining eight exact occurrences, including transfer, biometric, balance, rental and purchase-instruction messages, in commit 59c7cdca01e232cc01f93440db08eb578075cb1e | Restored terminology consistency |
| 6ead5db860f519a0cd268cb22f49f705ad7b615c | Replace legacy currency labels in member entitlement history | Current member entitlement history uses BetaCoins in the gift/grant explanation and history value display | Present |
| 3c4fcc8cbb4edde80fb3517c5d2af433b14536d4 | Replace legacy currency label in profile gift error | The exact historical error message is no longer present in the current profile screen; the current profile gift flow has evolved and already uses BetaCoins in its visible transfer/gift actions | Superseded by current profile flow |
| 726edaeb868d4226ee11babf3ad95f31f76281d8 | Replace legacy labels in coin purchase screen | Current screen already uses BetaCoins for the request confirmation, validation, issuance notice, fallback package name and quantity label. The screen title retains a generic Arabic wording not changed by this candidate | Present for candidate diff |
| e4f81e135b0626f5c2839702621fea1770e0cc76 | Replace legacy labels in shop call-pricing notices | Current shop uses BetaCoins in both audio/video open-call pricing notices | Present |
| 6ebbd924bb37f432b7937a2c5a0e7a34824b0fbd | Enforce exact BetaCoins branding in economic audit | Current economic audit uses `BetaCoins` as the product-facing name and preserves technical `coins` identifiers | Present |
| 5180ae6728fc9e07d5662636db0f478e9334e0e6 | Enforce exact BetaCoins branding in decision traceability | Current central decisions use `BetaCoins` in ECON-004, WAL-001, gifting, purchase and related decision text | Present |
| 5b3ceb13088f6708625af6a72fba1f98a21ece3d | Replace legacy labels in owner entitlement grants | Current owner grant confirmation and explanatory copy use BetaCoins | Present |
| 615d7e2a0e6612c5f385b1d63ec5a317ee778346 | Replace legacy labels in wallet screen | Current wallet purchase tooltip, gift action and transfer labels use BetaCoins | Present |

## Changes made
- Commit `708f9330ca91649a62d1e3810f31332bd9bfd2b2`: added the missing group-call policy amendment to the central owner decision traceability document.
- Commit `59c7cdca01e232cc01f93440db08eb578075cb1e`: standardized remaining server-facing BetaCoins strings in functions/src/index.ts.
- Read-back verified the policy section and that functions/src/index.ts no longer contains the legacy Arabic plural currency label `كوينز`.

## Result
- Reviewed: 12/1,665 unique candidates (candidates 97–108).
- Present or superseded by current implementation: 10.
- Missing governance/terminology details restored: 2.
- Tests executed: 0; these changes were documentation and user-facing text only. No Functions build or Flutter analysis was run.
- GitHub combined status for the documentation commit was empty; no CI success is claimed.

## Safety note
Only product-facing wording and documentation were changed. No economic amounts, rates, entitlements, ledger behavior, Firebase resources, production data, billing, deployment or main branch were changed. The group-call policy remains a documented requirement, not an enabled billing path.

## Next
Continue from candidate 109.