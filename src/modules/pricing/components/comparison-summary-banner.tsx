"use client";

import { PiggyBank, TrendingDown } from "lucide-react";

import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { PriceComparisonSummary } from "@/modules/pricing/types";
import { cn } from "@/lib/utils";

type ComparisonSummaryBannerProps = {
  summary: PriceComparisonSummary;
  city: string;
  className?: string;
};

export function ComparisonSummaryBanner({
  summary,
  city,
  className,
}: ComparisonSummaryBannerProps) {
  const hasOffers = summary.itemsWithOffers > 0;

  return (
    <div
      className={cn(
        "surface-card overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-sky-500/5 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <TrendingDown className="size-4" />
            Comparador · {city}
          </p>
          <p className="text-sm text-muted-foreground">
            {summary.itemsWithOffers}/{summary.totalItems} itens com oferta
            regional
          </p>
        </div>

        {summary.cheapestSubtotal > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Menor total</p>
            <p className="text-2xl font-bold tracking-tight">
              {formatShoppingMoney(summary.cheapestSubtotal)}
            </p>
          </div>
        )}
      </div>

      {(summary.estimatedSavingsVsAverage > 0 ||
        summary.estimatedSavingsVsMostExpensive > 0) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {summary.estimatedSavingsVsAverage > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400">
              <PiggyBank className="size-3" />
              Até {formatShoppingMoney(summary.estimatedSavingsVsAverage)} vs.
              média dos mercados
            </span>
          )}
          {summary.estimatedSavingsVsMostExpensive > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-muted-foreground">
              Até {formatShoppingMoney(summary.estimatedSavingsVsMostExpensive)}{" "}
              vs. mercado mais caro
            </span>
          )}
        </div>
      )}

      {!hasOffers && summary.totalItems > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma oferta encontrada para estes itens nesta cidade. Tente outra
          cidade ou confira a aba Ofertas.
        </p>
      )}
    </div>
  );
}
