# Mawadda Constitution-to-Delivery Traceability

**Status:** Active engineering control document  
**Product authority:** `docs/MAWADDA_PRODUCT_CONSTITUTION.md`  
**Experience authority:** `docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md`  
**Release gate:** `docs/RELEASE_READINESS_CHECKLIST.md`

This matrix connects approved product decisions to implementation phases and objective release evidence. It is not a claim that roadmap items are complete. Update it whenever a requirement, implementation, test, risk, or release decision changes.

## Non-negotiable delivery rules
- Coin transfers must reject new transactions when either account is suspended, banned, or has an unknown explicit status; preserve atomic ledger writes and idempotent replay.
- Account suspension/bans must be enforced by the trusted backend on every direct-message send, room join, and room-message send; never rely only on client UI or stale membership.

1. The Product Constitution and owner-approved amendments are authoritative. If code, UI, data, rules, or tests conflict with them, stop and reconcile the conflict before proceeding.
2. A requirement moves through distinct states: **specified → designed → implemented → automated-tested → emulator/integration-tested → device/platform-tested → security-reviewed → release-approved**. Never collapse these states into a single “done”.
3. Every privileged action and financial mutation must be server-authoritative, least-privilege, auditable, idempotent where appropriate, and fail closed.
4. Never invent Firebase configuration, payment confirmation, verification, balances, user activity, or test results.
5. No merge to `main` and no production deployment without separate explicit owner approval.
6. Preserve privacy, consent, dignity, adult/minor safeguards, accessibility, localization, performance, and legal review throughout implementation—not as a final cosmetic pass.

## Delivery phases and traceability

| Phase | Constitution scope | Required implementation outcomes | Minimum evidence before exit | Current status |
|---|---|---|---|---|
| 0. Governance and foundations | Mission/priorities; engineering; release | Constitution, brand specification, approved amendments, architecture boundaries, threat model, release gates | Requirements mapped to tests; risks and owners recorded; no conflicting duplicate systems | Documents exist; this matrix added; continuous maintenance required |
| 1. Build reproducibility | Engineering and CI | Pinned toolchains, committed Flutter/npm lockfiles, deterministic dependency install, analysis/tests/build gates | Clean reproducible CI on exact commit; lockfile-enforced install | CI currently passes on prior dependency resolution; lockfiles and enforcement remain blockers |
| 2. Identity and account lifecycle | Accounts, registration, profiles; owner access | Firebase project alignment, auth flows, verification, recovery, owner bootstrap/MFA, profile privacy and validation | Non-production Firebase integration tests; MFA enrollment/challenge/recovery/revocation tests; device UX | Backend/auth/profile foundations exist; real Firebase configuration and owner MFA verification remain blockers |
| 3. Wallet and financial integrity | Wallet, transfers, rewards, stores | Atomic transfers, two-sided linked ledger, configurable fee snapshots, idempotency, purchase verification, reconciliation | Concurrency/replay/failure tests; both parties' histories; verified payment/refund/reconciliation tests | Transfer backend foundation and CI tests exist; production payment and broader rewards/purchases incomplete |
| 4. Member communication and safety | Messaging, notifications, social content, safety | Participant-scoped messaging, notification preferences, push, receipts, block/report/appeal, safe media | Cross-account authorization tests; adult/minor boundary tests; abuse-case tests; device and push tests | Text backend foundations exist; full member UI, push, media, receipts, and safety workflows incomplete |
| 5. Rooms and communities | Rooms, events, rentals | Public/private rooms, invitation/capacity policy, scoped moderator lifecycle, independent backgrounds, rental billing, voice/video, events | Role matrix tests; capacity/race tests; financial reconciliation; moderation and load tests | Core room policy/text backend foundations exist; full UX, billing, voice/video, events and lifecycle controls incomplete |
| 6. Brand and adaptive experience | Brand; languages/platforms; backgrounds | MAWADDA identity, Arabic/English/French/Spanish, RTL/LTR, adaptive layouts, owner brand/content and background workflows | Visual/accessibility review at breakpoints; device/platform smoke tests; offline fallback and rollback tests | Brand direction documented; production assets and owner management workflows incomplete |
| 7. Stores and premium | Stores, entitlements, monetization | Owner-managed catalog/pricing/duration, secure purchase verification, premium entitlements, approved premium profile features | Purchase lifecycle, refunds, entitlement expiry/replay, fraud tests; clear paid-promotion disclosure | Not yet complete |
| 8. Owner operations and trust | Super Admin, trust/safety, finance, analytics, incidents | Server-verified owner console, audited actions, registration/settings, brand/background, finance, moderation, appeals, health, backups and incident controls | MFA step-up tests; authorization matrix; audit completeness; recovery and emergency drills | Initial operations foundation exists; full control room incomplete |
| 9. Production readiness | All sections | Real Firebase configuration, age assurance, legal review, security assessment, observability, backups, recovery, accessibility and performance | All release checklist gates evidenced on exact candidate; owner approves merge and separately approves deployment | Blocked; no production approval |

