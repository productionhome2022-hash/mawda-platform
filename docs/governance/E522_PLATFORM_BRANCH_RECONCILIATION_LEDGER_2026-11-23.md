# E522 / Recovery Branch Reconciliation Ledger — 2026-11-23

**Repository:** `productionhome2022-hash/mawda-platform`  
**Canonical baseline:** `e522acb5a47964b529b84f49bacd9db0167a6dc5`  
**Only integration destination:** `codex/mawda-recovery-integration-2026-11-21`  
**Final retained refs:** `main` and `codex/mawda-recovery-integration-2026-11-21`  
**Status:** initial complete branch-ref inventory and compare pass; feature-level review and porting remain in progress.

## 1. Scope and exact inventory

A fresh GitHub branches API inventory returned 84 refs: 79 X-classified source branches, three archive refs, Recovery, and main. The archive manifest at `docs/MAWADDA_DOCUMENTATION_GOVERNANCE_CONTRACTS_CONSTITUTION_VISION/X_BRANCH_SECTION/X_FROZEN_BRANCH_ARCHIVE_MANIFEST_2026-11-23.md` enumerates exactly 79 source branch tips. Each exact SHA below was read from that manifest and cross-checked against the live branches API inventory.

The owner-reported figure of 76 and an older 61-entry register are both superseded as counts by the current live inventory: 79 X source refs were found. This is a factual inventory result, not a claim that the 79 branches contain 79 unique feature sets.

## 2. Comparison method and current disposition

Each of the 79 source branch refs was compared with the current Recovery ref using GitHub's commit comparison endpoint. The following statuses are interpreted narrowly:

- **BEHIND / 0 ahead commits:** the source ref is an ancestor of Recovery in commit history. This proves its commits are reachable from Recovery, but does not prove its older tree contents are still present: Recovery may have subsequently changed or removed files. Compare the actual source tree against the Recovery tree before disposition or deletion.
- **DIVERGED:** the source has commits on a divergent ancestry. The compare endpoint lists files changed from the merge base; those files may already be incorporated, superseded, or conflicting in Recovery. Actual source-tree-to-Recovery-tree comparison and file-level review are mandatory.
- A DIVERGED result with zero changed files is still recorded as diverged until commit metadata and the exact tree relationship are independently explained. GitHub compare-file lists are not a direct tree-diff report.
- Comparison is not a substitute for inspecting implementation, contracts, security, tests, dependencies, or policy. No branch is declared feature-complete from ancestry alone.

**Initial comparison totals:** 17 source refs are BEHIND with zero ahead commits and zero changed paths against Recovery; 62 are DIVERGED and require disposition. No branch has been deleted. No feature port is claimed complete by this inventory.

## 3. X source branch inventory

| # | Source branch | Exact tip SHA | Recovery comparison disposition |
|---:|---|---|---|
| 1 | `codex/biometric-final-owner-policy-2026-11-20` | `08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23` | BEHIND / 0 unique tree delta against Recovery |
| 2 | `codex/biometric-final-policy-drift-closure-2026-11-20` | `0089c556a7e241454cfbfb3223fff500cc8763bb` | BEHIND / 0 unique tree delta against Recovery |
| 3 | `codex/biometric-manual-review-gate-2026-11-20` | `a82a0614f7526bfb56c6bcc93764a5b907406e95` | BEHIND / 0 unique tree delta against Recovery |
| 4 | `codex/biometric-server-lifecycle-2026-11-20` | `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` | DIVERGED / feature-level disposition pending |
| 5 | `codex/biometric-video-duration-validation-2026-11-20` | `be9b8109c8ae4b62a0b17e9b70a851307a3294f6` | BEHIND / 0 unique tree delta against Recovery |
| 6 | `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | `64ccc7b20445e7be15d6ec4d0be0e329f0250f11` | DIVERGED / feature-level disposition pending |
| 7 | `codex/economic-phase-completion-2026-11-18` | `0914885232ff8bcfb64536c6655e7bff01b78361` | DIVERGED / feature-level disposition pending |
| 8 | `codex/economic-phase-controlled-integration-2026-11-19` | `beec6e424ccdb1f1df24d44b2893212983508f7e` | DIVERGED / feature-level disposition pending |
| 9 | `codex/economic-phase1-closeout-2026-11-18` | `10564784494310761bb4249d703d646020209e35` | DIVERGED / feature-level disposition pending |
| 10 | `codex/economy-official-port-2026-11-18` | `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c` | DIVERGED / feature-level disposition pending |
| 11 | `codex/economy-recovery-2026-11-18` | `67adbaeccc02128f5e5a86ea01b0c4f63c09106f` | DIVERGED / feature-level disposition pending |
| 12 | `codex/featured-ads-secure-lifecycle-20261118` | `b15b643f14bc6c1196bf914190778e053e2ac9b1` | DIVERGED / feature-level disposition pending |
| 13 | `codex/featured-ads-serving-foundation` | `0fe15db693eb0a36a73c11a6e563e189069e74ba` | DIVERGED / feature-level disposition pending |
| 14 | `codex/governance-biometric-integration-2026-11-19` | `619eab643e2d5849b3b2c055461d53ba2be01753` | DIVERGED / feature-level disposition pending |
| 15 | `codex/mawda-full-platform-implementation` | `93d19a2cc35dafc5df3c1253d4cbef8cf8e11466` | DIVERGED / feature-level disposition pending |
| 16 | `codex/mawda-phase2-hardening` | `f8abd722ececc988c555f0400cc7b558e762ae5a` | DIVERGED / feature-level disposition pending |
| 17 | `codex/mawda-unified-constitution-vision-2026-11-19` | `53bf236076d617f625b1b4225eb014e5c90e17fb` | DIVERGED / feature-level disposition pending |
| 18 | `codex/mawdda-audit-archive` | `6a94a078695bd8d70884a843efb7cf9d3bfc740a` | DIVERGED / feature-level disposition pending |
| 19 | `codex/mawdda-audit-archive-full` | `5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47` | BEHIND / 0 unique tree delta against Recovery |
| 20 | `codex/mawdda-biometric-owner-review-policy-2026-11-20` | `693dc110a931107f2fcc1f829e08974932ab65db` | DIVERGED / feature-level disposition pending |
| 21 | `codex/mawdda-biometric-proof-gate-2026-11-20` | `73b53918e2de76d97d9f9cf7dff1706cc9d124b5` | DIVERGED / feature-level disposition pending |
| 22 | `codex/mawdda-deep-audit-profile-store` | `4ed7394235ea531e4b4abbb24431731da15eaf47` | BEHIND / 0 unique tree delta against Recovery |
| 23 | `codex/mawdda-deep-governance-audit-2026-11-19` | `ae21101e7e76001b64b43b6bf515c85ea028f34e` | DIVERGED / feature-level disposition pending |
| 24 | `codex/mawdda-economy-selective-port-2026-11-19` | `7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0` | DIVERGED / feature-level disposition pending |
| 25 | `codex/mawdda-final-archive-v2` | `f79b112c628c8a1709f860a8d25c1f975eddcace` | DIVERGED / feature-level disposition pending |
| 26 | `codex/mawdda-group-call-capacity-2026-11-20` | `2f67e4a6cdaeedf5190cbd2e3acdb0ece4747c0a` | DIVERGED / feature-level disposition pending |
| 27 | `codex/mawdda-group-call-capacity-2026-11-20-r2` | `c0a14ef27b3c0442c969f872243214e637cdc188` | DIVERGED / feature-level disposition pending |
| 28 | `codex/mawdda-independent-verification-cycles-2026-11-20` | `615f9f974ea9e252772bee43339261288b7a2729` | DIVERGED / feature-level disposition pending |
| 29 | `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | `2064bbcc98aa360ac2d46d05d15cbf8f90561817` | DIVERGED / feature-level disposition pending |
| 30 | `codex/mawdda-member-inbox` | `f55e1d15423abee81dc125315e95a9acea199fdf` | DIVERGED / feature-level disposition pending |
| 31 | `codex/mawdda-member-inbox-rebased` | `4933e76a38501ac533c37fbac2fc9c7078f5c597` | DIVERGED / feature-level disposition pending |
| 32 | `codex/mawdda-mfa-signin` | `607647ec0325eaf56bd58a4c2283aedaa47e7e68` | BEHIND / 0 unique tree delta against Recovery |
| 33 | `codex/mawdda-native-platform-scaffold` | `d556a9990ffe4472fe86ab48acc696adc9c109f6` | BEHIND / 0 unique tree delta against Recovery |
| 34 | `codex/mawdda-phase1-phase2-hardening` | `cacdc51f22f7146145a81c5e4d0729aee5f5063d` | DIVERGED / feature-level disposition pending |
| 35 | `codex/mawdda-phase1-unified-2026-11-19` | `e12897ad7dc5f383501d997117fb1211c67632e7` | BEHIND / 0 unique tree delta against Recovery |
| 36 | `codex/mawdda-pr3-port` | `6e11d5a631d61f9e92b37fd64c827f37ec8e9c11` | BEHIND / 0 unique tree delta against Recovery |
| 37 | `codex/mawdda-premium-effects` | `5203d25ab38df8ae2a2bd700537e2f0d14bfbde3` | DIVERGED / feature-level disposition pending |
| 38 | `codex/mawdda-premium-features` | `f3884061a5d7be3836adc6d6b94de10e534625ab` | BEHIND / 0 unique tree delta against Recovery |
| 39 | `codex/mawdda-retention-approval-ci-repair-2026-11-19` | `179ba95fa582082c7ed32c3f3016b899b414b0ca` | DIVERGED / feature-level disposition pending |
| 40 | `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | DIVERGED / feature-level disposition pending |
| 41 | `codex/mawdda-role-capacity-after-retention-2026-11-19` | `5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51` | DIVERGED / feature-level disposition pending |
| 42 | `codex/mawdda-role-capacity-consolidation-2026-11-19` | `7a134c6d5adf02f8e2bbd3b931deb5ef592fbf1c` | DIVERGED / feature-level disposition pending |
| 43 | `codex/mawdda-role-capacity-final-2026-11-19` | `138d9b5d6624d111d61b6b71bf0cb60a8b17050d` | DIVERGED / feature-level disposition pending |
| 44 | `codex/mawdda-room-audio-duration-enforcement` | `dc1c1a43f6c8b4cfb198544ad21975612f89ca83` | DIVERGED / feature-level disposition pending |
| 45 | `codex/mawdda-room-events` | `b0b5214ab3b3b31f2c4ff494ce6ffe3536ae1615` | DIVERGED / feature-level disposition pending |
| 46 | `codex/mawdda-safety-ui` | `1e4c6aa97a679d0eaa88708571341e79e9e06c68` | BEHIND / 0 unique tree delta against Recovery |
| 47 | `codex/mawdda-step1-role-reconcile-2026-11-19` | `ea6b05253ab702e773611ec48d31518a50943acd` | DIVERGED / feature-level disposition pending |
| 48 | `codex/mawdda-store-entitlement-coverage` | `7b53ad8e3418d3e9494517862ade66a010871564` | DIVERGED / feature-level disposition pending |
| 49 | `codex/mawdda-store-entitlement-hardening` | `bca089273f4c3652eeb01d27f5cc2788c386c060` | DIVERGED / feature-level disposition pending |
| 50 | `codex/mawdda-store-entitlement-hardening-v2` | `7506f5d4034b58477fe0bfbc28ab90ead4f77eb0` | DIVERGED / feature-level disposition pending |
| 51 | `codex/mawdda-store-wallet-entitlement-closure` | `201f5bfc8d73a982e9edab9be6858b085c2b2eb8` | DIVERGED / feature-level disposition pending |
| 52 | `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | `40845f2de04106081640b9e83bb8d0fa983fbf49` | DIVERGED / feature-level disposition pending |
| 53 | `codex/mawdda-test-account-system` | `d89d30a623369e5b687525297b97257192a27462` | DIVERGED / feature-level disposition pending |
| 54 | `codex/mawdda-unified-final` | `ddf9594ea6029036512ace621f513d6edf58a068` | DIVERGED / feature-level disposition pending |
| 55 | `codex/mawdda-unified-final-v2` | `e249c664f9a48dd8a198e274b38033a7cbba0a3d` | BEHIND / 0 unique tree delta against Recovery |
| 56 | `codex/mawdda-unified-final-v3` | `ab5e37e6d7f437a491e85883b91e8bcde76d438e` | BEHIND / 0 unique tree delta against Recovery |
| 57 | `codex/mawdda-unified-release` | `42e11d492584a556e018e70db2eed71de84616fa` | DIVERGED / feature-level disposition pending |
| 58 | `codex/mawdda-unified-test-2026-11-18` | `b62fcbae7ea3cd0c2b473f730cb625b35335de67` | DIVERGED / feature-level disposition pending |
| 59 | `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | BEHIND / 0 unique tree delta against Recovery |
| 60 | `codex/phase1-branch-governance-audit-2026-11-20` | `a48e93aa04d024f27c8877df42555050b95f9f71` | DIVERGED / feature-level disposition pending |
| 61 | `codex/phase1-ci-coverage-role-store-2026-11-20` | `d46cd7095915bf98480ef38574356c62d72e6a95` | DIVERGED / feature-level disposition pending |
| 62 | `codex/phase1-ci-evidence-2026-11-20` | `6ad595cf10964ab54a39f3b0629efd5f8ef6e043` | DIVERGED / feature-level disposition pending |
| 63 | `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | DIVERGED / feature-level disposition pending |
| 64 | `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | DIVERGED / feature-level disposition pending |
| 65 | `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | DIVERGED / feature-level disposition pending |
| 66 | `codex/phase1-integration-batch-01-inventory-2026-11-19` | `2fff6276055de44bc488cc123cec16491421a8e6` | BEHIND / 0 unique tree delta against Recovery |
| 67 | `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | DIVERGED / feature-level disposition pending |
| 68 | `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | DIVERGED / feature-level disposition pending |
| 69 | `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | DIVERGED / feature-level disposition pending |
| 70 | `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | DIVERGED / feature-level disposition pending |
| 71 | `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | DIVERGED / feature-level disposition pending |
| 72 | `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | DIVERGED / feature-level disposition pending |
| 73 | `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | DIVERGED / feature-level disposition pending |
| 74 | `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | DIVERGED / feature-level disposition pending |
| 75 | `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | DIVERGED / feature-level disposition pending |
| 76 | `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | DIVERGED / feature-level disposition pending |
| 77 | `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | DIVERGED / feature-level disposition pending |
| 78 | `codex/production-readiness-tests` | `424599a34acc9ec33b4e759ba166dc6d0a9df04d` | BEHIND / 0 unique tree delta against Recovery |
| 79 | `codex/structural-governance-biometric-roles-2026-11-19` | `e71f3eb559e7f86edecd97fb366ad9c69b5817c5` | DIVERGED / feature-level disposition pending |

## 4. Archive manifest integrity discrepancy

The archive manifest itself states target E522 base `19f133e8e89a4d6f3d45383f5782b51cb9d75eeb`, which does not match the owner-approved canonical E522 SHA `e522acb5a47964b529b84f49bacd9db0167a6dc5`. Treat that manifest baseline declaration as stale/unverified and do not use it to redefine E522. The 79 source tip SHAs remain useful as inventory evidence because they match live branch refs; the manifest's base declaration requires correction in a later audit entry.

The X archive ref is a historical multi-parent commit, not a copy of the current Recovery tree. Its direct tree contains 1,622 blobs, one source-only manifest, three common paths with differing blob SHAs, and 1,199 Recovery-only paths. Its 79 source-tip parents preserve ancestry, but its tree does not itself contain the current Recovery platform body. This is not sufficient to close any source branch: each source ref remains subject to individual comparison and disposition.

## 5. Cleanup gate

For each DIVERGED row: inspect the exact source commit/tree and every changed path; inspect tests, contracts, dependencies and policy/security effects; decide already-present / port / adapt / superseded / conflict / prohibited / pending; record evidence and destination commit; run relevant tests on the resulting Recovery head; only then mark the source ref eligible for deletion.

For each BEHIND row: retain the exact SHA and ancestry evidence, compare its full source tree with Recovery, inspect any source-only or differing blobs (including files later removed from Recovery), verify there is no open review or unique required evidence only on that ref, then mark it eligible for deletion. Deletion is owner-authorized after the per-branch gate, but no delete-ref capability has yet been confirmed in the connected GitHub tools.

Protected refs: never delete or update `main` or Recovery. Do not merge to main, deploy, mutate production Firebase, enable billing, change live retention, or touch the separate `productionhome2022-hash/mawdda-5000-simulation-lab` repository.

## 6. Execution evidence

- Live branches API inventory: 84 refs.
- X manifest source-tip inventory: 79 rows, each with exact SHA.
- Recovery compare pass: 79 of 79 source refs queried.
- BEHIND / zero-ahead ancestry refs: 17.
- DIVERGED refs requiring feature-level disposition: 62.
- Source branches deleted: 0.
- Feature ports completed by this ledger: 0 (no code-port is claimed by inventory alone).
- Automated tests run during this inventory pass: none.
- Final branch shape achieved: no; execution remains in progress.


## 7. Important method correction — actual tree comparison

The GitHub compare endpoint reports ancestry and changes from the merge base; its `files` array is not a direct byte-for-byte comparison of the two branch-tip trees. A source branch can be an ancestor of Recovery while its older tree still contains files or blob versions that Recovery later changed or removed. Therefore, **no branch may be cleared or deleted on the ancestry comparison alone**.

A direct tree audit has started using each exact source tip's commit tree and the current Recovery tree (Recovery tree SHA at the start of this pass: `2ed5f1c78853c341594a9581f1423dacbe012c62`, Recovery commit `8c226699bc1262e81d08c35ebaf471e4e8def47b`). The first nine source refs were tree-inspected. This direct audit must be completed for every source ref before any deletion eligibility is declared.


## 8. Direct recursive tree comparison — 2026-11-23

The full recursive Git tree for Recovery commit `8c226699bc1262e81d08c35ebaf471e4e8def47b` was retrieved (tree `2ed5f1c78853c341594a9581f1423dacbe012c62`, 3,130 blob entries, not truncated). Each of the 79 source branch tip SHAs was resolved to its commit tree and compared by path and blob SHA against that Recovery tree. All 79 source trees were retrieved without truncation.

The source trees are substantially older/smaller than Recovery. Direct tree comparison found:
- 60 source refs contain the same four source-only paths absent from Recovery:
  - `functions/scripts/generate-persona-load-fixtures.cjs`
  - `functions/src/featured-ad-rewards.ts`
  - `functions/test/featured-ad-rewards.test.js`
  - `functions/test/integration/persona-load.integration.test.js`
- One additional source ref, `codex/economy-recovery-2026-11-18`, contains those four paths plus `functions/test/integration/featured-ad-reward-policy.integration.test.js`.
- 18 source refs have no source-only blob paths compared with Recovery.
- Many source files differ by blob SHA because the branch trees are older or diverged; a blob mismatch is not by itself proof that the source version is newer or should replace Recovery.

### Disposition of the recurring source-only paths

- `featured-ad-rewards.ts` and its unit/integration tests are **NOT PORTED / ARCHITECTURE AND POLICY REVIEW REQUIRED**. The older `codex/biometric-server-lifecycle-2026-11-20` version enables defaults of 2 coins/view, 10 views/day, 20 coins/day, and 3 rewards/campaign/24h; the later `codex/economy-recovery-2026-11-18` and `codex/mawdda-unified-test-2026-11-18` versions correctly change defaults to disabled/zero pending owner configuration. Do not port the older enabled defaults. More importantly, the associated session/reward lifecycle uses a separate `featuredAdCampaigns` model alongside `timedAdCampaigns`, directly increments `user.coins` instead of using the central wallet transaction service, and has no connected trusted visibility/playback attestation provider (`serverValidatedVisibility` starts false). Its settlement path is fail-closed without that provider. It must be redesigned against the central campaign/economy model and wallet ledger before integration; no rewards are activated.
- The persona fixture generator and 5,000-persona integration harness are **NOT PORTED / SEPARATE-LAB BOUNDARY**. They generate and provision synthetic personas and exercise broad load scenarios. The owner-approved repository shape keeps `productionhome2022-hash/mawdda-5000-simulation-lab` independent; do not copy these files into the platform branch as a shortcut or treat them as proof of a 5,000-persona run. Their value and any future use must be handled within the separate simulation-lab workflow.
- The additional reward-policy integration test in `codex/economy-recovery-2026-11-18` remains subject to the same unapproved reward-policy restriction.

No source-only file from this recurring set has been ported. These are explicit dispositions for the identified paths, not a final deletion clearance for any source branch. Branch-by-branch review of differing existing files and all remaining source-specific deltas is still required.


## 9. Feature-level spot reconciliation — verified source examples

The following source deltas were inspected against the current Recovery implementation and are recorded as already present, superseded, or pending rather than blindly merged:

| Source ref / feature | Evidence in Recovery | Disposition |
|---|---|---|
| `codex/biometric-server-lifecycle-2026-11-20` — fresh Super Owner evidence playback grant before acceptance | Recovery `functions/src/biometric-lifecycle.ts` writes `biometricOwnerPlaybackGrants`, binds audio/video hashes and expiry, and consumes the grant transactionally. Recovery additionally requires versioned consent, a 20-second biometric-audio maximum, and atomic wallet-ledger credit. | **ALREADY PRESENT / SOURCE VERSION SUPERSEDED** |
| `codex/mawdda-room-audio-duration-enforcement` — live audio cap | Recovery `lib/policies/chat_audio_policy.dart` sets `maxLiveChatAudioRecordingSeconds = 60`; Recovery media upload enforces 5 MiB audio. Source branch used a 25 MiB audio ceiling and an 8 MiB raw recording cap, which conflict with the owner-approved 5 MiB audio maximum. | **ALREADY PRESENT / SOURCE LIMITS REJECTED** |
| `codex/mawdda-group-call-capacity-2026-11-20` — revalidate room capacity inside call-creation transaction | Recovery `functions/src/index.ts` re-reads `roomCallParticipantLimit` inside the transaction and fails closed if participant count exceeds the current limit. | **ALREADY PRESENT** |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` — malformed/missing direct-call identity snapshots | Recovery `functions/test/room-call-policy.test.js` includes the malformed and missing snapshot regression cases. | **ALREADY PRESENT** |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` and `codex/mawdda-member-inbox-rebased` — block/suspension/account-standing checks for direct media | Recovery `functions/test/integration/media-callables.integration.test.js` covers suspended/banned/unknown states, blocked participants and account standing on both sides. | **ALREADY PRESENT** |
| `codex/phase1-media-hold-delete-race-2026-11-20` — suspended member cannot read room messages despite retained membership | Recovery has the same `getRoomMessages` account-standing check in `functions/src/index.ts` and a dedicated regression test in `functions/test/integration/media-callables.integration.test.js`. | **ALREADY PRESENT** |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` — remainder coin allocation | Recovery `functions/test/group-call-economy.test.js` asserts that every integer remainder coin is assigned to the initiator. | **ALREADY PRESENT** |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` — idempotent scanner callback replay | Recovery `functions/test/integration/media-callables.integration.test.js` covers idempotent replay; the server handler exposes `idempotentReplay`. | **ALREADY PRESENT** |
| `codex/phase1-store-gift-concurrency-2026-11-20` — concurrent idempotent gift replay | Recovery contains the store-gifting integration test and the validation workflow invokes `test:store-gifting-integration`. | **ALREADY PRESENT** |
| `codex/mawdda-member-inbox` — home dashboard shortcuts to messages and stories | Recovery `lib/screens/main_user_screen.dart` imports and navigates to both `ConversationsScreen` and `StoriesScreen`. | **ALREADY PRESENT** |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` — `all_arab_countries` targeting | Source code treats `all_arab_countries` as a wildcard for any `audienceGeography`; it does not enforce an allowlist of Arab countries. Recovery's selector explicitly remains non-geographic. The all-Arab grouping is not ported until a supported-country taxonomy and owner-approved targeting contract are established. | **PENDING POLICY / NOT PORTED** |

