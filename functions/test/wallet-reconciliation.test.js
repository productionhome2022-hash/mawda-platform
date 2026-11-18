const test = require("node:test");
const assert = require("node:assert/strict");
const { reconcileWalletLedger } = require("../lib/wallet-reconciliation");

test("reconciles a complete signed ledger with continuous balance snapshots", () => {
  const result = reconcileWalletLedger(125, [
    { id: "opening", amount: 100, balanceBefore: 0, balanceAfter: 100 },
    { id: "purchase", amount: -25, balanceBefore: 100, balanceAfter: 75 },
    { id: "reward", amount: 50, balanceBefore: 75, balanceAfter: 125 },
  ]);
  assert.equal(result.status, "consistent");
  assert.equal(result.openingBalance, 0);
  assert.equal(result.computedBalance, 125);
  assert.equal(result.netLedgerDelta, 125);
});

test("reports historical ledgers without balance snapshots as incomplete, not verified", () => {
  const result = reconcileWalletLedger(75, [
    { id: "legacy-credit", amount: 100 },
    { id: "new-debit", amount: -25, balanceBefore: 100, balanceAfter: 75 },
  ]);
  assert.equal(result.status, "incomplete");
  assert.equal(result.entriesMissingSnapshots, 1);
});

test("detects balance arithmetic, continuity and current-balance mismatches", () => {
  const arithmetic = reconcileWalletLedger(90, [
    { id: "a", amount: 100, balanceBefore: 0, balanceAfter: 90 },
  ]);
  assert.equal(arithmetic.status, "corrupt");
  assert.equal(arithmetic.anomalies[0].code, "balance_arithmetic_mismatch");
  const chain = reconcileWalletLedger(90, [
    { id: "a", amount: 100, balanceBefore: 0, balanceAfter: 100 },
    { id: "b", amount: -10, balanceBefore: 95, balanceAfter: 85 },
  ]);
  assert.equal(chain.status, "corrupt");
  assert.ok(chain.anomalies.some((item) => item.code === "balance_chain_discontinuity"));
  const mismatch = reconcileWalletLedger(91, [
    { id: "a", amount: 100, balanceBefore: 0, balanceAfter: 100 },
  ]);
  assert.equal(mismatch.status, "mismatch");
});

test("rejects unsafe current balances and invalid ledger amounts", () => {
  assert.throws(() => reconcileWalletLedger(-1, []));
  assert.equal(reconcileWalletLedger(0, [
    { id: "bad", amount: 1.5 },
  ]).status, "corrupt");
});
