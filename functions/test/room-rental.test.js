const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_ROOM_RENTAL_PLANS, roomRentalExpiry, calculateRoomRentalBalance, validateRoomRentalPlans } = require("../lib/room-rental");

test("room rental expiry returns an exact safe millisecond timestamp", () => {
  const now = 1_800_000_000_000;
  assert.equal(roomRentalExpiry(now, 30), now + 30 * 24 * 60 * 60 * 1000);
});

test("room rental expiry rejects timestamps that overflow the safe integer range", () => {
  assert.throws(
    () => roomRentalExpiry(Number.MAX_SAFE_INTEGER - 1, 1),
    { message: "INVALID_ROOM_RENTAL_EXPIRY" },
  );
});

test("room rental balance rejects malformed or insufficient coin balances", () => {
  assert.equal(calculateRoomRentalBalance(5000, 1000), 4000);
  assert.equal(calculateRoomRentalBalance(999, 1000), null);
  assert.equal(calculateRoomRentalBalance(Number.MAX_SAFE_INTEGER + 1, 1), null);
});

test("room rental plan validation rejects duplicate identifiers and unsafe prices", () => {
  const plan = { planId: "room_30d", name: "Room rental", durationDays: 30, priceCoins: 1000, active: true };
  assert.equal(validateRoomRentalPlans([plan]).length, 1);
  assert.throws(() => validateRoomRentalPlans([plan, plan]), { message: "INVALID_ROOM_RENTAL_PLAN_ID" });
  assert.throws(() => validateRoomRentalPlans([{ ...plan, priceCoins: Number.MAX_SAFE_INTEGER + 1 }]), {
    message: "INVALID_ROOM_RENTAL_PLAN_FIELDS",
  });
});

test("experimental room rental prices remain bounded, unique, and explicitly provisional", () => {
  assert.deepEqual(
    DEFAULT_ROOM_RENTAL_PLANS.map(({ planId, durationDays, priceCoins, active }) => ({
      planId, durationDays, priceCoins, active,
    })),
    [
      { planId: "room_30d", durationDays: 30, priceCoins: 1000, active: true },
      { planId: "room_90d", durationDays: 90, priceCoins: 2700, active: true },
      { planId: "room_180d", durationDays: 180, priceCoins: 5000, active: true },
      { planId: "room_365d", durationDays: 365, priceCoins: 9000, active: true },
    ],
  );
  assert.equal(validateRoomRentalPlans(DEFAULT_ROOM_RENTAL_PLANS).length, 4);
});


test("owner-configured room rental prices and durations accept safe custom terms", () => {
  const custom = [
    { planId: "room_trial_2d", name: "تجربة يومين", durationDays: 2, priceCoins: 125, active: true },
    { planId: "room_long_10y", name: "خطة طويلة", durationDays: 3650, priceCoins: 250000, active: false },
  ];
  assert.deepEqual(validateRoomRentalPlans(custom), custom);
  assert.throws(() => validateRoomRentalPlans([
    { ...custom[0], durationDays: 3651 },
  ]), { message: "INVALID_ROOM_RENTAL_PLAN_FIELDS" });
  assert.throws(() => validateRoomRentalPlans([
    { ...custom[0], priceCoins: 0 },
  ]), { message: "INVALID_ROOM_RENTAL_PLAN_FIELDS" });
});
