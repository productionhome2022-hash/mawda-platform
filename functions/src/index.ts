export { getMyBiometricVerificationStatus, getBiometricVerificationPhrase, startBiometricVerificationRequest, submitBiometricVerificationRequest, listOwnerBiometricVerificationRequests, getOwnerBiometricEvidencePlayback, decideBiometricVerificationRequest, cleanupDecidedBiometricEvidence } from "./biometric-lifecycle";
import {
  isStoreGiftReplayCompatible, isEligibleStoreGiftMemberRecord, calculateStoreGiftExpiryMs,
} from "./store-gifting";
import {
  validateGroupCallEntitlementPolicy, isGroupCallBillingCollectionEnabled,
  projectStoreGiftHistoryEntry, projectGroupCallTestPricingSnapshot,
  evaluateCallParticipantEntitlements,
} from "./call-entitlements";
import {
  assertPlatformRoleCapacity,
  platformRoleCapacity,
  PLATFORM_ROLE_CAPACITY,
  type NumberedPlatformRole,
} from "./platform-role-identities";
import { initializeApp } from "firebase-admin/app";
import { validateCallRequest, validateCallSignal, canTransitionCall, CALL_RING_TIMEOUT_MS, CALL_SIGNAL_MAX_AGE_MS, CALL_SIGNAL_MAX_PER_CALLER } from "./call-signaling";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { validateMemberProfile } from "./member-profile";
import { isAllowedLegalPortalAppId } from "./legal-portal-access";
import { FieldPath, FieldValue, Timestamp, getFirestore, type DocumentReference, type Transaction } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineString, defineSecret } from "firebase-functions/params";
import { validateMediaLegalHoldInput } from "./media-legal-hold";
import { validateMessageLegalHoldInput } from "./message-legal-hold";
import { logger } from "firebase-functions";
import { calculateTransferBreakdown } from "./coin-math";
import { reconcileWalletLedger } from "./wallet-reconciliation";
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
import { encodeMemberMessagePageToken, validateMemberMessagePageRequest } from "./member-message-pagination";
import { isMessageReadByPeer, shouldAdvanceReadReceipt } from "./direct-message-receipts";
import { hasActiveBiometricVerification } from "./biometric-verification";
import { createEmailVerificationCycle, emailVerificationRewardLedgerId, EMAIL_VERIFICATION_REWARD_COINS, canRewardEmailVerificationCycle } from "./email-verification-cycle";
import { canEditMemberSocialLinks, canExposeMemberSocialLinks } from "./member-social-links-access";
import { isMemberAccountInGoodStanding } from "./member-access";
import { projectEconomicPaymentPolicy, validateEconomicPaymentPolicy } from "./economy-payment-policy";
import {
  validateFeaturedAdFinancialEvent,
  applyFeaturedAdFinancialEvent,
  featuredAdFinancialIdempotencyId,
  defaultFeaturedAdFinancialSnapshot,
} from "./featured-ad-finance";
import {
  assertMessageLinksAllowed,
  BIOMETRIC_APPROVED_HOSTS,
  canSendApprovedPlatformLinks,
} from "./link-policy";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { audienceForAge, canJoinRoom, canJoinGuestRoom, normalizeModeratorPermissions } from "./room-policy";
import { isActiveRentedPrivateRoom, areRoomCallParticipantsMembers, areDirectCallParticipantsEligible, roomCallParticipantLimit } from "./room-call-policy";
import { isGuestSessionActive } from "./guest-sessions";
import { hasPlatformOwnerSession } from "./owner-access";
import { calculateOwnerAuditHash, verifyOwnerAuditChain } from "./owner-audit-chain";
import {
  OWNER_AUDIT_ARCHIVE_BATCH_SIZE,
  OWNER_AUDIT_ARCHIVE_MIN_AGE_MS,
  OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS,
  ADDITIONAL_AUDIT_COLLECTIONS,
  isOwnerAuditArchiveEligible,
  validateLockedAuditArchiveBucket,
  verifyOwnerAuditArchiveChunk,
  ownerAuditArchiveObjectName,
  serializeOwnerAuditArchive,
  auditCollectionArchiveObjectName,
  serializeAuditCollectionArchive,
} from "./audit-archive";
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
  isStorePurchaseReplayCompatible,
  projectStoreEntitlementFeatures,
} from "./store-purchase";
import { enforceChatMediaRetention, enforceChatTextRetention, enforceMediaOperationalAuditRetention, removeLateExpiredChatMediaDerivative } from "./retention";
import { deleteMediaAssetForMessage } from "./media";
import { DEFAULT_ROOM_RENTAL_PLANS, validateRoomRentalPlans, roomRentalExpiry, calculateRoomRentalBalance } from "./room-rental";
import { normalizeRoomEventInput, nextRoomEventStatus } from "./room-events";
import { DEFAULT_STORE_CATALOG } from "./default-store-catalog";
import { validateCoinPackages, validateAdPrices, currencyExponentForCode, EXPERIMENTAL_DEFAULT_COIN_PACKAGES, EXPERIMENTAL_DEFAULT_AD_PRICES } from "./economy-pricing";
import { validateCoinPurchaseRequestInput, validateOwnerPaymentInstructionInput, validateExternalPaymentVerification } from "./coin-purchase-requests";
import { validateOwnerLiveStreamInput } from "./owner-live-stream";
import { validateCreatorProposalInput, CreatorProposalValidationError } from "./creator-proposals";
import { validateAdvertisingIntake, advertisingIntakeAuditEventId, advertisingIntakeReviewAuditEventId, AdvertisingIntakeValidationError } from "./advertising-intake";
import { validateProductionApplication, ProductionApplicationValidationError } from "./production-applications";
import {
  applyContractSignature,
  assertContractStatusTransition,
  canMakeContractEffective,
  computeContractContentHash,
  validateContractDraftInput,
  validateContractReadyForSignature,
  type ContractDraftInput,
  type ContractSignatureEvidence,
  type ContractSigningState,
  type ContractStatus,
} from "./contracts-workflow";
import { validateSpecializedRoleGrant, specializedRoleGrantId, applySpecializedPermissionDelta } from "./advertising-governance";
import {
  defaultAttendanceRewardPolicy,
  validateAttendanceRewardPolicy,
  utcRewardPeriod,
  validateTimedAdCampaignInput,
  eligibleHeartbeatDelta,
  timedAdMemberCounterId,
  AttendanceRewardType,
} from "./engagement-rewards";

initializeApp();

const db = getFirestore();
const GROUP_CALL_PRICING_SETTINGS = db.doc("platformSettings/groupCallPricing");
const TRANSFER_SETTINGS = db.doc("platformSettings/coinTransfers");
const OWNER_REVIEW_AUDIT_HEAD = db.collection("adminAuditChainHeads").doc("ownerReview");
const legalHoldExpiryEnabled = defineString("MAWDA_LEGAL_HOLD_EXPIRY_ENABLED", { default: "false" });
const mawddaLegalPortalAppIds = defineString("MAWDDA_LEGAL_PORTAL_APP_IDS", { default: "" });
const ownerAuditArchiveEnabled = defineString("MAWDA_AUDIT_ARCHIVE_ENABLED", { default: "false" });
const ownerAuditArchiveBucketName = defineString("MAWDA_AUDIT_ARCHIVE_BUCKET", { default: "" });
const mawddaTurnUrls = defineString("MAWDDA_TURN_URLS", { default: "" });
const mawddaTurnSharedSecret = defineSecret("MAWDDA_TURN_SHARED_SECRET");

/**
 * Append a hash-linked owner-review audit event. A Firestore transaction
 * serializes head updates so concurrent review requests cannot fork sequence.
 * The head is maintained separately from the event documents.
 */
