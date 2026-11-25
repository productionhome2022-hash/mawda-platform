# Semantic Triage — Batch 002 — 2026-11-25

## Baseline

- Repository: `productionhome2022-hash/mawda-platform`
- Full Platform baseline used for file checks: `f9a686ddbb260a998825d046695a4fa817a99835`
- Recovery baseline: `49b502638718e4dbb29a9429f392b3a70c8d6d95`
- CSV source blob: `296134e6de35b04304413a090469e79c3fb13388`
- Scope: unique `UNMATCHED` candidates 6–10 in original CSV order.

## Exact candidate review

1. `7d756be26e129f8616ae38442c681247025b51e0` — normalize emulator host in test-only playback URLs. **Present already.** Current lifecycle file contains the corrected protocol-prefix normalization.
2. `a1556702eecc331db332bb658b892971c8c2796e` — normalize safe-object generation regex. **Present already.** Current lifecycle file validates both generation values with the corrected digit regex.
3. `3ce3165d17cbb56d3451080fcce7affb255aebb6` — require ClamAV provenance for owner playback. **Present already.** Current lifecycle file checks scanner engine, clean verdict, verification timestamps, safe paths, content types, generations and SHA-256 fields.
4. `2c304c0dce625e8d3f9b8c3a02a7274338509173` — test expired empty upload intent without attempt penalty. **Present already.** Current integration test file contains the empty-upload-intent expiry scenario.
5. `d26931fb6373039a792146229615e506be9e3661` — audit expired empty upload requests. **Present already.** Current lifecycle source creates the `biometric_upload_intent_expired_` audit record.

## Full Platform / Recovery parity evidence

Fetched the exact current files independently at both refs. Blob SHAs were identical:

| File | Blob SHA on both refs |
|---|---|
| `functions/src/biometric-lifecycle.ts` | `9b78166147187ef6fa7357538a64703d88ac116d` |
| `functions/test/integration/biometric-verification.integration.test.js` | `20f19857a11713f9bc935cc9aa7f0c706a99758b` |

## Batch result

- Candidates inspected: 5 / 1,665.
- Present already: 5.
- Duplicate: 0 newly established.
- Unique missing: 0 established.
- Conflicting: 0 established.
- Unverifiable: 0 for the reviewed behaviors and paths.
- Code transfer: none; all five candidate behaviors were already present in both Full Platform and Recovery.
- Tests: not run because this batch changed no code.
- No branch movement, merge, production or Firebase action.

## Cumulative bounded review

Batches 001 and 002 have reviewed 10 of 1,665 unique unmatched SHA candidates. All 10 inspected candidate behaviors were found already represented in the current Full Platform tree, with the corresponding reviewed files identical in Recovery. This does not establish the status of the remaining 1,655 candidates.

## Next action

Continue in original CSV order with candidates 11–15. Review each complete diff and every changed path, inspect related tests/workflows and superseding commits, and transfer nothing unless a unique missing behavior is proven.
