const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRoomRentalPlans, roomRentalExpiry } = require("../lib/room-rental");

test("unconfigured room rental catalog is empty and disables paid room creation", () => {
  assert.deepEqual(validateRoomRentalPlans([]), []);
});

test("owner-authored room plans accept flexible durations rather than fixed commercial periods", () => {
  const plans = validateRoomRentalPlans([
    { planId: "room_2d", name: "Two days", durationDays: 2, priceCoins: 17, active: true },
    { planId: "room_45d", name: "Forty five days", durationDays: 45, priceCoins: 83, active: false },
    { planId: "room_400d", name: "Four hundred days", durationDays: 400, priceCoins: 1000, active: true },
  ]);
  assert.equal(plans.length, 3);
  assert.equal(plans[0].durationDays, 2);
  assert.equal(roomRentalExpiry(1000, plans[2].durationDays), 1000 + 400 * 86400000);
});

test("room plan validation still rejects malformed plans and commercial values", () => {
  assert.throws(() => validateRoomRentalPlans([
    { planId: "room_bad", name: "Bad", durationDays: 0, priceCoins: 1, active: true },
  ]), /INVALID_ROOM_RENTAL_PLAN_FIELDS/);
  assert.throws(() => validateRoomRentalPlans([
    { planId: "room_bad", name: "Bad", durationDays: 1, priceCoins: 1.5, active: true },
  ]), /INVALID_ROOM_RENTAL_PLAN_FIELDS/);
});
