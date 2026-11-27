# Featured Advertising — Secure Lifecycle Implementation Record

Status: **implementation gap record; no production capability is enabled by this document**.
Base: `c759083e04ffd98616691c2e736207095aaf2dbc`.
Branch: `codex/featured-ads-secure-lifecycle-20261118`.

## Verified current state

- `functions/src/featured-advertising.ts` selects the upper showcase using publication, owner approval, withdrawal, payment confirmation, creative approval, schedule and geography. It explicitly returns `rewardEligible: false`; it is a selector, not a delivery/session service.
- `functions/src/featured-ad-rewards.ts` validates reward policy and evaluates evidence. It is a pure decision function; it does not persist sessions, verify foreground presence, reserve budget, credit a wallet, or append a ledger entry.
- `functions/test/featured-advertising.test.js` and `functions/test/featured-ad-rewards.test.js` are unit tests of those pure functions.
- `lib/screens/featured_ads_screen.dart` currently renders geographic selection and a static empty-state message. Its reward history screen is also static; it does not call a server endpoint or play a campaign.
- The separately implemented timed-ad flow (`setTimedAdCampaign`, `startTimedAdvertisement`, `heartbeatTimedAdvertisement`, `completeTimedAdvertisement`, `getRewardCenter`) is not proof that the featured-ad showcase has a secure reward lifecycle. Do not silently conflate the two products.
- Existing experimental featured reward defaults must not be treated as owner-approved production prices, quotas or budgets.

## Required server-owned lifecycle

### 1. Campaign and governance service
- Introduce separate campaign records and callable service contracts for featured inventory; preserve existing timed-ad collections and semantics.
- All create/edit/submit/approve/reject/publish/pause/withdraw operations must enforce authenticated owner or explicitly delegated permission server-side, including step-up/MFA where required by the existing owner access contract.
- Persist immutable campaign versions. Publication requires recorded owner approval, confirmed payment, cleared creative moderation/scanning, valid schedule, placement and geography.
- Payment confirmation is owner-controlled and backed by the existing verified payment/finance workflow; never trust a client boolean or a representative/supervisor claim.
- Target only coarse, explicitly selected campaign geographies. Do not infer precise location, language, sensitive profile attributes, private messages or other sensitive member data. Return aggregate reporting by default.
- Use the existing secure media upload gateway and quarantine/scanner/derivative pipeline. Reject unsupported MIME, mismatched content, oversized files, malware, unapproved external URLs and missing rights evidence. A filename extension is not evidence.

### 2. Trusted viewing session
- Add server callables to discover eligible campaigns, start a session, heartbeat, pause/resume if approved by the lifecycle policy, complete, and fetch member history.
- Session creation snapshots campaign version, member, creative hash/type, required completion threshold, reward-policy version, reward amount, budget reservation, start time and a cryptographically random session ID.
- Enforce one active rewarded session per member with a transactional lock. A showcase preview never creates a reward session.
- Heartbeats must be sequential, nonce-bound, short-lived, idempotent, and server-timestamped. Reject replay, out-of-order events, impossible elapsed time, long gaps, background/hidden state, and client-reported duration without evidence.
- Client visibility signals are not cryptographic proof of a human watching. Treat them as bounded defense-in-depth; combine app lifecycle/foreground checks and server-side rate/fraud controls. Never describe them as proof against a modified client.
- Pause/expiry/recovery behavior must be explicit. Expired, withdrawn, unpaid, unapproved or changed campaign versions fail closed.

### 3. Atomic reward and ledger
- Completion must be one Firestore transaction that re-reads the session, campaign version/status, payment/approval state, reward policy, budget reservation, member caps and wallet state.
- Create a deterministic claim/ledger identity derived from the session ID. If already completed, return the prior immutable outcome without a second credit.
- Atomically close the session, consume/release reservation as appropriate, increment campaign/member counters, update wallet balance and create exactly one immutable ledger entry.
- Do not permit client writes to campaigns, sessions, counters, claims, reward policies or wallet ledgers. Add rules tests proving denial.
- Reconcile aggregate budget and wallet ledger. Never invent production reward amounts, campaign budgets, commission or billing policy; keep production disabled until owner-configured and approved.

