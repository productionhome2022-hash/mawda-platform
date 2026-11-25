# Semantic Triage — Batch 003 — 2026-11-25

## Baseline

- Repository: `productionhome2022-hash/mawda-platform`
- Full Platform baseline: `f9a686ddbb260a998825d046695a4fa817a99835`
- Recovery baseline: `49b502638718e4dbb29a9429f392b3a70c8d6d95`
- CSV source blob: `296134e6de35b04304413a090469e79c3fb13388`
- Scope: unique `UNMATCHED` candidates 11–15 in original CSV order.

## Candidate classification

1. `deeab0f65b19a42b8d4e3ffd8ea75243d6b10109` — replace unit test of obsolete raw Storage paths with media-pipeline/request binding test. **Present already.** Current test no longer imports or tests the removed raw-path helper and retains the exactly-once reward-ledger identity test.
2. `8930d9037259d301d946b9753738bc8e3b76ec76` — remove obsolete direct Storage path helper. **Present already.** Current `functions/src/biometric-evidence.ts` has no `biometricEvidenceObjectPaths` helper.
3. `fc7eb19ecfe0c1edc3a4925188777c4acf0a02b0` — audit successful Super Owner inbox reads. **Present already.** Current lifecycle source appends `biometric_request_inbox_read` audit events with result count.
4. `6351e3b0bacc2a0031b8cfdd1b3affbe70525f72` — remove obsolete scheduled expired-upload sweep export. **Present already.** Current `functions/src/index.ts` does not export `cleanupExpiredBiometricUploads`.
5. `a6dfa7df774284074917c6855e2ef700c8418735` — replace scheduled sweep with transactional expiration of empty requests. **Present already at the behavior level.** Current lifecycle source has no scheduled `cleanupExpiredBiometricUploads` implementation; the current integration suite covers expiration of an empty upload intent without consuming an attempt, and the lifecycle source records the expired-intent audit event transactionally.

## Full Platform / Recovery parity

The following exact file blobs were fetched at both refs and matched:

| File | Blob SHA on both refs |
|---|---|
| `functions/test/biometric-evidence.test.js` | `2b5bd2cc49b86665b5600a20976d023042c7ff03` |
| `functions/src/biometric-evidence.ts` | `06a8191e70a5fbba71504d9bbe4958629c218721` |
| `functions/src/biometric-lifecycle.ts` | `9b78166147187ef6fa7357538a64703d88ac116d` |

The two `functions/src/index.ts` blobs differ between Full Platform and Recovery; this batch only verified that the obsolete scheduled-sweep export is absent from both. The entire index diff was not semantically reviewed here.

## Batch result

- Candidates inspected: 5 / 1,665.
- Present already: 5.
- Duplicate: 0 newly established.
- Unique missing: 0 established.
- Conflicting: 0 established in the inspected candidate behaviors.
- Unverifiable: 0 for the specific candidate behaviors inspected; broader index differences remain outside this batch.
- Code transfer: none.
- Tests: not run because no code changed.
- No branch movement, merge, production or Firebase action.

## Cumulative bounded review

Batches 001–003 have inspected 15 / 1,665 unique candidates. All 15 reviewed behaviors are already represented in the current Full Platform tree; reviewed biometric source/test files are identical to Recovery where noted. This is not closure of the remaining 1,650 candidates or of the complete Recovery history.
