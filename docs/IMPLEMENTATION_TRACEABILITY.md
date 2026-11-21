# Mawadda Constitution-to-Delivery Traceability

> **NOM-001 terminology note — 2026-11-21:** User-visible currency wording in this document is normalized to BetaCoins / بيتاكوينز. Technical identifiers, API fields, ledger keys, and historical schema names are intentionally preserved.

**Status:** Active engineering control document  
**Product authority:** `docs/MAWADDA_PRODUCT_CONSTITUTION.md`  
**Experience authority:** `docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md`  
**Release gate:** `docs/RELEASE_READINESS_CHECKLIST.md`

This matrix connects approved product decisions to implementation phases and objective release evidence. It is not a claim that roadmap items are complete. Update it whenever a requirement, implementation, test, risk, or release decision changes.

## Non-negotiable delivery rules
- BetaCoins transfers must reject new transactions when either account is suspended, banned, or has an unknown explicit status; preserve atomic ledger writes and idempotent replay.
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
| 1. Build reproducibility | Engineering and CI | Pinned toolchains, committed Flutter/npm lockfiles, deterministic dependency install, analysis/tests/build gates | Clean reproducible CI on exact commit; lockfile-enforced install | Both lockfiles are committed and CI now consumes them strictly with Flutter `--enforce-lockfile` and `npm ci`; full run 43253865808 passed on the lockfile-bearing head |
| 2. Identity and account lifecycle | Accounts, registration, profiles; owner access | Firebase environment separation, auth flows, verification, recovery, owner bootstrap/MFA, profile privacy and validation | Non-production Firebase integration tests; MFA enrollment/challenge/recovery/revocation tests; physical-device UX | Non-production is the default target; production is a separate explicit build target. Android/iOS/Web production and non-production options and native scaffolding are present, and CI validates committed non-production options. Real Auth/email delivery, guest anti-abuse, owner MFA provisioning/recovery, App Check, independent Console review and physical-device acceptance remain open. The 1,500 BetaCoins reward is approved after explicit Super Owner evidence review; no device cryptographic proof/attestation is required. The full private evidence, owner decision, atomic reward and renewal lifecycle remains incomplete. |
| 3. Wallet and financial integrity | Wallet, transfers, rewards, stores | Atomic transfers, two-sided linked ledger, configurable fee snapshots, idempotency, purchase verification, reconciliation | Concurrency/replay/failure tests; both parties' histories; verified payment/refund/reconciliation tests | Atomic transfers and wallet ledger UI are implemented. BetaCoins-funded purchase/ledger/entitlement backend exists with idempotency and stale-price protection. Active VIP and profile-title entitlements now have profile consumers; the owner may explicitly enable only those two categories. All other categories fail closed at the server purchase gate. Top-ups, refunds, recurring rewards and full reconciliation remain incomplete |
| 4. Member communication and safety | Messaging, notifications, social content, safety | Participant-scoped messaging, notification preferences, push, receipts, block/report/appeal, safe media | Cross-account authorization tests; adult/minor boundary tests; abuse-case tests; device and push tests | Direct-chat composer/history now has a participant-scoped read cursor and per-message peer-read status; room text chat connects to trusted callables. Owner silent review has a bounded member conversation list and read-only message view, and deliberately does not call the member read-receipt endpoint. Room moderation has owner/platform-owner member listing, scoped permission assignment/revocation, temporary mute enforcement and member removal with audit records. Push, media, delivery receipts, block/report/appeal, complete review coverage and device abuse tests remain incomplete |
| 5. Rooms and communities | Rooms, events, rentals and event-seat reservations | Public/private rooms, invitation/capacity policy, scoped moderator lifecycle, independent backgrounds, rental billing, voice/video, events, capacity-limited RSVP and cancellation | Role matrix tests; room/event capacity race tests; idempotent RSVP/cancellation; financial reconciliation; moderation and load tests | Authenticated discovery/join, owner creation, moderator management, permission revocation, temporary mute and member removal now have Flutter/backend paths. Private invitations and age-audience enforcement exist. Event RSVP now has an event-specific seat cap bounded by room capacity, atomic full-capacity rejection, duplicate-safe registration and cancellation before event start; Flutter UI exposes seat counts/full state/cancel. Exact-head emulator validation pending. Room backgrounds, room rental billing, moderator pagination, leave/transfer ownership, voice/video, realtime synchronization and device/load tests remain open |
| 6. Brand and adaptive experience | Brand; languages/platforms; backgrounds | MAWADDA identity, Arabic/English/French/Spanish, RTL/LTR, adaptive layouts, owner brand/content and background workflows | Visual/accessibility review at breakpoints; device/platform smoke tests; offline fallback and rollback tests | Brand direction documented; production assets and owner management workflows incomplete |
| 7. Stores and premium | Stores, entitlements, monetization | Owner-managed catalog/pricing/duration, secure purchase verification, premium entitlements, approved premium profile features | Purchase lifecycle, refunds, entitlement expiry/replay, fraud tests; clear paid-promotion disclosure | Owner catalog management and member catalog UI are implemented. Atomic BetaCoins purchase, ledger and entitlement foundations are implemented with idempotency and stale-price checks. Active VIP badges and active profile titles are projected into member profiles; only VIP/title catalog items can be explicitly enabled by the owner. Avatar frames, animated/colored names, analytics, pinned layouts, boosts, themes, greetings, `hide-coins` and ghost-mode consumers remain disabled. Real-money top-ups, refunds and reconciliation remain open |
| 8. Owner operations and trust | Super Owner, trust/safety, finance, analytics, incidents | Server-verified owner console, audited actions, registration/settings, brand/background, finance, moderation, appeals, health, backups and incident controls | MFA step-up tests; authorization matrix; audit completeness; recovery and emergency drills | Owner console includes metrics, registration, member access, audited transfer settings, room creation, catalog management, attendance reward policy, and platform-managed timed-ad campaign controls. The reward center and locked ad viewer are now linked from the member experience. BetaCoins adjustment/forfeiture, full trust/safety, analytics, backup/restore and cloud-operations engine remain open; owner claim/MFA provisioning remains required |
| 9. Production readiness | All sections | Real Firebase configuration, age assurance, legal review, security assessment, observability, backups, recovery, accessibility and performance | All release checklist gates evidenced on exact candidate; owner approves merge and separately approves deployment | Blocked; no production approval |

## Approved decisions that must remain visible in implementation

- Product identity is **مودة | MAWADDA**, with the approved Arabic and English taglines and burgundy/champagne-gold anchor palette.
- The official launch background must be bundled locally and used as the stable offline/load-failure fallback. No blank or unrelated fallback. Replacing it requires an owner-approved versioned workflow.
- General app backgrounds must not overwrite independent one-to-one chat or rented-room backgrounds.
- Social links for Facebook, Instagram, WhatsApp, and X remain disabled/hidden until official URLs are supplied and approved.
- The owner identity/content area must support approved multilingual descriptions, controlled copy keys, logo variants, social links, preview, draft, atomic publish, audit history, and rollback.
- Profile requirements include full name, unique username, age, profession, Arab country, region, gender, marital status, bio (maximum 500 characters), interests, and structured goals. Dating/marriage goals are adult-only under the approved policy; self-declared age is not robust age assurance.
- Verified-email reward is 500 BetaCoins after every successfully completed eligible 90-day email verification cycle, with a unique cycle ID and atomic exactly-once ledger record.
- Every BetaCoins transfer has one transfer ID and linked sender/recipient/platform ledger records. Sender history shows gross debit, fee, recipient ID, and net delivered; recipient history shows net received, sender ID, transfer ID, and timestamp.
- Implemented a Flutter wallet screen backed by the member-scoped `walletLedger` stream and own-user balance document. It displays signed debit/credit amounts, transfer identifiers, related member IDs, timestamps, sender-side fee/net details, and store purchase references. Analysis, tests and web build passed in run `43256395065`; real-device verification remains open.
- Added authenticated room discovery through `listMemberRooms`, age-audience filtering, joined/public room separation, join action, and owner-only room creation UI. Backend compile/unit and emulator tests plus Flutter analysis/tests/web build passed in run `43256395065`; runtime Firestore data/index behavior and device tests remain open.
- Added a one-to-one direct-chat screen with message history, composer, refresh, and safe empty-conversation behavior. Server derives the deterministic conversation ID from the authenticated member and peer UID; send/read remain callable-authorized. Direct-chat helper tests, Functions compilation/unit tests, Flutter analysis/tests, and web build passed in run `43254314464`; full callable integration and device tests remain open.
- Replaced hardcoded shop sample items with a server-projected catalog and owner-managed catalog editor. Added an atomic BetaCoins purchase transaction (balance debit, immutable ledger entry, purchase receipt and entitlement), idempotency and expiry handling, plus a stale-price confirmation guard. The UI enables purchase only when both `purchaseEnabled` and `fulfillmentReady` are true. Server projection and the purchase callable independently enforce that only the implemented VIP and title categories can be purchased; all other catalog categories remain non-purchasable even if stored flags are tampered with. The owner explicitly controls activation of VIP/title items. Real-money top-up is not implemented.
- The illustrative 20% commission is not a hardcoded rate; the owner-configured rate and quote snapshot govern the transaction.
- Weekly attendance means seven consecutive days. Ad rewards require disclosed completion conditions and anti-fraud controls; merely opening an ad is insufficient.
- Attendance rewards now have server-owned hourly, daily and ISO-week period keys in UTC, owner-controlled policy, disabled/zero production defaults, atomic wallet credits, immutable per-period claim records and replay protection. Emulator integration covers concurrent duplicate claims and wallet-ledger reconciliation.
- Platform-managed timed advertisements now have owner-only draft/publish/pause/archive controls, budgets and per-member caps, member eligibility checks, one active session per member, sequential foreground/visibility heartbeats, bounded heartbeat gaps, server-accumulated viewing time, idempotent reward claims and wallet ledger credits. Opening an ad or running a client timer alone cannot earn a reward.
- Owner-uploaded ad images/GIFs/videos use the existing private quarantine, MIME/signature validation and malware-scan pipeline. Campaigns may bind only owner-owned, security-approved creative assets; member delivery is a short-lived signed URL for the exact safe derivative and requires an active session. Image/GIF viewing is wired into the locked viewer. Video uploads are accepted but video campaigns cannot be published until in-app video playback and real-device lifecycle tests are complete.
- No external advertising provider is connected. Platform-managed campaigns remain independent; provider integration remains disabled until a provider is selected, reviewed, configured and tested.
- Premium profile options approved for the roadmap include animated frames, styled/animated names, analytics, professional layouts, pinned sections, themes/backgrounds, greeting messages, clearly labeled discovery boosts, and VIP badges/tiers.
- Rooms have independent backgrounds and finances. Moderator powers are scoped and revocable. Room ranking must reflect authentic activity/contribution, not undisclosed paid manipulation.
- **Current owner-approved media limits (supersede older conflicting values in this document):** images 3 MiB; GIF 3 MiB, maximum 20 seconds and 50 frames; audio 5 MiB and 60 seconds; original video 25 MiB; safe video derivative 15 MiB and maximum 90 seconds; PDF 20 MiB for the pinned owner only. These are hard upper bounds, not free quotas. The central economic engine owns quotas/prices. **Retention:** temporary private-chat mode deletes fully 4 hours after the last server-recorded activity; normal mode retains media 4 hours and text 7 days; important mode retains media 4 hours and text 30 days. Both parties must be informed. Selection/consent ownership remains unresolved; do not activate live deletion or change live retention until approved. Media Saver must re-check server entitlement on every local save and must not extend server retention. Explain that downloaded copies cannot be remotely guaranteed to disappear.
- Owner authority must be protected by server-side `platformOwner` claims, real MFA/step-up authentication, recent authentication, least privilege, audit and recovery. No plaintext passwords, client-side admin flags, impersonation, or unlogged covert surveillance.
- Cross-platform targets remain Android, iOS/iPadOS, tablets, Windows, macOS, Linux where supported, and modern web browsers. A platform is not declared supported until built and smoke-tested.

## Risk register and release blockers

| Risk | Why it matters | Required mitigation/evidence | State |
|---|---|---|---|
| Firebase environment/configuration mismatch | A client or native build could target the wrong Firebase project or bucket | Keep non-production as default; validate Dart options, Android google-services.json and iOS plist; independently reconcile production bucket and Console state | Platform config files are present and non-production config is CI-verified. Production bucket mismatch and independent Console/device acceptance remain open; desktop options are placeholders. |
| Dependency lockfiles | Builds may resolve different dependency versions over time | Commit `pubspec.lock` and `functions/package-lock.json`; enforce locked installs | Both lockfiles committed; locked-install CI passed on run 43253865808 |
| Real owner MFA not verified | Unit-level claim checks do not prove Firebase MFA lifecycle semantics | Test real enrollment, challenge, recent auth, recovery and revocation in non-production Firebase | Open blocker |
| Age assurance and minor safety | Self-declared age can be false; dating creates heightened risk | Age assurance, server boundaries, reporting/moderation, legal review | Open blocker |
| Media upload/retention | Unsafe files, access leaks, storage cost and deletion failures | Validated trusted upload pipeline, scoped access, lifecycle jobs, deletion tests | Open blocker |
| Payment and entitlement fraud | Client claims or replay can mint value or benefits | Provider verification, idempotency, refunds, reconciliation, fraud controls | Open blocker |
| Video ad playback | A locked timed-ad session must not reward a video that never played or was backgrounded | Add an in-app cross-platform video player, lifecycle/visibility tests and device verification before publishing video campaigns | Publish gate enabled |
| Ad provider integration | Unreviewed SDKs or callbacks can leak data or mint rewards | Select provider, legal/economic review, server-side secrets, signed callbacks, replay protection and privacy review | Disabled; no provider connected |
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
- **AI-5 Link Safety:** members with server-confirmed biometric verification receive a free entitlement to post direct YouTube, Facebook, Instagram, and X/Twitter HTTPS links in one-to-one private chats, public rooms, and rented private rooms. Members without verified biometric status cannot post links. Authorized room owners/moderators retain their room-scoped YouTube, Instagram/Reels, and Facebook permission. Super Owner may post ordinary HTTP/HTTPS links to any domain in direct chats and any room after owner-claim and fresh MFA verification. All decisions are server-side. Shorteners (including t.co until redirect verification exists), unsafe schemes, credentials, deceptive hosts, and obfuscation remain blocked.
- **AI-6 Monetization and Cost:** neutral promotion of real gifts/BetaCoins/subscriptions; no fabricated scarcity or emotional pressure. Per-module/character daily and monthly budgets, hard caps, alerts, quotas, and automatic shutdown.
- **AI-7 Owner Control:** global/module/character kill switches; owner-configured permissions, placements, scopes, rates, moderation, schedules, and audit review. AI cannot merge, deploy, or perform destructive/high-impact actions without separate explicit authorization.

