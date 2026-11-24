# E522 Source Branch Transfer Ledger — 2026-11-22

## Governing decision

- E522 baseline: e522acb5a47964b529b84f49bacd9db0167a6dc5.
- Sole continuation: codex/mawda-recovery-integration-2026-11-21.
- No parallel development branches are destinations.
- All source branches with no remaining transfer value have been placed in the X section. The separate X safety review and any deletion happen later.
- Branch refs remain intact; X classification is not deletion approval.

## Current continuation evidence

- Code evidence snapshot before this ledger refresh: fe53e958ac9a010f5ec0a57d2fe2beb86ababd0c (197 ahead / 0 behind E522).
- This ledger refresh is documentation-only; it adds no application code.
- Latest-head GitHub Actions runs: none returned.
- Latest-head combined statuses: none returned.
- No build or test suite has been run for this transfer batch. Do not claim CI or tests passed.

## Branch disposition

- Existing X inventory: 61 refs.
- Newly moved into X section: 15 refs.
- Total recorded in X section: 76 refs.
- Still undergoing selective transfer: 3 source branches.
- Deleted or renamed branch refs: 0.

The 15 newly moved refs and all 61 existing X refs are enumerated in E522_X_BRANCH_SECTION_2026-11-22.md. The 3 remaining sources are:

1. codex/economy-recovery-2026-11-18
2. codex/featured-ads-secure-lifecycle-20261118
3. codex/mawdda-unified-test-2026-11-18

## Selective transfer — coin package gifting

Transferred on the E522 continuation:

- Server request validation for bounded recipient UIDs; package gifting only, with custom-amount gifts rejected.
- Server-side recipient Auth/member eligibility checks and guest rejection from the source implementation.
- Request creation with immutable package snapshot, E522 pricing-policy version and payment-policy snapshot.
- Owner payment-instruction guard requiring the agreed terms to match the selected package exactly.
- Approval path credits the recipient, not the purchaser, through the existing E522 wallet ledger and owner audit transaction.
- Gift record, recipient history and notification writes are part of the approval transaction.
- Member history callable now projects received coin-package gifts without exposing private records.
- Wallet UI routes to gift-package flow and received-gift history; owner request UI displays the recipient and agreed terms.
- Unit tests added for recipient validation and immutable package-term matching.

Relevant files: functions/src/coin-purchase-requests.ts, functions/src/index.ts, functions/test/coin-purchase-requests.test.js, lib/screens/wallet_screen.dart, lib/screens/owner_coin_purchase_screen.dart.

Status: **selectively transferred; code review and test execution still required**. Do not declare the gift lifecycle accepted until tests and full transaction/read-back review complete.

## Selective transfer — stickers

Transferred as a safe, disabled foundation:

- Owner-only sticker purpose and strict type/size validation added while preserving E522 biometric media purpose and rules.
- Scanner verdict schema now requires measured sticker metadata for clean sticker verdicts and still accepts malicious verdicts without metadata.
- Scanner service can inspect static/animated sticker media, validate dimensions/frame/duration, and produce bounded safe derivatives.
- Scanner callback persists verified sticker metadata and enforces sticker-specific derivative size limits.
- GIF derivative contract permits sticker use only for platform-owner assets.
- Replay-identity helper and tests cover sender, media, pack and sticker identity.
- Scanner/security/media unit and integration tests were added, but have not been executed.

Safety gate: media upload for purpose sticker is deliberately rejected by the E522 callable until the owner-approved sticker retention and cleanup lifecycle is resolved. Publishing, catalog delivery, signed URL issuance and member direct/room sending remain unavailable. This prevents an unapproved shared-asset lifecycle from becoming live.

Relevant files: functions/src/media-security.ts, functions/src/media-scanner.ts, functions/src/media-derivative-contract.ts, functions/src/media.ts, functions/src/sticker-policy.ts, scanner/security.js, scanner/processors.js, scanner/server.js and corresponding tests.

Status: **scanner foundation and draft-only owner pack authoring selectively transferred; upload, publication, catalog delivery, signed URL issuance and member send remain disabled**. Chat-screen picker integration and the second source branch comparison remain outstanding. Do not move either sticker source branch into X until the unique sticker work has been reconciled and completed or explicitly rejected.

## Remaining work before X review

1. Complete and test the package-gifting lifecycle on E522, including replay, recipient eligibility, owner instructions, approval, wallet ledger, history and audit consistency.
2. Compare both sticker implementations and tests; retain only the safer missing functionality.
3. Obtain or ground an owner-approved retention/cleanup rule for platform sticker assets. Until then keep upload, publication, URL delivery and member send disabled.
4. Finish selective transfers from the three source branches or document why a particular delta is rejected.
5. Recompare every source branch after transfer and move completed branches into X.
6. Only then perform the separate X safety review and request explicit approval before any branch deletion.

## Non-claims and protected boundaries

- No test or build success is claimed.
- No 5,000-persona simulation, external test or physical-device acceptance is claimed.
- No merge to main, deployment, production Firebase mutation, paid service activation, billing action, iOS identity change or production data deletion was performed.
- No branch ref has been deleted, renamed, force-updated or rewritten.


## Live workflow and commit audit — 2026-11-22 18:39 UTC+03

Audit window requested: 12 hours, from 06:39 UTC+03 through 18:39 UTC+03. The last-six-hour subwindow is 12:39–18:39 UTC+03.

Verified E522 continuation evidence:
- Current branch head: e01f1b99818d0b0b21af333d111617e3b96ba7ce.
- Last application-code commit inspected: fe53e958ac9a010f5ec0a57d2fe2beb86ababd0c, created 2026-11-22 18:04:47 UTC+03; it only exports the already-gated sticker callables from functions/src/index.ts.
- Latest head documentation commit: e01f1b99818d0b0b21af333d111617e3b96ba7ce, created 2026-11-22 18:05:45 UTC+03; documentation-only, clarifying the prior code-evidence snapshot.
- The E522 baseline comparison is 199 ahead / 0 behind.

Workflow evidence:
- Commit-associated workflow lookup for e01f1b9 returned zero runs.
- Commit-associated workflow lookup for fe53e95 returned zero runs.
- Combined commit statuses for both SHAs returned zero status entries.
- These connector workflow lookups are documented as PR-triggered-run-only and first-page-only. Therefore zero returned is not proof that no push, dispatch, scheduled, or other workflow runs occurred in the requested window.
- The repository commit-search query for 2026-11-22 returned no indexed results; it is not a complete branch-history or Actions-run inventory and is not used as proof of absence.
- No test/build success is established by this audit.

Last-six-hour change assessment:
- The two directly inspected continuation commits are fe53e95 (application-code export only) and e01f1b9 (documentation-only), both at approximately 18:05 UTC+03; no other last-six-hour commits are asserted because the available history/search interface does not provide a complete branch commit listing.
- The actual workflow run history for the full 12-hour window remains unverified pending an Actions endpoint that lists all event types and pages.

This audit records verified evidence and explicit coverage limits; it does not mark gifting or stickers closed.


## Correction of unauthorized main-branch test addition — 2026-11-22 18:47 UTC+03

- Unauthorized commit identified: fbdb05dc37dd3bd806315aab38f78a7cedc4d699.
- Its only changed path was `functions/test/integration/coin-package-gifts.integration.test.js` (new file, 158 lines); no application code or production configuration was changed by that commit.
- Corrective commit on `main`: a2dfa7e75352eeb6b8d5029a8e5838fb271b924f, deleting that exact file.
- Post-correction comparison of `main` with pre-incident E522 commit d4eb54334d4a7021a6c7ed55b5e80aad2ce2769c reports zero changed files. The tree content is restored to the pre-incident state, although main's commit history retains the original commit and its corrective deletion commit.
- No force push, branch rewrite, merge, deployment, Firebase production operation, or paid-resource change was performed.
- E522 work branch head observed during correction: d4eb54334d4a7021a6c7ed55b5e80aad2ce2769c. This is the only intended development target for subsequent work.

