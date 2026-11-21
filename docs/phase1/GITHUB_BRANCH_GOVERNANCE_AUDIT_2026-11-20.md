# GitHub branch governance audit — Phase 1

Date: 2026-11-20  
Audited repository: `productionhome2022-hash/mawda-platform`  
Unified candidate at audit: `0c2f874b0e6d490a93f033616dd40ed8df9436f8`  
Related issue: #51

## Read-only findings

### Main branch
- Main SHA at the preceding repository audit: `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- `GET /branches` reported `main.protected = false`.
- Repository rulesets endpoint returned an empty list (`[]`).
- Main contains only `.github/workflows/flutter-ci.yml`.
- The main workflow runs Flutter dependency install, analysis, tests and web release build. It has `push` trigger for `codex/**`, `pull_request` trigger targeting `main`, and `permissions: contents: read`. It has no `workflow_dispatch` and no Cloud Functions, Firebase Emulator, scanner, wallet/store, media or domain regression jobs.
- No root `CODEOWNERS` or `.github/CODEOWNERS` file was found.

### Development and unified candidate
- Development branch at the preceding audit: `codex/mawda-full-platform-implementation`, SHA `a86fc878a7f5a29d68271bf08bec041a2fb31f80`.
- Unified Phase 1 candidate has `.github/workflows/validate.yml` with `pull_request`, `push` and `workflow_dispatch` triggers; permissions are read-only `contents: read`.
- The candidate validation workflow covers Firebase identity checks, Flutter analysis/tests and web builds (including a production-configured build artifact without deployment), Cloud Functions build/unit tests, Firestore/Storage Emulator integration suites, isolated ClamAV scanner tests and other domain-specific regressions.
- A separate Mawdda Domain Regression workflow covers the domain-specific Emulator regression suites. Exact-head runs are recorded in the Phase 1 integration tracker.
- The direct branch-protection API returned HTTP 403 `Resource not accessible by integration`; therefore required status-check and review settings could not be inspected through this connector. Do not infer those settings from the 403 response.

## GitHub workflow loading constraint

A pull-request workflow is evaluated from the PR base branch. A workflow added only on a PR head cannot activate that workflow for the same PR. Since main currently has only the legacy Flutter workflow, a PR targeting main cannot rely on the candidate-only `validate.yml` or Domain Regression workflow until those workflow definitions exist on main.

## Proposed minimal governance policy (not applied)

Apply only after explicit Owner approval and after validating the exact check names on the target branch:

1. Protect `main` and the development branch with pull-request-only merges; prohibit direct pushes and force pushes.
2. Require successful `Validate Mawda` and `Mawdda Domain Regression` checks on the latest PR head. Do not mark checks as required until their workflows exist on the base branch and exact check names have been observed.
3. Dismiss stale approvals when new commits are pushed; require approval after the final change set. Do not configure a reviewer requirement that cannot be satisfied by the repository's actual authorized reviewers.
4. Restrict branch deletion and force-push bypass; permit only the repository Owner to administer the ruleset.
5. Keep CI permissions least-privilege (`contents: read`); no Firebase credentials, deployment permission, billing, or production secret access in ordinary validation jobs.
6. Keep production deployment in a separate, explicitly approved workflow; CI and PR validation must remain build/test-only.
7. Add a CODEOWNERS file only when the actual accountable owners/reviewers and paths are confirmed; do not invent GitHub identities.

## Promotion sequence constraint

Before application-code promotion to main, the base-branch workflow-loading constraint must be addressed through a separately reviewed CI-only workflow change or another approved mechanism. This audit does not authorize that merge. Keep PR #47 Draft until Phase 1 code, security, media, economy, advertising and UI acceptance gates are closed.

## Not changed

No branch protection, ruleset, repository permission, workflow, merge setting, branch, deployment or Firebase resource was changed by this audit. Issue #51 remains open pending Owner review and an authorized settings inspection.
