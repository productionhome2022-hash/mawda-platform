# Mawdda Platform 2026 — Deep Governance, Constitution and Implementation Audit
**Audit date:** 2026-11-19  
**Audit branch:** `codex/mawdda-deep-governance-audit-2026-11-19`  
**Audited development line:** `codex/mawda-full-platform-implementation`  
**Scope:** documentation authority, owner decisions, contracts, role governance, implementation traceability, security rules, CI evidence, and the 5,000-persona lab boundary.

> **Status: OPEN — NOT A MERGE OR RELEASE APPROVAL.** This record captures verified findings and blockers. It does not silently resolve owner decisions, legal questions, or policy conflicts. No production Firebase mutation, deployment, billing activation, live-data change, or merge to `main` was performed.

## 1. Executive result

The development line contains a substantial and much more complete product/backend implementation than `main`, and now has a documentation set intended to unify the constitution, product vision, approved decisions, engineering charter, contract register, and implementation traceability. However, the project is **not ready for the integration/merge gate**.

The most important blockers are:

1. `main` still contains an unsafe legacy Firestore ruleset and a minimal, structurally obsolete application/configuration baseline. It must not receive a blind merge or deployment.
2. PR #32 and PR #33 are overlapping draft integrations of the same governance/biometric/role work, based on different development snapshots. They are not interchangeable, and neither is approved for merge.
3. The current unified constitution and traceability records specify important-chat text retention as 30 days, while an earlier owner-approved project requirement recorded for this project specifies 90 days. This conflict must be resolved before retention policy is called canonical or destructive deletion is enabled.
4. The retention worker is only partial; authoritative mode selection, participant consent/notice, server activity updates, complete temporary-chat deletion, media/derivative cleanup, and exact-head validation remain open.
5. The 5,000-persona lab has evidence of a failed full lifecycle run (851/5,000 completions); later harness/contention checks are not evidence of a successful 5,000/5,000 run.
6. Exact-head CI and real-device acceptance for PR #33 are explicitly unverified in its own PR description.

## 2. Repository and branch boundary

- Product repository: `productionhome2022-hash/mawda-platform` (default branch `main`).
- Simulation repository: `productionhome2022-hash/mawdda-5000-simulation-lab` (private, separate repository).
- The 5,000-persona harness must remain in the lab repository. The product repository may contain small deterministic fixtures/tests, but not absorb the full-scale harness.
- Development branch used as the integration source: `codex/mawda-full-platform-implementation`.
- Audit work is isolated on this branch and does not alter the development or production branch.

### Relevant governance PRs

| PR | Head branch | Base snapshot | Commits | State |
|---|---|---|---:|---|
| #32 | `codex/structural-governance-biometric-roles-2026-11-19` | `7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1` | 79 | Draft; not mergeable |
| #33 | `codex/governance-biometric-integration-2026-11-19` | `1a3d17ddde864a2649f7f0411b2f8b6552effd59` | 89 | Draft; not mergeable |

The two PRs touch the same core governance, biometric, rules, Functions, Flutter, and documentation files. PR #33 is based on a later base snapshot, but it explicitly says exact-head Flutter, Functions, emulator/rules, and real-device acceptance have not been verified. PR #32 reports partial workflow success on its own branch but says its full validation workflow was still running and its end-to-end/UI projection coverage remained incomplete. Do not merge both. Perform a three-way, file-by-file reconciliation against the current development head, then retain one canonical implementation branch/PR and close or supersede the duplicate only after preserving its unique changes.

## 3. Critical main-branch security and structure blocker

Files read directly from `main`:

- `firestore.rules` grants all reads/writes to any authenticated request whose token email equals the owner email, via a broad recursive match. It separately permits any authenticated user to read any `users/{userId}` document and permits self-write.
- `firebase.json` contains Hosting only; it does not wire the current Functions, Firestore rules/indexes, or Storage rules configuration.
- `storage.rules` was not present at the expected root path on `main`.
- `pubspec.yaml` is a small legacy Flutter dependency set without the current Firebase Messaging, Functions, media, WebRTC, and native platform dependencies.
- `README.md` is only a two-line legacy description and does not represent the current project or its safety boundary.

**Disposition:** `main` is not a safe merge/deploy target. The development branch's deny-by-default Firestore/Storage rules, environment separation, Functions wiring, tests, native scaffolding, and documentation must be reconciled as a complete reviewed baseline. Do not copy the old main rules forward or preserve their broad grants.