## Approved decisions that must remain visible in implementation

- Product identity is **مودة | MAWADDA**, with the approved Arabic and English taglines and burgundy/champagne-gold anchor palette.
- The official launch background must be bundled locally and used as the stable offline/load-failure fallback. No blank or unrelated fallback. Replacing it requires an owner-approved versioned workflow.
- General app backgrounds must not overwrite independent one-to-one chat or rented-room backgrounds.
- Social links for Facebook, Instagram, WhatsApp, and X remain disabled/hidden until official URLs are supplied and approved.
- The owner identity/content area must support approved multilingual descriptions, controlled copy keys, logo variants, social links, preview, draft, atomic publish, audit history, and rollback.
- Profile requirements include full name, unique username, age, profession, Arab country, region, gender, marital status, bio (maximum 500 characters), interests, and structured goals. Dating/marriage goals are adult-only under the approved policy; self-declared age is not robust age assurance.
- Verified-email reward is 500 coins after every successfully completed eligible 90-day email verification cycle, with a unique cycle ID and atomic exactly-once ledger record.
- Every coin transfer has one transfer ID and linked sender/recipient/platform ledger records. Sender history shows gross debit, fee, recipient ID, and net delivered; recipient history shows net received, sender ID, transfer ID, and timestamp.
- The illustrative 20% commission is not a hardcoded rate; the owner-configured rate and quote snapshot govern the transaction.
- Weekly attendance means seven consecutive days. Ad rewards require disclosed completion conditions and anti-fraud controls; merely opening an ad is insufficient.
- Premium profile options approved for the roadmap include animated frames, styled/animated names, analytics, professional layouts, pinned sections, themes/backgrounds, greeting messages, clearly labeled discovery boosts, and VIP badges/tiers.
- Rooms have independent backgrounds and finances. Moderator powers are scoped and revocable. Room ranking must reflect authentic activity/contribution, not undisclosed paid manipulation.
- Media limits and retention rules must be server-enforced: audio up to 1 minute, video up to 5 minutes, image up to 5 MB, GIF up to 5 MB; chat/room media 4 hours, profile/album images 7 days, avatar/cover 30 days, stories 24 hours. Explain that downloaded copies cannot be remotely guaranteed to disappear.
- Owner authority must be protected by server-side `platformOwner` claims, real MFA/step-up authentication, recent authentication, least privilege, audit and recovery. No plaintext passwords, client-side admin flags, impersonation, or unlogged covert surveillance.
- Cross-platform targets remain Android, iOS/iPadOS, tablets, Windows, macOS, Linux where supported, and modern web browsers. A platform is not declared supported until built and smoke-tested.

## Risk register and release blockers

| Risk | Why it matters | Required mitigation/evidence | State |
|---|---|---|---|
| Placeholder/mismatched Firebase options | Authentication and data may target the wrong or nonexistent project | Verify registered apps and regenerate FlutterFire options for confirmed `mawda-app-2026`; verify every platform | Open blocker |
| Missing dependency lockfiles | Builds may resolve different dependency versions over time | Commit `pubspec.lock` and `functions/package-lock.json`; enforce locked installs | Open blocker |
| Real owner MFA not verified | Unit-level claim checks do not prove Firebase MFA lifecycle semantics | Test real enrollment, challenge, recent auth, recovery and revocation in non-production Firebase | Open blocker |
| Age assurance and minor safety | Self-declared age can be false; dating creates heightened risk | Age assurance, server boundaries, reporting/moderation, legal review | Open blocker |
| Media upload/retention | Unsafe files, access leaks, storage cost and deletion failures | Validated trusted upload pipeline, scoped access, lifecycle jobs, deletion tests | Open blocker |
| Payment and entitlement fraud | Client claims or replay can mint value or benefits | Provider verification, idempotency, refunds, reconciliation, fraud controls | Open blocker |
| Cross-platform assumptions | Web CI does not validate iOS/desktop/mobile UX | Build and smoke-test each target and device class | Open blocker |
| Operations without recovery | Misuse or outage can cause irreversible harm | Audit, backups, restore drills, incident controls and owner recovery | Open blocker |

