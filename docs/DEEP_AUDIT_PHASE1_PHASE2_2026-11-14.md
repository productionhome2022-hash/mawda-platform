# Mawdda Platform — Deep Audit of Phase 1 and Phase 2
**Audit date:** 2026-11-14  
**Audited development baseline:** `5d4bc4c9bf531d5106f9c91a47c1224729391e93`  
**Follow-up branch:** `codex/mawdda-deep-audit-profile-store`  
**Latest pre-follow-up green CI:** [run 43578704801](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43578704801), 3/3 jobs successful on the exact baseline SHA above.  
**Release decision:** Phase 1 and Phase 2 remain OPEN. This audit is not production approval.

## 1. Executive result

The current development baseline has substantial working foundations and a green exact-head CI run. The review nevertheless found important distinctions between:
- server-side purchase/entitlement creation,
- data projected into a profile,
- the actual member-facing feature consumer,
- emulator evidence,
- and real cloud/device acceptance.

The store is not a single undifferentiated feature. Twelve premium SKUs are server-allowlisted and covered by transactional emulator tests; two privacy SKUs are deliberately fail-closed. Most of the twelve have concrete profile consumers. The custom-title SKU previously exposed the catalog title but had no member editor. A follow-up now adds an entitlement-gated custom-title callable, profile editor, audit entry, and expiry tests; that change is pending exact-head CI.

The native Android and iOS project directories are absent from the development tree. Therefore the web release build does not validate Android BiometricPrompt, iOS LocalAuthentication/Face ID, native permissions, or mobile app packaging. No Android APK/AAB or iOS build is claimed here.

## 2. Store-by-store audit

### 2.1 Premium features store

| SKU | Server entitlement | Member-facing consumer | Current audit |
|---|---|---|---|
| `avatar_frame_30d` | 30-day frame entitlement | Animated avatar frame around the avatar | Implemented in Flutter; emulator purchase coverage |
| `username_color_30d` | 30-day username style | Colored display name | Implemented in Flutter; emulator purchase coverage |
| `username_animated_30d` | 30-day username style | Animated display name | Implemented in Flutter; emulator purchase coverage |
| `profile_analytics_30d` | 30-day analytics | Unique-view count over the last seven days | Server-counted and owner-visible; emulator coverage |
| `profile_layout_30d` | 30-day layout | Premium profile header/card layout | Implemented in Flutter; emulator purchase coverage |
| `profile_pin_30d` | 30-day pin | Pin bio/interests/gallery section | Callable + UI selector; emulator coverage |
| `discovery_boost_7d` | Seven-day boost | Server-side discovery ranking and boost indicator | Implemented; emulator coverage |
| `profile_theme_30d` | 30-day theme | Premium profile background treatment | Implemented in Flutter; emulator purchase coverage |
| `visitor_greeting_30d` | 30-day greeting | Owner-configured visitor greeting | Callable + UI editor; emulator coverage |

### 2.2 VIP store

- `vip_monthly` grants a 30-day VIP entitlement.
- The profile projection checks active entitlement and displays the VIP marker.
- Purchase, wallet debit, receipt, ledger, entitlement, and idempotent replay are covered by emulator tests.
- The current implementation proves the VIP entitlement/marker, not every possible future VIP benefit. Additional benefits must be individually specified, implemented, and tested before being advertised.

### 2.3 Badges store

- `badge_special` grants a badge entitlement.
- The profile displays the catalog item name as the badge label.
- The integration test includes the badge SKU in the 12-item purchase suite.
- Animated badge artwork, a badge collection/inventory screen, and badge-specific customization are not evidenced as complete; do not advertise those as shipped.

### 2.4 Titles store

- `title_custom` previously projected the catalog item name but did not let the member customize it.
- Follow-up PR #10 adds `setMemberCustomTitle`, active-entitlement and account-standing checks, 2–40 character validation, a profile audit event, a member-facing editor, and projection that hides the custom value when the entitlement expires.
- Tests cover success, missing entitlement, invalid length, and expiry. These new tests are awaiting CI on the development branch.

### 2.5 Privacy store

- `hide_coins_30d` and `ghost_mode_7d` remain disabled and non-purchasable.
- Server validation rejects attempts to enable or buy them before their actual privacy semantics and enforcement are implemented.
- This is intentional fail-closed behavior, not a defect to bypass by enabling the UI.

### 2.6 Purchase safety and owner catalog

- Member catalog reads are server-projected and omit unpublished/invalid entries.
- Owner publishing validates item ID/category and only allows purchase for the server's fulfillment-ready allowlist.
- Purchase checks member standing, current server price, active entitlement, balance, and idempotency in one Firestore transaction.
- Wallet debit, purchase receipt, and entitlement are committed atomically.
- Emulator integration covers all 12 currently fulfillment-ready SKUs, replay protection, catalog owner behavior, and rejection of privacy SKUs without a debit.
- Real-money top-up checkout, provider webhooks, refunds/chargebacks, settlement and reconciliation remain unimplemented; manual owner-approved coin purchase is a separate flow.

