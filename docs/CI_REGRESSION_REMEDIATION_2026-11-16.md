# CI Regression Remediation — 16 November 2026

## Scope

This record tracks a development-branch-only correction cycle. It does not authorize merge to `main`, production deployment, live Firebase changes, billing, or data deletion.

## Baseline evidence

- Baseline development commit: `efcb7fccf58eafc2de78319e803c6f1bfa320836`.
- Exact-head workflow runs `43900678758` (Mawdda domain regression) and `43900678853` (Validate Mawda) failed.
- Cloud Functions compilation reported TS2339 in `functions/src/index.ts`: the advertising-intake list inferred each mapped item as `{ requestId: string }`, so reading `item.kind` was not type-safe.
- Flutter widget tests exposed two test defects: an ambiguous scrollable selection in the featured-ads screen test, and a creator-proposal test that attempted to navigate through a web-only route in a non-web test environment.

## Changes applied on the development branch

1. Replaced the unsafe post-map `item.kind` filter with a Firestore document-field filter (`doc.get("kind")`) before mapping documents into response objects.
2. Updated the featured-ads widget test to select the outer `Scrollable` explicitly.
3. Updated the Media Workspace widget test to assert that the creator proposal route is disabled in a native test context, then test the proposal form directly and scroll to off-screen fields before asserting them.

Relevant change commits:
- `93136449041736c14c0f3b73db1a641711b5f123`
- `7e761cc413f220e4e22f5e71afcb2693228f462e`
- `502fd1c22cec55c3fed1c1c2f7ecc3691d159d1e`
- `6dd53f8537b543b314f8f061e2c3bb9c731067b7`
- `5a15641a7babcb12706e0ce8bfd2779fa89c850b`
- `08b8a6baa028b609feca90f5c0323fcaee5c27e1`

## Verification status

- Earlier exact-head runs demonstrated that Flutter analysis and the Web release build can pass while widget tests fail; this is not a full green validation.
- The first correction attempt still failed: the TypeScript spread did not expose `kind` as a named property, the Flutter test passed a `ListView` where the test API required a `Scrollable`, and the creator form test asserted an off-screen lazy-list child without scrolling.
- The final correction cycle above addresses those specific causes.
- **Final exact-head validation for `08b8a6baa028b609feca90f5c0323fcaee5c27e1` is pending.** Do not mark the regression resolved until both `Validate Mawda` and `Mawdda domain regression` complete successfully on this exact SHA.
- No physical-device acceptance, live non-production App Check acceptance, full 5,000-persona simulation, production readiness, or deployment is claimed.

## Remaining security and product gates

- FlutterFire App Check is not yet included in `pubspec.yaml`; legal/contract callables remain server-side fail-closed with `enforceAppCheck` and the web App ID allowlist helper. The allowlist must remain empty until the Web provider is registered and verified in non-production. Android and iOS App IDs must never be added to the legal portal allowlist.
- The legal/contract portal still requires Web App Check bootstrap and non-production verification before its workflows can be accepted.
- The four-hour temporary private-chat full-erasure rule must not be activated until the owner resolves who selects the retention mode and whether both parties must consent.
- The 5,000-persona lab, device E2E, real non-production storage/scanner acceptance, and the remaining requirement-to-code/test reconciliation remain separate release gates.
