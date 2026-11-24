# Media owner exemption and capacity console — 2026-11-18

## Scope of this development pass

Branch: `codex/featured-ads-secure-lifecycle-20261118`

This record documents a targeted repair and an owner-console surface. It does not certify the media pipeline, metering engine, stickers, or release as complete.

## Direct-chat recipient binding

The direct-chat UI now supplies the intended recipient when creating upload intents for both image uploads and general attachments. The server looks up the recipient in Firebase Auth and checks the server-controlled `platformOwner` custom claim.

- A verified platform-owner recipient bypasses daily personal upload accounting, while a short-lived active-upload/active-byte reservation remains in place until finalization or abandoned-intent cleanup. This prevents unused upload intents from bypassing all admission controls.
- A normal member recipient remains on the ordinary quota path; the presence of a recipient UID does not itself grant an exemption.
- PDF remains denied unless the upload is from a verified platform-owner session or is a direct chat addressed to a verified platform-owner recipient.
- The direct-chat attachment picker now includes PDF; the server remains authoritative and only accepts the currently allowlisted PDF type.
- Owner-originated media remains fully exempt from member personal admission quotas when the caller has a valid owner session.
- All existing scanner, quarantine, signature, generation, derivative, retention, authorization and technical size ceilings remain in force. Quota exemption is not a safety bypass.

Relevant commits:
- `bc49d115e66f243051103edd211d0ccef7c369df` — upload service recipient binding.
- `a8a8b77eabad5658bf0eac1fec1fe9e5f12e6204` — direct-chat UI recipient binding and PDF picker.
- `c1ac171991edd5296af44bd13a067e81959206d3` — ordinary recipients remain on standard quota path.

## Owner-recipient quota-abuse hardening — 2026-11-18

A review found that treating a member-to-owner upload intent as fully quota-exempt allowed an authenticated member to request an owner-directed signed upload URL and abandon it without consuming any admission reservation. The intent's recipient binding prevented delivery to another account, but did not itself prevent unused intents from bypassing the member's temporary-upload safeguards.

The quota policy is now split:
- owner-originated uploads remain fully exempt from member personal quotas;
- member-to-verified-owner transfers do not increment daily personal upload bytes/counts;
- member-to-owner intents still reserve bounded active-upload count and active bytes, released by the existing finalize/reject/expiry cleanup paths;
- ordinary member-to-member transfers retain both active and daily limits;
- scanner, quarantine, MIME/signature, hard media-size ceilings, recipient binding and delivery authorization remain unchanged.

Regression coverage was added for the policy split, daily-limit bypass for owner-directed transfers, and continued active-upload/active-byte rejection at the technical admission limits. This is unit-level policy coverage; the full callable/Storage emulator lifecycle and live non-production verification remain open.

Relevant commits:
- 3e8de50f422c5eee1cd0ae2af76e6e04e7a886ac — split daily exemption from full owner exemption.
- 1c78003300977737a2053ae65f0e608c3f52af66 — apply active reservations to owner-directed transfers.
- 0bfe54b9d0e8c2cc83b8a80901dce0f219fda260 — add quota policy regression tests.
- 3e7e2fc56e5f92d8f451fd98c8980bed491aab9d — initial strict-TypeScript compatibility pass.
- ba33a30323bf9df19045fb1bbe1d62a9f0883c2a — simplify the full-exemption helper contract.
- 646b9e2a13baa3cdf79befb07174065f307be3d4 — use the sender-only full-exemption helper.
- ac0d86c005e5f76d85cbb9e1142d401a33767f84 — align policy tests with the helper contract.

## Capacity and media policy owner screen

Added `lib/screens/capacity_media_management_screen.dart` and linked it from the owner console.

The screen calls the existing owner/MFA-protected `getOwnerCapacityMediaManagement` and `setOwnerCapacityMediaManagement` callables. It supports version-checked configuration of the four monthly policy fields:
- upload bytes per member;
- download bytes per member;
- retained storage bytes per member;
- processing minutes per member.

Blank values are stored as unset. The screen explicitly reports the current state as observe-only and displays usage/cost metrics as unavailable when the backend reports that metering is not instrumented. It does not invent usage values, enable enforcement, connect production billing, or change core-service exemptions.

Relevant commits:
- `10b11132877721550cf059d149346cc42ba0380e` — capacity/media policy screen.
- `172f8f10906d583394d171484bc1edb5d9143e37` — owner-console navigation link.

## Validation evidence

GitHub Actions run `44210346291` for commit `172f8f10906d583394d171484bc1edb5d9143e37` completed successfully:
- backend TypeScript build and unit tests;
- mode-aware chat retention integration tests;
- room event seat reservation and cancellation integration tests;
- owner entitlement grant and bulk replay integration tests;
- voice/video call lifecycle integration tests;
- timed advertising and reward-ledger integration tests;
- Flutter Dart analysis;
- Flutter widget and unit tests.

This run validates the exact commit above. It does not include a real-device acceptance test, a deployed scanner test, real-GCS signed URL verification, a 5,000-persona simulation, production billing, or production deployment.

## Remaining blockers and explicit non-completions

