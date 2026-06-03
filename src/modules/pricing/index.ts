export const PRICING_MODULE_STATUS = "active" as const;

export * from "@/modules/pricing/types";
export * from "@/modules/pricing/constants/basic-basket";
export * from "@/modules/pricing/services/compare-engine";
export * from "@/modules/pricing/services/pricing";
export { PriceComparatorPanel } from "@/modules/pricing/components/price-comparator-panel";
export { StoreRankingCard } from "@/modules/pricing/components/store-ranking-card";
export { ComparisonSummaryBanner } from "@/modules/pricing/components/comparison-summary-banner";
export { ItemComparisonRow } from "@/modules/pricing/components/item-comparison-row";
export * from "@/shared/hooks/api/pricing";
