(function () {
  // Guard against double-binding if this script ever loads twice.
  if (window.__kiraCheckoutHandlerBound) return;
  window.__kiraCheckoutHandlerBound = true;

  // Event delegation: works for a checkout form rendered after load via
  // client-side navigation (a one-time querySelectorAll would miss it and let
  // the browser do a raw POST to the API).
  document.addEventListener("submit", async function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-checkout-form]")) return;

    event.preventDefault();

    const status =
      form.querySelector("[data-checkout-status]") ||
      (form.parentElement && form.parentElement.querySelector("[data-checkout-status]"));
    const submitter = event.submitter;
    const plan = submitter && submitter.value ? submitter.value : "";
    const buttons = form.querySelectorAll('button[type="submit"]');

    if (status) status.textContent = "Preparing secure checkout...";
    buttons.forEach(function (button) { button.disabled = true; });

    try {
      const body = new URLSearchParams();
      body.set("plan", plan);

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });

      if (response.status === 401) {
        window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Checkout is not available yet. Please request access through Telegram or email.");
      }
      if (!data.url) {
        throw new Error("Checkout link was not created. Please contact KE@kiraengineerhub.com.");
      }
      window.location.href = data.url;
    } catch (error) {
      if (status) {
        status.textContent = error.message || "Checkout is not available yet. Please request access through Telegram or email.";
      }
    } finally {
      buttons.forEach(function (button) { button.disabled = false; });
    }
  });
})();
