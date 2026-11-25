# Mawdda Platform — Unified Body Integration Status
Date: 2026-11-25
Canonical development branch: `codex/mawda-full-platform-implementation`
Verified source head at record creation: `54814119e20dc56b012c01d712dd14e1aee689e6`

## Scope
This record tracks only consolidation into the canonical Full Platform development branch. It does not authorize production deployment, a merge to `main`, deletion of source branches, Firebase production changes, billing activation, or changes to the separate 5,000-persona simulation repository.

## Confirmed implementation in the canonical body
- The economic/advertising source modules and the corresponding Flutter screens are present in the canonical branch, including capacity-media management, coin purchase, economy pricing, featured ads, media workspace, advertising intake/rewards, owner coin-purchase review, owner featured-ad dashboard, sticker packs, room-rental pricing, shop, wallet, member media upload and sticker widgets.
- The canonical Functions entry point already contains group-call capacity integration and exports the biometric lifecycle callables from `biometric-lifecycle`.
- The canonical branch already contains the verification calendar and email-verification cycle implementation.
- The canonical role identity module is newer/larger than the isolated role-capacity PR source; the isolated file must not replace it wholesale.
- The canonical media implementation is newer/larger than the isolated media legal-hold PR source; review only behavior not already represented in the canonical implementation.
- Store gifting already contains concurrent duplicate-request coverage using the canonical `recipientUid` request shape; do not replace it with the older `recipientUsername` fixture from the isolated PR.
- The isolated biometric retry-state helper is not the canonical lifecycle implementation. The canonical entry point exports the full biometric lifecycle from `biometric-lifecycle`; any helper port must be justified against that implementation and must not create a second state machine.

## Defect repaired on this pass
The scanner container's integration test imported `inspectStickerMedia`, but `scanner/processors.js` did not implement or export it. The canonical branch also lacked the sticker-purpose allowlist in scanner request validation. This made the scanner image integration suite fail with `inspectStickerMedia is not a function`.

Changes committed to the canonical branch:
- `1dcbeb88773866016042e00aad5d975e7b0d0370`: implement bounded sticker metadata inspection, including GIF dimensions, frame count, duration and source-size checks; enforce a 512 KiB ceiling for sanitized animated sticker derivatives.
- `5946ac96db25186f537747692d4abce8620c35f7`: permit sticker scans only for supported image media types and sanitize sticker validation errors.
- `54814119e20dc56b012c01d712dd14e1aee689e6`: add scanner request-validation tests for sticker purpose and reject audio under that purpose.

## CI evidence on this pass
- Earlier exact-head run on `6b83d582030ea94bf5c72cb6069e1fd50bad977c`: Mawdda Test Center passed; economic regression passed; economic phase verification passed; Validate Mawda failed only at the isolated ClamAV scanner processor integration test, where the missing `inspectStickerMedia` export was reported.
- New runs on `54814119e20dc56b012c01d712dd14e1aee689e6`:
  - Mawdda Test Center run `45626002195`: Flutter analysis, Flutter tests and Web release build job passed; comprehensive backend emulator job was still running when this record was prepared.
  - Validate Mawda run `45626002134`: Cloud Functions compile/unit job passed; server evidence/authorization/biometric reward integration job passed; Flutter and scanner stages were still running when this record was prepared.
  - Economic phase verification run `45626002124`: passed.
- No result is claimed for a job that was still running. Recheck exact-head CI after completion.

## Consolidation assessment
The inspected selective PRs #91–#96 are not safe to merge wholesale. Their source branches are historical candidates and diverge from the current canonical body. Several reviewed changes are already represented in the canonical branch, while some source diffs are older versions of files that have since evolved. Keep the canonical branch as the only active integration target; preserve source branches as audit evidence until their unique changes are reconciled and the owner-authorized cleanup phase begins.

## Remaining blockers before declaring one-body completion
1. Recheck all exact-head CI jobs on the final canonical SHA, including the scanner container integration test after the sticker fix.
2. Complete a semantic inventory of every unique source change in the recovery/reconciliation candidate set; compare behavior and tests, not only filenames or commit counts.
3. Port only missing, owner-approved behavior into the canonical branch, especially any still-open end-to-end lifecycle or UI consumer; do not duplicate existing services or state machines.
4. Re-run the relevant Functions, emulator, Flutter and scanner tests after each integration batch.
5. Update the branch reconciliation and feature traceability registers with exact SHAs and evidence.
6. Only after owner acceptance of the unified body, begin the separate cleanup/deletion phase. Do not delete source branches or records during this integration phase.

## Status
**IN PROGRESS — the canonical branch contains the reviewed feature families and one scanner integration defect has been repaired. Full semantic reconciliation and exact-head test closure remain open.**
