# Mawdda Android Release and Google Play Signing Runbook — 2026

**Owner decision:** prepare both Android distribution artifacts from the same reviewed source commit: APK for direct distribution and Android App Bundle (AAB) for Google Play.

**Current identity**
- Application ID: `com.mawdda.platform.app`.
- Flutter version in `pubspec.yaml`: currently `1.0.0+1` (version name `1.0.0`, Android version code `1`).
- Existing owner-controlled keystore: `mawdda-identity-key.jks`.
- Alias: `mawdda-identity`.
- Expected signing certificate SHA-256: `21:F9:E6:01:80:E2:03:8D:DD:57:4E:DC:F1:2A:63:4B:C6:25:D9:BA:3F:65:53:B2:9D:61:70:62:C6:36:84:56`.
- The existing key is the required identity. Do not generate a replacement key for the APK distribution path.

## 1. Artifact roles

| Artifact | Purpose | Distribution |
|---|---|---|
| Universal Release APK | Simplest direct installation package for supported Android devices | Official Mawdda website and owner-approved mirrors |
| ABI-specific Release APKs | Smaller device-architecture-specific direct-install packages | Only if the download portal clearly selects the compatible package; otherwise use the universal APK |
| Release AAB | Store upload package; Google Play generates optimized APKs for devices | Google Play Console only; an AAB is not a normal sideload installer |

All APK mirrors must distribute the exact same approved APK bytes, not rebuild the app independently. Publish SHA-256, version, package ID, signer certificate fingerprint and release notes with the artifact. APK and AAB are built from the same commit and Flutter version, and the pipeline verifies that their signing certificate fingerprints match.

## 2. Signing workflow and custody

**Additional production Firebase secret:** `MAWDDA_PRODUCTION_GOOGLE_SERVICES_JSON_B64` — base64 encoding of the actual production Android `google-services.json` downloaded from Firebase Console for project `mawda-app-2026` and package `com.mawdda.platform.app`. The owner provisions it directly in GitHub Actions Secrets; do not paste it into chat or commit it.


The manual workflow is `.github/workflows/android-signed-release.yml`. It is restricted to the development branch and checks out the immutable `github.sha` captured by the dispatch event (not the moving branch head), so the CI-tested candidate SHA and artifact source SHA cannot silently diverge. It requires these GitHub Actions Secrets:

- `MAWDDA_IDENTITY_KEY_B64`: base64 encoding of the existing JKS file.
- `MAWDDA_STORE_PASSWORD`: keystore password.
- `MAWDDA_KEY_ALIAS`: `mawdda-identity`.
- `MAWDDA_KEY_PASSWORD`: private-key password.

The owner must provision these secrets directly through GitHub's secure secret interface after confirming encrypted backups. Never paste the keystore, passwords, private key or base64 payload into chat, source control, issue comments, build logs or ordinary artifacts.

The production release must never inherit the repository's non-production default. `lib/main.dart` defaults to `nonprod` intentionally; the signed-release workflow explicitly passes `--dart-define=MAWDDA_FIREBASE_ENV=production` to every APK and AAB build. It first injects the production `google-services.json` from the owner-provisioned secret and verifies its project ID, project number, Android App ID, package name, API key and storage bucket against the production FlutterFire Android options. Missing or mismatched production configuration stops the build before any artifact is created. The non-production JSON remains the default for debug/emulator validation.

Before building, the workflow checks the private-key entry, RSA-2048 public key, exact pinned certificate SHA-256 and certificate expiry beyond 22 October 2033. It then creates:
1. A universal signed Release APK.
2. ABI-specific signed Release APKs.
3. A signed Release AAB.

It verifies every APK with `apksigner`, verifies the AAB JAR signature, confirms that all signer fingerprints match the existing Mawdda certificate, and checks the Android package ID on each APK. A separate fail-closed validator now compares every APK's `aapt` package/version metadata and the AAB Gradle `output-metadata.json` against `pubspec.yaml`, validates the AAB ZIP structure and required base manifest, and records the size of each artifact. The workflow also records SHA-256 checksums and build metadata. Temporary signing files are removed at the end of the job.

Before uploading the review artifact, the workflow builds the isolated Mawdda ClamAV scanner image, refreshes its malware signatures, scans all generated APK/AAB archives with bounded archive/file limits, fails on detections or incomplete/over-limit scans, and retains the scan output in release evidence. This scan is an additional release gate; it does not replace live media-scanner acceptance or independent security review.\n\nThe workflow uploads a short-lived GitHub Actions artifact for review only. It does **not** publish to the website, a mirror, Google Play, Firebase Hosting or any other production service.

## 3. Google Play App Signing and cross-channel updates

