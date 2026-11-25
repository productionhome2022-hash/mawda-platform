const test = require("node:test");
const assert = require("node:assert/strict");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const {
  createCoinPurchaseRequest,
  getMyCoinPurchaseRequests,
  setCoinPurchasePaymentInstructions,
  requestCoinPurchasePaymentVerification,
  approveCoinPurchaseRequest,
} = require("../../lib/index");

const db = getFirestore();
const auth = getAuth();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const memberRequest = (uid, data) => ({
  data, auth: { uid, token: { firebase: { sign_in_provider: "password" } } },
});
const ownerRequest = (uid, data) => ({
  data, auth: { uid, token: {
    platformOwner: true, platformOwnerUid: uid,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_second_factor: "phone" },
  } },
});

test("fixed coin-package gifting verifies recipient, freezes terms and atomically credits recipient with replay integrity", async () => {
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const tag = suffix();
  const senderUid = `coin_gift_sender_${tag}`;
  const recipientUid = `coin_gift_recipient_${tag}`;
  const ownerUid = `coin_gift_owner_${tag}`;
  const requestId = `coin_gift_${tag}`;
  const requestRef = db.collection("coinPurchaseRequests").doc(`${senderUid}_${requestId}`);
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const settingsRef = db.doc("platformSettings/economyPricing");
  const ledgerRef = recipientRef.collection("walletLedger").doc(`coin_purchase_${requestId}`);
  const giftRef = db.collection("coinPackageGifts").doc(`${senderUid}_${requestId}`);
  const historyRef = recipientRef.collection("coinPackageGiftHistory").doc(requestId);
  const notificationRef = recipientRef.collection("notifications").doc(`coin_package_gift_${requestId}`);
  const approvalAuditRef = db.collection("adminAuditLogs").doc(`coin_purchase_approval_${senderUid}_${requestId}`);
  const reportAuditRef = db.collection("adminAuditLogs").doc(`coin_purchase_payment_report_${senderUid}_${requestId}_1`);
  let authUserCreated = false;
  let chatId = null;

  await Promise.all([
    senderRef.set({ coins: 75, profileCompleted: true, accountStatus: "active" }),
    recipientRef.set({ coins: 15, profileCompleted: true, accountStatus: "active" }),
    settingsRef.set({
      coinPackages: [{ packageId: "gift_test_pack", name: "Gift test package",
        coins: 900, priceMinor: 500, currency: "EUR", active: true }],
      adPrices: [{ placementId: "gift_test_ad", name: "Gift test ad",
        billingModel: "daily", priceMinor: 100, currency: "EUR", active: true }],
      manualCoinPurchasesEnabled: true, automatedCoinCheckoutEnabled: false, version: 7,
      paymentPolicy: {
        coin_purchases: { manualEnabled: true, automatedEnabled: false },
        featured_ads: { manualEnabled: false, automatedEnabled: false },
        public_ads: { manualEnabled: false, automatedEnabled: false },
        influencer_services: { manualEnabled: false, automatedEnabled: false },
        store_entitlements: { manualEnabled: false, automatedEnabled: false },
      },
    }),
  ]);
  try {
    await auth.createUser({ uid: recipientUid, email: `${recipientUid}@example.test`, password: "test-only-password-123" });
    authUserCreated = true;

    const member = memberRequest(senderUid, {
      requestId, kind: "package", packageId: "gift_test_pack", giftRecipientUid: recipientUid,
    });
    const created = await createCoinPurchaseRequest.run(member);
    assert.equal(created.status, "pending_owner_contact");
    assert.equal((await senderRef.get()).data().coins, 75);
    assert.equal((await recipientRef.get()).data().coins, 15);
    const stored = (await requestRef.get()).data();
    assert.equal(stored.giftRecipientUid, recipientUid);
    assert.equal(stored.packageSnapshot.coins, 900);
    assert.equal(stored.packageSnapshot.currency, "EUR");

    const historyBeforeApproval = await getMyCoinPurchaseRequests.run(member);
    assert.equal(historyBeforeApproval.requests[0].giftRecipientUid, recipientUid);

    await assert.rejects(
      () => setCoinPurchasePaymentInstructions.run(ownerRequest(ownerUid, {
        requesterUid: senderUid, requestId,
        instructions: "يرجى إتمام التحويل ثم إرسال مرجع الدفع",
        agreedCoins: 901, agreedPriceMinor: 500, currency: "EUR",
        expectedInstructionsVersion: 0,
      })),
      (error) => error && error.code === "failed-precondition",
    );

    const instructions = await setCoinPurchasePaymentInstructions.run(ownerRequest(ownerUid, {
      requesterUid: senderUid, requestId,
      instructions: "يرجى إتمام التحويل ثم إرسال مرجع الدفع",
      agreedCoins: 900, agreedPriceMinor: 500, currency: "EUR",
      expectedInstructionsVersion: 0,
    }));
    chatId = instructions.chatId;
    assert.equal((await requestRef.get()).data().status, "payment_instructions_sent");
    assert.equal((await recipientRef.get()).data().coins, 15);

    const reported = await requestCoinPurchasePaymentVerification.run(memberRequest(senderUid, {
      requestId, expectedInstructionsVersion: 1,
    }));
    assert.equal(reported.status, "awaiting_payment_verification");
    assert.equal((await senderRef.get()).data().coins, 75);
    assert.equal((await recipientRef.get()).data().coins, 15);

    const approvalInput = {
      requesterUid: senderUid, requestId, externalPaymentVerified: true,
      externalPaymentReference: `gift-payment-${tag}`,
      verificationNote: "تحقق المالك يدوياً من وصول مبلغ الباقة",
    };
    const approved = await approveCoinPurchaseRequest.run(ownerRequest(ownerUid, approvalInput));
    assert.equal(approved.status, "approved");
    assert.equal(approved.creditedToUid, recipientUid);
    assert.equal(approved.idempotentReplay, false);

    const [sender, recipient, ledger, gift, history, notification, audit] = await Promise.all([
      senderRef.get(), recipientRef.get(), ledgerRef.get(), giftRef.get(),
      historyRef.get(), notificationRef.get(), approvalAuditRef.get(),
    ]);
    assert.equal(sender.data().coins, 75);
    assert.equal(recipient.data().coins, 915);
    assert.equal(ledger.data().type, "coin_package_gift_credit");
    assert.equal(ledger.data().amount, 900);
    assert.equal(ledger.data().purchaserUid, senderUid);
    assert.equal(ledger.data().giftedByUid, senderUid);
    assert.equal(gift.data().recipientUid, recipientUid);
    assert.equal(gift.data().senderUid, senderUid);
    assert.equal(gift.data().status, "credited");
    assert.equal(history.data().coins, 900);
    assert.equal(notification.data().type, "coin_package_gift_received");
    assert.equal(audit.data().targetUid, recipientUid);

    const replay = await approveCoinPurchaseRequest.run(ownerRequest(ownerUid, approvalInput));
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await recipientRef.get()).data().coins, 915);

    await historyRef.delete();
    await assert.rejects(
      () => approveCoinPurchaseRequest.run(ownerRequest(ownerUid, approvalInput)),
      (error) => error && error.code === "failed-precondition",
    );
    assert.equal((await recipientRef.get()).data().coins, 915);
  } finally {
    await Promise.all([
      ledgerRef.delete().catch(() => undefined),
      giftRef.delete().catch(() => undefined),
      historyRef.delete().catch(() => undefined),
      notificationRef.delete().catch(() => undefined),
      approvalAuditRef.delete().catch(() => undefined),
      reportAuditRef.delete().catch(() => undefined),
      requestRef.delete().catch(() => undefined),
      senderRef.delete().catch(() => undefined),
      recipientRef.delete().catch(() => undefined),
      settingsRef.delete().catch(() => undefined),
      chatId ? db.recursiveDelete(db.collection("directChats").doc(chatId)).catch(() => undefined) : Promise.resolve(),
    ]);
    if (authUserCreated) await auth.deleteUser(recipientUid).catch(() => undefined);
  }
});