async function createOwnerReviewAuditEventInTransaction(
  transaction: Transaction,
  event: Record<string, unknown>,
): Promise<string> {
  const auditRef = db.collection("adminAuditLogs").doc();
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
  return auditRef.id;
}

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
function requireWebPortalAccess(request: { app?: { appId?: string } | null }): void {
  if (!isAllowedLegalPortalAppId(request.app?.appId, mawddaLegalPortalAppIds.value())) {
    throw new HttpsError(
      "failed-precondition",
      "هذه الخدمة متاحة حصراً عبر بوابة Mawdda على الويب.",
    );
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
  if (!hasPlatformOwnerSession(token, undefined, uid)) {
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
  // Anonymous preview guests must never reach wallet/coin operations. Reject
  // from the verified Firebase Auth provider claim before any Firestore reads,
  // so a guest receives an explicit authorization denial rather than a
  // misleading missing-user error (guest profiles are intentionally separate
  // from member wallet documents).
  const firebaseIdentity = request.auth?.token.firebase;
  const signInProvider = firebaseIdentity && typeof firebaseIdentity === "object" &&
      !Array.isArray(firebaseIdentity)
    ? (firebaseIdentity as Record<string, unknown>).sign_in_provider
    : undefined;
  if (signInProvider === "anonymous") {
    throw new HttpsError("permission-denied", "التحويلات المالية متاحة للأعضاء فقط.");
  }
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
    const [existing, settings, senderSnapshot, recipientSnapshot,
      senderLedgerSnapshot, recipientLedgerSnapshot, platformLedgerSnapshot] = await Promise.all([
      transaction.get(transferRef),
      transaction.get(TRANSFER_SETTINGS),
      transaction.get(senderRef),
      transaction.get(recipientRef),
      transaction.get(senderLedgerRef),
      transaction.get(recipientLedgerRef),
      transaction.get(platformLedgerRef),
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
      let expectedBreakdown;
      try {
        expectedBreakdown = calculateTransferBreakdown(prior.grossAmount, prior.commissionBps);
      } catch {
        throw new HttpsError("failed-precondition", "بيانات التحويل التاريخية غير صالحة؛ يلزم تدقيق مالي.");
      }
      const senderLedger = senderLedgerSnapshot.data() ?? {};
      const recipientLedger = recipientLedgerSnapshot.data() ?? {};
      const platformLedger = platformLedgerSnapshot.data() ?? {};
      const senderBalanceSnapshotValid =
        senderLedger.balanceBefore === undefined && senderLedger.balanceAfter === undefined ||
        Number.isSafeInteger(senderLedger.balanceBefore) &&
        Number.isSafeInteger(senderLedger.balanceAfter) &&
        senderLedger.balanceBefore >= 0 &&
        senderLedger.balanceAfter === senderLedger.balanceBefore - prior.grossAmount;
      const recipientBalanceSnapshotValid =
        recipientLedger.balanceBefore === undefined && recipientLedger.balanceAfter === undefined ||
        Number.isSafeInteger(recipientLedger.balanceBefore) &&
        Number.isSafeInteger(recipientLedger.balanceAfter) &&
        recipientLedger.balanceBefore >= 0 &&
        recipientLedger.balanceAfter === recipientLedger.balanceBefore + prior.netAmount;
      if (prior.status !== "completed" ||
          prior.commissionAmount !== expectedBreakdown.commissionAmount ||
          prior.netAmount !== expectedBreakdown.netAmount ||
          !senderLedgerSnapshot.exists || senderLedger.type !== "coin_transfer_sent" ||
          senderLedger.direction !== "debit" || senderLedger.amount !== -prior.grossAmount ||
          senderLedger.grossAmount !== prior.grossAmount ||
          senderLedger.commissionAmount !== prior.commissionAmount ||
          senderLedger.commissionBps !== prior.commissionBps ||
          senderLedger.recipientUid !== recipientUid ||
          senderLedger.recipientNetAmount !== prior.netAmount ||
          senderLedger.transferId !== transferId || !senderBalanceSnapshotValid ||
          !recipientLedgerSnapshot.exists || recipientLedger.type !== "coin_transfer_received" ||
          recipientLedger.direction !== "credit" || recipientLedger.amount !== prior.netAmount ||
          recipientLedger.senderUid !== senderUid || recipientLedger.transferId !== transferId ||
          !recipientBalanceSnapshotValid ||
          !platformLedgerSnapshot.exists || platformLedger.type !== "coin_transfer_commission" ||
          platformLedger.direction !== "credit" || platformLedger.amount !== prior.commissionAmount ||
          platformLedger.transferId !== transferId || platformLedger.currency !== "coin" ||
          platformLedger.grossAmount !== prior.grossAmount ||
          platformLedger.commissionBps !== prior.commissionBps ||
          platformLedger.senderUid !== senderUid || platformLedger.recipientUid !== recipientUid) {
        throw new HttpsError("failed-precondition", "سجل التحويل لا يطابق قيود المحافظ ودفتر عمولة المنصة؛ يلزم تدقيق مالي.");
      }
      return {
        transferId, senderUid: prior.senderUid, recipientUid: prior.recipientUid,
        grossAmount: prior.grossAmount, commissionBps: prior.commissionBps,
        commissionPercent: prior.commissionPercent, commissionAmount: prior.commissionAmount,
        netAmount: prior.netAmount, status: prior.status, idempotentReplay: true,
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
      senderBalanceBefore: senderBalance,
      senderBalanceAfter: senderBalance - amount,
      recipientBalanceBefore: recipientBalance,
      recipientBalanceAfter: recipientBalance + netAmount,
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
      balanceBefore: senderBalance,
      balanceAfter: senderBalance - amount,
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
      balanceBefore: recipientBalance,
      balanceAfter: recipientBalance + netAmount,
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

  const transferLog = {
    amount,
    commissionAmount: result.commissionAmount,
    netAmount: result.netAmount,
    idempotentReplay: result.idempotentReplay,
  };
  if (result.idempotentReplay) {
    logger.debug("Coin transfer idempotent replay", transferLog);
  } else {
    logger.info("Coin transfer processed", transferLog);
  }

  return result;
});

/**
 * يغير مالك المنصة نسبة العمولة بوحدات basis points:
 * 2,000 = 20%. لا يُسمح للعميل العادي بتغيير إعدادات العمولة.
 * يجب منح custom claim platformOwner من بيئة موثوقة فقط.
 */
/** Returns a server-calculated quote so the client can show the fee before confirmation. */
/**
 * Read-only owner diagnostic for one member's wallet ledger.
 * A truncated or unorderable history is explicitly reported as incomplete.
 */
export const getOwnerWalletReconciliation = onCall(async (request) => {
  requireOwner(request);
  const targetUid = request.data?.targetUid;
  if (typeof targetUid !== "string" || targetUid.trim() !== targetUid ||
      targetUid.length < 1 || targetUid.length > 128 || targetUid.includes("/")) {
    throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  }
  const userRef = db.collection("users").doc(targetUid);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) throw new HttpsError("not-found", "حساب العضو غير موجود.");
  const ledgerSnapshot = await userRef.collection("walletLedger")
    .orderBy(FieldPath.documentId()).limit(1001).get();
  const truncated = ledgerSnapshot.size > 1000;
  const entries = ledgerSnapshot.docs.slice(0, 1000).map((document) => {
    const data = document.data();
    return {
      id: document.id,
      amount: data.amount,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
      createdAtMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
    };
  });
  const chronologyIncomplete = entries.some((entry) => entry.createdAtMs === null);
  let reconciliation;
  try {
    if (chronologyIncomplete) {
      const currentBalance = userSnapshot.data()?.coins ?? 0;
      if (!Number.isSafeInteger(currentBalance) || currentBalance < 0) {
        throw new Error("INVALID_WALLET_BALANCE");
      }
      reconciliation = {
        status: "incomplete" as const, currentBalance,
        ledgerEntryCount: entries.length, netLedgerDelta: null,
        openingBalance: null, computedBalance: null,
        entriesMissingSnapshots: entries.filter((entry) =>
          entry.balanceBefore === undefined || entry.balanceAfter === undefined).length,
        anomalies: [],
      };
    } else {
      entries.sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0) || a.id.localeCompare(b.id));
      reconciliation = reconcileWalletLedger(userSnapshot.data()?.coins ?? 0, entries);
    }
  } catch {
    throw new HttpsError("failed-precondition", "رصيد المحفظة أو دفتر القيود يحتوي بيانات غير صالحة.");
  }
  return {
    targetUid, readOnly: true, scope: "walletLedger",
    ...reconciliation,
    status: truncated || chronologyIncomplete ? "incomplete" : reconciliation.status,
    truncated, chronologyIncomplete,
    unorderableEntryCount: chronologyIncomplete
      ? entries.filter((entry) => entry.createdAtMs === null).length : 0,
    inspectedLimit: 1000,
  };
});

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
  const cycleStartMs = Date.now();
  const cycleStart = Timestamp.fromMillis(cycleStartMs);
  const initialEmailCycle = createEmailVerificationCycle({
    uid, email: authUser.email, sequence: 1, serverNowMs: cycleStartMs,
  });
  const emailCycleRef = db.collection("emailVerificationCycles")
    .doc(uid + "_" + initialEmailCycle.cycleId);
  const rewardLedgerRef = userRef.collection("walletLedger")
    .doc(emailVerificationRewardLedgerId(initialEmailCycle.cycleId));
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
      emailVerifiedAt: cycleStart,
      emailVerificationSequence: 1,
      emailVerificationCycleId: initialEmailCycle.cycleId,
      emailVerificationCycleStartedAt: cycleStart,
      emailVerificationCycleExpiresAt: Timestamp.fromMillis(initialEmailCycle.expiresAtMs),
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
      coins: EMAIL_VERIFICATION_REWARD_COINS,
      profileCompleted: true,
      createdAt,
      updatedAt: createdAt,
    });
    transaction.create(usernameRef, {
      uid,
      username: profile.username,
      createdAt,
    });
    transaction.create(emailCycleRef, {
      ...initialEmailCycle,
      status: "rewarded",
      startedAt: cycleStart,
      expiresAt: Timestamp.fromMillis(initialEmailCycle.expiresAtMs),
      verifiedAt: cycleStart,
      rewardedAt: cycleStart,
      createdAt: cycleStart,
      updatedAt: cycleStart,
    });
    transaction.create(rewardLedgerRef, {
      type: "email_verification_reward",
      direction: "credit",
      amount: EMAIL_VERIFICATION_REWARD_COINS,
      reason: "verified_email_initial_cycle",
      cycleId: initialEmailCycle.cycleId,
      cycleSequence: initialEmailCycle.sequence,
      idempotencyKey: initialEmailCycle.cycleId,
      createdAt: cycleStart,
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
  if (viewerUid !== targetUid && !hasPlatformOwnerSession(
    (request.auth?.token ?? {}) as Record<string, unknown>,
    undefined,
    viewerUid,
  )) {
    const viewerSnapshot = await db.collection("users").doc(viewerUid).get();
    const viewerData = viewerSnapshot.data();
    if (!viewerSnapshot.exists || !isMemberAccountInGoodStanding(viewerData) ||
        !Number.isSafeInteger(viewerData?.age) || !Number.isSafeInteger(memberData.age) ||
        ((viewerData!.age as number) < 18) !== ((memberData.age as number) < 18)) {
      throw new HttpsError("permission-denied", "عرض الملفات بين الفئات العمرية المختلفة غير متاح.");
    }
    const viewerBlocks = Array.isArray(viewerData?.blockedUids) ? viewerData!.blockedUids : [];
    const memberBlocks = Array.isArray(memberData.blockedUids) ? memberData.blockedUids : [];
    if (viewerBlocks.includes(targetUid) || memberBlocks.includes(viewerUid)) {
      throw new HttpsError("permission-denied", "لا يمكن عرض هذا الملف بسبب إعدادات الحظر.");
    }
  }

  const [entitlementSnapshot] = await Promise.all([
    db.collection("users").doc(targetUid).collection("entitlements")
      .orderBy("purchasedAt", "desc").limit(100).get(),
  ]);
  const premiumFeatures = projectStoreEntitlementFeatures(
    entitlementSnapshot.docs.map((document) => document.data()),
  );
  const activeItemIds = new Set(premiumFeatures.activeFeatures.map((feature) => feature.itemId));
  const analyticsActive = activeItemIds.has("profile_analytics_30d");
  let profileAnalytics: { last7DaysViews: number } | null = null;

  if (analyticsActive && viewerUid !== targetUid) {
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    const dailyRef = db.collection("users").doc(targetUid).collection("profileAnalytics").doc(day);
    const visitorHash = createHash("sha256").update(viewerUid).digest("hex");
    const visitorRef = dailyRef.collection("visitors").doc(visitorHash);
    await db.runTransaction(async (transaction) => {
      const [dailySnapshot, visitorSnapshot] = await Promise.all([
        transaction.get(dailyRef),
        transaction.get(visitorRef),
      ]);
      if (!visitorSnapshot.exists) {
        transaction.create(visitorRef, {
          viewerUidHash: visitorHash,
          firstViewedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(dailyRef, {
          day,
          viewCount: FieldValue.increment(1),
          createdAt: dailySnapshot.exists
            ? dailySnapshot.data()?.createdAt ?? FieldValue.serverTimestamp()
            : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        transaction.update(visitorRef, { lastViewedAt: FieldValue.serverTimestamp() });
      }
    });
  } else if (analyticsActive && viewerUid === targetUid) {
    const sinceDay = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const analyticsSnapshot = await db.collection("users").doc(targetUid)
      .collection("profileAnalytics")
      .where("day", ">=", sinceDay)
      .orderBy("day", "asc")
      .limit(7)
      .get();
    profileAnalytics = {
      last7DaysViews: analyticsSnapshot.docs.reduce((total, document) => {
        const count = document.data().viewCount;
        return total + (Number.isSafeInteger(count) && count > 0 ? count : 0);
      }, 0),
    };
  }

  const greeting = activeItemIds.has("visitor_greeting_30d") &&
      typeof memberData.profileVisitorGreeting === "string"
    ? memberData.profileVisitorGreeting.trim().slice(0, 160)
    : "";
  const pinnedProfileSection = activeItemIds.has("profile_pin_30d") &&
      ["bio", "interests", "gallery"].includes(memberData.pinnedProfileSection)
    ? memberData.pinnedProfileSection as string
    : null;
  const boostExpiry = memberData.discoveryBoostExpiresAt;
  const boostExpiryMs = boostExpiry instanceof Timestamp
    ? boostExpiry.toMillis()
    : typeof boostExpiry?.toMillis === "function" ? boostExpiry.toMillis() : 0;
  const discoveryBoostActive = boostExpiryMs > Date.now();
  const customTitle = activeItemIds.has("title_custom") &&
      typeof memberData.customTitle === "string"
    ? memberData.customTitle.trim().slice(0, 40)
    : "";
  const premiumProfileData = {
    ...premiumFeatures,
    ...(customTitle ? { activeTitle: customTitle } : {}),
    ...(greeting ? { visitorGreeting: greeting } : {}),
    ...(pinnedProfileSection ? { pinnedProfileSection } : {}),
    discoveryBoostActive,
    ...(profileAnalytics ? { profileAnalytics } : {}),
  };
  const biometricLinksActive = canExposeMemberSocialLinks(
    memberData.profileCompleted === true,
    targetUid,
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
        ...premiumProfileData,
        profileVisibility: memberData.profileVisibility === "public" ? "public" : "private",
        canManageSocialLinks: biometricLinksActive,
        hiddenSocialLinks: hiddenProviders,
      }
    : { ...profile, ...premiumProfileData };
});

/**
 * Lets a member personalize the title only while their title entitlement is active.
 * The public profile projection re-checks that entitlement before exposing this value.
 */
export const setMemberCustomTitle = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const title = typeof request.data?.title === "string" ? request.data.title.trim() : "";
  if (title.length < 2 || title.length > 40 || /[\u0000-\u001F\u007F]/.test(title)) {
    throw new HttpsError("invalid-argument", "يجب أن يتراوح اللقب بين حرفين و40 حرفاً دون محارف تحكم.");
  }

  const userRef = db.collection("users").doc(uid);
  const entitlementRef = userRef.collection("entitlements").doc("title_custom");
  await db.runTransaction(async (transaction) => {
    const [userSnapshot, entitlementSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(entitlementRef),
    ]);
    const user = userSnapshot.data() ?? {};
    const entitlement = entitlementSnapshot.data() ?? {};
    if (!userSnapshot.exists || user.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(user)) {
      throw new HttpsError("failed-precondition", "يجب أن تكون العضوية مكتملة وفعالة.");
    }
    if (!entitlementSnapshot.exists || entitlement.itemId !== "title_custom" ||
        entitlement.category !== "title" || !isStoreEntitlementActive(entitlement)) {
      throw new HttpsError("failed-precondition", "شراء لقب مميز فعال مطلوب لتخصيص لقبك.");
    }
    transaction.update(userRef, {
      customTitle: title,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const auditRef = db.collection("memberProfileAudit").doc();
    transaction.create(auditRef, {
      memberUid: uid,
      action: "member_custom_title_updated",
      changedFields: ["customTitle"],
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { title };
});


/**
 * Updates the member's visitor greeting while the matching paid entitlement is active.
 */
export const setMemberProfileVisitorGreeting = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const greeting = typeof request.data?.greeting === "string" ? request.data.greeting.trim() : "";
  if (greeting.length < 3 || greeting.length > 160 ||
      /(?:https?:\/\/|www\.|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i.test(greeting)) {
    throw new HttpsError("invalid-argument", "رسالة الترحيب يجب أن تكون نصاً عادياً من 3 إلى 160 حرفاً دون روابط أو بريد.");
  }
  const userRef = db.collection("users").doc(uid);
  const entitlementRef = userRef.collection("entitlements").doc("visitor_greeting_30d");
  const auditRef = db.collection("profileFeatureAuditLogs").doc();
  await db.runTransaction(async (transaction) => {
    const [userSnapshot, entitlementSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(entitlementRef),
    ]);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(userSnapshot.data())) {
      throw new HttpsError("permission-denied", "العضوية غير مؤهلة لتعديل رسالة الترحيب.");
    }
    if (!entitlementSnapshot.exists || !isStoreEntitlementActive(entitlementSnapshot.data())) {
      throw new HttpsError("failed-precondition", "ميزة ترحيب الزوار غير نشطة في حسابك.");
    }
    transaction.update(userRef, {
      profileVisitorGreeting: greeting,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorUid: uid,
      action: "profile_visitor_greeting_updated",
      greetingHash: createHash("sha256").update(greeting).digest("hex"),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { updated: true };
});

/**
 * Selects the section displayed first on a premium profile.
 */
export const setMemberPinnedProfileSection = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const section = request.data?.section;
  if (!["bio", "interests", "gallery"].includes(section)) {
    throw new HttpsError("invalid-argument", "القسم المطلوب تثبيته غير صالح.");
  }
  const userRef = db.collection("users").doc(uid);
  const entitlementRef = userRef.collection("entitlements").doc("profile_pin_30d");
  await db.runTransaction(async (transaction) => {
    const [userSnapshot, entitlementSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(entitlementRef),
    ]);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(userSnapshot.data())) {
      throw new HttpsError("permission-denied", "العضوية غير مؤهلة لتثبيت أقسام الملف.");
    }
    if (!entitlementSnapshot.exists || !isStoreEntitlementActive(entitlementSnapshot.data())) {
      throw new HttpsError("failed-precondition", "ميزة تثبيت الأقسام غير نشطة في حسابك.");
    }
    transaction.update(userRef, {
      pinnedProfileSection: section,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { section };
});

/**
 * Age-segmented public discovery. Active discovery boosts sort ahead of
 * unboosted profiles; blocked pairs and private profiles are never returned.
 */
export const discoverMembers = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const viewerSnapshot = await db.collection("users").doc(uid).get();
  const viewer = viewerSnapshot.data();
  if (!viewerSnapshot.exists || viewer?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(viewer)) {
    throw new HttpsError("permission-denied", "أكمل العضوية قبل استكشاف الأعضاء.");
  }
  const viewerAge = viewer.age;
  if (!Number.isSafeInteger(viewerAge) || viewerAge < 16 || viewerAge > 120) {
    throw new HttpsError("failed-precondition", "العمر المسجل غير صالح لعرض الاكتشاف.");
  }
  const viewerBlocked = new Set(
    Array.isArray(viewer.blockedUids) ? viewer.blockedUids.filter((value: unknown) => typeof value === "string") : [],
  );
  const snapshot = await db.collection("users")
    .where("profileCompleted", "==", true)
    .limit(150)
    .get();
  const nowMs = Date.now();
  const members = snapshot.docs.flatMap((document) => {
    if (document.id === uid) return [];
    const data = document.data();
    if (data.profileVisibility !== "public" || !isMemberAccountInGoodStanding(data) ||
        !Number.isSafeInteger(data.age) || ((data.age as number) < 18) !== (viewerAge < 18) ||
        viewerBlocked.has(document.id)) return [];
    const blockedByCandidate = Array.isArray(data.blockedUids) && data.blockedUids.includes(uid);
    if (blockedByCandidate) return [];
    const profile = projectPublicMemberProfile(document.id, {
      ...data,
      profileVisibility: "public",
    });
    if (!profile) return [];
    const expiry = data.discoveryBoostExpiresAt;
    const boostExpiryMs = expiry instanceof Timestamp
      ? expiry.toMillis()
      : typeof expiry?.toMillis === "function" ? expiry.toMillis() : 0;
    const isBoosted = boostExpiryMs > nowMs;
    const createdAtMs = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0;
    return [{ ...profile, isBoosted, _boostExpiryMs: boostExpiryMs, _createdAtMs: createdAtMs }];
  });
  members.sort((left, right) =>
    Number(right.isBoosted) - Number(left.isBoosted) ||
    right._boostExpiryMs - left._boostExpiryMs ||
    right._createdAtMs - left._createdAtMs,
  );
  return {
    members: members.slice(0, 50).map((member) => ({
      uid: member.uid,
      displayName: member.displayName,
      username: member.username,
      bio: member.bio,
      profession: member.profession,
      country: member.country,
      region: member.region,
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      interests: member.interests,
      goals: member.goals,
      socialLinks: member.socialLinks,
      isBoosted: member.isBoosted,
    })),
  };
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
    if (!canChangeMemberSocialLinkVisibility(hidden, data.biometricVerification, member.id)) {
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


/**
 * Fail-closed until the approved Super Owner manual-review workflow is
 * implemented end-to-end: owner claim + fresh MFA, private request-bound
 * audio/video evidence, versioned review transaction, append-only audit,
 * calendar-month retry/renewal rules and exactly-once central wallet ledger.
 * Client booleans, local OS prompts and attempt IDs cannot grant verification
 * or rewards. Provider/device attestation is not a prerequisite for the
 * Super Owner's human decision and cannot replace it.
 */
export const completeBiometricVerificationCycle = onCall(async (request) => {
  requireAuthenticatedUid(request.auth?.uid);
  throw new HttpsError(
    "failed-precondition",
    "مكافأة وامتيازات التوثيق البيومتري معلّقة حتى اكتمال المراجعة اليدوية الخادمية بواسطة Super Owner وضوابطها الذرية. لا تمنح نافذة النظام المحلية أي توثيق أو كوينز.",
  );
});

/**
 * Starts a fresh email ownership challenge after three calendar months from the last successful verification.
 * Firebase Auth is temporarily marked unverified so the member must redeem a
 * fresh provider-issued email action link before the renewal reward is credited.
 */
export const startEmailVerificationRenewal = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const authUser = await getAuth().getUser(uid);
  if (!authUser.email) {
    throw new HttpsError("failed-precondition", "لا يوجد بريد إلكتروني مرتبط بالحساب.");
  }
  const email = authUser.email.trim().toLowerCase();
  const userRef = db.collection("users").doc(uid);
  const nowMs = Date.now();

  const cycleResult = await db.runTransaction(async (transaction) => {
    let expiredPendingId: string | null = null;
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "يجب إكمال الملف الشخصي أولاً.");
    }
    const userData = userSnapshot.data()!;
    const pendingId = userData.emailVerificationRenewalPendingCycleId;
    if (typeof pendingId === "string" && pendingId.length > 0) {
      const pendingRef = db.collection("emailVerificationCycles").doc(uid + "_" + pendingId);
      const pendingSnapshot = await transaction.get(pendingRef);
      const pending = pendingSnapshot.data();
      const expiry = pending?.expiresAt;
      const expiryMs = expiry instanceof Timestamp
        ? expiry.toMillis()
        : typeof expiry?.toMillis === "function" ? expiry.toMillis() : 0;
      if (pendingSnapshot.exists && pending?.status === "pending" &&
          pending.email === email && expiryMs > nowMs) {
        return {
          cycleId: pendingId,
          email,
          alreadyPending: true,
          authResetAt: pending.authResetAt ?? null,
        };
      }
      if (pendingSnapshot.exists && pending?.status === "pending") {
        expiredPendingId = pendingId;
      }
    }

    const priorExpiry = userData.emailVerificationCycleExpiresAt;
    const priorExpiryMs = priorExpiry instanceof Timestamp
      ? priorExpiry.toMillis()
      : typeof priorExpiry?.toMillis === "function" ? priorExpiry.toMillis() : null;
    if (expiredPendingId === null) {
      if (!authUser.emailVerified || priorExpiryMs === null ||
          priorExpiryMs > nowMs) {
        throw new HttpsError("failed-precondition", "لم يحن موعد دورة التحقق التالية بعد.");
      }
    }

    const sequence = (Number.isSafeInteger(userData.emailVerificationSequence)
      ? userData.emailVerificationSequence as number
      : 1) + 1;
    const cycle = createEmailVerificationCycle({
      uid,
      email,
      sequence,
      serverNowMs: nowMs,
    });
    const cycleRef = db.collection("emailVerificationCycles").doc(uid + "_" + cycle.cycleId);
    const existingCycle = await transaction.get(cycleRef);
    if (existingCycle.exists) {
      throw new HttpsError("already-exists", "دورة التحقق هذه موجودة مسبقاً.");
    }
    if (expiredPendingId !== null) {
      transaction.update(
        db.collection("emailVerificationCycles").doc(uid + "_" + expiredPendingId),
        { status: "expired", expiredAt: FieldValue.serverTimestamp() },
      );
    }
    const startedAt = Timestamp.fromMillis(cycle.startedAtMs);
    const expiresAt = Timestamp.fromMillis(cycle.expiresAtMs);
    transaction.create(cycleRef, {
      ...cycle,
      status: "pending",
      startedAt,
      expiresAt,
      authResetAt: null,
      createdAt: startedAt,
      updatedAt: startedAt,
    });
    transaction.update(userRef, {
      emailVerified: false,
      emailVerificationSequence: sequence,
      emailVerificationRenewalPendingCycleId: cycle.cycleId,
      emailVerificationRenewalPendingEmail: email,
      emailVerificationRenewalStartedAt: startedAt,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      cycleId: cycle.cycleId,
      email,
      alreadyPending: false,
      authResetAt: null,
    };
  });

  // Retry-safe: if Auth was reset but recording authResetAt failed, the next
  // call observes Auth=false and records the marker without invalidating a
  // subsequently redeemed link.
  if (cycleResult.authResetAt == null) {
    if (authUser.emailVerified) {
      await getAuth().updateUser(uid, { emailVerified: false });
    }
    const cycleRef = db.collection("emailVerificationCycles").doc(uid + "_" + cycleResult.cycleId);
    await db.runTransaction(async (transaction) => {
      const cycleSnapshot = await transaction.get(cycleRef);
      if (!cycleSnapshot.exists || cycleSnapshot.data()?.status !== "pending") {
        throw new HttpsError("failed-precondition", "انتهت دورة التحقق قبل تهيئة البريد.");
      }
      if (cycleSnapshot.data()?.authResetAt == null) {
        transaction.update(cycleRef, { authResetAt: FieldValue.serverTimestamp() });
      }
    });
  }

  return {
    cycleId: cycleResult.cycleId,
    email: cycleResult.email,
    alreadyPending: cycleResult.alreadyPending,
    sendVerificationEmail: true,
  };
});

/**
 * Finalizes a renewal only after Firebase Auth confirms that the member
 * redeemed the fresh email action link for the same address.
 */
export const completeEmailVerificationRenewal = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const authUser = await getAuth().getUser(uid);
  if (!authUser.email || !authUser.emailVerified) {
    throw new HttpsError("failed-precondition", "افتح رابط التحقق المرسل إلى بريدك أولاً.");
  }
  const email = authUser.email.trim().toLowerCase();
  const userRef = db.collection("users").doc(uid);
  const nowMs = Date.now();

  return db.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true) {
      throw new HttpsError("failed-precondition", "ملف العضوية غير مكتمل.");
    }
    const userData = userSnapshot.data()!;
    const cycleId = userData.emailVerificationRenewalPendingCycleId;
    if (typeof cycleId !== "string" || cycleId.length !== 64) {
      throw new HttpsError("failed-precondition", "لا توجد دورة تحقق بريد معلقة.");
    }
    const cycleRef = db.collection("emailVerificationCycles").doc(uid + "_" + cycleId);
    const ledgerRef = userRef.collection("walletLedger").doc(emailVerificationRewardLedgerId(cycleId));
    const [cycleSnapshot, ledgerSnapshot] = await Promise.all([
      transaction.get(cycleRef),
      transaction.get(ledgerRef),
    ]);
    if (!cycleSnapshot.exists) {
      throw new HttpsError("not-found", "دورة التحقق غير موجودة.");
    }
    const cycleData = cycleSnapshot.data()!;
    const startedAtMs = cycleData.startedAt instanceof Timestamp
      ? cycleData.startedAt.toMillis()
      : Number(cycleData.startedAtMs);
    const expiresAtMs = cycleData.expiresAt instanceof Timestamp
      ? cycleData.expiresAt.toMillis()
      : Number(cycleData.expiresAtMs);
    const cycle = {
      cycleId,
      uid,
      email: cycleData.email,
      sequence: cycleData.sequence,
      status: cycleData.status,
      startedAtMs,
      expiresAtMs,
    };
    if (!canRewardEmailVerificationCycle({
      cycle,
      currentEmail: email,
      authEmailVerified: authUser.emailVerified,
      serverNowMs: nowMs,
    })) {
      throw new HttpsError("failed-precondition", "تعذر اعتماد دورة البريد؛ تحقق من الرابط والبريد ومدة الصلاحية.");
    }
    if (cycleData.authResetAt == null) {
      throw new HttpsError("failed-precondition", "لم يتم إصدار تحدي تحقق جديد لهذه الدورة.");
    }
    if (ledgerSnapshot.exists) {
      throw new HttpsError("already-exists", "مكافأة دورة البريد مسجلة مسبقاً.");
    }

    const balance = Number.isSafeInteger(userData.coins) ? userData.coins as number : 0;
    const newBalance = balance + EMAIL_VERIFICATION_REWARD_COINS;
    if (!Number.isSafeInteger(newBalance)) {
      throw new HttpsError("out-of-range", "الرصيد الناتج يتجاوز الحد الرقمي الآمن.");
    }
    const verifiedAt = Timestamp.fromMillis(nowMs);
    transaction.update(cycleRef, {
      status: "rewarded",
      verifiedAt,
      rewardedAt: verifiedAt,
      updatedAt: verifiedAt,
    });
    transaction.update(userRef, {
      coins: newBalance,
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
      emailVerificationCycleId: cycleId,
      emailVerificationCycleStartedAt: Timestamp.fromMillis(startedAtMs),
      emailVerificationCycleExpiresAt: Timestamp.fromMillis(expiresAtMs),
      emailVerificationRenewalPendingCycleId: FieldValue.delete(),
      emailVerificationRenewalPendingEmail: FieldValue.delete(),
      emailVerificationRenewalStartedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(ledgerRef, {
      type: "email_verification_reward",
      direction: "credit",
      amount: EMAIL_VERIFICATION_REWARD_COINS,
      reason: "verified_email_renewal_cycle",
      cycleId,
      cycleSequence: cycle.sequence,
      idempotencyKey: cycleId,
      createdAt: verifiedAt,
    });
    transaction.create(db.collection("verificationAuditLogs").doc(ledgerRef.id), {
      actorUid: uid,
      action: "email_verification_cycle_rewarded",
      cycleId,
      cycleSequence: cycle.sequence,
      rewardCoins: EMAIL_VERIFICATION_REWARD_COINS,
      verifiedEmailHash: createHash("sha256").update(email).digest("hex"),
      createdAt: verifiedAt,
    });
    return {
      verified: true,
      rewardGranted: true,
      rewardAmount: EMAIL_VERIFICATION_REWARD_COINS,
      newBalance,
      cycleId,
      expiresAtMs,
    };
  });
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
        lastMessageAt: now, lastMessageId: messageId, lastMessageSenderUid: actorUid,
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
      const ownerSession = hasPlatformOwnerSession((request.auth?.token ?? {}) as Record<string, unknown>, undefined, senderUid);
      const isBiometricallyVerified = hasActiveBiometricVerification(sender.biometricVerification, senderUid);
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
        lastMessageId: messageId,
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
  let pageRequest: ReturnType<typeof validateMemberMessagePageRequest>;
  try {
    pageRequest = validateMemberMessagePageRequest(request.data ?? {});
  } catch {
    throw new HttpsError("invalid-argument", "مؤشر صفحة الرسائل غير صالح.");
  }
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
  const peerSnapshot = await db.collection("users").doc(peer).get();
  const currentUserData = user.data() ?? {};
  const peerData = peerSnapshot.data() ?? {};
  const currentBlocks = Array.isArray(currentUserData.blockedUids) ? currentUserData.blockedUids : [];
  const peerBlocks = Array.isArray(peerData.blockedUids) ? peerData.blockedUids : [];
  if (!peerSnapshot.exists || !isMemberAccountInGoodStanding(peerData) ||
      currentBlocks.includes(peer) || peerBlocks.includes(uid)) {
    throw new HttpsError("permission-denied", "لم تعد هذه المحادثة متاحة بسبب حالة العضوية أو إعدادات الحظر.");
  }
  let messagesQuery = chatRef.collection("messages")
    .orderBy("createdAt", pageRequest.direction === "after" ? "asc" : "desc")
    .orderBy(FieldPath.documentId(), pageRequest.direction === "after" ? "asc" : "desc");
  if (pageRequest.cursor) {
    messagesQuery = messagesQuery.startAfter(
      Timestamp.fromMillis(pageRequest.cursor.createdAtMillis),
      pageRequest.cursor.messageId,
    );
  }
  const messages = await messagesQuery.limit(pageRequest.limit + 1).get();
  const hasMore = messages.docs.length > pageRequest.limit;
  const pageDocs = messages.docs.slice(0, pageRequest.limit);
  const boundaryDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;
  const nextPageToken = hasMore && boundaryDoc
    ? encodeMemberMessagePageToken(boundaryDoc.data().createdAt.toMillis(), boundaryDoc.id)
    : null;
  const orderedMessageDocs = pageRequest.direction === "after"
    ? pageDocs
    : [...pageDocs].reverse();
  const latestMessageDoc = pageRequest.direction === "after"
    ? pageDocs[pageDocs.length - 1] ?? null
    : pageDocs[0] ?? null;
  const chatData = chat.data() ?? {};
  const fallbackLastMessageAt = chatData.lastMessageAt;
  const latestMessagePageToken = latestMessageDoc
    ? encodeMemberMessagePageToken(
      latestMessageDoc.data().createdAt.toMillis(),
      latestMessageDoc.id,
    )
    : fallbackLastMessageAt instanceof Timestamp && typeof chatData.lastMessageId === "string"
      ? encodeMemberMessagePageToken(fallbackLastMessageAt.toMillis(), chatData.lastMessageId)
      : null;
  const rawDeletionRevision = chatData.messageDeletionRevision;
  const messageDeletionRevision = Number.isSafeInteger(rawDeletionRevision) && rawDeletionRevision >= 0
    ? rawDeletionRevision
    : 0;
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
    messageDeletionRevision,
    latestMessagePageToken,
    pageDirection: pageRequest.direction,
    hasMore,
    nextPageToken,
    messages: orderedMessageDocs.map((doc) => {
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

/**
 * Returns a safe, recent-only inbox projection for the signed-in member.
 * It never exposes messages or conversations involving a blocked participant.
 */
export const getMyDirectChats = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const userSnapshot = await db.collection("users").doc(uid).get();
  const currentUser = userSnapshot.data() ?? {};
  if (!userSnapshot.exists || currentUser.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(currentUser)) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بفتح صندوق الرسائل.");
  }

  const chatsSnapshot = await db.collection("directChats")
    .where("participantUids", "array-contains", uid)
    .orderBy("lastMessageAt", "desc")
    .limit(50)
    .get();
  const validChats = chatsSnapshot.docs.map((document) => {
    const data = document.data();
    const participants = data.participantUids;
    if (!Array.isArray(participants) || participants.length !== 2 ||
        participants.some((value: unknown) => typeof value !== "string") ||
        participants[0] === participants[1] || !participants.includes(uid)) {
      return null;
    }
    const peerUid = participants.find((participant: string) => participant !== uid);
    return typeof peerUid === "string" ? { document, data, peerUid } : null;
  }).filter((value): value is NonNullable<typeof value> => value !== null);

  if (validChats.length === 0) return { chats: [] };

  const peerSnapshots = await db.getAll(
    ...validChats.map(({ peerUid }) => db.collection("users").doc(peerUid)),
  );
  const receiptSnapshots = await db.getAll(
    ...validChats.map(({ document }) =>
      document.ref.collection("readReceipts").doc(uid),
    ),
  );
  const currentBlocks = new Set(
    Array.isArray(currentUser.blockedUids) ? currentUser.blockedUids : [],
  );

  const chats = validChats.flatMap((chat, index) => {
    const peerSnapshot = peerSnapshots[index];
    const peer = peerSnapshot.data() ?? {};
    const peerBlocks = Array.isArray(peer.blockedUids) ? peer.blockedUids : [];
    if (!peerSnapshot.exists || peer.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(peer) || currentBlocks.has(chat.peerUid) ||
        peerBlocks.includes(uid)) {
      return [];
    }

    const receipt = receiptSnapshots[index].data() ?? {};
    const lastMessageAt = chat.data.lastMessageAt instanceof Timestamp
      ? chat.data.lastMessageAt.toMillis()
      : null;
    const lastReadAt = receipt.lastReadMessageCreatedAt instanceof Timestamp
      ? receipt.lastReadMessageCreatedAt.toMillis()
      : 0;
    const senderUid = typeof chat.data.lastMessageSenderUid === "string"
      ? chat.data.lastMessageSenderUid
      : "";
    const peerName = [
      peer.displayName,
      peer.fullName,
      peer.username,
    ].find((value) => typeof value === "string" && value.trim().length > 0) ?? "عضو مودة";
    return [{
      chatId: chat.document.id,
      peerUid: chat.peerUid,
      peerName: peerName.toString().trim().slice(0, 80),
      lastMessagePreview: typeof chat.data.lastMessagePreview === "string"
        ? chat.data.lastMessagePreview.slice(0, 120)
        : "",
      lastMessageAt,
      lastMessageSenderUid: senderUid,
      hasUnread: senderUid !== uid && lastMessageAt !== null && lastMessageAt > lastReadAt,
    }];
  });

  return { chats };
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
    const messageData = message.data() ?? {};
    const alreadyHidden = Array.isArray(messageData.deletedForUids) &&
      messageData.deletedForUids.includes(uid);
    if (!alreadyHidden) {
      transaction.update(messageRef, {
        deletedForUids: FieldValue.arrayUnion(uid),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(chatRef, {
        messageDeletionRevision: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, uid,
    );
    if (data.senderUid !== uid && !ownerSession) {
      throw new HttpsError("permission-denied", "يمكنك حذف رسائلك فقط.");
    }

    const legacyMediaKeys = ["storagePath", "mediaPath", "mediaUrl", "downloadUrl", "attachments", "fileUrl"];
    const hasMediaReference = (data.type !== undefined && data.type !== "text" && data.type !== "live_stream") ||
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
        transaction.update(chatRef, {
          messageDeletionRevision: FieldValue.increment(1),
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
    transaction.update(chatRef, {
      messageDeletionRevision: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
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
  const peerUid = participants.find((participant) => participant !== uid)!;
  const peerSnapshot = await db.collection("users").doc(peerUid).get();
  const currentUserData = user.data() ?? {};
  const peerData = peerSnapshot.data() ?? {};
  const currentBlocks = Array.isArray(currentUserData.blockedUids) ? currentUserData.blockedUids : [];
  const peerBlocks = Array.isArray(peerData.blockedUids) ? peerData.blockedUids : [];
  if (!peerSnapshot.exists || !isMemberAccountInGoodStanding(peerData) ||
      currentBlocks.includes(peerUid) || peerBlocks.includes(uid)) {
    throw new HttpsError("permission-denied", "لا يمكن تحديث إيصال قراءة محادثة محظورة أو غير متاحة.");
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
    super_admin: "Super Owner (مالك المنصة)",
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
      lastMessageId: messageId,
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
      lastMessageId: messageId,
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
      type: data.type ?? "text",
      liveStream: data.liveStream ?? null,
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

/**
 * Copies verified owner-review audit-chain chunks to a locked Cloud Storage
 * bucket. The worker refuses to run unless the bucket retention policy is
 * already locked for at least 24 months and public access is prevented.
 * Firestore source records are intentionally retained; this is an archive,
 * not a destructive export.
 */
export const archiveOwnerReviewAuditLogs = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", timeoutSeconds: 540 },
  async () => {
    if (ownerAuditArchiveEnabled.value().trim().toLowerCase() !== "true") {
      logger.info("Owner audit archive is disabled; no archive writes performed.");
      return;
    }
    const bucketName = ownerAuditArchiveBucketName.value().trim();
    if (!bucketName) {
      throw new Error("MAWDA_AUDIT_ARCHIVE_BUCKET_REQUIRED");
    }

    const bucket = getStorage().bucket(bucketName);
    const [bucketMetadata] = await bucket.getMetadata();
    const bucketPolicy = validateLockedAuditArchiveBucket(bucketMetadata);
    if (bucketPolicy.retentionPeriodSeconds < OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS) {
      throw new Error("AUDIT_ARCHIVE_RETENTION_BELOW_REQUIRED_MINIMUM");
    }

    const stateRef = db.collection("auditArchiveState").doc("ownerReview");
    const leaseId = randomUUID();
    const nowMs = Date.now();
    let previousSequence = 0;
    let previousHash = "GENESIS";
    let previousObjectName: string | null = null;
    let previousArchiveSha256: string | null = null;
    const acquired = await db.runTransaction(async (transaction) => {
      const stateSnapshot = await transaction.get(stateRef);
      const state = stateSnapshot.data() ?? {};
      const leaseUntil = state.leaseUntil instanceof Timestamp
        ? state.leaseUntil.toMillis()
        : 0;
      if (leaseUntil > nowMs) return false;
      previousSequence = Number.isSafeInteger(state.lastArchivedSequence)
        ? state.lastArchivedSequence as number
        : 0;
      previousHash = typeof state.lastArchivedHash === "string"
        ? state.lastArchivedHash
        : "GENESIS";
      previousObjectName = typeof state.lastObject === "string" ? state.lastObject : null;
      previousArchiveSha256 = typeof state.lastArchiveSha256 === "string"
        ? state.lastArchiveSha256
        : null;
      transaction.set(stateRef, {
        leaseId,
        leaseUntil: Timestamp.fromMillis(nowMs + 10 * 60 * 1000),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return true;
    });
    if (!acquired) {
      logger.info("Owner audit archive skipped because another worker holds the lease.");
      return;
    }

    // Firestore is not the immutable checkpoint authority. Reconcile its cursor
    // against the last create-only object in the retention-locked bucket.
    try {
      if (previousSequence === 0) {
        if (previousHash !== "GENESIS" || previousObjectName !== null ||
            previousArchiveSha256 !== null) {
          throw new Error("OWNER_AUDIT_ARCHIVE_GENESIS_CHECKPOINT_INVALID");
        }
      } else {
        if (!previousObjectName || !previousArchiveSha256) {
          throw new Error("OWNER_AUDIT_ARCHIVE_EXTERNAL_CHECKPOINT_MISSING");
        }
        const [previousObjectMetadata] = await bucket.file(previousObjectName).getMetadata();
        if (previousObjectMetadata.metadata?.archiveSha256 !== previousArchiveSha256 ||
            Number(previousObjectMetadata.metadata?.lastSequence) !== previousSequence ||
            previousObjectMetadata.metadata?.finalHash !== previousHash) {
          throw new Error("OWNER_AUDIT_ARCHIVE_EXTERNAL_CHECKPOINT_MISMATCH");
        }
      }
    } catch (error) {
      await db.runTransaction(async (transaction) => {
        const stateSnapshot = await transaction.get(stateRef);
        if (stateSnapshot.data()?.leaseId === leaseId) {
          transaction.set(stateRef, {
            leaseId: FieldValue.delete(),
            leaseUntil: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      });
      throw error;
    }

    const releaseLease = async () => {
      await db.runTransaction(async (transaction) => {
        const stateSnapshot = await transaction.get(stateRef);
        if (stateSnapshot.data()?.leaseId === leaseId) {
          transaction.set(stateRef, {
            leaseId: FieldValue.delete(),
            leaseUntil: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      });
    };

    try {
      const snapshot = await db.collection("adminAuditLogs")
        .where("auditChainId", "==", "owner-review-v1")
        .where("auditSequence", ">", previousSequence)
        .orderBy("auditSequence", "asc")
        .limit(OWNER_AUDIT_ARCHIVE_BATCH_SIZE + 1)
        .get();
      const eligible = [];
      for (const document of snapshot.docs) {
        const data = document.data();
        const createdAtMs = data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : 0;
        if (!isOwnerAuditArchiveEligible(createdAtMs, nowMs)) break;
        if (!data.auditEvent || !Number.isSafeInteger(data.auditSequence) ||
            typeof data.previousAuditHash !== "string" ||
            typeof data.auditHash !== "string") {
          throw new Error("OWNER_AUDIT_ARCHIVE_SOURCE_RECORD_INVALID");
        }
        eligible.push({
          sequence: data.auditSequence as number,
          previousHash: data.previousAuditHash,
          eventHash: data.auditHash,
          event: data.auditEvent as Record<string, unknown>,
          createdAtMs,
        });
        if (eligible.length >= OWNER_AUDIT_ARCHIVE_BATCH_SIZE) break;
      }

      if (eligible.length === 0) {
        await releaseLease();
        return;
      }

      const verification = verifyOwnerAuditArchiveChunk(
        eligible,
        previousSequence,
        previousHash,
      );
      if (!verification.valid) {
        throw new Error("OWNER_AUDIT_ARCHIVE_CHAIN_INVALID:" + verification.reason);
      }

      const redactedEntries = eligible.map((entry) => ({
        ...entry,
        event: projectOwnerAuditExportValue(entry.event),
      }));
      const firstSequence = eligible[0].sequence;
      const lastSequence = eligible[eligible.length - 1].sequence;
      const archive = serializeOwnerAuditArchive(redactedEntries, {
        firstSequence,
        lastSequence,
        previousHash,
        finalHash: verification.lastHash,
        archivedAtMs: nowMs,
      });
      const objectName = ownerAuditArchiveObjectName(
        firstSequence,
        lastSequence,
        eligible[eligible.length - 1].createdAtMs,
      );
      const file = bucket.file(objectName);
      let objectGeneration: string | number | undefined;
      try {
        await file.save(archive.payload, {
          resumable: false,
          contentType: "application/x-ndjson",
          preconditionOpts: { ifGenerationMatch: 0 },
          metadata: {
            metadata: {
              archiveSha256: archive.sha256,
              chainId: "owner-review-v1",
              firstSequence: String(firstSequence),
              lastSequence: String(lastSequence),
              finalHash: verification.lastHash,
              retentionSeconds: String(OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS),
            },
          },
        });
        const [createdMetadata] = await file.getMetadata();
        objectGeneration = createdMetadata.generation;
      } catch (error) {
        const statusCode = (error as { code?: number }).code;
        if (statusCode !== 412) throw error;
        const [existingMetadata] = await file.getMetadata();
        if (existingMetadata.metadata?.archiveSha256 !== archive.sha256) {
          throw new Error("AUDIT_ARCHIVE_OBJECT_COLLISION_OR_TAMPERING");
        }
        objectGeneration = existingMetadata.generation;
      }

      await db.runTransaction(async (transaction) => {
        const stateSnapshot = await transaction.get(stateRef);
        if (stateSnapshot.data()?.leaseId !== leaseId) {
          throw new Error("OWNER_AUDIT_ARCHIVE_LEASE_LOST");
        }
        transaction.set(stateRef, {
          lastArchivedSequence: verification.lastSequence,
          lastArchivedHash: verification.lastHash,
          lastObject: objectName,
          lastObjectGeneration: objectGeneration ?? null,
          lastArchiveSha256: archive.sha256,
          lastArchivedAt: Timestamp.fromMillis(nowMs),
          leaseId: FieldValue.delete(),
          leaseUntil: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      });

      await appendOwnerReviewAuditEvent({
        actorUid: "system-audit-archive",
        action: "owner_review_audit_archive_created",
        outcome: "success",
        firstSequence,
        lastSequence,
        finalHash: verification.lastHash,
        archiveSha256: archive.sha256,
        objectName,
        objectGeneration: objectGeneration ?? null,
        retentionPeriodSeconds: bucketPolicy.retentionPeriodSeconds,
      });
      logger.info("Owner audit archive created", {
        firstSequence,
        lastSequence,
        objectName,
        archiveSha256: archive.sha256,
      });
    } catch (error) {
      await releaseLease().catch(() => undefined);
      logger.error("Owner audit archive failed closed", { error });
      throw error;
    }
  },
);

/**
 * Archives the remaining approved audit collections to the same locked,
 * create-only bucket. Each collection has its own cursor, lease and GCS-backed
 * checkpoint so Firestore cursor tampering cannot silently skip a batch.
 */
export const archiveAdditionalAuditCollections = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", timeoutSeconds: 540 },
  async () => {
    if (ownerAuditArchiveEnabled.value().trim().toLowerCase() !== "true") return;
    const bucketName = ownerAuditArchiveBucketName.value().trim();
    if (!bucketName) throw new Error("MAWDA_AUDIT_ARCHIVE_BUCKET_REQUIRED");
    const bucket = getStorage().bucket(bucketName);
    const [bucketMetadata] = await bucket.getMetadata();
    validateLockedAuditArchiveBucket(bucketMetadata);
    const nowMs = Date.now();
    const cutoff = Timestamp.fromMillis(nowMs - OWNER_AUDIT_ARCHIVE_MIN_AGE_MS);

    for (const collectionName of ADDITIONAL_AUDIT_COLLECTIONS) {
      const stateRef = db.collection("auditArchiveState").doc("collection_" + collectionName);
      const leaseId = randomUUID();
      let lastDocId: string | null = null;
      let previousObjectName: string | null = null;
      let previousArchiveSha256: string | null = null;
      const acquired = await db.runTransaction(async (transaction) => {
        const stateSnapshot = await transaction.get(stateRef);
        const state = stateSnapshot.data() ?? {};
        const leaseUntil = state.leaseUntil instanceof Timestamp
          ? state.leaseUntil.toMillis()
          : 0;
        if (leaseUntil > nowMs) return false;
        lastDocId = typeof state.lastDocId === "string" ? state.lastDocId : null;
        previousObjectName = typeof state.lastObject === "string" ? state.lastObject : null;
        previousArchiveSha256 = typeof state.lastArchiveSha256 === "string"
          ? state.lastArchiveSha256
          : null;
        transaction.set(stateRef, {
          leaseId,
          leaseUntil: Timestamp.fromMillis(nowMs + 10 * 60 * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return true;
      });
      if (!acquired) continue;

      const releaseLease = async () => {
        await db.runTransaction(async (transaction) => {
          const stateSnapshot = await transaction.get(stateRef);
          if (stateSnapshot.data()?.leaseId === leaseId) {
            transaction.set(stateRef, {
              leaseId: FieldValue.delete(),
              leaseUntil: FieldValue.delete(),
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }
        });
      };

      try {
        let query = db.collection(collectionName)
          .where("createdAt", "<", cutoff)
          .orderBy("createdAt", "asc");
        if (lastDocId) {
          if (!previousObjectName || !previousArchiveSha256) {
            throw new Error("AUDIT_COLLECTION_EXTERNAL_CHECKPOINT_MISSING:" + collectionName);
          }
          const [previousObjectMetadata] = await bucket.file(previousObjectName).getMetadata();
          if (previousObjectMetadata.metadata?.archiveSha256 !== previousArchiveSha256 ||
              previousObjectMetadata.metadata?.collectionName !== collectionName ||
              previousObjectMetadata.metadata?.lastDocId !== lastDocId) {
            throw new Error("AUDIT_COLLECTION_EXTERNAL_CHECKPOINT_MISMATCH:" + collectionName);
          }
          const cursorSnapshot = await db.collection(collectionName).doc(lastDocId).get();
          if (!cursorSnapshot.exists) {
            throw new Error("AUDIT_COLLECTION_CURSOR_DOCUMENT_MISSING:" + collectionName);
          }
          query = query.startAfter(cursorSnapshot);
        } else if (previousObjectName !== null || previousArchiveSha256 !== null) {
          throw new Error("AUDIT_COLLECTION_GENESIS_CHECKPOINT_INVALID:" + collectionName);
        }

        const snapshot = await query.limit(OWNER_AUDIT_ARCHIVE_BATCH_SIZE).get();
        if (snapshot.empty) {
          await releaseLease();
          continue;
        }
        const entries = snapshot.docs.map((document) => {
          const data = document.data();
          if (!(data.createdAt instanceof Timestamp)) {
            throw new Error("AUDIT_COLLECTION_CREATED_AT_INVALID:" + collectionName);
          }
          return {
            docId: document.id,
            createdAtMs: data.createdAt.toMillis(),
            data: projectOwnerAuditExportValue(data),
          };
        });
        const first = entries[0];
        const last = entries[entries.length - 1];
        const archive = serializeAuditCollectionArchive(collectionName, entries, {
          firstDocId: first.docId,
          lastDocId: last.docId,
          firstCreatedAtMs: first.createdAtMs,
          lastCreatedAtMs: last.createdAtMs,
          archivedAtMs: nowMs,
        });
        const objectName = auditCollectionArchiveObjectName(
          collectionName,
          first.docId,
          last.docId,
          last.createdAtMs,
        );
        const file = bucket.file(objectName);
        let objectGeneration: string | number | undefined;
        try {
          await file.save(archive.payload, {
            resumable: false,
            contentType: "application/x-ndjson",
            preconditionOpts: { ifGenerationMatch: 0 },
            metadata: {
              metadata: {
                archiveSha256: archive.sha256,
                collectionName,
                firstDocId: first.docId,
                lastDocId: last.docId,
                lastCreatedAtMs: String(last.createdAtMs),
                retentionSeconds: String(OWNER_AUDIT_ARCHIVE_RETENTION_SECONDS),
              },
            },
          });
          const [createdMetadata] = await file.getMetadata();
          objectGeneration = createdMetadata.generation;
        } catch (error) {
          if ((error as { code?: number }).code !== 412) throw error;
          const [existingMetadata] = await file.getMetadata();
          if (existingMetadata.metadata?.archiveSha256 !== archive.sha256 ||
              existingMetadata.metadata?.collectionName !== collectionName ||
              existingMetadata.metadata?.lastDocId !== last.docId) {
            throw new Error("AUDIT_COLLECTION_ARCHIVE_OBJECT_COLLISION:" + collectionName);
          }
          objectGeneration = existingMetadata.generation;
        }

        await db.runTransaction(async (transaction) => {
          const stateSnapshot = await transaction.get(stateRef);
          if (stateSnapshot.data()?.leaseId !== leaseId) {
            throw new Error("AUDIT_COLLECTION_ARCHIVE_LEASE_LOST:" + collectionName);
          }
          transaction.set(stateRef, {
            lastDocId: last.docId,
            lastCreatedAtMs: last.createdAtMs,
            lastObject: objectName,
            lastObjectGeneration: objectGeneration ?? null,
            lastArchiveSha256: archive.sha256,
            lastArchivedAt: Timestamp.fromMillis(nowMs),
            leaseId: FieldValue.delete(),
            leaseUntil: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        });
        logger.info("Audit collection archive created", {
          collectionName,
          firstDocId: first.docId,
          lastDocId: last.docId,
          objectName,
          archiveSha256: archive.sha256,
        });
      } catch (error) {
        await releaseLease().catch(() => undefined);
        logger.error("Audit collection archive failed closed", { collectionName, error });
        throw error;
      }
    }
  },
);

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
/**
 * Creates a scheduled room event. Only the room owner or platform owner may publish.
 */
export const createRoomEvent = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  let input: ReturnType<typeof normalizeRoomEventInput>;
  try {
    input = normalizeRoomEventInput(request.data ?? {});
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "بيانات الحدث غير صالحة.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const userRef = db.collection("users").doc(uid);
  const eventRef = db.collection("roomEvents").doc();
  const ownerSession = hasPlatformOwnerSession(
    (request.auth?.token ?? {}) as Record<string, unknown>,
    undefined,
    uid,
  );
  await db.runTransaction(async (transaction) => {
    const [roomSnapshot, userSnapshot, membershipSnapshot] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(userRef),
      transaction.get(roomRef.collection("members").doc(uid)),
    ]);
    if (!roomSnapshot.exists || roomSnapshot.data()?.status !== "active") {
      throw new HttpsError("not-found", "الغرفة غير موجودة أو غير نشطة.");
    }
    const room = roomSnapshot.data()!;
    if (room.ownerUid !== uid && !ownerSession) {
      throw new HttpsError("permission-denied", "إنشاء أحداث الغرفة متاح لمالكها فقط.");
    }
    if (!userSnapshot.exists || !isMemberAccountInGoodStanding(userSnapshot.data()) ||
        (!membershipSnapshot.exists && !ownerSession)) {
      throw new HttpsError("permission-denied", "لا تملك عضوية صالحة لإدارة أحداث الغرفة.");
    }
    if (!canJoinRoom({
      memberAge: userSnapshot.data()?.age,
      roomAudience: room.audience,
      roomKind: room.kind,
      invited: true,
    })) {
      throw new HttpsError("permission-denied", "فئة العمر لا تطابق جمهور الغرفة.");
    }
    const eventCapacity = input.capacity ?? room.capacity;
    if (!Number.isSafeInteger(eventCapacity) || eventCapacity < 1 ||
        !Number.isSafeInteger(room.capacity) || eventCapacity > room.capacity) {
      throw new HttpsError("invalid-argument", "سعة الحدث يجب أن تكون بين مقعد واحد وسعة الغرفة.");
    }
    const startsAt = Timestamp.fromMillis(input.startsAtMs);
    const endsAt = Timestamp.fromMillis(input.startsAtMs + input.durationMinutes * 60 * 1000);
    transaction.create(eventRef, {
      eventId: eventRef.id,
      roomId,
      title: input.title,
      description: input.description,
      eventType: input.eventType,
      streamUrl: input.streamUrl,
      startsAt,
      endsAt,
      durationMinutes: input.durationMinutes,
      status: "scheduled",
      capacity: eventCapacity,
      attendeeCount: 0,
      createdByUid: uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { eventId: eventRef.id, roomId, status: "scheduled" };
});

/** Lists events only to age-eligible room members. */
export const listRoomEvents = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const userRef = db.collection("users").doc(uid);
  const [roomSnapshot, userSnapshot, membershipSnapshot] = await Promise.all([
    roomRef.get(),
    userRef.get(),
    roomRef.collection("members").doc(uid).get(),
  ]);
  if (!roomSnapshot.exists || roomSnapshot.data()?.status !== "active" ||
      !userSnapshot.exists || !isMemberAccountInGoodStanding(userSnapshot.data())) {
    throw new HttpsError("permission-denied", "لا يمكن عرض أحداث هذه الغرفة.");
  }
  const room = roomSnapshot.data()!;
  const ownerSession = hasPlatformOwnerSession(
    (request.auth?.token ?? {}) as Record<string, unknown>,
    undefined,
    uid,
  );
  if (!membershipSnapshot.exists && room.ownerUid !== uid && !ownerSession) {
    throw new HttpsError("permission-denied", "انضم إلى الغرفة قبل عرض أحداثها.");
  }
  if (!canJoinRoom({
    memberAge: userSnapshot.data()?.age,
    roomAudience: room.audience,
    roomKind: room.kind,
    invited: true,
  })) {
    throw new HttpsError("permission-denied", "فئة العمر لا تطابق جمهور الغرفة.");
  }
  const snapshot = await db.collection("roomEvents")
    .where("roomId", "==", roomId)
    .orderBy("startsAt", "desc")
    .limit(50)
    .get();
  const events = await Promise.all(snapshot.docs.map(async (document) => {
    const event = document.data();
    const attendee = await document.ref.collection("attendees").doc(uid).get();
    const startsAt = event.startsAt instanceof Timestamp ? event.startsAt.toMillis() : 0;
    const endsAt = event.endsAt instanceof Timestamp ? event.endsAt.toMillis() : 0;
    return {
      eventId: document.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      streamUrl: event.streamUrl ?? null,
      startsAtMs: startsAt,
      endsAtMs: endsAt,
      durationMinutes: event.durationMinutes,
      status: event.status,
      attendeeCount: event.attendeeCount ?? 0,
      capacity: event.capacity ?? room.capacity,
      isFull: (event.attendeeCount ?? 0) >= (event.capacity ?? room.capacity),
      isAttending: attendee.exists,
      canManage: room.ownerUid === uid || ownerSession,
    };
  }));
  return { events };
});

/** Records one RSVP per member and enforces the room's age audience. */
export const rsvpRoomEvent = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const eventId = request.data?.eventId;
  if (typeof eventId !== "string" || eventId.length < 1 || eventId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الحدث غير صالح.");
  }
  const eventRef = db.collection("roomEvents").doc(eventId);
  await db.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    if (!eventSnapshot.exists) throw new HttpsError("not-found", "الحدث غير موجود.");
    const event = eventSnapshot.data()!;
    const roomRef = db.collection("rooms").doc(event.roomId);
    const userRef = db.collection("users").doc(uid);
    const membershipRef = roomRef.collection("members").doc(uid);
    const attendeeRef = eventRef.collection("attendees").doc(uid);
    const [roomSnapshot, userSnapshot, membershipSnapshot, attendeeSnapshot] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(userRef),
      transaction.get(membershipRef),
      transaction.get(attendeeRef),
    ]);
    if (event.status !== "scheduled" && event.status !== "live") {
      throw new HttpsError("failed-precondition", "لم يعد التسجيل متاحاً لهذا الحدث.");
    }
    if (!roomSnapshot.exists || roomSnapshot.data()?.status !== "active" ||
        !userSnapshot.exists || !isMemberAccountInGoodStanding(userSnapshot.data()) ||
        !membershipSnapshot.exists) {
      throw new HttpsError("permission-denied", "يجب أن تكون عضواً نشطاً في الغرفة.");
    }
    const room = roomSnapshot.data()!;
    if (!canJoinRoom({
      memberAge: userSnapshot.data()?.age,
      roomAudience: room.audience,
      roomKind: room.kind,
      invited: true,
    })) {
      throw new HttpsError("permission-denied", "فئة العمر لا تطابق جمهور الغرفة.");
    }
    // Replayed RSVPs remain idempotent even when the event has since filled.
    if (attendeeSnapshot.exists) return;
    const eventCapacity = event.capacity ?? room.capacity;
    const attendeeCount = event.attendeeCount ?? 0;
    if (!Number.isSafeInteger(eventCapacity) || eventCapacity < 1 ||
        !Number.isSafeInteger(attendeeCount) || attendeeCount < 0) {
      throw new HttpsError("failed-precondition", "بيانات سعة الحدث غير صالحة؛ تم إيقاف التسجيل احترازياً.");
    }
    if (attendeeCount >= eventCapacity) {
      throw new HttpsError("resource-exhausted", "اكتمل عدد المقاعد المتاحة لهذا الحدث.");
    }
    transaction.create(attendeeRef, {
      uid,
      rsvpedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(eventRef, {
      attendeeCount: attendeeCount + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { eventId, attending: true };
});

/** Allows a member to release their event seat before the event starts. */
export const cancelRoomEventRsvp = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const eventId = request.data?.eventId;
  if (typeof eventId !== "string" || eventId.length < 1 || eventId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الحدث غير صالح.");
  }
  const eventRef = db.collection("roomEvents").doc(eventId);
  return db.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    if (!eventSnapshot.exists) throw new HttpsError("not-found", "الحدث غير موجود.");
    const event = eventSnapshot.data()!;
    if (event.status !== "scheduled") {
      throw new HttpsError("failed-precondition", "يمكن إلغاء التسجيل قبل بدء الحدث فقط.");
    }
    const roomRef = db.collection("rooms").doc(event.roomId);
    const userRef = db.collection("users").doc(uid);
    const attendeeRef = eventRef.collection("attendees").doc(uid);
    const [roomSnapshot, userSnapshot, membershipSnapshot, attendeeSnapshot] = await Promise.all([
      transaction.get(roomRef),
      transaction.get(userRef),
      transaction.get(roomRef.collection("members").doc(uid)),
      transaction.get(attendeeRef),
    ]);
    if (!roomSnapshot.exists || roomSnapshot.data()?.status !== "active" ||
        !userSnapshot.exists || !isMemberAccountInGoodStanding(userSnapshot.data()) ||
        !membershipSnapshot.exists) {
      throw new HttpsError("permission-denied", "يجب أن تكون عضواً نشطاً في الغرفة.");
    }
    const room = roomSnapshot.data()!;
    if (!canJoinRoom({
      memberAge: userSnapshot.data()?.age,
      roomAudience: room.audience,
      roomKind: room.kind,
      invited: true,
    })) {
      throw new HttpsError("permission-denied", "فئة العمر لا تطابق جمهور الغرفة.");
    }
    if (!attendeeSnapshot.exists) return { eventId, attending: false, idempotentReplay: true };
    const attendeeCount = event.attendeeCount ?? 0;
    if (!Number.isSafeInteger(attendeeCount) || attendeeCount < 1) {
      throw new HttpsError("failed-precondition", "عداد المقاعد غير متسق؛ تم إيقاف الإلغاء احترازياً.");
    }
    transaction.delete(attendeeRef);
    transaction.update(eventRef, {
      attendeeCount: attendeeCount - 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { eventId, attending: false, idempotentReplay: false };
  });
});

/** Owner-controlled event transitions: scheduled -> live/cancelled -> completed. */
export const setRoomEventStatus = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const eventId = request.data?.eventId;
  const nextStatus = request.data?.status;
  if (typeof eventId !== "string" || eventId.length < 1 || eventId.length > 128 ||
      !["live", "completed", "cancelled"].includes(String(nextStatus))) {
    throw new HttpsError("invalid-argument", "معرف الحدث أو الحالة غير صالح.");
  }
  const eventRef = db.collection("roomEvents").doc(eventId);
  await db.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    if (!eventSnapshot.exists) throw new HttpsError("not-found", "الحدث غير موجود.");
    const event = eventSnapshot.data()!;
    const roomRef = db.collection("rooms").doc(event.roomId);
    const roomSnapshot = await transaction.get(roomRef);
    const ownerSession = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>,
      undefined,
      uid,
    );
    if (!roomSnapshot.exists ||
        (roomSnapshot.data()?.ownerUid !== uid && !ownerSession)) {
      throw new HttpsError("permission-denied", "إدارة الحدث متاحة لمالك الغرفة فقط.");
    }
    let actualNext: ReturnType<typeof nextRoomEventStatus>;
    try {
      actualNext = nextRoomEventStatus(event.status, nextStatus);
    } catch {
      throw new HttpsError("failed-precondition", "حالة الحدث تغيرت؛ حدّث القائمة ثم حاول مجدداً.");
    }
    const now = Date.now();
    const startsAtMs = event.startsAt instanceof Timestamp ? event.startsAt.toMillis() : 0;
    const endsAtMs = event.endsAt instanceof Timestamp ? event.endsAt.toMillis() : 0;
    if (actualNext === "live" && now < startsAtMs - 15 * 60 * 1000) {
      throw new HttpsError("failed-precondition", "يمكن بدء الحدث قبل موعده بربع ساعة فقط.");
    }
    if (actualNext === "live" && now > endsAtMs) {
      throw new HttpsError("failed-precondition", "انتهى وقت الحدث المجدول.");
    }
    transaction.update(eventRef, {
      status: actualNext,
      startedAt: actualNext === "live" ? FieldValue.serverTimestamp() : event.startedAt ?? null,
      endedAt: actualNext === "completed" || actualNext === "cancelled"
        ? FieldValue.serverTimestamp()
        : event.endedAt ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { eventId, status: nextStatus };
});

export const sendRoomMessage = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const provider = request.auth?.token?.firebase &&
    typeof request.auth.token.firebase === "object"
    ? (request.auth.token.firebase as Record<string, unknown>).sign_in_provider : null;
  const isGuest = provider === "anonymous";
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
  const guestProfileRef = db.collection("guestProfiles").doc(uid);
  const guestSessionRef = db.collection("guestSessions").doc(uid);
  const messageId = createHash("sha256").update(uid + ":" + clientMessageId).digest("hex");
  const messageRef = roomRef.collection("messages").doc(messageId);
  const result = await db.runTransaction(async (transaction) => {
    const [room, membership, moderator, member, existing, guestProfile, guestSession] = await Promise.all([
      transaction.get(roomRef), transaction.get(membershipRef),
      transaction.get(moderatorRef), transaction.get(userRef), transaction.get(messageRef),
      transaction.get(guestProfileRef), transaction.get(guestSessionRef),
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
    const roomData = room.data() ?? {};
    if (isGuest) {
      if (!guestProfile.exists || !isGuestSessionActive(guestSession.data()) ||
          !canJoinGuestRoom({ roomAudience: roomData.audience, roomKind: roomData.kind, roomStatus: roomData.status, guestAudienceApproved: roomData.guestAudienceApproved }) ||
          membership.data()?.accountType !== "guest") {
        throw new HttpsError("permission-denied", "لا تملك جلسة زائر نشطة ومصرحاً لها بهذه الغرفة.");
      }
    } else if (!member.exists || !isMemberAccountInGoodStanding(member.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بإرسال الرسائل حالياً.");
    }
    const isRoomOwner = !isGuest && roomData.ownerUid === uid;
    const isAuthorizedModerator = !isGuest && moderator.exists;
    const ownerSession = !isGuest && hasPlatformOwnerSession((request.auth?.token ?? {}) as Record<string, unknown>, undefined, uid);
    const isBiometricallyVerified = !isGuest && hasActiveBiometricVerification(member.data()?.biometricVerification, uid);
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
      throw new HttpsError("invalid-argument", "الرابط غير مسموح أو أن صياغته غير آمنة في هذه الغرفة.");
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
      senderDisplayName: isGuest ? (guestProfile.data()?.username ?? "زائر") :
        (member.data()?.displayName ?? ""),
      senderAccountType: isGuest ? "guest" : "member",
      content,
      type: "text",
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { messageId, idempotentReplay: false };
  });
  if (!result.idempotentReplay && !isGuest) {
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
  let pageRequest: ReturnType<typeof validateMemberMessagePageRequest>;
  try {
    pageRequest = validateMemberMessagePageRequest(request.data ?? {});
  } catch {
    throw new HttpsError("invalid-argument", "مؤشر صفحة رسائل الغرفة غير صالح.");
  }
  const provider = request.auth?.token?.firebase &&
    typeof request.auth.token.firebase === "object"
    ? (request.auth.token.firebase as Record<string, unknown>).sign_in_provider : null;
  const isGuest = provider === "anonymous";
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const [room, membership, member] = await Promise.all([
    roomRef.get(),
    roomRef.collection("members").doc(uid).get(),
    isGuest ? Promise.resolve(null) : db.collection("users").doc(uid).get(),
  ]);
  if (!room.exists || !membership.exists || room.data()?.status !== "active") {
    throw new HttpsError("permission-denied", "لا تملك صلاحية قراءة رسائل هذه الغرفة.");
  }
  if (!isGuest && (!member?.exists || !isMemberAccountInGoodStanding(member.data()))) {
    throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بقراءة رسائل هذه الغرفة.");
  }
  if (isGuest) {
    const [profile, session] = await Promise.all([
      db.collection("guestProfiles").doc(uid).get(),
      db.collection("guestSessions").doc(uid).get(),
    ]);
    if (!profile.exists || !isGuestSessionActive(session.data()) ||
        !canJoinGuestRoom({ roomAudience: room.data()?.audience, roomKind: room.data()?.kind, roomStatus: room.data()?.status, guestAudienceApproved: room.data()?.guestAudienceApproved }) ||
        membership.data()?.accountType !== "guest") {
      throw new HttpsError("permission-denied", "انتهت صلاحية جلسة الزائر أو لا تسمح سياسة الغرفة بالوصول.");
    }
  }
  let messagesQuery = roomRef.collection("messages")
    .orderBy("createdAt", pageRequest.direction === "after" ? "asc" : "desc")
    .orderBy(FieldPath.documentId(), pageRequest.direction === "after" ? "asc" : "desc");
  if (pageRequest.cursor) {
    messagesQuery = messagesQuery.startAfter(
      Timestamp.fromMillis(pageRequest.cursor.createdAtMillis),
      pageRequest.cursor.messageId,
    );
  }
  const messages = await messagesQuery.limit(pageRequest.limit + 1).get();
  const hasMore = messages.docs.length > pageRequest.limit;
  const pageDocs = messages.docs.slice(0, pageRequest.limit);
  const boundaryDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;
  const nextPageToken = hasMore && boundaryDoc
    ? encodeMemberMessagePageToken(boundaryDoc.data().createdAt.toMillis(), boundaryDoc.id)
    : null;
  const orderedMessageDocs = pageRequest.direction === "after"
    ? pageDocs
    : [...pageDocs].reverse();
  return {
    pageDirection: pageRequest.direction,
    hasMore,
    nextPageToken,
    messages: orderedMessageDocs.map((doc) => {
      const data = doc.data();
      return {
        messageId: doc.id,
        senderUid: data.senderUid ?? "",
        senderDisplayName: data.senderDisplayName ?? null,
        senderAccountType: data.senderAccountType ?? "member",
        content: data.isDeleted === true ? "تم حذف هذه الرسالة" : (data.content ?? ""),
        type: data.type ?? "text",
        liveStream: isGuest ? null : (data.liveStream ?? null),
        isPlatformOwnerMessage: !isGuest && data.isPlatformOwnerMessage === true,
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
    }).filter((message) => !message.deletedForRequester && !message.deletionPending &&
      (!isGuest || message.type === "text" || message.type === "audio" ||
        (message.type === "attachment" && message.mediaCategory === "audio"))),
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, uid,
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

    const hasMediaReference = (data.type !== undefined && data.type !== "text" && data.type !== "live_stream") ||
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
    if (room.data()?.status !== "active") {
      throw new HttpsError("failed-precondition", "لا يمكن إرسال دعوات إلى غرفة غير نشطة.");
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
  const provider = request.auth?.token?.firebase &&
    typeof request.auth.token.firebase === "object"
    ? (request.auth.token.firebase as Record<string, unknown>).sign_in_provider : null;
  const isGuest = provider === "anonymous";
  const roomId = request.data?.roomId;
  if (typeof roomId !== "string" || roomId.length < 1 || roomId.length > 128) {
    throw new HttpsError("invalid-argument", "معرف الغرفة غير صالح.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const userRef = db.collection("users").doc(uid);
  const membershipRef = roomRef.collection("members").doc(uid);
  const guestProfileRef = db.collection("guestProfiles").doc(uid);
  const guestSessionRef = db.collection("guestSessions").doc(uid);
  await db.runTransaction(async (transaction) => {
    const [room, user, membership, guestProfile, guestSession] = await Promise.all([
      transaction.get(roomRef), transaction.get(userRef), transaction.get(membershipRef),
      transaction.get(guestProfileRef), transaction.get(guestSessionRef),
    ]);
    if (!room.exists || room.data()?.status !== "active") {
      throw new HttpsError("not-found", "الغرفة غير موجودة أو غير نشطة.");
    }
    const data = room.data()!;
    if (isGuest) {
      if (!guestProfile.exists || !isGuestSessionActive(guestSession.data())) {
        throw new HttpsError("permission-denied", "جلسة الزائر غير مكتملة أو انتهت صلاحيتها.");
      }
      if (!canJoinGuestRoom({ roomAudience: data.audience, roomKind: data.kind, roomStatus: data.status, guestAudienceApproved: data.guestAudienceApproved })) {
        throw new HttpsError("permission-denied", "يمكن للزائر دخول الغرف العامة المصنفة لجميع الأعمار فقط.");
      }
    } else {
      if (!user.exists || user.data()?.profileCompleted !== true) {
        throw new HttpsError("failed-precondition", "يجب إكمال العضوية قبل دخول الغرف.");
      }
      if (!isMemberAccountInGoodStanding(user.data())) {
        throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بدخول الغرف حالياً.");
      }
      const invited = Array.isArray(data.invitedUids) && data.invitedUids.includes(uid);
      if (!canJoinRoom({
        memberAge: user.data()?.age,
        roomAudience: data.audience,
        roomKind: data.kind,
        invited,
      })) {
        throw new HttpsError("permission-denied", "لا تملك صلاحية دخول هذه الغرفة أو فئتها العمرية غير مناسبة.");
      }
    }
    if (membership.exists) return;
    if (!Number.isSafeInteger(data.memberCount) || data.memberCount >= data.capacity) {
      throw new HttpsError("resource-exhausted", "اكتمل العدد المسموح به في الغرفة.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.create(membershipRef, {
      uid, role: isGuest ? "guest" : "member",
      accountType: isGuest ? "guest" : "member",
      joinedAt: now,
    });
    const roomUpdate: Record<string, unknown> = {
      memberCount: data.memberCount + 1,
      updatedAt: now,
    };
    if (!isGuest && Array.isArray(data.invitedUids) && data.invitedUids.includes(uid)) {
      roomUpdate.invitedUids = FieldValue.arrayRemove(uid);
    }
    transaction.update(roomRef, roomUpdate);
  });
  return { roomId, joined: true, guest: isGuest };
});

/** Room owner or MFA-backed platform owner explicitly classifies a public room for all-age guest access. */
export const setRoomAudience = onCall(async (request) => {
  const actorUid = requireAuthenticatedUid(request.auth?.uid);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";
  const audience = request.data?.audience;
  const confirmGeneralAudienceModeration = request.data?.confirmGeneralAudienceModeration === true;
  if (!roomId || roomId.length > 128 ||
      !["adult", "minor", "all_ages"].includes(String(audience))) {
    throw new HttpsError("invalid-argument", "معرف الغرفة أو تصنيف الجمهور غير صالح.");
  }
  if (audience === "all_ages" && !confirmGeneralAudienceModeration) {
    throw new HttpsError("failed-precondition", "يجب تأكيد الالتزام بإدارة الغرفة بما يناسب الجمهور العام قبل إتاحتها للزوار.");
  }
  const roomRef = db.collection("rooms").doc(roomId);
  const actorRef = db.collection("users").doc(actorUid);
  await db.runTransaction(async (transaction) => {
    const [roomSnapshot, actorSnapshot] = await Promise.all([
      transaction.get(roomRef), transaction.get(actorRef),
    ]);
    if (!roomSnapshot.exists || roomSnapshot.data()?.status !== "active") {
      throw new HttpsError("not-found", "الغرفة غير موجودة أو غير نشطة.");
    }
    const room = roomSnapshot.data()!;
    const ownerSession = hasPlatformOwnerSession(
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
    );
    if (room.ownerUid !== actorUid && !ownerSession) {
      throw new HttpsError("permission-denied", "تغيير تصنيف جمهور الغرفة متاح لمالكها أو مالك المنصة بعد MFA.");
    }
    if (!ownerSession && (!actorSnapshot.exists ||
        !isMemberAccountInGoodStanding(actorSnapshot.data()) ||
        !Number.isSafeInteger(actorSnapshot.data()?.age) || actorSnapshot.data()!.age < 18)) {
      throw new HttpsError("permission-denied", "اعتماد غرفة للجمهور العام يتطلب مالك غرفة بالغاً وعضوية فعالة.");
    }
    if (audience === "all_ages" && room.kind !== "public") {
      throw new HttpsError("failed-precondition", "لا يمكن إتاحة غرفة خاصة للزوار.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.update(roomRef, {
      audience,
      guestAudienceApproved: audience === "all_ages",
      guestAudiencePolicyVersion: audience === "all_ages" ? "2026-11-14" : FieldValue.delete(),
      guestAudienceApprovedBy: audience === "all_ages" ? actorUid : FieldValue.delete(),
      guestAudienceApprovedAt: audience === "all_ages" ? now : FieldValue.delete(),
      updatedAt: now,
    });
    const auditRef = db.collection("roomAuditLogs").doc();
    transaction.create(auditRef, {
      roomId, actorUid, action: "room_audience_updated",
      previousAudience: room.audience ?? null, audience,
      guestAudienceApproved: audience === "all_ages",
      createdAt: now,
    });
  });
  return { roomId, audience, guestAudienceApproved: audience === "all_ages" };
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
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
      (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
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
    (request.auth?.token ?? {}) as Record<string, unknown>, undefined, actorUid,
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
    (request.auth?.token ?? {}) as Record<string, unknown>, undefined, uid,
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
export const giftStoreItem = onCall(async (request) => {
  const senderUid = requireAuthenticatedUid(request.auth?.uid);
  const rawRecipientUid = request.data?.recipientUid;
  const recipientUsername = request.data?.recipientUsername;
  const itemId = request.data?.itemId;
  const requestId = request.data?.requestId;
  const expectedPriceCoins = request.data?.expectedPriceCoins;
  const expectedCatalogVersion = request.data?.expectedCatalogVersion;
  let recipientUid = typeof rawRecipientUid === "string" ? rawRecipientUid : null;
  let usernameRef: FirebaseFirestore.DocumentReference | null = null;
  if (typeof recipientUsername === "string") {
    const normalizedUsername = recipientUsername.trim();
    if (normalizedUsername.length < 1 || normalizedUsername.length > 64 ||
        normalizedUsername.includes("/") || /\s/.test(normalizedUsername)) {
      throw new HttpsError("invalid-argument", "اسم المستلم غير صالح.");
    }
    usernameRef = db.collection("usernameRegistry").doc(normalizedUsername);
    const usernameSnapshot = await usernameRef.get();
    const registeredUid = usernameSnapshot.data()?.uid;
    if (!usernameSnapshot.exists || typeof registeredUid !== "string") {
      throw new HttpsError("not-found", "اسم المستخدم غير موجود.");
    }
    if (recipientUid !== null && recipientUid !== registeredUid) {
      throw new HttpsError("invalid-argument", "معرف المستلم لا يطابق اسم المستخدم.");
    }
    recipientUid = registeredUid;
  }
  if (typeof recipientUid !== "string" || recipientUid.trim() !== recipientUid ||
      recipientUid.length < 1 || recipientUid.length > 128 || recipientUid.includes("/") ||
      recipientUid === senderUid || (usernameRef === null && typeof rawRecipientUid !== "string") ||
      typeof itemId !== "string" || !/^[A-Za-z0-9_-]{3,64}$/.test(itemId) ||
      typeof requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(requestId) ||
      !Number.isSafeInteger(expectedPriceCoins) || expectedPriceCoins < 1 ||
      !Number.isSafeInteger(expectedCatalogVersion) || expectedCatalogVersion < 1) {
    throw new HttpsError("invalid-argument", "بيانات إهداء العنصر غير صالحة.");
  }
  const senderRef = db.collection("users").doc(senderUid);
  const recipientRef = db.collection("users").doc(recipientUid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const catalogVersionRef = db.collection("storeCatalogVersions").doc(itemId)
    .collection("versions").doc(String(expectedCatalogVersion));
  const giftId = createHash("sha256").update(
    `mawdda-store-gift-v1:${senderUid}:${requestId}`,
  ).digest("hex");
  const giftRef = db.collection("storeGifts").doc(giftId);
  const ledgerRef = senderRef.collection("walletLedger").doc(`store_gift_${giftId}`);
  const entitlementRef = recipientRef.collection("entitlements").doc(itemId);
  const auditRef = db.collection("adminAuditLogs").doc(`store_gift_${giftId}`);
  return db.runTransaction(async (transaction) => {
    const [sender, recipient, itemSnapshot, catalogVersionSnapshot, priorGift, priorEntitlement, priorLedger, priorAudit, usernameSnapshot] = await Promise.all([
      transaction.get(senderRef), transaction.get(recipientRef),
      transaction.get(itemRef), transaction.get(catalogVersionRef), transaction.get(giftRef), transaction.get(entitlementRef),
      transaction.get(ledgerRef), transaction.get(auditRef),
      usernameRef ? transaction.get(usernameRef) : Promise.resolve(null),
    ]);
    const catalogTerms = catalogVersionSnapshot.data() ?? {};
    const catalogVersionValid = catalogVersionSnapshot.exists &&
      catalogTerms.itemId === itemId &&
      catalogTerms.version === expectedCatalogVersion &&
      Number.isSafeInteger(catalogTerms.priceCoins) && catalogTerms.priceCoins > 0 &&
      catalogTerms.active === true && catalogTerms.purchaseEnabled === true &&
      catalogTerms.fulfillmentReady === true;
    if (!catalogVersionValid) {
      throw new HttpsError("failed-precondition", "نسخة الكتالوج المطلوبة غير موجودة أو غير صالحة؛ أوقفنا الإهداء.");
    }
    if (usernameRef && (!usernameSnapshot?.exists || usernameSnapshot.data()?.uid !== recipientUid)) {
      throw new HttpsError("aborted", "تغير سجل اسم المستخدم؛ أعد المحاولة.");
    }
    if (priorGift.exists) {
      const prior = priorGift.data() ?? {};
      const ledger = priorLedger.data() ?? {};
      const audit = priorAudit.data() ?? {};
      if (!isStoreGiftReplayCompatible(prior, {
        senderUid, recipientUid, itemId, expectedPriceCoins, expectedCatalogVersion,
      }) || prior.catalogVersionPath !== catalogVersionRef.path ||
          prior.itemName !== catalogTerms.name || prior.category !== catalogTerms.category ||
          prior.priceCoins !== catalogTerms.priceCoins ||
          (prior.durationDays ?? null) !== (catalogTerms.durationDays ?? null)) {
        throw new HttpsError("already-exists", "معرف طلب الإهداء مستخدم لعملية أو مستلم أو سعر مختلف.");
      }
      if (!priorLedger.exists || !priorAudit.exists ||
          ledger.type !== "store_gift_purchase" || ledger.giftId !== giftId ||
          ledger.itemId !== itemId || ledger.priceCoins !== prior.priceCoins ||
          ledger.amount !== -prior.priceCoins || ledger.recipientUid !== recipientUid ||
          ledger.catalogVersion !== expectedCatalogVersion ||
          ledger.catalogVersionPath !== catalogVersionRef.path ||
          !Number.isSafeInteger(ledger.balanceBefore) ||
          !Number.isSafeInteger(ledger.balanceAfter) ||
          ledger.balanceBefore - prior.priceCoins !== ledger.balanceAfter ||
          ledger.balanceAfter !== prior.newBalance ||
          audit.action !== "store_item_gifted" || audit.giftId !== giftId ||
          audit.itemId !== itemId || audit.priceCoins !== prior.priceCoins ||
          audit.catalogVersion !== expectedCatalogVersion ||
          audit.actorUid !== senderUid || audit.targetUid !== recipientUid) {
        throw new HttpsError("data-loss", "إيصال الإهداء لا يطابق قيد المحفظة وسجل التدقيق.");
      }
      return {
        giftId, itemId, recipientUid, priceCoins: prior.priceCoins,
        newBalance: prior.newBalance,
        expiresAt: prior.expiresAt instanceof Timestamp ? prior.expiresAt.toMillis() : null,
        idempotentReplay: true,
      };
    }
    if (!sender.exists || sender.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(sender.data())) {
      throw new HttpsError("permission-denied", "حالة حساب المرسل لا تسمح بالإهداء.");
    }
    if (!recipient.exists || !isEligibleStoreGiftMemberRecord(recipient.data())) {
      throw new HttpsError("failed-precondition", "المستلم غير مؤهل لاستلام هدية من المتجر.");
    }
    if (!itemSnapshot.exists) throw new HttpsError("not-found", "عنصر المتجر غير موجود.");
    const item = projectStoreCatalogItem(itemId, itemSnapshot.data() ?? {});
    if (!item || !isStoreItemPurchasable(item)) {
      throw new HttpsError("failed-precondition", "هذا العنصر غير منشور أو أن استحقاقه غير جاهز للإهداء.");
    }
    if (item.version !== expectedCatalogVersion ||
        catalogTerms.name !== item.name || catalogTerms.category !== item.category ||
        catalogTerms.priceCoins !== item.priceCoins ||
        (catalogTerms.durationDays ?? null) !== (item.durationDays ?? null) ||
        !isStorePurchasePriceCurrent(expectedPriceCoins, item.priceCoins)) {
      throw new HttpsError("failed-precondition", "تغير سعر العنصر أو إصداره؛ حدّث المتجر قبل الإهداء.");
    }
    const prior = priorEntitlement.data() ?? {};
    if (prior.status === "active" &&
        (prior.expiresAt === null || prior.expiresAt === undefined)) {
      throw new HttpsError("already-exists", "يمتلك المستلم هذا الاستحقاق الدائم بالفعل.");
    }
    const nowMs = Date.now();
    let expiresAtMs: number | null;
    try {
      let durationBase: Record<string, unknown> = prior;
      if (item.category === "boost") {
        const readExpiry = (value: unknown): number => {
          if (value === null || value === undefined) return 0;
          let result: unknown;
          if (value instanceof Timestamp) result = value.toMillis();
          else if (value !== null && typeof value === "object" &&
              typeof (value as { toMillis?: unknown }).toMillis === "function") {
            try { result = (value as { toMillis: () => number }).toMillis(); }
            catch { throw new Error("INVALID_BOOST_EXPIRY"); }
          } else {
            throw new Error("INVALID_BOOST_EXPIRY");
          }
          if (typeof result !== "number" || !Number.isSafeInteger(result) || result < 0) {
            throw new Error("INVALID_BOOST_EXPIRY");
          }
          return result;
        };
        const baseExpiry = Math.max(
          prior.status === "active" ? readExpiry(prior.expiresAt) : 0,
          readExpiry(recipient.data()?.discoveryBoostExpiresAt),
        );
        durationBase = baseExpiry > 0 ? { status: "active", expiresAt: baseExpiry } : {};
      }
      expiresAtMs = calculateStoreGiftExpiryMs(durationBase, item.durationDays, nowMs);
    } catch {
      throw new HttpsError("failed-precondition", "سجل استحقاق المستلم غير صالح؛ أوقفنا الإهداء.");
    }
    const expiresAt = expiresAtMs === null ? null : Timestamp.fromMillis(expiresAtMs);
    const senderBalance = readSafeInteger(sender.data()?.coins ?? 0, "coins");
    const newBalance = calculateStorePurchaseBalance(senderBalance, item.priceCoins);
    if (newBalance === null) throw new HttpsError("failed-precondition", "رصيد المرسل غير كافٍ أو غير صالح.");
    const now = FieldValue.serverTimestamp();
    transaction.update(senderRef, { coins: newBalance, walletUpdatedAt: now });
    transaction.create(giftRef, {
      giftId, senderUid, recipientUid, itemId, itemName: item.name,
      category: item.category, priceCoins: item.priceCoins,
      durationDays: item.durationDays ?? null, catalogVersion: item.version,
      catalogVersionPath: `storeCatalogVersions/${itemId}/versions/${item.version}`,
      balanceBefore: senderBalance, newBalance, expiresAt, status: "completed", createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "store_gift_purchase", direction: "debit", amount: -item.priceCoins,
      giftId, recipientUid, itemId, itemName: item.name,
      priceCoins: item.priceCoins, durationDays: item.durationDays ?? null,
      catalogVersion: item.version,
      catalogVersionPath: `storeCatalogVersions/${itemId}/versions/${item.version}`,
      balanceBefore: senderBalance, balanceAfter: newBalance, createdAt: now,
    });
    transaction.set(entitlementRef, {
      itemId, itemName: item.name, category: item.category, status: "active",
      giftId, giftedByUid: senderUid, catalogVersion: item.version,
      catalogVersionPath: `storeCatalogVersions/${itemId}/versions/${item.version}`,
      purchasedAt: now, expiresAt,
    });
    const recipientUpdate: Record<string, unknown> = {};
    if (item.category === "boost" && expiresAt) {
      recipientUpdate.discoveryBoostExpiresAt = expiresAt;
      recipientUpdate.discoveryBoostGiftId = giftId;
    }
    if (item.itemId === "profile_pin_30d" &&
        typeof recipient.data()?.pinnedProfileSection !== "string") {
      recipientUpdate.pinnedProfileSection = "interests";
    }
    if (Object.keys(recipientUpdate).length > 0) transaction.update(recipientRef, recipientUpdate);
    transaction.create(auditRef, {
      actorUid: senderUid, targetUid: recipientUid,
      action: "store_item_gifted", giftId, itemId, itemName: item.name,
      priceCoins: item.priceCoins, catalogVersion: item.version,
      createdAt: now,
    });
    return {
      giftId, itemId, recipientUid, priceCoins: item.priceCoins,
      newBalance, expiresAt: expiresAtMs, idempotentReplay: false,
    };
  });
});

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
    const [member, itemSnapshot, priorPurchase, priorEntitlement, priorLedger] = await Promise.all([
      transaction.get(userRef),
      transaction.get(itemRef),
      transaction.get(purchaseRef),
      transaction.get(entitlementRef),
      transaction.get(ledgerRef),
    ]);
    if (priorPurchase.exists) {
      const prior = priorPurchase.data() ?? {};
      if (!isStorePurchaseReplayCompatible(prior, uid, itemId, expectedPriceCoins)) {
        throw new HttpsError("already-exists", "معرف طلب الشراء مستخدم لعملية أخرى أو ببيانات سعر مختلفة.");
      }
      const ledger = priorLedger.data() ?? {};
      const balanceSnapshotValid =
        ledger.balanceBefore === undefined && ledger.balanceAfter === undefined ||
        Number.isSafeInteger(ledger.balanceBefore) &&
        Number.isSafeInteger(ledger.balanceAfter) &&
        ledger.balanceBefore >= 0 &&
        ledger.balanceAfter === ledger.balanceBefore - prior.priceCoins &&
        ledger.balanceAfter === prior.newBalance &&
        (prior.balanceBefore === undefined || prior.balanceBefore === ledger.balanceBefore);
      if (!priorLedger.exists || prior.status !== "completed" ||
          !Number.isSafeInteger(prior.priceCoins) || prior.priceCoins <= 0 ||
          !Number.isSafeInteger(prior.newBalance) || prior.newBalance < 0 ||
          ledger.type !== "store_purchase" || ledger.direction !== "debit" ||
          ledger.amount !== -prior.priceCoins || ledger.purchaseId !== purchaseId ||
          ledger.itemId !== itemId || !balanceSnapshotValid) {
        throw new HttpsError("failed-precondition", "إيصال الشراء لا يطابق قيد الخصم أو مطابقة الرصيد؛ يلزم تدقيق السجل.");
      }
      return {
        purchaseId, itemId, priceCoins: prior.priceCoins, newBalance: prior.newBalance,
        expiresAt: prior.expiresAt?.toMillis?.() ?? null, idempotentReplay: true,
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
    const nowMs = Date.now();
    const previousExpiry = priorEntitlement.data()?.expiresAt;
    const previousExpiryMs = previousExpiry instanceof Timestamp
      ? previousExpiry.toMillis()
      : typeof previousExpiry?.toMillis === "function" ? previousExpiry.toMillis() : 0;
    const boostExpiry = memberData.discoveryBoostExpiresAt;
    const boostExpiryMs = boostExpiry instanceof Timestamp
      ? boostExpiry.toMillis()
      : typeof boostExpiry?.toMillis === "function" ? boostExpiry.toMillis() : 0;
    const expiryBaseMs = Math.max(
      nowMs,
      previousExpiryMs,
      item.category === "boost" ? boostExpiryMs : 0,
    );
    const expiresAt = item.durationDays
      ? Timestamp.fromMillis(expiryBaseMs + item.durationDays * 24 * 60 * 60 * 1000)
      : null;
    const memberUpdate: Record<string, unknown> = {
      coins: newBalance,
      updatedAt: createdAt,
    };
    if (item.category === "boost" && expiresAt) {
      memberUpdate.discoveryBoostExpiresAt = expiresAt;
      memberUpdate.discoveryBoostPurchaseId = purchaseId;
    }
    if (item.itemId === "profile_pin_30d" && typeof memberData.pinnedProfileSection !== "string") {
      memberUpdate.pinnedProfileSection = "interests";
    }
    transaction.update(userRef, memberUpdate);
    transaction.create(purchaseRef, {
      purchaseId,
      memberUid: uid,
      itemId,
      itemName: item.name,
      category: item.category,
      priceCoins: item.priceCoins,
      durationDays: item.durationDays ?? null,
      balanceBefore: currentBalance,
      newBalance,
      expiresAt,
      status: "completed",
      createdAt,
    });
    transaction.create(ledgerRef, {
      type: "store_purchase",
      direction: "debit",
      amount: -item.priceCoins,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
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


/**
 * Grants a free store entitlement to one member. Each target/request pair is
 * idempotent; a new request deliberately extends an existing timed entitlement.
 */
async function executeOwnerEntitlementGrant(
  actorUid: string,
  targetUid: string,
  itemId: string,
  durationHours: 24 | 168 | 720,
  requestId: string,
  reason: string,
): Promise<Record<string, unknown>> {
  const grantId = createHash("sha256").update(`mawdda-owner-grant-v1:${requestId}:${targetUid}`).digest("hex");
  const memberRef = db.collection("users").doc(targetUid);
  const itemRef = db.collection("storeCatalog").doc(itemId);
  const entitlementRef = memberRef.collection("entitlements").doc(itemId);
  const grantRef = db.collection("ownerEntitlementGrants").doc(grantId);
  const ledgerRef = memberRef.collection("entitlementGrantLedger").doc(grantId);
  const auditRef = db.collection("adminAuditLogs").doc(`owner_entitlement_grant_${grantId}`);

  return db.runTransaction(async (transaction) => {
    const [member, itemSnapshot, priorGrant, priorEntitlement, priorLedger, priorAudit] = await Promise.all([
      transaction.get(memberRef),
      transaction.get(itemRef),
      transaction.get(grantRef),
      transaction.get(entitlementRef),
      transaction.get(ledgerRef),
      transaction.get(auditRef),
    ]);
    if (priorGrant.exists) {
      const prior = priorGrant.data() ?? {};
      const ledger = priorLedger.data() ?? {};
      const audit = priorAudit.data() ?? {};
      const priorExpiryMs = prior.expiresAt instanceof Timestamp ? prior.expiresAt.toMillis() : null;
      const ledgerExpiryMs = ledger.expiresAt instanceof Timestamp ? ledger.expiresAt.toMillis() : null;
      const sameGrant = prior.actorUid === actorUid && prior.targetUid === targetUid &&
        prior.itemId === itemId && prior.durationHours === durationHours &&
        prior.requestId === requestId && prior.reason === reason && prior.status === "granted";
      const sameLedger = priorLedger.exists && ledger.type === "owner_entitlement_grant" &&
        ledger.grantId === grantId && ledger.requestId === requestId &&
        ledger.actorUid === actorUid && ledger.targetUid === targetUid &&
        ledger.itemId === itemId && ledger.durationHours === durationHours &&
        ledger.reason === reason && ledgerExpiryMs === priorExpiryMs;
      const sameAudit = priorAudit.exists && audit.action === "owner_entitlement_granted" &&
        audit.grantId === grantId && audit.requestId === requestId &&
        audit.actorUid === actorUid && audit.targetUid === targetUid &&
        audit.itemId === itemId && audit.durationHours === durationHours &&
        audit.reason === reason;
      if (!sameGrant || !sameLedger || !sameAudit) {
        throw new HttpsError("failed-precondition", "سجل المنح أو دفتره أو سجل التدقيق غير متطابق؛ يلزم تدقيق المالك.");
      }
      // A later purchase or grant may supersede the current entitlement. Replays
      // validate immutable grant evidence and never overwrite the newer state.
      return {
        grantId, targetUid, itemId, status: "granted",
        expiresAt: prior.expiresAt instanceof Timestamp ? prior.expiresAt.toMillis() : null,
        idempotentReplay: true,
      };
    }
    if (!member.exists) throw new HttpsError("not-found", "حساب العضو غير موجود.");
    if (!itemSnapshot.exists) throw new HttpsError("not-found", "عنصر الاستحقاق غير موجود في الكتالوج.");
    const item = projectStoreCatalogItem(itemId, itemSnapshot.data() ?? {});
    if (!item || item.active !== true || item.fulfillmentReady !== true) {
      throw new HttpsError("failed-precondition", "لا يمكن منح عنصر غير نشط أو لم يكتمل تنفيذ استحقاقه.");
    }

    const nowMs = Date.now();
    const prior = priorEntitlement.data() ?? {};
    const priorExpiry = prior.expiresAt;
    const priorExpiryMs = priorExpiry instanceof Timestamp
      ? priorExpiry.toMillis()
      : typeof priorExpiry?.toMillis === "function" ? priorExpiry.toMillis() : 0;
    const permanentExisting = priorEntitlement.exists &&
      prior.status === "active" && (prior.expiresAt === null || prior.expiresAt === undefined);
    const nextExpiry = permanentExisting
      ? null
      : Timestamp.fromMillis(Math.max(nowMs, priorExpiryMs) + durationHours * 60 * 60 * 1000);
    const createdAt = FieldValue.serverTimestamp();

    transaction.set(entitlementRef, {
      itemId,
      itemName: item.name,
      category: item.category,
      status: "active",
      grantSource: "platform_owner",
      grantId,
      grantedBy: actorUid,
      grantedAt: createdAt,
      grantReason: reason,
      expiresAt: nextExpiry,
      updatedAt: createdAt,
    });
    transaction.create(grantRef, {
      grantId, requestId, actorUid, targetUid, itemId,
      itemName: item.name, category: item.category, durationHours, reason,
      previousExpiresAt: priorExpiry instanceof Timestamp ? priorExpiry : null,
      expiresAt: nextExpiry,
      status: "granted",
      createdAt,
    });
    transaction.create(ledgerRef, {
      type: "owner_entitlement_grant",
      grantId, requestId, actorUid, targetUid, itemId,
      itemName: item.name, category: item.category, durationHours, reason,
      expiresAt: nextExpiry,
      createdAt,
    });
    transaction.create(auditRef, {
      actorUid, targetUid, action: "owner_entitlement_granted",
      grantId, requestId, itemId, category: item.category,
      durationHours, reason, createdAt,
    });
    return {
      grantId, targetUid, itemId, status: "granted",
      expiresAt: nextExpiry?.toMillis() ?? null,
      idempotentReplay: false,
    };
  });
}

function validateOwnerEntitlementGrantRequest(data: Record<string, unknown>): {
  itemId: string; durationHours: 24 | 168 | 720; requestId: string; reason: string;
} {
  const itemId = data.itemId;
  const durationHours = data.durationHours;
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";
  if (typeof itemId !== "string" || !/^[A-Za-z0-9_-]{3,64}$/.test(itemId) ||
      ![24, 168, 720].includes(durationHours as number) ||
      reason.length < 5 || reason.length > 500) {
    throw new HttpsError("invalid-argument", "العنصر أو المدة أو سبب المنح غير صالح.");
  }
  let requestId: string;
  try { requestId = requireRequestId(data.requestId); }
  catch { throw new HttpsError("invalid-argument", "معرف طلب المنح غير صالح."); }
  return { itemId, durationHours: durationHours as 24 | 168 | 720, requestId, reason };
}

/** Owner/MFA-only single-member free grant; never debits coins or creates a purchase. */
export const grantStoreEntitlement = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_entitlement_grant");
  const targetUid = request.data?.memberUid;
  if (typeof targetUid !== "string" || targetUid.length < 1 || targetUid.length > 128 ||
      targetUid.trim() !== targetUid || targetUid.includes("/")) {
    throw new HttpsError("invalid-argument", "معرف العضو غير صالح.");
  }
  const input = validateOwnerEntitlementGrantRequest(request.data ?? {});
  return executeOwnerEntitlementGrant(
    actorUid, targetUid, input.itemId, input.durationHours, input.requestId, input.reason,
  );
});

/**
 * Owner/MFA-only bulk free grant. 500 targets is a per-call transport/work
 * unit, not an account/lifetime entitlement cap; callers may send further
 * chunks with the same requestId. Successful targets remain idempotent if a
 * later target fails, and the result reports each target independently.
 */
export const bulkGrantStoreEntitlements = onCall(async (request) => {
  const actorUid = await requireOwnerForReview(request, "owner_bulk_entitlement_grant");
  const input = validateOwnerEntitlementGrantRequest(request.data ?? {});
  const targetUids = request.data?.targetUids;
  if (!Array.isArray(targetUids) || targetUids.length < 1 || targetUids.length > 500 ||
      targetUids.some((uid: unknown) => typeof uid !== "string" || uid.length < 1 ||
        uid.length > 128 || uid.trim() !== uid || uid.includes("/")) ||
      new Set(targetUids).size !== targetUids.length) {
    throw new HttpsError("invalid-argument", "قائمة الأعضاء غير صالحة؛ أرسل حتى 500 معرف فريد في كل دفعة.");
  }
  const itemSnapshot = await db.collection("storeCatalog").doc(input.itemId).get();
  const item = itemSnapshot.exists ? projectStoreCatalogItem(input.itemId, itemSnapshot.data() ?? {}) : null;
  if (!item || item.active !== true || item.fulfillmentReady !== true) {
    throw new HttpsError("failed-precondition", "لا يمكن منح عنصر غير نشط أو لم يكتمل تنفيذ استحقاقه.");
  }

  const results: Record<string, unknown>[] = [];
  for (let offset = 0; offset < targetUids.length; offset += 10) {
    const chunk = targetUids.slice(offset, offset + 10) as string[];
    const settled = await Promise.all(chunk.map(async (targetUid) => {
      try {
        return await executeOwnerEntitlementGrant(
          actorUid, targetUid, input.itemId, input.durationHours, input.requestId, input.reason,
        );
      } catch (error) {
        return {
          targetUid,
          itemId: input.itemId,
          status: "failed",
          errorCode: error instanceof HttpsError ? error.code : "internal",
          idempotentReplay: false,
        };
      }
    }));
    results.push(...settled);
  }
  return {
    requestId: input.requestId,
    itemId: input.itemId,
    total: results.length,
    granted: results.filter((result) => result.status === "granted").length,
    failed: results.filter((result) => result.status === "failed").length,
    replayed: results.filter((result) => result.idempotentReplay === true).length,
    results,
  };
});

/** Members can read a privacy-projected history of their own free entitlement grants. */
export const getMyEntitlementGrantHistory = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const memberRef = db.collection("users").doc(uid);
  const member = await memberRef.get();
  if (!member.exists) throw new HttpsError("not-found", "ملف العضوية غير موجود.");
  const snapshot = await memberRef.collection("entitlementGrantLedger")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return {
    entries: snapshot.docs.map((document) => {
      const data = document.data();
      return {
        grantId: data.grantId,
        itemId: data.itemId,
        itemName: data.itemName,
        category: data.category,
        durationHours: data.durationHours,
        expiresAtMs: data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : null,
        createdAtMs: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
      };
    }),
  };
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
  let savedVersion = 0;
  await db.runTransaction(async (transaction) => {
    const previousSnapshot = await transaction.get(itemRef);
    const previous = previousSnapshot.data() ?? {};
    // Legacy catalog rows without a version are upgraded to version 1 on the
    // first owner publication. Malformed non-null versions fail closed.
    const rawPreviousVersion = previous.version;
    const previousVersion = rawPreviousVersion === null || rawPreviousVersion === undefined
      ? 0 : rawPreviousVersion;
    if (!Number.isSafeInteger(previousVersion) || previousVersion < 0) {
      throw new HttpsError("failed-precondition", "إصدار عنصر المتجر الحالي غير صالح؛ أوقفنا التحديث لحماية سجل الأسعار.");
    }
    if (previousVersion >= Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("resource-exhausted", "بلغ عنصر المتجر الحد الآمن للإصدارات؛ أوقفنا التحديث.");
    }
    savedVersion = previousVersion + 1;
    const now = FieldValue.serverTimestamp();
    const nextItem = {
      itemId: item.itemId, name: item.name, description: item.description,
      category: item.category, priceCoins: item.priceCoins,
      durationDays: item.durationDays ?? null, sortOrder: item.sortOrder,
      active: item.active, purchaseEnabled: item.purchaseEnabled,
      fulfillmentReady: item.fulfillmentReady, version: savedVersion,
      createdAt: previous.createdAt ?? now, updatedAt: now, updatedBy: actorUid,
    };
    const versionRef = db.collection("storeCatalogVersions").doc(item.itemId)
      .collection("versions").doc(String(savedVersion));
    transaction.create(versionRef, { ...nextItem, createdBy: actorUid });
    transaction.set(itemRef, { ...nextItem, currentVersionPath: versionRef.path });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid,
      action: previousSnapshot.exists ? "store_catalog_item_updated" : "store_catalog_item_created",
      itemId: item.itemId, version: savedVersion,
      active: item.active, priceCoins: item.priceCoins,
      category: item.category, purchaseEnabled: item.purchaseEnabled,
      fulfillmentReady: item.fulfillmentReady, durationDays: item.durationDays ?? null,
      createdAt: now,
    });
  });
  return { itemId: item.itemId, active: item.active, version: savedVersion };
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
      const fulfillmentReady = projectStoreCatalogItem(item.itemId, {
        ...item,
        active: true,
        fulfillmentReady: true,
      })?.fulfillmentReady ?? false;
      transaction.create(ref, {
        ...item,
        // Publish approved, implemented profile features for discovery in the
        // shop, but leave charging disabled until the owner confirms prices.
        active: fulfillmentReady,
        purchaseEnabled: false,
        fulfillmentReady,
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
  getTimedAdCreativeUrl,
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
    const [user, settings, prior, priorLedger] = await Promise.all([
      transaction.get(userRef), transaction.get(ROOM_RENTAL_SETTINGS),
      transaction.get(rentalRef), transaction.get(ledgerRef),
    ]);
    if (prior.exists) {
      const data = prior.data()!;
      if (data.ownerUid !== uid || data.planId !== planId ||
          data.requestedName !== name || data.requestedCapacity !== capacity ||
          data.requestedPriceCoins !== expectedPriceCoins ||
          typeof data.roomId !== "string" || !data.roomId ||
          !(data.expiresAt instanceof Timestamp)) {
        throw new HttpsError("already-exists", "معرف طلب الاستئجار مستخدم لعملية أخرى أو ببيانات مختلفة.");
      }
      const priorRoomRef = db.collection("rooms").doc(data.roomId);
      const priorMemberRef = priorRoomRef.collection("members").doc(uid);
      const [priorRoom, priorMember] = await Promise.all([
        transaction.get(priorRoomRef), transaction.get(priorMemberRef),
      ]);
      const ledger = priorLedger.data() ?? {};
      const balanceSnapshotValid =
        ledger.balanceBefore === undefined && ledger.balanceAfter === undefined ||
        Number.isSafeInteger(ledger.balanceBefore) &&
        Number.isSafeInteger(ledger.balanceAfter) &&
        ledger.balanceBefore >= 0 &&
        ledger.balanceAfter === ledger.balanceBefore - data.priceCoins &&
        ledger.balanceAfter === data.newBalance &&
        (data.balanceBefore === undefined || data.balanceBefore === ledger.balanceBefore);
      const roomData = priorRoom.data() ?? {};
      if (!priorLedger.exists || !Number.isSafeInteger(data.priceCoins) || data.priceCoins <= 0 ||
          !Number.isSafeInteger(data.newBalance) || data.newBalance < 0 ||
          ledger.type !== "room_rental" || ledger.direction !== "debit" ||
          ledger.amount !== -data.priceCoins || ledger.roomId !== data.roomId ||
          ledger.rentalId !== rentalRef.id || ledger.planId !== planId ||
          !balanceSnapshotValid || !priorRoom.exists || !priorMember.exists ||
          roomData.roomId !== data.roomId || roomData.name !== name ||
          roomData.capacity !== capacity || roomData.isRented !== true) {
        throw new HttpsError("failed-precondition", "طلب الاستئجار لا يطابق الغرفة أو قيد الخصم؛ يلزم تدقيق مالي.");
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
      requestedName: name, requestedCapacity: capacity, requestedPriceCoins: expectedPriceCoins,
      balanceBefore: userData.coins ?? 0, newBalance,
      startsAt: Timestamp.fromMillis(nowMs), expiresAt, createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "room_rental", direction: "debit", amount: -plan.priceCoins,
      balanceBefore: userData.coins ?? 0, balanceAfter: newBalance,
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
    const [room, user, settings, prior, priorLedger] = await Promise.all([
      transaction.get(roomRef), transaction.get(userRef), transaction.get(ROOM_RENTAL_SETTINGS),
      transaction.get(rentalRef), transaction.get(ledgerRef),
    ]);
    if (prior.exists) {
      const data = prior.data()!;
      if (data.roomId !== roomId || data.ownerUid !== uid ||
          data.planId !== planId || data.requestedPriceCoins !== expectedPriceCoins ||
          !(data.expiresAt instanceof Timestamp)) {
        throw new HttpsError("already-exists", "معرف طلب التجديد مستخدم لعملية أخرى أو ببيانات مختلفة.");
      }
      const ledger = priorLedger.data() ?? {};
      const balanceSnapshotValid =
        ledger.balanceBefore === undefined && ledger.balanceAfter === undefined ||
        Number.isSafeInteger(ledger.balanceBefore) &&
        Number.isSafeInteger(ledger.balanceAfter) &&
        ledger.balanceBefore >= 0 &&
        ledger.balanceAfter === ledger.balanceBefore - data.priceCoins &&
        ledger.balanceAfter === data.newBalance &&
        (data.balanceBefore === undefined || data.balanceBefore === ledger.balanceBefore);
      if (!priorLedger.exists || !Number.isSafeInteger(data.priceCoins) || data.priceCoins <= 0 ||
          !Number.isSafeInteger(data.newBalance) || data.newBalance < 0 ||
          ledger.type !== "room_rental_renewal" || ledger.direction !== "debit" ||
          ledger.amount !== -data.priceCoins || ledger.roomId !== roomId ||
          ledger.rentalId !== rentalRef.id || ledger.planId !== planId ||
          !balanceSnapshotValid) {
        throw new HttpsError("failed-precondition", "طلب التجديد لا يطابق قيد الخصم؛ يلزم تدقيق مالي.");
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
    const previousRentalId = room.data()?.rentalId;
    const previousRentalRef = typeof previousRentalId === "string"
      ? db.collection("roomRentals").doc(previousRentalId) : null;
    const previousRental = previousRentalRef ? await transaction.get(previousRentalRef) : null;
    const startMs = Math.max(nowMs, previousExpiry);
    const expiresAt = Timestamp.fromMillis(roomRentalExpiry(startMs, plan.durationDays));
    const now = FieldValue.serverTimestamp();
    if (previousRentalRef && previousRental?.exists &&
        ["active", "grace_period"].includes(previousRental.data()?.status)) {
      transaction.update(previousRentalRef, {
        status: "renewed", supersededByRentalId: rentalRef.id, supersededAt: now,
        updatedAt: now,
      });
    }
    transaction.update(userRef, { coins: balance, updatedAt: now });
    transaction.update(roomRef, {
      status: "active", expiresAt, rentalId: rentalRef.id, rentalPlanId: plan.planId,
      rentalPriceCoins: plan.priceCoins, rentalDurationDays: plan.durationDays,
      frozenAt: FieldValue.delete(), freezeExpiresAt: FieldValue.delete(), updatedAt: now,
    });
    transaction.create(rentalRef, {
      rentalId: rentalRef.id, roomId, ownerUid: uid, planId: plan.planId,
      priceCoins: plan.priceCoins, durationDays: plan.durationDays, status: "active",
      requestedPriceCoins: expectedPriceCoins,
      balanceBefore: user.data()?.coins ?? 0, newBalance: balance,
      startsAt: Timestamp.fromMillis(startMs), expiresAt, createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "room_rental_renewal", direction: "debit", amount: -plan.priceCoins,
      balanceBefore: user.data()?.coins ?? 0, balanceAfter: balance,
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
  const paymentPolicy = projectEconomicPaymentPolicy(data.paymentPolicy, {
    manualCoinPurchasesEnabled: data.manualCoinPurchasesEnabled,
    manualFeaturedAdsEnabled: data.manualFeaturedAdsEnabled,
  });
  if (!snapshot.exists || paymentPolicy.coin_purchases.manualEnabled !== true ||
      paymentPolicy.coin_purchases.automatedEnabled !== false ||
      data.automatedCoinCheckoutEnabled === true || !Number.isSafeInteger(data.version) ||
      data.version < 1 || !Array.isArray(data.coinPackages)) {
    return { packages: [], manualPurchasesEnabled: false, automatedCheckoutEnabled: false, customCoinRequestBounds: null };
  }
  const bounds = data.customCoinRequestBounds ?? null;
  if (bounds !== null && (!bounds || typeof bounds !== "object" ||
      !Number.isSafeInteger(bounds.minCoins) || bounds.minCoins < 1 ||
      !Number.isSafeInteger(bounds.maxCoins) || bounds.maxCoins < bounds.minCoins ||
      bounds.maxCoins > 1000000000)) {
    throw new HttpsError("failed-precondition", "حدود طلبات الكمية المخصصة غير صالحة؛ أوقفنا عرضها.");
  }
  let packages;
  try { packages = validateCoinPackages(data.coinPackages); }
  catch { throw new HttpsError("failed-precondition", "قائمة باقات BetaCoins غير صالحة؛ أوقفنا عرض الأسعار."); }
  return {
    packages: packages.filter((item) => item.active),
    manualPurchasesEnabled: true,
    automatedCheckoutEnabled: false,
    customCoinRequestBounds: bounds,
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
    const paymentPolicy = projectEconomicPaymentPolicy(economy.paymentPolicy, {
      manualCoinPurchasesEnabled: economy.manualCoinPurchasesEnabled,
      manualFeaturedAdsEnabled: economy.manualFeaturedAdsEnabled,
    });
    if (!settings.exists || paymentPolicy.coin_purchases.manualEnabled !== true ||
        paymentPolicy.coin_purchases.automatedEnabled !== false ||
        economy.automatedCoinCheckoutEnabled === true || !Number.isSafeInteger(economy.version) ||
        economy.version < 1) {
      throw new HttpsError("failed-precondition", "سياسة الشراء اليدوي غير مهيأة أو غير فعالة؛ لم ننشئ طلباً مالياً.");
    }
    let packageSnapshot: Record<string, unknown> | null = null;
    let requestedCoins: number | null = null;
    if (input.kind === "package") {
      let packages;
      try { packages = validateCoinPackages(economy.coinPackages); }
      catch { throw new HttpsError("failed-precondition", "قائمة باقات الكوينز غير صالحة."); }
      const selected = packages.find((item) => item.packageId === input.packageId && item.active);
      if (!selected) throw new HttpsError("not-found", "الباقة غير متاحة حالياً.");
      packageSnapshot = { ...selected };
      requestedCoins = selected.coins;
    } else {
      const bounds = economy.customCoinRequestBounds;
      if (!bounds || typeof bounds !== "object" ||
          !Number.isSafeInteger(bounds.minCoins) || bounds.minCoins < 1 ||
          !Number.isSafeInteger(bounds.maxCoins) || bounds.maxCoins < bounds.minCoins ||
          bounds.maxCoins > 1000000000 ||
          input.requestedCoins === undefined ||
          input.requestedCoins < bounds.minCoins || input.requestedCoins > bounds.maxCoins) {
        throw new HttpsError("failed-precondition", "طلبات الكمية المخصصة غير مفعلة أو خارج الحدود التي حددها المالك.");
      }
      requestedCoins = input.requestedCoins;
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
      requestedCoins, pricingPolicyVersion: economy.version,
      pricingPolicyPath: `platformSettings/economyPricingVersions/versions/${economy.version}`,
      status: "pending_owner_contact",
      paymentChannel: "manual_owner_contact", currency: packageSnapshot?.currency ?? economy.currency ?? null,
      currencyExponent: packageSnapshot?.currencyExponent ?? null,
      paymentPolicySnapshot: {
        service: "coin_purchases",
        manualEnabled: paymentPolicy.coin_purchases.manualEnabled,
        automatedEnabled: paymentPolicy.coin_purchases.automatedEnabled,
        policyVersion: economy.version, pricingPolicyVersion: economy.version,
      },
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
    "awaiting_payment_verification", "approved", "rejected", "withdrawn"];
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
    expectedInstructionsVersion: request.data?.expectedInstructionsVersion,
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
    if (prior.status !== "pending_owner_contact") {
      throw new HttpsError("failed-precondition", "تعليمات الدفع المرسلة لا تُعدّل؛ إذا لزم تصحيح الاتفاق فأغلق الطلب وافتح طلباً جديداً.");
    }
    if (prior.paymentChannel !== "manual_owner_contact" ||
        prior.paymentPolicySnapshot?.service !== "coin_purchases" ||
        prior.paymentPolicySnapshot?.manualEnabled !== true ||
        prior.paymentPolicySnapshot?.automatedEnabled !== false ||
        prior.paymentPolicySnapshot?.policyVersion !== prior.pricingPolicyVersion) {
      throw new HttpsError("failed-precondition", "مسار الدفع اليدوي غير مثبت في لقطة الطلب.");
    }
    const currentInstructionsVersion = Number.isSafeInteger(prior.instructionsVersion)
      ? prior.instructionsVersion : 0;
    if (currentInstructionsVersion !== input.expectedInstructionsVersion) {
      throw new HttpsError("aborted", "تغير إصدار الطلب؛ أعد تحميله قبل إصدار التعليمات.");
    }
    const nextVersion = currentInstructionsVersion + 1;
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
      lastMessageAt: now, lastMessageId: messageId, lastMessageSenderUid: actorUid,
      lastMessagePreview: "أرسل مالك المنصة تعليمات دفع طلب الكوينز.",
    }, { merge: true });
    if (!existingMessage.exists) {
      transaction.create(messageRef, {
        messageId, chatId, senderUid: actorUid, recipientUid: requesterUid,
        text: "تعليمات الدفع لطلب شراء الكوينز رقم " + input.requestId +
          "\nالكمية المتفق عليها: " + input.agreedCoins + " كوين" +
          "\nالسعر: " + (input.agreedPriceMinor / Math.pow(10, input.currencyExponent)).toFixed(input.currencyExponent) + " " + input.currency +
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
      currencyExponent: input.currencyExponent,
      paymentInstructions: input.instructions, instructionsVersion: nextVersion,
      paymentPolicySnapshot: prior.paymentPolicySnapshot,
      instructionsSetBy: actorUid, instructionsSetAt: now, updatedAt: now,
    });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid, targetUid: requesterUid, action: "coin_purchase_payment_instructions_set",
      requestId: input.requestId, agreedCoins: input.agreedCoins,
      agreedPriceMinor: input.agreedPriceMinor, currency: input.currency,
      currencyExponent: input.currencyExponent,
      paymentPolicySnapshot: prior.paymentPolicySnapshot,
      paymentPolicyVersion: prior.paymentPolicySnapshot.policyVersion,
      pricingPolicyVersion: prior.pricingPolicyVersion,
      chatId, messageId, instructionsVersion: nextVersion, createdAt: now,
    });
  });
  await sendPushToMember(requesterUid, "تعليمات دفع من مالك مودة",
    "أرسل مالك المنصة تعليمات الدفع لطلب الكوينز. افتح المحادثة للاطلاع عليها.",
    { type: "coin_purchase_payment_instructions", chatId, messageId });
  return { requestId: input.requestId, status: "payment_instructions_sent", chatId, messageId };
});

/** Member payment report is a claim-only signal; it never credits the wallet. */
export const requestCoinPurchasePaymentVerification = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const requestId = request.data?.requestId;
  const expectedInstructionsVersion = request.data?.expectedInstructionsVersion;
  if (typeof requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(requestId) ||
      !Number.isSafeInteger(expectedInstructionsVersion) ||
      (expectedInstructionsVersion as number) < 1) {
    throw new HttpsError("invalid-argument", "معرف الطلب أو إصدار التعليمات غير صالح.");
  }
  const requestRef = db.collection("coinPurchaseRequests").doc(`${uid}_${requestId}`);
  const memberRef = db.collection("users").doc(uid);
  const auditRef = db.collection("adminAuditLogs").doc(
    `coin_purchase_payment_report_${uid}_${requestId}_${expectedInstructionsVersion}`,
  );
  return db.runTransaction(async (transaction) => {
    const [purchase, member, audit] = await Promise.all([
      transaction.get(requestRef), transaction.get(memberRef), transaction.get(auditRef),
    ]);
    if (!member.exists || member.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(member.data())) {
      throw new HttpsError("permission-denied", "حالة العضوية لا تسمح بتحديث طلب الدفع.");
    }
    if (!purchase.exists || purchase.data()?.requesterUid !== uid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    const data = purchase.data() ?? {};
    if (data.paymentChannel !== "manual_owner_contact" ||
        data.paymentPolicySnapshot?.service !== "coin_purchases" ||
        data.paymentPolicySnapshot?.manualEnabled !== true ||
        data.paymentPolicySnapshot?.automatedEnabled !== false ||
        data.paymentPolicySnapshot?.policyVersion !== data.pricingPolicyVersion) {
      throw new HttpsError("failed-precondition", "هذا الطلب لا يستخدم مسار الدفع اليدوي.");
    }
    if (data.status === "awaiting_payment_verification" &&
        data.instructionsVersion === expectedInstructionsVersion &&
        data.paymentReportedInstructionVersion === expectedInstructionsVersion) {
      const auditData = audit.data() ?? {};
      if (!audit.exists ||
          auditData.actorUid !== uid || auditData.targetUid !== uid ||
          auditData.action !== "coin_purchase_member_reported_external_payment" ||
          auditData.requestId !== requestId ||
          auditData.instructionVersion !== expectedInstructionsVersion ||
          JSON.stringify(auditData.paymentPolicySnapshot ?? null) !== JSON.stringify(data.paymentPolicySnapshot ?? null) ||
          auditData.paymentPolicyVersion !== data.paymentPolicySnapshot.policyVersion ||
          auditData.pricingPolicyVersion !== data.pricingPolicyVersion ||
          auditData.authority !== "member_claim_only_not_payment_proof") {
        throw new HttpsError("failed-precondition", "بلاغ الدفع لا يطابق سجل التدقيق؛ يلزم مراجعة المالك.");
      }
      return { requestId, status: "awaiting_payment_verification", idempotentReplay: true };
    }
    if (data.status !== "payment_instructions_sent" ||
        data.instructionsVersion !== expectedInstructionsVersion || audit.exists) {
      throw new HttpsError("failed-precondition", "حالة الطلب أو إصدار التعليمات لا يسمح بالإبلاغ عن الدفع.");
    }
    transaction.update(requestRef, {
      status: "awaiting_payment_verification",
      paymentReportedBy: uid,
      paymentReportedAt: FieldValue.serverTimestamp(),
      paymentReportedInstructionVersion: expectedInstructionsVersion,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      actorUid: uid, targetUid: uid,
      action: "coin_purchase_member_reported_external_payment",
      requestId, instructionVersion: expectedInstructionsVersion,
      paymentPolicySnapshot: data.paymentPolicySnapshot,
      paymentPolicyVersion: data.paymentPolicySnapshot.policyVersion,
      pricingPolicyVersion: data.pricingPolicyVersion,
      authority: "member_claim_only_not_payment_proof",
      createdAt: FieldValue.serverTimestamp(),
    });
    return { requestId, status: "awaiting_payment_verification", idempotentReplay: false };
  });
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
  return db.runTransaction(async (transaction) => {
    const [purchase, user, ledger, approvalAudit] = await Promise.all([
      transaction.get(requestRef), transaction.get(userRef), transaction.get(ledgerRef),
      transaction.get(auditRef),
    ]);
    if (!purchase.exists || purchase.data()?.requesterUid !== requesterUid) {
      throw new HttpsError("not-found", "طلب الشراء غير موجود.");
    }
    const data = purchase.data()!;
    if (data.status === "approved") {
      const ledgerData = ledger.data() ?? {};
      const auditData = approvalAudit.data() ?? {};
      if (!ledger.exists || !approvalAudit.exists ||
          ledgerData.type !== "coin_purchase_manual_credit" ||
          ledgerData.amount !== data.creditedCoins ||
          ledgerData.purchaseRequestId !== input.requestId ||
          ledgerData.externalPaymentReference !== input.externalPaymentReference ||
          ledgerData.priceMinor !== data.agreedPriceMinor ||
          ledgerData.currency !== data.currency ||
          ledgerData.currencyExponent !== data.currencyExponent ||
          JSON.stringify(ledgerData.paymentPolicySnapshot ?? null) !== JSON.stringify(data.paymentPolicySnapshot ?? null) ||
          ledgerData.paymentPolicyVersion !== data.paymentPolicySnapshot?.policyVersion ||
          ledgerData.pricingPolicyVersion !== data.pricingPolicyVersion ||
          ledgerData.instructionsVersion !== data.instructionsVersion ||
          ledgerData.actorUid !== data.verifiedBy ||
          !Number.isSafeInteger(ledgerData.balanceBefore) ||
          !Number.isSafeInteger(ledgerData.balanceAfter) ||
          ledgerData.balanceBefore < 0 ||
          ledgerData.balanceAfter !== ledgerData.balanceBefore + ledgerData.amount ||
          data.externalPaymentVerified !== true ||
          data.externalPaymentReference !== input.externalPaymentReference ||
          !Number.isSafeInteger(data.creditedCoins) || data.creditedCoins < 1 ||
          auditData.action !== "coin_purchase_manually_verified_and_approved" ||
          auditData.actorUid !== data.verifiedBy ||
          auditData.targetUid !== requesterUid ||
          auditData.requestId !== input.requestId ||
          auditData.externalPaymentReference !== input.externalPaymentReference ||
          auditData.creditedCoins !== data.creditedCoins ||
          auditData.priceMinor !== data.agreedPriceMinor ||
          auditData.currency !== data.currency ||
          auditData.currencyExponent !== data.currencyExponent ||
          JSON.stringify(auditData.paymentPolicySnapshot ?? null) !== JSON.stringify(data.paymentPolicySnapshot ?? null) ||
          auditData.paymentPolicyVersion !== data.paymentPolicySnapshot?.policyVersion ||
          auditData.pricingPolicyVersion !== data.pricingPolicyVersion ||
          auditData.instructionsVersion !== data.instructionsVersion ||
          auditData.verificationNote !== data.verificationNote) {
        throw new HttpsError("failed-precondition", "طلب الشراء المعتمد لا يطابق قيد المحفظة وسجل المالك؛ يلزم تدقيق مالي.");
      }
      return { status: "approved", idempotentReplay: true, newBalance: user.data()?.coins ?? null };
    }
    if (data.paymentChannel !== "manual_owner_contact" ||
        data.paymentPolicySnapshot?.service !== "coin_purchases" ||
        data.paymentPolicySnapshot?.manualEnabled !== true ||
        data.paymentPolicySnapshot?.automatedEnabled !== false ||
        data.paymentPolicySnapshot?.policyVersion !== data.pricingPolicyVersion) {
      throw new HttpsError("failed-precondition", "لقطة الطلب لا تسمح بالاعتماد اليدوي.");
    }
    if (!["payment_instructions_sent", "awaiting_payment_verification"].includes(String(data.status))) {
      throw new HttpsError("failed-precondition", "لا يمكن اعتماد الطلب قبل إرسال تعليمات الدفع.");
    }
    if (!user.exists || !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "حساب العضو غير مؤهل لاستلام BetaCoins.");
    }
    if (ledger.exists || approvalAudit.exists) {
      throw new HttpsError("already-exists", "يوجد سجل مالي سابق لهذا الطلب؛ يلزم تدقيقه.");
    }
    const coins = data.agreedCoins;
    if (!Number.isSafeInteger(coins) || coins < 1 || coins > 1000000000 ||
        !Number.isSafeInteger(data.agreedPriceMinor) || data.agreedPriceMinor < 1 ||
        typeof data.currency !== "string" || currencyExponentForCode(data.currency) === null ||
        data.currencyExponent !== currencyExponentForCode(data.currency) ||
        !Number.isSafeInteger(data.instructionsVersion) || data.instructionsVersion < 1) {
      throw new HttpsError("failed-precondition", "الكمية أو السعر أو لقطة تعليمات الدفع غير صالحة.");
    }
    const oldBalance = user.data()?.coins ?? 0;
    if (!Number.isSafeInteger(oldBalance) || oldBalance < 0 ||
        oldBalance + coins > Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "رصيد العضو لا يسمح بإتمام العملية.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: oldBalance + coins, walletUpdatedAt: now });
    transaction.create(ledgerRef, {
      type: "coin_purchase_manual_credit", amount: coins, balanceBefore: oldBalance,
      balanceAfter: oldBalance + coins, purchaseRequestId: input.requestId,
      externalPaymentReference: input.externalPaymentReference,
      priceMinor: data.agreedPriceMinor, currency: data.currency,
      currencyExponent: data.currencyExponent,
      paymentPolicySnapshot: data.paymentPolicySnapshot,
      paymentPolicyVersion: data.paymentPolicySnapshot.policyVersion,
      pricingPolicyVersion: data.pricingPolicyVersion,
      instructionsVersion: data.instructionsVersion,
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
      priceMinor: data.agreedPriceMinor, currency: data.currency,
      currencyExponent: data.currencyExponent,
      paymentPolicySnapshot: data.paymentPolicySnapshot,
      paymentPolicyVersion: data.paymentPolicySnapshot.policyVersion,
      pricingPolicyVersion: data.pricingPolicyVersion,
      instructionsVersion: data.instructionsVersion, createdAt: now,
    });
    return { status: "approved", idempotentReplay: false, newBalance: oldBalance + coins };
  });
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
    if (["payment_instructions_sent", "awaiting_payment_verification", "approved", "rejected"].includes(String(snapshot.data()?.status))) {
      throw new HttpsError("failed-precondition", "لا يمكن سحب الطلب بعد إصدار تعليمات الدفع؛ تواصل مع المالك لإغلاق الاتفاق.");
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
  requireOwner(request);
  const snapshot = await ECONOMY_PRICING_SETTINGS.get();
  if (!snapshot.exists) {
    return {
      coinPackages: EXPERIMENTAL_DEFAULT_COIN_PACKAGES,
      adPrices: EXPERIMENTAL_DEFAULT_AD_PRICES,
      customCoinRequestBounds: null,
      version: 0, realMoneyCheckoutEnabled: false,
      manualCoinPurchasesEnabled: false, automatedCoinCheckoutEnabled: false,
      configured: false, pricingDefaultsStatus: "experimental_provisional",
    };
  }
  const data = snapshot.data() ?? {};
  let coinPackages: ReturnType<typeof validateCoinPackages> = [];
  let adPrices: ReturnType<typeof validateAdPrices> = [];
  try {
    coinPackages = data.coinPackages === undefined
      ? EXPERIMENTAL_DEFAULT_COIN_PACKAGES : validateCoinPackages(data.coinPackages);
    adPrices = data.adPrices === undefined
      ? EXPERIMENTAL_DEFAULT_AD_PRICES : validateAdPrices(data.adPrices);
  } catch {
    throw new HttpsError("failed-precondition", "إعدادات اقتصاد المنصة غير صالحة؛ راجع الدعم التقني.");
  }
  const usesExperimentalPricingDefaults =
    data.coinPackages === undefined || data.adPrices === undefined;
  const bounds = data.customCoinRequestBounds ?? null;
  if (!Number.isSafeInteger(data.version) || data.version < 1) {
    throw new HttpsError("failed-precondition", "إصدار سياسة الاقتصاد الحالية غير صالح.");
  }
  if (bounds !== null && (!bounds || typeof bounds !== "object" ||
      !Number.isSafeInteger(bounds.minCoins) || bounds.minCoins < 1 ||
      !Number.isSafeInteger(bounds.maxCoins) || bounds.maxCoins < bounds.minCoins ||
      bounds.maxCoins > 1000000000)) {
    throw new HttpsError("failed-precondition", "حدود طلبات الكمية المخصصة غير صالحة.");
  }
  const paymentPolicy = projectEconomicPaymentPolicy(data.paymentPolicy, {
    manualCoinPurchasesEnabled: data.manualCoinPurchasesEnabled,
    manualFeaturedAdsEnabled: data.manualFeaturedAdsEnabled,
  });
  return {
    coinPackages, adPrices, customCoinRequestBounds: bounds,
    version: data.version,
    realMoneyCheckoutEnabled: false,
    manualCoinPurchasesEnabled: paymentPolicy.coin_purchases.manualEnabled,
    paymentPolicy,
    automatedCoinCheckoutEnabled: false,
    configured: true,
    pricingDefaultsStatus: usesExperimentalPricingDefaults
      ? "experimental_provisional" : "owner_configured",
  };
});

/** Owner/MFA-only economy price updates. This configures prices, not payment processing. */
export const setOwnerEconomyPricing = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let coinPackages: ReturnType<typeof validateCoinPackages>;
  let adPrices: ReturnType<typeof validateAdPrices>;
  const manualCoinPurchasesEnabled = request.data?.manualCoinPurchasesEnabled;
  const rawBounds = request.data?.customCoinRequestBounds ?? null;
  if (typeof manualCoinPurchasesEnabled !== "boolean") {
    throw new HttpsError("invalid-argument", "يجب تحديد حالة الشراء اليدوي صراحةً.");
  }
  let customCoinRequestBounds: { minCoins: number; maxCoins: number } | null = null;
  if (rawBounds !== null) {
    if (!rawBounds || typeof rawBounds !== "object" ||
        !Number.isSafeInteger(rawBounds.minCoins) || rawBounds.minCoins < 1 ||
        !Number.isSafeInteger(rawBounds.maxCoins) || rawBounds.maxCoins < rawBounds.minCoins ||
        rawBounds.maxCoins > 1000000000) {
      throw new HttpsError("invalid-argument", "حدود طلبات الكمية المخصصة غير صالحة.");
    }
    customCoinRequestBounds = { minCoins: rawBounds.minCoins, maxCoins: rawBounds.maxCoins };
  }
  try {
    coinPackages = validateCoinPackages(request.data?.coinPackages);
    adPrices = validateAdPrices(request.data?.adPrices);
  } catch {
    throw new HttpsError("invalid-argument", "أسعار باقات BetaCoins أو الإعلانات غير صالحة.");
  }
  const version = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ECONOMY_PRICING_SETTINGS);
    const previousData = previous.data() ?? {};
    if (previous.exists && (!Number.isSafeInteger(previousData.version) ||
        previousData.version < 1)) {
      throw new HttpsError("failed-precondition", "إصدار سياسة الاقتصاد الحالية غير صالح؛ أوقفنا التحديث لحماية السجل.");
    }
    const nextVersion = previous.exists ? previousData.version + 1 : 1;
    if (!Number.isSafeInteger(nextVersion)) {
      throw new HttpsError("resource-exhausted", "تعذر إنشاء إصدار جديد لسياسة الاقتصاد.");
    }
    const previousPaymentPolicy = projectEconomicPaymentPolicy(previousData.paymentPolicy, {
      manualCoinPurchasesEnabled: previousData.manualCoinPurchasesEnabled,
      manualFeaturedAdsEnabled: previousData.manualFeaturedAdsEnabled,
    });
    let paymentPolicy;
    try {
      paymentPolicy = request.data?.paymentPolicy === undefined
        ? validateEconomicPaymentPolicy({
            ...previousPaymentPolicy,
            coin_purchases: { manualEnabled: manualCoinPurchasesEnabled, automatedEnabled: false },
          })
        : validateEconomicPaymentPolicy(request.data.paymentPolicy);
    } catch {
      throw new HttpsError("invalid-argument", "سياسة وسائل الدفع غير صالحة أو تتضمن مساراً غير جاهز.");
    }
    if (paymentPolicy.coin_purchases.manualEnabled !== manualCoinPurchasesEnabled) {
      throw new HttpsError("invalid-argument", "حالة الشراء اليدوي لا تطابق سياسة الدفع.");
    }
    const now = FieldValue.serverTimestamp();
    const versionRef = db.collection("platformSettings").doc("economyPricingVersions")
      .collection("versions").doc(String(nextVersion));
    transaction.create(versionRef, {
      coinPackages, adPrices, customCoinRequestBounds, paymentPolicy,
      manualCoinPurchasesEnabled, automatedCoinCheckoutEnabled: false,
      realMoneyCheckoutEnabled: false, version: nextVersion,
      createdAt: now, createdBy: actorUid,
    });
    transaction.set(ECONOMY_PRICING_SETTINGS, {
      coinPackages, adPrices, customCoinRequestBounds, paymentPolicy, version: nextVersion,
      manualCoinPurchasesEnabled,
      automatedCoinCheckoutEnabled: false,
      realMoneyCheckoutEnabled: false,
      updatedAt: now, updatedBy: actorUid,
      createdAt: previousData.createdAt ?? now,
      currentVersionPath: versionRef.path,
    });
    const auditRef = db.collection("adminAuditLogs").doc();
    transaction.create(auditRef, {
      actorUid, action: "economy_pricing_updated", version: nextVersion,
      coinPackageCount: coinPackages.length, adPlacementCount: adPrices.length,
      manualCoinPurchasesEnabled, customCoinRequestBounds,
      realMoneyCheckoutEnabled: false, createdAt: now,
    });
    return nextVersion;
  });
  return { saved: true, version, realMoneyCheckoutEnabled: false };
});


export { startGuestSession, getGuestSessionStatus, endGuestSession, listGuestPublicRooms, cleanupExpiredGuestSessions } from "./guest-sessions";



// Owner-configurable attendance rewards and platform-managed timed advertisements.
// All balances and reward claims are server-owned; client timestamps are ignored.


const ATTENDANCE_REWARD_POLICY = db.doc("platformSettings/attendanceRewards");

export const setAttendanceRewardPolicy = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let policy;
  try {
    policy = validateAttendanceRewardPolicy(request.data?.policy);
  } catch {
    throw new HttpsError("invalid-argument", "سياسة مكافآت الحضور غير صالحة.");
  }
  const version = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ATTENDANCE_REWARD_POLICY);
    const nextVersion = (Number.isSafeInteger(previous.data()?.version)
      ? previous.data()!.version : 0) + 1;
    const now = FieldValue.serverTimestamp();
    transaction.set(ATTENDANCE_REWARD_POLICY, {
      policy, version: nextVersion, updatedAt: now, updatedBy: actorUid,
      createdAt: previous.data()?.createdAt ?? now,
    });
    return nextVersion;
  });
  await appendOwnerReviewAuditEvent({
    actorUid, action: "attendance_reward_policy_updated", version,
    policy, outcome: "success",
  });
  return { saved: true, version, policy };
});

export const claimAttendanceReward = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const requestedType = request.data?.type;
  if (requestedType !== "hourly" && requestedType !== "daily" && requestedType !== "weekly") {
    throw new HttpsError("invalid-argument", "نوع مكافأة الحضور غير صالح.");
  }
  const type = requestedType as AttendanceRewardType;
  const firebaseIdentity = request.auth?.token.firebase;
  if (firebaseIdentity && typeof firebaseIdentity === "object" &&
      (firebaseIdentity as Record<string, unknown>).sign_in_provider === "anonymous") {
    throw new HttpsError("permission-denied", "مكافآت الحضور مخصصة للأعضاء المسجلين.");
  }
  const nowMs = Date.now();
  const period = utcRewardPeriod(type, nowMs);
  const userRef = db.collection("users").doc(uid);
  const claimId = `${uid}_${type}_${period}`;
  const claimRef = db.collection("attendanceRewardClaims").doc(claimId);
  const ledgerRef = userRef.collection("walletLedger").doc(`attendance_${type}_${period}`);
  return db.runTransaction(async (transaction) => {
    const [userSnapshot, policySnapshot, priorClaim, priorLedger] = await Promise.all([
      transaction.get(userRef), transaction.get(ATTENDANCE_REWARD_POLICY),
      transaction.get(claimRef), transaction.get(ledgerRef),
    ]);
    if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(userSnapshot.data())) {
      throw new HttpsError("permission-denied", "الحساب غير مؤهل لمكافآت الحضور.");
    }
    if (priorClaim.exists || priorLedger.exists) {
      return { claimed: true, idempotentReplay: true, amountCoins: priorClaim.data()?.amountCoins ?? 0, period };
    }
    const storedPolicy = policySnapshot.data()?.policy;
    let policy;
    try {
      policy = storedPolicy ? validateAttendanceRewardPolicy(storedPolicy) : defaultAttendanceRewardPolicy();
    } catch {
      throw new HttpsError("failed-precondition", "سياسة مكافآت الحضور غير صالحة؛ تم إيقاف المطالبة.");
    }
    const rule = policy[type];
    if (!rule.enabled || rule.amountCoins < 1) {
      throw new HttpsError("failed-precondition", "مكافأة هذا النوع غير مفعّلة حالياً.");
    }
    const balance = readSafeInteger(userSnapshot.data()?.coins ?? 0, "coins");
    if (balance < 0 || balance + rule.amountCoins > Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "رصيد المحفظة غير صالح لإضافة المكافأة.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: balance + rule.amountCoins, walletUpdatedAt: now });
    transaction.create(claimRef, {
      uid, type, period, amountCoins: rule.amountCoins,
      policyVersion: policySnapshot.data()?.version ?? 0,
      createdAt: now,
    });
    transaction.create(ledgerRef, {
      type: "attendance_reward", rewardType: type, period,
      direction: "credit", amount: rule.amountCoins,
      balanceBefore: balance, balanceAfter: balance + rule.amountCoins,
      claimId, createdAt: now,
    });
    return { claimed: true, idempotentReplay: false, amountCoins: rule.amountCoins, period };
  });
});

export const setTimedAdCampaign = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let input;
  try {
    input = validateTimedAdCampaignInput(request.data);
  } catch {
    throw new HttpsError("invalid-argument", "بيانات الحملة الإعلانية غير صالحة.");
  }
  const requestedId = request.data?.campaignId;
  if (requestedId !== undefined &&
      (typeof requestedId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(requestedId))) {
    throw new HttpsError("invalid-argument", "معرف الحملة غير صالح.");
  }
  const mediaId = request.data?.mediaId;
  if (mediaId !== undefined &&
      (typeof mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(mediaId))) {
    throw new HttpsError("invalid-argument", "معرف مادة الإعلان غير صالح.");
  }
  const campaignRef = requestedId
    ? db.collection("timedAdCampaigns").doc(requestedId)
    : db.collection("timedAdCampaigns").doc(randomUUID());
  const mediaRef = typeof mediaId === "string" ? db.collection("mediaAssets").doc(mediaId) : null;
  const result = await db.runTransaction(async (transaction) => {
    const [previous, mediaSnapshot] = await Promise.all([
      transaction.get(campaignRef),
      mediaRef ? transaction.get(mediaRef) : Promise.resolve(null),
    ]);
    if (previous.exists && !["draft", "paused"].includes(String(previous.data()?.status))) {
      throw new HttpsError("failed-precondition", "أوقف الحملة قبل تعديل إعداداتها.");
    }
    if (previous.exists && Number(previous.data()?.reservedRewardCoins ?? 0) > 0) {
      throw new HttpsError("failed-precondition", "انتظر انتهاء جلسات المشاهدة النشطة قبل تعديل ميزانية أو مكافأة الحملة.");
    }
    let creativeType = "text";
    let creativeContentType: string | null = null;
    if (mediaRef && mediaSnapshot?.exists) {
      const media = mediaSnapshot.data()!;
      if (media.ownerUid !== actorUid || media.uploaderRole !== "platform_owner" ||
          media.mediaPurpose !== "advertisement" || media.status !== "security_approved" ||
          !["image", "video"].includes(String(media.mediaCategory))) {
        throw new HttpsError("failed-precondition", "مادة الإعلان يجب أن تكون مرفوعة من المالك واجتازت الفحص الأمني.");
      }
      creativeType = media.mediaCategory === "video"
        ? "video" : media.detectedContentType === "image/gif" ? "gif" : "image";
      creativeContentType = String(media.detectedContentType ?? media.declaredContentType);
    } else if (mediaRef) {
      throw new HttpsError("not-found", "مادة الإعلان غير موجودة.");
    }
    const previousVersion = previous.exists ? (previous.data()?.version ?? 0) : 0;
    if (!Number.isSafeInteger(previousVersion) || previousVersion < 0 ||
        previousVersion >= Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "إصدار الحملة السابق غير صالح؛ أوقفنا التحديث.");
    }
    const version = previousVersion + 1;
    const now = FieldValue.serverTimestamp();
    const campaignSnapshot = {
      ...input, campaignId: campaignRef.id, creativeType,
      mediaId: mediaId ?? null,
      mediaOwnerUid: mediaId ? actorUid : null,
      creativeContentType,
      status: previous.exists ? previous.data()?.status : "draft",
      version, spentRewardCoins: previous.data()?.spentRewardCoins ?? 0,
      reservedRewardCoins: previous.data()?.reservedRewardCoins ?? 0,
      createdAt: previous.data()?.createdAt ?? now,
      createdBy: previous.data()?.createdBy ?? actorUid,
      updatedAt: now, updatedBy: actorUid,
    };
    transaction.set(campaignRef, campaignSnapshot);
    const campaignVersionRef = db.collection("timedAdCampaignVersions")
      .doc(campaignRef.id).collection("versions").doc(String(version));
    transaction.create(campaignVersionRef, {
      ...campaignSnapshot,
      snapshotAt: now,
      snapshotBy: actorUid,
    });
    return { campaignId: campaignRef.id, version, status: campaignSnapshot.status, creativeType };
  });
  await appendOwnerReviewAuditEvent({
    actorUid, action: "timed_ad_campaign_saved", ...result, outcome: "success",
  });
  return result;
});

/**
 * Owner-recorded featured-ad finance events. This records receipts/refunds/
 * reconciliation only; it never publishes or activates an advertising campaign.
 */
export const recordFeaturedAdFinancialEvent = onCall(async (request) => {
  const actorUid = requireOwner(request);
  let event;
  try {
    event = validateFeaturedAdFinancialEvent(request.data);
    if (event.currency !== null && currencyExponentForCode(event.currency) === null) {
      throw new Error("UNSUPPORTED_CURRENCY");
    }
  } catch {
    throw new HttpsError("invalid-argument", "بيانات الحركة المالية الإعلانية أو عملتها غير صالحة.");
  }
  const campaignRef = db.collection("timedAdCampaigns").doc(event.campaignId);
  const financialRef = db.collection("featuredAdFinancials").doc(event.campaignId);
  const eventId = featuredAdFinancialIdempotencyId(
    event.campaignId, event.action, event.externalReference!,
  );
  const eventRef = financialRef.collection("events").doc(eventId);
  const auditRef = db.collection("adminAuditLogs").doc("featured_ad_finance_" + eventId);

  return db.runTransaction(async (transaction) => {
    const [campaign, financial, priorEvent, audit, paymentSettings] = await Promise.all([
      transaction.get(campaignRef), transaction.get(financialRef),
      transaction.get(eventRef), transaction.get(auditRef),
      transaction.get(ECONOMY_PRICING_SETTINGS),
    ]);
    if (!campaign.exists) throw new HttpsError("not-found", "الحملة الإعلانية غير موجودة.");

    const currentData = financial.data() ?? {};
    const currentVersion = financial.exists ? currentData.version : 0;
    if (financial.exists) {
      if (!Number.isSafeInteger(currentVersion) || currentVersion < 1 ||
          typeof currentData.lastEventId !== "string" ||
          typeof currentData.currentVersionPath !== "string") {
        throw new HttpsError("failed-precondition", "مؤشر السجل المالي الإعلاني غير صالح.");
      }
      const currentVersionRef = db.collection("featuredAdFinancialVersions").doc(event.campaignId)
        .collection("versions").doc(String(currentVersion));
      const currentVersionSnapshot = await transaction.get(currentVersionRef);
      const currentVersionData = currentVersionSnapshot.data() ?? {};
      if (!currentVersionSnapshot.exists ||
          currentData.currentVersionPath !== currentVersionRef.path ||
          currentVersionData.version !== currentVersion ||
          currentVersionData.lastEventId !== currentData.lastEventId ||
          currentVersionData.currency !== currentData.currency ||
          currentVersionData.receivedMinor !== currentData.receivedMinor ||
          currentVersionData.refundedMinor !== currentData.refundedMinor ||
          currentVersionData.reconciledMinor !== currentData.reconciledMinor ||
          currentVersionData.reviewStatus !== currentData.reviewStatus ||
          currentVersionData.paymentStatus !== currentData.paymentStatus ||
          currentVersionData.currencyExponent !== (currentData.currency === null
            ? null : currencyExponentForCode(currentData.currency))) {
        throw new HttpsError("failed-precondition", "لقطة السجل المالي لا تطابق إصدارها المحفوظ.");
      }
    }

    if (priorEvent.exists) {
      const prior = priorEvent.data() ?? {};
      const matches = prior.actorUid === actorUid &&
        prior.idempotencyKey === event.idempotencyKey &&
        prior.campaignId === event.campaignId && prior.eventId === eventId &&
        prior.action === event.action && prior.amountMinor === event.amountMinor &&
        prior.currency === event.currency && prior.externalReference === event.externalReference &&
        prior.evidenceReference === event.evidenceReference && prior.note === event.note &&
        prior.reviewOutcome === event.reviewOutcome;
      if (!matches || !financial.exists || !audit.exists ||
          !Number.isSafeInteger(prior.snapshotVersion) || prior.snapshotVersion < 1 ||
          currentVersion < prior.snapshotVersion) {
        throw new HttpsError("failed-precondition", "الحركة المالية السابقة تفتقد أدلة الإصدار أو سجل التدقيق.");
      }
      const priorVersionRef = db.collection("featuredAdFinancialVersions").doc(event.campaignId)
        .collection("versions").doc(String(prior.snapshotVersion));
      const priorVersionSnapshot = await transaction.get(priorVersionRef);
      const priorVersion = priorVersionSnapshot.data() ?? {};
      const auditData = audit.data() ?? {};
      const priorExponent = prior.currency === null ? null : currencyExponentForCode(prior.currency);
      if (!priorVersionSnapshot.exists ||
          priorVersion.version !== prior.snapshotVersion ||
          priorVersion.lastEventId !== eventId ||
          priorVersion.currency !== prior.currency ||
          priorVersion.receivedMinor !== prior.receivedMinor ||
          priorVersion.refundedMinor !== prior.refundedMinor ||
          priorVersion.reconciledMinor !== prior.reconciledMinor ||
          priorVersion.reviewStatus !== prior.reviewStatus ||
          priorVersion.paymentStatus !== prior.paymentStatus ||
          priorVersion.currencyExponent !== priorExponent ||
          JSON.stringify(priorVersion.paymentPolicySnapshot ?? null) !==
            JSON.stringify(prior.paymentPolicySnapshot ?? null) ||
          prior.currencyExponent !== priorExponent ||
          auditData.actorUid !== actorUid ||
          auditData.action !== "featured_ad_financial_event_recorded" ||
          auditData.campaignId !== event.campaignId ||
          auditData.eventId !== eventId ||
          auditData.eventType !== event.action ||
          auditData.amountMinor !== event.amountMinor ||
          auditData.currency !== event.currency ||
          auditData.currencyExponent !== priorExponent ||
          auditData.externalReference !== event.externalReference ||
          auditData.snapshotVersion !== prior.snapshotVersion ||
          JSON.stringify(auditData.paymentPolicySnapshot ?? null) !==
            JSON.stringify(prior.paymentPolicySnapshot ?? null)) {
        throw new HttpsError("failed-precondition", "الحركة المالية لا تطابق نسخة السجل وسجل التدقيق.");
      }
      return {
        campaignId: event.campaignId, eventId,
        snapshot: currentData, version: currentVersion, idempotentReplay: true,
      };
    }

    if (audit.exists) {
      throw new HttpsError("failed-precondition", "يوجد سجل تدقيق مالي دون حركة مقابلة؛ يلزم التدقيق.");
    }
    let paymentPolicySnapshot: Record<string, unknown> | null = null;
    if (event.action === "payment_received") {
      const settings = paymentSettings.data() ?? {};
      const paymentPolicy = projectEconomicPaymentPolicy(settings.paymentPolicy, {
        manualCoinPurchasesEnabled: settings.manualCoinPurchasesEnabled,
        manualFeaturedAdsEnabled: settings.manualFeaturedAdsEnabled,
      });
      if (!paymentSettings.exists || paymentPolicy.featured_ads.manualEnabled !== true ||
          paymentPolicy.featured_ads.automatedEnabled !== false ||
          !Number.isSafeInteger(settings.version) || settings.version < 1) {
        throw new HttpsError("failed-precondition", "استقبال دفعات الإعلانات اليدوي متوقف أو غير مهيأ في سياسة المالك.");
      }
      paymentPolicySnapshot = {
        service: "featured_ads", manualEnabled: true, automatedEnabled: false,
        policyVersion: settings.version,
      };
    }

    const current = financial.exists
      ? {
          currency: currentData.currency,
          receivedMinor: currentData.receivedMinor,
          refundedMinor: currentData.refundedMinor,
          reconciledMinor: currentData.reconciledMinor,
          reviewStatus: currentData.reviewStatus,
          paymentStatus: currentData.paymentStatus,
        }
      : defaultFeaturedAdFinancialSnapshot();
    let next;
    try { next = applyFeaturedAdFinancialEvent(current, event); }
    catch { throw new HttpsError("failed-precondition", "لا تسمح حالة السجل المالي بتطبيق هذه الحركة."); }
    const version = financial.exists ? currentVersion + 1 : 1;
    if (!Number.isSafeInteger(version)) {
      throw new HttpsError("resource-exhausted", "تعذر إنشاء إصدار مالي جديد.");
    }
    const versionRef = db.collection("featuredAdFinancialVersions").doc(event.campaignId)
      .collection("versions").doc(String(version));
    const nextVersionSnapshot = await transaction.get(versionRef);
    if (nextVersionSnapshot.exists) {
      throw new HttpsError("failed-precondition", "إصدار مالي موجود دون مؤشر حالي؛ يلزم التدقيق.");
    }
    const now = FieldValue.serverTimestamp();
    const currencyExponent = event.currency === null ? null : currencyExponentForCode(event.currency);
    transaction.create(versionRef, {
      campaignId: event.campaignId, ...next, version,
      lastEventId: eventId, currencyExponent, paymentPolicySnapshot,
      createdAt: now, createdBy: actorUid,
    });
    transaction.create(eventRef, {
      ...event, ...next, currencyExponent, paymentPolicySnapshot,
      eventId, actorUid, snapshotVersion: version, createdAt: now,
    });
    transaction.set(financialRef, {
      campaignId: event.campaignId, ...next, version,
      lastEventId: eventId, updatedAt: now, updatedBy: actorUid,
      createdAt: currentData.createdAt ?? now,
      currentVersionPath: versionRef.path,
    });
    transaction.create(auditRef, {
      actorUid, action: "featured_ad_financial_event_recorded",
      campaignId: event.campaignId, eventId, eventType: event.action,
      amountMinor: event.amountMinor, currency: event.currency,
      currencyExponent, externalReference: event.externalReference,
      paymentPolicySnapshot, snapshotVersion: version, createdAt: now,
    });
    return { campaignId: event.campaignId, eventId, snapshot: next, version, idempotentReplay: false };
  });
});

export const getOwnerTimedAdCampaigns = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await db.collection("timedAdCampaigns").limit(100).get();
  return {
    campaigns: snapshot.docs.map((doc) => ({ ...doc.data(), campaignId: doc.id })),
  };
});

export const setTimedAdCampaignStatus = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const campaignId = request.data?.campaignId;
  const status = request.data?.status;
  if (typeof campaignId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(campaignId) ||
      !["published", "paused", "archived"].includes(status)) {
    throw new HttpsError("invalid-argument", "طلب تغيير حالة الحملة غير صالح.");
  }
  const campaignRef = db.collection("timedAdCampaigns").doc(campaignId);
  const result = await db.runTransaction(async (transaction) => {
    const campaign = await transaction.get(campaignRef);
    if (!campaign.exists) throw new HttpsError("not-found", "الحملة غير موجودة.");
    const data = campaign.data()!;
    if (data.status === "archived" && status !== "archived") {
      throw new HttpsError("failed-precondition", "لا يمكن إعادة تنشيط حملة مؤرشفة.");
    }
    if (status === "published" && data.placement === "home" && data.adType !== "featured") {
      throw new HttpsError("failed-precondition", "موضع الرئيسية غير منشور حتى اكتمال واجهة العرض واختبارات موضعها؛ استخدم مركز المكافآت حالياً.");
    }
    if (status === "published" && data.adType === "featured" &&
        (!Array.isArray(data.geographicTargets) || data.geographicTargets.length !== 0 ||
         !Number.isSafeInteger(data.maxDailyClaimsPerMember) || data.maxDailyClaimsPerMember < 1 ||
         data.maxDailyClaimsPerMember > 10)) {
      throw new HttpsError("failed-precondition", "الحملة المميزة تتطلب استهدافاً غير جغرافي وحداً يومياً بين 1 و10.");
    }
    if (status === "published" && data.creativeType === "video") {
      throw new HttpsError("failed-precondition", "نشر إعلانات الفيديو متوقف حتى اكتمال مشغل الفيديو واختبارات الأجهزة؛ لا نعرض إعلاناً لا يمكن تشغيله داخل التجربة المقفلة.");
    }
    if (status === "published" &&
        (data.endsAtMs <= Date.now() || data.rewardCoins < 0 ||
         data.rewardBudgetCoins < data.rewardCoins ||
         data.spentRewardCoins + (data.reservedRewardCoins ?? 0) + data.rewardCoins > data.rewardBudgetCoins)) {
      throw new HttpsError("failed-precondition", "لا يمكن نشر حملة منتهية أو تجاوزت ميزانيتها.");
    }
    if (status === "published" && typeof data.mediaId === "string") {
      const media = await transaction.get(db.collection("mediaAssets").doc(data.mediaId));
      const mediaData = media.data();
      if (!media.exists || mediaData?.ownerUid !== data.mediaOwnerUid ||
          mediaData?.uploaderRole !== "platform_owner" ||
          mediaData?.mediaPurpose !== "advertisement" ||
          mediaData?.status !== "security_approved" ||
          !["image", "video"].includes(String(mediaData?.mediaCategory))) {
        throw new HttpsError("failed-precondition", "لا يمكن نشر الحملة قبل اعتماد مادة الإعلان أمنياً.");
      }
    }
    transaction.update(campaignRef, {
      status, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid,
      version: (Number.isSafeInteger(data.version) ? data.version : 0) + 1,
    });
    return { campaignId, status };
  });
  await appendOwnerReviewAuditEvent({
    actorUid, action: "timed_ad_campaign_status_changed", ...result, outcome: "success",
  });
  return result;
});

function normalizeAdGeography(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase().replace(/[\\s_–-]+/g, " ")
    : "";
}

const TIMED_AD_GEOGRAPHY_ALIASES: Record<string, string[]> = {
  all_arab_countries: ["السعودية", "المملكة العربية السعودية", "الإمارات", "الامارات", "الكويت", "قطر", "البحرين", "عمان", "سلطنة عمان", "اليمن", "العراق", "الأردن", "الاردن", "فلسطين", "لبنان", "سوريا", "سورية", "مصر", "السودان", "ليبيا", "تونس", "الجزائر", "المغرب", "موريتانيا", "الصومال", "جيبوتي", "جزر القمر", "saudi arabia", "united arab emirates", "uae", "kuwait", "qatar", "bahrain", "oman", "yemen", "iraq", "jordan", "palestine", "lebanon", "syria", "egypt", "sudan", "libya", "tunisia", "algeria", "morocco", "mauritania", "somalia", "djibouti", "comoros"],
  syria: ["سوريا", "سورية", "syria"],
  lebanon_palestine: ["لبنان", "فلسطين", "lebanon", "palestine"],
  iraq_jordan: ["العراق", "الأردن", "الاردن", "iraq", "jordan"],
  gcc: ["السعودية", "المملكة العربية السعودية", "الإمارات", "الامارات", "الكويت", "قطر", "البحرين", "عمان", "سلطنة عمان", "saudi arabia", "united arab emirates", "uae", "kuwait", "qatar", "bahrain", "oman"],
  egypt: ["مصر", "egypt"],
  tunisia_libya_sudan: ["تونس", "ليبيا", "السودان", "tunisia", "libya", "sudan"],
  algeria_morocco: ["الجزائر", "المغرب", "algeria", "morocco"],
  europe_turkey: ["تركيا", "turkey", "europe", "أوروبا"],
  asia_middle_east: ["آسيا", "الشرق الأوسط", "asia", "middle east"],
};

function memberMatchesTimedAdGeography(
  user: Record<string, unknown>,
  target: string,
): boolean {
  const country = normalizeAdGeography(user.country);
  const region = normalizeAdGeography(user.region);
  const aliases = TIMED_AD_GEOGRAPHY_ALIASES[target] ?? [target];
  const normalizedAliases = aliases.map(normalizeAdGeography);
  return normalizedAliases.includes(country) || normalizedAliases.includes(region);
}

function campaignMatchesTimedAdAudience(
  campaign: Record<string, unknown>,
  user: Record<string, unknown>,
  selectedTarget?: string,
): boolean {
  if ((campaign.adType ?? "standard") === "featured") return true;
  const targets = Array.isArray(campaign.geographicTargets)
    ? campaign.geographicTargets.filter((value): value is string => typeof value === "string")
    : [];
  // Older reward-center campaigns predate the explicit audience field. Keep
  // them readable only as legacy campaigns; every newly typed standard ad
  // must carry an explicit target at validation time.
  if (campaign.adType === undefined && targets.length === 0) return true;
  if (targets.length === 0) return false;
  const allowedByCampaign = selectedTarget
    ? targets.includes(selectedTarget) || targets.includes("all_arab_countries")
    : true;
  if (!allowedByCampaign) return false;
  if (selectedTarget) return memberMatchesTimedAdGeography(user, selectedTarget);
  return targets.some((target) => memberMatchesTimedAdGeography(user, target));
}

export const getActiveTimedAdCampaigns = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const userSnapshot = await db.collection("users").doc(uid).get();
  if (!userSnapshot.exists || userSnapshot.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(userSnapshot.data())) {
    throw new HttpsError("permission-denied", "هذا القسم متاح للأعضاء النشطين فقط.");
  }
  const requestedType = request.data?.adType ?? "standard";
  const selectedTarget = request.data?.geographicTarget;
  if (requestedType !== "standard" && requestedType !== "featured") {
    throw new HttpsError("invalid-argument", "نوع الإعلان المطلوب غير صالح.");
  }
  if (requestedType === "standard" && selectedTarget !== undefined &&
      (typeof selectedTarget !== "string" ||
       !Object.prototype.hasOwnProperty.call(TIMED_AD_GEOGRAPHY_ALIASES, selectedTarget))) {
    throw new HttpsError("invalid-argument", "النطاق الجغرافي المطلوب غير صالح.");
  }
  const now = Date.now();
  const snapshot = await db.collection("timedAdCampaigns")
    .where("status", "==", "published")
    .limit(100).get();
  const campaigns = snapshot.docs
    .filter((doc) => {
      const data = doc.data();
      const type = data.adType ?? "standard";
      const placementMatches = requestedType === "featured"
        ? data.placement === "home"
        : data.placement === "reward_center";
      return type === requestedType && placementMatches &&
        data.startsAtMs <= now && data.endsAtMs > now &&
        data.spentRewardCoins + (data.reservedRewardCoins ?? 0) + data.rewardCoins <= data.rewardBudgetCoins &&
        campaignMatchesTimedAdAudience(data, userSnapshot.data() ?? {}, selectedTarget);
    })
    .map((doc) => {
      const data = doc.data();
      return {
        campaignId: doc.id, title: data.title, sponsorLabel: data.sponsorLabel,
        body: data.body, placement: data.placement, adType: data.adType ?? "standard",
        featuredPlacement: data.featuredPlacement ?? "rotation",
        priorityOrder: data.priorityOrder ?? 0,
        maxDailyClaimsPerMember: data.maxDailyClaimsPerMember ?? null,
        durationSeconds: data.durationSeconds, rewardCoins: data.rewardCoins,
        version: data.version, geographicTargets: data.geographicTargets ?? [],
        mediaId: data.mediaId ?? null, creativeType: data.creativeType ?? "text",
      };
    });
  if (requestedType === "featured") {
    campaigns.sort((left, right) =>
      (left.featuredPlacement === "priority" ? 0 : 1) -
      (right.featuredPlacement === "priority" ? 0 : 1) ||
      left.priorityOrder - right.priorityOrder ||
      left.campaignId.localeCompare(right.campaignId));
  }
  return { campaigns };
});

export const startTimedAdvertisement = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const campaignId = request.data?.campaignId;
  if (typeof campaignId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(campaignId)) {
    throw new HttpsError("invalid-argument", "معرف الحملة غير صالح.");
  }
  const firebaseIdentity = request.auth?.token.firebase;
  if (firebaseIdentity && typeof firebaseIdentity === "object" &&
      (firebaseIdentity as Record<string, unknown>).sign_in_provider === "anonymous") {
    throw new HttpsError("permission-denied", "مشاهدة الإعلانات المكافأة مخصصة للأعضاء.");
  }
  const sessionId = randomUUID();
  const nowMs = Date.now();
  const userRef = db.collection("users").doc(uid);
  const campaignRef = db.collection("timedAdCampaigns").doc(campaignId);
  const activeRef = db.collection("activeTimedAdSessions").doc(uid);
  const sessionRef = db.collection("timedAdSessions").doc(sessionId);
  const counterRef = db.collection("timedAdMemberCounters").doc(timedAdMemberCounterId(uid, campaignId));
  const legacyCounterRef = db.collection("timedAdMemberCounters").doc(`${uid}_${campaignId}`);
  const result = await db.runTransaction(async (transaction) => {
    let releasedFromCurrentCampaign = 0;
    const [user, campaign, active, counter, legacyCounter] = await Promise.all([
      transaction.get(userRef), transaction.get(campaignRef),
      transaction.get(activeRef), transaction.get(counterRef),
      transaction.get(legacyCounterRef),
    ]);
    if (!user.exists || user.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(user.data())) {
      throw new HttpsError("permission-denied", "الحساب غير مؤهل لمشاهدة الإعلانات.");
    }
    if (active.exists) {
      const activeSession = await transaction.get(db.collection("timedAdSessions").doc(String(active.data()?.sessionId ?? "")));
      if (activeSession.exists &&
          ["active", "paused"].includes(String(activeSession.data()?.status))) {
        if (activeSession.data()?.expiresAtMs > nowMs) {
          throw new HttpsError("already-exists", "لديك جلسة إعلان مفتوحة بالفعل.");
        }
        const expiredData = activeSession.data()!;
        const expiredCampaignRef = db.collection("timedAdCampaigns").doc(String(expiredData.campaignId));
        const expiredCampaign = await transaction.get(expiredCampaignRef);
        if (expiredCampaign.exists) {
          const reserved = readSafeInteger(expiredCampaign.data()?.reservedRewardCoins ?? 0, "reservedRewardCoins");
          const reward = readSafeInteger(expiredData.rewardCoins, "rewardCoins");
          if (expiredData.campaignId === campaignId) {
            releasedFromCurrentCampaign = reward;
          } else {
            transaction.update(expiredCampaignRef, {
              reservedRewardCoins: Math.max(0, reserved - reward),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        transaction.update(activeSession.ref, {
          status: "expired", lastHeartbeatAtMs: null,
          expiredAt: FieldValue.serverTimestamp(),
        });
      }
    }
    if (!campaign.exists) throw new HttpsError("not-found", "الحملة غير موجودة.");
    const data = campaign.data()!;
    const requestedAdType = request.data?.adType;
    if (requestedAdType !== undefined && requestedAdType !== (data.adType ?? "standard")) {
      throw new HttpsError("failed-precondition", "نوع الحملة لا يطابق مشغل الإعلان المطلوب.");
    }
    if ((data.adType ?? "standard") === "standard" &&
        data.adType !== undefined &&
        (!Array.isArray(data.geographicTargets) || data.geographicTargets.length === 0 ||
         !data.geographicTargets.some((target: string) =>
           memberMatchesTimedAdGeography(user.data() ?? {}, target)))) {
      throw new HttpsError("permission-denied", "هذه الحملة غير موجهة إلى النطاق الجغرافي المسجل في حسابك.");
    }
    const availableReservation = Math.max(0, (data.reservedRewardCoins ?? 0) - releasedFromCurrentCampaign);
    if (data.status !== "published" || data.startsAtMs > nowMs || data.endsAtMs <= nowMs ||
        data.spentRewardCoins + availableReservation + data.rewardCoins > data.rewardBudgetCoins) {
      throw new HttpsError("failed-precondition", "الحملة غير متاحة حالياً.");
    }
    if (typeof data.mediaId === "string") {
      const media = await transaction.get(db.collection("mediaAssets").doc(data.mediaId));
      const mediaData = media.data();
      if (!media.exists || mediaData?.ownerUid !== data.mediaOwnerUid ||
          mediaData?.uploaderRole !== "platform_owner" ||
          mediaData?.mediaPurpose !== "advertisement" ||
          mediaData?.status !== "security_approved" ||
          !["image", "video"].includes(String(mediaData?.mediaCategory))) {
        throw new HttpsError("failed-precondition", "مادة الإعلان لم تعد مؤهلة للعرض.");
      }
    }
    const counterData = counter.data() ?? {};
    if (counter.exists && (counterData.uid !== uid || counterData.campaignId !== campaignId)) {
      throw new HttpsError("data-loss", "عداد مكافآت الحملة مرتبط بهوية غير متطابقة.");
    }
    const currentClaims = counter.exists ? readSafeInteger(counterData.claimCount, "claimCount") : 0;
    // Legacy concatenated IDs are retained as a conservative migration floor.
    // Their ambiguous historical ownership may deny an extra claim, never grant one.
    const legacyClaims = legacyCounter.exists
      ? readSafeInteger(legacyCounter.data()?.claimCount, "legacyClaimCount") : 0;
    const claims = Math.max(currentClaims, legacyClaims);
    const utcDay = new Date(nowMs).toISOString().slice(0, 10);
    const dailyClaims = counterData.utcDay === utcDay
      ? readSafeInteger(counterData.dailyClaimCount ?? 0, "dailyClaimCount") : 0;
    if (claims >= data.maxClaimsPerMember ||
        ((data.adType ?? "standard") === "featured" &&
         dailyClaims >= data.maxDailyClaimsPerMember)) {
      throw new HttpsError("failed-precondition", "تم بلوغ الحد المسموح لمشاهدة هذه الحملة.");
    }
    const expiresAtMs = Math.min(data.endsAtMs, nowMs + data.durationSeconds * 4000 + 60000);
    transaction.create(sessionRef, {
      sessionId, uid, campaignId, campaignVersion: data.version,
      durationSeconds: data.durationSeconds, rewardCoins: data.rewardCoins,
      adType: data.adType ?? "standard",
      eligibleMs: 0, heartbeatSequence: 0, lastHeartbeatAtMs: null,
      status: "active", startedAt: FieldValue.serverTimestamp(),
      startedAtMs: nowMs, expiresAtMs,
    });
    transaction.update(campaignRef, {
      reservedRewardCoins: availableReservation + data.rewardCoins,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(activeRef, { sessionId, campaignId, expiresAtMs, updatedAt: FieldValue.serverTimestamp() });
    return {
      sessionId, campaignId, durationSeconds: data.durationSeconds,
      rewardCoins: data.rewardCoins, adType: data.adType ?? "standard",
      expiresAtMs, heartbeatIntervalMs: 5000,
      title: data.title, sponsorLabel: data.sponsorLabel, body: data.body,
      mediaId: data.mediaId ?? null, creativeType: data.creativeType ?? "text",
    };
  });
  return result;
});

export const getActiveTimedAdSession = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const active = await db.collection("activeTimedAdSessions").doc(uid).get();
  if (!active.exists || typeof active.data()?.sessionId !== "string") return { active: false };
  const sessionId = active.data()!.sessionId as string;
  const session = await db.collection("timedAdSessions").doc(sessionId).get();
  if (!session.exists || session.data()?.uid !== uid ||
      !["active", "paused"].includes(String(session.data()?.status)) ||
      session.data()?.expiresAtMs <= Date.now()) return { active: false };
  const data = session.data()!;
  const campaign = await db.collection("timedAdCampaigns").doc(String(data.campaignId)).get();
  return {
    active: true, sessionId, campaignId: data.campaignId,
    durationSeconds: data.durationSeconds, rewardCoins: data.rewardCoins,
    adType: data.adType ?? "standard",
    expiresAtMs: data.expiresAtMs, heartbeatSequence: data.heartbeatSequence,
    eligibleMs: data.eligibleMs, status: data.status,
    title: campaign.data()?.title ?? "إعلان",
    sponsorLabel: campaign.data()?.sponsorLabel ?? "",
    body: campaign.data()?.body ?? "",
    mediaId: campaign.data()?.mediaId ?? null,
    creativeType: campaign.data()?.creativeType ?? "text",
  };
});

export const heartbeatTimedAdvertisement = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const sessionId = request.data?.sessionId;
  const sequence = request.data?.sequence;
  const foreground = request.data?.foreground;
  const visible = request.data?.visible;
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId) ||
      typeof sequence !== "number" || !Number.isSafeInteger(sequence) ||
      typeof foreground !== "boolean" || typeof visible !== "boolean") {
    throw new HttpsError("invalid-argument", "نبضة مشاهدة الإعلان غير صالحة.");
  }
  const sessionRef = db.collection("timedAdSessions").doc(sessionId);
  const activeRef = db.collection("activeTimedAdSessions").doc(uid);
  const result = await db.runTransaction(async (transaction) => {
    const [session, active] = await Promise.all([
      transaction.get(sessionRef), transaction.get(activeRef),
    ]);
    if (!session.exists || session.data()?.uid !== uid ||
        active.data()?.sessionId !== sessionId ||
        !["active", "paused"].includes(String(session.data()?.status))) {
      throw new HttpsError("failed-precondition", "جلسة مشاهدة الإعلان غير نشطة.");
    }
    const data = session.data()!;
    const nowMs = Date.now();
    if (data.expiresAtMs <= nowMs) {
      const campaignRef = db.collection("timedAdCampaigns").doc(String(data.campaignId));
      const campaign = await transaction.get(campaignRef);
      if (campaign.exists) {
        const reserved = readSafeInteger(campaign.data()?.reservedRewardCoins ?? 0, "reservedRewardCoins");
        const reward = readSafeInteger(data.rewardCoins, "rewardCoins");
        transaction.update(campaignRef, {
          reservedRewardCoins: Math.max(0, reserved - reward),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.update(sessionRef, {
        status: "expired", lastHeartbeatAtMs: null,
        expiredAt: FieldValue.serverTimestamp(),
      });
      transaction.delete(activeRef);
      return { expired: true, eligibleMs: data.eligibleMs, requiredMs: data.durationSeconds * 1000, remainingMs: 0, paused: true };
    }
    let delta;
    try {
      delta = eligibleHeartbeatDelta(
        data.status === "paused" ? null : data.lastHeartbeatAtMs,
        nowMs, sequence, data.heartbeatSequence + 1, foreground, visible,
      );
    } catch {
      throw new HttpsError("failed-precondition", "تسلسل نبضات مشاهدة الإعلان غير صالح.");
    }
    const paused = !foreground || !visible || delta.paused;
    transaction.update(sessionRef, {
      eligibleMs: data.eligibleMs + delta.deltaMs,
      heartbeatSequence: delta.nextSequence - 1,
      lastHeartbeatAtMs: paused ? null : delta.nextHeartbeatAtMs,
      status: paused ? "paused" : "active",
      lastHeartbeatAt: FieldValue.serverTimestamp(),
    });
    return {
      expired: false,
      eligibleMs: data.eligibleMs + delta.deltaMs,
      requiredMs: data.durationSeconds * 1000,
      remainingMs: Math.max(0, data.durationSeconds * 1000 - data.eligibleMs - delta.deltaMs),
      paused,
    };
  });
  if (result.expired) {
    throw new HttpsError("deadline-exceeded", "انتهت جلسة مشاهدة الإعلان.");
  }
  return result;
});

export const completeTimedAdvertisement = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const sessionId = request.data?.sessionId;
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    throw new HttpsError("invalid-argument", "معرف جلسة الإعلان غير صالح.");
  }
  const sessionRef = db.collection("timedAdSessions").doc(sessionId);
  const result = await db.runTransaction(async (transaction) => {
    const session = await transaction.get(sessionRef);
    if (!session.exists || session.data()?.uid !== uid) {
      throw new HttpsError("not-found", "جلسة الإعلان غير موجودة.");
    }
    const data = session.data()!;
    const claimRef = db.collection("timedAdRewardClaims").doc(sessionId);
    const userRef = db.collection("users").doc(uid);
    const campaignRef = db.collection("timedAdCampaigns").doc(data.campaignId);
    const activeRef = db.collection("activeTimedAdSessions").doc(uid);
    const counterRef = db.collection("timedAdMemberCounters").doc(timedAdMemberCounterId(uid, data.campaignId));
    const legacyCounterRef = db.collection("timedAdMemberCounters").doc(`${uid}_${data.campaignId}`);
    const [claim, user, campaign, active, counter, legacyCounter] = await Promise.all([
      transaction.get(claimRef), transaction.get(userRef), transaction.get(campaignRef),
      transaction.get(activeRef), transaction.get(counterRef), transaction.get(legacyCounterRef),
    ]);
    const campaignMediaId = campaign.data()?.mediaId;
    const campaignMedia = typeof campaignMediaId === "string"
      ? await transaction.get(db.collection("mediaAssets").doc(campaignMediaId))
      : null;
    if (claim.exists) {
      return { completed: true, idempotentReplay: true, cancelled: false, reason: null, amountCoins: claim.data()?.amountCoins ?? 0 };
    }
    if (!["active", "paused"].includes(String(data.status)) ||
        active.data()?.sessionId !== sessionId) {
      throw new HttpsError("failed-precondition", "جلسة المشاهدة لم تعد نشطة.");
    }
    if (data.eligibleMs < data.durationSeconds * 1000) {
      throw new HttpsError("failed-precondition", "لم تكتمل مدة المشاهدة الفعلية المطلوبة.");
    }
    const cancelSession = (reason: "expired" | "ineligible" | "creative_revoked") => {
      if (campaign.exists) {
        const reserved = readSafeInteger(campaign.data()?.reservedRewardCoins ?? 0, "reservedRewardCoins");
        const reward = readSafeInteger(data.rewardCoins, "rewardCoins");
        transaction.update(campaignRef, {
          reservedRewardCoins: Math.max(0, reserved - reward),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.update(sessionRef, {
        status: "cancelled", lastHeartbeatAtMs: null,
        cancelledAt: FieldValue.serverTimestamp(), cancellationReason: reason,
      });
      transaction.delete(activeRef);
      return { completed: false, cancelled: true, reason };
    };
    if (data.expiresAtMs <= Date.now()) return cancelSession("expired");
    if (!user.exists || user.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(user.data()) || !campaign.exists) {
      return cancelSession("ineligible");
    }
    const campaignData = campaign.data()!;
    if (typeof campaignMediaId === "string") {
      const mediaData = campaignMedia?.data();
      if (!campaignMedia?.exists || mediaData?.ownerUid !== campaignData.mediaOwnerUid ||
          mediaData?.uploaderRole !== "platform_owner" ||
          mediaData?.mediaPurpose !== "advertisement" ||
          mediaData?.status !== "security_approved") {
        return cancelSession("creative_revoked");
      }
    }
    const spent = readSafeInteger(campaignData.spentRewardCoins ?? 0, "spentRewardCoins");
    const reserved = readSafeInteger(campaignData.reservedRewardCoins ?? 0, "reservedRewardCoins");
    const budget = readSafeInteger(campaignData.rewardBudgetCoins, "rewardBudgetCoins");
    const counterData = counter.data() ?? {};
    if (counter.exists && (counterData.uid !== uid || counterData.campaignId !== data.campaignId)) {
      throw new HttpsError("data-loss", "عداد مكافآت الحملة مرتبط بهوية غير متطابقة.");
    }
    const currentClaims = counter.exists ? readSafeInteger(counterData.claimCount, "claimCount") : 0;
    const legacyClaims = legacyCounter.exists
      ? readSafeInteger(legacyCounter.data()?.claimCount, "legacyClaimCount") : 0;
    const claims = Math.max(currentClaims, legacyClaims);
    const utcDay = new Date().toISOString().slice(0, 10);
    const dailyClaims = counterData.utcDay === utcDay
      ? readSafeInteger(counterData.dailyClaimCount ?? 0, "dailyClaimCount") : 0;
    if (reserved < data.rewardCoins || spent + data.rewardCoins > budget ||
        claims >= campaignData.maxClaimsPerMember ||
        ((campaignData.adType ?? "standard") === "featured" &&
         dailyClaims >= campaignData.maxDailyClaimsPerMember)) {
      throw new HttpsError("resource-exhausted", "انتهت ميزانية الحملة أو الحد المسموح للمكافآت.");
    }
    const balance = readSafeInteger(user.data()?.coins ?? 0, "coins");
    if (balance < 0 || balance + data.rewardCoins > Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "رصيد المحفظة لا يسمح بإضافة المكافأة بأمان.");
    }
    const now = FieldValue.serverTimestamp();
    transaction.update(userRef, { coins: balance + data.rewardCoins, walletUpdatedAt: now });
    transaction.create(claimRef, {
      uid, sessionId, campaignId: data.campaignId,
      campaignVersion: data.campaignVersion, amountCoins: data.rewardCoins,
      eligibleMs: data.eligibleMs, createdAt: now,
    });
    transaction.create(userRef.collection("walletLedger").doc(`timed_ad_${sessionId}`), {
      type: "timed_ad_reward", direction: "credit", amount: data.rewardCoins,
      balanceBefore: balance, balanceAfter: balance + data.rewardCoins,
      campaignId: data.campaignId, sessionId, createdAt: now,
    });
    transaction.update(campaignRef, {
      spentRewardCoins: spent + data.rewardCoins,
      reservedRewardCoins: reserved - data.rewardCoins,
      updatedAt: now,
    });
    transaction.set(counterRef, {
      uid, campaignId: data.campaignId,
      claimCount: claims + 1,
      utcDay, dailyClaimCount: dailyClaims + 1,
      updatedAt: now,
    }, { merge: true });
    transaction.update(sessionRef, { status: "completed", completedAt: now });
    if (active.exists) transaction.delete(activeRef);
    return { completed: true, idempotentReplay: false, cancelled: false, reason: null, amountCoins: data.rewardCoins };
  });
  if (result.cancelled) {
    if (result.reason === "expired") {
      throw new HttpsError("deadline-exceeded", "انتهت جلسة مشاهدة الإعلان وتم تحرير ميزانيتها.");
    }
    if (result.reason === "creative_revoked") {
      throw new HttpsError("failed-precondition", "لم تعد مادة الإعلان معتمدة؛ ألغيت الجلسة دون مكافأة.");
    }
    throw new HttpsError("permission-denied", "الحساب أو الحملة لم تعد مؤهلة؛ ألغيت الجلسة دون مكافأة.");
  }
  return result;
});

export const getRewardCenter = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || user.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(user.data())) {
    throw new HttpsError("permission-denied", "مركز المكافآت متاح للأعضاء النشطين فقط.");
  }
  const now = Date.now();
  const policySnapshot = await ATTENDANCE_REWARD_POLICY.get();
  let policy;
  try {
    policy = policySnapshot.exists
      ? validateAttendanceRewardPolicy(policySnapshot.data()?.policy)
      : defaultAttendanceRewardPolicy();
  } catch {
    throw new HttpsError("failed-precondition", "تعذر قراءة سياسة المكافآت بأمان.");
  }
  const periods = {
    hourly: utcRewardPeriod("hourly", now),
    daily: utcRewardPeriod("daily", now),
    weekly: utcRewardPeriod("weekly", now),
  };
  const [hourly, daily, weekly, ads] = await Promise.all([
    db.collection("attendanceRewardClaims").doc(`${uid}_hourly_${periods.hourly}`).get(),
    db.collection("attendanceRewardClaims").doc(`${uid}_daily_${periods.daily}`).get(),
    db.collection("attendanceRewardClaims").doc(`${uid}_weekly_${periods.weekly}`).get(),
    db.collection("timedAdCampaigns")
      .where("status", "==", "published")
      .where("placement", "==", "reward_center")
      .where("startsAtMs", "<=", now)
      .where("endsAtMs", ">", now)
      .limit(100).get(),
  ]);
  const claims = { hourly: hourly.exists, daily: daily.exists, weekly: weekly.exists };
  return {
    serverTimeMs: now, attendancePolicy: policy, attendancePeriods: periods,
    attendanceClaimed: claims,
    activeCampaigns: ads.docs.filter((doc) =>
      doc.data().placement === "reward_center" &&
      doc.data().adType === undefined &&
      doc.data().startsAtMs <= now && doc.data().endsAtMs > now &&
      doc.data().spentRewardCoins + (doc.data().reservedRewardCoins ?? 0) + doc.data().rewardCoins <= doc.data().rewardBudgetCoins)
      .map((doc) => ({
        campaignId: doc.id, title: doc.data().title,
        sponsorLabel: doc.data().sponsorLabel, body: doc.data().body,
        durationSeconds: doc.data().durationSeconds,
        rewardCoins: doc.data().rewardCoins,
        mediaId: doc.data().mediaId ?? null,
        creativeType: doc.data().creativeType ?? "text",
      })),
  };
});


export const getOwnerAttendanceRewardPolicy = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await ATTENDANCE_REWARD_POLICY.get();
  let policy;
  try {
    policy = snapshot.exists
      ? validateAttendanceRewardPolicy(snapshot.data()?.policy)
      : defaultAttendanceRewardPolicy();
  } catch {
    throw new HttpsError("failed-precondition", "سياسة مكافآت الحضور غير صالحة؛ تم إيقاف التعديل.");
  }
  return { policy, version: snapshot.data()?.version ?? 0 };
});


/** Releases reward-budget reservations for abandoned sessions after their server expiry. */
export const cancelTimedAdvertisement = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const sessionId = request.data?.sessionId;
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    throw new HttpsError("invalid-argument", "معرف جلسة الإعلان غير صالح.");
  }
  const sessionRef = db.collection("timedAdSessions").doc(sessionId);
  return db.runTransaction(async (transaction) => {
    const session = await transaction.get(sessionRef);
    if (!session.exists || session.data()?.uid !== uid) {
      throw new HttpsError("not-found", "جلسة الإعلان غير موجودة.");
    }
    const data = session.data()!;
    if (data.status === "cancelled") return { cancelled: true, idempotentReplay: true };
    if (!["active", "paused"].includes(String(data.status))) {
      throw new HttpsError("failed-precondition", "لا يمكن إلغاء جلسة غير نشطة.");
    }
    const campaignRef = db.collection("timedAdCampaigns").doc(String(data.campaignId));
    const activeRef = db.collection("activeTimedAdSessions").doc(uid);
    const [campaign, active] = await Promise.all([
      transaction.get(campaignRef), transaction.get(activeRef),
    ]);
    if (campaign.exists) {
      const reserved = readSafeInteger(campaign.data()?.reservedRewardCoins ?? 0, "reservedRewardCoins");
      const reward = readSafeInteger(data.rewardCoins, "rewardCoins");
      if (reserved < reward) throw new HttpsError("data-loss", "حجز ميزانية الحملة غير متسق.");
      transaction.update(campaignRef, {
        reservedRewardCoins: reserved - reward,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    transaction.update(sessionRef, {
      status: "cancelled", lastHeartbeatAtMs: null,
      cancelledAt: FieldValue.serverTimestamp(), cancellationReason: "member_cancelled",
    });
    if (active.data()?.sessionId === sessionId) transaction.delete(activeRef);
    return { cancelled: true, idempotentReplay: false };
  });
});

export const getMyTimedAdRewardHistory = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const snapshot = await db.collection("timedAdRewardClaims")
    .where("uid", "==", uid).limit(100).get();
  return {
    claims: snapshot.docs.map((doc) => ({
      claimId: doc.id, ...doc.data(),
    })),
  };
});

export const getOwnerTimedAdCampaignReport = onCall(async (request) => {
  requireOwner(request);
  const campaignId = request.data?.campaignId;
  if (typeof campaignId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(campaignId)) {
    throw new HttpsError("invalid-argument", "معرف الحملة غير صالح.");
  }
  const campaignRef = db.collection("timedAdCampaigns").doc(campaignId);
  const [campaign, financial, claims, sessions, versions] = await Promise.all([
    campaignRef.get(),
    db.collection("featuredAdFinancials").doc(campaignId).get(),
    db.collection("timedAdRewardClaims").where("campaignId", "==", campaignId).limit(500).get(),
    db.collection("timedAdSessions").where("campaignId", "==", campaignId).limit(500).get(),
    db.collection("timedAdCampaignVersions").doc(campaignId).collection("versions").limit(100).get(),
  ]);
  if (!campaign.exists) throw new HttpsError("not-found", "الحملة غير موجودة.");
  const sessionCounts = { active: 0, paused: 0, completed: 0, cancelled: 0, expired: 0 };
  for (const doc of sessions.docs) {
    const status = String(doc.data().status);
    if (Object.prototype.hasOwnProperty.call(sessionCounts, status)) {
      sessionCounts[status as keyof typeof sessionCounts] += 1;
    }
  }
  return {
    campaign: { campaignId, ...campaign.data() },
    financialSnapshot: financial.exists ? financial.data() : null,
    rewardClaims: claims.docs.map((doc) => ({ claimId: doc.id, ...doc.data() })),
    sessionCounts,
    totalRewardCoins: claims.docs.reduce((sum, doc) => sum + Number(doc.data().amountCoins ?? 0), 0),
    versionCount: versions.size,
  };
});

export const runExpiredTimedAdSessionSweep = async (nowMs = Date.now()) => {
  const candidates = await db.collection("timedAdSessions")
    .where("status", "in", ["active", "paused"])
    .where("expiresAtMs", "<=", nowMs)
    .orderBy("expiresAtMs", "asc")
    .limit(250)
    .get();
  let cleaned = 0;
  for (const candidate of candidates.docs) {
    if (!Number.isSafeInteger(candidate.data().expiresAtMs) ||
        candidate.data().expiresAtMs > nowMs) continue;
    const wasCleaned = await db.runTransaction(async (transaction) => {
      const session = await transaction.get(candidate.ref);
      if (!session.exists ||
          !["active", "paused"].includes(String(session.data()?.status)) ||
          !Number.isSafeInteger(session.data()?.expiresAtMs) ||
          session.data()!.expiresAtMs > nowMs) return false;
      const data = session.data()!;
      const campaignRef = db.collection("timedAdCampaigns").doc(String(data.campaignId));
      const activeRef = db.collection("activeTimedAdSessions").doc(String(data.uid));
      const [campaign, active] = await Promise.all([
        transaction.get(campaignRef), transaction.get(activeRef),
      ]);
      if (campaign.exists) {
        const reserved = readSafeInteger(campaign.data()?.reservedRewardCoins ?? 0, "reservedRewardCoins");
        const reward = readSafeInteger(data.rewardCoins, "rewardCoins");
        transaction.update(campaignRef, {
          reservedRewardCoins: Math.max(0, reserved - reward),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.update(candidate.ref, {
        status: "expired", lastHeartbeatAtMs: null,
        expiredAt: FieldValue.serverTimestamp(),
      });
      if (active.data()?.sessionId === candidate.id) transaction.delete(activeRef);
      return true;
    });
    if (wasCleaned) cleaned += 1;
  }
  logger.info("Expired timed-ad sessions cleaned", { inspected: candidates.size, cleaned });
  return { inspected: candidates.size, cleaned };
};

export const cleanupExpiredTimedAdSessions = onSchedule("every 15 minutes", async () => {
  await runExpiredTimedAdSessionSweep();
});


/**
 * Creates a private creator/influencer proposal. This is intake only:
 * it does not approve content, create a campaign, reserve inventory,
 * publish an advertisement, or issue any reward/payment.
 *
 * Uploaded-media intake is intentionally not exposed until it can be bound
 * to the existing secure media quarantine/scanning pipeline.
 */
export const submitCreatorProposal = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
    const actorUid = requireAuthenticatedUid(request.auth?.uid);
    if (request.auth?.token.email_verified !== true) {
      throw new HttpsError("permission-denied", "يجب توثيق البريد الإلكتروني قبل تقديم المقترح.");
    }
    let payload;
    try {
      payload = validateCreatorProposalInput(request.data);
    } catch (error) {
      if (error instanceof CreatorProposalValidationError) {
        throw new HttpsError("invalid-argument", error.code);
      }
      throw error;
    }

    const payloadHash = createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
    const idempotencyRef = db.collection("creatorProposalIdempotency")
      .doc(`${actorUid}_${payload.idempotencyKey}`);
    const proposalRef = db.collection("creatorProposals").doc();
    const auditRef = db.collection("adminAuditLogs").doc();

    return db.runTransaction(async (transaction) => {
      const existing = await transaction.get(idempotencyRef);
      if (existing.exists) {
        const prior = existing.data() ?? {};
        if (prior.payloadHash !== payloadHash) {
          throw new HttpsError(
            "already-exists",
            "مفتاح الطلب مستخدم مسبقاً مع بيانات مختلفة.",
          );
        }
        return {
          requestId: String(prior.proposalId),
          status: "submitted_pending_review",
          duplicate: true,
        };
      }

      const headSnapshot = await transaction.get(OWNER_REVIEW_AUDIT_HEAD);
      const head = headSnapshot.data() ?? {};
      const previousSequence = headSnapshot.exists ? head.sequence : 0;
      const previousHash = headSnapshot.exists ? head.eventHash : "GENESIS";
      if (!Number.isSafeInteger(previousSequence) || previousSequence < 0 ||
          typeof previousHash !== "string" ||
          !(previousHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousHash))) {
        throw new HttpsError("internal", "سجل التدقيق غير متاح حالياً.");
      }

      const event = {
        actorUid,
        action: "creator_proposal_submitted",
        outcome: "success",
        proposalId: proposalRef.id,
        sourceType: payload.sourceType,
        targetGeographies: payload.targetGeographies,
        requestVersion: 1,
      };
      const sequence = previousSequence + 1;
      const eventHash = calculateOwnerAuditHash(event, sequence, previousHash);

      transaction.create(proposalRef, {
        ...payload,
        creatorUid: actorUid,
        status: "submitted_pending_review",
        requestVersion: 1,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(idempotencyRef, {
        actorUid,
        payloadHash,
        proposalId: proposalRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });
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

      return {
        requestId: proposalRef.id,
        status: "submitted_pending_review",
        duplicate: false,
      };
    });
  },
);


// Web-only intake for Mawdda Visual & Advertising Production membership.
// Submission is an application only; it never grants a role or room-creation permission.
const PRODUCTION_APPLICATIONS = db.collection("productionApplications");

export const submitProductionApplication = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
    const actorUid = requireAuthenticatedUid(request.auth?.uid);
    if (request.auth?.token.email_verified !== true) {
      throw new HttpsError("permission-denied", "يجب توثيق البريد الإلكتروني قبل تقديم طلب صُنّاع مودة.");
    }
    let payload;
    try {
      payload = validateProductionApplication(request.data);
    } catch (error) {
      if (error instanceof ProductionApplicationValidationError) {
        throw new HttpsError("invalid-argument", error.code);
      }
      throw error;
    }
    const { idempotencyKey, ...storedPayload } = payload;
    const payloadHash = createHash("sha256").update(JSON.stringify(storedPayload)).digest("hex");
    const keyHash = createHash("sha256").update(actorUid + "|" + idempotencyKey).digest("hex");
    const idempotencyRef = db.collection("productionApplicationIdempotency").doc(keyHash);
    const applicationRef = PRODUCTION_APPLICATIONS.doc();
    const result = await db.runTransaction(async (transaction) => {
      const prior = await transaction.get(idempotencyRef);
      if (prior.exists) {
        const data = prior.data() ?? {};
        if (data.payloadHash !== payloadHash || typeof data.applicationId !== "string") {
          throw new HttpsError("already-exists", "مفتاح الطلب مستخدم مع بيانات مختلفة.");
        }
        return { applicationId: data.applicationId as string, duplicate: true };
      }
      transaction.create(applicationRef, {
        ...storedPayload,
        applicantUid: actorUid,
        status: "submitted_pending_review",
        applicationVersion: 1,
        roleActivated: false,
        roomCreationPermission: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(idempotencyRef, {
        applicantUid: actorUid,
        payloadHash,
        applicationId: applicationRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { applicationId: applicationRef.id, duplicate: false };
    });
    await appendOwnerReviewAuditEvent({
      actorUid,
      action: "production_application_submitted",
      applicationId: result.applicationId,
      requestedTrack: payload.requestedTrack,
      specialties: payload.specialties,
      outcome: "success",
    }, "production_application_submitted_" + result.applicationId);
    return {
      applicationId: result.applicationId,
      status: "submitted_pending_review",
      duplicate: result.duplicate,
      roleActivated: false,
      roomCreationPermission: false,
    };
  },
);

export const listOwnerProductionApplications = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
    requireOwner(request);
    const limit = Number.isSafeInteger(request.data?.limit)
      ? Math.max(1, Math.min(100, request.data.limit as number)) : 50;
    const snapshot = await PRODUCTION_APPLICATIONS.orderBy("createdAt", "desc")
      .limit(limit).get();
    return {
      applications: snapshot.docs.map((doc) => ({
        applicationId: doc.id,
        ...doc.data(),
      })),
    };
  },
);

export const reviewOwnerProductionApplication = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
    const actorUid = requireOwner(request);
    const applicationId = typeof request.data?.applicationId === "string"
      ? request.data.applicationId.trim() : "";
    const expectedVersion = request.data?.expectedVersion;
    const nextStatus = request.data?.nextStatus;
    const note = typeof request.data?.note === "string" ? request.data.note.trim() : "";
    const allowed = ["under_review", "correction_requested", "accepted_pending_contract", "rejected", "closed"];
    if (!/^[A-Za-z0-9_-]{16,100}$/.test(applicationId) ||
        !Number.isSafeInteger(expectedVersion) || (expectedVersion as number) < 1 ||
        typeof nextStatus !== "string" || !allowed.includes(nextStatus) ||
        note.length < 5 || note.length > 1500) {
      throw new HttpsError("invalid-argument", "بيانات مراجعة طلب صُنّاع مودة غير مكتملة.");
    }
    const ref = PRODUCTION_APPLICATIONS.doc(applicationId);
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new HttpsError("not-found", "الطلب غير موجود.");
      const data = snapshot.data()!;
      if (data.applicationVersion !== expectedVersion) {
        throw new HttpsError("aborted", "تغير الطلب؛ أعد تحميله قبل المراجعة.");
      }
      const transitions: Record<string, readonly string[]> = {
        submitted_pending_review: ["under_review", "rejected", "closed"],
        under_review: ["correction_requested", "accepted_pending_contract", "rejected", "closed"],
        correction_requested: ["under_review", "rejected", "closed"],
        accepted_pending_contract: ["closed"],
      };
      if (!(transitions[data.status] ?? []).includes(nextStatus)) {
        throw new HttpsError("failed-precondition", "انتقال حالة الطلب غير مسموح.");
      }
      const version = (data.applicationVersion as number) + 1;
      // Stage the immutable owner audit event in this same transaction. A
      // deterministic ID makes retries safe, while the shared chain head
      // serializes concurrent audit writers without leaving an unaudited review.
      const auditEvent = {
        actorUid,
        action: "production_application_reviewed",
        applicationId,
        status: nextStatus,
        applicationVersion: version,
        note,
        outcome: "success",
      };
      const auditRef = db.collection("adminAuditLogs").doc(
        `production_application_review_${applicationId}_${expectedVersion}`,
      );
      const [existingAudit, auditHeadSnapshot] = await Promise.all([
        transaction.get(auditRef),
        transaction.get(OWNER_REVIEW_AUDIT_HEAD),
      ]);
      if (existingAudit.exists) {
        throw new HttpsError("aborted", "يوجد سجل تدقيق سابق لهذا الإصدار؛ أعد تحميل الطلب.");
      }
      const previousSequence = auditHeadSnapshot.exists
        ? auditHeadSnapshot.data()?.sequence : 0;
      const previousHash = auditHeadSnapshot.exists
        ? auditHeadSnapshot.data()?.eventHash : "GENESIS";
      if (!Number.isSafeInteger(previousSequence) || (previousSequence as number) < 0 ||
          typeof previousHash !== "string" ||
          !(previousHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousHash))) {
        throw new HttpsError("data-loss", "سلسلة تدقيق المالك غير سليمة؛ أوقفت المراجعة لحماية السجل.");
      }
      const auditSequence = (previousSequence as number) + 1;
      const auditHash = calculateOwnerAuditHash(auditEvent, auditSequence, previousHash);
      transaction.create(auditRef, {
        ...auditEvent,
        auditEvent,
        auditChainId: "owner-review-v1",
        auditSequence,
        previousAuditHash: previousHash,
        auditHash,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.set(OWNER_REVIEW_AUDIT_HEAD, {
        sequence: auditSequence,
        eventHash: auditHash,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(ref, {
        status: nextStatus,
        reviewNote: note,
        reviewedBy: actorUid,
        applicationVersion: version,
        // Acceptance is preliminary only; contract signature and owner grant remain separate.
        roleActivated: false,
        roomCreationPermission: false,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { applicationId, status: nextStatus, applicationVersion: version };
    });
    return { ...result, roleActivated: false, roomCreationPermission: false };
  },
);

// Secure intake for advertising representatives and direct advertisers.
// Submission never grants a role, creates a campaign, accepts payment or publishes content.
const ADVERTISING_INTAKE = db.collection("advertisingIntakeRequests");

export const submitAdvertisingIntake = onCall(
  { enforceAppCheck: true },
  async (request) => {
    if (request.data?.kind === "representative_application") requireWebPortalAccess(request);
    const actorUid = requireAuthenticatedUid(request.auth?.uid);
    if (request.auth?.token.email_verified !== true) {
      throw new HttpsError("permission-denied", "يجب توثيق البريد الإلكتروني قبل إرسال الطلب.");
    }
    let payload;
    try {
      payload = validateAdvertisingIntake(request.data);
    } catch (error) {
      if (error instanceof AdvertisingIntakeValidationError) {
        throw new HttpsError("invalid-argument", error.code);
      }
      throw error;
    }
    const { idempotencyKey: _idempotencyKey, ...storedPayload } = payload;
    const payloadHash = createHash("sha256")
      .update(JSON.stringify(storedPayload))
      .digest("hex");
    const keyHash = createHash("sha256")
      .update(actorUid + "|" + payload.idempotencyKey)
      .digest("hex");
    const idempotencyRef = db.collection("advertisingIntakeIdempotency").doc(keyHash);
    const requestRef = ADVERTISING_INTAKE.doc();
    const result = await db.runTransaction(async (transaction) => {
      const prior = await transaction.get(idempotencyRef);
      if (prior.exists) {
        const data = prior.data() ?? {};
        if (data.payloadHash !== payloadHash || typeof data.requestId !== "string") {
          throw new HttpsError("already-exists", "مفتاح الطلب مستخدم مع بيانات مختلفة.");
        }
        return { requestId: data.requestId as string, duplicate: true };
      }
      transaction.create(requestRef, {
        ...storedPayload,
        applicantUid: actorUid,
        status: "submitted_pending_review",
        requestVersion: 1,
        contractRequired: true,
        roleActivated: false,
        campaignCreated: false,
        paymentAccepted: false,
        published: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(idempotencyRef, {
        applicantUid: actorUid,
        payloadHash,
        requestId: requestRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { requestId: requestRef.id, duplicate: false };
    });
    // Always attempt the deterministic audit event, including on idempotent
    // replay. If the original request transaction committed but the audit write
    // failed, a client retry repairs the missing audit record without creating
    // a second intake request.
    await appendOwnerReviewAuditEvent({
      actorUid,
      action: "advertising_intake_submitted",
      requestId: result.requestId,
      intakeKind: payload.kind,
      targetGeographies: payload.targetGeographies,
      outcome: "success",
    }, advertisingIntakeAuditEventId(result.requestId));
    return {
      requestId: result.requestId,
      status: "submitted_pending_review",
      duplicate: result.duplicate,
      contractRequired: true,
    };
  },
);

export const listOwnerAdvertisingIntake = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  requireOwner(request);
  const limit = Number.isSafeInteger(request.data?.limit)
    ? Math.max(1, Math.min(100, request.data.limit as number)) : 50;
  const status = request.data?.status;
  const kind = request.data?.kind;
  if (status !== undefined && typeof status !== "string") {
    throw new HttpsError("invalid-argument", "مرشح الحالة غير صالح.");
  }
  if (kind !== undefined && kind !== "representative_application" && kind !== "direct_advertiser") {
    throw new HttpsError("invalid-argument", "نوع الطلب غير صالح.");
  }
  let query = ADVERTISING_INTAKE.orderBy("createdAt", "desc");
  if (status) query = ADVERTISING_INTAKE.where("status", "==", status).orderBy("createdAt", "desc");
  else if (kind) query = ADVERTISING_INTAKE.where("kind", "==", kind).orderBy("createdAt", "desc");
  const snapshot = await query.limit(Math.min(200, limit * 2)).get();
  const requests = snapshot.docs
    .filter((doc) => !kind || doc.get("kind") === kind)
    .map((doc) => ({ requestId: doc.id, ...doc.data() }))
    .slice(0, limit);
  return { requests };
});

export const reviewOwnerAdvertisingIntake = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const actorUid = requireOwner(request);
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId.trim() : "";
  const expectedVersion = request.data?.expectedVersion;
  const nextStatus = request.data?.nextStatus;
  const note = typeof request.data?.note === "string" ? request.data.note.trim() : "";
  const allowed = [
    "under_review", "correction_requested", "rejected",
    "accepted_pending_contract", "closed",
  ];
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(requestId) ||
      !Number.isSafeInteger(expectedVersion) || (expectedVersion as number) < 1 ||
      typeof nextStatus !== "string" || !allowed.includes(nextStatus) ||
      note.length < 5 || note.length > 1500) {
    throw new HttpsError("invalid-argument", "بيانات مراجعة الطلب أو ملاحظاتها غير مكتملة.");
  }
  const ref = ADVERTISING_INTAKE.doc(requestId);
  const auditRef = db.collection("adminAuditLogs")
    .doc(advertisingIntakeReviewAuditEventId(requestId, expectedVersion as number));
  const result = await db.runTransaction(async (transaction) => {
    const [snapshot, existingAudit, headSnapshot] = await Promise.all([
      transaction.get(ref),
      transaction.get(auditRef),
      transaction.get(OWNER_REVIEW_AUDIT_HEAD),
    ]);
    if (!snapshot.exists) throw new HttpsError("not-found", "الطلب غير موجود.");
    const data = snapshot.data()!;
    if (existingAudit.exists) {
      const priorAudit = existingAudit.data() ?? {};
      if (data.requestVersion === (expectedVersion as number) + 1 &&
          data.status === nextStatus && data.reviewedBy === actorUid &&
          data.reviewNote === note && priorAudit.action === "advertising_intake_reviewed" &&
          priorAudit.actorUid === actorUid && priorAudit.requestId === requestId) {
        return {
          requestId, status: nextStatus, requestVersion: data.requestVersion,
          contractRequired: true, auditLogId: auditRef.id, idempotentReplay: true,
        };
      }
      throw new HttpsError("already-exists", "معرف مراجعة الطلب مستخدم لعملية مختلفة.");
    }
    if (data.requestVersion !== expectedVersion) {
      throw new HttpsError("aborted", "تغير الطلب؛ أعد تحميله قبل المراجعة.");
    }
    const allowedTransitions: Record<string, readonly string[]> = {
      submitted_pending_review: ["under_review", "rejected", "closed"],
      under_review: ["correction_requested", "rejected", "accepted_pending_contract", "closed"],
      correction_requested: ["under_review", "rejected", "closed"],
      accepted_pending_contract: ["closed"],
    };
    if (!(allowedTransitions[data.status] ?? []).includes(nextStatus)) {
      throw new HttpsError("failed-precondition", "انتقال حالة الطلب غير مسموح من حالته الحالية.");
    }
    const head = headSnapshot.data() ?? {};
    const previousSequence = headSnapshot.exists ? head.sequence : 0;
    const previousHash = headSnapshot.exists ? head.eventHash : "GENESIS";
    if (!Number.isSafeInteger(previousSequence) || previousSequence < 0 ||
        typeof previousHash !== "string" ||
        !(previousHash === "GENESIS" || /^[a-f0-9]{64}$/.test(previousHash))) {
      throw new HttpsError("data-loss", "سلسلة تدقيق المالك غير سليمة؛ أوقفت المراجعة لحماية السجل.");
    }
    const version = (data.requestVersion as number) + 1;
    const auditEvent = {
      actorUid,
      action: "advertising_intake_reviewed",
      requestId,
      status: nextStatus,
      requestVersion: version,
      contractRequired: true,
      note,
      outcome: "success",
    };
    const sequence = previousSequence + 1;
    const eventHash = calculateOwnerAuditHash(auditEvent, sequence, previousHash);
    transaction.update(ref, {
      status: nextStatus,
      reviewNote: note,
      reviewedBy: actorUid,
      requestVersion: version,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      ...auditEvent,
      auditEvent,
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
    return {
      requestId, status: nextStatus, requestVersion: version,
      contractRequired: true, auditLogId: auditRef.id, idempotentReplay: false,
    };
  });
  return result;
});

// Owner-controlled specialized advertising/production/legal role grants.
// These grants are separate from general platform administration.
const SPECIALIZED_ROLE_GRANTS = db.collection("specializedRoleGrants");
const SPECIALIZED_ROLE_CAPACITY_SETTINGS = db.doc("platformSettings/specializedRoleCapacity");

type CapacityLimitedPlatformRole = Exclude<NumberedPlatformRole, "platform_admin" | "production_supervisor">;

function isCapacityLimitedPlatformRole(role: string): role is CapacityLimitedPlatformRole {
  return role === "ad_general_supervisor" ||
    role === "production_general_supervisor" ||
    role === "production_quality_reviewer" ||
    role === "legal_administrative_supervisor";
}

export const getOwnerAdvertisingRoleGrants = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await SPECIALIZED_ROLE_GRANTS.orderBy("updatedAt", "desc").limit(500).get();
  return { grants: snapshot.docs.map((doc) => ({ grantId: doc.id, ...doc.data() })) };
});

/** The only expandable numbered specialist team is General Production Supervisor. */
export const getOwnerSpecializedRoleCapacity = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await SPECIALIZED_ROLE_CAPACITY_SETTINGS.get();
  const data = snapshot.data() ?? {};
  const version = snapshot.exists ? data.version : 0;
  const defaultCapacity = PLATFORM_ROLE_CAPACITY.production_general_supervisor;
  if (defaultCapacity === null) {
    throw new HttpsError("failed-precondition", "لم تُعرّف السعة الافتراضية لمشرفي الإنتاج.");
  }
  const configuredCapacity = data.productionGeneralSupervisorCapacity;
  const productionGeneralSupervisorCapacity =
    configuredCapacity === undefined ? defaultCapacity : configuredCapacity;
  if (!Number.isSafeInteger(version) || version < 0 ||
      !Number.isSafeInteger(productionGeneralSupervisorCapacity) ||
      productionGeneralSupervisorCapacity < defaultCapacity) {
    throw new HttpsError("failed-precondition", "إعداد سعة مشرفي الإنتاج غير صالح؛ أوقفنا التعيين.");
  }
  return {
    version,
    capacities: {
      platform_admin: PLATFORM_ROLE_CAPACITY.platform_admin,
      ad_general_supervisor: PLATFORM_ROLE_CAPACITY.ad_general_supervisor,
      production_general_supervisor: productionGeneralSupervisorCapacity,
      production_supervisor: PLATFORM_ROLE_CAPACITY.production_supervisor,
      production_quality_reviewer: PLATFORM_ROLE_CAPACITY.production_quality_reviewer,
      legal_administrative_supervisor: PLATFORM_ROLE_CAPACITY.legal_administrative_supervisor,
    },
  };
});

/** Owner may raise/lower the General Production Supervisor capacity, never below its default or active seats. */
export const setOwnerSpecializedRoleCapacity = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const expectedVersion = request.data?.expectedVersion;
  const capacity = request.data?.capacity;
  const role = "production_general_supervisor";
  const defaultCapacity = PLATFORM_ROLE_CAPACITY.production_general_supervisor;
  if (defaultCapacity === null) {
    throw new HttpsError("failed-precondition", "لم تُعرّف السعة الافتراضية لمشرفي الإنتاج.");
  }
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 ||
      !Number.isSafeInteger(capacity) || capacity < defaultCapacity) {
    throw new HttpsError("invalid-argument", "إصدار السعة أو عدد المقاعد غير صالح.");
  }
  return db.runTransaction(async (transaction) => {
    const [settingsSnapshot, grantsSnapshot] = await Promise.all([
      transaction.get(SPECIALIZED_ROLE_CAPACITY_SETTINGS),
      transaction.get(SPECIALIZED_ROLE_GRANTS.where("role", "==", role).where("status", "==", "active")),
    ]);
    const data = settingsSnapshot.data() ?? {};
    const previousVersion = settingsSnapshot.exists ? data.version : 0;
    const previousCapacity = settingsSnapshot.exists
      ? data.productionGeneralSupervisorCapacity ?? defaultCapacity
      : defaultCapacity;
    if (!Number.isSafeInteger(previousVersion) || previousVersion !== expectedVersion) {
      throw new HttpsError("aborted", "تغير إعداد السعة منذ آخر قراءة؛ أعد تحميله قبل الحفظ.");
    }
    if (previousVersion >= Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "بلغ إصدار إعداد السعة الحد الآمن.");
    }
    if (!Number.isSafeInteger(previousCapacity) || previousCapacity < defaultCapacity) {
      throw new HttpsError("failed-precondition", "قيمة السعة المحفوظة غير صالحة.");
    }
    const nowMs = Date.now();
    const activeCount = grantsSnapshot.docs.filter((doc) => {
      const grant = doc.data();
      return grant.status === "active" &&
        (grant.endsAtMs == null || !Number.isSafeInteger(grant.endsAtMs) || grant.endsAtMs > nowMs);
    }).length;
    if (capacity < activeCount) {
      throw new HttpsError("failed-precondition", "لا يمكن خفض السعة إلى أقل من عدد المشرفين النشطين.");
    }
    const version = previousVersion + 1;
    const auditLogId = await createOwnerReviewAuditEventInTransaction(transaction, {
      actorUid,
      action: "specialized_role_capacity_updated",
      role,
      previousCapacity,
      capacity,
      activeCount,
      version,
      outcome: "success",
    });
    const now = FieldValue.serverTimestamp();
    transaction.set(SPECIALIZED_ROLE_CAPACITY_SETTINGS, {
      productionGeneralSupervisorCapacity: capacity,
      version,
      updatedBy: actorUid,
      updatedAt: now,
    });
    transaction.set(db.collection("specializedRoleSeatCounters").doc(role), {
      role,
      activeCount,
      capacity,
      reconciledAt: now,
      updatedAt: now,
    });
    return { role, capacity, activeCount, version, auditLogId };
  });
});

export const setOwnerAdvertisingRoleGrant = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const expectedVersion = request.data?.expectedVersion;
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
    throw new HttpsError("invalid-argument", "إصدار الصلاحية المتوقع غير صالح.");
  }
  let grant;
  try {
    grant = validateSpecializedRoleGrant({ ...request.data?.grant, version: 1 });
  } catch {
    throw new HttpsError("invalid-argument", "بيانات تكليف المشرف المتخصص أو نطاق صلاحياته غير صالحة.");
  }
  const grantId = specializedRoleGrantId(grant.uid, grant.role);
  const grantRef = SPECIALIZED_ROLE_GRANTS.doc(grantId);
  const defaultProductionCapacity = PLATFORM_ROLE_CAPACITY.production_general_supervisor;
  if (defaultProductionCapacity === null) {
    throw new HttpsError("failed-precondition", "لم تُعرّف السعة الافتراضية لمشرفي الإنتاج.");
  }
  const limitedRole: CapacityLimitedPlatformRole | null =
    isCapacityLimitedPlatformRole(grant.role) ? grant.role : null;
  let roleCapacityOverride: number | undefined;
  let roleSeatRole: CapacityLimitedPlatformRole | null = null;
  const result = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(grantRef);
    const previousVersion = previous.exists ? Number(previous.data()?.version) : 0;
    if (!Number.isSafeInteger(previousVersion) || previousVersion !== expectedVersion) {
      throw new HttpsError("aborted", "تغيرت الصلاحية منذ آخر قراءة؛ أعد تحميلها قبل الحفظ.");
    }
    if (previousVersion >= Number.MAX_SAFE_INTEGER) {
      throw new HttpsError("failed-precondition", "بلغ إصدار التكليف الحد الآمن؛ أوقفنا التحديث.");
    }
    let roleSeatCounterRef: DocumentReference | null = null;
    let roleSeatCountAfterWrite: number | null = null;
    if (limitedRole !== null) {
      roleSeatCounterRef = db.collection("specializedRoleSeatCounters").doc(limitedRole);
      const [roleSnapshot] = await Promise.all([
        transaction.get(SPECIALIZED_ROLE_GRANTS.where("role", "==", limitedRole)
          .where("status", "==", "active")),
        transaction.get(roleSeatCounterRef),
      ]);
      const capacitySnapshot = limitedRole === "production_general_supervisor"
        ? await transaction.get(SPECIALIZED_ROLE_CAPACITY_SETTINGS)
        : null;
      const configuredCapacity = capacitySnapshot?.data()?.productionGeneralSupervisorCapacity;
      if (configuredCapacity !== undefined &&
          (!Number.isSafeInteger(configuredCapacity) ||
           configuredCapacity < defaultProductionCapacity)) {
        throw new HttpsError("failed-precondition", "إعداد سعة مشرفي الإنتاج غير صالح؛ أوقفنا التعيين.");
      }
      roleSeatRole = limitedRole;
      roleCapacityOverride = configuredCapacity === undefined ? undefined : configuredCapacity;
      const nowMs = Date.now();
      const otherActiveAssignments = roleSnapshot.docs.filter((doc) => {
        if (doc.id === grantId) return false;
        const data = doc.data();
        return data.status === "active" &&
          (data.endsAtMs == null || !Number.isSafeInteger(data.endsAtMs) || data.endsAtMs > nowMs);
      }).length;
      const targetConsumesSeat = grant.status === "active" &&
        (grant.endsAtMs === null || grant.endsAtMs > nowMs);
      roleSeatCountAfterWrite = otherActiveAssignments + (targetConsumesSeat ? 1 : 0);
      try {
        assertPlatformRoleCapacity(limitedRole, roleSeatCountAfterWrite, roleCapacityOverride);
      } catch {
        throw new HttpsError("resource-exhausted", "اكتمل العدد المسموح لهذه الفئة الإشرافية؛ الحد الأقصى خمسة.");
      }
    }
    const version = previousVersion + 1;
    const now = FieldValue.serverTimestamp();
    const auditLogId = await createOwnerReviewAuditEventInTransaction(transaction, {
      actorUid, action: "specialized_advertising_role_grant_saved",
      grantId, version, status: grant.status, targetUid: grant.uid,
      role: grant.role, permissions: grant.permissions,
      resourceScopes: grant.resourceScopes, outcome: "success",
    });
    transaction.set(grantRef, {
      ...grant, version, assignedBy: actorUid, updatedBy: actorUid,
      createdAt: previous.data()?.createdAt ?? now, updatedAt: now,
    });
    if (roleSeatCounterRef !== null && roleSeatCountAfterWrite !== null && roleSeatRole !== null) {
      transaction.set(roleSeatCounterRef, {
        role: roleSeatRole,
        activeCount: roleSeatCountAfterWrite,
        capacity: platformRoleCapacity(roleSeatRole, roleCapacityOverride),
        reconciledAt: now,
        updatedAt: now,
      });
    }
    return { grantId, version, status: grant.status, auditLogId };
  });
  return result;
});

export const updateOwnerAdvertisingRoleGrantPermissions = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const grantId = request.data?.grantId;
  const expectedVersion = request.data?.expectedVersion;
  if (typeof grantId !== "string" || !/^[a-f0-9]{64}$/.test(grantId) ||
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw new HttpsError("invalid-argument", "معرف الصلاحية أو إصدارها غير صالح.");
  }
  const delta = request.data?.delta;
  if (!delta || typeof delta !== "object" || Array.isArray(delta) ||
      Object.keys(delta).some((key) => !["add", "remove"].includes(key))) {
    throw new HttpsError("invalid-argument", "تعديل الصلاحيات غير صالح.");
  }
  const grantRef = SPECIALIZED_ROLE_GRANTS.doc(grantId);
  const result = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(grantRef);
    if (!previous.exists) throw new HttpsError("not-found", "تكليف الصلاحية غير موجود.");
    const data = previous.data()!;
    if (data.version !== expectedVersion) {
      throw new HttpsError("aborted", "تغيرت الصلاحية؛ أعد تحميلها قبل التعديل.");
    }
    if (data.status !== "active" && data.status !== "suspended") {
      throw new HttpsError("failed-precondition", "لا يمكن تعديل تكليف ملغى.");
    }
    let changed;
    try {
      changed = applySpecializedPermissionDelta(data, delta);
    } catch {
      throw new HttpsError("invalid-argument", "لا يمكن إضافة أو سحب مجموعة الصلاحيات المطلوبة.");
    }
    const version = data.version + 1;
    const auditLogId = await createOwnerReviewAuditEventInTransaction(transaction, {
      actorUid, action: "specialized_advertising_role_permissions_updated",
      grantId, version, status: data.status, permissions: changed.permissions,
      targetUid: data.uid, role: data.role, outcome: "success",
    });
    transaction.update(grantRef, {
      permissions: changed.permissions,
      version,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
    });
    return { grantId, version, status: data.status, permissions: changed.permissions, auditLogId };
  });
  return result;
});

