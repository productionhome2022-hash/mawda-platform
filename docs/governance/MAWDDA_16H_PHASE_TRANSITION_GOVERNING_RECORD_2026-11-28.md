# Mawdda — 16-Hour Consolidated Governance, Evidence & Phase-Transition Record

- Record ID: `MAWDDA-16H-GOVERNANCE-20261128`
- Review window: **2026-11-27T15:22:06Z to 2026-11-28T07:22:06Z** (exactly 16 hours)
- Canonical development branch: `codex/mawda-full-platform-implementation`
- Main repository: `productionhome2022-hash/mawda-platform`
- Simulation repository: `productionhome2022-hash/mawdda-5000-simulation-lab`
- Reviewed main head: `a3d7756a2fb59255e217f0530ef204bf05c1e27f`
- Reviewed lab head: `6cb1b6cb08efe756b346073df711325a5176d95b`
- Status: **Documentation and CI reconciliation completed; retention bilateral-consent decision closed; independent security audit started and remains in progress.**
- This exact document is mirrored in both repositories. The main repository remains the product source of truth; the lab remains a validation harness, not a second platform implementation.

## 1. Authority and precedence

This record consolidates work, decisions, corrections, CI outcomes and phase boundaries for the exact window above. It supplements rather than deletes the original audit bundles, reports, commits or project constitution.

The explicit owner clarification dated 2026-11-28 supersedes older wording in RET-004 that left bilateral consent unresolved. RET-004 remains historical evidence only; it must not be copied into current gap lists as an open bilateral-consent decision.

This record does not authorize merge to `main`, deployment, production Firebase mutation, billing/Blaze activation, paid infrastructure, production data deletion or activation/change of live retention schedules.

## 2. Complete commit chronology within the 16-hour window

### 2.1 Main platform — 19 commits

| UTC | Commit SHA | Commit message |
|---|---|---|
| 2026-11-27 16:29:41 | `df7a7601aebe6954de2d8f59f9c7352b62acd7af` | docs(test): 5000-persona integration report (0339dba67b52) |
| 2026-11-27 16:44:32 | `fefd4cd6264f447ab1affa45a46b617f2ef9077b` | docs(test): save CI run 46035610148 report |
| 2026-11-27 19:53:59 | `0f7b402fb0c5d5ec37e991577d1cac388fb59f38` | docs(report): add detailed report for run 46055971553 |
| 2026-11-27 20:28:12 | `6b9088ab9af0a8ade8bc435a87029614ffb42014` | docs(audit): add complete repair and simulation engine history (mawda_audit_20261127T202803Z) |
| 2026-11-27 20:36:50 | `2b0e7e6bd8af42fd4484eabf9daad70999fc5e2f` | docs(audit): full 2-hour repair and simulation engine history (mawda_full_audit_2h_20261127T203641Z) |
| 2026-11-27 20:39:50 | `37338bb73309709520a2637f130a750a92822bb5` | docs(audit): full 3-hour repair and simulation engine history (mawda_full_audit_3h_20261127T203941Z) |
| 2026-11-27 20:47:21 | `73530a4c76e6003f08a7a8caabbb27ec00c83d08` | docs(audit): freeze historical audit bundle and record acceptance scope |
| 2026-11-27 21:26:09 | `30b55af5a1da7add503e3390321c09cc7d389a09` | docs(verify): deposit platform and 5000-persona verification reports (verify_suite_20261127T212550Z) |
| 2026-11-27 21:28:50 | `adc2f1a347c60d6ed201763e92f5f6f95a37f4a6` | Merge branch 'codex/mawda-full-platform-implementation' of https://github.com/productionhome2022-hash/mawda-platform into codex/mawda-full-platform-implementation |
| 2026-11-27 21:35:39 | `842185c734c1a9161b69fe38aa941e460efd3759` | docs(verify): full verification report bundle full_exec_20261127T213518Z |
| 2026-11-27 21:41:19 | `4970c7dd9c0a59da86e73cf9d4d6502c58ce5575` | docs(verify): deposit mandate verification bundle mandate_verify_20261127T214059Z |
| 2026-11-27 21:46:24 | `185328f4fdf8435244e9ec20dea8fe7b9da41198` | docs(verify): deposit practical execution report practical_exec_20261127T214527Z |
| 2026-11-27 21:54:27 | `2b3c4fdd582f7906b8c5369e9e4ae3b9d9f48ab5` | docs(load-5000): record 5000-persona load check load_5000_20261127T215414Z |
| 2026-11-27 21:57:41 | `1943cce7ff9fac4e13b25a3c962bc7c4997415d1` | docs(load-5000): record emulator --cwd check load_5000_cwd_20261127T215730Z |
| 2026-11-27 22:02:15 | `ad2d89eae89c98477ef83806c7590567e29fec85` | docs(load-5000): record direct emulator check load_5000_direct_20261127T215947Z |
| 2026-11-27 22:10:08 | `bf72e9302d39344f26f8fa2d6f063bbc51356929` | docs(load-5000): record emulator jar diagnostic load_5000_emu_diag_20261127T22:04:58Z |
| 2026-11-28 06:37:06 | `ec0d1be47bc639f1d78c8d53412c05028dd1c509` | docs(sim-5000): deposit 5000-persona platform report verify_5000_20261128T063646Z |
| 2026-11-28 06:54:45 | `a3d7756a2fb59255e217f0530ef204bf05c1e27f` | docs(audit): reconcile historical repair registry and CI evidence |
| 2026-11-28 06:54:47 | `296a3fa576b246e35d5940cbd3d4d5d874b569fe` | docs(audit): add normalized repair workstream registry |

