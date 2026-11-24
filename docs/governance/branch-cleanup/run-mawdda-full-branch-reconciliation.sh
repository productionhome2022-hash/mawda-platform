#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

REPO="productionhome2022-hash/mawda-platform"
RECOVERY="codex/mawda-recovery-integration-2026-11-21"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="${HOME}/mawda-reconciliation"
WORK="${BASE}/work"
REPORT_DIR="${BASE}/reports"
REPORT="${REPORT_DIR}/MAWDDA-BRANCH-RECONCILIATION-${STAMP}.md"
REMOTE="https://github.com/${REPO}.git"

mkdir -p "$BASE" "$REPORT_DIR"
rm -rf "$WORK"
echo "MAWDDA_RECONCILIATION_START=$STAMP"

if ! GIT_TERMINAL_PROMPT=0 git clone --quiet --no-single-branch "$REMOTE" "$WORK"; then
  echo "STOP=CLONE_FAILED"
  exit 10
fi
cd "$WORK"

git fetch --quiet origin '+refs/heads/*:refs/remotes/origin/*'
RECOVERY_REF="refs/remotes/origin/$RECOVERY"
MAIN_REF="refs/remotes/origin/main"
if ! git show-ref --verify --quiet "$RECOVERY_REF"; then
  echo "STOP=RECOVERY_BRANCH_MISSING"
  exit 11
fi

RECOVERY_SHA="$(git rev-parse "$RECOVERY_REF")"
MAIN_SHA="MISSING"
if git show-ref --verify --quiet "$MAIN_REF"; then MAIN_SHA="$(git rev-parse "$MAIN_REF")"; fi

{
  echo "# Mawdda full branch reconciliation"
  echo
  echo "- Generated UTC: $STAMP"
  echo "- Repository: $REPO"
  echo "- Destination: $RECOVERY"
  echo "- Recovery SHA at audit: $RECOVERY_SHA"
  echo "- Main SHA observed: $MAIN_SHA"
  echo "- Scope: every fetched live codex branch, plus protected reference observations"
  echo "- Method: direct tree comparison against Recovery, merge-base commit comparison, changed-path inventory"
  echo
  echo "## Safety and execution boundary"
  echo
  echo "- This run is inventory and reconciliation evidence only."
  echo "- No source code was merged or copied."
  echo "- No branch was deleted or modified."
  echo "- No production, Firebase, billing, or deployment resource was accessed."
  echo "- Branch deletion eligibility must be decided only after semantic review and destination verification."
  echo
  echo "## Branch inventory"
  echo
  echo "| Branch | Source SHA | Merge-base | Ahead | Behind | Direct changed paths | Tree status |"
  echo "|---|---|---|---:|---:|---:|---|"
} > "$REPORT"

BRANCH_LIST="$BASE/branches.txt"
git for-each-ref --format='%(refname:short)' "refs/remotes/origin/codex/" | sed 's#^origin/##' | sort > "$BRANCH_LIST"
TOTAL="$(wc -l < "$BRANCH_LIST" | tr -d ' ')"
echo "- Live codex branches scanned: $TOTAL" >> "$REPORT"
echo >> "$REPORT"

while IFS= read -r NAME; do
  [ -n "$NAME" ] || continue
  REF="refs/remotes/origin/$NAME"
  SHA="$(git rev-parse "$REF")"
  MB="$(git merge-base "$RECOVERY_REF" "$REF" 2>/dev/null || true)"
  AHEAD="NA"
  BEHIND="NA"
  if [ -n "$MB" ]; then
    AHEAD="$(git rev-list --count "$MB..$REF")"
    BEHIND="$(git rev-list --count "$MB..$RECOVERY_REF")"
  fi
  DIFF="$BASE/diff.txt"
  git diff --no-ext-diff --no-renames --name-status "$RECOVERY_REF" "$REF" > "$DIFF"
  COUNT="$(wc -l < "$DIFF" | tr -d ' ')"
  if [ "$COUNT" -eq 0 ]; then STATUS="IDENTICAL_TREE"
  elif [ -z "$MB" ]; then STATUS="UNRELATED_HISTORY_TREE_DIFF"
  else STATUS="TREE_DIFF_REQUIRES_REVIEW"
  fi
  printf '| `%s` | `%s` | `%s` | %s | %s | %s | %s |\n' "$NAME" "$SHA" "${MB:-NONE}" "$AHEAD" "$BEHIND" "$COUNT" "$STATUS" >> "$REPORT"
