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
import {
  getVipConsentItems,
  getCryptoVipConsentItems,
  VIP_CONSENT_TYPES,
  CRYPTO_VIP_CONSENT_TYPES,
} from "@/lib/config/vip-consent";
import { getCryptoAmountDisplay, CRYPTO_ACCESS_DAYS, CRYPTO_NETWORK_LABEL } from "@/lib/config/crypto";

type PayMethod = "card" | "crypto";

function priceLabel(plan: PlanId, tier: MembershipTier | null): string {
  if (tier === "founding") return getFoundingPriceDisplay(plan);
  if (tier === "early_bird") return getEarlyBirdPriceDisplay(plan);
  return getStandardPriceDisplay(plan);
}

/**
 * Two-step membership purchase: choose a plan, then sign and pay.
 *
 * Payment can be by card (Stripe, auto-renewing) or crypto (USDT/TRC20 via
 * NOWPayments, a one-time fixed window). Each is a separate consent set - card
 * signs a recurring-billing authorization; crypto signs a fixed-term
 * acknowledgement - and nothing is charged until the signature is recorded.
 */
export function SubscribeButtons({
  tier = null,
  cardEnabled = false,
  cryptoEnabled = false,
}: {
  tier?: MembershipTier | null;
  cardEnabled?: boolean;
  cryptoEnabled?: boolean;
}) {
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [method, setMethod] = useState<PayMethod>(cardEnabled ? "card" : "crypto");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  const consentItems = method === "crypto" ? getCryptoVipConsentItems() : getVipConsentItems();
  const consentTypes = method === "crypto" ? CRYPTO_VIP_CONSENT_TYPES : VIP_CONSENT_TYPES;

  async function handleSign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const consents = consentTypes.filter((type) => data.get(`consent_${type}`));

    if (consents.length !== consentTypes.length) {
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
          paymentMethod: method,
        }),
      });
      const consentData = await consentResponse.json().catch(() => ({}));

      if (!consentResponse.ok || !consentData.consentRecordId) {
        setStatus("error");
        setMessage(consentData.message || "Your confirmation could not be recorded. Please try again.");
        return;
      }

      // 2. Then start payment, carrying the signature reference.
      const endpoint =
        method === "crypto" ? "/api/crypto/create-invoice" : "/api/stripe/create-checkout-session";
      const body = new URLSearchParams();
      body.set("plan", plan);
      body.set("consentRecordId", consentData.consentRecordId);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "Payment is not available yet.");
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setStatus("error");
      setMessage("Payment link was not created. Please contact support.");
    } catch {
      setStatus("error");
      setMessage("Could not start payment. Please check your connection and try again.");
    }
  }

  if (!cardEnabled && !cryptoEnabled) return null;

  if (!plan) {
    return (
      <div>
        <div className="actions">
          <button className="button" type="button" onClick={() => setPlan("monthly")}>
            Choose Monthly - {priceLabel("monthly", tier)}
          </button>
          <button className="button secondary" type="button" onClick={() => setPlan("quarterly")}>
            Choose Quarterly - {priceLabel("quarterly", tier)}
          </button>
        </div>
        <p className="form-note" aria-live="polite">
          {status === "error" ? message : null}
        </p>
      </div>
    );
  }

  const showMethodToggle = cardEnabled && cryptoEnabled;
  const cryptoSummary = `${getCryptoAmountDisplay(plan, tier)} · one-time for ${CRYPTO_ACCESS_DAYS[plan]} days (${CRYPTO_NETWORK_LABEL}) — does not auto-renew`;

  return (
    <form className="form-panel" onSubmit={handleSign}>
      {showMethodToggle ? (
        <div className="actions" role="group" aria-label="Payment method">
          <button
            type="button"
            className={`button${method === "card" ? "" : " secondary"}`}
            aria-pressed={method === "card"}
            onClick={() => setMethod("card")}
          >
            Pay by card
          </button>
          <button
            type="button"
            className={`button${method === "crypto" ? "" : " secondary"}`}
            aria-pressed={method === "crypto"}
            onClick={() => setMethod("crypto")}
          >
            Pay with crypto (USDT)
          </button>
        </div>
      ) : null}

      <p>
        <strong>{plan === "monthly" ? "KIRA VIP Monthly" : "KIRA VIP Quarterly"}</strong>
        <br />
        {method === "crypto" ? cryptoSummary : `${priceLabel(plan, tier)} — renews automatically until you cancel. You can cancel online at any time from this page.`}
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

      {consentItems.map((item) => (
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
          {status === "submitting"
            ? "Recording your confirmation..."
            : method === "crypto"
              ? "Confirm and pay with crypto"
              : "Confirm and continue to payment"}
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
          : method === "crypto"
            ? "You'll be taken to a secure crypto checkout (USDT · TRC20). Your confirmation is recorded before any payment, and crypto payments are final."
            : "You will be taken to Stripe to enter payment details. Your confirmation is recorded before any charge."}
      </p>
    </form>
  );
}
