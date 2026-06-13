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

let cachedDefaultRegion: StoredOfferRegion | null = null;
/** Fingerprint do último read (raw JSON, legacy city ou default). */
let cachedRegionFingerprint: string | undefined;
let cachedRegionSnapshot: StoredOfferRegion | null = null;

function invalidateRegionSnapshotCache() {
  cachedRegionFingerprint = undefined;
  cachedRegionSnapshot = null;
}

function parseStoredRegion(
  raw: string | null,
  legacyCity: string | null,
): StoredOfferRegion {
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

export function getDefaultStoredRegion(): StoredOfferRegion {
  if (!cachedDefaultRegion) {
    const base = buildUserOfferRegion({});
    cachedDefaultRegion = {
      city: base.city,
      state: base.state,
      radiusKm: base.radiusKm,
      scope: DEFAULT_SCOPE,
    };
  }
  return cachedDefaultRegion;
}

export function storedToUserRegion(stored: StoredOfferRegion): UserOfferRegion {
  return buildUserOfferRegion({
    city: stored.city,
    state: stored.state,
    radiusKm: stored.radiusKm,
  });
}

/** Snapshot estável para `useSyncExternalStore` (mesma referência se dados iguais). */
export function getStoredOfferRegion(): StoredOfferRegion {
  if (typeof window === "undefined") return getDefaultStoredRegion();

  const raw = localStorage.getItem(OFFER_REGION_STORAGE_KEY);
  const legacyCity = raw ? null : localStorage.getItem(OFFER_CITY_STORAGE_KEY);
  const fingerprint =
    raw ?? (legacyCity ? `legacy:${legacyCity}` : "__default__");

  if (
    cachedRegionFingerprint === fingerprint &&
    cachedRegionSnapshot !== null
  ) {
    return cachedRegionSnapshot;
  }

  cachedRegionFingerprint = fingerprint;
  cachedRegionSnapshot = parseStoredRegion(raw, legacyCity);
  return cachedRegionSnapshot;
}

export function setStoredOfferRegion(region: StoredOfferRegion) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(region);
  localStorage.setItem(OFFER_REGION_STORAGE_KEY, raw);
  localStorage.setItem(OFFER_CITY_STORAGE_KEY, region.city);
  cachedRegionFingerprint = raw;
  cachedRegionSnapshot = { ...region };
  notifyOfferRegionChange();
}

const regionListeners = new Set<() => void>();

/** Notifica hooks `useSyncExternalStore` após alteração local da região. */
export function notifyOfferRegionChange() {
  for (const listener of regionListeners) {
    listener();
  }
}

/** Inscrição para preferência regional (localStorage + storage events). */
export function subscribeOfferRegion(callback: () => void): () => void {
  regionListeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === OFFER_REGION_STORAGE_KEY ||
      event.key === OFFER_CITY_STORAGE_KEY
    ) {
      invalidateRegionSnapshotCache();
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    regionListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}
