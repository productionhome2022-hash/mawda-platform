# دستور مودة | MAWADDA Product Constitution

**Status:** Approved product baseline; implementation and release readiness are tracked separately.
**Product name:** مودة | MAWADDA
**Primary tagline:** حين تلتقي القلوب… تبدأ الحكايات.
**English tagline:** Where Hearts Find Their Story.

This document is the highest-level product and engineering reference for Mawadda. Every feature, UI flow, backend service, data model, security rule, test, operational procedure, and release decision must align with this constitution and the approved amendments recorded in the project. If an implementation conflicts with it, stop and reconcile the conflict before shipping. A documented requirement is not proof of implementation.

## 1. Mission and product principles

## Owner identity and authority model

- Mawda has one human platform owner: the same person is both **Owner** and **Super Admin**. These are two descriptive names for one trusted identity, not two people, two independent accounts, or two separate owner profiles.
- The platform must maintain one canonical owner UID. Any internal `platformOwner` / `superAdmin` role labels or legacy claims are aliases of that same verified owner identity, never independent ways to create a second owner.
- All privileged owner actions, audit records, payment approvals, room broadcasts, pricing changes and recovery operations resolve to that canonical owner identity and are protected by server-side authorization, recent MFA/step-up and immutable audit evidence.
- The owner may delegate narrowly scoped moderator/operator tasks where explicitly supported, but delegation never grants or transfers the unique owner identity.

## Owner-configurable coin purchase channels

- Coin acquisition supports two separately controlled channels: (1) direct/manual purchase requests handled personally by the owner, and (2) optional automated checkout through a future payment-provider integration.
- Manual contact is the default supported channel. Members may choose an owner-configured package or request a custom quantity. Custom-quantity requests are always handled through the member's direct conversation with the single owner; the owner may send payment instructions and agree a price/quantity there.
- Automated payment is a future capability, not enabled merely by configuring a bank account or displaying payment details. It requires a selected and contracted provider, verified server-to-server payment events, signature validation, idempotency, refunds/chargebacks, reconciliation, fraud controls, tax/legal review and explicit owner activation.
- The owner can enable/disable each payment channel and configure which packages are available. Automated checkout may be enabled for selected fixed packages only. Custom quantities remain owner-negotiated/manual unless a separately approved future specification explicitly changes that rule.
- No coins are issued until either the owner manually approves an externally verified payment or a fully integrated, owner-enabled provider confirms a valid payment server-to-server. Client redirects, screenshots, member declarations, browser callbacks and unverified webhooks never mint coins.
- Never store raw bank credentials or payment-card data in Mawda. Provider secrets belong in managed secrets storage, not Firestore documents or client apps.


Mawadda is a multilingual, cross-platform social community for friendship, purposeful connection, and serious relationships, including dating and marriage goals where lawful and age-appropriate. Build a distinctive, trustworthy, elegant, accessible, and culturally respectful experience.

Priorities, in order:
1. Safety, privacy, dignity, consent, and legal compliance.
2. Correctness of identity, authorization, financial records, and data lifecycle.
3. Reliability, accessibility, performance, and understandable UX.
4. Coherent product experience and visual quality.
5. Growth and monetization only when transparent and non-manipulative.

Never fake functionality, balances, purchases, verification, availability, analytics, or completion. Do not use dark patterns, deceptive boosts, undisclosed surveillance, plaintext passwords, or client-controlled authority.

## 2. Languages, platforms, and adaptive experience

- Arabic, English, French, and Spanish; full RTL/LTR handling including mixed-direction text, dates, numbers, and accessibility labels.
- Target Android phones/tablets, iPhone/iPad, Windows, macOS, Linux, and modern web browsers.
- Design adaptively for screen size, aspect ratio, orientation, input method, and platform conventions; do not merely scale a phone layout.
- Verify touch, mouse, keyboard, portrait/landscape, screen readers, contrast, reduced motion, network failure, and low-performance devices.
- Do not claim platform support until that platform has a successful build and meaningful smoke tests.

## 3. Brand and visual identity

- Arabic brand: مودة; Latin brand: MAWADDA.
- Core palette: deep burgundy and champagne gold, supported by pink, crystal cyan, and royal blue.
- Visual language: refined, warm, cinematic, balanced glassmorphism; maintain readability and performance.
- Logo concept: sculptural intertwined flowing paths forming a heart-like meeting symbol, not a flat generic heart; provide simplified vector/app-icon variants and high-quality hero artwork.
- Intro motion: paths meet, form the symbol, pulse, then reveal name/tagline; provide skip and reduced-motion behavior.
- Shared themes: Romantic, Modern, Classic; available without gender stereotyping.
- Shared background library may include Moonlight & Silk, Rose & Heart-light, Royal Terrace at Sunset, and Crystal Cyan/Blue Moonlight.
- One-to-one chats and rented public/private rooms retain their own independent backgrounds; general romantic backgrounds must not overwrite them.

## 4. Launch background and background management

- The exact approved launch background must be bundled locally and serve as the stable fallback whenever a remotely managed background fails, is unavailable, invalid, or offline.
- No blank surface and no unrelated silent substitution on failure.
- A replacement fallback requires explicit owner approval and publication through the reviewed, versioned workflow.
- Owner background management must support approved placement targeting, upload/replace/select, previews for phone/tablet/desktop and portrait/landscape, crop/focal point, contrast overlays, reduced motion, optimized responsive assets, fallback verification, draft/preview/publish/disable/rollback, and audit history.
- Restrict storage paths, file types, dimensions, sizes, ownership, and publication. No arbitrary remote URLs or client-side privileged writes.
- Global backgrounds never override private-chat or rented-room backgrounds.

## 5. Accounts, registration, and member profiles

- Support registration, sign-in, sign-out, guest/onboarding flows where approved, email verification, password reset, and secure account recovery.

- **Real email ownership verification:** registration must send a genuine, single-use, time-limited email action link to the exact address supplied by the member. The account remains `emailVerified === false` and profile completion/reward gates remain closed until the trusted authentication provider confirms the link was successfully redeemed. Do not trust a client-side success flag or a manually edited profile field.
- The pending-verification screen must explicitly tell the member to check Inbox and also Spam/Junk, because the activation message may be filtered there. Ask them to mark the message as important / move it to Inbox / add the sender to trusted contacts where their mail provider supports it; do not promise that this guarantees delivery.
- After successful verification, return the member through a validated app link/deep link to the Mawadda continuation screen to complete profile data. Handle expired/used links safely and offer a rate-limited resend flow without revealing whether arbitrary email addresses have accounts. Verification status and the recurring 500-coin reward for each eligible 90-day email verification cycle are granted atomically/server-side only after provider confirmation; each cycle can be rewarded once only.
- Configure the official sender domain, SPF, DKIM, and DMARC; use a recognizable Mawadda sender and tested deliverability. Never include passwords, access tokens, or reusable secrets in email links. Do not log raw action codes.
- A verified identity is not automatically a completed member profile.
- Profile fields: full name, unique username, age, profession, Arab country, region, gender, marital status, bio (maximum 500 characters), interests, and structured goals.
- Profile editing, privacy, visibility, media, and username reservation must be server-validated and tested.