### 2.2 Simulation lab — 31 commits

| UTC | Commit SHA | Commit message |
|---|---|---|
| 2026-11-27 16:29:36 | `5941a491adc5b6de94979685bb7a62d19e9fa415` | test(int): 5000-persona evidence run (0339dba67b52) |
| 2026-11-27 16:39:50 | `f3a26e294e1d13ac81e3249cbfd3250bee459d55` | ci(test): add isolated emulator & flutter workflow |
| 2026-11-27 16:44:27 | `071340bd2c1b4d0c0df6da2616d7a42424996d5c` | test(ci): save CI run 46035610148 report |
| 2026-11-27 16:54:55 | `f6ac740cd1f68d944f813ed4c298ac76f16f399a` | ci(test): fix Java 21, enforce strict failures, pin SHA, run real emulator & persona suites |
| 2026-11-27 16:58:59 | `a413bb1b883928b9b60bd56d5ad9df4f9633972d` | ci(test): pass MAWDA_PLATFORM_ROOT and run persona suite inside emulator |
| 2026-11-27 17:02:50 | `9ff0ec26ea1fbc9a86ba3d38d5e93c7ecbc6cf6e` | ci(test): add NODE_PATH for firebase-admin and run persona suite under emulators |
| 2026-11-27 17:06:57 | `52baeb0cb76a64e34341d5d1de27a15fd06b421e` | ci(test): run persona suite from lab cwd with isolated 5000-persona fixture under emulators |
| 2026-11-27 17:13:17 | `6fdf995d85bdbe8eaaf7422d64d0809e8344ab0c` | ci(test): match exact persona schema fields in 5000-persona emulator fixture |
| 2026-11-27 17:40:35 | `973ebcd022ff96c104cbce54ccb2709d1c831250` | ci(test): include environment firebase-emulator-only in 5000-persona fixture |
| 2026-11-27 17:43:46 | `93dbc2bdb3086156138df741887f404c0f6fd34a` | ci(test): fix mawda-platform repository slug in checkout step |
| 2026-11-27 17:56:35 | `7bfb849582b010c615a16b64be8abb98f596d769` | ci(test): add testOnly true and @test.mawdda.invalid email to 5000 personas |
| 2026-11-27 18:19:07 | `779b831d2a9cdcf4a47efc4b1cf25db2e8e0fd96` | test(load): pass expectedVersion 0 in setStoreCatalogItem lifecycle setup |
| 2026-11-27 18:31:39 | `703090b9ceed2338ba40578bbc60c8500169a049` | ci(test): increase emulator exec timeout from 300s to 600s for 5000-persona lifecycle |
| 2026-11-27 18:57:22 | `d256671abe6275ca0c4dda3bf8e791597c261328` | ci(test): increase emulator exec timeout to 900s (15 minutes) |
| 2026-11-27 19:20:09 | `896dd5ba40796b3ded04eac9c5d83de5938d6707` | test(load): increase batch sizes across persona-load test and set 1500s timeout |
| 2026-11-27 19:53:53 | `99d8b9a55f9baed93bdd87f8a908525fc1f4d844` | docs(report): add detailed report for run 46055971553 |
| 2026-11-27 20:28:22 | `44e62f0a3498ec32344baed812b4ff9e96a82cd1` | docs(audit): add complete repair and simulation engine history (mawda_audit_20261127T202803Z) |
| 2026-11-27 20:36:55 | `dbc86d3daeaa6fa304a120c7694d2d76b3638453` | docs(audit): full 2-hour repair and simulation engine history (mawda_full_audit_2h_20261127T203641Z) |
| 2026-11-27 20:39:54 | `a40a82e0e696ab4c53b32dcf1e28391921cb8bf4` | docs(audit): full 3-hour repair and simulation engine history (mawda_full_audit_3h_20261127T203941Z) |
| 2026-11-27 20:47:23 | `fee3325f4bdaf6f2b76c327739af596574b2bed2` | docs(audit): freeze historical audit bundle and record acceptance scope |
| 2026-11-27 21:26:13 | `848734d61773044c18392fd9653336eb4b12333e` | docs(verify): deposit 5000-persona simulation lab verification reports (verify_suite_20261127T212550Z) |
| 2026-11-27 21:35:44 | `47c88dcd88e50fd30057577b0da7c83a43b75787` | docs(verify): full verification report bundle full_exec_20261127T213518Z |
| 2026-11-27 21:41:23 | `41cb66c5504a7f34b6aa01bb7edbcaa44539a758` | docs(verify): deposit mandate verification bundle mandate_verify_20261127T214059Z |
| 2026-11-27 21:46:28 | `a7438fc9dde0d26b67146903150b099bbe9717a6` | docs(verify): deposit practical execution report practical_exec_20261127T214527Z |
| 2026-11-27 21:54:24 | `f342eb6554dcf4bdf65fd0f5d652a9411e25e474` | docs(load-5000): record 5000-persona load check load_5000_20261127T215414Z |
| 2026-11-27 21:57:37 | `4b51b31c7090bc783c2d366516f2969999b88baf` | docs(load-5000): record emulator --cwd check load_5000_cwd_20261127T215730Z |
| 2026-11-27 22:02:10 | `1d9b069e696577050e9b337996760567285ff6ea` | docs(load-5000): record direct emulator check load_5000_direct_20261127T215947Z |
| 2026-11-27 22:10:03 | `1056841fb26f8af76fbdcda5777dc1a1099f2ef5` | docs(load-5000): record emulator jar diagnostic load_5000_emu_diag_20261127T22:04:58Z |
| 2026-11-28 06:36:59 | `c17ade2a1dfe6686fda3ae83eb870cd5883131bf` | docs(sim-5000): deposit 5000-persona lab report verify_5000_20261128T063646Z |
| 2026-11-28 06:54:41 | `19d4236ce5952505403faa88a17c71a1c8e215a6` | docs(audit): reconcile historical repair registry and CI evidence |
| 2026-11-28 06:54:43 | `6cb1b6cb08efe756b346073df711325a5176d95b` | docs(audit): add normalized repair workstream registry |

