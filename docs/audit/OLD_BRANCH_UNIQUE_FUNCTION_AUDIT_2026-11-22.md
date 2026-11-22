# Old Branch Unique-Function Audit — 2026-11-22

**Repository:** `productionhome2022-hash/mawda-platform`  
**Audit base SHA:** `0be47684a5fde5d04628de5c81d69391e41c3036`  
**Development branch at audit start:** `codex/mawda-full-platform-implementation`  
**Branch inventory:** GitHub returned 83 branches: the development branch, `main`, and **81 other branches**. All 81 were compared against the exact audit-base SHA using GitHub's commit comparison endpoint.  
**Current follow-up commits:** `7c5c0fa66ec92b0479d991b6e782079961f711f2` and `21dd24c19998c310b1a668534df677ba208222c7` route the two legacy owner featured-ad screens into the canonical owner advertising console.

## 1. Comparison result

- **19 branches are strictly behind** the development baseline (`ahead_by = 0`): they contain no commit unique to their branch tip relative to the baseline. No cherry-pick is required.
- **62 branches are diverged** and have between 1 and 618 commits on their branch side. The counts overlap because many branches share the same source commits; they must not be added together as independent work.
- A branch being diverged does not mean every file listed in its compare response is missing from the development branch. The file lists are changes since each branch's merge base. The current development tree was separately inspected for the source paths and their integration points.
- No old branch was merged wholesale. This avoids reintroducing duplicate economies, stale API contracts, conflicting policy variants, or old workflow state.

### 19 branches with no branch-unique commits

`archive/development-pre-unification-2026-11-15`, `archive/main-pre-unification-2026-11-15`, `codex/biometric-final-owner-policy-2026-11-20`, `codex/biometric-final-policy-drift-closure-2026-11-20`, `codex/biometric-manual-review-gate-2026-11-20`, `codex/biometric-video-duration-validation-2026-11-20`, `codex/mawdda-audit-archive-full`, `codex/mawdda-deep-audit-profile-store`, `codex/mawdda-mfa-signin`, `codex/mawdda-native-platform-scaffold`, `codex/mawdda-phase1-unified-2026-11-19`, `codex/mawdda-pr3-port`, `codex/mawdda-premium-features`, `codex/mawdda-safety-ui`, `codex/phase1-advertising-callable-auth-2026-11-20`, `codex/phase1-integration-batch-01-inventory-2026-11-19`, `codex/production-readiness-tests`, `codex/mawdda-unified-final-v2`, `codex/mawdda-unified-final-v3`.

### 62 diverged branches and unique-commit counts

