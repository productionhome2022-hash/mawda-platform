# Mawdda historical chronology — 16–19 November 2026

## Scope and method

This is a historical reconstruction only. No tests, builds, installs, deployments, or environment commands were run to prepare this chronology. It combines:
1. GitHub commit metadata on `codex/mawda-full-platform-implementation`, using Git author/committer timestamps.
2. The Ubuntu shell-history extract and local file inventory collected on 21 November 2026.

All dates below are **local time UTC+03:00** unless explicitly marked UTC. GitHub commit timestamps are converted from UTC by adding three hours.

## Important evidence boundary

- The captured `/root/.bash_history` is an ordered command history but the exported lines have **no per-command timestamps**. Therefore it is not possible to assign every command to 16, 17, 18, or 19 November with certainty, nor to prove that each command completed.
- The captured local log inventory contains replay/audit files whose modification timestamps are on **21 November**. Those files describe 21 November collection/replay activity and are not evidence that those commands ran on 16–19 November.
- The local Ubuntu snapshot itself identifies Flutter 3.47.9 / Dart 3.13.7 on Ubuntu PRoot, but it was collected on 21 November; it does not establish the exact installed versions on the historical dates.
- GitHub commit history is timestamped evidence of repository changes, not proof of a local Ubuntu command or a successful runtime operation.
- This report intentionally does not evaluate test outcomes.

## Commands found in Ubuntu shell history (date not recoverable)

The saved shell history contains commands in these groups:

- Environment setup: `apt update`, installation of Git/curl/unzip/XZ/libGLU, cloning Flutter stable, adding Flutter to PATH, enabling Flutter web.
- Repository setup: cloning `mawda-platform`, changing into the repository, inspecting workflow files, staging/committing/pushing changes, changing Git remotes, and fetching/pulling branches.
- Flutter work: `flutter pub get`, `flutter clean`, `flutter analyze`, and several `flutter build web` variants (release/profile/debug, renderer and source-map flags).
- Project file edits: writing or replacing Firebase options, `main.dart`, user model and coin service source files; searching model files and editing screen imports.
- Cloud tooling: checking `gcloud` authentication, selecting the `mawda-app-2026` project, and invoking Cloud Shell setup scripts.
- Repository/environment inventory: checking Git/Flutter/Dart/Node/npm/Java versions, Flutter doctor, repository status, branches, remotes, and project configuration files.

The exact command sequence is preserved in [shell-history-relevant.txt](raw/shell-history-relevant.txt). It must be treated as an undated command record, not a day-by-day execution transcript.

## 16 November 2026

GitHub history shows concentrated work on call lifecycle and signaling, media boundaries, room rentals, economy replay safety, and advertising auditability.

Representative changes (Git timestamp UTC → local UTC+03:00):

- 13:47–13:56: advertising intake review audit identifiers and retry-safe audit events.
- 13:53–13:56: legal portal application-identity restrictions and fail-closed allowlist handling.
- 14:31–14:37: room rental renewal lifecycle and idempotency protections.
- 14:32–14:37: store purchase replay validation against confirmed prices.
- 14:36–14:37: media policy documentation and exact audio-duration boundary records.
- 19:14–22:25: WebRTC call lifecycle/signaling work, including authenticated call lifecycle, TURN credentials, room multi-peer routing, participant authorization, expiry handling, cleanup, and signaling pagination.
- 22:25: further call signaling cleanup and server-side safeguards.

These are repository events evidenced by commit metadata. They do not prove that the corresponding application was deployed.

## 17 November 2026

GitHub history shows work across Android release preparation, Firebase identity checks, web/PWA readiness, notifications, calls, and advertising:

- 15:19–15:22: call signaling hardening and featured-reward policy reconciliation.
- 15:36–16:32: Firebase identity validation, Android release configuration, APK/AAB metadata checks, signed-artifact scan workflow wiring, ABI-specific version-code handling, and phased release documentation.
- 22:14–22:57: web launch-readiness baseline, PWA and push-notification assets, icon/path corrections, and notification bootstrap/routing changes.
- 23:02–23:33: production-configured web release-candidate workflow (without deployment), member-home responsive behavior, call duration/quota handling, and advertising reward limits/discovery fixes.

