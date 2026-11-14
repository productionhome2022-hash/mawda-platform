import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

const db = () => getFirestore();
const GUEST_DURATION_MS = 60 * 60 * 1000;
const GUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;

type GuestRequest = { auth?: { uid: string; token: Record<string, unknown> } | null; data?: Record<string, unknown> };

function requireAnonymousGuest(request: GuestRequest): string {
  const uid = request.auth?.uid;
  const firebase = request.auth?.token?.firebase;
  const provider = firebase && typeof firebase === "object" && !Array.isArray(firebase)
    ? (firebase as Record<string, unknown>).sign_in_provider : null;
  if (!uid) throw new HttpsError("unauthenticated", "يجب بدء جلسة زائر أولاً.");
  if (provider !== "anonymous") throw new HttpsError("permission-denied", "هذه العملية مخصصة لجلسات الزوار المجهولة فقط.");
  return uid;
}

export function isGuestSessionActive(session: Record<string, unknown> | undefined, nowMs = Date.now()): boolean {
  if (!session || session.status !== "active") return false;
  const expiresAt = session.expiresAt;
  const expiresAtMs = expiresAt instanceof Timestamp ? expiresAt.toMillis()
    : typeof expiresAt === "number" ? expiresAt : NaN;
  return Number.isFinite(expiresAtMs) && expiresAtMs > nowMs;
}

export function isGuestCooldownActive(session: Record<string, unknown> | undefined, nowMs = Date.now()): boolean {
  if (!session) return false;
  const nextEligibleAt = session.nextEligibleAt;
  const nextEligibleAtMs = nextEligibleAt instanceof Timestamp ? nextEligibleAt.toMillis()
    : typeof nextEligibleAt === "number" ? nextEligibleAt : 0;
  return Number.isFinite(nextEligibleAtMs) && nextEligibleAtMs > nowMs;
}

