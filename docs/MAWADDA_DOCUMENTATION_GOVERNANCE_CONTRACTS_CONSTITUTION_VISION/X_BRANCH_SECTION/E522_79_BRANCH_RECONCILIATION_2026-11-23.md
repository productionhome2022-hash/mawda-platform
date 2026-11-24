# E522 — 79 X Branch Reconciliation and Repository Cleanup Audit
Date: 2026-11-23
Target branch: `codex/mawda-recovery-integration-2026-11-21`
Target HEAD at audit start: `b8b167fe1cfd0c38e63901f02c17fa87487b750a`
X archive branch: `archive/X-frozen-branches-2026-11-23`
X archive commit: `e2883ca4d73285ccc7428a57e4624f923c637865`

## Executive result

- All 79 branch tips recorded in the X archive manifest were compared against the E522 target HEAD using GitHub compare.
- 62 branch tips are divergent from E522 (have branch-only commits); 17 are behind E522 with no branch-only commits.
- A divergent branch is not proof that every listed file is unique or safe to port. Compare metadata is only the first pass; exact tree/blob comparisons and semantic review are required.
- No code from these 79 branches was blindly merged or overwritten in this audit.
- No source branch, archive branch, repository, production resource, Firebase resource, or billing setting was deleted or changed.
- The 79 branch tips and their reachable Git histories remain preserved through the X archive commit's parent graph and the frozen manifest.

## 17 branches with no branch-only commits against E522

These compare results were `ahead_by=0`; their refs are historical/redundant relative to the selected E522 HEAD, subject to archive verification before any ref deletion:

1. `codex/biometric-final-owner-policy-2026-11-20`
2. `codex/biometric-final-policy-drift-closure-2026-11-20`
3. `codex/biometric-manual-review-gate-2026-11-20`
4. `codex/biometric-video-duration-validation-2026-11-20`
5. `codex/mawdda-audit-archive-full`
6. `codex/mawdda-deep-audit-profile-store`
7. `codex/mawdda-mfa-signin`
8. `codex/mawdda-native-platform-scaffold`
9. `codex/mawdda-phase1-unified-2026-11-19`
10. `codex/mawdda-pr3-port`
11. `codex/mawdda-premium-features`
12. `codex/mawdda-safety-ui`
13. `codex/phase1-integration-batch-01-inventory-2026-11-19`
14. `codex/phase1-advertising-callable-auth-2026-11-20`
15. `codex/mawdda-unified-final-v2`
16. `codex/mawdda-unified-final-v3`
17. `codex/production-readiness-tests`

## Divergent branches requiring exact review

The remaining 62 branches have branch-only commits. High-priority candidates surfaced by compare include:

- Economy and wallet: `codex/economy-recovery-2026-11-18`, `codex/economic-phase-completion-2026-11-18`, `codex/economic-phase1-closeout-2026-11-18`, `codex/economy-official-port-2026-11-18`, `codex/mawdda-economy-selective-port-2026-11-19`.
- Governance and constitution: `codex/mawda-unified-constitution-vision-2026-11-19`, `codex/structural-governance-biometric-roles-2026-11-19`, `codex/governance-biometric-integration-2026-11-19`, `codex/mawdda-deep-governance-audit-2026-11-19`.
- Biometric and identity: `codex/biometric-server-lifecycle-2026-11-20`, `codex/mawdda-biometric-proof-gate-2026-11-20`, `codex/mawdda-super-owner-biometric-state-machine-2026-11-20`.
- Advertising: `codex/featured-ads-secure-lifecycle-20261118`, `codex/featured-ads-serving-foundation`, `codex/phase1-featured-ad-geography-all-arab-2026-11-20`.
- Calls, rooms, media and retention: `codex/mawdda-room-audio-duration-enforcement`, `codex/mawdda-group-call-capacity-2026-11-20`, `codex/phase1-rented-room-call-gate-2026-11-20`, `codex/phase1-media-hold-delete-race-2026-11-20`, `codex/phase1-media-direct-delivery-denials-2026-11-20`.
- Test infrastructure: `codex/mawdda-test-account-system`.

The full 79-name source list and immutable tip SHAs are in `X_FROZEN_BRANCH_ARCHIVE_MANIFEST_2026-11-23.md`.

## Exact tree review — first high-risk semantic finding

The candidate `codex/economy-recovery-2026-11-18` contains a branch-only `functions/src/featured-ad-rewards.ts` and matching tests. Its policy introduces a distinct featured-ad reward policy with its own caps. Its `featured-advertising.ts` also applies geographic filtering to featured showcase campaigns and marks showcase selections as not reward-eligible.

The current E522 `functions/src/featured-advertising.ts` deliberately does not apply geography to featured placements and leaves reward eligibility to the caller. This matches the owner's explicit product rule: regular commercial ads are geographically segmented; featured ads are not geographically segmented. The owner's further instruction is that featured-ad rewards use the same reward model as ordinary ads, with reward quantities configured by the owner. Therefore the source branch's featured-ad reward module and geographic selector must NOT be copied wholesale. The candidate code is retained in X for review; no owner-set prices, quotas, or reward amounts are inferred from it.

## Repository and archive inventory

