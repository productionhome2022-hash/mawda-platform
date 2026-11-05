export function renderAdminView(containerElement) {
    containerElement.innerHTML = "";

    const container = document.createElement('div');
    container.style.cssText = 'max-width: 800px; margin: 30px auto; padding: 20px; direction: rtl;';

    container.innerHTML = `
        <div style="background: #141214; border: 1px solid rgba(255,215,0,0.3); border-radius: 12px; padding: 20px;">
            <h2 style="color: #ffd700; margin-bottom: 10px; font-size: 22px;">لوحة التحكم السيادية - تطبيق مودة</h2>
            <p style="color: #aaa; font-size: 13px; margin-bottom: 20px;">إدارة النظام التشغيلي، عمولات المنصة، والتحكم الشامل بالأعضاء.</p>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(255,215,0,0.2);">
                <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 8px;">إدارة عمولة المنصة</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="number" id="commissionInput" step="0.01" min="0" max="0.5" value="0.10" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: #fff;">
                    <button id="updateCommissionBtn" style="background: #ffd700; color: #0b090a; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">تحديث</button>
                </div>
            </div>

            <div style="padding: 15px; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(255,215,0,0.2);">
                <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 8px;">قسم الاستعلام السيادي والبحث</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                    <input type="text" id="searchInput" placeholder="كود المعرف (MAWDA-XXXX)" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: #fff;">
                    <button id="searchMemberBtn" style="background: #ffd700; color: #0b090a; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">بحث</button>
                </div>
                <div id="dossierResult" style="margin-top: 10px; color: #fff; font-size: 14px;"></div>
            </div>
            
            <div style="margin-top: 20px; text-align: left;">
                <button id="backHomeBtn" style="background: transparent; color: #ffd700; border: 1px solid #ffd700; padding: 8px 16px; border-radius: 6px; cursor: pointer;">العودة للرئيسية</button>
            </div>
        </div>
    `;

    containerElement.appendChild(container);

    container.querySelector('#updateCommissionBtn').addEventListener('click', () => {
        const val = parseFloat(container.querySelector('#commissionInput').value);
        if (isNaN(val)) {
            alert("الرجاء إدخال رقم صحيح.");
            return;
        }
        alert("تم تحديث عمولة المنصة بنجاح إلى: " + val);
    });

    container.querySelector('#searchMemberBtn').addEventListener('click', () => {
        const identifier = container.querySelector('#searchInput').value.trim();
        const resultBox = container.querySelector('#dossierResult');
        if (!identifier) {
            alert("الرجاء إدخال معرف صحيح.");
            return;
        }

        resultBox.innerHTML = `
            <div style="padding: 12px; background: rgba(212,175,55,0.1); border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">
                <p><strong>المعرف:</strong> ${identifier}</p>
                <p><strong>الحالة:</strong> ✅ نشط (إدارة الأدمن)</p>
                <button id="banActionBtn" style="margin-top: 8px; background: #ff4d4d; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">حظر العضو</button>
            </div>
        `;

        const banBtn = resultBox.querySelector('#banActionBtn');
        if (banBtn) {
            banBtn.addEventListener('click', () => {
                alert("تم تنفيذ الحظر السيادي بنجاح على المعرف: " + identifier);
            });
        }
    });

    container.querySelector('#backHomeBtn').addEventListener('click', () => {
        location.reload();
    });
}
