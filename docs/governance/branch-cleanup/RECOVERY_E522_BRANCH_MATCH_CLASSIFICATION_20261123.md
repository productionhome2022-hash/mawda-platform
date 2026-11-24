# Recovery / E522 Branch Match Classification — 2026-11-23

## Purpose and scope

Classify the 46 branches outside `main` and `codex/mawda-recovery-integration-2026-11-21` after the two reported deletion batches. The review scope requested by the owner is work dated 2026-11-18 through 2026-11-21 inclusive.

Reference Recovery head checked: `f701ffe68e01d9a90f46017e64040e7d02ac47a4`.

Current branch inventory at review time: 48 branches total; 46 outside `main` and Recovery. The previously reported two deleted branches were absent from this inventory.

## Classification rules

- **Deletion candidate**: every net file change on the branch has been checked against Recovery and the changed artifact is byte-identical or its non-empty source lines are all represented in the Recovery version. This is a classification only; it is not authorization to delete.
- **Stage 2 — further match required**: the branch has one or more unique commits/files, a non-identical artifact, a source/test/workflow difference, or a semantic question that was not conclusively resolved. Do not delete.
- Commit ahead/behind values below are full-history comparison metadata against Recovery, not counts limited to Nov 18–21.
- No merge, code transfer, branch deletion, force-push, production change, or Firebase change was performed. No tests were run during this classification.

## List A — Deletion candidates (11)

These branches have narrowly scoped net differences and their changed artifact(s) were verified as identical to or fully represented by the corresponding Recovery artifact.

| Branch | Recovery comparison | Evidence |
|---|---:|---|
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | 1 ahead / 856 behind; 1 file | `functions/test/integration/specialized-role-capacity.integration.test.js` has identical blob SHA in branch and Recovery. Head commit 2026-11-20 12:50Z. |
| `codex/phase1-branch-governance-audit-2026-11-20` | 1 / 873; 1 file | `docs/phase1/GITHUB_BRANCH_GOVERNANCE_AUDIT_2026-11-20.md` has identical blob SHA. Head commit 2026-11-20 09:17Z. |
| `codex/phase1-ci-evidence-2026-11-20` | 1 / 897; 1 file | All non-empty lines in `docs/PHASE1_UNIFIED_INTEGRATION_STATUS_2026-11-19.md` are present in the longer Recovery version. Head commit 2026-11-19 21:40Z. |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | 1 / 866; 1 file | All non-empty lines in `functions/test/integration/media-callables.integration.test.js` are present in the longer Recovery version. Head commit 2026-11-20 09:43Z. |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | 1 / 897; 1 file | All non-empty lines in `functions/test/media-scanner.test.js` are present in the longer Recovery version. Head commit 2026-11-19 21:27Z. |
| `codex/phase1-specialist-callable-auth-2026-11-20` | 1 / 861; 1 file | `docs/PHASE1_SPECIALIZED_CALLABLE_AUTH_AUDIT_2026-11-20.md` has identical blob SHA. Head commit 2026-11-20 11:35Z. |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | 1 / 875; 1 file | All non-empty lines in `docs/phase1/SPECIALIZED_CALLABLE_AUTHORIZATION_INVENTORY_2026-11-20.md` are present in the longer Recovery version. Head commit 2026-11-20 09:11Z. |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | 2 / 871; 2 files | Both `functions/src/group-call-economy.ts` and `functions/test/group-call-economy.test.js` have identical blob SHAs in branch and Recovery. Head commit 2026-11-20 09:26Z. |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | 2 / 869; 1 file | `functions/test/integration/store-gifting.integration.test.js` has identical blob SHA. Head commit 2026-11-20 09:31Z. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | 1 / 871; 1 file | All non-empty lines in `functions/test/integration/store-gifting.integration.test.js` are present in the longer Recovery version. Head commit 2026-11-20 09:24Z. |
| `codex/mawdda-biometric-owner-review-policy-2026-11-20` | 2 / 854; 1 file | The changed manual-review policy document differs only in its heading; all remaining non-empty content is present in Recovery. Head commit 2026-11-20 13:50Z. |

**Important:** List A means the branch's net changed artifact is represented in Recovery. It does not delete the branch and does not waive the separate owner-controlled deletion step.

## List B — Stage 2: further file/semantic matching required (35)

These branches are not approved for deletion. The comparison shows branch-exclusive commits and/or changed files; at least one changed artifact was not shown to be identical or fully represented by Recovery.

