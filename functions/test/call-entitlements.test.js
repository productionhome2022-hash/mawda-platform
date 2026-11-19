const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CALL_ENTITLEMENT_ITEM_IDS,
  hasActiveCallEntitlement,
} = require("../lib/call-entitlements");

const now = 1_800_000_000_000;
const active = (itemId, category, expiresAt = now + 60_000) => ({
  itemId,
  data: { itemId, category, status: "active", expiresAt: new Date(expiresAt) },
});

test("audio and video calls require a matching active entitlement", () => {
  assert.equal(hasActiveCallEntitlement("audio", [active("voice_call_24h", "voice_call")], now), true);
  assert.equal(hasActiveCallEntitlement("video", [active("video_call_7d", "video_call")], now), true);
  assert.equal(hasActiveCallEntitlement("audio", [active("video_call_24h", "video_call")], now), false);
  assert.equal(hasActiveCallEntitlement("video", [active("voice_call_24h", "voice_call")], now), false);
});

test("call entitlement fails closed for expired, missing-expiry, inactive and forged records", () => {
  assert.equal(hasActiveCallEntitlement("audio", [active("voice_call_24h", "voice_call", now)], now), false);
  assert.equal(hasActiveCallEntitlement("audio", [{
    itemId: "voice_call_24h",
    data: { itemId: "voice_call_24h", category: "voice_call", status: "active" },
  }], now), false);
  assert.equal(hasActiveCallEntitlement("audio", [{
    itemId: "voice_call_24h",
    data: { itemId: "voice_call_24h", category: "voice_call", status: "revoked", expiresAt: new Date(now + 1000) },
  }], now), false);
  assert.equal(hasActiveCallEntitlement("audio", [{
    itemId: "voice_call_24h",
    data: { itemId: "video_call_24h", category: "voice_call", status: "active", expiresAt: new Date(now + 1000) },
  }], now), false);
});

test("all three owner-configured entitlement periods are recognized", () => {
  assert.deepEqual(CALL_ENTITLEMENT_ITEM_IDS.audio, ["voice_call_24h", "voice_call_7d", "voice_call_30d"]);
  assert.deepEqual(CALL_ENTITLEMENT_ITEM_IDS.video, ["video_call_24h", "video_call_7d", "video_call_30d"]);
  assert.equal(hasActiveCallEntitlement("audio", [active("voice_call_30d", "voice_call")], now), true);
  assert.equal(hasActiveCallEntitlement("video", [active("video_call_30d", "video_call")], now), true);
});
