# Mawdda Platform 2026 — Zero-Cost-First Launch Economy Plan

**Status:** Approved engineering direction; implementation and production activation are gated by tests and separate release approval.  
**Applies to:** The primary Mawdda Platform repository and its production architecture. The 5,000-persona lab remains an isolated validation repository.

## 1. Mission and non-negotiable product promise

The launch objective is **zero-cost-first**, not a false promise of unlimited free infrastructure.

Mawdda must preserve the complete member experience: account access, profiles, discovery, direct and room messaging, media exchange within the approved policy, voice/video calling, wallet and store entitlements, safety, moderation, and privacy. A cost threshold must never silently disable or degrade these essential member journeys.

The platform must not expose financial distress, internal quota warnings, or operator cost controls to members. Cost management is an internal operational responsibility.

No engineering document can guarantee a 100% zero invoice for unlimited usage. Provider quotas, paid-only service requirements, traffic, storage, network egress, and abuse can create charges. The team must verify actual provider eligibility and the production project configuration before launch.

## 2. Protected services — never disabled by economy mode

The following remain available in every economy mode, subject only to normal security, abuse-prevention, and provider availability controls:

- Authentication, account recovery, authorization, and session security.
- Direct messages, room messages, inbox, and essential notifications.
- Voice/video calling and the approved call-quota/billing rules.
- Wallet correctness, coin transfers, immutable transaction records, purchases, and entitlements.
- Safety reporting, blocking, moderation, and server-side authorization.
- Mandatory media/text retention, self-destruction, and deletion reconciliation.
- Data integrity, backups/required recovery controls, and security scanning.
- Access to existing member data and the ability to leave, delete, or manage an account.

No economy switch may bypass authorization, relax Firestore/Storage rules, discard wallet records, or silently change a member's purchased entitlement.

## 3. Cost reduction without member-visible degradation

### 3.1 Reads and realtime data

- Replace periodic full-message reloads with an initial recent-message page, stable cursor-based incremental fetch for new messages, and cursor pagination for older messages.
- Use deterministic ordering by timestamp plus document ID; deduplicate by document ID.
- Cache recent data locally and fetch only changes after the last confirmed cursor.
- Paginate inbox, rooms, discovery, stories, and other growing lists.
- Remove duplicate reads and repeated profile/entitlement lookups; use bounded, short-lived caches where correctness permits.
- Avoid aggressive polling. Use realtime listeners or incremental fetch where appropriate, and pause unnecessary refresh while the app is backgrounded without delaying incoming user-visible messages.
- Measure reads per active member/session and query fan-out before and after each change.

### 3.2 Media and storage

- Enforce upload size/type limits at the server boundary and reject unsupported content before expensive processing.
- Produce appropriately sized previews/derivatives; avoid repeatedly downloading originals when a preview is sufficient.
- Use resumable uploads, deduplication where safe, and retry only failed work.
- Keep the approved member attachment policy: ordinary images, GIF, audio, and video; no PDFs/documents for members. Owner/Super Admin exception remains permission-gated server-side.
- Preserve the approved self-destruct deadlines. Delete exact object generations and derivatives; reconcile late derivatives and failed deletions.
- Keep retention work bounded and paged so it cannot create unbounded bursts. Tune schedule frequency only after measuring deletion lag and storage cost.
- Do not disable retention to save money. Delayed deletion creates privacy and storage risks.

### 3.3 Backend and scheduled work

- Make event handlers idempotent; avoid duplicate triggers, unbounded retries, and unnecessary fan-out.
- Bound concurrency, batch sizes, and per-run work; set timeouts and retry policies based on measured service needs.
- Do not set instance caps so low that core requests queue or fail. Do not add minimum instances unless measured latency requirements justify the idle cost.
- Keep nonessential analytics, speculative recommendations, and background enrichment asynchronous and lower priority, without blocking core member actions.
- Run load tests before changing runtime limits.

### 3.4 Delivery and engineering infrastructure

- Keep CI validation-only; no deployment or live Firebase mutation from test workflows.
- Pin toolchain/dependency versions and use lockfiles to make builds reproducible.
- Use caching in CI where safe; avoid unnecessary repeated native builds.
- Keep the 5,000-persona lab separate from production code and point it at an immutable tested platform SHA.
- Do not retain generated build artifacts or local Firebase state in source control unless specifically required.

## 4. Internal economy modes

Modes are internal controls and must not be presented to members.

