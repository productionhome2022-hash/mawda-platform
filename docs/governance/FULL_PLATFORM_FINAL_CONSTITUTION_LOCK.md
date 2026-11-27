# Mawdda Platform — Final Single-Branch, Cloud/Edge & Super-Owner Sovereignty Constitution

- **Effective Timestamp (UTC):** `2026-11-27 11:09:33 UTC`
- **Repository:** `productionhome2022-hash/mawda-platform`
- **Sole Development & Build Branch:** `codex/mawda-full-platform-implementation`
- **Simulation / Test Lab Repository:** `productionhome2022-hash/mawdda-5000-simulation-lab` (isolated test & simulation environment only)
- **Protected iOS Bundle ID:** `com.mawdda.platform.app`

## 1. Single-Branch Full Platform Architecture Rule
1. `codex/mawda-full-platform-implementation` is the sole development, build, and integration branch for the complete Mawdda platform body inside `productionhome2022-hash/mawda-platform`.
2. No parallel development branches, duplicate feature branches, or fragmented sub-divisions are created or used for platform development; all platform features, modules, and sections are built directly and cohesively on `codex/mawda-full-platform-implementation`.
3. `productionhome2022-hash/mawdda-5000-simulation-lab` remains strictly a test and simulation environment aligned with `codex/mawda-full-platform-implementation` and never deploys to live Firebase, Google Cloud, or Cloudflare.

## 2. Google Cloud, Cloudflare & Firebase Compatibility Standard
1. All application code, Flutter clients, TypeScript Cloud Functions, security rules, real-time signaling & media infrastructure, DNS/edge routing, and configuration files on `codex/mawda-full-platform-implementation` must adhere strictly to **Google Cloud**, **Firebase**, and **Cloudflare** architectural policies, quotas, authentication/App Check, IAM least-privilege, and operational standards so all features can be deployed and scaled cleanly upon explicit owner approval.
2. **Explicit Owner Approval Gate:** No live deployment, production/cloud mutation, billing/Blaze activation, DNS/edge cutover, or external cloud resource change on Firebase, Google Cloud, or Cloudflare may execute without explicit owner approval.

## 3. Native Mawdda Ownership of Calls & Advertising Systems
1. **Mawdda as the Sole First-Party Calls Provider:** Mawdda Platform owns, operates, and controls its complete voice and video calling infrastructure, signaling, session lifecycle, durations, permissions, moderation, and call routing natively within the platform architecture.
2. **Mawdda as the Sole First-Party Advertising Provider:** Mawdda Platform owns, operates, and controls its complete in-platform advertising engine, ad placements, campaigns, pricing, scheduling, duration rules, approvals, and monetization natively within the platform architecture.

## 4. Absolute Super-Owner Sovereignty & Unified Control Console
1. **Unrestricted Sovereign Authority:** The **Super Owner** holds sole, complete, and absolute sovereign control over every module, rule, decision, financial parameter, and operational setting across the entire Mawdda platform.
2. **Dynamic Parameter Control:** The Super Owner can dynamically modify all prices, packages, coin/currency rates, time durations, session lengths, schedules, limits, quotas, and feature flags across every section of the platform at any time.
3. **Full Inspection, Moderation & Real-Time Intervention:** The Super Owner has full visibility and administrative access across all platform sections, rooms, logs, transactions, user records, and conversations—including private one-to-one (bilateral) chats—with the authority to inspect content, moderate, edit records, or intervene and message users immediately in real time according to platform architecture.
4. **Account Recovery & Password Reset Authority:** When a user loses access or forgets their password, the Super Owner has direct administrative capability to generate a new password or issue an immediate password reset credential/link to restore the user's account access cleanly and securely.
5. **Complete Unified Super-Owner Control Panel Requirement:** Every single feature, module, call system, ad system, room type, financial rule, user action, and system setting built into Mawdda Platform **must** expose dedicated, functional administrative controls and action buttons inside the **Super Owner Control Console**, ensuring 100% end-to-end operational control from one unified interface.
## 5. Binding Implementation, Security & Verification Addendum (2026-11-27)

