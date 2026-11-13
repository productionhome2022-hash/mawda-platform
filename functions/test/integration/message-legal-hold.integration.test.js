const test = require("node:test");
const assert = require("node:assert/strict");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const {
  placeMessageLegalHold,
  listActiveMessageLegalHolds,
  reviewMessageLegalHold,
  releaseMessageLegalHold,
} = require("../../lib/index");
const { runChatTextRetentionSweep } = require("../../lib/retention");

const db = getFirestore();

function ownerRequest(data = {}) {
  return {
    data,
    auth: {
      uid: "message-legal-hold-owner",
      token: {
        platformOwner: true,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_second_factor: "phone" },
      },
    },
  };
}

test("owner message legal hold suspends seven-day text deletion and release resumes it", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const roomId = `legal-hold-room-${Date.now()}`;
  const messageId = "a".repeat(64);
  const messagePath = `rooms/${roomId}/messages/${messageId}`;
  const messageRef = db.doc(messagePath);
  const createdAt = Timestamp.fromMillis(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const now = Date.now();
  await messageRef.set({
    type: "text",
    senderUid: "member-a",
    text: "This text must remain preserved while the hold is active.",
    createdAt,
  });

  let holdId;
  try {
    const placed = await placeMessageLegalHold.run(ownerRequest({
      messagePath,
      authority: "Court order",
      legalBasis: "Preserve the specifically identified text message evidence.",
      reference: "CASE-2026-456",
      startsAtMs: now,
      reviewAtMs: now + 60 * 60 * 1000,
      endsAtMs: now + 2 * 60 * 60 * 1000,
    }));
    holdId = placed.holdId;
    assert.equal(placed.status, "active");
    assert.equal((await messageRef.get()).data().legalHoldStatus, "active");

    const listed = await listActiveMessageLegalHolds.run(ownerRequest());
    assert.ok(listed.holds.some((hold) => hold.holdId === holdId));
    const reviewed = await reviewMessageLegalHold.run(ownerRequest({
      holdId,
      reviewNote: "Reviewed the order and confirmed this message remains in scope.",
      nextReviewAtMs: now + 90 * 60 * 1000,
    }));
    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);

    const heldSweep = await runChatTextRetentionSweep();
    assert.equal(heldSweep.failures, 0);
    assert.ok((await messageRef.get()).exists);

    const released = await releaseMessageLegalHold.run(ownerRequest({ holdId }));
    assert.equal(released.status, "released");
    assert.equal((await messageRef.get()).data().legalHoldStatus, "released");
    const resumedSweep = await runChatTextRetentionSweep();
    assert.equal(resumedSweep.failures, 0);
    assert.equal((await messageRef.get()).exists, false);

    await assert.rejects(
      () => placeMessageLegalHold.run({
        ...ownerRequest({ messagePath }),
        auth: {
          uid: "not-owner",
          token: { auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_second_factor: "phone" } },
        },
      }),
      (error) => error && error.code === "permission-denied",
    );

    const mediaMessageId = "b".repeat(64);
    const mediaMessagePath = `rooms/${roomId}/messages/${mediaMessageId}`;
    await db.doc(mediaMessagePath).set({
      type: "image",
      attachments: [{ mediaId: "11111111-2222-3333-4444-555555555555" }],
      createdAt,
    });
    await assert.rejects(
      () => placeMessageLegalHold.run(ownerRequest({
        messagePath: mediaMessagePath,
        authority: "Court order",
        legalBasis: "Preserve the specifically identified text message evidence.",
        reference: "CASE-2026-457",
        startsAtMs: now,
        reviewAtMs: now + 60 * 60 * 1000,
        endsAtMs: now + 2 * 60 * 60 * 1000,
      })),
      (error) => error && error.code === "failed-precondition",
    );
    await db.doc(mediaMessagePath).delete();
  } finally {
    await messageRef.delete().catch(() => undefined);
    if (holdId) await db.collection("messageLegalHolds").doc(holdId).delete().catch(() => undefined);
  }
});
