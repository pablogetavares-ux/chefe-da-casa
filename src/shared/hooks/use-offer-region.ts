"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import type {
  OfferRegionScope,
  UserOfferRegion,
} from "@/modules/offers/region/types";
import {
  getDefaultStoredRegion,
  getStoredOfferRegion,
  OFFER_REGION_STORAGE_KEY,
  setStoredOfferRegion,
  storedToUserRegion,
  subscribeOfferRegion,
  type StoredOfferRegion,
} from "@/modules/offers/utils/region-preference";
import { useOfferRegionConfig } from "@/shared/hooks/api/offers";

type UseOfferRegionPreferenceOptions = {
  /** Quando false, evita GET /offers/region (ex.: página de ofertas já traz `region` na lista). */
  syncServerConfig?: boolean;
};

/**
 * Preferência regional do usuário (localStorage + sync opcional com API).
 * SSR-safe via useSyncExternalStore.
 */
export function useOfferRegionPreference(
  options: UseOfferRegionPreferenceOptions = {},
) {
  const syncServerConfig = options.syncServerConfig !== false;
  const region = useSyncExternalStore(
    subscribeOfferRegion,
    getStoredOfferRegion,
    getDefaultStoredRegion,
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { data: serverConfig } = useOfferRegionConfig(
    syncServerConfig && hydrated,
  );

  const serverCity = serverConfig?.region?.city;
  const serverState = serverConfig?.region?.state;
  const serverRadiusKm = serverConfig?.region?.radiusKm;

  useEffect(() => {
    if (!hydrated) return;
    if (localStorage.getItem(OFFER_REGION_STORAGE_KEY)) return;
    if (!serverCity || !serverState || !serverRadiusKm) return;

    setStoredOfferRegion({
      city: serverCity,
      state: serverState,
      radiusKm: serverRadiusKm,
      scope: "within_radius",
    });
  }, [hydrated, serverCity, serverState, serverRadiusKm]);

  const applyApiRegion = useCallback((apiRegion: UserOfferRegion) => {
    const current = getStoredOfferRegion();
    setStoredOfferRegion({
      city: apiRegion.city,
      state: apiRegion.state,
      radiusKm: apiRegion.radiusKm,
      scope: current.scope,
    });
  }, []);

  const setRegion = useCallback((next: StoredOfferRegion) => {
    setStoredOfferRegion(next);
  }, []);

  const patchRegion = useCallback((patch: Partial<StoredOfferRegion>) => {
    const current = getStoredOfferRegion();
    setStoredOfferRegion({ ...current, ...patch });
  }, []);

  const setCity = useCallback(
    (city: string) => {
      patchRegion({ city });
    },
    [patchRegion],
  );

  return {
    region,
    userRegion: storedToUserRegion(region),
    scope: region.scope,
    hydrated,
    setRegion,
    setCity,
    patchRegion,
    applyApiRegion,
    setScope: (scope: OfferRegionScope) => patchRegion({ scope }),
  };
}
