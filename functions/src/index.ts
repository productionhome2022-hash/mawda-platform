import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { validateMemberProfile } from "./member-profile";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { calculateTransferBreakdown } from "./coin-math";
import { validateRegistrationPolicy } from "./registration-policy";
import { projectPublicMemberProfile } from "./member-profile-view";

initializeApp();

const db = getFirestore();
const TRANSFER_SETTINGS = db.doc("platformSettings/coinTransfers");

type TransferRequest = {
  recipientUid?: unknown;
  amount?: unknown;
  requestId?: unknown;
  expectedCommissionBps?: unknown;
};

function requireAuthenticatedUid(uid: string | undefined): string {
  if (!uid) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً.");
  }
  return uid;
}

function requireOwner(request: { auth?: { uid: string; token: Record<string, unknown> } | null }): string {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  if (request.auth?.token.platformOwner !== true) {
    throw new HttpsError("permission-denied", "هذه العملية مخصصة لمالك المنصة.");
  }
  return uid;
}

function requireRequestId(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length < 8 ||
    value.length > 80 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new HttpsError("invalid-argument", "معرف الطلب غير صالح.");
  }
  return value;
}

function readSafeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new HttpsError("invalid-argument", `قيمة ${field} يجب أن تكون عدداً صحيحاً صالحاً.`);
  }
  return value;
}

/**
 * تحويل ذري للكوينز:
 * - يخصم المبلغ الإجمالي من المرسل.
 * - يضيف صافي المبلغ للمستلم.
 * - يسجل عمولة المنصة في دفتر مستقل.
 * - ينشئ قيدي محفظة مترابطين ومعرف تحويل موحد.
 *
 * كل الأرصدة والقيود تُكتب داخل Firestore transaction واحدة.
 */
