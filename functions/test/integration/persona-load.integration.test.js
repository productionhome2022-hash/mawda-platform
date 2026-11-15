"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { performance } = require("node:perf_hooks");
const { transferCoins, sendDirectMessage, getDirectMessages } = require("../../lib/index");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const {
  getMemberProfile, setMemberProfileVisitorGreeting, setMemberPinnedProfileSection,
  setMemberCustomTitle, discoverMembers, joinRoom, createRoomEvent,
  listRoomEvents, rsvpRoomEvent, setRoomEventStatus, purchaseStoreItem, setStoreCatalogItem,
  setMemberBlock, registerPushToken, unregisterPushToken,
} = require("../../lib/index");
const { getAuth } = require("firebase-admin/auth");

const db = getFirestore();
const auth = getAuth();
const fixturePath = process.env.MAWDDA_LOAD_FIXTURE || "mawdda-load-artifacts/personas.json";
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const personas = fixture.personas;
const BATCH_SIZE = 125;
const metrics = { createdUsers: 0, scenarios: [], personaCoverage: [], lifecycleCoverage: [] };
const LIFECYCLE_REQUIRED_FIELDS = [
  "premiumEntitlementsProvisioned", "storePurchaseCompleted", "storeReceiptAndLedgerVerified",
  "greetingAndPinnedSectionUpdated", "peerProfileViewed", "profileAnalyticsVerified",
  "discoveryExecuted", "boostedDiscoveryVerified", "blockUnblockVerified",
  "pushTokenLifecycleVerified", "roomJoined", "eventListed", "eventRsvpConfirmed",
];

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
async function withTransientRetry(operation, maxAttempts = 4) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = error && (error.code ?? error.status);
      const transient = [4, 10, 14, "4", "10", "14", "deadline-exceeded", "aborted", "unavailable",
        "DEADLINE_EXCEEDED", "ABORTED", "UNAVAILABLE"].includes(code);
      if (!transient || attempt === maxAttempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150 * (2 ** attempt)));
    }
  }
  throw lastError;
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