| Workstream | Minimum exit evidence | Current status |
|---|---|---|
| AI-1 Technical support | Support-case authorization tests, tool allowlist, high-impact confirmation tests, audit review, prompt-injection and data-exfiltration tests | Approved direction; not implemented |
| AI-2 Characters/events | Character configuration, persistent AI badge on avatar/cover and profile header, badge visibility and accessibility, authentic AI-vs-human activity metrics, adult-only access, moderation and abuse tests | Approved direction; not implemented |
| AI-3 Privacy | Data inventory, purpose/consent/legal review, private-content isolation, retention/deletion, access audit tests | Open blocker |
| AI-4 Age/safety | Reliable age assurance, under-18 denial and support-only exception tests, adult interaction policy and abuse review | Open blocker |
| AI-5 Links | Role-based biometric/member/owner/moderator/Super Owner authorization tests; verified-member YouTube/Facebook/Instagram/X allowlist explicitly includes YouTube; owner/moderator room allowlist remains separate; Firestore rules reject client self-assignment of biometric status; proof that biometric status is server-owned, expiring and revocable; URL normalization and allowlist tests across text/rich surfaces; bypass, redirect, shortener, lookalike, IDN/punycode and revocation tests | Partial backend policy wiring; biometric verification workflow and integration tests remain open |
| AI-6 Cost/commerce | Budget enforcement, hard-stop/alert tests, purchase integrity, anti-coercion review | Not implemented |
| AI-7 Governance | Global/module/character kill switch tests, permission matrix, immutable audit and recovery drills | Not implemented |



### AI identity badge and room-link authorization additions

- Every AI character displays a small, persistent, accessible AI badge on its avatar or cover only. It is a visual marker with no explanatory pop-up and no AI announcements in direct chats, public rooms, or rented private rooms. It must not resemble a human verification badge.
- AI followers, reactions, activity and popularity are separately identified and never represented as human-member metrics.
- Role matrix: members with server-confirmed biometric verification receive a free entitlement to post direct YouTube, Facebook, Instagram, and X/Twitter HTTPS links in DMs, public rooms, and rented private rooms. Unverified members remain blocked. Authorized room owners/moderators retain their room-scoped YouTube, Instagram/Reels, and Facebook permission. Super Owner may post any HTTP/HTTPS URL after owner-claim and fresh MFA verification.
- Backend tests cover owner/moderator authorization, moderator revocation, non-moderator rejection, room scope, URL normalization, IDN/punycode, redirects, shorteners, lookalikes, obfuscation, and rich-preview/caption bypasses.


### Free biometric-verification link entitlement

- The entitlement is free, not a premium purchase, and applies to one-to-one private chats, public-room chats, and rented-private-room chats.
- The trusted backend grants it only when the server-owned `biometricVerification` record has `status === "verified"`, a valid future `expiresAt` timestamp, and no `revokedAt`; a bare verified status fails closed and clients cannot set this field.
- Pending, failed, expired, or revoked verification does not qualify. Revocation/expiry must immediately remove the entitlement.
- Allowed direct destinations: YouTube, Facebook, Instagram, and X/Twitter official domains (including youtu.be and youtube-nocookie.com). Shorteners including `t.co` remain blocked until safe redirect verification is implemented.
- The biometric verification workflow itself remains a separate implementation and release gate; the link-policy wiring does not prove that biometric verification is already available.


## Member profile social links (owner-approved addition)

**Implementation status: partially implemented; end-to-end release validation remains open.**

- Implemented in the trusted Functions layer: authenticated members can save the four optional provider links only when their server-owned biometric verification is active; updates are audited.
- Implemented in profile reads: links are withheld unless the server-side biometric lease is active and the viewer is authorized by profile visibility. The public-profile projection independently revalidates each URL against the official HTTPS host allowlist; malformed legacy values are omitted.
- Added unit coverage for the four provider domains, deceptive/unsafe URLs, malformed stored containers, and defensive revalidation at the public projection boundary.
- Implemented in Flutter: the member can edit/save or clear the four links from their own profile; approved links are displayed in the profile view. The UI reports that new publishing requires active biometric verification, while removal remains available after expiry/revocation.
- Added policy unit tests proving active verification is required to publish and expired/revoked members can still clear their links.
- Still pending: per-link temporary hide controls; callable-level authorization/integration tests and full cross-account/privacy tests; and the actual biometric provider/capture workflow. The biometric workflow is not implemented, so this feature is not yet available to members. Current UI and backend code are foundations, not a launched biometric service.
- Do not treat a pasted URL as provider identity verification or a verified badge. Provider OAuth/WhatsApp OTP identity checks remain separate requirements.

## Super Owner wallet controls and BetaCoins forfeiture (owner-approved addition)

- Owner-only trusted backend controls: global and per-operation pause/resume for top-ups/purchases, BetaCoins crediting, transfers, refunds/redemptions/withdrawals where supported, rewards, and administrative adjustments; plus member-level operation restrictions.
- A freeze must be enforced by every relevant callable/transaction boundary and must account for in-flight provider callbacks and transactions.
- Fraud suspicion defaults to reversible hold/freeze and investigation. A documented, substantiated violation may justify partial or full BetaCoins forfeiture; suspicion alone is not sufficient for irreversible confiscation.
- High-impact mutating actions require fresh MFA/step-up, explicit target and operation, mandatory reason/case, pre-action impact preview, separate confirmation, idempotency, and append-only audit. Read-only owner review follows its separate approved rule: no reason/case prerequisite, but mandatory audit.
- Adjustments use atomic double-entry postings (member debit and platform treasury/forfeiture credit), unique adjustment ID, actor/target IDs, amount, reason, timestamp, before/after balances, and linked transaction/payment IDs. Never rewrite history, allow negative balances, or equate BetaCoins forfeiture with a real-money refund.
- Member notice and appeal/review, lawful investigation exceptions, provider reconciliation, compensating reversal transactions, and alerts for bulk/unusual deductions are required.
- No moderator, support agent, AI, or client role may call these controls.
- Tests: each freeze switch, already-open sessions, racing/in-flight transactions, payment callbacks, per-member restrictions, unauthorized callers, MFA freshness, missing reason, duplicate idempotency, partial/full forfeiture, insufficient balance, immutable ledger, reversal, appeal/audit completeness.


## Real email verification and external account ownership (approved requirements)

- Registration sends a genuine, single-use, expiring email action link to the submitted address. The trusted auth provider's verified state is authoritative; client flags cannot grant verification.
- Pending screen instructs members to check Inbox and Spam/Junk, mark the email important/move it to Inbox/add sender to trusted contacts where supported, and offers a rate-limited resend. Do not promise inbox placement.
- Successful action link returns through a validated app/deep link to profile completion. Expired/reused links fail safely. The recurring 500-BetaCoins reward is server-side and atomic with each successfully completed eligible 90-day verification cycle.
- Configure sender-domain SPF/DKIM/DMARC and monitor deliverability; never log action codes or put reusable secrets in links.
- Instagram/Facebook/X public profile connection badges require official provider OAuth and backend validation of provider account subject ID; use state + PKCE where supported, least-privilege scopes, encrypted tokens only when required, revocation/disconnect, and periodic revalidation. Never treat a pasted URL as verified.
- Instagram official API eligibility limitation: Professional Business/Creator accounts only; ordinary personal accounts must not be shown as OAuth-verified if provider API does not support them.
- WhatsApp consumer accounts have no general consumer OAuth identity flow equivalent to the other providers. Verify phone-number control with a one-time code via an approved SMS/voice or officially supported WhatsApp route, then create a wa.me contact link. Label as phone-number verified, not WhatsApp OAuth connected. WhatsApp Business onboarding is a separate business integration.
- Tests: expired/replayed email links, wrong-address redemption, resend abuse, enumeration resistance, unverified reward denial, app-link tampering, OAuth state/PKCE mismatch, wrong provider subject, token leakage, revoked/disconnected accounts, provider scope minimization, Instagram personal-account ineligibility, and WhatsApp phone-number verification.


## Super Owner-reviewed biometric verification, 1,500 BetaCoins reward, and entitlements (BIO-001/BIO-002)

**Requirement status:** Owner-approved policy; implementation and release acceptance remain incomplete. The Super Owner personally reviews the member's submitted evidence and records an explicit accept/reject decision. **That approval alone is sufficient.** No provider/device attestation, Play Integrity, App Attest, challenge-bound cryptographic device proof, automated face/voice matching, or automated classification is a prerequisite or substitute.

- Submission: member reads the pre-approved spoken phrase and submits the recording, plus a private video of 3–5 seconds. The approved phrase set must be owner-controlled and versioned before enablement.
- Gender integrity: the verification flow cannot ask the member to choose or override gender; the reviewed value must match the canonical registration value.
- Decision authority: only the canonical Super Owner can decide, enforced server-side using the owner claim/identity and MFA/session checks. Generic admin roles and client-supplied flags are insufficient.
- Attempts: three attempts total. A rejected attempt is followed by a one-calendar-month wait. A third rejection permanently closes that file; no fourth attempt or extra three-month lockout.
- Reward: acceptance activates the verified status and immediately grants **1,500 BetaCoins** exactly once through the central economy ledger. Status transition and ledger credit must be atomic and idempotent. Biometric renewal is every one calendar month from the approval date, independently of email's 90-day cycle.
- Entitlements: verified-link publishing and related benefits are derived only from server-owned active verification status with a valid expiry and no revocation. Expiry/revocation disables dependent benefits; it does not claw back a legitimately earned reward.
- Privacy/security: private evidence storage and delivery, least-privilege access, explicit notice/consent where legally required, audit of every access and decision, retention/deletion, server-side authorization, request/member binding, replay prevention and duplicate-grant protection remain mandatory.
- Required tests: Super Owner allow/deny and non-owner denial; evidence privacy and cross-member isolation; canonical gender mismatch; three-attempt/calendar-month transitions; third-rejection closure; atomic exactly-once 1,500 BetaCoins grant; duplicate/replay/concurrency; expiry/renewal/revocation/deletion; Firestore/Storage rules and end-to-end integration.
- Implementation status: the full member submission, private evidence, Super Owner review, authoritative decision, atomic reward, renewal and deletion lifecycle is not yet demonstrated as complete on the canonical development HEAD. Keep the feature fail-closed until these paths and tests pass.

Canonical detailed policy: `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md`. BIO-002 supersedes older requirements in this document or source branches that require cryptographic device proof, provider/device attestation, Play Integrity, App Attest, or automated biometric scoring as an approval gate.

## Recurring verification leases and registration notices (approved; implementation pending)

- Email ownership proof expires 90 days after the server-confirmed successful verification. Renew using a fresh single-use expiring action link. A changed address requires verification of the new address. Store server-owned emailVerificationStatus, emailVerifiedAt, emailVerificationExpiresAt, and renewal history; do not treat a historical Firebase/provider emailVerified flag as an indefinitely valid Mawadda lease.
- Biometric verification expires one calendar month after the Super Owner's final approval. All biometric-gated permissions, badge visibility, and related link entitlements are disabled at expiry/revocation until renewed. Basic account access/data are not deleted merely because biometric status expires.
- Server timestamps govern expiry; enforce it in every backend authorization and public-read projection, not only in Flutter UI or cached state.
- Before registration submission, display and require acknowledgement of a localized notice: email renewal every 90 days; optional biometric renewal every one calendar month to retain biometric-gated permissions; consequences of expiry; and biometric data/provider/retention/rights. The 500-BetaCoins email reward is recurring after each successful eligible 90-day email verification cycle. The 1,500 BetaCoins biometric reward is approved after the Super Owner personally reviews and explicitly accepts the evidence, once per eligible one-calendar-month cycle. No cryptographic device proof or attestation is required. Do not present the reward as currently earnable until the secure Super Owner review and atomic ledger workflow is implemented and tested. Obtain separate explicit biometric consent at capture where legally required; biometric verification remains optional for basic registration.
- Show just-in-time notices before first verification and every renewal, then display exact server-calculated expiry date/time after success.
- Send deduplicated in-app reminders at 7, 3, and 1 days before expiry and an expiry notice; email reminders only where appropriate and consented. Include a secure renewal route and handle quiet hours/preferences.
- Email expiry marks the Mawadda email lease as renewal-required and gates only explicitly email-dependent actions/features; do not falsely show it as currently verified. Biometric expiry disables all biometric-gated entitlements immediately. Do not claw back any legitimately earned verification-cycle reward merely because its lease later expires or is revoked.
- The 500-BetaCoins email reward is granted after every successfully completed eligible 90-day email verification cycle, and the 1,500-BetaCoins biometric reward after every successfully completed eligible one-calendar-month biometric verification cycle. Each cycle has a unique verification-cycle/reward ID and is credited exactly once; replays and repeated attempts in the same cycle cannot earn extra credits.
- **Implementation gap (not release-ready):** current `completeMemberProfile` only grants the initial 500-BetaCoins reward at first profile creation using a fixed ledger ID. A server-owned 90-day email lease renewal/finalization flow and per-cycle recurring reward are not yet implemented. The Super Owner-reviewed evidence submission/review lifecycle and recurring one-calendar-month biometric reward implementation are not yet complete. Treat recurring rewards as approved requirements, not live functionality, until server-authoritative cycle IDs, fresh proof, atomic per-cycle credits, and replay/expiry tests are delivered.
- Required tests: exact 90-day email and one-calendar-month biometric server-clock boundaries, timezone/device-clock tampering, renewal link expiry/replay, email change, reminder deduplication/preferences, expiry during active sessions, cache invalidation, all backend permission paths, provider outage, notice acknowledgement/localization/accessibility, and exactly one reward per successful eligible renewal cycle; retries and replays within the same cycle must not create a second reward.

## Sovereign Cloud Operations & Data Lifecycle Center (approved; implementation pending)

