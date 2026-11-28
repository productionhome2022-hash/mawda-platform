# Firestore & Storage Rules Security Audit Report (Phase 3)

- **Date:** 2026-11-28
- **Audit Status:** `AUDITED_GAPS_IDENTIFIED_NO_RULE_WEAKENING`
- **Platform Repository:** `productionhome2022-hash/mawda-platform`
- **Target Branch:** `codex/mawda-full-platform-implementation`

## 1. Rules Posture & Existing Rule Tests
- **`storage.rules`:** Default-deny (`allow read, write: if false`) across `/b/{bucket}/o/{allPaths=**}`; verified by `functions/test/rules/storage.rules.test.js` for signed-in and anonymous clients.
- **`firestore.rules`:** Default-deny (`match /{document=**} { allow read, write: if false; }`) with scoped reads on `/users/{userId}` (owner `get` only), `/walletLedger/{entryId}`, and `/coinTransfers/{transferId}` (sender/recipient `get` only); verified by `functions/test/rules/firestore.rules.test.js` against profile self-escalation and server-only collections.

## 2. Identified Client vs. Rules & Server Gaps
- **Client-side direct mutations in `lib/services/room_billing_service.dart`:** `setRoomRentalPolicy`, `checkAndProcessExpiredRooms`, and `attemptAutoRenewal` perform client-side writes/updates (`system_policies/room_rental_policy`, `rooms`, `notifications`, `users/{ownerId}` including coin deduction) that conflict with default-deny rules and should be enforced via trusted server-side logic.
- **Wallet ledger path consistency (`lib/screens/wallet_screen.dart` vs. `firestore.rules`):** Client reads `users/{userId}/walletLedger` whereas top-level `firestore.rules` defines `/walletLedger/{entryId}`.
- **Server policy & call/media modules:** `functions/src/` contains server-side call/media/retention/audit modules (`call-entitlements.ts`, `call-signaling.ts`, `call-usage-policy.ts`, `chat-media-policy.ts`, `chat-retention-policy.ts`, `audit-archive.ts`).

## 3. Execution Controls
- **Rules / Source Code Edits / Deployment / Merge to `main`:** `NONE`.
- **5000-Persona Simulation:** `NOT_EXECUTED`.
