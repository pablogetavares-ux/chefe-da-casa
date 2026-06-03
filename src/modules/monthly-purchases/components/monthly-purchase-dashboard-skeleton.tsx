"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MonthlyPurchaseDashboardSkeleton() {
  return (
    <div
      className="mt-6 space-y-4"
      aria-busy="true"
      aria-label="Carregando resumo do mês"
    >
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
