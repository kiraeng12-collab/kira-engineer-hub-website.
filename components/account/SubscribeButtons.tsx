"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type PlanId,
  type MembershipTier,
  getStandardPriceDisplay,
  getEarlyBirdPriceDisplay,
  getFoundingPriceDisplay,
} from "@/lib/config/pricing";
import { getVipConsentItems, VIP_CONSENT_TYPES } from "@/lib/config/vip-consent";

function priceLabel(plan: PlanId, tier: MembershipTier | null): string {
  if (tier === "founding") return getFoundingPriceDisplay(plan);
  if (tier === "early_bird") return getEarlyBirdPriceDisplay(plan);
  return getStandardPriceDisplay(plan);
}

const CONSENT_ITEMS = getVipConsentItems();

/**
 * Two-step membership purchase: choose a plan, then sign.
 *
 * The signing step is deliberately short (four confirmations plus name and
 * country) but each confirmation is a separate affirmative act, which is what
 * makes recurring-billing, risk and electronic-record consent provable
 * independently. Nothing is charged until the signature is recorded.
 */
export function SubscribeButtons({ tier = null }: { tier?: MembershipTier | null }) {
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const consents = VIP_CONSENT_TYPES.filter((type) => data.get(`consent_${type}`));

    if (consents.length !== VIP_CONSENT_TYPES.length) {
      setStatus("error");
      setMessage("Please confirm every statement before continuing.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      // 1. Record the signature first — no signature, no charge.
      const consentResponse = await fetch("/api/consent/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: String(data.get("legal_name") || ""),
          country: String(data.get("country") || ""),
          telegramUsername: String(data.get("telegram_username") || ""),
          consents,
        }),
      });
      const consentData = await consentResponse.json().catch(() => ({}));

      if (!consentResponse.ok || !consentData.consentRecordId) {
        setStatus("error");
        setMessage(consentData.message || "Your confirmation could not be recorded. Please try again.");
        return;
      }

      // 2. Then start checkout, carrying the signature reference.
      const body = new URLSearchParams();
      body.set("plan", plan);
      body.set("consentRecordId", consentData.consentRecordId);

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Checkout is not available yet.");
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setStatus("error");
      setMessage("Checkout link was not created. Please contact support.");
    } catch {
      setStatus("error");
      setMessage("Could not start checkout. Please check your connection and try again.");
    }
  }

  if (!plan) {
    return (
      <div>
        <div className="actions">
          <button className="button" type="button" onClick={() => setPlan("monthly")}>
            Subscribe Monthly - {priceLabel("monthly", tier)}
          </button>
          <button className="button secondary" type="button" onClick={() => setPlan("quarterly")}>
            Subscribe Quarterly - {priceLabel("quarterly", tier)}
          </button>
        </div>
        <p className="form-note" aria-live="polite">
          {status === "error" ? message : null}
        </p>
      </div>
    );
  }

  return (
    <form className="form-panel" onSubmit={handleSign}>
      <p>
        <strong>{plan === "monthly" ? "KIRA VIP Monthly" : "KIRA VIP Quarterly"}</strong>
        <br />
        {priceLabel(plan, tier)} — renews automatically until you cancel. You can cancel online at
        any time from this page.
      </p>

      <div className="grid">
        <p>
          <label>
            Full legal name
            <input name="legal_name" autoComplete="name" minLength={2} maxLength={120} required />
          </label>
        </p>
        <p>
          <label>
            Country of residence
            <input name="country" autoComplete="country-name" minLength={2} maxLength={56} required />
          </label>
        </p>
      </div>
      <p>
        <label>
          Telegram username (optional, helps us activate your access faster)
          <input name="telegram_username" maxLength={64} placeholder="@yourusername" />
        </label>
      </p>

      {CONSENT_ITEMS.map((item) => (
        <p key={item.type}>
          <label>
            <input type="checkbox" name={`consent_${item.type}`} required /> {item.label}
          </label>
          {item.documents.length > 0 ? (
            <span className="form-note">
              {item.documents.map((doc, index) => (
                <span key={doc.href}>
                  {index > 0 ? " · " : ""}
                  <Link href={doc.href} target="_blank" rel="noopener noreferrer">
                    {doc.title}
                  </Link>
                </span>
              ))}
            </span>
          ) : null}
        </p>
      ))}

      <div className="actions">
        <button className="button" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Recording your confirmation..." : "Confirm and continue to payment"}
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={status === "submitting"}
          onClick={() => {
            setPlan(null);
            setStatus("idle");
            setMessage("");
          }}
        >
          Back
        </button>
      </div>

      <p className="form-note" aria-live="polite">
        {status === "error"
          ? message
          : "You will be taken to Stripe to enter payment details. Your confirmation is recorded before any charge."}
      </p>
    </form>
  );
}
