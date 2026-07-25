"use client";

import { useState } from "react";

/**
 * Illustrative commission estimate. Deliberately leads with the honest,
 * always-true unit - what you earn for each month a referred member stays
 * subscribed - and frames the 12-cycle figures as MAXIMUMS ("up to"), because
 * most members won't stay a full year. The monthly price comes from the
 * server's single pricing configuration (lib/config/pricing), never hardcoded.
 * Pure arithmetic, no tracking, no network calls.
 */
const RATE = 0.2; // 20%
const MAX_CYCLES = 12; // eligible billing cycles ceiling

export function PartnerCommissionEstimate({
  monthlyPrice,
  currency,
}: {
  monthlyPrice: number;
  currency: string;
}) {
  const [referrals, setReferrals] = useState(5);

  const perMonth = monthlyPrice * RATE; // earned each month a member stays subscribed
  const maxPerMember = perMonth * MAX_CYCLES; // ceiling if they stay the full 12 cycles
  const maxTotal = maxPerMember * referrals;
  const fmt = (n: number) => `${currency} ${Math.round(n).toLocaleString("en-US")}`;

  return (
    <div className="partner-estimate">
      <div className="partner-estimate-control">
        <label htmlFor="partner-referrals">
          Qualified members referred
          <span className="partner-estimate-value">{referrals}</span>
        </label>
        <input
          id="partner-referrals"
          type="range"
          min={1}
          max={100}
          step={1}
          value={referrals}
          onChange={(e) => setReferrals(Number(e.target.value))}
        />
      </div>
      <div className="partner-estimate-out">
        <div>
          <span className="partner-estimate-num">{fmt(perMonth)}</span>
          <span className="partner-estimate-label">
            for each month a referred member stays subscribed (20% of {fmt(monthlyPrice)})
          </span>
        </div>
        <div>
          <span className="partner-estimate-num">up to {fmt(maxTotal)}</span>
          <span className="partner-estimate-label">
            maximum from {referrals} {referrals === 1 ? "member" : "members"} &mdash; only if each stays all{" "}
            {MAX_CYCLES} billing cycles
          </span>
        </div>
      </div>
      <p className="partner-estimate-note">
        Illustrative, not a projection or guarantee. You earn 20% of Net Eligible Revenue for up to {MAX_CYCLES} cycles
        per member, so you earn only while a referred member stays subscribed and their payments clear &mdash; members
        who cancel, refund, or lapse earlier earn proportionally less (a full year is the ceiling of {fmt(maxPerMember)}
        {" "}per member, not the typical result). Figures use the current {fmt(monthlyPrice)} monthly price before
        discounts, taxes and other exclusions, per the KIRA Partner Terms.
      </p>
    </div>
  );
}
