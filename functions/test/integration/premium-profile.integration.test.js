const test = require("node:test");
const assert = require("node:assert/strict");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const {
  getMemberProfile,
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
