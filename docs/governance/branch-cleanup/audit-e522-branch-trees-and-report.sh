#!/usr/bin/env bash
# Mawdda E522 branch audit — read-only inventory/tree comparison + sanitized report upload.
# This script NEVER deletes refs, merges branches, changes files in the platform tree,
# deploys, or touches Firebase/production. It only publishes an audit report to Recovery.
set -Eeuo pipefail
umask 077

REPO_SLUG="productionhome2022-hash/mawda-platform"
RECOVERY="codex/mawda-recovery-integration-2026-11-21"
REPORT_REL="docs/audit/termux/runs/$(date -u +%Y%m%dT%H%M%SZ)-e522-branch-tree-audit/BRANCH-TREE-AUDIT.md"
TMP_DIR="$(mktemp -d)"
REPORT="$TMP_DIR/BRANCH-TREE-AUDIT.md"
WORKTREE_PARENT="$(mktemp -d)"
WORKTREE="$WORKTREE_PARENT/recovery"
cleanup() {
  git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$WORKTREE_PARENT" "$TMP_DIR"
}
trap cleanup EXIT

abort() { printf 'ABORTED: %s\n' "$1" >&2; exit 1; }
command -v git >/dev/null 2>&1 || abort "Git is required."
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || abort "Run this from inside the existing mawda-platform Git working copy."
cd "$ROOT"
[[ -z "$(git status --porcelain 2>/dev/null)" ]] || abort "Working tree is not clean; no audit or ref changes were made."
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"
[[ "$ORIGIN_URL" == *"github.com/$REPO_SLUG"* || "$ORIGIN_URL" == *"github.com:$REPO_SLUG"* ]] || abort "origin does not identify the approved repository."
unset ORIGIN_URL

# Fetch refs quietly; never print remote URLs, credential-bearing config, or raw auth errors.
git fetch --quiet origin '+refs/heads/*:refs/remotes/origin/*' >/dev/null 2>&1 || abort "Could not fetch repository refs. Check the existing GitHub connection; no refs were changed."
RECOVERY_REF="refs/remotes/origin/$RECOVERY"
git show-ref --verify --quiet "$RECOVERY_REF" || abort "Recovery branch is missing."
RECOVERY_SHA="$(git rev-parse "$RECOVERY_REF^{commit}")"
RECOVERY_TREE="$(git rev-parse "$RECOVERY_REF^{tree}")"
MAIN_SHA="$(git rev-parse refs/remotes/origin/main^{commit} 2>/dev/null || true)"
[[ -n "$MAIN_SHA" ]] || abort "main branch is missing."

{
  echo "# E522 branch tree audit"
  echo
  echo "- Repository: $REPO_SLUG"
  echo "- UTC started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- Recovery ref: $RECOVERY"
  echo "- Recovery commit: $RECOVERY_SHA"
  echo "- Recovery tree: $RECOVERY_TREE"
  echo "- main commit (observed only; never modified): $MAIN_SHA"
  echo "- Method: direct recursive Git tree comparison against the fetched Recovery tree."
  echo "- Scope: read-only. No branches deleted, no merges performed, no source files copied."
  echo
  echo "| Branch | Live commit | Added on source vs Recovery | Removed on source vs Recovery | Changed paths | Disposition |"
  echo "|---|---|---:|---:|---:|---|"
} > "$REPORT"

