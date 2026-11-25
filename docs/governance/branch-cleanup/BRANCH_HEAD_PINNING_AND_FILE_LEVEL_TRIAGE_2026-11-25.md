# Branch Head Pinning and File-Level Candidate Triage — 2026-11-25

## Reference point

Repository: `productionhome2022-hash/mawda-platform`

The GitHub branches API was read at this checkpoint. All 35 branches returned by the repository API are listed below with their immutable tip commit SHA. This is a snapshot; branch tips can move later.

| Branch | Pinned tip SHA |
|---|---|
| codex/biometric-server-lifecycle-2026-11-20 | f79f146e96b9a4ae1210a1fcc37a861ebebcd294 |
| codex/canonical-role-terminology-owner-confirmation-2026-11-19 | 64ccc7b20445e7be15d6ec4d0be0e329f0250f11 |
| codex/economic-phase1-closeout-2026-11-18 | 10564784494310761bb4249d703d646020209e35 |
| codex/economic-phase-completion-2026-11-18 | 0914885232ff8bcfb64536c6655e7bff01b78361 |
| codex/economic-phase-controlled-integration-2026-11-19 | beec6e424ccdb1f1df24d44b2893212983508f7e |
| codex/economy-official-port-2026-11-18 | d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c |
| codex/economy-recovery-2026-11-18 | 67adbaeccc02128f5e5a86ea01b0c4f63c09106f |
| codex/featured-ads-secure-lifecycle-20261118 | b15b643f14bc6c1196bf914190778e053e2ac9b1 |
| codex/featured-ads-serving-foundation | 0fe15db693eb0a36a73c11a6e563e189069e74ba |
| codex/governance-biometric-integration-2026-11-19 | 619eab643e2d5849b3b2c055461d53ba2be01753 |
| codex/mawda-full-platform-implementation | f9a686ddbb260a998825d046695a4fa817a99835 |
| codex/mawda-recovery-integration-2026-11-21 | 49b502638718e4dbb29a9429f392b3a70c8d6d95 |
| codex/mawda-unified-constitution-vision-2026-11-19 | 53bf236076d617f625b1b4225eb014e5c90e17fb |
| codex/mawdda-biometric-proof-gate-2026-11-20 | 73b53918e2de76d97d9f9cf7dff1706cc9d124b5 |
| codex/mawdda-deep-governance-audit-2026-11-19 | ae21101e7e76001b64b43b6bf515c85ea028f34e |
| codex/mawdda-economy-selective-port-2026-11-19 | 7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0 |
| codex/mawdda-group-call-capacity-2026-11-20-r2 | c0a14ef27b3c0442c969f872243214e637cdc188 |
| codex/mawdda-group-call-capacity-2026-11-20 | 2f67e4a6cdaeedf5190cbd2e3acdb0ece4747c0a |
| codex/mawdda-independent-verification-cycles-2026-11-20 | 615f9f974ea9e252772bee43339261288b7a2729 |
| codex/mawdda-independent-verification-cycles-dev-2026-11-20 | 2064bbcc98aa360ac2d46d05d15cbf8f90561817 |
| codex/mawdda-retention-approval-ci-repair-2026-11-19 | 179ba95fa582082c7ed32c3f3016b899b414b0ca |
| codex/mawdda-role-capacity-after-retention-2026-11-19 | 5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51 |
| codex/mawdda-role-capacity-consolidation-2026-11-19 | 7a134c6d5adf02f8e2bbd3b931deb5ef592fbf1c |
| codex/mawdda-role-capacity-final-2026-11-19 | 138d9b5d6624d111d61b6b71bf0cb60a8b17050d |
| codex/mawdda-step1-role-reconcile-2026-11-19 | ea6b05253ab702e773611ec48d31518a50943acd |
| codex/mawdda-super-owner-biometric-state-machine-2026-11-20 | 40845f2de04106081640b9e83bb8d0fa983fbf49 |
| codex/mawdda-unified-test-2026-11-18 | b62fcbae7ea3cd0c2b473f730cb625b35335de67 |
| codex/phase1-ci-coverage-role-store-2026-11-20 | d46cd7095915bf98480ef38574356c62d72e6a95 |
| codex/phase1-direct-call-transaction-revalidation-2026-11-20 | b78817d0e6d7a73398fcce1d54c7df4f6707d045 |
| codex/phase1-featured-ad-geography-all-arab-2026-11-20 | ac22ff635c41e4a36603c8864af53942e22e3fcb |
| codex/phase1-media-direct-delivery-denials-2026-11-20 | b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e |
| codex/phase1-media-hold-delete-race-2026-11-20 | 43471705e469f09e55658660b8b9f921401a00d4 |
| codex/phase1-rented-room-call-gate-2026-11-20 | 41dc2c2fd679f736d48f912c1e248f8615554649 |
| codex/phase1-scanner-error-callback-test-2026-11-20 | 20519494a898b19f08bcaf4f22e4af64acff622b |
| codex/phase1-store-gift-concurrency-2026-11-20 | 2f175165ed17a1a02b47439bacfbb187b1e00d6e |
| codex/structural-governance-biometric-roles-2026-11-19 | e71f3eb559e7f86edecd97fb366ad9c69b5817c5 |
| main | 2fda8ad78452911c0f269be8ab95008d11f09a0f |

