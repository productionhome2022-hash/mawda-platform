# Semantic review batch 009 — group-call pricing decisions and BetaCoins terminology
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Scope: unique UNMATCHED candidates 97–108 (12 commits).
Inspected Full Platform files: docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md blob 0e58764259e5bc28200e8ddafbe377ee31ba95f8; docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md blob 6d3086e02e085f15270e2f190a36dae58a9b01fc; functions/src/index.ts blob 94e60843b5c6cedbc49aa4aa86735eeed2c62396; profile_screen.dart blob 94adac45754d7027c9f288497348d90069b76c44; member_entitlement_history_screen.dart blob 941423a8d41a57a5f838b9df15899bf14c08b972; coin_purchase_screen.dart blob 9433823403a6184d7f643531e37227a8c5ccaaca; shop_screen.dart blob 62ca5225ca436852e951fb9ad78a2a1005a5feb7; owner_entitlement_grants_screen.dart blob fdc28dfba35fc7b1eedcd7a9af531ef106ad3bb1; wallet_screen.dart blob 76630bea0e31d4378bdf6edc68191b41ce96e894.

## Candidate dispositions

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| cc3cd71916b02a80e8030e82cde48c6b5c7c3381 | Record group-call pricing and capacity gaps | Current economic complete audit records 1,000 BetaCoins audio and 2,000 BetaCoins video per connected group-call minute, room-capacity audio rule, four-person video maximum, per-member entitlement, consent, connected interval metering and atomic settlement requirements. | Present |
| fdaf53e1f5dff682fce212380ca598322fd66a65 | Document owner-approved group-call policy amendment | Current approved decisions/traceability contains the group-call amendment: rented private rooms only, group audio/video total rates, audio follows room capacity, video maximum four, independent entitlement and financial consent, connected-interval metering. | Present |
| c392a0f499e699ff09739ea678db4336aae593ce | Reconcile economic audit with completed gifting work and exact BetaCoins spelling | Current economic audit uses the exact English spelling BetaCoins and describes the member-to-member gift backend/profile flow, with outstanding execution and acceptance tests clearly retained. | Present |
| 112aaea91893dd1ce09d5368f2d9721cdabb0c4e | Standardize server messages and notifications to BetaCoins | Current functions/src/index.ts uses BetaCoins in transfer validation, wallet errors, biometric lifecycle messages, purchase/gift notifications and package labels. Older local-biometric completion is explicitly disabled in favor of manual owner review. | Present/evolved |
| 6ead5db860f519a0cd268cb22f49f705ad7b615c | Replace legacy currency labels in entitlement history | Current member_entitlement_history_screen.dart labels gifts and amounts with BetaCoins. | Present |
| 3c4fcc8cbb4edde80fb3517c5d2af433b14536d4 | Replace legacy currency labels in profile | Current profile_screen.dart uses BetaCoins for member gifting and biometric reward; the previous BetaCoinsز typo is absent. | Present |
| 726edaeb868d4226ee11babf3ad95f31f76281d8 | Replace legacy currency labels in coin purchase screen | Current coin_purchase_screen.dart uses BetaCoins for purchase, pending-payment and amount messages. | Present |
| e4f81e135b0626f5c2839702621fea1770e0cc76 | Replace legacy currency labels in shop screen | Current shop_screen.dart uses BetaCoins in call-package disclosures, store messages and price labels. | Present |
| 6ebbd924bb37f432b7937a2c5a0e7a34824b0fbd | Enforce exact BetaCoins branding in economic audit | Current economic audit heading and product-facing currency statement specify BetaCoins as one English word without a space. | Present |
| 5180ae6728fc9e07d5662636db0f478e9334e0e6 | Enforce exact BetaCoins branding in decision traceability | Current traceability includes newer NOM-001 naming authority stating the displayed name is بيتاكوينز / BetaCoins; the current economic audit separately requires the exact English BetaCoins spelling in app interfaces. The historical patch changes older ECON-004/WAL-001 rows but is not needed to establish the current NOM-001 authority and would rewrite a bilingual decision into English-only wording. | Superseded by newer NOM-001; do not port the older wording |
| 5b3ceb13088f6708625af6a72fba1f98a21ece3d | Replace legacy currency labels in owner entitlement grants | Current owner_entitlement_grants_screen.dart states free grants do not deduct BetaCoins and uses BetaCoins in confirmation text. | Present |
| 615d7e2a0e6612c5f385b1d63ec5a317ee778346 | Replace legacy currency labels in wallet screen | Current wallet_screen.dart uses BetaCoins in purchase, gift and transfer labels. | Present |

## Result
- Reviewed: 12/1,665 unique candidates in this batch.
- Present or superseded by newer terminology authority: 12.
- Confirmed unique missing code changes: 0.
- Code transferred: 0.
- Tests executed during this review: 0; source and test-file inspection only.
- No CI success is claimed.

## Safety decision
No changes were transferred. Pricing amounts and call lifecycle remain governed by the owner-approved economic decisions; their presence in documentation is not evidence of a functioning billing lifecycle. The existing call audit still keeps participant entitlement, explicit consent, trusted metering and atomic settlement as acceptance blockers. Continue with candidate 109 onward.