"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Percent } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferCard } from "@/modules/offers/components/offer-card";
import { OffersFiltersBar } from "@/modules/offers/components/offers-filters-bar";
import { OffersRegionBar } from "@/modules/offers/components/offers-region-bar";
import {
  OFFER_CATEGORY_LABELS,
  type OfferCategory,
} from "@/modules/offers/types";
import { AsyncPanel } from "@/shared/components/async-panel";
import {
  useAddOfferToShoppingList,
  useOffers,
  useToggleOfferFavorite,
  useUpdateOfferRegion,
} from "@/shared/hooks/api/offers";
import type { StoredOfferRegion } from "@/modules/offers/utils/region-preference";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

export function OffersPanel() {
  const {
    region,
    patchRegion: patchRegionBase,
    applyApiRegion,
  } = useOfferRegionPreference({
    syncServerConfig: true,
  });
  const syncedApiRegionRef = useRef(false);
  const regionRef = useRef(region);

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [category, setCategory] = useState<OfferCategory | null>(null);
  const [q, setQ] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filters = useMemo(
    () => ({
      city: region.city,
      state: region.state,
      radiusKm: region.radiusKm,
      scope: region.scope,
      category,
      q,
      favoritesOnly,
    }),
    [region, category, q, favoritesOnly],
  );

  const { data, isLoading, error } = useOffers(filters);

  useEffect(() => {
    if (!data?.region || syncedApiRegionRef.current) return;
    applyApiRegion(data.region);
    syncedApiRegionRef.current = true;
  }, [data?.region, applyApiRegion]);
  const updateRegion = useUpdateOfferRegion();
  const toggleFavorite = useToggleOfferFavorite();
  const addToShopping = useAddOfferToShoppingList();

  const schedulePersistRegion = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const current = regionRef.current;
      updateRegion.mutate({
        city: current.city,
        state: current.state,
        radiusKm: current.radiusKm,
      });
    }, 700);
  }, [updateRegion]);

  const patchRegion = useCallback(
    (patch: Partial<StoredOfferRegion>) => {
      patchRegionBase(patch);
      if (
        patch.city !== undefined ||
        patch.state !== undefined ||
        patch.radiusKm !== undefined
      ) {
        schedulePersistRegion();
      }
    },
    [patchRegionBase, schedulePersistRegion],
  );

  useEffect(
    () => () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    },
    [],
  );

  const categories = data?.categories ?? [];

  const emptyOffersCopy = useMemo(() => {
    if (category) {
      return {
        title: `Nenhuma oferta em ${OFFER_CATEGORY_LABELS[category]}`,
        description:
          "Não há promoções ativas nessa categoria na sua região. Toque em Todas ou escolha Laticínios, Mercearia, Frutas e verduras ou Carnes.",
      };
    }
    if (favoritesOnly) {
      return {
        title: "Nenhuma favorita na região",
        description:
          "Favorite ofertas nos cards (ícone de coração) para vê-las aqui.",
      };
    }
    if (q.trim()) {
      return {
        title: "Nenhum resultado na busca",
        description: `Não encontramos “${q.trim()}” na região atual. Tente outro termo ou limpe a busca.`,
      };
    }
    return {
      title: "Nenhuma oferta nesta região",
      description:
        "Ajuste o raio, troque o escopo (Dentro do raio / Todo o Brasil) ou escolha outra cidade.",
    };
  }, [category, favoritesOnly, q]);

  return (
    <div className="space-y-6">
      <OffersRegionBar
        region={region}
        regionCities={data?.regionCities}
        onChange={patchRegion}
        onPersist={() =>
          updateRegion.mutate({
            city: region.city,
            state: region.state,
            radiusKm: region.radiusKm,
          })
        }
        persistPending={updateRegion.isPending}
      />

      <OffersFiltersBar
        categories={categories}
        category={category}
        q={q}
        favoritesOnly={favoritesOnly}
        onCategoryChange={setCategory}
        onQueryChange={setQ}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      <AsyncPanel
        isLoading={isLoading}
        error={error}
        loadingFallback={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-80 rounded-2xl" />
            ))}
          </div>
        }
      >
        {data?.offers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.offers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                priority={index < 3}
                favoritePending={toggleFavorite.isPending}
                shoppingPending={addToShopping.isPending}
                onToggleFavorite={(item) =>
                  toggleFavorite.mutate({
                    offerId: item.id,
                    isFavorite: Boolean(item.isFavorite),
                  })
                }
                onAddToShopping={(item) => addToShopping.mutate(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Percent}
            title={emptyOffersCopy.title}
            description={emptyOffersCopy.description}
          />
        )}
      </AsyncPanel>
    </div>
  );
}
