const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  startCall, respondToCall, sendCallSignal, getCallSignals, endCall, getActiveCall, getCallIceConfiguration,
} = require("../../lib/index");

const db = getFirestore();
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
  const memberRefs = [callerUid, firstUid, secondUid].map((memberUid) =>
    db.collection("users").doc(memberUid));
  const callRef = db.collection("callSessions").doc(callId);
  await Promise.all([
    ...memberRefs.map((ref) => ref.set({
      profileCompleted: true, accountStatus: "active", age: 30,
    })),
    roomRef.set({
      roomId, name: "غرفة اختبار المكالمات", ownerUid: callerUid,
      kind: "public", audience: "adult", status: "active", capacity: 5,
      memberCount: 3,
    }),
    ...[callerUid, firstUid, secondUid].map((memberUid) =>
      roomRef.collection("members").doc(memberUid).set({ uid: memberUid, role: "member" })),
  ]);
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
    await Promise.all([
      ...memberRefs,
      ...[callerUid, firstUid, secondUid].map((memberUid) =>
        db.collection("activeCallMemberLocks").doc(memberUid)),
    ].map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
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
