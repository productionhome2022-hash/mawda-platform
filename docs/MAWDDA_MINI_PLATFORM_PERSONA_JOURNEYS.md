# Mawdda 500-persona mini-platform lifecycle and load matrix

## Objective
Extend the existing seeded persona lab into a miniature end-to-end Mawdda population. The target population is 500 synthetic personas, with staged concurrency cohorts of 200, 300 and 500. This is a behavioral and capacity test, not a claim that emulator results equal production capacity.

## Persona composition
The generated population must deliberately mix:
- anonymous guests, constrained to the server-timed guest session and approved all-ages public rooms;
- email/password registrants before verification, who must not gain member-only privileges;
- email-verified members completing privacy acknowledgement and the member profile;
- biometric challenge participants, where the emulator may test request/replay/denial states but must never fabricate device-key proof or award the biometric reward;
- regular members, premium-entitlement members, room renters, moderators and a separate owner test identity;
- suspended, blocked, expired-entitlement, low-balance and other negative-path personas.

The owner identity is a dedicated test identity. Its privileged calls must still satisfy the actual MFA/owner-session contract; ordinary personas must never receive owner claims.

## Lifecycle journey
Each synthetic persona is assigned a deterministic journey and role. The journey matrix covers:

1. Entry and authentication
   - anonymous Firebase Auth sign-in, guest profile setup, session start/status/end and cooldown;
   - email/password account creation, unverified state, verification gate, verified state;
   - privacy acknowledgement and member completion;
   - biometric challenge start/invalid/replay/unsupported outcomes; hardware-backed signature acceptance and reward are reserved for a separately approved physical-device security test.

2. Profile setup and discovery
   - unique handle, profile fields, visibility, avatar/cover fixtures, interests, goals and notification preferences;
   - profile update/read, discovery, profile visits, block/unblock and privacy boundaries;
   - test that guests see only permitted public previews and members cannot read private/blocked data.

3. Wallet, coin acquisition and store
   - sandbox coin top-up request, pending owner review, payment instruction, owner approval/rejection and idempotent ledger credit;
   - coin transfers between paired personas with fee, sender/recipient/platform ledgers and replay protection;
   - catalog browsing and item purchases, balance checks, receipt/ledger and active/expired entitlements;
   - badges, custom titles, VIP, avatar frames, username styles, profile analytics/layout/pinning, discovery boost, themes and visitor greeting;
   - real payment providers and live card charges remain disabled.

4. One-to-one social activity
   - direct chat send, inbox receive, read receipts, retries, delete-for-me/delete-for-everyone, block enforcement and notification records;
   - allowed media categories and denial of PDF/documents for ordinary members; owner-only document path is tested with an MFA-authorized owner fixture.

5. Public and private rooms
   - discover/join/leave public rooms, member counts, text/audio policy and guest restrictions;
   - create/rent private rooms, invite/join authorization, concurrent room messages, moderator permissions, mute/remove, capacity and audience checks;
   - rental renewal, expiry/freeze/grace/closure, room ownership transfer and audit events;
   - guest attempts to rent/join private rooms and member attempts to bypass invitations must fail.

6. Owner operations and safety
   - MFA-gated owner moderation, account state changes, catalog/economy/room controls and audit pagination/redaction;
   - report/appeal flows, message/media legal holds, retention and privacy access boundaries;
   - every owner action is tested both with valid owner/MFA context and denied without it.

## Load profiles and metrics
- 200, 300 and 500 synthetic identities, with deterministic seeds and reproducible run IDs.
- Separate cold-start provisioning measurements from warm steady-state action measurements.
- Controlled concurrency waves; no unbounded request flood.
- Record successful/failed actions, p50/p95/max latency, throughput, Firestore transaction retries/conflicts, emulator memory/CPU where runner telemetry permits, and invariant checks.
- Reconcile wallet balances, paired ledgers, purchase receipts/entitlements, room membership counts, message delivery and idempotency after each stage.
- Keep fixture files and machine-readable reports as short-retention CI artifacts; never persist credentials or real personal data.

## Current implementation boundary
The initial automated load tier added to CI currently provisions 500 emulator-only email identities and exercises paired coin transfers, idempotent replay, direct-message send/recipient inbox read, and wallet ledger reconciliation at 200/300/500 cohorts. It is not yet the complete lifecycle above. Existing dedicated integration suites cover parts of store purchase, coin purchase requests, premium entitlements, biometric fail-closed behavior, guest sessions, and room rentals. The next engineering increment is to connect these journeys into persona-driven scenario orchestration and extend concurrent room/store/discovery workloads before describing the full mini-platform test as complete.

## Isolation and limitations
- Require Firebase Auth + Firestore Emulator and a `demo-mawda-*` project ID.
- Use only reserved `test.mawdda.invalid` email identities and synthetic data.
- No production project, live payment, live FCM delivery, GCS bucket, or production user is touched.
- A Firebase Emulator load result is not a production capacity certification. Real GCS/ClamAV/Cloud Run, Firestore quota headroom, geographical latency, device rendering and push delivery require separately approved non-production infrastructure and physical-device testing.
- No merge to `main`, production deployment, billing enablement or Phase 3 transition is authorized by this test plan.
