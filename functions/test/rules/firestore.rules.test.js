const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} = require("firebase/firestore");

let env;

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-mawda-rules",
    firestore: {
      rules: readFileSync(resolve(__dirname, "../../../firestore.rules"), "utf8"),
    },
  });
});

test.after(async () => {
  await env.cleanup();
});

test.beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users/alice"), { uid: "alice", coins: 1200 });
    await setDoc(doc(db, "users/bob"), { uid: "bob", coins: 800 });
    await setDoc(doc(db, "users/alice/walletLedger/transfer-1"), {
      transferId: "transfer-1",
      amount: -100,
    });
    await setDoc(doc(db, "coinTransfers/transfer-1"), {
      senderUid: "alice",
      recipientUid: "bob",
      grossAmount: 100,
    });
    await setDoc(doc(db, "platformSettings/registration"), {
      enabled: true,
      minimumAge: 18,
    });
  });
});

test("a member can read only their own profile", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();

  await assertSucceeds(getDoc(doc(alice, "users/alice")));
  await assertFails(getDoc(doc(alice, "users/bob")));
  await assertFails(getDocs(collection(alice, "users")));
  await assertFails(getDoc(doc(bob, "users/alice")));
});

test("members cannot self-assign biometric verification or mutate server-managed profiles", async () => {
  const alice = env.authenticatedContext("alice").firestore();

  await assertFails(setDoc(doc(alice, "users/alice"), {
    uid: "alice",
    biometricVerification: { status: "verified" },
  }, { merge: true }));
  await assertFails(setDoc(doc(alice, "users/alice"), {
    biometricVerification: { status: "verified" },
    platformOwner: true,
  }, { merge: true }));
});

test("a member can read their own wallet ledger but cannot write it", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();

  await assertSucceeds(
    getDoc(doc(alice, "users/alice/walletLedger/transfer-1")),
  );
  await assertSucceeds(
    getDocs(collection(alice, "users/alice/walletLedger")),
  );
  await assertFails(
    getDoc(doc(bob, "users/alice/walletLedger/transfer-1")),
  );
  await assertFails(
    setDoc(doc(alice, "users/alice/walletLedger/fake-credit"), {
      amount: 999999,
    }),
  );
});

test("only a sender or recipient can read a transfer document", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();
  const mallory = env.authenticatedContext("mallory").firestore();

  await assertSucceeds(getDoc(doc(alice, "coinTransfers/transfer-1")));
  await assertSucceeds(getDoc(doc(bob, "coinTransfers/transfer-1")));
  await assertFails(getDoc(doc(mallory, "coinTransfers/transfer-1")));
  await assertFails(getDocs(collection(alice, "coinTransfers")));
  await assertFails(
    setDoc(doc(alice, "coinTransfers/fake-transfer"), {
      senderUid: "alice",
      recipientUid: "mallory",
      grossAmount: 1000000,
    }),
  );
});

test("platform settings and all other server-managed documents are denied", async () => {
  const alice = env.authenticatedContext("alice").firestore();

  await assertFails(getDoc(doc(alice, "platformSettings/registration")));
  await assertFails(
    setDoc(doc(alice, "platformSettings/registration"), {
      enabled: true,
      minimumAge: 1,
    }),
  );
  await assertFails(
    setDoc(doc(alice, "adminAuditLogs/fake"), { action: "owner_escalation" }),
  );
});


test("media metadata and access audit collections are server-only", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const bob = env.authenticatedContext("bob").firestore();

  await assertFails(getDoc(doc(alice, "mediaAssets/media-1")));
  await assertFails(getDocs(collection(alice, "mediaAssets")));
  await assertFails(setDoc(doc(alice, "mediaAssets/fake"), {
    ownerUid: "alice",
    objectPath: "quarantine/alice/fake",
    status: "security_approved",
  }));
  await assertFails(getDoc(doc(bob, "mediaAccessAudit/audit-1")));
  await assertFails(setDoc(doc(alice, "mediaAccessAudit/fake"), {
    actorUid: "alice",
    action: "owner_media_inspection_url_issued",
  }));
});


test("biometric requests, playback grants and verification audit records are server-only", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  await assertFails(getDoc(doc(alice, "biometricVerificationRequests/request-1")));
  await assertFails(getDocs(collection(alice, "biometricVerificationRequests")));
  await assertFails(setDoc(doc(alice, "biometricVerificationRequests/fake"), {
    uid: "alice", status: "verified",
  }));
  await assertFails(getDoc(doc(alice, "biometricOwnerPlaybackGrants/request-1_alice")));
  await assertFails(setDoc(doc(alice, "biometricOwnerPlaybackGrants/fake"), {
    reviewerUid: "alice", expiresAt: Date.now() + 60000,
  }));
  await assertFails(getDoc(doc(alice, "verificationAuditLogs/biometric_reward_fake")));
});


test("featured-ad viewing, reward-policy, campaign-version, financial-ledger and audit paths are server-only", async () => {
  const alice = env.authenticatedContext("alice").firestore();
  const protectedPaths = [
    "featuredAdCampaigns/campaign-12345678",
    "featuredAdViewingSessions/00000000-0000-4000-8000-000000000001",
    "users/alice/featuredAdRewardDays/2026-11-23",
    "featuredAdCampaignMembers/alice_campaign-12345678",
    "platformSettings/featuredAdRewardPolicy",
    "timedAdCampaigns/campaign-12345678",
    "timedAdCampaignVersions/campaign-12345678/versions/1",
    "featuredAdFinancials/campaign-12345678",
    "featuredAdFinancials/campaign-12345678/events/event-12345678",
    "featuredAdFinancialVersions/campaign-12345678/versions/1",
    "adminAuditLogs/featured_ad_finance_event-12345678",
  ];
  for (const path of protectedPaths) {
    await assertFails(getDoc(doc(alice, path)));
    await assertFails(setDoc(doc(alice, path), { status: "published", coins: 999999 }));
  }
});
