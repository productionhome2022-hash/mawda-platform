# Mawdda launch readiness — free-first execution plan

**Repository:** productionhome2022-hash/mawda-platform  
**Development branch:** codex/mawda-full-platform-implementation  
**Production Firebase project:** mawda-app-2026 (697303475139)  
**Non-production Firebase project:** mawda-platform-nonprod-2026  
**Status:** Execution baseline; not a launch approval or deployment record.

## Operating objective

Launch the parts of Mawdda that can safely operate on currently available no-cost tiers. Complete and test the remaining implementation even where a provider requires billing, so billing activation is a final provider gate rather than a software-development dependency.

Every capability must be reported in exactly one of these states:

1. FREE_ACTIVE — provider configuration and a real non-destructive smoke test prove it works on the current free tier.
2. CODE_READY_BILLING_GATE — code, rules, tests, deployment configuration and rollback plan are complete; provider billing is the only remaining gate.
3. OWNER_SETUP_REQUIRED — owner-only account, domain, secret, signing key, payment or consent setup remains.
4. IMPLEMENTATION_REQUIRED — code or tests are incomplete.
5. BLOCKED — a documented external dependency or policy decision prevents completion.

Do not label a capability production-ready based only on source files, CI success, emulator success, a registered app, or an existing bucket.

## Environment separation

- Development and automated tests use the non-production Firebase project or isolated demo-* emulator project IDs.
- Production builds must explicitly select MAWDA_FIREBASE_ENV=production.
- Never infer production from a missing environment variable. The safe default remains non-production.
- Never use production member, wallet, message, media, retention, or payment data in integration tests.
- Destructive tests must refuse production project IDs and production buckets.
- Release artifacts must be tied to an immutable Git SHA and verified against the established Android signing identity.
- No workflow in this plan may merge to main, deploy production, alter production data, enable billing, or modify the protected iOS identity without separate owner approval.

## Provider and capability workstreams

### A. GitHub source of truth and delivery

- Keep all implementation on codex/mawda-full-platform-implementation.
- Require locked dependencies, Flutter analysis/tests, Functions compile/unit/integration tests, rules tests, scanner tests and artifact evidence.
- Add deployment workflows only after identifying exact project targets, least-privilege identities, required secrets, protected environments and rollback behavior.
- Build outputs and test reports must include the source SHA.
- Production deploy jobs must be manually gated and protected; never run on ordinary pushes.

**Current evidence:** the repository and development branch are accessible through the GitHub integration. Existing validation workflow builds Flutter web and tests Functions and emulator-backed integrations. That is CI evidence only, not proof of a successful current run or production deployment.

### B. Firebase Spark-compatible production capabilities

Inventory and verify actual state for Authentication, App Check, Firestore, Hosting, FCM, Crashlytics, Performance Monitoring, Remote Config and any other relevant no-cost services. Enable/configure only after checking the target project, current provider limits, data exposure and required security controls.

For each service, record exact project/app identity, provider configuration state, security/rules state, quota and operational limits, smoke-test result and timestamp, and fallback/degraded behavior when quota or provider service is unavailable.

### C. Firebase Storage

The repository currently defines Storage in firebase.json, but storage.rules denies all reads and writes. This is fail-closed and must not be weakened to make uploads appear to work.

Complete the full media lifecycle:
- authenticated server-authorized upload intent;
- entitlement/quota check on every operation;
- strict MIME, byte-size, duration, frame-count and content validation;
- quarantine/scanning and safe derivative generation;
- short-lived, scoped read/write URLs where appropriate;
- owner/member authorization and audit events;
- cleanup, legal hold and generation-aware permanent deletion;
- tests for replay, oversized content, unauthorized access, retention and deletion.

Firebase Storage deployment/usage on a free-only Firebase project is a provider billing gate. Before any billing activation, the code and emulator/isolated non-production tests must be complete. A bucket name or Admin SDK configuration is not proof of usable client Storage.

### D. Firebase Cloud Functions

The repository contains a Node 22 Functions codebase, TypeScript build and a broad emulator/integration test suite. Complete all source-level, security, idempotency, transaction, scheduler, secrets and failure-path checks.