### 4. Member experience and history
- Replace static placeholders in `FeaturedAdsScreen` and `FeaturedAdRewardsScreen` with typed repository/service calls and explicit loading, empty, error, unavailable and success states.
- Display only server-returned campaign metadata and eligibility. The player must lock reward completion until server qualification; never award on local timer completion.
- Add a blocking player lifecycle that pauses heartbeat on app background, route loss, hidden/inactive state, media error and navigation away. Resume only through server validation.
- History must come from immutable server claim/ledger records and show campaign, time, status and credited amount returned by the server.
- Keep layouts adaptive at 320, 360, 390, 520, 768, 1024, 1280 and 1440 logical pixels. Test text scaling, RTL, long translations, landscape, keyboard/safe areas, loading/error states and narrow widths. Do not finalize colors, backgrounds, typography or brand visuals without owner review.

## Mandatory test matrix

- Governance: owner, delegated supervisor with/without exact scope, representative, ordinary member, expired/revoked grant, missing MFA/step-up, owner withdrawal.
- Payment: unpaid, pending, verified, reversed/refunded, duplicate confirmation, stale finance state.
- Creative: valid image/GIF/video, false MIME, corrupt file, oversize, malware signature, scanner outage, rights not confirmed, unsupported source.
- Targeting: exact allowed geography, no match, multiple matches, schedule boundaries, timezone independence, no sensitive targeting.
- Session: simultaneous starts on two devices, active lock, heartbeat replay, nonce replay, out-of-order, excessive gap, background, visibility loss, media stall, early completion, campaign pause/withdraw mid-session, expiry, restart/recovery.
- Rewards: simultaneous completion requests, duplicate retries, budget exhaustion, daily member cap, rolling campaign cap, wallet insufficient/invalid state, transaction retry, ledger uniqueness and reconciliation.
- UI: all listed viewport sizes, RTL and localization, accessibility, lifecycle interruptions, empty/error/offline states.
- Isolation: synthetic campaigns/coins and emulator callbacks cannot access production Firebase projects or production wallets.
- Load: concurrent personas and contention; report exact SHA, scenario, number of personas, duration and metrics. A fixture for 5,000 personas is not a successful 5,000-person simulation.

## Downstream execution gates

1. Implement and emulator-test featured campaign governance and secure media binding.
2. Implement and emulator-test session/heartbeat protocol and transactional reward/ledger.
3. Integrate member player and history UI; run Flutter analysis/tests and responsive widget tests.
4. Extend CI with named featured-ad emulator and UI regression jobs; require all jobs green on the exact PR head.
5. Then audit call entitlement/billing against approved economy rules; do not change pricing, rounding or quotas without an approved source decision.
6. Then resolve Firebase Storage bucket identity by read-only Console verification before media end-to-end activation; do not alter production Firebase.
7. Then complete owner/member administration gates and run the 5,000-person lab with reproducible evidence.

## Safety boundaries

This branch is development-only. No production Firebase writes, deployment, paid resources, billing activation, live campaign publication, main-branch merge, data deletion, retention-policy activation or iOS identity changes are authorized by this task.


## Follow-up implementation work — 2026-11-18

The following development-branch changes were made after the gap review:

- `8c70a1abec83d697b1dd2e4b069e29a60f041b9d`: enabled the domain-regression workflow on this feature branch; the workflow still requires an observed run on the exact head before tests can be called successful.
- `82bad6b1ff5a687c1d265d457d52e9f7e9e967d7`: removed the arbitrary 100-view ceiling from timed-ad campaign validation. The owner-configured repeat count must be a positive safe integer; the campaign budget remains the financial ceiling.
- `aa34b5c65368873789c82d9709985cca5dc11129`: added unit coverage for repeat counts above 100 and invalid values.
- `270b96750d0c1e9c65bc850e24463d60da4bc11a`: aligned owner creative upload prechecks with the platform media ceilings (3 MiB images/GIF and 25 MiB original video) and removed the UI's 100-view restriction.
- `9bb7d6d0396f348678e8bb354fc7d6ff41b0217e`: bound timed-ad completion to the exact published campaign version and schedule observed at session start. Paused, archived, rescheduled, or otherwise version-changed campaigns now cancel an in-flight session, release its reservation, and do not credit a wallet.
- `349d4ab6efe6d577f99e28d09ef89e49b4ade479`: updated the successful timed-ad integration fixture and added an emulator regression for pausing a campaign during an active session.