- Add an owner-only Super Owner console section for chat-history cleanup, cloud-media cleanup/reconciliation, obsolete-advertising archival/purge, platform maintenance/refresh, storage/database hygiene, and operation history.
- Every destructive action is scoped and preview-first: server-generated dry-run preview with exact target paths/collections, date range, counts, bytes, exclusions, impact, and recoverability; preview ID/hash is bound to execution and expires.
- Require server-verified owner claim, fresh MFA/step-up, typed scope-specific confirmation, reason/ticket, and an additional confirmation for global or irreversible jobs.
- Execute via idempotent resumable background jobs in bounded batches with checkpoints, retries, concurrency controls, pause/cancel where safe, emergency stop, and detailed outcomes; no bulk delete from Flutter or a long-running callable.
- Preserve wallet balances and immutable financial ledgers, transfer/purchase/refund/accounting evidence, security/admin audit logs, auth/recovery evidence, consent/privacy records, required verification evidence, reports/appeals/moderation/legal holds, and active/scheduled advertising. Any exceptional legal deletion uses a separate reviewed workflow.
- Media cleanup must reconcile Firebase Storage objects, Firestore metadata/references, thumbnails/derivatives, temporary uploads, CDN/cache copies, and retention queues. A Firestore delete alone is not proof that cloud bytes are deleted.
- Maintenance/refresh means supported health checks, retention-job retry, storage reconciliation, derived cache/index refresh, and maintenance mode. Do not claim Firebase infrastructure was restarted unless the service supports and confirms it.
- Require backup verification and successful restore drills, quarantine/soft-delete where appropriate, audit of successful/failed/denied/cancelled operations, project/environment guardrails, and a documented runbook.
- **Current state:** approved specification only. Existing Super Owner UI and backend do not yet provide safe bulk chat/media/ad cleanup or a cloud-maintenance job engine. Do not expose active destructive controls or claim this capability is available until release gates pass.

### Cloud operations implementation workstream

| Stage | Deliverable | Acceptance evidence | State |
|---|---|---|---|
| C1 | Inventory data collections, Storage paths, ad assets, retention rules, legal holds and references | Reviewed data map and ownership matrix | Open |
| C2 | Server-side preview API and immutable preview manifest | Scope/hash/expiry/authorization tests | Open |
| C3 | Owner/MFA-gated job queue and bounded worker | Idempotency, retries, pause/cancel, concurrency and project guard tests | Open |
| C4 | Chat cleanup and media reconciliation | Emulator/integration tests, orphan detection, reference consistency | Open |
| C5 | Advertising archival and cleanup | Active/scheduled protection and accounting-retention tests | Open |
| C6 | Quarantine, backup/restore, audit and emergency stop | Restore drill and destructive-operation tabletop exercise | Open |
| C7 | Super Owner console UI and operations history | Device/accessibility tests and owner authorization matrix | Open |
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
- Historical note (12 November snapshot): the then-existing Hosting workflow invoked this validator before deployment. That workflow was removed on 15 November. The current native workflow uses only committed non-production configuration and does not invoke Firebase CLI/FlutterFire CLI or use FIREBASE_TOKEN.
- Added Node tests for matching configuration, CLI/project mismatch, FlutterFire project mismatch, wrong Web App ID, placeholder credentials, and missing/malformed options.
- **Status:** latest validated development snapshot `70617a0a61b4458a19eddc7992129905f96852f0` passed GitHub Actions run `43269355123`: strict lockfile installs, Flutter analysis/tests/Web release build, Cloud Functions compilation/unit tests, and Firestore/Storage emulator tests all succeeded. This validates that exact PR snapshot, not production Firebase configuration, external provider integrations, or deployment. No merge or production deployment was performed.


## Sole-owner review authority and privacy acknowledgement (approved; partial implementation)

- Constitution authority: Sections 5.3 and 7.1.
- Product scope: owner-only silent and announced review of any available one-to-one conversation (active or ended) and member/guest files; no report/case is required as a product-level precondition.
- Silent mode must not emit participant notifications, alter read receipts/read state, presence, typing indicators, or message/file content. Announced mode displays an administrative notice chosen by the owner.
- Owner participation labels: “إدارة منصة مودة”, “Super Owner”, or “مجهول”. Anonymous is a display alias only; backend identity and message provenance remain bound to the sole owner's UID. Impersonation of member accounts is prohibited.
- Privacy policy acknowledgement is required before registration submission and before guest-session issuance or protected guest/member content access. Store policy version/hash, locale, server timestamp, actor type, UID or pseudonymous guest session, app version, and event. Material policy changes trigger renewed acknowledgement where required.
- Backend must enforce owner-only access using server-managed platformOwner claims, recent authentication and fresh MFA/step-up; append-only tamper-evident logs capture successful and failed attempts, targets, data categories, mode, timestamps, outcomes, and actor UID. A reason/case is optional audit context, not a product-level access prerequisite.
- Announced review now publishes the owner's explicit notice as a separate administrative message to both participants, sends generic notifications without exposing message content in the notification preview, visibly labels the notice, and binds subsequent announced-history review to the exact owner-authored notice ID. The action is idempotent and writes request/result events to the hash chain.
- The backend now provides owner-only member conversation discovery (metadata only) and one-to-one message review. Both require the sole owner claim and recent MFA; successful list/review operations are audited before message content is read. Review is explicitly read-only and silent, with no reason/case prerequisite; an optional reason is audit context only. The Flutter owner console exposes member conversation listing and a read-only review dialog. Cursor-based pagination has now been added to both member conversation discovery and message history, with per-page audit records and cursor scope validation. Remaining gaps: guest files, member file review, comprehensive no-read-state-side-effect tests, external audit-chain anchoring and verification beyond 5,000 events, and legal/DPIA review.
- **Current status: partial implementation, not release-ready.** Member direct-conversation metadata discovery and bounded one-to-one message review are owner-only and require a recent MFA session. The Flutter owner console exposes the review. Authenticated non-owner/MFA denials are recorded; successful review/list attempts create server-side audit entries before message data is returned. Still open: guest files, member file review, comprehensive denied/failure audit coverage, external audit-chain anchoring and verification beyond 5,000 events, explicit no-read-state-side-effect tests, and legal/DPIA review. The three owner participation labels remain separate from announced review mode, which now has its own notice-and-review workflow.
- Release gates must include cross-account denial, non-owner denial, stale/MFA failure, silent-mode no-side-effect assertions, anonymous-label/true-actor audit binding, file URL leakage prevention, guest acknowledgement bypass prevention, policy-version re-acknowledgement, audit tamper resistance, and jurisdictional legal approval.



## Owner review pagination hardening — 12 November 2026

- Added bounded cursor pagination to owner member-conversation discovery and one-to-one message history; each request remains capped at 50 records.
- Conversation cursors are validated against the target member's own conversation membership before continuing. Message cursors encode the ordered timestamp/document-ID pair and are applied only to the requested chat's scoped query; the backend does not fetch a cursor message before writing the access audit.
- Every page writes a privileged-access request audit record before querying message documents, then records a separate completion result with the returned count and continuation state before returning message bodies. Audit metadata records target/chat, cursor, returned count, page continuation state, actor UID, auth time and second-factor context; message content is never copied into audit records.
- Flutter owner console now exposes a continuation action for older conversations and older messages while preserving chronological message presentation.
- Added unit coverage for valid/default/invalid cursor inputs, member scoping inputs, and bounded page sizes.
- **Validation state:** implementation is committed to the development branch; the GitHub Actions validation run for the new head must complete successfully before this work is marked tested. No local test run or production deployment is claimed.


## Owner-review hash-chained audit events — 12 November 2026

- Added canonical SHA-256 event hashing with stable recursive key ordering, monotonically increasing sequence numbers, and previous-event hash linkage.
- New owner-review request, result, authenticated-denial, announced-notice, and owner-participation events are appended through Firestore transactions that atomically create the event and advance a separate chain-head document. Owner participation writes its message, notifications, audit event and chain-head update in the same transaction. Transaction retries serialize concurrent events and prevent competing sequence branches.
- Message review writes its access-attempt event before querying message documents; a separate result event records successful page completion. Failed queries remain visible as an access attempt without being falsely marked successful.
- Added unit tests for stable canonical hashes, complete-chain verification, edited-event detection, previous-hash tampering, missing sequence entries, and head mismatch.
- **Scope and limitation:** the chain applies to new owner-review events routed through this helper. Historical audit records are not retroactively chained. The chain head and entries currently reside in the same Firebase project; this detects accidental or partial tampering but is not an independent immutable anchor against a project administrator who can rewrite both. An owner-only verification callable and Super Owner console control now verify the complete chain up to 5,000 events. External signing/anchoring and paged verification beyond 5,000 events remain open release hardening items.
- **Validation state:** owner participation hash-chain integration and announced-review failure-audit handling passed the full CI suite on `1d383176b5242e66da2c3c4b2413e3cc2913f977` in run `43276736215`, including Flutter analysis/tests/Web release build, Cloud Functions compilation/unit tests, and Firestore/Storage emulator tests. This documentation-only update must still pass its own head CI. No local test execution or production deployment is claimed.



## Secure media intake foundation — 13 November 2026

- Added an authenticated, short-lived V4 upload-intent callable scoped to a random object path under the private `quarantine/{uid}/` prefix.
- Added server-side upload finalization that verifies asset ownership, server-reported content type, object generation, actual byte count, per-type size policy, and leading-byte file signature. Mismatched uploads are deleted and recorded as rejected.
- Supported initial formats: JPEG, PNG, WebP, MP4, MPEG/MP4/OGG/WAV audio, and PDF. The allowlist and per-category size caps are covered by unit tests.
- Valid files remain in `pending_security_scan`; signature inspection is format validation, not malware scanning. No member-facing media read path or public Storage rule has been enabled.
- Added sole-owner + recent-MFA callable endpoints for bounded media metadata listing and 60-second attachment-only inspection URLs. Upload intent, validation, owner listing and privileged URL issuance are recorded in `mediaAccessAudit`.
- Firestore rules deny all client access to media metadata and audit collections; Storage rules continue to deny all client reads and writes, including quarantine paths. Emulator regression tests cover these denials.
- **Open before release:** integrate a trusted malware/content scanner and safe image/video/audio processing pipeline; enforce upload size at the signed-upload transport layer rather than only at finalization; add per-account quotas/rate limits and abandoned-upload cleanup; add owner UI; add signed URL leakage/expiry tests, storage emulator/integration tests for callable behavior, and verify the actual production bucket CORS/configuration. Do not set `security_approved` or expose media to members until scanner verdicts are authenticated and tested.
- **Validation:** implementation commits are on the development branch. GitHub Actions validation for the latest branch head must pass before this milestone is called tested. No local tests, production Firebase changes, or deployment are claimed.


## Owner-only member and guest media review — 13 November 2026

- Media upload records now classify the uploader as `guest` only when the verified Firebase Auth token reports `firebase.sign_in_provider === "anonymous"`; all other authenticated providers are classified as `member`. Client-supplied uploader labels are ignored.
- The owner media-list callable now supports bounded status and uploader filters (`all`, `member`, `guest`), cursor pagination, and returns uploader UID/type plus safe metadata only. It does not return file bytes or signed URLs.
- Owner review list and inspection callables require the sole `platformOwner` claim and a recent MFA-authenticated session on the server. Authenticated authorization denials are audited before the callable returns. Invalid listing filters/cursors and inspection failures (invalid ID, missing asset, invalid status, generation mismatch, storage/signing failure) are also recorded. If the audit write fails, the operation fails closed.
- Owner inspection links remain V4 signed read URLs with a 60-second expiry and attachment disposition. No client SDK read permission, public bucket access, or member-facing media URL was introduced.
- Added Firestore composite indexes for status/uploader-type/creation-time owner listing. Added unit tests proving anonymous-provider classification is token-derived and caller-supplied labels cannot self-classify as guest.
- **Guest scope:** this implementation supports guests represented by Firebase Anonymous Authentication. A guest who has no Firebase Auth UID/session cannot upload or be assigned a reviewable media identity yet; a separate trusted guest-session issuance/expiry model is required before such sessions are included. Legacy media records without uploader classification are returned as `legacy_unknown` in the all-items view and are not silently misclassified.
- **Completed in CI:** owner/member/anonymous-guest/stale-MFA callable authorization cases, audit-event assertions, invalid uploader-filter rejection, valid quarantined PNG finalization, and rejection/deletion of a file whose bytes contradict its declared type. The integration suite deliberately imports the media module before Admin initialization to guard against eager initialization regressions.
- **Validation:** full GitHub Actions run `43375143894` passed on commit `7cf6819bca43b07d921b117e9ce6e89443fb9728`: Flutter analysis, Flutter tests, Web release build, locked Functions dependency install, Functions compilation/unit tests, media callable authorization/audit integration tests on Firestore+Storage emulators, and Firestore/Storage rules emulator tests. This is CI evidence for that exact commit, not production/device/security-scanner approval. No production bucket configuration, live data, or deployment was changed.

## Owner media review console — 13 November 2026

- Added owner-console filters for media status and trusted uploader classification (all, member, guest), plus bounded 25-item pagination.
- The console displays metadata only: filename, uploader classification, detected/declared type, size, status and creation time. It does not render signed URLs or media bytes.
- Added Flutter service bindings for the owner-only listing and inspection callables.
- Deliberately withheld an inspect/open action from the UI: signed URLs are bearer credentials, and a safe in-app preview/open handler is not yet integrated. The callable remains available for a future controlled preview flow; the UI does not expose the URL.
- This UI work is on the development branch and requires the current CI run to pass before it is considered validated.

Remaining phase-two closure items:
- Exercise actual signed URL HTTP behavior against the Storage emulator or a dedicated isolated test bucket: successful upload/read, expiry enforcement, generation preconditions, and replay/overwrite attempts. Do not claim single-use semantics; V4 signed URLs remain bearer links until expiry.
- Implement a controlled in-app owner preview handoff that never exposes bearer URLs to logs, analytics, navigation history, or member UI; retain attachment-only behavior unless a safe processing/streaming proxy is implemented.
- Integrate an authenticated trusted malware/content scanner and safe image/video/audio processing pipeline. Keep all media quarantined and do not set `security_approved` or expose member-facing media until a trusted verdict and processing result are verified server-side.
- Define owner-auditable, rate-limited audit retention/export and an owner-approved media retention/deletion schedule; add lifecycle/deletion tests only after the retention period is approved.
- Enforce upload-size limits at the transport boundary, add per-account quotas/rate limits, and test abandoned-upload cleanup.
- Validate real Firebase bucket configuration/CORS and owner MFA lifecycle in a non-production Firebase project; complete device/platform verification.