## 3. Member profile and social features

### Implemented foundations observed in code
- Public/private profile visibility with server-side projection and age-band/block checks.
- Editable profile fields are allowlisted and server-validated; username reservation is unique.
- Avatar/cover lifecycle and safe media references are backed by media callables.
- Premium avatar frame, colored/animated username, premium layout, theme, VIP marker, title, badge, discovery boost, analytics, greeting and pinned section have UI or server consumers as described above.
- Profile analytics count unique viewer identities per day using a hashed viewer identifier.
- Social links are gated by active local-biometric verification state and can be hidden per provider.
- Profile controls include coin gifting, block/unblock, report, safety center, privacy visibility and email/biometric cycle actions.

### Remaining profile gaps / acceptance gates
- Native device media picker/camera, upload/resume, accessibility, RTL/LTR and low-network behavior require Android/iOS device testing.
- External social-provider ownership verification (Instagram/Facebook/X OAuth and WhatsApp phone verification) is not complete merely because a URL field exists; provider review, OAuth/PKCE, token handling and revocation must be implemented before any “connected/verified” claim.
- Public profile and privacy/legal copy still need jurisdictional legal review.
- Full widget-level tests for the profile's visual states and premium effects are not present in the current Flutter test inventory; CI currently runs Flutter analysis, the available unit tests, and the web release build.

## 4. Registration, login, email, guest, and biometric review

### Email registration and sign-in
- Firebase email/password account creation, password sign-in, password reset and auth-state gating exist.
- Registration asks for an explicit privacy-notice acknowledgement, sends Firebase email verification, and signs out until the member returns.
- The auth gate blocks non-verified email accounts, offers resend and refresh, then requires the current privacy acknowledgement before member access.
- Member profile completion is a trusted callable that checks Firebase Auth email verification, registration policy, age, privacy acknowledgement, unique username, and creates the initial 500-coin email reward and ledger entry atomically.
- The 90-day renewal callable resets the Auth verification state, creates a pending cycle, and credits 500 coins only after Firebase Auth reports the same email verified again. Emulator tests simulate link redemption by updating the Auth emulator user; they do not prove real email deliverability or inbox/deep-link behavior.

### Guest lifecycle
- Anonymous Firebase Auth guest sessions, guest-specific privacy acknowledgement, restricted guest screen, upgrade by linking email/password, and explicit guest account deletion/sign-out are present.
- The guest is not granted member wallet, store or private-chat access.
- The upgrade flow still needs real Auth emulator/device acceptance for collisions, interrupted verification, link expiry, account recovery and data continuity.

### Local biometric prompt and reward — exact trust boundary
- Flutter uses `local_auth` for a native OS prompt; the app does not collect or upload biometric samples/templates.
- On successful prompt, the client calls `completeBiometricVerificationCycle`; the backend atomically applies the 30-day interval, 1,500-coin reward, wallet ledger and audit record once per cycle.
- The server explicitly records `client_claim_after_local_os_prompt`. It cannot cryptographically prove that the native prompt was shown by an unmodified app. A modified client could forge the claim.
- This is the owner-approved engagement-reward model, not civil identity proof, liveness detection, secure account recovery, or an alternative to email/password authentication. It must not authorize high-risk identity decisions.
- The client now keeps the biometric action locked until the server response completes, avoiding duplicate concurrent UI requests.
- **Critical platform gap:** `android/` and `ios/` directories are absent. Android `FlutterFragmentActivity`/BiometricPrompt configuration, iOS Face ID usage description, native builds and physical-device tests remain unimplemented/unverified.

## 5. Owner / Super Admin operations console

### Current UI and server foundations
- Member access is exposed only when the Firebase ID token contains the platform-owner claim; this is UI navigation only. Every sensitive backend callable independently checks the canonical owner claim, owner UID, recent authentication and MFA second factor.
- The console includes operations metrics, room creation, room rental pricing, coin/ad economy pricing, store catalog publishing, registration/minimum-age policy, member lookup, suspend/ban/reactivate, owner media review, safe previews, legal holds/release, direct-conversation review, owner audit-chain verification, safety review/appeals, coin purchase requests, and owner live-stream link composer.
- Owner actions that change registration, catalog, access status, pricing, coin approvals, review or legal-hold state have server-side validation and audit paths.
- The single canonical owner bootstrap script and recent-MFA session checks exist in code; no production owner bootstrap or production MFA recovery was performed.

### Owner console gaps
- The current console is primarily a long scrolling operations page with separate pushed screens, not a fully instrumented multi-dashboard/monitoring control plane.
- The overview currently reports member, room and transfer counts plus registration/transfer settings; it is not a full service-health, fraud, queue, scanner, FCM-delivery, archive, or billing observability dashboard.
- Production owner provisioning, MFA enrollment/recovery, real-device owner UX, and non-production bootstrap verification remain open.
- Full WORM archive configuration and restore controls are not proven by the presence of archive code alone.

