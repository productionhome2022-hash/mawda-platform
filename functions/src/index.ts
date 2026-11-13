import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { validateMemberProfile } from "./member-profile";
import { FieldPath, FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineString } from "firebase-functions/params";
import { validateMediaLegalHoldInput } from "./media-legal-hold";
import { validateMessageLegalHoldInput } from "./message-legal-hold";
import { logger } from "firebase-functions";
import { calculateTransferBreakdown } from "./coin-math";
import { validateRegistrationPolicy } from "./registration-policy";
import { canViewMemberProfile, projectPublicMemberProfile } from "./member-profile-view";
import { validateMemberProfileUpdate } from "./member-profile-update";
import {
  canChangeMemberSocialLinkVisibility,
  projectMemberSocialLinks,
  validateMemberSocialLinks,
} from "./member-social-links";
import { validateDirectMessageInput } from "./direct-message";
import { validateSafetyReportInput, validateSafetyAppealInput } from "./safety-cases";
import { createDirectChatId } from "./direct-chat-id";
import { isMessageReadByPeer, shouldAdvanceReadReceipt } from "./direct-message-receipts";
import { hasActiveBiometricVerification } from "./biometric-verification";
import { canEditMemberSocialLinks, canExposeMemberSocialLinks } from "./member-social-links-access";
import { isMemberAccountInGoodStanding } from "./member-access";
import {
  assertMessageLinksAllowed,
  BIOMETRIC_APPROVED_HOSTS,
  canSendApprovedPlatformLinks,
} from "./link-policy";
import { createHash } from "node:crypto";
import { audienceForAge, canJoinRoom, normalizeModeratorPermissions } from "./room-policy";
import { hasPlatformOwnerSession } from "./owner-access";
import { calculateOwnerAuditHash, verifyOwnerAuditChain } from "./owner-audit-chain";
import { validateOwnerAuditExportRequest, projectOwnerAuditExportValue } from "./owner-audit-export";
import {
  validateOwnerChatReviewRequest,
  validateOwnerConversationPageRequest,
  encodeOwnerMessagePageToken,
  decodeOwnerMessagePageToken,
  validateOwnerReviewAnnouncementRequest,
  validateOwnerChatParticipationRequest,
} from "./owner-chat-review";
import {
  PRIVACY_POLICY_HASH,
  PRIVACY_POLICY_VERSION,
  validatePrivacyAcknowledgement,
} from "./privacy-acknowledgement";
import {
  isStoreItemPurchasable,
  projectStoreCatalogItem,
  validateStoreCatalogItemInput,
} from "./store-catalog";
import {
  calculateStorePurchaseBalance,
  isStoreEntitlementActive,
  isStorePurchasePriceCurrent,
  projectStoreEntitlementFeatures,
} from "./store-purchase";
import { enforceChatMediaRetention, enforceChatTextRetention, enforceMediaOperationalAuditRetention, removeLateExpiredChatMediaDerivative } from "./retention";
import { deleteMediaAssetForMessage } from "./media";
import { DEFAULT_ROOM_RENTAL_PLANS, validateRoomRentalPlans, roomRentalExpiry, calculateRoomRentalBalance } from "./room-rental";
import { DEFAULT_STORE_CATALOG } from "./default-store-catalog";
import { DEFAULT_COIN_PACKAGES, DEFAULT_AD_PRICES, validateCoinPackages, validateAdPrices } from "./economy-pricing";
import { validateCoinPurchaseRequestInput, validateOwnerPaymentInstructionInput, validateExternalPaymentVerification } from "./coin-purchase-requests";
import { validateOwnerLiveStreamInput } from "./owner-live-stream";

initializeApp();

const db = getFirestore();
const TRANSFER_SETTINGS = db.doc("platformSettings/coinTransfers");
const OWNER_REVIEW_AUDIT_HEAD = db.collection("adminAuditChainHeads").doc("ownerReview");
const legalHoldExpiryEnabled = defineString("MAWDA_LEGAL_HOLD_EXPIRY_ENABLED", { default: "false" });

/**
 * Append a hash-linked owner-review audit event. A Firestore transaction
 * serializes head updates so concurrent review requests cannot fork sequence.
 * The head is maintained separately from the event documents.
 */
async function appendOwnerReviewAuditEvent(
  event: Record<string, unknown>,
  eventId?: string,
): Promise<string> {
  const auditRef = eventId
    ? db.collection("adminAuditLogs").doc(eventId)
    : db.collection("adminAuditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const existingEvent = await transaction.get(auditRef);
    if (existingEvent.exists) return;
    const headSnapshot = await transaction.get(OWNER_REVIEW_AUDIT_HEAD);
    const head = headSnapshot.data() ?? {};
    const previousSequence = headSnapshot.exists ? head.sequence : 0;
    const previousHash = headSnapshot.exists ? head.eventHash : "GENESIS";
    if (!Number.isSafeInteger(previousSequence) || previousSequence < 0 ||
        typeof previousHash !== "string" ||
        !(previousHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousHash))) {
      throw new Error("OWNER_AUDIT_CHAIN_HEAD_INVALID");
    }
    const sequence = previousSequence + 1;
    const eventHash = calculateOwnerAuditHash(event, sequence, previousHash);
    transaction.create(auditRef, {
      ...event,
      auditEvent: event,
      auditChainId: "owner-review-v1",
      auditSequence: sequence,
      previousAuditHash: previousHash,
      auditHash: eventHash,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.set(OWNER_REVIEW_AUDIT_HEAD, {
      sequence,
      eventHash,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return auditRef.id;
}


type TransferRequest = {
  recipientUid?: unknown;
  amount?: unknown;
  requestId?: unknown;
  expectedCommissionBps?: unknown;
};

async function sendPushToMember(
  uid: string, title: string, body: string, data: Record<string, string>,
): Promise<void> {
  try {
    const tokensSnapshot = await db.collection("users").doc(uid)
      .collection("pushTokens").where("active", "==", true).limit(500).get();
    const tokenDocs = tokensSnapshot.docs.filter((doc) =>
      typeof doc.data().token === "string" && doc.data().token.length > 0);
    if (tokenDocs.length === 0) return;
    const response = await getMessaging().sendEachForMulticast({
      tokens: tokenDocs.map((doc) => doc.data().token as string),
      notification: { title, body }, data,
      android: { priority: "high", notification: { channelId: "mawda_messages" } },
      webpush: { headers: { TTL: "60" } },
    });
    const batch = db.batch();
    let staleTokens = 0;
    response.responses.forEach((result, index) => {
      if (!result.success && result.error &&
          ["messaging/registration-token-not-registered", "messaging/invalid-registration-token"].includes(result.error.code)) {
        batch.update(tokenDocs[index].ref, { active: false, invalidatedAt: FieldValue.serverTimestamp() });
        staleTokens += 1;
      }
    });
    if (staleTokens > 0) await batch.commit();
  } catch (error) {
    logger.warn("Mawda push notification delivery failed", { recipientUid: uid, error });
  }
}
function requireAuthenticatedUid(uid: string | undefined): string {
  if (!uid) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً.");
  }
  return uid;
}

function requireOwner(request: { auth?: { uid: string; token: Record<string, unknown> } | null }): string {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const token = request.auth?.token;
  if (token?.platformOwner !== true) {
    throw new HttpsError("permission-denied", "هذه العملية مخصصة لمالك المنصة.");
  }
  if (!hasPlatformOwnerSession(token)) {
    throw new HttpsError(
      "permission-denied",
      "تتطلب العمليات السيادية جلسة مالك موثقة بالمصادقة متعددة العوامل (MFA).",
    );
  }
  return uid;
}

/**
 * Owner-review authorization failures are themselves security-relevant.
 * Persist a minimal denial event for authenticated callers before returning.
 * If the audit write fails, fail closed rather than silently losing the record.
 */
async function requireOwnerForReview(
  request: { auth?: { uid: string; token: Record<string, unknown> } | null },
  action: string,
): Promise<string> {
  try {
    return requireOwner(request);
  } catch (error) {
    const actorUid = request.auth?.uid;
    if (actorUid) {
      try {
        const firebase = request.auth?.token.firebase;
        await appendOwnerReviewAuditEvent({
          actorUid,
          action,
          outcome: "denied",
          failureCode: error instanceof HttpsError ? error.code : "permission-denied",
          ownerAuthTime: request.auth?.token.auth_time ?? null,
          secondFactor: firebase && typeof firebase === "object" && !Array.isArray(firebase)
            ? (firebase as Record<string, unknown>).sign_in_second_factor ?? null
            : null,
        });
      } catch (auditError) {
        logger.error("Owner review denial audit write failed", { actorUid, action, auditError });
        throw new HttpsError("internal", "تعذر توثيق محاولة الوصول؛ تم رفض العملية.");
      }
    }
    throw error;
  }
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
    if (!isMemberAccountInGoodStanding(senderData) ||
        !isMemberAccountInGoodStanding(recipientData)) {
      throw new HttpsError("permission-denied", "حالة أحد الحسابين لا تسمح بإجراء تحويل الكوينز حالياً.");
    }
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
 * Records explicit acknowledgement of the exact current privacy notice.
 * This record is separate from the member profile so it can be captured
 * immediately after Firebase Auth account creation and before profile access.
 */
export const recordPrivacyAcknowledgement = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  let acknowledgement;
  try {
    const actorType = request.data?.actorType;
    const provider = request.auth?.token.firebase &&
      typeof request.auth.token.firebase === "object"
      ? (request.auth.token.firebase as Record<string, unknown>).sign_in_provider
      : null;
    if (actorType === "guest" && provider !== "anonymous") {
      throw new HttpsError("permission-denied", "إقرار الضيف يتطلب جلسة ضيف موثقة.");
    }
    if (actorType === "member" && provider === "anonymous") {
      throw new HttpsError("permission-denied", "يجب ترقية جلسة الضيف قبل إقرار العضوية.");
    }
    acknowledgement = validatePrivacyAcknowledgement({
      ...(request.data ?? {}),
      actorType,
    } as Record<string, unknown>);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    const code = error instanceof Error ? error.message : "PRIVACY_ACKNOWLEDGEMENT_INVALID";
    throw new HttpsError(
      "failed-precondition",
      code === "PRIVACY_POLICY_VERSION_MISMATCH" || code === "PRIVACY_POLICY_HASH_MISMATCH"
        ? "تغير إشعار الخصوصية. حدّث التطبيق وراجع الإصدار الحالي قبل المتابعة."
        : "بيانات إقرار الخصوصية غير صالحة.",
    );
  }

  const acknowledgementRef = db.collection("privacyAcknowledgements")
    .doc(`${uid}_${acknowledgement.policyVersion}`);
  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(acknowledgementRef);
    if (existing.exists) {
      const data = existing.data() ?? {};
      if (data.policyHash !== acknowledgement.policyHash || data.uid !== uid) {
        throw new HttpsError("failed-precondition", "يتعارض سجل إقرار الخصوصية مع الإصدار الحالي.");
      }
      return {
        acknowledged: true,
        policyVersion: acknowledgement.policyVersion,
        idempotentReplay: true,
      };
    }
    transaction.create(acknowledgementRef, {
      uid,
      actorType: acknowledgement.actorType,
      policyVersion: acknowledgement.policyVersion,
      policyHash: acknowledgement.policyHash,
      locale: acknowledgement.locale,
      appVersion: acknowledgement.appVersion,
      acknowledgedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });
    return {
      acknowledged: true,
      policyVersion: acknowledgement.policyVersion,
      idempotentReplay: false,
    };
  });
});

/** Returns whether this authenticated account accepted the current policy revision. */
export const getPrivacyAcknowledgementStatus = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const ref = db.collection("privacyAcknowledgements")
    .doc(`${uid}_${PRIVACY_POLICY_VERSION}`);
  const snapshot = await ref.get();
  const data = snapshot.data() ?? {};
  return {
    acknowledged: snapshot.exists && data.uid === uid &&
      data.policyHash === PRIVACY_POLICY_HASH &&
      data.actorType === (request.auth?.token.firebase &&
        typeof request.auth.token.firebase === "object" &&
        (request.auth.token.firebase as Record<string, unknown>).sign_in_provider === "anonymous"
        ? "guest" : "member"),
    policyVersion: PRIVACY_POLICY_VERSION,
    policyHash: PRIVACY_POLICY_HASH,
  };
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
  const privacyAcknowledgementRef = db.collection("privacyAcknowledgements")
    .doc(`${uid}_${PRIVACY_POLICY_VERSION}`);

  return db.runTransaction(async (transaction) => {
    // Read the registration gate in the same transaction as member creation.
    // If the owner changes the policy concurrently, Firestore retries this
    // transaction and the new policy is enforced before any profile/reward write.
    const [userSnapshot, registrationSettings, privacyAcknowledgement] = await Promise.all([
      transaction.get(userRef),
      transaction.get(registrationSettingsRef),
      transaction.get(privacyAcknowledgementRef),
    ]);
    const privacyData = privacyAcknowledgement.data() ?? {};
    if (!privacyAcknowledgement.exists || privacyData.uid !== uid ||
        privacyData.actorType !== "member" || privacyData.policyHash !== PRIVACY_POLICY_HASH) {
      throw new HttpsError(
        "failed-precondition",
        "يجب الاطلاع على إشعار الخصوصية الحالي والإقرار به قبل إكمال العضوية.",
      );
    }

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
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      privacyPolicyHash: PRIVACY_POLICY_HASH,
      privacyAcknowledgedAt: privacyData.acknowledgedAt ?? createdAt,
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
  if (!canViewMemberProfile(viewerUid, targetUid, memberData.profileVisibility)) {
    throw new HttpsError("permission-denied", "هذا الملف خاص ولا يمكن عرضه.");
  }

  const [entitlementSnapshot] = await Promise.all([
    db.collection("users").doc(targetUid).collection("entitlements")
      .orderBy("purchasedAt", "desc").limit(100).get(),
  ]);
  const premiumFeatures = projectStoreEntitlementFeatures(
    entitlementSnapshot.docs.map((document) => document.data()),
  );
  const biometricLinksActive = canExposeMemberSocialLinks(
    memberData.profileCompleted === true,
    memberData.biometricVerification,
  );
  const approvedLinks = biometricLinksActive
    ? projectMemberSocialLinks(memberData.profileSocialLinks)
    : {};
  const hiddenProviders = Array.isArray(memberData.hiddenSocialLinks)
    ? memberData.hiddenSocialLinks.filter((provider): provider is string =>
        provider === "instagram" || provider === "x" || provider === "facebook" || provider === "whatsapp")
    : [];
  const visibleLinks = viewerUid === targetUid
    ? approvedLinks
    : Object.fromEntries(
        Object.entries(approvedLinks).filter(([provider]) => !hiddenProviders.includes(provider)),
      );
  const profile = projectPublicMemberProfile(targetUid, {
    ...memberData,
    profileVisibility: "public",
    approvedSocialLinks: visibleLinks,
  });
  if (!profile) {
    throw new HttpsError("permission-denied", "هذا الملف خاص ولا يمكن عرضه.");
  }
  return viewerUid === targetUid
    ? {
        ...profile,
        ...premiumFeatures,
        profileVisibility: memberData.profileVisibility === "public" ? "public" : "private",
        canManageSocialLinks: biometricLinksActive,
        hiddenSocialLinks: hiddenProviders,
      }
    : { ...profile, ...premiumFeatures };
});

/** A member may change only their own profile visibility. */
/**
 * Selects one validated custom avatar or cover and starts its 30-day lifetime.
 * A replaced asset receives its own bounded superseded deadline.
 */
