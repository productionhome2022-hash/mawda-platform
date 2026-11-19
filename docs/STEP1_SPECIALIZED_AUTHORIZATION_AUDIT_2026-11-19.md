# Step 1 — Specialized authorization enforcement audit

**Date:** 2026-11-19  
**Scope:** Development branch only  
**Status:** Confirmed security gap; remediation not yet implemented  
**Production impact:** None. No production Firebase resource, data, policy, deployment, billing, or `main` branch was changed.

## Evidence reviewed

The following branch files were inspected directly:

- `functions/src/index.ts`
- `functions/src/advertising-governance.ts`
- `docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md`
- `docs/MAWDDA_ADVERTISING_PRODUCTION_GOVERNANCE_2026.md`
- `docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md`
- `docs/OWNER_SOVEREIGN_AUTHORITY_AND_DELEGATION_CONSTITUTION.md`
- `docs/IMPLEMENTATION_TRACEABILITY.md`
- `.github/workflows/validate.yml`

## Confirmed findings

1. `advertising-governance.ts` defines specialist role identifiers, a typed permission catalogue, scoped grants, validity windows, grant status/version validation, and `hasAdvertisingPermission`.
2. `index.ts` imports grant validation, grant identity, and permission-delta helpers, but does not import `hasAdvertisingPermission`. The existing traceability register independently records that specialist permission grants are not yet enforced at protected specialist-operation call sites.
3. Owner grant creation/update/revocation is a separate capability from authorization of the delegated operation. A valid grant record alone does not protect an operation.
4. The approved governance requires every protected server operation to check the authenticated actor, active grant, exact role family, capability, resource scope, start/expiry, and current grant state. Missing, stale, suspended, revoked, malformed, or out-of-scope grants must fail closed.
5. The approved Admin Media 1–5 catalogue must be reused from the advertising workspace specification. General advertising supervisors, general production supervisors, team production supervisors, production technical reviewers, and legal/administrative contract supervisors remain distinct role families.
6. The Admin N catalogue is not present in the inspected authoritative sources. It must not be invented or borrowed from Admin Media.
7. The production workflow retains the five-person team roster limit; privileged observers remain outside the roster and must be restricted to assigned rooms.

## Root cause

The code currently has a permission data model and pure evaluator, but the evaluator is not connected to the protected specialist callables. Consequently, the system cannot claim that delegated specialist capabilities are operationally enforced merely because an owner can create or edit a grant.

## Required remediation sequence

1. Inventory every advertising, production, technical-review, and contract workflow callable and identify its authoritative resource ID and approved capability.
2. Implement one trusted server-side grant loader/evaluator that reads the grant from Firestore on each protected operation (or uses a rigorously invalidated version-bound cache), validates schema and lifecycle, and checks exact resource scope.
3. Bind each callable to its role family and capability; reject client-supplied role, permission, scope, owner, or approval flags as authorization evidence.
4. Revalidate resource ownership/assignment and current workflow state inside the same transaction as any mutation where feasible.
5. Write the operation audit event atomically with the protected state transition for privileged mutations.
6. Add callable/emulator tests for positive access, missing grant, wrong UID, wrong role, wrong capability, cross-resource scope, expired grant, suspended/revoked grant, stale version, replay, concurrent revocation, and audit-write failure.
7. Build the owner permission editor only against the reconciled role-specific catalogues and verify additive edits, partial/full revocation, suspension/reinstatement, expiry, and version history.
8. Run targeted backend unit and Firestore-emulator tests, then the normal CI workflow on the exact resulting commit. Record the SHA and job outcomes before marking the gap closed.

## Acceptance criteria

- Every protected specialist callable has an explicit server-side authorization check.
- Every check is tied to a documented role-family capability and exact resource scope.
- No specialist role inherits another role family's permissions or owner authority.
- Revocation, expiry, suspension, and scope changes affect the next protected operation.
- Negative cross-account and cross-scope tests pass.
- Mutations and their required audit evidence are atomic.
- Exact-head CI and emulator evidence are recorded.

## Explicitly not performed

This audit did not change application code, grant permissions, alter any live policy, enable advertising/production operations, run a 5,000-person simulation, merge to `main`, deploy, or access/modify production Firebase. The gap remains open until the remediation and acceptance evidence above are completed.
