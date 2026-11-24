# Super Owner biometric implementation progress — 2026-11-20

Added a pure server-side retry state machine for the approved three-attempt policy: first rejection allows attempt 2 after one calendar month; second rejection allows attempt 3 after one further calendar month; third rejection closes the sequence permanently. Acceptance is terminal. The transition module rejects non-pending decisions, invalid clocks, member self-review, and retry attempts before the exact calendar-month due date.

Important: this module does not authorize a reviewer. Callable endpoints must enforce `requireOwnerForReview` (which checks the platform-owner claim and MFA session) before invoking the transition. It is not yet wired to submission/review callables, Firestore transactions, private evidence storage, audit records, renewal scheduling or the exactly-once 1,500 BetaCoins ledger. Keep biometric verification fail-closed until those gates are implemented and tested.
