# Owner Decision: Final Repository Shape and E522 Cleanup
**Decision date:** 2026-11-23  
**Status:** OWNER-APPROVED GOVERNANCE BASELINE — EXECUTION IN PROGRESS  
**Repository:** `productionhome2022-hash/mawda-platform`  
**Canonical recovery ref:** `codex/mawda-recovery-integration-2026-11-21`  
**Immutable E522 baseline:** `e522acb5a47964b529b84f49bacd9db0167a6dc5`

## 1. Binding owner decision

The owner approves this vision and this document as the controlling starting point for repository organization, reconciliation, selective transfer, cleanup planning, and continued platform construction.

The objective is not to preserve a collection of competing development branches. The objective is one coherent Mawdda platform body, anchored in E522, with a clean and auditable repository structure.

## 2. Required final repository shape

After reconciliation, validation, and cleanup, the repository must expose **exactly two branches and no others**:

1. `main` — the existing primary/default branch, retained as the repository's official entry point. No merge or update to it is authorized by this decision.
2. `codex/mawda-recovery-integration-2026-11-21` — the only development branch and the sole evolving platform implementation line. It must contain E522 plus every eligible, unique, compatible, verified feature, fix, test, configuration, integration, document, contract, governance record, audit trail, and policy selected from the existing sources.

**There is no third documentation branch.** All documentation, contracts, governance, organization records, decisions, and audit evidence belong inside the Recovery branch's directory tree. No additional branch, archive branch, temporary branch, or historical development branch is to remain in this repository after the cleanup gate.

## 3. Canonical E522 line

- E522 commit `e522acb5a47964b529b84f49bacd9db0167a6dc5` is the immutable reference baseline.
- The Recovery ref above is its evolving descendant and the sole destination for accepted platform implementation changes.
- Do not reset, force-rewrite, replace, or discard E522 ancestry.
- Do not use the former development branch or another branch as a competing integration destination.
- Do not merge wholesale. Compare feature behavior, source, tests, contracts, dependencies, authorization, data models, policy compatibility, and provenance.
- For each candidate change, record whether it is already present, ported, adapted, superseded, conflicting, prohibited, or pending. Record the exact source head and destination commit for every accepted port.

## 4. Source groups and exclusions

### Non-X development branches
Inventory every branch and compare it with E522. Review exact branch heads and file-level content. Transfer only unique, needed, compatible, verified work. A commit count or branch name is never sufficient evidence.

### X archive — 79 live source refs identified (owner previously reported 76)
X is a historical source set, not part of the platform body and never a destination for platform development. Keep its content outside the E522 tree except for individually approved, compatible ports into Recovery. Review every actual X branch ref individually against E522 and Recovery; identify unique features, files, tests, dependencies, contracts, and behavior; then port only eligible, compatible, verified work. Do not copy or merge the archive wholesale.

The owner has explicitly authorized deletion of each non-final X branch ref only after that specific branch completes the same inventory, comparison, disposition, transfer-or-rejection, evidence-preservation, and verification gates required for every other non-final branch. No separate deletion approval is required after those gates. Do not delete unreviewed refs. The fresh 2026-11-23 live branch inventory and X archive manifest identify 79 source refs, superseding the earlier owner-reported 76 and historical 61-entry register as counts. See `docs/governance/E522_PLATFORM_BRANCH_RECONCILIATION_LEDGER_2026-11-23.md` for the exact 79 tip SHAs and per-ref initial comparison. The manifest's declared E522 base SHA `19f133e8e89a4d6f3d45383f5782b51cb9d75eeb` conflicts with the owner-approved canonical E522 SHA `e522acb5a47964b529b84f49bacd9db0167a6dc5`; treat the manifest's base declaration as stale/unverified and do not use it to redefine the canonical baseline.

### 5,000-persona simulation lab
Keep `productionhome2022-hash/mawdda-5000-simulation-lab` as a separate repository. Do not import its files or branches into `mawda-platform`. Its existence or smaller test fixtures do not prove that a full 5,000-persona simulation passed.

## 5. Repository cleanup rules

The cleanup objective is to leave exactly the two branches named above. Every other branch in this repository—including all reviewed non-X branches and the X archive branch refs—must be deleted after its contents have been compared, dispositioned, and any required work safely transferred into Recovery. No third branch is to be retained for documentation or archiving.

