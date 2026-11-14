const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  getMemberProfile,
  purchaseStoreItem,
  setMemberProfileVisitorGreeting,
  setMemberPinnedProfileSection,
  setMemberCustomTitle,
  discoverMembers,
} = require("../../lib/index");

const db = getFirestore();
const call = (uid, data = {}) => ({ data, auth: { uid, token: {} } });
const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function profile(age, extra = {}) {
  return {
    profileCompleted: true,
    accountStatus: "active",
    profileVisibility: "public",
    age,
    displayName: "Mawdda Test Member",
    username: "member_test",
    bio: "A test profile",
    profession: "Engineer",
    country: "Switzerland",
    region: "Zurich",
    gender: "unspecified",
    maritalStatus: "single",
    interests: ["reading", "music"],
    goals: [],
    ...extra,
  };
}

test("premium profile features enforce entitlements, count unique views, and rank boosts safely", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const viewerUid = uid("premium_viewer");
  const targetUid = uid("premium_target");
  const regularUid = uid("premium_regular");
  const minorUid = uid("premium_minor");
  const blockedUid = uid("premium_blocked");
  const now = Date.now();
  const future = Timestamp.fromMillis(now + 10 * 24 * 60 * 60 * 1000);
  const refs = [viewerUid, targetUid, regularUid, minorUid, blockedUid]
    .map((id) => db.collection("users").doc(id));
  const [viewerRef, targetRef, regularRef, minorRef, blockedRef] = refs;

  await Promise.all([
    viewerRef.set(profile(29)),
    targetRef.set(profile(31, {
      discoveryBoostExpiresAt: future,
      profileVisitorGreeting: "مرحباً بك في ملفي!",
      pinnedProfileSection: "interests",
    })),
    regularRef.set(profile(28)),
    minorRef.set(profile(17)),
    blockedRef.set(profile(30, { blockedUids: [viewerUid] })),
  ]);
  const profileEntitlements = [
    ["vip_monthly", "عضوية VIP", "vip"],
    ["title_custom", "لقب النخبة", "title"],
    ["badge_special", "وسام مودة", "badge"],
    ["avatar_frame_30d", "إطار مميز", "frame"],
    ["username_color_30d", "اسم ملون", "username_style"],
    ["username_animated_30d", "اسم متحرك", "username_style"],
    ["profile_analytics_30d", "تحليلات الملف", "analytics"],
    ["profile_layout_30d", "ملف احترافي", "profile_layout"],
    ["profile_pin_30d", "قسم مثبت", "profile_layout"],
    ["discovery_boost_7d", "ظهور معزز", "boost"],
    ["profile_theme_30d", "سمة مميزة", "theme"],
    ["visitor_greeting_30d", "ترحيب الزوار", "greeting"],
  ];
  await Promise.all(profileEntitlements.map(([itemId, itemName, category]) =>
    targetRef.collection("entitlements").doc(itemId).set({
      itemId,
      itemName,
      category,
      status: "active",
      purchasedAt: Timestamp.fromMillis(now),
      expiresAt: future,
    }),
  ));

  try {
    const firstView = await getMemberProfile.run(call(viewerUid, { userId: targetUid }));
    assert.equal(firstView.visitorGreeting, "مرحباً بك في ملفي!");
    assert.equal(firstView.pinnedProfileSection, "interests");
    assert.equal(firstView.discoveryBoostActive, true);

    await getMemberProfile.run(call(viewerUid, { userId: targetUid }));
    const ownerView = await getMemberProfile.run(call(targetUid, { userId: targetUid }));
    assert.equal(ownerView.profileAnalytics.last7DaysViews, 1);
    assert.equal(ownerView.vipActive, true);
    assert.equal(ownerView.activeTitle, "لقب النخبة");
    await setMemberCustomTitle.run(call(targetUid, { title: "سفير مودة" }));
    const customizedTitleView = await getMemberProfile.run(call(targetUid, { userId: targetUid }));
    assert.equal(customizedTitleView.activeTitle, "سفير مودة");
    await assert.rejects(
      () => setMemberCustomTitle.run(call(viewerUid, { title: "لقب غير مستحق" })),
      (error) => error && error.code === "failed-precondition",
    );
    await assert.rejects(
      () => setMemberCustomTitle.run(call(targetUid, { title: "x".repeat(41) })),
      (error) => error && error.code === "invalid-argument",
    );
    await targetRef.collection("entitlements").doc("title_custom").update({
      expiresAt: Timestamp.fromMillis(Date.now() - 1000),
    });
    const expiredTitleView = await getMemberProfile.run(call(targetUid, { userId: targetUid }));
    assert.equal(expiredTitleView.activeTitle, null);
    await assert.rejects(
      () => setMemberCustomTitle.run(call(targetUid, { title: "لقب منتهي" })),
      (error) => error && error.code === "failed-precondition",
    );
    assert.deepEqual(
      new Set(ownerView.activeFeatures.map((feature) => feature.itemId)),
      new Set(profileEntitlements.map(([itemId]) => itemId)),
    );

    await setMemberProfileVisitorGreeting.run(call(targetUid, { greeting: "أهلاً بك في مودة!" }));
    await setMemberPinnedProfileSection.run(call(targetUid, { section: "gallery" }));
    const updatedTarget = (await targetRef.get()).data();
    assert.equal(updatedTarget.profileVisitorGreeting, "أهلاً بك في مودة!");
    assert.equal(updatedTarget.pinnedProfileSection, "gallery");

    const discovery = await discoverMembers.run(call(viewerUid));
    const discovered = discovery.members;
    assert.ok(discovered.some((member) => member.uid === targetUid && member.isBoosted));
    assert.ok(!discovered.some((member) => member.uid === minorUid));
    assert.ok(!discovered.some((member) => member.uid === blockedUid));
    assert.ok(discovered.findIndex((member) => member.uid === targetUid) <
      discovered.findIndex((member) => member.uid === regularUid));

    await assert.rejects(
      () => getMemberProfile.run(call(minorUid, { userId: targetUid })),
      (error) => error && error.code === "permission-denied",
    );
    await assert.rejects(
      () => setMemberProfileVisitorGreeting.run(call(viewerUid, { greeting: "No entitlement" })),
      (error) => error && error.code === "failed-precondition",
    );
  } finally {
    await Promise.all(refs.map((ref) => db.recursiveDelete(ref).catch(() => undefined)));
    const audit = await db.collection("profileFeatureAuditLogs").where("actorUid", "==", targetUid).get();
    await Promise.all(audit.docs.map((doc) => doc.ref.delete()));
  }
});