export const transferCoins = onCall(async (request) => {
  const senderUid = requireAuthenticatedUid(request.auth?.uid);
  const data = (request.data ?? {}) as TransferRequest;
  const recipientUid = typeof data.recipientUid === "string" ? data.recipientUid.trim() : "";
  const amount = readSafeInteger(data.amount, "amount");
  const requestId = requireRequestId(data.requestId);
  const expectedCommissionBps = readSafeInteger(
    data.expectedCommissionBps,
    "expectedCommissionBps",
  );

  if (!recipientUid || recipientUid.length > 128) {
    throw new HttpsError("invalid-argument", "معرف المستلم غير صالح.");
  }
  if (recipientUid === senderUid) {
    throw new HttpsError("failed-precondition", "لا يمكن تحويل الكوينز إلى حسابك نفسه.");
  }
  if (amount <= 0) {
    throw new HttpsError("invalid-argument", "يجب أن يكون مبلغ التحويل أكبر من صفر.");
  }

  const transferId = `${senderUid}_${requestId}`;
  const transferRef = db.collection("coinTransfers").doc(transferId);
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const senderLedgerRef = senderRef.collection("walletLedger").doc(transferId);
  const recipientLedgerRef = recipientRef.collection("walletLedger").doc(transferId);
  const platformLedgerRef = db.collection("platformWalletLedger").doc(transferId);

  const result = await db.runTransaction(async (transaction) => {
    const [existing, settings, senderSnapshot, recipientSnapshot] = await Promise.all([
      transaction.get(transferRef),
      transaction.get(TRANSFER_SETTINGS),
      transaction.get(senderRef),
      transaction.get(recipientRef),
    ]);

    if (existing.exists) {
      const prior = existing.data()!;
      if (prior.senderUid !== senderUid) {
        throw new HttpsError("permission-denied", "معرف التحويل مستخدم لعملية أخرى.");
      }
      if (
        prior.recipientUid !== recipientUid ||
        prior.grossAmount !== amount
      ) {
        throw new HttpsError("already-exists", "أعيد استخدام معرف طلب التحويل مع بيانات مختلفة.");
      }
      return {
        transferId,
        senderUid: prior.senderUid,
        recipientUid: prior.recipientUid,
        grossAmount: prior.grossAmount,
        commissionBps: prior.commissionBps,
        commissionPercent: prior.commissionPercent,
        commissionAmount: prior.commissionAmount,
        netAmount: prior.netAmount,
        status: prior.status,
        idempotentReplay: true,
      };
    }

    if (!senderSnapshot.exists || !recipientSnapshot.exists) {
      throw new HttpsError("not-found", "تعذر العثور على حساب المرسل أو المستلم.");
    }

    if (!settings.exists) {
      throw new HttpsError("failed-precondition", "لم تضبط الإدارة نسبة العمولة بعد.");
    }
    const settingsData = settings.data() ?? {};
    if (settingsData.enabled === false) {
      throw new HttpsError("failed-precondition", "التحويلات متوقفة مؤقتاً من الإدارة.");
    }

    const commissionBps = readSafeInteger(settingsData.commissionBps, "commissionBps");

    if (commissionBps < 0 || commissionBps >= 10000) {
      throw new HttpsError("failed-precondition", "إعداد نسبة العمولة غير صالح.");
    }
    if (expectedCommissionBps !== undefined && expectedCommissionBps !== commissionBps) {
      throw new HttpsError("failed-precondition", "تغيرت نسبة العمولة. حدّث عرض التحويل قبل التأكيد.");
    }

    const senderData = senderSnapshot.data()!;
    const recipientData = recipientSnapshot.data()!;
    const senderBalance = readSafeInteger(senderData.coins ?? 0, "sender.coins");
    const recipientBalance = readSafeInteger(recipientData.coins ?? 0, "recipient.coins");
    if (senderBalance < 0 || recipientBalance < 0) {
      throw new HttpsError("failed-precondition", "أحد الأرصدة يحتوي على قيمة غير صالحة.");
    }

    if (senderBalance < amount) {
      throw new HttpsError("failed-precondition", "رصيدك من الكوينز غير كافٍ.");
    }

    // Basis points: 2,000 = 20%. Exact integer arithmetic avoids floating-point drift.
    const breakdown = calculateTransferBreakdown(amount, commissionBps);
    const fee = breakdown.commissionAmount;
    const netAmount = breakdown.netAmount;
    if (!Number.isSafeInteger(senderBalance - amount) ||
        !Number.isSafeInteger(recipientBalance + netAmount)) {
      throw new HttpsError("out-of-range", "الرصيد الناتج يتجاوز الحد الرقمي الآمن.");
    }

    const createdAt = FieldValue.serverTimestamp();
    const transfer = {
      transferId,
      senderUid,
      recipientUid,
      grossAmount: amount,
      commissionBps,
      commissionPercent: commissionBps / 100,
      commissionAmount: fee,
      netAmount,
      status: "completed",
      createdAt,
    };

    transaction.update(senderRef, { coins: senderBalance - amount });
    transaction.update(recipientRef, { coins: recipientBalance + netAmount });
    transaction.create(transferRef, transfer);

    transaction.create(senderLedgerRef, {
      type: "coin_transfer_sent",
      direction: "debit",
      amount: -amount,
      grossAmount: amount,
      commissionAmount: fee,
      commissionBps,
      recipientUid,
      recipientNetAmount: netAmount,
      transferId,
      createdAt,
    });

    transaction.create(recipientLedgerRef, {
      type: "coin_transfer_received",
      direction: "credit",
      amount: netAmount,
      senderUid,
      transferId,
      createdAt,
    });

    transaction.create(platformLedgerRef, {
      type: "coin_transfer_commission",
      direction: "credit",
      amount: fee,
      currency: "coin",
      senderUid,
      recipientUid,
      grossAmount: amount,
      commissionBps,
      transferId,
      createdAt,
    });

    return {
      transferId,
      senderUid,
      recipientUid,
      grossAmount: amount,
      commissionBps,
      commissionPercent: commissionBps / 100,
      commissionAmount: fee,
      netAmount,
      status: "completed",
      idempotentReplay: false,
    };
  });

  logger.info("Coin transfer processed", {
    transferId,
    senderUid,
    recipientUid,
    amount,
    commissionAmount: result.commissionAmount,
    netAmount: result.netAmount,
    idempotentReplay: result.idempotentReplay,
  });

  return result;
});

/**
 * يغير مالك المنصة نسبة العمولة بوحدات basis points:
 * 2,000 = 20%. لا يُسمح للعميل العادي بتغيير إعدادات العمولة.
 * يجب منح custom claim platformOwner من بيئة موثوقة فقط.
 */
/** Returns a server-calculated quote so the client can show the fee before confirmation. */
export const getTransferQuote = onCall(async (request) => {
  requireAuthenticatedUid(request.auth?.uid);
  const amount = readSafeInteger(request.data?.amount, "amount");
  if (amount <= 0) {
    throw new HttpsError("invalid-argument", "يجب أن يكون مبلغ التحويل أكبر من صفر.");
  }

  const settings = await TRANSFER_SETTINGS.get();
  if (!settings.exists) {
    throw new HttpsError("failed-precondition", "لم تضبط الإدارة نسبة العمولة بعد.");
  }
  const data = settings.data() ?? {};
  if (data.enabled === false) {
    throw new HttpsError("failed-precondition", "التحويلات متوقفة مؤقتاً من الإدارة.");
  }
  const commissionBps = readSafeInteger(data.commissionBps, "commissionBps");

  let breakdown;
  try {
    breakdown = calculateTransferBreakdown(amount, commissionBps);
  } catch {
    throw new HttpsError("failed-precondition", "إعداد العمولة أو مبلغ التحويل غير صالح.");
  }

  return {
    ...breakdown,
    commissionPercent: commissionBps / 100,
    settingsVersion: typeof data.version === "number" ? data.version : 0,
  };
});

