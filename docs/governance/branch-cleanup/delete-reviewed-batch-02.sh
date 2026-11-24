#!/usr/bin/env bash
# Delete only the eleven individually reviewed refs in batch 02.
# Every target is checked against its exact reviewed SHA before any deletion.
# main, Recovery, all archive refs, and the separate simulation repository are excluded.
set -Eeuo pipefail

REPO="productionhome2022-hash/mawda-platform"
RECOVERY="codex/mawda-recovery-integration-2026-11-21"
MIN_RECOVERY_SHA="f733493833a1bf1557faf628bdb7d362b71b7103"
EXPECTED_MAIN_SHA="a2dfa7e75352eeb6b8d5029a8e5838fb271b924f"
EXPECTED_X_ARCHIVE_SHA="e2883ca4d73285ccc7428a57e4624f923c637865"
REPORT_REL="docs/governance/branch-cleanup/BRANCH_DELETION_BATCH_02_2026-11-23.md"

BRANCHES=$(cat <<'EOF'
codex/phase1-group-call-remainder-to-initiator-2026-11-20|99639a6c7adf25c32eca6b93c0cc393d130f8e8f
codex/phase1-media-direct-delivery-denials-2026-11-20|b72522af9c3eaf7e4c3585514c23c53e5cfa9f7e
codex/phase1-media-hold-delete-race-2026-11-20|43471705e469f09e55658660b8b9f921401a00d4
codex/phase1-media-scanner-replay-regression-2026-11-20|87ff3963868a4431948274695c83dce255aaa350
codex/phase1-media-scanner-verdict-tests-2026-11-20|6da140cbcd359c17805477e81401bfacef7268f0
codex/phase1-rented-room-call-gate-2026-11-20|41dc2c2fd679f736d48f912c1e248f8615554649
codex/phase1-scanner-error-callback-test-2026-11-20|20519494a898b19f08bcaf4f22e4af64acff622b
codex/phase1-store-gift-concurrency-2026-11-20|2f175165ed17a1a02b47439bacfbb187b1e00d6e
codex/phase1-store-gift-permanent-entitlement-2026-11-20|b4546e69543b70a08b4e50c678316ac848c70c06
codex/phase1-store-gifting-catalog-version-regressions-2026-11-20|3c8ab48d320e3a4b827d4c3eca558691d6c01c75
codex/mawdda-role-callable-deny-regressions-2026-11-20|ce899717f77ad3c76d676903aa0c026ba7596490
EOF
)

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" ]]; then
  echo "ABORTED: run inside the local mawda-platform Git repository."
  exit 1
fi
cd "$ROOT"
REPORT_TMP="$(mktemp -t mawda-batch02-report.XXXXXX)"
STARTED_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
DELETED_COUNT=0
FAILED_COUNT=0

log() { printf '%s\n' "$*" | tee -a "$REPORT_TMP"; }

publish_report() {
  WT_PARENT="$(mktemp -d -t mawda-batch02-publish.XXXXXX)"
  WT="$WT_PARENT/recovery-report"
  if ! git fetch origin "refs/heads/$RECOVERY:refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1; then
    rmdir "$WT_PARENT" 2>/dev/null || true
    return 1
  fi
  if ! git worktree add --detach "$WT" "refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1; then
    rmdir "$WT_PARENT" 2>/dev/null || true
    return 1
  fi
  mkdir -p "$WT/docs/governance/branch-cleanup"
  cp "$REPORT_TMP" "$WT/$REPORT_REL"
  if ! git -C "$WT" add "$REPORT_REL"; then
    git worktree remove --force "$WT" >/dev/null 2>&1 || true
    rmdir "$WT_PARENT" 2>/dev/null || true
    return 1
  fi
  if ! git -C "$WT" -c user.name="Mawdda Governance Reporter" -c user.email="mawdda-governance-reporter@users.noreply.github.com" commit -m "docs(governance): record reviewed branch deletion batch 02" >> "$REPORT_TMP" 2>&1; then
    git worktree remove --force "$WT" >/dev/null 2>&1 || true
    rmdir "$WT_PARENT" 2>/dev/null || true
    return 1
  fi
  ATTEMPT=1
  while [[ "$ATTEMPT" -le 3 ]]; do
    if git -C "$WT" push origin "HEAD:refs/heads/$RECOVERY" >> "$REPORT_TMP" 2>&1; then
      git worktree remove --force "$WT" >/dev/null 2>&1 || true
      rmdir "$WT_PARENT" 2>/dev/null || true
      return 0
    fi
    if ! git fetch origin "refs/heads/$RECOVERY:refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1; then
      break
    fi
    if ! git -C "$WT" rebase "refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1; then
      break
    fi
    ATTEMPT=$((ATTEMPT + 1))
  done
  git worktree remove --force "$WT" >/dev/null 2>&1 || true
  rmdir "$WT_PARENT" 2>/dev/null || true
  return 1
}

