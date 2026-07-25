import Image from "next/image";

/**
 * Official crest emblems, cropped to just the mark (no baked wordmark or
 * background) from the owner-provided transparent logos and centred on a
 * square transparent canvas, so they sit cleanly on the dark UI at any size.
 * Full lockups with text remain elsewhere (header wordmark, master PNGs).
 */
const PRODUCT_LOGOS = {
  community: {
    src: "/kira-community-emblem.png",
    alt: "Kira Trading Community emblem",
  },
  vip: {
    src: "/kira-vip-emblem.png",
    alt: "KIRA VIP Membership emblem",
  },
  academy: {
    src: "/kira-academy-emblem.png",
    alt: "KIRA Academy emblem",
  },
  project242: {
    src: "/project-242-emblem.png",
    alt: "Project 242 mark",
  },
  bot: {
    src: "/kira-bot-emblem.png",
    alt: "KIRA Community Bot emblem",
  },
  vipGroup: {
    src: "/kira-vip-group-emblem.png",
    alt: "KIRA VIP Group emblem",
  },
  tradingChannel: {
    src: "/kira-trading-channel-emblem.png",
    alt: "KIRA Trading Channel emblem",
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
