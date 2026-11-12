# Mawadda Constitution-to-Delivery Traceability

**Status:** Active engineering control document  
**Product authority:** `docs/MAWADDA_PRODUCT_CONSTITUTION.md`  
**Experience authority:** `docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md`  
**Release gate:** `docs/RELEASE_READINESS_CHECKLIST.md`

This matrix connects approved product decisions to implementation phases and objective release evidence. It is not a claim that roadmap items are complete. Update it whenever a requirement, implementation, test, risk, or release decision changes.

## Non-negotiable delivery rules

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
