"use client";

import Link from "next/link";
import {
  ArrowRight,
  Percent,
  Refrigerator,
  ShoppingCart,
  Sparkles,
  UserRound,
} from "lucide-react";

import { FadeInView } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OFFERS_HUB_MARKETING,
  listOffersHubMarketingVerticals,
} from "@/config/offers-hub-marketing";
import {
  OFFERS_INTEGRATION_POINTS,
  OFFERS_MARKETING,
} from "@/config/offers-experience";
import {
  OfferVerticalIcon,
  verticalAccent,
} from "@/modules/offers/constants/vertical-icons";
import { cn } from "@/lib/utils";

const integrationIcons = {
  recipes: Sparkles,
  shopping: ShoppingCart,
  pantry: Refrigerator,
  profile: UserRound,
} as const;

function VerticalHubCard({
  vertical,
  index,
}: {
  vertical: ReturnType<typeof listOffersHubMarketingVerticals>[number];
  index: number;
}) {
  const accent = verticalAccent(vertical.slug);

  return (
    <FadeInView delay={0.04 * index}>
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all sm:p-6",
          vertical.isActive
            ? "hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"
            : "border-dashed opacity-90",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100",
            accent.bg,
            "opacity-60",
          )}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <OfferVerticalIcon
            slug={vertical.slug}
            iconKey={vertical.iconKey}
            size="lg"
          />
          <Badge
            variant={vertical.isActive ? "secondary" : "outline"}
            className={cn(
              "shrink-0 text-[10px] uppercase tracking-wide",
              vertical.isActive &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {vertical.isActive ? "No hub" : "Em breve"}
          </Badge>
        </div>

        <div className="relative mt-4 flex flex-1 flex-col">
          <h3 className="font-heading text-lg font-semibold leading-tight">
            {vertical.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {vertical.description}
          </p>
          <p
            className={cn(
              "mt-3 text-xs font-medium leading-snug sm:text-sm",
              accent.icon,
            )}
          >
            {vertical.savingsLine}
          </p>
        </div>
      </article>
    </FadeInView>
  );
}

export function OffersHubSection() {
  const verticals = listOffersHubMarketingVerticals();

  return (
    <section
      id="central-ofertas"
      className="scroll-mt-24 relative overflow-hidden border-t bg-muted/20 py-16 md:py-24"
      aria-labelledby="central-ofertas-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]"
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <FadeInView className="mb-8 md:mb-10">
          <SectionHeading
            eyebrow={OFFERS_HUB_MARKETING.eyebrow}
            title={OFFERS_HUB_MARKETING.title}
            description={OFFERS_HUB_MARKETING.description}
          />
        </FadeInView>

        <FadeInView delay={0.06}>
          <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
            {OFFERS_HUB_MARKETING.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border bg-card/70 px-3 py-3 text-center backdrop-blur-sm sm:py-4"
              >
                <p className="font-heading text-xl font-semibold text-primary sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeInView>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {verticals.map((vertical, i) => (
            <VerticalHubCard
              key={vertical.slug}
              vertical={vertical}
              index={i}
            />
          ))}
        </div>

        <FadeInView delay={0.2} className="mt-12">
          <div className="rounded-2xl border bg-card/80 p-5 backdrop-blur-sm sm:p-8">
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
              Economia conectada ao seu dia a dia
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground sm:text-base">
              {OFFERS_HUB_MARKETING.domesticSavings.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Percent
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {OFFERS_INTEGRATION_POINTS.map((point) => {
                const Icon =
                  integrationIcons[point.id as keyof typeof integrationIcons] ??
                  Percent;
                return (
                  <div
                    key={point.id}
                    className="flex gap-3 rounded-xl border bg-background/60 p-3.5"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{point.label}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        <FadeInView delay={0.28} className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card px-6 py-8 text-center sm:px-10">
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              {OFFERS_MARKETING.compareNote}
            </p>
            <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="min-h-11 w-full gap-2 sm:min-w-52">
                  {OFFERS_HUB_MARKETING.ctaPrimary}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-11 w-full sm:min-w-44"
                >
                  {OFFERS_HUB_MARKETING.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