1. **Normal:** All approved features operate normally; collect cost and latency telemetry.
2. **Watch:** Alert operators, investigate unusual reads/writes/egress, duplicate work, and traffic spikes. No essential feature is disabled.
3. **Efficiency:** Apply only pre-tested backend optimizations, caching, batching, and lower priority for nonessential background work. Core UX remains unchanged.
4. **Incident protection:** Rate-limit abusive clients and expensive nonessential automation using fair, server-enforced controls. Protect authentication, chat, calling, wallet integrity, safety, and retention. Do not globally disable essential services because an estimated budget threshold was crossed.

Mode transitions require audit records, authorized owner/admin action, and a clear rollback path. Any member-visible restriction must be a separately specified product/safety policy, not a hidden financial switch.

## 5. Operational counters and reset semantics

The owner dashboard may provide a **Reset operational reporting period** action. It must:

- Close and preserve the previous period's report.
- Start a new internal measurement window with a new period ID.
- Preserve raw append-only audit events or immutable aggregates needed for reconciliation.
- Never delete member data, wallet ledgers, purchase receipts, entitlements, authentication records, safety evidence, or retention obligations.
- Never claim to reset Firebase/Google quotas, billing usage, invoices, or provider-side counters.

The reset action is not a billing cap and cannot erase charges already incurred.

## 6. Provider-cost reality and launch gate

Before production launch, verify the exact Firebase project, enabled products, plan eligibility, quotas, storage bucket behavior, and deployed backend dependencies.

Some Firebase capabilities have plan requirements that can make a literal zero-invoice launch incompatible with the current architecture. In particular, Cloud Functions deployment requires Blaze, and Cloud Storage for Firebase has plan requirements that must be checked against the actual bucket and current provider terms. Free quotas on Blaze are not a guaranteed zero bill.

Therefore:
- Do not switch plans, attach a payment method, enable billing, or deploy production without explicit owner approval.
- Do not migrate providers merely to claim "free" until equivalent security, privacy, reliability, retention, and load behavior are proven.
- Seek legitimate startup credits, grants, or provider programs before accepting recurring infrastructure charges.
- Configure provider budget alerts and any available spend caps only after verifying their coverage and failure behavior. Alerts are not hard spending limits; a service-specific cap is not a universal project cap.
- Maintain a measured cost model per active member and per major journey, including storage, egress, reads/writes, functions, notifications, and calls.

If the actual provider setup cannot deliver the essential feature set without paid services, record that honestly as a launch dependency rather than silently degrading the product.

## 7. Self-destruct and retention are protected product features

- Keep the approved chat-media self-destruct policy and text-retention policy.
- Run cleanup server-side with explicit production-project allowlisting and fail-closed configuration.
- Verify object generations, derivatives, tombstones, retry behavior, legal holds, and deletion audit trails.
- Alert the owner internally when deletion lag or failures exceed the operational target.
- Do not count a scheduled job's successful invocation as proof that all due objects were deleted; track due, deleted, retried, failed, and overdue counts.
- Test expiry and reconciliation under load in the isolated lab before production activation.

## 8. Measurement and acceptance gates

Every optimization must demonstrate both cost improvement and preserved user experience.

Required measurements:
- Firestore reads/writes/deletes and document counts per member/session.
- Backend invocation count, duration, retries, concurrency, and error rate.
- Storage bytes, object versions, derivative bytes, upload/download volume, and egress.
- Message delivery latency, call setup/quality, inbox refresh latency, and API error rates.
- Retention due/deleted/overdue counts and maximum deletion lag.
- Cost per daily active member and per completed core journey, reconciled against provider billing data.

Required validation:
- Unit, integration, rules, emulator, scanner, and platform build tests.
- Pagination tests for equal timestamps, deletion, retry, stable ordering, authorization, and no duplicates.
- Retention tests for exact expiry, retries, derivatives, tombstones, and production allowlisting.
- 5,000-persona lifecycle simulation against an immutable tested SHA, including messaging, rooms, calls where simulated, wallet/store, discovery, safety, and retention.
- No release if essential journeys regress, security rules are weakened, wallet integrity changes, or retention stops working.

## 9. Delivery sequence

1. Establish the verified project/service inventory and baseline cost/latency measurements.
2. Complete and test incremental message fetching and cursor pagination.
3. Complete storage lifecycle and self-destruct reliability tests.
4. Add internal economy telemetry and reporting-period reset with append-only audit.
5. Add economy modes only for safe nonessential work, with automated tests proving protected journeys remain available.
6. Run the isolated 5,000-persona lifecycle suite against the exact final candidate SHA.
7. Review actual provider plan/cost exposure and secure explicit owner approval for any billing or production action.
8. Release only after all acceptance gates pass.

