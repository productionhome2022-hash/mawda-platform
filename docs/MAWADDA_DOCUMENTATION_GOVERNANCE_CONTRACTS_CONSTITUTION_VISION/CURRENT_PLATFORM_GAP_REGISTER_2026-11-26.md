# Mawdda Platform — Current Gap Register
Date: 2026-11-26
Target repository: productionhome2022-hash/mawda-platform
Development branch: codex/mawda-full-platform-implementation
Verified branch HEAD at review: f9797b322a7fd097f31ffb38ac25bf674bf5367b

## Verified CI state
All four latest workflow runs on the verified HEAD completed successfully:
- Mawdda Test Center: run 45883844566 — success.
- Validate Mawda: run 45883844507 — success.
- Mawdda economy regression: run 45883844516 — success.
- Economic phase verification: run 45883844466 — success.

The prior failures on 18089de23c6cf424ef01b1482c48a068118721f7 were caused by an undefined `db` binding in functions/test/integration/capacity-media-management.integration.test.js. The test now initializes Firestore with Firebase Admin. The repaired HEAD has a complete green rerun; no production configuration was changed.

## Confirmed remaining gaps — not closed by green CI

### 1. Capacity media measurement
- Connected: finalized upload bytes and finalized upload count, atomically recorded with the one-time upload-intent finalization.
- Not connected: concurrent active members, monthly completed download bytes, retained storage bytes, and media-processing minutes.
- These fields deliberately remain null when no authoritative meter exists. A signed URL grant is not evidence that bytes were downloaded.
- Enforcement remains observe_only; production billing remains disconnected.
- Closure evidence required: trusted source for each metric, idempotent/atomic accounting, reconciliation tests, owner projection integration tests, and proof that missing measurements remain unknown rather than zero.

### 2. Sticker lifecycle
- Catalog returns an empty disabled state. Publication, asset URL delivery, and sending remain fail-closed.
- A regression test asserts these gates remain closed.
- This is a deliberate safety gate, not a completed sticker feature.
- Closure evidence required before enabling: owner/member authorization, immutable scanned asset binding, moderation/scan acceptance, safe derivative validation, retention/deletion and late-object reconciliation, idempotency, and end-to-end emulator tests for publish, catalog, access, send, expiry, and revocation.

### 3. Featured-ad finance
- Owner-recorded receipts/refunds/reconciliation are implemented through a Firestore transaction with version snapshots, idempotency event identity, and audit records.
- This is not a payment-provider integration and does not prove external settlement.
- Do not enable campaign delivery based solely on ledger tests. A verified provider adapter, signed provider evidence, webhook authentication/replay protection, settlement reconciliation, and failure/reversal tests remain required.

### 4. Group-call economy
- Billing remains test-only/fail-closed. Pricing snapshots are persisted and policy validation is applied.
- No real payment provider or production collection is connected. Do not represent this as real billing closure.
- Remaining acceptance: provider-independent adapter contract tests, atomic reservation/settlement/refund lifecycle tests, idempotent callbacks, participant disconnect/timeout cases, and production guard tests. Real provider integration requires an explicit provider decision and must remain disabled until authorized.

### 5. 5,000-persona simulation evidence
- The simulation lab's latest successful full run found in this review is run 44594096755, lab commit 380b35c3eb0d7700d4dc4cbeaa526abeddbde838.
- It generated and provisioned 5,000 synthetic personas and completed all 13 lifecycle coverage stages, with 5,000 completed rows; the full job duration was approximately 2,321 seconds.
- Critically, that run checked out primary platform source SHA 825e9489b5dcb351998229fc062d71ce0489044b (2026-11-19), not the current development HEAD f9797b322a7fd097f31ffb38ac25bf674bf5367b.
- Therefore it is historical successful simulation evidence only. A new run pinned to the current platform SHA is required before claiming current-HEAD 5,000-persona acceptance.

## Repository consolidation and cleanup gate
- The primary repository currently exposes two branches: main and codex/mawda-full-platform-implementation.
- The development branch remains isolated; no merge to main was performed.
- The simulation lab is a separate private repository and currently has six branches. It must remain available as the isolated 5,000-persona test harness.
- No branches, tags, refs, archived audit records, backups, or support artifacts were deleted in this pass. Before any cleanup, inventory every ref and artifact, prove its unique content is represented in the canonical platform tree or retained in the lab, confirm no workflow or recovery dependency remains, and obtain the owner's explicit approval for destructive cleanup.
- A single operational platform tree must not absorb or delete the isolated simulation harness. The lab remains a separate validation tool, not a second copy of platform business logic.

## Current disposition
- Green CI on current development HEAD: verified.
- Capacity telemetry: partially connected; enforcement remains observe-only.
- Sticker lifecycle: safely disabled; implementation closure pending.
- Featured-ad external settlement: not integrated.
- Group-call real billing: disabled/test-only.
- 5,000-persona run on current HEAD: not yet evidenced.
- Main merge, deployment, production Firebase changes, billing activation, and destructive repository cleanup: not performed.


