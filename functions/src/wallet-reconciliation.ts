export type WalletReconciliationStatus = "consistent" | "mismatch" | "incomplete" | "corrupt";

export type WalletReconciliationEntry = {
  id: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAtMs?: number | null;
};

export type WalletReconciliationResult = {
  status: WalletReconciliationStatus;
  currentBalance: number;
  ledgerEntryCount: number;
  netLedgerDelta: number | null;
  openingBalance: number | null;
  computedBalance: number | null;
  entriesMissingSnapshots: number;
  anomalies: Array<{ entryId: string; code: string }>;
};

/**
 * Read-only ledger reconciliation. Legacy rows without balance snapshots are
 * reported as incomplete, never silently treated as verified. Snapshot rows
 * must reconcile amount arithmetic and continuous before/after balances.
 */
export function reconcileWalletLedger(
  currentBalanceInput: unknown,
  entriesInput: readonly WalletReconciliationEntry[],
): WalletReconciliationResult {
  if (!Number.isSafeInteger(currentBalanceInput) || (currentBalanceInput as number) < 0 ||
      !Array.isArray(entriesInput)) {
    throw new Error("WALLET_RECONCILIATION_INPUT_INVALID");
  }
  const currentBalance = currentBalanceInput as number;
  let netLedgerDelta = 0;
  let previousBalanceAfter: number | null = null;
  let openingBalance: number | null = null;
  let lastSnapshotBalance: number | null = null;
  let lastEntryHadSnapshot = false;
  let entriesMissingSnapshots = 0;
  const anomalies: Array<{ entryId: string; code: string }> = [];

  for (const entry of entriesInput) {
    if (!entry || typeof entry.id !== "string" || entry.id.length < 1 ||
        !Number.isSafeInteger(entry.amount)) {
      anomalies.push({ entryId: entry?.id ?? "unknown", code: "invalid_amount_or_identity" });
      continue;
    }
    netLedgerDelta += entry.amount;
    if (!Number.isSafeInteger(netLedgerDelta)) {
      anomalies.push({ entryId: entry.id, code: "net_delta_overflow" });
      continue;
    }
    const hasBefore = entry.balanceBefore !== undefined && entry.balanceBefore !== null;
    const hasAfter = entry.balanceAfter !== undefined && entry.balanceAfter !== null;
    if (!hasBefore && !hasAfter) {
      entriesMissingSnapshots += 1;
      previousBalanceAfter = null;
      lastEntryHadSnapshot = false;
      continue;
    }
    if (!hasBefore || !hasAfter ||
        !Number.isSafeInteger(entry.balanceBefore) || !Number.isSafeInteger(entry.balanceAfter) ||
        (entry.balanceBefore as number) < 0 || (entry.balanceAfter as number) < 0) {
      anomalies.push({ entryId: entry.id, code: "invalid_balance_snapshot" });
      previousBalanceAfter = null;
      lastEntryHadSnapshot = false;
      continue;
    }
    const before = entry.balanceBefore as number;
    const after = entry.balanceAfter as number;
    if (openingBalance === null && previousBalanceAfter === null) openingBalance = before;
    if (previousBalanceAfter !== null && before !== previousBalanceAfter) {
      anomalies.push({ entryId: entry.id, code: "balance_chain_discontinuity" });
    }
    if (!Number.isSafeInteger(before + entry.amount) || after !== before + entry.amount) {
      anomalies.push({ entryId: entry.id, code: "balance_arithmetic_mismatch" });
    }
    previousBalanceAfter = after;
    lastSnapshotBalance = after;
    lastEntryHadSnapshot = true;
  }

  let computedBalance: number | null = null;
  if (entriesInput.length === 0) {
    computedBalance = currentBalance === 0 ? 0 : null;
  } else if (lastEntryHadSnapshot) {
    computedBalance = lastSnapshotBalance;
  }

  let status: WalletReconciliationStatus;
  if (anomalies.length > 0) status = "corrupt";
  else if (entriesMissingSnapshots > 0 || computedBalance === null) status = "incomplete";
  else if (computedBalance !== currentBalance) status = "mismatch";
  else status = "consistent";

  return {
    status,
    currentBalance,
    ledgerEntryCount: entriesInput.length,
    netLedgerDelta: Number.isSafeInteger(netLedgerDelta) ? netLedgerDelta : null,
    openingBalance,
    computedBalance,
    entriesMissingSnapshots,
    anomalies,
  };
}
