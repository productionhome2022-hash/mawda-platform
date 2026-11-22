# PR #2 Merge Readiness Review — 2026-11-22

**Repository:** `productionhome2022-hash/mawda-platform`  
**PR:** [#2 — Draft: Mawdda Platform 2026 consolidated vision, constitution and implementation](https://github.com/productionhome2022-hash/mawda-platform/pull/2)  
**Review head at inspection:** `721f25523fa28f8a2b2c3ae497d979e6a0beb878`  
**Last code-bearing commit in this review:** `21dd24c19998c310b1a668534df677ba208222c7`  
**Base:** `main` at `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`

## Decision

**Do not merge at this point.** This is a merge-readiness review, not merge authorization. PR #2 remains Draft and no merge action was taken. The current GitHub `mergeable: true` flag is only a merge-conflict snapshot; it is not an approval, release acceptance or permission to merge.

## 1. Pull request state and review evidence

At inspection:

- PR #2: open, Draft, not merged.
- GitHub reported `mergeable: true`.
- Head: `721f25523fa28f8a2b2c3ae497d979e6a0beb878`.
- Base: `main` / `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- PR metadata reported **1,596 changed files**, **414,965 additions** and **908 deletions**.
- No submitted PR reviews and no review threads were returned.
- The compare endpoint reports the development branch 3,476 commits ahead of `main`, 0 behind. The compare wrapper returned at most 300 changed-file records; it is not a complete substitute for the PR's 1,596-file diff review.
- Reading `/branches/main/protection` was denied with HTTP 403 `Resource not accessible by integration`. The repository rulesets endpoint returned an empty list. Therefore this connection cannot establish whether branch protection or required-review/check rules exist; absence of visible rulesets is not proof that no other protection is configured.

**Implication:** the full PR diff, required checks, review approvals and main-branch protection must be verified before merge. The PR is intentionally still Draft.

## 2. Actions evidence — exact SHA only

| Workflow | Run | SHA | Observed state |
|---|---:|---|---|
| Validate Mawda | [45026580608](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45026580608) | `0be47684a5fde5d04628de5c81d69391e41c3036` | **Success**, all five jobs passed. Includes the comprehensive backend emulator integration job. This is the last completed full validation observed before the owner-screen compatibility changes. |
| Economic phase verification | [45026580686](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45026580686) | `0be47684a5fde5d04628de5c81d69391e41c3036` | Success. |
| Mawdda Test Center | [45026580658](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45026580658) | `0be47684a5fde5d04628de5c81d69391e41c3036` | Success. |
| Validate Mawda | [45028694828](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45028694828) | `21dd24c19998c310b1a668534df677ba208222c7` | Pending at inspection; no jobs had been returned yet. No pass/fail claim. |
| Economic phase verification | [45028694770](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45028694770) | `21dd24c19998c310b1a668534df677ba208222c7` | Success. |
| Validate Mawda | [45028890306](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45028890306) | `721f25523fa28f8a2b2c3ae497d979e6a0beb878` | PR checks success: Analyze (actions) and Analyze (javascript-typescript). This is not the full Flutter/Functions/emulator validation. |
| Economic phase verification | [45028889044](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45028889044) | `721f25523fa28f8a2b2c3ae497d979e6a0beb878` | Success. |
| Mawdda Test Center | [45028888991](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45028888991) | `721f25523fa28f8a2b2c3ae497d979e6a0beb878` | Pending at inspection. |

Cancelled runs on earlier intermediate SHAs are not failures of the current SHA. The latest completed full emulator evidence remains the successful `Validate Mawda` run on `0be47684`; the compatibility-wrapper code change at `21dd24c` still needs its own completed full validation result.

## 3. Firebase identity and deployment safety review

### Firebase environment separation

Source inspection confirms the intended environment split:

- `lib/main.dart` defaults `MAWDDA_FIREBASE_ENV` to `nonprod`.
- Production options are selected only when a build explicitly passes `--dart-define=MAWDDA_FIREBASE_ENV=production`.
- `lib/firebase_options.dart` contains production options for project `mawda-app-2026`, sender ID `697303475139`, including the production Android/iOS app option entries.
- `lib/firebase_options_nonprod.dart`, Android `google-services.json`, and iOS `GoogleService-Info.plist` are the non-production build configuration for `mawda-platform-nonprod-2026`.
- Android application ID and iOS bundle ID remain `com.mawdda.platform.app`.
- `.firebaserc` uses `mawda-platform-nonprod-2026` as the CLI default and retains `mawda-app-2026` under the explicit `production` alias.

This is an intentional source-level separation between non-production default builds and an explicitly selected production build. No Firebase project resource, app registration, live data or production configuration was mutated during this review.

### Production deployment workflow

`.github/workflows/firebase-hosting-merge.yml` exists, but its trigger is **workflow_dispatch only**; it does not run automatically on push or PR merge. It requires all of:

1. The selected ref is `main`.
2. `confirm_production_deploy` is explicitly true (default false).
3. The actor is `productionhome2022-hash`.
4. Its build, test, emulator and Firebase configuration checks succeed.

It deploys Hosting only and uses the production Firebase project alias explicitly. The workflow was inspected but not dispatched. No production deployment occurred.

The non-production scanner deployment and live validation workflows are also manual workflows with explicit non-production project/bucket guards. Neither was dispatched.

**PR-description correction required:** the historical PR text says the Hosting deployment workflow was removed. That wording is stale. The accurate statement is that production Hosting deployment is manual-only and guarded by the explicit owner confirmation above; there is no automatic merge-triggered deployment.

## 4. Outstanding merge gates

1. Obtain a completed `Validate Mawda` result for the code-bearing SHA `21dd24c19998c310b1a668534df677ba208222c7` (or a later code SHA) and tie every job to that exact SHA.
2. Confirm the latest Test Center run has completed and is tied to the final PR head.
3. Review the full PR diff rather than relying on the 300-file compare response. The 1,596-file size warrants an explicit inventory of high-risk paths, generated artifacts, workflows, Firebase configuration, security rules, indexes and dependency changes.
4. Reconcile the PR body with the actual manual-only Hosting deployment workflow and the current development/audit evidence.
5. Verify main-branch protection and required status/review rules through an authorized read path; this connection received 403 for the branch-protection endpoint.
6. Keep the PR Draft until the owner-approved merge gates are met.
7. Obtain separate explicit owner authorization before merging to `main`. Broad development authorization is not main-merge authorization.

The owner has explicitly deferred external device acceptance and the separate 5,000-persona simulation until a later phase. They were not run or requested in this review and are not being presented as tasks for the owner to perform now. Their status remains deferred, not passed.

## 5. Actions not taken

- No merge to `main`.
- No production deployment or Hosting workflow dispatch.
- No live Firebase project mutation or app registration change.
- No paid-resource activation or billing change.
- No production data deletion or retention-policy activation.
- No old/X branch deletion.
- No change to Android signing credentials, iOS bundle ID or production Firebase app options.