## Owner-approved unified-platform execution directive — 2026-11-27

**Authority:** This addendum records explicit owner decisions made on 2026-11-27. It supplements the gap register; it does not claim that the implementation gaps below are already closed.

### A. Single-platform and repository boundary
1. The canonical product is one integrated Mawdda platform in `productionhome2022-hash/mawda-platform`, developed on `codex/mawda-full-platform-implementation`.
2. Every feature, service, adapter, data model, authorization rule, operational workflow, UI, test, and document for product functionality must be integrated into the canonical platform tree and its existing architecture.
3. Do not create a parallel product, detached feature implementation, second business-logic repository, or standalone service outside the platform as a workaround. The separate 5,000-persona simulation lab remains only a validation harness; it is not a second platform implementation.
4. Preserve existing Flutter/Dart, Firebase/Firestore, Cloud Functions, Storage, security rules, and platform interfaces. Inspect existing code and dependencies before changing architecture; reuse canonical services and avoid duplicate business logic.

### B. Calls — Mawdda-owned voice/video service
1. Mawdda is the owner and operator of its calls capability. A third-party calls provider is **not** a prerequisite or mandatory dependency for platform completion or the intended product architecture.
2. Build call lifecycle, signaling, membership, permissions, consent, room coordination, usage evidence, and economy integration inside the canonical platform.
3. The intended media plane is operated under Mawdda's control. A self-managed SFU/media-server and TURN/NAT-traversal infrastructure may be required for reliable real-time audio/video; application code alone, Firebase callables, or signaling do not constitute a working media plane.
4. Any media-server control plane, adapter, configuration contract, health/readiness checks, and tests must be platform-owned code in the canonical repository. Actual server hosting, network capacity, domains, certificates, and paid infrastructure are separate launch-readiness dependencies and require explicit owner approval before provisioning or spending.
5. Optional integration with an external voice/video provider may be evaluated at experimental or production launch only if the owner later chooses it. It must remain optional and must not replace or fragment the canonical call domain.
6. Group-call billing remains fail-closed and disabled in production until reservation, metering, atomic settlement, refund, retry, idempotency, participant disconnect/timeout, and reconciliation are implemented and verified. No production financial activation is authorized by this addendum.

### C. Advertising — Mawdda-owned advertising system
1. Mawdda creates, owns, moderates, serves, and accounts for its own ordinary and featured advertisements. No external ad network is a required provider.
2. Campaign management, creative approval, placement/rotation, audience rules, delivery, server-side viewing evidence, rewards, wallet/ledger effects, budgets, reconciliation, moderation, and audit history belong inside the canonical platform.
3. A server-side evidence/verification layer is permitted only as an internal module of Mawdda's advertising domain. It must not become a detached external-provider product or an independent platform.
4. Client heartbeat/telemetry alone is not authoritative proof of a rewarded view. Use server-verifiable internal delivery/playback/visibility evidence, replay protection, unique event identity, and atomic idempotent reward settlement. Where authoritative evidence cannot be established, fail closed and do not issue rewards.
5. An external advertising provider may be considered optionally at a later launch stage only by a separate owner decision. Do not build or require an external ad-provider integration now.

### D. Message/media save and deletion authority
1. The recipient may save received media immediately, at their discretion, subject to the platform's applicable entitlement and security checks. The sender has no veto over the recipient's local save action.
2. The sender's message controls must distinguish **Delete for me** from **Delete for everyone**. Delete for me hides the item only for the requesting sender. Delete for everyone requests server-side removal/revocation for both conversation participants, subject to authorization, audit, legal-hold, and safe deletion controls.
3. A recipient's copy already saved locally is outside the sender's subsequent deletion control. Delete for everyone must not be represented as erasing a previously saved copy from the recipient's device or other independent copies.
4. Mawdda Media Saver remains the unified in-platform entitlement-controlled save flow. Verify entitlement server-side on every save operation; local saving must not extend server retention.
5. Existing retention durations remain: temporary private conversation — full conversation deletion after four hours from last server-recorded activity; normal — media four hours and text seven days; important — media four hours and text thirty days. Both parties must receive the applicable retention notice.
6. This addendum settles recipient save authority and the sender's two deletion choices. It does not silently invent a new retention-mode selection rule or authorize a live deletion-policy rollout. Do not activate/change production deletion schedules or retention behavior without the required implementation evidence and separate explicit production authorization. Preserve legal holds and audit requirements.

### E. Unified usage, capacity, and owner controls
1. Usage measurement is a platform-wide server-side capability, not disconnected per-feature counters. Integrate authoritative upload, download, retained-storage, processing, call-usage, file-count/size, and active-member measurements with the central capacity/owner projection.
2. Use stable event identities, atomic/idempotent accounting, reconciliation, and explicit unknown/null values when an authoritative measurement is unavailable. Never infer a completed download from a signed URL grant or convert missing data to zero.
3. Keep observe-only behavior where enforcement is not yet proven. Do not invent prices, quotas, or paid entitlements; preserve owner control of economic values.

