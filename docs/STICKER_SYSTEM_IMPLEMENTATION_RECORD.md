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
This implementation uses a deliberately smaller sticker profile than ordinary GIF attachments:
- canvas up to 512 × 512 pixels;
- static PNG/WebP up to 256 KiB;
- animated GIF up to 512 KiB, 5 seconds and 50 frames;
- up to 120 entries per pack.

These are product-level compact-sticker defaults, not replacements for the platform's absolute GIF ceiling (3 MiB / 20 seconds / 50 frames). A sticker must meet both its sticker profile and the general media security rules. The server must inspect actual decoded dimensions, duration, frames and bytes; client metadata is never authoritative.

## Changes made in this pass
- Removed the stale client-side rejection that blocked GIF uploads through the generic image-upload path in chat and rooms. GIF uploads must still complete the existing quarantined server pipeline and receive a safe animation derivative before attachment.
- Added `functions/src/sticker-policy.ts` with strict metadata and pack-size validators.
- Added `functions/test/sticker-policy.test.js` covering compact limits and rejection cases.

## Not yet complete — do not mark the sticker product feature as shipped
- No sticker-pack Firestore schema or owner pack-management callable has been connected.
- No sticker catalog/search/favorites/recently-used service is wired.
- No first-class sticker message type or transactional send callable is wired.
- No sticker picker UI is integrated into direct chat or room composer.
- The current GIF media pipeline has not yet been shown to enforce the sticker-specific decoded dimensions, duration and frame count. The new pure policy validator is not a substitute for scanner enforcement.
- No Android/Web/PWA/desktop playback performance or accessibility tests have been run.

## Safety and rollout
- Never trust client-supplied dimensions, frame count, duration, pack ownership or favorite state.
- Only serve scanner-approved immutable derivatives to conversation participants.
- Preserve current media retention and security checks; sticker format does not bypass them.
- Do not enable paid resources, billing, production deployments or production data changes as part of this work.
- Before shipping, add emulator integration tests for unauthorized pack access, favorites isolation, duplicate/replayed sends, revoked packs, deleted media, scanner rejection and room membership.
