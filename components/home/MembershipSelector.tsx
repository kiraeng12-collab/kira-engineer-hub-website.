"use client";

import { useState } from "react";
import Link from "next/link";
import { EarlyBirdBadge } from "@/components/EarlyBirdBadge";
import { getStandardPrice, getQuarterlySaving, getQuarterlyEffectiveMonthly } from "@/lib/config/pricing";

/**
 * Interactive KIRA VIP plan selector: a segmented monthly/quarterly control
 * updating one premium price panel, instead of two static side-by-side
 * cards. All numbers come from lib/config/pricing (single source of truth) -
 * no urgency mechanics, no countdowns, no invented claims. Benefit lines
 * reuse the approved membership wording already public on this page and
 * /membership.
 */
const PLANS = [
  {
    id: "monthly" as const,
    label: "Monthly",
    name: "KIRA VIP Monthly",
    tag: "Most Flexible",
    period: "per month",
    billing: "Billed monthly.",
  },
  {
    id: "quarterly" as const,
    label: "Quarterly",
    name: "KIRA VIP Quarterly",
    tag: "Best Value",
    period: "every three months",
    billing: "Billed every three months.",
  },
];

const BENEFITS = [
  "Structured market discussion",
  "Risk-aware planning resources",
  "Learning resources and community support",
  "Regular market updates",
];

export function MembershipSelector() {
  const [selected, setSelected] = useState(1);
  const plan = PLANS[selected];
  const saving = getQuarterlySaving();

  return (
    <div className="plan-selector">
      <div className="plan-toggle" role="radiogroup" aria-label="Choose a billing period">
        {PLANS.map((p, index) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected === index}
            className={`plan-toggle-option${selected === index ? " active" : ""}`}
            onClick={() => setSelected(index)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <article className="plan-panel" aria-live="polite">
        <div className="plan-panel-inner" key={plan.id}>
          <span className="tag">{plan.tag}</span>
          <h3>{plan.name}</h3>
          <div className="price">
            USD {getStandardPrice(plan.id)} <span>{plan.period}</span>
          </div>
          <ul className="check-list">
            {plan.id === "quarterly" ? (
              <>
                <li>Saving: USD {saving.amount}, equal to {saving.percentage}%</li>
                <li>Equivalent cost: USD {getQuarterlyEffectiveMonthly()} per month</li>
              </>
            ) : null}
            {BENEFITS.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <p className="small-disclosure">{plan.billing}</p>
          <div className="notice">
            <EarlyBirdBadge label="Early Bird Lifetime Discount Eligibility" /> Verified eligible members receive 20%
            off qualifying KIRA VIP Membership prices while the qualifying service remains available.
          </div>
          <div className="pricing-actions">
            <Link className="button cyan" href="/membership">View Full Membership Details</Link>
            <Link className="text-link" href="/early-bird">Check Early Bird eligibility</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
