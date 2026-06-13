"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OFFERS_INTEGRATION_POINTS,
  OFFERS_ROADMAP_ITEMS,
} from "@/config/offers-experience";
import { cn } from "@/lib/utils";

type OffersIntegrationBannerProps = {
  variant?: "compact" | "full";
  showRoadmap?: boolean;
  className?: string;
};

export function OffersIntegrationBanner({
  variant = "full",
  showRoadmap = true,
  className,
}: OffersIntegrationBannerProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card",
        isCompact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 ring-inset">
          <Percent className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3
              className={cn(
                "font-heading font-semibold",
                isCompact ? "text-base" : "text-lg",
              )}
            >
              Ofertas integradas ao seu fluxo
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Promoções regionais conectadas à despensa, receitas, lista e
              perfil — personalizadas para você.
            </p>
          </div>

          <ul
            className={cn(
              "grid gap-2",
              isCompact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {OFFERS_INTEGRATION_POINTS.map((point) => (
              <li
                key={point.id}
                className="flex items-start gap-2 rounded-xl border bg-background/60 px-3 py-2 text-sm"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-medium">{point.label}</span>
                  {!isCompact ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {point.description}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          {showRoadmap ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Em breve:
              </span>
              {OFFERS_ROADMAP_ITEMS.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="font-normal text-muted-foreground"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : null}

          {!isCompact ? (
            <Link href="/app/offers">
              <Button size="sm" variant="outline" className="mt-1">
                Abrir Central de Ofertas
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
