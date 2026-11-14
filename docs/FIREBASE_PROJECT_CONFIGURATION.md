# Firebase Project Configuration Record — Mawda

**Document type:** Technical configuration inventory only  
**Project:** `mawda-app-2026`  
**Purpose:** Preserve Firebase facts supplied from Firebase Console, separately from the Mawadda Product Constitution and operating policies.  
**Evidence date:** User supplied the complete Web app configuration on 12 November 2026. Recheck console values before production changes.  
**Important:** The Web API key is a client configuration identifier, not a service-account private key. Never store service-account private keys, access tokens, or other server credentials here.

## 1. Confirmed project and Web app identity

| Field | Confirmed value |
|---|---|
| Project name / ID | `mawda-app-2026` |
| Project number | `697303475139` |
| Web app nickname | `Mawda Platform` |
| Web App ID | `1:697303475139:web:8869603bda6f1a3c3ed376` |
| Hosting site | `mawda-app-2026` |
| Auth domain | `mawda-app-2026.firebaseapp.com` |
| Messaging sender ID | `697303475139` |
| Storage bucket | `mawda-app-2026.appspot.com` |
| Analytics measurement ID | `G-G9PJ9DFEBJ` |
| Web API key | Supplied by owner and installed in the Web FirebaseOptions; do not repeat it in this inventory |

The owner-supplied Firebase SDK configuration identified version `2`. The exact Web app identifiers and configuration values above were transcribed from that supplied configuration; this is not an independent live-console API verification.

## 2. Hosting, usage and release history (reported snapshot)

- Default domains: `mawda-app-2026.web.app` and `mawda-app-2026.firebaseapp.com`.
- Current release shown: 11 November 2026, 5:16 PM; release code `13f63f`.
- Previous releases shown: 11 November 2026, 3:30 AM (`22a445`) and 3:25 AM (`b2b4dd`).
- Reported Hosting downloads (7 days): 19.2 MB.
- Reported total storage current: 681.22 MB.
- Reported total downloads: 21.95 MB.
- Reported billing period: 1 November–1 December (PST).
- These are screenshot observations, not live telemetry verified by this repository.

## 3. Cloud Messaging and service identities (reported snapshot)

- Firebase Cloud Messaging API (V1): enabled; sender ID `697303475139`.
- Legacy Cloud Messaging API: disabled.
- Web Push key pair: console offered generation; the report does not confirm that a VAPID key pair was generated or configured in the web app.
- Reported Admin SDK service account: `firebase-adminsdk-fbsvc@mawda-app-2026.iam.gserviceaccount.com`.
- Four service accounts were visible in project permissions.
- Never create/download a new service-account private key for chat-based troubleshooting. Prefer least-privilege workload identity / managed credentials and rotate/revoke exposed credentials through Google Cloud IAM if exposure is suspected.
- Review IAM principals and roles directly in Google Cloud before any privilege change.

## 4. Authentication and notification settings (reported snapshot)

- Email/Password provider: enabled.
- Google sign-in: reported as a recommendation, not confirmed enabled.
- Email verification sender display name: `منصة مودة`.
- From address: `noreply@mawda-app-2026.firebaseapp.com`.
- The report describes an Arabic verification template using the Firebase action handler under `/__/auth/action`. Do not hardcode or manually construct action codes; use Firebase Auth's supported action-link generation and validated app-link handling.
- Dynamic Links warning appeared in the supplied console material. Confirm the current Firebase Auth mobile email-action-link migration path before implementing deep links; do not base new work on deprecated Dynamic Links.
- Authentication alerts included phone-verification quota warnings; actual usage and limits must be checked in the console.
- Other reported alerts: Firestore insecure-rules/expiring-rules alerts, App Distribution device alerts, extension review alerts, and general email/in-console alerts.
- Crashlytics was reported as configured for the web app; validate actual platform support and event receipt rather than assuming browser crash reports are being collected.

## 5. Firestore (reported snapshot versus repository state)

- Reported database: `(default)`.
- The supplied screenshot transcription showed rules granting broad authenticated access to user documents and broad access to an account matched by email.

