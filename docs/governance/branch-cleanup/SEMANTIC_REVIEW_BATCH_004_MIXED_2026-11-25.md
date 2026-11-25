# Semantic review batch 004 — mixed biometric, governance and call-economy candidates
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 61–72 (12 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| e3e917e31b9a7f9bf007141332c7794921ad6a18 | Record approved biometric phrase and implementation checkpoint | Exact phrase and version are present in functions/src/biometric-evidence.ts and its unit tests. The old checkpoint text itself is not carried forward because its pending-state description is obsolete. | Behavior present; do not copy stale checkpoint prose |
| 20089a6d171979d63f08e9ab80048328fbdfc05b | Record exact owner-approved spoken phrase in policy | Phrase/version are implemented and asserted in tests. The target owner policy retains separate product-policy constraints; wholesale replacement would leave contradictory old wording. | Phrase contract present; policy wording needs careful consolidation, no direct port |
| 701748dc22326922ad3599a618f2cf8ee4222e73 | Test phrase and evidence identity constraints | functions/test/biometric-evidence.test.js asserts exact phrase/version, byte ceilings, canonical member identity and reward ledger identity. | Already implemented; later test evolved to remove obsolete direct Storage paths |
| 5a09999a7e09a5d16e0de45cf3be90e5893be91b | Add biometric evidence contract | Current functions/src/biometric-evidence.ts contains phrase/version, byte limits, identity validation and reward ledger ID. The historical direct Storage path helper is intentionally absent because the current media pipeline owns request-bound paths. | Core contract present; obsolete path helper superseded |
| 64ccc7b20445e7be15d6ec4d0be0e329f0250f11 | Classify legacy owner identifiers as internal compatibility | Current docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md explicitly identifies SuperAdminScreen, SuperAdminSecurityService, isSuperAdmin and super_admin as internal compatibility identifiers and preserves platformOwner server authority. | Already documented |
| b1fdc6333413f953d0ce68061c278a0218d882dc | Confirm canonical role hierarchy | Current canonical terminology document includes the one Super Owner, delegated Admin, five Admin Media, five General Production Supervisors and scoped Team Production Supervisors hierarchy. | Already documented |
| 10564784494310761bb4249d703d646020209e35 | Record partial call reservation remediation and remaining blockers | Current call audit contains the helper/wiring/test remediation, while explicitly keeping invitee selection, entitlement/consent, trusted metering and atomic settlement open. | Already documented; current source is later |
| 6ef8fc34262d3ea8c947cf6839b0070995ecc5d2 | Align group-call economy tests with approved caps | Current group-call economy tests include the five-person audio and four-person video approved maxima; seven/nine entries are generic arithmetic only. | Already implemented |
| 6d54df1b251033aecbc7ee8c25e162ce6676b87f | Add pending call invitation reservation unit tests | Current call-signaling-policy.test.js covers ringing caller, pending invitee, accepted member, rejected/left member and terminal calls. | Already implemented |
| 53d6a038a60158ba57ef8f4d3f968d37ef921aeb | Wire call-member reservation helper into startCall | Current functions/src/index.ts imports and invokes isCallMemberBusyInSession in the startCall transaction. | Already implemented |
| 7bf65b812c2f456ab4a4187f6257cb20ac42324f | Add call-member reservation policy helper | Current functions/src/call-signaling.ts exports isCallMemberBusyInSession with the same caller/accepted/rejected/left semantics. | Already implemented |
| 56bb24f451bcf897e5b33e0275cedb295ac22aa3 | Verify call economy wiring gaps | Current call audit records the missing invitation/approval, entitlement/financial consent, per-participant trusted connection measurement and atomic wallet settlement; it also records that calculation helper alone is not billing. | Already documented; current audit retained |

## Result
- Reviewed in this batch: 12/1,665 unique candidates.
- Behavior or evidence already present / superseded: 12.
- Confirmed unique missing code changes: 0.
- Code transferred: 0.
- Tests executed in this review: 0. Source inspection only.
- No CI or workflow success is claimed.

## Notes
The current room-call integration fixture was read back and does use a private rented room with a matching active rental record and seeded call entitlements. The current profile screen also contains the corrected BetaCoins spelling and clarifies that local device biometrics do not grant server-side verification or rewards. The call economy remains explicitly incomplete; no charging path is enabled by this review.

## Safety decision
No cherry-picks are justified. Historical documentation commits are superseded by the current governance/audit documents, and their code/test changes are present. Continue with the next candidate range.