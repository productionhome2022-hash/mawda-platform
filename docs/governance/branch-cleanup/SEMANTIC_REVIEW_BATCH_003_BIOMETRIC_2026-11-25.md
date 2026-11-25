# Semantic review batch 003 — biometric lifecycle candidates
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Pinned Full Platform HEAD before this report: 7ddabf806435eec2d38dedce0223ebc073fcea6d
Recovery branch inspected: codex/mawda-recovery-integration-2026-11-21
Recovery HEAD: 49b502638718e4dbb29a9429f392b3a70c8d6d95
Candidate source: CSV blob 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 37–48 (12 commits), following batches 001–002 and the 25–36 supplement.

## Per-commit disposition

| Candidate SHA | Change | Full Platform evidence | Disposition |
|---|---|---|---|
| 3a80f0f4d17eaa3074a5c3b55bcedbe7b34d0c98 | Validate scanner source hashes and derivative provenance | Current biometric lifecycle validates scanner source hashes, safe derivative SHA-256/generation, metadata and exact paths before submission/playback. Historical regex spelling was later corrected; current source uses /^\\d+$/ | Already implemented; later corrected |
| 9d56db5c545040d95597ddae3e846eef695ba033 | Full owner-review integration lifecycle | Current biometric integration test covers consent, scanner-approved assets, owner authorization/MFA, playback grants, decision, reward ledger and retries | Already implemented |
| 9baed24ab94d4090c8e3318e6c14507affa8323b | Defer evidence cleanup to media quarantine lifecycle | Current lifecycle no longer runs the old direct-object sweep for uploading requests with media IDs; unified media pipeline owns upload TTL/quarantine/scan cleanup, and only empty stale requests expire transactionally | Already implemented; superseded |
| e898e22b6b0d5caeb66268a77e1d4ae7f46e67d4 | Restrict owner playback to ClamAV-safe derivatives | Current playback verifies request-bound assets, clean ClamAV verdict, safe paths, content types, generation, SHA-256, object metadata and limits before short-lived URLs | Already implemented, stronger |
| 994304823fdca7366e25270d406fe5166e566761 | Require ClamAV-approved assets and safe derivatives | Current submission requires request-bound security-approved assets and scanner provenance, validates safe derivatives and original object generations/signatures/hashes | Already implemented, stronger |
| 2f1de17d764ed19ae1ffbd431d056b0ca03bf75a | Use canonical quarantined media bucket | Current biometric lifecycle uses the shared mediaBucket resolver for signing, metadata, download and deletion | Already implemented |
| 72ed67d1cc0658e032e528bd77edceb72333e302 | Export canonical private bucket resolver | Current functions/src/media.ts exports mediaBucket; biometric lifecycle imports it | Already implemented |
| b1fd8b1d2d9a3579f1d1f4b56100b73d05610f64 | Delete originals and safe derivatives after decision | Current deleteEvidence validates ownership/purpose/request binding/legal hold and exact paths, then deletes original and derivative objects and updates audit/deletion state | Already implemented |
| b85cf2048cdb0b53ce40c349dcf795f98e567a95 | Route evidence through media upload intents | Current start callable creates no direct Storage URLs; it returns purpose/request-bound upload instructions and the media pipeline owns upload intents and scanner flow | Already implemented |
| 1bd504f23628232e283785584af8e2f5de8189bb | Allow replacing rejected biometric upload assets only | Current media intent flow permits replacement only when the previous same-kind asset is rejected, manually_deleted or expired; other states are blocked | Already implemented |
| d7b99b4d4590ca4d4ed9c7051b8704483273a410 | Bind biometric uploads to open verification requests | Current createMediaUploadIntent transaction verifies owner UID/open status, stores biometricRequestId, and updates matching audio/video media ID atomically | Already implemented |
| ffecd36287a2c6d4afdfa014598ef32d8ccd5c5b | Enforce 60-second biometric audio processing limit | Scanner processor permits 60 seconds, but current owner-approved biometric policy and server byte-level validator cap evidence audio at 20 seconds. Server submission rejects over-limit evidence | Implemented in scanner, superseded by stricter 20-second policy |

## Cross-layer finding requiring follow-up
The current policy document and server-side biometric constants specify a 20-second maximum for biometric evidence audio, and the byte-level validator plus tests enforce 20,000ms accepted / 20,001ms rejected. The generic scanner processor still accepts/transcodes biometric audio up to 60 seconds. This does not permit server submission of over-limit evidence, but it allows unnecessary processing and creates a policy mismatch between scanner and authoritative server validation. Do not port the historical 60-second allowance. A separate minimal scanner-policy alignment change should be considered only after confirming the governing biometric policy source and its authority.

## Result
- Reviewed: 12/1,665 unique candidates in this batch (37–48).
- Already implemented, superseded, or present under a stricter policy: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests run during this review: 0. This is source inspection, not test execution.
- No workflow/CI success is claimed.
- Current Full Platform biometric lifecycle, media and scanner sources were inspected directly; Recovery was checked for corresponding media/scanner paths.

## Safety decision
Do not cherry-pick these historical commits. Their behaviors are present in Full Platform or superseded by a stricter policy. Record the scanner 60s/biometric 20s mismatch as a separate controlled fix; do not silently relax the approved 20-second biometric evidence limit.