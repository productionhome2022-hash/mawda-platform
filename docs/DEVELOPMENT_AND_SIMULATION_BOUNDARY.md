# Mawdda Development and Simulation Boundary

## Primary repository: Mawdda Platform 2026

The primary repository is the single source of truth for the product. It contains the Flutter application, backend and Cloud Functions, Firebase rules and configuration, owner controls, economy, store, wallet, rooms, messaging, media, calls, security, documentation, and all ordinary engineering tests.

The primary CI pipeline is limited to build-and-test work:
- Flutter analysis, unit/widget tests, and web build.
- Cloud Functions compilation and unit tests.
- Firebase Emulator integration and rules tests.
- Local scanner tests and container image verification.
- Android/iOS native build validation.

No workflow in the primary repository may deploy to Firebase Hosting, deploy Cloud Functions, deploy a scanner, or perform live non-production infrastructure changes unless that policy is explicitly revised and approved later.

## Separate project: Mawdda 5000 Simulation Lab

The only component that belongs outside the primary repository is the large-scale synthetic-persona simulation environment. Its separate repository is intended to contain:
- The 5,000 synthetic persona generator and profiles.
- Cohort and concurrency orchestration.
- Long-running lifecycle and behavioral scenarios.
- Large-scale load and stress tests.
- Simulation reports, metrics, and reproducible run manifests.

The simulator must test a specific, immutable primary-repository commit through documented test interfaces and isolated Firebase Emulator projects. It must not maintain a second implementation of product rules or duplicate backend business logic.

## Isolation and safety requirements

- Use synthetic identities and data only.
- Use Firebase Emulator or a separately isolated non-production test environment.
- Never store production credentials, production user data, or real payment secrets in the lab.
- No real coin purchases, wallet transfers, or paid transactions may occur in a simulation.
- Every run records the primary repository commit SHA, simulator commit SHA, configuration, cohort sizes, and result artifacts.
- The lab cannot deploy or mutate production.
- Small, deterministic integration tests that validate ordinary product behavior remain in the primary repository. Only the dedicated 5,000-persona load/lifecycle simulation is external.

## Extraction status

The core CI workflow no longer invokes the 5,000-persona load job. The generator and large-scale simulation test sources are being preserved temporarily in the development branch until a separate GitHub repository is available and the files can be transferred and verified. They must not be deleted before that transfer is confirmed.

The primary repository is not ready for final consolidation into `main` until the external lab repository has been created, the simulation assets have been transferred, and the primary CI checks for the resulting commit have completed successfully.
