const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCoinPurchaseRequestInput,
  validateOwnerPaymentInstructionInput,
  validateExternalPaymentVerification,
  coinGiftPackageTermsMatch,
  coinGiftApprovalReplayMatches,
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

test("coin package gift agreement cannot change the selected package quantity or currency terms", () => {
  const snapshot = { coins: 1000, priceMinor: 1299, currency: "EUR", currencyExponent: 2 };
  const agreed = { agreedCoins: 1000, agreedPriceMinor: 1299, currency: "EUR", currencyExponent: 2 };
  assert.equal(coinGiftPackageTermsMatch(snapshot, agreed), true);
  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, coins: 2000 }, agreed), false);
  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, priceMinor: 999 }, agreed), false);
  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, currency: "USD" }, agreed), false);
  assert.equal(coinGiftPackageTermsMatch({ ...snapshot, currencyExponent: 3 }, agreed), false);
  assert.equal(coinGiftPackageTermsMatch(null, agreed), false);
});


test("approved coin-package gift replay requires matching gift, recipient history and notification projections", () => {
  const expected = {
    giftId: "sender_request_123", notificationId: "coin_package_gift_request_123",
    senderUid: "sender", recipientUid: "recipient", packageId: "coins_1000",
    requestId: "request_123", coins: 1000, priceMinor: 1299,
    currency: "EUR", currencyExponent: 2,
  };
  const gift = {
    giftId: expected.giftId, senderUid: expected.senderUid,
    recipientUid: expected.recipientUid, packageId: expected.packageId,
    purchaseRequestId: expected.requestId, status: "credited",
    coins: expected.coins, priceMinor: expected.priceMinor,
    currency: expected.currency, currencyExponent: expected.currencyExponent,
  };
  const history = {
    giftId: expected.giftId, senderUid: expected.senderUid,
    packageId: expected.packageId, purchaseRequestId: expected.requestId,
    coins: expected.coins, priceMinor: expected.priceMinor,
    currency: expected.currency, currencyExponent: expected.currencyExponent,
  };
  const notification = {
    notificationId: expected.notificationId,
    type: "coin_package_gift_received", senderUid: expected.senderUid,
  };
  assert.equal(coinGiftApprovalReplayMatches(gift, history, notification, expected), true);
  assert.equal(coinGiftApprovalReplayMatches(null, history, notification, expected), false);
  assert.equal(coinGiftApprovalReplayMatches(gift, { ...history, coins: 999 }, notification, expected), false);
  assert.equal(coinGiftApprovalReplayMatches(gift, history, { ...notification, type: "other" }, expected), false);
});
