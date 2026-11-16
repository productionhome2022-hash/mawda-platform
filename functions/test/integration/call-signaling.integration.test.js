const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const {
  startCall, respondToCall, sendCallSignal, getCallSignals, endCall, getActiveCall,
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
    await Promise.all([callerRef, calleeRef, outsiderRef, chatRef]
      .map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
  }
});
