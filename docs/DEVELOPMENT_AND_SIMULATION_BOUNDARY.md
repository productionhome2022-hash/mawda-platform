# Mawdda Development and Simulation Boundary

## Primary repository: Mawdda Platform 2026

Repository: productionhome2022-hash/mawda-platform

The primary repository is the sole source of truth for the product. It contains the Flutter application, backend and Cloud Functions, Firebase rules and configuration, owner controls, economy, store, wallet, rooms, messaging, media, calls, security, product documentation, and all ordinary engineering tests.

The primary CI pipeline is build-and-test only:
- Flutter analysis, unit/widget tests and Web build.
- Cloud Functions compilation and unit tests.
- Firebase Emulator integration and rules tests.
- Local scanner tests and container image verification.
- Android/iOS native build validation.

No workflow in the primary repository may deploy Firebase Hosting, Cloud Functions, a scanner, or modify live infrastructure. Production deployment is not authorized. Any future change to this boundary requires a separate explicit owner decision.

## Separate repository: Mawdda 5000 Simulation Lab

Repository: productionhome2022-hash/mawdda-5000-simulation-lab (private)

The separate repository contains only the large-scale synthetic-persona harness:
- 5,000 synthetic persona fixture generator.
- Cohort/concurrency orchestration.
- Large-scale lifecycle and load scenarios.
- Machine-readable simulation reports and run workflow.

The lab checks out a specific branch, tag or immutable commit of the primary repository, installs its locked dependencies, compiles its real Cloud Functions and imports those compiled functions. It does not duplicate product business logic. Every run must record the exact platform revision and lab revision.

## What remains in the primary repository

All ordinary engineering and product verification remains in the primary repository:
- Flutter unit/widget tests and static analysis.
- Backend unit tests.
- Deterministic Firebase Emulator integration and security-rules tests.
- Media scanner/security tests.
- Small synthetic persona interaction tests.
- Normal build validation and native Android/iOS build checks.

Only the dedicated 5,000-persona simulation is external. Do not move source code, business rules, shared contracts, wallet logic, room logic, profile logic, or ordinary test suites into the lab.

## Isolation and safety requirements

- Synthetic identities and synthetic data only; reserved test email domain.
- Firebase Auth and Firestore Emulator only for the current load harness.
- Fixed demo project ID; no production project, production credentials, real payment provider, live push delivery or production Storage bucket.
- No production deployment or live Firebase mutation.
- No real member data, production secrets, service-account keys or payment secrets in the lab.
- Generated fixtures and reports are ignored by Git and retained only as short-lived workflow artifacts.
- No test may issue real money, charge a payment instrument, or send a real member notification.
- Each run must record the primary repository commit SHA, simulator commit SHA, configuration, cohort sizes and result artifact.
- A successful emulator simulation is not proof of production capacity, physical-device acceptance, live GCS/Cloud Run readiness, or release authorization.

## Extraction status

The private lab repository has been created and contains:
- README and isolation/run documentation.
- A manual workflow that checks out the exact primary repository revision.
- The 5,000-persona fixture generator.
- The large-scale integration harness.
- A syntax/safety validation workflow.

The latest lab validation workflow passed on commit bb19a83b431411beba1f280324938c6103ab96df (run 43667179459). This verifies JavaScript/shell syntax, workflow YAML parsing and the deployment-command safety scan only. It does **not** mean the 5,000-persona simulation itself has been executed. The manual load workflow still requires a controlled run against a selected immutable platform commit.

Because both repositories are private, the lab workflow also requires a fine-grained token stored only as the lab repository Actions secret MAWDDA_PLATFORM_READ_TOKEN, with Contents: read access to the primary repository. This secret has not been provisioned by this workflow and must never be committed or pasted into chat.

The primary repository's old copy of the 5,000-persona generator/test and its package script must remain until the lab harness has completed a real successful run and a follow-up comparison proves that no required primary CI coverage was lost. Then remove only the large-scale harness files and package script from the primary development branch; keep ordinary persona integration tests in the primary repository.

## Consolidation gate

Do not merge the primary development branch into main until:
1. The lab's 5,000-persona workflow has run successfully against an exact platform commit.
2. The lab report confirms required persona coverage and no cross-environment leakage.
3. The old primary load harness is removed only after successful transfer and comparison.
4. Primary CI remains green on the exact resulting PR head.
5. The comprehensive vision, constitution, decision register and implementation traceability agree.


## Owner governance override — absolute 5,000-persona exclusion (2026-11-21)

The owner reconfirmed this prohibition repeatedly today (owner-reported: more than twenty repetitions since 00:00) and stated that it had already been documented in the documentation/governance section. This explicit owner decision overrides any older workflow definition or inherited CI behavior:

- The 5,000-persona simulation and its large-scale lifecycle/load scenarios MUST NOT run, be invoked, scheduled, or be included in any workflow, job, step, reusable workflow, composite action, script, package command, test suite, build, or automated check in productionhome2022-hash/mawda-platform.
- The only repository boundary for the large-scale harness remains productionhome2022-hash/mawdda-5000-simulation-lab. This decision does not authorize running or modifying that lab; separate explicit owner instruction is required.
- Ordinary deterministic product unit, integration, security, and build tests remain in the primary repository only when they do not invoke the 5,000-persona harness or large-scale simulation.
- Compliance must be checked by static inspection only. Never run the simulation to verify compliance. A historical successful run does not authorize future runs.
- Any exception or amendment requires a separate explicit owner approval.

This governance entry records the owner's statement that the prohibition was repeated more than twenty times today; that count is attributed to the owner and is not represented as an independently audited message count.


## Current compliance record — GOV-SIM-5000-001 (2026-11-21)

Static inspection at platform HEAD `81a0ade1086fddbcb11490d5348b6eadb428587d` found a residual `test:persona-load` package command that generated 5,000 fixtures and invoked the large-scale emulator test. It was removed from `functions/package.json`; the associated generator `functions/scripts/generate-persona-load-fixtures.cjs` and test `functions/test/integration/persona-load.integration.test.js` were removed from this repository. Ordinary deterministic persona interaction (`test:seeded-persona-interaction`) is separate and remains in product CI; it is not the 5,000-persona harness. No simulation was run to verify this change. Static re-scan and exact-HEAD CI remain required.