### 2.3 Workstream sequence

1. Establish and correct the emulator-only 5,000-persona harness: exact checkout, Java 21, pinned platform SHA, isolated test personas, environment variables, dependency resolution and test-only identities.
2. Correct the store-catalog lifecycle fixture by supplying `expectedVersion: 0`.
3. Address emulator process termination/timeouts through timeout and batch-size tuning; the consolidated lifecycle timeout reached 1,500 seconds.
4. Execute load tiers of 500, 1,000, 2,500 and 5,000 personas and deposit detailed run reports.
5. Deposit repair history, comprehensive verification, mandate verification, practical execution and Termux diagnostic records.
6. Freeze the historical audit bundle and document its acceptance/non-reopening boundary.
7. Deposit the 2026-11-28 lifecycle report into both repositories.
8. Normalize the historical repair register and prepare this consolidated governance record.

The four Termux diagnostic reports (initial load, `--cwd`, direct emulator check and emulator-JAR diagnostic) remain environment diagnostics. They do not override successful GitHub emulator evidence.

## 3. Binding owner clarification — retention, deletion and recipient saving

### 3.1 Decision

**CLOSED as an owner-policy/consent question. No bilateral conversation-participant consent is required to apply the platform retention policy or to exercise the sender's authorized deletion option.** Do not create a second-participant approval gate, veto or consent workflow.

This clarification supersedes the bilateral-consent portion of RET-004 and the stale retention item in the earlier repair reconciliation addendum.

### 3.2 Recipient save authority

- The recipient may save eligible received media locally when they choose, subject to entitlement, authenticated server-side authorization, source access and media-security checks.
- The sender cannot veto or require separate approval for the recipient's local save.
- Mawdda Media Saver remains the unified entitlement-controlled save service; the server revalidates entitlement on every save request.
- Local saving does not extend or reset the server-side retention deadline.
- A copy already saved locally by the recipient is outside the sender's later server-side deletion control.

### 3.3 Sender deletion controls

- **Delete for me:** hides the sender's message/media only for the requesting sender; it does not remove the other participant's copy.
- **Delete for everyone:** the authenticated original sender may request server-side removal/revocation of their own sent message/media for both participants, subject to authorization, audit, legal holds and safe deletion.
- A recipient cannot use the sender's delete-for-everyone control to delete another member's message.
- Server-side deletion must not be represented as erasing a recipient's previously saved local copy or another independent copy outside Mawdda's control.
- The two controls must remain distinct in UI, backend, authorization and tests.

