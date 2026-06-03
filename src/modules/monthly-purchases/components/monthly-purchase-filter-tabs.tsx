"use client";

import { cn } from "@/lib/utils";
import type { MonthListFilter } from "@/modules/monthly-purchases/types";

const TABS: { id: MonthListFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "A comprar" },
  { id: "purchased", label: "Comprados" },
];

type MonthlyPurchaseFilterTabsProps = {
  value: MonthListFilter;
  counts: { all: number; pending: number; purchased: number };
  onChange: (value: MonthListFilter) => void;
};

export function MonthlyPurchaseFilterTabs({
  value,
  counts,
  onChange,
}: MonthlyPurchaseFilterTabsProps) {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/40 p-1"
      role="tablist"
      aria-label="Filtrar lista"
    >
      {TABS.map((tab) => {
        const count =
          tab.id === "all"
            ? counts.all
            : tab.id === "pending"
              ? counts.pending
              : counts.purchased;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            className={cn(
              "min-h-10 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              value === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            <span className="ml-1.5 tabular-nums text-xs opacity-70">
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