## Change-control checklist

For every feature or fix, record:
- Constitution section and approved decision(s) addressed.
- User-visible behavior and data model/API/rules affected.
- Threats, privacy impact, abuse cases, and failure modes considered.
- Tests added or updated, including negative and cross-account authorization cases.
- CI, emulator, real-service, device, and platform evidence separately.
- Migration/rollback plan where data or behavior changes.
- Remaining limitations and explicit release blockers.

A green CI run proves only the checks executed by that workflow on that commit. It does not prove production Firebase behavior, real MFA, payment-provider correctness, device UX, legal compliance, or complete product readiness.

## MAWADDA AI workstream (owner-approved direction; not implemented)

Add a dedicated workstream across the platform:

- **AI-1 Technical Support Assistant:** scoped case-based account/app diagnostics, support responses, error triage, owner-granted administrative tools, immutable audit trail, confirmation gates for high-impact actions, and immediate disable.
- **AI-2 Social Characters:** configurable fictional AI characters, dialects/styles/languages, stickers, activity schedules, placements, events, and adult-only social interaction. Persistent AI badge on avatar/cover and profile header, opening a concise AI-identity explanation without repetitive per-message boilerplate. No impersonation, fake human testimonials, fabricated member activity, or false popularity metrics.
- **AI-3 Privacy and Data Governance:** least-privilege, purpose-bound access; case-scoped private-content access only when authorized; no blanket private-chat training; consent/legal review, minimization, retention limits, access logs, and member isolation.
- **AI-4 Adult Safety:** verified 18+ eligibility for social/romantic character interaction; confirmed under-18 accounts blocked from social characters but retain limited technical support/reporting. Age self-declaration alone is insufficient. Romantic warmth is permitted for eligible adults; coercion, dependency tactics, purchase-linked affection, exploitation, and prohibited sexual content are not.
- **AI-5 Link Safety:** members with server-confirmed biometric verification receive a free entitlement to post direct YouTube, Facebook, Instagram, and X/Twitter HTTPS links in one-to-one private chats, public rooms, and rented private rooms. Members without verified biometric status cannot post links. Authorized room owners/moderators retain their room-scoped YouTube, Instagram/Reels, and Facebook permission. Platform Super Admin may post ordinary HTTP/HTTPS links to any domain in direct chats and any room after owner-claim and fresh MFA verification. All decisions are server-side. Shorteners (including t.co until redirect verification exists), unsafe schemes, credentials, deceptive hosts, and obfuscation remain blocked.
- **AI-6 Monetization and Cost:** neutral promotion of real gifts/coins/subscriptions; no fabricated scarcity or emotional pressure. Per-module/character daily and monthly budgets, hard caps, alerts, quotas, and automatic shutdown.
- **AI-7 Owner Control:** global/module/character kill switches; owner-configured permissions, placements, scopes, rates, moderation, schedules, and audit review. AI cannot merge, deploy, or perform destructive/high-impact actions without separate explicit authorization.

| Workstream | Minimum exit evidence | Current status |
|---|---|---|
| AI-1 Technical support | Support-case authorization tests, tool allowlist, high-impact confirmation tests, audit review, prompt-injection and data-exfiltration tests | Approved direction; not implemented |
| AI-2 Characters/events | Character configuration, persistent AI badge on avatar/cover and profile header, badge visibility and accessibility, authentic AI-vs-human activity metrics, adult-only access, moderation and abuse tests | Approved direction; not implemented |
| AI-3 Privacy | Data inventory, purpose/consent/legal review, private-content isolation, retention/deletion, access audit tests | Open blocker |
| AI-4 Age/safety | Reliable age assurance, under-18 denial and support-only exception tests, adult interaction policy and abuse review | Open blocker |
| AI-5 Links | Role-based biometric/member/owner/moderator/Super Admin authorization tests; verified-member YouTube/Facebook/Instagram/X allowlist explicitly includes YouTube; owner/moderator room allowlist remains separate; Firestore rules reject client self-assignment of biometric status; proof that biometric status is server-owned, expiring and revocable; URL normalization and allowlist tests across text/rich surfaces; bypass, redirect, shortener, lookalike, IDN/punycode and revocation tests | Partial backend policy wiring; biometric verification workflow and integration tests remain open |
| AI-6 Cost/commerce | Budget enforcement, hard-stop/alert tests, purchase integrity, anti-coercion review | Not implemented |
| AI-7 Governance | Global/module/character kill switch tests, permission matrix, immutable audit and recovery drills | Not implemented |