export const setMemberProfileMedia = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const mediaId = typeof request.data?.mediaId === "string" ? request.data.mediaId.trim() : "";
  const slot = request.data?.slot;
  if (!/^[0-9a-f-]{36}$/i.test(mediaId) || (slot !== "avatar" && slot !== "cover")) {
    throw new HttpsError("invalid-argument", "بيانات الصورة الشخصية أو الغلاف غير صالحة.");
  }

  const userRef = db.collection("users").doc(uid);
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const nowMs = Date.now();
  const newExpiry = Timestamp.fromMillis(nowMs + 30 * 24 * 60 * 60 * 1000);
  let previousMediaId: string | null = null;

  await db.runTransaction(async (transaction) => {
    const [userSnapshot, assetSnapshot] = await Promise.all([
      transaction.get(userRef), transaction.get(assetRef),
    ]);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "أكمل ملف العضوية أولاً.");
    }
    if (!assetSnapshot.exists) throw new HttpsError("not-found", "ملف الصورة غير موجود.");
    const asset = assetSnapshot.data() ?? {};
    const assetExpiry = asset.retentionExpiresAt;
    if (asset.ownerUid !== uid || asset.mediaPurpose !== "avatar_cover" ||
        asset.status !== "security_approved" ||
        !(assetExpiry instanceof Timestamp) || assetExpiry.toMillis() <= nowMs) {
      throw new HttpsError("failed-precondition", "لا يمكن اختيار صورة لم تجتز الفحص أو انتهت صلاحيتها.");
    }
    if (typeof asset.profileMediaSlot === "string" && asset.profileMediaSlot !== slot) {
      throw new HttpsError("failed-precondition", "هذه الصورة مرتبطة بخانة أخرى بالفعل.");
    }

    const userData = userSnapshot.data() ?? {};
    const mediaField = slot === "avatar" ? "avatarMediaId" : "coverMediaId";
    const defaultField = slot === "avatar" ? "avatarUsesDefault" : "coverUsesDefault";
    previousMediaId = typeof userData[mediaField] === "string" ? userData[mediaField] as string : null;
    if (previousMediaId === mediaId) return;

    const previousSnapshot = previousMediaId && previousMediaId !== mediaId
      ? await transaction.get(db.collection("mediaAssets").doc(previousMediaId))
      : null;
    if (previousSnapshot?.exists) {
      const previous = previousSnapshot.data() ?? {};
      if (previous.ownerUid === uid && previous.mediaPurpose === "avatar_cover" &&
          previous.profileMediaSlot === slot && previous.status !== "manually_deleted" &&
          previous.status !== "manual_deletion_pending" && previous.status !== "self_destructed") {
        const existingExpiry = previous.retentionExpiresAt instanceof Timestamp
          ? previous.retentionExpiresAt.toMillis()
          : nowMs;
        const supersededPolicy = "thirty_day_superseded_avatar_cover";
        transaction.update(previousSnapshot.ref, {
          supersededAt: FieldValue.serverTimestamp(),
          retentionExpiresAt: Timestamp.fromMillis(Math.min(existingExpiry, newExpiry.toMillis())),
          retentionPolicyStatus: previous.legalHoldStatus === "active" ? "legal_hold" : supersededPolicy,
          ...(previous.legalHoldStatus === "active" ? {
            resumeRetentionPolicyStatus: supersededPolicy,
          } : {}),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    transaction.update(assetRef, {
      profileMediaSlot: slot,
      selectedAt: FieldValue.serverTimestamp(),
      retentionExpiresAt: newExpiry,
      retentionPolicyStatus: asset.legalHoldStatus === "active" ? "legal_hold" : "thirty_day_avatar_cover",
      ...(asset.legalHoldStatus === "active" ? {
        resumeRetentionPolicyStatus: "thirty_day_avatar_cover",
      } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(userRef, {
      [mediaField]: mediaId,
      [defaultField]: false,
      [`${slot}SelectedAt`]: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await db.collection("mediaAccessAudit").add({
    actorUid: uid,
    mediaId,
    action: "member_profile_media_selected",
    slot,
    previousMediaId,
    outcome: "success",
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  return { mediaId, slot, selected: true, previousMediaId };
});


/** Reverts one selected custom profile image to the built-in Mawda default. */
export const resetMemberProfileMedia = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const slot = request.data?.slot;
  if (slot !== "avatar" && slot !== "cover") {
    throw new HttpsError("invalid-argument", "خانة الصورة غير صالحة.");
  }
  const userRef = db.collection("users").doc(uid);
  let previousMediaId: string | null = null;
  await db.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists) throw new HttpsError("not-found", "ملف العضو غير موجود.");
    const user = userSnapshot.data() ?? {};
    const mediaField = slot === "avatar" ? "avatarMediaId" : "coverMediaId";
    const defaultField = slot === "avatar" ? "avatarUsesDefault" : "coverUsesDefault";
    previousMediaId = typeof user[mediaField] === "string" ? user[mediaField] as string : null;
    if (previousMediaId) {
      const assetRef = db.collection("mediaAssets").doc(previousMediaId);
      const assetSnapshot = await transaction.get(assetRef);
      if (assetSnapshot.exists) {
        const asset = assetSnapshot.data() ?? {};
        if (asset.ownerUid === uid && asset.mediaPurpose === "avatar_cover" &&
            asset.profileMediaSlot === slot &&
            !["self_destructed", "manually_deleted", "manual_deletion_pending"].includes(String(asset.status))) {
          const currentExpiry = asset.retentionExpiresAt instanceof Timestamp
            ? asset.retentionExpiresAt.toMillis()
            : Date.now();
          const supersededExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
          transaction.update(assetRef, {
            supersededAt: FieldValue.serverTimestamp(),
            retentionExpiresAt: Timestamp.fromMillis(Math.min(currentExpiry, supersededExpiry)),
            retentionPolicyStatus: asset.legalHoldStatus === "active"
              ? "legal_hold" : "thirty_day_superseded_avatar_cover",
            ...(asset.legalHoldStatus === "active"
              ? { resumeRetentionPolicyStatus: "thirty_day_superseded_avatar_cover" }
              : {}),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }
    transaction.set(userRef, {
      [mediaField]: FieldValue.delete(),
      [defaultField]: true,
      [`${slot}DefaultAppliedAt`]: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  await db.collection("mediaAccessAudit").add({
    actorUid: uid,
    mediaId: previousMediaId,
    action: "member_profile_media_reset_to_default",
    slot,
    outcome: "success",
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  return { slot, usesDefault: true, previousMediaId };
});


/** Publishes a story only after its media passed the trusted malware pipeline. */
export const createMemberStory = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const mediaId = typeof request.data?.mediaId === "string" ? request.data.mediaId.trim() : "";
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
    throw new HttpsError("invalid-argument", "معرف وسائط القصة غير صالح.");
  }
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  const memberRef = db.collection("users").doc(uid);
  // The media ID is the idempotency key: a retry cannot publish duplicates.
  const storyRef = db.collection("stories").doc(mediaId);
  const nowMs = Date.now();
  let expiresAtMs = 0;
  let idempotentReplay = false;
  await db.runTransaction(async (transaction) => {
    const [assetSnapshot, existingStory, memberSnapshot] = await Promise.all([
      transaction.get(assetRef), transaction.get(storyRef), transaction.get(memberRef),
    ]);
    if (!memberSnapshot.exists || memberSnapshot.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(memberSnapshot.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بنشر القصص.");
    }
    if (existingStory.exists) {
      const prior = existingStory.data() ?? {};
      if (prior.ownerUid === uid && prior.mediaId === mediaId &&
          prior.status === "active" && prior.expiresAt instanceof Timestamp &&
          prior.expiresAt.toMillis() > nowMs) {
        expiresAtMs = prior.expiresAt.toMillis();
        idempotentReplay = true;
        return;
      }
      throw new HttpsError("already-exists", "سبق استخدام هذه الوسائط في قصة أخرى.");
    }
    if (!assetSnapshot.exists) throw new HttpsError("not-found", "وسائط القصة غير موجودة.");
    const asset = assetSnapshot.data() ?? {};
    const expiry = asset.retentionExpiresAt;
    if (asset.ownerUid !== uid || asset.mediaPurpose !== "story" ||
        asset.status !== "security_approved" ||
        asset.processingStatus !== "safe_raster_derivative_ready" ||
        asset.safePreviewPath !== `processed/${uid}/${mediaId}/preview.webp` ||
        asset.safePreviewContentType !== "image/webp" ||
        !(expiry instanceof Timestamp) || expiry.toMillis() <= nowMs) {
      throw new HttpsError("failed-precondition", "لا يمكن نشر قصة قبل اجتياز فحص الوسائط أو بعد انتهاء صلاحيتها.");
    }
    expiresAtMs = expiry.toMillis();
    transaction.create(storyRef, {
      ownerUid: uid,
      mediaId,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiry,
    });
    transaction.update(assetRef, {
      storyDocumentId: storyRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await db.collection("mediaAccessAudit").add({
    actorUid: uid, mediaId, action: "member_story_created",
    storyId: storyRef.id, outcome: "success",
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  return { storyId: storyRef.id, mediaId, expiresAt: expiresAtMs, idempotentReplay };
});

/** Returns active stories only; private profiles are visible to their owner only. */
export const listMemberStories = onCall(async (request) => {
  const viewerUid = requireAuthenticatedUid(request.auth?.uid);
  const requestedUid = typeof request.data?.userId === "string" ? request.data.userId.trim() : "";
  if (requestedUid.length > 128) throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  const now = Timestamp.now();
  let query = db.collection("stories").where("status", "==", "active")
    .where("expiresAt", ">", now).orderBy("expiresAt", "asc").limit(50);
  if (requestedUid) query = query.where("ownerUid", "==", requestedUid) as typeof query;
  const snapshot = await query.get();
  const ownerIds = [...new Set(snapshot.docs.map((doc) => String(doc.data().ownerUid ?? "")))];
  const users = new Map<string, Record<string, unknown>>();
  for (const ownerId of ownerIds) {
    const userSnapshot = await db.collection("users").doc(ownerId).get();
    if (userSnapshot.exists) users.set(ownerId, userSnapshot.data() ?? {});
  }
  const stories = snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    const ownerUid = String(data.ownerUid ?? "");
    const owner = users.get(ownerUid);
    if (!owner || (viewerUid !== ownerUid && owner.profileVisibility !== "public")) return [];
    return [{
      storyId: doc.id,
      ownerUid,
      displayName: typeof owner.displayName === "string" ? owner.displayName : "Mawda Member",
      mediaId: data.mediaId,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
      expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : null,
    }];
  });
  return { stories };
});


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


/**
 * Updates only editable member-profile fields. Identity, age, username,
 * verification state, roles, balances and moderation fields remain server-owned.
 */
export const updateMemberProfile = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const userRef = db.collection("users").doc(uid);
  const requested = request.data?.profile;
  try {
    const result = await db.runTransaction(async (transaction) => {
      const member = await transaction.get(userRef);
      if (!member.exists || member.data()?.profileCompleted !== true) {
        throw new HttpsError("failed-precondition", "يجب إكمال العضوية أولاً.");
      }
      const currentAge = member.data()?.age;
      if (typeof currentAge !== "number" || !Number.isSafeInteger(currentAge)) {
        throw new HttpsError("failed-precondition", "بيانات العمر المسجلة غير صالحة؛ يلزم دعم الإدارة.");
      }
      let update: Record<string, unknown>;
      try {
        update = validateMemberProfileUpdate(requested, currentAge);
      } catch (error) {
        const code = error instanceof Error ? error.message : "INVALID_PROFILE_UPDATE";
        if (code === "ADULT_RELATIONSHIP_GOAL_REQUIRES_ADULT") {
          throw new HttpsError("failed-precondition", "التعارف العاطفي ونية الزواج متاحان للأعضاء بعمر 18 عاماً فأكثر.");
        }
        throw new HttpsError("invalid-argument", "توجد بيانات غير صالحة أو حقول لا يُسمح بتعديلها.");
      }
      transaction.update(userRef, {
        ...update,
        ...(typeof update.fullName === "string" ? { displayName: update.fullName } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const auditRef = db.collection("memberProfileAudit").doc();
      transaction.create(auditRef, {
        memberUid: uid,
        action: "member_profile_updated",
        changedFields: Object.keys(update).sort(),
        createdAt: FieldValue.serverTimestamp(),
      });
      return { updatedFields: Object.keys(update).sort() };
    });
    return result;
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error("Member profile update failed", { uid, error });
    throw new HttpsError("internal", "تعذر حفظ الملف الشخصي حالياً.");
  }
});


/**
 * Saves optional profile links only while trusted biometric verification is active.
 * Expiry/revocation is rechecked on every profile read, so stale links are hidden.
 */
export const setMemberProfileSocialLinks = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const userRef = db.collection("users").doc(uid);
  let links;
  try {
    links = validateMemberSocialLinks(request.data?.links);
  } catch {
    throw new HttpsError("invalid-argument", "روابط الملف الشخصي غير صالحة أو لا تنتمي إلى النطاقات الرسمية.");
  }

  await db.runTransaction(async (transaction) => {
    const member = await transaction.get(userRef);
    const data = member.data() ?? {};
    if (!member.exists || !canEditMemberSocialLinks(
      uid,
      member.id,
      data.profileCompleted === true,
      links,
      data.biometricVerification,
    )) {
      throw new HttpsError(
        "failed-precondition",
        "تتطلب إدارة روابط الملف إكمال الملف الشخصي وتوثيقاً بيومترياً نشطاً للحساب نفسه.",
      );
    }
    const allowedProviders = Object.keys(links);
    const hiddenSocialLinks = Array.isArray(data.hiddenSocialLinks)
      ? data.hiddenSocialLinks.filter((provider): provider is string =>
          typeof provider === "string" && allowedProviders.includes(provider))
      : [];
    transaction.update(userRef, {
      profileSocialLinks: links,
      hiddenSocialLinks,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("memberProfileAudit").doc();
    transaction.create(auditRef, {
      memberUid: uid,
      action: "member_profile_social_links_updated",
      providers: Object.keys(links).sort(),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { savedProviders: Object.keys(links).sort() };
});


/** Per-link privacy control. Hiding is always permitted; revealing requires active verification. */
export const setMemberProfileSocialLinkVisibility = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const provider = request.data?.provider;
  const hidden = request.data?.hidden;
  const allowedProviders = ["instagram", "x", "facebook", "whatsapp"];
  if (typeof provider !== "string" || !allowedProviders.includes(provider) || typeof hidden !== "boolean") {
    throw new HttpsError("invalid-argument", "إعداد خصوصية رابط التواصل غير صالح.");
  }

  const userRef = db.collection("users").doc(uid);
  await db.runTransaction(async (transaction) => {
    const member = await transaction.get(userRef);
    const data = member.data() ?? {};
    if (!member.exists || data.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "يجب إكمال الملف الشخصي أولاً.");
    }
    const links = projectMemberSocialLinks(data.profileSocialLinks);
    if (!links[provider as keyof typeof links]) {
      throw new HttpsError("not-found", "رابط التواصل المطلوب غير موجود.");
    }
    if (!canChangeMemberSocialLinkVisibility(hidden, data.biometricVerification)) {
      throw new HttpsError("failed-precondition", "إظهار الرابط يتطلب توثيقاً بيومترياً نشطاً.");
    }

    const currentHidden = Array.isArray(data.hiddenSocialLinks)
      ? data.hiddenSocialLinks.filter((value): value is string =>
          typeof value === "string" && allowedProviders.includes(value))
      : [];
    const nextHidden = hidden
      ? Array.from(new Set([...currentHidden, provider]))
      : currentHidden.filter((value) => value !== provider);
    transaction.update(userRef, {
      hiddenSocialLinks: nextHidden,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("memberProfileAudit").doc();
    transaction.create(auditRef, {
      memberUid: uid,
      action: hidden ? "member_profile_social_link_hidden" : "member_profile_social_link_revealed",
      provider,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { provider, hidden };
});


/**
 * Member-controlled block/unblock. The server owns the block list because
 * direct-message authorization checks both participants' blockedUids fields.
 * This action deliberately sends no notification to the blocked account.
 */
export const setMemberBlock = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const targetUid = typeof request.data?.targetUid === "string"
    ? request.data.targetUid.trim()
    : "";
  const blocked = request.data?.blocked;
  if (!targetUid || targetUid.length > 128 || targetUid === uid ||
      typeof blocked !== "boolean") {
    throw new HttpsError("invalid-argument", "بيانات الحظر غير صالحة.");
  }

  const actorRef = db.collection("users").doc(uid);
  const targetRef = db.collection("users").doc(targetUid);
  await db.runTransaction(async (transaction) => {
    const [actor, target] = await Promise.all([
      transaction.get(actorRef),
      transaction.get(targetRef),
    ]);
    if (!actor.exists || actor.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "يجب إكمال العضوية قبل إدارة قائمة الحظر.");
    }
    if (!target.exists) {
      throw new HttpsError("not-found", "تعذر العثور على الحساب المطلوب.");
    }
    transaction.update(actorRef, {
      blockedUids: blocked
        ? FieldValue.arrayUnion(targetUid)
        : FieldValue.arrayRemove(targetUid),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { targetUid, blocked };
});

/** Returns only the caller's own reports and adverse decisions. */
export const getMySafetyCases = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const [reported, actions] = await Promise.all([
    db.collection("safetyCases").where("reporterUid", "==", uid).limit(30).get(),
    db.collection("safetyCases").where("subjectUid", "==", uid).limit(50).get(),
  ]);
  return {
    reports: reported.docs.map((doc) => {
      const data = doc.data();
      return {
        caseId: doc.id,
        category: data.category,
        contextType: data.contextType,
        status: data.status,
        appealStatus: data.appealStatus,
        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    }),
    decisions: actions.docs.filter((doc) => doc.data().status === "action_taken").slice(0, 30).map((doc) => {
      const data = doc.data();
      return {
        caseId: doc.id,
        status: data.status,
        decisionReason: data.decisionReason ?? "",
        appealStatus: data.appealStatus,
        reviewedAt: data.reviewedAt?.toMillis?.() ?? null,
      };
    }),
  };
});

/** Owner-only queue of member appeals. */
export const listSafetyAppeals = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await db.collection("safetyAppeals")
    .where("status", "==", "pending").limit(50).get();
  return {
    appeals: snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        appealId: doc.id,
        caseId: data.caseId,
        appellantUid: data.appellantUid,
        reason: data.reason,
        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    }),
  };
});

/** Owner resolves an appeal; accepting it overturns the adverse case decision. */
export const reviewSafetyAppeal = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const appealId = request.data?.appealId;
  const decision = request.data?.decision;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (typeof appealId !== "string" || appealId.length < 8 || appealId.length > 300 ||
      !["accepted", "rejected"].includes(decision) || reason.length < 10 || reason.length > 1000) {
    throw new HttpsError("invalid-argument", "بيانات قرار الاستئناف غير صالحة.");
  }
  const appealRef = db.collection("safetyAppeals").doc(appealId);
  let caseId = "";
  await db.runTransaction(async (transaction) => {
    const appeal = await transaction.get(appealRef);
    const data = appeal.data();
    if (!appeal.exists || typeof data?.caseId !== "string") {
      throw new HttpsError("failed-precondition", "الاستئناف غير موجود أو سبق البت فيه.");
    }
    caseId = data.caseId;
    if (data.status === decision && data.reviewedBy === actorUid) return;
    if (data.status !== "pending") {
      throw new HttpsError("failed-precondition", "الاستئناف غير موجود أو سبق البت فيه.");
    }
    const caseRef = db.collection("safetyCases").doc(caseId);
    const safetyCase = await transaction.get(caseRef);
    if (!safetyCase.exists || safetyCase.data()?.appealStatus !== "pending") {
      throw new HttpsError("failed-precondition", "ملف البلاغ المرتبط غير متاح للمراجعة.");
    }
    transaction.update(appealRef, {
      status: decision,
      decisionReason: reason,
      reviewedBy: actorUid,
      reviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(caseRef, {
      status: decision === "accepted" ? "dismissed" : "action_taken",
      appealStatus: decision,
      appealReviewedBy: actorUid,
      appealReviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(decision === "accepted" ? { decisionOverturnedAt: FieldValue.serverTimestamp() } : {}),
    });
  });
  await appendOwnerReviewAuditEvent({
    actorUid,
    action: "safety_appeal_reviewed",
    caseId,
    decision,
    outcome: "completed",
  }, `safety_appeal_review_${createHash("sha256").update(appealId).digest("hex")}`);
  return { appealId, caseId, decision };
});

/**
 * Member safety report intake. Reports are private to the reporter and platform
 * owner; clients cannot set workflow status, severity, or reviewer decisions.
 */
export const submitSafetyReport = onCall(async (request) => {
  const reporterUid = requireAuthenticatedUid(request.auth?.uid);
  let input;
  try {
    input = validateSafetyReportInput((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "بيانات البلاغ غير صالحة.");
  }
  if (input.targetUid === reporterUid) {
    throw new HttpsError("invalid-argument", "لا يمكن تقديم بلاغ ضد حسابك.");
  }
  const reporterRef = db.collection("users").doc(reporterUid);
  const targetRef = db.collection("users").doc(input.targetUid);
  const caseId = createHash("sha256").update(`${reporterUid}:${input.requestId}`).digest("hex");
  const caseRef = db.collection("safetyCases").doc(caseId);
  const result = await db.runTransaction(async (transaction) => {
    const [reporter, target, existing] = await Promise.all([
      transaction.get(reporterRef), transaction.get(targetRef), transaction.get(caseRef),
    ]);
    if (!reporter.exists || reporter.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(reporter.data())) {
      throw new HttpsError("failed-precondition", "يجب أن تكون العضوية مكتملة وفعالة لتقديم بلاغ.");
    }
    if (!target.exists) throw new HttpsError("not-found", "الحساب موضوع البلاغ غير موجود.");
    if (existing.exists) {
      if (existing.data()?.reporterUid !== reporterUid) {
        throw new HttpsError("already-exists", "معرف البلاغ مستخدم مسبقاً.");
      }
      return { caseId, duplicate: true };
    }
    transaction.create(caseRef, {
      caseId,
      reporterUid,
      subjectUid: input.targetUid,
      category: input.category,
      contextType: input.contextType,
      contextId: input.contextId,
      description: input.description,
      status: "open",
      appealStatus: "not_available",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { caseId, duplicate: false };
  });
  await appendOwnerReviewAuditEvent({
      actorUid: reporterUid,
      action: "safety_report_submitted",
      caseId,
      subjectUid: input.targetUid,
      category: input.category,
      contextType: input.contextType,
      outcome: "created",
    }, `safety_report_${caseId}`);
  return result;
});

/** A reported member may appeal an owner-recorded adverse decision once per case. */
export const submitSafetyAppeal = onCall(async (request) => {
  const appellantUid = requireAuthenticatedUid(request.auth?.uid);
  let input;
  try {
    input = validateSafetyAppealInput((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "بيانات الاستئناف غير صالحة.");
  }
  const caseRef = db.collection("safetyCases").doc(input.caseId);
  const appealRef = db.collection("safetyAppeals").doc(`${input.caseId}_${appellantUid}`);
  const result = await db.runTransaction(async (transaction) => {
    const [caseSnapshot, appealSnapshot] = await Promise.all([
      transaction.get(caseRef), transaction.get(appealRef),
    ]);
    const data = caseSnapshot.data();
    if (!caseSnapshot.exists || data?.subjectUid !== appellantUid) {
      throw new HttpsError("not-found", "لا يوجد قرار قابل للاستئناف لهذا الحساب.");
    }
    if (data.status !== "action_taken" || data.appealStatus === "accepted") {
      throw new HttpsError("failed-precondition", "لا يمكن استئناف هذه الحالة في وضعها الحالي.");
    }
    if (appealSnapshot.exists) {
      return { caseId: input.caseId, appealId: appealRef.id, duplicate: true };
    }
    transaction.create(appealRef, {
      appealId: appealRef.id,
      caseId: input.caseId,
      appellantUid,
      reason: input.reason,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(caseRef, {
      appealStatus: "pending",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { caseId: input.caseId, appealId: appealRef.id, duplicate: false };
  });
  await appendOwnerReviewAuditEvent({
      actorUid: appellantUid,
      action: "safety_appeal_submitted",
      caseId: input.caseId,
      outcome: "created",
    }, `safety_appeal_${createHash("sha256").update(appealRef.id).digest("hex")}`);
  return result;
});

/** Owner-only bounded safety queue; no member can enumerate reports or appeals. */
export const listSafetyCases = onCall(async (request) => {
  requireOwner(request);
  const status = request.data?.status;
  if (status !== undefined && !["open", "action_taken", "dismissed"].includes(status)) {
    throw new HttpsError("invalid-argument", "مرشح حالة البلاغ غير صالح.");
  }
  const limit = Number.isSafeInteger(request.data?.limit)
    ? Math.max(1, Math.min(50, request.data.limit as number))
    : 25;
  let query = db.collection("safetyCases").orderBy("createdAt", "desc").limit(limit);
  if (typeof status === "string") query = db.collection("safetyCases")
    .where("status", "==", status).orderBy("createdAt", "desc").limit(limit);
  const snapshot = await query.get();
  return {
    cases: snapshot.docs.map((doc) => ({ caseId: doc.id, ...doc.data() })),
  };
});

/** Owner-only final decision. A reason is mandatory and all decisions are audited. */
export const reviewSafetyCase = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const caseId = request.data?.caseId;
  const decision = request.data?.decision;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (typeof caseId !== "string" || caseId.length < 8 || caseId.length > 160 ||
      !["action_taken", "dismissed"].includes(decision) || reason.length < 10 || reason.length > 1000) {
    throw new HttpsError("invalid-argument", "بيانات قرار البلاغ غير صالحة.");
  }
  const caseRef = db.collection("safetyCases").doc(caseId);
  const subjectUid = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(caseRef);
    if (!snapshot.exists) {
      throw new HttpsError("not-found", "البلاغ غير موجود.");
    }
    const current = snapshot.data()!;
    if (current.status === decision && current.reviewedBy === actorUid) {
      return current.subjectUid as string;
    }
    if (current.status !== "open") {
      throw new HttpsError("failed-precondition", "البلاغ غير موجود أو سبق اتخاذ قرار بشأنه.");
    }
    transaction.update(caseRef, {
      status: decision,
      decisionReason: reason,
      reviewedBy: actorUid,
      reviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      appealStatus: decision === "action_taken" ? "available" : "not_available",
    });
    return snapshot.data()?.subjectUid as string;
  });
  await appendOwnerReviewAuditEvent({
    actorUid,
    action: "safety_case_reviewed",
    caseId,
    subjectUid,
    decision,
    outcome: "completed",
  }, `safety_case_review_${caseId}`);
  return { caseId, decision };
});

/** Registers a member-owned FCM token; token values are never returned to clients. */
export const registerPushToken = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const token = typeof request.data?.token === "string" ? request.data.token.trim() : "";
  const platform = request.data?.platform;
  if (token.length < 100 || token.length > 4096 ||
      !["web", "android", "ios", "macos", "windows", "linux", "other"].includes(platform)) {
    throw new HttpsError("invalid-argument", "رمز الإشعارات أو نوع الجهاز غير صالح.");
  }
  const userRef = db.collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists || user.data()?.profileCompleted !== true || !isMemberAccountInGoodStanding(user.data())) {
    throw new HttpsError("permission-denied", "تسجيل الإشعارات متاح للأعضاء الفعالين فقط.");
  }
  const tokenId = createHash("sha256").update(token).digest("hex");
  await userRef.collection("pushTokens").doc(tokenId).set({
    token, platform, active: true, updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return { registered: true, tokenId };
});

/** Deactivates only the authenticated member's exact FCM token. */
export const unregisterPushToken = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const token = typeof request.data?.token === "string" ? request.data.token.trim() : "";
  if (token.length < 100 || token.length > 4096) throw new HttpsError("invalid-argument", "رمز الإشعارات غير صالح.");
  const tokenId = createHash("sha256").update(token).digest("hex");
  await db.collection("users").doc(uid).collection("pushTokens").doc(tokenId).set({
    active: false, deactivatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return { registered: false };
});
/** Returns the caller's own block list only. */
export const getMyBlockedUsers = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists) throw new HttpsError("not-found", "ملف العضوية غير موجود.");
  const blockedUids = Array.isArray(user.data()?.blockedUids)
    ? user.data()!.blockedUids.filter((value: unknown): value is string =>
        typeof value === "string" && value.length > 0 && value.length <= 128)
    : [];
  return { blockedUids };
});

/** Owner-only live-stream broadcast to an owner/member direct chat or an active public/rented-private room. */
export const sendOwnerLiveStream = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let input;
  try { input = validateOwnerLiveStreamInput(request.data); }
  catch { throw new HttpsError("invalid-argument", "رابط البث أو بيانات الرسالة غير صالحة أو غير آمنة."); }
  if (input.scope === "direct" && !/^[a-f0-9]{64}$/.test(input.targetId)) {
    throw new HttpsError("invalid-argument", "معرف المحادثة الثنائية غير صالح.");
  }
  const messageId = createHash("sha256")
    .update("owner-live-stream:" + actorUid + ":" + input.scope + ":" + input.targetId + ":" + input.requestId)
    .digest("hex");
  const now = FieldValue.serverTimestamp();
  const liveStream = {
    url: input.url, hostname: input.hostname, provider: input.provider,
    title: input.title, description: input.description, scope: input.scope,
    targetId: input.targetId, requestId: input.requestId,
    createdBy: actorUid, createdAt: now,
  };
  const auditRef = db.collection("adminAuditLogs").doc("owner_live_stream_" + messageId);
  let recipientUid: string | null = null;
  let roomId: string | null = null;
  const result = await db.runTransaction(async (transaction) => {
    if (input.scope === "direct") {
      const chatRef = db.collection("directChats").doc(input.targetId);
      const messageRef = chatRef.collection("messages").doc(messageId);
      const chat = await transaction.get(chatRef);
      if (!chat.exists) throw new HttpsError("not-found", "المحادثة الثنائية غير موجودة.");
      const participants = chat.data()?.participantUids;
      if (!Array.isArray(participants) || participants.length !== 2 ||
          participants.some((uid) => typeof uid !== "string") ||
          !participants.includes(actorUid)) {
        throw new HttpsError("permission-denied", "يمكن للمالك إرسال البث فقط إلى محادثة ثنائية يكون أحد طرفيها.");
      }
      const peer = participants.find((uid) => uid !== actorUid);
      if (!peer) throw new HttpsError("failed-precondition", "طرف المحادثة غير صالح.");
      const [member, existing] = await Promise.all([
        transaction.get(db.collection("users").doc(peer)),
        transaction.get(messageRef),
      ]);
      if (!member.exists || !isMemberAccountInGoodStanding(member.data())) {
        throw new HttpsError("permission-denied", "العضو المستلم غير مؤهل لاستقبال رسائل المنصة.");
      }
      if (existing.exists) {
        const prior = existing.data() ?? {};
        if (prior.senderUid !== actorUid || prior.liveStream?.url !== input.url) {
          throw new HttpsError("already-exists", "معرف البث مستخدم لرسالة أخرى.");
        }
        recipientUid = peer;
        return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: true };
      }
      recipientUid = peer;
      transaction.create(messageRef, {
        messageId, chatId: input.targetId, senderUid: actorUid, recipientUid: peer,
        text: input.title || "بث مباشر من مالك منصة مودة",
        type: "live_stream", liveStream, isPlatformOwnerMessage: true,
        senderLabel: "إدارة منصة مودة", createdAt: now,
      });
      transaction.set(chatRef, {
        lastMessageAt: now, lastMessageSenderUid: actorUid,
        lastMessagePreview: input.title || "أرسل مالك المنصة بثاً مباشراً.",
      }, { merge: true });
      const notificationRef = db.collection("users").doc(peer).collection("notifications").doc("live_" + messageId);
      transaction.create(notificationRef, {
        notificationId: "live_" + messageId, type: "owner_live_stream",
        senderUid: actorUid, chatId: input.targetId, messageId,
        title: "بث مباشر من مالك مودة",
        body: "أرسل مالك المنصة رابط بث مباشر في محادثتك.",
        isRead: false, createdAt: now,
      });
    } else {
      const roomRef = db.collection("rooms").doc(input.targetId);
      const messageRef = roomRef.collection("messages").doc(messageId);
      const room = await transaction.get(roomRef);
      if (!room.exists || room.data()?.status !== "active") {
        throw new HttpsError("failed-precondition", "لا يمكن إرسال البث إلى غرفة مغلقة أو غير نشطة.");
      }
      const roomData = room.data() ?? {};
      if (roomData.kind === "private") {
        if (roomData.isRented !== true || typeof roomData.rentalId !== "string") {
          throw new HttpsError("failed-precondition", "الغرف الخاصة يجب أن تكون مستأجرة ونشطة لاستقبال البث.");
        }
        const rental = await transaction.get(db.collection("roomRentals").doc(roomData.rentalId));
        const expiresAt = roomData.expiresAt;
        const rentalExpiry = rental.data()?.expiresAt;
        if (!rental.exists || rental.data()?.status !== "active" || rental.data()?.roomId !== input.targetId ||
            !(expiresAt instanceof Timestamp) || expiresAt.toMillis() <= Date.now() ||
            !(rentalExpiry instanceof Timestamp) || rentalExpiry.toMillis() <= Date.now()) {
          throw new HttpsError("failed-precondition", "انتهت صلاحية استئجار الغرفة الخاصة.");
        }
      } else if (roomData.kind !== "public") {
        throw new HttpsError("failed-precondition", "نوع الغرفة لا يدعم بث المالك.");
      }
      const existing = await transaction.get(messageRef);
      if (existing.exists) {
        const prior = existing.data() ?? {};
        if (prior.senderUid !== actorUid || prior.liveStream?.url !== input.url) {
          throw new HttpsError("already-exists", "معرف البث مستخدم لرسالة أخرى.");
        }
        roomId = input.targetId;
        return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: true };
      }
      roomId = input.targetId;
      transaction.create(messageRef, {
        messageId, senderUid: actorUid,
        content: input.title || "بث مباشر من مالك منصة مودة",
        type: "live_stream", liveStream, isPlatformOwnerMessage: true,
        senderLabel: "إدارة منصة مودة", isDeleted: false, createdAt: now,
      });
    }
    transaction.create(auditRef, {
      actorUid, action: "owner_live_stream_broadcast",
      scope: input.scope, targetId: input.targetId, messageId,
      hostname: input.hostname, url: input.url, provider: input.provider,
      title: input.title, description: input.description, createdAt: now,
    });
    return { messageId, scope: input.scope, targetId: input.targetId, idempotentReplay: false };
  });
  if (!result.idempotentReplay) {
    if (recipientUid) {
      await sendPushToMember(recipientUid, "بث مباشر من مالك مودة",
        "أرسل مالك المنصة رابط بث مباشر في محادثتك.",
        { type: "owner_live_stream", chatId: input.targetId, messageId });
    } else if (roomId !== null) {
      const broadcastRoomId = roomId;
      try {
        const members = await db.collection("rooms").doc(broadcastRoomId).collection("members").limit(1000).get();
        await Promise.all(members.docs.map((member) =>
          sendPushToMember(member.id, "بث مباشر من مالك مودة",
            "أرسل مالك المنصة بثاً مباشراً في غرفتك.",
            { type: "owner_live_stream", roomId: broadcastRoomId, messageId })));
      } catch (error) {
        logger.warn("Owner live stream room notification fan-out failed", { roomId, error });
      }
    }
  }
  return { ...result, provider: input.provider, hostname: input.hostname };
});

/**
 * Sends a text-only direct message through a trusted callable.
 * Client writes to chat and notification collections remain denied by rules.
 */
export const sendDirectMessage = onCall(async (request) => {
  const senderUid = requireAuthenticatedUid(request.auth?.uid);
  let message;
  try {
    message = validateDirectMessageInput((request.data ?? {}) as Record<string, unknown>);
  } catch {
    throw new HttpsError("invalid-argument", "بيانات الرسالة غير صالحة أو تجاوزت الحد المسموح.");
  }
  const { recipientUid, text: messageText, clientMessageId } = message;
  if (senderUid === recipientUid) {
    throw new HttpsError("failed-precondition", "لا يمكنك مراسلة حسابك الشخصي.");
  }

  const [firstUid, secondUid] = [senderUid, recipientUid].sort();
  const chatId = createDirectChatId(firstUid, secondUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const messageId = createHash("sha256")
    .update(senderUid + ":" + clientMessageId)
    .digest("hex");
  const messageRef = chatRef.collection("messages").doc(messageId);
  const notificationRef = recipientRef.collection("notifications").doc(messageId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [senderSnapshot, recipientSnapshot, existingChat, existingMessage] = await Promise.all([
        transaction.get(senderRef),
        transaction.get(recipientRef),
        transaction.get(chatRef),
        transaction.get(messageRef),
      ]);
      if (!senderSnapshot.exists || !recipientSnapshot.exists) {
        throw new HttpsError("not-found", "حساب المرسل أو المستلم غير موجود.");
      }
      const sender = senderSnapshot.data() ?? {};
      const recipient = recipientSnapshot.data() ?? {};
      const ownerSession = hasPlatformOwnerSession((request.auth?.token ?? {}) as Record<string, unknown>);
      const isBiometricallyVerified = hasActiveBiometricVerification(sender.biometricVerification);
      try {
        assertMessageLinksAllowed(
          messageText,
          canSendApprovedPlatformLinks({ isBiometricallyVerified, isPlatformOwner: ownerSession }),
          ownerSession,
          isBiometricallyVerified ? BIOMETRIC_APPROVED_HOSTS : undefined,
        );
      } catch {
        throw new HttpsError("invalid-argument", "الروابط غير مسموحة لهذه العضوية أو أن صيغة الرابط غير آمنة.");
      }
      if (sender.profileCompleted !== true || recipient.profileCompleted !== true ||
          !isMemberAccountInGoodStanding(sender) || !isMemberAccountInGoodStanding(recipient)) {
        throw new HttpsError("permission-denied", "لا يمكن إرسال الرسالة إلى هذا الحساب.");
      }
      const senderAge = sender.age;
      const recipientAge = recipient.age;
      if (!Number.isSafeInteger(senderAge) || !Number.isSafeInteger(recipientAge) ||
          ((senderAge < 18) !== (recipientAge < 18))) {
        throw new HttpsError("permission-denied", "المراسلة الخاصة بين القاصرين والبالغين غير متاحة.");
      }
      const senderBlocks = Array.isArray(sender.blockedUids) ? sender.blockedUids : [];
      const recipientBlocks = Array.isArray(recipient.blockedUids) ? recipient.blockedUids : [];
      if (senderBlocks.includes(recipientUid) || recipientBlocks.includes(senderUid)) {
        throw new HttpsError("permission-denied", "لا يمكن إرسال الرسائل بين هذين الحسابين.");
      }

      if (existingMessage.exists) {
        const prior = existingMessage.data() ?? {};
        if (prior.senderUid !== senderUid || prior.recipientUid !== recipientUid ||
            prior.text !== messageText) {
          throw new HttpsError("already-exists", "معرف الرسالة مستخدم لرسالة أخرى.");
        }
        return { chatId, messageId, replayed: true };
      }

      const createdAt = FieldValue.serverTimestamp();
      transaction.set(chatRef, {
        participantUids: [firstUid, secondUid],
        createdAt: existingChat.exists
          ? existingChat.data()?.createdAt ?? createdAt
          : createdAt,
        lastMessageAt: createdAt,
        lastMessageSenderUid: senderUid,
        lastMessagePreview: messageText.substring(0, 120),
      }, { merge: true });
      transaction.create(messageRef, {
        messageId,
        chatId,
        senderUid,
        recipientUid,
        text: messageText,
        type: "text",
        createdAt,
      });
      transaction.create(notificationRef, {
        notificationId: messageId,
        type: "direct_message",
        senderUid,
        chatId,
        messageId,
        title: "رسالة جديدة",
        body: "لديك رسالة جديدة. افتح مودة لقراءتها.",
        isRead: false,
        createdAt,
      });
      return { chatId, messageId, replayed: false };
    });
    if (!result.replayed) {
      await sendPushToMember(recipientUid, "رسالة جديدة في مودة", "لديك رسالة جديدة. افتح مودة لقراءتها.",
        { type: "direct_message", chatId, messageId });
    }
    return result;
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error("Direct message send failed", { senderUid, recipientUid, error });
    throw new HttpsError("internal", "تعذر إرسال الرسالة حالياً.");
  }
});


/**
 * Reads direct messages and the other participant's read cursor.
 * Reading does not itself change receipts; markDirectChatRead is a separate,
 * explicit member action and is never called by owner-review endpoints.
 */
export const getDirectMessages = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || user.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(user.data())) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بقراءة المحادثات حالياً.");
  }
  let chatId = request.data?.chatId;
  const peerUid = request.data?.peerUid;
  const expectedPeerChatId = typeof peerUid === "string" && peerUid.length > 0 &&
      peerUid.length <= 128 && peerUid !== uid
    ? createDirectChatId(...([uid, peerUid].sort() as [string, string]))
    : null;
  if (typeof chatId !== "string") {
    if (expectedPeerChatId === null) {
      throw new HttpsError("invalid-argument", "معرف المحادثة أو العضو الآخر غير صالح.");
    }
    chatId = expectedPeerChatId;
  }
  if (!/^[a-f0-9]{64}$/.test(chatId)) {
    throw new HttpsError("invalid-argument", "معرف المحادثة غير صالح.");
  }
  const chatRef = db.collection("directChats").doc(chatId);
  const chat = await chatRef.get();
  // A valid peer pair may open an empty conversation before the first message.
  if (!chat.exists) {
    if (expectedPeerChatId !== null && chatId === expectedPeerChatId) {
      return { chatId, messages: [], peerLastReadAt: null };
    }
    throw new HttpsError("not-found", "المحادثة غير موجودة.");
  }
  const participants = chat.data()?.participantUids;
  if (!Array.isArray(participants) || participants.length !== 2 ||
      participants.some((value) => typeof value !== "string") ||
      participants[0] === participants[1] || !participants.includes(uid)) {
    throw new HttpsError("permission-denied", "ليست لديك صلاحية قراءة هذه المحادثة.");
  }
  const peer = participants.find((participant) => participant !== uid)!;
  if (typeof peerUid === "string" && peerUid !== peer) {
    throw new HttpsError("permission-denied", "معرف الطرف الآخر لا يطابق أطراف المحادثة.");
  }
  const messages = await chatRef.collection("messages")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  const receiptRefs = participants.map((participant) =>
    chatRef.collection("readReceipts").doc(participant),
  );
  const receiptSnapshots = await db.getAll(...receiptRefs);
  const peerReceipt = receiptSnapshots[participants.indexOf(peer)].data() ?? {};
  const peerLastReadAt = peerReceipt.lastReadMessageCreatedAt?.toMillis?.() ?? null;
  return {
    chatId,
    peerUid: peer,
    peerLastReadAt,
    messages: messages.docs.reverse().map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toMillis?.() ?? null;
      return {
        messageId: data.messageId ?? doc.id,
        senderUid: data.senderUid ?? "",
        recipientUid: data.recipientUid ?? "",
        text: data.text ?? "",
        type: data.type ?? "text",
        mediaId: typeof data.mediaId === "string" ? data.mediaId : null,
        mediaIds: Array.isArray(data.mediaIds) ? data.mediaIds.filter((value: unknown) => typeof value === "string") : [],
        mediaCategory: typeof data.mediaCategory === "string" ? data.mediaCategory : null,
        mediaContentType: typeof data.contentType === "string" ? data.contentType :
          (typeof data.mediaContentType === "string" ? data.mediaContentType : null),
        mediaName: typeof data.mediaName === "string" ? data.mediaName : null,
        deletionPending: data.deletionPending === true,
        deletedForRequester: Array.isArray(data.deletedForUids) && data.deletedForUids.includes(uid),
        senderLabel: data.isPlatformOwnerMessage === true
          ? (typeof data.senderLabel === "string" ? data.senderLabel : "إدارة منصة مودة")
          : null,
        isPlatformOwnerMessage: data.isPlatformOwnerMessage === true,
        liveStream: data.liveStream ?? null,
        isOwnerReviewNotice: data.isOwnerReviewNotice === true,
        ownerReviewMode: data.ownerReviewMode ?? null,
        ownerParticipationMode: data.ownerParticipationMode ?? null,
        createdAt,
        isReadByPeer: isMessageReadByPeer(createdAt, peerLastReadAt),
      };
    }).filter((message) => !message.deletedForRequester && !message.deletionPending),
  };
});

/** Hides one direct message only for the authenticated participant. */
export const deleteDirectMessageForMe = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const chatId = request.data?.chatId;
  const messageId = request.data?.messageId;
  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId) ||
      typeof messageId !== "string" || !/^[a-f0-9]{64}$/.test(messageId)) {
    throw new HttpsError("invalid-argument", "بيانات حذف الرسالة غير صالحة.");
  }
  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const notificationRef = db.collection("users").doc(uid)
    .collection("notifications").doc(messageId);
  const auditRef = db.collection("directMessageDeletionAudit").doc(
    createHash("sha256").update(`direct:${chatId}:${messageId}:${uid}:delete_for_me`).digest("hex"),
  );
  await db.runTransaction(async (transaction) => {
    const [chat, message, audit, notification] = await Promise.all([
      transaction.get(chatRef), transaction.get(messageRef),
      transaction.get(auditRef), transaction.get(notificationRef),
    ]);
    const participants = chat.data()?.participantUids;
    if (!chat.exists || !message.exists || !Array.isArray(participants) ||
        participants.length !== 2 || !participants.includes(uid)) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إخفاء هذه الرسالة.");
    }
    transaction.update(messageRef, {
      deletedForUids: FieldValue.arrayUnion(uid),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (notification.exists) transaction.delete(notificationRef);
    if (!audit.exists) {
      transaction.create(auditRef, {
        chatId, messageId, actorUid: uid, action: "delete_for_me",
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
  return { chatId, messageId, hiddenForRequester: true };
});

/** Permanently removes a text-only direct message for both participants. */
export const deleteDirectMessageForEveryone = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const chatId = request.data?.chatId;
  const messageId = request.data?.messageId;
  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId) ||
      typeof messageId !== "string" || !/^[a-f0-9]{64}$/.test(messageId)) {
    throw new HttpsError("invalid-argument", "بيانات حذف الرسالة غير صالحة.");
  }

  const chatRef = db.collection("directChats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const auditRef = db.collection("directMessageDeletionAudit")
    .doc(`${chatId}_${messageId}_delete_for_everyone`);

  const preparation = await db.runTransaction(async (transaction) => {
    const [chat, message, priorAudit] = await Promise.all([
      transaction.get(chatRef), transaction.get(messageRef), transaction.get(auditRef),
    ]);
    if (!chat.exists) throw new HttpsError("not-found", "المحادثة غير موجودة.");
    const chatData = chat.data() ?? {};
    const participants = chatData.participantUids;
    if (!Array.isArray(participants) || participants.length !== 2 ||
        participants.some((value) => typeof value !== "string") ||
        !participants.includes(uid)) {
      throw new HttpsError("permission-denied", "ليست لديك صلاحية حذف رسائل هذه المحادثة.");
    }
    if (!message.exists) {
      if (priorAudit.exists) return { kind: "replay" as const };
      throw new HttpsError("not-found", "الرسالة غير موجودة.");
    }

    const data = message.data() ?? {};
    const ownerSession = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    if (data.senderUid !== uid && !ownerSession) {
      throw new HttpsError("permission-denied", "يمكنك حذف رسائلك فقط.");
    }

    const legacyMediaKeys = ["storagePath", "mediaPath", "mediaUrl", "downloadUrl", "attachments", "fileUrl"];
    const hasMediaReference = (data.type !== undefined && data.type !== "text") ||
      legacyMediaKeys.some((key) => data[key] !== undefined && data[key] !== null) ||
      data.mediaId !== undefined || data.mediaIds !== undefined;
    if (hasMediaReference) {
      const ids = new Set<string>();
      if (typeof data.mediaId === "string") ids.add(data.mediaId);
      if (Array.isArray(data.mediaIds)) {
        for (const value of data.mediaIds) if (typeof value === "string") ids.add(value);
      }
      if (Array.isArray(data.attachments)) {
        for (const item of data.attachments) {
          if (item && typeof item === "object" &&
              typeof (item as Record<string, unknown>).mediaId === "string") {
            ids.add((item as Record<string, unknown>).mediaId as string);
          }
        }
      }
      if (ids.size === 0 || ids.size > 10) {
        throw new HttpsError("failed-precondition", "لا يحتوي سجل الوسائط على معرفات أصول موثوقة كافية للحذف الآمن.");
      }
      if (data.deletionPending !== true) {
        const notificationRefs = participants.map((participant) =>
          db.collection("users").doc(String(participant))
            .collection("notifications").doc(messageId),
        );
        const notifications = await Promise.all(
          notificationRefs.map((ref) => transaction.get(ref)),
        );
        transaction.update(messageRef, {
          deletionPending: true,
          deletionRequestedByUid: uid,
          deletionRequestedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        notifications.forEach((snapshot, index) => {
          if (snapshot.exists) transaction.delete(notificationRefs[index]);
        });
      }
      return {
        kind: "media" as const,
        mediaIds: [...ids],
        senderUid: typeof data.senderUid === "string" ? data.senderUid : "",
      };
    }

    const notificationRefs = participants.map((participant) =>
      db.collection("users").doc(participant).collection("notifications").doc(messageId),
    );
    const notifications = await Promise.all(notificationRefs.map((ref) => transaction.get(ref)));
    transaction.delete(messageRef);
    notifications.forEach((snapshot, index) => {
      if (snapshot.exists) transaction.delete(notificationRefs[index]);
    });
    const deletedText = typeof data.text === "string" ? data.text : "";
    if (deletedText.length > 0 &&
        chatData.lastMessagePreview === deletedText.substring(0, 120) &&
        chatData.lastMessageSenderUid === data.senderUid &&
        chatData.lastMessageAt instanceof Timestamp &&
        data.createdAt instanceof Timestamp &&
        chatData.lastMessageAt.isEqual(data.createdAt)) {
      transaction.update(chatRef, {
        lastMessagePreview: "تم حذف الرسالة",
        lastMessagePreviewUpdatedAt: FieldValue.serverTimestamp(),
      });
    }
    if (!priorAudit.exists) {
      transaction.create(auditRef, {
        chatId, messageId, actorUid: uid, senderUid: data.senderUid ?? null,
        action: "delete_for_everyone", messageType: "text",
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    return { kind: "text" as const };
  });

  if (preparation.kind === "replay") {
    return { chatId, messageId, deleted: true, idempotentReplay: true };
  }
  if (preparation.kind === "text") {
    return { chatId, messageId, deleted: true, idempotentReplay: false };
  }

  try {
    for (const mediaId of preparation.mediaIds) {
      await deleteMediaAssetForMessage(mediaId, preparation.senderUid, "chat");
    }
  } catch (error) {
    logger.error("Direct message media deletion remains pending for retry.", {
      chatId, messageId, errorName: error instanceof Error ? error.name : "unknown",
    });
    throw new HttpsError("unavailable", "بدأ حذف الوسائط وأُخفيت الرسالة؛ تعذر إكمال محو جميع النسخ حالياً. أعد المحاولة لاحقاً.");
  }

  await db.runTransaction(async (transaction) => {
    const [chat, message, priorAudit] = await Promise.all([
      transaction.get(chatRef), transaction.get(messageRef), transaction.get(auditRef),
    ]);
    if (!message.exists) return;
    const chatData = chat.data() ?? {};
    const participants = Array.isArray(chatData.participantUids) ? chatData.participantUids : [];
    if (!participants.includes(uid) || message.data()?.deletionPending !== true) {
      throw new HttpsError("failed-precondition", "تغيرت حالة المحادثة أثناء حذف الوسائط.");
    }
    const notificationRefs = participants.map((participant) =>
      db.collection("users").doc(String(participant)).collection("notifications").doc(messageId),
    );
    const notifications = await Promise.all(notificationRefs.map((ref) => transaction.get(ref)));
    transaction.delete(messageRef);
    notifications.forEach((snapshot, index) => {
      if (snapshot.exists) transaction.delete(notificationRefs[index]);
    });
    if (!priorAudit.exists) {
      transaction.create(auditRef, {
        chatId, messageId, actorUid: uid, senderUid: message.data()?.senderUid ?? null,
        action: "delete_for_everyone", messageType: "media",
        mediaIds: preparation.mediaIds,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    if (chatData.lastMessageAt instanceof Timestamp &&
        message.data()?.createdAt instanceof Timestamp &&
        chatData.lastMessageSenderUid === message.data()?.senderUid &&
        chatData.lastMessageAt.isEqual(message.data()!.createdAt)) {
      transaction.update(chatRef, {
        lastMessagePreview: "تم حذف الرسالة",
        lastMessagePreviewUpdatedAt: FieldValue.serverTimestamp(),
      });
    }
  });
  return { chatId, messageId, deleted: true, idempotentReplay: false };
});

/**
 * Advances only the authenticated participant's read cursor to the latest
 * server-stored message. Owner review deliberately never invokes this callable.
 */
export const markDirectChatRead = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || user.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(user.data())) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بتحديث إيصالات القراءة.");
  }
  const chatId = request.data?.chatId;
  if (typeof chatId !== "string" || !/^[a-f0-9]{64}$/.test(chatId)) {
    throw new HttpsError("invalid-argument", "معرف المحادثة غير صالح.");
  }
  const chatRef = db.collection("directChats").doc(chatId);
  const chat = await chatRef.get();
  if (!chat.exists) throw new HttpsError("not-found", "المحادثة غير موجودة.");
  const participants = chat.data()?.participantUids;
  if (!Array.isArray(participants) || participants.length !== 2 ||
      !participants.includes(uid) ||
      participants.some((value) => typeof value !== "string") ||
      participants[0] === participants[1]) {
    throw new HttpsError("permission-denied", "ليست لديك صلاحية تحديث حالة قراءة هذه المحادثة.");
  }
  const latestSnapshot = await chatRef.collection("messages")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (latestSnapshot.empty) return { marked: false };
  const latest = latestSnapshot.docs[0];
  const latestCreatedAt = latest.data().createdAt;
  if (!(latestCreatedAt instanceof Timestamp)) {
    throw new HttpsError("failed-precondition", "توقيت أحدث رسالة غير صالح.");
  }

  const receiptRef = chatRef.collection("readReceipts").doc(uid);
  await db.runTransaction(async (transaction) => {
    const [freshChat, existingReceipt] = await Promise.all([
      transaction.get(chatRef),
      transaction.get(receiptRef),
    ]);
    const freshParticipants = freshChat.data()?.participantUids;
    if (!freshChat.exists || !Array.isArray(freshParticipants) ||
        freshParticipants.length !== 2 || !freshParticipants.includes(uid) ||
        freshParticipants.some((value) => typeof value !== "string") ||
        freshParticipants[0] === freshParticipants[1]) {
      throw new HttpsError("permission-denied", "لم تعد عضواً في هذه المحادثة.");
    }
    const previousValue = existingReceipt.data()?.lastReadMessageCreatedAt;
    const previousMs = previousValue instanceof Timestamp ? previousValue.toMillis() : null;
    if (!shouldAdvanceReadReceipt(previousMs, latestCreatedAt.toMillis())) return;
    transaction.set(receiptRef, {
      uid,
      lastReadMessageId: latest.id,
      lastReadMessageCreatedAt: latestCreatedAt,
      lastReadAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  return { marked: true, lastReadMessageId: latest.id };
});

/**
 * Sends an owner-authored administrative message into an existing two-member
 * conversation. The owner UID is always stored as sender; the selected label
 * is display-only and cannot impersonate a member account.
 */
export const sendOwnerDirectChatMessage = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_direct_chat_message_send");
  let input;
  try {
    input = validateOwnerChatParticipationRequest((request.data ?? {}) as Record<string, unknown>);
  } catch {
    throw new HttpsError("invalid-argument", "بيانات مشاركة المالك أو تسمية الظهور غير صالحة.");
  }
  const labels = {
    platform_admin: "إدارة منصة مودة",
    super_admin: "السوبر أدمن",
    anonymous: "مجهول",
  } as const;
  const senderLabel = labels[input.mode];
  try {
    assertMessageLinksAllowed(input.text, true, true);
  } catch {
    throw new HttpsError("invalid-argument", "تحتوي الرسالة على رابط غير آمن أو غير مسموح.");
  }

  const chatRef = db.collection("directChats").doc(input.chatId);
  const initialChat = await chatRef.get();
  if (!initialChat.exists) throw new HttpsError("not-found", "المحادثة غير موجودة.");
  const initialParticipants = initialChat.data()?.participantUids;
  if (!Array.isArray(initialParticipants) || initialParticipants.length !== 2 ||
      initialParticipants.some((value) => typeof value !== "string") ||
      initialParticipants[0] === initialParticipants[1]) {
    throw new HttpsError("failed-precondition", "المحادثة ليست محادثة ثنائية صالحة.");
  }
  const participantUids = [...initialParticipants] as string[];
  const memberRefs = participantUids.map((uid) => db.collection("users").doc(uid));
  const messageId = createHash("sha256")
    .update("owner:" + actorUid + ":" + input.chatId + ":" + input.clientMessageId)
    .digest("hex");
  const messageRef = chatRef.collection("messages").doc(messageId);
  const notificationRefs = participantUids.map((uid) =>
    db.collection("users").doc(uid).collection("notifications").doc(messageId + "_" + uid),
  );

  return db.runTransaction(async (transaction) => {
    const [freshChat, existingMessage, auditHeadSnapshot, ...members] = await Promise.all([
      transaction.get(chatRef),
      transaction.get(messageRef),
      transaction.get(OWNER_REVIEW_AUDIT_HEAD),
      ...memberRefs.map((ref) => transaction.get(ref)),
    ]);
    const freshParticipants = freshChat.data()?.participantUids;
    if (!freshChat.exists || !Array.isArray(freshParticipants) ||
        freshParticipants.length !== 2 ||
        freshParticipants.some((value) => typeof value !== "string") ||
        [...freshParticipants].sort().join("|") !== [...participantUids].sort().join("|")) {
      throw new HttpsError("failed-precondition", "تغيرت أطراف المحادثة؛ أعد تحميلها قبل المشاركة.");
    }
    if (existingMessage.exists) {
      const prior = existingMessage.data() ?? {};
      if (prior.senderUid !== actorUid || prior.text !== input.text ||
          prior.ownerParticipationMode !== input.mode) {
        throw new HttpsError("already-exists", "معرف الرسالة مستخدم لعملية أخرى.");
      }
      return { chatId: input.chatId, messageId, senderLabel, idempotentReplay: true };
    }
    for (const member of members) {
      const data = member.data() ?? {};
      if (!member.exists || data.profileCompleted !== true || !isMemberAccountInGoodStanding(data)) {
        throw new HttpsError("failed-precondition", "لا يمكن إرسال رسالة إدارية إلى محادثة تضم حساباً غير نشط.");
      }
    }

    const createdAt = FieldValue.serverTimestamp();
    transaction.set(chatRef, {
      lastMessageAt: createdAt,
      lastMessageSenderUid: actorUid,
      lastMessagePreview: input.text.substring(0, 120),
    }, { merge: true });
    transaction.create(messageRef, {
      messageId,
      chatId: input.chatId,
      senderUid: actorUid,
      recipientUid: null,
      recipientUids: participantUids,
      text: input.text,
      type: "text",
      isPlatformOwnerMessage: true,
      ownerParticipationMode: input.mode,
      senderLabel,
      ownerAuthTime: request.auth?.token.auth_time ?? null,
      secondFactor: typeof request.auth?.token.firebase === "object" && request.auth?.token.firebase !== null
        ? (request.auth.token.firebase as Record<string, unknown>).sign_in_second_factor ?? null
        : null,
      createdAt,
    });
    for (let index = 0; index < participantUids.length; index += 1) {
      transaction.create(notificationRefs[index], {
        notificationId: messageId + "_" + participantUids[index],
        type: "direct_message",
        senderUid: actorUid,
        senderLabel,
        chatId: input.chatId,
        messageId,
        title: senderLabel,
        body: "لديك رسالة جديدة من إدارة مودة. افتح مودة لقراءتها.",
        isRead: false,
        createdAt,
      });
    }
    const previousAuditHead = auditHeadSnapshot.data() ?? {};
    const previousAuditSequence = auditHeadSnapshot.exists ? previousAuditHead.sequence : 0;
    const previousAuditHash = auditHeadSnapshot.exists ? previousAuditHead.eventHash : "GENESIS";
    if (!Number.isSafeInteger(previousAuditSequence) || previousAuditSequence < 0 ||
        typeof previousAuditHash !== "string" ||
        !(previousAuditHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousAuditHash))) {
      throw new HttpsError("internal", "تعذر التحقق من رأس سجل التدقيق قبل المشاركة.");
    }
    const auditEvent = {
      actorUid,
      action: "owner_direct_chat_message_sent",
      targetUids: participantUids,
      chatId: input.chatId,
      messageId,
      ownerParticipationMode: input.mode,
      senderLabel,
      ownerAuthTime: request.auth?.token.auth_time ?? null,
      secondFactor: typeof request.auth?.token.firebase === "object" && request.auth?.token.firebase !== null
        ? (request.auth.token.firebase as Record<string, unknown>).sign_in_second_factor ?? null
        : null,
      outcome: "sent",
    };
    const auditSequence = previousAuditSequence + 1;
    const auditHash = calculateOwnerAuditHash(auditEvent, auditSequence, previousAuditHash);
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      ...auditEvent,
      auditEvent,
      auditChainId: "owner-review-v1",
      auditSequence,
      previousAuditHash,
      auditHash,
      createdAt,
    });
    transaction.set(OWNER_REVIEW_AUDIT_HEAD, {
      sequence: auditSequence,
      eventHash: auditHash,
      updatedAt: createdAt,
    });
    return { chatId: input.chatId, messageId, senderLabel, idempotentReplay: false };
  });
});


/**
 * Publishes an explicit owner-selected review notice to both participants.
 * This is deliberately separate from silent review and from owner chat replies.
 */
export const announceOwnerDirectChatReview = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_direct_chat_review_announcement");
  let input;
  try {
    input = validateOwnerReviewAnnouncementRequest((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_REVIEW_NOTICE";
    if (code === "INVALID_CHAT_ID") {
      throw new HttpsError("invalid-argument", "معرف المحادثة غير صالح.");
    }
    if (code === "INVALID_REVIEW_NOTICE_TEXT") {
      throw new HttpsError("invalid-argument", "نص إشعار المراجعة يجب أن يكون بين 5 و500 حرف.");
    }
    throw new HttpsError("invalid-argument", "معرف طلب إشعار المراجعة غير صالح.");
  }

  try {
    assertMessageLinksAllowed(input.noticeText, true, true);
  } catch {
    throw new HttpsError("invalid-argument", "يحتوي إشعار المراجعة على رابط غير آمن أو غير مسموح.");
  }

  const chatRef = db.collection("directChats").doc(input.chatId);
  const initialChat = await chatRef.get();
  if (!initialChat.exists) throw new HttpsError("not-found", "المحادثة غير موجودة.");
  const initialParticipants = initialChat.data()?.participantUids;
  if (!Array.isArray(initialParticipants) || initialParticipants.length !== 2 ||
      initialParticipants.some((value) => typeof value !== "string" || value.length < 1 || value.length > 128) ||
      initialParticipants[0] === initialParticipants[1]) {
    throw new HttpsError("failed-precondition", "المحادثة ليست محادثة ثنائية صالحة للإعلان.");
  }
  const participantUids = [...initialParticipants] as string[];
  const senderLabel = "إدارة منصة مودة";
  const messageId = createHash("sha256")
    .update("owner-review-announcement:" + actorUid + ":" + input.chatId + ":" + input.requestId)
    .digest("hex");
  const messageRef = chatRef.collection("messages").doc(messageId);
  const notificationRefs = participantUids.map((uid) =>
    db.collection("users").doc(uid).collection("notifications").doc(messageId + "_" + uid),
  );

  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_direct_chat_review_announcement",
    chatId: input.chatId,
    participantUids,
    reviewMode: "announced",
    reviewScope: "direct_chat_messages",
    requestId: input.requestId,
    noticeTextHash: createHash("sha256").update(input.noticeText, "utf8").digest("hex"),
    outcome: "requested",
    ownerAuthTime: request.auth?.token.auth_time ?? null,
  });

  let result: { idempotentReplay: boolean };
  try {
    result = await db.runTransaction(async (transaction) => {
    const [freshChat, existingMessage, ...existingNotifications] = await Promise.all([
      transaction.get(chatRef),
      transaction.get(messageRef),
      ...notificationRefs.map((ref) => transaction.get(ref)),
    ]);
    const freshParticipants = freshChat.data()?.participantUids;
    if (!freshChat.exists || !Array.isArray(freshParticipants) ||
        [...freshParticipants].sort().join("|") !== [...participantUids].sort().join("|")) {
      throw new HttpsError("failed-precondition", "تغيرت أطراف المحادثة؛ أعد تحميلها قبل الإعلان.");
    }

    if (existingMessage.exists) {
      const prior = existingMessage.data() ?? {};
      if (prior.senderUid !== actorUid || prior.text !== input.noticeText ||
          prior.isOwnerReviewNotice !== true || prior.ownerReviewMode !== "announced") {
        throw new HttpsError("already-exists", "معرف طلب الإعلان مستخدم لبيانات مختلفة.");
      }
      for (let index = 0; index < notificationRefs.length; index += 1) {
        if (!existingNotifications[index].exists) {
          transaction.create(notificationRefs[index], {
            type: "owner_review_notice",
            senderUid: actorUid,
            senderLabel,
            chatId: input.chatId,
            messageId,
            title: "إشعار إداري من مودة",
            body: "تم نشر إشعار إداري في محادثتك. افتح مودة للاطلاع عليه.",
            isRead: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }
      return { idempotentReplay: true };
    }

    if (existingNotifications.some((notification) => notification.exists)) {
      throw new HttpsError("failed-precondition", "توجد إشعارات يتيمة مرتبطة بطلب الإعلان؛ يلزم فحص السجل.");
    }

    const createdAt = FieldValue.serverTimestamp();
    transaction.set(chatRef, {
      lastMessageAt: createdAt,
      lastMessageSenderUid: actorUid,
      lastMessagePreview: input.noticeText.substring(0, 120),
    }, { merge: true });
    transaction.create(messageRef, {
      messageId,
      chatId: input.chatId,
      senderUid: actorUid,
      recipientUid: null,
      recipientUids: participantUids,
      text: input.noticeText,
      type: "text",
      isPlatformOwnerMessage: true,
      senderLabel,
      ownerParticipationMode: "platform_admin",
      isOwnerReviewNotice: true,
      ownerReviewMode: "announced",
      createdAt,
    });
    for (const notificationRef of notificationRefs) {
      transaction.create(notificationRef, {
        type: "owner_review_notice",
        senderUid: actorUid,
        senderLabel,
        chatId: input.chatId,
        messageId,
        title: "إشعار إداري من مودة",
        body: "تم نشر إشعار إداري في محادثتك. افتح مودة للاطلاع عليه.",
        isRead: false,
        createdAt,
      });
    }
    return { idempotentReplay: false };
    });
  } catch (error) {
    await appendOwnerReviewAuditEvent({
      actorUid,
      action: "owner_direct_chat_review_announcement_result",
      parentAuditLogId: auditLogId,
      chatId: input.chatId,
      messageId,
      participantUids,
      reviewMode: "announced",
      outcome: "failed",
      failureCode: error instanceof HttpsError ? error.code : "internal",
    });
    throw error;
  }

  await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_direct_chat_review_announcement_result",
    parentAuditLogId: auditLogId,
    chatId: input.chatId,
    messageId,
    participantUids,
    reviewMode: "announced",
    outcome: result.idempotentReplay ? "replayed" : "announced",
  });

  return {
    chatId: input.chatId,
    messageId,
    participantUids,
    senderLabel,
    reviewMode: "announced",
    idempotentReplay: result.idempotentReplay,
    auditLogId,
  };
});

/**
 * Owner-only discovery of a member's direct conversations.
 * Returns identifiers and participant metadata only; never reads message bodies.
 */
export const getOwnerMemberDirectChats = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_member_direct_chat_list");
  let page;
  try {
    page = validateOwnerConversationPageRequest((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_OWNER_CONVERSATION_PAGE";
    if (code === "INVALID_MEMBER_UID") {
      throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
    }
    if (code === "INVALID_PAGE_TOKEN") {
      throw new HttpsError("invalid-argument", "مؤشر صفحة المحادثات غير صالح.");
    }
    throw new HttpsError("invalid-argument", "حجم صفحة المحادثات غير صالح.");
  }

  const targetUid = page.memberUid;
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_member_direct_chat_list",
    targetUid,
    cursorChatId: page.pageToken,
    reviewMode: "silent",
    reviewScope: "direct_chat_metadata",
    outcome: "requested",
    ownerAuthTime: request.auth?.token.auth_time ?? null,
    secondFactor: typeof request.auth?.token.firebase === "object" && request.auth?.token.firebase !== null
      ? (request.auth.token.firebase as Record<string, unknown>).sign_in_second_factor ?? null
      : null,
  });
  const member = await db.collection("users").doc(targetUid).get();
  if (!member.exists) {
    throw new HttpsError("not-found", "ملف العضو غير موجود.");
  }

  const chatsQuery = db.collection("directChats")
    .where("participantUids", "array-contains", targetUid)
    .orderBy(FieldPath.documentId());
  let cursorSnapshot: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  if (page.pageToken) {
    const cursorRef = db.collection("directChats").doc(page.pageToken);
    const cursor = await cursorRef.get();
    const cursorParticipants = cursor.data()?.participantUids;
    if (!cursor.exists || !Array.isArray(cursorParticipants) ||
        !cursorParticipants.includes(targetUid)) {
      throw new HttpsError("invalid-argument", "مؤشر الصفحة لا ينتمي إلى محادثات هذا العضو.");
    }
    cursorSnapshot = cursor as FirebaseFirestore.QueryDocumentSnapshot;
  }

  const query = cursorSnapshot
    ? chatsQuery.startAfter(cursorSnapshot).limit(page.limit + 1)
    : chatsQuery.limit(page.limit + 1);
  const chats = await query.get();
  const hasMore = chats.docs.length > page.limit;
  const pageDocs = chats.docs.slice(0, page.limit);
  const nextPageToken = hasMore && pageDocs.length > 0
    ? pageDocs[pageDocs.length - 1].id
    : null;

  await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_member_direct_chat_list_result",
    parentAuditLogId: auditLogId,
    targetUid,
    returnedCount: pageDocs.length,
    hasMore,
    outcome: "success",
  });

  return {
    memberUid: targetUid,
    auditLogId,
    conversations: pageDocs.map((doc) => {
      const data = doc.data();
      const participants = Array.isArray(data.participantUids)
        ? data.participantUids.filter((uid: unknown) => typeof uid === "string")
        : [];
      return {
        chatId: doc.id,
        participantUids: participants,
        createdAt: data.createdAt?.toMillis?.() ?? null,
        lastMessageAt: data.lastMessageAt?.toMillis?.() ?? null,
      };
    }),
    nextPageToken,
    hasMore,
  };
});


/**
 * Owner-only, read-only silent review of a one-to-one conversation.
 * The owner claim and recent MFA session are revalidated on every invocation.
 */
export const getOwnerDirectChatMessages = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_direct_chat_review");
  let review;
  try {
    review = validateOwnerChatReviewRequest((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_REVIEW_REQUEST";
    if (code === "INVALID_CHAT_ID") {
      throw new HttpsError("invalid-argument", "معرف المحادثة غير صالح.");
    }
    if (code === "INVALID_REVIEW_REASON") {
      throw new HttpsError("invalid-argument", "معلومة التدقيق الاختيارية لا يمكن أن تتجاوز 500 حرف.");
    }
    if (code === "INVALID_PAGE_TOKEN") {
      throw new HttpsError("invalid-argument", "مؤشر صفحة الرسائل غير صالح.");
    }
    if (code === "INVALID_REVIEW_MODE") {
      throw new HttpsError("invalid-argument", "وضع المراجعة غير صالح.");
    }
    if (code === "INVALID_ANNOUNCEMENT_MESSAGE_ID") {
      throw new HttpsError("invalid-argument", "معرف إشعار المراجعة غير صالح.");
    }
    throw new HttpsError("invalid-argument", "عدد الرسائل المطلوب غير صالح.");
  }

  const chatRef = db.collection("directChats").doc(review.chatId);
  const chat = await chatRef.get();
  if (!chat.exists) {
    throw new HttpsError("not-found", "المحادثة غير موجودة.");
  }
  const participants = chat.data()?.participantUids;
  if (
    !Array.isArray(participants) ||
    participants.length !== 2 ||
    participants.some((uid) => typeof uid !== "string" || uid.length < 1 || uid.length > 128) ||
    participants[0] === participants[1]
  ) {
    throw new HttpsError("failed-precondition", "بيانات أطراف المحادثة غير صالحة للمراجعة.");
  }

  const messagesRef = chatRef.collection("messages");
  let cursor: { createdAtMillis: number; messageId: string } | null = null;
  if (review.pageToken) {
    try {
      cursor = decodeOwnerMessagePageToken(review.pageToken);
    } catch {
      throw new HttpsError("invalid-argument", "مؤشر صفحة الرسائل غير صالح.");
    }
  }

  // Cursor values are carried by the token itself. Do not fetch a message
  // document before writing the audit event for this privileged read.
  let messagesQuery = messagesRef.orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId());
  if (cursor) {
    messagesQuery = messagesQuery.startAfter(
      Timestamp.fromMillis(cursor.createdAtMillis),
      cursor.messageId,
    );
  }
  // Persist the privileged access attempt before any message document is queried.
  // Never write message bodies or excerpts to the audit collection.
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_direct_chat_review",
    chatId: review.chatId,
    participantUids: participants,
    reason: review.reason,
    reviewMode: review.mode,
    announcementMessageId: review.announcementMessageId,
    reviewScope: "direct_chat_messages",
    requestedLimit: review.limit,
    cursorMessageId: review.pageToken,
    outcome: "requested",
    ownerAuthTime: request.auth?.token.auth_time ?? null,
    secondFactor: typeof request.auth?.token.firebase === "object" && request.auth?.token.firebase !== null
      ? (request.auth.token.firebase as Record<string, unknown>).sign_in_second_factor ?? null
      : null,
  });


  if (review.mode === "announced") {
    const announcement = await messagesRef.doc(review.announcementMessageId!).get();
    const announcementData = announcement.data() ?? {};
    if (!announcement.exists || announcementData.senderUid !== actorUid ||
        announcementData.isOwnerReviewNotice !== true ||
        announcementData.ownerReviewMode !== "announced" ||
        announcementData.chatId !== review.chatId) {
      await appendOwnerReviewAuditEvent({
        actorUid,
        action: "owner_direct_chat_review_page_result",
        parentAuditLogId: auditLogId,
        chatId: review.chatId,
        reviewMode: "announced",
        announcementMessageId: review.announcementMessageId,
        outcome: "announcement_not_found_or_not_owned",
      });
      throw new HttpsError("failed-precondition", "يجب نشر إشعار مراجعة معلنة صالح من المالك قبل فتح هذا الوضع.");
    }
  }

  const snapshot = await messagesQuery.limit(review.limit + 1).get();
  const hasMore = snapshot.docs.length > review.limit;
  const pageDocs = snapshot.docs.slice(0, review.limit);
  const lastPageDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;
  let nextPageToken: string | null = null;
  if (hasMore && lastPageDoc) {
    const lastCreatedAt = lastPageDoc.data().createdAt;
    if (!(lastCreatedAt instanceof Timestamp)) {
      throw new HttpsError("failed-precondition", "تعذر متابعة سجل الرسائل بسبب توقيت غير صالح.");
    }
    nextPageToken = encodeOwnerMessagePageToken(lastCreatedAt.toMillis(), lastPageDoc.id);
  }

  // Record completion separately so a failed query remains visible as a request
  // without incorrectly claiming that message data was successfully returned.
  await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_direct_chat_review_page_result",
    parentAuditLogId: auditLogId,
    chatId: review.chatId,
    reviewScope: "direct_chat_messages",
    reviewMode: review.mode,
    announcementMessageId: review.announcementMessageId,
    returnedCount: pageDocs.length,
    hasMore,
    outcome: "success",
  });

  const messages = pageDocs.reverse().map((doc) => {
    const data = doc.data();
    const deleted = data.isDeleted === true;
    return {
      messageId: data.messageId ?? doc.id,
      senderUid: data.senderUid ?? "",
      recipientUid: data.recipientUid ?? "",
      text: deleted ? "" : (typeof data.text === "string" ? data.text : ""),
      isDeleted: deleted,
      isPlatformOwnerMessage: data.isPlatformOwnerMessage === true,
      senderLabel: data.isPlatformOwnerMessage === true
        ? (typeof data.senderLabel === "string" ? data.senderLabel : "إدارة منصة مودة")
        : null,
      ownerParticipationMode: data.ownerParticipationMode ?? null,
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });

  return {
    chatId: review.chatId,
    participantUids: participants,
    reviewMode: review.mode,
    announcementMessageId: review.announcementMessageId,
    messages,
    reviewedAt: Date.now(),
    auditLogId,
    nextPageToken,
    hasMore,
  };
});


/**
 * Verifies the owner-review hash chain against the separately maintained head.
 * Full verification is intentionally bounded; large chains fail as incomplete,
 * never as valid, until a paged verification workflow is used.
 */
/**
 * Exports a bounded, redacted page of the owner's hash-chained audit ledger.
 * The cursor is the last scanned sequence, not merely the last returned row.
 */
/**
 * Places a documented legal hold on one specific chat-media asset.
 * Holds do not change malware verdicts or make quarantined media deliverable.
 */
/** Owner-only legal hold for an exact text message path. Media assets require their own asset holds. */
export const placeMessageLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "message_legal_hold_place");
  let input;
  try {
    input = validateMessageLegalHoldInput((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    throw new HttpsError("invalid-argument", "بيانات حجز الرسالة غير صالحة.", {
      reason: error instanceof Error ? error.message : "INVALID_MESSAGE_HOLD",
    });
  }
  const messageRef = db.doc(input.messagePath);
  const holdRef = db.collection("messageLegalHolds").doc();
  const requestAuditId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "message_legal_hold_place_requested",
    messagePath: input.messagePath,
    authority: input.authority,
    legalBasis: input.legalBasis,
    reference: input.reference,
    startsAtMs: input.startsAtMs,
    reviewAtMs: input.reviewAtMs,
    endsAtMs: input.endsAtMs,
    outcome: "requested",
  });

  await db.runTransaction(async (transaction) => {
    const messageSnapshot = await transaction.get(messageRef);
    if (!messageSnapshot.exists) throw new HttpsError("not-found", "الرسالة غير موجودة.");
    const message = messageSnapshot.data() ?? {};
    const hasMedia = ["mediaId", "mediaIds", "media", "attachment", "attachments", "mediaAssetId", "assetId", "mediaUrl", "fileUrl", "downloadUrl", "storagePath", "objectPath"]
      .some((field) => {
        const value = message[field];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.length > 0;
        return typeof value === "object" && value !== null && Object.keys(value).length > 0;
      });
    const messageType = message.type ?? message.messageType;
    if ((messageType !== undefined && messageType !== "text") || hasMedia) {
      throw new HttpsError("failed-precondition", "يجب إنشاء حجز مستقل لكل ملف وسائط مرتبط بالرسالة.");
    }
    if (message.legalHoldStatus === "active") {
      throw new HttpsError("already-exists", "الرسالة خاضعة لحجز قانوني نشط بالفعل.");
    }
    transaction.create(holdRef, {
      holdId: holdRef.id,
      scope: "text_message",
      messagePath: input.messagePath,
      authority: input.authority,
      legalBasis: input.legalBasis,
      reference: input.reference,
      startsAt: Timestamp.fromMillis(input.startsAtMs),
      reviewAt: Timestamp.fromMillis(input.reviewAtMs),
      endsAt: Timestamp.fromMillis(input.endsAtMs),
      status: "active",
      authorizedBy: actorUid,
      requestAuditId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(messageRef, {
      legalHoldStatus: "active",
      activeLegalHoldId: holdRef.id,
      resumeRetentionPolicyStatus: message.retentionPolicyStatus ?? "seven_day_chat_text",
      retentionPolicyStatus: "legal_hold",
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "message_legal_hold_placed",
    holdId: holdRef.id,
    messagePath: input.messagePath,
    outcome: "success",
  });
  return { holdId: holdRef.id, messagePath: input.messagePath, status: "active", auditLogId };
});


export const releaseMessageLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "message_legal_hold_release");
  const holdId = typeof request.data?.holdId === "string" ? request.data.holdId.trim() : "";
  if (!/^[A-Za-z0-9]{20}$/.test(holdId)) {
    throw new HttpsError("invalid-argument", "معرف حجز الرسالة غير صالح.");
  }
  const holdRef = db.collection("messageLegalHolds").doc(holdId);
  const holdSnapshot = await holdRef.get();
  if (!holdSnapshot.exists) throw new HttpsError("not-found", "حجز الرسالة غير موجود.");
  const messagePath = typeof holdSnapshot.data()?.messagePath === "string"
    ? holdSnapshot.data()!.messagePath as string : "";
  let validated;
  try {
    validated = validateMessageLegalHoldInput({
      messagePath,
      authority: "Recorded authority",
      legalBasis: "Recorded legal basis for this previously validated hold.",
      reference: "Recorded-reference",
      startsAtMs: 0,
      reviewAtMs: 1,
      endsAtMs: 2,
    }, 2);
  } catch {
    throw new HttpsError("failed-precondition", "مسار الرسالة في الحجز غير صالح.");
  }
  const messageRef = db.doc(validated.messagePath);
  await db.runTransaction(async (transaction) => {
    const [freshHold, messageSnapshot] = await Promise.all([
      transaction.get(holdRef), transaction.get(messageRef),
    ]);
    if (!freshHold.exists || freshHold.data()?.status !== "active") {
      throw new HttpsError("failed-precondition", "الحجز القانوني غير نشط أو تمت معالجته مسبقاً.");
    }
    if (messageSnapshot.exists && messageSnapshot.data()?.activeLegalHoldId === holdId) {
      const message = messageSnapshot.data() ?? {};
      transaction.update(messageRef, {
        legalHoldStatus: "released",
        activeLegalHoldId: FieldValue.delete(),
        retentionPolicyStatus: message.resumeRetentionPolicyStatus ?? "seven_day_chat_text",
        resumeRetentionPolicyStatus: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    transaction.update(holdRef, {
      status: "released",
      releasedBy: actorUid,
      releasedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid, action: "message_legal_hold_released", holdId,
    messagePath: validated.messagePath, outcome: "success",
  });
  return { holdId, messagePath: validated.messagePath, status: "released", auditLogId };
});


export const listActiveMessageLegalHolds = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "message_legal_hold_list");
  const snapshot = await db.collection("messageLegalHolds")
    .where("status", "==", "active")
    .orderBy("reviewAt", "asc")
    .limit(100)
    .get();
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid, action: "message_legal_hold_listed", outcome: "success",
    returnedCount: snapshot.size,
  });
  return {
    holds: snapshot.docs.map((doc) => {
      const hold = doc.data();
      return {
        holdId: doc.id,
        messagePath: hold.messagePath,
        authority: hold.authority,
        legalBasis: hold.legalBasis,
        reference: hold.reference,
        startsAtMs: hold.startsAt instanceof Timestamp ? hold.startsAt.toMillis() : null,
        reviewAtMs: hold.reviewAt instanceof Timestamp ? hold.reviewAt.toMillis() : null,
        endsAtMs: hold.endsAt instanceof Timestamp ? hold.endsAt.toMillis() : null,
      };
    }),
    auditLogId,
  };
});