Google Play requires Play App Signing for new apps and uses two concepts:
- **App signing key:** signs APKs that Google Play delivers to users.
- **Upload key:** signs the AAB submitted by the developer; Google uses its certificate to authenticate the upload.

Official references:
- [Android Developers — Sign your app](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console Help — Use Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Android Developers — Upload your app to Play Console](https://developer.android.com/studio/publish/upload-bundle)

**Mawdda continuity requirement:** users who installed an APK from the official website or an approved mirror must be able to update to the Play-distributed app without uninstalling and losing local app state. Therefore, when creating the new Play app and configuring Play App Signing, the owner must explicitly select the existing Mawdda signing key as the **app signing key** using Google's supported secure key-transfer procedure. Do not accept a Google-generated app-signing key by default if seamless updates from already distributed Mawdda APKs are required. A different Play app-signing certificate can make Play-delivered APKs incompatible as updates to sideloaded APKs signed by the existing Mawdda key.

The current pipeline signs both APK and AAB with the existing Mawdda key. That allows the existing certificate to be selected as the Play app-signing key. After Play App Signing is configured, the owner may choose to create/register a separate upload key (recommended by Google for key separation); if that is adopted, the pipeline must be deliberately updated so that APKs continue to use the established app-signing identity while the AAB uses the separately registered upload key. Do not silently replace the key used for public APKs.

This choice must be verified in the actual Play Console before the first rollout. Download/inspect the Play app-signing certificate and confirm the SHA-256 certificate and update path. If the owner chooses a Google-generated app-signing key instead, stop and document a migration plan and device/update compatibility tests before distributing any Play-signed release.

## 4. Versioning and release order

- Flutter `versionName` and the base Android `versionCode` come from `pubspec.yaml`; the build pipeline records them.
- The Universal APK and AAB for the same release must use the same version name and base version code. Flutter intentionally adds ABI offsets to split APKs: +1000 for `armeabi-v7a`, +2000 for `arm64-v8a`, and +4000 for `x86_64`; the validator checks each expected value and rejects missing/unknown ABI outputs. See the [official Flutter Android release guide](https://docs.flutter.dev/deployment/android).
- Increase the build number for every subsequent release. Before the first Play rollout, ensure the Play AAB's version code is strictly greater than the highest version code already distributed in a public/sideload APK, so it is eligible as an update.
- Never reuse or decrease a version code already uploaded to Play Console.
- Test a clean installation and an in-place update over the previously distributed APK on a real Android device, using the exact candidate artifacts.

## 5. Release acceptance gates

The Android release is **not ready for public launch** until all applicable items are evidenced against one immutable commit SHA:

- [ ] Owner confirms encrypted backups of the original JKS and recovery information.
- [ ] Owner provisions the four signing secrets and the production Android google-services JSON secret directly in GitHub Actions.
- [ ] Production Android FirebaseOptions and injected google-services.json match project `mawda-app-2026`, project number `697303475139`, app ID and package `com.mawdda.platform.app`; every build command explicitly selects `MAWDDA_FIREBASE_ENV=production`.
- [ ] Manual signed-release workflow completes successfully on the exact candidate SHA.
- [ ] Universal APK, ABI APKs and AAB all pass signature checks and use the expected Mawdda certificate.
- [ ] AAB signature is valid and its certificate matches the intended Play app-signing identity.
- [ ] APK package ID, version name/code, SHA-256, file size and certificate fingerprint are recorded.
- [ ] Clean install and in-place update succeed on real Android devices; verify app startup, sign-in, core flows, notifications, microphone and orientation.
- [ ] Website and each explicitly approved mirror serve the exact same approved APK bytes over HTTPS.
- [ ] The Android download URL allow-list contains only exact, owner-approved hostnames.
- [ ] Before Play submission, verify Play Console eligibility, current target API and policy requirements, Data safety/privacy declarations, app signing key selection, version code and store listing.
- [ ] Owner separately approves website/mirror publication and, later, Play Console upload/submission/rollout.

A green CI run, a generated unsigned/debug APK, or a successful signed artifact build does not by itself authorize public distribution. No Play Console registration, fee, upload, submission or rollout is authorized by this runbook.

## 6. Current implementation status

- Gradle Release signing fails closed when owner signing configuration is absent.
- The signed-release workflow is manual and development-branch-only; it explicitly selects production Firebase and fails closed unless the production Android google-services JSON is securely provisioned and matches the committed production options.
- This revision extends it to create and verify both APK and AAB artifacts.
- CI additionally builds and verifies a clearly labelled non-production **debug AAB** to exercise the Android App Bundle packaging path; this is not a release artifact and must never be distributed.
- The workflow has not yet been run with the owner's secure signing and production Firebase secrets; no signed production APK/AAB has yet been produced or accepted.
- Physical-device installation/update, Play Console app-signing configuration, and public distribution remain open gates.
