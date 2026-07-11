"use client";

import { useState } from "react";

export function TelegramLinkButton() {
  const [status, setStatus] = useState<"idle" | "submitting" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState<string | null>(null);

  async function handleClick() {
    setStatus("submitting");
    try {
      const response = await fetch("/api/telegram/link", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Could not generate a Telegram link.");
        return;
      }
      setDeepLink(data.deepLink);
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("Could not generate a Telegram link. Please try again.");
    }
  }

  if (status === "ready" && deepLink) {
    return (
      <div className="notice">
        <strong>Almost there.</strong>
        <br />
        Open Telegram and press Start to receive your single-use group invite link. This link expires in 30 minutes.
        <br />
        <a className="button" href={deepLink} target="_blank" rel="noreferrer">Open Telegram</a>
      </div>
    );
  }

  return (
    <div>
      <button className="button" type="button" onClick={handleClick} disabled={status === "submitting"}>
        {status === "submitting" ? "Generating..." : "Connect Telegram"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </div>
  );
}
