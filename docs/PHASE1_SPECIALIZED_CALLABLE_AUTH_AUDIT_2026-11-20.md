# Phase 1 Specialized Callable Authorization Audit — 2026-11-20

## Scope and method

Read-only source audit on `codex/phase1-specialist-callable-auth-2026-11-20`, created from the current `codex/mawdda-phase1-unified-2026-11-19` development line. Reviewed:

- `functions/src/advertising-governance.ts`
- `functions/src/index.ts`, including the advertising intake, production application, timed-ad campaign, specialist-grant, and contract callable sections.

No production resources, Firebase settings, prices, quotas, retention policies, or signing authority were changed.

## Confirmed implementation facts

1. `advertising-governance.ts` defines role-bound permission families and `hasAdvertisingPermission`. The evaluator validates grant shape, UID, active status, start/end window, exact permission membership, and exact resource-scope membership. Invalid grant records fail closed.
2. The audited `functions/src/index.ts` imports grant validation and grant-management helpers, but does not import or invoke `hasAdvertisingPermission`. Therefore the evaluator is not connected to protected callable authorization.
3. Existing privileged administration callables remain Owner-gated, including:
   - Timed-ad campaign administration: `setTimedAdCampaign`, `getOwnerTimedAdCampaigns`, `setTimedAdCampaignStatus`.
   - Production application review: `listOwnerProductionApplications`, `reviewOwnerProductionApplication`.
   - Advertising intake review: `listOwnerAdvertisingIntake`, `reviewOwnerAdvertisingIntake`.
   - Specialist grant administration: `getOwnerAdvertisingRoleGrants`, `getOwnerSpecializedRoleCapacity`, `setOwnerSpecializedRoleCapacity`, `setOwnerAdvertisingRoleGrant`, `updateOwnerAdvertisingRoleGrantPermissions`, `revokeOwnerAdvertisingRoleGrant`.
   - Contract drafting, lifecycle and company signing paths use Owner/MFA-specific gates; they must not be delegated through the advertising specialist permission set.
4. Public application/intake callables create requests only; their comments and server flow explicitly do not grant roles, publish campaigns, accept payment, or create privileged access.
5. The current code therefore fails closed for specialist access: a grant document alone does not confer callable access. This is safer than an incomplete delegated authorization rollout.

## Authorization matrix status

| Operation family | Current gate | Specialist permission mapping | Resource scope source | Decision |
|---|---|---|---|---|
| Timed-ad campaign create/read/status | Owner-only | Not wired | No authoritative campaign-to-assignee scope contract established in this audit | Keep Owner-only |
| Production application review | Owner-only | Not wired | Application reviewer assignment/ownership contract not established | Keep Owner-only |
| Advertising intake review | Owner-only | Not wired | Intake-to-assignee scope contract not established | Keep Owner-only |
| Specialist role grant/capacity administration | Owner-only | Must remain Owner-only | Platform-wide governance | Never delegate |
| Contract draft/transition/company signature | Owner/MFA-specific | Not in specialist permission family | Contract counterparty and company-signature evidence | Never delegate |
| Public production/advertising submissions | App Check + portal/identity validation | No grant | Requester-owned idempotent intake record | Submission only; no privilege |

## Blocking design decisions — do not infer

Before delegated permissions can be connected, the owner-approved policy must define, for each intended operation:

- The exact permission identifier and role family.
- The canonical resource type and server-derived resource ID.
- How an assignment is created, changed, revoked, and audited.
- Whether the assigned resource owner or the platform owner may reassign it.
- Which read/write fields and transitions the specialist may perform.
- Whether any operation requires a second-person or Owner approval.

Client-supplied scope strings, role labels, or arbitrary document IDs are not authoritative. Do not introduce wildcard scope or infer a scope from the submitted payload.

## Required next implementation sequence

1. Obtain/derive the approved operation-to-permission matrix and authoritative assignment model from the product constitution and owner-approved decisions.
2. Add a server-only authorization helper that loads grants from Firestore and derives scope from the canonical resource document inside the trusted callable path.
3. Keep platform Owner authority exclusive; reject malformed, stale, suspended, revoked, expired, cross-family, missing, and mismatched grants.
4. Add callable-level Emulator allow/deny tests for Owner, valid assigned scope, wrong scope, expired/suspended/revoked/missing grants, and cross-family permission attempts.
5. Run exact-head Validate Mawda and Mawdda domain regression before any delegated capability is considered.

## Acceptance status

**Not accepted / intentionally fail-closed.** This audit establishes that the helper exists but is not connected, and that current privileged paths remain Owner-gated. It does not authorize staff capability activation. The missing authoritative assignment/scope contract is a blocking product-governance input, not a coding detail to guess.

No merge to `main`, deployment, Firebase production mutation, billing activation, price/quota/retention change, or contract-signing authority change is included.
