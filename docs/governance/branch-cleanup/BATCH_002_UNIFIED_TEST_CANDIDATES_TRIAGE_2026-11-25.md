# Batch 002 — Unified-Test Branch Candidate Triage — 2026-11-25

## Scope and refs

Limited review of the first ten distinct unmatched candidates from `codex/mawdda-unified-test-2026-11-18`. This is a sample tranche, not the full 1,665-SHA review.

Refs observed:
- Full Platform: `e3d47811d43148c0a35f62b7b916c86b421f5b72` before the batch-001 audit commits.
- Recovery: `49b502638718e4dbb29a9429f392b3a70c8d6d95`.

## Per-candidate findings

| Candidate SHA | Subject / changed path | Classification | Evidence |
|---|---|---|---|
| `b62fcbae7ea3cd0c2b473f730cb625b35335de67` | Add server-attested visibility fields to engagement-rewards integration fixture | Not proven / possibly superseded | The current Full Platform and Recovery integration test files have different blob SHAs, but neither contains the exact `serverValidatedVisibility` or `serverValidatedContinuousVisibleMs` fields. The current file must be compared around the corresponding settlement scenario and against server-side evidence requirements before any test port. |
| `af746792dbdf8b592f81aa7d135493bfc7a46fb0` | Use UUIDs for featured-ad viewing-session fixtures | Present already | Current Full Platform engagement-rewards test contains `randomUUID()`; the candidate's exact fixture hardening is already represented. |
| `46fffb60e5bf8265c6264fc8a025e3f1f6cdf85b` | Seed direct-chat document for call ceiling integration fixture | Not proven / possible missing test repair | Current Full Platform and Recovery call-signaling test files have the same blob SHA `2e35bd8b7b027e1a39d4e056dd7a8b834b7a5ca9`; the exact `call_timer_chat` fixture is absent. Need inspect the full test case and current callable contract before deciding whether this is a unique missing test repair or superseded. |
| `94973f2355b5ffd9da7708d4482f856148b95803` | Use UUID for featured-ad session fixture in wallet/store integration test | Not yet classified | The corresponding file was not included in the current path-level fetch tranche; no transfer decision. |
| `b4cb0e151d74b323f0269ed311cad787d4c6fc6c` | Narrow callable auth token in `functions/src/media.ts` caller | Not proven / possible missing type-safety fix | Full Platform and Recovery `media.ts` differ (`c2f6891afece8200e550e3eaa89ccf73452558c5` vs `67f8cd8d64212647afff8b162847ecb8018d8b2f`). Current Full Platform still contains repeated optional access to `request.auth?.token.platformOwner`; the exact candidate change is not yet traced against the full caller and type definitions. |
| `0cc045b32dc6f5b07f21b1ea758bf59fa0e8971b` | Change ordering of `creativeType` in featured-ad session response | Not proven / possible response-shape correction | The exact candidate return expression was not found in current Full Platform `functions/src/index.ts`. The file is large and differs from Recovery; inspect the current callable's return shape and response contract before classifying. |
| `3fa816a4079bb1daa9d4a3f90a2c7cf73f55c53f` | Remove `hide_coins_30d` from ready catalog test fixtures | Present already | Current Full Platform and Recovery `store-catalog.test.js` share blob SHA `c97c16afff5a1ed8017a6982652f288754bcf384`; the ready-list omits this item and a separate assertion expects `STORE_FULFILLMENT_NOT_READY`. |
| `d895f3499c9b2f8860d5d239bba7675d8328b615` | Keep hide-coins purchase disabled until fulfillment exists | Present already | Current Full Platform and Recovery `store-catalog.ts` share blob SHA `b31aaefa0ad331f3c431a6f2bc27ba951658d2dc`; the item is absent from the fulfillment-ready map. |
| `6da0a48c137edf2528bba28dba95a4b9281ea0ab` | Import media derivative helper at test module scope | Present already | Current Full Platform and Recovery `media-derivative-contract.test.js` share blob SHA `48a04cb8d3ff0f285ded8a45b055ec270eaa141a`; the helper is imported at module scope and the purpose-allowlist test is present. |
| `6b8de8fd89bc0da1e2597c141460532cd909fe7e` | Align group-call economy test with five-person cap and deterministic remainder | Not proven / possible missing test correction | Current Full Platform and Recovery `group-call-economy.test.js` share blob SHA `7dc2c89f6f67dadf318903e7a1d45e50964ccca6`; the candidate's `1003` fixture is absent. Need compare current cap policy and all related tests before deciding whether this test change remains valid. |

## Batch conclusion

Three candidates are confirmed present or behaviorally represented in the current Full Platform tree (`af746...`, `3fa816...`, `d895...`, plus `6da...` — four confirmed present). The remaining candidates are not certified unique missing changes. Some are absent as exact text, but absence of an exact patch is not proof of absent behavior or continued applicability.

## Transfer and test decision

No code was transferred in this batch. No tests were run. The available GitHub connector exposes read and write operations but no workflow-dispatch action; the current session has no mounted repository checkout for local Functions tests. A test-only or code transfer would therefore not meet the required test-before-next-batch gate. No branch refs or production resources were changed.
