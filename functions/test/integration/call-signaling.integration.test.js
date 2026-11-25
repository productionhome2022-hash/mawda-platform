const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  startCall, respondToCall, markCallConnected, sendCallSignal, getCallSignals, endCall, getActiveCall, getCallIceConfiguration,
} = require("../../lib/index");

const db = getFirestore();
const CALL_USAGE_POLICY_REF = db.doc("platformSettings/callUsagePolicy");
const CALL_USAGE_POLICY_FIXTURE = {
  version: 1,
  policy: {
    active: true, quotaWindowMs: 24 * 60 * 60 * 1000,
    audioCallsPerWindow: 5, videoCallsPerWindow: 3,
    maxCallDurationMs: 5 * 60 * 1000,
  },
};
let previousCallUsagePolicy = null;
test.before(async () => {
  previousCallUsagePolicy = await CALL_USAGE_POLICY_REF.get();
  await CALL_USAGE_POLICY_REF.set(CALL_USAGE_POLICY_FIXTURE);
});
test.after(async () => {
  if (previousCallUsagePolicy?.exists) await CALL_USAGE_POLICY_REF.set(previousCallUsagePolicy.data());
  else await CALL_USAGE_POLICY_REF.delete();
});
async function grantCallEntitlements(memberUids) {
  const expiresAt = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const writes = [];
  for (const memberUid of memberUids) {
    for (const [itemId, category] of [
      ["voice_call_30d", "voice_call"],
      ["video_call_30d", "video_call"],
    ]) {
      writes.push(db.collection("users").doc(memberUid).collection("entitlements").doc(itemId).set({
        itemId, category, status: "active", expiresAt,
      }));
    }
  }
  await Promise.all(writes);
}
const call = (uid, data = {}) => ({ data, auth: { uid, token: {} } });
const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

test("direct call lifecycle enforces membership, callee acceptance, sequenced signaling and termination", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const callerUid = uid("call_caller");
  const calleeUid = uid("call_callee");
  const outsiderUid = uid("call_outsider");
  const chatId = uid("call_chat");
  const callId = uid("call_session");
  const callerRef = db.collection("users").doc(callerUid);
  const calleeRef = db.collection("users").doc(calleeUid);
  const outsiderRef = db.collection("users").doc(outsiderUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const callRef = db.collection("callSessions").doc(callId);

  await Promise.all([
    callerRef.set({ profileCompleted: true, accountStatus: "active", age: 29 }),
    calleeRef.set({ profileCompleted: true, accountStatus: "active", age: 31 }),
    outsiderRef.set({ profileCompleted: true, accountStatus: "active", age: 28 }),
    chatRef.set({ participantUids: [callerUid, calleeUid].sort() }),
  ]);
  await grantCallEntitlements([callerUid, calleeUid]);
  try {
    const started = await startCall.run(call(callerUid, {
      callId, scope: "direct", targetId: chatId, mode: "audio",
    }));
    assert.equal(started.status, "ringing");
    assert.equal((await getActiveCall.run(call(calleeUid))).active, true);
    const ice = await getCallIceConfiguration.run(call(callerUid, { callId }));
    assert.equal(ice.turnConfigured, false);
    assert.ok(ice.iceServers.some((server) => server.urls.includes("stun:stun.l.google.com:19302")));
    await assert.rejects(
      () => getCallIceConfiguration.run(call(outsiderUid, { callId })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: uid("call_overlap"), scope: "direct", targetId: chatId, mode: "audio",
      })),
      (error) => error && error.code === "resource-exhausted",
      "a member cannot be reserved into overlapping active calls",
    );

    await assert.rejects(
      () => sendCallSignal.run(call(outsiderUid, {
        callId, toUid: calleeUid, signal: { kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0 },
      })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => sendCallSignal.run(call(callerUid, {
        callId, toUid: calleeUid, signal: { kind: "answer", payload: JSON.stringify({ type: "answer", sdp: "v=0" }), sequence: 0 },
      })),
      (error) => error && error.code === "failed-precondition",
    );

    await sendCallSignal.run(call(callerUid, {
      callId, toUid: calleeUid, signal: { kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0 },
    }));
    await respondToCall.run(call(calleeUid, { callId, response: "accept" }));
    await sendCallSignal.run(call(calleeUid, {
      callId, toUid: callerUid, signal: { kind: "answer", payload: JSON.stringify({ type: "answer", sdp: "v=0" }), sequence: 0 },
    }));
    await sendCallSignal.run(call(calleeUid, {
      callId, toUid: callerUid, signal: { kind: "ice", payload: JSON.stringify({ candidate: "candidate:1" }), sequence: 1 },
    }));
    const received = await getCallSignals.run(call(callerUid, { callId, afterSequence: -1 }));
    assert.equal(received.status, "accepted");
    assert.deepEqual(received.signals.map((item) => item.kind), ["answer", "ice"]);
    assert.deepEqual(received.signals.map((item) => item.sequence), [0, 1]);

    await assert.rejects(
      () => sendCallSignal.run(call(calleeUid, {
        callId, toUid: callerUid, signal: { kind: "ice", payload: JSON.stringify({ candidate: "replay" }), sequence: 1 },
      })),
      (error) => error && error.code === "already-exists",
    );
    const ended = await endCall.run(call(calleeUid, { callId }));
    assert.equal(ended.status, "ended");
    assert.equal((await getActiveCall.run(call(callerUid))).active, false);
    await assert.rejects(
      () => sendCallSignal.run(call(callerUid, {
        callId, toUid: calleeUid, signal: { kind: "ice", payload: JSON.stringify({ candidate: "late" }), sequence: 1 },
      })),
      (error) => error && error.code === "permission-denied",
    );
  } finally {
    await db.recursiveDelete(callRef).catch(() => undefined);
    await Promise.all([
      callerRef, calleeRef, outsiderRef, chatRef,
      db.collection("activeCallMemberLocks").doc(callerUid),
      db.collection("activeCallMemberLocks").doc(calleeUid),
    ].map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
  }
});