## Parallel gifting and sticker source audit — 2026-11-22 19:12 UTC+03

Audit target: `codex/mawda-recovery-integration-2026-11-21`. The E522 head observed immediately before this audit was `ec37378b02f8e05b4d8d3fafd0e970b09801f81b`; after the test-only update below, the new head is `ec5328be3e4b529770e3172ff6f0cc00c7f7e5ce`.

### Coin-package gifting source comparison

- Compared `codex/economy-recovery-2026-11-18` against the E522 continuation. The source implementation of `coin-purchase-requests.ts` does not contain the E522 package-term equality helper or the approved-gift replay projection helper.
- E522 already contains the stronger package snapshot agreement check and replay validation for the gift record, recipient history and notification.
- The source test's additional KWD/JPY currency examples conflict with the current E522 currency policy tests, which explicitly reject KWD/JPY and other non-allowlisted codes. Those cases were not copied and no currency policy was changed.
- The source `store-gifting.ts` replay identity omits catalog version; E522 requires catalog-version equality and tests changed-version replay rejection. The weaker source variant was rejected.
- No gifting application-code delta from this source was found safe to add on top of the current E522 implementation during this comparison. End-to-end transaction/read-back review and test execution remain open.

### Sticker source comparison

- Compared `codex/featured-ads-secure-lifecycle-20261118` and `codex/mawdda-unified-test-2026-11-18` with E522 for sticker policy, media security, media lifecycle, tests and chat integration.
- E522 already has the sticker metadata/manifest checks, scanner metadata binding, safe-derivative checks, owner-only draft pack save and replay identity helper.
- The alternate test branch contains additional useful unit coverage for pack-count boundaries, malformed pack identifiers/media metadata, and removal of private catalog metadata. Three corresponding test cases were added to `functions/test/sticker-policy.test.js` on E522 in commit `ec5328be3e4b529770e3172ff6f0cc00c7f7e5ce`.
- The alternate chat UI includes a sticker picker/send path and the alternate media implementation includes enabled send/delivery behavior. E522 deliberately rejects sticker upload, signed URL delivery and member send pending the owner-approved retention/cleanup lifecycle. These enabled paths were not transferred.
- No retention policy was inferred or activated. The E522 sticker flow remains disabled beyond safe scanner/draft foundations.

### Verification and remaining status

- This audit performed source comparisons and one test-file-only commit on E522.
- No tests, builds, workflows or device checks were run in this audit. The added tests are **written but not executed**.
- The three source branches remain intact; none was merged wholesale, deleted, renamed or force-updated.
- Gifting remains open for end-to-end transaction/read-back review and test execution.
- Stickers remain open for owner decision on retention/cleanup, then gated lifecycle implementation, picker integration and tests.
- The X inventory and deletion review are unchanged; no branch is moved to X by this scoped audit.

### Follow-up verification of the gift integration test — 2026-11-22 19:18 UTC+03

- Confirmed that `functions/test/integration/coin-package-gifts.integration.test.js` is present on the E522 continuation. It exercises recipient eligibility, immutable package terms, owner instructions, payment verification, recipient wallet credit, ledger/gift/history/notification/audit projections, idempotent replay and a missing-history replay failure.
- The test explicitly requires Firebase Auth and Firestore emulators. It was inspected but **not executed**; no emulator or workflow run is claimed.
- The commit-associated workflow lookup for the audit documentation commit returned no runs. That connector lookup only returns PR-triggered runs from the first page and is not evidence that all Actions event types were absent.
- Latest confirmed documentation commit: `ee4c9175218ac5aadbb8a5b9058b50b4f25a7982`. The sticker test additions remain unexecuted.


## Live 83-ref inventory reconciliation — 2026-11-22 22:15 +03

This snapshot is generated from the repository branch-list API at the current audit time. It records exact ref heads and the already-approved disposition; it does not inspect or mutate X branch contents.

- Total live branch refs: 83.
- X refs enumerated by the controlling X section: 76. They remain frozen and untouched; no X branch was checked out, compared, modified, moved, deleted, or renamed in this pass.
- Remaining eligible source refs for selective reconciliation: 3.
- Protected refs outside source-port work: E522 continuation, main, and two pre-unification archives.
- Canonical E522 continuation head at snapshot: `724a8443ff95ebafb90f819afee90bf78f83c068`.
- Immutable baseline: `e522acb5a47964b529b84f49bacd9db0167a6dc5`.

### Exact branch-head register