## 4. Documentation authority and record hygiene

The development line contains these central records:

- `docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md`
- `docs/MAWADDA_UNIFIED_PLATFORM_VISION_2026.md`
- `docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md`
- `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`
- `docs/MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md`
- `docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md`
- `docs/IMPLEMENTATION_TRACEABILITY.md`
- `docs/SEVEN_PHASE_EXECUTION_PLAN.md`
- `docs/DEVELOPMENT_AND_SIMULATION_BOUNDARY.md`
- `docs/RELEASE_READINESS_CHECKLIST.md`

The documents correctly state that a requirement appearing in a specification is not proof of implementation, and that GitHub draft contracts are not effective signed agreements. Preserve that distinction.

### Required documentation cleanup (without deleting source history)

1. Make the documentation master index identify one canonical current constitution, one canonical current vision, one canonical decision register, one canonical engineering charter, and one canonical traceability matrix.
2. Mark older/specialist documents as (a) still-authoritative specialist appendices, (b) historical source records, or (c) superseded. Do not delete source records merely to reduce duplication.
3. Ensure each decision has a stable ID, owner-approval source/date, current policy value, implementation status, affected code paths, test evidence on an exact SHA, and unresolved dependencies.
4. Reconcile all links and terminology in README, contracts, role glossary, privacy notice, phase plans, test runbooks, and release checklist.
5. Keep legal/contract templates separate by relationship and explicitly marked draft until jurisdictional review and proper signatures.

## 5. Owner decisions and policy conflicts

### 5.1 Important-chat retention — owner decision required

The current unified constitution and `RET-003` traceability row state:
- Temporary chat: delete all text and media after four hours of server-recorded inactivity.
- Normal chat: media four hours; text seven days.
- Important chat: media four hours; text **30 days**.

An earlier owner-approved Mawdda requirement recorded for the project specifies important-chat text retention of **90 days**. This is a material policy conflict, not a wording issue.

**Do not change live deletion behavior or treat either value as finally reconciled until the approved source decision is confirmed and the constitution, vision, decision register, traceability matrix, retention worker, and boundary tests all agree.**

Other retention items still open in the development traceability record:
- who chooses the mode and whether both participants must consent;
- immutable, server-authoritative mode assignment at conversation start;
- participant notices and server activity timestamp updates;
- full temporary-chat deletion of text, media, derivatives, references, and retry-safe cleanup;
- legal-hold and audit/financial evidence exclusions;
- exact-head emulator validation.

The traceability record states that the worker currently applies normal 7-day and important 30-day text boundaries, excludes temporary chats from individual-message deletion for a separate full-chat sweep, and fails closed on corrupt modes. It also states that the complete lifecycle is partial and no destructive lifecycle has been enabled.

### 5.2 Store and Media Saver duration terminology

The unified constitution and decision register use fixed 24-hour / 7-day / 30-day entitlement periods. The owner-facing requirement is 24 hours / one week / one month with a separately configurable price for each product and period. Standardize the display language while preserving exact duration semantics (one week = 7 days; one month = the explicitly defined 30-day commercial term unless the owner later approves a calendar-month rule).

Mawdda Media Saver remains a paid entitlement across direct chats, public rooms, and rented private rooms. The server must check entitlement on every save, and saving locally must not extend server retention. Do not mark it complete until the save window, media types, room scopes, expired/no-entitlement denial, and preservation of the original deletion deadline are covered end to end.

### 5.3 Economy and cost safety

The development records include a planning baseline of 1,000 monthly active members, a target of no more than USD 10/month in billable Google/Firebase charges after applicable no-cost usage, an estimated USD 7.50 operating target, and USD 2.50 contingency. The record correctly says this is not a provider-guaranteed hard cap and is not connected to live billing or usage enforcement.

This must not be represented as a guaranteed three-month free launch or a hard billing ceiling. Before launch, verify actual project SKUs/regions, storage and egress, media processing, usage metering, quotas, alerting, circuit breakers, and the owner's protect-mode controls. Preserve essential text chat and safety operations during protect mode.

### 5.4 Biometric verification change

