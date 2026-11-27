# Mawdda Platform 2026 - Practical Verification & Policy Execution Report

- RUN_ID: practical_exec_20261127T214527Z
- START_UTC: 2026-11-27T21:45:27Z
- GENERATED_UTC: 2026-11-27T21:46:23Z
- TARGET_BRANCH: codex/mawda-full-platform-implementation
- MAIN_PLATFORM_REPO: productionhome2022-hash/mawda-platform (PRE_SHA: 4970c7dd9c0a59da86e73cf9d4d6502c58ce5575)
- SIMULATION_LAB_REPO: productionhome2022-hash/mawdda-5000-simulation-lab (PRE_SHA: 41cb66c5504a7f34b6aa01bb7edbcaa44539a758)
- CROSS_REF_PLATFORM_REPORT: https://github.com/productionhome2022-hash/mawda-platform/blob/codex/mawda-full-platform-implementation/audits/practical-execution/practical_exec_20261127T214527Z/MAWDA_PLATFORM_PRACTICAL_VERIFICATION_practical_exec_20261127T214527Z.md
- CROSS_REF_LAB_REPORT: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/blob/codex/mawda-full-platform-implementation/audits/practical-execution/practical_exec_20261127T214527Z/MAWDDA_5000_LAB_PRACTICAL_VERIFICATION_practical_exec_20261127T214527Z.md

## 1. Environment & Resource Measurements
- HAS_NODE=1 | HAS_NPM=1 | HAS_JAVA=1 | HAS_FIREBASE_CLI=1 | HAS_GH=1
- EMULATOR_LOCAL_CAPABILITY: tools_present
- MEMORY_BEFORE: total=7544MB used=5098MB free=102MB
- MEMORY_AFTER: total=7544MB used=5071MB free=109MB
- SYSTEM_LOAD: load_avg: 15.72, 16.41, 16.53
- ISOLATED_TEST_DURATION_SEC: 4

## 2. Executed Checks & Classification
- LAB_ROOT_TEST (unit/integration): skipped_no_script
- LAB_FUNCTIONS_TEST (unit/isolated): failed_or_requires_emulator
- STANDALONE_SIM_SCRIPTS: exited_nonzero:/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-economic-policy.test.js
- GITHUB_ACTIONS_EMULATOR_CI: gh_authenticated
- LIVE_PRODUCTION_TESTS: NOT EXECUTED (strictly prohibited by mandate; project mawda-app-2026 referenced in config only).