Verification status at this note: source files and blob SHAs were re-fetched from the feature branch after writes. No local Node/Flutter test execution occurred in this chat. The GitHub combined commit status endpoint returned no status checks for the latest integration-test commit, so these changes are **not yet test-verified**.

Remaining featured-ad gates are unchanged: implement the independent featured campaign governance and member session/heartbeat/claim service, persist policy/campaign configuration with owner-only versioned audit, integrate the member player and history UI, and run emulator + Flutter regression on the exact branch head. Do not treat the timed-ad fixes above as completion of featured ads.


## Owner campaign concurrency hardening — 2026-11-18

- Existing campaign edits now require the exact `expectedVersion` observed by the owner console; the backend compares it inside the Firestore transaction and rejects stale edits.
- Publish, pause and archive transitions require the observed version and atomically increment it. A stale screen can no longer overwrite a newer owner action.
- The owner Flutter console carries the version for edits and status transitions and surfaces a refresh-required conflict instead of silently overwriting.
- The engagement emulator suite now covers a stale edit, a successful edit/version increment, a publish transition, and rejection of a stale pause attempt.
- This protects the current platform-managed timed-ad campaign workflow. It does not complete the separate featured-showcase delivery/session/reward service described above.


## Featured Ads lifecycle implementation — 2026-11-18 (development branch)

### Implemented in this development increment
- Added a separate `featuredAdCampaigns` collection and owner callables: `saveFeaturedAdCampaign`, `getOwnerFeaturedAdCampaigns`, and `setFeaturedAdCampaignStatus`. Campaign edits are version-checked; saving an edit clears owner approval; paid campaign terms are frozen and must be represented by a new campaign if changed.
- Publication is fail-closed unless owner approval, actual payment confirmation recorded by the Owner, approved creative, active reward policy, valid schedule and sufficient reward budget all exist. Only scanned image/GIF campaigns can publish; video remains blocked pending a real player and device acceptance.
- Added a separate member showcase selector and `getFeaturedAdShowcase`. Preview selection is explicitly non-rewarding. The broad Arab-region filter includes region-specific campaigns; exact regional selection remains supported.
- Added `featuredAdSessions`, active-session locking, bounded foreground heartbeats, policy/campaign version snapshots, budget reservation, expiry cleanup, explicit cancellation, and atomic completion into `featuredAdRewardClaims` plus the member wallet ledger. Daily member caps, per-campaign caps and campaign coin budgets are checked transactionally. Repeated completion returns the existing claim without a second credit.
- Added `getFeaturedAdCreativeUrl`, which only issues a short-lived signed URL for an approved safe derivative when the member owns the active session and the campaign/version/payment/creative gates still pass.
- Connected the member discovery, blocking image/GIF player, lifecycle heartbeats, cancel/complete actions and server-backed reward history UI. Added a separate owner console linked from the existing advertising/rewards screen, with campaign controls, owner reward-policy controls and financial event review.
- Featured reward policy updates now use optimistic version checks. Defaults remain disabled and zero until the Owner explicitly configures them.

### Advertising finance review boundary
- Added append-only `featuredAdFinancialEvents` and idempotency records for owner-recorded `payment_received`, `refund_recorded`, `settlement_reconciled` and `review_completed` events.
- Financial event IDs are derived from campaign + action + external reference, so retries from another device or after app restart cannot duplicate the same referenced operation. Reusing the reference with changed payload is rejected.
- Refunds cannot exceed the unrefunded recorded receipt. A refund pauses a published campaign, clears payment eligibility, reduces the reconciled net balance and forces a new owner financial review.
- Settlement in this increment means accounting reconciliation of the recorded net receipt only. It is **not** a payout, bank transfer, representative commission payment or money movement. The event stores `moneyMovementExecuted: false`.
- Payment receipt and refund events require an owner-supplied external reference and evidence reference. This is an owner attestation/reference record; it does not independently verify a bank statement or execute the external transaction.
- No currency conversion, tax, fee, commission percentage, partial-payment schedule, chargeback rule, automated refund, payout or payment gateway has been invented or enabled. Those remain subject to the existing advertising contracts, legal/accounting review and separate owner approval.

