import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

/**
 * خدمة الدردشة الحية والتبديل بين الهويتين لمنصة "مودة"
 * تتيح إرسال الرسائل والتحكم بالهوية الإدارية (شارة الأدمن الذهبية أو العضو العادي)
 */

// 1. إرسال رسالة جديدة مع تحديد الهوية (سواء كعضو عادي أو كأدمن رسمي)
export async function sendMessage(roomId, senderId, senderName, text, isSpecialAdmin = false) {
  try {
    let senderBadge = "user"; // العضو الافتراضي
    let finalSenderName = senderName;

    if (isSpecialAdmin) {
      // إذا كان السوبر أدمن يريد التحدث بالهوية الإدارية الرسمية
      senderBadge = "super_admin_gold";
      finalSenderName = "إدارة مودة الرسمية 👑";
    }

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      senderId: senderId,
      senderName: finalSenderName,
      text: text,
      senderBadge: senderBadge, // تميز بين الهويتين بوضوح تام
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. الاستماع للرسائل داخل الغرفة بشكل فوري (Real-time)
export function subscribeToMessages(roomId, callback) {
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
}
