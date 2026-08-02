"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirm_password") || "");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    try {
      const body = new URLSearchParams();
      body.set("name", String(data.get("name") || ""));
      body.set("email", email);
      body.set("password", password);
      body.set("terms_accepted", data.get("terms_accepted") ? "true" : "false");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Registration failed. Please try again.");
        return;
      }

      // Sign the member in immediately and take them straight to checkout — no
      // email round-trip. The verification email is still sent for later.
      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.ok) {
        router.push("/account/membership");
        return;
      }

      // Fallback if auto-login didn't take: account exists, just sign in.
      setStatus("success");
      setMessage("Account created. Please sign in to start your membership.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Registration failed. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="notice">
        <strong>Account created</strong>
        <br />
        {message} <Link href="/login?callbackUrl=/account/membership">Sign in</Link>
      </div>
    );
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="grid">
        <p><label>Full name<input name="name" autoComplete="name" required /></label></p>
        <p><label>Email<input type="email" name="email" autoComplete="email" required /></label></p>
        <p><label>Password<input type="password" name="password" autoComplete="new-password" minLength={8} required /></label></p>
        <p><label>Confirm password<input type="password" name="confirm_password" autoComplete="new-password" minLength={8} required /></label></p>
      </div>
      <p>
        <label>
          <input type="checkbox" name="terms_accepted" required /> I agree to the{" "}
          <Link href="/legal/terms">Terms of Use</Link> and have read the{" "}
          <Link href="/legal/risk-disclosure">Risk Disclosure</Link>.
        </label>
      </p>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Creating account..." : "Create Account"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </form>
  );
}