1. The member-to-owner path now has Auth/Firestore/Storage emulator coverage for verified-recipient intent binding, daily-accounting exemption, ordinary-recipient denial of that exemption, and retained active-upload limits. Full end-to-end coverage across each media category, upload finalization, delivery, cleanup/release, replay and revoked-owner claims remains open.
2. The sticker system now has an owner-only pack management screen, published catalog projection, scanner-enforced sticker metadata, secure short-lived asset URLs, transactional direct/room message sending, client picker/rendering, and a private scanner worker path for static and animated assets. CI run 44219131672 passed the scanner processor/security suite and the full configured backend/Flutter regressions on SHA `75937e84a7178370f0f4f64b755087e863177aa4`. Remaining: end-to-end owner upload → scanner callback → publish → catalog → secure URL → send → render emulator coverage; live non-production scanner deployment/connection; search/favorites/recently-used; reduced-motion/accessibility/performance acceptance; cross-platform device acceptance; and an approved retention/orphan cleanup policy.
3. Capacity metering is not instrumented. Concurrent sessions, monthly usage, processing and actual cost remain unavailable; the policy is configuration-only and observe-only.
4. Featured advertising still requires full owner governance, member campaign lifecycle, eligibility/heartbeat/completion, atomic reward ledger, budget/cap integration and complete UI journey verification.
5. Calls have server-mediated signaling and a server-side five-minute maximum duration, but entitlement-aware duration/coin charging/refund/ledger integration is not proven complete. The current attempt throttles are not a substitute for economic entitlements.
6. PWA manifest and install guidance exist, but this repository does not yet contain a verified app-shell service worker, offline/update lifecycle validation, or native Windows/macOS/Linux installer packaging. A browser-installed PWA is not an OS-native installer.
7. The 5,000-persona lab exists as a separate manually dispatched emulator harness. No successful run against this branch SHA is recorded in this pass.

## Release boundary

All work remains on the development branch. No merge to `main`, production deployment, live Firebase mutation, billing activation, live retention worker activation, or destructive production operation was performed.


## Follow-up emulator regression — 2026-11-18

The development-branch regression workflow now runs the media callable/Storage lifecycle suite on every feature-branch push. The media emulator command starts Auth, Firestore and Storage emulators together so recipient custom claims are verified against the Auth emulator rather than a live identity service.

New integration cases verify:
- a member upload addressed to an Auth-emulator account carrying the server-managed `platformOwner: true` claim is bound to that exact recipient;
- the upload intent does not become fully quota-exempt (`quotaExempt: false`);
- active upload count and bytes are still reserved;
- daily byte/upload counters remain unchanged for the verified owner recipient;
- an ordinary recipient does not receive the daily exemption, even when the member has exhausted daily accounting;
- owner-directed intents are rejected when active upload admission limits are exhausted.

Exact verification: GitHub Actions run [44212614351](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44212614351), commit `8ae97394c36150119deb7a5f09eb817d56b26c2e`, completed successfully. Both jobs passed:
- backend TypeScript build and unit tests;
- media upload, recipient authorization and quota emulator lifecycle (Auth + Firestore + Storage);
- chat retention integration;
- room event reservation/cancellation integration;
- owner entitlement grant/replay integration;
- voice/video call lifecycle integration;
- timed advertising and reward-ledger integration;
- Flutter analysis and widget/unit tests.

This is emulator evidence for the tested cases only. It does not prove live Firebase/Storage behavior, scanner production connectivity, physical-device acceptance, or full owner-directed media lifecycle coverage across every category.


## Finalize and expired-intent cleanup regression — 2026-11-18

Added two Auth/Firestore/Storage emulator integration cases in
`functions/test/integration/media-callables.integration.test.js`:

- A verified-owner-directed upload is finalized through the callable; the active upload reservation is released while the sender's daily usage counters remain unchanged.
- An expired owner-directed upload intent is cleaned up; its source object is removed, the asset transitions to `expired`, active reservation counters are released, and daily usage counters are preserved.

Verification: GitHub Actions run [44213277492](https://github.com/productionhome2022-hash/mawda-platform/actions/runs/44213277492), commit `38b50dc0e4b06217dabdb68ebc65ec131ad4dc5d`, completed successfully. The backend job explicitly passed:
- backend compile and unit tests (which include sticker-policy unit tests);
- media upload, recipient authorization and quota lifecycle against Auth + Firestore + Storage emulators;
- chat retention, room reservation/cancellation, owner entitlement grant/replay, call lifecycle, and timed advertising/reward-ledger emulator suites.
The Flutter job passed `flutter analyze` and `flutter test`.

Scope note: these results establish the exercised emulator cases only. They do not establish a production scanner connection, all media categories, 5,000-persona load acceptance, real-device WebRTC, or release readiness. The sticker product feature remains incomplete as listed above; do not represent its pure policy tests as an integrated sticker service or UI.


## Capacity telemetry follow-up — 2026-11-18

- Finalized upload source bytes are now counted once in the same Firestore transaction that changes an upload intent from `upload_authorized` to `pending_security_scan`.
- The aggregate is stored by UTC month in `platformCapacityMeters/{YYYY-MM}` and contains only total bytes, finalized object count, and update time; it does not contain member identifiers.
- The owner capacity callable now returns this observed upload metric and reports measurement state as `partial`.
- The owner UI labels this as finalized upload bytes, not network egress or billed storage, and exposes the UTC month and finalized object count.
- Emulator regression coverage verifies exact increment and that a repeated finalize attempt cannot increment the meter again.

Still intentionally unavailable: concurrent active members, download/network egress bytes, retained storage bytes and processing minutes. These require authoritative session/presence, Storage access/billing, object lifecycle and worker telemetry. The policy remains observe-only; no quotas are enforced and no billing integration is connected.
