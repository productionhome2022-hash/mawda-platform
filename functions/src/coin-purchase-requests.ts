import { currencyExponentForCode } from "./economy-pricing";

export type CoinPurchaseRequestKind = "package" | "custom";
export type CoinPurchaseRequestStatus =
  | "pending_owner_contact" | "payment_instructions_sent"
  | "awaiting_payment_verification" | "approved" | "rejected" | "withdrawn";

export function validateCoinPurchaseRequestInput(value: unknown): {
  requestId: string; kind: CoinPurchaseRequestKind; packageId?: string; requestedCoins?: number; giftRecipientUid?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_REQUEST");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["requestId", "kind", "packageId", "requestedCoins", "giftRecipientUid"].includes(key))) throw new Error("INVALID_REQUEST");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }
  const giftRecipientUid = data.giftRecipientUid;
  if (giftRecipientUid !== undefined &&
      (typeof giftRecipientUid !== "string" || giftRecipientUid.trim() !== giftRecipientUid ||
       giftRecipientUid.length < 1 || giftRecipientUid.length > 128 ||
       giftRecipientUid.includes("/") || /[\u0000-\u001F\u007F]/.test(giftRecipientUid))) {
    throw new Error("INVALID_GIFT_RECIPIENT");
  }
  if (data.kind === "package") {
    if (typeof data.packageId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(data.packageId)) {
      throw new Error("INVALID_PACKAGE_ID");
    }
    return { requestId: data.requestId, kind: "package", packageId: data.packageId,
      ...(typeof giftRecipientUid === "string" ? { giftRecipientUid } : {}) };
  }
  if (giftRecipientUid !== undefined) throw new Error("CUSTOM_GIFT_NOT_SUPPORTED");
  if (data.kind === "custom") {
    if (!Number.isSafeInteger(data.requestedCoins) ||
        (data.requestedCoins as number) < 1 || (data.requestedCoins as number) > 1000000000) {
      throw new Error("INVALID_CUSTOM_AMOUNT");
    }
    return { requestId: data.requestId, kind: "custom", requestedCoins: data.requestedCoins as number };
  }
  throw new Error("INVALID_REQUEST_KIND");
}


export function coinGiftPackageTermsMatch(
  packageSnapshot: unknown,
  agreed: { agreedCoins: number; agreedPriceMinor: number; currency: string; currencyExponent: number },
): boolean {
  if (!packageSnapshot || typeof packageSnapshot !== "object" || Array.isArray(packageSnapshot)) return false;
  const snapshot = packageSnapshot as Record<string, unknown>;
  return Number.isSafeInteger(snapshot.coins) && snapshot.coins === agreed.agreedCoins &&
    Number.isSafeInteger(snapshot.priceMinor) && snapshot.priceMinor === agreed.agreedPriceMinor &&
    typeof snapshot.currency === "string" && snapshot.currency === agreed.currency &&
    Number.isSafeInteger(snapshot.currencyExponent) &&
    snapshot.currencyExponent === agreed.currencyExponent &&
    currencyExponentForCode(agreed.currency) === agreed.currencyExponent;
}

export function validateOwnerPaymentInstructionInput(value: unknown): {
  requestId: string; instructions: string; agreedCoins: number; agreedPriceMinor: number;
  currency: string; currencyExponent: number; expectedInstructionsVersion: number;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_INSTRUCTIONS");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["requestId", "instructions", "agreedCoins", "agreedPriceMinor", "currency", "expectedInstructionsVersion"].includes(key))) throw new Error("INVALID_INSTRUCTIONS");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId) ||
      typeof data.instructions !== "string" || data.instructions.trim().length < 5 ||
      data.instructions.trim().length > 2000 ||
      !Number.isSafeInteger(data.agreedCoins) || (data.agreedCoins as number) < 1 ||
      (data.agreedCoins as number) > 1000000000 ||
      !Number.isSafeInteger(data.agreedPriceMinor) || (data.agreedPriceMinor as number) < 1 ||
      (data.agreedPriceMinor as number) > 100000000 ||
      currencyExponentForCode(data.currency) === null ||
      !Number.isSafeInteger(data.expectedInstructionsVersion) ||
      (data.expectedInstructionsVersion as number) < 0) {
    throw new Error("INVALID_INSTRUCTIONS");
  }
  return {
    requestId: data.requestId, instructions: data.instructions.trim(),
    agreedCoins: data.agreedCoins as number, agreedPriceMinor: data.agreedPriceMinor as number,
    currency: data.currency as string,
    currencyExponent: currencyExponentForCode(data.currency) as number,
    expectedInstructionsVersion: data.expectedInstructionsVersion as number,
  };
}

export function validateExternalPaymentVerification(value: unknown): {
  requestId: string; externalPaymentReference: string; verificationNote: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_VERIFICATION");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["requestId", "externalPaymentVerified", "externalPaymentReference", "verificationNote"].includes(key))) throw new Error("INVALID_VERIFICATION");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId) ||
      data.externalPaymentVerified !== true ||
      typeof data.externalPaymentReference !== "string" ||
      data.externalPaymentReference.trim().length < 3 ||
      data.externalPaymentReference.trim().length > 120 ||
      typeof data.verificationNote !== "string" ||
      data.verificationNote.trim().length < 5 ||
      data.verificationNote.trim().length > 500) {
    throw new Error("INVALID_VERIFICATION");
  }
  return {
    requestId: data.requestId,
    externalPaymentReference: data.externalPaymentReference.trim(),
    verificationNote: data.verificationNote.trim(),
  };
}


/** Verify that an approved package-gift replay still has all immutable gift projections. */
export function coinGiftApprovalReplayMatches(
  giftValue: unknown,
  historyValue: unknown,
  notificationValue: unknown,
  expected: {
    giftId: string; notificationId: string; senderUid: string; recipientUid: string;
    packageId: string; requestId: string; coins: number; priceMinor: number;
    currency: string; currencyExponent: number;
  },
): boolean {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object" && !Array.isArray(value);
  if (!isRecord(giftValue) || !isRecord(historyValue) || !isRecord(notificationValue)) return false;
  return giftValue.giftId === expected.giftId &&
    giftValue.senderUid === expected.senderUid &&
    giftValue.recipientUid === expected.recipientUid &&
    giftValue.packageId === expected.packageId &&
    giftValue.purchaseRequestId === expected.requestId &&
    giftValue.status === "credited" &&
    giftValue.coins === expected.coins &&
    giftValue.priceMinor === expected.priceMinor &&
    giftValue.currency === expected.currency &&
    giftValue.currencyExponent === expected.currencyExponent &&
    historyValue.giftId === expected.giftId &&
    historyValue.senderUid === expected.senderUid &&
    historyValue.packageId === expected.packageId &&
    historyValue.purchaseRequestId === expected.requestId &&
    historyValue.coins === expected.coins &&
    historyValue.priceMinor === expected.priceMinor &&
    historyValue.currency === expected.currency &&
    historyValue.currencyExponent === expected.currencyExponent &&
    notificationValue.notificationId === expected.notificationId &&
    notificationValue.type === "coin_package_gift_received" &&
    notificationValue.senderUid === expected.senderUid;
}