Representative commit anchors:
- `85d027fa94` — phased launch/distribution plan.
- `68010b0e77` — prepare signed APK and Google Play AAB releases.
- `1720412295` — scan signed Android release artifacts with ClamAV.
- `6aa2584589` — production-configured web release candidate without deployment.
- `2a2ac64e95` — server-timed call duration ceiling.
- `9aa97d1faa` — rolling advertising campaign reward cap.

## 18 November 2026

The most visible repository event in this date window is the call-readiness reconciliation:

- 00:48:30 local (2026-11-17 21:48:30 UTC): commit `c759083e04`, “docs: reconcile call readiness with current signaling code”.
- 00:47–00:49 local: adjacent commits documented featured-ad implementation gaps and reward-center discovery regressions and adjusted campaign discovery filtering.
- 05:50 local (2026-11-18 02:50:09 UTC): commit `7fd1c6cd9b`, “docs: record exact-head validation and prioritized implementation gaps”.

The commit `c759083e04` is dated **18 November locally**, not 17 November. The associated GitHub Actions run previously identified in the audit is run **#3647**, ID **44183645018**, for SHA `c759083e04`. Its UTC start date falls on 17 November, while its local +03:00 date is 18 November. Keep those two timezones distinct.

## 19 November 2026

GitHub history shows a large documentation, governance, economy, and phase-one integration activity:

- Around 02:57 local: controlled economic-phase integration audit documentation.
- 08:13–08:48 local: unified constitution/vision documentation, canonical terminology, governance and owner-role reconciliation.
- 08:14–08:30 local: economy foundations including owner-controlled payment policies, currency precision, versioned catalogues, immutable financial snapshots, and read-only wallet reconciliation.
- 13:00–16:00 local: owner-approved contracts/identity documentation, permissions, advertising governance, economy and room-rental policy refinements.
- 20:00–23:08 local: unified phase-one integration, store gifting, specialist-role capacity, CI workflow concurrency diagnosis, PR validation trigger, and additional media/security lifecycle changes.

Representative commits include:
- `0bf6316df9` — unified Mawdda platform vision.
- `a8402d85d1` — consolidated Mawdda constitution.
- `275b56ef7f` — centralize per-service payment controls and pricing versions.
- `152c4b303b` — read-only owner wallet reconciliation endpoint.
- `dd7fef947c` — integrate audited store gifting and transactional role capacity.
- `3e81e33bd7` — isolate push and pull-request validation concurrency.
- `d5d5fca57a` — record exact-head CI and media regression evidence.

## What can and cannot be concluded

**Supported by available records**
- The Ubuntu shell history preserves a broad sequence of setup, repository, Flutter, file-editing, and cloud-tool commands, but without dates per line.
- GitHub preserves a detailed commit chronology for 16–19 November on the specified development branch.
- GitHub Actions run #3647 is a traceable workflow event associated with `c759083e04`; its local date is 18 November.
- The 21 November local replay/audit logs are separate later events and must not be represented as historical activity from 16–19 November.

**Not established by the available local snapshot**
- Exact time and date for each individual Ubuntu shell command.
- Whether each historical command completed successfully.
- A complete, timestamped Ubuntu terminal transcript for all four dates.
- The identity and exact acceptance boundaries of any “four stages” based solely on this local history export.

## Source files

- [README.md](README.md)
- [ANALYSIS.md](ANALYSIS.md)
- [shell-history-relevant.txt](raw/shell-history-relevant.txt)
- [local-log-file-list.txt](raw/local-log-file-list.txt)
- [environment-and-git.txt](raw/environment-and-git.txt)
- [GitHub Actions run #3647](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44183645018)