### AI identity badge and room-link authorization additions

- Every AI character displays a small, persistent, accessible AI badge on its avatar or cover only. It is a visual marker with no explanatory pop-up and no AI announcements in direct chats, public rooms, or rented private rooms. It must not resemble a human verification badge.
- AI followers, reactions, activity and popularity are separately identified and never represented as human-member metrics.
- Role matrix: members with server-confirmed biometric verification receive a free entitlement to post direct YouTube, Facebook, Instagram, and X/Twitter HTTPS links in DMs, public rooms, and rented private rooms. Unverified members remain blocked. Authorized room owners/moderators retain their room-scoped YouTube, Instagram/Reels, and Facebook permission. Platform Super Admin may post any HTTP/HTTPS URL after owner-claim and fresh MFA verification.
- Backend tests cover owner/moderator authorization, moderator revocation, non-moderator rejection, room scope, URL normalization, IDN/punycode, redirects, shorteners, lookalikes, obfuscation, and rich-preview/caption bypasses.


### Free biometric-verification link entitlement

- The entitlement is free, not a premium purchase, and applies to one-to-one private chats, public-room chats, and rented-private-room chats.
- The trusted backend grants it only when the server-owned `biometricVerification` record has `status === "verified"`, a valid future `expiresAt` timestamp, and no `revokedAt`; a bare verified status fails closed and clients cannot set this field.
- Pending, failed, expired, or revoked verification does not qualify. Revocation/expiry must immediately remove the entitlement.
- Allowed direct destinations: YouTube, Facebook, Instagram, and X/Twitter official domains (including youtu.be and youtube-nocookie.com). Shorteners including `t.co` remain blocked until safe redirect verification is implemented.
- The biometric verification workflow itself remains a separate implementation and release gate; the link-policy wiring does not prove that biometric verification is already available.


## Member profile social links (owner-approved addition)

- A member with active, server-confirmed biometric verification may publish optional personal Instagram, X/Twitter, Facebook, and WhatsApp links on their profile wall.
- Links are individually optional, explicitly saved by the member, editable/removable/individually hideable, and visible to profile visitors only when the profile visibility policy allows.
- Backend accepts normalized HTTPS URLs only on each service's approved official domains; reject malformed/deceptive hosts, unsafe schemes, credentials, and shorteners. Do not infer or expose phone numbers.
- Expired/revoked/inactive biometric verification must immediately hide links from visitors and block publishing/editing until reverified. Client writes cannot grant eligibility.
- Tests: all four providers, valid/invalid hostnames, URL normalization, per-link privacy, profile visibility, cross-account reads, status expiry/revocation, and attempts to forge verification status.

## Super Admin wallet controls and coin forfeiture (owner-approved addition)

- Owner-only trusted backend controls: global and per-operation pause/resume for top-ups/purchases, coin crediting, transfers, refunds/redemptions/withdrawals where supported, rewards, and administrative adjustments; plus member-level operation restrictions.
- A freeze must be enforced by every relevant callable/transaction boundary and must account for in-flight provider callbacks and transactions.
- Fraud suspicion defaults to reversible hold/freeze and investigation. A documented, substantiated violation may justify partial or full coin forfeiture; suspicion alone is not sufficient for irreversible confiscation.
- High-impact actions require fresh MFA/step-up, explicit target and operation, mandatory reason/case, pre-action impact preview, separate confirmation, idempotency, and append-only audit.
- Adjustments use atomic double-entry postings (member debit and platform treasury/forfeiture credit), unique adjustment ID, actor/target IDs, amount, reason, timestamp, before/after balances, and linked transaction/payment IDs. Never rewrite history, allow negative balances, or equate coin forfeiture with a real-money refund.
- Member notice and appeal/review, lawful investigation exceptions, provider reconciliation, compensating reversal transactions, and alerts for bulk/unusual deductions are required.
- No moderator, support agent, AI, or client role may call these controls.
- Tests: each freeze switch, already-open sessions, racing/in-flight transactions, payment callbacks, per-member restrictions, unauthorized callers, MFA freshness, missing reason, duplicate idempotency, partial/full forfeiture, insufficient balance, immutable ledger, reversal, appeal/audit completeness.


