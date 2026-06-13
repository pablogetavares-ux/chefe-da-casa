export * from "@/shared/hooks/api/offers";
export { OfferCard } from "@/modules/offers/components/offer-card";
export { OffersFiltersBar } from "@/modules/offers/components/offers-filters-bar";
export { OffersRegionBar } from "@/modules/offers/components/offers-region-bar";
export { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
export { OffersHub } from "@/modules/offers/components/offers-hub";
export { OffersPanel } from "@/modules/offers/components/offers-panel";
export { AntiWasteOffersSection } from "@/modules/offers/components/anti-waste-offers-section";
export { IngredientOffersSection } from "@/modules/offers/components/ingredient-offers-section";
export { PantryOffersSection } from "@/modules/offers/components/pantry-offers-section";
export { WeeklyPlanOffersSection } from "@/modules/offers/components/weekly-plan-offers-section";
export { OffersPersonalizationHint } from "@/modules/offers/components/offers-personalization-hint";
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
export type { RegionalOffersQueryResult } from "@/modules/offers/services/offers";
export * from "@/modules/offers/services/catalog";
export * from "@/modules/offers/services/region";
export * from "@/modules/offers/services/shopping-bridge";
export * from "@/modules/offers/services/integrations";
export * from "@/modules/offers/services/user-offer-context";
export * from "@/modules/offers/utils/prioritization";
export * from "@/modules/offers/utils/search";

export const OFFERS_MODULE_STATUS = "active" as const;