### 3.4 Existing retention durations — unchanged

| Conversation mode | Server-side retention |
|---|---|
| Temporary private conversation | Full conversation deletion after 4 hours from last server-recorded activity |
| Normal | Media 4 hours; text 7 days |
| Important | Media 4 hours; text 30 days |

Both participants receive notice of the applicable policy. Retention mode is a platform policy state, not a bilateral-consent negotiation. This clarification does not invent a new mode selector or assign a new selector actor.

### 3.5 Implementation boundary

The owner-policy gap concerning bilateral consent is closed. Technical verification remains: sender-only authorization, idempotency, race handling, legal-hold enforcement, exact Storage generations, derivatives, tombstones, retries, audit, and correct treatment of previously saved local copies.

No live production deletion worker or schedule may be enabled or changed by this record. No production Firebase mutation or data deletion is authorized.

## 4. GitHub Actions inventory — exact 16-hour window

All runs in the queried pages were completed; zero runs remained queued, waiting or in progress at the review cutoff.

| Repository | Total | Success | Cancelled | Failure | Active |
|---|---:|---:|---:|---:|---:|
| Main platform | 62 | 50 | 12 | 0 | 0 |
| Simulation lab | 104 | 70 | 23 | 11 | 0 |
| **Combined** | **166** | **120** | **35** | **11** | **0** |

Cancelled runs remain classified as cancellations, not failures or successes.

### 4.1 Historical lab failures — 11 classified

| Run ID | Root cause evidenced in job log | Later correction/evidence |
|---|---|---|
| `46053231523` | Emulator SIGTERM; exit 124 | Timeout/batch tuning; later lifecycle success |
| `46050254882` | Emulator SIGTERM; exit 124 | Timeout/batch tuning; later lifecycle success |
| `46048630996` | Emulator SIGTERM; exit 124 | Timeout/batch tuning; later lifecycle success |
| `46045795625` | Invalid expected catalog version in test fixture | Fixture correction commit `779b831d2a9c` |
| `46044357793` | Invalid expected catalog version in test fixture | Fixture correction commit `779b831d2a9c` |
| `46043790479` | Wrong platform repository slug in checkout | Checkout correction commit `93dbc2bdb308` |
| `46040214857` | Invalid expected catalog version in test fixture | Fixture correction commit `779b831d2a9c` |
| `46039341361` | Empty/invalid Firestore document path in fixture | Persona schema and emulator setup corrections |
| `46038757101` | Missing `lab/artifacts/personas.json` | Isolated fixture generation and corrected runner path |
| `46038202356` | `firebase-admin/firestore` module not resolved | Dependency path / `NODE_PATH` correction |
| `46037685064` | Missing `MAWDA_PLATFORM_ROOT` | Explicit platform root and exact checkout wiring |

These failures belong to earlier commits. Their fixes are not to be reopened merely because the historical red runs remain in GitHub history.

### 4.2 Cancelled-run inventory

Main platform — 12 cancelled:
`46118788896`, `46118788905`, `46118788928`, `46073619994`, `46073291142`, `46071916028`, `46071326090`, `46070757866`, `46065162633`, `46064836502`, `46064836490`, `46063857123`.

Simulation lab — 23 cancelled:
`46118771723`, `46118771742`, `46074099702`, `46073613700`, `46073284839`, `46072458310`, `46071921923`, `46071332042`, `46065170573`, `46064846371`, `46048561012`, `46044107707`, `46043705643`, `46043705625`, `46039228629`, `46039228364`, `46038652219`, `46038652105`, `46038110449`, `46038110330`, `46037577947`, `46037578203`, `46035509065`.

### 4.3 Latest successful post-documentation evidence

Main platform:
- [Validate Mawda — 46118810293](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810293): all five jobs succeeded, including Cloud Functions compile/unit tests, server-evidence and authorization integration, Flutter analysis/tests/Web builds, comprehensive backend emulator integration, Firestore/Storage rules tests, retention and direct-message deletion tests, legal-hold tests, backup/restore and media scanner validation.
- [Mawdda Test Center — 46118810329](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810329): backend/Firebase emulator journeys and Flutter analysis/tests/Web release artifact succeeded.
- [Economic phase verification — 46118810286](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810286): Functions build/unit tests and call-signaling emulator tests succeeded.
- [CodeQL — 46118810962](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810962): both analysis jobs succeeded.

Simulation lab:
- [Mawdda Test Center — 46118773564](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46118773564): backend emulator and Flutter/Web jobs succeeded.
- [Economic phase verification — 46118773554](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46118773554): Functions build/unit tests and call-signaling emulator tests succeeded.
- [5,000-persona lifecycle — 46115183044](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115183044): successful.
- [Domain regression — 46115185748](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115185748): successful.
- [Offline media scanner validation — 46115190369](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115190369): successful.

