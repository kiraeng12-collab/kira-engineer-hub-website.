"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirm_password") || "");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    const body = new URLSearchParams();
    body.set("token", token);
    body.set("password", password);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Could not reset password.");
        return;
      }

      router.push("/login");
    } catch {
      setStatus("error");
      setMessage("Could not reset password. Please check your connection and try again.");
    }
  }

  if (!token) {
    return <div className="notice"><strong>Missing reset token.</strong> Please use the link from your email.</div>;
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="grid">
        <p><label>New password<input type="password" name="password" autoComplete="new-password" minLength={8} required /></label></p>
        <p><label>Confirm new password<input type="password" name="confirm_password" autoComplete="new-password" minLength={8} required /></label></p>
      </div>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Resetting..." : "Reset Password"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </form>
  );
}
