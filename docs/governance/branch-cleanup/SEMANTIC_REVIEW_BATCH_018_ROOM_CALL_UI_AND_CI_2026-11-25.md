# Semantic review batch 018 — pricing UI compatibility and deferred room-call lobby flow, candidates 217–228
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform source snapshot inspected: 8f49b9948696c73469a50c7b4abdeade93d8960c
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 216–227 (candidate numbers 217–228).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 217 | 1aa3071c75b6a3777618479435623489f0a6ecc5 | Use valid Wrap arguments in economy pricing UI | Current economy_pricing_screen.dart uses Wrap(children: ...) without the invalid mainAxisSize argument. Present. |
| 218 | 869ed7e2b882a288cf9aaabe62cfbb9021ee6a7f | Remove duplicated owner purchase screen fragment | Current owner_coin_purchase_screen.dart has no duplicated trailing fragment; source is structurally clean at the inspected path. Present. |
| 219 | 2d358eff323b444256711618c61cfe7fc15002b5 | Close creator lobby when shared call deadline expires | Current Flutter call screen has no creator room-call lobby or join-request polling flow; the historical patch depends on APIs absent from current Full Platform. Not ported. |
| 220 | 21d3f15fefc4475a8f6af6828c4d8d7c3490d559 | Test group-call mode without owner price | Current group-call pricing snapshot is explicitly test-only and group-call billing is not connected. Do not import a price gate that would imply an active billable call policy before the settlement/consent lifecycle is approved. |
| 221 | 16400d51db64ed4f29062f12cb893c27957509cc | Block group-call modes without an active owner price | Not ported for the same reason: current startCall records a test pricing snapshot only; no wallet charge is made and no billable settlement path is enabled. |
| 222 | e2d99fb44d38e14f3d2471e133586aa9ec2408ca | Add push/PR triggers to Flutter CI | Current workflow is manual-dispatch only. Historical push trigger targets an obsolete economic-phase branch; no trigger change was made without confirming the intended CI cadence and branch policy. |
| 223 | f67c797901ddb8ffbc2371e133586aa9ec2408ca | Retry creator join-request processing after transient errors | Current Flutter and Functions sources do not contain the room join-request API/lobby workflow. Not applicable. |
| 224 | 42c9b74ba831da921d8508d50afa4da7d68b75e1 | Resume approved room-call joins without duplicate requests | Current chat room flow uses the existing whole-room call signaling model; no join-request status endpoint exists. Not ported. |
| 225 | effbb5d89f514c9200a300668529f6360ead55c6 | Retain creator financial consent across room join approvals | No room join approval or separate group-call billing-consent endpoint is present in current Full Platform. Not ported. |
| 226 | 69d583bc0964c72b0c6f77ff27a8d3592a812c8c | Add creator room-call lobby and approval flow | This is a separate room-call architecture requiring multiple new server/client APIs and consent gates; it is not a selective file-level fix. Defer as a separate approved feature phase. |
| 227 | 4b7773f193a71c7f808810ba44ce272a8225a93c | Wire room join request and separate financial consent in Flutter | Depends on the absent getActiveRoomCall, requestRoomCallJoin and consent APIs. Not ported. |
| 228 | fd29355a68c194c50445dd8959f684faf0305ef2 | Test financial consent before join request | No corresponding consent/join-request API exists in current Full Platform. Not applicable until the full lifecycle is approved and implemented. |

## Result
- Reviewed: 12 unique candidates (217–228).
- Present/current UI fixes: 2.
- Deferred due to absent room join-request/creator lobby architecture or disabled billing: 9.
- CI trigger change deferred pending explicit cadence/branch confirmation: 1.
- Code transferred: 0.
- Tests executed: 0. No Flutter or Functions test runner was invoked.
- No production, Firebase, billing, main-branch or deployment operation was performed.