test("room call signaling is peer-targeted and one member leaving does not end the room call", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const callerUid = uid("room_call_caller");
  const firstUid = uid("room_call_first");
  const secondUid = uid("room_call_second");
  const roomId = uid("room_call");
  const callId = uid("room_call_session");
  const roomRef = db.collection("rooms").doc(roomId);
  const rentalId = "rental_" + roomId;
  const rentalRef = db.collection("roomRentals").doc(rentalId);
  const memberRefs = [callerUid, firstUid, secondUid].map((memberUid) =>
    db.collection("users").doc(memberUid));
  const callRef = db.collection("callSessions").doc(callId);
  const roomExpiry = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
  await Promise.all([
    ...memberRefs.map((ref) => ref.set({
      profileCompleted: true, accountStatus: "active", age: 30,
    })),
    roomRef.set({
      roomId, name: "غرفة اختبار المكالمات", ownerUid: callerUid,
      kind: "private", audience: "adult", status: "active", capacity: 5,
      memberCount: 3, isRented: true, rentalId, expiresAt: roomExpiry,
    }),
    rentalRef.set({
      rentalId, roomId, ownerUid: callerUid, status: "active", expiresAt: roomExpiry,
    }),
    ...[callerUid, firstUid, secondUid].map((memberUid) =>
      roomRef.collection("members").doc(memberUid).set({ uid: memberUid, role: "member" })),
  ]);
  await grantCallEntitlements([callerUid, firstUid, secondUid]);
  try {
    const started = await startCall.run(call(callerUid, {
      callId, scope: "room", targetId: roomId, mode: "video",
    }));
    assert.equal(started.participantUids.length, 3);
    await sendCallSignal.run(call(callerUid, {
      callId, toUid: firstUid,
      signal: { kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0 },
    }));
    await sendCallSignal.run(call(callerUid, {
      callId, toUid: secondUid,
      signal: { kind: "offer", payload: JSON.stringify({ type: "offer", sdp: "v=0" }), sequence: 0 },
    }));
    await respondToCall.run(call(firstUid, { callId, response: "accept" }));
    await assert.rejects(
      () => sendCallSignal.run(call(firstUid, {
        callId, toUid: secondUid,
        signal: { kind: "ice", payload: JSON.stringify({ candidate: "candidate:2" }), sequence: 0 },
      })),
      (error) => error && error.code === "permission-denied",
      "an accepted peer cannot signal to a room participant who has not accepted yet",
    );
    await respondToCall.run(call(secondUid, { callId, response: "accept" }));
    const firstSignals = await getCallSignals.run(call(firstUid, { callId, afterSequence: -1 }));
    const secondSignals = await getCallSignals.run(call(secondUid, { callId, afterSequence: -1 }));
    assert.equal(firstSignals.signals.length, 1);
    assert.equal(firstSignals.signals[0].recipientUid, firstUid);
    assert.equal(secondSignals.signals.length, 1);
    assert.equal(secondSignals.signals[0].recipientUid, secondUid);

    await sendCallSignal.run(call(firstUid, {
      callId, toUid: callerUid,
      signal: { kind: "answer", payload: JSON.stringify({ type: "answer", sdp: "v=0" }), sequence: 0 },
    }));
    await sendCallSignal.run(call(secondUid, {
      callId, toUid: callerUid,
      signal: { kind: "answer", payload: JSON.stringify({ type: "answer", sdp: "v=0" }), sequence: 0 },
    }));
    const callerSignals = await getCallSignals.run(call(callerUid, { callId, afterSequence: -1 }));
    assert.equal(callerSignals.signals.length, 2);
    assert.deepEqual(new Set(callerSignals.signals.map((item) => item.senderUid)),
      new Set([firstUid, secondUid]));

    const left = await endCall.run(call(firstUid, { callId }));
    assert.equal(left.status, "accepted");
    assert.equal((await getActiveCall.run(call(firstUid))).active, false);
    assert.equal((await getActiveCall.run(call(secondUid))).active, true);
    assert.equal((await getActiveCall.run(call(callerUid))).active, true);
    await endCall.run(call(callerUid, { callId }));
    assert.equal((await getActiveCall.run(call(secondUid))).active, false);
  } finally {
    await db.recursiveDelete(callRef).catch(() => undefined);
    await db.recursiveDelete(roomRef).catch(() => undefined);
    await rentalRef.delete().catch(() => undefined);
    await Promise.all([
      ...memberRefs,
      ...[callerUid, firstUid, secondUid].map((memberUid) =>
        db.collection("activeCallMemberLocks").doc(memberUid)),
    ].map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
  }
});
 
