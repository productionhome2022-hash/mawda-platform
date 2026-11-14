# Mawda Platform — Phase 1 + Phase 2 final acceptance ledger

Snapshot: 2026-11-13  
Development branch: `codex/mawda-full-platform-implementation`  
Last code-tested commit: `5a3b01e175da153aed122e26527f1276a6215ee6`  
Validation: [GitHub Actions run 43472163162](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43472163162) — completed successfully, 3/3 jobs on the exact tested commit.

> This is an acceptance ledger, not a release authorization. A green CI run proves only the automated checks listed below. It does not prove deployed infrastructure, real devices, backup/restore behavior, legal compliance, or production readiness.

## A. Phase 1 — application and trusted-platform foundation

| Capability | Current implementation/verification | Acceptance |
|---|---|---|
| Firebase Auth and authenticated app entry | Auth foundations, verification/reset and auth-state gating in the development PR | Code/CI coverage; production Firebase options and owner MFA recovery remain open |
| Profile completion and privacy controls | Server-side completion, username reservation, profile privacy and allowlisted edits | Code foundations; final legal policy and jurisdictional review open |
| Coin transfers and ledger | Server-calculated commission, freshness/idempotency checks and linked sender/recipient/platform ledger entries; manual external-payment coin requests now have member/owner UI and trusted callables | Manual package/custom lifecycle, owner DM instructions, no-credit-before-approval, atomic ledger/audit credit, replay protection and withdrawal passed Firestore-emulator integration on exact tested SHA `5a3b01e`. Automated payment, refunds/chargebacks and reconciliation remain open |
| Direct and room messaging | Authenticated callables, validation, idempotency, scoped reads, deletion and read cursors; owner-only live-stream broadcast callable and direct/room UI cards | Exact-head tests cover owner authorization, URL safety, direct chats, public rooms, active rented rooms, expired/closed room rejection, replay and deletion. Official in-app embedded player and upper-half chat layout remain open; external-source fallback is implemented |
| Owner review and audit | Silent/announced review, owner participation modes, server authorization and hash-linked audit verification/export | Automated tests; immutable checkpoint/24-month archive/restore and full audit export scale proof remain open |
| Rooms and moderation | Discovery/join, owner creation, scoped moderator permissions, mute/remove and audit | Code foundations; rental billing, room lifecycle/transfer, voice/video/events and load/device testing remain open |
| Store and entitlements | Catalog/purchase/receipt/ledger foundations; VIP/title consumers; manual top-up request flow added separately; other categories fail closed | Store-purchase and manual top-up emulator integration passed on exact tested SHA `5a3b01e`. Remaining premium consumers and all automated real-money payment/refund operations remain open |
| Biometric verification | Server-derived entitlement checks | Provider/capture and recurring verification remain open |
| Privacy and guest policy | Member acknowledgement/version/hash and server enforcement; Firebase anonymous users classified as guests | Final localized legal policy and unauthenticated guest lifecycle remain open |


### Manual coin purchase requests — implementation candidate (13 November 2026)

- Members can request an active fixed package or a custom coin quantity. The member cannot set or alter the agreed price.
- The owner console lists requests, records negotiated quantity/price and manual payment instructions, and sends those instructions as an owner-authored message in the member's direct conversation.
- The member can view request status/instructions and open the owner conversation from the wallet's coin-purchase screen.
- Owner approval requires the server-verified sole-owner claim and a recent MFA session, an explicit external-payment-verification assertion, a bounded external reference and verification note.
- Approval atomically credits the member balance, creates the wallet ledger entry, marks the request approved and records the owner audit entry. Replays are idempotent; pending requests and instruction delivery do not credit coins.
- Rejection and member withdrawal are supported. Manual requests can be paused by the owner. Automated checkout remains hard-disabled; no provider, webhook, card storage or automatic issuance exists.
- Unit validation and Firestore-emulator lifecycle tests passed on exact tested SHA `5a3b01e` in run `43472163162`. The owner still performs external payment verification manually.