export const reviewMessageLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "message_legal_hold_review");
  const holdId = typeof request.data?.holdId === "string" ? request.data.holdId.trim() : "";
  const reviewNote = typeof request.data?.reviewNote === "string" ? request.data.reviewNote.trim() : "";
  const nextReviewAtMs = request.data?.nextReviewAtMs;
  if (!/^[A-Za-z0-9]{20}$/.test(holdId) ||
      reviewNote.length < 10 || reviewNote.length > 500 ||
      !Number.isSafeInteger(nextReviewAtMs)) {
    throw new HttpsError("invalid-argument", "بيانات مراجعة حجز الرسالة غير صالحة.");
  }
  const holdRef = db.collection("messageLegalHolds").doc(holdId);
  let endsAtMs = 0;
  await db.runTransaction(async (transaction) => {
    const holdSnapshot = await transaction.get(holdRef);
    if (!holdSnapshot.exists || holdSnapshot.data()?.status !== "active") {
      throw new HttpsError("not-found", "الحجز القانوني النشط غير موجود.");
    }
    const endsAt = holdSnapshot.data()?.endsAt;
    if (!(endsAt instanceof Timestamp) ||
        (nextReviewAtMs as number) <= Date.now() ||
        (nextReviewAtMs as number) >= endsAt.toMillis()) {
      throw new HttpsError("invalid-argument", "يجب أن يكون موعد المراجعة قبل انتهاء الحجز.");
    }
    endsAtMs = endsAt.toMillis();
    transaction.update(holdRef, {
      reviewAt: Timestamp.fromMillis(nextReviewAtMs as number),
      lastReviewedAt: FieldValue.serverTimestamp(),
      lastReviewedBy: actorUid,
      reviewNote,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid, action: "message_legal_hold_reviewed", holdId,
    nextReviewAtMs, reviewNote, originalEndsAtMs: endsAtMs, outcome: "success",
  });
  return { holdId, nextReviewAtMs, endsAtMs, auditLogId };
});


