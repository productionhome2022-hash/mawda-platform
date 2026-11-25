# Semantic review batch 021 — call duration policy and explicit economic payment activation, candidates 253–264
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Full Platform HEAD inspected: d36fba9962b64e6a7af9eed6c658b7ec8c703b11
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 252–263 (candidate numbers 253–264).

## Candidate-by-candidate classification

| Candidate | SHA | Change | Current Full Platform evidence / disposition |
|---:|---|---|---|
| 253 | 96c9f6ec6569cad73726d28cd7a14d8602ab4e43 | Add isolated economic phase verification workflow | .github/workflows/economic-phase-verification.yml already triggers on push/PR to Full Platform and supports manual dispatch; it installs Node 22/Java 21, builds Functions, runs unit tests and call-signaling emulator tests. Present. |
| 254 | afd6b97f4af8e773c25d1969afaccf4e4af98bfe | Test fixed group-call duration limits | Current call-usage-policy.ts and unit tests define fixed group audio 5 minutes and video 3 minutes, independent of pricing. Present. |
| 255 | d7f63bc19b5c410c3d2ebd9a9eed4f6841920958 | Apply fixed duration to rented-room group calls | markCallConnected now uses callMaxDurationEnd with scope/mode and validated immutable policy snapshot; room audio/video use 5m/3m while direct calls retain owner-configured duration. |
| 256 | 4bbbef3d59ee07ccbb7876d52b71bded27edcc63 | Test immutable group-call audio/video durations | call-usage-policy.test.js covers fixed room durations and mode boundaries. Present. |
| 257 | 70ad5b9679200ef874e5f1aca5c37315d71f25e1 | Reject unknown group-call mode values | callModeQuotaLimit and callMaxDurationEnd reject unknown modes with CALL_MODE_INVALID. Present. |
| 258 | e1ec6103a9df3456224aaccbb7f3589e5299ab2a | Correct group-call mode validation syntax | Current helper has valid runtime scope/mode guards and typed duration calculation. Present. |
| 259 | 6b8ce30c2546f15aa341388bd7e4d1d4a7f841e4 | Return only explicitly configured payment modes | Removed legacy boolean fallback from projectEconomicPaymentPolicy; missing explicit owner policy now disables every payment service. Updated all Functions call sites to use only paymentPolicy. Commits 0c2f7156928803cb29568322cdd1aa4976ffde4a and f4fb3bcd26a6a2b036ed4033b61f15e4efc78faf. |
| 260 | 564eddafc2704f2ed0c6f6b05482dadc018f4f4c | Ignore legacy payment switches unless owner publishes explicit policy | Added tests proving legacy top-level flags cannot enable payments; updated coin-package gift integration fixture to seed an explicit owner policy. Commits 1d6d2b75f22de277e6fdb44499ee228ac8d9cade and 0ea6154075e6d26dc8026270c2c07d25ba3f8149. |
| 261 | e4a24ba10ea2a6647dad81d7c47d47ab99e7eb6f | Expose supported manual payment mode controls to Super Admin | Current economy pricing UI already exposes explicit manual service switches and persists paymentPolicy. Present. |
| 262 | b15cb8114550873717107045fc75e78bc65ee7d4 | Preserve idempotent advertiser receipt replay after policy changes | Current recordFeaturedAdFinancialEvent validates an existing event/audit/version replay and returns before checking the current payment-enabled switch. Added integration coverage that replay still succeeds after manual featured-ad payments are disabled. Commit 17ebc1a54ddcd68a8f603370a1ce6911d70931a3. |
| 263 | d2a21fda7f8d362c467a5ccb2eb2be3546d7eb41 | Require owner-enabled manual advertising payments before recording receipts | Current receipt path requires explicit paymentPolicy.featured_ads.manualEnabled=true, automatedEnabled=false and a valid owner policy version for new payment_received events. Present and now independent of legacy flags. |
| 264 | c86892e49b3b7fe968c29f0d5b7cd18633df5568 | Verify payment mode state in advertiser financial integration | Featured-ad finance integration fixture already isolates an explicit paymentPolicy and tests disabled new receipts plus idempotent replay. Present. |

## Changes made
- Restored fixed duration selection in markCallConnected through callMaxDurationEnd: rented-room audio 5 minutes, video 3 minutes; direct-call duration remains owner-policy based.
- Removed legacy payment boolean fallback. Only explicit per-service paymentPolicy can enable manual coin purchases or featured-ad receipts; all absent modes default disabled.
- Updated the coin-package gift integration fixture to publish explicit owner policy.
- Added featured-ad receipt replay coverage after the owner disables the payment mode; new receipts remain rejected while exact prior replays remain idempotent.

## Result and verification
- Reviewed: 12 unique candidates (253–264).
- Present or restored: 12.
- Tests added/updated: payment-policy unit cases, coin-package gift fixture, and featured-ad policy-change replay case. Tests executed: 0.
- Workflow exists and targets Full Platform, but workflow_runs and combined status were empty at final check; no CI success is claimed.
- No production, Firebase, billing, main-branch or deployment operation was performed.