- **Verified-member personal social links:** a member with currently active, server-confirmed biometric verification may add optional personal profile links for Instagram, X/Twitter, Facebook, and WhatsApp. Show the selected links as clearly labeled external-profile icons/links on that member's public profile wall when another member visits it, subject to the profile's visibility/privacy settings. This is a free verification benefit, not a paid feature.

- **External account connection is ownership verification, not URL entry:** Instagram, Facebook, and X/Twitter profile badges may show “Connected and verified” only after the member completes the provider's official authorization flow and Mawadda's trusted backend validates the returned identity/account ID. Store provider subject ID, normalized public profile URL/handle, scopes, connection status, timestamps, and revocation/expiry metadata; never store provider passwords. Use authorization-code flows with transaction-bound state and PKCE where supported, least-privilege scopes, server-side token exchange, encrypted token storage only when needed, and disconnect/revocation handling. Revalidate connections periodically and hide the verified badge/link when revoked, invalid, or no longer eligible.
- **Instagram limitation:** official Instagram API access is limited to eligible Professional (Business/Creator) accounts; do not claim OAuth ownership verification for ordinary personal Instagram accounts where Meta's supported API does not provide it. Explain the eligibility requirement and keep the account unverified rather than falling back to a pasted URL. Meta's current API collection documents this Professional-account limitation. <https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api>
- **Facebook and X:** use each provider's current official OAuth/API product and approved permissions; verify the provider-returned account identifier on the backend, subject to provider app review, access tier, rate limits, and policy. Do not infer identity from a public URL or username alone.
- **WhatsApp distinction:** WhatsApp consumer accounts do not offer a general-purpose consumer OAuth identity-link flow equivalent to Facebook/X. For an individual's WhatsApp contact, verify control of the phone number using a one-time code delivered through an approved SMS/voice verification provider (or an officially supported WhatsApp verification route where available), then let the member explicitly publish the resulting wa.me contact link. Label this “Phone number verified” rather than falsely claiming “WhatsApp OAuth connected.” WhatsApp Business accounts may use Meta's official WhatsApp Business Platform onboarding/Embedded Signup where the product actually needs a Business account integration; do not represent that as verification of an ordinary personal account.
- Members may disconnect any provider at any time. Disconnecting, provider revocation, or failed revalidation removes the connected badge and hides the public link immediately. Profile visibility and member consent still apply. Request only identity/profile scopes needed to prove account control; do not request message, contacts, posting, or analytics permissions for a simple profile badge.

- Store only the profile URL/handle returned or validated against the connected provider identity; do not accept a different pasted URL and mark it verified. Reject unsafe schemes, credentials, deceptive subdomains, malformed URLs, and shorteners. The member explicitly chooses what to publish.
- The member can add, edit, remove, and hide each link independently. Do not publish a link until the member explicitly saves it. Expiry, revocation, or loss of active biometric status hides/disables these links from other visitors and prevents new edits until eligibility is restored; preserve the member's saved values privately so they can decide whether to republish after re-verification. Enforce this on the trusted backend and profile read path, not only in the UI.
- Approved email-verification reward: 500 coins for every successfully completed eligible 90-day email verification cycle, atomically linked to that cycle and ledger; one credit maximum per cycle.
- Registration is fail-closed until explicitly enabled by the owner. Minimum registration age cannot be below 16; romantic dating/marriage goals are 18+.
- Self-declared age is not robust age assurance. Stronger age assurance, minor safety, market-specific legal review, and safeguarding are launch gates.
- Initial biometric implementation decision: use Android BiometricPrompt on Android and Apple LocalAuthentication on iOS/iPadOS for optional device-local authentication. Mawda receives only the local authentication outcome; it must not collect or upload biometric images, samples, or templates. These APIs confirm a local OS authentication event, not civil identity and not an independently verifiable server assertion. No external biometric provider is used in the initial phase; a specialist provider may be evaluated after launch and real user growth. **Owner-approved engagement reward policy:** after the member explicitly consents and the native OS biometric prompt succeeds, the backend may credit 1,500 coins once per 30-day cycle. The backend enforces active membership, the 30-day interval, a deterministic cycle ledger entry, atomic balance/ledger writes, and audit evidence. The backend records the source as a client-reported local OS prompt result; it cannot cryptographically prove that an unmodified client displayed the prompt. This is an engagement reward, not identity proof, liveness detection, civil identity verification, or a replacement for email authentication. Modified clients may forge the claim; that residual risk is accepted for this initial reward policy and must be disclosed and monitored. Do not use this status alone to authorize high-risk account recovery, payments, owner privileges, or other identity-sensitive operations. Never infer gender from voice.

### 5.3 Mandatory privacy-policy notice and pre-entry acknowledgement (approved requirement)

- A current, versioned Mawadda Privacy Policy must be accessible in the selected language and presented for review before a person creates a member account or enters the service as a guest. A person must affirmatively acknowledge the applicable policy before registration submission, guest-session issuance, joining a room, opening a direct conversation, or accessing member/guest content. Do not treat continued browsing, a preselected checkbox, or silence as acknowledgement.
- The public landing page may expose the policy, help, and registration/guest entry controls, but no protected member or guest content or interactive service is available until the required acknowledgement is recorded. If a guest later converts to a registered account, carry forward the guest acknowledgement only if the policy version and notice scope are identical and the record can be reliably bound to the new account; otherwise request acknowledgement again.
- Store a durable acknowledgement record containing the policy/notice version and content hash, locale, timestamp from the server, actor type (registered member or guest), authenticated UID or pseudonymous guest-session ID, app/build version, and the acceptance event. Record subsequent policy-version changes and require renewed acknowledgement when materially changed terms or applicable law require it. Collect no unnecessary device fingerprint or location data merely to prove acknowledgement.
- The notice must clearly explain the owner-only silent review capability in Section 7.1, including that the owner may access direct conversations (including active and ended conversations) and member/guest files, that individual review events do not trigger a real-time participant notification, and that internal audit evidence is retained. Explain the available owner participation display modes: “إدارة منصة مودة”, “السوبر أدمن”, and “مجهول”.
- The privacy policy must separately identify data categories, processing purposes, retention periods/criteria, recipients/processors, international transfers where relevant, security controls, member/guest rights, complaint/contact routes, and any applicable legal bases. Do not claim that a click-to-accept alone legalizes processing that otherwise lacks a valid legal basis. Obtain separate, freely given consent for optional biometric processing where required; never bundle biometric consent into general privacy acknowledgement.
- Guests receive a guest-specific notice and acknowledgement before a guest session or access to any guest/member content. Explain guest data collection, session lifetime, storage, moderation, review, deletion, and conversion to a registered account. A guest must not be treated as having accepted the policy merely by opening the public landing page.
- If a person declines or withdraws acknowledgement where withdrawal is legally available, do not create a member account or issue/continue a guest session for processing that requires the acknowledgement; provide a clear exit and applicable data-rights route. Preserve only records that must lawfully be retained, with access restricted.
- **Implementation status:** a versioned member acknowledgement is now implemented in Flutter and Cloud Functions: a pre-signup affirmative checkbox, a server-stored version/hash/locale/app-version record, a post-login gate, and a server check before member profile completion. The current Arabic notice is explicitly a technical draft, not the complete legally reviewed policy. Guest-session/content gating, full localized policy text, policy migration/re-acknowledgement workflow, processor/transfer/retention/contact particulars, DPIA, jurisdictional legal review, and additional negative tests remain open. Do not treat this partial acknowledgement flow as launch approval.