test("group room calls fail closed for public rooms and missing or expired rentals", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const callerUid = uid("room_call_rental_guard");
  const roomId = uid("room_call_rental_guard_room");
  const callIds = [
    uid("public_room_call"), uid("missing_rental_call"),
    uid("inactive_rental_call"), uid("expired_rental_call"),
  ];
  const callerRef = db.collection("users").doc(callerUid);
  const roomRef = db.collection("rooms").doc(roomId);
  const rentalId = "rental_" + roomId;
  const rentalRef = db.collection("roomRentals").doc(rentalId);
  await Promise.all([
    callerRef.set({ profileCompleted: true, accountStatus: "active", age: 30 }),
    roomRef.set({
      roomId, ownerUid: callerUid, kind: "public", status: "active",
      isRented: false, capacity: 5,
    }),
    roomRef.collection("members").doc(callerUid).set({ uid: callerUid, role: "owner" }),
  ]);
  try {
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: callIds[0], scope: "room", targetId: roomId, mode: "audio",
      })),
      (error) => error && error.code === "failed-precondition",
    );

    const future = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
    await roomRef.update({
      kind: "private", isRented: true, rentalId, expiresAt: future,
    });
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: callIds[1], scope: "room", targetId: roomId, mode: "audio",
      })),
      (error) => error && error.code === "failed-precondition",
    );

    await rentalRef.set({
      rentalId, roomId, ownerUid: callerUid, status: "grace_period",
      expiresAt: future,
    });
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: callIds[2], scope: "room", targetId: roomId, mode: "audio",
      })),
      (error) => error && error.code === "failed-precondition",
    );

    await rentalRef.update({
      status: "active", expiresAt: Timestamp.fromMillis(Date.now() - 1000),
    });
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: callIds[2], scope: "room", targetId: roomId, mode: "audio",
      })),
      (error) => error && error.code === "failed-precondition",
    );

    for (const callId of callIds) {
      assert.equal((await db.collection("callSessions").doc(callId).get()).exists, false);
    }
  } finally {
    await Promise.all([
      callerRef.delete().catch(() => undefined),
      db.recursiveDelete(roomRef).catch(() => undefined),
      rentalRef.delete().catch(() => undefined),
    ]);
  }
});


