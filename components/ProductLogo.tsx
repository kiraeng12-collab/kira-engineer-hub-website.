import Image from "next/image";

/**
 * Product logos from the owner's transparent artwork. Logos designed on a
 * background (the eagle crests, the bot) are composited onto a circular disc
 * in their native colour - white for the bright community/channel/bot marks,
 * dark for the VIP marks - so they read as clean badges. Marks that stand on
 * their own (the Academy shield, the Project 242 orbit) are kept transparent
 * and float. Full lockups with wordmarks live elsewhere (header, masters).
 */
const PRODUCT_LOGOS = {
  community: {
    src: "/kira-community-disc.png",
    alt: "Kira Trading Community logo",
  },
  vip: {
    src: "/kira-vip-disc.png",
    alt: "KIRA VIP Membership logo",
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
    src: "/kira-bot-disc.png",
    alt: "KIRA Community Bot logo",
  },
  vipGroup: {
    src: "/kira-vip-group-disc.png",
    alt: "KIRA VIP Group logo",
  },
  tradingChannel: {
    src: "/kira-trading-channel-disc.png",
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
