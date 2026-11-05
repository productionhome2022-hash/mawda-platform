import { createNavbar } from "../components/Navbar.js";
import { createUserCard } from "../components/UserCard.js";
import { createSupportModal } from "../components/SupportModal.js";

/**
 * الصفحة الرئيسية لمنصة "مودة" (HomeView)
 * تجمع الشريط العلوي، استعراض بطاقات الأعضاء، وبوابة الدعم الفني
 */

export function renderHomeView(containerElement, onOpenAdminPanel) {
  containerElement.innerHTML = '';

  // إضافة الشريط العلوي مع تفعيل البوابة السرية (النقرات الخفية على الشعار)
  const navbar = createNavbar(() => {
    if (typeof onOpenAdminPanel === 'function') {
      onOpenAdminPanel();
    }
  });
  containerElement.appendChild(navbar);

  // هيكل محتوى الصفحة الرئيسي
  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = 'padding: 20px; max-width: 1200px; margin: 0 auto;';

  contentDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: var(--gold-primary); font-size: 32px; margin-bottom: 10px; font-family: 'Tajawal', sans-serif;">منصة مودة السينمائية 👑</h1>
      <p style="color: var(--text-muted); font-size: 16px;">الملاذ الراقي للتعارف الجاد والصداقة بخصوصية مطلقة وحصانة أمنية سيادية.</p>
    </div>
    <div id="membersGrid" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;"></div>
  `;

  containerElement.appendChild(contentDiv);

  // تفعيل زر الدعم التقني في الشريط العلوي
  setTimeout(() => {
    const supportBtn = document.getElementById('supportBtn');
    if (supportBtn) {
      supportBtn.addEventListener('click', () => {
        const modal = createSupportModal();
        document.body.appendChild(modal);
      });
    }
  }, 100);

  // نموذج تجريبي لعرض بطاقة عضو (سيتم ربطه بقاعدة البيانات لاحقاً)
  const membersGrid = contentDiv.querySelector('#membersGrid');
  const sampleUser = {
    displayName: "ياسمين الشام",
    uniqueId: "#MAWDAT-7788",
    coin_balance: 420,
    hide_coins: false,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop"
  };
  membersGrid.appendChild(createUserCard(sampleUser));
}
