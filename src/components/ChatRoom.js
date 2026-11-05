import { sendMessage, subscribeToMessages } from "../services/chatService.js";
import { auth } from "../config/firebase.js";

/**
 * مكون غرفة الدردشة (ChatRoom) لمنصة "مودة"
 * يتيح المحادثة المباشرة والتبديل بين الهوية الشخصية وهويّة السوبر أدمن المذهبة
 */

export function createChatRoom(roomId, currentUserName) {
  const container = document.createElement('div');
  container.className = 'glass-panel';
  container.style.cssText = 'padding: 20px; max-width: 600px; margin: 20px auto; display: flex; flex-direction: column; height: 500px;';

  // صندوق عرض الرسائل الحيّة
  const messagesBox = document.createElement('div');
  messagesBox.style.cssText = 'flex: 1; overflow-y: auto; padding: 10px; margin-bottom: 15px; background: rgba(0,0,0,0.2); border-radius: 10px; display: flex; flex-direction: column; gap: 10px;';

  // نموذج إدخال الرسالة والتحكم بالهوية الإدارية
  const inputForm = document.createElement('form');
  inputForm.style.cssText = 'display: flex; gap: 10px; align-items: center;';
  
  inputForm.innerHTML = `
    <input type="text" id="chatInput" placeholder="اكتب رسالتك الرومانسية أو التوجيهية..." style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border-glow); background: #16131a; color: var(--text-main);" required />
    <label style="display: flex; align-items: center; gap: 5px; color: var(--gold-primary); font-size: 13px; cursor: pointer; white-space: nowrap;">
      <input type="checkbox" id="adminModeToggle" /> صفة أدمن 👑
    </label>
    <button type="submit" class="btn-gold" style="padding: 10px 20px;">إرسال</button>
  `;

  container.appendChild(messagesBox);
  container.appendChild(inputForm);

  // الاستماع للرسائل بشكل فوري وتحديث الواجهة
  subscribeToMessages(roomId, (messages) => {
    messagesBox.innerHTML = '';
    messages.forEach((msg) => {
      const msgDiv = document.createElement('div');
      const isAdminBadge = msg.senderBadge === 'super_admin_gold';
      
      msgDiv.style.cssText = `padding: 10px 15px; border-radius: 10px; max-width: 75%; background: ${isAdminBadge ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${isAdminBadge ? 'var(--gold-primary)' : 'transparent'};`;
      
      msgDiv.innerHTML = `
        <div style="font-size: 11px; color: ${isAdminBadge ? 'var(--gold-primary)' : 'var(--text-muted)'}; margin-bottom: 3px; font-weight: bold;">
          ${msg.senderName} ${isAdminBadge ? '👑' : ''}
        </div>
        <div style="color: var(--text-main); font-size: 14px;">${msg.text}</div>
      `;
      messagesBox.appendChild(msgDiv);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });

  // التعامل مع إرسال الرسالة عند الضغط على زر الإرسال
  inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputField = inputForm.querySelector('#chatInput');
    const adminToggle = inputForm.querySelector('#adminModeToggle');
    const text = inputField.value.trim();

    if (!text) return;

    const user = auth.currentUser;
    if (!user) {
      alert('يجب تسجيل الدخول أولاً للمراسلة.');
      return;
    }

    const isSpecialAdmin = adminToggle.checked;
    const result = await sendMessage(roomId, user.uid, currentUserName, text, isSpecialAdmin);

    if (result.success) {
      inputField.value = '';
    } else {
      alert('خطأ في إرسال الرسالة: ' + result.error);
    }
  });

  return container;
}
