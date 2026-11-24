# Second-stage SHA-deduplicated review — 17–21 Nov 2026

- Repository: `productionhome2022-hash/mawda-platform`
- Recovery reference examined in the source audit: `codex/mawda-recovery-integration-2026-11-21`
- Input: previously uploaded chronological CSV (blob `296134e6de35b04304413a090469e79c3fb13388`)
- Scope remains committer timestamps 2026-11-17 00:00 UTC through 2026-11-21 23:59:59 UTC.
- This report is a deduplicated re-analysis of that CSV; it does not pretend to be a fresh full-history Git object scan.

## Corrected unique-object counts

| Classification | CSV appearances | Unique commit SHAs |
|---|---:|---:|
| Exact SHA in Recovery during the scoped window | 9,999 | 893 |
| Same patch, same UTC hour | 4 | 4 |
| Same patch, different time | 58 | 52 |
| No patch match in Recovery during the scoped window | 2,145 | 1665 |
| No comparable patch | 21 | 17 |
| **Total** | **12,227** | **2631** |

The earlier figure 2,145 is branch-row appearances, not distinct commits. SHA deduplication reduces it to **1665 distinct commit objects** (a reduction of 480 repeated appearances). Likewise, 9,999 exact-match appearances represent 893 distinct SHAs. These rows describe commits reachable from each branch head, not necessarily commits authored uniquely on that branch.

## Branch distribution of deduplicated unmatched candidates

