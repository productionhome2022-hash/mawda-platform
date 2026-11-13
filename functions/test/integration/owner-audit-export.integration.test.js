const test = require("node:test");
const assert = require("node:assert/strict");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const { exportOwnerReviewAuditPage } = require("../../lib/index");
const { calculateOwnerAuditHash } = require("../../lib/owner-audit-chain");

const db = getFirestore();
const headRef = db.collection("adminAuditChainHeads").doc("ownerReview");

function ownerRequest(data = {}) {
  return {
    data,
    auth: {
      uid: "audit-export-owner",
      token: {
        platformOwner: true,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_second_factor: "phone" },
      },
    },
  };
}

test("owner audit export pages preserve sequence, redact raw text and retain integrity hashes", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const oldHead = await headRef.get();
  const oldHeadData = oldHead.exists ? oldHead.data() : null;
  const oldEntries = await db.collection("adminAuditLogs")
    .where("auditChainId", "==", "owner-review-v1").get();
  const cleanupRefs = oldEntries.docs.map((doc) => doc.ref);
  let previousHash = "GENESIS";
  const seededRefs = [];

  try {
    for (let index = 1; index <= 3; index += 1) {
      const event = {
        actorUid: "audit-export-owner",
        action: "test_export_event",
        ordinal: index,
        noticeText: "private notice body",
        noticeTextHash: "f".repeat(64),
      };
      const eventHash = calculateOwnerAuditHash(event, index, previousHash);
      const ref = db.collection("adminAuditLogs").doc(`audit-export-seed-${index}`);
      seededRefs.push(ref);
      await ref.set({
        ...event,
        auditEvent: event,
        auditChainId: "owner-review-v1",
        auditSequence: index,
        previousAuditHash: previousHash,
        auditHash: eventHash,
        createdAt: Timestamp.now(),
      });
      previousHash = eventHash;
    }
    await headRef.set({ sequence: 3, eventHash: previousHash });

    const first = await exportOwnerReviewAuditPage.run(ownerRequest({
      pageSize: 1, action: "test_export_event",
    }));
    assert.equal(first.entries.length, 1);
    assert.equal(first.entries[0].sequence, 1);
    assert.equal(first.entries[0].event.noticeText, undefined);
    assert.equal(first.entries[0].event.noticeTextHash, "f".repeat(64));
    assert.equal(first.hasMore, true);
    assert.equal(first.nextAfterSequence, 1);

    const second = await exportOwnerReviewAuditPage.run(ownerRequest({
      pageSize: 1, action: "test_export_event", afterSequence: first.nextAfterSequence,
    }));
    assert.equal(second.entries.length, 1);
    assert.equal(second.entries[0].sequence, 2);
    assert.equal(second.hasMore, true);

    const third = await exportOwnerReviewAuditPage.run(ownerRequest({
      pageSize: 1, action: "test_export_event", afterSequence: second.nextAfterSequence,
    }));
    assert.equal(third.entries.length, 1);
    assert.equal(third.entries[0].sequence, 3);
    assert.equal(third.hasMore, false);
    assert.equal(typeof third.exportAuditLogId, "string");
  } finally {
    const generated = await db.collection("adminAuditLogs")
      .where("auditChainId", "==", "owner-review-v1").get();
    await Promise.all([...generated.docs.map((doc) => doc.ref.delete()),
      ...cleanupRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...seededRefs.map((ref) => ref.delete().catch(() => undefined))]);
    if (oldHeadData) await headRef.set(oldHeadData);
    else await headRef.delete().catch(() => undefined);
  }
});
