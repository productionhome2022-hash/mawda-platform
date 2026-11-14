# Mawdda Test Center — operator runbook

## Purpose and release gates

This is the repeatable engineering test environment for Mawdda Platform 2026. It is not a production account manager. All seeded identities and fixtures belong to Firebase Emulator Suite projects whose IDs start with `demo-mawda-` or `demo-mawdda-`. Never point this workflow at a live Firebase project.

A release candidate is not considered ready because one unit-test command passes. The release checklist is:
1. backend TypeScript build and Node unit tests;
2. Firestore/Storage rules tests;
3. emulator integration suites for guest privacy, wallet/store, rooms/rentals/events, biometric verification, email renewal, premium profiles, safety, media and retention;
4. Flutter analyze, Flutter tests and release web build;
5. device checks for real biometric prompts, camera/microphone permissions, push notifications and platform-specific behavior;
6. owner/MFA verification and security review;
7. explicit human approval before any staging or production deployment.

## Test identities

The catalogue in `functions/test/fixtures/test-account-personas.json` is the source of test persona capabilities and denials.

| Persona | Provisioning | Intended scenarios |
|---|---|---|
| `guest-preview` | Anonymous sign-in from the client; profile fixture only | Public discovery, public catalog and ads; 60 minutes in a rolling 24-hour window |
| `email-member` | Emulator email/password identity | Member profile, chat, allowed media, wallet, transfers, gifts, stores and rooms |
| `biometric-member` | Emulator email/password identity | Member scenarios plus the biometric challenge lifecycle; fixture is not hardware proof |
| `counterparty-member` | Emulator email/password identity | Two-party chat, transfer, gift and room interaction |
| `owner-operator` | Emulator email/password identity | Owner flows only after the real owner/MFA authorization path is exercised |

The provisioner intentionally does **not** set privileged custom claims, mark a user as biometrically verified, credit coins, issue rewards, or create live payment methods. Owner access must be earned through the production authorization design (including MFA); the fixture is not a back door.

## Provision emulator accounts

From the repository's `functions/` directory:

```sh
npm ci
npm run test:seed-accounts
```

This starts only Auth and Firestore emulators with a demo project ID. The script additionally requires explicit `MAWDDA_ALLOW_TEST_SEED=1`, emulator host variables, and the allowlisted project prefix. It writes newly generated credentials to `.mawdda-test-credentials.local.json` in the functions directory with owner-only file permissions. This file must never be committed or shared. Re-running rotates the emulator passwords.

The guest must be created using Firebase anonymous sign-in in the client test flow; the provisioner creates only its non-authenticated profile fixture.

## Existing automated suites

Run an individual suite from `functions/`:

- `npm test` — TypeScript compile, script syntax checks and Node unit tests.
- `npm run test:rules` — Firestore and Storage rules.
- `npm run test:guest-privacy-integration` — guest/member privacy boundaries.
- `npm run test:wallet-store-integration` — coin transfer and store purchase behavior.
- `npm run test:seeded-persona-interaction` — provisions the named emulator personas, then performs a real member-to-member transfer using their seeded Auth UIDs and verifies both ledgers, platform commission and idempotent replay.
- `npm run test:room-rental-integration` and `npm run test:room-events-integration` — room lifecycle and events.
- `npm run test:biometric-integration` — server-side biometric verification lifecycle.
- `npm run test:email-renewal-integration` — email verification renewal.
- `npm run test:premium-profile-integration` — VIP, titles, frames/styles, analytics, pinned sections, greetings and discovery boost.
- `npm run test:media-integration`, `npm run test:profile-media-integration`, `npm run test:media-legal-hold-integration`, `npm run test:message-legal-hold-integration` — media controls and legal hold.
- `npm run test:retention-integration`, `npm run test:message-deletion-integration` — retention and deletion.
- `npm run test:safety-integration` — safety/report/appeal cases.
- `npm run test:push-token-integration` — push token lifecycle.
- `npm run test:owner-audit-export-integration` — owner audit export.

Some suites need external credentials or cloud resources and are deliberately not part of the default emulator suite: live media scanner E2E and GCS retention. Run them only in a separately approved non-production environment.

## Guest clock testing

The guest's one-hour/24-hour policy is a product rule. Clock manipulation is permitted only in an isolated emulator test harness; do not add a client-facing clock control to production. Tests should exercise: first entry, continued use before 60 minutes, expiry at 60 minutes, denial before the rolling 24-hour window ends, and re-entry when the window expires. The test clock must not change server time, production timestamps, or real user eligibility.

## Media and financial invariants

- Members may exchange images, GIFs, audio and video only. PDF/documents remain owner-only.
- Wallet balances and transfer ledgers are server-authoritative and transactional. Test both sender and recipient ledgers and the shared transfer ID.
- Store purchases and payment provider interactions must use sandbox fixtures. No live charge is permitted from the test center.
- Biometric rewards require server-verified evidence. A permission prompt, camera opening, microphone opening or local device callback alone is not proof.
- Every owner mutation must require a fresh MFA-backed owner session and generate audit evidence.

## Current implementation boundary

The test catalogue, validator, existing integration suites and emulator-only identity provisioner are code artifacts. They do not imply that real device biometrics, payment-provider sandbox credentials, production account setup, or all Flutter UI journeys have been exercised. Record actual test command output and device evidence before marking a milestone complete.
