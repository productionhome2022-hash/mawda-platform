# Phase 1 Engineering Hardening Log

## 2026-11-17 — Call signaling expiry enforcement

**Scope:** development branch only: `codex/mawda-full-platform-implementation`.

### Finding
The call-signal reader queried and returned pending SDP/ICE signaling documents before checking whether a ringing call had passed its server-owned expiry timestamp. The ICE-configuration callable also accepted a ringing call without independently enforcing its 45-second ring deadline. This allowed stale call setup material to remain readable until a scheduled cleanup or another endpoint changed the call state.

### Change
- Resolve an expired or malformed ringing deadline before querying signal documents.
- Mark the ringing call as `missed` transactionally and return an empty signal page.
- Re-check the ringing deadline transactionally before issuing ICE configuration; expired calls fail with `deadline-exceeded`.
- Preserve active accepted calls and handle a concurrent transition to `accepted` without incorrectly marking it missed.

### Tests added
- Seed a ringing call with a past expiry and a still-live signal fixture; verify the signal is not returned and the call is marked missed.
- Seed a separate expired ringing call; verify ICE configuration is rejected with `deadline-exceeded` and the call is marked missed.

### Verification status
- Source and test changes committed to the development branch.
- GitHub Actions validation is required on the resulting exact commit before this change is marked test-passed.
- No Firebase environment was contacted or modified. No production resource, main branch, deployment, billing, or destructive retention process was touched.

### Remaining call acceptance
- Configure and validate TURN in a dedicated non-production environment.
- Run real Android/iOS device tests for call lifecycle, backgrounding, Bluetooth/audio routing, network changes and reconnect behavior.
- Continue security review of call participant authorization, room capacity, signaling expiry and cleanup.

## 2026-11-17 — Featured-ad reward policy copy reconciliation

**Finding:** The member rewards screen said that the same campaign could earn up to three rewards in a rolling 24-hour window, while the owner-approved `ADS-FEATURED-ENTRY-001` decision and the existing featured reward policy module specify one reward per campaign per rolling 24 hours.

**Change:** Updated the member-facing policy text to state one reward per campaign per rolling 24-hour window. No reward amount, budget, campaign status, or live reward behavior was changed.

**Verification:** Source change committed. Flutter widget/analyze CI on the resulting exact head is still required; no UI acceptance is claimed.

## 2026-11-17 — Firebase environment identity validation

**Finding:** The existing CI checks covered the non-production FlutterFire app options through an inline workflow script and production Web identity through a separate validator. The checks were split, so project separation and all registered Web/Android/iOS identities were not verified by one reusable, unit-tested validation path.

**Change:**
- Consolidated production and non-production Firebase identity validation in `functions/scripts/validate-firebase-config.cjs`.
- Validates the Firebase CLI default alias remains non-production and the production alias remains the owner-recorded production project.
- Validates the production Web app ID and project identity.
- Validates the non-production Web, Android and iOS app IDs, project IDs, sender IDs and Storage bucket identifiers, plus the approved iOS Bundle ID.
- Rejects a non-production configuration that reuses the production Web App ID or resolves both environments to the same Firebase project.
- Replaced the duplicated inline Python CI check with the reusable Node validator and added unit tests for mismatched projects, wrong app IDs, missing registrations, placeholder values and iOS Bundle ID drift.

**Exact-head automated verification:**
- Code commit: `734f76cdd928824ef56225ce5b70ecc1d0108d95`.
- [Validate Mawda run 44084733601](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44084733601): **success**, all three jobs passed. This includes the Firebase identity validator, Flutter analysis/tests/Web release build, Cloud Functions compilation/unit tests and configured emulator integration suites, Firestore/Storage rules tests, emulator backup/restore smoke test, scanner container processing tests and EICAR detection.
- [Mawdda domain regression run 44084733644](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44084733644): **success**, both backend and Flutter jobs passed.
- [CodeQL run 44084736734](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44084736734): **success**.
- These results are automated CI/emulator evidence on the exact code commit; they do not prove live Firebase/GCP behavior or physical-device acceptance.

