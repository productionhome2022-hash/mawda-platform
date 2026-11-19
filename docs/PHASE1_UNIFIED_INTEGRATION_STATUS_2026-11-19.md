# Mawdda Phase 1/14 — Unified integration and acceptance tracker

**Date:** 2026-11-19  
**Integration branch:** `codex/mawdda-phase1-unified-2026-11-19`  
**Source baseline:** `codex/mawda-full-platform-implementation` at `a86fc878a7f5a29d68271bf08bec041a2fb31f80`  
**Status:** OPEN — inventory and CI entry-point established; source reconciliation, remediation and exact-head acceptance remain incomplete.  
**Safety:** `main`, production Firebase, billing and paid infrastructure were not changed.

## 1. Work started and provenance

A new isolated integration branch was created from the exact current development head `a86fc878a7f5a29d68271bf08bec041a2fb31f80`. It preserves the full source ancestry; it is not based on `main` and does not replace the official development branch.

The two build/test workflows were updated on this integration branch only so pushes to this branch run:
- `.github/workflows/validate.yml` — Flutter analysis/tests/Web builds, Firebase identity checks, Functions compile/unit tests, emulator suites and scanner validation.
- `.github/workflows/mawdda-domain-regression.yml` — retention, room reservations/events, owner grants, specialized-role capacity, store gifting, call signaling, reward regression and Flutter widget tests.

Both workflows remain build/test-only. No production deployment trigger was added. They still use push/workflow_dispatch rather than pull_request; exact-head Actions run evidence must be read after the new branch commit is pushed.

## 2. Branch inventory snapshot

GitHub branch search returned 50 refs at the time of this audit:

- Archives: `archive/development-pre-unification-2026-11-15`, `archive/main-pre-unification-2026-11-15`, `codex/mawdda-audit-archive`, `codex/mawdda-audit-archive-full`, `codex/mawdda-final-archive-v2`.
- Main development baseline: `codex/mawda-full-platform-implementation`.
- Unified/phase candidates: `codex/mawda-unified-constitution-vision-2026-11-19`, `codex/mawdda-unified-final`, `codex/mawdda-unified-final-v2`, `codex/mawdda-unified-final-v3`, `codex/mawdda-unified-release`, `codex/mawdda-unified-test-2026-11-18`, `codex/phase1-integration-batch-01-inventory-2026-11-19`, `codex/mawdda-phase1-unified-2026-11-19`.
- Economy/ads: `codex/economic-phase1-closeout-2026-11-18`, `codex/economic-phase-completion-2026-11-18`, `codex/economic-phase-controlled-integration-2026-11-19`, `codex/economy-official-port-2026-11-18`, `codex/economy-recovery-2026-11-18`, `codex/mawdda-economy-selective-port-2026-11-19`, `codex/featured-ads-secure-lifecycle-20261118`, `codex/featured-ads-serving-foundation`.
- Governance/roles/biometrics: `codex/canonical-role-terminology-owner-confirmation-2026-11-19`, `codex/governance-biometric-integration-2026-11-19`, `codex/mawdda-step1-role-reconcile-2026-11-19`, `codex/mawdda-role-capacity-after-retention-2026-11-19`, `codex/mawdda-role-capacity-consolidation-2026-11-19`, `codex/mawdda-role-capacity-final-2026-11-19`, `codex/mawdda-deep-governance-audit-2026-11-19`, `codex/structural-governance-biometric-roles-2026-11-19`.
- Media/chat/rooms: `codex/mawda-phase2-hardening`, `codex/mawdda-room-audio-duration-enforcement`, `codex/mawdda-room-events`, `codex/mawdda-member-inbox`, `codex/mawdda-member-inbox-rebased`, `codex/mawdda-safety-ui`, `codex/mawdda-mfa-signin`, `codex/mawdda-native-platform-scaffold`.
- Store/entitlements: `codex/mawdda-store-entitlement-coverage`, `codex/mawdda-store-entitlement-hardening`, `codex/mawdda-store-entitlement-hardening-v2`, `codex/mawdda-store-wallet-entitlement-closure`, `codex/mawdda-premium-effects`, `codex/mawdda-premium-features`.
- Other active/older candidates: `codex/mawdda-test-account-system`, `codex/mawdda-pr3-port`, `codex/production-readiness-tests`, `main`.