## Full Platform and Recovery comparison

- Full Platform tip at this snapshot: `f9a686ddbb260a998825d046695a4fa817a99835`.
- Recovery tip at this snapshot: `49b502638718e4dbb29a9429f392b3a70c8d6d95`.
- GitHub compare reports the two branches as `diverged`, with Full Platform 911 commits ahead and 53 behind Recovery, and a capped/limited 300-file response. This is not a safe basis for a blanket merge.
- The current blob SHA for `functions/src/biometric-lifecycle.ts` was identical on both refs when fetched: `9b78166147187ef6fa7357538a64703d88ac116d`. This is a blob identity fact for that file only, not branch-head identity.

## Branch-tip compare coverage

GitHub compare was run from the pinned Full Platform tip to each listed source branch tip (excluding Full Platform and main). Results below show compare status and GitHub ahead/behind counts. All sampled source branches were divergent.

| Source branch | Ahead | Behind | Changed files returned |
|---|---:|---:|---:|
| Recovery | 911 | 53 | 300 (response cap) |
| biometric-server-lifecycle | 73 | 603 | 23 |
| canonical-role-terminology | 5 | 861 | 4 |
| economic-phase1-closeout | 124 | 953 | 34 |
| economic-phase-completion | 181 | 953 | 45 |
| economic-phase-controlled-integration | 21 | 861 | 8 |
| economy-official-port | 20 | 953 | 9 |
| economy-recovery | 618 | 953 | 105 |
| featured-ads-secure-lifecycle | 199 | 954 | 58 |
| featured-ads-serving-foundation | 139 | 953 | 31 |
| governance-biometric-integration | 89 | 950 | 39 |
| mawda-unified-constitution-vision | 142 | 861 | 64 |
| mawdda-biometric-proof-gate | 12 | 645 | 9 |
| mawdda-deep-governance-audit | 10 | 861 | 1 |
| mawdda-economy-selective-port | 10 | 777 | 9 |
| mawdda-group-call-capacity-r2 | 5 | 643 | 4 |
| mawdda-group-call-capacity | 6 | 645 | 4 |
| mawdda-independent-verification-cycles | 12 | 643 | 9 |
| mawdda-independent-verification-cycles-dev | 11 | 721 | 9 |
| mawdda-retention-approval-ci-repair | 17 | 861 | 10 |
| mawdda-role-capacity-after-retention | 22 | 861 | 12 |
| mawdda-role-capacity-consolidation | 6 | 861 | 6 |
| mawdda-role-capacity-final | 40 | 861 | 16 |
| mawdda-step1-role-reconcile | 32 | 861 | 18 |
| mawdda-super-owner-biometric-state-machine | 6 | 642 | 4 |
| mawdda-unified-test | 311 | 953 | 77 |
| phase1-ci-coverage-role-store | 1 | 686 | 1 |
| phase1-direct-call-transaction-revalidation | 5 | 670 | 3 |
| phase1-featured-ad-geography-all-arab | 2 | 663 | 2 |
| phase1-media-direct-delivery-denials | 3 | 652 | 2 |
| phase1-media-hold-delete-race | 7 | 664 | 3 |
| phase1-rented-room-call-gate | 6 | 686 | 4 |
| phase1-scanner-error-callback-test | 12 | 686 | 2 |
| phase1-store-gift-concurrency | 2 | 686 | 2 |
| structural-governance-biometric-roles | not yet compared in this pass | — | — |

