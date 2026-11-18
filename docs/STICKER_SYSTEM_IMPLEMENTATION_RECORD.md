# Mawdda Sticker System — Implementation Record

## Product requirement
Provide one first-class sticker experience across direct chats and rooms on Android, Web, PWA and desktop:
- curated sticker packs with static and animated items;
- browse, search, favorites and recently used;
- one-tap send and safe receive/render;
- autoplay for animated stickers with reduced-motion, visibility and resource safeguards;
- server-side validation, quarantine, scanning, sanitization and safe derivatives;
- server-authoritative pack/catalog and favorite state;
- retention, access control and audit consistent with chat media.

## Compact sticker media standard
The compact sticker profile currently encoded in the policy is:
- canvas up to 512 × 512 pixels;
- static PNG/WebP up to 256 KiB;
- animated GIF up to 512 KiB, 5 seconds and 50 frames;
- up to 120 entries per pack.

These are product-level compact-sticker defaults, not replacements for the platform's absolute GIF ceiling (3 MiB / 20 seconds / 50 frames). A sticker must meet both its sticker profile and the general media security rules. The server scanner, not the client, must inspect actual decoded dimensions, duration, frames and bytes.

## Implemented on the development branch
- Added the sticker media upload purpose to the shared media intake policy. Upload is restricted to a verified platform-owner session with MFA.
- Enforced static/animated sticker byte ceilings in the server request normalizer and client upload service.
- Routed sticker uploads through the existing private quarantine, signed create-only upload, finalize, scanner callback and safe-derivative pipeline. No public Storage path is exposed.
- Added scanner-verdict validation for actual sticker metadata (kind, contentType, dimensions, bytes, duration and frame count). The media callback rejects sticker verdicts that do not match the quarantined source and checks compact derivative size ceilings.
- Added owner-only saveStickerPack callable. Draft or published packs are written only after every asset is checked against the scanner-approved mediaAssets record. Publication is server-authoritative.
- Hardened getStickerCatalog to include only published/approved packs whose referenced assets are still scanner-approved and whose metadata matches the manifest.
- Added getStickerAssetUrl, which verifies pack publication, the exact asset reference, scanner approval, generation, content type, pipeline metadata and SHA-256 before issuing a two-minute URL.
- Added sendStickerMessage for direct chats and rooms. It validates the pack and asset, enforces account/age/block/membership/mute checks, creates the message and direct notification atomically, and rechecks pack/asset state inside the transaction to prevent revoked-pack races and replay duplication.
- Added client service methods for owner upload, scanner metadata retrieval, pack save/publish, catalog retrieval, secure asset URL retrieval and sticker sending.
- Integrated a sticker picker and sticker message renderer into direct chat and room screens.
- Added an owner sticker-pack management screen to the Super Admin dashboard.

## Verification completed
- Development CI run 44217053931 passed for commit 1fe83747d5074b1c66668cc38cc925278fa6f85e: backend compilation/unit tests, configured backend emulator regressions, Flutter analysis and Flutter widget/unit tests.
- Sticker-specific policy and scanner-verdict unit tests were included in that passing run.
- Later owner-management-screen and status-metadata changes are newer than that passing SHA and require their own completed CI run before being considered verified.
- No production deployment, Firebase production change, main merge, or live data migration was performed.

## Remaining blockers before shipping
- Scanner worker integration is still required. The scanner service configured by MAWDA_MEDIA_SCANNER_URL must emit the validated stickerMetadata object in its signed callback. Static assets must provide the safe raster preview; animated assets must provide the GIF derivative with the required pipeline contract. If the worker does not emit this metadata, the server deliberately rejects the verdict and the owner upload remains unavailable.
- No live end-to-end sticker Emulator test currently proves owner upload → scanner callback → pack publication → catalog → secure URL → direct/room send → rendering.
- Search, favorites and recently used are not yet implemented as server-authoritative features.
- Reduced-motion preferences, autoplay/visibility limits, memory/performance safeguards and accessibility tests for animated stickers are not yet complete.
- Sticker asset lifecycle/retention, orphaned uploads and pack removal/archive cleanup need an explicit owner-approved policy and implementation. Current sticker upload intents are marked owner_approval_required; do not infer a permanent retention policy from that marker.
- Cross-platform acceptance on real Android devices and Web/PWA/desktop has not been completed.

## Safety and rollout
- Never trust client-supplied dimensions, frame count, duration, pack ownership or favorite state.
- Only serve scanner-approved immutable derivatives through the authorized short-lived URL callable.
- Sticker messages reference shared catalog assets; deleting a chat message must not delete a shared pack asset.
- Preserve current media security and retention rules; sticker format does not bypass them.
- Do not enable paid resources, billing, production deployments or production data changes as part of this work.