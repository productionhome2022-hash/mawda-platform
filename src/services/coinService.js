import { doc, getDoc, updateDoc, runTransaction, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

/**
 * خدمة الاقتصاد الرقمي والكوينز لمنصة "مودة"
 * تشمل: تحويل الكوينز، إرسال الهدايا، واقتطاع عمولة المنصة (10%)
 */

// 1. تحويل الكوينز أو إرسال هدية بين عضوين مع خصم العمولة تلقائياً
export async function transferCoins(senderId, receiverId, amount, isGift = false) {
  try {
    if (amount <= 0) {
      return { success: false, error: "المرجو إدخال قيمة صحيحة للكوينز." };
    }

    // جلب نسبة عمولة المنصة الحالية من لوحة التحكم (مبدئياً 10%)
    const settingsDoc = await getDoc(doc(db, "settings", "platform_config"));
    let commissionRate = 0.10; // 10%
    if (settingsDoc.exists()) {
      commissionRate = settingsDoc.data().transferCommissionRate || 0.10;
    }

    // حساب العمولة ونصيب المستقبل
    const commissionAmount = Math.round(amount * commissionRate);
    const receiverNetAmount = amount - commissionAmount;

    // تنفيذ المعاملة المالية عبر Transaction لضمان الأمان المطلق وعدم ضياع البيانات
    await runTransaction(db, async (transaction) => {
      const senderRef = doc(db, "users", senderId);
      const receiverRef = doc(db, "users", receiverId);
      const adminVaultRef = doc(db, "settings", "admin_vault"); // خزينة السوبر أدمن للعمولات

      const senderSnap = await transaction.get(senderRef);
      const receiverSnap = await transaction.get(receiverRef);

      if (!senderSnap.exists() || !receiverSnap.exists()) {
        throw new Error("حساب المرسل أو المستقبل غير موجود.");
      }

      const senderBalance = senderSnap.data().coin_balance || 0;
      if (senderBalance < amount) {
        throw new Error("رصيد الكوينز غير كافٍ لإتمام عملية التحويل أو الهدية.");
      }

      // خصم المبلغ كاملاً من المرسل
      transaction.update(senderRef, { coin_balance: senderBalance - amount });

      // إضافة المبلغ الصافي للمستقبل
      const receiverCurrentBalance = receiverSnap.data().coin_balance || 0;
      transaction.update(receiverRef, { coin_balance: receiverCurrentBalance + receiverNetAmount });

      // تحويل عمولة المنصة إلى خزينة السوبر أدمن
      const vaultSnap = await transaction.get(adminVaultRef);
      let currentVaultCoins = vaultSnap.exists() ? (vaultSnap.data().total_commission_collected || 0) : 0;
      
      if (vaultSnap.exists()) {
        transaction.update(adminVaultRef, { total_commission_collected: currentVaultCoins + commissionAmount });
      } else {
        transaction.set(adminVaultRef, { total_commission_collected: commissionAmount });
      }
    });

    return { 
      success: true, 
      message: isGift ? "تم إرسال الهدية بنجاح!" : "تم التحويل بنجاح!",
      commissionDeducted: commissionAmount 
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. تحديث نسبة عمولة التحويل والهدايا (خاص بلوحة تحكم السوبر أدمن)
export async function updatePlatformCommission(newRate) {
  try {
    if (newRate < 0 || newRate > 0.50) {
      return { success: false, error: "نسبة العمولة غير منطقية." };
    }

    const settingsRef = doc(db, "settings", "platform_config");
    await updateDoc(settingsRef, { transferCommissionRate: newRate });

    return { success: true, message: "تم تحديث نسبة العمولة بنجاح." };
  } catch (error) {
    try {
      const settingsRef = doc(db, "settings", "platform_config");
      await setDoc(settingsRef, { transferCommissionRate: newRate });
      return { success: true, message: "تم ضبط نسبة العمولة الجديدة بنجاح." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
