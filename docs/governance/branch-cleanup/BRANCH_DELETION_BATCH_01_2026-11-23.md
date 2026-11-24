# Branch deletion batch 01 — 2026-11-23

- Repository: productionhome2022-hash/mawda-platform
- Target branch: codex/mawda-recovery-integration-2026-11-21
- Expected protected main SHA: a2dfa7e75352eeb6b8d5029a8e5838fb271b924f
- Reviewed Recovery checkpoint: 1f48e408db346b1b2ced9d3df527094d634705e3
- Execution commit: 1e2390939e783991fd3692dd28168be67445bc6d
- Follow-up execution-report commit / current Recovery head at verification: 32340798714c1a4f50d8c8dc6e39215a1873f3a6
- Started / completed: 2026-11-23 13:12 UTC (execution report timestamp)
- Allowlist size: 17

## Preflight and execution

The local execution report records deletion script exit code 0 and confirms the two evidence artifacts were preserved outside the repository. The command's captured execution-output section is empty; therefore the transcript itself is not treated as proof. GitHub refs were independently enumerated after execution.

The local deletion script reported that all 17 branch heads matched their reviewed SHAs before deletion and printed a successful delete response for each ref. Independent GitHub branch enumeration then returned 67 branches and none of the 17 allowlisted names.

## Exact reviewed allowlist and independent result

| Branch | Reviewed SHA | GitHub ref check |
|---|---|---|
| codex/biometric-final-owner-policy-2026-11-20 | 08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23 | Absent |
| codex/biometric-final-policy-drift-closure-2026-11-20 | 0089c556a7e241454cfbfb3223fff500cc8763bb | Absent |
| codex/biometric-manual-review-gate-2026-11-20 | a82a0614f7526bfb56c6bcc93764a5b907406e95 | Absent |
| codex/biometric-video-duration-validation-2026-11-20 | be9b8109c8ae4b62a0b17e9b70a851307a3294f6 | Absent |
| codex/mawdda-audit-archive-full | 5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47 | Absent |
| codex/mawdda-deep-audit-profile-store | 4ed7394235ea531e4b4abbb24431731da15eaf47 | Absent |
| codex/mawdda-mfa-signin | 607647ec0325eaf56bd58a4c2283aedaa47e7e68 | Absent |
| codex/mawdda-native-platform-scaffold | d556a9990ffe4472fe86ab48acc696adc9c109f6 | Absent |
| codex/mawdda-phase1-unified-2026-11-19 | e12897ad7dc5f383501d997117fb1211c67632e7 | Absent |
| codex/mawdda-pr3-port | 6e11d5a631d61f9e92b37fd64c827f37ec8e9c11 | Absent |
| codex/mawdda-premium-features | f3884061a5d7be3836adc6d6b94de10e534625ab | Absent |
| codex/mawdda-safety-ui | 1e4c6aa97a679d0eaa88708571341e79e9e06c68 | Absent |
| codex/phase1-advertising-callable-auth-2026-11-20 | d857497c50eca8d7dcf105e938c8060402ae85e3 | Absent |
| codex/phase1-integration-batch-01-inventory-2026-11-19 | 2fff6276055de44bc488cc123cec16491421a8e6 | Absent |
| codex/production-readiness-tests | 424599a34acc9ec33b4e759ba166dc6d0a9df04d | Absent |
| codex/mawdda-unified-final-v2 | e249c664f9a48dd8a198e274b38033a7cbba0a3d | Absent |
| codex/mawdda-unified-final-v3 | ab5e37e6d7f437a491e85883b91e8bcde76d438e | Absent |

## Protected-ref verification

- main: a2dfa7e75352eeb6b8d5029a8e5838fb271b924f — unchanged from the approved expected SHA.
- Recovery: 32340798714c1a4f50d8c8dc6e39215a1873f3a6 at independent verification; this is a descendant of execution commit 1e2390939e783991fd3692dd28168be67445bc6d.
- Deleted allowlisted refs independently confirmed absent: 17 / 17.
- Failed ref checks: 0.
- Archive refs were not part of this batch and remain untouched.

## Evidence and limitations

The execution report is at docs/audit/termux/runs/20261123T160900Z-recovery-cleanup/EXECUTION-REPORT.md. It records SHA-256 hashes for the preserved local evidence files. Those files remain on the user's Ubuntu environment at /root/mawda-local-evidence-20261123 and were not copied into GitHub.

The shell-generated batch report initially contained blank variable expansions in its metadata and per-branch summary lines. This corrected ledger replaces those blanks with the independently verified ref names, reviewed SHAs, protected-ref values, and explicit limitations. No claim is made here about Flutter tests, CI, device acceptance, the 5000-persona simulation, deployment, or production readiness.