| Branch | Ahead | Branch | Ahead |
|---|---:|---|---:|
| `codex/biometric-server-lifecycle-2026-11-20` | 73 | `codex/canonical-role-terminology-owner-confirmation-2026-11-19` | 5 |
| `codex/economic-phase1-closeout-2026-11-18` | 124 | `codex/economic-phase-completion-2026-11-18` | 181 |
| `codex/economic-phase-controlled-integration-2026-11-19` | 21 | `codex/economy-official-port-2026-11-18` | 20 |
| `codex/economy-recovery-2026-11-18` | 618 | `codex/featured-ads-secure-lifecycle-20261118` | 199 |
| `codex/featured-ads-serving-foundation` | 139 | `codex/governance-biometric-integration-2026-11-19` | 89 |
| `codex/mawda-phase2-hardening` | 78 | `codex/mawda-recovery-integration-2026-11-21` | 12 |
| `codex/mawda-unified-constitution-vision-2026-11-19` | 142 | `codex/mawdda-audit-archive` | 14 |
| `codex/mawdda-biometric-owner-review-policy-2026-11-20` | 2 | `codex/mawdda-biometric-proof-gate-2026-11-20` | 12 |
| `codex/mawdda-deep-governance-audit-2026-11-19` | 10 | `codex/mawdda-economy-selective-port-2026-11-19` | 10 |
| `codex/mawdda-final-archive-v2` | 3 | `codex/mawdda-group-call-capacity-2026-11-20-r2` | 5 |
| `codex/mawdda-group-call-capacity-2026-11-20` | 6 | `codex/mawdda-independent-verification-cycles-2026-11-20` | 12 |
| `codex/mawdda-independent-verification-cycles-dev-2026-11-20` | 11 | `codex/mawdda-member-inbox` | 5 |
| `codex/mawdda-member-inbox-rebased` | 7 | `codex/mawdda-phase1-phase2-hardening` | 1 |
| `codex/mawdda-premium-effects` | 5 | `codex/mawdda-retention-approval-ci-repair-2026-11-19` | 17 |
| `codex/mawdda-role-callable-deny-regressions-2026-11-20` | 1 | `codex/mawdda-role-capacity-after-retention-2026-11-19` | 22 |
| `codex/mawdda-role-capacity-consolidation-2026-11-19` | 6 | `codex/mawdda-role-capacity-final-2026-11-19` | 40 |
| `codex/mawdda-room-audio-duration-enforcement` | 5 | `codex/mawdda-room-events` | 5 |
| `codex/mawdda-step1-role-reconcile-2026-11-19` | 32 | `codex/mawdda-store-entitlement-coverage` | 2 |
| `codex/mawdda-store-entitlement-hardening` | 2 | `codex/mawdda-store-entitlement-hardening-v2` | 1 |
| `codex/mawdda-store-wallet-entitlement-closure` | 4 | `codex/mawdda-super-owner-biometric-state-machine-2026-11-20` | 6 |
| `codex/mawdda-test-account-system` | 37 | `codex/mawdda-unified-final` | 17 |
| `codex/mawdda-unified-release` | 4 | `codex/mawdda-unified-test-2026-11-18` | 311 |
| `codex/phase1-branch-governance-audit-2026-11-20` | 1 | `codex/phase1-ci-coverage-role-store-2026-11-20` | 1 |
| `codex/phase1-ci-evidence-2026-11-20` | 1 | `codex/phase1-direct-call-transaction-revalidation-2026-11-20` | 5 |
| `codex/phase1-featured-ad-geography-all-arab-2026-11-20` | 2 | `codex/phase1-group-call-remainder-to-initiator-2026-11-20` | 2 |
| `codex/phase1-media-direct-delivery-denials-2026-11-20` | 3 | `codex/phase1-media-hold-delete-race-2026-11-20` | 7 |
| `codex/phase1-media-scanner-replay-regression-2026-11-20` | 1 | `codex/phase1-media-scanner-verdict-tests-2026-11-20` | 1 |
| `codex/phase1-rented-room-call-gate-2026-11-20` | 6 | `codex/phase1-scanner-error-callback-test-2026-11-20` | 12 |
| `codex/phase1-specialist-callable-auth-2026-11-20` | 1 | `codex/phase1-specialized-callable-auth-inventory-2026-11-20` | 1 |
| `codex/phase1-store-gift-concurrency-2026-11-20` | 2 | `codex/phase1-store-gift-permanent-entitlement-2026-11-20` | 2 |
| `codex/phase1-store-gifting-catalog-version-regressions-2026-11-20` | 1 | `codex/structural-governance-biometric-roles-2026-11-19` | 79 |

## 2. Functional transfer and disposition matrix

The following are the unique source areas surfaced by the diverged branch comparisons. The current development tree contains the retained implementations and the current exact-head validation workflow exercises the corresponding suites.

