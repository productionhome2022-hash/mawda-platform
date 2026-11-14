# Mawdda Guest Preview — Runtime and Acceptance Plan

Date: 14 November 2026  
Branch: `codex/mawda-full-platform-implementation`  
Environment: Firebase Auth / Firestore Emulator only

## Guest entry contract

The guest entry form collects exactly:
- Username (3–24 characters)
- Country (ISO 3166-1 alpha-2 code)
- Gender (`male` or `female`)

It does not request, infer, default, or persist age or date of birth. Extra age fields supplied by a modified client are ignored by the server. A guest profile is stored separately from member documents in `guestProfiles/{anonymousUid}`.

When the guest chooses membership, the existing email-link/verification and member profile-completion flow takes over. Member age and other required member fields are collected there; the guest record is not silently converted into a verified member profile.

## Session contract

- Server starts a 60-minute session on first valid guest-profile submission.
- The same anonymous Firebase UID cannot start another session until 24 hours after the previous session start.
- Explicit session end closes room access but does not delete the anonymous Auth identity or reset the cooldown.
- Session expiry and cooldown use server time. The client cannot submit timestamps or clock overrides.
- This is enforceable for the same retained anonymous UID. A fresh anonymous UID from a different device or a cleared installation can bypass a UID-only quota; cross-installation prevention requires a separately designed and validated attestation/risk control or a stable verified identity. Do not claim that limitation is solved.

## Room eligibility and permissions

- Guests can discover and join only active public rooms whose audience is `all_ages` and whose `guestAudienceApproved` flag is true.
- An active adult room owner or an MFA-backed platform owner must explicitly approve the room and confirm ongoing general-audience moderation.
- Adult-only, minor-only, private, inactive, and unapproved rooms are denied by server callables.
- Guests can send and receive text and audio attachments in eligible rooms only.
- Guest media upload is limited to room-purpose audio and remains subject to the existing quarantine, scanner, and safe-derivative pipeline.
- Direct messages, private rooms, image/GIF/video/document uploads, wallet, transfers, top-ups, rewards, gifts, purchases, room rental, moderation, and member-only capabilities remain denied.

## Server entry points

- `startGuestSession`
- `getGuestSessionStatus`
- `endGuestSession`
- `listGuestPublicRooms`
- `setRoomAudience` (adult room owner or MFA-backed platform owner)
- Existing `joinRoom`, `sendRoomMessage`, `getRoomMessages`
- Existing media upload/finalize/link/delivery callables with guest-specific audio checks

Every room read/write and audio delivery path must re-check the active guest session and guest-safe room approval. Hiding controls in Flutter is not authorization.

## Emulator test commands

From the `functions` directory:

```bash
npm test
npm run test:guest-session-integration
npm run test:seeded-persona-interaction
```

The guest integration command starts isolated Auth and Firestore emulators, provisions the five persona fixtures, and runs the guest/member interaction journey. The seeded persona command verifies member-to-member coin transfer, linked ledgers, direct messages, idempotency, and block/unblock behavior. Test balances and all payment-related behavior remain emulator-only.

## Current automated coverage

- No-age guest profile persistence, including ignored age/date-of-birth client fields
- Session start, idempotent replay, exact expiry helper boundary, exact 24-hour cooldown helper boundary
- Adult owner approval and non-owner denial for guest-safe room classification
- Guest and seeded member room joins
- Guest/member text exchange and idempotent text send
- Guest/member audio attachment linking through the safe-derivative policy
- Adult/private room denial
- Guest direct-message, image upload, store purchase, and member block-operation denial
- Session end, post-end room send denial, and cooldown denial
- Seeded member-to-member coin transfer, sender/recipient/platform ledger checks, direct messaging, replay, and block/unblock

## Remaining acceptance gates

- Full Flutter UI-to-callable end-to-end tests with a real anonymous Firebase Auth session
- Device-level microphone recording and in-app audio playback controls; the current guest UI selects an audio file and opens received audio using the device's external handler
- Emulator clock advancement through the entire 60-minute and 24-hour lifecycle
- Cross-installation anti-abuse controls with a documented privacy/security design
- Real Android/iOS Firebase registration, App Check/device attestation, microphone permissions, scanner/storage delivery, accessibility, load, and manual device acceptance
- Full exhaustive denied-capability matrix across every member-only callable

Do not mark the Guest Preview feature as production-ready until these gates pass and the release owner approves the pilot. This document describes development-branch progress only; it is not authorization to deploy or mutate production data.