test("expired ringing calls never expose stored signaling or ICE configuration", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const memberUid = uid("expired_call_member");
  const signalsCallId = uid("expired_signals_call");
  const iceCallId = uid("expired_ice_call");
  const expiredAt = Timestamp.fromMillis(Date.now() - 1000);
  const signalsCallRef = db.collection("callSessions").doc(signalsCallId);
  const iceCallRef = db.collection("callSessions").doc(iceCallId);

  await Promise.all([
    signalsCallRef.set({
      callId: signalsCallId, status: "ringing", callerUid: uid("expired_caller"),
      participantUids: [memberUid], acceptedUids: [], rejectedUids: [], leftUids: [],
      expiresAt: expiredAt,
    }),
    iceCallRef.set({
      callId: iceCallId, status: "ringing", callerUid: uid("expired_ice_caller"),
      participantUids: [memberUid], acceptedUids: [], rejectedUids: [], leftUids: [],
      expiresAt: expiredAt,
    }),
    signalsCallRef.collection("signals").doc("expired_signal_fixture").set({
      senderUid: uid("expired_sender"), recipientUid: memberUid, kind: "offer",
      payload: JSON.stringify({ type: "offer", sdp: "must-not-be-served" }),
      sequence: 0, createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 60_000),
    }),
  ]);

  try {
    const result = await getCallSignals.run(call(memberUid, { callId: signalsCallId }));
    assert.equal(result.status, "missed");
    assert.deepEqual(result.signals, []);
    assert.equal((await signalsCallRef.get()).data().status, "missed");

    await assert.rejects(
      () => getCallIceConfiguration.run(call(memberUid, { callId: iceCallId })),
      (error) => error && error.code === "deadline-exceeded",
      "expired ringing calls must not receive fresh ICE configuration",
    );
    assert.equal((await iceCallRef.get()).data().status, "missed");
  } finally {
    await Promise.all([
      db.recursiveDelete(signalsCallRef).catch(() => undefined),
      db.recursiveDelete(iceCallRef).catch(() => undefined),
    ]);
  }
});