**Phase 1 remains OPEN.** The following external/owner-controlled gates are not claimed complete:
- Web App Check SDK/provider integration and a valid non-production App Check registration/token flow. The approved site key/provider configuration has not been supplied; server enforcement and the empty fail-closed allowlist remain unchanged.
- Non-production WIF/IAM/Secret Manager configuration and live Cloud Run/GCS scanner E2E. No live cloud resource was created or modified by this change.
- Real owner UID verification and MFA enrollment/challenge/recovery/revocation on an isolated non-production environment.
- Live Firebase Auth/provider/domain/email-delivery verification and independent review of the production Storage bucket discrepancy, region, IAM and CORS.
- Live backup/PITR and recovery acceptance. The passing backup/restore evidence above is emulator-only.
- Android/iOS physical-device acceptance and independent security/privacy/legal review.

No production Firebase resource, production data, billing setting, `main` branch or deployment was changed.

## 2026-11-17 — Android signed-release artifact identity and malware gates

**Finding:** The manual owner-key release workflow verified APK/AAB signatures and APK package ID, but did not independently compare the version metadata of every APK and the AAB against the Flutter source version, nor inspect the AAB's required bundle structure. The release acceptance checklist also required malware-scan evidence for candidate artifacts, while the CI ClamAV job only tested the scanner image and EICAR detection.

**Change:**
- Added `tool/verify_android_release_metadata.py` to validate every generated APK's package ID, versionName and versionCode using Android `aapt`.
- The validator checks Gradle's AAB `output-metadata.json` against the same package/version tuple and verifies the AAB ZIP integrity, `BundleConfig.pb`, and base manifest entry.
- The release evidence now records each APK/AAB file size as well as package/version identity.
- The manual signed-release workflow now builds the isolated ClamAV image, refreshes its signatures, scans the actual APK/AAB artifacts with explicit archive and scan bounds, fails closed on detection or incomplete/over-limit scanning, and retains the scan output.
- Added unit/contract tests and wired them into the repository's validation workflow.
- Updated the Android signing runbook and release checklist.

**Verification status:**
- Source changes are committed on the development branch.
- Validate Mawda run: `44097181993` (queued at the time this entry was written).
- Mawdda domain regression run: `44097182020` (running at the time this entry was written).
- The owner-key signed-release workflow has **not** been dispatched; no production APK/AAB has been built because the owner-provisioned signing and production Firebase secrets are not available for inspection or use through this workflow session.
- No physical-device installation/update, website/mirror publication, Google Play submission, production Firebase mutation, billing change, or merge to `main` has occurred.

**Acceptance limitation:** CI passing for the new validator proves the source-level checks and test suite only. The first owner-authorized signed-release run must still prove the actual APK/AAB metadata, signer identity, ClamAV verdict, SHA-256 and artifact sizes on one immutable candidate SHA.

**Additional source-integrity correction (same workstream):**
- The signed-release workflow previously checked out the moving development branch name after dispatch. That left a race where the branch could advance between dispatch and checkout while evidence still reported the dispatch SHA.
- The workflow now checks out `github.sha` from the dispatch event, and a contract test rejects a moving-branch checkout. This binds release artifacts to the immutable commit captured when the owner starts the workflow.

