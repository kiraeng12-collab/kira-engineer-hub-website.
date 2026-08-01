"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

/**
 * KIRA Partner Network application form.
 *
 * Posts to the existing /api/forms endpoint (form_type=partner), which already
 * provides server-side validation, sanitisation, rate limiting, honeypot
 * handling, DB persistence and email notification. This component adds the
 * premium client experience the endpoint doesn't: labelled fields, required
 * consent, loading/validation/error/success states, and duplicate-submit
 * protection. No applicant data is written to localStorage, and a failed
 * backend call never shows a success state.
 */

const CATEGORIES = [
  "Content creator",
  "Community owner or administrator",
  "Educator or analyst",
  "Publisher or media platform",
  "Business or strategic organisation",
  "Existing KIRA community member",
  "Other",
];

type FormState = "idle" | "submitting" | "success" | "error";

export function PartnerApplicationForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const startedRef = useRef(false);

  function onFirstInteraction() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("partner_application_start");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting" || state === "success") return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body,
      });
      const data = (await response.json().catch(() => ({}))) as { reference?: string; message?: string };

      if (!response.ok) {
        setState("error");
        setMessage(data.message || "The application could not be sent. Please try again or email support@ke-hub.com.");
        trackEvent("partner_application_error", { status: response.status });
        return;
      }

      setReference(data.reference || "");
      setState("success");
      trackEvent("partner_application_complete");
      form.reset();
    } catch {
      setState("error");
      setMessage("The application could not be sent. Please check your connection and try again.");
      trackEvent("partner_application_error", { status: 0 });
    }
  }

  if (state === "success") {
    return (
      <div className="partner-form-success" role="status" aria-live="polite">
        <div className="partner-form-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>Application received.</h3>
        <p>
          Thank you for your interest in the KIRA Partner Network. Applications are reviewed manually. Approved
          applicants will receive onboarding instructions through the contact details provided.
        </p>
        {reference ? <p className="partner-form-ref">Reference: {reference}</p> : null}
      </div>
    );
  }

  return (
    <form className="form-panel partner-form" onSubmit={handleSubmit} onInput={onFirstInteraction} noValidate>
      <input type="hidden" name="form_type" value="partner" />
      {/* Honeypot: the /api/forms endpoint silently drops any submission that
          fills this field. Kept visually hidden and out of the tab order. */}
      <label className="visually-hidden">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </label>

      <div className="grid">
        <p><label>Full legal name<input name="full_name" required autoComplete="name" /></label></p>
        <p><label>Business or brand name (if applicable)<input name="business_name" autoComplete="organization" /></label></p>
        <p><label>Email address<input type="email" name="email" required autoComplete="email" /></label></p>
        <p><label>Telegram username<input name="telegram_username" placeholder="@username" /></label></p>
        <p><label>Country of residence or registration<input name="country" required autoComplete="country-name" /></label></p>
        <p>
          <label>
            Partner category
            <select name="partner_category" required defaultValue="">
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </p>
        <p><label>Website<input type="url" name="profile" placeholder="https://" inputMode="url" /></label></p>
        <p><label>Primary social-media profile<input name="social_profile" placeholder="https:// or @handle" /></label></p>
        <p><label>Approximate audience size<input name="audience_size" inputMode="numeric" /></label></p>
        <p><label>Main audience countries<input name="audience_countries" /></label></p>
        <p><label>Primary audience languages<input name="audience_languages" /></label></p>
        <p><label>Additional promotional channels<input name="channels" /></label></p>
      </div>

      <p>
        <label>
          Description of your audience
          <textarea name="audience_description" required minLength={8} rows={3} />
        </label>
      </p>
      <p>
        <label>
          Previous affiliate or partnership experience
          <textarea name="experience" rows={2} />
        </label>
      </p>
      <p>
        <label>
          Proposed KIRA promotional approach
          <textarea name="promotional_approach" rows={3} />
        </label>
      </p>
      <p>
        <label>
          Why do you believe KIRA matches your audience?
          <textarea name="audience_fit" rows={3} />
        </label>
      </p>

      <fieldset className="partner-consents">
        <legend className="visually-hidden">Required agreements</legend>
        <label>
          <input type="checkbox" name="consent_disclosure" required />
          <span>I agree to clearly disclose that I may earn a commission from eligible referrals.</span>
        </label>
        <label>
          <input type="checkbox" name="consent_conduct" required />
          <span>
            I agree not to use profit guarantees, fake results, misleading financial claims, spam, impersonation, or
            unauthorized KIRA intellectual property.
          </span>
        </label>
        <label>
          <input type="checkbox" name="consent_independent" required />
          <span>
            I understand that approval does not create employment, agency, franchise, joint venture, fiduciary duty, or
            a legal business partnership with Kira Engineer Hub.
          </span>
        </label>
        <label>
          <input type="checkbox" name="consent_terms" required />
          <span>
            I have read and agree to the{" "}
            <Link href="/legal/affiliate-terms" target="_blank" onClick={() => trackEvent("partner_terms_click", { location: "form" })}>
              KIRA Partner Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" target="_blank">Privacy Policy</Link>.
          </span>
        </label>
      </fieldset>

      <div className="partner-form-foot">
        <button className="button cyan" type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Submitting…" : "Submit Partner Application"}
        </button>
        {state === "error" ? (
          <p className="form-note partner-form-error" role="alert">{message}</p>
        ) : (
          <p className="form-note">Applications are reviewed manually. Approval is not guaranteed.</p>
        )}
      </div>
    </form>
  );
}
