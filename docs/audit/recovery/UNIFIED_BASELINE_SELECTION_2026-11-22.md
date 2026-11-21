# Mawdda Unified Baseline Selection — 2026-11-22

## Decision

Use `e522acb5a47964b529b84f49bacd9db0167a6dc5` as the current integrated recovery baseline for continued development, while preserving `e12897ad7dc5f383501d997117fb1211c67632e7` as the historical integration-and-CI anchor.

Work only on the side branch `codex/mawda-recovery-integration-2026-11-21` for recovery/integration work. Do not merge to `main`, deploy, change production Firebase resources, enable billing, or change live retention policy.

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

## Next controlled steps

1. Treat `e522acb` as the recovery integration baseline and `e12897ad` as its historical known-good ancestor.
2. Inventory code-bearing branches against this baseline by domain (economy/store, roles/Admin Media, profiles, ads, rooms/calls, media/security, biometric).
3. For each branch, compare source files and tests, then port only changes not already present. Avoid merging whole divergent histories merely because branch names suggest a feature.
4. Run the relevant focused tests after each port, then the full Test Center and cross-platform checks on the resulting SHA.
5. Keep unresolved policy questions and production-only operations blocked pending explicit owner approval.

## Scope and non-claims

- This is a baseline selection and evidence record, not a claim of production readiness or a completed 5,000-persona simulation.
- GitHub Actions success does not prove native iOS/Android device acceptance, release signing, or deployment.
- No production resources, live data, billing settings, or `main` branch were changed by this selection.
