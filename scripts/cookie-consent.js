(function () {
  const version = "2026.07";
  const key = "kira_cookie_consent";
  const text = {
    en: {
      title: "Cookie preferences",
      body: "We use necessary cookies for this website. Analytics and marketing cookies stay off unless you choose them.",
      accept: "Accept All",
      reject: "Reject Non-Essential",
      manage: "Manage Preferences",
      save: "Save Preferences",
      necessary: "Necessary",
      preferences: "Preferences",
      analytics: "Analytics",
      marketing: "Marketing"
    },
    ar: {
      title: "Cookie preferences",
      body: "We use necessary cookies for this website. Analytics and marketing cookies stay off unless you choose them.",
      accept: "Accept All",
      reject: "Reject Non-Essential",
      manage: "Manage Preferences",
      save: "Save Preferences",
      necessary: "Necessary",
      preferences: "Preferences",
      analytics: "Analytics",
      marketing: "Marketing"
    }  };

  const lang = document.documentElement.lang === "ar" ? "ar" : "en";
  const t = text[lang];
  const gpc = navigator.globalPrivacyControl === true;

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  }
  function saveConsent(categories) {
    const consent = { version, timestamp: new Date().toISOString(), categories };
    localStorage.setItem(key, JSON.stringify(consent));
    document.dispatchEvent(new CustomEvent("kiraConsentUpdated", { detail: consent }));
    closeBanner();
  }
  function closeBanner() {
    const banner = document.querySelector("[data-cookie-banner]");
    if (banner) banner.remove();
  }
  function render(showManage) {
    closeBanner();
    const current = getConsent();
    const banner = document.createElement("section");
    banner.setAttribute("data-cookie-banner", "");
    banner.setAttribute("aria-label", t.title);
    banner.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:auto;background:#151C24;color:#F7F4EE;border:1px solid #29323D;border-radius:8px;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.28);font-family:Arial,Helvetica,sans-serif";
    banner.innerHTML = '<h2 style="font-size:1.1rem;margin:0 0 8px">' + t.title + '</h2><p style="margin:0 0 12px;color:#98A2AE">' + t.body + '</p>' +
      (showManage ? '<div style="display:grid;gap:8px;margin:12px 0">' +
      ["preferences","analytics","marketing"].map((cat) => '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-cookie-cat="' + cat + '"' + (current && current.categories[cat] ? " checked" : "") + (gpc && (cat === "analytics" || cat === "marketing") ? " disabled" : "") + '> ' + t[cat] + '</label>').join("") +
      '<p style="font-size:.82rem;color:#98A2AE;margin:0">' + t.necessary + ' cookies are always active. Optional categories are not preselected.</p></div>' : "") +
      '<div style="display:flex;flex-wrap:wrap;gap:8px"><button data-cookie-accept>' + t.accept + '</button><button data-cookie-reject>' + t.reject + '</button><button data-cookie-manage>' + (showManage ? t.save : t.manage) + '</button></div>';
    document.body.appendChild(banner);
    banner.querySelector("[data-cookie-accept]").onclick = () => saveConsent({ necessary: true, preferences: true, analytics: !gpc, marketing: !gpc });
    banner.querySelector("[data-cookie-reject]").onclick = () => saveConsent({ necessary: true, preferences: false, analytics: false, marketing: false });
    banner.querySelector("[data-cookie-manage]").onclick = () => {
      if (!showManage) return render(true);
      const categories = { necessary: true, preferences: false, analytics: false, marketing: false };
      banner.querySelectorAll("[data-cookie-cat]").forEach((input) => { categories[input.dataset.cookieCat] = input.checked && !input.disabled; });
      saveConsent(categories);
    };
  }
  window.KiraCookieConsent = { open: () => render(true), get: getConsent, withdraw: () => { localStorage.removeItem(key); render(true); } };
  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-cookie-settings]")) {
      event.preventDefault();
      render(true);
    }
  });
  if (!getConsent()) render(false);
})();