### New selective security-test port

A focused server-only Firestore rules regression test was ported from the featured-ad security source into Recovery:

- File: `functions/test/rules/firestore.rules.test.js`
- It explicitly checks both reads and writes are denied for actual source-defined featured-ad paths: `featuredAdCampaigns`, `featuredAdViewingSessions`, `users/{uid}/featuredAdRewardDays`, `featuredAdCampaignMembers`, `platformSettings/featuredAdRewardPolicy`, `timedAdCampaigns`, `timedAdCampaignVersions`, `featuredAdFinancials` and its `events` subcollection, `featuredAdFinancialVersions`, and `adminAuditLogs`.
- Recovery commit: `9521d8789382811dac73e40a46030285078821d9`.
- GitHub Actions runs created for this exact commit:
  - `45170757407` — Economic phase verification: **success**.
  - `45170757335` — Validate Mawda: **in progress** at last observation.
  - `45170757416` — Mawdda economy regression: **in progress** at last observation.
  - `45170757337` — Mawdda Test Center: **pending** at last observation.
- No test is claimed passed except the workflow explicitly marked success. The remaining run statuses must be checked again.

These examples are representative evidence, not a claim that every differing blob in all 79 source trees has been semantically reviewed.


Additional spot findings:
- `codex/mawdda-audit-archive`: its head commit adds external GCS checkpoint reconciliation (object name, archive SHA-256, last sequence and final hash). Recovery `functions/src/index.ts` already performs the same external checkpoint verification and releases the lease on mismatch. **ALREADY PRESENT**.
- `codex/mawdda-premium-effects`: its head commit proposes deleting the anonymous Firebase Auth account when a guest session ends. Recovery `lib/services/auth_service.dart` intentionally calls the server `endGuestSession` while preserving the anonymous UID, and the Recovery screen asks for confirmation. This preserves the server-side 24-hour guest cooldown and prevents recreating anonymous UIDs to reset it. **SOURCE BEHAVIOR SUPERSEDED / NOT PORTED**.


## 10. Non-X archive refs — initial comparison and tree evidence

The three archive refs are separate from the 79 X source refs and must also be reviewed before final cleanup:

| Archive ref | Exact tip SHA | Recovery ancestry comparison | Direct source-tree result | Initial disposition |
|---|---|---|---|---|
| `archive/X-frozen-branches-2026-11-23` | `e2883ca4d73285ccc7428a57e4624f923c637865` | Diverged; compare endpoint reports 1 changed file from merge base | Direct tree: 1,622 blobs; 1 source-only manifest; 3 common paths with differing blob SHAs; 1,199 Recovery-only paths; 80 parents (stale base + 79 X source tips) | **PENDING** until all 79 X branch feature reviews close; then candidate for deletion |
| `archive/development-pre-unification-2026-11-15` | `f068a8b2e3ad91551c2b27c9f554de04bbfc609e` | Behind; 0 ahead commits | 331 source blobs; 2 source-only files (`functions/scripts/generate-persona-load-fixtures.cjs`, `functions/test/integration/persona-load.integration.test.js`); recursive tree not truncated | **PENDING / SEPARATE-LAB BOUNDARY**; no transfer of persona-load harness |
| `archive/main-pre-unification-2026-11-15` | `460a79a7dc2e16f4ad146af22aab58e152ad1e8c` | Behind; 0 ahead commits | 31 source blobs; no source-only paths; recursive tree not truncated | **PENDING** final archive disposition and open-review check |

Recovery tree snapshot used for this archive comparison: commit `fdf83a2299f03a9ccef95ea3e26c7ed398465996`, tree `0af0249a615b3da8cb578c467fa31172ec65ead5`, 2,820 blobs, not truncated. The earlier 79-X-source tree comparison used the prior Recovery tree snapshot documented in section 8. Both snapshots are on the same Recovery line; intervening commits changed governance/test files, not the platform implementation.

No archive ref has been deleted. The X archive ref is not a substitute for completing the 79 individual source reviews.


### X archive direct-tree clarification

The direct recursive tree audit on the current Recovery snapshot confirms that `archive/X-frozen-branches-2026-11-23` is not tree-identical to Recovery except for its manifest. It contains 1,622 blobs versus Recovery's 2,820 blobs; it has the manifest as its only source-only path, three common paths with different blob SHAs, and 1,199 paths present only in Recovery. The earlier single-file result was the compare endpoint's merge-base file list, not a direct tree diff. The archive commit has 80 parents: first the stale base `19f133e8e89a4d6f3d45383f5782b51cb9d75eeb`, then the exact 79 source-tip SHAs in the manifest. All 79 manifest tip SHAs were programmatically cross-checked against live branch refs and all 79 appear among those parents. This parent structure preserves source-tip ancestry; it does not make the archive's own tree a complete platform snapshot.


### Live ref cross-check

The live GitHub branches API was re-read after the inventory. It returned 84 refs. All 79 manifest source names and tip SHAs matched their live branch refs exactly (79/79, zero SHA mismatches). The five remaining refs are the three archive refs, Recovery and main. Current protected refs at this observation: Recovery `1943b8d790a9f792764e4ca6b2995f249c92ddaf`; main `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f`. No main update or merge was performed.


## 11. Additional source feature checks

| Source feature | Recovery evidence | Disposition |
|---|---|---|
| `codex/mawdda-mfa-signin` — owner MFA enrollment gate | `lib/screens/auth_gate.dart` contains `_OwnerMfaGate` and routes through `owner_mfa_enrollment_screen.dart`. | **ALREADY PRESENT** |
| `codex/mawdda-role-capacity-final-2026-11-19` — do not cap active-grant reconciliation query at six | Recovery role-grant transaction queries active specialized grants without the old `.limit(6)`; the sovereign-callable denial regression is also present in `functions/test/integration/specialized-role-capacity.integration.test.js`. | **ALREADY PRESENT** |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` — store catalog version overflow | Recovery `functions/test/integration/wallet-store.integration.test.js` already tests `Number.MAX_SAFE_INTEGER` version overflow. | **ALREADY PRESENT** |
| `codex/mawdda-pr3-port` — abandoned media upload cleanup grace period | Recovery `functions/test/media-cleanup.test.js` covers `MEDIA_UPLOAD_CLEANUP_GRACE_MS`. | **ALREADY PRESENT** |
| `codex/mawdda-deep-audit-profile-store` — inbox/spam guidance for verification email | Recovery `lib/screens/auth_gate.dart` already contains the Inbox and Spam/Junk instructions. | **ALREADY PRESENT** |
| `codex/mawdda-final-archive-v2` / `codex/mawdda-audit-archive-full` — audit archive collection coverage and tests | Recovery `functions/src/audit-archive.ts`, `functions/src/index.ts`, and `functions/test/audit-archive.test.js` include the additional audit collections and the same archive test cases. | **ALREADY PRESENT** |
| `codex/mawdda-room-audio-duration-enforcement` — processor duration/size policy | Recovery `scanner/processors.js` and `scanner/test/processors.test.js` enforce 60 seconds for chat, room and biometric audio and 5 MiB audio output. Source branch allowed 120 seconds for chat and 25 MiB audio. | **RECOVERY VERSION RETAINED; SOURCE LIMITS REJECTED** |
| `codex/mawdda-native-platform-scaffold` — generate Android/iOS runners in CI | The source workflow runs `flutter create` with a generated native identity and writes to the former development branch. It is not ported: native/iOS registration and bundle identity are protected owner-controlled state. | **PROHIBITED / NOT PORTED** |

## 12. Selective port: immutable featured-ad financial provenance

Source: `codex/mawda-unified-constitution-vision-2026-11-19`.

The source branch had a useful audit feature missing from Recovery: bind each owner-recorded financial event to the exact immutable campaign-version snapshot and persist a nested `financialSnapshot` in the event. Recovery's newer pause-on-unreconciled-payment behavior was preserved.

Ported into Recovery:
- Resolve and validate the current campaign version snapshot before accepting a new financial event; for idempotent replay, resolve the version recorded by the original event.
- Bind the campaign version and immutable path into the financial-version document, event, current financial pointer, and owner audit record.
- Store nested financial snapshot fields (currency, received/refunded/reconciled amounts, review/payment state, financial version, currency exponent, payment-policy snapshot, campaign version and path).
- On replay, cross-check the nested snapshot against the immutable financial version and audit record.
- Fail closed when the campaign-version snapshot is missing or its key fields do not match the current campaign.
- Preserve Recovery's existing transaction that pauses a published featured campaign when payment/reconciliation state is not ready and writes the next campaign version.

**Recovery commits:** implementation `9ba1c268c4162884205f8757220ce9e0049808fb`, variable-scope correction `ad613b8e4c178fce5d41e7c2057a9af92095059d`, integration regression test `7d6ca5201fd4aebe02bdaa5217b77dde804e1f6a`.

The source test asserted campaign version 1 despite updating the campaign to version 2 before recording the payment. The Recovery regression test intentionally asserts version **2**, matching the exact campaign snapshot in effect when the financial event is recorded, and verifies that tampering with that snapshot rejects the event.

### Exact-head CI status for `7d6ca5201fd4aebe02bdaa5217b77dde804e1f6a`

- Run `45172429649` — Mawdda economy regression: **success** (Cloud Functions compile/unit regressions and wallet/entitlement/featured-ad/store emulator regressions).
- Run `45172429656` — Economic phase verification: **success**.
- Run `45172429815` — Validate Mawda: Cloud Functions compile/unit tests **success**; server evidence/authorization/biometric integration **success**; Flutter analysis/tests/web build **success**; comprehensive backend emulator integration **in progress** at last observation.
- Run `45172429731` — Mawdda Test Center: backend complete emulator-only suite and Flutter web release build **in progress** at last observation.

These CI suites are not the separate full 5,000-persona simulation and do not establish device acceptance, signed Android/iOS release readiness, production readiness, or deployment.


## 13. Cleanup capability and review gate

- Live GitHub pull-request query returned **0 open PRs** at the time of review.
- The connected GitHub action inventory exposes file deletion and issue/PR operations, but no branch-ref deletion action (`delete_branch` / `delete_ref`). No branch deletion has been attempted or claimed.
- Owner authorization for non-final branch deletion remains valid after each branch's full review gate; the current blocker is the absence of a branch-ref deletion capability in the connected toolset, not missing owner permission.
- Until that capability is available, keep all branch refs intact. Do not simulate deletion by rewriting refs, deleting files, force-pushing, or changing protected refs.
- Current final-state progress: 84 live refs remain; target is exactly `main` and Recovery. `main` has not been modified.


Latest live protected-ref check after the ledger update: Recovery `1943b8d790a9f792764e4ca6b2995f249c92ddaf`; `main` remains `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f`.


### Featured-ad reward lifecycle architecture review

The 2026-11-18 unified-test source includes start/complete viewing-session callables and server-side reward decisions. It remains **NOT PORTED** because:
1. the viewing/session path uses `featuredAdCampaigns`, while owner finance events use `timedAdCampaigns` and `timedAdCampaignVersions`—two campaign models that must be unified before activation;
2. the reward transaction updates `users/{uid}.coins` directly rather than using the platform's central wallet/ledger transaction service;
3. newly created sessions set `serverValidatedVisibility: false`; no trusted playback/visibility attestation provider is connected, so the reward path must remain fail-closed;
4. earlier versions enabled unapproved reward defaults; later versions corrected defaults to disabled/zero, but that does not resolve the model/wallet/attestation gaps.

This is a known unique feature family, not a forgotten branch delta. Its integration is blocked pending a central-model adaptation, central-wallet integration, and a trusted server-attestation provider. No client telemetry or client-authored visibility field may be treated as proof.


## 14. Latest verification update — 2026-11-23

The corrected server-only Firestore path test commit `f35191128af4d51d47277a535ab11e2a9e4fece6` completed GitHub Actions run `45173852293` with **success**:
- Cloud Functions compile and complete backend unit suite: success.
- Wallet/store atomicity, fixed coin-package gifts, owner entitlement grants/replay, featured-ad finance integration, store gifting, room-rental wallet/replay, email renewal, engagement rewards, call lifecycle, owner audit export, and Firestore/Storage rules regressions: all success.
- The new server-only featured-ad path assertions ran in the Firestore/Storage rules step and passed.

The broader acceptance workflows have now completed successfully on code head `7d6ca5201fd4aebe02bdaa5217b77dde804e1f6a`: `45172429815` Validate Mawda **success** (Cloud Functions compile/unit, server evidence/authorization/biometric integration, Flutter analysis/tests/web build, comprehensive backend emulator integration, isolated ClamAV scanner gateway tests/image build); `45172429731` Mawdda Test Center **success** (backend, Firebase rules, complete emulator journeys, Flutter analysis/tests and web release build). The corrected actual-path security test was committed later at `f35191128af4d51d47277a535ab11e2a9e4fece6` and its targeted economy regression run `45173852293` also **success**. The full Test Center suite was not rerun on `f351` itself; that later commit changes the Firestore test path list only, and the targeted workflow covering the corrected test passed.


### Completed CI acceptance snapshot

- `45172429815` — Validate Mawda, code head `7d6ca5201fd4aebe02bdaa5217b77dde804e1f6a`: **success**, all five jobs.
- `45172429731` — Mawdda Test Center, same code head: **success**, both jobs (backend/Firebase/emulator journeys and Flutter analysis/tests/web release build).
- `45173852293` — Mawdda economy regression, corrected security-test commit `f35191128af4d51d47277a535ab11e2a9e4fece6`: **success**, both jobs and every step including featured-ad finance integration and Firestore/Storage rules.
- The final 5,000-persona simulation in the separate lab, physical Android/iOS acceptance, signed release artifacts, production readiness, and deployment have not been run or claimed.


## 15. Final live snapshot for this execution pass

- Live branch refs: **84**.
- X source refs: **79**, all 79 exact SHAs match both the manifest and live branch refs.
- Three archive refs: still present and individually inventoried.
- Open pull requests: **0**.
- Recovery current head at snapshot: `249ed6ddd87aa93cb6bac6850ad92723a5bcb347`.
- `main` current head: `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f` (unchanged).
- E522 `e522acb5a47964b529b84f49bacd9db0167a6dc5` → Recovery comparison: **292 ahead / 0 behind / 300 changed paths**.
- No merge to main, no deployment, no production Firebase mutation, no billing activation, no live retention change, and no 5,000-persona simulation run.
- No non-final branch refs deleted. The GitHub connector still has no branch-ref deletion action. Feature review and port dispositions continue; deletion remains blocked by missing tool capability, and no branch is represented as deletion-complete.


## 16. Owner-approved verification scope clarification — 2026-11-23

The owner has explicitly clarified the acceptance scope for this repository reconciliation, branch cleanup, selective transfer, and integration operation. This clarification is binding for this operation:

### Excluded from this operation's closure gate

The following are **out of scope** and must not be treated as blockers to closing branch-by-branch reconciliation and repository cleanup:

1. Full 5,000-persona simulation at every scale or scenario. The separate `productionhome2022-hash/mawdda-5000-simulation-lab` remains independent and untouched.
2. Physical-device acceptance on actual Android or iOS devices.
3. Field, external, or live-environment tests that are not provided by GitHub Actions or the currently authorized test tooling.
4. Tests of external services/environments that cannot be exercised within the currently available authorized GitHub environment.

These exclusions are scope boundaries only. They do not mean those tests passed, and they do not waive platform security, correctness, policy, or implementation requirements. Record each applicable excluded test as **OUT OF SCOPE / NOT RUN — NOT CLAIMED PASSED**. Do not wait for these tests before completing the repository's branch review and cleanup gates.

### Required within-scope verification

For each accepted feature/port and relevant resulting Recovery head, run and record the appropriate checks that are available and authorized in GitHub, as applicable:

- Flutter/Dart analysis, tests, and supported builds.
- Cloud Functions compilation and tests.
- Firestore and Storage security-rule emulator tests.
- Unit, integration, and widget tests supported by the repository workflows.
- Available CI security, dependency, static-analysis, build, and integration checks.

A check that is applicable and available is not waived merely because external testing is excluded. Record run IDs, exact tested commit SHA, status, skipped jobs, and failures. A workflow result on an earlier commit must not be represented as verification of a later Recovery head.

### Effect on branch disposition

This clarification changes only the verification scope for this cleanup/reconciliation operation. It does not change the E522 baseline, target branch shape, per-branch content/feature review, required security/policy review, selective-port rules, deletion gates, or sovereign restrictions. A branch can become deletion-eligible only after its actual content and unique features have been dispositioned, required eligible work is safely integrated or explicitly rejected with evidence, and all applicable within-scope checks have been recorded. The excluded tests above are not prerequisites for that decision.



## 17. Focused feature/path reconciliation pass — 2026-11-23

This pass was performed against Recovery head `d0615d95ddf87ff4b6da2efd3cfa1adf548f145f`. It supplements, and does not replace, the complete 79-ref tree audit or the remaining branch-by-branch review.

### Exact source-to-Recovery blob matches

The following source paths were fetched independently from the named source ref and Recovery. The blob SHAs matched exactly, so no copy or merge is needed for these files:

| Source branch | Path | Source and Recovery blob SHA | Disposition |
|---|---|---|---|
| `codex/economic-phase-completion-2026-11-18` | `functions/src/call-usage-policy.ts` | `787bdbc29e82467a3357a5972f304d0c36c28f4e` | ALREADY PRESENT — exact blob |
| `codex/economic-phase-completion-2026-11-18` | `functions/src/wallet-reconciliation.ts` | `5fb125fc9f92961270ef6497458f141288101576` | ALREADY PRESENT — exact blob |
| `codex/mawdda-room-events` | `functions/src/audit-archive.ts` | `0d40e490616e9de08b5f1be0ec5e5e34dd9bbca0` | ALREADY PRESENT — exact blob |

### Differing paths requiring semantic review; no wholesale replacement

| Source branch | Path | Source blob SHA | Recovery blob SHA | Current disposition |
|---|---|---|---|---|
| `codex/economic-phase-completion-2026-11-18` | `functions/src/economy-payment-policy.ts` | `aee317788b27c4fbec47111fc94cc035498c9768` | `15393a0c6595d7f3925d39e63132c429e6f6e0e5` | DIFFERENT VERSION — retain Recovery pending full semantic diff; no source overwrite |
| `codex/economic-phase-completion-2026-11-18` | `functions/src/group-call-economy.ts` | `e50738b2a6e3b2dac345057ffb4aed6e97cde837` | `f5dcefcd6e65029dbc197baf718c82dfb04fc5fe` | DIFFERENT VERSION — retain Recovery pending full semantic diff; no source overwrite |
| `codex/mawdda-group-call-capacity-2026-11-20` | `functions/src/room-call-policy.ts` | `74a506437afe868d6eb4ff87fee81406a5eb5ed8` | `7941f63dca354599f8a4d88f0f2092d1d674e795` | DIFFERENT VERSION — Recovery has its current rented-private-room and expiry checks; inspect exact behavioral delta before disposition |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `functions/test/integration/media-callables.integration.test.js` | `45dff6fa96114bf6f9371cf31030e8c86b0ca3bd` | `4e7be2b963cfd83d06b416f3c2e9a76f3424f112` | DIFFERENT TEST FILE — Recovery file is larger and includes additional media-saver/sticker coverage; source delta still requires targeted test-by-test diff |

### Compare observations from this pass

- `codex/mawda-full-platform-implementation` has two commits ahead of the current Recovery ancestry comparison, but the compare file list consists of two forensic audit documents. This is not evidence of a unique platform-code feature; inspect and disposition those records separately before cleanup.
- `codex/economic-phase-completion-2026-11-18` has 181 commits ahead of the merge base and exposes a broad set of economy, wallet, group-call, and UI paths in the merge-base compare. Several core paths are already present in Recovery; the remaining differences require semantic review, not wholesale merge.
- `codex/economy-official-port-2026-11-18` exposes a smaller set of payment, owner-grant, room-rental, and wallet integration changes. Those paths remain subject to direct content and test comparison.
- `codex/mawdda-group-call-capacity-2026-11-20` exposes targeted call-policy and signaling-test changes. Recovery already contains a more explicit active rented-private-room predicate with both room and rental expiry checks; source behavior must not replace it without proving compatibility.
- `codex/mawdda-retention-approval-ci-repair-2026-11-19` exposes workflow, traceability, index, callable, and integration-test changes. No retention policy or live deletion behavior is changed by this audit; inspect each diff against the current owner-approved retention rules.
- `codex/phase1-media-scanner-replay-regression-2026-11-20` exposes a small integration-test delta. The full Recovery test file contains additional media functionality, so retain Recovery and compare the specific scanner replay assertions before deciding whether any test-only addition is missing.
- `codex/mawdda-room-events` exposes audit-archive, callable-entry, and audit test changes; the audit-archive implementation file checked above is already an exact blob match. Other paths remain pending direct review.

No code was copied in this focused pass. No branch was deleted. No tests were run by these read-only fetch/compare operations. This section records evidence and safe dispositions only; all unreviewed paths and branch gates remain open.


## 18. Biometric branch family disposition — 2026-11-23

Audited source trees against Recovery commit `74c3e327cc199d7c56a98614918f078332dc38ef`. The five branches below have complete, non-truncated recursive tree responses. They share the same four source-only paths already classified in the cross-branch audit: the two persona-load harness paths belong to the separate 5,000-persona lab boundary; the featured-ad reward implementation/test remain excluded pending the approved advertising/economy redesign and trusted-visibility controls. No source-only biometric lifecycle path was identified.

| Branch | Tip SHA | Tree blobs | Feature disposition | Review gate |
|---|---|---:|---|---|
| `codex/biometric-final-owner-policy-2026-11-20` | `08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23` | 430 | Its biometric verification predicate requires server-verified challenge-bound device attestation. Recovery deliberately requires accepted Super Owner manual review with fresh MFA and server-owned review state. These are materially different trust/approval models. Do not port the attestation-only predicate absent a new explicit owner policy decision. | OPEN — policy conflict disposition recorded; branch-wide changed files still require review |
| `codex/biometric-final-policy-drift-closure-2026-11-20` | `0089c556a7e241454cfbfb3223fff500cc8763bb` | 430 | Same source tree family as the final-owner-policy branch for the inspected biometric/security and documentation surfaces; no separate biometric implementation is accepted over Recovery. | OPEN — deduplicate with family; branch-wide changed files still require review |
| `codex/biometric-manual-review-gate-2026-11-20` | `a82a0614f7526bfb56c6bcc93764a5b907406e95` | 429 | Its manual-review verification predicate and regression test blobs match Recovery exactly (`functions/src/biometric-verification.ts` `d69ce5c59d78235a295e1e4aae34b009181ddf2d`; `functions/test/biometric-verification.test.js` `c7be8481da402c2bc72c4a459af02c699f8c114a`). Already integrated; no copy needed. | OPEN — inspected feature is closed as ALREADY PRESENT; remaining tree deltas need review |
| `codex/biometric-server-lifecycle-2026-11-20` | `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` | 435 | Source lifecycle `functions/src/biometric-lifecycle.ts` differs from Recovery. Recovery includes central `creditMemberWalletInTransaction` integration and the current audio-duration contract; the source version lacks those Recovery additions in its inspected header/contract. Retain Recovery; no wholesale source replacement. Source biometric-evidence also lacks Recovery's explicit 20-second audio-duration constant. | OPEN — semantic function-by-function diff and test comparison still required |
| `codex/biometric-video-duration-validation-2026-11-20` | `be9b8109c8ae4b62a0b17e9b70a851307a3294f6` | 432 | Recovery biometric media contract includes audio max duration 20 seconds and video bounds. The source branch contains additional biometric media/test paths but no evidence from the inspected content that it supersedes the Recovery policy. Keep Recovery; inspect all added assertions before closure. | OPEN — targeted test diff remains |

### Biometric feature evidence inspected

- `functions/src/biometric-verification.ts`: Recovery and manual-review-gate source are exact blob matches.
- `functions/test/biometric-verification.test.js`: Recovery and manual-review-gate source are exact blob matches.
- `functions/src/biometric-evidence.ts`: Recovery explicitly defines `BIOMETRIC_AUDIO_MAX_DURATION_MS = 20_000`; the inspected server-lifecycle source version does not.
- `functions/src/biometric-media.ts`: Recovery explicitly enforces audio duration alongside video duration; source version inspected has video bounds but not the same audio constant.
- `functions/src/biometric-lifecycle.ts`: Recovery is a distinct, longer implementation with central wallet-ledger integration; source is not copied.

No code was changed by this biometric review pass. No biometric feature was enabled or deployed. No external device test was run or claimed. This is a feature-level disposition, not full branch closure: the branch gates remain open until all changed files, relevant dependencies, and applicable in-scope tests have been reviewed and recorded.


## 19. Economy, advertising, and store branch-family disposition — 2026-11-23

Eight branch tips were independently checked with complete, non-truncated recursive Git trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`. Their tree blob counts and dispositions follow. All eight contain the four common source-only paths from the wider audit (persona fixture generator, persona load integration test, featured-ad rewards implementation and its unit test); `codex/economy-recovery-2026-11-18` also contains `functions/test/integration/featured-ad-reward-policy.integration.test.js`. Persona harness files remain in the separate simulation-lab boundary. Featured-ad reward activation is not ported because its serving/visibility and direct reward-credit model has not passed the approved central-economy and trusted-attestation requirements.

