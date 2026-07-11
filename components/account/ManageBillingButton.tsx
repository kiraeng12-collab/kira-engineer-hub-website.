"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("submitting");
    try {
      const response = await fetch("/api/stripe/create-customer-portal", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Could not open billing management.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setStatus("error");
      setMessage("Could not open billing management.");
    } catch {
      setStatus("error");
      setMessage("Could not open billing management. Please try again.");
    }
  }

  return (
    <div>
      <button className="button" type="button" onClick={handleClick} disabled={status === "submitting"}>
        {status === "submitting" ? "Opening..." : "Manage Billing"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </div>
  );
}