test("server enforces rolling audio and video attempt quotas without charging retries", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const callerUid = uid("call_quota_caller");
  const calleeUid = uid("call_quota_callee");
  const chatId = uid("call_quota_chat");
  const firstCallId = uid("call_quota_first");
  const callerRef = db.collection("users").doc(callerUid);
  const calleeRef = db.collection("users").doc(calleeUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const quotaRef = db.collection("callQuotaWindows").doc(callerUid);
  const callRef = db.collection("callSessions").doc(firstCallId);
  const now = Date.now();

  await Promise.all([
    callerRef.set({ profileCompleted: true, accountStatus: "active", age: 29 }),
    calleeRef.set({ profileCompleted: true, accountStatus: "active", age: 31 }),
    chatRef.set({ participantUids: [callerUid, calleeUid].sort() }),
    quotaRef.set({
      attempts: [
        ...Array.from({ length: 4 }, (_, index) => ({
          callId: uid("prior_audio"),
          mode: "audio",
          startedAtMs: now - (index + 1) * 60_000,
        })),
        ...Array.from({ length: 3 }, (_, index) => ({
          callId: uid("prior_video"),
          mode: "video",
          startedAtMs: now - (index + 1) * 60_000,
        })),
        {
          callId: uid("expired_audio"),
          mode: "audio",
          startedAtMs: now - 24 * 60 * 60 * 1000 - 1,
        },
      ],
    }),
  ]);
  await grantCallEntitlements([callerUid, calleeUid]);

  try {
    const started = await startCall.run(call(callerUid, {
      callId: firstCallId, scope: "direct", targetId: chatId, mode: "audio",
    }));
    assert.equal(started.status, "ringing");
    const replay = await startCall.run(call(callerUid, {
      callId: firstCallId, scope: "direct", targetId: chatId, mode: "audio",
    }));
    assert.equal(replay.idempotentReplay, true);

    const afterStart = (await quotaRef.get()).data().attempts;
    assert.equal(afterStart.length, 8, "expired attempts are pruned and the idempotent replay is not charged twice");
    assert.equal(afterStart.filter((attempt) => attempt.mode === "audio").length, 5);
    assert.equal(afterStart.filter((attempt) => attempt.mode === "video").length, 3);

    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: uid("audio_over_limit"), scope: "direct", targetId: chatId, mode: "audio",
      })),
      (error) => error && error.code === "resource-exhausted",
      "a sixth audio attempt inside the rolling 24-hour window must be rejected",
    );

    await endCall.run(call(callerUid, { callId: firstCallId }));
    await assert.rejects(
      () => startCall.run(call(callerUid, {
        callId: uid("video_over_limit"), scope: "direct", targetId: chatId, mode: "video",
      })),
      (error) => error && error.code === "resource-exhausted",
      "a fourth video attempt inside the rolling 24-hour window must be rejected",
    );
  } finally {
    await Promise.all([
      db.recursiveDelete(callRef).catch(() => undefined),
      db.recursiveDelete(callerRef).catch(() => undefined),
      db.recursiveDelete(calleeRef).catch(() => undefined),
      db.recursiveDelete(chatRef).catch(() => undefined),
      db.recursiveDelete(quotaRef).catch(() => undefined),
      db.recursiveDelete(db.collection("activeCallMemberLocks").doc(callerUid)).catch(() => undefined),
      db.recursiveDelete(db.collection("activeCallMemberLocks").doc(calleeUid)).catch(() => undefined),
    ]);
  }
});