This addendum clarifies implementation requirements without reducing the Super Owner sovereignty established above.

1. **Sole authority and canonical identity:** Super Owner is the one canonical owner identity. All owner powers must be enforced server-side against the canonical UID and verified claims; client-supplied role flags are never authorization.
2. **Complete operational authority:** Subject to applicable law and the platform's security architecture, the Super Owner may create, read, inspect, approve, reject, modify, suspend, cancel, reverse, restore, refund, settle, grant, revoke, assign, remove, delegate, revoke delegation, audit and request reports for every present and future platform domain. This includes members, profiles, content, conversations, rooms, calls, advertising, media, wallet, BetaCoins, store, subscriptions, entitlements, moderation, operational settings and future modules.
3. **Unified console parity:** Every backend capability available to Super Owner must have a corresponding discoverable control-console action or a documented reason why it is a backend-only emergency operation. Controls must call authoritative server endpoints and report durable outcomes; hiding a UI control is not an authorization boundary.
4. **Private-content access:** Owner inspection/intervention in private conversations must be purpose-bound, authenticated with recent MFA/step-up, least-privilege at the service boundary, disclosed according to the approved privacy notice and applicable law, and recorded in an immutable audit trail containing actor, purpose, target, time, action and outcome. No silent or unaudited bulk surveillance.
5. **Credential recovery:** Super Owner may initiate, approve and complete account recovery or issue a short-lived, single-use reset credential. Existing passwords, password hashes, MFA secrets, recovery codes and access tokens must never be revealed in plaintext or made retrievable by administrators.
6. **Financial authority:** Super Owner controls configurable prices, quotas, packages, grants, refunds, settlements and economic parameters. Every balance mutation is server-authoritative, atomic, idempotent and auditable. No price or production quota may be invented by engineering.
7. **Delegation:** Admin 1..N and specialist roles are created, scoped, numbered, assigned and revoked only by Super Owner. Delegated permissions are explicit, bounded, non-transitive by default, revocable and audited; no delegated role can grant or acquire Super Owner authority.
8. **Development branch:** The only platform development/integration branch is `codex/mawda-full-platform-implementation`. Do not create parallel feature-development branches. Repository-enforced protection must not be bypassed; if a required review/CI workflow makes direct updates impossible, stop and report the exact blocker rather than silently creating an alternate development line.
9. **Simulation boundary:** The 5,000-persona lab is the only location for large-scale persona simulation and its synthetic fixtures/logs. It must track the exact Full Platform commit SHA under test, preserve its simulation harness, and remain unable to deploy or mutate production/cloud resources.
10. **Internal verification mandate:** Enable and run all applicable GitHub-hosted checks that require no production/cloud mutation: Flutter format/analyze/tests/builds, backend install/build/unit tests, Firestore/Storage emulator security tests, static/security/dependency scans, workflow/YAML validation, and lab harness validation. Large-scale 5,000-persona runs execute only in the lab and only when explicitly authorized under the simulation boundary. A workflow existing or being enabled is not evidence it passed.
11. **No production side effects:** CI must use emulators, mocks, synthetic fixtures and isolated test credentials. No Firebase production project `mawda-app-2026`, production data, billing, deployment, DNS cutover, or live cloud resources may be changed by CI without a separate explicit owner approval.
12. **Acceptance evidence:** Every requirement must map to its governing decision ID, source paths, server/client implementation, security rules, tests, and latest successful GitHub run/SHA. Mark features complete only when evidence exists; distinguish static validation, emulator tests, lab simulation, device acceptance and production readiness.

## 6. Supersession and conflict handling

This constitution is the latest owner-approved operational lock effective 2026-11-27 11:09:33 UTC. Older documents remain historical and technical references only where they do not conflict. A conflict must be logged and reconciled in the constitution, product constitution, vision, approved-decision register, implementation traceability, release checklist and affected tests. Do not silently retain an older restrictive rule or silently erase a safety requirement; preserve the owner's full administrative authority through secure, server-side, auditable implementation.
