import Image from "next/image";

/**
 * The official crowned-eagle crest artwork for Kira Trading Community and
 * KIRA VIP Channel - used exactly as provided, never redrawn or recoloured.
 * Renders the pre-optimized 128x128 WebP thumbnail (see
 * scripts note in docs/design-tokens.md); the original 2MB+ PNGs stay
 * untouched as masters at /public/kira-*-channel.png.
 */
const PRODUCT_LOGOS = {
  community: {
    src: "/kira-trading-community-channel-thumb.webp",
    alt: "Kira Trading Community logo",
  },
  vip: {
    src: "/kira-vip-channel-thumb.webp",
    alt: "KIRA VIP Membership logo",
  },
  academy: {
    src: "/kira-academy-thumb.webp",
    alt: "KIRA Academy logo",
  },
  project242: {
    src: "/project-242-mark-thumb.webp",
    alt: "Project 242 mark",
  },
  bot: {
    src: "/kira-bot-thumb.webp",
    alt: "KIRA Community Bot logo",
  },
  vipGroup: {
    src: "/kira-vip-group-thumb.webp",
    alt: "KIRA VIP Group logo",
  },
  tradingChannel: {
    src: "/kira-trading-channel-thumb.webp",
    alt: "KIRA Trading Channel logo",
  },
} as const;

export type ProductLogoName = keyof typeof PRODUCT_LOGOS;

export function ProductLogo({
  product,
  size = 62,
  className = "product-logo",
}: {
  product: ProductLogoName;
  size?: number;
  className?: string;
}) {
  const { src, alt } = PRODUCT_LOGOS[product];
  return <Image className={className} src={src} width={size} height={size} alt={alt} />;
}
