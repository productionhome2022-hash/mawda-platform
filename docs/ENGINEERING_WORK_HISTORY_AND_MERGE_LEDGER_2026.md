# Mawdda Engineering Work History & Merge Ledger — 2026

**Status:** Active mandatory engineering control; historical backfill and full adoption are in progress.  
**Repository:** `productionhome2022-hash/mawda-platform`  
**Development branch:** `codex/mawda-full-platform-implementation`  
**Purpose:** Preserve the complete, traceable engineering history of decisions, proposals, analysis, implementation, tests, integration, branch reconciliation and merge outcomes. This document defines the control system; it does not claim that historical records have already been reconstructed in full.

## 1. Mandatory rule

No non-trivial engineering task is considered properly documented until its record connects:
1. the initiating owner request, approved decision, defect, or explicitly-labelled proposal;
2. the exact baseline (branch, commit SHA, relevant file paths and hashes where available);
3. the investigation, dependencies, root cause and alternatives;
4. the approval state and scope of authority;
5. the exact files created, changed, moved, reconciled or deliberately left untouched;
6. the implementation commits and their parentage;
7. tests actually run, exact tested SHA, workflow/run identifiers and results;
8. unresolved risks, blockers, rollback/migration plan and next action.

A commit message or PR description alone is not a complete work record. Update the relevant domain record and this ledger index whenever a task changes state.

## 2. Separate kinds of truth

Use these states consistently; never infer one from another:

- **Owner-approved decision:** explicit owner approval, with source, date, scope and decision ID.
- **Proposal:** option for consideration; not binding and not implemented by implication.
- **Observed finding:** evidence-backed result of source, document, test or runtime inspection.
- **Specified:** requirement documented.
- **Designed:** architecture and interfaces reviewed.
- **Implemented:** code or documents changed; tests may still be pending.
- **Automated-tested:** named automated checks passed on the exact recorded SHA.
- **Emulator/integration-tested:** named non-production integration checks passed on that SHA.
- **Device/platform-tested:** named device/platform acceptance evidence exists.
- **Security/legal-reviewed:** the relevant review is recorded with scope and outcome.
- **Release-approved:** separate owner approval for the specified release.
- **Blocked / deferred / rejected:** reason, authority and revisit condition recorded.

A green CI check is evidence only for the checks it ran. It is not production acceptance or release approval.

## 3. Required task record

Create one durable record per coherent task under `docs/engineering/work-history/` using:
`YYYY-MM-DD-NNN-short-task-name.md`.

Required headings:

### Identity and status
- Record ID:
- Title:
- Status:
- Priority:
- Owner request / source:
- Decision ID (if any):
- Domain(s):
- Created / updated (UTC):

### Baseline
- Repository and branch:
- Starting commit SHA:
- Relevant source paths and blob SHAs:
- Related PRs, issues, prior records:
- Runtime/environment and limitations:

### Investigation and reasoning
- User-visible problem / desired outcome:
- Observations and evidence:
- Root cause (or explicitly: not yet established):
- Dependencies and affected domains:
- Alternatives considered:
- Proposal(s), with accepted/rejected/pending status:
- Conflicts and how they were resolved or escalated:

### Change manifest
For every file: path, action (create/update/move/retain), reason, source of truth, related requirement, and resulting blob SHA where available. Record generated artifacts and migration impact. Never silently discard source material.

### Integration and reconciliation
- Source branch/ref and source SHA:
- Target branch/ref and target SHA:
- Commit(s) incorporated:
- Already represented changes:
- Conflicts, sensitive files and disposition:
- Files intentionally excluded and reason:
- No-common-base / duplicate / rename analysis:
- Resulting commit SHA:
- Explicit statement whether this is documentation-only, code, configuration, or data work:

### Validation evidence
For each check: exact command/workflow, run ID or link, tested SHA, environment, result, relevant output, and limitations. Distinguish not-run, queued, in-progress, failed, passed, and unavailable. Never turn missing evidence into a pass.

### Safety, migration and rollback
- Security/privacy/authorization impact:
- Data/API/schema/rules impact:
- Migration and backward-compatibility plan:
- Rollback/recovery plan:
- Production/Firebase/billing impact:
- Owner approval required? If yes, state that no action is taken until explicit approval.

### Closure
- Acceptance criteria and result:
- Remaining work / blockers:
- Follow-up record(s):
- Reviewer and review date:
- Final status rationale:

## 4. Branch integration / merge dossier

