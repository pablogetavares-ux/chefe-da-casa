"use client";

import { CheckCircle2 } from "lucide-react";

import type { MonthPurchaseInsights } from "@/modules/monthly-purchases/utils/insights";
import { cn } from "@/lib/utils";

type MonthlyPurchaseProgressProps = {
  insights: MonthPurchaseInsights;
  periodLabel: string;
};

export function MonthlyPurchaseProgress({
  insights,
  periodLabel,
}: MonthlyPurchaseProgressProps) {
  if (insights.itemCount === 0) return null;

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Progresso em {periodLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.purchasedCount} de {insights.itemCount} itens comprados
            {insights.pendingCount > 0 &&
              ` · ${insights.pendingCount} ainda na lista`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <CheckCircle2 className="size-5" />
          <span className="font-heading text-2xl font-semibold tabular-nums">
            {insights.progressPercent}%
          </span>
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-all duration-500",
          )}
          style={{ width: `${insights.progressPercent}%` }}
        />
      </div>
    </div>
  );
}
