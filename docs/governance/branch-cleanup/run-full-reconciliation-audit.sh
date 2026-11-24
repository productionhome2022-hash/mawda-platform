#!/usr/bin/env bash
# Read-only full direct-tree reconciliation for every codex source branch.
# Produces a secret-safe report and publishes it to the approved Recovery branch.
set -Eeuo pipefail

REPO="productionhome2022-hash/mawda-platform"
RECOVERY="codex/mawda-recovery-integration-2026-11-21"
REPORT_REL="docs/audit/branch-reconciliation/$(date -u +%Y%m%dT%H%M%SZ)-DIRECT-TREE-RECONCILIATION.md"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" ]]; then
  echo "ABORTED: run inside the local mawda-platform Git repository."
  exit 1
fi
cd "$ROOT"

ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
case "$ORIGIN" in
  *github.com*productionhome2022-hash/mawda-platform*) ;;
  *) echo "ABORTED: origin is not the approved Mawdda repository."; exit 1 ;;
esac

# Fetch refs without printing remote URLs or credential-bearing diagnostics.
if ! git fetch --prune origin '+refs/heads/*:refs/remotes/origin/*' >/dev/null 2>&1; then
  echo "ABORTED: fetch failed; no repository refs were changed."
  exit 1
fi

RECOVERY_REF="refs/remotes/origin/$RECOVERY"
if ! git rev-parse --verify "$RECOVERY_REF^{commit}" >/dev/null 2>&1; then
  echo "ABORTED: approved Recovery ref is unavailable."
  exit 1
fi
RECOVERY_SHA="$(git rev-parse "$RECOVERY_REF")"
MAIN_SHA="$(git rev-parse refs/remotes/origin/main 2>/dev/null || echo MISSING)"
ARCHIVE_SHA="$(git rev-parse refs/remotes/origin/archive/X-frozen-branches-2026-11-23 2>/dev/null || echo MISSING)"

REPORT_TMP="$(mktemp -t mawda-direct-tree-audit.XXXXXX)"
STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cleanup(){ rm -f "$REPORT_TMP"; }
trap cleanup EXIT

{
  echo "# Mawdda direct-tree branch reconciliation"
  echo
  echo "- Started UTC: $STARTED"
  echo "- Repository: $REPO"
  echo "- Destination: $RECOVERY"
  echo "- Recovery SHA: $RECOVERY_SHA"
  echo "- Protected main SHA (observed only): $MAIN_SHA"
  echo "- Frozen X archive SHA (observed only): $ARCHIVE_SHA"
  echo "- Mode: read-only source inspection; no source branch deletion or code transfer"
  echo "- Scope: all live codex/* branches fetched from origin"
  echo
  echo "## Method"
  echo
  echo "For each source branch, compare the complete Git tree directly against Recovery using git diff. This is distinct from merge-base commit comparison. Every changed path is recorded with source and destination blob IDs where available."
  echo
} > "$REPORT_TMP"

BRANCH_LIST_TMP="$(mktemp -t mawda-branch-list.XXXXXX)"
git for-each-ref --format='%(refname:short)' refs/remotes/origin/codex/ | sed 's#^origin/##' | sort > "$BRANCH_LIST_TMP"
BRANCHES=()
while IFS= read -r BRANCH_NAME; do
  [[ -n "$BRANCH_NAME" ]] && BRANCHES+=("$BRANCH_NAME")
done < "$BRANCH_LIST_TMP"
rm -f "$BRANCH_LIST_TMP"
TOTAL="${#BRANCHES[@]}"
echo "- Live codex branch count: $TOTAL" >> "$REPORT_TMP"
echo >> "$REPORT_TMP"