export const placeMediaLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "media_legal_hold_place");
  let input;
  try {
    input = validateMediaLegalHoldInput((request.data ?? {}) as Record<string, unknown>);
  } catch (error) {
    throw new HttpsError("invalid-argument", "بيانات الحجز القانوني غير صالحة.", {
      reason: error instanceof Error ? error.message : "INVALID_HOLD",
    });
  }
  const assetRef = db.collection("mediaAssets").doc(input.mediaId);
  const holdRef = db.collection("mediaLegalHolds").doc();
  const requestAuditId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "media_legal_hold_place_requested",
    mediaId: input.mediaId,
    authority: input.authority,
    legalBasis: input.legalBasis,
    reference: input.reference,
    startsAtMs: input.startsAtMs,
    reviewAtMs: input.reviewAtMs,
    endsAtMs: input.endsAtMs,
    outcome: "requested",
  });

  await db.runTransaction(async (transaction) => {
    const assetSnapshot = await transaction.get(assetRef);
    if (!assetSnapshot.exists) throw new HttpsError("not-found", "ملف الوسائط غير موجود.");
    const asset = assetSnapshot.data() ?? {};
    if (!["chat", "room", "profile_album", "avatar_cover", "story"].includes(String(asset.mediaPurpose)) ||
        ["self_destructed", "manually_deleted", "manual_deletion_pending", "expired_cleanup_in_progress"].includes(String(asset.status)) ||
        typeof asset.objectPath !== "string" ||
        asset.legalHoldStatus === "active") {
      throw new HttpsError("failed-precondition", "لا يمكن حجز هذا الملف أو يوجد له حجز نشط بالفعل.");
    }
    transaction.create(holdRef, {
      holdId: holdRef.id,
      scope: "media_asset",
      scopeId: input.mediaId,
      mediaId: input.mediaId,
      authority: input.authority,
      legalBasis: input.legalBasis,
      reference: input.reference,
      startsAt: Timestamp.fromMillis(input.startsAtMs),
      reviewAt: Timestamp.fromMillis(input.reviewAtMs),
      endsAt: Timestamp.fromMillis(input.endsAtMs),
      status: "active",
      authorizedBy: actorUid,
      requestAuditId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(assetRef, {
      legalHoldStatus: "active",
      activeLegalHoldId: holdRef.id,
      resumeRetentionPolicyStatus: asset.retentionPolicyStatus ?? "four_hour_self_destruct",
      retentionPolicyStatus: "legal_hold",
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const resultAuditId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "media_legal_hold_placed",
    mediaId: input.mediaId,
    holdId: holdRef.id,
    scope: "media_asset",
    outcome: "success",
  });
  return { holdId: holdRef.id, mediaId: input.mediaId, status: "active", auditLogId: resultAuditId };
});


/** Releases one exact media legal hold; the original expiry clock is preserved. */
export const releaseMediaLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "media_legal_hold_release");
  const holdId = typeof request.data?.holdId === "string" ? request.data.holdId.trim() : "";
  if (!/^[A-Za-z0-9]{20}$/.test(holdId)) {
    throw new HttpsError("invalid-argument", "معرف الحجز القانوني غير صالح.");
  }
  const holdRef = db.collection("mediaLegalHolds").doc(holdId);
  const holdSnapshot = await holdRef.get();
  if (!holdSnapshot.exists) throw new HttpsError("not-found", "الحجز القانوني غير موجود.");
  const hold = holdSnapshot.data() ?? {};
  const mediaId = typeof hold.mediaId === "string" ? hold.mediaId : "";
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) {
    throw new HttpsError("failed-precondition", "نطاق الحجز القانوني غير صالح.");
  }
  const assetRef = db.collection("mediaAssets").doc(mediaId);
  await db.runTransaction(async (transaction) => {
    const [freshHold, assetSnapshot] = await Promise.all([
      transaction.get(holdRef), transaction.get(assetRef),
    ]);
    if (!freshHold.exists || freshHold.data()?.status !== "active") {
      throw new HttpsError("failed-precondition", "الحجز القانوني غير نشط أو تمت معالجته مسبقاً.");
    }
    if (assetSnapshot.exists && assetSnapshot.data()?.activeLegalHoldId === holdId) {
      const asset = assetSnapshot.data() ?? {};
      transaction.update(assetRef, {
        legalHoldStatus: "released",
        activeLegalHoldId: FieldValue.delete(),
        retentionPolicyStatus: asset.resumeRetentionPolicyStatus ?? "four_hour_self_destruct",
        resumeRetentionPolicyStatus: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    transaction.update(holdRef, {
      status: "released",
      releasedBy: actorUid,
      releasedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "media_legal_hold_released",
    mediaId,
    holdId,
    outcome: "success",
  });
  return { holdId, mediaId, status: "released", auditLogId };
});


/** Lists the owner's active, narrowly scoped media holds in review-date order. */
export const listActiveMediaLegalHolds = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "media_legal_hold_list");
  const snapshot = await db.collection("mediaLegalHolds")
    .where("status", "==", "active")
    .orderBy("reviewAt", "asc")
    .limit(100)
    .get();
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "media_legal_hold_listed",
    outcome: "success",
    returnedCount: snapshot.size,
  });
  return {
    holds: snapshot.docs.map((doc) => {
      const hold = doc.data();
      return {
        holdId: doc.id,
        mediaId: hold.mediaId,
        authority: hold.authority,
        legalBasis: hold.legalBasis,
        reference: hold.reference,
        startsAtMs: hold.startsAt instanceof Timestamp ? hold.startsAt.toMillis() : null,
        reviewAtMs: hold.reviewAt instanceof Timestamp ? hold.reviewAt.toMillis() : null,
        endsAtMs: hold.endsAt instanceof Timestamp ? hold.endsAt.toMillis() : null,
        authorizedBy: hold.authorizedBy,
      };
    }),
    auditLogId,
  };
});


