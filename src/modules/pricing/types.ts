import type { RegionalOffer } from "@/modules/offers/types";

export type CompareSource = "list" | "basket" | "custom";

export type CompareItemInput = {
  id?: string;
  name: string;
  quantity?: number;
};

export type ItemOfferCandidate = {
  offerId: string;
  storeId: string;
  storeChain: string;
  storeName: string;
  storeCity: string;
  productName: string;
  title: string;
  currentPrice: number;
  previousPrice: number | null;
  unit: string | null;
  estimatedSavings: number;
  matchScore: number;
  imageUrl: string | null;
};

export type ItemComparisonResult = {
  itemId?: string;
  itemName: string;
  quantity: number;
  candidates: ItemOfferCandidate[];
  bestOffer: ItemOfferCandidate | null;
};

export type StoreBasketTotal = {
  storeId: string;
  storeChain: string;
  storeName: string;
  storeCity: string;
  rank: number;
  matchedItems: number;
  missingItems: number;
  totalItems: number;
  coveragePercent: number;
  subtotal: number;
  estimatedSavings: number;
  lineItems: Array<{
    itemName: string;
    offerId: string;
    price: number;
    productName: string;
  }>;
};

export type PriceComparisonSummary = {
  totalItems: number;
  itemsWithOffers: number;
  cheapestSubtotal: number;
  averageSubtotal: number;
  mostExpensiveSubtotal: number;
  estimatedSavingsVsAverage: number;
  estimatedSavingsVsMostExpensive: number;
};

export type PriceComparisonResponse = {
  city: string;
  source: CompareSource;
  listId?: string;
  items: ItemComparisonResult[];
  storeRankings: StoreBasketTotal[];
  cheapestStore: StoreBasketTotal | null;
  summary: PriceComparisonSummary;
};

export type CompareFromListParams = {
  listId?: string;
  city: string;
};

export type CompareBasketParams = {
  city: string;
};

export type CompareCustomParams = {
  city: string;
  items: CompareItemInput[];
};

export type PricingOfferRef = Pick<
  RegionalOffer,
  | "id"
  | "product_name"
  | "title"
  | "current_price"
  | "previous_price"
  | "unit"
  | "image_url"
>;