## Signed media URL lifetime policy — 13 November 2026

- Centralized the V4 signed URL lifetime values in `media-security.ts` and wired both upload-intent and owner-inspection signing to that helper: five minutes for upload and 60 seconds for owner inspection.
- Added unit tests for the exact expiry calculation and invalid clock input.
- **Important bearer-link limitation:** a Cloud Storage V4 signed URL is reusable by anyone who obtains it until it expires (or the underlying object/credentials are invalidated). The current implementation does not provide one-time redemption or replay prevention. The UI therefore continues to withhold preview links; do not describe these links as single-use.
- These tests validate the application expiry values passed to the signer. They do not yet exercise Cloud Storage's actual expiry enforcement, URL leakage, or post-expiry HTTP behavior; those require a Storage integration test.
- Audit retention/export and media retention/deletion remain unconfigured. No automatic deletion schedule has been introduced because the product/legal retention period has not been approved.


## Phase 2 — media security implementation checkpoint (13 November 2026)

- Added a server-side per-UID upload quota reservation in the same Firestore transaction as upload-intent creation. Initial defaults: 5 active intents, 150 MiB active reserved bytes, and 500 MiB reserved per UTC day. Concurrent reservations are transactionally serialized.
- Finalization releases active quota in the same transaction as the asset's transition to `pending_security_scan` or `rejected`. Daily usage is not refunded for rejected or abandoned attempts; the daily window rolls over in UTC.
- Added unit coverage for concurrent count, active-byte, daily-byte, UTC rollover and inconsistent release state; added emulator integration coverage for successful reservation and exhausted concurrent quota.
- These commits are implementation work, not yet validated until the current exact-head CI completes. The existing green baseline remains commit `8438775ffc5a0ec4535d69fbdf3a0a07fc4566d5`, run `43375529010`.
- Still open: real HTTP PUT/GET signed URL behavior against a dedicated non-production GCS bucket (including expiry, create-only replay/overwrite and generation checks); replace the owner inspection bearer URL handoff with an authenticated streaming preview; integrate a trusted malware scanner and isolated content processing; expired-intent cleanup and abandoned-reservation recovery; retention/export/legal-hold policy approval; App Check/MFA lifecycle and real-device verification.
- Do not treat the new quota defaults as owner-approved production policy. Do not enable member delivery or `security_approved` until a trusted scanner verdict and safe processing pipeline are verified. No production Firebase changes, merge, or deployment.


## Phase 2 — secure media hardening update (13 November 2026)

- Upload intents now require a server-recognized media purpose (chat, room, profile_album, avatar_cover, or story) and persist that purpose with the asset. Purpose-specific retention expiry/deletion is deliberately not enabled until the exact retention/legal-hold schedule is owner-approved.
- Signed PUT capabilities now bind the exact reserved byte count using the signed x-goog-content-length-range header (min=max=declaredSizeBytes), while retaining signed content type and ifGenerationMatch=0. The callable returns the exact required headers; clients must send them. Finalization independently compares actual object bytes to the quota reservation and validates generation, content type and signature.
- Raster image/GIF maximum is 5 MiB. GIF processing is bounded by a 100-frame ceiling and a 40-million-pixel aggregate limit before re-encoding to a private WebP derivative capped at 2 MiB. Other categories retain their server-side per-file caps; clean video/audio/PDF files remain scanner_clean_pending_processing and are not member-deliverable until type-aware safe processing exists.
- The isolated ClamAV service lives under scanner/. It requires Cloud Run IAM identity plus a separate high-entropy service token, validates exact bucket/object/generation/content type and the configured callback URL, downloads only over HTTPS without redirects, scans with bounded ClamAV limits, and signs the verdict with HMAC-SHA256. The backend independently hashes the source generation and verifies the safe WebP derivative before security_approved.
- The owner console retrieves safe WebP bytes through a server callable; no Storage URL is exposed. The callable requires sole-owner authorization and recent MFA, audits the request, verifies derivative metadata/generation/hash, and caps response size. Separate HTTP owner preview/attachment routes require App Check; Flutter App Check bootstrap is still a release gate.
- Per-UID upload reservations remain 5 active intents, 150 MiB active reserved bytes and 500 MiB per UTC day. A scheduled 15-minute cleanup removes expired unfinalized quarantine objects using exact-generation preconditions, releases active reservations transactionally and audits completion; a delayed recheck protects against late/in-flight uploads.
- CI run 43378886224 is validating the exact current head; an earlier run 43378461426 exposed a test-only signer credential gap and a ClamAV log-directory permission issue, both addressed in subsequent commits. Do not call this checkpoint green until all jobs complete successfully. Do not call this checkpoint green until all jobs complete successfully. The opt-in real-GCS HTTP script covers exact-size rejection, upload, replay, GET and expiry, but has not been run because a dedicated non-production bucket and credentials are not available in this environment.
- Still open before phase-two exit: deploy and verify the scanner in non-production (including EICAR detection, clean samples, malformed/oversized objects, stale generation, bad HMAC, duplicate callback and retry behavior); execute the real-GCS HTTP test; initialize App Check in Flutter and verify supported platforms; finish safe processing for video/audio/PDF; confirm retention/legal-hold and audit-retention/export policy; test actual bucket CORS, IAM, MFA lifecycle and device flows.
- No production Firebase data, bucket configuration, rules, deployment, merge or destructive retention action was changed or authorized.


## Owner-approved follow-up requirements — 13 November 2026

| Requirement | Required implementation | Current status |
|---|---|---|
| Owner live-stream broadcast | Server-authorized owner-only message type for direct chats, public rooms and active rented private rooms; recent MFA; audited/idempotent delivery; room-owner bypass only for the verified platform owner | Specified in `docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md`; implementation open |
| Split-screen in-app playback | Provider-approved embed adapters; player in upper ~50% while chat remains below; close action; unsupported-source fallback to original URL; no DRM/paywall/geo/login bypass | Specified; Flutter player and provider/device tests open |
| Manual BetaCoins purchase requests | Package/custom quantity request; owner contact/instructions in direct chat; owner records external verification; only owner approval transaction credits BetaCoins with linked ledger/audit/idempotency | Implemented in callable/member/owner UI; package/custom/withdraw/approval/replay emulator tests passed on SHA `5a3b01e`. No payment gateway or automatic issuance |
| Owner live-stream broadcasts | Owner-only HTTPS stream links in owner/member direct chats, active public rooms and active rented private rooms; idempotent audit and no SSRF fetch | Backend callable, URL policy, direct/room message rendering and owner composer implemented; authorization, URL and room lifecycle integration tests passed on SHA `5a3b01e`. Official in-app player and upper/lower split layout remain open |
| Member and owner logout | Firebase signOut, best-effort token unregister, auth-gate return, clear privileged state | Main shell sign-out plus explicit owner-console logout with best-effort push-token unregister are implemented; widget/auth-gate and device verification remain open |

These additions are Phase 1/2 scope only. Phase 3 remains paused pending the owner's separate proposal and approval.


## Owner identity and configurable payment-channel amendment — 13 November 2026

- The Owner and Super Owner labels belong to one human and one canonical owner UID. There must be no second independent owner/Super Owner identity. Internal claims may be aliases, but all privileged operations resolve to the same canonical owner.
- BetaCoins purchase has two independently owner-controlled channels: direct/manual owner contact (the default supported route) and optional automated provider checkout (future, disabled until provider and compliance gates pass).
- Fixed packages may later be assigned to an enabled automated provider. Custom quantities remain negotiated in the member's one-to-one conversation with the owner, who sends payment instructions and approves BetaCoins issuance after external verification.
- The owner controls payment-channel availability and package visibility from the owner console. No client-side success callback, screenshot or unverified webhook can credit BetaCoins.
- Implementation and acceptance are open: canonical owner UID/claim migration audit, owner payment-channel settings UI and callable, manual request/conversation lifecycle, provider adapter/webhook signature/replay/refund/reconciliation tests, and end-to-end issuance gating.
- Automated checkout remains disabled and no provider, bank account, payment contract or credential is assumed to exist.


## Current Firebase/CI reconciliation — 15 November 2026

- The default development Firebase target is mawda-platform-nonprod-2026; production mawda-app-2026 remains an explicit separate target.
- Android, iOS and Web non-production options are committed and checked locally in CI. Current native CI does not register apps or mutate Firebase.
- The old Firebase Hosting deployment workflow is removed. Current development workflows are build/test/validation only; no production deployment is run.
- The actual production Storage bucket remains unresolved because the historical owner-supplied config and current production Flutter options use different bucket suffixes. Do not enable media until the owner independently verifies the real bucket and non-production signed URL/CORS/IAM/deletion tests pass.
- Android/iOS native build validation is separate from physical-device acceptance and release signing.
- The latest evidence and current open gates are tracked in the canonical [Approved Decisions and Traceability Register](MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md) and [Release Readiness Checklist](RELEASE_READINESS_CHECKLIST.md). Historical run IDs above remain historical evidence only.


## Unified owner-approved commercial, retention and rewards workstream — 15 November 2026

Source of truth: [Master Development Charter](MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md), [Product Constitution](MAWADDA_PRODUCT_CONSTITUTION.md), [Product Vision](MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md), and [Approved Decisions Register](MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md).

| Requirement ID | Required engineering surfaces | Required tests/evidence | Status rule |
|---|---|---|---|
| STORE-003 | Catalog schema, owner pricing UI/callables, purchase callable, entitlement model, all store consumers | 24h/7d/30d price matrix, changed-price historical receipt test, quantity/limit, disable, permanent entitlement and future-SKU contract tests | Do not claim complete until every purchasable SKU has a working consumer |
| MEDIA-003 | Media Saver store item, entitlement validation callable, authorized local download/save flow | no entitlement denied; expired entitlement denied; all supported media types; direct/public/private-room access; save does not alter deletion deadline | Paid product remains unavailable until end-to-end tests pass |
| RET-003 | Chat mode model, server activity record, message/media expiry scheduler, deletion/derivative cleanup | temporary inactivity reset and boundary; app close/network disconnect not treated as inactivity; normal 4h/7d; important 4h/30d; retry/idempotency and legal-hold exclusions | Partial; owner reconfirmed important-chat text retention at exactly 30 days (720 hours) on 2026-11-19 and rejected 90 days. Server text worker reads persisted `retentionMode`, applies normal 7d and important 30d boundaries, excludes temporary chats from individual-message deletion, and fails closed on corrupt mode values. Exact-head CI at `2f4aa28be7d915a65fa5f20f64c22668fbf6b1f9` passed both domain regression and full validation workflows, including retention emulator tests. Still open: authoritative mode assignment/participant notices, server activity timestamp updates, consent/selection rule, full temporary conversation + media deletion and derivative reconciliation. Release blocker remains open |
| REWARD-003 | Reward schedule/config model, attendance eligibility service, owner console, wallet grant integration | daily/hourly/weekly boundaries, timezone policy, duplicate prevention, concurrent claims, disable/config change, ledger consistency | Values and schedules are owner-configurable; no client-authoritative grant |
| REWARD-004 | Ad campaign management, media playback evidence protocol, server completion verifier, reward ledger | incomplete/abandoned view, foreground heartbeat, spoofed client timer, replay, duplicate callback, provider signature and campaign pause | No reward before trusted completion evidence |
| OWNER-002 | Grant center UI, owner-only callable, audience snapshot, batch/idempotent grant worker, recipient history, wallet/entitlement integration | single UID, selected group, live public-room snapshot, room collective prize, partial retry, duplicate request, unauthorized moderator/member, audit and ledger | Partial: owner/MFA-only single and bulk free store-entitlement grants are implemented with 24h/7d/30d durations, additive expiry extension, per-target idempotency, immutable grant ledger/audit, partial failure reporting and an owner-console UID-based grant screen. Per-call batches are 500 targets with no overall account/lifetime grant cap. Emulator integration tests added; exact-head CI pending. Still open: free BetaCoins grants, group/room audience snapshots and collective rewards, recipient grant history, recipient notifications and full preview/confirmation of dynamic room/group recipients |
| GOV-002 | Shared commercial configuration and new-product integration interface | CI contract test for SKU registration, no client hardcoded price/duration, owner enable/disable, expiry | Every future product must integrate before release |

### Implementation invariants
- Money and entitlement changes are server-side transactions; use idempotency keys and immutable receipts/audit records.
- A batch grant records intended recipients and final per-recipient result; retries must not duplicate successful grants.
- Presence-targeted room grants use a server-generated membership snapshot at a defined execution timestamp, not a client-provided UID list.
- Changing current prices does not mutate completed purchases.
- Deletion jobs respect legal holds and protected financial/security evidence.
- The owner-only console must show a clear preview before a bulk grant, including room ID, snapshot time and recipient count.

### Current baseline warning
Existing implementation records include mode-aware seven/thirty-day text retention (temporary full-chat deletion remains open), store purchase/entitlement coverage, and partial owner free-entitlement grants. Those do not establish temporary inactivity deletion, Media Saver, the generalized pricing engine, attendance schedules, ad completion verification, free BetaCoins grants or group/room collective grant workflows. Each remains separately tracked until the tests above pass on an identified commit.


## Owner-directed three-stage execution order — 2026-11-16

The detailed delivery rows above remain the complete requirement inventory; they are not replaced or deleted. For execution sequencing, the owner's latest direction establishes three top-level stages:

1. **Stage 1 — complete platform build and engineering readiness (48-hour target):** execute all applicable requirements in this matrix across identity, member lifecycle, social, messaging, rooms/events/reservations, media/retention, wallet/economy/store/rewards, owner/Super Owner, safety, UI/UX, platform targets, and cloud-sync code/contracts. Complete debugging, security remediation, unit/integration/emulator tests, and prepare a coherent candidate SHA. The 48-hour target is for this engineering stage only; do not claim completion where evidence is missing.
2. **Stage 2 — 5,000-persona simulation:** begin only after Stage 1 exit review and candidate SHA freeze. Use the separate simulation repository and record both repository SHAs, scenario, duration, full lifecycle counts, artifacts, and failures. Simulation is intentionally deferred and is not a Stage 1 prerequisite.
3. **Stage 3 — cloud synchronization, registration, deployment and launch:** after Stage 2 acceptance and separate owner authorization, complete live Firebase/Google Cloud synchronization, app/service registration as applicable, production rollout, store submission, and real-user launch. Production changes, billing, main merge, deployment, and identity changes remain separately gated by explicit owner approval.

