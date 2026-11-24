# Firebase Project Configuration Record — Mawdda

**Last reconciled:** 15 November 2026  
**Purpose:** Separate historical owner-supplied Firebase Console facts from the current development/non-production configuration. This is an inventory, not authorization to change or deploy Firebase.

## 1. Production project — historical owner-supplied record

| Field | Recorded value |
|---|---|
| Project ID | mawda-app-2026 |
| Project number | 697303475139 |
| Web App ID | 1:697303475139:web:8869603bda6f1a3c3ed376 |
| Hosting site | mawda-app-2026 |
| Auth domain | mawda-app-2026.firebaseapp.com |
| Messaging sender ID | 697303475139 |
| Owner-supplied historical Storage bucket | mawda-app-2026.appspot.com |

The owner supplied the Web SDK configuration and Console screenshots on 12 November 2026. The Web API key is client configuration, not a service-account private key; it is intentionally not repeated here. The app IDs in the current production Flutter options match the previously recorded Web, Android and iOS IDs, but this document is not an independent live Console verification.

**Unresolved bucket discrepancy:** the owner-supplied historical Web configuration records mawda-app-2026.appspot.com, while the current production Flutter options record mawda-app-2026.firebasestorage.app. Do not silently assume these are interchangeable. Confirm the actual default bucket, legacy/custom buckets and region in Firebase Console and Google Cloud Storage before enabling production media.

## 2. Non-production project — current development target

| Field | Current repository value |
|---|---|
| Project ID | mawda-platform-nonprod-2026 |
| Project number | 12102454568 |
| Android app ID | 1:12102454568:android:5f8907b71af845cfa2141d |
| iOS app ID | 1:12102454568:ios:c03ae42bbcfca114a2141d |
| Web app ID | 1:12102454568:web:e5b292ae20b9a55ca2141d |
| Android package / iOS bundle ID | com.mawdda.platform.app |
| Non-production Storage bucket in current client options | mawda-platform-nonprod-2026.firebasestorage.app |

The committed android/app/google-services.json and ios/Runner/GoogleService-Info.plist point to the non-production project and branded application identifier. lib/firebase_options_nonprod.dart contains the corresponding Web, Android and iOS options.

## 3. Current environment selection

- .firebaserc selects mawda-platform-nonprod-2026 as the default Firebase CLI project and retains mawda-app-2026 as the separate production alias.
- lib/main.dart defaults MAWDDA_FIREBASE_ENV to nonprod. Production selection requires an explicit build-time define; ordinary builds and CI do not select production.
- lib/firebase_options_nonprod.dart is the non-production Dart configuration.
- lib/firebase_options.dart contains the production Web/Android/iOS options. macOS, Windows and Linux entries remain placeholders and are not accepted release targets.
- The current Android google-services.json and iOS GoogleService-Info.plist are non-production files. A production mobile release must use separately reviewed production-native configuration; the current native CI job deliberately builds only the non-production target.

## 4. App registration history and current workflow behavior

On 14 November 2026, an earlier native-bootstrap workflow used FlutterFire CLI to find/register the Android, iOS and Web apps in the non-production project and generate the committed non-production options. That is a historical non-production setup action; it was not a production deployment.

The current native workflow has been hardened: it does not invoke Firebase CLI or FlutterFire CLI, does not use FIREBASE_TOKEN, does not register apps or modify Firebase settings, and only validates the committed non-production files locally before building. No live Firebase mutation is performed by the current CI workflows.

## 5. Current GitHub build/deployment boundary

The development branch currently contains three workflows:
- validate.yml — Flutter, Functions, emulator, rules and scanner validation.
- bootstrap-native-platforms.yml — local configuration checks and Android/iOS build validation only.
- flutter-ci.yml — manual build/validation only.

The Firebase Hosting deployment workflow firebase-hosting-merge.yml has been removed. There is no current workflow that runs firebase deploy or gcloud run deploy. firebase.json still contains Hosting/Functions/rules configuration for future reviewed operations; configuration presence is not a deployment. No production deployment, production rules change or production data migration is authorized by this record.

## 6. Firestore and Storage security state

- The development branch's Firestore and Storage rules are intended to be default-deny, with narrowly scoped member reads and trusted server writes.
- CI exercises Firestore and Storage rules against Firebase emulators. Emulator success is not proof that the same rules are deployed to the live project.
- Historical Console screenshots from 12 November showed broad authenticated access and an email-matched administrative exception. Those rules are not an acceptable security boundary and must not be copied into the repository or deployed.
- Verify the actual live ruleset and deployment timestamp independently before any future production operation.

## 7. Authentication, notifications and service identities

The owner-supplied 12 November Console snapshot reported Email/Password authentication enabled, Google sign-in as a recommendation rather than a confirmed enabled provider, and Firebase Cloud Messaging API (V1) enabled. It did not confirm a generated/configured Web Push VAPID key pair. These are historical observations, not current live-state verification.

Never commit service-account JSON, private keys, access tokens or owner credentials. Prefer managed identities and least-privilege runtime service accounts. The current repository does not contain a service-account private key.

## 8. Cost, retention and release constraints

- Keep development Emulator-first and within the Firebase Spark/no-cost approach currently approved.
- Do not enable Blaze, create billable Firebase/GCP resources, deploy Cloud Run, create paid buckets, change billing, or activate WORM/retention locking without separate explicit owner approval.
- The 24-month immutable audit archive Terraform module is source code only; it has not been applied and no bucket has been created or locked by this work.
- No real-money purchase, payment provider, production wallet mutation or live media delivery is enabled by this configuration record.

## 9. Release gates still open

Before any production or live-media approval, independently verify:
1. The actual production Storage bucket, region, runtime bucket selection, IAM, CORS and generation-specific deletion.
2. Firebase Auth providers, authorized domains, email action links and real email delivery.
3. Owner UID bootstrap, real MFA enrollment/challenge/recovery/revocation and recent-auth enforcement in an isolated non-production project.
4. App Check/device attestation and anonymous-account recreation abuse controls.
5. FCM Web Push VAPID/service-worker configuration and real delivery.
6. Android/iOS physical-device authentication, permissions, microphone, notifications, media upload/playback and interruption handling.
7. Release signing, privacy/legal review, accessibility, observability, backup/restore and incident recovery.

No deployment or live production mutation is authorized by this inventory.