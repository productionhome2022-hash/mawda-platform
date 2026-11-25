# Semantic Triage — Batch 01 — 2026-11-25

## Pinned references used

- Repository: `productionhome2022-hash/mawda-platform`
- Full Platform head observed before this batch: `3c3e682208660d35e0948638ab53055479ad852a`
- Recovery head: `49b502638718e4dbb29a9429f392b3a70c8d6d95`
- Source inventory: CSV blob `296134e6de35b04304413a090469e79c3fb13388`
- The Full Platform ref moved after documentation commits; the file-level fetches in this batch used the named branch ref, so the next batch must repin the branch head before any write.

## Method and scope

This is the first bounded semantic batch, not completion of all 1,665 unmatched SHAs. Candidate commits were selected from four low-volume call/room/media/advertising branches and additional media/CI branches in the CSV. For each selected candidate, the commit diff and affected paths were inspected; current Full Platform and Recovery file blobs were fetched for the relevant paths. Exact blob identity and relevant code/test markers were checked where applicable.

## Candidate classifications

### A. Present already / duplicate in Full Platform and Recovery

1. Direct-call transactional guard family:
   - `f6cdf552494e222c2cefd3a4d27ca36515fd93cf` — transactional revalidation in `functions/src/index.ts`.
   - `59dc773f9fe402047f31f8689055d5133d303d7e` — `areDirectCallParticipantsEligible` helper.
   - `b78817d0e6d7a73398fcce1d54c7df4f6707d045`, `0701c884a4f7767d116a249b30771bc394bd9779` — malformed and relationship unit tests.
   - Current Full Platform contains the transaction guard and helper; the current `functions/test/room-call-policy.test.js` contains the malformed-snapshot test. That test file has identical blob SHA in Full Platform and Recovery: `f1ee8a870b61db646e8e22cc100e6b59d3ab4d82`.

2. Rented-room call gates/tests:
   - `41dc2c2fd679f736d48f912c1e248f8615554649`
   - `a004cbf6df8c17cd5ff6c699b65415195affbb23`
   - `c17db1718a556580a6f1ff0cb1e40594e5ce0071`
   - `8375e577066eb67af23f8ecbb24344d4f1aedce9`
   - The affected current files `functions/test/integration/call-signaling.integration.test.js` and `functions/test/room-call-policy.test.js` have identical blob SHAs in Full Platform and Recovery. The relevant active-rental policy and test cases are already in those files.

3. Suspended-member room message read:
   - `5ed86e7ee4be80a0e342658a6a79367bda020b9e` — server-side account-standing revalidation.
   - `43471705e469f09e55658660b8b9f921401a00d4` — suspended/banned member integration test.
   - Current `functions/src/index.ts` performs the good-standing check before returning room messages. The test is present in `functions/test/integration/media-callables.integration.test.js`, whose blob SHA is identical in Full Platform and Recovery: `4e7be2b963cfd83d06b416f3c2e9a76f3424f112`.

4. Media delivery and scanner coverage:
   - `6645cdb0ddb817c5971bae40e7e3864ed84736` — canonical account-standing check for direct delivery.
   - `ceaa69055ff07d36aff40eb73337f834e12e74e2` — room active/account-standing checks before media delivery.
   - `2a87609c4356e92217f6f351983e27f1e53b6550` — malicious scanner callback rejection/audit/quarantine cleanup test.
   - `640cfecf7fbc829ee6b9e46e6a5f45062da206f2` — injectable scanner callback handler for deterministic tests.
   - The current Full Platform `functions/src/media.ts` contains canonical good-standing checks for direct delivery, active-room and good-standing checks for room delivery, and the injectable/exported scanner callback handler. The current integration test file has the same blob SHA in Full Platform and Recovery and includes the scanner-malicious test and suspended-member coverage.

5. CI wiring:
   - `d46cd7095915bf98480ef38574356c62d72e6a95` — role-capacity and store-gifting workflow steps.
   - Current `.github/workflows/validate.yml` already contains both `test:specialized-role-capacity-integration` and `test:store-gifting-integration`.

6. Media deletion/retention tests:
   - `192ac5b9b9334a900cd1018e55053e84d1451ae6`, `397afd486970962d6aae1e14f4d6ed2a76338652`, `d1127aa8c146e8bfc1d4dc3ae7b3c4184bd8c72c` and related test candidates were found in the CSV. The current shared media integration test file contains the tombstone/late-derivative regression coverage; exact per-commit semantic equivalence for every one of these test commits remains pending.

### B. Unique change absent from both trees, but not approved for transfer

- `41a0fbea241e60b312ec8f75442cc83fc4a40635` — changes `functions/src/featured-advertising.ts` so a campaign targeted at `all_arab_countries` matches each country audience.
- The affected source file in Full Platform does not contain this behavior. The corresponding Recovery file also does not contain it.
- The approved decision/traceability document fetched from Full Platform did not contain the `all_arab_countries` term.
- Therefore this is a technically distinct candidate, but the product-policy approval for the new geographic-target semantics is not established by the inspected governance record. Classification: **conflicting / unprovable for transfer pending owner-approved decision evidence**. It was not ported.
- Its companion test commit `ac22ff635c41e4a36603c8864af53942e22e3fcb` was also not ported because it asserts that unapproved behavior.

### C. Other documentation/test candidates

- `20519494a898b19f08bcaf4f22e4af64acff622b` is a documentation-only removal of a prior status section; it is not a missing product behavior and was not ported.
- The remaining scanner callback commits in the same branch require a complete ordered review of the branch's refactor/test sequence before deciding whether any individual patch is independently portable. The current source and integration tests already expose the injected callback and malicious/error coverage; no partial cherry-pick was made.

## Batch result

- Confirmed present/duplicate: the direct-call guard and tests, rented-room tests, suspended-member room-read guard/test, media delivery standing checks, scanner callback handler/tests, and CI wiring described above.
- Technically distinct but unapproved/unprovable: the all-Arab-countries advertising target change and companion test.
- Unique approved missing changes certified for transfer in this batch: **0**.
- Files changed for product behavior: **0**.
- Tests run in this batch: **0**. GitHub Actions dispatch is not exposed by the currently available connected GitHub actions, and no local runner was used. Existing script names are not evidence of a passing run.
- No PR was merged; no main, production, billing, Firebase production, or live retention resource was changed.

## Next batch

Continue the CSV in bounded branch/file clusters. For each candidate, fetch the full commit diff and ordered surrounding commits, compare its resulting behavior with both pinned Recovery history and the current Full Platform tree, inspect dependent tests and workflow/package wiring, then assign one of the four policy classifications. Only a uniquely missing, governance-approved, self-contained batch may be transferred. Before the next write, repin Full Platform and use its current blob SHAs.