finish() {
  STATUS=$?
  trap - EXIT
  {
    echo
    echo "## Final execution summary"
    echo "- Started UTC: $STARTED_UTC"
    echo "- Finished UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "- Verified deletions: $DELETED_COUNT / 11"
    echo "- Failed deletions/verifications: $FAILED_COUNT"
    echo "- Script exit status: $STATUS"
    echo "- Report upload target: $RECOVERY:$REPORT_REL"
  } >> "$REPORT_TMP"
  if publish_report; then
    echo "REPORT_UPLOADED: $RECOVERY:$REPORT_REL"
  else
    cp "$REPORT_TMP" "$HOME/mawda-batch-02-report-2026-11-23.md"
    echo "REPORT_UPLOAD_FAILED: local report preserved at $HOME/mawda-batch-02-report-2026-11-23.md"
  fi
  rm -f "$REPORT_TMP"
  exit "$STATUS"
}
trap finish EXIT

# SAFETY HOLD: direct source-tree-to-Recovery comparisons found additional
# same-path blob differences beyond the merge-base compare file lists.
{
  echo "# Branch deletion batch 02 — 2026-11-23"
  echo
  echo "- Status: SUSPENDED — no refs may be deleted by this script."
  echo "- Reason: full direct-tree reconciliation is incomplete."
  echo "- Protected main remains outside this operation."
  echo
} > "$REPORT_TMP"
log "ABORTED: batch 02 deletion is suspended pending full direct-tree reconciliation. No branch refs will be changed."
exit 3