## 6. Social content and discovery

- Profiles, posts, photos, videos, albums, comments, reactions, sharing, saving, stories (24 hours), followers/friends, visitor analytics, and privacy controls.
- Discovery should use transparent, explainable signals and user controls; compatibility summaries must not claim scientific certainty.
- Boosted discovery must be clearly labeled as paid promotion.
- Add icebreakers, daily prompts, interest-based discovery, events, and creator tools without manipulative engagement patterns.
- Media access, visibility, moderation, reporting, retention, and deletion are enforced server-side.

## 7. Messaging, notifications, and safety

- Direct messages and group/room messaging with participant authorization, request/accept controls where applicable, pagination, delivery/read receipts, notification preferences, and push notifications.
- Text, voice messages, stickers, sounds, images, GIFs, and video according to role, room policy, and validated limits.
- No message body in notification previews by default.
- Free link permission for successfully biometrically verified members: they may share YouTube, Facebook, Instagram, and X (Twitter) links in one-to-one private chats, public-room chats, and rented private-room chats. This is an entitlement of verified status, not a paid subscription.
- The same verified-member permission applies only to direct HTTPS destinations on YouTube, Facebook, Instagram, and X/Twitter official domains (including youtu.be and youtube-nocookie.com); shorteners such as t.co remain blocked until safe redirect verification is implemented. Unsafe schemes, credentials, deceptive hosts, and obfuscated links remain blocked.
- Biometric verification status must be written and maintained only by the trusted verification backend. A status of `verified` is eligible only with a valid future `expiresAt` timestamp and no `revokedAt`; clients cannot self-assign or retain a verified status after expiry, revocation, or failed re-check.
- Members without successful biometric verification cannot send links. Room owners and authorized room moderators retain their existing room-scoped Facebook/Instagram/YouTube permissions; the platform Super Admin retains the separately defined server-verified HTTP/HTTPS any-domain exception.
- Blocks, reports, appeals, moderation cases, and safety workflows must be usable and auditable.
- Adult/minor private-contact safeguards must be enforced on the server, not only hidden in UI.
- The sole platform owner has a separately defined, owner-only content-review capability described in Section 7.1. It is disclosed in the privacy policy before any member or guest enters the service. The capability is not delegated to moderators, support agents, AI characters, or ordinary staff.
- A silent owner review does not emit a real-time notice to the conversation participants, alter message read receipts/read state, or send a push notification. This is not undisclosed processing: the general privacy notice must plainly describe the owner's ability to review conversations and member/guest files, the categories of data involved, purposes, safeguards, retention, and applicable rights.
- Product authorization to open the review console without a report or case does not itself establish a lawful basis for every access or make blanket monitoring lawful in every jurisdiction. Actual processing remains subject to mandatory law, necessity/proportionality, data-protection principles, and jurisdiction-specific legal review before launch. Do not present user acknowledgement as a substitute for a valid legal basis.
- The owner must not impersonate a real member. Anonymous participation means only that the member-facing display label is “مجهول”; the authenticated owner identity remains known to the backend and is recorded in tamper-evident audit evidence.

### 7.1 Sole-owner conversation and member/guest-file review authority (approved requirement)

**Authority and scope**
- The sole platform owner is the only Super Admin and the only principal permitted to use this capability. The owner may open the review workspace at any time without requiring a member report, safety ticket, court order, or case reference as a product-level precondition. This product permission does not override mandatory legal limits or establish a lawful basis by itself.
- Review scope includes any one-to-one direct conversation, whether active or ended, and member/guest files and media stored or processed by Mawadda, subject to technical availability, retention/deletion state, legal holds, and applicable law. The console must distinguish available, expired, deleted, legally held, and inaccessible records; it must never fabricate or restore content that no longer exists.
- Reading is read-only by default. It must not send messages, alter content, change conversation membership, mark messages as read, modify read receipts, trigger typing/presence indicators, or send an immediate notification to participants.
- A separate announced-review action may display an explicit administrative notice/message to the affected participants. The owner chooses silent review or announced review for each review session; the UI must show the selected mode before opening the content.
- The silent mode suppresses per-event real-time notice only. It must not be described as invisible or undisclosed processing: the published privacy policy and pre-entry acknowledgement must explain the capability in advance.

**Owner participation and visible identity**
- The owner may participate in a conversation using one of three member-facing labels: “إدارة منصة مودة” (Mawadda Platform Management), “السوبر أدمن” (Super Admin), or “مجهول” (Anonymous).
- In anonymous mode, participants see the sender label “مجهول” and no owner profile identity is displayed to them. The backend must still bind the message to the authenticated owner UID and the platform-owner claim, and the internal audit record must preserve the true actor identity.
- Anonymous mode is not impersonation: the owner must not select, copy, or speak through another member's account, avatar, username, or identity. The message must be internally attributed to the owner even when the member-facing label is anonymous.
- The owner identity and message provenance must remain recoverable to the owner through protected audit records. Moderators and ordinary support roles must not gain access to the true identity or the review workspace.

**Authorization, audit, and safeguards**
- Enforce owner identity through the trusted backend using the server-managed `platformOwner` claim, recent authentication and fresh MFA/step-up for sensitive review sessions. Never rely on Flutter route visibility, client booleans, role strings, or client-supplied UIDs as authorization.
- Create an append-only, tamper-evident audit event for every attempt and action, including denied/failed access, review start/end, conversation/file identifier, data category, selected mode, actor UID, session/authentication assurance, server timestamp, outcome, and policy version. A case/reason field may be recorded when voluntarily supplied but is not a product-level prerequisite for the owner's ability to open a review session.
- Audit logs must be inaccessible for alteration/deletion by moderators and ordinary administrators. Protect them from generic cleanup jobs and retain them according to a documented lawful retention schedule. Alert the owner to anomalous access patterns and possible owner-account compromise.
- Keep review reads isolated from ordinary member read-state and notification pipelines. Test that silent review cannot increment unread/read markers, emit push notifications, reveal presence, or mutate message/file data.
- File review must use scoped, short-lived server-authorized access; prevent public URL leakage, uncontrolled bulk export, and access by any other role. Log previews, downloads, exports, and failed access separately. Apply malware scanning and safe rendering to uploaded files.
- The review console must provide filters for conversation/member/guest, date, file category, active/ended state, and review mode, with pagination and access-denied/expired/deleted states. Bulk access/export requires separate risk controls and must not be enabled merely because individual review is permitted.
- The capability must be covered by a data-protection impact assessment and jurisdiction-specific legal review before production use. Where applicable law requires additional limits, notices, rights, or restrictions, enforce them in policy and backend; do not use acknowledgement as a waiver of non-waivable rights.