test("real store purchases flow into the member profile and disappear when their entitlement expires", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const memberUid = uid("premium_purchase_member");
  const memberRef = db.collection("users").doc(memberUid);
  const items = [
    ["vip_monthly", "vip", 30],
    ["title_custom", "title", 30],
    ["badge_special", "badge", 30],
    ["avatar_frame_30d", "frame", 30],
    ["username_color_30d", "username_style", 30],
    ["username_animated_30d", "username_style", 30],
    ["profile_analytics_30d", "analytics", 30],
    ["profile_layout_30d", "profile_layout", 30],
    ["profile_pin_30d", "profile_layout", 30],
    ["discovery_boost_7d", "boost", 7],
    ["profile_theme_30d", "theme", 30],
    ["visitor_greeting_30d", "greeting", 30],
  ];
  const catalogRefs = items.map(([itemId]) => db.collection("storeCatalog").doc(itemId));
  const purchaseRefs = [];
  const ledgerRefs = [];
  const entitlementRefs = [];
  const priceCoins = 100;

  await memberRef.set(profile(30, { coins: 5000 }));
  try {
    await Promise.all(items.map(([itemId, category, durationDays], index) =>
      catalogRefs[index].set({
        itemId,
        name: `ميزة ${itemId}`,
        description: "اختبار شراء واستحقاق الملف الشخصي",
        category,
        priceCoins,
        durationDays,
        sortOrder: index + 1,
        active: true,
        purchaseEnabled: true,
        fulfillmentReady: true,
      }),
    ));

    for (const [index, [itemId, category]] of items.entries()) {
      const requestId = `profile_purchase_${memberUid}_${index}`;
      const purchaseId = `${memberUid}_${requestId}`;
      const purchaseRef = db.collection("storePurchases").doc(purchaseId);
      const ledgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
      const entitlementRef = memberRef.collection("entitlements").doc(itemId);
      purchaseRefs.push(purchaseRef);
      ledgerRefs.push(ledgerRef);
      entitlementRefs.push(entitlementRef);

      const result = await purchaseStoreItem.run(call(memberUid, {
        itemId, requestId, expectedPriceCoins: priceCoins,
      }));
      assert.equal(result.idempotentReplay, false, itemId);
      assert.equal(result.newBalance, 5000 - (index + 1) * priceCoins, itemId);

      const [receipt, ledger, entitlement] = await Promise.all([
        purchaseRef.get(), ledgerRef.get(), entitlementRef.get(),
      ]);
      assert.equal(receipt.data()?.status, "completed", itemId);
      assert.equal(receipt.data()?.itemId, itemId, itemId);
      assert.equal(ledger.data()?.type, "store_purchase", itemId);
      assert.equal(ledger.data()?.amount, -priceCoins, itemId);
      assert.equal(ledger.data()?.purchaseId, purchaseId, itemId);
      assert.equal(entitlement.data()?.status, "active", itemId);
      assert.equal(entitlement.data()?.category, category, itemId);
      assert.ok(entitlement.data()?.expiresAt.toMillis() > Date.now(), itemId);
    }

    const profileView = await getMemberProfile.run(call(memberUid, { userId: memberUid }));
    assert.equal(profileView.vipActive, true);
    assert.equal(profileView.activeTitle, "ميزة title_custom");
    assert.deepEqual(
      new Set(profileView.activeFeatures.map((feature) => feature.itemId)),
      new Set(items.map(([itemId]) => itemId)),
    );
    assert.equal(profileView.discoveryBoostActive, true);

    await setMemberCustomTitle.run(call(memberUid, { title: "سفير مودة" }));
    const customized = await getMemberProfile.run(call(memberUid, { userId: memberUid }));
    assert.equal(customized.activeTitle, "سفير مودة");

    await entitlementRefs[0].update({ expiresAt: Timestamp.fromMillis(Date.now() - 1000) });
    await entitlementRefs[2].update({ expiresAt: Timestamp.fromMillis(Date.now() - 1000) });
    const expired = await getMemberProfile.run(call(memberUid, { userId: memberUid }));
    assert.equal(expired.vipActive, false);
    assert.ok(!expired.activeFeatures.some((feature) => feature.itemId === "vip_monthly"));
    assert.ok(!expired.activeFeatures.some((feature) => feature.itemId === "badge_special"));
  } finally {
    await Promise.all([
      ...purchaseRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...ledgerRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...entitlementRefs.map((ref) => ref.delete().catch(() => undefined)),
      ...catalogRefs.map((ref) => ref.delete().catch(() => undefined)),
      db.recursiveDelete(memberRef).catch(() => undefined),
    ]);
  }
});

