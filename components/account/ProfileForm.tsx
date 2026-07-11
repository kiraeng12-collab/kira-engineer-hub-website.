"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    const body = new URLSearchParams();
    body.set("name", String(data.get("name") || ""));

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <p><label>Full name<input name="name" defaultValue={initialName} autoComplete="name" /></label></p>
      <button className="button" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Saving..." : "Save Changes"}
      </button>
      <p className="form-note" aria-live="polite">
        {status === "success" ? "Profile updated." : null}
        {status === "error" ? "Could not save changes. Please try again." : null}
      </p>
    </form>
  );
}
