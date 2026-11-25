# Batch 002 — Biometric Expiry, Audit and Media-Pipeline Triage — 2026-11-25

## Scope

Eight more unique UNMATCHED candidate SHAs, positions 9–16 in CSV first-seen order, all from `codex/biometric-server-lifecycle-2026-11-20`.

## Candidate review

| Candidate SHA | Change | Full Platform / Recovery evidence | Classification |
|---|---|---|---|
| 2c304c0dce625e8d3f9b8c3a02a7274338509173 | Emulator integration test: empty upload intent expires without attempt penalty | Current integration test file has the corresponding empty-upload expiry test; Full Platform and Recovery blob SHA both `20f19857a11713f9bc935cc9aa7f0c706a99758b` | Present already |
| d26931fb6373039a792146229615e506be9e3661 | Audit expired empty upload requests | Current shared biometric lifecycle file contains `biometric_upload_intent_expired`; blob SHA `9b78166147187ef6fa7357538a64703d88ac116d` on both refs | Present already |
| deeab0f65b19a42b8d4e3ffd8ea75243d6b10109 | Test media-pipeline request binding rather than direct Storage paths | Current biometric evidence unit test blob SHA is identical across Full Platform/Recovery; current test asserts reward-ledger identity and rejects invalid request IDs | Present already |
| 8930d9037259d301d946b9753738bc8e3b76ec76 | Remove obsolete direct Storage path helper | Current shared `functions/src/biometric-evidence.ts` no longer contains `biometricEvidenceObjectPaths`; blob SHA `06a8191e70a5fbba71504d9bbe4958629c218721` | Present already |
| fc7eb19ecfe0c1edc3a4925188777c4acf0a02b0 | Audit successful Super Owner inbox reads | Current shared biometric lifecycle file contains `biometric_request_inbox_read` audit action | Present already |
| 6351e3b0bacc2a0031b8cfdd1b3affbe70525f72 | Remove obsolete scheduled sweep export | Current Full Platform and Recovery `functions/src/index.ts` both export `cleanupDecidedBiometricEvidence` without `cleanupExpiredBiometricUploads`; relevant export line is identical, although whole-file blob SHAs differ due unrelated changes | Present already |
| a6dfa7df774284074917c6855e2ef700c8418735 | Remove scheduled expired-upload sweep in favor of transactional expiry | Current shared biometric lifecycle file does not contain `cleanupExpiredBiometricUploads`; the transactional `NO_BIOMETRIC_MEDIA_UPLOAD_INTENT` path is present | Present already |
| 3fe4894d29f3f220f64f78ddd3971c289547d500 | Expire empty upload intents transactionally on member retry | Current shared biometric lifecycle file contains the transactional empty-intent expiry path; blob SHA identical across Full Platform/Recovery | Present already |

## Batch outcome

- Candidate commits reviewed: 8.
- Present already: 8.
- Duplicate: 0 assigned.
- Unique missing: 0 certified.
- Conflicting/unprovable: 0 assigned in this batch.
- Code transferred: none.
- Tests run: none; no code was changed.
- Cross-check: four primary files (biometric lifecycle, biometric evidence, biometric integration test, biometric evidence unit test) were fetched from both Full Platform and Recovery and had identical blob SHAs. The relevant biometric export line in `functions/src/index.ts` also matches, although the whole file differs for unrelated content.

## Limits

This batch covers only the eight listed commits and their affected paths. It does not close review of the rest of the biometric branch, nor the remaining 1,649 candidate SHAs. No branch was merged or moved and no production/Firebase resources were touched.