## Real email verification and external account ownership (approved requirements)

- Registration sends a genuine, single-use, expiring email action link to the submitted address. The trusted auth provider's verified state is authoritative; client flags cannot grant verification.
- Pending screen instructs members to check Inbox and Spam/Junk, mark the email important/move it to Inbox/add sender to trusted contacts where supported, and offers a rate-limited resend. Do not promise inbox placement.
- Successful action link returns through a validated app/deep link to profile completion. Expired/reused links fail safely. The recurring 500-coin reward is server-side and atomic with each successfully completed eligible 90-day verification cycle.
- Configure sender-domain SPF/DKIM/DMARC and monitor deliverability; never log action codes or put reusable secrets in links.
- Instagram/Facebook/X public profile connection badges require official provider OAuth and backend validation of provider account subject ID; use state + PKCE where supported, least-privilege scopes, encrypted tokens only when required, revocation/disconnect, and periodic revalidation. Never treat a pasted URL as verified.
- Instagram official API eligibility limitation: Professional Business/Creator accounts only; ordinary personal accounts must not be shown as OAuth-verified if provider API does not support them.
- WhatsApp consumer accounts have no general consumer OAuth identity flow equivalent to the other providers. Verify phone-number control with a one-time code via an approved SMS/voice or officially supported WhatsApp route, then create a wa.me contact link. Label as phone-number verified, not WhatsApp OAuth connected. WhatsApp Business onboarding is a separate business integration.
- Tests: expired/replayed email links, wrong-address redemption, resend abuse, enumeration resistance, unverified reward denial, app-link tampering, OAuth state/PKCE mismatch, wrong provider subject, token leakage, revoked/disconnected accounts, provider scope minimization, Instagram personal-account ineligibility, and WhatsApp phone-number verification.


## High-assurance biometric verification, 1,500-coin reward, and entitlements (approved)

**Requirement status:** Approved product/security requirement; not evidence of implementation. The biometric capture, provider integration, identity proofing, liveness/PAD, reward, and entitlement workflows remain release-blocking until implemented and tested.

- The 1,500-coin biometric reward is separate from the 500-coin email reward. It is issued after every successfully completed eligible 30-day biometric verification cycle, only after the trusted backend confirms final approval at the required assurance level, and exactly once per cycle through an idempotent atomic ledger transaction.
- A selfie video (3–5 seconds) and voice liveness challenge (about 20 seconds) are possible supporting liveness signals, not sufficient identity proof by themselves. Where the product claims a real verified identity, use a qualified identity-proofing provider appropriate to the market, such as accepted identity-document validation plus live-face match.
- Require randomized, session-bound liveness challenges and independently validated presentation-attack detection against printed photos, display replays, prerecorded video/audio, masks, face swaps, deepfakes, synthetic media, virtual cameras, injected streams, and replayed sessions.
- The trusted backend verifies signed provider callbacks or authenticated server-to-server results, session nonce, UID binding, provider transaction, assurance level, timestamps, expiry, and revocation. Client-provided verification booleans/files/status fields never grant approval.
- Bind each result to one Mawadda UID; prevent cross-account reuse, replay, duplicate reward farming, and transfer of status. Prefer provider-supported privacy-preserving duplicate/fraud signals; do not create an unrestricted biometric identity database.
- Maintain server-owned verification status and metadata (verifiedAt, expiresAt, revokedAt, provider reference, assurance level, policy version). Expiry/revocation immediately removes badge, profile-link eligibility, and chat/room link entitlements at backend and public-read boundaries.
- Define validity duration, renewal and risk-triggered re-check policy, rate limits, safe failure behavior, manual appeal/review, and provider-outage handling. Automated risk scores alone must not create permanent fraud labels.
- Complete DPIA and jurisdiction-specific legal review before biometric collection, including GDPR special-category data requirements where applicable. Obtain explicit consent where legally required, explain processing/retention/provider/rights, minimize raw media and template retention, encrypt transfers/storage, restrict and audit staff access, prohibit unrelated use or model training, and implement deletion/withdrawal workflows.
- The badge must state only the assurance actually completed; liveness alone must not be represented as government-ID or identity verification.
- Required release tests include spoof/replay/deepfake/injection, nonce/session/provider signature validation, wrong UID, duplicate-account reward farming, webhook forgery, expiry/revocation/cache invalidation, account recovery, false-reject appeal, data deletion, staff access audit, and exactly-once 1,500-coin ledger posting.