Some names returned by branch search could not be dereferenced by GitHub file APIs (reported no commit for the ref). These are **unverified refs**, not assumed deleted or merged. Their exact heads and histories must be resolved before any source-port or cleanup.

## 3. Relative branch comparison against official development

GitHub compare results use the official development branch as base. Ahead/behind counts are ancestry counts, not a statement that every commit is unique or safe.

| Candidate | Ahead | Behind | Changed paths | Handling |
|---|---:|---:|---:|---|
| `codex/economic-phase1-closeout-2026-11-18` | 124 | 232 | 34 | Divergent; inspect only unique functions/tests/docs |
| `codex/economic-phase-completion-2026-11-18` | 181 | 232 | 45 | Broad divergent economy branch; no wholesale merge |
| `codex/economic-phase-controlled-integration-2026-11-19` | 21 | 140 | 8 | Documentation/control plan; reconcile policy text only |
| `codex/economy-official-port-2026-11-18` | 20 | 232 | 9 | Manual coin purchase/payment hardening; compare against current code before port |
| `codex/featured-ads-secure-lifecycle-20261118` | 199 | 233 | 58 | Broad divergent media/ads branch; selective extraction only |
| `codex/governance-biometric-integration-2026-11-19` | 89 | 229 | 39 | Divergent role/rules/biometric source; security review required |
| `codex/mawda-phase2-hardening` | 78 | 2260 | 23 | Very stale ancestry; inspect media security delta only |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 10 | 140 | 1 | Audit document; retain as evidence and reconcile findings |
| `codex/mawdda-economy-selective-port-2026-11-19` | 10 | 56 | 9 | PR #43 unique store gifting; tests/CI not yet accepted |
| `codex/mawdda-role-capacity-final-2026-11-19` | 40 | 140 | 16 | PR #42 stacked on PR #35; do not merge independently |
| `codex/mawdda-room-audio-duration-enforcement` | 5 | 1110 | 12 | Very stale ancestry; extract the 60-second enforcement delta only after exact cross-layer comparison |
| `codex/mawdda-store-wallet-entitlement-closure` | 4 | 1264 | 3 | Very stale ancestry; inspect only test/UI deltas |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | 0 | 51 | 0 | PR #41 is already merged into official development; documentation-only inventory |

## 4. PR dependency and unique-change decisions

- PR #41 (inventory) is merged into the development branch only. Its merge commit is `978d5c3f31bf89e2cfea634c1792403b5738c2ef`; it changed documentation only and did not establish exact-head CI acceptance.
- PR #35 (retention/catalog-version repair) remains Draft/open. Important-chat text retention is owner-confirmed at **30 days**, normal text at **7 days**, media at **4 hours**, and temporary chat full deletion after **4 hours of server-recorded inactivity**. Temporary-mode assignment/consent, activity timestamps and complete conversation/media/derivative deletion remain open.
- PR #42 (role capacity) is Draft/open and stacked on PR #35. Its five-seat capacity and role identity changes are not a substitute for authorization enforcement at every protected operation.
- PR #43 (store gifting) is Draft/open. Its unique gift transaction, immutable receipt/catalog snapshot, sender debit, recipient eligibility and idempotency require exact-head unit/emulator CI before acceptance.
- PR #30/#31 overlap on wallet purchase requests, `functions/src/index.ts`, tests and Flutter purchase screens. The current development branch already contains later multi-currency and featured-ad finance/reconciliation work; no stale whole-file replacement is permitted.
- PR #33/#40 overlap on canonical role terminology and decision registers. Documentation must be reconciled first; backend/rules are a single authorization boundary. Biometric reward and biometric-derived privileges remain fail-closed until cryptographic server-verifiable device proof exists.
- Group-call charging remains disabled/fail-closed. Policy/calculation modules alone are not evidence for provider-side usage, participant accounting, entitlement checks, SFU security, atomic settlement or production readiness.

## 5. Confirmed P0/P1 gaps from exact source inspection

### P0 — delegated specialist authorization is not enforced