export const setTransferCommission = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const commissionBps = readSafeInteger(request.data?.commissionBps, "commissionBps");
  const enabled = request.data?.enabled;

  if (commissionBps < 0 || commissionBps >= 10000) {
    throw new HttpsError("invalid-argument", "نسبة العمولة يجب أن تكون بين 0% وأقل من 100%.");
  }
  if (enabled !== undefined && typeof enabled !== "boolean") {
    throw new HttpsError("invalid-argument", "قيمة تفعيل التحويلات غير صالحة.");
  }

  const result = await db.runTransaction(async (transaction) => {
    const current = await transaction.get(TRANSFER_SETTINGS);
    const previous = current.data() ?? {};
    const nextEnabled = enabled === undefined ? previous.enabled !== false : enabled;

    transaction.set(TRANSFER_SETTINGS, {
      commissionBps,
      commissionPercent: commissionBps / 100,
      enabled: nextEnabled,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
      version: (typeof previous.version === "number" ? previous.version : 0) + 1,
    }, { merge: true });

    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid,
      action: "coin_transfer_commission_updated",
      previousCommissionBps: previous.commissionBps ?? 0,
      commissionBps,
      previousEnabled: previous.enabled !== false,
      enabled: nextEnabled,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { commissionBps, commissionPercent: commissionBps / 100, enabled: nextEnabled };
  });

  logger.info("Transfer commission settings updated", { actorUid, ...result });
  return result;
});


/**
 * Completes a verified member's Mawda profile.
 * The profile, unique username reservation, 500-coin email reward and
 * immutable wallet ledger entry are created atomically by the trusted server.
 * Registration is closed until the owner explicitly configures minimumAge at
 * platformSettings/registration; no age threshold is silently assumed.
 */
export const completeMemberProfile = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const authUser = await getAuth().getUser(uid);
  if (!authUser.email || !authUser.emailVerified) {
    throw new HttpsError("failed-precondition", "يجب التحقق من البريد الإلكتروني قبل إكمال العضوية.");
  }

  const registrationSettingsRef = db.doc("platformSettings/registration");
  const userRef = db.collection("users").doc(uid);
  const rewardLedgerRef = userRef.collection("walletLedger").doc("email_verification_reward_500");

  return db.runTransaction(async (transaction) => {
    // Read the registration gate in the same transaction as member creation.
    // If the owner changes the policy concurrently, Firestore retries this
    // transaction and the new policy is enforced before any profile/reward write.
    const [userSnapshot, registrationSettings] = await Promise.all([
      transaction.get(userRef),
      transaction.get(registrationSettingsRef),
    ]);

    const registrationData = registrationSettings.exists
      ? registrationSettings.data() ?? {}
      : {};
    if (registrationData.enabled !== true) {
      throw new HttpsError(
        "failed-precondition",
        "التسجيل مغلق حالياً حتى يفعّله مالك المنصة ويضبط سياسة العمر.",
      );
    }

    let profile;
    try {
      profile = validateMemberProfile(
        (request.data ?? {}) as Record<string, unknown>,
        registrationData.minimumAge,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "بيانات الملف الشخصي غير صالحة.";
      if (message === "REGISTRATION_POLICY_NOT_CONFIGURED") {
        throw new HttpsError(
          "failed-precondition",
          "التسجيل متوقف مؤقتاً حتى يضبط مالك المنصة سياسة الحد الأدنى للعمر.",
        );
      }
      if (message === "ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT") {
      throw new HttpsError("failed-precondition", "التعارف العاطفي ونية الزواج متاحان للأعضاء بعمر 18 عاماً فأكثر.");
    }
    if (message === "AGE_POLICY_NOT_MET") {
        throw new HttpsError("failed-precondition", "العمر المدخل لا يطابق سياسة التسجيل المعتمدة.");
      }
      throw new HttpsError("invalid-argument", message);
    }

    const usernameRef = db.collection("usernameRegistry").doc(profile.username);
    const usernameSnapshot = await transaction.get(usernameRef);

    if (userSnapshot.exists) {
      const existing = userSnapshot.data() ?? {};
      if (existing.profileCompleted === true) {
        return {
          memberId: uid,
          username: existing.username,
          profileCompleted: true,
          rewardGranted: false,
          alreadyCompleted: true,
        };
      }
      throw new HttpsError(
        "already-exists",
        "يوجد سجل عضو سابق يحتاج إلى مراجعة آمنة قبل استكماله.",
      );
    }
    if (usernameSnapshot.exists) {
      throw new HttpsError("already-exists", "اسم المستخدم محجوز بالفعل. اختر اسماً آخر.");
    }

    const createdAt = FieldValue.serverTimestamp();
    transaction.create(userRef, {
      uid,
      memberId: uid,
      email: authUser.email,
      emailVerified: true,
      emailVerifiedAt: createdAt,
      fullName: profile.fullName,
      displayName: profile.fullName,
      username: profile.username,
      age: profile.age,
      profession: profile.profession,
      country: profile.country,
      region: profile.region,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      bio: profile.bio,
      interests: profile.interests,
      goals: profile.goals,
      profileVisibility: "private",
      coins: 500,
      profileCompleted: true,
      createdAt,
      updatedAt: createdAt,
    });
    transaction.create(usernameRef, {
      uid,
      username: profile.username,
      createdAt,
    });
    transaction.create(rewardLedgerRef, {
      type: "email_verification_reward",
      direction: "credit",
      amount: 500,
      reason: "verified_email",
      idempotencyKey: "email_verification_reward_500",
      createdAt,
    });

    return {
      memberId: uid,
      username: profile.username,
      profileCompleted: true,
      rewardGranted: true,
      rewardAmount: 500,
      alreadyCompleted: false,
    };
  });
});


