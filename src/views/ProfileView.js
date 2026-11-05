import { changeUserPassword } from "../services/authService.js";
import { db } from "../config/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * صفحة البروفايل المزدوج (ProfileView) لمنصة "مودة"
 * تتيح للعضو إدارة حسابه، تحديث كلمة المرور الشخصية، وإدارة ميزة إخفاء الرصيد
 */

export async function renderProfileView(containerElement, userId) {
  containerElement.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'glass-panel';
  container.style.cssText = 'max-width: 600px; margin: 30px auto; padding: 30px; direction: rtl;';

  // جلب بيانات العضو الحالية من قاعدة البيانات
  let userData = {};
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      userData = userDoc.data();
    }
  } catch (e) {
    console.error("خطأ في جلب بيانات البروفايل:", e);
  }

  container.innerHTML = `
    <h2 style="color: var(--gold-primary); margin-bottom: 20px; font-size: 22px; font-family: 'Tajawal', sans-serif;">إعدادات الحساب والبروفايل ⚙️</h2>
    
    <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px;">
      <p style="color: var(--text-main); margin-bottom: 5px;"><strong>الاسم الظاهر:</strong> ${userData.displayName || 'عضو مودة'}</p>
      <p style="color: var(--text-muted); font-size: 14px;"><strong>المعرف الفريد:</strong> ${userData.uniqueId || '#MAWDAT-0000'}</p>
    </div>

    <form id="updatePasswordForm" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
      <h3 style="color: var(--gold-light); font-size: 16px;">تحديث كلمة المرور الشخصية</h3>
      <input type="password" id="newPassword" placeholder="كلمة المرور الجديدة" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border-glow); background: #16131a; color: var(--text-main);" required />
      <button type="submit" class="btn-gold" style="padding: 10px;">حفظ كلمة المرور الجديدة</button>
    </form>

    <div style="border-top: 1px solid var(--border-glow); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="color: var(--text-main); font-size: 15px;">إخفاء رصيد الكوينز</h4>
        <p style="color: var(--text-muted); font-size: 12px;">إخفاء محفظتك عن الآخرين لإضفاء طابع الغموض والجاذبية.</p>
      </div>
      <button id="toggleHideCoinsBtn" class="btn-gold" style="padding: 8px 15px; font-size: 13px;">
        ${userData.hide_coins ? 'إلغاء الإخفاء' : 'تفعيل الإخفاء'}
      </button>
    </div>
  `;

  containerElement.appendChild(container);

  // معالجة طلب تحديث كلمة المرور
  container.querySelector('#updatePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = container.querySelector('#newPassword').value.trim();
    const res = await changeUserPassword(newPassword);
    if (res.success) {
      alert(res.message);
      container.querySelector('#newPassword').value = '';
    } else {
      alert('خطأ في التحديث: ' + res.error);
    }
  });

  // معالجة ميزة إخفاء/إظهار رصيد الكوينز
  const toggleBtn = container.querySelector('#toggleHideCoinsBtn');
  toggleBtn.addEventListener('click', async () => {
    try {
      const newStatus = !userData.hide_coins;
      await updateDoc(doc(db, "users", userId), { hide_coins: newStatus });
      userData.hide_coins = newStatus;
      toggleBtn.textContent = newStatus ? 'إلغاء الإخفاء' : 'تفعيل الإخفاء';
      alert('تم تحديث إعدادات إخفاء الرصيد بنجاح!');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  });
}
