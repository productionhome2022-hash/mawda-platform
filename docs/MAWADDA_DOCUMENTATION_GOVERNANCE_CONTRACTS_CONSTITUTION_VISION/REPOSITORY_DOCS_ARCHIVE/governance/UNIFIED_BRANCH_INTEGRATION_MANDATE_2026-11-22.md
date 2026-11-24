> **SUPERSEDED — 2026-11-22:** This historical mandate incorrectly named `codex/mawda-full-platform-implementation` as the integration destination. The owner has since explicitly established E522 as the sole canonical baseline and destination. Do not execute the destination, transfer, or branch-cleanup instructions in this historical document. The controlling directive is `docs/governance/E522_CANONICAL_INTEGRATION_DIRECTIVE_2026-11-22.md`. The old text is retained only as an audit record.

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
| `codex/biometric-final-owner-policy-2026-11-20` | `08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23` | Compare against the current official branch reports zero candidate-ahead commits and no changed files; no unique work remains. |
| `codex/biometric-final-policy-drift-closure-2026-11-20` | `0089c556a7e241454cfbfb3223fff500cc8763bb` | Compare against the current official branch reports zero candidate-ahead commits and no changed files; superseded by the official line. |
| `codex/biometric-manual-review-gate-2026-11-20` | `a82a0614f7526bfb56c6bcc93764a5b907406e95` | Compare against the current official branch reports zero candidate-ahead commits and no changed files; no unique work remains. |
| `codex/biometric-video-duration-validation-2026-11-20` | `be9b8109c8ae4b62a0b17e9b70a851307a3294f6` | Compare against the current official branch reports zero candidate-ahead commits and no changed files; current biometric media validation is already in the official line. |
| `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | Compare against the current official branch reports zero candidate-ahead commits and no changed files; no unique implementation or test changes to port. |
| `codex/mawda-phase2-hardening` | `f8abd722ececc988c555f0400cc7b558e762ae5a` | Scanner server and tests are byte-identical to E522/current official. Candidate media.ts and integration suite are an older, smaller implementation than the official source and its broader validation; no safe unique media behavior to port. |
| `codex/mawdda-room-events` | `b0b5214ab3b3b31f2c4ff494ce6ffe3536ae1615` | Audit archive source, tests, and infrastructure README are byte-identical to E522/current official. Its monolithic index is an older snapshot; do not replace modular current exports. |
| `codex/mawdda-economy-selective-port-2026-11-19` | `7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0` | Store-gifting source, unit tests, and shop screen are byte-identical to E522/current official. Candidate integration test is a strict subset; official tests add concurrent replay, catalog-version and stale-price rejection, and permanent entitlement coverage. |
| `codex/mawdda-test-account-system` | `d89d30a623369e5b687525297b97257192a27462` | Emulator-only seed script is byte-identical. Official Test Center workflow is stricter and targets only the unified branch; official persona fixture and integration tests are newer and add direct-message replay/block checks. No unique test harness function to port. |
| `codex/structural-governance-biometric-roles-2026-11-19` | `e71f3eb559e7f86edecd97fb366ad9c69b5817c5` | Candidate biometric media/review and role identity modules are older than E522/current official. Candidate storage rules allow a direct member evidence-upload path while official rules deliberately default-deny pending server-authorized media flow; do not weaken that boundary. |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | Candidate integration test blob is byte-identical to E522/current official; no unique coverage remains. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | Candidate test contains no non-empty lines absent from official. Official store-gifting integration suite has broader concurrency, permanent-entitlement, stale-price/version, and recipient-eligibility assertions. |
| `codex/mawdda-independent-verification-cycles-2026-11-20` | `615f9f974ea9e252772bee43339261288b7a2729` | Calendar module and unit tests are byte-identical to official. Candidate index retains an obsolete client-local biometric reward path and five-member call assumptions; official implementation requires Super Owner manual review and applies current participant-capacity/entitlement rules. Official workflow and renewal integration coverage are broader. |

| `codex/economy-official-port-2026-11-18` | `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c` | Candidate owner coin-instruction flow is EUR-only; official implementation supports ISO currency codes and currency exponents with broader tests. Room-rental integration test is byte-identical; official wallet/store integration tests add catalog versioning, reconciliation, and corrupt-version fail-closed coverage. No safe candidate-only behavior to port. |
| `codex/mawdda-biometric-proof-gate-2026-11-20` | `73b53918e2de76d97d9f9cf7dff1706cc9d124b5` | Candidate requires Android Play Integrity/iOS App Attest device attestation, while the current Owner-approved policy is Super Owner manual review of private evidence with fresh MFA; provider attestation is explicitly not an approval prerequisite. Official biometric lease and tests enforce the manual-review model. Social-link access helper itself is identical; candidate tests encode the superseded attestation trust model. |
| `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | `40845f2de04106081640b9e83bb8d0fa983fbf49` | Biometric review state module, unit tests, and email-renewal integration test are byte-identical to the official branch. Candidate's short implementation-gap note is superseded by the official comprehensive biometric lifecycle/gap register. |
| `codex/mawdda-biometric-owner-review-policy-2026-11-20` | `693dc110a931107f2fcc1f829e08974932ab65db` | Candidate contributes only the earlier manual-review amendment document. The official branch preserves its full historical policy text with an explicit SUPERSEDED banner and points to the final owner-approved biometric policy; no unique source/test behavior remains. |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | `5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51` | Candidate role identity module and capacity integration tests are superseded by the official role model, which includes additional fixed specialist teams, Owner-configurable general-production capacity, version checks, and broader seat lifecycle tests. |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | `7a134c6d5adf02f8e2bbd3b931deb5ef592fbf1c` | Candidate role identity source and capacity test are older subsets of the official module and integration suite; no unique behavior remains. |
| `codex/mawdda-role-capacity-final-2026-11-19` | `138d9b5d6624d111d61b6b71bf0cb60a8b17050d` | Official role identity module/test and specialized-role capacity integration suite are broader: additional fixed teams, capacity override policy, sequence-policy boundaries, grant version overflow, expired reactivation and suspended/revoked seat accounting. |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | `ea6b05253ab702e773611ec48d31518a50943acd` | Candidate role identity and specialized-role tests are superseded by the official role model and broader integration suite; candidate adds no safe unique authorization mapping. |
| `codex/mawdda-store-entitlement-coverage` | `7b53ad8e3418d3e9494517862ade66a010871564` | Candidate wallet/store integration additions are superseded by official tests for immutable catalog versions, corrupt-version fail-closed behavior, wallet reconciliation and stricter payment policy. Candidate shop screen is older and lacks official gift receipts, entitlement history, call-package conditions and owner-controlled display rules. |
| `codex/mawdda-store-entitlement-hardening` | `bca089273f4c3652eeb01d27f5cc2788c386c060` | Candidate wallet-store test cases are covered by broader official wallet/store tests; candidate room-event RSVP test is superseded by official cancellation, idempotent replay and concurrent last-seat reservation coverage. |
| `codex/mawdda-store-entitlement-hardening-v2` | `7506f5d4034b58477fe0bfbc28ab90ead4f77eb0` | Candidate wallet-store additions are superseded by the official broader wallet/store integration suite; no unique test behavior to port. |

