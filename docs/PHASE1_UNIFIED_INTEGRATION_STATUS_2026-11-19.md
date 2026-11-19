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

GitHub branch search returned 51 refs at the time of this audit:

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


## 11. Complete GitHub inventory — 19 November 2026

The authoritative branch search returns **51 branches** (including the new integration branch and `main`), not 50. Exact refs:

```text
archive/development-pre-unification-2026-11-15
archive/main-pre-unification-2026-11-15
codex/canonical-role-terminology-owner-confirmation-2026-11-19
codex/economic-phase1-closeout-2026-11-18
codex/economic-phase-completion-2026-11-18
codex/economic-phase-controlled-integration-2026-11-19
codex/economy-official-port-2026-11-18
codex/economy-recovery-2026-11-18
codex/featured-ads-secure-lifecycle-20261118
codex/featured-ads-serving-foundation
codex/governance-biometric-integration-2026-11-19
codex/mawda-full-platform-implementation
codex/mawda-phase2-hardening
codex/mawda-unified-constitution-vision-2026-11-19
codex/mawdda-audit-archive
codex/mawdda-audit-archive-full
codex/mawdda-deep-audit-profile-store
codex/mawdda-deep-governance-audit-2026-11-19
codex/mawdda-economy-selective-port-2026-11-19
codex/mawdda-final-archive-v2
codex/mawdda-member-inbox
codex/mawdda-member-inbox-rebased
codex/mawdda-mfa-signin
codex/mawdda-native-platform-scaffold
codex/mawdda-phase1-phase2-hardening
codex/mawdda-phase1-unified-2026-11-19
codex/mawdda-pr3-port
codex/mawdda-premium-effects
codex/mawdda-premium-features
codex/mawdda-retention-approval-ci-repair-2026-11-19
codex/mawdda-role-capacity-after-retention-2026-11-19
codex/mawdda-role-capacity-consolidation-2026-11-19
codex/mawdda-role-capacity-final-2026-11-19
codex/mawdda-room-audio-duration-enforcement
codex/mawdda-room-events
codex/mawdda-safety-ui
codex/mawdda-step1-role-reconcile-2026-11-19
codex/mawdda-store-entitlement-coverage
codex/mawdda-store-entitlement-hardening
codex/mawdda-store-entitlement-hardening-v2
codex/mawdda-store-wallet-entitlement-closure
codex/mawdda-test-account-system
codex/mawdda-unified-final
codex/mawdda-unified-final-v2
codex/mawdda-unified-final-v3
codex/mawdda-unified-release
codex/mawdda-unified-test-2026-11-18
codex/phase1-integration-batch-01-inventory-2026-11-19
codex/production-readiness-tests
codex/structural-governance-biometric-roles-2026-11-19
main
```

### Complete pull-request inventory

GitHub returned **38 PRs**: 17 open (all Draft), 21 closed, of which 8 are merged and 13 are closed without merge. Open Draft PRs: #2, #22, #24, #25, #26, #27, #28, #30, #31, #32, #33, #34, #35, #39, #40, #42 and #43. Closed/merged: #1, #10, #11, #12, #14, #18, #21 and #41. Closed without merge: #3, #6, #7, #8, #9, #13, #15, #16, #17, #29, #36, #37 and #38. No PR or branch was deleted or force-pushed.

### Additional ancestry comparisons against the unified development baseline

