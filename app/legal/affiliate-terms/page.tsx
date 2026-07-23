import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalConfig } from "@/lib/config/legal";

export const metadata: Metadata = {
  title: "KIRA Partner Terms",
  description:
    "Terms governing the KIRA Partner Network: eligibility, attribution, Net Eligible Revenue, commissions, payouts, prohibited conduct, disclosures, and termination.",
  alternates: { canonical: "/legal/affiliate-terms" },
};

export default function PartnerTermsPage() {
  return (
    <LegalPageLayout title="KIRA Partner Terms" lastUpdated="23 July 2026">
      <p>
        These KIRA Partner Terms (the &ldquo;Terms&rdquo;) govern participation in the KIRA Partner Network operated by{" "}
        {legalConfig.legalEntityName}, a Delaware {legalConfig.legalStructure} (&ldquo;Kira Engineer Hub&rdquo;,
        &ldquo;we&rdquo;, or &ldquo;us&rdquo;). By applying to or participating in the program, you (the
        &ldquo;Partner&rdquo;) agree to these Terms, which supplement the{" "}
        <Link href="/legal/terms">Terms of Use</Link>, <Link href="/legal/privacy">Privacy Policy</Link>,{" "}
        <Link href="/legal/affiliate-disclosure">Affiliate and Conflicts Disclosure</Link>, and{" "}
        <Link href="/legal/regulatory-notice">Regulatory Notice</Link>. Where these Terms conflict with those
        documents on partner-specific matters, these Terms control.
      </p>

      <h2>1. Eligibility and approval</h2>
      <p>
        Participation requires an application and manual approval. We may approve, refuse, suspend, or terminate any
        application or Partner at our discretion, including for audience relevance, brand alignment, compliance
        readiness, or promotional quality. Approval is not guaranteed and confers no ongoing right to participate.
      </p>

      <h2>2. Independent-contractor status; no partnership or agency</h2>
      <p>
        The Partner is an independent contractor. Nothing in these Terms creates an employment relationship, agency,
        franchise, joint venture, fiduciary relationship, or legal partnership between the Partner and Kira Engineer
        Hub. The Partner has no authority to bind, make commitments for, or represent Kira Engineer Hub, and must not
        imply otherwise. The Partner is solely responsible for its own content, staff, costs, registrations, and legal
        obligations.
      </p>

      <h2>3. Eligible referrals and new-customer requirement</h2>
      <p>
        Commissions are available only for new qualified customers who purchase an eligible KIRA VIP Membership through
        the Partner&apos;s approved referral link or promotional code and who are not existing or previously registered
        customers, and who were not already in a checkout or sales process. Referrals of existing members, reassigned
        customers, or customers acquired outside the approved attribution method are not eligible.
      </p>

      <h2>4. Attribution</h2>
      <p>
        Eligible referrals are attributed through an approved link, promotional code, or attribution method with a
        30-day attribution window measured from the referred visitor&apos;s qualifying action, subject to the tracking
        system in use, cookie and consent settings, and last-touch attribution rules. We may adjust attribution to
        correct errors, duplicates, or manipulation.
      </p>

      <h2>5. Referral links and promotional codes</h2>
      <p>
        Partners must use only the referral links and codes issued to them and must not alter, cloak, or misrepresent
        them. Codes may only be shared where permitted by the approved campaign. Unauthorized discounts, bonuses, or
        code distribution are prohibited.
      </p>

      <h2>6. Net Eligible Revenue</h2>
      <p>
        <strong>Net Eligible Revenue</strong> means eligible membership revenue actually received by Kira Engineer Hub
        after applicable discounts, credits, refunds, chargebacks, failed payments, taxes, duplicate transactions,
        fraudulent transactions, and other excluded amounts.
      </p>

      <h2>7. Commission and duration</h2>
      <p>
        Approved Partners earn 20% of Net Eligible Revenue from each new qualified KIRA VIP Membership referral for the
        referred customer&apos;s first 12 successful billing cycles. Commissions apply only to eligible Kira Engineer
        Hub membership revenue. We do not pay commissions based on broker deposits, trading volume, spreads, customer
        losses, account balances, investment activity, or the purchase of financial instruments. Strategic
        partnerships may operate under a separate written agreement.
      </p>

      <h2>8. Validation, payouts, and minimum threshold</h2>
      <p>
        Commissions are subject to a 30-day validation period before they become payable. Approved commissions are paid
        monthly, provided the Partner&apos;s balance has reached the minimum payout threshold of USD 50. Amounts below
        the threshold roll forward until the threshold is met.
      </p>

      <h2>9. Refunds, cancellations, chargebacks, and reversals</h2>
      <p>
        Refunds, cancellations, failed payments, chargebacks, fraud, self-referrals, and reassigned or ineligible
        transactions reduce Net Eligible Revenue and may reverse or claw back commissions, including amounts already
        approved or paid. We may withhold or offset commissions to account for reversals.
      </p>

      <h2>10. Tax and identity documentation</h2>
      <p>
        The Partner is responsible for all taxes on commissions and for its own invoicing and reporting. We may require
        identity and tax documentation before making payments and may withhold payment until valid documentation is
        provided.
      </p>

      <h2>11. Self-referrals, fraud, and artificial attribution</h2>
      <p>
        Purchasing through your own link or code, coordinating artificial referrals, cookie stuffing, forced clicks,
        adware, misleading redirects, or any manipulation of tracking is prohibited and voids the affected commissions.
        We may investigate suspected fraud and withhold or reverse related amounts.
      </p>

      <h2>12. Paid advertising and brand-keyword bidding</h2>
      <p>
        Paid search or social advertising requires prior written approval. Bidding on Kira Engineer Hub brand keywords
        or variations, and running advertisements that misuse KIRA intellectual property, are prohibited without
        written approval.
      </p>

      <h2>13. Domains, usernames, and social profiles</h2>
      <p>
        Partners must not register domains, usernames, social-media profiles, application names, or advertisements that
        are confusingly similar to, or that impersonate, Kira Engineer Hub or its brands.
      </p>

      <h2>14. Intellectual-property licence</h2>
      <p>
        We grant a limited, revocable, non-exclusive, non-transferable licence to use approved KIRA brand assets solely
        to promote eligible products in accordance with the current brand guidelines and these Terms. All goodwill
        arising from such use benefits Kira Engineer Hub. The licence ends on termination.
      </p>

      <h2>15. Mandatory affiliate disclosure</h2>
      <p>
        Partners must clearly disclose their commercial relationship near each recommendation, referral link, button,
        or call to action. A suitable disclosure is: &ldquo;I may earn a commission if you join Kira Engineer Hub
        through my link or code. This does not increase the price you pay.&rdquo; The disclosure must not be hidden only
        in a biography, footer, separate terms page, or group description.
      </p>

      <h2>16. Prohibited financial and performance claims</h2>
      <p>
        Partners must not guarantee profits, returns, accuracy, success, or financial outcomes; fabricate testimonials,
        reviews, customer numbers, or trading results; present educational material as personalized investment advice;
        or suggest that Kira Engineer Hub is a broker, regulated investment adviser, investment manager, or
        account-management service. KIRA products are educational and must be presented accurately.
      </p>

      <h2>17. Confidential information</h2>
      <p>
        Non-public program information, campaign details, and reporting are confidential and must not be disclosed or
        used outside the program.
      </p>

      <h2>18. Data protection and privacy</h2>
      <p>
        Each party complies with applicable data-protection and privacy laws. Partners must handle any personal data
        lawfully, provide required notices, and must not send spam or unsolicited messaging. Our handling of personal
        data is described in the <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>19. Monitoring and audit</h2>
      <p>
        We may monitor promotional activity and referral quality and may audit records reasonably necessary to verify
        compliance and commission accuracy.
      </p>

      <h2>20. Suspension and termination</h2>
      <p>
        Either party may end participation at any time. We may suspend tracking, withhold or reverse ineligible
        commissions, and terminate a Partner for breach, suspected fraud, reputational risk, or non-compliance. On
        termination, the brand licence ends and outstanding eligible commissions are reviewed according to validation
        status, refund risk, and program compliance.
      </p>

      <h2>21. Changes to the program</h2>
      <p>
        We may change these Terms, commission rates, eligibility, or the program itself, with effect from the date the
        updated Terms are posted. Continued participation after changes constitutes acceptance.
      </p>

      <h2>22. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Kira Engineer Hub is not liable for indirect, incidental,
        special, or consequential losses, lost profits, or lost opportunities arising from the program. Our aggregate
        liability under these Terms is limited to the commissions payable to the Partner in the three months preceding
        the event giving rise to the claim.
      </p>

      <h2>23. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of {legalConfig.governingLaw}, and the {legalConfig.courtJurisdiction}{" "}
        have jurisdiction, without prejudice to any mandatory consumer-protection rights in the Partner&apos;s country
        of residence. Disputes should first be raised through the contact route below in good faith.
      </p>

      <h2>24. Contact</h2>
      <p>
        Contact: <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Apply through the{" "}
        <Link href="/partner-program">KIRA Partner Network</Link> page.
      </p>
    </LegalPageLayout>
  );
}