{
  echo "# Branch deletion batch 02 — 2026-11-23"
  echo
  echo "- Repository: $REPO"
  echo "- Target branch: $RECOVERY"
  echo "- Expected protected main SHA: $EXPECTED_MAIN_SHA"
  echo "- Expected X archive SHA: $EXPECTED_X_ARCHIVE_SHA"
  echo "- Minimum reviewed Recovery checkpoint: $MIN_RECOVERY_SHA"
  echo "- Allowlist size: 11"
  echo
  echo "## Preflight"
} > "$REPORT_TMP"

ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
[[ "$ORIGIN" == *"$REPO"* ]] || { log "ABORTED: origin does not identify the approved repository."; exit 1; }
[[ "$(git branch --show-current)" == "$RECOVERY" ]] || { log "ABORTED: checkout the Recovery branch before running."; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { log "ABORTED: working tree is not clean; no refs were changed."; exit 1; }

git fetch origin "refs/heads/$RECOVERY:refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1 || { log "ABORTED: could not fetch Recovery."; exit 1; }
git fetch origin "refs/heads/archive/X-frozen-branches-2026-11-23:refs/remotes/origin/archive/X-frozen-branches-2026-11-23" >> "$REPORT_TMP" 2>&1 || { log "ABORTED: could not fetch frozen X archive."; exit 1; }

REMOTE_RECOVERY="$(git ls-remote origin "refs/heads/$RECOVERY" | awk 'NR==1 {print $1}')"
REMOTE_MAIN="$(git ls-remote origin refs/heads/main | awk 'NR==1 {print $1}')"
REMOTE_ARCHIVE="$(git ls-remote origin refs/heads/archive/X-frozen-branches-2026-11-23 | awk 'NR==1 {print $1}')"
[[ -n "$REMOTE_RECOVERY" ]] || { log "ABORTED: Recovery ref is missing."; exit 1; }
[[ "$REMOTE_MAIN" == "$EXPECTED_MAIN_SHA" ]] || { log "ABORTED: main changed from its approved SHA."; exit 1; }
[[ "$REMOTE_ARCHIVE" == "$EXPECTED_X_ARCHIVE_SHA" ]] || { log "ABORTED: frozen X archive ref changed."; exit 1; }
git merge-base --is-ancestor "$MIN_RECOVERY_SHA" "$REMOTE_RECOVERY" || { log "ABORTED: Recovery is not a descendant of the reviewed checkpoint."; exit 1; }
git merge --ff-only "refs/remotes/origin/$RECOVERY" >> "$REPORT_TMP" 2>&1 || { log "ABORTED: local Recovery could not fast-forward safely."; exit 1; }
[[ "$(git rev-parse HEAD)" == "$REMOTE_RECOVERY" ]] || { log "ABORTED: local Recovery does not match the live remote head."; exit 1; }

ARCHIVE_PARENTS="$(git show -s --format=%P refs/remotes/origin/archive/X-frozen-branches-2026-11-23)"
log "- Live Recovery SHA: $REMOTE_RECOVERY"
log "- Live main SHA: $REMOTE_MAIN"
log "- Frozen X archive SHA: $REMOTE_ARCHIVE"
log "- Protected refs and Recovery ancestry: PASS"
while IFS='|' read -r NAME EXPECTED; do
  [[ -n "$NAME" ]] || continue
  [[ " $ARCHIVE_PARENTS " == *" $EXPECTED "* ]] || { log "ABORTED: reviewed source tip is not preserved as an X archive parent: $NAME"; exit 1; }
done <<< "$BRANCHES"
log "- All eleven reviewed source tips are preserved as X archive parents: PASS"

check_blob() {
  ACTUAL="$(git rev-parse "$REMOTE_RECOVERY:$1" 2>/dev/null || true)"
  [[ "$ACTUAL" == "$2" ]] || { log "ABORTED: destination evidence blob mismatch: $1"; exit 1; }
}
check_blob "docs/audit/forensic/MAWDA_COMPLETE_FORENSIC_2026-11-22_20261123-001313.md" "681b4ee7b87c8bdcca612ec05b8046e39805d57c"
check_blob "docs/audit/forensic/MAWDA_FORENSIC_2026-11-22_20261122-235811.md" "7ea11a3ab4d2ad0b06d19d9d336376f228bb183b"
check_blob "docs/PHASE1_SPECIALIZED_CALLABLE_AUTH_AUDIT_2026-11-20.md" "2c7187d39d7b11a8e7620759700a6c98b434888e"
check_blob "docs/phase1/GITHUB_BRANCH_GOVERNANCE_AUDIT_2026-11-20.md" "4e32d4588de228c4c46529f3f5b018ccad9117df"
check_blob "docs/PHASE1_PHASE2_CLOSURE_MATRIX.md" "f339685dddf79cd5ba52b8edb95cb331b2648580"
check_blob "docs/phase1/SPECIALIZED_CALLABLE_AUTHORIZATION_INVENTORY_2026-11-20.md" "46d97b157d8d37d6da1f0a1a5c01697a7fd7bb08"
check_blob "docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md" "5c35c8fe6874b1830c5583af8eb132a2b7416a7a"
log "- All six destination evidence blobs match their reviewed SHAs: PASS"

while IFS='|' read -r NAME EXPECTED; do
  [[ -n "$NAME" ]] || continue
  [[ "$NAME" != "main" && "$NAME" != "$RECOVERY" && "$NAME" != archive/* ]] || { log "ABORTED: protected ref appeared in allowlist."; exit 1; }
  ACTUAL="$(git ls-remote origin "refs/heads/$NAME" | awk 'NR==1 {print $1}')"
  [[ "$ACTUAL" == "$EXPECTED" ]] || { log "ABORTED: SHA mismatch for $NAME; no deletion started."; exit 1; }
done <<< "$BRANCHES"
log "- All eleven live source heads match the reviewed SHAs: PASS"
log
log "## Per-branch deletion"

while IFS='|' read -r NAME EXPECTED; do
  [[ -n "$NAME" ]] || continue
  if git push --porcelain --force-with-lease="refs/heads/$NAME:$EXPECTED" origin ":refs/heads/$NAME" >> "$REPORT_TMP" 2>&1; then
    AFTER="$(git ls-remote origin "refs/heads/$NAME" | awk 'NR==1 {print $1}')"
    if [[ -z "$AFTER" ]]; then
      log "- DELETED and independently verified absent: $NAME (reviewed SHA $EXPECTED)"
      DELETED_COUNT=$((DELETED_COUNT + 1))
    else
      log "- FAILED verification: $NAME remains at $AFTER"
      FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
  else
    log "- DELETE FAILED: $NAME (reviewed SHA $EXPECTED)"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
done <<< "$BRANCHES"

FINAL_MAIN="$(git ls-remote origin refs/heads/main | awk 'NR==1 {print $1}')"
FINAL_ARCHIVE="$(git ls-remote origin refs/heads/archive/X-frozen-branches-2026-11-23 | awk 'NR==1 {print $1}')"
FINAL_RECOVERY="$(git ls-remote origin "refs/heads/$RECOVERY" | awk 'NR==1 {print $1}')"
log
log "## Final protected-ref verification"
log "- main: $FINAL_MAIN (expected $EXPECTED_MAIN_SHA)"
log "- Frozen X archive: $FINAL_ARCHIVE (expected $EXPECTED_X_ARCHIVE_SHA)"
log "- Recovery before report publication: $FINAL_RECOVERY"
[[ "$FINAL_MAIN" == "$EXPECTED_MAIN_SHA" ]] || { log "FAILED: main changed during this batch."; FAILED_COUNT=$((FAILED_COUNT + 1)); }
[[ "$FINAL_ARCHIVE" == "$EXPECTED_X_ARCHIVE_SHA" ]] || { log "FAILED: frozen X archive changed during this batch."; FAILED_COUNT=$((FAILED_COUNT + 1)); }
[[ "$FINAL_RECOVERY" == "$REMOTE_RECOVERY" ]] || { log "FAILED: Recovery changed unexpectedly during deletion."; FAILED_COUNT=$((FAILED_COUNT + 1)); }

if [[ "$DELETED_COUNT" -ne 11 || "$FAILED_COUNT" -ne 0 ]]; then
  log "BATCH RESULT: PARTIAL OR FAILED — inspect each ref result; do not rerun blindly."
  exit 2
fi
log "BATCH RESULT: PASS — 11/11 reviewed refs deleted and verified absent."
