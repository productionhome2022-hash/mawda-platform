# Media owner exemption and capacity console — 2026-11-18

## Scope of this development pass

Branch: `codex/featured-ads-secure-lifecycle-20261118`

This record documents a targeted repair and an owner-console surface. It does not certify the media pipeline, metering engine, stickers, or release as complete.

## Direct-chat recipient binding

The direct-chat UI now supplies the intended recipient when creating upload intents for both image uploads and general attachments. The server looks up the recipient in Firebase Auth and checks the server-controlled `platformOwner` custom claim.

- A verified platform-owner recipient qualifies the member-to-owner transfer for the media admission-quota exemption.
- A normal member recipient remains on the ordinary quota path; the presence of a recipient UID does not itself grant an exemption.
- PDF remains denied unless the upload is from a verified platform-owner session or is a direct chat addressed to a verified platform-owner recipient.
- The direct-chat attachment picker now includes PDF; the server remains authoritative and only accepts the currently allowlisted PDF type.
- Owner-originated media remains exempt from member admission quotas when the caller has a valid owner session.
- All existing scanner, quarantine, signature, generation, derivative, retention, authorization and technical size ceilings remain in force. Quota exemption is not a safety bypass.

Relevant commits:
- `bc49d115e66f243051103edd211d0ccef7c369df` — upload service recipient binding.
- `a8a8b77eabad5658bf0eac1fec1fe9e5f12e6204` — direct-chat UI recipient binding and PDF picker.
- `c1ac171991edd5296af44bd13a067e81959206d3` — ordinary recipients remain on standard quota path.

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

1. The member-to-owner exemption still requires end-to-end tests across each media category, upload finalization, delivery, cleanup, quota release, replay, and revoked-owner claims.
2. The sticker implementation is currently only a pure metadata policy plus GIF client-unblock/documentation. It is not yet a first-class product: no pack schema/owner management, scanner-enforced sticker profile, catalog/search/favorites/recently-used, message type/send callable, picker, or cross-platform playback tests.
3. Capacity metering is not instrumented. Concurrent sessions, monthly usage, processing and actual cost remain unavailable; the policy is configuration-only and observe-only.
4. Featured advertising still requires full owner governance, member campaign lifecycle, eligibility/heartbeat/completion, atomic reward ledger, budget/cap integration and complete UI journey verification.
5. Calls have server-mediated signaling and a server-side five-minute maximum duration, but entitlement-aware duration/coin charging/refund/ledger integration is not proven complete. The current attempt throttles are not a substitute for economic entitlements.
6. PWA manifest and install guidance exist, but this repository does not yet contain a verified app-shell service worker, offline/update lifecycle validation, or native Windows/macOS/Linux installer packaging. A browser-installed PWA is not an OS-native installer.
7. The 5,000-persona lab exists as a separate manually dispatched emulator harness. No successful run against this branch SHA is recorded in this pass.

## Release boundary

All work remains on the development branch. No merge to `main`, production deployment, live Firebase mutation, billing activation, live retention worker activation, or destructive production operation was performed.
