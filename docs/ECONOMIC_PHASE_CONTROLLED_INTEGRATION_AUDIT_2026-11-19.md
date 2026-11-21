# Economic phase — controlled integration and closure audit

Date: 2026-11-19  
Repository: `productionhome2022-hash/mawda-platform`  
Official development branch: `codex/mawda-full-platform-implementation`  
Official branch head inspected: `d561dc445ea352d94cd346a6b745e800a9114ee1`  
Status: **OPEN — implementation and acceptance gates remain**

## Authority and safety

This record is an engineering audit and execution register, not a commercial policy change. Owner-controlled prices, quotas, durations, commissions, budgets and activation remain unchanged. No provider checkout, automated collection, payment credential, production Firebase resource, paid infrastructure, production data, deployment, or `main` branch was changed. No PR was merged.

## Repository integration findings

The official development branch contains the current brand/experience amendment and is one commit ahead of the shared integration base `7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1`.

Related economic work is split across draft branches and must not be merged wholesale:

| Workstream | Branch | Comparison to official development | Finding |
|---|---|---:|---|
| Payment/wallet replay hardening, PR #30 | `codex/economy-official-port-2026-11-18` | 20 commits ahead, 1 behind | Correct official base target; inspect and integrate sequentially after exact source/test review |
| Economic completion and group-call work, PR #31 | `codex/economic-phase-completion-2026-11-18` | 178 commits ahead, 1 behind | Broad overlapping changes; do not merge wholesale |
| Economic phase closeout, PR #22 | `codex/economic-phase1-closeout-2026-11-18` | 124 commits ahead, 1 behind | Targets a different integration line; select compatible changes only |
| Broad economy recovery, PR #28 | `codex/economy-recovery-2026-11-18` | 618 commits ahead, 1 behind | Very broad overlapping change set; do not merge wholesale |

PR #31's branch adds important code for payment policy, featured-ad finance, group-call pricing/settlement, wallet reconciliation and related Flutter controls. However, its own audit explicitly records unresolved P0 group-call blockers. These files are not present on the official development branch at the inspected head. Source presence on a separate draft branch is not implementation on the official line.

## Confirmed priority gaps

### P0 — group-call economic lifecycle (BLOCKING)

The draft implementation/audit on PR #31 reports:
- Provider-authenticated media evidence is not integrated; client-reported WebRTC state is not sufficient to authorize billing.
- Participant-to-participant media topology is incomplete; creator-to-member connections do not prove a complete group call.
- Current peer-to-peer mesh cannot safely guarantee unrestricted audio-room capacity; an SFU topology and security/cost review are required.
- Server-authoritative entitlement checks for every participant, including creator, are not proven end-to-end.
- Trusted participant-specific media start/stop/reconnect/billable intervals are incomplete.
- Reservation/hold and insufficient-funds semantics are not complete; per-member partial settlement can leave inconsistent participant outcomes.
- Required 2/3/4-person video layouts and owner pricing UI acceptance remain unverified.
- No accepted 5,000-persona group-call load run exists.

**Gate:** Keep all group-call charging disabled/fail-closed. Do not close Issue #23 or claim economic phase acceptance until the media topology, trusted metering, consent/version binding, entitlement gate, reservation and atomic idempotent settlement, UI and concurrency/replay tests are complete on one exact SHA.

### P1 — payment policy and manual payment workflows

- PR #30 contains relevant hardening for immutable/version-checked manual payment instructions, member payment reporting as a claim only, owner-only approval, replay checks, and wallet/store/room-rental assertions.
- The broader economic policy in PR #31 allows manual payment only for coin purchases and featured ads; public ads, influencer services and cash-paid store entitlements remain fail-closed until their request, owner-attestation and fulfilment lifecycles are complete.
- Automated checkout remains forced off pending a selected provider, signed webhook verification, amount/currency/order matching, idempotent fulfilment, refund/reversal and reconciliation support, plus explicit owner approval.

**Gate:** No member declaration or uploaded receipt may credit coins or fulfil an entitlement. Only the authorized owner verification/approval path may do so.

### P1 — featured advertising and campaign finance

The economic branch contains a dedicated featured-ad financial event model and associated tests, but this audit has not verified full end-to-end serving, owner controls, payment evidence, refunds, campaign withdrawal, geography, reward-session evidence and distinct ledger integration on the official development line.

**Gate:** Do not relabel timed-ad rewards as featured-ad rewards. Keep the feature/payment/reward path disabled wherever the complete workflow is not present and tested.

### P1 — wallet and ledger reconciliation

The draft branch contains a read-only reconciliation helper that classifies history as consistent, mismatch, incomplete or corrupt. Legacy entries without balance snapshots remain incomplete; the helper must not silently repair balances. This does not yet prove a complete platform-wide/historical reconciliation, pagination completeness, all-ledger cross-domain consistency, or an owner-facing controlled review workflow on the official branch.

**Gate:** Read-only diagnostics first. Never auto-correct member balances or rewrite historical ledger rows as part of reconciliation.

### P2 — stores, gifting, entitlements and owner controls

Reconcile the central catalog and entitlement engine across purchases, gifts, grants, room rentals, subscriptions, titles/badges and future SKUs. Preserve exact 24-hour, 7-day and 30-day duration rules. Historical purchases are not recalculated. Missing owner pricing must fail closed; no fallback prices or invented commercial values.

## Evidence boundary

- The official branch's current head was identified by the base SHA returned by GitHub comparison during this audit.
- PR #31's group-call audit reports green CI on an earlier SHA `04dc9a7c1c2e6acbf3cdf7dfb2c0f20a847d1435`, but explicitly states that later fail-closed settlement changes on `c09a108056604e8c5bd4c85fa0e12ebf78cabd2b` were still running at audit time. Earlier green CI is not evidence for that later SHA or the official branch.
- No new tests, emulator runs, Flutter analysis or builds were executed during this source/PR inspection.
- This audit does not claim code changes from draft branches have been ported to the official branch.

## Mandatory execution order

1. Establish the latest official branch head and CI state; keep all work isolated from `main`.
2. Port PR #30 payment/wallet changes in small reviewed units; inspect each changed file and test, then run exact-head Functions and emulator tests.
3. Port compatible PR #31 economic policy/catalog/reconciliation pieces only after conflict and data-contract review; keep all unready payment modes fail-closed.
4. Complete group-call P0 architecture and end-to-end lifecycle; no billing until trusted media proof, entitlements, consent, reservation and atomic settlement are integrated.
5. Complete featured-ad finance/serving/rewards and member/owner UI with distinct ledger semantics and replay/concurrency/security tests.
6. Complete store/entitlement/gifting/rental cross-domain invariants and owner grant audit controls.
7. Run read-only wallet/platform reconciliation across bounded pages with explicit incomplete/corrupt reporting; no auto-correction.
8. Run exact-head Flutter analyze/tests/build, Functions compile/unit tests, Firestore/Storage emulator and rules tests, security scans and regression workflows. Fix every failure before freezing a candidate SHA.
9. Only after code phase closure, proceed to the separate 5,000-persona simulation and later real-device/non-production acceptance gates.

## Closure criteria

The economic phase remains **OPEN** until every approved economic requirement maps to implemented source, server authorization, UI where applicable, tests, and exact-SHA evidence. Documentation, helper functions, green tests on another SHA, or a draft PR alone do not close a requirement.

No merge to `main`, deployment, production Firebase change, billing activation, paid resource activation, or live financial operation is authorized by this audit.
