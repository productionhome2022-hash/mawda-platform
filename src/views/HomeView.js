export function renderHomeView(container, onAdminAccess) {
    container.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; direction: rtl;">
            <h1 style="color: #ffd700; font-size: 24px; margin-bottom: 15px;">تطبيق مودة للتعارف والدردشة والزواج والعلاقات الجادة</h1>
            <p style="color: #bbb; margin-bottom: 30px; font-size: 14px;">منصة آمنة وجادة لإدارة العلاقات وتوفير تجربة متكاملة.</p>
            
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
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

    const browseBtn = container.querySelector("#browseBtn");
    const contentArea = container.querySelector("#contentArea");
    if (browseBtn && contentArea) {
        browseBtn.addEventListener("click", () => {
            contentArea.innerHTML = `
                <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid #333;">
                    <h3 style="color: #ffd700; margin-bottom: 8px;">قائمة الأعضاء النشطين</h3>
                    <p style="color: #ccc; font-size: 13px;">يتم إدارة الإعلانات وقسم الأعضاء حصرياً بواسطة مالك التطبيق (الأدمن).</p>
                </div>
            `;
        });
    }
}