| Legacy functional area | Current canonical implementation | Disposition |
|---|---|---|
| Featured campaign selector, priority order, rotation | `functions/src/featured-advertising.ts`, called by `getActiveTimedAdCampaigns` in `functions/src/index.ts` | **Transferred and adapted.** Featured selection is non-geographic per the approved product rule; the older geography-targeted featured selector is intentionally not retained. |
| Featured campaign governance and lifecycle | `setTimedAdCampaign`, `getOwnerTimedAdCampaigns`, `setTimedAdCampaignStatus` in `functions/src/index.ts`; owner UI in `lib/screens/owner_advertising_rewards_screen.dart` | **Transferred into the shared campaign model.** Uses `timedAdCampaigns`, not a second `featuredAdCampaigns` model. Version checks, publication gates and owner-only authorization remain server-side. |
| Timed view sessions, active-session lock, heartbeat, completion, cancellation, expiry and reward claims | `activeTimedAdSessions`, `timedAdSessions`, `timedAdMemberCounters` and the timed-ad callables in `functions/src/index.ts`; `lib/screens/reward_center_screen.dart` | **Transferred into the shared session engine.** No separate `featuredAdSessions` or separate reward wallet is retained. |
| Featured daily view limit | `maxDailyClaimsPerMember` validation in publication and transactional checks in session start/completion in `functions/src/index.ts`; canonical owner UI validates 1–10 | **Transferred.** Server enforces the per-ad/per-member UTC-day counter; the configured maximum cannot exceed 10. |
| Featured advertising finance | `functions/src/featured-ad-finance.ts`, `recordFeaturedAdFinancialEvent`, `featuredAdFinancials`, version snapshots, event idempotency and owner audit | **Transferred and hardened.** Current module differs from the old branch revision and includes the current financial snapshot integrity checks. Events record owner-supplied evidence; they do not move money or verify an external bank statement. |
| Featured reward policy helper | Old `functions/src/featured-ad-rewards.ts` and its dedicated tests | **Intentionally superseded.** The helper was a pure policy evaluator, not a session, budget reservation or ledger implementation. Reward amounts, budgets and daily limits now live in the shared timed campaign/session and central wallet-ledger path. Keeping a second policy module would create parallel rules. |
| Featured member player and archive | `FeaturedAdsScreen`, `RewardCenterScreen(adType: 'featured')`, `getActiveTimedAdCampaigns`, shared heartbeat/completion/history callables | **Transferred into the shared player.** The member path no longer calls the legacy standalone showcase API. |
| Legacy owner featured screens | `lib/screens/owner_featured_ads_screen.dart`, `lib/screens/owner_featured_ads_dashboard_screen.dart` | **Compatibility-routed.** Both now delegate to `OwnerAdvertisingRewardsScreen`; this removes stale calls to non-exported standalone featured-ad callables and prevents a parallel owner console. |
| Call entitlement and call economy | `functions/src/call-entitlements.ts`, `group-call-economy.ts`, `room-call-policy.ts`, shared store and wallet paths | **Transferred.** No branch-wide cherry-pick needed; current tests cover call entitlement, room policy, call signaling and transactional economy. |
| Store gifting, coin purchase and wallet reconciliation | `store-gifting.ts`, `coin-purchase-requests.ts`, `wallet-reconciliation.ts`, shared wallet/store integration | **Transferred.** Atomic transactions and replay protection remain in the central economy. |
| Email verification reward cycles | `email-verification-cycle.ts`, `verification-calendar.ts` and renewal integration | **Transferred.** Current development tree contains the cycle implementation and tests. |
| Biometric review/lifecycle/proof and independent verification | `biometric-lifecycle.ts`, `biometric-review-state.ts`, `biometric-verification-cycle.ts`, current biometric tests | **Transferred/adapted.** Older branch variants are not substituted for the current owner-approved manual-review policy. |
| Media quota, media controls, secure derivatives and scanner replay/error handling | `media-controls.ts`, `media-quota.ts`, `media-derivative-contract.ts`, `media-scanner.ts`, `media.ts`, `scanner/` and current integration tests | **Transferred.** Current backend authorization and scanner callbacks remain the source of truth. |
| Chat/room audio controls and duration enforcement | `lib/widgets/chat_audio_controls.dart`, room/direct chat screens, media validation and current tests | **Transferred/adapted.** The platform-wide live voice recording maximum remains 60 seconds; this is separate from uploaded audio attachments. |
| Role capacity and specialized callable denial | `platform-role-identities.ts`, capacity enforcement in `index.ts`, specialized role emulator tests | **Transferred.** Older variants are not layered on top of the current canonical role model. |
| Sticker catalog and policy | `sticker-catalog.ts`, `sticker-policy.ts`, owner sticker UI and tests | **Transferred.** Uses the current media validation and published-catalog projection. |
| Media capacity policy | `capacity-media-management.ts`, owner capacity screen and tests | **Transferred.** Current mode remains observe-only; no quota or paid service was activated. |
| Audit archive | `functions/src/audit-archive.ts`, tests and `infra/audit-archive/` | **Source transferred; infrastructure is not deployed.** Terraform is repository code only. No cloud resources were provisioned. |
| Test accounts/personas and Test Center | `functions/scripts/seed-test-accounts.cjs`, fixtures, feature-coverage tests and Test Center workflow | **Transferred.** The separate 5,000-persona simulation remains a later acceptance gate and is not implied by smaller emulator persona tests. |
| Premium profile effects and member inbox | Current profile/conversations screens, `premium_profile_effects.dart`, current profile/message tests | **Transferred/adapted.** Current UI and server access rules are authoritative. |