### Owner live-stream broadcasts — implementation candidate (13 November 2026)

- Owner-only callable supports direct conversations in which the owner is a participant, active public rooms, and active rented private rooms. The owner does not need ordinary room membership.
- Server validation accepts HTTPS only and rejects credentials, IP-literal/local hosts, unsafe ports, malformed hosts, control characters and known shorteners. The server does not fetch or resolve submitted URLs, avoiding server-side request forgery.
- Broadcasts are idempotent, auditable and rendered as stream cards in direct/room chat. Unsupported embedded sources open the original URL; no autoplay, proxying, downloading, DRM bypass or restriction bypass is implemented.
- Emulator tests cover owner-only authorization, direct conversation scope, public rooms, active rented rooms, closed/expired room rejection, unsafe URL rejection, replay and message deletion.
- **Still open:** provider-specific official embedded player adapters and the requested upper-half player/lower-half chat layout. Current UI is a secure link-card plus open-original fallback, not an in-app player.

## B. Phase 2 — media security, delivery, retention and audit

| Capability | Exact-head automated evidence | Acceptance |
|---|---|---|
| Upload intents and quarantine | Authenticated scoped intents, finalization checks, generation/size/signature validation | Unit/emulator coverage passed |
| Owner/member/guest authorization | Trusted uploader classification, owner/MFA-gated review and access controls | Unit/emulator coverage passed; guest lifecycle remains limited to Firebase Anonymous Auth |
| Malware scanning | Isolated ClamAV image, scanner tests and EICAR detection | CI passed; deployed Cloud Run E2E remains open |
| Safe processing | GIF animation-preserving sanitation, audio/video transcoding, raster-flattened PDF, bounded outputs and provenance | Real processor integration tests in scanner container passed |
| Derivative trust | Typed callback validation and backend object/hash/generation/provenance verification | Unit/integration tests passed |
| Chat media send/receive | Direct/room UI and trusted callables for supported images/GIF/existing audio/video; owner-originated PDF only | Emulator/Flutter CI passed; physical-device checks open |
| Media access | Membership/linkage/status/expiry and generation-pinned short-lived URLs | Emulator tests passed; real GCS HTTP expiry/replay open |
| Erasure and retention | Exact canonical original/derivative cleanup, tombstones, retry and late-object reconciliation | Firestore/Storage emulator tests passed |
| Legal holds | Media hold/review/release; protects all supported derivative classes and resumes deletion; message legal-hold tests | Expanded exact-head emulator tests passed |
| Profile media/stories | Safe avatar/cover selection/reset/expiry and story publish/feed/expiry | Emulator integration tests passed |
| Rules | Firestore and Storage deny/authorization tests | CI passed |
| Audit | Owner audit export pagination/redaction and media operational audit paths | Automated tests passed; immutable 24-month archive/checkpoint/restore remains open |

## C. Retention policy encoded in the current candidate

- Stories: delete media when the story expires.
- All direct, public and rented-private chat text: delete no later than 7 days after sending.
- All direct, public and rented-private chat media: destroy within 4 hours of sending/upload.
- Profile gallery: purge on the approved 7-day cycle.
- Superseded avatar/cover: delete within 30 days; expired selected custom media falls back to Mawda defaults.
- Operational media logs: 90 days.
- Sensitive owner/security audit evidence: 24 months, subject to immutable checkpoint/archive and legal-hold controls before any destructive expiry.
- Legal holds must be narrowly scoped and audited. Release resumes the underlying expiry policy.
- Retention workers remain disabled by default. No destructive production schedule has been enabled.

## D. Final automated CI result

Run [43449287825](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43449287825) on code commit `368c6ac0ab9db01c236a4f77a4bf66dadb80ade0` passed:

1. Scanner job: source/security contract checks, Docker build, GIF/audio/video/PDF processing integration tests inside the image, EICAR detection.
2. Cloud Functions job: TypeScript build/unit tests; media authorization/audit; seven-day retention; direct-message deletion; coin-transfer/store-purchase transactional integration (4/4 passed); owner audit export; expanded media legal hold/release; profile media lifecycle; message legal hold/resumed retention; Firestore and Storage rules.
3. Flutter job: strict lockfile install, `flutter analyze`, `flutter test`, and `flutter build web --release`.

Web build, Functions build and lockfile artifacts were produced. These are not deployed services.

## E. Remaining mandatory closure gates

- [ ] Run `.github/workflows/nonproduction-media-verification.yml` against a disposable non-production GCP project/bucket after the owner provisions WIF repository variables. Verify real signed PUT/GET, expiry/replay, byte limits and exact-generation deletion/retention safeguards.
- [ ] Deploy and exercise the scanner in non-production Cloud Run: upload → ClamAV → type-specific processing → authenticated callback → safe derivative → authorized recipient delivery. Verify IAM, Secret Manager, retries/dead letters and monitoring.
- [ ] Prove backup/PITR/export/replica/cache/CDN deletion and restore behavior against the four-hour media and seven-day text policy.
- [ ] Perform Android and iOS physical-device acceptance, including picker/camera, permissions, upload/resume, URL refresh, network interruption, accessibility and layout.
- [ ] Decide/implement voice-note capture and in-app audio/video/PDF playback if these are required for the approved product experience; current audio selection is file-based and audio/video/PDF open externally.
- [ ] Complete remaining Phase 1 product/legal items in the PR scope: final privacy/legal documents and legal review; complete guest lifecycle; push and abuse/block/report/appeal/age-safety workflows; room billing/lifecycle/voice-video/events; remaining premium-store entitlements and real-money payments/refunds; biometric provider/capture/recurring verification; immutable 24-month audit archive/checkpoint/restore; production Firebase configuration and owner MFA recovery; monitoring, penetration, accessibility and performance tests.

## F. Release decision

**Automated code gate: PASS on exact code commit `368c6ac0ab9db01c236a4f77a4bf66dadb80ade0`.**  
**Phase 1 + Phase 2 overall acceptance: OPEN.**

The wallet/store integration test and store-catalog projection fix are included in the exact tested code commit above. The PR remains draft/open/unmerged. No production deployment, production Firebase mutation, destructive purge, or retention-worker activation has been performed. Do not advance to Phase 3 or production until the applicable closure gates above have evidence and the owner explicitly approves the release boundary.


## G. Owner-approved follow-up requirements added 13 November 2026

See `docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md` for the full requirement and test matrix.

- **Owner live-stream/video links:** specified for owner-to-member direct conversations, public rooms and active rented private rooms. Implementation remains open: owner-only callable, room membership bypass limited to verified owner, audit/idempotency, canonical URL validation, message rendering and split-screen playback are not yet complete.
- **Split-screen player:** required in the upper approximately 50% of the active conversation viewport while messages remain visible below. Provider restrictions must be honored; unsupported embeds fall back to opening the original HTTPS link.
- **Manual coin requests:** package or custom-quantity request, owner-provided payment instructions, owner-recorded external verification, then one atomic owner approval that credits coins and ledger. No gateway, no automatic cash payment, and no coin issuance before owner approval. Backend/UI/integration tests remain open.
- **Logout:** the main member shell currently has a logout action and AuthService calls Firebase signOut. Owner reachability, push-token failure handling and end-to-end auth-gate acceptance still need explicit tests.
- These are additional Phase 1/2 acceptance items; Phase 3 remains paused until the owner presents and approves its proposal.


## H. Verified follow-up implementation and exact-head CI — 13 November 2026

Latest verified development head: `9f11b4796fab3c5cad64e003c4cc90d2ff83666d`.