| Ref | Exact head SHA | Disposition |
|---|---|---|
| `archive/development-pre-unification-2026-11-15` | `f068a8b2e3ad91551c2b27c9f554de04bbfc609e` | PROTECTED / BASELINE / ARCHIVE |
| `archive/main-pre-unification-2026-11-15` | `460a79a7dc2e16f4ad146af22aab58e152ad1e8c` | PROTECTED / BASELINE / ARCHIVE |
| `codex/biometric-final-owner-policy-2026-11-20` | `08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23` | X-FROZEN (untouched) |
| `codex/biometric-final-policy-drift-closure-2026-11-20` | `0089c556a7e241454cfbfb3223fff500cc8763bb` | X-FROZEN (untouched) |
| `codex/biometric-manual-review-gate-2026-11-20` | `a82a0614f7526bfb56c6bcc93764a5b907406e95` | X-FROZEN (untouched) |
| `codex/biometric-server-lifecycle-2026-11-20` | `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` | X-FROZEN (untouched) |
| `codex/biometric-video-duration-validation-2026-11-20` | `be9b8109c8ae4b62a0b17e9b70a851307a3294f6` | X-FROZEN (untouched) |
| `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | `64ccc7b20445e7be15d6ec4d0be0e329f0250f11` | X-FROZEN (untouched) |
| `codex/economic-phase1-closeout-2026-11-18` | `10564784494310761bb4249d703d646020209e35` | X-FROZEN (untouched) |
| `codex/economic-phase-completion-2026-11-18` | `0914885232ff8bcfb64536c6655e7bff01b78361` | X-FROZEN (untouched) |
| `codex/economic-phase-controlled-integration-2026-11-19` | `beec6e424ccdb1f1df24d44b2893212983508f7e` | X-FROZEN (untouched) |
| `codex/economy-official-port-2026-11-18` | `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c` | X-FROZEN (untouched) |
| `codex/economy-recovery-2026-11-18` | `67adbaeccc02128f5e5a86ea01b0c4f63c09106f` | SOURCE-PENDING (selective review) |
| `codex/featured-ads-secure-lifecycle-20261118` | `b15b643f14bc6c1196bf914190778e053e2ac9b1` | SOURCE-PENDING (selective review) |
| `codex/featured-ads-serving-foundation` | `0fe15db693eb0a36a73c11a6e563e189069e74ba` | X-FROZEN (untouched) |
| `codex/governance-biometric-integration-2026-11-19` | `619eab643e2d5849b3b2c055461d53ba2be01753` | X-FROZEN (untouched) |
| `codex/mawda-full-platform-implementation` | `d4dc7399877f5aeafc2ca95422fc5a63324ab26f` | X-FROZEN (untouched) |
| `codex/mawda-phase2-hardening` | `f8abd722ececc988c555f0400cc7b558e762ae5a` | X-FROZEN (untouched) |
| `codex/mawda-recovery-integration-2026-11-21` | `724a8443ff95ebafb90f819afee90bf78f83c068` | PROTECTED / BASELINE / ARCHIVE |
| `codex/mawda-unified-constitution-vision-2026-11-19` | `53bf236076d617f625b1b4225eb014e5c90e17fb` | X-FROZEN (untouched) |
| `codex/mawdda-audit-archive` | `6a94a078695bd8d70884a843efb7cf9d3bfc740a` | X-FROZEN (untouched) |
| `codex/mawdda-audit-archive-full` | `5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47` | X-FROZEN (untouched) |
| `codex/mawdda-biometric-owner-review-policy-2026-11-20` | `693dc110a931107f2fcc1f829e08974932ab65db` | X-FROZEN (untouched) |
| `codex/mawdda-biometric-proof-gate-2026-11-20` | `73b53918e2de76d97d9f9cf7dff1706cc9d124b5` | X-FROZEN (untouched) |
| `codex/mawdda-deep-audit-profile-store` | `4ed7394235ea531e4b4abbb24431731da15eaf47` | X-FROZEN (untouched) |
| `codex/mawdda-deep-governance-audit-2026-11-19` | `ae21101e7e76001b64b43b6bf515c85ea028f34e` | X-FROZEN (untouched) |
| `codex/mawdda-economy-selective-port-2026-11-19` | `7d93d4c097f2079668b1dc25b0a4fb1fc1afb8d0` | X-FROZEN (untouched) |
| `codex/mawdda-final-archive-v2` | `f79b112c628c8a1709f860a8d25c1f975eddcace` | X-FROZEN (untouched) |
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | `c0a14ef27b3c0442c969f872243214e637cdc188` | X-FROZEN (untouched) |
| `codex/mawdda-group-call-capacity-2026-11-20` | `2f67e4a6cdaeedf5190cbd2e3acdb0ece4747c0a` | X-FROZEN (untouched) |
| `codex/mawdda-independent-verification-cycles-2026-11-20` | `615f9f974ea9e252772bee43339261288b7a2729` | X-FROZEN (untouched) |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | `2064bbcc98aa360ac2d46d05d15cbf8f90561817` | X-FROZEN (untouched) |
| `codex/mawdda-member-inbox` | `f55e1d15423abee81dc125315e95a9acea199fdf` | X-FROZEN (untouched) |
| `codex/mawdda-member-inbox-rebased` | `4933e76a38501ac533c37fbac2fc9c7078f5c597` | X-FROZEN (untouched) |
| `codex/mawdda-mfa-signin` | `607647ec0325eaf56bd58a4c2283aedaa47e7e68` | X-FROZEN (untouched) |
| `codex/mawdda-native-platform-scaffold` | `d556a9990ffe4472fe86ab48acc696adc9c109f6` | X-FROZEN (untouched) |
| `codex/mawdda-phase1-phase2-hardening` | `cacdc51f22f7146145a81c5e4d0729aee5f5063d` | X-FROZEN (untouched) |
| `codex/mawdda-phase1-unified-2026-11-19` | `e12897ad7dc5f383501d997117fb1211c67632e7` | X-FROZEN (untouched) |
| `codex/mawdda-pr3-port` | `6e11d5a631d61f9e92b37fd64c827f37ec8e9c11` | X-FROZEN (untouched) |
| `codex/mawdda-premium-effects` | `5203d25ab38df8ae2a2bd700537e2f0d14bfbde3` | X-FROZEN (untouched) |
| `codex/mawdda-premium-features` | `f3884061a5d7be3836adc6d6b94de10e534625ab` | X-FROZEN (untouched) |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` | `179ba95fa582082c7ed32c3f3016b899b414b0ca` | X-FROZEN (untouched) |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | `ce899717f77ad3c76d676903aa0c026ba7596490` | X-FROZEN (untouched) |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | `5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51` | X-FROZEN (untouched) |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | `7a134c6d5adf02f8e2bbd3b931deb5ef592fbf1c` | X-FROZEN (untouched) |
| `codex/mawdda-role-capacity-final-2026-11-19` | `138d9b5d6624d111d61b6b71bf0cb60a8b17050d` | X-FROZEN (untouched) |
| `codex/mawdda-room-audio-duration-enforcement` | `dc1c1a43f6c8b4cfb198544ad21975612f89ca83` | X-FROZEN (untouched) |
| `codex/mawdda-room-events` | `b0b5214ab3b3b31f2c4ff494ce6ffe3536ae1615` | X-FROZEN (untouched) |
| `codex/mawdda-safety-ui` | `1e4c6aa97a679d0eaa88708571341e79e9e06c68` | X-FROZEN (untouched) |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | `ea6b05253ab702e773611ec48d31518a50943acd` | X-FROZEN (untouched) |
| `codex/mawdda-store-entitlement-coverage` | `7b53ad8e3418d3e9494517862ade66a010871564` | X-FROZEN (untouched) |
| `codex/mawdda-store-entitlement-hardening` | `bca089273f4c3652eeb01d27f5cc2788c386c060` | X-FROZEN (untouched) |
| `codex/mawdda-store-entitlement-hardening-v2` | `7506f5d4034b58477fe0bfbc28ab90ead4f77eb0` | X-FROZEN (untouched) |
| `codex/mawdda-store-wallet-entitlement-closure` | `201f5bfc8d73a982e9edab9be6858b085c2b2eb8` | X-FROZEN (untouched) |
| `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | `40845f2de04106081640b9e83bb8d0fa983fbf49` | X-FROZEN (untouched) |
| `codex/mawdda-test-account-system` | `d89d30a623369e5b687525297b97257192a27462` | X-FROZEN (untouched) |
| `codex/mawdda-unified-final` | `ddf9594ea6029036512ace621f513d6edf58a068` | X-FROZEN (untouched) |
| `codex/mawdda-unified-final-v2` | `e249c664f9a48dd8a198e274b38033a7cbba0a3d` | X-FROZEN (untouched) |
| `codex/mawdda-unified-final-v3` | `ab5e37e6d7f437a491e85883b91e8bcde76d438e` | X-FROZEN (untouched) |
| `codex/mawdda-unified-release` | `42e11d492584a556e018e70db2eed71de84616fa` | X-FROZEN (untouched) |
| `codex/mawdda-unified-test-2026-11-18` | `b62fcbae7ea3cd0c2b473f730cb625b35335de67` | SOURCE-PENDING (selective review) |
| `codex/phase1-advertising-callable-auth-2026-11-20` | `d857497c50eca8d7dcf105e938c8060402ae85e3` | X-FROZEN (untouched) |
| `codex/phase1-branch-governance-audit-2026-11-20` | `a48e93aa04d024f27c8877df42555050b95f9f71` | X-FROZEN (untouched) |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | `d46cd7095915bf98480ef38574356c62d72e6a95` | X-FROZEN (untouched) |
| `codex/phase1-ci-evidence-2026-11-20` | `6ad595cf10964ab54a39f3b0629efd5f8ef6e043` | X-FROZEN (untouched) |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | `b78817d0e6d7a73398fcce1d54c7df4f6707d045` | X-FROZEN (untouched) |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | `ac22ff635c41e4a36603c8864af53942e22e3fcb` | X-FROZEN (untouched) |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | `99639a6c7adf25c32eca6b93c0cc393d130f8e8f` | X-FROZEN (untouched) |
| `codex/phase1-integration-batch-01-inventory-2026-11-19` | `2fff6276055de44bc488cc123cec16491421a8e6` | X-FROZEN (untouched) |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e` | X-FROZEN (untouched) |
| `codex/phase1-media-hold-delete-race-2026-11-20` | `43471705e469f09e55658660b8b9f921401a00d4` | X-FROZEN (untouched) |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | `87ff3963868a4431948274695c83dce255aaa350` | X-FROZEN (untouched) |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | `6da140cbcd359c17805477e81401bfacef7268f0` | X-FROZEN (untouched) |
| `codex/phase1-rented-room-call-gate-2026-11-20` | `41dc2c2fd679f736d48f912c1e248f8615554649` | X-FROZEN (untouched) |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | `20519494a898b19f08bcaf4f22e4af64acff622b` | X-FROZEN (untouched) |
| `codex/phase1-specialist-callable-auth-2026-11-20` | `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` | X-FROZEN (untouched) |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | `315c8d53dc4b7e6df0af1803191df7bf5786adcc` | X-FROZEN (untouched) |
| `codex/phase1-store-gift-concurrency-2026-11-20` | `2f175165ed17a1a02b47439bacfbb187b1e00d6e` | X-FROZEN (untouched) |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | `b4546e69543b70a08b4e50c678316ac848c70c06` | X-FROZEN (untouched) |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | `3c8ab48d320e3a4b827d4c3eca558691d6c01c75` | X-FROZEN (untouched) |
| `codex/production-readiness-tests` | `424599a34acc9ec33b4e759ba166dc6d0a9df04d` | X-FROZEN (untouched) |
| `codex/structural-governance-biometric-roles-2026-11-19` | `e71f3eb559e7f86edecd97fb366ad9c69b5817c5` | X-FROZEN (untouched) |
| `main` | `a2dfa7e75352eeb6b8d5029a8e5838fb271b924f` | PROTECTED / BASELINE / ARCHIVE |