async function cleanupGuestRoomMemberships(uid: string): Promise<void> {
  const memberships = await db().collectionGroup("members")
    .where("uid", "==", uid)
    .limit(200)
    .get();
  await Promise.all(memberships.docs.map(async (membership) => {
    const roomRef = membership.ref.parent.parent;
    if (!roomRef) return;
    await db().runTransaction(async (transaction) => {
      const [latestMembership, room] = await Promise.all([
        transaction.get(membership.ref), transaction.get(roomRef),
      ]);
      if (!latestMembership.exists) return;
      transaction.delete(membership.ref);
      if (room.exists) {
        const currentCount = room.data()?.memberCount;
        const nextCount = Number.isSafeInteger(currentCount)
          ? Math.max(0, Number(currentCount) - 1) : 0;
        transaction.update(roomRef, {
          memberCount: nextCount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
  }));
}

function validateGuestProfile(data: Record<string, unknown>) {
  const username = typeof data.username === "string" ? data.username.trim() : "";
  const country = typeof data.country === "string" ? data.country.trim() : "";
  const gender = data.gender;
  if (!/^[\p{L}\p{N}_ .-]{3,24}$/u.test(username) || /[<>]/.test(username)) {
    throw new HttpsError("invalid-argument", "اسم المستخدم يجب أن يكون من 3 إلى 24 حرفاً أو رقماً.");
  }
  if (country.length < 2 || country.length > 60 ||
      /[<>\u0000-\u001f]/.test(country)) {
    throw new HttpsError("invalid-argument", "أدخل اسم دولة صحيحاً.");
  }
  if (gender !== "male" && gender !== "female") {
    throw new HttpsError("invalid-argument", "اختر الجنس بصورة صحيحة.");
  }
  return { username, usernameNormalized: username.toLocaleLowerCase(), country, gender };
}

/** Creates a minimal guest profile and starts the server-timed 60m/24h allowance. */
export const startGuestSession = onCall(async (request) => {
  const uid = requireAnonymousGuest(request as GuestRequest);
  const profile = validateGuestProfile((request.data ?? {}) as Record<string, unknown>);
  const profileRef = db().collection("guestProfiles").doc(uid);
  const sessionRef = db().collection("guestSessions").doc(uid);
  const nowMs = Date.now();
  const expiresAt = Timestamp.fromMillis(nowMs + GUEST_DURATION_MS);
  const nextEligibleAt = Timestamp.fromMillis(nowMs + GUEST_COOLDOWN_MS);

  return db().runTransaction(async (transaction) => {
    const [profileSnapshot, sessionSnapshot] = await Promise.all([
      transaction.get(profileRef), transaction.get(sessionRef),
    ]);
    const existing = sessionSnapshot.data() ?? {};
    if (isGuestSessionActive(existing, nowMs)) {
      if (!profileSnapshot.exists) {
        transaction.create(profileRef, {
          uid, ...profile, createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        transaction.update(profileRef, { ...profile, updatedAt: FieldValue.serverTimestamp() });
      }
      return {
        active: true,
        expiresAt: (existing.expiresAt as Timestamp).toMillis(),
        nextEligibleAt: (existing.nextEligibleAt as Timestamp).toMillis(),
        idempotentReplay: true,
      };
    }

    const previousNext = existing.nextEligibleAt;
    const previousNextMs = previousNext instanceof Timestamp ? previousNext.toMillis()
      : typeof previousNext === "number" ? previousNext : 0;
    if (isGuestCooldownActive(existing, nowMs)) {
      throw new HttpsError("resource-exhausted", "انتهت جلسة الزائر أو أُغلقت. يمكنك العودة بعد انتهاء نافذة الـ24 ساعة.", {
        retryAt: previousNextMs,
      });
    }

    const profileData = {
      uid, ...profile,
      createdAt: profileSnapshot.exists ? profileSnapshot.data()?.createdAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    transaction.set(profileRef, profileData, { merge: true });
    transaction.set(sessionRef, {
      uid,
      status: "active",
      startedAt: Timestamp.fromMillis(nowMs),
      expiresAt,
      nextEligibleAt,
      durationMs: GUEST_DURATION_MS,
      rollingWindowMs: GUEST_COOLDOWN_MS,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { active: true, expiresAt: expiresAt.toMillis(), nextEligibleAt: nextEligibleAt.toMillis(), idempotentReplay: false };
  });
});

/** Read-only status; server timestamps are returned for display, never accepted from clients. */
export const getGuestSessionStatus = onCall(async (request) => {
  const uid = requireAnonymousGuest(request as GuestRequest);
  const [profile, session] = await Promise.all([
    db().collection("guestProfiles").doc(uid).get(),
    db().collection("guestSessions").doc(uid).get(),
  ]);
  let data = session.data() ?? {};
  const active = isGuestSessionActive(data);
  if (!active && data.status === "active") {
    await db().collection("guestSessions").doc(uid).update({
      status: "expired",
      expiredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await cleanupGuestRoomMemberships(uid);
    data = { ...data, status: "expired" };
  }
  const asMillis = (value: unknown) => value instanceof Timestamp ? value.toMillis()
    : typeof value === "number" ? value : null;
  return {
    hasProfile: profile.exists,
    active,
    profile: profile.exists ? {
      username: profile.data()?.username ?? "",
      country: profile.data()?.country ?? "",
      gender: profile.data()?.gender ?? "",
    } : null,
    expiresAt: asMillis(data.expiresAt),
    nextEligibleAt: asMillis(data.nextEligibleAt),
  };
});

/** Ends active room access but retains the server cooldown and anonymous identity. */
export const endGuestSession = onCall(async (request) => {
  const uid = requireAnonymousGuest(request as GuestRequest);
  const ref = db().collection("guestSessions").doc(uid);
  await db().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return;
    transaction.update(ref, {
      status: "ended",
      endedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await cleanupGuestRoomMemberships(uid);
  return { ended: true };
});

/** Public discovery is deliberately restricted to explicitly reviewed all-ages rooms. */
export const listGuestPublicRooms = onCall(async (request) => {
  const uid = requireAnonymousGuest(request as GuestRequest);
  const [profile, session] = await Promise.all([
    db().collection("guestProfiles").doc(uid).get(),
    db().collection("guestSessions").doc(uid).get(),
  ]);
  if (!profile.exists || !isGuestSessionActive(session.data())) {
    throw new HttpsError("permission-denied", "أكمل بيانات الزائر وابدأ جلسة صالحة قبل تصفح الغرف.");
  }
  const roomSnapshot = await db().collection("rooms")
    .where("status", "==", "active")
    .limit(200)
    .get();
  const rooms = roomSnapshot.docs.filter((room) =>
    room.data().kind === "public" &&
    room.data().audience === "all_ages" &&
    room.data().guestAudienceApproved === true,
  ).slice(0, 100);
  return {
    rooms: rooms.map((room) => ({
      roomId: room.id,
      name: room.data().name ?? "غرفة عامة",
      memberCount: room.data().memberCount ?? 0,
      capacity: room.data().capacity ?? 0,
    })),
  };
});


/** Scheduled cleanup prevents expired guest memberships from inflating room counts. */
export const cleanupExpiredGuestSessions = onSchedule("every 5 minutes", async () => {
  const nowMs = Date.now();
  const snapshot = await db().collection("guestSessions")
    .where("expiresAt", "<=", Timestamp.fromMillis(nowMs))
    .limit(200)
    .get();
  for (const document of snapshot.docs) {
    const data = document.data();
    if (data.status !== "active" || isGuestSessionActive(data, nowMs)) continue;
    await db().runTransaction(async (transaction) => {
      const latest = await transaction.get(document.ref);
      if (!latest.exists || latest.data()?.status !== "active" ||
          isGuestSessionActive(latest.data(), nowMs)) return;
      transaction.update(document.ref, {
        status: "expired",
        expiredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await cleanupGuestRoomMemberships(document.id);
  }
});
