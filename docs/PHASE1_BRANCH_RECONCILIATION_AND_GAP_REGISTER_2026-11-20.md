# Phase 1 — Branch reconciliation and gap register
Date: 2026-11-20
Repository: `productionhome2022-hash/mawda-platform`
Integration target: `codex/mawdda-phase1-unified-2026-11-19`
Audited target baseline: `818b004f82759426699f47193c7ef8d22b870315`
Scope: GitHub branch/ref comparisons and source/PR metadata review. No 5,000-persona run, external test, production deployment, Firebase production mutation, billing, or main merge was performed.

## 1. Reconciliation rule

The integration branch is the only working destination for accepted Phase 1 changes. A branch name or green historical workflow is not proof that its unique commits are already included. Each source is classified by its merge-base comparison against the integration target. Diverged branches must be reviewed file-by-file and selectively ported; never merge a stale branch wholesale, especially where `functions/src/index.ts`, Firestore/Storage rules, workflows, package manifests, or canonical models overlap.

## 2. Branch comparison findings

### Already behind / no unique commits relative to the integration target

The following refs compare as `behind` with zero commits ahead and no unique file delta at the audit baseline. They do not need to be merged again:

- `archive/development-pre-unification-2026-11-15`
- `archive/main-pre-unification-2026-11-15`
- `codex/mawda-full-platform-implementation` (the older development baseline; integration candidate is 71 commits ahead)
- `codex/phase1-advertising-callable-auth-2026-11-20`
- `codex/phase1-integration-batch-01-inventory-2026-11-19`
- `codex/production-readiness-tests`
- `codex/mawdda-deep-audit-profile-store`
- `codex/mawdda-mfa-signin`
- `codex/mawdda-native-platform-scaffold`
- `codex/mawdda-premium-features`
- `codex/mawdda-safety-ui`
- `codex/mawdda-audit-archive-full`
- `codex/mawdda-unified-final-v2`
- `codex/mawdda-unified-final-v3`

These are not deleted or rewritten. Archive refs remain historical evidence.

### Small isolated deltas requiring separate review

