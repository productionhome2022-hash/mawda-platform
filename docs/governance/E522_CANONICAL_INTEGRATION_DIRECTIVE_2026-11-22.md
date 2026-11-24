# E522 Canonical Integration Directive — 2026-11-22

## Owner-confirmed controlling rule

The owner has explicitly confirmed that E522 is the sole platform body, the sole canonical baseline, and the sole destination for all eligible branch transfers and integrations.

- Canonical baseline commit: `e522acb5a47964b529b84f49bacd9db0167a6dc5`.
- E522 is an immutable Git commit object. Git cannot append changes "inside" an existing commit SHA. The existing ref `codex/mawda-recovery-integration-2026-11-21`, whose history descends directly from E522, is retained solely as the mutable pointer for the evolving E522 line. It is not an alternative platform branch or competing development destination.
- All accepted source, test, configuration and documentation changes must be committed as descendants of E522 on that one existing ref. Do not integrate to `codex/mawda-full-platform-implementation`, `main`, or any other branch.
- Do not create new branches. Do not reset, force-rewrite, or discard E522 ancestry.
- The former official development branch and its contents are sources for review only. Nothing on that branch is accepted merely because it was previously merged there.
- Every existing non-X branch must be compared with E522. Inspect exact commits, files, tests, contracts, policy compliance and dependencies. Port only unique, compatible, verified functionality. Never merge a divergent branch wholesale.
- X is a historical source group, not a destination or part of the E522 platform tree. Review every actual X branch ref individually against E522 and Recovery, identify and disposition every unique feature/file/test/dependency, and selectively port only eligible, compatible, verified work to Recovery. The owner decision dated 2026-11-23 supersedes any earlier freeze or separate-authorization restriction: after a specific branch has passed all inventory, comparison, disposition, transfer-or-rejection, evidence-preservation, and verification gates, its non-final branch ref is authorized for deletion. Do not delete an unreviewed branch, `main`, Recovery, the repository, or anything in the separate 5,000-persona simulation repository. Reconcile the owner-reported 76 X branches against the historical 61-branch register and actual refs; do not assume one archive ref represents the entire group.
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


## Owner decision amendment — 2026-11-23 (controlling)

The owner's later explicit approval and the document `OWNER_DECISION_FINAL_REPOSITORY_SHAPE_AND_CLEANUP_2026-11-23.md` supersede conflicting earlier branch-retention and deletion wording in this directive.

At closure, this repository must contain exactly these two branch refs:
1. `main` — retained unchanged; no merge or update is authorized.
2. `codex/mawda-recovery-integration-2026-11-21` — the sole evolving E522 descendant and sole integration destination.

No third documentation, archive, temporary, or historical branch may remain. All implementation, tests, contracts, documentation, governance, audit records, and integration ledgers belong inside the Recovery branch tree. Every other branch, including all X source refs, must first be individually inventoried, compared, dispositioned, and have all eligible work transferred (or exclusions explicitly evidenced); only after its branch-specific safety gate and relevant verification are complete is its deletion authorized by the owner. This is not permission to delete branches prematurely. The separate `productionhome2022-hash/mawdda-5000-simulation-lab` repository remains independent and untouched.

Preserve superseded historical documents as audit evidence; do not silently erase their provenance. Where they conflict with this amendment, this amendment and the owner's 2026-11-23 decision control.


## Branch inventory evidence update — 2026-11-23

A live GitHub inventory returned 84 refs in `mawda-platform`: 79 X-classified source refs, three archive refs, Recovery, and main. The 79 X source branch names and exact tip SHAs are recorded in `docs/governance/E522_PLATFORM_BRANCH_RECONCILIATION_LEDGER_2026-11-23.md`.

All 79 X source refs have now been compared directly against Recovery:
- 17 are behind Recovery with zero ahead commits and zero changed paths in the comparison; their committed histories are already represented by Recovery.
- 62 are diverged and require individual feature/file-level review and disposition.
- No X source branch has been deleted and no code transfer is claimed complete by the inventory pass alone.

The X archive manifest declares an E522 base SHA of `19f133e8e89a4d6f3d45383f5782b51cb9d75eeb`, which conflicts with the owner-approved canonical E522 SHA `e522acb5a47964b529b84f49bacd9db0167a6dc5`. Treat the manifest's base declaration as stale/unverified; the approved E522 SHA remains unchanged. Preserve the manifest as historical evidence and record this discrepancy in the reconciliation ledger.