| Branch | Tip SHA | Blobs | Distinct review outcome | Gate |
|---|---|---:|---|---|
| `codex/economic-phase-controlled-integration-2026-11-19` | `beec6e424ccdb1f1df24d44b2893212983508f7e` | 396 | Controlled-integration code is an overlapping platform snapshot. Shared source-only reward/load files remain excluded as above; remaining economy and policy changes require per-file diff review. | OPEN |
| `codex/economy-official-port-2026-11-18` | `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c` | 380 | Older official-port snapshot; no source-only paths beyond the shared exclusions. Its economy/pricing UI and service paths are present by path in Recovery but differing blobs need semantic comparison before closure. | OPEN |
| `codex/economy-recovery-2026-11-18` | `67adbaeccc02128f5e5a86ea01b0c4f63c09106f` | 413 | Candidate financial audit implementation is already present in Recovery in a corrected form; advertising intake and sticker policy also exist with differing Recovery versions. The reward-policy integration test is excluded with the unapproved reward activation path. | OPEN |
| `codex/featured-ads-secure-lifecycle-20261118` | `b15b643f14bc6c1196bf914190778e053e2ac9b1` | 397 | Serving/finance and owner advertising code is an overlapping snapshot; no independent code is accepted without validating campaign serving, trusted visibility, and central-wallet settlement. | OPEN |
| `codex/featured-ads-serving-foundation` | `0fe15db693eb0a36a73c11a6e563e189069e74ba` | 382 | Serving foundation paths are already represented in Recovery; source reward harness remains excluded. Preserve Recovery's stricter financial and security contracts. | OPEN |
| `codex/mawdda-economy-selective-port-2026-11-19` | `7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0` | 403 | Selective-port snapshot overlaps Recovery. No unique source-only feature identified outside the shared exclusions; inspect all changed economy and UI blobs before closure. | OPEN |
| `codex/mawda-unified-constitution-vision-2026-11-19` | `53bf236076d617f625b1b4225eb014e5c90e17fb` | 422 | Broad product/governance snapshot with differing Firestore/Storage rules, role identity, call, and UI files. Do not wholesale merge: it risks replacing newer Recovery security/role/call contracts and protected platform identity. Review each candidate separately. | OPEN |
| `codex/mawdda-store-entitlement-hardening` | `bca089273f4c3652eeb01d27f5cc2788c386c060` | 204 | Older, smaller platform snapshot; no source-only paths. Store-purchase and room-events modules exist in Recovery in longer, differing versions. Its Firebase configuration validator is older/narrower than Recovery's validator. Do not copy old Firebase options, .firebaserc, or iOS identity/configuration. | OPEN |

### Direct source-to-Recovery file checks in this family

- `functions/src/featured-ad-finance.ts`: source SHA `f65c0873294250b3dc328bc2f675b8fcdac0d884`, Recovery SHA `ad1df67f766c946353cd35d3f476869620929962`. Recovery contains the already integrated corrected implementation; no overwrite.
- `functions/src/advertising-intake.ts`: source SHA `6e7d5253e495cb4db04d6eb078a903db30adbb72`, Recovery SHA `57f02db769d92ff9efd711e5a7e79447027ad9bf`. Both define the same intake geography set, while Recovery owns the integrated contract; compare validation/side effects before any further port.
- `functions/src/sticker-policy.ts`: source SHA `658a691b7a9b233e969729eb3e8a5c30cccd2be7`, Recovery SHA `1f3f131a1d2d5579704048932174019f33bc7946`. Recovery adds explicit owner-approved limit documentation and retains the stricter sticker-specific constraints. No source overwrite.
- `functions/src/store-purchase.ts`: source SHA `efdcdd95c15033602750dad317eb759051e5fcc1`, Recovery SHA `38445c730ab9220608bfc0d098f8453553bd119d`. Recovery implementation is longer; retain it and its existing central entitlement/wallet integrations.
- `functions/src/room-events.ts`: source SHA `654d3e317c6c5970951eeb963492929d63ddd988`, Recovery SHA `059577f9f2031b45acaa842b0248057f09ea8eec`. Recovery implementation is longer; retain it and review test coverage before closing the branch.
- `functions/scripts/validate-firebase-config.cjs`: source SHA `91423572e7260b7440d30ebe3e51850744aae2e8`, Recovery SHA `ca0e83eab65a6532c1824a796f29edd72777ed07`. Recovery validator is broader and checks platform options; source validator is not a safe replacement.

### Feature-level decisions

1. Keep the already integrated immutable featured-ad financial provenance implementation in Recovery; do not replace it with source snapshots.
2. Do not activate or import the featured-ad reward path while it can credit coins outside the approved central wallet/entitlement path or lacks the approved trusted-visibility proof.
3. Keep Recovery sticker constraints and test contracts; do not replace them with the older source variant.
4. Keep Recovery store entitlement, room-event, and Firebase configuration validation implementations.
5. Keep the unified-constitution branch as a source of candidate requirements only; its different Firestore/Storage rules and iOS configuration must not be copied wholesale.

No code was changed and no tests were run in this pass. These eight branch gates remain OPEN because a tree comparison and selected file inspection are not a complete review of every changed file, dependency, workflow, and applicable test.


## 20. Room-call, role-capacity, and room-event branch-family disposition — 2026-11-23

Eight branch tips were checked using complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`. All contain the same four cross-branch source-only paths already dispositioned in sections 17–19; no additional source-only code path was found in this family.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | `c0a14ef27b3c0442c969f872243214e637cdc188` | 423 | Group-call capacity/revalidation overlaps the already integrated Recovery policy. Keep Recovery's current transactional membership and rented-private-room eligibility checks. | OPEN — remaining changed files and CI evidence |
| `codex/mawdda-group-call-capacity-2026-11-20` | `2f67e4a6cdaeedf5190cbd2e3acdb0ece4747c0a` | 422 | Exact source blob for `room-call-policy.test.js` matches Recovery; inspected source implementation is functionally aligned with Recovery's active rented-private-room and dual-expiry checks. No copy needed. | OPEN — other changed files still need review |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | `5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51` | 396 | Role-capacity snapshot overlaps Recovery's expanded role model and owner-configurable capacity controls. Retain Recovery; inspect only any unrepresented assertions before closure. | OPEN |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | `7a134c6d5adf02f8e2bbd3b931deb5ef592fbf1c` | 396 | Same role-capacity consolidation family; no source-only feature beyond shared exclusions. Recovery's expanded role identity set is retained. | OPEN |
| `codex/mawdda-role-capacity-final-2026-11-19` | `138d9b5d6624d111d61b6b71bf0cb60a8b17050d` | 396 | Source `platform-role-identities.ts` is an older/smaller role set than Recovery. Recovery adds production quality reviewer and legal administrative supervisor roles, explicit configurable capacity behavior, and a larger specialized-role integration test. Do not replace Recovery with the older source file/test. | OPEN — review remaining changed paths |
| `codex/mawdda-room-audio-duration-enforcement` | `dc1c1a43f6c8b4cfb198544ad21975612f89ca83` | 289 | Older platform snapshot with no source-only paths. It differs across Firebase project config, Android `google-services.json`, `lib/firebase_options.dart`, audio widgets, and room/media code. Preserve current Recovery Firebase/iOS identity and media caps; no wholesale merge. | OPEN |
| `codex/mawdda-room-events` | `b0b5214ab3b3b31f2c4ff494ce6ffe3536ae1615` | 205 | Older, smaller room-events platform snapshot; no source-only paths. The audit archive implementation checked previously is an exact Recovery blob match; room event modules and tests are present in Recovery in differing, longer versions. | OPEN |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | 420 | `group-call-economy.ts` and `group-call-economy.test.js` are exact blob matches in Recovery. Remainder-to-initiator settlement feature is already integrated; no copy needed. | OPEN — other changed files still need review |

### Exact evidence checked

- Group-call rented-room policy test: source and Recovery both blob SHA `f1ee8a870b61db646e8e22cc100e6b59d3ab4d82`.
- Group-call economy settlement implementation: source and Recovery both blob SHA `f5dcefcd6e65029dbc197baf718c82dfb04fc5fe`.
- Group-call economy settlement tests: source and Recovery both blob SHA `7dc2c89f6f67dadf318903e7a1d45e50964ccca6`.
- Role identity implementation differs: source `b1d0c973a87746eff52eac28a9e7fdf601ed5cbe`; Recovery `8d26a34734374f0d411bdf25317ef66277608338`. Recovery contains the expanded role set and owner capacity override behavior.
- Specialized role capacity integration test differs: source `a4c5ae35dd86008635e8c31e799c0b7316b5baa6`; Recovery `e6756a8be26f5ec4e84a1e740c222726d4b3b735`. Recovery test is substantially broader and includes owner capacity read/write callables.

No code was changed and no tests were run in this pass. All eight branch gates remain OPEN until every changed path, relevant dependency, and applicable in-scope check has been examined.


## 21. Member inbox, MFA, premium profile, direct-call, and media branch-family disposition — 2026-11-23

Eight additional branch tips were checked with complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`. Six are older/smaller platform snapshots with no source-only paths; the two phase-1 branches contain only the four shared source-only paths already excluded or held under the common policy.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/mawdda-member-inbox` | `f55e1d15423abee81dc125315e95a9acea199fdf` | 211 | Source `main_user_screen.dart` and `functions/src/index.ts` are smaller than Recovery versions. Recovery already includes the inbox/story shortcuts and a substantially broader server entrypoint. No wholesale replacement. | OPEN — inspect any specific inbox-only assertions before closure |
| `codex/mawdda-member-inbox-rebased` | `4933e76a38501ac533c37fbac2fc9c7078f5c597` | 211 | Same older inbox snapshot family; no source-only paths. Recovery remains authoritative. | OPEN — verify rebased tree differences and tests |
| `codex/mawdda-mfa-signin` | `607647ec0325eaf56bd58a4c2283aedaa47e7e68` | 210 | Older snapshot; owner MFA gate is already present in Recovery. Keep Recovery's owner-session and fresh-MFA enforcement. | OPEN — full auth-flow/test comparison |
| `codex/mawdda-premium-effects` | `5203d25ab38df8ae2a2bd700537e2f0d14bfbde3` | 195 | `lib/widgets/premium_profile_effects.dart` is an exact blob match in Recovery (`28453d922ff1dec430ca848158f3a0a1e81a82f5`). `guest-privacy.integration.test.js` is also an exact match (`538a293830cd80565b5817a409567927b7dad3b7`). Do not accept anonymous-UID deletion behavior that weakens guest cooldown/privacy controls. | OPEN — remaining premium paths and lifecycle diff |
| `codex/mawdda-premium-features` | `f3884061a5d7be3836adc6d6b94de10e534625ab` | 194 | Same older premium profile snapshot family; no source-only paths. Retain Recovery's entitlement-backed profile features and tests. | OPEN |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | 418 | Source `call-signaling.ts` differs from Recovery (source SHA `11cc5f50621c8f2aab0735c3e97b583f5fc41421`, Recovery SHA `acb649f68db9a14ed76423f780f324f8c1a34c46`); Recovery is longer and retains the transactional revalidation implementation. No source overwrite. | OPEN — inspect source-only assertions and call transaction tests |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | 420 | Source `media.ts` SHA `1cc1b46343e0a332c4c81f4f35b4fdc87cfb97d3` differs from Recovery SHA `67f8cd8d64212647afff8b162847ecb8018d8b2f`; Recovery file is longer and has the later consolidated media policy. Retain Recovery; compare denial assertions separately. | OPEN |
| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | 418 | Source `media.ts` SHA `5308f631d1c734ebb0cf29fe5b9d467499cbb8cf` differs from Recovery SHA `67f8cd8d64212647afff8b162847ecb8018d8b2f`; Recovery implementation is longer and contains the integrated media hold/delete lifecycle. No wholesale replacement. | OPEN |

### Exact evidence checked

- Premium effects widget: source and Recovery blob SHA `28453d922ff1dec430ca848158f3a0a1e81a82f5`.
- Guest privacy integration test: source and Recovery blob SHA `538a293830cd80565b5817a409567927b7dad3b7`.
- Premium profile integration test differs: source SHA `cfb2f70d70631dcf871eefcc0a272be65e1597bb`; Recovery SHA `9626b34f4a908f8c58a35af88a9af17af2960b9a`. Recovery test includes store purchase/custom-title coverage beyond the source snapshot.
- Direct-call signaling source/Recovery blobs differ as above; Recovery version is longer.
- Both media branches' inspected `media.ts` files are older/different from the current Recovery implementation.

No code was changed and no tests were run in this pass. The eight branch gates remain OPEN pending complete changed-file and applicable test review.


## 22. Phase-2, audit archive, deep-audit, verification-cycle, and native-scaffold disposition — 2026-11-23

Eight branch tips were compared by complete, non-truncated recursive tree against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/mawda-phase2-hardening` | `f8abd722ececc988c555f0400cc7b558e762ae5a` | 121 | Older hardening snapshot with no source-only paths. Its Firebase configuration, media, privacy, direct-message, and store code are superseded by Recovery's later integrated implementations. Do not copy its old project options/configuration. | OPEN — inspect only candidate tests not yet matched |
| `codex/mawdda-audit-archive` | `6a94a078695bd8d70884a843efb7cf9d3bfc740a` | 199 | Audit archive implementation exists in Recovery in a longer version with checkpoint/reconciliation protections. Source archive retention constant is lower than Recovery's current value; no source overwrite. | OPEN — compare archive tests and infra contract |
| `codex/mawdda-audit-archive-full` | `5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47` | 206 | Older archive-focused platform snapshot; no source-only paths. Retain Recovery audit archive and current infrastructure documentation. | OPEN |
| `codex/mawdda-deep-audit-profile-store` | `4ed7394235ea531e4b4abbb24431731da15eaf47` | 207 | Older profile/store platform snapshot; no source-only paths. Recovery contains the later profile, entitlement, and wallet integration. | OPEN |
| `codex/mawdda-deep-governance-audit-2026-11-19` | `ae21101e7e76001b64b43b6bf515c85ea028f34e` | 394 | Broad governance snapshot; four common source-only paths remain excluded/held. Differing docs and implementation paths are not safe to copy wholesale over the current owner-approved governance and Recovery code. | OPEN |
| `codex/mawdda-independent-verification-cycles-2026-11-20` | `615f9f974ea9e252772bee43339261288b7a2729` | 425 | Verification workflow/documentation snapshot. No unique source-only code beyond common exclusions; current Recovery contains the verification-calendar implementation and related tests. | OPEN — compare workflow semantics and run evidence |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | `2064bbcc98aa360ac2d46d05d15cbf8f90561817` | 418 | Dev verification snapshot contains a different verification-calendar implementation and test. Recovery versions are more fully formatted and retain independent biometric/email renewal clocks. Keep Recovery; no wholesale replacement. | OPEN — test semantic delta before closure |
| `codex/mawdda-native-platform-scaffold` | `d556a9990ffe4472fe86ab48acc696adc9c109f6` | 209 | Older native-platform/Firebase scaffold with no source-only paths. Preserve current Android signing identity, iOS bundle/App ID, Firebase project registration and platform options; do not import the scaffold's Firebase options or native registration changes. | OPEN — identity-sensitive branch; full config comparison required |

### Direct file evidence

- `functions/src/verification-calendar.ts`: source SHA `bd26b5d333e8c282cc58a85e99771efd274256a2`; Recovery SHA `f4896bda1f7403baec554474d45b6f929b846f0e`. Both implement UTC calendar-month arithmetic; Recovery has a clearer clamped month-end implementation.
- `functions/test/verification-calendar.test.js`: source SHA `0efd78d32cb1b0d59d25bac271e5928687c30714`; Recovery SHA `a80d9623efa04034dcda4af32978b90c35b9b22f`. Recovery test explicitly distinguishes the one-month email and three-month biometric renewal clocks.
- `functions/src/audit-archive.ts`: source SHA `9e00329ce30aabd1136250bbb497e0691a1e410e`; Recovery SHA `0d40e490616e9de08b5f1be0ec5e5e34dd9bbca0`. Recovery is longer and carries a different, higher retention-seconds constant; do not downgrade it to the source version.
- `docs/FIREBASE_PROJECT_CONFIGURATION.md`: source SHA `243e4f321314d071dbd7956efc56e9b547051ce6`; Recovery SHA `bbca23310cdd09ff10bb07dceb8912625f9c4efa`. Both record the approved project ID/number and historical owner-supplied facts; Recovery additionally distinguishes historical production facts from current development/non-production configuration.

No code was changed and no tests were run in this pass. All eight branch gates remain OPEN pending full review of changed files, configuration, dependencies, and applicable in-scope test evidence.


## 23. Biometric proof/review, phase-1 unified, PR3, role reconciliation, and test-account disposition — 2026-11-23