export const revokeOwnerAdvertisingRoleGrant = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const grantId = request.data?.grantId;
  const expectedVersion = request.data?.expectedVersion;
  if (typeof grantId !== "string" || !/^[a-f0-9]{64}$/.test(grantId) ||
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw new HttpsError("invalid-argument", "معرف الصلاحية أو إصدارها غير صالح.");
  }
  const grantRef = SPECIALIZED_ROLE_GRANTS.doc(grantId);
  const result = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(grantRef);
    if (!previous.exists) throw new HttpsError("not-found", "تكليف الصلاحية غير موجود.");
    const data = previous.data()!;
    if (data.version !== expectedVersion) {
      throw new HttpsError("aborted", "تغيرت الصلاحية؛ أعد تحميلها قبل السحب.");
    }
    if (data.status === "revoked") {
      return { grantId, version: data.version, revoked: true, idempotentReplay: true };
    }
    const version = data.version + 1;
    const auditLogId = await createOwnerReviewAuditEventInTransaction(transaction, {
      actorUid, action: "specialized_advertising_role_grant_revoked",
      grantId, version, targetUid: data.uid, role: data.role,
      status: "revoked", outcome: "success",
    });
    transaction.update(grantRef, {
      status: "revoked", version, revokedAt: FieldValue.serverTimestamp(),
      revokedBy: actorUid, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorUid,
    });
    return { grantId, version, revoked: true, idempotentReplay: false, auditLogId };
  });
  return result;
});


