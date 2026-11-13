const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { createRentedRoom, renewRoomRental, transferRoomOwnership, closeOwnedRoom, getRoomRentalPlans, setRoomRentalPlans } = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const memberRequest = (uid, data) => ({
  data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const ownerRequest = (uid, data) => ({
  data, auth: { uid, token: { platformOwner: true, platformOwnerUid: uid, auth_time: Math.floor(Date.now()/1000),
    firebase: { sign_in_second_factor: "phone" } } },
});

test("room rental plans are editable only by MFA owner and expose versioned published prices", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const uid = `room_pricing_owner_${suffix()}`;
  const plans = [
    { planId: "room_30d", name: "30 days", durationDays: 30, priceCoins: 1000, active: true },
    { planId: "room_90d", name: "90 days", durationDays: 90, priceCoins: 2500, active: true },
  ];
  const result = await setRoomRentalPlans.run(ownerRequest(uid, { plans }));
  assert.equal(result.saved, true);
  const published = await getRoomRentalPlans.run(memberRequest(uid, {}));
  assert.equal(published.version, result.version);
  assert.equal(published.plans.length, 2);
  assert.equal(published.plans[1].priceCoins, 2500);
  await assert.rejects(
    () => setRoomRentalPlans.run(memberRequest(uid, { plans })),
    (error) => error && error.code === "permission-denied",
  );
  await assert.rejects(
    () => setRoomRentalPlans.run(ownerRequest(uid, { plans: [{ ...plans[0], priceCoins: -1 }] })),
    (error) => error && error.code === "invalid-argument",
  );
});

test("member room rental debits atomically, renews idempotently, transfers and closes with audit trail", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const ownerUid = `room_owner_${tag}`;
  const newOwnerUid = `room_new_owner_${tag}`;
  const userRef = db.collection("users").doc(ownerUid);
  const newUserRef = db.collection("users").doc(newOwnerUid);
  const settingsRef = db.doc("platformSettings/roomRentals");
  const oldSettings = await settingsRef.get();
  const oldSettingsData = oldSettings.exists ? oldSettings.data() : null;
  const plans = [
    { planId: "room_30d", name: "30 days", durationDays: 30, priceCoins: 1000, active: true },
  ];
  const requestId = `rent_${tag}`;
  let roomId;
  const seededAuditIds = [];
  await Promise.all([
    userRef.set({ coins: 5000, profileCompleted: true, accountStatus: "active", age: 25 }),
    newUserRef.set({ coins: 100, profileCompleted: true, accountStatus: "active", age: 25 }),
    settingsRef.set({ plans, version: 1 }),
  ]);
  try {
    const request = memberRequest(ownerUid, {
      name: "Test rented room", capacity: 50, planId: "room_30d",
      expectedPriceCoins: 1000, requestId,
    });
    const created = await createRentedRoom.run(request);
    roomId = created.roomId;
    assert.equal(created.priceCoins, 1000);
    assert.equal(created.newBalance, 4000);
    assert.equal((await userRef.get()).data().coins, 4000);
    assert.equal((await db.collection("rooms").doc(roomId).get()).data().status, "active");

    const ledgerRef = userRef.collection("walletLedger").doc(`room_${ownerUid}_${requestId}`);
    assert.equal((await ledgerRef.get()).data().amount, -1000);

    const renewRequest = memberRequest(ownerUid, {
      roomId, planId: "room_30d", expectedPriceCoins: 1000, requestId: `renew_${tag}`,
    });
    const renewed = await renewRoomRental.run(renewRequest);
    assert.equal(renewed.renewed, true);
    const replay = await renewRoomRental.run(renewRequest);
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await userRef.get()).data().coins, 3000);

    await db.collection("rooms").doc(roomId).collection("members").doc(newOwnerUid).set({
      uid: newOwnerUid, role: "member",
    });
    const transfer = await transferRoomOwnership.run(memberRequest(ownerUid, { roomId, newOwnerUid }));
    assert.equal(transfer.transferred, true);
    assert.equal((await db.collection("rooms").doc(roomId).get()).data().ownerUid, newOwnerUid);
    await closeOwnedRoom.run(memberRequest(newOwnerUid, { roomId }));
    assert.equal((await db.collection("rooms").doc(roomId).get()).data().status, "closed");
    const closedReceipt = await db.collection("roomRentals").doc(`${ownerUid}_renew_${tag}`).get();
    assert.equal(closedReceipt.data().status, "closed_by_owner");
    const ledger = await db.collection("users").doc(ownerUid).collection("walletLedger").get();
    assert.equal(ledger.size, 2);
    const audit = await db.collection("roomAuditLogs").where("roomId", "==", roomId).get();
    assert.ok(audit.docs.some((doc) => doc.data().action === "room_ownership_transferred"));
    assert.ok(audit.docs.some((doc) => doc.data().action === "room_closed"));
  } finally {
    if (roomId) {
      const roomRef = db.collection("rooms").doc(roomId);
      const [members, moderators] = await Promise.all([
        roomRef.collection("members").get(), roomRef.collection("moderators").get(),
      ]);
      await Promise.all([...members.docs, ...moderators.docs].map((doc) => doc.ref.delete()));
      await roomRef.delete().catch(() => undefined);
    await db.collection("roomRentals").doc(`expiry_rental_${tag}`).delete().catch(() => undefined);
      const rentals = await db.collection("roomRentals").where("roomId", "==", roomId).get();
      await Promise.all(rentals.docs.map((doc) => doc.ref.delete()));
      const audit = await db.collection("roomAuditLogs").where("roomId", "==", roomId).get();
      await Promise.all(audit.docs.map((doc) => doc.ref.delete()));
    }
    const ledger = await userRef.collection("walletLedger").get();
    await Promise.all(ledger.docs.map((doc) => doc.ref.delete()));
    await Promise.all([userRef.delete(), newUserRef.delete()]);
    if (oldSettingsData) await settingsRef.set(oldSettingsData);
    else await settingsRef.delete().catch(() => undefined);
  }
});


