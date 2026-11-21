export type TransferBreakdown = {
  grossAmount: number;
  commissionBps: number;
  commissionAmount: number;
  netAmount: number;
};

export function calculateTransferBreakdown(
  grossAmount: number,
  commissionBps: number,
): TransferBreakdown {
  if (!Number.isSafeInteger(grossAmount) || grossAmount <= 0) {
    throw new Error("grossAmount must be a positive safe integer");
  }
  if (!Number.isSafeInteger(commissionBps) || commissionBps < 0 || commissionBps >= 10000) {
    throw new Error("commissionBps must be an integer from 0 to 9999");
  }

  const commissionAmount = Number(
    (BigInt(grossAmount) * BigInt(commissionBps)) / 10000n,
  );
  const netAmount = grossAmount - commissionAmount;
  if (netAmount <= 0) {
    throw new Error("netAmount must be greater than zero");
  }

  return { grossAmount, commissionBps, commissionAmount, netAmount };
}
