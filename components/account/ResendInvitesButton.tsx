"use client";

import { useState } from "react";

/**
 * For members who are already linked. Linking and joining are separate steps,
 * so a member can be connected yet not in the chats — the invite can fail, the
 * link can expire, or they can leave. This asks the bot to send fresh ones.
 */
export function ResendInvitesButton() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("submitting");
    try {
      const response = await fetch("/api/telegram/resend-invites", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Could not send your invite links.");
        return;
      }
      setStatus("sent");
      setMessage(
        data.partial
          ? "Some invites were sent to you on Telegram, but not all of them. Contact support if anything is missing."
          : `Sent. Check your Telegram messages from the bot — the links expire in ${data.expiresInMinutes || 15} minutes.`
      );
    } catch {
      setStatus("error");
      setMessage("Could not send your invite links. Please try again.");
    }
  }

  return (
    <div>
      <button
        className="button"
        type="button"
        onClick={handleClick}
        disabled={status === "submitting" || status === "sent"}
      >
        {status === "submitting" ? "Sending..." : status === "sent" ? "Sent" : "Send my VIP invites"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "idle"
          ? "Not in the VIP group or channel yet? Get fresh single-use invite links on Telegram."
          : message}
      </p>
    </div>
  );
}