The latest full integration job reported 476 Cloud Functions tests passing with zero failures. The scanner validation reported 10 source/security tests and 21 sanitization/EICAR tests passing with zero failures. Web artifact creation is not deployment; CodeQL success is not a platform-wide security certification.

## 5. Repair registry reconciliation

The original `REPAIR_REGISTRY.csv` in the 2026-11-27 3-hour archive is valid quoted CSV with 11 columns and 13 logical records (`REC-001`–`REC-013`). Quoted fields contain embedded newlines; naive line-by-line splitting falsely inflated the apparent record count.

The normalized registry groups the entries into five workstreams:
1. `DOC-REPORT-ARCHIVE`: report publication/history, not three independent product fixes.
2. `FIX-SIM-TIMEOUT`: one consolidated timeout/batching root-cause repair across successive commits.
3. `FIX-STORE-CATALOG`: distinct catalog fixture correction.
4. `HARDEN-EMULATOR-FIXTURE`: fixture/checkout/environment hardening.
5. `DOC-PLATFORM-MIRROR`: platform-side documentation mirroring, not runtime fixes.

The original 11-file bundle remains untouched. The normalized registry is additional evidence. The available registry supports 13 historical entries and five workstreams; it does not substantiate 150/151 independent repairs.

Normalized registry blob SHA in both repositories: `85863ebaf8a6fa81233cc8470a822ac8d37aac34`.
Prior reconciliation addendum blob SHA in both repositories: `99de7b55c342d3fd8151a60b07b2f64487310adb`. This governing record supersedes its stale retention item.

## 6. Independent security and Firestore/Storage review — started, not certified

### 6.1 Rules baseline inspected

These files were fetched from both repositories and their Git blob SHAs matched exactly:

| File | SHA in both repositories |
|---|---|
| `firestore.rules` | `baecf9f87f3c6328e3540ce692015bc2e10e4b8b` |
| `storage.rules` | `d48f269540bf60024989e85e366dfce774db931c` |
| `functions/test/rules/firestore.rules.test.js` | `49afeca083583a73753c467a153fdbea8a509899` |
| `functions/test/rules/storage.rules.test.js` | `8fb7c83f46b9929e164047a95cc5c9c7a3adaa3b` |

Observed posture:
- Firestore is default-deny. Direct client access is limited to authenticated own-profile and own-wallet-ledger reads, plus a sender/recipient get of a specific transfer. Other direct client reads/writes are denied.
- Cloud Storage client reads/writes are default-deny; media access uses authenticated server callables and narrowly scoped signed URLs.
- The Firestore rules test file has 8 explicit test cases; the Storage rules test file has 1. These are useful controls but not yet a complete role/path/query/race matrix.

### 6.2 Server-side review performed

A first-pass static scan counted 182 callable exports in `functions/src/index.ts` and 16 in `functions/src/media.ts` (198 total). All 198 showed an authentication/authorization guard in their initial code block. This is a screening result, not proof of correct downstream resource/field/scope authorization.

Inspected paths:
- `requireOwner` / `requireOwnerForReview`: owner claim plus verified owner session/MFA; review denials are audited and fail closed if the audit write fails.
- `getMediaSaverAttachmentUrl`: checks active Media Saver entitlement on every request, conversation participation, message/asset linkage, deletion state, retention deadline, safe derivative metadata, generation and hash before issuing a short-lived URL.
- `createMediaUploadIntent` / `finalizeMediaUpload`: purpose/type/size checks, create-only generation precondition, quarantine, owner/guest restrictions, metadata and signature validation before scan/approval.
- `deleteDirectMessageForMe` / `deleteDirectMessageForEveryone`: participant authorization; delete-for-everyone is restricted to the original sender's own message (or verified platform-owner path); media enters pending deletion, active legal holds block deletion, exact Storage generations and derivatives are reconciled, tombstone/audit evidence is written and retry is supported.
- `getOwnerMediaInspectionUrl`: legacy signed-URL callable is disabled; owner preview uses authenticated verification and returns a verified derivative rather than a Storage bearer URL.



### 6.2.1 Confirmed security finding — callable App Check is not enabled (SEC-APP-CHECK-001)

A source-level verification of the current development branch found:
- `pubspec.yaml` does not include `firebase_app_check`.
- `lib/main.dart` initializes Firebase but does not activate an App Check provider.
- No `setGlobalOptions` App Check enforcement was found in the Functions entry points.
- All 198 callable exports are declared as `onCall(async (request) => ...)` without explicit `enforceAppCheck: true` options; their initial blocks do contain authentication/authorization guards. This is not an authentication bypass by itself, but it leaves App Check attestation unenforced for callable requests and weakens anti-abuse/device-app attestation.
- The two owner media HTTP routes independently require a Firebase ID token, revocation-aware token verification, an App Check token and a verified owner/MFA session. The scanner callback is separately protected by its HMAC secret.

