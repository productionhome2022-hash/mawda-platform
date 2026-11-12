# Mawadda Brand & Product Experience Specification

Status: Approved direction / implementation roadmap (2026-11-12)
Branch: codex/mawda-full-platform-implementation

This document records the owner's approved brand and experience direction. It is a product specification, not a claim that every visual asset or feature is already implemented, tested, or production-ready.

## 1. Brand name and messaging

- Arabic brand: مودة
- Preferred Latin brand spelling: MAWADDA
- Primary tagline: حين تلتقي القلوب… تبدأ الحكايات.
- English tagline: Where Hearts Find Their Story.
- Supporting line: مودة… عالم يجمع القلوب ويصنع الحكايات.
- Brand promise: a welcoming global social community for friendship, meaningful connection, serious relationship intentions, and shared interests.

Use MAWADDA consistently in Latin wordmarks, app-store metadata, and brand assets. Keep the Arabic name مودة as the primary Arabic identity. Before public launch, perform trademark, domain, app-store, and social-handle clearance in target markets.

## 2. Approved color system

The owner approved a five-color family:
- Deep burgundy: primary brand depth and cinematic foundations.
- Romantic rose/pink: warmth, affection, expressive interactions.
- Champagne gold: premium identity, highlights, VIP and celebration.
- Crystal cyan: freshness, active states, luminous glass accents.
- Royal/deep blue: confidence, technology, trust, security and administration.

Burgundy and champagne gold remain the anchor colors. Rose, cyan and blue are supporting colors; avoid using all colors at equal intensity. Semantic states must remain distinguishable and must not rely on color alone.

## 3. Visual language

- Cinematic, romantic, elegant, modern and globally welcoming.
- Crystal/glass UI surfaces with balanced transparency: backgrounds remain visible without sacrificing text contrast or control clarity.
- Glass buttons and cards use restrained blur, edge highlights, soft reflections and medium-intensity glow.
- Motion should feel cinematic but remain moderate, performant, interruptible, and respectful of reduced-motion preferences.
- Responsive composition for small Android phones, tablets, desktop and web.
- Keep navigation, forms, typography and critical actions legible over all imagery.

## 4. Background system

Create an optimized, art-directed background library rather than one oversized image reused everywhere.

General member-facing surfaces (landing, welcome, home, discovery, profiles, store and premium areas) may use the approved romantic cinematic family, with variations such as:
1. Moonlight and silk.
2. Rose and heart-light atmosphere.
3. Royal terrace at sunset.
4. Crystal cyan/blue moonlit atmosphere.

The general visual family blends burgundy, rose, champagne gold, cyan and deep blue. Backgrounds should be subtle enough to support content and should have mobile/desktop crops and low-bandwidth fallbacks.

Explicit exception: public rooms, rented private rooms, and one-to-one conversations must have their own distinct background and visual treatment. Do not force the romantic-couple hero background into these communication surfaces. Room owners/members may eventually select from approved room themes subject to safety, performance and moderation rules.

## 5. Logo and motion direction

The logo must be distinctive, compact, memorable and legible at app-icon size. Do not use a plain, flat, generic heart.

Preferred creative direction:
- A sculptural, dimensional, flowing/interwoven heart form, not a simple flat heart outline.
- Two abstract human profiles or two complementary forms subtly facing one another within the symbol.
- Interlaced metallic champagne-gold ribbons with restrained rose and cyan light accents.
- A sense of motion, embrace, continuity and two paths meeting.
- Avoid excessive small details, thin fragile strokes, or complex facial detail that disappears at small sizes.

Required logo lockups:
1. Symbol-only app icon.
2. Symbol + MAWADDA Latin wordmark.
3. Symbol + مودة Arabic wordmark.

Prepare flat/simplified vector variants for small sizes and accessibility, alongside the premium dimensional hero rendering. Do not rely on a raster 3D render as the only production logo.

Suggested intro animation: two luminous paths approach, flow around one another and form the sculptural heart; a subtle double pulse illuminates the symbol; then the MAWADDA wordmark and Arabic tagline appear. Include skip, reduced-motion, and low-power behavior. Keep the intro brief and never block access to the app.

