# Firebase Project Configuration Record — Mawda

**Document type:** Technical configuration inventory only  
**Project:** `mawda-app-2026`  
**Purpose:** Preserve the Firebase facts supplied from Firebase Console screenshots, separately from the Mawadda Product Constitution and operating policies.  
**Evidence date:** User-supplied report dated 12 November 2026; console values should be rechecked before production changes.  
**Important:** This record does not contain credentials, private keys, access tokens, or a complete Firebase API key.

## 1. Confirmed project identity from the supplied console report

| Field | Reported value |
|---|---|
| Project name | `mawda-app-2026` |
| Project ID | `mawda-app-2026` |
| Project number | `697303475139` |
| Environment type | Unspecified |
| Web app nickname | `Mawda Platform` |
| Web App ID | `1:697303475139:web:8869603bda6f1a3c3ed376` |
| Linked Hosting site | `mawda-app-2026` |
| Auth domain | `mawda-app-2026.firebaseapp.com` |
| Messaging sender ID | `697303475139` |
| Analytics measurement ID | Reported with prefix `G-G9P`; full value not supplied |
| Storage bucket | Reported with project prefix; full value not supplied |
| Web API key | Redacted in supplied report; do not reconstruct |

## 2. Hosting, usage and release history (reported snapshot)

- Default domains: `mawda-app-2026.web.app` and `mawda-app-2026.firebaseapp.com`.
- Current release shown: 11 November 2026, 5:16 PM; release code `13f63f`.
- Previous releases shown: 11 November 2026, 3:30 AM (`22a445`) and 3:25 AM (`b2b4dd`).
- Reported Hosting downloads (7 days): 19.2 MB.
- Reported total storage current: 681.22 MB.
- Reported total downloads: 21.95 MB.
- Reported billing period: 1 November–1 December (PST).
- Google Analytics: enabled, with the report describing free reporting up to 500 distinct events. Confirm current product limits and billing in the console before relying on this figure.
- These are screenshot observations, not live telemetry verified by this repository.

## 3. Cloud Messaging and service identities (reported snapshot)

- Firebase Cloud Messaging API (V1): enabled; sender ID `697303475139`.
- Legacy Cloud Messaging API: disabled.
- Web Push key pair: console offered generation; the report does not confirm that a VAPID key pair was generated or configured in the web app.
- Reported Admin SDK service account: `firebase-adminsdk-fbsvc@mawda-app-2026.iam.gserviceaccount.com`.
- Four service accounts were visible in project permissions.
- Never create/download a new service-account private key for chat-based troubleshooting. Prefer least-privilege workload identity / managed credentials and rotate/revoke exposed credentials through Google Cloud IAM if exposure is suspected.
- The report indicates owner/member access for the project account; review IAM principals and roles directly in Google Cloud before any privilege change.

## 4. Authentication and notification settings (reported snapshot)

- Email/Password provider: enabled.
- Google sign-in: reported as a recommendation, not confirmed enabled.
- Email verification sender display name: `منصة مودة`.
- From address: `noreply@mawda-app-2026.firebaseapp.com`.
- Reply-to: `noreply`.
- The report describes an Arabic verification template using the Firebase action handler under `/__/auth/action`. Do not hardcode or manually construct action codes; use Firebase Auth's supported action-link generation and validated app-link handling.
- Dynamic Links warning appeared in the supplied console material. Confirm the current Firebase Auth mobile email-action-link migration path before implementing deep links; do not base new work on deprecated Dynamic Links.
- Authentication alerts included phone-verification quota warnings; actual usage and limits must be checked in the console.
- Other reported alerts: Firestore insecure-rules/expiring-rules alerts, App Distribution device alerts, extension review alerts, and general email/in-console alerts.
- Crashlytics was reported as configured for the web app; validate actual platform support and event receipt rather than assuming browser crash reports are being collected.

## 5. Firestore (reported snapshot versus repository state)

- Reported database: `(default)`.
- The supplied screenshot transcription showed these rules:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.email == 'productionhome2022@gmail.com';
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

**Security interpretation:** Firestore allow expressions are additive (logical OR) across matching rules. In the supplied rules, any authenticated user can read every matched `users/{userId}` document, and the email-matched account receives broad read/write access across the database. A client-side email equality check is not a safe Super Admin authorization boundary. Do not deploy these screenshot rules as production rules.