**Severity:** High-priority security hardening gap (not evidence of unauthenticated access to protected callables).

**Required remediation sequence:** integrate FlutterFire App Check into the client bootstrap for Android, iOS and Web using the appropriate platform providers; keep debug providers restricted to emulator/test builds; validate non-production app registrations and tokens; add callable integration tests for missing, invalid, expired and valid App Check tokens; then enable enforcement in controlled endpoint groups and only after client compatibility is proven. Do not apply a blanket enforcement switch before clients are ready, because that can break all existing callable journeys. No production App Check registration, allowlist mutation or enforcement activation was performed.

Also verified: the chat/media retention scheduler uses `MAWDA_RETENTION_JOBS_ENABLED=false` by default and requires an explicit enable switch plus exact project-ID validation. This remains fail-closed; do not enable it in production under this work.

### 6.3 Security items still open

1. Complete semantic authorization review of all 198 callables: resource ownership, room membership, participant state, owner/specialist role scope, validation, pagination bounds, idempotency and abuse/rate controls.
2. Expand Firestore/Storage rules tests into a systematic matrix for anonymous/member/owner/specialist/guest; own/other resources; get/list/query/create/update/delete; malformed claims; cross-scope paths and denied writes.
3. Review every signed URL path for purpose, identity, exact object generation, content disposition/type, TTL, replay, expiry and deletion races.
4. Review retention/delete/legal-hold races, late derivatives and cleanup reconciliation with isolated emulators and fixtures.
5. Review callable App Check, token freshness/revocation, owner MFA semantics, audit failure handling and sensitive response projection.
6. Review scheduled/HTTP entry points, secrets, environment boundaries, dependencies and CodeQL findings.

No production Firebase access, deployment, rules publication or data mutation was performed. Real-device media transport and production acceptance are deferred to experimental pilot launch, not current code-completion blockers.

## 7. Current gap disposition

### Closed at policy/governance level
- Recipient save authority and no sender veto.
- Sender's separate delete-for-me and delete-for-everyone controls.
- No bilateral conversation-participant consent gate for retention policy or sender deletion.
- Previously saved recipient-local copies are not represented as erasable by server deletion.
- Existing retention durations are fixed.
- Historical repair CSV parsing and normalized workstream interpretation.
- Historical bundle preservation/non-reopening boundary.
- Exact 16-hour commit and CI inventory documented.

### Verified within named CI scope
- Emulator-only 5,000-persona lifecycle.
- Timeout/batch tuning and catalog fixture correction.
- Latest Flutter analysis/tests and Web artifact build.
- Named Functions/integration tests, Firestore/Storage rules tests and call-signaling emulator tests.
- Named media scanner validation and CodeQL workflow.

### Open technical work in the current development phase
- Complete independent security review in Section 6.
- Close remaining code/test coverage for sender deletion, recipient save semantics, exact media deletion, legal holds, retries and retention lifecycle.
- Reconcile further code-level gaps found by the security review against the canonical platform and test them on the development branch.
- Preserve exact SHA/run evidence; do not rework the 5,000-persona harness without a demonstrated regression.

### Deferred to experimental pilot launch — not current development blockers
- Real Android/iOS device acceptance.
- Live audio/video media-plane acceptance and end-to-end device playback.
- Production Firebase validation and production operational/capacity acceptance.
These must not be repeatedly demanded during current code-completion work.

## 8. Non-negotiable boundaries

- Development and documentation only on `codex/mawda-full-platform-implementation`.
- No merge to `main`, deployment or release.
- No production Firebase mutation or rules publication.
- No Blaze/billing/paid resource activation.
- No destructive production operation or live retention schedule change.
- No deletion or rewriting of historical audit evidence.
- Do not reopen historical fixes verified by later successful evidence unless a new specific regression is demonstrated.

## 9. Phase-transition decision

This record establishes the **16-hour documentation and CI reconciliation checkpoint** and is the consolidated reference for the reviewed window.

Next development phase:

**Phase N+1 — Independent Security Closure & Remaining Code-Level Gap Closure.**

Entry conditions:
1. Latest CI baseline remains green on the exact reviewed development heads.
2. Security audit findings are classified as fixed, owner-accepted/deferred, or open.
3. Each remaining code gap has root cause, minimal safe change, tests and exact run/SHA evidence.
4. RET-006 is propagated to active policy/traceability/gap documents; bilateral consent is not reopened.
5. Historical fixes and the 5,000-persona harness remain preserved absent a demonstrated regression.

