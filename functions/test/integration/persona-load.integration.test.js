"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { performance } = require("node:perf_hooks");
const { transferCoins, sendDirectMessage, getDirectMessages } = require("../../lib/index");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const db = getFirestore();
const auth = getAuth();
const fixturePath = process.env.MAWDDA_LOAD_FIXTURE || "mawdda-load-artifacts/personas.json";
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const personas = fixture.personas;
const BATCH_SIZE = 125;
const metrics = { createdUsers: 0, scenarios: [], personaCoverage: [] };

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return Number(sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)].toFixed(2));
}
async function inBatches(items, size, worker) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...await Promise.all(items.slice(i, i + size).map(worker)));
  }
  return results;
}
function callableAuth(uid) {
  return { uid, token: { firebase: { sign_in_provider: "password" }, email_verified: true } };
}

test("load-test fixture is emulator-only and contains 5000 unique synthetic personas", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  assert.equal(fixture.environment, "firebase-emulator-only");
  assert.equal(fixture.count, personas.length);
  assert.ok(personas.length >= 5000, "the full 5000-persona run is required");
  assert.equal(new Set(personas.map((p) => p.personaId)).size, personas.length);
  assert.ok(personas.every((p) => p.testOnly === true && p.email.endsWith("@test.mawdda.invalid")));
});

test("provision 500 emulator-only identities and synthetic member profiles", async () => {
  await inBatches(personas, 25, async (persona) => {
    const user = await auth.createUser({
      email: persona.email,
      password: `Load!-${persona.personaId}-Only-Emulator-2026`,
      emailVerified: true,
      displayName: persona.displayName
    });
    persona.uid = user.uid;
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: persona.email,
      memberId: user.uid,
      displayName: persona.displayName,
      fullName: persona.displayName,
      username: persona.username,
      emailVerified: true,
      coins: 10000,
      profileCompleted: true,
      accountStatus: "active",
      age: persona.age,
      gender: persona.gender,
      country: persona.country,
      region: persona.region,
      profession: persona.profession,
      bio: persona.biography,
      interests: persona.interests,
      profileVisibility: "public",
      isTestAccount: true,
      testPersonaId: persona.personaId,
      loadTestRun: fixture.generatedAt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    await db.collection("testAccountProfiles").doc(persona.personaId).set({
      schemaVersion: 1,
      personaId: persona.personaId,
      uid: user.uid,
      displayName: persona.displayName,
      accountKind: "load-test-email",
      capabilities: ["profile.readWrite", "discovery.browse", "chat.direct", "wallet.transfer"],
      deniedCapabilities: ["owner.console", "productionOwnerMutation"],
      profile: {
        uniqueHandle: persona.username,
        biography: persona.biography,
        country: persona.country,
        region: persona.region,
        age: persona.age,
        gender: persona.gender,
        profession: persona.profession,
        interests: persona.interests,
        profileVisibility: "public",
        accountState: "active-test-only",
        badgesAndTitles: [],
        shopEntitlements: [],
        walletFixture: { coins: 10000, mode: "sandbox" },
        testLabels: ["MAWDDA_TEST_ONLY", "LOAD_TEST", persona.personaId]
      },
      environment: { projectId: process.env.GCLOUD_PROJECT, emulatorOnly: true },
      updatedAt: FieldValue.serverTimestamp()
    });
  });
  metrics.createdUsers = personas.length;
  console.log(`[persona-load] provisioned=${metrics.createdUsers}`);
});