The compare API provides branch-tip changed-file summaries, not a semantic classification of every commit in the CSV. Recovery's 300-file response is capped and must be expanded through scoped file/commit batches.

## Initial file/diff observations (not final classification)

- Candidate commit `ac22ff635c41e4a36603c8864af53942e22e3fcb` adds a focused test for the `all_arab_countries` campaign target. The branch-tip compare lists only `functions/src/featured-advertising.ts` and its test. The exact current target file/test comparison has not yet been completed.
- Candidate commit `43471705e469f09e55658660b8b9f921401a00d4` adds a suspended/banned member room-message-read integration test. It is not proof by itself that the relevant behavior is absent from Full Platform.
- Candidate commit `b78817d0e6d7a73398fcce1d54c7df4f6707d045` adds malformed/missing snapshot direct-call eligibility tests. Its branch also changes `functions/src/index.ts` and `functions/src/room-call-policy.ts`; earlier commits on that branch must be inspected before any port.
- Candidate commit `2f175165ed17a1a02b47439bacfbb187b1e00d6e` adds a workflow step to run store-gifting integration tests. This workflow change requires checking the current package script and CI workflow to avoid duplicate or incompatible wiring.
- Candidate commit `c0a14ef27b3c0442c969f872243214e637cdc188` changes a group-audio fixture capacity from `count` to `Math.max(5, count)`. It requires test-fixture and current behavior comparison before any port.
- Candidate commit `20519494a898b19f08bcaf4f22e4af64acff622b` is a documentation-only cleanup removing an old report section, not evidence of a missing product change.

## Classification status at this checkpoint

- **Present already:** some biometric behaviors were found in the current Full Platform source, as recorded in `CSV_1665_RECOVERY_AND_TRIAGE_2026-11-25.md`.
- **Duplicate:** not yet assigned globally; requires exact patch/content/behavior comparison.
- **Unique missing:** not yet certified; no code transfer is authorized by this evidence alone.
- **Conflicting / unprovable:** divergent branch histories and capped Recovery comparison make bulk ancestry-based conclusions unsafe; affected items remain unverified until per-file and per-commit inspection.

## Transfer and test status

No candidate code was transferred in this checkpoint. No tests were executed. No PR was merged, no main ref was changed, and no production/Firebase resource was touched.

## Next required sequence

1. Finish pinning/compare for the remaining structural-governance branch and confirm all CSV branches are accounted for.
2. Parse the CSV's 1,665 unique unmatched SHAs into branch-ordered candidate batches and inspect exact commit patches.
3. For each changed path, fetch the exact Full Platform and Recovery versions; compare content and behavior, including tests and workflow scripts.
4. Assign one of the four requested classifications with evidence and a confidence/unknown marker.
5. Port only certified unique missing changes, one isolated batch at a time.
6. Run relevant existing GitHub Actions/CI checks against each batch commit; record run IDs, SHA, exact outcome. Do not infer tests from historical runs.
7. Recheck Full Platform head before each write and use expected-SHA protection.
