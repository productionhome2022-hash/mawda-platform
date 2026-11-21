# Mawdda Platform — Branch Unification Register
Date: 2026-11-18
Target integration branch: `codex/mawdda-unified-test-2026-11-18`
Baseline before this register: `9423fbaed63417cec4c9b27cdc10d45b16ef6401`
Production/main: untouched. Simulation repository `productionhome2022-hash/mawdda-5000-simulation-lab`: explicitly excluded and untouched.

## Governing integration rules
- Integrate development work into the unified test branch only; do not merge to `main`, deploy, change production Firebase resources, or trigger remote CI.
- Preserve source branches and commit history. Do not force-push, delete branches, or resolve conflicts by silently choosing one side.
- For overlapping files, reconcile behavior and contracts deliberately; especially `functions/src/index.ts`, `functions/src/media.ts`, `firestore.indexes.json`, package manifests, scanner code, and shared Flutter screens.
- Keep new tests and documentation with the implementation they validate. Never claim tests passed unless executed locally and recorded.
- Keep all test-account seeding emulator-only; no production project IDs, credentials, payment rails, or live identities.
- The 5000-person simulation repository is outside this operation.

## Branch inventory and current disposition

| Source branch | Unique commits vs development branch | Change scope observed | Disposition |
|---|---:|---|---|
| `codex/economic-phase1-closeout-2026-11-18` | 124 | Wallet, gifting, call economy, profile privacy, audit docs, tests | PR #22 retargeted to unified branch; currently conflicts after PR #21 integration; do not merge until reconciled |
| `codex/featured-ads-secure-lifecycle-20261118` | 199 | Featured ads, media capacity/security, stickers, indexes, Functions entry point, Flutter screens, tests | PR #24 draft; conflict review required; high-priority source |
| `codex/mawda-phase2-hardening` | 78 | Secure media intake, scanner service/container, media controls, indexes, tests | PR #25 draft; overlap with featured ads and economic media changes |
| `codex/mawdda-test-account-system` | 37 | Emulator-only personas, seed script, coverage matrix, runbook, tests | PR #26 draft; inspect environment guards and package scripts before integration |
| `codex/mawdda-unified-final` | 17 | Email verification renewal and profile screen changes | PR #27 draft; profile and Functions entry-point overlap |
| `codex/mawdda-member-inbox` | 5 | Conversation inbox, deletion integration and UI | Compare with rebased variant; likely superseded |
| `codex/mawdda-member-inbox-rebased` | 7 | Inbox plus media integration deltas | Candidate over original; reconcile Functions entry point and media files |
| `codex/mawdda-premium-effects` | 5 | Premium profile effects and auth/profile UI | Selective integration candidate; profile overlap |
| `codex/mawdda-room-audio-duration-enforcement` | 5 | Audio duration checks in scanner, media and room UI | Candidate; must preserve global 60-second live recording limit |
| `codex/mawdda-room-events` | 5 | Audit archive and room event Functions | Candidate; Functions entry point overlap |
| `codex/mawdda-store-entitlement-coverage` | 2 | Wallet/store integration coverage and shop UI | Compare with hardening and wallet closure variants |
| `codex/mawdda-store-entitlement-hardening` | 2 | Wallet/store and room-event tests | Variant; compare before selection |
| `codex/mawdda-store-entitlement-hardening-v2` | 1 | Wallet/store integration test delta | Variant; do not duplicate |
| `codex/mawdda-store-wallet-entitlement-closure` | 4 | Premium profile, shop and profile UI tests | Candidate; overlap with store coverage |
| `codex/mawdda-phase1-phase2-hardening` | 1 | Phase closure matrix documentation | Documentation candidate |
| `codex/mawdda-unified-release` | 4 | Biometric verification cycle, profile UI and tests | Candidate; Functions entry point/profile overlap |
| `codex/featured-ads-serving-foundation` | already integrated | Featured ad serving foundation | PR #21 merged into unified branch; merge commit `9423fbaed63417cec4c9b27cdc10d45b16ef6401` |

Branches with no unique commits relative to the development branch at the inventory point were treated as stale/superseded candidates, not deleted: `codex/production-readiness-tests`, `codex/mawdda-deep-audit-profile-store`, `codex/mawdda-mfa-signin`, `codex/mawdda-native-platform-scaffold`, `codex/mawdda-pr3-port`, `codex/mawdda-premium-features`, `codex/mawdda-safety-ui`, `codex/mawdda-unified-final-v2`, `codex/mawdda-unified-final-v3`, `codex/mawdda-audit-archive-full`.

## Draft integration PRs opened for review
- #24 — secure featured ads, media capacity and stickers
- #25 — media security hardening
- #26 — test account system and coverage matrix
- #27 — profile and email verification deltas

These are draft review vehicles only; none of these PRs is merged. PR #22 remains the economic closeout source and is not merged.

## Verified blockers and required next steps
1. All major source branches above diverge from the unified branch because their histories are based on older development snapshots and the unified branch already includes the featured-ad serving merge.
2. High-risk overlap is concentrated in Functions registration/exports (`functions/src/index.ts`), media policy/processing (`functions/src/media.ts` and scanner), Firestore indexes, package scripts, and shared Flutter screens. Whole-file replacement is unsafe.
3. Review each source diff against the current unified branch. Integrate independent modules, tests and docs first; reconcile shared files by semantic merge with a local checkout.
4. Do not activate new workflows or run remote CI during this phase. Keep all verification local as directed.
5. The current execution environment has no Mawdda repository checkout, Flutter/Dart/Firebase CLI, or working GitHub network clone; therefore local build/test verification and reliable semantic conflict resolution are not currently available here. Do not represent GitHub compare metadata as a successful merge or test.
6. Once a local checkout is available, perform conflict-aware merges in small domain batches, run focused tests, then the full local suite. Record commit SHAs, test commands, outcomes and remaining blockers in this register.

## Current status
**IN PROGRESS — inventory and draft review PRs created; complete source integration is not yet achieved.**
