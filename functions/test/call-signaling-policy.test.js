const test = require("node:test");
const assert = require("node:assert/strict");
const { isCallMemberBusyInSession } = require("../lib/call-signaling.js");

test("caller remains reserved while a call is ringing", () => {
  assert.equal(isCallMemberBusyInSession("caller", {
    callerUid: "caller", status: "ringing", acceptedUids: [],
  }), true);
});

test("pending room invitees are not reserved before they accept", () => {
  const pending = {
    callerUid: "caller", status: "ringing",
    acceptedUids: [], rejectedUids: [], leftUids: [],
  };
  assert.equal(isCallMemberBusyInSession("invitee", pending), false);
});

test("accepted room participants are reserved while other invitees remain pending", () => {
  const partiallyAccepted = {
    callerUid: "caller", status: "accepted",
    acceptedUids: ["accepted_member"], rejectedUids: [], leftUids: [],
  };
  assert.equal(isCallMemberBusyInSession("caller", partiallyAccepted), true);
  assert.equal(isCallMemberBusyInSession("accepted_member", partiallyAccepted), true);
  assert.equal(isCallMemberBusyInSession("pending_member", partiallyAccepted), false);
});

test("rejected or departed participants do not retain a reservation", () => {
  assert.equal(isCallMemberBusyInSession("member", {
    callerUid: "caller", status: "accepted", acceptedUids: ["member"],
    rejectedUids: ["member"], leftUids: [],
  }), false);
  assert.equal(isCallMemberBusyInSession("member", {
    callerUid: "caller", status: "accepted", acceptedUids: ["member"],
    rejectedUids: [], leftUids: ["member"],
  }), false);
});

test("terminal calls never reserve participants", () => {
  for (const status of ["rejected", "cancelled", "ended", "missed"]) {
    assert.equal(isCallMemberBusyInSession("caller", {
      callerUid: "caller", status, acceptedUids: [],
    }), false);
  }
});
