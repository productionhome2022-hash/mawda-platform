# Phase 1 — Integration inventory and conflict map

**Audit date:** 2026-11-19  
**Baseline branch:** `codex/mawda-full-platform-implementation`  
**Baseline SHA:** `946ead61208f5007299802c5293f31c329b7c2d2`  
**Scope:** read-only inventory and integration sequencing. This document does not merge source branches, activate production resources, or certify feature completion.

## Verified pull-request relationships

| PR | Head branch | Base branch | Current state at audit | Scope |
|---|---|---|---|---|
| #35 | `codex/mawdda-retention-approval-ci-repair-2026-11-19` | official development | open draft; mergeable=false; dirty | retention 30-day confirmation, workflow triggers, store catalog versioning and regression fixtures |
| #38 | `codex/mawdda-role-capacity-final-2026-11-19` | PR #35 head branch | open draft; mergeable=true; clean against its immediate base | specialized five-seat role capacity, role identity validation and integration coverage |
| #39 | `codex/economic-phase-controlled-integration-2026-11-19` | official development | open draft; mergeable=false; dirty | economic phase execution plan, legal governance audit, decision and traceability documentation |
| #31 | `codex/economic-phase-completion-2026-11-18` | official development | open draft | broad economic engine and UI integration proposal |
| #30 | `codex/economy-official-port-2026-11-18` | official development | open draft | manual coin purchase and wallet replay hardening |
| #33 | `codex/governance-biometric-integration-2026-11-19` | official development | open draft | biometric verification, role identities, Firestore/Storage rules and related UI/tests |
| #40 | `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | official development | open draft | canonical role terminology and governance documentation |

PR metadata and changed-file lists were read from GitHub API during this audit. Mergeability is time-sensitive and must be refreshed before any merge.

## Confirmed overlap map

### PR #35 ↔ PR #38

Both modify:
- `.github/workflows/mawdda-domain-regression.yml`
- `.github/workflows/validate.yml`
- `docs/IMPLEMENTATION_TRACEABILITY.md`
- `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`
- `functions/src/index.ts`
- `functions/test/integration/featured-ad-finance.integration.test.js`
- `functions/test/integration/premium-profile.integration.test.js`

