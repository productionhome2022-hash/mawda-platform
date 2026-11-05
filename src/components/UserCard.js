/**
 * مكون بطاقة العضو (UserCard) لمنصة "مودة"
 * يعرض البروفايل، الصورة الشخصية، الغلاف السينمائي، وميزة إخفاء/إظهار رصيد الكوينز
 */

export function createUserCard(userData) {
  const cardElement = document.createElement('div');
  cardElement.className = 'glass-panel';
  cardElement.style.cssText = 'padding: 20px; margin: 15px; border-radius: 16px; position: relative; overflow: hidden; max-width: 400px;';

  // خلفية غلاف سينمائية فاخرة
  const coverImg = userData.coverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop';
  
  // التحقق من تفعيل ميزة إخفاء الرصيد (Hide Coins)
  const isCoinsHidden = userData.hide_coins || false;
  const displayBalance = isCoinsHidden ? '••••••' : `${userData.coin_balance || 0} كوينز`;

  cardElement.innerHTML = `
    <div style="height: 120px; background: url('${coverImg}') center/cover no-repeat; border-radius: 12px; margin-bottom: -40px; position: relative;"></div>
    <div style="display: flex; align-items: flex-end; gap: 15px; padding: 0 15px; position: relative; z-index: 2;">
      <img src="${userData.avatarUrl || 'https://via.placeholder.com/80'}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--gold-primary); object-fit: cover; background: #000;" />
      <div style="margin-bottom: 5px;">
        <h3 style="color: var(--text-main); font-size: 18px;">${userData.displayName || 'عضو مودة'}</h3>
        <span style="color: var(--gold-primary); font-size: 13px;">${userData.uniqueId || '#MAWDAT-0000'}</span>
      </div>
    </div>
    <div style="margin-top: 25px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="color: var(--text-muted); font-size: 13px; display: block;">الرصيد الحالي:</span>
        <span style="color: var(--gold-light); font-weight: bold; font-size: 16px;" id="coinDisplay">${displayBalance}</span>
      </div>
      <button id="toggleHideCoins" class="btn-gold" style="padding: 6px 12px; font-size: 12px;">
        ${isCoinsHidden ? 'إظهار الرصيد' : 'إخفاء الرصيد'}
      </button>
    </div>
  `;

  return cardElement;
}
