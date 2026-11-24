# Mawdda Unified Baseline Selection — 2026-11-22

## Decision

Use `e522acb5a47964b529b84f49bacd9db0167a6dc5` as the sole canonical platform baseline and integration destination. E522 is an immutable Git commit; therefore the existing ref `codex/mawda-recovery-integration-2026-11-21`, already 12 commits ahead and 0 behind E522, is the sole mutable continuation pointer for accepted descendants of E522. This ref is not a competing baseline or a separate development target. All accepted source and documentation changes must be committed on this E522-descendant line only. Preserve `e12897ad7dc5f383501d997117fb1211c67632e7` solely as the historical integration-and-CI anchor.

Work only on the existing E522-descendant continuation ref `codex/mawda-recovery-integration-2026-11-21`; do not use `codex/mawda-full-platform-implementation`, `main`, or any other branch as an integration destination. Do not create a competing baseline. Do not deploy, change production Firebase resources, enable billing, or change live retention policy.

## Why this is the best-supported chain

1. The historical development archive ref `archive/development-pre-unification-2026-11-15` points to `f068a8b2e3ad`.
2. The unified integration ref `codex/mawdda-phase1-unified-2026-11-19` points to `e12897ad7dc5f383501d997117fb1211c67632e7`. GitHub ancestry comparison shows this commit is 742 commits ahead of the archive ref and 0 behind it.
3. The historical anchor `e12897ad` passed two independent GitHub Actions runs:
   - Run [44792361450](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44792361450): Flutter analysis/tests/web release build; Cloud Functions compile/unit tests and broad Firestore/Storage emulator suites; scanner image and media sanitization tests. All three jobs succeeded.
   - Run [44792361211](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44792361211): retention/room reservation emulator regressions and Flutter UI analysis/widget tests. Both jobs succeeded.
4. The current development head `e522acb5a47964b529b84f49bacd9db0167a6dc5` is a direct descendant of `e12897ad`: GitHub comparison reports 421 commits ahead and 0 behind, with `e12897ad` as the merge base. Thus the newer branch did not replace the historical integrated tree; it carries that tree forward.
5. On `e522acb`, GitHub Actions run [44944086740](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44944086740) succeeded for the complete emulator-only Test Center and Flutter analysis/tests/web release build. Run [44944086768](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44944086768) also succeeded for economic verification.
6. The `e522acb` backend log shows the biometric emulator integration suite completed with 5 tests passed and 0 failed. It explicitly passed:
   - versioned consent and the approved spoken phrase;
   - ClamAV-approved evidence, Super Owner review and exactly-once reward;
   - rejection/retry lifecycle;
   - rejection of out-of-policy audio/video durations.
7. The current tree contains the server biometric lifecycle, evidence validation, integration tests and the owner review UI route. `lib/screens/super_admin_screen.dart` opens `BiometricReviewScreen`; that screen lists requests, obtains evidence playback, and submits accept/reject decisions. This is stronger evidence of UI wiring than merely finding an unused screen file.

## Biometric constraints confirmed in the current tree

- Audio: maximum 20 seconds and 5 MiB.
- Video: 3–5 seconds and 25 MiB.
- Reward: 1,500 BetaCoins, recorded through the server-side wallet ledger and idempotency key.
- Server-side validation reads MP4 movie/track duration from uploaded bytes, not client-supplied duration metadata.
- The integration test verifies that acceptance creates the reward once and that repeat acceptance is rejected.

## Why not select the specialist biometric branch as the whole baseline

The branch `codex/biometric-server-lifecycle-2026-11-20` at `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` had a failed PR workflow run [44789805359](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44789805359). It is useful as a source of changes to inspect, not as the standalone platform baseline. The current `e522acb` tree contains the integrated biometric lifecycle and passed its own emulator test suite.

## Termux/Ubuntu historical-test evidence boundary

The November 21 audit replay script is a new replay, not proof of the original November 16–19 local test run. Its report records dependency/build problems, including a `tsc: not found` result, and must not be described as a successful historical replay. The original local repair sequence and exact local SHA are not fully established by the currently preserved shell-history evidence. GitHub Actions results above are independently verifiable and are not substituted for that missing local evidence.

## Binding integration sequence

1. E522 is the sole canonical platform baseline and destination. Preserve its ancestry; do not reset it or substitute another commit.
2. The existing recovery ref named above is only the mutable Git pointer for E522-descendant commits because Git commit objects cannot themselves be moved or overwritten.
3. Inventory every non-X source branch against E522. X branches are frozen, retained, and excluded from all transfer/merge operations until every non-X transfer is complete and the owner receives the X safety report.
4. Compare exact source files, tests, policy decisions and commit deltas. Port only demonstrably missing, policy-compliant functionality into the E522-descendant continuation ref. Do not wholesale-merge divergent histories.
5. Keep advertising, economy/store, roles, profiles, rooms/calls, media/security, messaging and biometric work within this same E522-descendant line; no parallel development branch is an integration destination.
6. After all non-X ports are complete, run the permitted internal GitHub Actions checks on the exact resulting SHA. External/device tests and 5,000-persona simulation remain deferred until the owner reopens those gates.
7. Only after non-X integration is complete, audit every X branch and issue a branch-by-branch report on whether deleting X would be safe. Do not delete X before that report and separate owner authorization.

## Scope and non-claims

- This is a baseline selection and evidence record, not a claim of production readiness or a completed 5,000-persona simulation.
- GitHub Actions success does not prove native iOS/Android device acceptance, release signing, or deployment.
- No production resources, live data, billing settings, or `main` branch were changed by this selection.
