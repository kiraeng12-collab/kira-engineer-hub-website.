"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in. Check your inbox for the verification link.",
  TOO_MANY_ATTEMPTS: "Too many sign-in attempts. Please wait a few minutes and try again.",
  CredentialsSignin: "Invalid email or password.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      redirect: false,
    });

    if (result?.error) {
      setStatus("error");
      setMessage(ERROR_MESSAGES[result.error] || "Invalid email or password.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/account");
    router.refresh();
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="grid">
        <p><label>Email<input type="email" name="email" autoComplete="email" required /></label></p>
        <p><label>Password<input type="password" name="password" autoComplete="current-password" required /></label></p>
      </div>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Signing in..." : "Sign In"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </form>
  );
}