### Remaining three source comparisons against E522 continuation

The comparisons use the live E522 continuation head above. Because these source refs diverged substantially from E522, ahead/behind counts and changed-path lists are not themselves evidence that every listed file is missing; semantic review must use the controlling selective-transfer findings already recorded above.

| Source | Exact head SHA | Compare status | Source-side ahead | E522-side ahead | Merge base | Disposition |
|---|---|---|---:|---:|---|---|
| `codex/economy-recovery-2026-11-18` | `67adbaeccc02128f5e5a86ea01b0c4f63c09106f` | diverged | 618 | 999 | `7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1` | Gift implementation reviewed selectively; no safe missing application-code delta identified; keep source ref pending until E522 transaction/read-back review and tests complete. |
| `codex/featured-ads-secure-lifecycle-20261118` | `b15b643f14bc6c1196bf914190778e053e2ac9b1` | diverged | 199 | 1000 | `c759083e04ffd98616691c2e736207095aaf2dbc` | Sticker/security functionality compared; do not port enabled upload/send/delivery paths while retention lifecycle gate is unresolved. Keep source pending. |
| `codex/mawdda-unified-test-2026-11-18` | `b62fcbae7ea3cd0c2b473f730cb625b35335de67` | diverged | 311 | 999 | `7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1` | Three additional sticker-policy boundary/privacy tests were already selectively ported in `ec5328be3e4b529770e3172ff6f0cc00c7f7e5ce`; alternate enabled sticker flows were rejected pending approved lifecycle. Tests remain unexecuted. |

### Work completed in this reconciliation pass

- Re-read the controlling E522 directive and source-transfer ledger.
- Reconciled all 83 current refs against the existing X classification without inspecting X branch content.
- Compared the three remaining eligible source refs to the E522 continuation and recorded exact heads, merge bases and ahead/behind results.
- No branch was merged wholesale, cherry-picked, deleted, renamed, force-updated or otherwise mutated in this pass.
- No tests, builds or GitHub Actions were run in this pass. The previous ledger's statement that gift/sticker tests were written but unexecuted remains in force.

### Outstanding acceptance gates

1. Execute the approved internal GitHub Actions checks against the exact current E522 head; do not use external simulations or the 5,000-persona lab.
2. Complete gifting integration transaction/read-back verification and record the actual test run and database/emulator read-back evidence.
3. Keep sticker upload, publication, signed URL delivery and member send disabled until the owner-approved retention/cleanup policy is implemented and its internal tests pass.
4. Only after the three eligible source branches are closed, begin the separate X review. X remains unchanged and deletion still requires a separate explicit owner approval.

## Acceptance evidence refresh — 2026-11-22

### Current canonical target
- E522 continuation: codex/mawda-recovery-integration-2026-11-21
- Exact tested head: d1abc69d2d501f98685f74e0340bdabd45e2f27a.
- Live repository branch inventory returned 83 refs; X section inventory remains 76 refs. X was not opened for content review or modified.

### Internal GitHub Actions evidence on the exact E522 head
- Economic phase verification: run 45059917379, conclusion SUCCESS, SHA d1abc69d2d501f98685f74e0340bdabd45e2f27a. Steps included Functions build/unit suite and call-signaling emulator integration.
- Mawdda Test Center: run 45059917362, conclusion SUCCESS, same SHA. Steps included Flutter analyze, Flutter tests, release web build/artifact upload, and complete emulator-only backend suite via npm run test:all.
- The test:all script explicitly includes test:coin-package-gifts-integration, test:store-gifting-integration, backend unit tests (including sticker-policy.test.js and retention.test.js), and Firebase rules/emulator suites. Internal GitHub Actions only; no external simulation or 5,000-persona run was requested or performed.

### Updated gift acceptance
- The coin-package gift integration test exists at functions/test/integration/coin-package-gifts.integration.test.js and asserts recipient credit, sender balance unchanged, wallet ledger, gift record, history, notification, audit and replay integrity by reading emulator documents after approval.
- The complete Test Center run succeeded on the exact E522 SHA and its test:all script invokes that integration test. Gift integration gate: PASS in CI for this SHA. This is emulator/CI evidence, not a production transaction.

### Sticker retention discrepancy — release blocker
- Owner-approved policy docs/policies/STICKER_RETENTION_POLICY_2026-11-22.md says 60-minute retention and an hourly UTC cleanup sweep, and records that full sticker lifecycle implementation/tests were not yet proven.
- E522 functions/src/retention.ts defines STICKER_MEDIA_RETENTION_MS = 60 * 60 * 1000 and includes sticker in the shared media-retention sweep, but enforceChatMediaRetention runs every 5 minutes, not hourly. Changing this shared schedule would also change cleanup cadence for other media; do not use that as a sticker-only fix.
- Current E522 tree has sticker policy/catalog/unit tests and generic media retention unit/integration tests, but no dedicated sticker lifecycle integration test covering expiry blocking reads/sends before physical deletion, removal from published packs/catalog, direct/room message references, all object generations/derivatives, late upload/scanner callback tombstones, retries/idempotency, audit, and legal holds.
- Sticker retention is NOT ACCEPTED / NOT CLOSED. Do not enable production cleanup, and do not claim the sticker cycle complete. Implement an isolated sticker-specific hourly sweep and enforce expiry in catalog/delivery/send paths, then add and run the dedicated emulator lifecycle suite before closing this gate.

### Source-branch transfer status
- The three source branches remain divergent from E522. Compare statistics are not semantic transfer proof. No wholesale merge was performed and no new source code was cherry-picked in this acceptance refresh.
- Their unique-content reconciliation remains open; successful CI runs validate the current E522 head, not untransferred branch deltas.
- X remains frozen and untouched. No external tests, production Firebase changes, deployments, merges to main, or deletion operations were performed.

### Acceptance decision
- Gift integration: PASS (internal CI/emulator on exact E522 SHA).
- E522 Flutter/backend/Firestore rules/emulator Test Center: PASS (internal CI on exact E522 SHA).
- Sticker retention/lifecycle: BLOCKED — schedule mismatch and missing dedicated lifecycle integration proof.
- Three source branches semantic reconciliation: OPEN.
- All-83 final content reconciliation: OPEN.
- X review/deletion: NOT STARTED; frozen by instruction.