test("provision all 5000 emulator-only identities and synthetic member profiles", async () => {
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
      capabilities: ["profile.readWrite", "discovery.browse", "chat.direct", "wallet.transfer", "premium.profile", "rooms.public.join", "rooms.events.rsvp"],
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


test("all 5000 personas complete a connected member, premium-profile, discovery, room and event lifecycle", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required");
  assert.equal(metrics.createdUsers, 5000, "the complete 5000-persona fixture must be provisioned first");

  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + 7 * 24 * 60 * 60 * 1000);
  const runTag = fixture.generatedAt.replace(/[^0-9]/g, "").slice(0, 14);
  const ROOM_COHORT_SIZE = 50;
  const roomGroups = [];
  for (let offset = 0; offset < personas.length; offset += ROOM_COHORT_SIZE) {
    const members = personas.slice(offset, offset + ROOM_COHORT_SIZE);
    roomGroups.push({
      roomId: "persona_lifecycle_" + runTag + "_" + String(roomGroups.length).padStart(3, "0"),
      members,
      owner: members[0],
      eventId: null,
    });
  }
  const roomGroupByPersona = new Map();
  const peerByUid = new Map();
  personas.forEach((persona, index) => {
    peerByUid.set(persona.uid, personas[index % 2 === 0 ? index + 1 : index - 1]);
  });
  roomGroups.forEach((group) => group.members.forEach((persona) => roomGroupByPersona.set(persona.uid, group)));
  const coverage = new Map(personas.map((persona) => [persona.personaId, {
    personaId: persona.personaId, uid: persona.uid,
    premiumEntitlementsProvisioned: false,
    storePurchaseCompleted: false,
    storeReceiptAndLedgerVerified: false,
    greetingAndPinnedSectionUpdated: false,
    peerProfileViewed: false,
    profileAnalyticsVerified: false,
    discoveryExecuted: false,
    boostedDiscoveryVerified: false,
    blockUnblockVerified: false,
    pushTokenLifecycleVerified: false,
    roomJoined: false,
    eventListed: false,
    eventRsvpConfirmed: false,
  }]));
  const recordLifecycleProgress = (stage) => {
    const rows = [...coverage.values()];
    metrics.lifecycleCoverage = rows;
    const stageCounts = Object.fromEntries(LIFECYCLE_REQUIRED_FIELDS.map((field) => [
      field, rows.filter((row) => row[field]).length,
    ]));
    console.log("[persona-lifecycle:progress] " + JSON.stringify({
      stage,
      personas: rows.length,
      completedRows: rows.filter((row) => LIFECYCLE_REQUIRED_FIELDS.every((field) => row[field])).length,
      stageCounts,
    }));
  };
  metrics.lifecycleCoverage = [...coverage.values()];

  try {
    // Publish one fulfillment-ready SKU only inside this emulator project.
    const storeOwnerUid = "persona-lifecycle-emulator-owner";
    await setStoreCatalogItem.run({
      data: {
        itemId: "vip_monthly", active: true, name: "VIP Test Membership",
        description: "Emulator-only VIP purchase used by the 5000-persona lifecycle test.",
        category: "vip", priceCoins: 100, durationDays: 30, sortOrder: 1,
        purchaseEnabled: true, fulfillmentReady: true,
      },
      auth: {
        uid: storeOwnerUid,
        token: {
          platformOwner: true, platformOwnerUid: storeOwnerUid,
          auth_time: Math.floor(Date.now() / 1000),
          firebase: { sign_in_provider: "custom", sign_in_second_factor: "phone" },
        },
      },
    });

    // Sandbox entitlement fixtures for profile capabilities not purchased here.
    await inBatches(personas, 25, async (persona) => {
      const userRef = db.collection("users").doc(persona.uid);
      const entitlementIds = [
        ["title_custom", "title"],
        ["profile_analytics_30d", "analytics"], ["profile_pin_30d", "profile_layout"],
        ["visitor_greeting_30d", "greeting"], ["discovery_boost_7d", "boost"],
      ];
      const batch = db.batch();
      for (const [itemId, category] of entitlementIds) {
        batch.set(userRef.collection("entitlements").doc(itemId), {
          itemId, itemName: "TEST_ONLY_" + itemId, category, status: "active",
          purchasedAt: Timestamp.fromMillis(now), expiresAt,
          testOnly: true, loadTestRun: fixture.generatedAt,
        });
      }
      batch.update(userRef, { profileVisibility: "public", profileCompleted: true, accountStatus: "active", discoveryBoostExpiresAt: expiresAt });
      await batch.commit();
      coverage.get(persona.personaId).premiumEntitlementsProvisioned = true;
    });
    recordLifecycleProgress("premium-entitlements-provisioned");

    // Every persona makes a real callable purchase in the emulator, replays
    // the same request, and reconciles the immutable receipt and wallet ledger.
    await inBatches(personas, 25, async (persona) => {
      const userRef = db.collection("users").doc(persona.uid);
      const before = (await userRef.get()).data().coins;
      const requestId = "persona_vip_" + persona.personaId;
      const request = { data: { itemId: "vip_monthly", requestId, expectedPriceCoins: 100 }, auth: callableAuth(persona.uid) };
      const purchase = await purchaseStoreItem.run(request);
      assert.equal(purchase.idempotentReplay, false);
      assert.equal(purchase.priceCoins, 100);
      const replay = await purchaseStoreItem.run(request);
      assert.equal(replay.idempotentReplay, true);
      const [after, receipt, ledger, entitlement] = await Promise.all([
        userRef.get(),
        db.collection("storePurchases").doc(purchase.purchaseId).get(),
        userRef.collection("walletLedger").doc("store_" + purchase.purchaseId).get(),
        userRef.collection("entitlements").doc("vip_monthly").get(),
      ]);
      assert.equal(after.data().coins, before - 100);
      assert.equal(receipt.data().status, "completed");
      assert.equal(receipt.data().priceCoins, 100);
      assert.equal(ledger.data().amount, -100);
      assert.equal(ledger.data().purchaseId, purchase.purchaseId);
      assert.equal(entitlement.data().status, "active");
      coverage.get(persona.personaId).storePurchaseCompleted = true;
      coverage.get(persona.personaId).storeReceiptAndLedgerVerified = true;
    });
    recordLifecycleProgress("store-purchase-and-ledger-verified");

    await inBatches(personas, 25, async (persona) => {
      const greeting = "مرحباً من " + persona.personaId;
      await setMemberProfileVisitorGreeting.run({ data: { greeting }, auth: callableAuth(persona.uid) });
      await setMemberPinnedProfileSection.run({ data: { section: "interests" }, auth: callableAuth(persona.uid) });
      const customTitle = "سفير " + persona.personaId.slice(0, 30);
      await setMemberCustomTitle.run({ data: { title: customTitle }, auth: callableAuth(persona.uid) });
      coverage.get(persona.personaId).greetingAndPinnedSectionUpdated = true;
    });
    recordLifecycleProgress("premium-profile-greeting-and-pin");

    // Run peer views only after every profile update has committed; this avoids
    // nondeterministic reads of a partner profile still being provisioned.
    await inBatches(personas, 25, async (persona) => {
      const peer = peerByUid.get(persona.uid);
      const viewed = await getMemberProfile.run({
        data: { userId: peer.uid }, auth: callableAuth(persona.uid),
      });
      assert.equal(viewed.uid, peer.uid);
      assert.equal(viewed.visitorGreeting, "مرحباً من " + peer.personaId);
      assert.equal(viewed.pinnedProfileSection, "interests");
      coverage.get(persona.personaId).peerProfileViewed = true;
    });
    recordLifecycleProgress("peer-profile-views");

    await inBatches(personas, 25, async (persona) => {
      const ownProfile = await getMemberProfile.run({
        data: { userId: persona.uid }, auth: callableAuth(persona.uid),
      });
      assert.equal(ownProfile.vipActive, true);
      assert.equal(ownProfile.activeTitle, "سفير " + persona.personaId.slice(0, 30));
      assert.equal(ownProfile.profileAnalytics.last7DaysViews, 1);
      coverage.get(persona.personaId).profileAnalyticsVerified = true;
    });
    recordLifecycleProgress("profile-analytics-verified");

    await inBatches(personas, 25, async (persona) => {
      const result = await discoverMembers.run({ data: {}, auth: callableAuth(persona.uid) });
      assert.ok(Array.isArray(result.members), "discovery must return a members array");
      assert.ok(result.members.length > 0, "discovery must return eligible peers");
      assert.ok(result.members.every((member) => member.isBoosted),
        "active discovery-boosted profiles must be marked as boosted");
      coverage.get(persona.personaId).discoveryExecuted = true;
      coverage.get(persona.personaId).boostedDiscoveryVerified = true;
    });
    recordLifecycleProgress("boosted-discovery-verified");

    // Exercise each member's block/unblock privacy control against their
    // deterministic peer, then register and deactivate one synthetic FCM token.
    await inBatches(personas, 25, async (persona) => {
      const peer = peerByUid.get(persona.uid);
      await setMemberBlock.run({
        data: { targetUid: peer.uid, blocked: true }, auth: callableAuth(persona.uid),
      });
      const blocked = (await db.collection("users").doc(persona.uid).get()).data().blockedUids || [];
      assert.ok(blocked.includes(peer.uid));
      await setMemberBlock.run({
        data: { targetUid: peer.uid, blocked: false }, auth: callableAuth(persona.uid),
      });
      const unblocked = (await db.collection("users").doc(persona.uid).get()).data().blockedUids || [];
      assert.ok(!unblocked.includes(peer.uid));
      coverage.get(persona.personaId).blockUnblockVerified = true;
    });
    recordLifecycleProgress("block-unblock-verified");

    await inBatches(personas, 25, async (persona) => {
      const token = "mawdda_test_fcm_token_" + persona.personaId + "_" + "x".repeat(180);
      const registered = await registerPushToken.run({
        data: { token, platform: "android" }, auth: callableAuth(persona.uid),
      });
      assert.equal(registered.registered, true);
      const removed = await unregisterPushToken.run({
        data: { token }, auth: callableAuth(persona.uid),
      });
      assert.equal(removed.registered, false);
      const tokenId = require("node:crypto").createHash("sha256").update(token).digest("hex");
      const saved = await db.collection("users").doc(persona.uid).collection("pushTokens").doc(tokenId).get();
      assert.equal(saved.data().active, false);
      coverage.get(persona.personaId).pushTokenLifecycleVerified = true;
    });
    recordLifecycleProgress("push-token-lifecycle-verified");

    await inBatches(roomGroups, 10, async (group) => {
      const roomRef = db.collection("rooms").doc(group.roomId);
      await roomRef.set({
        roomId: group.roomId, name: "Mawdda Persona Lifecycle " + group.roomId,
        kind: "public", audience: "all_ages", status: "active",
        ownerUid: group.owner.uid, capacity: 60, memberCount: 1,
        invitedUids: [], isTestAccount: true, loadTestRun: fixture.generatedAt,
      });
      await roomRef.collection("members").doc(group.owner.uid).set({
        uid: group.owner.uid, role: "owner",
      });
      coverage.get(group.owner.personaId).roomJoined = true;
    });

    // Keep contention bounded per room document: joinRoom atomically updates
    // memberCount, so a flat 25-way batch can lock 25 transactions on one room.
    await inBatches(roomGroups, 10, async (group) => {
      await inBatches(group.members.slice(1), 5, async (persona) => {
        await withTransientRetry(() => joinRoom.run({
          data: { roomId: group.roomId }, auth: callableAuth(persona.uid),
        }));
        coverage.get(persona.personaId).roomJoined = true;
      });
    });
    recordLifecycleProgress("all-personas-joined-rooms");

    await inBatches(roomGroups, 10, async (group) => {
      const created = await createRoomEvent.run({
        data: {
          roomId: group.roomId, title: "لقاء مجتمع مودة التجريبي",
          description: "حدث آلي لاختبار دورة حياة الشخصيات الاصطناعية.",
          eventType: "announcement", startsAtMs: Date.now() + 6 * 60 * 1000,
          durationMinutes: 240,
        },
        auth: callableAuth(group.owner.uid),
      });
      assert.equal(created.status, "scheduled");
      group.eventId = created.eventId;
    });
    recordLifecycleProgress("room-events-created");

    await inBatches(roomGroups, 10, async (group) => {
      // RSVP writes serialize on one event counter; cap concurrent requests
      // per event while still exercising ten independent rooms in parallel.
      await inBatches(group.members, 5, async (persona) => {
        const listed = await withTransientRetry(() => listRoomEvents.run({
          data: { roomId: group.roomId }, auth: callableAuth(persona.uid),
        }));
        assert.ok(listed.events.some((event) => event.eventId === group.eventId));
        coverage.get(persona.personaId).eventListed = true;
        await withTransientRetry(() => rsvpRoomEvent.run({
          data: { eventId: group.eventId }, auth: callableAuth(persona.uid),
        }));
        const verified = await withTransientRetry(() => listRoomEvents.run({
          data: { roomId: group.roomId }, auth: callableAuth(persona.uid),
        }));
        const ownEvent = verified.events.find((event) => event.eventId === group.eventId);
        assert.ok(ownEvent);
        assert.equal(ownEvent.isAttending, true);
        coverage.get(persona.personaId).eventRsvpConfirmed = true;
      });
    });
    recordLifecycleProgress("all-event-rsvps-confirmed");

    await inBatches(roomGroups, 10, async (group) => {
      await setRoomEventStatus.run({
        data: { eventId: group.eventId, status: "live" }, auth: callableAuth(group.owner.uid),
      });
      await setRoomEventStatus.run({
        data: { eventId: group.eventId, status: "completed" }, auth: callableAuth(group.owner.uid),
      });
      const finalEvent = await db.collection("roomEvents").doc(group.eventId).get();
      assert.equal(finalEvent.data().status, "completed");
    });
    recordLifecycleProgress("events-completed");

    const rows = [...coverage.values()];
    for (const field of LIFECYCLE_REQUIRED_FIELDS) {
      assert.equal(rows.filter((row) => row[field]).length, 5000,
        "all 5000 personas must complete " + field);
    }
    metrics.lifecycleCoverage = rows;
    console.log("[persona-lifecycle:coverage] " + JSON.stringify({
      personas: rows.length, stages: LIFECYCLE_REQUIRED_FIELDS,
      completedRows: rows.filter((row) => LIFECYCLE_REQUIRED_FIELDS.every((field) => row[field])).length,
      roomGroups: roomGroups.length,
      rooms: roomGroups.length,
      events: roomGroups.length,
    }));
  } finally {
    metrics.lifecycleCoverage = [...coverage.values()];
    const snapshot = metrics.lifecycleCoverage;
    const stageCounts = Object.fromEntries(LIFECYCLE_REQUIRED_FIELDS.map((field) => [
      field, snapshot.filter((row) => row[field]).length,
    ]));
    console.log("[persona-lifecycle:snapshot] " + JSON.stringify({
      personas: snapshot.length,
      completedRows: snapshot.filter((row) => LIFECYCLE_REQUIRED_FIELDS.every((field) => row[field])).length,
      stageCounts,
    }));
    await Promise.all(roomGroups.map(async (group) => {
      if (group.eventId) {
        await db.recursiveDelete(db.collection("roomEvents").doc(group.eventId)).catch(() => undefined);
      }
      await db.recursiveDelete(db.collection("rooms").doc(group.roomId)).catch(() => undefined);
    }));
  }
});

test("emit machine-readable load-test report", () => {
  const reportPath = process.env.MAWDDA_LOAD_REPORT || "mawdda-load-artifacts/report.json";
  const lifecycleRows = metrics.lifecycleCoverage;
  const lifecycleStageCounts = Object.fromEntries(LIFECYCLE_REQUIRED_FIELDS.map((field) => [
    field, lifecycleRows.filter((row) => row[field]).length,
  ]));
  const lifecycleCompletedPersonaCount = lifecycleRows.filter((row) =>
    LIFECYCLE_REQUIRED_FIELDS.every((field) => row[field])).length;
  fs.mkdirSync(require("node:path").dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 1,
    environment: "firebase-emulator-only",
    generatedAt: new Date().toISOString(),
    provisionedPersonas: metrics.createdUsers,
    personaCoverageCount: metrics.personaCoverage.length,
    personaCoverage: metrics.personaCoverage,
    lifecycleCoverageCount: lifecycleRows.length,
    lifecycleCompletedPersonaCount,
    lifecycleStageCounts,
    lifecycleCoverage: lifecycleRows,
    scenarios: metrics.scenarios
  }, null, 2) + "\n", { mode: 0o600 });
  console.log(`[persona-load] report=${reportPath}`);
});
