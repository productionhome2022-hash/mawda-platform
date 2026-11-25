# Semantic review batch 028 — group-call duration proposal and CI workflow
Date: 2026-11-25
Target branch: codex/mawda-full-platform-implementation
Candidate CSV blob: 296134e6de35b04304413a090469e79c3fb13388
Scope: unique UNMATCHED candidates 253–258 (6 commits).

## Classification

| Candidate SHA | Change | Current Full Platform evidence | Disposition |
|---|---|---|---|
| 96c9f6ec6569cad73726d28cd7a14d8602ab4e43 | Add isolated economic verification workflow | Current CI workflow is manual-dispatch only. The candidate adds branch-specific automated runs and emulator tests; this changes CI execution/cost policy and is not ported without an explicit trigger-scope decision. | Held for CI governance decision |
| afd6b97f4af8e773c25d1969afaccf4e4af98bfe | Test fixed group-call duration limits | Current call duration is owner-configured through CALL_USAGE_POLICY; the project context contains no approved fixed five-minute audio/three-minute video group-call duration decision. | Proposal not adopted; requires owner approval |
| d7f63bc19b5c410c3d2ebd9a9eed4f6841920958 | Apply fixed duration to rented-room group calls | Would change the active group-call duration policy from owner-configured to fixed values. | Proposal not adopted; requires owner approval |
| 4bbbef3d59ee07ccbb7876d52b71bded27edcc63 | Make group-call audio/video durations immutable | Introduces five-minute audio and three-minute video constants independent of pricing. This is a product policy change, not a safe mechanical port. | Proposal not adopted; requires owner approval |
| 70ad5b9679200ef874e5f1aca5c37315d71f25e1 | Test rejection of unknown group-call modes | Current group-call economy tests already reject unknown runtime modes. | Already implemented |
| e1ec6103a9df3456224aaccbb7f3589e5299ab2a | Correct group-call mode validation syntax | Current getGroupCallRate explicitly validates audio/video before selecting the rate. | Already implemented |

## Result
- Reviewed: 6/1,665 unique candidates in this batch.
- Already implemented: 2.
- Held for explicit CI or product-policy decision: 4.
- Code transferred: 0.
- Tests executed: 0.
- No workflow was triggered or modified.

## Safety decision
Do not silently replace the owner-configured call duration policy with five-minute audio/three-minute video limits. Do not add automatic CI triggers until the owner approves branch/PR scope and the expected emulator workload.