## 10. Explicit non-authorizations

This plan does not authorize merging the development PR, deploying production, changing Firebase plans, enabling billing, attaching payment methods, migrating production data, deleting user data, or disabling any member-facing feature. Each such action requires its own verification and, where applicable, explicit owner approval.


## 11. Verified implementation baseline — 2026-11-15

The development branch now has a first measured-scope optimization for direct chat reads. This is a source-level implementation and emulator-test contract; no production read/cost reduction is claimed until provider telemetry is collected.

### Implemented in the direct-message path

- The backend supports bounded `beforePageToken` and `afterPageToken` requests, ordered by `createdAt` and Firestore document ID. Cursor tokens encode both values, so equal timestamps remain deterministic.
- The direct-chat client now loads the recent 50-message page once, polls for only messages after its latest cursor, merges by immutable message ID, and sorts by timestamp plus ID.
- Older direct-message history is fetched through the server cursor when the member requests it; pages are deduplicated before display.
- The client refreshes outgoing read indicators from the peer read cursor without writing a new receipt when no new incoming message arrived.
- A monotonic `messageDeletionRevision` is incremented for delete-for-me and delete-for-everyone requests and for each bounded direct-chat text-retention batch that removes messages. An incremental client detects a revision change and performs a bounded full recent-page reconciliation so manual and scheduled deletions are not left visible in a stale cache. Repeated delete-for-me requests do not increment the revision again.
- Emulator regression covers equal-timestamp ordering, a new message arriving after the cursor, deletion revision changes, and idempotent delete replay.

### Remaining read-optimization gaps

- Room chat still refreshes its latest 50 messages every eight seconds. The server already validates `beforePageToken` and `afterPageToken` with timestamp + document-ID ordering, but it does not return a dedicated latest-tail cursor and `DatabaseService.getRoomMessages` sends only `roomId` and discards `hasMore`/`nextPageToken`; the Flutter room screen therefore still reloads the latest page rather than consuming cursors.
- `getMyDirectChats` still returns at most 50 inbox conversations without a member-facing page token.
- Story listing remains fixed at 50; room listing and discovery continuation still need a complete cursor and permission review.
- No before/after Firestore read counts per active session have been captured. The implementation is intended to reduce repeated message-document reads, but no numeric savings are asserted.
- The eight-second direct-chat refresh interval remains unchanged; the optimization is incremental data retrieval, not merely a longer timer.

### Retention and deletion reliability

- The current server sweep uses bounded pages, exact object-name matching, generation-preconditioned deletion, known original and sanitized derivative paths, content-free tombstones, retryable failure audit, and a five-minute late-derivative reconciliation clock.
- A Storage finalize trigger deletes a late original/derivative generation only when the asset identity, owner, purpose, expiry/deletion state, and known path all match.
- Text retention is paged with a document-snapshot cursor and respects legal holds and the configured chat mode.
- The sweep currently returns aggregate assets/objects/failures, but does not yet provide the complete owner-facing due/deleted/retried/failed/overdue counters or maximum deletion-lag telemetry required by this plan.
- Emulator tests do not prove real GCS object-version behavior, soft-delete/retention-lock compatibility, or backup expiry. The dedicated non-production GCS acceptance script remains a separate gate. Mandatory cleanup must not be disabled to save money.

### Economy telemetry and protected modes

- `PLATFORM_ECONOMIC_POLICY.enforcementStatus` is explicitly `planning_only`; its thresholds and quota envelopes are planning values, not live billing measurements or provider spend caps.
- No verified production billing export or live Firestore/storage/egress measurements were available in this review. Therefore no cost-per-member estimate and no “100% free” claim is made.
- The full owner-facing operational-counter dashboard, append-only period snapshots, and reset-measurement-period action remain incomplete.
- Any future Watch/Efficiency/Incident mode may lower optional background work only. Authentication, direct/room messaging, calls, wallet/store correctness, safety, privacy, backups/recovery, and mandatory retention remain protected and must never be disabled by an economy switch.

The direct-message read path is the only member-facing incremental flow completed in this slice. Room cursor plumbing, inbox, story, discovery, operational-counter, live-storage, and cost-measurement work remain open acceptance items.
