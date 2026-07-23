"use client";

import { useState } from "react";

/**
 * Illustrative commission estimate. The monthly membership price is passed in
 * from the server's single pricing configuration (lib/config/pricing) - it is
 * never hardcoded here - and the result is clearly marked illustrative and
 * subject to eligibility. Pure arithmetic, no tracking, no network calls.
 */
const RATE = 0.2; // 20%
const CYCLES = 12; // eligible billing cycles

export function PartnerCommissionEstimate({
  monthlyPrice,
  currency,
}: {
  monthlyPrice: number;
  currency: string;
}) {
  const [referrals, setReferrals] = useState(5);

  const perMember = monthlyPrice * RATE * CYCLES;
  const total = perMember * referrals;
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
          <span className="partner-estimate-num">{fmt(perMember)}</span>
          <span className="partner-estimate-label">per qualified member, across {CYCLES} eligible cycles</span>
        </div>
        <div>
          <span className="partner-estimate-num">{fmt(total)}</span>
          <span className="partner-estimate-label">illustrative total from {referrals} qualified {referrals === 1 ? "member" : "members"}</span>
        </div>
      </div>
      <p className="partner-estimate-note">
        Illustrative only. Based on the current KIRA VIP Membership monthly price ({fmt(monthlyPrice)}) at a{" "}
        {Math.round(RATE * 100)}% rate over {CYCLES} successful billing cycles, before discounts, refunds,
        chargebacks, failed payments, taxes and other exclusions. Actual commission is Net Eligible Revenue subject to
        the KIRA Partner Terms and is not a projection or guarantee.
      </p>
    </div>
  );
}