| Branch | Unique unmatched SHAs | Distinct changed paths |
|---|---:|---:|
| `codex/economy-recovery-2026-11-18` | 611 | 111 |
| `codex/featured-ads-secure-lifecycle-20261118` | 197 | 58 |
| `codex/economic-phase-completion-2026-11-18` | 172 | 39 |
| `codex/mawda-unified-constitution-vision-2026-11-19` | 131 | 61 |
| `codex/economic-phase1-closeout-2026-11-18` | 122 | 35 |
| `codex/governance-biometric-integration-2026-11-19` | 81 | 38 |
| `codex/structural-governance-biometric-roles-2026-11-19` | 77 | 33 |
| `codex/biometric-server-lifecycle-2026-11-20` | 64 | 15 |
| `codex/mawdda-role-capacity-final-2026-11-19` | 27 | 13 |
| `codex/economic-phase-controlled-integration-2026-11-19` | 18 | 6 |
| `codex/economy-official-port-2026-11-18` | 17 | 6 |
| `codex/mawdda-retention-approval-ci-repair-2026-11-19` | 15 | 9 |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | 13 | 11 |
| `codex/mawdda-biometric-proof-gate-2026-11-20` | 12 | 9 |
| `codex/mawdda-independent-verification-cycles-2026-11-20` | 12 | 9 |
| `codex/phase1-scanner-error-callback-test-2026-11-20` | 12 | 3 |
| `codex/mawdda-role-capacity-after-retention-2026-11-19` | 11 | 9 |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 10 | 1 |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | 10 | 8 |
| `codex/phase1-media-hold-delete-race-2026-11-20` | 7 | 3 |
| `codex/mawdda-economy-selective-port-2026-11-19` | 6 | 5 |
| `codex/mawdda-group-call-capacity-2026-11-20` | 6 | 4 |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | 6 | 6 |
| `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | 6 | 4 |
| `codex/mawdda-group-call-capacity-2026-11-20-r2` | 5 | 4 |
| `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | 5 | 3 |
| `codex/phase1-rented-room-call-gate-2026-11-20` | 4 | 2 |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | 3 | 2 |
| `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | 2 | 1 |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | 2 | 2 |
| `codex/phase1-ci-coverage-role-store-2026-11-20` | 1 | 1 |

## What is established and what is not

1. The 893 unique exact-SHA objects are present in the Recovery history represented by the original scan.
2. 56 unique commits have patch-id matches in the Recovery **scoped window**. This is patch equivalence evidence only, not feature-level equivalence.
3. 1665 unique commits have no patch-id match in that same window. They are **recovery candidates requiring further verification**, not yet proven missing from Recovery.
4. The original scan did not compare patch IDs against the entire Recovery history outside the date window. Therefore an unmatched item may already exist in Recovery at an earlier or later date.
5. The CSV records first-parent patch IDs for merge commits; merge commits require parent-aware review. The original report also classifies empty/non-comparable patches separately.
6. A file appearing in a commit's changed-file list does not prove its final content is absent from Recovery: later commits may have reimplemented, superseded, reverted, or consolidated it.

## High-volume candidate paths (commit appearances among deduplicated unmatched SHA objects)

- `M	functions/src/index.ts` — 317
- `M	functions/test/integration/wallet-store.integration.test.js` — 64
- `M	functions/src/media.ts` — 53
- `M	functions/test/integration/call-signaling.integration.test.js` — 39
- `M	docs/ECONOMIC_PHASE_VERIFICATION_REGISTER_2026-11-18.md` — 36
- `M	functions/test/integration/engagement-rewards.integration.test.js` — 34
- `M	functions/src/biometric-lifecycle.ts` — 29
- `M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md` — 29
- `M	functions/test/integration/media-callables.integration.test.js` — 26
- `M	lib/screens/economy_pricing_screen.dart` — 26
- `M	lib/screens/featured_ads_screen.dart` — 23
- `M	docs/IMPLEMENTATION_TRACEABILITY.md` — 22
- `M	lib/screens/owner_featured_ads_dashboard_screen.dart` — 22
- `M	docs/UNIFIED_BRANCH_INTEGRATION_REGISTER_2026-11-18.md` — 20
- `M	functions/test/store-catalog.test.js` — 19
- `M	.github/workflows/mawdda-domain-regression.yml` — 19
- `M	lib/screens/shop_screen.dart` — 18
- `M	lib/screens/super_admin_screen.dart` — 18
- `M	functions/src/store-catalog.ts` — 16
- `M	lib/screens/owner_advertising_rewards_screen.dart` — 16
- `M	functions/test/integration/biometric-verification.integration.test.js` — 15
- `M	lib/screens/profile_screen.dart` — 15
- `M	lib/screens/owner_coin_purchase_screen.dart` — 15
- `M	.github/workflows/validate.yml` — 15
- `M	docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md` — 13
- `M	lib/services/member_media_upload_service.dart` — 12
- `M	functions/package.json` — 12
- `M	functions/test/group-call-economy.test.js` — 11
- `M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md` — 11
- `M	lib/screens/mawdda_call_screen.dart` — 10
- `M	functions/test/advertising-governance.test.js` — 10
- `M	lib/screens/coin_purchase_screen.dart` — 9
- `M	functions/src/coin-purchase-requests.ts` — 9
- `M	docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md` — 9
- `M	functions/src/economy-pricing.ts` — 9
- `M	functions/test/integration/owner-entitlement-grants.integration.test.js` — 9
- `M	docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md` — 9
- `M	functions/src/group-call-economy.ts` — 8
- `M	functions/test/biometric-reward-security.test.js` — 8
- `M	functions/src/advertising-governance.ts` — 8

## Required next verification before any recovery port

- Enumerate all commits reachable from Recovery, without the 17–21 Nov date filter, and build a complete patch-id index.
- For every candidate SHA, classify: exact SHA anywhere in Recovery; matching patch-id anywhere in Recovery; no patch match; merge/empty/non-comparable.
- For no-match candidates, compare actual per-file diffs and the current Recovery tree, including later commits that may have reimplemented the same behavior.
- Review feature-level clusters (economy, featured ads, biometric lifecycle, role/capacity, calls, media, governance) with tests and policy constraints.
- Only then produce an approved recovery-port list. No code was ported, no branches merged/deleted, and no production/Firebase resource was touched by this analysis.

## Deduplicated candidate ledger

See the paired CSV for every distinct unmatched SHA, branch appearance selected for the ledger, timestamp, subject, patch-id, and changed paths.