**Implementation status:** partial technical foundation only. The backend now validates owner-only silent one-to-one conversation review requests without requiring a case reason, discovers a member's bounded direct-conversation list, and returns up to 50 messages through a read-only callable. The Flutter owner console exposes this limited flow. Owner review MFA is revalidated; authenticated denials and review/list access attempts are recorded server-side. The owner can now send administrative messages into an existing two-member conversation using the three approved labels; the backend stores the true owner UID and appends an audit record, while member chat displays only the selected label. The full conversation/file/guest review scope, exhaustive pagination, announced mode, comprehensive no-side-effect tests, tamper-evident audit chain, and legal/DPIA approval remain open. Do not expose the feature as production-ready until every release gate passes.

## 8. Rooms, events, and communities

### Guest Preview participation policy (approved amendment — 14 November 2026)

- A guest receives **60 minutes of access in each rolling 24-hour window**, measured and enforced by trusted server time and bound to the anonymous Firebase Auth identity. Sign-out, app restart, reinstall, a second device, or changing the client clock must not extend or reset the allowance.
- During the active guest window, the guest may browse public discovery/catalog/ads and join **public rooms only**. In those public rooms the guest may **send and receive text messages and audio/voice messages**.
- Guest room participation is limited to text and audio. Images, GIFs, video, PDFs, documents, arbitrary files, stickers and other media are not available to guests.
- Guests may not open or send direct/private messages, join private rooms, rent rooms, moderate rooms, send/receive gifts, read or write a wallet, transfer/top up coins, claim rewards, purchase items, or use member-only features.
- The server must check guest-session validity and room/message permissions on every join, send, read, and media-finalization operation. UI-only restrictions are insufficient. Session expiry must immediately deny protected guest content/actions; it must not delete the guest's privacy acknowledgement or unrelated audit evidence.
- Guest access must preserve the existing minimum-age and adult/minor room-audience separation. A guest with no age/audience information must not bypass those controls; the guest flow must obtain the minimum age-band information required by the approved room policy before joining an age-segmented room.
- Emulator tests may advance/reset the guest-session clock by changing emulator fixture data or using an isolated test clock. No production client, callable, or administrative UI may accept a client-supplied time override.
- **Implementation status:** approved product requirement, not yet implemented end-to-end. The current anonymous-user screen is an upgrade screen, and current room callables require a completed member record. Server session lifecycle, public-room guest membership, text/audio guest messaging, Flutter guest-room UI, and the 60-minute/24-hour emulator integration suite remain release blockers.

- Owner-created public rooms and rented private rooms with capacities 5, 10, 25, 100, and up to 1,000 where infrastructure and moderation capacity justify it.
- Configurable rental price/duration, scoped moderators, invitations, member controls, room-specific backgrounds, and room-specific finance.
- Public-room media permissions: members may use text, voice messages, stickers, and sounds; moderators may use approved static/animated images; owners have broader approved media permissions.
- Private-room media may include voice/audio/image/GIF/video subject to validation and safety controls.
- Audio maximum 1 minute; video maximum 5 minutes; image maximum 5 MB; GIF maximum 5 MB, subject to server-side enforcement and later security review.
- Events, polls, contributions, statistics, supporter rankings, and room leaderboards.
- Room rank derives from authentic activity and coin contribution, not undisclosed paid ranking manipulation.
- Rental billing, moderator assignment/revocation, mute/remove, event controls, and financial records require trusted backend authorization and audit.

## 9. Wallet, coins, transfers, and rewards

- All balances and financial mutations are server-authoritative. Never trust client balances, prices, commissions, eligibility, or purchase claims.
- Coin transfer uses a quote and atomic transaction: sender gross debit, recipient net credit, platform fee, and immutable ledger records linked by one transfer ID.
- Sender history shows gross amount, fee, recipient identifier, and net delivered. Recipient history shows net received, sender identifier, transfer ID, and timestamp.
- Example configurable commission: 20%; a 1,000-coin transfer yields 800 to recipient and 200 platform fee. This is an example, not a hardcoded rate.
- Idempotency, stale-quote rejection, replay safety, reconciliation, and auditability are mandatory.
- Coin packs and custom coin requests require owner-configured offers and verified payment before credit. Purchases must use platform-compliant payment verification.
- Rewards include daily attendance, hourly community-density rewards, six-hour level progression, seven consecutive-day streaks, and clearly disclosed ad rewards. Every reward is configurable, anti-fraud protected, and exactly-once.
- Ads must disclose conditions and time requirements; merely opening an ad must not count as completion.
- No real-money purchase or production balance until payment, fraud, refund, reconciliation, and legal controls are tested.


### 9.1 Super Admin financial controls and exceptional coin actions

- The platform Super Admin must have server-enforced emergency controls to pause/resume each financial operation independently and a global financial freeze: coin top-ups/purchases and crediting, coin transfers, wallet refunds/redemptions/withdrawals where supported, rewards/bonuses, and administrative balance adjustments. A freeze must stop new requests at the trusted backend, including requests from already-open clients; UI disabling alone is insufficient. Define safe handling for in-flight payments/transfers and reconcile provider callbacks before resuming.
- Provide member-level restrictions as well as platform-wide switches. A member-level restriction may block sending, receiving, purchasing/top-up, refund/redemption, or all wallet activity independently, with a reason, start time, optional expiry/review date, and authorized restoration.
- The Super Admin may order a documented coin adjustment, partial forfeiture, or full coin-balance forfeiture to the platform treasury/forfeiture ledger where a substantiated fraud, exploit, chargeback abuse, or serious policy violation justifies it. A suspicion alone should normally trigger a temporary hold/freeze and investigation, not irreversible confiscation.
- Every hold, freeze, release, deduction, forfeiture, and zero-balance action requires fresh step-up/MFA, a specific target UID, explicit operation type and amount, a mandatory reason/case reference, a pre-action balance/impact preview, and a separate final confirmation. High-impact actions must be protected against accidental repeat with idempotency keys.
- Execute balance changes atomically on the server and record immutable, double-entry ledger postings linked to a unique adjustment ID: member debit, platform treasury/forfeiture credit, actor UID, target UID, amount, currency/coin type, reason/case, timestamp, prior and resulting balances, and any related transaction/payment IDs. Never edit or delete historical transactions, silently overwrite balances, create negative balances, or treat a ledger adjustment as a payment-provider refund.
- Preserve purchase/refund-provider reconciliation and applicable consumer/payment law. Do not confiscate cash or claim a cash refund merely by changing a virtual coin balance. Show the affected member a clear notice and a review/appeal route unless disclosure is temporarily restricted by a lawful, documented investigation requirement.
- Audit records must be append-only and reviewable; log failed attempts and reversals as well as successful actions. Reversal is a new compensating ledger transaction, never deletion. Add operational alerts for global freezes, unusual deductions, bulk actions, and owner-account compromise.
- These controls are owner-only; no room owner, moderator, support agent, AI assistant, or client-supplied role may invoke them. The platform must remain able to restore service safely after investigation and reconciliation.