## Recurring verification leases and registration notices (approved; implementation pending)

- Email ownership proof expires 90 days after the server-confirmed successful verification. Renew using a fresh single-use expiring action link. A changed address requires verification of the new address. Store server-owned emailVerificationStatus, emailVerifiedAt, emailVerificationExpiresAt, and renewal history; do not treat a historical Firebase/provider emailVerified flag as an indefinitely valid Mawadda lease.
- Biometric identity verification expires 30 days after final server-confirmed approval. All biometric-gated permissions, badge visibility, and related link entitlements are disabled at expiry/revocation until renewed. Basic account access/data are not deleted merely because biometric status expires.
- Server timestamps govern expiry; enforce it in every backend authorization and public-read projection, not only in Flutter UI or cached state.
- Before registration submission, display and require acknowledgement of a localized notice: email renewal every 90 days; optional biometric renewal every 30 days to retain biometric-gated permissions; consequences of expiry; biometric data/provider/retention/rights; and recurring 500-coin rewards after each successful 90-day email verification cycle and 1,500-coin rewards after each successful 30-day biometric verification cycle, with each cycle rewarded once only. Obtain separate explicit biometric consent at capture where legally required; biometric verification remains optional for basic registration.
- Show just-in-time notices before first verification and every renewal, then display exact server-calculated expiry date/time after success.
- Send deduplicated in-app reminders at 7, 3, and 1 days before expiry and an expiry notice; email reminders only where appropriate and consented. Include a secure renewal route and handle quiet hours/preferences.
- Email expiry marks the Mawadda email lease as renewal-required and gates only explicitly email-dependent actions/features; do not falsely show it as currently verified. Biometric expiry disables all biometric-gated entitlements immediately. Do not claw back any legitimately earned verification-cycle reward merely because its lease later expires or is revoked.
- The 500-coin email reward is granted after every successfully completed eligible 90-day email verification cycle, and the 1,500-coin biometric reward after every successfully completed eligible 30-day biometric verification cycle. Each cycle has a unique verification-cycle/reward ID and is credited exactly once; replays and repeated attempts in the same cycle cannot earn extra credits.
- **Implementation gap (not release-ready):** current `completeMemberProfile` only grants the initial 500-coin reward at first profile creation using a fixed ledger ID. A server-owned 90-day email lease renewal/finalization flow and per-cycle recurring reward are not yet implemented. No biometric provider/capture workflow or recurring 30-day biometric reward implementation exists. Treat recurring rewards as approved requirements, not live functionality, until server-authoritative cycle IDs, fresh proof, atomic per-cycle credits, and replay/expiry tests are delivered.
- Required tests: exact 90-/30-day server-clock boundaries, timezone/device-clock tampering, renewal link expiry/replay, email change, reminder deduplication/preferences, expiry during active sessions, cache invalidation, all backend permission paths, provider outage, notice acknowledgement/localization/accessibility, and exactly one reward per successful eligible renewal cycle; retries and replays within the same cycle must not create a second reward.

## Sovereign Cloud Operations & Data Lifecycle Center (approved; implementation pending)

