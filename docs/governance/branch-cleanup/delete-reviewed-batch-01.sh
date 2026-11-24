#!/usr/bin/env bash
# Owner-authorized deletion of the first 17 reviewed ancestor branches.
# This script deletes ONLY the explicit allowlist below, using force-with-lease
# against each reviewed SHA. It never targets main, Recovery, or archive refs.
set -Eeuo pipefail

REPO="productionhome2022-hash/mawda-platform"
RECOVERY="codex/mawda-recovery-integration-2026-11-21"
MIN_RECOVERY_SHA="1f48e408db346b1b2ced9d3df527094d634705e3"
EXPECTED_MAIN_SHA="a2dfa7e75352eeb6b8d5029a8e5838fb271b924f"
REPORT="docs/governance/branch-cleanup/BRANCH_DELETION_BATCH_01_2026-11-23.md"

BRANCHES=$(cat <<'EOF'
codex/biometric-final-owner-policy-2026-11-20|08ffcf8d9435cdc1b295aba35ff6b3bc7eac4d23
codex/biometric-final-policy-drift-closure-2026-11-20|0089c556a7e241454cfbfb3223fff500cc8763bb
codex/biometric-manual-review-gate-2026-11-20|a82a0614f7526bfb56c6bcc93764a5b907406e95
codex/biometric-video-duration-validation-2026-11-20|be9b8109c8ae4b62a0b17e9b70a851307a3294f6
codex/mawdda-audit-archive-full|5fb2b28dd8e37c933fc0be722d7f6b5bfa276a47
codex/mawdda-deep-audit-profile-store|4ed7394235ea531e4b4abbb24431731da15eaf47
codex/mawdda-mfa-signin|607647ec0325eaf56bd58a4c2283aedaa47e7e68
codex/mawdda-native-platform-scaffold|d556a9990ffe4472fe86ab48acc696adc9c109f6
codex/mawdda-phase1-unified-2026-11-19|e12897ad7dc5f383501d997117fb1211c67632e7
codex/mawdda-pr3-port|6e11d5a631d61f9e92b37fd64c827f37ec8e9c11
codex/mawdda-premium-features|f3884061a5d7be3836adc6d6b94de10e534625ab
codex/mawdda-safety-ui|1e4c6aa97a679d0eaa88708571341e79e9e06c68
codex/phase1-advertising-callable-auth-2026-11-20|d857497c50eca8d7dcf105e938c8060402ae85e3
codex/phase1-integration-batch-01-inventory-2026-11-19|2fff6276055de44bc488cc123cec16491421a8e6
codex/production-readiness-tests|424599a34acc9ec33b4e759ba166dc6d0a9df04d
codex/mawdda-unified-final-v2|e249c664f9a48dd8a198e274b38033a7cbba0a3d
codex/mawdda-unified-final-v3|ab5e37e6d7f437a491e85883b91e8bcde76d438e
EOF
)

die() {
  printf 'ABORTED: %s\n' "$*" >&2
  if [[ -n "${REPORT_TMP:-}" && -f "$REPORT_TMP" ]]; then
    printf '\nABORTED: %s\n' "$*" >> "$REPORT_TMP"
  fi
  exit 1
}

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "Run this script from inside the local mawda-platform Git repository."
cd "$ROOT"
ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
[[ "$ORIGIN" == *"$REPO"* ]] || die "origin is not $REPO (found: $ORIGIN)"
[[ "$(git branch --show-current)" == "$RECOVERY" ]] || die "Checkout $RECOVERY before running."
[[ -z "$(git status --porcelain)" ]] || die "Working tree is not clean; preserve/commit local work before running."

mkdir -p "$(dirname "$REPORT")"
REPORT_TMP="$(mktemp)"
trap 'if [[ -n "${REPORT_TMP:-}" && -f "$REPORT_TMP" ]]; then mv "$REPORT_TMP" "$REPORT"; fi' EXIT
{
  echo "# Branch deletion batch 01 — 2026-11-23"
  echo
  echo "- Repository: `$REPO`"
  echo "- Target branch: `$RECOVERY`"
  echo "- Expected main SHA: `$EXPECTED_MAIN_SHA`"
  echo "- Minimum approved Recovery ancestor: `$MIN_RECOVERY_SHA`"
  echo "- Started UTC: `$(date -u +%Y-%m-%dT%H:%M:%SZ)`"
  echo "- Allowlist size: 17"
  echo
  echo "## Preflight"
} > "$REPORT_TMP"