The governance PR changes the verification workflow from a local-device biometric prompt to a member-submitted audio/video challenge manually reviewed by the Super Owner. The current draft defines one pending request per member, three total attempts, one calendar-month renewal, a three-calendar-month lockout after the third rejection, and 1,500 BetaCoins after acceptance.

The new server flow disables the legacy client-asserted local-prompt proof path, and the integration tests assert that client-only local-auth claims cannot earn a reward. This is a substantive product-policy change. Confirm that this manual evidence-review model is the final owner-approved meaning of “biometric verification” before it is promoted to the canonical product specification or user-facing promise.

## 6. Governance and role lifecycle

The current glossary defines:
- one Super Owner identity;
- open-ended Admin 1, Admin 2, … with permanent, never-reused sequence numbers;
- exactly five Admin Media seats;
- exactly five General Production Supervisor seats;
- open-ended Team Production Supervisors scoped to their assigned team/room.

Source review found:
- `platform-role-identities.ts` defines stable legacy-compatible role IDs and capacity helpers.
- It provides a pure helper for the next permanent Admin N ordinal, but a pure helper is not proof that the full persistent appointment/revocation/reinstatement lifecycle is implemented.
- The role-grant callable applies transactional seat-capacity checks for Admin Media and General Production Supervisor roles.
- The governance PR itself lists Admin N appointment/revocation/permanent numbering, delegated permission lifecycle, and end-to-end role badge/label projections as incomplete.
- Reuse policy for fixed seats after removal is explicitly unresolved; do not invent a reuse or renumbering policy.

Required closure: server-persisted sequence allocation under concurrency; appointment, suspension, revocation and reappointment; immutable audit history; permission templates and resource scopes; no privilege inheritance between role families; consistent localized display labels across profile, rooms, chat, Workspace, messages, notifications, email, and all clients; tests for every lifecycle transition.

## 7. Contracts and advertising governance

The contract register correctly separates membership, team production supervision, general production supervision, Admin Media, advertising commission collaboration, creator/influencer collaboration, direct advertiser contracts, contract-center assignments, signing delegation, and termination notices.

The commission template states:
- no global/default commission rate;
- the owner sets the rate per advertisement;
- the collaborator explicitly accepts the rate and calculation basis for that advertisement;
- a changed rate requires a separately versioned amendment and fresh acceptance;
- no publication or commission calculation if the rate is absent;
- settlement is based on funds actually received and owner-confirmed, subject to legal/accounting rules.

These controls must be reflected in the actual request, offer, acceptance, publication, payout, tax/refund, audit, and dispute lifecycle. A template or register entry is not a signed agreement. Obtain qualified legal review for company identity, governing law, jurisdiction, worker classification, tax/social obligations, privacy, e-signature, and dispute resolution before activation.

## 8. Implementation and test evidence

### Governance PR #33

The PR description explicitly lists these incomplete items:
- Admin N lifecycle and permanent numbering;
- Admin Media / General Production Supervisor seat lifecycle and Team Production Supervisor assignment lifecycle;
- full cross-product role label/badge audit;
- exact-head Flutter analyze/tests/build, Functions tests, emulator/rules tests;
- non-production Android/iOS microphone/camera capture, signed upload, playback and deletion acceptance.

Its current status is Draft and not mergeable. No final CI success is claimed.

### Earlier PR #32

PR #32 reports partial Flutter analysis/tests, Functions compile/unit tests, scanner tests, and domain-regression success on its branch. It also says the full validation workflow was still running and biometric E2E, rules, full role/UI projection, and real-device acceptance remained outstanding. Its base is older than PR #33's base. Those results cannot be carried over as proof for PR #33 or the current development head.

### Exact-SHA rule

A test result is evidence only for the exact commit and workflow that produced it. The development traceability file records an earlier successful validation on SHA `c759083e04ffd98616691c2e736207095aaf2dbc` (Flutter, Functions, scanner, and domain regression). This is valuable historical evidence but is not a pass for PR #33 head `619eab643e2d5849b3b2c055461d53ba2be01753`.

The GitHub combined-status query returned no status entries for the three inspected governance/base SHAs. Treat that as “no status evidence returned by this query,” not as a pass or a failure. The PR descriptions remain the authoritative current disclosure of incomplete validation.

### Source-level observations