/** Records a periodic review without silently extending the legal hold end date. */
export const reviewMediaLegalHold = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "media_legal_hold_review");
  const holdId = typeof request.data?.holdId === "string" ? request.data.holdId.trim() : "";
  const reviewNote = typeof request.data?.reviewNote === "string" ? request.data.reviewNote.trim() : "";
  const nextReviewAtMs = request.data?.nextReviewAtMs;
  if (!/^[A-Za-z0-9]{20}$/.test(holdId) ||
      reviewNote.length < 10 || reviewNote.length > 500 ||
      !Number.isSafeInteger(nextReviewAtMs)) {
    throw new HttpsError("invalid-argument", "بيانات مراجعة الحجز القانوني غير صالحة.");
  }
  const holdRef = db.collection("mediaLegalHolds").doc(holdId);
  let endsAtMs = 0;
  await db.runTransaction(async (transaction) => {
    const holdSnapshot = await transaction.get(holdRef);
    if (!holdSnapshot.exists || holdSnapshot.data()?.status !== "active") {
      throw new HttpsError("not-found", "الحجز القانوني النشط غير موجود.");
    }
    const endsAt = holdSnapshot.data()?.endsAt;
    if (!(endsAt instanceof Timestamp) ||
        (nextReviewAtMs as number) <= Date.now() ||
        (nextReviewAtMs as number) >= endsAt.toMillis()) {
      throw new HttpsError("invalid-argument", "يجب أن يكون موعد المراجعة القادم قبل تاريخ انتهاء الحجز.");
    }
    endsAtMs = endsAt.toMillis();
    transaction.update(holdRef, {
      reviewAt: Timestamp.fromMillis(nextReviewAtMs as number),
      lastReviewedAt: FieldValue.serverTimestamp(),
      lastReviewedBy: actorUid,
      reviewNote,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  const auditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "media_legal_hold_reviewed",
    holdId,
    nextReviewAtMs,
    reviewNote,
    originalEndsAtMs: endsAtMs,
    outcome: "success",
  });
  return { holdId, nextReviewAtMs, endsAtMs, auditLogId };
});


