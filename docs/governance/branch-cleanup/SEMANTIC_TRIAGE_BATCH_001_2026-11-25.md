# Semantic Triage — Batch 001 — 2026-11-25

## Baseline and scope

- Repository: `productionhome2022-hash/mawda-platform`
- Full Platform branch head at start of this batch: `99e565ff4dad054fb907dd006a268036d1b9a813`
- Recovery branch head pinned in the prior branch audit: `49b502638718e4dbb29a9429f392b3a70c8d6d95`
- CSV source blob: `296134e6de35b04304413a090469e79c3fb13388`
- Scope: first five unique `UNMATCHED` SHAs in CSV order. This is a bounded first batch, not completion of all 1,665.

## File-level evidence

### Shared current files in Full Platform and Recovery

The following file blob SHAs were fetched independently at both refs and were identical:

| File | Full Platform blob SHA | Recovery blob SHA |
|---|---|---|
| `functions/src/biometric-lifecycle.ts` | `9b78166147187ef6fa7357538a64703d88ac116d` | `9b78166147187ef6fa7357538a64703d88ac116d` |
| `lib/services/member_media_upload_service.dart` | `a50dd700c7de3a202beee70fa9146071ee6e4358` | `a50dd700c7de3a202beee70fa9146071ee6e4358` |

### Candidate classification

1. `f79f146e96b9a4ae1210a1fcc37a861ebebcd294` — fresh owner evidence playback grant before biometric acceptance. **Present already.** Current lifecycle implementation writes reviewer-bound grants with evidence hashes and expiry; decision transaction checks reviewer, hashes, expiry and consumption. Current error wording differs from candidate wording, but behavior is implemented.
2. `15e53a0bc092355818ccd19070b31c5092957e61` — allow rejection/evidence cleanup after member deletion. **Present already.** Current decision path blocks acceptance when the member is absent but allows the rejection path; closure updates the member only when it exists.
3. `d1e41e5edead6c4f001b383ac8ffab01053c367a` — allow Super Owner rejection of stale identity submissions. **Present already.** Current decision path calculates `identityMatches` and gates the identity match on acceptance, while preserving rejection when identity is stale. Server evidence validation remains required.
4. `31cdb7f5b4d5d4471a768e56fdb0bc5425f7539b` — Flutter member/Super Owner biometric media service calls. **Present already.** Current `lib/services/member_media_upload_service.dart` contains the biometric start, audio/video upload, submit, and owner-list service methods. Full Platform and Recovery file blobs are identical.
5. `362bfd34705e2889cac7f21f13c75d16e2e9706b` — correct Firebase Storage emulator host regex escaping. **Present already.** Current lifecycle source contains the corrected protocol-prefix regex; same lifecycle blob exists in Full Platform and Recovery.

## Batch result

- Candidates inspected: 5 / 1,665 unique unmatched SHA candidates.
- Present already: 5.
- Duplicate: 0 established in this batch.
- Unique missing: 0 established in this batch.
- Conflicting: 0 established in this batch.
- Unverifiable: 0 for the five inspected candidate behaviors at source-file level.
- Code transfer: none; no missing unique change was proven.
- Tests: not run; no code was changed.
- Branch movement, merge, production and Firebase actions: none.

## Important limitation

This batch does not establish the status of the remaining 1,660 candidates. Nor does identical current file content by itself establish that every historical Recovery commit was reviewed. Full Recovery history and the complete Full Platform tree must still be compared for the remaining candidates, including associated tests, workflow files and dependencies.

## Next batch

Continue with the next five unique CSV candidate SHAs in original CSV order. For each, fetch the exact commit diff, identify all changed paths, compare the current Full Platform and Recovery file blobs, and inspect relevant tests and later superseding commits before assigning a final classification. Port only when a unique missing behavior is proven and its dependencies are understood.
