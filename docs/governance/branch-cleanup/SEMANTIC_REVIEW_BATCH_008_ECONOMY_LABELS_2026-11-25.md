# Semantic review batch 008 — economic policy and BetaCoins labels, candidates 97–108
Date: 2026-11-25
Repository: productionhome2022-hash/mawda-platform
Target branch: codex/mawda-full-platform-implementation
Target HEAD after this batch's source edits: c52e5738c428e9e0b84250023d4e00f802591c87
Candidate source CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates at zero-based indexes 96–107 (candidate numbers 97–108).

## Candidate classifications

| Candidate | SHA | Change | Full Platform evidence / disposition |
|---:|---|---|---|
| 97 | cc3cd71916b02a80e8030e82cde48c6b5c7c3381 | Record group-call pricing/capacity gaps | Current economic audit contains owner-approved group-call price, room capacity, entitlement/consent/metering requirements and explicit incomplete status. Present. |
| 98 | fdaf53e1f5dff682fce212380ca598322fd66a65 | Document group-call policy amendment | Current approved decisions/traceability contains group audio/video scope, pricing, four-person video cap, room-capacity audio rule and participant eligibility. Present. |
| 99 | c392a0f499e699ff09739ea678db4336aae593ce | Reconcile economic audit and BetaCoins spelling | Current economic audit already uses the canonical BetaCoins spelling and records historical compatibility of technical `coins` identifiers. Present. |
| 100 | 112aaea91893dd1ce09d5368f2d9721cdabb0c4e | Standardize server messages to BetaCoins | Three remaining user-facing transfer error strings in functions/src/index.ts still said كوينز. Updated those strings to BetaCoins. Commit b3a2f6bcf99f7270cb6544d22ec624547299be73. |
| 101 | 6ead5db860f519a0cd268cb22f49f705ad7b615c | Standardize member entitlement history label | Current screen already describes free grants as not deducting BetaCoins; historical exact wording is superseded by current copy. No change. |
| 102 | 3c4fcc8cbb4edde80fb3517c5d2af433b14536d4 | Standardize profile gift/transfer labels | Updated profile transfer title and gift action to BetaCoins. Commit 3bc690a72fc5f71884b04394e532ec0c09b3146a. |
| 103 | 726edaeb868d4226ee11babf3ad95f31f76281d8 | Standardize coin purchase UI labels | Updated pending purchase, no-credit-before-owner-approval, package fallback and custom amount labels to BetaCoins. Commit 576af1bd3451458b53536a5ba24baadeaf51d922. |
| 104 | e4f81e135b0626f5c2839702621fea1770e0cc76 | Standardize shop call-price labels | Updated the remaining 120/400 call-price descriptions to BetaCoins. Commit 0e9bfaf5e3851d4f48744a42161cf0bd2e893e15. Two historical exact strings were already covered by the broader replacement and required no second edit. |
| 105 | 6ebbd924bb37f432b7937a2c5a0e7a34824b0fbd | Standardize economic audit branding | Current economic audit already uses BetaCoins consistently in the relevant sections. Present. |
| 106 | 5180ae6728fc9e07d5662636db0f478e9334e0e6 | Standardize approved-decision branding | Current traceability document already establishes BetaCoins as the canonical visible name. Present. |
| 107 | 5b3ceb13088f6708625af6a72fba1f98a21ece3d | Standardize owner grant UI labels | Updated free-grant explanation and confirmation copy to BetaCoins. Commit 549f8f6e92e65bb670d87d46553fd7b2ba958ef2. |
| 108 | 615d7e2a0e6612c5f385b1d63ec5a317ee778346 | Standardize wallet UI labels | Updated wallet purchase tooltip and sent/received transfer labels to BetaCoins. Commit c52e5738c428e9e0b84250023d4e00f802591c87. |

## Changes and validation
- Six source files received narrow, exact-string user-visible label updates: functions/src/index.ts, lib/screens/profile_screen.dart, lib/screens/coin_purchase_screen.dart, lib/screens/shop_screen.dart, lib/screens/owner_entitlement_grants_screen.dart, and lib/screens/wallet_screen.dart.
- The entitlement-history screen did not need a change; its current wording already uses BetaCoins.
- These edits change presentation text only; they do not change prices, entitlements, wallet calculations, or transaction behavior.
- Reviewed: 12 unique candidates (97–108).
- Present or superseded without edit: 6; narrowly updated: 6.
- Confirmed missing functional behavior: 0.
- Tests executed: 0. Flutter Analyze/Tests and Functions tests were not run in this environment. No CI success is claimed.
- No production, Firebase, billing, or main-branch operation was performed.