/** Automatically releases a media hold at its recorded end time. */
export const expireMediaLegalHolds = onSchedule(
  { schedule: "every 60 minutes", timeZone: "UTC", timeoutSeconds: 300 },
  async () => {
    const projectId = process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? "";
    const nonProduction = projectId !== "mawda-app-2026" &&
      /(test|staging|dev|demo|nonprod|sandbox)/i.test(projectId) &&
      !/prod(uction)?/i.test(projectId);
    if (legalHoldExpiryEnabled.value() !== "true" || !nonProduction) {
      logger.info("Media legal-hold expiry sweep skipped; explicit non-production enablement is required.");
      return;
    }
    const now = Timestamp.now();
    const due = await db.collection("mediaLegalHolds")
      .where("status", "==", "active")
      .where("endsAt", "<=", now)
      .orderBy("endsAt", "asc")
      .limit(100)
      .get();
    for (const holdDoc of due.docs) {
      const holdRef = holdDoc.ref;
      const hold = holdDoc.data();
      const mediaId = typeof hold.mediaId === "string" ? hold.mediaId : "";
      if (!/^[0-9a-f-]{36}$/i.test(mediaId)) continue;
      const assetRef = db.collection("mediaAssets").doc(mediaId);
      let released = false;
      await db.runTransaction(async (transaction) => {
        const [freshHold, assetSnapshot] = await Promise.all([
          transaction.get(holdRef), transaction.get(assetRef),
        ]);
        if (!freshHold.exists || freshHold.data()?.status !== "active" ||
            !(freshHold.data()?.endsAt instanceof Timestamp) ||
            freshHold.data()!.endsAt.toMillis() > Date.now()) return;
        if (assetSnapshot.exists && assetSnapshot.data()?.activeLegalHoldId === holdDoc.id) {
          const asset = assetSnapshot.data() ?? {};
          transaction.update(assetRef, {
            legalHoldStatus: "expired",
            activeLegalHoldId: FieldValue.delete(),
            retentionPolicyStatus: asset.resumeRetentionPolicyStatus ?? "four_hour_self_destruct",
            resumeRetentionPolicyStatus: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        transaction.update(holdRef, {
          status: "expired",
          expiredAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        released = true;
      });
      if (released) {
        await appendOwnerReviewAuditEvent({
          actorUid: "system-legal-hold-expiry",
          action: "media_legal_hold_expired",
          mediaId,
          holdId: holdDoc.id,
          outcome: "success",
        });
      }
    }

    const dueMessages = await db.collection("messageLegalHolds")
      .where("status", "==", "active")
      .where("endsAt", "<=", now)
      .orderBy("endsAt", "asc")
      .limit(100)
      .get();
    for (const holdDoc of dueMessages.docs) {
      const holdRef = holdDoc.ref;
      const messagePath = typeof holdDoc.data().messagePath === "string"
        ? holdDoc.data().messagePath : "";
      let validPath = "";
      try {
        validPath = validateMessageLegalHoldInput({
          messagePath,
          authority: "Recorded authority",
          legalBasis: "Previously validated message preservation basis.",
          reference: "Recorded-reference",
          startsAtMs: 0, reviewAtMs: 1, endsAtMs: 2,
        }, 2).messagePath;
      } catch {
        logger.error("Invalid message legal-hold path; expiry requires owner review.", { holdId: holdDoc.id });
        continue;
      }
      const messageRef = db.doc(validPath);
      let released = false;
      await db.runTransaction(async (transaction) => {
        const [freshHold, messageSnapshot] = await Promise.all([
          transaction.get(holdRef), transaction.get(messageRef),
        ]);
        if (!freshHold.exists || freshHold.data()?.status !== "active" ||
            !(freshHold.data()?.endsAt instanceof Timestamp) ||
            freshHold.data()!.endsAt.toMillis() > Date.now()) return;
        if (messageSnapshot.exists && messageSnapshot.data()?.activeLegalHoldId === holdDoc.id) {
          const message = messageSnapshot.data() ?? {};
          transaction.update(messageRef, {
            legalHoldStatus: "expired",
            activeLegalHoldId: FieldValue.delete(),
            retentionPolicyStatus: message.resumeRetentionPolicyStatus ?? "seven_day_chat_text",
            resumeRetentionPolicyStatus: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        transaction.update(holdRef, {
          status: "expired",
          expiredAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        released = true;
      });
      if (released) {
        await appendOwnerReviewAuditEvent({
          actorUid: "system-legal-hold-expiry",
          action: "message_legal_hold_expired",
          holdId: holdDoc.id,
          messagePath: validPath,
          outcome: "success",
        });
      }
    }
  },
);


export const exportOwnerReviewAuditPage = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_review_audit_export");
  const headSnapshot = await OWNER_REVIEW_AUDIT_HEAD.get();
  const head = headSnapshot.data() ?? {};
  const headSequence = headSnapshot.exists ? head.sequence : 0;
  if (!Number.isSafeInteger(headSequence) || headSequence < 0) {
    throw new HttpsError("failed-precondition", "رأس سجل التدقيق غير صالح.");
  }

  let filters;
  try {
    filters = validateOwnerAuditExportRequest(
      (request.data ?? {}) as Record<string, unknown>,
      headSequence,
    );
  } catch (error) {
    throw new HttpsError("invalid-argument", "مرشحات تصدير سجل التدقيق غير صالحة.", {
      reason: error instanceof Error ? error.message : "INVALID_FILTERS",
    });
  }

  const scanLimit = 501;
  const scanned = await db.collection("adminAuditLogs")
    .where("auditChainId", "==", "owner-review-v1")
    .where("auditSequence", ">", filters.afterSequence)
    .orderBy("auditSequence", "asc")
    .limit(scanLimit)
    .get();
  const scannedDocs = scanned.docs.filter((doc) =>
    doc.data().auditSequence <= headSequence
  );
  const matchingDocs = scannedDocs.filter((doc) => {
    const data = doc.data();
    const event = data.auditEvent && typeof data.auditEvent === "object"
      ? data.auditEvent as Record<string, unknown>
      : {};
    const createdAtMs = data.createdAt instanceof Timestamp
      ? data.createdAt.toMillis()
      : null;
    if (filters.fromMs !== null && (createdAtMs === null || createdAtMs < filters.fromMs)) return false;
    if (filters.toMs !== null && (createdAtMs === null || createdAtMs > filters.toMs)) return false;
    if (filters.actorUid !== null && event.actorUid !== filters.actorUid) return false;
    if (filters.action !== null && event.action !== filters.action) return false;
    return true;
  });
  const matching = matchingDocs.slice(0, filters.pageSize);
  const lastScannedSequence = scannedDocs.length > 0
    ? scannedDocs[scannedDocs.length - 1].data().auditSequence as number
    : filters.afterSequence;
  const pageFilledBeforeScanEnd = matchingDocs.length > filters.pageSize;
  const hasMore = pageFilledBeforeScanEnd ||
    (scanned.docs.length === scanLimit && lastScannedSequence < headSequence);
  const nextAfterSequence = pageFilledBeforeScanEnd
    ? matching[matching.length - 1].data().auditSequence as number
    : lastScannedSequence;
  const exportAuditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_review_audit_export",
    outcome: "success",
    afterSequence: filters.afterSequence,
    throughSequence: lastScannedSequence,
    returnedCount: matching.length,
    pageSize: filters.pageSize,
    hasMore,
  });

  return {
    entries: matching.map((doc) => {
      const data = doc.data();
      return {
        sequence: data.auditSequence,
        previousHash: data.previousAuditHash,
        eventHash: data.auditHash,
        event: projectOwnerAuditExportValue(data.auditEvent),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
      };
    }),
    afterSequence: filters.afterSequence,
    nextAfterSequence: hasMore ? nextAfterSequence : null,
    hasMore,
    verifiedHeadSequence: headSequence,
    verifiedHeadHash: head.eventHash ?? "GENESIS",
    exportAuditLogId,
  };
});


export const verifyOwnerReviewAuditChain = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_review_audit_chain_verify");
  const headSnapshot = await OWNER_REVIEW_AUDIT_HEAD.get();
  const head = headSnapshot.data() ?? {};
  const headSequence = headSnapshot.exists ? head.sequence : 0;
  const headHash = headSnapshot.exists ? head.eventHash : "GENESIS";

  let verification: {
    valid: boolean;
    complete: boolean;
    sequence: number;
    eventHash: string;
    reason: string | null;
  };

  if (!Number.isSafeInteger(headSequence) || headSequence < 0 ||
      typeof headHash !== "string" ||
      !(headHash === "GENESIS" || /^[a-f0-9]{64}$/.test(headHash))) {
    verification = {
      valid: false,
      complete: true,
      sequence: 0,
      eventHash: "GENESIS",
      reason: "INVALID_CHAIN_HEAD",
    };
  } else if (headSequence > 5000) {
    verification = {
      valid: false,
      complete: false,
      sequence: 0,
      eventHash: "GENESIS",
      reason: "CHAIN_REQUIRES_PAGED_VERIFICATION",
    };
  } else {
    const snapshot = headSequence === 0
      ? null
      : await db.collection("adminAuditLogs")
          .orderBy("auditSequence", "asc")
          .limit(headSequence)
          .get();
    const entries = (snapshot?.docs ?? []).map((doc) => {
      const data = doc.data();
      return {
        sequence: data.auditSequence,
        previousHash: data.previousAuditHash,
        eventHash: data.auditHash,
        event: data.auditEvent,
      };
    });
    const result = verifyOwnerAuditChain(entries, {
      sequence: headSequence,
      eventHash: headHash,
    });
    verification = { ...result, complete: true };
  }

  const verificationAuditLogId = await appendOwnerReviewAuditEvent({
    actorUid,
    action: "owner_review_audit_chain_verification",
    outcome: verification.complete
      ? verification.valid ? "valid" : "invalid"
      : "incomplete",
    verifiedThroughSequence: headSequence,
    verifiedHeadHash: headHash,
    scannedCount: verification.sequence,
    verificationReason: verification.reason,
  });

  return {
    ...verification,
    verifiedThroughSequence: headSequence,
    verifiedHeadHash: headHash,
    verificationAuditLogId,
  };
});

/** Lists only the authenticated member's own notifications. */
export const getMyNotifications = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const notifications = await db.collection("users").doc(uid)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return {
    notifications: notifications.docs.map((doc) => {
      const data = doc.data();
      return {
        notificationId: data.notificationId ?? doc.id,
        type: data.type ?? "system",
        senderUid: data.senderUid ?? "",
        chatId: data.chatId ?? "",
        messageId: data.messageId ?? "",
        title: data.title ?? "",
        body: data.body ?? "",
        isRead: data.isRead === true,
        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    }),
  };
});

/** Marks a notification read only within the caller's own notification path. */
export const markNotificationRead = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const notificationId = request.data?.notificationId;
  if (typeof notificationId !== "string" || notificationId.length < 8 || notificationId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الإشعار غير صالح.");
  }
  const notificationRef = db.collection("users").doc(uid)
    .collection("notifications").doc(notificationId);
  await db.runTransaction(async (transaction) => {
    const notification = await transaction.get(notificationRef);
    if (!notification.exists) {
      throw new HttpsError("not-found", "الإشعار غير موجود.");
    }
    transaction.update(notificationRef, {
      isRead: true,
      readAt: FieldValue.serverTimestamp(),
    });
  });
  return { notificationId, isRead: true };
});


/**
 * Room messages are written only through trusted callables. Membership and
 * room-scoped moderation permissions are checked on every operation.
 */
export const sendRoomMessage = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const allowedFields = new Set(["roomId", "content", "clientMessageId"]);
  if (Object.keys(request.data ?? {}).some((key) => !allowedFields.has(key))) {
    throw new HttpsError("invalid-argument", "حقول مرفقات الغرفة غير مدعومة في مسار الرسائل النصية.");
  }
  const roomId = request.data?.roomId;
  const content = typeof request.data?.content === "string" ? request.data.content.trim() : "";
  const clientMessageId = request.data?.clientMessageId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128 ||
      content.length < 1 || content.length > 4000 ||
      typeof clientMessageId !== "string" || clientMessageId.length < 8 ||
      clientMessageId.length > 80 || !/^[A-Za-z0-9_-]+$/.test(clientMessageId)) {
    throw new HttpsError("invalid-argument", "بيانات رسالة الغرفة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const membershipRef = roomRef.collection("members").doc(uid);
  const moderatorRef = roomRef.collection("moderators").doc(uid);
  const userRef = db.collection("users").doc(uid);
  const messageId = createHash("sha256").update(uid + ":" + clientMessageId).digest("hex");
  const messageRef = roomRef.collection("messages").doc(messageId);
  const result = await db.runTransaction(async (transaction) => {
    const [room, membership, moderator, member, existing] = await Promise.all([
      transaction.get(roomRef), transaction.get(membershipRef),
      transaction.get(moderatorRef), transaction.get(userRef), transaction.get(messageRef),
    ]);
    if (!room.exists || room.data()?.status !== "active") {
      throw new HttpsError("not-found", "الغرفة غير موجودة أو غير نشطة.");
    }
    if (!membership.exists) {
      throw new HttpsError("permission-denied", "يجب الانضمام إلى الغرفة قبل إرسال الرسائل.");
    }
    const mutedUntil = membership.data()?.mutedUntil;
    if (mutedUntil instanceof Timestamp && mutedUntil.toMillis() > Date.now()) {
      throw new HttpsError("permission-denied", "تم كتم إرسال الرسائل في هذه الغرفة حتى انتهاء المدة المحددة.");
    }
    if (!member.exists || !isMemberAccountInGoodStanding(member.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بإرسال الرسائل حالياً.");
    }
    const roomData = room.data() ?? {};
    const isRoomOwner = roomData.ownerUid === uid;
    const isAuthorizedModerator = moderator.exists;
    const ownerSession = hasPlatformOwnerSession((request.auth?.token ?? {}) as Record<string, unknown>);
    const isBiometricallyVerified = hasActiveBiometricVerification(member.data()?.biometricVerification);
    try {
      assertMessageLinksAllowed(
        content,
        canSendApprovedPlatformLinks({
          isBiometricallyVerified,
          isRoomOwner,
          isAuthorizedModerator,
          isPlatformOwner: ownerSession,
        }),
        ownerSession,
        isBiometricallyVerified ? BIOMETRIC_APPROVED_HOSTS : undefined,
      );
    } catch {
      throw new HttpsError(
        "invalid-argument",
        isRoomOwner || isAuthorizedModerator || ownerSession || isBiometricallyVerified
          ? ownerSession ? "تعذر قبول الرابط أو أن صياغته غير آمنة." : "يسمح للأعضاء الموثقين بيومترياً بروابط YouTube وFacebook وInstagram وX مجاناً، وللمالكين والمشرفين بصلاحيات الروابط المحددة لغرفهم."
          : "إرسال الروابط غير مسموح للأعضاء غير الموثقين بيومترياً في هذه الغرفة.",
      );
    }
    if (existing.exists) {
      const prior = existing.data()!;
      if (prior.senderUid !== uid || prior.content !== content) {
        throw new HttpsError("already-exists", "معرف الرسالة مستخدم مع محتوى مختلف.");
      }
      return { messageId, idempotentReplay: true };
    }
    transaction.create(messageRef, {
      messageId,
      senderUid: uid,
      content,
      type: "text",
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { messageId, idempotentReplay: false };
  });
  if (!result.idempotentReplay) {
    try {
      const members = await roomRef.collection("members").limit(1000).get();
      await Promise.all(members.docs.filter((member) => member.id !== uid).map((member) =>
        sendPushToMember(member.id, "رسالة جديدة في غرفة مودة", "هناك رسالة جديدة في إحدى غرفك. افتح مودة لمتابعتها.",
          { type: "room_message", roomId, messageId })));
    } catch (error) {
      logger.warn("Room push fan-out failed", { roomId, error });
    }
  }
  return result;
});

export const getRoomMessages = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const [room, membership] = await Promise.all([
    roomRef.get(),
    roomRef.collection("members").doc(uid).get(),
  ]);
  if (!room.exists || !membership.exists) {
    throw new HttpsError("permission-denied", "لا تملك صلاحية قراءة رسائل هذه الغرفة.");
  }
  const messages = await roomRef.collection("messages")
    .orderBy("createdAt", "desc").limit(50).get();
  return {
    messages: messages.docs.reverse().map((doc) => {
      const data = doc.data();
      return {
        messageId: doc.id,
        senderUid: data.senderUid ?? "",
        content: data.isDeleted === true ? "تم حذف هذه الرسالة" : (data.content ?? ""),
        type: data.type ?? "text",
        liveStream: data.liveStream ?? null,
        isPlatformOwnerMessage: data.isPlatformOwnerMessage === true,
        senderLabel: data.senderLabel ?? null,
        mediaId: typeof data.mediaId === "string" ? data.mediaId : null,
        mediaIds: Array.isArray(data.mediaIds) ? data.mediaIds.filter((value: unknown) => typeof value === "string") : [],
        mediaCategory: typeof data.mediaCategory === "string" ? data.mediaCategory : null,
        mediaContentType: typeof data.contentType === "string" ? data.contentType :
          (typeof data.mediaContentType === "string" ? data.mediaContentType : null),
        mediaName: typeof data.mediaName === "string" ? data.mediaName : null,
        deletionPending: data.deletionPending === true,
        isDeleted: data.isDeleted === true,
        createdAt: data.createdAt?.toMillis?.() ?? null,
        deletedForRequester: Array.isArray(data.deletedForUids) && data.deletedForUids.includes(uid),
      };
    }).filter((message) => !message.deletedForRequester && !message.deletionPending),
  };
});

/** Hides a room message only for the requesting member on all their synced clients. */
export const deleteRoomMessageForMe = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  const messageId = request.data?.messageId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128 ||
      typeof messageId !== "string" || !/^[a-f0-9]{64}$/.test(messageId)) {
    throw new HttpsError("invalid-argument", "بيانات إخفاء الرسالة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const membershipRef = roomRef.collection("members").doc(uid);
  const messageRef = roomRef.collection("messages").doc(messageId);
  const auditRef = db.collection("roomAuditLogs").doc(
    createHash("sha256").update(`room:${roomId}:${messageId}:${uid}:delete_for_me`).digest("hex"),
  );
  await db.runTransaction(async (transaction) => {
    const [room, membership, message, audit] = await Promise.all([
      transaction.get(roomRef), transaction.get(membershipRef),
      transaction.get(messageRef), transaction.get(auditRef),
    ]);
    if (!room.exists || !membership.exists || !message.exists) {
      throw new HttpsError("not-found", "الرسالة أو عضوية الغرفة غير موجودة.");
    }
    if (message.data()?.isDeleted === true) return;
    transaction.update(messageRef, {
      deletedForUids: FieldValue.arrayUnion(uid),
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (!audit.exists) {
      transaction.create(auditRef, {
        roomId, actorUid: uid, messageId,
        action: "room_message_deleted_for_me",
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
  return { roomId, messageId, hiddenForRequester: true };
});

export const deleteRoomMessage = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  const messageId = request.data?.messageId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128 ||
      typeof messageId !== "string" || !/^[a-f0-9]{64}$/.test(messageId)) {
    throw new HttpsError("invalid-argument", "بيانات حذف الرسالة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const messageRef = roomRef.collection("messages").doc(messageId);
  const membershipRef = roomRef.collection("members").doc(uid);
  const moderatorRef = roomRef.collection("moderators").doc(uid);
  const auditRef = db.collection("roomAuditLogs").doc(
    createHash("sha256").update(`room:${roomId}:${messageId}:delete_for_everyone`).digest("hex"),
  );

  const preparation = await db.runTransaction(async (transaction) => {
    const [room, membership, moderator, message, priorAudit] = await Promise.all([
      transaction.get(roomRef), transaction.get(membershipRef),
      transaction.get(moderatorRef), transaction.get(messageRef),
      transaction.get(auditRef),
    ]);
    if (!room.exists) throw new HttpsError("not-found", "الغرفة غير موجودة.");
    const ownerSession = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    const permissions = moderator.data()?.permissions ?? {};
    const canModerate = room.data()?.ownerUid === uid ||
      permissions.manageMessages === true || ownerSession;
    if (!membership.exists && !ownerSession) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إدارة رسائل هذه الغرفة.");
    }
    if (!message.exists) {
      if (priorAudit.exists) return { kind: "replay" as const };
      throw new HttpsError("not-found", "الرسالة غير موجودة.");
    }
    const data = message.data() ?? {};
    if (data.senderUid !== uid && !canModerate) {
      throw new HttpsError("permission-denied", "يمكنك حذف رسائلك فقط ما لم تكن تملك صلاحية الإشراف.");
    }

    const hasMediaReference = (data.type !== undefined && data.type !== "text") ||
      ["storagePath", "mediaPath", "mediaUrl", "downloadUrl", "attachments", "fileUrl"]
        .some((key) => data[key] !== undefined && data[key] !== null) ||
      data.mediaId !== undefined || data.mediaIds !== undefined;
    if (hasMediaReference) {
      const ids = new Set<string>();
      if (typeof data.mediaId === "string") ids.add(data.mediaId);
      if (Array.isArray(data.mediaIds)) {
        for (const value of data.mediaIds) if (typeof value === "string") ids.add(value);
      }
      if (Array.isArray(data.attachments)) {
        for (const item of data.attachments) {
          if (item && typeof item === "object" &&
              typeof (item as Record<string, unknown>).mediaId === "string") {
            ids.add((item as Record<string, unknown>).mediaId as string);
          }
        }
      }
      if (ids.size === 0 || ids.size > 10) {
        throw new HttpsError("failed-precondition", "لا يحتوي سجل الوسائط على معرفات أصول موثوقة كافية للحذف الآمن.");
      }
      if (data.deletionPending !== true) {
        transaction.update(messageRef, {
          deletionPending: true,
          deletionRequestedByUid: uid,
          deletionRequestedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      return {
        kind: "media" as const,
        mediaIds: [...ids],
        senderUid: typeof data.senderUid === "string" ? data.senderUid : "",
      };
    }

    transaction.delete(messageRef);
    if (!priorAudit.exists) {
      transaction.create(auditRef, {
        roomId, actorUid: uid, messageId,
        senderUid: data.senderUid ?? null,
        action: "room_message_deleted_for_everyone",
        messageType: "text",
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    return { kind: "text" as const };
  });

  if (preparation.kind === "replay") {
    return { roomId, messageId, deleted: true, idempotentReplay: true };
  }
  if (preparation.kind === "text") {
    return { roomId, messageId, deleted: true, idempotentReplay: false };
  }

  try {
    for (const mediaId of preparation.mediaIds) {
      await deleteMediaAssetForMessage(mediaId, preparation.senderUid, "room");
    }
  } catch (error) {
    logger.error("Room message media deletion remains pending for retry.", {
      roomId, messageId, errorName: error instanceof Error ? error.name : "unknown",
    });
    throw new HttpsError("unavailable", "بدأ حذف الوسائط وأُخفيت الرسالة؛ تعذر إكمال محو جميع النسخ حالياً. أعد المحاولة لاحقاً.");
  }

  await db.runTransaction(async (transaction) => {
    const [room, message, priorAudit] = await Promise.all([
      transaction.get(roomRef), transaction.get(messageRef), transaction.get(auditRef),
    ]);
    if (!message.exists) return;
    if (!room.exists || message.data()?.deletionPending !== true) {
      throw new HttpsError("failed-precondition", "تغيرت حالة الغرفة أثناء حذف الوسائط.");
    }
    transaction.delete(messageRef);
    if (!priorAudit.exists) {
      transaction.create(auditRef, {
        roomId, actorUid: uid, messageId,
        senderUid: message.data()?.senderUid ?? null,
        action: "room_message_deleted_for_everyone",
        messageType: "media",
        mediaIds: preparation.mediaIds,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
  return { roomId, messageId, deleted: true, idempotentReplay: false };
});

/** Creates public or private rooms only through the trusted platform owner. */
export const createRoom = onCall(async (request) => {
  const ownerUid = requireOwner(request);
  const name = typeof request.data?.name === "string" ? request.data.name.trim() : "";
  const kind = request.data?.kind;
  const capacity = request.data?.capacity;
  if (name.length < 3 || name.length > 60 ||
      (kind !== "public" && kind !== "private") ||
      !Number.isSafeInteger(capacity) || capacity < 5 || capacity > 1000) {
    throw new HttpsError("invalid-argument", "بيانات الغرفة أو سعتها غير صالحة.");
  }
  const owner = await db.collection("users").doc(ownerUid).get();
  const age = owner.data()?.age;
  let audience;
  try {
    audience = audienceForAge(age);
  } catch {
    throw new HttpsError("failed-precondition", "يجب أن يكون ملف مالك الغرفة مكتملاً وبعمر صالح.");
  }
  const roomRef = db.collection("rooms").doc();
  const now = FieldValue.serverTimestamp();
  await db.runTransaction(async (transaction) => {
    transaction.create(roomRef, {
      roomId: roomRef.id,
      name,
      kind,
      capacity,
      audience,
      ownerUid,
      memberCount: 1,
      status: "active",
      invitedUids: [],
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(roomRef.collection("members").doc(ownerUid), {
      uid: ownerUid,
      role: "owner",
      joinedAt: now,
    });
  });
  return { roomId: roomRef.id, kind, audience, capacity };
});

/** Invites a member to a private room; only the room owner can issue invitations. */
export const inviteMemberToRoom = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  const memberUid = request.data?.memberUid;
  if (typeof roomId !== "string" || typeof memberUid !== "string" ||
      roomId.length > 128 || memberUid.length > 128 || memberUid === actorUid) {
    throw new HttpsError("invalid-argument", "بيانات الدعوة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const memberRef = db.collection("users").doc(memberUid);
  await db.runTransaction(async (transaction) => {
    const [room, member] = await Promise.all([
      transaction.get(roomRef), transaction.get(memberRef),
    ]);
    if (!room.exists || room.data()?.ownerUid !== actorUid) {
      throw new HttpsError("permission-denied", "الدعوات متاحة لمالك الغرفة فقط.");
    }
    if (room.data()?.kind !== "private") {
      throw new HttpsError("failed-precondition", "الدعوات الخاصة مخصصة للغرف الخاصة.");
    }
    if (!member.exists || member.data()?.profileCompleted !== true) {
      throw new HttpsError("not-found", "العضو المطلوب غير موجود أو لم يكمل ملفه.");
    }
    if (!canJoinRoom({
      memberAge: member.data()?.age,
      roomAudience: room.data()?.audience,
      roomKind: "private",
      invited: true,
    })) {
      throw new HttpsError("permission-denied", "لا يمكن دعوة العضو إلى غرفة من فئة عمرية مختلفة.");
    }
    transaction.update(roomRef, {
      invitedUids: FieldValue.arrayUnion(memberUid),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { roomId, memberUid, invited: true };
});

/** Joins a public room or an invited private room, enforcing audience and capacity. */
export const joinRoom = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const userRef = db.collection("users").doc(uid);
  const membershipRef = roomRef.collection("members").doc(uid);
  await db.runTransaction(async (transaction) => {
    const [room, user, membership] = await Promise.all([
      transaction.get(roomRef), transaction.get(userRef), transaction.get(membershipRef),
    ]);
    if (!room.exists || room.data()?.status !== "active") {
      throw new HttpsError("not-found", "الغرفة غير موجودة أو غير نشطة.");
    }
    if (!user.exists || user.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "يجب إكمال العضوية قبل دخول الغرف.");
    }
    if (!isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بدخول الغرف حالياً.");
    }
    const data = room.data()!;
    const invited = Array.isArray(data.invitedUids) && data.invitedUids.includes(uid);
    if (!canJoinRoom({
      memberAge: user.data()?.age,
      roomAudience: data.audience,
      roomKind: data.kind,
      invited,
    })) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية دخول هذه الغرفة أو فئتها العمرية غير مناسبة.");
    }
    if (membership.exists) return;
    if (!Number.isSafeInteger(data.memberCount) || data.memberCount >= data.capacity) {
      throw new HttpsError("resource-exhausted", "اكتمل العدد المسموح به في الغرفة.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.create(membershipRef, { uid, role: "member", joinedAt: now });
    transaction.update(roomRef, {
      memberCount: data.memberCount + 1,
      invitedUids: invited ? FieldValue.arrayRemove(uid) : data.invitedUids,
      updatedAt: now,
    });
  });
  return { roomId, joined: true };
});

/** Assigns room-only moderation capabilities; moderators cannot manage the platform. */
export const setRoomModerator = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  const memberUid = request.data?.memberUid;
  if (typeof roomId !== "string" || typeof memberUid !== "string" ||
      roomId.length > 128 || memberUid.length > 128 || actorUid === memberUid) {
    throw new HttpsError("invalid-argument", "بيانات المشرف غير صالحة.");
  }
  let permissions;
  try {
    permissions = normalizeModeratorPermissions(request.data?.permissions ?? {});
  } catch {
    throw new HttpsError("invalid-argument", "صلاحيات مشرف الغرفة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const membershipRef = roomRef.collection("members").doc(memberUid);
  const moderatorRef = roomRef.collection("moderators").doc(memberUid);
  await db.runTransaction(async (transaction) => {
    const [room, membership] = await Promise.all([
      transaction.get(roomRef), transaction.get(membershipRef),
    ]);
    const platformOwner = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    if (!room.exists || (room.data()?.ownerUid !== actorUid && !platformOwner)) {
      throw new HttpsError("permission-denied", "تعيين مشرفي الغرفة من صلاحية مالك الغرفة أو مالك المنصة فقط.");
    }
    if (!membership.exists) {
      throw new HttpsError("failed-precondition", "يجب أن يكون المشرف عضواً في الغرفة أولاً.");
    }
    transaction.set(moderatorRef, {
      uid: memberUid,
      permissions,
      assignedBy: actorUid,
      assignedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(membershipRef, { role: "moderator" });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, {
      roomId,
      actorUid,
      targetUid: memberUid,
      action: "room_moderator_assigned",
      permissions,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { roomId, memberUid, permissions };
});


/** Revokes room-scoped moderator permissions without affecting the member account. */
export const removeRoomModerator = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  const memberUid = request.data?.memberUid;
  if (typeof roomId !== "string" || roomId.trim().length < 1 || roomId.length > 128 ||
      typeof memberUid !== "string" || memberUid.trim().length < 1 ||
      memberUid.length > 128 || memberUid === actorUid) {
    throw new HttpsError("invalid-argument", "بيانات سحب الإشراف غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId.trim());
  const membershipRef = roomRef.collection("members").doc(memberUid.trim());
  const moderatorRef = roomRef.collection("moderators").doc(memberUid.trim());
  await db.runTransaction(async (transaction) => {
    const [room, membership, moderator] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(membershipRef),
      transaction.get(moderatorRef),
    ]);
    const platformOwner = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    if (!room.exists || (room.data()?.ownerUid !== actorUid && !platformOwner)) {
      throw new HttpsError("permission-denied", "سحب الإشراف متاح لمالك الغرفة أو مالك المنصة فقط.");
    }
    if (!membership.exists) {
      throw new HttpsError("not-found", "عضوية الغرفة غير موجودة.");
    }
    if (!moderator.exists) return;
    transaction.delete(moderatorRef);
    transaction.update(membershipRef, { role: "member" });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, {
      roomId: roomRef.id,
      actorUid,
      targetUid: memberUid.trim(),
      action: "room_moderator_revoked",
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { roomId: roomRef.id, memberUid: memberUid.trim(), revoked: true };
});


/** Temporarily mutes a room member; the restriction is enforced by sendRoomMessage. */
export const muteRoomMember = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  const memberUid = typeof request.data?.memberUid === "string" ? request.data.memberUid.trim() : "";
  const durationMinutes = request.data?.durationMinutes;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (!roomId || roomId.length > 128 || !memberUid || memberUid.length > 128 ||
      memberUid === actorUid || !Number.isSafeInteger(durationMinutes) ||
      durationMinutes < 1 || durationMinutes > 1440 ||
      reason.length < 5 || reason.length > 500) {
    throw new HttpsError("invalid-argument", "بيانات كتم العضو غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const actorMembershipRef = roomRef.collection("members").doc(actorUid);
  const actorModeratorRef = roomRef.collection("moderators").doc(actorUid);
  const targetMembershipRef = roomRef.collection("members").doc(memberUid);
  await db.runTransaction(async (transaction) => {
    const [room, actorMembership, actorModerator, targetMembership] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(actorMembershipRef),
      transaction.get(actorModeratorRef),
      transaction.get(targetMembershipRef),
    ]);
    const platformOwner = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    const isRoomOwner = room.data()?.ownerUid === actorUid;
    const canMute = actorModerator.data()?.permissions?.muteMembers === true;
    if (!room.exists || (!platformOwner && !isRoomOwner && !canMute) ||
        (!platformOwner && !actorMembership.exists)) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية كتم أعضاء هذه الغرفة.");
    }
    if (!targetMembership.exists) {
      throw new HttpsError("not-found", "العضو غير موجود في هذه الغرفة.");
    }
    if (room.data()?.ownerUid === memberUid) {
      throw new HttpsError("failed-precondition", "لا يمكن كتم مالك الغرفة.");
    }
    const mutedUntil = Timestamp.fromMillis(Date.now() + durationMinutes * 60 * 1000);
    transaction.update(targetMembershipRef, {
      mutedUntil,
      mutedBy: actorUid,
      muteReason: reason,
      mutedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, {
      roomId,
      actorUid,
      targetUid: memberUid,
      action: "room_member_muted",
      durationMinutes,
      reason,
      mutedUntil,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { roomId, memberUid, muted: true, durationMinutes };
});


/** Removes a member from a room without disabling or changing their platform account. */
export const removeRoomMember = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  const memberUid = typeof request.data?.memberUid === "string" ? request.data.memberUid.trim() : "";
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (!roomId || roomId.length > 128 || !memberUid || memberUid.length > 128 ||
      memberUid === actorUid || reason.length < 5 || reason.length > 500) {
    throw new HttpsError("invalid-argument", "بيانات إزالة العضو غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const actorMembershipRef = roomRef.collection("members").doc(actorUid);
  const actorModeratorRef = roomRef.collection("moderators").doc(actorUid);
  const targetMembershipRef = roomRef.collection("members").doc(memberUid);
  const targetModeratorRef = roomRef.collection("moderators").doc(memberUid);
  await db.runTransaction(async (transaction) => {
    const [room, actorMembership, actorModerator, targetMembership] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(actorMembershipRef),
      transaction.get(actorModeratorRef),
      transaction.get(targetMembershipRef),
    ]);
    const platformOwner = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
    );
    const isRoomOwner = room.data()?.ownerUid === actorUid;
    const canRemove = actorModerator.data()?.permissions?.removeMembers === true;
    if (!room.exists || (!platformOwner && !isRoomOwner && !canRemove) ||
        (!platformOwner && !actorMembership.exists)) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إزالة أعضاء هذه الغرفة.");
    }
    if (!targetMembership.exists) {
      throw new HttpsError("not-found", "العضو غير موجود في هذه الغرفة.");
    }
    if (room.data()?.ownerUid === memberUid) {
      throw new HttpsError("failed-precondition", "لا يمكن إزالة مالك الغرفة؛ استخدم إجراء نقل الملكية أو إغلاق الغرفة.");
    }
    const roomData = room.data() ?? {};
    const count = Number.isSafeInteger(roomData.memberCount) ? roomData.memberCount : 1;
    transaction.delete(targetMembershipRef);
    transaction.delete(targetModeratorRef);
    transaction.update(roomRef, {
      memberCount: Math.max(0, count - 1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, {
      roomId,
      actorUid,
      targetUid: memberUid,
      action: "room_member_removed",
      reason,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { roomId, memberUid, removed: true };
});


/** Lists room members and room-scoped moderator permissions to the room owner or platform owner. */
export const listRoomMembers = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.trim().length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId.trim());
  const room = await roomRef.get();
  const isPlatformOwner = hasPlatformOwnerSession(
    (request.auth?.token ?? {}) as Record<string, unknown>,
  );
  if (!room.exists || (room.data()?.ownerUid !== actorUid && !isPlatformOwner)) {
    throw new HttpsError("permission-denied", "عرض أعضاء الغرفة متاح لمالكها أو مالك المنصة فقط.");
  }

  const memberships = await roomRef.collection("members")
    .orderBy("joinedAt", "asc")
    .limit(100)
    .get();
  const memberRefs = memberships.docs.map((membership) =>
    db.collection("users").doc(membership.id),
  );
  const moderatorRefs = memberships.docs.map((membership) =>
    roomRef.collection("moderators").doc(membership.id),
  );
  const related = memberRefs.length > 0
    ? await db.getAll(...memberRefs, ...moderatorRefs)
    : [];
  const count = memberships.docs.length;
  const members = memberships.docs.map((membership, index) => {
    const user = related[index]?.data() ?? {};
    const moderator = related[count + index]?.data() ?? {};
    return {
      uid: membership.id,
      displayName: typeof user.displayName === "string" ? user.displayName : "عضو مودة",
      username: typeof user.username === "string" ? user.username : "",
      role: membership.data().role ?? "member",
      mutedUntil: membership.data().mutedUntil?.toMillis?.() ?? null,
      permissions: {
        manageMessages: moderator.permissions?.manageMessages === true,
        muteMembers: moderator.permissions?.muteMembers === true,
        removeMembers: moderator.permissions?.removeMembers === true,
      },
    };
  });
  return {
    roomId: roomRef.id,
    members,
    truncated: memberships.size === 100,
  };
});


/** Owner operations overview: aggregate counts only, never member secrets. */
export const getOwnerOperationsOverview = onCall(async (request) => {
  requireOwner(request);
  const [members, rooms, transfers, registration, transferSettings] = await Promise.all([
    db.collection("users").count().get(),
    db.collection("rooms").count().get(),
    db.collection("coinTransfers").count().get(),
    db.doc("platformSettings/registration").get(),
    TRANSFER_SETTINGS.get(),
  ]);
  const registrationData = registration.data() ?? {};
  const transferData = transferSettings.data() ?? {};
  return {
    memberCount: members.data().count,
    roomCount: rooms.data().count,
    transferCount: transfers.data().count,
    registrationPolicy: {
      configured: registration.exists,
      enabled: registrationData.enabled === true,
      minimumAge: typeof registrationData.minimumAge === "number"
        ? registrationData.minimumAge
        : null,
      version: typeof registrationData.version === "number"
        ? registrationData.version
        : 0,
    },
    transferSettings: {
      configured: transferSettings.exists,
      enabled: transferData.enabled === true,
      commissionBps: typeof transferData.commissionBps === "number"
        ? transferData.commissionBps
        : 0,
      version: typeof transferData.version === "number"
        ? transferData.version
        : 0,
    },
    generatedAt: Date.now(),
  };
});

/**
 * Owner-only account access control. This disables Firebase Auth access and
 * revokes refresh tokens; it never exposes or changes a member's password.
 */
export const setMemberAccessStatus = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const targetUid = request.data?.memberUid;
  const status = request.data?.status;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (typeof targetUid !== "string" || targetUid.length < 1 || targetUid.length > 128 ||
      targetUid === actorUid) {
    throw new HttpsError("invalid-argument", "معرف العضو غير صالح أو لا يمكن تعطيل حساب المالك من هذه العملية.");
  }
  if (!["active", "suspended", "banned"].includes(status) || reason.length < 5 || reason.length > 500) {
    throw new HttpsError("invalid-argument", "حالة الحساب أو سبب الإجراء غير صالح.");
  }

  const auth = getAuth();
  let previousDisabled: boolean;
  try {
    const account = await auth.getUser(targetUid);
    previousDisabled = account.disabled;
  } catch {
    throw new HttpsError("not-found", "حساب المصادقة غير موجود.");
  }
  const disabled = status !== "active";
  try {
    await auth.updateUser(targetUid, { disabled });
  } catch (error) {
    logger.error("Owner account auth-state update failed", { actorUid, targetUid, error });
    throw new HttpsError("internal", "تعذر تحديث حالة حساب المصادقة؛ لم يُسجل الإجراء على أنه مكتمل.");
  }

  try {
    // Revoke existing sessions before recording the final administrative state.
    // If any subsequent step fails, restore the previous disabled flag; token
    // revocation itself is safe and may require the member to sign in again.
    await auth.revokeRefreshTokens(targetUid);
    const userRef = db.collection("users").doc(targetUid);
    await db.runTransaction(async (transaction) => {
      const user = await transaction.get(userRef);
      if (!user.exists) throw new HttpsError("not-found", "ملف العضو غير موجود.");
      transaction.update(userRef, {
        accountStatus: status,
        accountStatusReason: reason,
        accountStatusUpdatedAt: FieldValue.serverTimestamp(),
        accountStatusUpdatedBy: actorUid,
      });
      const auditRef = db.collection("adminAuditLogs").doc();
      transaction.create(auditRef, {
        actorUid,
        targetUid,
        action: "member_access_status_changed",
        status,
        reason,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    try {
      await auth.updateUser(targetUid, { disabled: previousDisabled });
    } catch (rollbackError) {
      logger.error("Owner account auth-state rollback failed", {
        actorUid,
        targetUid,
        originalError: error,
        rollbackError,
      });
      throw new HttpsError(
        "internal",
        "تعذر إكمال الإجراء أو استعادة حالة المصادقة السابقة؛ يلزم فحص سجل العمليات فوراً.",
      );
    }
    if (error instanceof HttpsError) throw error;
    logger.error("Owner account status update failed", { actorUid, targetUid, error });
    throw new HttpsError("internal", "تعذر إكمال إجراء إدارة الحساب.");
  }
  return { memberUid: targetUid, status, sessionsRevoked: true };
});


/** Owner-only, minimal member lookup for support and account operations. */
export const getOwnerMemberSummary = onCall(async (request) => {
  requireOwner(request);
  const memberUid = request.data?.memberUid;
  if (typeof memberUid !== "string" || memberUid.length < 1 || memberUid.length > 128) {
    throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  }
  const [member, authUser] = await Promise.all([
    db.collection("users").doc(memberUid).get(),
    getAuth().getUser(memberUid).catch(() => null),
  ]);
  if (!member.exists) throw new HttpsError("not-found", "ملف العضو غير موجود.");
  const data = member.data() ?? {};
  return {
    uid: memberUid,
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    username: typeof data.username === "string" ? data.username : "",
    accountStatus: typeof data.accountStatus === "string" ? data.accountStatus : "active",
    emailVerified: authUser?.emailVerified === true,
    authDisabled: authUser?.disabled === true,
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
});


/**
 * Lists the signed-in member's rooms and eligible public rooms.
 * Only minimal room metadata is returned; messages remain behind getRoomMessages.
 */
export const listMemberRooms = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || user.data()?.profileCompleted !== true) {
    throw new HttpsError("failed-precondition", "يجب إكمال الملف الشخصي قبل تصفح الغرف.");
  }
  if (!isMemberAccountInGoodStanding(user.data())) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بتصفح الغرف حالياً.");
  }
  const age = user.data()?.age;
  if (!Number.isSafeInteger(age)) {
    throw new HttpsError("failed-precondition", "بيانات العمر غير مكتملة.");
  }

  const memberships = await db.collectionGroup("members")
    .where("uid", "==", uid)
    .limit(100)
    .get();
  const membershipByRoom = new Map(
    memberships.docs.flatMap((membership) => {
      const roomRef = membership.ref.parent.parent;
      return roomRef && roomRef.parent.id === "rooms"
        ? [[roomRef.id, membership.data()] as const]
        : [];
    }),
  );
  const joinedRoomRefs = memberships.docs.flatMap((membership) => {
    const roomRef = membership.ref.parent.parent;
    return roomRef && roomRef.parent.id === "rooms" ? [roomRef] : [];
  });
  const isPlatformOwner = hasPlatformOwnerSession(
    (request.auth?.token ?? {}) as Record<string, unknown>,
  );
  const joinedSnapshots = joinedRoomRefs.length > 0
    ? await db.getAll(...joinedRoomRefs)
    : [];
  const joined = joinedSnapshots
    .filter((room) => room.exists && (room.data()?.status === "active" ||
      (room.data()?.ownerUid === uid && room.data()?.status === "frozen")))
    .map((room) => ({
      roomId: room.id,
      name: room.data()?.name ?? "غرفة مودة",
      kind: room.data()?.kind ?? "public",
      audience: room.data()?.audience ?? "unknown",
      memberCount: room.data()?.memberCount ?? 0,
      capacity: room.data()?.capacity ?? 0,
      isMember: true,
      isRoomOwner: room.data()?.ownerUid === uid,
      isModerator: membershipByRoom.get(room.id)?.role === "moderator",
      isSuperAdmin: isPlatformOwner,
      status: room.data()?.status ?? "unknown",
      isRented: room.data()?.isRented === true,
      rentalPlanId: room.data()?.rentalPlanId ?? null,
      expiresAt: room.data()?.expiresAt instanceof Timestamp ? room.data()!.expiresAt.toMillis() : null,
    }));

  const joinedIds = new Set(joined.map((room) => room.roomId));
  const publicSnapshots = await db.collection("rooms")
    .where("status", "==", "active")
    .limit(100)
    .get();
  const discoverable = publicSnapshots.docs
    .filter((room) => !joinedIds.has(room.id))
    .filter((room) => {
      const data = room.data();
      return data.kind === "public" && canJoinRoom({
        memberAge: age,
        roomAudience: data.audience,
        roomKind: "public",
        invited: false,
      });
    })
    .map((room) => {
      const data = room.data();
      return {
        roomId: room.id,
        name: data.name ?? "غرفة مودة",
        kind: "public",
        audience: data.audience ?? "unknown",
        memberCount: data.memberCount ?? 0,
        capacity: data.capacity ?? 0,
        isMember: false,
      };
    });

  return { joined, discoverable };
});


/** Read-only published catalog. Purchase and entitlement changes remain separate trusted flows. */
export const getStoreCatalog = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const member = await db.collection("users").doc(uid).get();
  if (!member.exists || member.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(member.data())) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بتصفح المتجر حالياً.");
  }
  const snapshot = await db.collection("storeCatalog").limit(100).get();
  const items = snapshot.docs
    .map((document) => projectStoreCatalogItem(document.id, document.data()))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.itemId.localeCompare(right.itemId))
    .map(({ sortOrder: _sortOrder, ...item }) => item);
  return { items };
});


/**
 * Purchases a published store item with existing coins.
 * Balance debit, immutable ledger entry, purchase receipt, and entitlement
 * are committed atomically. Real-money top-ups are a separate unimplemented flow.
 */
export const purchaseStoreItem = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const itemId = request.data?.itemId;
  const requestId = request.data?.requestId;
  const expectedPriceCoins = request.data?.expectedPriceCoins;
  if (typeof itemId !== "string" || !/^[A-Za-z0-9_-]{3,64}$/.test(itemId) ||
      typeof requestId !== "string" || requestId.length < 8 ||
      requestId.length > 80 || !/^[A-Za-z0-9_-]+$/.test(requestId) ||
      typeof expectedPriceCoins !== "number" || !Number.isSafeInteger(expectedPriceCoins) ||
      expectedPriceCoins <= 0) {
    throw new HttpsError("invalid-argument", "بيانات شراء العنصر غير صالحة.");
  }

  const userRef = db.collection("users").doc(uid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const purchaseId = `${uid}_${requestId}`;
  const purchaseRef = db.collection("storePurchases").doc(purchaseId);
  const ledgerRef = userRef.collection("walletLedger").doc(`store_${purchaseId}`);
  const entitlementRef = userRef.collection("entitlements").doc(itemId);

  return db.runTransaction(async (transaction) => {
    const [member, itemSnapshot, priorPurchase, priorEntitlement] = await Promise.all([
      transaction.get(userRef),
      transaction.get(itemRef),
      transaction.get(purchaseRef),
      transaction.get(entitlementRef),
    ]);
    if (priorPurchase.exists) {
      const prior = priorPurchase.data() ?? {};
      if (prior.memberUid !== uid || prior.itemId !== itemId) {
        throw new HttpsError("already-exists", "معرف طلب الشراء مستخدم لعملية أخرى.");
      }
      return {
        purchaseId,
        itemId,
        priceCoins: prior.priceCoins,
        newBalance: prior.newBalance,
        expiresAt: prior.expiresAt?.toMillis?.() ?? null,
        idempotentReplay: true,
      };
    }
    if (!member.exists || member.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(member.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بإجراء المشتريات.");
    }
    if (!itemSnapshot.exists) {
      throw new HttpsError("not-found", "عنصر المتجر غير موجود.");
    }
    const itemData = itemSnapshot.data() ?? {};
    const item = projectStoreCatalogItem(itemId, itemData);
    if (!item) {
      throw new HttpsError("failed-precondition", "هذا العنصر غير منشور أو أن بيانات سعره غير صالحة.");
    }
    if (!isStoreItemPurchasable(item)) {
      throw new HttpsError(
        "failed-precondition",
        "شراء هذا العنصر غير متاح حتى اكتمال تنفيذ استحقاقه والتحقق منه.",
      );
    }
    if (!isStorePurchasePriceCurrent(expectedPriceCoins, item.priceCoins)) {
      throw new HttpsError(
        "failed-precondition",
        "تغير سعر العنصر منذ تحميل الكتالوج. حدّث المتجر وراجع السعر قبل تأكيد الشراء.",
      );
    }
    if (priorEntitlement.exists && isStoreEntitlementActive(priorEntitlement.data())) {
      throw new HttpsError("already-exists", "لديك هذا الاستحقاق فعالاً بالفعل.");
    }

    const memberData = member.data() ?? {};
    const currentBalance = memberData.coins ?? 0;
    const newBalance = calculateStorePurchaseBalance(currentBalance, item.priceCoins);
    if (newBalance === null) {
      throw new HttpsError("failed-precondition", "رصيد الكوينز غير كافٍ أو يحتوي على قيمة غير صالحة.");
    }

    const createdAt = FieldValue.serverTimestamp();
    const expiresAt = item.durationDays
      ? Timestamp.fromMillis(Date.now() + item.durationDays * 24 * 60 * 60 * 1000)
      : null;
    transaction.update(userRef, { coins: newBalance, updatedAt: createdAt });
    transaction.create(purchaseRef, {
      purchaseId,
      memberUid: uid,
      itemId,
      itemName: item.name,
      category: item.category,
      priceCoins: item.priceCoins,
      durationDays: item.durationDays ?? null,
      newBalance,
      expiresAt,
      status: "completed",
      createdAt,
    });
    transaction.create(ledgerRef, {
      type: "store_purchase",
      direction: "debit",
      amount: -item.priceCoins,
      itemId,
      itemName: item.name,
      purchaseId,
      createdAt,
    });
    transaction.set(entitlementRef, {
      itemId,
      itemName: item.name,
      category: item.category,
      status: "active",
      purchaseId,
      purchasedAt: createdAt,
      expiresAt,
    });
    return {
      purchaseId,
      itemId,
      priceCoins: item.priceCoins,
      newBalance,
      expiresAt: expiresAt?.toMillis() ?? null,
      idempotentReplay: false,
    };
  });
});


/** Owner/MFA-only catalog publishing; client writes to storeCatalog remain denied. */
export const setStoreCatalogItem = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let item;
  try {
    item = validateStoreCatalogItemInput(request.data);
  } catch {
    throw new HttpsError("invalid-argument", "بيانات عنصر المتجر أو سعره أو تصنيفه غير صالحة.");
  }
  const itemRef = db.collection("storeCatalog").doc(item.itemId);
  await db.runTransaction(async (transaction) => {
    const previousSnapshot = await transaction.get(itemRef);
    const now = FieldValue.serverTimestamp();
    transaction.set(itemRef, {
      itemId: item.itemId,
      name: item.name,
      description: item.description,
      category: item.category,
      priceCoins: item.priceCoins,
      durationDays: item.durationDays ?? null,
      sortOrder: item.sortOrder,
      active: item.active,
      purchaseEnabled: item.purchaseEnabled,
      fulfillmentReady: item.fulfillmentReady,
      createdAt: previousSnapshot.data()?.createdAt ?? now,
      updatedAt: now,
      updatedBy: actorUid,
    });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid,
      action: previousSnapshot.exists ? "store_catalog_item_updated" : "store_catalog_item_created",
      itemId: item.itemId,
      active: item.active,
      priceCoins: item.priceCoins,
      category: item.category,
      purchaseEnabled: item.purchaseEnabled,
      fulfillmentReady: item.fulfillmentReady,
      createdAt: now,
    });
  });
  return { itemId: item.itemId, active: item.active };
});

/** Returns only display-safe catalog fields to the authenticated owner. */
export const getOwnerStoreCatalog = onCall(async (request) => {
  const actorUid = requireOwner(request);
  // Seed only missing catalogue entries. Existing owner-edited prices are never overwritten.
  await db.runTransaction(async (transaction) => {
    const refs = DEFAULT_STORE_CATALOG.map((item) => db.collection("storeCatalog").doc(item.itemId));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    refs.forEach((ref, index) => {
      if (snapshots[index].exists) return;
      const item = DEFAULT_STORE_CATALOG[index];
      transaction.create(ref, {
        ...item,
        active: false,
        purchaseEnabled: false,
        fulfillmentReady: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actorUid,
      });
    });
  });
  const snapshot = await db.collection("storeCatalog").limit(100).get();
  const items = snapshot.docs
    .map((document) => {
      const data = document.data();
      const projected = projectStoreCatalogItem(document.id, { ...data, active: true });
      return projected ? { ...projected, active: data.active === true } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.itemId.localeCompare(right.itemId));
  return { items };
});


export {
  createMediaUploadIntent,
  finalizeMediaUpload,
  sendChatImageAttachment,
  getChatImageAttachmentUrl,
  sendChatMediaAttachment,
  getChatMediaAttachmentUrl,
  getMemberProfileMediaUrl,
  listMemberProfileGallery,
  getMyMediaUploadStatus,
  getMemberStoryMediaUrl,
  listOwnerMediaAssets,
  getOwnerMediaSafePreview,
  getOwnerMediaInspectionUrl,
  ownerMediaInspectionStream,
  ownerMediaPreview,
  cleanupExpiredMediaUploadIntents,
  enqueueMediaSecurityScan,
  dispatchMediaSecurityScan,
  receiveMediaScanVerdict,
} from "./media";

export { enforceChatMediaRetention, enforceChatTextRetention, enforceMediaOperationalAuditRetention, removeLateExpiredChatMediaDerivative };


const ROOM_RENTAL_SETTINGS = db.doc("platformSettings/roomRentals");

async function readRoomRentalPlans(): Promise<ReturnType<typeof validateRoomRentalPlans>> {
  const snapshot = await ROOM_RENTAL_SETTINGS.get();
  const raw = snapshot.data()?.plans;
  if (raw === undefined) return DEFAULT_ROOM_RENTAL_PLANS;
  try {
    return validateRoomRentalPlans(raw);
  } catch {
    throw new HttpsError("failed-precondition", "إعدادات أسعار استئجار الغرف غير صالحة؛ راجع لوحة المالك.");
  }
}

/** Public plan list: published plan prices are server-authored and versioned. */
export const getRoomRentalPlans = onCall(async (request) => {
  requireAuthenticatedUid(request.auth?.uid);
  const snapshot = await ROOM_RENTAL_SETTINGS.get();
  const plans = snapshot.exists ? await readRoomRentalPlans() : DEFAULT_ROOM_RENTAL_PLANS;
  const version = Number.isSafeInteger(snapshot.data()?.version) ? snapshot.data()!.version : 0;
  return { plans: plans.filter((plan) => plan.active), version };
});

/** Owner/MFA controls all room rental prices; every edit is versioned and audited. */
export const setRoomRentalPlans = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let plans;
  try {
    plans = validateRoomRentalPlans(request.data?.plans);
  } catch {
    throw new HttpsError("invalid-argument", "خطط الغرف أو الأسعار أو المدد غير صالحة.");
  }
  const result = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ROOM_RENTAL_SETTINGS);
    const version = (Number.isSafeInteger(previous.data()?.version) ? previous.data()!.version : 0) + 1;
    const now = FieldValue.serverTimestamp();
    transaction.set(ROOM_RENTAL_SETTINGS, { plans, version, updatedAt: now, updatedBy: actorUid });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid, action: "room_rental_pricing_updated", version,
      plans: plans.map((plan) => ({ ...plan })),
      createdAt: now,
    });
    return version;
  });
  return { saved: true, version: result };
});

/** A member creates and rents a private room in one atomic coin debit + room creation. */
export const createRentedRoom = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const name = typeof request.data?.name === "string" ? request.data.name.trim() : "";
  const capacity = request.data?.capacity;
  const planId = request.data?.planId;
  const expectedPriceCoins = request.data?.expectedPriceCoins;
  const requestId = requireRequestId(request.data?.requestId);
  if (name.length < 3 || name.length > 60 || !Number.isSafeInteger(capacity) ||
      capacity < 5 || capacity > 1000 || typeof planId !== "string" ||
      !Number.isSafeInteger(expectedPriceCoins)) {
    throw new HttpsError("invalid-argument", "بيانات الغرفة أو خطة الاستئجار غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc();
  const userRef = db.collection("users").doc(uid);
  const memberRef = roomRef.collection("members").doc(uid);
  const rentalRef = db.collection("roomRentals").doc(`${uid}_${requestId}`);
  const ledgerRef = userRef.collection("walletLedger").doc(`room_${uid}_${requestId}`);
  const nowMs = Date.now();
  const result = await db.runTransaction(async (transaction) => {
    const [user, settings, prior] = await Promise.all([
      transaction.get(userRef), transaction.get(ROOM_RENTAL_SETTINGS), transaction.get(rentalRef),
    ]);
    if (prior.exists) {
      const data = prior.data()!;
      if (data.ownerUid !== uid || data.planId !== planId) {
        throw new HttpsError("already-exists", "معرف طلب الاستئجار مستخدم لعملية أخرى.");
      }
      return { roomId: data.roomId, rentalId: rentalRef.id, priceCoins: data.priceCoins,
        expiresAt: data.expiresAt.toMillis(), idempotentReplay: true };
    }
    if (!user.exists || user.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح باستئجار غرفة.");
    }
    const plans = settings.exists ? validateRoomRentalPlans(settings.data()?.plans) : DEFAULT_ROOM_RENTAL_PLANS;
    const plan = plans.find((entry) => entry.planId === planId && entry.active);
    if (!plan || plan.priceCoins !== expectedPriceCoins) {
      throw new HttpsError("failed-precondition", "تغير سعر الخطة أو لم تعد متاحة؛ حدّث الأسعار قبل التأكيد.");
    }
    const userData = user.data()!;
    const newBalance = calculateRoomRentalBalance(userData.coins ?? 0, plan.priceCoins);
    if (newBalance === null) throw new HttpsError("failed-precondition", "رصيد الكوينز غير كافٍ للاستئجار.");
    let audience;
    try { audience = audienceForAge(userData.age); }
    catch { throw new HttpsError("failed-precondition", "أكمل ملفك العمري قبل إنشاء غرفة."); }
    const expiresAtMs = roomRentalExpiry(nowMs, plan.durationDays);
    const expiresAt = Timestamp.fromMillis(expiresAtMs);
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: newBalance, updatedAt: now });
    transaction.create(roomRef, {
      roomId: roomRef.id, name, kind: "private", capacity, audience, ownerUid: uid,
      memberCount: 1, status: "active", isRented: true, rentalId: rentalRef.id,
      rentalPlanId: plan.planId, rentalPriceCoins: plan.priceCoins,
      rentalDurationDays: plan.durationDays, expiresAt, invitedUids: [],
      createdAt: now, updatedAt: now,
    });
    transaction.create(memberRef, { uid, role: "owner", joinedAt: now });
    transaction.create(rentalRef, {
      rentalId: rentalRef.id, roomId: roomRef.id, ownerUid: uid, planId: plan.planId,
      priceCoins: plan.priceCoins, durationDays: plan.durationDays, status: "active",
      startsAt: Timestamp.fromMillis(nowMs), expiresAt, createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "room_rental", direction: "debit", amount: -plan.priceCoins,
      roomId: roomRef.id, rentalId: rentalRef.id, planId: plan.planId,
      durationDays: plan.durationDays, createdAt: now,
    });
    return { roomId: roomRef.id, rentalId: rentalRef.id, priceCoins: plan.priceCoins,
      expiresAt: expiresAtMs, newBalance, idempotentReplay: false };
  });
  return result;
});

/** Extends the current room rental using the current catalog price, never a client-supplied price. */
export const renewRoomRental = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  const planId = request.data?.planId;
  const expectedPriceCoins = request.data?.expectedPriceCoins;
  const requestId = requireRequestId(request.data?.requestId);
  if (!roomId || typeof planId !== "string" || !Number.isSafeInteger(expectedPriceCoins)) {
    throw new HttpsError("invalid-argument", "بيانات تجديد الغرفة غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const userRef = db.collection("users").doc(uid);
  const rentalRef = db.collection("roomRentals").doc(`${uid}_${requestId}`);
  const ledgerRef = userRef.collection("walletLedger").doc(`room_${uid}_${requestId}`);
  const nowMs = Date.now();
  return db.runTransaction(async (transaction) => {
    const [room, user, settings, prior] = await Promise.all([
      transaction.get(roomRef), transaction.get(userRef), transaction.get(ROOM_RENTAL_SETTINGS),
      transaction.get(rentalRef),
    ]);
    if (prior.exists) {
      const data = prior.data()!;
      if (data.roomId !== roomId || data.ownerUid !== uid) {
        throw new HttpsError("already-exists", "معرف طلب التجديد مستخدم لعملية أخرى.");
      }
      return { renewed: true, expiresAt: data.expiresAt.toMillis(), idempotentReplay: true };
    }
    if (!room.exists || room.data()?.ownerUid !== uid || room.data()?.isRented !== true ||
        !["active", "frozen"].includes(room.data()?.status)) {
      throw new HttpsError("permission-denied", "تجديد الغرفة متاح لمالك غرفة مستأجرة فقط.");
    }
    if (!user.exists || !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بالتجديد.");
    }
    const plans = settings.exists ? validateRoomRentalPlans(settings.data()?.plans) : DEFAULT_ROOM_RENTAL_PLANS;
    const plan = plans.find((entry) => entry.planId === planId && entry.active);
    if (!plan || plan.priceCoins !== expectedPriceCoins) {
      throw new HttpsError("failed-precondition", "تغير سعر التجديد؛ حدّث الأسعار قبل التأكيد.");
    }
    const balance = calculateRoomRentalBalance(user.data()?.coins ?? 0, plan.priceCoins);
    if (balance === null) throw new HttpsError("failed-precondition", "رصيد الكوينز غير كافٍ للتجديد.");
    const previousExpiry = room.data()?.expiresAt instanceof Timestamp
      ? room.data()!.expiresAt.toMillis() : nowMs;
    const startMs = Math.max(nowMs, previousExpiry);
    const expiresAt = Timestamp.fromMillis(roomRentalExpiry(startMs, plan.durationDays));
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: balance, updatedAt: now });
    transaction.update(roomRef, {
      status: "active", expiresAt, rentalId: rentalRef.id, rentalPlanId: plan.planId,
      rentalPriceCoins: plan.priceCoins, rentalDurationDays: plan.durationDays,
      frozenAt: FieldValue.delete(), freezeExpiresAt: FieldValue.delete(), updatedAt: now,
    });
    transaction.create(rentalRef, {
      rentalId: rentalRef.id, roomId, ownerUid: uid, planId: plan.planId,
      priceCoins: plan.priceCoins, durationDays: plan.durationDays, status: "active",
      startsAt: Timestamp.fromMillis(startMs), expiresAt, createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "room_rental_renewal", direction: "debit", amount: -plan.priceCoins,
      roomId, rentalId: rentalRef.id, planId: plan.planId,
      durationDays: plan.durationDays, createdAt: now,
    });
    return { renewed: true, expiresAt: expiresAt.toMillis(), newBalance: balance, idempotentReplay: false };
  });
});

/** A room member may leave; ownership must be transferred or closed first. */
export const leaveRoom = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  if (!roomId) throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  const roomRef = db.collection("rooms").doc(roomId);
  const memberRef = roomRef.collection("members").doc(uid);
  const moderatorRef = roomRef.collection("moderators").doc(uid);
  await db.runTransaction(async (transaction) => {
    const [room, member] = await Promise.all([transaction.get(roomRef), transaction.get(memberRef)]);
    if (!room.exists || !member.exists) throw new HttpsError("not-found", "عضوية الغرفة غير موجودة.");
    if (room.data()?.ownerUid === uid) {
      throw new HttpsError("failed-precondition", "مالك الغرفة لا يمكنه المغادرة قبل نقل الملكية أو إغلاق الغرفة.");
    }
    const count = Number.isSafeInteger(room.data()?.memberCount) ? room.data()!.memberCount : 1;
    transaction.delete(memberRef);
    transaction.delete(moderatorRef);
    transaction.update(roomRef, { memberCount: Math.max(0, count - 1), invitedUids: FieldValue.arrayRemove(uid),
      updatedAt: FieldValue.serverTimestamp() });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, { roomId, actorUid: uid, action: "room_member_left",
      createdAt: FieldValue.serverTimestamp() });
  });
  return { roomId, left: true };
});

/** Room ownership transfer is atomic and cannot transfer an expired or frozen rental. */
export const transferRoomOwnership = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  const newOwnerUid = typeof request.data?.newOwnerUid === "string" ? request.data.newOwnerUid.trim() : "";
  if (!roomId || !newOwnerUid || newOwnerUid === uid) throw new HttpsError("invalid-argument", "بيانات نقل الملكية غير صالحة.");
  const roomRef = db.collection("rooms").doc(roomId);
  const oldMemberRef = roomRef.collection("members").doc(uid);
  const newMemberRef = roomRef.collection("members").doc(newOwnerUid);
  await db.runTransaction(async (transaction) => {
    const [room, newUser, oldMember, newMember] = await Promise.all([
      transaction.get(roomRef), transaction.get(db.collection("users").doc(newOwnerUid)),
      transaction.get(oldMemberRef), transaction.get(newMemberRef),
    ]);
    if (!room.exists || room.data()?.ownerUid !== uid || !oldMember.exists ||
        room.data()?.status !== "active") throw new HttpsError("permission-denied", "لا يمكن نقل ملكية هذه الغرفة.");
    if (!newUser.exists || newUser.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(newUser.data())) throw new HttpsError("failed-precondition", "المالك الجديد غير مؤهل.");
    if (!newMember.exists) throw new HttpsError("failed-precondition", "يجب أن ينضم المالك الجديد إلى الغرفة أولاً.");
    transaction.update(roomRef, { ownerUid: newOwnerUid, updatedAt: FieldValue.serverTimestamp() });
    transaction.update(newMemberRef, { role: "owner", ownershipTransferredAt: FieldValue.serverTimestamp() });
    transaction.update(oldMemberRef, { role: "member", ownershipTransferredAt: FieldValue.serverTimestamp() });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, { roomId, actorUid: uid, targetUid: newOwnerUid,
      action: "room_ownership_transferred", createdAt: FieldValue.serverTimestamp() });
  });
  return { roomId, ownerUid: newOwnerUid, transferred: true };
});

/** Owner may close their room; closure is audited and does not refund past rental charges. */
export const closeOwnedRoom = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  if (!roomId) throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  const roomRef = db.collection("rooms").doc(roomId);
  await db.runTransaction(async (transaction) => {
    const room = await transaction.get(roomRef);
    if (!room.exists || room.data()?.ownerUid !== uid ||
        !["active", "frozen"].includes(room.data()?.status)) {
      throw new HttpsError("permission-denied", "إغلاق الغرفة متاح لمالكها فقط.");
    }
    const rentalId = room.data()?.rentalId;
    const rentalRef = typeof rentalId === "string" ? db.collection("roomRentals").doc(rentalId) : null;
    const rental = rentalRef ? await transaction.get(rentalRef) : null;
    const now = FieldValue.serverTimestamp();
    transaction.update(roomRef, { status: "closed", closedAt: now,
      closedBy: uid, updatedAt: now });
    if (rentalRef && rental?.exists) {
      transaction.update(rentalRef, { status: "closed_by_owner", closedAt: now, updatedAt: now });
    }
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, { roomId, actorUid: uid, action: "room_closed",
      createdAt: FieldValue.serverTimestamp() });
  });
  return { roomId, closed: true };
});