GitHub Actions run [43474826351](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43474826351) completed successfully on that exact head:
- Cloud Functions compile, unit tests and emulator integration suite: PASS.
- Flutter analysis, tests and release web build: PASS.
- Isolated ClamAV scanner security tests, Docker image build, media processing and EICAR detection: PASS.

The preceding failure in run 43473863520 was a test-harness import omission: the canonical-owner test referenced `listOwnerCoinPurchaseRequests` without destructuring it from the compiled Functions exports. The callable existed. The test import was corrected in commit `9f11b4796fab3c5cad64e003c4cc90d2ff83666d`, and the exact-head rerun passed all three jobs.

### H1. Manual coin purchase requests — implemented foundations, automated CI passed

- Member UI supports fixed package requests and custom coin quantity requests.
- Owner UI lists requests, sends payment instructions, records external payment verification and approves or rejects requests.
- Member can withdraw an eligible pending request.
- Pending/instruction states do not issue coins. Owner approval uses the server transaction to credit balance, create wallet ledger/audit records, and is idempotent.
- Automated checkout remains disabled. No payment gateway, card processing, bank credential storage or automated custom-quantity settlement is enabled.
- Emulator integration tests cover package request, no-credit-before-approval, owner instruction delivery, approval/idempotency, custom request/withdrawal and owner-claim denial.
- Remaining: validate real owner bootstrap/MFA on a disposable non-production Firebase project, verify direct owner/member payment conversation UX end-to-end on devices, reconcile real external payments and operational disputes/refunds, and complete final UI/accessibility acceptance.

### H2. Owner live-stream link broadcasts — initial end-to-end link workflow implemented; split-screen player remains open

- Server callable `sendOwnerLiveStream` is owner-claim/MFA-gated, validates bounded HTTPS URLs, rejects credentials, IP literals, local hostnames, known shorteners and non-standard ports, and performs no backend URL fetch or proxying.
- It supports an owner/member direct conversation, an active public room, and an active rented private room; closed and expired rooms are rejected.
- Writes an idempotent `live_stream` message and owner audit record. Direct-message and room message readers expose the stream metadata.
- Owner UI has direct-conversation and room broadcast composers; member direct/room views show the source link and open it externally.
- Emulator tests cover direct and room sends, replay idempotency, non-owner denial, unsafe URL rejection, closed room denial and expired private rental denial.
- **Not complete:** the requested in-app upper-half player with the conversation/room visible below, close/dispose behavior, provider-specific official embed/player adapters, device playback acceptance and robust high-volume room notification fan-out. Current behavior deliberately opens the original HTTPS source externally and does not bypass DRM, login, paywall, geoblocking or embedding restrictions.

### H3. Owner identity and security — bootstrap safeguards exist; production provisioning remains open

- `functions/scripts/bootstrap-owner.cjs` provisions a single owner registry record transactionally, rejects a second different UID, requires a verified enabled account and enrolled MFA, and applies the matching `platformOwner` and `platformOwnerUid` custom claims with an audit record.
- Server owner-session checks require the claim UID to match the authenticated UID, a second-factor token and authentication within 15 minutes.
- No production owner bootstrap or production Firebase mutation was performed in this work. The canonical owner account, MFA recovery and real token lifecycle still require controlled non-production verification and explicit production authorization.

### H4. Current release boundary

- PR #2 remains open, draft and unmerged. No production deployment or production resource mutation was performed.
- Phase 1 + Phase 2 overall acceptance remains OPEN despite the green exact-head CI. Green CI validates only the automated checks executed on that commit.
- Non-production GCS/Cloud Run scanner E2E, signed URL and generation-pinned deletion, backups/PITR/restore, FCM real delivery, mobile-device acceptance, privacy/legal review, penetration/accessibility/performance tests, owner MFA recovery and immutable 24-month audit archive/checkpoint remain release gates.
- Generated Flutter web output and Firebase CLI cache are removed from the PR as file deletions; `.gitignore` continues to exclude future generated output. The release workflow rebuilds `build/web` from the committed Flutter source and lockfile.
- Phase 3 remains paused pending the owner's separate proposal and approval.