## 10. Stores, premium, and entitlements

- Stores: profile features, coin packs, titles/badges, premium benefits, and biometric elite features where approved and lawful.
- Owner-configurable prices, durations, limits, categories, availability, and entitlement rules.
- Approved premium features: animated avatar frames; colored/animated usernames; advanced profile analytics; professional profile layout and pinned sections; boosted discovery with clear labeling; profile themes/backgrounds; visitor greeting; VIP memberships/badges/tiers; hide coins; controlled ghost mode with audited identity access.
- Entitlements must be server-verified, time-bounded where applicable, revocable, and consistent across devices. UI visibility alone never grants a paid benefit.

## 11. Media retention and storage

- Proposed lifecycle: chat/room media deleted after 4 hours; profile/album images after 7 days; avatar/cover images after 30 days; stories after 24 hours.
- Retention jobs must be server-side, observable, retryable, and tested. Communicate clearly that downloaded or externally copied media cannot be guaranteed to disappear.
- Validate MIME, actual file content, size, dimensions, ownership, malware/content policy, access, and retention. Default-deny Storage until secure upload/download flows exist.

## 12. Super Admin and platform governance

- The platform owner requires server-verified `platformOwner` claim, MFA/step-up verification, session freshness, secure recovery, least privilege, and immutable audit records.
- Owner console roadmap: member lookup and account controls; registration and age policy; wallet/coin commission and reconciliation; coin packs and stores; premium entitlements; rooms and rentals; moderation, reports, appeals, blocks; platform settings and feature flags; notifications; advertising; analytics and health; backups/recovery; incidents; localization; brand/content/identity; backgrounds and visual assets.
- Account recovery must use secure reset or temporary credentials with forced change; never expose existing passwords.
- Emergency freeze, session revocation, audit review, and recovery procedures must be designed and tested.
- Administrative authority is absolute only within lawful, disclosed, secure, auditable platform governance—not unrestricted covert access.


### 12.1 Sovereign Cloud Operations and Data Lifecycle Center

- Add a dedicated **Cloud Operations & Data Lifecycle Center** to the platform Super Admin console. It is an owner-only operations area for controlled maintenance, cleanup, retention enforcement, storage reconciliation, cache/index refresh, and recovery—not a generic destructive “reset everything” button.
- Provide separately scoped operations with previewable counts/bytes/date ranges and explicit targets:
  1. **Chat cleanup/reset:** purge selected direct-chat or room-message history by selected conversation/room, date range, or approved global scope. Clearly state that this removes server-held message history and may affect participants. Never delete member accounts, blocks/reports/appeals, moderation/safety evidence under hold, or financial/audit records as a side effect.
  2. **Cloud media cleanup:** identify and remove expired, orphaned, rejected, duplicate, or owner-selected media objects in Firebase Storage and their corresponding metadata/references. Include images, videos, audio, GIFs, temporary uploads, generated thumbnails, and obsolete media derivatives. Reconcile Firestore references, Storage objects, CDN/cache copies, and lifecycle queues; do not assume deleting a Firestore document deletes the underlying object.
  3. **Obsolete advertising cleanup:** archive or purge ended/expired campaigns and their obsolete creative assets, while preserving campaign billing, impressions/clicks needed for accounting, consent/legal evidence, dispute records, and any active or scheduled campaigns. Never remove current ads merely because they are old by upload date.
  4. **Platform maintenance/refresh:** run health checks, retry failed retention jobs, reconcile storage metadata, refresh derived indexes/caches/configuration, and enter/exit maintenance mode. Firebase-managed infrastructure must not be described as “restarted” unless the relevant service actually supports and confirms that operation; prefer safe supported maintenance actions over destructive recreation.
  5. **Storage and database hygiene:** report usage, orphan candidates, expired records, failed deletions, stuck jobs, and estimated reclaimed bytes before action; support scoped cleanup by category and time window.
- **Preview-first execution:** every destructive job must first create a dry-run report showing exact collections/buckets/paths, item counts, estimated bytes, date range, exclusions, affected members/conversations/campaigns, expected effects, and whether recovery is available. The preview must be generated server-side from current data and expire after a short period; execution must bind to that exact preview/version so changed scope requires a new preview.
- **Strong owner confirmation:** require server-verified platformOwner, fresh MFA/step-up authentication, a typed confirmation phrase naming the operation/scope, a reason/ticket, and a second explicit confirmation for global or irreversible purges. Recheck authorization and scope immediately before execution. UI flags are never authority.
- **Safe execution:** enqueue idempotent, resumable, rate-limited background jobs; process bounded batches; checkpoint progress; handle partial failure and retries; expose pause/cancel where safe; prevent concurrent overlapping purges; and provide completion/failure summaries. Never run an unbounded delete from a mobile client or one long callable request.
- **Quarantine and recovery:** where legally and technically appropriate, move candidates to a time-limited quarantine/soft-delete stage before permanent purge. Verify backups and restore points before high-impact operations. Provide restore/rollback for reversible actions; clearly mark permanent object deletion and provider/CDN propagation as potentially irreversible. A backup is not considered valid until restore drills succeed.
- **Protected records (never bulk-purged by this center):** wallet balances and immutable financial ledgers; coin transfers, purchases, refunds, payment and tax/accounting evidence; admin/security audit logs; authentication and account recovery evidence; consent and privacy-rights records; verification/revocation records required for security or law; abuse reports, appeals, moderation cases, legal holds, and records subject to retention obligations. Any exceptional lawful deletion must use a separate reviewed privacy/legal workflow with scoped evidence and auditable approvals, not a generic reset.
- **No account/data wipe by implication:** clearing chats or media must not delete member accounts, profiles, friendships/blocks, room ownership, wallet balances, entitlements, or unrelated content unless each data class is explicitly included in a separately approved operation and legally eligible for deletion.
- **Immutable audit and transparency:** record requester UID, MFA freshness, reason/ticket, preview ID/hash, exact scope/exclusions, counts/bytes, job ID, timestamps, each batch outcome, failures/retries, recovery status, and final result. Log denied and cancelled attempts too. Notify the owner on completion/failure and retain a human-readable operation history.
- **Safety controls:** emergency stop, global maintenance lock, concurrency limits, budget/cost estimate, anomaly alerts, retention/legal-hold checks, environment/project identity checks, and hard prohibition on running production cleanup from development/test credentials. No operation may silently target a different Firebase project.
- **Release gate:** this capability is not live until the backend job engine, IAM/owner/MFA checks, dry-run binding, quarantine/restore, storage reconciliation, legal-hold exclusions, emulator/integration tests, backup restore drills, and production runbook are independently reviewed. The Flutter panel must clearly distinguish available, preview-only, and not-yet-enabled operations.

## 13. Owner-managed brand and content

