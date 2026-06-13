import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  Hammer,
  PawPrint,
  Pill,
  Shirt,
  ShoppingCart,
  Smartphone,
  Store,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

const VERTICAL_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  pill: Pill,
  "paw-print": PawPrint,
  shirt: Shirt,
  footprints: Footprints,
  hammer: Hammer,
  smartphone: Smartphone,
  cpu: Smartphone,
  wrench: Wrench,
};

export const VERTICAL_ACCENT: Record<
  string,
  { ring: string; bg: string; icon: string }
> = {
  supermarket: {
    ring: "ring-emerald-500/25",
    bg: "bg-emerald-500/12",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  pharmacy: {
    ring: "ring-rose-500/25",
    bg: "bg-rose-500/12",
    icon: "text-rose-600 dark:text-rose-400",
  },
  pet_shop: {
    ring: "ring-amber-500/25",
    bg: "bg-amber-500/12",
    icon: "text-amber-600 dark:text-amber-400",
  },
  clothing: {
    ring: "ring-violet-500/25",
    bg: "bg-violet-500/12",
    icon: "text-violet-600 dark:text-violet-400",
  },
  footwear: {
    ring: "ring-sky-500/25",
    bg: "bg-sky-500/12",
    icon: "text-sky-600 dark:text-sky-400",
  },
  construction: {
    ring: "ring-orange-500/25",
    bg: "bg-orange-500/12",
    icon: "text-orange-600 dark:text-orange-400",
  },
  electronics: {
    ring: "ring-blue-500/25",
    bg: "bg-blue-500/12",
    icon: "text-blue-600 dark:text-blue-400",
  },
};

const DEFAULT_ACCENT = {
  ring: "ring-primary/25",
  bg: "bg-primary/10",
  icon: "text-primary",
};

export function resolveVerticalIcon(
  iconKey: string | null | undefined,
): LucideIcon {
  if (!iconKey) return Store;
  return VERTICAL_ICONS[iconKey] ?? Store;
}

export function verticalAccent(slug: string) {
  return VERTICAL_ACCENT[slug] ?? DEFAULT_ACCENT;
}

type VerticalIconGlyphProps = {
  iconKey: string | null;
  className: string;
};

function VerticalIconGlyph({ iconKey, className }: VerticalIconGlyphProps) {
  const key = iconKey ?? "";
  if (key === "shopping-cart") {
    return <ShoppingCart className={className} aria-hidden />;
  }
  if (key === "pill") {
    return <Pill className={className} aria-hidden />;
  }
  if (key === "paw-print") {
    return <PawPrint className={className} aria-hidden />;
  }
  if (key === "shirt") {
    return <Shirt className={className} aria-hidden />;
  }
  if (key === "footprints") {
    return <Footprints className={className} aria-hidden />;
  }
  if (key === "hammer") {
    return <Hammer className={className} aria-hidden />;
  }
  if (key === "smartphone" || key === "cpu") {
    return <Smartphone className={className} aria-hidden />;
  }
  if (key === "wrench") {
    return <Wrench className={className} aria-hidden />;
  }
  return <Store className={className} aria-hidden />;
}

type OfferVerticalIconProps = {
  slug: string;
  iconKey: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function OfferVerticalIcon({
  slug,
  iconKey,
  className,
  size = "md",
}: OfferVerticalIconProps) {
  const accent = verticalAccent(slug);

  const box =
    size === "sm"
      ? "size-10 rounded-xl"
      : size === "lg"
        ? "size-14 rounded-2xl"
        : "size-12 rounded-2xl";

  const iconSize =
    size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center ring-1 ring-inset",
        box,
        accent.ring,
        accent.bg,
        className,
      )}
    >
      <VerticalIconGlyph
        iconKey={iconKey}
        className={cn(iconSize, accent.icon)}
      />
    </span>
  );
}