| `codex/mawdda-unified-release` | `42e11d492584a556e018e70db2eed71de84616fa` | Biometric verification cycle module and unit tests are byte-identical to official, but the candidate's index and profile screen use the superseded client-local biometric reward flow. Official code requires the current Super Owner manual-review lifecycle and central wallet ledger; no unique safe source behavior remains. |
| `codex/mawdda-group-call-capacity-2026-11-20` | `2f67e4a6cdaeedf5190cbd2e3acdb0ece4747c0a` | Candidate group-capacity policy and tests are present in the official branch, but the official call-signaling integration adds transactional membership/direct-call revalidation and mandatory per-member call entitlements. Candidate integration tests do not cover those newer gates. |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` | `179ba95fa582082c7ed32c3f3016b899b414b0ca` | Candidate index is an older monolithic snapshot retaining local-prompt biometric reward and fixed five-member call assumptions. Official line uses Super Owner manual review, current room-call entitlements, store gifting, and broader wallet/catalog version protections; candidate integration tests are narrower. |
| `codex/economic-phase-completion-2026-11-18` | `0914885232ff8bcfb64536c6655e7bff01b78361` | Call-usage policy, wallet reconciliation, featured-ad finance and store-gifting modules/tests are byte-identical to official. Candidate group-call remainder allocation conflicts with the approved initiator-remainder rule; candidate room-call policy lacks current transactional membership/direct-call checks; candidate currency/reward policy is broader/less constrained than the official owner-approved currency list and bounded reward policy. Official tests are broader. |
| `codex/governance-biometric-integration-2026-11-19` | `619eab643e2d5849b3b2c055461d53ba2be01753` | Candidate member biometric screen and media/review modules are older than official cross-platform upload and Super Owner review implementations. Owner review screen is identical; official media parser validates all video tracks and stricter evidence rules. Candidate Storage rules permit direct member object creation, while official rules deliberately default-deny. No safe unique behavior. |
| `codex/mawdda-unified-final` | `ddf9594ea6029036512ace621f513d6edf58a068` | Candidate index/profile screen use the superseded local-prompt biometric reward flow and fixed 30-day cycle. Official branch has the manual Super Owner review, independent calendar renewal, cross-track isolation, blocking and safety UI, and stronger email-renewal integration assertions. |
| `codex/mawdda-unified-final-v2` | `e249c664f9a48dd8a198e274b38033a7cbba0a3d` | Compare against official reports zero candidate-ahead commits and no changed files; the branch is fully ancestral to the official line. |
| `codex/mawdda-final-archive-v2` | `f79b112c628c8a1709f860a8d25c1f975eddcace` | Compare reports three candidate-ahead commits but no changed files; no unique source or test file is present in the candidate delta. |
| `codex/mawdda-audit-archive-full` | `5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47` | Compare against official reports zero candidate-ahead commits and no changed files; the branch is fully ancestral to the official line. |
| `codex/mawdda-native-platform-scaffold` | `d556a9990ffe4472fe86ab48acc696adc9c109f6` | Compare against official reports zero candidate-ahead commits and no changed files; no unique platform scaffold remains. |
| `codex/mawdda-safety-ui` | `1e4c6aa97a679d0eaa88708571341e79e9e06c68` | Compare against official reports zero candidate-ahead commits and no changed files; current safety UI and workflows are already in the official line. |
| `codex/mawdda-premium-features` | `f3884061a5d7be3836adc6d6b94de10e534625ab` | Compare against official reports zero candidate-ahead commits and no changed files; no unique premium implementation remains. |
| `codex/mawdda-deep-audit-profile-store` | `4ed7394235ea531e4b4abbb24431731da15eaf47` | Compare against official reports zero candidate-ahead commits and no changed files; no unique source/test changes remain. |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | `2fff6276055de44bc488cc123cec16491421a8e6` | Compare against official reports zero candidate-ahead commits and no changed files; the candidate inventory has no unique implementation delta. |
| `codex/production-readiness-tests` | `424599a34acc9ec33b4e759ba166dc6d0a9df04d` | Compare against official reports zero candidate-ahead commits and no changed files; all candidate commits are already in the official history. |
| `codex/mawdda-phase1-unified-2026-11-19` | `e12897ad7dc5f383501d997117fb1211c67632e7` | Compare against official reports zero candidate-ahead commits and no changed files; superseded by the unified development history. |
| `codex/mawdda-pr3-port` | `6e11d5a631d61f9e92b37fd64c827f37ec8e9c11` | Compare against official reports zero candidate-ahead commits and no changed files; no unique port remains. |
| `codex/mawdda-unified-final-v3` | `ab5e37e6d7f437a491e85883b91e8bcde76d438e` | Compare against official reports zero candidate-ahead commits and no changed files; fully superseded by official history. |

**Current X count: 61 branches.** These refs are retained, not deleted. Branches not listed here remain pending review or have another explicit disposition; do not infer X from this register.


## P0 unified advertising execution — 2026-11-22

Tracking issue: [#87 — unified standard/featured ad lifecycle](https://github.com/productionhome2022-hash/mawda-platform/issues/87).

The owner requested simultaneous execution of the interdependent campaign-schema, serving, player, rewards/budget, owner-policy UI, archive/report, branch-port, and CI-repair tracks. Work remains confined to the existing official development branch and the preserved E522 ancestry.

### Legacy featured-ad branch disposition

| Branch | Reviewed head | Comparison to E522 | Disposition |
|---|---|---|---|
| `codex/featured-ads-secure-lifecycle-20261118` | `b15b643f14bc6c1196bf914190778e053e2ac9b1` | 199 ahead / 772 behind | Do not merge its standalone featured session/campaign collections. Its `featuredAdSessions`, `featuredAdRewardClaims`, and independent reward policy would duplicate the existing `timedAdSessions`, `timedAdRewardClaims`, wallet ledger, budget reservation, and idempotent completion lifecycle. The current implementation instead extends the unified timed-ad campaign and session model and reuses the existing featured financial ledger. |
| `codex/featured-ads-serving-foundation` | `0fe15db693eb0a36a73c11a6e563e189069e74ba` | 139 ahead / 771 behind | Do not import its separate `featuredAdCampaigns` store or separate viewing-session endpoints. Reuse its relevant priority/rotation behavior through the existing `featured-advertising.ts` selection module, now connected to the unified `timedAdCampaigns` feed. |

No wholesale branch merge was performed. No new branch was created. These two branches remain retained pending the broader branch inventory and the deferred X cleanup decision.

### Source integration currently on the official branch

- Extended `TimedAdCampaignInput` with `adType`, `geographicTargets`, `featuredPlacement`, `priorityOrder`, and the featured per-member daily cap. Explicit standard campaigns require geographic targets; featured campaigns require no geographic targets and a daily cap from 1 through 10.
- Extended `getActiveTimedAdCampaigns` to return standard and featured campaign feeds from the same `timedAdCampaigns` collection, with member-country/region validation for standard ads and server-side priority/rotation selection for featured ads.
- Connected both member entry points to the existing `RewardCenterScreen` timed player. The player sends route visibility and only reports creative visibility after an approved image/GIF has rendered. Video publication remains fail-closed until a supported player/device test exists.
- Added member cancellation with transactional budget-reservation release, UTC daily featured claim accounting in the existing member/campaign counter, member reward history, and owner campaign reports across the existing session, claim, version, and financial-event records.
- Added campaign-state version snapshots and optimistic version checks for owner edits. Featured publication now requires the existing featured-ad financial record to be paid and fully reconciled; it does not create a separate wallet or payment system.
- Extended the existing Super Owner advertising/rewards screen with ad type, geography, featured priority, daily cap, finance actions, and report/archive access.

### Verification state at ledger update

The previous SHA `728c3a9acbe01458978d29a4ad8d6cdb73dbd393` had all four advertising-related GitHub Actions runs completed successfully (Economic phase verification, Validate Mawda, Mawdda economy regression, and Mawdda Test Center). The new P0 source changes listed above were committed after that SHA; they are **not accepted as tested until the new head's GitHub Actions runs complete successfully**. No local/Termux/device/Firebase-production tests were run.


### Additional advertising-related branch inventory

The remaining advertising-named branches were checked against E522 as well:

| Branch | Reviewed head | Comparison to E522 | Disposition |
|---|---|---|---|
| `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | 0 ahead / 504 behind | No unique commits to port relative to E522. |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | 2 ahead / 481 behind | The module implementation matches the E522 selection code; the additional tests assert geographic filtering for featured previews. That behavior conflicts with the approved non-geographic featured-ad rule, so it was intentionally not imported. |
| `codex/production-readiness-tests` | `424599a34acc9ec33b4e759ba166dc6d0a9df04d` | 0 ahead / 3370 behind | No unique commits to port relative to E522. |

