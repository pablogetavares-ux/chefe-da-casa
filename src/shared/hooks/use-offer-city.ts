"use client";

import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

/**
 * @deprecated Use `useOfferRegionPreference` — mantém compatibilidade com telas antigas.
 */
export function useOfferCityPreference(initialCity?: string) {
  const { region, setCity, userRegion } = useOfferRegionPreference();

  return {
    city: initialCity ?? region.city,
    setCity,
    state: region.state,
    radiusKm: region.radiusKm,
    scope: region.scope,
    userRegion,
  };
}