- The development Firestore rules are deny-by-default except for narrowly scoped member reads and the active biometric request read.
- The Storage rule permits only creation of the authenticated member's server-issued active biometric evidence object, checks the configured MIME/size/expiry conditions, and denies reads, listing, updates and deletes to clients.
- Biometric MP4 duration validation reads the container's movie header and fails closed on unsupported/corrupt containers; the current challenge-video duration helper permits 3–5 seconds.
- Biometric approval and reward behavior has dedicated unit/integration test sources, including replay/idempotency assertions.
- Specialized-role tests include independent five-seat capacity and a concurrent fifth-seat contention case.
- `functions/src/index.ts` is over 10,000 lines. This is not itself a correctness defect, but it increases review, ownership, and regression risk; future work should keep domain modules separated and avoid further unrelated expansion of the central entrypoint.

## 9. 5,000-persona lab result

The development traceability record identifies:
- harness validation on lab PR #2 passed;
- lab PR #3 contention/runtime validation passed on its recorded commit;
- the latest recorded full 5,000-persona lifecycle run failed at RSVP contention with **851/5,000** completed lifecycles.

A harness syntax/validation pass is not a full load simulation. No 5,000/5,000 result is claimed. The lab remains separate and must run against a fixed, recorded product SHA with a reproducible report. The next successful full run must cover lifecycle completion, room joins, RSVP contention/retry, wallet/purchase paths where included, and report throughput, duration, errors, and resource/cost observations.

## 10. Integration gate — ordered work remaining

1. **Freeze the exact development head** and record the full SHA; verify all candidate PR bases/heads against it.
2. **Resolve owner policy conflicts**: important-chat 90d vs 30d; confirm manual audio/video biometric review semantics; confirm any remaining role seat reuse rules.
3. **Reconcile PR #32 and #33** into one reviewed governance change set; retain unique code/tests/docs; do not merge both.
4. **Update canonical documents and specialist appendices** from the approved decisions, then run link/terminology/duplicate/conflict checks across the entire docs tree.
5. **Complete role lifecycle** and cross-surface localization tests.
6. **Complete biometric lifecycle**: concurrency, attempt exhaustion, lockout boundaries, owner MFA/authorization, evidence expiry, upload validation, decision replay, ledger idempotency, notifications, retryable deletion, rules tests.
7. **Complete retention lifecycle** only after policy resolution: mode assignment/consent, activity updates, all-content deletion, derivative/storage cleanup, retries, legal holds.
8. **Run exact-head CI**: Flutter analyze/tests/build, Functions build/unit tests, every emulator/rules suite, scanner tests, and domain regressions. Record all run URLs and the exact SHA.
9. **Run the full 5,000-persona lab** against that same product SHA and publish the complete report.
10. **Review the main-branch replacement diff** as a clean migration from the unsafe legacy baseline; verify production deployment remains disabled.
11. Only after every blocker is closed: request owner review for the integration PR. Merge and production deployment remain separate, explicit approvals.

## 11. Current phase disposition

**Deep audit is in progress; integration gate is blocked.** This report is a durable checkpoint, not a claim that the entire audit, all code transfers, all tests, or the 5,000-persona simulation have finished. No production or main-branch changes were made. The next safe action is to resolve the explicit policy conflicts and consolidate the overlapping governance branches before attempting any merge.


## 12. Reconciliation update — current development head

The audit PR #34 was opened against the development branch at SHA `8a1c8d0b93ed43570c523ab2d8c2598648ddac0e`. Comparing both governance drafts against that exact observed base shows:

- PR #32 head `e71f3eb559e7f86edecd97fb366ad9c69b5817c5`: **diverged**, 79 commits ahead and 92 behind; 35 changed files on its original base comparison.
- PR #33 head `619eab643e2d5849b3b2c055461d53ba2be01753`: **diverged**, 89 commits ahead and 89 behind; 39 changed files on its original base comparison.
- Audit PR #34 head `922eccc97006209331d97b92789e55a4446b551e`: one documentation commit ahead of the development base, with one file changed.

This confirms that PR #32 and #33 must be rebased/reconstructed from the current development line before their code or test evidence can be considered for integration. Do not merge either stale draft directly. The comparison is a graph-level divergence check, not a semantic proof that every unique change is present or absent; preserve and reconcile unique commits/file changes individually.

The combined-status query for the observed development base SHA returned no status entries. No CI pass is inferred from an empty status response. PR #34 is a documentation-only Draft and is not merged.


