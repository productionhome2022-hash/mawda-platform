# Mawdda Platform 2026 — Phase 1 Readiness Audit

Audit snapshot: 2026-11-15  
Scope: current development branch, CI workflows, Flutter entry/auth screens, Firebase rules, Cloud Functions, media pipeline, and emulator test inventory.

This is a source-and-CI readiness audit, not a production penetration test or proof of device acceptance. Findings below distinguish implemented safeguards from deployment and end-to-end evidence still missing.

## Executive status

- Flutter analysis previously passed on commit `4ab1a04e744a8e873710701d0fc26554654d0685`; a later UI change introduced one unused-import warning, which was corrected by rendering the download widget in the active `LoginScreen`.
- The native workflow currently builds an Android **debug APK** and an iOS app **without code signing**. These are development outputs, not production distribution packages.
- The 5,000-persona load test provisions synthetic emulator identities and tests wallet transfers plus direct-message send/read. It does **not** execute a complete platform lifecycle for every persona.
- The active Flutter entry point routes through `AuthGate` to `LoginScreen`. The separate legacy `LandingPageScreen` is not the active entry path.
- Download controls are now present on the active login gateway. They remain disabled until verified public distribution URLs are supplied at build time; no fake or guessed download URL is exposed.

## P0 — Must close before declaring Phase 1 ready for real-user trial

### P0.1 — Full 5,000-persona lifecycle proof is missing

Evidence:
- `functions/test/integration/persona-load.integration.test.js` creates the full synthetic persona fixture and exercises transfer, idempotent replay, direct-message send, and recipient read.
- Its load tiers are 500, 1,000, 2,500, and 5,000.
- Separate integration suites exist for wallet/store, room rental, room events, media callables, premium profile, safety, guest sessions, and notifications, but they are not orchestrated into one lifecycle per persona.

Required closure:
- Build a scenario orchestrator with a per-persona completion ledger and a deterministic role/cohort matrix.
- Every one of the 5,000 identities must complete an assigned end-to-end path that includes onboarding/profile, discovery, direct chat, room participation, a store/economy action, notifications, safety/privacy checks, and logout/session expiry.
- Cohorts must collectively exercise rented-room creation, invitation/join/renewal/expiry, event RSVP, text/audio/image/GIF/video upload and authorized playback, and owner-only document rules.
- Emit per-persona pass/fail and stage timestamps, plus aggregate throughput, p50/p95/p99 latency, error rates, and emulator resource limits.
- Do not claim all 5,000 completed a feature unless the per-persona report proves it.

### P0.2 — Native distribution is not yet production-installable

Evidence:
- `.github/workflows/bootstrap-native-platforms.yml` runs `flutter build apk --debug`.
- The iOS job runs `flutter build ios --no-codesign`.
- Android debug APK is suitable for controlled internal testing only. The iOS no-code-sign app cannot be installed on ordinary physical iPhones.

Required closure:
- Complete Android device installation and smoke tests; create a release-signed APK/AAB only after a protected Android signing key is provisioned.
- Provision Apple Developer signing assets and profiles; create a signed IPA and validate installation through TestFlight or approved Ad Hoc distribution.
- Keep signing keys/certificates in protected GitHub secrets, never in repository files or build artifacts.
- Publish checksums and version/build metadata with each approved package.

### P0.3 — Media scanner production endpoint is not evidenced

Evidence:
- Media processing requires scanner URL/provider/secrets; `functions/src/media.ts` defines scanner URL and callback configuration with empty defaults.
- The CI scanner job builds and tests an isolated ClamAV image. The live scanner E2E script is syntax-checked, but that alone does not prove a deployed Cloud Run scanner is reachable and processing production-like uploads.

Required closure:
- Deploy the scanner only to an isolated non-production project, configure HMAC/API secrets and callback URL, and run real upload → quarantine → scan → sanitize → safe derivative → authorized playback tests.
- Verify fail-closed behavior when scanner is offline, stale, or returns malformed verdicts.
- Do not open member media delivery until this end-to-end chain is demonstrated.

### P0.4 — Download URLs and public distribution are not ready

Evidence:
- `lib/widgets/mawdda_app_downloads.dart` exposes Android and iOS choices on the active login screen.
- URLs are intentionally empty by default; buttons remain disabled until signed, installable builds are published.
- The web PWA prompt is separate from native app downloads.

Required closure:
- Supply a stable HTTPS APK release URL and a TestFlight/App Store URL after signing and approval.
- Inject the URLs through `MAWDDA_ANDROID_DOWNLOAD_URL` and `MAWDDA_IOS_DOWNLOAD_URL` at build time.
- Validate downloads on actual Android/iOS devices and ensure old builds can be retired safely.

## P1 — Required before broad rollout