## 6. Brand copy

Primary:
"مودة | MAWADDA — حين تلتقي القلوب… تبدأ الحكايات."

Short bio:
"ليست مجرد منصة… إنها عالم من اللقاءات والمشاعر والصداقات والحكايات الجميلة. اكتشف أشخاصاً يشاركونك اهتماماتك، عبّر عن نفسك، وانضم إلى مجتمع يصنع للتواصل معنى جديداً."

Official description:
"مرحباً بك في مودة MAWADDA، عالم اجتماعي صُمّم ليكون أكثر من مجرد مكان للتواصل. هنا تبدأ الحكايات بلقاء، وتنمو بالاهتمامات المشتركة، وتزدهر بالصداقة والمودة والتعارف الهادف. اكتشف أشخاصاً من ثقافات مختلفة، أنشئ ملفك الشخصي بأسلوبك الخاص، شارك لحظاتك وصورك وقصصك، وانضم إلى مجتمعات وغرف تجمع أصحاب الاهتمامات المتشابهة. استمتع بالمحادثات والتفاعل والفعاليات والهدايا والمكافآت، واكتشف عالماً من المزايا والتجارب التي تمنح حضورك طابعاً فريداً."

English:
"MAWADDA — Where Hearts Find Their Story."

## 7. Personalization and audience inclusivity

Offer optional visual personalities within the same brand:
- Romantic: rose, champagne gold and warm burgundy.
- Modern: cyan, deep blue and crystal glass.
- Classic: burgundy, gold and refined dark surfaces.

Members may select or change their preferred theme. Do not stereotype themes by gender; all themes are available to everyone. Keep room and chat themes independent from general app themes.

## 8. Product experience additions approved for the roadmap

In addition to existing project requirements, plan for:
- Smart discovery based on declared interests, goals and user-controlled preferences.
- Rich profiles, stories, posts, short-form video, reactions, comments, sharing and saves.
- Community rooms, private rentals, events, polls, scoped moderators and transparent room contributions.
- Private messaging and notification experiences.
- Wallet, linked transfer history, gifts, rewards, levels, achievements and seasonal events.
- Premium profile customization, animated frames, name styles, themes, pinned sections, profile analytics and clearly labeled discovery boosts.
- Member safety center, reporting, blocking, appeals, privacy controls and account/session management.
- Optional ice-breaker prompts, daily conversation topics, compatibility summaries based only on shared declared interests (not scientific or psychological claims), member events, creator tools and cross-cultural discovery.
- Owner-configurable store products, prices, durations, rewards, ads and feature flags through trusted backend controls.

These are approved product directions and staged roadmap items. They must not be presented as complete until implemented and tested.

## 9. Safety, trust and quality requirements

- Attractive presentation must never override member consent, privacy, safety, age restrictions or clear disclosures.
- No coercive engagement patterns, deceptive reward mechanics, fake popularity indicators or undisclosed paid promotion.
- Dating/marriage features remain restricted to adults under the existing approved age policy; friendship and non-romantic social features require appropriate age safeguards.
- Owner/admin capabilities must be server-authorized, MFA-protected, scoped where appropriate, and audited. Never expose passwords or unrestricted covert access to private conversations.
- Keep media optimized, use lazy loading/caching and responsive variants; respect data saver and low-end Android devices.
- Support Arabic RTL and English/French/Spanish LTR.
- Validate contrast, keyboard/screen-reader semantics, reduced motion, localization and responsive layouts.
- Use automated tests and device/emulator validation. A visual mockup is not evidence of backend integration or production readiness.

## 10. Implementation guardrails

- Implement on the existing development branch and review through the existing draft PR.
- Do not merge to main or deploy Firebase without explicit separate owner approval.
- Reuse existing backend contracts and data models; do not create duplicate wallet, room, profile or moderation systems.
- Keep the Firebase project configuration blocker unresolved until actual Firebase app registrations are verified. Never fabricate API keys or app identifiers.
- Report separately what is specified, implemented, CI-tested, emulator-tested, and verified against real Firebase/devices.