/**
 * Owner-only control for the registration gate and minimum-age policy.
 * No default age is assumed; the owner must explicitly choose one.
 */
export const setRegistrationPolicy = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const registrationSettingsRef = db.doc("platformSettings/registration");
  let policy: { enabled: boolean; minimumAge: number };
  try {
    policy = validateRegistrationPolicy(
      request.data?.enabled,
      request.data?.minimumAge,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "INVALID_REGISTRATION_POLICY";
    if (message === "REGISTRATION_ENABLED_INVALID") {
      throw new HttpsError("invalid-argument", "يجب تحديد حالة فتح التسجيل.");
    }
    throw new HttpsError(
      "invalid-argument",
      "الحد الأدنى للعمر يجب أن يكون عدداً صحيحاً بين 16 و120.",
    );
  }
  const { enabled, minimumAge } = policy;

  const result = await db.runTransaction(async (transaction) => {
    const current = await transaction.get(registrationSettingsRef);
    const previous = current.data() ?? {};
    const next = {
      enabled,
      minimumAge,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
      version: (typeof previous.version === "number" ? previous.version : 0) + 1,
    };
    transaction.set(registrationSettingsRef, next, { merge: true });

    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid,
      action: "registration_policy_updated",
      previousEnabled: previous.enabled === true,
      previousMinimumAge: previous.minimumAge ?? null,
      enabled,
      minimumAge,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { enabled, minimumAge, version: next.version };
  });

  logger.info("Registration policy updated", { actorUid, ...result });
  return result;
});


/**
 * Returns a minimal public profile only when the member explicitly opted in.
 * A member may always read their own profile. Sensitive fields such as email,
 * age, wallet balance and internal moderation data are never projected.
 */
export const getMemberProfile = onCall(async (request) => {
  const viewerUid = requireAuthenticatedUid(request.auth?.uid);
  const targetUid = request.data?.userId;
  if (typeof targetUid !== "string" || targetUid.length < 1 || targetUid.length > 128) {
    throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  }

  const memberSnapshot = await db.collection("users").doc(targetUid).get();
  if (!memberSnapshot.exists) {
    throw new HttpsError("not-found", "ملف العضو غير موجود.");
  }

  const memberData = memberSnapshot.data() ?? {};
  if (viewerUid !== targetUid && memberData.profileVisibility !== "public") {
    throw new HttpsError("permission-denied", "هذا الملف خاص ولا يمكن عرضه.");
  }

  const profile = projectPublicMemberProfile(targetUid, {
    ...memberData,
    profileVisibility: "public",
  });
  if (!profile) {
    throw new HttpsError("permission-denied", "هذا الملف خاص ولا يمكن عرضه.");
  }
  return viewerUid === targetUid
    ? { ...profile, profileVisibility: memberData.profileVisibility === "public" ? "public" : "private" }
    : profile;
});

/** A member may change only their own profile visibility. */
export const setMemberProfileVisibility = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const visibility = request.data?.visibility;
  if (visibility !== "public" && visibility !== "private") {
    throw new HttpsError("invalid-argument", "إعداد خصوصية الملف غير صالح.");
  }

  const userRef = db.collection("users").doc(uid);
  await db.runTransaction(async (transaction) => {
    const member = await transaction.get(userRef);
    if (!member.exists || member.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "يجب إكمال العضوية أولاً.");
    }
    transaction.update(userRef, {
      profileVisibility: visibility,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("memberPrivacyAudit").doc();
    transaction.create(auditRef, {
      memberUid: uid,
      action: "profile_visibility_changed",
      visibility,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { visibility };
});
