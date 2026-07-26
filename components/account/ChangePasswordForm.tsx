"use client";

import { useRef, useState } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("current_password") || "");
    const newPassword = String(data.get("new_password") || "");
    const confirm = String(data.get("confirm_password") || "");

    if (newPassword !== confirm) {
      setStatus("error");
      setMessage("The new passwords do not match.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const body = new URLSearchParams();
      body.set("currentPassword", currentPassword);
      body.set("newPassword", newPassword);
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Could not change your password. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Your password has been updated.");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      setMessage("Could not change your password. Please check your connection and try again.");
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit} ref={formRef}>
      <p>
        <label>
          Current password
          <input type="password" name="current_password" autoComplete="current-password" required />
        </label>
      </p>
      <p>
        <label>
          New password
          <input
            type="password"
            name="new_password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
      </p>
      <p>
        <label>
          Confirm new password
          <input type="password" name="confirm_password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required />
        </label>
      </p>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Updating..." : "Change Password"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "success" || status === "error" ? message : `Use at least ${MIN_PASSWORD_LENGTH} characters.`}
      </p>
    </form>
  );
}
