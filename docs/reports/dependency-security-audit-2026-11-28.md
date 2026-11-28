# Dependency Security Audit Report (Phase 2)

- **Date:** 2026-11-28
- **Audit Status:** `AUDITED_NO_BREAKING_BUMPS`
- **Platform Repository:** `productionhome2022-hash/mawda-platform`
- **Target Branch:** `codex/mawda-full-platform-implementation`

## 1. Audited Manifests & Lockfiles
- **Flutter / Dart:** `pubspec.yaml` and `pubspec.lock` present; Firebase and Flutter packages locked.
- **Cloud Functions (`functions/`):** Node target `22`, `firebase-admin` (`^13.0.0`), `firebase-functions` (`^6.0.0`), `typescript` (`^5.7.2`), `firebase` (`^11.0.0`), `firebase-tools` (`^14.0.0`), `@firebase/rules-unit-testing` (`^4.0.1`), with `package-lock.json` present.
- **Media Scanner (`scanner/`):** `mawadda-private-media-scanner` (Node `22`), direct dependencies `@google-cloud/storage` (`7.16.0`) and `sharp` (`0.34.3`), no standalone `package-lock.json`.
- **Android (`android/`):** `compileSdk = 36`, `JVM_17`, Google Services and Flutter Gradle plugins configured.

## 2. Vulnerability Findings (`functions` Audit)
- **Total Reported:** 34 (`critical`: 1, `high`: 11, `moderate`: 22, `low`: 0).
- **Direct Runtime Dependencies (`dependencies`):** `firebase-admin` and `firebase-functions` appear only with `moderate` severity advisories; no `critical` or `high` advisories on runtime dependencies.
- **Dev / Emulator / Transitive Tree:** `critical` (`tar`) and `high` advisories (`firebase-tools`, `firebase`, `@firebase/rules-unit-testing`, `@grpc/grpc-js`, proxy/agent and transitive packages) are associated with dev/tooling/transitive paths and require major semver upgrades (`isSemVerMajor: true`).

## 3. Execution Controls & Next Phase
- **Merge to `main` / Deployment / Source Code Edits:** `NONE`.
- **5000-Persona Simulation:** `NOT_EXECUTED`.
- **Next Phase:** Proceed in sequence after documenting this audit report on the development branch.