Every branch integration batch must have a separate dossier recording:
- exact source and target refs and SHA snapshots;
- complete branch/commit inventory and ancestry comparison;
- per-commit disposition: merged, cherry-picked, already represented, superseded, rejected, deferred, conflict, or unable to verify;
- per-file change inventory, including binary, generated, secret-like and platform identity files;
- conflict resolution rationale linked to owner decisions and canonical documents;
- preservation of Android signing identity, iOS bundle/Firebase registration, Firebase project identity, schemas, claims, ledger/API identifiers and production data;
- tests run after integration, on the exact resulting SHA;
- publication/remote verification evidence;
- explicit confirmation that integration did not mean merge to `main`, deployment, production mutation or billing activation.

Do not resolve semantic conflicts by blindly choosing the newest file or by overwriting historical signed/legal source documents. Preserve provenance and request owner decision when authority is ambiguous.

## 5. Source-by-source semantic review of the 1,099-document inventory

The inventory and reconciliation TSVs are discovery indexes, not review evidence. For each source ID, record:
- exact path, source SHA, title/date and document type;
- individual reading/review status and reviewer/date;
- subject/domain and normative statements extracted;
- whether each statement is approved decision, proposal, historical note, contract/legal text, implementation fact, test evidence or unresolved claim;
- overlap/contradiction with other source IDs;
- canonical destination/section and exact link;
- disposition: retained as source, referenced, consolidated, superseded (with authority), duplicate, irrelevant, missing/unreadable, or escalated;
- impact on code/tests/API/data/security/operations;
- follow-up task and acceptance evidence.

Use explicit per-source states: `INDEXED_ONLY`, `IN_REVIEW`, `REVIEWED_NO_CHANGE`, `RECONCILED`, `CONFLICT_ESCALATED`, `UNREADABLE`, `MISSING`. Do not label a batch complete until every listed source has an individual disposition. Maintain batch manifests with inclusive source-ID ranges and counts; reconcile totals to 1,099 and report exceptions separately.

## 6. Canonical record map

- Approved decisions and decision traceability: `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`.
- Constitution/vision change history: `docs/MAWADDA_CONSTITUTION_VISION_CHANGE_REGISTER_2026.md`.
- Constitution-to-delivery requirements, risks and validation state: `docs/IMPLEMENTATION_TRACEABILITY.md`.
- Source inventory and semantic reconciliation: `docs/MAWADDA_DOCUMENTATION_GOVERNANCE_CONTRACTS_CONSTITUTION_VISION/MASTER_SOURCE_INVENTORY.tsv` and `MASTER_SOURCE_RECONCILIATION.tsv`.
- This engineering history and merge control: this file.
- Individual task dossiers: `docs/engineering/work-history/`.
- Integration dossiers: `docs/engineering/integrations/`.
- Audit evidence: `docs/audit/` (retain original report paths and dates).

The records are complementary. Do not replace decision history with engineering notes, or replace source documents with summaries.

## 7. Merge and delivery gate

Before declaring an integration complete, verify:
- [ ] Owner-approved requirements and proposals are distinguished.
- [ ] Baseline and all source refs/SHAs are recorded.
- [ ] Each commit and file has an explicit disposition.
- [ ] Conflicts and sensitive paths are reviewed.
- [ ] No protected production identity, secret, live data, policy or billing boundary was changed without separate approval.
- [ ] Code/document changes have task records and change manifests.
- [ ] Tests and results are tied to the exact resulting SHA.
- [ ] Failed, skipped, unavailable and pending checks remain visible.
- [ ] Canonical indexes and traceability links are updated.
- [ ] Remote branch head is read back and matches the published commit.
- [ ] `main`, deployment and production remain untouched absent separate explicit approval.

## 8. Historical backfill plan and known limitation

This control is newly formalized against the currently inspected development branch. It does not retroactively prove that every prior action was recorded. Backfill must use verifiable Git commits, diffs, PRs, CI runs, existing audit reports, Termux output supplied in the project, and source-document history. Mark uncertain recollections as unverified; never manufacture exact dates, SHAs, tests or approval.

Backfill in bounded batches:
1. establish branch/commit chronology and integration batches;
2. map existing work logs and audit reports to commits;
3. create task dossiers for material changes and decisions;
4. reconcile each of the 1,099 source IDs individually;
5. cross-link records to implementation and test evidence;
6. publish a gap report for history that cannot be reconstructed.

## 9. Initial adoption checkpoint — 2026-11-21

