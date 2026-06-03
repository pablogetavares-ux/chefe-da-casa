"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

type MonthlyPurchaseTrendBadgeProps = {
  percent: number | null;
  label?: string;
  className?: string;
  /** Gastos: subir é "ruim" (amber); itens: neutro */
  variant?: "spend" | "neutral";
};

export function MonthlyPurchaseTrendBadge({
  percent,
  label = "vs mês anterior",
  className,
  variant = "spend",
}: MonthlyPurchaseTrendBadgeProps) {
  if (percent == null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
          className,
        )}
      >
        Sem base no mês anterior
      </span>
    );
  }

  if (percent === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        <Minus className="size-3.5" />
        Estável {label}
      </span>
    );
  }

  const up = percent > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const spendUpBad = variant === "spend" && up;
  const spendDownGood = variant === "spend" && !up;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        spendUpBad && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        spendDownGood &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        variant === "neutral" &&
          (up
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"),
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {formatPercent(percent)} {label}
    </span>
  );
}
