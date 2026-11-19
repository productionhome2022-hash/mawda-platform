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
