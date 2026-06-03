"use client";

import {
  CheckCircle2,
  Layers,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StaggerItem, StaggerList } from "@/components/shared/motion";
import type { MonthPurchaseDashboard } from "@/modules/monthly-purchases/types";
import { MonthlyPurchaseCharts } from "@/modules/monthly-purchases/components/monthly-purchase-charts";
import { MonthlyPurchaseTrendBadge } from "@/modules/monthly-purchases/components/monthly-purchase-trend-badge";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import { cn } from "@/lib/utils";

type MonthlyPurchaseDashboardProps = {
  dashboard: MonthPurchaseDashboard;
  periodLabel: string;
};

export function MonthlyPurchaseDashboardPanel({
  dashboard,
  periodLabel,
}: MonthlyPurchaseDashboardProps) {
  const { current, comparison, progressPercent, purchasedCount, pendingCount } =
    dashboard;
  const itemTotal = current.itemCount;

  return (
    <div className="mt-6 space-y-4">
      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">Progresso em {periodLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {purchasedCount} de {itemTotal} itens comprados
              {pendingCount > 0 && ` · ${pendingCount} ainda na lista`}
            </p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <CheckCircle2 className="size-5" />
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full bg-primary transition-all duration-500",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <StaggerList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="Gasto do mês"
            description={periodLabel}
            value={formatShoppingMoney(current.totalSpent)}
            icon={Wallet}
            accent="primary"
          />
          <div className="mt-2 px-1">
            <MonthlyPurchaseTrendBadge
              percent={comparison.spendChangePercent}
              variant="spend"
            />
            {comparison.hasPreviousData && (
              <p className="mt-1 text-xs text-muted-foreground">
                {comparison.spendDelta >= 0 ? "+" : ""}
                {formatShoppingMoney(comparison.spendDelta)} em relação a{" "}
                {comparison.previousLabel}
              </p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <StatCard
            title="Total de itens"
            description={`${purchasedCount} comprados · ${pendingCount} pendentes`}
            value={itemTotal}
            icon={Receipt}
            accent="amber"
          />
          <div className="mt-2 px-1">
            <MonthlyPurchaseTrendBadge
              percent={comparison.itemCountChangePercent}
              variant="neutral"
            />
          </div>
        </StaggerItem>

        <StaggerItem>
          <StatCard
            title="Maior gasto"
            description={
              current.topCategoryLabel
                ? formatShoppingMoney(current.topCategoryAmount)
                : "Informe preços nos itens"
            }
            value={current.topCategoryLabel ?? "—"}
            icon={Layers}
            accent="accent"
          />
        </StaggerItem>

        <StaggerItem>
          <StatCard
            title="Mês anterior"
            description={comparison.previousLabel}
            value={
              dashboard.previous
                ? formatShoppingMoney(dashboard.previous.totalSpent)
                : "—"
            }
            icon={TrendingUp}
            accent="rose"
          />
          {dashboard.previous && (
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              {dashboard.previous.itemCount} itens na lista
            </p>
          )}
        </StaggerItem>
      </StaggerList>

      <MonthlyPurchaseCharts dashboard={dashboard} />
    </div>
  );
}