The installed GitHub connection search returned these two Mawdda repositories:
- `productionhome2022-hash/mawda-platform` (default branch `main`)
- `productionhome2022-hash/mawdda-5000-simulation-lab` (default branch `main`)

The platform repository has the two historical archive refs:
- `archive/development-pre-unification-2026-11-15` at `f068a8b2e3ad91551c2b27c9f554de04bbfc609e`
- `archive/main-pre-unification-2026-11-15` at `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`

The X archive is separate from the E522 development branch but, at present, is an archive branch in the same GitHub repository. The connected GitHub tools did not expose repository-creation or branch-deletion operations in this session. Therefore this audit did not create a separate X repository and did not delete any refs or repositories.

## E522 documentation-center inventory

The current E522 tree contains the central documentation/governance directory with:
- central change manifests for 79 and 137 commits;
- central commit chronology and post-snapshot chronology;
- master source inventory and reconciliation register;
- semantic reconciliation register;
- README and the X branch section;
- X archive location pointer.

Additional audit and test evidence still exists under other `docs/` paths, including `docs/audit/`, `docs/audit/termux/full-evidence/`, domain audits, branch reconciliation reports, and test-center runbooks. This is a verified organizational gap: not all audit/evidence files have yet been physically consolidated under the central directory. Moving all of them requires a path-and-link migration; do not break current references by deleting source paths before replacement links are validated.

## Next safe execution gates

1. For each of the 62 divergent refs, compare exact tree/blob SHAs against E522 and review branch-only commits; group duplicate or superseded implementations.
2. Port only reviewed, policy-compliant code and tests in small batches. Never overwrite a newer E522 implementation with an older branch snapshot.
3. Run targeted unit/Cloud Functions/Flutter analysis tests only as relevant. The 5,000-persona simulation and external acceptance tests are excluded from merge/port stages by owner policy.
4. Consolidate audit documents, contracts, governance, test reports and central registers under the E522 documentation center while retaining validated compatibility links.
5. Reconcile both historical archive refs and every other branch/ref/repository visible to the owner.
6. Only after verifying archive completeness, exact source-to-archive SHA coverage, and no remaining unique changes, prepare a deletion manifest for owner approval. Do not delete `main`, the historical archive refs, E522, the X archive, or the simulation lab under this audit.

## Execution boundary

This report records the exact compare coverage and the first semantic conflict found. It does not claim that all 62 divergent branches have been fully reviewed or that their unique code has been ported. No 5,000-persona simulation was run.


## Additional exact file-content review

### Audio duration and media limits

Compared `codex/mawdda-room-audio-duration-enforcement` with E522 for:
- `scanner/processors.js`
- `functions/src/media.ts`
- `functions/src/media-scanner.ts`
- `scanner/security.js`
- `functions/test/media-scanner.test.js`
- `lib/widgets/chat_audio_controls.dart`

The archived source branch's `scanner/processors.js` still declares general audio `maxDurationSeconds: 120` and `maxBytes: 25 MiB`, while E522 declares `maxDurationSeconds: 60` and `maxBytes: 5 MiB`. E522 is therefore stricter and matches the owner's fixed 60-second / 5-MiB audio ceiling. No source file from this branch should overwrite E522. This is a concrete example of why branch commits must not be merged wholesale.

### Featured advertising reward/geography rule

As detailed above, the source branch's geographic filter for featured placements conflicts with the owner's requirement that featured ads are not geographically segmented. Its separate featured reward policy is not accepted as a new independent reward system; reward economics remain governed by the central owner-controlled economy and the same viewing/reward rules used for ordinary ads. No code was ported from this source.

### Current E522 documentation-center state

The E522 central directory currently contains 12 files: README, two central change manifests, central commit chronology, post-snapshot chronology, master source inventory, master source reconciliation, semantic reconciliation register, two X-section records, and two product identity/access README documents. A broader tree scan found audit and test evidence outside the center, including forensic reports, Termux evidence, legal/governance audits, domain audits and branch reconciliation documents. The center is therefore NOT yet complete as a physical consolidation of all documentation and evidence.



## Historical archive comparison

Compared both prior archive refs directly against the current E522 HEAD `c13b2c696363ece920c94a43b508984351c7a443`:
- `archive/development-pre-unification-2026-11-15` (`f068a8b2e3ad91551c2b27c9f554de04bbfc609e`): `ahead_by=0`, `behind_by=1424`, no branch-only files returned.
- `archive/main-pre-unification-2026-11-15` (`460a79a7dc2e16f4ad146af22aab58e152ad1e8c`): `ahead_by=0`, `behind_by=3624`, no branch-only files returned.

These two historical refs are ancestors of the selected E522 history and contain no commits ahead of E522. Preserve them as historical records; they are not development targets.

## Current cleanup outcome

The 79-branch comparison is complete at the GitHub compare-metadata level. The two previous archive refs are also compared. The repository search available through the connected GitHub installation surfaced only the platform repository and the separate 5,000-persona simulation lab. The X history is preserved as an archive branch inside the platform repository; this session did not expose a repository-creation action to split it into a separate GitHub repository. The session also did not expose a branch/repository deletion action. Accordingly no refs or repositories were deleted.

