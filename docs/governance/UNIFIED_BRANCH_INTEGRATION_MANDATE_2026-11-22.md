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

| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | Compare against immutable e522: the candidate commit changes only `functions/test/integration/media-callables.integration.test.js` (9 additions, 2 deletions). Inspected the candidate and e522 test around the malicious scanner callback: e522 already repeats the identical signed callback, asserts `idempotentReplay === true`, and verifies exactly one matching malicious-verdict audit event. The baseline also contains the replay handling in `functions/src/media.ts`. | **X — already represented in e522.** No test or source port is needed; importing the older, shorter candidate file wholesale would discard baseline coverage. | None. |

| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | Compared against e522: candidate changes `functions/src/media.ts` and `functions/test/integration/media-callables.integration.test.js`. The test's account-standing denial cases are already present in e522. e522 also contains biometric-purpose denial and audit enforcement in the owner inspection stream and preview paths; the candidate's older source snapshot lacks those checks and is shorter/less complete. | **X — no port.** The candidate's tested denial behavior is already represented, while its source snapshot would regress biometric safeguards. | None. |

| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | Compared with immutable e522. Candidate `room-call-policy.ts` contains only the rented-room predicate; e522 contains that predicate plus transactional room-membership revalidation, direct-call relationship revalidation, and participant-capacity policy. Candidate `index.ts` is an older snapshot missing later safeguards and integrated call-entitlement checks. Candidate integration-test additions are already covered by e522; no candidate-unique non-empty test lines were found in the inspected call-signaling test. | **X — already superseded by the more complete e522 implementation.** Do not copy candidate files or regress the unified call/entitlement/security paths. | None. |


| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | Fresh branch-head lookup and compare against immutable e522. Inspected the exact branch commit diff and fetched both baseline/candidate `functions/test/integration/media-callables.integration.test.js` plus baseline `functions/src/index.ts`. The actual unique-looking change is a test for denying `getRoomMessages` to suspended/banned members while retained membership remains; the complete test block is byte-for-byte identical in e522. Baseline implementation already checks `isMemberAccountInGoodStanding(member.data())` before reading/returning messages. The branch's apparent `index.ts`/`media.ts` compare deltas are older divergent snapshots, not the branch's unique commit payload. | **X — already represented in e522.** No source/test port; avoid duplicate coverage and do not replace newer baseline source snapshots. | None. |


| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | Fresh head and compare against e522; inspected the branch's exact HEAD commit diff, both versions of `functions/test/integration/media-callables.integration.test.js`, and both `functions/src/media.ts` snapshots. The scanner-error callback test is byte-for-byte identical in e522. The malicious callback test exists in both, but e522 is strictly stronger: it repeats the identical signed callback, asserts idempotent replay, and requires exactly one matching audit event; the candidate lacks those replay/audit cardinality assertions. Candidate media source is an older, shorter divergent snapshot than e522. | **X — superseded by stronger e522 coverage and implementation.** No port; do not replace baseline source or tests. | None. |


| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | Fresh head and compare against e522; inspected the branch commit diff and fetched `functions/src/featured-advertising.ts` and `functions/test/featured-advertising.test.js` at both refs. Both source and test blob SHAs are identical across e522 and candidate; the all-Arab-countries matching regression test is already present in the baseline. | **X — exact source/test content already present in e522.** No port required. | None. |


| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | Fresh head and compare against e522; fetched both `functions/src/group-call-economy.ts` and `functions/test/group-call-economy.test.js` at both refs. Both file blob SHAs are identical across baseline and candidate. The initiator remainder allocation implementation and its regression tests are already exactly present in e522. | **X — exact source/test content already present in e522.** No port required. | None. |


## Consolidated X register — deferred full deletion

Owner instruction (2026-11-22): all branches adjudicated **X** are grouped here and retained until the integration, remediation, transfer, and validation work is complete. Do not delete these branch refs during the active integration phase. At final cleanup, review this register and then perform full branch deletion, verifying each ref is absent. X means "do not port / no active integration value against the preserved baseline"; it does not mean the branch has already been deleted.

| Branch | Reviewed head | X disposition evidence |
|---|---|---|
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | `c0a14ef27b3c0442c969f872243214e637cdc188` | Policy and test blobs are identical to e522. |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | Direct-call revalidation exists in e522; candidate transaction omits newer group-call pricing and entitlement reads. |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | No unique non-empty test coverage; e522 source has stronger purpose validation and delivery authorization. |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | e522 already tests replay idempotency and exactly one malicious-verdict audit event. |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | Denial cases already exist; e522 adds stronger biometric-purpose protections. |
| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | Official branch supersedes candidate with transactional membership revalidation, direct-call relationship checks, participant-capacity policy, and call-entitlement checks; candidate tests add no unique non-empty coverage in inspected files. |
| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | Exact denial test and member-standing enforcement already exist in e522. |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | Error callback test already exists; e522 malicious replay/audit assertions are stronger. |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | Source and test blobs are identical to e522. |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca1d1b539b24bf7b84cd1019` | Group-call economy source and test blobs are identical to e522. |
| `codex/mawdda-mfa-signin` | `607647ec0325eaf56bd58a4c2283aedaa47e7e68` | Authentication screens are represented in e522, whose owner-identity matching is newer. |
| `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | e522 has broader store-gifting coverage, including price/version, permanent entitlements, and recipient eligibility. |
| `codex/mawdda-member-inbox` | `f55e1d15423abee81dc125315e95a9acea199fdf` | Inbox/navigation behavior is already in e522; branch index is an older monolithic snapshot and tests add no unique non-empty coverage. |
| `codex/mawdda-room-audio-duration-enforcement` | `dc1c1a43f6c8b4cfb198544ad21975612f89ca83` | Compared branch files with the official branch. Candidate raises chat audio to 120 seconds and raises audio/video/GIF byte/frame limits beyond the approved caps. Official policy enforces 60-second live audio, 5 MiB audio, 15 MiB safe video derivative, and stricter GIF limits; official tests include exact 60-second and over-limit processor cases. Candidate also carries older media-purpose and delivery code. No safe unique port. |

| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | Its only candidate test-file change is already byte-for-byte identical to the official branch; no unique regression coverage. |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | `d46cd7095915bf98480ef38574356c62d72e6a95` | Candidate workflow additions are superseded by the official workflow's broader path filters, non-cancelling concurrency, dedicated server security job, and more comprehensive final-SHA emulator integration. No workflow rollback/port. |
| `codex/biometric-server-lifecycle-2026-11-20` | `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` | Inspected lifecycle, evidence, media, and integration-test files at candidate and official refs. The official lifecycle is the newer implementation: it adds explicit versioned privacy consent, uses the central wallet-ledger credit helper, exposes status/reusable evidence details, and enforces the stricter 20-second biometric audio limit. Both versions require a reviewer playback grant; candidate-only direct wallet balance mutation and 60-second evidence allowance are not safe to port. Official integration tests cover the stronger consent/MFA/calendar-cycle path. |
| `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | Candidate audit document is byte-for-byte identical to the official document. No source change; the official implementation remains fail-closed pending an Owner-approved assignment/scope model. |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | Official inventory document is a strict content superset with a newer re-audit, current callable count, canonical collections, and assignment-field scan. No unique documentation or safe source authorization change to port; do not infer the missing assignment policy. |
**Current X count: 19 branches.** These refs are retained, not deleted. Branches not listed here remain pending review or have another explicit disposition; do not infer X from this register.
