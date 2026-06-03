"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import type {
  EconomyMarketUsage,
  EconomyMonthlyPoint,
} from "@/modules/economy/types";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";

const CHART_HEIGHT = 256;

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(262 83% 58%)",
  "hsl(346 77% 50%)",
  "hsl(199 89% 48%)",
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

type EconomyChartsProps = {
  monthly: EconomyMonthlyPoint[];
  topMarkets: EconomyMarketUsage[];
};

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

export function EconomyMonthlyChart({
  monthly,
}: {
  monthly: EconomyMonthlyPoint[];
}) {
  const data = monthly.map((point) => ({
    name: point.label,
    Economia: point.savings,
    Gasto: point.spendEstimate,
  }));

  return (
    <ChartFrame>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`
          }
        />
        <Tooltip content={<MoneyTooltip />} />
        <Bar
          dataKey="Economia"
          fill="hsl(142 76% 36%)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
        <Bar
          dataKey="Gasto"
          fill="hsl(var(--muted-foreground) / 0.35)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ChartFrame>
  );
}

export function EconomyMarketsChart({
  topMarkets,
}: {
  topMarkets: EconomyMarketUsage[];
}) {
  if (topMarkets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Vincule ofertas na lista ou gere um plano semanal para ver mercados.
      </p>
    );
  }

  const data = topMarkets.map((m) => ({
    name: m.name,
    value: m.count,
  }));

  return (
    <div className="w-full min-w-0">
      <ChartFrame>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : 0;
              const label = typeof name === "string" ? name : "";
              return [`${n} uso${n === 1 ? "" : "s"}`, label];
            }}
          />
        </PieChart>
      </ChartFrame>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {topMarkets.map((market, index) => (
          <li
            key={market.name}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
          >
            <span
              className="size-2 rounded-full"
              style={{
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            {market.name} ({market.sharePercent}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EconomyCharts({ monthly, topMarkets }: EconomyChartsProps) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <div className="surface-card min-w-0 p-4 sm:p-6">
        <h3 className="font-heading text-lg font-semibold">
          Economia mês a mês
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Barras verdes: economia estimada. Cinza: gasto nas compras e planos.
        </p>
        <EconomyMonthlyChart monthly={monthly} />
      </div>
      <div className="surface-card min-w-0 p-4 sm:p-6">
        <h3 className="font-heading text-lg font-semibold">
          Mercados mais usados
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Ofertas na lista e mercado mais barato nos planos semanais.
        </p>
        <EconomyMarketsChart topMarkets={topMarkets} />
      </div>
    </div>
  );
}
