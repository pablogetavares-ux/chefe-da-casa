import { DEFAULT_OFFER_SEARCH_RADIUS_KM } from "@/modules/offers/region/constants";
import {
  defaultCityCoordinates,
  listCatalogCityOptions,
  resolveCityCoordinates,
} from "@/modules/offers/region/city-catalog";
import { normalizeState } from "@/modules/offers/region/geo";
import type {
  OfferRegionConfigResponse,
  OfferSearchRadiusKm,
  UserOfferRegion,
} from "@/modules/offers/region/types";
import {
  DEFAULT_OFFER_CITY,
  DEFAULT_OFFER_STATE,
} from "@/modules/offers/types";

export type ProfileRegionRow = {
  offer_city: string | null;
  offer_state: string | null;
  offer_search_radius_km: number | null;
};

export function isValidRadiusKm(value: number): value is OfferSearchRadiusKm {
  return (
    value === 10 ||
    value === 25 ||
    value === 50 ||
    value === 100 ||
    value === 300
  );
}

export function buildUserOfferRegion(input: {
  city?: string | null;
  state?: string | null;
  radiusKm?: number | null;
}): UserOfferRegion {
  const city = input.city?.trim() || DEFAULT_OFFER_CITY;
  const state = normalizeState(input.state?.trim() || DEFAULT_OFFER_STATE);
  const radiusKm: OfferSearchRadiusKm = isValidRadiusKm(input.radiusKm ?? 0)
    ? (input.radiusKm as OfferSearchRadiusKm)
    : DEFAULT_OFFER_SEARCH_RADIUS_KM;

  const coords =
    resolveCityCoordinates(city, state) ?? defaultCityCoordinates();

  return {
    city: coords.city,
    state: coords.state,
    radiusKm,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

export function regionFromProfile(
  profile: ProfileRegionRow | null | undefined,
): UserOfferRegion {
  return buildUserOfferRegion({
    city: profile?.offer_city,
    state: profile?.offer_state,
    radiusKm: profile?.offer_search_radius_km,
  });
}

export function buildRegionConfigResponse(
  region: UserOfferRegion,
): OfferRegionConfigResponse {
  return {
    region,
    cities: listCatalogCityOptions(),
    radiusOptions: [10, 25, 50, 100, 300],
    scopeOptions: ["within_radius", "same_city", "nearby", "national"],
  };
}
