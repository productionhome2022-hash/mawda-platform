const { applicationDefault, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

const EXPECTED_PROJECT_ID = "mawda-app-2026";

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const confirmedProjectId = process.env.CONFIRM_PLATFORM_OWNER;
  const ownerUid = process.env.OWNER_UID;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (projectId !== EXPECTED_PROJECT_ID || confirmedProjectId !== EXPECTED_PROJECT_ID) {
    throw new Error(
      `Refusing owner bootstrap. Set FIREBASE_PROJECT_ID and CONFIRM_PLATFORM_OWNER to ${EXPECTED_PROJECT_ID}.`,
    );
  }
  if (!ownerUid || ownerUid.length > 128 || !ownerEmail || !ownerEmail.includes("@")) {
    throw new Error("Set OWNER_UID and OWNER_EMAIL to the independently verified Firebase Auth account.");
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: EXPECTED_PROJECT_ID,
  });

  const auth = getAuth();
  const db = getFirestore();
  const owner = await auth.getUser(ownerUid);

  if (!owner.email || owner.email.toLowerCase() !== ownerEmail.trim().toLowerCase()) {
    throw new Error("OWNER_EMAIL does not exactly match the selected Firebase Auth account.");
  }
  if (owner.emailVerified !== true || owner.disabled === true) {
    throw new Error("The selected owner account must be enabled and have a verified email.");
  }
  if (!owner.multiFactor?.enrolledFactors?.length) {
    throw new Error("Enroll and verify a second factor on the owner account before provisioning platformOwner.");
  }

  const ownerRegistryRef = db.doc("platformSettings/platformOwner");
  await db.runTransaction(async (transaction) => {
    const registry = await transaction.get(ownerRegistryRef);
    if (registry.exists) {
      if (registry.data()?.ownerUid !== ownerUid) {
        throw new Error("A different canonical platform owner is already registered; owner transfer requires a separately audited recovery process.");
      }
      return;
    }
    transaction.create(ownerRegistryRef, {
      ownerUid,
      ownerEmail: owner.email.toLowerCase(),
      identityModel: "single_platform_owner",
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  const existingClaims = owner.customClaims ?? {};
  const claimsAreCurrent = existingClaims.platformOwner === true &&
    existingClaims.platformOwnerUid === ownerUid;
  if (claimsAreCurrent) {
    console.log("The selected account is already the canonical platform owner; no claim change was made.");
    return;
  }

  const auditRef = db.collection("adminAuditLogs").doc();
  await auditRef.create({
    action: "platform_owner_bootstrap_started",
    targetUid: ownerUid,
    targetEmail: owner.email,
    identityModel: "single_platform_owner",
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  try {
    await auth.setCustomUserClaims(ownerUid, {
      ...existingClaims,
      platformOwner: true,
      platformOwnerUid: ownerUid,
    });
    await auditRef.update({
      action: "platform_owner_bootstrap_completed",
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
    });
    console.log("Canonical owner claim provisioned successfully for the verified account.");
  } catch (error) {
    await auditRef.update({
      status: "failed",
      failureCode: typeof error.code === "string" ? error.code : "unknown",
      completedAt: FieldValue.serverTimestamp(),
    });
    throw error;
  }
}

main().catch((error) => {
  console.error("Owner bootstrap failed:", error.message);
  process.exitCode = 1;
});
