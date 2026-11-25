# Supplemental review to batch 004 — biometric, governance and call-economy candidates 61–72
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD before this report: e41f1aa458fef515aecff067d48e9b0ebc8a4507
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: supplemental correction to batch 004. This record captures the exact missing implementation/test/governance details found after the initial semantic classification of candidates 61–72.

## Candidate-by-candidate disposition

| Candidate SHA | Subject | Current Full Platform evidence / action | Result |
|---|---|---|---|
| e3e917e31b9a7f9bf007141332c7794921ad6a18 | Record approved phrase and implementation checkpoint | The implementation-gap document already contains later cross-platform, wallet-ledger, 20-second duration and CI checkpoint detail. The candidate's historical checkpoint describes a 60-second audio implementation and is stale. Its phrase-approval text is entangled with the separate policy wording conflict | Superseded; do not copy stale checkpoint or alter policy text |
| 20089a6d171979d63f08e9ab80048328fbdfc05b | Record exact owner-approved spoken phrase in final policy | Current policy retains the requirement for separate owner-controlled phrase configuration and says not to hard-code phrase wording. The source change adds exact phrase wording without resolving that clause; candidate 15de12a... later attempts to remove it. Both policy edits need explicit owner confirmation as a coherent change | Blocked: policy conflict, no document change |
| 701748dc22326922ad3599a618f2cf8ee4222e73 | Test approved phrase and evidence identity constraints | Current functions/test/biometric-evidence.test.js tests exact phrase/version, byte ceilings, canonical member identity, and reward-ledger identity. The historical direct Storage path assertions were removed with the obsolete path helper | Present; obsolete assertions correctly superseded |
| 5a09999a7e09a5d16e0de45cf3be90e5893be91b | Add approved phrase and request-bound evidence contract | Current biometric-evidence.ts contains phrase/version, 5 MiB audio and 25 MiB video byte ceilings, upload/review TTLs, reward amount, canonical identity validation and reward ledger ID. Direct object-path helper was later removed in favor of media pipeline | Present; path helper superseded |
| 64ccc7b20445e7be15d6ec4d0be0e329f0250f11 | Classify legacy owner identifiers as internal compatibility | Current canonical terminology document explicitly classifies SuperAdminScreen, SuperAdminSecurityService, isSuperAdmin and super_admin as internal compatibility identifiers, and preserves trusted platformOwner authorization | Present |
| b1fdc6333413f953d0ce68061c278a0218d882dc | Confirm owner-approved canonical role hierarchy | Current canonical terminology document records the sole Super Owner, delegated Admin scope, Admin Media capacity and production-supervisor distinctions | Present |
| 10564784494310761bb4249d703d646020209e35 | Record partial call reservation remediation and blockers | Current calls execution audit includes the partial reservation remediation, named commits, test limitations and remaining call-economy blockers | Present |
| 6ef8fc34262d3ea8c947cf6839b0070995ecc5d2 | Add explicit five-person audio and four-person video allocation tests | Current group-call-economy.test.js lacked explicit named maximum-capacity cases. Added two tests: five-person audio split (1,000 / 5 = 200 each) and four-person video split (2,000 / 4 = 500 each) | Restored missing tests in commit e41f1aa458fef515aecff067d48e9b0ebc8a4507 |
| 6d54df1b251033aecbc7ee8c25e162ce6676b87f | Add unit coverage for pending call invitation reservations | Current call-signaling-policy.test.js already covers ringing caller reservation, pending invitees, accepted participants, rejected/departed participants and terminal calls | Present |
| 53d6a038a60158ba57ef8f4d3f968d37ef921aeb | Wire pending invitee reservation helper into startCall | Helper and unit tests existed, but target index.ts still used old inline logic that reserved every invitee while ringing. Restored the import and helper call in startCall, so only caller/accepted active participants are reserved | Restored missing wiring in commit dfe4580cc9b58821c5bb976b9a20e72a2908dc46 |
| 7bf65b812c2f456ab4a4187f6257cb20ac42324f | Add active-call reservation policy helper | Current call-signaling.ts already exports isCallMemberBusyInSession with caller/accepted/rejected/left semantics | Present |
| 56bb24f451bcf897e5b33e0275cedb295ac22aa3 | Document call-economy wiring gaps and blockers | Current calls execution audit includes the helper/catalog non-wiring findings, participant caps, absent billing/settlement, and verification limits | Present |

## Changes made in this batch
- Commit dfe4580cc9b58821c5bb976b9a20e72a2908dc46: wired isCallMemberBusyInSession into the startCall transaction and imported the helper. This fixes the confirmed mismatch where pending invitees were treated as busy before accepting.
- Commit e41f1aa458fef515aecff067d48e9b0ebc8a4507: added explicit five-person audio and four-person video allocation tests.
- Read-back verification confirms the helper import and call are present, the old inline logic is absent, and both capacity tests are present.

## Result
- Reviewed: 12/1,665 unique candidates (candidates 61–72).
- Already present or superseded by current implementation: 8.
- Missing code/test changes restored: 2.
- Policy-document candidates held pending resolution: 2 (phrase wording/checkpoint; no policy text changed).
- Confirmed missing changes still unaddressed in this batch: 0 code/test changes; 2 policy-document changes remain blocked pending owner confirmation.
- Tests executed: 0. Read-back verification only; no Node test runner or emulator was invoked.
- GitHub combined statuses on both code commits were empty; no CI success is claimed.

## Safety and next step
No production, Firebase, billing, main-branch or deployment action was taken. The two policy-document changes were not applied because the authoritative policy's phrase configuration clauses conflict with the historical branch edits. Continue at candidate 73; batch 004 is the consolidated classification, and this supplement records the restored details.