### Repository comparison (development branch inspected 12 November 2026)

- `.firebaserc` already sets the default Firebase CLI project to `mawda-app-2026`.
- `firestore.rules` in the inspected development branch is materially stricter: member document reads are UID-scoped; wallet-ledger reads are scoped to the owning UID; transfer gets are scoped to sender/recipient; client writes and all otherwise-unimplemented collections are denied.
- This repository rules file is not evidence that the stricter rules are currently deployed to the live Firebase project. The supplied console report indicates a different ruleset was visible there. Compare the live Rules tab and deployed release before any change.
- The CI workflow tests rules in emulators. The production Hosting workflow currently deploys Hosting only (`firebase deploy --only hosting`), not Firestore or Storage rules. Do not assume a green Hosting deploy publishes security rules.
- Never copy the broad screenshot rules into the repository or weaken default-deny rules to make a screen work. Implement missing access through reviewed server callables and narrowly scoped rules.

## 6. Important repository mismatch found

At inspection of branch `codex/mawda-full-platform-implementation`:

- `.firebaserc` default project is correctly `mawda-app-2026`.
- `lib/firebase_options.dart` still contains placeholder/example identifiers and `projectId: 'mawda-platform'` for its platform configurations, including the web app.
- Its web App ID is not the console-reported App ID. The API key and storage bucket are also placeholders rather than the complete values from the Firebase app registration.
- Therefore the Flutter app configuration is **not yet aligned** with the real project. Do not infer or synthesize the missing values from the partially redacted report.
- The deployment workflow already checks for the expected project ID and placeholder identifiers and should block deployment until valid FlutterFire configuration is installed.
- Before updating `firebase_options.dart`, retrieve the actual registered app configurations from Firebase Console / FlutterFire for each platform that Mawadda intends to support. The web app ID is known from this report; Android/iOS/desktop app IDs and package/bundle identifiers were not provided here.

## 7. Storage, App Hosting and billing notes

- `firebase.json` in the repository configures classic Firebase Hosting, Cloud Functions, Firestore rules, Storage rules, and local emulators.
- The console report says Firebase App Hosting requires the Blaze billing plan. Firebase App Hosting is a separate product from the classic Hosting target currently configured in `firebase.json`; do not treat that notice as proof that the existing classic Hosting site requires App Hosting migration.
- Before enabling Blaze or additional services, review expected usage, budgets, alerts, region, retention and potential egress/storage costs. No billing-plan change is authorized by this record.

## 8. Safe next actions (no live changes made)

1. Compare the live Firestore Rules tab with the repository's default-deny `firestore.rules`; export or inspect the deployed ruleset and record its deployment timestamp.
2. Verify Firebase Auth authorized domains, email action URL settings, and supported mobile action-link handling; test verification and password reset end-to-end with non-production accounts.
3. Generate/obtain complete FlutterFire configuration for the registered web app and any registered Android/iOS/desktop apps. Do not paste service-account keys or private credentials into GitHub issues, chat, or source control.
4. Verify FCM Web Push VAPID setup, service worker, permission UX and token lifecycle before claiming browser push is ready.
5. Review IAM service accounts and roles; remove unused principals and avoid long-lived downloadable private keys.
6. Validate Analytics, Crashlytics and phone-auth alert behavior with real test events and current console documentation.
7. Confirm current billing plan, quotas, budget alerts, storage/egress usage and retention policy.
8. Plan a separately reviewed deployment of Firestore/Storage rules only after emulator tests, production diff review, rollback preparation and explicit owner approval.

## 9. Change-control boundary

This inventory records reported configuration and observed repository discrepancies. It does not authorize:
- changing Firebase project settings, Authentication providers, IAM roles, billing plan, App Hosting, Analytics, Crashlytics or Messaging;
- generating, exporting or rotating private keys;
- deploying Hosting, Cloud Functions, Firestore rules or Storage rules;
- replacing `firebase_options.dart` using incomplete/redacted values;
- deleting, migrating or cloning production data.

Any such operation requires a separately reviewed implementation plan and explicit owner approval.