- Dedicated owner console section for platform identity and approved public content.
- Edit approved descriptions/about text in Arabic, English, French, and Spanish.
- Manage logo variants and approved visual assets; support drafts, preview, publish, rollback, and audit.
- Manage official Facebook, Instagram, WhatsApp, and X links. Links remain hidden/disabled until real official URLs are supplied and explicitly approved. Never invent URLs.
- Legal/copyright notice currently approved for display:
  "© 2026 جميع الحقوق القانونية والتجارية والتقنية محفوظة لصالح مجموعة Production Home Company 2022. يُمنع نسخ أو إعادة استخدام أو استغلال أو تعديل أي جزء من المنصة أو هويتها أو محتواها دون إذن كتابي مسبق من أصحاب الحقوق."
- A notice is not a substitute for trademark registration, legal advice, or proof of ownership.

## 14. Security and engineering rules
- Enforce active account standing server-side for coin transfers as well as messaging and room access; suspended/banned members cannot initiate or receive new transfers.
- Recheck server-side account standing on every sensitive social action: suspended, banned, disabled, or unknown explicit account states cannot join rooms or send direct/room messages.

- Default-deny Firestore/Storage rules; privileged writes through trusted backend.
- No client-controlled admin/room-owner flags, coin arithmetic, pricing, commission, reward eligibility, or purchase verification.
- Validate inputs, enforce authorization at every callable/service boundary, rate-limit abuse, protect idempotency, and audit sensitive operations.
- Never commit credentials, private keys, service-account files, tokens, or production secrets.
- Use dependency lockfiles, reproducible toolchains, code review, static analysis, unit/integration/emulator tests, security scanning, monitoring, backups, and recovery drills.
- Keep production and test environments separated. Never run owner bootstrap or deploy without explicit authorization and independently verified target.

## 15. Release and quality gates

- A green CI run proves only the checks included in that run and commit; it does not prove production readiness.
- Test Android/iOS/tablets/Windows/macOS/Linux/web, portrait/landscape, RTL/LTR, accessibility, network failures, performance, privacy, and security.
- Verify Firebase project/app configuration, auth providers, domains, Firestore, Storage, Functions, Hosting, owner claim, and MFA in a non-production environment first.
- Complete age assurance/minor safety, reporting/blocking/appeals, moderation, legal review, monitoring, backups, and incident response before public launch.
- Merge to `main` and deploy to production only after separate explicit owner approvals.

## 16. Current known implementation blockers (living section)

The current `.firebaserc` and Web entry in `lib/firebase_options.dart` both target `mawda-app-2026`. The Android/iOS (and desktop) entries in `lib/firebase_options.dart` still contain placeholder IDs/API-key values and the wrong project ID `mawda-platform`; native app startup is not valid until FlutterFire regenerates these from the registered Firebase apps. Never fabricate values.

The root `pubspec.lock` and `functions/package-lock.json` are now committed, and CI installs dependencies with lockfile enforcement. Keep both lockfiles reviewed and synchronized with their manifests.

The real `platformOwner` claim has not been provisioned and the production MFA flow has not been verified. The owner bootstrap script is prepared but has not been run against Firebase.

Several product areas remain partial or unimplemented: complete DM and notification UX, some media workflows and device acceptance, full room lifecycle and voice/video/rental billing, automated real-money payment verification/top-ups/refunds, full owner console and service-health observability, identity/background management UI, real-device and cross-platform verification, monitoring and recovery drills. The twelve current premium store SKUs have server purchase/entitlement and emulator coverage with profile consumers; privacy add-ons remain fail-closed. Custom-title editing is now implemented and its exact-head emulator test passed. Native Android/iOS runner scaffolding and Firebase native configuration are being validated separately; the current `lib/firebase_options.dart` still contains placeholder Android/iOS project IDs/API-key values and must be regenerated from the registered Firebase apps before native app use.

The launch fallback background is an approved requirement but the final launch artwork has not yet been selected/bundled and verified.

This section must be updated with evidence as work progresses; never convert a planned requirement into a completed claim without implementation and test evidence.

## 17. MAWADDA AI — intelligent assistance and social characters

**Status:** Owner-approved product direction; specified, not yet implemented or production-authorized.

MAWADDA AI is a modular platform capability with separate trust boundaries:

1. **Technical Support Assistant:** helps members with account and app-control problems, explains approved workflows, triages errors, and prepares support cases. It may inspect only the minimum account, diagnostic, and conversation context needed for the active support case. The owner may grant additional technical-administration permissions individually. High-impact actions (account suspension, data deletion, wallet changes, refunds, permission changes, production configuration, merges, and deployments) require explicit confirmation, server-side authorization, and immutable audit records. It must never expose passwords, authentication secrets, or private keys.
2. **AI Social Characters:** owner-configured characters with distinct names, biographies, styles, dialects, languages, interests, sticker sets, activity schedules, approved placements, and interaction limits. They may host events, welcome members, join permitted public discussions, and participate in adult-only private conversations. They must not impersonate real people, claim to be human, fabricate human endorsements, or manufacture fake member counts, testimonials, reactions, relationships, or popularity metrics. Every AI social-character profile must carry a small, consistently placed AI identity badge on its avatar or cover. The badge is a concise visual AI marker only: it has no explanatory pop-up, no extra disclosure text, and no repeated AI announcements in direct chats, public rooms, or rented private rooms. AI character profiles and platform-level AI information remain identifiable as AI; AI activity and popularity metrics must remain separate from human-member metrics.
3. **Events and Engagement:** prompts, games, icebreakers, competitions, themed events, and community activities. Participation and rankings must be authentic and distinguish AI participation from member participation.

### 17.1 Privacy, data use, and oversight

- No blanket or covert access to all private messages or rooms for model training. Access to private content is limited to a specific, authorized support or safety purpose, with least privilege, case scope, access logging, retention limits, and member-facing privacy disclosures and consent where required.
- Public-room content may be processed for moderation and service operation under published rules. Private conversations must not be repurposed as general training data without a separate valid legal basis and meaningful consent. Prefer synthetic, public, or de-identified examples for improvement.
- Do not expose one member's private content to another member or to an AI character outside the authorized conversation context.
- The owner console must show which AI module accessed which data category, why, under which authorization, and when; sensitive access must be reviewable and revocable.

### 17.2 Age and interaction boundaries

- Social-character interaction and romantic features are restricted to adults (18+) whose age eligibility has been established through the platform's approved age-assurance process. A self-entered birthdate alone is not proof.
- If an account is confirmed under 18, social-character interaction is blocked. A separate, limited technical-support/reporting route remains available and must not contain romantic or social-character engagement.
- Characters may be warm, playful, affectionate, and romantically expressive with eligible adults, but must not use dependency, jealousy, exclusivity, guilt, threats, or emotional pressure to drive engagement or purchases.
- Characters must not imply that gifts, coins, subscriptions, or premium purchases buy genuine love, exclusivity, human affection, or a real-world relationship.
- Sexual content must follow applicable law and platform policy; prohibit coercion, exploitation, non-consensual intimate content, sexualization of minors, and any sexual interaction involving minors. Age gating is not permission to disregard these boundaries.

### 17.3 Monetization and authenticity

- Characters may neutrally explain available gifts, coin packs, subscriptions, and premium features, and may participate in clearly labeled promotional events.
- No fabricated scarcity, false claims of human demand, deceptive purchase prompts, hidden paid ranking, or emotionally coercive upselling.
- All purchases, gifts, entitlements, and balances remain server-authoritative, verified, auditable, and subject to the wallet/store constitution.