test("server starts a non-resettable five-minute call ceiling only after both endpoints report connected", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const callerUid = uid("call_timer_caller");
  const calleeUid = uid("call_timer_callee");
  const callId = uid("call_timer_session");
  const callRef = db.collection("callSessions").doc(callId);
  const callerLock = db.collection("activeCallMemberLocks").doc(callerUid);
  const calleeLock = db.collection("activeCallMemberLocks").doc(calleeUid);
  await callRef.set({
    callId, scope: "direct", status: "accepted", callerUid,
    participantUids: [callerUid, calleeUid], acceptedUids: [calleeUid],
    rejectedUids: [], leftUids: [], connectedUids: [],
    usagePolicySnapshot: CALL_USAGE_POLICY_FIXTURE.policy,
    usagePolicyVersion: CALL_USAGE_POLICY_FIXTURE.version,
  });
  await Promise.all([
    callerLock.set({ callId, status: "active" }),
    calleeLock.set({ callId, status: "active" }),
  ]);
  try {
    const callerReport = await markCallConnected.run(call(callerUid, { callId }));
    assert.equal(callerReport.connected, false);
    const calleeReport = await markCallConnected.run(call(calleeUid, { callId }));
    assert.equal(calleeReport.connected, true);
    assert.ok(calleeReport.maxDurationEndsAtMs - calleeReport.connectedAtMs === 5 * 60 * 1000);
    const replay = await markCallConnected.run(call(callerUid, { callId }));
    assert.equal(replay.idempotentReplay, true);
    assert.equal(replay.maxDurationEndsAtMs, calleeReport.maxDurationEndsAtMs);

    await callRef.update({
      maxDurationEndsAt: Timestamp.fromMillis(Date.now() - 1),
    });
    await assert.rejects(
      () => markCallConnected.run(call(calleeUid, { callId })),
      (error) => error && error.code === "deadline-exceeded",
      "a reconnect confirmation must not revive a call after its server deadline",
    );
    assert.equal((await getActiveCall.run(call(callerUid))).active, false);
    const ended = (await callRef.get()).data();
    assert.equal(ended.status, "ended");
    assert.equal(ended.endReason, "maximum_duration_reached");
    assert.equal((await callerLock.get()).exists, false);
    assert.equal((await calleeLock.get()).exists, false);
    await assert.rejects(
      () => markCallConnected.run(call(calleeUid, { callId })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all([
      db.recursiveDelete(callRef).catch(() => undefined),
      db.recursiveDelete(callerLock).catch(() => undefined),
      db.recursiveDelete(calleeLock).catch(() => undefined),
    ]);
  }
});


test("group audio follows room capacity and group video is capped at four total participants", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const fixtures = [];
  async function seedRoom(prefix, count, capacity) {
    const roomId = uid(prefix + "_room");
    const callId = uid(prefix + "_session");
    const ownerUid = uid(prefix + "_owner");
    const memberUids = [ownerUid, ...Array.from({ length: count - 1 }, () => uid(prefix + "_member"))];
    const rentalId = "rental_" + roomId;
    const roomRef = db.collection("rooms").doc(roomId);
    const rentalRef = db.collection("roomRentals").doc(rentalId);
    const callRef = db.collection("callSessions").doc(callId);
    const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
    await Promise.all([
      ...memberUids.map((memberUid) => db.collection("users").doc(memberUid).set({
        profileCompleted: true, accountStatus: "active", age: 30,
      })),
      roomRef.set({
        roomId, name: prefix, ownerUid, kind: "private", audience: "adult",
        status: "active", capacity, memberCount: count, isRented: true,
        rentalId, expiresAt,
      }),
      rentalRef.set({ rentalId, roomId, ownerUid, status: "active", expiresAt }),
      ...memberUids.map((memberUid) =>
        roomRef.collection("members").doc(memberUid).set({ uid: memberUid, role: "member" })),
    ]);
    await grantCallEntitlements(memberUids);
    const fixture = { roomId, callId, ownerUid, memberUids, roomRef, rentalRef, callRef };
    fixtures.push(fixture);
    return fixture;
  }

  try {
    for (const count of [2, 4, 7, 9]) {
      const audio = await seedRoom("group_audio_" + count, count, Math.max(5, count));
      const started = await startCall.run(call(audio.ownerUid, {
        callId: audio.callId, scope: "room", targetId: audio.roomId, mode: "audio",
      }));
      assert.equal(started.participantUids.length, count,
        "audio group size follows room capacity without an artificial fixed cap");
    }

    const audioOverCapacity = await seedRoom("group_audio_over_capacity", 8, 7);
    await assert.rejects(
      () => startCall.run(call(audioOverCapacity.ownerUid, {
        callId: audioOverCapacity.callId, scope: "room", targetId: audioOverCapacity.roomId, mode: "audio",
      })),
      (error) => error && error.code === "failed-precondition",
      "audio groups cannot exceed configured room capacity",
    );
    assert.equal((await audioOverCapacity.callRef.get()).exists, false);

    const videoFour = await seedRoom("group_video_four", 4, 5);
    const videoStarted = await startCall.run(call(videoFour.ownerUid, {
      callId: videoFour.callId, scope: "room", targetId: videoFour.roomId, mode: "video",
    }));
    assert.equal(videoStarted.participantUids.length, 4);

    const videoFive = await seedRoom("group_video_five", 5, 5);
    await assert.rejects(
      () => startCall.run(call(videoFive.ownerUid, {
        callId: videoFive.callId, scope: "room", targetId: videoFive.roomId, mode: "video",
      })),
      (error) => error && error.code === "failed-precondition",
      "video group calls reject the fifth participant including the initiator",
    );
    assert.equal((await videoFive.callRef.get()).exists, false);
  } finally {
    for (const fixture of fixtures) {
      await Promise.all([
        db.recursiveDelete(fixture.callRef).catch(() => undefined),
        db.recursiveDelete(fixture.roomRef).catch(() => undefined),
        fixture.rentalRef.delete().catch(() => undefined),
        ...fixture.memberUids.map((memberUid) => Promise.all([
          db.recursiveDelete(db.collection("users").doc(memberUid)).catch(() => undefined),
          db.collection("activeCallMemberLocks").doc(memberUid).delete().catch(() => undefined),
        ])),
      ]);
    }
  }
});