git fetch origin "$RECOVERY" >> "$REPORT_TMP" 2>&1 || die "Could not fetch Recovery."
REMOTE_RECOVERY="$(git ls-remote origin "refs/heads/$RECOVERY" | awk 'NR==1 {print $1}')"
REMOTE_MAIN="$(git ls-remote origin refs/heads/main | awk 'NR==1 {print $1}')"
[[ -n "$REMOTE_RECOVERY" ]] || die "Recovery ref is missing."
[[ "$REMOTE_MAIN" == "$EXPECTED_MAIN_SHA" ]] || die "main SHA changed; expected $EXPECTED_MAIN_SHA, got $REMOTE_MAIN."
git merge-base --is-ancestor "$MIN_RECOVERY_SHA" FETCH_HEAD || die "Remote Recovery is not a descendant of the approved ledger checkpoint."
git merge --ff-only FETCH_HEAD >> "$REPORT_TMP" 2>&1 || die "Local Recovery could not fast-forward safely."
[[ "$(git rev-parse HEAD)" == "$REMOTE_RECOVERY" ]] || die "Local Recovery does not match the live remote head."

echo "- Live Recovery SHA: `$REMOTE_RECOVERY`" >> "$REPORT_TMP"
echo "- Live main SHA: `$REMOTE_MAIN`" >> "$REPORT_TMP"
echo "- Recovery ancestry and main protection checks: PASS" >> "$REPORT_TMP"
echo >> "$REPORT_TMP"
echo "## Per-branch execution" >> "$REPORT_TMP"

# Full preflight of every allowlisted ref before deleting the first one.
while IFS='|' read -r NAME EXPECTED; do
  [[ -n "$NAME" ]] || continue
  [[ "$NAME" != "main" && "$NAME" != "$RECOVERY" && "$NAME" != archive/* ]] || die "Protected ref appeared in allowlist: $NAME"
  ACTUAL="$(git ls-remote origin "refs/heads/$NAME" | awk 'NR==1 {print $1}')"
  [[ "$ACTUAL" == "$EXPECTED" ]] || die "SHA mismatch for $NAME; expected $EXPECTED, got ${ACTUAL:-MISSING}. No branch has been deleted."
done <<< "$BRANCHES"

echo "- All 17 live branch heads matched their reviewed SHAs before deletion: PASS" >> "$REPORT_TMP"

while IFS='|' read -r NAME EXPECTED; do
  [[ -n "$NAME" ]] || continue
  if git push --porcelain --force-with-lease="refs/heads/$NAME:$EXPECTED" origin ":refs/heads/$NAME" >> "$REPORT_TMP" 2>&1; then
    AFTER="$(git ls-remote origin "refs/heads/$NAME" | awk 'NR==1 {print $1}')"
    if [[ -z "$AFTER" ]]; then
      printf -- "- DELETED and verified absent: `%s` (reviewed SHA `%s`)\n" "$NAME" "$EXPECTED" >> "$REPORT_TMP"
    else
      printf -- "- FAILED verification: `%s` remains at `%s`\n" "$NAME" "$AFTER" >> "$REPORT_TMP"
    fi
  else
    printf -- "- DELETE FAILED: `%s` (reviewed SHA `%s`)\n" "$NAME" "$EXPECTED" >> "$REPORT_TMP"
  fi
done <<< "$BRANCHES"

echo >> "$REPORT_TMP"
echo "## Final protected-ref verification" >> "$REPORT_TMP"
FINAL_MAIN="$(git ls-remote origin refs/heads/main | awk 'NR==1 {print $1}')"
FINAL_RECOVERY="$(git ls-remote origin "refs/heads/$RECOVERY" | awk 'NR==1 {print $1}')"
printf -- "- main: `%s` (expected `%s`)\n" "$FINAL_MAIN" "$EXPECTED_MAIN_SHA" >> "$REPORT_TMP"
printf -- "- Recovery: `%s`\n" "$FINAL_RECOVERY" >> "$REPORT_TMP"
[[ "$FINAL_MAIN" == "$EXPECTED_MAIN_SHA" ]] || die "main changed during deletion batch."
[[ "$FINAL_RECOVERY" == "$REMOTE_RECOVERY" ]] || die "Recovery changed unexpectedly during deletion batch."

DELETED_COUNT="$(grep -c '^- DELETED and verified absent:' "$REPORT_TMP" || true)"
FAILED_COUNT="$(grep -Ec '^- (FAILED verification|DELETE FAILED):' "$REPORT_TMP" || true)"
printf -- "- Verified deletions: %s / 17\n" "$DELETED_COUNT" >> "$REPORT_TMP"
printf -- "- Failed deletions/verifications: %s\n" "$FAILED_COUNT" >> "$REPORT_TMP"
printf -- "- Finished UTC: `%s`\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$REPORT_TMP"

mv "$REPORT_TMP" "$REPORT"
echo "Report saved: $REPORT"

if [[ -n "$(git config user.name || true)" && -n "$(git config user.email || true)" ]]; then
  git add "$REPORT"
  git commit -m "chore(governance): record reviewed branch deletion batch 01"
  git push origin "$RECOVERY" || {
    echo "WARNING: report commit is local only; push failed. Do not rerun deletion. Preserve the local report."
    exit 2
  }
  echo "Report committed and pushed to $RECOVERY."
else
  echo "WARNING: Git author identity is not configured; report is saved locally but was not committed."
fi

echo "Completed: $DELETED_COUNT verified deletions; $FAILED_COUNT failures. Review $REPORT."