done < "$BRANCH_LIST"

{
  echo
  echo "## Per-branch changed paths and blob evidence"
  echo
  echo "The following records contain path names and blob identifiers only; source contents and credentials are never copied into this report."
  echo
} >> "$REPORT"

while IFS= read -r NAME; do
  [ -n "$NAME" ] || continue
  REF="refs/remotes/origin/$NAME"
  SHA="$(git rev-parse "$REF")"
  DIFF="$BASE/diff.txt"
  git diff --no-ext-diff --no-renames --name-status "$RECOVERY_REF" "$REF" > "$DIFF"
  echo "### $NAME" >> "$REPORT"
  echo >> "$REPORT"
  echo "- Source SHA: `$SHA`" >> "$REPORT"
  echo >> "$REPORT"
  if [ ! -s "$DIFF" ]; then
    echo "No direct tree differences from Recovery." >> "$REPORT"
  else
    echo "| Status | Path | Source blob | Recovery blob |" >> "$REPORT"
    echo "|---|---|---|---|" >> "$REPORT"
    while IFS="$(printf '\t')" read -r STATUS PATHNAME; do
      [ -n "$PATHNAME" ] || continue
      SRC_BLOB="$(git rev-parse "$REF:$PATHNAME" 2>/dev/null || echo MISSING)"
      DST_BLOB="$(git rev-parse "$RECOVERY_REF:$PATHNAME" 2>/dev/null || echo MISSING)"
      SAFE_PATH="$(printf '%s' "$PATHNAME" | sed 's/|/%7C/g; s/\`/%60/g')"
      printf '| %s | `%s` | `%s` | `%s` |\n' "$STATUS" "$SAFE_PATH" "$SRC_BLOB" "$DST_BLOB" >> "$REPORT"
    done < "$DIFF"
  fi
  echo >> "$REPORT"
done < "$BRANCH_LIST"

{
  echo "## Required semantic review"
  echo
  echo "Direct tree differences do not establish feature value, safety, completeness, or mergeability. Before any transfer, inspect callers, models, services, backend contracts, Firestore rules, Cloud Functions, authorization, economic invariants, retention policy, platform identity, and tests."
  echo
  echo "Classify each differing path or cohesive feature as one of:"
  echo
  echo "1. Already present in Recovery (no transfer)."
  echo "2. Unique and safe to port with dependencies and tests."
  echo "3. Cohesive branch suitable for a reviewed full integration."
  echo "4. Duplicate, obsolete, or superseded (document disposition)."
  echo "5. Blocked by security, owner decision, policy, or missing contract."
  echo
  echo "## Deletion gate"
  echo
  echo "No branch is authorized for deletion by this report alone. A branch can enter a deletion batch only after every changed path has a documented disposition, all required changes are verified in Recovery, exact live branch SHA is rechecked, and the owner-approved deletion policy is satisfied."
  echo
  echo "## Secret-safety check"
  echo
  echo "Only branch names, commit IDs, paths, counts, and blob IDs are included. No environment variables, credential files, remote URLs containing credentials, source contents, or command output are included."
} >> "$REPORT"

# Block publication if common credential/token signatures somehow appear.
if grep -Eqi '(github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})' "$REPORT"; then
  echo "STOP=REPORT_SECRET_PATTERN_DETECTED"
  exit 12
fi

DEST="docs/audit/branch-reconciliation/MAWDDA-BRANCH-RECONCILIATION-$STAMP.md"
mkdir -p "$(dirname "$DEST")"
cp "$REPORT" "$DEST"
git add "$DEST"
git -c user.name="Mawdda Reconciliation Reporter" -c user.email="mawdda-reconciliation@users.noreply.github.com" commit -m "docs(audit): full branch reconciliation $STAMP" >/dev/null

if ! GIT_TERMINAL_PROMPT=0 git push origin "HEAD:refs/heads/$RECOVERY"; then
  echo "UPLOAD_FAILED=GITHUB_REJECTED_PUSH"
  echo "LOCAL_REPORT=$REPORT"
  exit 13
fi

echo "AUDIT_COMPLETE"
echo "BRANCHES_SCANNED=$TOTAL"
echo "REPORT_PATH=$DEST"
echo "REPORT_URL=https://github.com/$REPO/blob/$RECOVERY/$DEST"
echo "REPORT_COMMIT=$(git rev-parse HEAD)"