Before any non-final branch is deleted:
- capture its exact head SHA and complete inventory;
- establish whether it is a primary/default branch, Recovery, documentation/governance, X archive, or other source;
- complete the content and feature comparison against E522;
- record all accepted ports and destination SHAs;
- record explicit non-port reasons for every excluded delta;
- verify no unique required work, open review, or required evidence exists only on that branch;
- preserve historical evidence and references in the governance ledger;
- confirm the branch is not `main` or the Recovery branch; confirm all unique required work has been transferred or explicitly rejected with evidence; verify the resulting Recovery head and relevant GitHub Actions checks; then delete the reviewed branch ref. This owner decision explicitly authorizes deletion of non-final branches after those per-branch gates are satisfied. It does not authorize deleting `main`, Recovery, the repository itself, or the separate 5,000-persona simulation repository. Do not delete any branch before its review and disposition are complete.

## 6. Required governance records

Maintain and update:
- this owner decision and target-state document;
- the canonical E522 integration directive;
- a branch-by-branch inventory and reconciliation ledger;
- a feature-level transfer register with source SHA, paths, behavior, dependencies, tests, disposition, destination commit, and verification evidence;
- a documentation/contract decision index distinguishing approved decisions, proposals, unresolved questions, and superseded historical text;
- a final cleanup report listing retained branches and every proposed deletion with evidence.

Historical documents are not silently rewritten to erase their origin. Mark superseded instructions clearly and preserve them as audit evidence.

## 7. Verification and acceptance

A branch or feature is not complete merely because it was compared or a commit was created. For each source integration:
- inspect the implementation and relevant tests;
- inspect cross-domain effects and security/policy boundaries;
- make the smallest safe change;
- run the relevant GitHub Actions checks on the exact resulting head;
- record run IDs, statuses, and any skipped or failed checks;
- distinguish CI success from physical-device acceptance, release signing, production readiness, and the full 5,000-persona simulation.

No test result may be claimed without a corresponding run or other direct evidence.

## 8. Sovereign restrictions

This decision does not authorize:
- merging to `main`;
- deployment or production changes;
- production Firebase mutations;
- billing or paid-resource activation;
- live retention/deletion-policy changes;
- deletion of `main`, Recovery, the repository itself, the separate simulation repository, or data and historical records; non-final branch-ref deletion is authorized only after the per-branch gates in section 5 are satisfied;
- changes to iOS app identity or signing identity.

These require separate, explicit owner approval.

## 9. Initial execution state and known evidence

The Recovery branch already contains:
- `docs/governance/E522_CANONICAL_INTEGRATION_DIRECTIVE_2026-11-22.md`, which establishes E522 as the immutable baseline and Recovery as its sole evolving implementation ref;
- `docs/governance/UNIFIED_BRANCH_INTEGRATION_MANDATE_2026-11-22.md`, explicitly marked superseded because it incorrectly named the former development branch as destination;
- `docs/audit/OLD_BRANCH_UNIQUE_FUNCTION_AUDIT_2026-11-22.md`, explicitly marked as a historical audit against a different baseline and not proof of E522 completeness.

A fresh branch search on 2026-11-23 returned **84 branch refs** on the first page and an empty continuation page (cursor then closed), establishing 84 currently discoverable refs in this repository. The current Recovery ref compares to immutable E522 as **265 commits ahead / 0 behind**, with 300 changed paths reported by the compare endpoint. This ancestry comparison does not establish feature-level completeness. Exact current head SHAs and per-branch file/feature dispositions remain to be recorded. The owner-reported X archive size is 76 branches, while the historical integration mandate records a 61-branch X register; this discrepancy is unresolved and must be reconciled against the actual frozen X inventory before any X disposition or cleanup decision. Do not infer that the single visible `archive/X-frozen-branches-2026-11-23` ref itself represents all 76 source branches.

## 10. Execution status at approval

- **Owner vision:** approved by this decision.
- **Decision documented in repository:** committed on the Recovery branch; this update is being committed now.
- **Full branch inventory:** 84 live refs inventoried; 79 X source refs matched to exact tip SHAs in the archive manifest and recorded in the Recovery reconciliation ledger.
- **Initial source-to-Recovery compare pass:** 79/79 X refs queried; 17 are ancestors with zero unique changed paths and 62 diverge and remain pending feature-level disposition. Full feature-by-feature reconciliation is not complete.
- **All eligible transfers:** not complete.
- **Documentation/governance location:** Recovery branch only; no separate documentation branch is permitted.
- **Final branch cleanup/deletion:** authorized after each branch's comparison, disposition, transfer, and verification gates; not yet performed.
- **Final exact-head acceptance:** not yet established by this document.

This document is the controlling target-state decision from 2026-11-23. Where an older document conflicts with this owner decision on the desired final repository shape or cleanup authorization, preserve the older document as history and follow this decision. The only retained branches at closure are `main` and `codex/mawda-recovery-integration-2026-11-21`; all documentation and governance are stored in Recovery.


