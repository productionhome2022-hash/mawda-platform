# Independent verification-cycle progress — development branch

Owner policy: email verification and biometric verification are independent. Neither can complete, renew, gate, expire, reset, extend, delay, approve or reject the other.

This candidate ports the UTC calendar-month date primitive and updates the email cycle to three calendar months. It separately exposes a one-calendar-month biometric due-date calculation. Month-end and leap-year cases have focused unit tests.

This is not the complete biometric feature. The Super Owner manual request/review workflow, server-exclusive decision authorization, three attempts with one-calendar-month retry waits, private evidence lifecycle, exactly-once 1,500 BetaCoins reward, and replacement of the conflicting device-attestation gate remain unimplemented. Keep biometric verification fail-closed until those are complete.

No tests are claimed as passed until the exact-head GitHub Actions checks finish. No production changes or 5,000-persona simulation are included.