This sequence supersedes older schedule text in this matrix or linked plans wherever those texts place the 5,000-persona run, live cloud synchronization, or deployment inside Stage 1's 48-hour window. It does not remove any product requirement, approve a new price or policy, or waive a test/security gate.

## Advertising, Media Workspace and member collaboration — owner approval 2026-11-16

Source contract: [Advertising Department & Media Workspace Specification](ADVERTISING_MEDIA_WORKSPACE_SPEC.md). The owner has approved the featured-preview behavior and the Media Workspace entry-point structure. This is an implementation-status record, not a claim that the user-facing subsystem is complete.

| Requirement ID | Required engineering surfaces | Required tests/evidence | Current status |
|---|---|---|---|
| ADS-FEATURED-001 | Separate advertising campaign model and geographic targeting; Owner-configured featured priority, schedule and rotation interval; audience-filtered featured-preview callable; client carousel/rotator; geographic-feed integration; emergency withdrawal propagation | Priority mode only for Owner-approved, eligible campaigns; fallback randomized rotation (not view-rate ranking); default ~1s interval and Owner configuration; geographic isolation; unpaid/unsafe/expired/withdrawn campaign exclusion; featured previews never create reward claims; full geographic-feed view can enter the separate reward session | Requirements documented. A pure server policy helper and unit-test source have been added in `functions/src/featured-advertising.ts` and `functions/test/featured-advertising.test.js`. The helper is not yet wired to Firestore, callables or Owner configuration. A homepage discovery UI skeleton and reward-guidance route now exist with an honest empty state and approved geography choices; no featured campaign is served and no reward-history backend is connected. Tests have not yet been run in CI. |
| ADS-FEATURED-ENTRY-001 | Prominent homepage Featured Ads + Rewards entry opens featured discovery directly; sixth Media Workspace route provides featured reward guidance/history; distinct featured reward ledger source | No reward on tap/open/preview/category/card; only server-validated full selected-ad completion; existing 2-BetaCoins / 10 views / 20 BetaCoins UTC daily / 24h per-campaign baseline; no duplicate credit; member-only history; 75/25 split only in full player; advertiser payment separated from reward budget | Owner-approved 2026-11-16 and documented in `ADVERTISING_MEDIA_WORKSPACE_SPEC.md` section 15.5. Homepage button, discovery UI skeleton, sixth Media Workspace guidance/history route and widget-test source added; discovery currently shows a truthful empty state. Current timed-ad reward center is not a featured-ad serving path. Backend serving, distinct ledger classification, Owner controls, real history and exact-head test evidence remain open. |
| ADS-REWARD-001 | Featured-ad reward policy validation and decision engine: 2 BetaCoins/view, 10 views and 20 BetaCoins per UTC day, 24h same-campaign cooldown, 90% video / 10s static image, foreground/visibility and budget gates | Invalid policy/evidence, disabled policy, withdrawn campaign, unavailable budget, incomplete or hidden view, daily caps, rolling cooldown, duplicate/replay/concurrency at integration layer | Pure policy module and 12 unit-test cases added in `functions/src/featured-ad-rewards.ts` and `functions/test/featured-ad-rewards.test.js`. Not yet wired to Firestore transactions, Owner-editable config, daily/campaign claim documents or canonical wallet ledger; tests not yet executed. |
| ADS-GEO-001 | Versioned country/region mapping; campaign targeting form; feed query and deduplicated impression accounting | Exact approved ten-scope taxonomy; country-specific and All Arab countries inclusion; no IP/device-language inference; one impression per campaign/view across overlapping placements | Specification exists; end-to-end model, serving and UI remain open. |
| MEDIA-WS-001 | Home-screen peer-level entry beside Watch Ads; six destinations including creator proposals and featured-ad reward history; dedicated workspace/request records, access controls, conversation, notification and retention integration | Member/Owner/scope isolation; durable idempotent notifications; legal-hold and retention tests; no reuse of personal-chat deletion behavior | Six destinations are specified. Initial creator intake screen/callable and featured-ad discovery/reward-guidance UI plus homepage entry exist partially. Featured-ad serving, real member reward history, and the other four operational routes, server records and authorization remain open. |
| COLLAB-001 | Cooperation/application intake (including Advertising Representative application), review states, applicant communication and two-party agreement activation | No employment assumption or employment contract wording; representative role inactive until verified two-party signing; supervisor capacity/permissions and audit tests | Requirements and representative agreement draft exist; application intake and user/admin flows remain open. |
| ADS-DIRECT-001 | Direct advertiser request intake for individuals/businesses, structured categories, mandatory description, media/URL security, geographic target, duration/budget proposal, private request conversation and Owner assignment | Mandatory fields and server validation; SSRF/media-safety tests; unique request/idempotency; no publication until approvals, accepted terms and Owner payment confirmation | Specification exists; implementation remains open. |
| ADS-COMMS-001 | Roster of actually appointed active Admin Media 1–5; scoped messaging to each; Owner/Admin N contact and audited assignment/escalation | Never display placeholder supervisor identities; only active assigned names; server-enforced message access and durable delivery | Specification exists; UI and backend flows remain open. |
| CREATOR-001 | Fifth Media Workspace route; creator/influencer proposal model and intake; safe URL/media handling; rights declaration; private review conversation; Owner/scope assignment; versioned commercial offers and campaign handoff | Distinct from direct advertiser intake; authenticated submitter and idempotent request; URL/media safety; rights acknowledgement; private access isolation; offer-version acceptance; no auto-booking/publication/reward; campaign handoff retains request/audit linkage | Partial implementation on development branch: authenticated App-Check-enforced callable `submitCreatorProposal` creates private server-only request records and an idempotent, hash-linked audit event; HTTPS/written intake validation and 10 approved geographic scope IDs; member home entry and Creator Proposal form added. Unit/widget test sources added but not yet executed. Still open: secure uploaded-media binding/scanning, dynamic Owner-managed geography mapping, App Check client activation, proposal read/review/admin assignment, scoped conversation, versioned offers, notifications, abuse controls, full end-to-end tests and exact-head CI evidence. |

The featured policy helper is preparatory code only. It must not be presented as an active serving path or as proof of reward separation until callable integration, Firestore schema/rules, Owner controls, Flutter presentation and end-to-end tests are completed. No ad campaign is published by this change, and no payment or production setting is enabled.

The Creator Content & Influencer Proposals route is an approved fifth Media Workspace destination. Its first authenticated intake slice now exists on the development branch, but the route is not end-to-end complete. It must use the existing campaign, media-security, Owner approval, payment-confirmation, audit and geographic-targeting authorities; it must not create a parallel advertising or wallet subsystem.


**Latest advertising implementation note — 16 November 2026:** The homepage featured-ad entry and sixth Media Workspace reward-guidance route are present as UI scaffolding. The dedicated featured campaign serving and wallet-credit path remain intentionally unavailable until their server-side eligibility, daily caps, rolling cooldown, payment/approval gates, audit and member-history integration are complete and tested.


## تحديث تنفيذ — بوابة صُنّاع مودة وقرار الويب الحصري (2026-11-16)

أضيفت في فرع التطوير، دون تشغيل اختبارات أو محاكاة في هذه الدفعة:
- نموذج تقديم طلب عضوية صُنّاع مودة مع مسار عضو إنتاج/مرشح إشراف، التخصصات العشرة، الخبرة والأدوات والمشاريع والشركات والإنجازات وروابط السيرة وملف الأعمال ووصف الدور وإجابات المقابلة وموافقة مستقلة على تجربة إبداعية وتأكيد الحقوق.
- Callable خادمي باسم submitProductionApplication مع App Check وهوية موثقة وبوابة الويب الحصرية، تحقق مركزي للمدخلات، idempotency، تخزين طلب غير مفعل، وسجل تدقيق.
- Callable للمالك لعرض الطلبات ومراجعتها مع optimistic version checks وانتقالات حالات محددة وسجل تدقيق.
- شاشة مراجعة للمالك مرتبطة بلوحة Super Owner وتظهر على الويب فقط.
- ربط نموذج العضوية في Media Workspace مع الويب فقط. لا ينشأ دور أو صلاحية إنشاء غرف بمجرد التقديم أو القبول المبدئي.

حدود مهمة:
- لم يتم بعد ربط قبول الطلب بتوقيع اتفاقية العضوية النهائية أو منح الدور والصلاحيات؛ تبقى هذه خطوات مستقلة ومقفلة.
- التحقق من App Check يعتمد قائمة MAWDDA_LEGAL_PORTAL_APP_IDS الفارغة افتراضياً. لا يمكن تشغيل البوابة القانونية/المهنية قبل إضافة App IDs الموثقة لبوابة الويب وواجهة سطح المكتب المعتمدة في بيئة غير إنتاجية. لا تضف App IDs لتطبيق Android أو iOS.
- تطبيق Android وiOS يبقيان خارج التسجيل المهني والعقود والمراسلات القانونية والتوقيع. يجب أن تبقى بقية وظائف التطبيقين مستقلة ومتاحة وفق صلاحياتها وسياساتها.
- لم يُشغّل Flutter Analyze أو TypeScript build أو unit/emulator/integration tests في هذه الدفعة؛ لا يوجد ادعاء نجاح اختبار أو جاهزية إطلاق.


## 2026-11-16 — Production application review audit atomicity

- `reviewOwnerProductionApplication` now stages the application status/version update, immutable owner-review audit event, and shared hash-chain head update in one Firestore transaction.
- The review audit event ID is deterministic per application and expected application version, preventing a second event for the same transition attempt. A failed transaction cannot leave the review state committed without its audit event.
- The existing submission audit retry behavior remains unchanged. This change does not grant production roles or room-creation permission.
- Implementation commit: `44d2b37bc546aa1245ca5309edba8cc16da40e03`.
- Validation status: source updated on the development branch; TypeScript build, unit tests, emulator tests, and CI have **not yet been run on this commit**. Do not treat this as verified until exact-head checks pass.


## 2026-11-16 — Voluntary creative-trial consent

- Corrected the production membership application form so consent to a possible non-commercial creative assessment remains optional and independent. Applicants must confirm the accuracy/rights declaration, but declining the creative-trial invitation no longer blocks submitting the membership application.
- The server validator already accepts either boolean value for `creativeTrialConsent`; no server-side consent weakening was introduced.
- Implementation commit: `ed2f5330260f5dd25e95e70ed069918766fde388`.
- Flutter analysis/widget tests have not yet run on this commit.


## 2026-11-16 — App Check client integration blocker (Issue #19)