Eight branch tips were checked with complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/mawdda-biometric-owner-review-policy-2026-11-20` | `693dc110a931107f2fcc1f829e08974932ab65db` | 424 | Contains the server-device-attestation biometric predicate; it conflicts with Recovery's accepted Super Owner manual-review + fresh-MFA trust path. Do not port absent a new explicit owner policy decision. | OPEN — branch-wide changed files |
| `codex/mawdda-biometric-proof-gate-2026-11-20` | `73b53918e2de76d97d9f9cf7dff1706cc9d124b5` | 423 | Same attestation-only trust model; source verification predicate/test are not compatible with the currently retained manual-review policy. Record as policy conflict, not a missing feature. | OPEN |
| `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | `40845f2de04106081640b9e83bb8d0fa983fbf49` | 428 | State-machine snapshot overlaps the Recovery biometric lifecycle; no source-only path beyond shared exclusions. Keep Recovery's central wallet credit and manual-review lifecycle. | OPEN — inspect state transitions/tests individually |
| `codex/mawdda-phase1-phase2-hardening` | `cacdc51f22f7146145a81c5e4d0729aee5f5063d` | 195 | Older hardening snapshot, no source-only paths; current Recovery contains the later integrated media, privacy, retention, and economy controls. | OPEN |
| `codex/mawdda-phase1-unified-2026-11-19` | `e12897ad7dc5f383501d997117fb1211c67632e7` | 432 | Broad unified snapshot with the four shared source-only paths. It contains a biometric attestation policy conflict and overlapping current modules; no wholesale merge. | OPEN |
| `codex/mawdda-pr3-port` | `6e11d5a631d61f9e92b37fd64c827f37ec8e9c11` | 192 | Older port snapshot, no source-only paths. Its safety, auth, media, and Firebase paths are represented by later Recovery code. | OPEN |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | `ea6b05253ab702e773611ec48d31518a50943acd` | 397 | Role reconciliation snapshot overlaps Recovery's expanded role identities/capacity controls; no source-only path beyond shared exclusions. Retain Recovery's broader role model and tests. | OPEN |
| `codex/mawdda-test-account-system` | `d89d30a623369e5b687525297b97257192a27462` | 220 | Test-account persona catalogue and feature-coverage matrix are present in Recovery; Recovery's interaction integration test is broader and includes direct-message/block coverage in addition to coin transfer. No copy needed. | OPEN — verify fixture semantics and test workflows |

### Exact evidence checked

- Attestation source predicate `functions/src/biometric-verification.ts`: source SHA `8855aaa96a4be1e2aa97fb6213b793a896ef9276`; Recovery manual-review predicate SHA `d69ce5c59d78235a295e1e4aae34b009181ddf2d`.
- Attestation source test SHA `081682c14759ba7693420eeebb0d3eb9d94e4965`; Recovery manual-review test SHA `c7be8481da402c2bc72c4a459af02c699f8c114a`.
- Test-account persona unit test differs: source SHA `21dfa9876224aa8b11db55a5e7a31038e5cb836f`; Recovery SHA `3d3fa1df6ef9e6a96e44d790b2b0094684b788e3`.
- Feature-coverage matrix test differs: source SHA `b4999f3cf32ef48cef48909c752c8efabad00dd8`; Recovery SHA `3f1a239f15639a3e1cda07461a9a313865b5cfe5`.
- Test-persona interaction integration differs: source SHA `94c0ecbdb39bbcf10e358d6223bdaea264274ca0`; Recovery SHA `82c4e1090396548a852b2adc32773cd54dfb3a50`. Recovery test covers additional direct messaging and member-block behavior.

No code was changed and no tests were run in this pass. These eight branch gates remain OPEN pending full changed-file, fixture, dependency, and applicable test review.


## 24. Advertising authorization, CI evidence, geography, integration inventory, and scanner branch disposition — 2026-11-23

Eight branch tips were checked with complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | 416 | `advertising-permissions.ts` and its test are exact blob matches in Recovery. Callable-auth work is already present; no copy needed. | OPEN — review other changed paths |
| `codex/phase1-branch-governance-audit-2026-11-20` | `a48e93aa04d024f27c8877df42555050b95f9f71` | 420 | Governance audit snapshot overlaps the recorded owner decisions and current reconciliation ledger. No unique source-only code outside common exclusions. | OPEN — reconcile any novel evidence documents, not wholesale code |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | `d46cd7095915bf98480ef38574356c62d72e6a95` | 416 | CI/test coverage snapshot; Recovery already contains later workflows and the relevant role/store tests. Do not copy old workflow files over the current pipeline. | OPEN — workflow semantics and missing test assertions |
| `codex/phase1-ci-evidence-2026-11-20` | `6ad595cf10964ab54a39f3b0629efd5f8ef6e043` | 416 | CI evidence snapshot shares the same broad tree family. Preserve exact commit-bound workflow evidence already recorded in the ledger; no test result transfers to a different head. | OPEN |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | 418 | All-Arab geography targeting is not accepted as a feature port: the inspected source selector still depends on caller-supplied geography targets and does not establish an owner-approved country allowlist/contract. Recovery intentionally does not expose this unsupported targeting surface. | OPEN — feature disposition REJECTED FOR NOW; branch-wide review remains |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | `2fff6276055de44bc488cc123cec16491421a8e6` | 400 | Inventory snapshot with overlapping code; no unique source-only feature beyond shared exclusions. Use as a source index only; verify any listed scenario against current tests. | OPEN |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | 420 | Source media-callables integration test is 59,066 characters; Recovery test is 68,169 characters and includes additional Media Saver/sticker coverage. Keep Recovery and inspect scanner replay assertions individually. | OPEN — test-by-test comparison |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | 416 | Recovery `media-scanner.ts` and tests are materially broader, adding biometric/sticker media purposes and sticker metadata validation. Keep Recovery; no source replacement. | OPEN — verify no unique denial/replay assertion omitted |

### Exact evidence checked

- Advertising authorization implementation source and Recovery both blob SHA `bd1a0b1592de263485d80336c1c5aca0693766cd`.
- Advertising authorization test source and Recovery both blob SHA `a2d0acd47f7b0b0f6be27e7c9777f85cbf826cd5`.
- Featured-ad selector differs: source SHA `173b909d3e141ee1a3fa6eaaaf6e2791b5c0d100`; Recovery SHA `a01deb2d86afa572bf5f0f9941eb3d51a7ea6f66`. The source version exposes caller-provided `geographicTargets`; it does not prove an owner-approved complete country allowlist.
- Featured-ad selector tests differ: source SHA `86a477a7385afa4b3689bde06d5d7d16dfb75e08`; Recovery SHA `7812f06f30827168577fa75ec054f599b5c08c90`.
- Scanner implementation differs: source SHA `64d36bf26f6c87a31a0f960ccfb0189583c4d289`; Recovery SHA `2ac10e33295beae342c3c9a8455f28e56f5f37c2`. Recovery adds biometric/sticker purposes and typed sticker metadata.
- Scanner test differs: source SHA `e133a9cfaf60173894444a717f0e359311167abb`; Recovery SHA `d999fc00d4dcb9640b272b9acc74c2238516ef71`.
- Media-callables integration source SHA `45dff6fa96114bf6f9371cf31030e8c86b0ca3bd`; Recovery SHA `4e7be2b963cfd83d06b416f3c2e9a76f3424f112`.

No code was changed and no tests were run in this pass. All eight branch gates remain OPEN pending full review of changed paths, workflow logic, and applicable tests.


## 25. Store entitlement/gifting and specialized-callable security branch disposition — 2026-11-23

Eight branch tips were checked with complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`.

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/mawdda-store-entitlement-coverage` | `7b53ad8e3418d3e9494517862ade66a010871564` | 206 | Older store-entitlement platform snapshot with no source-only paths. Current Recovery store/catalog/wallet implementation is broader; no wholesale merge. | OPEN |
| `codex/mawdda-store-entitlement-hardening-v2` | `7506f5d4034b58477fe0bfbc28ab90ead4f77eb0` | 205 | Same older hardening family; no source-only paths. Retain Recovery's central entitlement and wallet integration. | OPEN |
| `codex/mawdda-store-wallet-entitlement-closure` | `201f5bfc8d73a982e9edab9be6858b085c2b2eb8` | 211 | Older store-wallet closure snapshot; no source-only paths. Preserve Recovery's later central wallet/entitlement flows. | OPEN |
| `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | 416 | Store gift replay implementation and unit test are exact blob matches in Recovery. Already integrated; no copy. | OPEN — inspect rest of branch |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | 420 | Same gift replay implementation/test blobs as Recovery. Permanent-entitlement behavior is already represented in current store entitlement model; no copy. | OPEN |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | 420 | Catalog-version regression suite is present in Recovery in a larger test file. Keep Recovery; no source overwrite. | OPEN — inspect the exact new assertions |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | 422 | Specialized role integration test is an exact Recovery blob match; the callable-denial regression work is already present. | OPEN — inspect any additional role-denial test files |
| `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | 421 | Firestore rules regression test differs; Recovery version is larger and covers the current rules contract. Retain Recovery, no wholesale replacement. | OPEN |

### Exact evidence checked

- Store gift implementation source and Recovery blob SHA `4afa20df18ea190a31fb416eb042f93960ff49b5`.
- Store gift unit test source and Recovery blob SHA `758c1ccdbae6b7e758313b6e3bcad8d77b6783f9`.
- Catalog regression test differs: source SHA `bc7eaa1bb6885dd825d0135ea429af1e72ee4bf2`; Recovery SHA `c97c16afff5a1ed8017a6982652f288754bcf384`. Recovery is larger.
- Specialized role capacity integration test source and Recovery blob SHA `e6756a8be26f5ec4e84a1e740c222726d4b3b735`.
- Firestore rules test differs: source SHA `66534fc7f9719a08d621fa61edfbd4871f1fc60d`; Recovery SHA `49afeca083583a73753c467a153fdbea8a509899`. Recovery is larger and reflects the current security rules.

No code was changed and no tests were run in this pass. All eight branch gates remain OPEN until every changed path and applicable test is reviewed.


## 26. Remaining governance, retention, safety, rented-room, scanner-error, and callable-inventory branch disposition — 2026-11-23

The final seven source branch tips were checked with complete, non-truncated recursive trees against Recovery `74c3e327cc199d7c56a98614918f078332dc38ef`. Together with the preceding sections, every one of the 79 live `codex/*` source branches now has a named branch disposition in this ledger. The seven results are:

| Branch | Tip SHA | Blobs | Feature-level decision | Gate |
|---|---|---:|---|---|
| `codex/governance-biometric-integration-2026-11-19` | `619eab643e2d5849b3b2c055461d53ba2be01753` | 392 | Biometric review state machine and unit test exist in Recovery in differing versions. Retain Recovery's manual-review lifecycle and current server-side wallet integration; no source wholesale replacement. | OPEN — compare state-transition edge cases |
| `codex/mawdda-final-archive-v2` | `f79b112c628c8a1709f860a8d25c1f975eddcace` | 206 | Older archive platform snapshot with no source-only paths. Recovery has later integrated archive, store, room, media, and security implementations. | OPEN |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` | `179ba95fa582082c7ed32c3f3016b899b414b0ca` | 393 | Retention implementation differs; Recovery is longer and includes additional retention handling. Both retain the 4-hour media and 7-day ordinary text constants inspected at file start. Do not copy or activate a deletion lifecycle from this branch; current owner-approved retention-mode selection remains unresolved and live deletion remains prohibited. | OPEN — compare all policy-mode paths and tests |
| `codex/mawdda-safety-ui` | `1e4c6aa97a679d0eaa88708571341e79e9e06c68` | 192 | `lib/screens/safety_center_screen.dart` is an exact blob match in Recovery (`6d6dc3470923c681123f393196203dec22aad7b9`). Safety UI already present; no copy. | OPEN — remaining branch files |
| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | 418 | Source `room-call-policy.ts` is a shorter variant of Recovery. Recovery retains the exact active private rented-room + rental identity + dual-expiry checks and additional participant/membership policy. No source overwrite. | OPEN — remaining call-creation transaction paths |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | 416 | Source media-callables integration test is 51,658 characters; Recovery version is 68,169 characters and contains the broader scanner callback, media saver, and sticker integration coverage. Keep Recovery and inspect any error-verdict-specific assertion before closure. | OPEN |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | 419 | Inventory document exists in Recovery in a longer version, SHA `46d97b157d8d37d6da1f0a1a5c01697a7fd7bb08`, versus source `d68862cd3fedb794243d29f3d1b79e16030c8baf`. Retain Recovery's updated inventory; do not infer delegated authorization is implemented merely from the inventory. | OPEN — reconcile remaining inventory claims with current callable code |

### Direct evidence checked

- `functions/src/biometric-review.ts`: source SHA `2c33cc62e8248570233f8cd28ad2c0f46a727e62`; Recovery SHA `9d2a4f49a1334b8d63ff46ea698083ff927f28f3`.
- `functions/test/biometric-review.test.js`: source SHA `3fe2820196e257524778da02cbb5dd3bb298f399`; Recovery SHA `cad12408d5618d1afcbe1542bcbde410ad2f5382`.
- `functions/src/room-call-policy.ts`: source SHA `4537fcddb0811c337a737066ae10429ac7fa3417`; Recovery SHA `7941f63dca354599f8a4d88f0f2092d1d674e795`.
- `functions/test/integration/media-callables.integration.test.js`: scanner-error branch SHA `102fdd7ec506e4dd11cbe3712df20bd74c8aa939`; Recovery SHA `4e7be2b963cfd83d06b416f3c2e9a76f3424f112`.
- `functions/src/retention.ts`: source SHA `aeaf93e964e6ad65159fa489b6e70a6c1b3fc30a`; Recovery SHA `27082d42450bf396f1cec4ee5301b2ad80c0cda6`.
- Safety-center screen source and Recovery blob SHA `6d6dc3470923c681123f393196203dec22aad7b9`.

No code was changed and no tests were run in this pass. This completes the named branch-by-branch recursive tree inventory and feature-level initial disposition for all 79 source refs; it does **not** close every branch gate. Detailed semantic diffs for the remaining changed paths, test-by-test assertions, dependency/workflow checks, and per-branch final eligibility still need to be completed and recorded before any deletion.


## 27. Current reconciliation checkpoint and deletion gate — 2026-11-23

Live GitHub API verification after the preceding audit commits:

- Recovery head: `0b16559e38303730d270fdcfa803cc1afd24cdff`.
- `main` head: `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f` (unchanged).
- Repository refs: 84 total = 79 `codex/*` source refs + 3 archive refs + `main` + Recovery.
- Open pull requests: 0.
- All 79 live source branch names are represented in this ledger; no source branch name is missing from the recorded inventory/disposition sections.
- No branch ref has been deleted.

GitHub Actions triggered on the exact Recovery head above:
- Mawdda Test Center run `45178758393`: pending at checkpoint.
- Economic phase verification run `45178758795`: in progress at checkpoint.
- Combined commit status endpoint returned no status entries at checkpoint. No pass is claimed from an empty status response.

### Deletion gate result

**0 source branches are declared deletion-eligible at this checkpoint.** The ledger now contains a named initial feature/path disposition for every source ref, but this is not equivalent to final closure of every branch. The remaining branch-specific semantic diff, dependency/workflow, and test-assertion review must be completed before a branch is marked `REVIEW_CLOSED / DELETE_ELIGIBLE`. The four common source-only files and all other differences retain the dispositions recorded above.

The owner-authorized deletion set remains all non-final source branches only after their individual gates close. The three archive refs are retained as evidence until the approved archive/evidence reconciliation itself is complete; `main` and Recovery are never in the deletion set. The independent 5,000-persona simulation repository is outside this repository's branch set and remains untouched.

Deletion tooling: the currently exposed GitHub connector has no branch-ref deletion operation. A Termux/GitHub CLI route can be prepared only after the deletion manifest is final, using a fresh read of live refs, explicit allowlisting, protected-name exclusions, and per-ref expected SHA checks. Do not run a bulk deletion command against the current open review set.


## 28. First deletion-eligible source batch — 2026-11-23

A fresh compare was performed for the 17 branches below against the current Recovery head `0b33ad96b0b5c235d2cc64ffed75c9363ebd4eb9`. For every branch, GitHub reported `ahead_by = 0`, `behind_by > 0`, and an empty compare file list. This proves each branch tip is an ancestor of Recovery and contains no commit absent from the current Recovery history. Their recursive trees were also complete and their path/feature differences have explicit dispositions in the preceding sections.

| Branch | Exact live tip SHA | Behind Recovery | Gate |
|---|---|---:|---|
| `codex/biometric-final-owner-policy-2026-11-20` | `08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23` | 761 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/biometric-final-policy-drift-closure-2026-11-20` | `0089c556a7e241454cfbfb3223fff500cc8763bb` | 734 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/biometric-manual-review-gate-2026-11-20` | `a82a0614f7526bfb56c6bcc93764a5b907406e95` | 742 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/biometric-video-duration-validation-2026-11-20` | `be9b8109c8ae4b62a0b17e9b70a851307a3294f6` | 734 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-audit-archive-full` | `5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47` | 2149 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-deep-audit-profile-store` | `4ed7394235ea531e4b4abbb24431731da15eaf47` | 2135 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-mfa-signin` | `607647ec0325eaf56bd58a4c2283aedaa47e7e68` | 2121 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-native-platform-scaffold` | `d556a9990ffe4472fe86ab48acc696adc9c109f6` | 2132 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-phase1-unified-2026-11-19` | `e12897ad7dc5f383501d997117fb1211c67632e7` | 728 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-pr3-port` | `6e11d5a631d61f9e92b37fd64c827f37ec8e9c11` | 2215 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-premium-features` | `f3884061a5d7be3836adc6d6b94de10e534625ab` | 2191 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-safety-ui` | `1e4c6aa97a679d0eaa88708571341e79e9e06c68` | 2213 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | 811 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | `2fff6276055de44bc488cc123cec16491421a8e6` | 897 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/production-readiness-tests` | `424599a34acc9ec33b4e759ba166dc6d0a9df04d` | 3677 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-unified-final-v2` | `e249c664f9a48dd8a198e274b38033a7cbba0a3d` | 2220 | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-unified-final-v3` | `ab5e37e6d7f437a491e85883b91e8bcde76d438e` | 2180 | REVIEW_CLOSED / DELETE_ELIGIBLE |

### Gate rationale

- Zero ahead commits means no unique commit would be lost by deleting these branch refs; the complete branch histories remain reachable through Recovery.
- The tree audit for these refs was not truncated. Any source-only path was either already present in a historical Recovery ancestor or explicitly excluded/held (the persona-load harness and featured-ad reward path); biometric attestation-only policy variants were rejected in favor of the retained manual Super Owner review path.
- Identity-sensitive Firebase/native scaffold content is retained in Git history but is not copied over current Recovery settings.
- Exact live branch heads were re-read immediately before this gate and all 17 matched the SHAs above.
- These 17 refs are not `main`, Recovery, or archive refs.

**Deletion authorization:** the owner's standing approval covers deletion of all non-final branches after their individual gates close. This batch has closed its gates and is authorized for deletion. The GitHub connector does not expose branch-ref deletion, so execution must use the authenticated Termux/GitHub route with exact expected-SHA checks and a detailed report saved under the repository's governance documentation. Do not delete any other branch as part of this first batch.


## 29. Post-batch-01 reconciliation and selective evidence transfer — 2026-11-23

### Current protected and source refs

- Current Recovery head at this update: `5e8d0958fc8fc6caaa5f99bcceae8d9df6083c66`.
- Protected `main`: `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f` (unchanged).
- Current repository refs: 67 = 62 remaining `codex/*` source refs + three archive refs + Recovery + main.
- The first deletion batch's 17 refs are absent; this update does not delete or move any ref.

### Fresh comparison and file-level inspection

A fresh GitHub compare pass was run against the current Recovery line for 48 of the 62 remaining source refs. The compared set is recorded in the execution session and includes the biometric, economy/advertising, room/role, verification, inbox, premium, audit, store, governance, and phase-1 media/call families. The compare endpoint is used only to locate candidate deltas; it is not treated as a direct tree comparison or semantic approval.

Focused source-to-Recovery content checks confirmed:
- `functions/src/call-usage-policy.ts` is an exact blob match: `787bdbc29e82467a3357a5972f304d0c36c28f4e`.
- `functions/src/wallet-reconciliation.ts` is an exact blob match: `5fb125fc9f92961270ef6497458f141288101576`.
- `functions/src/store-gifting.ts` is an exact blob match: `4afa20df18ea190a31fb416eb042f93960ff49b5`.
- `functions/src/featured-ad-finance.ts` is an exact blob match: `ad1df67f766c946353cd35d3f476869620929962`.
- `functions/src/verification-calendar.ts` and `functions/src/email-verification-cycle.ts` are exact blob matches between the reviewed source and Recovery; Recovery's verification-calendar file additionally contains the explicit independent email/biometric due helpers.
- `functions/src/biometric-verification-cycle.ts` and `functions/test/biometric-verification-cycle.test.js` are exact blob matches in Recovery; no copy is needed.
- `lib/screens/conversations_screen.dart` is an exact blob match in Recovery.
- The source `functions/src/group-call-economy.ts` distributes integer remainder coins in sorted UID order, while Recovery assigns all remainder coins to the initiator as required by the approved settlement rule. Keep Recovery; do not overwrite it with the source behavior.
- The source `functions/src/room-call-policy.ts` is a shorter version. Recovery includes additional transactional room-membership and direct-call eligibility predicates; keep Recovery.
- The source `functions/src/economy-pricing.ts` contains a broader currency set than the owner-approved Recovery currency allowlist and must not replace it. Recovery's owner-approved currency set remains authoritative; no price or currency expansion is inferred.
- `infra/audit-archive/main.tf` is an exact blob match in Recovery. The source README is older and incomplete relative to Recovery's multi-collection archive description. The source variable default/validation is lower than Recovery's current value; retain Recovery. No Terraform apply, bucket creation, retention lock, or paid-resource operation was performed.

### Exact forensic evidence transfer from `codex/mawda-full-platform-implementation`

The source branch's fresh compare against Recovery head `5e8d0958fc8fc6caaa5f99bcceae8d9df6083c66` reports exactly two source-unique changed paths and two commits ahead:
1. `docs/audit/forensic/MAWDA_COMPLETE_FORENSIC_2026-11-22_20261123-001313.md`
2. `docs/audit/forensic/MAWDA_FORENSIC_2026-11-22_20261122-235817.md`

Both complete files were copied byte-for-byte into:
- `docs/audit/forensic/source-branch-2026-11-23/MAWDA_COMPLETE_FORENSIC_2026-11-22_20261123-001313.md` — source and destination blob SHA `681b4ee7b87c8bdcca612ec05b8046e39805d57c`.
- `docs/audit/forensic/source-branch-2026-11-23/MAWDA_FORENSIC_2026-11-22_20261122-235817.md` — source and destination blob SHA `7ea11a3ab4d2ad0b06d19d9d336376f228bb183b`.

A pattern scan of both complete source documents found no GitHub token, Firebase API-key, private-key, or bearer-token patterns and no environment-dump section. This is a limited content scan, not a general guarantee that arbitrary text can never contain sensitive data. The historical reports are preserved as evidence and are not treated as current code, current branch inventory, or current CI status.

The branch's live head was re-read as `93d19a2cc35dafc5df3c1253d4cbef8cf8e11466`. Its compare reports `ahead_by=2` and exactly the two paths above. No open PR was returned for this branch. The common source-only files recorded in section 8 remain governed by their existing exclusions and are retained by the frozen X archive ancestry pending archive closure.

**Disposition:** `codex/mawda-full-platform-implementation` is marked `REVIEW_CLOSED / DELETE_ELIGIBLE` for the branch-ref cleanup gate only. No deletion has been performed. The branch must still be re-read for exact SHA immediately before any delete operation, and the delete operation must verify the expected SHA and report its result.

### Test-account fixture review

The source `codex/mawdda-test-account-system` seeder `functions/scripts/seed-test-accounts.cjs` is an exact blob match in Recovery (`39d5184a219bdd427f5982cef1a54407beb40d8a`). The source test-center workflow targets the former development branch and is superseded by Recovery's workflow, which targets Recovery and uses explicit timeouts and artifact naming. The source guest persona fixture grants public member discovery, public shop catalog and public ads capabilities that are absent from the Recovery fixture; do not restore those broader guest capabilities without a separately approved guest-access contract. Recovery's fixture and feature matrix are larger and include additional server-session and denied-capability cases. No test seeding was executed.

### Current gate state and next work

- First deletion batch: 17 refs deleted and independently verified absent.
- Additional branch marked deletion-eligible in this pass: 1 (`codex/mawda-full-platform-implementation`), pending a fresh expected-SHA check at execution.
- All other remaining source branch gates stay OPEN. A named feature disposition or an ancestor/compare result is not a substitute for reviewing all changed files, tests, workflows, configuration, and source-only content.
- No feature code was ported in this pass because the inspected candidates were already present in Recovery, superseded by stricter Recovery behavior, or incompatible with owner-approved policy.
- No tests were run by these read-only inspections or document copies. Existing CI results remain tied only to their recorded exact commit SHAs.
- External tests, physical devices, production changes, live Firebase changes, and the separate 5,000-persona lab are not part of this operation and were not run or touched.


### Additional document-only branch gates closed in this pass

The following four branches have only one source-specific compare-path each; the exact source content is already present in Recovery. A fresh repository-wide open-PR search returned zero open PRs. Their exact current heads were confirmed from the live branches API.

| Branch | Exact live tip | Only compare-path | Evidence in Recovery | Gate |
|---|---|---|---|---|
| `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | `docs/PHASE1_SPECIALIZED_CALLABLE_AUTH_AUDIT_2026-11-20.md` | Source and Recovery blob SHA both `2c7187d39d7b11a8e7620759700a6c98b434888e` | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-branch-governance-audit-2026-11-20` | `a48e93aa04d024f27c8877df42555050b95f9f71` | `docs/phase1/GITHUB_BRANCH_GOVERNANCE_AUDIT_2026-11-20.md` | Source and Recovery blob SHA both `4e32d4588de228c4c46529f3f5b018ccad9177df` | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-phase1-phase2-hardening` | `cacdc51f22f7146145a81c5e4d0729aee5f5063d` | `docs/PHASE1_PHASE2_CLOSURE_MATRIX.md` | Source and Recovery blob SHA both `f339685dddf79cd5ba52b8edb95cb331b2648580` | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | `docs/phase1/SPECIALIZED_CALLABLE_AUTHORIZATION_INVENTORY_2026-11-20.md` | Recovery blob SHA `46d97b157d8d37d6da1f0a1a5c01697a7fd7bb08` is longer; every nonblank source line is present in Recovery, with additional current inventory detail | REVIEW_CLOSED / DELETE_ELIGIBLE |

These four branch dispositions are based on exact content preservation and the complete compare-path list for each branch, not on ancestry alone. Their common source-only files, where present, remain governed by section 8 and are preserved through the retained X archive ancestry. No code, workflow, or policy was imported from these branches. No branch deletion was performed.

The canonical-role terminology branch remains OPEN: although the canonical terminology document is an exact match, three other governance documents contain source-only historical statements that need line-level disposition because some conflict with later owner-approved biometric, advertising-reward, currency, and verification decisions.


### Additional code/test branch gates closed after exact test reconciliation

A further 11 branches have now passed their individual source-to-Recovery disposition gate. Fresh compare calls against the current Recovery head returned only the listed paths; all 11 live branch heads matched the exact SHAs below; a fresh repository-wide open-PR query returned zero.

| Branch | Exact live tip | Changed paths and evidence | Gate |
|---|---|---|---|
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | Source test blob exactly matches Recovery (`7dc2c89f6f67dadf318903e7a1d45e50964ccca6`). Source implementation assigns remainders in sorted UID order; Recovery assigns all integer remainder coins to the initiator, matching the approved settlement rule. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | Every nonblank source line in the integration test is present in Recovery's larger test file. Source `media.ts` is an older implementation; Recovery's consolidated implementation is retained. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | Source test has an audit assertion for exact objectGeneration. Recovery's corresponding assertion filters by the same objectGeneration and asserts exactly one matching audit event, a stronger idempotency check. Source media implementation is older; keep Recovery. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | Every nonblank source integration-test line is present in Recovery's larger test file; replay behavior is already covered. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | Every nonblank source scanner-test line is present in Recovery's larger scanner test; Recovery additionally covers biometric/sticker media purposes and metadata. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | Recovery room-call policy has the dual-expiry, matching rental identity, membership and transaction checks. Source room-call test assertions are represented in the larger Recovery test; no source overwrite. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | Source media integration test's story-helper references are also present in Recovery. Its exact objectGeneration audit assertion is subsumed by Recovery's objectGeneration-filtered, exactly-one audit assertion. Source media implementation is older; keep Recovery. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | All source integration-test lines are present in Recovery's larger suite. Recovery `functions/package.json` `test:all` includes `test:store-gifting-integration`; its Recovery workflow is authoritative rather than the source workflow's former development triggers. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | Source integration-test blob exactly matches Recovery (`d144907961664cccc371501de73f82a6babecf73`); no port needed. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | Every nonblank source integration-test line is present in Recovery's larger suite, including stale/missing catalog-version regressions. | REVIEW_CLOSED / DELETE_ELIGIBLE |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | Specialized-role capacity integration test is an exact blob match in source and Recovery (`e6756a8be26f5ec4e84a1e740c222726d4b3b735`). | REVIEW_CLOSED / DELETE_ELIGIBLE |

No code was copied from these branches because the eligible test assertions are already present and the source implementation variants are older or conflict with the approved initiator-remainder rule. The common source-only files remain governed by section 8 and are preserved through the frozen X archive ancestry. No tests were run during this read-only reconciliation pass.

### Updated deletion eligibility count

- First completed deletion batch: 17 refs deleted and independently verified absent.
- Current second-batch reviewed allowlist: 17 refs marked REVIEW_CLOSED / DELETE_ELIGIBLE (the five document/evidence branches above plus these 11 code/test branches).
- No second-batch deletion has been performed yet. The exact-SHA guarded script is being updated to this 17-ref allowlist and will publish its execution report to Recovery automatically, including on a preflight abort.
- All other source refs remain OPEN. The canonical-role terminology branch and the broad economic/advertising, role, biometric, retention, test-account, and unified-platform snapshots still require further semantic disposition.


### Batch 02 execution artifact finalized

- SHA-guarded script: `docs/governance/branch-cleanup/delete-reviewed-batch-02.sh`.
- Script commit: `a44cb719f9a8b7747a36592cb1093870d5ff635d`.
- Script allowlist: exactly 16 reviewed refs and their exact expected SHAs.
- Preflight verifies the live `main` SHA, Recovery ancestry, exact X archive SHA `e2883ca4d73285ccc7428a57e4624f923c637865`, that all 16 source tips remain X archive parents, and all six destination evidence blob SHAs.
- It verifies all 17 live branch heads before deleting the first ref, then uses per-ref force-with-lease and independently checks each ref is absent.
- It writes a detailed report and publishes it to Recovery through a temporary Git worktree, including when preflight aborts. If GitHub upload fails, it preserves a local report at `$HOME/mawda-batch-02-report-2026-11-23.md`.
- The script has not been executed. No branch in batch 02 has been deleted.


## 30. Capacity-media measurement accuracy correction — 2026-11-23

### Source-branch finding

The source UI in `codex/mawdda-unified-test-2026-11-18` displayed UTC month, finalized upload count, and monthly uploaded bytes. The initial inspection of `functions/src/index.ts` alone did not reveal the meter writer. A subsequent targeted inspection of Recovery `functions/src/media.ts` found the producer at the upload-finalization path: it increments `monthlyUploadBytes` and `finalizedUploadCount` in the same Firestore transaction as the `upload_authorized -> pending_security_scan` transition, guarded by the current asset state. The transaction records no member UID in the aggregate meter. This supports exactly-once counting of validated finalized source objects and makes the two displayed metrics factual when the meter document exists. The UTC month is computed server-side.

The actual defect was that the Recovery getter converted a missing meter document into numeric zero. Absence of a meter is not evidence of zero usage. The UI formatter already renders null values as “غير متاح — لم يُوصل القياس بعد”. The source UI's two real metrics and UTC month were therefore ported into Recovery with an explicit warning that these are upload-finalization measurements only—not network traffic, retained storage, or cost—and that all other measurements and billing remain disconnected.

### Implemented correction in Recovery

- Added pure projection `projectCapacityMediaMeasurement` in `functions/src/capacity-media-management.ts`.
- Missing meter document now produces `status: not_started`, with upload bytes and finalized upload count set to `null`.
- Existing meter documents expose only non-negative safe integer values; malformed/missing fields remain `null`.
- UTC month key is validated as `YYYY-MM`.
- The owner callable now returns the projection instead of substituting zero values.
- Added unit tests for missing meter, valid values, malformed numeric values, and invalid month keys.
- Quota enforcement remains observe-only; no billing or production resources were connected.

Relevant commits:
- Projection helper and initial tests: `974f80b91ad7279952df0f364276d5c94d5e2fb4`, `c48bf4739bef1abb225daeca23134e2bc1171d51`.
- Callable integration: `b7347700411955cd7be2afffcfbf93827de445cd`.
- UTC month regex correction: `65cb6ce5b3c3ff5f43a560923fdcbc3e5a91b533`.

The final module, test and callable blobs were re-read from Recovery after these commits. No test command or CI run was executed in this pass; tests were added but not run. No external or physical-device testing was requested or performed.


### Finalized UI transfer and adjacent source-feature dispositions

- Ported the source branch's factual capacity-meter UI details into Recovery `lib/screens/capacity_media_management_screen.dart`: UTC month, finalized upload count, and finalized upload bytes, with explicit scope language. Recovery UI commit: `24b7f64d5c1abe70f104d5dcd96f8db7e4c23433`.
- Re-read the UI, projection helper, unit tests, callable, and media finalization writer from the live Recovery branch after the changes. The source upload metrics are backed by the transactional writer in `functions/src/media.ts`; the aggregate is incremented exactly at the guarded upload-finalization state transition.
- The old featured-ads source UI was not copied. Its geographic selector includes `all_arab_countries` and region choices without an approved geographic allowlist, and it calls legacy feature-specific viewing/session endpoints. Recovery uses the unified `RewardCenterScreen` and server-controlled timed-ad campaign/session flow. The old owner dashboard similarly uses a parallel featured-ad reward policy; Recovery's `OwnerAdvertisingRewardsScreen` keeps campaign and reward administration under the unified policy surface.
- Scanner review: `scanner/server.mjs` and `scanner/entrypoint.sh` are exact blob matches in Recovery. The source `scanner/Dockerfile` is an older Node 20 variant; Recovery's Dockerfile uses the newer Node 22 scanner/processor stack and is retained. `functions/test/media-cleanup.test.js` is an exact blob match.
- Sticker review: `lib/screens/owner_sticker_packs_screen.dart` is an exact blob match in Recovery. The broader sticker catalogue/policy and sticker widgets are already integrated in Recovery; no copy was needed.


### Additional historical governance-audit branch closed

- Branch: `codex/mawdda-deep-governance-audit-2026-11-19`
- Exact live tip: `ae21101e7e76001b64b43b6bf515c85ea028f34e`
- Compare against Recovery reports one source-specific changed path: `docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md`.
- Recovery already contains the complete historical audit with an owner-decision addendum. Of 306 nonblank source lines, only two are not retained verbatim: the original status banner (replaced with a historical/open-gates banner) and the superseded 90-day retention conflict (replaced with the explicit RET-005 resolution). All other source lines are present in the Recovery document.
- No code or test paths differ in this branch compare. No open PRs were returned in the repository-wide search.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE. Exact source tip remains preserved by the frozen X archive ancestry. No deletion performed.

Updated batch 02 allowlist size: 17 refs, including this historical-audit branch. The SHA-guarded script and report expectations now contain all 17 exact refs and the matching Recovery evidence blob.


## 31. Safety correction — suspend batch 02 pending full direct-tree reconciliation

### Correction to earlier dispositions

The earlier REVIEW_CLOSED / DELETE_ELIGIBLE labels for the 17 proposed batch-02 refs were premature. They relied on merge-base compare path lists plus selected content checks. That is not sufficient to establish that the complete source tip tree has no unique or divergent content. A direct recursive tree comparison against Recovery revealed additional same-path blob differences not shown by the compare endpoint's changed-file list.

**This section supersedes every earlier batch-02 DELETE_ELIGIBLE label. All 17 refs are reopened as `OPEN_DIRECT_TREE_REVIEW_REQUIRED`.** The 17-ref script was changed to stop before all deletion/preflight logic and to publish a suspension report. It cannot delete a branch in its current state.

### Direct-tree evidence captured

- Recovery head used: `9885452b24d6698b98e67a91ca762cb1eefa8303`.
- Recovery tree: `23785391a73eed0c7e575937d431b543ccf98858`, 2,826 blobs, recursive response not truncated.
- The following five source tip trees were also complete (not truncated), but their direct-tree differences are not yet fully dispositioned:

| Branch | Source tree blobs | Source-only paths | Same-path blob differences | Recovery-only paths |
|---|---:|---:|---:|---:|
| `codex/mawda-full-platform-implementation` | 1,613 | 0 | 44 | 1,213 |
| `codex/phase1-specialist-callable-auth-2026-11-20` | 421 | 4 | 100+ | 2,409 |
| `codex/phase1-branch-governance-audit-2026-11-20` | 420 | 4 | 100+ | 2,410 |
| `codex/mawdda-phase1-phase2-hardening` | 195 | 0 | 80+ | 2,631 |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | 419 | 4 | 100+ | 2,411 |

The four source-only paths are the already recorded common files from section 8 and remain excluded/preserved by the frozen X archive ancestry. The many same-path differences are the critical unresolved area: some are older snapshots, some are later Recovery behavior, and each needs a semantic disposition before its source ref can be closed. A file's presence in Recovery or a source-line inclusion check for one selected file does not close the remaining file-level differences.

### Suspended batch-02 allowlist

All 17 refs below remain present on GitHub and are reopened:

1. `codex/mawda-full-platform-implementation`
2. `codex/phase1-specialist-callable-auth-2026-11-20`
3. `codex/phase1-branch-governance-audit-2026-11-20`
4. `codex/mawdda-phase1-phase2-hardening`
5. `codex/phase1-specialized-callable-auth-inventory-2026-11-20`
6. `codex/phase1-group-call-remainder-to-initiator-2026-11-20`
7. `codex/phase1-media-direct-delivery-denials-2026-11-20`
8. `codex/phase1-media-hold-delete-race-2026-11-20`
9. `codex/phase1-media-scanner-replay-regression-2026-11-20`
10. `codex/phase1-media-scanner-verdict-tests-2026-11-20`
11. `codex/phase1-rented-room-call-gate-2026-11-20`
12. `codex/phase1-scanner-error-callback-test-2026-11-20`
13. `codex/phase1-store-gift-concurrency-2026-11-20`
14. `codex/phase1-store-gift-permanent-entitlement-2026-11-20`
15. `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20`
16. `codex/mawdda-role-callable-deny-regressions-2026-11-20`
17. `codex/mawdda-deep-governance-audit-2026-11-19`

### Script safety state

- Script path: `docs/governance/branch-cleanup/delete-reviewed-batch-02.sh`.
- Suspension commit: `faf0b32acea11476982f0d9c46c791703f44c782`; report-format follow-up: `65c41f445165938799626104d46526e90eabb520`.
- The script exits with status 3 immediately after initializing its report and before origin checks, branch reads, or any deletion command. Its exit trap publishes the suspension report to Recovery. This is intentional fail-closed behavior.
- The script must not be re-enabled until every same-path difference for every proposed branch has an explicit path/feature disposition, every unique useful change has been transferred or intentionally retained in the archive with a reason, and the exact live branch heads are rechecked.
- Independent GitHub branch enumeration after suspension: all 17 refs still present; repository branch count 67; `main` remains `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f`; Recovery is `faf0b32acea11476982f0d9c46c791703f44c782` at that verification point.

No second-batch deletion occurred. The first batch of 17 remains deleted and independently verified. No merge to main, production deployment, Firebase mutation, or external/physical test was performed.


### Direct-tree count extension — all 17 suspended refs

The following additional 12 source trees were compared against the same complete Recovery tree `9c1a6191c7484094587e57ba4ebd7db097c9827b` (Recovery commit `873be26b01f3e5f7a0947427580b6a6f122348c5`). All source tree responses were complete and non-truncated.

| Branch | Source blobs | Source-only paths | Same-path blob differences | Recovery-only paths |
|---|---:|---:|---:|---:|
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | 420 | 4 | 95 | 2,406 |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | 420 | 4 | 94 | 2,406 |
| `codex/phase1-media-hold-delete-race-2026-11-20` | 418 | 4 | 96 | 2,408 |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | 420 | 4 | 94 | 2,406 |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | 416 | 4 | 94 | 2,410 |
| `codex/phase1-rented-room-call-gate-2026-11-20` | 418 | 4 | 96 | 2,408 |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | 416 | 4 | 94 | 2,410 |
| `codex/phase1-store-gift-concurrency-2026-11-20` | 416 | 4 | 94 | 2,410 |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | 420 | 4 | 96 | 2,406 |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | 420 | 4 | 97 | 2,406 |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | 422 | 4 | 93 | 2,404 |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 394 | 4 | 100 | 2,432 |

The five previously listed trees were also rechecked against this same Recovery tree: full-platform implementation 1,613 blobs / 0 source-only / 45 differing; specialist-callable-auth 421 / 4 / 93; branch-governance-audit 420 / 4 / 97; phase1-phase2-hardening 195 / 0 / 95; specialized-callable-auth-inventory 419 / 4 / 97.

These direct-tree counts do not imply that every differing blob is a new source feature: many are older common-snapshot files superseded by Recovery. They do prove that a branch deletion decision cannot be made from a selected feature file or the merge-base compare result alone. Each path must be classified as an old common snapshot, a superseded implementation, an intentional policy rejection, or a unique change that must be ported/preserved. The common four source-only files remain excluded as previously documented. Until the full path-level reconciliation is complete, all 17 branch gates remain OPEN and the batch-02 script remains fail-closed.


### 31.1 Five document-only branches re-closed after full source-tip comparison

The safety correction above remains in force for the other 12 batch-02 candidates. The following five branches have now been separately re-evaluated and are closed again, because a fresh compare against Recovery head `743051b85e687a57246416cec3675e4c3ba298a0` confirms that their complete branch-specific commit deltas consist only of documentation paths already preserved in Recovery. Their complete recursive source trees were also directly compared; their source-only paths are the four already excluded common files (or none), and their source tips are direct parents of the frozen X archive commit.

| Branch | Live tip SHA | Ahead commits | Complete branch-specific changed paths | Preserved content |
|---|---|---:|---|---|
| `codex/mawda-full-platform-implementation` | `93d19a2cc35dafc5df3c1253d4cbef8cf8e11466` | 2 | Two forensic audit reports | Both reports copied byte-for-byte to Recovery; destination blobs match source blobs |
| `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | 1 | `docs/PHASE1_SPECIALIZED_CALLABLE_AUTH_AUDIT_2026-11-20.md` | Exact source/Recovery blob match `2c7187d39d7b11a8e7620759700a6c98b434888e` |
| `codex/phase1-branch-governance-audit-2026-11-20` | `a48e93aa04d024f27c8877df42555050b95f9f71` | 1 | `docs/phase1/GITHUB_BRANCH_GOVERNANCE_AUDIT_2026-11-20.md` | Exact source/Recovery blob match `4e32d4588de228c4c46529f3f5b018ccad9177df` |
| `codex/mawdda-phase1-phase2-hardening` | `cacdc51f22f7146145a81c5e4d0729aee5f5063d` | 1 | `docs/PHASE1_PHASE2_CLOSURE_MATRIX.md` | Exact source/Recovery blob match `f339685dddf79cd5ba52b8edb95cb331b2648580` |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | 1 | `docs/phase1/SPECIALIZED_CALLABLE_AUTHORIZATION_INVENTORY_2026-11-20.md` | Recovery blob `46d97b157d8d37d6da1f0a1a5c01697a7fd7bb08` is longer; every nonblank source line is present in Recovery |

For these five refs, the direct-tree comparison showed many same-path blob differences because the source branches retain older common-snapshot versions of files subsequently advanced on Recovery. The branch-specific compare confirms that those old versions were not introduced by unique commits on these five tips; the feature-level disposition of the newer Recovery versions is recorded in sections 18–26. The four recurring source-only files, where present, remain excluded and are preserved by the frozen X archive ancestry. The archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` has 80 parents and directly includes all five exact source tip SHAs above.

A fresh live-ref check confirmed all five branch heads still match their expected SHAs, and a fresh repository-wide open-PR query returned zero open PRs. The other 12 batch-02 refs remain `OPEN_DIRECT_TREE_REVIEW_REQUIRED`.

**Disposition:** these five branches are again `REVIEW_CLOSED / DELETE_ELIGIBLE` for a separate five-ref document-only batch. This does not re-enable the suspended 17-ref script. A separate SHA-guarded script will delete only these five refs and publish its own report.


### Batch 02A artifact

- Script: `docs/governance/branch-cleanup/delete-reviewed-batch-02a-docs-only.sh`.
- Script commit: `998171706638af1d9afe2aeb48d66ada02ef318e`.
- Allowlist: exactly the five refs in section 31.1; no other branch is included.
- It checks the five exact live SHAs, all five source tips as direct parents of the frozen X archive, all six preserved destination evidence blobs, Recovery ancestry, and unchanged `main`.
- It uses per-ref `--force-with-lease`, independently checks each deleted ref is absent, and publishes a detailed execution report to Recovery through a temporary worktree. On upload failure it preserves the report locally.
- This script has not been executed. The separate 17-ref batch-02 script remains fail-closed and must not be used.


### 31.2 Eleven code/test branches re-closed after commit-level disposition

The following eleven branches have now had their complete branch-specific compare path sets reviewed against the current Recovery implementation and tests. All exact live branch heads were rechecked, no open PRs exist, and all eleven exact tip SHAs are direct parents of the frozen X archive commit.

| Branch | Exact live tip | Ahead commits | Branch-specific changed paths | Recovery disposition |
|---|---|---:|---|---|
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | 1 | `functions/test/group-call-economy.test.js` | Exact test blob already present; Recovery's initiator remainder policy is authoritative. |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | 3 | `functions/src/media.ts`, `functions/test/integration/media-callables.integration.test.js` | Source denial assertions are present in Recovery's larger test. Recovery's canonical member-standing, block, guest-session, owner-session, quota, and derivative-size checks supersede the older source implementation. |
| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | 7 | `functions/src/index.ts`, `functions/src/media.ts`, `functions/test/integration/media-callables.integration.test.js` | `getRoomMessages` source and Recovery implementation match; all source finalization-function lines are present in Recovery. The source objectGeneration audit assertion is covered by Recovery's objectGeneration-filtered exactly-one-event assertion; Recovery also contains the concurrent legal-hold race test. |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | 1 | `functions/test/integration/media-callables.integration.test.js` | All nonblank source test lines are present in Recovery's expanded test. |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | 1 | `functions/test/media-scanner.test.js` | All nonblank source test lines are present in Recovery's expanded scanner test. |
| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | 6 | `functions/src/index.ts`, `functions/src/room-call-policy.ts`, `functions/test/integration/call-signaling.integration.test.js`, `functions/test/room-call-policy.test.js` | Every source test assertion is present in Recovery; Recovery adds call participant snapshot and direct relationship revalidation cases and retains the transactional active-rental recheck. |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | 12 | `functions/src/media.ts`, `functions/test/integration/media-callables.integration.test.js` | Retryable scanner-error 503 behavior and its integration test are present in Recovery. Recovery adds stronger purpose-aware safe-preview byte limits and stricter media/biometric access gates. |
| `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | 2 | `functions/test/integration/store-gifting.integration.test.js`, `.github/workflows/validate.yml` | All source integration assertions are in Recovery; Recovery `test:all` runs store-gifting integration and the Recovery domain-regression workflow executes `test:all`. Source workflow's additional biometric/email/store test steps are already represented by Recovery's scripts/workflow. |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | 1 | `functions/test/integration/store-gifting.integration.test.js` | Exact source/Recovery test blob match `d144907961664cccc371501de73f82a6babecf73`. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | 1 | `functions/test/integration/store-gifting.integration.test.js` | All source stale/missing catalog-version assertions are present in Recovery's larger integration suite. |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | 1 | `functions/test/integration/specialized-role-capacity.integration.test.js` | Exact source/Recovery test blob match `e6756a8be26f5ec4e84a1e740c222726d4b3b735`. |

These eleven branch-specific commit deltas are now fully dispositioned. The many same-path differences in their complete source trees are older common-snapshot versions; the newer Recovery implementations are the intended canonical versions, and the branch-specific tests above are already present. Their four shared source-only files remain excluded and preserved by the frozen X archive.

**Updated state:** 16 refs are REVIEW_CLOSED / DELETE_ELIGIBLE (the five document-only branches in 31.1 plus these eleven). The only one of the 17 suspended candidates still OPEN is `codex/mawdda-deep-governance-audit-2026-11-19`, whose broader advertising/governance code and documents still need full feature-level reconciliation. The 16-ref batch-02A script is being expanded to these 16 exact refs. No deletion has been performed.


### Batch 02A script final allowlist update

The earlier five-ref version of `delete-reviewed-batch-02a-docs-only.sh` is superseded. The current script contains exactly the 16 refs closed in sections 31.1 and 31.2, with their exact reviewed live SHAs.

- Current script commit: `07af7f3f9edcdea143ffffc93e86d1bd943b1851`.
- Current allowlist size: 16.
- The sole excluded candidate from the original 17-ref group is `codex/mawdda-deep-governance-audit-2026-11-19`; it remains OPEN pending review of its advertising/governance changes.
- The original 17-ref batch-02 script remains fail-closed and must not be run.
- No batch-02A deletion has occurred yet.


### 31.3 Deep governance audit branch closed after unique-delta confirmation

- Branch: `codex/mawdda-deep-governance-audit-2026-11-19`
- Exact live tip: `ae21101e7e76001b64b43b6bf515c85ea028f34e`.
- Fresh compare against Recovery shows 10 commits ahead but only one branch-specific changed path: `docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md`.
- The Recovery copy preserves all substantive source lines; the two non-verbatim lines are the superseded status banner and the old 90-day retention conflict, both replaced by explicit historical/resolution notes.
- The source branch's advertising-governance and advertising-permissions files are older common-snapshot versions, not branch-specific unique commits. Recovery has the stricter canonical permission model, owner-only signing constraints, and representative activation gate. No source implementation was ported.
- The exact source tip is independently confirmed as one of the 80 direct parents of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`.
- No open PRs were returned; the live branch head still matches the reviewed SHA.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.

**Final batch-02A state:** all 17 refs from the suspended candidate set are now individually dispositioned and eligible. The prior 16-ref script is being expanded to 17 and will verify the deep-governance audit document blob before deletion. The original batch-02 script remains fail-closed.


### Batch 02A final 17-ref script state

- Current script commit: `52a49e298f6522dabdd5aa9d2248a54f356c78ce`.
- Exact allowlist size: 17; it includes the deep-governance ref and checks the preserved audit document blob `5c35c8fe6874b1830c5583af8eb132a2b7416a7a`.
- All 17 exact source tips are verified as direct parents of the frozen X archive before any delete.
- The script has not been executed. All 17 candidate refs remain present until the owner runs it in Ubuntu.


### 31.4 Three CI/direct-call branches re-closed

| Branch | Exact live tip | Ahead commits | Unique delta | Recovery evidence |
|---|---|---:|---|---|
| `codex/phase1-ci-evidence-2026-11-20` | `6ad595cf10964ab54a39f3b0629efd5f8ef6e043` | 1 | `docs/PHASE1_UNIFIED_INTEGRATION_STATUS_2026-11-19.md` | Every nonblank source line is present in Recovery's updated historical report. |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | `d46cd7095915bf98480ef38574356c62d72e6a95` | 1 | `.github/workflows/validate.yml` | Its biometric integration, email-renewal integration, and store-gifting integration commands are included in Recovery's `test:all`; Recovery's domain-regression workflow runs `test:all`. No workflow step was lost. |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | 5 | `functions/src/index.ts`, `functions/src/room-call-policy.ts`, `functions/test/room-call-policy.test.js` | All source test assertions are present in Recovery. The direct-call transaction revalidates the chat snapshot, peer snapshot, profile completion, canonical account standing, and participant eligibility; Recovery additionally checks the central call entitlement before proceeding. The room-call policy source lines are present in Recovery's expanded implementation. |

All three exact tips are direct parents of the frozen X archive commit, their live refs match the reviewed SHAs, and the repository-wide open-PR query remains zero. No unique code or tests needed copying. Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.

**Updated candidate state:** 20 refs are now REVIEW_CLOSED / DELETE_ELIGIBLE (17 from 31.1–31.3 plus these three). The remaining source branches stay open pending their own feature-level review.


### Batch 02A expanded to 20 reconciled refs

Three additional branch gates were closed in section 31.4. The current executable is now:

- Script: `docs/governance/branch-cleanup/delete-reviewed-batch-02a-reconciled-refs.sh`.
- Script commit: `429d061e5f7f919ee22423cb542ebb68ed704a93`.
- Exact allowlist: 20 reviewed refs, with all 20 exact source tip SHAs.
- The script checks 20 frozen-X archive parent SHAs and 20 preserved Recovery evidence/code/test blobs before deleting anything.
- Execution report target: `docs/governance/branch-cleanup/BRANCH_DELETION_BATCH_02A_RECONCILED_2026-11-23.md`.
- The former `delete-reviewed-batch-02a-docs-only.sh` is now fail-closed and reports that it is superseded; it cannot delete refs.
- The original 17-ref `delete-reviewed-batch-02.sh` remains fail-closed.
- No batch-02A deletion has occurred yet.


### 31.5 Room audio duration enforcement branch re-closed

- Branch: `codex/mawdda-room-audio-duration-enforcement`
- Exact live tip: `dc1c1a43f6c8b4cfb198544ad21975612f89ca83`; compare reports 5 commits ahead.
- Changed paths reviewed: Functions media/scanner policy, Flutter chat and guest-room audio controls, scanner processors/security/server, and scanner processor/security integration tests.
- Recovery enforces the approved 60-second audio ceiling for chat, room and biometric purposes, with a 5 MiB audio limit. The source branch's 120-second chat and 25 MiB audio values conflict with the approved platform limits and were not copied.
- Recovery's scanner still performs FFmpeg audio safe-derivative processing, but with the stricter purpose-aware duration contract `ffmpeg-audio-purpose-limit-v2`; it also supports the additional advertisement, biometric and sticker purposes under explicit content-type policies.
- Recovery's scanner download cap is 25 MiB rather than the source's 100 MiB; source UI defaults of 120 seconds are replaced by required shared policy values, and the chat/guest screens pass the 60-second central constant.
- Source scanner tests are covered by Recovery's expanded tests; the source untrusted-purpose assertion is present along with stricter purpose/content-type tests.
- The exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`; no open PRs exist.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE. No source code was copied because Recovery already contains the feature under the approved stricter limits.


### Batch 02A expanded to 21 refs after audio branch review

- The current script `docs/governance/branch-cleanup/delete-reviewed-batch-02a-reconciled-refs.sh` now includes the audio enforcement branch.
- Current script commit: `7095d6ef6decb8781c39f96b3ade04e8fec6173f`.
- Exact allowlist: 21 refs; 31 destination code/test/document blobs are SHA-guarded.
- The script now checks the scanner processor, security, server, media-scanner, audio UI, and associated tests in addition to the previous 20 evidence blobs.
- The report path remains `docs/governance/branch-cleanup/BRANCH_DELETION_BATCH_02A_RECONCILED_2026-11-23.md`.
- No batch-02A deletion has occurred yet.


### 31.6 Room-events / audit-archive branch re-closed

- Branch: `codex/mawdda-room-events`
- Exact live tip: `b0b5214ab3b3b31f2c4ff494ce6ffe3536ae1615`; compare reports 5 commits ahead.
- Changed paths reviewed: `functions/src/audit-archive.ts`, `functions/src/index.ts`, `functions/test/audit-archive.test.js`, and `infra/audit-archive/README.md`.
- The archive implementation module, archive unit tests, and infrastructure README are exact blob matches in Recovery.
- The branch's archive worker additions in `index.ts` are present in Recovery as both `archiveOwnerReviewAuditLogs` and `archiveAdditionalAuditCollections`, with the separate per-collection cursors, leases, hash manifests, and GCS checkpoints. The remaining source/Recovery index differences are unrelated older snapshot code, including the obsolete local-biometric reward cycle, which is not part of the approved biometric lifecycle.
- The source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`; no open PRs exist.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE. No source code or docs needed copying.


### Batch 02A expanded to 22 refs after audit-archive review

- Current script commit: `4b06adc7c1f0ba355d30fd90a3317664c9c5888d`.
- Exact allowlist: 22 refs.
- SHA-guarded Recovery evidence/code/test blobs: 34.
- The new archive branch's module, tests, and Terraform README are included in the pre-delete blob checks.
- No batch-02A deletion has occurred yet.


### 31.7 Member inbox rebased branch re-closed

- Branch: `codex/mawdda-member-inbox-rebased`
- Exact live tip: `4933e76a38501ac533c37fbac2fc9c7078f5c597`.
- Changed paths reviewed: Firestore indexes, direct-message callables and media deletion, direct-message deletion integration test, conversations UI, and main-user navigation.
- The complete source direct-message deletion integration test is present in Recovery with additional coverage for legal holds, multi-media deletion, media tombstones, and late Storage replay cleanup.
- `conversations_screen.dart` is an exact blob match. All source Firestore index lines are present in Recovery. The source main-user screen's three nonmatching lines are older push-notification initialization/owner-label code; Recovery contains the newer push notification lifecycle, cleanup, and updated owner navigation while retaining messages and stories shortcuts.
- Recovery's direct-message callables include requester-only hiding, sender-only delete-for-everyone, notification removal, preview redaction, idempotent replay, media deletion, and legal-hold handling. Recovery media limits and authorization checks are stricter than the source snapshot.
- The exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`; no open PRs exist.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE. No source implementation needed copying.


### Batch 02A expanded to 23 refs after member-inbox review

- Current script commit: `7ba69648821b701e5e8dee3aa32bdabf6c7b4230`.
- Exact allowlist: 23 refs; 42 destination evidence/code/test blobs are SHA-guarded.
- Added the rebased member-inbox branch and its direct-message implementation, tests, Firestore indexes, and Flutter inbox/navigation blobs to the pre-delete verification.
- No batch-02A deletion has occurred yet.


### 31.8 Original member-inbox branch re-closed

- Branch: `codex/mawdda-member-inbox`
- Exact live tip: `f55e1d15423abee81dc125315e95a9acea199fdf`; compare reports 5 commits ahead.
- Its five branch-specific paths are the same member-inbox/direct-message feature family already reconciled in 31.7: Firestore indexes, direct-message deletion integration tests, conversations UI, main-user navigation, and server callables.
- The source Firestore indexes and all source integration-test lines are present in Recovery; conversations UI is an exact blob match; main-user navigation is superseded by Recovery's more complete push-notification lifecycle and retains the messages/story shortcuts. Recovery callables add stronger media/legal-hold deletion handling and idempotent replay.
- The exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`; no open PRs exist.
- Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE. No additional copy is needed beyond the already preserved member-inbox implementation.


### Correction — batch 02 eligibility narrowed before execution

A consistency recheck against the branch inventory table found that five document/governance branches had still been classified as `DIVERGED / feature-level disposition pending` in the canonical inventory. They were incorrectly included in the initial batch-02 draft eligibility note. The broad platform implementation, callable-auth, governance-audit, phase1/phase2-hardening, and callable-auth-inventory branches are therefore **withdrawn from batch 02** and remain OPEN for semantic review. The unreviewed deep-governance-audit ref was also removed from the executable allowlist.

The authoritative batch-02 allowlist is now **exactly 11 code/test branches** listed in the immediately preceding subsection (the group-call remainder, media delivery/hold/scanner, rented-room call gate, store-gifting, and role-callable regression branches). The cleanup script was corrected at commit `4682140d5e2fa62a1f10b8b2168dbd2bc52fc535`; it no longer contains the five withdrawn refs or the deep-governance-audit ref. The 11 branches remain subject to exact live-SHA, archive-parent, Recovery ancestry, protected-main, and destination-evidence preflight checks.

No batch-02 ref has been deleted. The earlier phrase “16 refs marked eligible” is superseded by this correction; only the 11 individually reconciled code/test refs are currently eligible. No external/device/5000-persona tests were requested or run.


## 27. Safe execution tooling correction — 2026-11-23

- The previous `delete-reviewed-batch-02a-reconciled-refs.sh` was found to contain a 23-ref allowlist, inconsistent with its own five-ref header and with the current branch-by-branch review record. It has been replaced with an explicit safety stop and must not be executed.
- Added `docs/governance/branch-cleanup/audit-e522-branch-trees-and-report.sh`. This is a read-only branch inventory and direct recursive tree-comparison tool. It writes a sanitized report to the Recovery branch and does not delete refs, merge code, copy files, alter protected refs, or access the separate simulation repository.
- The current ledger sections 18–26 explicitly leave the reviewed branch-family gates OPEN pending complete changed-file, semantic, dependency, policy/security, and applicable test review. Therefore no branch deletion batch is authorized for execution from this evidence snapshot.
- No branch refs were deleted by this tooling correction. No code or feature transfer is claimed. The new audit script must be run in the existing Ubuntu/Termux working copy before using its report to plan the next feature-level review and transfer batch.
- This update records tooling safety only; it does not close any branch gate or change the owner-approved final target of exactly `main` and Recovery.


## 32. Post-batch-01 resumption and direct GitHub tree audit — 2026-11-23

### Resumption point and protected refs

- Resume from the post-batch-01 reconciliation checkpoint in section 29. Do not reset Recovery to an older commit: preserve all valid integration and governance work completed after the first deletion batch.
- The first deletion batch remains exactly 17 source refs; the historical post-batch snapshot was 67 total refs: 62 remaining source refs, three archive refs, main, and Recovery.
- Fresh live inventory for this pass: 67 total refs = 62 non-protected `codex/*` source refs + three archive refs + main + Recovery.
- Recovery at the start of this pass: `bcb72a0fcf41f87ff9c74183824624df901fd4da`; its recursive tree is `9010cc0789ce06aceecd74f5edaabe7ab8c2de00`, containing 2,831 blobs.
- Protected main observed: `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f`. It was not modified.
- The three archive refs and the separate 5,000-persona simulation repository were not modified or accessed.

### Direct recursive tree comparison

- All 62 live source refs were individually resolved to their exact commit/tree and compared directly with the Recovery tree above using GitHub's Git Trees API.
- All 62 source recursive-tree responses and the Recovery recursive-tree response were complete and non-truncated.
- The comparison recorded source-only paths, Recovery-only paths, and same-path blob differences. These are structural counts only; none independently proves feature completeness, semantic equivalence, transfer eligibility, or branch deletion eligibility.
- The largest inspected source tree was `codex/mawda-full-platform-implementation` (1,613 blobs); its tree still lacks 1,218 Recovery paths and has 45 differing same-path blobs. It is not a substitute platform tree and must not be merged wholesale.
- The four recurring source-only paths remain subject to the existing decisions in sections 8 and 17–27. In particular, persona-load harness files remain outside this repository's platform body, and featured-ad reward code remains excluded unless it is redesigned against the approved central economy and trusted-visibility contracts.
- Result: direct tree inventory refreshed for 62/62 remaining source refs. All 62 branch gates remain open unless separately closed by a complete semantic, dependency, security/policy, test, and evidence review.

### Resumed semantic review — biometric server lifecycle branch

Source ref: `codex/biometric-server-lifecycle-2026-11-20`  
Exact source tip: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`

The current Recovery implementation was compared directly with the source implementation, policy, and integration tests:

1. The source implementation and its tests allow biometric voice evidence up to 60 seconds. The Recovery implementation and tests enforce 20 seconds. The later owner-approved BIO-003 amendment in the Recovery policy explicitly sets a 20-second maximum for biometric evidence; the separate 60-second live chat/room recording ceiling is not applicable here. The source's 60-second biometric behavior is superseded and must not be copied.
2. The source decision path calculates and writes the member's `coins` balance directly before creating a ledger record. Recovery routes the credit through `creditMemberWalletInTransaction` in the central wallet ledger, retaining the same owner-approved 1,500 BetaCoins reward and request-bound idempotency identity. Keep Recovery; do not replace it with the source balance mutation.
3. Recovery adds a required versioned privacy-consent record at request creation and requires the owner decision callable to receive an explicit evidence-reviewed confirmation. These safeguards are absent from the source variant.
4. Recovery exposes `getMyBiometricVerificationStatus`, in addition to the source's callable set.
5. The source biometric integration suite has four scenarios; Recovery retains those scenarios, adds the explicit-consent rejection scenario, and changes the biometric audio fixtures/boundaries from 60,000 ms to the approved 20,000 ms. The biometric media unit test likewise retains the audio-track checks with the corrected 20-second boundary.
6. The source's upload/scanner additions are already represented in the Recovery implementation in a more policy-constrained form. No source implementation or test replacement is required from this branch.

**Feature disposition:** ALREADY PRESENT / ADAPTED IN RECOVERY; source 60-second biometric-audio variant is superseded by BIO-003. No code was copied. This closes only the reviewed biometric lifecycle feature delta, not the entire source branch.

**Branch gate:** OPEN — the remaining changed media/scanner paths, callable wiring, Flutter upload integration, dependencies, and all applicable test assertions still require complete review before this branch can be marked REVIEW_CLOSED / DELETE_ELIGIBLE.

### Execution boundaries and evidence

- This pass used direct GitHub API reads; no local clone or local working tree was used as the repository source of truth.
- The read-only shell audit script that requires an existing local Git working copy was not executed for this pass.
- No source branch was deleted, merged, or moved.
- No source files were copied or changed.
- No automated tests were run in this pass; no test success is claimed.
- No changes were made to main, Firebase resources, production, billing, live retention behavior, iOS identity, or the separate simulation repository.



## 33. Canonical role terminology branch — final feature/document disposition — 2026-11-23

Source ref: `codex/canonical-role-terminology-owner-confirmation-2026-11-19`  
Exact live tip: `64ccc7b20445e7be15d6ec4d0be0e329f0250f11`

### Complete branch-specific delta

A fresh compare against the current Recovery line found five source-ahead commits and exactly four branch-specific changed document paths:

- `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`
- `docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md`
- `docs/MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md`
- `docs/RELEASE_READINESS_CHECKLIST.md`

All four paths were checked against Recovery:

1. `MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md` is an exact source/Recovery blob match: `7a8a2a4a489470c7ef2f6df6b122cbcdc94a5119`.
2. The GOV-001 role hierarchy in `MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md` is present in Recovery, including one Super Owner, delegated Admin 1..N, five Admin Media roles, five «المشرف العام للإنتاج» roles, and open-ended «مشرف إنتاج الفريق» roles with separate scopes. Recovery also contains later decision updates; do not replace its document with the older source snapshot.
3. The source's Owner/Super Owner identity wording and Super Owner panel terminology in `MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md` are present in Recovery. Recovery additionally contains later biometric and economy governance material.
4. The source's Super Owner link-exception and release-checklist terminology changes are present in Recovery's `RELEASE_READINESS_CHECKLIST.md`; Recovery also contains later biometric acceptance gates.

The complete source tree contains only the four recurring source-only paths already excluded in sections 8 and 17–27; no unique role implementation or test was found on this branch. The source branch changes are documentation/terminology only.

### Final gate checks

- Live branch head re-read: exact match to `64ccc7b20445e7be15d6ec4d0be0e329f0250f11`.
- Exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80 parents).
- Repository-wide open PR query: zero; branch-specific open PRs: zero.
- Protected refs: this is not main, Recovery, or an archive ref.
- No source content needs copying; the canonical role terminology and owner-decision content are already preserved in Recovery.

**Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.** This is a documentation-only closure; no code or tests were changed or run. The branch ref has not been deleted. The connected GitHub tools expose no branch-ref deletion action, so deletion must wait for the approved remote GitHub CLI/API execution path with an exact expected-SHA check and an automatically published sanitized report. Do not include any other branch in that deletion operation.


## 34. Premium profile effects branch — final feature disposition — 2026-11-23

Source ref: `codex/mawdda-premium-effects`  
Exact live tip: `5203d25ab38df8ae2a2bd700537e2f0d14bfbde3`

### Complete branch-specific delta

A fresh compare against Recovery found five source-ahead commits and exactly four branch-specific changed paths:

- `lib/screens/guest_session_screen.dart`
- `lib/screens/profile_screen.dart`
- `lib/services/auth_service.dart`
- `lib/widgets/premium_profile_effects.dart`

All four were reviewed:

1. `premium_profile_effects.dart` is an exact source/Recovery blob match: `28453d922ff1dec430ca848158f3a0a1e81a82f5`. Recovery's profile screen already uses the animated premium avatar frame and username components. No copy is needed.
2. The source guest-session screen adds a confirmation dialog and calls `AuthService.endGuestSession()`. Recovery already has a more complete guest-session screen backed by server-owned session status and the same end-session callable.
3. The source `AuthService.endGuestSession()` deletes the anonymous Firebase Auth user directly and then signs out. Do not port this behavior: deleting the anonymous UID can permit a fresh anonymous identity and bypass the server's rolling 24-hour guest cooldown, while the client-only operation does not perform the complete room-membership cleanup.
4. Recovery's `functions/src/guest-sessions.ts` implements `endGuestSession` server-side: it marks the session `cleanup_pending`, removes guest room memberships transactionally with room member-count correction, finalizes the session as ended, and retains the original server-owned `nextEligibleAt` cooldown and anonymous identity. This is the safer canonical behavior.
5. Recovery's guest-session unit tests cover exact expiry boundaries, ended/malformed session rejection, and the rolling 24-hour cooldown boundary. The source branch adds no tests for its direct Auth deletion flow.

The source tree has no unique source-only paths beyond the four recurring paths already dispositioned in the ledger. Recovery contains the complete premium visual feature and a stronger guest-session termination lifecycle.

### Final gate checks

- Live branch head re-read: exact match to `5203d25ab38df8ae2a2bd700537e2f0d14bfbde3`.
- Exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80 parents).
- Repository-wide open PR query: zero; branch-specific open PRs: zero.
- This is a non-final source ref, not main, Recovery, or an archive ref.
- No source code needs copying; the unique premium widget and all accepted behavior are already present in Recovery. The source's direct anonymous-Auth deletion is superseded and rejected in favor of the server-owned cooldown-preserving cleanup.

**Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.** No code was copied or changed. No tests were run by this review pass. Existing Recovery CI evidence on code head `bcb72a0fcf41f87ff9c74183824624df901fd4da`: Mawdda Test Center run `45201330607` succeeded and Economic phase verification run `45201330657` succeeded. The later Recovery changes through `cc501e3293236424e1483232ed7bcfb42bc50fd0` changed only this governance ledger; the code tree was unchanged. The source branch ref has not been deleted because the connected GitHub tools expose no branch-ref deletion action.


## 35. Final archive-v2 source snapshot — final tree/commit disposition — 2026-11-23

Source ref: `codex/mawdda-final-archive-v2`  
Exact live tip: `f79b112c628c8a1709f860a8d25c1f975eddcace`

### Tree and commit evidence

- Direct recursive tree comparison against Recovery completed without truncation: 206 source blobs, zero source-only paths, 2,625 Recovery-only paths, and 100 same-path blob differences.
- The three source-ahead commits (`75ae00e8f2529decf3e9c717e81000108888fa13`, `3a64d2ce8c8593e347026d90d089f083be2bc9b9`, and the branch tip) all point to the identical tree SHA `585ddadb835354863b52d03cbcaf7b0af39de13c`; the first commit's parent has that same tree SHA. These are empty commits and introduce no file content.
- The 100 same-path differences are older source snapshot blobs, not new branch-specific file changes. The audit-archive implementation and tests are already represented in Recovery in the later implementation described in section 22.
- The branch-specific compare against current Recovery reports three commits ahead but an empty changed-file list. No source-only feature, test, contract, or document was found.

### Final gate checks

- Live branch head re-read: exact match to `f79b112c628c8a1709f860a8d25c1f975eddcace`.
- Exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80 parents).
- Repository-wide open PR query: zero; branch-specific open PRs: zero.
- This is a non-final source ref, not main, Recovery, or an archive ref.

**Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.** The three source-ahead commits are empty; no code or tests need transferring. No tests were run by this review pass, and no source branch was deleted. The connected GitHub tools expose no branch-ref deletion action.


## 36. Audit archive source branch — final code/test/infrastructure disposition — 2026-11-23

Source ref: `codex/mawdda-audit-archive`  
Exact live tip: `6a94a078695bd8d70884a843efb7cf9d3bfc740a`

### Complete branch-specific delta

The current Recovery compare identified six changed paths:

- `functions/src/audit-archive.ts`
- `functions/src/index.ts`
- `functions/test/audit-archive.test.js`
- `infra/audit-archive/README.md`
- `infra/audit-archive/main.tf`
- `infra/audit-archive/variables.tf`

Review findings:

1. Recovery contains all eight source module exports and adds three additional audit-collection helpers: `ADDITIONAL_AUDIT_COLLECTIONS`, `auditCollectionArchiveObjectName`, and `serializeAuditCollectionArchive`.
2. Recovery exports `archiveOwnerReviewAuditLogs` and additionally exports `archiveAdditionalAuditCollections`. The owner-review worker retains the source's create-only object writes, lease, external checkpoint reconciliation, chain verification, redaction, and failure-closed behavior.
3. Recovery's audit archive test suite retains all four source tests and adds a fifth test for deterministic archival of every approved additional audit collection.
4. `infra/audit-archive/main.tf` is an exact source/Recovery blob match: `ee8dc3517413967b1c00609c06ae0aacbe7df642`.
5. The source module and Terraform variable validation use 63,115,200 seconds; Recovery uses the stricter owner-governed value 64,281,600 seconds. Recovery's README and variable validation reflect the Recovery value. Do not replace the stricter Recovery setting with the older source value.
6. The source README and Terraform module explicitly require separate approval before irreversibly locking bucket retention. The code refuses to run without an already locked, private, hardened bucket. This review does not authorize Terraform apply, bucket creation, retention locking, paid-resource activation, or enabling the scheduled archive worker.
7. No source-only audit archive capability remains unrepresented in Recovery. Recovery is the more complete and policy-constrained implementation.

### Final gate checks

- Live branch head re-read: exact match to `6a94a078695bd8d70884a843efb7cf9d3bfc740a`.
- Exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80 parents).
- Repository-wide open PR query: zero; branch-specific open PRs: zero.
- This is a non-final source ref, not main, Recovery, or an archive ref.
- No code or Terraform content needs copying. No infrastructure resource was created or changed.

**Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.** No tests were run by this review pass; the source test cases are present in Recovery, with one additional Recovery test. No Terraform apply, retention lock, deployment, or scheduler enablement was performed. The source branch ref has not been deleted because the connected GitHub tools expose no branch-ref deletion action.


## 37. Store entitlement coverage branch — final UI/test disposition — 2026-11-23

Source ref: `codex/mawdda-store-entitlement-coverage`  
Exact live tip: `7b53ad8e3418d3e9494517862ade66a010871564`

### Complete branch-specific delta

The current Recovery compare identified exactly two changed paths:

- `functions/test/integration/wallet-store.integration.test.js`
- `lib/screens/shop_screen.dart`

Review findings:

1. Recovery's `wallet-store.integration.test.js` contains the source branch's complete `every shipped premium store category charges once and grants its matching entitlement` scenario, including the 12 shipped item categories, exactly-once replay checks, projected entitlement checks, and rejection of the disabled `hide_coins_30d` privacy item.
2. Recovery retains that source scenario and adds further coverage for corrupt catalog versions, immutable economy policy versions, wallet reconciliation, and safe-integer catalog version boundaries.
3. Recovery's `shop_screen.dart` contains the source's category labels, store grouping/filtering, empty-category state, server-catalog messaging, and fail-closed purchase readiness behavior. No missing source UI behavior was identified.
4. No prices, quotas, or purchase readiness were copied from this branch. Existing catalog policy remains server-owned and non-ready items remain unpurchasable.

### Final gate checks

- Live branch head re-read: exact match to `7b53ad8e3418d3e9494517862ade66a010871564`.
- Exact source tip is a direct parent of frozen X archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80 parents).
- Repository-wide open PR query: zero; branch-specific open PRs: zero.
- This is a non-final source ref, not main, Recovery, or an archive ref.
- Both branch-specific paths and their accepted test/UI behavior are already represented in Recovery; no source code or tests need copying.

**Disposition: REVIEW_CLOSED / DELETE_ELIGIBLE.** No code was copied or changed, and no tests were run by this review pass. Existing Recovery CI evidence on code head `bcb72a0fcf41f87ff9c74183824624df901fd4da` remains: Mawdda Test Center run `45201330607` succeeded and Economic phase verification run `45201330657` succeeded. The source branch ref has not been deleted because the connected GitHub tools expose no branch-ref deletion action.


## 38. Store-wallet entitlement closure branch — partial UI/test review — 2026-11-23

Source ref: `codex/mawdda-store-wallet-entitlement-closure`  
Source tip under review: `201f5bfc8d73a982e9edab9be6858b085c2b2eb8`

### Findings so far

The current Recovery compare identified exactly three changed paths:

- `functions/test/integration/premium-profile.integration.test.js`
- `lib/screens/shop_screen.dart`
- `lib/screens/user_profile_screen.dart`

1. Recovery's premium-profile integration test retains both source scenarios: real store purchases flowing into profile entitlements and disappearing after expiry; and concurrent retries of the same store purchase debiting the wallet only once. The Recovery test file is larger and includes further assertions.
2. Recovery's `shop_screen.dart` already validates the returned `purchaseId`, confirms the returned `itemId` matches the requested item, requires a numeric new balance, and only then shows a successful purchase receipt. The source's receipt-confirmation behavior is already present.
3. The source changes `UserProfileScreen` from a hard-coded “Mawda VIP Member” label to dynamic `userBadges`. Recovery's active `ProfileScreen` already renders server-projected `vipActive`, `activeTitle`, and active entitlement features including badges. The active navigation path in `MainUserScreen` imports and opens `ProfileScreen`, not `UserProfileScreen`.
4. The standalone `UserProfileScreen` file still differs between source and Recovery. Its full repository call-site inventory has not yet been completed, so it is not yet safe to classify that file as obsolete or to copy it.

**Feature disposition so far:** purchase receipt validation, store-to-profile entitlement integration, expiry behavior, and concurrent idempotency are already present in Recovery. The remaining standalone user-profile widget delta is unresolved pending a complete call-site check.

**Branch gate: OPEN.** Do not delete this branch yet. No code was copied or changed, no tests were run by this review pass, and no deletion eligibility is claimed.


## 39. Execution rule — review then immediate disposition/action — 2026-11-23

Owner instruction reaffirmed: branch reconciliation is an execution workflow, not a review-only reporting exercise. From this section onward, every reviewed branch must receive an immediate disposition in the same work pass:

1. If a required unique feature/change is absent from Recovery, port the actual implementation together with its required dependencies, integration wiring, policy checks, and tests into Recovery immediately. Then inspect the resulting diff and run the relevant available checks. Do not leave a confirmed required port as a future recommendation.
2. If the source change is already present or superseded by a safer canonical Recovery implementation, do not copy duplicate or weaker code. Record the exact evidence and close the feature delta.
3. If a branch has no remaining unique required content and its exact tip is preserved in the approved archive, add it immediately to the explicit branch-ref deletion queue with its exact expected SHA and evidence. Do not execute remote ref deletion unless the available authorized execution path and the required owner approval are present.
4. If a file or component is genuinely obsolete, verify all repository call sites and build/test references first; then record it in the code-removal queue and remove it only when the deletion is demonstrably safe. Do not confuse deleting a source file with deleting a branch ref.
5. If a dependency, integration point, test, policy conflict, or owner decision remains unresolved, keep the branch gate OPEN and state the exact blocker. Never label an incomplete review as closed.
6. Maintain one live ledger. Record each action, commit SHA, changed paths, test command/result, and any unexecuted step. No parallel report-only plan is to be created.

This is an execution directive; it does not authorize changes to main, production, Firebase resources, billing, live retention, iOS identity, or protected archives.

## 40. Store-wallet entitlement closure — completed remaining call-site check — 2026-11-23

Source ref: `codex/mawdda-store-wallet-entitlement-closure`  
Reviewed source tip: `201f5bfc8d73a982e9edab9be6858b085c2b2eb8`  
Recovery head at review: `5fdd50a2a8b01e1de092563ca8227364dd034fd9`

### Immediate review and disposition

- Re-ran compare against Recovery: four source-ahead commits and exactly three changed paths: `functions/test/integration/premium-profile.integration.test.js`, `lib/screens/shop_screen.dart`, and `lib/screens/user_profile_screen.dart`.
- Confirmed the complete premium-profile integration scenarios, purchase receipt validation, and store UI behavior are already present in Recovery; no unique implementation or test needs porting.
- Checked the complete source and Recovery versions of `user_profile_screen.dart`. The source's dynamic badge rendering is not part of the active profile route; Recovery's active `ProfileScreen` already renders server-projected VIP/title/entitlement state.
- Searched the repository for `UserProfileScreen`. The only indexed match is the class declaration in `lib/screens/user_profile_screen.dart`; no constructor/call-site match was returned. This is evidence that the standalone widget is likely orphaned, but a full generated-code/build-reference check has not been run. Do not delete the file until that final check is completed.
- The source branch's unique delta is fully represented or superseded in Recovery. No source code/test port is required.

**Feature disposition:** ALREADY_PRESENT / SUPERSEDED.  
**Branch gate:** REVIEW_CLOSED / DELETE_QUEUE_CANDIDATE, conditional on a fresh exact-head and frozen-archive-parent verification before any ref deletion.  
**Code-removal queue:** `lib/screens/user_profile_screen.dart` — probable orphan; pending complete reference/build check.  
**Transfer action:** none required; no unique feature was missing from Recovery.  
**Tests:** not run in this review pass. No test success is claimed.  
**Deletion:** no file or branch ref deleted. No branch-ref deletion action is exposed by the connected GitHub tools.


## 41. Complete workflow inventory and operational-risk review — 2026-11-23

Review target: Recovery `codex/mawda-recovery-integration-2026-11-21` at pre-review HEAD `22dd89336630b23d0a009d8e157965e3c65b79e8`. All 15 workflow files in `.github/workflows/` were fetched and inspected. No workflow was dispatched, no secrets/variables/environments were read, and no external cloud resource was changed.

| Workflow | Blob SHA | Finding / disposition |
|---|---|---|
| `android-signed-release.yml` | `000414383b20c85763ce3914a6ce7f8820ea9834` | Manual only, restricted to legacy full-platform branch; uses owner signing secrets and production Firebase config, verifies pinned signing-certificate fingerprint, builds signed APK/AAB and uploads artifacts. No deployment step. HIGH-SENSITIVITY release pipeline; do not dispatch during cleanup. |
| `biometric-platform-smoke.yml` | `de2bb70337a79de2bdcd8e5c2b077d85fbcbf72f` | Push/PR filters target legacy full-platform branch; web Flutter analyze/test/build, Android debug, iOS no-code-sign. Read-only permissions. Branch filter is stale relative to Recovery; no automatic Recovery coverage from this file. |
| `bootstrap-native-platforms.yml` | `bf7368c7b92f5f0433f0fca9977c42f25ee309b2` | Push/manual, checks out legacy full-platform branch; verifies non-production Firebase identity, generates/builds Android debug and iOS unsigned artifacts. Read-only permissions. Stale branch pin; artifact-only. |
| `deploy-nonproduction-media-scanner.yml` | `40236a96a1024e6ef345ccc106da3562f1e8b92d` | Manual, OIDC `id-token: write`; creates/enables APIs, grants IAM, creates Artifact Registry, pushes image, deploys private Cloud Run, and deploys Functions in operator-supplied non-production project. Guardrails require non-production markers and callback format, but this is a real paid-resource/IAM/deployment workflow. DO NOT dispatch without separate owner authorization and target validation. |
| `economic-phase-verification.yml` | `ef212e2b65d0f942f949338d2c2315ce4cd457ab` | Push/PR/manual on Recovery; read-only; Functions unit/build and local call-signaling emulator tests. Useful targeted CI. |
| `economy-regression.yml` | `103b1eb5edd68bdbdc65670e7c61eb28a6a3434a` | Push/PR on Recovery; read-only; backend unit plus wallet/store/gifting/entitlement/room-rental/reward/call/audit/rules emulator coverage. Useful targeted CI; overlaps portions of Validate/Test Center. |
| `firebase-hosting-merge.yml` | `da2cc96d5a6934e75c4e7a60901c829ef27e3dd1` | Manual only; guarded to `main`, explicit boolean confirmation, and repository owner actor; runs tests then `firebase deploy --only hosting` using Firebase token. Production deployment workflow; DO NOT dispatch. It does not run on Recovery pushes. |
| `flutter-ci.yml` | `731c813aee196e074df5d8af8f7da0a5bffa810b` | Manual only; Flutter analyze/test/web build, read-only. Functionally overlaps Flutter jobs in Validate and Test Center; candidate for consolidation/removal after full workflow-call/reference review, not deleted in this pass. |
| `live-nonproduction-validation.yml` | `70f7e1df5ef6f6f10611f8bab2d1cdf450f8334b` | Manual, protected `mawda-nonproduction` environment, OIDC, explicit destructive-fixture confirmation; verifies GCS exact-generation deletion and live scanner E2E. It performs live non-production destructive tests. DO NOT dispatch; not a retention-policy authorization. |
| `mawdda-domain-regression.yml` | `24dcbb2ba4e0bdfc249aa33a4c9b219516c41e33` | Manual only; backend retention/room/entitlement/call/reward emulator tests and Flutter tests. Explicitly notes overlap with Validate; duplicate coverage candidate, but manual targeted convenience may be intentional. |
| `mawdda-test-center.yml` | `a4d52bfdd1708aab97f613e0ce2bf3e1447128f8` | Push/manual on Recovery; read-only; Flutter analysis/test/web build and complete emulator suite; uploads synthetic persona fixture. Main broad validation path. |
| `nonproduction-media-verification.yml` | `5f390ae3b2d03fd4d29cdd5a21ef3b3ac1c9d636` | Manual, OIDC; live signed-URL and exact-generation deletion tests against supplied non-production project/bucket. Destructive purge verification is selectable and defaults true. DO NOT dispatch; requires separately authorized non-production fixture and explicit retention-scope confirmation. |
| `refresh-flutter-lock.yml` | `99911e5e5cf1f500408f2792f60167aa4c836451` | Push/manual on legacy full-platform branch; `contents: write`; resolves and pushes pubspec.lock to that branch, then analyzes/tests/builds web. Mutating automation with stale branch pin; do not dispatch or transplant unchanged. |
| `resolve-flutter-lock.yml` | `6168a7256c70986fe57a10aea2ad64a10da3b946` | Push/manual on legacy full-platform branch; `contents: write`; retries lockfile commits/pushes to triggering branch. Mutating automation with stale branch pin and overlap with refresh workflow; requires consolidation decision before enabling on Recovery. |
| `validate.yml` | `1fc6601abecb9b4d18092a63b6b773318791631a` | Push/PR/manual on Recovery; read-only. Includes Functions build/unit, focused integration, Flutter analyze/test, PWA validation, non-deploy production-configured web artifact, broad emulator integration, scanner tests/container build. This is the principal staged validation workflow. |

### Cross-workflow conclusions

1. The inventory count is exactly 15 workflow YAML files at this Recovery snapshot. All 15 were fetched by exact path; the blob SHAs above identify the reviewed contents.
2. The active Recovery validation paths are `validate.yml`, `mawdda-test-center.yml`, `economic-phase-verification.yml`, and `economy-regression.yml`. Some domain suites overlap by design; avoid deleting coverage solely because test names repeat.
3. Three workflows retain event/checkout pins to `codex/mawda-full-platform-implementation`: biometric smoke, native bootstrap, and Android signed release. Two additional lockfile writers also target that legacy branch. These are not evidence that Recovery receives those checks. Their migration or retirement requires a workflow-specific decision and dependency/branch-protection review.
4. Production deploy workflow is explicitly gated but remains capable of deploying Hosting to production; non-production scanner deployment provisions paid cloud resources/IAM and deploys Functions; live non-production validation and media verification perform real GCS deletion fixtures. None was executed.
5. Two lockfile workflows grant `contents: write` and push commits. Do not enable both on Recovery: duplicate writers can race and mutate the branch. Select one canonical lockfile process only after examining workflow history, dependency lock policy, and repository rules.
6. `android-signed-release.yml` consumes owner signing secrets and production Firebase configuration. The workflow itself checks the certificate identity, but no secrets were accessed and no signed artifact was built in this review.
7. No workflow file was changed or removed in this pass. Candidate consolidation/removal list: `flutter-ci.yml` (overlaps active Flutter CI), `mawdda-domain-regression.yml` (overlaps Validate/Test Center), and one of `refresh-flutter-lock.yml` / `resolve-flutter-lock.yml` after selecting a single lockfile writer. These are candidates only, not approved deletions.
8. No branch refs were deleted. This workflow review does not by itself establish any source branch as deletion-eligible. Existing per-branch gates and exact archived-tip checks remain mandatory.

**Disposition:** workflow inventory/review completed for this Recovery snapshot; no code port required from these workflow files in this pass. Operational workflows requiring credentials, deployment, IAM, paid resources, or live destructive fixtures were not run. No CI result is claimed from this static review.


## 42. Parallel branch batch — CI coverage and scanner-verdict assertions — 2026-11-23

Review base: Recovery `05b7b3635591f484e18a5fde91dfe34ec480ff68`. Exact source refs were re-read from Git refs and compared against Recovery.

### A. `codex/phase1-ci-coverage-role-store-2026-11-20`

- Exact live source tip: `d46cd7095915bf98480ef38574356c62d72e6a95`.
- Compare: 1 source-ahead commit; exactly one changed path, `.github/workflows/validate.yml`; 883 behind.
- Source commit diff adds two test invocations: `test:specialized-role-capacity-integration` and `test:store-gifting-integration`.
- Current Recovery `validate.yml` already runs both suites in its comprehensive emulator-integration job. The separate `mawdda-test-center.yml` and `economy-regression.yml` also contain relevant broader coverage.
- No missing workflow assertion or implementation was identified; no old workflow was copied over Recovery.
- Exact source tip is a direct parent of frozen archive commit `e2883ca4d73285ccc7428a57e4624f923c637865` (80-parent manifest).
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** No tests run in this static review. No branch ref deleted; connected GitHub action set still exposes no branch-ref deletion action.

### B. `codex/phase1-media-scanner-verdict-tests-2026-11-20`

- Exact live source tip: `6da140cbcd359c17805477e81401bfacef7268f0`.
- Compare: 1 source-ahead commit; exactly one changed path, `functions/test/media-scanner.test.js`; 883 behind.
- Source commit adds 53 lines verifying that complete `malicious` and `error` verdicts are accepted for server handling only without safe previews/derivatives.
- Current Recovery test file contains the same named test and the complete assertions for both verdicts, rejects preview metadata, and rejects safe derivative payloads. Recovery's validator additionally enforces verdict/derivative compatibility and purpose-specific derivative contracts.
- No missing assertion was identified; no code/test copy required.
- Exact source tip is a direct parent of frozen archive commit `e2883ca4d73285ccc7428a57e4624f923c637865`.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** No tests run in this static review. No branch ref deleted; connected GitHub action set still exposes no branch-ref deletion action.

### C. `codex/biometric-server-lifecycle-2026-11-20` — remains OPEN

- Exact live source tip: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`.
- Compare against Recovery: 73 source-ahead commits and 23 changed paths, including biometric lifecycle/evidence modules, media upload integration, media security/scanner changes, and large integration-test changes.
- The prior 20-second-vs-60-second biometric evidence duration, consent, wallet, and owner-review findings remain valid only for their previously reviewed slices. They do not close this 23-path branch delta.
- The source tip is a direct parent of the frozen archive commit, but archive preservation does not replace semantic review.
- **Disposition: OPEN / NOT IN DELETION QUEUE.** Continue full path-by-path review of all 23 changed files, including dependency, callable export/wiring, media scanner and upload paths, and test assertions. Do not bulk-merge this branch.

### Queue update

Add the two fully reconciled source refs above to the explicit deletion queue, preserving their exact expected SHAs and archive-parent evidence. The queue is not a deletion: no remote branch ref was deleted. The biometric branch remains excluded. No code or workflow changes were made in this batch.


## 43. Parallel branch batch — store gifting, scanner callback, and rented-room call gates — 2026-11-23

All five exact source refs were re-read and compared against Recovery after section 42. The archive manifest commit `e2883ca4d73285ccc7428a57e4624f923c637865` directly preserves all five exact source tips as parents.

### A. `codex/phase1-store-gift-permanent-entitlement-2026-11-20`

- Exact tip: `b4546e69543b70a08b4e50c678316ac848c70c06`; compare: 2 source-ahead commits, one changed test path.
- Source's final test change fixes the fixture to use the approved `vip_monthly` SKU instead of inventing `vip_lifetime_<tag>`.
- The complete source test blob is byte-identical to Recovery's `functions/test/integration/store-gifting.integration.test.js` (blob `d144907961664cccc371501de73f82a6babecf73`).
- Recovery already has the permanent-entitlement, concurrency, replay, and catalog guards in the same test.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** No port required; no tests run in this static pass.

### B. `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20`

- Exact tip: `3c8ab48d320e3a4b827d4c3eca558691d6c01c75`; compare: 1 source-ahead commit, one changed test path.
- The source adds missing-version, stale-version, unknown-SKU, stale-price, no-debit, and no-extra-receipt assertions.
- Recovery's current `store-gifting.integration.test.js` contains all these scenarios and is larger; the named assertions were confirmed in the current Recovery blob.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** Recovery is the canonical richer test; no copy required; no tests run in this static pass.

### C. `codex/phase1-store-gift-concurrency-2026-11-20` — OPEN

- Exact tip: `2f175165ed17a1a02b47439bacfbb187b1e00d6e`; compare: 2 source-ahead commits, changed paths are workflow `validate.yml` and `store-gifting.integration.test.js`.
- The workflow's added store-gifting emulator command is present in Recovery's validation pipeline.
- The source test blob differs from Recovery and is shorter (6,270 vs 12,980 characters). The source file still needs complete scenario/assertion comparison before closing; do not infer equivalence from workflow coverage.
- **Disposition: OPEN.** No port or deletion decision yet.

### D. `codex/phase1-scanner-error-callback-test-2026-11-20` — OPEN

- Exact tip: `20519494a898b19f08bcaf4f22e4af64acff622b`; compare: 12 source-ahead commits, changed paths are `functions/src/media.ts` and `functions/test/integration/media-callables.integration.test.js`.
- Recovery's media integration test includes malicious callback and scanner-error handling scenarios. Recovery's `media.ts` is longer (115,084 vs 102,393 characters), but length alone does not establish semantic equivalence.
- One branch-tip commit removes a historical scanner callback report section from a governance document; the compare endpoint's current file list does not include that document, so no historical report should be copied or silently rewritten from this branch.
- Need compare all source-specific media callable changes and malicious/error callback assertions against Recovery, including exact-generation cleanup, audit, idempotency, and error retry behavior.
- **Disposition: OPEN.** No source code/test port or deletion decision yet.

### E. `codex/phase1-rented-room-call-gate-2026-11-20` — OPEN

- Exact tip: `41dc2c2fd679f736d48f912c1e248f8615554649`; compare: 6 source-ahead commits, four changed paths: `functions/src/index.ts`, `functions/src/room-call-policy.ts`, `functions/test/integration/call-signaling.integration.test.js`, and `functions/test/room-call-policy.test.js`.
- Recovery's room-call policy contains the source active-private-rented-room check and adds participant membership revalidation, direct-call eligibility checks, and call participant limits. Recovery's call-signaling integration test includes the inactive-rental rejection case.
- The source policy is shorter than Recovery's canonical policy (1,817 vs 4,328 characters). Do not replace the Recovery implementation.
- Still requires complete review of the source index export wiring, every source policy unit assertion, and all changed call-signaling scenarios to establish whether any unique denial/transaction assertion remains absent.
- **Disposition: OPEN.** No code copy, branch closure, or deletion decision yet.

### Queue update

Add only branches A and B above to the explicit deletion queue with their exact source SHAs and direct archive-parent evidence. Branches C, D, and E remain OPEN and excluded from deletion. No code was changed or tests executed in this batch. No remote branch ref was deleted.


## 44. Closure of three further branch gates after semantic reconciliation — 2026-11-23

Recovery comparison base: `562b719f6f8025dc075d8806a93a27c452d2a401`; merge base for these three source branches: `d857497c50eca8d7dcf105e938c8060402ae85e3`. Exact source tips were rechecked against the archive manifest `e2883ca4d73285ccc7428a57e4624f923c637865`; each is a direct parent.

### A. `codex/phase1-store-gift-concurrency-2026-11-20`

- Exact source tip: `2f175165ed17a1a02b47439bacfbb187b1e00d6e`; compare: 2 source-ahead commits, two paths.
- The source test's concurrent identical-request race, exactly-one-debit assertion, one original/one replay result, immutable entitlement terms, ledger assertion, replay, and changed-recipient rejection are present in Recovery's canonical store-gifting integration suite.
- Recovery additionally covers missing catalog version, stale version, unknown SKU, stale price, no additional debit/receipt, permanent entitlement preservation, and ineligible recipients. The source workflow's added store-gifting emulator invocation is already in Recovery `validate.yml`.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** No unique test or workflow change remains.

### B. `codex/phase1-scanner-error-callback-test-2026-11-20`

- Exact source tip: `20519494a898b19f08bcaf4f22e4af64acff622b`; compare: 12 source-ahead commits, two changed paths (`functions/src/media.ts`, `functions/test/integration/media-callables.integration.test.js`).
- The source integration adds malicious scanner callback coverage: valid test HMAC, isolated quarantine object, rejected asset/job, MALWARE_DETECTED, audit with exact generation, and deletion pinned to the scanned object generation. It also covers retryable 503 on scanner error without changing the quarantined asset.
- Recovery has both scenarios. Its malicious callback test additionally replays the callback and asserts idempotent replay and exactly one verdict audit event. Recovery's media module also has stronger member-account checks, Media Saver entitlement gates, sticker contracts, and biometric upload binding; source's older implementation must not replace it.
- The source tip's final commit only removes a historical section from a report; no source report content is needed in Recovery.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** The scanner callback delta is already present and strengthened in Recovery; no port required.

### C. `codex/phase1-rented-room-call-gate-2026-11-20`

- Exact source tip: `41dc2c2fd679f736d48f912c1e248f8615554649`; compare: 6 source-ahead commits, four changed paths.
- `room-call-policy.ts` source implementation of active private rented-room eligibility is byte-identical in its core function to Recovery; Recovery adds participant membership revalidation, direct-call relationship revalidation, and configured participant limits.
- Source's new unit tests for active/missing/mismatched/inactive/expired rental records are present in Recovery's larger policy test suite.
- Source's `index.ts` imports the active-rental predicate; Recovery imports it together with the stronger membership, direct-call and participant-limit guards.
- Source integration regression for inactive rental rejection is present in Recovery's call-signaling integration test. Recovery's integration suite additionally tests call entitlements at start/acceptance and room-capacity/audio/video participant limits.
- No unique denial rule or integration export was identified as missing.
- **Disposition: REVIEW_CLOSED / DELETE_QUEUE.** No source code/test copy required.

### Queue update and verification

Add all three branches A-C to the explicit deletion queue with the exact tips above and archive-parent evidence. Together with sections 42-43, these are branch-ref deletion candidates only; no ref has been deleted. Biometric lifecycle remains OPEN. No tests were run and no test success is claimed. No production or deployment action was taken.


## 45. Biometric server lifecycle branch — full 23-path semantic reconciliation — 2026-11-23

Source: `codex/biometric-server-lifecycle-2026-11-20`  
Exact source tip: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`  
Recovery comparison head: `a05312134d6d234d3e7965d93ea18a323774264e`  
Merge base: `e12897ad7dc5f383501d997117fb1211c67632e7`  
Compare: 73 source-ahead commits, 803 behind, 23 changed paths. Exact source tip is preserved as a direct parent in frozen archive `e2883ca4d73285ccc7428a57e4624f923c637865`.

### Full changed-path disposition

| Changed path | Reconciliation result |
|---|---|
| `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` | Recovery's canonical policy version is more complete and explicitly establishes 20-second/5-MiB biometric audio, approved phrase configuration, and 3–5-second video. Do not copy the older 60-second/source wording. |
| `docs/phase1/BIOMETRIC_SUPER_OWNER_IMPLEMENTATION_GAPS_2026-11-20.md` | Recovery's implementation/gap record includes current Flutter surfaces, consent, central wallet primitive, CI fixes, platform gates, and explicit non-activation status. Source status is historical/superseded. |
| `functions/package.json` | Recovery retains biometric emulator test and adds local TypeScript build before the test; it also has later call-economy and coin-gift integration scripts. No source script is missing. |
| `functions/src/biometric-evidence.ts` | Recovery adds the canonical `BIOMETRIC_AUDIO_MAX_DURATION_MS = 20_000`; source omits it. Source's spoken phrase and identity/reward helpers are already present. |
| `functions/src/biometric-lifecycle.ts` | Same lifecycle feature exists in Recovery. Recovery adds versioned consent enforcement, 20-second response contract, and `creditMemberWalletInTransaction` from the central wallet ledger instead of the source's direct balance update. It also retains status callable and owner-review/audit lifecycle. Recovery is canonical; do not port source lifecycle wholesale. |
| `functions/src/biometric-media.ts` | Recovery adds server-side 20-second audio bound while preserving byte-derived MP4 validation and 3–5-second video checks. Source's video parsing is already present. |
| `functions/src/index.ts` | Recovery exports the lifecycle callables and uses the central wallet and expanded member/media/call policy wiring. Source's older import/export additions are subsumed. |
| `functions/src/media-derivative-contract.ts` | Recovery includes the source derivative contract and later purpose/sticker constraints; no source-only biometric requirement identified. |
| `functions/src/media-scanner.ts` | Recovery contains the source biometric scanner purpose support plus later scanner verdict and purpose contracts. |
| `functions/src/media-security.ts` | Recovery contains biometric request binding and adds the sticker purpose/validation. Source does not provide a missing required rule. |
| `functions/src/media.ts` | Recovery includes biometric upload/request binding and stronger member-account, Media Saver, sticker, and lifecycle checks. Source's older media implementation is not safe to replace Recovery with. |
| `functions/test/biometric-evidence.test.js` | Blob SHA identical between source and Recovery; already present. |
| `functions/test/biometric-media.test.js` | Recovery retains MP4 parsing/video tests and the 20-second audio duration contract; source does not add a missing policy assertion. |
| `functions/test/integration/biometric-verification.integration.test.js` | Recovery includes all source lifecycle scenarios plus explicit versioned-consent rejection, 20,000ms acceptance/20,001ms rejection, and central-wallet/replay safeguards. Source's 60,000ms audio fixture conflicts with the approved 20-second biometric evidence limit. |
| `functions/test/integration/media-callables.integration.test.js` | Recovery includes the biometric upload and scanner lifecycle assertions in the stronger media integration suite. |
| `functions/test/media-derivative-contract.test.js` | Recovery retains source assertions and adds later derivative-purpose contract cases. |
| `functions/test/media-scanner.test.js` | Recovery retains source scanner assertions and adds later verdict/derivative compatibility cases. |
| `functions/test/media-security.test.js` | Recovery retains source biometric-purpose checks and adds sticker-purpose and stricter validation assertions. |
| `lib/services/member_media_upload_service.dart` | Recovery has request start with explicit consent/version, request-bound upload, submission, member status lookup, and owner review/playback/decision methods. Source lacks the newer consent/status contract. |
| `scanner/processors.js` | Recovery retains source generation-pinned processing and adds later processing contracts. The generic audio scanner limit of 60 seconds is not the biometric evidence limit; biometric upload server validation remains 20 seconds. |
| `scanner/security.js` | Recovery retains biometric request validation and generation-pinned URL/source binding and adds later supported media-purpose checks. |
| `scanner/test/processors.test.js` | Recovery retains the generic 60-second scanner audio ceiling; this does not override the stricter biometric-purpose 20-second server validator. |
| `scanner/test/security.test.js` | Recovery retains source biometric scan-request coverage and adds later security/telemetry checks. |

### Security/policy decision

- **Do not port the source's 60-second biometric audio behavior.** The 60-second limit belongs to live voice recording in conversations/rooms and general scanner processing; biometric evidence has its own approved 20-second maximum.
- **Do not port source's direct wallet balance mutation.** Recovery uses the central wallet-ledger transaction primitive.
- **Do not copy older consent, phrase, or status behavior over Recovery.** Recovery's current contract is stronger and aligned with the active canonical policy.
- No unique required feature was found across the 23 changed paths that is absent from Recovery. No source files or dependencies were copied.

**Disposition: REVIEW_CLOSED / DELETE_QUEUE.** All 23 changed paths were fetched from both refs and reconciled at feature/policy level. No tests were run in this static review; no test success is claimed. Exact source tip is archived. Add this branch to the explicit deletion queue with the exact tip SHA. No branch ref was deleted.


## 46. Parallel governance/biometric/role branch review — 2026-11-23

Source: `codex/governance-biometric-integration-2026-11-19`, tip `619eab643e2d5849b3b2c055461d53ba2be01753`. Compare against Recovery at `05df918151960a807a749b80774983fc35b774f3`: 89 source-ahead commits, 1,151 behind, 40 changed paths.

### Confirmed canonical Recovery coverage

- `functions/src/advertising-governance.ts`: Recovery has a longer role-bound permission model, explicit permission options, and legal-administrative permissions; source's role family/permission implementation is an older, narrower variant.
- `functions/src/platform-role-identities.ts`: Recovery includes source role IDs and capacities and extends them with production quality reviewer/legal administrative supervisor plus explicit owner-configurable general-production capacity.
- `functions/src/biometric-review.ts`: source's legacy three-month lockout state machine is not the approved lifecycle; Recovery's active lifecycle is `biometric-lifecycle.ts` with calendar-month retries and terminal third rejection. Do not transplant the legacy module over the active lifecycle.
- `functions/src/biometric-verification.ts`: Recovery requires the expected UID and strict server-side identity/timestamp validation; source predicate is weaker.
- Role tests: Recovery's `advertising-governance.test.js` is larger and covers the current permission families; `platform-role-identities.test.js` covers the additional role IDs and capacity override behavior.
- Specialized-role integration: Recovery's `specialized-role-capacity.integration.test.js` is the same canonical source test lineage expanded to cover role grants, capacity reads/updates and additional role families.
- Firestore/Storage rules tests in Recovery are larger; source rules tests do not provide a missing rule contract.
- Source includes a broad `functions/src/index.ts` delta (841 additions/10 deletions), plus screens, docs, rules, and tests. Only the focused modules above were semantically compared in this batch; the remaining changed paths are not yet closed.

**Disposition: OPEN.** No source code was copied. No merge performed. Continue review of all 40 changed paths, especially advertising-governance callable transactions, index export/callsite wiring, UI flows, rules deltas, and historical policy text. Do not infer completeness from the selected modules.

## 47. Retention approval / CI repair branch — initial focused reconciliation — 2026-11-23

Source: `codex/mawdda-retention-approval-ci-repair-2026-11-19`, tip `179ba95fa582082c7ed32c3f3016b899b414b0ca`. Compare against Recovery at `05df918151960a807a749b80774983fc35b774f3`: 17 source-ahead commits, 1,062 behind, 10 changed paths.

### Findings from changed paths fetched in this pass

- Source `functions/src/index.ts` contains profile-media retention fields/paths and existing retention worker wiring. Recovery contains the corresponding behavior plus sticker retention wiring and broader media handling.
- The source and Recovery wallet-store integration suites both cover transfers, store purchases, owner catalog, manual payment, and reconciliation. Recovery's suite is longer and includes additional corrupt-catalog/version boundary coverage.
- Owner entitlement grant and premium-profile integration tests are present in both; Recovery retains the current richer canonical versions.
- Source workflow changes are limited to one additional integration invocation in each of Validate and Domain Regression; Recovery's active test workflows already have broader integration coverage.
- The source decision ledger records RET-003 partial text-retention work and explicitly lists unresolved mode selection/consent, server activity writes, notices, and full temporary-chat deletion. Recovery's canonical approved-decision ledger contains this same unresolved status and additionally documents Media Saver's still-incomplete lifecycle.
- No `retention.ts` source change is in the compare path list. No new retention worker implementation was identified in this 17-commit branch delta.
- No retention mode was activated, no destructive workflow was run, and no production deletion behavior was changed.

**Disposition: OPEN.** Do not copy or activate any retention deletion behavior. The full changed-path review remains incomplete, including precise `index.ts` additions and all 10 paths. No source code was copied and no tests were run.