- Add an owner-only Super Admin console section for chat-history cleanup, cloud-media cleanup/reconciliation, obsolete-advertising archival/purge, platform maintenance/refresh, storage/database hygiene, and operation history.
- Every destructive action is scoped and preview-first: server-generated dry-run preview with exact target paths/collections, date range, counts, bytes, exclusions, impact, and recoverability; preview ID/hash is bound to execution and expires.
- Require server-verified owner claim, fresh MFA/step-up, typed scope-specific confirmation, reason/ticket, and an additional confirmation for global or irreversible jobs.
- Execute via idempotent resumable background jobs in bounded batches with checkpoints, retries, concurrency controls, pause/cancel where safe, emergency stop, and detailed outcomes; no bulk delete from Flutter or a long-running callable.
- Preserve wallet balances and immutable financial ledgers, transfer/purchase/refund/accounting evidence, security/admin audit logs, auth/recovery evidence, consent/privacy records, required verification evidence, reports/appeals/moderation/legal holds, and active/scheduled advertising. Any exceptional legal deletion uses a separate reviewed workflow.
- Media cleanup must reconcile Firebase Storage objects, Firestore metadata/references, thumbnails/derivatives, temporary uploads, CDN/cache copies, and retention queues. A Firestore delete alone is not proof that cloud bytes are deleted.
- Maintenance/refresh means supported health checks, retention-job retry, storage reconciliation, derived cache/index refresh, and maintenance mode. Do not claim Firebase infrastructure was restarted unless the service supports and confirms it.
- Require backup verification and successful restore drills, quarantine/soft-delete where appropriate, audit of successful/failed/denied/cancelled operations, project/environment guardrails, and a documented runbook.
- **Current state:** approved specification only. Existing Super Admin UI and backend do not yet provide safe bulk chat/media/ad cleanup or a cloud-maintenance job engine. Do not expose active destructive controls or claim this capability is available until release gates pass.

### Cloud operations implementation workstream

| Stage | Deliverable | Acceptance evidence | State |
|---|---|---|---|
| C1 | Inventory data collections, Storage paths, ad assets, retention rules, legal holds and references | Reviewed data map and ownership matrix | Open |
| C2 | Server-side preview API and immutable preview manifest | Scope/hash/expiry/authorization tests | Open |
| C3 | Owner/MFA-gated job queue and bounded worker | Idempotency, retries, pause/cancel, concurrency and project guard tests | Open |
| C4 | Chat cleanup and media reconciliation | Emulator/integration tests, orphan detection, reference consistency | Open |
| C5 | Advertising archival and cleanup | Active/scheduled protection and accounting-retention tests | Open |
| C6 | Quarantine, backup/restore, audit and emergency stop | Restore drill and destructive-operation tabletop exercise | Open |
| C7 | Super Admin console UI and operations history | Device/accessibility tests and owner authorization matrix | Open |
| C8 | Production runbook and staged release | Security/legal review and explicit owner approval | Open |

## Continuous engineering validation and defect-response loop

- The validation workflow runs on every push to `main` and the dedicated development branch `codex/mawda-full-platform-implementation`, on pull-request updates targeting `main`, and on manual dispatch.
- Each run validates Flutter analysis, Flutter tests, and the release web build, plus Cloud Functions compilation/unit tests and Firestore/Storage emulator rules tests.
- Superseded runs for the same concurrency group may be cancelled so the newest commit receives the relevant validation; each job has a bounded timeout.
- A red or cancelled check is a development blocker: inspect the failing job and logs, reproduce the issue, fix it on the development branch, add or update a regression test, push the correction, and wait for a green run on the corrected head before marking the item complete.
- Security-sensitive, financial, identity, privacy, data-deletion, and authorization changes require focused negative/abuse tests in addition to happy-path tests. A green CI run is necessary but not sufficient for production readiness.
- Do not auto-merge, auto-deploy, or automatically perform destructive remediation after a failed check. Human review and explicit owner approval remain required for merge, deployment, and high-impact operations.
- Daily project monitoring is a separate reporting mechanism; it does not perform code changes or imply a continuously running developer. Engineering work is performed in explicit, traceable sessions and commits.
- **Current state:** push-triggered development validation has been configured in `.github/workflows/validate.yml`. Confirm the resulting GitHub Actions run on the new workflow commit and maintain green checks on every subsequent head; do not claim successful execution until GitHub reports it.


## Firebase production configuration guard — 12 November 2026

- Added `functions/scripts/validate-firebase-config.cjs` as a reusable fail-closed validator for the Firebase CLI project alias and registered FlutterFire Web app identity.
- The Hosting deployment workflow invokes this validator before installing the Firebase CLI or attempting deployment. It checks the approved project ID and the known registered Web App ID, and rejects missing/placeholder Web configuration fields without printing credential values.
- Added Node tests for matching configuration, CLI/project mismatch, FlutterFire project mismatch, wrong Web App ID, placeholder credentials, and missing/malformed options.
- **Status:** implemented on the development branch; automated CI validation is pending on the new head. This does not repair the placeholder configuration itself and does not authorize or perform a deployment.
