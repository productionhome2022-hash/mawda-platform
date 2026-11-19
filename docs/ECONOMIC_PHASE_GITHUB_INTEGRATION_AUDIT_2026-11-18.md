# Economic phase — GitHub integration audit
Date: 2026-11-18
Repository: `productionhome2022-hash/mawda-platform`
Working branch: `codex/economic-phase-completion-2026-11-18`
Working PR: #31 (Draft)
Baseline development branch: `codex/mawda-full-platform-implementation`
Baseline SHA at branch creation: `7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1`

## Scope and safety
This audit is based on GitHub repository contents, refs, PR metadata, commit comparisons, and PR file patches. No Firebase project, production environment, or deployment target was changed. No branch was merged. No GitHub Actions workflow, emulator, or test suite was run in this pass; comprehensive execution remains a separate verification phase as directed.

## PR integration findings

| PR | Head branch | Base branch | Comparison against official development | Decision |
|---|---|---|---:|---|
| #22 | `codex/economic-phase1-closeout-2026-11-18` | `codex/mawdda-unified-test-2026-11-18` | 124 commits ahead of official development; 34 changed files | Do not merge wholesale. Select compatible, independently reviewed files/hunks only. |
| #28 | `codex/economy-recovery-2026-11-18` | `codex/mawdda-unified-test-2026-11-18` | 618 commits ahead of official development; 53 changed files | Do not merge wholesale. It contains broad overlapping changes to Functions, Flutter, scanner, dependencies and workflow files; requires selective port and conflict review. |
| #30 | `codex/economy-official-port-2026-11-18` | `codex/mawda-full-platform-implementation` | 20 commits ahead of official development; 9 changed files | Correctly targets the official development line. Keep as a separate reviewed draft until its wallet/payment changes are integrated in a controlled sequence. |

The three PRs share the official development baseline SHA shown above, but PR #22 and #28 target a different integration branch. Their PR mergeability flags are not proof that they are safe to merge into the official development branch. In particular, #28's 618-commit ancestry makes a wholesale merge inappropriate for this closeout.

## Reviewed payment/wallet changes in PR #30
The PR file patches were inspected for:
- version-checked manual payment instructions and immutable agreed terms after issuance;
- member payment-report action as a claim only, with no coin credit;
- member withdrawal blocked after owner instructions are issued;
- owner approval remaining the only credit/issuance authority;
- transfer replay validation against sender/recipient/platform ledgers and balance arithmetic;
- stronger integration assertions for room-rental wallet receipts and store entitlement replay.

These changes are materially relevant to the required payment and wallet closeout. They remain in PR #30 and have not been merged into this working branch or official development branch. The source-level review does not substitute for running the associated tests.

## Current working-branch changes
The working branch contains the initial group-call pricing policy helper, tests, and owner-only pricing callable. The latest changes in this pass:
- repaired invalid escaped newline characters in `functions/src/group-call-economy.ts`;
- validated the runtime call mode rather than treating every unknown value as video;
- allowed the owner to disable audio or video independently using a zero rate, while rejecting an active policy with both modes disabled;
- aligned the unit tests with this independent-mode policy;
- made policy updates fail closed if the existing policy/version record is malformed, rather than silently resetting version history;
- recorded previous rates in the audit event;
- added an immutable version document for every published group-call pricing policy under `platformSettings/groupCallPricingVersions/versions/{policyId}`, alongside the current-policy pointer and audit event.

Latest working-branch commit at the time of this document: `202346f8341766d87bb57ce37dcf9cbba2b2f028`.

## Explicitly incomplete — do not enable billing
The new group-call policy callable is not yet connected to the group-call admission and settlement lifecycle. The current call path still requires the remaining work: individual join requests, initiator accept/reject decisions, entitlement validation, independent explicit financial consent bound to a policy version, trusted participant-level media connection intervals, atomic/idempotent wallet and ledger settlement, and media topology verification. No group-call charge may be collected until those parts are integrated and tested together.

The current changes do not complete manual/automated payment providers, advertising finance and Media Workspace integration, store lifecycle completion, Media Saver, Super Owner economic controls, or full wallet reconciliation. Those remain in the execution register and must be handled in the approved order.

## Validation state
- GitHub source/PR/branch metadata inspection: performed.
- Functions TypeScript build: not run.
- Functions unit/integration tests: not run.
- Firestore/Storage emulator and security rules: not run.
- Flutter analyze/widget/integration tests: not run.
- GitHub Actions for the latest working SHA: no associated PR workflow runs were returned; combined commit status had no status checks.
- Production Firebase and deployments: untouched.
- Merge to `main` or official development branch: not performed.
