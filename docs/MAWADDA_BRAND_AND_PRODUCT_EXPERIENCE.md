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