| Branch | Unique delta vs integration target | Classification / action |
|---|---|---|
| `codex/phase1-specialist-callable-auth-2026-11-20` | One new security audit document | Draft PR #71; exact-head Validate and Domain Regression were started. Keep pending completion, then merge document only if checks pass. No delegated permission activation. |
| `codex/phase1-branch-governance-audit-2026-11-20` | One governance audit document | Historical document is already represented by merged PR #63 / commit `5b7179978ebf6ac9acd0ad558a4aed306bab45f0`; do not duplicate. |
| `codex/phase1-ci-evidence-2026-11-20` | One integration status document | Compare content/date against current tracker before porting; avoid overwriting newer evidence. |
| `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | One authorization inventory document | Useful evidence but records an older candidate SHA; reconcile with the newer PR #71 audit before importing. |
| `codex/phase1-media-scanner-verdict-tests-2026-11-20` | One scanner unit-test file | Inspect exact diff and current tests; do not cherry-pick until duplicate assertions and current scanner API are checked. |
| `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | One store-gifting integration test file | Overlaps merged PR #67; verify whether the new assertions are already in the unified file before considering any port. |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | One store-gifting integration test file | Overlaps merged PR #64; no blind merge. |
| `codex/phase1-store-gift-concurrency-2026-11-20` | Workflow plus store-gifting integration test | Concurrency coverage/workflow wiring is already present in the integration history; compare exact assertions before any further port. |
| `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | Group-call helper and unit test | Already delivered by merged PR #65 / commit `bfe1eac2bec7c21d7b01fb53e56aecc7a13ed9bb`; do not duplicate. |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | Featured-ad selector and unit test | Already delivered by merged PR #62; verify current target rather than remerge. |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | Media callable and integration test | Already delivered by merged PR #70; preserve its canonical account-standing checks and regression coverage. |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | Scanner callback integration test | Already delivered by merged PR #68; do not duplicate. |

### Diverged branches with substantial or overlapping implementation

These branches have unique commits but also lag the integration target. They are not safe for wholesale merges:

- Economy: `codex/mawdda-economy-selective-port-2026-11-19`, `codex/economic-phase1-closeout-2026-11-18`, `codex/economic-phase-completion-2026-11-18`, `codex/economic-phase-controlled-integration-2026-11-19`, `codex/economy-official-port-2026-11-18`, `codex/economy-recovery-2026-11-18`.
- Ads/media: `codex/featured-ads-secure-lifecycle-20261118`, `codex/featured-ads-serving-foundation`, `codex/mawda-phase2-hardening`.
- Governance/roles: `codex/governance-biometric-integration-2026-11-19`, `codex/mawda-unified-constitution-vision-2026-11-19`, `codex/mawdda-role-capacity-after-retention-2026-11-19`, `codex/mawdda-role-capacity-consolidation-2026-11-19`, `codex/mawdda-role-capacity-final-2026-11-19`, `codex/mawdda-step1-role-reconcile-2026-11-19`, `codex/structural-governance-biometric-roles-2026-11-19`.
- Chat/profile/rooms: `codex/mawdda-member-inbox`, `codex/mawdda-member-inbox-rebased`, `codex/mawdda-room-audio-duration-enforcement`, `codex/mawdda-room-events`, `codex/mawdda-premium-effects`.
- Store/entitlements: `codex/mawdda-store-entitlement-coverage`, `codex/mawdda-store-entitlement-hardening`, `codex/mawdda-store-entitlement-hardening-v2`, `codex/mawdda-store-wallet-entitlement-closure`.
- Audit archive: `codex/mawdda-audit-archive`.
- Older unified candidates: `codex/mawdda-unified-final`, `codex/mawdda-unified-release`, `codex/mawdda-unified-test-2026-11-18`, `codex/mawdda-final-archive-v2`.

The largest collision hotspots are `functions/src/index.ts`, `functions/test/integration/media-callables.integration.test.js`, `functions/test/integration/wallet-store.integration.test.js`, `firestore.rules`, `storage.rules`, `.github/workflows/validate.yml`, and the approved-decision/traceability documents. Port only a self-contained behavior with its tests, then run the affected GitHub Actions workflows.

## 3. Changes already integrated into the unified line

The current branch history and PR conversation record these selective changes as merged into the unified candidate:

- PR #63: read-only GitHub branch governance audit (commit `5b7179978ebf6ac9acd0ad558a4aed306bab45f0`); no branch protection/ruleset was changed.
- PR #64: store-gift catalog version/price/SKU fail-closed regressions (commit `b691d13dc5d74ab185f46e76bedd9c42d52cfa74`).
- PR #65: group-call pure helper remainder assigned to initiator (commit `bfe1eac2bec7c21d7b01fb53e56aecc7a13ed9bb`); full server lifecycle remains open.
- PR #67: permanent entitlement and recipient eligibility tests (commit `b4546e69543b70a08b4e50c678316ac848c70c06`).
- PR #68: scanner callback replay idempotency regression (commit `87ff3963868a4431948274695c83dce255aaa350`).
- PR #70: canonical account-standing checks and direct-media delivery denials (head `b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e`).

The merge records are evidence of prior selective integration, not proof that every later branch variant is redundant. Always compare the actual current file before porting.

## 4. Active gap register — do not close without evidence

| Priority | Gap / issue | Current evidence boundary | Closure evidence required |
|---|---|---|---|
| P0 | #48 specialized-role authorization | Permission evaluator exists but is not wired to protected callable operations; current sensitive administration remains Owner-only | Owner-approved permission/resource assignment matrix; server-derived scope; callable Emulator allow/deny matrix for owner, assigned scope, wrong scope, expired, suspended, revoked, missing and cross-family grants |
| P0 | #49 secure media lifecycle | Some authorization, scanner replay, legal-hold and deletion-race regressions have been merged; full scanner/generation/download/retention lifecycle remains open | Exact callable + Firestore/Storage Emulator lifecycle tests, generation pinning, signed URL revocation/expiry, idempotent callback/replay, late derivative tombstone, legal hold, deletion races |
| P0 | #23 group-call lifecycle | Initiator rounding helper and private rented-room admission gate exist; complete join/approval/entitlement/metering/atomic wallet settlement is not complete | Server-authoritative lifecycle and concurrency/idempotency Emulator tests against approved policy |
| P0 | #66 direct-call paid economy | Signaling/quota/connection timeout exists; owner-controlled pricing/entitlement, per-party consent, connected-time metering and wallet settlement remain open | Approved unresolved pricing/reservation/rounding decisions, then transactional backend and Emulator tests |
| P1 | #51 branch governance | Read-only audit merged; main reported unprotected/empty rulesets and integration could not verify required branch protection settings | Owner approval, verified exact check names on base, then least-privilege ruleset/protection review; do not change settings without approval |
| P1 | #52 selective source-branch extraction | Branch comparison reveals many divergent unique commits; no wholesale merge is safe | File-by-file provenance matrix, duplicate/conflict resolution, selective PRs and exact-head CI |
| P1 | #4/#5 live infrastructure and acceptance | Non-production scanner/GCS, audit export and live retention approval remain external acceptance gates | Owner-approved non-production infrastructure, security review and explicitly authorized live acceptance; no production mutation by this register |
| P1 | #19 web App Check | App Check wiring to approved web portal remains open | Emulator and authorized non-production verification before enforcement |
| P1 | #20 room rental cancellation/refund policy | Policy decision remains open | Owner-approved cancellation/refund rules before implementation |
| P1 | #69 logo source | One approved cross-platform logo source remains open | Owner approval of asset and verification across Android/iOS/PWA |
| P1 | PR #47 Step 1/14 | Draft integration review surface; source reconciliation and P0 gates remain open | Exact-head Validate + Domain Regression, issue closure evidence, branch reconciliation and owner acceptance |

## 5. GitHub-only verification policy for this work

Allowed now: GitHub Actions workflows already present in the repository, source/diff review, unit tests, Flutter analysis/tests, Functions compile/unit tests, Firestore/Storage Emulator tests, scanner container tests and rules tests, provided they do not target production.

Explicitly excluded by this work order: the 5,000-persona simulation and all external/manual/device/live-production testing. Do not trigger the simulation lab until a later explicit phase. Do not ask the owner to run tests outside GitHub Actions.

For each accepted source change, record:
- source branch and source SHA;
- target branch and target SHA before/after;
- exact files and reason for inclusion;
- overlapping files reviewed and conflict resolution;
- test workflow/run IDs and final conclusions;
- remaining gaps and issue links.

## 6. Acceptance state

This is a reconciliation checkpoint, not a completion certificate. The target branch remains the Phase 1 integration line. Divergent branches remain available for selective extraction. No main merge, production deployment, Firebase production mutation, billing activation, live retention change, signing identity change, or 5,000-persona simulation is authorized or performed by this record.


## 7. Follow-up source comparison and superseding decisions — 2026-11-20

This section supersedes the pending-review wording above where a later exact-file comparison is recorded.

### Confirmed duplicates / newer unified implementation

- `functions/test/media-scanner.test.js` on `codex/phase1-media-scanner-verdict-tests-2026-11-20` is byte-identical to the unified file.
- `functions/test/integration/store-gifting.integration.test.js` on `codex/phase1-store-gift-permanent-entitlement-2026-11-20` is byte-identical to the unified file. The older catalog-version test file's assertions are already contained in the larger unified test file.
- Featured-ad geography source and unit test, group-call settlement helper and unit test, direct-media delivery source and integration test are byte-identical between their phase1 source branches and the unified branch.
- The older private-rented-room `room-call-policy.ts` and call-signaling integration test are byte-identical to the unified branch. Its older `index.ts` changes do not supersede the unified account-standing and transaction checks.
- Store-gifting helper, unit test and Shop screen from `codex/mawdda-economy-selective-port-2026-11-19` are byte-identical to unified. The unified `giftStoreItem` callable differs materially and has additional catalog-version snapshot, replay, ledger/audit, sender-standing and entitlement validation. The unified integration test is larger and includes additional coverage.
- The unified specialized-role capacity suite is broader than the older role-capacity source branch: independent seat limits, owner capacity changes, concurrent fifth-seat assignment, open-ended team supervisors, safe-integer version overflow, expired assignments, suspension and revocation are present. Do not replace it with the older branch version.
- The old direct-call transaction-revalidation branch's room-call policy and unit test are byte-identical; its Functions entry-point variant is older and lacks current room-message account-standing checks.

### PR #43 superseded

PR #43 was closed as completed/superseded after confirming the store-gifting feature is already integrated in the unified branch and the unified Domain Regression run `44728900683` passed the explicit store-gifting wallet/entitlement integration step. No duplicate or stale store-gifting implementation was merged.

### Biometric branch safety gate

The divergent `codex/governance-biometric-integration-2026-11-19` / `codex/structural-governance-biometric-roles-2026-11-19` line contains a substantial biometric capture/review workflow that is not present end-to-end in the unified candidate (the current candidate has only the biometric verification helper and a limited integration test; biometric media/review modules and the member/Owner screens are absent). The approved-decision register explicitly states that the 1,500-coin biometric reward and biometric privileges remain disabled until cryptographic server proof is bound to challenge, account and device and resists replay/forgery. Therefore:
- Do not port reward/entitlement or biometric approval logic from the divergent branches as a small safe change.
- First audit the entire request, consent, capture, upload, private storage, owner review, decision, evidence deletion, renewal, lockout and replay lifecycle against the approved constitution.
- Keep all biometric rewards/privileges disabled until the cryptographic proof requirement is met and tested.
- Record policy conflicts and any unapproved numeric limits before implementation.

### Current unified head and exact-head tests

- Unified head after the two reconciliation/audit documents: `120ce89d0af0b4dc07403b4226ebcac8822de297`.
- Comparison with official development baseline `codex/mawda-full-platform-implementation`: **73 commits ahead, 0 behind**.
- Domain Regression run `44730418986`: **success**. Both jobs passed, including the Flutter UI/widget suite and retention/room reservation Emulator regression. The backend job also explicitly passed store-gifting, specialized-role capacity, retention, room, call-signaling and timed-ad reward integration steps.
- Validate Mawda run `44730419089`: still **pending** at the latest check; no jobs were exposed by the GitHub Actions jobs endpoint. Do not claim this run passed. Earlier specialist-audit SHA `c1edba1432b5ef783c7eb5fb4493128c7a595cb1` had Validate and Domain Regression both completed successfully, but the unified head subsequently advanced.
- PR #71 was closed as superseded after its audit document was copied into the unified branch. Its exact-head Validate run `44728900495` and Domain Regression run `44728900683` both passed.
- No 5,000-persona simulation or external/manual/device/live-production test was run.


## 8. Follow-up unique extraction audit — 2026-11-20 (PR #42, governance, economy, media, inbox and profiles)

Audit target HEAD before this documentation update: `d18b1c234a2b72413ba9814382c7ce7b996c6416`.

### PR #42 — specialized role capacity
- PR #42 head: `ea6b05253ab702e773611ec48d31518a50943acd`; branch `codex/mawdda-step1-role-reconcile-2026-11-19`; PR base is the older retention-repair branch.
- Compare against the unified line: 32 commits ahead / 214 behind; the branch is divergent and must not be merged wholesale.
- Exact-file review confirms the unified implementation supersedes the PR version:
  - `functions/src/platform-role-identities.ts` on unified is broader (115 lines versus 87), preserving the PR role IDs/capacity/labels and adding Production Quality Reviewer, Legal and Administrative Supervisor, plus the explicit owner-configurable General Production Supervisor capacity.
  - `functions/test/integration/specialized-role-capacity.integration.test.js` on unified is broader (283 lines versus 143), covering the independent fixed-seat limits, owner capacity changes, concurrency, expired/reactivated assignments, suspension/revocation and version overflow.
  - `functions/src/index.ts` on unified includes the capacity-setting transaction, capacity-aware seat guard and transaction-bound audit record. PR #42 carries an older post-transaction audit variant.
  - Strict scope validation for surrounding whitespace/control characters is already present in unified `advertising-governance.ts` and covered by unified tests; no duplicate port is needed.
  - Unified package/workflow files already execute the specialized role integration suite.
- PR #42 was closed as superseded (not merged). The review comment records the comparison and exact-head CI evidence.

### Governance and biometric branches
- `codex/governance-biometric-integration-2026-11-19`: 89 commits ahead / 303 behind; `codex/structural-governance-biometric-roles-2026-11-19`: 79 ahead / 306 behind. Both remain divergent; no wholesale merge.
- The biometric source adds a substantial request/upload/Owner-review workflow, including `biometric-media.ts`, `biometric-review.ts`, member and Owner screens, and integration tests. The inspected source SHAs include:
  - `functions/src/biometric-media.ts`: `846fcdad8d30060aa76bd1a809241c74e4b1dadb`
  - `functions/src/biometric-review.ts`: `2c33cc62e8248570233f8cd28ad2c0f46a727e62`
  - `functions/test/integration/biometric-verification.integration.test.js`: `9714ca05a41ff774331e7dc538e8a930d5f3ba42`
- The workflow uses a configured phrase and uploaded audio/video followed by Super Owner review. The source does **not** implement a cryptographic proof bound to a server challenge, canonical account and device: the inspected backend has no device-key registration, attestation verification, public-key signature check, nonce/replay ledger or proof-to-request binding. The integration test includes an Owner-acceptance path that directly seeds a pending request and expects the 1,500-coin ledger credit; it does not establish hardware-backed proof.
- This conflicts with approved decision `REWARD-002` in `MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`: 1,500 coins and biometric privileges remain fail-closed until cryptographic server proof is challenge/account/device-bound and replay/forgery resistant. Therefore the 1,500 reward must **not** be activated merely because Super Owner accepts a request. Owner approval is necessary but not sufficient under the currently approved gate.
- Do not port the reward-granting workflow as-is. The full workflow remains an open P0 security/design gap: choose and approve platform-specific attestation/proof providers and lifecycle; bind server nonce, account UID and registered device key; verify signatures/attestation server-side; persist one-time proof consumption and revocation; then test forged, mismatched-account/device, expired, replayed, revoked and concurrent submissions. No provider or security guarantee is inferred here.
- Keep reward and privileges disabled until the approved cryptographic gate is met. This preserves the owner's explicit request for Owner review without violating the already-approved anti-forgery requirement.

### Inbox and member profiles
- `codex/mawdda-member-inbox-rebased`: 7 commits ahead / 1,340 behind. Its `conversations_screen.dart` is byte-identical to unified (blob `91e2e922380319a59942becc800251996099ca54`). Its direct-message deletion integration test is older/smaller (748 lines) than unified (848 lines); unified adds timestamp-tie pagination and deletion-revision reconciliation assertions. Its `functions/src/index.ts` is an older snapshot and is not safe to port.
- `codex/mawdda-deep-audit-profile-store`: 0 commits ahead / 1,363 behind, with no unique file delta. Existing unified premium-profile integration coverage is already included in exact-head CI. No duplicate profile/inbox files were copied.

### Economy
- `codex/mawdda-economy-selective-port-2026-11-19`: 10 commits ahead / 130 behind. The store-gifting helper, unit tests and Shop screen were already verified byte-identical to unified in the previous audit; the unified callable and integration suite are newer and broader. Its older `index.ts` is not a safe replacement. No duplicate economy code was ported.
- Exact-head Domain Regression and Validate runs both include successful store-gifting and wallet/entitlement integration steps.

### Ads and media
- `codex/featured-ads-secure-lifecycle-20261118`: 199 commits ahead / 307 behind. It contains large overlapping changes to `functions/src/index.ts`, `functions/src/media.ts`, scanner, media rules, ads, quota, and client screens; selective file-level review remains mandatory.
- Unified `featured-ad-finance.ts` and its unit tests are newer/larger than the corresponding source-branch files; do not replace them.
- The source branch's new call-entitlement helper relates to unresolved direct-call paid entitlement/lifecycle work (#66); do not activate or port it independently of owner-approved entitlement/pricing, per-party consent, metering and settlement.
- Its capacity-media policy leaves quotas null and enforcement observe-only, but remains a separate policy module requiring reconciliation with the approved capacity/cost model before adoption.
- Its sticker policy/catalog/widgets are new, but define additional sticker-specific limits and a new moderation/catalog lifecycle. They are not yet integrated into the unified scanner, entitlement, catalog and retention lifecycle. Do not port the feature bundle as a "small" media change; review the complete upload/scan/publish/send/delete path and confirm no conflict with canonical media limits first.

### Exact-head GitHub Actions evidence
For unified HEAD `d18b1c234a2b72413ba9814382c7ce7b996c6416`, the following runs were polled to completion:
- Validate Mawda: `44731027874`, `44731018627` — all jobs completed successfully, including Functions compile/unit tests, media callable and direct-message deletion integration, store gifting, specialized role capacity, biometric-cycle regression, premium-profile integration, Flutter tests and scanner tests.
- Mawdda Domain Regression: `44731027859`, `44731018700` — both jobs completed successfully, including specialized-role capacity/concurrency, store gifting, retention/room reservation and Flutter widget/unit tests.
- These are GitHub Actions results only. No 5,000-persona simulation, external/device/manual test, live-production test, deployment, financial operation or main merge was performed.

### Remaining blockers
- P0 / Issue #72: cryptographic biometric proof protocol and secure end-to-end workflow are not implemented; 1,500-coin reward and biometric privileges remain disabled. Issue #72 records the implementation and acceptance matrix.
- P0: #48 specialist permission enforcement remains unwired to protected operations.
- P0: #49 complete secure media lifecycle; #23 group-call lifecycle; #66 direct-call paid economy remain open.
- P1: #52 selective branch extraction remains active; the above audits classify duplicates and blocked bundles, not every divergent commit. Continue file-level provenance review for governance/ads/media and extract only self-contained, policy-aligned code with tests.
- P1: inbox/profile source branches reviewed above have no safe unique extraction at this baseline; continue with other specialized member/profile branches if new refs appear.


## 9. P0 lifecycle follow-up — biometric proof gate, role wiring, media and calls (2026-11-20)

### Biometric proof hardening branch / PR #73
- Branch `codex/mawdda-biometric-proof-gate-2026-11-20` is based on the unified line and is proposed through Draft PR #73.
- Initial PR commit SHA: `fb1a54fd66b568e0bf781ab2b6de174a9abf2267`; subsequent documentation/audit commits advanced the branch head. Base unified line was `7d386a77818e3a9ec59977f1cbcb67b8eac6ba9d`.
- Files changed are limited to the biometric eligibility helper, its profile/social-link call sites and tests, plus the proof-gate schema note.
- The eligibility helper now requires the expected account UID and a persisted server-proof record with an allowlisted platform provider, matching account UID, device key ID, one-time challenge ID, proof digest, server signature/attestation verification markers, consumed nonce and ordered server timestamps. Legacy verified flags and client OS prompt claims fail closed.
- This is **only an eligibility hardening gate**. It does not implement or cryptographically verify Google Play Integrity or Apple App Attest tokens, device-key enrollment, challenge issuance/consumption, proof-to-evidence binding, or the Owner review lifecycle. The fields are an internal trusted-verifier output contract; no client may write them. Firestore rules currently deny all client writes to `users/{uid}`.
- `completeBiometricVerificationCycle` remains fail-closed. No reward, badge or biometric privilege is enabled. Owner acceptance alone remains insufficient for the 1,500-coin reward.
- Draft PR #73 must pass exact-head CI and review before any merge to the unified branch. The complete proof lifecycle remains open under Issue #72.

### Specialized role authorization — Issue #48
- Re-read the current `functions/src/index.ts` on unified. It has 11,157 lines and 146 exported callable declarations at this audit point; the string `hasAdvertisingPermission` has zero occurrences in the file.
- Existing specialized grant CRUD/capacity callables remain Owner-only. Advertising intake and production application review callables remain Owner-only; public submission callables only create requests.
- The approved permission catalogue and role-bound grant evaluator exist, but the audited intake/production records do not provide canonical assignment ownership fields or server-derived resource scopes. The grant `resourceScopes` are still opaque strings. Replacing Owner gates now would create an ungrounded authorization bypass.
- No broad delegated guard was added. Before enabling any specialist operation, add server-owned assignment records and canonical scope derivation, then wire one callable at a time with callable Emulator allow/deny coverage. Keep contract signing, finance, grant administration, emergency controls and other sovereign operations Owner-only.

### Secure media lifecycle — Issue #49
- Unified media code already has upload-intent creation, quarantine/finalization, scanner verdict validation, safe-derivative contracts, delivery authorization, legal holds and retryable deletion/tombstones. This is not yet proof of a complete lifecycle.
- `codex/featured-ads-secure-lifecycle-20261118` remains highly divergent: 199 commits ahead / 309 behind. `codex/featured-ads-serving-foundation`: 139 ahead / 308 behind. Both modify collision-heavy `index.ts`, `media.ts`, scanner, tests, rules, package/workflow files and UI; no wholesale or speculative port is safe.
- New capacity-media policy is observe-only with null quota values and requires reconciliation with the owner-controlled capacity/cost model. New sticker catalog/policy/widgets add their own limits and moderation lifecycle and are not integrated into the canonical scanner/retention/entitlement path. No such bundle was ported.
- Remaining #49 acceptance: generation-pinned scanner verdicts and derivative provenance, signed URL expiry/revocation, non-member/wrong-purpose denial, legal-hold and deletion race, late derivative tombstone cleanup, and end-to-end Emulator proof that originals never reach clients.

### Group calls — Issue #23
- Unified `group-call-economy.ts` is a pure policy-driven calculation helper only. It has no server settlement callable or wallet/ledger integration.
- Current `startCall` selects room members automatically from the rented room (2–5), and each invitee accepts/rejects the call. It does not provide a separate member join-request queue with creator approval, nor a separate explicit financial consent per participant.
- The existing `call-signaling.integration.test.js` verifies room signaling and member departure, not the full requested admission/entitlement/consent/media-connected metering/atomic settlement lifecycle.
- The current room-call duration helper applies fixed 5-minute audio / 3-minute video constants. Do not silently change those durations or invent pricing/capacity rules; reconcile with approved room policy and Owner-controlled configuration before expanding.
- No billing, wallet hold, settlement or paid resource was activated. Issue #23 remains open until the full non-production Emulator lifecycle and media-topology acceptance tests pass.

### Direct-call paid economy — Issue #66
- Direct call exports currently implement signaling, rolling attempt quotas, active-call locks, connection deadline and call termination; no owner-versioned paid pricing/entitlement, per-party financial consent, trusted connected-media metering or atomic wallet settlement is wired.
- The Issue #66 record still contains unresolved Owner decisions for the asymmetric caller/receiver entitlement case, sub-minute rounding, reservation/hold timing and failed-media refund/release behavior. Do not infer these choices or use hardcoded fallback prices.
- No paid call or financial operation was performed or enabled.

### Current GitHub Actions evidence
- Unified base SHA `7d386a77818e3a9ec59977f1cbcb67b8eac6ba9d`: Validate run `44732927438` succeeded (Functions compile/unit tests, Flutter analysis/tests/web build and isolated scanner build/tests); Domain Regression run `44732927381` succeeded (retention/room reservation Emulator regression and Flutter widget/unit tests).
- These results are for the unified base SHA, **not** PR #73 head. Exact-head PR #73 Actions had not yet surfaced when this section was written; do not claim they passed.
- No 5,000-persona simulation, external/device/manual/live-production test, production mutation, billing or deployment was run.

### Active blockers / next sequence
1. #72: implement actual Android/iOS provider verification, device-key registration, server nonce lifecycle, replay prevention and proof-to-evidence binding; preserve Owner acceptance as a separate gate. Reward remains disabled.
2. #48: establish approved operation-to-permission-to-resource assignment matrix and server-owned assignment schema before delegated callable guards.
3. #49: finish scanner-generation-delivery-retention-deletion lifecycle and Emulator tests; continue file-level review of divergent media branches.
4. #23: implement join-request/creator-approval/entitlement/financial-consent/connected-media metering/atomic settlement and participant media topology.
5. #66: resolve the four listed Owner pricing/settlement decisions before paid billing implementation.
6. Do not merge PR #73 until exact-head GitHub Actions and review are complete. No main merge, deployment, production Firebase change, billing or simulation.


### Media Saver selective-port decision
- The `codex/featured-ads-serving-foundation` branch adds a server-side `getMediaSaverAttachmentUrl` capability that checks an entitlement on every save and reuses the safe-derivative delivery path. This matches the approved principle that every save needs a backend entitlement check and must not extend server retention.
- Its implementation hardcodes the entitlement document ID `media_saver_7d`. The binding constitution instead defines one Media Saver product with owner-configurable 24-hour / one-week / one-month durations and explicitly says the initial one-week / 200-coin value is test-only. The unified catalog currently has no Media Saver SKU.
- Therefore the feature is **not ported yet**: the backend consumer must be connected to the central owner-configurable catalog/entitlement schema and support all owner-enabled duration variants, not introduce a fixed one-week product ID or price. The underlying secure delivery logic is already present in unified; a separate callable can be added once the canonical product/entitlement identity is established.
- The source branch also adds entitlement-required direct-call tests, but the unified `startCall` implementation does not currently enforce the relevant call entitlements. Those tests cannot be copied alone; implement the approved call entitlement and asymmetry matrix first.


## Verification-cycle isolation implementation update — 2026-11-20

Owner-approved policy: email verification and biometric verification are independent tracks. Neither track gates, completes, renews, extends, expires, resets, approves, rejects, delays or reschedules the other.

Implemented in this candidate branch:
- Added UTC calendar-month arithmetic with month-end clamping.
- Email verification cycle duration is now three calendar months from the last successful email verification timestamp; the previous fixed 90-day approximation is removed from the cycle helper.
- Biometric one-calendar-month and email three-calendar-month due-date primitives are separately exposed and covered by focused unit tests.
- Email renewal eligibility now compares the persisted cycle expiry timestamp directly, rather than reconstructing the original timestamp by subtracting a fixed 90-day duration.
- Updated the email renewal unit/emulator fixture and GitHub Actions step labels to reflect calendar-month semantics.

Not yet implemented / blocking full acceptance:
- The existing biometric callable remains fail-closed and does not implement Super Owner manual submission/review/accept/reject.
- The existing biometric gate still requires device attestation proof and therefore conflicts with the newly approved manual-review policy. It must not be relaxed to a client-writable flag; replace it only with a server-authoritative Super Owner decision record and tests.
- No complete biometric request state machine, three-attempt/monthly retry enforcement, private evidence workflow, Super Owner-only media authorization, decision-triggered deletion lifecycle, or exactly-once 1,500 BetaCoins award is implemented by this change.
- No exact-head CI result is claimed here. The PR must pass Cloud Functions build/unit tests, email-renewal Emulator integration, biometric integration/security tests, Flutter analysis/tests, and the repository's required validation workflows before merge.
- This candidate is scoped to the unified integration branch. The development branch remains 78 commits behind the unified branch at the recorded comparison point; do not cherry-pick this isolated helper change onto its older code line independently of the approved branch reconciliation plan.