## 13. Owner resolution and follow-up evidence — 19 November 2026

The owner has now explicitly confirmed that important-chat text retention is **30 days (720 hours)** and rejected the 90-day alternative. This supersedes the unresolved 30-vs-90-day conflict described in §5.1. The canonical constitution and RET-003 already specified 30 days; the decision register now records this explicit confirmation as RET-005, and the unified vision and implementation traceability have been aligned. Important-chat media remains four hours. This does **not** resolve the separate RET-004 questions about who selects a mode/participant consent, server activity writes, or complete temporary-chat deletion.

A review of the exact development-head workflow run `44467678163` on SHA `8a1c8d0b93ed43570c523ab2d8c2598648ddac0e` found:
- Flutter UI analysis and widget tests: passed.
- Backend compile/unit tests: passed.
- Mode-aware chat-retention integration suite: passed (4/4).
- Room-event reservation integration suite: passed (1/1).
- Owner entitlement grant integration suite: failed (2/3). The failing case calls a member purchase after granting the entitlement, but its fixture explicitly seeds `purchaseEnabled: false`; the purchase callable correctly rejects that disabled catalog item. The fixture is internally contradictory, not evidence that the purchase guard should be weakened.

A focused isolated-branch correction now sets the test fixture to a valid published/purchasable item (`version: 1`, `purchaseEnabled: true`, `fulfillmentReady: true`) while preserving the production guard. This correction has been committed on `codex/mawdda-retention-approval-ci-repair-2026-11-19`; its CI result must be checked before treating the failure as closed.

**Updated disposition:** the retention-period decision conflict is resolved. The integration gate remains blocked by outstanding retention lifecycle requirements, role/biometric work, CI repair and exact-head validation, stale governance PR reconciliation, the 5,000-persona full run, and the unsafe legacy `main` baseline. No production deployment, billing activation, destructive retention action, or merge to `main` was performed.

## 14. Governance-branch exact-head CI and file-level reconciliation

The previous statement that PR #33's exact-head CI was unverified is now superseded by retrieved GitHub Actions evidence:

- PR #33 head `619eab643e2d5849b3b2c055461d53ba2be01753`:
  - Validate Mawda run `44466032043`: **success** — Flutter analysis/tests/web build, isolated ClamAV scanner gateway tests/image build, and Cloud Functions compile/unit tests all succeeded.
  - Domain regression run `44466032143`: **success** — retention/room-reservation emulator regression and Flutter UI/widget tests both succeeded.
  - This is strong exact-head automated CI evidence for that PR head, but it does not provide physical Android/iOS capture/device acceptance, live non-production upload/playback/deletion acceptance, or resolve graph divergence from the current development head.
- PR #32 head `e71f3eb559e7f86edecd97fb366ad9c69b5817c5`:
  - Domain regression run `44420075581`: **success**.
  - Validate Mawda run `44420075589`: **failure**. Its Storage rules suite failed the positive member upload case because the Storage rule evaluated a null Firestore setting (`storage.rules` line 11); 10/11 Storage tests passed. PR #33's later Storage rules version passed its exact-head CI, but it still must be reconciled to current development source rather than merged wholesale.

