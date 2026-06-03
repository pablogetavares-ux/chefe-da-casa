export type EconomyMonthlyPoint = {
  /** YYYY-MM */
  month: string;
  label: string;
  savings: number;
  spendEstimate: number;
};

export type EconomyMarketUsage = {
  name: string;
  count: number;
  sharePercent: number;
};

export type EconomyDashboardSummary = {
  totalSavings: number;
  savingsThisMonth: number;
  savingsLastMonth: number;
  monthOverMonthPercent: number | null;
  avgRecipeCost: number | null;
  avgCostPerServing: number | null;
  recipesAnalyzed: number;
  pendingSavings: number;
  weeklyPlansCount: number;
};

export type EconomyDashboardResponse = {
  summary: EconomyDashboardSummary;
  monthly: EconomyMonthlyPoint[];
  topMarkets: EconomyMarketUsage[];
  hasActivity: boolean;
  generatedAt: string;
};
