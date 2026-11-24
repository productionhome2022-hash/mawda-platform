# E522 Source Branch Full Review — 2026-11-22

## Owner directive

E522 (`e522acb5a47964b529b84f49bacd9db0167a6dc5`) is the sole canonical baseline. All accepted work continues only on its existing descendant pointer `codex/mawda-recovery-integration-2026-11-21`. The prior development branch is not a destination. No new branch was created. No X ref was inspected, changed, renamed or deleted.

## Repository inventory

At the inventory snapshot, GitHub returned **83 branches**:
- 61 refs classified as X by the current project inventory.
- 18 source branches source branches reviewed in this report.
- 1 E522 continuation ref.
- 2 historical archive refs.
- `main`.

This report covers the 18 source branches source branches only. The E522 continuation is currently at `f344f25a34524185380c07a43de7320ea36f7543` at the beginning of this review pass. Comparisons below use that exact E522-descendant head as the destination snapshot. E522's original SHA remains the canonical comparison baseline.

## Disposition summary

| Disposition | Count | Meaning |
|---|---:|---|
| Already transferred into E522 continuation | 2 | Former development line and approved Media Saver capability |
| No additional transfer justified; mark as X section entry after source branches closure | 13 | Existing E522 implementation is equal/stronger, or branch contains only historical/obsolete docs |
| Unique functionality requiring selective transfer and completion on E522 | 3 | Economy gifting, sticker lifecycle, overlapping sticker implementation |
| **Total source branches source refs** | **18** | All retained; no source ref deleted |

"X section entry" is a logical disposition only. No X ref was touched. Final X deletion review remains a later, separate phase.

## A. Already transferred

1. `codex/mawda-full-platform-implementation`
   - It is now behind the E522 continuation by 20 commits and has no unique changed files relative to that continuation at the compare snapshot.
   - Its prior 129-commit E522-descendant history was transferred by PR #88.
   - PR #88 merge: `18289a83fb67b92f3bf9aeaa29d0f1c70cafb1bb`.
   - Earlier PR #86 was incorrectly merged to this source branch despite its “Draft only. Do not merge this PR” body. That mistake is documented on PR #86; no destructive history rewrite was attempted.

2. `codex/featured-ads-serving-foundation`
   - Compare to current E522 continuation: 139 ahead / 920 behind, 31 changed paths.
   - The approved Media Saver functionality is already present on E522 through the former development line and PR #88: entitlement revalidation, short-lived safe-derivative URL issuance, no retention extension, chat/room save entry points and owner catalog duration support.
   - The branch's separate featured-ad lifecycle is not imported because it duplicates the unified timed-ad lifecycle and reward ledger. No second session/claim/wallet system is permitted.

## B. Reviewed — no additional transfer justified; X section entrys after this phase

These branches were compared against the original E522 baseline in the previous inventory and against the current E522 continuation in this pass. Their inspected candidate paths are equal to, older than, or weaker than E522. No source branch is deleted or rewritten.

