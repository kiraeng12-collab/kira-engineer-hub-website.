(function () {
  // Guard against double-binding if this script ever loads twice.
  if (window.__kiraFormHandlerBound) return;
  window.__kiraFormHandlerBound = true;

  // Event delegation on the document: works for every [data-enhanced-form],
  // including forms rendered AFTER load via client-side navigation (which a
  // one-time querySelectorAll would miss, causing a raw POST to /api/forms).
  document.addEventListener("submit", async function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-enhanced-form]")) return;

    event.preventDefault();

    const status =
      form.querySelector("[data-form-status]") ||
      (form.parentElement && form.parentElement.querySelector("[data-form-status]"));
    if (status) status.textContent = "Sending...";

    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;

    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch(form.action, {
        method: "POST",
        body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "The request could not be sent. Please contact support@ke-hub.com.");
      }
      form.reset();
      if (status) status.textContent = "Request received. Reference: " + (data.reference || "sent");
    } catch (error) {
      if (status) {
        status.textContent = error.message || "The request could not be sent. Please contact support@ke-hub.com.";
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
