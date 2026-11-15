# Mawdda Media Economy — Operating Model

Status: engineering policy and implementation traceability, development branch only.
Owner-approved technical limits are normative. No production resources, billing settings, or commercial prices are changed by this document.

## 1. User experience objective

Protect platform economics without making ordinary members feel the cost controls. The system should preserve the familiar chat flow, media clarity, playback, and room interactions. Cost controls should operate behind the scenes through safe compression, bounded processing, private derivatives, retention cleanup, abuse controls, and capacity-aware admission.

Do not silently degrade content quality beyond the approved safe derivative profiles. Do not make an upload appear sent until the server has approved the safe derivative. Where processing takes time, the client should provide a clear progress state and retry path rather than a frozen composer.

## 2. Owner-approved technical ceilings

| Media | Source / upload ceiling | Safe output / processing ceiling |
|---|---:|---|
| Still images (JPEG, PNG, WebP) | 3 MiB | Private sanitized preview, currently capped at 2 MiB |
| Animated GIF | 3 MiB | 3 MiB, maximum 20 seconds and 50 frames; aggregate frame-pixel ceiling 40 MP |
| Chat / room audio | 5 MiB, maximum 60 seconds | 5 MiB safe MP3 derivative |
| Video | 25 MiB source | 15 MiB safe MP4 derivative, maximum 90 seconds |
| PDF | 20 MiB, verified platform-owner session only | 20 MiB flattened/rasterized derivative |

Live microphone voice messages are capped at 60 seconds in direct chats, public chats/rooms, and rented private rooms. This is separate from live audio/video calls.

The 5 MiB audio value is a rejection ceiling, not a target bitrate or a requirement to fill the limit. Other file types remain denied unless explicitly approved and safely processed.

## 3. Implemented controls on the development branch

- Server-side allowlisted MIME policy enforces 3 MiB for every supported image type and 5 MiB for every supported audio type; video source remains 25 MiB and owner-only PDF remains 20 MiB.
- Flutter upload service checks file length before reading the complete file into memory, then the trusted backend independently validates the declared and actual byte count.
- Signed upload requests bind the exact declared content length and use create-only object generation.
- Scanner source download is capped at 25 MiB; image preview and GIF/audio/video/PDF derivatives have independent output ceilings.
- GIF processing checks duration, frame count and aggregate frame-pixel complexity. Audio/video processors verify duration and transcode to safe derivatives.
- Delivery rechecks the exact derivative generation, content type, size, source provenance and hash.
- Microphone capture buffers have a 4 MiB ceiling while the server and recording timer independently enforce 60 seconds.
- Upload-intent reservations are transactional and per-user. Current defaults are 5 concurrent uploads, 150 MiB reserved active-upload bytes, 500 MiB daily uploaded bytes and 100 daily uploads. Active reservation bytes are released at finalization/rejection; daily counters remain for the UTC day.

These per-user counters are upload-admission controls. They must not be described as a storage quota, egress budget, or platform-wide spending cap.

## 3A. Initial financial envelope — 1,000 monthly active members

The owner has set an initial planning target of **no more than USD 10/month in billable Google/Firebase charges after applicable no-cost usage** for a baseline of **1,000 monthly active members (MAU)**. This is a target for monthly active members, not 1,000 simultaneous connections.

To avoid planning right up to the limit, the initial operating envelope is:
- Estimated operating ceiling: **USD 7.50/month**.
- Contingency reserve for usage spikes, reporting delay, pricing/region variance and tax: **USD 2.50/month**.
- Estimated-cost warning: **USD 5/month**.
- Protect-mode planning trigger: **USD 7.50/month**.
- Critical planning trigger: **USD 9/month**.

At protect mode, the intended future response is to pause or reduce non-essential media processing, background work, repeated expensive queries and optional previews first. At critical, new non-essential media uploads/deliveries may be paused. Text chat, account access, safety functions, owner controls and access to already-sent content should be preserved as far as technically possible. This behavior is a design requirement, not yet an implemented cost circuit-breaker.

### Current published no-cost planning baselines

These are project/service allowances shown on Firebase's current pricing pages, not per-member entitlements and not a guarantee that every region or resource configuration receives identical treatment:

| Service | Published no-cost baseline |
|---|---:|
| Firestore Standard | 1 GiB stored; 50,000 reads/day; 20,000 writes/day; 10 GiB egress/month |
| Firebase Storage new `*.firebasestorage.app` bucket | 5 GiB-month stored; 100 GiB downloaded/month; 5,000 uploads/month; 50,000 downloads/month |
| Cloud Functions | 2 million invocations/month; 400,000 GB-seconds; 200,000 CPU-seconds; 5 GiB outbound/month |
| Firebase Hosting | 10 GiB stored; 360 MiB transfer/day |

