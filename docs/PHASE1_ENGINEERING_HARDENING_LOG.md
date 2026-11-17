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
