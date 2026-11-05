export function renderHomeView(container, onAdminAccess) {
    container.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; direction: rtl;">
            <h1 style="color: #ffd700; font-size: 26px; margin-bottom: 10px;">تطبيق مودة للتعارف والدردشة والزواج والعلاقات الجادة</h1>
            <p style="color: #ccc; margin-bottom: 30px; font-size: 15px;">منصة آمنة وجادة لبناء العلاقات وفق الضوابط والخصوصية.</p>
            
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <button id="browseBtn" style="background: #ffd700; color: #0b090a; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">تصفح الأعضاء</button>
                <button id="adminBtn" style="background: transparent; color: #ffd700; border: 2px solid #ffd700; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">لوحة التحكم (الأدمن)</button>
            </div>
            
            <div id="contentArea" style="margin-top: 30px; text-align: right;"></div>
        </div>
    `;

    const adminBtn = container.querySelector("#adminBtn");
    if (adminBtn && typeof onAdminAccess === "function") {
        adminBtn.addEventListener("click", () => {
            onAdminAccess();
        });
    }
}