Thus, no remaining unique advertising callable-auth implementation was found in these branches. The only compatible selection behavior retained is priority ordering and randomized rotation; geographic targeting remains exclusive to standard campaigns.


## Final verification and merge gate — 2026-11-22

**Verified source SHA:** `c46f890f909cf85544cbbca7ab5973a047bdf26d`

All four required GitHub Actions workflows completed successfully on this exact source SHA:

| Workflow | Run | Result |
|---|---:|---|
| Mawdda Test Center | 45022454771 | success |
| Mawdda economy regression | 45022454773 | success |
| Economic phase verification | 45022454813 | success |
| Validate Mawda | 45022454827 | success |

This includes Functions compilation/unit tests, the unified timed-ad and featured-finance integration path, full emulator test journeys, Firestore/Storage rules, Flutter analyze/tests, Web release build, the production-configured Web build candidate, server evidence/authorization/biometric integration, the five-persona test fixture, and isolated ClamAV media sanitization/EICAR detection. The five-persona fixture is not the separate 5,000-person simulation.

No local/Termux test, signed Android/iOS device acceptance, real-device playback acceptance, 5,000-person simulation, Firebase production write, deployment, or billing change was performed.

### Merge review — not executed

- Development branch remains `codex/mawda-full-platform-implementation`, at the verified SHA above; comparison to E522 is **86 ahead / 0 behind**, with 16 changed files.
- Existing PR #2 remains Draft, targets `main`, has 0 reviews, reports `mergeable=true` but `mergeable_state=unstable`, and currently spans 1,599 files (+414,793 / -910; 3,449 commits).
- `main` is 3,363 commits behind E522. The branch-protection endpoint returned 403, so required protection rules could not be independently inspected.
- Therefore PR #2 was not merged. The project constitution requires separate explicit authorization for a merge to `main`; the current PR base/diff is also not a safe merge surface. Recommendation: do not merge PR #2 as currently based. Establish a clean, reviewable merge path from the E522 baseline and obtain the required owner authorization first.
- No X branches were deleted; X cleanup remains deferred as instructed. No deployment or production mutation occurred.