| Branch | Current E522 continuation compare | Review result |
|---|---|---|
| `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | 5 ahead / 828 behind; 4 paths | Canonical terminology is byte-identical; remaining charter/decision/release snapshots are historical or older. |
| `codex/economic-phase-controlled-integration-2026-11-19` | 21 ahead / 828 behind; 8 paths | Execution plan, closure checklist and legal audit are identical; constitution and vision are older drafts than E522. |
| `codex/economic-phase1-closeout-2026-11-18` | 124 ahead / 920 behind; 34 paths | Inspected call, room, gifting and integration files are older/smaller than current E522. E522 has stronger transaction and membership revalidation. No missing safe behavior established. |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | 11 ahead / 688 behind; 9 paths | Core verification-cycle file and unit test are identical; E522's calendar and renewal integration coverage are broader. |
| `codex/mawdda-member-inbox-rebased` | 7 ahead / 1954 behind; 7 paths | Conversation screen is identical; candidate screen/index/deletion/media test snapshots are older or smaller than E522. |
| `codex/mawdda-premium-effects` | 5 ahead / 2034 behind; 4 paths | Premium effects widget is identical and already wired in E522 profile; other candidate screens are older snapshots. |
| `codex/mawdda-store-wallet-entitlement-closure` | 4 ahead / 1952 behind; 3 paths | Shop and premium integration test are older/smaller. Candidate badge UI lacks evidence of a server-backed source and active route. |
| `codex/mawdda-audit-archive` | 14 ahead / 2036 behind; 6 paths | E522 audit archive source/tests cover more collections. Candidate retention is 63,115,200 seconds versus E522's locked 64,281,600 seconds; do not weaken retention. |
| `codex/mawda-unified-constitution-vision-2026-11-19` | 142 ahead / 828 behind; 64 paths | Candidate source snapshots are older/smaller. Candidate Firestore rules permit direct member reads of uploading biometric requests; E522 keeps server-only/default-deny access. Reject the weaker rule. |
| `codex/mawdda-phase1-phase2-hardening` | 1 ahead / 2036 behind; 1 path | Historical closure matrix only; no current implementation delta. |
| `codex/phase1-branch-governance-audit-2026-11-20` | 1 ahead / 629 behind; 1 path | Historical branch audit tied to an old parent SHA, not an E522 acceptance record. |
| `codex/phase1-ci-evidence-2026-11-20` | 1 ahead / 653 behind; 1 path | Historical CI tracker tied to the former integration line; not current E522 evidence. |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 10 ahead / 828 behind; 1 path | Dated audit explicitly remains OPEN and references the old development line. Retain only as historical context. |

## C. Unique work requiring selective transfer and completion on E522

### 1. `codex/economy-recovery-2026-11-18`

- Compare to original E522: 618 ahead / 771 behind; 105 changed paths.
- Compare to current E522 continuation: 618 ahead / 920 behind; 105 changed paths.
- Already present or rejected:
  - `wallet-reconciliation.ts` is byte-identical to E522.
  - Capacity-media files are already present in E522 from the prior integration.
  - Source `featured-ad-finance.ts` is weaker than E522: it rejects any repeated receipt and loses E522's accumulated partial-refund/reconciliation handling and overflow checks. Do not overwrite.
  - Source `economy-pricing.ts` expands currency support beyond E522's owner-approved 11-currency whitelist. Do not import the wider list or any candidate price suggestions.
  - Source `economy-payment-policy.ts` differs only in explanatory comments.
- Unique candidate functionality:
  - Gifted fixed coin-package requests (`giftRecipientUid`) and the `GiftCoinsScreen` / wallet entry point. The candidate includes bounded UID validation, recipient eligibility checks and owner-approved payment credit logic. It is not present in E522.
  - This is not yet a complete accepted transfer: the UI/service integration and end-to-end tests must be reconciled with E522's current versioned payment-policy snapshot, approved-currency whitelist, wallet ledger and idempotency checks. Preserve all stronger E522 financial checks.
- Disposition: **selectively transfer and complete the gift-package workflow on E522; do not merge the 105-path branch wholesale.**

### 2. `codex/featured-ads-secure-lifecycle-20261118`

- Compare to original E522: 199 ahead / 772 behind; 58 changed paths.
- Compare to current E522 continuation: 199 ahead / 921 behind; 58 changed paths.
- Capacity-media files are already byte-identical to E522 and need no second transfer.
- Unique candidate: sticker pack policy/catalog, owner upload UI, sticker widgets, scanner integration and message-send hooks.
- Its sticker policy and test files differ from the second sticker-bearing branch; neither version can be copied without semantic review.
- The implementation record states that a complete Emulator path is not yet demonstrated for owner upload → scan → publish → catalog → URL → direct/room send, and sticker asset retention/cleanup still lacks an approved lifecycle decision.
- Disposition: **selectively transfer the safe, disabled-until-complete sticker capability to E522 and finish its server lifecycle/tests there. Do not enable publishing/member sending until retention and cleanup behavior is explicitly grounded in existing approved media policy or separately approved.**

### 3. `codex/mawdda-unified-test-2026-11-18`

- Compare to original E522: 311 ahead / 771 behind; 77 changed paths.
- Compare to current E522 continuation: 311 ahead / 920 behind; 77 changed paths.
- Most of its economy, advertising, media and UI changes overlap with the prior development line and are already represented in E522 or superseded by stronger E522 files.
- Unique candidate overlaps the sticker system above. Its `sticker-catalog.ts` and `scanner/processors.js` are byte-identical to the secure-lifecycle branch, but its `sticker-policy.ts`, sticker tests, scanner server and media integration tests differ.
- Disposition: **do not merge this branch. Compare the two sticker implementations, select the safer complete implementation, combine only missing tests, and complete the feature on E522.**

## E522 transfer completion gate

Before closing this source branches phase:
1. Transfer the unique fixed-package gift workflow with E522's stronger pricing, currency, payment-policy, audit and ledger invariants preserved.
2. Transfer only the selected sticker implementation, with server-only authorization, scanner generation validation, owner publication controls, idempotent send/URL issuance, and full integration tests.
3. Resolve sticker retention/cleanup strictly through an already approved policy or a separate owner decision; no retention rule is invented here.
4. Run the permitted internal GitHub Actions workflows on the exact resulting E522 continuation SHA and record all results.
5. Recompare all 18 source refs against the final E522 continuation and verify that no source branches unique functionality remains unaccounted for.

## X phase boundary

- The existing 61 X refs remain untouched.
- No X branch was inspected, modified, renamed or deleted in this pass.
- Once the three unique-work items above are transferred/completed and the 18 source branches source refs are rechecked, produce a branch-by-branch X deletion-safety report. Deletion remains a separate owner-authorized action.

## Explicit non-claims

- This review does not claim all 18 source branches branches are closed: 15 have been moved into the X section; 3 still contain unique work to transfer and complete.
- No merge or cherry-pick of the three open unique-work branches has been performed yet.
- No tests were run in this review pass. Existing source-branch test files were inspected, but they do not prove acceptance on the current E522 continuation.
- No build, deployment, Firebase production mutation, external test, device test, or 5,000-persona simulation was run.


## Semantic review refresh — 2026-11-23

### Live branch inventory

GitHub returned 83 refs: 79 codex refs now listed as X-FROZEN, two preserved archive refs, the E522 continuation, and main. No refs were deleted, renamed or rewritten. The two archive refs are strictly behind E522 (0/1399 and 0/3599 respectively) and remain archival; main remains outside the development flow.

### Three formerly pending source refs

- `codex/economy-recovery-2026-11-18`: the fixed-package gifting path is present on E522, including `giftRecipientUid` request validation, recipient eligibility, immutable package terms, atomic recipient credit, ledger/history/notification/audit and replay/read-back integration test. `wallet-reconciliation.ts` is byte-identical. Source featured-ad finance is weaker than E522 and must not overwrite it; the payment-policy delta is explanatory comments only.
- `codex/featured-ads-secure-lifecycle-20261118`: E522 contains sticker metadata/policy/catalog, owner pack UI, widgets, scanner validation and relevant tests. Compared source files are older/weaker where they differ: E522 adds biometric-purpose support and stricter media metadata validation; E522's featured-ad finance also includes runtime event/snapshot validation, accumulated receipts and overflow protection. No safer source-only code was identified in these reviewed feature paths.
- `codex/mawdda-unified-test-2026-11-18`: the wallet reconciliation code/tests and relevant sticker/scanner/media test coverage are present on E522 in equal or broader form. The source branch does not provide a missing accepted implementation delta in the reviewed paths.

### Sticker retention work and verification

E522 now has an isolated hourly UTC sticker sweep, while the general chat/media sweep remains every five minutes without the sticker purpose. A unit assertion and an emulator integration test cover this split and expiry deletion. Commits are recorded in the transfer ledger. Exact-head CI state: economy regression and economic phase verification SUCCESS; Test Center and Validate Mawda PENDING on `d22a7319368596325676c52178649a79e319458f`.

The implementation is committed but not yet accepted. The dedicated test does not by itself prove the complete sticker lifecycle (catalog/read/send expiry enforcement, late scanner/upload callbacks, all derivatives/generations, audit and legal-hold interactions). Keep all sticker activation paths disabled until those gates pass.

### Disposition

The three source branches are semantically closed for the reviewed feature paths and classified X-FROZEN in the branch register. This does not authorize deleting their refs. X deletion-safety review remains a separate phase requiring owner approval. No main merge, deployment, production Firebase change, paid resource activation, or branch deletion occurred.


## Latest verification refresh — 2026-11-23

- Latest code/test SHA: `a63bd1ad0f8f6f833b03e41d004a23f7587eb1cc`.
- Functions build and complete backend unit suite passed in Economic phase verification run `45074441168`; its call-signaling emulator integration also passed.
- Mawdda Test Center `45074441169`, economy regression `45074441217`, and Validate Mawda `45074441149` were pending. The Test Center retention integration has therefore not yet been accepted.
- Sticker-specific test coverage now includes isolated purpose scheduling, legal hold and release, original/preview deletion, audit event, late replay reconciliation and protection of story documents from the sticker-only sweep.
- The three eligible source branches are X-FROZEN, refs retained. The two archive refs remain preserved; no main merge, deployment, production Firebase mutation or branch deletion occurred.
- Full sticker publication/catalog/read/send expiry enforcement remains blocked. Keep those activation paths fail-closed until their full lifecycle integration proof is complete.
