import type { Tables } from "@/types/database";

export type ProductRow = Tables<"products">;
export type MarketPriceRow = Tables<"market_prices">;

export type ProductWithPrices = ProductRow & {
  market_prices: MarketPriceRow[];
};

export type ProductPriceComparison = {
  product: ProductRow;
  prices: MarketPriceRow[];
  cheapest: MarketPriceRow | null;
  mostExpensive: MarketPriceRow | null;
  priceSpread: number;
  marketCount: number;
};

export type ProductsCompareResponse = {
  comparisons: ProductPriceComparison[];
  markets: string[];
  totalProducts: number;
};
