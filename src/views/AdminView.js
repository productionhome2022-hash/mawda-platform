import { getMemberDossier, sovereignBan } from "../services/adminService.js";
import { updatePlatformCommission } from "../services/coinService.js";

export function renderAdminView(containerElement) {
    containerElement.innerHTML = "";

    const container = document.createElement('div');
    container.className = 'glass-panel';
    container.style.cssText = 'max-width: 800px; margin: 30px auto; padding: 20px; direction: rtl;';

    container.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 10px; font-size: 22px;">لوحة التحكم السيادية - تطبيق مودة</h2>
        <p style="color: #aaa; font-size: 13px; margin-bottom: 20px;">إدارة النظام التشغيلي، عمولات المنصة، والتحكم الشامل بالأعضاء.</p>
        
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(255,215,0,0.2);">
            <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 8px;">إدارة عمولة المنصة</h3>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="commissionInput" step="0.01" min="0" max="0.5" placeholder="0.10" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: #fff;">
                <button id="updateCommissionBtn" style="background: #ffd700; color: #0b090a; border: none; padding: 10px 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">تحديث</button>
            </div>
        </div>

        <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(255,215,0,0.2);">
            <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 8px;">قسم الاستعلام السيادي والبحث</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                <input type="text" id="searchInput" placeholder="كود المعرف (MAWDA-XXXX)" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: #fff;">
                <button id="searchMemberBtn" style="background: #ffd700; color: #0b090a; border: none; padding: 10px 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">بحث</button>
            </div>
            <div id="dossierResult" style="margin-top: 10px; color: #fff; font-size: 14px;"></div>
        </div>
    `;

    containerElement.appendChild(container);

    container.querySelector('#updateCommissionBtn').addEventListener('click', async () => {
        const val = parseFloat(container.querySelector('#commissionInput').value);
        if (isNaN(val)) {
            alert("الرجاء إدخال رقم صحيح.");
            return;
        }
        try {
            const res = await updatePlatformCommission(val);
            alert(res.success ? res.message : "خطأ: " + res.error);
        } catch (err) {
            alert("حدث خطأ أثناء الاتصال.");
        }
    });

    container.querySelector('#searchMemberBtn').addEventListener('click', async () => {
        const identifier = container.querySelector('#searchInput').value.trim();
        const resultBox = container.querySelector('#dossierResult');
        if (!identifier) return;

        resultBox.innerHTML = "جاري البحث...";
        try {
            const res = await getMemberDossier(identifier);
            if (res.success) {
                const member = res.memberData;
                resultBox.innerHTML = `
                    <div style="padding: 12px; background: rgba(212,175,55,0.1); border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">
                        <p><strong>الاسم:</strong> ${member.displayName}</p>
                        <p><strong>المعرف:</strong> ${member.uniqueId}</p>
                        <p><strong>الحالة:</strong> ${member.isBanned ? '🚫 محظور' : '✅ نشط'}</p>
                    </div>
                `;
            } else {
                resultBox.innerHTML = `<p style="color: #ff6b6b;">لم يتم العثور على سجل.</p>`;
            }
        } catch (err) {
            resultBox.innerHTML = `<p style="color: #ff6b6b;">فشل في جلب البيانات.</p>`;
        }
    });
}
