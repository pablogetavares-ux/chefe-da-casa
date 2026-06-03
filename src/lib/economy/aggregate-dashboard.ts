import { roundMoney } from "@/modules/shopping/services/savings";
import type {
  EconomyDashboardSummary,
  EconomyMarketUsage,
  EconomyMonthlyPoint,
} from "@/modules/economy/types";

export type SavingsRow = {
  savings: number;
  at: Date;
  spend?: number;
};

export type MarketHit = {
  name: string;
};

const MONTHS_BACK = 6;

export function monthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function monthLabelPt(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function buildRecentMonthKeys(reference = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1),
  );

  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1),
    );
    keys.push(monthKey(d));
  }

  return keys;
}

export function aggregateMonthlySavings(
  rows: SavingsRow[],
  reference = new Date(),
): EconomyMonthlyPoint[] {
  const keys = buildRecentMonthKeys(reference);
  const byMonth = new Map<string, { savings: number; spend: number }>();

  for (const key of keys) {
    byMonth.set(key, { savings: 0, spend: 0 });
  }

  for (const row of rows) {
    const key = monthKey(row.at);
    if (!byMonth.has(key)) continue;
    const bucket = byMonth.get(key)!;
    bucket.savings += row.savings;
    bucket.spend += row.spend ?? 0;
  }

  return keys.map((month) => {
    const bucket = byMonth.get(month)!;
    return {
      month,
      label: monthLabelPt(month),
      savings: roundMoney(bucket.savings),
      spendEstimate: roundMoney(bucket.spend),
    };
  });
}

export function summarizeSavings(
  rows: SavingsRow[],
  reference = new Date(),
): Pick<
  EconomyDashboardSummary,
  | "totalSavings"
  | "savingsThisMonth"
  | "savingsLastMonth"
  | "monthOverMonthPercent"
> {
  const thisKey = monthKey(reference);
  const lastDate = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1),
  );
  const lastKey = monthKey(lastDate);

  let totalSavings = 0;
  let savingsThisMonth = 0;
  let savingsLastMonth = 0;

  for (const row of rows) {
    totalSavings += row.savings;
    const key = monthKey(row.at);
    if (key === thisKey) savingsThisMonth += row.savings;
    if (key === lastKey) savingsLastMonth += row.savings;
  }

  const monthOverMonthPercent =
    savingsLastMonth > 0
      ? roundMoney(
          ((savingsThisMonth - savingsLastMonth) / savingsLastMonth) * 100,
        )
      : savingsThisMonth > 0
        ? 100
        : null;

  return {
    totalSavings: roundMoney(totalSavings),
    savingsThisMonth: roundMoney(savingsThisMonth),
    savingsLastMonth: roundMoney(savingsLastMonth),
    monthOverMonthPercent,
  };
}

export function rankMarkets(
  hits: MarketHit[],
  limit = 6,
): EconomyMarketUsage[] {
  const counts = new Map<string, number>();

  for (const hit of hits) {
    const name = hit.name.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      sharePercent: roundMoney((count / total) * 100),
    }));
}

export function averageRecipeCosts(
  totals: number[],
  servings: number[],
): { avgRecipeCost: number | null; avgCostPerServing: number | null } {
  if (totals.length === 0) {
    return { avgRecipeCost: null, avgCostPerServing: null };
  }

  const avgRecipeCost = roundMoney(
    totals.reduce((sum, v) => sum + v, 0) / totals.length,
  );

  const perServing: number[] = [];
  for (let i = 0; i < totals.length; i++) {
    const s = servings[i] ?? 4;
    if (s > 0 && totals[i] > 0) {
      perServing.push(totals[i] / s);
    }
  }

  const avgCostPerServing =
    perServing.length > 0
      ? roundMoney(
          perServing.reduce((sum, v) => sum + v, 0) / perServing.length,
        )
      : null;

  return { avgRecipeCost, avgCostPerServing };
}
