"use client";

import { Layers, Receipt, Wallet } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { MONTH_PURCHASE_CATEGORY_LABELS } from "@/modules/monthly-purchases/constants/categories";
import type { MonthPurchaseInsights } from "@/modules/monthly-purchases/utils/insights";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import { StaggerItem, StaggerList } from "@/components/shared/motion";

type MonthlyPurchaseSummaryProps = {
  insights: MonthPurchaseInsights;
  periodLabel: string;
};

export function MonthlyPurchaseSummary({
  insights,
  periodLabel,
}: MonthlyPurchaseSummaryProps) {
  return (
    <StaggerList className="grid gap-3 sm:grid-cols-3">
      <StaggerItem>
        <StatCard
          title="Gasto do mês"
          description={periodLabel}
          value={formatShoppingMoney(insights.totalSpent)}
          icon={Wallet}
          accent="primary"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Lista do mês"
          description={`${insights.purchasedCount} comprados · ${insights.pendingCount} pendentes`}
          value={insights.itemCount}
          icon={Receipt}
          accent="amber"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Ticket médio"
          description={
            insights.topCategory
              ? `Mais gasto: ${MONTH_PURCHASE_CATEGORY_LABELS[insights.topCategory]}`
              : "Itens com preço informado"
          }
          value={
            insights.averagePerItem != null
              ? formatShoppingMoney(insights.averagePerItem)
              : "—"
          }
          icon={Layers}
          accent="accent"
        />
      </StaggerItem>
    </StaggerList>
  );
}