### 17.4 Link policy

- **Ordinary members without active biometric verification in public chats, public rooms, rented private rooms, and one-to-one private chats:** block all URLs.
- **Members with active server-confirmed biometric verification:** receive the free entitlement to send direct HTTPS YouTube (including youtu.be and youtube-nocookie.com), Facebook, Instagram, and X/Twitter links in one-to-one private chats, public rooms, and rented private rooms. Eligibility requires a future `expiresAt` and no `revokedAt`; this is not a paid feature.
- **Room owners and explicitly authorized room moderators:** allow only validated YouTube, Instagram (including Reels), and Facebook URLs in the public or rented private room they manage.
- **Platform Super Admin:** may send links to any domain in direct chats, public rooms, and rented private rooms. This exception is granted only after server verification of the platformOwner claim and fresh step-up/MFA session; it is never inferred from a client flag or room moderator role.
- The Super Admin exception permits ordinary web destinations over HTTP/HTTPS, but never executable or dangerous/non-web schemes (for example javascript:, data:, file:, ftp:), credential-bearing URLs, malformed links, or known URL shorteners (including t.co) until safe redirect verification exists. All links remain subject to malware/phishing scanning and safe preview handling where available.
- Enforce all roles and destinations server-side across text, captions, previews, stickers, and rich-content surfaces. Moderator revocation must take effect immediately.

### 17.5 Owner controls, safety, and cost

- The Super Admin can enable/disable the complete MAWADDA AI service, each module, and each individual character independently; emergency kill switches must stop new generation and revoke active character sessions promptly.
- Configure per-module and per-character permissions, data scopes, supported languages/dialects, style boundaries, allowed placements, schedules, rate limits, and moderation settings.
- Configure daily and monthly budgets, per-module/per-character quotas, model limits, alerts, hard spending caps, and automatic fail-closed shutdown at configured limits.
- Log prompts/actions at an appropriately minimized level, moderation decisions, tool calls, permission grants, data access, cost, and shutdown events. Do not retain unnecessary private message content in operational logs.
- AI tools must use a trusted backend gateway, never direct client access to Firestore or privileged credentials. The assistant may prepare code changes and run approved development checks, but cannot merge to main, deploy production, or perform destructive/high-impact operations without separate explicit owner authorization.
- Human review, appeals, incident response, abuse reporting, and rollback remain available. A kill switch does not replace these controls.

### 17.6 Delivery order and release gates

- Stage A: technical support assistant with narrowly scoped support access, safe diagnostics, audited owner-granted tools, budgets, and emergency disable.
- Stage B: social characters and event engagement after age assurance, privacy disclosures/consent, data-scope enforcement, link filtering, moderation, monetization safeguards, and cost controls are tested.
- Before release, test prompt injection, data exfiltration, cross-member isolation, unauthorized tool use, link bypasses, minor-account restrictions, emotional manipulation, purchase pressure, budget exhaustion, shutdown latency, and audit completeness.
- This section defines approved direction only. No AI capability is considered implemented, safe, or production-ready until code, tests, privacy/legal review, and release evidence exist.


## 5.1 High-assurance biometric identity verification (approved requirement)

Biometric verification is a high-assurance identity and liveness process, not a photo upload, voice recording, device unlock, or self-declared profile attribute. Implement it only after privacy/legal review and selection of a qualified verification provider or independently validated verification stack.

- **Explicit consent and transparency:** before capture, explain purpose, data categories, provider/processor, retention/deletion, consequences of approval/denial, appeal route, and the separate purposes of identity verification, anti-fraud, the recurring 1,500-coin reward for each eligible 30-day verification cycle, and verification-gated entitlements. Obtain legally valid, freely given explicit consent where required. Provide an accessible alternative review route where feasible; do not silently downgrade its assurance or label it biometric verification.
- **Identity proofing:** where the product promises that a real person is verified, require a trustworthy identity-proofing method appropriate to the launch jurisdiction (for example, a qualified provider checking an accepted identity document and matching its portrait to a live capture). A moving selfie or voice challenge alone proves neither legal identity nor uniqueness. Do not claim government-ID verification unless that exact check was completed.
- **Live capture and presentation-attack detection:** use randomized, session-bound challenges and validated presentation-attack detection for printed photos, screen replays, prerecorded video/audio, masks, face swaps, deepfakes, synthetic media, virtual cameras, injected media streams, and replayed capture sessions. Require camera/microphone provenance and integrity signals where supported; treat device integrity as a risk signal, never as sole proof.
- **Face matching and voice:** match the live face to the verified identity reference through the trusted provider where the chosen assurance level requires it. The previously proposed moving selfie (approximately 3–5 seconds) and voice liveness challenge (approximately 20 seconds) may be supporting signals only; voice must not be used to infer gender, ethnicity, health, or other sensitive traits, and voice similarity alone must not establish identity.
- **Anti-duplication and account binding:** bind each approved verification result to one authenticated Mawadda UID, a unique provider transaction/reference, capture session nonce, timestamps, assurance level, and expiry. Detect attempts to reuse another member's result, replay a completed session, create multiple accounts to farm rewards, or transfer a verified status between accounts. Use provider-supported privacy-preserving duplicate/fraud signals; do not build an unrestricted cross-platform biometric database.
- **Server-authoritative decision:** clients may start capture and display progress only. The trusted backend must verify provider-signed/webhook results or retrieve results through authenticated server-to-server APIs, validate transaction/session binding, account UID, status, assurance level, expiry, and revocation, and then atomically write the verification state. Never accept a client boolean, uploaded file, screenshot, local biometric-unlock result, or client-supplied expiry as proof.
- **Risk and review:** fail closed on missing, malformed, stale, mismatched, replayed, or unverifiable provider responses. Use rate limits, abuse monitoring, risk-based retries, and a documented human-review/appeal path for false rejects. Do not permanently label a member fraudulent based only on an automated score.
- **Reward and entitlements:** the 1,500-coin biometric-verification reward is granted after each successfully completed eligible 30-day verification cycle, only after final server-confirmed approval at the required assurance level. Grant it atomically with a unique cycle/reward/ledger ID and idempotency protection; pending, failed, expired, revoked, or merely submitted attempts receive no reward. Verification badge, free social-link publishing, and link-sharing permissions are separate server-derived entitlements that become active only after approval and remain active only while verification is valid.
- **Expiry, renewal, and revocation:** store server-owned verifiedAt, expiresAt, revokedAt, provider reference, assurance level, and policy version. Define a documented validity period and re-check triggers. Reverification is required after expiry and may be required after account recovery, suspected account takeover, provider revocation, material identity mismatch, or substantiated abuse. Revocation/expiry immediately removes the badge and dependent entitlements from backend authorization and public reads; stale client caches must not preserve them.
- **Biometric data protection:** complete a data-protection impact assessment and jurisdiction-specific legal review (including GDPR special-category requirements where applicable) before launch. Minimize capture and retention; prefer provider-side processing and short-lived encrypted transfer. Do not retain raw face/voice media or biometric templates unless strictly necessary, legally justified, explicitly disclosed, access-restricted, and covered by a deletion schedule. Encrypt in transit/at rest, isolate keys, restrict staff access, audit every access, prohibit secondary use/advertising/model training, and honor access/deletion/withdrawal rights subject to lawful retention duties.
- **No false assurance:** describe exactly what was checked (for example, “identity document and live-face match verified” versus “liveness check passed”). Never promise absolute immunity from spoofing. A verification badge indicates a completed, time-bounded check under a stated assurance policy, not a guarantee of a member's conduct or permanent identity.
- **Testing:** cover printed-photo and screen replay attacks, prerecorded media, deepfake/face-swap, masks, virtual camera and stream injection, voice replay/synthesis, challenge expiry/replay, nonce/session mismatch, provider webhook forgery, wrong UID/provider reference, duplicate-account reward farming, retries/rate limits, account recovery, expiry, revocation, stale caches, provider outage, false rejection/appeal, deletion/retention, unauthorized staff access, and ledger exactly-once behavior.