Firebase Functions deployment is a provider billing gate. Until an owner-approved billing decision:
- compile and test in CI and emulators;
- prepare and validate deployment manifests and required secrets;
- do not deploy to production;
- evaluate a free-tier Cloudflare Worker alternative only for endpoints whose semantics, security and operational requirements fit Workers. Do not blindly port Firebase Admin operations or replace transactional Firestore authority.

### E. Cloudflare

Create a dedicated Cloudflare workstream for Pages, Workers, R2, D1, KV, DNS, custom domains, TLS, WAF/rate limits and observability as applicable.

Before implementation or DNS changes, inspect the actual account, zones, existing resources, plan limits, ownership and current records. Use least-privilege API tokens stored only in GitHub/Cloudflare secret stores. Never ask the owner to paste tokens into chat.

Candidate allocation (subject to architecture and plan verification):
- Pages: static web delivery if it does not conflict with Firebase Hosting or authentication routing.
- Workers: edge APIs and lightweight orchestration only where appropriate.
- R2: media object storage if the required lifecycle, signed access, scanning, deletion and legal constraints can be met.
- D1/KV: non-authoritative edge metadata/cache only unless a reviewed design explicitly proves transactional and consistency requirements.
- DNS/TLS/WAF: change only after zone ownership, current records, rollback and domain impact are verified.

Do not create duplicate authoritative data stores or move wallet, entitlement, payment, member identity or message authority to edge storage without a reviewed migration design.

### F. Mobile and release

- Preserve Android package com.mawdda.platform.app and the established signing certificate.
- Preserve iOS bundle ID com.mawdda.platform.app and its Firebase registration.
- Build release APK/AAB only with owner-provisioned signing material in protected CI secrets.
- Verify package identity, Firebase environment, signatures, checksums, malware scan and artifact metadata.
- Distinguish successful build from installation, real-device acceptance and store approval.

## Required launch gates

A release candidate is not accepted until all applicable items have evidence:

- source SHA and clean branch state;
- Flutter analyze/tests and web build;
- Functions compile, unit and integration tests;
- Firestore and Storage rules tests;
- auth, App Check and FCM smoke tests;
- media upload/download/scanning/retention tests where provider access is available;
- wallet/store/room/advertising/call security and idempotency tests;
- PWA privacy/cache review;
- Android signed APK/AAB verification;
- iOS identity/configuration review and device acceptance;
- performance, concurrency and failure-path evidence;
- 5,000-persona simulation report with actual completed operations, duration, failures and SHA (fixtures alone do not count);
- backup/restore and incident/rollback runbooks;
- explicit owner approval for production deployment and any billing activation.

## Cost and safety gates

- No billing account activation, Blaze upgrade, paid resource, paid plan or purchase is performed by automation.
- Prepare a cost estimate and service-specific budget/alert configuration before owner activation; budgets are alerts, not guaranteed spending caps.
- Do not promise that a provider free allowance covers all Mawdda workloads.
- Do not enable destructive retention jobs in production until the owner has approved the unresolved retention-mode selection and consent policy.
- Do not relax Firestore or Storage rules to bypass missing server functions.
- All owner-only credentials, signing keys and API tokens remain outside Git and chat.

## Initial findings from source inspection

- .firebaserc defaults to mawda-platform-nonprod-2026 and defines production as mawda-app-2026.
- lib/main.dart defaults to non-production and requires an explicit production Dart define.
- firebase.json defines Hosting, Functions, Firestore, Storage and Auth/Firestore/Storage emulator ports.
- functions/package.json targets Node 22 and defines unit, integration, rules, media, retention, wallet, room, call-signaling and persona-load test scripts.
- storage.rules currently denies all Storage reads/writes.
- firestore.rules is fail-closed for server-managed collections and only permits narrowly scoped member reads.
- Existing CI validates/builds and runs many emulator tests; it is not a production deployment pipeline.
- Cloudflare account/zone/resource connection has not yet been verified in this execution context.
- No provider billing changes, production deployments, production data changes, DNS changes, merges to main, or iOS identity changes are recorded by this plan.

## Work log

| Date (UTC) | SHA | Change | Verification | Status |
|---|---|---|---|---|
| 2026-11-17 | 23d83ce42f15b6b201a2313011b061eca423c519 | Establish free-first Mawdda launch readiness gates and service ownership boundaries | Source inspection only; no CI status reported for this documentation commit | Baseline documented; implementation remains in progress |
