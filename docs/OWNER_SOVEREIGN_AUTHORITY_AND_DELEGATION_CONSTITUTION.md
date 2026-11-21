# Mawdda Super Owner Sovereign Authority and Delegation Constitution

**Status:** Owner-approved governance requirement — 19 November 2026  
**Applies to:** All Mawdda Platform domains, applications, services, workspaces, operational roles and future modules  
**Authority:** Super Owner / Platform Owner

## 1. Sovereign owner authority

The Platform Owner (Super Owner) is the single highest authority for Mawdda Platform. The owner retains exclusive final authority and control across every platform domain, including (without limitation):

- Platform administration, configuration, governance and operational settings.
- Members, accounts, identity lifecycle, moderation and platform access.
- Messaging, communities, public/private rooms, room rentals and room operations.
- Advertising, advertisers, representatives, campaigns, media workspaces and production workflows.
- Economic engine, coins, wallets, store, products, subscriptions, entitlements, grants, payment policies, financial records and owner-decided refunds.
- Media, uploads, review, retention configuration, Media Saver eligibility and privacy/security controls.
- AI capabilities, integrations, notifications, analytics, support and future platform modules.
- Staff appointments, role assignment, permission catalogues, delegation, suspension, partial revocation and full revocation.

No employee, administrator, supervisor, representative, moderator, service account or delegated role may acquire authority equal to, greater than, or independent of the Super Owner. No role title alone grants a permission. No delegated permission may confer owner identity, owner claims, owner-only authority, authority to appoint or empower another administrator, or authority to override an owner decision.

The owner may make any platform decision reserved to the owner, subject to applicable law, security controls, and the platform's requirement to preserve truthful, immutable audit evidence. This constitution does not authorize silent alteration or deletion of audit/financial/legal evidence, unsafe access to member data, or bypass of authentication and step-up controls.

## 2. Owner-controlled permission catalogue

The owner console must present selectable, role-specific permission options. The owner—not a preset role bundle or developer assumption—chooses the permissions granted to each individual. The interface must make clear the role family, capability description, risk level, allowed resource scope, and whether the action is owner-reserved.

The owner must be able to:
- Grant one permission or any approved subset of a role catalogue.
- Add further approved permissions to an existing grant without replacing unrelated grants.
- Edit an individual permission or its resource scope.
- Partially revoke one or more permissions while retaining the others.
- Suspend a delegation temporarily and later reinstate it by a new owner action.
- Revoke all permissions for an individual and terminate the delegation.
- Set or change an optional expiry and renew a delegation.
- Inspect the effective permissions and scope before confirming a change.
- Review version history and the complete audit trail for every grant, amendment, suspension, reinstatement and revocation.

All changes must be authenticated owner actions, server-authoritative, versioned, audited, replay-safe and applied atomically. The system must fail closed for missing, malformed, expired, suspended, revoked, out-of-scope or stale grants. Revocation must take effect on every protected server operation, not merely hide client UI.

## 3. Role-family separation and catalogue sources

The following are separate role families and must not inherit permissions from one another:

1. **General Administrators: Admin 1, Admin 2, …, Admin N** — a variable number of separately numbered general-administration appointments; Super Owner sets the count. Each appointment has a stable non-reused identifier and individually selected server-enforced permissions. Its capability catalogue must come only from the previously owner-approved general-administration source. Do not borrow the advertising catalogue or invent capabilities.
2. **Admin Media 1–5** — advertising/media-workspace administration. Reuse the approved catalogue in `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md`, Section 3, and its appointment/delegation controls in Section 8. Each of the five appointments has an independent permission set.
3. **General Advertising Supervisors** — separate advertising operational role family.
4. **General Production Supervisors** — separate production oversight role family.
5. **Team Production Supervisors** — limited to their assigned team, room and tasks.
6. **Production Technical-Review Team** — technical-review permissions only within assigned workflow scope.
7. **Legal/Administrative Contract Supervisors** — contract/legal-administrative workflow scope only.
8. **Other specialist roles** — each requires an owner-approved catalogue and explicit scope before any permission is granted.

The advertising/production role families must follow `docs/MAWDDA_ADVERTISING_PRODUCTION_GOVERNANCE_2026.md` and the canonical terminology register. Production workflow order, room roster limits, evidence integrity and publication gates remain unchanged by this authority clarification.

## 4. Additional permissions and extensions

The owner may grant additional capabilities beyond an individual's initial selection only when those capabilities exist in an owner-approved, typed permission catalogue. The product must support additive grants and future catalogue extensions without broad wildcard permissions.

A new capability must have:
- A unique stable permission identifier and clear human-readable label.
- A documented purpose, risk classification and owning role family.
- Explicit allowed actions and resource scope.
- Server-side enforcement points and negative authorization tests.
- An owner-reserved flag where applicable.
- Audit event semantics and revocation behavior.

Do not implement an unrestricted `*`, arbitrary client-supplied permission string, generic super-admin flag, or any mechanism that lets a delegate define or grant new permissions to themselves or others. If the owner requests a capability not yet in the approved catalogue, record it as a proposed catalogue addition and implement it only after its scope and enforcement are specified.

## 5. Owner-only and non-delegable controls

Owner-only powers include the sovereign authority to appoint and remove administrators, create and change delegation policy, grant/revoke staff permissions, change owner-controlled economic and platform policies, make owner-reserved operational decisions, and exercise final approval where the relevant product workflow reserves it to the owner.

These powers must not be delegated by implication, inherited from a broad role, or made available through client flags. A delegated role cannot:
- Create, modify or revoke another person's permissions unless a specific non-owner administrative capability is explicitly approved; such capability still cannot touch owner-reserved grants.
- Assign itself a new role or expand its own scope.
- change owner identity, owner claims, owner recovery or global security authority.
- Override an owner block, owner rejection, owner financial decision or owner publication gate.
- Access company-wide financial or settlement records unless a separate, explicit, owner-approved permission and scope exists; existing advertising exclusions remain binding.
- Delete or rewrite immutable audit, financial, signed-contract or legal evidence.

## 6. Security and accountability

Owner authority is exercised through verified server-side owner identity, strong authentication, MFA/step-up for sensitive operations, recent-authentication checks where required, least-privilege service execution, immutable audit records and tested recovery. The owner console is not itself an authorization boundary: every callable, database access path, storage capability and privileged operation must enforce authorization on the trusted backend.

Audit records must identify actor, target, role family, permission identifier(s), prior and resulting version, scope, action, timestamp, reason where required, and idempotency/request identifier. Sensitive changes must be atomic and protected against replay and concurrent stale updates.

## 7. Implementation and acceptance requirements

This document is an approved governance requirement, not a claim of completed implementation. Engineering must:
1. Trace every role family to its approved source catalogue.
2. Build an owner-facing selectable catalogue and per-person grant editor.
3. Support additive grants, granular edits, partial/full revocation, suspension, reinstatement and expiry.
4. Enforce every permission and scope server-side on all protected operations and data paths.
5. Preserve owner-only boundaries and prevent role inheritance across families.
6. Add positive, negative, cross-account, cross-scope, expiry, revocation, replay, concurrency and audit tests.
7. Record exact commit SHA and exact-head validation evidence in `docs/IMPLEMENTATION_TRACEABILITY.md`.

No merge to `main`, production deployment, production Firebase mutation, paid-resource activation or live policy change is authorized by this document. Those actions continue to require separate explicit owner approval.
