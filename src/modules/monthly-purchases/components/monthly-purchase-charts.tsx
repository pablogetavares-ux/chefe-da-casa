"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import type { MonthPurchaseDashboard } from "@/modules/monthly-purchases/types";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";

const CHART_HEIGHT = 220;

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(262 83% 58%)",
  "hsl(346 77% 50%)",
  "hsl(199 89% 48%)",
  "hsl(24 95% 53%)",
  "hsl(215 20% 45%)",
];

function useChartReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ChartFrame({ children }: { children: ReactNode }) {
  const ready = useChartReady();

  if (!ready) {
    return (
      <Skeleton
        className="w-full rounded-xl"
        style={{ height: CHART_HEIGHT }}
      />
    );
  }

  return (
    <div
      className="w-full min-w-0"
      style={{ width: "100%", height: CHART_HEIGHT, minWidth: 0 }}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">
            {formatShoppingMoney(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

type MonthlyPurchaseChartsProps = {
  dashboard: MonthPurchaseDashboard;
};

export function MonthlyPurchaseCharts({
  dashboard,
}: MonthlyPurchaseChartsProps) {
  const categoryData = dashboard.current.categoryBreakdown
    .filter((row) => row.amount > 0)
    .map((row) => ({
      name: row.label,
      Gasto: row.amount,
    }));

  const comparisonData = [
    {
      name: "Anterior",
      short: dashboard.comparison.previousLabel.split(" ")[0] ?? "Ant.",
      Gasto: dashboard.previous?.totalSpent ?? 0,
    },
    {
      name: "Atual",
      short: dashboard.current.label.split(" ")[0] ?? "Atual",
      Gasto: dashboard.current.totalSpent,
    },
  ].filter((row) => row.Gasto > 0 || row.name === "Atual");

  const hasCategories = categoryData.length > 0;
  const hasComparison =
    dashboard.current.totalSpent > 0 ||
    (dashboard.previous?.totalSpent ?? 0) > 0;

  if (!hasCategories && !hasComparison) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hasCategories && (
        <div className="surface-card min-w-0 p-4 sm:p-5">
          <p className="text-sm font-medium">Gasto por categoria</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Distribuição do valor informado neste mês
          </p>
          <div className="mt-4">
            <ChartFrame>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatShoppingMoney(Number(v))}
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Bar dataKey="Gasto" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cat-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartFrame>
          </div>
        </div>
      )}

      {hasComparison && (
        <div className="surface-card min-w-0 p-4 sm:p-5">
          <p className="text-sm font-medium">Comparativo mensal</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {dashboard.current.label} e {dashboard.comparison.previousLabel}
          </p>
          <div className="mt-4">
            <ChartFrame>
              <BarChart
                data={comparisonData}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis dataKey="short" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => formatShoppingMoney(Number(v))}
                  fontSize={11}
                  width={56}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Bar
                  dataKey="Gasto"
                  radius={[6, 6, 0, 0]}
                  fill="hsl(var(--primary))"
                >
                  {comparisonData.map((_, index) => (
                    <Cell
                      key={`cmp-${index}`}
                      fill={
                        index === comparisonData.length - 1
                          ? "hsl(var(--primary))"
                          : "hsl(215 20% 65%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartFrame>
          </div>
        </div>
      )}
    </div>
  );
}