// ---------------------------------------------------------------------------
// Owner-controlled contract center. Contract content is immutable after send;
// all signature evidence is bound to an exact content hash and terms version.
// ---------------------------------------------------------------------------
const CONTRACT_RECORDS = db.collection("contracts");
const CONTRACT_AUDIT_LOGS = db.collection("contractAuditLogs");
const CONTRACT_AUDIT_HEAD = db.collection("contractAuditChainHeads").doc("global");

type PreparedContractAuditEvent = {
  sequence: number;
  previousHash: string;
  eventHash: string;
  eventRef: ReturnType<typeof CONTRACT_AUDIT_LOGS.doc>;
  event: Record<string, unknown>;
};

/** Read the chain head before any transaction writes, then stage the immutable event atomically. */
async function prepareContractAuditEvent(
  transaction: Transaction,
  event: Record<string, unknown>,
): Promise<PreparedContractAuditEvent> {
  const headSnapshot = await transaction.get(CONTRACT_AUDIT_HEAD);
  const head = headSnapshot.data() ?? {};
  const sequence = headSnapshot.exists ? Number(head.sequence) + 1 : 1;
  const previousHash = headSnapshot.exists ? String(head.eventHash) : "GENESIS";
  if (!Number.isSafeInteger(sequence) || sequence < 1 ||
      !/^(GENESIS|[a-f0-9]{64})$/.test(previousHash)) {
    throw new HttpsError("data-loss", "سلسلة تدقيق العقود غير سليمة؛ أوقفت العملية لحماية السجل.");
  }
  return {
    sequence,
    previousHash,
    eventHash: calculateOwnerAuditHash(event, sequence, previousHash),
    eventRef: CONTRACT_AUDIT_LOGS.doc(String(sequence).padStart(12, "0")),
    event,
  };
}

