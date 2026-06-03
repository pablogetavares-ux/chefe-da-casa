"use client";

import { useCallback, useEffect, useState } from "react";

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
  type StoredOfferRegion,
} from "@/modules/offers/utils/region-preference";
import { useOfferRegionConfig } from "@/shared/hooks/api/offers";

type UseOfferRegionPreferenceOptions = {
  /** Quando false, evita GET /offers/region (ex.: página de ofertas já traz `region` na lista). */
  syncServerConfig?: boolean;
};

function readInitialRegion(): StoredOfferRegion {
  if (typeof window === "undefined") return getDefaultStoredRegion();
  return getStoredOfferRegion();
}

/**
 * Preferência regional do usuário (localStorage + sync opcional com API).
 */
export function useOfferRegionPreference(
  options: UseOfferRegionPreferenceOptions = {},
) {
  const syncServerConfig = options.syncServerConfig !== false;
  const [region, setRegionState] =
    useState<StoredOfferRegion>(readInitialRegion);

  const { data: serverConfig } = useOfferRegionConfig(syncServerConfig);

  const serverCity = serverConfig?.region?.city;
  const serverState = serverConfig?.region?.state;
  const serverRadiusKm = serverConfig?.region?.radiusKm;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(OFFER_REGION_STORAGE_KEY)) return;
    if (!serverCity || !serverState || !serverRadiusKm) return;

    const next: StoredOfferRegion = {
      city: serverCity,
      state: serverState,
      radiusKm: serverRadiusKm,
      scope: "within_radius",
    };
    setStoredOfferRegion(next);
    // Sync preferência do servidor quando ainda não há escolha local salva.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration pós-fetch
    setRegionState((prev) =>
      prev.city === next.city &&
      prev.state === next.state &&
      prev.radiusKm === next.radiusKm
        ? prev
        : next,
    );
  }, [serverCity, serverState, serverRadiusKm]);

  const applyApiRegion = useCallback((apiRegion: UserOfferRegion) => {
    setRegionState((prev) => {
      const next: StoredOfferRegion = {
        city: apiRegion.city,
        state: apiRegion.state,
        radiusKm: apiRegion.radiusKm,
        scope: prev.scope,
      };
      setStoredOfferRegion(next);
      return next;
    });
  }, []);

  const setRegion = useCallback((next: StoredOfferRegion) => {
    setRegionState(next);
    setStoredOfferRegion(next);
  }, []);

  const patchRegion = useCallback((patch: Partial<StoredOfferRegion>) => {
    setRegionState((prev) => {
      const next = { ...prev, ...patch };
      setStoredOfferRegion(next);
      return next;
    });
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
    setRegion,
    setCity,
    patchRegion,
    applyApiRegion,
    setScope: (scope: OfferRegionScope) => patchRegion({ scope }),
  };
}