## Reconciliation execution update — 2026-11-23

### Sticker retention implementation committed on E522

- Branch: `codex/mawda-recovery-integration-2026-11-21`.
- Commits:
  - `4686263fc64ad7297e5e94ba5c6d486cd2aefe7c` — isolate sticker media from the general five-minute purpose list and add a separate hourly UTC scheduler.
  - `0ff3241e65afd0624e859344e7d1be1161cf5ebc` — export the dedicated trigger from Functions index.
  - `2935097d48cd02b6adfd7722d26f60ceb51b7b8e` — unit assertion that sticker purpose is isolated.
  - `e641a6259f390cda05fe5c7b4d2f1a68cf821f29` — expose dedicated sticker sweep runner and route the hourly trigger through it.
  - `d22a7319368596325676c52178649a79e319458f` — emulator integration test proving the general sweep preserves expired sticker assets and the dedicated sticker sweep removes them.
- The five-minute general sweep remains unchanged for chat, room, gallery, story and avatar/cover purposes.
- The sticker lifetime remains one hour. The existing jobsMayRun guard and exact production project allowlist are unchanged. No production Firebase configuration or resource was changed.
- Acceptance status: implementation committed; no local test was run. GitHub Actions on exact head `d22a7319368596325676c52178649a79e319458f`: economy regression run `45074013554` SUCCESS; economic phase verification run `45074013537` SUCCESS; Mawdda Test Center run `45074013538` PENDING; Validate Mawda run `45074013683` PENDING at refresh. Do not mark sticker lifecycle tests passed until the pending emulator/Functions runs finish successfully.

### Three eligible source branches — semantic closeout

- `codex/economy-recovery-2026-11-18` head `67adbaeccc02128f5e5a86ea01b0c4f63c09106f`: fixed-package gift workflow and associated server/UI/integration evidence are present on E522. Wallet reconciliation source file is byte-identical. Source payment-policy comments differ only; source featured-ad finance rejects repeated receipts and lacks E522's runtime event/snapshot validation, accumulated receipts and overflow checks. No missing safe source delta identified in the reviewed economy paths.
- `codex/featured-ads-secure-lifecycle-20261118` head `b15b643f14bc6c1196bf914190778e053e2ac9b1`: sticker policy/catalog, owner pack UI, widgets, scanner and tests are represented on E522. E522's scanner/media security also preserves biometric-purpose support and stricter metadata allowlisting. The source featured-ad finance and scanner variants are older/weaker. Sticker lifecycle acceptance remains blocked separately until full CI and end-to-end lifecycle gates pass.
- `codex/mawdda-unified-test-2026-11-18` head `b62fcbae7ea3cd0c2b473f730cb625b35335de67`: wallet reconciliation code and tests, sticker policy/catalog, scanner tests and relevant media integration coverage are represented by equal or broader E522 files in the reviewed paths. No additional source-only acceptance delta identified.
- All three source refs are now classified X-FROZEN in the branch register only. No merge, cherry-pick, delete, rename, or force-update was performed.
- Two archive refs remain preserved, not X: `archive/development-pre-unification-2026-11-15` (0 ahead / 1399 behind E522) and `archive/main-pre-unification-2026-11-15` (0 ahead / 3599 behind E522).
- Live inventory: 83 refs = 79 X-FROZEN refs + 2 archive refs + E522 continuation + main. X deletion-safety review remains separate and has not started.

### Remaining acceptance gates

1. Wait for and inspect exact-head Mawdda Test Center run `45074013538` and Validate Mawda run `45074013683`; repair failures before moving to another change batch.
2. Verify the dedicated sticker integration test result in the Test Center emulator job. This test covers separation and expiry deletion, not the entire published-catalog/read/send/late-scanner/derivative lifecycle.
3. Complete full sticker lifecycle acceptance, including expiry blocking access/send, catalog/published-pack behavior, all object generations and derivatives, late scanner/upload reconciliation, retry/idempotency, audit and legal-hold behavior. Keep upload/publication/delivery/member-send disabled until this passes.
4. Keep X refs and archives intact; any deletion remains a separate owner-approved operation.


## Final implementation and CI refresh — 2026-11-23

- Latest code/test commit on E522: `a63bd1ad0f8f6f833b03e41d004a23f7587eb1cc`.
- Additional safety refinement: story-document cleanup now runs only when the requested purpose set includes `story`; the sticker-only hourly runner cannot mutate story documents.
- Dedicated sticker lifecycle emulator test now checks: generic-sweep isolation; one-hour expiry deletion of original and safe preview; preservation under active legal hold; deletion after hold release; audit record creation; late original/preview replay removal through tombstone reconciliation; and no story side effects from the sticker-only runner.
- GitHub Actions on exact code/test SHA:
  - Economic phase verification `45074441168`: SUCCESS. Functions build and complete unit test suite succeeded; call-signaling emulator integration succeeded.
  - Mawdda Test Center `45074441169`: PENDING at refresh.
  - Mawdda economy regression `45074441217`: PENDING at refresh.
  - Validate Mawda `45074441149`: PENDING at refresh.
- Earlier runs `45074013538` and `45074013683` on intermediate SHA `d22a7319368596325676c52178649a79e319458f` were cancelled after newer commits superseded them.
- The comprehensive retention emulator integration result is not yet available. Do not claim the sticker lifecycle is accepted until the Test Center run completes successfully and its retention integration step is verified.
- Source branch comparison remains closed for the reviewed feature paths; 79 refs are X-FROZEN and retained, two archives are preserved, and no refs were deleted/rewritten.
- Full sticker access/send/catalog/late-scanner lifecycle acceptance remains a separate blocked gate; upload publication, URL delivery and member sending remain disabled.

- Documentation consolidation commit: `368b151cd92dfa717fdeeaaf08b148021cd6494f` (X register, transfer ledger and semantic review refreshed atomically; no application-code changes).


## Verified CI and sticker lifecycle reconciliation — 2026-11-23

### Exact-head Test Center evidence

- Live E522 continuation head at this check: `87f8db599f042e5ab0ed0ae0a915e315db3bc6d5`.
- Test Center run `45074653000` completed with conclusion `success` on that exact SHA.
- Flutter job: analysis, Flutter tests and release web build all completed successfully.
- Backend job: `npm run test:all` completed successfully in the emulator-only workflow.
- The current `functions/package.json` maps `test:retention-integration` to `node --test test/integration/chat-retention.integration.test.js` under Firestore/Storage emulators; `test:all` invokes `test:retention-integration`. The file contains the dedicated sticker lifecycle test. Therefore that test was included in the successful exact-head Test Center run.
- This is internal CI/emulator evidence only; it is not physical-device acceptance, a 5,000-persona simulation, or deployment approval.

### Sticker lifecycle boundary after the successful test

- The dedicated integration test verifies general-sweep isolation, expiry deletion of the original and safe preview, active legal-hold preservation, deletion after hold release, audit evidence, late original/preview replay reconciliation, and isolation from story-document cleanup.
- The approved policy file `docs/policies/STICKER_RETENTION_POLICY_2026-11-22.md` specifies a one-hour server-authored lifetime and broader requirements: deny catalog/read/send immediately at expiry, remove pack/message references, cover every derivative and object generation, and prevent late scanner/upload revival.
- Current server callables remain deliberately gated: `getStickerCatalog` returns an empty disabled catalog; `getStickerAssetUrl` and `sendStickerMessage` reject requests; `saveStickerPack` accepts draft-only state. These gates were verified in `functions/src/index.ts` and `functions/src/media.ts`.
- The disabled-reason/error wording still says the retention policy awaits owner approval, although the dated policy document now records the one-hour retention decision as approved. This wording is stale; it does not enable any path. Do not enable publication, URL delivery or member sending until the remaining access-expiry, pack/message-reference, full-derivative/generation, scanner-race and retry/idempotency acceptance tests are implemented and pass.
- The hourly retention scheduler remains guarded by the existing `jobsMayRun()` environment/project gate. No Firebase production resource or live scheduler was changed.