**Security interpretation:** Firestore allow expressions are additive (logical OR) across matching rules. Any authenticated user could read every matched `users/{userId}` document under the reported rule, while the email-matched account received broad read/write access across the database. A client-side email equality check is not a safe Super Admin authorization boundary. Do not deploy that screenshot ruleset as production rules.

### Repository comparison (development branch inspected 12 November 2026)

- `.firebaserc` sets the default Firebase CLI project to `mawda-app-2026`.
- `firestore.rules` in the inspected development branch is materially stricter: member document reads are UID-scoped; wallet-ledger reads are scoped to the owning UID; transfer gets are scoped to sender/recipient; client writes and otherwise-unimplemented collections are denied.
- This repository rules file is not evidence that the stricter rules are currently deployed to the live Firebase project. Compare the live Rules tab and deployed release before any change.
- CI tests rules in emulators. The production Hosting workflow deploys Hosting only (`firebase deploy --only hosting`), not Firestore or Storage rules.
- Never copy broad screenshot rules into the repository or weaken default-deny rules to make a screen work. Implement missing access through reviewed server callables and narrowly scoped rules.

## 6. Repository configuration status

On development branch `codex/mawda-full-platform-implementation`:

- `.firebaserc` default project is `mawda-app-2026`.
- `lib/firebase_options.dart` Web configuration has now been updated with the owner-supplied Web app values: project ID, app ID, auth domain, API key, messaging sender ID, storage bucket and Analytics measurement ID.
- On 14 November 2026, `.github/workflows/bootstrap-native-platforms.yml` ran FlutterFire CLI against `mawda-app-2026`. Its log confirms the Android app `com.mawdda.platform.app`, iOS app `com.mawdda.platform.app`, and Web app were found/registered in that project, and `lib/firebase_options.dart` was regenerated. The resulting Android and iOS entries use real non-placeholder app IDs and the same project ID. macOS, Windows and Linux entries remain placeholders and are not supported release targets.
- The Firebase configuration guard checks the CLI project, Web project ID, registered Web app ID, and non-placeholder required Web fields. The native bootstrap workflow additionally verifies Android/iOS app IDs and project IDs before packaging the native projects.
- The Web API key is necessarily present in client configuration. Restrict it in Google Cloud API Credentials to the required APIs and authorized HTTP referrers for the production domains; Firebase Security Rules and server authorization remain the actual data-access controls.

## 7. Storage, App Hosting and billing notes

- `firebase.json` configures classic Firebase Hosting, Cloud Functions, Firestore rules, Storage rules, and local emulators.
- Firebase App Hosting is separate from the classic Hosting target configured in `firebase.json`; do not treat an App Hosting notice as proof that the existing classic Hosting site requires migration.
- Before enabling Blaze or additional services, review expected usage, budgets, alerts, region, retention and potential egress/storage costs. No billing-plan change is authorized by this record.

## 8. Safe next actions (no live changes made)

1. Verify the live Firestore Rules tab against the repository's default-deny `firestore.rules`; inspect the deployed ruleset and release timestamp.
2. Verify Firebase Auth authorized domains, email action URL settings, and supported mobile action-link handling; test verification and password reset end-to-end with non-production accounts.
3. Android/iOS/Web app registration and FlutterFire configuration were generated by the native bootstrap workflow on 14 November 2026; independently inspect the Firebase Console app records and confirm package/bundle IDs before production signing or release.
4. Verify FCM Web Push VAPID setup, service worker, permission UX and token lifecycle before claiming browser push is ready.
5. Restrict the Web API key by API and HTTP referrer; review IAM service accounts and roles, and avoid downloadable private keys.
6. Validate Analytics, Crashlytics and phone-auth alert behavior with real test events and current console documentation.
7. Confirm current billing plan, quotas, budget alerts, storage/egress usage and retention policy.
8. Plan a separately reviewed deployment of Firestore/Storage rules only after emulator tests, production diff review, rollback preparation and explicit owner approval.

## 9. Change-control boundary

This inventory does not authorize:
- changing Firebase project settings, Authentication providers, IAM roles, billing plan, App Hosting, Analytics, Crashlytics or Messaging;
- generating, exporting or rotating private keys;
- deploying Hosting, Cloud Functions, Firestore rules or Storage rules;
- deleting, migrating or cloning production data.

Any such operation requires a separately reviewed implementation plan and explicit owner approval.