### Verification and release gates
- Added unit tests for financial event validation, over-refund rejection, net reconciliation after refunds, idempotency identity and broad-region showcase selection.
- Added a Firestore Emulator integration scenario for campaign creation/approval, owner payment record, settlement, member discovery, session heartbeats, exactly-once wallet credit, reward history and refund-triggered pause.
- Added Firestore composite indexes for featured campaign discovery, session cleanup, reward history and financial event history. Firestore rules continue to deny all direct client writes to these server-owned collections.
- This increment has **not yet been verified by CI on its exact current HEAD** at the time of this note. The previously passed CI SHA is not evidence for these new changes.
- No production Firebase writes, deployment, real-money transfer, billing activation, provider connection, main merge or live campaign publication has occurred.

### Remaining limitations before phase-one acceptance
- Video creatives are intentionally not publishable. Real Android/iOS/Web device acceptance, platform integrity/fraud signals and stronger anti-tamper evidence remain open.
- Owner-provided evidence references are audit pointers, not automatic external financial verification.
- Representative commission and payout accounting belongs to the separate Advertising Department contract workflow; it is not silently mixed into member Coins rewards.
- A full phase exit still requires exact-HEAD CI green, emulator proof, UI tests, review of Firestore indexes/rules, and an owner acceptance of the manual financial workflow and its legal/accounting semantics.


## Full Platform integration follow-up — 2026-11-27

Reviewed against development-branch source at `b0f7c4af1ad739295e3778925c68134a0c7977bb`.

### Current integrated lifecycle
- The featured showcase has its own server endpoints in `functions/src/index.ts`: discovery, start, heartbeat, end and completion. It remains separate from the ordinary timed-ad flow and uses the central wallet/ledger rather than a parallel economy.
- Session creation validates campaign approval, payment, creative approval, schedule and safe media derivative metadata/generation before issuing a short-lived read URL.
- Completion re-reads session, campaign, member, policy, daily counters and campaign-member history in one Firestore transaction. If all gates pass, it writes one wallet balance update, a session-linked ledger entry, a claim receipt and budget/counter updates atomically.
- The product's fixed ceiling of **10 rewarded views per member per featured campaign per UTC day** is now enforced in the reward decision and settlement path. Owner-configured rolling-window limits can be lower but cannot raise this daily ceiling. Campaign timestamps retain at least the current UTC day even if the configured rolling window is shorter.
- `functions/test/featured-ad-rewards.test.js` covers the ninth-to-tenth eligible view and rejects the next attempt with `campaign_daily_view_cap`.

### Evidence boundary — rewards remain fail-closed
- Session creation initializes `serverValidatedVisibility` and `serverValidatedPlayback` to false. Client foreground/visibility/progress heartbeats remain telemetry only.
- No trusted playback/visibility attestation provider is connected in this source state. Therefore the completion transaction rejects reward eligibility when trusted evidence is absent; local playback or client heartbeat cannot mint coins.
- The fixed ten-view cap does not enable rewards, invent a reward amount, create a budget, or override owner policy. Default reward policy remains disabled/zero until explicitly configured by the owner.

### Validation evidence
- Accumulated source/test head: `b0f7c4af1ad739295e3778925c68134a0c7977bb`.
- GitHub Actions `Mawdda economy regression` run `45961078669`: **success**, including featured-ad reward policy regressions.
- GitHub Actions `Validate Mawda` run `45961078701`: Functions compile/unit and server evidence/authorization/biometric integration jobs completed successfully; the separate Flutter job was still running at documentation time.
- GitHub Actions `Mawdda Test Center` run `45961078680`: Flutter analysis/tests/web release build completed successfully; complete backend emulator journeys were still running at documentation time.

### Remaining integration work
- Connect a trusted playback/visibility evidence source with replay protection and immutable session evidence; do not promote client heartbeat to trusted evidence.
- Complete the full member-facing featured/ordinary ad UI acceptance against their separate lifecycle contracts.
- Verify concurrent session exclusion, withdrawal during playback, daily/rolling caps, budget exhaustion, exactly-once reward settlement and owner policy-version changes across the complete emulator journey.
- No production reward, campaign billing, live Firebase mutation, deployment or paid infrastructure was enabled.