### Current disposition

- Sticker hourly cleanup slice: **CI-verified PASS** for the scenarios listed above.
- Full sticker product lifecycle (upload → scan → publish → catalog → URL → direct/room send → expiry invalidation): **BLOCKED / not accepted**.
- E522 Test Center at `87f8db5`: **PASS**.
- No new branch, main merge, deployment, production Firebase mutation, billing change, branch deletion, rename or force update was performed by this verification.


## Repository-wide branch comparison and unique forensic transfer — 2026-11-23

### Scope and boundary

- Enumerated the live branch refs from GitHub: 83 total (79 `codex/*`, two `archive/*`, E522 continuation, and `main`).
- Compared every one of the 79 `codex/*` branch heads against E522 using GitHub commit comparison. This is ancestry/file-change inventory evidence, not proof that every divergent file has had semantic review.
- No 5,000-persona simulation, external acceptance, device acceptance, or production test was initiated as part of this transfer/comparison pass. Those are explicitly outside the merge/transfer phase.
- No branch was deleted, renamed, force-updated, or merged into `main`. Frozen X refs and both archive refs remain intact.

### Unique content transferred

- Source: `codex/mawda-full-platform-implementation`, head `93d19a2cc35dafc5df3c1253d4cbef8cf8e11466`.
- Two source-only forensic reports were absent from E522 and have now been transferred byte-for-byte into the E522 continuation:
  - `docs/audit/forensic/MAWDA_COMPLETE_FORENSIC_2026-11-22_20261123-001313.md` (289,526 characters; source blob SHA `681b4ee7b87c8bdcca612ec05b8046e39805d57c`).
  - `docs/audit/forensic/MAWDA_FORENSIC_2026-11-22_20261122-235817.md` (735,368 characters; source blob SHA `7ea11a3ab4d2ad0b06d19d9d336376f228bb183b`).
- Transfer commit: `a4200736fd354b4426309f421e6e4b5a57706a75`, parent `7a3e9586d8d4ef514fd3d161a62710aaba276c85`. Ref update used expected-head protection and completed successfully.
- Follow-up blob-SHA comparison confirms both transferred files now match their source blobs exactly.

### Representative file-level reconciliation evidence

- `codex/mawdda-member-inbox-rebased`: `lib/screens/conversations_screen.dart` is byte-identical to E522.
- `codex/mawdda-premium-effects`: `lib/widgets/premium_profile_effects.dart` is byte-identical to E522.
- `codex/mawda-phase2-hardening`: `scanner/server.mjs`, `functions/src/media-controls.ts`, and `functions/test/media-cleanup.test.js` are byte-identical to E522.
- `codex/mawdda-independent-verification-cycles-2026-11-20`: verification calendar implementation and its unit test are byte-identical to E522.
- `codex/mawdda-super-owner-biometric-state-machine-2026-11-20`: biometric review state implementation is byte-identical to E522.
- `codex/mawdda-unified-release`: biometric verification cycle implementation and unit test are byte-identical to E522.
- `codex/phase1-group-call-remainder-to-initiator-2026-11-20`: group-call economy implementation is byte-identical to E522.
- Reviewed variants of `biometric-lifecycle.ts`, `biometric-review.ts`, `platform-role-identities.ts`, `audit-archive.ts`, and `featured-ad-finance.ts` are present on E522 with equal or larger implementation files; do not overwrite the E522 versions with older branch variants.
- Audit archive Terraform/documentation differences were inspected: E522 uses a longer retention default and documents a broader collection export scope than the older source branch. The source variant is not a safe replacement.

### Remaining reconciliation work

- The 79-head ancestry inventory includes many divergent refs. Divergence/ahead counts alone do not establish unique implementation content.
- Continue file-level semantic review of remaining divergent branch deltas in coherent feature groups; transfer only source-only approved content that is not already represented or superseded on E522.
- Do not classify this inventory as complete semantic reconciliation, and do not delete any X branch. The two archive refs remain preserved.


### Additional exact-content comparisons — biometric, role, inbox, store and media

The following source-vs-E522 checks were performed by fetching both branch versions and comparing Git blob SHAs:

- Biometric server lifecycle:
  - `functions/test/biometric-evidence.test.js` is byte-identical.
  - `functions/src/biometric-evidence.ts` differs; E522 version is larger (1,700 vs 1,645 characters).
  - `functions/test/integration/biometric-verification.integration.test.js` differs; E522 version is larger (17,219 vs 15,260 characters).
  - `functions/src/biometric-lifecycle.ts` differs; E522 version is larger (40,267 vs 37,029 characters).
- Role capacity:
  - `functions/src/platform-role-identities.ts` differs; E522 version is larger (4,532 vs 3,338 characters).
  - `functions/test/platform-role-identities.test.js` differs; E522 version is larger (4,128 vs 2,842 characters).
  - `functions/test/integration/specialized-role-capacity.integration.test.js` differs; E522 version is larger (13,543 vs 4,819 characters).
- Member inbox:
  - `lib/screens/conversations_screen.dart` is byte-identical.
  - `functions/test/integration/direct-message-deletion.integration.test.js` differs; E522 version is larger (40,374 vs 35,926 characters).
- Store entitlements:
  - `functions/test/integration/wallet-store.integration.test.js` differs; E522 version is larger (47,495 vs 32,151 characters).
  - `lib/screens/shop_screen.dart` differs; E522 version is larger (17,956 vs 11,060 characters).
- Secure media:
  - `functions/src/media-controls.ts` and `functions/test/media-cleanup.test.js` are byte-identical.
  - `docs/SECURE_MEDIA_INTAKE.md` differs; E522 version is larger (12,100 vs 9,034 characters).
- Audit archive:
  - Source `infra/audit-archive/main.tf` is byte-identical to E522.
  - Source README/variables differ, but E522 has the broader audit-collection export description and a longer retention default (64,281,600 seconds vs 63,115,200 seconds). The source versions do not supersede E522.
- These comparisons show no basis to overwrite the E522 implementations with the older source variants. File length is recorded as a triage signal, not used alone as proof of semantic superiority; remaining divergent feature deltas still require exact behavior-level comparison before any further port.


## Focused semantic reconciliation continuation — 2026-11-23

Target: current E522 continuation head observed before this documentation update: `b8cca326c9677f36a6d5ea0523a64581fab3a23c`. This pass inspected exact source/E522 file contents for the candidate phase-one deltas below. It did not run tests or alter application code.

### Direct-call transaction revalidation

- Source: `codex/phase1-direct-call-transaction-revalidation-2026-11-20` (compare: 5 commits ahead / 736 behind; changed paths: `functions/src/index.ts`, `functions/src/room-call-policy.ts`, `functions/test/room-call-policy.test.js`).
- The source `room-call-policy.ts` contains the same active-rental, membership-snapshot and direct-call relationship revalidation helpers as E522. E522 additionally contains `roomCallParticipantLimit` and tests for configured audio capacity and the four-participant video cap. The source test file is therefore an older subset. No source code was ported.

### Featured-ad geography

