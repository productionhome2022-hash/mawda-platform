const test = require("node:test");
const assert = require("node:assert/strict");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const { placeMediaLegalHold, releaseMediaLegalHold, listActiveMediaLegalHolds, reviewMediaLegalHold } = require("../../lib/index");

const db = getFirestore();
const headRef = db.collection("adminAuditChainHeads").doc("ownerReview");
const mediaId = "12345678-1234-1234-1234-123456789abc";

function ownerRequest(data = {}) {
  return {
    data,
    auth: {
      uid: "legal-hold-owner",
      token: {
        platformOwner: true,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_second_factor: "phone" },
      },
    },
  };
}

test("owner legal hold suspends exact chat-media expiry and release restores the original deadline", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const oldHead = await headRef.get();
  const oldHeadData = oldHead.exists ? oldHead.data() : null;
  const oldEntries = await db.collection("adminAuditLogs")
    .where("auditChainId", "==", "owner-review-v1").get();
  const oldEntryData = oldEntries.docs.map((doc) => ({ ref: doc.ref, data: doc.data() }));
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const previousAsset = await assetRef.get();
  const previousAssetData = previousAsset.exists ? previousAsset.data() : null;
  const now = Date.now();

  try {
    await assetRef.set({
      mediaId,
      ownerUid: "media-owner",
      mediaPurpose: "chat",
      objectPath: "quarantine/media-owner/12345678-1234-1234-1234-123456789abc",
      status: "security_approved",
      retentionPolicyStatus: "four_hour_self_destruct",
      retentionExpiresAt: Timestamp.fromMillis(now - 1000),
    });

    const placed = await placeMediaLegalHold.run(ownerRequest({
      mediaId,
      authority: "Court order",
      legalBasis: "Preserve the specifically identified chat media evidence.",
      reference: "CASE-2026-123",
      startsAtMs: now,
      reviewAtMs: now + 60 * 60 * 1000,
      endsAtMs: now + 2 * 60 * 60 * 1000,
    }));
    assert.equal(placed.status, "active");
    const heldAsset = await assetRef.get();
    assert.equal(heldAsset.data().legalHoldStatus, "active");
    assert.equal(heldAsset.data().retentionPolicyStatus, "legal_hold");
    assert.equal(heldAsset.data().retentionExpiresAt.toMillis(), now - 1000);

    const listed = await listActiveMediaLegalHolds.run(ownerRequest());
    assert.ok(listed.holds.some((hold) => hold.holdId === placed.holdId));
    const reviewed = await reviewMediaLegalHold.run(ownerRequest({
      holdId: placed.holdId,
      reviewNote: "Reviewed case scope and confirmed the hold remains necessary.",
      nextReviewAtMs: now + 90 * 60 * 1000,
    }));
    assert.equal(reviewed.endsAtMs, now + 2 * 60 * 60 * 1000);
    assert.equal((await db.collection("mediaLegalHolds").doc(placed.holdId).get())
      .data().reviewAt.toMillis(), now + 90 * 60 * 1000);

    const released = await releaseMediaLegalHold.run(ownerRequest({ holdId: placed.holdId }));
    assert.equal(released.status, "released");
    const releasedAsset = await assetRef.get();
    assert.equal(releasedAsset.data().legalHoldStatus, "released");
    assert.equal(releasedAsset.data().activeLegalHoldId, undefined);
    assert.equal(releasedAsset.data().retentionPolicyStatus, "four_hour_self_destruct");
    assert.equal(releasedAsset.data().retentionExpiresAt.toMillis(), now - 1000);
    assert.equal((await db.collection("mediaLegalHolds").doc(placed.holdId).get()).data().status, "released");

    await assert.rejects(
      () => placeMediaLegalHold.run({
        ...ownerRequest({ mediaId }),
        auth: {
          uid: "not-owner",
          token: { auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_second_factor: "phone" } },
        },
      }),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    const holds = await db.collection("mediaLegalHolds").where("mediaId", "==", mediaId).get();
    await Promise.all(holds.docs.map((doc) => doc.ref.delete()));
    if (previousAssetData) await assetRef.set(previousAssetData);
    else await assetRef.delete().catch(() => undefined);
    const generated = await db.collection("adminAuditLogs")
      .where("auditChainId", "==", "owner-review-v1").get();
    await Promise.all(generated.docs.map((doc) => doc.ref.delete()));
    await Promise.all(oldEntryData.map(({ ref, data }) => ref.set(data)));
    if (oldHeadData) await headRef.set(oldHeadData);
    else await headRef.delete().catch(() => undefined);
  }
});
