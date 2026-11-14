# Mawdda synthetic persona load testing

## Purpose
Exercise 5,000 synthetic member identities in staged emulator cohorts of 500, 1,000, 2,500 and 5,000. Measure wallet transfer correctness, idempotency, two-way direct messaging, inbox delivery, per-persona completion, latency and throughput.

## Isolation boundary
- Fixtures use only reserved `test.mawdda.invalid` identities and synthetic profile data.
- The integration test requires Firebase Auth and Firestore Emulator hosts and a `demo-mawda-*` project.
- No production project, real member data, live payment provider, live push delivery, or production storage bucket is used.
- Generated fixture and report files live under `functions/mawdda-load-artifacts/`, are ignored by Git, and are uploaded as short-retention CI artifacts.

## Scenarios
One emulator session provisions 5,000 synthetic identities. Four staged cohorts are exercised: 500, 1,000, 2,500 and 5,000 identities. Each pair performs:
1. A server-side coin transfer with server-calculated commission.
2. An identical replay to prove idempotency without a second debit or credit.
3. A direct message from the first persona to the second, followed by recipient inbox read.
4. A reply from the second persona to the first, followed by the original sender's inbox read.
5. Reconciliation of both wallet balances and the sender/recipient ledger entries linked to the same transfer.

At the 5,000 tier, every identity must have a report row proving a completed transfer, its linked ledger role, one message sent, and one message received. The test fails if any persona is missing a row or any required flag is false. The report includes all 5,000 persona IDs and UIDs; it contains synthetic test identifiers, not passwords or real personal data.

## Metrics
Each cohort records elapsed time, operation throughput, transfer/message/receive p50 and p95 latency, maximum latency, counts and errors. The 5,000-persona coverage report is emitted as JSON. All concurrency is bounded to batches of 125 pairs.

## What this does not prove
This is not yet a single full product lifecycle for each of the 5,000 identities. Profile/discovery, store/premium, rooms/rentals/events, media, guest restrictions, notifications, safety/moderation, and retention are covered by separate dedicated emulator suites, or require live non-production/device acceptance. Do not claim that all 5,000 personas completed those features. A passing emulator load test is not a production capacity certification and does not establish Cloud Run/GCS throughput, mobile performance, geographic latency, or production quota headroom.

## Interpretation
A successful run proves only the specific server-callable and emulator behavior measured above. Real GCS/ClamAV/Cloud Run processing, Firestore quota headroom, push delivery, and device rendering require separately approved non-production infrastructure and physical-device testing. No production deployment, billing activation, or merge to `main` is authorized by this test.
