# Semantic Review — Candidate Batch 003 (Biometric Lifecycle Integration)

## Scope and pinned evidence

- Candidate source branch: `codex/biometric-server-lifecycle-2026-11-20`
- Source tip: `f79f146e96b9a4ae1210a1fcc37a861ebebcd294`
- Candidate rows: distinct UNMATCHED SHAs 41–60 in recovered CSV order.
- CSV blob: `296134e6de35b04304413a090469e79c3fb13388`
- Full Platform ref before this report: `4d16fe67f7b13f36a09669a66c4ce14c1b01f7c7`
- Recovery tip: `49b502638718e4dbb29a9429f392b3a70c8d6d95`

Fetched all 20 commits and reviewed their actual diffs. Fetched current Full Platform files for biometric lifecycle, media service, media-security, scanner processor, biometric integration test and the owner biometric policy. The biometric lifecycle blob is `9b78166147187ef6fa7357538a64703d88ac116d`; this was previously confirmed byte-identical in Recovery. The current media implementation exposes the canonical `mediaBucket` resolver, the normalized media request carries biometric request binding, and scanner processing applies biometric purpose-specific duration limits.

## Candidate classification

| Candidate SHA (short) | Change | Classification | Evidence / reason |
|---|---|---|---|
| 99430482 | require ClamAV-approved assets and safe derivatives | Present already | Current lifecycle checks media ownership, biometric request binding, clean ClamAV verdict, scanner provenance, generations, hashes and safe derivative metadata. |
| 2f1de17d | use canonical quarantined media bucket | Present already | Current lifecycle imports and uses the canonical bucket resolver from media module. |
| 72ed67d1 | export canonical private bucket resolver | Present already | Current `functions/src/media.ts` exports `mediaBucket`. |
| b1fd8b1d | delete scanner-managed originals and safe derivatives after decision | Present already | Current lifecycle validates asset/request ownership and canonical object paths before deleting originals and safe derivatives; retry and legal-hold guards are present. |
| b85cf204 | route member evidence through media upload intents | Present already | Current lifecycle stores media IDs and uses the shared media upload pipeline; old raw-path helper is absent. |
| 1bd504f2 | allow replacement of rejected biometric upload assets only | Present / superseded | Current media intent path allows retry for expired/rejected/deleted assets while blocking active assets. |
| d7b99b4d | bind biometric uploads to open verification requests | Present already | Current media-security and media callable enforce biometric request ID and request ownership/status binding. |
| ffecd362 | enforce 60-second biometric audio processing limit | Present already | Current scanner processor's purpose-specific audio limit includes biometric and returns 60 seconds. |
| 1379648c | add request-bound biometric upload purpose | Present already | Current normalized media purpose includes biometric, validates request ID, and restricts allowed audio/video categories. |
| 111aeccd | retry expired upload deletion before closing request | Present / superseded | Current lifecycle uses transactional empty-intent expiry and deletion-state retry; the old scheduled raw-path implementation is not retained. |
| 67a231e6 | export expired-upload cleanup schedule | Present / superseded | Current lifecycle/index does not expose the old scheduled sweep; the transactional/media-pipeline lifecycle supersedes it. |
| 31ac3ebe | expire abandoned upload intents after signed URL expiry | Present / superseded | Current lifecycle expires empty upload intents transactionally and defers actual media assets to the shared media pipeline. |
| 623b50c4 | read audit-chain head before transactional writes | Present already | Current lifecycle includes a pre-read audit head snapshot passed into the append operation. |
| 98291571 | preserve append-only audit records in emulator cleanup | Present / needs exact test assertion audit | The current test fixture is present; its cleanup behavior should remain append-only. No product code gap was identified. |
| 8544f258 | test owner playback, concurrent decisions and three-rejection closure | Present / equivalent test suite | Current biometric integration suite includes owner playback and decision/reward lifecycle coverage. No evidence supports copying the entire historical test file over the current one. |
| 15de12a9 | align phrase configuration rule with owner approval | Present / policy document requires reconciliation | Current owner biometric policy is present at `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md`. Do not replace policy docs wholesale; maintain the authoritative owner-approved phrase/version and avoid conflicting older wording. |
| 256e8a59 | isolate Storage emulator from production URL signing | Present already | Current lifecycle has emulator-only URL handling and normalized host behavior; this is test-only and not a production URL-signing change. |
| 7f06b291 | keep failed evidence deletions eligible for retry | Present already | Current lifecycle cleanup query includes pending and retry-required deletion states. |
| e481e9b4 | exercise private upload validation and owner reward flow | Present / equivalent test suite | Current biometric integration test covers upload, owner review and reward flow; no blind replacement of the newer suite. |
| d151651f | initial private evidence submission and owner review lifecycle | Present already / ancestor | The current lifecycle file contains the evolved implementation; the initial 428-line addition is an ancestor, not a missing feature to copy. |

## Batch 003 decision

- No candidate is certified as a unique missing change.
- No code or policy document was transferred.
- No tests were run because no code transfer was approved.
- No branches, PRs, production services or Firebase resources were modified.

## Important semantic distinction

Several CSV candidates are earlier implementation steps that were subsequently refactored into the shared media pipeline or transactional cleanup path. The old scheduled cleanup exports and direct Storage paths must not be restored just because they appear as unmatched historical commits. Their removal is part of the current architecture.

## Next sequence

Continue to candidates 61–80 in CSV order. For each, compare the exact diff, all changed paths, current Full Platform and Recovery file content, and later superseding commits. Only a demonstrably missing and non-conflicting change may enter a transfer batch.