**Decision:** preserve the dependency order (#35 baseline, then #38), but do not merge either yet. Review the combined final contents of the shared files and verify both PR heads are still based on the expected SHAs. PR #38 being clean against PR #35 does not make it independently mergeable against the official branch.

### PR #31 ↔ PR #30

Both modify:
- `functions/src/coin-purchase-requests.ts`
- `functions/src/index.ts`
- `functions/test/coin-purchase-requests.test.js`
- `functions/test/integration/wallet-store.integration.test.js`
- `lib/screens/coin_purchase_screen.dart`
- `lib/screens/owner_coin_purchase_screen.dart`

**Decision:** do not port either branch wholesale. Treat PR #30 as a candidate focused hardening delta; extract its unique changes only after comparing the exact patch against PR #31 and the official branch. The shared wallet and callable code requires one combined review and emulator tests.

### Economic branch breadth

PR #31 changes 45 files, including a 1,697-line addition/193-line deletion change in `functions/src/index.ts`, payment policy, pricing, wallet reconciliation, gifting, featured-ad finance, room/call policy, group-call economy, Firestore indexes, Flutter screens and integration tests.

The branch comparison against the official development branch reported 181 commits ahead and 176 behind at audit time. This divergence is a hard stop against wholesale merge. In particular, group-call charging must remain fail-closed until trusted usage evidence, participant lifecycle accounting, atomic settlement, entitlements, architecture/cost/security review and acceptance tests exist.

### Governance overlap

PR #33 and PR #40 both touch:
- `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`
- `docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md`

PR #33 additionally changes `functions/src/index.ts`, `firestore.rules`, `storage.rules`, role identity and biometric services/tests. PR #40 is documentation-focused. Reconcile the canonical terminology first, then review role authorization and rules as one security boundary. Do not infer any role grants from UI visibility.

## Workflow evidence at baseline

For baseline SHA `946ead61208f5007299802c5293f31c329b7c2d2`, the latest observed runs were:
- Validate Mawda: run 44536273825 — completed successfully.
- Mawdda domain regression: run 44536273794 — completed successfully.
- PR #2 validation: run 44536277144 — completed successfully.

The Validate run's three reported jobs passed: ClamAV scanner gateway tests/image build; Flutter analysis, tests and web build; Cloud Functions compile and unit tests.

These results apply only to the baseline SHA. They do not certify PR #35, #38, #31, #30, #33, #39 or #40. A separate CodeQL result was not established by these workflow jobs and must be inspected independently before the phase gate is closed.

## Small-batch integration sequence

1. **Batch A — retention baseline:** reconcile PR #35 shared workflow/docs/backend/test files against the current official branch; resolve conflicts explicitly; run exact-head workflows.
2. **Batch B — role capacity:** rebase/reconstruct PR #38 on the accepted Batch A head; inspect all shared files; test role identity, five-seat limits, revocation behavior and Firestore/Storage rules.
3. **Batch C — economy primitives:** compare PR #30 and #31 per function and test; port isolated coin purchase/payment-policy changes before broader store, gifting, featured ads and wallet reconciliation.
4. **Batch D — economic surfaces:** add Flutter screens and indexes only after backend contracts and idempotency tests pass.
5. **Batch E — governance and privacy:** reconcile PR #33 with #40 and the approved legal-document access policy; test server-side authorization, not merely UI hiding.
6. **Batch F — integration gate:** run all relevant GitHub workflows on the exact consolidated SHA; inspect CodeQL, dependency and secret scanning, rules tests, emulator tests and Flutter checks. Do not run the 5,000-person simulation in this phase.

## Non-negotiable safety gates

- No merge to `main`, deployment, production Firebase mutation, paid-service activation, or live deletion-policy activation.
- No bulk merge of divergent branches.
- No use of passing baseline CI as evidence that unmerged PRs pass.
- No production prices or entitlements inferred from test fixtures.
- Keep group-call economy disabled/fail-closed until its P0 evidence gates are closed.
- Preserve branch history and source attribution for every ported batch.


## Mandatory duplicate/similar-file deep-review gate (owner-approved instruction, 2026-11-19)

This gate applies to every candidate duplicate or similar file across all project branches and pull requests. Similar filenames or paths are discovery signals only; they are never proof of equivalent content.

Before consolidating, moving, deleting, renaming, or selecting a canonical copy:

1. Retrieve the complete contents of every candidate at the exact branch/commit SHA. Do not rely solely on PR summaries, changed-line excerpts, filenames, or hashes.
2. Compare the full files, including declarations, exported/public APIs, data models, business rules, validation, error handling, comments that encode decisions, configuration, and generated-code boundaries.
3. Trace imports, callers, runtime registration, dependency injection, Firebase/Firestore/Storage rules, indexes, workflows, build scripts, and platform-specific references.
4. Compare tests and fixtures, including positive, negative, boundary, concurrency, replay/idempotency, authorization, migration and rollback cases.
5. Inspect each file's branch provenance and commit history to identify unique changes, intended ownership, and whether either copy contains later approved decisions.
6. Produce a semantic comparison: identical portions, non-identical portions, unique behavior, risk, references that must be updated, and the proposed canonical destination under the approved integration plan.
7. If fully identical in content and behavior, preserve the canonical path selected by the integration plan, update and verify every reference, and remove the redundant copy only in the same reviewed batch after confirming no active references remain.
8. If not identical, do not discard either version. Reconcile unique changes into the canonical destination, preserve source attribution, add or update regression tests, and retain the original branch history.
9. Run targeted tests and the relevant repository workflows against the exact resulting commit SHA. A successful check on another branch or older SHA is not evidence for this batch.
10. Record the comparison outcome and reviewer decision in the PR before the consolidation is eligible for merge.

**Safety rule:** no file is moved or deleted merely because it appears duplicated. When equivalence, ownership, references, or behavior is uncertain, preserve both and escalate the conflict for review. This gate does not authorize merging to `main`, production changes, or destructive production operations.


## Follow-up parallel audit — exact changed-path intersections (19 November 2026)

The following PR heads and changed-file lists were re-read from GitHub during the follow-up audit:

| PR | Head SHA | Changed files | Workflow runs found for head | Combined status entries |
|---|---|---:|---:|---:|
| #30 | `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c` | 9 | 0 | 0 |
| #31 | `0914885232ff8bcfb64536c6655e7bff01b78361` | 45 | 0 | 0 |
| #33 | `619eab643e2d5849b3b2c055461d53ba2be01753` | 39 | 0 | 0 |
| #35 | `6fb0091d2d8e59e48e58fbf7ce6d414e87e2d8f2` | 10 | 0 | 0 |
| #38 | `a54737916c09cb92ef8d5ec97bd559b496bbf7c0` | 13 | 0 | 0 |
| #39 | `beec6e424ccdb1f1df24d44b2893212983508f7e` | 8 | 0 | 0 |
| #40 | `64ccc7b20445e7be15d6ec4d0be0e329f0250f11` | 4 | 0 | 0 |
| #41 | `8c3025ff1eb4486d49c5388957c29697372b0682` | 1 | 0 | 0 |

**Interpretation:** these connector queries returned no PR-triggered workflow runs and no combined status entries for the listed exact heads. This is not a successful test result; exact-head CI evidence is absent in this observation. Baseline workflow success above remains limited to the baseline SHA.

### Newly computed changed-path intersections

| PR pair | Shared changed paths |
|---|---|
| #30 ↔ #31 | `functions/src/coin-purchase-requests.ts`, `functions/src/index.ts`, `functions/test/coin-purchase-requests.test.js`, `functions/test/integration/wallet-store.integration.test.js`, `lib/screens/coin_purchase_screen.dart`, `lib/screens/owner_coin_purchase_screen.dart` |
| #30 ↔ #33 | `functions/src/index.ts` |
| #31 ↔ #33 | `functions/src/index.ts`, `lib/screens/super_admin_screen.dart` |
| #33 ↔ #39 | `docs/IMPLEMENTATION_TRACEABILITY.md`, `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md` |
| #33 ↔ #40 | `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`, `docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md` |
| #39 ↔ #40 | `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md` |

These are path intersections only, not proof of duplicate content or semantic equivalence. The mandatory deep-review gate above still requires complete exact-SHA content retrieval, reference tracing and tests before any file consolidation.

### Updated execution decisions

1. **Economic path:** #30 is a focused candidate, while #31 is a broad 45-file proposal. Keep both unmerged. Review the six shared paths as one combined change set, then isolate #30's unique wallet/payment hardening only if its contracts and tests remain compatible with the selected #31/base implementation.
2. **Governance path:** #33, #39 and #40 converge on decision/traceability documentation. Reconcile owner-approved role terminology and legal-document access policy in documentation first; then inspect #33's backend authorization and Firestore/Storage rules as a single security boundary.
3. **Cross-domain code:** #30/#33 and #31/#33 both intersect at `functions/src/index.ts`; no whole-file replacement is permitted. Extract function-level deltas and validate exports, callable registration, authorization and tests.
4. **Workflow gate:** no exact-head Actions evidence was returned for these PR heads in this audit. Do not infer that workflows ran or passed. Investigate trigger/branch filters and repository Actions availability before considering a rerun or manual dispatch.
5. **Mergeability:** #40 was reported mergeable at the metadata snapshot, but it has no exact-head status evidence here and remains a draft. Mergeability alone is not approval or a test pass.

**Current phase status:** Step 1 remains open. No source PR was merged, no file was deleted or moved, no production resource was changed, and the 5,000-person simulation remains deferred.


### Workflow trigger inspection — root cause of missing PR check visibility

The workflow YAML was fetched from the exact #35 and #38 heads.

- Both `validate.yml` and `mawdda-domain-regression.yml` use **push** branch filters plus `workflow_dispatch`; they do not declare a `pull_request` trigger.
- The #35 workflow revision includes push filters for the official development branch, the governance branch (#33), and the retention branch (#35).
- The #38 workflow revision additionally includes the role-capacity branch (#38).
- The inspected revisions do not include branch filters for #30, #31, #39 or #40. Therefore those branch pushes are not covered by these two workflow definitions as inspected.
- The commit-workflow-runs connector query is explicitly limited to pull-request-triggered runs. Its empty result cannot be used to conclude that no push-triggered run exists. The combined status query returned no status entries for the inspected heads, so no exact-head pass/fail evidence was available from that endpoint either.

**Required workflow repair:** consolidate workflow trigger coverage for the approved development branches without adding unsafe production triggers. Prefer a controlled `pull_request` trigger targeting the official development branch (with least-privilege permissions and path filters where appropriate), or explicitly include the intended source branches in push filters. Then query the actual branch runs and inspect each job result on the exact SHA. Do not dispatch or rerun workflows until the repository's available Actions controls and exact run IDs are verified.


## Batch A — focused boundary correction in PR #35

A targeted review of the complete `setStoreCatalogItem` transaction found that the previous version was checked with `Number.isSafeInteger`, but the increment result was not protected. At `Number.MAX_SAFE_INTEGER`, adding one would produce an unsafe integer and persist an invalid next version.

**Correction committed to the existing PR #35 branch (not merged):**
- Reject catalog updates when the previous version is invalid, negative, or already at/above `Number.MAX_SAFE_INTEGER`.
- Add an emulator integration test that seeds the maximum safe version, expects `failed-precondition`, and verifies the stored version remains unchanged.
- Source commit: `15f14733eb71aafbdae0c97a966906efd3d22826`.
- Test commit / current observed PR #35 head: `179ba95fa582082c7ed32c3f3016b899b414b0ca`.

**Verification:** GitHub read-back confirmed the guard is present at the branch head and the PR head advanced to the test commit. The combined status endpoint returned no check entries for that SHA. The test has been added but has **not** been executed in this environment; do not mark it passed until the branch's push-triggered Actions run is inspected.