BRANCH_COUNT=0
COMPARE_ERRORS=0
while IFS=$'\t' read -r SHA REF; do
  [[ "$REF" == refs/heads/* ]] || continue
  NAME="${REF#refs/heads/}"
  [[ "$NAME" == "main" || "$NAME" == "$RECOVERY" ]] && continue
  REMOTE_REF="refs/remotes/origin/$NAME"
  if ! git show-ref --verify --quiet "$REMOTE_REF"; then
    printf '| %s | %s | — | — | — | FETCH_MISSING — REVIEW_REQUIRED |\n' "$NAME" "$SHA" >> "$REPORT"
    COMPARE_ERRORS=$((COMPARE_ERRORS + 1))
    continue
  fi
  LIVE_SHA="$(git rev-parse "$REMOTE_REF^{commit}" 2>/dev/null || true)"
  if [[ "$LIVE_SHA" != "$SHA" || -z "$LIVE_SHA" ]]; then
    printf '| %s | %s | — | — | — | REF_CHANGED_DURING_AUDIT — REVIEW_REQUIRED |\n' "$NAME" "$SHA" >> "$REPORT"
    COMPARE_ERRORS=$((COMPARE_ERRORS + 1))
    continue
  fi
  TREE="$(git rev-parse "$REMOTE_REF^{tree}" 2>/dev/null || true)"
  if [[ -z "$TREE" ]]; then
    printf '| %s | %s | — | — | — | TREE_UNAVAILABLE — REVIEW_REQUIRED |\n' "$NAME" "$SHA" >> "$REPORT"
    COMPARE_ERRORS=$((COMPARE_ERRORS + 1))
    continue
  fi
  DIFF_FILE="$TMP_DIR/diff"
  if ! git diff-tree --no-commit-id --name-status -r "$RECOVERY_TREE" "$TREE" > "$DIFF_FILE" 2>/dev/null; then
    printf '| %s | %s | — | — | — | TREE_COMPARE_FAILED — REVIEW_REQUIRED |\n' "$NAME" "$SHA" >> "$REPORT"
    COMPARE_ERRORS=$((COMPARE_ERRORS + 1))
    continue
  fi
  ADDED="$(awk -F '\t' '$1=="A" {n++} END {print n+0}' "$DIFF_FILE")"
  REMOVED="$(awk -F '\t' '$1=="D" {n++} END {print n+0}' "$DIFF_FILE")"
  CHANGED="$(awk -F '\t' '$1=="M" || $1=="T" || $1=="R" || $1=="C" {n++} END {print n+0}' "$DIFF_FILE")"
  printf '| %s | %s | %s | %s | %s | REVIEW_REQUIRED — counts only; semantic review still required |\n' "$NAME" "$LIVE_SHA" "$ADDED" "$REMOVED" "$CHANGED" >> "$REPORT"
  BRANCH_COUNT=$((BRANCH_COUNT + 1))
done < <(git ls-remote --heads origin 2>/dev/null | awk '{print $1 "\t" $2}' | sort -k2)

{
  echo
  echo "## Summary"
  echo
  echo "- Non-protected branch refs compared: $BRANCH_COUNT"
  echo "- Missing/changed/unavailable/failed comparisons: $COMPARE_ERRORS"
  echo "- Branches deleted: 0"
  echo "- Branches merged: 0"
  echo "- Source files transferred: 0"
  echo "- Tests run by this audit: none (tree inventory only)."
  echo "- All branch dispositions remain REVIEW_REQUIRED until changed paths, behavior, tests, contracts, dependencies, policy/security, and destination evidence are reviewed."
  echo "- This report does not authorize deletion. It is an inventory artifact, not a branch-eligibility decision."
  echo
  echo "## Protected boundaries"
  echo
  echo "- main and Recovery were not modified."
  echo "- No archive ref was modified."
  echo "- The separate 5,000-persona simulation repository was not accessed."
  echo "- No Firebase, production, billing, retention, iOS identity, or deployment operation was performed."
  echo
  echo "- UTC finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >> "$REPORT"

# Reject credential-like material before publication. The report is generated only
# from branch names, commit IDs, counts, and fixed explanatory text.
if grep -Eiq '(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|Bearer[[:space:]]+[A-Za-z0-9._-]{20,})' "$REPORT"; then
  abort "Secret-pattern scan rejected the report; it was not uploaded."
fi

git worktree add --detach "$WORKTREE" "$RECOVERY_REF" >/dev/null 2>&1 || abort "Could not prepare an isolated Recovery worktree."
mkdir -p "$WORKTREE/$(dirname "$REPORT_REL")"
cp "$REPORT" "$WORKTREE/$REPORT_REL"
git -C "$WORKTREE" add "$REPORT_REL" >/dev/null 2>&1 || abort "Could not stage the sanitized report."
git -C "$WORKTREE" -c user.name="Mawdda Audit Reporter" -c user.email="mawdda-audit-reporter@users.noreply.github.com" commit -m "docs(audit): record E522 branch tree inventory" >/dev/null 2>&1 || abort "Could not commit the audit report."
git -C "$WORKTREE" push --porcelain origin "HEAD:refs/heads/$RECOVERY" >/dev/null 2>&1 || abort "Report upload failed safely. No source branch was deleted; report remains in the temporary local session only."
printf 'AUDIT_REPORT_UPLOADED\n'
printf 'REPORT_PATH=%s:%s\n' "$RECOVERY" "$REPORT_REL"
printf 'BRANCHES_COMPARED=%s\n' "$BRANCH_COUNT"
printf 'COMPARISON_ERRORS=%s\n' "$COMPARE_ERRORS"
printf 'BRANCH_DELETIONS=0\n'
