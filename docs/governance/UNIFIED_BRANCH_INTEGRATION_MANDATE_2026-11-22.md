# Unified Branch Integration Mandate — 2026-11-22

## Owner directive — binding execution rule

This document records the owner's explicit and controlling instruction for all subsequent Mawdda repository integration work.

### 1. Immutable reference baseline
- Preserve `e522acb5a47964b529b84f49bacd9db0167a6dc5` as the canonical reference baseline.
- Do not replace, reset, rebase away from, or select a different baseline without the owner's separate explicit approval.
- All integration decisions must compare against this baseline and preserve its stronger existing behavior.

### 2. Stop branch proliferation
- Do not create any new branch for any reason during this integration program.
- Use the existing official development branch `codex/mawda-full-platform-implementation` as the sole integration destination.
- Do not merge to `main`, deploy, or modify production Firebase, billing, paid resources, live retention, or production data.

### 3. Exhaustive existing-branch inventory
For every existing branch in `productionhome2022-hash/mawda-platform`:
- Record branch name and exact head SHA.
- Compare ancestry and changed paths against the canonical baseline.
- Identify each file and feature already present in the baseline, each genuinely unique change, and each overlap or conflict.
- Inspect source and tests semantically; branch names, commit counts, and file sizes alone are not proof of feature presence or absence.
- Record provenance, dependencies, authorization boundaries, policy compatibility, and test coverage.
- Do not overwrite a newer or stronger baseline implementation with an older branch snapshot.

### 4. Selective domain-by-domain integration
- Port only verified, genuinely missing source/test changes.
- Integrate one coherent domain batch at a time directly onto the official development branch.
- Review conflicts, shared contracts, imports, data models, Firestore rules, callable authorization, idempotency, and cross-domain effects before writing.
- Never merge a divergent branch wholesale merely to absorb its history.
- If a candidate change is already present, weaker, obsolete, conflicting, or not safely verifiable, do not port it; document the reason.

### 5. Mandatory GitHub Actions quality gate
- The only permitted test environment for this program is GitHub Actions.
- After each source/test integration batch, run the relevant GitHub Actions workflows on the accumulated official development head.
- Do not begin another batch until all required checks for the current batch have completed successfully and every failure, regression, or actionable gap has been fixed and retested.
- A cancelled, skipped, queued, or in-progress job is not a pass. A skipped test is not a pass.
- Do not use Termux, Ubuntu local replay, external services, physical devices, actual signing, production Firebase, or the 5,000-persona simulation in this program.
- Keep scope gaps explicit; do not claim untested behavior as accepted.

### 6. Single-body proof and closure
Maintain a traceable integration ledger that records:
- Every existing branch reviewed and its exact head SHA.
- Its comparison result and reviewed paths/commits.
- Changes already represented in the baseline.
- Unique changes ported, with destination commit SHA and test run IDs.
- Changes deliberately not ported, with evidence-based reasons.
- Conflicts, defects, remediation commits, and retest outcomes.
- Features complete in the accumulated official branch and remaining open items.

The final outcome must be one internally validated candidate on `codex/mawda-full-platform-implementation`, demonstrably descended from the preserved `e522acb5` baseline, with all eligible existing-branch work either integrated or explicitly dispositioned. Do not call it complete until the branch inventory, integration ledger, required GitHub Actions checks, and internal coverage gaps are reconciled.

### 7. Authority and reporting
- This mandate does not authorize merge to `main`, production deployment, production Firebase mutation, billing, paid resources, or irreversible operations.
- The owner retains sovereign approval over any such action.
- Do not create periodic status reports. Report only when an execution step is completed, with evidence, result, unresolved items, and next step.

## Initial recorded state
- Canonical baseline: `e522acb5a47964b529b84f49bacd9db0167a6dc5`.
- Official integration destination: `codex/mawda-full-platform-implementation`.
- The existing recovery documentation branch and its PR are not the integration destination.
- Initial branch discovery returned 80 existing branches on the first page and no additional branches on the next page. This is a discovery snapshot; every listed branch still requires exact-head and file-level review.
- No application source changes are included in this mandate document.


## Incremental branch-by-branch execution ledger

The owner clarified that each branch is a self-contained work item: inspect it, compare it with the immutable baseline, decide and execute its disposition immediately, run the required GitHub Actions gate for any source integration, then move to the next branch. Do not defer all implementation until the entire inventory is complete.

### Completed dispositions — first reviewed candidates

| Branch | Reviewed head | Evidence inspected | Decision | Source changes |
|---|---|---|---|---|
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | `c0a14ef27b3c0442c969f872243214e637cdc188` | Compared against e522; fetched `functions/src/room-call-policy.ts` and `functions/test/room-call-policy.test.js` at both refs. Both files have identical blob SHAs at baseline and candidate. | **X — no port required.** The candidate's policy and test files are already exactly represented in e522. | None. |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | Compared against e522; inspected `functions/src/index.ts` and `functions/test/room-call-policy.test.js`. Candidate is behind/diverged; its call transaction snapshot set omits baseline's newer group-call pricing and entitlement reads. The direct-call eligibility revalidation is already present in the baseline implementation. | **X — no port required.** Candidate does not provide a missing stronger implementation; importing it would risk regressing the newer baseline transaction. | None. |

No new branch was created. No source integration was performed in these dispositions, so no source-change test run is claimed. Continue the same immediate inspect → compare → decide/port-and-complete → GitHub Actions gate → next-branch sequence for every remaining branch.

| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | Compared against e522 and inspected `functions/test/media-scanner.test.js`, `functions/src/media-scanner.ts`, and `functions/src/media.ts`. The candidate test file contains no nonblank lines absent from the baseline; source differences are older/incomplete relative to the baseline, which includes additional media purpose validation and the newer delivery authorization path. | **X — no port required.** No unique stronger behavior was established; importing candidate code would move backwards. | None. |
