# دستور مودة | MAWADDA Product Constitution

**Status:** Approved product baseline; implementation and release readiness are tracked separately.
**Product name:** مودة | MAWADDA
**Primary tagline:** حين تلتقي القلوب… تبدأ الحكايات.
**English tagline:** Where Hearts Find Their Story.

This document is the highest-level product and engineering reference for Mawadda. Every feature, UI flow, backend service, data model, security rule, test, operational procedure, and release decision must align with this constitution and the approved amendments recorded in the project. If an implementation conflicts with it, stop and reconcile the conflict before shipping. A documented requirement is not proof of implementation.

## 1. Mission and product principles

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
- A verified identity is not automatically a completed member profile.
- Profile fields: full name, unique username, age, profession, Arab country, region, gender, marital status, bio (maximum 500 characters), interests, and structured goals.
- Profile editing, privacy, visibility, media, and username reservation must be server-validated and tested.
- Approved email-verification reward: 500 coins once only, atomically linked to the verified account and ledger.
- Registration is fail-closed until explicitly enabled by the owner. Minimum registration age cannot be below 16; romantic dating/marriage goals are 18+.
- Self-declared age is not robust age assurance. Stronger age assurance, minor safety, market-specific legal review, and safeguarding are launch gates.
- Optional biometric verification proposal: consent-based voice liveness (~20 seconds) and moving selfie (3–5 seconds); never infer gender from voice. Minimize, encrypt, restrict, and define retention/deletion before implementation.

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
- No covert unrestricted chat surveillance. Any exceptional safety review must be disclosed, case-scoped, least-privilege, justified, and audited; no impersonation.

## 8. Rooms, events, and communities

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

At the time this constitution was added, the repository's `.firebaserc` selects `mawda-app-2026`, while `lib/firebase_options.dart` still contains placeholder-looking app identifiers/API key values and the different project ID `mawda-platform`. Regenerate from the verified Firebase app registrations; never fabricate values.

The root `pubspec.lock` and `functions/package-lock.json` were absent at the last repository inspection. Add reviewed lockfiles and enforce deterministic installation in CI.

The real `platformOwner` claim has not been provisioned and the production MFA flow has not been verified. The owner bootstrap script is prepared but has not been run against Firebase.

Several product areas remain partial or unimplemented: complete DM and notification UX, media workflows, full room lifecycle and voice/video/rental billing, stores and verified purchases, full owner console, identity/background management UI, real-device and cross-platform verification, monitoring and recovery drills.

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

