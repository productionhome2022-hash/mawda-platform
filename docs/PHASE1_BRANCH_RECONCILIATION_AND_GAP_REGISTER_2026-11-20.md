# Phase 1 — Branch reconciliation and gap register
Date: 2026-11-20
Repository: `productionhome2022-hash/mawda-platform`
Integration target: `codex/mawdda-phase1-unified-2026-11-19`
Audited target baseline: `818b004f82759426699f47193c7ef8d22b870315`
Scope: GitHub branch/ref comparisons and source/PR metadata review. No 5,000-persona run, external test, production deployment, Firebase production mutation, billing, or main merge was performed.

## 1. Reconciliation rule

The integration branch is the only working destination for accepted Phase 1 changes. A branch name or green historical workflow is not proof that its unique commits are already included. Each source is classified by its merge-base comparison against the integration target. Diverged branches must be reviewed file-by-file and selectively ported; never merge a stale branch wholesale, especially where `functions/src/index.ts`, Firestore/Storage rules, workflows, package manifests, or canonical models overlap.

## 2. Branch comparison findings

### Already behind / no unique commits relative to the integration target

The following refs compare as `behind` with zero commits ahead and no unique file delta at the audit baseline. They do not need to be merged again:

- `archive/development-pre-unification-2026-11-15`
- `archive/main-pre-unification-2026-11-15`
- `codex/mawda-full-platform-implementation` (the older development baseline; integration candidate is 71 commits ahead)
- `codex/phase1-advertising-callable-auth-2026-11-20`
- `codex/phase1-integration-batch-01-inventory-2026-11-19`
- `codex/production-readiness-tests`
- `codex/mawdda-deep-audit-profile-store`
- `codex/mawdda-mfa-signin`
- `codex/mawdda-native-platform-scaffold`
- `codex/mawdda-premium-features`
- `codex/mawdda-safety-ui`
- `codex/mawdda-audit-archive-full`
- `codex/mawdda-unified-final-v2`
- `codex/mawdda-unified-final-v3`

These are not deleted or rewritten. Archive refs remain historical evidence.

### Small isolated deltas requiring separate review

| Branch | Unique delta vs integration target | Classification / action |
|---|---|---|
| `codex/phase1-specialist-callable-auth-2026-11-20` | One new security audit document | Draft PR #71; exact-head Validate and Domain Regression were started. Keep pending completion, then merge document only if checks pass. No delegated permission activation. |
| `codex/phase1-branch-governance-audit-2026-11-20` | One governance audit document | Historical document is already represented by merged PR #63 / commit `5b7179978ebf6ac9acd0ad558a4aed306bab45f0`; do not duplicate. |
| `codex/phase1-ci-evidence-2026-11-20` | One integration status document | Compare content/date against current tracker before porting; avoid overwriting newer evidence. |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | One authorization inventory document | Useful evidence but records an older candidate SHA; reconcile with the newer PR #71 audit before importing. |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | One scanner unit-test file | Inspect exact diff and current tests; do not cherry-pick until duplicate assertions and current scanner API are checked. |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | One store-gifting integration test file | Overlaps merged PR #67; verify whether the new assertions are already in the unified file before considering any port. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | One store-gifting integration test file | Overlaps merged PR #64; no blind merge. |
| `codex/phase1-store-gift-concurrency-2026-11-20` | Workflow plus store-gifting integration test | Concurrency coverage/workflow wiring is already present in the integration history; compare exact assertions before any further port. |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | Group-call helper and unit test | Already delivered by merged PR #65 / commit `bfe1eac2bec7c21d7b01fb53e56aecc7a13ed9bb`; do not duplicate. |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | Featured-ad selector and unit test | Already delivered by merged PR #62; verify current target rather than remerge. |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | Media callable and integration test | Already delivered by merged PR #70; preserve its canonical account-standing checks and regression coverage. |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | Scanner callback integration test | Already delivered by merged PR #68; do not duplicate. |

### Diverged branches with substantial or overlapping implementation

These branches have unique commits but also lag the integration target. They are not safe for wholesale merges:

- Economy: `codex/mawdda-economy-selective-port-2026-11-19`, `codex/economic-phase1-closeout-2026-11-18`, `codex/economic-phase-completion-2026-11-18`, `codex/economic-phase-controlled-integration-2026-11-19`, `codex/economy-official-port-2026-11-18`, `codex/economy-recovery-2026-11-18`.
- Ads/media: `codex/featured-ads-secure-lifecycle-20261118`, `codex/featured-ads-serving-foundation`, `codex/mawda-phase2-hardening`.
- Governance/roles: `codex/governance-biometric-integration-2026-11-19`, `codex/mawda-unified-constitution-vision-2026-11-19`, `codex/mawdda-role-capacity-after-retention-2026-11-19`, `codex/mawdda-role-capacity-consolidation-2026-11-19`, `codex/mawdda-role-capacity-final-2026-11-19`, `codex/mawdda-step1-role-reconcile-2026-11-19`, `codex/structural-governance-biometric-roles-2026-11-19`.
- Chat/profile/rooms: `codex/mawdda-member-inbox`, `codex/mawdda-member-inbox-rebased`, `codex/mawdda-room-audio-duration-enforcement`, `codex/mawdda-room-events`, `codex/mawdda-premium-effects`.
- Store/entitlements: `codex/mawdda-store-entitlement-coverage`, `codex/mawdda-store-entitlement-hardening`, `codex/mawdda-store-entitlement-hardening-v2`, `codex/mawdda-store-wallet-entitlement-closure`.
- Audit archive: `codex/mawdda-audit-archive`.
- Older unified candidates: `codex/mawdda-unified-final`, `codex/mawdda-unified-release`, `codex/mawdda-unified-test-2026-11-18`, `codex/mawdda-final-archive-v2`.

