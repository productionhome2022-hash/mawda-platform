import { getMemberDossier, sovereignBan } from "../services/adminService.js";
import { updatePlatformCommission } from "../services/coinService.js";

/**
 * صفحة لوحة تحكم السوبر أدمن السرية السيادية (AdminView) لمنصة "مودة"
 * تتيح الاستعلام الاستخباراتي، الحظر السيادي الشامل، والتحكم بنسبة عمولة المنصة
 */

export function renderAdminView(containerElement) {
  containerElement.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'glass-panel';
  container.style.cssText = 'max-width: 800px; margin: 30px auto; padding: 30px; direction: rtl;';

  container.innerHTML = `
    <h2 style="color: var(--gold-primary); margin-bottom: 10px; font-size: 24px; font-family: 'Tajawal', sans-serif;">لوحة التحكم السيادية السرية 👑🔒</h2>
    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 25px;">منطقة الإدارة العليا للتحكم الكامل بأمن المنصة، الحظر السيادي، والاقتصاد الرقمي.</p>
    
    <!-- قسم تعديل عمولة المنصة -->
    <div style="margin-bottom: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid var(--border-glow);">
      <h3 style="color: var(--gold-light); font-size: 18px; margin-bottom: 10px;">إدارة عمولة المنصة (افتراضياً 10%)</h3>
      <div style="display: flex; gap: 10px; align-items: center;">
        <input type="number" id="commissionInput" step="0.01" min="0" max="0.5" placeholder="مثال: 0.10 للـ 10%" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border-glow); background: #16131a; color: var(--text-main);" />
        <button id="updateCommissionBtn" class="btn-gold" style="padding: 10px 20px;">حفظ النسبة</button>
      </div>
    </div>

    <!-- قسم الاستعلام الاستخباراتي والحظر السيادي -->
    <div style="padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid var(--border-glow);">
      <h3 style="color: var(--gold-light); font-size: 18px; margin-bottom: 10px;">البحث الاستخباراتي عن الأعضاء والحظر السيادي</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" id="searchInput" placeholder="أدخل المعرف الفريد (مثل #MAWDAT-XXXX)" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border-glow); background: #16131a; color: var(--text-main);" />
        <button id="searchMemberBtn" class="btn-gold" style="padding: 10px 20px;">بحث استخباراتي</button>
      </div>
      <div id="dossierResult" style="margin-top: 15px; color: var(--text-main);"></div>
    </div>
  `;

  containerElement.appendChild(container);

  // تفعيل زر تحديث العمولة
  container.querySelector('#updateCommissionBtn').addEventListener('click', async () => {
    const val = parseFloat(container.querySelector('#commissionInput').value);
    if (isNaN(val)) {
      alert("المرجو إدخال رقم صحيح.");
      return;
    }
    const res = await updatePlatformCommission(val);
    if (res.success) {
      alert(res.message);
    } else {
      alert("خطأ: " + res.error);
    }
  });

  // تفعيل زر البحث الاستخباراتي
  let foundMemberData = null;
  container.querySelector('#searchMemberBtn').addEventListener('click', async () => {
    const identifier = container.querySelector('#searchInput').value.trim();
    const resultBox = container.querySelector('#dossierResult');
    if (!identifier) return;

    resultBox.innerHTML = 'جاري البحث في السجلات الأمنية...';
    const res = await getMemberDossier(identifier);

    if (res.success) {
      foundMemberData = res.memberData;
      resultBox.innerHTML = `
        <div style="padding: 15px; background: rgba(212,175,55,0.1); border-radius: 8px; border: 1px solid var(--gold-primary);">
          <p><strong>الاسم:</strong> ${foundMemberData.displayName}</p>
          <p><strong>المعرف:</strong> ${foundMemberData.uniqueId}</p>
          <p><strong>البريد:</strong> ${foundMemberData.email}</p>
          <p><strong>الحالة:</strong> ${foundMemberData.is_banned === 1 ? 'محظور سيادياً ⛔' : 'نشط وآمن ✅'}</p>
          <p><strong>بصمة الجهاز / IP:</strong> ${foundMemberData.device_fingerprint || 'غير متوفر'}</p>
          <button id="executeSovereignBanBtn" style="margin-top: 10px; padding: 8px 15px; background: #d32f2f; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">تنفيذ الحظر السيادي الشامل ⛔</button>
        </div>
      `;

      // تفعيل زر الحظر السيادي
      document.getElementById('executeSovereignBanBtn').addEventListener('click', async () => {
        if (confirm("هل أنت متأكد تماماً من رغبتك بتنفيذ الحظر السيادي الشامل على هذا العضو؟ (سيتم حظر الحساب والبصمة نهائياً)")) {
          const banRes = await sovereignBan(foundMemberData.id, foundMemberData.ip || "unknown", foundMemberData.device_fingerprint);
          if (banRes.success) {
            alert(banRes.message);
            resultBox.innerHTML = '';
          } else {
            alert("خطأ في الحظر: " + banRes.error);
          }
        }
      });

    } else {
      resultBox.innerHTML = `<span style="color: #ff5252;">${res.error}</span>`;
    }
  });
}