## 11. Cross-platform support and adaptive experience (owner-approved requirement)

MAWADDA is intended for phones, tablets, desktop computers and modern web browsers across supported operating systems. This is a release requirement, not a promise that every target is already built or verified.

Target matrix:
- Android phones and tablets.
- iPhone and iPad (iOS/iPadOS).
- Windows desktops and laptops.
- macOS computers.
- Linux desktops where supported by Flutter and the selected plugins.
- Responsive web on supported current versions of Chrome, Edge, Firefox and Safari.

Use adaptive layouts rather than simply scaling a phone screen. Validate portrait/landscape, narrow/wide windows, safe areas, keyboard and mouse, touch targets, hover/focus states, text scaling, RTL/LTR, screen readers, reduced motion, data saver and low-power devices. Maintain consistent account, privacy and security behavior across clients. Track each platform separately as implemented, build-verified, device-tested and release-ready. Apple targets require appropriate macOS/Xcode signing and build infrastructure; Linux and desktop plugin compatibility must be verified.

## 12. Identity, email verification and optional biometric assurance

- Email/password registration must use verified email before granting the approved one-time 500-coin reward. Enforce reward eligibility and idempotency on the trusted backend; never trust client flags.
- Email verification is distinct from identity verification. Explain this distinction in product copy.
- Optional biometric identity assurance is a separately consented, purpose-limited flow. The approved concept includes a short voice liveness sample (approximately 20 seconds) and a moving selfie video (approximately 3–5 seconds), subject to a documented threat model, vendor/legal review and feasibility assessment.
- Do not infer gender, ethnicity, health, personality or other sensitive traits from voice, face or biometrics. Do not use biometric matching for unrelated profiling.
- Provide clear consent, purpose, retention/deletion rules, encryption in transit/at rest, strict staff access, audit logs, vendor due diligence, appeal/manual review and an accessible alternative for people unable or unwilling to complete biometrics.
- Prefer verification tokens/results over retaining raw biometric media. If raw samples must be processed, minimize capture, restrict access, define short retention and securely delete them. No biometric feature may be represented as active until end-to-end security, privacy, legal and device testing is complete.

## 13. Security engineering and anti-abuse baseline

Treat security as a continuous engineering requirement:
- Server-authoritative authorization for every sensitive action; default-deny database and storage rules; least privilege and scoped roles.
- Strong owner/admin authentication with MFA, server-verified owner claims, session revocation, step-up checks for sensitive operations and immutable/auditable administrative actions.
- Never store or expose plaintext passwords, private API secrets, service-account keys, recovery codes or biometric templates in source control, client apps or logs.
- Validate and normalize all untrusted input on the server; enforce rate limits, abuse throttles, idempotency, replay protection, transaction integrity and anti-automation controls.
- Protect against account takeover, credential stuffing, enumeration, CSRF/XSS where applicable, injection, insecure direct object references, privilege escalation, replay, scraping, spam, fake accounts, reward farming, payment/coin fraud and malicious uploads.
- Use secure secret management, dependency scanning, static analysis, code review, security tests, emulator/rules tests, backup/restore drills, incident response and independent penetration testing before public launch.
- Log security-relevant events without logging passwords, tokens, message contents or unnecessary personal data. Provide transparent, case-based, permissioned and audited safety review; no covert unrestricted surveillance.
- Apply age-category separation, block/report/appeal controls, moderation escalation and safeguards against adult-minor private contact. Self-declared age is not robust age assurance; assess stronger controls and local legal obligations before launch.
- Security controls must not be weakened to make a feature appear functional. A failed verification or uncertain authorization must fail closed.

## 14. Core product and business rules reaffirmed

