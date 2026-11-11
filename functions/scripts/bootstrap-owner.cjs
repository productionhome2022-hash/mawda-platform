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

  const auditRef = db.collection("adminAuditLogs").doc();
  const existingClaims = owner.customClaims ?? {};
  if (existingClaims.platformOwner === true) {
    console.log("The selected account already has platformOwner=true; no claim change was made.");
    return;
  }

  await auditRef.create({
    action: "platform_owner_bootstrap_started",
    targetUid: ownerUid,
    targetEmail: owner.email,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  try {
    await auth.setCustomUserClaims(ownerUid, {
      ...existingClaims,
      platformOwner: true,
    });
    await auditRef.update({
      action: "platform_owner_bootstrap_completed",
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
    });
    console.log("Owner claim provisioned successfully for the verified account.");
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
