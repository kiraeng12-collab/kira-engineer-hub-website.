import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <p className="crumbs">
      {items.map((item, index) => (
        <span key={item.label}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          {index < items.length - 1 ? " / " : null}
        </span>
      ))}
    </p>
  );
}