This is a development-phase transition checkpoint, not final product acceptance, pilot launch approval, production authorization or merge approval.

## 10. Primary evidence links

- Main validation: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810293
- Main Test Center: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810329
- Main economic verification: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810286
- Main CodeQL: https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46118810962
- Lab Test Center: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46118773564
- Lab economic verification: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46118773554
- Lab 5,000-persona lifecycle: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115183044
- Lab domain regression: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115185748
- Lab offline media scanner: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115190369
- Historical timeout example: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46053231523
- Historical catalog fixture failure: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46045795625
- Historical checkout slug failure: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46043790479

---

**Acceptance statement:** The exact 16-hour commit ledger and GitHub Actions inventory are reconciled; latest named workflows are complete and successful; historical failures/cancellations remain transparent; repair registry interpretation is corrected; the owner retention clarification is binding and supersedes stale bilateral-consent wording; security review has started but is not falsely certified complete; pilot-only checks are deferred; and no production boundary has been crossed.


## 11. Post-publication verification and security review delta — 2026-11-28 07:45 UTC

This section records the CI and source-review evidence obtained after the exact 16-hour cutoff in Section 2. It is appended to the same governing record so the document also carries the final validation of its own mirrored publication and the additional security observations.

### 11.1 Final documentation heads and workflow state

- Main platform final documentation head: `08ae371849d971d91fab39a9b9f5000892381153`.
- Simulation lab final documentation head: `038b2e6de2308da4f954f4d27bf4aff7d5f4d9a5`.
- Both repositories: **zero active runs and zero failed runs** on the final heads at the 07:45 UTC verification.
- Older runs triggered by intermediate documentation commits were automatically cancelled when newer documentation commits superseded their SHA. Those cancellations are not failed test results. The final-head runs listed below completed successfully.

### 11.2 Final-head CI evidence

Main platform:
- [Validate Mawda — 46121760296](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46121760296): all 5 jobs succeeded.
  - Cloud Functions compile/unit suite: 477 tests, 476 passed, 0 failed, 1 skipped (the external GCS signed-URL test described in 11.3).
  - Server evidence, authorization and biometric integration: 55 tests passed, 0 failed.
  - Flutter: 32 tests passed; Dart analysis reported `No issues found`; Web release artifact built successfully.
  - Comprehensive backend emulator integration: 148 tests passed, 0 failed, including retention, direct-message deletion, legal holds, wallet/store transactions, call signaling, Firestore/Storage rules and backup/restore checks.
  - Isolated ClamAV scanner: 31 tests passed, 0 failed; 10 source/security contract tests and 21 GIF/audio/video/PDF sanitization tests. ClamAV detected the harmless EICAR test signature as expected.
- [Mawdda Test Center — 46121760340](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46121760340): success. Across its grouped suites, 624 tests, 623 passed, 0 failed, 1 skipped for the same external GCS test. Dart analysis and Web artifact build succeeded.
- [Economic phase verification — 46121760306](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46121760306): success.
- [CodeQL — 46121760535](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/46121760535): both analysis jobs succeeded.

Simulation lab:
- [Mawdda Test Center — 46122099069](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46122099069): success. Across grouped suites, 624 tests, 623 passed, 0 failed, 1 skipped for the same external GCS test. Dart analysis and Web artifact build succeeded.
- [Economic phase verification — 46122099018](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46122099018): success.

The 624-test Test Center total is an aggregate of grouped test commands; it is not added to the Validate job totals because some suites overlap. No production deployment occurred; Web outputs are CI artifacts only.

### 11.3 Explicitly skipped external GCS test

The one skipped test is named `real Cloud Storage signed URLs enforce HTTP upload, generation precondition, read and expiry`. The test reports: `Set MAWDA_GCS_HTTP_TEST_BUCKET in an isolated non-production GCS project.` It was not executed because no isolated non-production GCS test bucket was configured. This is **SKIPPED / NOT VERIFIED**, not passed. No external bucket or production resource was created. Under the current GitHub-Actions-only development scope, keep it deferred until an isolated non-production environment is explicitly authorized; do not substitute production credentials or production storage.

### 11.4 Media Saver client-path evidence

The recipient's local-save capability is present in the client as well as the backend:
- `lib/services/member_media_upload_service.dart` calls `getMediaSaverAttachmentUrl` and saves the returned server-approved derivative through `FileSaver.instance.saveFile`.
- Direct-chat and room-chat screens both expose the Media Saver save action.
- The backend rechecks entitlement for every save request, applies conversation/message authorization and safe-derivative checks, issues a short-lived capability and does not extend `retentionExpiresAt`.
- Server-side delete-for-everyone cannot reach a file already saved to the recipient's local device. This is the approved policy boundary; actual device acceptance remains deferred to the experimental pilot.