## 5.2 Recurring email and biometric verification periods + member notices (approved)

- **Email ownership verification lease:** a successful email verification is valid for 90 days (three calendar months operationally represented as 90 days from the server-confirmed verification timestamp). At expiry, email ownership must be reconfirmed through a fresh single-use, expiring email action link. A changed email address requires verification of the new address before it is treated as verified. Do not rely indefinitely on a provider's historical `emailVerified` flag: Mawadda maintains a server-authoritative `emailVerifiedAt` and `emailVerificationExpiresAt` lease.
- **Biometric verification lease:** a successful high-assurance biometric/identity verification is valid for 30 days from final server-confirmed approval. To retain all permissions and features that require current biometric verification, the member must complete a fresh verification before expiry. On expiry or revocation, all biometric-gated permissions, badge visibility, and dependent link-publishing/sharing entitlements are disabled immediately until a new verification succeeds. Do not imply that unrelated basic account access or member data is deleted.
- **Server time is authoritative:** calculate expiry from trusted server timestamps, not device clocks. Store verification policy/version, status, verifiedAt, expiresAt, and renewal/revocation history. Backend authorization and public profile projections must enforce expiry; client timers and cached badges are display-only.
- **Registration notice:** before the user submits registration, show a concise, prominent notice in the selected language explaining both cycles: email must be reconfirmed every 90 days; optional biometric verification must be renewed every 30 days to keep biometric-gated permissions active. Explain what happens on expiry, what data is processed for biometrics, the provider/retention/rights, and that the 500-coin email reward recurs after each successful eligible 90-day email verification cycle and the 1,500-coin biometric reward recurs after each successful eligible 30-day biometric verification cycle; each cycle is rewarded once only. Require acknowledgement of the schedule; obtain separate legally valid explicit biometric consent at the biometric capture step where required. Do not bundle biometric consent into general terms or make optional biometric participation a condition of basic registration.
- **Just-in-time notices:** repeat a short notice immediately before starting email verification, biometric capture, and each renewal, stating the relevant expiry period and consequences. Show the exact expiry date/time after success.
- **Reminders:** send in-app reminders and, where appropriate and consented, email reminders 7 days, 3 days, and 1 day before expiry, plus an expiry notice. Deduplicate reminders per verification cycle, respect notification preferences and quiet hours where configured, and provide a direct secure route to renew. If a provider is unavailable, explain the issue and preserve safe retry/appeal paths; never silently extend an expired biometric entitlement.
- **Expiry behavior:** at 90-day email lease expiry, mark Mawadda email ownership verification as requiring renewal and gate only actions/features explicitly requiring a current verified email; do not silently claim the address is currently verified. At 30-day biometric expiry, remove all biometric-dependent permissions until renewed. Do not claw back any legitimately earned verification-cycle reward solely because that verification lease later expires or is revoked.
- **Renewal rewards:** the 500-coin email reward and 1,500-coin biometric reward are granted after every successfully completed eligible verification cycle (90 days and 30 days respectively). The first successful verification is the first rewarded cycle. Each cycle may be rewarded exactly once; duplicate requests, replayed links/callbacks, repeated attempts within the same validity cycle, or client-side claims never create extra credits. A new reward requires expiry or a server-authorized renewal window and a fresh server-confirmed verification result. Ledger idempotency and anti-abuse controls remain mandatory.
- **Accessibility and localization:** registration and renewal notices must be available in Arabic, English, French, and Spanish, with correct RTL/LTR layout, readable dates/time zones, accessible text, and clear actions. Do not hide expiry terms in a tooltip or long legal document only.


## Amendment history

### 12 November 2026 — Sole-owner review authority, anonymous participation, and pre-entry privacy acknowledgement
- Approved the sole owner's product-level ability to review any available direct conversation (active or ended) and member/guest files without a report or case being a product-level prerequisite.
- Defined silent review (no immediate participant notice and no read-state/notification side effects) separately from announced review.
- Approved owner participation labels “إدارة منصة مودة”, “السوبر أدمن”, and “مجهول”; anonymous display never hides the true owner identity from the backend audit and never permits impersonation.
- Required versioned privacy-policy acknowledgement before member registration or guest session/content access.
- This amendment is a specification, not evidence of completed implementation or blanket legal authorization. Jurisdiction-specific privacy review and release gates remain mandatory.


### 14 November 2026 — Guest entry profile without age collection

- The guest-entry form collects only a guest-chosen username, country, and gender selection (male/female), subject to normal input validation and privacy notice. It must not display, request, infer, default, or store a guest age, date of birth, or age band. Guest age is unknown; never fabricate an age such as 18.
- Guest entry does not require email, phone, biometric verification, identity verification, or member-profile completion. The guest may enter public rooms and participate using text and audio/voice only, within the server-authoritative guest session allowance.
- Guest access does not grant member status or member capabilities. Direct/private messages, private rooms, wallet, transfers, top-ups, rewards, gifts, purchases, store, room rental, member profile features, and all non-text/non-audio media remain unavailable to guests.
- A guest who chooses to become a member enters the normal member registration/profile-completion flow. Only then are the member fields and applicable age/date-of-birth or age-band selection, email verification, optional biometric verification, privacy notices, and other member onboarding steps presented as required by the member policy. The member's age is collected only in that member flow and is never backfilled onto the earlier guest record without an explicit, validated member submission.
- Guest public-room access must be restricted to rooms explicitly classified and moderated as suitable for a general audience. Because guest age is unknown, guests must not be routed into age-restricted/adult-only rooms or use guest access to bypass room-audience controls. This is a room eligibility rule, not an age field or age question in guest onboarding.
- Server authorization remains authoritative for guest identity, guest session expiry/cooldown, room eligibility, membership, and text/audio-only message types. Username, country, and gender supplied by the client are profile inputs, not proof of identity, age, or elevated permissions.
- This amendment supersedes any earlier guest-flow requirement to ask for a minimum age band before entry. It does not remove age/audience controls for registered members or the general-audience requirement for rooms available to guests.
