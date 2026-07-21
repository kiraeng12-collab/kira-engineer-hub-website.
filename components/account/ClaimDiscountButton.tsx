"use client";

import { useState } from "react";

/**
 * Lets a Kira Trading Community member prove their tenure and unlock their
 * permanent loyalty price before buying. Verification happens in Telegram
 * (only the bot can confirm live group membership), so this issues a
 * single-use deep link.
 */
export function ClaimDiscountButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  async function requestLink() {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/account/discount-claim", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Could not start verification. Please try again.");
        return;
      }
      if (data.alreadyClaimed) {
        setStatus("error");
        setMessage(data.message || "Your community pricing is already active.");
        return;
      }
      setLink(data.deepLink);
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("Could not start verification. Please check your connection and try again.");
    }
  }

  if (status === "ready" && link) {
    return (
      <div className="notice">
        <strong>Verify in Telegram</strong>
        <br />
        Open the link below and our bot will confirm your community membership, then apply your
        permanent price automatically. The link is single use and expires in 30 minutes.
        <div className="actions">
          <a className="button" href={link} target="_blank" rel="noopener noreferrer">
            Open Telegram to verify
          </a>
          <button className="button secondary" type="button" onClick={() => setStatus("idle")}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="actions">
        <button className="button secondary" type="button" disabled={status === "loading"} onClick={requestLink}>
          {status === "loading" ? "Preparing..." : "Claim community pricing"}
        </button>
      </div>
      <p className="form-note" aria-live="polite">
        {status === "error"
          ? message
          : "Joined Kira Trading Community before 1 August 2026? Verify in Telegram to unlock your permanent member price."}
      </p>
    </div>
  );
}