- Static review confirmed that 13 web-only callable paths enforce Firebase App Check and the server-side approved-app allowlist.
- The current client does not initialize App Check: no `firebase_app_check` entry exists in `pubspec.yaml` or `pubspec.lock`; `lib/main.dart` initializes Firebase Core only; `web/index.html` contains no App Check bootstrap.
- `MAWDDA_LEGAL_PORTAL_APP_IDS` defaults to an empty string. This is correctly fail-closed, but it means no web App ID is currently authorized.
- Tracked as [Issue #19](https://github.com/productionhome2022-hash/mawda-platform/issues/19). The portal callables are not yet proven operational. Do not weaken App Check or add Android/iOS IDs to the allowlist.
- Next safe work: add a compatible FlutterFire App Check dependency and web initialization using an owner-provided Firebase-registered site key; update the lockfile with the pinned Flutter toolchain; then validate in a dedicated non-production Firebase app after explicit authorization. No production Firebase change is authorized.


## 2026-11-16 — Room rental idempotency and lifecycle integrity

- Room rental creation and renewal request IDs are now bound to the original request details; conflicting retries fail closed and cannot be treated as successful replays.
- A successful renewal transitions the previous current rental record from `active`/`grace_period` to `renewed` and stores its successor ID within the same Firestore transaction as the wallet debit, room expiry update, and new rental creation.
- Added integration coverage for conflicting request-ID reuse, unchanged wallet balance on conflict, and prior-rental lifecycle transition.
- Implementation/test commits: `3782b0576a3e494d8027e355e388298925e194ca`, `c244e81c90c84fe7609a218ceff8fa9a4e610b41`, `5de6a9e3309f75cd4ba59bb3df309663ed4f3446`, `e66b74ad64d67351fa391832ac2c9026e450035b`.
- Automated tests have not yet run on this exact branch head. Cancellation/refund remains unimplemented pending explicit owner policy; no financial refund behavior was assumed.


## 2026-11-16 — Reject invitations to inactive rooms

- `inviteMemberToRoom` now rejects invitations unless the target room is in `active` status. This aligns invitation creation with `joinRoom`, which already rejects frozen/closed rooms.
- Added an emulator integration assertion that a room owner cannot create a new invitation after closing the room.
- Implementation commit: `64f2e9c8710dd36d867e08387e5f338e6de3d7a0`; test-source commit: `32d3bffb293b8e5e43de40c58c97c6d112e9a7c5`.
- Test execution is not claimed: Firestore Emulator integration has not been run on this branch head.


## 2026-11-16 — Store purchase idempotency binds confirmed price

- Static review found that `purchaseStoreItem` accepted a replay when member and item matched, without checking that the replay's `expectedPriceCoins` matched the original completed purchase. The replay did not debit twice, but could incorrectly acknowledge a reused request ID carrying a different price confirmation.
- Added `isStorePurchaseReplayCompatible` and applied it to the transactional replay path. A replay must now match member UID, item ID and the originally recorded price; conflicts fail with `already-exists`.
- Added unit coverage for matching and conflicting member/item/price combinations.
- Implementation commits: `3a7b76f41564a6d8c7bc09a5ce50d72356294448`, `282bd777367d976cb7129498c102c896329d8ab9`; test commit: `58cfab19f98c9ebb634547386a2996a1f24e9317`.
- Tests have not been executed on this branch head; source-level test coverage was added only.


## 2026-11-16 — Media processor boundary tests and documentation alignment

- Expanded the real FFmpeg audio processor integration suite for both `chat` and `room`: an exactly 60-second WAV must produce the safe audio derivative, while a 60.1-second source must be rejected. This tests the precise approved boundary rather than only a 61-second overrun.
- Updated `scanner/README.md`: the type-aware GIF/audio/video/PDF derivative processors are already present in source; the previous statement that they were still required was stale. Delivery remains fail-closed until the callback validates the exact derivative provenance.
- Corrected the stale comment in `functions/src/media-security.ts` to reflect that media finalization assigns purpose-specific retention deadlines and the retention worker enforces them, with exact-asset legal holds.
- Commits: audio boundary test `f6c57d2cc90b675b460b06e302da0d8bcb354f7b`; scanner documentation `4f23ba6f489e593449d30cfca79b99bda1958f7e`; media policy comment `176d87051f81909c813bac45d52f813e034c56db`.
- Tests were added but not executed in this session. No scanner deployment or Firebase configuration change was performed.

## 2026-11-16 — Advertising intake audit retry safety

- Closed a traceability gap in submitAdvertisingIntake: previously, the intake and idempotency records could commit successfully while the subsequent owner-audit write failed. A client retry then returned the prior request as a duplicate and skipped the audit write permanently.
- The callable now attempts the same deterministic audit event on both first submission and idempotent replay. The audit event ID is derived from the persisted request ID, so retry repairs a missing audit record without creating a duplicate intake.
- Added advertisingIntakeAuditEventId validation/helper and unit tests for stable IDs and unsafe request-ID rejection.
- Commits: ed70c8cd09d7294865cff589ec337cefb121a8ca, bc304a375dc6f76f6418ab4b50ea519234ee745e, 00c92e8df5195e898cb2461f6b3faeb8034bfd81, 728717b9cf2977a88935a6ea3bedeab0338cdccf.
- Tests have been added but were not executed in this session. No Firebase configuration, production resource, payment, or deployment changes were made.

## 2026-11-16 — Atomic advertising intake review and audit

- Closed a second advertising workflow gap: the owner review previously committed the intake status/version in one transaction and appended the audit event afterward. An audit write failure could leave a changed request with no corresponding review event, while a retry was rejected as a stale version.
- The review now reads the request, deterministic per-request/per-version audit event, and audit-chain head together, then atomically commits the state transition, immutable audit event, and chain-head advance. A matching retry returns the already-committed result; conflicting reuse is rejected.
- Added validation and unit coverage for stable version-scoped review audit IDs. The callable transaction path itself still requires emulator/integration execution.
- Commits: 345eaf005603294c9eaaa4be2d4461abe774385c, 78738169ea658cf50f19a215e98f1ea620054cde, 29292dda48eb488a2857223ef87b35d620e1de1f, f8ecb025fdcba2a219962fd26100f39f636b77e8.
- Tests have not been executed in this session. No Firebase production configuration, live data, payments, or deployment changes were made.

## 2026-11-16 — Timed-ad reward counter identity hardening

- Found that per-member/per-campaign reward counters used a raw `${uid}_${campaignId}` Firestore document ID. Because both identifiers may contain underscores, distinct member/campaign pairs could map to the same counter and incorrectly share or bypass per-member claim limits.
- Added a namespaced SHA-256 counter identity and changed both session-start eligibility checks and reward completion to use it. New counter documents also store and verify their UID/campaign pair before use.
- Preserved the legacy counter as a conservative migration floor during reads: the greater of the new scoped counter and old counter is enforced, so rollout does not reset historical claim counts. Legacy ambiguous ownership may conservatively deny an additional claim but cannot increase a member's allowance.
- Added unit tests for stable hashes, underscore-collision separation, and invalid identifiers. Firestore emulator/integration and TypeScript build remain unexecuted in this session.
- Commits: `2d3dba74195cd9c2b6bb678ea0646e38b9721a45`, `457e7773157d6ea493ccb11bea81f2742dae6a4d`, `6e25af97333c1c236d4f4a5f21fd453c7147be42`, `10aae3aaf01b92f6b134b52700f26aa0a953d699`.


## 2026-11-16 — Timed-ad legacy counter collision integration regression

- Added an emulator integration scenario with two distinct member/campaign pairs whose former concatenated legacy document IDs are identical (`member_a` + `campaign_123456` and `member` + `a_campaign_123456`).
- The test starts and completes both sessions, then verifies that both members receive only their own one-claim reward and that the new namespaced SHA-256 counter documents preserve the correct UID/campaign pair independently.
- This extends the earlier pure-helper collision test to exercise both callable transaction paths and wallet ledger writes. The test is source-added only until exact-head validation executes.
- No production configuration, data, payment, deployment, or merge action was performed.

## 2026-11-16 — WebRTC call lifecycle and media implementation

Development-branch additions:
- `functions/src/call-signaling.ts`: validates bounded call requests, SDP offer/answer payloads, ICE candidates, state transitions and server-side timing/sequence bounds.
- `functions/src/index.ts`: `startCall`, `respondToCall`, `sendCallSignal`, `getCallSignals`, `endCall`, `getActiveCall`, `getCallIceConfiguration`, and `cleanupExpiredCallSignals`. The backend validates chat/room membership, account standing, age bands, mutual blocks, caller/callee signaling roles, recipient-scoped delivery, replay/sequence bounds and active-call member locks.
- `functions/test/call-signaling.test.js` and `functions/test/integration/call-signaling.integration.test.js`: unit and emulator cases for direct calls, room peer isolation, busy-member locks, ICE authorization and participant departure.
- `lib/screens/mawdda_call_screen.dart`: Flutter WebRTC media capture, peer connections, SDP/ICE signaling, audio/video controls and cleanup. Direct/room chat screens expose outgoing and incoming call flows; main user screen routes incoming-call FCM notifications to the corresponding chat.
- `pubspec.yaml` and `pubspec.lock`: pinned `flutter_webrtc` dependency resolved using Flutter 3.47.9. Android camera/network permissions and iOS camera/microphone usage descriptions were added without changing application identifiers.
- `functions/test/fixtures/feature-coverage-matrix.json`: added partial journey `CALL-001` and explicit release gates.

Evidence boundary:
- A backend unit-test run exposed a wrong compiled-module import in the new unit test; the import path was corrected. A previous run also exposed TypeScript type errors in call authorization/projection; those were corrected. These failing runs are not acceptance evidence.
- The exact-head validation and call emulator integration for the latest branch revision must be read from GitHub Actions before marking automated tests passed.
- No TURN server or secret was provisioned. The default ICE configuration is STUN-only and does not guarantee connectivity through restrictive NATs.
- No real Android/iOS device-to-device media test, WebRTC security review, production deployment, or owner release acceptance has been performed.
- Room mesh is limited to five participants as a technical safety ceiling pending a future SFU design; it is not an owner-approved product capacity.

Status: **implemented in source; automated validation pending; device/network acceptance open; not release-ready**.

## 2026-11-18 — Responsive room-card actions

- Static review found that room cards placed multiple owner/moderator/member actions in a fixed trailing row beside the title. On narrow phone widths this could compress the room name and crowd the action targets.
- Refactored the existing room-card presentation without changing callable names, authorization decisions, or action handlers: below 520 logical pixels, room summary and actions stack with wrapping; wider layouts keep the summary and action group side by side.
- Implementation: `lib/screens/rooms_screen.dart`, commit `563c7466210c084a03b5d16f15ed73122da4f61e`.
- Added `test/widgets/responsive_room_card_test.dart` to exercise 320, 390, 768 and 1440 logical-pixel viewports and assert all room actions remain present without layout exceptions. The reusable layout lives in `lib/widgets/responsive_room_card.dart` and is used by `RoomsScreen`.
- Validation boundary: test source is committed, but Flutter formatter, analyzer and widget tests have **not** yet completed in this session. The change remains pending exact-head CI and real browser/device viewport verification.
- No backend behavior, Firebase resources, production data, payment configuration, or release channel was changed.


## 2026-11-18 — Call deadline re-entry hardening and CI coverage

- Static review found that `markCallConnected` returned the previously stored connected state before independently checking whether the five-minute server deadline had elapsed. Other call operations and the scheduled cleanup already expired overdue sessions, but a stale/replayed connection-confirmation request could still receive a successful idempotent response until another expiry path ran.
- The callable now invokes the existing server-side expiry transaction before accepting a connection confirmation and rejects an expired session with `deadline-exceeded`. It also checks the persisted deadline again inside the confirmation transaction to guard the boundary race. The existing expiry helper closes the session and releases only matching participant locks.
- Extended `call-signaling.integration.test.js` to set an expired server deadline and verify that a connection-confirmation replay is rejected before a separate active-call lookup occurs.
- Added the call-signaling emulator integration suite to `.github/workflows/mawdda-domain-regression.yml`, so this critical lifecycle test runs on future pushes to the development branch.
- Commits: backend fix `cc7a7c73db63e87dc29ef31e2ef93711ac809b9e`; integration regression `c67a11c2e94993eb4cf707c1c262c710e97d8acc`; CI workflow `7c8e6985ddf11ef32417e7b61c1bce9fe373cf9a`.
- Validation status: code and test changes are committed; exact-head CI/emulator results are pending. This is a narrow signaling lifecycle hardening, not completion of paid call entitlements, metered billing, quota display, or real-device WebRTC acceptance.
- No Firebase production resources, billing, TURN secrets, production data, merge, or deployment were changed.


## 2026-11-18 — Timed reward-ad discovery and exact-head regression

- Static review found that `getActiveTimedAdCampaigns` queried all published timed campaigns with a 100-document limit, then filtered placement, start/end time, and available reward budget in application code. A large prefix of expired or unrelated campaigns could therefore hide an eligible reward-center campaign beyond the query limit.
- Moved the reward-center placement and active time-window predicates into the Firestore query before the limit. Retained the server-side reward-budget check, which depends on the reserved/spent budget fields.
- Added the matching composite index for `status`, `placement`, `startsAtMs`, and `endsAtMs`.
- Added an emulator integration regression with 101 expired campaigns and one eligible campaign, asserting the eligible campaign remains discoverable despite the expired prefix.
- Added the engagement-rewards integration suite to the domain-regression workflow.
- Commit: `084c79b2a278429873c3b29c68ef9118a7166e04`.
- Exact-head CI evidence: GitHub Actions run `44179510781` completed successfully on this SHA. Both Flutter UI analysis/widget tests and the retention/room reservation emulator regression job (which also runs call signaling and timed-ad reward integration tests) succeeded. The standalone `Validate Mawda` workflow was still running at the time of this traceability update; its outcome must be checked separately.
- Scope boundary: this fixes campaign discovery ordering only. It does not complete geographic featured-ad campaign serving, the separate featured showcase UI, advertising intake/review/payment workflows, or release acceptance. No production Firebase resources, billing, deployment, merge to `main`, or production data were changed.


## 2026-11-18 — Reward-center campaign discovery parity

- Follow-up UI-to-backend tracing showed that `RewardCenterScreen` loads campaigns through `getRewardCenter`, while the earlier campaign-discovery regression covered `getActiveTimedAdCampaigns`. The reward-center endpoint still queried the first 100 published campaigns and applied placement/date filters afterward, so the same expired-campaign prefix could hide a valid campaign in the actual member screen.
- Applied the same Firestore-side predicates (`placement == reward_center`, `startsAtMs <= now`, `endsAtMs > now`) before the result limit in `getRewardCenter`.
- Extended the existing emulator regression to assert that both `getActiveTimedAdCampaigns` and `getRewardCenter` return the eligible campaign when 101 expired campaigns precede it.
- Commit: `47a193bff2981d7e8dfcc8ad1d5f623ba9ff6646`.
- Exact-head CI evidence: domain-regression run `44180452013` completed successfully on this SHA. Flutter UI analysis/widget tests and the retention/room-reservation emulator job both succeeded; the latter includes the timed advertising and reward-ledger integration suite.
- The separate full validation workflow for this exact SHA was queued at the time of this documentation update; do not infer web build or full validation success from domain regression alone.
- No reward policy values, campaign pricing, production Firebase resources, billing, production data, deployment, or merge to `main` were changed.


## 2026-11-18 — exact-head CI and priority-gap reconciliation

### Exact development-head validation
- Development branch HEAD verified through Git refs: `c759083e04ffd98616691c2e736207095aaf2dbc`.
- Validate Mawda run [44183645018](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44183645018) completed successfully on that exact SHA. All three jobs passed: Flutter analysis/tests/Web build; Cloud Functions compile/unit tests; isolated ClamAV scanner tests/image build.
- Mawdda domain regression run [44183645008](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44183645008) completed successfully on the same SHA; both Flutter UI/widget and backend emulator regression jobs passed.
- CodeQL run [44183648075](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44183648075) completed successfully, including JavaScript/TypeScript and Actions analysis.
- This is exact-head automated CI evidence only. It does not prove live Firebase/GCS/Cloud Run behavior, physical-device acceptance, 5,000-persona completion, or release readiness.

### Featured advertising — AD-001 remains the first implementation priority
- Rechecked `functions/src/featured-advertising.ts` and `functions/src/featured-ad-rewards.ts`: they contain pure selection/reward-decision helpers and unit tests.
- The current `functions/src/index.ts` has no exported featured-ad campaign feed/session/heartbeat/completion/history callables; its timed-ad callables operate on the separate `timedAdCampaigns` flow and must not be relabelled as featured advertising.
- `lib/screens/featured_ads_screen.dart` still renders a static empty campaign state, local-only region chips and placeholder reward-history text.
- Therefore AD-001 remains **partially implemented**. Required work: separate featured campaign persistence and owner controls; owner approval/payment confirmation/creative safety/withdrawal; explicit geography mapping; dedicated feed/player sessions and trusted visibility evidence; UTC daily and rolling campaign limits; atomic distinct `featured_ad_reward` wallet ledger entries; member history; responsive 75/25 player/context UI; emulator, replay, concurrency, revocation and UI tests.
- Keep the owner-configurable reward policy versioned. The approved experimental defaults are not a hard-coded commercial promise; production enablement remains under owner control.

### Calls — CALL-001 / CALL-002 status
- CALL-001 is partially implemented: WebRTC signaling/session lifecycle, member/room authorization, participant locks, rolling attempt limits (5 audio / 3 video) and server-side 300-second connected-call deadline exist. Exact-head CI includes call-signaling emulator coverage.
- Still open: checking both parties' 24h/7d/30d entitlements at creation/join, complete consent/preferences, TURN provisioning, and physical Android/browser device-to-device acceptance.
- CALL-002 remains unimplemented: no connected-time metering, atomic per-party billing allocation, balance debit or call wallet ledger. The approved 120/400 per-minute allocation rules are not sufficient to infer a rounding/billing unit; owner decision is still required before enabling paid continuation.

### 5,000-persona lab
- Lab PR #2 retry branch is at `f024ebda492add4028f0ffb2a6901953e9ece48b`; its harness validation run [43772590541](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43772590541) passed.
- Lab PR #3 contention/runtime branch validation run [43783308441](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43783308441) passed on `f148e25f5bd6579c3f5f301db3b0b0f588817557).
- The latest full simulation available in the audit, run [43773980276](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/43773980276), failed at RSVP contention (851/5,000 lifecycle completions). Harness validation is not a full simulation. No 5,000/5,000 acceptance is claimed.
- The connected GitHub actions interface exposes run/job reads and reruns, but no workflow-dispatch operation; a new full simulation has not been dispatched.

### Execution order
1. Complete AD-001 featured advertising backend/UI integration and its emulator/UI/security tests.
2. Close remaining phase-one code, economy, media, room and call gaps without inventing prices, entitlements or unresolved billing rules.
3. Freeze a candidate SHA and enter phase two: the isolated 5,000-persona lab.
4. Phase three remains live non-production/cloud synchronization, platform acceptance and eventual release. No production changes, paid resources, main merge or deployment are authorized by this record.

No production Firebase/Google Cloud resource, live member data, billing setting, deployment target, main branch or destructive retention worker was changed by this audit.

## 2026-11-19 — economic phase controlled integration audit

- Added `docs/ECONOMIC_PHASE_CONTROLLED_INTEGRATION_AUDIT_2026-11-19.md` after comparing the official development line with the open economic draft branches.
- Official development head immediately before this documentation update: `d561dc445ea352d94cd346a6b745e800a9114ee1`.
- Economic work is split across PR #30 (payment/wallet replay hardening), PR #31 (economic policy, featured-ad finance, group-call work and reconciliation), PR #22 and PR #28 (different integration lines with broad overlapping ancestry). No wholesale merge is safe or authorized.
- Group-call P0 remains blocking: trusted provider media proof, scalable topology, participant entitlements and consent, per-participant metering, reservation/insufficient-funds semantics, atomic idempotent settlement, UI acceptance and load/device evidence are not all complete.
- Manual payment remains the approved Phase 1 approach; automated checkout remains disabled. Public-ad, influencer-service and cash-paid store-entitlement manual flows remain fail-closed until their complete workflows exist.
- Featured-ad finance/serving/rewards and complete wallet/platform-wide reconciliation remain open. Reconciliation must remain read-only and must report incomplete/corrupt legacy history without auto-correcting balances.
- No code was ported from the divergent draft branches in this audit. No tests or builds were run on this documentation commit. Exact-head CI must be run after each subsequent source integration.
- **Economic phase status: OPEN.** Follow the controlled order and closure criteria in the linked audit. No merge to `main`, deployment, production mutation, billing activation or paid-resource activation is authorized.


## 2026-11-19 — manual coin payment and financial replay hardening

- Ported the compatible payment/wallet hardening from the isolated economic port branch into the official development branch in small source/test changes; no wholesale branch merge was performed.
- Manual coin purchase instructions now require an expected instruction version and are immutable after issuance. The member may report an external transfer only as a claim; the server creates an audited `awaiting_payment_verification` state without crediting coins.
- Owner approval accepts only the permitted manual-payment states and validates the existing wallet ledger plus immutable owner-audit evidence on replay. Missing or inconsistent evidence fails closed.
- Replayed coin transfers, store purchases, owner entitlement grants, rented-room creation and room-rental renewal now validate their related ledger/receipt/audit evidence rather than returning success solely because an idempotency document exists. New wallet debits/credits record balance snapshots where applicable.
- Added/updated unit and Firestore-emulator integration test sources for instruction versioning, claim-only payment reporting, audit integrity, ledger arithmetic and replay behavior.
- **Validation status:** source and test files are committed, but no local build, unit test, emulator run, Flutter analysis or exact-HEAD CI result has been verified in this execution. Do not treat the work as tested or closed until the exact current SHA passes the configured workflows.
- No payment provider, automated checkout, production Firebase resource, production wallet, paid service, deployment or `main` merge was changed. Existing owner-controlled prices and payment-mode selection remain authoritative.


## 2026-11-19 — read-only wallet reconciliation foundation

- Added the pure read-only `reconcileWalletLedger` helper and unit tests. It distinguishes `consistent`, `mismatch`, `incomplete`, and `corrupt`; legacy rows without balance snapshots remain `incomplete`, and malformed arithmetic/continuity is reported rather than auto-corrected.
- Added owner-only `getOwnerWalletReconciliation`, a read-only diagnostic for one member's `walletLedger`. It inspects at most 1,000 entries and explicitly reports truncated or unorderable history as `incomplete`; it does not auto-correct or rewrite historical rows. There is not yet pagination beyond that cap, an owner UI, or a cross-domain scan across transfer/platform/store/room/advertising ledgers. Historical balances are never mutated.
- Validation status: test source is committed, but the exact current development SHA has not yet been built or tested in this execution.


## 2026-11-19 — owner-scoped payment policy and featured-ad financial records

- Added the per-service payment-policy validator and owner UI. Manual mode can be configured only for coin purchases and featured-ad financial recording; public ads, influencer services and paid store entitlements remain disabled until their complete request/fulfilment/refund paths are implemented. Automated checkout remains hard-disabled until a verified provider, signed webhooks, reconciliation and owner approval exist.
- Owner economy pricing is now versioned and audited. An unconfigured economy returns empty catalogues instead of silently seeding commercial prices. The owner explicitly configures packages, ad prices, supported ISO currency codes and custom coin-request bounds. Currency minor-unit precision is derived server-side; it is never trusted from the client.
- Added owner-only featured-ad financial event recording for external payment receipts, refunds, settlement and review. Events, immutable snapshots and audit evidence are idempotent and versioned; replay fails closed when event, snapshot or audit evidence is missing or inconsistent. Recording a receipt does not publish or activate a campaign and does not claim to move external money.
- Added unit and Firestore-emulator integration tests for payment-policy validation, CHF/JPY currency precision, owner policy versioning, empty unconfigured pricing, featured-ad event replay integrity, payment gating and non-activation.
- Validation status: all changes are committed to the official development branch, but no exact-HEAD Functions build, emulator run, Flutter analysis or CI conclusion has been verified in this execution.


## 2026-11-19 — terminology audit scope and main-branch boundary

- The current official development branch has had the legacy visible labels found in its inspected Flutter screens, model comments, economic/advertising documents and server-generated role text updated. The PR #33 governance branch has separately received the canonical role names and the relevant source/comment cleanups.
- A repository search against the default `main` branch still finds old visible strings in legacy files including `lib/screens/super_admin_screen.dart`, `lib/screens/chat_room_screen.dart`, `lib/screens/landing_page.dart`, and `lib/services/room_billing_service.dart`; some of those files are absent from the current development branch. These are not silently changed on `main` because the owner has reserved merge and production authority.
- Therefore, do not claim that every branch and every historical file is globally clean yet. The remaining `main`-branch labels must be resolved through an owner-approved integration/merge, followed by a full-tree audit on the resulting development SHA.


## 2026-11-19 — group-call economic P0 gate

- The official development branch currently exposes one-to-one call signaling callables (`startCall`, `respondToCall`, `markCallConnected`, `sendCallSignal`, `getCallSignals`, `endCall`, `getCallIceConfiguration`, `getActiveCall`). It has no integrated group-call economic start/join/settlement/charging callables.
- Do not activate or port group-call billing from the isolated economic branch as a complete feature. The P0 evidence gaps remain: trusted media-provider participant/usage evidence, complete participant lifecycle and reconnect accounting, server-side entitlement checks for every participant, reservation and atomic partial settlement, large-room SFU architecture/cost/security review, UI acceptance, and 5,000-person simulation.
- Group-call billing must remain absent/fail-closed until the full evidence chain and concurrency/replay tests are implemented and accepted. No call prices or charging durations are inferred here.


## ECON-PHASE-001 — controlled comprehensive economic integration (owner approved 19 November 2026)

- **Requirement:** treat the comprehensive economic phase as one end-to-end integration program across all economic engines, their member/owner interfaces, server callables, data contracts, Firestore rules/indexes, tests, operations, governance and legal records.
- **Execution control:** inventory every relevant branch/PR/commit; reconcile source changes semantically; port in small dependency-ordered batches to an isolated integration branch; preserve all unique source history; never blind-merge divergent branches.
- **Acceptance evidence:** each batch has a decision ID, source and target SHA, affected files/contracts, tests, workflow run IDs, result, and unresolved-risk disposition. Exact-head CI must pass on one SHA before a batch is accepted.
- **Scope:** wallet/ledger/transfers, manual coin purchase, pricing/payment policy, store/gifts/entitlements, rewards, timed and featured ads, calls/group calls, rooms/rentals/events, Media Saver/media retention, cost controls, owner operations, security, legal and governance records.
- **Legal/governance control:** source documents remain preserved and indexed; signed agreements are never overwritten; drafts remain drafts until legal review and correct signatures; no company facts or legal terms are invented.
- **Safety boundary:** no merge to `main`, production deployment, live Firebase mutation, billing activation, paid provider provisioning or real-money collection without separate explicit owner approval.
- **Current plan:** `docs/ECONOMIC_PHASE_EXECUTION_AND_INTEGRATION_PLAN_2026-11-19.md`. **Current legal-document audit:** `docs/LEGAL_GOVERNANCE_DOCUMENT_CONTROL_AUDIT_2026-11-19.md`.
- **Status:** approved execution program; implementation and acceptance remain open.


## ROLE-001 — Administrative role capacity and lifecycle (19 November 2026)

- **Policy:** one Super Owner; open-ended permanent Admin N ordinals; exactly five Admin Media seats; exactly five General Production Supervisor seats; open-ended Team Production Supervisor scoped to its assigned team/room. No cross-family permission inheritance. Fixed-seat number reuse after revocation remains unresolved and fail-closed.
- **Implemented on PR #42:** canonical role identity/display-label helper; transactional capacity guard for Admin Media and General Production Supervisor; shared seat-counter transaction conflict point; safe grant-version overflow rejection; unit and emulator integration test sources for fifth/sixth seat, concurrent Admin Media claims, and open-ended Team Production Supervisor assignments.
- **Security gap:** the inspected index.ts exposes owner-only grant read/write/revoke callables but does not invoke hasAdvertisingPermission for protected advertising/production operations. The pure helper and its unit tests do not establish authorization enforcement at those operations. Do not enable specialized staff access until each protected callable loads authoritative assignment and resource ownership server-side, checks permission + active window + exact scope, and denies by default.
- **Still open:** persistent Admin N ordinal allocation and immutable appointment/revocation history; fixed-seat lifecycle after revocation; delegated permission lifecycle; role-specific permission matrix; resource-scoped enforcement at every protected operation; localized role projections across all clients. Exact-head CI and emulator execution remain unverified.
- **Validation:** source and tests were added; no successful exact-head build/test result is claimed. No production deployment before owner release approval.

## AUTHZ-AD-001 — Protected-operation enforcement audit (19 November 2026)

- Source inspection confirms the owner-only specialized grant management callables. It does not establish that hasAdvertisingPermission is called by protected operations.
- Do not infer team/room ownership from caller-supplied scope strings or invent role-permission assignments. Inventory protected callables and authoritative resource models, then add callable-level allow/deny emulator tests.
- This is a confirmed integration gap from source inspection, not a claim that every related surface is unprotected.

## 2026-11-19 — owner entitlement purchase regression fixture correction

- Exact-head CI on `7fa84ad0786fc9237f6bdec626de0fab3f9c24af` showed the room/retention regression job failing only in the owner entitlement grant integration test's paid-purchase continuation.
- Root cause: the test seeded a `storeCatalog/vip_monthly` record without its required positive catalog `version`. The purchase path intentionally rejects unversioned catalog records through `isStoreItemPurchasable`; this is a safety contract, not a production purchase defect.
- Updated the integration fixture to seed `version: 1`, preserving the production guard and making the fixture match a published/versioned catalog item.
- The same workflow's retention emulator cases (4/4), room-event lifecycle test (1/1), and Flutter UI analysis/widget tests passed on that run. The overall domain regression remained failed solely because of the fixture failure above.
- **Validation pending:** the fixture correction is committed, but the new exact-head emulator and full validation workflows must pass before closure. No production catalog record or live entitlement was changed.

## 2026-11-19 — versioned owner store-catalog publication

- Follow-up source inspection after the entitlement regression exposed a second, production-path defect: `setStoreCatalogItem` persisted no `version`, although `purchaseStoreItem` correctly requires a positive catalog version. Owner-published purchasable items could therefore be rejected at checkout.
- Fixed the owner/MFA-only publishing transaction to assign a monotonic positive version (1 for a new/legacy unversioned item, then previous version + 1), reject corrupt/overflowed prior versions fail-closed, and write the version into the immutable owner audit event. The callable now returns the assigned version.
- Extended the Firestore-emulator store integration to assert initial version 1 and republish version 2 before purchase flows. The earlier owner-grant fixture also now includes a versioned catalog record.
- **Validation pending:** exact-head Functions compile/unit/emulator tests and domain regression must pass. No production catalog documents were modified.

## 2026-11-19 — featured-ad immutable snapshots and currency fixture alignment

- The featured-ad finance integration contract expects a versioned campaign snapshot and a self-contained event snapshot. The development callable previously wrote only the mutable campaign head and omitted the resulting financial state from each immutable event record.
- Updated timed-ad campaign publishing to create `timedAdCampaignVersions/{campaignId}/versions/{version}` atomically with the campaign head, with monotonic versioning and fail-closed handling of corrupt/overflowed prior versions.
- Updated financial event creation to persist the post-transition financial snapshot (`...next`) in the immutable event record alongside the existing version snapshot and audit record. Campaign/event/audit writes remain in the same Firestore transaction.
- Updated the emulator fixture from CHF to EUR because the official platform currency allowlist is now explicitly limited to nine owner-approved currencies. Added assertions for event-level received/refunded/reconciled totals and payment/review status.
- **Validation pending:** exact-head Functions compile/unit/emulator and domain regression workflows must pass. No live advertising campaign, payment, or external funds were changed.

## Economy currency allowlist — 2026-11-19

- The official settlement/pricing currency allowlist contains EUR, USD, EGP, SAR, SYP, JOD, IQD, AED, DZD, MAD (Moroccan dirham), and TRY (Turkish lira).
- MAD and TRY use two minor-unit decimal places; JOD and IQD use three; the other listed currencies use two.
- This is currency-code and precision support only. It does not define exchange rates, coin package prices, ad prices, fees, quotas, payment channels, or activate any checkout flow. Those remain owner-controlled and fail closed when unconfigured.
- Regression coverage includes the allowlist, decimal validation, coin catalog, ad catalog, and owner-negotiated payment instructions. CI evidence must be attached to the exact commit containing the final tests.


## 2026-11-19 — exact-head integration checkpoint and 5,000-person simulation hold

- Development branch checkpoint: `20efef2b34bf45d626defc2293d690680945c775`.
- The `Mawdda domain regression` workflow completed successfully on this exact SHA (run `44506966587`): Flutter UI analysis/widget tests and retention/room-reservation emulator regression both passed.
- The `Validate Mawda` workflow is still in progress on the same SHA (run `44506966701`). At the checkpoint, Cloud Functions compile/unit tests and media callable authorization/audit integration had passed; mode-aware retention integration, Flutter tests/web build, and isolated scanner image/sanitization checks were still running. This is not a full validation pass until every job completes successfully.
- No 5,000-person simulation workflow is to be run during the current implementation/integration stage. Defer the dedicated simulation lab and load/scale scenarios until the owner explicitly resumes that later acceptance phase. Ordinary targeted unit, Flutter, emulator, security and CI checks remain in scope.
- Current tracked blockers remain: specialized advertising permission grants are not yet enforced by the protected operation callables; Media Saver entitlement-gated save flow is not end-to-end; room cancellation/refund remains blocked on owner-approved policy; full featured-ad serving/reward path and cross-domain wallet reconciliation remain incomplete. Do not enable paid or production behavior to bypass these gaps.
- This checkpoint changes documentation only; it does not represent completion of the listed blockers, device acceptance, production approval, deployment or merge to `main`.

## Owner-approved engineering clarifications — 19 November 2026

- **Role-scoped delegation:** the owner chooses explicit permissions from a role-specific catalogue for each appointed staff member. Grants must be restricted to the approved job role and exact assigned resource scope, editable/revocable by the owner, versioned and audited. A global permission enum alone is not sufficient; every protected backend operation must enforce the grant. No delegated role may acquire owner, platform-wide, or financial authority by implication.
- **Room-rental refunds:** cancellation, refund amount, and reversal of a prior refund are discretionary owner actions, not an automatic policy. The implementation must require an explicit owner decision for each operation and atomically reconcile wallet, immutable ledger entries, rental/room state, idempotency and audit. Reversal cannot erase the original refund or silently overdraw a member wallet.
- **Mawdda Media Saver:** one paid entitlement covers eligible local saves from direct chats, public rooms and rented private rooms. Revalidate the entitlement and source access at every save; serve only the approved safe derivative with a short-lived, asset-bound capability; enforce media type, generation, retention and economic controls. Local save must never reset or extend server retention. No raw Storage path, quarantine original, unverified media, invented quota, or client-only entitlement decision is permitted.

These clarifications are approved requirements, not completion evidence. Implementation and exact-head automated validation remain open until code, tests and workflow results are recorded.

## Permission-source reconciliation — 19 November 2026

The owner clarified that earlier approved permission options and advertising/production delegation rules must be reused, not replaced by a newly invented generic matrix. The authoritative sources reviewed on this branch are:

- `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md` — Sections 2, 3, 8, 9 and 14.
- `docs/MAWDDA_ADVERTISING_PRODUCTION_GOVERNANCE_2026.md` — Sections 1, 5–8, 13–14, 19–21.
- `docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md` — canonical role separation and scopes.
- `docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md` — separate appointment/contract types and revocable delegations.
- `docs/MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md` — advertising/production documents are mandatory implementation appendices.

### Binding implementation interpretation

1. **Admin Media 1–5:** reuse the existing explicit catalogue in Advertising Media Workspace Specification §3. The owner selects any suitable subset independently for each appointed supervisor. The catalogue covers applicant/agreement administration; request intake/review; non-financial campaign operations; optional publication; workspace communications; approved notifications; and non-financial reports. Publication is optional. Commission setting, commission acceptance on behalf of a representative, advertiser-payment confirmation, company-wide finance/settlement/payout access, supervisor-permission management, owner authority/emergency controls, and deletion of signed agreements/audit/legal-financial evidence remain excluded. Owner appointment, per-capability grants/revocations, scope, MFA/step-up, version and audit follow §8.
2. **Advertising/production specialist roles are not Admin Media or Admin N.** Preserve the separate role families: general advertising supervisors, general production supervisors, team production supervisors, production technical-review team, and legal/administrative contract supervisors. Their grants are independently customized by the owner, deny-by-default, server-enforced, versioned, dated and audited, and bound to the assigned campaign/resource/room/team/task. Team Production Supervisor is restricted to its assigned team and room. Production rooms have five roster members maximum (supervisor plus four); privileged observers/managers are outside the roster and restricted to assigned rooms, except the owner.
3. **Production workflow boundaries:** preserve the documented sequence of production assignment, team formation, creation/versioning, team-supervisor review, general-production review/report, advertising-supervisor coordination within delegation, technical review, owner decision, immutable final hash/version, central evidence storage, and publication only after all campaign approvals and commercial/legal gates.
4. **Admin N (general platform administration):** remains a separate role family and must never inherit Admin Media or specialist production permissions. The reviewed canonical terminology and governance documents establish separation and explicit delegation, but do not expose a complete Admin N capability catalogue in these specific files. Do not borrow the advertising catalogue or invent the missing Admin N options; locate the earlier approved general-admin source before implementing its editor.
5. The previous generic GOV-002 phrasing is subordinate to this source reconciliation: role-specific catalogues and resource scopes are required, and the already approved Admin Media catalogue must be reused verbatim/versioned rather than replaced by a generic list.

This is a source reconciliation and implementation instruction, not evidence that all permission enforcement is complete. Existing `advertising-permissions.ts` currently models a single `general_supervisor` category and the advertising catalogue; it is not by itself a complete authorization implementation for every specialist role or Admin N. All protected callables and resource paths still require enforcement and tests.


## Super Owner sovereign authority and delegation constitution — 19 November 2026

- The owner has approved `docs/OWNER_SOVEREIGN_AUTHORITY_AND_DELEGATION_CONSTITUTION.md` as a binding governance requirement for all current and future platform domains.
- Super Owner is the single highest platform authority. All role families, administrators, supervisors, moderators, representatives and service actors remain subordinate and receive no owner-equivalent or implied authority.
- The owner-facing permission experience must expose role-specific selectable options and support per-person additive grants, granular edits, partial revocation, full revocation, temporary suspension/reinstatement, optional expiry/renewal, scope review and complete versioned audit history.
- The owner retains exclusive control of owner-reserved platform, security, staffing, economic and final-approval decisions. Delegated powers must be explicitly catalogued, scoped, server-enforced and revocable. No wildcard or self-escalation mechanism is permitted.
- Preserve the approved independent catalogues and role boundaries: Admin N; Admin Media 1–5; general advertising supervisors; general production supervisors; team production supervisors; production technical-review; legal/administrative contract supervisors; and any future owner-approved specialist roles. Do not infer or invent the still-unlocated Admin N capability list.
- Security controls (verified owner identity, MFA/step-up, recent authentication as required, immutable audit evidence, fail-closed authorization and backend enforcement) protect the exercise of owner authority; this governance decision does not authorize silent evidence deletion or production changes.
- **Implementation status:** approved and documented only. Owner-facing UI, full role catalogues, complete server enforcement and authorization tests remain engineering work and must not be represented as complete until evidenced on an exact SHA.
- This approval does not authorize merge to `main`, deployment, production Firebase mutation, billing/paid-resource activation or live policy changes.


## Owner permission editor foundation — 19 November 2026

- Added the pure server-side helper `applySpecializedPermissionDelta` in `functions/src/advertising-governance.ts`. It applies additive grants and selected partial revocations while preserving the existing role identity, status, version, dates and resource scopes.
- The helper rejects unknown/forbidden capabilities, duplicate additions/removals, attempts to remove capabilities not currently granted, and a partial change that would leave an empty grant. Full revocation remains a distinct lifecycle operation.
- Added unit-test cases for additive + partial removal, preservation of scope and grant metadata, forbidden owner/platform escalation, duplicate additions, invalid removals and final-permission removal.
- Source/test commits: `1a8e2d5e594863497714c66e5ae846b22a684564` and `935480b90c77c138018f946914ec3c31dce3452d`.
- **Status: partial backend foundation.** The pure delta helper is now wired to the owner-only `updateOwnerAdvertisingRoleGrantPermissions` callable. The callable requires owner verification, exact grant ID, optimistic version match, active/suspended lifecycle, allowlisted add/remove keys, and preserves scope/status/dates while incrementing the grant version and writing an owner-review audit event. The owner permission UI is not yet wired, callable-level integration tests are still required, and source inspection still finds no protected specialist-operation call-site use of `hasAdvertisingPermission` in `index.ts`; therefore specialist operations are not yet enforced by these grants.
- Exact-head CI on the then-current code SHA is pending; no local Functions build or unit test was run in this execution. Do not treat this item as tested or closed until the final documentation SHA's workflows complete successfully.
- Related audit findings: the current `advertising-permissions.ts` contains the approved Admin Media capability identifiers but models a single `general_supervisor` actor; `advertising-governance.ts` contains a second, smaller specialist permission vocabulary. These two vocabularies must be reconciled against the approved source catalogue before protected-operation enforcement is wired. Admin N's full catalogue remains unlocated in the inspected sources.
- No room-rental refund policy, rental pricing, live retention policy, Firebase production resource, `main`, deployment, or billing configuration was changed.


---

## 19 November 2026 — Atomic audit correction for specialized advertising role grants

**Finding:** Source inspection of `functions/src/index.ts` showed that `setOwnerAdvertisingRoleGrant`, `updateOwnerAdvertisingRoleGrantPermissions`, and `revokeOwnerAdvertisingRoleGrant` committed the role-grant mutation in one Firestore transaction and appended the owner audit-chain event in a second transaction. If the audit append failed after the grant transaction committed, the privileged change could persist without its corresponding audit event.

**Correction committed on the development branch:**
- Added `createOwnerReviewAuditEventInTransaction`, which reads and advances the shared owner-review audit-chain head and creates the audit event using the caller's Firestore transaction.
- Moved the audit event creation into the same transaction as create/update/revoke for all three specialized-role grant callables.
- The grant mutation and its audit-chain event now commit or fail together. A revoked-grant idempotent replay remains a no-op and does not create a duplicate event.
- The helper uses the imported Firestore `Transaction` type.

**Validation status:** Source change is committed, but TypeScript compilation, backend unit tests, emulator integration tests and exact-head CI have not yet been run or observed on the resulting commit. Treat this correction as **implemented / validation pending**, not tested or closed.

**Remaining authorization gap:** The role-grant catalogue and permission evaluator exist, but specialized permissions are still not wired to all relevant specialist operation call sites. This correction closes the audit atomicity defect only; it does not make specialist permissions operational or authorize any new operation.


## RET-005 — Owner confirmation of important-chat text retention (19 November 2026)

- **Owner decision:** important-chat text retention is exactly **30 days (720 hours)** from the server-authoritative message creation timestamp. The 90-day alternative is rejected.
- Important-chat media remains four hours. Normal-chat text remains seven days and media four hours.
- Temporary direct-chat mode remains full-conversation deletion after four hours of server-recorded inactivity, but consent/selection, server activity updates, and complete deletion/derivative cleanup remain open gates. No live deletion activation is authorized.

## 2026-11-21 — Mandatory engineering work-history and merge ledger

- Established `docs/ENGINEERING_WORK_HISTORY_AND_MERGE_LEDGER_2026.md` as the mandatory control for recording task baselines, owner requests/decisions/proposals, investigations, root causes, file-level change manifests, branch integration dispositions, exact-SHA validation evidence, risks, rollback and closure.
- Linked the ledger from the central documentation governance README. Material tasks must have individual dossiers under `docs/engineering/work-history/`; branch integration batches must have dossiers under `docs/engineering/integrations/`.
- The ledger explicitly distinguishes owner-approved decisions, proposals, observed findings, implementation, automated tests, emulator/integration tests, device acceptance and release approval. No stage is inferred from another.
- Historical backfill is not yet complete. The 1,099 source inventory remains indexed, not individually semantically reviewed. No claim is made that every prior task, proposal, commit or integration has already been reconstructed.
- **Status:** governance control established on the development branch; operational adoption, historical backfill, per-source semantic review and comprehensive application audit remain open. No merge to `main`, production deployment, Firebase production mutation or billing change was performed.


## 2026-11-21 — Supersession of historical 5,000-persona execution roadmap

**Binding owner decision:** `GOV-SIM-5000-001` in `MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md` supersedes all earlier plans, stages, and wording in this document that suggest a 5,000-persona run may be started automatically after a SHA freeze, after repository unification, or as a routine next phase.

The following sections are historical evidence only and are not current execution instructions: the earlier lab roadmap in the 18 November exact-head section (including its lab PR/run references and execution-order item 3), the 19 November simulation hold/checkpoint, and any older coverage matrix that names a persona/load suite. No one may dispatch, rerun, modify, or otherwise operate the independent lab under those historical notes. The independent lab requires a separate, explicit owner commission. Static inspection of the primary repository is permitted; running the simulation to verify compliance is prohibited.

The primary repository must not contain a 5,000-persona generator, package command, test harness, indirect workflow invocation, or load/lifecycle test. Ordinary deterministic unit/integration/security/build checks remain permitted when they do not invoke the large-scale harness.

This note records precedence and does not rewrite the historical run results. It does not authorize a lab operation, production change, merge to `main`, or deployment.
