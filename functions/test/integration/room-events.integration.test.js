const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  createRoomEvent,
  listRoomEvents,
  rsvpRoomEvent,
  setRoomEventStatus,
} = require("../../lib/index");

const db = getFirestore();
const call = (uid, data = {}) => ({ data, auth: { uid, token: {} } });
const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

test("room event lifecycle is owner-controlled, age-scoped and RSVP-idempotent", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const ownerUid = uid("event_owner");
  const memberUid = uid("event_member");
  const minorUid = uid("event_minor");
  const roomId = uid("event_room");
  const roomRef = db.collection("rooms").doc(roomId);
  const ownerRef = db.collection("users").doc(ownerUid);
  const memberRef = db.collection("users").doc(memberUid);
  const minorRef = db.collection("users").doc(minorUid);
  const startsAtMs = Date.now() + 12 * 60 * 1000;

  await Promise.all([
    ownerRef.set({ profileCompleted: true, accountStatus: "active", age: 30 }),
    memberRef.set({ profileCompleted: true, accountStatus: "active", age: 34 }),
    minorRef.set({ profileCompleted: true, accountStatus: "active", age: 17 }),
    roomRef.set({
      roomId,
      name: "اختبار أحداث مودة",
      ownerUid,
      kind: "public",
      audience: "adult",
      status: "active",
      capacity: 20,
      memberCount: 3,
      invitedUids: [],
    }),
    roomRef.collection("members").doc(ownerUid).set({ uid: ownerUid, role: "owner" }),
    roomRef.collection("members").doc(memberUid).set({ uid: memberUid, role: "member" }),
    roomRef.collection("members").doc(minorUid).set({ uid: minorUid, role: "member" }),
  ]);

  let createdEventId;
  try {
    const created = await createRoomEvent.run(call(ownerUid, {
      roomId,
      title: "جلسة المجتمع",
      description: "موعد تجريبي",
      eventType: "announcement",
      startsAtMs,
      durationMinutes: 30,
    }));
    createdEventId = created.eventId;
    const eventRef = db.collection("roomEvents").doc(createdEventId);
    assert.equal(created.status, "scheduled");

    const listed = await listRoomEvents.run(call(memberUid, { roomId }));
    assert.equal(listed.events.length, 1);
    assert.equal(listed.events[0].eventId, createdEventId);
    assert.equal(listed.events[0].isAttending, false);

    await rsvpRoomEvent.run(call(memberUid, { eventId: createdEventId }));
    await rsvpRoomEvent.run(call(memberUid, { eventId: createdEventId }));
    const afterRsvp = await listRoomEvents.run(call(memberUid, { roomId }));
    assert.equal(afterRsvp.events[0].isAttending, true);
    assert.equal(afterRsvp.events[0].attendeeCount, 1);

    await assert.rejects(
      () => listRoomEvents.run(call(minorUid, { roomId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => createRoomEvent.run(call(memberUid, {
        roomId,
        title: "حدث غير مصرح",
        eventType: "announcement",
        startsAtMs: Date.now() + 60 * 60 * 1000,
      })),
      (error) => error && error.code === "permission-denied",
    );

    await setRoomEventStatus.run(call(ownerUid, {
      eventId: createdEventId,
      status: "live",
    }));
    await setRoomEventStatus.run(call(ownerUid, {
      eventId: createdEventId,
      status: "completed",
    }));
    const completed = await eventRef.collection("attendees").doc(memberUid).get();
    assert.equal(completed.exists, true);
    assert.equal((await eventRef.get()).data().status, "completed");
  } finally {
    if (createdEventId) await db.recursiveDelete(db.collection("roomEvents").doc(createdEventId)).catch(() => undefined);
    await db.recursiveDelete(roomRef).catch(() => undefined);
    await Promise.all([ownerRef, memberRef, minorRef].map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
  }
});
