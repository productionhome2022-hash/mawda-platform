/**
 * مكون الشريط العلوي (Navbar) لمنصة "مودة"
 * يحتوي على الشعار، التنقل، والزر المخفي (البوابة السرية للسوبر أدمن)
 */

export function createNavbar(onSecretAdminTrigger) {
  const navElement = document.createElement('nav');
  navElement.className = 'glass-panel';
  navElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; margin: 20px; position: relative;';

  // الشعار مع عداد النقرات الخفي (البوابة السرية للسوبر أدمن)
  let clickCount = 0;
  const logoDiv = document.createElement('div');
  logoDiv.innerHTML = `<h2 style="color: var(--gold-primary); cursor: pointer; font-family: 'Tajawal', sans-serif;">مـودة 👑</h2>`;
  
  logoDiv.addEventListener('click', () => {
    clickCount++;
    // عند النقر 5 مرات متتالية، يتم تفعيل البوابة السرية للسوبر أدمن فوراً!
    if (clickCount >= 5) {
      clickCount = 0;
      if (typeof onSecretAdminTrigger === 'function') {
        onSecretAdminTrigger();
      }
    }
  });

  // أزرار التنقل السريعة
  const linksDiv = document.createElement('div');
  linksDiv.style.cssText = 'display: flex; gap: 20px; align-items: center;';
  linksDiv.innerHTML = `
    <a href="#" style="color: var(--text-main); text-decoration: none;">الرئيسية</a>
    <a href="#" style="color: var(--text-main); text-decoration: none;">الغرف</a>
    <a href="#" style="color: var(--gold-primary); text-decoration: none; font-weight: bold;">متجر الكوينز</a>
    <button id="supportBtn" class="btn-gold" style="padding: 6px 15px; font-size: 14px;">الدعم التقني</button>
  `;

  navElement.appendChild(logoDiv);
  navElement.appendChild(linksDiv);

  return navElement;
}
