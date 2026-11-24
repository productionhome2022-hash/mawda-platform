# E522 Canonical Integration Directive — 2026-11-22

## Owner-confirmed controlling rule

The owner has explicitly confirmed that E522 is the sole platform body, the sole canonical baseline, and the sole destination for all eligible branch transfers and integrations.

- Canonical baseline commit: `e522acb5a47964b529b84f49bacd9db0167a6dc5`.
- E522 is an immutable Git commit object. Git cannot append changes "inside" an existing commit SHA. The existing ref `codex/mawda-recovery-integration-2026-11-21`, whose history descends directly from E522, is retained solely as the mutable pointer for the evolving E522 line. It is not an alternative platform branch or competing development destination.
- All accepted source, test, configuration and documentation changes must be committed as descendants of E522 on that one existing ref. Do not integrate to `codex/mawda-full-platform-implementation`, `main`, or any other branch.
- Do not create new branches. Do not reset, force-rewrite, or discard E522 ancestry.
- The former official development branch and its contents are sources for review only. Nothing on that branch is accepted merely because it was previously merged there.
- Every existing non-X branch must be compared with E522. Inspect exact commits, files, tests, contracts, policy compliance and dependencies. Port only unique, compatible, verified functionality. Never merge a divergent branch wholesale.
- X is frozen, retained and excluded from all transfer and deletion operations during this phase. Do not review, port, delete, or otherwise mutate X until all non-X transfer/integration work is complete. Then produce a branch-by-branch X report proving whether full deletion is safe. Deletion requires a separate owner authorization.
- Complete the non-X transfer/integration phase before running the final internal GitHub Actions acceptance gate on the exact E522-descendant head.
- The 5,000-persona simulation, external testing and physical Android/iOS device testing remain suspended until the owner separately reopens those phases after integration and subsequent build work.
- Do not deploy, mutate production Firebase, enable billing, or change production data, live retention or paid resources.

## Required ledger for every non-X branch

Record branch name, exact head SHA, ahead/behind counts, changed paths, commits and file-level findings; identify what E522 already contains; decide each unique change as ported, already present, superseded, conflicting, policy-prohibited or pending; record destination commit SHA for every port; and retain evidence for each decision. A branch is not complete merely because its ancestry was compared.

## Correction of earlier governance documents

Any earlier document that names `codex/mawda-full-platform-implementation` as the integration destination is superseded by this owner-confirmed directive. Preserve those historical documents as evidence; do not use their conflicting destination instructions for new work.

## Current execution state at creation

- The E522-descendant continuation ref has been used to correct the baseline-selection, branch-inventory and internal-acceptance documents.
- PR #86 was merged into the former development branch at `d4dc7399877f5aeafc2ca95422fc5a63324ab26f`, contrary to its own "Draft only. Do not merge" body. That merge is not an E522 integration and does not satisfy this directive. Preserve history; do not rewrite the former development branch.
- Non-X branch-by-branch transfer remains in progress. No claim is made that all branches or features have been reviewed or ported.
- X remains frozen and has not been reviewed for deletion.
