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
- Official development branch: `codex/mawda-full-platform-implementation`
- Code baseline SHA: `e522acb5a47964b529b84f49bacd9db0167a6dc5`
- Historical integration anchor: `e12897ad7dc5f383501d997117fb1211c67632e7`
- Recovery/documentation branch: `codex/mawda-recovery-integration-2026-11-21`
- Recovery branch is 5 commits ahead / 0 behind the code baseline; its current compare shows documentation-only changes in:
  - `docs/RELEASE_READINESS_CHECKLIST.md`
  - `docs/audit/recovery/DOMAIN_BRANCH_INVENTORY_2026-11-22.md`
  - `docs/audit/recovery/UNIFIED_BASELINE_SELECTION_2026-11-22.md`
- No application source code was ported in the branch-inventory passes. No merge to the official development branch or `main` was performed.

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

- **GUEST-001:** the emulator suite covers guest profile/session, public-room discovery/join, text and audio messaging, denial of direct messages/store purchase/wallet transfer/private or adult rooms, idempotency, cleanup and retry. The matrix still lists additional internal negative-capability and anti-abuse cases as planned, including no wallet read/top-up, no room rental, no gifts, and denial of image/GIF/video/document messages. It also lists expiry-clock and cross-installation assurance cases. The current successful CI run does not by itself prove these unimplemented planned cases.
- **CALL-001:** the server-side signaling emulator suite passed 7/7. The matrix remains partial because its remaining planned items include WebRTC media negotiation, TURN/network traversal, device permissions, background notifications and real-device media quality. These are outside the owner-confirmed current scope and have not been tested here.

The matrix's older BIO-001 wording should not be interpreted as requiring device attestation or automated proof. The final owner policy in `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` is authoritative: manual Super Owner evidence review and explicit decision are sufficient; server authorization, fresh MFA, private evidence access, audit, atomic ledger reward, idempotency and deletion remain required.

## Current conclusion

- The selected code baseline has strong successful internal GitHub evidence across Flutter, Functions, Firestore/Storage emulator journeys, rules, wallet/store, rooms, messaging, media, roles, calls and biometric review.
- Two internal coverage journeys remain explicitly partial (GUEST-001 and CALL-001); the skipped real-GCS signed-URL test is also not covered by a pass.
- Therefore this is an **internally CI-validated development baseline**, not a fully closed internal acceptance candidate yet.
- The next permitted work is limited to closing the remaining internal GitHub-testable gaps, then rerunning the repository's internal GitHub Actions suite on the exact candidate SHA.
- Do not run simulation, external/device/signing tests, production Firebase setup, production operations, or deployment under this scope.
- Final merge to the official development branch and any production/launch action remain separate owner-controlled decisions.