### Explicitly not ported as independent implementations

1. The old featured-ad branch's separate `featuredAdCampaigns`, `featuredAdSessions`, `featuredAdRewardClaims` and standalone reward policy model were not copied as a second subsystem. The current product requires one campaign/session/wallet path; the relevant business rules were moved into the shared timed-ad path.
2. The `phase1-featured-ad-geography-all-arab` branch adds geography to the featured showcase. This conflicts with the approved distinction: standard ads are geographically targeted; featured ads are not. Its unique selector/test delta is therefore superseded, not missing.
3. The old owner screens had callable names such as `saveFeaturedAdCampaign`, `getOwnerFeaturedAdCampaigns` and `setOwnerFeaturedAdRewardPolicy`, which are not current exported server callables. They have now been redirected to the canonical owner screen rather than reintroducing obsolete endpoints.
4. Documentation-only branch deltas are not copied verbatim when the current master charter, constitution, approved-decision traceability, implementation traceability and release checklist supersede them. A historical audit note remains historical evidence, not an active policy.
5. Audit archive Terraform is not deployed. Provisioning infrastructure is a separate operational action and is not authorized by a source-code port.

## 3. Advertising and interface integration review

### Member navigation

- `main_user_screen.dart` places **مشاهدة الإعلانات** and **Media Workspace** adjacent in the completed-member panel.
- `AdViewingScreen` provides standard and featured choices.
- Standard ads pass a selected geographic target to `RewardCenterScreen(adType: 'standard')`.
- Featured ads pass `adType: 'featured'` without a geography field.
- `FeaturedAdsScreen` describes the non-geographic featured category and opens the shared featured campaign player.
- `RewardCenterScreen` calls the shared discovery, session, creative URL, heartbeat, completion, cancellation and history endpoints. The player sends the typed `adType` to the start callable.

### Owner navigation and campaign governance

- `SuperAdminScreen` imports the canonical `OwnerAdvertisingRewardsScreen`.
- That screen manages standard and featured campaign setup, media approval selection, campaign version, publication state, reward settings, financial event review and owner reporting through the shared callables.
- The two old featured owner screen files were compatibility-routed in the two commits listed above. They no longer call removed APIs.

### Server-side enforcement verified in source

- Featured discovery uses `placement = home`, `adType = featured`, active schedule and budget checks before returning campaigns.
- Featured campaigns must have an empty geography target list and a configured daily per-member limit from 1 through 10 before publication.
- Session start checks the typed player against the campaign type and checks the UTC-day member counter transactionally.
- Completion rechecks the campaign, reservation, budget and daily counter before exactly-once wallet credit.
- Financial records are versioned, idempotent and owner-only. The financial event path is an accounting/audit record, not a payment gateway.
- Standard campaigns use the geographic audience check; featured campaigns bypass geography by design.

## 4. Exact-head emulator evidence

The last fully completed `Validate Mawda` run inspected during this audit was:

- **Run:** [45026580608](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/45026580608)
- **Exact SHA:** `0be47684a5fde5d04628de5c81d69391e41c3036`
- **Conclusion:** success; all five jobs completed successfully.
- The job **Comprehensive backend emulator integration — final SHA** completed successfully. Its steps included featured-ad financial event/replay integration, attendance and timed-ad reward integration, Firestore/Storage rules, media authorization, retention, wallet/store, call signaling, room lifecycle, biometric security and backup/restore.
- The run occurred before the two compatibility-wrapper commits and before this audit document commit. It is not evidence for those later commits. A new exact-head validation is required and will be recorded separately.

## 5. Merge review boundary

PR #2 was observed open, Draft, not merged, with head SHA `0be47684a5fde5d04628de5c81d69391e41c3036` at the time of the PR metadata check. That PR snapshot reported mergeable, but Draft status and outstanding acceptance gates remain material. The PR must be re-read against the final tested SHA before any merge decision.

No merge to `main`, production deployment, live Firebase mutation, paid-resource activation, branch deletion or production infrastructure provisioning was performed by this audit. The X/legacy branch cleanup remains deferred until transfer evidence and merge authorization are complete.
