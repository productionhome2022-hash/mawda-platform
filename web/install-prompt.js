(() => {
  const key = "mawdda-install-prompt-dismissed-until";
  let deferredPrompt = null;
  let panel = null;
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  function getDismissedUntil() {
    try {
      return Number(window.localStorage.getItem(key) || 0);
    } catch (_) {
      // Storage may be unavailable in private browsing or restricted contexts.
      return 0;
    }
  }

  function setDismissedUntil(timestamp) {
    try {
      window.localStorage.setItem(key, String(timestamp));
    } catch (_) {
      // Installation guidance must remain usable even when storage is blocked.
    }
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
        <strong>ثبّت تطبيق مودة على جهازك</strong>
        <span>افتح مودة كتطبيق مستقل من سطح المكتب أو قائمة التطبيقات، دون الحاجة إلى فتح تبويب المتصفح كل مرة.</span>
      </div>
      <button class="mawdda-install-action" type="button">تثبيت تطبيق مودة</button>
      <span class="mawdda-install-help" aria-live="polite"></span>
    `;
    document.body.appendChild(panel);
    panel.querySelector(".mawdda-install-close").addEventListener("click", () => {
      setDismissedUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
      panel.remove(); panel = null;
    });
    panel.querySelector(".mawdda-install-action").addEventListener("click", async () => {
      const help = panel?.querySelector(".mawdda-install-help");
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice?.outcome === "accepted") {
          panel?.remove(); panel = null;
        } else if (help) {
          help.textContent = "يمكنك تثبيته لاحقاً من شريط عنوان المتصفح أو قائمة المشاركة.";
        }
      } else if (help) {
        const ua = navigator.userAgent;
        if (/Macintosh|Mac OS X/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) {
          help.textContent = "في Safari على Mac: اختر File ثم Add to Dock لإضافة مودة كتطبيق.";
        } else if (/iPhone|iPad|iPod/.test(ua)) {
          help.textContent = "على iPhone أو iPad: افتح قائمة المشاركة ثم اختر Add to Home Screen.";
        } else {
          help.textContent = "افتح قائمة المتصفح (⋮ أو …) ثم اختر Install app أو تثبيت مودة. إذا لم يظهر الخيار، فهذا المتصفح لا يدعم تثبيت تطبيقات الويب.";
        }
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showPanel();
  });
  window.addEventListener("appinstalled", () => {
    panel?.remove(); panel = null;
    deferredPrompt = null;
  });
  window.addEventListener("load", () => {
    if (!isStandalone()) showPanel();
  }, { once: true });
})();
