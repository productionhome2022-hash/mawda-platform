# Semantic review batch 004 — biometric, governance and call lifecycle candidates
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned Full Platform HEAD before report: 81731bfd600d2d2d5fadef6327e58f255978c8ba
Recovery branch: codex/mawda-recovery-integration-2026-11-21
Recovery HEAD previously pinned: 49b502638718e4dbb29a9429f392b3a70c8d6d95
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 61–72 (12 commits). Candidates 37–60 remain pending and were not skipped as reviewed.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| e3e917e31b9a7f9bf007141332c7794921ad6a18 | Add approved phrase and implementation checkpoint to biometric gap record | The historical gap record is unchanged in Full Platform and Recovery. Current lifecycle implementation has since advanced substantially; appending the old checkpoint would reintroduce stale statements that the state machine/callables are not wired. | Historical checkpoint superseded; do not port stale status text |
| 20089a6d171979d63f08e9ab80048328fbdfc05b | Put exact owner phrase into final biometric policy document | Current policy says phrase text must be supplied/versioned as separate owner-controlled configuration and must not be hard-coded in that policy. Exact phrase/version are present in functions/src/biometric-evidence.ts and unit tests, but the policy file does not embed it. The historical patch adds the phrase to the policy while retaining the no-hard-code/configuration instruction, creating an internal contradiction. | Governance/configuration conflict; do not port as-is; requires owner-approved resolution of source-of-truth/configuration |
| 701748dc22326922ad3599a618f2cf8ee4222e73 | Test approved phrase and evidence identity constraints | Current biometric-evidence.test.js tests exact phrase/version, byte ceilings, canonical member identity and reward-ledger identity. The obsolete direct Storage path helper assertions were correctly removed in a later refactor. | Present in updated form |
| 5a09999a7e09a5d16e0de45cf3be90e5893be91b | Add approved phrase and request-bound evidence contract | Exact phrase/version, limits, identity validation and ledger identity are present in biometric-evidence.ts; old direct object-path helper was removed in favor of the unified request-bound media pipeline. | Core behavior present; historical helper superseded |
| 64ccc7b20445e7be15d6ec4d0be0e329f0250f11 | Classify legacy owner identifiers as internal compatibility | Canonical terminology doc explicitly lists SuperAdminScreen, SuperAdminSecurityService, isSuperAdmin and super_admin as legacy/internal identifiers, and documents trusted platformOwner authority. | Present |
| b1fdc6333413f953d0ce68061c278a0218d882dc | Confirm owner-approved canonical role hierarchy | Current canonical terminology doc contains the exact-one sovereign Super Owner, delegated Admin scope, five Admin Media roles and production supervisor role distinctions. | Present |
| 10564784494310761bb4249d703d646020209e35 | Record partial call reservation remediation | Current call audit doc records the helper, transaction wiring, reservation semantics, tests, and explicitly states the call-economy phase remains partial. | Present |
| 6ef8fc34262d3ea8c947cf6839b0070995ecc5d2 | Align group-call economy tests with approved participant caps | Current tests include five-person audio and four-person video caps; seven/nine entries are explicitly generic arithmetic tests, not supported call capacities. | Present |
| 6d54df1b251033aecbc7ee8c25e162ce6676b87f | Add unit coverage for pending call invitation reservations | Current call-signaling-policy tests cover ringing caller, pending invitee, accepted participants, rejected/departed participants and terminal calls. | Present |
| 53d6a038a60158ba57ef8f4d3f968d37ef921aeb | Wire pending-invitee reservation policy into startCall | Full Platform call-signaling helper and startCall transaction use isCallMemberBusyInSession; Recovery contains the helper and corresponding wiring as well. | Present |
| 7bf65b812c2f456ab4a4187f6257cb20ac42324f | Add call participant busy-state helper | Current functions/src/call-signaling.ts exports the helper with caller/accepted/rejected/left semantics. | Present |
| 56bb24f451bcf897e5b33e0275cedb295ac22aa3 | Document missing call-economy wiring and blockers | Current call audit doc records missing call-specific entitlement/billing/settlement wiring and states the calculation helper is not wallet settlement. This remains a valid blocker, not a completed feature. | Present; blocker remains open |

## Cross-layer findings
1. The owner-approved phrase and version are implemented as source constants and covered by tests, but the final policy document still describes the phrase as separate owner-controlled configuration and does not contain the phrase. This is a configuration/source-of-truth alignment issue. Do not silently change policy wording or claim the source constant is an externally managed configuration.
2. The call reservation fix is present and documented. It does not complete call economy: current audit documentation explicitly says call-specific entitlement, trusted participant metering and atomic/idempotent settlement remain missing. Do not infer call charging readiness from reservation tests.
3. The biometric implementation-gap note is a historical checkpoint. Its old statements are superseded by current code and must not be reintroduced as current status.

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present, updated, or superseded safely: 10.
- Historical/stale checkpoint not ported: 1.
- Governance/configuration conflict requiring owner resolution: 1.
- Confirmed unique missing code change suitable for transfer: 0.
- Code transferred: 0.
- Tests executed in this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
No historical code or documentation patch was transferred. The phrase/configuration source-of-truth conflict is retained as an explicit unresolved decision; the call-economy blockers remain open. Continue with candidate 49 onward after this checkpoint.