- Profiles support the approved fields, privacy visibility, interests, goals, posts, albums, stories, followers/friends and premium customization. Profile data changes go through validated trusted services.
- Wallet transfers are atomic and idempotent. Each transfer has one shared transfer ID and linked ledger records for sender and recipient: sender gross debit, fee and recipient UID; recipient net credit and sender UID; both include transfer ID and timestamp. The platform commission is separately recorded. Never use client-side balance arithmetic as authority.
- Room creation, rental, capacity, age audience, invitations, moderator assignment, billing and contributions are server-controlled and auditable. Room ranking reflects disclosed activity/contributions, not hidden paid manipulation.
- Media types, file sizes, duration limits and retention periods must be enforced by trusted services and storage rules, not merely by UI. Explain that deletion from the service cannot erase copies already downloaded by other people.
- Stores, coin packs, paid entitlements, rewards, ad rewards, pricing and durations are owner-configurable through authenticated backend operations. No reward for merely opening an ad; reward rules must be visible, verified and anti-fraud protected.
- Premium options approved include animated avatar frames, colored/animated names, profile analytics, professional profile layouts, pinned sections, themes/backgrounds, greeting messages, clearly labeled discovery boosts, VIP tiers/badges and hide-coins/ghost-mode privacy controls with appropriate audit and disclosure.
- Owner console roadmap includes trust/safety, member and room oversight, store/pricing, feature flags, wallet/commission settings, appeals, platform health, backups, incidents and localization controls. Owner authority remains technically constrained by law, platform policy, auditability and member privacy.

## 15. Landing-page legal notice

Display a discreet but readable legal notice at the bottom of the external landing/welcome page, responsive and localized where practical. Place the official GitHub profile avatar for the repository owner beside the company name as a small circular mark. Approved Arabic wording:

 > © 2026 جميع الحقوق القانونية والتجارية والتقنية محفوظة لصالح مجموعة Production Home Company 2022. يُمنع نسخ أو إعادة استخدام أو استغلال أو تعديل أي جزء من المنصة أو هويتها أو محتواها دون إذن كتابي مسبق من أصحاب الحقوق.

This notice is an attribution and reservation-of-rights statement; it does not by itself establish trademark registration, copyright ownership of third-party material, or replace legal review. Confirm the correct legal entity, ownership, jurisdiction and year before public release.

## 16. Delivery gates and evidence

Every feature must be reported in separate states: specified, implemented, automated-test passed, emulator/integration-tested, real-service verified, device-tested, security-reviewed and production-approved. Do not collapse these into a single "done" label.

Release gates include:
1. Reproducible dependency lockfiles and pinned toolchains.
2. Passing analysis, unit, integration, rules, web and platform builds.
3. Verified Firebase project/app registrations and secure deployment configuration.
4. Real-device testing for each supported platform and screen class.
5. Security/privacy review, biometric vendor/legal review where applicable, penetration test and recovery drills.
6. Accessibility, localization, performance and data-retention verification.
7. Explicit owner approval for merge and production deployment.

## 17. Company social links and owner-managed brand content (new owner-approved requirement)

### 17.1 Company social links beneath the legal notice
Show a compact, accessible social-links row directly beneath the Production Home Company 2022 rights notice on the landing/welcome surface. Reserve distinct entries and recognizable icons for:
- Facebook
- Instagram
- WhatsApp
- X (formerly Twitter)

The links are intentionally unconfigured and must not point to guessed, placeholder, personal or unofficial destinations. Until the platform owner supplies and publishes the verified official URLs, render the entries as disabled/hidden (never as misleading active links). The owner can set, edit, disable and publish each destination independently from the Super Admin brand-management section. Validate allowed URL schemes and expected hostnames per provider; reject javascript:, data:, malformed URLs and unrelated domains. For WhatsApp, accept an official wa.me or approved WhatsApp destination format. Open external destinations safely and accessibly, with clear labels and screen-reader semantics. Social destinations are public content and must not expose private admin data.