## Parallel execution follow-up — 2026-11-22

**Current development head at this review:** `e77a952642170127d2950bea828b1febe41725d0`  
**Comparison to E522:** 107 commits ahead, 0 behind; 29 changed paths.  
The following work was performed concurrently across advertising serving, economy, media delivery, owner catalog, member UI, tests, and branch inventory.

### Additional defects found and corrected

1. `getActiveTimedAdCampaigns` previously applied a 100-document cap before filtering campaign placement and active time. Expired/future campaigns with earlier document IDs could hide valid campaigns. The query now filters status, placement, `startsAtMs <= now`, and `endsAtMs > now` in Firestore before the cap. The integration fixture now puts 101 expired and 101 future campaigns lexically before the valid campaign.
2. `startTimedAdvertisement` now requires an explicit player type for every typed campaign. Missing or mismatched `adType` is rejected; this prevents starting a featured campaign through the standard/unclassified player and vice versa.
3. The featured browse CTA no longer opens the reward archive automatically. Archive access remains a separate action.
4. Removed the dormant, unreferenced `featured-ad-rewards.ts` policy helper and its unit/orphan integration tests. It encoded a second fixed reward policy and was not exported by the Functions entry point. The live source of truth remains the unified timed-ad campaign, owner policy, and wallet ledger.

