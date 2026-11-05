import { auth, db } from "../config/firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * خدمة المصادقة والأمان السيادي (authService) لمنصة "مودة"
 */

// تسجيل عضو جديد مع توليد المعرف السيادي وبصمة الجهاز
export async function registerUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uniqueId = "#MAWDAT-" + Math.floor(1000 + Math.random() * 9000);
    
    // حفظ بيانات العضو في قاعدة البيانات
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      uniqueId: uniqueId,
      coin_balance: 100, // رصيد ترحيبي
      hide_coins: false,
      is_banned: 0,
      device_fingerprint: navigator.userAgent,
      createdAt: serverTimestamp()
    });

    return { success: true, user, uniqueId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل الدخول
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تغيير كلمة المرور الشخصية
export async function changeUserPassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("لا يوجد مستخدم مسجل الدخول حالياً.");
    await updatePassword(user, newPassword);
    return { success: true, message: "تم تحديث كلمة المرور الشخصية بنجاح!" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل الخروج
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
