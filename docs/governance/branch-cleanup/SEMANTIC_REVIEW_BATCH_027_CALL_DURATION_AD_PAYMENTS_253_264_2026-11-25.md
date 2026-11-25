# Semantic review batch 027 — group-call duration and advertiser payment policy
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 253–264 (12 commits).
Inspected Full Platform evidence: .github/workflows/economic-phase-verification.yml de1462d28e6b11f97f4446f3959988cb72d6aa38; call-usage-policy.ts 787bdbc29e82467a3357a5972f304d0c36c28f4e; call-usage-policy.test.js ec24ac4e362d5562ba26ff762bb2bfa02d4c2344; economy_pricing_screen.dart 36ecb7b18e98937169a45eee8563286c634355eb; featured-ad-finance.integration.test.js 5ff392e21ca8d0586e8d7efce63e27430e4d6dbf; index.ts e93b9247cc6c5a21c7bd4a3419b9f87b735011a4.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 96c9f6ec6569cad73726d28cd7a14d8602ab4e43 | Add isolated economic verification workflow | Current .github/workflows/economic-phase-verification.yml runs on push to Full Platform, pull requests affecting Functions/Firebase rules, and manual dispatch; it installs Node 22/Java 21, builds Functions, runs unit tests and call signaling emulator tests. | Present and extended to target branch |
| afd6b97f4af8e773c25d1969afaccf4e4af98bfe | Test fixed group-call duration limits | Current call-usage-policy tests assert five-minute room audio and three-minute room video regardless of owner-configured direct-call duration, and reject unknown scope/mode. | Present |
| d7f63bc19b5c410c3d2ebd9a9eed4f6841920958 | Apply fixed duration to rented-room calls | Current markCallConnected passes room/direct scope and audio/video mode to callMaxDurationEnd. | Present |
| 4bbbef3d59ee07ccbb7876d52b71bded27edcc63 | Define immutable group-call audio/video durations | Current call-usage-policy.ts exports GROUP_AUDIO_CALL_DURATION_MS=5 minutes and GROUP_VIDEO_CALL_DURATION_MS=3 minutes; direct calls retain owner-configured duration. | Present |
| 70ad5b9679200ef874e5f1aca5c37315d71f25e1 | Test unknown group-call mode values | Current group-call-economy tests reject unknown runtime mode values. | Present |
| e1ec6103a9df3456224aaccbb7f3589e5299ab2a | Correct group-call mode validation | Current getGroupCallRate rejects modes other than audio/video before selecting a policy rate. | Present |
| 6b8ce30c2546f15aa341388bd7e4d1d4a7f841e4 | Return only explicitly configured payment modes | Current getOwnerEconomyPricing and payment-policy projections use projectEconomicPaymentPolicy(data.paymentPolicy) without legacy boolean fallback. | Present |
| 564eddafc2704f2ed0c6f6b05482dadc018f4f4c | Ignore legacy payment switches unless explicit owner policy exists | Current coin package, purchase request and featured-ad payment paths read the explicit versioned paymentPolicy; legacy booleans do not enable payment modes. | Present |
| e4a24ba10ea2a6647dad81d7c47d47ab99e7eb6f | Enable manual advertiser receipt only in isolated fixture | Current featured-ad finance integration test snapshots platform economy settings, enables manual featured_ads only inside the test fixture and restores the prior settings during cleanup. | Present |
| b15cb8114550873717107045fc75e78bc65ee7d4 | Expose owner controls for supported manual payment modes | Current economy_pricing_screen loads and saves paymentPolicy.featured_ads.manualEnabled separately from coin purchase mode; unsupported automated modes remain disabled. | Present |
| d2a21fda7f8d362c467a5ccb2eb2be3546d7eb41 | Preserve idempotent advertiser receipt replay after policy changes | Current recordFeaturedAdFinancialEvent validates a matching prior event and returns the verified immutable replay before checking whether new manual receipts are currently enabled. | Present |
| c86892e49b3b7fe968c29f0d5b7cd18633df5568 | Require owner-enabled manual advertising payments before recording receipts | Current recordFeaturedAdFinancialEvent reads versioned platform payment settings and rejects a new payment_received event unless featured_ads.manualEnabled is true and automatedEnabled is false. | Present |

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Already implemented: 12.
- Confirmed unique missing changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-definition inspection only.
- No CI success is claimed.

## Safety decision
Keep manual advertiser receipts gated by the explicit versioned owner payment policy. Existing idempotent replays remain readable after the policy is disabled; new receipts remain blocked. Group-call room durations stay fixed at five minutes audio and three minutes video, independent of commercial pricing. Continue with candidate 265 onward.