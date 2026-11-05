import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase.js";

/**
 * خدمة الحظر السيادي والاستعلامات الأمنية (خاص بالسوبر أدمن)
 * تشمل: الحظر الكلي للـ IP والبصمة، البحث عن الأعضاء، وتغيير كلمات السر
 */

// 1. فحص الملف الأمني الكامل لأي عضو عبر المعرف أو الإيميل
export async function getMemberDossier(identifier) {
  try {
    const usersRef = collection(db, "users");
    // البحث إما برقم المعرف الفريد (uniqueId) أو الإيميل
    const q = query(usersRef, where("uniqueId", "==", identifier));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "لم يتم العثور على العضو بهذا المعرف." };
    }

    let memberData = null;
    querySnapshot.forEach((doc) => {
      memberData = { id: doc.id, ...doc.data() };
    });

    return { success: true, memberData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. تفعيل الحظر السيادي الشامل (حظر الحساب + الـ IP + بصمة الجهاز)
export async function sovereignBan(userId, ipAddress, deviceFingerprint) {
  try {
    // 1. حظر حساب العضو في جدول المستخدمين
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { is_banned: 1 });

    // 2. إدراج الـ IP وبصمة الجهاز في القائمة السوداء للسيرفر لمنع أي دخول مستقبلي
    const blacklistRef = doc(db, "security_blacklist", userId);
    await setDoc(blacklistRef, {
      bannedUserId: userId,
      ip: ipAddress || "unknown",
      deviceFingerprint: deviceFingerprint || "unknown",
      bannedAt: new Date().toISOString()
    });

    return { success: true, message: "تم تطبيق الحظر السيادي الشامل بنجاح! تم حظر الحساب والبصمة نهائياً." };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