function commitContractAuditEvent(
  transaction: Transaction,
  prepared: PreparedContractAuditEvent,
): void {
  transaction.create(prepared.eventRef, {
    sequence: prepared.sequence,
    previousHash: prepared.previousHash,
    eventHash: prepared.eventHash,
    event: prepared.event,
    createdAt: FieldValue.serverTimestamp(),
  });
  transaction.set(CONTRACT_AUDIT_HEAD, {
    sequence: prepared.sequence,
    eventHash: prepared.eventHash,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function contractSigningState(data: Record<string, unknown>): ContractSigningState {
  return {
    status: data.status as ContractStatus,
    version: data.version as number,
    contentHash: data.contentHash as string,
    ownerUid: data.ownerUid as string,
    counterpartyUid: data.counterpartyUid as string,
    counterpartyEmail: data.counterpartyEmail as string,
    counterpartySignature: (data.counterpartySignature ?? null) as ContractSignatureEvidence | null,
    companySignature: (data.companySignature ?? null) as ContractSignatureEvidence | null,
  };
}

function contractExpectedRecordVersion(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) {
    throw new HttpsError("invalid-argument", "إصدار سجل العقد المتوقع غير صالح.");
  }
  return value as number;
}

function contractActorEmail(request: {
  auth?: { token: Record<string, unknown> } | null;
}): string {
  const token = request.auth?.token ?? {};
  const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : "";
  if (token.email_verified !== true || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    throw new HttpsError("failed-precondition", "يجب التحقق من البريد الإلكتروني قبل توقيع العقد.");
  }
  const authTime = token.auth_time;
  if (!Number.isSafeInteger(authTime) ||
      Date.now() - (authTime as number) * 1000 > 10 * 60 * 1000 ||
      (authTime as number) * 1000 > Date.now() + 60 * 1000) {
    throw new HttpsError("failed-precondition", "يتطلب توقيع العقد إعادة تحقق حديثة من الحساب.");
  }
  return email;
}

/** Owner/MFA-only draft creation. Drafts are not sent, signed or effective. */
export const createOwnerContractDraft = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const actorUid = requireOwner(request);
  let draft: ContractDraftInput;
  try {
    draft = validateContractDraftInput(request.data);
  } catch (error) {
    const code = error instanceof Error ? error.message : "CONTRACT_DRAFT_INVALID";
    throw new HttpsError("invalid-argument", code);
  }
  const idempotencyKey = typeof request.data?.idempotencyKey === "string"
    ? request.data.idempotencyKey.trim() : "";
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new HttpsError("invalid-argument", "مفتاح منع تكرار إنشاء العقد غير صالح.");
  }
  const contentHash = computeContractContentHash(draft);
  const idempotencyRef = db.collection("contractDraftIdempotency").doc(
    createHash("sha256").update(actorUid + "|" + idempotencyKey).digest("hex"),
  );
  const contractId = randomUUID();
  const contractRef = CONTRACT_RECORDS.doc(contractId);
  const record = {
    ...draft,
    contractId,
    ownerUid: actorUid,
    status: "draft" as ContractStatus,
    version: draft.termsVersion,
    recordVersion: 1,
    contentHash,
    counterpartySignature: null,
    companySignature: null,
    createdBy: actorUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const result = await db.runTransaction(async (transaction) => {
    const prior = await transaction.get(idempotencyRef);
    if (prior.exists) {
      const priorData = prior.data() ?? {};
      if (priorData.contentHash !== contentHash || typeof priorData.contractId !== "string") {
        throw new HttpsError("aborted", "استُخدم مفتاح الطلب نفسه مع محتوى عقد مختلف.");
      }
      return { contractId: priorData.contractId as string, duplicate: true };
    }
    const auditEvent = await prepareContractAuditEvent(transaction, {
      contractId,
      actorUid,
      action: "contract_draft_created",
      status: "draft",
      version: record.version,
      contentHash,
    });
    transaction.create(contractRef, record);
    transaction.create(idempotencyRef, {
      contractId,
      actorUid,
      contentHash,
      createdAt: FieldValue.serverTimestamp(),
    });
    commitContractAuditEvent(transaction, auditEvent);
    return { contractId, duplicate: false };
  });
  return {
    contractId: result.contractId,
    status: "draft",
    version: record.version,
    recordVersion: 1,
    contentHash,
    idempotentReplay: result.duplicate,
  };
});

