export type ProductStatus = "live" | "preparing-checkout" | "coming-soon" | "in-development" | "roadmap";

const STATUS_LABELS: Record<ProductStatus, string> = {
  live: "Live",
  "preparing-checkout": "Preparing Secure Checkout",
  "coming-soon": "Coming Soon",
  "in-development": "In Development",
  roadmap: "Roadmap",
};

const STATUS_TONE: Record<ProductStatus, "live" | "soon"> = {
  live: "live",
  "preparing-checkout": "live",
  "coming-soon": "soon",
  "in-development": "soon",
  roadmap: "soon",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className="pill" data-tone={STATUS_TONE[status]}>
      {STATUS_LABELS[status]}
    </span>
  );
}
