"use client";

import { useState } from "react";
import { type PlanId, type MembershipTier, getStandardPriceDisplay, getEarlyBirdPriceDisplay, getFoundingPriceDisplay } from "@/lib/config/pricing";

function priceLabel(plan: PlanId, tier: MembershipTier | null): string {
  if (tier === "founding") return getFoundingPriceDisplay(plan);
  if (tier === "early_bird") return getEarlyBirdPriceDisplay(plan);
  return getStandardPriceDisplay(plan);
}

export function SubscribeButtons({ tier = null }: { tier?: MembershipTier | null }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function subscribe(plan: PlanId) {
    setStatus("submitting");
    try {
      const body = new URLSearchParams();
      body.set("plan", plan);
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Checkout is not available yet.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setStatus("error");
      setMessage("Checkout link was not created. Please contact support.");
    } catch {
      setStatus("error");
      setMessage("Could not start checkout. Please check your connection and try again.");
    }
  }

  return (
    <div>
      <div className="actions">
        <button className="button" type="button" disabled={status === "submitting"} onClick={() => subscribe("monthly")}>
          Subscribe Monthly - {priceLabel("monthly", tier)}
        </button>
        <button className="button secondary" type="button" disabled={status === "submitting"} onClick={() => subscribe("quarterly")}>
          Subscribe Quarterly - {priceLabel("quarterly", tier)}
        </button>
      </div>
      <p className="form-note" aria-live="polite">
        {status === "error" ? message : null}
      </p>
    </div>
  );
}