- Existing `docs/IMPLEMENTATION_TRACEABILITY.md` already contains substantial phase-level status, risks, owner-approved clarifications, implementation notes and validation caveats. Preserve it and cross-link it; do not rewrite away its history.
- The central documentation README states that 1,099 paths are indexed and explicitly warns that this is not individual semantic review or physical relocation.
- The 1,099-source reconciliation currently describes entries as indexed and not individually semantically reviewed; this remains open.
- The owner-role/nomenclature/dashboard audit is a partial audit, not full application coverage.
- The exact current development branch head must be read from GitHub before each write/integration. The historical commits cited in prior reports are not substitutes for a fresh branch-head check.
- This checkpoint records the control and observed baseline only. It does not claim historical backfill, full source review, full code audit, test execution, release readiness, or merge to `main`.

## 10. Change log

| Date/time (UTC) | Change | Evidence |
|---|---|---|
| 2026-11-21 | Established mandatory engineering history, task dossier, source review and merge evidence protocol | This document; initial adoption checkpoint |
| 2026-11-21 07:42:47Z | Reorganized the central documentation entry into the owner's three-section structure; added a dated 14–21 November timeline and explicitly separated evidenced timestamps from unknown hours | DOC-CENTRAL-2026-11-21-001; commit `66caa5698dc08dde486f483c2061ac2f92e9169c`; task record `docs/engineering/work-history/2026-11-21-001-central-documentation-three-section-reorganization.md` |
| 2026-11-21 07:44:08Z | Compared the first, current-period and central source-index path sets: 1,092 shared files with no blob changes; two additions between period snapshots; five additions in the central index over the current-period inventory; no path removals | DOC-CENTRAL-2026-11-21-001; inventory SHAs `437633359adb4fe292091f8c1a887ca90c7c00c7`, `73e34e4236c466ebfab4af01143dd04bbc25d850`, `aab249a77c7b43957067a9b7abca813e09a10b86` |
| 2026-11-21 07:45:04Z–07:45:16Z | Reconciled the first two individual source reviews: SRC-0007 (14 Nov Phase 1/2 audit) and SRC-0010 (19 Nov economic integration audit); preserved both as historical sources and recorded supersession/current-status boundaries | DOC-CENTRAL-2026-11-21-001; commits `038853ed09e483550c567d1b8775697854cd0cc8`, `25badfa31c74805bba717a142913d5861cb88d3b`, `9453a9366bb2455bbef86bb6f173f659a8fd920b`; 2/1,099 reviewed, 1,097 open |
| 2026-11-21 07:45:47Z–07:46:18Z | Reviewed SRC-0026 change register and SRC-0027 contracts/governance register; moved GOV-OWNER-002/NOM-001 into chronological table and corrected duplicate contract heading numbering without changing policy text | DOC-CENTRAL-2026-11-21-001; commits `ffbcf5b624ff8a398cb0dccb575dd2208c6e4054`, `b2e8df0249f19bf6d8763896d747ed5ad6aa087a`, `6c4fabceb584be2b4046571da8eb7327401bc2bd`, `4d1a5b104d8b8c112b285547178cc227645f8858`, `ddb6f7ef4f648a74a607a48f6bbcea5f5bef61cf`; 4/1,099 reconciled, 2 in review, 1,093 pending |
| 2026-11-21 07:47:06Z–07:47:11Z | Began read-only review of protected unified constitution and vision; flagged duplicate heading numbering in vision but made no edits pending owner's personal instruction | DOC-CENTRAL-2026-11-21-001; commits `c82bb7b5093d7b6ead2fa3565e7d5bb9106aa9ef`, `0286b9eb406ca3ca50d61af3ba3cdd22c51b76c5`, `76c7b0de54b7cdada9f435703075045561fb7800`; SRC-0035/SRC-0036 `IN_REVIEW` |

## 11. Operational templates and initial Git evidence

- [Individual engineering task record template](engineering/work-history/WORK_RECORD_TEMPLATE.md).
- [Branch integration dossier template](engineering/integrations/INTEGRATION_RECORD_TEMPLATE.md).
- Initial ledger creation commit: `122ebe657d7ff750f5c0a335fcb8af2570890d0f`.
- Governance README link commit: `f7f1677a52a9b6a83a52a5c2e2997906028c2b4a`.
- Implementation traceability adoption commit: `5c6d609b8c9a00e225d377d14b1d58e2884f09c4`.
- Task template commit: `34f09422cc2374bb4c75d20abd3778d160dbde49`.
- Integration template commit: `f5dfbae9cb65e925ce8be9ddfd93f699ab227e9a`.
- These commits establish the documentation controls and templates; they do not represent completion of the historical backfill or execution of the full engineering audit.
