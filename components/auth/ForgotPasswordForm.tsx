"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "limited">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    const body = new URLSearchParams();
    body.set("email", String(data.get("email") || ""));

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));
      setStatus(response.status === 429 ? "limited" : "done");
      setMessage(result.message || "If an account exists for that email address, a password reset link has been sent.");
    } catch {
      setStatus("done");
      setMessage("If an account exists for that email address, a password reset link has been sent.");
    }
  }

  if (status === "done" || status === "limited") {
    return (
      <div className="notice">
        <strong>{status === "limited" ? "Please wait" : "Check your email"}</strong>
        <br />
        {message}
      </div>
    );
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <p><label>Email<input type="email" name="email" autoComplete="email" required /></label></p>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
