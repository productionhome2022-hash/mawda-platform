# Mawdda synthetic persona load testing

## Purpose
Exercise the trusted wallet and direct-message callables with 200, 300 and 500 synthetic member identities. The test measures server-callable latency, throughput, recipient inbox delivery, idempotent transfer replay and paired wallet-ledger reconciliation.

## Isolation boundary
- The fixture generator creates synthetic identities only, using the reserved `test.mawdda.invalid` email domain.
- The integration test requires both Firebase Auth and Firestore Emulator hosts and is invoked with a `demo-mawda-*` project ID by Firebase Emulator Suite.
- It does not use Firebase production credentials, production projects, live payment providers, real member data, or real push delivery.
- The generated fixture and machine-readable report are written to `functions/mawdda-load-artifacts/` and uploaded as CI artifacts with a seven-day retention window. The generated directory is ignored by Git. They are not production data and should not be imported into a live Firebase project.

## Scenarios
A single isolated emulator session provisions 500 synthetic identities, then runs three independently reset cohorts:
- 200 identities / 100 pairs
- 300 identities / 150 pairs
- 500 identities / 250 pairs

Each pair executes a server-side coin transfer, repeats the same transfer to prove idempotency, sends a direct message, and reads the delivered message as the recipient. Each transfer checks gross amount, commission, net amount, both wallet balances, and both linked wallet-ledger entries.

Concurrency is bounded to batches of up to 125 pairs. At the 500-persona tier, all 250 pairs (500 identities) participate in the same concurrent wave. This is a controlled emulator workload, not an unbounded denial-of-service test.

## Metrics
For each cohort the test reports elapsed time, operation throughput, transfer/message/receive p50 and p95 latency, maximum latency, operation counts and errors. Any callable failure, missing inbox delivery, duplicate debit/credit, or ledger/balance mismatch fails the test.

## Interpretation and limits
A passing emulator load test validates application behavior under the measured emulator workload only. It does not establish production capacity, Cloud Run or GCS throughput, network/mobile performance, real-world Firestore quota headroom, geographic latency, or a production requests-per-second limit. Those require a separately approved non-production cloud environment and cost controls. No production deployment or infrastructure activation is part of this test.
