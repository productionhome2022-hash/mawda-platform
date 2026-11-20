# Final biometric verification policy — owner-approved — 2026-11-20

**Authority:** Final product/security decision supplied by the platform owner on 2026-11-20. This document supersedes any conflicting biometric workflow, challenge, retry, reviewer, device-attestation, or lockout behavior in older branches and documents.

## 1. Exclusive decision authority

- The **Super Owner alone** is the human decision-maker for biometric verification.
- The review must be performed personally by the Super Owner, who examines the submitted evidence and records an explicit accept or reject decision.
- The decision endpoint must be server-authorized for the canonical Super Owner identity using the platform-owner claim and the required MFA/session checks. A generic administrator or moderator role, UI visibility, or client-supplied role is not sufficient.
- The Super Owner's decision is applied immediately by the server: acceptance and its reward, or rejection and its retry/closure transition, are committed as one authoritative operation.
- Device attestation, provider attestation, automated face matching, automated voice matching, and device proof are **not** part of this policy and must not be prerequisites or substitutes. The verification decision is human-only.

## 2. Required member submission

The member submits:
1. Full name.
2. Username.
3. Gender as already recorded in the member's canonical registration/profile data.
4. A voice recording reading the pre-existing phrase/challenge displayed by the platform.
5. A video clip with a duration of **at least 3 seconds and at most 5 seconds**, inclusive.

### Voice phrase challenge

- The platform must have a pre-established phrase or controlled phrase set before the member records audio.
- The member must read this exact owner-approved phrase and submit that recording as the voice evidence: **«أنا أريد الانضمام إلى مرحلة التوثيق البيومتري لأحصل على مكافأة ألف وخمسمائة بيتكوينز. الرجاء قبول التوثيق.»** The phrase is versioned as `owner-approved-2026-11-20-v1`.
- The Super Owner listens to the recording and manually reviews it as part of the decision.
- The exact phrase above is the owner-supplied approved phrase and is versioned as `owner-approved-2026-11-20-v1`; any future wording change requires a new owner-approved version.
- No automated voiceprint score or device attestation may determine acceptance.

### Gender integrity

- Gender is not a choice made or changed in the biometric submission flow.
- The submitted/reviewed value must be read from, and match, the gender value already stored for that member during registration.
- The client must not be allowed to override the canonical value. A missing or inconsistent canonical value must fail closed and be resolved through the approved account-data correction process, not by choosing a new value in the verification form.

### Evidence validation and protection

- Enforce the 3–5 second video duration on both client and server; client checks alone are insufficient.
- Store voice/video evidence in private storage with server-authorized access, least privilege, and auditable access/decision records.
- Submission metadata and evidence must be bound to the authenticated member UID and the exact request/attempt.
- Evidence handling must not expose private media through public URLs or trust client-provided ownership metadata.

## 3. Three-attempt decision lifecycle

There are exactly **three attempts total**. Each rejected attempt grants eligibility for the next attempt only after one full calendar month has elapsed from that rejection decision:

| Attempt | Super Owner decision | Result |
|---|---|---|
| 1 | Accept | Verification accepted; grant the reward once; terminal state |
| 1 | Reject | Attempt 2 becomes eligible after one calendar month |
| 2 | Accept | Verification accepted; grant the reward once; terminal state |
| 2 | Reject | Attempt 3 becomes eligible after one further calendar month |
| 3 | Accept | Verification accepted; grant the reward once; terminal state |
| 3 | Reject | Close the biometric verification file permanently; no fourth attempt |

- Calendar-month arithmetic must use the shared calendar-month utility and its established end-of-month behavior; do not approximate a calendar month as 30 days.
- A retry submitted before its eligibility timestamp must be rejected server-side.
- The third rejection is final immediately when recorded. There is no additional waiting period, fourth attempt, or temporary three-month lockout.
- Duplicate decisions, concurrent retries, forged attempt numbers, member self-review, and replayed requests must be rejected.

## 4. Acceptance reward

- On the Super Owner's acceptance, the server must immediately grant **1,500 BetaCoins** exactly once for that successful verification lifecycle.
- The accepted status and reward ledger entry must be committed atomically through the central economy/ledger service, with an idempotency key tied to the verification request/acceptance decision.
- Do not update a client-controlled balance or write a standalone coin balance directly.
- A replay of the same acceptance must not issue another reward. A later, separately eligible verification lifecycle is not to be confused with a replay of the same decision.

## 5. Renewal cycles retained from the previously approved policy

- Biometric renewal remains every one calendar month from the biometric verification date.
- Email verification renewal remains every three calendar months and is independent of biometric renewal.
- Do not merge, reset, or derive one cycle from the other.

## 6. Implementation and release gates

This is the final approved policy, but policy approval is not evidence that the workflow is implemented or safe to activate. Keep the feature fail-closed until all of the following are implemented and tested:

- Super Owner server authorization and MFA enforcement.
- Canonical member identity binding and immutable gender comparison.
- Pre-established, owner-approved voice phrase configuration and phrase-version binding.
- Server-side audio/video evidence validation, including the exact 3–5 second video bound.
- Private evidence storage and protected review access.
- Transactional three-attempt state transitions using calendar-month arithmetic.
- Immediate, atomic, exactly-once 1,500 BetaCoins ledger grant on acceptance.
- Immutable/auditable review decisions and protected evidence-access audit records.
- Unit, callable, Firestore emulator, storage/rules, integration, concurrency, replay/idempotency, and regression tests.

No production activation, production Firebase mutation, paid-service enablement, or deployment is authorized by this policy approval.

## 7. Supersession

Any older implementation that imposes a 3-month lockout after the third rejection, omits the pre-existing spoken phrase challenge, omits the 3–5 second video requirement, allows a member to choose or override gender during verification, or uses device/provider attestation as a prerequisite conflicts with this final policy and must be adapted rather than copied wholesale.
