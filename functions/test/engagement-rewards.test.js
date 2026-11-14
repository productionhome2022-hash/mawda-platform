const test = require("node:test");
const assert = require("node:assert/strict");
const {
  defaultAttendanceRewardPolicy,
  validateAttendanceRewardPolicy,
  utcRewardPeriod,
  validateTimedAdCampaignInput,
  eligibleHeartbeatDelta,
} = require("../lib/engagement-rewards");

test("attendance policy defaults closed and rejects malformed or unsafe reward amounts", () => {
  assert.deepEqual(defaultAttendanceRewardPolicy(), {
    hourly: { enabled: false, amountCoins: 0 },
    daily: { enabled: false, amountCoins: 0 },
    weekly: { enabled: false, amountCoins: 0 },
  });
  assert.deepEqual(validateAttendanceRewardPolicy({
    hourly: { enabled: true, amountCoins: 5 },
    daily: { enabled: false, amountCoins: 0 },
    weekly: { enabled: true, amountCoins: 25 },
  }).weekly, { enabled: true, amountCoins: 25 });
  assert.throws(() => validateAttendanceRewardPolicy({
    hourly: { enabled: true, amountCoins: 0 },
    daily: { enabled: false, amountCoins: 0 },
    weekly: { enabled: false, amountCoins: 0 },
  }), /ATTENDANCE_RULE_INVALID/);
  assert.throws(() => validateAttendanceRewardPolicy({
    hourly: { enabled: true, amountCoins: 1.5 },
    daily: { enabled: false, amountCoins: 0 },
    weekly: { enabled: false, amountCoins: 0 },
  }), /ATTENDANCE_RULE_INVALID/);
});

test("UTC hourly/daily periods and ISO week-year boundaries are deterministic", () => {
  const instant = Date.UTC(2026, 0, 1, 0, 5);
  assert.equal(utcRewardPeriod("hourly", instant), "20260101T00");
  assert.equal(utcRewardPeriod("daily", instant), "20260101");
  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 1, 12)), "2020-W53");
  assert.equal(utcRewardPeriod("weekly", Date.UTC(2021, 0, 4, 12)), "2021-W01");
  assert.equal(
    utcRewardPeriod("daily", Date.UTC(2026, 0, 1, 0)),
    utcRewardPeriod("daily", Date.UTC(2025, 11, 31, 19)),
  );
});

test("timed-ad campaign validation bounds duration, rewards, dates and budget", () => {
  const valid = {
    title: "Mawdda launch campaign",
    sponsorLabel: "Mawdda Partner",
    body: "A test-only sponsored message for the reward center.",
    placement: "reward_center",
    durationSeconds: 30,
    rewardCoins: 10,
    startsAtMs: 1000,
    endsAtMs: 100000,
    maxClaimsPerMember: 1,
    rewardBudgetCoins: 1000,
  };
  assert.equal(validateTimedAdCampaignInput(valid).rewardCoins, 10);
  assert.throws(() => validateTimedAdCampaignInput({ ...valid, durationSeconds: 5 }));
  assert.throws(() => validateTimedAdCampaignInput({ ...valid, rewardBudgetCoins: 9 }));
  assert.throws(() => validateTimedAdCampaignInput({ ...valid, endsAtMs: 1000 }));
});

test("timed-ad heartbeat credits only sequential, visible foreground intervals", () => {
  assert.deepEqual(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, true), {
    deltaMs: 5000, nextHeartbeatAtMs: 6000, nextSequence: 2, paused: false,
  });
  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, false, true).deltaMs, 0);
  assert.equal(eligibleHeartbeatDelta(1000, 6000, 1, 1, true, false).nextHeartbeatAtMs, null);
  assert.equal(eligibleHeartbeatDelta(1000, 30000, 1, 1, true, true).deltaMs, 0);
  assert.throws(() => eligibleHeartbeatDelta(1000, 6000, 2, 1, true, true), /SEQUENCE/);
  assert.throws(() => eligibleHeartbeatDelta(6000, 6000, 1, 1, true, true), /TIME/);
});