/** Owner/MFA-only lifecycle transition with optimistic concurrency and legal readiness gate. */
export const transitionOwnerContract = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const actorUid = requireOwner(request);
  const contractId = typeof request.data?.contractId === "string" ? request.data.contractId.trim() : "";
  const nextStatus = request.data?.nextStatus;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  const expectedRecordVersion = contractExpectedRecordVersion(request.data?.expectedRecordVersion);
  if (!/^[0-9a-f-]{36}$/i.test(contractId) ||
      typeof nextStatus !== "string") {
    throw new HttpsError("invalid-argument", "معرف العقد أو الحالة المطلوبة غير صالحين.");
  }
  if (["cancelled", "suspended", "terminated"].includes(nextStatus) &&
      (reason.length < 10 || reason.length > 1000)) {
    throw new HttpsError("invalid-argument", "يجب توثيق سبب الإلغاء أو التعليق أو الإنهاء.");
  }
  const contractRef = CONTRACT_RECORDS.doc(contractId);
  const auditRef = CONTRACT_AUDIT_LOGS.doc();
  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new HttpsError("not-found", "العقد غير موجود.");
    const data = snapshot.data()!;
    if (data.ownerUid !== actorUid) throw new HttpsError("permission-denied", "العقد ليس ضمن نطاق إدارة المالك.");
    if (data.recordVersion !== expectedRecordVersion) {
      throw new HttpsError("aborted", "تغير سجل العقد؛ أعد تحميله قبل المتابعة.");
    }
    const from = data.status as ContractStatus;
    const to = nextStatus as ContractStatus;
    try {
      assertContractStatusTransition(from, to);
    } catch {
      throw new HttpsError("failed-precondition", "انتقال حالة العقد غير مسموح.");
    }
    if (to === "ready_to_send" || to === "awaiting_counterparty_signature") {
      try {
        validateContractReadyForSignature(data as unknown as ContractDraftInput);
      } catch {
        throw new HttpsError("failed-precondition", "بيانات الشركة والاختصاص والقانون والنزاع يجب أن تكتمل قبل الإرسال.");
      }
    }
    if (to === "effective" && !canMakeContractEffective(contractSigningState(data))) {
      throw new HttpsError("failed-precondition", "لا يمكن تفعيل العقد قبل اكتمال توقيع الطرفين على النسخة نفسها.");
    }
    const recordVersion = expectedRecordVersion + 1;
    const auditEvent = await prepareContractAuditEvent(transaction, {
      contractId,
      actorUid,
      action: "contract_status_transition",
      from,
      to,
      reason: reason || null,
      recordVersion,
      contentHash: data.contentHash,
    });
    transaction.update(contractRef, {
      status: to,
      recordVersion,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
      ...(to === "awaiting_counterparty_signature"
        ? { sentAt: FieldValue.serverTimestamp() } : {}),
      ...(to === "effective"
        ? { effectiveAt: FieldValue.serverTimestamp() } : {}),
      ...(to === "suspended"
        ? { suspendedAt: FieldValue.serverTimestamp() } : {}),
      ...(to === "terminated"
        ? { terminatedAt: FieldValue.serverTimestamp() } : {}),
      ...(to === "cancelled"
        ? { cancelledAt: FieldValue.serverTimestamp() } : {}),
    });
    commitContractAuditEvent(transaction, auditEvent);
    return { contractId, status: to, recordVersion };
  });
  return result;
});