- Source: `codex/phase1-featured-ad-geography-all-arab-2026-11-20` (2 ahead / 729 behind; two changed paths: `functions/src/featured-advertising.ts` and its test).
- The source introduces `geographicTargets`, audience-geography filtering and the `all_arab_countries` target. E522's current selector explicitly documents non-geographic selection and allows its caller to mark a selected showcase as reward-eligible; the source instead hard-codes featured previews as non-rewarded. These are materially different product contracts, not a safe mechanical test-only port. No geography behavior was copied and no ad/reward policy was inferred. This delta remains a product-policy reconciliation item unless already approved elsewhere in the canonical decision records.

### Media delivery, hold/delete race and scanner callback

- Sources: `codex/phase1-media-direct-delivery-denials-2026-11-20`, `codex/phase1-media-hold-delete-race-2026-11-20`, and `codex/phase1-scanner-error-callback-test-2026-11-20`.
- Their `functions/src/media.ts` variants are materially shorter/older than E522 and do not supersede E522's generation-pinned delivery, uploader/owner checks, and broader media safeguards. The corresponding E522 integration test already contains explicit scanner-error retryable-503 coverage, legal-hold/permanent-delete concurrent-race coverage, late safe-derivative tombstone retry coverage, and suspended-member read denial. No source implementation or tests were copied.
- The hold/delete source test includes a generation-specific audit assertion; E522's existing race test and audit assertions were found in its later section. The source test is not a missing lifecycle implementation.

### Scanner replay/verdict tests

- Sources: `codex/phase1-media-scanner-replay-regression-2026-11-20` and `codex/phase1-media-scanner-verdict-tests-2026-11-20`.
- Their candidate test files are shorter than the E522 versions; no source-only test case was identified from the compared contents that justified replacing or appending the older files. No change made.

### Store gifting concurrency/permanent entitlement/catalog version

- Sources: `codex/phase1-store-gift-concurrency-2026-11-20`, `codex/phase1-store-gift-permanent-entitlement-2026-11-20`, and `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20`.
- The permanent-entitlement source integration test is byte-identical to E522 (blob SHA `d144907961664cccc371501de73f82a6babecf73`). The concurrency and catalog-version source variants expose no additional test title beyond E522's existing two integration cases. E522 retains the stronger catalog-version replay identity and permanent-entitlement checks already recorded above. No port made.

### Rented-room call gate

- Source: `codex/phase1-rented-room-call-gate-2026-11-20` (6 ahead / 752 behind). The compared call-signaling integration test is an older, shorter subset of E522's test file. The direct-call policy source reviewed above also lacks E522's additional group-capacity helper/test. No source code or tests copied.

### Specialized callable authorization documents

- Candidate sources: `codex/phase1-specialist-callable-auth-2026-11-20` and `codex/phase1-specialized-callable-auth-inventory-2026-11-20`. Their compare results each show a single documentation-only changed path. These inventories are retained as source evidence; no authorization behavior was changed on the basis of documentation-only deltas in this pass.

### Disposition and limitations

- No application-code changes were made in this pass because reviewed source variants were either already represented by equal/broader E522 implementations/tests or introduced a product-contract difference requiring canonical policy confirmation.
- This is focused semantic reconciliation of the named paths, not a claim that every file in every frozen branch has been exhaustively semantically reviewed. All source refs remain intact; no merge to `main`, deletion, rename, force-update, deployment, production Firebase change, or billing action occurred.
- No tests/builds were run in this documentation-only pass.


## Final focused reconciliation — economy recovery, featured lifecycle, unified test — 2026-11-23

Target E522 continuation before this update: `fa46b61f0dc719f7be5168dd6c7bcd34e1b0a472`.

### Featured advertising architecture comparison

- `codex/featured-ads-secure-lifecycle-20261118` head `b15b643f14bc6c1196bf914190778e053e2ac9b1` contains a separate featured-ad stack:
  - `functions/src/featured-ad-rewards.ts` (blob `708dd8909fc640f62b83d0b945701dd4fa8c1a46`) and its unit tests (blob `fb94dff4250cf7524eca675c079096383594155e`);
  - dedicated `getFeaturedAdShowcase`, `startFeaturedAdSession`, `heartbeatFeaturedAdSession`, `completeFeaturedAdSession`, `cancelFeaturedAdSession` and owner-policy callables;
  - dedicated member/owner screens with geography selectors for featured campaigns.
- E522 does not contain those dedicated paths because the corresponding behavior is consolidated into the shared timed-ad engine:
  - `getActiveTimedAdCampaigns`, `startTimedAdvertisement`, heartbeat/completion/cancellation and reward-history paths in `functions/src/index.ts`;
  - shared campaign/version/counter/session records and central wallet-ledger credits;
  - `lib/screens/reward_center_screen.dart` for standard and featured viewing;
  - `lib/screens/owner_advertising_rewards_screen.dart` for owner campaign management and financial review;
  - `lib/screens/featured_ads_screen.dart` and `owner_featured_ads_dashboard_screen.dart` are deliberately thin entry points into the consolidated flows.
- The source's dedicated featured screens submit a geographic region and its owner screen saves `geographicTargets: [_region]`. That is incompatible with the approved contract: featured ads are non-geographic; only standard commercial ads are geographically targeted. The source reward module is a policy decision helper, not a replacement for E522's atomic shared session/counter/wallet transaction. Copying these files/callables would create a parallel subsystem and reintroduce the rejected featured-geography contract.
- The source-only module and screens were therefore reviewed and **not copied**. This is an intentional supersession/architecture disposition, not an unreviewed missing file. No source branch was merged wholesale.

### Economy recovery and unified-test branches

- `codex/economy-recovery-2026-11-18` head `67adbaeccc02128f5e5a86ea01b0c4f63c09106f` and `codex/mawdda-unified-test-2026-11-18` head `b62fcbae7ea3cd0c2b473f730cb625b35335de67` remain highly divergent in ancestry and changed-path inventory. Their whole-branch diffs are not safe merge units.
- Focused checks recorded earlier remain applicable: wallet reconciliation is byte-identical; economy/store/sticker/featured-finance implementations in E522 contain later runtime validation or stronger integrated behavior; relevant source test subsets are represented by E522's larger integration coverage. No additional independently portable source-only behavior was established in the focused files.
- No whole-branch merge, cherry-pick, source ref rewrite, deletion or rename was performed.

### Approved ordinary-ad aggregate geography correction

- Review found a concrete gap in E522's standard-ad audience filter: a campaign targeting `syria` appeared in the Syria list but was excluded from the `all_arab_countries` aggregate list. The existing UI and campaign contract already distinguish standard geographic targets from featured non-geographic campaigns.
- Corrected `campaignMatchesTimedAdAudience` in `functions/src/index.ts`: when requesting the aggregate Arab feed, a standard campaign is included if its target is one of the defined Arab-market groups (or the all-Arab target); the authenticated member must still match the server-stored Arab-country aliases. Country-specific feeds retain their exact targeting behavior. Featured campaigns continue to bypass geography and are not changed by this correction.
- Added emulator integration assertions in `functions/test/integration/engagement-rewards.integration.test.js`: the Syria-targeted campaign remains visible in the Syria feed, remains hidden from the Syria-specific feed for an Egypt member, and is visible in the aggregate Arab feed for both Syrian and Egyptian members.
- Code commit: `2de39107703283d3ea09a1815ddf6795a8f6ef84`.
- Regression-test commit: `1c9958ab1012c46bbb73e9c262aba87064e35e2d`.
- The focused integration test was added but **not run in this transfer pass**. No Test Center, 5,000-persona simulation, device acceptance, production Firebase operation, deployment, main merge, billing action, or branch deletion was performed.