The largest collision hotspots are `functions/src/index.ts`, `functions/test/integration/media-callables.integration.test.js`, `functions/test/integration/wallet-store.integration.test.js`, `firestore.rules`, `storage.rules`, `.github/workflows/validate.yml`, and the approved-decision/traceability documents. Port only a self-contained behavior with its tests, then run the affected GitHub Actions workflows.

## 3. Changes already integrated into the unified line

The current branch history and PR conversation record these selective changes as merged into the unified candidate:

- PR #63: read-only GitHub branch governance audit (commit `5b7179978ebf6ac9acd0ad558a4aed306bab45f0`); no branch protection/ruleset was changed.
- PR #64: store-gift catalog version/price/SKU fail-closed regressions (commit `b691d13dc5d74ab185f46e76bedd9c42d52cfa74`).
- PR #65: group-call pure helper remainder assigned to initiator (commit `bfe1eac2bec7c21d7b01fb53e56aecc7a13ed9bb`); full server lifecycle remains open.
- PR #67: permanent entitlement and recipient eligibility tests (commit `b4546e69543b70a08b4e50c678316ac848c70c06`).
- PR #68: scanner callback replay idempotency regression (commit `87ff3963868a4431948274695c83dce255aaa350`).
- PR #70: canonical account-standing checks and direct-media delivery denials (head `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e`).

The merge records are evidence of prior selective integration, not proof that every later branch variant is redundant. Always compare the actual current file before porting.

## 4. Active gap register — do not close without evidence

| Priority | Gap / issue | Current evidence boundary | Closure evidence required |
|---|---|---|---|
| P0 | #48 specialized-role authorization | Permission evaluator exists but is not wired to protected callable operations; current sensitive administration remains Owner-only | Owner-approved permission/resource assignment matrix; server-derived scope; callable Emulator allow/deny matrix for owner, assigned scope, wrong scope, expired, suspended, revoked, missing and cross-family grants |
| P0 | #49 secure media lifecycle | Some authorization, scanner replay, legal-hold and deletion-race regressions have been merged; full scanner/generation/download/retention lifecycle remains open | Exact callable + Firestore/Storage Emulator lifecycle tests, generation pinning, signed URL revocation/expiry, idempotent callback/replay, late derivative tombstone, legal hold, deletion races |
| P0 | #23 group-call lifecycle | Initiator rounding helper and private rented-room admission gate exist; complete join/approval/entitlement/metering/atomic wallet settlement is not complete | Server-authoritative lifecycle and concurrency/idempotency Emulator tests against approved policy |
| P0 | #66 direct-call paid economy | Signaling/quota/connection timeout exists; owner-controlled pricing/entitlement, per-party consent, connected-time metering and wallet settlement remain open | Approved unresolved pricing/reservation/rounding decisions, then transactional backend and Emulator tests |
| P1 | #51 branch governance | Read-only audit merged; main reported unprotected/empty rulesets and integration could not verify required branch protection settings | Owner approval, verified exact check names on base, then least-privilege ruleset/protection review; do not change settings without approval |
| P1 | #52 selective source-branch extraction | Branch comparison reveals many divergent unique commits; no wholesale merge is safe | File-by-file provenance matrix, duplicate/conflict resolution, selective PRs and exact-head CI |
| P1 | #4/#5 live infrastructure and acceptance | Non-production scanner/GCS, audit export and live retention approval remain external acceptance gates | Owner-approved non-production infrastructure, security review and explicitly authorized live acceptance; no production mutation by this register |
| P1 | #19 web App Check | App Check wiring to approved web portal remains open | Emulator and authorized non-production verification before enforcement |
| P1 | #20 room rental cancellation/refund policy | Policy decision remains open | Owner-approved cancellation/refund rules before implementation |
| P1 | #69 logo source | One approved cross-platform logo source remains open | Owner approval of asset and verification across Android/iOS/PWA |
| P1 | PR #47 Step 1/14 | Draft integration review surface; source reconciliation and P0 gates remain open | Exact-head Validate + Domain Regression, issue closure evidence, branch reconciliation and owner acceptance |

## 5. GitHub-only verification policy for this work

Allowed now: GitHub Actions workflows already present in the repository, source/diff review, unit tests, Flutter analysis/tests, Functions compile/unit tests, Firestore/Storage Emulator tests, scanner container tests and rules tests, provided they do not target production.

Explicitly excluded by this work order: the 5,000-persona simulation and all external/manual/device/live-production testing. Do not trigger the simulation lab until a later explicit phase. Do not ask the owner to run tests outside GitHub Actions.

For each accepted source change, record:
- source branch and source SHA;
- target branch and target SHA before/after;
- exact files and reason for inclusion;
- overlapping files reviewed and conflict resolution;
- test workflow/run IDs and final conclusions;
- remaining gaps and issue links.

## 6. Acceptance state

This is a reconciliation checkpoint, not a completion certificate. The target branch remains the Phase 1 integration line. Divergent branches remain available for selective extraction. No main merge, production deployment, Firebase production mutation, billing activation, live retention change, signing identity change, or 5,000-persona simulation is authorized or performed by this record.
