# Mawdda Platform — Cost Efficiency, Quality and Global Scale Plan

**Owner-approved direction:** preserve the complete member experience while reducing waste in storage, media transfer, database reads, background work and operational complexity.  
**Planning date:** 2026-11-14  
**Implementation branch:** `codex/mawda-full-platform-implementation`

## 1. Non-negotiable product principles

1. Do not remove core member features solely to reduce cloud spend.
2. Do not degrade image, audio or video quality by default; use sensible derivatives and adaptive delivery.
3. Do not weaken authorization, malware scanning, wallet integrity, owner MFA or privacy controls to save money.
4. Do not create paid Firebase/GCP resources, enable Blaze, change production Firebase configuration, deploy, or activate destructive retention jobs without separate owner approval.
5. Measure real usage before buying capacity or adding regions.
6. Every optimization must preserve the approved retention rules, legal holds and owner-only document/download capabilities.

## 2. Existing optimizations verified in code (do not duplicate)

The current scanner already performs several useful cost and safety controls:

- JPEG/PNG/WebP images are decoded and re-encoded into a WebP safe preview, capped at 2 MiB, with bounded input pixels and a maximum working dimension of 4096 before adaptive reduction.
- GIF processing bounds frame count, duration and total pixels, and produces a sanitized animation derivative.
- Audio is transcoded to mono MP3 at 96 kbit/s and bounded duration/output size.
- Video is transcoded to H.264/AAC MP4, bounded to 90 seconds, 1280×720, CRF 28 and a 50 MiB derivative ceiling.
- Upload quotas bound concurrent uploads, active bytes, daily bytes and daily upload count.
- Quarantine objects are not directly served; delivery uses trusted authorization and short-lived URLs.

These controls should be measured and tuned using real quality/size samples, not replaced with blanket low-quality settings.

## 3. Immediate engineering optimizations

### 3.1 Scanner-status polling
The Flutter media upload service previously called the status callable every two seconds while waiting for the trusted scanner. Use bounded exponential backoff (1, 2, 4, 8, then 10 seconds) while keeping the first status request immediate and respecting the existing timeout. This reduces repeated callable reads while retaining prompt completion feedback.

### 3.2 Database and chat reads
- Audit every chat/room message query for an explicit bounded page size and deterministic cursor.
- Do not periodically reload an entire message history when an incremental cursor or active-screen listener can provide the same experience.
- Keep real-time listeners scoped to the currently visible conversation/room and detach them on screen exit.
- Paginate wallet history, store catalog, profile gallery, owner search and audit views.
- Avoid N+1 reads; prefer server-projected summaries where authorization permits.
- Record read/write counts per user journey in emulator/performance tests.

### 3.3 Media transfer and UX
- Continue serving only safe derivatives to members.
- Load image thumbnails in lists and fetch the larger safe preview only on demand.
- Start video/audio transfer only after an explicit play action; stop playback and release resources when the view is left.
- Do not use public immutable cache headers for private member media. Current private/no-store behavior protects revocation and deletion semantics; evaluate only short-lived, authenticated in-memory caching unless a separate privacy review proves persistent caching safe.
- Keep member download controls disabled; owner download requires server-verified owner/MFA authorization. Explain that view-only UI cannot prevent screenshots or external recording.

### 3.4 Upload efficiency
- Preserve current file-size and daily quota checks.
- Measure client memory use for large mobile uploads. Evaluate streamed uploads only with signed-URL/CORS/Content-Length integration tests on web, Android and iOS; do not change the signed upload protocol without those tests.
- Avoid uploading the same selected media twice; make retry behavior idempotent by media ID and exact object generation.

## 4. Storage and delivery strategy

- Start with one regional Standard bucket; do not reserve capacity in advance.
- Belgium `europe-west1` remains the current planning preference for a balanced Europe/Arab audience, subject to a final live price/latency comparison before bucket creation.
- The bucket region is immutable after creation. Do not create it until the owner approves the location and the billing transition.
- Do not rely on US-only Always Free allowances for a European bucket.
- Do not add dual-region/multi-region replication or a CDN until measurements show that latency or egress savings justify the added cost and deletion/revocation semantics are proven.
- Use lifecycle deletion consistent with approved story, media, message, profile and legal-hold policy. Do not shorten or lengthen retention implicitly to save money.

## 5. Cost observability and operational guardrails

Collect and review weekly:
- Storage bytes by media purpose and derivative type.
- Upload/download bytes and request counts by image/audio/video/document.
- Egress per daily active member.
- Firestore document reads/writes/deletes by major journey.
- Function invocations, execution time, retries and error rates.
- Scanner queue age, processing time, retry/dead-letter count and signature freshness.
- Active users (DAU/WAU/MAU), day-1/day-7/day-30 retention and media consumption per active user.
- Cost per 1,000 active members and cost per successful media send/play.

Budget alerts should be configured at $10, $25 and $50 monthly when billing is approved. Alerts are notifications, not automatic spending caps; add service-specific quotas and an owner-reviewed response runbook. No budget alert or paid monitoring resource is created by this document.

## 6. Release-quality targets

Proposed initial targets to validate, not yet measured guarantees:
- Chat text remains responsive on ordinary mobile connections.
- Image lists use small derivatives; full preview is user-initiated.
- Audio/video do not auto-download or auto-play.
- Media authorization and deletion are tested after expiry, membership removal, blocking, account suspension and legal-hold transitions.
- No public or permanent media URL is exposed to members.
- Cost optimizations must not increase media failure rate, scanner bypass risk or privacy leakage.

## 7. Six-month growth and marketing operating model

With the approved $0–$100/month marketing ceiling:
- Prefer organic short-form content, community partnerships, referrals and small measured ad experiments.
- Plan the base case around approximately 1,100 registered members and 55 DAU at month six; treat this as a planning scenario, not a forecast guarantee.
- Increase paid promotion only when cohort retention and cost per retained member justify it.
- Track installs → verified registrations → first meaningful interaction → D7 retained → D30 retained. Do not optimize for installs alone.
- Use referral abuse controls and do not issue valuable coin rewards for unverified or self-referring accounts.

## 8. Phase 1/2 closure gates still requiring evidence

- Disposable non-production Firebase/GCP project, bucket, Workload Identity Federation and least-privilege service accounts.
- Live Cloud Run ClamAV deployment and upload → scan → derivative → signed callback → authorized delivery E2E.
- Real signed PUT/GET expiry, replay, CORS, size and exact-generation deletion tests.
- Backup/PITR, retention, legal-hold, cache/replica deletion and restore drill.
- Android/iOS physical-device acceptance, native Firebase configuration, push, camera/microphone, media playback and poor-network tests.
- Broader Flutter widget/E2E coverage for auth, guest, profile, shop, wallet, rooms and owner console.
- Owner MFA enrollment/recovery, legal/privacy review, accessibility, penetration and load testing.
- Final exact-head CI evidence and separate owner release approval.

## 9. Current safety boundary

This plan is a development and acceptance specification. It does not authorize production deployment, billing activation, bucket creation, irreversible retention locks, production data migration, destructive cleanup, catalog publication or real-money payment activation.
