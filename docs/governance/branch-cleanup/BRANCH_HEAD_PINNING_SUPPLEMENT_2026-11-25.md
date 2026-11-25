# Branch Pinning Supplement — 2026-11-25

This supplement completes the branch-tip comparison coverage for the two refs omitted from the first compare batch.

- Structural governance branch: `codex/structural-governance-biometric-roles-2026-11-19`
- Pinned tip: `e71f3eb559e7f86edecd97fb366ad9c69b5817c5`
- Compare base used: Full Platform after the pinning report commit, `52abaf0ccbced935ed03bc2743f40927c2632cbf`
- GitHub compare status: `diverged`
- GitHub ahead/behind fields: ahead_by=79, behind_by=954
- Changed-file count returned: 35
- Changed paths include workflows, README/governance docs, Firestore/Storage rules, Functions role/biometric modules and tests, plus owner/member screens.

The `main` branch was also read-only compared for context:
- main tip: `2fda8ad78452911c0f269be8ab95008d11f09a0f`
- Compare status: `diverged`
- GitHub ahead/behind fields: ahead_by=4, behind_by=3546
- Changed-file count returned: 2
- No action was taken on main.

This completes the branch-tip compare pass for all 35 branches returned by the repository branches API: Full Platform, Recovery, 32 other CSV branches, and main. The compare endpoint provides a changed-file summary; it does not replace per-commit/per-file semantic comparison. No source branch is classified as safe to merge solely from these counts.
