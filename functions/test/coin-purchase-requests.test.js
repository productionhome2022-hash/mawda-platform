const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCoinPurchaseRequestInput,
  validateOwnerPaymentInstructionInput,
  validateExternalPaymentVerification,
} = require("../lib/coin-purchase-requests");

test("validates fixed package and custom coin requests without accepting client-set prices", () => {
  assert.deepEqual(validateCoinPurchaseRequestInput({
    requestId: "request_123", kind: "package", packageId: "coins_1000",
  }), { requestId: "request_123", kind: "package", packageId: "coins_1000" });
  assert.deepEqual(validateCoinPurchaseRequestInput({
    requestId: "request_456", kind: "custom", requestedCoins: 7500,
  }), { requestId: "request_456", kind: "custom", requestedCoins: 7500 });
  assert.throws(() => validateCoinPurchaseRequestInput({
    requestId: "request_456", kind: "custom", requestedCoins: 7500, priceMinor: 1,
  }), /INVALID_REQUEST/);
  assert.throws(() => validateCoinPurchaseRequestInput({
    requestId: "request_456", kind: "custom", requestedCoins: 0,
  }), /INVALID_CUSTOM_AMOUNT/);
});

test("owner payment instructions require bounded negotiated terms", () => {
  assert.equal(validateOwnerPaymentInstructionInput({
    requestId: "request_123", instructions: "تواصل مع المالك لإتمام التحويل",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "EUR",
    expectedInstructionsVersion: 0,
  }).expectedInstructionsVersion, 0);
  assert.throws(() => validateOwnerPaymentInstructionInput({
    requestId: "request_123", instructions: "ok",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "EUR",
  }), /INVALID_INSTRUCTIONS/);
  assert.throws(() => validateOwnerPaymentInstructionInput({
    requestId: "request_123", instructions: "تعليمات دفع صحيحة",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "EUR",
    expectedInstructionsVersion: -1,
  }), /INVALID_INSTRUCTIONS/);
});

test("coin approval requires owner-recorded external payment proof reference and note", () => {
  assert.equal(validateExternalPaymentVerification({
    requestId: "request_123", externalPaymentVerified: true,
    externalPaymentReference: "bank-ref-123", verificationNote: "تحقق المالك من وصول المبلغ",
  }).externalPaymentReference, "bank-ref-123");
  assert.throws(() => validateExternalPaymentVerification({
    requestId: "request_123", externalPaymentVerified: false,
    externalPaymentReference: "bank-ref-123", verificationNote: "تحقق",
  }), /INVALID_VERIFICATION/);
});

test("gifted coin packages accept only a bounded recipient UID on package requests", () => {
  assert.deepEqual(validateCoinPurchaseRequestInput({
    requestId: "gift_request_1", kind: "package", packageId: "coins_1000",
    giftRecipientUid: "member_recipient_123",
  }), {
    requestId: "gift_request_1", kind: "package", packageId: "coins_1000",
    giftRecipientUid: "member_recipient_123",
  });
  assert.throws(() => validateCoinPurchaseRequestInput({
    requestId: "gift_request_2", kind: "package", packageId: "coins_1000",
    giftRecipientUid: " member_recipient_123 ",
  }), /INVALID_GIFT_RECIPIENT/);
  assert.throws(() => validateCoinPurchaseRequestInput({
    requestId: "gift_request_3", kind: "custom", requestedCoins: 500,
    giftRecipientUid: "member_recipient_123",
  }), /CUSTOM_GIFT_NOT_SUPPORTED/);
  assert.throws(() => validateCoinPurchaseRequestInput({
    requestId: "gift_request_4", kind: "package", packageId: "coins_1000",
    giftRecipientUid: "x".repeat(129),
  }), /INVALID_GIFT_RECIPIENT/);
});


test("manual coin quotes accept supported owner-selected currencies with their ISO minor-unit exponent", () => {
  const kwd = validateOwnerPaymentInstructionInput({
    requestId: "request_kwd_1", instructions: "تحويل إلى حساب المالك",
    agreedCoins: 500, agreedPriceMinor: 1250, currency: "KWD",
    expectedInstructionsVersion: 0,
  });
  assert.equal(kwd.currency, "KWD");
  assert.equal(kwd.currencyExponent, 3);
  const jpy = validateOwnerPaymentInstructionInput({
    requestId: "request_jpy_1", instructions: "تحويل إلى حساب المالك",
    agreedCoins: 500, agreedPriceMinor: 2500, currency: "JPY",
    expectedInstructionsVersion: 0,
  });
  assert.equal(jpy.currencyExponent, 0);
  assert.throws(() => validateOwnerPaymentInstructionInput({
    requestId: "request_bad_currency", instructions: "تحويل إلى حساب المالك",
    agreedCoins: 500, agreedPriceMinor: 2500, currency: "XYZ",
    expectedInstructionsVersion: 0,
  }), /INVALID_INSTRUCTIONS/);
});