/** Freeze expired rentals for a 24-hour grace period, then close; no destructive room deletion. */
export const processExpiredRoomRentals = onSchedule("every 15 minutes", async () => {
  const now = Timestamp.now();
  const expired = await db.collection("rooms").where("isRented", "==", true)
    .where("status", "==", "active").where("expiresAt", "<=", now).limit(100).get();
  for (const document of expired.docs) {
    const data = document.data();
    const frozen = await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(document.ref);
      if (!fresh.exists || fresh.data()?.status !== "active" ||
          !(fresh.data()?.expiresAt instanceof Timestamp) ||
          fresh.data()!.expiresAt.toMillis() > Date.now()) return false;
      const rentalId = fresh.data()?.rentalId;
      const rentalRef = typeof rentalId === "string" ? db.collection("roomRentals").doc(rentalId) : null;
      const rental = rentalRef ? await transaction.get(rentalRef) : null;
      const now = FieldValue.serverTimestamp();
      transaction.update(document.ref, {
        status: "frozen", frozenAt: now,
        freezeExpiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
        updatedAt: now,
      });
      if (rentalRef && rental?.exists) transaction.update(rentalRef, { status: "grace_period", updatedAt: now });
      const notificationRef = db.collection("notifications").doc();
      transaction.create(notificationRef, {
        userId: data.ownerUid, title: "انتهت مدة استئجار الغرفة",
        body: "تم إيقاف الغرفة مؤقتاً لمدة 24 ساعة. يمكنك تجديدها من داخل التطبيق.",
        timestamp: FieldValue.serverTimestamp(), read: false,
      });
      return true;
    });
    if (frozen && typeof data.ownerUid === "string") {
      await sendPushToMember(data.ownerUid, "انتهت مدة استئجار الغرفة",
        "تم إيقاف الغرفة مؤقتاً لمدة 24 ساعة. يمكنك تجديدها من داخل التطبيق.",
        { type: "room_rental_frozen", roomId: document.id });
    }
  }
  const graceExpired = await db.collection("rooms").where("isRented", "==", true)
    .where("status", "==", "frozen").where("freezeExpiresAt", "<=", now).limit(100).get();
  for (const document of graceExpired.docs) {
    const ownerUid = await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(document.ref);
      if (!fresh.exists || fresh.data()?.status !== "frozen" ||
          !(fresh.data()?.freezeExpiresAt instanceof Timestamp) ||
          fresh.data()!.freezeExpiresAt.toMillis() > Date.now()) return null;
      const rentalId = fresh.data()?.rentalId;
      const rentalRef = typeof rentalId === "string" ? db.collection("roomRentals").doc(rentalId) : null;
      const rental = rentalRef ? await transaction.get(rentalRef) : null;
      const now = FieldValue.serverTimestamp();
      transaction.update(document.ref, { status: "closed", closedAt: now,
        closeReason: "rental_expired", updatedAt: now });
      if (rentalRef && rental?.exists) transaction.update(rentalRef, { status: "expired", closedAt: now, updatedAt: now });
      const notificationRef = db.collection("notifications").doc();
      transaction.create(notificationRef, {
        userId: fresh.data()?.ownerUid, title: "أغلقت الغرفة لانتهاء الاستئجار",
        body: "انتهت مهلة التجديد الإضافية. يمكنك التواصل مع الدعم عند الحاجة.",
        timestamp: FieldValue.serverTimestamp(), read: false,
      });
      return typeof fresh.data()?.ownerUid === "string" ? fresh.data()!.ownerUid : null;
    });
    if (ownerUid) {
      await sendPushToMember(ownerUid, "أغلقت الغرفة لانتهاء الاستئجار",
        "انتهت مهلة التجديد الإضافية. يمكنك التواصل مع الدعم عند الحاجة.",
        { type: "room_rental_closed", roomId: document.id });
    }
  }
});