`functions/src/advertising-governance.ts` defines grant validation and `hasAdvertisingPermission`, but `functions/src/index.ts` imports grant management helpers without invoking `hasAdvertisingPermission` at protected specialist-operation call sites. Creating a valid grant does not protect the operation. Every advertising, production, technical-review and contract callable must be inventoried and bound to the authoritative resource, role family, exact capability and active scope; missing/expired/suspended/revoked/malformed grants must fail closed. No permission catalogue may be invented, and no role family may inherit another's authority.

### P0 — media client access is intentionally denied; end-to-end delivery is not proven

`storage.rules` currently denies all client reads/writes. This is a deliberate fail-closed staging state, not a working media service. Signed upload/download callables, scanner callback, safe derivatives, exact-generation checks, owner/participant access, CORS/byte enforcement and retention must be validated end-to-end on a disposable non-production bucket before opening any access. No production bucket or live cloud service was touched.

### P0 — paid Media Saver lifecycle remains incomplete

The approved requirement is one paid entitlement across 1:1 chats, public rooms and rented private rooms, with server revalidation on every save, one safe asset, short-lived authorization, exact generation and no extension/reset of the four-hour server retention. The current implementation inventory does not prove this full entitlement-to-local-save lifecycle. No Save control or entitlement should be enabled until all access, expiry, replay, quota and deletion-boundary tests pass.

### P1 — exact-head CI visibility and workflow triggers

The official validation workflow is push-triggered on the development branch; it does not use pull_request. Empty PR-run queries therefore do not prove that push workflows did not run. The current official branch head at the audit was `a86fc878a7f5a29d68271bf08bec041a2fb31f80`; combined status returned `pending` with zero status contexts, and the PR-triggered workflow lookup returned no runs. The two validation workflows have now been explicitly enabled for this integration branch so a new exact-head run can be produced and inspected. A successful older SHA is not acceptance evidence.

### P1 — main branch has no protection configured

GitHub branch metadata reports `main` at `460a79a7dc2e16f4ad146af22aab58e152ad1e8c` with branch protection disabled. This is a governance risk; no protection setting was changed. A separate read-only review and owner-approved protection plan is required before any eventual main merge.

## 6. Acceptance sequence for Step 1/14

1. Complete exact-head inventory of every branch and open/closed PR; distinguish merged, superseded, stale, unresolved and unique commits.
2. Build the per-file semantic overlap matrix for all shared high-risk paths (`functions/src/index.ts`, wallet/store, role services, Firestore/Storage rules, indexes, workflows and Flutter surfaces). Trace imports, callers, exports, callable registration, schema, indexes, tests and source provenance.
3. Port only approved unique deltas in small commits to this integration branch; retain source commit/PR attribution and preserve all original branches/history.
4. Close the specialized authorization gap with a complete protected-callable inventory, trusted grant loader/evaluator, exact resource ownership/scope checks and negative/concurrency/revocation tests.
5. Close media access and retention gaps with emulator tests plus a separately authorized disposable non-production live-bucket/scanner acceptance; keep Storage fail-closed until then.
6. Complete Media Saver entitlement-to-safe-local-save tests without changing server retention.
7. Validate Flutter, Functions, all configured emulator integration suites, Firestore/Storage rules, scanner sanitization/EICAR, workflow YAML, dependency/security scanning and native build workflows on the exact unified SHA.
8. Inspect every job, artifact and test result; record immutable SHA/run IDs and remaining external/device gates. Do not run the separate 5,000-persona simulation in this step unless the approved 14-step plan explicitly assigns it here; existing project plan keeps it separate.

## 7. Non-negotiable exclusions

- No merge to `main`; no production deployment; no production Firebase read/write/mutation; no billing/Blaze/paid-resource activation.
- No deletion, force-push, archive replacement or cleanup of any source branch or historical commit.
- No activation of group-call charges, biometric rewards, incomplete store SKUs, Media Saver or unverified specialist grants.
- No claim of complete Step 1 until every required source delta is integrated, tests pass on one immutable SHA, and external/device-dependent gates are explicitly separated and accepted.

**Current result:** integration branch created; CI triggers prepared; source reconciliation and remediation remain in progress. Step 1 remains OPEN.


## 8. Exact-file comparison addendum — PR #42 and PR #43

The candidate files were fetched from both the exact source branches and the unified baseline. Blob SHA equality was used only to identify byte-identical files; differing files were then compared semantically.

### PR #43 — store gifting

