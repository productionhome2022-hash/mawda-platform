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

## 4. Remaining economic controls — not yet implemented

1. **Owner policy catalogue:** versioned, owner-MFA-protected controls for role, category and entitlement admission limits, with validation, audit trail, rollback and safe defaults. The fixed technical ceilings in section 2 remain hard maximums.
2. **Global capacity guardrails:** atomic platform-wide admission budgets in addition to per-user reservations. Do not invent the numeric daily budget before the owner reviews provider pricing, expected active users, storage region, and simulation evidence.
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