for (const count of [500, 1000, 2500, 5000]) {
  test(`${count} synthetic personas concurrently transfer coins and exchange direct messages`, async () => {
    const cohort = personas.slice(0, count);
    // Each tier starts from a clean sandbox wallet state so results are comparable.
    await inBatches(cohort, BATCH_SIZE, async (persona) => {
      const userRef = db.collection("users").doc(persona.uid);
      const ledger = await userRef.collection("walletLedger").get();
      const batch = db.batch();
      ledger.docs.forEach((doc) => batch.delete(doc.ref));
      batch.update(userRef, { coins: 10000 });
      await batch.commit();
    });
    const settingsRef = db.doc("platformSettings/coinTransfers");
    const previous = await settingsRef.get();
    const previousData = previous.exists ? previous.data() : null;
    await settingsRef.set({ enabled: true, commissionBps: 1000, version: 1 });
    const pairs = [];
    for (let i = 0; i < cohort.length; i += 2) pairs.push([cohort[i], cohort[i + 1]]);
    const personaIdByUid = new Map(cohort.map((persona) => [persona.uid, persona.personaId]));
    const personaCoverage = new Map(cohort.map((persona) => [persona.personaId, {
      personaId: persona.personaId,
      uid: persona.uid,
      walletTransferCompleted: false,
      walletLedgerReconciled: false,
      directMessagesSent: 0,
      directMessagesReceived: 0
    }]));
    const transferTimes = [];
    const messageTimes = [];
    const receiveTimes = [];
    let transferErrors = 0;
    let messageErrors = 0;
    const started = performance.now();
    try {
      await inBatches(pairs, BATCH_SIZE, async ([sender, recipient], pairIndex) => {
        const requestId = `load_${count}_${sender.personaId}_${recipient.personaId}`;
        const transferStart = performance.now();
        try {
          const result = await transferCoins.run({
            data: { recipientUid: recipient.uid, amount: 100, requestId, expectedCommissionBps: 1000 },
            auth: callableAuth(sender.uid)
          });
          assert.equal(result.grossAmount, 100);
          assert.equal(result.commissionAmount, 10);
          assert.equal(result.netAmount, 90);
          assert.equal(result.idempotentReplay, false);
          personaCoverage.get(sender.personaId).walletTransferCompleted = true;
          personaCoverage.get(recipient.personaId).walletTransferCompleted = true;
          const replay = await transferCoins.run({
            data: { recipientUid: recipient.uid, amount: 100, requestId, expectedCommissionBps: 1000 },
            auth: callableAuth(sender.uid)
          });
          assert.equal(replay.idempotentReplay, true);
          transferTimes.push(performance.now() - transferStart);
        } catch (error) {
          transferErrors += 1;
          throw error;
        }
        const messageStart = performance.now();
        try {
          const message = await sendDirectMessage.run({
            data: {
              recipientUid: recipient.uid,
              text: `اختبار ضغط مودة ${count}: ${sender.personaId} إلى ${recipient.personaId}`,
              clientMessageId: `load_dm_${count}_${sender.personaId}_${recipient.personaId}`
            },
            auth: callableAuth(sender.uid)
          });
          assert.equal(message.replayed, false);
          messageTimes.push(performance.now() - messageStart);
          const receiveStart = performance.now();
          const inbox = await getDirectMessages.run({
            data: { chatId: message.chatId },
            auth: callableAuth(recipient.uid)
          });
          assert.ok(inbox.messages.some((item) => item.messageId === message.messageId),
            "the recipient must be able to read the delivered message");
          receiveTimes.push(performance.now() - receiveStart);
          personaCoverage.get(sender.personaId).directMessagesSent += 1;
          personaCoverage.get(recipient.personaId).directMessagesReceived += 1;

          const replyStart = performance.now();
          const reply = await sendDirectMessage.run({
            data: {
              recipientUid: sender.uid,
              text: `رد اختبار مودة ${count}: ${recipient.personaId} إلى ${sender.personaId}`,
              clientMessageId: `load_reply_${count}_${recipient.personaId}_${sender.personaId}`
            },
            auth: callableAuth(recipient.uid)
          });
          assert.equal(reply.replayed, false);
          messageTimes.push(performance.now() - replyStart);
          const replyReceiveStart = performance.now();
          const senderInbox = await getDirectMessages.run({
            data: { chatId: reply.chatId },
            auth: callableAuth(sender.uid)
          });
          assert.ok(senderInbox.messages.some((item) => item.messageId === reply.messageId),
            "the original sender must receive and read the peer reply");
          receiveTimes.push(performance.now() - replyReceiveStart);
          personaCoverage.get(recipient.personaId).directMessagesSent += 1;
          personaCoverage.get(sender.personaId).directMessagesReceived += 1;
        } catch (error) {
          messageErrors += 1;
          throw error;
        }
        return { pairIndex, chatId: null };
      });
      const elapsedMs = performance.now() - started;
      const allTransfers = await Promise.all(pairs.map(async ([sender, recipient]) => {
        const transferId = `${sender.uid}_load_${count}_${sender.personaId}_${recipient.personaId}`;
        const [senderDoc, recipientDoc, senderLedger, recipientLedger] = await Promise.all([
          db.collection("users").doc(sender.uid).get(),
          db.collection("users").doc(recipient.uid).get(),
          db.collection("users").doc(sender.uid).collection("walletLedger").doc(transferId).get(),
          db.collection("users").doc(recipient.uid).collection("walletLedger").doc(transferId).get()
        ]);
        return {
          senderUid: sender.uid,
          recipientUid: recipient.uid,
          senderBalance: senderDoc.data().coins,
          recipientBalance: recipientDoc.data().coins,
          senderLedger: senderLedger.exists,
          recipientLedger: recipientLedger.exists
        };
      }));
      assert.ok(allTransfers.every((x) => x.senderBalance === 9900 && x.recipientBalance === 10090 &&
        x.senderLedger && x.recipientLedger), "all paired wallet balances and ledgers must reconcile");
      assert.equal(transferErrors, 0);
      assert.equal(messageErrors, 0);
      for (const transfer of allTransfers) {
        personaCoverage.get(personaIdByUid.get(transfer.senderUid)).walletLedgerReconciled = transfer.senderLedger;
        personaCoverage.get(personaIdByUid.get(transfer.recipientUid)).walletLedgerReconciled = transfer.recipientLedger;
      }
      const coverageRows = cohort.map((persona) => personaCoverage.get(persona.personaId));
      assert.equal(coverageRows.length, count, "every persona must have a coverage record");
      assert.ok(coverageRows.every((row) => row.walletTransferCompleted &&
        row.walletLedgerReconciled &&
        row.directMessagesSent === 1 && row.directMessagesReceived === 1),
      "every persona must complete a transfer, reconcile its ledger role, and send/receive a direct message");
      if (count === 5000) metrics.personaCoverage = coverageRows;
      const scenario = {
        personas: count,
        pairs: pairs.length,
        transfers: pairs.length,
        idempotentReplays: pairs.length,
        directMessages: pairs.length * 2,
        receivedMessages: pairs.length * 2,
        personasWithCompleteCoverage: coverageRows.length,
        personaCoverageComplete: true,
        transferErrors,
        messageErrors,
        elapsedMs: Number(elapsedMs.toFixed(2)),
        throughputOperationsPerSecond: Number(((pairs.length * 6) / (elapsedMs / 1000)).toFixed(2)),
        transferLatencyMs: { p50: percentile(transferTimes, 0.50), p95: percentile(transferTimes, 0.95), max: Number(Math.max(...transferTimes).toFixed(2)) },
        messageLatencyMs: { p50: percentile(messageTimes, 0.50), p95: percentile(messageTimes, 0.95), max: Number(Math.max(...messageTimes).toFixed(2)) },
        receiveLatencyMs: { p50: percentile(receiveTimes, 0.50), p95: percentile(receiveTimes, 0.95), max: Number(Math.max(...receiveTimes).toFixed(2)) }
      };
      metrics.scenarios.push(scenario);
      console.log("[persona-load:metrics] " + JSON.stringify(scenario));
    } finally {
      if (previousData) await settingsRef.set(previousData);
      else await settingsRef.delete().catch(() => undefined);
    }
  });
}

test("emit machine-readable load-test report", () => {
  const reportPath = process.env.MAWDDA_LOAD_REPORT || "mawdda-load-artifacts/report.json";
  fs.mkdirSync(require("node:path").dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 1,
    environment: "firebase-emulator-only",
    generatedAt: new Date().toISOString(),
    provisionedPersonas: metrics.createdUsers,
    personaCoverageCount: metrics.personaCoverage.length,
    personaCoverage: metrics.personaCoverage,
    scenarios: metrics.scenarios
  }, null, 2) + "\n", { mode: 0o600 });
  console.log(`[persona-load] report=${reportPath}`);
});
