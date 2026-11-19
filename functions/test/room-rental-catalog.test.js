const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRoomRentalPlans } = require("../lib/room-rental");

test("room rental catalogue accepts an explicitly empty owner catalogue", () => {
  assert.deepEqual(validateRoomRentalPlans([]), []);
});

test("room rental catalogue rejects malformed and oversized owner catalogues", () => {
  assert.throws(() => validateRoomRentalPlans(null), /INVALID_ROOM_RENTAL_PLANS/);
  assert.throws(() => validateRoomRentalPlans(Array.from({ length: 13 }, (_, i) => ({
    planId: `room_${i}`, name: "Room plan", durationDays: 30, priceCoins: 100, active: true,
  }))), /INVALID_ROOM_RENTAL_PLANS/);
});
