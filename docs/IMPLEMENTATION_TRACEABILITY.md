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
- Verified-email reward is 500 coins once only, with an atomic ledger record.
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
- Successful action link returns through a validated app/deep link to profile completion. Expired/reused links fail safely. The one-time 500-coin reward is server-side and atomic with verified status.
- Configure sender-domain SPF/DKIM/DMARC and monitor deliverability; never log action codes or put reusable secrets in links.
- Instagram/Facebook/X public profile connection badges require official provider OAuth and backend validation of provider account subject ID; use state + PKCE where supported, least-privilege scopes, encrypted tokens only when required, revocation/disconnect, and periodic revalidation. Never treat a pasted URL as verified.
- Instagram official API eligibility limitation: Professional Business/Creator accounts only; ordinary personal accounts must not be shown as OAuth-verified if provider API does not support them.
- WhatsApp consumer accounts have no general consumer OAuth identity flow equivalent to the other providers. Verify phone-number control with a one-time code via an approved SMS/voice or officially supported WhatsApp route, then create a wa.me contact link. Label as phone-number verified, not WhatsApp OAuth connected. WhatsApp Business onboarding is a separate business integration.
- Tests: expired/replayed email links, wrong-address redemption, resend abuse, enumeration resistance, unverified reward denial, app-link tampering, OAuth state/PKCE mismatch, wrong provider subject, token leakage, revoked/disconnected accounts, provider scope minimization, Instagram personal-account ineligibility, and WhatsApp phone-number verification.
