"use client";

import { PiggyBank, Sparkles, Tag } from "lucide-react";

import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { ShoppingListSummary } from "@/modules/shopping/types";
import { cn } from "@/lib/utils";

type ShoppingSavingsBannerProps = {
  summary: ShoppingListSummary;
  className?: string;
};

export function ShoppingSavingsBanner({
  summary,
  className,
}: ShoppingSavingsBannerProps) {
  const totalSavings = summary.confirmedSavings + summary.potentialSavings;

  if (totalSavings <= 0 && summary.pendingItems === 0) return null;

  return (
    <div
      className={cn(
        "surface-card overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Lista inteligente
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {summary.pendingItems}{" "}
            {summary.pendingItems === 1 ? "item" : "itens"} a comprar
          </p>
        </div>

        {totalSavings > 0 && (
          <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-right">
            <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <PiggyBank className="size-3.5" />
              Economia estimada
            </p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {formatShoppingMoney(totalSavings)}
            </p>
          </div>
        )}
      </div>

      {(summary.confirmedSavings > 0 || summary.potentialSavings > 0) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {summary.confirmedSavings > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
              <Tag className="size-3" />
              {formatShoppingMoney(summary.confirmedSavings)} em ofertas
              vinculadas
            </span>
          )}
          {summary.potentialSavings > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
              + {formatShoppingMoney(summary.potentialSavings)} em matches
              regionais
            </span>
          )}
        </div>
      )}
    </div>
  );
}
