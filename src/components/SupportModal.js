import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../config/firebase.js";

/**
 * مكون نافذة الدعم التقني والشكاوى (SupportModal) لمنصة "مودة"
 * يتيح إرسال البلاغات والمشاكل مع إرفاق لقطات الشاشة والوسائط
 */

export function createSupportModal(onClose) {
  const modalOverlay = document.createElement('div');
  modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; direction: rtl;';

  const modalContent = document.createElement('div');
  modalContent.className = 'glass-panel';
  modalContent.style.cssText = 'padding: 30px; width: 90%; max-width: 450px; border-radius: 16px; position: relative;';

  modalContent.innerHTML = `
    <h3 style="color: var(--gold-primary); margin-bottom: 15px; font-size: 20px;">الدعم التقني وخدمة الأعضاء 🛠️</h3>
    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">نحن هنا لحل أي مشكلة تواجهك. اترك رسالتك وأرفق لقطة الشاشة لتوضيح المشكلة.</p>
    
    <form id="supportForm" style="display: flex; flex-direction: column; gap: 15px;">
      <textarea id="supportMessage" placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..." rows="4" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border-glow); background: #16131a; color: var(--text-main); resize: none;" required></textarea>
      
      <div>
        <label style="color: var(--text-muted); font-size: 12px; display: block; margin-bottom: 5px;">إرفاق لقطة شاشة (اختياري):</label>
        <input type="file" id="supportImage" accept="image/*" style="color: var(--text-main); font-size: 13px;" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
        <button type="button" id="closeModalBtn" style="padding: 8px 16px; background: transparent; border: 1px solid var(--text-muted); color: var(--text-main); border-radius: 8px; cursor: pointer;">إلغاء</button>
        <button type="submit" class="btn-gold" style="padding: 8px 20px;">إرسال البلاغ</button>
      </div>
    </form>
  `;

  modalOverlay.appendChild(modalContent);

  // إغلاق النافذة
  modalContent.querySelector('#closeModalBtn').addEventListener('click', () => {
    modalOverlay.remove();
    if (typeof onClose === 'function') onClose();
  });

  // معالجة إرسال الشكوى ورفع المرفقات
  const form = modalContent.querySelector('#supportForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = modalContent.querySelector('#supportMessage').value.trim();
    const imageFile = modalContent.querySelector('#supportImage').files[0];

    try {
      let attachmentUrl = "";
      const user = auth.currentUser;
      const userId = user ? user.uid : "visitor_" + Date.now();

      // إذا تم اختيار صورة، رفعها إلى Firebase Storage
      if (imageFile) {
        const storageRef = ref(storage, `support_attachments/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      // حفظ البلاغ في قاعدة بيانات Firestore
      await addDoc(collection(db, "support_tickets"), {
        userId: userId,
        message_content: message,
        attachment_url: attachmentUrl,
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("تم إرسال بلاغك بنجاح إلى الإدارة. سنقوم بمراجعته والرد عليك قريباً!");
      modalOverlay.remove();
      if (typeof onClose === 'function') onClose();
    } catch (error) {
      alert("حدث خطأ أثناء الإرسال: " + error.message);
    }
  });

  return modalOverlay;
}
