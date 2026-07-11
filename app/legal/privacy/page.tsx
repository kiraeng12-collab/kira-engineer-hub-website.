import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Kira Engineer Hub website, communities, memberships and requests.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="4 July 2026">
      <h2>Controller identity</h2>
      <p>
        Kira Engineer Hub operates this website and related contact channels. Final legal entity details will be
        published when supplied by the owner. Privacy contact: <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a>.
      </p>
      <h2>Information collected</h2>
      <ul>
        <li>Name, email address, Telegram username, Telegram identifiers and contact details you provide.</li>
        <li>Membership inquiries, access records, payment references, support messages, privacy requests and complaints.</li>
        <li>Technical data such as IP address, browser, device information, cookie consent choices and website usage data.</li>
        <li>Payment information processed by payment providers such as Stripe if checkout is later activated. Kira Engineer Hub should not store full card details.</li>
      </ul>
      <h2>Purposes and legal grounds</h2>
      <p>
        Information is used to respond to inquiries, provide access, manage membership, process requests, handle
        complaints, secure the website, prevent abuse, comply with obligations and improve educational services.
        Legal grounds may include consent, contract performance, legitimate interests, legal obligations and user
        request handling depending on applicable law.
      </p>
      <h2>Providers and transfers</h2>
      <p>Telegram, Instagram, hosting providers, email systems, analytics providers and payment providers may process information in different countries under their own terms and safeguards.</p>
      <h2>Cookies and analytics</h2>
      <p>Analytics and marketing tools should not load before valid consent where consent is required. Cookie choices can be changed using Cookie Settings.</p>
      <h2>Retention</h2>
      <p>Information is retained only as long as needed for the purpose collected, support history, legal/accounting needs, fraud prevention, dispute handling or community safety.</p>
      <h2>Security</h2>
      <p>Reasonable technical and organizational controls are used, but no online system can be guaranteed perfectly secure.</p>
      <h2>User rights</h2>
      <p>Depending on applicable law, users may request access, correction, deletion, restriction, objection, portability, withdrawal of consent or marketing opt-out. Verification may be required before action is taken.</p>
      <h2>Children</h2>
      <p>The website and services are not intended for children or anyone under 18.</p>
      <h2>Complaints and updates</h2>
      <p>Privacy concerns can be sent to the privacy contact. This policy may be updated as services, providers or legal requirements change.</p>
    </LegalPageLayout>
  );
}
