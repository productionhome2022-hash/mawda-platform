(() => {
  const key = "mawdda-install-prompt-dismissed-until";
  let deferredPrompt = null;
  let panel = null;

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isMacSafari = () =>
    /Macintosh|Mac OS X/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|Chromium|Edg/.test(navigator.userAgent);

  function getDismissedUntil() {
    try {
      return Number(window.localStorage.getItem(key) || 0);
    } catch (_) {
      return 0;
    }
  }

  function setDismissedUntil(timestamp) {
    try {
      window.localStorage.setItem(key, String(timestamp));
    } catch (_) {
      // Keep installation guidance available when storage is restricted.
    }
  }

  function instructions() {
    if (isIos()) {
      return "على iPhone أو iPad: افتح قائمة المشاركة في Safari ثم اختر «إضافة إلى الشاشة الرئيسية».";
    }
    if (isMacSafari()) {
      return "في Safari على Mac: اختر File ثم Add to Dock لإضافة مودة كتطبيق من Dock.";
    }
    if (/Android/.test(navigator.userAgent)) {
      return "اضغط تثبيت إذا ظهرت نافذة المتصفح. أو افتح قائمة المتصفح (⋮) واختر Install app أو Add to Home screen.";
    }
    return "على الكمبيوتر: استخدم أيقونة التثبيت في شريط العنوان، أو افتح قائمة المتصفح (⋮ أو …) واختر Install app أو تثبيت مودة.";
  }

  function showPanel() {
    if (panel || isStandalone() || Date.now() < getDismissedUntil()) return;
    panel = document.createElement("section");
    panel.className = "mawdda-install-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-live", "polite");
    panel.setAttribute("aria-label", "تثبيت تطبيق مودة");
    panel.innerHTML = `
      <button class="mawdda-install-close" type="button" aria-label="إغلاق">×</button>
      <div class="mawdda-install-copy">
        <strong>${isIos() ? "أضف مودة إلى جهازك" : "ثبّت مودة كتطبيق مستقل"}</strong>
        <span>${isIos()
          ? "استخدم مودة الآن من Safari وأضفها إلى الشاشة الرئيسية للوصول السريع."
          : "افتح مودة كتطبيق مستقل من سطح المكتب أو قائمة التطبيقات، بدلاً من البحث عن تبويب المتصفح كل مرة."}</span>
      </div>
      <button class="mawdda-install-action" type="button">${deferredPrompt ? "تثبيت تطبيق مودة" : "عرض طريقة التثبيت"}</button>
      <span class="mawdda-install-help" aria-live="polite"></span>
    `;
    document.body.appendChild(panel);

    panel.querySelector(".mawdda-install-close").addEventListener("click", () => {
      setDismissedUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
      panel.remove();
      panel = null;
    });

    panel.querySelector(".mawdda-install-action").addEventListener("click", async () => {
      const help = panel?.querySelector(".mawdda-install-help");
      if (deferredPrompt) {
        const promptEvent = deferredPrompt;
        deferredPrompt = null;
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === "accepted") {
          panel?.remove();
          panel = null;
        } else if (help) {
          help.textContent = "لم يتم التثبيت الآن. يمكنك المحاولة لاحقاً من قائمة المتصفح.";
        }
      } else if (help) {
        help.textContent = instructions();
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showPanel();
    if (panel) {
      const action = panel.querySelector(".mawdda-install-action");
      if (action) action.textContent = "تثبيت تطبيق مودة";
    }
  });

  window.addEventListener("appinstalled", () => {
    panel?.remove();
    panel = null;
    deferredPrompt = null;
  });

  window.addEventListener("load", () => {
    if (!isStandalone()) showPanel();
  }, { once: true });
})();
