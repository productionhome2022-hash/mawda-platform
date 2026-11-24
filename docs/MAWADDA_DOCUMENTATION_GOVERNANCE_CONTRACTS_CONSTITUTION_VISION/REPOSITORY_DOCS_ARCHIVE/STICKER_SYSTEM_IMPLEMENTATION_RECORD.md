# Mawdda Sticker System — Approved Compact Media Policy

Status: owner-confirmed sticker byte ceilings recorded in the development source.

## Binding sticker byte ceilings

- Static stickers (PNG/WebP): **256 KiB maximum**.
- Animated stickers (GIF): **512 KiB maximum**.

These are sticker-specific ceilings and are stricter than the general platform image/GIF ceilings. A sticker must satisfy both the sticker-specific policy and the platform-wide media security controls. The byte count must be measured from the actual uploaded object by the trusted server/scanner; client-reported size is not authoritative.

## Existing technical constraints in the sticker policy

- Maximum canvas: 512 × 512 pixels.
- Animated GIF duration: 5 seconds maximum.
- Animated GIF frame count: 50 maximum.
- Maximum pack size: 120 stickers.

The owner-confirmed byte limits above are the final policy values. The additional technical constraints remain implementation safeguards and must not be loosened without owner approval.

## Security requirements

- Static stickers accept PNG or WebP; animated stickers accept GIF.
- Validate actual decoded media metadata server-side.
- Reject oversized, malformed, unsupported, or metadata-inconsistent content.
- Public catalog projection includes only published, approved packs and clean scanner-approved assets.
- Never expose storage paths, private moderation notes, or permanent download URLs to clients.
- Do not bypass quarantine, malware scanning, safe derivative processing, access control, or the platform's retention policy.

## Scope and limitations

The policy and pure catalog projection are not by themselves a complete sticker product. Upload/finalization wiring, scanner metadata binding, owner pack publication, secure asset URL delivery, message sending, UI integration, favorites/search/recently-used, accessibility, and end-to-end emulator coverage must be verified separately before release.

No production deployment, Firebase production change, billing activation, or live retention change is authorized by this record.
