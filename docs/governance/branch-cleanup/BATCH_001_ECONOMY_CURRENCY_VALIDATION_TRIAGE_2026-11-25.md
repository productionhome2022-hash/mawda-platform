# Batch 001 — Economy Currency Validation Triage — 2026-11-25

## Scope

This is a limited semantic review of the first economy-related unmatched candidates in the recovered SHA CSV. It is not a full audit of the 1,665 distinct candidate SHAs.

Current refs read during this review:
- Full Platform: `e3d47811d43148c0a35f62b7b916c86b421f5b72`
- Recovery: `49b502638718e4dbb29a9429f392b3a70c8d6d95`

Relevant current file blob identities:
- Full Platform `functions/src/economy-pricing.ts`: `07c6747d100e02be724a4517ad32271888895298`
- Recovery `functions/src/economy-pricing.ts`: `07c6747d100e02be724a4517ad32271888895298`
- Full Platform `functions/src/creator-proposals.ts`: `ea0a294a245690c9587ebc2bf455e76261062b12`
- Recovery `functions/src/creator-proposals.ts`: `b6d76cf9df7734fd7c90c406e7909c7c902c1627`
- Full Platform `functions/src/advertising-intake.ts`: `57f02db769d92ff9efd711e5a7e79447027ad9bf`
- Recovery `functions/src/advertising-intake.ts`: `6e7d5253e495cb4db04d6eb078a903db30adbb72`

## Candidate classification

| Candidate SHA | Change | Classification | Evidence / reason |
|---|---|---|---|
| `493eb30a637ece78c17c7091924c318c3b112ace` | Add shared positive currency precision validator | Present already | The current Full Platform and Recovery `economy-pricing.ts` have the same blob SHA and include `isValidPositiveCurrencyAmount`. |
| `5dce043cafb02fc107c04899708685babdbfd48a` | Correct decimal regex escaping | Present already | Current shared `economy-pricing.ts` contains the corrected `\d` and decimal capture regex. |
| `b97537e7c2c76e875de2416cefa7d65696087bad` | Route creator proposal budget validation through shared validator | Unique missing candidate; blocked | Recovery source imports and uses the helper; Full Platform source still uses local regex plus a generic three-letter currency check. The helper itself is already present in Full Platform. |
| `ac48ecf27c1b2c1ad448ca78ba6a062dd548b46a` | Route advertising intake budget validation through shared validator | Unique missing candidate; blocked | Same structural difference as creator proposals: Recovery uses shared helper; Full Platform still uses local regex and generic three-letter check. |
| `28b5c4c12037a2c94124f492b2997812bf051d8f` | Narrow creator proposed-currency TypeScript value after validation | Dependent follow-up; not independently portable | This commit is downstream of the helper integration. Its safe application depends on the missing source integration and the final accepted validator contract. |
| `4193c1547587066ae66fb91a5c137e03277c6fc9` | Narrow advertising proposed-currency TypeScript value after validation | Dependent follow-up; not independently portable | Same dependency as creator proposal validation. |
| `43c6a3e95b4c93676e0d7afc9406898c3b1b9379` | Creator precision tests | Conflicting test expectations | Test expects KWD acceptance, but the shared helper's owner-approved currency list excludes KWD. |
| `ec38519588f36742a55bdd79b6022bac790dbc09` | Advertising precision tests | Conflicting test expectations | Test expects KWD acceptance, but the shared helper's owner-approved currency list excludes KWD. |
| `b740e86e3c467b07f6b4b120c3dd6065c3df66ad` | Shared helper tests | Conflicting test expectations | Test expects KWD and JPY acceptance, but both are absent from `OFFICIAL_ECONOMY_CURRENCIES` and `CURRENCY_MINOR_UNIT_EXPONENTS`. |

## Semantic conclusion

The missing production behavior is narrowly identified: creator-proposal and advertising-intake budgets in Full Platform do not currently use the shared owner-approved currency precision validator, although the helper exists in the current tree. Recovery contains that integration.

The Recovery test commits are not portable as-is because they assert acceptance of KWD and JPY while the shared helper and the current `functions/test/economy-pricing.test.js` explicitly reject those codes. The current test also confirms the exact supported set and minor-unit precision: two decimals for EUR/USD/EGP/SAR/SYP/AED/DZD/MAD/TRY, three decimals for JOD/IQD, and null for CHF; KWD and JPY are rejected. The source of truth for this implemented allowlist is the existing Full Platform code/test, not an inferred global ISO list. This review does not change or extend that policy. The Recovery tests must be reconciled to the existing registry rather than widening it.

## Transfer decision

No code was transferred in this batch. This is intentional: the candidate source changes are identifiable, but the attached tests contain policy contradictions, and the available GitHub connection exposes no workflow-dispatch operation or local repository execution environment for running the required tests before the next batch.

Before transfer:
1. Confirm the exact intended currency allowlist against the authoritative owner-approved economy decision document.
2. Reconcile/add tests using only currently approved currency codes and correct minor-unit exponents.
3. Apply the two consumer integrations and their type narrowing as one isolated batch.
4. Run relevant Functions unit tests and CI on the exact resulting SHA; record run IDs and outcomes.

No branch ref was moved, no PR was opened, and no production/Firebase resources were changed.