### Disposition

- Featured secure-lifecycle branch: dedicated parallel stack rejected as superseded/incompatible; relevant behavior is in E522's shared timed-ad system.
- Economy recovery branch: reviewed focused economy/featured-ad paths have no safe source-only replacement; E522 retained.
- Unified-test branch: reviewed wallet/sticker/scanner/media coverage is represented by equal or broader E522 code/tests; E522 retained.
- Two forensic-only reports from `codex/mawda-full-platform-implementation` remain the only byte-for-byte unique file transfer recorded in this reconciliation series.
- All X-frozen source refs and archive refs remain preserved. Branch inventory comparison is not authorization to delete them.


## Repository-wide source-tree reconciliation — 78 source refs — 2026-11-23

- Compared the recursive Git tree of each of the 78 non-E522 `codex/*` branch refs against the E522 continuation tree at the time of this pass. The 79th `codex/*` ref is E522 itself. All tree responses were complete (not truncated).
- No branch-only application source/UI path was found outside the following four recurring source-only paths. Several already-reviewed branches (including the full-platform forensic branch after the two report transfers, phase2 hardening, audit archive variants, inbox, premium effects, native scaffold, and production-readiness tests) had no remaining source-only file paths.
  1. `functions/scripts/generate-persona-load-fixtures.cjs`
  2. `functions/test/integration/persona-load.integration.test.js`
  3. `functions/src/featured-ad-rewards.ts`
  4. `functions/test/featured-ad-rewards.test.js`
- The first two paths are a 5,000-persona emulator-load fixture generator and integration suite. They belong to the separately governed simulation/acceptance workstream and are deliberately not brought into this transfer closeout or executed here. No load fixture was generated, no synthetic account was provisioned, and no 5,000-persona run was performed.
- The latter two paths form a standalone featured-reward policy helper and its unit tests. The helper adds owner-configured global per-UTC-day reward-view and reward-coin caps, alongside campaign-level repetition limits. E522 instead uses the shared timed-ad transaction path, server-validated foreground/visibility heartbeat, campaign budget reservation, a per-campaign daily claim counter for featured ads, and atomic wallet-ledger credit. The source helper is not a drop-in module for that data model.
- This exposes one real policy difference, not a safe file-copy: the source's additional global daily view/coin caps do not exist as a global policy in E522. Copying the helper without integrating its policy version, persistent daily counters, owner configuration and UI would be dead code; integrating those caps would add new economic limits. Because quotas and reward policy are owner-controlled and must not be invented, this delta is recorded for owner-policy reconciliation and is **not silently adopted**.
- The separate featured-ad screens/callables from `codex/featured-ads-secure-lifecycle-20261118` were inspected and are not imported: they submit geography for featured campaigns and duplicate the shared timed-ad engine. E522's featured path requires an empty geographic-target list; ordinary standard ads alone use country/region targeting.
- All source refs remain preserved. No source branch was merged wholesale, no X/archive ref was deleted/renamed/force-updated, and `main` was not modified.

### Final E522 changes in this pass

- `functions/src/index.ts`: standard campaigns targeted to any Arab market group now also appear in the aggregate `all_arab_countries` feed; the server still checks the member's server-stored country/region against the Arab aliases. Exact country feeds remain filtered, and featured campaigns remain non-geographic.
- `functions/test/integration/engagement-rewards.integration.test.js`: added regression assertions for Syria-targeted standard campaign visibility in Syria and aggregate Arab feeds for Syrian and Egyptian members, while retaining the Egypt-specific exclusion.
- Code commits: `2de39107703283d3ea09a1815ddf6795a8f6ef84`, `f3e95d8d6ba96655c2a660f4ed9353254ce601de`.
- Integration-test commit: `1c9958ab1012c46bbb73e9c262aba87064e35e2d`.
- This pass added the regression test but did not execute it. GitHub push workflows were automatically triggered by the commits; their results must be read from the exact commit SHA before claiming validation. This does not authorize a Test Center/5,000-persona acceptance run as part of the transfer phase.

### Closeout boundary

- Branch-ref inventory and ancestry comparison: completed for the 79 `codex/*` refs, including E522.
- Source-tree path comparison: completed for all 78 non-E522 `codex/*` refs.
- Focused semantic reconciliation: completed for the major previously identified code families and the featured/economy/UI differences described above.
- Remaining non-portable items are explicit: 5,000-persona simulation artifacts (separate workstream) and the source branch's proposed global featured-reward daily caps (owner policy decision required). These are not silently treated as transferred or approved.
- This closeout does not delete frozen branches or archives; any X-ref deletion is a separate owner-approved operation.


### Clarification from canonical advertising decisions — reward-policy gap retained

- The source branch `codex/canonical-role-terminology-owner-confirmation-2026-11-19` was checked against the E522 decision register. Its `ADS-GEO-001` and `ADS-REWARD-001` rows are already represented in E522; E522 uses the newer canonical BetaCoins terminology. No decision-register content was missing to transfer from this branch.
- E522's approved advertising decisions specify the experimental reward envelope: 2 BetaCoins per eligible view, at most 10 views / 20 BetaCoins per UTC day, campaign repetition restriction within a 24-hour window, 10 seconds for image viewing, and 90% video completion. The newer AD viewing policy also requires the same unified timed-ad session/counter/claim/wallet path and makes the owner the authority over versioned server settings.
- E522's current code does not yet fully enforce that complete policy. It enforces campaign budgets, per-campaign counters, a featured per-campaign UTC-day limit (1–10), foreground/visibility heartbeats and atomic wallet credit; it does not currently enforce a global featured 10-view/20-BetaCoin UTC-day counter, a rolling 24-hour same-campaign restriction, or the specified 10-second continuous image evidence. Featured video publication remains blocked.
- The source-only `featured-ad-rewards.ts` helper supports global daily views/coins and per-campaign limits, but its dedicated sessions/counters/policy storage are incompatible with the approved unified E522 architecture; its owner screen also reintroduces featured geography. The helper's default configuration is disabled, and its campaign-count evidence does not itself implement the newer rolling-24-hour rule. It is therefore not safe to copy as-is or mark as a complete transfer.
- This is an **approved product-policy implementation gap** to be integrated into the existing `timedAdSessions` / `timedAdMemberCounters` / `timedAdRewardClaims` flow, not a reason to import a parallel featured-ad system. Keep reward-policy acceptance open until the unified server configuration, global UTC counter, rolling campaign window, continuous image evidence, owner controls, audit/versioning and concurrency/replay tests are implemented and verified.


### Exact-head CI evidence for the aggregate Arab feed correction

- Code/test SHA: `f3e95d8d6ba96655c2a660f4ed9353254ce601de`.
- Economic phase verification run `45122460810`: **SUCCESS** — Functions build, complete backend unit suite and call-signaling emulator integration.
- Mawdda economy regression run `45122460851`: **SUCCESS** — wallet/store atomicity; coin-package gift lifecycle; owner entitlement grant/replay; featured-ad reward policy; store catalog; room-rental; email verification reward cycle; engagement reward integration (including the new aggregate Arab feed assertions); call entitlements; owner audit chain; Firestore/Storage security rules; and full backend unit regressions.
- The test result applies to the code/test SHA above. The later commits `57ded86c5613141e3439ef8f78fe6e8b2cc3ef0a` and `3c14eda2c8f68b2bc3e630e03a1c8b32682d05dd` update only this ledger document; they do not alter application code.
- No 5,000-persona simulation was run. The separate Test Center workflow was automatically triggered by the GitHub push event and was cancelled by subsequent workflow supersession; it was not used as acceptance evidence for this transfer pass.