### 17.2 Super Admin brand and content management
Add a dedicated section within the existing Super Admin console named “إدارة هوية ومحتوى المنصة” (Brand & Platform Content). It must allow the authenticated platform owner to manage, preview and publish:
- Arabic and English brand descriptions/bios for the platform and app, with French and Spanish localization fields as the localization workflow supports them.
- Short bio, full platform/app description, landing-page introductory copy, supporting tagline and selected editable public-facing text blocks.
- Brand logo assets and logo variants (symbol-only, Arabic wordmark, Latin wordmark), including replacing the current logo when a new approved identity is ready.
- The four official company social destinations (Facebook, Instagram, WhatsApp and X), with per-link enable/disable and publication state.

Do not make every arbitrary UI string editable through an unsafe generic text replacement mechanism. Define a versioned, typed allowlist of content keys and locales, with field length limits, safe text rendering (no raw HTML/script), URL validation, and fallback to bundled defaults when a field is absent or invalid. Preserve brand consistency by keeping core legal/ownership notices protected from accidental edits; changes to the legal notice should require a separate explicit high-risk confirmation and audit event.

### 17.3 Draft, preview, publish and audit
- Provide draft editing and a preview of the landing page before publication.
- Save drafts separately from the currently published public configuration.
- Publish atomically so members never see a partially updated set of copy, logo and links.
- Record the actor UID, timestamp, changed keys, prior/new version identifiers and reason in an immutable server-side audit event; do not place secrets in audit payloads.
- Require server-verified platformOwner authorization, recent/step-up MFA for publishing or changing logo/social destinations, and rate limits. Never trust a client-side role flag.
- Public clients may read only the sanitized published configuration. Drafts, audit history and unpublished URLs must remain owner-only.
- Store uploaded logos in a dedicated restricted Storage path. Validate file signature/type, dimensions and size on the trusted backend; strip unsafe metadata where feasible, generate optimized responsive variants, and prevent executable content. Use a secure upload/publish workflow rather than accepting arbitrary remote image URLs.
- Retain previous published versions for rollback, with rollback itself audited and owner-authorized.
- Provide accessible labels, RTL/LTR support and responsive presentation. If a social URL is not configured, do not render an active icon/link.

This section is an approved requirement and implementation specification. It does not mean the management UI, callable backend, storage workflow or public dynamic configuration is already implemented. Deliver and verify these as a single end-to-end feature, including authorization/rules tests, localization tests, preview/publish/rollback tests and responsive device checks.

### 17.4 Owner-managed backgrounds and visual assets
Extend the Brand & Platform Content section so the platform owner can manage the published background imagery used across the app and website without requiring a new app release for ordinary content changes. The owner workflow must support:
- Uploading, replacing, selecting, previewing, publishing, disabling and rolling back background images.
- Assigning backgrounds to explicit, typed placement slots (for example: landing/welcome screen, public discovery surfaces, profile surfaces, and other approved shared surfaces). Do not apply a global background to private one-to-one chats or rented public/private rooms, which retain their independent background settings and policies.
- Separate desktop, tablet and phone crops/variants where needed; portrait and landscape previews; focal-point positioning and safe-area checks.
- Optional localized or campaign-specific variants only through an explicit, versioned configuration model with clear fallback behavior.
- Image format/type, file-signature, dimension, aspect-ratio and file-size validation; optimized responsive derivatives, caching and CDN delivery where supported; reject executable or malformed files and strip unsafe metadata where feasible.
- Accessibility and readability controls: preview text and controls over the image, configurable approved overlay/contrast treatment, reduced-motion behavior, and a safe bundled fallback if loading fails.
- Draft/preview/publish/rollback workflow consistent with section 17.3. Publication is atomic; each change records owner UID, timestamp, placement, asset/version identifiers, reason and prior/new configuration in the immutable audit trail.
- Server-verified platformOwner authorization, recent/step-up MFA for publication, restricted Storage paths and public read access only to currently published sanitized assets/configuration. Draft assets and unpublished variants remain owner-only.
- No arbitrary remote image URLs or client-side Storage/Firestore writes to publish backgrounds. Use a trusted upload and validation pipeline.

This requirement covers shared platform/app surfaces only. Existing special-purpose backgrounds for one-to-one chats and rented rooms remain independently governed. Background management is a product requirement, not evidence that its UI, upload pipeline, delivery configuration or tests have already been implemented.
