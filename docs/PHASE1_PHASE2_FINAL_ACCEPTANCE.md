# Mawda Platform — Phase 1 + Phase 2 final acceptance ledger

Snapshot: 2026-11-13  
Development branch: `codex/mawda-full-platform-implementation`  
Last code-tested commit: `5d89d4a3fb7deb607535afab41eae5c1f510fdfe`  
Validation: [GitHub Actions run 43446631493](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43446631493) — completed successfully, 3/3 jobs.

> This is an acceptance ledger, not a release authorization. A green CI run proves only the automated checks listed below. It does not prove deployed infrastructure, real devices, backup/restore behavior, legal compliance, or production readiness.

## A. Phase 1 — application and trusted-platform foundation

| Capability | Current implementation/verification | Acceptance |
|---|---|---|
| Firebase Auth and authenticated app entry | Auth foundations, verification/reset and auth-state gating in the development PR | Code/CI coverage; production Firebase options and owner MFA recovery remain open |
| Profile completion and privacy controls | Server-side completion, username reservation, profile privacy and allowlisted edits | Code foundations; final legal policy and jurisdictional review open |
| Coin transfers and ledger | Server-calculated commission, freshness/idempotency checks and linked sender/recipient/platform ledger entries | Backend tests; payment/refund/top-up and full reconciliation operations not implemented |
| Direct and room messaging | Authenticated callables, validation, idempotency, scoped reads, deletion and read cursors | Backend/emulator tests; push notifications and full realtime/abuse workflows remain open |
| Owner review and audit | Silent/announced review, owner participation modes, server authorization and hash-linked audit verification/export | Automated tests; immutable checkpoint/24-month archive/restore and full audit export scale proof remain open |
| Rooms and moderation | Discovery/join, owner creation, scoped moderator permissions, mute/remove and audit | Code foundations; rental billing, room lifecycle/transfer, voice/video/events and load/device testing remain open |
| Store and entitlements | Catalog/purchase/receipt/ledger foundations; VIP/title consumers; other categories fail closed | Code foundations; remaining approved premium consumers and real-money operations remain open |
| Biometric verification | Server-derived entitlement checks | Provider/capture and recurring verification remain open |
| Privacy and guest policy | Member acknowledgement/version/hash and server enforcement; Firebase anonymous users classified as guests | Final localized legal policy and unauthenticated guest lifecycle remain open |

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

Run [43446631493](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/43446631493) on code commit `5d89d4a3fb7deb607535afab41eae5c1f510fdfe` passed:

1. Scanner job: source/security contract checks, Docker build, GIF/audio/video/PDF processing integration tests inside the image, EICAR detection.
2. Cloud Functions job: TypeScript build/unit tests; media authorization/audit; seven-day retention; direct-message deletion; owner audit export; expanded media legal hold/release; profile media lifecycle; message legal hold/resumed retention; Firestore and Storage rules.
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

**Automated code gate: PASS on the tested code commit.**  
**Phase 1 + Phase 2 overall acceptance: OPEN.**

The latest subsequent commits only add acceptance documentation; they do not modify executable code. The tested code commit remains the exact SHA above. The PR remains draft/open/unmerged. No production deployment, production Firebase mutation, destructive purge, or retention-worker activation has been performed. Do not advance to Phase 3 or production until the applicable closure gates above have evidence and the owner explicitly approves the release boundary.