for NAME in "${BRANCHES[@]}"; do
  SRC_REF="refs/remotes/origin/$NAME"
  SRC_SHA="$(git rev-parse "$SRC_REF")"
  if git merge-base --is-ancestor "$SRC_REF" "$RECOVERY_REF"; then
    ANCESTRY="source-is-ancestor-of-Recovery"
  elif git merge-base --is-ancestor "$RECOVERY_REF" "$SRC_REF"; then
    ANCESTRY="source-descends-from-Recovery"
  else
    ANCESTRY="diverged"
  fi

  DIFF_FILE="$(mktemp -t mawda-branch-diff.XXXXXX)"
  git diff --no-ext-diff --no-renames --name-status "$RECOVERY_REF" "$SRC_REF" > "$DIFF_FILE"
  CHANGED="$(wc -l < "$DIFF_FILE" | tr -d ' ')"

  {
    echo "### $NAME"
    echo
    echo "- Source SHA: $SRC_SHA"
    echo "- Recovery SHA: $RECOVERY_SHA"
    echo "- Ancestry: $ANCESTRY"
    echo "- Direct tree differing paths: $CHANGED"
    if [[ "$CHANGED" -eq 0 ]]; then
      echo "- Direct tree result: identical trees."
    else
      echo
      echo "| Status | Path | Source blob | Recovery blob |"
      echo "|---|---|---|---|"
      while IFS=$'\t' read -r STATUS FILE; do
        [[ -n "${FILE:-}" ]] || continue
        SRC_BLOB="$(git rev-parse "$SRC_REF:$FILE" 2>/dev/null || echo MISSING)"
        DST_BLOB="$(git rev-parse "$RECOVERY_REF:$FILE" 2>/dev/null || echo MISSING)"
        SAFE_FILE="${FILE//|/\\|}"
        echo "| $STATUS | `$SAFE_FILE` | `$SRC_BLOB` | `$DST_BLOB` |"
      done < "$DIFF_FILE"
    fi
    echo
  } >> "$REPORT_TMP"
  rm -f "$DIFF_FILE"
done

{
  echo "## Safety conclusions"
  echo
  echo "- This report does not itself authorize deletion."
  echo "- A differing file is only a candidate for semantic review; it is not automatically a feature worth porting."
  echo "- Files that differ must be inspected with their callers, server contracts, authorization, data model, tests, and current Recovery equivalents."
  echo "- Branch deletion remains blocked until every source-only or differing implementation has a documented keep/port/superseded/reject disposition and the archive evidence is verified."
  echo "- No main, Recovery, archive, Firebase, production, billing, or simulation-lab resources were modified by this audit."
  echo
  echo "- Finished UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >> "$REPORT_TMP"

# Publish the report using a detached worktree based on the current remote Recovery.
WT_PARENT="$(mktemp -d -t mawda-audit-publish.XXXXXX)"
WT="$WT_PARENT/recovery"
if ! git fetch origin "refs/heads/$RECOVERY:refs/remotes/origin/$RECOVERY" >/dev/null 2>&1; then
  cp "$REPORT_TMP" "$HOME/mawda-direct-tree-reconciliation-report.md"
  echo "REPORT_UPLOAD_FAILED: saved locally at $HOME/mawda-direct-tree-reconciliation-report.md"
  exit 2
fi
LATEST_RECOVERY="$(git rev-parse "refs/remotes/origin/$RECOVERY")"
if ! git worktree add --detach "$WT" "$LATEST_RECOVERY" >/dev/null 2>&1; then
  cp "$REPORT_TMP" "$HOME/mawda-direct-tree-reconciliation-report.md"
  echo "REPORT_UPLOAD_FAILED: saved locally at $HOME/mawda-direct-tree-reconciliation-report.md"
  exit 2
fi
mkdir -p "$WT/$(dirname "$REPORT_REL")"
cp "$REPORT_TMP" "$WT/$REPORT_REL"
git -C "$WT" add "$REPORT_REL"
git -C "$WT" -c user.name="Mawdda Reconciliation Reporter" -c user.email="mawdda-reconciliation@users.noreply.github.com" commit -m "docs(audit): record full direct-tree branch reconciliation" >/dev/null 2>&1

PUBLISHED=0
for attempt in 1 2 3; do
  if git -C "$WT" push origin "HEAD:refs/heads/$RECOVERY" >/dev/null 2>&1; then
    PUBLISHED=1
    break
  fi
  if ! git fetch origin "refs/heads/$RECOVERY:refs/remotes/origin/$RECOVERY" >/dev/null 2>&1; then
    break
  fi
  if ! git -C "$WT" rebase "refs/remotes/origin/$RECOVERY" >/dev/null 2>&1; then
    break
  fi
done

git worktree remove --force "$WT" >/dev/null 2>&1 || true
rmdir "$WT_PARENT" 2>/dev/null || true

if [[ "$PUBLISHED" -eq 1 ]]; then
  echo "AUDIT_COMPLETE"
  echo "BRANCHES_SCANNED=$TOTAL"
  echo "REPORT_PATH=$RECOVERY:$REPORT_REL"
  echo "REPORT_URL=https://github.com/$REPO/blob/$RECOVERY/$REPORT_REL"
else
  cp "$REPORT_TMP" "$HOME/mawda-direct-tree-reconciliation-report.md"
  echo "REPORT_UPLOAD_FAILED: saved locally at $HOME/mawda-direct-tree-reconciliation-report.md"
  exit 2
fi
