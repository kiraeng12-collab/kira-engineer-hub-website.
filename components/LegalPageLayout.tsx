import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }]} />
        <h1>{title}</h1>
        <p className="meta">Last updated: {lastUpdated}</p>
      </div>
      <div className="doc-body">
        <article>{children}</article>
      </div>
    </div>
  );
}
