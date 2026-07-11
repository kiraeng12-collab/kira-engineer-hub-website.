import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function ArabicPlaceholder({
  title,
  englishHref,
  englishLabel,
  noticeText,
  showBreadcrumbs,
  extraCookieButton,
}: {
  title: string;
  englishHref: string;
  englishLabel: string;
  noticeText?: string;
  showBreadcrumbs?: boolean;
  extraCookieButton?: boolean;
}) {
  // This notice and title are English (explaining that the Arabic
  // translation is pending review) - no lang="ar"/dir="rtl" here. Once real
  // Arabic copy replaces this placeholder, that content should carry its own
  // correct lang/dir, rather than the whole page being mismarked in advance.
  return (
    <div className="doc-page">
      <div className="doc-intro">
        {showBreadcrumbs ? <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal" }]} /> : null}
        <h1>{title}</h1>
      </div>
      <div className="doc-body">
        <div className="notice lang-note">
          {noticeText ??
            `Arabic legal translation requires professional UAE legal translation review before publication. Until approved, please use the English ${englishLabel}.`}
        </div>
        <p>
          <Link className="button" href={englishHref}>Open English {englishLabel}</Link>
        </p>
        {extraCookieButton ? (
          <button className="button" type="button" data-cookie-settings>Cookie Settings</button>
        ) : null}
      </div>
    </div>
  );
}
