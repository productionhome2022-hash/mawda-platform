# مودة | MAWDA

منصة اجتماعية عربية للصداقة والتعارف والعلاقات الجادة والتواصل الإنساني.

## Project status

The repository is being prepared for a staged, production-oriented implementation. The current Flutter application is an early prototype; a successful build alone does not mean the product is ready for real members or real coin balances.

- Flutter client: `lib/`
- Firebase configuration: `firebase.json`, `.firebaserc`, `lib/firebase_options.dart`
- Trusted backend: `functions/` (Firebase Cloud Functions, TypeScript)
- Flutter/Firebase validation: `.github/workflows/validate.yml`
- Hosting deployment workflow: `.github/workflows/firebase-hosting-merge.yml`

## Development principles

1. Keep `main` stable; implement and validate changes on feature branches and review them through pull requests.
2. Never trust client-supplied owner flags, coin balances, commission rates, room permissions, or reward eligibility.
3. Perform financial mutations in trusted server transactions and write immutable, linked ledger entries.
4. Keep secrets, service-account keys, private keys, and production credentials out of Git.
5. Do not enable real-money purchases, real member balances, or production deployment until Firebase project configuration, authorization rules, emulator tests, operational monitoring, and recovery procedures are verified.

## Backend validation

```sh
cd functions
npm install
npm test
```

## Firebase project note

`.firebaserc` currently selects `mawda-app-2026`, while the checked-in FlutterFire options file contains placeholder-looking values and a different project ID. Verify the actual Firebase app registrations and regenerate FlutterFire configuration from the intended project before production use. Do not infer project identity from the alias alone.

## Product specification

The approved Mawda product constitution is maintained through the project decisions and implementation plan. Major areas include identity and profiles, authentication, messaging and rooms, stores, coin wallet and transfers, attendance and advertising rewards, moderation, owner administration, privacy, trust and safety, and platform security.


## Authentication and access-control foundation

The current implementation includes Firebase email/password registration and sign-in, email verification, password-reset email, and an auth-state gate. A verified Firebase identity is not yet a completed Mawda member profile; profile completion and server-created member records are a separate implementation stage.

Firestore client rules are deny-by-default except for a member reading their own profile and their own wallet ledger, and reading a transfer in which they are a participant. All client writes to balances, ledgers, transfers, settings, audit logs, and profile documents are denied. Trusted Cloud Functions use the Admin SDK for approved server-side writes.

Storage rules currently deny all client reads and writes until authenticated upload/download endpoints, MIME validation, ownership checks, and retention jobs are implemented. This is intentional security staging, not a claim that media features are ready.

## Firebase configuration blocker

The checked-in `lib/firebase_options.dart` still contains placeholder-looking Firebase app identifiers and API key values, and its project ID differs from `.firebaserc`. Do not deploy or test real sign-in against production until the correct Firebase app configuration is regenerated for the confirmed project and validated. No credentials or service-account keys belong in Git.


## Member profile completion

The callable `completeMemberProfile` is the only supported path for creating a completed member record. It requires a signed-in Firebase Auth user whose email is verified. The server validates the profile, reserves a normalized unique username, creates the member document, grants the approved 500-coin email-verification reward, and writes its wallet-ledger entry in one Firestore transaction.

The registration policy is deliberately fail-closed: the callable requires an explicitly configured integer `minimumAge` at `platformSettings/registration`. Until the owner approves and a trusted operator provisions this setting, profile completion is rejected. No minimum age is assumed by the application. The reward cannot be claimed repeatedly because the member document and deterministic reward-ledger entry are created atomically.

Profile fields include full name, username, age, profession, country, region, gender, marital status, a bio (maximum 500 characters), interests, and membership goals. Username registry documents are server-managed and are not readable or writable by clients.


## Trusted platform-owner bootstrap

The repository includes an operator-run script at `functions/scripts/bootstrap-owner.cjs`. It is not a callable function and cannot be invoked by a normal app user. It requires Google Application Default Credentials with Firebase Auth user-management and Firestore write permissions, the exact expected project ID (`mawda-app-2026`) confirmed twice, and an owner UID/email pair that must match an enabled, email-verified Firebase Auth account. It preserves existing custom claims and records a pending/completed/failed audit event.

Run it only from a trusted operator workstation after independently verifying the owner's account:

```sh
cd functions
FIREBASE_PROJECT_ID=mawda-app-2026 \
CONFIRM_PLATFORM_OWNER=mawda-app-2026 \
OWNER_UID='<verified Firebase Auth UID>' \
OWNER_EMAIL='<verified account email>' \
npm run bootstrap:owner
```

Do not put credentials, private keys, service-account files, owner UID/email values, or local environment files in Git. This script has not been run against Firebase; it is prepared for a separately authorized operator bootstrap after the Firebase app configuration and account identity are verified.
