import { describe, expect, it } from "vitest";

import {
  aggregateMonthlySavings,
  averageRecipeCosts,
  rankMarkets,
  summarizeSavings,
} from "@/lib/economy/aggregate-dashboard";

describe("aggregateMonthlySavings", () => {
  it("agrupa economia por mês", () => {
    const ref = new Date(Date.UTC(2026, 4, 15));
    const monthly = aggregateMonthlySavings(
      [
        { savings: 10, at: new Date(Date.UTC(2026, 4, 2)) },
        { savings: 5, at: new Date(Date.UTC(2026, 3, 10)) },
      ],
      ref,
    );

    const may = monthly.find((m) => m.month === "2026-05");
    const apr = monthly.find((m) => m.month === "2026-04");

    expect(may?.savings).toBe(10);
    expect(apr?.savings).toBe(5);
    expect(monthly).toHaveLength(6);
  });
});

describe("summarizeSavings", () => {
  it("calcula variação mês a mês", () => {
    const ref = new Date(Date.UTC(2026, 4, 20));
    const summary = summarizeSavings(
      [
        { savings: 20, at: new Date(Date.UTC(2026, 4, 1)) },
        { savings: 10, at: new Date(Date.UTC(2026, 3, 1)) },
      ],
      ref,
    );

    expect(summary.savingsThisMonth).toBe(20);
    expect(summary.savingsLastMonth).toBe(10);
    expect(summary.monthOverMonthPercent).toBe(100);
  });
});

describe("rankMarkets", () => {
  it("ordena mercados por uso", () => {
    const ranked = rankMarkets([
      { name: "Extra" },
      { name: "Atacadão" },
      { name: "Extra" },
    ]);

    expect(ranked[0]?.name).toBe("Extra");
    expect(ranked[0]?.count).toBe(2);
    expect(ranked[0]?.sharePercent).toBe(66.67);
  });
});

describe("averageRecipeCosts", () => {
  it("média de custo e por porção", () => {
    const avg = averageRecipeCosts([40, 60], [4, 2]);
    expect(avg.avgRecipeCost).toBe(50);
    expect(avg.avgCostPerServing).toBe(20);
  });
});