### 11.5 Additional dependency hygiene finding — SEC-DEPENDENCY-001

The current `functions/package-lock.json` contains development-only transitive packages `tar@6.2.1` and `glob@10.5.0`, each marked deprecated in the lockfile with upstream warnings about unsupported versions/security vulnerabilities. CI also emits the Node `punycode` deprecation warning. These observations do not by themselves prove an exploitable production-runtime vulnerability: the two named packages are marked `dev: true` in the lockfile. Nevertheless:
- **Status:** OPEN — dependency hygiene/security review.
- Inspect parent dependency paths and compatibility; run `npm audit` in a controlled GitHub Actions job; upgrade the responsible parent/transitive dependency and lockfile to supported patched versions; rerun Functions, emulator and scanner suites.
- Do not blindly force an incompatible transitive override or modify production dependencies without tests.
- No dependency upgrade or external package scan was performed in this review.

### 11.6 Updated security disposition

The callable App Check gap `SEC-APP-CHECK-001` remains high-priority and open: client bootstrap lacks FlutterFire App Check, and callable endpoints do not enforce App Check. Authentication/authorization guards and owner/media-specific controls are present, but do not replace App Check attestation. The safe remediation order remains client provider integration (Android/iOS/Web), non-production token validation and missing/invalid/expired-token tests, then staged callable enforcement. Do not enable blanket enforcement before clients are compatible.

The security audit therefore remains **IN PROGRESS**. The green CI baseline does not close App Check, dependency hygiene, full callable semantic authorization review or the skipped external GCS integration test.

**Post-publication acceptance:** final documentation heads have green latest CI, no active runs and no failed runs. Historical cancellations remain recorded. The only skipped test is explicitly identified above. No merge, deployment, production Firebase mutation, billing activation or live retention change was performed.


## 12. Retention implementation delta — 2026-11-28 (not yet CI-verified)

This addendum records implementation work after the governance review above. It does not rewrite the historical evidence or authorize production activity.

### 12.1 Owner policy and scope
- RET-006 remains closed: no bilateral participant consent, second-participant approval or veto is required to apply retention. The decision does not assign a new mode-selector actor.
- The hourly destructive worker is scoped only to user-shared direct-chat and room attachments with server purposes `chat` and `room`.
- Stickers, profile albums, stories, avatar/cover assets, account assets, text, wallets, transactions and operational/audit data remain outside the chat/room worker and retain their independent policies.

### 12.2 Source changes recorded on the development branch
- `enforceChatMediaRetention` now has an hourly UTC schedule and explicitly calls only `chat` and `room`.
- `enforceIndependentMediaRetention` is a separate scheduled export for `profile_album`, `story`, and `avatar_cover`; the sticker worker remains separately scheduled.
- Media asset and tombstone scans use cursor pagination rather than the former fixed 10-page ceiling. Individual failures do not stop traversal of later records; failed items remain eligible for a later retry.
- Late-object handling uses purpose-specific expiry semantics; the four-hour chat fallback is not applied to avatar/cover or story objects.
- The four-hour clock now starts when a validated asset is linked to a sent chat/room message. Upload finalization leaves chat/room `retentionExpiresAt` unset; message linking writes server-authoritative `mediaSentAt` and the expiry together.
- Unsent chat/room upload intents are excluded from the sent-media retention worker and remain under upload-intent cleanup.
- Integration tests now route profile/story/avatar/cover fixtures through the independent worker and include a regression that checks the chat/room worker does not mutate independent purposes. The media-callables test asserts the four-hour clock is not started at upload finalization and is started on message send.

### 12.3 Current validation and remaining gates
- These edits were committed to `codex/mawda-full-platform-implementation` in the main repository and mirrored into the lab repository as platform code/docs only.
- No GitHub Actions run, Functions build, or Emulator suite result for the exact updated head has been retrieved in this session. The source changes are therefore **implemented / not yet test-verified**, not accepted as closed.
- The available GitHub connector exposes PR-triggered workflow-run retrieval and commit status checks, but no push-run listing or workflow-dispatch action. Combined commit-status queries for the new commits returned no legacy status contexts; this is not evidence of a passing or failing Actions run.
- The 5,000-persona simulation engine was not invoked, and no simulation-lab workflow was dispatched.
- Temporary private-conversation full deletion remains a separate technical gap: server-recorded inactivity, immutable mode state, participant notices and complete deletion of text/media/derivatives still require code review and tests. Bilateral consent is not a blocker.
- Real non-production GCS generation/soft-delete behavior, backup/PITR, replication/CDN copies, monitoring, alerting and physical erasure remain unverified. No production Firebase/Storage changes, deployment, live deletion, merge to `main`, or billing action occurred.
