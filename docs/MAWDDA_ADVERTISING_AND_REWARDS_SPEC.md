# Mawdda Platform — Owner Advertising and Rewards Specification

Status: approved product direction; implementation is staged. This is a product/security contract, not a claim that every screen or integration is already implemented.

## 1. Two compatible advertising modes

1. **Platform-managed campaigns (initial mode; no external provider).** The owner creates and uploads the creative directly to Mawdda, chooses placement and eligibility, sets required viewing duration, and configures the member reward in Coins. This mode must work without an ad network, SDK, or provider account.
2. **Future provider-connected mode (optional and disabled until integrated).** If Mawdda later approves and connects an advertising provider, the Owner / Super Admin dashboard must expose a separate option allowing the owner to upload their own advertising creative directly to Mawdda and manage its campaign and reward settings. Provider connection must not remove the platform-managed mode. Provider-served ads and owner-uploaded Mawdda campaigns may coexist.

The dashboard must show a truthful integration state: Not connected, Connected, or Needs attention. Never show a fake connected state or enable provider controls before a real adapter is reviewed and configured.

## 2. Owner campaign controls

The owner can create, preview, edit, pause, resume, schedule, publish and archive campaigns. Fields include campaign title/ID, description, sponsor label, creative upload (supported image/GIF/video or text-only), placement, start/end dates, audience eligibility, frequency cap, priority, required viewing duration, reward Coins, per-member claim limit, total campaign reward budget, active state and optional provider reference.

The owner can set experimental values in isolated emulator/test mode. Synthetic campaigns, ad views and test Coins must never enter production collections or wallets. Production campaigns remain inactive until explicitly published by the authorized owner.

## 3. Timed viewing and rewards — initial mode

- A member starts an explicit campaign session. The server records member, campaign version, server start time, duration, reward and unique session ID.
- The member viewing screen is a blocking/locked experience. Ordinary navigation and reward claim controls remain unavailable until the required duration is satisfied. No skip button. The timer must not accrue while paused, backgrounded, hidden or not in the foreground.
- The server is authoritative. A client timer finishing is not proof of eligibility.
- The app must heartbeat while the ad is genuinely visible and foregrounded. The server accumulates eligible foreground time, applies a bounded heartbeat grace window, and rejects large gaps, replayed/out-of-order heartbeats, impossible durations and duplicate claims.
- Completion atomically closes the session, creates one immutable reward claim and credits the wallet ledger exactly once. Repeated completion returns the prior result without another credit.
- One active rewarded-view session per member. Interruption/resume and expiry behavior must be explicit and versioned. Paused/expired campaigns cannot start new sessions.
- Add rate limits and abuse telemetry. Platform integrity signals are defense-in-depth. Fail closed on invalid or missing session state.

A simple server start-time plus duration check is insufficient for production because it rewards leaving an ad unattended. Foreground/heartbeat verification is a release gate.

## 4. Future provider adapter

Provider integration is optional behind a stable server-side adapter. It must not expose provider secrets or trust client-supplied reward amounts.

- Store provider credentials only in managed server secrets, never Firestore documents, app config, source control or the client.
- Adapter contract: connection health, campaign metadata, creative upload if supported, impression/reward verification, signed callbacks/webhooks, and safe disconnect/revocation.
- If the provider supports owner-uploaded creatives, expose direct upload in the Owner dashboard and route the file through the same secure upload, MIME/content validation, malware scanning, moderation, storage and preview pipeline as platform-managed campaigns. If unsupported, clearly explain that; do not pretend upload succeeded.
- Distinguish provider-served ads from owner-uploaded Mawdda campaigns, with explicit source, serving mode, billing responsibility and reward policy.
- Authenticate callbacks using signature verification, timestamp tolerance and replay/idempotency protection. Link every event to a known campaign/session/member. Never reward based on a client claim.
- Owner-defined rewards are permitted only when provider terms and campaign economics allow them. Enforce per-view reward bounds, member/day caps, campaign budgets and fraud thresholds; reject or pause conflicting configurations.
- Keep provider-independent campaign/session and wallet-ledger records so changing providers never requires rewriting member wallet history.
- Expose connection test, webhook health, last successful event, failure reason and safe disconnect controls.

## 5. Attendance and engagement rewards

Owner-configurable policies must support hourly, daily and weekly attendance, plus separately approved registration, email verification, biometric verification and timed-ad reward categories.

- Period boundaries use server time and documented timezone rules, never device time.
- One claim per member, period and reward type. Idempotent transactions and immutable wallet ledger entries are mandatory.
- Retries, replay, timezone changes, reinstall and multiple devices must not multiply rewards.
- Policies include enabled state, amount, effective date, version, eligibility, caps and audit history.
- Experimental amounts and synthetic claims stay in emulator/test projects. Production defaults remain disabled/zero until owner approval.
- Biometric reward remains fail-closed until cryptographic device proof, nonce/replay protection and real-device verification exist. A local OS biometric prompt is insufficient.
- Registration/email rewards require backend-verified state, not a client assertion.

## 6. Security, media and privacy

- Owner actions require established owner authorization and MFA/step-up. Every create/update/publish/pause/reward-policy action is written to the tamper-evident owner audit trail.
- Uploads use the secure media gateway, MIME/content sniffing, size limits, malware scanning and storage lifecycle rules. Never trust file extensions or arbitrary external URLs.
- PDF/document handling remains under the existing owner-only document policy; never expose member document download paths.
- Firestore rules deny member writes to campaigns, sessions, claims, policies, provider settings and wallet ledgers. Callable functions own state transitions.
- Do not expose private messages, sensitive profile attributes or member identity to advertisers/providers. Aggregate campaign metrics by default; member-level fraud details are restricted, audited and retention-limited.

## 7. Required tests

Use synthetic personas in Firebase Emulator and short-lived CI artifacts:
- Owner create/edit/pause/resume/archive; unauthorized and MFA/step-up failures.
- Text/image/GIF/video validation, unsupported/oversize/invalid MIME/malicious uploads and scanner failures.
- Campaign discovery, eligibility, placement and immutable campaign-version snapshot.
- Locked-view UI; foreground heartbeat; pause/background/network loss; early completion; heartbeat gap; replay/out-of-order; expiry; concurrent sessions.
- Successful completion, duplicate completion/callback, wallet reconciliation, per-member and campaign budget caps.
- Hourly/daily/weekly boundaries, DST/timezone changes, multiple devices, retries, ISO week/year boundary and idempotency.
- Provider disconnected/connected states, bad signatures, stale timestamps, unknown campaigns, replay callbacks, invalid events, outage and owner upload when supported.
- Isolation proving synthetic campaigns, credits and callbacks cannot reach production.
- Mixed guest/member/premium/owner load; owner-only operations unavailable to ordinary personas.

## 8. Release gates and truthful status

The first release can ship platform-managed campaigns without a provider only after the server-enforced foreground/heartbeat protocol, secure upload path, owner controls, wallet reconciliation, rules and emulator/UI tests are complete.

Future provider mode stays disabled until a provider is selected, contract/terms are reviewed, adapter and webhook verification are implemented, secrets are configured securely and end-to-end tests pass.

Report each capability separately as implemented, CI-tested, emulator-only, real-device-tested, provider-dependent or awaiting owner configuration. A specification or fixture that writes Firestore directly is not proof of a completed feature.
