import { distanceKm, isSameCity } from "@/modules/offers/region/geo";
import type {
  OfferRegionScope,
  RegionalStoreGeo,
  StoreRegionMatch,
  UserOfferRegion,
} from "@/modules/offers/region/types";

function storeHasCoordinates(store: RegionalStoreGeo) {
  return store.latitude != null && store.longitude != null;
}

export function matchStoreToRegion(
  store: RegionalStoreGeo,
  region: UserOfferRegion,
): StoreRegionMatch | null {
  if (!store.is_active) return null;

  const sameCity = isSameCity(
    store.city,
    store.state,
    region.city,
    region.state,
  );

  if (!storeHasCoordinates(store)) {
    return sameCity
      ? {
          store,
          distanceKm: 0,
          scope: "same_city",
        }
      : null;
  }

  const dist = distanceKm(
    region.latitude,
    region.longitude,
    store.latitude!,
    store.longitude!,
  );

  if (dist > region.radiusKm) return null;

  const scope: OfferRegionScope = sameCity ? "same_city" : "nearby";

  return { store, distanceKm: dist, scope };
}

export function filterStoresByRegionScope(
  stores: RegionalStoreGeo[],
  region: UserOfferRegion,
  scope: OfferRegionScope,
): StoreRegionMatch[] {
  const matches = stores
    .map((store) => matchStoreToRegion(store, region))
    .filter((entry): entry is StoreRegionMatch => entry !== null);

  switch (scope) {
    case "national":
      return stores
        .filter((store) => store.is_active)
        .map((store) => {
          const dist =
            store.latitude != null && store.longitude != null
              ? distanceKm(
                  region.latitude,
                  region.longitude,
                  store.latitude,
                  store.longitude,
                )
              : 0;
          return {
            store,
            distanceKm: dist,
            scope: "national" as const,
          };
        });
    case "same_city":
      return matches.filter((entry) => entry.scope === "same_city");
    case "nearby":
      return matches.filter((entry) => entry.scope === "nearby");
    case "within_radius":
    default:
      return matches;
  }
}

export function filterStoreIdsByRegionScope(
  stores: RegionalStoreGeo[],
  region: UserOfferRegion,
  scope: OfferRegionScope,
): string[] {
  return filterStoresByRegionScope(stores, region, scope).map(
    (entry) => entry.store.id,
  );
}