## 6. Phase 2 media security and data lifecycle

### Implemented and covered in CI/emulators
- Upload-intent and quarantine model, scoped authorization, size/signature/generation checks.
- Isolated ClamAV scanner container, EICAR detection, image/GIF/audio/video/PDF sanitization/processing tests.
- Authenticated processing callback checks and safe derivative provenance.
- Direct/room media callables, role-aware media rules, profile media/story lifecycle, deletion/tombstones/retries, legal holds and resumed retention.
- Firestore and Storage rules emulator tests.
- Firestore/Storage emulator backup/restore verification script and CI step.

### Not yet proven in live non-production cloud
- Real GCS signed PUT/GET, expiry, replay, CORS, generation-pinned deletion and retention behavior.
- Cloud Run deployment and IAM/Secret Manager/WIF configuration for the scanner, real upload → scan → process → callback → delivery E2E, retry/dead-letter and monitoring behavior.
- Backup/PITR/replica/cache/CDN deletion and real restore behavior against the four-hour media and seven-day text retention policy.
- Physical-device upload, download, media picker, camera, audio/video playback and network interruption acceptance.

### Audit archive
- Hash-linked owner audit chain, archive serialization/verification, scheduled archive worker, bucket retention-policy validation and additional collection archive worker exist in code.
- Archive is disabled by default through `MAWDA_AUDIT_ARCHIVE_ENABLED=false`.
- No evidence in this audit that a real GCS bucket has a locked minimum-24-month retention policy, uniform bucket-level access and public-access prevention, or that a live archive/checkpoint/restore drill passed.
- Therefore immutable 24-month WORM retention is **not accepted as complete**.

## 7. CI evidence and test scope

Baseline run [43578704801](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43578704801) passed all three jobs on exact commit `5d4bc4c9bf531d5106f9c91a47c1224729391e93`:
1. Flutter analysis, unit tests and Web release build.
2. Cloud Functions TypeScript build/unit suite plus configured Firestore/Auth/Storage emulator integration and rules tests.
3. Isolated ClamAV scanner source/security tests, container build, processing tests and EICAR detection.

The follow-up branch adds custom-title fulfillment tests, biometric UI duplicate-action protection, this audit, and a CI trigger for pushes/PRs targeting the development branch. Those follow-up changes must receive a new exact-head green CI run before being marked validated.

The current Flutter test inventory contains only the coin-transfer model test and local-biometric service test. Flutter CI does not yet exercise the login, profile, shop, owner console, room or media screens as widget tests.

## 8. Required closure plan

### Must be completed in code/emulator CI
- [ ] Complete and validate PR #10 custom-title flow on a single exact development SHA.
- [ ] Add Flutter widget/integration tests for email sign-up/login/verification gate, guest upgrade/end, shop filters/purchase-disabled state, profile premium effects/expiry, and owner console navigation/error states.
- [ ] Expand owner-console controls and observability only against approved product requirements; do not invent active controls for unimplemented backend operations.
- [ ] Reconcile all constitution requirements with actual code, including social-provider verification, privacy policy version migration, guest scope and owner review scope.
- [ ] Add native Android/iOS project scaffolding and platform configuration, then run Android debug/release builds and iOS no-code-sign build in CI.
- [ ] Add a clear email verification instruction to check Inbox and Spam/Junk and verify the real action-link continuation on configured Firebase Auth domains.
- [ ] Add/verify negative tests for revoked/expired entitlements, account suspension, direct API bypass, price changes, purchase replay, and wallet ledger invariants.

### Must be completed in non-production cloud
- [ ] Configure a disposable non-production GCP project, bucket, WIF and Cloud Run scanner; complete live media E2E.
- [ ] Verify real GCS signed URLs, expiry/replay, exact-generation deletion and retention.
- [ ] Configure and lock the audit archive bucket for at least 24 months; run live archive, tamper-detection, checkpoint and restore drills.
- [ ] Verify real FCM delivery and token invalidation.
- [ ] Run owner bootstrap/MFA/recovery and payment-request workflow in a disposable non-production Firebase project.

### Deferred to pilot / launch acceptance
- [ ] Android and iOS physical-device acceptance, accessibility, RTL/LTR, network interruption and media playback.
- [ ] Independent penetration/security review, performance/load testing and incident-response exercise.
- [ ] Legal/privacy/DPIA review, localized final policy, retention and data-rights review.
- [ ] Real external payment reconciliation/refund/chargeback operations and any future payment-provider approval.
- [ ] User-trial acceptance for voice/video calling, in-app provider player experience and other features requiring real counterparties or provider accounts.

## 9. Release boundary

- PR #2 remains Draft/open/unmerged to `main`.
- PR #10 is a Draft follow-up to the development branch; it is not a production change.
- No production Firebase mutation, Cloud Run deployment, GCS bucket configuration, destructive retention schedule, or production deployment is claimed.
- Phase 1 and Phase 2 remain **OPEN** until every applicable code, emulator, live-cloud, security, legal, recovery and device gate has evidence.
