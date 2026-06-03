import { DEFAULT_OFFER_SEARCH_RADIUS_KM } from "@/modules/offers/region/constants";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import type {
  OfferRegionScope,
  OfferSearchRadiusKm,
  UserOfferRegion,
} from "@/modules/offers/region/types";
import { OFFER_CITY_STORAGE_KEY } from "@/modules/offers/utils/city-preference";

export const OFFER_REGION_STORAGE_KEY = "chef-offers-region-v1";

export type StoredOfferRegion = {
  city: string;
  state: string;
  radiusKm: OfferSearchRadiusKm;
  scope: OfferRegionScope;
};

const DEFAULT_SCOPE: OfferRegionScope = "within_radius";

export function getDefaultStoredRegion(): StoredOfferRegion {
  const base = buildUserOfferRegion({});
  return {
    city: base.city,
    state: base.state,
    radiusKm: base.radiusKm,
    scope: DEFAULT_SCOPE,
  };
}

export function storedToUserRegion(stored: StoredOfferRegion): UserOfferRegion {
  return buildUserOfferRegion({
    city: stored.city,
    state: stored.state,
    radiusKm: stored.radiusKm,
  });
}

export function getStoredOfferRegion(): StoredOfferRegion {
  if (typeof window === "undefined") return getDefaultStoredRegion();

  const raw = localStorage.getItem(OFFER_REGION_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<StoredOfferRegion>;
      if (parsed.city && parsed.state) {
        return {
          city: parsed.city,
          state: parsed.state,
          radiusKm:
            parsed.radiusKm === 10 ||
            parsed.radiusKm === 25 ||
            parsed.radiusKm === 50 ||
            parsed.radiusKm === 100 ||
            parsed.radiusKm === 300
              ? parsed.radiusKm
              : DEFAULT_OFFER_SEARCH_RADIUS_KM,
          scope:
            parsed.scope === "same_city" ||
            parsed.scope === "nearby" ||
            parsed.scope === "within_radius" ||
            parsed.scope === "national"
              ? parsed.scope
              : DEFAULT_SCOPE,
        };
      }
    } catch {
      /* fallback abaixo */
    }
  }

  const legacyCity = localStorage.getItem(OFFER_CITY_STORAGE_KEY);
  if (legacyCity) {
    const region = buildUserOfferRegion({ city: legacyCity });
    return {
      city: region.city,
      state: region.state,
      radiusKm: region.radiusKm,
      scope: DEFAULT_SCOPE,
    };
  }

  return getDefaultStoredRegion();
}

export function setStoredOfferRegion(region: StoredOfferRegion) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFER_REGION_STORAGE_KEY, JSON.stringify(region));
  localStorage.setItem(OFFER_CITY_STORAGE_KEY, region.city);
}