A tree/blob comparison against the current development head confirms that neither governance PR is a simple fast-forward:
- 34 of 35 PR #32 changed paths overlap PR #33; PR #32 alone has `functions/test/platform-terminology-docs.test.js`.
- PR #33 has five paths not present in PR #32: `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md`, `docs/IMPLEMENTATION_TRACEABILITY.md`, `lib/models/app_models.dart`, `lib/screens/biometric_verification_screen.dart`, and `lib/screens/owner_biometric_review_screen.dart`.
- Both PRs contain materially different versions of the same shared files, including Firestore/Storage rules, Functions entrypoint, role grants, biometric verification, documentation and UI projections.
- Relative to the current development tree, the PR branches introduce files absent from development, including biometric media/review modules, platform role identity helpers, specialized-role capacity tests and (in PR #33) member/owner biometric screens. Existing shared files also differ by blob SHA.

**Reconciliation recommendation:** use PR #33 as the stronger tested reference snapshot, preserve PR #32's unique terminology-doc test, and reconstruct one fresh governance change set from the current development head. This is a prioritization recommendation, not a claim that PR #33 is a semantic superset or safe to merge. Review every shared-file diff, preserve unrelated newer development work, rerun exact-head CI, and retain the physical-device acceptance gate.

For the focused retention/entitlement repair PR #35, the domain-regression run `44474795068` on head `4cf8c090bd4aef72ff0e87891b645f914d02c46b` completed successfully. Its backend compile/unit tests, chat-retention integration, room-event integration, owner-entitlement grant integration, call-signaling integration, and timed-ad reward integration steps all passed; Flutter UI/widget tests also passed. The broader Validate Mawda run `44474795061` on the same head was still in progress at the time of this update, so no full-validation pass is claimed.
## 15. Latest verified 5,000-persona lab result

Rechecking the simulation repository's actual Actions history confirms that the latest full simulation run remains a failure, even though the latest harness-validation workflow passed:
- Full simulation run `43773980276`, source SHA `3a61799757c493c5884da41e33f71bb3f5398d96`: **failed** after 28m38s. Its machine-readable snapshot reported `completedRows: 851` out of 5,000, with 5,000 members completing the earlier purchase/profile/discovery/push/room-join stages, 875 event listings, and 851 RSVP confirmations. The failing error was `10 ABORTED: Transaction lock timeout` during the connected member/premium-profile/discovery/room/event lifecycle test.
- The latest harness-validation run `43783308441` on SHA `f148e25f5bd6579c3f5f301db3b0b0f588817557` passed, but it validates harness syntax/safety rather than completing all 5,000 lifecycles.
- A separate earlier full simulation run `43691324361` also failed. No full 5,000/5,000 successful run has been found in the current Actions history.

**Disposition:** the lab is not accepted. The 851/5,000 result is the verified latest full-run snapshot, not a completed workload. Retry/lock-contention changes must be tested in a new full run pinned to the exact current platform SHA, with a complete machine-readable report and no false success threshold that counts partial lifecycle stages as completed personas.
## 16. Follow-up validation diagnosis and repair branches

On PR #35's earlier candidate head `4cf8c090bd4aef72ff0e87891b645f914d02c46b`, the broader Validate Mawda workflow completed with failure after Flutter analysis/tests, web release builds, scanner tests/image build, backend compilation/unit tests, chat retention and several other integration suites passed. The failure log identified three concrete issues:
- Wallet/store purchase integration fixture omitted the catalog `itemId` and `version`, so the otherwise enabled/fulfillment-ready test SKU failed the server's purchasability guard. The fixture now includes both fields; the guard is unchanged.
- Manual custom-coin request integration fixture omitted owner-configured `customCoinRequestBounds`, so the server correctly rejected the request. The fixture now supplies explicit bounded values.
- Featured-ad finance integration expected an immutable timed-ad campaign version document, but `setTimedAdCampaign` only wrote the mutable campaign document. The server now creates an append-only version snapshot in the same Firestore transaction as the campaign write.

These changes are isolated on PR #35, head `032a66b35b8d31caaa92c50ad7b7dc18317da7b9`. Its domain regression run `44475451605` passed. The latest full Validate Mawda run `44475449966` for this exact head was queued/pending at the time of this update; the fixes are not accepted until that exact run completes successfully.

In the separate lab repository, PR #4 now carries forward the complete PR #3 harness/runtime changes and adds a bounded retry only for transient RSVP transaction-abort/lock-timeout errors. It records retry counts and runs the full emulator-only simulation against the pinned platform candidate SHA `4cf8c090bd4aef72ff0e87891b645f914d02c46b`. Exact-head run `44475336848` is in progress. No 5,000/5,000 success is claimed yet.
## 17. Critical store-catalog version defect discovered by the 5,000-persona lab

The retry-enabled lab run `44475336848` on lab head `cac676be569ce1fb9ed723d0085abfa2304df379` and platform SHA `4cf8c090bd4aef72ff0e87891b645f914d02c46b` failed early in the lifecycle, before the RSVP stage. It completed 5,000 synthetic wallet transfers and 5,000 direct-message exchanges with full persona coverage for those stages (zero transfer/message errors), then failed at the first store purchase with `failed-precondition`: the store item was not purchasable. Therefore the RSVP retry code was not exercised by this run.

Root cause found in the primary platform source: `setStoreCatalogItem` wrote the catalog fields but omitted the required server-managed `version`, while `isStoreItemPurchasable` correctly requires a positive integer version. Thus an owner-published catalog entry could not pass the purchase guard even when purchaseEnabled and fulfillmentReady were true. This is a real implementation defect, not merely a test-fixture issue.

Fix committed on PR #35: the owner catalog callable now increments a monotonic server-owned version within the same Firestore transaction, includes that version in its audit event, and returns it. The wallet/store integration test now exercises the actual owner callable, verifies version 1 then version 2 on update, and performs a purchase using the published catalog record. This also gives the 5,000-persona lab a valid owner-published SKU without weakening the server guard.

Latest platform candidate head: `63916ade25d9c6d5db640204637053042415fa06`. Its domain regression run `44476138547` is in progress; full Validate Mawda run `44476138506` is queued/pending. Latest full 5,000-persona run `44476167496` is in progress against this corrected platform SHA with the bounded RSVP retry enabled. No result is claimed until both workflows complete.
## 18. Role-capacity transfer and dependency-safe PR stacking

A focused role-capacity port was created from the tested governance reference. It adds the platform role identity/label helper, transactional five-seat guards for Admin Media and General Production Supervisor, and unit/emulator tests for capacity and concurrent assignment.

The first attempt, PR #36, was based directly on the development head and its domain regression exposed the known owner-entitlement test fixture issue in that older base. Rather than weaken tests or duplicate unrelated fixes, PR #36 was closed as superseded. Its complete role code and tests were carried forward into PR #37, stacked on top of PR #35's retention/store-catalog repair branch. PR #37 head is `51e207c39900bb21a9e4882147b9469114f28112`; exact-head domain and full validation workflows `44476343031` and `44476343070` are in progress.

PR #37 intentionally leaves persistent Admin N appointment/revocation/permanent-number allocation and fixed-seat numbering reuse policy unresolved; it does not claim those lifecycles complete. The manual biometric-review workflow remains unported pending owner confirmation of its product semantics.

PR #35's latest candidate head is `63916ade25d9c6d5db640204637053042415fa06`. The domain regression run `44476138547` is in progress and full validation run `44476138506` is queued/pending.

The lab PR #4 carries the room-join and RSVP retry changes. Its earlier full run failed before RSVP due to the store-catalog version defect. The corrected full simulation run `44476167496` is now in progress against platform SHA `63916ade25d9c6d5db640204637053042415fa06`. PR #3 was closed as superseded by PR #4; its changes are preserved.
## 19. Role-capacity test harness correction

PR #37's first emulator integration attempt was not a role-capacity product failure. The workflow initially invoked the Node test without starting Firestore Emulator, so the test correctly failed its emulator-required guard. After wrapping it with `firebase emulators:exec`, the runner then reported `firebase: command not found` because the CLI is installed as a local dependency under npm. The workflow was corrected to invoke `npx firebase emulators:exec`, which resolves the locked local Firebase CLI.

Latest exact-head domain run `44476873545` on PR #37 head `5110cb59f9d9a6edae4bbc7bc8418043f0a1eb51` is now running. The latest full validation run `44476873277` is queued. No role-capacity test pass is claimed until the corrected emulator step itself completes successfully.
## 20. Latest CI checkpoint — 19 November 2026

- PR #35 candidate head `9d0cadc4b460b0b540a56503846977593f7994b7`: domain regression run `44476789499` **passed**. The latest full Validate Mawda run `44476789455` is in progress. Backend compile/unit tests, retention, direct-message deletion, owner-entitlement grants, wallet/store purchase, room rental, room events and call signaling all passed; featured-ad finance integration is still failing. The backup/restore and remaining rules suites were still running when checked. Flutter analysis/tests/build were also running. The remaining featured-ad failure must be diagnosed from the completed job log before this PR can be accepted.
- PR #38 is the refreshed role-capacity integration based on PR #35's latest head. Its exact-head workflows are now running/queued after correcting the emulator command to use `npx firebase emulators:exec`; no role-capacity pass is claimed yet.
- Lab PR #4 full simulation `44476167496` is still in progress against platform SHA `63916ade25d9c6d5db640204637053042415fa06`, with the bounded RSVP retry and store catalog version fix. The 5,000/5,000 acceptance result is not yet available.
- No PR has been merged to `main`; production deployment and live Firebase changes remain blocked.