test("scheduled rental expiry freezes for grace period then closes without deleting records", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const roomId = `expiry_room_${tag}`;
  const ownerUid = `expiry_owner_${tag}`;
  const roomRef = db.collection("rooms").doc(roomId);
  const notificationQuery = db.collection("notifications").where("userId", "==", ownerUid);
  const seededNotifications = await notificationQuery.get();
  const oldNotificationIds = new Set(seededNotifications.docs.map((doc) => doc.id));
  const { processExpiredRoomRentals } = require("../../lib/index");
  try {
    const rentalRef = db.collection("roomRentals").doc(`expiry_rental_${tag}`);
    await rentalRef.set({ rentalId: rentalRef.id, roomId, ownerUid, status: "active" });
    await roomRef.set({
      roomId, ownerUid, isRented: true, rentalId: rentalRef.id, status: "active",
      expiresAt: require("firebase-admin/firestore").Timestamp.fromMillis(Date.now() - 1000),
    });
    await processExpiredRoomRentals.run();
    let room = (await roomRef.get()).data();
    assert.equal(room.status, "frozen");
    assert.ok(room.freezeExpiresAt.toMillis() > Date.now());
    assert.equal((await rentalRef.get()).data().status, "grace_period");
    await roomRef.update({
      freezeExpiresAt: require("firebase-admin/firestore").Timestamp.fromMillis(Date.now() - 1000),
    });
    await processExpiredRoomRentals.run();
    room = (await roomRef.get()).data();
    assert.equal(room.status, "closed");
    assert.equal(room.closeReason, "rental_expired");
    assert.equal((await rentalRef.get()).data().status, "expired");
    const notifications = await notificationQuery.get();
    assert.ok(notifications.docs.some((doc) => !oldNotificationIds.has(doc.id)));
    assert.ok((await roomRef.get()).exists);
  } finally {
    const notifications = await notificationQuery.get();
    await Promise.all(notifications.docs.filter((doc) => !oldNotificationIds.has(doc.id))
      .map((doc) => doc.ref.delete()));
    await roomRef.delete().catch(() => undefined);
  }
});
