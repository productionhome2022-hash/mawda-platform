# Mawdda Platform — Test Account System

Status: **Phase 0/1 foundation**. This specification and its validated persona catalogue are committed; it does not claim that Firebase test users, profile screens, owner console impersonation, payment rails, or every end-to-end scenario have already been provisioned.

## Safety boundary
- All test identities and seeded data belong only to Firebase Emulator Suite or a dedicated non-production staging project.
- Never seed test accounts, balances, entitlements, biometric assertions, owner claims, or fake purchases into production.
- Emulator data is synthetic. Staging must use isolated Auth, Firestore, Storage, Functions, payment-provider sandbox credentials, and test email routing.
- A persona label is not an authorization grant. Every callable and Firestore/Storage rule must enforce the same server-side authorization as production.
- Do not implement owner impersonation by allowing a client to set isSuperAdmin, platformOwner, role, biometric status, wallet balance, or entitlements.
- Do not represent a simulated biometric fixture as proof of a real device biometric. Hardware enrollment and server-issued verification are separate acceptance tests.
- Use payment-provider sandbox/test mode only. No live card charges or real coin top-ups.

## Persona catalogue
The machine-readable catalogue is functions/test/fixtures/test-account-personas.json.

1. **guest-preview** — anonymous visitor; one hour per rolling 24 hours. May browse public discovery, shops/catalogue and ads, join public rooms, and send/receive text and audio messages there only. No direct messages, private rooms, room rental/moderation, gifts, rewards, wallet, purchases, images, GIFs, video, documents or member-only data. Emulator-only test clock controls can advance/reset time; they must never be callable in staging/production.
2. **email-member** — Firebase email/password account with email verification completed in the emulator; exercises the ordinary member entitlement set.
3. **biometric-member** — verified email member plus a separately seeded, expiring biometric-verification fixture in emulator only. The app must still exercise the actual biometric challenge flow on supported physical devices before claiming hardware acceptance.
4. **owner-operator** — isolated owner-console test identity. Owner actions remain blocked unless the test environment completes the same MFA second-factor flow and recent-auth requirements enforced by hasPlatformOwnerSession. A persona fixture must never bypass MFA or create a production owner.
5. **counterparty-member** — a second ordinary member to exercise two-sided conversations, transfers, gifts, rooms, blocks, reports and wallet ledger consistency.

The first three user-facing personas requested are retained; the extra counterparty and owner identities make multi-actor and sovereign-console tests repeatable.

## Required profile fixtures
Each account must have a complete, synthetic profile: display name, unique handle, avatar fixture, cover fixture, biography, locale, profile visibility, age-band fixture where policy requires it, account state, badges/titles fixture, shop entitlements, wallet fixture, room permissions, notification preferences, and test labels. Sensitive data must be fabricated. Never copy a real member's profile or media.

The app's canonical user schema is authoritative. Before writing users/{uid}, the seeder must be aligned with the current UserModel and server profile projection; until then, fixtures are stored separately and must not masquerade as production-ready member documents.

## Capability and scenario coverage
- Authentication: anonymous guest, email verification, expired/revoked sessions, sign-out, account upgrade and re-authentication.
- Guest boundary: browse public discovery, shop catalogue and ads; join public rooms and send/receive text and audio there. Deny direct messages, private rooms, images/GIF/video/documents, wallet, rewards, gifts, room rental and all purchase mutations.
- Member profiles: create/edit/view privacy, profile media, premium layout, pinned sections, themes/backgrounds, avatar frames, colored/animated names, analytics, greeting, VIP badges and discovery boost.
- Chat/media: direct and room messaging, delivery/read receipts, block/report/delete, retry/idempotency, upload/download and retention. Members may exchange only ordinary images, GIF, audio and video; PDF/documents remain owner-only.
- Wallet/economy: coin packages, sandbox top-up lifecycle, balance checks, two-sided transfer ledger, fees, gift debit/credit, duplicate request protection, insufficient balance and reversal/refund paths.
- Shops: catalogue visibility, every purchasable feature, entitlement activation/expiry/renewal, price changes, insufficient balance, idempotency and refund/rollback.
- Rooms: public-room rental, private-room rental, expiry, owner/moderator controls, admission rules, billing and renewal.
- Ads: visitor/member visibility, impression accounting and ad-price configuration without fake revenue in production.
- Biometric: genuine OS prompt and server-verifiable challenge; a button press or permission prompt alone is not proof of identity. Any reward must be granted once, only after the authoritative verification event.
- Owner console: MFA enrollment/sign-in, recent-auth enforcement, audit chain, member lookup, moderation, bans, settings, store/economy controls, room controls, reports, exports, retention and emergency actions. Every mutation must create an auditable event.
- Regression: Flutter analyze/test/build; Functions build/unit/integration; Firestore and Storage rules; emulator integration; staging smoke tests.

## Execution stages
**Stage 1 — identities and profiles:** provision isolated Auth identities, synthetic profile/media fixtures, persona switcher and resettable emulator clock. Validate account-state and profile rendering.
**Stage 2 — access control:** test every route, callable, query and storage path as guest, ordinary member, biometric member and owner. Negative tests are mandatory.
**Stage 3 — transactions and commerce:** wallet, coin sandbox, gifts, store purchases and entitlements with transaction/idempotency assertions.
**Stage 4 — communications and rooms:** direct chat, permitted media, public/private room rental, membership and retention.
**Stage 5 — owner sovereignty:** MFA-backed owner workflow and complete audit verification. No bypass for convenience.
**Stage 6 — release gate:** CI matrix, staging smoke tests, evidence report and explicit approval before production deployment.

## Acceptance criteria
A scenario passes only when UI behavior, server result, persisted state, audit/ledger evidence and denied unauthorized paths all match expected outcomes. A successful Flutter build alone is not feature acceptance. Report PASS, FAIL, BLOCKED or NOT IMPLEMENTED; never mark unexecuted scenarios as passing.

## Immediate next implementation tasks
- Align fixtures to canonical user/profile model and existing callable contracts.
- Add emulator-only provision/reset tooling with strict emulator-host and project-ID guards.
- Build a private owner-only test-account dashboard and profile preview/switcher.
- Add scenario runners for guest time-window overrides, email verification, biometric challenge, wallet/store, chat/media, room rentals and owner MFA.
- Add CI jobs for the Functions test matrix and emulator rules/integration suites.