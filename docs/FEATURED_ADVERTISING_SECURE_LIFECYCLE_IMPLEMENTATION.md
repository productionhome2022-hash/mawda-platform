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