| Branch | Ahead / behind Recovery | Changed files reported |
|---|---:|---:|
| `codex/biometric-server-lifecycle-2026-11-20` | 73 / 814 | 23 |
| `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | 5 / 1072 | 4 |
| `codex/economic-phase1-closeout-2026-11-18` | 124 / 1164 | 34 |
| `codex/economic-phase-completion-2026-11-18` | 181 / 1164 | 45 |
| `codex/economic-phase-controlled-integration-2026-11-19` | 21 / 1072 | 8 |
| `codex/economy-official-port-2026-11-18` | 20 / 1164 | 9 |
| `codex/economy-recovery-2026-11-18` | 618 / 1164 | 105 |
| `codex/featured-ads-secure-lifecycle-20261118` | 199 / 1165 | 58 |
| `codex/featured-ads-serving-foundation` | 139 / 1164 | 31 |
| `codex/governance-biometric-integration-2026-11-19` | 89 / 1161 | 39 |
| `codex/mawda-full-platform-implementation` | 2 / 264 | 2 |
| `codex/mawda-unified-constitution-vision-2026-11-19` | 142 / 1072 | 64 |
| `codex/mawdda-biometric-proof-gate-2026-11-20` | 12 / 856 | 9 |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 10 / 1072 | 1 |
| `codex/mawdda-economy-selective-port-2026-11-19` | 10 / 988 | 9 |
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | 5 / 854 | 4 |
| `codex/mawdda-group-call-capacity-2026-11-20` | 6 / 856 | 4 |
| `codex/mawdda-independent-verification-cycles-2026-11-20` | 12 / 854 | 9 |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | 11 / 932 | 9 |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` | 17 / 1072 | 10 |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | 22 / 1072 | 12 |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | 6 / 1072 | 6 |
| `codex/mawdda-role-capacity-final-2026-11-19` | 40 / 1072 | 16 |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | 32 / 1072 | 18 |
| `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | 6 / 853 | 4 |
| `codex/mawdda-unified-test-2026-11-18` | 311 / 1164 | 77 |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | 1 / 897 | 1 |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | 5 / 881 | 3 |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | 2 / 874 | 2 |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | 3 / 863 | 2 |
| `codex/phase1-media-hold-delete-race-2026-11-20` | 7 / 875 | 3 |
| `codex/phase1-rented-room-call-gate-2026-11-20` | 6 / 897 | 4 |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | 12 / 897 | 2 |
| `codex/phase1-store-gift-concurrency-2026-11-20` | 2 / 897 | 2 |
| `codex/structural-governance-biometric-roles-2026-11-19` | 79 / 1164 | 35 |

### Specific unresolved differences observed

- Biometric lifecycle: Recovery contains `functions/src/biometric-lifecycle.ts`, but the branch version differs; compare the full lifecycle and its evidence/media tests before deletion.
- Economy: the economic closeout/completion/recovery branches have divergent versions of `group-call-economy.ts`, `store-gifting.ts`, `economy-payment-policy.ts`, `featured-ad-finance.ts`, `wallet-reconciliation.ts`, and large `index.ts` changes.
- Featured ads: the secure-lifecycle and serving-foundation branches contain different finance, reward, media and UI changes.
- Role capacity: the role-capacity family contains differing `platform-role-identities.ts`, callable exports and integration tests; do not collapse the variants by name alone.
- Biometric state machine: source and unit test are present in Recovery, but the branch's progress/gap document contains additional statements not yet matched.
- Media: the direct-delivery, hold/delete-race and scanner-error branches have test/source differences not fully resolved against Recovery.
- Group-call capacity: branch test structures differ even where the policy file is mostly represented.
- CI: `phase1-ci-coverage-role-store` changes `.github/workflows/validate.yml`; its branch-specific workflow steps are not all present verbatim in Recovery.
- Governance audit: the deep governance audit retains an explicit unresolved retention-policy conflict statement not yet matched in Recovery.

## Next required work

1. For every List B branch, enumerate all commits whose committer timestamp falls within 2026-11-18 00:00:00Z through 2026-11-21 23:59:59Z, paginating all commit pages.
2. Build a per-branch file inventory for those commits and compare every changed artifact to the current Recovery head, including moved/archived documentation.
3. Read and resolve semantic differences in code, tests, rules, workflows and policy documents. A longer file is not automatically a superset.
4. Update this report with final evidence and move a branch to List A only after every in-scope change is accounted for.
5. Only after owner review and separate deletion authorization may branches in List A be deleted.

## Safety and status

- Classification report only.
- No branches deleted.
- No code merged or ported.
- `main` untouched.
- Recovery branch advanced only to add this classification report; no application source, test, workflow, Firebase, or production code was changed by this report.
- No Firebase, production, billing, secrets, or signing assets accessed or changed.
- No tests executed.
