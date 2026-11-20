# Phase 1 — Specialized callable authorization inventory

Date: 2026-11-20  
Audited candidate: `codex/mawdda-phase1-unified-2026-11-19`  
Audited SHA: `78d0b982723abd76b6ef098ef2c96e79f8e36821`  
Related issue: #48

## Executive finding

The specialized-role grant model is implemented as data and pure authorization logic, but delegated authorization is not wired into the advertising/production callable surface. A full scan of `functions/src/index.ts` found no import or invocation of `hasAdvertisingPermission`. This is a functionality/integration gap, not evidence that a supervisor currently bypasses Owner checks: the inspected administrative operations below remain explicitly Owner-only. Do not weaken those guards until an authoritative operation-to-permission-to-resource binding is implemented and tested.

## Source-of-truth contracts

- `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md` section 3 is the Owner-approved Admin Media permission catalogue.
- `functions/src/advertising-permissions.ts` validates the Admin Media subset, rejects unknown/duplicate grants and keeps commission, payment receipt, Company finance, Owner emergency withdrawal, supervisor management and Company countersignature Owner-only.
- `functions/src/advertising-governance.ts` defines specialized role families, role-bound permission options, grant validation, status/time checks and exact resource-scope matching.
- `functions/test/advertising-permissions.test.js` verifies exact parity with the approved specification, duplicate rejection and Owner-only boundaries.
- `functions/test/advertising-governance.test.js` verifies exact UID, permission, active time, role family and resource scope; malformed grants fail closed.
- `setOwnerAdvertisingRoleGrant`, `updateOwnerAdvertisingRoleGrantPermissions` and `revokeOwnerAdvertisingRoleGrant` are Owner-only grant administration callables.

## Callable inventory

| Callable / surface | Current authorization | Delegated permission wiring |
|---|---|---|
| `submitAdvertisingIntake` | Authenticated, verified email and App Check; creates an application only | None; correctly grants no role/campaign/payment/publication |
| `listOwnerAdvertisingIntake` | `requireOwner` | None; remains Owner-only |
| `reviewOwnerAdvertisingIntake` | `requireOwner` | None; remains Owner-only |
| `submitProductionApplication` | Web portal, authenticated, verified email and App Check; application only | None; role/room permission explicitly false |
| `listOwnerProductionApplications` | `requireOwner` | None; remains Owner-only |
| `reviewOwnerProductionApplication` | `requireOwner` | None; acceptance is preliminary and does not activate role/room rights |
| `getOwnerAdvertisingRoleGrants` | `requireOwner` | None; Owner-only |
| `setOwnerAdvertisingRoleGrant` | `requireOwner` | None; Owner-only |
| `updateOwnerAdvertisingRoleGrantPermissions` | `requireOwner` | None; Owner-only |
| `revokeOwnerAdvertisingRoleGrant` | `requireOwner` | None; Owner-only |
| `createOwnerContractDraft`, `transitionOwnerContract`, `listOwnerContracts` | Owner + web portal / App Check as configured | No delegated contract authority |
| `signContractAsCounterparty` | Exact contract counterparty and contract state/version checks | Not a specialist grant |
| `signContractForCompany` | Owner / Company signatory checks | Not delegated |
| Production room/task/review operations | No delegated specialist callable surface was found in the audited export inventory | No inferred permission mapping |

The list above describes the audited candidate at the exact SHA in the header. It is not a claim that all future operations are covered.

## Blocking server-binding gaps

1. The persisted `resourceScopes` values are arbitrary non-wildcard strings. The helper checks exact equality, but no canonical server-derived resource-scope builder is connected to advertising intake records.
2. Advertising intake records have no authoritative assignment/ownership field that distinguishes a supervisor's assigned requests from all requests.
3. The current intake workflow does not expose separate read/review/assign transitions for delegated Admin Media roles. Owner review transitions remain Owner-only.
4. The approved catalogue includes geographic validation and representative-scoped work, but the audited intake record does not yet provide a trusted, versioned geographic/assignment binding that can be used to authorize those actions.
5. Production room/task/review resources have no complete callable inventory and canonical per-resource scope mapping in this candidate.

## Safe implementation sequence

1. Add authoritative, server-owned assignment and resource identity fields to the relevant records; clients must not choose their own authorization scope.
2. Define canonical scope builders by resource family (for example, request, campaign, production room/task) and test that a client-supplied scope is ignored.
3. Map each existing callable to one exact approved permission and exact resource type; keep Owner-only actions outside the delegated catalogue.
4. Load and validate active grants inside the callable, checking authenticated UID, role family, grant status, start/end time, permission and server-derived exact scope.
5. Use transactions/version checks for assignment changes and state transitions; ensure reassignment/revocation takes effect on the next request.
6. Add Emulator allow/deny tests for Owner, assigned supervisor, unassigned supervisor, wrong scope, cross-family permission, expired/suspended/revoked/malformed grant, member and representative.
7. Only then replace an Owner-only guard with a delegated guard for the specific approved operation. Never add a broad generic supervisor bypass.

## Explicitly not changed

- No callable authorization was relaxed.
- No permission key, role, geographic rule, contract-signing power or financial authority was invented.
- No Firestore/Storage rules, production Firebase resource, billing, deployment or `main` branch was changed.
- Delegated advertising/production actions remain unavailable until the missing authoritative resource and assignment model is approved and implemented.

## Acceptance status

**Inventory complete; implementation blocked by missing authoritative resource/assignment binding.** Issue #48 remains open. This document is an audit artifact, not a claim that delegated callable authorization is complete.


## Re-audit against current candidate — 2026-11-20

Current audited candidate SHA: `461a9f21f6bf7bd7e9829fd0c5585de563993572`.

- Recounted the exported `onCall` declarations in `functions/src/index.ts`: 146.
- Rechecked the complete file for `hasAdvertisingPermission`: zero occurrences; the evaluator is not imported or invoked by any exported callable.
- Reconfirmed Owner gates and canonical collections:
  - Timed ads: `timedAdCampaigns`, `timedAdCampaignVersions`, linked `mediaAssets`; `setTimedAdCampaign`, `getOwnerTimedAdCampaigns`, `setTimedAdCampaignStatus` remain Owner-only.
  - Advertising intake: `advertisingIntakeRequests`; `listOwnerAdvertisingIntake` and `reviewOwnerAdvertisingIntake` remain Owner-only; member submission is application-only.
  - Production applications: `productionApplications`; list/review remain Owner-only; acceptance does not grant room/task permissions.
  - Specialized grants: `specializedRoleGrants`; grant creation, permission deltas, capacity and revocation remain Owner-only.
  - Contracts: `contracts`; company draft/transition/signing remain Owner-only, with `ownerUid` binding; counterparty signature is separately bound to exact verified UID/email and content hash/version.
- Searched the full callable source for assignment field names and collections: no `assignedUid`, `assignedUids`, `assignmentId`, `assignedTo`, `campaignAssignments` or `productionAssignments` found. Grant `resourceScopes` remain opaque strings and cannot establish that a referenced resource exists or is assigned to the grantee.
- No delegated authorization was added. This is intentional fail-closed behavior pending Owner approval of an authoritative assignment schema and exact operation/permission/resource matrix.
- The updated source review is also recorded in the Phase 1 integration tracker and Issue #48. The current implementation acceptance remains OPEN.
