import { FieldValue, type DocumentReference, type DocumentSnapshot, type Timestamp, type Transaction } from "firebase-admin/firestore";

export type MemberWalletCreditInput = {
  transaction: Transaction;
  userRef: DocumentReference;
  ledgerRef: DocumentReference;
  userSnapshot: DocumentSnapshot;
  ledgerSnapshot: DocumentSnapshot;
  amount: number;
  type: string;
  reason: string;
  requestId: string;
  createdAt: Timestamp;
  userUpdates?: Record<string, unknown>;
};

/**
 * Shared atomic wallet-credit primitive. The caller must read both snapshots
 * in the same Firestore transaction before invoking this function.
 * Every credit writes the balance and immutable ledger entry together.
 */
export function creditMemberWalletInTransaction(input: MemberWalletCreditInput): {
  balanceBefore: number;
  balanceAfter: number;
} {
  const { transaction, userRef, ledgerRef, userSnapshot, ledgerSnapshot } = input;
  if (!userSnapshot.exists) throw new Error("WALLET_CREDIT_MEMBER_MISSING");
  if (ledgerSnapshot.exists) throw new Error("WALLET_CREDIT_IDEMPOTENCY_CONFLICT");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0 ||
      !/^[A-Za-z0-9_-]{8,128}$/.test(input.requestId) ||
      !/^[a-z][a-z0-9_]{2,63}$/.test(input.type) ||
      !/^[a-z][a-z0-9_]{2,100}$/.test(input.reason)) {
    throw new Error("WALLET_CREDIT_INPUT_INVALID");
  }
  const balance = userSnapshot.data()?.coins;
  if (!Number.isSafeInteger(balance) || (balance as number) < 0) {
    throw new Error("WALLET_CREDIT_BALANCE_INVALID");
  }
  const nextBalance = (balance as number) + input.amount;
  if (!Number.isSafeInteger(nextBalance)) throw new Error("WALLET_CREDIT_AMOUNT_OUT_OF_RANGE");

  transaction.update(userRef, {
    coins: nextBalance,
    walletUpdatedAt: FieldValue.serverTimestamp(),
    ...(input.userUpdates ?? {}),
  });
  transaction.create(ledgerRef, {
    type: input.type,
    direction: "credit",
    amount: input.amount,
    reason: input.reason,
    requestId: input.requestId,
    idempotencyKey: input.requestId,
    balanceBefore: balance,
    balanceAfter: nextBalance,
    createdAt: input.createdAt,
  });
  return { balanceBefore: balance as number, balanceAfter: nextBalance };
}
