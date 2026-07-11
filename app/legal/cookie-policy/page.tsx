import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie policy and consent information for Kira Engineer Hub.",
  alternates: { canonical: "/legal/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="4 July 2026">
      <p>Kira Engineer Hub uses a consent manager so visitors can accept necessary cookies only or allow analytics and marketing cookies where used.</p>
      <table>
        <thead>
          <tr><th>Name</th><th>Provider</th><th>Purpose</th><th>Category</th><th>Duration</th><th>Essential</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>kira_cookie_consent</td>
            <td>Kira Engineer Hub</td>
            <td>Stores your cookie choice.</td>
            <td>Essential</td>
            <td>Up to 12 months</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>kira_cookie_preferences</td>
            <td>Kira Engineer Hub</td>
            <td>Stores analytics and marketing preferences.</td>
            <td>Essential</td>
            <td>Up to 12 months</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Analytics cookies</td>
            <td>Analytics provider if enabled</td>
            <td>Measures website usage after consent.</td>
            <td>Analytics</td>
            <td>Provider controlled</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Marketing cookies</td>
            <td>Marketing provider if enabled</td>
            <td>Supports campaign measurement after consent.</td>
            <td>Marketing</td>
            <td>Provider controlled</td>
            <td>No</td>
          </tr>
        </tbody>
      </table>
      <p><button className="button" type="button" data-cookie-settings>Open Cookie Settings</button></p>
    </LegalPageLayout>
  );
}