/** Counterparty signature is bound to verified UID/email, recent authentication, hash and terms version. */
export const signContractAsCounterparty = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const email = contractActorEmail(request);
  const contractId = typeof request.data?.contractId === "string" ? request.data.contractId.trim() : "";
  const expectedVersion = request.data?.expectedVersion;
  const expectedHash = request.data?.expectedContentHash;
  if (!/^[0-9a-f-]{36}$/i.test(contractId) ||
      !Number.isSafeInteger(expectedVersion) || typeof expectedHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(expectedHash) || request.data?.accept !== true) {
    throw new HttpsError("invalid-argument", "بيانات توقيع العقد أو تأكيد القبول غير صالحة.");
  }
  const contractRef = CONTRACT_RECORDS.doc(contractId);
  const auditRef = CONTRACT_AUDIT_LOGS.doc();
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new HttpsError("not-found", "العقد غير موجود.");
    const data = snapshot.data()!;
    if (data.counterpartyUid !== uid || data.counterpartyEmail !== email) {
      throw new HttpsError("permission-denied", "هذا العقد غير موجه إلى الحساب والبريد الحاليين.");
    }
    if (data.version !== expectedVersion || data.contentHash !== expectedHash) {
      throw new HttpsError("aborted", "تغير إصدار العقد أو محتواه؛ راجع النسخة الحالية قبل التوقيع.");
    }
    const evidence: ContractSignatureEvidence = {
      side: "counterparty",
      uid,
      email,
      emailVerified: true,
      accepted: true,
      contentHash: expectedHash,
      contractVersion: expectedVersion,
      signedAtMs: Date.now(),
      method: "in_app_electronic",
    };
    let next: ContractSigningState;
    try {
      next = applyContractSignature(contractSigningState(data), evidence);
    } catch {
      throw new HttpsError("failed-precondition", "حالة العقد أو أدلة التوقيع لا تسمح بهذا التوقيع.");
    }
    const recordVersion = (data.recordVersion as number) + 1;
    const auditEvent = await prepareContractAuditEvent(transaction, {
      contractId,
      actorUid: uid,
      action: "contract_counterparty_signed",
      contractVersion: expectedVersion,
      contentHash: expectedHash,
      recordVersion,
    });
    transaction.update(contractRef, {
      status: next.status,
      counterpartySignature: evidence,
      recordVersion,
      updatedAt: FieldValue.serverTimestamp(),
    });
    commitContractAuditEvent(transaction, auditEvent);
    return { contractId, status: next.status, recordVersion, contentHash: expectedHash };
  });
});

/** Company signature is owner/MFA-only and requires recent verified email authentication. */
export const signContractForCompany = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const actorUid = requireOwner(request);
  const email = contractActorEmail(request);
  const contractId = typeof request.data?.contractId === "string" ? request.data.contractId.trim() : "";
  const expectedVersion = request.data?.expectedVersion;
  const expectedHash = request.data?.expectedContentHash;
  if (!/^[0-9a-f-]{36}$/i.test(contractId) ||
      !Number.isSafeInteger(expectedVersion) || typeof expectedHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(expectedHash) || request.data?.accept !== true) {
    throw new HttpsError("invalid-argument", "بيانات توقيع الشركة أو تأكيد القبول غير صالحة.");
  }
  const contractRef = CONTRACT_RECORDS.doc(contractId);
  const auditRef = CONTRACT_AUDIT_LOGS.doc();
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new HttpsError("not-found", "العقد غير موجود.");
    const data = snapshot.data()!;
    if (data.ownerUid !== actorUid) throw new HttpsError("permission-denied", "توقيع الشركة يتطلب المالك المعتمد لهذا العقد.");
    if (data.version !== expectedVersion || data.contentHash !== expectedHash) {
      throw new HttpsError("aborted", "تغير إصدار العقد أو محتواه؛ راجع النسخة الحالية قبل التوقيع.");
    }
    const evidence: ContractSignatureEvidence = {
      side: "company",
      uid: actorUid,
      email,
      emailVerified: true,
      accepted: true,
      contentHash: expectedHash,
      contractVersion: expectedVersion,
      signedAtMs: Date.now(),
      method: "in_app_electronic",
      ownerVerified: true,
      stepUpVerified: true,
    };
    let next: ContractSigningState;
    try {
      next = applyContractSignature(contractSigningState(data), evidence);
    } catch {
      throw new HttpsError("failed-precondition", "حالة العقد أو أدلة التوقيع لا تسمح بتوقيع الشركة.");
    }
    const recordVersion = (data.recordVersion as number) + 1;
    const auditEvent = await prepareContractAuditEvent(transaction, {
      contractId,
      actorUid,
      action: "contract_company_signed",
      contractVersion: expectedVersion,
      contentHash: expectedHash,
      recordVersion,
    });
    transaction.update(contractRef, {
      status: next.status,
      companySignature: evidence,
      recordVersion,
      updatedAt: FieldValue.serverTimestamp(),
    });
    commitContractAuditEvent(transaction, auditEvent);
    return { contractId, status: next.status, recordVersion, contentHash: expectedHash };
  });
});

/** Owner/MFA-only contract list; member-facing access is provided by a separate callable. */
export const listOwnerContracts = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  requireOwner(request);
  const limit = Number.isSafeInteger(request.data?.limit)
    ? Math.max(1, Math.min(100, request.data.limit as number)) : 50;
  const status = request.data?.status;
  if (status !== undefined && typeof status !== "string") {
    throw new HttpsError("invalid-argument", "مرشح حالة العقد غير صالح.");
  }
  let query = CONTRACT_RECORDS.limit(limit);
  if (typeof status === "string") query = CONTRACT_RECORDS.where("status", "==", status).limit(limit);
  const snapshot = await query.get();
  return {
    contracts: snapshot.docs.map((doc) => ({ contractId: doc.id, ...doc.data() })),
  };
});

/** A counterparty can retrieve only contracts addressed to their verified account. */
export const listMyContracts = onCall(
  { enforceAppCheck: true },
  async (request) => {
    requireWebPortalAccess(request);
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const snapshot = await CONTRACT_RECORDS.where("counterpartyUid", "==", uid).limit(50).get();
  return {
    contracts: snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        contractId: doc.id,
        title: data.title,
        contractType: data.contractType,
        status: data.status,
        version: data.version,
        contentHash: data.contentHash,
        body: data.body,
        currency: data.currency,
        commitmentMinor: data.commitmentMinor,
        startsAtMs: data.startsAtMs,
        endsAtMs: data.endsAtMs,
        counterpartySignature: data.counterpartySignature,
        companySignature: data.companySignature,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }),
  };
});


/* -------------------------------------------------------------------------- */
/* Authenticated WebRTC call lifecycle and server-mediated signaling.        */
/* -------------------------------------------------------------------------- */

const CALL_SESSIONS = db.collection("callSessions");
const ACTIVE_CALL_MEMBER_LOCKS = db.collection("activeCallMemberLocks");
const CALL_QUOTA_WINDOWS = db.collection("callQuotaWindows");
const CALL_QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;
const CALL_AUDIO_ATTEMPT_LIMIT = 5;
const CALL_VIDEO_ATTEMPT_LIMIT = 3;
const CALL_MAX_DURATION_MS = 5 * 60 * 1000;

/**
 * Enforce the five-minute ceiling from the server timestamp created only
 * after both sides report an established RTCPeerConnection. This is a
 * server-recorded client connectivity signal, not cryptographic proof of
 * network delivery; live device acceptance remains a separate release gate.
 */
async function expireCallIfDurationElapsed(callRef: DocumentReference): Promise<string | null> {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(callRef);
    if (!snapshot.exists) return null;
    const call = snapshot.data() ?? {};
    if (call.status !== "accepted" ||
        !(call.maxDurationEndsAt instanceof Timestamp) ||
        call.maxDurationEndsAt.toMillis() > Date.now()) {
      return typeof call.status === "string" ? call.status : null;
    }
    const participantUids = Array.isArray(call.participantUids)
      ? call.participantUids.filter((uid): uid is string => typeof uid === "string")
      : [];
    const lockRefs = participantUids.map((uid) => ACTIVE_CALL_MEMBER_LOCKS.doc(uid));
    const locks = await Promise.all(lockRefs.map((lockRef) => transaction.get(lockRef)));
    transaction.update(callRef, {
      status: "ended",
      endedBy: "system",
      endReason: "maximum_duration_reached",
      endedAt: FieldValue.serverTimestamp(),
      lastActivityAt: FieldValue.serverTimestamp(),
    });
    lockRefs.forEach((lockRef, index) => {
      if (locks[index].exists && locks[index].data()?.callId === callRef.id) {
        transaction.delete(lockRef);
      }
    });
    return "duration_expired";
  });
}

export const startCall = onCall(async (request) => {
  const callerUid = requireAuthenticatedUid(request.auth?.uid);
  let input;
  try { input = validateCallRequest(request.data); }
  catch { throw new HttpsError("invalid-argument", "بيانات المكالمة غير صالحة."); }
  const callerRef = db.collection("users").doc(callerUid);
  const callRef = CALL_SESSIONS.doc(input.callId);
  let participantUids: string[] = [];
  let recipientUids: string[] = [];
  let roomRefForCall: DocumentReference | null = null;
  let roomRentalRef: DocumentReference | null = null;
  let directChatRefForCall: DocumentReference | null = null;
  let directPeerRefForCall: DocumentReference | null = null;

  if (input.scope === "direct") {
    const chatRef = db.collection("directChats").doc(input.targetId);
    directChatRefForCall = chatRef;
    const [callerSnapshot, chat] = await Promise.all([callerRef.get(), chatRef.get()]);
    if (!callerSnapshot.exists || callerSnapshot.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(callerSnapshot.data())) {
      throw new HttpsError("permission-denied", "حالة حسابك لا تسمح بإجراء المكالمات.");
    }
    const participants = chat.data()?.participantUids;
    if (!chat.exists || !Array.isArray(participants) || !participants.includes(callerUid) ||
        participants.length !== 2 || new Set(participants).size !== 2 ||
        participants.some((memberUid) => typeof memberUid !== "string" || memberUid.length < 1)) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية الاتصال بهذه المحادثة.");
    }
    participantUids = [...participants].sort();
    const peerUid = participantUids.find((uid) => uid !== callerUid)!;
    const peerRef = db.collection("users").doc(peerUid);
    directPeerRefForCall = peerRef;
    const peer = await peerRef.get();
    if (!peer.exists || peer.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(peer.data())) {
      throw new HttpsError("failed-precondition", "الطرف الآخر غير متاح للمكالمة.");
    }
    const callerData = callerSnapshot.data() ?? {};
    const peerData = peer.data() ?? {};
    if ((Array.isArray(callerData.blockedUids) && callerData.blockedUids.includes(peerUid)) ||
        (Array.isArray(peerData.blockedUids) && peerData.blockedUids.includes(callerUid))) {
      throw new HttpsError("permission-denied", "المكالمة غير متاحة بسبب إعدادات الحظر.");
    }
    if (!Number.isSafeInteger(callerData.age) || !Number.isSafeInteger(peerData.age) ||
        ((callerData.age < 18) !== (peerData.age < 18))) {
      throw new HttpsError("permission-denied", "لا يمكن إجراء المكالمة بين هاتين الفئتين العمريتين.");
    }
    recipientUids = [peerUid];
  } else {
    const roomRef = db.collection("rooms").doc(input.targetId);
    const [caller, room, membership] = await Promise.all([
      callerRef.get(), roomRef.get(),
      roomRef.collection("members").doc(callerUid).get(),
    ]);
    if (!caller.exists || caller.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(caller.data()) ||
        !room.exists || room.data()?.status !== "active" || !membership.exists) {
      throw new HttpsError("permission-denied", "يجب أن تكون عضواً في غرفة نشطة لإجراء مكالمة.");
    }
    const roomData = room.data() ?? {};
    if (roomData.kind !== "private" || roomData.isRented !== true ||
        typeof roomData.rentalId !== "string" || !roomData.rentalId) {
      throw new HttpsError("failed-precondition", "المكالمات الجماعية متاحة حصراً في الغرف الخاصة المستأجرة.");
    }
    roomRefForCall = roomRef;
    roomRentalRef = db.collection("roomRentals").doc(roomData.rentalId);
    const rental = await roomRentalRef.get();
    if (!isActiveRentedPrivateRoom(roomData, rental.data(), Date.now())) {
      throw new HttpsError("failed-precondition", "استئجار الغرفة غير نشط أو انتهت مدته؛ تعذر بدء المكالمة.");
    }
    const participantLimit = roomCallParticipantLimit(input.mode, roomData.capacity);
    if (participantLimit === null) {
      throw new HttpsError("failed-precondition", "سعة الغرفة غير صالحة لبدء المكالمة.");
    }
    const members = await roomRef.collection("members").limit(participantLimit + 1).get();
    if (members.size < 2 || members.size > participantLimit) {
      throw new HttpsError(
        "failed-precondition",
        input.mode === "video"
          ? "المكالمة المرئية الجماعية محدودة بأربعة مشاركين إجمالاً بمن فيهم المنشئ."
          : "عدد المشاركين يتجاوز سعة الغرفة أو يقل عن الحد الأدنى للمكالمة.",
      );
    }
    participantUids = members.docs.map((doc) => doc.id).sort();
    recipientUids = participantUids.filter((uid) => uid !== callerUid);
    const profiles = await db.getAll(...recipientUids.map((uid) => db.collection("users").doc(uid)));
    const callerData = caller.data() ?? {};
    if (profiles.some((profile) => {
      const peerData = profile.data() ?? {};
      return !profile.exists || peerData.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(peerData) ||
        !Number.isSafeInteger(callerData.age) || !Number.isSafeInteger(peerData.age) ||
        ((callerData.age < 18) !== (peerData.age < 18)) ||
        (Array.isArray(callerData.blockedUids) && callerData.blockedUids.includes(profile.id)) ||
        (Array.isArray(peerData.blockedUids) && peerData.blockedUids.includes(callerUid));
    })) {
      throw new HttpsError("permission-denied", "يوجد عضو غير مؤهل أو محظور ضمن المشاركين في المكالمة.");
    }
  }

  const roomMemberRefsForCall = roomRefForCall
    ? participantUids.map((memberUid) => roomRefForCall!.collection("members").doc(memberUid))
    : [];
  const callEntitlementRefs = participantUids.flatMap((memberUid) => {
    const itemIds = input.mode === "audio"
      ? ["voice_call_24h", "voice_call_7d", "voice_call_30d"]
      : ["video_call_24h", "video_call_7d", "video_call_30d"];
    return itemIds.map((itemId) =>
      db.collection("users").doc(memberUid).collection("entitlements").doc(itemId));
  });
  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + CALL_RING_TIMEOUT_MS);
  const quotaRef = CALL_QUOTA_WINDOWS.doc(callerUid);
  const result = await db.runTransaction(async (transaction) => {
    const [existing, caller, quotaSnapshot, groupCallPricingSnapshot, callEntitlementSnapshots, roomSnapshot, rentalSnapshot, roomMemberSnapshots, directChatSnapshot, directPeerSnapshot] = await Promise.all([
      transaction.get(callRef),
      transaction.get(callerRef),
      transaction.get(quotaRef),
      transaction.get(GROUP_CALL_PRICING_SETTINGS),
      Promise.all(callEntitlementRefs.map((entitlementRef) => transaction.get(entitlementRef))),
      roomRefForCall ? transaction.get(roomRefForCall) : Promise.resolve(null),
      roomRentalRef ? transaction.get(roomRentalRef) : Promise.resolve(null),
      Promise.all(roomMemberRefsForCall.map((memberRef) => transaction.get(memberRef))),
      directChatRefForCall ? transaction.get(directChatRefForCall) : Promise.resolve(null),
      directPeerRefForCall ? transaction.get(directPeerRefForCall) : Promise.resolve(null),
    ]);
    if (input.scope === "room" &&
        (!roomSnapshot?.exists || !rentalSnapshot?.exists ||
          !isActiveRentedPrivateRoom(roomSnapshot.data(), rentalSnapshot.data(), now))) {
      throw new HttpsError("failed-precondition", "الغرفة أو استئجارها لم يعد نشطاً؛ تم رفض بدء المكالمة.");
    }
    if (input.scope === "room") {
      const currentParticipantLimit = roomSnapshot?.exists
        ? roomCallParticipantLimit(input.mode, roomSnapshot.data()?.capacity)
        : null;
      if (currentParticipantLimit === null || participantUids.length > currentParticipantLimit) {
        throw new HttpsError("failed-precondition", "تغيرت سعة الغرفة قبل إنشاء المكالمة؛ أعد المحاولة.");
      }
    }
    if (input.scope === "room" && !areRoomCallParticipantsMembers(roomMemberSnapshots)) {
      throw new HttpsError("permission-denied", "تغيرت عضوية أحد المشاركين قبل إنشاء المكالمة؛ أعد المحاولة.");
    }
    const entitlementsByUid = new Map<string, Array<{ itemId: string; data: unknown }>>();
    for (const snapshot of callEntitlementSnapshots) {
      const memberUid = snapshot.ref.parent.parent?.id;
      if (!memberUid || !snapshot.exists) continue;
      const list = entitlementsByUid.get(memberUid) ?? [];
      list.push({ itemId: snapshot.id, data: snapshot.data() });
      entitlementsByUid.set(memberUid, list);
    }
    const entitlementCheck = evaluateCallParticipantEntitlements(
      participantUids, input.mode, entitlementsByUid, now,
    );
    if (!entitlementCheck.allowed) {
      throw new HttpsError(
        "failed-precondition",
        "يجب أن يمتلك كل مشارك استحقاق المكالمة الصوتية أو المرئية الساري قبل بدء المكالمة.",
      );
    }
    if (input.scope === "direct" &&
        (!directChatSnapshot?.exists || !directPeerSnapshot?.exists ||
          caller.data()?.profileCompleted !== true ||
          !isMemberAccountInGoodStanding(caller.data()) ||
          directPeerSnapshot.data()?.profileCompleted !== true ||
          !isMemberAccountInGoodStanding(directPeerSnapshot.data()) ||
          !areDirectCallParticipantsEligible(
            callerUid,
            participantUids.find((uid) => uid !== callerUid),
            directChatSnapshot.data()?.participantUids,
            caller.data(),
            directPeerSnapshot.data(),
          ))) {
      throw new HttpsError("permission-denied", "تغيرت عضوية المحادثة أو أهلية أحد الطرفين؛ تم رفض بدء المكالمة.");
    }
    if (existing.exists) {
      const prior = existing.data() ?? {};
      if (prior.callerUid === callerUid && prior.targetId === input.targetId &&
          prior.scope === input.scope && prior.mode === input.mode &&
          prior.status === "ringing" && prior.expiresAt instanceof Timestamp &&
          prior.expiresAt.toMillis() > now) {
        return { callId: input.callId, status: prior.status, participantUids: prior.participantUids ?? participantUids, idempotentReplay: true };
      }
      throw new HttpsError("already-exists", "معرف المكالمة مستخدم مسبقاً.");
    }
    if (!caller.exists || caller.data()?.profileCompleted !== true ||
        !isMemberAccountInGoodStanding(caller.data())) {
      throw new HttpsError("permission-denied", "حالة الحساب لا تسمح ببدء المكالمة.");
    }
    const memberLockRefs = participantUids.map((memberUid) => ACTIVE_CALL_MEMBER_LOCKS.doc(memberUid));
    const memberLocks = await Promise.all(memberLockRefs.map((lockRef) => transaction.get(lockRef)));
    const lockCallRefs = memberLocks.map((lock) => {
      const lockCallId = lock.data()?.callId;
      return lock.exists && typeof lockCallId === "string" && lockCallId !== input.callId
        ? CALL_SESSIONS.doc(lockCallId) : null;
    });
    const lockedCalls = await Promise.all(lockCallRefs.map((lockCallRef) =>
      lockCallRef ? transaction.get(lockCallRef) : Promise.resolve(null)));
    for (let index = 0; index < memberLocks.length; index += 1) {
      const lock = memberLocks[index];
      const lockedCall = lockedCalls[index];
      if (!lock.exists || !lockedCall?.exists) continue;
      const lockedData = lockedCall.data() ?? {};
      const memberUid = participantUids[index];
      const memberHasLeft = Array.isArray(lockedData.leftUids) && lockedData.leftUids.includes(memberUid);
      const memberDeclined = Array.isArray(lockedData.rejectedUids) && lockedData.rejectedUids.includes(memberUid);
      const isStillRinging = lockedData.status === "ringing" &&
        lockedData.expiresAt instanceof Timestamp && lockedData.expiresAt.toMillis() > now;
      if (!memberHasLeft && !memberDeclined &&
          (lockedData.status === "accepted" || isStillRinging)) {
        throw new HttpsError("resource-exhausted", "أحد المشاركين لديه مكالمة نشطة بالفعل.");
      }
    }
    const quotaNow = Date.now();
    const quotaData = quotaSnapshot.data() ?? {};
    const storedAttempts = quotaData.attempts;
    if (quotaSnapshot.exists && !Array.isArray(storedAttempts)) {
      throw new HttpsError("failed-precondition", "تعذر التحقق من سجل محاولات المكالمات بأمان.");
    }
    const allAttempts = (Array.isArray(storedAttempts) ? storedAttempts : [])
      .map((attempt: unknown) => {
        if (!attempt || typeof attempt !== "object") return null;
        const item = attempt as Record<string, unknown>;
        if (typeof item.callId !== "string" || item.callId.length < 16 ||
            (item.mode !== "audio" && item.mode !== "video") ||
            !Number.isSafeInteger(item.startedAtMs) ||
            (item.startedAtMs as number) < 0 || (item.startedAtMs as number) > quotaNow) {
          return null;
        }
        return {
          callId: item.callId,
          mode: item.mode,
          startedAtMs: item.startedAtMs as number,
        } as { callId: string; mode: "audio" | "video"; startedAtMs: number };
      });
    if (allAttempts.some((attempt) => attempt === null)) {
      throw new HttpsError("failed-precondition", "سجل محاولات المكالمات غير صالح؛ تم إيقاف بدء المكالمة لحماية الحصة.");
    }
    const recentAttempts = (allAttempts as Array<{
      callId: string; mode: "audio" | "video"; startedAtMs: number;
    }>).filter((attempt) => attempt.startedAtMs > quotaNow - CALL_QUOTA_WINDOW_MS);
    const modeAttempts = recentAttempts.filter((attempt) => attempt.mode === input.mode).length;
    const modeLimit = input.mode === "audio" ? CALL_AUDIO_ATTEMPT_LIMIT : CALL_VIDEO_ATTEMPT_LIMIT;
    if (modeAttempts >= modeLimit) {
      throw new HttpsError(
        "resource-exhausted",
        input.mode === "audio"
          ? "وصلت إلى الحد المسموح لمحاولات المكالمات الصوتية خلال آخر 24 ساعة."
          : "وصلت إلى الحد المسموح لمحاولات المكالمات المرئية خلال آخر 24 ساعة.",
      );
    }
    transaction.set(quotaRef, {
      attempts: [...recentAttempts, { callId: input.callId, mode: input.mode, startedAtMs: quotaNow }],
      updatedAt: FieldValue.serverTimestamp(),
    });
    const testPricingSnapshot = projectGroupCallTestPricingSnapshot(
      groupCallPricingSnapshot?.data(), input.mode,
    );
    transaction.create(callRef, {
      callId: input.callId, scope: input.scope, targetId: input.targetId, mode: input.mode,
      callerUid, participantUids, acceptedUids: [], rejectedUids: [], leftUids: [],
      testPricingSnapshot,
      status: "ringing", signalCounts: {}, signalsCleanedAt: false,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt, lastActivityAt: FieldValue.serverTimestamp(),
    });
    memberLockRefs.forEach((lockRef) => transaction.set(lockRef, {
      callId: input.callId, status: "active", updatedAt: FieldValue.serverTimestamp(),
    }));
    return { callId: input.callId, status: "ringing", participantUids, idempotentReplay: false };
  });
  if (!result.idempotentReplay) {
    await Promise.all(recipientUids.map((uid) => sendPushToMember(
      uid, input.mode === "video" ? "مكالمة مرئية واردة" : "مكالمة صوتية واردة",
      "لديك مكالمة واردة في مودة.",
      { type: "incoming_call", callId: input.callId, scope: input.scope, targetId: input.targetId },
    )));
  }
  return result;
});

