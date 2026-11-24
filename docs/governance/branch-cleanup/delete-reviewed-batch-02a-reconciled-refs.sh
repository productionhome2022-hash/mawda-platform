#!/usr/bin/env bash
# SAFETY DISABLED — 2026-11-23
# The former script contained a 23-ref allowlist that did not match the
# reviewed/approved disposition and its branch gates remain OPEN.
# Do not execute this file. It intentionally performs no repository action.
set -Eeuo pipefail
echo "BLOCKED: obsolete batch-02A deletion script is disabled."
echo "Use audit-e522-branch-trees-and-report.sh for read-only inventory and tree comparison."
echo "No branch has been deleted by this script."
exit 90