## 11. Owner confirmation and controlling interpretation — 2026-11-23

The owner has expressly reconfirmed: adopt this documentation and this exact vision for cleanup, comparison, review, reconciliation, selective transfer/integration, verification, and final branch cleanup. This is the controlling approved direction; no alternative repository shape is to be pursued.

Operational sequence is mandatory for each source branch: capture exact head and inventory → compare actual content and behavior with E522/Recovery → inspect tests, contracts, dependencies, and policy/security effects → record a feature-level disposition → selectively port eligible work to Recovery → run and record relevant verification → preserve evidence in Recovery → delete that source branch ref only after its individual gate is complete.

At final closure, only `main` and `codex/mawda-recovery-integration-2026-11-21` remain in `mawda-platform`. All records and governance stay inside Recovery. The separate 5,000-persona simulation repository remains independent and untouched. This approval does not authorize merging to `main`, deployment, production/Firebase changes, billing, live retention changes, or deletion of the protected final refs or repositories.


## 12. Execution update — 2026-11-23

The branch-by-branch evidence is maintained in `docs/governance/E522_PLATFORM_BRANCH_RECONCILIATION_LEDGER_2026-11-23.md`.

- Live GitHub inventory: 84 refs; 79 X source refs plus three archive refs, Recovery and main.
- The 79 manifest tip SHAs were cross-checked against live refs: 79/79 exact matches.
- Ancestry comparison: 17 source refs are behind Recovery; 62 diverge. This is not treated as a feature disposition by itself.
- Direct recursive tree comparison was completed for all 79 X source refs. Unique source-only test/harness and featured-ad reward paths have explicit dispositions; other differing implementations are being reviewed against current Recovery behavior.
- Selective Recovery work has been committed: immutable featured-ad financial snapshots are bound to campaign-version provenance while preserving Recovery's newer pause-on-unreconciled-payment logic; server-only Firestore rules coverage was added for the actual featured-ad state paths.
- GitHub Actions run `45173852293` passed Cloud Functions compilation/unit tests, featured-ad finance integration, wallet/store/entitlement/call/email/engagement regressions, owner-audit export, and Firestore/Storage rules regressions.
- Validate Mawda (`45172429815`) and Mawdda Test Center (`45172429731`) both completed successfully on code head `7d6ca5201fd4aebe02bdaa5217b77dde804e1f6a`, including backend emulator journeys, Firebase rules, Flutter analysis/tests and web release build. The corrected featured-ad Firestore path test passed in the later economy regression run `45173852293` on `f35191128af4d51d47277a535ab11e2a9e4fece6`. The full Test Center suite was not rerun on that later test-only path correction. No full 5,000-persona simulation, physical device acceptance, signed Android/iOS release, production readiness, or deployment is claimed.
- No source/archive refs have been deleted. The connected GitHub toolset currently exposes no branch-ref deletion action, so cleanup deletion is blocked by tool capability despite the owner's conditional authorization.
- Protected refs at this update: Recovery `77350564d3b80535d2cc269920edce42590293de` at the time of this update; main `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f`. Main remains unchanged.


## 13. Owner-approved verification scope clarification — 2026-11-23

The owner confirms that the following tests are excluded from the closure criteria for this branch-reconciliation and repository-cleanup operation, and their absence must not block branch disposition or cleanup:

- Full 5,000-persona simulation, including all scale and scenario combinations. The simulation lab remains a separate repository and is not imported, modified, or required for this operation.
- Physical-device testing and acceptance on actual Android/iOS devices.
- Field or external tests unavailable in the currently authorized GitHub Actions/tooling environment.
- Tests of external services or environments that cannot be exercised with the currently available authorized GitHub capabilities.

Excluded tests must be recorded as **OUT OF SCOPE / NOT RUN — NOT CLAIMED PASSED**. Their exclusion is not evidence of success and does not waive security, correctness, policy, or code-quality obligations.

The following available checks remain required where applicable to each accepted feature and resulting Recovery commit: Flutter/Dart analysis, tests and supported builds; Cloud Functions compilation/tests; Firestore and Storage rules emulator tests; supported unit/integration/widget tests; and available CI security, dependency, static-analysis, build, and integration checks. Record exact commit SHAs, run IDs, outcomes, skipped jobs, and failures. Do not transfer a passing result from an earlier commit to a later head.

This is a verification-scope clarification only. All other owner-approved requirements remain unchanged: actual content and feature comparison, security/policy/dependency review, selective integration, evidence preservation, per-branch deletion gates, exact final branch shape, and sovereign restrictions. The excluded tests are not prerequisites for closing this repository cleanup operation.