## I. 14 November 2026 — current implementation and acceptance reconciliation

This addendum supersedes older snapshot statements above wherever they conflict with the current development branch. Historical test-run references remain as historical evidence only.

### Exact-head automated validation
- Current reconciled code head at the time of this addendum: `7aa8e7c031001ebdf326552225021182c116fd4e`.
- [Run 43606233324](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43606233324) passed all three validation jobs: Flutter analysis (no issues), 11 Flutter tests, Web release build; Cloud Functions build and configured emulator integration/rules suites; isolated scanner tests and image build.
- [Run 43606228297](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43606228297) generated native Android/iOS runners, configured Android/iOS/Web Firebase options, built an Android debug APK, completed an unsigned iOS build, and committed the generated native scaffolding.
- A later shared member audio-controls implementation was included in the green Flutter analysis/tests/Web build and native builds. A redundant guest-room approval predicate was removed after that green run; its exact-head rerun is tracked separately.

### Current product corrections
- Guest preview is no longer merely an anonymous account marker: the development branch implements age-free username/country/gender onboarding, guest privacy acknowledgement, trusted 60-minute session and 24-hour cooldown, all-ages approved public-room discovery, text/audio send/receive, and server-side denial of private/adult/unapproved rooms, DMs, wallet, store, gifts and member-only operations. Emulator suites cover guest session/privacy and seeded persona interaction. Physical-device UI-to-callable tests and anonymous-account recreation/App Check abuse resistance remain open.
- In-app audio capture and playback are implemented in guest rooms, member direct chats and member public rooms. CI proves analysis/build compatibility; device microphone, permission, upload, playback, CORS and interruption acceptance remain open.
- Android/iOS native project scaffolding and Firebase app configuration are now generated in CI. Android debug APK and unsigned iOS build succeeded; neither is a signed store-ready release.
- The biometric 1,500-coin reward is intentionally disabled fail-closed. A local Android/iOS OS prompt is not cryptographic server proof; the backend rejects client-only claims without wallet credit or entitlement. Re-enable only after challenge-bound device-key proof, nonce freshness, UID/platform/key binding, replay/revocation/expiry controls, atomic idempotent credit and real-device acceptance.
- The 90-day email verification renewal callable and emulator coverage exist; real Firebase Auth email delivery, link continuation and device acceptance remain open.
- The premium catalog has 12 server-allowlisted purchasable items with emulator coverage for wallet debit, receipt, ledger, entitlement projection and idempotent retry; two privacy add-ons remain fail-closed until their full semantics are implemented.
- Member inbox and two-way blocked-chat read privacy are implemented in separate Draft PR #13; premium purchase-to-profile coverage is in Draft PR #15; isolated seeded test personas and test-center runbooks are in Draft PR #16. These PRs remain unmerged.

### Remaining Phase 1/2 release gates
- Live non-production GCS signed-upload/download, actual bucket reconciliation, scanner Cloud Run deployment/IAM/WIF, media retention and exact-generation deletion.
- App Check/device attestation, protection against anonymous UID recreation, physical-device acceptance for Android/iOS, signed release configuration and independent Firebase Console review.
- Canonical owner account bootstrap, real MFA enrollment/recovery and owner operations acceptance in a disposable non-production project.
- Real-money payment gateway, verified provider webhooks, refunds/chargebacks and settlement/reconciliation; manual owner-approved external-payment coin requests are a separate implemented workflow.
- Voice/video calling, room rental lifecycle/billing acceptance, full owner observability, FCM real delivery, immutable 24-month audit archive/checkpoint/restore drills.
- Legal/privacy/DPIA review, accessibility, penetration, performance/load and incident-recovery exercises.

**Release decision remains OPEN.** PR #2 and follow-up PRs remain Draft/open/unmerged. No production deployment, live Firebase mutation, destructive retention activation, or Phase 3 work is authorized by this addendum.
