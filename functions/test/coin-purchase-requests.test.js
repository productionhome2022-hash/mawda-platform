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
  }).agreedPriceMinor, 999);
  assert.equal(validateOwnerPaymentInstructionInput({
    requestId: "request_124", instructions: "Owner selected Egyptian pound terms",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "EGP",
    expectedInstructionsVersion: 1,
  }).currencyExponent, 2);
  assert.equal(validateOwnerPaymentInstructionInput({
    requestId: "request_125", instructions: "Owner selected Syrian pound terms",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "SYP",
    expectedInstructionsVersion: 0,
  }).currencyExponent, 2);
  assert.throws(() => validateOwnerPaymentInstructionInput({
    requestId: "request_123", instructions: "ok",
    agreedCoins: 1000, agreedPriceMinor: 999, currency: "EUR",
    expectedInstructionsVersion: 0,
  }), /INVALID_INSTRUCTIONS/);
  for (const currency of ["EUR", "USD", "EGP", "SAR", "SYP", "AED", "DZD", "MAD", "TRY"]) {
    assert.equal(validateOwnerPaymentInstructionInput({
      requestId: "request_126", instructions: "Owner selected official currency",
      agreedCoins: 1000, agreedPriceMinor: 999, currency,
      expectedInstructionsVersion: 0,
    }).currencyExponent, 2);
  }
  for (const currency of ["JOD", "IQD"]) {
    assert.equal(validateOwnerPaymentInstructionInput({
      requestId: "request_128", instructions: "Owner selected three-decimal currency",
      agreedCoins: 1000, agreedPriceMinor: 999, currency,
      expectedInstructionsVersion: 0,
    }).currencyExponent, 3);
  }
  for (const currency of ["CHF", "KWD", "JPY", "XXX"]) {
    assert.throws(() => validateOwnerPaymentInstructionInput({
      requestId: "request_127", instructions: "Unsupported currency must fail",
      agreedCoins: 1000, agreedPriceMinor: 999, currency,
      expectedInstructionsVersion: 0,
    }), /INVALID_INSTRUCTIONS/);
  }
  assert.throws(() => validateOwnerPaymentInstructionInput({
    requestId: "request_123", instructions: "Valid enough instructions",
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
