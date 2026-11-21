# Mawdda Test Center — operator runbook

## Purpose

The manual **Mawdda Test Center** workflow runs the full Flutter validation and the repository's comprehensive Firebase Emulator Suite integration journeys against the exact selected development-branch commit. It is a deeper repeatable check alongside the normal per-commit validation workflow.

## Run

1. Open the repository's **Actions** tab.
2. Select **Mawdda Test Center**.
3. Choose the development branch `codex/mawda-full-platform-implementation`.
4. Select **Run workflow**.
5. Review the run's exact commit SHA and all job conclusions before using its result as evidence.

The workflow deliberately refuses to run its Flutter job against a different branch.

## What it runs

- Flutter locked dependency installation, static analysis, Flutter tests and Web release build.
- Cloud Functions TypeScript build and Node unit tests.
- Emulator-only test account seeding and the configured Auth/Firestore/Storage rules and integration journeys for messaging, guest access, media, wallet/store, rooms/events, biometric proof boundaries, email renewal, notifications, safety, retention, legal holds, audit export and premium profile entitlements.

The backend aggregator is `npm run test:all`. It uses the individual `test:*` scripts whose Firebase project IDs are fixed `demo-mawda-*` emulator projects.

## Safety boundaries

- No Firebase production or live non-production project is targeted by this workflow.
- No live payment, Cloud Run scanner, real GCS bucket, push delivery or production data is used.
- The emulator test seeder requires Auth and Firestore emulator endpoints and a `demo-mawda-` project ID. It refuses other project IDs.
- Local emulator credentials are written only to an ignored local file. They are never uploaded as artifacts or committed.
- The workflow uploads only the Web build and the synthetic persona catalogue, not local credentials.

## Separate acceptance gates

A passing Test Center run does not prove:
- the 5,000-persona lab passed against this exact platform SHA;
- live non-production GCS signed URL, Cloud Run scanner, IAM/WIF, retention or restore behavior;
- Android/iOS physical-device, camera/microphone, push or biometric acceptance;
- penetration testing, legal/privacy review, production observability or launch readiness.

Those remain separate gates in `docs/RELEASE_READINESS_CHECKLIST.md`. A passing run is evidence for its exact commit and emulator scenarios only; it is not authorization to merge, deploy, activate billing, or mutate live Firebase resources.


## GOV-SIM-5000-001 — current boundary

Any older checklist item in this runbook that asks for a 5,000-persona lab pass as a Test Center prerequisite is superseded. The primary repository's Test Center must never invoke or depend on the 5,000-persona harness. The independent lab must not be run or modified without a separate, explicit owner commission. This runbook covers only ordinary product validation and deterministic emulator integration that does not invoke the large-scale harness.