/** Public member-facing package catalogue; returns prices only, never payment or credit authority. */
export const getAvailableCoinPackages = onCall(async () => {
  const snapshot = await ECONOMY_PRICING_SETTINGS.get();
  const data = snapshot.data() ?? {};
  if (data.manualCoinPurchasesEnabled === false) return { packages: [], manualPurchasesEnabled: false };
  let packages;
  try { packages = validateCoinPackages(data.coinPackages ?? DEFAULT_COIN_PACKAGES); }
  catch { throw new HttpsError("failed-precondition", "قائمة باقات الكوينز غير صالحة."); }
  return {
    packages: packages.filter((item) => item.active),
    manualPurchasesEnabled: true,
    automatedCheckoutEnabled: false,
  };
});

/** Member requests a fixed package or a negotiated custom coin quantity. No coins are issued here. */
export const createCoinPurchaseRequest = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  let input;
  try { input = validateCoinPurchaseRequestInput(request.data); }
  catch { throw new HttpsError("invalid-argument", "بيانات طلب شراء الكوينز غير صالحة."); }
  const userRef = db.collection("users").doc(uid);
  const settingsRef = db.doc("platformSettings/economyPricing");
  const requestRef = db.collection("coinPurchaseRequests").doc(`${uid}_${input.requestId}`);
  const result = await db.runTransaction(async (transaction) => {
    const [user, settings, existing] = await Promise.all([
      transaction.get(userRef), transaction.get(settingsRef), transaction.get(requestRef),
    ]);
    if (!user.exists || user.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "يجب أن يكون حساب العضو مكتملاً ونشطاً.");
    }
    const economy = settings.data() ?? {};
    if (economy.manualCoinPurchasesEnabled === false || economy.automatedCoinCheckoutEnabled === true) {
      throw new HttpsError("failed-precondition", "طلبات الشراء اليدوية غير متاحة حالياً.");
    }
    let packageSnapshot: Record<string, unknown> | null = null;
    let requestedCoins: number | null = null;
    if (input.kind === "package") {
      let packages;
      try { packages = validateCoinPackages(economy.coinPackages ?? DEFAULT_COIN_PACKAGES); }
      catch { throw new HttpsError("failed-precondition", "قائمة باقات الكوينز غير صالحة."); }
      const selected = packages.find((item) => item.packageId === input.packageId && item.active);
      if (!selected) throw new HttpsError("not-found", "الباقة غير متاحة حالياً.");
      packageSnapshot = { ...selected };
      requestedCoins = selected.coins;
    } else {
      requestedCoins = input.requestedCoins ?? null;
    }
    if (existing.exists) {
      const prior = existing.data() ?? {};
      if (prior.requesterUid !== uid || prior.kind !== input.kind ||
          prior.packageId !== (input.packageId ?? null) ||
          prior.requestedCoins !== requestedCoins) {
        throw new HttpsError("already-exists", "معرف الطلب مستخدم لطلب مختلف.");
      }
      return { requestId: input.requestId, status: prior.status, idempotentReplay: true };
    }
    transaction.create(requestRef, {
      requestId: input.requestId, requesterUid: uid, kind: input.kind,
      packageId: input.packageId ?? null, packageSnapshot,
      requestedCoins, status: "pending_owner_contact",
      paymentChannel: "manual_owner_contact", currency: "EUR",
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return { requestId: input.requestId, status: "pending_owner_contact", idempotentReplay: false };
  });
  return result;
});

/** Member can inspect only their own manual purchase requests. */
export const getMyCoinPurchaseRequests = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const snapshot = await db.collection("coinPurchaseRequests")
    .where("requesterUid", "==", uid).orderBy("createdAt", "desc").limit(50).get();
  return { requests: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

/** Owner-only bounded inbox for manual coin purchase requests. */
export const listOwnerCoinPurchaseRequests = onCall(async (request) => {
  requireOwner(request);
  const status = request.data?.status;
  const allowed = ["pending_owner_contact", "payment_instructions_sent",
    "approved", "rejected", "withdrawn"];
  if (status !== undefined && !allowed.includes(status)) {
    throw new HttpsError("invalid-argument", "حالة الطلب غير صالحة.");
  }
  let query = db.collection("coinPurchaseRequests").orderBy("createdAt", "desc").limit(100);
  if (typeof status === "string") query = db.collection("coinPurchaseRequests")
    .where("status", "==", status).orderBy("createdAt", "desc").limit(100);
  const snapshot = await query.get();
  return { requests: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

/** Owner records negotiated amount and sends manual payment instructions; this never credits coins. */
export const setCoinPurchasePaymentInstructions = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let input;
  try { input = validateOwnerPaymentInstructionInput({
    requestId: request.data?.requestId, instructions: request.data?.instructions,
    agreedCoins: request.data?.agreedCoins, agreedPriceMinor: request.data?.agreedPriceMinor,
    currency: request.data?.currency,
  }); }
  catch { throw new HttpsError("invalid-argument", "تعليمات الدفع أو الكمية أو السعر غير صالحة."); }
  const requesterUid = request.data?.requesterUid;
  if (typeof requesterUid !== "string" || requesterUid.length < 1 || requesterUid.length > 128 ||
      requesterUid === actorUid) throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  const ref = db.collection("coinPurchaseRequests").doc(`${requesterUid}_${input.requestId}`);
  const chatId = createDirectChatId(actorUid, requesterUid);
  const chatRef = db.collection("directChats").doc(chatId);
  const notificationId = `coin_payment_${input.requestId}`;
  const notificationRef = db.collection("users").doc(requesterUid).collection("notifications").doc(notificationId);
  let messageId = "";
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.requesterUid !== requesterUid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    const prior = snapshot.data()!;
    if (["approved", "rejected", "withdrawn"].includes(String(prior.status))) {
      throw new HttpsError("failed-precondition", "لا يمكن تعديل طلب منتهٍ.");
    }
    const nextVersion = (Number.isSafeInteger(prior.instructionsVersion) ? prior.instructionsVersion : 0) + 1;
    messageId = createHash("sha256").update(`coin-purchase:${requesterUid}:${input.requestId}:${nextVersion}`).digest("hex");
    const messageRef = chatRef.collection("messages").doc(messageId);
    const [chatSnapshot, existingMessage] = await Promise.all([
      transaction.get(chatRef), transaction.get(messageRef),
    ]);
    if (chatSnapshot.exists) {
      const participants = chatSnapshot.data()?.participantUids;
      if (!Array.isArray(participants) || !participants.includes(actorUid) || !participants.includes(requesterUid)) {
        throw new HttpsError("permission-denied", "تعذر ربط تعليمات الدفع بالمحادثة الثنائية.");
      }
    }
    const now = FieldValue.serverTimestamp();
    transaction.set(chatRef, {
      participantUids: [actorUid, requesterUid].sort(),
      createdAt: chatSnapshot.exists ? chatSnapshot.data()?.createdAt ?? now : now,
      lastMessageAt: now, lastMessageSenderUid: actorUid,
      lastMessagePreview: "أرسل مالك المنصة تعليمات دفع طلب الكوينز.",
    }, { merge: true });
    if (!existingMessage.exists) {
      transaction.create(messageRef, {
        messageId, chatId, senderUid: actorUid, recipientUid: requesterUid,
        text: "تعليمات الدفع لطلب شراء الكوينز رقم " + input.requestId +
          "\nالكمية المتفق عليها: " + input.agreedCoins + " كوين" +
          "\nالسعر: " + (input.agreedPriceMinor / 100).toFixed(2) + " EUR" +
          "\nالتعليمات: " + input.instructions,
        type: "text", isPlatformOwnerMessage: true,
        senderLabel: "إدارة منصة مودة", adminMessageType: "coin_purchase_payment_instructions",
        createdAt: now,
      });
    }
    transaction.set(notificationRef, {
      notificationId, type: "coin_purchase_payment_instructions", senderUid: actorUid,
      chatId, messageId, title: "تعليمات دفع من مالك مودة",
      body: "أرسل مالك المنصة تعليمات الدفع لطلب الكوينز. افتح المحادثة للاطلاع عليها.",
      isRead: false, createdAt: now,
    });
    transaction.update(ref, {
      status: "payment_instructions_sent", chatId, agreedCoins: input.agreedCoins,
      agreedPriceMinor: input.agreedPriceMinor, currency: input.currency,
      paymentInstructions: input.instructions, instructionsVersion: nextVersion,
      instructionsSetBy: actorUid, instructionsSetAt: now, updatedAt: now,
    });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid, targetUid: requesterUid, action: "coin_purchase_payment_instructions_set",
      requestId: input.requestId, agreedCoins: input.agreedCoins,
      agreedPriceMinor: input.agreedPriceMinor, currency: input.currency,
      chatId, messageId, instructionsVersion: nextVersion, createdAt: now,
    });
  });
  await sendPushToMember(requesterUid, "تعليمات دفع من مالك مودة",
    "أرسل مالك المنصة تعليمات الدفع لطلب الكوينز. افتح المحادثة للاطلاع عليها.",
    { type: "coin_purchase_payment_instructions", chatId, messageId });
  return { requestId: input.requestId, status: "payment_instructions_sent", chatId, messageId };
});

/** Only the owner can attest to external receipt; approval atomically credits coins and ledger. */
export const approveCoinPurchaseRequest = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let input;
  try { input = validateExternalPaymentVerification({
    requestId: request.data?.requestId,
    externalPaymentVerified: request.data?.externalPaymentVerified,
    externalPaymentReference: request.data?.externalPaymentReference,
    verificationNote: request.data?.verificationNote,
  }); }
  catch { throw new HttpsError("invalid-argument", "إثبات الدفع الخارجي غير مكتمل."); }
  const requesterUid = request.data?.requesterUid;
  if (typeof requesterUid !== "string" || requesterUid.length < 1 || requesterUid.length > 128 ||
      requesterUid === actorUid) throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  const requestRef = db.collection("coinPurchaseRequests").doc(`${requesterUid}_${input.requestId}`);
  const userRef = db.collection("users").doc(requesterUid);
  const ledgerId = `coin_purchase_${input.requestId}`;
  const ledgerRef = userRef.collection("walletLedger").doc(ledgerId);
  const auditRef = db.collection("adminAuditLogs").doc(`coin_purchase_approval_${requesterUid}_${input.requestId}`);
  const result = await db.runTransaction(async (transaction) => {
    const [purchase, user, ledger] = await Promise.all([
      transaction.get(requestRef), transaction.get(userRef), transaction.get(ledgerRef),
    ]);
    if (!purchase.exists || purchase.data()?.requesterUid !== requesterUid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    const data = purchase.data()!;
    if (data.status === "approved") return { status: "approved", idempotentReplay: true, newBalance: user.data()?.coins ?? null };
    if (data.status !== "payment_instructions_sent") {
      throw new HttpsError("failed-precondition", "لا يمكن اعتماد الطلب قبل إرسال تعليمات الدفع.");
    }
    if (!user.exists || !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "حساب العضو غير مؤهل لاستلام الكوينز.");
    }
    if (ledger.exists) throw new HttpsError("already-exists", "يوجد سجل مالي سابق لهذا الطلب؛ يلزم تدقيقه.");
    const coins = data.agreedCoins;
    if (!Number.isSafeInteger(coins) || coins < 1 || coins > 1000000000) {
      throw new HttpsError("failed-precondition", "الكمية المتفق عليها غير صالحة.");
    }
    const oldBalance = user.data()?.coins ?? 0;
    if (!Number.isSafeInteger(oldBalance) || oldBalance < 0 || oldBalance + coins > 2000000000) {
      throw new HttpsError("failed-precondition", "رصيد العضو لا يسمح بإتمام العملية.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: oldBalance + coins, walletUpdatedAt: now });
    transaction.create(ledgerRef, {
      type: "coin_purchase_manual_credit", amount: coins, balanceBefore: oldBalance,
      balanceAfter: oldBalance + coins, purchaseRequestId: input.requestId,
      externalPaymentReference: input.externalPaymentReference,
      priceMinor: data.agreedPriceMinor, currency: data.currency ?? "EUR",
      actorUid, createdAt: now,
    });
    transaction.update(requestRef, {
      status: "approved", externalPaymentVerified: true,
      externalPaymentReference: input.externalPaymentReference,
      verificationNote: input.verificationNote, verifiedBy: actorUid,
      verifiedAt: now, creditedCoins: coins, updatedAt: now,
    });
    transaction.create(auditRef, {
      actorUid, targetUid: requesterUid, action: "coin_purchase_manually_verified_and_approved",
      requestId: input.requestId, externalPaymentReference: input.externalPaymentReference,
      verificationNote: input.verificationNote, creditedCoins: coins,
      priceMinor: data.agreedPriceMinor, currency: data.currency ?? "EUR", createdAt: now,
    });
    return { status: "approved", idempotentReplay: false, newBalance: oldBalance + coins };
  });
  return result;
});

/** Owner rejection requires a bounded reason and never modifies a wallet. */
export const rejectCoinPurchaseRequest = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const requesterUid = request.data?.requesterUid;
  const requestId = request.data?.requestId;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (typeof requesterUid !== "string" || requesterUid.length < 1 || requesterUid.length > 128 ||
      requesterUid === actorUid || typeof requestId !== "string" ||
      !/^[A-Za-z0-9_-]{8,80}$/.test(requestId) || reason.length < 5 || reason.length > 500) {
    throw new HttpsError("invalid-argument", "سبب الرفض أو معرف الطلب غير صالح.");
  }
  const ref = db.collection("coinPurchaseRequests").doc(`${requesterUid}_${requestId}`);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.requesterUid !== requesterUid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    if (snapshot.data()?.status === "approved") throw new HttpsError("failed-precondition", "لا يمكن رفض طلب معتمد.");
    if (["rejected", "withdrawn"].includes(String(snapshot.data()?.status))) return;
    transaction.update(ref, { status: "rejected", rejectionReason: reason,
      rejectedBy: actorUid, rejectedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, { actorUid, targetUid: requesterUid,
      action: "coin_purchase_request_rejected", requestId, reason, createdAt: FieldValue.serverTimestamp() });
  });
  return { requestId, status: "rejected" };
});

/** Members may withdraw their own request before approval. */
export const withdrawCoinPurchaseRequest = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const requestId = request.data?.requestId;
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(requestId)) {
    throw new HttpsError("invalid-argument", "معرف الطلب غير صالح.");
  }
  const ref = db.collection("coinPurchaseRequests").doc(`${uid}_${requestId}`);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.requesterUid !== uid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    if (["approved", "rejected"].includes(String(snapshot.data()?.status))) {
      throw new HttpsError("failed-precondition", "لا يمكن سحب طلب منتهٍ.");
    }
    if (snapshot.data()?.status === "withdrawn") return;
    transaction.update(ref, { status: "withdrawn", withdrawnAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp() });
  });
  return { requestId, status: "withdrawn" };
});

const ECONOMY_PRICING_SETTINGS = db.doc("platformSettings/economyPricing");

/** Owner-only view and safe first-run seeding for editable coin and advertising prices. */
export const getOwnerEconomyPricing = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const snapshot = await ECONOMY_PRICING_SETTINGS.get();
  if (!snapshot.exists) {
    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(ECONOMY_PRICING_SETTINGS);
      if (current.exists) return;
      transaction.create(ECONOMY_PRICING_SETTINGS, {
        coinPackages: DEFAULT_COIN_PACKAGES,
        adPrices: DEFAULT_AD_PRICES,
        version: 1,
        realMoneyCheckoutEnabled: false,
        manualCoinPurchasesEnabled: true,
        automatedCoinCheckoutEnabled: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actorUid,
      });
    });
  }
  const data = (await ECONOMY_PRICING_SETTINGS.get()).data() ?? {};
  let coinPackages, adPrices;
  try {
    coinPackages = validateCoinPackages(data.coinPackages);
    adPrices = validateAdPrices(data.adPrices);
  } catch {
    throw new HttpsError("failed-precondition", "إعدادات اقتصاد المنصة غير صالحة؛ راجع الدعم التقني.");
  }
  return {
    coinPackages, adPrices,
    version: Number.isSafeInteger(data.version) ? data.version : 0,
    realMoneyCheckoutEnabled: false,
    manualCoinPurchasesEnabled: data.manualCoinPurchasesEnabled !== false,
    automatedCoinCheckoutEnabled: false,
  };
});

/** Owner/MFA-only economy price updates. This configures prices, not payment processing. */
export const setOwnerEconomyPricing = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let coinPackages, adPrices;
  try {
    coinPackages = validateCoinPackages(request.data?.coinPackages);
    adPrices = validateAdPrices(request.data?.adPrices);
  } catch {
    throw new HttpsError("invalid-argument", "أسعار باقات الكوينز أو الإعلانات غير صالحة.");
  }
  const version = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ECONOMY_PRICING_SETTINGS);
    const nextVersion = (Number.isSafeInteger(previous.data()?.version) ? previous.data()!.version : 0) + 1;
    const now = FieldValue.serverTimestamp();
    transaction.set(ECONOMY_PRICING_SETTINGS, {
      coinPackages, adPrices, version: nextVersion,
      manualCoinPurchasesEnabled: request.data?.manualCoinPurchasesEnabled !== false,
      automatedCoinCheckoutEnabled: false,
      realMoneyCheckoutEnabled: false,
      updatedAt: now, updatedBy: actorUid,
      createdAt: previous.data()?.createdAt ?? now,
    });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid, action: "economy_pricing_updated", version: nextVersion,
      coinPackageCount: coinPackages.length, adPlacementCount: adPrices.length,
      realMoneyCheckoutEnabled: false, createdAt: now,
    });
    return nextVersion;
  });
  return { saved: true, version, realMoneyCheckoutEnabled: false };
});