export const respondToCall = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const callId = request.data?.callId;
  const response = request.data?.response;
  if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId) ||
      !["accept", "reject"].includes(response)) {
    throw new HttpsError("invalid-argument", "بيانات الرد على المكالمة غير صالحة.");
  }
  const ref = CALL_SESSIONS.doc(callId);
  await expireCallIfDurationElapsed(ref);
  return db.runTransaction(async (transaction) => {
    const lockRef = ACTIVE_CALL_MEMBER_LOCKS.doc(uid);
    const [snapshot, lockSnapshot] = await Promise.all([
      transaction.get(ref), transaction.get(lockRef),
    ]);
    if (!snapshot.exists) throw new HttpsError("not-found", "المكالمة غير موجودة.");
    const call = snapshot.data()!;
    if (!Array.isArray(call.participantUids) || !call.participantUids.includes(uid) ||
        uid === call.callerUid ||
        (Array.isArray(call.leftUids) && call.leftUids.includes(uid)) ||
        (Array.isArray(call.rejectedUids) && call.rejectedUids.includes(uid))) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية الرد على هذه المكالمة.");
    }
    if (response === "accept" && Array.isArray(call.participantUids) &&
        (call.mode === "audio" || call.mode === "video") &&
        typeof call.callerUid === "string") {
      const acceptedUids = Array.isArray(call.acceptedUids)
        ? call.acceptedUids.filter((memberUid): memberUid is string => typeof memberUid === "string")
        : [];
      const requiredUids = [...new Set([call.callerUid, ...acceptedUids, uid])];
      const entitlementItemIds = call.mode === "audio"
        ? ["voice_call_24h", "voice_call_7d", "voice_call_30d"]
        : ["video_call_24h", "video_call_7d", "video_call_30d"];
      const entitlementRefs = requiredUids.flatMap((memberUid) =>
        entitlementItemIds.map((itemId) =>
          db.collection("users").doc(memberUid).collection("entitlements").doc(itemId)));
      const entitlementSnapshots = await Promise.all(
        entitlementRefs.map((entitlementRef) => transaction.get(entitlementRef)),
      );
      const entitlementsByUid = new Map<string, Array<{ itemId: string; data: unknown }>>();
      for (const entitlement of entitlementSnapshots) {
        const memberUid = entitlement.ref.parent.parent?.id;
        if (!memberUid || !entitlement.exists) continue;
        const list = entitlementsByUid.get(memberUid) ?? [];
        list.push({ itemId: entitlement.id, data: entitlement.data() });
        entitlementsByUid.set(memberUid, list);
      }
      const entitlementCheck = evaluateCallParticipantEntitlements(
        requiredUids, call.mode, entitlementsByUid, Date.now(),
      );
      if (!entitlementCheck.allowed) {
        throw new HttpsError(
          "failed-precondition",
          "انتهى استحقاق المكالمة لأحد المشاركين؛ لا يمكن الانضمام قبل تجديد الاستحقاق.",
        );
      }
    }
    if (!["ringing", "accepted"].includes(String(call.status)) ||
        (call.status === "ringing" &&
          (!(call.expiresAt instanceof Timestamp) || call.expiresAt.toMillis() <= Date.now()))) {
      throw new HttpsError("failed-precondition", "انتهت مهلة المكالمة أو لم تعد متاحة.");
    }
    if (response === "reject" && call.status !== "ringing" && call.status !== "accepted") {
      throw new HttpsError("failed-precondition", "لا يمكن رفض المكالمة في حالتها الحالية.");
    }
    if (response === "reject" && Array.isArray(call.acceptedUids) && call.acceptedUids.includes(uid)) {
      throw new HttpsError("failed-precondition", "لقد انضممت بالفعل إلى المكالمة.");
    }
    const next = response === "accept" ? "accepted" : "rejected";
    if (call.status === "ringing" &&
        !canTransitionCall("ringing", next, uid, call.callerUid, call.participantUids)) {
      throw new HttpsError("failed-precondition", "انتقال حالة المكالمة غير مسموح.");
    }
    const field = response === "accept" ? "acceptedUids" : "rejectedUids";
    const prior = Array.isArray(call[field]) ? call[field] as string[] : [];
    const rejected = response === "reject"
      ? [...(Array.isArray(call.rejectedUids) ? call.rejectedUids as string[] : []), uid]
      : (Array.isArray(call.rejectedUids) ? call.rejectedUids as string[] : []);
    const calleeUids = call.participantUids.filter((memberUid: string) => memberUid !== call.callerUid);
    const allRejected = calleeUids.every((memberUid: string) => rejected.includes(memberUid));
    if (!prior.includes(uid)) transaction.update(ref, {
      [field]: FieldValue.arrayUnion(uid),
      ...(response === "accept" ? { status: "accepted" } :
        call.scope === "room" ? (allRejected ? { status: "rejected" } : {}) :
        { status: "rejected" }),
      respondedAt: FieldValue.serverTimestamp(),
      lastActivityAt: FieldValue.serverTimestamp(),
    });
    if (response === "reject" && lockSnapshot.exists && lockSnapshot.data()?.callId === callId) {
      transaction.delete(lockRef);
    }
    return { callId, status: response === "accept" ? "accepted" : (allRejected ? "rejected" : call.status),
      idempotentReplay: prior.includes(uid) };
  });
});

/**
 * Each endpoint reports the local WebRTC connected state. The server starts
 * one immutable five-minute clock only after the caller and at least one
 * accepted recipient have both reported connected.
 */
export const markCallConnected = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const callId = request.data?.callId;
  if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId)) {
    throw new HttpsError("invalid-argument", "معرف المكالمة غير صالح.");
  }
  const ref = CALL_SESSIONS.doc(callId);
  const expiryStatus = await expireCallIfDurationElapsed(ref);
  if (expiryStatus === "duration_expired") {
    throw new HttpsError("deadline-exceeded", "انتهت مدة المكالمة القصوى.");
  }
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError("not-found", "المكالمة غير موجودة.");
    const call = snapshot.data() ?? {};
    const participantUids = Array.isArray(call.participantUids) ? call.participantUids as string[] : [];
    const acceptedUids = Array.isArray(call.acceptedUids) ? call.acceptedUids as string[] : [];
    const rejectedUids = Array.isArray(call.rejectedUids) ? call.rejectedUids as string[] : [];
    const leftUids = Array.isArray(call.leftUids) ? call.leftUids as string[] : [];
    if (!participantUids.includes(uid) || rejectedUids.includes(uid) || leftUids.includes(uid) ||
        (uid !== call.callerUid && !acceptedUids.includes(uid))) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية تثبيت اتصال هذه المكالمة.");
    }
    if (call.status !== "accepted") {
      throw new HttpsError("failed-precondition", "لا يمكن تثبيت الاتصال قبل قبول المكالمة.");
    }
    if (call.maxDurationEndsAt instanceof Timestamp &&
        call.maxDurationEndsAt.toMillis() <= Date.now()) {
      throw new HttpsError("deadline-exceeded", "انتهت مدة المكالمة القصوى.");
    }
    if (call.maxDurationEndsAt instanceof Timestamp) {
      return {
        callId, connected: true,
        connectedAtMs: call.connectedAt instanceof Timestamp ? call.connectedAt.toMillis() : null,
        maxDurationEndsAtMs: call.maxDurationEndsAt.toMillis(),
        idempotentReplay: true,
      };
    }
    const connectedUids = [...new Set([
      ...(Array.isArray(call.connectedUids) ? call.connectedUids.filter((value): value is string => typeof value === "string") : []),
      uid,
    ])];
    const hasCaller = connectedUids.includes(String(call.callerUid));
    const hasAcceptedRecipient = connectedUids.some((memberUid) =>
      memberUid !== call.callerUid && acceptedUids.includes(memberUid));
    if (hasCaller && hasAcceptedRecipient) {
      const nowMs = Date.now();
      const connectedAt = Timestamp.fromMillis(nowMs);
      const maxDurationEndsAt = Timestamp.fromMillis(nowMs + CALL_MAX_DURATION_MS);
      transaction.update(ref, {
        connectedUids,
        connectedAt,
        maxDurationEndsAt,
        lastActivityAt: FieldValue.serverTimestamp(),
      });
      return {
        callId, connected: true, connectedAtMs: nowMs,
        maxDurationEndsAtMs: maxDurationEndsAt.toMillis(),
        idempotentReplay: false,
      };
    }
    transaction.update(ref, {
      connectedUids,
      lastActivityAt: FieldValue.serverTimestamp(),
    });
    return { callId, connected: false, idempotentReplay: false };
  });
});

export const sendCallSignal = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const callId = request.data?.callId;
  const toUid = request.data?.toUid;
  let signal;
  try { signal = validateCallSignal(request.data?.signal); }
  catch { throw new HttpsError("invalid-argument", "بيانات إشارة الاتصال غير صالحة."); }
  if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId) ||
      typeof toUid !== "string" || toUid.length < 1 || toUid.length > 128 || toUid === uid) {
    throw new HttpsError("invalid-argument", "معرف المكالمة أو مستلم الإشارة غير صالح.");
  }
  const ref = CALL_SESSIONS.doc(callId);
  const currentStatus = await expireCallIfDurationElapsed(ref);
  if (currentStatus === "duration_expired") throw new HttpsError("deadline-exceeded", "انتهت مدة المكالمة القصوى.");
  const streamId = createHash("sha256").update(uid + ":" + toUid).digest("hex");
  const signalRef = ref.collection("signals").doc(streamId + "_" + signal.sequence);
  await db.runTransaction(async (transaction) => {
    const [snapshot, existing] = await Promise.all([
      transaction.get(ref), transaction.get(signalRef),
    ]);
    if (!snapshot.exists) throw new HttpsError("not-found", "المكالمة غير موجودة.");
    const call = snapshot.data()!;
    if (!Array.isArray(call.participantUids) || !call.participantUids.includes(uid) ||
        !call.participantUids.includes(toUid) ||
        (Array.isArray(call.leftUids) && call.leftUids.includes(uid)) ||
        (Array.isArray(call.leftUids) && call.leftUids.includes(toUid)) ||
        (Array.isArray(call.rejectedUids) && call.rejectedUids.includes(uid)) ||
        (Array.isArray(call.rejectedUids) && call.rejectedUids.includes(toUid)) ||
        !["ringing", "accepted"].includes(String(call.status))) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إرسال إشارات إلى هذا العضو في المكالمة.");
    }
    if (call.status === "ringing" && signal.kind === "answer") {
      throw new HttpsError("failed-precondition", "لا يمكن إرسال إجابة قبل قبول المكالمة.");
    }
    if (signal.kind === "offer" && uid !== call.callerUid) {
      throw new HttpsError("permission-denied", "إنشاء عرض الاتصال مخصص لمنشئ المكالمة.");
    }
    if (signal.kind === "answer" && uid === call.callerUid) {
      throw new HttpsError("permission-denied", "لا يمكن لمنشئ المكالمة إرسال إجابة الطرف الآخر.");
    }
    if (call.status === "ringing" &&
        (!(call.expiresAt instanceof Timestamp) || call.expiresAt.toMillis() <= Date.now())) {
      throw new HttpsError("deadline-exceeded", "انتهت مهلة رنين المكالمة.");
    }
    if (existing.exists) {
      const prior = existing.data() ?? {};
      if (prior.kind !== signal.kind || prior.payload !== signal.payload) {
        throw new HttpsError("already-exists", "رقم تسلسل الإشارة مستخدم بمحتوى مختلف.");
      }
      return;
    }
    const counts = (call.signalCounts ?? {}) as Record<string, number>;
    const expected = Number.isSafeInteger(counts[streamId]) ? counts[streamId] : 0;
    if (signal.sequence !== expected || expected >= CALL_SIGNAL_MAX_PER_CALLER) {
      throw new HttpsError("resource-exhausted", "تسلسل الإشارات غير صحيح أو تجاوز الحد المسموح.");
    }
    transaction.create(signalRef, {
      senderUid: uid, recipientUid: toUid, kind: signal.kind, payload: signal.payload,
      sequence: signal.sequence, createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + CALL_SIGNAL_MAX_AGE_MS),
    });
    transaction.update(ref, {
      signalCounts: { ...counts, [streamId]: expected + 1 },
      lastActivityAt: FieldValue.serverTimestamp(),
    });
  });
  return { accepted: true, sequence: signal.sequence };
});

export const getCallSignals = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const callId = request.data?.callId;
  const afterSequence = request.data?.afterSequence ?? -1;
  const afterSignalId = request.data?.afterSignalId;
  if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId) ||
      !Number.isSafeInteger(afterSequence) || afterSequence < -1 ||
      (afterSignalId !== undefined && (typeof afterSignalId !== "string" ||
        !/^[a-f0-9]{64}_\\d+$/.test(afterSignalId)))) {
    throw new HttpsError("invalid-argument", "طلب قراءة إشارات المكالمة غير صالح.");
  }
  const ref = CALL_SESSIONS.doc(callId);
  await expireCallIfDurationElapsed(ref);
  const call = await ref.get();
  if (!call.exists || !Array.isArray(call.data()?.participantUids) ||
      !call.data()!.participantUids.includes(uid) ||
      (Array.isArray(call.data()?.leftUids) && call.data()!.leftUids.includes(uid)) ||
      (Array.isArray(call.data()?.rejectedUids) && call.data()!.rejectedUids.includes(uid))) {
    throw new HttpsError("permission-denied", "لا تملك صلاحية قراءة إشارات هذه المكالمة.");
  }
  let callStatus = call.data()?.status;
  const expiresAt = call.data()?.expiresAt;
  if (callStatus === "ringing" &&
      (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() <= Date.now())) {
    callStatus = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      if (!current.exists) return "missing";
      const currentData = current.data() ?? {};
      if (currentData.status !== "ringing") return String(currentData.status ?? "missing");
      if (currentData.expiresAt instanceof Timestamp && currentData.expiresAt.toMillis() > Date.now()) {
        return "ringing";
      }
      transaction.update(ref, {
        status: "missed", endedAt: FieldValue.serverTimestamp(),
        lastActivityAt: FieldValue.serverTimestamp(),
      });
      return "missed";
    });
  }
  if (!["ringing", "accepted"].includes(String(callStatus))) {
    return { status: callStatus, signals: [], nextCursor: afterSignalId ?? null, hasMore: false };
  }
  const signalCollection = ref.collection("signals");
  let signalsQuery = signalCollection
    .where("recipientUid", "==", uid)
    .where("createdAt", ">=", Timestamp.fromMillis(Date.now() - CALL_SIGNAL_MAX_AGE_MS))
    .orderBy("createdAt", "asc")
    .orderBy(FieldPath.documentId(), "asc")
    .limit(100);
  if (typeof afterSignalId === "string") {
    const cursor = await signalCollection.doc(afterSignalId).get();
    if (cursor.exists && cursor.data()?.recipientUid === uid) {
      signalsQuery = signalsQuery.startAfter(cursor);
    }
  }
  const snapshot = await signalsQuery.get();
  const signals = snapshot.docs
    .filter((doc) => doc.data().senderUid !== uid &&
      typeof doc.data().sequence === "number" && doc.data().sequence > afterSequence)
    .map((doc) => ({ ...doc.data(), signalId: doc.id, sequence: doc.data().sequence as number }));
  return {
    status: callStatus,
    signals,
    nextCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1].id : afterSignalId ?? null,
    hasMore: snapshot.size === 100,
  };
});

export const endCall = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const callId = request.data?.callId;
  if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId)) {
    throw new HttpsError("invalid-argument", "معرف المكالمة غير صالح.");
  }
  const ref = CALL_SESSIONS.doc(callId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return { callId, status: "ended", idempotentReplay: true };
    const call = snapshot.data()!;
    if (!Array.isArray(call.participantUids) || !call.participantUids.includes(uid)) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إنهاء هذه المكالمة.");
    }
    const lockRefs = call.participantUids.map((memberUid: string) => ACTIVE_CALL_MEMBER_LOCKS.doc(memberUid));
    const lockSnapshots = await Promise.all(lockRefs.map((lockRef) =>
      transaction.get(lockRef)));
    const leftUids = Array.isArray(call.leftUids) ? call.leftUids as string[] : [];
    if (leftUids.includes(uid)) return { callId, status: call.status, idempotentReplay: true };
    if (call.scope === "room" && uid !== call.callerUid) {
      if (call.status === "ringing") {
        const rejected = Array.isArray(call.rejectedUids) ? call.rejectedUids as string[] : [];
        const nextRejected = [...rejected, uid];
        const calleeUids = call.participantUids.filter((memberUid: string) => memberUid !== call.callerUid);
        const allRejected = calleeUids.every((memberUid: string) => nextRejected.includes(memberUid));
        transaction.update(ref, {
          rejectedUids: FieldValue.arrayUnion(uid),
          ...(allRejected ? { status: "rejected" } : {}),
          lastActivityAt: FieldValue.serverTimestamp(),
        });
        if (lockSnapshots[call.participantUids.indexOf(uid)]?.data()?.callId === callId) {
          transaction.delete(ACTIVE_CALL_MEMBER_LOCKS.doc(uid));
        }
        return { callId, status: allRejected ? "rejected" : "ringing", idempotentReplay: false };
      }
      if (call.status === "accepted") {
        transaction.update(ref, {
          leftUids: FieldValue.arrayUnion(uid),
          acceptedUids: FieldValue.arrayRemove(uid),
          lastActivityAt: FieldValue.serverTimestamp(),
        });
        if (lockSnapshots[call.participantUids.indexOf(uid)]?.data()?.callId === callId) {
          transaction.delete(ACTIVE_CALL_MEMBER_LOCKS.doc(uid));
        }
        return { callId, status: "accepted", idempotentReplay: false };
      }
    }
    const next = call.status === "ringing" && uid === call.callerUid ? "cancelled" : "ended";
    if (!canTransitionCall(call.status, next, uid, call.callerUid, call.participantUids)) {
      if (["ended", "cancelled", "rejected", "missed"].includes(String(call.status))) {
        return { callId, status: call.status, idempotentReplay: true };
      }
      throw new HttpsError("failed-precondition", "لا يمكن إنهاء المكالمة في حالتها الحالية.");
    }
    transaction.update(ref, {
      status: next, endedBy: uid, endedAt: FieldValue.serverTimestamp(),
      lastActivityAt: FieldValue.serverTimestamp(),
    });
    lockRefs.forEach((lockRef, index) => {
      if (lockSnapshots[index]?.data()?.callId === callId) transaction.delete(lockRef);
    });
    return { callId, status: next, idempotentReplay: false };
  });
});


export const getCallIceConfiguration = onCall(
  { secrets: [mawddaTurnSharedSecret] },
  async (request) => {
    const uid = requireAuthenticatedUid(request.auth?.uid);
    const callId = request.data?.callId;
    if (typeof callId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(callId)) {
      throw new HttpsError("invalid-argument", "معرف المكالمة غير صالح.");
    }
    const callRef = CALL_SESSIONS.doc(callId);
    await expireCallIfDurationElapsed(callRef);
    const call = await callRef.get();
    if (!call.exists || !Array.isArray(call.data()?.participantUids) ||
        !call.data()!.participantUids.includes(uid) ||
        (Array.isArray(call.data()?.leftUids) && call.data()!.leftUids.includes(uid)) ||
        (Array.isArray(call.data()?.rejectedUids) && call.data()!.rejectedUids.includes(uid)) ||
        !["ringing", "accepted"].includes(String(call.data()?.status))) {
      throw new HttpsError("permission-denied", "لا تملك صلاحية إعداد الاتصال لهذه المكالمة.");
    }
    if (call.data()?.status === "ringing" &&
        (!(call.data()?.expiresAt instanceof Timestamp) ||
          call.data()!.expiresAt.toMillis() <= Date.now())) {
      const resolvedStatus = await db.runTransaction(async (transaction) => {
        const current = await transaction.get(CALL_SESSIONS.doc(callId));
        if (!current.exists) return "missing";
        const currentData = current.data() ?? {};
        if (currentData.status !== "ringing") return String(currentData.status ?? "missing");
        if (currentData.expiresAt instanceof Timestamp && currentData.expiresAt.toMillis() > Date.now()) {
          return "ringing";
        }
        transaction.update(CALL_SESSIONS.doc(callId), {
          status: "missed", endedAt: FieldValue.serverTimestamp(),
          lastActivityAt: FieldValue.serverTimestamp(),
        });
        return "missed";
      });
      if (resolvedStatus === "missed") {
        throw new HttpsError("deadline-exceeded", "انتهت مهلة رنين المكالمة.");
      }
      if (!["ringing", "accepted"].includes(resolvedStatus)) {
        throw new HttpsError("permission-denied", "لم تعد المكالمة متاحة لإعداد الاتصال.");
      }
    }
    const iceServers: Array<Record<string, unknown>> = [
      { urls: ["stun:stun.l.google.com:19302"] },
    ];
    const urls = mawddaTurnUrls.value().split(",").map((value) => value.trim())
      .filter((value) => /^(turn|turns):[^\\s]+$/.test(value));
    if (urls.length > 0) {
      const sharedSecret = mawddaTurnSharedSecret.value();
      if (sharedSecret.length < 32) {
        throw new HttpsError("failed-precondition", "إعدادات خادم TURN غير مكتملة.");
      }
      const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
      const username = `${expiresAt}:${uid}`;
      const credential = createHmac("sha1", sharedSecret).update(username).digest("base64");
      iceServers.push({ urls, username, credential });
    }
    return { iceServers, turnConfigured: iceServers.length > 1, credentialTtlSeconds: 900 };
  },
);

export const getActiveCall = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const lockRef = ACTIVE_CALL_MEMBER_LOCKS.doc(uid);
  const initialLock = await lockRef.get();
  const initialCallId = initialLock.data()?.callId;
  if (typeof initialCallId === "string") {
    await expireCallIfDurationElapsed(CALL_SESSIONS.doc(initialCallId));
  }
  return db.runTransaction(async (transaction) => {
    const lockSnapshot = await transaction.get(lockRef);
    const callId = lockSnapshot.data()?.callId;
    if (!lockSnapshot.exists || typeof callId !== "string") return { active: false };
    const callRef = CALL_SESSIONS.doc(callId);
    const callSnapshot = await transaction.get(callRef);
    if (!callSnapshot.exists) {
      transaction.delete(lockRef);
      return { active: false };
    }
    const data = callSnapshot.data()!;
    const isParticipant = Array.isArray(data.participantUids) && data.participantUids.includes(uid);
    const isRejected = Array.isArray(data.rejectedUids) && data.rejectedUids.includes(uid);
    const hasLeft = Array.isArray(data.leftUids) && data.leftUids.includes(uid);
    const expiredRinging = data.status === "ringing" &&
      (!(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now());
    if (!isParticipant || isRejected || hasLeft ||
        !["ringing", "accepted"].includes(String(data.status)) || expiredRinging) {
      if (expiredRinging) transaction.update(callRef, {
        status: "missed", endedAt: FieldValue.serverTimestamp(),
        lastActivityAt: FieldValue.serverTimestamp(),
      });
      transaction.delete(lockRef);
      return { active: false };
    }
    return {
      active: true, callId, scope: data.scope, targetId: data.targetId,
      mode: data.mode, status: data.status, callerUid: data.callerUid,
      testPricingSnapshot: data.testPricingSnapshot ?? null,
      participantUids: data.participantUids,
      acceptedUids: data.acceptedUids ?? [],
      rejectedUids: data.rejectedUids ?? [],
      expiresAtMs: data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : null,
      connectedAtMs: data.connectedAt instanceof Timestamp ? data.connectedAt.toMillis() : null,
      maxDurationEndsAtMs: data.maxDurationEndsAt instanceof Timestamp ? data.maxDurationEndsAt.toMillis() : null,
    };
  });
});


export const cleanupExpiredCallSignals = onSchedule("every 5 minutes", async () => {
  const now = Timestamp.now();
  const ringingCalls = await CALL_SESSIONS.where("status", "==", "ringing").limit(200).get();
  const expiredCalls = ringingCalls.docs.filter((doc) =>
    doc.data().expiresAt instanceof Timestamp && doc.data().expiresAt.toMillis() <= now.toMillis());
  for (const doc of expiredCalls) {
    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(doc.ref);
      if (!current.exists || current.data()?.status !== "ringing" ||
          !(current.data()?.expiresAt instanceof Timestamp) ||
          current.data()!.expiresAt.toMillis() > Date.now()) return;
      transaction.update(doc.ref, {
        status: "missed", endedAt: FieldValue.serverTimestamp(),
        lastActivityAt: FieldValue.serverTimestamp(),
      });
    });
  }
  const durationExpiredCalls = await CALL_SESSIONS
    .where("maxDurationEndsAt", "<=", now)
    .limit(200).get();
  for (const doc of durationExpiredCalls.docs) {
    const deadline = doc.data().maxDurationEndsAt;
    if (deadline instanceof Timestamp && deadline.toMillis() <= Date.now()) {
      await expireCallIfDurationElapsed(doc.ref);
    }
  }
  const oldCalls = await CALL_SESSIONS.where("signalsCleanedAt", "==", false)
    .where("createdAt", "<=", Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000))
    .limit(100).get();
  for (const doc of oldCalls.docs) {
    while (true) {
      const signals = await doc.ref.collection("signals")
        .where("expiresAt", "<=", now).limit(499).get();
      if (signals.empty) break;
      const batch = db.batch();
      signals.docs.forEach((signal) => batch.delete(signal.ref));
      await batch.commit();
    }
    await doc.ref.update({
      signalsCleanedAt: true,
      signalsCleanedAtTimestamp: FieldValue.serverTimestamp(),
    });
  }
});


/**
 * Super-owner controlled development tariff. Values are test-only configuration;
 * the separate collection gate is hard-disabled and cannot be enabled here.
 */
export const getOwnerGroupCallPricingPolicy = onCall(async (request) => {
  requireOwner(request);
  const snapshot = await GROUP_CALL_PRICING_SETTINGS.get();
  if (!snapshot.exists) {
    return { configured: false, policy: null, billingEnabled: false, environment: "test_only" };
  }
  let policy;
  try { policy = validateGroupCallEntitlementPolicy(snapshot.data()?.policy); }
  catch {
    throw new HttpsError("failed-precondition", "إعدادات أسعار المكالمات التجريبية غير صالحة؛ لم نعرضها.");
  }
  return {
    configured: true, policy,
    billingEnabled: isGroupCallBillingCollectionEnabled(snapshot.data()),
    environment: "test_only",
  };
});

export const setOwnerGroupCallPricingPolicy = onCall(async (request) => {
  const actorUid = requireOwner(request);
  const audioCoinsPerMinute = request.data?.audioCoinsPerMinute;
  const videoCoinsPerMinute = request.data?.videoCoinsPerMinute;
  const active = request.data?.active;
  if (typeof active !== "boolean" ||
      !Number.isSafeInteger(audioCoinsPerMinute) || audioCoinsPerMinute < 0 ||
      !Number.isSafeInteger(videoCoinsPerMinute) || videoCoinsPerMinute < 0 ||
      (active && audioCoinsPerMinute === 0 && videoCoinsPerMinute === 0)) {
    throw new HttpsError("invalid-argument", "أسعار المكالمات التجريبية أو حالة تفعيلها غير صالحة.");
  }
  const policy = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(GROUP_CALL_PRICING_SETTINGS);
    const oldVersion = previous.data()?.policy?.version ?? 0;
    if (!Number.isSafeInteger(oldVersion) || oldVersion < 0) {
      throw new HttpsError("failed-precondition", "إصدار سياسة أسعار المكالمات غير صالح.");
    }
    const nextVersion = oldVersion + 1;
    if (!Number.isSafeInteger(nextVersion)) {
      throw new HttpsError("resource-exhausted", "تعذر إنشاء إصدار جديد لسياسة أسعار المكالمات.");
    }
    const next = validateGroupCallEntitlementPolicy({
      policyId: `group_call_${randomUUID()}`,
      version: nextVersion,
      active,
      audioCoinsPerMinute,
      videoCoinsPerMinute,
      updatedAtMs: Date.now(),
      environment: "test_only",
      billingEnabled: false,
    });
    transaction.set(GROUP_CALL_PRICING_SETTINGS, {
      policy: next,
      environment: "test_only",
      billingEnabled: false,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorUid,
      createdAt: previous.data()?.createdAt ?? FieldValue.serverTimestamp(),
    });
    return next;
  });
  await appendOwnerReviewAuditEvent({
    actorUid, action: "group_call_test_pricing_policy_updated",
    policyId: policy.policyId, version: policy.version,
    active: policy.active,
    audioCoinsPerMinute: policy.audioCoinsPerMinute,
    videoCoinsPerMinute: policy.videoCoinsPerMinute,
    billingEnabled: false, environment: "test_only", outcome: "success",
  });
  return { saved: true, policy, billingEnabled: false, environment: "test_only" };
});

/** Member-visible sent/received gift history; only whitelisted fields leave the server. */
export const getMyStoreGiftHistory = onCall(async (request) => {
  const uid = requireAuthenticatedUid(request.auth?.uid);
  const member = await db.collection("users").doc(uid).get();
  if (!member.exists || member.data()?.profileCompleted !== true ||
      !isMemberAccountInGoodStanding(member.data())) {
    throw new HttpsError("permission-denied", "سجل الهدايا متاح للأعضاء المسجلين النشطين فقط.");
  }
  const [sent, received] = await Promise.all([
    db.collection("storeGifts").where("senderUid", "==", uid).orderBy("createdAt", "desc").limit(50).get(),
    db.collection("storeGifts").where("recipientUid", "==", uid).orderBy("createdAt", "desc").limit(50).get(),
  ]);
  const entries = [
    ...sent.docs,
    ...received.docs.filter((doc) => !sent.docs.some((sentDoc) => sentDoc.id === doc.id)),
  ].map((doc) => projectStoreGiftHistoryEntry(doc.data(), uid))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => (right.createdAtMs ?? 0) - (left.createdAtMs ?? 0))
    .slice(0, 50);
  return { entries, truncated: sent.size === 50 || received.size === 50 };
});
