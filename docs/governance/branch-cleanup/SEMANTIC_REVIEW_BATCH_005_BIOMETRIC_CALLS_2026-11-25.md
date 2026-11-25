# Semantic review batch 005 — biometric, governance and call candidates 61–72
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned target HEAD before report: 0b4ce216623ea35e2248b4d7dcd7d3ae662b4426
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 61–72 (12 commits), spanning biometric policy/evidence, canonical roles and call reservation/economy documentation.

## Candidate-by-candidate classification

| # | Candidate SHA | Change | Current Full Platform evidence | Result |
|---:|---|---|---|---|
| 61 | e3e917e31b9a7f9bf007141332c7794921ad6a18 | Record approved phrase and implementation checkpoint | Current implementation-gap document has newer cross-platform, CI, 20-second policy and 2026-11-21 updates, but does not contain this historical checkpoint. The candidate text says server-side audio validation up to 60 seconds and says the callable lifecycle is still pending, both stale against current code/policy | Not ported; historical checkpoint is obsolete and would introduce false status/policy detail |
| 62 | 20089a6d171979d63f08e9ab80048328fbdfc05b | Record exact owner-approved spoken phrase in final policy | Current code constant and unit test contain the exact phrase/version, but the current final policy still requires the phrase to be supplied as a separate owner-controlled configuration. The candidate changes the authoritative policy wording to put the exact phrase in the policy | Held for explicit owner confirmation; no policy edit |
| 63 | 701748dc22326922ad3599a618f2cf8ee4222e73 | Test approved phrase and evidence identity constraints | Current functions/test/biometric-evidence.test.js covers exact phrase/version, byte ceilings, canonical identity and reward ledger ID; obsolete direct Storage path assertions were correctly removed in later evolution | Present in evolved form |
| 64 | 5a09999a7e09a5d16e0de45cf3be90e5893be91b | Add approved phrase and request-bound evidence contract | Current biometric-evidence.ts contains phrase/version, audio/video byte ceilings, 20-second audio duration, identity validation and reward ledger ID. Direct object-path helper was removed when the shared media pipeline became authoritative | Present; evolved and stricter |
| 65 | 64ccc7b20445e7be15d6ec4d0be0e329f0250f11 | Classify legacy owner identifiers as internal compatibility | Current canonical terminology document explicitly classifies SuperAdminScreen, SuperAdminSecurityService, isSuperAdmin and super_admin as internal compatibility identifiers and requires trusted platformOwner authorization | Present |
| 66 | b1fdc6333413f953d0ce68061c278a0218d882dc | Confirm owner-approved canonical role hierarchy | Current canonical terminology document contains the sole Super Owner hierarchy, Admin delegation boundaries, five Admin Media seats, five General Production Supervisors and open-ended Team Production Supervisors, with deny-by-default authorization and unresolved seat-reuse rule | Present |
| 67 | 10564784494310761bb4249d703d646020209e35 | Record partial call reservation remediation and remaining blockers | Current calls execution audit contains the partial-remediation section, helper/wiring/test commit references and explicit remaining blockers; it correctly says call economy is not complete | Present, but the audit has older source-level statements that should be revalidated against current code |
| 68 | 6ef8fc34262d3ea8c947cf6839b0070995ecc5d2 | Align group-call economy tests with approved participant caps | Current group-call economy tests include five-person audio and four-person video cases; seven/nine entries are labelled generic integer-allocation tests rather than supported audio capacities | Present |
| 69 | 6d54df1b251033aecbc7ee8c25e162ce6676b87f | Add unit coverage for pending call invitation reservations | Current call-signaling-policy.test.js covers caller reservation, pending invitees, accepted members, rejected/departed members and terminal calls | Present |
| 70 | 53d6a038a60158ba57ef8f4d3f968d37ef921aeb | Allow invitees to decline/ignore pending invitations without being treated as busy | Current index.ts imports and uses isCallMemberBusyInSession in startCall reservation logic | Present |
| 71 | 7bf65b812c2f456ab4a4187f6257cb20ac42324f | Fix pending call invitees not reserving active-call slots | Current call-signaling.ts exports the helper; it reserves caller and accepted members only, and excludes rejected/left invitees | Present |
| 72 | 56bb24f451bcf897e5b33e0275cedb295ac22aa3 | Document call economy wiring gaps and local test blockers | Current calls execution audit includes the economic integration verification section and the partial remediation section. Its statement that index.ts has zero references to call-specific entitlements is stale relative to current imports; do not treat the historical text as a current source audit | Present as historical documentation; stale claims require a new current audit |

## Result
- Reviewed: 12/1,665 unique candidates (61–72).
- Present or superseded in current implementation/documentation: 10.
- Held for explicit owner confirmation or because historical status/policy text is stale: 2.
- Confirmed unique missing implementation changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0. Source, test definitions and documentation were inspected only.
- No CI success is claimed.

## Governance holds
1. Do not alter the final owner-approved biometric policy phrase/configuration clause based only on a historical branch patch. The implementation constant and test prove the configured phrase, but they do not independently authorize changing the policy document's configuration rule.
2. Do not port the old implementation-gap checkpoint: it states a 60-second biometric audio limit and pending lifecycle work, whereas current policy/server enforcement is 20 seconds and the lifecycle is already implemented. Preserve the newer 2026-11-21 record.
3. The call execution audit contains historical zero-reference statements that conflict with current index.ts imports/use of call entitlement and reservation helpers. This is a documentation freshness issue; do not silently rewrite the historical audit entry as if it were current.

## Safety decision
No source code or authoritative policy document was changed. No call charging, billing, production Firebase resource, deployment or main-branch operation was performed. Call economy remains explicitly incomplete pending its documented server-side entitlement/admission, trusted participant metering, atomic settlement and test gates.