## 3. Code & Policy Verification Findings (Engine, Scenarios & Constitution Limits)
=== ENGINE IMPLEMENTATION DETAILS ===
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-intake.ts ---
25:  idempotencyKey: string;
72:  const description = text(data.description, 30, 5000, "invalid_description");
107:  const idempotencyKey = text(data.idempotencyKey, 16, 100, "invalid_idempotency_key");
108:  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
109:    throw new AdvertisingIntakeValidationError("invalid_idempotency_key");
115:    rightsConfirmed: true, idempotencyKey,
118:/** Stable audit document ID lets a retry repair a post-commit audit failure. */
126:export function advertisingIntakeReviewAuditEventId(requestId: string, expectedVersion: number): string {
128:      !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
131:  return "advertising_intake_review_" + requestId + "_" + String(expectedVersion);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/audit-archive.ts ---
183:  const batchId = createHash("sha256")
187:  return `collections/${collectionName}/${yyyy}/${mm}/${dd}/batch-${batchId}.jsonl`;
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-lifecycle.ts ---
444:    await deleteEvidence(requestId).catch(cleanupError =>
445:      logger.warn("Rejected biometric media cleanup queued", { requestId, cleanupError }));
654:        idempotencyKey: requestId, createdAt: acceptedAt,
684:  await deleteEvidence(requestId).catch(error => logger.warn("Biometric evidence deletion queued for retry", { requestId, error }));
688:export const cleanupDecidedBiometricEvidence = onSchedule("every 15 minutes", async () => {
689:  const due = await requests().where("evidenceDeletionStatus", "in", ["pending", "retry_required"]).limit(100).get();
691:    await deleteEvidence(doc.id).catch(error => logger.warn("Biometric evidence cleanup retry failed", { requestId: doc.id, error }));
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/creator-proposals.ts ---
34:  idempotencyKey: string;
99:  const proposalDescription = requiredText(data.proposalDescription, 5000, "invalid_proposal_description");
150:  const idempotencyKey = requiredText(data.idempotencyKey, 100, "invalid_idempotency_key");
151:  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
152:    throw new CreatorProposalValidationError("invalid_idempotency_key");
170:    idempotencyKey,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/default-store-catalog.ts ---
18:  { itemId: "vip_monthly", name: "عضوية VIP", description: "شارة وامتيازات العضوية المميزة", category: "vip", priceCoins: 5000, durationDays: 30, sortOrder: 10 },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/economy-pricing.ts ---
68:  { packageId: "coins_15000", name: "15,000 كوين", coins: 15000, priceMinor: 3499, currency: "USD", currencyExponent: 2, active: true },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-ad-finance.ts ---
12:  idempotencyKey: string;
58:  const idempotencyKey = requiredText(input.idempotencyKey, 16, 100, "invalid_idempotency_key");
59:  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
60:    throw new FeaturedAdFinancialValidationError("invalid_idempotency_key");
85:    campaignId, action, idempotencyKey, amountMinor, currency,
179:    throw new FeaturedAdFinancialValidationError("invalid_idempotency_identity");
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/guest-sessions.ts ---
37:async function cleanupGuestRoomMemberships(uid: string): Promise<void> {
79:/** Persist a retryable cleanup state before removing guest room memberships. */
91:    if (current.status === "cleanup_pending") return;
95:      status: "cleanup_pending",
98:      cleanupRequestedAt: FieldValue.serverTimestamp(),
104:/** Idempotently finish cleanup; failures leave a scheduled retry marker. */
108:  if (!snapshot.exists || snapshot.data()?.status !== "cleanup_pending") return;
109:  await cleanupGuestRoomMemberships(uid);
112:    if (!latest.exists || latest.data()?.status !== "cleanup_pending") return;
118:      cleanupCompletedAt: FieldValue.serverTimestamp(),
169:        idempotentReplay: true,
178:        retryAt: previousNextMs,
198:    return { active: true, expiresAt: expiresAt.toMillis(), nextEligibleAt: nextEligibleAt.toMillis(), idempotentReplay: false };
210:  if (data.status === "cleanup_pending" ||
273:/** Scheduled cleanup prevents expired guest memberships from inflating room counts. */
274:export const cleanupExpiredGuestSessions = onSchedule("every 5 minutes", async () => {
279:    .where("status", "in", ["active", "cleanup_pending"])
290:    // A failure leaves cleanup_pending in place; the next scheduled run retries it.
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/index.ts ---
70:export { getMyBiometricVerificationStatus, getBiometricVerificationPhrase, startBiometricVerificationRequest, submitBiometricVerificationRequest, listOwnerBiometricVerificationRequests, getOwnerBiometricEvidencePlayback, decideBiometricVerificationRequest, cleanupDecidedBiometricEvidence } from "./biometric-lifecycle";
251:    const batch = db.batch();
256:        batch.update(tokenDocs[index].ref, { active: false, invalidatedAt: FieldValue.serverTimestamp() });
260:    if (staleTokens > 0) await batch.commit();
472:        netAmount: prior.netAmount, status: prior.status, idempotentReplay: true,
593:      idempotentReplay: false,
601:    idempotentReplay: result.idempotentReplay,
603:  if (result.idempotentReplay) {
604:    logger.debug("Coin transfer idempotent replay", transferLog);
802:        idempotentReplay: true,
818:      idempotentReplay: false,
999:      idempotencyKey: initialEmailCycle.cycleId,
1598:  // The media ID is the idempotency key: a retry cannot publish duplicates.
1602:  let idempotentReplay = false;
1617:        idempotentReplay = true;
1652:  return { storyId: storyRef.id, mediaId, expiresAt: expiresAtMs, idempotentReplay };
2191: * calendar-month retry/renewal rules and exactly-once central wallet ledger.
2429:      idempotencyKey: cycleId,
2545:        return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: true };
2596:        return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: true };
2612:    return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: false };
2614:  if (!result.idempotentReplay) {
3164:    return { chatId, messageId, deleted: true, idempotentReplay: true };
3167:    return { chatId, messageId, deleted: true, idempotentReplay: false };
3175:    logger.error("Direct message media deletion remains pending for retry.", {
3217:  return { chatId, messageId, deleted: true, idempotentReplay: false };
3357:      return { chatId: input.chatId, messageId, senderLabel, idempotentReplay: true };
3443:    return { chatId: input.chatId, messageId, senderLabel, idempotentReplay: false };
3506:  let result: { idempotentReplay: boolean };
3541:      return { idempotentReplay: true };
3583:    return { idempotentReplay: false };
3608:    outcome: result.idempotentReplay ? "replayed" : "announced",
3617:    idempotentReplay: result.idempotentReplay,
4135:        ["self_destructed", "manually_deleted", "manual_deletion_pending", "expired_cleanup_in_progress"].includes(String(asset.status)) ||
4311:  { schedule: "every 60 minutes", timeZone: "UTC", timeoutSeconds: 300 },
4545:  } else if (headSequence > 5000) {
4604:  { schedule: "every 15 minutes", timeZone: "UTC", timeoutSeconds: 540 },
4842: * checkpoint so Firestore cursor tampering cannot silently skip a batch.
4845:  { schedule: "every 15 minutes", timeZone: "UTC", timeoutSeconds: 540 },
5247:    // Replayed RSVPs remain idempotent even when the event has since filled.
5308:    if (!attendeeSnapshot.exists) return { eventId, attending: false, idempotentReplay: true };
5318:    return { eventId, attending: false, idempotentReplay: false };
5451:      return { messageId, idempotentReplay: true };
5464:    return { messageId, idempotentReplay: false };
5466:  if (!result.idempotentReplay && !isGuest) {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-cleanup.ts ---
11:    throw new Error("Invalid media cleanup clock or grace period.");
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media.ts ---
33:import { MEDIA_UPLOAD_CLEANUP_GRACE_MS, uploadIntentIsEligibleForCleanup } from "./media-cleanup";
54: * retryable; active legal holds always block this path.
213:      outcome: "retry_required",
329:    response.status(503).send("Scanner reported an incomplete scan; retry required");
373:      response.status(200).json({ mediaId: verdict.mediaId, status: asset.status, idempotentReplay: true });
622:  { document: "mediaAssets/{mediaId}", retry: true },
648:    signal: AbortSignal.timeout(5_000),
659:    retry: true,
661:    timeoutSeconds: 240,
721:        "idempotency-key": `${job.mediaId}:${job.objectGeneration}`,
731:      signal: AbortSignal.timeout(210_000),
1756:  const allowedStatuses = ["upload_authorized", "pending_security_scan", "scanner_clean_pending_processing", "rejected", "security_approved", "retention_cleanup_in_progress", "retained_deleted"];
1918: * cleanup/finalize race; failed object deletion is retried on the next sweep.
1920:export const cleanupExpiredMediaUploadIntents = onSchedule(
1924:    const cleanupAgeMs = MEDIA_SIGNED_URL_TTL_MS.upload + MEDIA_UPLOAD_CLEANUP_GRACE_MS;
1925:    const cutoff = Timestamp.fromMillis(nowMs - cleanupAgeMs);
1927:    const [expired, retrying] = await Promise.all([
1930:      assets.where("status", "==", "expired_cleanup_in_progress")
1934:    for (const doc of [...expired.docs, ...retrying.docs]) candidates.set(doc.id, doc);
1953:            status: "expired_cleanup_in_progress",
1954:            cleanupStartedAt: FieldValue.serverTimestamp(),
1960:        if (data.status === "expired_cleanup_in_progress") {
1961:          const recheckAt = data.cleanupMissingObjectRecheckAt as Timestamp | undefined;
1983:          const recheckAt = current.data()?.cleanupMissingObjectRecheckAt as Timestamp | undefined;
1988:              if (!latest.exists || latestData?.status !== "expired_cleanup_in_progress" ||
1989:                  latestData.cleanupMissingObjectRecheckAt) return;
1991:                cleanupMissingObjectFirstSeenAt: FieldValue.serverTimestamp(),
1992:                cleanupMissingObjectRecheckAt: Timestamp.fromMillis(Date.now() + 6 * 60 * 60 * 1000),
1998:                action: "media_upload_cleanup_waiting_for_object",
2021:          if (!current.exists || current.data()?.status !== "expired_cleanup_in_progress") return;
2042:        // Keep the cleanup claim so the next scheduled sweep retries safely.
2047:          outcome: "retry_required",
2048:          failureCode: error instanceof Error ? error.name : "cleanup_error",
2053:    logger.info("Expired media upload cleanup completed", { reclaimed });
2066:  { cors: false, maxInstances: 5, memory: "512MiB", timeoutSeconds: 120 },
2173:  { cors: false, maxInstances: 5, memory: "256MiB", timeoutSeconds: 60 },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/production-applications.ts ---
22:  idempotencyKey: string;
78:  const interviewAnswers = required(data.interviewAnswers, 20, 5000, "invalid_interview_answers");
79:  const idempotencyKey = required(data.idempotencyKey, 16, 100, "invalid_idempotency_key");
80:  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
81:    throw new ProductionApplicationValidationError("invalid_idempotency_key");
102:    idempotencyKey,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/retention.ts ---
103:  "security_approved", "rejected", "expired_cleanup_in_progress", "expired", "manual_deletion_pending",
161:        logger.error("Late media derivative reconciliation failed; retry remains scheduled.", {
261:              status: "expired_cleanup_in_progress",
299:            const batch = db.batch();
303:              batch.update(message.ref, {
312:            await batch.commit();
344:            const batch = db.batch();
346:              batch.update(message.ref, {
355:            await batch.commit();
385:              logger.warn("Expired story document cleanup will retry with its media tombstone.", {
422:            actorUid: "system-retention", mediaId, action: asset.status === "manual_deletion_pending" ? "chat_media_manual_delete_retry" : purpose === "profile_album" ? "profile_album_media_delete" : purpose === "story" ? "story_media_expiry_delete_retry" : purpose === "avatar_cover" ? "avatar_cover_media_expiry_delete_retry" : "chat_media_self_destruct",
423:            outcome: "retry_required", purpose,
428:          logger.error("Chat media deletion failed; asset remains for retry.", {
445:      const batch = db.batch();
446:      for (const story of expiredStories.docs) batch.delete(story.ref);
447:      await batch.commit();
479:    const batch = db.batch();
482:    let batchMessages = 0;
532:          batch.delete(db.collection("users").doc(recipientUid)
537:      batch.delete(messageDoc.ref);
538:      batchMessages += 1;
541:    if (batchMessages > 0) {
544:      // 500-write batch ceiling.
568:          batch.update(chatRef, chatUpdate);
573:        await batch.commit();
574:        messages += batchMessages;
576:        logger.error("Chat text deletion batch failed; scheduled sweep will retry.", {
579:        failures += batchMessages;
599:    const batch = db.batch();
600:    for (const entry of snapshot.docs) batch.delete(entry.ref);
601:    await batch.commit();
704:  { schedule: "every 5 minutes", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
714:  { schedule: "every 1 hours", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
724:  { schedule: "every 24 hours", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
734:  { schedule: "every 24 hours", timeZone: "UTC", timeoutSeconds: 300, memory: "256MiB" },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-rental.ts ---
17:  { planId: "room_180d", name: "استئجار غرفة 180 يوماً", durationDays: 180, priceCoins: 5000, active: true },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/sticker-policy.ts ---
158: * Membership, pack publication, media approval and idempotency remain server duties.
185:/** Bind idempotent retries to the complete sticker message identity, not mediaId alone. */
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-purchase.ts ---
98:/** Bind an idempotent purchase replay to the original member, item and confirmed price. */
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/wallet-ledger.ts ---
53:    idempotencyKey: input.requestId,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-governance.test.js ---
51:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
288:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
297:  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, maxCommitmentMinor: "50000" } }), false);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-intake.test.js ---
23:  idempotencyKey: "advertising-intake-key-0001",
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js ---
78:test("archives every approved audit collection using deterministic immutable batch names", () => {
86:  assert.match(objectName, /^collections\/verificationAuditLogs\/\d{4}\/\d{2}\/\d{2}\/batch-[a-f0-9]{20}\.jsonl$/);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-media.test.js ---
46:  assert.equal(readMp4DurationMs(headerV0("mvhd", 1000, 5000)), 5000);
51:  for (const duration of [3000, 3500, 5000]) assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
52:  for (const duration of [0, 2999, 2999.9, 5000.1, 5001, Number.NaN, Number.POSITIVE_INFINITY]) {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/contracts-workflow.test.js ---
22:  commitmentMinor: 25000,
38:  assert.equal(draft.commitmentMinor, 25000);
107:    signedAtMs: 5000,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/creator-proposals.test.js ---
21:  idempotencyKey: "creator-proposal-key-0001",
137:test("requires a unique request idempotency key with a safe format", () => {
139:    () => validateCreatorProposalInput({ ...base, idempotencyKey: "bad/key" }),
140:    /invalid_idempotency_key/,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/engagement-rewards.test.js ---
87:  assert.deepEqual(eligibleHeartbeatDelta(null, 5000, 1, 1, true, true), {
88:    deltaMs: 0, nextHeartbeatAtMs: 5000, nextSequence: 2, paused: false,
91:    deltaMs: 5000, nextHeartbeatAtMs: 6000, nextSequence: 2, paused: false,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-ad-finance.test.js ---
12:  idempotencyKey: "finance_operation_0001",
53:    ...base, idempotencyKey: "finance_operation_0002", action: "refund_recorded",
60:    ...base, idempotencyKey: "finance_operation_0006", action: "refund_recorded",
64:    ...base, idempotencyKey: "finance_operation_0003", action: "settlement_reconciled",
71:    ...base, idempotencyKey: "finance_operation_0004", action: "refund_recorded",
77:    ...base, idempotencyKey: "finance_operation_0005", action: "review_completed",
84:  const initial = { currency: "USD", receivedMinor: 5000, refundedMinor: 0, reconciledMinor: 5000,
93:test("idempotency document identity is stable and opaque", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/group-call-economy.test.js ---
15:  updatedAtMs: 1795000000000,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/biometric-verification.integration.test.js ---
88:async function cleanup(uid, requestIds) {
170:    assert.equal(ledger.data().idempotencyKey, started.requestId);
180:    await cleanup(uid, ids);
186:  const tag = suffix(), uid = "biometric_retry_" + tag, ownerUid = "biometric_owner_retry_" + tag;
189:    uid, fullName: "Retry Member", username: "retry_" + Math.floor(Math.random() * 1000000),
236:    await cleanup(uid, ids);
262:    await cleanup(uid, ids);
288:    await cleanup(uid, ids);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/call-signaling.integration.test.js ---
402:    assert.equal(replay.idempotentReplay, true);
405:    assert.equal(afterStart.length, 8, "expired attempts are pruned and the idempotent replay is not charged twice");
465:    assert.equal(replay.idempotentReplay, true);
619:    assert.equal(requested.idempotentReplay, false);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/capacity-media-management.integration.test.js ---
43:    expectedVersion: 0,
58:      expectedVersion: 0,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/coin-package-gifts.integration.test.js ---
120:    assert.equal(approved.idempotentReplay, false);
140:    assert.equal(replay.idempotentReplay, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/direct-message-deletion.integration.test.js ---
30:test("member block and unblock are server-authorized, idempotent state updates", async () => {
194:test("direct delete-for-everyone removes text and notifications, redacts preview, and is idempotent", async () => {
223:    assert.equal(first.idempotentReplay, false);
231:    assert.equal(replay.idempotentReplay, true);
276:test("room delete-for-me is member-scoped and room delete-for-everyone erases text idempotently", async () => {
301:    assert.equal(replay.idempotentReplay, true);
454:test("a legal hold hides the message while preventing media erasure; retry after release completes deletion", async () => {
516:    const retry = await deleteDirectMessageForEveryone.run(memberRequest(alice, { chatId, messageId }));
517:    assert.equal(retry.deleted, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/engagement-rewards.integration.test.js ---
26:async function cleanupTimedCampaign(campaignId) {
45:test("attendance rewards are server-policy gated, UTC-period idempotent and ledger-atomic", async () => {
66:    assert.equal(results.filter((r) => r.idempotentReplay === false).length, 1);
67:    assert.equal(results.filter((r) => r.idempotentReplay === true).length, 1);
168:      eligibleMs: 15000,
170:      lastHeartbeatAtMs: Date.now() - 5000,
175:    assert.equal(heartbeat.eligibleMs >= 15000, true);
181:    assert.equal(replay.idempotentReplay, true);
206:        cleanupTimedCampaign(campaignId),
272:      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
313:      eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000,
338:      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
411:      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
473:      ...(campaignId ? [cleanupTimedCampaign(campaignId)] : []),
495:    await Promise.all(sessions.map((id) => db.collection("timedAdSessions").doc(id).update({ eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000 })));
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-finance.integration.test.js ---
21:test("advertiser financial events are owner-only, immutable, multi-receipt and idempotent", async () => {
81:      idempotencyKey: `payment_key_${tag}`,
93:    assert.equal(first.idempotentReplay, false);
110:    assert.equal(replay.idempotentReplay, true);
118:    assert.equal(replayAfterPolicyDisable.idempotentReplay, true);
142:      ...payment, idempotencyKey: `payment_key_2_${tag}`,
143:      externalReference: `bank_receipt_2_${tag}`, amountMinor: 5000,
146:    assert.equal(second.snapshot.receivedMinor, 15000);
156:      idempotencyKey: `refund_key_${tag}`,
163:      idempotencyKey: `settlement_key_${tag}`,
171:    assert.equal(snapshot.data().receivedMinor, 15000);
183:        idempotencyKey: `disabled_payment_${tag}`,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-policy.integration.test.js ---
39:    expectedVersion: initial.version,
49:      expectedVersion: initial.version, policy,
55:      expectedVersion: saved.version,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-settlement.integration.test.js ---
42:      serverValidatedProgressPercent: 100, startedAtMs: now - 15000,
52:    assert.equal(results.filter((item) => item.rewarded && !item.idempotentReplay).length, 1);
53:    assert.equal(results.filter((item) => item.rewarded && item.idempotentReplay).length, 1);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/guest-session.integration.test.js ---
6:  startGuestSession, getGuestSessionStatus, endGuestSession, listGuestPublicRooms, cleanupExpiredGuestSessions,
61:      const batch = db.batch();
63:        batch.set(roomRef(id), {
69:      await batch.commit();
105:    assert.equal(started.idempotentReplay, false);
152:    assert.equal(replayedStart.idempotentReplay, true);
167:    assert.equal(memberText.idempotentReplay, false);
215:    assert.equal(message.idempotentReplay, false);
219:    assert.equal(replay.idempotentReplay, true);
319:        // Smaller chunks also make cleanup robust against future query predicates.
323:          if (roomIdChunk.length > 20) throw new Error("Guest test cleanup IN chunk exceeded its safe bound.");
332:        const batch = db.batch();
333:        members.docs.forEach((doc) => batch.delete(doc.ref));
334:        messages.docs.forEach((doc) => batch.delete(doc.ref));
335:        batch.delete(roomRef(id));
336:        await batch.commit();
345:  const uid = `guest_cleanup_${suffix()}`;
351:    const batch = db.batch();
353:      batch.set(roomRef, { name: "Guest cleanup fixture", status: "active", kind: "public",
355:      batch.set(roomRef.collection("members").doc(uid), { uid, role: "guest" });
357:    await batch.commit();
366:    assert.ok(endedSession.cleanupCompletedAt, "session must be finalized only after membership cleanup");
375:    const batch = db.batch();
377:      batch.delete(roomRef.collection("members").doc(uid));
378:      batch.delete(roomRef);
380:    await batch.commit();
384:test("scheduled cleanup retries a pending guest session and finalizes it only after removing memberships", async () => {
386:  const uid = `guest_retry_${suffix()}`;
392:    const batch = db.batch();
394:      batch.set(roomRef, {
395:        name: "Guest cleanup retry fixture", status: "active", kind: "public",
398:      batch.set(roomRef.collection("members").doc(uid), { uid, role: "guest" });
400:    batch.set(sessionRef, {
401:      uid, status: "cleanup_pending", terminalStatus: "ended",
403:      cleanupRequestedAt: Timestamp.now(),
405:    await batch.commit();
407:    await cleanupExpiredGuestSessions.run();
411:    assert.ok(finalized.cleanupCompletedAt);
417:    const batch = db.batch();
419:      batch.delete(roomRef.collection("members").doc(uid));
420:      batch.delete(roomRef);
422:    batch.delete(sessionRef);
423:    await batch.commit();
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/media-callables.integration.test.js ---
35:  cleanupExpiredMediaUploadIntents,
252:  assert.ok(asset.data().retentionExpiresAt.toMillis() <= Date.now() + 7 * 24 * 60 * 60 * 1000 + 5000);
524:test("scheduled cleanup deletes abandoned quarantine objects and releases active quota", async () => {
547:  await cleanupExpiredMediaUploadIntents.run();
564:test("missing-object cleanup retains quota until a delayed recheck confirms no late upload", async () => {
584:  await cleanupExpiredMediaUploadIntents.run();
586:  assert.equal(asset.data().status, "expired_cleanup_in_progress");
587:  assert.ok(asset.data().cleanupMissingObjectRecheckAt.toMillis() > Date.now());
593:    cleanupMissingObjectRecheckAt: Timestamp.fromMillis(Date.now() - 1),
595:  await cleanupExpiredMediaUploadIntents.run();
646:    assert.equal(replay.idempotentReplay, true);
1172:    // The scanner gateway may retry a callback after a timeout. The exact same
1173:    // provider/media/generation/hash verdict must be acknowledged idempotently.
1176:    assert.equal(response.body.idempotentReplay, true);
1192:    assert.equal(verdictAudits.length, 1, "an idempotent callback replay must not duplicate audit events");
1207:test("scanner error callback returns retryable 503 without changing quarantined asset", async () => {
1255:    assert.match(String(response.body), /retry required/i);
1324:test("manual-deletion tombstone retry sweeps a late safe derivative by exact object name", async () => {
1349:      "a retry must sweep a late derivative even when the asset is already a content-free tombstone");
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/owner-entitlement-grants.integration.test.js ---
27:test("owner free grant is MFA-gated, audited, coin-neutral, idempotent and repeatable", async () => {
67:    assert.equal(first.idempotentReplay, false);
68:    assert.ok(first.expiresAt >= before + 24 * 60 * 60 * 1000 - 5000);
69:    assert.ok(first.expiresAt <= Date.now() + 24 * 60 * 60 * 1000 + 5000);
84:    assert.equal(replay.idempotentReplay, true);
91:    assert.equal(second.idempotentReplay, false);
105:    assert.equal(purchase.idempotentReplay, false);
110:    assert.equal(replayAfterPurchase.idempotentReplay, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/premium-profile.integration.test.js ---
187:  await memberRef.set(profile(30, { coins: 5000 }));
224:      assert.equal(result.idempotentReplay, false, itemId);
225:      assert.equal(result.newBalance, 5000 - (index + 1) * priceCoins, itemId);
304:    assert.equal(results.filter((result) => result.idempotentReplay === false).length, 1);
305:    assert.equal(results.filter((result) => result.idempotentReplay === true).length, 1);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-events.integration.test.js ---
16:test("room event lifecycle is owner-controlled, age-scoped and RSVP-idempotent", async () => {
84:    assert.equal(cancelled.idempotentReplay, false);
86:    assert.equal(cancelReplay.idempotentReplay, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-rental.integration.test.js ---
39:test("member room rental debits atomically, renews idempotently, transfers and closes with audit trail", async () => {
56:    userRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active", age: 25 }),
74:    assert.equal(createLedger.balanceBefore, 5000);
76:    assert.equal(createReceipt.balanceBefore, 5000);
79:    assert.equal(createReplay.idempotentReplay, true);
89:      "a conflicting idempotency replay must not debit coins again");
107:    assert.equal(replay.idempotentReplay, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/safety-cases.integration.test.js ---
34:test("safety report, owner decision, member appeal and owner appeal resolution are private and idempotent", async () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/specialized-role-capacity.integration.test.js ---
42:  expectedVersion: 0,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/sticker-lifecycle-gates.integration.test.js ---
23:test("published sticker lifecycle supports catalog, direct send, idempotent replay and expiry denial", async () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/store-catalog.integration.test.js ---
26:      ...input, expectedVersion: 0,
41:        ...input, priceCoins: 400, expectedVersion: 0,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/store-gifting.integration.test.js ---
56:      sortOrder: 1, active: true, purchaseEnabled: true, expectedVersion: 0,
74:    assert.equal(concurrentResults.filter((result) => result.idempotentReplay === false).length, 1);
75:    assert.equal(concurrentResults.filter((result) => result.idempotentReplay === true).length, 1);
76:    const first = concurrentResults.find((result) => result.idempotentReplay === false);
91:    assert.equal(replay.idempotentReplay, true);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/test-persona-interaction.integration.test.js ---
70:    assert.equal(response.idempotentReplay, false);
90:    assert.equal(replay.idempotentReplay, true);
141:          const batch = db.batch();
142:          messages.docs.forEach((doc) => batch.delete(doc.ref));
143:          batch.delete(chatRef);
144:          await batch.commit();
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/wallet-store.integration.test.js ---
28:test("coin transfer atomically writes both wallet ledgers and platform commission; retries are idempotent", async () => {
44:    senderRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" }),
57:    assert.equal(concurrentResults.filter((value) => value.idempotentReplay === false).length, 1);
58:    assert.equal(concurrentResults.filter((value) => value.idempotentReplay === true).length, 1);
59:    const result = concurrentResults.find((value) => value.idempotentReplay === false);
73:    assert.equal(senderLedger.data().balanceBefore, 5000);
77:    assert.equal(transfer.data().senderBalanceBefore, 5000);
92:    assert.equal(replay.idempotentReplay, true);
203:test("store purchase atomically charges, records receipt and ledger, grants entitlement, and is idempotent", async () => {
220:  await memberRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" });
225:      active: true, purchaseEnabled: true, fulfillmentReady: true, expectedVersion: 0,
231:      active: true, purchaseEnabled: true, fulfillmentReady: true, expectedVersion: 1,
241:    assert.equal(result.idempotentReplay, false);
250:    assert.equal(ledger.data().balanceBefore, 5000);
252:    assert.equal(purchase.data().balanceBefore, 5000);
260:    assert.equal(replay.idempotentReplay, true);
309:        sortOrder: 1, active: true, purchaseEnabled: false, expectedVersion: 0,
325:    ["vip_monthly", 5000], ["title_custom", 800], ["badge_special", 1200],
382:      paymentPolicy, customCoinRequestBounds: { minCoins: 100, maxCoins: 50000 },
396:    assert.deepEqual(readback.customCoinRequestBounds, { minCoins: 100, maxCoins: 50000 });
408:    assert.equal(available.customCoinRequestBounds.maxCoins, 50000);
447:test("manual coin package request issues no coins until owner verifies external payment; approval is atomic and idempotent", async () => {
503:    assert.equal(reported.idempotentReplay, false);
508:    assert.equal(reportReplay.idempotentReplay, true);
542:    assert.equal(approved.idempotentReplay, false);
557:    assert.equal(replay.idempotentReplay, true);
597:      customCoinRequestBounds: { minCoins: 100, maxCoins: 50000 },
624:test("owner live streams are scoped to owner direct chats or active rooms and are idempotent", async () => {
646:    assert.equal(sent.idempotentReplay, false);
654:    assert.equal(replay.idempotentReplay, true);
695:    assert.equal(rented.idempotentReplay, false);
791:        expectedVersion: 0,
806:      expectedVersion: 1,
827:      assert.equal(result.idempotentReplay, false, itemId);
846:      assert.equal(replay.idempotentReplay, true, itemId);
877:        expectedVersion: 0,
891:      expectedVersion: 0,
986:        expectedVersion: Number.MAX_SAFE_INTEGER,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-cleanup.test.js ---
6:} = require("../lib/media-cleanup");
8:test("abandoned upload cleanup waits for URL expiry plus a full grace period", () => {
16:test("cleanup eligibility rejects invalid timestamps and grace periods", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-chat-review.test.js ---
77:test("owner participation rejects malformed chat, message text, and idempotency keys", () => {
147:  const token = encodeOwnerMessagePageToken(1794500000123, "message_abc-123");
149:    createdAtMillis: 1794500000123,
165:test("announced owner review accepts an explicit bounded notice and idempotency key", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/retention.test.js ---
24:test("sticker cleanup is isolated from the five-minute chat media sweep", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-rental.test.js ---
18:  assert.equal(calculateRoomRentalBalance(5000, 1000), 4000);
40:      { planId: "room_180d", durationDays: 180, priceCoins: 5000, active: true },
51:    { planId: "room_long_10y", name: "خطة طويلة", durationDays: 3650, priceCoins: 250000, active: false },
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/rules/firestore.rules.test.js ---
30:  await env.cleanup();
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/rules/storage.rules.test.js ---
22:  await env.cleanup();
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/safety-cases.test.js ---
33:test("valid appeal requires a case, meaningful reason and idempotency key", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/sticker-policy.test.js ---
28:    sizeBytes: 512 * 1024, durationMs: 5000, frameCount: 50,
32:    sizeBytes: 512 * 1024 + 1, durationMs: 5000, frameCount: 50,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-purchase.test.js ---
14:  assert.equal(calculateStorePurchaseBalance(5000, 1250), 3750);
51:    { itemId: "title_a", category: "title", itemName: "لقب النخبة", status: "active", expiresAt: { toMillis: () => NOW + 5000 } },
60:      { itemId: "title_a", itemName: "لقب النخبة", category: "title", expiresAtMs: NOW + 5000 },
76:test("purchase idempotency requires the same member, item, price and catalog version", () => {
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/advertising_intake_screen.dart ---
31:  String? _idempotencyKey;
60:  void _invalidate() => _idempotencyKey = null;
83:    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
102:        'idempotencyKey': _idempotencyKey,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/biometric_verification_screen.dart ---
177:      // best-effort cleanup only; failure must not turn a successful upload into failure.
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/capacity_media_management_screen.dart ---
115:        'expectedVersion': _version,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/main_user_screen.dart ---
99:      // Push-token cleanup is best-effort: a network failure must never keep
104:        // Firebase Auth sign-out remains mandatory even when token cleanup fails.
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/media_workspace_screen.dart ---
181:  String? _idempotencyKey;
198:  void _invalidateRequest() => _idempotencyKey = null;
237:    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
260:        'idempotencyKey': _idempotencyKey,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/my_contracts_screen.dart ---
100:        'expectedVersion': contract['version'],
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_advertising_intake_screen.dart ---
81:        'expectedVersion': item['requestVersion'],
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_advertising_rewards_screen.dart ---
230:        if (_editingCampaignId != null && _editingVersion != null) 'expectedVersion': _editingVersion,
433:        'idempotencyKey': 'owner_finance_' + suffix,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_contract_center_screen.dart ---
91:        'idempotencyKey': const Uuid().v4().replaceAll('-', ''),
180:        'expectedVersion': contract['version'],
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_featured_ads_dashboard_screen.dart ---
157:        'expectedVersion': _policyVersion,
216:        if (_editingId != null) 'expectedVersion': _editingVersion,
287:  Future<void> _reviewCreative(String id, int expectedVersion, {required bool approved}) async {
301:        'expectedVersion': expectedVersion,
313:  Future<void> _status(String id, String status, int expectedVersion) async {
317:        'campaignId': id, 'status': status, 'expectedVersion': expectedVersion,
329:    final expectedVersion = (item['version'] as num?)?.toInt() ?? 0;
330:    if (campaignId.isEmpty || expectedVersion < 1) return;
360:              Text('الحملة: $campaignId • الإصدار $expectedVersion'),
425:        'idempotencyKey': 'featured_finance_${DateTime.now().microsecondsSinceEpoch}',
427:        'expectedVersion': expectedVersion,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_featured_ads_screen.dart ---
149:        'expectedVersion': _rewardPolicyVersion,
184:        if (_editingId != null) 'expectedVersion': _editingVersion,
248:        'campaignId': item['campaignId'], 'status': status, 'expectedVersion': version,
258:  String _idempotencyKey() {
322:        'idempotencyKey': _idempotencyKey(),
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_production_applications_screen.dart ---
74:        'expectedVersion': item['applicationVersion'],
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/production_application_screen.dart ---
44:  String? _idempotencyKey;
67:    _idempotencyKey ??= const Uuid().v4().replaceAll('-', '');
87:        'idempotencyKey': _idempotencyKey,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/reward_center_screen.dart ---
132:        content: Text(data['idempotentReplay'] == true
303:        content: Text(result['idempotentReplay'] == true
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/stories_screen.dart ---
43:    // Resolve previews in small parallel batches: avoid serial latency without
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/super_admin_screen.dart ---
87:        // Token cleanup is best-effort; authentication must still end.
822:        expectedVersion: existing?['version'] as int? ?? 0,
981:        expectedVersion: _transferVersion,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/coin_system_service.dart ---
30:  final bool idempotentReplay;
38:    required this.idempotentReplay,
49:      idempotentReplay: data['idempotentReplay'] == true,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/super_admin_security_service.dart ---
42:    required int expectedVersion,
47:      'expectedVersion': expectedVersion,
78:    required int expectedVersion,
90:      'expectedVersion': expectedVersion,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/processors.js ---
28:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
105:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
140:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
153:    if (!Number.isSafeInteger(durationMs) || durationMs < 1 || durationMs > 5000 ||
172:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
209:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
231:  ], { timeout: 180_000, maxBuffer: 64 * 1024 });
242:    timeout: 15_000, maxBuffer: 64 * 1024,
255:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
263:    timeout: 60_000, maxBuffer: 64 * 1024,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/server.js ---
65:    signal: AbortSignal.timeout(90_000),
110:    ], { timeout: SCAN_TIMEOUT_MS, maxBuffer: 1024 * 1024 });
185:    // A retry after a successful derivative upload but failed callback must be
186:    // idempotent. Reuse only a derivative whose complete provenance matches.
224:      "idempotency-key": `${payload.mediaId}:${payload.objectGeneration}`,
228:    signal: AbortSignal.timeout(15_000),
263:      timeout: 10_000,
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/processors.integration.test.js ---
271:    assert.ok(metadata.durationMs > 0 && metadata.durationMs <= 5000);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/coin_transfer_models_test.dart ---
35:    test('retains the unified transfer id and idempotency result', () {
42:        'idempotentReplay': true,
46:      expect(receipt.idempotentReplay, isTrue);
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/firestore-transient-retry.test.js ---
8:} = require("../scripts/firestore-transient-retry.cjs");
12:    { code: 10, message: "Transaction lock timeout" },
17:    { message: "Transaction lock timeout" },
30:    if (calls < 4) throw { code: 10, message: "Transaction lock timeout" };
43:test("does not retry permanent authorization or validation failures", async () => {
52:test("stops after the configured retry budget and surfaces the last error", async () => {
54:  const failure = { code: 10, message: "Transaction lock timeout" };
--- FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js ---
39:async function retryAbortedTransaction(operation, maxAttempts = 7) {
46:      const retryable = code === "10" || code === "aborted" ||
47:        /\bABORTED\b|Transaction lock timeout|too much contention/i.test(message);
48:      if (!retryable || attempt === maxAttempts - 1) throw error;
58:async function inBatches(items, size, worker) {
69:test("load-test fixture is emulator-only and contains 5000 unique synthetic personas", async () => {
74:  assert.ok(personas.length >= 5000, "the full 5000-persona run is required");
79:test("provision all 5000 emulator-only identities and synthetic member profiles", async () => {
80:  await inBatches(personas, 100, async (persona) => {
145:for (const count of [500, 1000, 2500, 5000]) {
149:    await inBatches(cohort, BATCH_SIZE, async (persona) => {
152:      const batch = db.batch();
153:      ledger.docs.forEach((doc) => batch.delete(doc.ref));
154:      batch.update(userRef, { coins: 10000 });
155:      await batch.commit();
179:      await inBatches(pairs, BATCH_SIZE, async ([sender, recipient], pairIndex) => {
190:          assert.equal(result.idempotentReplay, false);
197:          assert.equal(replay.idempotentReplay, true);
285:      if (count === 5000) metrics.personaCoverage = coverageRows;
290:        idempotentReplays: pairs.length,
313:test("all 5000 personas complete a connected member, premium-profile, discovery, room and event lifecycle", async () => {
316:  assert.equal(metrics.createdUsers, 5000, "the complete 5000-persona fixture must be provisioned first");
375:        description: "Emulator-only VIP purchase used by the 5000-persona lifecycle test.",
378:          expectedVersion: 0,
394:    await inBatches(personas, 100, async (persona) => {
401:      const batch = db.batch();
403:        batch.set(userRef.collection("entitlements").doc(itemId), {
409:      batch.update(userRef, { profileVisibility: "public", profileCompleted: true, accountStatus: "active", discoveryBoostExpiresAt: expiresAt });
410:      await batch.commit();
417:    await inBatches(personas, 100, async (persona) => {
423:      assert.equal(purchase.idempotentReplay, false);
426:      assert.equal(replay.idempotentReplay, true);
444:    await inBatches(personas, 100, async (persona) => {
456:    await inBatches(personas, 100, async (persona) => {
468:    await inBatches(personas, 100, async (persona) => {
479:    await inBatches(personas, 100, async (persona) => {
492:    await inBatches(personas, 100, async (persona) => {
508:    await inBatches(personas, 100, async (persona) => {
525:    await inBatches(roomGroups, 40, async (group) => {
543:    // timeouts before the 5,000-persona lifecycle could reach event coverage.
544:    await inBatches(roomGroups, 20, async (group) => {
554:    await inBatches(roomGroups, 40, async (group) => {
573:    // caused emulator lock timeouts and measured emulator write contention rather
575:    await inBatches(roomGroups, 40, async (group) => {
584:          await retryAbortedTransaction(() => rsvpRoomEvent.run({

=== CONSTITUTION MEDIA, RETENTION & SAVER RULES IN CODE ===
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/advertising-governance.ts ---
85:  return createHash("sha256").update("specialized-role-v1|" + uid + "|" + role).digest("hex");
130:  if (scopes.length < 1 || scopes.length > 200 ||
132:        scope.trim().length < 1 || scope !== scope.trim() || /[\x00-\x1f\x7f]/.test(scope) || scope.length > 160 || scope === "*")) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/advertising-intake.ts ---
46:  const raw = text(value, 10, 2048, "invalid_portfolio_url");
68:  const displayName = text(data.displayName, 2, 120, "invalid_display_name");
72:  const description = text(data.description, 30, 5000, "invalid_description");
74:    ? text(data.experience, 20, 3000, "invalid_experience") : null;
90:  const proposedDuration = text(data.proposedDuration, 2, 120, "invalid_duration");
120:  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(requestId)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/audit-archive.ts ---
5:export const OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS = 64_281_600;
6:export const OWNER_AUDIT_ARCHIVE_MIN_AGE_MS = 5 * 60 * 1000;
7:export const OWNER_AUDIT_ARCHIVE_BATCH_SIZE = 500;
25:/** The worker refuses buckets without a locked, minimum-24-month retention policy. */
27:  retentionPeriodSeconds: number;
35:    retentionPolicy?: { isLocked?: unknown; retentionPeriod?: unknown };
41:  const retention = value.retentionPolicy;
42:  const retentionPeriodSeconds = typeof retention?.retentionPeriod === "number"
43:    ? retention.retentionPeriod
44:    : Number(retention?.retentionPeriod);
45:  if (retention?.isLocked !== true ||
46:      !Number.isSafeInteger(retentionPeriodSeconds) ||
47:      retentionPeriodSeconds < OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS) {
55:  return { retentionPeriodSeconds, uniformBucketLevelAccess, publicAccessPrevention };
120:): { payload: string; sha256: string } {
132:    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
145:  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
146:  return { payload, sha256 };
183:  const batchId = createHash("sha256")
186:    .slice(0, 20);
200:): { payload: string; sha256: string } {
213:    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
220:  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
221:  return { payload, sha256 };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-evidence.ts ---
1:export const BIOMETRIC_SPOKEN_PHRASE_VERSION = "owner-approved-2026-11-20-v1";
5:export const BIOMETRIC_AUDIO_MAX_DURATION_MS = 20_000;
6:export const BIOMETRIC_VIDEO_MAX_BYTES = 25 * 1024 * 1024;
7:export const BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS = 5 * 60 * 1000;
8:export const BIOMETRIC_EVIDENCE_REVIEW_TTL_MS = 60 * 1000;
9:export const BIOMETRIC_REWARD_COINS = 1500;
21:      !/^[a-z0-9_]{3,20}$/.test(username) || !["male", "female"].includes(gender)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-lifecycle.ts ---
23:const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
171:      evidenceDeletionRetryAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
314:      phraseHash: createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex"),
352:      data.phraseHash !== createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex")) {
379:    typeof asset.scannerSha256 === "string" && /^[a-f0-9]{64}$/.test(asset.scannerSha256) &&
387:      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
393:      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256) ||
428:    if (createHash("sha256").update(audio).digest("hex") !== audioAsset.scannerSha256 ||
429:        createHash("sha256").update(video).digest("hex") !== videoAsset.scannerSha256) {
448:  const audioHash = createHash("sha256").update(audio).digest("hex");
449:  const videoHash = createHash("sha256").update(video).digest("hex");
460:      audioSha256: audioHash, videoSha256: videoHash,
468:    audioSha256: audioHash, videoSha256: videoHash, audioBytes: audio.length, videoBytes: video.length,
476:  const snapshot = await requests().where("status", "==", "pending").limit(50).get();
526:      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
527:      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256)) {
542:      Number(videoMeta.size) > 15 * 1024 * 1024) {
552:    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
559:    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
584:  if (!Number.isSafeInteger(mfaAt) || mfaAt > nowMs || nowMs - mfaAt > 15 * 60 * 1000) {
608:        typeof data.audioSha256 !== "string" || typeof data.videoSha256 !== "string") {
614:        grant.audioSha256 !== data.audioSha256 || grant.videoSha256 !== data.videoSha256 ||
688:export const cleanupDecidedBiometricEvidence = onSchedule("every 15 minutes", async () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-media.ts ---
49:  if (offset + 20 > header.end) throw new Error(`BIOMETRIC_${label}_HEADER_INVALID`);
58:    timescale = buffer.readUInt32BE(offset + 20);
187:  const maxDurationMs = 20_000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-review.ts ---
4:export const BIOMETRIC_REWARD_BETACOINS = 1500;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-verification-cycle.ts ---
4:export const BIOMETRIC_VERIFICATION_REWARD_COINS = 1_500;
6:  BIOMETRIC_VERIFICATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;
33:  const cycleId = createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/biometric-verification.ts ---
58:    acceptedAtMs - mfaAtMs <= 15 * 60 * 1000 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/call-signaling.ts ---
68:        body.sdp.length < 1 || body.sdp.length > 60000) {
85:export const CALL_SIGNAL_MAX_AGE_MS = 2 * 60_000;
86:export const CALL_SIGNAL_MAX_PER_CALLER = 256;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/call-usage-policy.ts ---
10:export const GROUP_AUDIO_CALL_DURATION_MS = 5 * 60 * 1000;
11:export const GROUP_VIDEO_CALL_DURATION_MS = 3 * 60 * 1000;
27:      input.quotaWindowMs < 60000 || input.quotaWindowMs > 365 * 24 * 60 * 60 * 1000) {
32:  if (maxCallDurationMs !== null && (maxCallDurationMs < 60000 ||
33:      maxCallDurationMs > 24 * 60 * 60 * 1000)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/capacity-media-management.ts ---
4:  // Authenticated app heartbeat; a member is active while seen in the last 120 seconds.
5:  activeMemberBasis: "authenticated_app_heartbeat_120s",
25:  activeMemberBasis: "authenticated_app_heartbeat_120s";
62:    activeMemberBasis: "authenticated_app_heartbeat_120s",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/chat-media-policy.ts ---
15:  safePreviewSha256?: unknown;
18:  safeAnimationSha256?: unknown;
21:  safeAudioSha256?: unknown;
24:  safeVideoSha256?: unknown;
27:  safeDocumentSha256?: unknown;
36:  sha256: string;
49:  "image/jpeg": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
50:  "image/png": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
51:  "image/webp": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
52:  "image/gif": { category: "gif", processor: "gif-animation-v1", pathField: "safeAnimationPath", generationField: "safeAnimationGeneration", hashField: "safeAnimationSha256", contentTypes: ["image/gif"], pipelineVersion: "gif-sanitize-preserve-animation-v1" },
53:  "audio/mpeg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
54:  "audio/mp4": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
55:  "audio/ogg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
56:  "audio/wav": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
57:  "video/mp4": { category: "video", processor: "video-transcode-v1", pathField: "safeVideoPath", generationField: "safeVideoGeneration", hashField: "safeVideoSha256", contentTypes: ["video/mp4"], pipelineVersion: "ffmpeg-video-transcode-v1" },
58:  "application/pdf": { category: "document", processor: "pdf-sanitize-v1", pathField: "safeDocumentPath", generationField: "safeDocumentGeneration", hashField: "safeDocumentSha256", contentTypes: ["application/pdf"], pipelineVersion: "pdf-raster-flatten-v1" },
100:  const sha256 = asset[route.hashField];
103:      typeof sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(sha256)) return null;
109:    sha256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/chat-retention-policy.ts ---
1:export const TEMPORARY_CHAT_INACTIVITY_MS = 4 * 60 * 60 * 1000;
2:export const NORMAL_CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
3:export const IMPORTANT_CHAT_TEXT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/coin-purchase-requests.ts ---
66:      data.instructions.trim().length > 2000 ||
95:      data.externalPaymentReference.trim().length > 120 ||
98:      data.verificationNote.trim().length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/contracts-workflow.ts ---
118:  return createHash("sha256").update(canonicalContractJson(value)).digest("hex");
132:  const counterpartyEmail = requiredText(input.counterpartyEmail, 5, 254, "CONTRACT_COUNTERPARTY_EMAIL_INVALID").toLowerCase();
154:  const parentContractId = optionalText(input.parentContractId, 160, "CONTRACT_PARENT_ID_INVALID");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/creator-proposals.ts ---
57:  const raw = requiredText(value, 2048, "invalid_content_url");
99:  const proposalDescription = requiredText(data.proposalDescription, 5000, "invalid_proposal_description");
100:  const proposedDuration = requiredText(data.proposedDuration, 120, "invalid_proposed_duration");
101:  const audienceDescription = optionalText(data.audienceDescription, 1200, "invalid_audience_description");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/default-store-catalog.ts ---
18:  { itemId: "vip_monthly", name: "عضوية VIP", description: "شارة وامتيازات العضوية المميزة", category: "vip", priceCoins: 5000, durationDays: 30, sortOrder: 10 },
19:  { itemId: "title_custom", name: "لقب مميز", description: "لقب مميز يظهر في الملف الشخصي", category: "title", priceCoins: 800, sortOrder: 20 },
20:  { itemId: "badge_special", name: "وسام خاص", description: "وسام إضافي في الملف الشخصي", category: "badge", priceCoins: 1200, sortOrder: 30 },
21:  { itemId: "avatar_frame_30d", name: "إطار صورة متحرك", description: "إطار متحرك للصورة الشخصية لمدة 30 يوماً", category: "frame", priceCoins: 2500, durationDays: 30, sortOrder: 40 },
22:  { itemId: "username_color_30d", name: "اسم ملون", description: "لون مميز للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 1200, durationDays: 30, sortOrder: 50 },
23:  { itemId: "username_animated_30d", name: "اسم متحرك", description: "تأثير متحرك للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 3000, durationDays: 30, sortOrder: 60 },
25:  { itemId: "profile_layout_30d", name: "تصميم ملف احترافي", description: "قالب ملف احترافي لمدة 30 يوماً", category: "profile_layout", priceCoins: 3500, durationDays: 30, sortOrder: 80 },
26:  { itemId: "profile_pin_30d", name: "قسم مثبت", description: "تثبيت قسم مميز في الملف لمدة 30 يوماً", category: "profile_layout", priceCoins: 900, durationDays: 30, sortOrder: 90 },
27:  { itemId: "discovery_boost_7d", name: "تعزيز الظهور", description: "تعزيز الظهور لمدة 7 أيام", category: "boost", priceCoins: 1500, durationDays: 7, sortOrder: 100 },
28:  { itemId: "profile_theme_30d", name: "ثيم وخلفية", description: "ثيم مميز للملف لمدة 30 يوماً", category: "theme", priceCoins: 2000, durationDays: 30, sortOrder: 110 },
29:  { itemId: "visitor_greeting_30d", name: "رسالة ترحيب للزوار", description: "رسالة ترحيب تظهر للزوار لمدة 30 يوماً", category: "greeting", priceCoins: 1000, durationDays: 30, sortOrder: 120 },
30:  { itemId: "voice_call_24h", name: "المكالمات الصوتية — 24 ساعة", description: "استحقاق المكالمات الصوتية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 100, durationDays: 1, sortOrder: 150 },
31:  { itemId: "voice_call_7d", name: "المكالمات الصوتية — أسبوع", description: "استحقاق المكالمات الصوتية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 500, durationDays: 7, sortOrder: 151 },
32:  { itemId: "voice_call_30d", name: "المكالمات الصوتية — شهر", description: "استحقاق المكالمات الصوتية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 1500, durationDays: 30, sortOrder: 152 },
33:  { itemId: "video_call_24h", name: "المكالمات المرئية — 24 ساعة", description: "استحقاق المكالمات المرئية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 250, durationDays: 1, sortOrder: 160 },
34:  { itemId: "video_call_7d", name: "المكالمات المرئية — أسبوع", description: "استحقاق المكالمات المرئية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 1250, durationDays: 7, sortOrder: 161 },
35:  { itemId: "video_call_30d", name: "المكالمات المرئية — شهر", description: "استحقاق المكالمات المرئية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 3750, durationDays: 30, sortOrder: 162 },
38:  { itemId: "media_saver_7d", name: "Mawdda Media Saver — أسبوع", description: "حفظ الوسائط المدعومة محلياً لمدة أسبوع؛ لا يمدد الاحتفاظ على الخادم", category: "media_saver", priceCoins: 200, durationDays: 7, sortOrder: 170 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/direct-chat-id.ts ---
10:  return createHash("sha256").update(first + ":" + second).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/economy-pricing.ts ---
64:  { packageId: "coins_500", name: "500 كوين", coins: 500, priceMinor: 199, currency: "USD", currencyExponent: 2, active: true },
65:  { packageId: "coins_1200", name: "1,200 كوين", coins: 1200, priceMinor: 399, currency: "USD", currencyExponent: 2, active: true },
68:  { packageId: "coins_15000", name: "15,000 كوين", coins: 15000, priceMinor: 3499, currency: "USD", currencyExponent: 2, active: true },
71:  { placementId: "feed_cpm", name: "إعلان ضمن الخلاصة لكل ألف ظهور", billingModel: "cpm", priceMinor: 500, currency: "USD", currencyExponent: 2, active: true },
72:  { placementId: "feed_cpc", name: "إعلان ضمن الخلاصة لكل نقرة", billingModel: "cpc", priceMinor: 25, currency: "USD", currencyExponent: 2, active: true },
73:  { placementId: "featured_daily", name: "إعلان مميز يومي", billingModel: "daily", priceMinor: 1500, currency: "USD", currencyExponent: 2, active: true },
121: * safe, even integer so the server can split it exactly 50/50.
154:  return { enabled: false, rewardCoins: 0, cycleDays: 90 };
167:      (data.cycleDays as number) > 3650 ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/email-verification-cycle.ts ---
5:export const EMAIL_VERIFICATION_REWARD_COINS = 500;
35:  const cycleId = createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/engagement-rewards.ts ---
38:const MAX_AD_DURATION_SECONDS = 15 * 60;
40:const AD_HEARTBEAT_MAX_GAP_MS = 15_000;
91:  // ISO-8601 week number and week-year, calculated in UTC.
98:  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
134:      sponsorLabel.length < 2 || sponsorLabel.length > 60 ||
135:      body.length < 10 || body.length > 1200 ||
153:      durationSeconds < 15 || durationSeconds > MAX_AD_DURATION_SECONDS ||
217:  return createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/featured-ad-finance.ts ---
62:  const note = requiredText(input.note, 5, 1500, "invalid_financial_note");
63:  const externalReference = requiredText(input.externalReference, 3, 160, "invalid_external_reference");
65:    ? null : requiredText(input.evidenceReference, 3, 500, "invalid_evidence_reference");
178:      typeof externalReference !== "string" || externalReference.length < 3 || externalReference.length > 160) {
182:  return createHash("sha256").update(campaignId + ":" + action + ":" + externalReference).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/featured-ad-rewards.ts ---
8:  sameCampaignWindowMs: 24 * 60 * 60 * 1000,
9:  videoCompletionPercent: 90,
55:      !integerInRange(input.sameCampaignWindowMs, 1, 31 * 24 * 60 * 60 * 1000) ||
57:      !integerInRange(input.imageContinuousVisibleMs, 1_000, 60 * 60 * 1000) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/group-call-economy.ts ---
104:  if (!Number.isSafeInteger(maxDurationMs) || maxDurationMs < 1 || maxDurationMs > 24 * 60 * 60 * 1000) {
108:  const maxBillableMinutes = Math.ceil(maxDurationMs / 60000);
135:  const maxBillableMinutes = Math.ceil(maxDurationMs / 60000);
136:  const billableMinutes = Math.max(1, Math.min(maxBillableMinutes, Math.ceil(elapsedMs / 60000)));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/guest-sessions.ts ---
6:const GUEST_DURATION_MS = 60 * 60 * 1000;
7:const GUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;
43:    .limit(200);
73:    if (memberships.size < 200) break;
131:  if (country.length < 2 || country.length > 60 ||
141:/** Creates a minimal guest profile and starts the server-timed 60m/24h allowance. */
252:  // only the first 200 active rooms can hide eligible public rooms behind
282:    .limit(200)
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/index.ts ---
52:import { enforceChatMediaRetention, enforceStickerMediaRetention, enforceChatTextRetention, enforceMediaOperationalAuditRetention, removeLateExpiredChatMediaDerivative } from "./retention";
241:      .collection("pushTokens").where("active", "==", true).limit(500).get();
249:      webpush: { headers: { TTL: "60" } },
513:    // Basis points: 2,000 = 20%. Exact integer arithmetic avoids floating-point drift.
614: * 2,000 = 20%. لا يُسمح للعميل العادي بتغيير إعدادات العمولة.
845: * The profile, unique username reservation, 500-coin email reward and
1008:      rewardAmount: 500,
1035:      "الحد الأدنى للعمر يجب أن يكون عدداً صحيحاً بين 16 و120.",
1138:    const visitorHash = createHash("sha256").update(viewerUid).digest("hex");
1163:    const sinceDay = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
1180:    ? memberData.profileVisitorGreeting.trim().slice(0, 160)
1295:  if (greeting.length < 3 || greeting.length > 160 ||
1297:    throw new HttpsError("invalid-argument", "رسالة الترحيب يجب أن تكون نصاً عادياً من 3 إلى 160 حرفاً دون روابط أو بريد.");
1321:      greetingHash: createHash("sha256").update(greeting).digest("hex"),
1372:  if (!Number.isSafeInteger(viewerAge) || viewerAge < 16 || viewerAge > 120) {
1380:    .limit(150)
1410:    members: members.slice(0, 50).map((member) => ({
1444:  const newExpiry = Timestamp.fromMillis(nowMs + 30 * 24 * 60 * 60 * 1000);
1456:    const assetExpiry = asset.retentionExpiresAt;
1480:        const existingExpiry = previous.retentionExpiresAt instanceof Timestamp
1481:          ? previous.retentionExpiresAt.toMillis()
1486:          retentionExpiresAt: Timestamp.fromMillis(Math.min(existingExpiry, newExpiry.toMillis())),
1487:          retentionPolicyStatus: previous.legalHoldStatus === "active" ? "legal_hold" : supersededPolicy,
1499:      retentionExpiresAt: newExpiry,
1500:      retentionPolicyStatus: asset.legalHoldStatus === "active" ? "legal_hold" : "thirty_day_avatar_cover",
1522:    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
1552:          const currentExpiry = asset.retentionExpiresAt instanceof Timestamp
1553:            ? asset.retentionExpiresAt.toMillis()
1555:          const supersededExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
1558:            retentionExpiresAt: Timestamp.fromMillis(Math.min(currentExpiry, supersededExpiry)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/mawdda-media-plane.ts ---
28:    if (hostname.length > 253 || labels.some((label) =>
83:  if (typeof value !== "string" || value.length > 2048 ||
93:    if (hostname.length > 253 || labels.some((label) =>
129:      !/^[A-Za-z0-9_./-]{3,200}$/.test(input.turnCredentialSecretRef) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-cleanup.ts ---
1:export const MEDIA_UPLOAD_CLEANUP_GRACE_MS = 30 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-controls.ts ---
37:  ttlMs = 5 * 60 * 1000,
47:  sha256: string;
55:  sha256: string;
66:      verdict.sha256 !== expected.sha256 ||
67:      !/^[a-f0-9]{64}$/.test(verdict.sha256) ||
70:      Math.abs(expected.nowMs - verdict.scannedAtMs) > 10 * 60 * 1000) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-derivative-contract.ts ---
27:    maxBytes: 15 * 1024 * 1024,
33:    maxBytes: 20 * 1024 * 1024,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-legal-hold.ts ---
30:  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MEDIA_HOLD_AUTHORITY");
32:  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MEDIA_HOLD_REFERENCE");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-quota.ts ---
3:  maxActiveBytes: 150 * 1024 * 1024,
4:  maxDailyBytes: 500 * 1024 * 1024,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-scanner.ts ---
8:  sha256: string;
23:  sha256: string;
31:  safePreviewSha256?: string;
44:  const expected = createHmac("sha256", secret).update(rawBody).digest();
57:    v.safePreviewPath, v.safePreviewGeneration, v.safePreviewSha256, v.safePreviewContentType,
110:        typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256) ||
117:         (durationMs as number) > 20_000 ||
119:         (frameCount as number) > 50)) return null;
122:         (durationMs as number) > (category === "video" ? 90_000 :
123:           (v.purpose === "biometric" ? 20_000 : 60_000)))) return null;
129:      sha256: d.sha256 as string, contentType: d.contentType as ScannerSafeDerivative["contentType"],
141:      typeof v.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.sha256) ||
143:      Math.abs(nowMs - Number(v.scannedAtMs)) > 10 * 60 * 1000 ||
149:      Number(v.signatureDatabaseAgeMs) > 36 * 60 * 60 * 1000 ||
154:        typeof v.safePreviewSha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.safePreviewSha256) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media-security.ts ---
6:// approved purpose-specific retention deadline and the retention worker enforces it.
10:  upload: 5 * 60 * 1000,
11:  "owner-inspection": 60 * 1000,
36:  "video/mp4": { category: "video", maxBytes: 25 * 1024 * 1024 },
41:  "application/pdf": { category: "document", maxBytes: 20 * 1024 * 1024 },
132:      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/media.ts ---
77:    // Even a retention tombstone may have a late derivative or a replayed
106:      retentionExpiresAt: Timestamp.now(),
181:        if (!["mediaId", "ownerUid", "uploaderType", "mediaPurpose", "createdAt", "retentionExpiresAt", "deletedObjectPaths"].includes(key)) {
189:      tombstone.retentionPolicyStatus = "manual_delete_for_everyone_completed";
191:      tombstone.retentionReconcileAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000);
203:        expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
216:      expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
243:    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
276:async function sha256Object(file: ReturnType<ReturnType<typeof mediaBucket>["file"]>): Promise<string> {
278:    const hash = createHash("sha256");
329:    response.status(503).send("Scanner reported an incomplete scan; retry required");
349:      asset.scannerSha256 === verdict.sha256;
373:      response.status(200).json({ mediaId: verdict.mediaId, status: asset.status, idempotentReplay: true });
393:  const actualHash = await sha256Object(file);
394:  if (actualHash !== verdict.sha256) {
400:    path: string; generation: string; sha256: string; contentType: "image/webp"; sizeBytes: number;
423:        customMetadata?.sourceSha256 !== verdict.sha256 ||
430:    const previewMaxBytes = asset.mediaPurpose === "sticker" ? 256 * 1024 : 2 * 1024 * 1024;
436:    const previewHash = await sha256Object(previewFile);
437:    if (previewHash !== verdict.safePreviewSha256) {
444:      sha256: previewHash,
451:    path: string; generation: string; sha256: string;
485:        custom?.sourceSha256 !== verdict.sha256 ||
491:    const derivativeHash = await sha256Object(derivativeFile);
492:    if (derivativeHash !== derivative.sha256) {
518:      scannerSha256: actualHash,
525:        safePreviewSha256: safePreview.sha256,
535:          safeAnimationSha256: safeNonImageDerivative.sha256,
542:          safeAudioSha256: safeNonImageDerivative.sha256,
549:          safeVideoSha256: safeNonImageDerivative.sha256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/member-message-pagination.ts ---
20:        typeof parsed[1] !== "string" || parsed[1].length < 1 || parsed[1].length > 150) {
31:      typeof messageId !== "string" || messageId.length < 1 || messageId.length > 150) {
39:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
41:      requestedLimit < 1 || requestedLimit > 50) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/member-profile-update.ts ---
61:        update.bio = text(input[key], key, 0, 500, true);
64:        const interests = list(input[key], key, 20, 40);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/member-profile-view.ts ---
33:    ? data.interests.filter((value): value is string => typeof value === "string").slice(0, 20)
43:    bio: safeText(data.bio).slice(0, 500),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/member-profile.ts ---
36:  const username = requiredText(value, "username", 3, 20).toLowerCase();
47:  if (!Number.isSafeInteger(minimumAge) || (minimumAge as number) < 16 || (minimumAge as number) > 120) {
51:  if (typeof age !== "number" || !Number.isSafeInteger(age) || age < minimumAge! || age > 120) {
62:  const interests = stringList(data.interests ?? [], "interests", 20, 40);
80:  if (typeof bio !== "string" || bio.trim().length > 500) {
81:    throw new Error("bio: الحد الأقصى 500 حرف.");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/member-social-links.ts ---
50:    if (typeof raw !== "string" || raw.length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/message-legal-hold.ts ---
36:  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MESSAGE_HOLD_AUTHORITY");
38:  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MESSAGE_HOLD_REFERENCE");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/owner-access.ts ---
1:const OWNER_SESSION_MAX_AGE_SECONDS = 15 * 60;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/owner-audit-chain.ts ---
24:/** SHA-256 over a stable canonical event representation and its chain position. */
39:  return createHash("sha256").update(canonical, "utf8").digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/owner-audit-export.ts ---
15:  const pageSize = input.pageSize === undefined ? 50 : input.pageSize;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/owner-chat-review.ts ---
18:  if (typeof value !== "string" || value.length < 1 || value.length > 256 ||
35:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
42:  if (rawReason.length > 500) {
49:    requestedLimit > 50
84:      typeof messageId !== "string" || messageId.length < 1 || messageId.length > 150) {
102:        typeof value[1] !== "string" || value[1].length < 1 || value[1].length > 150) {
116:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
121:      requestedLimit < 1 || requestedLimit > 50) {
147:  if (noticeText.length < 5 || noticeText.length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/owner-live-stream.ts ---
35:      data.url.length < 10 || data.url.length > 2048 ||
36:      /[\u0000-\u0020\u007f\\<>"'{}|^]/.test(data.url)) {
41:  if (title.length > 120 || description.length > 500) throw new Error("INVALID_LIVE_STREAM_TEXT");
54:      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(hostname)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/platform-economic-policy.ts ---
23:      documentReadsPerDay: 50_000,
24:      documentWritesPerDay: 20_000,
31:      downloadsPerMonth: 50_000,
36:      cpuSecondsPerMonth: 200_000,
41:      transferMiBPerDay: 360,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/privacy-acknowledgement.ts ---
1:export const PRIVACY_POLICY_VERSION = "2026-11-14.1";
2:export const PRIVACY_POLICY_SHA256 =
3:  "3af7c404337db26a806031864f979f54e15a74495818fb24e0eff58a1a267c93";
4:export const PRIVACY_POLICY_HASH = PRIVACY_POLICY_SHA256;
21:  if (input.policyHash !== PRIVACY_POLICY_SHA256) {
38:    policyHash: PRIVACY_POLICY_SHA256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/production-applications.ts ---
43:  const raw = required(value, 10, 2048, code);
78:  const interviewAnswers = required(data.interviewAnswers, 20, 5000, "invalid_interview_answers");
88:    applicantName: required(data.applicantName, 2, 120, "invalid_applicant_name"),
91:    experience: required(data.experience, 20, 4000, "invalid_experience"),
92:    tools: required(data.tools, 5, 1500, "invalid_tools"),
94:    collaboratingCompanies: optional(data.collaboratingCompanies, 1500, "invalid_companies"),
95:    achievements: optional(data.achievements, 2000, "invalid_achievements"),
98:    roleDescription: required(data.roleDescription, 20, 2000, "invalid_role_description"),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/registration-policy.ts ---
21:    minimumAge > 120
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/retention.ts ---
8:import { resolveChatRetentionMode, isChatTextDeletionDue, chatTextRetentionMs, type ChatRetentionMode } from "./chat-retention-policy";
10:export const CHAT_MEDIA_RETENTION_MS = 4 * 60 * 60 * 1000;
11:export const STICKER_MEDIA_RETENTION_MS = 60 * 60 * 1000;
12:export const CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
13:const RETENTION_BATCH_SIZE = 150;
15:const retentionJobsEnabled = defineString("MAWDA_RETENTION_JOBS_ENABLED", { default: "false" });
16:const retentionProductionProjectId = defineString("MAWDA_RETENTION_PRODUCTION_PROJECT_ID", { default: "" });
23:export function retentionDeadline(createdAtMs: number, lifetimeMs: number): number {
33:  return retentionDeadline(createdAtMs, lifetimeMs) <= nowMs;
44:  return projectId !== "mawda-app-2026" &&
48:/** Production retention requires both the explicit enable switch and an exact project-ID allowlist match. */
61:  const enabled = retentionJobsEnabled.value() === "true";
62:  const productionProjectId = retentionProductionProjectId.value();
77: * retention locks and backup policies are infrastructure controls and must be
105:const MEDIA_DERIVATIVE_RECHECK_MS = 5 * 60 * 1000;
121:    const lifetimeMs = purpose === "profile_album" ? 7 * 24 * 60 * 60 * 1000
139:      .where("retentionReconcileAt", "<=", now)
140:      .orderBy("retentionReconcileAt", "asc")
156:          retentionReconcileAt: Timestamp.fromMillis(Date.now() + MEDIA_DERIVATIVE_RECHECK_MS),
172:        .where("retentionExpiresAt", "<=", dueAt)
173:        .orderBy("retentionExpiresAt", "asc")
181:          .where("retentionExpiresAt", "==", null)
194:        // The original retention deadline is preserved and resumes on release/expiry.
211:              const expiry = fresh.retentionExpiresAt;
244:            const expiry = fresh.retentionExpiresAt;
272:          const packs = await db.collection("stickerPacks").limit(500).get();
319:          const packs = await db.collection("stickerPacks").limit(500).get();
394:            if (!["ownerUid", "uploaderType", "mediaPurpose", "createdAt", "retentionExpiresAt"].includes(key)) {
401:          tombstone.retentionPolicyStatus = manualDeleteRetry
403:          tombstone.retentionExpiresAt = asset.retentionExpiresAt ??
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/room-events.ts ---
33:  const durationMinutes = input.durationMinutes ?? 60;
37:  if (title.length < 3 || title.length > 80 || description.length > 500) {
44:      (startsAtMs as number) < nowMs + 5 * 60 * 1000 ||
45:      (startsAtMs as number) > nowMs + 90 * 24 * 60 * 60 * 1000) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/room-policy.ts ---
11:  if (!Number.isSafeInteger(age) || age < 16 || age > 120) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/room-rental.ts ---
16:  { planId: "room_90d", name: "استئجار غرفة 90 يوماً", durationDays: 90, priceCoins: 2700, active: true },
17:  { planId: "room_180d", name: "استئجار غرفة 180 يوماً", durationDays: 180, priceCoins: 5000, active: true },
18:  { planId: "room_365d", name: "استئجار غرفة 365 يوماً", durationDays: 365, priceCoins: 9000, active: true },
36:        (plan.durationDays as number) > 3650 ||
52:      !Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
55:  const expiryMs = nowMs + durationDays * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/safety-cases.ts ---
45:  if (contextId !== null && (!contextId || contextId.length > 160)) {
50:  if (description.length < 10 || description.length > 2000) {
78:  if (!/^[A-Za-z0-9_-]{8,160}$/.test(caseId)) throw new Error("INVALID_SAFETY_CASE_ID");
79:  if (reason.length < 20 || reason.length > 2000) throw new Error("INVALID_SAFETY_APPEAL_REASON");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/sticker-policy.ts ---
7:  staticMaxBytes: 256 * 1024,
10:  animatedMaxFrames: 50,
11:  maxPackStickers: 120,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/store-catalog.ts ---
58:  if (typeof data.description !== "string" || data.description.length > 500) return null;
74:       (durationDays < 1 || durationDays > 3650))) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/store-gifting.ts ---
75:      (!Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650)) {
88:    return nowMs + durationDays * 24 * 60 * 60 * 1000;
90:  return Math.max(nowMs, existingExpiryMs ?? 0) + durationDays * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/src/verification-calendar.ts ---
28:export const BIOMETRIC_VERIFICATION_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/advertising-governance.test.js ---
33:    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200 };
44:    permission: "advertising.campaign.publish", resourceScope: "campaign:x", nowMs: 200,
51:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
55:    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false };
58:  assert.equal(canSignUnderDelegation({ ...args, commitmentMinor: 60000, ownerCoSignaturePresent: true }), false);
60:  assert.equal(canSignUnderDelegation({ ...args, nowMs: 500, ownerCoSignaturePresent: true }), false);
128:    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200,
132:  assert.equal(hasAdvertisingPermission({ ...base, grants: [{ ...grant, startsAtMs: 201 }] }), false);
214:    nowMs: 200,
288:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
293:    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false,
297:  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, maxCommitmentMinor: "50000" } }), false);
313:    nowMs: 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/advertising-intake.test.js ---
20:  proposedBudgetAmount: "125.00",
29:    ...validDirectAdvertiserBudget, currency: "JOD", proposedBudgetAmount: "125.000",
32:    ...validDirectAdvertiserBudget, currency: "KWD", proposedBudgetAmount: "125.0001",
38:    ...validDirectAdvertiserBudget, proposedBudgetAmount: "125.001",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/audit-archive.test.js ---
35:test("requires a locked 24-month retention policy and hardened bucket access", () => {
37:    retentionPolicy: { isLocked: true, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
43:    retentionPeriodSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
48:    retentionPolicy: { isLocked: false, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
74:  assert.equal(archive.sha256.length, 64);
86:  assert.match(objectName, /^collections\/verificationAuditLogs\/\d{4}\/\d{2}\/\d{2}\/batch-[a-f0-9]{20}\.jsonl$/);
94:  assert.equal(archive.sha256.length, 64);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-evidence.test.js ---
11:  assert.equal(BIOMETRIC_SPOKEN_PHRASE_VERSION, "owner-approved-2026-11-20-v1");
15:  assert.equal(BIOMETRIC_VIDEO_MAX_BYTES, 25 * 1024 * 1024);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-media.test.js ---
15:  const payload = Buffer.alloc(20);
24:  payload.writeUInt32BE(timescale, 20);
46:  assert.equal(readMp4DurationMs(headerV0("mvhd", 1000, 5000)), 5000);
47:  assert.equal(readMp4DurationMs(headerV1("mvhd", 600, 2400)), 4000);
51:  for (const duration of [3000, 3500, 5000]) assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
52:  for (const duration of [0, 2999, 2999.9, 5000.1, 5001, Number.NaN, Number.POSITIVE_INFINITY]) {
67:  const forgedMovieDuration = movie(4000, [track("vide", 6000)]);
74:  const unsupported = Buffer.alloc(20);
82:  const audio = movie(20000, [track("soun", 20000)]);
83:  const overlong = movie(20001, [track("soun", 20001)]);
86:  assert.equal(assertBiometricAudioFileAllowed(audio), 20000);
92:test("enforces the owner-approved 20-second biometric audio ceiling from movie and track bytes", () => {
93:  const maxAllowed = movie(20000, [track("soun", 20000)]);
94:  const overLimitMovie = movie(20001, [track("soun", 20000)]);
95:  const overLimitTrack = movie(20000, [track("soun", 20001)]);
97:  assert.equal(assertBiometricAudioFileAllowed(maxAllowed), 20000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-review-state.test.js ---
3:const owner="super_owner_uid_0001",member="member_uid_00001";const id=n=>"request_identifier_"+n;const month=(y,m,d=15)=>Date.UTC(y,m,d,10);
4:test("first rejection opens attempt two after one calendar month",()=>{const a=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,15)});const r=decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,31)});assert.equal(r.nextEligibleAtMs,month(2026,1,28));assert.throws(()=>startBiometricRetry({state:r,nextRequestId:id(2),submittedAtMs:r.nextEligibleAtMs-1}),/NOT_ELIGIBLE/);assert.equal(startBiometricRetry({state:r,nextRequestId:id(2),submittedAtMs:r.nextEligibleAtMs}).attemptNumber,2);});
5:test("second rejection allows one final attempt after another calendar month",()=>{const a=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});const r1=decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,31)});const b=startBiometricRetry({state:r1,nextRequestId:id(2),submittedAtMs:r1.nextEligibleAtMs});const r2=decideBiometricReview({state:b,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,1,28)});assert.equal(r2.nextEligibleAtMs,month(2026,2,28));assert.equal(startBiometricRetry({state:r2,nextRequestId:id(3),submittedAtMs:r2.nextEligibleAtMs}).attemptNumber,3);});
6:test("third rejection permanently closes sequence with no fourth attempt",()=>{let s=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});for(let n=1;n<=3;n++){if(n>1)s=startBiometricRetry({state:s,nextRequestId:id(n),submittedAtMs:s.nextEligibleAtMs});s=decideBiometricReview({state:s,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,n-1,15)});}assert.equal(s.status,"closed");assert.equal(s.finalRejection,true);assert.equal(s.nextEligibleAtMs,null);assert.throws(()=>startBiometricRetry({state:s,nextRequestId:id(4),submittedAtMs:month(2026,3,15)}),/NOT_ELIGIBLE/);});
7:test("acceptance is terminal and member cannot review own request",()=>{const s=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});const a=decideBiometricReview({state:s,decision:"accepted",reviewerUid:owner,decidedAtMs:month(2026,0,2)});assert.equal(a.status,"accepted");assert.throws(()=>decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,3)}));assert.throws(()=>decideBiometricReview({state:s,decision:"accepted",reviewerUid:member,decidedAtMs:month(2026,0,2)}));});
10: const rejected=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});
11: const forged={...rejected,status:"rejected",attemptNumber:3,decidedAtMs:month(2026,0,2),decidedByUid:owner,nextEligibleAtMs:month(2026,1,2),finalRejection:false};
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-review.test.js ---
17:  const jan31 = new Date("2026-01-31T12:00:00Z").getTime();
18:  assert.equal(new Date(addBiometricRenewalMonth(jan31)).toISOString(), "2026-02-28T12:00:00.000Z");
19:  const feb28 = new Date("2026-02-28T12:00:00Z").getTime();
20:  assert.equal(new Date(addBiometricRenewalMonth(feb28)).toISOString(), "2026-03-28T12:00:00.000Z");
32:  const jan31Leap = Date.parse("2024-01-31T23:30:00.000Z");
33:  assert.equal(new Date(addBiometricRenewalMonth(jan31Leap)).toISOString(), "2024-02-29T23:30:00.000Z");
34:  const mar31 = Date.parse("2026-03-31T00:15:00.000Z");
35:  assert.equal(new Date(addBiometricRenewalMonth(mar31)).toISOString(), "2026-04-30T00:15:00.000Z");
42:  const locked = { ...pending(3), status: "locked", lockoutUntilMs: 200 };
44:  assert.equal(nextBiometricAttemptNumber(locked, 200), 1);
51:    nextRenewalAtMs: "2099-01-01",
54:    status: "locked", attemptNumber: 3, rewardGranted: false, lockoutUntilMs: "2099-01-01",
69:    state: pending(1), decision: "accept", actorIsSuperOwner: true, nowMs: Date.parse("2026-01-31T12:00:00Z"),
78:  const lockoutStart = Date.parse("2026-01-31T12:00:00Z");
81:  assert.equal(new Date(third.lockoutUntilMs).toISOString(), "2026-04-30T12:00:00.000Z");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-verification-cycle.test.js ---
36:test("ledger identity is cycle-specific and reward is exactly 1500 coins", () => {
43:  assert.equal(BIOMETRIC_VERIFICATION_REWARD_COINS, 1500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-verification.test.js ---
17:  expiresAt: { toMillis: () => NOW + 60_000 },
27:  assert.equal(hasActiveBiometricVerification({ status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } }, "member_uid_0001", NOW), false);
51:    { ...base, reviewerMfaAt: { toMillis: () => NOW - 20 * 60 * 1000 } },
52:    { ...base, expiresAt: { toMillis: () => NOW - 20_000 } },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-entitlements.test.js ---
13:  policyId: "call-test-2026", version: 1, active: true,
38:    priceCoins: 2500, durationDays: 30, status: "completed",
40:    expiresAt: { toMillis: () => 1802592000000 },
45:  assert.equal(projected.priceCoins, 2500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-signaling.test.js ---
49:  assert.equal(CALL_SIGNAL_MAX_AGE_MS, 120_000);
50:  assert.equal(CALL_SIGNAL_MAX_PER_CALLER, 256);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-usage-policy.test.js ---
43:    ...policy, maxCallDurationMs: 60000,
52:    ...policy, maxCallDurationMs: 60000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/capacity-media-management.test.js ---
11:  assert.equal(CAPACITY_MEDIA_DEFAULTS.activeMemberBasis, "authenticated_app_heartbeat_120s");
56:  assert.equal(policy.activeMemberBasis, "authenticated_app_heartbeat_120s");
64:    monthUtc: "2026-11",
69:    monthlyDownloadBytes: 20_000,
75:    monthUtc: "2026-11",
80:    monthlyDownloadBytes: 20_000,
89:    monthUtc: "2026-11",
110:    monthUtc: "2026-11",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/chat-media-policy.test.js ---
15:  safePreviewGeneration: "12", safePreviewSha256: hash,
51:    safeDocumentGeneration: "3", safeDocumentSha256: hash,
75:  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewSha256: "bad" }, false), null);
88:      generation: "safeAnimationGeneration", hash: "safeAnimationSha256",
94:      generation: "safeAudioGeneration", hash: "safeAudioSha256",
100:      generation: "safeVideoGeneration", hash: "safeVideoSha256",
106:      generation: "safeDocumentGeneration", hash: "safeDocumentSha256",
153:    safeAudioSha256: "a".repeat(64),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/chat-retention-policy.test.js ---
14:} = require("../lib/chat-retention-policy");
24:test("normal and important text retention have exact seven and thirty day boundaries", () => {
28:  assert.equal(chatTextExpiryAtMs(createdAt, "normal"), createdAt + 7 * 24 * 60 * 60 * 1000);
29:  assert.equal(chatTextExpiryAtMs(createdAt, "important"), createdAt + 30 * 24 * 60 * 60 * 1000);
52:test("retention notices disclose each exact policy", () => {
58:test("retention policy rejects invalid clocks", () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/coin-math.test.js ---
5:test("20% commission on 1,000 coins credits 800 and records 200", () => {
6:  assert.deepEqual(calculateTransferBreakdown(1000, 2000), {
7:    grossAmount: 1000, commissionBps: 2000, commissionAmount: 200, netAmount: 800,
18:  assert.deepEqual(calculateTransferBreakdown(3, 2000), {
19:    grossAmount: 3, commissionBps: 2000, commissionAmount: 0, netAmount: 3,
25:  const result = calculateTransferBreakdown(amount, 2000);
26:  assert.equal(result.commissionAmount, Number((BigInt(amount) * 2000n) / 10000n));
31:  assert.throws(() => calculateTransferBreakdown(0, 2000));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/coin-purchase-requests.test.js ---
16:    requestId: "request_456", kind: "custom", requestedCoins: 7500,
17:  }), { requestId: "request_456", kind: "custom", requestedCoins: 7500 });
19:    requestId: "request_456", kind: "custom", requestedCoins: 7500, priceMinor: 1,
38:    requestId: "request_125", instructions: "Owner selected Syrian pound terms",
107:    requestId: "gift_request_3", kind: "custom", requestedCoins: 500,
120:  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, coins: 2000 }, agreed), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/contracts-workflow.test.js ---
22:  commitmentMinor: 25000,
25:  endsAtMs: 2000,
38:  assert.equal(draft.commitmentMinor, 25000);
107:    signedAtMs: 5000,
156:    signedAtMs: 200,
189:    signedAtMs: 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/creator-proposals.test.js ---
39:    proposedBudgetAmount: "125.00",
43:  assert.equal(result.proposedBudgetAmount, "125.00");
54:    proposedBudgetAmount: "125.000",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/direct-chat-id.test.js ---
5:test("direct chat ID is symmetric and a fixed-length lowercase SHA-256 digest", () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/direct-message-receipts.test.js ---
27:  assert.equal(isMessageReadByPeer("100", 200), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/economy-pricing.test.js ---
13:  billingModel: "cpm", priceMinor: 200, currency: "EUR", active: true,
17:  assert.equal(isValidPositiveCurrencyAmount("125.00", "EUR"), true);
18:  assert.equal(isValidPositiveCurrencyAmount("125.000", "JOD"), true);
19:  assert.equal(isValidPositiveCurrencyAmount("125", "JPY"), true);
20:  assert.equal(isValidPositiveCurrencyAmount("125.001", "EUR"), false);
21:  assert.equal(isValidPositiveCurrencyAmount("125.0", "JPY"), false);
22:  assert.equal(isValidPositiveCurrencyAmount("125.0001", "JOD"), false);
23:  assert.equal(isValidPositiveCurrencyAmount("125.00", "XXX"), false);
37:  assert.equal(validateAdPrices([adPriceFixture])[0].priceMinor, 200);
67:    audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200,
68:  }), { audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200 });
70:    audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000,
71:  }), { audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000 });
75:  for (const invalid of [1, 3, 0, -2, 2.5, NaN, Infinity, "200", undefined]) {
84:    audioTotalCoinsPerMinute: 200, videoTotalCoinsPerMinute: null,
94:    enabled: false, rewardCoins: 0, cycleDays: 90,
97:    enabled: true, rewardCoins: 750, cycleDays: 45,
98:  }), { enabled: true, rewardCoins: 750, cycleDays: 45 });
100:    { enabled: true, rewardCoins: 0, cycleDays: 90 },
101:    { enabled: false, rewardCoins: -1, cycleDays: 90 },
104:    { enabled: "yes", rewardCoins: 100, cycleDays: 90 },
153:    assert.equal(isValidPositiveCurrencyAmount("125", code), true);
154:    assert.equal(isValidPositiveCurrencyAmount("125.0", code), false);
158:    assert.equal(isValidPositiveCurrencyAmount("125.00", code), true);
159:    assert.equal(isValidPositiveCurrencyAmount("125.001", code), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/email-verification-cycle.test.js ---
12:const NOW = Date.UTC(2026, 0, 31, 12, 0, 0);
20:  assert.equal(first.expiresAtMs, Date.UTC(2026, 3, 30, 12, 0, 0));
35:  assert.equal(isEmailVerificationCycleDue(NOW, Date.UTC(2026, 3, 30, 11, 59, 59, 999)), false);
36:  assert.equal(isEmailVerificationCycleDue(NOW, Date.UTC(2026, 3, 30, 12, 0, 0)), true);
58:  assert.equal(EMAIL_VERIFICATION_REWARD_COINS, 500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/engagement-rewards.test.js ---
21:    weekly: { enabled: true, amountCoins: 25 },
22:  }).weekly, { enabled: true, amountCoins: 25 });
36:  const instant = Date.UTC(2026, 0, 1, 0, 5);
37:  assert.equal(utcRewardPeriod("hourly", instant), "20260101T00");
38:  assert.equal(utcRewardPeriod("daily", instant), "20260101");
39:  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 1, 12)), "2020-W53");
40:  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 4, 12)), "2021-W01");
42:  assert.equal(utcRewardPeriod("daily", instant), "20260101");
87:  assert.deepEqual(eligibleHeartbeatDelta(null, 5000, 1, 1, true, true), {
88:    deltaMs: 0, nextHeartbeatAtMs: 5000, nextSequence: 2, paused: false,
90:  assert.deepEqual(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, true), {
91:    deltaMs: 5000, nextHeartbeatAtMs: 6000, nextSequence: 2, paused: false,
93:  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, false, true).deltaMs, 0);
94:  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, false).nextHeartbeatAtMs, null);
96:  assert.throws(() => eligibleHeartbeatDelta(1000, 6000, 2, 1, true, true), /SEQUENCE/);
97:  assert.throws(() => eligibleHeartbeatDelta(6000, 6000, 1, 1, true, true), /TIME/);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/feature-coverage-matrix.test.js ---
41:  assert.ok(guest.plannedCases.includes("60-minute-live-expiry-clock-integration"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-ad-finance.test.js ---
14:  externalReference: "bank-ref-2026-001",
20:    ...base, action: "payment_received", amountMinor: 12500, currency: "USD",
21:  }).amountMinor, 12500);
23:    ...base, action: "refund_recorded", amountMinor: 2500, currency: "USD",
54:    amountMinor: 2000, currency: "USD",
57:  assert.equal(partiallyRefunded.refundedMinor, 2000);
84:  const initial = { currency: "USD", receivedMinor: 5000, refundedMinor: 0, reconciledMinor: 5000,
94:  const first = featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001");
95:  assert.equal(first, featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-ad-rewards.test.js ---
19:  maxRewardCoinsPerUtcDay: 20,
78:  assert.equal(decideFeaturedAdReward(policy, { ...base, videoCompletionPercent: 90 }).eligible, true);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-advertising.test.js ---
22:    nowMs: 500,
41:    nowMs: 500,
53:      { ...base, campaignId: "third_ad", viewCount: 50 },
55:    nowMs: 500,
69:    { ...base, campaignId: "expired", endsAtMs: 500 },
70:    { ...base, campaignId: "future", startsAtMs: 501 },
72:  const result = selectFeaturedAdShowcase({ campaigns, nowMs: 500 });
80:    nowMs: 500,
81:    rotationIntervalMs: 1500,
83:  assert.equal(result.rotationIntervalMs, 1500);
90:    nowMs: 500,
101:    nowMs: 500,
109:    nowMs: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/gcs-signed-url.http.test.js ---
24:      expires: Date.now() + 5 * 60 * 1000,
45:      expires: Date.now() + 5 * 60 * 1000,
49:    assert.equal(read.status, 200);
58:    await new Promise((resolve) => setTimeout(resolve, 2200));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/group-call-economy.test.js ---
10:  policyId: "owner-policy-2026",
15:  updatedAtMs: 1795000000000,
55:  const four = calculateGroupCallCoinShares(2000, ["owner", "early", "late", "last-second"], "owner");
56:  assert.deepEqual(four.map((item) => item.amount), [500, 500, 500, 500]);
57:  const three = calculateGroupCallCoinShares(2000, ["owner", "early", "late"], "owner");
59:  const two = calculateGroupCallCoinShares(2000, ["owner", "late"], "owner");
79:  const reserve = calculateGroupCallMaximumReservation(policy, "video", 3 * 60 * 1000);
85:    15 * 1000, 3 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/guest-sessions.test.js ---
15:  assert.equal(isGuestSessionActive({ status: "ended", expiresAt: Timestamp.fromMillis(200) }, 100), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/biometric-verification.integration.test.js ---
22:const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
36:  const payload = Buffer.alloc(20); payload.writeUInt8(0, 0); payload.writeUInt32BE(1000, 12); payload.writeUInt32BE(duration, 16);
45:const sha = bytes => createHash("sha256").update(bytes).digest("hex");
67:    scannerSha256: sha(sourceBytes), scannerVerifiedAt: Timestamp.now(),
70:      safeAudioSha256: sha(safeBytes), safeAudioContentType: safeContentType,
74:      safeVideoSha256: sha(safeBytes), safeVideoContentType: safeContentType,
82:async function attachEvidence(requestRef, uid, requestId, audioDuration = 20000, videoDuration = 4000, status = "security_approved") {
129:    assert.equal(started.audio.maxDurationSeconds, 20);
132:    await attachEvidence(ref, uid, started.requestId, 20000, 4000, "pending_security_scan");
164:    assert.equal(decision.rewardCoins, 1500);
169:    assert.equal(ledger.data().amount, 1500);
198:        const decidedAtMs = Date.now() - 32 * 24 * 60 * 60 * 1000;
199:        const submittedAtMs = decidedAtMs - 24 * 60 * 60 * 1000;
214:      await attachEvidence(ref, uid, started.requestId, 20000, 3000);
251:    for (const [audioDuration, videoDuration] of [[20001, 4000], [20000, 5001]]) {
280:      createdAt: Timestamp.fromMillis(Date.now() - 5 * 60 * 1000 - 1),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/call-economy-gifts.integration.test.js ---
48:      audioCoinsPerMinute: 151, videoCoinsPerMinute: 311, active: true,
79:    priceCoins: 2500, durationDays: 30, status: "completed",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/call-signaling.integration.test.js ---
14:    active: true, quotaWindowMs: 24 * 60 * 60 * 1000,
16:    maxCallDurationMs: 5 * 60 * 1000,
29:  const expiresAt = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
154:  const roomExpiry = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
261:    const future = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
330:      expiresAt: Timestamp.fromMillis(Date.now() + 60_000),
377:          startedAtMs: now - (index + 1) * 60_000,
382:          startedAtMs: now - (index + 1) * 60_000,
387:          startedAtMs: now - 24 * 60 * 60 * 1000 - 1,
463:    assert.ok(calleeReport.maxDurationEndsAtMs - calleeReport.connectedAtMs === 5 * 60 * 1000);
508:    const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
586:  const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/chat-retention.integration.test.js ---
7:const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-retention";
15:const { runChatTextRetentionSweep, runChatMediaRetentionSweep, runStickerMediaRetentionSweep } = require("../../lib/retention");
19:  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
20:  const veryOld = Timestamp.fromMillis(Date.now() - 31 * 24 * 60 * 60 * 1000);
21:  const chatRef = db.collection("directChats").doc("retention-chat-test");
23:  const roomMessageRef = db.collection("rooms").doc("retention-room-test")
25:  const importantChatRef = db.collection("directChats").doc("retention-important-chat-test");
28:  const temporaryChatRef = db.collection("directChats").doc("retention-temporary-chat-test");
30:  const corruptChatRef = db.collection("directChats").doc("retention-corrupt-chat-test");
32:  const notificationRef = db.collection("users").doc("retention-recipient-test")
34:  const unrelatedRef = db.collection("users").doc("retention-recipient-test")
39:    participantUids: ["retention-sender-test", "retention-recipient-test"],
42:    lastMessageSenderUid: "retention-sender-test",
43:    retentionMode: "normal",
45:    importantChatRef.set({ retentionMode: "important", lastMessageAt: old, lastMessagePreview: "important preview" }),
46:    temporaryChatRef.set({ retentionMode: "temporary", lastMessageAt: veryOld, lastMessagePreview: "temporary preview" }),
47:    corruptChatRef.set({ retentionMode: "unknown" }),
51:    senderUid: "retention-sender-test",
52:    recipientUid: "retention-recipient-test",
65:    senderUid: "retention-sender-test",
105:      db.collection("rooms").doc("retention-room-test").delete().catch(() => undefined),
106:      db.collection("users").doc("retention-recipient-test").delete().catch(() => undefined),
116:test("seven-day profile gallery retention removes original and preview objects but honors a legal hold", async () => {
139:  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
152:      retentionPolicyStatus: "seven_day_profile_album",
153:      retentionExpiresAt: old, createdAt: old,
158:      retentionPolicyStatus: "seven_day_profile_album",
159:      retentionExpiresAt: old, createdAt: old,
165:      status: "security_approved", retentionPolicyStatus: "delete_at_story_expiry",
166:      storyExpiresAt: old, retentionExpiresAt: old, storyDocumentId: storyRef.id, createdAt: old,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/coin-package-gifts.integration.test.js ---
50:    recipientRef.set({ coins: 15, profileCompleted: true, accountStatus: "active" }),
53:        coins: 900, priceMinor: 500, currency: "EUR", active: true }],
76:    assert.equal((await recipientRef.get()).data().coins, 15);
79:    assert.equal(stored.packageSnapshot.coins, 900);
89:        agreedCoins: 901, agreedPriceMinor: 500, currency: "EUR",
98:      agreedCoins: 900, agreedPriceMinor: 500, currency: "EUR",
103:    assert.equal((await recipientRef.get()).data().coins, 15);
110:    assert.equal((await recipientRef.get()).data().coins, 15);
127:    assert.equal(recipient.data().coins, 915);
129:    assert.equal(ledger.data().amount, 900);
135:    assert.equal(history.data().coins, 900);
141:    assert.equal((await recipientRef.get()).data().coins, 915);
148:    assert.equal((await recipientRef.get()).data().coins, 915);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/direct-message-deletion.integration.test.js ---
24:const id = (value) => createHash("sha256").update(value).digest("hex");
205:  const longText = "x".repeat(150);
209:    lastMessagePreview: longText.substring(0, 120),
391:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
392:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
398:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
399:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
485:    retentionPolicyStatus: "legal_hold", createdAt: Timestamp.now(),
514:      retentionPolicyStatus: "four_hour_self_destruct",
573:        retentionPolicyStatus: "four_hour_self_destruct",
574:        retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
642:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
643:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
649:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
650:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
714:test("manual deletion re-sweeps canonical Storage paths after a retention tombstone", async () => {
731:    status: "self_destructed", retentionPolicyStatus: "four_hour_self_destructed",
732:    createdAt: Timestamp.now(), retentionExpiresAt: Timestamp.now(),
804:      chatId, limit: 50, afterPageToken: initial.latestMessagePageToken,
822:      chatId, limit: 50, afterPageToken: incremental.latestMessagePageToken,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/email-verification-renewal.integration.test.js ---
19:test("fresh email link renewal credits 500 coins once and starts the next three-calendar-month cycle", async () => {
37:    emailVerifiedAt: Timestamp.fromMillis(lastVerifiedAtMs - 3 * 31 * 24 * 60 * 60 * 1000),
40:    emailVerificationCycleStartedAt: Timestamp.fromMillis(lastVerifiedAtMs - 3 * 31 * 24 * 60 * 60 * 1000),
42:    coins: 250,
64:    assert.equal((await userRef.get()).data().coins, 250);
70:    assert.equal(completed.rewardAmount, 500);
71:    assert.equal(completed.newBalance, 750);
74:    assert.equal(member.coins, 750);
85:    assert.equal((await ledgerRef.get()).data().amount, 500);
96:    assert.equal((await userRef.get()).data().coins, 750);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/engagement-rewards.integration.test.js ---
105:  await userRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" });
114:      durationSeconds: 15,
116:      startsAtMs: Date.now() - 60000,
117:      endsAtMs: Date.now() + 3600000,
168:      eligibleMs: 15000,
170:      lastHeartbeatAtMs: Date.now() - 5000,
175:    assert.equal(heartbeat.eligibleMs >= 15000, true);
233:      durationSeconds: 20,
236:      endsAtMs: Date.now() + 3600000,
238:      rewardBudgetCoins: 50,
259:        durationSeconds: 20,
262:        endsAtMs: Date.now() + 3600000,
264:        rewardBudgetCoins: 50,
300:      durationSeconds: 15,
303:      endsAtMs: Date.now() + 3600000,
313:      eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000,
370:      durationSeconds: 15,
373:      endsAtMs: Date.now() + 3600000,
443:      durationSeconds: 15,
446:      endsAtMs: Date.now() + 3600000,
492:    await Promise.all([...users.map((ref) => ref.set({ coins: 0, profileCompleted: true, accountStatus: "active" })), ...campaigns.map((ref) => ref.set({ title: "Counter collision isolation test", sponsorLabel: "Synthetic CI sponsor", body: "Synthetic campaign used only to verify independent member reward limits.", placement: "reward_center", creativeType: "text", durationSeconds: 15, rewardCoins: 1, startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000, maxClaimsPerMember: 1, rewardBudgetCoins: 1, spentRewardCoins: 0, reservedRewardCoins: 0, status: "published", version: 1 }))]);
495:    await Promise.all(sessions.map((id) => db.collection("timedAdSessions").doc(id).update({ eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000 })));
524:    startsAtMs: now - 60_000, endsAtMs: now - 1_000,
533:        ...campaignData, startsAtMs: now + 60_000, endsAtMs: now + 120_000,
535:      eligibleCampaign.set({ ...campaignData, startsAtMs: now - 1_000, endsAtMs: now + 60_000 }),
573:      durationSeconds: 15,
576:      endsAtMs: Date.now() + 3600000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-finance.integration.test.js ---
43:    endsAtMs: Date.now() + 24 * 60 * 60 * 1000,
143:      externalReference: `bank_receipt_2_${tag}`, amountMinor: 5000,
146:    assert.equal(second.snapshot.receivedMinor, 15000);
171:    assert.equal(snapshot.data().receivedMinor, 15000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-reward-policy.integration.test.js ---
35:    videoCompletionPercent: 90,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-reward-settlement.integration.test.js ---
26:    maxRewardedViewsPerUtcDay: 10, maxRewardCoinsPerUtcDay: 50,
28:    videoCompletionPercent: 90, imageContinuousVisibleMs: 10000,
35:      startsAtMs: now - 60000, endsAtMs: now + 3600000,
41:      serverValidatedPlayback: false, serverValidatedContinuousVisibleMs: 12000,
42:      serverValidatedProgressPercent: 100, startedAtMs: now - 15000,
64:    assert.equal(user.data().coins, 15);
68:    assert.equal(ledger.data().balanceAfter, 15);
101:    userRef.set({ profileCompleted: true, accountStatus: "active", coins: 15 }),
106:      balanceBefore: 10, balanceAfter: 15,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/guest-session.integration.test.js ---
44:  const discoveryNoiseRoomIds = Array.from({ length: 205 }, (_, index) =>
53:      roomRef(roomId).set({ name: "Guest-safe public", status: "active", kind: "public", audience: "adult", guestAudienceApproved: false, ownerUid, capacity: 20, memberCount: 0 }),
54:      roomRef(adultRoomId).set({ name: "Adult only", status: "active", kind: "public", audience: "adult", capacity: 20, memberCount: 0 }),
55:      roomRef(privateRoomId).set({ name: "Private", status: "active", kind: "private", audience: "all_ages", guestAudienceApproved: true, capacity: 20, memberCount: 0 }),
56:      roomRef(unapprovedRoomId).set({ name: "Unapproved", status: "active", kind: "public", audience: "all_ages", guestAudienceApproved: false, capacity: 20, memberCount: 0 }),
58:    // More than 200 earlier active but ineligible rooms must not starve
66:          capacity: 20, memberCount: 0,
102:      username: "guest-test-user", country: "CH", gender: "female", age: 18, dateOfBirth: "2008-01-01",
140:        startsAtMs: Date.now() + 60 * 60 * 1000, durationMinutes: 30,
232:      safeAudioGeneration: "1", safeAudioSha256: "c".repeat(64),
254:      safeAudioGeneration: "1", safeAudioSha256: "a".repeat(64),
279:      safePreviewGeneration: "1", safePreviewSha256: "b".repeat(64),
284:    delete unsafeImageAsset.safeAudioSha256;
320:        const auditRoomIdChunkSize = 20;
323:          if (roomIdChunk.length > 20) throw new Error("Guest test cleanup IN chunk exceeded its safe bound.");
347:  const roomRefs = Array.from({ length: 205 }, (_, index) =>
361:    assert.equal(before.size, 205);
369:    assert.equal(after.size, 0, "all guest memberships must be removed, not only the first 200");
371:    assert.equal(rooms.size, 205);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/media-callables.integration.test.js ---
53:const testKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey
60:  client_id: "123456789012345678901", token_uri: "https://oauth2.googleapis.com/token",
61:}), { mode: 0o600 });
150:  stale.auth.token.auth_time -= 16 * 60;
194:        auth_time: Math.floor(Date.now() / 1000) - 16 * 60,
230:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
234:    retentionPolicyStatus: "seven_day_profile_album",
249:  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
250:  assert.ok(asset.data().retentionExpiresAt instanceof Timestamp);
251:  assert.ok(asset.data().retentionExpiresAt.toMillis() >= Date.now() + 6 * 24 * 60 * 60 * 1000);
252:  assert.ok(asset.data().retentionExpiresAt.toMillis() <= Date.now() + 7 * 24 * 60 * 60 * 1000 + 5000);
257:test("story upload requires and preserves its explicit expiry as the retention deadline", async () => {
259:  const intentExpiry = Date.now() + 60 * 60 * 1000;
272:  assert.equal(before.data().retentionPolicyStatus, "delete_at_story_expiry");
274:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
284:  assert.equal(after.data().retentionExpiresAt.toMillis(), intentExpiry);
304:  assert.equal(before.data().retentionPolicyStatus, "thirty_day_avatar_cover");
305:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
314:  assert.ok(after.data().retentionExpiresAt instanceof Timestamp);
315:  assert.ok(after.data().retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);
367:  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
368:  assert.equal(asset.data().retentionExpiresAt, null);
391:  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
402:  // The Storage Emulator does not implement signed PUT endpoints (returns 501).
433:  response.statusCode = 200;
471:  const safePreviewSha256 = createHash("sha256").update(previewBytes).digest("hex");
482:    safePreviewSha256,
516:    safePreviewSha256: "a".repeat(64), safePreviewContentType: "image/webp",
528:  const reservedBytes = 2048;
539:    createdAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/media-legal-hold.integration.test.js ---
6:const { runChatMediaRetentionSweep } = require("../../lib/retention");
47:      retentionPolicyStatus: "four_hour_self_destruct",
48:      retentionExpiresAt: Timestamp.fromMillis(now - 1000),
55:      reference: "CASE-2026-123",
57:      reviewAtMs: now + 60 * 60 * 1000,
58:      endsAtMs: now + 2 * 60 * 60 * 1000,
63:    assert.equal(heldAsset.data().retentionPolicyStatus, "legal_hold");
64:    assert.equal(heldAsset.data().retentionExpiresAt.toMillis(), now - 1000);
71:      nextReviewAtMs: now + 90 * 60 * 1000,
73:    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);
75:      .data().reviewAt.toMillis(), now + 90 * 60 * 1000);
82:    assert.equal(releasedAsset.data().retentionPolicyStatus, "four_hour_self_destruct");
83:    assert.equal(releasedAsset.data().retentionExpiresAt.toMillis(), now - 1000);
139:      retentionPolicyStatus: "four_hour_self_destruct",
140:      retentionExpiresAt: Timestamp.fromMillis(now - 1000),
141:      createdAt: Timestamp.fromMillis(now - 5 * 60 * 60 * 1000),
150:      reviewAtMs: now + 60 * 60 * 1000,
151:      endsAtMs: now + 2 * 60 * 60 * 1000,
168:      retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/member-profile-media.integration.test.js ---
19:const { runChatMediaRetentionSweep } = require("../../lib/retention");
34:  const oldExpiry = Timestamp.fromMillis(Date.now() + 15 * 24 * 60 * 60 * 1000);
39:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
40:      retentionExpiresAt: oldExpiry,
44:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
45:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000),
57:    assert.equal(oldAsset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
59:    assert.equal(oldAsset.retentionExpiresAt.toMillis(), oldExpiry.toMillis());
62:    assert.ok(newAsset.retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);
97:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
98:      retentionExpiresAt: expired, createdAt: expired,
132:  const existingExpiry = Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000);
137:      status: "security_approved", retentionExpiresAt: existingExpiry,
138:      retentionPolicyStatus: "thirty_day_avatar_cover",
148:    assert.equal(asset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
150:    assert.equal(asset.retentionExpiresAt.toMillis(), existingExpiry.toMillis());
235:      retentionPolicyStatus: "legal_hold", resumeRetentionPolicyStatus: "thirty_day_avatar_cover",
236:      retentionExpiresAt: expired, createdAt: expired,
252:      retentionPolicyStatus: "thirty_day_avatar_cover",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/message-legal-hold.integration.test.js ---
10:const { runChatTextRetentionSweep } = require("../../lib/retention");
35:  const createdAt = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
50:      reference: "CASE-2026-456",
52:      reviewAtMs: now + 60 * 60 * 1000,
53:      endsAtMs: now + 2 * 60 * 60 * 1000,
64:      nextReviewAtMs: now + 90 * 60 * 1000,
66:    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);
102:        reference: "CASE-2026-457",
104:        reviewAtMs: now + 60 * 60 * 1000,
105:        endsAtMs: now + 2 * 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/owner-entitlement-grants.integration.test.js ---
25:  createHash("sha256").update(`mawdda-owner-grant-v1:${requestId}:${uid}`).digest("hex");
52:      category: "vip", version: 1, priceCoins: 900, durationDays: 30, sortOrder: 1,
55:    catalogVersionRef.set({ itemId, version: 1, priceCoins: 900, purchaseEnabled: true,
68:    assert.ok(first.expiresAt >= before + 24 * 60 * 60 * 1000 - 5000);
69:    assert.ok(first.expiresAt <= Date.now() + 24 * 60 * 60 * 1000 + 5000);
92:    assert.ok(second.expiresAt >= first.expiresAt + 24 * 60 * 60 * 1000 - 1000);
103:      itemId, requestId: purchaseRequestId, expectedPriceCoins: 900, expectedCatalogVersion: 1,
158:    memberRefs[1].set({ uid: memberB, accountStatus: "active", coins: 200 }),
184:    assert.equal((await memberRefs[1].get()).data().coins, 200);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/premium-profile.integration.test.js ---
46:  const future = Timestamp.fromMillis(now + 10 * 24 * 60 * 60 * 1000);
110:    await setMemberCustomTitle.run(call(targetUid, { title: "Mawdda 2026" }));
112:    assert.equal(asciiTitleView.activeTitle, "Mawdda 2026");
187:  await memberRef.set(profile(30, { coins: 5000 }));
225:      assert.equal(result.newBalance, 5000 - (index + 1) * priceCoins, itemId);
287:      category: "vip", priceCoins: 600, durationDays: 30, sortOrder: 1,
292:      category: "vip", priceCoins: 600, durationDays: 30, sortOrder: 1,
298:      itemId: "vip_monthly", requestId, expectedPriceCoins: 600, expectedCatalogVersion: 1,
308:    assert.equal((await ledgerRef.get()).data()?.amount, -600);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/push-token.integration.test.js ---
17:  const tokenId = createHash("sha256").update(token).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/room-events.integration.test.js ---
26:  const startsAtMs = Date.now() + 12 * 60 * 1000;
39:      capacity: 20,
111:        startsAtMs: Date.now() + 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/room-rental.integration.test.js ---
21:    { planId: "room_90d", name: "90 days", durationDays: 90, priceCoins: 2500, active: true },
28:  assert.equal(published.plans[1].priceCoins, 2500);
56:    userRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active", age: 25 }),
57:    newUserRef.set({ coins: 100, profileCompleted: true, accountStatus: "active", age: 25 }),
62:      name: "Test rented room", capacity: 50, planId: "room_30d",
74:    assert.equal(createLedger.balanceBefore, 5000);
76:    assert.equal(createReceipt.balanceBefore, 5000);
110:        ...renewRequest.data, planId: "room_90d",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/safety-cases.integration.test.js ---
40:  const caseId = createHash("sha256").update(`${reporterUid}:${requestId}`).digest("hex");
66:    const ownerQueue = await listSafetyCases.run(ownerRequest({ status: "open", limit: 50 }));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/specialized-role-capacity.integration.test.js ---
22:const grantId = (uid, role) => createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/sticker-lifecycle-gates.integration.test.js ---
37:    kind: "static", contentType: "image/webp", width: 128, height: 128, sizeBytes: 1200,
45:      stickerMetadata: metadata, retentionExpiresAt: Timestamp.fromMillis(now + 60 * 60 * 1000),
49:      safePreviewGeneration: "1", safePreviewSha256: "test-hash",
80:    await assetRef.update({ retentionExpiresAt: Timestamp.fromMillis(Date.now() - 1) });
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/store-gifting.integration.test.js ---
38:  const giftId = createHash("sha256").update(
46:    senderRef.set({ profileCompleted: true, accountStatus: "active", coins: 2000 }),
55:      category: "vip", priceCoins: 500, durationDays: 7,
61:    assert.equal(catalogSnapshot.data().priceCoins, 500);
65:      expectedPriceCoins: 500, expectedCatalogVersion: saved.version,
78:    assert.equal(first.priceCoins, 500);
79:    assert.equal((await senderRef.get()).data().coins, 1500);
88:    assert.equal(ledger.data().amount, -500);
92:    assert.equal((await senderRef.get()).data().coins, 1500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/test-persona-interaction.integration.test.js ---
69:    assert.equal(response.netAmount, 900);
78:    assert.equal(recipientAfter.data().coins, recipientBalance + 900);
82:    assert.equal(recipientLedger.data().amount, 900);
92:    assert.equal((await recipientRef.get()).data().coins, recipientBalance + 900);
147:          require("node:crypto").createHash("sha256").update(senderUid + ":persona_dm_" + tag).digest("hex"),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/wallet-store.integration.test.js ---
44:    senderRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" }),
45:    recipientRef.set({ coins: 200, profileCompleted: true, accountStatus: "active" }),
46:    settingsRef.set({ enabled: true, commissionBps: 2000, version: 1 }),
51:      recipientUid, amount: 1000, requestId, expectedCommissionBps: 2000,
62:    assert.equal(result.commissionAmount, 200);
73:    assert.equal(senderLedger.data().balanceBefore, 5000);
75:    assert.equal(recipientLedger.data().balanceBefore, 200);
77:    assert.equal(transfer.data().senderBalanceBefore, 5000);
79:    assert.equal(transfer.data().recipientBalanceBefore, 200);
81:    assert.equal(senderLedger.data().commissionAmount, 200);
87:    assert.equal(platformLedger.data().amount, 200);
105:        recipientUid, amount: 1000, requestId: `other_${tag}`, expectedCommissionBps: 1500,
170:    refs[3].set({ coins: 50, accountStatus: "active" }),
191:    assert.equal((await refs[3].get()).data().coins, 50);
220:  await memberRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" });
224:      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
230:      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
237:    const request = memberRequest(uid, { itemId, requestId, expectedPriceCoins: 1250, expectedCatalogVersion: 2 });
239:    assert.equal(result.priceCoins, 1250);
240:    assert.equal(result.newBalance, 3750);
246:    assert.equal(member.data().coins, 3750);
248:    assert.equal(purchase.data().priceCoins, 1250);
249:    assert.equal(ledger.data().amount, -1250);
250:    assert.equal(ledger.data().balanceBefore, 5000);
251:    assert.equal(ledger.data().balanceAfter, 3750);
252:    assert.equal(purchase.data().balanceBefore, 5000);
253:    assert.equal(purchase.data().newBalance, 3750);
261:    assert.equal((await memberRef.get()).data().coins, 3750);
267:    assert.equal((await memberRef.get()).data().coins, 3750);
325:    ["vip_monthly", 5000], ["title_custom", 800], ["badge_special", 1200],
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/legal-portal-access.test.js ---
5:const WEB_APP_ID = "1:697303475139:web:8869603bda6f1a3c3ed376";
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/mawdda-media-plane.test.js ---
11:  deploymentId: "mawdda_sfu_2026",
118:    { ...health, deploymentId: "another_sfu_2026" },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-controls.test.js ---
25:  const expected = { provider: "mawadda-clamav-gateway", objectGeneration: "17", sha256: "a".repeat(64), nowMs: 1_800_000_000_000 };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-legal-hold.test.js ---
10:    reference: "CASE-2026-123",
12:    reviewAtMs: 200,
14:  }, 150), {
18:    reference: "CASE-2026-123",
20:    reviewAtMs: 200,
30:    reference: "CASE-2026-123",
32:    reviewAtMs: 200,
37:    { reference: "" }, { startsAtMs: 250 }, { reviewAtMs: 100 },
38:    { endsAtMs: 200 },
40:    assert.throws(() => validateMediaLegalHoldInput({ ...valid, ...patch }, 250));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-quota.test.js ---
10:  const now = Date.UTC(2026, 10, 13, 12);
11:  const empty = { activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13" };
17:    dailyWindow: "2026-11-13",
34:  const nextDay = Date.UTC(2026, 10, 14, 0, 1);
40:    dailyWindow: "2026-11-13",
41:  }, 2048, nextDay), {
44:    dailyBytes: 2048,
46:    dailyWindow: "2026-11-14",
52:    activeUploads: 2, activeBytes: 4096, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
53:  }, 2048), {
54:    activeUploads: 1, activeBytes: 2048, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
57:    activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-scanner.test.js ---
10:  const signature = createHmac("sha256", secret).update(body).digest("hex");
25:    sha256: "a".repeat(64),
29:    signatureDatabaseVersion: "28202",
30:    signatureDatabaseAgeMs: 60 * 60 * 1000,
41:  assert.equal(validateScannerVerdict({ ...payload, signatureDatabaseAgeMs: 37 * 60 * 60 * 1000 }, "clamav-mawadda-gateway", now), null);
53:    sha256: "a".repeat(64),
57:    signatureDatabaseVersion: "28202",
58:    signatureDatabaseAgeMs: 60 * 60 * 1000,
63:    safePreviewSha256: "b".repeat(64),
80:    sha256: "a".repeat(64),
84:    signatureDatabaseVersion: "28202",
85:    signatureDatabaseAgeMs: 60 * 60 * 1000,
101:        sha256: "b".repeat(64),
106:            item.category === "audio" ? { durationMs: 60_000 } : {}),
133:    sha256: "a".repeat(64),
137:    signatureDatabaseVersion: "28202",
138:    signatureDatabaseAgeMs: 60 * 60 * 1000,
153:        safePreviewSha256: "b".repeat(64),
167:          sha256: "b".repeat(64),
184:    verdict: "clean", objectGeneration: "123456", sha256: "a".repeat(64),
186:    signatureDatabaseVersion: "28202", signatureDatabaseAgeMs: 60 * 60 * 1000,
196:        generation: "987654", sha256: "b".repeat(64), contentType, pipelineVersion: pipeline,
197:        ...(category === "video" ? { durationMs: 30_000 } : { durationMs: 20_000 }),
204:        safeDerivative: { ...payload.safeDerivative, durationMs: 20_001 },
217:test("scanner callback enforces the 60-second audio derivative limit and rejects absent, overlong or malformed duration", () => {
222:    objectGeneration: "123456", sha256: "a".repeat(64), scannedAtMs: now,
224:    signatureDatabaseVersion: "28202", signatureDatabaseAgeMs: 60 * 60 * 1000,
229:    generation: "987654", sha256: "b".repeat(64), contentType: "audio/mpeg",
230:    pipelineVersion: "ffmpeg-audio-purpose-limit-v2", durationMs: 60_000,
232:  assert.equal(validateScannerVerdict({ ...base, safeDerivative }, base.provider, now).safeDerivative.durationMs, 60_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-security.test.js ---
18:  assert.equal(mediaPolicyFor("video/mp4").maxBytes, 25 * 1024 * 1024);
22:  assert.equal(mediaPolicyFor("application/pdf").maxBytes, 20 * 1024 * 1024);
27:  assert.throws(() => normalizeMediaRequest({ originalName: "../secret.pdf", contentType: "application/pdf", sizeBytes: 20 }));
28:  assert.throws(() => normalizeMediaRequest({ originalName: "file.exe", contentType: "application/x-msdownload", sizeBytes: 20 }));
44:  const normalized = normalizeMediaRequest({ ...base, storyExpiresAtMs: now + 60_000 });
45:  assert.equal(normalized.storyExpiresAtMs, now + 60_000);
48:    purpose: "profile_album", storyExpiresAtMs: now + 60_000,
54:  assert.equal(detectMediaSignature(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])), "image/png");
80:  assert.equal(MEDIA_SIGNED_URL_TTL_MS.upload, 5 * 60 * 1000);
81:  assert.equal(MEDIA_SIGNED_URL_TTL_MS["owner-inspection"], 60 * 1000);
83:  assert.equal(mediaSignedUrlExpiresAt("owner-inspection", now), now + 60_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-message-pagination.test.js ---
11:    limit: 50,
14:  assert.equal(validateMemberMessagePageRequest({ limit: 25 }).limit, 25);
21:    limit: 50,
26:    limit: 50,
40:  for (const limit of [0, -1, 51, 1.5, "50"]) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile-update.test.js ---
10:  }, 25), {
22:    assert.throws(() => validateMemberProfileUpdate(payload, 25), /PROFILE_UPDATE_FIELD_NOT_ALLOWED/);
43:    () => validateMemberProfileUpdate({ interests: [] }, 25),
47:    () => validateMemberProfileUpdate({ goals: [] }, 25),
53:  assert.throws(() => validateMemberProfileUpdate({ bio: "x".repeat(501) }, 25));
54:  assert.throws(() => validateMemberProfileUpdate({ gender: "unknown" }, 25));
55:  assert.throws(() => validateMemberProfileUpdate({ interests: ["same", "same"] }, 25));
56:  assert.throws(() => validateMemberProfileUpdate({}, 25));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile-view.test.js ---
18:    coins: 9000,
46:    bio: "x".repeat(600),
49:  assert.equal(result.bio.length, 500);
93:    viewerUid: "member-1", targetUid: "member-1", targetCoins: 9000,
95:  }), { visible: true, hiddenByPrivacy: false, balance: 9000 });
97:    viewerUid: "member-2", targetUid: "member-1", targetCoins: 9000,
101:    viewerUid: "moderator-1", targetUid: "member-1", targetCoins: 9000,
105:    viewerUid: "owner-uid", targetUid: "member-1", targetCoins: 9000,
107:  }), { visible: true, hiddenByPrivacy: false, balance: 9000 });
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile.test.js ---
7:  username: "Mawda_2026",
8:  age: 25,
20:  assert.equal(normalizeUsername("Mawda_2026"), "mawda_2026");
51:  assert.equal(profile.username, "mawda_2026");
52:  assert.equal(profile.age, 25);
55:  assert.throws(() => validateMemberProfile({ ...valid, age: 15 }, 16), /AGE_POLICY_NOT_MET/);
58:  assert.throws(() => validateMemberProfile({ ...valid, bio: "x".repeat(501) }, 18));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-social-links-access.test.js ---
21:  expiresAt: { toMillis: () => NOW + 60_000 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-social-links.test.js ---
23:  expiresAt: { toMillis: () => NOW + 60_000 },
76:  const legacy = { status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/message-legal-hold.test.js ---
9:    reference: "CASE-2026-456",
11:    reviewAtMs: 200,
16:  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: directPath }, 150).messagePath, directPath);
17:  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: roomPath }, 150).messagePath, roomPath);
24:    assert.throws(() => validateMessageLegalHoldInput({ ...common, messagePath }, 150));
33:    reference: "CASE-2026-456",
35:    reviewAtMs: 200,
40:    { startsAtMs: 250 }, { reviewAtMs: 100 }, { endsAtMs: 200 },
42:    assert.throws(() => validateMessageLegalHoldInput({ ...valid, ...patch }, 250));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-access.test.js ---
9:  auth_time: now - 60,
17:  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 900 }, now), true);
19:  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 901 }, now), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-audit-chain.test.js ---
31:    { actorUid: "owner-1", action: "review_page_result", returnedCount: 25 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-audit-export.test.js ---
10:    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
12:  }, 20), {
13:    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
16:  assert.equal(validateOwnerAuditExportRequest({}, 0).pageSize, 50);
22:    { pageSize: 101 }, { fromMs: 300, toMs: 200 }, { actorUid: "" },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-chat-review.test.js ---
16:    validateOwnerChatReviewRequest({ chatId, limit: 25 }),
17:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 25, pageToken: null },
24:    { chatId, reason: "Routine owner review", mode: "silent", announcementMessageId: null, limit: 50, pageToken: null },
28:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 50, pageToken: null },
34:    () => validateOwnerChatReviewRequest({ chatId, reason: "x".repeat(501) }),
42:    50,
54:  for (const limit of [0, -1, 51, 1.5, "25", Number.MAX_SAFE_INTEGER + 1]) {
102:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 50, pageToken: "message_123" },
108:  for (const pageToken of [42, {}, "contains spaces", "x".repeat(257)]) {
120:      limit: 20,
123:    { memberUid: "member-123", limit: 20, pageToken: "chat_456" },
127:    { memberUid: "member-123", limit: 50, pageToken: null },
133:  for (const limit of [0, 51, 1.2, "20"]) {
147:  const token = encodeOwnerMessagePageToken(1794500000123, "message_abc-123");
149:    createdAtMillis: 1794500000123,
188:  assert.throws(() => validateOwnerReviewAnnouncementRequest({ ...base, noticeText: "x".repeat(501) }), /INVALID_REVIEW_NOTICE_TEXT/);
205:      limit: 50,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-live-stream.test.js ---
26:    "https://192.168.1.20/live",
39:  assert.throws(() => validateOwnerLiveStreamInput(valid({description:"x".repeat(501)})));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/platform-economic-policy.test.js ---
26:  assert.equal(policy.noCostPlanningBaselines.firestore.documentReadsPerDay, 50_000);
27:  assert.equal(policy.noCostPlanningBaselines.firestore.documentWritesPerDay, 20_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/platform-terminology-docs.test.js ---
9:  'docs/MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md',
13:  'docs/STRUCTURAL_GOVERNANCE_AND_BIOMETRIC_VERIFICATION_2026-11-19.md',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/privacy-acknowledgement.test.js ---
8:  PRIVACY_POLICY_SHA256,
14:  policyHash: PRIVACY_POLICY_SHA256,
83:  assert.equal(hash, PRIVACY_POLICY_SHA256);
85:    createHash("sha256").update(body, "utf8").digest("hex"),
86:    PRIVACY_POLICY_SHA256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/registration-policy.test.js ---
21:  assert.throws(() => validateRegistrationPolicy(true, 15), /REGISTRATION_MINIMUM_AGE_INVALID/);
22:  assert.equal(validateRegistrationPolicy(true, 120).minimumAge, 120);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/retention.test.js ---
9:  retentionDeadline,
14:} = require("../lib/retention");
16:test("chat media retention is exactly four hours from validated upload finalization", () => {
18:  const deadline = retentionDeadline(createdAt, CHAT_MEDIA_RETENTION_MS);
19:  assert.equal(deadline, createdAt + 4 * 60 * 60 * 1000);
29:test("sticker media retention is exactly one hour and expires at the boundary", () => {
31:  assert.equal(STICKER_MEDIA_RETENTION_MS, 60 * 60 * 1000);
32:  const deadline = retentionDeadline(acceptedAt, STICKER_MEDIA_RETENTION_MS);
33:  assert.equal(deadline, acceptedAt + 60 * 60 * 1000);
38:test("legacy/default normal chat text retention remains exactly seven days", () => {
40:  const deadline = retentionDeadline(createdAt, CHAT_TEXT_RETENTION_MS);
41:  assert.equal(deadline, createdAt + 7 * 24 * 60 * 60 * 1000);
46:test("retention clock rejects invalid timestamps and durations", () => {
47:  assert.throws(() => retentionDeadline(-1, CHAT_MEDIA_RETENTION_MS), /INVALID_RETENTION_CLOCK/);
48:  assert.throws(() => retentionDeadline(1, 0), /INVALID_RETENTION_CLOCK/);
85:test("production retention requires explicit enablement and an exact project allowlist", () => {
86:  const { canRunRetentionJobs } = require("../lib/retention");
93:test("non-production retention still requires explicit enablement", () => {
94:  const { canRunRetentionJobs } = require("../lib/retention");
95:  assert.equal(canRunRetentionJobs("demo-mawda-retention", false, ""), false);
96:  assert.equal(canRunRetentionJobs("demo-mawda-retention", true, ""), true);
97:  assert.equal(canRunRetentionJobs("mawda-app-2026", true, ""), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-call-policy.test.js ---
14:  expiresAt: stamp(20_000),
21:  expiresAt: stamp(20_000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-events.test.js ---
15:    startsAtMs: now + 60 * 60 * 1000,
25:    startsAtMs: now + 60 * 60 * 1000,
37:    startsAtMs: now + 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-policy.test.js ---
11:  assert.throws(() => audienceForAge(15), /INVALID_MEMBER_AGE/);
21:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: false }), false);
22:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: true }), true);
41:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "all_ages", roomKind: "public", invited: false }), true);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-rental.test.js ---
7:  assert.equal(roomRentalExpiry(now, 30), now + 30 * 24 * 60 * 60 * 1000);
18:  assert.equal(calculateRoomRentalBalance(5000, 1000), 4000);
39:      { planId: "room_90d", durationDays: 90, priceCoins: 2700, active: true },
40:      { planId: "room_180d", durationDays: 180, priceCoins: 5000, active: true },
41:      { planId: "room_365d", durationDays: 365, priceCoins: 9000, active: true },
50:    { planId: "room_trial_2d", name: "تجربة يومين", durationDays: 2, priceCoins: 125, active: true },
51:    { planId: "room_long_10y", name: "خطة طويلة", durationDays: 3650, priceCoins: 250000, active: false },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/rules/firestore.rules.test.js ---
37:    await setDoc(doc(db, "users/alice"), { uid: "alice", coins: 1200 });
160:    reviewerUid: "alice", expiresAt: Date.now() + 60000,
171:    "users/alice/featuredAdRewardDays/2026-11-23",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/sticker-policy.test.js ---
12:test("owner-approved static sticker ceiling is exactly 256 KiB", () => {
13:  assert.equal(STICKER_LIMITS.staticMaxBytes, 256 * 1024);
16:    sizeBytes: 256 * 1024,
17:  }).sizeBytes, 256 * 1024);
20:    sizeBytes: 256 * 1024 + 1,
28:    sizeBytes: 512 * 1024, durationMs: 5000, frameCount: 50,
32:    sizeBytes: 512 * 1024 + 1, durationMs: 5000, frameCount: 50,
42:    { width: 513 }, { durationMs: 5001 }, { frameCount: 51 },
83:      sizeBytes: 1200, storagePath: "private/asset", downloadUrl: "https://private.invalid",
165:      sizeBytes: 1200, storagePath: "private/asset.webp",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-catalog.test.js ---
12:    priceCoins: 2500,
24:    priceCoins: 2500,
54:    priceCoins: 100, durationDays: 3650,
55:  }).durationDays, 3650);
61:  for (const durationDays of [2, 14, 365, 3650]) {
81:    priceCoins: 2500,
90:    priceCoins: 2500,
122:    active: true, version: 1, itemId: "vip_monthly", category: "vip", priceCoins: 500,
129:    active: true, version: 1, itemId: "profile_theme_30d", category: "theme", priceCoins: 500,
166:      priceCoins: 500,
181:    priceCoins: 500,
192:    priceCoins: 500,
205:    ["voice_call_7d", "voice_call", 500, 7],
206:    ["voice_call_30d", "voice_call", 1500, 30],
207:    ["video_call_24h", "video_call", 250, 1],
208:    ["video_call_7d", "video_call", 1250, 7],
209:    ["video_call_30d", "video_call", 3750, 30],
251:    category: "vip", priceCoins: 500, durationDays: null,
262:    category: "vip", priceCoins: 900, sortOrder: 1, active: true, purchaseEnabled: false,
264:  assert.equal(validateStoreCatalogItemInput({ ...base, durationDays: 3650 }).durationDays, 3650);
278:      assert.ok(item.durationDays >= 1 && item.durationDays <= 3650, item.itemId);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-gifting.test.js ---
14:    itemId: "vip_monthly", priceCoins: 2500, catalogVersion: 3, status: "completed",
18:    itemId: "vip_monthly", expectedPriceCoins: 2500, expectedCatalogVersion: 3,
43:    NOW + 10_000 + 7 * 24 * 60 * 60 * 1000,
47:    NOW + 24 * 60 * 60 * 1000,
50:    calculateStoreGiftExpiryMs({ status: "expired", expiresAt: { toMillis: () => NOW + 50_000 } }, 1, NOW),
51:    NOW + 24 * 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-purchase.test.js ---
14:  assert.equal(calculateStorePurchaseBalance(5000, 1250), 3750);
41:  assert.equal(isStorePurchasePriceCurrent(2500, 2500), true);
42:  assert.equal(isStorePurchasePriceCurrent(2500, 3000), false);
43:  assert.equal(isStorePurchasePriceCurrent(0, 2500), false);
44:  assert.equal(isStorePurchasePriceCurrent(2500.5, 2500), false);
45:  assert.equal(isStorePurchasePriceCurrent(2500, Number.MAX_SAFE_INTEGER + 1), false);
51:    { itemId: "title_a", category: "title", itemName: "لقب النخبة", status: "active", expiresAt: { toMillis: () => NOW + 5000 } },
60:      { itemId: "title_a", itemName: "لقب النخبة", category: "title", expiresAtMs: NOW + 5000 },
77:  const prior = { memberUid: "member-a", itemId: "vip_30d", priceCoins: 2500, catalogVersion: 7 };
78:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "vip_30d", 2500, 7), true);
80:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "vip_30d", 2500, 8), false);
81:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "other_item", 2500, 7), false);
82:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-b", "vip_30d", 2500, 7), false);
83:  assert.equal(isStorePurchaseReplayCompatible(null, "member-a", "vip_30d", 2500, 7), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/test-account-personas.test.js ---
20:  assert.deepEqual(guest.guestWindow, { durationSeconds: 3600, rollingWindowSeconds: 86400, emulatorClockOverrideOnly: true });
29:    durationSeconds: 3600,
82:    assert.ok(profile.biography.length >= 20);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/validate-firebase-config.test.js ---
5:const projectId = "mawda-app-2026";
6:const webAppId = "1:697303475139:web:8869603bda6f1a3c3ed376";
9:const nonprodProjectId = "mawda-platform-nonprod-2026";
16:  "  authDomain: 'mawda-app-2026.firebaseapp.com',",
17:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
24:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
31:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
37:  web: { appId: "1:12102454568:web:e5b292ae20b9a55ca2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
38:  android: { appId: "1:12102454568:android:5f8907b71af845cfa2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
57:  defaultAlias = "mawda-platform-nonprod-2026", nonprodSource = makeNonprodOptions(),
84:  assert.ok(validate(validOptions.replace(webAppId, "1:1234567890:web:abcdef123456789")).errors.includes("FIREBASE_WEB_APP_ID_MISMATCH"));
118:  assert.ok(validate(validOptions.replace(androidAppId, "1:1234567890:android:abcdef123456789")).errors.includes("FIREBASE_ANDROID_APP_ID_MISMATCH"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/verification-calendar.test.js ---
6:  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 0, 31, 12), 1), Date.UTC(2026, 1, 28, 12));
7:  assert.equal(addCalendarMonthsUtc(Date.UTC(2028, 0, 31, 12), 1), Date.UTC(2028, 1, 29, 12));
8:  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 10, 30, 8, 15), 3), Date.UTC(2027, 1, 28, 8, 15));
12:  const anchor = Date.UTC(2026, 0, 31, 12);
13:  const biometricDue = anchor + 30 * 24 * 60 * 60 * 1000;
14:  const emailDue = Date.UTC(2026, 3, 30, 12);
15:  assert.equal(BIOMETRIC_VERIFICATION_INTERVAL_MS, 30 * 24 * 60 * 60 * 1000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/wallet-reconciliation.test.js ---
6:  const result = reconcileWalletLedger(125, [
8:    { id: "purchase", amount: -25, balanceBefore: 100, balanceAfter: 75 },
9:    { id: "reward", amount: 50, balanceBefore: 75, balanceAfter: 125 },
13:  assert.equal(result.computedBalance, 125);
14:  assert.equal(result.netLedgerDelta, 125);
20:    { id: "new-debit", amount: -25, balanceBefore: 100, balanceAfter: 75 },
29:    { id: "legacy", amount: -20 },
38:  const arithmetic = reconcileWalletLedger(90, [
39:    { id: "a", amount: 100, balanceBefore: 0, balanceAfter: 90 },
43:  const chain = reconcileWalletLedger(90, [
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/firebase_options.dart ---
35:    appId: '1:697303475139:web:8869603bda6f1a3c3ed376',
37:    projectId: 'mawda-app-2026',
38:    authDomain: 'mawda-app-2026.firebaseapp.com',
39:    storageBucket: 'mawda-app-2026.firebasestorage.app',
50:    projectId: 'mawda-app-2026',
51:    storageBucket: 'mawda-app-2026.firebasestorage.app',
57:    projectId: 'mawda-app-2026',
58:    storageBucket: 'mawda-app-2026.firebasestorage.app',
63:    appId: '1:1234567890:macos:abcdef123456789',
64:    messagingSenderId: '1234567890',
71:    appId: '1:1234567890:windows:abcdef123456789',
72:    messagingSenderId: '1234567890',
79:    appId: '1:1234567890:linux:abcdef123456789',
80:    messagingSenderId: '1234567890',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/firebase_options_nonprod.dart ---
51:    appId: '1:12102454568:web:e5b292ae20b9a55ca2141d',
53:    projectId: 'mawda-platform-nonprod-2026',
54:    authDomain: 'mawda-platform-nonprod-2026.firebaseapp.com',
55:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
60:    appId: '1:12102454568:android:5f8907b71af845cfa2141d',
62:    projectId: 'mawda-platform-nonprod-2026',
63:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
69:    projectId: 'mawda-platform-nonprod-2026',
70:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/main.dart ---
37:        title: 'مودة | Mawdda Platform 2026',
133:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/models/app_models.dart ---
2:// الكود الشامل، النهائي، والكامل بامتياز لتطبيق مودة (mawda-app-2026)
21:      'uploadedAt': uploadedAt.toIso8601String(),
22:      'expiresAt': expiresAt.toIso8601String(),
52:  final String bio;                   // النبذة التعريفية (حتى 500 حرف)
54:  final bool isEmailVerified;         // توثيق البريد (+500 كوينز)
55:  final bool isBiometricVerified;    // التوثيق البيومتري (+1500 كوينز)
159:      'createdAt': createdAt.toIso8601String(),
160:      'updatedAt': updatedAt.toIso8601String(),
251:      'sessionStartedAt': sessionStartedAt.toIso8601String(),
252:      'sessionExpiresAt': sessionExpiresAt.toIso8601String(),
312:      'createdAt': createdAt.toIso8601String(),
343:    this.dailyRewardCoins = 50,
345:    this.weeklyRewardCoins = 500,
346:    this.adWatchRewardCoins = 20,
366:      dailyRewardCoins: map['dailyRewardCoins'] ?? 50,
368:      weeklyRewardCoins: map['weeklyRewardCoins'] ?? 500,
369:      adWatchRewardCoins: map['adWatchRewardCoins'] ?? 20,
408:      'timestamp': timestamp.toIso8601String(),
451:      'cancelledAt': cancelledAt.toIso8601String(),
498:      'timestamp': timestamp.toIso8601String(),
556:      'timestamp': timestamp.toIso8601String(),
557:      'expiresAt': expiresAt.toIso8601String(),
610:      'assignedAt': assignedAt.toIso8601String(),
657:      'bannedAt': bannedAt.toIso8601String(),
658:      'expiresAt': expiresAt.toIso8601String(),
696:      'lastDailyClaim': lastDailyClaim?.toIso8601String(),
697:      'lastHourlyClaim': lastHourlyClaim?.toIso8601String(),
698:      'lastWeeklyClaim': lastWeeklyClaim?.toIso8601String(),
748:      'timestamp': timestamp.toIso8601String(),
792:      'timestamp': timestamp.toIso8601String(),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/models/user_model.dart ---
2:// Production Home 2022 - Mawda Platform User Model
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/policies/chat_audio_policy.dart ---
2:/// The trusted backend and scanner independently enforce the same 60-second limit.
3:const int maxLiveChatAudioRecordingSeconds = 60;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/privacy_policy.dart ---
1:const mawdaPrivacyPolicyVersion = '2026-11-14.1';
3:    '3af7c404337db26a806031864f979f54e15a74495818fb24e0eff58a1a267c93';
16:مدة دورة المكافأة البيومترية 30 يوماً، وتُمنح 1,500 كوين مرة واحدة في الدورة بعد نجاح نافذة المصادقة المحلية في تطبيق Android أو iOS، ثم قبول طلب المكافأة من الخادم. يفرض الخادم اكتمال العضوية وصلاحية الحساب والفاصل الزمني ويضيف المكافأة وسجل المحفظة داخل معاملة واحدة لمنع التكرار. هذا المسار يعتمد على مطالبة التطبيق بنجاح نافذة نظام التشغيل؛ ولا يقدم إثباتاً تشفيرياً بأن عميلاً معدلاً لم يتجاوز النافذة، ولذلك فالمكافأة تشجيعية على المصادقة المحلية وليست إثبات هوية مدنية أو أساساً منفرداً لمنح صلاحيات أمنية حساسة. لا تلتقط مودة الكاميرا أو الميكروفون ولا تسجل صوتاً لهذا الغرض.
18:تستهدف مودة دورة تحقق حديث للبريد كل 90 يوماً ومكافأة 500 كوين مرة واحدة لكل دورة مؤهلة. يجب أن يعتمد صرف هذه المكافأة على إثبات حديث لامتلاك صندوق البريد مرتبط بالدورة الخادمية، لا على بقاء علامة emailVerified القديمة وحدها؛ وتظل المكافأة غير مفعلة إلى أن يكتمل مسار إعادة التحقق واختباره.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/ad_viewing_screen.dart ---
14:            final horizontal = constraints.maxWidth >= 520;
78:            padding: const EdgeInsets.all(20),
132:                maxCrossAxisExtent: 220,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/auth_gate.dart ---
213:        const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/biometric_review_screen.dart ---
81:            ? 'ستُفعّل حالة التوثيق ويُضاف 1,500 BetaCoins إلى محفظة العضو بمعاملة خادمية واحدة.'
122:                  child: Text('هذه المراجعة حصرية للمالك الأعلى (Super Owner). افتح واستمع إلى الصوت وشاهد الفيديو بنفسك قبل القرار. القبول وحده يمنح 1,500 BetaCoins. يتطلب الخادم مطالبة المالك وجلسة MFA حديثة ويثبت القرار والمكافأة في سجل تدقيق ومعاملة ذرية.'),
166:              icon: const Icon(Icons.check_circle_outline), label: const Text('قبول + 1,500 BetaCoins'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/biometric_verification_screen.dart ---
81:      _recordingTimer = Timer(const Duration(seconds: 20), _stopRecording);
246:                  ? 'التسجيل جارٍ الآن. اقرأ العبارة بوضوح؛ سيتوقف تلقائياً عند 20 ثانية.'
255:                  label: Text(_recording ? 'إيقاف التسجيل' : 'تسجيل العبارة (حتى 20 ثانية)'),
273:              const Text('سجّل صوتك وأنت تقرأ العبارة كاملة، ثم سجّل فيديو مدته من 3 إلى 5 ثوانٍ. الحد الأعلى للصوت 20 ثانية و5 MiB، وللفيديو 25 MiB.'),
302:            title: Text('مكافأة القبول: 1,500 BetaCoins'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/call_usage_policy_screen.dart ---
70:        _windowHours.text = window == null ? '' : (window / 3600000).toString();
74:        _maxDurationMinutes.text = duration == null ? '' : (duration / 60000).toString();
90:    if (hours == null || hours < (1 / 60) || hours > 8760 ||
105:          'quotaWindowMs': (hours * 3600000).round(),
108:          'maxCallDurationMs': durationMinutes == null ? null : durationMinutes * 60000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/capacity_media_management_screen.dart ---
225:                            style: TextStyle(fontWeight: FontWeight.w600),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/chat_room_screen.dart ---
191:      imageQuality: 90,
192:      maxWidth: 2048,
193:      maxHeight: 2048,
557:                                            height: 120,
597:                                                  url, width: 260, height: 220, fit: BoxFit.cover,
621:                                          width: 260,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/conversations_screen.dart ---
133:                  const SizedBox(height: 20),
173:                    style: TextStyle(fontWeight: hasUnread ? FontWeight.bold : FontWeight.w500),
180:                      fontWeight: hasUnread ? FontWeight.w600 : FontWeight.normal,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/direct_chat_screen.dart ---
252:            'limit': 50,
300:      final request = <String, dynamic>{'limit': 50};
382:            'limit': 50,
456:      imageQuality: 90,
457:      maxWidth: 2048,
458:      maxHeight: 2048,
779:                            height: 120,
819:                                  url, width: 260, height: 220, fit: BoxFit.cover,
843:                          width: 260,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/featured_ads_screen.dart ---
48:        duration: const Duration(milliseconds: 250),
70:            .clamp(250, 60 * 1000).toInt();
202:                      height: 250,
494:                  padding: EdgeInsets.all(20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/gift_coins_screen.dart ---
193:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/guest_room_chat_screen.dart ---
141:      if (pcm.lengthInBytes < 2048) {
277:            icon: _busy ? const SizedBox(width: 20, height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/guest_session_screen.dart ---
135:    return 'الوقت المتبقي: ${remaining.inMinutes} دقيقة و${remaining.inSeconds.remainder(60)} ثانية';
148:      TextField(controller: _country, maxLength: 60,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/landing_page.dart ---
35:                image: NetworkImage('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1350&q=80'),
55:                    constraints: const BoxConstraints(maxWidth: 550),
64:                          color: Colors.pink.withValues(alpha: 0.15),
65:                          blurRadius: 25,
78:                            color: Colors.pink.withValues(alpha: 0.15),
83:                                blurRadius: 20,
99:                          style: TextStyle(fontSize: 12, color: Color(0xFFFFD700), fontWeight: FontWeight.w600),
101:                        const SizedBox(height: 20),
113:                        const SizedBox(height: 20),
152:        duration: const Duration(milliseconds: 250),
158:            color: isSelected ? Colors.pinkAccent : Colors.white.withValues(alpha: 0.15),
229:            '🎉 هدية انضمام: 500 كوينز مجانية (يرجى مراجعة الـ Spam وتأكيد البريد).',
244:            color: Colors.black.withValues(alpha: 0.25),
246:            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
267:            color: Colors.black.withValues(alpha: 0.25),
269:            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
290:            '🔒 توثيق بيومتري (اختياري - صوت + سيلفي): يمنحك +1500 كوينز ودرع موثق!',
305:              const SnackBar(content: Text('جاري بدء إتمام التسجيل والحصول على الـ 500 كوينز...')),
338:              const SnackBar(content: Text('تم بدء الجلسة المؤقتة لمدة 60 دقيقة...')),
354:        prefixIcon: Icon(icon, size: 16, color: Colors.white60),
358:        fillColor: Colors.black.withValues(alpha: 0.25),
362:          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
378:        title: const Text('التواصل مع السوبر أدمن والدعم', style: TextStyle(color: Colors.white, fontSize: 15)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/landing_page_screen.dart ---
38:      'regDesc': 'مرحباً بك! ستحصل فور تسجيلك على مكافأة 500 كوينز.',
40:      'legalNotice': '© 2026 جميع الحقوق القانونية والتجارية والتقنية محفوظة لصالح مجموعة Production Home Company 2022. يُمنع نسخ أو إعادة استخدام أو استغلال أو تعديل أي جزء من المنصة أو هويتها أو محتواها دون إذن كتابي مسبق من أصحاب الحقوق.',
56:      'regDesc': 'Welcome! You will instantly receive a 500 coins bonus upon registration.',
58:      'legalNotice': '© 2026 All legal, commercial and technical rights are reserved in favor of Production Home Company 2022 Group. No part of this platform, its identity or content may be copied, reused, exploited or modified without prior written permission from the rights holders.',
74:      'regDesc': 'Bienvenue! Vous recevrez instantanément un bonus de 500 pièces.',
76:      'legalNotice': '© 2026 Tous les droits juridiques, commerciaux et techniques sont réservés au profit du groupe Production Home Company 2022. Toute copie, réutilisation, exploitation ou modification de la plateforme, de son identité ou de son contenu nécessite une autorisation écrite préalable des ayants droit.',
92:      'regDesc': '¡Bienvenido! Recibirás un bono de 500 monedas al registrarte.',
94:      'legalNotice': '© 2026 Todos los derechos legales, comerciales y técnicos quedan reservados a favor del Grupo Production Home Company 2022. Se prohíbe copiar, reutilizar, explotar o modificar cualquier parte de la plataforma, su identidad o contenido sin autorización previa por escrito de los titulares de los derechos.',
144:      padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
147:          constraints: const BoxConstraints(maxWidth: 900),
157:                  'https://avatars.githubusercontent.com/u/348720557?v=4',
161:                  semanticLabel: 'Production Home Company 2022 logo',
164:                    size: 20,
170:                constraints: const BoxConstraints(maxWidth: 850),
179:                    letterSpacing: _currentLocale == 'ar' ? 0 : 0.15,
283:      height: 50,
314:        const SizedBox(height: 20),
320:        const SizedBox(height: 15),
341:        const SizedBox(height: 20),
361:        const SizedBox(height: 20),
379:        const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/login_screen.dart ---
42:            width: 520,
340:      backgroundColor: const Color(0xFF160D1B),
381:              const SizedBox(height: 20),
383:                child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
393:                const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/main_user_screen.dart ---
137:        title: const Text('مودة | Mawdda Platform 2026'),
293:          const SnackBar(content: Text('اكتمل ملفك! أضيفت 500 كوين إلى محفظتك.')),
333:        padding: const EdgeInsets.all(20),
335:          constraints: const BoxConstraints(maxWidth: 560),
348:                const SizedBox(height: 20),
353:                    if (v.length < 3 || v.length > 20) return 'اسم المستخدم من 3 إلى 20 حرفاً';
360:                    if (age == null || age < 16 || age > 120) return 'يجب أن يكون العمر 16 عاماً على الأقل';
389:                _field('نبذة عنك (حتى 500 حرف)', _bio, maxLines: 4,
390:                  validator: (value) => (value?.length ?? 0) > 500 ? 'الحد الأقصى 500 حرف' : null),
462:                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
466:                const Text('تُمنح مكافأة 500 كوين بعد نجاح التحقق وإكمال العضوية وفق سياسة العمر المعتمدة.',
489:            constraints: const BoxConstraints(maxWidth: 520),
500:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/mawdda_call_screen.dart ---
146:      _pollTimer = Timer.periodic(const Duration(milliseconds: 900), (_) {
601:              top: 16, right: 16, width: 112, height: 160,
609:            left: 20, right: 20, bottom: 36,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/member_entitlement_history_screen.dart ---
98:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/my_contracts_screen.dart ---
66:          width: 560,
171:                                'SHA-256: ${contract['contentHash'] ?? '—'}',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_advertising_rewards_screen.dart ---
68:        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'uploaderType': 'all', 'limit': 50}),
180:      if (upload.statusCode < 200 || upload.statusCode >= 300) {
207:        budget == null || duration < 15 || duration > 900 || reward < 0 ||
323:            width: 520,
605:                SizedBox(width: 120, child: TextField(controller: _maxClaims, enabled: !_saving,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_biometric_review_screen.dart ---
73:          maxLength: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_chat_participation_screen.dart ---
48:        .call({'chatId': widget.chatId, 'limit': 50});
113:    if (!rawUrl.startsWith('https://') || rawUrl.length > 2048 ||
114:        title.text.trim().length > 120 || description.text.trim().length > 500) {
236:                        constraints: const BoxConstraints(maxWidth: 520),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_coin_purchase_screen.dart ---
68:        currencyCode.codeUnits.every((unit) => unit >= 65 && unit <= 90);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_contract_center_screen.dart ---
200:          width: 560,
324:                                'SHA-256: ${contract['contentHash'] ?? '—'}',
418:          width: 600,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_entitlement_grants_screen.dart ---
90:      case 720:
118:          'الدفعات التقنية: ${(targets.length / 500).ceil()}\n'
152:      for (var offset = 0; offset < targets.length; offset += 500) {
153:        final chunk = targets.skip(offset).take(500).toList(growable: false);
246:                        DropdownMenuItem(value: 720, child: Text('30 يوماً')),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_featured_ads_dashboard_screen.dart ---
21:  final _policyVideoCompletion = TextEditingController(text: '90');
81:        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'limit': 50}),
103:        _policyVideoCompletion.text = (policy['videoCompletionPercent'] ?? 90).toString();
149:        imageVisibleMs < 1000 || imageVisibleMs > 3600000 ||
346:              currencyCode.codeUnits.every((unit) => unit >= 65 && unit <= 90);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_featured_ads_screen.dart ---
38:  final _videoPercent = TextEditingController(text: '90');
83:          'status': 'security_approved', 'uploaderType': 'all', 'limit': 50,
108:        _videoPercent.text = (rewardPolicy['videoCompletionPercent'] ?? 90).toString();
353:        content: SizedBox(width: 520, child: events.isEmpty
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_mfa_enrollment_screen.dart ---
51:        issuer: 'Mawdda Platform 2026',
135:          constraints: const BoxConstraints(maxWidth: 560),
146:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_room_live_stream_screen.dart ---
29:        url.length > 2048 || _title.text.trim().length > 120 ||
30:        _description.text.trim().length > 500) {
64:      TextField(controller: _title, enabled: !_sending, maxLength: 120,
66:      TextField(controller: _description, enabled: !_sending, maxLength: 500, maxLines: 3,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/owner_sticker_packs_screen.dart ---
34:    if (_stickers.length >= 120) {
35:      _showMessage('بلغت الحزمة الحد الأقصى البالغ 120 ملصقاً.');
165:            label: const Text('رفع ملصق ثابت PNG أو WebP (حتى 256 KiB)'),
180:          Text('الملصقات المضافة: ${_stickers.length}/120',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/privacy_acknowledgement_screen.dart ---
31:              constraints: const BoxConstraints(maxWidth: 720),
33:                padding: const EdgeInsets.all(20),
38:                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
89:                                width: 20,
90:                                height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/production_application_screen.dart ---
153:          TextFormField(controller: _experience, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'الخبرات العملية'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'اكتب خبرة لا تقل عن 20 حرفاً.'),
160:          TextFormField(controller: _role, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'الدور الذي ترغب بالمساهمة فيه'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى توضيح الدور بما لا يقل عن 20 حرفاً.'),
161:          TextFormField(controller: _interview, minLines: 4, maxLines: 8, decoration: const InputDecoration(labelText: 'أسئلة المقابلة: عرفنا بخبرتك، وكيف تدير جودة العمل والتعاون؟'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى كتابة إجابات كافية للمقابلة.'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/profile_screen.dart ---
134:          'لذلك فإن مكافأة 1500 بيتا بيتا كوينز وصلاحيات التوثيق البيومتري معلّقة حتى اكتمال التحقق الآمن المرتبط بالجهاز. '
197:              'تم تجديد التحقق من البريد وإضافة 500 بيتا بيتا كوينز إلى محفظتك${balance == null ? '' : '؛ رصيدك الجديد $balance'}.',
207:            content: Text('أرسلنا رابط تحقق جديد إلى بريدك. افتحه ثم ارجع إلى هنا واضغط الزر نفسه لاعتماد مكافأة 500 بيتا بيتا كوينز.'),
302:          maxLength: 160,
453:          width: 460,
467:                      maxLength: 500,
601:                    _editField(bio, 'نبذة عنك', maxLength: 500, maxLines: 4),
682:    int maxLength = 120,
695:        if (label == 'نبذة عنك') return text.length <= 500 ? null : 'الحد الأقصى 500 حرف.';
1276:                    color: Colors.blueGrey.shade900,
1305:                  radius: 50,
1319:                  radius: 50,
1412:                          style: const TextStyle(fontWeight: FontWeight.w600),
1530:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1549:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1583:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1621:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1695:                    label: const Text('تجديد التحقق من البريد (500 بيتا بيتا كوينز كل 90 يوماً)'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/reward_center_screen.dart ---
267:            width: 520,
341:          constraints: const BoxConstraints(maxWidth: 520),
387:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/room_events_screen.dart ---
63:    final duration = TextEditingController(text: '60');
74:            width: 420,
86:                    maxLength: 500,
112:                        lastDate: DateTime.now().add(const Duration(days: 90)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/room_moderation_screen.dart ---
192:              maxLength: 500,
256:          maxLength: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/room_rental_pricing_screen.dart ---
53:                name.text.trim().length < 3 || d == null || d < 1 || d > 3650 ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/rooms_screen.dart ---
64:      final capacity = TextEditingController(text: '50');
71:            content: SizedBox(width: 420, child: Column(mainAxisSize: MainAxisSize.min, children: [
414:              constraints: const BoxConstraints(maxWidth: 1120),
436:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/safety_center_screen.dart ---
137:          maxLength: 2000,
139:            labelText: 'اشرح سبب الاستئناف (20 حرفاً على الأقل)',
147:              if (controller.text.trim().length >= 20) {
259:                  maxLength: 2000,
286:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/safety_review_screen.dart ---
23:      FirebaseFunctions.instance.httpsCallable('listSafetyCases').call({'status': 'open', 'limit': 50}),
148:                const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/shop_screen.dart ---
203:                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/stories_screen.dart ---
205:                          height: 120,
211:                        height: 120,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/super_admin_screen.dart ---
109:        limit: 25,
163:    final expires = asset['retentionExpiresAt'];
164:    if (asset['retentionPolicyStatus'] == 'owner_approval_required' || expires == null) {
182:    final ageHours = (age / (60 * 60 * 1000)).toStringAsFixed(1);
246:                        lastDate: now.add(const Duration(days: 3650)),
265:                        lastDate: now.add(const Duration(days: 3650)),
446:            width: 560,
529:            constraints: const BoxConstraints(maxWidth: 520, maxHeight: 520),
567:        _minimumAge = configuredAge is num && configuredAge.toInt() >= 16 && configuredAge.toInt() <= 120
643:            width: 460,
672:                    maxLength: 500,
845:    final capacityController = TextEditingController(text: '50');
853:            width: 420,
859:                  maxLength: 60,
901:                if (name.length >= 3 && name.length <= 60 &&
1105:            width: 560,
1106:            height: 520,
1165:          maxLength: 500,
1280:          maxLength: 500,
1428:            padding: EdgeInsets.all(20),
1639:                  style: TextStyle(fontWeight: FontWeight.w600),
1721:                  max: 120,
1863:                                      width: 20,
1864:                                      height: 20,
1870:                              asset['retentionPolicyStatus'] != 'legal_hold')
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/screens/user_profile_screen.dart ---
37:                  height: 200,
39:                  color: Colors.pink.shade200,
42:                  bottom: -50,
47:                      radius: 50,
49:                      child: Icon(Icons.person, size: 50, color: Colors.white),
55:            const SizedBox(height: 60),
66:            const SizedBox(height: 15),
95:            const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/services/audio_wav_encoder.dart ---
31:  header.setUint16(20, 1, Endian.little); // Linear PCM.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/services/member_media_upload_service.dart ---
42:    if (contentType == 'video/mp4') return 25 * 1024 * 1024;
43:    if (contentType == 'application/pdf') return 20 * 1024 * 1024;
104:    if (uploadResponse.statusCode != 200) {
195:    if (uploadResponse.statusCode != 200) {
206:    Duration timeout = const Duration(seconds: 90),
288:    if (uploadResponse.statusCode != 200) {
348:  /// the member entitlement on every save and never changes server retention.
527:    final maximum = kind == 'animated' ? 512 * 1024 : 256 * 1024;
551:    if (uploadResponse.statusCode != 200) {
667:    if (response.statusCode != 200) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/services/room_billing_service.dart ---
40:          'freezeExpiresAt': now.add(const Duration(hours: 24)).toIso8601String(),
83:        'expiresAt': newExpiry.toIso8601String(),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/services/super_admin_security_service.dart ---
11:    int limit = 25,
322:    int pageSize = 50,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/chat_audio_controls.dart ---
75:        sampleRate: 16000,
115:      if (pcmBytes.lengthInBytes < 2048) {
122:      final wav = encodePcm16MonoToWav(pcmBytes, sampleRate: 16000);
158:                width: 20,
159:                height: 20,
246:        width: 260,
257:                      width: 20,
258:                      height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/mawdda_app_downloads.dart ---
140:              style: TextStyle(color: Colors.white60, fontSize: 11, height: 1.5),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/mawdda_sticker_widgets.dart ---
142:                                            width: 20,
143:                                            height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/member_activity_meter.dart ---
33:      const Duration(seconds: 60),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/premium_profile_effects.dart ---
79:    duration: const Duration(milliseconds: 1900),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/lib/widgets/responsive_room_card.dart ---
9:    this.compactBreakpoint = 520,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/processors.js ---
9:  gif: { maxFrames: 50, maxPixels: 40_000_000, maxDurationSeconds: 20, maxBytes: 3 * 1024 * 1024 },
10:  audio: { maxDurationSeconds: 60, roomMaxDurationSeconds: 60, maxBytes: 5 * 1024 * 1024 },
11:  video: { maxDurationSeconds: 90, maxBytes: 15 * 1024 * 1024 },
12:  pdf: { maxPages: 30, maxBytes: 20 * 1024 * 1024 },
28:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
37:async function uploadDerivative({ storage, bucketName, outputPath, request, sourceSha256, provider, filename, contentType, pipelineVersion, maxBytes }) {
46:    sourceSha256,
67:        String(custom.sourceSha256) !== sourceSha256 ||
75:      sha256: await sha256StorageObject(file), contentType, pipelineVersion,
83:      String(custom.sourceSha256) !== sourceSha256 ||
90:    sha256: await sha256StorageObject(file), contentType, pipelineVersion,
94:async function sha256StorageObject(file) {
95:  const hash = createHash("sha256");
105:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
133:  if (contentType !== "image/gif" && stat.size > 256 * 1024) {
140:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
148:      !Number.isSafeInteger(frames) || frames < 1 || frames > 50) {
153:    if (!Number.isSafeInteger(durationMs) || durationMs < 1 || durationMs > 5000 ||
157:  if (frames !== 1 || stat.size > 256 * 1024) {
163:async function processGif({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
169:    "-vf", "scale=2048:2048:force_original_aspect_ratio=decrease:flags=lanczos",
172:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
176:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
187:  if (purpose === "room" || purpose === "chat" || purpose === "biometric") return 60;
197:async function processAudio({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
209:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
211:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
218:async function processVideo({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
228:    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
233:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/security.js ---
81:    custom.sourceSha256 === expected.sourceSha256 &&
86:function isSignatureDatabaseFresh(lastUpdatedMs, nowMs = Date.now(), maxAgeMs = 36 * 60 * 60 * 1000) {
89:    lastUpdatedMs <= nowMs + 5 * 60 * 1000 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/server.js ---
23:const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_DOWNLOAD_BYTES || 25 * 1024 * 1024);
24:const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS || 150_000);
26:const MAX_SIGNATURE_AGE_MS = Number(process.env.MAX_SIGNATURE_AGE_MS || 36 * 60 * 60 * 1000);
50:async function sha256StorageObject(file) {
51:  const hash = createHash("sha256");
56:async function sha256File(filePath) {
57:  const hash = createHash("sha256");
65:    signal: AbortSignal.timeout(90_000),
80:  await pipeline(require("node:stream").Readable.fromWeb(response.body), limiter, createWriteStream(destination, { flags: "wx", mode: 0o600 }));
105:      "--max-filesize=25M", "--max-scansize=50M",
122:async function createSafeImageDerivative(sourcePath, request, sourceSha256) {
138:  const maxPreviewBytes = stickerPreview ? 256 * 1024 : MAX_SAFE_PREVIEW_BYTES;
165:    sourceSha256,
178:          sourceSha256,
192:    const existingHash = await sha256StorageObject(derivative);
196:      safePreviewSha256: existingHash,
208:    safePreviewSha256: await sha256StorageObject(derivative),
218:  const signature = createHmac("sha256", HMAC_SECRET).update(body).digest("hex");
228:    signal: AbortSignal.timeout(15_000),
243:      json(response, 503, { error: "scanner_not_configured" });
248:      json(response, 503, { error: "scanner_signatures_stale" });
261:    const sourceSha256 = await sha256File(sourcePath);
280:          sourcePath, tempDir, request: scanRequest, sourceSha256,
284:        derivative = await createSafeImageDerivative(sourcePath, scanRequest, sourceSha256);
288:          sourcePath, tempDir, request: scanRequest, sourceSha256,
302:      sha256: sourceSha256,
316:    json(response, 202, { accepted: true, mediaId: scanRequest.mediaId, verdict });
324:    json(response, 503, { error: "scan_unavailable" });
339:    MAX_DOWNLOAD_BYTES > 25 * 1024 * 1024 ||
348:    json(response, signatures.fresh ? 200 : 503, {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/test/processors.integration.test.js ---
75:      "-pix_fmt", "yuv420p", output,
90:      "nullsrc=size=512x512,geq=lum=random(1)*255", "-frames:v", "1", "-c:v", "png", output,
121:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
130:        sourceSha256, storage, bucketName: "mawadda-test", provider,
136:      assert.match(result.safeDerivative.sha256, /^[a-f0-9]{64}$/);
140:      assert.equal(saved.metadata.metadata.sourceSha256, sourceSha256);
168:  test(`real audio processor accepts a recording at the exact 60-second ceiling for ${purpose}`, async () => {
174:        "sine=frequency=440:duration=60", "-c:a", "pcm_s16le", sourcePath,
176:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
184:        sourceSha256, storage, bucketName: "mawdda-test", provider,
194:  test(`real audio processor rejects recordings beyond 60 seconds for ${purpose}`, async () => {
200:        "sine=frequency=440:duration=60.1", "-c:a", "pcm_s16le", sourcePath,
202:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
209:        sourceSha256, storage: fakeStorage(), bucketName: "mawdda-test", provider,
229:      assert.ok(metadata.sizeBytes > 0 && metadata.sizeBytes <= 256 * 1024);
271:    assert.ok(metadata.durationMs > 0 && metadata.durationMs <= 5000);
272:    assert.ok(metadata.frameCount > 1 && metadata.frameCount <= 50);
273:    const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
281:      sourceSha256, storage, bucketName: "mawdda-test", provider,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/test/processors.test.js ---
6:  assert.equal(LIMITS.gif.maxFrames, 50);
7:  assert.equal(LIMITS.gif.maxDurationSeconds, 20);
10:  assert.equal(LIMITS.audio.maxDurationSeconds, 60);
12:  assert.equal(LIMITS.audio.roomMaxDurationSeconds, 60);
13:  assert.equal(audioDurationLimitForPurpose("chat"), 60);
14:  assert.equal(audioDurationLimitForPurpose("room"), 60);
15:  assert.equal(audioDurationLimitForPurpose("biometric"), 60);
16:  assert.equal(LIMITS.video.maxBytes, 15 * 1024 * 1024);
17:  assert.equal(LIMITS.video.maxDurationSeconds, 90);
18:  assert.equal(LIMITS.pdf.maxBytes, 20 * 1024 * 1024);
21:  assert.equal(LIMITS.video.maxDurationSeconds, 90);
45:  assert.equal(videoDurationAllowedForPurpose("chat", 90), true);
46:  assert.equal(videoDurationAllowedForPurpose("chat", 90.001), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/scanner/test/security.test.js ---
47:    mediaId, objectGeneration: generation, sourceSha256: "a".repeat(64),
55:      sourceSha256: "a".repeat(64),
63:  assert.equal(isSafeDerivativeMetadata({ ...metadata, metadata: { ...metadata.metadata, sourceSha256: "b".repeat(64) } }, expected), false);
79:  const maxAge = 36 * 60 * 60 * 1000;
80:  assert.equal(isSignatureDatabaseFresh(now - 60 * 60 * 1000, now, maxAge), true);
81:  assert.equal(isSignatureDatabaseFresh(now - 40 * 60 * 60 * 1000, now, maxAge), false);
83:  assert.equal(isSignatureDatabaseFresh(now + 10 * 60 * 1000, now, maxAge), false);
88:  assert.deepEqual(parseClamAvVersion("ClamAV 1.4.6/28202/Thu Nov 13 06:00:00 2026"), {
91:    signatureDatabaseVersion: "28202",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/storage.rules ---
5:    // content validation and scheduled retention are implemented.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/test/audio_wav_encoder_test.dart ---
18:      expect(header.getUint16(20, Endian.little), 1);
32:      final wav = encodePcm16MonoToWav(pcm, sampleRate: 16000);
35:      expect(header.getUint32(24, Endian.little), 16000);
36:      expect(header.getUint32(28, Endian.little), 32000);
47:        () => encodePcm16MonoToWav(Uint8List.fromList([1, 2]), sampleRate: 96000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/test/chat_audio_policy_test.dart ---
6:  test('live microphone chat recordings are capped at exactly 60 seconds', () {
7:    expect(maxLiveChatAudioRecordingSeconds, 60);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/test/coin_transfer_models_test.dart ---
6:    test('parses a 20 percent transfer quote correctly', () {
9:        'commissionBps': 2000,
10:        'commissionAmount': 200,
15:      expect(quote.commissionBps, 2000);
16:      expect(quote.commissionPercent, 20);
17:      expect(quote.commissionAmount, 200);
39:        'commissionBps': 2000,
40:        'commissionAmount': 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/test/widgets/responsive_room_card_test.dart ---
6:  for (final width in [320.0, 390.0, 768.0, 1440.0]) {
9:      tester.view.physicalSize = Size(width, 900);
22:                    subtitle: Text('غرفة خاصة • الأعضاء: 25 / 100'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/web/install-prompt.js ---
69:      setDismissedUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-governance.ts ---
85:  return createHash("sha256").update("specialized-role-v1|" + uid + "|" + role).digest("hex");
130:  if (scopes.length < 1 || scopes.length > 200 ||
132:        scope.trim().length < 1 || scope !== scope.trim() || /[\x00-\x1f\x7f]/.test(scope) || scope.length > 160 || scope === "*")) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-intake.ts ---
46:  const raw = text(value, 10, 2048, "invalid_portfolio_url");
68:  const displayName = text(data.displayName, 2, 120, "invalid_display_name");
72:  const description = text(data.description, 30, 5000, "invalid_description");
74:    ? text(data.experience, 20, 3000, "invalid_experience") : null;
90:  const proposedDuration = text(data.proposedDuration, 2, 120, "invalid_duration");
120:  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{1,150}$/.test(requestId)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/audit-archive.ts ---
5:export const OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS = 64_281_600;
6:export const OWNER_AUDIT_ARCHIVE_MIN_AGE_MS = 5 * 60 * 1000;
7:export const OWNER_AUDIT_ARCHIVE_BATCH_SIZE = 500;
25:/** The worker refuses buckets without a locked, minimum-24-month retention policy. */
27:  retentionPeriodSeconds: number;
35:    retentionPolicy?: { isLocked?: unknown; retentionPeriod?: unknown };
41:  const retention = value.retentionPolicy;
42:  const retentionPeriodSeconds = typeof retention?.retentionPeriod === "number"
43:    ? retention.retentionPeriod
44:    : Number(retention?.retentionPeriod);
45:  if (retention?.isLocked !== true ||
46:      !Number.isSafeInteger(retentionPeriodSeconds) ||
47:      retentionPeriodSeconds < OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS) {
55:  return { retentionPeriodSeconds, uniformBucketLevelAccess, publicAccessPrevention };
120:): { payload: string; sha256: string } {
132:    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
145:  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
146:  return { payload, sha256 };
183:  const batchId = createHash("sha256")
186:    .slice(0, 20);
200:): { payload: string; sha256: string } {
213:    retentionSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
220:  const sha256 = createHash("sha256").update(payload, "utf8").digest("hex");
221:  return { payload, sha256 };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-evidence.ts ---
1:export const BIOMETRIC_SPOKEN_PHRASE_VERSION = "owner-approved-2026-11-20-v1";
5:export const BIOMETRIC_AUDIO_MAX_DURATION_MS = 20_000;
6:export const BIOMETRIC_VIDEO_MAX_BYTES = 25 * 1024 * 1024;
7:export const BIOMETRIC_EVIDENCE_UPLOAD_TTL_MS = 5 * 60 * 1000;
8:export const BIOMETRIC_EVIDENCE_REVIEW_TTL_MS = 60 * 1000;
9:export const BIOMETRIC_REWARD_COINS = 1500;
21:      !/^[a-z0-9_]{3,20}$/.test(username) || !["male", "female"].includes(gender)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-lifecycle.ts ---
23:const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
171:      evidenceDeletionRetryAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
314:      phraseHash: createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex"),
352:      data.phraseHash !== createHash("sha256").update(BIOMETRIC_SPOKEN_PHRASE).digest("hex")) {
379:    typeof asset.scannerSha256 === "string" && /^[a-f0-9]{64}$/.test(asset.scannerSha256) &&
387:      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
393:      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256) ||
428:    if (createHash("sha256").update(audio).digest("hex") !== audioAsset.scannerSha256 ||
429:        createHash("sha256").update(video).digest("hex") !== videoAsset.scannerSha256) {
448:  const audioHash = createHash("sha256").update(audio).digest("hex");
449:  const videoHash = createHash("sha256").update(video).digest("hex");
460:      audioSha256: audioHash, videoSha256: videoHash,
468:    audioSha256: audioHash, videoSha256: videoHash, audioBytes: audio.length, videoBytes: video.length,
476:  const snapshot = await requests().where("status", "==", "pending").limit(50).get();
526:      typeof audioAsset.safeAudioSha256 !== "string" || !/^[a-f0-9]{64}$/.test(audioAsset.safeAudioSha256) ||
527:      typeof videoAsset.safeVideoSha256 !== "string" || !/^[a-f0-9]{64}$/.test(videoAsset.safeVideoSha256)) {
542:      Number(videoMeta.size) > 15 * 1024 * 1024) {
552:    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
559:    audioSha256: value.audioSha256, videoSha256: value.videoSha256,
584:  if (!Number.isSafeInteger(mfaAt) || mfaAt > nowMs || nowMs - mfaAt > 15 * 60 * 1000) {
608:        typeof data.audioSha256 !== "string" || typeof data.videoSha256 !== "string") {
614:        grant.audioSha256 !== data.audioSha256 || grant.videoSha256 !== data.videoSha256 ||
688:export const cleanupDecidedBiometricEvidence = onSchedule("every 15 minutes", async () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-media.ts ---
49:  if (offset + 20 > header.end) throw new Error(`BIOMETRIC_${label}_HEADER_INVALID`);
58:    timescale = buffer.readUInt32BE(offset + 20);
187:  const maxDurationMs = 20_000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-review.ts ---
4:export const BIOMETRIC_REWARD_BETACOINS = 1500;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-verification-cycle.ts ---
4:export const BIOMETRIC_VERIFICATION_REWARD_COINS = 1_500;
6:  BIOMETRIC_VERIFICATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;
33:  const cycleId = createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-verification.ts ---
58:    acceptedAtMs - mfaAtMs <= 15 * 60 * 1000 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/call-signaling.ts ---
68:        body.sdp.length < 1 || body.sdp.length > 60000) {
85:export const CALL_SIGNAL_MAX_AGE_MS = 2 * 60_000;
86:export const CALL_SIGNAL_MAX_PER_CALLER = 256;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/call-usage-policy.ts ---
10:export const GROUP_AUDIO_CALL_DURATION_MS = 5 * 60 * 1000;
11:export const GROUP_VIDEO_CALL_DURATION_MS = 3 * 60 * 1000;
27:      input.quotaWindowMs < 60000 || input.quotaWindowMs > 365 * 24 * 60 * 60 * 1000) {
32:  if (maxCallDurationMs !== null && (maxCallDurationMs < 60000 ||
33:      maxCallDurationMs > 24 * 60 * 60 * 1000)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/capacity-media-management.ts ---
4:  // Authenticated app heartbeat; a member is active while seen in the last 120 seconds.
5:  activeMemberBasis: "authenticated_app_heartbeat_120s",
25:  activeMemberBasis: "authenticated_app_heartbeat_120s";
62:    activeMemberBasis: "authenticated_app_heartbeat_120s",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/chat-media-policy.ts ---
15:  safePreviewSha256?: unknown;
18:  safeAnimationSha256?: unknown;
21:  safeAudioSha256?: unknown;
24:  safeVideoSha256?: unknown;
27:  safeDocumentSha256?: unknown;
36:  sha256: string;
49:  "image/jpeg": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
50:  "image/png": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
51:  "image/webp": { category: "image", processor: "image-raster-v1", pathField: "safePreviewPath", generationField: "safePreviewGeneration", hashField: "safePreviewSha256", contentTypes: ["image/webp"], pipelineVersion: "sharp-decode-reencode-v1" },
52:  "image/gif": { category: "gif", processor: "gif-animation-v1", pathField: "safeAnimationPath", generationField: "safeAnimationGeneration", hashField: "safeAnimationSha256", contentTypes: ["image/gif"], pipelineVersion: "gif-sanitize-preserve-animation-v1" },
53:  "audio/mpeg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
54:  "audio/mp4": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
55:  "audio/ogg": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
56:  "audio/wav": { category: "audio", processor: "audio-transcode-v1", pathField: "safeAudioPath", generationField: "safeAudioGeneration", hashField: "safeAudioSha256", contentTypes: ["audio/mpeg", "audio/ogg"], pipelineVersion: "ffmpeg-audio-purpose-limit-v2" },
57:  "video/mp4": { category: "video", processor: "video-transcode-v1", pathField: "safeVideoPath", generationField: "safeVideoGeneration", hashField: "safeVideoSha256", contentTypes: ["video/mp4"], pipelineVersion: "ffmpeg-video-transcode-v1" },
58:  "application/pdf": { category: "document", processor: "pdf-sanitize-v1", pathField: "safeDocumentPath", generationField: "safeDocumentGeneration", hashField: "safeDocumentSha256", contentTypes: ["application/pdf"], pipelineVersion: "pdf-raster-flatten-v1" },
100:  const sha256 = asset[route.hashField];
103:      typeof sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(sha256)) return null;
109:    sha256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/chat-retention-policy.ts ---
1:export const TEMPORARY_CHAT_INACTIVITY_MS = 4 * 60 * 60 * 1000;
2:export const NORMAL_CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
3:export const IMPORTANT_CHAT_TEXT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/coin-purchase-requests.ts ---
66:      data.instructions.trim().length > 2000 ||
95:      data.externalPaymentReference.trim().length > 120 ||
98:      data.verificationNote.trim().length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/contracts-workflow.ts ---
118:  return createHash("sha256").update(canonicalContractJson(value)).digest("hex");
132:  const counterpartyEmail = requiredText(input.counterpartyEmail, 5, 254, "CONTRACT_COUNTERPARTY_EMAIL_INVALID").toLowerCase();
154:  const parentContractId = optionalText(input.parentContractId, 160, "CONTRACT_PARENT_ID_INVALID");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/creator-proposals.ts ---
57:  const raw = requiredText(value, 2048, "invalid_content_url");
99:  const proposalDescription = requiredText(data.proposalDescription, 5000, "invalid_proposal_description");
100:  const proposedDuration = requiredText(data.proposedDuration, 120, "invalid_proposed_duration");
101:  const audienceDescription = optionalText(data.audienceDescription, 1200, "invalid_audience_description");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/default-store-catalog.ts ---
18:  { itemId: "vip_monthly", name: "عضوية VIP", description: "شارة وامتيازات العضوية المميزة", category: "vip", priceCoins: 5000, durationDays: 30, sortOrder: 10 },
19:  { itemId: "title_custom", name: "لقب مميز", description: "لقب مميز يظهر في الملف الشخصي", category: "title", priceCoins: 800, sortOrder: 20 },
20:  { itemId: "badge_special", name: "وسام خاص", description: "وسام إضافي في الملف الشخصي", category: "badge", priceCoins: 1200, sortOrder: 30 },
21:  { itemId: "avatar_frame_30d", name: "إطار صورة متحرك", description: "إطار متحرك للصورة الشخصية لمدة 30 يوماً", category: "frame", priceCoins: 2500, durationDays: 30, sortOrder: 40 },
22:  { itemId: "username_color_30d", name: "اسم ملون", description: "لون مميز للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 1200, durationDays: 30, sortOrder: 50 },
23:  { itemId: "username_animated_30d", name: "اسم متحرك", description: "تأثير متحرك للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 3000, durationDays: 30, sortOrder: 60 },
25:  { itemId: "profile_layout_30d", name: "تصميم ملف احترافي", description: "قالب ملف احترافي لمدة 30 يوماً", category: "profile_layout", priceCoins: 3500, durationDays: 30, sortOrder: 80 },
26:  { itemId: "profile_pin_30d", name: "قسم مثبت", description: "تثبيت قسم مميز في الملف لمدة 30 يوماً", category: "profile_layout", priceCoins: 900, durationDays: 30, sortOrder: 90 },
27:  { itemId: "discovery_boost_7d", name: "تعزيز الظهور", description: "تعزيز الظهور لمدة 7 أيام", category: "boost", priceCoins: 1500, durationDays: 7, sortOrder: 100 },
28:  { itemId: "profile_theme_30d", name: "ثيم وخلفية", description: "ثيم مميز للملف لمدة 30 يوماً", category: "theme", priceCoins: 2000, durationDays: 30, sortOrder: 110 },
29:  { itemId: "visitor_greeting_30d", name: "رسالة ترحيب للزوار", description: "رسالة ترحيب تظهر للزوار لمدة 30 يوماً", category: "greeting", priceCoins: 1000, durationDays: 30, sortOrder: 120 },
30:  { itemId: "voice_call_24h", name: "المكالمات الصوتية — 24 ساعة", description: "استحقاق المكالمات الصوتية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 100, durationDays: 1, sortOrder: 150 },
31:  { itemId: "voice_call_7d", name: "المكالمات الصوتية — أسبوع", description: "استحقاق المكالمات الصوتية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 500, durationDays: 7, sortOrder: 151 },
32:  { itemId: "voice_call_30d", name: "المكالمات الصوتية — شهر", description: "استحقاق المكالمات الصوتية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 1500, durationDays: 30, sortOrder: 152 },
33:  { itemId: "video_call_24h", name: "المكالمات المرئية — 24 ساعة", description: "استحقاق المكالمات المرئية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 250, durationDays: 1, sortOrder: 160 },
34:  { itemId: "video_call_7d", name: "المكالمات المرئية — أسبوع", description: "استحقاق المكالمات المرئية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 1250, durationDays: 7, sortOrder: 161 },
35:  { itemId: "video_call_30d", name: "المكالمات المرئية — شهر", description: "استحقاق المكالمات المرئية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 3750, durationDays: 30, sortOrder: 162 },
38:  { itemId: "media_saver_7d", name: "Mawdda Media Saver — أسبوع", description: "حفظ الوسائط المدعومة محلياً لمدة أسبوع؛ لا يمدد الاحتفاظ على الخادم", category: "media_saver", priceCoins: 200, durationDays: 7, sortOrder: 170 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/direct-chat-id.ts ---
10:  return createHash("sha256").update(first + ":" + second).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/economy-pricing.ts ---
64:  { packageId: "coins_500", name: "500 كوين", coins: 500, priceMinor: 199, currency: "USD", currencyExponent: 2, active: true },
65:  { packageId: "coins_1200", name: "1,200 كوين", coins: 1200, priceMinor: 399, currency: "USD", currencyExponent: 2, active: true },
68:  { packageId: "coins_15000", name: "15,000 كوين", coins: 15000, priceMinor: 3499, currency: "USD", currencyExponent: 2, active: true },
71:  { placementId: "feed_cpm", name: "إعلان ضمن الخلاصة لكل ألف ظهور", billingModel: "cpm", priceMinor: 500, currency: "USD", currencyExponent: 2, active: true },
72:  { placementId: "feed_cpc", name: "إعلان ضمن الخلاصة لكل نقرة", billingModel: "cpc", priceMinor: 25, currency: "USD", currencyExponent: 2, active: true },
73:  { placementId: "featured_daily", name: "إعلان مميز يومي", billingModel: "daily", priceMinor: 1500, currency: "USD", currencyExponent: 2, active: true },
121: * safe, even integer so the server can split it exactly 50/50.
154:  return { enabled: false, rewardCoins: 0, cycleDays: 90 };
167:      (data.cycleDays as number) > 3650 ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/email-verification-cycle.ts ---
5:export const EMAIL_VERIFICATION_REWARD_COINS = 500;
35:  const cycleId = createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/engagement-rewards.ts ---
38:const MAX_AD_DURATION_SECONDS = 15 * 60;
40:const AD_HEARTBEAT_MAX_GAP_MS = 15_000;
91:  // ISO-8601 week number and week-year, calculated in UTC.
98:  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
134:      sponsorLabel.length < 2 || sponsorLabel.length > 60 ||
135:      body.length < 10 || body.length > 1200 ||
153:      durationSeconds < 15 || durationSeconds > MAX_AD_DURATION_SECONDS ||
217:  return createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-ad-finance.ts ---
62:  const note = requiredText(input.note, 5, 1500, "invalid_financial_note");
63:  const externalReference = requiredText(input.externalReference, 3, 160, "invalid_external_reference");
65:    ? null : requiredText(input.evidenceReference, 3, 500, "invalid_evidence_reference");
178:      typeof externalReference !== "string" || externalReference.length < 3 || externalReference.length > 160) {
182:  return createHash("sha256").update(campaignId + ":" + action + ":" + externalReference).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-ad-rewards.ts ---
8:  sameCampaignWindowMs: 24 * 60 * 60 * 1000,
9:  videoCompletionPercent: 90,
55:      !integerInRange(input.sameCampaignWindowMs, 1, 31 * 24 * 60 * 60 * 1000) ||
57:      !integerInRange(input.imageContinuousVisibleMs, 1_000, 60 * 60 * 1000) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/group-call-economy.ts ---
104:  if (!Number.isSafeInteger(maxDurationMs) || maxDurationMs < 1 || maxDurationMs > 24 * 60 * 60 * 1000) {
108:  const maxBillableMinutes = Math.ceil(maxDurationMs / 60000);
135:  const maxBillableMinutes = Math.ceil(maxDurationMs / 60000);
136:  const billableMinutes = Math.max(1, Math.min(maxBillableMinutes, Math.ceil(elapsedMs / 60000)));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/guest-sessions.ts ---
6:const GUEST_DURATION_MS = 60 * 60 * 1000;
7:const GUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;
43:    .limit(200);
73:    if (memberships.size < 200) break;
131:  if (country.length < 2 || country.length > 60 ||
141:/** Creates a minimal guest profile and starts the server-timed 60m/24h allowance. */
252:  // only the first 200 active rooms can hide eligible public rooms behind
282:    .limit(200)
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/index.ts ---
52:import { enforceChatMediaRetention, enforceStickerMediaRetention, enforceChatTextRetention, enforceMediaOperationalAuditRetention, removeLateExpiredChatMediaDerivative } from "./retention";
241:      .collection("pushTokens").where("active", "==", true).limit(500).get();
249:      webpush: { headers: { TTL: "60" } },
513:    // Basis points: 2,000 = 20%. Exact integer arithmetic avoids floating-point drift.
614: * 2,000 = 20%. لا يُسمح للعميل العادي بتغيير إعدادات العمولة.
845: * The profile, unique username reservation, 500-coin email reward and
1008:      rewardAmount: 500,
1035:      "الحد الأدنى للعمر يجب أن يكون عدداً صحيحاً بين 16 و120.",
1138:    const visitorHash = createHash("sha256").update(viewerUid).digest("hex");
1163:    const sinceDay = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
1180:    ? memberData.profileVisitorGreeting.trim().slice(0, 160)
1295:  if (greeting.length < 3 || greeting.length > 160 ||
1297:    throw new HttpsError("invalid-argument", "رسالة الترحيب يجب أن تكون نصاً عادياً من 3 إلى 160 حرفاً دون روابط أو بريد.");
1321:      greetingHash: createHash("sha256").update(greeting).digest("hex"),
1372:  if (!Number.isSafeInteger(viewerAge) || viewerAge < 16 || viewerAge > 120) {
1380:    .limit(150)
1410:    members: members.slice(0, 50).map((member) => ({
1444:  const newExpiry = Timestamp.fromMillis(nowMs + 30 * 24 * 60 * 60 * 1000);
1456:    const assetExpiry = asset.retentionExpiresAt;
1480:        const existingExpiry = previous.retentionExpiresAt instanceof Timestamp
1481:          ? previous.retentionExpiresAt.toMillis()
1486:          retentionExpiresAt: Timestamp.fromMillis(Math.min(existingExpiry, newExpiry.toMillis())),
1487:          retentionPolicyStatus: previous.legalHoldStatus === "active" ? "legal_hold" : supersededPolicy,
1499:      retentionExpiresAt: newExpiry,
1500:      retentionPolicyStatus: asset.legalHoldStatus === "active" ? "legal_hold" : "thirty_day_avatar_cover",
1522:    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
1552:          const currentExpiry = asset.retentionExpiresAt instanceof Timestamp
1553:            ? asset.retentionExpiresAt.toMillis()
1555:          const supersededExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
1558:            retentionExpiresAt: Timestamp.fromMillis(Math.min(currentExpiry, supersededExpiry)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/mawdda-media-plane.ts ---
28:    if (hostname.length > 253 || labels.some((label) =>
83:  if (typeof value !== "string" || value.length > 2048 ||
93:    if (hostname.length > 253 || labels.some((label) =>
129:      !/^[A-Za-z0-9_./-]{3,200}$/.test(input.turnCredentialSecretRef) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-cleanup.ts ---
1:export const MEDIA_UPLOAD_CLEANUP_GRACE_MS = 30 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-controls.ts ---
37:  ttlMs = 5 * 60 * 1000,
47:  sha256: string;
55:  sha256: string;
66:      verdict.sha256 !== expected.sha256 ||
67:      !/^[a-f0-9]{64}$/.test(verdict.sha256) ||
70:      Math.abs(expected.nowMs - verdict.scannedAtMs) > 10 * 60 * 1000) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-derivative-contract.ts ---
27:    maxBytes: 15 * 1024 * 1024,
33:    maxBytes: 20 * 1024 * 1024,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-legal-hold.ts ---
30:  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MEDIA_HOLD_AUTHORITY");
32:  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MEDIA_HOLD_REFERENCE");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-quota.ts ---
3:  maxActiveBytes: 150 * 1024 * 1024,
4:  maxDailyBytes: 500 * 1024 * 1024,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-scanner.ts ---
8:  sha256: string;
23:  sha256: string;
31:  safePreviewSha256?: string;
44:  const expected = createHmac("sha256", secret).update(rawBody).digest();
57:    v.safePreviewPath, v.safePreviewGeneration, v.safePreviewSha256, v.safePreviewContentType,
110:        typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256) ||
117:         (durationMs as number) > 20_000 ||
119:         (frameCount as number) > 50)) return null;
122:         (durationMs as number) > (category === "video" ? 90_000 :
123:           (v.purpose === "biometric" ? 20_000 : 60_000)))) return null;
129:      sha256: d.sha256 as string, contentType: d.contentType as ScannerSafeDerivative["contentType"],
141:      typeof v.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.sha256) ||
143:      Math.abs(nowMs - Number(v.scannedAtMs)) > 10 * 60 * 1000 ||
149:      Number(v.signatureDatabaseAgeMs) > 36 * 60 * 60 * 1000 ||
154:        typeof v.safePreviewSha256 !== "string" || !/^[a-f0-9]{64}$/.test(v.safePreviewSha256) ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-security.ts ---
6:// approved purpose-specific retention deadline and the retention worker enforces it.
10:  upload: 5 * 60 * 1000,
11:  "owner-inspection": 60 * 1000,
36:  "video/mp4": { category: "video", maxBytes: 25 * 1024 * 1024 },
41:  "application/pdf": { category: "document", maxBytes: 20 * 1024 * 1024 },
132:      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media.ts ---
77:    // Even a retention tombstone may have a late derivative or a replayed
106:      retentionExpiresAt: Timestamp.now(),
181:        if (!["mediaId", "ownerUid", "uploaderType", "mediaPurpose", "createdAt", "retentionExpiresAt", "deletedObjectPaths"].includes(key)) {
189:      tombstone.retentionPolicyStatus = "manual_delete_for_everyone_completed";
191:      tombstone.retentionReconcileAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000);
203:        expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
216:      expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
243:    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
276:async function sha256Object(file: ReturnType<ReturnType<typeof mediaBucket>["file"]>): Promise<string> {
278:    const hash = createHash("sha256");
329:    response.status(503).send("Scanner reported an incomplete scan; retry required");
349:      asset.scannerSha256 === verdict.sha256;
373:      response.status(200).json({ mediaId: verdict.mediaId, status: asset.status, idempotentReplay: true });
393:  const actualHash = await sha256Object(file);
394:  if (actualHash !== verdict.sha256) {
400:    path: string; generation: string; sha256: string; contentType: "image/webp"; sizeBytes: number;
423:        customMetadata?.sourceSha256 !== verdict.sha256 ||
430:    const previewMaxBytes = asset.mediaPurpose === "sticker" ? 256 * 1024 : 2 * 1024 * 1024;
436:    const previewHash = await sha256Object(previewFile);
437:    if (previewHash !== verdict.safePreviewSha256) {
444:      sha256: previewHash,
451:    path: string; generation: string; sha256: string;
485:        custom?.sourceSha256 !== verdict.sha256 ||
491:    const derivativeHash = await sha256Object(derivativeFile);
492:    if (derivativeHash !== derivative.sha256) {
518:      scannerSha256: actualHash,
525:        safePreviewSha256: safePreview.sha256,
535:          safeAnimationSha256: safeNonImageDerivative.sha256,
542:          safeAudioSha256: safeNonImageDerivative.sha256,
549:          safeVideoSha256: safeNonImageDerivative.sha256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-message-pagination.ts ---
20:        typeof parsed[1] !== "string" || parsed[1].length < 1 || parsed[1].length > 150) {
31:      typeof messageId !== "string" || messageId.length < 1 || messageId.length > 150) {
39:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
41:      requestedLimit < 1 || requestedLimit > 50) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile-update.ts ---
61:        update.bio = text(input[key], key, 0, 500, true);
64:        const interests = list(input[key], key, 20, 40);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile-view.ts ---
33:    ? data.interests.filter((value): value is string => typeof value === "string").slice(0, 20)
43:    bio: safeText(data.bio).slice(0, 500),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile.ts ---
36:  const username = requiredText(value, "username", 3, 20).toLowerCase();
47:  if (!Number.isSafeInteger(minimumAge) || (minimumAge as number) < 16 || (minimumAge as number) > 120) {
51:  if (typeof age !== "number" || !Number.isSafeInteger(age) || age < minimumAge! || age > 120) {
62:  const interests = stringList(data.interests ?? [], "interests", 20, 40);
80:  if (typeof bio !== "string" || bio.trim().length > 500) {
81:    throw new Error("bio: الحد الأقصى 500 حرف.");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-social-links.ts ---
50:    if (typeof raw !== "string" || raw.length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/message-legal-hold.ts ---
36:  if (!boundedText(authority, 3, 120)) throw new Error("INVALID_MESSAGE_HOLD_AUTHORITY");
38:  if (!boundedText(reference, 3, 200)) throw new Error("INVALID_MESSAGE_HOLD_REFERENCE");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-access.ts ---
1:const OWNER_SESSION_MAX_AGE_SECONDS = 15 * 60;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-audit-chain.ts ---
24:/** SHA-256 over a stable canonical event representation and its chain position. */
39:  return createHash("sha256").update(canonical, "utf8").digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-audit-export.ts ---
15:  const pageSize = input.pageSize === undefined ? 50 : input.pageSize;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-chat-review.ts ---
18:  if (typeof value !== "string" || value.length < 1 || value.length > 256 ||
35:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
42:  if (rawReason.length > 500) {
49:    requestedLimit > 50
84:      typeof messageId !== "string" || messageId.length < 1 || messageId.length > 150) {
102:        typeof value[1] !== "string" || value[1].length < 1 || value[1].length > 150) {
116:  const requestedLimit = input.limit === undefined ? 50 : input.limit;
121:      requestedLimit < 1 || requestedLimit > 50) {
147:  if (noticeText.length < 5 || noticeText.length > 500) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-live-stream.ts ---
35:      data.url.length < 10 || data.url.length > 2048 ||
36:      /[\u0000-\u0020\u007f\\<>"'{}|^]/.test(data.url)) {
41:  if (title.length > 120 || description.length > 500) throw new Error("INVALID_LIVE_STREAM_TEXT");
54:      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(hostname)) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/platform-economic-policy.ts ---
23:      documentReadsPerDay: 50_000,
24:      documentWritesPerDay: 20_000,
31:      downloadsPerMonth: 50_000,
36:      cpuSecondsPerMonth: 200_000,
41:      transferMiBPerDay: 360,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/privacy-acknowledgement.ts ---
1:export const PRIVACY_POLICY_VERSION = "2026-11-14.1";
2:export const PRIVACY_POLICY_SHA256 =
3:  "3af7c404337db26a806031864f979f54e15a74495818fb24e0eff58a1a267c93";
4:export const PRIVACY_POLICY_HASH = PRIVACY_POLICY_SHA256;
21:  if (input.policyHash !== PRIVACY_POLICY_SHA256) {
38:    policyHash: PRIVACY_POLICY_SHA256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/production-applications.ts ---
43:  const raw = required(value, 10, 2048, code);
78:  const interviewAnswers = required(data.interviewAnswers, 20, 5000, "invalid_interview_answers");
88:    applicantName: required(data.applicantName, 2, 120, "invalid_applicant_name"),
91:    experience: required(data.experience, 20, 4000, "invalid_experience"),
92:    tools: required(data.tools, 5, 1500, "invalid_tools"),
94:    collaboratingCompanies: optional(data.collaboratingCompanies, 1500, "invalid_companies"),
95:    achievements: optional(data.achievements, 2000, "invalid_achievements"),
98:    roleDescription: required(data.roleDescription, 20, 2000, "invalid_role_description"),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/registration-policy.ts ---
21:    minimumAge > 120
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/retention.ts ---
8:import { resolveChatRetentionMode, isChatTextDeletionDue, chatTextRetentionMs, type ChatRetentionMode } from "./chat-retention-policy";
10:export const CHAT_MEDIA_RETENTION_MS = 4 * 60 * 60 * 1000;
11:export const STICKER_MEDIA_RETENTION_MS = 60 * 60 * 1000;
12:export const CHAT_TEXT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
13:const RETENTION_BATCH_SIZE = 150;
15:const retentionJobsEnabled = defineString("MAWDA_RETENTION_JOBS_ENABLED", { default: "false" });
16:const retentionProductionProjectId = defineString("MAWDA_RETENTION_PRODUCTION_PROJECT_ID", { default: "" });
23:export function retentionDeadline(createdAtMs: number, lifetimeMs: number): number {
33:  return retentionDeadline(createdAtMs, lifetimeMs) <= nowMs;
44:  return projectId !== "mawda-app-2026" &&
48:/** Production retention requires both the explicit enable switch and an exact project-ID allowlist match. */
61:  const enabled = retentionJobsEnabled.value() === "true";
62:  const productionProjectId = retentionProductionProjectId.value();
77: * retention locks and backup policies are infrastructure controls and must be
105:const MEDIA_DERIVATIVE_RECHECK_MS = 5 * 60 * 1000;
121:    const lifetimeMs = purpose === "profile_album" ? 7 * 24 * 60 * 60 * 1000
139:      .where("retentionReconcileAt", "<=", now)
140:      .orderBy("retentionReconcileAt", "asc")
156:          retentionReconcileAt: Timestamp.fromMillis(Date.now() + MEDIA_DERIVATIVE_RECHECK_MS),
172:        .where("retentionExpiresAt", "<=", dueAt)
173:        .orderBy("retentionExpiresAt", "asc")
181:          .where("retentionExpiresAt", "==", null)
194:        // The original retention deadline is preserved and resumes on release/expiry.
211:              const expiry = fresh.retentionExpiresAt;
244:            const expiry = fresh.retentionExpiresAt;
272:          const packs = await db.collection("stickerPacks").limit(500).get();
319:          const packs = await db.collection("stickerPacks").limit(500).get();
394:            if (!["ownerUid", "uploaderType", "mediaPurpose", "createdAt", "retentionExpiresAt"].includes(key)) {
401:          tombstone.retentionPolicyStatus = manualDeleteRetry
403:          tombstone.retentionExpiresAt = asset.retentionExpiresAt ??
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-events.ts ---
33:  const durationMinutes = input.durationMinutes ?? 60;
37:  if (title.length < 3 || title.length > 80 || description.length > 500) {
44:      (startsAtMs as number) < nowMs + 5 * 60 * 1000 ||
45:      (startsAtMs as number) > nowMs + 90 * 24 * 60 * 60 * 1000) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-policy.ts ---
11:  if (!Number.isSafeInteger(age) || age < 16 || age > 120) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-rental.ts ---
16:  { planId: "room_90d", name: "استئجار غرفة 90 يوماً", durationDays: 90, priceCoins: 2700, active: true },
17:  { planId: "room_180d", name: "استئجار غرفة 180 يوماً", durationDays: 180, priceCoins: 5000, active: true },
18:  { planId: "room_365d", name: "استئجار غرفة 365 يوماً", durationDays: 365, priceCoins: 9000, active: true },
36:        (plan.durationDays as number) > 3650 ||
52:      !Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
55:  const expiryMs = nowMs + durationDays * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/safety-cases.ts ---
45:  if (contextId !== null && (!contextId || contextId.length > 160)) {
50:  if (description.length < 10 || description.length > 2000) {
78:  if (!/^[A-Za-z0-9_-]{8,160}$/.test(caseId)) throw new Error("INVALID_SAFETY_CASE_ID");
79:  if (reason.length < 20 || reason.length > 2000) throw new Error("INVALID_SAFETY_APPEAL_REASON");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/sticker-policy.ts ---
7:  staticMaxBytes: 256 * 1024,
10:  animatedMaxFrames: 50,
11:  maxPackStickers: 120,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-catalog.ts ---
58:  if (typeof data.description !== "string" || data.description.length > 500) return null;
74:       (durationDays < 1 || durationDays > 3650))) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-gifting.ts ---
75:      (!Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > 3650)) {
88:    return nowMs + durationDays * 24 * 60 * 60 * 1000;
90:  return Math.max(nowMs, existingExpiryMs ?? 0) + durationDays * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/verification-calendar.ts ---
28:export const BIOMETRIC_VERIFICATION_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-governance.test.js ---
33:    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200 };
44:    permission: "advertising.campaign.publish", resourceScope: "campaign:x", nowMs: 200,
51:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
55:    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false };
58:  assert.equal(canSignUnderDelegation({ ...args, commitmentMinor: 60000, ownerCoSignaturePresent: true }), false);
60:  assert.equal(canSignUnderDelegation({ ...args, nowMs: 500, ownerCoSignaturePresent: true }), false);
128:    permission: "advertising.requests.view_assigned", resourceScope: "campaign:campaign_123", nowMs: 200,
132:  assert.equal(hasAdvertisingPermission({ ...base, grants: [{ ...grant, startsAtMs: 201 }] }), false);
214:    nowMs: 200,
288:    maxCommitmentMinor: 50000, currency: "EUR", startsAtMs: 100, endsAtMs: 500,
293:    commitmentMinor: 30000, currency: "EUR", nowMs: 200, ownerCoSignaturePresent: false,
297:  assert.equal(canSignUnderDelegation({ ...base, delegation: { ...valid, maxCommitmentMinor: "50000" } }), false);
313:    nowMs: 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-intake.test.js ---
20:  proposedBudgetAmount: "125.00",
29:    ...validDirectAdvertiserBudget, currency: "JOD", proposedBudgetAmount: "125.000",
32:    ...validDirectAdvertiserBudget, currency: "KWD", proposedBudgetAmount: "125.0001",
38:    ...validDirectAdvertiserBudget, proposedBudgetAmount: "125.001",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js ---
35:test("requires a locked 24-month retention policy and hardened bucket access", () => {
37:    retentionPolicy: { isLocked: true, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
43:    retentionPeriodSeconds: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
48:    retentionPolicy: { isLocked: false, retentionPeriod: OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS },
74:  assert.equal(archive.sha256.length, 64);
86:  assert.match(objectName, /^collections\/verificationAuditLogs\/\d{4}\/\d{2}\/\d{2}\/batch-[a-f0-9]{20}\.jsonl$/);
94:  assert.equal(archive.sha256.length, 64);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-evidence.test.js ---
11:  assert.equal(BIOMETRIC_SPOKEN_PHRASE_VERSION, "owner-approved-2026-11-20-v1");
15:  assert.equal(BIOMETRIC_VIDEO_MAX_BYTES, 25 * 1024 * 1024);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-media.test.js ---
15:  const payload = Buffer.alloc(20);
24:  payload.writeUInt32BE(timescale, 20);
46:  assert.equal(readMp4DurationMs(headerV0("mvhd", 1000, 5000)), 5000);
47:  assert.equal(readMp4DurationMs(headerV1("mvhd", 600, 2400)), 4000);
51:  for (const duration of [3000, 3500, 5000]) assert.doesNotThrow(() => assertBiometricVideoDurationAllowed(duration));
52:  for (const duration of [0, 2999, 2999.9, 5000.1, 5001, Number.NaN, Number.POSITIVE_INFINITY]) {
67:  const forgedMovieDuration = movie(4000, [track("vide", 6000)]);
74:  const unsupported = Buffer.alloc(20);
82:  const audio = movie(20000, [track("soun", 20000)]);
83:  const overlong = movie(20001, [track("soun", 20001)]);
86:  assert.equal(assertBiometricAudioFileAllowed(audio), 20000);
92:test("enforces the owner-approved 20-second biometric audio ceiling from movie and track bytes", () => {
93:  const maxAllowed = movie(20000, [track("soun", 20000)]);
94:  const overLimitMovie = movie(20001, [track("soun", 20000)]);
95:  const overLimitTrack = movie(20000, [track("soun", 20001)]);
97:  assert.equal(assertBiometricAudioFileAllowed(maxAllowed), 20000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-review-state.test.js ---
3:const owner="super_owner_uid_0001",member="member_uid_00001";const id=n=>"request_identifier_"+n;const month=(y,m,d=15)=>Date.UTC(y,m,d,10);
4:test("first rejection opens attempt two after one calendar month",()=>{const a=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,15)});const r=decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,31)});assert.equal(r.nextEligibleAtMs,month(2026,1,28));assert.throws(()=>startBiometricRetry({state:r,nextRequestId:id(2),submittedAtMs:r.nextEligibleAtMs-1}),/NOT_ELIGIBLE/);assert.equal(startBiometricRetry({state:r,nextRequestId:id(2),submittedAtMs:r.nextEligibleAtMs}).attemptNumber,2);});
5:test("second rejection allows one final attempt after another calendar month",()=>{const a=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});const r1=decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,31)});const b=startBiometricRetry({state:r1,nextRequestId:id(2),submittedAtMs:r1.nextEligibleAtMs});const r2=decideBiometricReview({state:b,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,1,28)});assert.equal(r2.nextEligibleAtMs,month(2026,2,28));assert.equal(startBiometricRetry({state:r2,nextRequestId:id(3),submittedAtMs:r2.nextEligibleAtMs}).attemptNumber,3);});
6:test("third rejection permanently closes sequence with no fourth attempt",()=>{let s=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});for(let n=1;n<=3;n++){if(n>1)s=startBiometricRetry({state:s,nextRequestId:id(n),submittedAtMs:s.nextEligibleAtMs});s=decideBiometricReview({state:s,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,n-1,15)});}assert.equal(s.status,"closed");assert.equal(s.finalRejection,true);assert.equal(s.nextEligibleAtMs,null);assert.throws(()=>startBiometricRetry({state:s,nextRequestId:id(4),submittedAtMs:month(2026,3,15)}),/NOT_ELIGIBLE/);});
7:test("acceptance is terminal and member cannot review own request",()=>{const s=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});const a=decideBiometricReview({state:s,decision:"accepted",reviewerUid:owner,decidedAtMs:month(2026,0,2)});assert.equal(a.status,"accepted");assert.throws(()=>decideBiometricReview({state:a,decision:"rejected",reviewerUid:owner,decidedAtMs:month(2026,0,3)}));assert.throws(()=>decideBiometricReview({state:s,decision:"accepted",reviewerUid:member,decidedAtMs:month(2026,0,2)}));});
10: const rejected=createInitialBiometricReview({requestId:id(1),uid:member,submittedAtMs:month(2026,0,1)});
11: const forged={...rejected,status:"rejected",attemptNumber:3,decidedAtMs:month(2026,0,2),decidedByUid:owner,nextEligibleAtMs:month(2026,1,2),finalRejection:false};
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-review.test.js ---
17:  const jan31 = new Date("2026-01-31T12:00:00Z").getTime();
18:  assert.equal(new Date(addBiometricRenewalMonth(jan31)).toISOString(), "2026-02-28T12:00:00.000Z");
19:  const feb28 = new Date("2026-02-28T12:00:00Z").getTime();
20:  assert.equal(new Date(addBiometricRenewalMonth(feb28)).toISOString(), "2026-03-28T12:00:00.000Z");
32:  const jan31Leap = Date.parse("2024-01-31T23:30:00.000Z");
33:  assert.equal(new Date(addBiometricRenewalMonth(jan31Leap)).toISOString(), "2024-02-29T23:30:00.000Z");
34:  const mar31 = Date.parse("2026-03-31T00:15:00.000Z");
35:  assert.equal(new Date(addBiometricRenewalMonth(mar31)).toISOString(), "2026-04-30T00:15:00.000Z");
42:  const locked = { ...pending(3), status: "locked", lockoutUntilMs: 200 };
44:  assert.equal(nextBiometricAttemptNumber(locked, 200), 1);
51:    nextRenewalAtMs: "2099-01-01",
54:    status: "locked", attemptNumber: 3, rewardGranted: false, lockoutUntilMs: "2099-01-01",
69:    state: pending(1), decision: "accept", actorIsSuperOwner: true, nowMs: Date.parse("2026-01-31T12:00:00Z"),
78:  const lockoutStart = Date.parse("2026-01-31T12:00:00Z");
81:  assert.equal(new Date(third.lockoutUntilMs).toISOString(), "2026-04-30T12:00:00.000Z");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-verification-cycle.test.js ---
36:test("ledger identity is cycle-specific and reward is exactly 1500 coins", () => {
43:  assert.equal(BIOMETRIC_VERIFICATION_REWARD_COINS, 1500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-verification.test.js ---
17:  expiresAt: { toMillis: () => NOW + 60_000 },
27:  assert.equal(hasActiveBiometricVerification({ status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } }, "member_uid_0001", NOW), false);
51:    { ...base, reviewerMfaAt: { toMillis: () => NOW - 20 * 60 * 1000 } },
52:    { ...base, expiresAt: { toMillis: () => NOW - 20_000 } },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-entitlements.test.js ---
13:  policyId: "call-test-2026", version: 1, active: true,
38:    priceCoins: 2500, durationDays: 30, status: "completed",
40:    expiresAt: { toMillis: () => 1802592000000 },
45:  assert.equal(projected.priceCoins, 2500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling.test.js ---
49:  assert.equal(CALL_SIGNAL_MAX_AGE_MS, 120_000);
50:  assert.equal(CALL_SIGNAL_MAX_PER_CALLER, 256);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js ---
43:    ...policy, maxCallDurationMs: 60000,
52:    ...policy, maxCallDurationMs: 60000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/capacity-media-management.test.js ---
11:  assert.equal(CAPACITY_MEDIA_DEFAULTS.activeMemberBasis, "authenticated_app_heartbeat_120s");
56:  assert.equal(policy.activeMemberBasis, "authenticated_app_heartbeat_120s");
64:    monthUtc: "2026-11",
69:    monthlyDownloadBytes: 20_000,
75:    monthUtc: "2026-11",
80:    monthlyDownloadBytes: 20_000,
89:    monthUtc: "2026-11",
110:    monthUtc: "2026-11",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js ---
15:  safePreviewGeneration: "12", safePreviewSha256: hash,
51:    safeDocumentGeneration: "3", safeDocumentSha256: hash,
75:  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewSha256: "bad" }, false), null);
88:      generation: "safeAnimationGeneration", hash: "safeAnimationSha256",
94:      generation: "safeAudioGeneration", hash: "safeAudioSha256",
100:      generation: "safeVideoGeneration", hash: "safeVideoSha256",
106:      generation: "safeDocumentGeneration", hash: "safeDocumentSha256",
153:    safeAudioSha256: "a".repeat(64),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js ---
14:} = require("../lib/chat-retention-policy");
24:test("normal and important text retention have exact seven and thirty day boundaries", () => {
28:  assert.equal(chatTextExpiryAtMs(createdAt, "normal"), createdAt + 7 * 24 * 60 * 60 * 1000);
29:  assert.equal(chatTextExpiryAtMs(createdAt, "important"), createdAt + 30 * 24 * 60 * 60 * 1000);
52:test("retention notices disclose each exact policy", () => {
58:test("retention policy rejects invalid clocks", () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/coin-math.test.js ---
5:test("20% commission on 1,000 coins credits 800 and records 200", () => {
6:  assert.deepEqual(calculateTransferBreakdown(1000, 2000), {
7:    grossAmount: 1000, commissionBps: 2000, commissionAmount: 200, netAmount: 800,
18:  assert.deepEqual(calculateTransferBreakdown(3, 2000), {
19:    grossAmount: 3, commissionBps: 2000, commissionAmount: 0, netAmount: 3,
25:  const result = calculateTransferBreakdown(amount, 2000);
26:  assert.equal(result.commissionAmount, Number((BigInt(amount) * 2000n) / 10000n));
31:  assert.throws(() => calculateTransferBreakdown(0, 2000));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/coin-purchase-requests.test.js ---
16:    requestId: "request_456", kind: "custom", requestedCoins: 7500,
17:  }), { requestId: "request_456", kind: "custom", requestedCoins: 7500 });
19:    requestId: "request_456", kind: "custom", requestedCoins: 7500, priceMinor: 1,
38:    requestId: "request_125", instructions: "Owner selected Syrian pound terms",
107:    requestId: "gift_request_3", kind: "custom", requestedCoins: 500,
120:  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, coins: 2000 }, agreed), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/contracts-workflow.test.js ---
22:  commitmentMinor: 25000,
25:  endsAtMs: 2000,
38:  assert.equal(draft.commitmentMinor, 25000);
107:    signedAtMs: 5000,
156:    signedAtMs: 200,
189:    signedAtMs: 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/creator-proposals.test.js ---
39:    proposedBudgetAmount: "125.00",
43:  assert.equal(result.proposedBudgetAmount, "125.00");
54:    proposedBudgetAmount: "125.000",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/direct-chat-id.test.js ---
5:test("direct chat ID is symmetric and a fixed-length lowercase SHA-256 digest", () => {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/direct-message-receipts.test.js ---
27:  assert.equal(isMessageReadByPeer("100", 200), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-pricing.test.js ---
13:  billingModel: "cpm", priceMinor: 200, currency: "EUR", active: true,
17:  assert.equal(isValidPositiveCurrencyAmount("125.00", "EUR"), true);
18:  assert.equal(isValidPositiveCurrencyAmount("125.000", "JOD"), true);
19:  assert.equal(isValidPositiveCurrencyAmount("125", "JPY"), true);
20:  assert.equal(isValidPositiveCurrencyAmount("125.001", "EUR"), false);
21:  assert.equal(isValidPositiveCurrencyAmount("125.0", "JPY"), false);
22:  assert.equal(isValidPositiveCurrencyAmount("125.0001", "JOD"), false);
23:  assert.equal(isValidPositiveCurrencyAmount("125.00", "XXX"), false);
37:  assert.equal(validateAdPrices([adPriceFixture])[0].priceMinor, 200);
67:    audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200,
68:  }), { audioTotalCoinsPerMinute: null, videoTotalCoinsPerMinute: 200 });
70:    audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000,
71:  }), { audioTotalCoinsPerMinute: 500, videoTotalCoinsPerMinute: 2000 });
75:  for (const invalid of [1, 3, 0, -2, 2.5, NaN, Infinity, "200", undefined]) {
84:    audioTotalCoinsPerMinute: 200, videoTotalCoinsPerMinute: null,
94:    enabled: false, rewardCoins: 0, cycleDays: 90,
97:    enabled: true, rewardCoins: 750, cycleDays: 45,
98:  }), { enabled: true, rewardCoins: 750, cycleDays: 45 });
100:    { enabled: true, rewardCoins: 0, cycleDays: 90 },
101:    { enabled: false, rewardCoins: -1, cycleDays: 90 },
104:    { enabled: "yes", rewardCoins: 100, cycleDays: 90 },
153:    assert.equal(isValidPositiveCurrencyAmount("125", code), true);
154:    assert.equal(isValidPositiveCurrencyAmount("125.0", code), false);
158:    assert.equal(isValidPositiveCurrencyAmount("125.00", code), true);
159:    assert.equal(isValidPositiveCurrencyAmount("125.001", code), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/email-verification-cycle.test.js ---
12:const NOW = Date.UTC(2026, 0, 31, 12, 0, 0);
20:  assert.equal(first.expiresAtMs, Date.UTC(2026, 3, 30, 12, 0, 0));
35:  assert.equal(isEmailVerificationCycleDue(NOW, Date.UTC(2026, 3, 30, 11, 59, 59, 999)), false);
36:  assert.equal(isEmailVerificationCycleDue(NOW, Date.UTC(2026, 3, 30, 12, 0, 0)), true);
58:  assert.equal(EMAIL_VERIFICATION_REWARD_COINS, 500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/engagement-rewards.test.js ---
21:    weekly: { enabled: true, amountCoins: 25 },
22:  }).weekly, { enabled: true, amountCoins: 25 });
36:  const instant = Date.UTC(2026, 0, 1, 0, 5);
37:  assert.equal(utcRewardPeriod("hourly", instant), "20260101T00");
38:  assert.equal(utcRewardPeriod("daily", instant), "20260101");
39:  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 1, 12)), "2020-W53");
40:  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 4, 12)), "2021-W01");
42:  assert.equal(utcRewardPeriod("daily", instant), "20260101");
87:  assert.deepEqual(eligibleHeartbeatDelta(null, 5000, 1, 1, true, true), {
88:    deltaMs: 0, nextHeartbeatAtMs: 5000, nextSequence: 2, paused: false,
90:  assert.deepEqual(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, true), {
91:    deltaMs: 5000, nextHeartbeatAtMs: 6000, nextSequence: 2, paused: false,
93:  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, false, true).deltaMs, 0);
94:  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, false).nextHeartbeatAtMs, null);
96:  assert.throws(() => eligibleHeartbeatDelta(1000, 6000, 2, 1, true, true), /SEQUENCE/);
97:  assert.throws(() => eligibleHeartbeatDelta(6000, 6000, 1, 1, true, true), /TIME/);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/feature-coverage-matrix.test.js ---
41:  assert.ok(guest.plannedCases.includes("60-minute-live-expiry-clock-integration"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-ad-finance.test.js ---
14:  externalReference: "bank-ref-2026-001",
20:    ...base, action: "payment_received", amountMinor: 12500, currency: "USD",
21:  }).amountMinor, 12500);
23:    ...base, action: "refund_recorded", amountMinor: 2500, currency: "USD",
54:    amountMinor: 2000, currency: "USD",
57:  assert.equal(partiallyRefunded.refundedMinor, 2000);
84:  const initial = { currency: "USD", receivedMinor: 5000, refundedMinor: 0, reconciledMinor: 5000,
94:  const first = featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001");
95:  assert.equal(first, featuredAdFinancialIdempotencyId("featured_campaign_01", "payment_received", "bank-ref-2026-001"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-ad-rewards.test.js ---
19:  maxRewardCoinsPerUtcDay: 20,
78:  assert.equal(decideFeaturedAdReward(policy, { ...base, videoCompletionPercent: 90 }).eligible, true);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-advertising.test.js ---
22:    nowMs: 500,
41:    nowMs: 500,
53:      { ...base, campaignId: "third_ad", viewCount: 50 },
55:    nowMs: 500,
69:    { ...base, campaignId: "expired", endsAtMs: 500 },
70:    { ...base, campaignId: "future", startsAtMs: 501 },
72:  const result = selectFeaturedAdShowcase({ campaigns, nowMs: 500 });
80:    nowMs: 500,
81:    rotationIntervalMs: 1500,
83:  assert.equal(result.rotationIntervalMs, 1500);
90:    nowMs: 500,
101:    nowMs: 500,
109:    nowMs: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/gcs-signed-url.http.test.js ---
24:      expires: Date.now() + 5 * 60 * 1000,
45:      expires: Date.now() + 5 * 60 * 1000,
49:    assert.equal(read.status, 200);
58:    await new Promise((resolve) => setTimeout(resolve, 2200));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/group-call-economy.test.js ---
10:  policyId: "owner-policy-2026",
15:  updatedAtMs: 1795000000000,
55:  const four = calculateGroupCallCoinShares(2000, ["owner", "early", "late", "last-second"], "owner");
56:  assert.deepEqual(four.map((item) => item.amount), [500, 500, 500, 500]);
57:  const three = calculateGroupCallCoinShares(2000, ["owner", "early", "late"], "owner");
59:  const two = calculateGroupCallCoinShares(2000, ["owner", "late"], "owner");
79:  const reserve = calculateGroupCallMaximumReservation(policy, "video", 3 * 60 * 1000);
85:    15 * 1000, 3 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/guest-sessions.test.js ---
15:  assert.equal(isGuestSessionActive({ status: "ended", expiresAt: Timestamp.fromMillis(200) }, 100), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/biometric-verification.integration.test.js ---
22:const BIOMETRIC_CONSENT_VERSION = "2026-11-20-owner-review-v1";
36:  const payload = Buffer.alloc(20); payload.writeUInt8(0, 0); payload.writeUInt32BE(1000, 12); payload.writeUInt32BE(duration, 16);
45:const sha = bytes => createHash("sha256").update(bytes).digest("hex");
67:    scannerSha256: sha(sourceBytes), scannerVerifiedAt: Timestamp.now(),
70:      safeAudioSha256: sha(safeBytes), safeAudioContentType: safeContentType,
74:      safeVideoSha256: sha(safeBytes), safeVideoContentType: safeContentType,
82:async function attachEvidence(requestRef, uid, requestId, audioDuration = 20000, videoDuration = 4000, status = "security_approved") {
129:    assert.equal(started.audio.maxDurationSeconds, 20);
132:    await attachEvidence(ref, uid, started.requestId, 20000, 4000, "pending_security_scan");
164:    assert.equal(decision.rewardCoins, 1500);
169:    assert.equal(ledger.data().amount, 1500);
198:        const decidedAtMs = Date.now() - 32 * 24 * 60 * 60 * 1000;
199:        const submittedAtMs = decidedAtMs - 24 * 60 * 60 * 1000;
214:      await attachEvidence(ref, uid, started.requestId, 20000, 3000);
251:    for (const [audioDuration, videoDuration] of [[20001, 4000], [20000, 5001]]) {
280:      createdAt: Timestamp.fromMillis(Date.now() - 5 * 60 * 1000 - 1),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/call-economy-gifts.integration.test.js ---
48:      audioCoinsPerMinute: 151, videoCoinsPerMinute: 311, active: true,
79:    priceCoins: 2500, durationDays: 30, status: "completed",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/call-signaling.integration.test.js ---
14:    active: true, quotaWindowMs: 24 * 60 * 60 * 1000,
16:    maxCallDurationMs: 5 * 60 * 1000,
29:  const expiresAt = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
154:  const roomExpiry = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
261:    const future = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
330:      expiresAt: Timestamp.fromMillis(Date.now() + 60_000),
377:          startedAtMs: now - (index + 1) * 60_000,
382:          startedAtMs: now - (index + 1) * 60_000,
387:          startedAtMs: now - 24 * 60 * 60 * 1000 - 1,
463:    assert.ok(calleeReport.maxDurationEndsAtMs - calleeReport.connectedAtMs === 5 * 60 * 1000);
508:    const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
586:  const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/chat-retention.integration.test.js ---
7:const projectId = process.env.GCLOUD_PROJECT || "demo-mawda-retention";
15:const { runChatTextRetentionSweep, runChatMediaRetentionSweep, runStickerMediaRetentionSweep } = require("../../lib/retention");
19:  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
20:  const veryOld = Timestamp.fromMillis(Date.now() - 31 * 24 * 60 * 60 * 1000);
21:  const chatRef = db.collection("directChats").doc("retention-chat-test");
23:  const roomMessageRef = db.collection("rooms").doc("retention-room-test")
25:  const importantChatRef = db.collection("directChats").doc("retention-important-chat-test");
28:  const temporaryChatRef = db.collection("directChats").doc("retention-temporary-chat-test");
30:  const corruptChatRef = db.collection("directChats").doc("retention-corrupt-chat-test");
32:  const notificationRef = db.collection("users").doc("retention-recipient-test")
34:  const unrelatedRef = db.collection("users").doc("retention-recipient-test")
39:    participantUids: ["retention-sender-test", "retention-recipient-test"],
42:    lastMessageSenderUid: "retention-sender-test",
43:    retentionMode: "normal",
45:    importantChatRef.set({ retentionMode: "important", lastMessageAt: old, lastMessagePreview: "important preview" }),
46:    temporaryChatRef.set({ retentionMode: "temporary", lastMessageAt: veryOld, lastMessagePreview: "temporary preview" }),
47:    corruptChatRef.set({ retentionMode: "unknown" }),
51:    senderUid: "retention-sender-test",
52:    recipientUid: "retention-recipient-test",
65:    senderUid: "retention-sender-test",
105:      db.collection("rooms").doc("retention-room-test").delete().catch(() => undefined),
106:      db.collection("users").doc("retention-recipient-test").delete().catch(() => undefined),
116:test("seven-day profile gallery retention removes original and preview objects but honors a legal hold", async () => {
139:  const old = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
152:      retentionPolicyStatus: "seven_day_profile_album",
153:      retentionExpiresAt: old, createdAt: old,
158:      retentionPolicyStatus: "seven_day_profile_album",
159:      retentionExpiresAt: old, createdAt: old,
165:      status: "security_approved", retentionPolicyStatus: "delete_at_story_expiry",
166:      storyExpiresAt: old, retentionExpiresAt: old, storyDocumentId: storyRef.id, createdAt: old,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/coin-package-gifts.integration.test.js ---
50:    recipientRef.set({ coins: 15, profileCompleted: true, accountStatus: "active" }),
53:        coins: 900, priceMinor: 500, currency: "EUR", active: true }],
76:    assert.equal((await recipientRef.get()).data().coins, 15);
79:    assert.equal(stored.packageSnapshot.coins, 900);
89:        agreedCoins: 901, agreedPriceMinor: 500, currency: "EUR",
98:      agreedCoins: 900, agreedPriceMinor: 500, currency: "EUR",
103:    assert.equal((await recipientRef.get()).data().coins, 15);
110:    assert.equal((await recipientRef.get()).data().coins, 15);
127:    assert.equal(recipient.data().coins, 915);
129:    assert.equal(ledger.data().amount, 900);
135:    assert.equal(history.data().coins, 900);
141:    assert.equal((await recipientRef.get()).data().coins, 915);
148:    assert.equal((await recipientRef.get()).data().coins, 915);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/direct-message-deletion.integration.test.js ---
24:const id = (value) => createHash("sha256").update(value).digest("hex");
205:  const longText = "x".repeat(150);
209:    lastMessagePreview: longText.substring(0, 120),
391:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
392:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
398:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
399:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000), createdAt: now,
485:    retentionPolicyStatus: "legal_hold", createdAt: Timestamp.now(),
514:      retentionPolicyStatus: "four_hour_self_destruct",
573:        retentionPolicyStatus: "four_hour_self_destruct",
574:        retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
642:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
643:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
649:      status: "security_approved", retentionPolicyStatus: "four_hour_self_destruct",
650:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 4 * 60 * 60 * 1000),
714:test("manual deletion re-sweeps canonical Storage paths after a retention tombstone", async () => {
731:    status: "self_destructed", retentionPolicyStatus: "four_hour_self_destructed",
732:    createdAt: Timestamp.now(), retentionExpiresAt: Timestamp.now(),
804:      chatId, limit: 50, afterPageToken: initial.latestMessagePageToken,
822:      chatId, limit: 50, afterPageToken: incremental.latestMessagePageToken,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/email-verification-renewal.integration.test.js ---
19:test("fresh email link renewal credits 500 coins once and starts the next three-calendar-month cycle", async () => {
37:    emailVerifiedAt: Timestamp.fromMillis(lastVerifiedAtMs - 3 * 31 * 24 * 60 * 60 * 1000),
40:    emailVerificationCycleStartedAt: Timestamp.fromMillis(lastVerifiedAtMs - 3 * 31 * 24 * 60 * 60 * 1000),
42:    coins: 250,
64:    assert.equal((await userRef.get()).data().coins, 250);
70:    assert.equal(completed.rewardAmount, 500);
71:    assert.equal(completed.newBalance, 750);
74:    assert.equal(member.coins, 750);
85:    assert.equal((await ledgerRef.get()).data().amount, 500);
96:    assert.equal((await userRef.get()).data().coins, 750);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/engagement-rewards.integration.test.js ---
105:  await userRef.set({ coins: 25, profileCompleted: true, accountStatus: "active" });
114:      durationSeconds: 15,
116:      startsAtMs: Date.now() - 60000,
117:      endsAtMs: Date.now() + 3600000,
168:      eligibleMs: 15000,
170:      lastHeartbeatAtMs: Date.now() - 5000,
175:    assert.equal(heartbeat.eligibleMs >= 15000, true);
233:      durationSeconds: 20,
236:      endsAtMs: Date.now() + 3600000,
238:      rewardBudgetCoins: 50,
259:        durationSeconds: 20,
262:        endsAtMs: Date.now() + 3600000,
264:        rewardBudgetCoins: 50,
300:      durationSeconds: 15,
303:      endsAtMs: Date.now() + 3600000,
313:      eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000,
370:      durationSeconds: 15,
373:      endsAtMs: Date.now() + 3600000,
443:      durationSeconds: 15,
446:      endsAtMs: Date.now() + 3600000,
492:    await Promise.all([...users.map((ref) => ref.set({ coins: 0, profileCompleted: true, accountStatus: "active" })), ...campaigns.map((ref) => ref.set({ title: "Counter collision isolation test", sponsorLabel: "Synthetic CI sponsor", body: "Synthetic campaign used only to verify independent member reward limits.", placement: "reward_center", creativeType: "text", durationSeconds: 15, rewardCoins: 1, startsAtMs: Date.now() - 1000, endsAtMs: Date.now() + 3600000, maxClaimsPerMember: 1, rewardBudgetCoins: 1, spentRewardCoins: 0, reservedRewardCoins: 0, status: "published", version: 1 }))]);
495:    await Promise.all(sessions.map((id) => db.collection("timedAdSessions").doc(id).update({ eligibleMs: 15000, heartbeatSequence: 0, lastHeartbeatAtMs: Date.now() - 5000 })));
524:    startsAtMs: now - 60_000, endsAtMs: now - 1_000,
533:        ...campaignData, startsAtMs: now + 60_000, endsAtMs: now + 120_000,
535:      eligibleCampaign.set({ ...campaignData, startsAtMs: now - 1_000, endsAtMs: now + 60_000 }),
573:      durationSeconds: 15,
576:      endsAtMs: Date.now() + 3600000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-finance.integration.test.js ---
43:    endsAtMs: Date.now() + 24 * 60 * 60 * 1000,
143:      externalReference: `bank_receipt_2_${tag}`, amountMinor: 5000,
146:    assert.equal(second.snapshot.receivedMinor, 15000);
171:    assert.equal(snapshot.data().receivedMinor, 15000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-policy.integration.test.js ---
35:    videoCompletionPercent: 90,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-settlement.integration.test.js ---
26:    maxRewardedViewsPerUtcDay: 10, maxRewardCoinsPerUtcDay: 50,
28:    videoCompletionPercent: 90, imageContinuousVisibleMs: 10000,
35:      startsAtMs: now - 60000, endsAtMs: now + 3600000,
41:      serverValidatedPlayback: false, serverValidatedContinuousVisibleMs: 12000,
42:      serverValidatedProgressPercent: 100, startedAtMs: now - 15000,
64:    assert.equal(user.data().coins, 15);
68:    assert.equal(ledger.data().balanceAfter, 15);
101:    userRef.set({ profileCompleted: true, accountStatus: "active", coins: 15 }),
106:      balanceBefore: 10, balanceAfter: 15,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/guest-session.integration.test.js ---
44:  const discoveryNoiseRoomIds = Array.from({ length: 205 }, (_, index) =>
53:      roomRef(roomId).set({ name: "Guest-safe public", status: "active", kind: "public", audience: "adult", guestAudienceApproved: false, ownerUid, capacity: 20, memberCount: 0 }),
54:      roomRef(adultRoomId).set({ name: "Adult only", status: "active", kind: "public", audience: "adult", capacity: 20, memberCount: 0 }),
55:      roomRef(privateRoomId).set({ name: "Private", status: "active", kind: "private", audience: "all_ages", guestAudienceApproved: true, capacity: 20, memberCount: 0 }),
56:      roomRef(unapprovedRoomId).set({ name: "Unapproved", status: "active", kind: "public", audience: "all_ages", guestAudienceApproved: false, capacity: 20, memberCount: 0 }),
58:    // More than 200 earlier active but ineligible rooms must not starve
66:          capacity: 20, memberCount: 0,
102:      username: "guest-test-user", country: "CH", gender: "female", age: 18, dateOfBirth: "2008-01-01",
140:        startsAtMs: Date.now() + 60 * 60 * 1000, durationMinutes: 30,
232:      safeAudioGeneration: "1", safeAudioSha256: "c".repeat(64),
254:      safeAudioGeneration: "1", safeAudioSha256: "a".repeat(64),
279:      safePreviewGeneration: "1", safePreviewSha256: "b".repeat(64),
284:    delete unsafeImageAsset.safeAudioSha256;
320:        const auditRoomIdChunkSize = 20;
323:          if (roomIdChunk.length > 20) throw new Error("Guest test cleanup IN chunk exceeded its safe bound.");
347:  const roomRefs = Array.from({ length: 205 }, (_, index) =>
361:    assert.equal(before.size, 205);
369:    assert.equal(after.size, 0, "all guest memberships must be removed, not only the first 200");
371:    assert.equal(rooms.size, 205);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/media-callables.integration.test.js ---
53:const testKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey
60:  client_id: "123456789012345678901", token_uri: "https://oauth2.googleapis.com/token",
61:}), { mode: 0o600 });
150:  stale.auth.token.auth_time -= 16 * 60;
194:        auth_time: Math.floor(Date.now() / 1000) - 16 * 60,
230:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
234:    retentionPolicyStatus: "seven_day_profile_album",
249:  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
250:  assert.ok(asset.data().retentionExpiresAt instanceof Timestamp);
251:  assert.ok(asset.data().retentionExpiresAt.toMillis() >= Date.now() + 6 * 24 * 60 * 60 * 1000);
252:  assert.ok(asset.data().retentionExpiresAt.toMillis() <= Date.now() + 7 * 24 * 60 * 60 * 1000 + 5000);
257:test("story upload requires and preserves its explicit expiry as the retention deadline", async () => {
259:  const intentExpiry = Date.now() + 60 * 60 * 1000;
272:  assert.equal(before.data().retentionPolicyStatus, "delete_at_story_expiry");
274:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
284:  assert.equal(after.data().retentionExpiresAt.toMillis(), intentExpiry);
304:  assert.equal(before.data().retentionPolicyStatus, "thirty_day_avatar_cover");
305:  const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
314:  assert.ok(after.data().retentionExpiresAt instanceof Timestamp);
315:  assert.ok(after.data().retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);
367:  assert.equal(asset.data().retentionPolicyStatus, "seven_day_profile_album");
368:  assert.equal(asset.data().retentionExpiresAt, null);
391:  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x00]);
402:  // The Storage Emulator does not implement signed PUT endpoints (returns 501).
433:  response.statusCode = 200;
471:  const safePreviewSha256 = createHash("sha256").update(previewBytes).digest("hex");
482:    safePreviewSha256,
516:    safePreviewSha256: "a".repeat(64), safePreviewContentType: "image/webp",
528:  const reservedBytes = 2048;
539:    createdAt: Timestamp.fromMillis(Date.now() - 60 * 60 * 1000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/media-legal-hold.integration.test.js ---
6:const { runChatMediaRetentionSweep } = require("../../lib/retention");
47:      retentionPolicyStatus: "four_hour_self_destruct",
48:      retentionExpiresAt: Timestamp.fromMillis(now - 1000),
55:      reference: "CASE-2026-123",
57:      reviewAtMs: now + 60 * 60 * 1000,
58:      endsAtMs: now + 2 * 60 * 60 * 1000,
63:    assert.equal(heldAsset.data().retentionPolicyStatus, "legal_hold");
64:    assert.equal(heldAsset.data().retentionExpiresAt.toMillis(), now - 1000);
71:      nextReviewAtMs: now + 90 * 60 * 1000,
73:    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);
75:      .data().reviewAt.toMillis(), now + 90 * 60 * 1000);
82:    assert.equal(releasedAsset.data().retentionPolicyStatus, "four_hour_self_destruct");
83:    assert.equal(releasedAsset.data().retentionExpiresAt.toMillis(), now - 1000);
139:      retentionPolicyStatus: "four_hour_self_destruct",
140:      retentionExpiresAt: Timestamp.fromMillis(now - 1000),
141:      createdAt: Timestamp.fromMillis(now - 5 * 60 * 60 * 1000),
150:      reviewAtMs: now + 60 * 60 * 1000,
151:      endsAtMs: now + 2 * 60 * 60 * 1000,
168:      retentionReconcileAt: Timestamp.fromMillis(Date.now() - 1000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/member-profile-media.integration.test.js ---
19:const { runChatMediaRetentionSweep } = require("../../lib/retention");
34:  const oldExpiry = Timestamp.fromMillis(Date.now() + 15 * 24 * 60 * 60 * 1000);
39:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
40:      retentionExpiresAt: oldExpiry,
44:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
45:      retentionExpiresAt: Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000),
57:    assert.equal(oldAsset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
59:    assert.equal(oldAsset.retentionExpiresAt.toMillis(), oldExpiry.toMillis());
62:    assert.ok(newAsset.retentionExpiresAt.toMillis() >= Date.now() + 29 * 24 * 60 * 60 * 1000);
97:      status: "security_approved", retentionPolicyStatus: "thirty_day_avatar_cover",
98:      retentionExpiresAt: expired, createdAt: expired,
132:  const existingExpiry = Timestamp.fromMillis(Date.now() + 20 * 24 * 60 * 60 * 1000);
137:      status: "security_approved", retentionExpiresAt: existingExpiry,
138:      retentionPolicyStatus: "thirty_day_avatar_cover",
148:    assert.equal(asset.retentionPolicyStatus, "thirty_day_superseded_avatar_cover");
150:    assert.equal(asset.retentionExpiresAt.toMillis(), existingExpiry.toMillis());
235:      retentionPolicyStatus: "legal_hold", resumeRetentionPolicyStatus: "thirty_day_avatar_cover",
236:      retentionExpiresAt: expired, createdAt: expired,
252:      retentionPolicyStatus: "thirty_day_avatar_cover",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/message-legal-hold.integration.test.js ---
10:const { runChatTextRetentionSweep } = require("../../lib/retention");
35:  const createdAt = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
50:      reference: "CASE-2026-456",
52:      reviewAtMs: now + 60 * 60 * 1000,
53:      endsAtMs: now + 2 * 60 * 60 * 1000,
64:      nextReviewAtMs: now + 90 * 60 * 1000,
66:    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);
102:        reference: "CASE-2026-457",
104:        reviewAtMs: now + 60 * 60 * 1000,
105:        endsAtMs: now + 2 * 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/owner-entitlement-grants.integration.test.js ---
25:  createHash("sha256").update(`mawdda-owner-grant-v1:${requestId}:${uid}`).digest("hex");
52:      category: "vip", version: 1, priceCoins: 900, durationDays: 30, sortOrder: 1,
55:    catalogVersionRef.set({ itemId, version: 1, priceCoins: 900, purchaseEnabled: true,
68:    assert.ok(first.expiresAt >= before + 24 * 60 * 60 * 1000 - 5000);
69:    assert.ok(first.expiresAt <= Date.now() + 24 * 60 * 60 * 1000 + 5000);
92:    assert.ok(second.expiresAt >= first.expiresAt + 24 * 60 * 60 * 1000 - 1000);
103:      itemId, requestId: purchaseRequestId, expectedPriceCoins: 900, expectedCatalogVersion: 1,
158:    memberRefs[1].set({ uid: memberB, accountStatus: "active", coins: 200 }),
184:    assert.equal((await memberRefs[1].get()).data().coins, 200);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/premium-profile.integration.test.js ---
46:  const future = Timestamp.fromMillis(now + 10 * 24 * 60 * 60 * 1000);
110:    await setMemberCustomTitle.run(call(targetUid, { title: "Mawdda 2026" }));
112:    assert.equal(asciiTitleView.activeTitle, "Mawdda 2026");
187:  await memberRef.set(profile(30, { coins: 5000 }));
225:      assert.equal(result.newBalance, 5000 - (index + 1) * priceCoins, itemId);
287:      category: "vip", priceCoins: 600, durationDays: 30, sortOrder: 1,
292:      category: "vip", priceCoins: 600, durationDays: 30, sortOrder: 1,
298:      itemId: "vip_monthly", requestId, expectedPriceCoins: 600, expectedCatalogVersion: 1,
308:    assert.equal((await ledgerRef.get()).data()?.amount, -600);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/push-token.integration.test.js ---
17:  const tokenId = createHash("sha256").update(token).digest("hex");
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-events.integration.test.js ---
26:  const startsAtMs = Date.now() + 12 * 60 * 1000;
39:      capacity: 20,
111:        startsAtMs: Date.now() + 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-rental.integration.test.js ---
21:    { planId: "room_90d", name: "90 days", durationDays: 90, priceCoins: 2500, active: true },
28:  assert.equal(published.plans[1].priceCoins, 2500);
56:    userRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active", age: 25 }),
57:    newUserRef.set({ coins: 100, profileCompleted: true, accountStatus: "active", age: 25 }),
62:      name: "Test rented room", capacity: 50, planId: "room_30d",
74:    assert.equal(createLedger.balanceBefore, 5000);
76:    assert.equal(createReceipt.balanceBefore, 5000);
110:        ...renewRequest.data, planId: "room_90d",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/safety-cases.integration.test.js ---
40:  const caseId = createHash("sha256").update(`${reporterUid}:${requestId}`).digest("hex");
66:    const ownerQueue = await listSafetyCases.run(ownerRequest({ status: "open", limit: 50 }));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/specialized-role-capacity.integration.test.js ---
22:const grantId = (uid, role) => createHash("sha256")
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/sticker-lifecycle-gates.integration.test.js ---
37:    kind: "static", contentType: "image/webp", width: 128, height: 128, sizeBytes: 1200,
45:      stickerMetadata: metadata, retentionExpiresAt: Timestamp.fromMillis(now + 60 * 60 * 1000),
49:      safePreviewGeneration: "1", safePreviewSha256: "test-hash",
80:    await assetRef.update({ retentionExpiresAt: Timestamp.fromMillis(Date.now() - 1) });
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/store-gifting.integration.test.js ---
38:  const giftId = createHash("sha256").update(
46:    senderRef.set({ profileCompleted: true, accountStatus: "active", coins: 2000 }),
55:      category: "vip", priceCoins: 500, durationDays: 7,
61:    assert.equal(catalogSnapshot.data().priceCoins, 500);
65:      expectedPriceCoins: 500, expectedCatalogVersion: saved.version,
78:    assert.equal(first.priceCoins, 500);
79:    assert.equal((await senderRef.get()).data().coins, 1500);
88:    assert.equal(ledger.data().amount, -500);
92:    assert.equal((await senderRef.get()).data().coins, 1500);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/test-persona-interaction.integration.test.js ---
69:    assert.equal(response.netAmount, 900);
78:    assert.equal(recipientAfter.data().coins, recipientBalance + 900);
82:    assert.equal(recipientLedger.data().amount, 900);
92:    assert.equal((await recipientRef.get()).data().coins, recipientBalance + 900);
147:          require("node:crypto").createHash("sha256").update(senderUid + ":persona_dm_" + tag).digest("hex"),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/wallet-store.integration.test.js ---
44:    senderRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" }),
45:    recipientRef.set({ coins: 200, profileCompleted: true, accountStatus: "active" }),
46:    settingsRef.set({ enabled: true, commissionBps: 2000, version: 1 }),
51:      recipientUid, amount: 1000, requestId, expectedCommissionBps: 2000,
62:    assert.equal(result.commissionAmount, 200);
73:    assert.equal(senderLedger.data().balanceBefore, 5000);
75:    assert.equal(recipientLedger.data().balanceBefore, 200);
77:    assert.equal(transfer.data().senderBalanceBefore, 5000);
79:    assert.equal(transfer.data().recipientBalanceBefore, 200);
81:    assert.equal(senderLedger.data().commissionAmount, 200);
87:    assert.equal(platformLedger.data().amount, 200);
105:        recipientUid, amount: 1000, requestId: `other_${tag}`, expectedCommissionBps: 1500,
170:    refs[3].set({ coins: 50, accountStatus: "active" }),
191:    assert.equal((await refs[3].get()).data().coins, 50);
220:  await memberRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active" });
224:      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
230:      category: "vip", priceCoins: 1250, durationDays: 30, sortOrder: 1,
237:    const request = memberRequest(uid, { itemId, requestId, expectedPriceCoins: 1250, expectedCatalogVersion: 2 });
239:    assert.equal(result.priceCoins, 1250);
240:    assert.equal(result.newBalance, 3750);
246:    assert.equal(member.data().coins, 3750);
248:    assert.equal(purchase.data().priceCoins, 1250);
249:    assert.equal(ledger.data().amount, -1250);
250:    assert.equal(ledger.data().balanceBefore, 5000);
251:    assert.equal(ledger.data().balanceAfter, 3750);
252:    assert.equal(purchase.data().balanceBefore, 5000);
253:    assert.equal(purchase.data().newBalance, 3750);
261:    assert.equal((await memberRef.get()).data().coins, 3750);
267:    assert.equal((await memberRef.get()).data().coins, 3750);
325:    ["vip_monthly", 5000], ["title_custom", 800], ["badge_special", 1200],
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/legal-portal-access.test.js ---
5:const WEB_APP_ID = "1:697303475139:web:8869603bda6f1a3c3ed376";
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/mawdda-media-plane.test.js ---
11:  deploymentId: "mawdda_sfu_2026",
118:    { ...health, deploymentId: "another_sfu_2026" },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-controls.test.js ---
25:  const expected = { provider: "mawadda-clamav-gateway", objectGeneration: "17", sha256: "a".repeat(64), nowMs: 1_800_000_000_000 };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-legal-hold.test.js ---
10:    reference: "CASE-2026-123",
12:    reviewAtMs: 200,
14:  }, 150), {
18:    reference: "CASE-2026-123",
20:    reviewAtMs: 200,
30:    reference: "CASE-2026-123",
32:    reviewAtMs: 200,
37:    { reference: "" }, { startsAtMs: 250 }, { reviewAtMs: 100 },
38:    { endsAtMs: 200 },
40:    assert.throws(() => validateMediaLegalHoldInput({ ...valid, ...patch }, 250));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-quota.test.js ---
10:  const now = Date.UTC(2026, 10, 13, 12);
11:  const empty = { activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13" };
17:    dailyWindow: "2026-11-13",
34:  const nextDay = Date.UTC(2026, 10, 14, 0, 1);
40:    dailyWindow: "2026-11-13",
41:  }, 2048, nextDay), {
44:    dailyBytes: 2048,
46:    dailyWindow: "2026-11-14",
52:    activeUploads: 2, activeBytes: 4096, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
53:  }, 2048), {
54:    activeUploads: 1, activeBytes: 2048, dailyBytes: 8192, dailyUploads: 12, dailyWindow: "2026-11-13",
57:    activeUploads: 0, activeBytes: 0, dailyBytes: 0, dailyUploads: 0, dailyWindow: "2026-11-13",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-scanner.test.js ---
10:  const signature = createHmac("sha256", secret).update(body).digest("hex");
25:    sha256: "a".repeat(64),
29:    signatureDatabaseVersion: "28202",
30:    signatureDatabaseAgeMs: 60 * 60 * 1000,
41:  assert.equal(validateScannerVerdict({ ...payload, signatureDatabaseAgeMs: 37 * 60 * 60 * 1000 }, "clamav-mawadda-gateway", now), null);
53:    sha256: "a".repeat(64),
57:    signatureDatabaseVersion: "28202",
58:    signatureDatabaseAgeMs: 60 * 60 * 1000,
63:    safePreviewSha256: "b".repeat(64),
80:    sha256: "a".repeat(64),
84:    signatureDatabaseVersion: "28202",
85:    signatureDatabaseAgeMs: 60 * 60 * 1000,
101:        sha256: "b".repeat(64),
106:            item.category === "audio" ? { durationMs: 60_000 } : {}),
133:    sha256: "a".repeat(64),
137:    signatureDatabaseVersion: "28202",
138:    signatureDatabaseAgeMs: 60 * 60 * 1000,
153:        safePreviewSha256: "b".repeat(64),
167:          sha256: "b".repeat(64),
184:    verdict: "clean", objectGeneration: "123456", sha256: "a".repeat(64),
186:    signatureDatabaseVersion: "28202", signatureDatabaseAgeMs: 60 * 60 * 1000,
196:        generation: "987654", sha256: "b".repeat(64), contentType, pipelineVersion: pipeline,
197:        ...(category === "video" ? { durationMs: 30_000 } : { durationMs: 20_000 }),
204:        safeDerivative: { ...payload.safeDerivative, durationMs: 20_001 },
217:test("scanner callback enforces the 60-second audio derivative limit and rejects absent, overlong or malformed duration", () => {
222:    objectGeneration: "123456", sha256: "a".repeat(64), scannedAtMs: now,
224:    signatureDatabaseVersion: "28202", signatureDatabaseAgeMs: 60 * 60 * 1000,
229:    generation: "987654", sha256: "b".repeat(64), contentType: "audio/mpeg",
230:    pipelineVersion: "ffmpeg-audio-purpose-limit-v2", durationMs: 60_000,
232:  assert.equal(validateScannerVerdict({ ...base, safeDerivative }, base.provider, now).safeDerivative.durationMs, 60_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-security.test.js ---
18:  assert.equal(mediaPolicyFor("video/mp4").maxBytes, 25 * 1024 * 1024);
22:  assert.equal(mediaPolicyFor("application/pdf").maxBytes, 20 * 1024 * 1024);
27:  assert.throws(() => normalizeMediaRequest({ originalName: "../secret.pdf", contentType: "application/pdf", sizeBytes: 20 }));
28:  assert.throws(() => normalizeMediaRequest({ originalName: "file.exe", contentType: "application/x-msdownload", sizeBytes: 20 }));
44:  const normalized = normalizeMediaRequest({ ...base, storyExpiresAtMs: now + 60_000 });
45:  assert.equal(normalized.storyExpiresAtMs, now + 60_000);
48:    purpose: "profile_album", storyExpiresAtMs: now + 60_000,
54:  assert.equal(detectMediaSignature(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])), "image/png");
80:  assert.equal(MEDIA_SIGNED_URL_TTL_MS.upload, 5 * 60 * 1000);
81:  assert.equal(MEDIA_SIGNED_URL_TTL_MS["owner-inspection"], 60 * 1000);
83:  assert.equal(mediaSignedUrlExpiresAt("owner-inspection", now), now + 60_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-message-pagination.test.js ---
11:    limit: 50,
14:  assert.equal(validateMemberMessagePageRequest({ limit: 25 }).limit, 25);
21:    limit: 50,
26:    limit: 50,
40:  for (const limit of [0, -1, 51, 1.5, "50"]) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile-update.test.js ---
10:  }, 25), {
22:    assert.throws(() => validateMemberProfileUpdate(payload, 25), /PROFILE_UPDATE_FIELD_NOT_ALLOWED/);
43:    () => validateMemberProfileUpdate({ interests: [] }, 25),
47:    () => validateMemberProfileUpdate({ goals: [] }, 25),
53:  assert.throws(() => validateMemberProfileUpdate({ bio: "x".repeat(501) }, 25));
54:  assert.throws(() => validateMemberProfileUpdate({ gender: "unknown" }, 25));
55:  assert.throws(() => validateMemberProfileUpdate({ interests: ["same", "same"] }, 25));
56:  assert.throws(() => validateMemberProfileUpdate({}, 25));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile-view.test.js ---
18:    coins: 9000,
46:    bio: "x".repeat(600),
49:  assert.equal(result.bio.length, 500);
93:    viewerUid: "member-1", targetUid: "member-1", targetCoins: 9000,
95:  }), { visible: true, hiddenByPrivacy: false, balance: 9000 });
97:    viewerUid: "member-2", targetUid: "member-1", targetCoins: 9000,
101:    viewerUid: "moderator-1", targetUid: "member-1", targetCoins: 9000,
105:    viewerUid: "owner-uid", targetUid: "member-1", targetCoins: 9000,
107:  }), { visible: true, hiddenByPrivacy: false, balance: 9000 });
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile.test.js ---
7:  username: "Mawda_2026",
8:  age: 25,
20:  assert.equal(normalizeUsername("Mawda_2026"), "mawda_2026");
51:  assert.equal(profile.username, "mawda_2026");
52:  assert.equal(profile.age, 25);
55:  assert.throws(() => validateMemberProfile({ ...valid, age: 15 }, 16), /AGE_POLICY_NOT_MET/);
58:  assert.throws(() => validateMemberProfile({ ...valid, bio: "x".repeat(501) }, 18));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-social-links-access.test.js ---
21:  expiresAt: { toMillis: () => NOW + 60_000 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-social-links.test.js ---
23:  expiresAt: { toMillis: () => NOW + 60_000 },
76:  const legacy = { status: "verified", expiresAt: { toMillis: () => NOW + 60_000 } };
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/message-legal-hold.test.js ---
9:    reference: "CASE-2026-456",
11:    reviewAtMs: 200,
16:  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: directPath }, 150).messagePath, directPath);
17:  assert.equal(validateMessageLegalHoldInput({ ...common, messagePath: roomPath }, 150).messagePath, roomPath);
24:    assert.throws(() => validateMessageLegalHoldInput({ ...common, messagePath }, 150));
33:    reference: "CASE-2026-456",
35:    reviewAtMs: 200,
40:    { startsAtMs: 250 }, { reviewAtMs: 100 }, { endsAtMs: 200 },
42:    assert.throws(() => validateMessageLegalHoldInput({ ...valid, ...patch }, 250));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-access.test.js ---
9:  auth_time: now - 60,
17:  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 900 }, now), true);
19:  assert.equal(hasPlatformOwnerSession({ ...validOwnerToken, auth_time: now - 901 }, now), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js ---
31:    { actorUid: "owner-1", action: "review_page_result", returnedCount: 25 },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js ---
10:    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
12:  }, 20), {
13:    afterSequence: 10, pageSize: 25, fromMs: 100, toMs: 200,
16:  assert.equal(validateOwnerAuditExportRequest({}, 0).pageSize, 50);
22:    { pageSize: 101 }, { fromMs: 300, toMs: 200 }, { actorUid: "" },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-chat-review.test.js ---
16:    validateOwnerChatReviewRequest({ chatId, limit: 25 }),
17:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 25, pageToken: null },
24:    { chatId, reason: "Routine owner review", mode: "silent", announcementMessageId: null, limit: 50, pageToken: null },
28:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 50, pageToken: null },
34:    () => validateOwnerChatReviewRequest({ chatId, reason: "x".repeat(501) }),
42:    50,
54:  for (const limit of [0, -1, 51, 1.5, "25", Number.MAX_SAFE_INTEGER + 1]) {
102:    { chatId, reason: null, mode: "silent", announcementMessageId: null, limit: 50, pageToken: "message_123" },
108:  for (const pageToken of [42, {}, "contains spaces", "x".repeat(257)]) {
120:      limit: 20,
123:    { memberUid: "member-123", limit: 20, pageToken: "chat_456" },
127:    { memberUid: "member-123", limit: 50, pageToken: null },
133:  for (const limit of [0, 51, 1.2, "20"]) {
147:  const token = encodeOwnerMessagePageToken(1794500000123, "message_abc-123");
149:    createdAtMillis: 1794500000123,
188:  assert.throws(() => validateOwnerReviewAnnouncementRequest({ ...base, noticeText: "x".repeat(501) }), /INVALID_REVIEW_NOTICE_TEXT/);
205:      limit: 50,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-live-stream.test.js ---
26:    "https://192.168.1.20/live",
39:  assert.throws(() => validateOwnerLiveStreamInput(valid({description:"x".repeat(501)})));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-economic-policy.test.js ---
26:  assert.equal(policy.noCostPlanningBaselines.firestore.documentReadsPerDay, 50_000);
27:  assert.equal(policy.noCostPlanningBaselines.firestore.documentWritesPerDay, 20_000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-terminology-docs.test.js ---
9:  'docs/MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md',
13:  'docs/STRUCTURAL_GOVERNANCE_AND_BIOMETRIC_VERIFICATION_2026-11-19.md',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/privacy-acknowledgement.test.js ---
8:  PRIVACY_POLICY_SHA256,
14:  policyHash: PRIVACY_POLICY_SHA256,
83:  assert.equal(hash, PRIVACY_POLICY_SHA256);
85:    createHash("sha256").update(body, "utf8").digest("hex"),
86:    PRIVACY_POLICY_SHA256,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/registration-policy.test.js ---
21:  assert.throws(() => validateRegistrationPolicy(true, 15), /REGISTRATION_MINIMUM_AGE_INVALID/);
22:  assert.equal(validateRegistrationPolicy(true, 120).minimumAge, 120);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/retention.test.js ---
9:  retentionDeadline,
14:} = require("../lib/retention");
16:test("chat media retention is exactly four hours from validated upload finalization", () => {
18:  const deadline = retentionDeadline(createdAt, CHAT_MEDIA_RETENTION_MS);
19:  assert.equal(deadline, createdAt + 4 * 60 * 60 * 1000);
29:test("sticker media retention is exactly one hour and expires at the boundary", () => {
31:  assert.equal(STICKER_MEDIA_RETENTION_MS, 60 * 60 * 1000);
32:  const deadline = retentionDeadline(acceptedAt, STICKER_MEDIA_RETENTION_MS);
33:  assert.equal(deadline, acceptedAt + 60 * 60 * 1000);
38:test("legacy/default normal chat text retention remains exactly seven days", () => {
40:  const deadline = retentionDeadline(createdAt, CHAT_TEXT_RETENTION_MS);
41:  assert.equal(deadline, createdAt + 7 * 24 * 60 * 60 * 1000);
46:test("retention clock rejects invalid timestamps and durations", () => {
47:  assert.throws(() => retentionDeadline(-1, CHAT_MEDIA_RETENTION_MS), /INVALID_RETENTION_CLOCK/);
48:  assert.throws(() => retentionDeadline(1, 0), /INVALID_RETENTION_CLOCK/);
85:test("production retention requires explicit enablement and an exact project allowlist", () => {
86:  const { canRunRetentionJobs } = require("../lib/retention");
93:test("non-production retention still requires explicit enablement", () => {
94:  const { canRunRetentionJobs } = require("../lib/retention");
95:  assert.equal(canRunRetentionJobs("demo-mawda-retention", false, ""), false);
96:  assert.equal(canRunRetentionJobs("demo-mawda-retention", true, ""), true);
97:  assert.equal(canRunRetentionJobs("mawda-app-2026", true, ""), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-call-policy.test.js ---
14:  expiresAt: stamp(20_000),
21:  expiresAt: stamp(20_000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-events.test.js ---
15:    startsAtMs: now + 60 * 60 * 1000,
25:    startsAtMs: now + 60 * 60 * 1000,
37:    startsAtMs: now + 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-policy.test.js ---
11:  assert.throws(() => audienceForAge(15), /INVALID_MEMBER_AGE/);
21:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: false }), false);
22:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "adult", roomKind: "private", invited: true }), true);
41:  assert.equal(canJoinRoom({ memberAge: 25, roomAudience: "all_ages", roomKind: "public", invited: false }), true);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-rental.test.js ---
7:  assert.equal(roomRentalExpiry(now, 30), now + 30 * 24 * 60 * 60 * 1000);
18:  assert.equal(calculateRoomRentalBalance(5000, 1000), 4000);
39:      { planId: "room_90d", durationDays: 90, priceCoins: 2700, active: true },
40:      { planId: "room_180d", durationDays: 180, priceCoins: 5000, active: true },
41:      { planId: "room_365d", durationDays: 365, priceCoins: 9000, active: true },
50:    { planId: "room_trial_2d", name: "تجربة يومين", durationDays: 2, priceCoins: 125, active: true },
51:    { planId: "room_long_10y", name: "خطة طويلة", durationDays: 3650, priceCoins: 250000, active: false },
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/rules/firestore.rules.test.js ---
37:    await setDoc(doc(db, "users/alice"), { uid: "alice", coins: 1200 });
160:    reviewerUid: "alice", expiresAt: Date.now() + 60000,
171:    "users/alice/featuredAdRewardDays/2026-11-23",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/sticker-policy.test.js ---
12:test("owner-approved static sticker ceiling is exactly 256 KiB", () => {
13:  assert.equal(STICKER_LIMITS.staticMaxBytes, 256 * 1024);
16:    sizeBytes: 256 * 1024,
17:  }).sizeBytes, 256 * 1024);
20:    sizeBytes: 256 * 1024 + 1,
28:    sizeBytes: 512 * 1024, durationMs: 5000, frameCount: 50,
32:    sizeBytes: 512 * 1024 + 1, durationMs: 5000, frameCount: 50,
42:    { width: 513 }, { durationMs: 5001 }, { frameCount: 51 },
83:      sizeBytes: 1200, storagePath: "private/asset", downloadUrl: "https://private.invalid",
165:      sizeBytes: 1200, storagePath: "private/asset.webp",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-catalog.test.js ---
12:    priceCoins: 2500,
24:    priceCoins: 2500,
54:    priceCoins: 100, durationDays: 3650,
55:  }).durationDays, 3650);
61:  for (const durationDays of [2, 14, 365, 3650]) {
81:    priceCoins: 2500,
90:    priceCoins: 2500,
122:    active: true, version: 1, itemId: "vip_monthly", category: "vip", priceCoins: 500,
129:    active: true, version: 1, itemId: "profile_theme_30d", category: "theme", priceCoins: 500,
166:      priceCoins: 500,
181:    priceCoins: 500,
192:    priceCoins: 500,
205:    ["voice_call_7d", "voice_call", 500, 7],
206:    ["voice_call_30d", "voice_call", 1500, 30],
207:    ["video_call_24h", "video_call", 250, 1],
208:    ["video_call_7d", "video_call", 1250, 7],
209:    ["video_call_30d", "video_call", 3750, 30],
251:    category: "vip", priceCoins: 500, durationDays: null,
262:    category: "vip", priceCoins: 900, sortOrder: 1, active: true, purchaseEnabled: false,
264:  assert.equal(validateStoreCatalogItemInput({ ...base, durationDays: 3650 }).durationDays, 3650);
278:      assert.ok(item.durationDays >= 1 && item.durationDays <= 3650, item.itemId);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-gifting.test.js ---
14:    itemId: "vip_monthly", priceCoins: 2500, catalogVersion: 3, status: "completed",
18:    itemId: "vip_monthly", expectedPriceCoins: 2500, expectedCatalogVersion: 3,
43:    NOW + 10_000 + 7 * 24 * 60 * 60 * 1000,
47:    NOW + 24 * 60 * 60 * 1000,
50:    calculateStoreGiftExpiryMs({ status: "expired", expiresAt: { toMillis: () => NOW + 50_000 } }, 1, NOW),
51:    NOW + 24 * 60 * 60 * 1000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-purchase.test.js ---
14:  assert.equal(calculateStorePurchaseBalance(5000, 1250), 3750);
41:  assert.equal(isStorePurchasePriceCurrent(2500, 2500), true);
42:  assert.equal(isStorePurchasePriceCurrent(2500, 3000), false);
43:  assert.equal(isStorePurchasePriceCurrent(0, 2500), false);
44:  assert.equal(isStorePurchasePriceCurrent(2500.5, 2500), false);
45:  assert.equal(isStorePurchasePriceCurrent(2500, Number.MAX_SAFE_INTEGER + 1), false);
51:    { itemId: "title_a", category: "title", itemName: "لقب النخبة", status: "active", expiresAt: { toMillis: () => NOW + 5000 } },
60:      { itemId: "title_a", itemName: "لقب النخبة", category: "title", expiresAtMs: NOW + 5000 },
77:  const prior = { memberUid: "member-a", itemId: "vip_30d", priceCoins: 2500, catalogVersion: 7 };
78:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "vip_30d", 2500, 7), true);
80:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "vip_30d", 2500, 8), false);
81:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-a", "other_item", 2500, 7), false);
82:  assert.equal(isStorePurchaseReplayCompatible(prior, "member-b", "vip_30d", 2500, 7), false);
83:  assert.equal(isStorePurchaseReplayCompatible(null, "member-a", "vip_30d", 2500, 7), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/test-account-personas.test.js ---
20:  assert.deepEqual(guest.guestWindow, { durationSeconds: 3600, rollingWindowSeconds: 86400, emulatorClockOverrideOnly: true });
29:    durationSeconds: 3600,
82:    assert.ok(profile.biography.length >= 20);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/validate-firebase-config.test.js ---
5:const projectId = "mawda-app-2026";
6:const webAppId = "1:697303475139:web:8869603bda6f1a3c3ed376";
9:const nonprodProjectId = "mawda-platform-nonprod-2026";
16:  "  authDomain: 'mawda-app-2026.firebaseapp.com',",
17:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
24:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
31:  "  storageBucket: 'mawda-app-2026.firebasestorage.app',",
37:  web: { appId: "1:12102454568:web:e5b292ae20b9a55ca2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
38:  android: { appId: "1:12102454568:android:5f8907b71af845cfa2141d", messagingSenderId: "12102454568", storageBucket: nonprodProjectId + ".firebasestorage.app" },
57:  defaultAlias = "mawda-platform-nonprod-2026", nonprodSource = makeNonprodOptions(),
84:  assert.ok(validate(validOptions.replace(webAppId, "1:1234567890:web:abcdef123456789")).errors.includes("FIREBASE_WEB_APP_ID_MISMATCH"));
118:  assert.ok(validate(validOptions.replace(androidAppId, "1:1234567890:android:abcdef123456789")).errors.includes("FIREBASE_ANDROID_APP_ID_MISMATCH"));
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/verification-calendar.test.js ---
6:  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 0, 31, 12), 1), Date.UTC(2026, 1, 28, 12));
7:  assert.equal(addCalendarMonthsUtc(Date.UTC(2028, 0, 31, 12), 1), Date.UTC(2028, 1, 29, 12));
8:  assert.equal(addCalendarMonthsUtc(Date.UTC(2026, 10, 30, 8, 15), 3), Date.UTC(2027, 1, 28, 8, 15));
12:  const anchor = Date.UTC(2026, 0, 31, 12);
13:  const biometricDue = anchor + 30 * 24 * 60 * 60 * 1000;
14:  const emailDue = Date.UTC(2026, 3, 30, 12);
15:  assert.equal(BIOMETRIC_VERIFICATION_INTERVAL_MS, 30 * 24 * 60 * 60 * 1000);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/wallet-reconciliation.test.js ---
6:  const result = reconcileWalletLedger(125, [
8:    { id: "purchase", amount: -25, balanceBefore: 100, balanceAfter: 75 },
9:    { id: "reward", amount: 50, balanceBefore: 75, balanceAfter: 125 },
13:  assert.equal(result.computedBalance, 125);
14:  assert.equal(result.netLedgerDelta, 125);
20:    { id: "new-debit", amount: -25, balanceBefore: 100, balanceAfter: 75 },
29:    { id: "legacy", amount: -20 },
38:  const arithmetic = reconcileWalletLedger(90, [
39:    { id: "a", amount: 100, balanceBefore: 0, balanceAfter: 90 },
43:  const chain = reconcileWalletLedger(90, [
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/firebase_options.dart ---
35:    appId: '1:697303475139:web:8869603bda6f1a3c3ed376',
37:    projectId: 'mawda-app-2026',
38:    authDomain: 'mawda-app-2026.firebaseapp.com',
39:    storageBucket: 'mawda-app-2026.firebasestorage.app',
50:    projectId: 'mawda-app-2026',
51:    storageBucket: 'mawda-app-2026.firebasestorage.app',
57:    projectId: 'mawda-app-2026',
58:    storageBucket: 'mawda-app-2026.firebasestorage.app',
63:    appId: '1:1234567890:macos:abcdef123456789',
64:    messagingSenderId: '1234567890',
71:    appId: '1:1234567890:windows:abcdef123456789',
72:    messagingSenderId: '1234567890',
79:    appId: '1:1234567890:linux:abcdef123456789',
80:    messagingSenderId: '1234567890',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/firebase_options_nonprod.dart ---
51:    appId: '1:12102454568:web:e5b292ae20b9a55ca2141d',
53:    projectId: 'mawda-platform-nonprod-2026',
54:    authDomain: 'mawda-platform-nonprod-2026.firebaseapp.com',
55:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
60:    appId: '1:12102454568:android:5f8907b71af845cfa2141d',
62:    projectId: 'mawda-platform-nonprod-2026',
63:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
69:    projectId: 'mawda-platform-nonprod-2026',
70:    storageBucket: 'mawda-platform-nonprod-2026.firebasestorage.app',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/main.dart ---
37:        title: 'مودة | Mawdda Platform 2026',
133:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/models/app_models.dart ---
2:// الكود الشامل، النهائي، والكامل بامتياز لتطبيق مودة (mawda-app-2026)
21:      'uploadedAt': uploadedAt.toIso8601String(),
22:      'expiresAt': expiresAt.toIso8601String(),
52:  final String bio;                   // النبذة التعريفية (حتى 500 حرف)
54:  final bool isEmailVerified;         // توثيق البريد (+500 كوينز)
55:  final bool isBiometricVerified;    // التوثيق البيومتري (+1500 كوينز)
159:      'createdAt': createdAt.toIso8601String(),
160:      'updatedAt': updatedAt.toIso8601String(),
251:      'sessionStartedAt': sessionStartedAt.toIso8601String(),
252:      'sessionExpiresAt': sessionExpiresAt.toIso8601String(),
312:      'createdAt': createdAt.toIso8601String(),
343:    this.dailyRewardCoins = 50,
345:    this.weeklyRewardCoins = 500,
346:    this.adWatchRewardCoins = 20,
366:      dailyRewardCoins: map['dailyRewardCoins'] ?? 50,
368:      weeklyRewardCoins: map['weeklyRewardCoins'] ?? 500,
369:      adWatchRewardCoins: map['adWatchRewardCoins'] ?? 20,
408:      'timestamp': timestamp.toIso8601String(),
451:      'cancelledAt': cancelledAt.toIso8601String(),
498:      'timestamp': timestamp.toIso8601String(),
556:      'timestamp': timestamp.toIso8601String(),
557:      'expiresAt': expiresAt.toIso8601String(),
610:      'assignedAt': assignedAt.toIso8601String(),
657:      'bannedAt': bannedAt.toIso8601String(),
658:      'expiresAt': expiresAt.toIso8601String(),
696:      'lastDailyClaim': lastDailyClaim?.toIso8601String(),
697:      'lastHourlyClaim': lastHourlyClaim?.toIso8601String(),
698:      'lastWeeklyClaim': lastWeeklyClaim?.toIso8601String(),
748:      'timestamp': timestamp.toIso8601String(),
792:      'timestamp': timestamp.toIso8601String(),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/models/user_model.dart ---
2:// Production Home 2022 - Mawda Platform User Model
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/policies/chat_audio_policy.dart ---
2:/// The trusted backend and scanner independently enforce the same 60-second limit.
3:const int maxLiveChatAudioRecordingSeconds = 60;
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/privacy_policy.dart ---
1:const mawdaPrivacyPolicyVersion = '2026-11-14.1';
3:    '3af7c404337db26a806031864f979f54e15a74495818fb24e0eff58a1a267c93';
16:مدة دورة المكافأة البيومترية 30 يوماً، وتُمنح 1,500 كوين مرة واحدة في الدورة بعد نجاح نافذة المصادقة المحلية في تطبيق Android أو iOS، ثم قبول طلب المكافأة من الخادم. يفرض الخادم اكتمال العضوية وصلاحية الحساب والفاصل الزمني ويضيف المكافأة وسجل المحفظة داخل معاملة واحدة لمنع التكرار. هذا المسار يعتمد على مطالبة التطبيق بنجاح نافذة نظام التشغيل؛ ولا يقدم إثباتاً تشفيرياً بأن عميلاً معدلاً لم يتجاوز النافذة، ولذلك فالمكافأة تشجيعية على المصادقة المحلية وليست إثبات هوية مدنية أو أساساً منفرداً لمنح صلاحيات أمنية حساسة. لا تلتقط مودة الكاميرا أو الميكروفون ولا تسجل صوتاً لهذا الغرض.
18:تستهدف مودة دورة تحقق حديث للبريد كل 90 يوماً ومكافأة 500 كوين مرة واحدة لكل دورة مؤهلة. يجب أن يعتمد صرف هذه المكافأة على إثبات حديث لامتلاك صندوق البريد مرتبط بالدورة الخادمية، لا على بقاء علامة emailVerified القديمة وحدها؛ وتظل المكافأة غير مفعلة إلى أن يكتمل مسار إعادة التحقق واختباره.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/ad_viewing_screen.dart ---
14:            final horizontal = constraints.maxWidth >= 520;
78:            padding: const EdgeInsets.all(20),
132:                maxCrossAxisExtent: 220,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/auth_gate.dart ---
213:        const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/biometric_review_screen.dart ---
81:            ? 'ستُفعّل حالة التوثيق ويُضاف 1,500 BetaCoins إلى محفظة العضو بمعاملة خادمية واحدة.'
122:                  child: Text('هذه المراجعة حصرية للمالك الأعلى (Super Owner). افتح واستمع إلى الصوت وشاهد الفيديو بنفسك قبل القرار. القبول وحده يمنح 1,500 BetaCoins. يتطلب الخادم مطالبة المالك وجلسة MFA حديثة ويثبت القرار والمكافأة في سجل تدقيق ومعاملة ذرية.'),
166:              icon: const Icon(Icons.check_circle_outline), label: const Text('قبول + 1,500 BetaCoins'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/biometric_verification_screen.dart ---
81:      _recordingTimer = Timer(const Duration(seconds: 20), _stopRecording);
246:                  ? 'التسجيل جارٍ الآن. اقرأ العبارة بوضوح؛ سيتوقف تلقائياً عند 20 ثانية.'
255:                  label: Text(_recording ? 'إيقاف التسجيل' : 'تسجيل العبارة (حتى 20 ثانية)'),
273:              const Text('سجّل صوتك وأنت تقرأ العبارة كاملة، ثم سجّل فيديو مدته من 3 إلى 5 ثوانٍ. الحد الأعلى للصوت 20 ثانية و5 MiB، وللفيديو 25 MiB.'),
302:            title: Text('مكافأة القبول: 1,500 BetaCoins'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/call_usage_policy_screen.dart ---
70:        _windowHours.text = window == null ? '' : (window / 3600000).toString();
74:        _maxDurationMinutes.text = duration == null ? '' : (duration / 60000).toString();
90:    if (hours == null || hours < (1 / 60) || hours > 8760 ||
105:          'quotaWindowMs': (hours * 3600000).round(),
108:          'maxCallDurationMs': durationMinutes == null ? null : durationMinutes * 60000,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/capacity_media_management_screen.dart ---
225:                            style: TextStyle(fontWeight: FontWeight.w600),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/chat_room_screen.dart ---
191:      imageQuality: 90,
192:      maxWidth: 2048,
193:      maxHeight: 2048,
557:                                            height: 120,
597:                                                  url, width: 260, height: 220, fit: BoxFit.cover,
621:                                          width: 260,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/conversations_screen.dart ---
133:                  const SizedBox(height: 20),
173:                    style: TextStyle(fontWeight: hasUnread ? FontWeight.bold : FontWeight.w500),
180:                      fontWeight: hasUnread ? FontWeight.w600 : FontWeight.normal,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/direct_chat_screen.dart ---
252:            'limit': 50,
300:      final request = <String, dynamic>{'limit': 50};
382:            'limit': 50,
456:      imageQuality: 90,
457:      maxWidth: 2048,
458:      maxHeight: 2048,
779:                            height: 120,
819:                                  url, width: 260, height: 220, fit: BoxFit.cover,
843:                          width: 260,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/featured_ads_screen.dart ---
48:        duration: const Duration(milliseconds: 250),
70:            .clamp(250, 60 * 1000).toInt();
202:                      height: 250,
494:                  padding: EdgeInsets.all(20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/gift_coins_screen.dart ---
193:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/guest_room_chat_screen.dart ---
141:      if (pcm.lengthInBytes < 2048) {
277:            icon: _busy ? const SizedBox(width: 20, height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/guest_session_screen.dart ---
135:    return 'الوقت المتبقي: ${remaining.inMinutes} دقيقة و${remaining.inSeconds.remainder(60)} ثانية';
148:      TextField(controller: _country, maxLength: 60,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/landing_page.dart ---
35:                image: NetworkImage('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1350&q=80'),
55:                    constraints: const BoxConstraints(maxWidth: 550),
64:                          color: Colors.pink.withValues(alpha: 0.15),
65:                          blurRadius: 25,
78:                            color: Colors.pink.withValues(alpha: 0.15),
83:                                blurRadius: 20,
99:                          style: TextStyle(fontSize: 12, color: Color(0xFFFFD700), fontWeight: FontWeight.w600),
101:                        const SizedBox(height: 20),
113:                        const SizedBox(height: 20),
152:        duration: const Duration(milliseconds: 250),
158:            color: isSelected ? Colors.pinkAccent : Colors.white.withValues(alpha: 0.15),
229:            '🎉 هدية انضمام: 500 كوينز مجانية (يرجى مراجعة الـ Spam وتأكيد البريد).',
244:            color: Colors.black.withValues(alpha: 0.25),
246:            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
267:            color: Colors.black.withValues(alpha: 0.25),
269:            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
290:            '🔒 توثيق بيومتري (اختياري - صوت + سيلفي): يمنحك +1500 كوينز ودرع موثق!',
305:              const SnackBar(content: Text('جاري بدء إتمام التسجيل والحصول على الـ 500 كوينز...')),
338:              const SnackBar(content: Text('تم بدء الجلسة المؤقتة لمدة 60 دقيقة...')),
354:        prefixIcon: Icon(icon, size: 16, color: Colors.white60),
358:        fillColor: Colors.black.withValues(alpha: 0.25),
362:          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
378:        title: const Text('التواصل مع السوبر أدمن والدعم', style: TextStyle(color: Colors.white, fontSize: 15)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/landing_page_screen.dart ---
38:      'regDesc': 'مرحباً بك! ستحصل فور تسجيلك على مكافأة 500 كوينز.',
40:      'legalNotice': '© 2026 جميع الحقوق القانونية والتجارية والتقنية محفوظة لصالح مجموعة Production Home Company 2022. يُمنع نسخ أو إعادة استخدام أو استغلال أو تعديل أي جزء من المنصة أو هويتها أو محتواها دون إذن كتابي مسبق من أصحاب الحقوق.',
56:      'regDesc': 'Welcome! You will instantly receive a 500 coins bonus upon registration.',
58:      'legalNotice': '© 2026 All legal, commercial and technical rights are reserved in favor of Production Home Company 2022 Group. No part of this platform, its identity or content may be copied, reused, exploited or modified without prior written permission from the rights holders.',
74:      'regDesc': 'Bienvenue! Vous recevrez instantanément un bonus de 500 pièces.',
76:      'legalNotice': '© 2026 Tous les droits juridiques, commerciaux et techniques sont réservés au profit du groupe Production Home Company 2022. Toute copie, réutilisation, exploitation ou modification de la plateforme, de son identité ou de son contenu nécessite une autorisation écrite préalable des ayants droit.',
92:      'regDesc': '¡Bienvenido! Recibirás un bono de 500 monedas al registrarte.',
94:      'legalNotice': '© 2026 Todos los derechos legales, comerciales y técnicos quedan reservados a favor del Grupo Production Home Company 2022. Se prohíbe copiar, reutilizar, explotar o modificar cualquier parte de la plataforma, su identidad o contenido sin autorización previa por escrito de los titulares de los derechos.',
144:      padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
147:          constraints: const BoxConstraints(maxWidth: 900),
157:                  'https://avatars.githubusercontent.com/u/348720557?v=4',
161:                  semanticLabel: 'Production Home Company 2022 logo',
164:                    size: 20,
170:                constraints: const BoxConstraints(maxWidth: 850),
179:                    letterSpacing: _currentLocale == 'ar' ? 0 : 0.15,
283:      height: 50,
314:        const SizedBox(height: 20),
320:        const SizedBox(height: 15),
341:        const SizedBox(height: 20),
361:        const SizedBox(height: 20),
379:        const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/login_screen.dart ---
42:            width: 520,
340:      backgroundColor: const Color(0xFF160D1B),
381:              const SizedBox(height: 20),
383:                child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
393:                const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/main_user_screen.dart ---
137:        title: const Text('مودة | Mawdda Platform 2026'),
293:          const SnackBar(content: Text('اكتمل ملفك! أضيفت 500 كوين إلى محفظتك.')),
333:        padding: const EdgeInsets.all(20),
335:          constraints: const BoxConstraints(maxWidth: 560),
348:                const SizedBox(height: 20),
353:                    if (v.length < 3 || v.length > 20) return 'اسم المستخدم من 3 إلى 20 حرفاً';
360:                    if (age == null || age < 16 || age > 120) return 'يجب أن يكون العمر 16 عاماً على الأقل';
389:                _field('نبذة عنك (حتى 500 حرف)', _bio, maxLines: 4,
390:                  validator: (value) => (value?.length ?? 0) > 500 ? 'الحد الأقصى 500 حرف' : null),
462:                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
466:                const Text('تُمنح مكافأة 500 كوين بعد نجاح التحقق وإكمال العضوية وفق سياسة العمر المعتمدة.',
489:            constraints: const BoxConstraints(maxWidth: 520),
500:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/mawdda_call_screen.dart ---
146:      _pollTimer = Timer.periodic(const Duration(milliseconds: 900), (_) {
601:              top: 16, right: 16, width: 112, height: 160,
609:            left: 20, right: 20, bottom: 36,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/member_entitlement_history_screen.dart ---
98:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/my_contracts_screen.dart ---
66:          width: 560,
171:                                'SHA-256: ${contract['contentHash'] ?? '—'}',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_advertising_rewards_screen.dart ---
68:        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'uploaderType': 'all', 'limit': 50}),
180:      if (upload.statusCode < 200 || upload.statusCode >= 300) {
207:        budget == null || duration < 15 || duration > 900 || reward < 0 ||
323:            width: 520,
605:                SizedBox(width: 120, child: TextField(controller: _maxClaims, enabled: !_saving,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_biometric_review_screen.dart ---
73:          maxLength: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_chat_participation_screen.dart ---
48:        .call({'chatId': widget.chatId, 'limit': 50});
113:    if (!rawUrl.startsWith('https://') || rawUrl.length > 2048 ||
114:        title.text.trim().length > 120 || description.text.trim().length > 500) {
236:                        constraints: const BoxConstraints(maxWidth: 520),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_coin_purchase_screen.dart ---
68:        currencyCode.codeUnits.every((unit) => unit >= 65 && unit <= 90);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_contract_center_screen.dart ---
200:          width: 560,
324:                                'SHA-256: ${contract['contentHash'] ?? '—'}',
418:          width: 600,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_entitlement_grants_screen.dart ---
90:      case 720:
118:          'الدفعات التقنية: ${(targets.length / 500).ceil()}\n'
152:      for (var offset = 0; offset < targets.length; offset += 500) {
153:        final chunk = targets.skip(offset).take(500).toList(growable: false);
246:                        DropdownMenuItem(value: 720, child: Text('30 يوماً')),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_featured_ads_dashboard_screen.dart ---
21:  final _policyVideoCompletion = TextEditingController(text: '90');
81:        _functions.httpsCallable('listOwnerMediaAssets').call({'status': 'security_approved', 'limit': 50}),
103:        _policyVideoCompletion.text = (policy['videoCompletionPercent'] ?? 90).toString();
149:        imageVisibleMs < 1000 || imageVisibleMs > 3600000 ||
346:              currencyCode.codeUnits.every((unit) => unit >= 65 && unit <= 90);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_featured_ads_screen.dart ---
38:  final _videoPercent = TextEditingController(text: '90');
83:          'status': 'security_approved', 'uploaderType': 'all', 'limit': 50,
108:        _videoPercent.text = (rewardPolicy['videoCompletionPercent'] ?? 90).toString();
353:        content: SizedBox(width: 520, child: events.isEmpty
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_mfa_enrollment_screen.dart ---
51:        issuer: 'Mawdda Platform 2026',
135:          constraints: const BoxConstraints(maxWidth: 560),
146:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_room_live_stream_screen.dart ---
29:        url.length > 2048 || _title.text.trim().length > 120 ||
30:        _description.text.trim().length > 500) {
64:      TextField(controller: _title, enabled: !_sending, maxLength: 120,
66:      TextField(controller: _description, enabled: !_sending, maxLength: 500, maxLines: 3,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/owner_sticker_packs_screen.dart ---
34:    if (_stickers.length >= 120) {
35:      _showMessage('بلغت الحزمة الحد الأقصى البالغ 120 ملصقاً.');
165:            label: const Text('رفع ملصق ثابت PNG أو WebP (حتى 256 KiB)'),
180:          Text('الملصقات المضافة: ${_stickers.length}/120',
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/privacy_acknowledgement_screen.dart ---
31:              constraints: const BoxConstraints(maxWidth: 720),
33:                padding: const EdgeInsets.all(20),
38:                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
89:                                width: 20,
90:                                height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/production_application_screen.dart ---
153:          TextFormField(controller: _experience, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'الخبرات العملية'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'اكتب خبرة لا تقل عن 20 حرفاً.'),
160:          TextFormField(controller: _role, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'الدور الذي ترغب بالمساهمة فيه'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى توضيح الدور بما لا يقل عن 20 حرفاً.'),
161:          TextFormField(controller: _interview, minLines: 4, maxLines: 8, decoration: const InputDecoration(labelText: 'أسئلة المقابلة: عرفنا بخبرتك، وكيف تدير جودة العمل والتعاون؟'), validator: (v) => (v?.trim().length ?? 0) >= 20 ? null : 'يرجى كتابة إجابات كافية للمقابلة.'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/profile_screen.dart ---
134:          'لذلك فإن مكافأة 1500 بيتا بيتا كوينز وصلاحيات التوثيق البيومتري معلّقة حتى اكتمال التحقق الآمن المرتبط بالجهاز. '
197:              'تم تجديد التحقق من البريد وإضافة 500 بيتا بيتا كوينز إلى محفظتك${balance == null ? '' : '؛ رصيدك الجديد $balance'}.',
207:            content: Text('أرسلنا رابط تحقق جديد إلى بريدك. افتحه ثم ارجع إلى هنا واضغط الزر نفسه لاعتماد مكافأة 500 بيتا بيتا كوينز.'),
302:          maxLength: 160,
453:          width: 460,
467:                      maxLength: 500,
601:                    _editField(bio, 'نبذة عنك', maxLength: 500, maxLines: 4),
682:    int maxLength = 120,
695:        if (label == 'نبذة عنك') return text.length <= 500 ? null : 'الحد الأقصى 500 حرف.';
1276:                    color: Colors.blueGrey.shade900,
1305:                  radius: 50,
1319:                  radius: 50,
1412:                          style: const TextStyle(fontWeight: FontWeight.w600),
1530:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1549:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1583:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1621:                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
1695:                    label: const Text('تجديد التحقق من البريد (500 بيتا بيتا كوينز كل 90 يوماً)'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/reward_center_screen.dart ---
267:            width: 520,
341:          constraints: const BoxConstraints(maxWidth: 520),
387:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/room_events_screen.dart ---
63:    final duration = TextEditingController(text: '60');
74:            width: 420,
86:                    maxLength: 500,
112:                        lastDate: DateTime.now().add(const Duration(days: 90)),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/room_moderation_screen.dart ---
192:              maxLength: 500,
256:          maxLength: 500,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/room_rental_pricing_screen.dart ---
53:                name.text.trim().length < 3 || d == null || d < 1 || d > 3650 ||
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/rooms_screen.dart ---
64:      final capacity = TextEditingController(text: '50');
71:            content: SizedBox(width: 420, child: Column(mainAxisSize: MainAxisSize.min, children: [
414:              constraints: const BoxConstraints(maxWidth: 1120),
436:              const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/safety_center_screen.dart ---
137:          maxLength: 2000,
139:            labelText: 'اشرح سبب الاستئناف (20 حرفاً على الأقل)',
147:              if (controller.text.trim().length >= 20) {
259:                  maxLength: 2000,
286:                  const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/safety_review_screen.dart ---
23:      FirebaseFunctions.instance.httpsCallable('listSafetyCases').call({'status': 'open', 'limit': 50}),
148:                const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/shop_screen.dart ---
203:                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/stories_screen.dart ---
205:                          height: 120,
211:                        height: 120,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/super_admin_screen.dart ---
109:        limit: 25,
163:    final expires = asset['retentionExpiresAt'];
164:    if (asset['retentionPolicyStatus'] == 'owner_approval_required' || expires == null) {
182:    final ageHours = (age / (60 * 60 * 1000)).toStringAsFixed(1);
246:                        lastDate: now.add(const Duration(days: 3650)),
265:                        lastDate: now.add(const Duration(days: 3650)),
446:            width: 560,
529:            constraints: const BoxConstraints(maxWidth: 520, maxHeight: 520),
567:        _minimumAge = configuredAge is num && configuredAge.toInt() >= 16 && configuredAge.toInt() <= 120
643:            width: 460,
672:                    maxLength: 500,
845:    final capacityController = TextEditingController(text: '50');
853:            width: 420,
859:                  maxLength: 60,
901:                if (name.length >= 3 && name.length <= 60 &&
1105:            width: 560,
1106:            height: 520,
1165:          maxLength: 500,
1280:          maxLength: 500,
1428:            padding: EdgeInsets.all(20),
1639:                  style: TextStyle(fontWeight: FontWeight.w600),
1721:                  max: 120,
1863:                                      width: 20,
1864:                                      height: 20,
1870:                              asset['retentionPolicyStatus'] != 'legal_hold')
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/screens/user_profile_screen.dart ---
37:                  height: 200,
39:                  color: Colors.pink.shade200,
42:                  bottom: -50,
47:                      radius: 50,
49:                      child: Icon(Icons.person, size: 50, color: Colors.white),
55:            const SizedBox(height: 60),
66:            const SizedBox(height: 15),
95:            const SizedBox(height: 20),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/audio_wav_encoder.dart ---
31:  header.setUint16(20, 1, Endian.little); // Linear PCM.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/member_media_upload_service.dart ---
42:    if (contentType == 'video/mp4') return 25 * 1024 * 1024;
43:    if (contentType == 'application/pdf') return 20 * 1024 * 1024;
104:    if (uploadResponse.statusCode != 200) {
195:    if (uploadResponse.statusCode != 200) {
206:    Duration timeout = const Duration(seconds: 90),
288:    if (uploadResponse.statusCode != 200) {
348:  /// the member entitlement on every save and never changes server retention.
527:    final maximum = kind == 'animated' ? 512 * 1024 : 256 * 1024;
551:    if (uploadResponse.statusCode != 200) {
667:    if (response.statusCode != 200) {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/room_billing_service.dart ---
40:          'freezeExpiresAt': now.add(const Duration(hours: 24)).toIso8601String(),
83:        'expiresAt': newExpiry.toIso8601String(),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/services/super_admin_security_service.dart ---
11:    int limit = 25,
322:    int pageSize = 50,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/chat_audio_controls.dart ---
75:        sampleRate: 16000,
115:      if (pcmBytes.lengthInBytes < 2048) {
122:      final wav = encodePcm16MonoToWav(pcmBytes, sampleRate: 16000);
158:                width: 20,
159:                height: 20,
246:        width: 260,
257:                      width: 20,
258:                      height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/mawdda_app_downloads.dart ---
140:              style: TextStyle(color: Colors.white60, fontSize: 11, height: 1.5),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/mawdda_sticker_widgets.dart ---
142:                                            width: 20,
143:                                            height: 20,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/member_activity_meter.dart ---
33:      const Duration(seconds: 60),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/premium_profile_effects.dart ---
79:    duration: const Duration(milliseconds: 1900),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/lib/widgets/responsive_room_card.dart ---
9:    this.compactBreakpoint = 520,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/processors.js ---
9:  gif: { maxFrames: 50, maxPixels: 40_000_000, maxDurationSeconds: 20, maxBytes: 3 * 1024 * 1024 },
10:  audio: { maxDurationSeconds: 60, roomMaxDurationSeconds: 60, maxBytes: 5 * 1024 * 1024 },
11:  video: { maxDurationSeconds: 90, maxBytes: 15 * 1024 * 1024 },
12:  pdf: { maxPages: 30, maxBytes: 20 * 1024 * 1024 },
28:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
37:async function uploadDerivative({ storage, bucketName, outputPath, request, sourceSha256, provider, filename, contentType, pipelineVersion, maxBytes }) {
46:    sourceSha256,
67:        String(custom.sourceSha256) !== sourceSha256 ||
75:      sha256: await sha256StorageObject(file), contentType, pipelineVersion,
83:      String(custom.sourceSha256) !== sourceSha256 ||
90:    sha256: await sha256StorageObject(file), contentType, pipelineVersion,
94:async function sha256StorageObject(file) {
95:  const hash = createHash("sha256");
105:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
133:  if (contentType !== "image/gif" && stat.size > 256 * 1024) {
140:  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
148:      !Number.isSafeInteger(frames) || frames < 1 || frames > 50) {
153:    if (!Number.isSafeInteger(durationMs) || durationMs < 1 || durationMs > 5000 ||
157:  if (frames !== 1 || stat.size > 256 * 1024) {
163:async function processGif({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
169:    "-vf", "scale=2048:2048:force_original_aspect_ratio=decrease:flags=lanczos",
172:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
176:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
187:  if (purpose === "room" || purpose === "chat" || purpose === "biometric") return 60;
197:async function processAudio({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
209:  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
211:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
218:async function processVideo({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
228:    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
233:    storage, bucketName, outputPath: output, request, sourceSha256, provider,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/security.js ---
81:    custom.sourceSha256 === expected.sourceSha256 &&
86:function isSignatureDatabaseFresh(lastUpdatedMs, nowMs = Date.now(), maxAgeMs = 36 * 60 * 60 * 1000) {
89:    lastUpdatedMs <= nowMs + 5 * 60 * 1000 &&
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/server.js ---
23:const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_DOWNLOAD_BYTES || 25 * 1024 * 1024);
24:const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS || 150_000);
26:const MAX_SIGNATURE_AGE_MS = Number(process.env.MAX_SIGNATURE_AGE_MS || 36 * 60 * 60 * 1000);
50:async function sha256StorageObject(file) {
51:  const hash = createHash("sha256");
56:async function sha256File(filePath) {
57:  const hash = createHash("sha256");
65:    signal: AbortSignal.timeout(90_000),
80:  await pipeline(require("node:stream").Readable.fromWeb(response.body), limiter, createWriteStream(destination, { flags: "wx", mode: 0o600 }));
105:      "--max-filesize=25M", "--max-scansize=50M",
122:async function createSafeImageDerivative(sourcePath, request, sourceSha256) {
138:  const maxPreviewBytes = stickerPreview ? 256 * 1024 : MAX_SAFE_PREVIEW_BYTES;
165:    sourceSha256,
178:          sourceSha256,
192:    const existingHash = await sha256StorageObject(derivative);
196:      safePreviewSha256: existingHash,
208:    safePreviewSha256: await sha256StorageObject(derivative),
218:  const signature = createHmac("sha256", HMAC_SECRET).update(body).digest("hex");
228:    signal: AbortSignal.timeout(15_000),
243:      json(response, 503, { error: "scanner_not_configured" });
248:      json(response, 503, { error: "scanner_signatures_stale" });
261:    const sourceSha256 = await sha256File(sourcePath);
280:          sourcePath, tempDir, request: scanRequest, sourceSha256,
284:        derivative = await createSafeImageDerivative(sourcePath, scanRequest, sourceSha256);
288:          sourcePath, tempDir, request: scanRequest, sourceSha256,
302:      sha256: sourceSha256,
316:    json(response, 202, { accepted: true, mediaId: scanRequest.mediaId, verdict });
324:    json(response, 503, { error: "scan_unavailable" });
339:    MAX_DOWNLOAD_BYTES > 25 * 1024 * 1024 ||
348:    json(response, signatures.fresh ? 200 : 503, {
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/processors.integration.test.js ---
75:      "-pix_fmt", "yuv420p", output,
90:      "nullsrc=size=512x512,geq=lum=random(1)*255", "-frames:v", "1", "-c:v", "png", output,
121:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
130:        sourceSha256, storage, bucketName: "mawadda-test", provider,
136:      assert.match(result.safeDerivative.sha256, /^[a-f0-9]{64}$/);
140:      assert.equal(saved.metadata.metadata.sourceSha256, sourceSha256);
168:  test(`real audio processor accepts a recording at the exact 60-second ceiling for ${purpose}`, async () => {
174:        "sine=frequency=440:duration=60", "-c:a", "pcm_s16le", sourcePath,
176:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
184:        sourceSha256, storage, bucketName: "mawdda-test", provider,
194:  test(`real audio processor rejects recordings beyond 60 seconds for ${purpose}`, async () => {
200:        "sine=frequency=440:duration=60.1", "-c:a", "pcm_s16le", sourcePath,
202:      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
209:        sourceSha256, storage: fakeStorage(), bucketName: "mawdda-test", provider,
229:      assert.ok(metadata.sizeBytes > 0 && metadata.sizeBytes <= 256 * 1024);
271:    assert.ok(metadata.durationMs > 0 && metadata.durationMs <= 5000);
272:    assert.ok(metadata.frameCount > 1 && metadata.frameCount <= 50);
273:    const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
281:      sourceSha256, storage, bucketName: "mawdda-test", provider,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/processors.test.js ---
6:  assert.equal(LIMITS.gif.maxFrames, 50);
7:  assert.equal(LIMITS.gif.maxDurationSeconds, 20);
10:  assert.equal(LIMITS.audio.maxDurationSeconds, 60);
12:  assert.equal(LIMITS.audio.roomMaxDurationSeconds, 60);
13:  assert.equal(audioDurationLimitForPurpose("chat"), 60);
14:  assert.equal(audioDurationLimitForPurpose("room"), 60);
15:  assert.equal(audioDurationLimitForPurpose("biometric"), 60);
16:  assert.equal(LIMITS.video.maxBytes, 15 * 1024 * 1024);
17:  assert.equal(LIMITS.video.maxDurationSeconds, 90);
18:  assert.equal(LIMITS.pdf.maxBytes, 20 * 1024 * 1024);
21:  assert.equal(LIMITS.video.maxDurationSeconds, 90);
45:  assert.equal(videoDurationAllowedForPurpose("chat", 90), true);
46:  assert.equal(videoDurationAllowedForPurpose("chat", 90.001), false);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/security.test.js ---
47:    mediaId, objectGeneration: generation, sourceSha256: "a".repeat(64),
55:      sourceSha256: "a".repeat(64),
63:  assert.equal(isSafeDerivativeMetadata({ ...metadata, metadata: { ...metadata.metadata, sourceSha256: "b".repeat(64) } }, expected), false);
79:  const maxAge = 36 * 60 * 60 * 1000;
80:  assert.equal(isSignatureDatabaseFresh(now - 60 * 60 * 1000, now, maxAge), true);
81:  assert.equal(isSignatureDatabaseFresh(now - 40 * 60 * 60 * 1000, now, maxAge), false);
83:  assert.equal(isSignatureDatabaseFresh(now + 10 * 60 * 1000, now, maxAge), false);
88:  assert.deepEqual(parseClamAvVersion("ClamAV 1.4.6/28202/Thu Nov 13 06:00:00 2026"), {
91:    signatureDatabaseVersion: "28202",
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/storage.rules ---
5:    // content validation and scheduled retention are implemented.
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/audio_wav_encoder_test.dart ---
18:      expect(header.getUint16(20, Endian.little), 1);
32:      final wav = encodePcm16MonoToWav(pcm, sampleRate: 16000);
35:      expect(header.getUint32(24, Endian.little), 16000);
36:      expect(header.getUint32(28, Endian.little), 32000);
47:        () => encodePcm16MonoToWav(Uint8List.fromList([1, 2]), sampleRate: 96000),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/chat_audio_policy_test.dart ---
6:  test('live microphone chat recordings are capped at exactly 60 seconds', () {
7:    expect(maxLiveChatAudioRecordingSeconds, 60);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/coin_transfer_models_test.dart ---
6:    test('parses a 20 percent transfer quote correctly', () {
9:        'commissionBps': 2000,
10:        'commissionAmount': 200,
15:      expect(quote.commissionBps, 2000);
16:      expect(quote.commissionPercent, 20);
17:      expect(quote.commissionAmount, 200);
39:        'commissionBps': 2000,
40:        'commissionAmount': 200,
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/firestore-transient-retry.test.js ---
35:    maxDelayMs: 250,
40:  assert.deepEqual(delays, [100, 200, 250]);
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js ---
24:const BATCH_SIZE = 125;
69:test("load-test fixture is emulator-only and contains 5000 unique synthetic personas", async () => {
74:  assert.ok(personas.length >= 5000, "the full 5000-persona run is required");
79:test("provision all 5000 emulator-only identities and synthetic member profiles", async () => {
83:      password: `Load!-${persona.personaId}-Only-Emulator-2026`,
145:for (const count of [500, 1000, 2500, 5000]) {
189:          assert.equal(result.netAmount, 90);
271:      assert.ok(allTransfers.every((x) => x.senderBalance === 9900 && x.recipientBalance === 10090 &&
285:      if (count === 5000) metrics.personaCoverage = coverageRows;
299:        transferLatencyMs: { p50: percentile(transferTimes, 0.50), p95: percentile(transferTimes, 0.95), max: Number(Math.max(...transferTimes).toFixed(2)) },
300:        messageLatencyMs: { p50: percentile(messageTimes, 0.50), p95: percentile(messageTimes, 0.95), max: Number(Math.max(...messageTimes).toFixed(2)) },
301:        receiveLatencyMs: { p50: percentile(receiveTimes, 0.50), p95: percentile(receiveTimes, 0.95), max: Number(Math.max(...receiveTimes).toFixed(2)) }
313:test("all 5000 personas complete a connected member, premium-profile, discovery, room and event lifecycle", async () => {
316:  assert.equal(metrics.createdUsers, 5000, "the complete 5000-persona fixture must be provisioned first");
319:  const expiresAt = Timestamp.fromMillis(now + 7 * 24 * 60 * 60 * 1000);
321:  const ROOM_COHORT_SIZE = 50;
375:        description: "Emulator-only VIP purchase used by the 5000-persona lifecycle test.",
518:      const tokenId = require("node:crypto").createHash("sha256").update(token).digest("hex");
530:        ownerUid: group.owner.uid, capacity: 60, memberCount: 1,
541:    // independent rooms concurrently; a flat 25-way fan-out previously sent
542:    // 25 transactions against the same room document and caused emulator lock
544:    await inBatches(roomGroups, 20, async (group) => {
559:          eventType: "announcement", startsAtMs: Date.now() + 6 * 60 * 1000,
572:    // work across independent events; a 25-way fan-out against the same event
613:      assert.equal(rows.filter((row) => row[field]).length, 5000,
614:        "all 5000 personas must complete " + field);
657:    scenario: "5000-persona-full-product-lifecycle",
669:  }, null, 2) + "\n", { mode: 0o600 });
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/widgets/responsive_room_card_test.dart ---
6:  for (final width in [320.0, 390.0, 768.0, 1440.0]) {
9:      tester.view.physicalSize = Size(width, 900);
22:                    subtitle: Text('غرفة خاصة • الأعضاء: 25 / 100'),
--- POLICY FILE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/web/install-prompt.js ---
69:      setDismissedUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);

## 4. Guardrails & Working Tree Integrity
- Platform dirty files before run: <clean>
- Lab dirty files before run: <clean>
- Closed repairs preserved without reopening; no merge to main; no production deploy; no Blaze activation; no live retention deletion.
