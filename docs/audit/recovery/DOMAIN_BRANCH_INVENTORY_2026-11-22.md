# Recovery Integration Audit — Domain Branch Inventory (2026-11-22)

## Scope and safety
- Comparison baseline: `e522acb5a47964b529b84f49bacd9db0167a6dc5`.
- Working branch: `codex/mawda-recovery-integration-2026-11-21`.
- This is a read-only source inventory and decision record. No source code was ported in this pass.
- No merge to the official development branch or `main`, no deployment, and no production/Firebase/billing/retention changes were performed.

## Findings

### Historical unified branches
- `codex/mawdda-phase1-unified-2026-11-19` compares as 0 ahead / 421 behind the baseline, with `e12897ad7dc5f383501d997117fb1211c67632e7` as merge base. Its integrated history is already carried by the baseline.
- `codex/mawdda-unified-test-2026-11-18` is divergent (311 ahead / 771 behind; 77 changed paths in the compare response). It is a historical source for review, not a safe whole-branch merge candidate.
- `codex/mawdda-unified-final` and `codex/mawdda-unified-release` are divergent and show only a small set of unique paths; they are not suitable as replacement baselines without file-level review.
- `codex/mawdda-unified-final-v2` and `codex/mawdda-unified-final-v3` are behind the selected baseline.

### Economy and store
- Several economy branches are divergent from the selected baseline, including `codex/economic-phase1-closeout-2026-11-18`, `codex/economic-phase-completion-2026-11-18`, `codex/economy-official-port-2026-11-18`, and `codex/mawdda-economy-selective-port-2026-11-19`.
- `codex/economy-recovery-2026-11-18` is substantially divergent (618 ahead / 771 behind; 105 changed paths). It must not be merged wholesale.
- Store hardening branches have small unique deltas (e.g. wallet/store entitlement closure and gift-concurrency regressions). These require semantic comparison against the more recent baseline and current tests before any port.
- No pricing, quota, or entitlement policy is to be inferred from branch names or historical snapshots.

### Roles, advertising, rooms and calls
- `codex/phase1-advertising-callable-auth-2026-11-20` compares as behind the baseline; no separate port is indicated by ancestry.
- The rented-room call-gate branch is divergent (6 ahead / 504 behind) and has four changed paths. Its `room-call-policy.ts` includes call participant/member revalidation helpers; the baseline version also contains these helpers, so this is not yet evidence of a missing feature.
- Group-call capacity and role-denial branches have small divergent test/source deltas. Inspect their individual commits and current baseline behavior before deciding whether anything is missing.

### Biometric
- `codex/biometric-final-owner-policy-2026-11-20` compares as behind the baseline.
- The standalone Super Owner review-state branch has a divergent delta, but `functions/src/biometric-review-state.ts` is byte-identical on that branch and the selected baseline (same blob SHA `f324e85ef69e83f8d180e31cdf5b0fdd67407bbd`). Do not port it.
- `codex/biometric-server-lifecycle-2026-11-20` is divergent (73 ahead / 421 behind; 23 changed paths). The selected baseline already contains the lifecycle, server wallet-ledger credit, duration limits and integration suite. The specialist branch is not a replacement baseline; compare its remaining tests/docs only for missing assertions.
- Previously recorded evidence for the selected baseline remains: biometric emulator integration 5 passed / 0 failed, with owner review, versioned consent, exactly-once reward and media-duration rejection covered.

### Media and messaging
- Media specialist branches are divergent with small commit deltas. Their snapshots of `functions/src/media.ts`, media integration tests and scanner tests are shorter than the selected baseline files. This indicates the branch files are older snapshots, not a safe source to overwrite the baseline with.
- `codex/mawdda-deep-audit-profile-store` compares as behind the selected baseline.
- `codex/mawdda-member-inbox-rebased` is divergent with seven changed paths; inspect individual test/index/UI deltas before any port.

## Current decision
1. Keep `e522acb5` as the integrated recovery baseline.
2. Do not merge any complete divergent specialist branch.
3. Prioritize targeted verification of economy/store transaction invariants, role/callable authorization, room/call race regressions, media hold/delete/scanner behavior, and messaging deletion/index behavior.
4. Port only a demonstrably missing assertion or safe code change, with focused tests and read-back verification.
5. Re-run the complete Test Center, Flutter analysis/tests/web build, Functions tests, Firestore/Storage emulator suites and security checks on the final candidate SHA.
6. Treat 5,000-persona simulation, external testing, native release signing/device acceptance and launch readiness as separate gates. None is claimed complete by this inventory.

## Evidence limitation
Compare endpoints expose branch ancestry and changed-file summaries, not the full semantic effect of every unique commit. This inventory is a triage record, not a claim that every specialist branch has been exhaustively reviewed. Local Termux/Ubuntu historical replay evidence remains incomplete as recorded in the baseline-selection report.