- `functions/src/store-gifting.ts`: byte-identical to the unified baseline.
- `functions/test/store-gifting.test.js`: byte-identical.
- `lib/screens/shop_screen.dart`: byte-identical.
- `functions/test/integration/store-gifting.integration.test.js`: not byte-identical. The unified version contains additional catalog-version snapshot assertions and a distinct second-recipient mismatch test, while retaining cleanup/restoration of seeded catalog and username data. The source PR test uses a generated unique SKU and has fewer assertions; neither version is copied over the other without a complete review.
- `functions/src/index.ts` and `functions/package.json`: differ because the unified baseline has additional later changes. The baseline already exports `giftStoreItem` and defines/runs `test:store-gifting-integration` and includes the integration test. Do not re-port the gifting implementation or replace the larger current files.

**Decision:** the unique store-gifting feature is already present on the unified baseline in a later integrated form. PR #43 is not merged wholesale. Retain the current baseline implementation and its stronger catalog snapshot test; keep the source PR as provenance.

### PR #42 — specialized role capacity

- `functions/src/platform-role-identities.ts`: byte-identical to the unified baseline.
- `functions/src/advertising-governance.ts`: not byte-identical. The unified baseline has stronger Firestore-boundary validation (object/array shape, UID syntax, role and permission allowlists, duplicate checks, bounded canonical scopes, safe timestamps/version, and per-candidate grant validation). The PR #42 branch contains a shorter evaluator that trusts more of the typed input and does not independently validate each stored grant.
- `functions/test/integration/specialized-role-capacity.integration.test.js`: the unified baseline contains the PR capacity cases plus an additional safe-integer grant-version overflow test.
- `functions/test/advertising-governance.test.js`: the unified baseline has additional malformed-scope, control-character, and permission-delta coverage.
- `functions/package.json`: the unified baseline has both specialized-role and store-gifting emulator scripts; the PR #42 branch predates the complete combined set.
- `functions/src/index.ts`: both branches contain role capacity/grant management, but the files differ substantially due to the newer unified baseline.

**Decision:** retain the unified baseline's hardened helper, capacity implementation, and expanded tests. Do not port the older PR #42 copies. The separate P0 gap remains: `hasAdvertisingPermission` is not wired into protected specialist operation call sites.

### PR #35 — retention and catalog versioning

Relative to the unified baseline, PR #35 is 17 commits ahead and 143 behind, touching 10 files. The unified baseline's `setStoreCatalogItem` is more advanced than the PR #35 version: it creates immutable `storeCatalogVersions/{itemId}/versions/{version}` snapshots, records the version path, rejects malformed/overflow versions and preserves owner audit data. The PR #35 version increments the version and writes the catalog/audit but does not create the same immutable catalog-version snapshot. Do not replace the current implementation with the older function.

The owner-confirmed 30-day important-chat text policy is already reflected in the unified baseline documentation and retention code. PR #35's remaining workflow, documentation and regression-test deltas still require file-by-file comparison; no blanket merge is authorized.

## 9. First exact-head workflow evidence

The unified branch head `b0767d99450147a22aa1db93a994508822c652a1` produced:
- Mawdda domain regression run **44583891695** — completed successfully. Both jobs passed: Flutter UI analysis/widget tests; retention and room reservation emulator regression. The backend job passed unit tests, retention, room event reservations, owner grants, specialized-role capacity, store gifting, call signaling and timed-ad reward integration tests.
- Validate Mawda run **44583891823** — remained pending with no jobs returned at the last read. It is not a pass and does not certify Flutter Web build, full Functions/rules suites, or scanner jobs.

The domain regression success applies only to SHA `b0767d99450147a22aa1db93a994508822c652a1`. Any later commit requires new exact-head evidence.

## 10. Main branch protection read-back

GitHub branch metadata for `main` returned `protected: false` and `protection.enabled: false`; the rulesets endpoint returned an empty list. The branch protection detail endpoint itself returned HTTP 403 to this integration, so no administrative protection change was attempted. This is a confirmed governance risk and remains outside this integration branch's write scope.

**Updated decision:** preserve the current source-of-truth baseline, port no duplicate/stale PR #42/#43 code, keep PR #35 selective-only, and continue the P0 specialist-authorization and media-save acceptance work. Step 1 remains OPEN.