| Candidate | Ahead | Behind | Changed paths | Disposition |
|---|---:|---:|---:|---|
| `codex/economy-recovery-2026-11-18` | 618 | 236 | 105 | Very broad historical candidate; review file-by-file, never wholesale merge |
| `codex/mawdda-unified-test-2026-11-18` | 311 | 236 | 77 | Broad historical integration candidate; split into source families before any port |
| `codex/mawda-unified-constitution-vision-2026-11-19` | 142 | 144 | 64 | Divergent constitution/traceability candidate; reconcile approved decisions, not whole branch |
| `codex/featured-ads-serving-foundation` | 139 | 236 | 31 | Historical serving/media candidate; compare against current secure media pipeline |
| `codex/structural-governance-biometric-roles-2026-11-19` | 79 | 236 | 35 | Divergent governance/biometric candidate; security and proof-model review required |
| `codex/mawdda-test-account-system` | 37 | 1268 | 11 | Stale test harness; separate repository and current emulator coverage take precedence |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | 22 | 144 | 12 | Stacked role/capacity history; current baseline already contains stronger capacity implementation |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | 6 | 144 | 6 | Historical role/capacity candidate; no wholesale port |
| `codex/mawdda-room-events` | 5 | 1316 | 4 | Stale audit-archive delta; unrelated to room events by current changed paths |
| `codex/mawdda-audit-archive` | 14 | 1352 | 6 | Stale archive implementation; compare with current audit export/archive contract |
| `codex/mawdda-member-inbox` | 5 | 1271 | 5 | Stale inbox/privacy delta; compare against current direct-message authorization |
| `codex/mawdda-member-inbox-rebased` | 7 | 1270 | 7 | Rebased inbox delta; compare only missing deletion/media changes |
| `codex/mawdda-premium-effects` | 5 | 1350 | 4 | Stale presentation branch; no backend entitlement authority |
| `codex/mawdda-unified-final` | 17 | 1393 | 5 | Stale profile/email delta; verify if current profile flow supersedes |
| `codex/mawdda-unified-release` | 4 | 1400 | 4 | Stale biometric-cycle delta; keep reward fail-closed pending cryptographic proof |
| `codex/mawdda-store-entitlement-coverage` | 2 | 1315 | 2 | Stale tests/UI delta; current integration suite is newer |
| `codex/mawdda-store-entitlement-hardening` | 2 | 1321 | 2 | Stale room/store fixture delta |
| `codex/mawdda-store-entitlement-hardening-v2` | 1 | 1316 | 1 | Stale test-only delta |
| `codex/mawdda-phase1-phase2-hardening` | 1 | 1352 | 1 | Closure matrix only; retain as historical reference |
| `codex/mawdda-final-archive-v2` | 3 | 1305 | 0 | No changed paths in compare; archive/history only |
| `codex/mawdda-deep-audit-profile-store` | 0 | 1293 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-mfa-signin` | 0 | 1279 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-native-platform-scaffold` | 0 | 1290 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-pr3-port` | 0 | 1373 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-premium-features` | 0 | 1349 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-safety-ui` | 0 | 1371 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-unified-final-v2` | 0 | 1378 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-unified-final-v3` | 0 | 1338 | 0 | Ancestor-only/stale; no unique commits ahead |
| `codex/mawdda-audit-archive-full` | 0 | 1307 | 0 | Ancestor-only/stale; no unique commits ahead |
| `archive/development-pre-unification-2026-11-15` | 0 | 628 | 0 | Historical archive; retain |
| `archive/main-pre-unification-2026-11-15` | 0 | 2828 | 0 | Historical archive; retain |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | 0 | 51 | 0 | PR #41 already merged into development; docs-only provenance |
| `main` | 0 | 2828 | 0 | Older production line; not an integration base |

The remaining compared branches and their dispositions are recorded in §3 above. The ancestry comparisons do not authorize merges: each changed path still requires semantic/API/rules/test review.

## 12. Fourteen-stage execution sequence — canonical reference

The approved 14-stage sequence is in `docs/ECONOMIC_PHASE_EXECUTION_CHECKLIST_AND_STAGE_CLOSURE_2026-11-19.md`. Stage 0 is governance setup and is not counted among the fourteen:

1. Branch inventory and reconciliation.
2. Constitution, decisions and documents.
3. Baseline completion and integration.
4. Wallet, coin ledger and transfers.
5. Purchase requests and payment.
6. Commercial engine, store, gifts and entitlements.
7. Rewards and advertising.
8. Individual/group calls, rooms, rentals and events.
9. Media, Media Saver, retention and deletion.
10. Owner dashboard, costs and protection.
11. UI integration and complete user journeys.
12. Comprehensive verification and separate 5,000-persona lab.
13. Non-production and device acceptance.
14. Release readiness and final decision.

Each stage remains open until its own exact-SHA acceptance gate passes. Stage 1 is the current work; no transition to Stage 2 is authorized.

## 13. Further permission and media gap evidence

- The approved Admin Media permission catalogue in `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md` contains granular capabilities such as `advertising.requests.view_assigned`, `advertising.requests.view_all`, `advertising.requests.return_for_correction`, `advertising.campaign.pause_operationally`, and `advertising.workspace.message_representatives`. The current code's `ADVERTISING_PERMISSIONS` vocabulary does not fully match this approved catalogue. This is a schema/decision reconciliation gap, not a reason to broaden access.
- The current backend exports Owner-only advertising intake/review, production application review, role-grant management and contract management callables. No evidence was found that `hasAdvertisingPermission` gates the specialist operations. This currently fails closed for specialists but does not deliver the approved delegated workflows.
- The current production workflow requires explicit Owner permission for production-room creation. The generic room callable remains Owner-only; scoped team-room authority must not be inferred from a role label or a UI button.
- The legal contract centre exposes Owner contract management and counterparty-specific retrieval; the approved four legal-supervisor read/download/send-to-owner scope is not yet implemented as a separate server-checked path.
- `functions/src/media.ts` contains secure quarantine uploads, signed participant viewing, generation-pinned URLs and scanner callbacks. `storage.rules` intentionally denies direct client access. The media subsystem is not simply absent; it is fail-closed and uses backend capabilities.
- No Media Saver callable/authorization flow or Save UI was found in the inspected direct-chat, public-room and guest-room screens or `functions/src/media.ts`. The paid local-save feature is therefore not complete. It must be built as a separate, per-save entitlement check for direct/public/rented rooms, using safe approved derivatives and never extending server retention.
- `functions/src/media-quota.ts` currently contains hard-coded technical quota constants (including five active uploads and 100 daily uploads). Reconcile these with the owner-controlled capacity/cost policy before claiming that all limits are dynamically configurable.
- PR #33 introduces additional biometric request collections, manual-review/media modules and direct Storage upload rules. These files are absent from the unified baseline and must not be ported wholesale: the source rules add a separate biometric upload path, while the approved reward gate still requires trusted cryptographic proof. Keep biometric rewards and unreviewed direct media paths disabled pending a threat-model and rules-emulator review.

## 14. Latest exact-head CI read-back

The latest integration-branch head at this checkpoint is `79d495303725ca8266c27dbd4bf08a6be2570148`:
- Domain regression run **44584545444** — success; both Flutter UI/widget and retention/room reservation emulator jobs passed.
- Validate Mawda run **44584545469** — still pending, with no jobs returned at the last read. It is not a pass.
- The earlier domain regression success on `b0767d99450147a22aa1db93a994508822c652a1` is retained as historical evidence only, not as a substitute for the current head.

**Current disposition:** the branch inventory now covers all 51 refs and all 38 PRs; selective comparisons have identified stale/duplicate candidates and high-divergence branches. Stage 1 remains OPEN until the remaining changed-file semantic matrix, permission/media remediation, and full Validate exact-head gate are complete.


---

## Execution addendum — 19 November 2026 (latest verified checkpoint)

### Unified branch and exact-head validation
- Unified branch: `codex/mawdda-phase1-unified-2026-11-19`.
- Verified head before this documentation addendum: `825e9489b5dcb351998229fc062d71ce0489044b`.
- Compared with `codex/mawda-full-platform-implementation`: 16 commits ahead, 0 behind; no ancestry divergence.
- Exact-head Validate Mawda run [44588230937](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44588230937): all three jobs completed successfully. Flutter analysis/tests and both Web release builds passed; Cloud Functions compile/unit plus Firestore/Storage emulator integration and rules tests passed; isolated ClamAV build, media sanitization and EICAR checks passed.
- Exact-head domain regression run [44588230887](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44588230887): both jobs completed successfully, including specialized role capacity/concurrency and store-gifting integration.
- These are CI/emulator/build results only; they are not production deployment, physical-device acceptance, or non-production live-service acceptance.

### Selective branch reconciliation
- PR #42 specialized-role candidate `ea6b05253ab702e773611ec48d31518a50943acd` is 32 commits ahead and 156 behind the unified head; merge base `8a1c8d0b93ed43570c523ab2d8c2598648ddac0e`. Do not merge or cherry-pick wholesale. Its role-capacity changes need file-level comparison; its own notes identify missing callable-level delegated authorization.
- PR #43 store-gifting candidate `7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0` is 10 commits ahead and 72 behind; merge base `946ead61208f5007299802c5293f31c329b7c2d2`. The unified head already contains the store-gifting backend module, emulator test, and Shop UI action; PR #43 must not be merged wholesale or duplicated.
- The open PR inventory remains under review. No branch was deleted, force-pushed, merged to `main`, or deployed.

### Confirmed delegated-authorization blocker
- A full source read of unified `functions/src/index.ts` found no call site for `hasAdvertisingPermission`; the helper is defined in `functions/src/advertising-governance.ts`.
- Owner-only management callables do not constitute enforcement of delegated specialist permissions at protected operations. The approved permission vocabulary and authoritative resource scopes must be reconciled before enabling any delegated staff access.
- Tracking issue: [#48 — enforce specialized-role permissions at protected callables](https://github.com/productionhome2022-hash/mawda-platform/issues/48).
- Keep the affected specialist paths fail-closed. Do not infer permissions, scopes, or resource ownership from client input or role display labels.

### 5,000-persona simulation evidence and exact-head gap
- Lab run [44476167496](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/44476167496) completed successfully in Firebase Emulator-only mode. Its report records 5,000 provisioned personas, 5,000/5,000 persona coverage, 5,000/5,000 lifecycle completions, and all 13 lifecycle stages at 5,000. Wallet/message scenario errors were zero.
- That successful run tested platform SHA `63916ade25d9c6d5db640204637053042415fa06`, not the current unified SHA `825e9489b5dcb351998229fc062d71ce0489044b`; it is strong historical simulation evidence but does not close the exact-head gate.
- The lab PR #4 workflow default was updated on its isolated branch to pin the unified SHA. Lab commit: `380b35c3eb0d7700d4dc4cbeaa526abeddbde838`.
- The push did not produce a new simulation run. A manual `workflow_dispatch` with `platform_ref=825e9489b5dcb351998229fc062d71ce0489044b` remains required. Keep lab PR #4 Draft until that exact-head run produces and verifies a 5,000/5,000 report.

### Current stage disposition
- Stage 1 (branch inventory and reconciliation) remains OPEN. Exact-head platform CI is green, but the 5,000-persona exact-head rerun and callable-level delegated-authorization inventory/enforcement remain blocking acceptance gates.
- Do not begin Stage 2 as a completed stage until Stage 1's acceptance gates are satisfied.
- No `main` merge, production deployment, live Firebase mutation, billing activation, or live retention-policy change was performed.


## Execution directive update — 2026-11-19

### Deferred external simulation and acceptance
- The separate 5,000-persona simulation lab and all external/live-service acceptance runs are explicitly deferred until general platform development, cross-branch source reconciliation, UI completion, and internal GitHub validation are complete.
- They are not active work items or current-stage execution gates. Do not dispatch or trigger the separate simulation repository during this development interval.
- Continue only repository-contained GitHub Actions, unit/widget tests, Firebase Emulator suites, static/security/code checks, dependency checks and non-deploying builds.
- This deferral does not authorize production Firebase changes, paid services, live retention changes or deployment.

### PR workflow trigger
- `.github/workflows/validate.yml` now declares `pull_request` events for the development and unified integration branches, in addition to push and manual dispatch.
- GitHub only loads a PR workflow from the PR base branch. Because PR #47 targets the development branch and this workflow change is currently on the PR head, this trigger cannot guarantee a run for PR #47 until the workflow definition is present on its base branch. Push-based exact-head validation remains the active evidence for this PR.


## Branch and workflow continuation audit — 2026-11-19 (latest pass)

### GitHub Actions evidence
The following previously running executions have now completed. All listed jobs and steps returned `completed / success`:
- Validate Mawda: run `44597517337` — Flutter analysis/tests, web builds (including production-configured candidate without deployment), Cloud Functions compile/unit tests, Firestore/Storage Emulator integration and rules tests, isolated scanner image tests.
- Mawdda Domain Regression: run `44597499592` — retention/room reservation Emulator regression and Flutter UI analysis/widget tests.
- Validate Mawda: run `44597499646` — same validation suite as above.
These are validation results for their recorded commit only; they do not close the source-branch extraction or server authorization gaps. Existing workflows include isolated scanner-image tests; no 5000-person simulation or external production E2E was initiated in this pass.

### Branch inventory and selective comparison
A live inventory returned 51 branches. Content-level/commit comparisons were performed for economy, featured advertising/media, governance/biometric, specialized-role, store, room-audio, member-inbox and premium-feature candidates against this unified branch. Important findings:
- Several source branches are deeply divergent; examples: `economy-recovery` 618 ahead / 251 behind; `economic-phase-completion` 181 ahead / 251 behind; `featured-ads-secure-lifecycle` 199 ahead / 252 behind; `structural-governance-biometric-roles` 79 ahead / 251 behind.
- Do not merge these branches wholesale. Their file sets overlap, and the same file versions differ.
- The unified specialized-role integration test is materially broader than the version on `mawdda-role-capacity-final`; the older source test must not replace it.
- `coin-purchase-requests.ts`, `wallet-reconciliation.ts`, and `group-call-economy.ts` match the unified branch on the compared economic-completion source. `economy-pricing.ts` and store-gifting integration coverage differ and require semantic, dependency and test review before any port.
- Some compared branches are already behind with no unique commits (including safety-ui, mfa-signin and premium-features at this comparison point).

### Tracked continuation
Created Issue #52 to track file-by-file selective extraction of the remaining divergent economy, media and governance changes, with explicit acceptance criteria and guardrails:
https://github.com/productionhome2022-hash/mawda-platform/issues/52

### Still open / blocking
- Issue #48: server-side enforcement for specialized advertising roles.
- Issue #49: secure media delivery lifecycle and Emulator coverage.
- Issue #50: reconcile Admin Media permission catalogue with implementation vocabulary.
- Issue #51: branch governance and required PR validation plan.
- Issue #52: selective extraction of unique changes across divergent branches.
PR #47 remains Draft. No merge to `main`, deployment, production Firebase mutation, paid-resource activation, or live retention-policy activation was performed.

### Additional executable test batch — specialist seat lifecycle
- Added two Firestore Emulator integration tests to `functions/test/integration/specialized-role-capacity.integration.test.js`:
  1. An expired active grant does not consume a seat; reactivating it is counted in the same capacity guard and blocks a sixth active Admin Media assignment.
  2. Suspended and revoked grants do not consume active seats; five active assignments succeed and the next assignment is rejected.
- Commit: `4fd3f11b166e2f8af6b3d4dd64d519d867eea333`.
- Validation on this exact SHA has been queued by GitHub Actions. At documentation time all five reported checks were queued; no test success is claimed yet.


## Workflow concurrency remediation — 2026-11-19

- Exact-head SHA `baf1f7c9b14fce9967ccf4679fb050cf499b7e6b` completed Validate Mawda push run `44599803416` with all three jobs successful: scanner/security and media sanitization; Cloud Functions compile, unit tests and configured Firestore/Storage Emulator suites; Flutter analysis/tests and both web release candidate builds.
- The same SHA completed Mawdda Domain Regression run `44599803297` with both jobs successful, including specialized-role capacity/concurrency and store-gifting integration.
- Validate PR run `44599813285` was cancelled while the push validation for the same branch completed. Inspection found the Validate concurrency group used only `github.ref_name`, so push and pull_request events shared a cancellation group.
- Fixed `.github/workflows/validate.yml` to key concurrency by both `github.event_name` and `github.ref_name`. This prevents push validation from cancelling the PR validation for the same branch; newer runs of the same event/branch may still supersede older ones.
- Fix commit: `3e81e33bd7b96850e46f5d313f8af9899e6e9a80`. Its new exact-head workflows must be checked independently; prior success on `baf1f7c` does not prove the modified workflow commit passed.
- PR #47 remains Draft. No merge, deployment, production mutation, billing activation, external simulation or live acceptance was performed.

## Exact-head continuation update — 2026-11-19 20:xx UTC

This addendum supersedes older SHA/run-state references above where they differ.

### Current unified branch evidence
- Unified branch head at this update: `0ba52679710e789a9c1802d87850b52dd83f8c69`.
- Commit message: `test(media): cover expired retention URL denial`.
- PR #47 head matches this SHA; PR #47 remains open and Draft, base remains `codex/mawda-full-platform-implementation`, and it is not merged.
- Validate Mawda Push run `44604718288`: **completed / success** on this exact SHA. All three jobs passed: isolated ClamAV scanner image/sanitization/EICAR; Cloud Functions compile/unit tests and configured Firestore/Storage Emulator suites; Flutter analysis/tests and both web release candidate builds.
- Validate Mawda Pull Request run `44604732231`: **completed / success** on this exact SHA. All three jobs and all steps passed.
- Mawdda Domain Regression run `44604718634`: **completed / success** on this exact SHA. Both jobs passed, including retention/room reservation Emulator regression, specialized-role capacity/concurrency, store gifting, call lifecycle, timed-ad rewards and Flutter widget/unit regression.
- No run above deployed anything. Production-configured web candidate builds are build artifacts only, not deployment or release acceptance.

### Additional media regression
- Added an Emulator integration test in `functions/test/integration/media-callables.integration.test.js` proving that an otherwise linked/approved image whose server-side `retentionExpiresAt` has elapsed cannot receive a new signed delivery URL.
- The test expects `failed-precondition` from `getChatImageAttachmentUrl`; it changes only its isolated fixture and does not alter live retention settings.
- Commit: `0ba52679710e789a9c1802d87850b52dd83f8c69`.
- The new test passed in Validate Mawda runs `44604718288` and `44604732231`, step “Run media callable authorization and audit integration tests”.

### Fresh branch extraction classification
- Compared the six high-risk candidate branches against this unified branch after the latest commit. All are divergent; none was merged wholesale.
- `functions/src/call-usage-policy.ts` and `functions/src/group-call-economy.ts` from `codex/economic-phase-completion-2026-11-18` are already present in the unified branch with matching source content.
- Candidate-only modules requiring separate review include `functions/src/call-entitlements.ts`, `functions/src/sticker-policy.ts`, `functions/src/biometric-media.ts`, and `functions/src/biometric-review.ts`.
- Do not port the candidate biometric review's hard-coded `BIOMETRIC_REWARD_BETACOINS = 1500` without an owner-approved reward policy. Do not port sticker pack limits (120 items, 256/512 KiB) as platform quotas without owner approval.
- Group-call rates remain owner-controlled; no candidate price/rate defaults were copied.
- Issue #52 records the file-level classification and outstanding review requirements.

### Current security and acceptance disposition
- Issue #48 remains open: no approved operation-to-permission/resource-scope matrix has been established for delegated advertising/production operations. Owner review, specialized-role grant administration and company contract-signing callables remain owner/MFA-only. Do not enable delegated capabilities from client-provided scope values.
- Issue #49 remains open: the new expired-retention URL denial test adds coverage, but does not complete all required media lifecycle cases (scanner verdict permutations, deletion race, legal hold, concurrency and full disposable non-production live-bucket acceptance). Storage client access remains fail-closed.
- Issue #50 remains open for permission catalogue reconciliation.
- Issue #51 remains open for repository branch protection verification; GitHub integration did not expose sufficient branch-protection read access.
- Issue #52 remains open for selective extraction of remaining unique changes.
- The separate 5,000-persona lab and external/live-service acceptance remain deferred under the current execution directive. No 5,000-persona run was initiated in this pass.
- Step 1/14 remains **OPEN**. Exact-head CI is green, but source reconciliation and security/lifecycle acceptance are not complete.
- No merge to `main`, deployment, production Firebase mutation, billing/Blaze activation, live retention-policy change, iOS identity change, or production data operation was performed.