test("concurrent retries of the same store purchase debit the wallet only once", async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
  const memberUid = uid("concurrent_store_member");
  const memberRef = db.collection("users").doc(memberUid);
  const itemRef = db.collection("storeCatalog").doc("vip_monthly");
  const requestId = `concurrent_purchase_${memberUid}`;
  const purchaseId = `${memberUid}_${requestId}`;
  const purchaseRef = db.collection("storePurchases").doc(purchaseId);
  const ledgerRef = memberRef.collection("walletLedger").doc(`store_${purchaseId}`);
  const entitlementRef = memberRef.collection("entitlements").doc("vip_monthly");

  await Promise.all([
    memberRef.set(profile(30, { coins: 1000 })),
    itemRef.set({
      itemId: "vip_monthly", name: "VIP", description: "Concurrent purchase test",
      category: "vip", priceCoins: 600, durationDays: 30, sortOrder: 1,
      active: true, purchaseEnabled: true, fulfillmentReady: true,
    }),
  ]);
  try {
    const request = call(memberUid, {
      itemId: "vip_monthly", requestId, expectedPriceCoins: 600,
    });
    const results = await Promise.all([
      purchaseStoreItem.run(request),
      purchaseStoreItem.run(request),
    ]);
    assert.equal(results.filter((result) => result.idempotentReplay === false).length, 1);
    assert.equal(results.filter((result) => result.idempotentReplay === true).length, 1);
    assert.equal((await memberRef.get()).data()?.coins, 400);
    assert.equal((await purchaseRef.get()).data()?.status, "completed");
    assert.equal((await ledgerRef.get()).data()?.amount, -600);
    assert.equal((await entitlementRef.get()).data()?.status, "active");
  } finally {
    await Promise.all([
      purchaseRef.delete().catch(() => undefined),
      ledgerRef.delete().catch(() => undefined),
      entitlementRef.delete().catch(() => undefined),
      itemRef.delete().catch(() => undefined),
      db.recursiveDelete(memberRef).catch(() => undefined),
    ]);
  }
});