### F. Required closure work
The following remain implementation work until exact-HEAD evidence proves otherwise:
- Complete the Mawdda-owned audio/video media-plane integration path and its call lifecycle; keep production billing disabled until the full financial cycle is safe.
- Complete internal advertising delivery evidence and reward settlement; do not rely on client-only telemetry.
- Connect all authoritative usage sources to central meters and the Super Owner projection.
- Complete sticker lifecycle, including owner/member authorization, immutable scanned asset binding, moderation, safe derivatives, send/access, expiry, revocation, retention and late-object reconciliation.
- Verify biometric evidence/review flows and their approved duration/security constraints across the relevant clients.
- Complete message/media deletion and Media Saver behavior against the authority rules above.
- Preserve the approved media limits, live-audio 60-second ceiling, biometric voice-proof 20-second limit, economic atomicity/idempotency, and all existing security/privacy constraints.
- Add targeted unit/integration/emulator/security regression coverage for each end-to-end lifecycle and each failure/replay/race path.

### G. Execution, acceptance, and sovereign controls
1. Before every change: inspect current source/dependencies, identify root cause and cross-system impact, make the smallest safe integrated change, add relevant tests, inspect results, and update the canonical documentation.
2. GitHub-hosted/internal workflows and tests are the permitted validation path for this phase. Do not ask the owner to run manual external tests, Termux commands, or a new live 5,000-persona run. Do not claim a test passed unless its exact run and SHA prove it.
3. A green CI run is not proof of unimplemented providers, media infrastructure, full product acceptance, or 5,000-persona acceptance. Record skipped tests and external infrastructure dependencies explicitly.
4. No merge to `main`, deployment, production Firebase mutation, production data deletion, billing/Blaze activation, paid infrastructure provisioning, signing-identity changes, or destructive repository cleanup without separate explicit owner authorization.
5. Keep the 5,000-persona lab available as a separate test harness. Do not absorb its operational role into product code or delete its evidence.
6. Repository cleanup is a final gated activity only after feature closure: inventory refs/artifacts, preserve unique source/history/evidence, prove no workflow/recovery dependency, and obtain explicit approval before destructive actions.
7. Status labels must distinguish implemented, internally tested, CI-verified at exact SHA, externally dependent, production-authorized, and accepted. Never collapse these into a single “complete” claim.

### H. Change-control rule
This owner-approved addendum is the controlling direction for the listed domains where older planning text describes a mandatory external calls/ad network or leaves recipient saving subject to sender control. Historical records remain intact as history; update active implementation and decision indexes to point to this addendum rather than rewriting historical evidence. Any future deviation requires a new explicit owner decision.

### I. Owner-approved infrastructure boundary — Firebase + Google Cloud + Cloudflare (2026-11-27)
1. The approved infrastructure ecosystem for all Mawdda product capabilities is limited to **Firebase, Google Cloud, and Cloudflare**. Do not introduce another cloud provider, managed backend, hosted media platform, external calls vendor, or external advertising network as a required dependency.
2. Firebase remains the integrated application foundation for identity, Firestore data, Firebase/Google Cloud Storage where applicable, and existing Cloud Functions workflows. Google Cloud is the approved environment for Mawdda-controlled compute, networking, storage, and self-managed media infrastructure where required. Cloudflare is the approved edge layer for DNS, CDN, WAF, and supported HTTP(S)/WebSocket routing and protection.
3. Calls remain a Mawdda-owned capability. Signaling/control traffic (HTTPS/WSS) and real-time media transport (ICE/STUN/TURN, UDP/TCP, DTLS/SRTP) are distinct network paths. Do not assume that ordinary Cloudflare HTTP proxying carries UDP media or provides a TURN relay. Any proposed Cloudflare product or routing mode must be verified against its documented protocol support before it is made part of the design.
4. The self-managed SFU/TURN media plane must be designed and operated under Mawdda's control within the approved Google Cloud environment. Its application control plane, configuration, contracts, health checks, and tests remain integrated into this repository. No infrastructure provisioning, paid resource activation, DNS production cutover, certificate mutation, or billing enablement is authorized by this architecture decision.
5. Advertising remains internal to Mawdda. Campaigns, creative review, serving, server-verifiable evidence, rewards, wallet/ledger accounting, budgets, reconciliation, moderation, and audit remain in the canonical platform. No external ad network or external ad-serving dependency is permitted.
6. Existing third-party integrations that are not part of the approved Firebase/Google Cloud/Cloudflare ecosystem must be reviewed for necessity and removed from active product paths only after their call sites, data dependencies, migration impact, and tests are understood. Do not delete historical documentation, archived evidence, or dormant code solely by string match.
7. Every new or modified capability must document its Firebase/Google Cloud/Cloudflare responsibility, network protocol, data/security boundary, cost implications, and non-production validation. Where a capability cannot be implemented safely within this ecosystem, record the exact technical limitation; do not silently substitute another provider.
8. This infrastructure boundary does not authorize production changes, paid services, Blaze activation, external service subscriptions, or deployment. Those remain subject to separate explicit owner approval.