**ABI version-code compatibility correction:**
- Reviewing Flutter's official Android release guidance showed that split APKs intentionally use ABI-specific version codes: base +1000 for `armeabi-v7a`, +2000 for `arm64-v8a`, and +4000 for `x86_64` (the x86 offset remains reserved).
- Updated the validator and tests to require the Universal APK plus all three expected ABI APKs, verify each package/version tuple with the correct offset, and ensure unique split version codes. The AAB and Universal APK remain on the same base version code.
- Reference: [Flutter — Build and release an Android app](https://docs.flutter.dev/deployment/android).

## 2026-11-17 — Web/PWA notification, member-home and release-candidate hardening

**Scope:** development branch only: `codex/mawda-full-platform-implementation`.

**Changes:**
- Corrected the web push notification icon path and expanded CI checks for the PWA manifest, required icon assets, install prompt and Firebase messaging service worker.
- Removed the duplicate authenticated FCM bootstrap from `AuthGate`; the member home remains the single owner of the push-notification lifecycle. Opened push notifications now route to the notification center, while incoming-call notifications retain their dedicated routing.
- Removed the second push initialization from member-profile refresh, avoiding concurrent/redundant token registration and listener replacement when profile completion refreshes the home screen.
- Made the completed-member home panel scrollable so its existing functional shortcuts remain reachable on short mobile and desktop browser viewports. No colors, backgrounds, visual identity assets or theme styling were changed.
- Added a production-configured Web release-candidate build and artifact to CI. The workflow passes the exact `MAWDDA_FIREBASE_ENV=production` define consumed by `lib/main.dart`; this is build-only and does not deploy or contact production services.

**Commits on development branch:**
- `4088e97d2cb62d3cf6c9115659294cbe437a7b1b` — web push icon path.
- `a50d205397b755997bb7a08e88616fa19970c257` — PWA asset validation.
- `73b95606c09a73989b7f297b56071a336290cb1f` — push-open routing.
- `6aa25845890cc7c2b18ec95c62ff3df453cbe033` — remove duplicate AuthGate push bootstrap.
- `08a1bea61ee9060239a441d9a0b75d5795d6eec2` — production Web candidate build.
- `84c2b2d80831c239a05b57166ea2b96309ee5f9b` — member-home scroll and push lifecycle cleanup.
- `d69c722d7bf5642e14897fb96e24adbeb941cb32` — correct production Firebase environment define.

**Automated verification:**
- Mawdda domain regression run `44165195670` on `08a1bea61ee9060239a441d9a0b75d5795d6eec2`: **success** (Flutter analysis/widget tests and retention/room reservation emulator regression).
- Validation and domain runs for latest commit `d69c722d7bf5642e14897fb96e24adbeb941cb32` were queued when this entry was written; no passing result is claimed for that exact SHA yet.
- Earlier runs were cancelled by newer branch pushes and are not treated as acceptance evidence.

**Still open:** live PWA install/notification smoke tests require an approved reachable deployment and owner-provided web push configuration. Production candidate CI must pass on the exact latest SHA. Real-browser and physical-device acceptance remain outstanding. This log does not authorize deployment, production Firebase changes, billing, merge to `main`, or any visual identity/background/color changes.

**Phase 1 remains OPEN.**

## 2026-11-17 — PWA CI validator shell-quoting correction

**Finding:** On commit `0e3a8898fd93b37f93960b64fff9e907e3086cf6`, the `Validate Mawda` workflow's Flutter job failed only at `Validate desktop install experience assets`. The inline `node -e` program contained shell-sensitive quote/parenthesis sequences and Bash rejected the generated command before Node executed. Flutter analysis, Flutter tests, non-production Web build, production-configured Web candidate build, Cloud Functions/emulator suites and scanner tests completed successfully in their respective jobs; the overall validation was therefore not green.

**Change:** Replaced the fragile inline JavaScript command with a quoted Node heredoc in `.github/workflows/validate.yml`. The check still validates the PWA manifest identity/display/icons, all required local assets, service-worker syntax, install-prompt syntax, and the notification icon target. The change does not weaken or skip any validation.

**Verification:** Workflow fix committed as `b7cb42cb46a5d2f945d6c30af8c949f792c8c508`; this evidence entry was then committed as `a43dbb95529ed6b4f38034c72b364e84878ea589`. A fresh exact-head CI run is required for the resulting development head; no passing result is claimed until GitHub Actions completes on that exact SHA.

**Safety:** No application styling, background, brand asset, Firebase resource, production data, billing, deployment, or `main` branch was changed.

## 2026-11-17 — Owner-directed Web-first delivery scope

**Decision applied:** The owner explicitly deferred the separate 5,000-persona load simulation and live call acceptance tests until after the Web launch. Neither is to block current Web engineering completion or the current release candidate.

**CI change:** Removed only the dedicated `test:call-signaling-integration` emulator step from the current validation workflow. The Cloud Functions compile/unit tests, Firestore/Storage rules, media, retention, wallet/store, room rental/events, guest/privacy, safety, and other ordinary regression suites remain enabled. The 5,000-persona load script is not invoked by the current validation workflow; the seeded multi-user wallet regression remains ordinary functional regression and is not represented as a 5,000-persona test.

**Readiness documentation:** Split call implementation requirements from post-launch live acceptance. Server-authoritative signaling, authorization, quota, metering, idempotency and fail-closed controls remain engineering scope; live browser/device call acceptance is deferred. Added a separate explicit note that the 5,000-persona simulation is deferred and not a Web launch gate.

**Commits:** CI scope change `b14d684e45ea31995ec4f35656b44a93f3478536`; call readiness split `da93beedb9381da9c3faafeb90bf1854af05f950`; 5,000-persona deferral `7ebb9a9e23839c37935aa8dbba9bdf7cce230cab`.

**Safety and truthfulness:** This changes the sequencing of acceptance tests only. It does not claim calls are implemented or operational, does not enable call products/billing, and does not waive ordinary backend/security tests. No deployment, production Firebase mutation, billing activation, merge to `main`, or visual identity/background/color change was performed.

**Test-suite entry point:** Updated `functions/package.json` so `npm run test:all` no longer invokes the call-signaling integration suite during the current Web-first phase. The dedicated `test:call-signaling-integration` script remains available for the post-launch validation phase; it is not deleted. Commit: `ebed7d7a5fa83f6dc99824621a5bd4a37496d55d`.


## 2026-11-17 — Web-first implementation audit: calls and featured advertising

**Audited head:** `adc82c3a42f3c5b3a8ce5ab952f355205638024a` on `codex/mawda-full-platform-implementation`.

**Call lifecycle — partial implementation, not release-ready:**
- Confirmed server callables exist for starting/responding to calls, active-call lookup, ICE configuration, signaling read/write and termination. The current backend performs participant, account-state, block, age and active-call-lock checks.
- The current call session starts in `ringing` and uses a 45-second ring expiry. The inspected call lifecycle does not persist a server-confirmed connected timestamp, enforce the approved five-minute connected-duration ceiling, or implement the approved rolling 24-hour limits of five audio attempts and three video attempts.
- The inspected call lifecycle does not consume the approved 24-hour / 7-day / 30-day call entitlements, implement paid continuation, or post the associated economic ledger entries. The paid-continuation rounding/billing unit remains an explicit owner-decision blocker and must not be guessed.
- TURN is optional in code and depends on `MAWDDA_TURN_URLS` plus the `MAWDDA_TURN_SHARED_SECRET`; the existing call integration test explicitly asserts `turnConfigured === false`. This is not evidence of TURN readiness for real browser networks.
- The Flutter call screen contains WebRTC media/signaling flows, but the owner-directed live browser/device acceptance tests remain deferred. Do not claim calls are operational or enable their UI as an accepted product until the server policy and non-live tests are complete and the later live acceptance gate passes.

**Featured advertising — UI/backend integration gap confirmed:**
- `lib/screens/featured_ads_screen.dart` currently renders a hard-coded empty campaign state, local-only geographic chips, and explanatory placeholder text for reward history; it does not load campaign cards or member reward history.
- `functions/src/featured-advertising.ts` provides a pure campaign-selection helper and `functions/src/featured-ad-rewards.ts` provides a pure reward-decision helper. The inspected `functions/src/index.ts` does not import or expose these modules as callable endpoints, so their existence alone does not provide a functioning serving/player/claim/ledger flow.
- Required work remains: authenticated campaign feed and geographic matching, owner-approved/payment-confirmed/creative-approved eligibility, a dedicated player session, server-validated visibility/completion evidence, atomic daily and per-campaign limits, idempotent reward ledger credit, and the member's own reward-history endpoint/UI. Do not credit on screen open, preview, carousel or button press.

**Exact-head CI evidence:** At the audited head, GitHub combined commit statuses returned an empty list and the available commit-workflow lookup returned no runs. This is **not** a passing CI result. The validation workflow is configured for pushes to the development branch; a subsequent code/documentation commit should trigger a fresh exact-head run, which must be checked before claiming validation.

**Scope and safety:** This entry records source inspection only; it does not claim these gaps are fixed or tests are passed. No visual styling/background/brand changes, production Firebase mutations, billing changes, deployment, or merge to `main` were performed.


## 2026-11-17 — Restore call-signaling emulator coverage to the pre-release gate

**Owner-scope correction:** The call signaling integration suite uses the Firestore Emulator and is not a live device/browser acceptance test. Deferring live call acceptance after the web release does not justify excluding this non-live security/integration suite from pre-release verification.

**Changes:**
- Restored `npm run test:call-signaling-integration` to `functions` `test:all`, after room event integration coverage.
- Added an explicit GitHub Actions step to `.github/workflows/validate.yml` so the call signaling Firestore Emulator suite runs on every development-branch validation.
- Kept the separate 5,000-persona load simulation excluded from the current web release gate.
- Kept live browser/device WebRTC/TURN acceptance deferred until after the web trial; this emulator suite does not establish real network/device readiness.

**Validation:** Source and workflow edits committed separately. Exact-head CI must complete before this change is considered verified. No production Firebase, live call data, billing, deployment, visual styling, or main-branch changes were made.


## 2026-11-17 — Call duration guard, featured-ad reward policy alignment, and exact-head Web CI

**Verified development head:** `75dd1c5c4725356916bdf0e28cb184082df09ad0` on `codex/mawda-full-platform-implementation`.

**Call duration enforcement added:**
- Added `markCallConnected`; caller and at least one accepted recipient must both report an established WebRTC peer connection before the server writes an immutable `connectedAt` and five-minute deadline.
- The client reports the connected state and retries a transient failed server confirmation while the peer remains connected.
- Added server expiry handling that marks the call ended, releases matching participant locks, and blocks further signaling/ICE access after the deadline. A periodic cleanup sweep processes deadline-expired sessions.
- The server timestamp is authoritative for the timer, but the connection-state trigger is reported by both clients; it is not cryptographic proof of packet delivery. Live browser/device/TURN acceptance remains deferred and required after the Web trial.
- The call quota rules (five audio and three video session attempts per rolling 24 hours) remain server-enforced. An idempotent replay does not consume a second attempt.

**Call integration regression found and fixed:** The first run exposed that a manually ended call was being misclassified as a maximum-duration expiry. The helper now returns a distinct duration-expired result. The final exact-head call signaling emulator suite passed on the verified head.

**Featured-ad reward helper alignment:**
- Updated the pure reward decision helper and tests to enforce up to three rewards for the same campaign/member in a rolling 24-hour window, matching the approved decision.
- Updated the member-facing policy explanation to the same limit.
- This is a helper/policy alignment only. It does **not** mean the featured-ad campaign feed, dedicated player, trusted evidence pipeline, wallet credit endpoint, or member reward-history service is complete or active.

**Exact-head CI evidence on `75dd1c5c4725356916bdf0e28cb184082df09ad0`:**
- `Validate Mawda` run `44174040074`: completed successfully. Cloud Functions compile/unit tests and the emulator integration suites passed, including call signaling, wallet/store transactions, room rental/events, retention, media authorization, FCM, rewards, safety, guest/privacy and Firestore/Storage rules. Flutter analysis/tests and standard plus production-configured Web release-candidate builds passed. The production-configured artifact was uploaded by CI; it was not deployed.
- `Mawdda domain regression` run `44174040361`: both Flutter UI analysis/widget tests and retention/room reservation emulator regression jobs passed.
- The isolated ClamAV scanner workflow passed its container build, GIF/audio/video/PDF sanitization tests and EICAR detection test.

**Still open / not implied by this evidence:** call package entitlement consumption and paid continuation/ledger allocation; live browser/device WebRTC and TURN acceptance; separate featured-ad campaign approval/payment/targeting/player/reward/ledger integration; Media Saver entitlement-checked local-save flow; member/admin correspondence and unconnected routes; broader economy/store/grant audit beyond the suites listed; and live browser/PWA acceptance. The 5,000-persona simulation remains deferred and is not claimed as passed.

**Safety:** No merge to `main`, deployment, production Firebase mutation, billing activation, destructive retention activation, or visual/background/color/theme change was performed.
