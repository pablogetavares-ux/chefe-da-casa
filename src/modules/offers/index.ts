export * from "@/shared/hooks/api/offers";
export { OfferCard } from "@/modules/offers/components/offer-card";
export { OffersFiltersBar } from "@/modules/offers/components/offers-filters-bar";
export { OffersRegionBar } from "@/modules/offers/components/offers-region-bar";
export { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
export { OffersPanel } from "@/modules/offers/components/offers-panel";
export { RecipeOffersSection } from "@/modules/offers/components/recipe-offers-section";
export * from "@/modules/offers/types";
export * from "@/modules/offers/region/constants";
export * from "@/modules/offers/region/types";
export {
  distanceKm,
  isSameCity,
  normalizeState,
} from "@/modules/offers/region/geo";
export * from "@/modules/offers/region/city-catalog";
export * from "@/modules/offers/region/filter-stores";
export * from "@/modules/offers/region/user-region";
export * from "@/modules/offers/services/offers";
export * from "@/modules/offers/services/region";
export * from "@/modules/offers/services/shopping-bridge";

export const OFFERS_MODULE_STATUS = "active" as const;
