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

The registration policy is deliberately fail-closed: the callable requires an explicitly configured integer `minimumAge` at `platformSettings/registration`. The approved baseline is 16 years for friendship and non-romantic social connection. Romantic dating and marriage intent are restricted to 18+. Registration remains closed until the owner explicitly enables this policy through the trusted callable. The reward cannot be claimed repeatedly because the member document and deterministic reward-ledger entry are created atomically.

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


### Owner-controlled registration gate

The owner-only callable `setRegistrationPolicy` controls registration at `platformSettings/registration`. It requires the `platformOwner` custom claim and both an explicit `enabled` boolean and an integer `minimumAge` from 16 to 120. Each change increments a version and creates an admin audit record in the same Firestore transaction. Member completion rejects requests unless registration is explicitly enabled and the minimum age is configured. The repository does not choose a default age and does not enable registration automatically.


## Firebase Security Rules emulator tests

The CI backend job runs Firestore and Storage authorization tests against the Firebase emulators using a demo project (`demo-mawda-rules`). The tests verify member-only profile and wallet-ledger reads, transfer-participant access, and denial of client writes and Storage access. These tests do not connect to or modify the production Firebase project. Run them locally from `functions/` with `npm install` followed by `npm run test:rules`; Java 21 is required by the emulator toolchain.


The backend unit suite also covers registration-policy validation boundaries and fail-closed behavior: only explicit booleans and integer minimum ages from 16 through 120 are accepted; the callable separately enforces the platform-owner claim before changing settings.


## Age and relationship-intent safeguards

The approved baseline is a minimum age of 16 for friendship and non-romantic social connection. Romantic dating and marriage intent are separate structured goals and are rejected by the trusted backend for anyone under 18. Goal values are canonical server-validated codes; free text cannot bypass the age gate. The owner-controlled minimum registration age cannot be configured below 16. Before enabling any market, review local age, child-safety, privacy, and platform obligations. Age entered in a profile is not, by itself, robust age assurance; stronger age verification and minor-safety controls remain launch requirements.


## Canonical product constitution and governance

`docs/MAWADDA_PRODUCT_CONSTITUTION.md` is the highest-level approved product, design, safety, and engineering reference. All implementation plans, feature work, data models, UI flows, security rules, tests, and release decisions must align with it and its approved amendments. `docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md` contains the detailed brand and experience specification; `docs/RELEASE_READINESS_CHECKLIST.md` contains evidence-based release gates. A requirement documented in any of these files is not considered implemented until code, tests, and review demonstrate it.

## Approved biometric link entitlement

Members whose biometric verification is confirmed by the trusted backend receive a free link-sharing entitlement in one-to-one private chats, public rooms, and rented private rooms. The approved direct HTTPS destinations are YouTube (including `youtu.be` and `youtube-nocookie.com`), Facebook, Instagram, and X/Twitter. This is not a paid subscription. Ordinary unverified members remain blocked from sending links. Room-owner/moderator permissions remain separately scoped; the platform-owner any-domain exception requires server-verified owner authorization and a fresh step-up/MFA session. Known shorteners (`t.co`, `bit.ly`, `tinyurl.com`, and others), unsafe/non-web schemes, credentials, deceptive hosts, and obfuscation remain blocked for every role, including the platform owner. The entitlement is not live until the biometric verification workflow is implemented and verified; eligibility requires server-owned `status = verified`, a future `expiresAt` timestamp, and no `revokedAt`; a client cannot assign these fields.

## Production deployment safety

The Firebase Hosting workflow is manual-only. It can be dispatched only by the repository owner with an explicit production-deployment approval input, runs Flutter analysis/tests/web build plus Cloud Functions and Firestore/Storage emulator tests, and blocks deployment if the Firebase CLI project, FlutterFire project ID, or generated app identifiers do not match the approved production configuration. Do not dispatch it until the Firebase configuration and release checklist are independently verified. CI and development-branch changes do not deploy production.
