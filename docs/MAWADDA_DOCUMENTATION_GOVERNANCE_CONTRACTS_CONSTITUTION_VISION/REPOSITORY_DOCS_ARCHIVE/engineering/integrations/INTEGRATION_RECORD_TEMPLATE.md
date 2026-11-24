# Branch Integration Record — Template

## Identity
- Integration ID:
- Status:
- Source repository/branch:
- Target repository/branch:
- Start/end time (UTC):
- Operator:

## Immutable baseline
- Source head SHA:
- Target head SHA:
- Merge base SHA (or no common base):
- Relevant branch inventory/report links:

## Commit disposition
| Source commit | Summary | Disposition | Target commit | Evidence / reason |
|---|---|---|---|---|

Allowed dispositions: integrated, already represented, superseded, rejected, deferred, conflict, unable to verify.

## File reconciliation
| Path | Source change | Target state | Decision | Conflict/sensitivity | Evidence |
|---|---|---|---|---|---|

## Protected-surface review
- Secrets/credentials:
- Firebase project and production resources:
- iOS bundle/App ID registration:
- Android signing identity:
- Claims/UIDs/schema/ledger/API:
- Firestore/Storage rules:
- Retention/deletion/payment/financial policy:
- Binary/generated files:

## Validation
| Check | Resulting SHA | Run ID/link | Result | Caveats |
|---|---|---|---|---|

## Publication and closure
- Resulting commit SHA:
- Remote read-back:
- Source/target comparison:
- Remaining conflicts/blockers:
- Owner approvals required:
- Explicitly confirm main/deployment/production/billing were not changed unless separately approved:
