const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { transferCoins, sendDirectMessage, getDirectMessages, setMemberBlock } = require("../../lib/index");

const db = getFirestore();
const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

test("seeded Mawdda member personas can transact with each other inside the isolated lab", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  const [senderProfile, recipientProfile] = await Promise.all([
    db.collection("testAccountProfiles").doc("email-member").get(),
    db.collection("testAccountProfiles").doc("counterparty-member").get(),
  ]);
  assert.ok(senderProfile.exists, "email-member fixture must be provisioned first");
  assert.ok(recipientProfile.exists, "counterparty-member fixture must be provisioned first");
  const senderUid = senderProfile.data().uid;
  const recipientUid = recipientProfile.data().uid;
  assert.ok(senderUid && recipientUid && senderUid !== recipientUid);

  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const settingsRef = db.doc("platformSettings/coinTransfers");
  const previousSettings = await settingsRef.get();
  const previousSettingsData = previousSettings.exists ? previousSettings.data() : null;
  const senderBefore = (await senderRef.get()).data();
  const recipientBefore = (await recipientRef.get()).data();
  const [senderAuth, recipientAuth] = await Promise.all([
    getAuth().getUser(senderUid), getAuth().getUser(recipientUid),
  ]);
  assert.equal(senderBefore.isTestAccount, true);
  assert.equal(recipientBefore.isTestAccount, true);
  assert.equal(senderBefore.testPersonaId, "email-member");
  assert.equal(recipientBefore.testPersonaId, "counterparty-member");
  assert.equal(senderAuth.emailVerified, true);
  assert.equal(recipientAuth.emailVerified, true);
  assert.equal((senderProfile.data().profile.walletFixture).coins, senderBefore.coins);
  assert.equal((recipientProfile.data().profile.walletFixture).coins, recipientBefore.coins);

  const tag = suffix();
  const requestId = `persona_transfer_${tag}`;
  const transferId = `${senderUid}_${requestId}`;
  const senderLedgerRef = senderRef.collection("walletLedger").doc(transferId);
  const recipientLedgerRef = recipientRef.collection("walletLedger").doc(transferId);
  const platformLedgerRef = db.collection("platformWalletLedger").doc(transferId);
  const transferRef = db.collection("coinTransfers").doc(transferId);
  const senderBalance = senderBefore.coins;
  const recipientBalance = recipientBefore.coins;
  let directChatId = "";

  await settingsRef.set({ enabled: true, commissionBps: 1000, version: 1 });
  try {
    const response = await transferCoins.run({
      data: {
        recipientUid,
        amount: 1000,
        requestId,
        expectedCommissionBps: 1000,
      },
      auth: {
        uid: senderUid,
        token: { firebase: { sign_in_provider: "password" } },
      },
    });
    assert.equal(response.grossAmount, 1000);
    assert.equal(response.commissionAmount, 100);
    assert.equal(response.netAmount, 900);
    assert.equal(response.idempotentReplay, false);

    const [senderAfter, recipientAfter, senderLedger, recipientLedger, platformLedger, transfer] =
      await Promise.all([
        senderRef.get(), recipientRef.get(), senderLedgerRef.get(),
        recipientLedgerRef.get(), platformLedgerRef.get(), transferRef.get(),
      ]);
    assert.equal(senderAfter.data().coins, senderBalance - 1000);
    assert.equal(recipientAfter.data().coins, recipientBalance + 900);
    assert.equal(senderLedger.data().recipientUid, recipientUid);
    assert.equal(senderLedger.data().commissionAmount, 100);
    assert.equal(recipientLedger.data().senderUid, senderUid);
    assert.equal(recipientLedger.data().amount, 900);
    assert.equal(platformLedger.data().amount, 100);
    assert.equal(transfer.data().status, "completed");

    const replay = await transferCoins.run({
      data: { recipientUid, amount: 1000, requestId, expectedCommissionBps: 1000 },
      auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.equal(replay.idempotentReplay, true);
    assert.equal((await senderRef.get()).data().coins, senderBalance - 1000);
    assert.equal((await recipientRef.get()).data().coins, recipientBalance + 900);

    const directRequest = {
      data: {
        recipientUid,
        text: "اختبار محادثة مباشرة بين شخصيتي البريد والعضو المقابل",
        clientMessageId: `persona_dm_${tag}`,
      },
      auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
    };
    const direct = await sendDirectMessage.run(directRequest);
    directChatId = direct.chatId;
    assert.equal(direct.replayed, false);
    const directReplay = await sendDirectMessage.run(directRequest);
    assert.equal(directReplay.replayed, true);
    const inbox = await getDirectMessages.run({
      data: { chatId: direct.chatId },
      auth: { uid: recipientUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    assert.ok(inbox.messages.some((message) => message.messageId === direct.messageId &&
      message.text === "اختبار محادثة مباشرة بين شخصيتي البريد والعضو المقابل"));

    await setMemberBlock.run({
      data: { targetUid: recipientUid, blocked: true },
      auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
    });
    await assert.rejects(
      () => sendDirectMessage.run({
        data: { recipientUid, text: "رسالة بعد الحظر", clientMessageId: `blocked_dm_${tag}` },
        auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
      }),
      (error) => error && error.code === "permission-denied",
    );
    await setMemberBlock.run({
      data: { targetUid: recipientUid, blocked: false },
      auth: { uid: senderUid, token: { firebase: { sign_in_provider: "password" } } },
    });
  } finally {
    await Promise.all([
      senderRef.update({ coins: senderBalance, blockedUids: Array.isArray(senderBefore.blockedUids) ? senderBefore.blockedUids : [] }),
      recipientRef.update({ coins: recipientBalance }),
      senderLedgerRef.delete().catch(() => undefined),
      recipientLedgerRef.delete().catch(() => undefined),
      platformLedgerRef.delete().catch(() => undefined),
      transferRef.delete().catch(() => undefined),
      (async () => {
        if (directChatId) {
          const chatRef = db.collection("directChats").doc(directChatId);
          const messages = await chatRef.collection("messages").get();
          const batch = db.batch();
          messages.docs.forEach((doc) => batch.delete(doc.ref));
          batch.delete(chatRef);
          await batch.commit();
        }
        await recipientRef.collection("notifications").doc(
          require("node:crypto").createHash("sha256").update(senderUid + ":persona_dm_" + tag).digest("hex"),
        ).delete().catch(() => undefined);
      })(),
    ]);
    if (previousSettingsData) await settingsRef.set(previousSettingsData);
    else await settingsRef.delete().catch(() => undefined);
  }
});
