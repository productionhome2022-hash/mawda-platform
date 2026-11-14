export type CoinPurchaseRequestKind = "package" | "custom";
export type CoinPurchaseRequestStatus =
  | "pending_owner_contact" | "payment_instructions_sent"
  | "awaiting_payment_verification" | "approved" | "rejected" | "withdrawn";

export function validateCoinPurchaseRequestInput(value: unknown): {
  requestId: string; kind: CoinPurchaseRequestKind; packageId?: string; requestedCoins?: number;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_REQUEST");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["requestId", "kind", "packageId", "requestedCoins"].includes(key))) throw new Error("INVALID_REQUEST");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }
  if (data.kind === "package") {
    if (typeof data.packageId !== "string" || !/^[a-z0-9][a-z0-9_-]{2,40}$/.test(data.packageId)) {
      throw new Error("INVALID_PACKAGE_ID");
    }
    return { requestId: data.requestId, kind: "package", packageId: data.packageId };
  }
  if (data.kind === "custom") {
    if (!Number.isSafeInteger(data.requestedCoins) ||
        (data.requestedCoins as number) < 1 || (data.requestedCoins as number) > 1000000000) {
      throw new Error("INVALID_CUSTOM_AMOUNT");
    }
    return { requestId: data.requestId, kind: "custom", requestedCoins: data.requestedCoins as number };
  }
  throw new Error("INVALID_REQUEST_KIND");
}

export function validateOwnerPaymentInstructionInput(value: unknown): {
  requestId: string; instructions: string; agreedCoins: number; agreedPriceMinor: number; currency: "EUR";
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_INSTRUCTIONS");
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["requestId", "instructions", "agreedCoins", "agreedPriceMinor", "currency"].includes(key))) throw new Error("INVALID_INSTRUCTIONS");
  if (typeof data.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(data.requestId) ||
      typeof data.instructions !== "string" || data.instructions.trim().length < 5 ||
      data.instructions.trim().length > 2000 ||
      !Number.isSafeInteger(data.agreedCoins) || (data.agreedCoins as number) < 1 ||
      (data.agreedCoins as number) > 1000000000 ||
      !Number.isSafeInteger(data.agreedPriceMinor) || (data.agreedPriceMinor as number) < 1 ||
      (data.agreedPriceMinor as number) > 100000000 || data.currency !== "EUR") {
    throw new Error("INVALID_INSTRUCTIONS");
  }
  return {
    requestId: data.requestId, instructions: data.instructions.trim(),
    agreedCoins: data.agreedCoins as number, agreedPriceMinor: data.agreedPriceMinor as number,
    currency: "EUR",
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