The new Firebase Storage bucket allowance is distinct from legacy `*.appspot.com` bucket pricing. The actual bucket location and its applicable Cloud Storage SKU rates must be verified before any cost forecast is treated as reliable. The current project bucket location has not been verified.

### What the $10 target does and does not mean

- The $10 target applies to Google/Firebase infrastructure charges after eligible no-cost usage. It does not include unrelated vendor subscriptions, domain registration, app-store fees, payment processing, SMS/phone verification, or future third-party AI APIs unless explicitly added to the budget scope.
- The no-cost quotas are shared at project/account scope as described by Google; they are not multiplied by 1,000 users or by each app client.
- Monthly active users alone cannot predict cost. Media egress, repeated Firestore listener reads, writes per message, storage byte-hours, scanner/transcoder CPU, logs, build/deploy activity, region, and abuse traffic must be measured.
- Google Cloud alert-only budgets do not cap spending. The newer spend-cap facility applies only to eligible services (including Cloud Run functions) and is not a universal Firebase project cap. Enforcement is estimated, not instantaneous; in-flight usage and reporting delay can still create overage.
- Therefore, **USD 10 is the maximum planning target, not a provider-guaranteed hard invoice ceiling**. A reliable operating control needs app-side quotas, measured usage ledgers, provider billing export reconciliation, service-specific spend caps where eligible, and a conservative buffer.

### 1,000-MAU operating posture

1. Keep the already-approved per-file technical ceilings unchanged; they are safety ceilings, not a promise that every member may consume them continuously.
2. Do not multiply existing per-user upload quotas by 1,000 and treat that as an acceptable global budget. Add project-wide daily/monthly storage, egress, processing and operation guardrails.
3. Optimize Firestore first: paginate message history, keep listeners narrowly scoped, avoid duplicate subscriptions, cache stable profile/configuration reads, and never poll for data that can be event-driven.
4. Optimize media delivery: safe derivatives, bounded previews, approved retention cleanup, and cache/CDN where it demonstrably lowers total cost without exposing private media.
5. Keep paid or optional processing behind admission controls; protect text messaging and core room interaction from optional media workloads.
6. Run the 5,000-persona lab at a 1,000-MAU traffic profile and compare observed operations, egress, byte-hours and processor time with the free-tier baselines before increasing any limits.

## 4. Remaining economic controls — not yet implemented

1. **Owner policy catalogue:** versioned, owner-MFA-protected controls for role, category and entitlement admission limits, with validation, audit trail, rollback and safe defaults. The fixed technical ceilings in section 2 remain hard maximums.
2. **Global capacity guardrails:** atomic platform-wide admission budgets in addition to per-user reservations. The initial planning envelope is USD 10/month billable after free usage for 1,000 MAU; derive safe numeric daily byte/operation quotas only after verifying region/SKUs and simulation evidence.
3. **Actual storage accounting:** record verified source and derivative bytes, object generations, storage class, creation/deletion times and byte-hours. Reconcile Firestore metadata against Storage inventory.
4. **Egress accounting:** measure actual bytes delivered, not merely signed-URL issuance. Current direct signed-URL delivery does not provide a complete application-level byte ledger.
5. **Processing accounting:** record scanner/transcoder duration, CPU/memory profile, source and output bytes, retries and failures per media category. Bound concurrency and retry loops.
6. **Lifecycle efficiency:** delete quarantine originals and derivatives according to approved retention and legal-hold rules; sweep abandoned upload intents and orphan objects; make deletion idempotent and auditable.
7. **Owner dashboard:** show daily/rolling storage, egress, processing, rejection, retry and per-category/role trends, plus forecast against owner-set budgets.
8. **Load/cost validation:** run the isolated 5,000-persona lab against an immutable platform SHA and report resource/cost estimates before selecting global monetary or byte budgets.

## 5. Guardrails

- Never change prices, paid entitlements, member quotas that are commercial benefits, or existing member grants without explicit owner approval.
- Never silently delete active media, bypass legal holds, or change retention periods.
- Never enable paid cloud services, billing, production configuration, or production deployment as part of this development work.
- Any owner-configurable policy must be server-authoritative, versioned, validated, audited, and fail closed on malformed configuration.
- A successful unit test or CI run is not evidence of real-world provider cost. Distinguish measured usage, simulated usage and estimates.
