# Internal GitHub Acceptance Scope — 2026-11-22

## Owner-confirmed scope

The current work is restricted to **internal tests executed by GitHub Actions in the Mawdda repository**.

Explicitly excluded from this work:
- 5,000-persona simulation and all load simulation runs.
- External testing, external testers, staging/pilot exercises and external acceptance.
- Physical Android or iOS device testing.
- Actual APK/AAB signing, keystore handling, certificate verification, publication or distribution.
- Production Firebase Console setup or changes, production bucket/IAM verification, live Firebase operations or deployment.
- Billing, paid infrastructure activation, production data changes and irreversible retention operations.

These exclusions are deliberate scope boundaries, not completed tests and not release approvals. No claim is made about these excluded areas.

## Selected code baseline

- Repository: `productionhome2022-hash/mawda-platform`
- Sole canonical baseline and integration destination: E522, `e522acb5a47964b529b84f49bacd9db0167a6dc5`.
- Historical integration anchor only: `e12897ad7dc5f383501d997117fb1211c67632e7`.
- Sole existing mutable E522-descendant continuation ref: `codex/mawda-recovery-integration-2026-11-21` (12 commits ahead / 0 behind E522 at the time of this correction). This is a Git ref for descendants of E522, not an alternative baseline.
- `codex/mawda-full-platform-implementation` and `main` are not integration destinations.
- Recovery branch is 11 commits ahead / 0 behind the code baseline; its current compare shows documentation-only changes in:
  - `docs/RELEASE_READINESS_CHECKLIST.md`
  - `docs/audit/recovery/DOMAIN_BRANCH_INVENTORY_2026-11-22.md`
  - `docs/audit/recovery/UNIFIED_BASELINE_SELECTION_2026-11-22.md`
  - `functions/test/fixtures/feature-coverage-matrix.json`
- The branch-inventory passes themselves were read-only. Separately, PR #86 was mistakenly merged into the former development branch; PR #88 subsequently transferred the existing E522-descendant source history into the E522 continuation. No merge to `main` was performed.

## Verified GitHub Actions evidence on the code baseline SHA

### Run 44944086740
URL: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44944086740

Both jobs completed successfully:
1. Backend, Firebase rules and complete emulator journeys.
2. Flutter analysis, tests and web release build.

Log-level evidence:
- Flutter analyzer: `No issues found`.
- Flutter tests: `32 tests passed`.
- Emulator job: 27 Node test result blocks, 592 tests total, 591 passed, 0 failed, 1 skipped.
- The one skipped test is the real Cloud Storage signed-URL HTTP test. Its own skip reason requires `MAWDA_GCS_HTTP_TEST_BUCKET` in an isolated non-production GCS project. It was not run and is not represented as passed.
- The Flutter Web release build artifact was produced by CI. This is an internal build artifact, not a deployment or external acceptance.

### Run 44944086768
URL: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44944086768

The job completed successfully:
- Functions build and unit tests: 452 tests, 451 passed, 0 failed, 1 skipped.
- Call-signaling Firestore emulator integration: 7 tests passed, 0 failed, 0 skipped.
- The single unit-test skip is a separate test from the signed-URL skip above; no skipped test is counted as a pass.

### Biometric workflow evidence
Within the emulator run, the dedicated biometric integration suite completed 5 tests successfully. It covers versioned consent, the fixed phrase, ClamAV-approved safe derivatives, Super Owner-only inbox/playback/decision, fresh owner MFA, evidence duration rejection, atomic exactly-once 1,500 BetaCoins reward, retry/closure and evidence deletion.

The approved manual-review policy is implemented as a server-authorized Super Owner decision after the owner opens the private evidence and receives a short-lived playback grant. The legacy client-side completion path remains fail-closed; a local biometric prompt or client assertion cannot issue verification or reward. The playback grant is an audit-bound confirmation of owner evidence access, not device attestation, Play Integrity, App Attest or automated identity scoring.

## Internal coverage still marked partial

The committed `functions/test/fixtures/feature-coverage-matrix.json` contains 16 journeys. Two are still marked `partial`:

- **GUEST-001:** the emulator suite covers guest profile/session, public-room discovery/join, text and audio messaging, denial of direct messages/store purchase/wallet transfer/private or adult rooms, idempotency, cleanup and retry. The matrix now records eight remaining internal gaps: 60-minute expiry clock, cross-installation abuse resistance, full Flutter-to-backend E2E, no-reward guarantee, no wallet read/top-up, no room rental, no gifts, and denial of image/GIF/video/document messages. The current successful CI run does not by itself prove these unimplemented planned cases.
- **CALL-001:** the server-side signaling emulator suite passed 7/7. The matrix remains partial because its remaining planned items include WebRTC media negotiation, TURN/network traversal, device permissions, background notifications and real-device media quality. These are outside the owner-confirmed current scope and have not been tested here.

The matrix's older BIO-001 wording should not be interpreted as requiring device attestation or automated proof. The final owner policy in `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` is authoritative: manual Super Owner evidence review and explicit decision are sufficient; server authorization, fresh MFA, private evidence access, audit, atomic ledger reward, idempotency and deletion remain required.

## Draft PR and exact-head check status

- PR #86: https://github.com/productionhome2022-hash/mawda-platform/pull/86.
- PR #86 was merged on 2026-11-22 into `codex/mawda-full-platform-implementation` at merge commit `d4dc7399877f5aeafc2ca95422fc5a63324ab26f`, despite its own body saying “Draft only. Do not merge this PR”. This was an incorrect destination relative to the owner's now-explicit E522-only instruction. Its merge does not constitute integration into the E522 destination. Preserve the history; do not reset or rewrite the dev branch as part of this correction.
- PR #86 contains documentation/coverage-matrix changes and no application source changes. Its pre-merge PR-triggered workflow results are not proof of a post-merge run on the E522-descendant continuation ref.
- The E522 integration line must independently carry only approved changes after exact-file review. Do not use PR #86 or its merge commit as a substitute for that work.

## Current conclusion

- E522 is the only canonical platform baseline and integration destination. The existing recovery ref is only its mutable descendant pointer.
- Two internal coverage journeys remain explicitly partial (GUEST-001 and CALL-001); the skipped real-GCS signed-URL test is also not covered by a pass.
- This is not a claim that every branch has been reviewed or every feature has been ported.
- The current phase is non-X branch inventory, exact-file comparison, selective transfer and integration into the E522-descendant line. X is frozen and excluded until that work is complete.
- Do not run 5,000-persona simulation, external/device/signing tests, production Firebase setup, production operations, or deployment under this scope.
- After all non-X transfers are complete, perform the X branch-by-branch safety audit and report before any X deletion. No merge to the former development branch or `main` is part of this plan.