### Approved Media Saver capability selectively ported

The approved Media Saver work from `codex/featured-ads-serving-foundation` was reviewed and selectively ported; no old branch was merged wholesale.

- Server callable `getMediaSaverAttachmentUrl` reuses the existing linked-message authorization and safe-derivative validation path.
- Every save request re-checks an active entitlement for `media_saver_24h`, `media_saver_7d`, or `media_saver_30d`.
- Only safe image/GIF/video/audio derivatives are eligible; signed capability lifetime remains two minutes.
- The operation does not write or extend `retentionExpiresAt`; it records the media access audit event.
- Flutter service and save actions are wired into direct-chat and room attachments.
- Super Owner catalog supports the three exact durations and owner-entered prices. No default Media Saver price or purchasable SKU was seeded because no price was approved.
- Added emulator integration coverage for missing/expired entitlements and for the rule that an active entitlement does not bypass conversation membership; added catalog duration tests.

### Old-branch disposition evidence

| Branch | Comparison to E522 | Unique work found | Disposition |
|---|---:|---|---|
| `codex/featured-ads-secure-lifecycle-20261118` | 199 ahead / 772 behind | Separate `featuredAdSessions` lifecycle, separate featured reward policy, sticker catalog, capacity-media owner controls | Separate featured sessions/policy not ported: they duplicate the unified `timedAdSessions`/wallet-ledger lifecycle. Sticker/capacity controls are outside this approved advertising/Media Saver scope and remain deferred for their own review. |
| `codex/featured-ads-serving-foundation` | 139 ahead / 771 behind | Media Saver, separate featured lifecycle, `setMemberGhostMode`, legacy `giftStoreEntitlement` | Media Saver selectively ported above. `giftStoreEntitlement` is superseded by current `giftStoreItem`, which binds catalog version, price, idempotency, ledger and audit. Ghost Mode is not ported: the current catalog has no approved SKU or owner-approved privacy semantics for it. Separate featured endpoints/policy are duplicates and were not ported. |
| `codex/phase1-advertising-callable-auth-2026-11-20` | 0 ahead / 504 behind | No source-only commits | No unique implementation to transfer. |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | 2 ahead / 481 behind | Adds geographic targeting to featured selection | Intentionally not ported: this conflicts with the approved non-geographic featured-ad rule. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | 1 ahead / 478 behind | Missing/stale catalog-version gift regression coverage | Already represented in the current `store-gifting.integration.test.js`; no additional port required. |

The legacy `OwnerFeaturedAdsDashboardScreen` in the baseline is not routed by the active Super Owner screen; it calls old featured-ad callables that are not exported by the current Functions entry point. The active route uses `OwnerAdvertisingRewardsScreen` and the unified campaign APIs.

### Deferred boundaries

As explicitly directed, no real Android/iOS device tests, no 5,000-person simulation, and no merge to `main` are part of this stage. They remain deferred to later build/merge phases. No production Firebase mutation, deployment, billing activation, or X-branch deletion was performed.