### P1.1 — Device acceptance and platform-specific behavior
- Test Android permissions, microphone recording/playback, notifications, deep links, background/foreground transitions, low-memory behavior, and Android 13+ notification permission.
- Test iOS microphone permission, Face ID prompt behavior, APNs delivery, background transitions, audio session behavior, and supported iOS versions.
- Run responsive web checks across desktop/mobile widths, high-DPI displays, keyboard navigation, and screen readers.

### P1.2 — Desktop installability
- PWA manifest, app icon, and install prompt are present.
- Browser installation is user-consented and browser-dependent; it cannot be forced silently on every operating system.
- Verify HTTPS Hosting headers, manifest/icon retrieval, service worker/offline behavior, and installation instructions in Chrome, Edge, Firefox, and Safari. Browser support differs; do not claim universal one-click install.

### P1.3 — Storage and media operational proof
- Firestore and Storage client rules default-deny; approved access must therefore use authenticated callable/signed-URL flows.
- Run live non-production signed upload/download URL tests, generation pinning, unauthorized recipient denial, expiry, cleanup, and legal-hold interactions.
- Verify image/GIF/audio/video playback in Flutter web, Android, and iOS, not only backend derivative metadata.

### P1.4 — Guest abuse and cross-device controls
- Emulator tests verify the one-hour rolling session and public-room restrictions.
- Cross-device identity/abuse resistance is not equivalent to a production anti-abuse system; rate limits and abuse telemetry need live validation.

### P1.5 — Payments and store fulfillment
- Store catalog and coin purchase flows have emulator tests, but global real-money purchase activation remains disabled.
- Complete sandbox provider callbacks, duplicate/replay handling, refunds, reconciliation, and owner review before enabling real payments.

### P1.6 — In-app real-time calls
- External HTTPS audio/video streams and watch-party flows are not proof of native in-app WebRTC calling.
- WebRTC signaling, TURN/STUN deployment, permissions, reconnect, call-state and abuse controls remain a separate delivery item.

### P1.7 — Governance, operations, and legal
- Confirm final privacy/terms copy and age/audience policy with qualified review before public launch.
- Complete owner MFA recovery rehearsal, backup/PITR configuration, restore drill, alerting, crash reporting, audit retention approval, and incident response procedures.
- Retention locking and any irreversible retention configuration require explicit owner approval.

## Controls already present in source (still require deployment validation)

- Wallet transfer logic uses server-side calculations and idempotency with linked sender/recipient ledgers.
- Member-to-member PDF/document attachments are denied; owner-only document delivery is explicitly role-gated.
- Media delivery requires safe processed derivatives and verified metadata; malware-clean status alone is insufficient.
- Firestore and Storage rules are default-deny, limiting accidental direct client access.
- Guest and owner capabilities are separated; owner operations require server-verified owner claims/MFA checks.
- Test personas are synthetic and the load test asserts emulator-only endpoints.

## Required evidence to close Phase 1

1. Successful latest CI run for Flutter analyze/tests/web release and Cloud Functions/emulator suites.
2. Successful Android APK build with checksum and device installation/smoke-test record.
3. Successful iOS build artifact, followed by signed IPA/TestFlight or Ad Hoc installation proof.
4. A 5,000-persona lifecycle report with all 5,000 persona IDs accounted for and no unclassified failures.
5. Live non-production media scanner/upload/playback and storage authorization evidence.
6. Responsive/PWA install acceptance matrix across supported browsers and operating systems.
7. Approved security, privacy, backup/restore, monitoring, and release checklist.

No production deployment, paid-service activation, irreversible retention setting, or merge to `main` is authorized by this audit.


## 2026-11-15 engineering addendum — persona evidence and PWA resilience

- The PWA install prompt now handles browser contexts where `localStorage` is unavailable. Dismissal persistence is best-effort; the install prompt itself remains usable if storage access throws. Change committed as `84f8dcd2ac1e4bc19a5f9c46d375d53baa43516f`.
- The 5,000-persona integration test has been extended so each persona must send and receive a direct message, complete its assigned wallet transfer, and have its linked wallet-ledger role reconciled. The final JSON report now includes a per-persona coverage row for all 5,000 identities. Change committed as `37e3b44c824057c8fa791ed82b0505eb7f7b87ba`.
- The enhanced persona test has not yet been evidenced by a completed CI run at the time this addendum was authored. Its success must be confirmed from the run logs and uploaded report before treating the new coverage as passed.
- This extension narrows the load-test evidence gap but does not close the complete 5,000-persona lifecycle requirement. Profile/discovery, store/premium, room/rental/event, media, notifications, safety, guest lifecycle, and session termination remain separate suites or device/live non-production acceptance items.
- Previous CI at commit `84f8dcd2ac1e4bc19a5f9c46d375d53baa43516f` completed successfully for Validate Mawda, PR #2 checks, and native build. The newer persona coverage change is pending its own validation.
