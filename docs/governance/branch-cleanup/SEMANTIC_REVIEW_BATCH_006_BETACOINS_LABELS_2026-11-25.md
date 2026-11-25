# Semantic review batch 006 — BetaCoins product-label consistency
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 85–96 (12 commits).

## Classification and transfer

| Candidate SHA | Change | Result |
|---|---|---|
| cc3cd71916b02a80e8030e82cde48c6b5c7c3381 | Record approved group-call pricing/capacity | Present in current economic audit and approved decision records; no pricing changed. |
| fdaf53e1f5dff682fce212380ca598322fd66a65 | Document rented-room group-call policy | Current approved decisions document contains the owner-approved policy; no port required. |
| c392a0f499e699ff09739ea678db4336aae593ce | Reconcile economic audit and BetaCoins spelling | Current economic audit already uses BetaCoins as the product name. |
| 112aaea91893dd1ce09d5368f2d9721cdabb0c4e | Standardize server messages/notifications | Historical user-facing copy updates were missing in current functions/src/index.ts. Applied the limited copy-only replacements using grammatically correct Arabic with the exact product name BetaCoins. |
| 6ead5db860f519a0cd268cb22f49f705ad7b615c | Standardize entitlement-history label | Already present in lib/screens/member_entitlement_history_screen.dart. |
| 3c4fcc8cbb4edde80fb3517c5d2af433b14536d4 | Standardize profile gift failure label | The exact historical text was absent; current profile screen already displays BetaCoins in the corresponding transfer/gift actions. No change needed. |
| 726edaeb868d4226ee11babf3ad95f31f76281d8 | Standardize coin-purchase screen labels | Missing labels were updated in lib/screens/coin_purchase_screen.dart, including request confirmation, validation, no-issuance notice and fallback package name. |
| e4f81e135b0626f5c2839702621fea1770e0cc76 | Standardize shop call-price labels | Missing visible currency labels were updated in lib/screens/shop_screen.dart. Numeric prices and call rules were not changed. |
| 6ebbd924bb37f432b7937a2c5a0e7a34824b0fbd | Standardize economic audit brand | Already present in current docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md. |
| 5180ae6728fc9e07d5662636db0f478e9334e0e6 | Standardize approved-decision currency name | Current approved decisions record already uses the canonical BetaCoins product name. |
| 5b3ceb13088f6708625af6a72fba1f98a21ece3d | Standardize owner grant labels | Missing labels were updated in lib/screens/owner_entitlement_grants_screen.dart. No grant behavior or amounts changed. |
| 615d7e2a0e6612c5f385b1d63ec5a317ee778346 | Standardize wallet labels | Missing purchase tooltip and transfer-history labels were updated in lib/screens/wallet_screen.dart. No wallet behavior changed. |

## Changed files
- functions/src/index.ts — server messages/notifications only.
- lib/screens/coin_purchase_screen.dart — visible product labels only.
- lib/screens/shop_screen.dart — visible currency labels only; prices unchanged.
- lib/screens/owner_entitlement_grants_screen.dart — explanatory copy only.
- lib/screens/wallet_screen.dart — tooltips/history labels only.

## Verification
- Reviewed: 12/1,665 unique candidates in this batch.
- Already present/documented: 7; code-only label gaps corrected: 5 files (some candidates were already satisfied).
- Confirmed missing functional/economic behavior: 0 in this batch.
- Branch HEAD after the source updates: ac40ddb1b9f0be606ccb16bd02368b8ca518b5b7.
- GitHub read-back confirmed the changed files no longer contain the specific legacy labels targeted by this batch.
- Tests run: 0. These are source-level copy edits; no Flutter or Functions tests were executed.
- No prices, coin amounts, entitlements, wallet arithmetic, production resources or Firebase settings were changed.

## Safety decision
These edits are limited to display strings and server-generated copy. The old branch's malformed Arabic prefix 'الBetaCoins' was not copied; the canonical product spelling was inserted with natural Arabic phrasing. Continue with the next candidate range.